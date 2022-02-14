class HEvent {
  constructor(name, target, VNode) {
    this.name = name;
    this.target = target;
    this.node = VNode;
  }
}


function isSpace(str) {
  return (!str || str.length === 0 || /^\s*$/.test(str))
}

String.isSpace = isSpace;

String.prototype.__defineGetter__("isSpace", function() {return (!this || this.length === 0 || /^\s*$/.test(this))});

let nodes = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "menu",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "slot",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
];

class VNode {
  #tag;
  #children;
  #props;
  #text;
  #events;
  #vdom = undefined;
  constructor(tag, children, props = {}, text = "", allowCustomTags=true) {
    if ((nodes.indexOf(tag) == -1) && !allowCustomTags)
      throw new Error("Tag " + tag + " isn't a valid HTML node");
    if (!children) children = [];
    if (!Array.isArray(children)) children = [children];
    this.#tag = tag;
    this.#children = children;
    this.#props = props;
    this.#text = text;
  }

  set vdom(val) {
    this.#children.forEach((el) => (el.vdom = val));
    this.#vdom = val;
  }

  callEvent(eventName, args = []) {
    if (eventName == "hyperappUpdate") {
      this.#children.forEach((el) => {
        ["hyperappUpdate", "update", "hyperUpdate"].forEach((e) =>
          el.callEvent(e, [this, Date.now()])
        );
      });
    }
    let e = new HEvent(eventName, args, this);
    if (this.#props.events && this.#props.events[eventName])
      this.#props.events[eventName](e, Date.now(), this);
  }

  addChildren(children) {
    this.#children.push(children);
    children.vdom = this.#vdom;
  }

  removeChildren(q) {
    index = undefined;
    this.children.forEach((el, i) => {
      if (q(el)) index = i;
    });
    if (index != undefined)
      this.#children = this.#children.filter((_, i) => i != index);
    return index != undefined;
  }

  render() {
    if (!this.#vdom) return undefined;
    let propVals = Object.values(this.#props);
    let propKeys = Object.keys(this.#props);
    propKeys.map((str) => (str.startsWith("on") ? str : ""));
    propKeys.forEach((el) => {
      delete this.#props[el];
    });
    propKeys.map((str)=>str.replace("on", ""))
    propKeys.forEach((el, i) => {el.isSpace?this.#props.events[el] = propVals[i]:null});
    let txt = this.text;
    let el = document.createElement(this.#tag);
    el.textContent = txt != undefined ? txt : "";
    if (this.#props.classes)
      this.#props.classes.forEach((cls) => el.classList.add(cls));
    let clonedProps = {};
    Object.keys.forEach((prop, i) => {
      if (prop != "events")
        el.setAttribute(prop, Object.values(this.#props)[i]);
    });
    el.setAttribute("hyperapp_element", "");
    this.#children.forEach((child) => el.append(child.render()));
    if (this.#props.events) {
      for (let e in this.#props.events) {
        el.addEventListener(e, (...args) => {
          this.callEvent(e, args);
          this.#vdom.render();
        });
      }
    }
    return el;
  }

  set text(val) {
    this.#text = val;
  }

  get text() {
    return this.#text;
  }

  get children() {
    return this.#children;
  }

  set children(val) {
    this.#children = val;
  }
}

class VDOM {
  #state;
  #parentElement;
  #elements;
  #subscription = [];
  #firstRender = true;
  constructor(parentElement, elements, eventSubscriptions, state) {
    this.#parentElement = parentElement;
    if (typeof eventSubscriptions == "undefined") eventSubscriptions = [];
    this.#subscription = eventSubscriptions;
    if (typeof elements == undefined) elements = () => [];
    this.#elements = elements;
    let gen_els = this.#elements();
    if (!Array.isArray(gen_els)) gen_els = [gen_els];
    gen_els.forEach((el) => (el.vdom = this));
    this.#state = state;
  }

  render() {
    let old_rnodes = this.#parentElement.querySelectorAll(
      "#hyperapp_rendernode"
    );
    for (let orn in old_rnodes) {
      if (!isNaN(Number(orn))) this.#parentElement.removeChild(old_rnodes[orn]);
    }
    if (this.#firstRender) {
      this.#subscription.forEach((e) => {
        addEvent(this, window, e);
      });
      this.#firstRender = false;
    }
    this.#subscription
      .find(
        (el) =>
          ["hyperappUpdate", "update", "hyperUpdate"].indexOf(el.name) != -1
      )
      ?.invoke(this, Date.now());
    let gen_els = this.#elements(this.#state);
    if (!Array.isArray(gen_els)) gen_els = [gen_els];
    gen_els.forEach((el) => {
      el.vdom = this;
      ["hyperappUpdate", "update", "hyperUpdate"].forEach((e) =>
        el.callEvent(e, [this, Date.now()])
      );
    });
    let renderNode = document.createElement("div");
    renderNode.id = "hyperapp_rendernode";
    this.#parentElement.appendChild(renderNode);
    gen_els.forEach((el) => {
      renderNode.appendChild(el.render());
    });
  }

  get children() {
    return this.#elements;
  }

  get parentElement() {
    return this.#parentElement;
  }

  set children(val) {
    this.#elements = val;
  }

  set parentElement(val) {
    this.#parentElement = val;
  }
}

function event(name, func) {
  return { name: name, invoke: func };
}

const h = (tag, children, props = {}, text = "") =>
  new VNode(tag, children, props, text);

function addEvent(vdom, el, e, vnode = undefined) {
  print(vdom, el, e, vnode);
  addEventListener(e.name, (...args) => {
    e.invoke(new HEvent(e, args, vnode));
    vdom.render();
  });
}

function app(options) {
  let vdom = new VDOM(
    options.node || document.body,
    options.elements || [],
    options.subscriptions || [],
    options.init || {}
  );
  if (!options.dontRender) vdom.render();
  return vdom;
}

function routeApp(options) {
  options.dontRender = true;
  return app(options);
}

function route(routes) {
  if (
    /^((https{0,1}){0,1}(file){0,1}):\/{2,3}([a-zA-Z\.\-_]+(:[a-zA-Z\.\-_]+){0,1}@)*[a-zA-Z\.\-_]+(\/[a-zA-Z\.\-_]*)+([\?][=a-zA-Z\-._\+%]+(&[=a-zA-Z\-._\+%]+)*)*$/g.test(
      location.href
    )
  ) {
    let domain = location.href
      .replace(location.protocol + "//" + location.host, "")
      .match(/\/([a-zA-Z_\-.]+\/{0,1})*/)[0];
    routes.forEach((route) => {
      if (route.path == domain) route.app.render();
    });
  } else {
    throw new Error("Invalid Domain");
  }
}

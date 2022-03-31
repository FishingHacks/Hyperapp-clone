class HEvent {
  /**
   *
   * @param {string} name event name (from the EventListener specifications)
   * @param {Event} target the JS Event
   * @param {VNode} VNode the element
   */
  constructor(name, target, VNode) {
    this.name = name;
    this.target = target;
    this.node = VNode;
  }
}

/**
 * @param {string} str the String
 * @returns {boolean} if the string has only spaces or is empty
 */
function isSpace(str) {
  return !str || str.length === 0 || /^\s*$/.test(str);
}

String.isSpace = isSpace;

String.prototype.__defineGetter__("isSpace", function () {
  return !this || this.length === 0 || /^\s*$/.test(this);
});

class VNode {
  #tag;
  #children;
  #props;
  #text;
  #events;
  #vdom = undefined;
  /**
   *
   * @param {string} tag The HTMLElement tag
   * @param {{[name: string]: unknown}} props the element properties
   * @param {...VNode|string} children the children
   */
  constructor(tag, props = {}, ...children) {
    if (!children) children = [];
    if (!Array.isArray(children)) children = [children];
    this.#tag = tag;
    this.#children = children||[];
    this.#props = props||{};
  }

  /**
   * Oh, c'mon, why are you here again! Get out, GET OUT!
   * - Maybe Gordon Ramsey
   */
  set vdom(val) {
    this.#children.forEach((el) => (el instanceof VNode)?(el.vdom = val):null);
    this.#vdom = val;
  }

  /**
   * What the **** guys, why, why? Tell me, WHY?
   *    Fishi won't be happy, if you use this :<
   */
  callEvent(eventName, args = []) {
    if (eventName == "hyperappUpdate") {
      this.#children.forEach((el) => {
        if(!(el instanceof VNode)) return;
        ["hyperappUpdate", "update", "hyperUpdate"].forEach((e) =>
          el.callEvent(e, [this, Date.now()])
        );
      });
    }
    let e = new HEvent(eventName, args, this);
    if (this.#props.events && this.#props.events[eventName])
      this.#props.events[eventName](e, Date.now(), this);
    if (this.#props["on" + eventName])
      this.#props["on" + eventName](e, Date.now(), this);
  }

  /**
   * Ey, who called this? This is perfect called!
   * @param {VNode} children
   */
  addChildren(children) {
    this.#children.push(children);
    children.vdom = this.#vdom;
  }

  /**
   * Not even I know, what you could do with this. Good luck!
   * @param {(el: VNode)=>boolean} q the query
   * @returns {boolean} if the action was successful
   */
  removeChildren(q) {
    index = undefined;
    this.children.forEach((el, i) => {
      if (q(el)) index = i;
    });
    if (index != undefined)
      this.#children = this.#children.filter((_, i) => i != index);
    return index != undefined;
  }

  /**
   * What is wrong?
   * I forgot to call this, Chef!
   * @returns {void} a big nothing
   */
  render() {
    if (!this.#vdom) return undefined;
    let propVals = Object.values(this.#props);
    let propKeys = Object.keys(this.#props);
    if(!this.#props.events) this.#props.events = {}
    propKeys.forEach((el, i) => {
      el.startsWith("on") ? (this.#props.events[el.substring(2)] = propVals[i]) : null;
    });
    propKeys = propKeys.map(el=>el.startsWith("on")?"":el);
    let txt = this.text;
    let el = document.createElement(this.#tag);
    el.textContent = txt != undefined ? txt : "";
    let clonedProps = {};
    Object.keys(clonedProps).forEach((prop, i) => {
      if (prop != "events")
        el.setAttribute(prop, Object.values(this.#props)[i]);
    });
    propKeys.forEach(prop=>{
      if(!prop || prop=="events") return;
      el.setAttribute(prop, this.#props[prop]);
    })
    el.setAttribute("hyperapp_element", "");
    this.#children.forEach((child) => el.append(child instanceof VNode?child.render():child));
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

  /**
   * Good choice! That fit's really well
   * @param {string} val the new text
   */
  set text(val) {
    this.#text = val;
  }

  /**
   * loading...
   * @returns {string} the text
   */
  get text() {
    return this.#text;
  }

  /**
   * loading...
   * @returns {Array<VNode>} the children
   */
  get children() {
    return this.#children;
  }

  /**
   * loading...
   * @param {Array<VNode>} val the new children
   */
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
  /**
   * You have 45 minutes, go!
   * @param {HTMLElement} parentElement the parent element, normally the body
   * @param {(state: {[name: string]: unknown})=>Array<VNode>} elements the function to retrieve the site elements
   * @param {Array<{
   *  name: string;
   *  invoke: ()=>void
   * }>} eventSubscriptions the event Subscriptions
   * @param {{[name: string]: unknown}} state the state
   */
  constructor(parentElement, elements, eventSubscriptions, state) {
    this.#parentElement = parentElement;
    if (typeof eventSubscriptions == "undefined") eventSubscriptions = [];
    this.#subscription = eventSubscriptions;
    if (typeof elements == undefined) elements = () => [];
    this.#elements = elements;
    let gen_els = this.#elements(state);
    if (!Array.isArray(gen_els)) gen_els = [gen_els];
    gen_els.forEach((el) => (el.vdom = this));
    this.#state = state;
  }

  /**
   * Now, all of you, piss off
   * I don't think, you should call this, normally it will be called by the framework
   */
  async render() {
    let evt = new CustomEvent("hyerapprender", {cancelable: true});
    if(!window.dispatchEvent(evt)) return;
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

  /**
   * loading...
   * @returns {Array<VNode>} the up-to-date (not specifically rendered) elements
   */
  get children() {
    return this.#elements(this.#state);
  }

  /**
   * loading...
   * @return {HTMLElement} the parent element, normally the body
   */
  get parentElement() {
    return this.#parentElement;
  }

  /**
   * loading...
   * @param {(state: {[name: string]: unknown})=>Array<VNode>} val the new children;
   */
  set children(val) {
    this.#elements = val;
  }

  /**
   * loading...
   * @param {HTMLElement} val the new parent element (why?)
   */
  set parentElement(val) {
    this.#parentElement = val;
  }
}

/**
 * *screaming*
 * @param {string} name the eventname (EventListener specifications)
 * @param {(e: HEvent)=>void} func the event
 * @returns {{name: string; invoke: (e: HEvent)=>void;}} the event object
 */
function event(name, func) {
  return { name: name, invoke: func };
}

/**
 * loading...
 * Create an Element
 *
 * @param {string} tag the tag
 * @param {{[name: string]: unknown}} props the properties
 * @param {...VNode|string} children the Children
 * @returns {VNode}
 */
const h = (tag, props = {}, ...children) =>
  new VNode(tag, props, ...children);

/**
 * Eyy, eyy, you let me and Jean Phillipe, by not properly making food.
 * apologise to Jean phillipe
 *
 * @param {VDOM} vdom
 * @param {VNode} el
 * @param {{name: string, invoke: (HEvent)=void}} e
 * @param {VNode} vnode
 */
function addEvent(vdom, el, e, vnode = undefined) {
  print(vdom, el, e, vnode);
  addEventListener(e.name, (...args) => {
    e.invoke(new HEvent(e, args, vnode));
    vdom.render();
  });
}

/**
 * loading...
 * @param {import("./type").vdomoptions} options the options, what else?
 * @returns {VDOM} the virtual dom
 */
function app(options) {
  let vdom = new VDOM(
    options.node || document.body,
    options.elements || ((state) => []),
    options.subscriptions || [],
    options.init || {}
  );
  if (!options.dontRender) vdom.render();
  globalThis.vdom = vdom;
  return vdom;
}

/**
 * loading...
 * @param {import("./type").vdomoptions} options
 * @returns {VDOM} the vdom to put into your route Object
 */
function routeApp(options) {
  options.dontRender = true;
  return app(options);
}
/**
 * loading...
 * @param {import("./type").routeArray} routes the routes of your Application
 */
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

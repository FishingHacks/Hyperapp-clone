/**
 * @author FishingHacks
 * Please only use with my hyperapp clone, so that i can support 100% compability, for the original, there is already a file of this type
 */

const p = (children, props = {}, text = "") => h("p", children, props, text);
const a = (children, props = {}, text = "") => h("a", children, props, text);
const div = (children, props = {}, text = "")=>h("div", children, props, text);
const h1 = (children, props = {}, text = "") => h("h1", children, props, text);
const h2 = (children, props = {}, text = "")=>h("h2", children, props, text);
const h3 = (children, props = {}, text = "")=>h("h3", children, props, text);
const h4 = (children, props = {}, text = "")=>h("h4", children, props, text);
const h5 = (children, props = {}, text = "") => h("h5", children, props, text);
const h6 = (children, props = {}, text = "") => h("h6", children, props, text);
const h = (heading, children, props = {}, text = "") => h("h"+heading, children, props, text);
const code = (children, props = {}, text = "") => h("code", children, props, text);
const html = (children, props = {}, text = "") => h("html", children, props, text);
const head = (children, props = {}, text = "")=>h("head", children, props, text);
const body = (children, props = {}, text = "") => h("body", children, props, text);
const script = (children, props = {}, text = "") => h("script", children, props, text);
const style = (children, props = {}, text = "")=>h("style", children, props, text);
const title = (children, props = {}, text = "") => h("title", children, props, text);
const br = (children, props = {}, text = "") => h("br", children, props, text);
const hr = (children, props = {}, text = "") => h("hr", children, props, text);
const dl = (children, props = {}, text = "") => h("dl", children, props, text);
const dt = (children, props = {}, text = "") => h("dt", children, props, text);
const dd = (children, props = {}, text = "") => h("dd", children, props, text);
const img = (children, props = {}, text = "") => h("img", children, props, text);
const b = (children, props = {}, text = "") => h("b", children, props, text);
const i = (children, props = {}, text = "") => h("i", children, props, text);
const table = (children, props = {}, text = "") => h("table", children, props, text);
const tr = (children, props = {}, text = "") => h("tr", children, props, text);
const td = (children, props = {}, text = "") => h("td", children, props, text);
const ul = (children, props = {}, text = "") => h("ul", children, props, text);
const li = (children, props = {}, text = "") => h("li", children, props, text);
const font = (children, props = {}, text = "") => h("font", children, props, text);
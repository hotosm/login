import {
  requestInclude
} from "./chunk.XNEONNEJ.js";
import {
  WaLoadEvent
} from "./chunk.YAKPUWOF.js";
import {
  watch
} from "./chunk.2NT6DI7B.js";
import {
  WebAwesomeElement
} from "./chunk.ETAGLSDL.js";
import {
  __decorateClass
} from "./chunk.RBKXYBVR.js";

// src/components/include/include.ts
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";

// src/events/include-error.ts
var WaIncludeErrorEvent = class extends Event {
  constructor(detail) {
    super("wa-include-error", { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
};

// src/components/include/include.css
var include_default = ":host {\n  display: block;\n}\n";

// src/components/include/include.ts
var WaInclude = class extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.mode = "cors";
    this.allowScripts = false;
  }
  executeScript(script) {
    const newScript = document.createElement("script");
    [...script.attributes].forEach((attr) => newScript.setAttribute(attr.name, attr.value));
    newScript.textContent = script.textContent;
    script.parentNode.replaceChild(newScript, script);
  }
  async handleSrcChange() {
    try {
      const src = this.src;
      const file = await requestInclude(src, this.mode);
      if (src !== this.src) {
        return;
      }
      if (!file.ok) {
        this.dispatchEvent(new WaIncludeErrorEvent({ status: file.status }));
        return;
      }
      this.innerHTML = file.html;
      if (this.allowScripts) {
        [...this.querySelectorAll("script")].forEach((script) => this.executeScript(script));
      }
      this.dispatchEvent(new WaLoadEvent());
    } catch {
      this.dispatchEvent(new WaIncludeErrorEvent({ status: -1 }));
    }
  }
  render() {
    return html`<slot></slot>`;
  }
};
WaInclude.css = include_default;
__decorateClass([
  property()
], WaInclude.prototype, "src", 2);
__decorateClass([
  property()
], WaInclude.prototype, "mode", 2);
__decorateClass([
  property({ attribute: "allow-scripts", type: Boolean })
], WaInclude.prototype, "allowScripts", 2);
__decorateClass([
  watch("src")
], WaInclude.prototype, "handleSrcChange", 1);
WaInclude = __decorateClass([
  customElement("wa-include")
], WaInclude);

export {
  WaInclude
};

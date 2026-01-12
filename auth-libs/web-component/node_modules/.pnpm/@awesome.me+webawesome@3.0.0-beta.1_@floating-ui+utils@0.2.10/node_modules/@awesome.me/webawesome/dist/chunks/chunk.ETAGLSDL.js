import {
  __decorateClass,
  __privateAdd,
  __privateGet,
  __privateSet
} from "./chunk.RBKXYBVR.js";

// src/internal/webawesome-element.ts
import { LitElement, isServer, unsafeCSS } from "lit";
import { property } from "lit/decorators.js";

// src/styles/component/host.css
var host_default = ":host {\n  box-sizing: border-box !important;\n}\n\n:host *,\n:host *::before,\n:host *::after {\n  box-sizing: inherit !important;\n}\n\n[hidden] {\n  display: none !important;\n}\n";

// src/internal/webawesome-element.ts
var _hasRecordedInitialProperties;
var WebAwesomeElement = class extends LitElement {
  constructor() {
    super();
    __privateAdd(this, _hasRecordedInitialProperties, false);
    this.initialReflectedProperties = /* @__PURE__ */ new Map();
    this.didSSR = isServer || Boolean(this.shadowRoot);
    /**
     * Methods for setting and checking custom states.
     */
    this.customStates = {
      /** Adds or removes the specified custom state. */
      set: (customState, active) => {
        if (!Boolean(this.internals?.states)) return;
        if (active) {
          this.internals.states.add(customState);
        } else {
          this.internals.states.delete(customState);
        }
      },
      /** Determines whether or not the element currently has the specified state. */
      has: (customState) => {
        if (!Boolean(this.internals?.states)) return false;
        return this.internals.states.has(customState);
      }
    };
    try {
      this.internals = this.attachInternals();
    } catch {
      console.error("Element internals are not supported in your browser. Consider using a polyfill");
    }
    this.customStates.set("wa-defined", true);
    let Self = this.constructor;
    for (let [property2, spec] of Self.elementProperties) {
      if (spec.default === "inherit" && spec.initial !== void 0 && typeof property2 === "string") {
        this.customStates.set(`initial-${property2}-${spec.initial}`, true);
      }
    }
  }
  /**
   * Override the default styles property to fetch and convert string CSS files. Components can override this behavior
   * by setting their own `static styles = []` property.
   */
  static get styles() {
    const styles = Array.isArray(this.css) ? this.css : this.css ? [this.css] : [];
    return [host_default, ...styles].map((style) => typeof style === "string" ? unsafeCSS(style) : style);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (!__privateGet(this, _hasRecordedInitialProperties)) {
      this.constructor.elementProperties.forEach(
        (obj, prop) => {
          if (obj.reflect && this[prop] != null) {
            this.initialReflectedProperties.set(prop, this[prop]);
          }
        }
      );
      __privateSet(this, _hasRecordedInitialProperties, true);
    }
    super.attributeChangedCallback(name, oldValue, newValue);
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    this.initialReflectedProperties.forEach((value, prop) => {
      if (changedProperties.has(prop) && this[prop] == null) {
        this[prop] = value;
      }
    });
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    if (this.didSSR) {
      this.shadowRoot?.querySelectorAll("slot").forEach((slotElement) => {
        slotElement.dispatchEvent(new Event("slotchange", { bubbles: true, composed: false, cancelable: false }));
      });
    }
  }
  update(changedProperties) {
    try {
      super.update(changedProperties);
    } catch (e) {
      if (this.didSSR && !this.hasUpdated) {
        const event = new Event("lit-hydration-error", { bubbles: true, composed: true, cancelable: false });
        event.error = e;
        this.dispatchEvent(event);
      }
      throw e;
    }
  }
  /**
   * Given a native event, this function cancels it and dispatches it again from the host element using the desired
   * event options.
   */
  relayNativeEvent(event, eventOptions) {
    event.stopImmediatePropagation();
    this.dispatchEvent(
      new event.constructor(event.type, {
        ...event,
        ...eventOptions
      })
    );
  }
};
_hasRecordedInitialProperties = new WeakMap();
__decorateClass([
  property()
], WebAwesomeElement.prototype, "dir", 2);
__decorateClass([
  property()
], WebAwesomeElement.prototype, "lang", 2);
__decorateClass([
  property({ type: Boolean, reflect: true, attribute: "did-ssr" })
], WebAwesomeElement.prototype, "didSSR", 2);

export {
  WebAwesomeElement
};

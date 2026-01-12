import {
  WebAwesomeElement
} from "./chunk.ETAGLSDL.js";
import {
  __decorateClass
} from "./chunk.RBKXYBVR.js";

// src/components/skeleton/skeleton.ts
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";

// src/components/skeleton/skeleton.css
var skeleton_default = ":host {\n  --color: var(--wa-color-neutral-fill-normal);\n  --sheen-color: color-mix(in oklab, var(--color), var(--wa-color-surface-raised));\n\n  display: flex;\n  position: relative;\n  width: 100%;\n  height: 100%;\n  min-height: 1rem;\n}\n\n.indicator {\n  flex: 1 1 auto;\n  background: var(--color);\n  border-radius: var(--wa-border-radius-pill);\n}\n\n:host([effect='sheen']) .indicator {\n  background: linear-gradient(270deg, var(--sheen-color), var(--color), var(--color), var(--sheen-color));\n  background-size: 400% 100%;\n  animation: sheen 8s ease-in-out infinite;\n}\n\n:host([effect='pulse']) .indicator {\n  animation: pulse 2s ease-in-out 0.5s infinite;\n}\n\n/* Forced colors mode */\n@media (forced-colors: active) {\n  :host {\n    --color: GrayText;\n  }\n}\n\n@keyframes sheen {\n  0% {\n    background-position: 200% 0;\n  }\n  to {\n    background-position: -200% 0;\n  }\n}\n\n@keyframes pulse {\n  0% {\n    opacity: 1;\n  }\n  50% {\n    opacity: 0.4;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n";

// src/components/skeleton/skeleton.ts
var WaSkeleton = class extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.effect = "none";
  }
  render() {
    return html` <div part="indicator" class="indicator"></div> `;
  }
};
WaSkeleton.css = skeleton_default;
__decorateClass([
  property({ reflect: true })
], WaSkeleton.prototype, "effect", 2);
WaSkeleton = __decorateClass([
  customElement("wa-skeleton")
], WaSkeleton);

export {
  WaSkeleton
};

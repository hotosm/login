import {
  watch
} from "./chunk.2NT6DI7B.js";
import {
  WebAwesomeElement
} from "./chunk.ETAGLSDL.js";
import {
  __decorateClass
} from "./chunk.RBKXYBVR.js";

// src/components/qr-code/qr-code.ts
import { html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

// src/components/qr-code/qr-code.css
var qr_code_default = ":host {\n  --size: 128px;\n  display: inline-block;\n}\n\n:host,\ncanvas {\n  max-width: var(--size);\n  max-height: var(--size);\n  width: var(--size);\n  height: var(--size);\n}\n";

// src/components/qr-code/qr-code.ts
var QrCreator;
var WaQrCode = class extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.value = "";
    this.label = "";
    this.size = 128;
    this.fill = "black";
    this.background = "white";
    this.radius = 0;
    this.errorCorrection = "H";
    this.generated = false;
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    if (this.hasUpdated) {
      this.generate();
    }
  }
  generate() {
    this.style.setProperty("--size", `${this.size}px`);
    if (!this.hasUpdated) {
      return;
    }
    if (!QrCreator) {
      import("qr-creator").then((mod) => {
        QrCreator = mod.default;
        this.generate();
      });
      return;
    }
    QrCreator.render(
      {
        text: this.value,
        radius: this.radius,
        ecLevel: this.errorCorrection,
        fill: this.fill,
        background: this.background,
        // We draw the canvas larger and scale its container down to avoid blurring on high-density displays
        size: this.size * 2
      },
      this.canvas
    );
    this.generated = true;
  }
  render() {
    return html`
      <canvas
        part="base"
        class="qr-code"
        role="img"
        aria-label=${this.label?.length > 0 ? this.label : this.value}
      ></canvas>
    `;
  }
};
WaQrCode.css = qr_code_default;
__decorateClass([
  query("canvas")
], WaQrCode.prototype, "canvas", 2);
__decorateClass([
  property()
], WaQrCode.prototype, "value", 2);
__decorateClass([
  property()
], WaQrCode.prototype, "label", 2);
__decorateClass([
  property({ type: Number })
], WaQrCode.prototype, "size", 2);
__decorateClass([
  property()
], WaQrCode.prototype, "fill", 2);
__decorateClass([
  property()
], WaQrCode.prototype, "background", 2);
__decorateClass([
  property({ type: Number })
], WaQrCode.prototype, "radius", 2);
__decorateClass([
  property({ attribute: "error-correction" })
], WaQrCode.prototype, "errorCorrection", 2);
__decorateClass([
  state()
], WaQrCode.prototype, "generated", 2);
__decorateClass([
  watch(["background", "errorCorrection", "fill", "radius", "size", "value"])
], WaQrCode.prototype, "generate", 1);
WaQrCode = __decorateClass([
  customElement("wa-qr-code")
], WaQrCode);

export {
  WaQrCode
};

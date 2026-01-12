import {
  WaIcon
} from "./chunk.SZUJSHFH.js";

// src/react/icon/index.ts
import { createComponent } from "@lit/react";
import * as React from "react";
import "@lit/react";
var tagName = "wa-icon";
var reactWrapper = createComponent({
  tagName,
  elementClass: WaIcon,
  react: React,
  events: {
    onWaLoad: "wa-load",
    onWaError: "wa-error"
  },
  displayName: "WaIcon"
});
var icon_default = reactWrapper;

export {
  icon_default
};

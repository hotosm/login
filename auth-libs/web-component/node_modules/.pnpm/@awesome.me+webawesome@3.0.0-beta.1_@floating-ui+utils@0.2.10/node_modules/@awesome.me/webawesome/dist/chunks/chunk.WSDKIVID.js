import {
  WaInclude
} from "./chunk.6PJTVY6U.js";

// src/react/include/index.ts
import { createComponent } from "@lit/react";
import * as React from "react";
import "@lit/react";
var tagName = "wa-include";
var reactWrapper = createComponent({
  tagName,
  elementClass: WaInclude,
  react: React,
  events: {
    onWaLoad: "wa-load",
    onWaError: "wa-error"
  },
  displayName: "WaInclude"
});
var include_default = reactWrapper;

export {
  include_default
};

import {
  WaAvatar
} from "./chunk.DM7MAELN.js";

// src/react/avatar/index.ts
import { createComponent } from "@lit/react";
import * as React from "react";
import "@lit/react";
var tagName = "wa-avatar";
var reactWrapper = createComponent({
  tagName,
  elementClass: WaAvatar,
  react: React,
  events: {
    onWaError: "wa-error"
  },
  displayName: "WaAvatar"
});
var avatar_default = reactWrapper;

export {
  avatar_default
};

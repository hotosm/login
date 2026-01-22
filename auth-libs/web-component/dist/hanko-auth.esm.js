/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const on = globalThis, Jn = on.ShadowRoot && (on.ShadyCSS === void 0 || on.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Qn = Symbol(), bo = /* @__PURE__ */ new WeakMap();
let oi = class {
  constructor(e, t, o) {
    if (this._$cssResult$ = !0, o !== Qn) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (Jn && e === void 0) {
      const o = t !== void 0 && t.length === 1;
      o && (e = bo.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), o && bo.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Ni = (n) => new oi(typeof n == "string" ? n : n + "", void 0, Qn), Ui = (n, ...e) => {
  const t = n.length === 1 ? n[0] : e.reduce((o, i, s) => o + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + n[s + 1], n[0]);
  return new oi(t, n, Qn);
}, Mi = (n, e) => {
  if (Jn) n.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const o = document.createElement("style"), i = on.litNonce;
    i !== void 0 && o.setAttribute("nonce", i), o.textContent = t.cssText, n.appendChild(o);
  }
}, ko = Jn ? (n) => n : (n) => n instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const o of e.cssRules) t += o.cssText;
  return Ni(t);
})(n) : n;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Hi, defineProperty: Ri, getOwnPropertyDescriptor: Wi, getOwnPropertyNames: zi, getOwnPropertySymbols: qi, getPrototypeOf: Fi } = Object, at = globalThis, wo = at.trustedTypes, Ki = wo ? wo.emptyScript : "", In = at.reactiveElementPolyfillSupport, Tt = (n, e) => n, mn = { toAttribute(n, e) {
  switch (e) {
    case Boolean:
      n = n ? Ki : null;
      break;
    case Object:
    case Array:
      n = n == null ? n : JSON.stringify(n);
  }
  return n;
}, fromAttribute(n, e) {
  let t = n;
  switch (e) {
    case Boolean:
      t = n !== null;
      break;
    case Number:
      t = n === null ? null : Number(n);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(n);
      } catch {
        t = null;
      }
  }
  return t;
} }, Gn = (n, e) => !Hi(n, e), xo = { attribute: !0, type: String, converter: mn, reflect: !1, useDefault: !1, hasChanged: Gn };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), at.litPropertyMetadata ?? (at.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let pt = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = xo) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const o = Symbol(), i = this.getPropertyDescriptor(e, o, t);
      i !== void 0 && Ri(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, t, o) {
    const { get: i, set: s } = Wi(this.prototype, e) ?? { get() {
      return this[t];
    }, set(a) {
      this[t] = a;
    } };
    return { get: i, set(a) {
      const c = i == null ? void 0 : i.call(this);
      s == null || s.call(this, a), this.requestUpdate(e, c, o);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? xo;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Tt("elementProperties"))) return;
    const e = Fi(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Tt("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Tt("properties"))) {
      const t = this.properties, o = [...zi(t), ...qi(t)];
      for (const i of o) this.createProperty(i, t[i]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [o, i] of t) this.elementProperties.set(o, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, o] of this.elementProperties) {
      const i = this._$Eu(t, o);
      i !== void 0 && this._$Eh.set(i, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const o = new Set(e.flat(1 / 0).reverse());
      for (const i of o) t.unshift(ko(i));
    } else e !== void 0 && t.push(ko(e));
    return t;
  }
  static _$Eu(e, t) {
    const o = t.attribute;
    return o === !1 ? void 0 : typeof o == "string" ? o : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var e;
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (e = this.constructor.l) == null || e.forEach((t) => t(this));
  }
  addController(e) {
    var t;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && ((t = e.hostConnected) == null || t.call(e));
  }
  removeController(e) {
    var t;
    (t = this._$EO) == null || t.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const o of t.keys()) this.hasOwnProperty(o) && (e.set(o, this[o]), delete this[o]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Mi(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((t) => {
      var o;
      return (o = t.hostConnected) == null ? void 0 : o.call(t);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((t) => {
      var o;
      return (o = t.hostDisconnected) == null ? void 0 : o.call(t);
    });
  }
  attributeChangedCallback(e, t, o) {
    this._$AK(e, o);
  }
  _$ET(e, t) {
    var s;
    const o = this.constructor.elementProperties.get(e), i = this.constructor._$Eu(e, o);
    if (i !== void 0 && o.reflect === !0) {
      const a = (((s = o.converter) == null ? void 0 : s.toAttribute) !== void 0 ? o.converter : mn).toAttribute(t, o.type);
      this._$Em = e, a == null ? this.removeAttribute(i) : this.setAttribute(i, a), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var s, a;
    const o = this.constructor, i = o._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const c = o.getPropertyOptions(i), d = typeof c.converter == "function" ? { fromAttribute: c.converter } : ((s = c.converter) == null ? void 0 : s.fromAttribute) !== void 0 ? c.converter : mn;
      this._$Em = i;
      const l = d.fromAttribute(t, c.type);
      this[i] = l ?? ((a = this._$Ej) == null ? void 0 : a.get(i)) ?? l, this._$Em = null;
    }
  }
  requestUpdate(e, t, o, i = !1, s) {
    var a;
    if (e !== void 0) {
      const c = this.constructor;
      if (i === !1 && (s = this[e]), o ?? (o = c.getPropertyOptions(e)), !((o.hasChanged ?? Gn)(s, t) || o.useDefault && o.reflect && s === ((a = this._$Ej) == null ? void 0 : a.get(e)) && !this.hasAttribute(c._$Eu(e, o)))) return;
      this.C(e, t, o);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: o, reflect: i, wrapped: s }, a) {
    o && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), s !== !0 || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || o || (t = void 0), this._$AL.set(e, t)), i === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var o;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [s, a] of this._$Ep) this[s] = a;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [s, a] of i) {
        const { wrapped: c } = a, d = this[s];
        c !== !0 || this._$AL.has(s) || d === void 0 || this.C(s, void 0, a, d);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), (o = this._$EO) == null || o.forEach((i) => {
        var s;
        return (s = i.hostUpdate) == null ? void 0 : s.call(i);
      }), this.update(t)) : this._$EM();
    } catch (i) {
      throw e = !1, this._$EM(), i;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var t;
    (t = this._$EO) == null || t.forEach((o) => {
      var i;
      return (i = o.hostUpdated) == null ? void 0 : i.call(o);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t) => this._$ET(t, this[t]))), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
pt.elementStyles = [], pt.shadowRootOptions = { mode: "open" }, pt[Tt("elementProperties")] = /* @__PURE__ */ new Map(), pt[Tt("finalized")] = /* @__PURE__ */ new Map(), In == null || In({ ReactiveElement: pt }), (at.reactiveElementVersions ?? (at.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Nt = globalThis, So = (n) => n, gn = Nt.trustedTypes, Co = gn ? gn.createPolicy("lit-html", { createHTML: (n) => n }) : void 0, ii = "$lit$", rt = `lit$${Math.random().toFixed(9).slice(2)}$`, si = "?" + rt, Bi = `<${si}>`, ht = document, Mt = () => ht.createComment(""), Ht = (n) => n === null || typeof n != "object" && typeof n != "function", Yn = Array.isArray, Vi = (n) => Yn(n) || typeof (n == null ? void 0 : n[Symbol.iterator]) == "function", jn = `[ 	
\f\r]`, yt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ao = /-->/g, Oo = />/g, ct = RegExp(`>|${jn}(?:([^\\s"'>=/]+)(${jn}*=${jn}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Po = /'/g, Eo = /"/g, ri = /^(?:script|style|textarea|title)$/i, Zi = (n) => (e, ...t) => ({ _$litType$: n, strings: e, values: t }), He = Zi(1), gt = Symbol.for("lit-noChange"), Te = Symbol.for("lit-nothing"), Io = /* @__PURE__ */ new WeakMap(), dt = ht.createTreeWalker(ht, 129);
function ai(n, e) {
  if (!Yn(n) || !n.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Co !== void 0 ? Co.createHTML(e) : e;
}
const Ji = (n, e) => {
  const t = n.length - 1, o = [];
  let i, s = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = yt;
  for (let c = 0; c < t; c++) {
    const d = n[c];
    let l, u, h = -1, g = 0;
    for (; g < d.length && (a.lastIndex = g, u = a.exec(d), u !== null); ) g = a.lastIndex, a === yt ? u[1] === "!--" ? a = Ao : u[1] !== void 0 ? a = Oo : u[2] !== void 0 ? (ri.test(u[2]) && (i = RegExp("</" + u[2], "g")), a = ct) : u[3] !== void 0 && (a = ct) : a === ct ? u[0] === ">" ? (a = i ?? yt, h = -1) : u[1] === void 0 ? h = -2 : (h = a.lastIndex - u[2].length, l = u[1], a = u[3] === void 0 ? ct : u[3] === '"' ? Eo : Po) : a === Eo || a === Po ? a = ct : a === Ao || a === Oo ? a = yt : (a = ct, i = void 0);
    const f = a === ct && n[c + 1].startsWith("/>") ? " " : "";
    s += a === yt ? d + Bi : h >= 0 ? (o.push(l), d.slice(0, h) + ii + d.slice(h) + rt + f) : d + rt + (h === -2 ? c : f);
  }
  return [ai(n, s + (n[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), o];
};
let Kn = class li {
  constructor({ strings: e, _$litType$: t }, o) {
    let i;
    this.parts = [];
    let s = 0, a = 0;
    const c = e.length - 1, d = this.parts, [l, u] = Ji(e, t);
    if (this.el = li.createElement(l, o), dt.currentNode = this.el.content, t === 2 || t === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (i = dt.nextNode()) !== null && d.length < c; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const h of i.getAttributeNames()) if (h.endsWith(ii)) {
          const g = u[a++], f = i.getAttribute(h).split(rt), S = /([.?@])?(.*)/.exec(g);
          d.push({ type: 1, index: s, name: S[2], strings: f, ctor: S[1] === "." ? Gi : S[1] === "?" ? Yi : S[1] === "@" ? Xi : bn }), i.removeAttribute(h);
        } else h.startsWith(rt) && (d.push({ type: 6, index: s }), i.removeAttribute(h));
        if (ri.test(i.tagName)) {
          const h = i.textContent.split(rt), g = h.length - 1;
          if (g > 0) {
            i.textContent = gn ? gn.emptyScript : "";
            for (let f = 0; f < g; f++) i.append(h[f], Mt()), dt.nextNode(), d.push({ type: 2, index: ++s });
            i.append(h[g], Mt());
          }
        }
      } else if (i.nodeType === 8) if (i.data === si) d.push({ type: 2, index: s });
      else {
        let h = -1;
        for (; (h = i.data.indexOf(rt, h + 1)) !== -1; ) d.push({ type: 7, index: s }), h += rt.length - 1;
      }
      s++;
    }
  }
  static createElement(e, t) {
    const o = ht.createElement("template");
    return o.innerHTML = e, o;
  }
};
function vt(n, e, t = n, o) {
  var a, c;
  if (e === gt) return e;
  let i = o !== void 0 ? (a = t._$Co) == null ? void 0 : a[o] : t._$Cl;
  const s = Ht(e) ? void 0 : e._$litDirective$;
  return (i == null ? void 0 : i.constructor) !== s && ((c = i == null ? void 0 : i._$AO) == null || c.call(i, !1), s === void 0 ? i = void 0 : (i = new s(n), i._$AT(n, t, o)), o !== void 0 ? (t._$Co ?? (t._$Co = []))[o] = i : t._$Cl = i), i !== void 0 && (e = vt(n, i._$AS(n, e.values), i, o)), e;
}
let Qi = class {
  constructor(e, t) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: t }, parts: o } = this._$AD, i = ((e == null ? void 0 : e.creationScope) ?? ht).importNode(t, !0);
    dt.currentNode = i;
    let s = dt.nextNode(), a = 0, c = 0, d = o[0];
    for (; d !== void 0; ) {
      if (a === d.index) {
        let l;
        d.type === 2 ? l = new Xn(s, s.nextSibling, this, e) : d.type === 1 ? l = new d.ctor(s, d.name, d.strings, this, e) : d.type === 6 && (l = new es(s, this, e)), this._$AV.push(l), d = o[++c];
      }
      a !== (d == null ? void 0 : d.index) && (s = dt.nextNode(), a++);
    }
    return dt.currentNode = ht, i;
  }
  p(e) {
    let t = 0;
    for (const o of this._$AV) o !== void 0 && (o.strings !== void 0 ? (o._$AI(e, o, t), t += o.strings.length - 2) : o._$AI(e[t])), t++;
  }
}, Xn = class ci {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, t, o, i) {
    this.type = 2, this._$AH = Te, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = o, this.options = i, this._$Cv = (i == null ? void 0 : i.isConnected) ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return t !== void 0 && (e == null ? void 0 : e.nodeType) === 11 && (e = t.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    e = vt(this, e, t), Ht(e) ? e === Te || e == null || e === "" ? (this._$AH !== Te && this._$AR(), this._$AH = Te) : e !== this._$AH && e !== gt && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Vi(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== Te && Ht(this._$AH) ? this._$AA.nextSibling.data = e : this.T(ht.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var s;
    const { values: t, _$litType$: o } = e, i = typeof o == "number" ? this._$AC(e) : (o.el === void 0 && (o.el = Kn.createElement(ai(o.h, o.h[0]), this.options)), o);
    if (((s = this._$AH) == null ? void 0 : s._$AD) === i) this._$AH.p(t);
    else {
      const a = new Qi(i, this), c = a.u(this.options);
      a.p(t), this.T(c), this._$AH = a;
    }
  }
  _$AC(e) {
    let t = Io.get(e.strings);
    return t === void 0 && Io.set(e.strings, t = new Kn(e)), t;
  }
  k(e) {
    Yn(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let o, i = 0;
    for (const s of e) i === t.length ? t.push(o = new ci(this.O(Mt()), this.O(Mt()), this, this.options)) : o = t[i], o._$AI(s), i++;
    i < t.length && (this._$AR(o && o._$AB.nextSibling, i), t.length = i);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var o;
    for ((o = this._$AP) == null ? void 0 : o.call(this, !1, !0, t); e !== this._$AB; ) {
      const i = So(e).nextSibling;
      So(e).remove(), e = i;
    }
  }
  setConnected(e) {
    var t;
    this._$AM === void 0 && (this._$Cv = e, (t = this._$AP) == null || t.call(this, e));
  }
}, bn = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, o, i, s) {
    this.type = 1, this._$AH = Te, this._$AN = void 0, this.element = e, this.name = t, this._$AM = i, this.options = s, o.length > 2 || o[0] !== "" || o[1] !== "" ? (this._$AH = Array(o.length - 1).fill(new String()), this.strings = o) : this._$AH = Te;
  }
  _$AI(e, t = this, o, i) {
    const s = this.strings;
    let a = !1;
    if (s === void 0) e = vt(this, e, t, 0), a = !Ht(e) || e !== this._$AH && e !== gt, a && (this._$AH = e);
    else {
      const c = e;
      let d, l;
      for (e = s[0], d = 0; d < s.length - 1; d++) l = vt(this, c[o + d], t, d), l === gt && (l = this._$AH[d]), a || (a = !Ht(l) || l !== this._$AH[d]), l === Te ? e = Te : e !== Te && (e += (l ?? "") + s[d + 1]), this._$AH[d] = l;
    }
    a && !i && this.j(e);
  }
  j(e) {
    e === Te ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}, Gi = class extends bn {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === Te ? void 0 : e;
  }
}, Yi = class extends bn {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== Te);
  }
}, Xi = class extends bn {
  constructor(e, t, o, i, s) {
    super(e, t, o, i, s), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = vt(this, e, t, 0) ?? Te) === gt) return;
    const o = this._$AH, i = e === Te && o !== Te || e.capture !== o.capture || e.once !== o.once || e.passive !== o.passive, s = e !== Te && (o === Te || i);
    i && this.element.removeEventListener(this.name, this, o), s && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}, es = class {
  constructor(e, t, o) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = o;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    vt(this, e);
  }
};
const Dn = Nt.litHtmlPolyfillSupport;
Dn == null || Dn(Kn, Xn), (Nt.litHtmlVersions ?? (Nt.litHtmlVersions = [])).push("3.3.2");
const ts = (n, e, t) => {
  const o = (t == null ? void 0 : t.renderBefore) ?? e;
  let i = o._$litPart$;
  if (i === void 0) {
    const s = (t == null ? void 0 : t.renderBefore) ?? null;
    o._$litPart$ = i = new Xn(e.insertBefore(Mt(), s), s, void 0, t ?? {});
  }
  return i._$AI(n), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ut = globalThis;
let Ut = class extends pt {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var t;
    const e = super.createRenderRoot();
    return (t = this.renderOptions).renderBefore ?? (t.renderBefore = e.firstChild), e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ts(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), (e = this._$Do) == null || e.setConnected(!0);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._$Do) == null || e.setConnected(!1);
  }
  render() {
    return gt;
  }
};
var ni;
Ut._$litElement$ = !0, Ut.finalized = !0, (ni = ut.litElementHydrateSupport) == null || ni.call(ut, { LitElement: Ut });
const $n = ut.litElementPolyfillSupport;
$n == null || $n({ LitElement: Ut });
(ut.litElementVersions ?? (ut.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ns = (n) => (e, t) => {
  t !== void 0 ? t.addInitializer(() => {
    customElements.define(n, e);
  }) : customElements.define(n, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const os = { attribute: !0, type: String, converter: mn, reflect: !1, hasChanged: Gn }, is = (n = os, e, t) => {
  const { kind: o, metadata: i } = t;
  let s = globalThis.litPropertyMetadata.get(i);
  if (s === void 0 && globalThis.litPropertyMetadata.set(i, s = /* @__PURE__ */ new Map()), o === "setter" && ((n = Object.create(n)).wrapped = !0), s.set(t.name, n), o === "accessor") {
    const { name: a } = t;
    return { set(c) {
      const d = e.get.call(this);
      e.set.call(this, c), this.requestUpdate(a, d, n, !0, c);
    }, init(c) {
      return c !== void 0 && this.C(a, void 0, n, c), c;
    } };
  }
  if (o === "setter") {
    const { name: a } = t;
    return function(c) {
      const d = this[a];
      e.call(this, c), this.requestUpdate(a, d, n, !0, c);
    };
  }
  throw Error("Unsupported decorator location: " + o);
};
function We(n) {
  return (e, t) => typeof t == "object" ? is(n, e, t) : ((o, i, s) => {
    const a = i.hasOwnProperty(s);
    return i.constructor.createProperty(s, o), a ? Object.getOwnPropertyDescriptor(i, s) : void 0;
  })(n, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function it(n) {
  return We({ ...n, state: !0, attribute: !1 });
}
/*! For license information please see elements.js.LICENSE.txt */
var ss = { 7: function(n, e, t) {
  (function(o, i, s) {
    var a = function() {
      return a = Object.assign || function(S) {
        for (var O, C = 1, x = arguments.length; C < x; C++) for (var P in O = arguments[C]) Object.prototype.hasOwnProperty.call(O, P) && (S[P] = O[P]);
        return S;
      }, a.apply(this, arguments);
    };
    function c(S, O) {
      var C = typeof Symbol == "function" && S[Symbol.iterator];
      if (!C) return S;
      var x, P, D = C.call(S), N = [];
      try {
        for (; (O === void 0 || O-- > 0) && !(x = D.next()).done; ) N.push(x.value);
      } catch (U) {
        P = { error: U };
      } finally {
        try {
          x && !x.done && (C = D.return) && C.call(D);
        } finally {
          if (P) throw P.error;
        }
      }
      return N;
    }
    function d(S, O) {
      return [S, !S || S.endsWith("/") ? "" : "/", O, ".json"].join("");
    }
    function l(S, O) {
      var C = S;
      return O && Object.keys(O).forEach(function(x) {
        var P = O[x], D = new RegExp("{".concat(x, "}"), "gm");
        C = C.replace(D, P.toString());
      }), C;
    }
    function u(S, O, C) {
      var x = S[O];
      if (!x) return C;
      var P = C.split("."), D = "";
      do {
        var N = x[D += P.shift()];
        N === void 0 || typeof N != "object" && P.length ? P.length ? D += "." : x = C : (x = N, D = "");
      } while (P.length);
      return x;
    }
    var h = {}, g = { root: "", lang: "en", fallbackLang: "en" }, f = i.createContext(null);
    o.TranslateContext = f, o.TranslateProvider = function(S) {
      var O = function(N, U) {
        N = Object.assign({}, g, N), h = U || h;
        var ie = c(s.useState(N.lang), 2), be = ie[0], se = ie[1], we = c(s.useState(h), 2), M = we[0], z = we[1], ve = c(s.useState(!1), 2), $e = ve[0], Ee = ve[1], Le = function(re) {
          if (!M.hasOwnProperty(re)) {
            Ee(!1);
            var ae = d(N.root, re);
            fetch(ae).then(function(he) {
              return he.json();
            }).then(function(he) {
              h[re] = he, z(a({}, h)), Ee(!0);
            }).catch(function(he) {
              console.log("Aww, snap.", he), z(a({}, h)), Ee(!0);
            });
          }
        };
        return s.useEffect(function() {
          Le(N.fallbackLang), Le(be);
        }, [be]), { lang: be, setLang: se, t: function(re, ae) {
          if (!M.hasOwnProperty(be)) return re;
          var he = u(M, be, re);
          return he === re && be !== N.fallbackLang && (he = u(M, N.fallbackLang, re)), l(he, ae);
        }, isReady: $e };
      }({ root: S.root || "assets", lang: S.lang || "en", fallbackLang: S.fallbackLang || "en" }, S.translations), C = O.t, x = O.setLang, P = O.lang, D = O.isReady;
      return i.h(f.Provider, { value: { t: C, setLang: x, lang: P, isReady: D } }, S.children);
    }, o.format = l, o.getResourceUrl = d, o.getValue = u, Object.defineProperty(o, "__esModule", { value: !0 });
  })(e, t(616), t(78));
}, 633: (n, e) => {
  var t;
  (function() {
    var o = {}.hasOwnProperty;
    function i() {
      for (var s = [], a = 0; a < arguments.length; a++) {
        var c = arguments[a];
        if (c) {
          var d = typeof c;
          if (d === "string" || d === "number") s.push(c);
          else if (Array.isArray(c)) {
            if (c.length) {
              var l = i.apply(null, c);
              l && s.push(l);
            }
          } else if (d === "object") {
            if (c.toString !== Object.prototype.toString && !c.toString.toString().includes("[native code]")) {
              s.push(c.toString());
              continue;
            }
            for (var u in c) o.call(c, u) && c[u] && s.push(u);
          }
        }
      }
      return s.join(" ");
    }
    n.exports ? (i.default = i, n.exports = i) : (t = (function() {
      return i;
    }).apply(e, [])) === void 0 || (n.exports = t);
  })();
}, 21: (n, e, t) => {
  t.d(e, { A: () => c });
  var o = t(645), i = t.n(o), s = t(278), a = t.n(s)()(i());
  a.push([n.id, '.hanko_accordion{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);width:100%;overflow:hidden}.hanko_accordion .hanko_accordionItem{color:var(--color, #333333);margin:.25rem 0;overflow:hidden}.hanko_accordion .hanko_accordionItem.hanko_dropdown{margin:0}.hanko_accordion .hanko_accordionItem .hanko_label{border-radius:var(--border-radius, 8px);border-style:none;height:var(--item-height, 42px);background:var(--background-color, white);box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;padding:0 1rem;margin:0;cursor:pointer;transition:all .35s}.hanko_accordion .hanko_accordionItem .hanko_label .hanko_labelText{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hanko_accordion .hanko_accordionItem .hanko_label .hanko_labelText .hanko_description{color:var(--color-shade-1, #8f9095)}.hanko_accordion .hanko_accordionItem .hanko_label.hanko_dropdown{margin:0;color:var(--link-color, #506cf0);justify-content:flex-start}.hanko_accordion .hanko_accordionItem .hanko_label:hover{color:var(--brand-contrast-color, white);background:var(--brand-color-shade-1, #6b84fb)}.hanko_accordion .hanko_accordionItem .hanko_label:hover .hanko_description{color:var(--brand-contrast-color, white)}.hanko_accordion .hanko_accordionItem .hanko_label:hover.hanko_dropdown{color:var(--link-color, #506cf0);background:none}.hanko_accordion .hanko_accordionItem .hanko_label:not(.hanko_dropdown)::after{content:"❯";width:1rem;text-align:center;transition:all .35s}.hanko_accordion .hanko_accordionItem .hanko_accordionInput{position:absolute;opacity:0;z-index:-1}.hanko_accordion .hanko_accordionItem .hanko_accordionInput:checked+.hanko_label{color:var(--brand-contrast-color, white);background:var(--brand-color, #506cf0)}.hanko_accordion .hanko_accordionItem .hanko_accordionInput:checked+.hanko_label .hanko_description{color:var(--brand-contrast-color, white)}.hanko_accordion .hanko_accordionItem .hanko_accordionInput:checked+.hanko_label.hanko_dropdown{color:var(--link-color, #506cf0);background:none}.hanko_accordion .hanko_accordionItem .hanko_accordionInput:checked+.hanko_label:not(.hanko_dropdown)::after{transform:rotate(90deg)}.hanko_accordion .hanko_accordionItem .hanko_accordionInput:checked+.hanko_label~.hanko_accordionContent{margin:.25rem 1rem;opacity:1;max-height:100vh}.hanko_accordion .hanko_accordionItem .hanko_accordionContent{max-height:0;margin:0 1rem;opacity:0;overflow:hidden;transition:all .35s}.hanko_accordion .hanko_accordionItem .hanko_accordionContent.hanko_dropdownContent{border-style:none}', ""]), a.locals = { accordion: "hanko_accordion", accordionItem: "hanko_accordionItem", dropdown: "hanko_dropdown", label: "hanko_label", labelText: "hanko_labelText", description: "hanko_description", accordionInput: "hanko_accordionInput", accordionContent: "hanko_accordionContent", dropdownContent: "hanko_dropdownContent" };
  const c = a;
}, 905: (n, e, t) => {
  t.d(e, { A: () => c });
  var o = t(645), i = t.n(o), s = t(278), a = t.n(s)()(i());
  a.push([n.id, ".hanko_errorBox{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);border-radius:var(--border-radius, 8px);border-style:var(--border-style, solid);border-width:var(--border-width, 1px);color:var(--error-color, #e82020);background:var(--background-color, white);margin:var(--item-margin, 0.5rem 0);display:flex;align-items:start;box-sizing:border-box;line-height:1.5rem;padding:.25em;gap:.2em}.hanko_errorBox>span{display:inline-flex}.hanko_errorBox>span:first-child{padding:.25em 0 .25em .19em}.hanko_errorBox[hidden]{display:none}.hanko_errorMessage{color:var(--error-color, #e82020)}", ""]), a.locals = { errorBox: "hanko_errorBox", errorMessage: "hanko_errorMessage" };
  const c = a;
}, 577: (n, e, t) => {
  t.d(e, { A: () => c });
  var o = t(645), i = t.n(o), s = t(278), a = t.n(s)()(i());
  a.push([n.id, '.hanko_form{display:flex;flex-grow:1}.hanko_form .hanko_ul{flex-grow:1;margin:var(--item-margin, 0.5rem 0);padding-inline-start:0;list-style-type:none;display:flex;flex-wrap:wrap;gap:1em}.hanko_form .hanko_li{display:flex;max-width:100%;flex-grow:1;flex-basis:min-content}.hanko_form .hanko_li.hanko_maxWidth{min-width:100%}.hanko_button{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);border-radius:var(--border-radius, 8px);border-style:var(--border-style, solid);border-width:var(--border-width, 1px);white-space:nowrap;width:100%;min-width:var(--button-min-width, 7em);min-height:var(--item-height, 42px);outline:none;cursor:pointer;transition:.1s ease-out;flex-grow:1;flex-shrink:1;display:inline-flex}.hanko_button:disabled{cursor:default}.hanko_button.hanko_primary{color:var(--brand-contrast-color, white);background:var(--brand-color, #506cf0);border-color:var(--brand-color, #506cf0);justify-content:center}.hanko_button.hanko_primary:hover{color:var(--brand-contrast-color, white);background:var(--brand-color-shade-1, #6b84fb);border-color:var(--brand-color, #506cf0)}.hanko_button.hanko_primary:focus{color:var(--brand-contrast-color, white);background:var(--brand-color, #506cf0);border-color:var(--color, #333333)}.hanko_button.hanko_primary:disabled{color:var(--color-shade-1, #8f9095);background:var(--color-shade-2, #e5e6ef);border-color:var(--color-shade-2, #e5e6ef)}.hanko_button.hanko_secondary{color:var(--color, #333333);background:var(--background-color, white);border-color:var(--color, #333333);justify-content:flex-start}.hanko_button.hanko_secondary:hover{color:var(--color, #333333);background:var(--color-shade-2, #e5e6ef);border-color:var(--color, #333333)}.hanko_button.hanko_secondary:focus{color:var(--color, #333333);background:var(--background-color, white);border-color:var(--brand-color, #506cf0)}.hanko_button.hanko_secondary:disabled{color:var(--color-shade-1, #8f9095);background:var(--color-shade-2, #e5e6ef);border-color:var(--color-shade-1, #8f9095)}.hanko_button.hanko_dangerous{color:var(--error-color, #e82020);background:var(--background-color, white);border-color:var(--error-color, #e82020);flex-grow:0;width:auto}.hanko_caption{flex-grow:1;flex-wrap:wrap;display:flex;justify-content:space-between;align-items:baseline}.hanko_lastUsed{color:var(--color-shade-1, #8f9095);font-size:smaller}.hanko_inputWrapper{flex-grow:1;position:relative;display:flex;min-width:var(--input-min-width, 14em);max-width:100%}.hanko_input{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);border-radius:var(--border-radius, 8px);border-style:var(--border-style, solid);border-width:var(--border-width, 1px);height:var(--item-height, 42px);color:var(--color, #333333);border-color:var(--color-shade-1, #8f9095);background:var(--background-color, white);padding:0 .5rem;outline:none;width:100%;box-sizing:border-box;transition:.1s ease-out}.hanko_input.hanko_error{border-color:var(--error-color, #e82020)}.hanko_input:-webkit-autofill,.hanko_input:-webkit-autofill:hover,.hanko_input:-webkit-autofill:focus{-webkit-text-fill-color:var(--color, #333333);-webkit-box-shadow:0 0 0 50px var(--background-color, white) inset}.hanko_input::-ms-reveal,.hanko_input::-ms-clear{display:none}.hanko_input::placeholder{color:var(--color-shade-1, #8f9095)}.hanko_input:focus{color:var(--color, #333333);border-color:var(--color, #333333)}.hanko_input:disabled{color:var(--color-shade-1, #8f9095);background:var(--color-shade-2, #e5e6ef);border-color:var(--color-shade-1, #8f9095)}.hanko_passcodeInputWrapper{flex-grow:1;min-width:var(--input-min-width, 14em);max-width:fit-content;position:relative;display:flex;justify-content:space-between}.hanko_passcodeInputWrapper .hanko_passcodeDigitWrapper{flex-grow:1;margin:0 .5rem 0 0}.hanko_passcodeInputWrapper .hanko_passcodeDigitWrapper:last-child{margin:0}.hanko_passcodeInputWrapper .hanko_passcodeDigitWrapper .hanko_input{text-align:center}.hanko_checkboxWrapper{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);color:var(--color, #333333);align-items:center;display:flex}.hanko_checkboxWrapper .hanko_label{color:inherit;padding-left:.5rem;cursor:pointer}.hanko_checkboxWrapper .hanko_label.hanko_disabled{cursor:default;color:var(--color-shade-1, #8f9095)}.hanko_checkboxWrapper .hanko_checkbox{border:currentColor solid 1px;border-radius:.15em;appearance:none;-webkit-appearance:none;width:1.1rem;height:1.1rem;margin:0;color:currentColor;background-color:var(--background-color, white);font:inherit;box-shadow:none;display:inline-flex;place-content:center;cursor:pointer}.hanko_checkboxWrapper .hanko_checkbox:checked{background-color:var(--color, #333333)}.hanko_checkboxWrapper .hanko_checkbox:disabled{cursor:default;background-color:var(--color-shade-2, #e5e6ef);border-color:var(--color-shade-1, #8f9095)}.hanko_checkboxWrapper .hanko_checkbox:checked:after{content:"✓";color:var(--background-color, white);position:absolute;line-height:1.1rem}.hanko_checkboxWrapper .hanko_checkbox:disabled:after{color:var(--color-shade-1, #8f9095)}', ""]), a.locals = { form: "hanko_form", ul: "hanko_ul", li: "hanko_li", maxWidth: "hanko_maxWidth", button: "hanko_button", primary: "hanko_primary", secondary: "hanko_secondary", dangerous: "hanko_dangerous", caption: "hanko_caption", lastUsed: "hanko_lastUsed", inputWrapper: "hanko_inputWrapper", input: "hanko_input", error: "hanko_error", passcodeInputWrapper: "hanko_passcodeInputWrapper", passcodeDigitWrapper: "hanko_passcodeDigitWrapper", checkboxWrapper: "hanko_checkboxWrapper", label: "hanko_label", disabled: "hanko_disabled", checkbox: "hanko_checkbox" };
  const c = a;
}, 619: (n, e, t) => {
  t.d(e, { A: () => c });
  var o = t(645), i = t.n(o), s = t(278), a = t.n(s)()(i());
  a.push([n.id, ".hanko_headline{color:var(--color, #333333);font-family:var(--font-family, sans-serif);text-align:left;letter-spacing:0;font-style:normal;line-height:1.1}.hanko_headline.hanko_grade1{font-size:var(--headline1-font-size, 24px);font-weight:var(--headline1-font-weight, 600);margin:var(--headline1-margin, 0 0 0.5rem)}.hanko_headline.hanko_grade2{font-size:var(--headline2-font-size, 16px);font-weight:var(--headline2-font-weight, 600);margin:var(--headline2-margin, 1rem 0 0.5rem)}", ""]), a.locals = { headline: "hanko_headline", grade1: "hanko_grade1", grade2: "hanko_grade2" };
  const c = a;
}, 697: (n, e, t) => {
  t.d(e, { A: () => c });
  var o = t(645), i = t.n(o), s = t(278), a = t.n(s)()(i());
  a.push([n.id, ".hanko_icon,.hanko_loadingSpinnerWrapper .hanko_loadingSpinner,.hanko_loadingSpinnerWrapperIcon .hanko_loadingSpinner,.hanko_exclamationMark,.hanko_checkmark{display:inline-block;fill:var(--brand-contrast-color, white);width:18px}.hanko_icon.hanko_secondary,.hanko_loadingSpinnerWrapper .hanko_secondary.hanko_loadingSpinner,.hanko_loadingSpinnerWrapperIcon .hanko_secondary.hanko_loadingSpinner,.hanko_secondary.hanko_exclamationMark,.hanko_secondary.hanko_checkmark{fill:var(--color, #333333)}.hanko_icon.hanko_disabled,.hanko_loadingSpinnerWrapper .hanko_disabled.hanko_loadingSpinner,.hanko_loadingSpinnerWrapperIcon .hanko_disabled.hanko_loadingSpinner,.hanko_disabled.hanko_exclamationMark,.hanko_disabled.hanko_checkmark{fill:var(--color-shade-1, #8f9095)}.hanko_checkmark{fill:var(--brand-color, #506cf0)}.hanko_checkmark.hanko_secondary{fill:var(--color-shade-1, #8f9095)}.hanko_checkmark.hanko_fadeOut{animation:hanko_fadeOut ease-out 1.5s forwards !important}@keyframes hanko_fadeOut{0%{opacity:1}100%{opacity:0}}.hanko_exclamationMark{fill:var(--error-color, #e82020)}.hanko_loadingSpinnerWrapperIcon{width:100%;column-gap:10px;margin-left:10px}.hanko_loadingSpinnerWrapper,.hanko_loadingSpinnerWrapperIcon{display:inline-flex;align-items:center;height:100%;margin:0 5px;justify-content:inherit;flex-wrap:inherit}.hanko_loadingSpinnerWrapper.hanko_centerContent,.hanko_centerContent.hanko_loadingSpinnerWrapperIcon{justify-content:center}.hanko_loadingSpinnerWrapper.hanko_maxWidth,.hanko_maxWidth.hanko_loadingSpinnerWrapperIcon{width:100%}.hanko_loadingSpinnerWrapper .hanko_loadingSpinner,.hanko_loadingSpinnerWrapperIcon .hanko_loadingSpinner{fill:var(--brand-color, #506cf0);animation:hanko_spin 500ms ease-in-out infinite}.hanko_loadingSpinnerWrapper.hanko_secondary,.hanko_secondary.hanko_loadingSpinnerWrapperIcon{fill:var(--color-shade-1, #8f9095)}@keyframes hanko_spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}.hanko_googleIcon.hanko_disabled{fill:var(--color-shade-1, #8f9095)}.hanko_googleIcon.hanko_blue{fill:#4285f4}.hanko_googleIcon.hanko_green{fill:#34a853}.hanko_googleIcon.hanko_yellow{fill:#fbbc05}.hanko_googleIcon.hanko_red{fill:#ea4335}.hanko_microsoftIcon.hanko_disabled{fill:var(--color-shade-1, #8f9095)}.hanko_microsoftIcon.hanko_blue{fill:#00a4ef}.hanko_microsoftIcon.hanko_green{fill:#7fba00}.hanko_microsoftIcon.hanko_yellow{fill:#ffb900}.hanko_microsoftIcon.hanko_red{fill:#f25022}.hanko_facebookIcon.hanko_outline{fill:#0866ff}.hanko_facebookIcon.hanko_disabledOutline{fill:var(--color-shade-1, #8f9095)}.hanko_facebookIcon.hanko_letter{fill:#fff}.hanko_facebookIcon.hanko_disabledLetter{fill:var(--color-shade-2, #e5e6ef)}", ""]), a.locals = { icon: "hanko_icon", loadingSpinnerWrapper: "hanko_loadingSpinnerWrapper", loadingSpinner: "hanko_loadingSpinner", loadingSpinnerWrapperIcon: "hanko_loadingSpinnerWrapperIcon", exclamationMark: "hanko_exclamationMark", checkmark: "hanko_checkmark", secondary: "hanko_secondary", disabled: "hanko_disabled", fadeOut: "hanko_fadeOut", centerContent: "hanko_centerContent", maxWidth: "hanko_maxWidth", spin: "hanko_spin", googleIcon: "hanko_googleIcon", blue: "hanko_blue", green: "hanko_green", yellow: "hanko_yellow", red: "hanko_red", microsoftIcon: "hanko_microsoftIcon", facebookIcon: "hanko_facebookIcon", outline: "hanko_outline", disabledOutline: "hanko_disabledOutline", letter: "hanko_letter", disabledLetter: "hanko_disabledLetter" };
  const c = a;
}, 995: (n, e, t) => {
  t.d(e, { A: () => c });
  var o = t(645), i = t.n(o), s = t(278), a = t.n(s)()(i());
  a.push([n.id, ".hanko_link{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);color:var(--link-color, #506cf0);text-decoration:var(--link-text-decoration, none);cursor:pointer;background:none !important;border:none;padding:0 !important;transition:all .1s}.hanko_link:hover{text-decoration:var(--link-text-decoration-hover, underline)}.hanko_link:disabled{color:var(--color, #333333) !important;pointer-events:none;cursor:default}.hanko_link.hanko_danger{color:var(--error-color, #e82020)}.hanko_linkWrapper{display:inline-flex;flex-direction:row;justify-content:space-between;align-items:center;overflow:hidden}.hanko_linkWrapper.hanko_reverse{flex-direction:row-reverse}", ""]), a.locals = { link: "hanko_link", danger: "hanko_danger", linkWrapper: "hanko_linkWrapper", reverse: "hanko_reverse" };
  const c = a;
}, 560: (n, e, t) => {
  t.d(e, { A: () => c });
  var o = t(645), i = t.n(o), s = t(278), a = t.n(s)()(i());
  a.push([n.id, ".hanko_otpCreationDetails{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);color:var(--color, #333333);margin:var(--item-margin, 0.5rem 0);display:flex;justify-content:center;align-items:center;flex-direction:column;font-size:smaller}", ""]), a.locals = { otpCreationDetails: "hanko_otpCreationDetails" };
  const c = a;
}, 489: (n, e, t) => {
  t.d(e, { A: () => c });
  var o = t(645), i = t.n(o), s = t(278), a = t.n(s)()(i());
  a.push([n.id, ".hanko_paragraph{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);color:var(--color, #333333);margin:var(--item-margin, 0.5rem 0);text-align:left;word-break:break-word}", ""]), a.locals = { paragraph: "hanko_paragraph" };
  const c = a;
}, 111: (n, e, t) => {
  t.d(e, { A: () => c });
  var o = t(645), i = t.n(o), s = t(278), a = t.n(s)()(i());
  a.push([n.id, ".hanko_spacer{height:1em}.hanko_divider{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);display:flex;visibility:var(--divider-visibility, visible);color:var(--color-shade-1, #8f9095);margin:var(--item-margin, 0.5rem 0);padding:.5em 0}.hanko_divider .hanko_line{border-bottom-style:var(--border-style, solid);border-bottom-width:var(--border-width, 1px);color:inherit;font:inherit;width:100%}.hanko_divider .hanko_text{font:inherit;color:inherit;background:var(--background-color, white);padding:var(--divider-padding, 0 42px);line-height:.1em}", ""]), a.locals = { spacer: "hanko_spacer", divider: "hanko_divider", line: "hanko_line", text: "hanko_text" };
  const c = a;
}, 914: (n, e, t) => {
  t.d(e, { A: () => c });
  var o = t(645), i = t.n(o), s = t(278), a = t.n(s)()(i());
  a.push([n.id, ".hanko_container{background-color:var(--background-color, white);padding:var(--container-padding, 30px);max-width:var(--container-max-width, 410px);display:flex;flex-direction:column;flex-wrap:nowrap;justify-content:center;align-items:center;align-content:flex-start;box-sizing:border-box}.hanko_content{box-sizing:border-box;flex:0 1 auto;width:100%;height:100%}.hanko_footer{padding:.5rem 0 0;box-sizing:border-box;width:100%}.hanko_footer :nth-child(1){float:left}.hanko_footer :nth-child(2){float:right}.hanko_clipboardContainer{display:flex}.hanko_clipboardIcon{display:flex;margin:auto;cursor:pointer}", ""]), a.locals = { container: "hanko_container", content: "hanko_content", footer: "hanko_footer", clipboardContainer: "hanko_clipboardContainer", clipboardIcon: "hanko_clipboardIcon" };
  const c = a;
}, 278: (n) => {
  n.exports = function(e) {
    var t = [];
    return t.toString = function() {
      return this.map(function(o) {
        var i = "", s = o[5] !== void 0;
        return o[4] && (i += "@supports (".concat(o[4], ") {")), o[2] && (i += "@media ".concat(o[2], " {")), s && (i += "@layer".concat(o[5].length > 0 ? " ".concat(o[5]) : "", " {")), i += e(o), s && (i += "}"), o[2] && (i += "}"), o[4] && (i += "}"), i;
      }).join("");
    }, t.i = function(o, i, s, a, c) {
      typeof o == "string" && (o = [[null, o, void 0]]);
      var d = {};
      if (s) for (var l = 0; l < this.length; l++) {
        var u = this[l][0];
        u != null && (d[u] = !0);
      }
      for (var h = 0; h < o.length; h++) {
        var g = [].concat(o[h]);
        s && d[g[0]] || (c !== void 0 && (g[5] === void 0 || (g[1] = "@layer".concat(g[5].length > 0 ? " ".concat(g[5]) : "", " {").concat(g[1], "}")), g[5] = c), i && (g[2] && (g[1] = "@media ".concat(g[2], " {").concat(g[1], "}")), g[2] = i), a && (g[4] ? (g[1] = "@supports (".concat(g[4], ") {").concat(g[1], "}"), g[4] = a) : g[4] = "".concat(a)), t.push(g));
      }
    }, t;
  };
}, 645: (n) => {
  n.exports = function(e) {
    return e[1];
  };
}, 616: (n, e, t) => {
  t.r(e), t.d(e, { Component: () => U, Fragment: () => N, cloneElement: () => qe, createContext: () => Fe, createElement: () => x, createRef: () => D, h: () => x, hydrate: () => ze, isValidElement: () => a, options: () => i, render: () => pe, toChildArray: () => ve });
  var o, i, s, a, c, d, l, u, h, g = {}, f = [], S = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
  function O(m, v) {
    for (var b in v) m[b] = v[b];
    return m;
  }
  function C(m) {
    var v = m.parentNode;
    v && v.removeChild(m);
  }
  function x(m, v, b) {
    var j, T, I, W = {};
    for (I in v) I == "key" ? j = v[I] : I == "ref" ? T = v[I] : W[I] = v[I];
    if (arguments.length > 2 && (W.children = arguments.length > 3 ? o.call(arguments, 2) : b), typeof m == "function" && m.defaultProps != null) for (I in m.defaultProps) W[I] === void 0 && (W[I] = m.defaultProps[I]);
    return P(m, W, j, T, null);
  }
  function P(m, v, b, j, T) {
    var I = { type: m, props: v, key: b, ref: j, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, __h: null, constructor: void 0, __v: T ?? ++s };
    return T == null && i.vnode != null && i.vnode(I), I;
  }
  function D() {
    return { current: null };
  }
  function N(m) {
    return m.children;
  }
  function U(m, v) {
    this.props = m, this.context = v;
  }
  function ie(m, v) {
    if (v == null) return m.__ ? ie(m.__, m.__.__k.indexOf(m) + 1) : null;
    for (var b; v < m.__k.length; v++) if ((b = m.__k[v]) != null && b.__e != null) return b.__e;
    return typeof m.type == "function" ? ie(m) : null;
  }
  function be(m) {
    var v, b;
    if ((m = m.__) != null && m.__c != null) {
      for (m.__e = m.__c.base = null, v = 0; v < m.__k.length; v++) if ((b = m.__k[v]) != null && b.__e != null) {
        m.__e = m.__c.base = b.__e;
        break;
      }
      return be(m);
    }
  }
  function se(m) {
    (!m.__d && (m.__d = !0) && c.push(m) && !we.__r++ || d !== i.debounceRendering) && ((d = i.debounceRendering) || l)(we);
  }
  function we() {
    var m, v, b, j, T, I, W, X;
    for (c.sort(u); m = c.shift(); ) m.__d && (v = c.length, j = void 0, T = void 0, W = (I = (b = m).__v).__e, (X = b.__P) && (j = [], (T = O({}, I)).__v = I.__v + 1, Ie(X, I, T, b.__n, X.ownerSVGElement !== void 0, I.__h != null ? [W] : null, j, W ?? ie(I), I.__h), k(j, I), I.__e != W && be(I)), c.length > v && c.sort(u));
    we.__r = 0;
  }
  function M(m, v, b, j, T, I, W, X, G, _e) {
    var w, ke, J, H, E, xe, B, F = j && j.__k || f, Me = F.length;
    for (b.__k = [], w = 0; w < v.length; w++) if ((H = b.__k[w] = (H = v[w]) == null || typeof H == "boolean" || typeof H == "function" ? null : typeof H == "string" || typeof H == "number" || typeof H == "bigint" ? P(null, H, null, null, H) : Array.isArray(H) ? P(N, { children: H }, null, null, null) : H.__b > 0 ? P(H.type, H.props, H.key, H.ref ? H.ref : null, H.__v) : H) != null) {
      if (H.__ = b, H.__b = b.__b + 1, (J = F[w]) === null || J && H.key == J.key && H.type === J.type) F[w] = void 0;
      else for (ke = 0; ke < Me; ke++) {
        if ((J = F[ke]) && H.key == J.key && H.type === J.type) {
          F[ke] = void 0;
          break;
        }
        J = null;
      }
      Ie(m, H, J = J || g, T, I, W, X, G, _e), E = H.__e, (ke = H.ref) && J.ref != ke && (B || (B = []), J.ref && B.push(J.ref, null, H), B.push(ke, H.__c || E, H)), E != null ? (xe == null && (xe = E), typeof H.type == "function" && H.__k === J.__k ? H.__d = G = z(H, G, m) : G = $e(m, H, J, F, E, G), typeof b.type == "function" && (b.__d = G)) : G && J.__e == G && G.parentNode != m && (G = ie(J));
    }
    for (b.__e = xe, w = Me; w--; ) F[w] != null && (typeof b.type == "function" && F[w].__e != null && F[w].__e == b.__d && (b.__d = Ee(j).nextSibling), L(F[w], F[w]));
    if (B) for (w = 0; w < B.length; w++) y(B[w], B[++w], B[++w]);
  }
  function z(m, v, b) {
    for (var j, T = m.__k, I = 0; T && I < T.length; I++) (j = T[I]) && (j.__ = m, v = typeof j.type == "function" ? z(j, v, b) : $e(b, j, j, T, j.__e, v));
    return v;
  }
  function ve(m, v) {
    return v = v || [], m == null || typeof m == "boolean" || (Array.isArray(m) ? m.some(function(b) {
      ve(b, v);
    }) : v.push(m)), v;
  }
  function $e(m, v, b, j, T, I) {
    var W, X, G;
    if (v.__d !== void 0) W = v.__d, v.__d = void 0;
    else if (b == null || T != I || T.parentNode == null) e: if (I == null || I.parentNode !== m) m.appendChild(T), W = null;
    else {
      for (X = I, G = 0; (X = X.nextSibling) && G < j.length; G += 1) if (X == T) break e;
      m.insertBefore(T, I), W = I;
    }
    return W !== void 0 ? W : T.nextSibling;
  }
  function Ee(m) {
    var v, b, j;
    if (m.type == null || typeof m.type == "string") return m.__e;
    if (m.__k) {
      for (v = m.__k.length - 1; v >= 0; v--) if ((b = m.__k[v]) && (j = Ee(b))) return j;
    }
    return null;
  }
  function Le(m, v, b) {
    v[0] === "-" ? m.setProperty(v, b ?? "") : m[v] = b == null ? "" : typeof b != "number" || S.test(v) ? b : b + "px";
  }
  function re(m, v, b, j, T) {
    var I;
    e: if (v === "style") if (typeof b == "string") m.style.cssText = b;
    else {
      if (typeof j == "string" && (m.style.cssText = j = ""), j) for (v in j) b && v in b || Le(m.style, v, "");
      if (b) for (v in b) j && b[v] === j[v] || Le(m.style, v, b[v]);
    }
    else if (v[0] === "o" && v[1] === "n") I = v !== (v = v.replace(/Capture$/, "")), v = v.toLowerCase() in m ? v.toLowerCase().slice(2) : v.slice(2), m.l || (m.l = {}), m.l[v + I] = b, b ? j || m.addEventListener(v, I ? he : ae, I) : m.removeEventListener(v, I ? he : ae, I);
    else if (v !== "dangerouslySetInnerHTML") {
      if (T) v = v.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if (v !== "width" && v !== "height" && v !== "href" && v !== "list" && v !== "form" && v !== "tabIndex" && v !== "download" && v in m) try {
        m[v] = b ?? "";
        break e;
      } catch {
      }
      typeof b == "function" || (b == null || b === !1 && v.indexOf("-") == -1 ? m.removeAttribute(v) : m.setAttribute(v, b));
    }
  }
  function ae(m) {
    return this.l[m.type + !1](i.event ? i.event(m) : m);
  }
  function he(m) {
    return this.l[m.type + !0](i.event ? i.event(m) : m);
  }
  function Ie(m, v, b, j, T, I, W, X, G) {
    var _e, w, ke, J, H, E, xe, B, F, Me, ot, fe, Kt, st, R, V = v.type;
    if (v.constructor !== void 0) return null;
    b.__h != null && (G = b.__h, X = v.__e = b.__e, v.__h = null, I = [X]), (_e = i.__b) && _e(v);
    try {
      e: if (typeof V == "function") {
        if (B = v.props, F = (_e = V.contextType) && j[_e.__c], Me = _e ? F ? F.props.value : _e.__ : j, b.__c ? xe = (w = v.__c = b.__c).__ = w.__E : ("prototype" in V && V.prototype.render ? v.__c = w = new V(B, Me) : (v.__c = w = new U(B, Me), w.constructor = V, w.render = K), F && F.sub(w), w.props = B, w.state || (w.state = {}), w.context = Me, w.__n = j, ke = w.__d = !0, w.__h = [], w._sb = []), w.__s == null && (w.__s = w.state), V.getDerivedStateFromProps != null && (w.__s == w.state && (w.__s = O({}, w.__s)), O(w.__s, V.getDerivedStateFromProps(B, w.__s))), J = w.props, H = w.state, w.__v = v, ke) V.getDerivedStateFromProps == null && w.componentWillMount != null && w.componentWillMount(), w.componentDidMount != null && w.__h.push(w.componentDidMount);
        else {
          if (V.getDerivedStateFromProps == null && B !== J && w.componentWillReceiveProps != null && w.componentWillReceiveProps(B, Me), !w.__e && w.shouldComponentUpdate != null && w.shouldComponentUpdate(B, w.__s, Me) === !1 || v.__v === b.__v) {
            for (v.__v !== b.__v && (w.props = B, w.state = w.__s, w.__d = !1), w.__e = !1, v.__e = b.__e, v.__k = b.__k, v.__k.forEach(function(Qe) {
              Qe && (Qe.__ = v);
            }), ot = 0; ot < w._sb.length; ot++) w.__h.push(w._sb[ot]);
            w._sb = [], w.__h.length && W.push(w);
            break e;
          }
          w.componentWillUpdate != null && w.componentWillUpdate(B, w.__s, Me), w.componentDidUpdate != null && w.__h.push(function() {
            w.componentDidUpdate(J, H, E);
          });
        }
        if (w.context = Me, w.props = B, w.__P = m, fe = i.__r, Kt = 0, "prototype" in V && V.prototype.render) {
          for (w.state = w.__s, w.__d = !1, fe && fe(v), _e = w.render(w.props, w.state, w.context), st = 0; st < w._sb.length; st++) w.__h.push(w._sb[st]);
          w._sb = [];
        } else do
          w.__d = !1, fe && fe(v), _e = w.render(w.props, w.state, w.context), w.state = w.__s;
        while (w.__d && ++Kt < 25);
        w.state = w.__s, w.getChildContext != null && (j = O(O({}, j), w.getChildContext())), ke || w.getSnapshotBeforeUpdate == null || (E = w.getSnapshotBeforeUpdate(J, H)), R = _e != null && _e.type === N && _e.key == null ? _e.props.children : _e, M(m, Array.isArray(R) ? R : [R], v, b, j, T, I, W, X, G), w.base = v.__e, v.__h = null, w.__h.length && W.push(w), xe && (w.__E = w.__ = null), w.__e = !1;
      } else I == null && v.__v === b.__v ? (v.__k = b.__k, v.__e = b.__e) : v.__e = p(b.__e, v, b, j, T, I, W, G);
      (_e = i.diffed) && _e(v);
    } catch (Qe) {
      v.__v = null, (G || I != null) && (v.__e = X, v.__h = !!G, I[I.indexOf(X)] = null), i.__e(Qe, v, b);
    }
  }
  function k(m, v) {
    i.__c && i.__c(v, m), m.some(function(b) {
      try {
        m = b.__h, b.__h = [], m.some(function(j) {
          j.call(b);
        });
      } catch (j) {
        i.__e(j, b.__v);
      }
    });
  }
  function p(m, v, b, j, T, I, W, X) {
    var G, _e, w, ke = b.props, J = v.props, H = v.type, E = 0;
    if (H === "svg" && (T = !0), I != null) {
      for (; E < I.length; E++) if ((G = I[E]) && "setAttribute" in G == !!H && (H ? G.localName === H : G.nodeType === 3)) {
        m = G, I[E] = null;
        break;
      }
    }
    if (m == null) {
      if (H === null) return document.createTextNode(J);
      m = T ? document.createElementNS("http://www.w3.org/2000/svg", H) : document.createElement(H, J.is && J), I = null, X = !1;
    }
    if (H === null) ke === J || X && m.data === J || (m.data = J);
    else {
      if (I = I && o.call(m.childNodes), _e = (ke = b.props || g).dangerouslySetInnerHTML, w = J.dangerouslySetInnerHTML, !X) {
        if (I != null) for (ke = {}, E = 0; E < m.attributes.length; E++) ke[m.attributes[E].name] = m.attributes[E].value;
        (w || _e) && (w && (_e && w.__html == _e.__html || w.__html === m.innerHTML) || (m.innerHTML = w && w.__html || ""));
      }
      if (function(xe, B, F, Me, ot) {
        var fe;
        for (fe in F) fe === "children" || fe === "key" || fe in B || re(xe, fe, null, F[fe], Me);
        for (fe in B) ot && typeof B[fe] != "function" || fe === "children" || fe === "key" || fe === "value" || fe === "checked" || F[fe] === B[fe] || re(xe, fe, B[fe], F[fe], Me);
      }(m, J, ke, T, X), w) v.__k = [];
      else if (E = v.props.children, M(m, Array.isArray(E) ? E : [E], v, b, j, T && H !== "foreignObject", I, W, I ? I[0] : b.__k && ie(b, 0), X), I != null) for (E = I.length; E--; ) I[E] != null && C(I[E]);
      X || ("value" in J && (E = J.value) !== void 0 && (E !== m.value || H === "progress" && !E || H === "option" && E !== ke.value) && re(m, "value", E, ke.value, !1), "checked" in J && (E = J.checked) !== void 0 && E !== m.checked && re(m, "checked", E, ke.checked, !1));
    }
    return m;
  }
  function y(m, v, b) {
    try {
      typeof m == "function" ? m(v) : m.current = v;
    } catch (j) {
      i.__e(j, b);
    }
  }
  function L(m, v, b) {
    var j, T;
    if (i.unmount && i.unmount(m), (j = m.ref) && (j.current && j.current !== m.__e || y(j, null, v)), (j = m.__c) != null) {
      if (j.componentWillUnmount) try {
        j.componentWillUnmount();
      } catch (I) {
        i.__e(I, v);
      }
      j.base = j.__P = null, m.__c = void 0;
    }
    if (j = m.__k) for (T = 0; T < j.length; T++) j[T] && L(j[T], v, b || typeof m.type != "function");
    b || m.__e == null || C(m.__e), m.__ = m.__e = m.__d = void 0;
  }
  function K(m, v, b) {
    return this.constructor(m, b);
  }
  function pe(m, v, b) {
    var j, T, I;
    i.__ && i.__(m, v), T = (j = typeof b == "function") ? null : b && b.__k || v.__k, I = [], Ie(v, m = (!j && b || v).__k = x(N, null, [m]), T || g, g, v.ownerSVGElement !== void 0, !j && b ? [b] : T ? null : v.firstChild ? o.call(v.childNodes) : null, I, !j && b ? b : T ? T.__e : v.firstChild, j), k(I, m);
  }
  function ze(m, v) {
    pe(m, v, ze);
  }
  function qe(m, v, b) {
    var j, T, I, W = O({}, m.props);
    for (I in v) I == "key" ? j = v[I] : I == "ref" ? T = v[I] : W[I] = v[I];
    return arguments.length > 2 && (W.children = arguments.length > 3 ? o.call(arguments, 2) : b), P(m.type, W, j || m.key, T || m.ref, null);
  }
  function Fe(m, v) {
    var b = { __c: v = "__cC" + h++, __: m, Consumer: function(j, T) {
      return j.children(T);
    }, Provider: function(j) {
      var T, I;
      return this.getChildContext || (T = [], (I = {})[v] = this, this.getChildContext = function() {
        return I;
      }, this.shouldComponentUpdate = function(W) {
        this.props.value !== W.value && T.some(function(X) {
          X.__e = !0, se(X);
        });
      }, this.sub = function(W) {
        T.push(W);
        var X = W.componentWillUnmount;
        W.componentWillUnmount = function() {
          T.splice(T.indexOf(W), 1), X && X.call(W);
        };
      }), j.children;
    } };
    return b.Provider.__ = b.Consumer.contextType = b;
  }
  o = f.slice, i = { __e: function(m, v, b, j) {
    for (var T, I, W; v = v.__; ) if ((T = v.__c) && !T.__) try {
      if ((I = T.constructor) && I.getDerivedStateFromError != null && (T.setState(I.getDerivedStateFromError(m)), W = T.__d), T.componentDidCatch != null && (T.componentDidCatch(m, j || {}), W = T.__d), W) return T.__E = T;
    } catch (X) {
      m = X;
    }
    throw m;
  } }, s = 0, a = function(m) {
    return m != null && m.constructor === void 0;
  }, U.prototype.setState = function(m, v) {
    var b;
    b = this.__s != null && this.__s !== this.state ? this.__s : this.__s = O({}, this.state), typeof m == "function" && (m = m(O({}, b), this.props)), m && O(b, m), m != null && this.__v && (v && this._sb.push(v), se(this));
  }, U.prototype.forceUpdate = function(m) {
    this.__v && (this.__e = !0, m && this.__h.push(m), se(this));
  }, U.prototype.render = N, c = [], l = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, u = function(m, v) {
    return m.__v.__b - v.__v.__b;
  }, we.__r = 0, h = 0;
}, 78: (n, e, t) => {
  t.r(e), t.d(e, { useCallback: () => se, useContext: () => we, useDebugValue: () => M, useEffect: () => D, useErrorBoundary: () => z, useId: () => ve, useImperativeHandle: () => ie, useLayoutEffect: () => N, useMemo: () => be, useReducer: () => P, useRef: () => U, useState: () => x });
  var o, i, s, a, c = t(616), d = 0, l = [], u = [], h = c.options.__b, g = c.options.__r, f = c.options.diffed, S = c.options.__c, O = c.options.unmount;
  function C(k, p) {
    c.options.__h && c.options.__h(i, k, d || p), d = 0;
    var y = i.__H || (i.__H = { __: [], __h: [] });
    return k >= y.__.length && y.__.push({ __V: u }), y.__[k];
  }
  function x(k) {
    return d = 1, P(Ie, k);
  }
  function P(k, p, y) {
    var L = C(o++, 2);
    if (L.t = k, !L.__c && (L.__ = [y ? y(p) : Ie(void 0, p), function(qe) {
      var Fe = L.__N ? L.__N[0] : L.__[0], m = L.t(Fe, qe);
      Fe !== m && (L.__N = [m, L.__[1]], L.__c.setState({}));
    }], L.__c = i, !i.u)) {
      var K = function(qe, Fe, m) {
        if (!L.__c.__H) return !0;
        var v = L.__c.__H.__.filter(function(j) {
          return j.__c;
        });
        if (v.every(function(j) {
          return !j.__N;
        })) return !pe || pe.call(this, qe, Fe, m);
        var b = !1;
        return v.forEach(function(j) {
          if (j.__N) {
            var T = j.__[0];
            j.__ = j.__N, j.__N = void 0, T !== j.__[0] && (b = !0);
          }
        }), !(!b && L.__c.props === qe) && (!pe || pe.call(this, qe, Fe, m));
      };
      i.u = !0;
      var pe = i.shouldComponentUpdate, ze = i.componentWillUpdate;
      i.componentWillUpdate = function(qe, Fe, m) {
        if (this.__e) {
          var v = pe;
          pe = void 0, K(qe, Fe, m), pe = v;
        }
        ze && ze.call(this, qe, Fe, m);
      }, i.shouldComponentUpdate = K;
    }
    return L.__N || L.__;
  }
  function D(k, p) {
    var y = C(o++, 3);
    !c.options.__s && he(y.__H, p) && (y.__ = k, y.i = p, i.__H.__h.push(y));
  }
  function N(k, p) {
    var y = C(o++, 4);
    !c.options.__s && he(y.__H, p) && (y.__ = k, y.i = p, i.__h.push(y));
  }
  function U(k) {
    return d = 5, be(function() {
      return { current: k };
    }, []);
  }
  function ie(k, p, y) {
    d = 6, N(function() {
      return typeof k == "function" ? (k(p()), function() {
        return k(null);
      }) : k ? (k.current = p(), function() {
        return k.current = null;
      }) : void 0;
    }, y == null ? y : y.concat(k));
  }
  function be(k, p) {
    var y = C(o++, 7);
    return he(y.__H, p) ? (y.__V = k(), y.i = p, y.__h = k, y.__V) : y.__;
  }
  function se(k, p) {
    return d = 8, be(function() {
      return k;
    }, p);
  }
  function we(k) {
    var p = i.context[k.__c], y = C(o++, 9);
    return y.c = k, p ? (y.__ == null && (y.__ = !0, p.sub(i)), p.props.value) : k.__;
  }
  function M(k, p) {
    c.options.useDebugValue && c.options.useDebugValue(p ? p(k) : k);
  }
  function z(k) {
    var p = C(o++, 10), y = x();
    return p.__ = k, i.componentDidCatch || (i.componentDidCatch = function(L, K) {
      p.__ && p.__(L, K), y[1](L);
    }), [y[0], function() {
      y[1](void 0);
    }];
  }
  function ve() {
    var k = C(o++, 11);
    if (!k.__) {
      for (var p = i.__v; p !== null && !p.__m && p.__ !== null; ) p = p.__;
      var y = p.__m || (p.__m = [0, 0]);
      k.__ = "P" + y[0] + "-" + y[1]++;
    }
    return k.__;
  }
  function $e() {
    for (var k; k = l.shift(); ) if (k.__P && k.__H) try {
      k.__H.__h.forEach(re), k.__H.__h.forEach(ae), k.__H.__h = [];
    } catch (p) {
      k.__H.__h = [], c.options.__e(p, k.__v);
    }
  }
  c.options.__b = function(k) {
    i = null, h && h(k);
  }, c.options.__r = function(k) {
    g && g(k), o = 0;
    var p = (i = k.__c).__H;
    p && (s === i ? (p.__h = [], i.__h = [], p.__.forEach(function(y) {
      y.__N && (y.__ = y.__N), y.__V = u, y.__N = y.i = void 0;
    })) : (p.__h.forEach(re), p.__h.forEach(ae), p.__h = [])), s = i;
  }, c.options.diffed = function(k) {
    f && f(k);
    var p = k.__c;
    p && p.__H && (p.__H.__h.length && (l.push(p) !== 1 && a === c.options.requestAnimationFrame || ((a = c.options.requestAnimationFrame) || Le)($e)), p.__H.__.forEach(function(y) {
      y.i && (y.__H = y.i), y.__V !== u && (y.__ = y.__V), y.i = void 0, y.__V = u;
    })), s = i = null;
  }, c.options.__c = function(k, p) {
    p.some(function(y) {
      try {
        y.__h.forEach(re), y.__h = y.__h.filter(function(L) {
          return !L.__ || ae(L);
        });
      } catch (L) {
        p.some(function(K) {
          K.__h && (K.__h = []);
        }), p = [], c.options.__e(L, y.__v);
      }
    }), S && S(k, p);
  }, c.options.unmount = function(k) {
    O && O(k);
    var p, y = k.__c;
    y && y.__H && (y.__H.__.forEach(function(L) {
      try {
        re(L);
      } catch (K) {
        p = K;
      }
    }), y.__H = void 0, p && c.options.__e(p, y.__v));
  };
  var Ee = typeof requestAnimationFrame == "function";
  function Le(k) {
    var p, y = function() {
      clearTimeout(L), Ee && cancelAnimationFrame(p), setTimeout(k);
    }, L = setTimeout(y, 100);
    Ee && (p = requestAnimationFrame(y));
  }
  function re(k) {
    var p = i, y = k.__c;
    typeof y == "function" && (k.__c = void 0, y()), i = p;
  }
  function ae(k) {
    var p = i;
    k.__c = k.__(), i = p;
  }
  function he(k, p) {
    return !k || k.length !== p.length || p.some(function(y, L) {
      return y !== k[L];
    });
  }
  function Ie(k, p) {
    return typeof p == "function" ? p(k) : p;
  }
}, 292: (n) => {
  var e = [];
  function t(s) {
    for (var a = -1, c = 0; c < e.length; c++) if (e[c].identifier === s) {
      a = c;
      break;
    }
    return a;
  }
  function o(s, a) {
    for (var c = {}, d = [], l = 0; l < s.length; l++) {
      var u = s[l], h = a.base ? u[0] + a.base : u[0], g = c[h] || 0, f = "".concat(h, " ").concat(g);
      c[h] = g + 1;
      var S = t(f), O = { css: u[1], media: u[2], sourceMap: u[3], supports: u[4], layer: u[5] };
      if (S !== -1) e[S].references++, e[S].updater(O);
      else {
        var C = i(O, a);
        a.byIndex = l, e.splice(l, 0, { identifier: f, updater: C, references: 1 });
      }
      d.push(f);
    }
    return d;
  }
  function i(s, a) {
    var c = a.domAPI(a);
    return c.update(s), function(d) {
      if (d) {
        if (d.css === s.css && d.media === s.media && d.sourceMap === s.sourceMap && d.supports === s.supports && d.layer === s.layer) return;
        c.update(s = d);
      } else c.remove();
    };
  }
  n.exports = function(s, a) {
    var c = o(s = s || [], a = a || {});
    return function(d) {
      d = d || [];
      for (var l = 0; l < c.length; l++) {
        var u = t(c[l]);
        e[u].references--;
      }
      for (var h = o(d, a), g = 0; g < c.length; g++) {
        var f = t(c[g]);
        e[f].references === 0 && (e[f].updater(), e.splice(f, 1));
      }
      c = h;
    };
  };
}, 88: (n) => {
  n.exports = function(e) {
    var t = document.createElement("style");
    return e.setAttributes(t, e.attributes), e.insert(t, e.options), t;
  };
}, 884: (n, e, t) => {
  n.exports = function(o) {
    var i = t.nc;
    i && o.setAttribute("nonce", i);
  };
}, 360: (n) => {
  var e, t = (e = [], function(s, a) {
    return e[s] = a, e.filter(Boolean).join(`
`);
  });
  function o(s, a, c, d) {
    var l;
    if (c) l = "";
    else {
      l = "", d.supports && (l += "@supports (".concat(d.supports, ") {")), d.media && (l += "@media ".concat(d.media, " {"));
      var u = d.layer !== void 0;
      u && (l += "@layer".concat(d.layer.length > 0 ? " ".concat(d.layer) : "", " {")), l += d.css, u && (l += "}"), d.media && (l += "}"), d.supports && (l += "}");
    }
    if (s.styleSheet) s.styleSheet.cssText = t(a, l);
    else {
      var h = document.createTextNode(l), g = s.childNodes;
      g[a] && s.removeChild(g[a]), g.length ? s.insertBefore(h, g[a]) : s.appendChild(h);
    }
  }
  var i = { singleton: null, singletonCounter: 0 };
  n.exports = function(s) {
    if (typeof document > "u") return { update: function() {
    }, remove: function() {
    } };
    var a = i.singletonCounter++, c = i.singleton || (i.singleton = s.insertStyleElement(s));
    return { update: function(d) {
      o(c, a, !1, d);
    }, remove: function(d) {
      o(c, a, !0, d);
    } };
  };
}, 6: (n, e, t) => {
  t.d(e, { en: () => o });
  const o = { headlines: { error: "An error has occurred", loginEmail: "Sign in or create account", loginEmailNoSignup: "Sign in", loginFinished: "Login successful", loginPasscode: "Enter passcode", loginPassword: "Enter password", registerAuthenticator: "Create a passkey", registerConfirm: "Create account?", registerPassword: "Set new password", otpSetUp: "Set up authenticator app", profileEmails: "Emails", profilePassword: "Password", profilePasskeys: "Passkeys", isPrimaryEmail: "Primary email address", setPrimaryEmail: "Set primary email address", createEmail: "Enter a new email", createUsername: "Enter a new username", emailVerified: "Verified", emailUnverified: "Unverified", emailDelete: "Delete", renamePasskey: "Rename passkey", deletePasskey: "Delete passkey", lastUsedAt: "Last used at", createdAt: "Created at", connectedAccounts: "Connected accounts", deleteAccount: "Delete account", accountNotFound: "Account not found", signIn: "Sign in", signUp: "Create account", selectLoginMethod: "Select login method", setupLoginMethod: "Set up login method", lastUsed: "Last seen", ipAddress: "IP address", revokeSession: "Revoke session", profileSessions: "Sessions", mfaSetUp: "Set up MFA", securityKeySetUp: "Add security key", securityKeyLogin: "Security key", otpLogin: "Authentication code", renameSecurityKey: "Rename security key", deleteSecurityKey: "Delete security key", securityKeys: "Security keys", authenticatorApp: "Authenticator app", authenticatorAppAlreadySetUp: "Authenticator app is set up", authenticatorAppNotSetUp: "Set up authenticator app", trustDevice: "Trust this browser?" }, texts: { enterPasscode: 'Enter the passcode that was sent to "{emailAddress}".', enterPasscodeNoEmail: "Enter the passcode that was sent to your primary email address.", setupPasskey: "Sign in to your account easily and securely with a passkey. Note: Your biometric data is only stored on your devices and will never be shared with anyone.", createAccount: 'No account exists for "{emailAddress}". Do you want to create a new account?', otpEnterVerificationCode: "Enter the one-time password (OTP) obtained from your authenticator app below:", otpScanQRCode: "Scan the QR code using your authenticator app (such as Google Authenticator or any other TOTP app). Alternatively, you can manually enter the OTP secret key into the app.", otpSecretKey: "OTP secret key", passwordFormatHint: "Must be between {minLength} and {maxLength} characters long.", securityKeySetUp: "Use a dedicated security key via USB, Bluetooth, or NFC, or your mobile phone. Connect or activate your security key, then click the button below and follow the prompts to complete the registration.", setPrimaryEmail: "Set this email address to be used for contacting you.", isPrimaryEmail: "This email address will be used to contact you if necessary.", emailVerified: "This email address has been verified.", emailUnverified: "This email address has not been verified.", emailDelete: "If you delete this email address, it can no longer be used to sign in.", renamePasskey: "Set a name for the passkey.", deletePasskey: "Delete this passkey from your account.", deleteAccount: "Are you sure you want to delete this account? All data will be deleted immediately and cannot be recovered.", noAccountExists: 'No account exists for "{emailAddress}".', selectLoginMethodForFutureLogins: "Select one of the following login methods to use for future logins.", howDoYouWantToLogin: "How do you want to login?", mfaSetUp: "Protect your account with Multi-Factor Authentication (MFA). MFA adds an additional step to your login process, ensuring that even if your password or email account is compromised, your account stays secure.", securityKeyLogin: "Connect or activate your security key, then click the button below. Once ready, use it via USB, NFC, your mobile phone. Follow the prompts to complete the login process.", otpLogin: "Open your authenticator app to obtain the one-time password (OTP). Enter the code in the field below to complete your login.", renameSecurityKey: "Set a name for the security key.", deleteSecurityKey: "Delete this security key from your account.", authenticatorAppAlreadySetUp: "Your account is secured with an authenticator app that generates time-based one-time passwords (TOTP) for multi-factor authentication.", authenticatorAppNotSetUp: "Secure your account with an authenticator app that generates time-based one-time passwords (TOTP) for multi-factor authentication.", trustDevice: "If you trust this browser, you won’t need to enter your OTP (One-Time-Password) or use your security key for multi-factor authentication (MFA) the next time you log in." }, labels: { or: "or", no: "no", yes: "yes", email: "Email", continue: "Continue", copied: "copied", skip: "Skip", save: "Save", password: "Password", passkey: "Passkey", passcode: "Passcode", signInPassword: "Sign in with a password", signInPasscode: "Sign in with a passcode", forgotYourPassword: "Forgot your password?", back: "Back", signInPasskey: "Sign in with a passkey", registerAuthenticator: "Create a passkey", signIn: "Sign in", signUp: "Create account", sendNewPasscode: "Send new code", passwordRetryAfter: "Retry in {passwordRetryAfter}", passcodeResendAfter: "Request a new code in {passcodeResendAfter}", unverifiedEmail: "unverified", primaryEmail: "primary", setAsPrimaryEmail: "Set as primary", verify: "Verify", delete: "Delete", newEmailAddress: "New email address", newPassword: "New password", rename: "Rename", newPasskeyName: "New passkey name", addEmail: "Add email", createPasskey: "Create a passkey", webauthnUnsupported: "Passkeys are not supported by your browser", signInWith: "Sign in with {provider}", deleteAccount: "Yes, delete this account.", emailOrUsername: "Email or username", username: "Username", optional: "optional", dontHaveAnAccount: "Don't have an account?", alreadyHaveAnAccount: "Already have an account?", changeUsername: "Change username", setUsername: "Set username", changePassword: "Change password", setPassword: "Set password", revoke: "Revoke", currentSession: "Current session", authenticatorApp: "Authenticator app", securityKey: "Security key", securityKeyUse: "Use security key", newSecurityKeyName: "New security key name", createSecurityKey: "Add a security key", authenticatorAppManage: "Manage authenticator app", authenticatorAppAdd: "Set up", configured: "configured", useAnotherMethod: "Use another method", lastUsed: "Last used", trustDevice: "Trust this browser", staySignedIn: "Stay signed in" }, errors: { somethingWentWrong: "A technical error has occurred. Please try again later.", requestTimeout: "The request timed out.", invalidPassword: "Wrong email or password.", invalidPasscode: "The passcode provided was not correct.", passcodeAttemptsReached: "The passcode was entered incorrectly too many times. Please request a new code.", tooManyRequests: "Too many requests have been made. Please wait to repeat the requested operation.", unauthorized: "Your session has expired. Please log in again.", invalidWebauthnCredential: "This passkey cannot be used anymore.", passcodeExpired: "The passcode has expired. Please request a new one.", userVerification: "User verification required. Please ensure your authenticator device is protected with a PIN or biometric.", emailAddressAlreadyExistsError: "The email address already exists.", maxNumOfEmailAddressesReached: "No further email addresses can be added.", thirdPartyAccessDenied: "Access denied. The request was cancelled by the user or the provider has denied access for other reasons.", thirdPartyMultipleAccounts: "Cannot identify account. The email address is used by multiple accounts.", thirdPartyUnverifiedEmail: "Email verification required. Please verify the used email address with your provider.", signupDisabled: "Account registration is disabled.", handlerNotFoundError: "The current step in your process is not supported by this application version. Please try again later or contact support if the issue persists." }, flowErrors: { technical_error: "A technical error has occurred. Please try again later.", flow_expired_error: "The session has expired, please click the button to restart.", value_invalid_error: "The entered value is invalid.", passcode_invalid: "The passcode provided was not correct.", passkey_invalid: "This passkey cannot be used anymore", passcode_max_attempts_reached: "The passcode was entered incorrectly too many times. Please request a new code.", rate_limit_exceeded: "Too many requests have been made. Please wait to repeat the requested operation.", unknown_username_error: "The username is unknown.", unknown_email_error: "The email address is unknown.", username_already_exists: "The username is already taken.", invalid_username_error: "The username must contain only letters, numbers, and underscores.", email_already_exists: "The email is already taken.", not_found: "The requested resource was not found.", operation_not_permitted_error: "The operation is not permitted.", flow_discontinuity_error: "The process cannot be continued due to user settings or the provider's configuration.", form_data_invalid_error: "The submitted form data contains errors.", unauthorized: "Your session has expired. Please log in again.", value_missing_error: "The value is missing.", value_too_long_error: "Value is too long.", value_too_short_error: "The value is too short.", webauthn_credential_invalid_mfa_only: "This credential can be used as a second factor security key only.", webauthn_credential_already_exists: "The request either timed out, was canceled or the device is already registered. Please try again or try using another device.", platform_authenticator_required: "Your account is configured to use platform authenticators, but your current device or browser does not support this feature. Please try again with a compatible device or browser." } };
} }, jo = {};
function Y(n) {
  var e = jo[n];
  if (e !== void 0) return e.exports;
  var t = jo[n] = { id: n, exports: {} };
  return ss[n].call(t.exports, t, t.exports, Y), t.exports;
}
Y.n = (n) => {
  var e = n && n.__esModule ? () => n.default : () => n;
  return Y.d(e, { a: e }), e;
}, Y.d = (n, e) => {
  for (var t in e) Y.o(e, t) && !Y.o(n, t) && Object.defineProperty(n, t, { enumerable: !0, get: e[t] });
}, Y.o = (n, e) => Object.prototype.hasOwnProperty.call(n, e), Y.r = (n) => {
  typeof Symbol < "u" && Symbol.toStringTag && Object.defineProperty(n, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(n, "__esModule", { value: !0 });
}, Y.nc = void 0;
var oe = {};
Y.d(oe, { fK: () => kn, tJ: () => wi, Z7: () => Cn, Q9: () => Ai, Lv: () => Si, qQ: () => xn, I4: () => Ii, O8: () => Ce, ku: () => no, ls: () => to, bO: () => oo, yv: () => Sn, AT: () => so, m_: () => zt, KG: () => io, DH: () => wn, kf: () => po, oY: () => De, xg: () => Oi, Wg: () => Je, J: () => Pi, AC: () => ro, D_: () => Ye, jx: () => Ci, nX: () => ao, Nx: () => eo, Sd: () => mt, kz: () => Gr, fX: () => lo, qA: () => co, tz: () => ho, gN: () => uo });
var Bn = {};
Y.r(Bn), Y.d(Bn, { apple: () => Js, checkmark: () => Qs, copy: () => Gs, customProvider: () => Ys, discord: () => Xs, exclamation: () => er, facebook: () => tr, github: () => nr, google: () => or, linkedin: () => ir, mail: () => sr, microsoft: () => rr, passkey: () => ar, password: () => lr, qrCodeScanner: () => cr, securityKey: () => dr, spinner: () => ur });
var A = Y(616), rs = 0;
function r(n, e, t, o, i, s) {
  var a, c, d = {};
  for (c in e) c == "ref" ? a = e[c] : d[c] = e[c];
  var l = { type: n, props: d, key: t, ref: a, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, __h: null, constructor: void 0, __v: --rs, __source: i, __self: s };
  if (typeof n == "function" && (a = n.defaultProps)) for (c in a) d[c] === void 0 && (d[c] = a[c]);
  return A.options.vnode && A.options.vnode(l), l;
}
function vn() {
  return vn = Object.assign ? Object.assign.bind() : function(n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (n[o] = t[o]);
    }
    return n;
  }, vn.apply(this, arguments);
}
var as = ["context", "children"];
function ls(n) {
  this.getChildContext = function() {
    return n.context;
  };
  var e = n.children, t = function(o, i) {
    if (o == null) return {};
    var s, a, c = {}, d = Object.keys(o);
    for (a = 0; a < d.length; a++) i.indexOf(s = d[a]) >= 0 || (c[s] = o[s]);
    return c;
  }(n, as);
  return (0, A.cloneElement)(e, t);
}
function cs() {
  var n = new CustomEvent("_preact", { detail: {}, bubbles: !0, cancelable: !0 });
  this.dispatchEvent(n), this._vdom = (0, A.h)(ls, vn({}, this._props, { context: n.detail.context }), ui(this, this._vdomComponent)), (this.hasAttribute("hydrate") ? A.hydrate : A.render)(this._vdom, this._root);
}
function di(n) {
  return n.replace(/-(\w)/g, function(e, t) {
    return t ? t.toUpperCase() : "";
  });
}
function ds(n, e, t) {
  if (this._vdom) {
    var o = {};
    o[n] = t = t ?? void 0, o[di(n)] = t, this._vdom = (0, A.cloneElement)(this._vdom, o), (0, A.render)(this._vdom, this._root);
  }
}
function us() {
  (0, A.render)(this._vdom = null, this._root);
}
function Do(n, e) {
  var t = this;
  return (0, A.h)("slot", vn({}, n, { ref: function(o) {
    o ? (t.ref = o, t._listener || (t._listener = function(i) {
      i.stopPropagation(), i.detail.context = e;
    }, o.addEventListener("_preact", t._listener))) : t.ref.removeEventListener("_preact", t._listener);
  } }));
}
function ui(n, e) {
  if (n.nodeType === 3) return n.data;
  if (n.nodeType !== 1) return null;
  var t = [], o = {}, i = 0, s = n.attributes, a = n.childNodes;
  for (i = s.length; i--; ) s[i].name !== "slot" && (o[s[i].name] = s[i].value, o[di(s[i].name)] = s[i].value);
  for (i = a.length; i--; ) {
    var c = ui(a[i], null), d = a[i].slot;
    d ? o[d] = (0, A.h)(Do, { name: d }, c) : t[i] = c;
  }
  var l = e ? (0, A.h)(Do, null, t) : t;
  return (0, A.h)(e || n.nodeName.toLowerCase(), o, l);
}
var Z = Y(7), _ = Y(78);
function hi(n, e) {
  for (var t in e) n[t] = e[t];
  return n;
}
function $o(n, e) {
  for (var t in n) if (t !== "__source" && !(t in e)) return !0;
  for (var o in e) if (o !== "__source" && n[o] !== e[o]) return !0;
  return !1;
}
function Lo(n) {
  this.props = n;
}
(Lo.prototype = new A.Component()).isPureReactComponent = !0, Lo.prototype.shouldComponentUpdate = function(n, e) {
  return $o(this.props, n) || $o(this.state, e);
};
var To = A.options.__b;
A.options.__b = function(n) {
  n.type && n.type.__f && n.ref && (n.props.ref = n.ref, n.ref = null), To && To(n);
};
var hs = typeof Symbol < "u" && Symbol.for && Symbol.for("react.forward_ref") || 3911, ps = (A.toChildArray, A.options.__e);
A.options.__e = function(n, e, t, o) {
  if (n.then) {
    for (var i, s = e; s = s.__; ) if ((i = s.__c) && i.__c) return e.__e == null && (e.__e = t.__e, e.__k = t.__k), i.__c(n, e);
  }
  ps(n, e, t, o);
};
var No = A.options.unmount;
function pi(n, e, t) {
  return n && (n.__c && n.__c.__H && (n.__c.__H.__.forEach(function(o) {
    typeof o.__c == "function" && o.__c();
  }), n.__c.__H = null), (n = hi({}, n)).__c != null && (n.__c.__P === t && (n.__c.__P = e), n.__c = null), n.__k = n.__k && n.__k.map(function(o) {
    return pi(o, e, t);
  })), n;
}
function fi(n, e, t) {
  return n && (n.__v = null, n.__k = n.__k && n.__k.map(function(o) {
    return fi(o, e, t);
  }), n.__c && n.__c.__P === e && (n.__e && t.insertBefore(n.__e, n.__d), n.__c.__e = !0, n.__c.__P = t)), n;
}
function Ln() {
  this.__u = 0, this.t = null, this.__b = null;
}
function mi(n) {
  var e = n.__.__c;
  return e && e.__a && e.__a(n);
}
function Bt() {
  this.u = null, this.o = null;
}
A.options.unmount = function(n) {
  var e = n.__c;
  e && e.__R && e.__R(), e && n.__h === !0 && (n.type = null), No && No(n);
}, (Ln.prototype = new A.Component()).__c = function(n, e) {
  var t = e.__c, o = this;
  o.t == null && (o.t = []), o.t.push(t);
  var i = mi(o.__v), s = !1, a = function() {
    s || (s = !0, t.__R = null, i ? i(c) : c());
  };
  t.__R = a;
  var c = function() {
    if (!--o.__u) {
      if (o.state.__a) {
        var l = o.state.__a;
        o.__v.__k[0] = fi(l, l.__c.__P, l.__c.__O);
      }
      var u;
      for (o.setState({ __a: o.__b = null }); u = o.t.pop(); ) u.forceUpdate();
    }
  }, d = e.__h === !0;
  o.__u++ || d || o.setState({ __a: o.__b = o.__v.__k[0] }), n.then(a, a);
}, Ln.prototype.componentWillUnmount = function() {
  this.t = [];
}, Ln.prototype.render = function(n, e) {
  if (this.__b) {
    if (this.__v.__k) {
      var t = document.createElement("div"), o = this.__v.__k[0].__c;
      this.__v.__k[0] = pi(this.__b, t, o.__O = o.__P);
    }
    this.__b = null;
  }
  var i = e.__a && (0, A.createElement)(A.Fragment, null, n.fallback);
  return i && (i.__h = null), [(0, A.createElement)(A.Fragment, null, e.__a ? null : n.children), i];
};
var Uo = function(n, e, t) {
  if (++t[1] === t[0] && n.o.delete(e), n.props.revealOrder && (n.props.revealOrder[0] !== "t" || !n.o.size)) for (t = n.u; t; ) {
    for (; t.length > 3; ) t.pop()();
    if (t[1] < t[0]) break;
    n.u = t = t[2];
  }
};
(Bt.prototype = new A.Component()).__a = function(n) {
  var e = this, t = mi(e.__v), o = e.o.get(n);
  return o[0]++, function(i) {
    var s = function() {
      e.props.revealOrder ? (o.push(i), Uo(e, n, o)) : i();
    };
    t ? t(s) : s();
  };
}, Bt.prototype.render = function(n) {
  this.u = null, this.o = /* @__PURE__ */ new Map();
  var e = (0, A.toChildArray)(n.children);
  n.revealOrder && n.revealOrder[0] === "b" && e.reverse();
  for (var t = e.length; t--; ) this.o.set(e[t], this.u = [1, 0, this.u]);
  return n.children;
}, Bt.prototype.componentDidUpdate = Bt.prototype.componentDidMount = function() {
  var n = this;
  this.o.forEach(function(e, t) {
    Uo(n, t, e);
  });
};
var fs = typeof Symbol < "u" && Symbol.for && Symbol.for("react.element") || 60103, ms = /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/, gs = /^on(Ani|Tra|Tou|BeforeInp|Compo)/, vs = /[A-Z0-9]/g, _s = typeof document < "u", ys = function(n) {
  return (typeof Symbol < "u" && typeof Symbol() == "symbol" ? /fil|che|rad/ : /fil|che|ra/).test(n);
};
A.Component.prototype.isReactComponent = {}, ["componentWillMount", "componentWillReceiveProps", "componentWillUpdate"].forEach(function(n) {
  Object.defineProperty(A.Component.prototype, n, { configurable: !0, get: function() {
    return this["UNSAFE_" + n];
  }, set: function(e) {
    Object.defineProperty(this, n, { configurable: !0, writable: !0, value: e });
  } });
});
var Mo = A.options.event;
function bs() {
}
function ks() {
  return this.cancelBubble;
}
function ws() {
  return this.defaultPrevented;
}
A.options.event = function(n) {
  return Mo && (n = Mo(n)), n.persist = bs, n.isPropagationStopped = ks, n.isDefaultPrevented = ws, n.nativeEvent = n;
};
var Ho = { configurable: !0, get: function() {
  return this.class;
} }, Ro = A.options.vnode;
A.options.vnode = function(n) {
  var e = n.type, t = n.props, o = t;
  if (typeof e == "string") {
    for (var i in o = {}, t) {
      var s = t[i];
      if (!(i === "value" && "defaultValue" in t && s == null || _s && i === "children" && e === "noscript")) {
        var a = i.toLowerCase();
        i === "defaultValue" && "value" in t && t.value == null ? i = "value" : i === "download" && s === !0 ? s = "" : a === "ondoubleclick" ? i = "ondblclick" : a !== "onchange" || e !== "input" && e !== "textarea" || ys(t.type) ? a === "onfocus" ? i = "onfocusin" : a === "onblur" ? i = "onfocusout" : gs.test(i) ? i = a : e.indexOf("-") === -1 && ms.test(i) ? i = i.replace(vs, "-$&").toLowerCase() : s === null && (s = void 0) : a = i = "oninput", a === "oninput" && o[i = a] && (i = "oninputCapture"), o[i] = s;
      }
    }
    e == "select" && o.multiple && Array.isArray(o.value) && (o.value = (0, A.toChildArray)(t.children).forEach(function(c) {
      c.props.selected = o.value.indexOf(c.props.value) != -1;
    })), e == "select" && o.defaultValue != null && (o.value = (0, A.toChildArray)(t.children).forEach(function(c) {
      c.props.selected = o.multiple ? o.defaultValue.indexOf(c.props.value) != -1 : o.defaultValue == c.props.value;
    })), n.props = o, t.class != t.className && (Ho.enumerable = "className" in t, t.className != null && (o.class = t.className), Object.defineProperty(o, "className", Ho));
  }
  n.$$typeof = fs, Ro && Ro(n);
};
var Wo = A.options.__r;
A.options.__r = function(n) {
  Wo && Wo(n), n.__c;
};
var zo = A.options.diffed;
function gi(n) {
  const e = "==".slice(0, (4 - n.length % 4) % 4), t = n.replace(/-/g, "+").replace(/_/g, "/") + e, o = atob(t), i = new ArrayBuffer(o.length), s = new Uint8Array(i);
  for (let a = 0; a < o.length; a++) s[a] = o.charCodeAt(a);
  return i;
}
function vi(n) {
  const e = new Uint8Array(n);
  let t = "";
  for (const o of e) t += String.fromCharCode(o);
  return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
A.options.diffed = function(n) {
  zo && zo(n);
  var e = n.props, t = n.__e;
  t != null && n.type === "textarea" && "value" in e && e.value !== t.value && (t.value = e.value == null ? "" : e.value);
}, A.Fragment, _.useLayoutEffect, _.useState, _.useId, _.useReducer, _.useEffect, _.useLayoutEffect, _.useRef, _.useImperativeHandle, _.useMemo, _.useCallback, _.useContext, _.useDebugValue, A.createElement, A.createContext, A.createRef, A.Fragment, A.Component;
var ce = "copy", Ve = "convert";
function _t(n, e, t) {
  if (e === ce) return t;
  if (e === Ve) return n(t);
  if (e instanceof Array) return t.map((o) => _t(n, e[0], o));
  if (e instanceof Object) {
    const o = {};
    for (const [i, s] of Object.entries(e)) {
      if (s.derive) {
        const a = s.derive(t);
        a !== void 0 && (t[i] = a);
      }
      if (i in t) t[i] != null ? o[i] = _t(n, s.schema, t[i]) : o[i] = null;
      else if (s.required) throw new Error(`Missing key: ${i}`);
    }
    return o;
  }
}
function Vn(n, e) {
  return { required: !0, schema: n, derive: e };
}
function me(n) {
  return { required: !0, schema: n };
}
function Se(n) {
  return { required: !1, schema: n };
}
var _i = { type: me(ce), id: me(Ve), transports: Se(ce) }, yi = { appid: Se(ce), appidExclude: Se(ce), credProps: Se(ce) }, bi = { appid: Se(ce), appidExclude: Se(ce), credProps: Se(ce) }, xs = { publicKey: me({ rp: me(ce), user: me({ id: me(Ve), name: me(ce), displayName: me(ce) }), challenge: me(Ve), pubKeyCredParams: me(ce), timeout: Se(ce), excludeCredentials: Se([_i]), authenticatorSelection: Se(ce), attestation: Se(ce), extensions: Se(yi) }), signal: Se(ce) }, Ss = { type: me(ce), id: me(ce), rawId: me(Ve), authenticatorAttachment: Se(ce), response: me({ clientDataJSON: me(Ve), attestationObject: me(Ve), transports: Vn(ce, (n) => {
  var e;
  return ((e = n.getTransports) == null ? void 0 : e.call(n)) || [];
}) }), clientExtensionResults: Vn(bi, (n) => n.getClientExtensionResults()) }, Cs = { mediation: Se(ce), publicKey: me({ challenge: me(Ve), timeout: Se(ce), rpId: Se(ce), allowCredentials: Se([_i]), userVerification: Se(ce), extensions: Se(yi) }), signal: Se(ce) }, As = { type: me(ce), id: me(ce), rawId: me(Ve), authenticatorAttachment: Se(ce), response: me({ clientDataJSON: me(Ve), authenticatorData: me(Ve), signature: me(Ve), userHandle: me(Ve) }), clientExtensionResults: Vn(bi, (n) => n.getClientExtensionResults()) };
async function qo(n) {
  const e = await navigator.credentials.create(function(t) {
    return _t(gi, xs, t);
  }(n));
  return function(t) {
    return _t(vi, Ss, t);
  }(e);
}
async function Fo(n) {
  const e = await navigator.credentials.get(function(t) {
    return _t(gi, Cs, t);
  }(n));
  return function(t) {
    return _t(vi, As, t);
  }(e);
}
function _n() {
  return _n = Object.assign ? Object.assign.bind() : function(n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (n[o] = t[o]);
    }
    return n;
  }, _n.apply(this, arguments);
}
var Os = 0;
function ki(n) {
  return "__private_" + Os++ + "_" + n;
}
function Tn(n, e) {
  if (!Object.prototype.hasOwnProperty.call(n, e)) throw new TypeError("attempted to use private field on non-instance");
  return n;
}
class Ce extends Error {
  constructor(e, t, o) {
    super(e), this.code = void 0, this.cause = void 0, this.code = t, this.cause = o, Object.setPrototypeOf(this, Ce.prototype);
  }
}
class De extends Ce {
  constructor(e) {
    super("Technical error", "somethingWentWrong", e), Object.setPrototypeOf(this, De.prototype);
  }
}
class kn extends Ce {
  constructor(e, t) {
    super("Conflict error", "conflict", t), Object.setPrototypeOf(this, kn.prototype);
  }
}
class wn extends Ce {
  constructor(e) {
    super("Request timed out error", "requestTimeout", e), Object.setPrototypeOf(this, wn.prototype);
  }
}
class eo extends Ce {
  constructor(e) {
    super("Request cancelled error", "requestCancelled", e), Object.setPrototypeOf(this, eo.prototype);
  }
}
class to extends Ce {
  constructor(e) {
    super("Invalid password error", "invalidPassword", e), Object.setPrototypeOf(this, to.prototype);
  }
}
class no extends Ce {
  constructor(e) {
    super("Invalid Passcode error", "invalidPasscode", e), Object.setPrototypeOf(this, no.prototype);
  }
}
class oo extends Ce {
  constructor(e) {
    super("Invalid WebAuthn credential error", "invalidWebauthnCredential", e), Object.setPrototypeOf(this, oo.prototype);
  }
}
class io extends Ce {
  constructor(e) {
    super("Passcode expired error", "passcodeExpired", e), Object.setPrototypeOf(this, io.prototype);
  }
}
class so extends Ce {
  constructor(e) {
    super("Maximum number of Passcode attempts reached error", "passcodeAttemptsReached", e), Object.setPrototypeOf(this, so.prototype);
  }
}
class zt extends Ce {
  constructor(e) {
    super("Not found error", "notFound", e), Object.setPrototypeOf(this, zt.prototype);
  }
}
class ro extends Ce {
  constructor(e, t) {
    super("Too many requests error", "tooManyRequests", t), this.retryAfter = void 0, this.retryAfter = e, Object.setPrototypeOf(this, ro.prototype);
  }
}
class Ye extends Ce {
  constructor(e) {
    super("Unauthorized error", "unauthorized", e), Object.setPrototypeOf(this, Ye.prototype);
  }
}
class xn extends Ce {
  constructor(e) {
    super("Forbidden error", "forbidden", e), Object.setPrototypeOf(this, xn.prototype);
  }
}
class ao extends Ce {
  constructor(e) {
    super("User verification error", "userVerification", e), Object.setPrototypeOf(this, ao.prototype);
  }
}
class Sn extends Ce {
  constructor(e) {
    super("Maximum number of email addresses reached error", "maxNumOfEmailAddressesReached", e), Object.setPrototypeOf(this, Sn.prototype);
  }
}
class Cn extends Ce {
  constructor(e) {
    super("The email address already exists", "emailAddressAlreadyExistsError", e), Object.setPrototypeOf(this, Cn.prototype);
  }
}
class Je extends Ce {
  constructor(e, t) {
    super("An error occurred during third party sign up/sign in", e, t), Object.setPrototypeOf(this, Je.prototype);
  }
}
const lo = "hanko-session-created", co = "hanko-session-expired", uo = "hanko-user-logged-out", ho = "hanko-user-deleted";
class wi extends CustomEvent {
  constructor(e, t) {
    super(e, { detail: t });
  }
}
class xi {
  constructor() {
    this._dispatchEvent = document.dispatchEvent.bind(document);
  }
  dispatch(e, t) {
    this._dispatchEvent(new wi(e, t));
  }
  dispatchSessionCreatedEvent(e) {
    this.dispatch(lo, e);
  }
  dispatchSessionExpiredEvent() {
    this.dispatch(co, null);
  }
  dispatchUserLoggedOutEvent() {
    this.dispatch(uo, null);
  }
  dispatchUserDeletedEvent() {
    this.dispatch(ho, null);
  }
}
function Vt(n) {
  for (var e = 1; e < arguments.length; e++) {
    var t = arguments[e];
    for (var o in t) n[o] = t[o];
  }
  return n;
}
var Nn = function n(e, t) {
  function o(i, s, a) {
    if (typeof document < "u") {
      typeof (a = Vt({}, t, a)).expires == "number" && (a.expires = new Date(Date.now() + 864e5 * a.expires)), a.expires && (a.expires = a.expires.toUTCString()), i = encodeURIComponent(i).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
      var c = "";
      for (var d in a) a[d] && (c += "; " + d, a[d] !== !0 && (c += "=" + a[d].split(";")[0]));
      return document.cookie = i + "=" + e.write(s, i) + c;
    }
  }
  return Object.create({ set: o, get: function(i) {
    if (typeof document < "u" && (!arguments.length || i)) {
      for (var s = document.cookie ? document.cookie.split("; ") : [], a = {}, c = 0; c < s.length; c++) {
        var d = s[c].split("="), l = d.slice(1).join("=");
        try {
          var u = decodeURIComponent(d[0]);
          if (a[u] = e.read(l, u), i === u) break;
        } catch {
        }
      }
      return i ? a[i] : a;
    }
  }, remove: function(i, s) {
    o(i, "", Vt({}, s, { expires: -1 }));
  }, withAttributes: function(i) {
    return n(this.converter, Vt({}, this.attributes, i));
  }, withConverter: function(i) {
    return n(Vt({}, this.converter, i), this.attributes);
  } }, { attributes: { value: Object.freeze(t) }, converter: { value: Object.freeze(e) } });
}({ read: function(n) {
  return n[0] === '"' && (n = n.slice(1, -1)), n.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
}, write: function(n) {
  return encodeURIComponent(n).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent);
} }, { path: "/" });
class Ps {
  constructor(e) {
    var t;
    this.authCookieName = void 0, this.authCookieDomain = void 0, this.authCookieSameSite = void 0, this.authCookieName = e.cookieName, this.authCookieDomain = e.cookieDomain, this.authCookieSameSite = (t = e.cookieSameSite) != null ? t : "lax";
  }
  getAuthCookie() {
    return Nn.get(this.authCookieName);
  }
  setAuthCookie(e, t) {
    const o = { secure: !0, sameSite: this.authCookieSameSite };
    this.authCookieDomain !== void 0 && (o.domain = this.authCookieDomain);
    const i = _n({}, o, t);
    if ((i.sameSite === "none" || i.sameSite === "None") && i.secure === !1) throw new De(new Error("Secure attribute must be set when SameSite=None"));
    Nn.set(this.authCookieName, e, i);
  }
  removeAuthCookie() {
    Nn.remove(this.authCookieName);
  }
}
class Es {
  constructor(e) {
    this.keyName = void 0, this.keyName = e.keyName;
  }
  getSessionToken() {
    return sessionStorage.getItem(this.keyName);
  }
  setSessionToken(e) {
    sessionStorage.setItem(this.keyName, e);
  }
  removeSessionToken() {
    sessionStorage.removeItem(this.keyName);
  }
}
class Is {
  constructor(e) {
    this._xhr = void 0, this._xhr = e;
  }
  getResponseHeader(e) {
    return this._xhr.getResponseHeader(e);
  }
}
class js {
  constructor(e) {
    this.headers = void 0, this.ok = void 0, this.status = void 0, this.statusText = void 0, this.url = void 0, this._decodedJSON = void 0, this.xhr = void 0, this.headers = new Is(e), this.ok = e.status >= 200 && e.status <= 299, this.status = e.status, this.statusText = e.statusText, this.url = e.responseURL, this.xhr = e;
  }
  json() {
    return this._decodedJSON || (this._decodedJSON = JSON.parse(this.xhr.response)), this._decodedJSON;
  }
  parseNumericHeader(e) {
    const t = parseInt(this.headers.getResponseHeader(e), 10);
    return isNaN(t) ? 0 : t;
  }
}
class Ds {
  constructor(e, t) {
    this.timeout = void 0, this.api = void 0, this.dispatcher = void 0, this.cookie = void 0, this.sessionTokenStorage = void 0, this.lang = void 0, this.sessionTokenLocation = void 0, this.api = e, this.timeout = t.timeout, this.dispatcher = new xi(), this.cookie = new Ps(_n({}, t)), this.sessionTokenStorage = new Es({ keyName: t.cookieName }), this.lang = t.lang, this.sessionTokenLocation = t.sessionTokenLocation;
  }
  _fetch(e, t, o = new XMLHttpRequest()) {
    const i = this, s = this.api + e, a = this.timeout, c = this.getAuthToken(), d = this.lang;
    return new Promise(function(l, u) {
      o.open(t.method, s, !0), o.setRequestHeader("Accept", "application/json"), o.setRequestHeader("Content-Type", "application/json"), o.setRequestHeader("X-Language", d), c && o.setRequestHeader("Authorization", `Bearer ${c}`), o.timeout = a, o.withCredentials = !0, o.onload = () => {
        i.processHeaders(o), l(new js(o));
      }, o.onerror = () => {
        u(new De());
      }, o.ontimeout = () => {
        u(new wn());
      }, o.send(t.body ? t.body.toString() : null);
    });
  }
  _fetch_blocking(e, t, o = new XMLHttpRequest()) {
    const i = this.api + e, s = this.getAuthToken();
    return o.open(t.method, i, !1), o.setRequestHeader("Accept", "application/json"), o.setRequestHeader("Content-Type", "application/json"), s && o.setRequestHeader("Authorization", `Bearer ${s}`), o.withCredentials = !0, o.send(t.body ? t.body.toString() : null), o.responseText;
  }
  processHeaders(e) {
    let t = "", o = 0, i = "";
    if (e.getAllResponseHeaders().split(`\r
`).forEach((s) => {
      const a = s.toLowerCase();
      a.startsWith("x-auth-token") ? t = e.getResponseHeader("X-Auth-Token") : a.startsWith("x-session-lifetime") ? o = parseInt(e.getResponseHeader("X-Session-Lifetime"), 10) : a.startsWith("x-session-retention") && (i = e.getResponseHeader("X-Session-Retention"));
    }), t) {
      const s = new RegExp("^https://"), a = !!this.api.match(s) && !!window.location.href.match(s), c = i === "session" ? void 0 : new Date((/* @__PURE__ */ new Date()).getTime() + 1e3 * o);
      this.setAuthToken(t, { secure: a, expires: c });
    }
  }
  get(e) {
    return this._fetch(e, { method: "GET" });
  }
  post(e, t) {
    return this._fetch(e, { method: "POST", body: JSON.stringify(t) });
  }
  put(e, t) {
    return this._fetch(e, { method: "PUT", body: JSON.stringify(t) });
  }
  patch(e, t) {
    return this._fetch(e, { method: "PATCH", body: JSON.stringify(t) });
  }
  delete(e) {
    return this._fetch(e, { method: "DELETE" });
  }
  getAuthToken() {
    let e = "";
    switch (this.sessionTokenLocation) {
      case "cookie":
        e = this.cookie.getAuthCookie();
        break;
      case "sessionStorage":
        e = this.sessionTokenStorage.getSessionToken();
    }
    return e;
  }
  setAuthToken(e, t) {
    switch (this.sessionTokenLocation) {
      case "cookie":
        return this.cookie.setAuthCookie(e, t);
      case "sessionStorage":
        return this.sessionTokenStorage.setSessionToken(e);
    }
  }
}
class lt {
  constructor(e, t) {
    this.client = void 0, this.client = new Ds(e, t);
  }
}
class Si extends lt {
  getDomain(e) {
    if (!e) throw new Je("somethingWentWrong", new Error("email missing from request"));
    const t = e.split("@");
    if (t.length !== 2) throw new Je("somethingWentWrong", new Error("email is not in a valid email format."));
    const o = t[1].trim();
    if (o === "") throw new Je("somethingWentWrong", new Error("email is not in a valid email format."));
    return o;
  }
  async hasProvider(e) {
    const t = this.getDomain(e);
    return this.client.get(`/saml/provider?domain=${t}`).then((o) => {
      if (o.status == 404) throw new zt(new Error("provider not found"));
      if (!o.ok) throw new De(new Error("unable to fetch provider"));
      return o.ok;
    });
  }
  auth(e, t) {
    const o = new URL("/saml/auth", this.client.api), i = this.getDomain(e);
    if (!t) throw new Je("somethingWentWrong", new Error("redirectTo missing from request"));
    o.searchParams.append("domain", i), o.searchParams.append("redirect_to", t), window.location.assign(o.href);
  }
  getError() {
    const e = new URLSearchParams(window.location.search), t = e.get("error"), o = e.get("error_description");
    if (t) {
      let i;
      switch (t) {
        case "access_denied":
          i = "enterpriseAccessDenied";
          break;
        case "user_conflict":
          i = "emailAddressAlreadyExistsError";
          break;
        case "multiple_accounts":
          i = "enterpriseMultipleAccounts";
          break;
        case "unverified_email":
          i = "enterpriseUnverifiedEmail";
          break;
        case "email_maxnum":
          i = "maxNumOfEmailAddressesReached";
          break;
        default:
          i = "somethingWentWrong";
      }
      return new Je(i, new Error(o));
    }
  }
}
class Ci extends lt {
  async getInfo(e) {
    const t = await this.client.post("/user", { email: e });
    if (t.status === 404) throw new zt();
    if (!t.ok) throw new De();
    return t.json();
  }
  async create(e) {
    const t = await this.client.post("/users", { email: e });
    if (t.status === 409) throw new kn();
    if (t.status === 403) throw new xn();
    if (!t.ok) throw new De();
    return t.json();
  }
  async getCurrent() {
    const e = await this.client.get("/me");
    if (e.status === 401) throw this.client.dispatcher.dispatchSessionExpiredEvent(), new Ye();
    if (!e.ok) throw new De();
    const t = e.json(), o = await this.client.get(`/users/${t.id}`);
    if (o.status === 401) throw this.client.dispatcher.dispatchSessionExpiredEvent(), new Ye();
    if (!o.ok) throw new De();
    return o.json();
  }
  async delete() {
    const e = await this.client.delete("/user");
    if (e.ok) return this.client.sessionTokenStorage.removeSessionToken(), this.client.cookie.removeAuthCookie(), void this.client.dispatcher.dispatchUserDeletedEvent();
    throw e.status === 401 ? (this.client.dispatcher.dispatchSessionExpiredEvent(), new Ye()) : new De();
  }
  async logout() {
    const e = await this.client.post("/logout");
    if (this.client.sessionTokenStorage.removeSessionToken(), this.client.cookie.removeAuthCookie(), this.client.dispatcher.dispatchUserLoggedOutEvent(), e.status !== 401 && !e.ok) throw new De();
  }
}
class Ai extends lt {
  async list() {
    const e = await this.client.get("/emails");
    if (e.status === 401) throw this.client.dispatcher.dispatchSessionExpiredEvent(), new Ye();
    if (!e.ok) throw new De();
    return e.json();
  }
  async create(e) {
    const t = await this.client.post("/emails", { address: e });
    if (t.ok) return t.json();
    throw t.status === 400 ? new Cn() : t.status === 401 ? (this.client.dispatcher.dispatchSessionExpiredEvent(), new Ye()) : t.status === 409 ? new Sn() : new De();
  }
  async setPrimaryEmail(e) {
    const t = await this.client.post(`/emails/${e}/set_primary`);
    if (t.status === 401) throw this.client.dispatcher.dispatchSessionExpiredEvent(), new Ye();
    if (!t.ok) throw new De();
  }
  async delete(e) {
    const t = await this.client.delete(`/emails/${e}`);
    if (t.status === 401) throw this.client.dispatcher.dispatchSessionExpiredEvent(), new Ye();
    if (!t.ok) throw new De();
  }
}
class Oi extends lt {
  async auth(e, t) {
    const o = new URL("/thirdparty/auth", this.client.api);
    if (!e) throw new Je("somethingWentWrong", new Error("provider missing from request"));
    if (!t) throw new Je("somethingWentWrong", new Error("redirectTo missing from request"));
    o.searchParams.append("provider", e), o.searchParams.append("redirect_to", t), window.location.assign(o.href);
  }
  getError() {
    const e = new URLSearchParams(window.location.search), t = e.get("error"), o = e.get("error_description");
    if (t) {
      let i = "";
      switch (t) {
        case "access_denied":
          i = "thirdPartyAccessDenied";
          break;
        case "user_conflict":
          i = "emailAddressAlreadyExistsError";
          break;
        case "multiple_accounts":
          i = "thirdPartyMultipleAccounts";
          break;
        case "unverified_email":
          i = "thirdPartyUnverifiedEmail";
          break;
        case "email_maxnum":
          i = "maxNumOfEmailAddressesReached";
          break;
        case "signup_disabled":
          i = "signupDisabled";
          break;
        default:
          i = "somethingWentWrong";
      }
      return new Je(i, new Error(o));
    }
  }
}
class Pi extends lt {
  async validate() {
    const e = new URLSearchParams(window.location.search).get("hanko_token");
    if (!e) return;
    window.history.replaceState(null, null, window.location.pathname);
    const t = await this.client.post("/token", { value: e });
    if (!t.ok) throw new De();
    return t.json();
  }
}
class $s {
  static throttle(e, t, o = {}) {
    const { leading: i = !0, trailing: s = !0 } = o;
    let a, c, d, l = 0;
    const u = () => {
      l = i === !1 ? 0 : Date.now(), d = null, e.apply(a, c);
    };
    return function(...h) {
      const g = Date.now();
      l || i !== !1 || (l = g);
      const f = t - (g - l);
      a = this, c = h, f <= 0 || f > t ? (d && (window.clearTimeout(d), d = null), l = g, e.apply(a, c)) : d || s === !1 || (d = window.setTimeout(u, f));
    };
  }
}
class An {
  constructor() {
    this.throttleLimit = 1e3, this._addEventListener = document.addEventListener.bind(document), this._removeEventListener = document.removeEventListener.bind(document), this._throttle = $s.throttle;
  }
  wrapCallback(e, t) {
    const o = (i) => {
      e(i.detail);
    };
    return t ? this._throttle(o, this.throttleLimit, { leading: !0, trailing: !1 }) : o;
  }
  addEventListenerWithType({ type: e, callback: t, once: o = !1, throttle: i = !1 }) {
    const s = this.wrapCallback(t, i);
    return this._addEventListener(e, s, { once: o }), () => this._removeEventListener(e, s);
  }
  static mapAddEventListenerParams(e, { once: t, callback: o }, i) {
    return { type: e, callback: o, once: t, throttle: i };
  }
  addEventListener(e, t, o) {
    return this.addEventListenerWithType(An.mapAddEventListenerParams(e, t, o));
  }
  onSessionCreated(e, t) {
    return this.addEventListener(lo, { callback: e, once: t }, !0);
  }
  onSessionExpired(e, t) {
    return this.addEventListener(co, { callback: e, once: t }, !0);
  }
  onUserLoggedOut(e, t) {
    return this.addEventListener(uo, { callback: e, once: t });
  }
  onUserDeleted(e, t) {
    return this.addEventListener(ho, { callback: e, once: t });
  }
}
class po extends lt {
  async validate() {
    const e = await this.client.get("/sessions/validate");
    if (!e.ok) throw new De();
    return await e.json();
  }
}
class Ls extends lt {
  isValid() {
    let e;
    try {
      const t = this.client._fetch_blocking("/sessions/validate", { method: "GET" });
      e = JSON.parse(t);
    } catch (t) {
      throw new De(t);
    }
    return !!e && e.is_valid;
  }
}
class Ts {
  constructor(e) {
    this.storageKey = void 0, this.defaultState = { expiration: 0, lastCheck: 0 }, this.storageKey = e;
  }
  load() {
    const e = window.localStorage.getItem(this.storageKey);
    return e == null ? this.defaultState : JSON.parse(e);
  }
  save(e) {
    window.localStorage.setItem(this.storageKey, JSON.stringify(e || this.defaultState));
  }
}
class Ns {
  constructor(e, t) {
    this.onActivityCallback = void 0, this.onInactivityCallback = void 0, this.handleFocus = () => {
      this.onActivityCallback();
    }, this.handleBlur = () => {
      this.onInactivityCallback();
    }, this.handleVisibilityChange = () => {
      document.visibilityState === "visible" ? this.onActivityCallback() : this.onInactivityCallback();
    }, this.hasFocus = () => document.hasFocus(), this.onActivityCallback = e, this.onInactivityCallback = t, window.addEventListener("focus", this.handleFocus), window.addEventListener("blur", this.handleBlur), document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }
}
class Us {
  constructor(e, t, o) {
    this.intervalID = null, this.timeoutID = null, this.checkInterval = void 0, this.checkSession = void 0, this.onSessionExpired = void 0, this.checkInterval = e, this.checkSession = t, this.onSessionExpired = o;
  }
  scheduleSessionExpiry(e) {
    var t = this;
    this.stop(), this.timeoutID = setTimeout(async function() {
      t.stop(), t.onSessionExpired();
    }, e);
  }
  start(e = 0, t = 0) {
    var o = this;
    const i = this.calcTimeToNextCheck(e);
    this.sessionExpiresSoon(t) ? this.scheduleSessionExpiry(i) : this.timeoutID = setTimeout(async function() {
      let s = await o.checkSession();
      if (s.is_valid) {
        if (o.sessionExpiresSoon(s.expiration)) return void o.scheduleSessionExpiry(s.expiration - Date.now());
        o.intervalID = setInterval(async function() {
          s = await o.checkSession(), s.is_valid ? o.sessionExpiresSoon(s.expiration) && o.scheduleSessionExpiry(s.expiration - Date.now()) : o.stop();
        }, o.checkInterval);
      } else o.stop();
    }, i);
  }
  stop() {
    this.timeoutID && (clearTimeout(this.timeoutID), this.timeoutID = null), this.intervalID && (clearInterval(this.intervalID), this.intervalID = null);
  }
  isRunning() {
    return this.timeoutID !== null || this.intervalID !== null;
  }
  sessionExpiresSoon(e) {
    return e > 0 && e - Date.now() <= this.checkInterval;
  }
  calcTimeToNextCheck(e) {
    const t = Date.now() - e;
    return this.checkInterval >= t ? this.checkInterval - t % this.checkInterval : 0;
  }
}
class Ms {
  constructor(e = "hanko_session", t, o, i) {
    this.channel = void 0, this.onSessionExpired = void 0, this.onSessionCreated = void 0, this.onLeadershipRequested = void 0, this.handleMessage = (s) => {
      const a = s.data;
      switch (a.action) {
        case "sessionExpired":
          this.onSessionExpired(a);
          break;
        case "sessionCreated":
          this.onSessionCreated(a);
          break;
        case "requestLeadership":
          this.onLeadershipRequested(a);
      }
    }, this.onSessionExpired = t, this.onSessionCreated = o, this.onLeadershipRequested = i, this.channel = new BroadcastChannel(e), this.channel.onmessage = this.handleMessage;
  }
  post(e) {
    this.channel.postMessage(e);
  }
}
class Hs extends xi {
  constructor(e, t) {
    super(), this.listener = new An(), this.checkInterval = 3e4, this.client = void 0, this.sessionState = void 0, this.windowActivityManager = void 0, this.scheduler = void 0, this.sessionChannel = void 0, this.isLoggedIn = void 0, this.client = new po(e, t), this.checkInterval = t.sessionCheckInterval, this.sessionState = new Ts(`${t.cookieName}_session_state`), this.sessionChannel = new Ms(this.getSessionCheckChannelName(t.sessionTokenLocation, t.sessionCheckChannelName), () => this.onChannelSessionExpired(), (s) => this.onChannelSessionCreated(s), () => this.onChannelLeadershipRequested()), this.scheduler = new Us(this.checkInterval, () => this.checkSession(), () => this.onSessionExpired()), this.windowActivityManager = new Ns(() => this.startSessionCheck(), () => this.scheduler.stop());
    const o = Date.now(), { expiration: i } = this.sessionState.load();
    this.isLoggedIn = o < i, this.initializeEventListeners(), this.startSessionCheck();
  }
  initializeEventListeners() {
    this.listener.onSessionCreated((e) => {
      const { claims: t } = e, o = Date.parse(t.expiration), i = Date.now();
      this.isLoggedIn = !0, this.sessionState.save({ expiration: o, lastCheck: i }), this.sessionChannel.post({ action: "sessionCreated", claims: t }), this.startSessionCheck();
    }), this.listener.onUserLoggedOut(() => {
      this.isLoggedIn = !1, this.sessionChannel.post({ action: "sessionExpired" }), this.sessionState.save(null), this.scheduler.stop();
    }), window.addEventListener("beforeunload", () => this.scheduler.stop());
  }
  startSessionCheck() {
    if (!this.windowActivityManager.hasFocus() || (this.sessionChannel.post({ action: "requestLeadership" }), this.scheduler.isRunning())) return;
    const { lastCheck: e, expiration: t } = this.sessionState.load();
    this.isLoggedIn && this.scheduler.start(e, t);
  }
  async checkSession() {
    const e = Date.now(), { is_valid: t, claims: o, expiration_time: i } = await this.client.validate(), s = i ? Date.parse(i) : 0;
    return !t && this.isLoggedIn && this.dispatchSessionExpiredEvent(), t ? (this.isLoggedIn = !0, this.sessionState.save({ lastCheck: e, expiration: s })) : (this.isLoggedIn = !1, this.sessionState.save(null), this.sessionChannel.post({ action: "sessionExpired" })), { is_valid: t, claims: o, expiration: s };
  }
  onSessionExpired() {
    this.isLoggedIn && (this.isLoggedIn = !1, this.sessionState.save(null), this.sessionChannel.post({ action: "sessionExpired" }), this.dispatchSessionExpiredEvent());
  }
  onChannelSessionExpired() {
    this.isLoggedIn && (this.isLoggedIn = !1, this.dispatchSessionExpiredEvent());
  }
  onChannelSessionCreated(e) {
    const { claims: t } = e, o = Date.now(), i = Date.parse(t.expiration) - o;
    this.isLoggedIn = !0, this.dispatchSessionCreatedEvent({ claims: t, expirationSeconds: i });
  }
  onChannelLeadershipRequested() {
    this.windowActivityManager.hasFocus() || this.scheduler.stop();
  }
  getSessionCheckChannelName(e, t) {
    if (e == "cookie") return t;
    let o = sessionStorage.getItem("sessionCheckChannelName");
    return o != null && o !== "" || (o = `${t}-${Math.floor(100 * Math.random()) + 1}`, sessionStorage.setItem("sessionCheckChannelName", o)), o;
  }
}
var ft, bt = ki("actionDefinitions"), Un = ki("createActionsProxy");
class Mn {
  toJSON() {
    return { name: this.name, payload: this.payload, error: this.error, status: this.status, csrf_token: this.csrf_token, actions: Tn(this, bt)[bt] };
  }
  constructor({ name: e, payload: t, error: o, status: i, actions: s, csrf_token: a }, c) {
    Object.defineProperty(this, Un, { value: Rs }), this.name = void 0, this.payload = void 0, this.error = void 0, this.status = void 0, this.csrf_token = void 0, Object.defineProperty(this, bt, { writable: !0, value: void 0 }), this.actions = void 0, this.fetchNextState = void 0, this.name = e, this.payload = t, this.error = o, this.status = i, this.csrf_token = a, Tn(this, bt)[bt] = s, this.actions = Tn(this, Un)[Un](s, a), this.fetchNextState = c;
  }
  runAction(e, t) {
    const o = {};
    if ("inputs" in e && typeof e.inputs == "object" && e.inputs !== null) {
      const i = e.inputs;
      for (const s in e.inputs) {
        const a = i[s];
        a && "value" in a && (o[s] = a.value);
      }
    }
    return this.fetchNextState(e.href, { input_data: o, csrf_token: t });
  }
  validateAction(e) {
    if ("inputs" in e) for (const t in e.inputs) {
      let i = function(a, c, d, l) {
        throw new Ei({ reason: a, inputName: t, wanted: d, actual: l, message: c });
      };
      const o = e.inputs[t], s = o.value;
      o.required && !s && i(ft.Required, "is required"), (o.min_length != null || o.max_length != null) && ("length" in s || i(ft.InvalidInputDefinition, 'has min/max length requirement, but is missing "length" property', "string", typeof s), o.min_length != null && s < o.min_length && i(ft.MinLength, `too short (min ${o.min_length})`, o.min_length, s.length), o.max_length != null && s > o.max_length && i(ft.MaxLength, `too long (max ${o.max_length})`, o.max_length, s.length));
    }
  }
}
function Rs(n, e) {
  const t = (i) => this.runAction(i, e), o = (i) => this.validateAction(i);
  return new Proxy(n, { get(i, s) {
    if (typeof s == "symbol") return i[s];
    const a = i[s];
    return a == null ? null : (c) => {
      const d = Object.assign(JSON.parse(JSON.stringify(a)), { validate: () => (o(d), d), tryValidate() {
        try {
          o(d);
        } catch (l) {
          if (l instanceof Ei) return l;
          throw l;
        }
      }, run: () => t(d) });
      if (d !== null && typeof d == "object" && "inputs" in d) for (const l in c) {
        const u = d.inputs;
        u[l] || (u[l] = { name: l, type: "" }), u[l].value = c[l];
      }
      return d;
    };
  } });
}
(function(n) {
  n[n.InvalidInputDefinition = 0] = "InvalidInputDefinition", n[n.MinLength = 1] = "MinLength", n[n.MaxLength = 2] = "MaxLength", n[n.Required = 3] = "Required";
})(ft || (ft = {}));
class Ei extends Error {
  constructor(e) {
    super(`"${e.inputName}" ${e.message}`), this.reason = void 0, this.inputName = void 0, this.wanted = void 0, this.actual = void 0, this.name = "ValidationError", this.reason = e.reason, this.inputName = e.inputName, this.wanted = e.wanted, this.actual = e.actual;
  }
}
function Ko(n) {
  return typeof n == "object" && n !== null && "status" in n && "error" in n && "name" in n && !!n.name && !!n.status;
}
class Ws extends lt {
  constructor(...e) {
    var t;
    super(...e), t = this, this.run = async function(o, i) {
      try {
        if (!Ko(o)) throw new zs(o);
        const a = i[o.name];
        if (!a) throw new fo(o);
        let c = await a(o);
        if (typeof (s = c) == "object" && s !== null && "href" in s && "inputs" in s && (c = await c.run()), Ko(c)) return t.run(c, i);
      } catch (a) {
        if (typeof i.onError == "function") return i.onError(a);
      }
      var s;
    };
  }
  async init(e, t) {
    var o = this;
    const i = await async function s(a, c) {
      try {
        const d = await o.client.post(a, c);
        return new Mn(d.json(), s);
      } catch (d) {
        t.onError == null || t.onError(d);
      }
    }(e);
    await this.run(i, t);
  }
  async fromString(e, t) {
    var o = this;
    const i = new Mn(JSON.parse(e), async function s(a, c) {
      try {
        const d = await o.client.post(a, c);
        return new Mn(d.json(), s);
      } catch (d) {
        t.onError == null || t.onError(d);
      }
    });
    await this.run(i, t);
  }
}
class fo extends Ce {
  constructor(e) {
    super("No handler found for state: " + (typeof e.name == "string" ? `"${e.name}"` : `(${typeof e.name})`), "handlerNotFoundError"), this.state = void 0, this.state = e, Object.setPrototypeOf(this, fo.prototype);
  }
}
class zs extends Error {
  constructor(e) {
    super("Invalid state: " + (typeof e.name == "string" ? `"${e.name}"` : `(${typeof e.name})`)), this.state = void 0, this.state = e;
  }
}
class Ii extends An {
  constructor(e, t) {
    super(), this.api = void 0, this.user = void 0, this.email = void 0, this.thirdParty = void 0, this.enterprise = void 0, this.token = void 0, this.sessionClient = void 0, this.session = void 0, this.relay = void 0, this.flow = void 0;
    const o = { timeout: 13e3, cookieName: "hanko", localStorageKey: "hanko", sessionCheckInterval: 3e4, sessionCheckChannelName: "hanko-session-check", sessionTokenLocation: "cookie" };
    (t == null ? void 0 : t.cookieName) !== void 0 && (o.cookieName = t.cookieName), (t == null ? void 0 : t.timeout) !== void 0 && (o.timeout = t.timeout), (t == null ? void 0 : t.localStorageKey) !== void 0 && (o.localStorageKey = t.localStorageKey), (t == null ? void 0 : t.cookieDomain) !== void 0 && (o.cookieDomain = t.cookieDomain), (t == null ? void 0 : t.cookieSameSite) !== void 0 && (o.cookieSameSite = t.cookieSameSite), (t == null ? void 0 : t.lang) !== void 0 && (o.lang = t.lang), (t == null ? void 0 : t.sessionCheckInterval) !== void 0 && (o.sessionCheckInterval = t.sessionCheckInterval < 3e3 ? 3e3 : t.sessionCheckInterval), (t == null ? void 0 : t.sessionCheckChannelName) !== void 0 && (o.sessionCheckChannelName = t.sessionCheckChannelName), (t == null ? void 0 : t.sessionTokenLocation) !== void 0 && (o.sessionTokenLocation = t.sessionTokenLocation), this.api = e, this.user = new Ci(e, o), this.email = new Ai(e, o), this.thirdParty = new Oi(e, o), this.enterprise = new Si(e, o), this.token = new Pi(e, o), this.sessionClient = new po(e, o), this.session = new Ls(e, o), this.relay = new Hs(e, o), this.flow = new Ws(e, o);
  }
  setLang(e) {
    this.flow.client.lang = e;
  }
}
class mt {
  static supported() {
    return !!(navigator.credentials && navigator.credentials.create && navigator.credentials.get && window.PublicKeyCredential);
  }
  static async isPlatformAuthenticatorAvailable() {
    return !(!this.supported() || !window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) && window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  }
  static async isSecurityKeySupported() {
    return window.PublicKeyCredential !== void 0 && window.PublicKeyCredential.isExternalCTAP2SecurityKeySupported ? window.PublicKeyCredential.isExternalCTAP2SecurityKeySupported() : this.supported();
  }
  static async isConditionalMediationAvailable() {
    return !(!window.PublicKeyCredential || !window.PublicKeyCredential.isConditionalMediationAvailable) && window.PublicKeyCredential.isConditionalMediationAvailable();
  }
}
var qs = Y(292), Xe = Y.n(qs), Fs = Y(360), et = Y.n(Fs), Ks = Y(884), tt = Y.n(Ks), Bs = Y(88), nt = Y.n(Bs), sn = Y(914), kt = {};
kt.setAttributes = tt(), kt.insert = (n) => {
  window._hankoStyle = n;
}, kt.domAPI = et(), kt.insertStyleElement = nt(), Xe()(sn.A, kt);
const Rt = sn.A && sn.A.locals ? sn.A.locals : void 0, Vs = function(n) {
  function e(t) {
    var o = hi({}, t);
    return delete o.ref, n(o, t.ref || null);
  }
  return e.$$typeof = hs, e.render = e, e.prototype.isReactComponent = e.__f = !0, e.displayName = "ForwardRef(" + (n.displayName || n.name) + ")", e;
}((n, e) => {
  const { lang: t, hanko: o, setHanko: i } = (0, _.useContext)(ue), { setLang: s } = (0, _.useContext)(Z.TranslateContext);
  return (0, _.useEffect)(() => {
    s(t.replace(/[-]/, "")), i((a) => (a.setLang(t), a));
  }, [o, t, i, s]), r("section", Object.assign({ part: "container", className: Rt.container, ref: e }, { children: n.children }));
});
var rn = Y(697), wt = {};
wt.setAttributes = tt(), wt.insert = (n) => {
  window._hankoStyle = n;
}, wt.domAPI = et(), wt.insertStyleElement = nt(), Xe()(rn.A, wt);
const $ = rn.A && rn.A.locals ? rn.A.locals : void 0;
var Zs = Y(633), Q = Y.n(Zs);
const Js = ({ size: n, secondary: e, disabled: t }) => r("svg", Object.assign({ id: "icon-apple", xmlns: "http://www.w3.org/2000/svg", width: n, height: n, viewBox: "20.5 16 15 19", className: Q()($.icon, e && $.secondary, t && $.disabled) }, { children: r("path", { d: "M28.2226562,20.3846154 C29.0546875,20.3846154 30.0976562,19.8048315 30.71875,19.0317864 C31.28125,18.3312142 31.6914062,17.352829 31.6914062,16.3744437 C31.6914062,16.2415766 31.6796875,16.1087095 31.65625,16 C30.7304687,16.0362365 29.6171875,16.640178 28.9492187,17.4494596 C28.421875,18.06548 27.9414062,19.0317864 27.9414062,20.0222505 C27.9414062,20.1671964 27.9648438,20.3121424 27.9765625,20.3604577 C28.0351562,20.3725366 28.1289062,20.3846154 28.2226562,20.3846154 Z M25.2929688,35 C26.4296875,35 26.9335938,34.214876 28.3515625,34.214876 C29.7929688,34.214876 30.109375,34.9758423 31.375,34.9758423 C32.6171875,34.9758423 33.4492188,33.792117 34.234375,32.6325493 C35.1132812,31.3038779 35.4765625,29.9993643 35.5,29.9389701 C35.4179688,29.9148125 33.0390625,28.9122695 33.0390625,26.0979021 C33.0390625,23.6579784 34.9140625,22.5588048 35.0195312,22.474253 C33.7773438,20.6382708 31.890625,20.5899555 31.375,20.5899555 C29.9804688,20.5899555 28.84375,21.4596313 28.1289062,21.4596313 C27.3554688,21.4596313 26.3359375,20.6382708 25.1289062,20.6382708 C22.8320312,20.6382708 20.5,22.5950413 20.5,26.2911634 C20.5,28.5861411 21.3671875,31.013986 22.4335938,32.5842339 C23.3476562,33.9129053 24.1445312,35 25.2929688,35 Z" }) })), Qs = ({ secondary: n, size: e, fadeOut: t, disabled: o }) => r("svg", Object.assign({ id: "icon-checkmark", xmlns: "http://www.w3.org/2000/svg", viewBox: "4 4 40 40", width: e, height: e, className: Q()($.checkmark, n && $.secondary, t && $.fadeOut, o && $.disabled) }, { children: r("path", { d: "M21.05 33.1 35.2 18.95l-2.3-2.25-11.85 11.85-6-6-2.25 2.25ZM24 44q-4.1 0-7.75-1.575-3.65-1.575-6.375-4.3-2.725-2.725-4.3-6.375Q4 28.1 4 24q0-4.15 1.575-7.8 1.575-3.65 4.3-6.35 2.725-2.7 6.375-4.275Q19.9 4 24 4q4.15 0 7.8 1.575 3.65 1.575 6.35 4.275 2.7 2.7 4.275 6.35Q44 19.85 44 24q0 4.1-1.575 7.75-1.575 3.65-4.275 6.375t-6.35 4.3Q28.15 44 24 44Zm0-3q7.1 0 12.05-4.975Q41 31.05 41 24q0-7.1-4.95-12.05Q31.1 7 24 7q-7.05 0-12.025 4.95Q7 16.9 7 24q0 7.05 4.975 12.025Q16.95 41 24 41Zm0-17Z" }) })), Gs = ({ size: n, secondary: e, disabled: t }) => r("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", viewBox: "0 -960 960 960", width: n, height: n, className: Q()($.icon, e && $.secondary, t && $.disabled) }, { children: r("path", { d: "M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" }) })), Ys = ({ size: n, secondary: e, disabled: t }) => r("svg", Object.assign({ id: "icon-custom-provider", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: n, height: n, className: Q()($.icon, e && $.secondary, t && $.disabled) }, { children: [r("path", { d: "M0 0h24v24H0z", fill: "none" }), r("path", { d: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" })] })), Xs = ({ size: n, secondary: e, disabled: t }) => r("svg", Object.assign({ id: "icon-discord", fill: "#fff", xmlns: "http://www.w3.org/2000/svg", width: n, height: n, viewBox: "0 0 127.14 96.36", className: Q()($.icon, e && $.secondary, t && $.disabled) }, { children: r("path", { d: "M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" }) })), er = ({ size: n, secondary: e, disabled: t }) => r("svg", Object.assign({ id: "icon-exclamation", xmlns: "http://www.w3.org/2000/svg", viewBox: "5 2 13 20", width: n, height: n, className: Q()($.exclamationMark, e && $.secondary, t && $.disabled) }, { children: r("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" }) })), tr = ({ size: n, secondary: e, disabled: t }) => r("svg", Object.assign({ width: n, height: n, viewBox: "0 0 666.66668 666.66717", xmlns: "http://www.w3.org/2000/svg" }, { children: [r("defs", Object.assign({ id: "defs13" }, { children: r("clipPath", Object.assign({ clipPathUnits: "userSpaceOnUse", id: "clipPath25" }, { children: r("path", { d: "M 0,700 H 700 V 0 H 0 Z", id: "path23" }) })) })), r("g", Object.assign({ id: "g17", transform: "matrix(1.3333333,0,0,-1.3333333,-133.33333,799.99999)" }, { children: r("g", Object.assign({ id: "g19" }, { children: r("g", Object.assign({ id: "g21", clipPath: "url(#clipPath25)" }, { children: [r("g", Object.assign({ id: "g27", transform: "translate(600,350)" }, { children: r("path", { className: Q()($.facebookIcon, t ? $.disabledOutline : $.outline), d: "m 0,0 c 0,138.071 -111.929,250 -250,250 -138.071,0 -250,-111.929 -250,-250 0,-117.245 80.715,-215.622 189.606,-242.638 v 166.242 h -51.552 V 0 h 51.552 v 32.919 c 0,85.092 38.508,124.532 122.048,124.532 15.838,0 43.167,-3.105 54.347,-6.211 V 81.986 c -5.901,0.621 -16.149,0.932 -28.882,0.932 -40.993,0 -56.832,-15.528 -56.832,-55.9 V 0 h 81.659 l -14.028,-76.396 h -67.631 V -248.169 C -95.927,-233.218 0,-127.818 0,0", id: "path29" }) })), r("g", Object.assign({ id: "g31", transform: "translate(447.9175,273.6036)" }, { children: r("path", { className: Q()($.facebookIcon, t ? $.disabledLetter : $.letter), d: "M 0,0 14.029,76.396 H -67.63 v 27.019 c 0,40.372 15.838,55.899 56.831,55.899 12.733,0 22.981,-0.31 28.882,-0.931 v 69.253 c -11.18,3.106 -38.509,6.212 -54.347,6.212 -83.539,0 -122.048,-39.441 -122.048,-124.533 V 76.396 h -51.552 V 0 h 51.552 v -166.242 c 19.343,-4.798 39.568,-7.362 60.394,-7.362 10.254,0 20.358,0.632 30.288,1.831 L -67.63,0 Z", id: "path33" }) }))] })) })) }))] })), nr = ({ size: n, secondary: e, disabled: t }) => r("svg", Object.assign({ id: "icon-github", xmlns: "http://www.w3.org/2000/svg", fill: "#fff", viewBox: "0 0 97.63 96", width: n, height: n, className: Q()($.icon, e && $.secondary, t && $.disabled) }, { children: [r("path", { d: "M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" }), " "] })), or = ({ size: n, disabled: e }) => r("svg", Object.assign({ id: "icon-google", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: n, height: n, className: $.googleIcon }, { children: [r("path", { className: Q()($.googleIcon, e ? $.disabled : $.blue), d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }), r("path", { className: Q()($.googleIcon, e ? $.disabled : $.green), d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), r("path", { className: Q()($.googleIcon, e ? $.disabled : $.yellow), d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }), r("path", { className: Q()($.googleIcon, e ? $.disabled : $.red), d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" }), r("path", { d: "M1 1h22v22H1z", fill: "none" })] })), ir = ({ size: n, secondary: e, disabled: t }) => r("svg", Object.assign({ id: "icon-linkedin", fill: "#fff", xmlns: "http://www.w3.org/2000/svg", width: n, viewBox: "0 0 24 24", height: n, className: Q()($.icon, e && $.secondary, t && $.disabled) }, { children: r("path", { d: "M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" }) })), sr = ({ size: n, secondary: e, disabled: t }) => r("svg", Object.assign({ id: "icon-mail", xmlns: "http://www.w3.org/2000/svg", width: n, height: n, viewBox: "0 -960 960 960", className: Q()($.icon, e && $.secondary, t && $.disabled) }, { children: r("path", { d: "M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" }) })), rr = ({ size: n, disabled: e }) => r("svg", Object.assign({ id: "icon-microsoft", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: n, height: n, className: $.microsoftIcon }, { children: [r("rect", { className: Q()($.microsoftIcon, e ? $.disabled : $.blue), x: "1", y: "1", width: "9", height: "9" }), r("rect", { className: Q()($.microsoftIcon, e ? $.disabled : $.green), x: "1", y: "11", width: "9", height: "9" }), r("rect", { className: Q()($.microsoftIcon, e ? $.disabled : $.yellow), x: "11", y: "1", width: "9", height: "9" }), r("rect", { className: Q()($.microsoftIcon, e ? $.disabled : $.red), x: "11", y: "11", width: "9", height: "9" })] })), ar = ({ size: n, secondary: e, disabled: t }) => r("svg", Object.assign({ id: "icon-passkey", xmlns: "http://www.w3.org/2000/svg", viewBox: "3 1.5 19.5 19", width: n, height: n, className: Q()($.icon, e && $.secondary, t && $.disabled) }, { children: r("g", Object.assign({ id: "icon-passkey-all" }, { children: [r("circle", { id: "icon-passkey-head", cx: "10.5", cy: "6", r: "4.5" }), r("path", { id: "icon-passkey-key", d: "M22.5,10.5a3.5,3.5,0,1,0-5,3.15V19L19,20.5,21.5,18,20,16.5,21.5,15l-1.24-1.24A3.5,3.5,0,0,0,22.5,10.5Zm-3.5,0a1,1,0,1,1,1-1A1,1,0,0,1,19,10.5Z" }), r("path", { id: "icon-passkey-body", d: "M14.44,12.52A6,6,0,0,0,12,12H9a6,6,0,0,0-6,6v2H16V14.49A5.16,5.16,0,0,1,14.44,12.52Z" })] })) })), lr = ({ size: n, secondary: e, disabled: t }) => r("svg", Object.assign({ id: "icon-password", xmlns: "http://www.w3.org/2000/svg", width: n, height: n, viewBox: "0 -960 960 960", className: Q()($.icon, e && $.secondary, t && $.disabled) }, { children: r("path", { d: "M80-200v-80h800v80H80Zm46-242-52-30 34-60H40v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Zm320 0-52-30 34-60h-68v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Zm320 0-52-30 34-60h-68v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Z" }) })), cr = ({ size: n, secondary: e, disabled: t }) => r("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", viewBox: "0 -960 960 960", width: n, height: n, className: Q()($.icon, e && $.secondary, t && $.disabled) }, { children: r("path", { d: "M80-680v-200h200v80H160v120H80Zm0 600v-200h80v120h120v80H80Zm600 0v-80h120v-120h80v200H680Zm120-600v-120H680v-80h200v200h-80ZM700-260h60v60h-60v-60Zm0-120h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60-60h60v60h-60v-60Zm120-120h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60-60h60v60h-60v-60Zm240-320v240H520v-240h240ZM440-440v240H200v-240h240Zm0-320v240H200v-240h240Zm-60 500v-120H260v120h120Zm0-320v-120H260v120h120Zm320 0v-120H580v120h120Z" }) })), dr = ({ size: n, secondary: e, disabled: t }) => r("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", viewBox: "0 -960 960 960", width: n, height: n, className: Q()($.icon, e && $.secondary, t && $.disabled) }, { children: r("path", { d: "M280-240q-100 0-170-70T40-480q0-100 70-170t170-70q66 0 121 33t87 87h432v240h-80v120H600v-120H488q-32 54-87 87t-121 33Zm0-80q66 0 106-40.5t48-79.5h246v120h80v-120h80v-80H434q-8-39-48-79.5T280-640q-66 0-113 47t-47 113q0 66 47 113t113 47Zm0-80q33 0 56.5-23.5T360-480q0-33-23.5-56.5T280-560q-33 0-56.5 23.5T200-480q0 33 23.5 56.5T280-400Zm0-80Z" }) })), ur = ({ size: n, disabled: e }) => r("svg", Object.assign({ id: "icon-spinner", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: n, height: n, className: Q()($.loadingSpinner, e && $.disabled) }, { children: [r("path", { d: "M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z", opacity: ".25" }), r("path", { d: "M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z" })] })), Wt = ({ name: n, secondary: e, size: t = 18, fadeOut: o, disabled: i }) => r(Bn[n], { size: t, secondary: e, fadeOut: o, disabled: i }), mo = ({ children: n, isLoading: e, isSuccess: t, fadeOut: o, secondary: i, hasIcon: s, maxWidth: a }) => r(A.Fragment, { children: r("div", e ? Object.assign({ className: Q()($.loadingSpinnerWrapper, $.centerContent, a && $.maxWidth) }, { children: r(Wt, { name: "spinner", secondary: i }) }) : t ? Object.assign({ className: Q()($.loadingSpinnerWrapper, $.centerContent, a && $.maxWidth) }, { children: r(Wt, { name: "checkmark", secondary: i, fadeOut: o }) }) : Object.assign({ className: s ? $.loadingSpinnerWrapperIcon : $.loadingSpinnerWrapper }, { children: n })) }), hr = () => {
  const { setLoadingAction: n } = (0, _.useContext)(ue);
  return (0, _.useEffect)(() => {
    n(null);
  }, []), r(mo, { isLoading: !0 });
}, Ne = (n) => {
  const [e, t] = (0, _.useState)(n);
  return (0, _.useEffect)(() => {
    n && t(n);
  }, [n]), { flowState: e };
};
var an = Y(577), xt = {};
xt.setAttributes = tt(), xt.insert = (n) => {
  window._hankoStyle = n;
}, xt.domAPI = et(), xt.insertStyleElement = nt(), Xe()(an.A, xt);
const Ae = an.A && an.A.locals ? an.A.locals : void 0, pr = () => {
  const { t: n } = (0, _.useContext)(Z.TranslateContext);
  return r("span", Object.assign({ className: Q()(Ae.lastUsed) }, { children: n("labels.lastUsed") }));
}, te = (n) => {
  var { uiAction: e, title: t, children: o, secondary: i, dangerous: s, autofocus: a, showLastUsed: c, onClick: d, icon: l } = n, u = function(x, P) {
    var D = {};
    for (var N in x) Object.prototype.hasOwnProperty.call(x, N) && P.indexOf(N) < 0 && (D[N] = x[N]);
    if (x != null && typeof Object.getOwnPropertySymbols == "function") {
      var U = 0;
      for (N = Object.getOwnPropertySymbols(x); U < N.length; U++) P.indexOf(N[U]) < 0 && Object.prototype.propertyIsEnumerable.call(x, N[U]) && (D[N[U]] = x[N[U]]);
    }
    return D;
  }(n, ["uiAction", "title", "children", "secondary", "dangerous", "autofocus", "showLastUsed", "onClick", "icon"]);
  const h = (0, _.useRef)(null), { uiState: g, isDisabled: f } = (0, _.useContext)(ue);
  (0, _.useEffect)(() => {
    const { current: x } = h;
    x && a && x.focus();
  }, [a]);
  const S = (0, _.useMemo)(() => e && g.loadingAction === e || u.isLoading, [u, e, g]), O = (0, _.useMemo)(() => e && g.succeededAction === e || u.isSuccess, [u, e, g]), C = (0, _.useMemo)(() => f || u.disabled, [u, f]);
  return r("button", Object.assign({ part: s ? "button dangerous-button" : i ? "button secondary-button" : "button primary-button", title: t, ref: h, type: "submit", disabled: C, onClick: d, className: Q()(Ae.button, s ? Ae.dangerous : i ? Ae.secondary : Ae.primary) }, { children: r(mo, Object.assign({ isLoading: S, isSuccess: O, secondary: !0, hasIcon: !!l, maxWidth: !0 }, { children: [l ? r(Wt, { name: l, secondary: i, disabled: C }) : null, r("div", Object.assign({ className: Ae.caption }, { children: [r("span", { children: o }), c ? r(pr, {}) : null] }))] })) }));
}, Be = (n) => {
  var e, t, o, i, s, { label: a } = n, c = function(f, S) {
    var O = {};
    for (var C in f) Object.prototype.hasOwnProperty.call(f, C) && S.indexOf(C) < 0 && (O[C] = f[C]);
    if (f != null && typeof Object.getOwnPropertySymbols == "function") {
      var x = 0;
      for (C = Object.getOwnPropertySymbols(f); x < C.length; x++) S.indexOf(C[x]) < 0 && Object.prototype.propertyIsEnumerable.call(f, C[x]) && (O[C[x]] = f[C[x]]);
    }
    return O;
  }(n, ["label"]);
  const d = (0, _.useRef)(null), { isDisabled: l } = (0, _.useContext)(ue), { t: u } = (0, _.useContext)(Z.TranslateContext), h = (0, _.useMemo)(() => l || c.disabled, [c, l]);
  (0, _.useEffect)(() => {
    const { current: f } = d;
    f && c.autofocus && (f.focus(), f.select());
  }, [c.autofocus]);
  const g = (0, _.useMemo)(() => {
    var f;
    return c.markOptional && !(!((f = c.flowInput) === null || f === void 0) && f.required) ? `${c.placeholder} (${u("labels.optional")})` : c.placeholder;
  }, [c.markOptional, c.placeholder, c.flowInput, u]);
  return r("div", Object.assign({ className: Ae.inputWrapper }, { children: r("input", Object.assign({ part: "input text-input", required: (e = c.flowInput) === null || e === void 0 ? void 0 : e.required, maxLength: (t = c.flowInput) === null || t === void 0 ? void 0 : t.max_length, minLength: (o = c.flowInput) === null || o === void 0 ? void 0 : o.min_length, hidden: (i = c.flowInput) === null || i === void 0 ? void 0 : i.hidden }, c, { ref: d, "aria-label": g, placeholder: g, className: Q()(Ae.input, !!(!((s = c.flowInput) === null || s === void 0) && s.error) && c.markError && Ae.error), disabled: h })) }));
}, Oe = ({ children: n }) => r("section", Object.assign({ className: Rt.content }, { children: n })), ne = ({ onSubmit: n, children: e, hidden: t, maxWidth: o }) => t ? null : r("form", Object.assign({ onSubmit: n, className: Ae.form }, { children: r("ul", Object.assign({ className: Ae.ul }, { children: (0, A.toChildArray)(e).map((i, s) => r("li", Object.assign({ part: "form-item", className: Q()(Ae.li, o ? Ae.maxWidth : null) }, { children: i }), s)) })) }));
var ln = Y(111), St = {};
St.setAttributes = tt(), St.insert = (n) => {
  window._hankoStyle = n;
}, St.domAPI = et(), St.insertStyleElement = nt(), Xe()(ln.A, St);
const Lt = ln.A && ln.A.locals ? ln.A.locals : void 0, go = ({ children: n, hidden: e }) => e ? null : r("section", Object.assign({ part: "divider", className: Lt.divider }, { children: [r("div", { part: "divider-line", className: Lt.line }), n ? r("div", Object.assign({ part: "divider-text", class: Lt.text }, { children: n })) : null, r("div", { part: "divider-line", className: Lt.line })] }));
var cn = Y(905), Ct = {};
Ct.setAttributes = tt(), Ct.insert = (n) => {
  window._hankoStyle = n;
}, Ct.domAPI = et(), Ct.insertStyleElement = nt(), Xe()(cn.A, Ct);
const ji = cn.A && cn.A.locals ? cn.A.locals : void 0, Pe = ({ state: n, error: e, flowError: t }) => {
  var o, i;
  const { t: s } = (0, _.useContext)(Z.TranslateContext), { uiState: a, setUIState: c } = (0, _.useContext)(ue);
  return (0, _.useEffect)(() => {
    var d, l;
    if (((d = n == null ? void 0 : n.error) === null || d === void 0 ? void 0 : d.code) == "form_data_invalid_error") for (const u of Object.values(n == null ? void 0 : n.actions)) {
      const h = u == null ? void 0 : u(null);
      let g = !1;
      for (const f of Object.values(h == null ? void 0 : h.inputs)) if (!((l = f.error) === null || l === void 0) && l.code) return c(Object.assign(Object.assign({}, a), { error: f.error })), void (g = !0);
      g || c(Object.assign(Object.assign({}, a), { error: n.error }));
    }
    else n != null && n.error && c(Object.assign(Object.assign({}, a), { error: n == null ? void 0 : n.error }));
  }, [n]), r("section", Object.assign({ part: "error", className: ji.errorBox, hidden: !(!((o = a.error) === null || o === void 0) && o.code) && !(t != null && t.code) && !e }, { children: [r("span", { children: r(Wt, { name: "exclamation", size: 15 }) }), r("span", Object.assign({ id: "errorMessage", part: "error-text" }, { children: s(e ? `errors.${e.code}` : `flowErrors.${((i = a.error) === null || i === void 0 ? void 0 : i.code) || (t == null ? void 0 : t.code)}`) }))] }));
};
var dn = Y(619), At = {};
At.setAttributes = tt(), At.insert = (n) => {
  window._hankoStyle = n;
}, At.domAPI = et(), At.insertStyleElement = nt(), Xe()(dn.A, At);
const yn = dn.A && dn.A.locals ? dn.A.locals : void 0, de = ({ children: n }) => r("h1", Object.assign({ part: "headline1", className: Q()(yn.headline, yn.grade1) }, { children: n }));
var un = Y(995), Ot = {};
Ot.setAttributes = tt(), Ot.insert = (n) => {
  window._hankoStyle = n;
}, Ot.domAPI = et(), Ot.insertStyleElement = nt(), Xe()(un.A, Ot);
const Zt = un.A && un.A.locals ? un.A.locals : void 0, Zn = (n) => {
  var { loadingSpinnerPosition: e, dangerous: t = !1, onClick: o, uiAction: i } = n, s = function(P, D) {
    var N = {};
    for (var U in P) Object.prototype.hasOwnProperty.call(P, U) && D.indexOf(U) < 0 && (N[U] = P[U]);
    if (P != null && typeof Object.getOwnPropertySymbols == "function") {
      var ie = 0;
      for (U = Object.getOwnPropertySymbols(P); ie < U.length; ie++) D.indexOf(U[ie]) < 0 && Object.prototype.propertyIsEnumerable.call(P, U[ie]) && (N[U[ie]] = P[U[ie]]);
    }
    return N;
  }(n, ["loadingSpinnerPosition", "dangerous", "onClick", "uiAction"]);
  const { t: a } = (0, _.useContext)(Z.TranslateContext), { uiState: c, isDisabled: d } = (0, _.useContext)(ue), [l, u] = (0, _.useState)();
  let h;
  const g = (P) => {
    P.preventDefault(), u(!0);
  }, f = (P) => {
    P.preventDefault(), u(!1);
  }, S = (0, _.useMemo)(() => i && c.loadingAction === i || s.isLoading, [s, i, c]), O = (0, _.useMemo)(() => i && c.succeededAction === i || s.isSuccess, [s, i, c]), C = (0, _.useCallback)((P) => {
    P.preventDefault(), u(!1), o(P);
  }, [o]), x = (0, _.useCallback)(() => r(A.Fragment, { children: [l ? r(A.Fragment, { children: [r(Zn, Object.assign({ onClick: C }, { children: a("labels.yes") })), " / ", r(Zn, Object.assign({ onClick: f }, { children: a("labels.no") })), " "] }) : null, r("button", Object.assign({}, s, { onClick: t ? g : o, disabled: l || s.disabled || d, part: "link", className: Q()(Zt.link, t ? Zt.danger : null) }, { children: s.children }))] }), [l, t, o, C, s, a, d]);
  return r(A.Fragment, { children: r("span", Object.assign({ className: Q()(Zt.linkWrapper, e === "right" ? Zt.reverse : null), hidden: s.hidden, onMouseEnter: () => {
    h && window.clearTimeout(h);
  }, onMouseLeave: () => {
    h = window.setTimeout(() => {
      u(!1);
    }, 1e3);
  } }, { children: r(A.Fragment, e && (S || O) ? { children: [r(mo, { isLoading: S, isSuccess: O, secondary: s.secondary, fadeOut: !0 }), x()] } : { children: x() }) })) });
}, ee = Zn, Ue = ({ children: n, hidden: e = !1 }) => e ? null : r("section", Object.assign({ className: Rt.footer }, { children: n })), vo = (n) => {
  var { label: e } = n, t = function(o, i) {
    var s = {};
    for (var a in o) Object.prototype.hasOwnProperty.call(o, a) && i.indexOf(a) < 0 && (s[a] = o[a]);
    if (o != null && typeof Object.getOwnPropertySymbols == "function") {
      var c = 0;
      for (a = Object.getOwnPropertySymbols(o); c < a.length; c++) i.indexOf(a[c]) < 0 && Object.prototype.propertyIsEnumerable.call(o, a[c]) && (s[a[c]] = o[a[c]]);
    }
    return s;
  }(n, ["label"]);
  return r("div", Object.assign({ className: Ae.inputWrapper }, { children: r("label", Object.assign({ className: Ae.checkboxWrapper }, { children: [r("input", Object.assign({ part: "input checkbox-input", type: "checkbox", "aria-label": e, className: Ae.checkbox }, t)), r("span", Object.assign({ className: Q()(Ae.label, t.disabled ? Ae.disabled : null) }, { children: e }))] })) }));
}, On = () => r("section", { className: Lt.spacer });
var Pt = function(n, e, t, o) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        d(o.next(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      try {
        d(o.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, c);
    }
    d((o = o.apply(n, [])).next());
  });
};
const fr = (n) => {
  var e, t, o, i, s, a, c, d, l;
  const { t: u } = (0, _.useContext)(Z.TranslateContext), { init: h, hanko: g, initialComponentName: f, setLoadingAction: S, uiState: O, setUIState: C, stateHandler: x, hidePasskeyButtonOnLogin: P, lastLogin: D } = (0, _.useContext)(ue), [N, U] = (0, _.useState)(null), [ie, be] = (0, _.useState)(O.username || O.email), { flowState: se } = Ne(n.state), we = mt.supported(), [M, z] = (0, _.useState)(void 0), [ve, $e] = (0, _.useState)(null), [Ee, Le] = (0, _.useState)(!1), re = (k) => {
    if (k.preventDefault(), k.target instanceof HTMLInputElement) {
      const { value: p } = k.target;
      be(p), ae(p);
    }
  }, ae = (k) => {
    const p = () => C((L) => Object.assign(Object.assign({}, L), { email: k, username: null })), y = () => C((L) => Object.assign(Object.assign({}, L), { email: null, username: k }));
    switch (N) {
      case "email":
        p();
        break;
      case "username":
        y();
        break;
      case "identifier":
        k.match(/^[^@]+@[^@]+\.[^@]+$/) ? p() : y();
    }
  }, he = (0, _.useMemo)(() => {
    var k, p, y, L;
    return !!(!((p = (k = se.actions).webauthn_generate_request_options) === null || p === void 0) && p.call(k, null)) || !!(!((L = (y = se.actions).thirdparty_oauth) === null || L === void 0) && L.call(y, null));
  }, [se.actions]), Ie = (t = (e = se.actions).continue_with_login_identifier) === null || t === void 0 ? void 0 : t.call(e, null).inputs;
  return (0, _.useEffect)(() => {
    var k, p;
    const y = (p = (k = se.actions).continue_with_login_identifier) === null || p === void 0 ? void 0 : p.call(k, null).inputs;
    U(y != null && y.email ? "email" : y != null && y.username ? "username" : "identifier");
  }, [se]), (0, _.useEffect)(() => {
    const k = new URLSearchParams(window.location.search);
    if (k.get("error") == null || k.get("error").length === 0) return;
    let p = "";
    p = k.get("error") === "access_denied" ? "thirdPartyAccessDenied" : "somethingWentWrong";
    const y = { name: p, code: p, message: k.get("error_description") };
    z(y), k.delete("error"), k.delete("error_description"), history.replaceState(null, null, window.location.pathname + (k.size < 1 ? "" : `?${k.toString()}`));
  }, []), r(A.Fragment, { children: [r(Oe, { children: [r(de, { children: u("headlines.signIn") }), r(Pe, { state: se, error: M }), Ie ? r(A.Fragment, { children: [r(ne, Object.assign({ onSubmit: (k) => Pt(void 0, void 0, void 0, function* () {
    k.preventDefault(), S("email-submit");
    const p = yield se.actions.continue_with_login_identifier({ [N]: ie }).run();
    ae(ie), S(null), yield g.flow.run(p, x);
  }), maxWidth: !0 }, { children: [Ie.email ? r(Be, { type: "email", autoComplete: "username webauthn", autoCorrect: "off", flowInput: Ie.email, onInput: re, value: ie, placeholder: u("labels.email"), pattern: "^[^@]+@[^@]+\\.[^@]+$" }) : Ie.username ? r(Be, { type: "text", autoComplete: "username webauthn", autoCorrect: "off", flowInput: Ie.username, onInput: re, value: ie, placeholder: u("labels.username") }) : r(Be, { type: "text", autoComplete: "username webauthn", autoCorrect: "off", flowInput: Ie.identifier, onInput: re, value: ie, placeholder: u("labels.emailOrUsername") }), r(te, Object.assign({ uiAction: "email-submit" }, { children: u("labels.continue") }))] })), r(go, Object.assign({ hidden: !he }, { children: u("labels.or") }))] }) : null, !((i = (o = se.actions).webauthn_generate_request_options) === null || i === void 0) && i.call(o, null) && !P ? r(ne, Object.assign({ onSubmit: (k) => ((p) => Pt(void 0, void 0, void 0, function* () {
    p.preventDefault(), S("passkey-submit");
    const y = yield se.actions.webauthn_generate_request_options(null).run();
    yield g.flow.run(y, x);
  }))(k) }, { children: r(te, Object.assign({ uiAction: "passkey-submit", secondary: !0, title: we ? null : u("labels.webauthnUnsupported"), disabled: !we, icon: "passkey" }, { children: u("labels.signInPasskey") })) })) : null, !((a = (s = se.actions).thirdparty_oauth) === null || a === void 0) && a.call(s, null) ? (c = se.actions.thirdparty_oauth(null).inputs.provider.allowed_values) === null || c === void 0 ? void 0 : c.map((k) => r(ne, Object.assign({ onSubmit: (p) => ((y, L) => Pt(void 0, void 0, void 0, function* () {
    y.preventDefault(), $e(L);
    const K = yield se.actions.thirdparty_oauth({ provider: L, redirect_to: window.location.toString() }).run();
    K.error && $e(null), yield g.flow.run(K, x);
  }))(p, k.value) }, { children: r(te, Object.assign({ isLoading: k.value == ve, secondary: !0, icon: k.value.startsWith("custom_") ? "customProvider" : k.value, showLastUsed: (D == null ? void 0 : D.login_method) == "third_party" && (D == null ? void 0 : D.third_party_provider) == k.value }, { children: u("labels.signInWith", { provider: k.name }) })) }), k.value)) : null, ((l = (d = se.actions).remember_me) === null || l === void 0 ? void 0 : l.call(d, null)) && r(A.Fragment, { children: [r(On, {}), r(vo, { required: !1, type: "checkbox", label: u("labels.staySignedIn"), checked: Ee, onChange: (k) => Pt(void 0, void 0, void 0, function* () {
    const p = yield se.actions.remember_me({ remember_me: !Ee }).run();
    Le((y) => !y), yield g.flow.run(p, x);
  }) })] })] }), r(Ue, Object.assign({ hidden: f !== "auth" }, { children: [r("span", { hidden: !0 }), r(ee, Object.assign({ uiAction: "switch-flow", onClick: (k) => Pt(void 0, void 0, void 0, function* () {
    k.preventDefault(), h("registration");
  }), loadingSpinnerPosition: "left" }, { children: u("labels.dontHaveAnAccount") }))] }))] });
}, mr = (n) => {
  var { index: e, focus: t, digit: o = "" } = n, i = function(l, u) {
    var h = {};
    for (var g in l) Object.prototype.hasOwnProperty.call(l, g) && u.indexOf(g) < 0 && (h[g] = l[g]);
    if (l != null && typeof Object.getOwnPropertySymbols == "function") {
      var f = 0;
      for (g = Object.getOwnPropertySymbols(l); f < g.length; f++) u.indexOf(g[f]) < 0 && Object.prototype.propertyIsEnumerable.call(l, g[f]) && (h[g[f]] = l[g[f]]);
    }
    return h;
  }(n, ["index", "focus", "digit"]);
  const s = (0, _.useRef)(null), { isDisabled: a } = (0, _.useContext)(ue), c = () => {
    const { current: l } = s;
    l && (l.focus(), l.select());
  }, d = (0, _.useMemo)(() => a || i.disabled, [i, a]);
  return (0, _.useEffect)(() => {
    e === 0 && c();
  }, [e, i.disabled]), (0, _.useMemo)(() => {
    t && c();
  }, [t]), r("div", Object.assign({ className: Ae.passcodeDigitWrapper }, { children: r("input", Object.assign({}, i, { part: "input passcode-input", "aria-label": `${i.name}-digit-${e + 1}`, name: i.name + e.toString(10), type: "text", inputMode: "numeric", maxLength: 1, ref: s, value: o.charAt(0), required: !0, className: Ae.input, disabled: d })) }));
}, _o = ({ passcodeDigits: n = [], numberOfInputs: e = 6, onInput: t, disabled: o = !1 }) => {
  const [i, s] = (0, _.useState)(0), a = () => n.slice(), c = () => {
    i < e - 1 && s(i + 1);
  }, d = () => {
    i > 0 && s(i - 1);
  }, l = (f) => {
    const S = a();
    S[i] = f.charAt(0), t(S);
  }, u = (f) => {
    if (f.preventDefault(), o) return;
    const S = f.clipboardData.getData("text/plain").slice(0, e - i).split(""), O = a();
    let C = i;
    for (let x = 0; x < e; ++x) x >= i && S.length > 0 && (O[x] = S.shift(), C++);
    s(C), t(O);
  }, h = (f) => {
    f.key === "Backspace" ? (f.preventDefault(), l(""), d()) : f.key === "Delete" ? (f.preventDefault(), l("")) : f.key === "ArrowLeft" ? (f.preventDefault(), d()) : f.key === "ArrowRight" ? (f.preventDefault(), c()) : f.key !== " " && f.key !== "Spacebar" && f.key !== "Space" || f.preventDefault();
  }, g = (f) => {
    f.target instanceof HTMLInputElement && l(f.target.value), c();
  };
  return (0, _.useEffect)(() => {
    n.length === 0 && s(0);
  }, [n]), r("div", Object.assign({ className: Ae.passcodeInputWrapper }, { children: Array.from(Array(e)).map((f, S) => r(mr, { name: "passcode", index: S, focus: i === S, digit: n[S], onKeyDown: h, onInput: g, onPaste: u, onFocus: () => ((O) => {
    s(O);
  })(S), disabled: o }, S)) }));
};
var hn = Y(489), Et = {};
Et.setAttributes = tt(), Et.insert = (n) => {
  window._hankoStyle = n;
}, Et.domAPI = et(), Et.insertStyleElement = nt(), Xe()(hn.A, Et);
const gr = hn.A && hn.A.locals ? hn.A.locals : void 0, q = ({ children: n, hidden: e }) => e ? null : r("p", Object.assign({ part: "paragraph", className: gr.paragraph }, { children: n }));
var Jt = function(n, e, t, o) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        d(o.next(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      try {
        d(o.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, c);
    }
    d((o = o.apply(n, [])).next());
  });
};
const vr = (n) => {
  var e, t;
  const { t: o } = (0, _.useContext)(Z.TranslateContext), { flowState: i } = Ne(n.state), { hanko: s, uiState: a, setUIState: c, setLoadingAction: d, setSucceededAction: l, stateHandler: u } = (0, _.useContext)(ue), [h, g] = (0, _.useState)(), [f, S] = (0, _.useState)(i.payload.resend_after), [O, C] = (0, _.useState)([]), x = (0, _.useMemo)(() => {
    var D;
    return ((D = i.error) === null || D === void 0 ? void 0 : D.code) === "passcode_max_attempts_reached";
  }, [i]), P = (0, _.useCallback)((D) => Jt(void 0, void 0, void 0, function* () {
    d("passcode-submit");
    const N = yield i.actions.verify_passcode({ code: D }).run();
    d(null), yield s.flow.run(N, u);
  }), [s, i, d, u]);
  return (0, _.useEffect)(() => {
    i.payload.passcode_resent && (l("passcode-resend"), setTimeout(() => l(null), 1e3));
  }, [i, l]), (0, _.useEffect)(() => {
    h <= 0 && a.succeededAction;
  }, [a, h]), (0, _.useEffect)(() => {
    const D = h > 0 && setInterval(() => g(h - 1), 1e3);
    return () => clearInterval(D);
  }, [h]), (0, _.useEffect)(() => {
    const D = f > 0 && setInterval(() => {
      S(f - 1);
    }, 1e3);
    return () => clearInterval(D);
  }, [f]), (0, _.useEffect)(() => {
    var D;
    f == 0 && ((D = i.error) === null || D === void 0 ? void 0 : D.code) == "rate_limit_exceeded" && c((N) => Object.assign(Object.assign({}, N), { error: null }));
  }, [f]), (0, _.useEffect)(() => {
    var D;
    ((D = i.error) === null || D === void 0 ? void 0 : D.code) === "passcode_invalid" && C([]), i.payload.resend_after >= 0 && S(i.payload.resend_after);
  }, [i]), r(A.Fragment, { children: [r(Oe, { children: [r(de, { children: o("headlines.loginPasscode") }), r(Pe, { state: i }), r(q, { children: a.email ? o("texts.enterPasscode", { emailAddress: a.email }) : o("texts.enterPasscodeNoEmail") }), r(ne, Object.assign({ onSubmit: (D) => Jt(void 0, void 0, void 0, function* () {
    return D.preventDefault(), P(O.join(""));
  }) }, { children: [r(_o, { onInput: (D) => {
    if (C(D), D.filter((N) => N !== "").length === 6) return P(D.join(""));
  }, passcodeDigits: O, numberOfInputs: 6, disabled: h <= 0 || x }), r(te, Object.assign({ disabled: h <= 0 || x, uiAction: "passcode-submit" }, { children: o("labels.continue") }))] }))] }), r(Ue, { children: [r(ee, Object.assign({ hidden: !(!((t = (e = i.actions).back) === null || t === void 0) && t.call(e, null)), onClick: (D) => Jt(void 0, void 0, void 0, function* () {
    D.preventDefault(), d("back");
    const N = yield i.actions.back(null).run();
    d(null), yield s.flow.run(N, u);
  }), loadingSpinnerPosition: "right", isLoading: a.loadingAction === "back" }, { children: o("labels.back") })), r(ee, Object.assign({ uiAction: "passcode-resend", disabled: f > 0, onClick: (D) => Jt(void 0, void 0, void 0, function* () {
    D.preventDefault(), d("passcode-resend");
    const N = yield i.actions.resend_passcode(null).run();
    d(null), yield s.flow.run(N, u);
  }), loadingSpinnerPosition: "left" }, { children: f > 0 ? o("labels.passcodeResendAfter", { passcodeResendAfter: f }) : o("labels.sendNewPasscode") }))] })] });
};
var Hn = function(n, e, t, o) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        d(o.next(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      try {
        d(o.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, c);
    }
    d((o = o.apply(n, [])).next());
  });
};
const _r = (n) => {
  var e, t, o, i, s, a, c, d;
  const { t: l } = (0, _.useContext)(Z.TranslateContext), { hanko: u, setLoadingAction: h, stateHandler: g } = (0, _.useContext)(ue), { flowState: f } = Ne(n.state);
  return r(A.Fragment, { children: [r(Oe, { children: [r(de, { children: l("headlines.registerAuthenticator") }), r(Pe, { state: f }), r(q, { children: l("texts.setupPasskey") }), r(ne, Object.assign({ onSubmit: (S) => Hn(void 0, void 0, void 0, function* () {
    S.preventDefault(), h("passkey-submit");
    const O = yield f.actions.webauthn_generate_creation_options(null).run();
    yield u.flow.run(O, g);
  }) }, { children: r(te, Object.assign({ uiAction: "passkey-submit", autofocus: !0, icon: "passkey" }, { children: l("labels.registerAuthenticator") })) }))] }), r(Ue, Object.assign({ hidden: !(!((t = (e = f.actions).skip) === null || t === void 0) && t.call(e, null)) && !(!((i = (o = f.actions).back) === null || i === void 0) && i.call(o, null)) }, { children: [r(ee, Object.assign({ uiAction: "back", onClick: (S) => Hn(void 0, void 0, void 0, function* () {
    S.preventDefault(), h("back");
    const O = yield f.actions.back(null).run();
    h(null), yield u.flow.run(O, g);
  }), loadingSpinnerPosition: "right", hidden: !(!((a = (s = f.actions).back) === null || a === void 0) && a.call(s, null)) }, { children: l("labels.back") })), r(ee, Object.assign({ uiAction: "skip", onClick: (S) => Hn(void 0, void 0, void 0, function* () {
    S.preventDefault(), h("skip");
    const O = yield f.actions.skip(null).run();
    h(null), yield u.flow.run(O, g);
  }), loadingSpinnerPosition: "left", hidden: !(!((d = (c = f.actions).skip) === null || d === void 0) && d.call(c, null)) }, { children: l("labels.skip") }))] }))] });
};
var It = function(n, e, t, o) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        d(o.next(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      try {
        d(o.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, c);
    }
    d((o = o.apply(n, [])).next());
  });
};
const yr = (n) => {
  var e, t, o, i;
  const { t: s } = (0, _.useContext)(Z.TranslateContext), { hanko: a, stateHandler: c, setLoadingAction: d } = (0, _.useContext)(ue), { flowState: l } = Ne(n.state), [u, h] = (0, _.useState)(), [g, f] = (0, _.useState)(), S = (P) => It(void 0, void 0, void 0, function* () {
    P.preventDefault(), d("password-recovery");
    const D = yield l.actions.continue_to_passcode_confirmation_recovery(null).run();
    d(null), yield a.flow.run(D, c);
  }), O = (P) => It(void 0, void 0, void 0, function* () {
    P.preventDefault(), d("choose-login-method");
    const D = yield l.actions.continue_to_login_method_chooser(null).run();
    d(null), yield a.flow.run(D, c);
  }), C = (0, _.useMemo)(() => {
    var P, D;
    return r(ee, Object.assign({ hidden: !(!((D = (P = l.actions).continue_to_passcode_confirmation_recovery) === null || D === void 0) && D.call(P, null)), uiAction: "password-recovery", onClick: S, loadingSpinnerPosition: "left" }, { children: s("labels.forgotYourPassword") }));
  }, [S, s]), x = (0, _.useMemo)(() => r(ee, Object.assign({ uiAction: "choose-login-method", onClick: O, loadingSpinnerPosition: "left" }, { children: "Choose another method" })), [O]);
  return (0, _.useEffect)(() => {
    const P = g > 0 && setInterval(() => f(g - 1), 1e3);
    return () => clearInterval(P);
  }, [g]), r(A.Fragment, { children: [r(Oe, { children: [r(de, { children: s("headlines.loginPassword") }), r(Pe, { state: l }), r(ne, Object.assign({ onSubmit: (P) => It(void 0, void 0, void 0, function* () {
    P.preventDefault(), d("password-submit");
    const D = yield l.actions.password_login({ password: u }).run();
    d(null), yield a.flow.run(D, c);
  }) }, { children: [r(Be, { type: "password", flowInput: l.actions.password_login(null).inputs.password, autocomplete: "current-password", placeholder: s("labels.password"), onInput: (P) => It(void 0, void 0, void 0, function* () {
    P.target instanceof HTMLInputElement && h(P.target.value);
  }), autofocus: !0 }), r(te, Object.assign({ uiAction: "password-submit", disabled: g > 0 }, { children: g > 0 ? s("labels.passwordRetryAfter", { passwordRetryAfter: g }) : s("labels.signIn") }))] })), !((t = (e = l.actions).continue_to_login_method_chooser) === null || t === void 0) && t.call(e, null) ? C : null] }), r(Ue, { children: [r(ee, Object.assign({ uiAction: "back", onClick: (P) => It(void 0, void 0, void 0, function* () {
    P.preventDefault(), d("back");
    const D = yield l.actions.back(null).run();
    d(null), yield a.flow.run(D, c);
  }), loadingSpinnerPosition: "right" }, { children: s("labels.back") })), !((i = (o = l.actions).continue_to_login_method_chooser) === null || i === void 0) && i.call(o, null) ? x : C] })] });
};
var Bo = function(n, e, t, o) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        d(o.next(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      try {
        d(o.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, c);
    }
    d((o = o.apply(n, [])).next());
  });
};
const br = (n) => {
  const { t: e } = (0, _.useContext)(Z.TranslateContext), { hanko: t, stateHandler: o, setLoadingAction: i } = (0, _.useContext)(ue), { flowState: s } = Ne(n.state), [a, c] = (0, _.useState)();
  return r(Oe, { children: [r(de, { children: e("headlines.registerPassword") }), r(Pe, { state: s }), r(q, { children: e("texts.passwordFormatHint", { minLength: s.actions.password_recovery(null).inputs.new_password.min_length, maxLength: 72 }) }), r(ne, Object.assign({ onSubmit: (d) => Bo(void 0, void 0, void 0, function* () {
    d.preventDefault(), i("password-submit");
    const l = yield s.actions.password_recovery({ new_password: a }).run();
    i(null), yield t.flow.run(l, o);
  }) }, { children: [r(Be, { type: "password", autocomplete: "new-password", flowInput: s.actions.password_recovery(null).inputs.new_password, placeholder: e("labels.newPassword"), onInput: (d) => Bo(void 0, void 0, void 0, function* () {
    d.target instanceof HTMLInputElement && c(d.target.value);
  }), autofocus: !0 }), r(te, Object.assign({ uiAction: "password-submit" }, { children: e("labels.continue") }))] }))] });
};
var Qt = function(n, e, t, o) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        d(o.next(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      try {
        d(o.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, c);
    }
    d((o = o.apply(n, [])).next());
  });
};
const kr = (n) => {
  var e, t, o, i, s, a;
  const { t: c } = (0, _.useContext)(Z.TranslateContext), { hanko: d, setLoadingAction: l, stateHandler: u, lastLogin: h } = (0, _.useContext)(ue), { flowState: g } = Ne(n.state);
  return r(A.Fragment, { children: [r(Oe, { children: [r(de, { children: c("headlines.selectLoginMethod") }), r(Pe, { flowError: g == null ? void 0 : g.error }), r(q, { children: c("texts.howDoYouWantToLogin") }), r(ne, Object.assign({ hidden: !(!((t = (e = g.actions).continue_to_passcode_confirmation) === null || t === void 0) && t.call(e, null)), onSubmit: (f) => Qt(void 0, void 0, void 0, function* () {
    f.preventDefault(), l("passcode-submit");
    const S = yield g.actions.continue_to_passcode_confirmation(null).run();
    l(null), yield d.flow.run(S, u);
  }) }, { children: r(te, Object.assign({ secondary: !0, uiAction: "passcode-submit", icon: "mail" }, { children: c("labels.passcode") })) })), r(ne, Object.assign({ hidden: !(!((i = (o = g.actions).continue_to_password_login) === null || i === void 0) && i.call(o, null)), onSubmit: (f) => Qt(void 0, void 0, void 0, function* () {
    f.preventDefault(), l("password-submit");
    const S = yield g.actions.continue_to_password_login(null).run();
    l(null), yield d.flow.run(S, u);
  }) }, { children: r(te, Object.assign({ secondary: !0, uiAction: "password-submit", icon: "password" }, { children: c("labels.password") })) })), r(ne, Object.assign({ hidden: !(!((a = (s = g.actions).webauthn_generate_request_options) === null || a === void 0) && a.call(s, null)), onSubmit: (f) => Qt(void 0, void 0, void 0, function* () {
    f.preventDefault(), l("passkey-submit");
    const S = yield g.actions.webauthn_generate_request_options(null).run();
    l(null), yield d.flow.run(S, u);
  }) }, { children: r(te, Object.assign({ secondary: !0, uiAction: "passkey-submit", icon: "passkey" }, { children: c("labels.passkey") })) }))] }), r(Ue, { children: r(ee, Object.assign({ uiAction: "back", onClick: (f) => Qt(void 0, void 0, void 0, function* () {
    f.preventDefault(), l("back");
    const S = yield g.actions.back(null).run();
    l(null), yield d.flow.run(S, u);
  }), loadingSpinnerPosition: "right" }, { children: c("labels.back") })) })] });
};
var Gt = function(n, e, t, o) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        d(o.next(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      try {
        d(o.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, c);
    }
    d((o = o.apply(n, [])).next());
  });
};
const wr = (n) => {
  var e, t, o, i, s, a, c;
  const { t: d } = (0, _.useContext)(Z.TranslateContext), { init: l, hanko: u, uiState: h, setUIState: g, stateHandler: f, setLoadingAction: S, initialComponentName: O } = (0, _.useContext)(ue), { flowState: C } = Ne(n.state), x = (t = (e = C.actions).register_login_identifier) === null || t === void 0 ? void 0 : t.call(e, null).inputs, P = !(!(x != null && x.email) || !(x != null && x.username)), [D, N] = (0, _.useState)(void 0), [U, ie] = (0, _.useState)(null), [be, se] = (0, _.useState)(!1), we = (0, _.useMemo)(() => {
    var M, z;
    return !!(!((z = (M = C.actions).thirdparty_oauth) === null || z === void 0) && z.call(M, null));
  }, [C.actions]);
  return (0, _.useEffect)(() => {
    const M = new URLSearchParams(window.location.search);
    if (M.get("error") == null || M.get("error").length === 0) return;
    let z = "";
    z = M.get("error") === "access_denied" ? "thirdPartyAccessDenied" : "somethingWentWrong";
    const ve = { name: z, code: z, message: M.get("error_description") };
    N(ve), M.delete("error"), M.delete("error_description"), history.replaceState(null, null, window.location.pathname + (M.size < 1 ? "" : `?${M.toString()}`));
  }, []), r(A.Fragment, { children: [r(Oe, { children: [r(de, { children: d("headlines.signUp") }), r(Pe, { state: C, error: D }), x ? r(A.Fragment, { children: [r(ne, Object.assign({ onSubmit: (M) => Gt(void 0, void 0, void 0, function* () {
    M.preventDefault(), S("email-submit");
    const z = yield C.actions.register_login_identifier({ email: h.email, username: h.username }).run();
    S(null), yield u.flow.run(z, f);
  }), maxWidth: !0 }, { children: [x.username ? r(Be, { markOptional: P, markError: P, type: "text", autoComplete: "username", autoCorrect: "off", flowInput: x.username, onInput: (M) => {
    if (M.preventDefault(), M.target instanceof HTMLInputElement) {
      const { value: z } = M.target;
      g((ve) => Object.assign(Object.assign({}, ve), { username: z }));
    }
  }, value: h.username, placeholder: d("labels.username") }) : null, x.email ? r(Be, { markOptional: P, markError: P, type: "email", autoComplete: "email", autoCorrect: "off", flowInput: x.email, onInput: (M) => {
    if (M.preventDefault(), M.target instanceof HTMLInputElement) {
      const { value: z } = M.target;
      g((ve) => Object.assign(Object.assign({}, ve), { email: z }));
    }
  }, value: h.email, placeholder: d("labels.email"), pattern: "^.*[^0-9]+$" }) : null, r(te, Object.assign({ uiAction: "email-submit", autofocus: !0 }, { children: d("labels.continue") }))] })), r(go, Object.assign({ hidden: !we }, { children: d("labels.or") }))] }) : null, !((i = (o = C.actions).thirdparty_oauth) === null || i === void 0) && i.call(o, null) ? (s = C.actions.thirdparty_oauth(null).inputs.provider.allowed_values) === null || s === void 0 ? void 0 : s.map((M) => r(ne, Object.assign({ onSubmit: (z) => ((ve, $e) => Gt(void 0, void 0, void 0, function* () {
    ve.preventDefault(), ie($e);
    const Ee = yield C.actions.thirdparty_oauth({ provider: $e, redirect_to: window.location.toString() }).run();
    ie(null), yield u.flow.run(Ee, f);
  }))(z, M.value) }, { children: r(te, Object.assign({ isLoading: M.value == U, secondary: !0, icon: M.value.startsWith("custom_") ? "customProvider" : M.value }, { children: d("labels.signInWith", { provider: M.name }) })) }), M.value)) : null, ((c = (a = C.actions).remember_me) === null || c === void 0 ? void 0 : c.call(a, null)) && r(A.Fragment, { children: [r(On, {}), r(vo, { required: !1, type: "checkbox", label: d("labels.staySignedIn"), checked: be, onChange: (M) => Gt(void 0, void 0, void 0, function* () {
    const z = yield C.actions.remember_me({ remember_me: !be }).run();
    se((ve) => !ve), yield u.flow.run(z, f);
  }) })] })] }), r(Ue, Object.assign({ hidden: O !== "auth" }, { children: [r("span", { hidden: !0 }), r(ee, Object.assign({ uiAction: "switch-flow", onClick: (M) => Gt(void 0, void 0, void 0, function* () {
    M.preventDefault(), l("login");
  }), loadingSpinnerPosition: "left" }, { children: d("labels.alreadyHaveAnAccount") }))] }))] });
};
var Yt = function(n, e, t, o) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        d(o.next(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      try {
        d(o.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, c);
    }
    d((o = o.apply(n, [])).next());
  });
};
const xr = (n) => {
  var e, t, o, i, s, a, c, d;
  const { t: l } = (0, _.useContext)(Z.TranslateContext), { hanko: u, stateHandler: h, setLoadingAction: g } = (0, _.useContext)(ue), { flowState: f } = Ne(n.state), [S, O] = (0, _.useState)();
  return r(A.Fragment, { children: [r(Oe, { children: [r(de, { children: l("headlines.registerPassword") }), r(Pe, { state: f }), r(q, { children: l("texts.passwordFormatHint", { minLength: f.actions.register_password(null).inputs.new_password.min_length, maxLength: 72 }) }), r(ne, Object.assign({ onSubmit: (C) => Yt(void 0, void 0, void 0, function* () {
    C.preventDefault(), g("password-submit");
    const x = yield f.actions.register_password({ new_password: S }).run();
    g(null), yield u.flow.run(x, h);
  }) }, { children: [r(Be, { type: "password", autocomplete: "new-password", flowInput: f.actions.register_password(null).inputs.new_password, placeholder: l("labels.newPassword"), onInput: (C) => Yt(void 0, void 0, void 0, function* () {
    C.target instanceof HTMLInputElement && O(C.target.value);
  }), autofocus: !0 }), r(te, Object.assign({ uiAction: "password-submit" }, { children: l("labels.continue") }))] }))] }), r(Ue, Object.assign({ hidden: !(!((t = (e = f.actions).back) === null || t === void 0) && t.call(e, null)) && !(!((i = (o = f.actions).skip) === null || i === void 0) && i.call(o, null)) }, { children: [r(ee, Object.assign({ uiAction: "back", onClick: (C) => Yt(void 0, void 0, void 0, function* () {
    C.preventDefault(), g("back");
    const x = yield f.actions.back(null).run();
    g(null), yield u.flow.run(x, h);
  }), loadingSpinnerPosition: "right", hidden: !(!((a = (s = f.actions).back) === null || a === void 0) && a.call(s, null)) }, { children: l("labels.back") })), r(ee, Object.assign({ uiAction: "skip", onClick: (C) => Yt(void 0, void 0, void 0, function* () {
    C.preventDefault(), g("skip");
    const x = yield f.actions.skip(null).run();
    g(null), yield u.flow.run(x, h);
  }), loadingSpinnerPosition: "left", hidden: !(!((d = (c = f.actions).skip) === null || d === void 0) && d.call(c, null)) }, { children: l("labels.skip") }))] }))] });
};
var pn = Y(21), jt = {};
jt.setAttributes = tt(), jt.insert = (n) => {
  window._hankoStyle = n;
}, jt.domAPI = et(), jt.insertStyleElement = nt(), Xe()(pn.A, jt);
const Ze = pn.A && pn.A.locals ? pn.A.locals : void 0, Pn = function({ name: n, columnSelector: e, contentSelector: t, data: o, checkedItemID: i, setCheckedItemID: s, dropdown: a = !1 }) {
  const c = (0, _.useCallback)((u) => `${n}-${u}`, [n]), d = (0, _.useCallback)((u) => c(u) === i, [i, c]), l = (u) => {
    if (!(u.target instanceof HTMLInputElement)) return;
    const h = parseInt(u.target.value, 10), g = c(h);
    s(g === i ? null : g);
  };
  return r("div", Object.assign({ className: Ze.accordion }, { children: o.map((u, h) => r("div", Object.assign({ className: Ze.accordionItem }, { children: [r("input", { type: "radio", className: Ze.accordionInput, id: `${n}-${h}`, name: n, onClick: l, value: h, checked: d(h) }), r("label", Object.assign({ className: Q()(Ze.label, a && Ze.dropdown), for: `${n}-${h}` }, { children: r("span", Object.assign({ className: Ze.labelText }, { children: e(u, h) })) })), r("div", Object.assign({ className: Q()(Ze.accordionContent, a && Ze.dropdownContent) }, { children: t(u, h) }))] }), h)) }));
}, Re = ({ children: n }) => r("h2", Object.assign({ part: "headline2", className: Q()(yn.headline, yn.grade2) }, { children: n })), Sr = ({ onEmailDelete: n, onEmailSetPrimary: e, onEmailVerify: t, checkedItemID: o, setCheckedItemID: i, emails: s = [], deletableEmailIDs: a = [] }) => {
  const { t: c } = (0, _.useContext)(Z.TranslateContext), d = (0, _.useMemo)(() => !1, []);
  return r(Pn, { name: "email-edit-dropdown", columnSelector: (l) => {
    const u = r("span", Object.assign({ className: Ze.description }, { children: l.is_verified ? l.is_primary ? r(A.Fragment, { children: [" -", " ", c("labels.primaryEmail")] }) : null : r(A.Fragment, { children: [" -", " ", c("labels.unverifiedEmail")] }) }));
    return l.is_primary ? r(A.Fragment, { children: [r("b", { children: l.address }), u] }) : r(A.Fragment, { children: [l.address, u] });
  }, data: s, contentSelector: (l) => {
    var u;
    return r(A.Fragment, { children: [l.is_primary ? r(A.Fragment, { children: r(q, { children: [r(Re, { children: c("headlines.isPrimaryEmail") }), c("texts.isPrimaryEmail")] }) }) : r(A.Fragment, { children: r(q, { children: [r(Re, { children: c("headlines.setPrimaryEmail") }), c("texts.setPrimaryEmail"), r("br", {}), r(ee, Object.assign({ uiAction: "email-set-primary", onClick: (h) => e(h, l.id), loadingSpinnerPosition: "right" }, { children: c("labels.setAsPrimaryEmail") }))] }) }), l.is_verified ? r(A.Fragment, { children: r(q, { children: [r(Re, { children: c("headlines.emailVerified") }), c("texts.emailVerified")] }) }) : r(A.Fragment, { children: r(q, { children: [r(Re, { children: c("headlines.emailUnverified") }), c("texts.emailUnverified"), r("br", {}), r(ee, Object.assign({ uiAction: "email-verify", onClick: (h) => t(h, l.id), loadingSpinnerPosition: "right" }, { children: c("labels.verify") }))] }) }), a.includes(l.id) ? r(A.Fragment, { children: r(q, { children: [r(Re, { children: c("headlines.emailDelete") }), c("texts.emailDelete"), r("br", {}), r(ee, Object.assign({ uiAction: "email-delete", dangerous: !0, onClick: (h) => n(h, l.id), disabled: d, loadingSpinnerPosition: "right" }, { children: c("labels.delete") }))] }) }) : null, ((u = l.identities) === null || u === void 0 ? void 0 : u.length) > 0 ? r(A.Fragment, { children: r(q, { children: [r(Re, { children: c("headlines.connectedAccounts") }), l.identities.map((h) => h.provider).join(", ")] }) }) : null] });
  }, checkedItemID: o, setCheckedItemID: i });
}, Cr = ({ onCredentialNameSubmit: n, oldName: e, onBack: t, credential: o, credentialType: i }) => {
  const { t: s } = (0, _.useContext)(Z.TranslateContext), [a, c] = (0, _.useState)(e);
  return r(A.Fragment, { children: [r(Oe, { children: [r(de, { children: s(i === "security-key" ? "headlines.renameSecurityKey" : "headlines.renamePasskey") }), r(Pe, { flowError: null }), r(q, { children: s(i === "security-key" ? "texts.renameSecurityKey" : "texts.renamePasskey") }), r(ne, Object.assign({ onSubmit: (d) => n(d, o.id, a) }, { children: [r(Be, { type: "text", name: i, value: a, minLength: 3, maxLength: 32, required: !0, placeholder: s(i === "security-key" ? "labels.newSecurityKeyName" : "labels.newPasskeyName"), onInput: (d) => {
    return l = void 0, u = void 0, g = function* () {
      d.target instanceof HTMLInputElement && c(d.target.value);
    }, new ((h = void 0) || (h = Promise))(function(f, S) {
      function O(P) {
        try {
          x(g.next(P));
        } catch (D) {
          S(D);
        }
      }
      function C(P) {
        try {
          x(g.throw(P));
        } catch (D) {
          S(D);
        }
      }
      function x(P) {
        var D;
        P.done ? f(P.value) : (D = P.value, D instanceof h ? D : new h(function(N) {
          N(D);
        })).then(O, C);
      }
      x((g = g.apply(l, u || [])).next());
    });
    var l, u, h, g;
  }, autofocus: !0 }), r(te, Object.assign({ uiAction: "webauthn-credential-rename" }, { children: s("labels.save") }))] }))] }), r(Ue, { children: r(ee, Object.assign({ onClick: t, loadingSpinnerPosition: "right" }, { children: s("labels.back") })) })] });
}, Vo = ({ credentials: n = [], checkedItemID: e, setCheckedItemID: t, onBack: o, onCredentialNameSubmit: i, onCredentialDelete: s, allowCredentialDeletion: a, credentialType: c }) => {
  const { t: d } = (0, _.useContext)(Z.TranslateContext), { setPage: l } = (0, _.useContext)(ue), u = (g) => {
    if (g.name) return g.name;
    const f = g.public_key.replace(/[\W_]/g, "");
    return `${c === "security-key" ? "SecurityKey" : "Passkey"}-${f.substring(f.length - 7, f.length)}`;
  }, h = (g) => new Date(g).toLocaleString();
  return r(Pn, { name: c === "security-key" ? "security-key-edit-dropdown" : "passkey-edit-dropdown", columnSelector: (g) => u(g), data: n, contentSelector: (g) => r(A.Fragment, { children: [r(q, { children: [r(Re, { children: d(c === "security-key" ? "headlines.renameSecurityKey" : "headlines.renamePasskey") }), d(c === "security-key" ? "texts.renameSecurityKey" : "texts.renamePasskey"), r("br", {}), r(ee, Object.assign({ onClick: (f) => ((S, O, C) => {
    S.preventDefault(), l(r(Cr, { oldName: u(O), credential: O, credentialType: C, onBack: o, onCredentialNameSubmit: i }));
  })(f, g, c), loadingSpinnerPosition: "right" }, { children: d("labels.rename") }))] }), r(q, Object.assign({ hidden: !a }, { children: [r(Re, { children: d(c === "security-key" ? "headlines.deleteSecurityKey" : "headlines.deletePasskey") }), d(c === "security-key" ? "texts.deleteSecurityKey" : "texts.deletePasskey"), r("br", {}), r(ee, Object.assign({ uiAction: "password-delete", dangerous: !0, onClick: (f) => s(f, g.id), loadingSpinnerPosition: "right" }, { children: d("labels.delete") }))] })), r(q, { children: [r(Re, { children: d("headlines.lastUsedAt") }), g.last_used_at ? h(g.last_used_at) : "-"] }), r(q, { children: [r(Re, { children: d("headlines.createdAt") }), h(g.created_at)] })] }), checkedItemID: e, setCheckedItemID: t });
}, qt = ({ name: n, title: e, children: t, checkedItemID: o, setCheckedItemID: i }) => r(Pn, { dropdown: !0, name: n, columnSelector: () => e, contentSelector: () => r(A.Fragment, { children: t }), setCheckedItemID: i, checkedItemID: o, data: [{}] }), yo = ({ flowError: n }) => {
  const { t: e } = (0, _.useContext)(Z.TranslateContext);
  return r(A.Fragment, { children: n ? r("div", Object.assign({ className: ji.errorMessage }, { children: e(`flowErrors.${n == null ? void 0 : n.code}`) })) : null });
}, Ar = ({ inputs: n, onEmailSubmit: e, checkedItemID: t, setCheckedItemID: o }) => {
  var i;
  const { t: s } = (0, _.useContext)(Z.TranslateContext), [a, c] = (0, _.useState)();
  return r(qt, Object.assign({ name: "email-create-dropdown", title: s("labels.addEmail"), checkedItemID: t, setCheckedItemID: o }, { children: [r(yo, { flowError: (i = n.email) === null || i === void 0 ? void 0 : i.error }), r(ne, Object.assign({ onSubmit: (d) => e(d, a).then(() => c("")) }, { children: [r(Be, { markError: !0, type: "email", placeholder: s("labels.newEmailAddress"), onInput: (d) => {
    d.preventDefault(), d.target instanceof HTMLInputElement && c(d.target.value);
  }, value: a, flowInput: n.email }), r(te, Object.assign({ uiAction: "email-submit" }, { children: s("labels.save") }))] }))] }));
}, Zo = ({ inputs: n, checkedItemID: e, setCheckedItemID: t, onPasswordSubmit: o, onPasswordDelete: i, allowPasswordDelete: s, passwordExists: a }) => {
  var c, d, l;
  const { t: u } = (0, _.useContext)(Z.TranslateContext), [h, g] = (0, _.useState)("");
  return r(qt, Object.assign({ name: "password-edit-dropdown", title: u(a ? "labels.changePassword" : "labels.setPassword"), checkedItemID: e, setCheckedItemID: t }, { children: [r(q, { children: u("texts.passwordFormatHint", { minLength: (c = n.password.min_length) === null || c === void 0 ? void 0 : c.toString(10), maxLength: (d = n.password.max_length) === null || d === void 0 ? void 0 : d.toString(10) }) }), r(yo, { flowError: (l = n.password) === null || l === void 0 ? void 0 : l.error }), r(ne, Object.assign({ onSubmit: (f) => o(f, h).then(() => g("")) }, { children: [r(Be, { markError: !0, autoComplete: "new-password", placeholder: u("labels.newPassword"), type: "password", onInput: (f) => {
    f.preventDefault(), f.target instanceof HTMLInputElement && g(f.target.value);
  }, value: h, flowInput: n.password }), r(te, Object.assign({ uiAction: "password-submit" }, { children: u("labels.save") }))] })), r(ee, Object.assign({ hidden: !s, uiAction: "password-delete", dangerous: !0, onClick: (f) => i(f).then(() => g("")), loadingSpinnerPosition: "right" }, { children: u("labels.delete") }))] }));
}, Jo = ({ checkedItemID: n, setCheckedItemID: e, onCredentialSubmit: t, credentialType: o }) => {
  const { t: i } = (0, _.useContext)(Z.TranslateContext), s = mt.supported();
  return r(qt, Object.assign({ name: o === "security-key" ? "security-key-create-dropdown" : "passkey-create-dropdown", title: i(o === "security-key" ? "labels.createSecurityKey" : "labels.createPasskey"), checkedItemID: n, setCheckedItemID: e }, { children: [r(q, { children: i(o === "security-key" ? "texts.securityKeySetUp" : "texts.setupPasskey") }), r(ne, Object.assign({ onSubmit: t }, { children: r(te, Object.assign({ uiAction: o === "security-key" ? "security-key-submit" : "passkey-submit", title: s ? null : i("labels.webauthnUnsupported") }, { children: i(o === "security-key" ? "labels.createSecurityKey" : "labels.createPasskey") })) }))] }));
}, Qo = ({ inputs: n, checkedItemID: e, setCheckedItemID: t, onUsernameSubmit: o, onUsernameDelete: i, hasUsername: s, allowUsernameDeletion: a }) => {
  var c;
  const { t: d } = (0, _.useContext)(Z.TranslateContext), [l, u] = (0, _.useState)();
  return r(qt, Object.assign({ name: "username-edit-dropdown", title: d(s ? "labels.changeUsername" : "labels.setUsername"), checkedItemID: e, setCheckedItemID: t }, { children: [r(yo, { flowError: (c = n.username) === null || c === void 0 ? void 0 : c.error }), r(ne, Object.assign({ onSubmit: (h) => o(h, l).then(() => u("")) }, { children: [r(Be, { markError: !0, placeholder: d("labels.username"), type: "text", onInput: (h) => {
    h.preventDefault(), h.target instanceof HTMLInputElement && u(h.target.value);
  }, value: l, flowInput: n.username }), r(te, Object.assign({ uiAction: "username-set" }, { children: d("labels.save") }))] })), r(ee, Object.assign({ hidden: !a, uiAction: "username-delete", dangerous: !0, onClick: (h) => i(h).then(() => u("")), loadingSpinnerPosition: "right" }, { children: d("labels.delete") }))] }));
}, Or = ({ onBack: n, onAccountDelete: e }) => {
  const { t } = (0, _.useContext)(Z.TranslateContext);
  return r(A.Fragment, { children: [r(Oe, { children: [r(de, { children: t("headlines.deleteAccount") }), r(Pe, { flowError: null }), r(q, { children: t("texts.deleteAccount") }), r(ne, Object.assign({ onSubmit: e }, { children: [r(vo, { required: !0, type: "checkbox", label: t("labels.deleteAccount") }), r(te, Object.assign({ uiAction: "account_delete" }, { children: t("labels.delete") }))] }))] }), r(Ue, { children: r(ee, Object.assign({ onClick: n }, { children: t("labels.back") })) })] });
}, Pr = ({ sessions: n = [], checkedItemID: e, setCheckedItemID: t, onSessionDelete: o, deletableSessionIDs: i }) => {
  const { t: s } = (0, _.useContext)(Z.TranslateContext), a = (c) => new Date(c).toLocaleString();
  return r(Pn, { name: "session-edit-dropdown", columnSelector: (c) => {
    const d = r("b", { children: c.user_agent ? c.user_agent : c.id }), l = c.current ? r("span", Object.assign({ className: Ze.description }, { children: r(A.Fragment, { children: [" -", " ", s("labels.currentSession")] }) })) : null;
    return r(A.Fragment, { children: [d, l] });
  }, data: n, contentSelector: (c) => r(A.Fragment, { children: [r(q, Object.assign({ hidden: !c.ip_address }, { children: [r(Re, { children: s("headlines.ipAddress") }), c.ip_address] })), r(q, { children: [r(Re, { children: s("headlines.lastUsed") }), a(c.last_used)] }), r(q, { children: [r(Re, { children: s("headlines.createdAt") }), a(c.created_at)] }), i != null && i.includes(c.id) ? r(q, { children: [r(Re, { children: s("headlines.revokeSession") }), r(ee, Object.assign({ uiAction: "session-delete", dangerous: !0, onClick: (d) => o(d, c.id), loadingSpinnerPosition: "right" }, { children: s("labels.revoke") }))] }) : null] }), checkedItemID: e, setCheckedItemID: t });
}, Er = ({ checkedItemID: n, setCheckedItemID: e, onDelete: t, onConnect: o, authAppSetUp: i, allowDeletion: s }) => {
  const { t: a } = (0, _.useContext)(Z.TranslateContext), c = r("span", Object.assign({ className: Ze.description }, { children: i ? r(A.Fragment, { children: [" -", " ", a("labels.configured")] }) : null })), d = r(A.Fragment, { children: [a("labels.authenticatorAppManage"), " ", c] });
  return r(qt, Object.assign({ name: "authenticator-app-manage-dropdown", title: d, checkedItemID: n, setCheckedItemID: e }, { children: [r(Re, { children: a(i ? "headlines.authenticatorAppAlreadySetUp" : "headlines.authenticatorAppNotSetUp") }), r(q, { children: [a(i ? "texts.authenticatorAppAlreadySetUp" : "texts.authenticatorAppNotSetUp"), r("br", {}), r(ee, i ? Object.assign({ hidden: !s, uiAction: "auth-app-remove", onClick: (l) => t(l), loadingSpinnerPosition: "right", dangerous: !0 }, { children: a("labels.delete") }) : Object.assign({ uiAction: "auth-app-add", onClick: (l) => o(l), loadingSpinnerPosition: "right" }, { children: a("labels.authenticatorAppAdd") }))] })] }));
};
var je = function(n, e, t, o) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        d(o.next(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      try {
        d(o.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, c);
    }
    d((o = o.apply(n, [])).next());
  });
};
const Di = (n) => {
  var e, t, o, i, s, a, c, d, l, u, h, g, f, S, O, C, x, P, D, N, U, ie, be, se, we, M, z, ve, $e, Ee, Le, re, ae, he, Ie, k, p, y, L, K, pe, ze, qe, Fe, m, v, b, j, T, I, W, X;
  const { t: G } = (0, _.useContext)(Z.TranslateContext), { hanko: _e, setLoadingAction: w, stateHandler: ke, setUIState: J, setPage: H } = (0, _.useContext)(ue), { flowState: E } = Ne(n.state), [xe, B] = (0, _.useState)(""), F = (R, V, Qe) => je(void 0, void 0, void 0, function* () {
    R.preventDefault(), w(V);
    const En = yield Qe();
    En != null && En.error || (B(null), yield new Promise((Ti) => setTimeout(Ti, 360))), w(null), yield _e.flow.run(En, ke);
  }), Me = (R) => je(void 0, void 0, void 0, function* () {
    return F(R, "password-delete", E.actions.password_delete(null).run);
  }), ot = (R) => je(void 0, void 0, void 0, function* () {
    return F(R, "username-delete", E.actions.username_delete(null).run);
  }), fe = (R, V, Qe) => je(void 0, void 0, void 0, function* () {
    return F(R, "webauthn-credential-rename", E.actions.webauthn_credential_rename({ passkey_id: V, passkey_name: Qe }).run);
  }), Kt = (R) => je(void 0, void 0, void 0, function* () {
    return F(R, "account_delete", E.actions.account_delete(null).run);
  }), st = (R) => (R.preventDefault(), H(r(Di, { state: E, enablePasskeys: n.enablePasskeys })), Promise.resolve());
  return r(Oe, { children: [r(Pe, { state: ((e = E == null ? void 0 : E.error) === null || e === void 0 ? void 0 : e.code) !== "form_data_invalid_error" ? E : null }), !((o = (t = E.actions).username_create) === null || o === void 0) && o.call(t, null) || !((s = (i = E.actions).username_update) === null || s === void 0) && s.call(i, null) || !((c = (a = E.actions).username_delete) === null || c === void 0) && c.call(a, null) ? r(A.Fragment, { children: [r(de, { children: G("labels.username") }), E.payload.user.username ? r(q, { children: r("b", { children: E.payload.user.username.username }) }) : null, r(q, { children: [!((l = (d = E.actions).username_create) === null || l === void 0) && l.call(d, null) ? r(Qo, { inputs: E.actions.username_create(null).inputs, hasUsername: !!E.payload.user.username, allowUsernameDeletion: !!(!((h = (u = E.actions).username_delete) === null || h === void 0) && h.call(u, null)), onUsernameSubmit: (R, V) => je(void 0, void 0, void 0, function* () {
    return F(R, "username-set", E.actions.username_create({ username: V }).run);
  }), onUsernameDelete: ot, checkedItemID: xe, setCheckedItemID: B }) : null, !((f = (g = E.actions).username_update) === null || f === void 0) && f.call(g, null) ? r(Qo, { inputs: E.actions.username_update(null).inputs, hasUsername: !!E.payload.user.username, allowUsernameDeletion: !!(!((O = (S = E.actions).username_delete) === null || O === void 0) && O.call(S, null)), onUsernameSubmit: (R, V) => je(void 0, void 0, void 0, function* () {
    return F(R, "username-set", E.actions.username_update({ username: V }).run);
  }), onUsernameDelete: ot, checkedItemID: xe, setCheckedItemID: B }) : null] })] }) : null, !((x = (C = E.payload) === null || C === void 0 ? void 0 : C.user) === null || x === void 0) && x.emails || !((D = (P = E.actions).email_create) === null || D === void 0) && D.call(P, null) ? r(A.Fragment, { children: [r(de, { children: G("headlines.profileEmails") }), r(q, { children: [r(Sr, { emails: E.payload.user.emails, onEmailDelete: (R, V) => je(void 0, void 0, void 0, function* () {
    return F(R, "email-delete", E.actions.email_delete({ email_id: V }).run);
  }), onEmailSetPrimary: (R, V) => je(void 0, void 0, void 0, function* () {
    return F(R, "email-set-primary", E.actions.email_set_primary({ email_id: V }).run);
  }), onEmailVerify: (R, V) => je(void 0, void 0, void 0, function* () {
    return F(R, "email-verify", E.actions.email_verify({ email_id: V }).run);
  }), checkedItemID: xe, setCheckedItemID: B, deletableEmailIDs: (ie = (U = (N = E.actions).email_delete) === null || U === void 0 ? void 0 : U.call(N, null).inputs.email_id.allowed_values) === null || ie === void 0 ? void 0 : ie.map((R) => R.value) }), !((se = (be = E.actions).email_create) === null || se === void 0) && se.call(be, null) ? r(Ar, { inputs: E.actions.email_create(null).inputs, onEmailSubmit: (R, V) => je(void 0, void 0, void 0, function* () {
    return J((Qe) => Object.assign(Object.assign({}, Qe), { email: V })), F(R, "email-submit", E.actions.email_create({ email: V }).run);
  }), checkedItemID: xe, setCheckedItemID: B }) : null] })] }) : null, !((M = (we = E.actions).password_create) === null || M === void 0) && M.call(we, null) ? r(A.Fragment, { children: [r(de, { children: G("headlines.profilePassword") }), r(q, { children: r(Zo, { inputs: E.actions.password_create(null).inputs, onPasswordSubmit: (R, V) => je(void 0, void 0, void 0, function* () {
    return F(R, "password-submit", E.actions.password_create({ password: V }).run);
  }), onPasswordDelete: Me, checkedItemID: xe, setCheckedItemID: B }) })] }) : null, !((ve = (z = E.actions).password_update) === null || ve === void 0) && ve.call(z, null) ? r(A.Fragment, { children: [r(de, { children: G("headlines.profilePassword") }), r(q, { children: r(Zo, { allowPasswordDelete: !!(!((Ee = ($e = E.actions).password_delete) === null || Ee === void 0) && Ee.call($e, null)), inputs: E.actions.password_update(null).inputs, onPasswordSubmit: (R, V) => je(void 0, void 0, void 0, function* () {
    return F(R, "password-submit", E.actions.password_update({ password: V }).run);
  }), onPasswordDelete: Me, checkedItemID: xe, setCheckedItemID: B, passwordExists: !0 }) })] }) : null, n.enablePasskeys && (!((re = (Le = E.payload) === null || Le === void 0 ? void 0 : Le.user) === null || re === void 0) && re.passkeys || !((he = (ae = E.actions).webauthn_credential_create) === null || he === void 0) && he.call(ae, null)) ? r(A.Fragment, { children: [r(de, { children: G("headlines.profilePasskeys") }), r(q, { children: [r(Vo, { onBack: st, onCredentialNameSubmit: fe, onCredentialDelete: (R, V) => je(void 0, void 0, void 0, function* () {
    return F(R, "passkey-delete", E.actions.webauthn_credential_delete({ passkey_id: V }).run);
  }), credentials: E.payload.user.passkeys, setError: null, checkedItemID: xe, setCheckedItemID: B, allowCredentialDeletion: !!(!((k = (Ie = E.actions).webauthn_credential_delete) === null || k === void 0) && k.call(Ie, null)), credentialType: "passkey" }), !((y = (p = E.actions).webauthn_credential_create) === null || y === void 0) && y.call(p, null) ? r(Jo, { credentialType: "passkey", onCredentialSubmit: (R) => je(void 0, void 0, void 0, function* () {
    return F(R, "passkey-submit", E.actions.webauthn_credential_create(null).run);
  }), setError: null, checkedItemID: xe, setCheckedItemID: B }) : null] })] }) : null, !((L = E.payload.user.mfa_config) === null || L === void 0) && L.security_keys_enabled ? r(A.Fragment, { children: [r(de, { children: G("headlines.securityKeys") }), r(q, { children: [r(Vo, { onBack: st, onCredentialNameSubmit: fe, onCredentialDelete: (R, V) => je(void 0, void 0, void 0, function* () {
    return F(R, "security-key-delete", E.actions.security_key_delete({ security_key_id: V }).run);
  }), credentials: E.payload.user.security_keys, setError: null, checkedItemID: xe, setCheckedItemID: B, allowCredentialDeletion: !!(!((pe = (K = E.actions).security_key_delete) === null || pe === void 0) && pe.call(K, null)), credentialType: "security-key" }), !((qe = (ze = E.actions).security_key_create) === null || qe === void 0) && qe.call(ze, null) ? r(Jo, { credentialType: "security-key", onCredentialSubmit: (R) => je(void 0, void 0, void 0, function* () {
    return F(R, "security-key-submit", E.actions.security_key_create(null).run);
  }), setError: null, checkedItemID: xe, setCheckedItemID: B }) : null] })] }) : null, !((Fe = E.payload.user.mfa_config) === null || Fe === void 0) && Fe.totp_enabled ? r(A.Fragment, { children: [r(de, { children: G("headlines.authenticatorApp") }), r(q, { children: r(Er, { onConnect: (R) => je(void 0, void 0, void 0, function* () {
    return F(R, "auth-app-add", E.actions.continue_to_otp_secret_creation(null).run);
  }), onDelete: (R) => je(void 0, void 0, void 0, function* () {
    return F(R, "auth-app-remove", E.actions.otp_secret_delete(null).run);
  }), allowDeletion: !!(!((v = (m = E.actions).otp_secret_delete) === null || v === void 0) && v.call(m, null)), authAppSetUp: (b = E.payload.user.mfa_config) === null || b === void 0 ? void 0 : b.auth_app_set_up, checkedItemID: xe, setCheckedItemID: B }) })] }) : null, E.payload.sessions ? r(A.Fragment, { children: [r(de, { children: G("headlines.profileSessions") }), r(q, { children: r(Pr, { sessions: E.payload.sessions, setError: null, checkedItemID: xe, setCheckedItemID: B, onSessionDelete: (R, V) => je(void 0, void 0, void 0, function* () {
    return F(R, "session-delete", E.actions.session_delete({ session_id: V }).run);
  }), deletableSessionIDs: (I = (T = (j = E.actions).session_delete) === null || T === void 0 ? void 0 : T.call(j, null).inputs.session_id.allowed_values) === null || I === void 0 ? void 0 : I.map((R) => R.value) }) })] }) : null, !((X = (W = E.actions).account_delete) === null || X === void 0) && X.call(W, null) ? r(A.Fragment, { children: [r(On, {}), r(q, { children: r(go, {}) }), r(q, { children: r(ne, Object.assign({ onSubmit: (R) => (R.preventDefault(), H(r(Or, { onBack: st, onAccountDelete: Kt })), Promise.resolve()) }, { children: r(te, Object.assign({ dangerous: !0 }, { children: G("headlines.deleteAccount") })) })) })] }) : null] });
}, Ir = Di, Go = ({ state: n, error: e }) => {
  const { t } = (0, _.useContext)(Z.TranslateContext), { init: o, componentName: i } = (0, _.useContext)(ue), s = (0, _.useCallback)(() => o(i), [i, o]);
  return (0, _.useEffect)(() => (addEventListener("hankoAuthSuccess", s), () => {
    removeEventListener("hankoAuthSuccess", s);
  }), [s]), r(Oe, { children: [r(de, { children: t("headlines.error") }), r(Pe, { state: n, error: e }), r(ne, Object.assign({ onSubmit: (a) => {
    a.preventDefault(), s();
  } }, { children: r(te, Object.assign({ uiAction: "retry" }, { children: t("labels.continue") })) }))] });
};
var Rn = function(n, e, t, o) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        d(o.next(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      try {
        d(o.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, c);
    }
    d((o = o.apply(n, [])).next());
  });
};
const jr = (n) => {
  var e, t, o, i;
  const { t: s } = (0, _.useContext)(Z.TranslateContext), { hanko: a, stateHandler: c, setLoadingAction: d } = (0, _.useContext)(ue), { flowState: l } = Ne(n.state), [u, h] = (0, _.useState)();
  return r(A.Fragment, { children: [r(Oe, { children: [r(de, { children: s("headlines.createEmail") }), r(Pe, { state: l }), r(ne, Object.assign({ onSubmit: (g) => Rn(void 0, void 0, void 0, function* () {
    g.preventDefault(), d("email-submit");
    const f = yield l.actions.email_address_set({ email: u }).run();
    d(null), yield a.flow.run(f, c);
  }) }, { children: [r(Be, { type: "email", autoComplete: "email", autoCorrect: "off", flowInput: (t = (e = l.actions).email_address_set) === null || t === void 0 ? void 0 : t.call(e, null).inputs.email, onInput: (g) => Rn(void 0, void 0, void 0, function* () {
    g.target instanceof HTMLInputElement && h(g.target.value);
  }), placeholder: s("labels.email"), pattern: "^.*[^0-9]+$", value: u }), r(te, Object.assign({ uiAction: "email-submit" }, { children: s("labels.continue") }))] }))] }), r(Ue, Object.assign({ hidden: !(!((i = (o = l.actions).skip) === null || i === void 0) && i.call(o, null)) }, { children: [r("span", { hidden: !0 }), r(ee, Object.assign({ uiAction: "skip", onClick: (g) => Rn(void 0, void 0, void 0, function* () {
    g.preventDefault(), d("skip");
    const f = yield l.actions.skip(null).run();
    d(null), yield a.flow.run(f, c);
  }), loadingSpinnerPosition: "left" }, { children: s("labels.skip") }))] }))] });
};
var Wn = function(n, e, t, o) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        d(o.next(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      try {
        d(o.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, c);
    }
    d((o = o.apply(n, [])).next());
  });
};
const Dr = (n) => {
  var e, t, o, i;
  const { t: s } = (0, _.useContext)(Z.TranslateContext), { hanko: a, stateHandler: c, setLoadingAction: d } = (0, _.useContext)(ue), { flowState: l } = Ne(n.state), [u, h] = (0, _.useState)();
  return r(A.Fragment, { children: [r(Oe, { children: [r(de, { children: s("headlines.createUsername") }), r(Pe, { state: l }), r(ne, Object.assign({ onSubmit: (g) => Wn(void 0, void 0, void 0, function* () {
    g.preventDefault(), d("username-set");
    const f = yield l.actions.username_create({ username: u }).run();
    d(null), yield a.flow.run(f, c);
  }) }, { children: [r(Be, { type: "text", autoComplete: "username", autoCorrect: "off", flowInput: (t = (e = l.actions).username_create) === null || t === void 0 ? void 0 : t.call(e, null).inputs.username, onInput: (g) => Wn(void 0, void 0, void 0, function* () {
    g.target instanceof HTMLInputElement && h(g.target.value);
  }), value: u, placeholder: s("labels.username") }), r(te, Object.assign({ uiAction: "username-set" }, { children: s("labels.continue") }))] }))] }), r(Ue, Object.assign({ hidden: !(!((i = (o = l.actions).skip) === null || i === void 0) && i.call(o, null)) }, { children: [r("span", { hidden: !0 }), r(ee, Object.assign({ uiAction: "skip", onClick: (g) => Wn(void 0, void 0, void 0, function* () {
    g.preventDefault(), d("skip");
    const f = yield l.actions.skip(null).run();
    d(null), yield a.flow.run(f, c);
  }), loadingSpinnerPosition: "left" }, { children: s("labels.skip") }))] }))] });
};
var Xt = function(n, e, t, o) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        d(o.next(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      try {
        d(o.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, c);
    }
    d((o = o.apply(n, [])).next());
  });
};
const $r = (n) => {
  var e, t, o, i, s, a, c, d, l, u, h, g;
  const { t: f } = (0, _.useContext)(Z.TranslateContext), { hanko: S, setLoadingAction: O, stateHandler: C } = (0, _.useContext)(ue), { flowState: x } = Ne(n.state);
  return r(A.Fragment, { children: [r(Oe, { children: [r(de, { children: f("headlines.setupLoginMethod") }), r(Pe, { flowError: x == null ? void 0 : x.error }), r(q, { children: f("texts.selectLoginMethodForFutureLogins") }), r(ne, Object.assign({ hidden: !(!((t = (e = x.actions).continue_to_passkey_registration) === null || t === void 0) && t.call(e, null)), onSubmit: (P) => Xt(void 0, void 0, void 0, function* () {
    P.preventDefault(), O("passkey-submit");
    const D = yield x.actions.continue_to_passkey_registration(null).run();
    O(null), yield S.flow.run(D, C);
  }) }, { children: r(te, Object.assign({ secondary: !0, uiAction: "passkey-submit", icon: "passkey" }, { children: f("labels.passkey") })) })), r(ne, Object.assign({ hidden: !(!((i = (o = x.actions).continue_to_password_registration) === null || i === void 0) && i.call(o, null)), onSubmit: (P) => Xt(void 0, void 0, void 0, function* () {
    P.preventDefault(), O("password-submit");
    const D = yield x.actions.continue_to_password_registration(null).run();
    O(null), yield S.flow.run(D, C);
  }) }, { children: r(te, Object.assign({ secondary: !0, uiAction: "password-submit", icon: "password" }, { children: f("labels.password") })) }))] }), r(Ue, Object.assign({ hidden: !(!((a = (s = x.actions).back) === null || a === void 0) && a.call(s, null)) && !(!((d = (c = x.actions).skip) === null || d === void 0) && d.call(c, null)) }, { children: [r(ee, Object.assign({ uiAction: "back", onClick: (P) => Xt(void 0, void 0, void 0, function* () {
    P.preventDefault(), O("back");
    const D = yield x.actions.back(null).run();
    O(null), yield S.flow.run(D, C);
  }), loadingSpinnerPosition: "right", hidden: !(!((u = (l = x.actions).back) === null || u === void 0) && u.call(l, null)) }, { children: f("labels.back") })), r(ee, Object.assign({ uiAction: "skip", onClick: (P) => Xt(void 0, void 0, void 0, function* () {
    P.preventDefault(), O("skip");
    const D = yield x.actions.skip(null).run();
    O(null), yield S.flow.run(D, C);
  }), loadingSpinnerPosition: "left", hidden: !(!((g = (h = x.actions).skip) === null || g === void 0) && g.call(h, null)) }, { children: f("labels.skip") }))] }))] });
};
var zn = function(n, e, t, o) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        d(o.next(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      try {
        d(o.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, c);
    }
    d((o = o.apply(n, [])).next());
  });
};
const Lr = (n) => {
  var e, t, o, i;
  const { t: s } = (0, _.useContext)(Z.TranslateContext), { flowState: a } = Ne(n.state), { hanko: c, setLoadingAction: d, stateHandler: l } = (0, _.useContext)(ue), [u, h] = (0, _.useState)([]), g = (0, _.useCallback)((f) => zn(void 0, void 0, void 0, function* () {
    d("passcode-submit");
    const S = yield a.actions.otp_code_validate({ otp_code: f }).run();
    d(null), yield c.flow.run(S, l);
  }), [c, a, d, l]);
  return (0, _.useEffect)(() => {
    var f;
    ((f = a.error) === null || f === void 0 ? void 0 : f.code) === "passcode_invalid" && h([]);
  }, [a]), r(A.Fragment, { children: [r(Oe, { children: [r(de, { children: s("headlines.otpLogin") }), r(Pe, { state: a }), r(q, { children: s("texts.otpLogin") }), r(ne, Object.assign({ onSubmit: (f) => zn(void 0, void 0, void 0, function* () {
    return f.preventDefault(), g(u.join(""));
  }) }, { children: [r(_o, { onInput: (f) => {
    if (h(f), f.filter((S) => S !== "").length === 6) return g(f.join(""));
  }, passcodeDigits: u, numberOfInputs: 6 }), r(te, Object.assign({ uiAction: "passcode-submit" }, { children: s("labels.continue") }))] }))] }), r(Ue, Object.assign({ hidden: !(!((t = (e = a.actions).continue_to_login_security_key) === null || t === void 0) && t.call(e, null)) }, { children: r(ee, Object.assign({ uiAction: "skip", onClick: (f) => zn(void 0, void 0, void 0, function* () {
    f.preventDefault(), d("skip");
    const S = yield a.actions.continue_to_login_security_key(null).run();
    d(null), yield c.flow.run(S, l);
  }), loadingSpinnerPosition: "right", hidden: !(!((i = (o = a.actions).continue_to_login_security_key) === null || i === void 0) && i.call(o, null)) }, { children: s("labels.useAnotherMethod") })) }))] });
};
var Yo = function(n, e, t, o) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        d(o.next(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      try {
        d(o.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, c);
    }
    d((o = o.apply(n, [])).next());
  });
};
const Tr = (n) => {
  var e, t, o, i;
  const { t: s } = (0, _.useContext)(Z.TranslateContext), { hanko: a, setLoadingAction: c, stateHandler: d } = (0, _.useContext)(ue), { flowState: l } = Ne(n.state);
  return r(A.Fragment, { children: [r(Oe, { children: [r(de, { children: s("headlines.securityKeyLogin") }), r(Pe, { state: l }), r(q, { children: s("texts.securityKeyLogin") }), r(ne, Object.assign({ onSubmit: (u) => Yo(void 0, void 0, void 0, function* () {
    u.preventDefault(), c("passkey-submit");
    const h = yield l.actions.webauthn_generate_request_options(null).run();
    yield a.flow.run(h, d);
  }) }, { children: r(te, Object.assign({ uiAction: "passkey-submit", autofocus: !0, icon: "securityKey" }, { children: s("labels.securityKeyUse") })) }))] }), r(Ue, Object.assign({ hidden: !(!((t = (e = l.actions).continue_to_login_otp) === null || t === void 0) && t.call(e, null)) }, { children: r(ee, Object.assign({ uiAction: "skip", onClick: (u) => Yo(void 0, void 0, void 0, function* () {
    u.preventDefault(), c("skip");
    const h = yield l.actions.continue_to_login_otp(null).run();
    c(null), yield a.flow.run(h, d);
  }), loadingSpinnerPosition: "right", hidden: !(!((i = (o = l.actions).continue_to_login_otp) === null || i === void 0) && i.call(o, null)) }, { children: s("labels.useAnotherMethod") })) }))] });
};
var en = function(n, e, t, o) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        d(o.next(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      try {
        d(o.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, c);
    }
    d((o = o.apply(n, [])).next());
  });
};
const Nr = (n) => {
  var e, t, o, i, s, a, c, d;
  const { t: l } = (0, _.useContext)(Z.TranslateContext), { hanko: u, setLoadingAction: h, stateHandler: g } = (0, _.useContext)(ue), { flowState: f } = Ne(n.state), S = (x) => en(void 0, void 0, void 0, function* () {
    x.preventDefault(), h("passcode-submit");
    const P = yield f.actions.continue_to_security_key_creation(null).run();
    h(null), yield u.flow.run(P, g);
  }), O = (x) => en(void 0, void 0, void 0, function* () {
    x.preventDefault(), h("password-submit");
    const P = yield f.actions.continue_to_otp_secret_creation(null).run();
    h(null), yield u.flow.run(P, g);
  }), C = (0, _.useMemo)(() => {
    const { actions: x } = f;
    return x.continue_to_security_key_creation && !x.continue_to_otp_secret_creation ? S : !x.continue_to_security_key_creation && x.continue_to_otp_secret_creation ? O : void 0;
  }, [f, S, O]);
  return r(A.Fragment, { children: [r(Oe, { children: [r(de, { children: l("headlines.mfaSetUp") }), r(Pe, { flowError: f == null ? void 0 : f.error }), r(q, { children: l("texts.mfaSetUp") }), C ? r(ne, Object.assign({ onSubmit: C }, { children: r(te, Object.assign({ uiAction: "passcode-submit" }, { children: l("labels.continue") })) })) : r(A.Fragment, { children: [r(ne, Object.assign({ hidden: !(!((t = (e = f.actions).continue_to_security_key_creation) === null || t === void 0) && t.call(e, null)), onSubmit: S }, { children: r(te, Object.assign({ secondary: !0, uiAction: "passcode-submit", icon: "securityKey" }, { children: l("labels.securityKey") })) })), r(ne, Object.assign({ hidden: !(!((i = (o = f.actions).continue_to_otp_secret_creation) === null || i === void 0) && i.call(o, null)), onSubmit: O }, { children: r(te, Object.assign({ secondary: !0, uiAction: "password-submit", icon: "qrCodeScanner" }, { children: l("labels.authenticatorApp") })) }))] })] }), r(Ue, { children: [r(ee, Object.assign({ uiAction: "back", onClick: (x) => en(void 0, void 0, void 0, function* () {
    x.preventDefault(), h("back");
    const P = yield f.actions.back(null).run();
    h(null), yield u.flow.run(P, g);
  }), loadingSpinnerPosition: "right", hidden: !(!((a = (s = f.actions).back) === null || a === void 0) && a.call(s, null)) }, { children: l("labels.back") })), r(ee, Object.assign({ uiAction: "skip", onClick: (x) => en(void 0, void 0, void 0, function* () {
    x.preventDefault(), h("skip");
    const P = yield f.actions.skip(null).run();
    h(null), yield u.flow.run(P, g);
  }), loadingSpinnerPosition: "left", hidden: !(!((d = (c = f.actions).skip) === null || d === void 0) && d.call(c, null)) }, { children: l("labels.skip") }))] })] });
};
var fn = Y(560), Dt = {};
Dt.setAttributes = tt(), Dt.insert = (n) => {
  window._hankoStyle = n;
}, Dt.domAPI = et(), Dt.insertStyleElement = nt(), Xe()(fn.A, Dt);
const Ur = fn.A && fn.A.locals ? fn.A.locals : void 0, Mr = ({ children: n, text: e }) => {
  const { t } = (0, _.useContext)(Z.TranslateContext), [o, i] = (0, _.useState)(!1);
  return r("section", Object.assign({ className: Rt.clipboardContainer }, { children: [r("div", { children: [n, " "] }), r("div", Object.assign({ className: Rt.clipboardIcon, onClick: (s) => {
    return a = void 0, c = void 0, l = function* () {
      s.preventDefault();
      try {
        yield navigator.clipboard.writeText(e), i(!0), setTimeout(() => i(!1), 1500);
      } catch (u) {
        console.error("Failed to copy: ", u);
      }
    }, new ((d = void 0) || (d = Promise))(function(u, h) {
      function g(O) {
        try {
          S(l.next(O));
        } catch (C) {
          h(C);
        }
      }
      function f(O) {
        try {
          S(l.throw(O));
        } catch (C) {
          h(C);
        }
      }
      function S(O) {
        var C;
        O.done ? u(O.value) : (C = O.value, C instanceof d ? C : new d(function(x) {
          x(C);
        })).then(g, f);
      }
      S((l = l.apply(a, c || [])).next());
    });
    var a, c, d, l;
  } }, { children: o ? r("span", { children: ["- ", t("labels.copied")] }) : r(Wt, { name: "copy", secondary: !0, size: 13 }) }))] }));
}, Hr = ({ src: n, secret: e }) => {
  const { t } = (0, _.useContext)(Z.TranslateContext);
  return r("div", Object.assign({ className: Ur.otpCreationDetails }, { children: [r("img", { alt: "QR-Code", src: n }), r(On, {}), r(Mr, Object.assign({ text: e }, { children: t("texts.otpSecretKey") })), r("div", { children: e })] }));
};
var qn = function(n, e, t, o) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        d(o.next(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      try {
        d(o.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, c);
    }
    d((o = o.apply(n, [])).next());
  });
};
const Rr = (n) => {
  const { t: e } = (0, _.useContext)(Z.TranslateContext), { flowState: t } = Ne(n.state), { hanko: o, uiState: i, setLoadingAction: s, stateHandler: a } = (0, _.useContext)(ue), [c, d] = (0, _.useState)([]), l = (0, _.useCallback)((u) => qn(void 0, void 0, void 0, function* () {
    s("passcode-submit");
    const h = yield t.actions.otp_code_verify({ otp_code: u }).run();
    s(null), yield o.flow.run(h, a);
  }), [t, s, a]);
  return (0, _.useEffect)(() => {
    var u;
    ((u = t.error) === null || u === void 0 ? void 0 : u.code) === "passcode_invalid" && d([]);
  }, [t]), r(A.Fragment, { children: [r(Oe, { children: [r(de, { children: e("headlines.otpSetUp") }), r(Pe, { state: t }), r(q, { children: e("texts.otpScanQRCode") }), r(Hr, { src: t.payload.otp_image_source, secret: t.payload.otp_secret }), r(q, { children: e("texts.otpEnterVerificationCode") }), r(ne, Object.assign({ onSubmit: (u) => qn(void 0, void 0, void 0, function* () {
    return u.preventDefault(), l(c.join(""));
  }) }, { children: [r(_o, { onInput: (u) => {
    if (d(u), u.filter((h) => h !== "").length === 6) return l(u.join(""));
  }, passcodeDigits: c, numberOfInputs: 6 }), r(te, Object.assign({ uiAction: "passcode-submit" }, { children: e("labels.continue") }))] }))] }), r(Ue, { children: r(ee, Object.assign({ onClick: (u) => qn(void 0, void 0, void 0, function* () {
    u.preventDefault(), s("back");
    const h = yield t.actions.back(null).run();
    s(null), yield o.flow.run(h, a);
  }), loadingSpinnerPosition: "right", isLoading: i.loadingAction === "back" }, { children: e("labels.back") })) })] });
};
var Xo = function(n, e, t, o) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        d(o.next(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      try {
        d(o.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, c);
    }
    d((o = o.apply(n, [])).next());
  });
};
const Wr = (n) => {
  var e, t, o, i;
  const { t: s } = (0, _.useContext)(Z.TranslateContext), { hanko: a, setLoadingAction: c, stateHandler: d } = (0, _.useContext)(ue), { flowState: l } = Ne(n.state);
  return r(A.Fragment, { children: [r(Oe, { children: [r(de, { children: s("headlines.securityKeySetUp") }), r(Pe, { state: l }), r(q, { children: s("texts.securityKeySetUp") }), r(ne, Object.assign({ onSubmit: (u) => Xo(void 0, void 0, void 0, function* () {
    u.preventDefault(), c("passkey-submit");
    const h = yield l.actions.webauthn_generate_creation_options(null).run();
    yield a.flow.run(h, d);
  }) }, { children: r(te, Object.assign({ uiAction: "passkey-submit", autofocus: !0, icon: "securityKey" }, { children: s("labels.createSecurityKey") })) }))] }), r(Ue, Object.assign({ hidden: !(!((t = (e = l.actions).back) === null || t === void 0) && t.call(e, null)) }, { children: r(ee, Object.assign({ uiAction: "back", onClick: (u) => Xo(void 0, void 0, void 0, function* () {
    u.preventDefault(), c("back");
    const h = yield l.actions.back(null).run();
    c(null), yield a.flow.run(h, d);
  }), loadingSpinnerPosition: "right", hidden: !(!((i = (o = l.actions).back) === null || i === void 0) && i.call(o, null)) }, { children: s("labels.back") })) }))] });
};
var Fn = function(n, e, t, o) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        d(o.next(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      try {
        d(o.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, c);
    }
    d((o = o.apply(n, [])).next());
  });
};
const zr = (n) => {
  var e, t, o, i;
  const { t: s } = (0, _.useContext)(Z.TranslateContext), { hanko: a, setLoadingAction: c, stateHandler: d } = (0, _.useContext)(ue), { flowState: l } = Ne(n.state);
  return r(A.Fragment, { children: [r(Oe, { children: [r(de, { children: s("headlines.trustDevice") }), r(Pe, { flowError: l == null ? void 0 : l.error }), r(q, { children: s("texts.trustDevice") }), r(ne, Object.assign({ onSubmit: (u) => Fn(void 0, void 0, void 0, function* () {
    u.preventDefault(), c("trust-device-submit");
    const h = yield l.actions.trust_device(null).run();
    c(null), yield a.flow.run(h, d);
  }) }, { children: r(te, Object.assign({ uiAction: "trust-device-submit" }, { children: s("labels.trustDevice") })) }))] }), r(Ue, { children: [r(ee, Object.assign({ uiAction: "back", onClick: (u) => Fn(void 0, void 0, void 0, function* () {
    u.preventDefault(), c("back");
    const h = yield l.actions.back(null).run();
    c(null), yield a.flow.run(h, d);
  }), loadingSpinnerPosition: "right", hidden: !(!((t = (e = l.actions).back) === null || t === void 0) && t.call(e, null)) }, { children: s("labels.back") })), r(ee, Object.assign({ uiAction: "skip", onClick: (u) => Fn(void 0, void 0, void 0, function* () {
    u.preventDefault(), c("skip");
    const h = yield l.actions.skip(null).run();
    c(null), yield a.flow.run(h, d);
  }), loadingSpinnerPosition: "left", hidden: !(!((i = (o = l.actions).skip) === null || i === void 0) && i.call(o, null)) }, { children: s("labels.skip") }))] })] });
};
var Ke = function(n, e, t, o) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        d(o.next(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      try {
        d(o.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, c);
    }
    d((o = o.apply(n, [])).next());
  });
};
const tn = "flow-state", ue = (0, A.createContext)(null), qr = (n) => {
  var { lang: e, experimental: t = "", prefilledEmail: o, prefilledUsername: i, globalOptions: s, createWebauthnAbortSignal: a } = n, c = function(p, y) {
    var L = {};
    for (var K in p) Object.prototype.hasOwnProperty.call(p, K) && y.indexOf(K) < 0 && (L[K] = p[K]);
    if (p != null && typeof Object.getOwnPropertySymbols == "function") {
      var pe = 0;
      for (K = Object.getOwnPropertySymbols(p); pe < K.length; pe++) y.indexOf(K[pe]) < 0 && Object.prototype.propertyIsEnumerable.call(p, K[pe]) && (L[K[pe]] = p[K[pe]]);
    }
    return L;
  }(n, ["lang", "experimental", "prefilledEmail", "prefilledUsername", "globalOptions", "createWebauthnAbortSignal"]);
  const { hanko: d, injectStyles: l, hidePasskeyButtonOnLogin: u, translations: h, translationsLocation: g, fallbackLanguage: f } = s;
  d.setLang((e == null ? void 0 : e.toString()) || f);
  const S = (0, _.useRef)(null), O = (0, _.useMemo)(() => `${s.storageKey}_last_login`, [s.storageKey]), [C, x] = (0, _.useState)(c.componentName), P = (0, _.useMemo)(() => t.split(" ").filter((p) => p.length).map((p) => p), [t]), D = (0, _.useMemo)(() => r(hr, {}), []), [N, U] = (0, _.useState)(D), [, ie] = (0, _.useState)(d), [be, se] = (0, _.useState)(), [we, M] = (0, _.useState)({ email: o, username: i }), z = (0, _.useCallback)((p) => {
    M((y) => Object.assign(Object.assign({}, y), { loadingAction: p, succeededAction: null, error: null, lastAction: p || y.lastAction }));
  }, []), ve = (0, _.useCallback)((p) => {
    M((y) => Object.assign(Object.assign({}, y), { succeededAction: p, loadingAction: null }));
  }, []), $e = (0, _.useCallback)(() => {
    M((p) => Object.assign(Object.assign({}, p), { succeededAction: p.lastAction, loadingAction: null, error: null }));
  }, []), Ee = (0, _.useMemo)(() => !!we.loadingAction || !!we.succeededAction, [we]), Le = function(p, y) {
    var L;
    (L = S.current) === null || L === void 0 || L.dispatchEvent(new CustomEvent(p, { detail: y, bubbles: !1, composed: !0 }));
  }, re = (p) => {
    z(null), U(r(Go, { error: p instanceof Ce ? p : new De(p) }));
  }, ae = (0, _.useMemo)(() => ({ onError: (p) => {
    re(p);
  }, preflight(p) {
    return Ke(this, void 0, void 0, function* () {
      const y = yield mt.isConditionalMediationAvailable(), L = yield mt.isPlatformAuthenticatorAvailable(), K = yield p.actions.register_client_capabilities({ webauthn_available: k, webauthn_conditional_mediation_available: y, webauthn_platform_authenticator_available: L }).run();
      return d.flow.run(K, ae);
    });
  }, login_init(p) {
    return Ke(this, void 0, void 0, function* () {
      U(r(fr, { state: p })), function() {
        Ke(this, void 0, void 0, function* () {
          if (p.payload.request_options) {
            let y;
            try {
              y = yield Fo({ publicKey: p.payload.request_options.publicKey, mediation: "conditional", signal: a() });
            } catch {
              return;
            }
            z("passkey-submit");
            const L = yield p.actions.webauthn_verify_assertion_response({ assertion_response: y }).run();
            z(null), yield d.flow.run(L, ae);
          }
        });
      }();
    });
  }, passcode_confirmation(p) {
    U(r(vr, { state: p }));
  }, login_otp(p) {
    return Ke(this, void 0, void 0, function* () {
      U(r(Lr, { state: p }));
    });
  }, login_passkey(p) {
    return Ke(this, void 0, void 0, function* () {
      let y;
      z("passkey-submit");
      try {
        y = yield Fo(Object.assign(Object.assign({}, p.payload.request_options), { signal: a() }));
      } catch {
        const pe = yield p.actions.back(null).run();
        return M((ze) => Object.assign(Object.assign({}, ze), { error: p.error, loadingAction: null })), d.flow.run(pe, ae);
      }
      const L = yield p.actions.webauthn_verify_assertion_response({ assertion_response: y }).run();
      z(null), yield d.flow.run(L, ae);
    });
  }, onboarding_create_passkey(p) {
    U(r(_r, { state: p }));
  }, onboarding_verify_passkey_attestation(p) {
    return Ke(this, void 0, void 0, function* () {
      let y;
      try {
        y = yield qo(Object.assign(Object.assign({}, p.payload.creation_options), { signal: a() }));
      } catch {
        const pe = yield p.actions.back(null).run();
        return z(null), yield d.flow.run(pe, ae), void M((ze) => Object.assign(Object.assign({}, ze), { error: { code: "webauthn_credential_already_exists", message: "Webauthn credential already exists" } }));
      }
      const L = yield p.actions.webauthn_verify_attestation_response({ public_key: y }).run();
      z(null), yield d.flow.run(L, ae);
    });
  }, webauthn_credential_verification(p) {
    return Ke(this, void 0, void 0, function* () {
      let y;
      try {
        y = yield qo(Object.assign(Object.assign({}, p.payload.creation_options), { signal: a() }));
      } catch {
        const pe = yield p.actions.back(null).run();
        return z(null), yield d.flow.run(pe, ae), void M((ze) => Object.assign(Object.assign({}, ze), { error: { code: "webauthn_credential_already_exists", message: "Webauthn credential already exists" } }));
      }
      const L = yield p.actions.webauthn_verify_attestation_response({ public_key: y }).run();
      yield d.flow.run(L, ae);
    });
  }, login_password(p) {
    U(r(yr, { state: p }));
  }, login_password_recovery(p) {
    U(r(br, { state: p }));
  }, login_security_key(p) {
    return Ke(this, void 0, void 0, function* () {
      U(r(Tr, { state: p }));
    });
  }, mfa_method_chooser(p) {
    return Ke(this, void 0, void 0, function* () {
      U(r(Nr, { state: p }));
    });
  }, mfa_otp_secret_creation(p) {
    return Ke(this, void 0, void 0, function* () {
      U(r(Rr, { state: p }));
    });
  }, mfa_security_key_creation(p) {
    return Ke(this, void 0, void 0, function* () {
      U(r(Wr, { state: p }));
    });
  }, login_method_chooser(p) {
    U(r(kr, { state: p }));
  }, registration_init(p) {
    U(r(wr, { state: p }));
  }, password_creation(p) {
    U(r(xr, { state: p }));
  }, success(p) {
    var y;
    !((y = p.payload) === null || y === void 0) && y.last_login && localStorage.setItem(O, JSON.stringify(p.payload.last_login));
    const { claims: L } = p.payload, K = Date.parse(L.expiration) - Date.now();
    d.relay.dispatchSessionCreatedEvent({ claims: L, expirationSeconds: K }), $e();
  }, profile_init(p) {
    U(r(Ir, { state: p, enablePasskeys: s.enablePasskeys }));
  }, thirdparty(p) {
    return Ke(this, void 0, void 0, function* () {
      const y = new URLSearchParams(window.location.search).get("hanko_token");
      if (y && y.length > 0) {
        const L = new URLSearchParams(window.location.search), K = yield p.actions.exchange_token({ token: L.get("hanko_token") }).run();
        L.delete("hanko_token"), L.delete("saml_hint"), history.replaceState(null, null, window.location.pathname + (L.size < 1 ? "" : `?${L.toString()}`)), yield d.flow.run(K, ae);
      } else M((L) => Object.assign(Object.assign({}, L), { lastAction: null })), localStorage.setItem(tn, JSON.stringify(p.toJSON())), window.location.assign(p.payload.redirect_url);
    });
  }, error(p) {
    z(null), U(r(Go, { state: p }));
  }, onboarding_email(p) {
    U(r(jr, { state: p }));
  }, onboarding_username(p) {
    U(r(Dr, { state: p }));
  }, credential_onboarding_chooser(p) {
    U(r($r, { state: p }));
  }, account_deleted(p) {
    return Ke(this, void 0, void 0, function* () {
      yield d.user.logout(), d.relay.dispatchUserDeletedEvent();
    });
  }, device_trust(p) {
    U(r(zr, { state: p }));
  } }), [s.enablePasskeys, d, $e, z]), he = (0, _.useCallback)((p) => Ke(void 0, void 0, void 0, function* () {
    z("switch-flow");
    const y = localStorage.getItem(O);
    y && se(JSON.parse(y));
    const L = new URLSearchParams(window.location.search).get("hanko_token"), K = localStorage.getItem(tn);
    new URLSearchParams(window.location.search).get("saml_hint") === "idp_initiated" ? yield d.flow.init("/token_exchange", Object.assign({}, ae)) : K && K.length > 0 && L && L.length > 0 ? (yield d.flow.fromString(localStorage.getItem(tn), Object.assign({}, ae)), localStorage.removeItem(tn)) : yield d.flow.init(p, Object.assign({}, ae)), z(null);
  }), [ae]), Ie = (0, _.useCallback)((p) => {
    switch (p) {
      case "auth":
      case "login":
        he("/login").catch(re);
        break;
      case "registration":
        he("/registration").catch(re);
        break;
      case "profile":
        he("/profile").catch(re);
    }
  }, [he]);
  (0, _.useEffect)(() => Ie(C), []), (0, _.useEffect)(() => {
    d.onUserDeleted(() => {
      Le("onUserDeleted");
    }), d.onSessionCreated((p) => {
      Le("onSessionCreated", p);
    }), d.onSessionExpired(() => {
      Le("onSessionExpired");
    }), d.onUserLoggedOut(() => {
      Le("onUserLoggedOut");
    });
  }, [d]), (0, _.useMemo)(() => {
    const p = () => {
      Ie(C);
    };
    ["auth", "login", "registration"].includes(C) ? (d.onUserLoggedOut(p), d.onSessionExpired(p), d.onUserDeleted(p)) : C === "profile" && d.onSessionCreated(p);
  }, []);
  const k = mt.supported();
  return r(ue.Provider, Object.assign({ value: { init: Ie, initialComponentName: c.componentName, isDisabled: Ee, setUIState: M, setLoadingAction: z, setSucceededAction: ve, uiState: we, hanko: d, setHanko: ie, lang: (e == null ? void 0 : e.toString()) || f, prefilledEmail: o, prefilledUsername: i, componentName: C, setComponentName: x, experimentalFeatures: P, hidePasskeyButtonOnLogin: u, page: N, setPage: U, stateHandler: ae, lastLogin: be } }, { children: r(Z.TranslateProvider, Object.assign({ translations: h, fallbackLang: f, root: g }, { children: r(Vs, Object.assign({ ref: S }, { children: C !== "events" ? r(A.Fragment, { children: [l ? r("style", { dangerouslySetInnerHTML: { __html: window._hankoStyle.innerHTML } }) : null, N] }) : null })) })) }));
}, Fr = { en: Y(6).en };
var $i = function(n, e, t, o) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        d(o.next(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      try {
        d(o.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, c);
    }
    d((o = o.apply(n, [])).next());
  });
};
const Ge = {}, Ft = (n, e) => r(qr, Object.assign({ componentName: n, globalOptions: Ge, createWebauthnAbortSignal: Qr }, e)), Kr = (n) => Ft("auth", n), Br = (n) => Ft("login", n), Vr = (n) => Ft("registration", n), Zr = (n) => Ft("profile", n), Jr = (n) => Ft("events", n);
let nn = new AbortController();
const Qr = () => (nn && nn.abort(), nn = new AbortController(), nn.signal), $t = ({ tagName: n, entryComponent: e, shadow: t = !0, observedAttributes: o }) => $i(void 0, void 0, void 0, function* () {
  customElements.get(n) || function(i, s, a, c) {
    function d() {
      var l = Reflect.construct(HTMLElement, [], d);
      return l._vdomComponent = i, l._root = c && c.shadow ? l.attachShadow({ mode: "open" }) : l, l;
    }
    (d.prototype = Object.create(HTMLElement.prototype)).constructor = d, d.prototype.connectedCallback = cs, d.prototype.attributeChangedCallback = ds, d.prototype.disconnectedCallback = us, a = a || i.observedAttributes || Object.keys(i.propTypes || {}), d.observedAttributes = a, a.forEach(function(l) {
      Object.defineProperty(d.prototype, l, { get: function() {
        var u, h, g, f;
        return (u = (h = this._vdom) == null || (g = h.props) == null ? void 0 : g[l]) != null ? u : (f = this._props) == null ? void 0 : f[l];
      }, set: function(u) {
        this._vdom ? this.attributeChangedCallback(l, null, u) : (this._props || (this._props = {}), this._props[l] = u, this.connectedCallback());
        var h = typeof u;
        u != null && h !== "string" && h !== "boolean" && h !== "number" || this.setAttribute(l, u);
      } });
    }), customElements.define(s || i.tagName || i.displayName || i.name, d);
  }(e, n, o, { shadow: t });
}), Gr = (n, e = {}) => $i(void 0, void 0, void 0, function* () {
  const t = ["api", "lang", "experimental", "prefilled-email", "entry"];
  return e = Object.assign({ shadow: !0, injectStyles: !0, enablePasskeys: !0, hidePasskeyButtonOnLogin: !1, translations: null, translationsLocation: "/i18n", fallbackLanguage: "en", storageKey: "hanko", sessionCheckInterval: 3e4 }, e), Ge.hanko = new Ii(n, { cookieName: e.storageKey, cookieDomain: e.cookieDomain, cookieSameSite: e.cookieSameSite, localStorageKey: e.storageKey, sessionCheckInterval: e.sessionCheckInterval, sessionTokenLocation: e.sessionTokenLocation }), Ge.injectStyles = e.injectStyles, Ge.enablePasskeys = e.enablePasskeys, Ge.hidePasskeyButtonOnLogin = e.hidePasskeyButtonOnLogin, Ge.translations = e.translations || Fr, Ge.translationsLocation = e.translationsLocation, Ge.fallbackLanguage = e.fallbackLanguage, Ge.storageKey = e.storageKey, yield Promise.all([$t(Object.assign(Object.assign({}, e), { tagName: "hanko-auth", entryComponent: Kr, observedAttributes: t })), $t(Object.assign(Object.assign({}, e), { tagName: "hanko-login", entryComponent: Br, observedAttributes: t })), $t(Object.assign(Object.assign({}, e), { tagName: "hanko-registration", entryComponent: Vr, observedAttributes: t })), $t(Object.assign(Object.assign({}, e), { tagName: "hanko-profile", entryComponent: Zr, observedAttributes: t.filter((o) => ["api", "lang"].includes(o)) })), $t(Object.assign(Object.assign({}, e), { tagName: "hanko-events", entryComponent: Jr, observedAttributes: [] }))]), { hanko: Ge.hanko };
});
oe.fK;
oe.tJ;
oe.Z7;
oe.Q9;
oe.Lv;
oe.qQ;
var Yr = oe.I4;
oe.O8;
oe.ku;
oe.ls;
oe.bO;
oe.yv;
oe.AT;
oe.m_;
oe.KG;
oe.DH;
oe.kf;
oe.oY;
oe.xg;
oe.Wg;
oe.J;
oe.AC;
oe.D_;
oe.jx;
oe.nX;
oe.Nx;
oe.Sd;
var Li = oe.kz;
oe.fX;
oe.qA;
oe.tz;
oe.gN;
const Xr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Hanko: Yr,
  register: Li
}, Symbol.toStringTag, { value: "Module" })), ea = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%20fill='currentColor'%20class='bi%20bi-person-vcard'%20viewBox='0%200%2016%2016'%3e%3cpath%20d='M5%208a2%202%200%201%200%200-4%202%202%200%200%200%200%204m4-2.5a.5.5%200%200%201%20.5-.5h4a.5.5%200%200%201%200%201h-4a.5.5%200%200%201-.5-.5M9%208a.5.5%200%200%201%20.5-.5h4a.5.5%200%200%201%200%201h-4A.5.5%200%200%201%209%208m1%202.5a.5.5%200%200%201%20.5-.5h3a.5.5%200%200%201%200%201h-3a.5.5%200%200%201-.5-.5'/%3e%3cpath%20d='M2%202a2%202%200%200%200-2%202v8a2%202%200%200%200%202%202h12a2%202%200%200%200%202-2V4a2%202%200%200%200-2-2zM1%204a1%201%200%200%201%201-1h12a1%201%200%200%201%201%201v8a1%201%200%200%201-1%201H8.96q.04-.245.04-.5C9%2010.567%207.21%209%205%209c-2.086%200-3.8%201.398-3.984%203.181A1%201%200%200%201%201%2012z'/%3e%3c/svg%3e", ta = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%20fill='currentColor'%20class='bi%20bi-box-arrow-right'%20viewBox='0%200%2016%2016'%3e%3cpath%20fill-rule='evenodd'%20d='M10%2012.5a.5.5%200%200%201-.5.5h-8a.5.5%200%200%201-.5-.5v-9a.5.5%200%200%201%20.5-.5h8a.5.5%200%200%201%20.5.5v2a.5.5%200%200%200%201%200v-2A1.5%201.5%200%200%200%209.5%202h-8A1.5%201.5%200%200%200%200%203.5v9A1.5%201.5%200%200%200%201.5%2014h8a1.5%201.5%200%200%200%201.5-1.5v-2a.5.5%200%200%200-1%200z'/%3e%3cpath%20fill-rule='evenodd'%20d='M15.854%208.354a.5.5%200%200%200%200-.708l-3-3a.5.5%200%200%200-.708.708L14.293%207.5H5.5a.5.5%200%200%200%200%201h8.793l-2.147%202.146a.5.5%200%200%200%20.708.708z'/%3e%3c/svg%3e", na = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%20fill='currentColor'%20class='bi%20bi-map'%20viewBox='0%200%2016%2016'%3e%3cpath%20fill-rule='evenodd'%20d='M15.817.113A.5.5%200%200%201%2016%20.5v14a.5.5%200%200%201-.402.49l-5%201a.5.5%200%200%201-.196%200L5.5%2015.01l-4.902.98A.5.5%200%200%201%200%2015.5v-14a.5.5%200%200%201%20.402-.49l5-1a.5.5%200%200%201%20.196%200L10.5.99l4.902-.98a.5.5%200%200%201%20.415.103M10%201.91l-4-.8v12.98l4%20.8zm1%2012.98%204-.8V1.11l-4%20.8zm-6-.8V1.11l-4%20.8v12.98z'/%3e%3c/svg%3e", oa = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%20fill='currentColor'%20class='bi%20bi-person-check'%20viewBox='0%200%2016%2016'%3e%3cpath%20d='M12.5%2016a3.5%203.5%200%201%200%200-7%203.5%203.5%200%200%200%200%207m1.679-4.493-1.335%202.226a.75.75%200%200%201-1.174.144l-.774-.773a.5.5%200%200%201%20.708-.708l.547.548%201.17-1.951a.5.5%200%201%201%20.858.514M11%205a3%203%200%201%201-6%200%203%203%200%200%201%206%200M8%207a2%202%200%201%200%200-4%202%202%200%200%200%200%204'/%3e%3cpath%20d='M8.256%2014a4.5%204.5%200%200%201-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484%2010.68%205.711%2010%208%2010q.39%200%20.74.025c.226-.341.496-.65.804-.918Q8.844%209.002%208%209c-5%200-6%203-6%204s1%201%201%201z'/%3e%3c/svg%3e";
var ia = Object.defineProperty, sa = Object.getOwnPropertyDescriptor, ye = (n, e, t, o) => {
  for (var i = o > 1 ? void 0 : o ? sa(e, t) : e, s = n.length - 1, a; s >= 0; s--)
    (a = n[s]) && (i = (o ? a(e, t, i) : a(i)) || i);
  return o && i && ia(e, t, i), i;
};
const le = {
  primary: null,
  // The primary instance that makes API calls
  user: null,
  osmConnected: !1,
  osmData: null,
  loading: !0,
  hanko: null,
  initialized: !1,
  instances: /* @__PURE__ */ new Set(),
  profileDisplayName: ""
  // Shared profile display name
}, ei = (n) => `hanko-verified-${n}`, ti = (n) => `hanko-onboarding-${n}`;
let ge = class extends Ut {
  constructor() {
    super(...arguments), this.hankoUrlAttr = "", this.basePath = "", this.authPath = "/api/auth/osm", this.osmRequired = !1, this.osmScopes = "read_prefs", this.showProfile = !1, this.redirectAfterLogin = "", this.autoConnect = !1, this.verifySession = !1, this.redirectAfterLogout = "", this.displayNameAttr = "", this.mappingCheckUrl = "", this.appId = "", this.loginUrl = "", this.user = null, this.osmConnected = !1, this.osmData = null, this.osmLoading = !1, this.loading = !0, this.error = null, this.profileDisplayName = "", this.hasAppMapping = !1, this.isOpen = !1, this.handleOutsideClick = (n) => {
      this.contains(n.target) || this.closeDropdown();
    }, this._trailingSlashCache = {}, this._debugMode = !1, this._lastSessionId = null, this._hanko = null, this._isPrimary = !1, this._handleVisibilityChange = () => {
      this._isPrimary && !document.hidden && !this.showProfile && !this.user && (this.log("👁️ Page visible, re-checking session..."), this.checkSession());
    }, this._handleWindowFocus = () => {
      this._isPrimary && !this.showProfile && !this.user && (this.log("🎯 Window focused, re-checking session..."), this.checkSession());
    }, this._handleExternalLogin = (n) => {
      var t;
      if (!this._isPrimary) return;
      const e = n;
      !this.showProfile && !this.user && ((t = e.detail) != null && t.user) && (this.log("🔔 External login detected, updating user state..."), this.user = e.detail.user, this._broadcastState(), this.osmRequired && this.checkOSMConnection());
    };
  }
  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }
  closeDropdown() {
    this.isOpen = !1;
  }
  // Get computed hankoUrl (priority: attribute > meta tag > window.HANKO_URL > origin)
  get hankoUrl() {
    if (this.hankoUrlAttr)
      return this.hankoUrlAttr;
    const n = document.querySelector('meta[name="hanko-url"]');
    if (n) {
      const t = n.getAttribute("content");
      if (t)
        return this.log("🔍 hanko-url auto-detected from <meta> tag:", t), t;
    }
    if (window.HANKO_URL)
      return this.log(
        "🔍 hanko-url auto-detected from window.HANKO_URL:",
        window.HANKO_URL
      ), window.HANKO_URL;
    const e = window.location.origin;
    return this.log("🔍 hanko-url auto-detected from window.location.origin:", e), e;
  }
  connectedCallback() {
    super.connectedCallback(), this._debugMode = this._checkDebugMode(), this.log("🔌 hanko-auth connectedCallback called"), this.injectHotStyles(), le.instances.add(this), document.addEventListener("visibilitychange", this._handleVisibilityChange), window.addEventListener("focus", this._handleWindowFocus), document.addEventListener("hanko-login", this._handleExternalLogin);
  }
  // Use firstUpdated instead of connectedCallback to ensure React props are set
  firstUpdated() {
    this.log("🔌 hanko-auth firstUpdated called"), this.log("  hankoUrl:", this.hankoUrl), this.log("  basePath:", this.basePath), le.initialized || le.primary ? (this.log("🔄 Using shared state from primary instance"), this._syncFromShared(), this._isPrimary = !1) : (this.log("👑 This is the primary instance"), this._isPrimary = !0, le.primary = this, le.initialized = !0, this.init());
  }
  disconnectedCallback() {
    if (super.disconnectedCallback(), document.removeEventListener(
      "visibilitychange",
      this._handleVisibilityChange
    ), window.removeEventListener("focus", this._handleWindowFocus), document.removeEventListener("hanko-login", this._handleExternalLogin), document.removeEventListener("click", this.handleOutsideClick), le.instances.delete(this), this._isPrimary && le.instances.size > 0) {
      const n = le.instances.values().next().value;
      n && (this.log("👑 Promoting new primary instance"), n._isPrimary = !0, le.primary = n);
    }
    le.instances.size === 0 && (le.initialized = !1, le.primary = null);
  }
  // Sync local state from shared state (only if values changed to prevent render loops)
  _syncFromShared() {
    this.user !== le.user && (this.user = le.user), this.osmConnected !== le.osmConnected && (this.osmConnected = le.osmConnected), this.osmData !== le.osmData && (this.osmData = le.osmData), this.loading !== le.loading && (this.loading = le.loading), this._hanko !== le.hanko && (this._hanko = le.hanko), this.profileDisplayName !== le.profileDisplayName && (this.profileDisplayName = le.profileDisplayName);
  }
  // Update shared state and broadcast to all instances
  _broadcastState() {
    le.user = this.user, le.osmConnected = this.osmConnected, le.osmData = this.osmData, le.loading = this.loading, le.profileDisplayName = this.profileDisplayName, le.instances.forEach((n) => {
      n !== this && n._syncFromShared();
    });
  }
  _checkDebugMode() {
    if (new URLSearchParams(window.location.search).get("debug") === "true")
      return !0;
    try {
      return localStorage.getItem("hanko-auth-debug") === "true";
    } catch {
      return !1;
    }
  }
  log(...n) {
    this._debugMode && console.log(...n);
  }
  warn(...n) {
    console.warn(...n);
  }
  logError(...n) {
    console.error(...n);
  }
  getBasePath() {
    return this.basePath ? (this.log("🔍 getBasePath() using basePath:", this.basePath), this.basePath) : (this.log("🔍 getBasePath() using default: empty string"), "");
  }
  addTrailingSlash(n, e) {
    const t = this._trailingSlashCache[e];
    return t !== void 0 && t && !n.endsWith("/") ? n + "/" : n;
  }
  injectHotStyles() {
    [
      {
        id: "hot-design-system",
        href: "https://cdn.jsdelivr.net/npm/hotosm-ui-design@latest/dist/hot.css"
      },
      {
        id: "google-font-archivo",
        href: "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&display=swap"
      }
    ].forEach(({ id: e, href: t }) => {
      if (!document.getElementById(e)) {
        const o = document.createElement("link");
        o.rel = "stylesheet", o.href = t, o.id = e, document.head.appendChild(o);
      }
    });
  }
  async init() {
    if (!this._isPrimary) {
      this.log("⏭️ Not primary, skipping init...");
      return;
    }
    try {
      await Li(this.hankoUrl, {
        enablePasskeys: !1,
        hidePasskeyButtonOnLogin: !0
      });
      const { Hanko: n } = await Promise.resolve().then(() => Xr), e = window.location.hostname, t = e === "localhost" || e === "127.0.0.1", o = e.split("."), i = o.length >= 2 ? `.${o.slice(-2).join(".")}` : e, s = t ? {} : {
        cookieDomain: i,
        cookieName: "hanko",
        cookieSameSite: "lax"
      };
      this._hanko = new n(this.hankoUrl, s), le.hanko = this._hanko, this._hanko.onSessionExpired(() => {
        this.log("🕒 Hanko session expired event received"), this.handleSessionExpired();
      }), this._hanko.onUserLoggedOut(() => {
        this.log("🚪 Hanko user logged out event received"), this.handleUserLoggedOut();
      }), await this.checkSession(), this.user && (this.osmRequired && await this.checkOSMConnection(), await this.fetchProfileDisplayName()), this.loading = !1, this._broadcastState(), this.setupEventListeners();
    } catch (n) {
      this.logError("Failed to initialize hanko-auth:", n), this.error = n.message, this.loading = !1, this._broadcastState();
    }
  }
  async checkSession() {
    if (this.log("🔍 Checking for existing Hanko session..."), !this._hanko) {
      this.log("⚠️ Hanko instance not initialized yet");
      return;
    }
    try {
      this.log("📡 Checking session validity via cookie...");
      try {
        const n = await fetch(
          `${this.hankoUrl}/sessions/validate`,
          {
            method: "GET",
            credentials: "include",
            // Include httpOnly cookies
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        if (n.ok) {
          const e = await n.json();
          if (e.is_valid === !1) {
            this.log(
              "ℹ️ Session validation returned is_valid:false - no valid session"
            );
            return;
          }
          this.log("✅ Valid Hanko session found via cookie"), this.log("📋 Session data:", e);
          try {
            const t = await fetch(`${this.hankoUrl}/me`, {
              method: "GET",
              credentials: "include",
              // Include httpOnly cookies
              headers: {
                "Content-Type": "application/json"
              }
            });
            let o = !0;
            if (t.ok) {
              const i = await t.json();
              this.log("👤 User data retrieved from /me:", i), i.email ? (this.user = {
                id: i.user_id || i.id,
                email: i.email,
                username: i.username || null,
                emailVerified: i.email_verified || i.verified || !1
              }, o = !1) : this.log("⚠️ /me has no email, will use SDK fallback");
            }
            if (o) {
              this.log("🔄 Using SDK to get user with email");
              const i = await this._hanko.user.getCurrent();
              this.user = {
                id: i.id,
                email: i.email,
                username: i.username,
                emailVerified: i.email_verified || !1
              };
            }
          } catch (t) {
            this.log("⚠️ Failed to get user data:", t), e.user_id && (this.user = {
              id: e.user_id,
              email: e.email || null,
              username: null,
              emailVerified: !1
            });
          }
          if (this.user) {
            const t = ei(window.location.hostname), o = sessionStorage.getItem(t);
            if (this.verifySession && this.redirectAfterLogin && !o) {
              this.log(
                "🔄 verify-session enabled, redirecting to callback for app verification..."
              ), sessionStorage.setItem(t, "true"), window.location.href = this.redirectAfterLogin;
              return;
            }
            if (!await this.checkAppMapping())
              return;
            this.dispatchEvent(
              new CustomEvent("hanko-login", {
                detail: { user: this.user },
                bubbles: !0,
                composed: !0
              })
            ), this.dispatchEvent(
              new CustomEvent("auth-complete", {
                bubbles: !0,
                composed: !0
              })
            ), this.osmRequired && await this.checkOSMConnection(), await this.fetchProfileDisplayName(), this.osmRequired && this.autoConnect && !this.osmConnected && (this.log("🔄 Auto-connecting to OSM (from existing session)..."), this.handleOSMConnect());
          }
        } else
          this.log("ℹ️ No valid session cookie found - user needs to login");
      } catch (n) {
        this.log("⚠️ Session validation failed:", n), this.log("ℹ️ No valid session - user needs to login");
      }
    } catch (n) {
      this.log("⚠️ Session check error:", n), this.log("ℹ️ No existing session - user needs to login");
    } finally {
      this._isPrimary && this._broadcastState();
    }
  }
  async checkOSMConnection() {
    if (!this.osmRequired) {
      this.log("⏭️ OSM not required, skipping connection check");
      return;
    }
    if (this.osmConnected) {
      this.log("⏭️ Already connected to OSM, skipping check");
      return;
    }
    const n = this.loading;
    n || (this.osmLoading = !0);
    try {
      const e = this.getBasePath(), t = this.authPath, i = `${`${e}${t}/status`}`;
      this.log("🔍 Checking OSM connection at:", i), this.log("  basePath:", e), this.log("  authPath:", t), this.log("🍪 Current cookies:", document.cookie);
      const s = await fetch(i, {
        credentials: "include",
        redirect: "follow"
      });
      if (this.log("📡 OSM status response:", s.status), this.log("📡 Final URL after redirects:", s.url), this.log("📡 Response headers:", [...s.headers.entries()]), s.ok) {
        const a = await s.text();
        this.log("📡 OSM raw response:", a.substring(0, 200));
        let c;
        try {
          c = JSON.parse(a);
        } catch {
          throw this.logError(
            "Failed to parse OSM response as JSON:",
            a.substring(0, 500)
          ), new Error("Invalid JSON response from OSM status endpoint");
        }
        this.log("📡 OSM status data:", c), c.connected ? (this.log("✅ OSM is connected:", c.osm_username), this.osmConnected = !0, this.osmData = c, this.dispatchEvent(
          new CustomEvent("osm-connected", {
            detail: { osmData: c },
            bubbles: !0,
            composed: !0
          })
        )) : (this.log("❌ OSM is NOT connected"), this.osmConnected = !1, this.osmData = null);
      }
    } catch (e) {
      this.logError("OSM connection check failed:", e);
    } finally {
      n || (this.osmLoading = !1), this._isPrimary && this._broadcastState();
    }
  }
  // Check app mapping status (for cross-app auth scenarios)
  // Only used when mapping-check-url is configured
  async checkAppMapping() {
    if (!this.mappingCheckUrl || !this.user)
      return !0;
    const n = ti(window.location.hostname), e = sessionStorage.getItem(n);
    this.log("🔍 Checking app mapping at:", this.mappingCheckUrl);
    try {
      const t = await fetch(this.mappingCheckUrl, {
        credentials: "include"
      });
      if (t.ok) {
        const o = await t.json();
        if (this.log("📡 Mapping check response:", o), o.needs_onboarding) {
          if (e)
            return this.log(
              "⚠️ Already tried onboarding this session, skipping redirect"
            ), !0;
          this.log("⚠️ User needs onboarding, redirecting..."), sessionStorage.setItem(n, "true");
          const i = encodeURIComponent(window.location.origin), s = this.appId ? `onboarding=${this.appId}` : "";
          return window.location.href = `${this.hankoUrl}/app?${s}&return_to=${i}`, !1;
        }
        return sessionStorage.removeItem(n), this.hasAppMapping = !0, this.log("✅ User has app mapping"), !0;
      } else if (t.status === 401 || t.status === 403) {
        if (e)
          return this.log(
            "⚠️ Already tried onboarding this session, skipping redirect"
          ), !0;
        this.log("⚠️ 401/403 - User needs onboarding, redirecting..."), sessionStorage.setItem(n, "true");
        const o = encodeURIComponent(window.location.origin), i = this.appId ? `onboarding=${this.appId}` : "";
        return window.location.href = `${this.hankoUrl}/app?${i}&return_to=${o}`, !1;
      }
      return this.log("⚠️ Unexpected status from mapping check:", t.status), !0;
    } catch (t) {
      return this.log("⚠️ App mapping check failed:", t), !0;
    }
  }
  // Fetch profile display name from login backend
  async fetchProfileDisplayName() {
    try {
      const n = `${this.hankoUrl}/api/profile/me`;
      this.log("👤 Fetching profile from:", n);
      const e = await fetch(n, {
        credentials: "include"
      });
      if (e.ok) {
        const t = await e.json();
        this.log("👤 Profile data:", t), (t.first_name || t.last_name) && (this.profileDisplayName = `${t.first_name || ""} ${t.last_name || ""}`.trim(), this.log("👤 Display name set to:", this.profileDisplayName));
      }
    } catch (n) {
      this.log("⚠️ Could not fetch profile:", n);
    }
  }
  setupEventListeners() {
    this.updateComplete.then(() => {
      var e;
      const n = (e = this.shadowRoot) == null ? void 0 : e.querySelector("hanko-auth");
      n && (n.addEventListener("onSessionCreated", (t) => {
        var i, s;
        this.log("🎯 Hanko event: onSessionCreated", t.detail);
        const o = (s = (i = t.detail) == null ? void 0 : i.claims) == null ? void 0 : s.session_id;
        if (o && this._lastSessionId === o) {
          this.log("⏭️ Skipping duplicate session event");
          return;
        }
        this._lastSessionId = o, this.handleHankoSuccess(t);
      }), n.addEventListener(
        "hankoAuthLogout",
        () => this.handleLogout()
      ));
    });
  }
  async handleHankoSuccess(n) {
    var o;
    if (this.log("Hanko auth success:", n.detail), !this._hanko) {
      this.logError("Hanko instance not initialized");
      return;
    }
    let e = !1;
    try {
      const i = new AbortController(), s = setTimeout(() => i.abort(), 5e3), a = await fetch(`${this.hankoUrl}/me`, {
        method: "GET",
        credentials: "include",
        // Include httpOnly cookies
        headers: {
          "Content-Type": "application/json"
        },
        signal: i.signal
      });
      if (clearTimeout(s), a.ok) {
        const c = await a.json();
        this.log("👤 User data retrieved from /me:", c), c.email ? (this.user = {
          id: c.user_id || c.id,
          email: c.email,
          username: c.username || null,
          emailVerified: c.email_verified || c.verified || !1
        }, e = !0) : this.log("⚠️ /me has no email, will try SDK fallback");
      } else
        this.log(
          "⚠️ /me endpoint returned non-OK status, will try SDK fallback"
        );
    } catch (i) {
      this.log(
        "⚠️ /me endpoint fetch failed (timeout or cross-origin TLS issue):",
        i
      );
    }
    if (!e)
      try {
        this.log("🔄 Trying SDK fallback for user info...");
        const i = new Promise(
          (a, c) => setTimeout(() => c(new Error("SDK timeout")), 5e3)
        ), s = await Promise.race([
          this._hanko.user.getCurrent(),
          i
        ]);
        this.user = {
          id: s.id,
          email: s.email,
          username: s.username,
          emailVerified: s.email_verified || !1
        }, e = !0, this.log("✅ User info retrieved via SDK fallback");
      } catch (i) {
        this.log("⚠️ SDK fallback failed, trying JWT claims:", i);
        try {
          const s = (o = n.detail) == null ? void 0 : o.claims;
          if (s != null && s.sub)
            this.user = {
              id: s.sub,
              email: s.email || null,
              username: null,
              emailVerified: s.email_verified || !1
            }, e = !0, this.log("✅ User info extracted from JWT claims");
          else {
            this.logError("No user claims available in event"), this.user = null;
            return;
          }
        } catch (s) {
          this.logError(
            "Failed to extract user info from claims:",
            s
          ), this.user = null;
          return;
        }
      }
    if (this.log("✅ User state updated:", this.user), this._isPrimary && this._broadcastState(), this.dispatchEvent(
      new CustomEvent("hanko-login", {
        detail: { user: this.user },
        bubbles: !0,
        composed: !0
      })
    ), this.osmRequired && await this.checkOSMConnection(), await this.fetchProfileDisplayName(), this.osmRequired && this.autoConnect && !this.osmConnected) {
      this.log("🔄 Auto-connecting to OSM..."), this.handleOSMConnect();
      return;
    }
    const t = !this.osmRequired || this.osmConnected;
    this.log(
      "🔄 Checking redirect-after-login:",
      this.redirectAfterLogin,
      "showProfile:",
      this.showProfile,
      "canRedirect:",
      t
    ), t ? (this.dispatchEvent(
      new CustomEvent("auth-complete", {
        bubbles: !0,
        composed: !0
      })
    ), this.redirectAfterLogin ? (this.log("✅ Redirecting to:", this.redirectAfterLogin), window.location.href = this.redirectAfterLogin) : this.log("❌ No redirect (redirectAfterLogin not set)")) : this.log("⏸️ Waiting for OSM connection before redirect");
  }
  async handleOSMConnect() {
    const n = this.osmScopes.split(" ").join("+"), e = this.getBasePath(), t = this.authPath, i = `${`${e}${t}/login`}?scopes=${n}`;
    this.log("🔗 OSM Connect clicked!"), this.log("  basePath:", e), this.log("  authPath:", t), this.log("  Login path:", i), this.log("  Fetching redirect URL from backend...");
    try {
      const s = await fetch(i, {
        method: "GET",
        credentials: "include",
        redirect: "manual"
        // Don't follow redirect, we'll do it manually
      });
      if (this.log("  Response status:", s.status), this.log("  Response type:", s.type), s.status === 0 || s.type === "opaqueredirect") {
        const a = s.headers.get("Location") || s.url;
        this.log("  ✅ Got redirect URL:", a), window.location.href = a;
      } else if (s.status >= 300 && s.status < 400) {
        const a = s.headers.get("Location");
        this.log("  ✅ Got redirect URL from header:", a), a && (window.location.href = a);
      } else {
        this.logError("  ❌ Unexpected response:", s.status);
        const a = await s.text();
        this.logError("  Response body:", a.substring(0, 200));
      }
    } catch (s) {
      this.logError("  ❌ Failed to fetch redirect URL:", s);
    }
  }
  async handleLogout() {
    this.log("🚪 Logout initiated"), this.log("📊 Current state before logout:", {
      user: this.user,
      osmConnected: this.osmConnected,
      osmData: this.osmData
    }), this.log("🍪 Cookies before logout:", document.cookie);
    try {
      const n = this.getBasePath(), e = this.authPath, t = `${n}${e}/disconnect`, o = t.startsWith("http") ? t : `${window.location.origin}${t}`;
      this.log("🔌 Calling OSM disconnect:", o);
      const i = await fetch(o, {
        method: "POST",
        credentials: "include"
      });
      this.log("📡 Disconnect response status:", i.status);
      const s = await i.json();
      this.log("📡 Disconnect response data:", s), this.log("✅ OSM disconnected");
    } catch (n) {
      this.logError("❌ OSM disconnect failed:", n);
    }
    if (this._hanko)
      try {
        await this._hanko.user.logout(), this.log("✅ Hanko logout successful");
      } catch (n) {
        this.logError("Hanko logout failed:", n);
      }
    if (this._clearAuthState(), this.log(
      "✅ Logout complete - component will re-render with updated state"
    ), this.redirectAfterLogout) {
      const n = window.location.href.replace(/\/$/, ""), e = this.redirectAfterLogout.replace(/\/$/, "");
      n !== e && !n.startsWith(e + "#") ? (this.log("🔄 Redirecting after logout to:", this.redirectAfterLogout), window.location.href = this.redirectAfterLogout) : this.log("⏭️ Already on logout target, skipping redirect");
    }
  }
  /**
   * Clear all auth state - shared between logout and session expired handlers
   */
  _clearAuthState() {
    const n = window.location.hostname;
    document.cookie = `hanko=; path=/; domain=${n}; max-age=0`, document.cookie = "hanko=; path=/; max-age=0", document.cookie = `osm_connection=; path=/; domain=${n}; max-age=0`, document.cookie = "osm_connection=; path=/; max-age=0", this.log("🍪 Cookies cleared");
    const e = ei(n), t = ti(n);
    sessionStorage.removeItem(e), sessionStorage.removeItem(t), this.log("🔄 Session flags cleared"), this.user = null, this.osmConnected = !1, this.osmData = null, this.hasAppMapping = !1, this._isPrimary && this._broadcastState(), this.dispatchEvent(
      new CustomEvent("logout", {
        bubbles: !0,
        composed: !0
      })
    );
  }
  async handleSessionExpired() {
    if (this.log("🕒 Session expired event received"), this.log("📊 Current state:", {
      user: this.user,
      osmConnected: this.osmConnected,
      loading: this.loading
    }), this.loading) {
      this.log("⏳ Still loading, ignoring session expired event during init");
      return;
    }
    if (this.user) {
      this.log("✅ User is logged in, ignoring stale session expired event");
      return;
    }
    this.log("🧹 No active user - cleaning up state");
    try {
      const n = this.getBasePath(), e = this.authPath, t = `${n}${e}/disconnect`, o = t.startsWith("http") ? t : `${window.location.origin}${t}`;
      this.log("🔌 Calling OSM disconnect (session expired):", o);
      const i = await fetch(o, {
        method: "POST",
        credentials: "include"
      });
      this.log("📡 Disconnect response status:", i.status);
      const s = await i.json();
      this.log("📡 Disconnect response data:", s), this.log("✅ OSM disconnected");
    } catch (n) {
      this.logError("❌ OSM disconnect failed:", n);
    }
    if (this._clearAuthState(), this.log("✅ Session cleanup complete"), this.redirectAfterLogout) {
      const n = window.location.href.replace(/\/$/, ""), e = this.redirectAfterLogout.replace(/\/$/, "");
      n !== e && !n.startsWith(e + "#") ? (this.log(
        "🔄 Redirecting after session expired to:",
        this.redirectAfterLogout
      ), window.location.href = this.redirectAfterLogout) : this.log("⏭️ Already on logout target, skipping redirect");
    }
  }
  handleUserLoggedOut() {
    this.log("🚪 User logged out in another window/tab"), this.handleSessionExpired();
  }
  handleDropdownSelect(n) {
    const t = n.currentTarget.dataset.action;
    if (this.log("🎯 Dropdown item selected:", t), t === "profile") {
      const o = this.hankoUrl, i = this.redirectAfterLogin || window.location.origin;
      window.location.href = `${o}/app/profile?return_to=${encodeURIComponent(i)}`;
    } else if (t === "connect-osm") {
      const s = window.location.pathname.includes("/app") ? window.location.origin : window.location.href, a = this.hankoUrl;
      window.location.href = `${a}/app?return_to=${encodeURIComponent(s)}&osm_required=true`;
    } else t === "logout" && this.handleLogout();
    this.closeDropdown();
  }
  oldHandleDropdownSelect(n) {
    const e = n.detail.item.value;
    if (this.log("🎯 Dropdown item selected:", e), e === "profile") {
      const t = this.redirectAfterLogin || window.location.origin, o = this.loginUrl ? `${this.loginUrl}/profile` : `${this.hankoUrl}/app/profile`;
      window.location.href = `${o}?return_to=${encodeURIComponent(t)}`;
    } else if (e === "connect-osm") {
      const i = window.location.pathname.includes("/app") ? window.location.origin : window.location.href, s = this.hankoUrl;
      window.location.href = `${s}/app?return_to=${encodeURIComponent(
        i
      )}&osm_required=true`;
    } else e === "logout" && this.handleLogout();
  }
  handleSkipOSM() {
    this.dispatchEvent(new CustomEvent("osm-skipped")), this.dispatchEvent(new CustomEvent("auth-complete")), this.redirectAfterLogin && (window.location.href = this.redirectAfterLogin);
  }
  render() {
    var n, e, t;
    if (this.log(
      "🎨 RENDER - showProfile:",
      this.showProfile,
      "user:",
      !!this.user,
      "loading:",
      this.loading
    ), this.loading)
      return He` <button disabled>Log in</button> `;
    if (this.error)
      return He`
        <div class="container">
          <div class="error">${this.error}</div>
        </div>
      `;
    if (this.user) {
      const o = this.osmRequired && !this.osmConnected && !this.osmLoading, i = this.displayNameAttr || this.profileDisplayName || this.user.username || this.user.email || this.user.id, s = i ? i[0].toUpperCase() : "U";
      return this.showProfile ? He`
          <div class="container">
            <div class="profile">
              <div class="profile-header">
                <div class="profile-avatar">${s}</div>
                <div class="profile-info">
                  <div class="profile-email">
                    ${this.user.email || this.user.id}
                  </div>
                </div>
              </div>

              ${this.osmRequired && this.osmLoading ? He`
                    <div class="osm-section">
                      <div class="loading">Checking OSM connection...</div>
                    </div>
                  ` : this.osmRequired && this.osmConnected ? He`
                      <div class="osm-section">
                        <div class="osm-connected">
                          <div class="osm-badge">
                            <span class="osm-badge-icon">🗺️</span>
                            <div>
                              <div>Connected to OpenStreetMap</div>
                              ${(n = this.osmData) != null && n.osm_username ? He`
                                    <div class="osm-username">
                                      @${this.osmData.osm_username}
                                    </div>
                                  ` : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    ` : ""}
              ${o ? He`
                    <div class="osm-section">
                      ${this.autoConnect ? He`
                            <div class="osm-connecting">
                              <div class="spinner"></div>
                              <div class="connecting-text">
                                🗺️ Connecting to OpenStreetMap...
                              </div>
                            </div>
                          ` : He`
                            <div class="osm-prompt-title">🌍 OSM Required</div>
                            <div class="osm-prompt-text">
                              This endpoint requires OSM connection.
                            </div>
                            <button
                              @click=${this.handleOSMConnect}
                              class="btn-primary"
                            >
                              Connect OSM Account
                            </button>
                          `}
                    </div>
                  ` : ""}

              <button @click=${this.handleLogout} class="btn-secondary">
                Log out
              </button>
            </div>
          </div>
        ` : He`
          <div class="dropdown">
            <button
              @click=${this.toggleDropdown}
              aria-label="Open account menu"
              aria-expanded=${this.isOpen}
              aria-haspopup="true"
              class="dropdown-trigger"
            >
              <span class="header-avatar">${s}</span>

              ${this.osmConnected ? He`
                    <span
                      class="osm-status-badge connected"
                      title="Connected to OSM as @${(e = this.osmData) == null ? void 0 : e.osm_username}"
                      >✓</span
                    >
                  ` : this.osmRequired ? He`
                      <span
                        class="osm-status-badge required"
                        title="OSM connection required"
                        >!</span
                      >
                    ` : ""}
            </button>
            <div class="dropdown-content ${this.isOpen ? "open" : ""}">
              <div class="profile-info">
                <div class="profile-email">
                  ${this.user.email || this.user.id}
                </div>
              </div>
              <button data-action="profile" @click=${this.handleDropdownSelect}>
                <img src="${ea}" class="icon" alt="Account icon" />
                My HOT Account
              </button>
              ${this.osmRequired ? this.osmConnected ? He`
                      <button class="osm-connected" disabled>
                        <img src="${oa}" alt="Check icon" class="icon" />
                        Connected to OSM (@${(t = this.osmData) == null ? void 0 : t.osm_username})
                      </button>
                    ` : He`
                      <button
                        data-action="connect-osm"
                        @click=${this.handleDropdownSelect}
                      >
                        <img src="${na}" alt="Check icon" class="icon" />
                        Connect to OSM
                      </button>
                    ` : ""}
              <button data-action="logout" @click=${this.handleDropdownSelect}>
                <img src="${ta}" alt="Log out icon" class="icon" />
                Log Out
              </button>
            </div>
          </div>
        `;
    } else {
      if (this.showProfile)
        return He`
          <div
            class="container"
            style="
            --color: var(--hot-color-gray-900);
            --color-shade-1: var(--hot-color-gray-700);
            --color-shade-2: var(--hot-color-gray-100);
            --brand-color: var(--hot-color-gray-800);
            --brand-color-shade-1: var(--hot-color-gray-900);
            --brand-contrast-color: white;
            --background-color: white;
            --error-color: var(--hot-color-red-600);
            --link-color: var(--hot-color-gray-900);
            --font-family: var(--hot-font-sans);
            --font-weight: var(--hot-font-weight-normal);
            --border-radius: var(--hot-border-radius-medium);
            --item-height: 2.75rem;
            --item-margin: var(--hot-spacing-small) 0;
            --container-padding: 0;
            --headline1-font-size: var(--hot-font-size-large);
            --headline1-font-weight: var(--hot-font-weight-semibold);
            --headline2-font-size: var(--hot-font-size-medium);
            --headline2-font-weight: var(--hot-font-weight-semibold);
          "
          >
            <hanko-auth></hanko-auth>
          </div>
        `;
      {
        const i = window.location.pathname.includes("/app"), s = this.redirectAfterLogin || (i ? window.location.origin : window.location.href), c = new URLSearchParams(window.location.search).get("auto_connect") === "true" ? "&auto_connect=true" : "", d = this.hankoUrl;
        this.log("🔗 Login URL base:", d);
        const u = `${this.loginUrl || `${d}/app`}?return_to=${encodeURIComponent(
          s
        )}${this.osmRequired ? "&osm_required=true" : ""}${c}`;
        return He`<a class="login-link" href="${u}">Log in</a> `;
      }
    }
  }
};
ge.styles = Ui`
    :host {
      display: block;
      font-family: var(--hot-font-sans);
    }

    .container {
      max-width: 400px;
      margin: 0 auto;
      padding: var(--hot-spacing-large);
    }

    .loading {
      text-align: center;
      padding: var(--hot-spacing-3x-large);
      color: var(--hot-color-gray-600);
    }

    .osm-connecting {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--hot-spacing-small);
      padding: var(--hot-spacing-large);
    }

    .spinner {
      width: var(--hot-spacing-3x-large);
      height: var(--hot-spacing-3x-large);
      border: var(--hot-spacing-2x-small) solid var(--hot-color-gray-50);
      border-top: var(--hot-spacing-2x-small) solid var(--hot-color-red-600);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .connecting-text {
      font-size: var(--hot-font-size-small);
      color: var(--hot-color-gray-600);
      font-weight: var(--hot-font-weight-semibold);
    }

    button {
      width: 100%;
      padding: 12px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--hot-color-gray-700);
      color: white;
    }

    .btn-primary:hover {
      background: var(--hot-color-gray-600);
    }

    .btn-secondary {
      border: 1px solid var(--hot-color-gray-700);
      border-radius: var(--hot-border-radius-medium);
      background-color: white;
      color: var(--hot-color-gray-700);
      margin-top: 8px;
    }

    .btn-secondary:hover {
      background: var(--hot-color-gray-50);
    }

    .error {
      background: var(--hot-color-red-50);
      border: var(--hot-border-width, 1px) solid var(--hot-color-red-200);
      border-radius: var(--hot-border-radius-medium);
      padding: var(--hot-spacing-small);
      color: var(--hot-color-red-700);
      margin-bottom: var(--hot-spacing-medium);
    }

    .profile {
      background: var(--hot-color-gray-50);
      border-radius: var(--hot-border-radius-large);
      padding: var(--hot-spacing-large);
      margin-bottom: var(--hot-spacing-medium);
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: var(--hot-spacing-small);
      margin-bottom: var(--hot-spacing-medium);
    }

    .profile-avatar {
      width: var(--hot-spacing-3x-large);
      height: var(--hot-spacing-3x-large);
      border-radius: 50%;
      background: var(--hot-color-gray-200);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--hot-font-size-large);
      font-weight: var(--hot-font-weight-bold);
      color: var(--hot-color-gray-600);
    }

    .profile-info {
      padding: var(--hot-spacing-x-small) var(--hot-spacing-medium);
    }

    .profile-email {
      font-size: var(--hot-font-size-small);
      font-weight: var(--hot-font-weight-bold);
    }

    .osm-section {
      border-top: var(--hot-border-width, 1px) solid var(--hot-color-gray-100);
      padding-top: var(--hot-spacing-medium);
      padding-bottom: var(--hot-spacing-small);
      margin-top: var(--hot-spacing-medium);
      text-align: center;
    }

    .osm-connected {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--hot-spacing-small);
      background: linear-gradient(
        135deg,
        var(--hot-color-success-50) 0%,
        var(--hot-color-success-50) 100%
      );
      border-radius: var(--hot-border-radius-large);
      border: var(--hot-border-width, 1px) solid var(--hot-color-success-200);
    }

    .osm-badge {
      display: flex;
      align-items: center;
      gap: var(--hot-spacing-x-small);
      color: var(--hot-color-success-800);
      font-weight: var(--hot-font-weight-semibold);
      font-size: var(--hot-font-size-small);
      text-align: left;
    }

    .osm-badge-icon {
      font-size: var(--hot-font-size-medium);
    }

    .osm-username {
      font-size: var(--hot-font-size-x-small);
      color: var(--hot-color-success-700);
      margin-top: var(--hot-spacing-2x-small);
    }
    .osm-prompt {
      background: var(--hot-color-warning-50);
      border: var(--hot-border-width, 1px) solid var(--hot-color-warning-200);
      border-radius: var(--hot-border-radius-large);
      padding: var(--hot-spacing-large);
      margin-bottom: var(--hot-spacing-medium);
      text-align: center;
    }

    .osm-prompt-title {
      font-weight: var(--hot-font-weight-semibold);
      font-size: var(--hot-font-size-medium);
      margin-bottom: var(--hot-spacing-small);
      color: var(--hot-color-gray-900);
      text-align: center;
    }

    .osm-prompt-text {
      font-size: var(--hot-font-size-small);
      color: var(--hot-color-gray-600);
      margin-bottom: var(--hot-spacing-medium);
      line-height: var(--hot-line-height-normal);
      text-align: center;
    }

    .osm-status-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      width: var(--hot-font-size-small);
      height: var(--hot-font-size-small);
      border-radius: 50%;
      border: var(--hot-spacing-3x-small) solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--hot-font-size-2x-small);
      color: white;
      font-weight: var(--hot-font-weight-bold);
    }

    .osm-status-badge.connected {
      background-color: var(--hot-color-success-600);
    }

    .osm-status-badge.required {
      background-color: var(--hot-color-warning-600);
    }
    .header-avatar {
      width: var(--hot-spacing-2x-large);
      height: var(--hot-spacing-2x-large);
      border-radius: 50%;
      background: var(--hot-color-gray-800);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: var(--hot-font-size-small);
      font-weight: var(--hot-font-weight-semibold);
      color: white;
    }

    .login-link {
      color: var(--hot-color-neutral-950);
      font-size: var(--hot-font-size-small);
      border-radius: var(--hot-border-radius-medium);
      text-decoration: none;
      padding: 14px;
    }
    .login-link:hover {
      background: var(--hot-color-gray-50);
    }
    /* Dropdown styles */
    .dropdown {
      position: relative;
      display: inline-block;
    }
    .dropdown-trigger {
      background: none;
      border: none;
      padding: var(--hot-spacing-x-small);
      cursor: pointer;
      position: relative;
    }

    .dropdown-trigger.no-hover:hover,
    .dropdown-trigger.no-hover:active,
    .dropdown-trigger.no-hover:focus {
      background: none;
      outline: none;
    }
    .dropdown-content {
      position: absolute;
      right: 0;
      background: white;
      border: 1px solid var(--hot-color-gray-100);
      border-radius: var(--hot-border-radius-medium);
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition:
        opacity 0.2s ease,
        visibility 0.2s ease,
        transform 0.2s ease;
    }
    @media (max-width: 768px) {
      .dropdown-content {
        position: fixed;
        width: 100%;
      }
    }

    .dropdown-content.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-content button {
      display: flex;
      align-items: center;
      width: 100%;
      padding: var(--hot-spacing-small) var(--hot-spacing-medium);
      background: none;
      border: none;
      cursor: pointer;
      text-align: left;
      transition: background-color 0.2s ease;
      gap: var(--hot-spacing-small);
      font-size: var(--hot-font-size-small);
      color: var(--hot-color-gray-900);
    }

    .dropdown-content button:hover {
      background-color: var(--hot-color-gray-50);
    }

    .dropdown-content button:focus {
      background-color: var(--hot-color-gray-50);
      outline: 2px solid var(--hot-color-gray-500);
      outline-offset: -2px;
    }

    .dropdown-content .profile-info {
      padding: var(--hot-spacing-small) var(--hot-spacing-medium);
    }

    .dropdown-content .profile-email {
      font-size: var(--hot-font-size-small);
      font-weight: var(--hot-font-weight-bold);
    }

    .icon {
      width: 20px;
      height: 20px;
    }
  `;
ye([
  We({ type: String, attribute: "hanko-url" })
], ge.prototype, "hankoUrlAttr", 2);
ye([
  We({ type: String, attribute: "base-path" })
], ge.prototype, "basePath", 2);
ye([
  We({ type: String, attribute: "auth-path" })
], ge.prototype, "authPath", 2);
ye([
  We({ type: Boolean, attribute: "osm-required" })
], ge.prototype, "osmRequired", 2);
ye([
  We({ type: String, attribute: "osm-scopes" })
], ge.prototype, "osmScopes", 2);
ye([
  We({ type: Boolean, attribute: "show-profile" })
], ge.prototype, "showProfile", 2);
ye([
  We({ type: String, attribute: "redirect-after-login" })
], ge.prototype, "redirectAfterLogin", 2);
ye([
  We({ type: Boolean, attribute: "auto-connect" })
], ge.prototype, "autoConnect", 2);
ye([
  We({ type: Boolean, attribute: "verify-session" })
], ge.prototype, "verifySession", 2);
ye([
  We({ type: String, attribute: "redirect-after-logout" })
], ge.prototype, "redirectAfterLogout", 2);
ye([
  We({ type: String, attribute: "display-name" })
], ge.prototype, "displayNameAttr", 2);
ye([
  We({ type: String, attribute: "mapping-check-url" })
], ge.prototype, "mappingCheckUrl", 2);
ye([
  We({ type: String, attribute: "app-id" })
], ge.prototype, "appId", 2);
ye([
  We({ type: String, attribute: "login-url" })
], ge.prototype, "loginUrl", 2);
ye([
  it()
], ge.prototype, "user", 2);
ye([
  it()
], ge.prototype, "osmConnected", 2);
ye([
  it()
], ge.prototype, "osmData", 2);
ye([
  it()
], ge.prototype, "osmLoading", 2);
ye([
  it()
], ge.prototype, "loading", 2);
ye([
  it()
], ge.prototype, "error", 2);
ye([
  it()
], ge.prototype, "profileDisplayName", 2);
ye([
  it()
], ge.prototype, "hasAppMapping", 2);
ye([
  it()
], ge.prototype, "isOpen", 2);
ge = ye([
  ns("hotosm-auth")
], ge);
export {
  ge as HankoAuth
};

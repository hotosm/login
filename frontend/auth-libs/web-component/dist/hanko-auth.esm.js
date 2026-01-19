var ts = Object.create;
var Pn = Object.defineProperty;
var ns = Object.getOwnPropertyDescriptor;
var Ao = (o, e) => (e = Symbol[o]) ? e : Symbol.for("Symbol." + o), gt = (o) => {
  throw TypeError(o);
};
var os = (o, e, t) => e in o ? Pn(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[e] = t;
var So = (o, e) => Pn(o, "name", { value: e, configurable: !0 });
var Oo = (o) => [, , , ts((o == null ? void 0 : o[Ao("metadata")]) ?? null)], Eo = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"], vt = (o) => o !== void 0 && typeof o != "function" ? gt("Function expected") : o, is = (o, e, t, n, i) => ({ kind: Eo[o], name: e, metadata: n, addInitializer: (s) => t._ ? gt("Already initialized") : i.push(vt(s || null)) }), ss = (o, e) => os(e, Ao("metadata"), o[3]), Po = (o, e, t, n) => {
  for (var i = 0, s = o[e >> 1], a = s && s.length; i < a; i++) e & 1 ? s[i].call(t) : n = s[i].call(t, n);
  return n;
}, Io = (o, e, t, n, i, s) => {
  var a, d, c, l, u, h = e & 7, v = !!(e & 8), p = !!(e & 16), S = h > 3 ? o.length + 1 : h ? v ? 1 : 2 : 0, E = Eo[h + 5], C = h > 3 && (o[S - 1] = []), x = o[S] || (o[S] = []), A = h && (!p && !v && (i = i.prototype), h < 5 && (h > 3 || !p) && ns(h < 4 ? i : { get [t]() {
    return xo(this, s);
  }, set [t](T) {
    return Co(this, s, T);
  } }, t));
  h ? p && h < 4 && So(s, (h > 2 ? "set " : h > 1 ? "get " : "") + t) : So(i, t);
  for (var I = n.length - 1; I >= 0; I--)
    l = is(h, t, c = {}, o[3], x), h && (l.static = v, l.private = p, u = l.access = { has: p ? (T) => rs(i, T) : (T) => t in T }, h ^ 3 && (u.get = p ? (T) => (h ^ 1 ? xo : as)(T, i, h ^ 4 ? s : A.get) : (T) => T[t]), h > 2 && (u.set = p ? (T, U) => Co(T, i, U, h ^ 4 ? s : A.set) : (T, U) => T[t] = U)), d = (0, n[I])(h ? h < 4 ? p ? s : A[E] : h > 4 ? void 0 : { get: A.get, set: A.set } : i, l), c._ = 1, h ^ 4 || d === void 0 ? vt(d) && (h > 4 ? C.unshift(d) : h ? p ? s = d : A[E] = d : i = d) : typeof d != "object" || d === null ? gt("Object expected") : (vt(a = d.get) && (A.get = a), vt(a = d.set) && (A.set = a), vt(a = d.init) && C.unshift(a));
  return h || ss(o, i), A && Pn(i, t, A), p ? h ^ 4 ? s : A : i;
};
var In = (o, e, t) => e.has(o) || gt("Cannot " + t), rs = (o, e) => Object(e) !== e ? gt('Cannot use the "in" operator on this value') : o.has(e), xo = (o, e, t) => (In(o, e, "read from private field"), t ? t.call(o) : e.get(o));
var Co = (o, e, t, n) => (In(o, e, "write to private field"), n ? n.call(o, t) : e.set(o, t), t), as = (o, e, t) => (In(o, e, "access private method"), t);
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const on = globalThis, Xn = on.ShadowRoot && (on.ShadyCSS === void 0 || on.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, eo = Symbol(), jo = /* @__PURE__ */ new WeakMap();
let gi = class {
  constructor(e, t, n) {
    if (this._$cssResult$ = !0, n !== eo) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (Xn && e === void 0) {
      const n = t !== void 0 && t.length === 1;
      n && (e = jo.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && jo.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const ls = (o) => new gi(typeof o == "string" ? o : o + "", void 0, eo), cs = (o, ...e) => {
  const t = o.length === 1 ? o[0] : e.reduce((n, i, s) => n + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + o[s + 1], o[0]);
  return new gi(t, o, eo);
}, ds = (o, e) => {
  if (Xn) o.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const n = document.createElement("style"), i = on.litNonce;
    i !== void 0 && n.setAttribute("nonce", i), n.textContent = t.cssText, o.appendChild(n);
  }
}, Do = Xn ? (o) => o : (o) => o instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const n of e.cssRules) t += n.cssText;
  return ls(t);
})(o) : o;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: us, defineProperty: hs, getOwnPropertyDescriptor: ps, getOwnPropertyNames: fs, getOwnPropertySymbols: ms, getPrototypeOf: vs } = Object, ot = globalThis, $o = ot.trustedTypes, gs = $o ? $o.emptyScript : "", jn = ot.reactiveElementPolyfillSupport, Lt = (o, e) => o, Vn = { toAttribute(o, e) {
  switch (e) {
    case Boolean:
      o = o ? gs : null;
      break;
    case Object:
    case Array:
      o = o == null ? o : JSON.stringify(o);
  }
  return o;
}, fromAttribute(o, e) {
  let t = o;
  switch (e) {
    case Boolean:
      t = o !== null;
      break;
    case Number:
      t = o === null ? null : Number(o);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(o);
      } catch {
        t = null;
      }
  }
  return t;
} }, _i = (o, e) => !us(o, e), Lo = { attribute: !0, type: String, converter: Vn, reflect: !1, useDefault: !1, hasChanged: _i };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), ot.litPropertyMetadata ?? (ot.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let ct = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = Lo) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const n = Symbol(), i = this.getPropertyDescriptor(e, n, t);
      i !== void 0 && hs(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, t, n) {
    const { get: i, set: s } = ps(this.prototype, e) ?? { get() {
      return this[t];
    }, set(a) {
      this[t] = a;
    } };
    return { get: i, set(a) {
      const d = i == null ? void 0 : i.call(this);
      s == null || s.call(this, a), this.requestUpdate(e, d, n);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Lo;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Lt("elementProperties"))) return;
    const e = vs(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Lt("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Lt("properties"))) {
      const t = this.properties, n = [...fs(t), ...ms(t)];
      for (const i of n) this.createProperty(i, t[i]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [n, i] of t) this.elementProperties.set(n, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, n] of this.elementProperties) {
      const i = this._$Eu(t, n);
      i !== void 0 && this._$Eh.set(i, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const n = new Set(e.flat(1 / 0).reverse());
      for (const i of n) t.unshift(Do(i));
    } else e !== void 0 && t.push(Do(e));
    return t;
  }
  static _$Eu(e, t) {
    const n = t.attribute;
    return n === !1 ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
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
    for (const n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ds(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((t) => {
      var n;
      return (n = t.hostConnected) == null ? void 0 : n.call(t);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((t) => {
      var n;
      return (n = t.hostDisconnected) == null ? void 0 : n.call(t);
    });
  }
  attributeChangedCallback(e, t, n) {
    this._$AK(e, n);
  }
  _$ET(e, t) {
    var s;
    const n = this.constructor.elementProperties.get(e), i = this.constructor._$Eu(e, n);
    if (i !== void 0 && n.reflect === !0) {
      const a = (((s = n.converter) == null ? void 0 : s.toAttribute) !== void 0 ? n.converter : Vn).toAttribute(t, n.type);
      this._$Em = e, a == null ? this.removeAttribute(i) : this.setAttribute(i, a), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var s, a;
    const n = this.constructor, i = n._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const d = n.getPropertyOptions(i), c = typeof d.converter == "function" ? { fromAttribute: d.converter } : ((s = d.converter) == null ? void 0 : s.fromAttribute) !== void 0 ? d.converter : Vn;
      this._$Em = i;
      const l = c.fromAttribute(t, d.type);
      this[i] = l ?? ((a = this._$Ej) == null ? void 0 : a.get(i)) ?? l, this._$Em = null;
    }
  }
  requestUpdate(e, t, n, i = !1, s) {
    var a;
    if (e !== void 0) {
      const d = this.constructor;
      if (i === !1 && (s = this[e]), n ?? (n = d.getPropertyOptions(e)), !((n.hasChanged ?? _i)(s, t) || n.useDefault && n.reflect && s === ((a = this._$Ej) == null ? void 0 : a.get(e)) && !this.hasAttribute(d._$Eu(e, n)))) return;
      this.C(e, t, n);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: n, reflect: i, wrapped: s }, a) {
    n && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), s !== !0 || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), i === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
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
    var n;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [s, a] of this._$Ep) this[s] = a;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [s, a] of i) {
        const { wrapped: d } = a, c = this[s];
        d !== !0 || this._$AL.has(s) || c === void 0 || this.C(s, void 0, a, c);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), (n = this._$EO) == null || n.forEach((i) => {
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
    (t = this._$EO) == null || t.forEach((n) => {
      var i;
      return (i = n.hostUpdated) == null ? void 0 : i.call(n);
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
ct.elementStyles = [], ct.shadowRootOptions = { mode: "open" }, ct[Lt("elementProperties")] = /* @__PURE__ */ new Map(), ct[Lt("finalized")] = /* @__PURE__ */ new Map(), jn == null || jn({ ReactiveElement: ct }), (ot.reactiveElementVersions ?? (ot.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Tt = globalThis, To = (o) => o, mn = Tt.trustedTypes, No = mn ? mn.createPolicy("lit-html", { createHTML: (o) => o }) : void 0, yi = "$lit$", nt = `lit$${Math.random().toFixed(9).slice(2)}$`, bi = "?" + nt, _s = `<${bi}>`, lt = document, Ut = () => lt.createComment(""), Mt = (o) => o === null || typeof o != "object" && typeof o != "function", to = Array.isArray, ys = (o) => to(o) || typeof (o == null ? void 0 : o[Symbol.iterator]) == "function", Dn = `[ 	
\f\r]`, _t = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Uo = /-->/g, Mo = />/g, st = RegExp(`>|${Dn}(?:([^\\s"'>=/]+)(${Dn}*=${Dn}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ro = /'/g, Ho = /"/g, ki = /^(?:script|style|textarea|title)$/i, bs = (o) => (e, ...t) => ({ _$litType$: o, strings: e, values: t }), Ue = bs(1), pt = Symbol.for("lit-noChange"), $e = Symbol.for("lit-nothing"), Wo = /* @__PURE__ */ new WeakMap(), rt = lt.createTreeWalker(lt, 129);
function wi(o, e) {
  if (!to(o) || !o.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return No !== void 0 ? No.createHTML(e) : e;
}
const ks = (o, e) => {
  const t = o.length - 1, n = [];
  let i, s = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = _t;
  for (let d = 0; d < t; d++) {
    const c = o[d];
    let l, u, h = -1, v = 0;
    for (; v < c.length && (a.lastIndex = v, u = a.exec(c), u !== null); ) v = a.lastIndex, a === _t ? u[1] === "!--" ? a = Uo : u[1] !== void 0 ? a = Mo : u[2] !== void 0 ? (ki.test(u[2]) && (i = RegExp("</" + u[2], "g")), a = st) : u[3] !== void 0 && (a = st) : a === st ? u[0] === ">" ? (a = i ?? _t, h = -1) : u[1] === void 0 ? h = -2 : (h = a.lastIndex - u[2].length, l = u[1], a = u[3] === void 0 ? st : u[3] === '"' ? Ho : Ro) : a === Ho || a === Ro ? a = st : a === Uo || a === Mo ? a = _t : (a = st, i = void 0);
    const p = a === st && o[d + 1].startsWith("/>") ? " " : "";
    s += a === _t ? c + _s : h >= 0 ? (n.push(l), c.slice(0, h) + yi + c.slice(h) + nt + p) : c + nt + (h === -2 ? d : p);
  }
  return [wi(o, s + (o[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), n];
};
let Zn = class Si {
  constructor({ strings: e, _$litType$: t }, n) {
    let i;
    this.parts = [];
    let s = 0, a = 0;
    const d = e.length - 1, c = this.parts, [l, u] = ks(e, t);
    if (this.el = Si.createElement(l, n), rt.currentNode = this.el.content, t === 2 || t === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (i = rt.nextNode()) !== null && c.length < d; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const h of i.getAttributeNames()) if (h.endsWith(yi)) {
          const v = u[a++], p = i.getAttribute(h).split(nt), S = /([.?@])?(.*)/.exec(v);
          c.push({ type: 1, index: s, name: S[2], strings: p, ctor: S[1] === "." ? Ss : S[1] === "?" ? xs : S[1] === "@" ? Cs : yn }), i.removeAttribute(h);
        } else h.startsWith(nt) && (c.push({ type: 6, index: s }), i.removeAttribute(h));
        if (ki.test(i.tagName)) {
          const h = i.textContent.split(nt), v = h.length - 1;
          if (v > 0) {
            i.textContent = mn ? mn.emptyScript : "";
            for (let p = 0; p < v; p++) i.append(h[p], Ut()), rt.nextNode(), c.push({ type: 2, index: ++s });
            i.append(h[v], Ut());
          }
        }
      } else if (i.nodeType === 8) if (i.data === bi) c.push({ type: 2, index: s });
      else {
        let h = -1;
        for (; (h = i.data.indexOf(nt, h + 1)) !== -1; ) c.push({ type: 7, index: s }), h += nt.length - 1;
      }
      s++;
    }
  }
  static createElement(e, t) {
    const n = lt.createElement("template");
    return n.innerHTML = e, n;
  }
};
function ft(o, e, t = o, n) {
  var a, d;
  if (e === pt) return e;
  let i = n !== void 0 ? (a = t._$Co) == null ? void 0 : a[n] : t._$Cl;
  const s = Mt(e) ? void 0 : e._$litDirective$;
  return (i == null ? void 0 : i.constructor) !== s && ((d = i == null ? void 0 : i._$AO) == null || d.call(i, !1), s === void 0 ? i = void 0 : (i = new s(o), i._$AT(o, t, n)), n !== void 0 ? (t._$Co ?? (t._$Co = []))[n] = i : t._$Cl = i), i !== void 0 && (e = ft(o, i._$AS(o, e.values), i, n)), e;
}
let ws = class {
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
    const { el: { content: t }, parts: n } = this._$AD, i = ((e == null ? void 0 : e.creationScope) ?? lt).importNode(t, !0);
    rt.currentNode = i;
    let s = rt.nextNode(), a = 0, d = 0, c = n[0];
    for (; c !== void 0; ) {
      if (a === c.index) {
        let l;
        c.type === 2 ? l = new no(s, s.nextSibling, this, e) : c.type === 1 ? l = new c.ctor(s, c.name, c.strings, this, e) : c.type === 6 && (l = new As(s, this, e)), this._$AV.push(l), c = n[++d];
      }
      a !== (c == null ? void 0 : c.index) && (s = rt.nextNode(), a++);
    }
    return rt.currentNode = lt, i;
  }
  p(e) {
    let t = 0;
    for (const n of this._$AV) n !== void 0 && (n.strings !== void 0 ? (n._$AI(e, n, t), t += n.strings.length - 2) : n._$AI(e[t])), t++;
  }
}, no = class xi {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, t, n, i) {
    this.type = 2, this._$AH = $e, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = i, this._$Cv = (i == null ? void 0 : i.isConnected) ?? !0;
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
    e = ft(this, e, t), Mt(e) ? e === $e || e == null || e === "" ? (this._$AH !== $e && this._$AR(), this._$AH = $e) : e !== this._$AH && e !== pt && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : ys(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== $e && Mt(this._$AH) ? this._$AA.nextSibling.data = e : this.T(lt.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var s;
    const { values: t, _$litType$: n } = e, i = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Zn.createElement(wi(n.h, n.h[0]), this.options)), n);
    if (((s = this._$AH) == null ? void 0 : s._$AD) === i) this._$AH.p(t);
    else {
      const a = new ws(i, this), d = a.u(this.options);
      a.p(t), this.T(d), this._$AH = a;
    }
  }
  _$AC(e) {
    let t = Wo.get(e.strings);
    return t === void 0 && Wo.set(e.strings, t = new Zn(e)), t;
  }
  k(e) {
    to(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let n, i = 0;
    for (const s of e) i === t.length ? t.push(n = new xi(this.O(Ut()), this.O(Ut()), this, this.options)) : n = t[i], n._$AI(s), i++;
    i < t.length && (this._$AR(n && n._$AB.nextSibling, i), t.length = i);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var n;
    for ((n = this._$AP) == null ? void 0 : n.call(this, !1, !0, t); e !== this._$AB; ) {
      const i = To(e).nextSibling;
      To(e).remove(), e = i;
    }
  }
  setConnected(e) {
    var t;
    this._$AM === void 0 && (this._$Cv = e, (t = this._$AP) == null || t.call(this, e));
  }
}, yn = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, n, i, s) {
    this.type = 1, this._$AH = $e, this._$AN = void 0, this.element = e, this.name = t, this._$AM = i, this.options = s, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(new String()), this.strings = n) : this._$AH = $e;
  }
  _$AI(e, t = this, n, i) {
    const s = this.strings;
    let a = !1;
    if (s === void 0) e = ft(this, e, t, 0), a = !Mt(e) || e !== this._$AH && e !== pt, a && (this._$AH = e);
    else {
      const d = e;
      let c, l;
      for (e = s[0], c = 0; c < s.length - 1; c++) l = ft(this, d[n + c], t, c), l === pt && (l = this._$AH[c]), a || (a = !Mt(l) || l !== this._$AH[c]), l === $e ? e = $e : e !== $e && (e += (l ?? "") + s[c + 1]), this._$AH[c] = l;
    }
    a && !i && this.j(e);
  }
  j(e) {
    e === $e ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}, Ss = class extends yn {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === $e ? void 0 : e;
  }
}, xs = class extends yn {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== $e);
  }
}, Cs = class extends yn {
  constructor(e, t, n, i, s) {
    super(e, t, n, i, s), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = ft(this, e, t, 0) ?? $e) === pt) return;
    const n = this._$AH, i = e === $e && n !== $e || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, s = e !== $e && (n === $e || i);
    i && this.element.removeEventListener(this.name, this, n), s && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}, As = class {
  constructor(e, t, n) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    ft(this, e);
  }
};
const $n = Tt.litHtmlPolyfillSupport;
$n == null || $n(Zn, no), (Tt.litHtmlVersions ?? (Tt.litHtmlVersions = [])).push("3.3.2");
const Os = (o, e, t) => {
  const n = (t == null ? void 0 : t.renderBefore) ?? e;
  let i = n._$litPart$;
  if (i === void 0) {
    const s = (t == null ? void 0 : t.renderBefore) ?? null;
    n._$litPart$ = i = new no(e.insertBefore(Ut(), s), s, void 0, t ?? {});
  }
  return i._$AI(o), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const at = globalThis;
let Nt = class extends ct {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Os(t, this.renderRoot, this.renderOptions);
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
    return pt;
  }
};
var mi;
Nt._$litElement$ = !0, Nt.finalized = !0, (mi = at.litElementHydrateSupport) == null || mi.call(at, { LitElement: Nt });
const Ln = at.litElementPolyfillSupport;
Ln == null || Ln({ LitElement: Nt });
(at.litElementVersions ?? (at.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Es = (o) => (e, t) => {
  t !== void 0 ? t.addInitializer(() => {
    customElements.define(o, e);
  }) : customElements.define(o, e);
};
/*! For license information please see elements.js.LICENSE.txt */
var Ps = { 7: function(o, e, t) {
  (function(n, i, s) {
    var a = function() {
      return a = Object.assign || function(S) {
        for (var E, C = 1, x = arguments.length; C < x; C++) for (var A in E = arguments[C]) Object.prototype.hasOwnProperty.call(E, A) && (S[A] = E[A]);
        return S;
      }, a.apply(this, arguments);
    };
    function d(S, E) {
      var C = typeof Symbol == "function" && S[Symbol.iterator];
      if (!C) return S;
      var x, A, I = C.call(S), T = [];
      try {
        for (; (E === void 0 || E-- > 0) && !(x = I.next()).done; ) T.push(x.value);
      } catch (U) {
        A = { error: U };
      } finally {
        try {
          x && !x.done && (C = I.return) && C.call(I);
        } finally {
          if (A) throw A.error;
        }
      }
      return T;
    }
    function c(S, E) {
      return [S, !S || S.endsWith("/") ? "" : "/", E, ".json"].join("");
    }
    function l(S, E) {
      var C = S;
      return E && Object.keys(E).forEach(function(x) {
        var A = E[x], I = new RegExp("{".concat(x, "}"), "gm");
        C = C.replace(I, A.toString());
      }), C;
    }
    function u(S, E, C) {
      var x = S[E];
      if (!x) return C;
      var A = C.split("."), I = "";
      do {
        var T = x[I += A.shift()];
        T === void 0 || typeof T != "object" && A.length ? A.length ? I += "." : x = C : (x = T, I = "");
      } while (A.length);
      return x;
    }
    var h = {}, v = { root: "", lang: "en", fallbackLang: "en" }, p = i.createContext(null);
    n.TranslateContext = p, n.TranslateProvider = function(S) {
      var E = function(T, U) {
        T = Object.assign({}, v, T), h = U || h;
        var ie = d(s.useState(T.lang), 2), _e = ie[0], se = ie[1], be = d(s.useState(h), 2), M = be[0], z = be[1], ve = d(s.useState(!1), 2), je = ve[0], Oe = ve[1], De = function(re) {
          if (!M.hasOwnProperty(re)) {
            Oe(!1);
            var ae = c(T.root, re);
            fetch(ae).then(function(he) {
              return he.json();
            }).then(function(he) {
              h[re] = he, z(a({}, h)), Oe(!0);
            }).catch(function(he) {
              console.log("Aww, snap.", he), z(a({}, h)), Oe(!0);
            });
          }
        };
        return s.useEffect(function() {
          De(T.fallbackLang), De(_e);
        }, [_e]), { lang: _e, setLang: se, t: function(re, ae) {
          if (!M.hasOwnProperty(_e)) return re;
          var he = u(M, _e, re);
          return he === re && _e !== T.fallbackLang && (he = u(M, T.fallbackLang, re)), l(he, ae);
        }, isReady: je };
      }({ root: S.root || "assets", lang: S.lang || "en", fallbackLang: S.fallbackLang || "en" }, S.translations), C = E.t, x = E.setLang, A = E.lang, I = E.isReady;
      return i.h(p.Provider, { value: { t: C, setLang: x, lang: A, isReady: I } }, S.children);
    }, n.format = l, n.getResourceUrl = c, n.getValue = u, Object.defineProperty(n, "__esModule", { value: !0 });
  })(e, t(616), t(78));
}, 633: (o, e) => {
  var t;
  (function() {
    var n = {}.hasOwnProperty;
    function i() {
      for (var s = [], a = 0; a < arguments.length; a++) {
        var d = arguments[a];
        if (d) {
          var c = typeof d;
          if (c === "string" || c === "number") s.push(d);
          else if (Array.isArray(d)) {
            if (d.length) {
              var l = i.apply(null, d);
              l && s.push(l);
            }
          } else if (c === "object") {
            if (d.toString !== Object.prototype.toString && !d.toString.toString().includes("[native code]")) {
              s.push(d.toString());
              continue;
            }
            for (var u in d) n.call(d, u) && d[u] && s.push(u);
          }
        }
      }
      return s.join(" ");
    }
    o.exports ? (i.default = i, o.exports = i) : (t = (function() {
      return i;
    }).apply(e, [])) === void 0 || (o.exports = t);
  })();
}, 21: (o, e, t) => {
  t.d(e, { A: () => d });
  var n = t(645), i = t.n(n), s = t(278), a = t.n(s)()(i());
  a.push([o.id, '.hanko_accordion{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);width:100%;overflow:hidden}.hanko_accordion .hanko_accordionItem{color:var(--color, #333333);margin:.25rem 0;overflow:hidden}.hanko_accordion .hanko_accordionItem.hanko_dropdown{margin:0}.hanko_accordion .hanko_accordionItem .hanko_label{border-radius:var(--border-radius, 8px);border-style:none;height:var(--item-height, 42px);background:var(--background-color, white);box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;padding:0 1rem;margin:0;cursor:pointer;transition:all .35s}.hanko_accordion .hanko_accordionItem .hanko_label .hanko_labelText{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hanko_accordion .hanko_accordionItem .hanko_label .hanko_labelText .hanko_description{color:var(--color-shade-1, #8f9095)}.hanko_accordion .hanko_accordionItem .hanko_label.hanko_dropdown{margin:0;color:var(--link-color, #506cf0);justify-content:flex-start}.hanko_accordion .hanko_accordionItem .hanko_label:hover{color:var(--brand-contrast-color, white);background:var(--brand-color-shade-1, #6b84fb)}.hanko_accordion .hanko_accordionItem .hanko_label:hover .hanko_description{color:var(--brand-contrast-color, white)}.hanko_accordion .hanko_accordionItem .hanko_label:hover.hanko_dropdown{color:var(--link-color, #506cf0);background:none}.hanko_accordion .hanko_accordionItem .hanko_label:not(.hanko_dropdown)::after{content:"❯";width:1rem;text-align:center;transition:all .35s}.hanko_accordion .hanko_accordionItem .hanko_accordionInput{position:absolute;opacity:0;z-index:-1}.hanko_accordion .hanko_accordionItem .hanko_accordionInput:checked+.hanko_label{color:var(--brand-contrast-color, white);background:var(--brand-color, #506cf0)}.hanko_accordion .hanko_accordionItem .hanko_accordionInput:checked+.hanko_label .hanko_description{color:var(--brand-contrast-color, white)}.hanko_accordion .hanko_accordionItem .hanko_accordionInput:checked+.hanko_label.hanko_dropdown{color:var(--link-color, #506cf0);background:none}.hanko_accordion .hanko_accordionItem .hanko_accordionInput:checked+.hanko_label:not(.hanko_dropdown)::after{transform:rotate(90deg)}.hanko_accordion .hanko_accordionItem .hanko_accordionInput:checked+.hanko_label~.hanko_accordionContent{margin:.25rem 1rem;opacity:1;max-height:100vh}.hanko_accordion .hanko_accordionItem .hanko_accordionContent{max-height:0;margin:0 1rem;opacity:0;overflow:hidden;transition:all .35s}.hanko_accordion .hanko_accordionItem .hanko_accordionContent.hanko_dropdownContent{border-style:none}', ""]), a.locals = { accordion: "hanko_accordion", accordionItem: "hanko_accordionItem", dropdown: "hanko_dropdown", label: "hanko_label", labelText: "hanko_labelText", description: "hanko_description", accordionInput: "hanko_accordionInput", accordionContent: "hanko_accordionContent", dropdownContent: "hanko_dropdownContent" };
  const d = a;
}, 905: (o, e, t) => {
  t.d(e, { A: () => d });
  var n = t(645), i = t.n(n), s = t(278), a = t.n(s)()(i());
  a.push([o.id, ".hanko_errorBox{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);border-radius:var(--border-radius, 8px);border-style:var(--border-style, solid);border-width:var(--border-width, 1px);color:var(--error-color, #e82020);background:var(--background-color, white);margin:var(--item-margin, 0.5rem 0);display:flex;align-items:start;box-sizing:border-box;line-height:1.5rem;padding:.25em;gap:.2em}.hanko_errorBox>span{display:inline-flex}.hanko_errorBox>span:first-child{padding:.25em 0 .25em .19em}.hanko_errorBox[hidden]{display:none}.hanko_errorMessage{color:var(--error-color, #e82020)}", ""]), a.locals = { errorBox: "hanko_errorBox", errorMessage: "hanko_errorMessage" };
  const d = a;
}, 577: (o, e, t) => {
  t.d(e, { A: () => d });
  var n = t(645), i = t.n(n), s = t(278), a = t.n(s)()(i());
  a.push([o.id, '.hanko_form{display:flex;flex-grow:1}.hanko_form .hanko_ul{flex-grow:1;margin:var(--item-margin, 0.5rem 0);padding-inline-start:0;list-style-type:none;display:flex;flex-wrap:wrap;gap:1em}.hanko_form .hanko_li{display:flex;max-width:100%;flex-grow:1;flex-basis:min-content}.hanko_form .hanko_li.hanko_maxWidth{min-width:100%}.hanko_button{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);border-radius:var(--border-radius, 8px);border-style:var(--border-style, solid);border-width:var(--border-width, 1px);white-space:nowrap;width:100%;min-width:var(--button-min-width, 7em);min-height:var(--item-height, 42px);outline:none;cursor:pointer;transition:.1s ease-out;flex-grow:1;flex-shrink:1;display:inline-flex}.hanko_button:disabled{cursor:default}.hanko_button.hanko_primary{color:var(--brand-contrast-color, white);background:var(--brand-color, #506cf0);border-color:var(--brand-color, #506cf0);justify-content:center}.hanko_button.hanko_primary:hover{color:var(--brand-contrast-color, white);background:var(--brand-color-shade-1, #6b84fb);border-color:var(--brand-color, #506cf0)}.hanko_button.hanko_primary:focus{color:var(--brand-contrast-color, white);background:var(--brand-color, #506cf0);border-color:var(--color, #333333)}.hanko_button.hanko_primary:disabled{color:var(--color-shade-1, #8f9095);background:var(--color-shade-2, #e5e6ef);border-color:var(--color-shade-2, #e5e6ef)}.hanko_button.hanko_secondary{color:var(--color, #333333);background:var(--background-color, white);border-color:var(--color, #333333);justify-content:flex-start}.hanko_button.hanko_secondary:hover{color:var(--color, #333333);background:var(--color-shade-2, #e5e6ef);border-color:var(--color, #333333)}.hanko_button.hanko_secondary:focus{color:var(--color, #333333);background:var(--background-color, white);border-color:var(--brand-color, #506cf0)}.hanko_button.hanko_secondary:disabled{color:var(--color-shade-1, #8f9095);background:var(--color-shade-2, #e5e6ef);border-color:var(--color-shade-1, #8f9095)}.hanko_button.hanko_dangerous{color:var(--error-color, #e82020);background:var(--background-color, white);border-color:var(--error-color, #e82020);flex-grow:0;width:auto}.hanko_caption{flex-grow:1;flex-wrap:wrap;display:flex;justify-content:space-between;align-items:baseline}.hanko_lastUsed{color:var(--color-shade-1, #8f9095);font-size:smaller}.hanko_inputWrapper{flex-grow:1;position:relative;display:flex;min-width:var(--input-min-width, 14em);max-width:100%}.hanko_input{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);border-radius:var(--border-radius, 8px);border-style:var(--border-style, solid);border-width:var(--border-width, 1px);height:var(--item-height, 42px);color:var(--color, #333333);border-color:var(--color-shade-1, #8f9095);background:var(--background-color, white);padding:0 .5rem;outline:none;width:100%;box-sizing:border-box;transition:.1s ease-out}.hanko_input.hanko_error{border-color:var(--error-color, #e82020)}.hanko_input:-webkit-autofill,.hanko_input:-webkit-autofill:hover,.hanko_input:-webkit-autofill:focus{-webkit-text-fill-color:var(--color, #333333);-webkit-box-shadow:0 0 0 50px var(--background-color, white) inset}.hanko_input::-ms-reveal,.hanko_input::-ms-clear{display:none}.hanko_input::placeholder{color:var(--color-shade-1, #8f9095)}.hanko_input:focus{color:var(--color, #333333);border-color:var(--color, #333333)}.hanko_input:disabled{color:var(--color-shade-1, #8f9095);background:var(--color-shade-2, #e5e6ef);border-color:var(--color-shade-1, #8f9095)}.hanko_passcodeInputWrapper{flex-grow:1;min-width:var(--input-min-width, 14em);max-width:fit-content;position:relative;display:flex;justify-content:space-between}.hanko_passcodeInputWrapper .hanko_passcodeDigitWrapper{flex-grow:1;margin:0 .5rem 0 0}.hanko_passcodeInputWrapper .hanko_passcodeDigitWrapper:last-child{margin:0}.hanko_passcodeInputWrapper .hanko_passcodeDigitWrapper .hanko_input{text-align:center}.hanko_checkboxWrapper{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);color:var(--color, #333333);align-items:center;display:flex}.hanko_checkboxWrapper .hanko_label{color:inherit;padding-left:.5rem;cursor:pointer}.hanko_checkboxWrapper .hanko_label.hanko_disabled{cursor:default;color:var(--color-shade-1, #8f9095)}.hanko_checkboxWrapper .hanko_checkbox{border:currentColor solid 1px;border-radius:.15em;appearance:none;-webkit-appearance:none;width:1.1rem;height:1.1rem;margin:0;color:currentColor;background-color:var(--background-color, white);font:inherit;box-shadow:none;display:inline-flex;place-content:center;cursor:pointer}.hanko_checkboxWrapper .hanko_checkbox:checked{background-color:var(--color, #333333)}.hanko_checkboxWrapper .hanko_checkbox:disabled{cursor:default;background-color:var(--color-shade-2, #e5e6ef);border-color:var(--color-shade-1, #8f9095)}.hanko_checkboxWrapper .hanko_checkbox:checked:after{content:"✓";color:var(--background-color, white);position:absolute;line-height:1.1rem}.hanko_checkboxWrapper .hanko_checkbox:disabled:after{color:var(--color-shade-1, #8f9095)}', ""]), a.locals = { form: "hanko_form", ul: "hanko_ul", li: "hanko_li", maxWidth: "hanko_maxWidth", button: "hanko_button", primary: "hanko_primary", secondary: "hanko_secondary", dangerous: "hanko_dangerous", caption: "hanko_caption", lastUsed: "hanko_lastUsed", inputWrapper: "hanko_inputWrapper", input: "hanko_input", error: "hanko_error", passcodeInputWrapper: "hanko_passcodeInputWrapper", passcodeDigitWrapper: "hanko_passcodeDigitWrapper", checkboxWrapper: "hanko_checkboxWrapper", label: "hanko_label", disabled: "hanko_disabled", checkbox: "hanko_checkbox" };
  const d = a;
}, 619: (o, e, t) => {
  t.d(e, { A: () => d });
  var n = t(645), i = t.n(n), s = t(278), a = t.n(s)()(i());
  a.push([o.id, ".hanko_headline{color:var(--color, #333333);font-family:var(--font-family, sans-serif);text-align:left;letter-spacing:0;font-style:normal;line-height:1.1}.hanko_headline.hanko_grade1{font-size:var(--headline1-font-size, 24px);font-weight:var(--headline1-font-weight, 600);margin:var(--headline1-margin, 0 0 0.5rem)}.hanko_headline.hanko_grade2{font-size:var(--headline2-font-size, 16px);font-weight:var(--headline2-font-weight, 600);margin:var(--headline2-margin, 1rem 0 0.5rem)}", ""]), a.locals = { headline: "hanko_headline", grade1: "hanko_grade1", grade2: "hanko_grade2" };
  const d = a;
}, 697: (o, e, t) => {
  t.d(e, { A: () => d });
  var n = t(645), i = t.n(n), s = t(278), a = t.n(s)()(i());
  a.push([o.id, ".hanko_icon,.hanko_loadingSpinnerWrapper .hanko_loadingSpinner,.hanko_loadingSpinnerWrapperIcon .hanko_loadingSpinner,.hanko_exclamationMark,.hanko_checkmark{display:inline-block;fill:var(--brand-contrast-color, white);width:18px}.hanko_icon.hanko_secondary,.hanko_loadingSpinnerWrapper .hanko_secondary.hanko_loadingSpinner,.hanko_loadingSpinnerWrapperIcon .hanko_secondary.hanko_loadingSpinner,.hanko_secondary.hanko_exclamationMark,.hanko_secondary.hanko_checkmark{fill:var(--color, #333333)}.hanko_icon.hanko_disabled,.hanko_loadingSpinnerWrapper .hanko_disabled.hanko_loadingSpinner,.hanko_loadingSpinnerWrapperIcon .hanko_disabled.hanko_loadingSpinner,.hanko_disabled.hanko_exclamationMark,.hanko_disabled.hanko_checkmark{fill:var(--color-shade-1, #8f9095)}.hanko_checkmark{fill:var(--brand-color, #506cf0)}.hanko_checkmark.hanko_secondary{fill:var(--color-shade-1, #8f9095)}.hanko_checkmark.hanko_fadeOut{animation:hanko_fadeOut ease-out 1.5s forwards !important}@keyframes hanko_fadeOut{0%{opacity:1}100%{opacity:0}}.hanko_exclamationMark{fill:var(--error-color, #e82020)}.hanko_loadingSpinnerWrapperIcon{width:100%;column-gap:10px;margin-left:10px}.hanko_loadingSpinnerWrapper,.hanko_loadingSpinnerWrapperIcon{display:inline-flex;align-items:center;height:100%;margin:0 5px;justify-content:inherit;flex-wrap:inherit}.hanko_loadingSpinnerWrapper.hanko_centerContent,.hanko_centerContent.hanko_loadingSpinnerWrapperIcon{justify-content:center}.hanko_loadingSpinnerWrapper.hanko_maxWidth,.hanko_maxWidth.hanko_loadingSpinnerWrapperIcon{width:100%}.hanko_loadingSpinnerWrapper .hanko_loadingSpinner,.hanko_loadingSpinnerWrapperIcon .hanko_loadingSpinner{fill:var(--brand-color, #506cf0);animation:hanko_spin 500ms ease-in-out infinite}.hanko_loadingSpinnerWrapper.hanko_secondary,.hanko_secondary.hanko_loadingSpinnerWrapperIcon{fill:var(--color-shade-1, #8f9095)}@keyframes hanko_spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}.hanko_googleIcon.hanko_disabled{fill:var(--color-shade-1, #8f9095)}.hanko_googleIcon.hanko_blue{fill:#4285f4}.hanko_googleIcon.hanko_green{fill:#34a853}.hanko_googleIcon.hanko_yellow{fill:#fbbc05}.hanko_googleIcon.hanko_red{fill:#ea4335}.hanko_microsoftIcon.hanko_disabled{fill:var(--color-shade-1, #8f9095)}.hanko_microsoftIcon.hanko_blue{fill:#00a4ef}.hanko_microsoftIcon.hanko_green{fill:#7fba00}.hanko_microsoftIcon.hanko_yellow{fill:#ffb900}.hanko_microsoftIcon.hanko_red{fill:#f25022}.hanko_facebookIcon.hanko_outline{fill:#0866ff}.hanko_facebookIcon.hanko_disabledOutline{fill:var(--color-shade-1, #8f9095)}.hanko_facebookIcon.hanko_letter{fill:#fff}.hanko_facebookIcon.hanko_disabledLetter{fill:var(--color-shade-2, #e5e6ef)}", ""]), a.locals = { icon: "hanko_icon", loadingSpinnerWrapper: "hanko_loadingSpinnerWrapper", loadingSpinner: "hanko_loadingSpinner", loadingSpinnerWrapperIcon: "hanko_loadingSpinnerWrapperIcon", exclamationMark: "hanko_exclamationMark", checkmark: "hanko_checkmark", secondary: "hanko_secondary", disabled: "hanko_disabled", fadeOut: "hanko_fadeOut", centerContent: "hanko_centerContent", maxWidth: "hanko_maxWidth", spin: "hanko_spin", googleIcon: "hanko_googleIcon", blue: "hanko_blue", green: "hanko_green", yellow: "hanko_yellow", red: "hanko_red", microsoftIcon: "hanko_microsoftIcon", facebookIcon: "hanko_facebookIcon", outline: "hanko_outline", disabledOutline: "hanko_disabledOutline", letter: "hanko_letter", disabledLetter: "hanko_disabledLetter" };
  const d = a;
}, 995: (o, e, t) => {
  t.d(e, { A: () => d });
  var n = t(645), i = t.n(n), s = t(278), a = t.n(s)()(i());
  a.push([o.id, ".hanko_link{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);color:var(--link-color, #506cf0);text-decoration:var(--link-text-decoration, none);cursor:pointer;background:none !important;border:none;padding:0 !important;transition:all .1s}.hanko_link:hover{text-decoration:var(--link-text-decoration-hover, underline)}.hanko_link:disabled{color:var(--color, #333333) !important;pointer-events:none;cursor:default}.hanko_link.hanko_danger{color:var(--error-color, #e82020)}.hanko_linkWrapper{display:inline-flex;flex-direction:row;justify-content:space-between;align-items:center;overflow:hidden}.hanko_linkWrapper.hanko_reverse{flex-direction:row-reverse}", ""]), a.locals = { link: "hanko_link", danger: "hanko_danger", linkWrapper: "hanko_linkWrapper", reverse: "hanko_reverse" };
  const d = a;
}, 560: (o, e, t) => {
  t.d(e, { A: () => d });
  var n = t(645), i = t.n(n), s = t(278), a = t.n(s)()(i());
  a.push([o.id, ".hanko_otpCreationDetails{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);color:var(--color, #333333);margin:var(--item-margin, 0.5rem 0);display:flex;justify-content:center;align-items:center;flex-direction:column;font-size:smaller}", ""]), a.locals = { otpCreationDetails: "hanko_otpCreationDetails" };
  const d = a;
}, 489: (o, e, t) => {
  t.d(e, { A: () => d });
  var n = t(645), i = t.n(n), s = t(278), a = t.n(s)()(i());
  a.push([o.id, ".hanko_paragraph{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);color:var(--color, #333333);margin:var(--item-margin, 0.5rem 0);text-align:left;word-break:break-word}", ""]), a.locals = { paragraph: "hanko_paragraph" };
  const d = a;
}, 111: (o, e, t) => {
  t.d(e, { A: () => d });
  var n = t(645), i = t.n(n), s = t(278), a = t.n(s)()(i());
  a.push([o.id, ".hanko_spacer{height:1em}.hanko_divider{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);display:flex;visibility:var(--divider-visibility, visible);color:var(--color-shade-1, #8f9095);margin:var(--item-margin, 0.5rem 0);padding:.5em 0}.hanko_divider .hanko_line{border-bottom-style:var(--border-style, solid);border-bottom-width:var(--border-width, 1px);color:inherit;font:inherit;width:100%}.hanko_divider .hanko_text{font:inherit;color:inherit;background:var(--background-color, white);padding:var(--divider-padding, 0 42px);line-height:.1em}", ""]), a.locals = { spacer: "hanko_spacer", divider: "hanko_divider", line: "hanko_line", text: "hanko_text" };
  const d = a;
}, 914: (o, e, t) => {
  t.d(e, { A: () => d });
  var n = t(645), i = t.n(n), s = t(278), a = t.n(s)()(i());
  a.push([o.id, ".hanko_container{background-color:var(--background-color, white);padding:var(--container-padding, 30px);max-width:var(--container-max-width, 410px);display:flex;flex-direction:column;flex-wrap:nowrap;justify-content:center;align-items:center;align-content:flex-start;box-sizing:border-box}.hanko_content{box-sizing:border-box;flex:0 1 auto;width:100%;height:100%}.hanko_footer{padding:.5rem 0 0;box-sizing:border-box;width:100%}.hanko_footer :nth-child(1){float:left}.hanko_footer :nth-child(2){float:right}.hanko_clipboardContainer{display:flex}.hanko_clipboardIcon{display:flex;margin:auto;cursor:pointer}", ""]), a.locals = { container: "hanko_container", content: "hanko_content", footer: "hanko_footer", clipboardContainer: "hanko_clipboardContainer", clipboardIcon: "hanko_clipboardIcon" };
  const d = a;
}, 278: (o) => {
  o.exports = function(e) {
    var t = [];
    return t.toString = function() {
      return this.map(function(n) {
        var i = "", s = n[5] !== void 0;
        return n[4] && (i += "@supports (".concat(n[4], ") {")), n[2] && (i += "@media ".concat(n[2], " {")), s && (i += "@layer".concat(n[5].length > 0 ? " ".concat(n[5]) : "", " {")), i += e(n), s && (i += "}"), n[2] && (i += "}"), n[4] && (i += "}"), i;
      }).join("");
    }, t.i = function(n, i, s, a, d) {
      typeof n == "string" && (n = [[null, n, void 0]]);
      var c = {};
      if (s) for (var l = 0; l < this.length; l++) {
        var u = this[l][0];
        u != null && (c[u] = !0);
      }
      for (var h = 0; h < n.length; h++) {
        var v = [].concat(n[h]);
        s && c[v[0]] || (d !== void 0 && (v[5] === void 0 || (v[1] = "@layer".concat(v[5].length > 0 ? " ".concat(v[5]) : "", " {").concat(v[1], "}")), v[5] = d), i && (v[2] && (v[1] = "@media ".concat(v[2], " {").concat(v[1], "}")), v[2] = i), a && (v[4] ? (v[1] = "@supports (".concat(v[4], ") {").concat(v[1], "}"), v[4] = a) : v[4] = "".concat(a)), t.push(v));
      }
    }, t;
  };
}, 645: (o) => {
  o.exports = function(e) {
    return e[1];
  };
}, 616: (o, e, t) => {
  t.r(e), t.d(e, { Component: () => U, Fragment: () => T, cloneElement: () => He, createContext: () => We, createElement: () => x, createRef: () => I, h: () => x, hydrate: () => Re, isValidElement: () => a, options: () => i, render: () => pe, toChildArray: () => ve });
  var n, i, s, a, d, c, l, u, h, v = {}, p = [], S = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
  function E(m, g) {
    for (var b in g) m[b] = g[b];
    return m;
  }
  function C(m) {
    var g = m.parentNode;
    g && g.removeChild(m);
  }
  function x(m, g, b) {
    var D, N, j, W = {};
    for (j in g) j == "key" ? D = g[j] : j == "ref" ? N = g[j] : W[j] = g[j];
    if (arguments.length > 2 && (W.children = arguments.length > 3 ? n.call(arguments, 2) : b), typeof m == "function" && m.defaultProps != null) for (j in m.defaultProps) W[j] === void 0 && (W[j] = m.defaultProps[j]);
    return A(m, W, D, N, null);
  }
  function A(m, g, b, D, N) {
    var j = { type: m, props: g, key: b, ref: D, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, __h: null, constructor: void 0, __v: N ?? ++s };
    return N == null && i.vnode != null && i.vnode(j), j;
  }
  function I() {
    return { current: null };
  }
  function T(m) {
    return m.children;
  }
  function U(m, g) {
    this.props = m, this.context = g;
  }
  function ie(m, g) {
    if (g == null) return m.__ ? ie(m.__, m.__.__k.indexOf(m) + 1) : null;
    for (var b; g < m.__k.length; g++) if ((b = m.__k[g]) != null && b.__e != null) return b.__e;
    return typeof m.type == "function" ? ie(m) : null;
  }
  function _e(m) {
    var g, b;
    if ((m = m.__) != null && m.__c != null) {
      for (m.__e = m.__c.base = null, g = 0; g < m.__k.length; g++) if ((b = m.__k[g]) != null && b.__e != null) {
        m.__e = m.__c.base = b.__e;
        break;
      }
      return _e(m);
    }
  }
  function se(m) {
    (!m.__d && (m.__d = !0) && d.push(m) && !be.__r++ || c !== i.debounceRendering) && ((c = i.debounceRendering) || l)(be);
  }
  function be() {
    var m, g, b, D, N, j, W, X;
    for (d.sort(u); m = d.shift(); ) m.__d && (g = d.length, D = void 0, N = void 0, W = (j = (b = m).__v).__e, (X = b.__P) && (D = [], (N = E({}, j)).__v = j.__v + 1, Ee(X, j, N, b.__n, X.ownerSVGElement !== void 0, j.__h != null ? [W] : null, D, W ?? ie(j), j.__h), k(D, j), j.__e != W && _e(j)), d.length > g && d.sort(u));
    be.__r = 0;
  }
  function M(m, g, b, D, N, j, W, X, G, ge) {
    var w, ye, J, R, P, ke, B, F = D && D.__k || p, Ne = F.length;
    for (b.__k = [], w = 0; w < g.length; w++) if ((R = b.__k[w] = (R = g[w]) == null || typeof R == "boolean" || typeof R == "function" ? null : typeof R == "string" || typeof R == "number" || typeof R == "bigint" ? A(null, R, null, null, R) : Array.isArray(R) ? A(T, { children: R }, null, null, null) : R.__b > 0 ? A(R.type, R.props, R.key, R.ref ? R.ref : null, R.__v) : R) != null) {
      if (R.__ = b, R.__b = b.__b + 1, (J = F[w]) === null || J && R.key == J.key && R.type === J.type) F[w] = void 0;
      else for (ye = 0; ye < Ne; ye++) {
        if ((J = F[ye]) && R.key == J.key && R.type === J.type) {
          F[ye] = void 0;
          break;
        }
        J = null;
      }
      Ee(m, R, J = J || v, N, j, W, X, G, ge), P = R.__e, (ye = R.ref) && J.ref != ye && (B || (B = []), J.ref && B.push(J.ref, null, R), B.push(ye, R.__c || P, R)), P != null ? (ke == null && (ke = P), typeof R.type == "function" && R.__k === J.__k ? R.__d = G = z(R, G, m) : G = je(m, R, J, F, P, G), typeof b.type == "function" && (b.__d = G)) : G && J.__e == G && G.parentNode != m && (G = ie(J));
    }
    for (b.__e = ke, w = Ne; w--; ) F[w] != null && (typeof b.type == "function" && F[w].__e != null && F[w].__e == b.__d && (b.__d = Oe(D).nextSibling), L(F[w], F[w]));
    if (B) for (w = 0; w < B.length; w++) y(B[w], B[++w], B[++w]);
  }
  function z(m, g, b) {
    for (var D, N = m.__k, j = 0; N && j < N.length; j++) (D = N[j]) && (D.__ = m, g = typeof D.type == "function" ? z(D, g, b) : je(b, D, D, N, D.__e, g));
    return g;
  }
  function ve(m, g) {
    return g = g || [], m == null || typeof m == "boolean" || (Array.isArray(m) ? m.some(function(b) {
      ve(b, g);
    }) : g.push(m)), g;
  }
  function je(m, g, b, D, N, j) {
    var W, X, G;
    if (g.__d !== void 0) W = g.__d, g.__d = void 0;
    else if (b == null || N != j || N.parentNode == null) e: if (j == null || j.parentNode !== m) m.appendChild(N), W = null;
    else {
      for (X = j, G = 0; (X = X.nextSibling) && G < D.length; G += 1) if (X == N) break e;
      m.insertBefore(N, j), W = j;
    }
    return W !== void 0 ? W : N.nextSibling;
  }
  function Oe(m) {
    var g, b, D;
    if (m.type == null || typeof m.type == "string") return m.__e;
    if (m.__k) {
      for (g = m.__k.length - 1; g >= 0; g--) if ((b = m.__k[g]) && (D = Oe(b))) return D;
    }
    return null;
  }
  function De(m, g, b) {
    g[0] === "-" ? m.setProperty(g, b ?? "") : m[g] = b == null ? "" : typeof b != "number" || S.test(g) ? b : b + "px";
  }
  function re(m, g, b, D, N) {
    var j;
    e: if (g === "style") if (typeof b == "string") m.style.cssText = b;
    else {
      if (typeof D == "string" && (m.style.cssText = D = ""), D) for (g in D) b && g in b || De(m.style, g, "");
      if (b) for (g in b) D && b[g] === D[g] || De(m.style, g, b[g]);
    }
    else if (g[0] === "o" && g[1] === "n") j = g !== (g = g.replace(/Capture$/, "")), g = g.toLowerCase() in m ? g.toLowerCase().slice(2) : g.slice(2), m.l || (m.l = {}), m.l[g + j] = b, b ? D || m.addEventListener(g, j ? he : ae, j) : m.removeEventListener(g, j ? he : ae, j);
    else if (g !== "dangerouslySetInnerHTML") {
      if (N) g = g.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if (g !== "width" && g !== "height" && g !== "href" && g !== "list" && g !== "form" && g !== "tabIndex" && g !== "download" && g in m) try {
        m[g] = b ?? "";
        break e;
      } catch {
      }
      typeof b == "function" || (b == null || b === !1 && g.indexOf("-") == -1 ? m.removeAttribute(g) : m.setAttribute(g, b));
    }
  }
  function ae(m) {
    return this.l[m.type + !1](i.event ? i.event(m) : m);
  }
  function he(m) {
    return this.l[m.type + !0](i.event ? i.event(m) : m);
  }
  function Ee(m, g, b, D, N, j, W, X, G) {
    var ge, w, ye, J, R, P, ke, B, F, Ne, et, fe, Ft, tt, H, V = g.type;
    if (g.constructor !== void 0) return null;
    b.__h != null && (G = b.__h, X = g.__e = b.__e, g.__h = null, j = [X]), (ge = i.__b) && ge(g);
    try {
      e: if (typeof V == "function") {
        if (B = g.props, F = (ge = V.contextType) && D[ge.__c], Ne = ge ? F ? F.props.value : ge.__ : D, b.__c ? ke = (w = g.__c = b.__c).__ = w.__E : ("prototype" in V && V.prototype.render ? g.__c = w = new V(B, Ne) : (g.__c = w = new U(B, Ne), w.constructor = V, w.render = K), F && F.sub(w), w.props = B, w.state || (w.state = {}), w.context = Ne, w.__n = D, ye = w.__d = !0, w.__h = [], w._sb = []), w.__s == null && (w.__s = w.state), V.getDerivedStateFromProps != null && (w.__s == w.state && (w.__s = E({}, w.__s)), E(w.__s, V.getDerivedStateFromProps(B, w.__s))), J = w.props, R = w.state, w.__v = g, ye) V.getDerivedStateFromProps == null && w.componentWillMount != null && w.componentWillMount(), w.componentDidMount != null && w.__h.push(w.componentDidMount);
        else {
          if (V.getDerivedStateFromProps == null && B !== J && w.componentWillReceiveProps != null && w.componentWillReceiveProps(B, Ne), !w.__e && w.shouldComponentUpdate != null && w.shouldComponentUpdate(B, w.__s, Ne) === !1 || g.__v === b.__v) {
            for (g.__v !== b.__v && (w.props = B, w.state = w.__s, w.__d = !1), w.__e = !1, g.__e = b.__e, g.__k = b.__k, g.__k.forEach(function(Ve) {
              Ve && (Ve.__ = g);
            }), et = 0; et < w._sb.length; et++) w.__h.push(w._sb[et]);
            w._sb = [], w.__h.length && W.push(w);
            break e;
          }
          w.componentWillUpdate != null && w.componentWillUpdate(B, w.__s, Ne), w.componentDidUpdate != null && w.__h.push(function() {
            w.componentDidUpdate(J, R, P);
          });
        }
        if (w.context = Ne, w.props = B, w.__P = m, fe = i.__r, Ft = 0, "prototype" in V && V.prototype.render) {
          for (w.state = w.__s, w.__d = !1, fe && fe(g), ge = w.render(w.props, w.state, w.context), tt = 0; tt < w._sb.length; tt++) w.__h.push(w._sb[tt]);
          w._sb = [];
        } else do
          w.__d = !1, fe && fe(g), ge = w.render(w.props, w.state, w.context), w.state = w.__s;
        while (w.__d && ++Ft < 25);
        w.state = w.__s, w.getChildContext != null && (D = E(E({}, D), w.getChildContext())), ye || w.getSnapshotBeforeUpdate == null || (P = w.getSnapshotBeforeUpdate(J, R)), H = ge != null && ge.type === T && ge.key == null ? ge.props.children : ge, M(m, Array.isArray(H) ? H : [H], g, b, D, N, j, W, X, G), w.base = g.__e, g.__h = null, w.__h.length && W.push(w), ke && (w.__E = w.__ = null), w.__e = !1;
      } else j == null && g.__v === b.__v ? (g.__k = b.__k, g.__e = b.__e) : g.__e = f(b.__e, g, b, D, N, j, W, G);
      (ge = i.diffed) && ge(g);
    } catch (Ve) {
      g.__v = null, (G || j != null) && (g.__e = X, g.__h = !!G, j[j.indexOf(X)] = null), i.__e(Ve, g, b);
    }
  }
  function k(m, g) {
    i.__c && i.__c(g, m), m.some(function(b) {
      try {
        m = b.__h, b.__h = [], m.some(function(D) {
          D.call(b);
        });
      } catch (D) {
        i.__e(D, b.__v);
      }
    });
  }
  function f(m, g, b, D, N, j, W, X) {
    var G, ge, w, ye = b.props, J = g.props, R = g.type, P = 0;
    if (R === "svg" && (N = !0), j != null) {
      for (; P < j.length; P++) if ((G = j[P]) && "setAttribute" in G == !!R && (R ? G.localName === R : G.nodeType === 3)) {
        m = G, j[P] = null;
        break;
      }
    }
    if (m == null) {
      if (R === null) return document.createTextNode(J);
      m = N ? document.createElementNS("http://www.w3.org/2000/svg", R) : document.createElement(R, J.is && J), j = null, X = !1;
    }
    if (R === null) ye === J || X && m.data === J || (m.data = J);
    else {
      if (j = j && n.call(m.childNodes), ge = (ye = b.props || v).dangerouslySetInnerHTML, w = J.dangerouslySetInnerHTML, !X) {
        if (j != null) for (ye = {}, P = 0; P < m.attributes.length; P++) ye[m.attributes[P].name] = m.attributes[P].value;
        (w || ge) && (w && (ge && w.__html == ge.__html || w.__html === m.innerHTML) || (m.innerHTML = w && w.__html || ""));
      }
      if (function(ke, B, F, Ne, et) {
        var fe;
        for (fe in F) fe === "children" || fe === "key" || fe in B || re(ke, fe, null, F[fe], Ne);
        for (fe in B) et && typeof B[fe] != "function" || fe === "children" || fe === "key" || fe === "value" || fe === "checked" || F[fe] === B[fe] || re(ke, fe, B[fe], F[fe], Ne);
      }(m, J, ye, N, X), w) g.__k = [];
      else if (P = g.props.children, M(m, Array.isArray(P) ? P : [P], g, b, D, N && R !== "foreignObject", j, W, j ? j[0] : b.__k && ie(b, 0), X), j != null) for (P = j.length; P--; ) j[P] != null && C(j[P]);
      X || ("value" in J && (P = J.value) !== void 0 && (P !== m.value || R === "progress" && !P || R === "option" && P !== ye.value) && re(m, "value", P, ye.value, !1), "checked" in J && (P = J.checked) !== void 0 && P !== m.checked && re(m, "checked", P, ye.checked, !1));
    }
    return m;
  }
  function y(m, g, b) {
    try {
      typeof m == "function" ? m(g) : m.current = g;
    } catch (D) {
      i.__e(D, b);
    }
  }
  function L(m, g, b) {
    var D, N;
    if (i.unmount && i.unmount(m), (D = m.ref) && (D.current && D.current !== m.__e || y(D, null, g)), (D = m.__c) != null) {
      if (D.componentWillUnmount) try {
        D.componentWillUnmount();
      } catch (j) {
        i.__e(j, g);
      }
      D.base = D.__P = null, m.__c = void 0;
    }
    if (D = m.__k) for (N = 0; N < D.length; N++) D[N] && L(D[N], g, b || typeof m.type != "function");
    b || m.__e == null || C(m.__e), m.__ = m.__e = m.__d = void 0;
  }
  function K(m, g, b) {
    return this.constructor(m, b);
  }
  function pe(m, g, b) {
    var D, N, j;
    i.__ && i.__(m, g), N = (D = typeof b == "function") ? null : b && b.__k || g.__k, j = [], Ee(g, m = (!D && b || g).__k = x(T, null, [m]), N || v, v, g.ownerSVGElement !== void 0, !D && b ? [b] : N ? null : g.firstChild ? n.call(g.childNodes) : null, j, !D && b ? b : N ? N.__e : g.firstChild, D), k(j, m);
  }
  function Re(m, g) {
    pe(m, g, Re);
  }
  function He(m, g, b) {
    var D, N, j, W = E({}, m.props);
    for (j in g) j == "key" ? D = g[j] : j == "ref" ? N = g[j] : W[j] = g[j];
    return arguments.length > 2 && (W.children = arguments.length > 3 ? n.call(arguments, 2) : b), A(m.type, W, D || m.key, N || m.ref, null);
  }
  function We(m, g) {
    var b = { __c: g = "__cC" + h++, __: m, Consumer: function(D, N) {
      return D.children(N);
    }, Provider: function(D) {
      var N, j;
      return this.getChildContext || (N = [], (j = {})[g] = this, this.getChildContext = function() {
        return j;
      }, this.shouldComponentUpdate = function(W) {
        this.props.value !== W.value && N.some(function(X) {
          X.__e = !0, se(X);
        });
      }, this.sub = function(W) {
        N.push(W);
        var X = W.componentWillUnmount;
        W.componentWillUnmount = function() {
          N.splice(N.indexOf(W), 1), X && X.call(W);
        };
      }), D.children;
    } };
    return b.Provider.__ = b.Consumer.contextType = b;
  }
  n = p.slice, i = { __e: function(m, g, b, D) {
    for (var N, j, W; g = g.__; ) if ((N = g.__c) && !N.__) try {
      if ((j = N.constructor) && j.getDerivedStateFromError != null && (N.setState(j.getDerivedStateFromError(m)), W = N.__d), N.componentDidCatch != null && (N.componentDidCatch(m, D || {}), W = N.__d), W) return N.__E = N;
    } catch (X) {
      m = X;
    }
    throw m;
  } }, s = 0, a = function(m) {
    return m != null && m.constructor === void 0;
  }, U.prototype.setState = function(m, g) {
    var b;
    b = this.__s != null && this.__s !== this.state ? this.__s : this.__s = E({}, this.state), typeof m == "function" && (m = m(E({}, b), this.props)), m && E(b, m), m != null && this.__v && (g && this._sb.push(g), se(this));
  }, U.prototype.forceUpdate = function(m) {
    this.__v && (this.__e = !0, m && this.__h.push(m), se(this));
  }, U.prototype.render = T, d = [], l = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, u = function(m, g) {
    return m.__v.__b - g.__v.__b;
  }, be.__r = 0, h = 0;
}, 78: (o, e, t) => {
  t.r(e), t.d(e, { useCallback: () => se, useContext: () => be, useDebugValue: () => M, useEffect: () => I, useErrorBoundary: () => z, useId: () => ve, useImperativeHandle: () => ie, useLayoutEffect: () => T, useMemo: () => _e, useReducer: () => A, useRef: () => U, useState: () => x });
  var n, i, s, a, d = t(616), c = 0, l = [], u = [], h = d.options.__b, v = d.options.__r, p = d.options.diffed, S = d.options.__c, E = d.options.unmount;
  function C(k, f) {
    d.options.__h && d.options.__h(i, k, c || f), c = 0;
    var y = i.__H || (i.__H = { __: [], __h: [] });
    return k >= y.__.length && y.__.push({ __V: u }), y.__[k];
  }
  function x(k) {
    return c = 1, A(Ee, k);
  }
  function A(k, f, y) {
    var L = C(n++, 2);
    if (L.t = k, !L.__c && (L.__ = [y ? y(f) : Ee(void 0, f), function(He) {
      var We = L.__N ? L.__N[0] : L.__[0], m = L.t(We, He);
      We !== m && (L.__N = [m, L.__[1]], L.__c.setState({}));
    }], L.__c = i, !i.u)) {
      var K = function(He, We, m) {
        if (!L.__c.__H) return !0;
        var g = L.__c.__H.__.filter(function(D) {
          return D.__c;
        });
        if (g.every(function(D) {
          return !D.__N;
        })) return !pe || pe.call(this, He, We, m);
        var b = !1;
        return g.forEach(function(D) {
          if (D.__N) {
            var N = D.__[0];
            D.__ = D.__N, D.__N = void 0, N !== D.__[0] && (b = !0);
          }
        }), !(!b && L.__c.props === He) && (!pe || pe.call(this, He, We, m));
      };
      i.u = !0;
      var pe = i.shouldComponentUpdate, Re = i.componentWillUpdate;
      i.componentWillUpdate = function(He, We, m) {
        if (this.__e) {
          var g = pe;
          pe = void 0, K(He, We, m), pe = g;
        }
        Re && Re.call(this, He, We, m);
      }, i.shouldComponentUpdate = K;
    }
    return L.__N || L.__;
  }
  function I(k, f) {
    var y = C(n++, 3);
    !d.options.__s && he(y.__H, f) && (y.__ = k, y.i = f, i.__H.__h.push(y));
  }
  function T(k, f) {
    var y = C(n++, 4);
    !d.options.__s && he(y.__H, f) && (y.__ = k, y.i = f, i.__h.push(y));
  }
  function U(k) {
    return c = 5, _e(function() {
      return { current: k };
    }, []);
  }
  function ie(k, f, y) {
    c = 6, T(function() {
      return typeof k == "function" ? (k(f()), function() {
        return k(null);
      }) : k ? (k.current = f(), function() {
        return k.current = null;
      }) : void 0;
    }, y == null ? y : y.concat(k));
  }
  function _e(k, f) {
    var y = C(n++, 7);
    return he(y.__H, f) ? (y.__V = k(), y.i = f, y.__h = k, y.__V) : y.__;
  }
  function se(k, f) {
    return c = 8, _e(function() {
      return k;
    }, f);
  }
  function be(k) {
    var f = i.context[k.__c], y = C(n++, 9);
    return y.c = k, f ? (y.__ == null && (y.__ = !0, f.sub(i)), f.props.value) : k.__;
  }
  function M(k, f) {
    d.options.useDebugValue && d.options.useDebugValue(f ? f(k) : k);
  }
  function z(k) {
    var f = C(n++, 10), y = x();
    return f.__ = k, i.componentDidCatch || (i.componentDidCatch = function(L, K) {
      f.__ && f.__(L, K), y[1](L);
    }), [y[0], function() {
      y[1](void 0);
    }];
  }
  function ve() {
    var k = C(n++, 11);
    if (!k.__) {
      for (var f = i.__v; f !== null && !f.__m && f.__ !== null; ) f = f.__;
      var y = f.__m || (f.__m = [0, 0]);
      k.__ = "P" + y[0] + "-" + y[1]++;
    }
    return k.__;
  }
  function je() {
    for (var k; k = l.shift(); ) if (k.__P && k.__H) try {
      k.__H.__h.forEach(re), k.__H.__h.forEach(ae), k.__H.__h = [];
    } catch (f) {
      k.__H.__h = [], d.options.__e(f, k.__v);
    }
  }
  d.options.__b = function(k) {
    i = null, h && h(k);
  }, d.options.__r = function(k) {
    v && v(k), n = 0;
    var f = (i = k.__c).__H;
    f && (s === i ? (f.__h = [], i.__h = [], f.__.forEach(function(y) {
      y.__N && (y.__ = y.__N), y.__V = u, y.__N = y.i = void 0;
    })) : (f.__h.forEach(re), f.__h.forEach(ae), f.__h = [])), s = i;
  }, d.options.diffed = function(k) {
    p && p(k);
    var f = k.__c;
    f && f.__H && (f.__H.__h.length && (l.push(f) !== 1 && a === d.options.requestAnimationFrame || ((a = d.options.requestAnimationFrame) || De)(je)), f.__H.__.forEach(function(y) {
      y.i && (y.__H = y.i), y.__V !== u && (y.__ = y.__V), y.i = void 0, y.__V = u;
    })), s = i = null;
  }, d.options.__c = function(k, f) {
    f.some(function(y) {
      try {
        y.__h.forEach(re), y.__h = y.__h.filter(function(L) {
          return !L.__ || ae(L);
        });
      } catch (L) {
        f.some(function(K) {
          K.__h && (K.__h = []);
        }), f = [], d.options.__e(L, y.__v);
      }
    }), S && S(k, f);
  }, d.options.unmount = function(k) {
    E && E(k);
    var f, y = k.__c;
    y && y.__H && (y.__H.__.forEach(function(L) {
      try {
        re(L);
      } catch (K) {
        f = K;
      }
    }), y.__H = void 0, f && d.options.__e(f, y.__v));
  };
  var Oe = typeof requestAnimationFrame == "function";
  function De(k) {
    var f, y = function() {
      clearTimeout(L), Oe && cancelAnimationFrame(f), setTimeout(k);
    }, L = setTimeout(y, 100);
    Oe && (f = requestAnimationFrame(y));
  }
  function re(k) {
    var f = i, y = k.__c;
    typeof y == "function" && (k.__c = void 0, y()), i = f;
  }
  function ae(k) {
    var f = i;
    k.__c = k.__(), i = f;
  }
  function he(k, f) {
    return !k || k.length !== f.length || f.some(function(y, L) {
      return y !== k[L];
    });
  }
  function Ee(k, f) {
    return typeof f == "function" ? f(k) : f;
  }
}, 292: (o) => {
  var e = [];
  function t(s) {
    for (var a = -1, d = 0; d < e.length; d++) if (e[d].identifier === s) {
      a = d;
      break;
    }
    return a;
  }
  function n(s, a) {
    for (var d = {}, c = [], l = 0; l < s.length; l++) {
      var u = s[l], h = a.base ? u[0] + a.base : u[0], v = d[h] || 0, p = "".concat(h, " ").concat(v);
      d[h] = v + 1;
      var S = t(p), E = { css: u[1], media: u[2], sourceMap: u[3], supports: u[4], layer: u[5] };
      if (S !== -1) e[S].references++, e[S].updater(E);
      else {
        var C = i(E, a);
        a.byIndex = l, e.splice(l, 0, { identifier: p, updater: C, references: 1 });
      }
      c.push(p);
    }
    return c;
  }
  function i(s, a) {
    var d = a.domAPI(a);
    return d.update(s), function(c) {
      if (c) {
        if (c.css === s.css && c.media === s.media && c.sourceMap === s.sourceMap && c.supports === s.supports && c.layer === s.layer) return;
        d.update(s = c);
      } else d.remove();
    };
  }
  o.exports = function(s, a) {
    var d = n(s = s || [], a = a || {});
    return function(c) {
      c = c || [];
      for (var l = 0; l < d.length; l++) {
        var u = t(d[l]);
        e[u].references--;
      }
      for (var h = n(c, a), v = 0; v < d.length; v++) {
        var p = t(d[v]);
        e[p].references === 0 && (e[p].updater(), e.splice(p, 1));
      }
      d = h;
    };
  };
}, 88: (o) => {
  o.exports = function(e) {
    var t = document.createElement("style");
    return e.setAttributes(t, e.attributes), e.insert(t, e.options), t;
  };
}, 884: (o, e, t) => {
  o.exports = function(n) {
    var i = t.nc;
    i && n.setAttribute("nonce", i);
  };
}, 360: (o) => {
  var e, t = (e = [], function(s, a) {
    return e[s] = a, e.filter(Boolean).join(`
`);
  });
  function n(s, a, d, c) {
    var l;
    if (d) l = "";
    else {
      l = "", c.supports && (l += "@supports (".concat(c.supports, ") {")), c.media && (l += "@media ".concat(c.media, " {"));
      var u = c.layer !== void 0;
      u && (l += "@layer".concat(c.layer.length > 0 ? " ".concat(c.layer) : "", " {")), l += c.css, u && (l += "}"), c.media && (l += "}"), c.supports && (l += "}");
    }
    if (s.styleSheet) s.styleSheet.cssText = t(a, l);
    else {
      var h = document.createTextNode(l), v = s.childNodes;
      v[a] && s.removeChild(v[a]), v.length ? s.insertBefore(h, v[a]) : s.appendChild(h);
    }
  }
  var i = { singleton: null, singletonCounter: 0 };
  o.exports = function(s) {
    if (typeof document > "u") return { update: function() {
    }, remove: function() {
    } };
    var a = i.singletonCounter++, d = i.singleton || (i.singleton = s.insertStyleElement(s));
    return { update: function(c) {
      n(d, a, !1, c);
    }, remove: function(c) {
      n(d, a, !0, c);
    } };
  };
}, 6: (o, e, t) => {
  t.d(e, { en: () => n });
  const n = { headlines: { error: "An error has occurred", loginEmail: "Sign in or create account", loginEmailNoSignup: "Sign in", loginFinished: "Login successful", loginPasscode: "Enter passcode", loginPassword: "Enter password", registerAuthenticator: "Create a passkey", registerConfirm: "Create account?", registerPassword: "Set new password", otpSetUp: "Set up authenticator app", profileEmails: "Emails", profilePassword: "Password", profilePasskeys: "Passkeys", isPrimaryEmail: "Primary email address", setPrimaryEmail: "Set primary email address", createEmail: "Enter a new email", createUsername: "Enter a new username", emailVerified: "Verified", emailUnverified: "Unverified", emailDelete: "Delete", renamePasskey: "Rename passkey", deletePasskey: "Delete passkey", lastUsedAt: "Last used at", createdAt: "Created at", connectedAccounts: "Connected accounts", deleteAccount: "Delete account", accountNotFound: "Account not found", signIn: "Sign in", signUp: "Create account", selectLoginMethod: "Select login method", setupLoginMethod: "Set up login method", lastUsed: "Last seen", ipAddress: "IP address", revokeSession: "Revoke session", profileSessions: "Sessions", mfaSetUp: "Set up MFA", securityKeySetUp: "Add security key", securityKeyLogin: "Security key", otpLogin: "Authentication code", renameSecurityKey: "Rename security key", deleteSecurityKey: "Delete security key", securityKeys: "Security keys", authenticatorApp: "Authenticator app", authenticatorAppAlreadySetUp: "Authenticator app is set up", authenticatorAppNotSetUp: "Set up authenticator app", trustDevice: "Trust this browser?" }, texts: { enterPasscode: 'Enter the passcode that was sent to "{emailAddress}".', enterPasscodeNoEmail: "Enter the passcode that was sent to your primary email address.", setupPasskey: "Sign in to your account easily and securely with a passkey. Note: Your biometric data is only stored on your devices and will never be shared with anyone.", createAccount: 'No account exists for "{emailAddress}". Do you want to create a new account?', otpEnterVerificationCode: "Enter the one-time password (OTP) obtained from your authenticator app below:", otpScanQRCode: "Scan the QR code using your authenticator app (such as Google Authenticator or any other TOTP app). Alternatively, you can manually enter the OTP secret key into the app.", otpSecretKey: "OTP secret key", passwordFormatHint: "Must be between {minLength} and {maxLength} characters long.", securityKeySetUp: "Use a dedicated security key via USB, Bluetooth, or NFC, or your mobile phone. Connect or activate your security key, then click the button below and follow the prompts to complete the registration.", setPrimaryEmail: "Set this email address to be used for contacting you.", isPrimaryEmail: "This email address will be used to contact you if necessary.", emailVerified: "This email address has been verified.", emailUnverified: "This email address has not been verified.", emailDelete: "If you delete this email address, it can no longer be used to sign in.", renamePasskey: "Set a name for the passkey.", deletePasskey: "Delete this passkey from your account.", deleteAccount: "Are you sure you want to delete this account? All data will be deleted immediately and cannot be recovered.", noAccountExists: 'No account exists for "{emailAddress}".', selectLoginMethodForFutureLogins: "Select one of the following login methods to use for future logins.", howDoYouWantToLogin: "How do you want to login?", mfaSetUp: "Protect your account with Multi-Factor Authentication (MFA). MFA adds an additional step to your login process, ensuring that even if your password or email account is compromised, your account stays secure.", securityKeyLogin: "Connect or activate your security key, then click the button below. Once ready, use it via USB, NFC, your mobile phone. Follow the prompts to complete the login process.", otpLogin: "Open your authenticator app to obtain the one-time password (OTP). Enter the code in the field below to complete your login.", renameSecurityKey: "Set a name for the security key.", deleteSecurityKey: "Delete this security key from your account.", authenticatorAppAlreadySetUp: "Your account is secured with an authenticator app that generates time-based one-time passwords (TOTP) for multi-factor authentication.", authenticatorAppNotSetUp: "Secure your account with an authenticator app that generates time-based one-time passwords (TOTP) for multi-factor authentication.", trustDevice: "If you trust this browser, you won’t need to enter your OTP (One-Time-Password) or use your security key for multi-factor authentication (MFA) the next time you log in." }, labels: { or: "or", no: "no", yes: "yes", email: "Email", continue: "Continue", copied: "copied", skip: "Skip", save: "Save", password: "Password", passkey: "Passkey", passcode: "Passcode", signInPassword: "Sign in with a password", signInPasscode: "Sign in with a passcode", forgotYourPassword: "Forgot your password?", back: "Back", signInPasskey: "Sign in with a passkey", registerAuthenticator: "Create a passkey", signIn: "Sign in", signUp: "Create account", sendNewPasscode: "Send new code", passwordRetryAfter: "Retry in {passwordRetryAfter}", passcodeResendAfter: "Request a new code in {passcodeResendAfter}", unverifiedEmail: "unverified", primaryEmail: "primary", setAsPrimaryEmail: "Set as primary", verify: "Verify", delete: "Delete", newEmailAddress: "New email address", newPassword: "New password", rename: "Rename", newPasskeyName: "New passkey name", addEmail: "Add email", createPasskey: "Create a passkey", webauthnUnsupported: "Passkeys are not supported by your browser", signInWith: "Sign in with {provider}", deleteAccount: "Yes, delete this account.", emailOrUsername: "Email or username", username: "Username", optional: "optional", dontHaveAnAccount: "Don't have an account?", alreadyHaveAnAccount: "Already have an account?", changeUsername: "Change username", setUsername: "Set username", changePassword: "Change password", setPassword: "Set password", revoke: "Revoke", currentSession: "Current session", authenticatorApp: "Authenticator app", securityKey: "Security key", securityKeyUse: "Use security key", newSecurityKeyName: "New security key name", createSecurityKey: "Add a security key", authenticatorAppManage: "Manage authenticator app", authenticatorAppAdd: "Set up", configured: "configured", useAnotherMethod: "Use another method", lastUsed: "Last used", trustDevice: "Trust this browser", staySignedIn: "Stay signed in" }, errors: { somethingWentWrong: "A technical error has occurred. Please try again later.", requestTimeout: "The request timed out.", invalidPassword: "Wrong email or password.", invalidPasscode: "The passcode provided was not correct.", passcodeAttemptsReached: "The passcode was entered incorrectly too many times. Please request a new code.", tooManyRequests: "Too many requests have been made. Please wait to repeat the requested operation.", unauthorized: "Your session has expired. Please log in again.", invalidWebauthnCredential: "This passkey cannot be used anymore.", passcodeExpired: "The passcode has expired. Please request a new one.", userVerification: "User verification required. Please ensure your authenticator device is protected with a PIN or biometric.", emailAddressAlreadyExistsError: "The email address already exists.", maxNumOfEmailAddressesReached: "No further email addresses can be added.", thirdPartyAccessDenied: "Access denied. The request was cancelled by the user or the provider has denied access for other reasons.", thirdPartyMultipleAccounts: "Cannot identify account. The email address is used by multiple accounts.", thirdPartyUnverifiedEmail: "Email verification required. Please verify the used email address with your provider.", signupDisabled: "Account registration is disabled.", handlerNotFoundError: "The current step in your process is not supported by this application version. Please try again later or contact support if the issue persists." }, flowErrors: { technical_error: "A technical error has occurred. Please try again later.", flow_expired_error: "The session has expired, please click the button to restart.", value_invalid_error: "The entered value is invalid.", passcode_invalid: "The passcode provided was not correct.", passkey_invalid: "This passkey cannot be used anymore", passcode_max_attempts_reached: "The passcode was entered incorrectly too many times. Please request a new code.", rate_limit_exceeded: "Too many requests have been made. Please wait to repeat the requested operation.", unknown_username_error: "The username is unknown.", unknown_email_error: "The email address is unknown.", username_already_exists: "The username is already taken.", invalid_username_error: "The username must contain only letters, numbers, and underscores.", email_already_exists: "The email is already taken.", not_found: "The requested resource was not found.", operation_not_permitted_error: "The operation is not permitted.", flow_discontinuity_error: "The process cannot be continued due to user settings or the provider's configuration.", form_data_invalid_error: "The submitted form data contains errors.", unauthorized: "Your session has expired. Please log in again.", value_missing_error: "The value is missing.", value_too_long_error: "Value is too long.", value_too_short_error: "The value is too short.", webauthn_credential_invalid_mfa_only: "This credential can be used as a second factor security key only.", webauthn_credential_already_exists: "The request either timed out, was canceled or the device is already registered. Please try again or try using another device.", platform_authenticator_required: "Your account is configured to use platform authenticators, but your current device or browser does not support this feature. Please try again with a compatible device or browser." } };
} }, zo = {};
function Y(o) {
  var e = zo[o];
  if (e !== void 0) return e.exports;
  var t = zo[o] = { id: o, exports: {} };
  return Ps[o].call(t.exports, t, t.exports, Y), t.exports;
}
Y.n = (o) => {
  var e = o && o.__esModule ? () => o.default : () => o;
  return Y.d(e, { a: e }), e;
}, Y.d = (o, e) => {
  for (var t in e) Y.o(e, t) && !Y.o(o, t) && Object.defineProperty(o, t, { enumerable: !0, get: e[t] });
}, Y.o = (o, e) => Object.prototype.hasOwnProperty.call(o, e), Y.r = (o) => {
  typeof Symbol < "u" && Symbol.toStringTag && Object.defineProperty(o, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(o, "__esModule", { value: !0 });
}, Y.nc = void 0;
var oe = {};
Y.d(oe, { fK: () => bn, tJ: () => Ui, Z7: () => xn, Q9: () => Wi, Lv: () => Ri, qQ: () => wn, I4: () => Ki, O8: () => Se, ku: () => so, ls: () => io, bO: () => ro, yv: () => Sn, AT: () => lo, m_: () => Wt, KG: () => ao, DH: () => kn, kf: () => vo, oY: () => Ie, xg: () => zi, Wg: () => Be, J: () => qi, AC: () => co, D_: () => Je, jx: () => Hi, nX: () => uo, Nx: () => oo, Sd: () => ht, kz: () => ka, fX: () => ho, qA: () => po, tz: () => mo, gN: () => fo });
var Jn = {};
Y.r(Jn), Y.d(Jn, { apple: () => yr, checkmark: () => br, copy: () => kr, customProvider: () => wr, discord: () => Sr, exclamation: () => xr, facebook: () => Cr, github: () => Ar, google: () => Or, linkedin: () => Er, mail: () => Pr, microsoft: () => Ir, passkey: () => jr, password: () => Dr, qrCodeScanner: () => $r, securityKey: () => Lr, spinner: () => Tr });
var O = Y(616), Is = 0;
function r(o, e, t, n, i, s) {
  var a, d, c = {};
  for (d in e) d == "ref" ? a = e[d] : c[d] = e[d];
  var l = { type: o, props: c, key: t, ref: a, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, __h: null, constructor: void 0, __v: --Is, __source: i, __self: s };
  if (typeof o == "function" && (a = o.defaultProps)) for (d in a) c[d] === void 0 && (c[d] = a[d]);
  return O.options.vnode && O.options.vnode(l), l;
}
function vn() {
  return vn = Object.assign ? Object.assign.bind() : function(o) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var n in t) Object.prototype.hasOwnProperty.call(t, n) && (o[n] = t[n]);
    }
    return o;
  }, vn.apply(this, arguments);
}
var js = ["context", "children"];
function Ds(o) {
  this.getChildContext = function() {
    return o.context;
  };
  var e = o.children, t = function(n, i) {
    if (n == null) return {};
    var s, a, d = {}, c = Object.keys(n);
    for (a = 0; a < c.length; a++) i.indexOf(s = c[a]) >= 0 || (d[s] = n[s]);
    return d;
  }(o, js);
  return (0, O.cloneElement)(e, t);
}
function $s() {
  var o = new CustomEvent("_preact", { detail: {}, bubbles: !0, cancelable: !0 });
  this.dispatchEvent(o), this._vdom = (0, O.h)(Ds, vn({}, this._props, { context: o.detail.context }), Ai(this, this._vdomComponent)), (this.hasAttribute("hydrate") ? O.hydrate : O.render)(this._vdom, this._root);
}
function Ci(o) {
  return o.replace(/-(\w)/g, function(e, t) {
    return t ? t.toUpperCase() : "";
  });
}
function Ls(o, e, t) {
  if (this._vdom) {
    var n = {};
    n[o] = t = t ?? void 0, n[Ci(o)] = t, this._vdom = (0, O.cloneElement)(this._vdom, n), (0, O.render)(this._vdom, this._root);
  }
}
function Ts() {
  (0, O.render)(this._vdom = null, this._root);
}
function qo(o, e) {
  var t = this;
  return (0, O.h)("slot", vn({}, o, { ref: function(n) {
    n ? (t.ref = n, t._listener || (t._listener = function(i) {
      i.stopPropagation(), i.detail.context = e;
    }, n.addEventListener("_preact", t._listener))) : t.ref.removeEventListener("_preact", t._listener);
  } }));
}
function Ai(o, e) {
  if (o.nodeType === 3) return o.data;
  if (o.nodeType !== 1) return null;
  var t = [], n = {}, i = 0, s = o.attributes, a = o.childNodes;
  for (i = s.length; i--; ) s[i].name !== "slot" && (n[s[i].name] = s[i].value, n[Ci(s[i].name)] = s[i].value);
  for (i = a.length; i--; ) {
    var d = Ai(a[i], null), c = a[i].slot;
    c ? n[c] = (0, O.h)(qo, { name: c }, d) : t[i] = d;
  }
  var l = e ? (0, O.h)(qo, null, t) : t;
  return (0, O.h)(e || o.nodeName.toLowerCase(), n, l);
}
var Z = Y(7), _ = Y(78);
function Oi(o, e) {
  for (var t in e) o[t] = e[t];
  return o;
}
function Fo(o, e) {
  for (var t in o) if (t !== "__source" && !(t in e)) return !0;
  for (var n in e) if (n !== "__source" && o[n] !== e[n]) return !0;
  return !1;
}
function Ko(o) {
  this.props = o;
}
(Ko.prototype = new O.Component()).isPureReactComponent = !0, Ko.prototype.shouldComponentUpdate = function(o, e) {
  return Fo(this.props, o) || Fo(this.state, e);
};
var Bo = O.options.__b;
O.options.__b = function(o) {
  o.type && o.type.__f && o.ref && (o.props.ref = o.ref, o.ref = null), Bo && Bo(o);
};
var Ns = typeof Symbol < "u" && Symbol.for && Symbol.for("react.forward_ref") || 3911, Us = (O.toChildArray, O.options.__e);
O.options.__e = function(o, e, t, n) {
  if (o.then) {
    for (var i, s = e; s = s.__; ) if ((i = s.__c) && i.__c) return e.__e == null && (e.__e = t.__e, e.__k = t.__k), i.__c(o, e);
  }
  Us(o, e, t, n);
};
var Vo = O.options.unmount;
function Ei(o, e, t) {
  return o && (o.__c && o.__c.__H && (o.__c.__H.__.forEach(function(n) {
    typeof n.__c == "function" && n.__c();
  }), o.__c.__H = null), (o = Oi({}, o)).__c != null && (o.__c.__P === t && (o.__c.__P = e), o.__c = null), o.__k = o.__k && o.__k.map(function(n) {
    return Ei(n, e, t);
  })), o;
}
function Pi(o, e, t) {
  return o && (o.__v = null, o.__k = o.__k && o.__k.map(function(n) {
    return Pi(n, e, t);
  }), o.__c && o.__c.__P === e && (o.__e && t.insertBefore(o.__e, o.__d), o.__c.__e = !0, o.__c.__P = t)), o;
}
function Tn() {
  this.__u = 0, this.t = null, this.__b = null;
}
function Ii(o) {
  var e = o.__.__c;
  return e && e.__a && e.__a(o);
}
function Kt() {
  this.u = null, this.o = null;
}
O.options.unmount = function(o) {
  var e = o.__c;
  e && e.__R && e.__R(), e && o.__h === !0 && (o.type = null), Vo && Vo(o);
}, (Tn.prototype = new O.Component()).__c = function(o, e) {
  var t = e.__c, n = this;
  n.t == null && (n.t = []), n.t.push(t);
  var i = Ii(n.__v), s = !1, a = function() {
    s || (s = !0, t.__R = null, i ? i(d) : d());
  };
  t.__R = a;
  var d = function() {
    if (!--n.__u) {
      if (n.state.__a) {
        var l = n.state.__a;
        n.__v.__k[0] = Pi(l, l.__c.__P, l.__c.__O);
      }
      var u;
      for (n.setState({ __a: n.__b = null }); u = n.t.pop(); ) u.forceUpdate();
    }
  }, c = e.__h === !0;
  n.__u++ || c || n.setState({ __a: n.__b = n.__v.__k[0] }), o.then(a, a);
}, Tn.prototype.componentWillUnmount = function() {
  this.t = [];
}, Tn.prototype.render = function(o, e) {
  if (this.__b) {
    if (this.__v.__k) {
      var t = document.createElement("div"), n = this.__v.__k[0].__c;
      this.__v.__k[0] = Ei(this.__b, t, n.__O = n.__P);
    }
    this.__b = null;
  }
  var i = e.__a && (0, O.createElement)(O.Fragment, null, o.fallback);
  return i && (i.__h = null), [(0, O.createElement)(O.Fragment, null, e.__a ? null : o.children), i];
};
var Zo = function(o, e, t) {
  if (++t[1] === t[0] && o.o.delete(e), o.props.revealOrder && (o.props.revealOrder[0] !== "t" || !o.o.size)) for (t = o.u; t; ) {
    for (; t.length > 3; ) t.pop()();
    if (t[1] < t[0]) break;
    o.u = t = t[2];
  }
};
(Kt.prototype = new O.Component()).__a = function(o) {
  var e = this, t = Ii(e.__v), n = e.o.get(o);
  return n[0]++, function(i) {
    var s = function() {
      e.props.revealOrder ? (n.push(i), Zo(e, o, n)) : i();
    };
    t ? t(s) : s();
  };
}, Kt.prototype.render = function(o) {
  this.u = null, this.o = /* @__PURE__ */ new Map();
  var e = (0, O.toChildArray)(o.children);
  o.revealOrder && o.revealOrder[0] === "b" && e.reverse();
  for (var t = e.length; t--; ) this.o.set(e[t], this.u = [1, 0, this.u]);
  return o.children;
}, Kt.prototype.componentDidUpdate = Kt.prototype.componentDidMount = function() {
  var o = this;
  this.o.forEach(function(e, t) {
    Zo(o, t, e);
  });
};
var Ms = typeof Symbol < "u" && Symbol.for && Symbol.for("react.element") || 60103, Rs = /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/, Hs = /^on(Ani|Tra|Tou|BeforeInp|Compo)/, Ws = /[A-Z0-9]/g, zs = typeof document < "u", qs = function(o) {
  return (typeof Symbol < "u" && typeof Symbol() == "symbol" ? /fil|che|rad/ : /fil|che|ra/).test(o);
};
O.Component.prototype.isReactComponent = {}, ["componentWillMount", "componentWillReceiveProps", "componentWillUpdate"].forEach(function(o) {
  Object.defineProperty(O.Component.prototype, o, { configurable: !0, get: function() {
    return this["UNSAFE_" + o];
  }, set: function(e) {
    Object.defineProperty(this, o, { configurable: !0, writable: !0, value: e });
  } });
});
var Jo = O.options.event;
function Fs() {
}
function Ks() {
  return this.cancelBubble;
}
function Bs() {
  return this.defaultPrevented;
}
O.options.event = function(o) {
  return Jo && (o = Jo(o)), o.persist = Fs, o.isPropagationStopped = Ks, o.isDefaultPrevented = Bs, o.nativeEvent = o;
};
var Qo = { configurable: !0, get: function() {
  return this.class;
} }, Go = O.options.vnode;
O.options.vnode = function(o) {
  var e = o.type, t = o.props, n = t;
  if (typeof e == "string") {
    for (var i in n = {}, t) {
      var s = t[i];
      if (!(i === "value" && "defaultValue" in t && s == null || zs && i === "children" && e === "noscript")) {
        var a = i.toLowerCase();
        i === "defaultValue" && "value" in t && t.value == null ? i = "value" : i === "download" && s === !0 ? s = "" : a === "ondoubleclick" ? i = "ondblclick" : a !== "onchange" || e !== "input" && e !== "textarea" || qs(t.type) ? a === "onfocus" ? i = "onfocusin" : a === "onblur" ? i = "onfocusout" : Hs.test(i) ? i = a : e.indexOf("-") === -1 && Rs.test(i) ? i = i.replace(Ws, "-$&").toLowerCase() : s === null && (s = void 0) : a = i = "oninput", a === "oninput" && n[i = a] && (i = "oninputCapture"), n[i] = s;
      }
    }
    e == "select" && n.multiple && Array.isArray(n.value) && (n.value = (0, O.toChildArray)(t.children).forEach(function(d) {
      d.props.selected = n.value.indexOf(d.props.value) != -1;
    })), e == "select" && n.defaultValue != null && (n.value = (0, O.toChildArray)(t.children).forEach(function(d) {
      d.props.selected = n.multiple ? n.defaultValue.indexOf(d.props.value) != -1 : n.defaultValue == d.props.value;
    })), o.props = n, t.class != t.className && (Qo.enumerable = "className" in t, t.className != null && (n.class = t.className), Object.defineProperty(n, "className", Qo));
  }
  o.$$typeof = Ms, Go && Go(o);
};
var Yo = O.options.__r;
O.options.__r = function(o) {
  Yo && Yo(o), o.__c;
};
var Xo = O.options.diffed;
function ji(o) {
  const e = "==".slice(0, (4 - o.length % 4) % 4), t = o.replace(/-/g, "+").replace(/_/g, "/") + e, n = atob(t), i = new ArrayBuffer(n.length), s = new Uint8Array(i);
  for (let a = 0; a < n.length; a++) s[a] = n.charCodeAt(a);
  return i;
}
function Di(o) {
  const e = new Uint8Array(o);
  let t = "";
  for (const n of e) t += String.fromCharCode(n);
  return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
O.options.diffed = function(o) {
  Xo && Xo(o);
  var e = o.props, t = o.__e;
  t != null && o.type === "textarea" && "value" in e && e.value !== t.value && (t.value = e.value == null ? "" : e.value);
}, O.Fragment, _.useLayoutEffect, _.useState, _.useId, _.useReducer, _.useEffect, _.useLayoutEffect, _.useRef, _.useImperativeHandle, _.useMemo, _.useCallback, _.useContext, _.useDebugValue, O.createElement, O.createContext, O.createRef, O.Fragment, O.Component;
var ce = "copy", Fe = "convert";
function mt(o, e, t) {
  if (e === ce) return t;
  if (e === Fe) return o(t);
  if (e instanceof Array) return t.map((n) => mt(o, e[0], n));
  if (e instanceof Object) {
    const n = {};
    for (const [i, s] of Object.entries(e)) {
      if (s.derive) {
        const a = s.derive(t);
        a !== void 0 && (t[i] = a);
      }
      if (i in t) t[i] != null ? n[i] = mt(o, s.schema, t[i]) : n[i] = null;
      else if (s.required) throw new Error(`Missing key: ${i}`);
    }
    return n;
  }
}
function Qn(o, e) {
  return { required: !0, schema: o, derive: e };
}
function me(o) {
  return { required: !0, schema: o };
}
function we(o) {
  return { required: !1, schema: o };
}
var $i = { type: me(ce), id: me(Fe), transports: we(ce) }, Li = { appid: we(ce), appidExclude: we(ce), credProps: we(ce) }, Ti = { appid: we(ce), appidExclude: we(ce), credProps: we(ce) }, Vs = { publicKey: me({ rp: me(ce), user: me({ id: me(Fe), name: me(ce), displayName: me(ce) }), challenge: me(Fe), pubKeyCredParams: me(ce), timeout: we(ce), excludeCredentials: we([$i]), authenticatorSelection: we(ce), attestation: we(ce), extensions: we(Li) }), signal: we(ce) }, Zs = { type: me(ce), id: me(ce), rawId: me(Fe), authenticatorAttachment: we(ce), response: me({ clientDataJSON: me(Fe), attestationObject: me(Fe), transports: Qn(ce, (o) => {
  var e;
  return ((e = o.getTransports) == null ? void 0 : e.call(o)) || [];
}) }), clientExtensionResults: Qn(Ti, (o) => o.getClientExtensionResults()) }, Js = { mediation: we(ce), publicKey: me({ challenge: me(Fe), timeout: we(ce), rpId: we(ce), allowCredentials: we([$i]), userVerification: we(ce), extensions: we(Li) }), signal: we(ce) }, Qs = { type: me(ce), id: me(ce), rawId: me(Fe), authenticatorAttachment: we(ce), response: me({ clientDataJSON: me(Fe), authenticatorData: me(Fe), signature: me(Fe), userHandle: me(Fe) }), clientExtensionResults: Qn(Ti, (o) => o.getClientExtensionResults()) };
async function ei(o) {
  const e = await navigator.credentials.create(function(t) {
    return mt(ji, Vs, t);
  }(o));
  return function(t) {
    return mt(Di, Zs, t);
  }(e);
}
async function ti(o) {
  const e = await navigator.credentials.get(function(t) {
    return mt(ji, Js, t);
  }(o));
  return function(t) {
    return mt(Di, Qs, t);
  }(e);
}
function gn() {
  return gn = Object.assign ? Object.assign.bind() : function(o) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var n in t) Object.prototype.hasOwnProperty.call(t, n) && (o[n] = t[n]);
    }
    return o;
  }, gn.apply(this, arguments);
}
var Gs = 0;
function Ni(o) {
  return "__private_" + Gs++ + "_" + o;
}
function Nn(o, e) {
  if (!Object.prototype.hasOwnProperty.call(o, e)) throw new TypeError("attempted to use private field on non-instance");
  return o;
}
class Se extends Error {
  constructor(e, t, n) {
    super(e), this.code = void 0, this.cause = void 0, this.code = t, this.cause = n, Object.setPrototypeOf(this, Se.prototype);
  }
}
class Ie extends Se {
  constructor(e) {
    super("Technical error", "somethingWentWrong", e), Object.setPrototypeOf(this, Ie.prototype);
  }
}
class bn extends Se {
  constructor(e, t) {
    super("Conflict error", "conflict", t), Object.setPrototypeOf(this, bn.prototype);
  }
}
class kn extends Se {
  constructor(e) {
    super("Request timed out error", "requestTimeout", e), Object.setPrototypeOf(this, kn.prototype);
  }
}
class oo extends Se {
  constructor(e) {
    super("Request cancelled error", "requestCancelled", e), Object.setPrototypeOf(this, oo.prototype);
  }
}
class io extends Se {
  constructor(e) {
    super("Invalid password error", "invalidPassword", e), Object.setPrototypeOf(this, io.prototype);
  }
}
class so extends Se {
  constructor(e) {
    super("Invalid Passcode error", "invalidPasscode", e), Object.setPrototypeOf(this, so.prototype);
  }
}
class ro extends Se {
  constructor(e) {
    super("Invalid WebAuthn credential error", "invalidWebauthnCredential", e), Object.setPrototypeOf(this, ro.prototype);
  }
}
class ao extends Se {
  constructor(e) {
    super("Passcode expired error", "passcodeExpired", e), Object.setPrototypeOf(this, ao.prototype);
  }
}
class lo extends Se {
  constructor(e) {
    super("Maximum number of Passcode attempts reached error", "passcodeAttemptsReached", e), Object.setPrototypeOf(this, lo.prototype);
  }
}
class Wt extends Se {
  constructor(e) {
    super("Not found error", "notFound", e), Object.setPrototypeOf(this, Wt.prototype);
  }
}
class co extends Se {
  constructor(e, t) {
    super("Too many requests error", "tooManyRequests", t), this.retryAfter = void 0, this.retryAfter = e, Object.setPrototypeOf(this, co.prototype);
  }
}
class Je extends Se {
  constructor(e) {
    super("Unauthorized error", "unauthorized", e), Object.setPrototypeOf(this, Je.prototype);
  }
}
class wn extends Se {
  constructor(e) {
    super("Forbidden error", "forbidden", e), Object.setPrototypeOf(this, wn.prototype);
  }
}
class uo extends Se {
  constructor(e) {
    super("User verification error", "userVerification", e), Object.setPrototypeOf(this, uo.prototype);
  }
}
class Sn extends Se {
  constructor(e) {
    super("Maximum number of email addresses reached error", "maxNumOfEmailAddressesReached", e), Object.setPrototypeOf(this, Sn.prototype);
  }
}
class xn extends Se {
  constructor(e) {
    super("The email address already exists", "emailAddressAlreadyExistsError", e), Object.setPrototypeOf(this, xn.prototype);
  }
}
class Be extends Se {
  constructor(e, t) {
    super("An error occurred during third party sign up/sign in", e, t), Object.setPrototypeOf(this, Be.prototype);
  }
}
const ho = "hanko-session-created", po = "hanko-session-expired", fo = "hanko-user-logged-out", mo = "hanko-user-deleted";
class Ui extends CustomEvent {
  constructor(e, t) {
    super(e, { detail: t });
  }
}
class Mi {
  constructor() {
    this._dispatchEvent = document.dispatchEvent.bind(document);
  }
  dispatch(e, t) {
    this._dispatchEvent(new Ui(e, t));
  }
  dispatchSessionCreatedEvent(e) {
    this.dispatch(ho, e);
  }
  dispatchSessionExpiredEvent() {
    this.dispatch(po, null);
  }
  dispatchUserLoggedOutEvent() {
    this.dispatch(fo, null);
  }
  dispatchUserDeletedEvent() {
    this.dispatch(mo, null);
  }
}
function Bt(o) {
  for (var e = 1; e < arguments.length; e++) {
    var t = arguments[e];
    for (var n in t) o[n] = t[n];
  }
  return o;
}
var Un = function o(e, t) {
  function n(i, s, a) {
    if (typeof document < "u") {
      typeof (a = Bt({}, t, a)).expires == "number" && (a.expires = new Date(Date.now() + 864e5 * a.expires)), a.expires && (a.expires = a.expires.toUTCString()), i = encodeURIComponent(i).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
      var d = "";
      for (var c in a) a[c] && (d += "; " + c, a[c] !== !0 && (d += "=" + a[c].split(";")[0]));
      return document.cookie = i + "=" + e.write(s, i) + d;
    }
  }
  return Object.create({ set: n, get: function(i) {
    if (typeof document < "u" && (!arguments.length || i)) {
      for (var s = document.cookie ? document.cookie.split("; ") : [], a = {}, d = 0; d < s.length; d++) {
        var c = s[d].split("="), l = c.slice(1).join("=");
        try {
          var u = decodeURIComponent(c[0]);
          if (a[u] = e.read(l, u), i === u) break;
        } catch {
        }
      }
      return i ? a[i] : a;
    }
  }, remove: function(i, s) {
    n(i, "", Bt({}, s, { expires: -1 }));
  }, withAttributes: function(i) {
    return o(this.converter, Bt({}, this.attributes, i));
  }, withConverter: function(i) {
    return o(Bt({}, this.converter, i), this.attributes);
  } }, { attributes: { value: Object.freeze(t) }, converter: { value: Object.freeze(e) } });
}({ read: function(o) {
  return o[0] === '"' && (o = o.slice(1, -1)), o.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
}, write: function(o) {
  return encodeURIComponent(o).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent);
} }, { path: "/" });
class Ys {
  constructor(e) {
    var t;
    this.authCookieName = void 0, this.authCookieDomain = void 0, this.authCookieSameSite = void 0, this.authCookieName = e.cookieName, this.authCookieDomain = e.cookieDomain, this.authCookieSameSite = (t = e.cookieSameSite) != null ? t : "lax";
  }
  getAuthCookie() {
    return Un.get(this.authCookieName);
  }
  setAuthCookie(e, t) {
    const n = { secure: !0, sameSite: this.authCookieSameSite };
    this.authCookieDomain !== void 0 && (n.domain = this.authCookieDomain);
    const i = gn({}, n, t);
    if ((i.sameSite === "none" || i.sameSite === "None") && i.secure === !1) throw new Ie(new Error("Secure attribute must be set when SameSite=None"));
    Un.set(this.authCookieName, e, i);
  }
  removeAuthCookie() {
    Un.remove(this.authCookieName);
  }
}
class Xs {
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
class er {
  constructor(e) {
    this._xhr = void 0, this._xhr = e;
  }
  getResponseHeader(e) {
    return this._xhr.getResponseHeader(e);
  }
}
class tr {
  constructor(e) {
    this.headers = void 0, this.ok = void 0, this.status = void 0, this.statusText = void 0, this.url = void 0, this._decodedJSON = void 0, this.xhr = void 0, this.headers = new er(e), this.ok = e.status >= 200 && e.status <= 299, this.status = e.status, this.statusText = e.statusText, this.url = e.responseURL, this.xhr = e;
  }
  json() {
    return this._decodedJSON || (this._decodedJSON = JSON.parse(this.xhr.response)), this._decodedJSON;
  }
  parseNumericHeader(e) {
    const t = parseInt(this.headers.getResponseHeader(e), 10);
    return isNaN(t) ? 0 : t;
  }
}
class nr {
  constructor(e, t) {
    this.timeout = void 0, this.api = void 0, this.dispatcher = void 0, this.cookie = void 0, this.sessionTokenStorage = void 0, this.lang = void 0, this.sessionTokenLocation = void 0, this.api = e, this.timeout = t.timeout, this.dispatcher = new Mi(), this.cookie = new Ys(gn({}, t)), this.sessionTokenStorage = new Xs({ keyName: t.cookieName }), this.lang = t.lang, this.sessionTokenLocation = t.sessionTokenLocation;
  }
  _fetch(e, t, n = new XMLHttpRequest()) {
    const i = this, s = this.api + e, a = this.timeout, d = this.getAuthToken(), c = this.lang;
    return new Promise(function(l, u) {
      n.open(t.method, s, !0), n.setRequestHeader("Accept", "application/json"), n.setRequestHeader("Content-Type", "application/json"), n.setRequestHeader("X-Language", c), d && n.setRequestHeader("Authorization", `Bearer ${d}`), n.timeout = a, n.withCredentials = !0, n.onload = () => {
        i.processHeaders(n), l(new tr(n));
      }, n.onerror = () => {
        u(new Ie());
      }, n.ontimeout = () => {
        u(new kn());
      }, n.send(t.body ? t.body.toString() : null);
    });
  }
  _fetch_blocking(e, t, n = new XMLHttpRequest()) {
    const i = this.api + e, s = this.getAuthToken();
    return n.open(t.method, i, !1), n.setRequestHeader("Accept", "application/json"), n.setRequestHeader("Content-Type", "application/json"), s && n.setRequestHeader("Authorization", `Bearer ${s}`), n.withCredentials = !0, n.send(t.body ? t.body.toString() : null), n.responseText;
  }
  processHeaders(e) {
    let t = "", n = 0, i = "";
    if (e.getAllResponseHeaders().split(`\r
`).forEach((s) => {
      const a = s.toLowerCase();
      a.startsWith("x-auth-token") ? t = e.getResponseHeader("X-Auth-Token") : a.startsWith("x-session-lifetime") ? n = parseInt(e.getResponseHeader("X-Session-Lifetime"), 10) : a.startsWith("x-session-retention") && (i = e.getResponseHeader("X-Session-Retention"));
    }), t) {
      const s = new RegExp("^https://"), a = !!this.api.match(s) && !!window.location.href.match(s), d = i === "session" ? void 0 : new Date((/* @__PURE__ */ new Date()).getTime() + 1e3 * n);
      this.setAuthToken(t, { secure: a, expires: d });
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
class it {
  constructor(e, t) {
    this.client = void 0, this.client = new nr(e, t);
  }
}
class Ri extends it {
  getDomain(e) {
    if (!e) throw new Be("somethingWentWrong", new Error("email missing from request"));
    const t = e.split("@");
    if (t.length !== 2) throw new Be("somethingWentWrong", new Error("email is not in a valid email format."));
    const n = t[1].trim();
    if (n === "") throw new Be("somethingWentWrong", new Error("email is not in a valid email format."));
    return n;
  }
  async hasProvider(e) {
    const t = this.getDomain(e);
    return this.client.get(`/saml/provider?domain=${t}`).then((n) => {
      if (n.status == 404) throw new Wt(new Error("provider not found"));
      if (!n.ok) throw new Ie(new Error("unable to fetch provider"));
      return n.ok;
    });
  }
  auth(e, t) {
    const n = new URL("/saml/auth", this.client.api), i = this.getDomain(e);
    if (!t) throw new Be("somethingWentWrong", new Error("redirectTo missing from request"));
    n.searchParams.append("domain", i), n.searchParams.append("redirect_to", t), window.location.assign(n.href);
  }
  getError() {
    const e = new URLSearchParams(window.location.search), t = e.get("error"), n = e.get("error_description");
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
      return new Be(i, new Error(n));
    }
  }
}
class Hi extends it {
  async getInfo(e) {
    const t = await this.client.post("/user", { email: e });
    if (t.status === 404) throw new Wt();
    if (!t.ok) throw new Ie();
    return t.json();
  }
  async create(e) {
    const t = await this.client.post("/users", { email: e });
    if (t.status === 409) throw new bn();
    if (t.status === 403) throw new wn();
    if (!t.ok) throw new Ie();
    return t.json();
  }
  async getCurrent() {
    const e = await this.client.get("/me");
    if (e.status === 401) throw this.client.dispatcher.dispatchSessionExpiredEvent(), new Je();
    if (!e.ok) throw new Ie();
    const t = e.json(), n = await this.client.get(`/users/${t.id}`);
    if (n.status === 401) throw this.client.dispatcher.dispatchSessionExpiredEvent(), new Je();
    if (!n.ok) throw new Ie();
    return n.json();
  }
  async delete() {
    const e = await this.client.delete("/user");
    if (e.ok) return this.client.sessionTokenStorage.removeSessionToken(), this.client.cookie.removeAuthCookie(), void this.client.dispatcher.dispatchUserDeletedEvent();
    throw e.status === 401 ? (this.client.dispatcher.dispatchSessionExpiredEvent(), new Je()) : new Ie();
  }
  async logout() {
    const e = await this.client.post("/logout");
    if (this.client.sessionTokenStorage.removeSessionToken(), this.client.cookie.removeAuthCookie(), this.client.dispatcher.dispatchUserLoggedOutEvent(), e.status !== 401 && !e.ok) throw new Ie();
  }
}
class Wi extends it {
  async list() {
    const e = await this.client.get("/emails");
    if (e.status === 401) throw this.client.dispatcher.dispatchSessionExpiredEvent(), new Je();
    if (!e.ok) throw new Ie();
    return e.json();
  }
  async create(e) {
    const t = await this.client.post("/emails", { address: e });
    if (t.ok) return t.json();
    throw t.status === 400 ? new xn() : t.status === 401 ? (this.client.dispatcher.dispatchSessionExpiredEvent(), new Je()) : t.status === 409 ? new Sn() : new Ie();
  }
  async setPrimaryEmail(e) {
    const t = await this.client.post(`/emails/${e}/set_primary`);
    if (t.status === 401) throw this.client.dispatcher.dispatchSessionExpiredEvent(), new Je();
    if (!t.ok) throw new Ie();
  }
  async delete(e) {
    const t = await this.client.delete(`/emails/${e}`);
    if (t.status === 401) throw this.client.dispatcher.dispatchSessionExpiredEvent(), new Je();
    if (!t.ok) throw new Ie();
  }
}
class zi extends it {
  async auth(e, t) {
    const n = new URL("/thirdparty/auth", this.client.api);
    if (!e) throw new Be("somethingWentWrong", new Error("provider missing from request"));
    if (!t) throw new Be("somethingWentWrong", new Error("redirectTo missing from request"));
    n.searchParams.append("provider", e), n.searchParams.append("redirect_to", t), window.location.assign(n.href);
  }
  getError() {
    const e = new URLSearchParams(window.location.search), t = e.get("error"), n = e.get("error_description");
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
      return new Be(i, new Error(n));
    }
  }
}
class qi extends it {
  async validate() {
    const e = new URLSearchParams(window.location.search).get("hanko_token");
    if (!e) return;
    window.history.replaceState(null, null, window.location.pathname);
    const t = await this.client.post("/token", { value: e });
    if (!t.ok) throw new Ie();
    return t.json();
  }
}
class or {
  static throttle(e, t, n = {}) {
    const { leading: i = !0, trailing: s = !0 } = n;
    let a, d, c, l = 0;
    const u = () => {
      l = i === !1 ? 0 : Date.now(), c = null, e.apply(a, d);
    };
    return function(...h) {
      const v = Date.now();
      l || i !== !1 || (l = v);
      const p = t - (v - l);
      a = this, d = h, p <= 0 || p > t ? (c && (window.clearTimeout(c), c = null), l = v, e.apply(a, d)) : c || s === !1 || (c = window.setTimeout(u, p));
    };
  }
}
class Cn {
  constructor() {
    this.throttleLimit = 1e3, this._addEventListener = document.addEventListener.bind(document), this._removeEventListener = document.removeEventListener.bind(document), this._throttle = or.throttle;
  }
  wrapCallback(e, t) {
    const n = (i) => {
      e(i.detail);
    };
    return t ? this._throttle(n, this.throttleLimit, { leading: !0, trailing: !1 }) : n;
  }
  addEventListenerWithType({ type: e, callback: t, once: n = !1, throttle: i = !1 }) {
    const s = this.wrapCallback(t, i);
    return this._addEventListener(e, s, { once: n }), () => this._removeEventListener(e, s);
  }
  static mapAddEventListenerParams(e, { once: t, callback: n }, i) {
    return { type: e, callback: n, once: t, throttle: i };
  }
  addEventListener(e, t, n) {
    return this.addEventListenerWithType(Cn.mapAddEventListenerParams(e, t, n));
  }
  onSessionCreated(e, t) {
    return this.addEventListener(ho, { callback: e, once: t }, !0);
  }
  onSessionExpired(e, t) {
    return this.addEventListener(po, { callback: e, once: t }, !0);
  }
  onUserLoggedOut(e, t) {
    return this.addEventListener(fo, { callback: e, once: t });
  }
  onUserDeleted(e, t) {
    return this.addEventListener(mo, { callback: e, once: t });
  }
}
class vo extends it {
  async validate() {
    const e = await this.client.get("/sessions/validate");
    if (!e.ok) throw new Ie();
    return await e.json();
  }
}
class ir extends it {
  isValid() {
    let e;
    try {
      const t = this.client._fetch_blocking("/sessions/validate", { method: "GET" });
      e = JSON.parse(t);
    } catch (t) {
      throw new Ie(t);
    }
    return !!e && e.is_valid;
  }
}
class sr {
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
class rr {
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
class ar {
  constructor(e, t, n) {
    this.intervalID = null, this.timeoutID = null, this.checkInterval = void 0, this.checkSession = void 0, this.onSessionExpired = void 0, this.checkInterval = e, this.checkSession = t, this.onSessionExpired = n;
  }
  scheduleSessionExpiry(e) {
    var t = this;
    this.stop(), this.timeoutID = setTimeout(async function() {
      t.stop(), t.onSessionExpired();
    }, e);
  }
  start(e = 0, t = 0) {
    var n = this;
    const i = this.calcTimeToNextCheck(e);
    this.sessionExpiresSoon(t) ? this.scheduleSessionExpiry(i) : this.timeoutID = setTimeout(async function() {
      let s = await n.checkSession();
      if (s.is_valid) {
        if (n.sessionExpiresSoon(s.expiration)) return void n.scheduleSessionExpiry(s.expiration - Date.now());
        n.intervalID = setInterval(async function() {
          s = await n.checkSession(), s.is_valid ? n.sessionExpiresSoon(s.expiration) && n.scheduleSessionExpiry(s.expiration - Date.now()) : n.stop();
        }, n.checkInterval);
      } else n.stop();
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
class lr {
  constructor(e = "hanko_session", t, n, i) {
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
    }, this.onSessionExpired = t, this.onSessionCreated = n, this.onLeadershipRequested = i, this.channel = new BroadcastChannel(e), this.channel.onmessage = this.handleMessage;
  }
  post(e) {
    this.channel.postMessage(e);
  }
}
class cr extends Mi {
  constructor(e, t) {
    super(), this.listener = new Cn(), this.checkInterval = 3e4, this.client = void 0, this.sessionState = void 0, this.windowActivityManager = void 0, this.scheduler = void 0, this.sessionChannel = void 0, this.isLoggedIn = void 0, this.client = new vo(e, t), this.checkInterval = t.sessionCheckInterval, this.sessionState = new sr(`${t.cookieName}_session_state`), this.sessionChannel = new lr(this.getSessionCheckChannelName(t.sessionTokenLocation, t.sessionCheckChannelName), () => this.onChannelSessionExpired(), (s) => this.onChannelSessionCreated(s), () => this.onChannelLeadershipRequested()), this.scheduler = new ar(this.checkInterval, () => this.checkSession(), () => this.onSessionExpired()), this.windowActivityManager = new rr(() => this.startSessionCheck(), () => this.scheduler.stop());
    const n = Date.now(), { expiration: i } = this.sessionState.load();
    this.isLoggedIn = n < i, this.initializeEventListeners(), this.startSessionCheck();
  }
  initializeEventListeners() {
    this.listener.onSessionCreated((e) => {
      const { claims: t } = e, n = Date.parse(t.expiration), i = Date.now();
      this.isLoggedIn = !0, this.sessionState.save({ expiration: n, lastCheck: i }), this.sessionChannel.post({ action: "sessionCreated", claims: t }), this.startSessionCheck();
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
    const e = Date.now(), { is_valid: t, claims: n, expiration_time: i } = await this.client.validate(), s = i ? Date.parse(i) : 0;
    return !t && this.isLoggedIn && this.dispatchSessionExpiredEvent(), t ? (this.isLoggedIn = !0, this.sessionState.save({ lastCheck: e, expiration: s })) : (this.isLoggedIn = !1, this.sessionState.save(null), this.sessionChannel.post({ action: "sessionExpired" })), { is_valid: t, claims: n, expiration: s };
  }
  onSessionExpired() {
    this.isLoggedIn && (this.isLoggedIn = !1, this.sessionState.save(null), this.sessionChannel.post({ action: "sessionExpired" }), this.dispatchSessionExpiredEvent());
  }
  onChannelSessionExpired() {
    this.isLoggedIn && (this.isLoggedIn = !1, this.dispatchSessionExpiredEvent());
  }
  onChannelSessionCreated(e) {
    const { claims: t } = e, n = Date.now(), i = Date.parse(t.expiration) - n;
    this.isLoggedIn = !0, this.dispatchSessionCreatedEvent({ claims: t, expirationSeconds: i });
  }
  onChannelLeadershipRequested() {
    this.windowActivityManager.hasFocus() || this.scheduler.stop();
  }
  getSessionCheckChannelName(e, t) {
    if (e == "cookie") return t;
    let n = sessionStorage.getItem("sessionCheckChannelName");
    return n != null && n !== "" || (n = `${t}-${Math.floor(100 * Math.random()) + 1}`, sessionStorage.setItem("sessionCheckChannelName", n)), n;
  }
}
var dt, yt = Ni("actionDefinitions"), Mn = Ni("createActionsProxy");
class Rn {
  toJSON() {
    return { name: this.name, payload: this.payload, error: this.error, status: this.status, csrf_token: this.csrf_token, actions: Nn(this, yt)[yt] };
  }
  constructor({ name: e, payload: t, error: n, status: i, actions: s, csrf_token: a }, d) {
    Object.defineProperty(this, Mn, { value: dr }), this.name = void 0, this.payload = void 0, this.error = void 0, this.status = void 0, this.csrf_token = void 0, Object.defineProperty(this, yt, { writable: !0, value: void 0 }), this.actions = void 0, this.fetchNextState = void 0, this.name = e, this.payload = t, this.error = n, this.status = i, this.csrf_token = a, Nn(this, yt)[yt] = s, this.actions = Nn(this, Mn)[Mn](s, a), this.fetchNextState = d;
  }
  runAction(e, t) {
    const n = {};
    if ("inputs" in e && typeof e.inputs == "object" && e.inputs !== null) {
      const i = e.inputs;
      for (const s in e.inputs) {
        const a = i[s];
        a && "value" in a && (n[s] = a.value);
      }
    }
    return this.fetchNextState(e.href, { input_data: n, csrf_token: t });
  }
  validateAction(e) {
    if ("inputs" in e) for (const t in e.inputs) {
      let i = function(a, d, c, l) {
        throw new Fi({ reason: a, inputName: t, wanted: c, actual: l, message: d });
      };
      const n = e.inputs[t], s = n.value;
      n.required && !s && i(dt.Required, "is required"), (n.min_length != null || n.max_length != null) && ("length" in s || i(dt.InvalidInputDefinition, 'has min/max length requirement, but is missing "length" property', "string", typeof s), n.min_length != null && s < n.min_length && i(dt.MinLength, `too short (min ${n.min_length})`, n.min_length, s.length), n.max_length != null && s > n.max_length && i(dt.MaxLength, `too long (max ${n.max_length})`, n.max_length, s.length));
    }
  }
}
function dr(o, e) {
  const t = (i) => this.runAction(i, e), n = (i) => this.validateAction(i);
  return new Proxy(o, { get(i, s) {
    if (typeof s == "symbol") return i[s];
    const a = i[s];
    return a == null ? null : (d) => {
      const c = Object.assign(JSON.parse(JSON.stringify(a)), { validate: () => (n(c), c), tryValidate() {
        try {
          n(c);
        } catch (l) {
          if (l instanceof Fi) return l;
          throw l;
        }
      }, run: () => t(c) });
      if (c !== null && typeof c == "object" && "inputs" in c) for (const l in d) {
        const u = c.inputs;
        u[l] || (u[l] = { name: l, type: "" }), u[l].value = d[l];
      }
      return c;
    };
  } });
}
(function(o) {
  o[o.InvalidInputDefinition = 0] = "InvalidInputDefinition", o[o.MinLength = 1] = "MinLength", o[o.MaxLength = 2] = "MaxLength", o[o.Required = 3] = "Required";
})(dt || (dt = {}));
class Fi extends Error {
  constructor(e) {
    super(`"${e.inputName}" ${e.message}`), this.reason = void 0, this.inputName = void 0, this.wanted = void 0, this.actual = void 0, this.name = "ValidationError", this.reason = e.reason, this.inputName = e.inputName, this.wanted = e.wanted, this.actual = e.actual;
  }
}
function ni(o) {
  return typeof o == "object" && o !== null && "status" in o && "error" in o && "name" in o && !!o.name && !!o.status;
}
class ur extends it {
  constructor(...e) {
    var t;
    super(...e), t = this, this.run = async function(n, i) {
      try {
        if (!ni(n)) throw new hr(n);
        const a = i[n.name];
        if (!a) throw new go(n);
        let d = await a(n);
        if (typeof (s = d) == "object" && s !== null && "href" in s && "inputs" in s && (d = await d.run()), ni(d)) return t.run(d, i);
      } catch (a) {
        if (typeof i.onError == "function") return i.onError(a);
      }
      var s;
    };
  }
  async init(e, t) {
    var n = this;
    const i = await async function s(a, d) {
      try {
        const c = await n.client.post(a, d);
        return new Rn(c.json(), s);
      } catch (c) {
        t.onError == null || t.onError(c);
      }
    }(e);
    await this.run(i, t);
  }
  async fromString(e, t) {
    var n = this;
    const i = new Rn(JSON.parse(e), async function s(a, d) {
      try {
        const c = await n.client.post(a, d);
        return new Rn(c.json(), s);
      } catch (c) {
        t.onError == null || t.onError(c);
      }
    });
    await this.run(i, t);
  }
}
class go extends Se {
  constructor(e) {
    super("No handler found for state: " + (typeof e.name == "string" ? `"${e.name}"` : `(${typeof e.name})`), "handlerNotFoundError"), this.state = void 0, this.state = e, Object.setPrototypeOf(this, go.prototype);
  }
}
class hr extends Error {
  constructor(e) {
    super("Invalid state: " + (typeof e.name == "string" ? `"${e.name}"` : `(${typeof e.name})`)), this.state = void 0, this.state = e;
  }
}
class Ki extends Cn {
  constructor(e, t) {
    super(), this.api = void 0, this.user = void 0, this.email = void 0, this.thirdParty = void 0, this.enterprise = void 0, this.token = void 0, this.sessionClient = void 0, this.session = void 0, this.relay = void 0, this.flow = void 0;
    const n = { timeout: 13e3, cookieName: "hanko", localStorageKey: "hanko", sessionCheckInterval: 3e4, sessionCheckChannelName: "hanko-session-check", sessionTokenLocation: "cookie" };
    (t == null ? void 0 : t.cookieName) !== void 0 && (n.cookieName = t.cookieName), (t == null ? void 0 : t.timeout) !== void 0 && (n.timeout = t.timeout), (t == null ? void 0 : t.localStorageKey) !== void 0 && (n.localStorageKey = t.localStorageKey), (t == null ? void 0 : t.cookieDomain) !== void 0 && (n.cookieDomain = t.cookieDomain), (t == null ? void 0 : t.cookieSameSite) !== void 0 && (n.cookieSameSite = t.cookieSameSite), (t == null ? void 0 : t.lang) !== void 0 && (n.lang = t.lang), (t == null ? void 0 : t.sessionCheckInterval) !== void 0 && (n.sessionCheckInterval = t.sessionCheckInterval < 3e3 ? 3e3 : t.sessionCheckInterval), (t == null ? void 0 : t.sessionCheckChannelName) !== void 0 && (n.sessionCheckChannelName = t.sessionCheckChannelName), (t == null ? void 0 : t.sessionTokenLocation) !== void 0 && (n.sessionTokenLocation = t.sessionTokenLocation), this.api = e, this.user = new Hi(e, n), this.email = new Wi(e, n), this.thirdParty = new zi(e, n), this.enterprise = new Ri(e, n), this.token = new qi(e, n), this.sessionClient = new vo(e, n), this.session = new ir(e, n), this.relay = new cr(e, n), this.flow = new ur(e, n);
  }
  setLang(e) {
    this.flow.client.lang = e;
  }
}
class ht {
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
var pr = Y(292), Qe = Y.n(pr), fr = Y(360), Ge = Y.n(fr), mr = Y(884), Ye = Y.n(mr), vr = Y(88), Xe = Y.n(vr), sn = Y(914), bt = {};
bt.setAttributes = Ye(), bt.insert = (o) => {
  window._hankoStyle = o;
}, bt.domAPI = Ge(), bt.insertStyleElement = Xe(), Qe()(sn.A, bt);
const Rt = sn.A && sn.A.locals ? sn.A.locals : void 0, gr = function(o) {
  function e(t) {
    var n = Oi({}, t);
    return delete n.ref, o(n, t.ref || null);
  }
  return e.$$typeof = Ns, e.render = e, e.prototype.isReactComponent = e.__f = !0, e.displayName = "ForwardRef(" + (o.displayName || o.name) + ")", e;
}((o, e) => {
  const { lang: t, hanko: n, setHanko: i } = (0, _.useContext)(ue), { setLang: s } = (0, _.useContext)(Z.TranslateContext);
  return (0, _.useEffect)(() => {
    s(t.replace(/[-]/, "")), i((a) => (a.setLang(t), a));
  }, [n, t, i, s]), r("section", Object.assign({ part: "container", className: Rt.container, ref: e }, { children: o.children }));
});
var rn = Y(697), kt = {};
kt.setAttributes = Ye(), kt.insert = (o) => {
  window._hankoStyle = o;
}, kt.domAPI = Ge(), kt.insertStyleElement = Xe(), Qe()(rn.A, kt);
const $ = rn.A && rn.A.locals ? rn.A.locals : void 0;
var _r = Y(633), Q = Y.n(_r);
const yr = ({ size: o, secondary: e, disabled: t }) => r("svg", Object.assign({ id: "icon-apple", xmlns: "http://www.w3.org/2000/svg", width: o, height: o, viewBox: "20.5 16 15 19", className: Q()($.icon, e && $.secondary, t && $.disabled) }, { children: r("path", { d: "M28.2226562,20.3846154 C29.0546875,20.3846154 30.0976562,19.8048315 30.71875,19.0317864 C31.28125,18.3312142 31.6914062,17.352829 31.6914062,16.3744437 C31.6914062,16.2415766 31.6796875,16.1087095 31.65625,16 C30.7304687,16.0362365 29.6171875,16.640178 28.9492187,17.4494596 C28.421875,18.06548 27.9414062,19.0317864 27.9414062,20.0222505 C27.9414062,20.1671964 27.9648438,20.3121424 27.9765625,20.3604577 C28.0351562,20.3725366 28.1289062,20.3846154 28.2226562,20.3846154 Z M25.2929688,35 C26.4296875,35 26.9335938,34.214876 28.3515625,34.214876 C29.7929688,34.214876 30.109375,34.9758423 31.375,34.9758423 C32.6171875,34.9758423 33.4492188,33.792117 34.234375,32.6325493 C35.1132812,31.3038779 35.4765625,29.9993643 35.5,29.9389701 C35.4179688,29.9148125 33.0390625,28.9122695 33.0390625,26.0979021 C33.0390625,23.6579784 34.9140625,22.5588048 35.0195312,22.474253 C33.7773438,20.6382708 31.890625,20.5899555 31.375,20.5899555 C29.9804688,20.5899555 28.84375,21.4596313 28.1289062,21.4596313 C27.3554688,21.4596313 26.3359375,20.6382708 25.1289062,20.6382708 C22.8320312,20.6382708 20.5,22.5950413 20.5,26.2911634 C20.5,28.5861411 21.3671875,31.013986 22.4335938,32.5842339 C23.3476562,33.9129053 24.1445312,35 25.2929688,35 Z" }) })), br = ({ secondary: o, size: e, fadeOut: t, disabled: n }) => r("svg", Object.assign({ id: "icon-checkmark", xmlns: "http://www.w3.org/2000/svg", viewBox: "4 4 40 40", width: e, height: e, className: Q()($.checkmark, o && $.secondary, t && $.fadeOut, n && $.disabled) }, { children: r("path", { d: "M21.05 33.1 35.2 18.95l-2.3-2.25-11.85 11.85-6-6-2.25 2.25ZM24 44q-4.1 0-7.75-1.575-3.65-1.575-6.375-4.3-2.725-2.725-4.3-6.375Q4 28.1 4 24q0-4.15 1.575-7.8 1.575-3.65 4.3-6.35 2.725-2.7 6.375-4.275Q19.9 4 24 4q4.15 0 7.8 1.575 3.65 1.575 6.35 4.275 2.7 2.7 4.275 6.35Q44 19.85 44 24q0 4.1-1.575 7.75-1.575 3.65-4.275 6.375t-6.35 4.3Q28.15 44 24 44Zm0-3q7.1 0 12.05-4.975Q41 31.05 41 24q0-7.1-4.95-12.05Q31.1 7 24 7q-7.05 0-12.025 4.95Q7 16.9 7 24q0 7.05 4.975 12.025Q16.95 41 24 41Zm0-17Z" }) })), kr = ({ size: o, secondary: e, disabled: t }) => r("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", viewBox: "0 -960 960 960", width: o, height: o, className: Q()($.icon, e && $.secondary, t && $.disabled) }, { children: r("path", { d: "M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" }) })), wr = ({ size: o, secondary: e, disabled: t }) => r("svg", Object.assign({ id: "icon-custom-provider", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: o, height: o, className: Q()($.icon, e && $.secondary, t && $.disabled) }, { children: [r("path", { d: "M0 0h24v24H0z", fill: "none" }), r("path", { d: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" })] })), Sr = ({ size: o, secondary: e, disabled: t }) => r("svg", Object.assign({ id: "icon-discord", fill: "#fff", xmlns: "http://www.w3.org/2000/svg", width: o, height: o, viewBox: "0 0 127.14 96.36", className: Q()($.icon, e && $.secondary, t && $.disabled) }, { children: r("path", { d: "M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" }) })), xr = ({ size: o, secondary: e, disabled: t }) => r("svg", Object.assign({ id: "icon-exclamation", xmlns: "http://www.w3.org/2000/svg", viewBox: "5 2 13 20", width: o, height: o, className: Q()($.exclamationMark, e && $.secondary, t && $.disabled) }, { children: r("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" }) })), Cr = ({ size: o, secondary: e, disabled: t }) => r("svg", Object.assign({ width: o, height: o, viewBox: "0 0 666.66668 666.66717", xmlns: "http://www.w3.org/2000/svg" }, { children: [r("defs", Object.assign({ id: "defs13" }, { children: r("clipPath", Object.assign({ clipPathUnits: "userSpaceOnUse", id: "clipPath25" }, { children: r("path", { d: "M 0,700 H 700 V 0 H 0 Z", id: "path23" }) })) })), r("g", Object.assign({ id: "g17", transform: "matrix(1.3333333,0,0,-1.3333333,-133.33333,799.99999)" }, { children: r("g", Object.assign({ id: "g19" }, { children: r("g", Object.assign({ id: "g21", clipPath: "url(#clipPath25)" }, { children: [r("g", Object.assign({ id: "g27", transform: "translate(600,350)" }, { children: r("path", { className: Q()($.facebookIcon, t ? $.disabledOutline : $.outline), d: "m 0,0 c 0,138.071 -111.929,250 -250,250 -138.071,0 -250,-111.929 -250,-250 0,-117.245 80.715,-215.622 189.606,-242.638 v 166.242 h -51.552 V 0 h 51.552 v 32.919 c 0,85.092 38.508,124.532 122.048,124.532 15.838,0 43.167,-3.105 54.347,-6.211 V 81.986 c -5.901,0.621 -16.149,0.932 -28.882,0.932 -40.993,0 -56.832,-15.528 -56.832,-55.9 V 0 h 81.659 l -14.028,-76.396 h -67.631 V -248.169 C -95.927,-233.218 0,-127.818 0,0", id: "path29" }) })), r("g", Object.assign({ id: "g31", transform: "translate(447.9175,273.6036)" }, { children: r("path", { className: Q()($.facebookIcon, t ? $.disabledLetter : $.letter), d: "M 0,0 14.029,76.396 H -67.63 v 27.019 c 0,40.372 15.838,55.899 56.831,55.899 12.733,0 22.981,-0.31 28.882,-0.931 v 69.253 c -11.18,3.106 -38.509,6.212 -54.347,6.212 -83.539,0 -122.048,-39.441 -122.048,-124.533 V 76.396 h -51.552 V 0 h 51.552 v -166.242 c 19.343,-4.798 39.568,-7.362 60.394,-7.362 10.254,0 20.358,0.632 30.288,1.831 L -67.63,0 Z", id: "path33" }) }))] })) })) }))] })), Ar = ({ size: o, secondary: e, disabled: t }) => r("svg", Object.assign({ id: "icon-github", xmlns: "http://www.w3.org/2000/svg", fill: "#fff", viewBox: "0 0 97.63 96", width: o, height: o, className: Q()($.icon, e && $.secondary, t && $.disabled) }, { children: [r("path", { d: "M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" }), " "] })), Or = ({ size: o, disabled: e }) => r("svg", Object.assign({ id: "icon-google", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: o, height: o, className: $.googleIcon }, { children: [r("path", { className: Q()($.googleIcon, e ? $.disabled : $.blue), d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }), r("path", { className: Q()($.googleIcon, e ? $.disabled : $.green), d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), r("path", { className: Q()($.googleIcon, e ? $.disabled : $.yellow), d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }), r("path", { className: Q()($.googleIcon, e ? $.disabled : $.red), d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" }), r("path", { d: "M1 1h22v22H1z", fill: "none" })] })), Er = ({ size: o, secondary: e, disabled: t }) => r("svg", Object.assign({ id: "icon-linkedin", fill: "#fff", xmlns: "http://www.w3.org/2000/svg", width: o, viewBox: "0 0 24 24", height: o, className: Q()($.icon, e && $.secondary, t && $.disabled) }, { children: r("path", { d: "M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" }) })), Pr = ({ size: o, secondary: e, disabled: t }) => r("svg", Object.assign({ id: "icon-mail", xmlns: "http://www.w3.org/2000/svg", width: o, height: o, viewBox: "0 -960 960 960", className: Q()($.icon, e && $.secondary, t && $.disabled) }, { children: r("path", { d: "M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" }) })), Ir = ({ size: o, disabled: e }) => r("svg", Object.assign({ id: "icon-microsoft", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: o, height: o, className: $.microsoftIcon }, { children: [r("rect", { className: Q()($.microsoftIcon, e ? $.disabled : $.blue), x: "1", y: "1", width: "9", height: "9" }), r("rect", { className: Q()($.microsoftIcon, e ? $.disabled : $.green), x: "1", y: "11", width: "9", height: "9" }), r("rect", { className: Q()($.microsoftIcon, e ? $.disabled : $.yellow), x: "11", y: "1", width: "9", height: "9" }), r("rect", { className: Q()($.microsoftIcon, e ? $.disabled : $.red), x: "11", y: "11", width: "9", height: "9" })] })), jr = ({ size: o, secondary: e, disabled: t }) => r("svg", Object.assign({ id: "icon-passkey", xmlns: "http://www.w3.org/2000/svg", viewBox: "3 1.5 19.5 19", width: o, height: o, className: Q()($.icon, e && $.secondary, t && $.disabled) }, { children: r("g", Object.assign({ id: "icon-passkey-all" }, { children: [r("circle", { id: "icon-passkey-head", cx: "10.5", cy: "6", r: "4.5" }), r("path", { id: "icon-passkey-key", d: "M22.5,10.5a3.5,3.5,0,1,0-5,3.15V19L19,20.5,21.5,18,20,16.5,21.5,15l-1.24-1.24A3.5,3.5,0,0,0,22.5,10.5Zm-3.5,0a1,1,0,1,1,1-1A1,1,0,0,1,19,10.5Z" }), r("path", { id: "icon-passkey-body", d: "M14.44,12.52A6,6,0,0,0,12,12H9a6,6,0,0,0-6,6v2H16V14.49A5.16,5.16,0,0,1,14.44,12.52Z" })] })) })), Dr = ({ size: o, secondary: e, disabled: t }) => r("svg", Object.assign({ id: "icon-password", xmlns: "http://www.w3.org/2000/svg", width: o, height: o, viewBox: "0 -960 960 960", className: Q()($.icon, e && $.secondary, t && $.disabled) }, { children: r("path", { d: "M80-200v-80h800v80H80Zm46-242-52-30 34-60H40v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Zm320 0-52-30 34-60h-68v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Zm320 0-52-30 34-60h-68v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Z" }) })), $r = ({ size: o, secondary: e, disabled: t }) => r("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", viewBox: "0 -960 960 960", width: o, height: o, className: Q()($.icon, e && $.secondary, t && $.disabled) }, { children: r("path", { d: "M80-680v-200h200v80H160v120H80Zm0 600v-200h80v120h120v80H80Zm600 0v-80h120v-120h80v200H680Zm120-600v-120H680v-80h200v200h-80ZM700-260h60v60h-60v-60Zm0-120h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60-60h60v60h-60v-60Zm120-120h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60-60h60v60h-60v-60Zm240-320v240H520v-240h240ZM440-440v240H200v-240h240Zm0-320v240H200v-240h240Zm-60 500v-120H260v120h120Zm0-320v-120H260v120h120Zm320 0v-120H580v120h120Z" }) })), Lr = ({ size: o, secondary: e, disabled: t }) => r("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", viewBox: "0 -960 960 960", width: o, height: o, className: Q()($.icon, e && $.secondary, t && $.disabled) }, { children: r("path", { d: "M280-240q-100 0-170-70T40-480q0-100 70-170t170-70q66 0 121 33t87 87h432v240h-80v120H600v-120H488q-32 54-87 87t-121 33Zm0-80q66 0 106-40.5t48-79.5h246v120h80v-120h80v-80H434q-8-39-48-79.5T280-640q-66 0-113 47t-47 113q0 66 47 113t113 47Zm0-80q33 0 56.5-23.5T360-480q0-33-23.5-56.5T280-560q-33 0-56.5 23.5T200-480q0 33 23.5 56.5T280-400Zm0-80Z" }) })), Tr = ({ size: o, disabled: e }) => r("svg", Object.assign({ id: "icon-spinner", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: o, height: o, className: Q()($.loadingSpinner, e && $.disabled) }, { children: [r("path", { d: "M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z", opacity: ".25" }), r("path", { d: "M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z" })] })), Ht = ({ name: o, secondary: e, size: t = 18, fadeOut: n, disabled: i }) => r(Jn[o], { size: t, secondary: e, fadeOut: n, disabled: i }), _o = ({ children: o, isLoading: e, isSuccess: t, fadeOut: n, secondary: i, hasIcon: s, maxWidth: a }) => r(O.Fragment, { children: r("div", e ? Object.assign({ className: Q()($.loadingSpinnerWrapper, $.centerContent, a && $.maxWidth) }, { children: r(Ht, { name: "spinner", secondary: i }) }) : t ? Object.assign({ className: Q()($.loadingSpinnerWrapper, $.centerContent, a && $.maxWidth) }, { children: r(Ht, { name: "checkmark", secondary: i, fadeOut: n }) }) : Object.assign({ className: s ? $.loadingSpinnerWrapperIcon : $.loadingSpinnerWrapper }, { children: o })) }), Nr = () => {
  const { setLoadingAction: o } = (0, _.useContext)(ue);
  return (0, _.useEffect)(() => {
    o(null);
  }, []), r(_o, { isLoading: !0 });
}, Le = (o) => {
  const [e, t] = (0, _.useState)(o);
  return (0, _.useEffect)(() => {
    o && t(o);
  }, [o]), { flowState: e };
};
var an = Y(577), wt = {};
wt.setAttributes = Ye(), wt.insert = (o) => {
  window._hankoStyle = o;
}, wt.domAPI = Ge(), wt.insertStyleElement = Xe(), Qe()(an.A, wt);
const xe = an.A && an.A.locals ? an.A.locals : void 0, Ur = () => {
  const { t: o } = (0, _.useContext)(Z.TranslateContext);
  return r("span", Object.assign({ className: Q()(xe.lastUsed) }, { children: o("labels.lastUsed") }));
}, te = (o) => {
  var { uiAction: e, title: t, children: n, secondary: i, dangerous: s, autofocus: a, showLastUsed: d, onClick: c, icon: l } = o, u = function(x, A) {
    var I = {};
    for (var T in x) Object.prototype.hasOwnProperty.call(x, T) && A.indexOf(T) < 0 && (I[T] = x[T]);
    if (x != null && typeof Object.getOwnPropertySymbols == "function") {
      var U = 0;
      for (T = Object.getOwnPropertySymbols(x); U < T.length; U++) A.indexOf(T[U]) < 0 && Object.prototype.propertyIsEnumerable.call(x, T[U]) && (I[T[U]] = x[T[U]]);
    }
    return I;
  }(o, ["uiAction", "title", "children", "secondary", "dangerous", "autofocus", "showLastUsed", "onClick", "icon"]);
  const h = (0, _.useRef)(null), { uiState: v, isDisabled: p } = (0, _.useContext)(ue);
  (0, _.useEffect)(() => {
    const { current: x } = h;
    x && a && x.focus();
  }, [a]);
  const S = (0, _.useMemo)(() => e && v.loadingAction === e || u.isLoading, [u, e, v]), E = (0, _.useMemo)(() => e && v.succeededAction === e || u.isSuccess, [u, e, v]), C = (0, _.useMemo)(() => p || u.disabled, [u, p]);
  return r("button", Object.assign({ part: s ? "button dangerous-button" : i ? "button secondary-button" : "button primary-button", title: t, ref: h, type: "submit", disabled: C, onClick: c, className: Q()(xe.button, s ? xe.dangerous : i ? xe.secondary : xe.primary) }, { children: r(_o, Object.assign({ isLoading: S, isSuccess: E, secondary: !0, hasIcon: !!l, maxWidth: !0 }, { children: [l ? r(Ht, { name: l, secondary: i, disabled: C }) : null, r("div", Object.assign({ className: xe.caption }, { children: [r("span", { children: n }), d ? r(Ur, {}) : null] }))] })) }));
}, qe = (o) => {
  var e, t, n, i, s, { label: a } = o, d = function(p, S) {
    var E = {};
    for (var C in p) Object.prototype.hasOwnProperty.call(p, C) && S.indexOf(C) < 0 && (E[C] = p[C]);
    if (p != null && typeof Object.getOwnPropertySymbols == "function") {
      var x = 0;
      for (C = Object.getOwnPropertySymbols(p); x < C.length; x++) S.indexOf(C[x]) < 0 && Object.prototype.propertyIsEnumerable.call(p, C[x]) && (E[C[x]] = p[C[x]]);
    }
    return E;
  }(o, ["label"]);
  const c = (0, _.useRef)(null), { isDisabled: l } = (0, _.useContext)(ue), { t: u } = (0, _.useContext)(Z.TranslateContext), h = (0, _.useMemo)(() => l || d.disabled, [d, l]);
  (0, _.useEffect)(() => {
    const { current: p } = c;
    p && d.autofocus && (p.focus(), p.select());
  }, [d.autofocus]);
  const v = (0, _.useMemo)(() => {
    var p;
    return d.markOptional && !(!((p = d.flowInput) === null || p === void 0) && p.required) ? `${d.placeholder} (${u("labels.optional")})` : d.placeholder;
  }, [d.markOptional, d.placeholder, d.flowInput, u]);
  return r("div", Object.assign({ className: xe.inputWrapper }, { children: r("input", Object.assign({ part: "input text-input", required: (e = d.flowInput) === null || e === void 0 ? void 0 : e.required, maxLength: (t = d.flowInput) === null || t === void 0 ? void 0 : t.max_length, minLength: (n = d.flowInput) === null || n === void 0 ? void 0 : n.min_length, hidden: (i = d.flowInput) === null || i === void 0 ? void 0 : i.hidden }, d, { ref: c, "aria-label": v, placeholder: v, className: Q()(xe.input, !!(!((s = d.flowInput) === null || s === void 0) && s.error) && d.markError && xe.error), disabled: h })) }));
}, Ce = ({ children: o }) => r("section", Object.assign({ className: Rt.content }, { children: o })), ne = ({ onSubmit: o, children: e, hidden: t, maxWidth: n }) => t ? null : r("form", Object.assign({ onSubmit: o, className: xe.form }, { children: r("ul", Object.assign({ className: xe.ul }, { children: (0, O.toChildArray)(e).map((i, s) => r("li", Object.assign({ part: "form-item", className: Q()(xe.li, n ? xe.maxWidth : null) }, { children: i }), s)) })) }));
var ln = Y(111), St = {};
St.setAttributes = Ye(), St.insert = (o) => {
  window._hankoStyle = o;
}, St.domAPI = Ge(), St.insertStyleElement = Xe(), Qe()(ln.A, St);
const $t = ln.A && ln.A.locals ? ln.A.locals : void 0, yo = ({ children: o, hidden: e }) => e ? null : r("section", Object.assign({ part: "divider", className: $t.divider }, { children: [r("div", { part: "divider-line", className: $t.line }), o ? r("div", Object.assign({ part: "divider-text", class: $t.text }, { children: o })) : null, r("div", { part: "divider-line", className: $t.line })] }));
var cn = Y(905), xt = {};
xt.setAttributes = Ye(), xt.insert = (o) => {
  window._hankoStyle = o;
}, xt.domAPI = Ge(), xt.insertStyleElement = Xe(), Qe()(cn.A, xt);
const Bi = cn.A && cn.A.locals ? cn.A.locals : void 0, Ae = ({ state: o, error: e, flowError: t }) => {
  var n, i;
  const { t: s } = (0, _.useContext)(Z.TranslateContext), { uiState: a, setUIState: d } = (0, _.useContext)(ue);
  return (0, _.useEffect)(() => {
    var c, l;
    if (((c = o == null ? void 0 : o.error) === null || c === void 0 ? void 0 : c.code) == "form_data_invalid_error") for (const u of Object.values(o == null ? void 0 : o.actions)) {
      const h = u == null ? void 0 : u(null);
      let v = !1;
      for (const p of Object.values(h == null ? void 0 : h.inputs)) if (!((l = p.error) === null || l === void 0) && l.code) return d(Object.assign(Object.assign({}, a), { error: p.error })), void (v = !0);
      v || d(Object.assign(Object.assign({}, a), { error: o.error }));
    }
    else o != null && o.error && d(Object.assign(Object.assign({}, a), { error: o == null ? void 0 : o.error }));
  }, [o]), r("section", Object.assign({ part: "error", className: Bi.errorBox, hidden: !(!((n = a.error) === null || n === void 0) && n.code) && !(t != null && t.code) && !e }, { children: [r("span", { children: r(Ht, { name: "exclamation", size: 15 }) }), r("span", Object.assign({ id: "errorMessage", part: "error-text" }, { children: s(e ? `errors.${e.code}` : `flowErrors.${((i = a.error) === null || i === void 0 ? void 0 : i.code) || (t == null ? void 0 : t.code)}`) }))] }));
};
var dn = Y(619), Ct = {};
Ct.setAttributes = Ye(), Ct.insert = (o) => {
  window._hankoStyle = o;
}, Ct.domAPI = Ge(), Ct.insertStyleElement = Xe(), Qe()(dn.A, Ct);
const _n = dn.A && dn.A.locals ? dn.A.locals : void 0, de = ({ children: o }) => r("h1", Object.assign({ part: "headline1", className: Q()(_n.headline, _n.grade1) }, { children: o }));
var un = Y(995), At = {};
At.setAttributes = Ye(), At.insert = (o) => {
  window._hankoStyle = o;
}, At.domAPI = Ge(), At.insertStyleElement = Xe(), Qe()(un.A, At);
const Vt = un.A && un.A.locals ? un.A.locals : void 0, Gn = (o) => {
  var { loadingSpinnerPosition: e, dangerous: t = !1, onClick: n, uiAction: i } = o, s = function(A, I) {
    var T = {};
    for (var U in A) Object.prototype.hasOwnProperty.call(A, U) && I.indexOf(U) < 0 && (T[U] = A[U]);
    if (A != null && typeof Object.getOwnPropertySymbols == "function") {
      var ie = 0;
      for (U = Object.getOwnPropertySymbols(A); ie < U.length; ie++) I.indexOf(U[ie]) < 0 && Object.prototype.propertyIsEnumerable.call(A, U[ie]) && (T[U[ie]] = A[U[ie]]);
    }
    return T;
  }(o, ["loadingSpinnerPosition", "dangerous", "onClick", "uiAction"]);
  const { t: a } = (0, _.useContext)(Z.TranslateContext), { uiState: d, isDisabled: c } = (0, _.useContext)(ue), [l, u] = (0, _.useState)();
  let h;
  const v = (A) => {
    A.preventDefault(), u(!0);
  }, p = (A) => {
    A.preventDefault(), u(!1);
  }, S = (0, _.useMemo)(() => i && d.loadingAction === i || s.isLoading, [s, i, d]), E = (0, _.useMemo)(() => i && d.succeededAction === i || s.isSuccess, [s, i, d]), C = (0, _.useCallback)((A) => {
    A.preventDefault(), u(!1), n(A);
  }, [n]), x = (0, _.useCallback)(() => r(O.Fragment, { children: [l ? r(O.Fragment, { children: [r(Gn, Object.assign({ onClick: C }, { children: a("labels.yes") })), " / ", r(Gn, Object.assign({ onClick: p }, { children: a("labels.no") })), " "] }) : null, r("button", Object.assign({}, s, { onClick: t ? v : n, disabled: l || s.disabled || c, part: "link", className: Q()(Vt.link, t ? Vt.danger : null) }, { children: s.children }))] }), [l, t, n, C, s, a, c]);
  return r(O.Fragment, { children: r("span", Object.assign({ className: Q()(Vt.linkWrapper, e === "right" ? Vt.reverse : null), hidden: s.hidden, onMouseEnter: () => {
    h && window.clearTimeout(h);
  }, onMouseLeave: () => {
    h = window.setTimeout(() => {
      u(!1);
    }, 1e3);
  } }, { children: r(O.Fragment, e && (S || E) ? { children: [r(_o, { isLoading: S, isSuccess: E, secondary: s.secondary, fadeOut: !0 }), x()] } : { children: x() }) })) });
}, ee = Gn, Te = ({ children: o, hidden: e = !1 }) => e ? null : r("section", Object.assign({ className: Rt.footer }, { children: o })), bo = (o) => {
  var { label: e } = o, t = function(n, i) {
    var s = {};
    for (var a in n) Object.prototype.hasOwnProperty.call(n, a) && i.indexOf(a) < 0 && (s[a] = n[a]);
    if (n != null && typeof Object.getOwnPropertySymbols == "function") {
      var d = 0;
      for (a = Object.getOwnPropertySymbols(n); d < a.length; d++) i.indexOf(a[d]) < 0 && Object.prototype.propertyIsEnumerable.call(n, a[d]) && (s[a[d]] = n[a[d]]);
    }
    return s;
  }(o, ["label"]);
  return r("div", Object.assign({ className: xe.inputWrapper }, { children: r("label", Object.assign({ className: xe.checkboxWrapper }, { children: [r("input", Object.assign({ part: "input checkbox-input", type: "checkbox", "aria-label": e, className: xe.checkbox }, t)), r("span", Object.assign({ className: Q()(xe.label, t.disabled ? xe.disabled : null) }, { children: e }))] })) }));
}, An = () => r("section", { className: $t.spacer });
var Ot = function(o, e, t, n) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        c(n.next(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      try {
        c(n.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, d);
    }
    c((n = n.apply(o, [])).next());
  });
};
const Mr = (o) => {
  var e, t, n, i, s, a, d, c, l;
  const { t: u } = (0, _.useContext)(Z.TranslateContext), { init: h, hanko: v, initialComponentName: p, setLoadingAction: S, uiState: E, setUIState: C, stateHandler: x, hidePasskeyButtonOnLogin: A, lastLogin: I } = (0, _.useContext)(ue), [T, U] = (0, _.useState)(null), [ie, _e] = (0, _.useState)(E.username || E.email), { flowState: se } = Le(o.state), be = ht.supported(), [M, z] = (0, _.useState)(void 0), [ve, je] = (0, _.useState)(null), [Oe, De] = (0, _.useState)(!1), re = (k) => {
    if (k.preventDefault(), k.target instanceof HTMLInputElement) {
      const { value: f } = k.target;
      _e(f), ae(f);
    }
  }, ae = (k) => {
    const f = () => C((L) => Object.assign(Object.assign({}, L), { email: k, username: null })), y = () => C((L) => Object.assign(Object.assign({}, L), { email: null, username: k }));
    switch (T) {
      case "email":
        f();
        break;
      case "username":
        y();
        break;
      case "identifier":
        k.match(/^[^@]+@[^@]+\.[^@]+$/) ? f() : y();
    }
  }, he = (0, _.useMemo)(() => {
    var k, f, y, L;
    return !!(!((f = (k = se.actions).webauthn_generate_request_options) === null || f === void 0) && f.call(k, null)) || !!(!((L = (y = se.actions).thirdparty_oauth) === null || L === void 0) && L.call(y, null));
  }, [se.actions]), Ee = (t = (e = se.actions).continue_with_login_identifier) === null || t === void 0 ? void 0 : t.call(e, null).inputs;
  return (0, _.useEffect)(() => {
    var k, f;
    const y = (f = (k = se.actions).continue_with_login_identifier) === null || f === void 0 ? void 0 : f.call(k, null).inputs;
    U(y != null && y.email ? "email" : y != null && y.username ? "username" : "identifier");
  }, [se]), (0, _.useEffect)(() => {
    const k = new URLSearchParams(window.location.search);
    if (k.get("error") == null || k.get("error").length === 0) return;
    let f = "";
    f = k.get("error") === "access_denied" ? "thirdPartyAccessDenied" : "somethingWentWrong";
    const y = { name: f, code: f, message: k.get("error_description") };
    z(y), k.delete("error"), k.delete("error_description"), history.replaceState(null, null, window.location.pathname + (k.size < 1 ? "" : `?${k.toString()}`));
  }, []), r(O.Fragment, { children: [r(Ce, { children: [r(de, { children: u("headlines.signIn") }), r(Ae, { state: se, error: M }), Ee ? r(O.Fragment, { children: [r(ne, Object.assign({ onSubmit: (k) => Ot(void 0, void 0, void 0, function* () {
    k.preventDefault(), S("email-submit");
    const f = yield se.actions.continue_with_login_identifier({ [T]: ie }).run();
    ae(ie), S(null), yield v.flow.run(f, x);
  }), maxWidth: !0 }, { children: [Ee.email ? r(qe, { type: "email", autoComplete: "username webauthn", autoCorrect: "off", flowInput: Ee.email, onInput: re, value: ie, placeholder: u("labels.email"), pattern: "^[^@]+@[^@]+\\.[^@]+$" }) : Ee.username ? r(qe, { type: "text", autoComplete: "username webauthn", autoCorrect: "off", flowInput: Ee.username, onInput: re, value: ie, placeholder: u("labels.username") }) : r(qe, { type: "text", autoComplete: "username webauthn", autoCorrect: "off", flowInput: Ee.identifier, onInput: re, value: ie, placeholder: u("labels.emailOrUsername") }), r(te, Object.assign({ uiAction: "email-submit" }, { children: u("labels.continue") }))] })), r(yo, Object.assign({ hidden: !he }, { children: u("labels.or") }))] }) : null, !((i = (n = se.actions).webauthn_generate_request_options) === null || i === void 0) && i.call(n, null) && !A ? r(ne, Object.assign({ onSubmit: (k) => ((f) => Ot(void 0, void 0, void 0, function* () {
    f.preventDefault(), S("passkey-submit");
    const y = yield se.actions.webauthn_generate_request_options(null).run();
    yield v.flow.run(y, x);
  }))(k) }, { children: r(te, Object.assign({ uiAction: "passkey-submit", secondary: !0, title: be ? null : u("labels.webauthnUnsupported"), disabled: !be, icon: "passkey" }, { children: u("labels.signInPasskey") })) })) : null, !((a = (s = se.actions).thirdparty_oauth) === null || a === void 0) && a.call(s, null) ? (d = se.actions.thirdparty_oauth(null).inputs.provider.allowed_values) === null || d === void 0 ? void 0 : d.map((k) => r(ne, Object.assign({ onSubmit: (f) => ((y, L) => Ot(void 0, void 0, void 0, function* () {
    y.preventDefault(), je(L);
    const K = yield se.actions.thirdparty_oauth({ provider: L, redirect_to: window.location.toString() }).run();
    K.error && je(null), yield v.flow.run(K, x);
  }))(f, k.value) }, { children: r(te, Object.assign({ isLoading: k.value == ve, secondary: !0, icon: k.value.startsWith("custom_") ? "customProvider" : k.value, showLastUsed: (I == null ? void 0 : I.login_method) == "third_party" && (I == null ? void 0 : I.third_party_provider) == k.value }, { children: u("labels.signInWith", { provider: k.name }) })) }), k.value)) : null, ((l = (c = se.actions).remember_me) === null || l === void 0 ? void 0 : l.call(c, null)) && r(O.Fragment, { children: [r(An, {}), r(bo, { required: !1, type: "checkbox", label: u("labels.staySignedIn"), checked: Oe, onChange: (k) => Ot(void 0, void 0, void 0, function* () {
    const f = yield se.actions.remember_me({ remember_me: !Oe }).run();
    De((y) => !y), yield v.flow.run(f, x);
  }) })] })] }), r(Te, Object.assign({ hidden: p !== "auth" }, { children: [r("span", { hidden: !0 }), r(ee, Object.assign({ uiAction: "switch-flow", onClick: (k) => Ot(void 0, void 0, void 0, function* () {
    k.preventDefault(), h("registration");
  }), loadingSpinnerPosition: "left" }, { children: u("labels.dontHaveAnAccount") }))] }))] });
}, Rr = (o) => {
  var { index: e, focus: t, digit: n = "" } = o, i = function(l, u) {
    var h = {};
    for (var v in l) Object.prototype.hasOwnProperty.call(l, v) && u.indexOf(v) < 0 && (h[v] = l[v]);
    if (l != null && typeof Object.getOwnPropertySymbols == "function") {
      var p = 0;
      for (v = Object.getOwnPropertySymbols(l); p < v.length; p++) u.indexOf(v[p]) < 0 && Object.prototype.propertyIsEnumerable.call(l, v[p]) && (h[v[p]] = l[v[p]]);
    }
    return h;
  }(o, ["index", "focus", "digit"]);
  const s = (0, _.useRef)(null), { isDisabled: a } = (0, _.useContext)(ue), d = () => {
    const { current: l } = s;
    l && (l.focus(), l.select());
  }, c = (0, _.useMemo)(() => a || i.disabled, [i, a]);
  return (0, _.useEffect)(() => {
    e === 0 && d();
  }, [e, i.disabled]), (0, _.useMemo)(() => {
    t && d();
  }, [t]), r("div", Object.assign({ className: xe.passcodeDigitWrapper }, { children: r("input", Object.assign({}, i, { part: "input passcode-input", "aria-label": `${i.name}-digit-${e + 1}`, name: i.name + e.toString(10), type: "text", inputMode: "numeric", maxLength: 1, ref: s, value: n.charAt(0), required: !0, className: xe.input, disabled: c })) }));
}, ko = ({ passcodeDigits: o = [], numberOfInputs: e = 6, onInput: t, disabled: n = !1 }) => {
  const [i, s] = (0, _.useState)(0), a = () => o.slice(), d = () => {
    i < e - 1 && s(i + 1);
  }, c = () => {
    i > 0 && s(i - 1);
  }, l = (p) => {
    const S = a();
    S[i] = p.charAt(0), t(S);
  }, u = (p) => {
    if (p.preventDefault(), n) return;
    const S = p.clipboardData.getData("text/plain").slice(0, e - i).split(""), E = a();
    let C = i;
    for (let x = 0; x < e; ++x) x >= i && S.length > 0 && (E[x] = S.shift(), C++);
    s(C), t(E);
  }, h = (p) => {
    p.key === "Backspace" ? (p.preventDefault(), l(""), c()) : p.key === "Delete" ? (p.preventDefault(), l("")) : p.key === "ArrowLeft" ? (p.preventDefault(), c()) : p.key === "ArrowRight" ? (p.preventDefault(), d()) : p.key !== " " && p.key !== "Spacebar" && p.key !== "Space" || p.preventDefault();
  }, v = (p) => {
    p.target instanceof HTMLInputElement && l(p.target.value), d();
  };
  return (0, _.useEffect)(() => {
    o.length === 0 && s(0);
  }, [o]), r("div", Object.assign({ className: xe.passcodeInputWrapper }, { children: Array.from(Array(e)).map((p, S) => r(Rr, { name: "passcode", index: S, focus: i === S, digit: o[S], onKeyDown: h, onInput: v, onPaste: u, onFocus: () => ((E) => {
    s(E);
  })(S), disabled: n }, S)) }));
};
var hn = Y(489), Et = {};
Et.setAttributes = Ye(), Et.insert = (o) => {
  window._hankoStyle = o;
}, Et.domAPI = Ge(), Et.insertStyleElement = Xe(), Qe()(hn.A, Et);
const Hr = hn.A && hn.A.locals ? hn.A.locals : void 0, q = ({ children: o, hidden: e }) => e ? null : r("p", Object.assign({ part: "paragraph", className: Hr.paragraph }, { children: o }));
var Zt = function(o, e, t, n) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        c(n.next(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      try {
        c(n.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, d);
    }
    c((n = n.apply(o, [])).next());
  });
};
const Wr = (o) => {
  var e, t;
  const { t: n } = (0, _.useContext)(Z.TranslateContext), { flowState: i } = Le(o.state), { hanko: s, uiState: a, setUIState: d, setLoadingAction: c, setSucceededAction: l, stateHandler: u } = (0, _.useContext)(ue), [h, v] = (0, _.useState)(), [p, S] = (0, _.useState)(i.payload.resend_after), [E, C] = (0, _.useState)([]), x = (0, _.useMemo)(() => {
    var I;
    return ((I = i.error) === null || I === void 0 ? void 0 : I.code) === "passcode_max_attempts_reached";
  }, [i]), A = (0, _.useCallback)((I) => Zt(void 0, void 0, void 0, function* () {
    c("passcode-submit");
    const T = yield i.actions.verify_passcode({ code: I }).run();
    c(null), yield s.flow.run(T, u);
  }), [s, i, c, u]);
  return (0, _.useEffect)(() => {
    i.payload.passcode_resent && (l("passcode-resend"), setTimeout(() => l(null), 1e3));
  }, [i, l]), (0, _.useEffect)(() => {
    h <= 0 && a.succeededAction;
  }, [a, h]), (0, _.useEffect)(() => {
    const I = h > 0 && setInterval(() => v(h - 1), 1e3);
    return () => clearInterval(I);
  }, [h]), (0, _.useEffect)(() => {
    const I = p > 0 && setInterval(() => {
      S(p - 1);
    }, 1e3);
    return () => clearInterval(I);
  }, [p]), (0, _.useEffect)(() => {
    var I;
    p == 0 && ((I = i.error) === null || I === void 0 ? void 0 : I.code) == "rate_limit_exceeded" && d((T) => Object.assign(Object.assign({}, T), { error: null }));
  }, [p]), (0, _.useEffect)(() => {
    var I;
    ((I = i.error) === null || I === void 0 ? void 0 : I.code) === "passcode_invalid" && C([]), i.payload.resend_after >= 0 && S(i.payload.resend_after);
  }, [i]), r(O.Fragment, { children: [r(Ce, { children: [r(de, { children: n("headlines.loginPasscode") }), r(Ae, { state: i }), r(q, { children: a.email ? n("texts.enterPasscode", { emailAddress: a.email }) : n("texts.enterPasscodeNoEmail") }), r(ne, Object.assign({ onSubmit: (I) => Zt(void 0, void 0, void 0, function* () {
    return I.preventDefault(), A(E.join(""));
  }) }, { children: [r(ko, { onInput: (I) => {
    if (C(I), I.filter((T) => T !== "").length === 6) return A(I.join(""));
  }, passcodeDigits: E, numberOfInputs: 6, disabled: h <= 0 || x }), r(te, Object.assign({ disabled: h <= 0 || x, uiAction: "passcode-submit" }, { children: n("labels.continue") }))] }))] }), r(Te, { children: [r(ee, Object.assign({ hidden: !(!((t = (e = i.actions).back) === null || t === void 0) && t.call(e, null)), onClick: (I) => Zt(void 0, void 0, void 0, function* () {
    I.preventDefault(), c("back");
    const T = yield i.actions.back(null).run();
    c(null), yield s.flow.run(T, u);
  }), loadingSpinnerPosition: "right", isLoading: a.loadingAction === "back" }, { children: n("labels.back") })), r(ee, Object.assign({ uiAction: "passcode-resend", disabled: p > 0, onClick: (I) => Zt(void 0, void 0, void 0, function* () {
    I.preventDefault(), c("passcode-resend");
    const T = yield i.actions.resend_passcode(null).run();
    c(null), yield s.flow.run(T, u);
  }), loadingSpinnerPosition: "left" }, { children: p > 0 ? n("labels.passcodeResendAfter", { passcodeResendAfter: p }) : n("labels.sendNewPasscode") }))] })] });
};
var Hn = function(o, e, t, n) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        c(n.next(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      try {
        c(n.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, d);
    }
    c((n = n.apply(o, [])).next());
  });
};
const zr = (o) => {
  var e, t, n, i, s, a, d, c;
  const { t: l } = (0, _.useContext)(Z.TranslateContext), { hanko: u, setLoadingAction: h, stateHandler: v } = (0, _.useContext)(ue), { flowState: p } = Le(o.state);
  return r(O.Fragment, { children: [r(Ce, { children: [r(de, { children: l("headlines.registerAuthenticator") }), r(Ae, { state: p }), r(q, { children: l("texts.setupPasskey") }), r(ne, Object.assign({ onSubmit: (S) => Hn(void 0, void 0, void 0, function* () {
    S.preventDefault(), h("passkey-submit");
    const E = yield p.actions.webauthn_generate_creation_options(null).run();
    yield u.flow.run(E, v);
  }) }, { children: r(te, Object.assign({ uiAction: "passkey-submit", autofocus: !0, icon: "passkey" }, { children: l("labels.registerAuthenticator") })) }))] }), r(Te, Object.assign({ hidden: !(!((t = (e = p.actions).skip) === null || t === void 0) && t.call(e, null)) && !(!((i = (n = p.actions).back) === null || i === void 0) && i.call(n, null)) }, { children: [r(ee, Object.assign({ uiAction: "back", onClick: (S) => Hn(void 0, void 0, void 0, function* () {
    S.preventDefault(), h("back");
    const E = yield p.actions.back(null).run();
    h(null), yield u.flow.run(E, v);
  }), loadingSpinnerPosition: "right", hidden: !(!((a = (s = p.actions).back) === null || a === void 0) && a.call(s, null)) }, { children: l("labels.back") })), r(ee, Object.assign({ uiAction: "skip", onClick: (S) => Hn(void 0, void 0, void 0, function* () {
    S.preventDefault(), h("skip");
    const E = yield p.actions.skip(null).run();
    h(null), yield u.flow.run(E, v);
  }), loadingSpinnerPosition: "left", hidden: !(!((c = (d = p.actions).skip) === null || c === void 0) && c.call(d, null)) }, { children: l("labels.skip") }))] }))] });
};
var Pt = function(o, e, t, n) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        c(n.next(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      try {
        c(n.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, d);
    }
    c((n = n.apply(o, [])).next());
  });
};
const qr = (o) => {
  var e, t, n, i;
  const { t: s } = (0, _.useContext)(Z.TranslateContext), { hanko: a, stateHandler: d, setLoadingAction: c } = (0, _.useContext)(ue), { flowState: l } = Le(o.state), [u, h] = (0, _.useState)(), [v, p] = (0, _.useState)(), S = (A) => Pt(void 0, void 0, void 0, function* () {
    A.preventDefault(), c("password-recovery");
    const I = yield l.actions.continue_to_passcode_confirmation_recovery(null).run();
    c(null), yield a.flow.run(I, d);
  }), E = (A) => Pt(void 0, void 0, void 0, function* () {
    A.preventDefault(), c("choose-login-method");
    const I = yield l.actions.continue_to_login_method_chooser(null).run();
    c(null), yield a.flow.run(I, d);
  }), C = (0, _.useMemo)(() => {
    var A, I;
    return r(ee, Object.assign({ hidden: !(!((I = (A = l.actions).continue_to_passcode_confirmation_recovery) === null || I === void 0) && I.call(A, null)), uiAction: "password-recovery", onClick: S, loadingSpinnerPosition: "left" }, { children: s("labels.forgotYourPassword") }));
  }, [S, s]), x = (0, _.useMemo)(() => r(ee, Object.assign({ uiAction: "choose-login-method", onClick: E, loadingSpinnerPosition: "left" }, { children: "Choose another method" })), [E]);
  return (0, _.useEffect)(() => {
    const A = v > 0 && setInterval(() => p(v - 1), 1e3);
    return () => clearInterval(A);
  }, [v]), r(O.Fragment, { children: [r(Ce, { children: [r(de, { children: s("headlines.loginPassword") }), r(Ae, { state: l }), r(ne, Object.assign({ onSubmit: (A) => Pt(void 0, void 0, void 0, function* () {
    A.preventDefault(), c("password-submit");
    const I = yield l.actions.password_login({ password: u }).run();
    c(null), yield a.flow.run(I, d);
  }) }, { children: [r(qe, { type: "password", flowInput: l.actions.password_login(null).inputs.password, autocomplete: "current-password", placeholder: s("labels.password"), onInput: (A) => Pt(void 0, void 0, void 0, function* () {
    A.target instanceof HTMLInputElement && h(A.target.value);
  }), autofocus: !0 }), r(te, Object.assign({ uiAction: "password-submit", disabled: v > 0 }, { children: v > 0 ? s("labels.passwordRetryAfter", { passwordRetryAfter: v }) : s("labels.signIn") }))] })), !((t = (e = l.actions).continue_to_login_method_chooser) === null || t === void 0) && t.call(e, null) ? C : null] }), r(Te, { children: [r(ee, Object.assign({ uiAction: "back", onClick: (A) => Pt(void 0, void 0, void 0, function* () {
    A.preventDefault(), c("back");
    const I = yield l.actions.back(null).run();
    c(null), yield a.flow.run(I, d);
  }), loadingSpinnerPosition: "right" }, { children: s("labels.back") })), !((i = (n = l.actions).continue_to_login_method_chooser) === null || i === void 0) && i.call(n, null) ? x : C] })] });
};
var oi = function(o, e, t, n) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        c(n.next(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      try {
        c(n.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, d);
    }
    c((n = n.apply(o, [])).next());
  });
};
const Fr = (o) => {
  const { t: e } = (0, _.useContext)(Z.TranslateContext), { hanko: t, stateHandler: n, setLoadingAction: i } = (0, _.useContext)(ue), { flowState: s } = Le(o.state), [a, d] = (0, _.useState)();
  return r(Ce, { children: [r(de, { children: e("headlines.registerPassword") }), r(Ae, { state: s }), r(q, { children: e("texts.passwordFormatHint", { minLength: s.actions.password_recovery(null).inputs.new_password.min_length, maxLength: 72 }) }), r(ne, Object.assign({ onSubmit: (c) => oi(void 0, void 0, void 0, function* () {
    c.preventDefault(), i("password-submit");
    const l = yield s.actions.password_recovery({ new_password: a }).run();
    i(null), yield t.flow.run(l, n);
  }) }, { children: [r(qe, { type: "password", autocomplete: "new-password", flowInput: s.actions.password_recovery(null).inputs.new_password, placeholder: e("labels.newPassword"), onInput: (c) => oi(void 0, void 0, void 0, function* () {
    c.target instanceof HTMLInputElement && d(c.target.value);
  }), autofocus: !0 }), r(te, Object.assign({ uiAction: "password-submit" }, { children: e("labels.continue") }))] }))] });
};
var Jt = function(o, e, t, n) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        c(n.next(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      try {
        c(n.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, d);
    }
    c((n = n.apply(o, [])).next());
  });
};
const Kr = (o) => {
  var e, t, n, i, s, a;
  const { t: d } = (0, _.useContext)(Z.TranslateContext), { hanko: c, setLoadingAction: l, stateHandler: u, lastLogin: h } = (0, _.useContext)(ue), { flowState: v } = Le(o.state);
  return r(O.Fragment, { children: [r(Ce, { children: [r(de, { children: d("headlines.selectLoginMethod") }), r(Ae, { flowError: v == null ? void 0 : v.error }), r(q, { children: d("texts.howDoYouWantToLogin") }), r(ne, Object.assign({ hidden: !(!((t = (e = v.actions).continue_to_passcode_confirmation) === null || t === void 0) && t.call(e, null)), onSubmit: (p) => Jt(void 0, void 0, void 0, function* () {
    p.preventDefault(), l("passcode-submit");
    const S = yield v.actions.continue_to_passcode_confirmation(null).run();
    l(null), yield c.flow.run(S, u);
  }) }, { children: r(te, Object.assign({ secondary: !0, uiAction: "passcode-submit", icon: "mail" }, { children: d("labels.passcode") })) })), r(ne, Object.assign({ hidden: !(!((i = (n = v.actions).continue_to_password_login) === null || i === void 0) && i.call(n, null)), onSubmit: (p) => Jt(void 0, void 0, void 0, function* () {
    p.preventDefault(), l("password-submit");
    const S = yield v.actions.continue_to_password_login(null).run();
    l(null), yield c.flow.run(S, u);
  }) }, { children: r(te, Object.assign({ secondary: !0, uiAction: "password-submit", icon: "password" }, { children: d("labels.password") })) })), r(ne, Object.assign({ hidden: !(!((a = (s = v.actions).webauthn_generate_request_options) === null || a === void 0) && a.call(s, null)), onSubmit: (p) => Jt(void 0, void 0, void 0, function* () {
    p.preventDefault(), l("passkey-submit");
    const S = yield v.actions.webauthn_generate_request_options(null).run();
    l(null), yield c.flow.run(S, u);
  }) }, { children: r(te, Object.assign({ secondary: !0, uiAction: "passkey-submit", icon: "passkey" }, { children: d("labels.passkey") })) }))] }), r(Te, { children: r(ee, Object.assign({ uiAction: "back", onClick: (p) => Jt(void 0, void 0, void 0, function* () {
    p.preventDefault(), l("back");
    const S = yield v.actions.back(null).run();
    l(null), yield c.flow.run(S, u);
  }), loadingSpinnerPosition: "right" }, { children: d("labels.back") })) })] });
};
var Qt = function(o, e, t, n) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        c(n.next(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      try {
        c(n.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, d);
    }
    c((n = n.apply(o, [])).next());
  });
};
const Br = (o) => {
  var e, t, n, i, s, a, d;
  const { t: c } = (0, _.useContext)(Z.TranslateContext), { init: l, hanko: u, uiState: h, setUIState: v, stateHandler: p, setLoadingAction: S, initialComponentName: E } = (0, _.useContext)(ue), { flowState: C } = Le(o.state), x = (t = (e = C.actions).register_login_identifier) === null || t === void 0 ? void 0 : t.call(e, null).inputs, A = !(!(x != null && x.email) || !(x != null && x.username)), [I, T] = (0, _.useState)(void 0), [U, ie] = (0, _.useState)(null), [_e, se] = (0, _.useState)(!1), be = (0, _.useMemo)(() => {
    var M, z;
    return !!(!((z = (M = C.actions).thirdparty_oauth) === null || z === void 0) && z.call(M, null));
  }, [C.actions]);
  return (0, _.useEffect)(() => {
    const M = new URLSearchParams(window.location.search);
    if (M.get("error") == null || M.get("error").length === 0) return;
    let z = "";
    z = M.get("error") === "access_denied" ? "thirdPartyAccessDenied" : "somethingWentWrong";
    const ve = { name: z, code: z, message: M.get("error_description") };
    T(ve), M.delete("error"), M.delete("error_description"), history.replaceState(null, null, window.location.pathname + (M.size < 1 ? "" : `?${M.toString()}`));
  }, []), r(O.Fragment, { children: [r(Ce, { children: [r(de, { children: c("headlines.signUp") }), r(Ae, { state: C, error: I }), x ? r(O.Fragment, { children: [r(ne, Object.assign({ onSubmit: (M) => Qt(void 0, void 0, void 0, function* () {
    M.preventDefault(), S("email-submit");
    const z = yield C.actions.register_login_identifier({ email: h.email, username: h.username }).run();
    S(null), yield u.flow.run(z, p);
  }), maxWidth: !0 }, { children: [x.username ? r(qe, { markOptional: A, markError: A, type: "text", autoComplete: "username", autoCorrect: "off", flowInput: x.username, onInput: (M) => {
    if (M.preventDefault(), M.target instanceof HTMLInputElement) {
      const { value: z } = M.target;
      v((ve) => Object.assign(Object.assign({}, ve), { username: z }));
    }
  }, value: h.username, placeholder: c("labels.username") }) : null, x.email ? r(qe, { markOptional: A, markError: A, type: "email", autoComplete: "email", autoCorrect: "off", flowInput: x.email, onInput: (M) => {
    if (M.preventDefault(), M.target instanceof HTMLInputElement) {
      const { value: z } = M.target;
      v((ve) => Object.assign(Object.assign({}, ve), { email: z }));
    }
  }, value: h.email, placeholder: c("labels.email"), pattern: "^.*[^0-9]+$" }) : null, r(te, Object.assign({ uiAction: "email-submit", autofocus: !0 }, { children: c("labels.continue") }))] })), r(yo, Object.assign({ hidden: !be }, { children: c("labels.or") }))] }) : null, !((i = (n = C.actions).thirdparty_oauth) === null || i === void 0) && i.call(n, null) ? (s = C.actions.thirdparty_oauth(null).inputs.provider.allowed_values) === null || s === void 0 ? void 0 : s.map((M) => r(ne, Object.assign({ onSubmit: (z) => ((ve, je) => Qt(void 0, void 0, void 0, function* () {
    ve.preventDefault(), ie(je);
    const Oe = yield C.actions.thirdparty_oauth({ provider: je, redirect_to: window.location.toString() }).run();
    ie(null), yield u.flow.run(Oe, p);
  }))(z, M.value) }, { children: r(te, Object.assign({ isLoading: M.value == U, secondary: !0, icon: M.value.startsWith("custom_") ? "customProvider" : M.value }, { children: c("labels.signInWith", { provider: M.name }) })) }), M.value)) : null, ((d = (a = C.actions).remember_me) === null || d === void 0 ? void 0 : d.call(a, null)) && r(O.Fragment, { children: [r(An, {}), r(bo, { required: !1, type: "checkbox", label: c("labels.staySignedIn"), checked: _e, onChange: (M) => Qt(void 0, void 0, void 0, function* () {
    const z = yield C.actions.remember_me({ remember_me: !_e }).run();
    se((ve) => !ve), yield u.flow.run(z, p);
  }) })] })] }), r(Te, Object.assign({ hidden: E !== "auth" }, { children: [r("span", { hidden: !0 }), r(ee, Object.assign({ uiAction: "switch-flow", onClick: (M) => Qt(void 0, void 0, void 0, function* () {
    M.preventDefault(), l("login");
  }), loadingSpinnerPosition: "left" }, { children: c("labels.alreadyHaveAnAccount") }))] }))] });
};
var Gt = function(o, e, t, n) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        c(n.next(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      try {
        c(n.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, d);
    }
    c((n = n.apply(o, [])).next());
  });
};
const Vr = (o) => {
  var e, t, n, i, s, a, d, c;
  const { t: l } = (0, _.useContext)(Z.TranslateContext), { hanko: u, stateHandler: h, setLoadingAction: v } = (0, _.useContext)(ue), { flowState: p } = Le(o.state), [S, E] = (0, _.useState)();
  return r(O.Fragment, { children: [r(Ce, { children: [r(de, { children: l("headlines.registerPassword") }), r(Ae, { state: p }), r(q, { children: l("texts.passwordFormatHint", { minLength: p.actions.register_password(null).inputs.new_password.min_length, maxLength: 72 }) }), r(ne, Object.assign({ onSubmit: (C) => Gt(void 0, void 0, void 0, function* () {
    C.preventDefault(), v("password-submit");
    const x = yield p.actions.register_password({ new_password: S }).run();
    v(null), yield u.flow.run(x, h);
  }) }, { children: [r(qe, { type: "password", autocomplete: "new-password", flowInput: p.actions.register_password(null).inputs.new_password, placeholder: l("labels.newPassword"), onInput: (C) => Gt(void 0, void 0, void 0, function* () {
    C.target instanceof HTMLInputElement && E(C.target.value);
  }), autofocus: !0 }), r(te, Object.assign({ uiAction: "password-submit" }, { children: l("labels.continue") }))] }))] }), r(Te, Object.assign({ hidden: !(!((t = (e = p.actions).back) === null || t === void 0) && t.call(e, null)) && !(!((i = (n = p.actions).skip) === null || i === void 0) && i.call(n, null)) }, { children: [r(ee, Object.assign({ uiAction: "back", onClick: (C) => Gt(void 0, void 0, void 0, function* () {
    C.preventDefault(), v("back");
    const x = yield p.actions.back(null).run();
    v(null), yield u.flow.run(x, h);
  }), loadingSpinnerPosition: "right", hidden: !(!((a = (s = p.actions).back) === null || a === void 0) && a.call(s, null)) }, { children: l("labels.back") })), r(ee, Object.assign({ uiAction: "skip", onClick: (C) => Gt(void 0, void 0, void 0, function* () {
    C.preventDefault(), v("skip");
    const x = yield p.actions.skip(null).run();
    v(null), yield u.flow.run(x, h);
  }), loadingSpinnerPosition: "left", hidden: !(!((c = (d = p.actions).skip) === null || c === void 0) && c.call(d, null)) }, { children: l("labels.skip") }))] }))] });
};
var pn = Y(21), It = {};
It.setAttributes = Ye(), It.insert = (o) => {
  window._hankoStyle = o;
}, It.domAPI = Ge(), It.insertStyleElement = Xe(), Qe()(pn.A, It);
const Ke = pn.A && pn.A.locals ? pn.A.locals : void 0, On = function({ name: o, columnSelector: e, contentSelector: t, data: n, checkedItemID: i, setCheckedItemID: s, dropdown: a = !1 }) {
  const d = (0, _.useCallback)((u) => `${o}-${u}`, [o]), c = (0, _.useCallback)((u) => d(u) === i, [i, d]), l = (u) => {
    if (!(u.target instanceof HTMLInputElement)) return;
    const h = parseInt(u.target.value, 10), v = d(h);
    s(v === i ? null : v);
  };
  return r("div", Object.assign({ className: Ke.accordion }, { children: n.map((u, h) => r("div", Object.assign({ className: Ke.accordionItem }, { children: [r("input", { type: "radio", className: Ke.accordionInput, id: `${o}-${h}`, name: o, onClick: l, value: h, checked: c(h) }), r("label", Object.assign({ className: Q()(Ke.label, a && Ke.dropdown), for: `${o}-${h}` }, { children: r("span", Object.assign({ className: Ke.labelText }, { children: e(u, h) })) })), r("div", Object.assign({ className: Q()(Ke.accordionContent, a && Ke.dropdownContent) }, { children: t(u, h) }))] }), h)) }));
}, Me = ({ children: o }) => r("h2", Object.assign({ part: "headline2", className: Q()(_n.headline, _n.grade2) }, { children: o })), Zr = ({ onEmailDelete: o, onEmailSetPrimary: e, onEmailVerify: t, checkedItemID: n, setCheckedItemID: i, emails: s = [], deletableEmailIDs: a = [] }) => {
  const { t: d } = (0, _.useContext)(Z.TranslateContext), c = (0, _.useMemo)(() => !1, []);
  return r(On, { name: "email-edit-dropdown", columnSelector: (l) => {
    const u = r("span", Object.assign({ className: Ke.description }, { children: l.is_verified ? l.is_primary ? r(O.Fragment, { children: [" -", " ", d("labels.primaryEmail")] }) : null : r(O.Fragment, { children: [" -", " ", d("labels.unverifiedEmail")] }) }));
    return l.is_primary ? r(O.Fragment, { children: [r("b", { children: l.address }), u] }) : r(O.Fragment, { children: [l.address, u] });
  }, data: s, contentSelector: (l) => {
    var u;
    return r(O.Fragment, { children: [l.is_primary ? r(O.Fragment, { children: r(q, { children: [r(Me, { children: d("headlines.isPrimaryEmail") }), d("texts.isPrimaryEmail")] }) }) : r(O.Fragment, { children: r(q, { children: [r(Me, { children: d("headlines.setPrimaryEmail") }), d("texts.setPrimaryEmail"), r("br", {}), r(ee, Object.assign({ uiAction: "email-set-primary", onClick: (h) => e(h, l.id), loadingSpinnerPosition: "right" }, { children: d("labels.setAsPrimaryEmail") }))] }) }), l.is_verified ? r(O.Fragment, { children: r(q, { children: [r(Me, { children: d("headlines.emailVerified") }), d("texts.emailVerified")] }) }) : r(O.Fragment, { children: r(q, { children: [r(Me, { children: d("headlines.emailUnverified") }), d("texts.emailUnverified"), r("br", {}), r(ee, Object.assign({ uiAction: "email-verify", onClick: (h) => t(h, l.id), loadingSpinnerPosition: "right" }, { children: d("labels.verify") }))] }) }), a.includes(l.id) ? r(O.Fragment, { children: r(q, { children: [r(Me, { children: d("headlines.emailDelete") }), d("texts.emailDelete"), r("br", {}), r(ee, Object.assign({ uiAction: "email-delete", dangerous: !0, onClick: (h) => o(h, l.id), disabled: c, loadingSpinnerPosition: "right" }, { children: d("labels.delete") }))] }) }) : null, ((u = l.identities) === null || u === void 0 ? void 0 : u.length) > 0 ? r(O.Fragment, { children: r(q, { children: [r(Me, { children: d("headlines.connectedAccounts") }), l.identities.map((h) => h.provider).join(", ")] }) }) : null] });
  }, checkedItemID: n, setCheckedItemID: i });
}, Jr = ({ onCredentialNameSubmit: o, oldName: e, onBack: t, credential: n, credentialType: i }) => {
  const { t: s } = (0, _.useContext)(Z.TranslateContext), [a, d] = (0, _.useState)(e);
  return r(O.Fragment, { children: [r(Ce, { children: [r(de, { children: s(i === "security-key" ? "headlines.renameSecurityKey" : "headlines.renamePasskey") }), r(Ae, { flowError: null }), r(q, { children: s(i === "security-key" ? "texts.renameSecurityKey" : "texts.renamePasskey") }), r(ne, Object.assign({ onSubmit: (c) => o(c, n.id, a) }, { children: [r(qe, { type: "text", name: i, value: a, minLength: 3, maxLength: 32, required: !0, placeholder: s(i === "security-key" ? "labels.newSecurityKeyName" : "labels.newPasskeyName"), onInput: (c) => {
    return l = void 0, u = void 0, v = function* () {
      c.target instanceof HTMLInputElement && d(c.target.value);
    }, new ((h = void 0) || (h = Promise))(function(p, S) {
      function E(A) {
        try {
          x(v.next(A));
        } catch (I) {
          S(I);
        }
      }
      function C(A) {
        try {
          x(v.throw(A));
        } catch (I) {
          S(I);
        }
      }
      function x(A) {
        var I;
        A.done ? p(A.value) : (I = A.value, I instanceof h ? I : new h(function(T) {
          T(I);
        })).then(E, C);
      }
      x((v = v.apply(l, u || [])).next());
    });
    var l, u, h, v;
  }, autofocus: !0 }), r(te, Object.assign({ uiAction: "webauthn-credential-rename" }, { children: s("labels.save") }))] }))] }), r(Te, { children: r(ee, Object.assign({ onClick: t, loadingSpinnerPosition: "right" }, { children: s("labels.back") })) })] });
}, ii = ({ credentials: o = [], checkedItemID: e, setCheckedItemID: t, onBack: n, onCredentialNameSubmit: i, onCredentialDelete: s, allowCredentialDeletion: a, credentialType: d }) => {
  const { t: c } = (0, _.useContext)(Z.TranslateContext), { setPage: l } = (0, _.useContext)(ue), u = (v) => {
    if (v.name) return v.name;
    const p = v.public_key.replace(/[\W_]/g, "");
    return `${d === "security-key" ? "SecurityKey" : "Passkey"}-${p.substring(p.length - 7, p.length)}`;
  }, h = (v) => new Date(v).toLocaleString();
  return r(On, { name: d === "security-key" ? "security-key-edit-dropdown" : "passkey-edit-dropdown", columnSelector: (v) => u(v), data: o, contentSelector: (v) => r(O.Fragment, { children: [r(q, { children: [r(Me, { children: c(d === "security-key" ? "headlines.renameSecurityKey" : "headlines.renamePasskey") }), c(d === "security-key" ? "texts.renameSecurityKey" : "texts.renamePasskey"), r("br", {}), r(ee, Object.assign({ onClick: (p) => ((S, E, C) => {
    S.preventDefault(), l(r(Jr, { oldName: u(E), credential: E, credentialType: C, onBack: n, onCredentialNameSubmit: i }));
  })(p, v, d), loadingSpinnerPosition: "right" }, { children: c("labels.rename") }))] }), r(q, Object.assign({ hidden: !a }, { children: [r(Me, { children: c(d === "security-key" ? "headlines.deleteSecurityKey" : "headlines.deletePasskey") }), c(d === "security-key" ? "texts.deleteSecurityKey" : "texts.deletePasskey"), r("br", {}), r(ee, Object.assign({ uiAction: "password-delete", dangerous: !0, onClick: (p) => s(p, v.id), loadingSpinnerPosition: "right" }, { children: c("labels.delete") }))] })), r(q, { children: [r(Me, { children: c("headlines.lastUsedAt") }), v.last_used_at ? h(v.last_used_at) : "-"] }), r(q, { children: [r(Me, { children: c("headlines.createdAt") }), h(v.created_at)] })] }), checkedItemID: e, setCheckedItemID: t });
}, zt = ({ name: o, title: e, children: t, checkedItemID: n, setCheckedItemID: i }) => r(On, { dropdown: !0, name: o, columnSelector: () => e, contentSelector: () => r(O.Fragment, { children: t }), setCheckedItemID: i, checkedItemID: n, data: [{}] }), wo = ({ flowError: o }) => {
  const { t: e } = (0, _.useContext)(Z.TranslateContext);
  return r(O.Fragment, { children: o ? r("div", Object.assign({ className: Bi.errorMessage }, { children: e(`flowErrors.${o == null ? void 0 : o.code}`) })) : null });
}, Qr = ({ inputs: o, onEmailSubmit: e, checkedItemID: t, setCheckedItemID: n }) => {
  var i;
  const { t: s } = (0, _.useContext)(Z.TranslateContext), [a, d] = (0, _.useState)();
  return r(zt, Object.assign({ name: "email-create-dropdown", title: s("labels.addEmail"), checkedItemID: t, setCheckedItemID: n }, { children: [r(wo, { flowError: (i = o.email) === null || i === void 0 ? void 0 : i.error }), r(ne, Object.assign({ onSubmit: (c) => e(c, a).then(() => d("")) }, { children: [r(qe, { markError: !0, type: "email", placeholder: s("labels.newEmailAddress"), onInput: (c) => {
    c.preventDefault(), c.target instanceof HTMLInputElement && d(c.target.value);
  }, value: a, flowInput: o.email }), r(te, Object.assign({ uiAction: "email-submit" }, { children: s("labels.save") }))] }))] }));
}, si = ({ inputs: o, checkedItemID: e, setCheckedItemID: t, onPasswordSubmit: n, onPasswordDelete: i, allowPasswordDelete: s, passwordExists: a }) => {
  var d, c, l;
  const { t: u } = (0, _.useContext)(Z.TranslateContext), [h, v] = (0, _.useState)("");
  return r(zt, Object.assign({ name: "password-edit-dropdown", title: u(a ? "labels.changePassword" : "labels.setPassword"), checkedItemID: e, setCheckedItemID: t }, { children: [r(q, { children: u("texts.passwordFormatHint", { minLength: (d = o.password.min_length) === null || d === void 0 ? void 0 : d.toString(10), maxLength: (c = o.password.max_length) === null || c === void 0 ? void 0 : c.toString(10) }) }), r(wo, { flowError: (l = o.password) === null || l === void 0 ? void 0 : l.error }), r(ne, Object.assign({ onSubmit: (p) => n(p, h).then(() => v("")) }, { children: [r(qe, { markError: !0, autoComplete: "new-password", placeholder: u("labels.newPassword"), type: "password", onInput: (p) => {
    p.preventDefault(), p.target instanceof HTMLInputElement && v(p.target.value);
  }, value: h, flowInput: o.password }), r(te, Object.assign({ uiAction: "password-submit" }, { children: u("labels.save") }))] })), r(ee, Object.assign({ hidden: !s, uiAction: "password-delete", dangerous: !0, onClick: (p) => i(p).then(() => v("")), loadingSpinnerPosition: "right" }, { children: u("labels.delete") }))] }));
}, ri = ({ checkedItemID: o, setCheckedItemID: e, onCredentialSubmit: t, credentialType: n }) => {
  const { t: i } = (0, _.useContext)(Z.TranslateContext), s = ht.supported();
  return r(zt, Object.assign({ name: n === "security-key" ? "security-key-create-dropdown" : "passkey-create-dropdown", title: i(n === "security-key" ? "labels.createSecurityKey" : "labels.createPasskey"), checkedItemID: o, setCheckedItemID: e }, { children: [r(q, { children: i(n === "security-key" ? "texts.securityKeySetUp" : "texts.setupPasskey") }), r(ne, Object.assign({ onSubmit: t }, { children: r(te, Object.assign({ uiAction: n === "security-key" ? "security-key-submit" : "passkey-submit", title: s ? null : i("labels.webauthnUnsupported") }, { children: i(n === "security-key" ? "labels.createSecurityKey" : "labels.createPasskey") })) }))] }));
}, ai = ({ inputs: o, checkedItemID: e, setCheckedItemID: t, onUsernameSubmit: n, onUsernameDelete: i, hasUsername: s, allowUsernameDeletion: a }) => {
  var d;
  const { t: c } = (0, _.useContext)(Z.TranslateContext), [l, u] = (0, _.useState)();
  return r(zt, Object.assign({ name: "username-edit-dropdown", title: c(s ? "labels.changeUsername" : "labels.setUsername"), checkedItemID: e, setCheckedItemID: t }, { children: [r(wo, { flowError: (d = o.username) === null || d === void 0 ? void 0 : d.error }), r(ne, Object.assign({ onSubmit: (h) => n(h, l).then(() => u("")) }, { children: [r(qe, { markError: !0, placeholder: c("labels.username"), type: "text", onInput: (h) => {
    h.preventDefault(), h.target instanceof HTMLInputElement && u(h.target.value);
  }, value: l, flowInput: o.username }), r(te, Object.assign({ uiAction: "username-set" }, { children: c("labels.save") }))] })), r(ee, Object.assign({ hidden: !a, uiAction: "username-delete", dangerous: !0, onClick: (h) => i(h).then(() => u("")), loadingSpinnerPosition: "right" }, { children: c("labels.delete") }))] }));
}, Gr = ({ onBack: o, onAccountDelete: e }) => {
  const { t } = (0, _.useContext)(Z.TranslateContext);
  return r(O.Fragment, { children: [r(Ce, { children: [r(de, { children: t("headlines.deleteAccount") }), r(Ae, { flowError: null }), r(q, { children: t("texts.deleteAccount") }), r(ne, Object.assign({ onSubmit: e }, { children: [r(bo, { required: !0, type: "checkbox", label: t("labels.deleteAccount") }), r(te, Object.assign({ uiAction: "account_delete" }, { children: t("labels.delete") }))] }))] }), r(Te, { children: r(ee, Object.assign({ onClick: o }, { children: t("labels.back") })) })] });
}, Yr = ({ sessions: o = [], checkedItemID: e, setCheckedItemID: t, onSessionDelete: n, deletableSessionIDs: i }) => {
  const { t: s } = (0, _.useContext)(Z.TranslateContext), a = (d) => new Date(d).toLocaleString();
  return r(On, { name: "session-edit-dropdown", columnSelector: (d) => {
    const c = r("b", { children: d.user_agent ? d.user_agent : d.id }), l = d.current ? r("span", Object.assign({ className: Ke.description }, { children: r(O.Fragment, { children: [" -", " ", s("labels.currentSession")] }) })) : null;
    return r(O.Fragment, { children: [c, l] });
  }, data: o, contentSelector: (d) => r(O.Fragment, { children: [r(q, Object.assign({ hidden: !d.ip_address }, { children: [r(Me, { children: s("headlines.ipAddress") }), d.ip_address] })), r(q, { children: [r(Me, { children: s("headlines.lastUsed") }), a(d.last_used)] }), r(q, { children: [r(Me, { children: s("headlines.createdAt") }), a(d.created_at)] }), i != null && i.includes(d.id) ? r(q, { children: [r(Me, { children: s("headlines.revokeSession") }), r(ee, Object.assign({ uiAction: "session-delete", dangerous: !0, onClick: (c) => n(c, d.id), loadingSpinnerPosition: "right" }, { children: s("labels.revoke") }))] }) : null] }), checkedItemID: e, setCheckedItemID: t });
}, Xr = ({ checkedItemID: o, setCheckedItemID: e, onDelete: t, onConnect: n, authAppSetUp: i, allowDeletion: s }) => {
  const { t: a } = (0, _.useContext)(Z.TranslateContext), d = r("span", Object.assign({ className: Ke.description }, { children: i ? r(O.Fragment, { children: [" -", " ", a("labels.configured")] }) : null })), c = r(O.Fragment, { children: [a("labels.authenticatorAppManage"), " ", d] });
  return r(zt, Object.assign({ name: "authenticator-app-manage-dropdown", title: c, checkedItemID: o, setCheckedItemID: e }, { children: [r(Me, { children: a(i ? "headlines.authenticatorAppAlreadySetUp" : "headlines.authenticatorAppNotSetUp") }), r(q, { children: [a(i ? "texts.authenticatorAppAlreadySetUp" : "texts.authenticatorAppNotSetUp"), r("br", {}), r(ee, i ? Object.assign({ hidden: !s, uiAction: "auth-app-remove", onClick: (l) => t(l), loadingSpinnerPosition: "right", dangerous: !0 }, { children: a("labels.delete") }) : Object.assign({ uiAction: "auth-app-add", onClick: (l) => n(l), loadingSpinnerPosition: "right" }, { children: a("labels.authenticatorAppAdd") }))] })] }));
};
var Pe = function(o, e, t, n) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        c(n.next(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      try {
        c(n.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, d);
    }
    c((n = n.apply(o, [])).next());
  });
};
const Vi = (o) => {
  var e, t, n, i, s, a, d, c, l, u, h, v, p, S, E, C, x, A, I, T, U, ie, _e, se, be, M, z, ve, je, Oe, De, re, ae, he, Ee, k, f, y, L, K, pe, Re, He, We, m, g, b, D, N, j, W, X;
  const { t: G } = (0, _.useContext)(Z.TranslateContext), { hanko: ge, setLoadingAction: w, stateHandler: ye, setUIState: J, setPage: R } = (0, _.useContext)(ue), { flowState: P } = Le(o.state), [ke, B] = (0, _.useState)(""), F = (H, V, Ve) => Pe(void 0, void 0, void 0, function* () {
    H.preventDefault(), w(V);
    const En = yield Ve();
    En != null && En.error || (B(null), yield new Promise((es) => setTimeout(es, 360))), w(null), yield ge.flow.run(En, ye);
  }), Ne = (H) => Pe(void 0, void 0, void 0, function* () {
    return F(H, "password-delete", P.actions.password_delete(null).run);
  }), et = (H) => Pe(void 0, void 0, void 0, function* () {
    return F(H, "username-delete", P.actions.username_delete(null).run);
  }), fe = (H, V, Ve) => Pe(void 0, void 0, void 0, function* () {
    return F(H, "webauthn-credential-rename", P.actions.webauthn_credential_rename({ passkey_id: V, passkey_name: Ve }).run);
  }), Ft = (H) => Pe(void 0, void 0, void 0, function* () {
    return F(H, "account_delete", P.actions.account_delete(null).run);
  }), tt = (H) => (H.preventDefault(), R(r(Vi, { state: P, enablePasskeys: o.enablePasskeys })), Promise.resolve());
  return r(Ce, { children: [r(Ae, { state: ((e = P == null ? void 0 : P.error) === null || e === void 0 ? void 0 : e.code) !== "form_data_invalid_error" ? P : null }), !((n = (t = P.actions).username_create) === null || n === void 0) && n.call(t, null) || !((s = (i = P.actions).username_update) === null || s === void 0) && s.call(i, null) || !((d = (a = P.actions).username_delete) === null || d === void 0) && d.call(a, null) ? r(O.Fragment, { children: [r(de, { children: G("labels.username") }), P.payload.user.username ? r(q, { children: r("b", { children: P.payload.user.username.username }) }) : null, r(q, { children: [!((l = (c = P.actions).username_create) === null || l === void 0) && l.call(c, null) ? r(ai, { inputs: P.actions.username_create(null).inputs, hasUsername: !!P.payload.user.username, allowUsernameDeletion: !!(!((h = (u = P.actions).username_delete) === null || h === void 0) && h.call(u, null)), onUsernameSubmit: (H, V) => Pe(void 0, void 0, void 0, function* () {
    return F(H, "username-set", P.actions.username_create({ username: V }).run);
  }), onUsernameDelete: et, checkedItemID: ke, setCheckedItemID: B }) : null, !((p = (v = P.actions).username_update) === null || p === void 0) && p.call(v, null) ? r(ai, { inputs: P.actions.username_update(null).inputs, hasUsername: !!P.payload.user.username, allowUsernameDeletion: !!(!((E = (S = P.actions).username_delete) === null || E === void 0) && E.call(S, null)), onUsernameSubmit: (H, V) => Pe(void 0, void 0, void 0, function* () {
    return F(H, "username-set", P.actions.username_update({ username: V }).run);
  }), onUsernameDelete: et, checkedItemID: ke, setCheckedItemID: B }) : null] })] }) : null, !((x = (C = P.payload) === null || C === void 0 ? void 0 : C.user) === null || x === void 0) && x.emails || !((I = (A = P.actions).email_create) === null || I === void 0) && I.call(A, null) ? r(O.Fragment, { children: [r(de, { children: G("headlines.profileEmails") }), r(q, { children: [r(Zr, { emails: P.payload.user.emails, onEmailDelete: (H, V) => Pe(void 0, void 0, void 0, function* () {
    return F(H, "email-delete", P.actions.email_delete({ email_id: V }).run);
  }), onEmailSetPrimary: (H, V) => Pe(void 0, void 0, void 0, function* () {
    return F(H, "email-set-primary", P.actions.email_set_primary({ email_id: V }).run);
  }), onEmailVerify: (H, V) => Pe(void 0, void 0, void 0, function* () {
    return F(H, "email-verify", P.actions.email_verify({ email_id: V }).run);
  }), checkedItemID: ke, setCheckedItemID: B, deletableEmailIDs: (ie = (U = (T = P.actions).email_delete) === null || U === void 0 ? void 0 : U.call(T, null).inputs.email_id.allowed_values) === null || ie === void 0 ? void 0 : ie.map((H) => H.value) }), !((se = (_e = P.actions).email_create) === null || se === void 0) && se.call(_e, null) ? r(Qr, { inputs: P.actions.email_create(null).inputs, onEmailSubmit: (H, V) => Pe(void 0, void 0, void 0, function* () {
    return J((Ve) => Object.assign(Object.assign({}, Ve), { email: V })), F(H, "email-submit", P.actions.email_create({ email: V }).run);
  }), checkedItemID: ke, setCheckedItemID: B }) : null] })] }) : null, !((M = (be = P.actions).password_create) === null || M === void 0) && M.call(be, null) ? r(O.Fragment, { children: [r(de, { children: G("headlines.profilePassword") }), r(q, { children: r(si, { inputs: P.actions.password_create(null).inputs, onPasswordSubmit: (H, V) => Pe(void 0, void 0, void 0, function* () {
    return F(H, "password-submit", P.actions.password_create({ password: V }).run);
  }), onPasswordDelete: Ne, checkedItemID: ke, setCheckedItemID: B }) })] }) : null, !((ve = (z = P.actions).password_update) === null || ve === void 0) && ve.call(z, null) ? r(O.Fragment, { children: [r(de, { children: G("headlines.profilePassword") }), r(q, { children: r(si, { allowPasswordDelete: !!(!((Oe = (je = P.actions).password_delete) === null || Oe === void 0) && Oe.call(je, null)), inputs: P.actions.password_update(null).inputs, onPasswordSubmit: (H, V) => Pe(void 0, void 0, void 0, function* () {
    return F(H, "password-submit", P.actions.password_update({ password: V }).run);
  }), onPasswordDelete: Ne, checkedItemID: ke, setCheckedItemID: B, passwordExists: !0 }) })] }) : null, o.enablePasskeys && (!((re = (De = P.payload) === null || De === void 0 ? void 0 : De.user) === null || re === void 0) && re.passkeys || !((he = (ae = P.actions).webauthn_credential_create) === null || he === void 0) && he.call(ae, null)) ? r(O.Fragment, { children: [r(de, { children: G("headlines.profilePasskeys") }), r(q, { children: [r(ii, { onBack: tt, onCredentialNameSubmit: fe, onCredentialDelete: (H, V) => Pe(void 0, void 0, void 0, function* () {
    return F(H, "passkey-delete", P.actions.webauthn_credential_delete({ passkey_id: V }).run);
  }), credentials: P.payload.user.passkeys, setError: null, checkedItemID: ke, setCheckedItemID: B, allowCredentialDeletion: !!(!((k = (Ee = P.actions).webauthn_credential_delete) === null || k === void 0) && k.call(Ee, null)), credentialType: "passkey" }), !((y = (f = P.actions).webauthn_credential_create) === null || y === void 0) && y.call(f, null) ? r(ri, { credentialType: "passkey", onCredentialSubmit: (H) => Pe(void 0, void 0, void 0, function* () {
    return F(H, "passkey-submit", P.actions.webauthn_credential_create(null).run);
  }), setError: null, checkedItemID: ke, setCheckedItemID: B }) : null] })] }) : null, !((L = P.payload.user.mfa_config) === null || L === void 0) && L.security_keys_enabled ? r(O.Fragment, { children: [r(de, { children: G("headlines.securityKeys") }), r(q, { children: [r(ii, { onBack: tt, onCredentialNameSubmit: fe, onCredentialDelete: (H, V) => Pe(void 0, void 0, void 0, function* () {
    return F(H, "security-key-delete", P.actions.security_key_delete({ security_key_id: V }).run);
  }), credentials: P.payload.user.security_keys, setError: null, checkedItemID: ke, setCheckedItemID: B, allowCredentialDeletion: !!(!((pe = (K = P.actions).security_key_delete) === null || pe === void 0) && pe.call(K, null)), credentialType: "security-key" }), !((He = (Re = P.actions).security_key_create) === null || He === void 0) && He.call(Re, null) ? r(ri, { credentialType: "security-key", onCredentialSubmit: (H) => Pe(void 0, void 0, void 0, function* () {
    return F(H, "security-key-submit", P.actions.security_key_create(null).run);
  }), setError: null, checkedItemID: ke, setCheckedItemID: B }) : null] })] }) : null, !((We = P.payload.user.mfa_config) === null || We === void 0) && We.totp_enabled ? r(O.Fragment, { children: [r(de, { children: G("headlines.authenticatorApp") }), r(q, { children: r(Xr, { onConnect: (H) => Pe(void 0, void 0, void 0, function* () {
    return F(H, "auth-app-add", P.actions.continue_to_otp_secret_creation(null).run);
  }), onDelete: (H) => Pe(void 0, void 0, void 0, function* () {
    return F(H, "auth-app-remove", P.actions.otp_secret_delete(null).run);
  }), allowDeletion: !!(!((g = (m = P.actions).otp_secret_delete) === null || g === void 0) && g.call(m, null)), authAppSetUp: (b = P.payload.user.mfa_config) === null || b === void 0 ? void 0 : b.auth_app_set_up, checkedItemID: ke, setCheckedItemID: B }) })] }) : null, P.payload.sessions ? r(O.Fragment, { children: [r(de, { children: G("headlines.profileSessions") }), r(q, { children: r(Yr, { sessions: P.payload.sessions, setError: null, checkedItemID: ke, setCheckedItemID: B, onSessionDelete: (H, V) => Pe(void 0, void 0, void 0, function* () {
    return F(H, "session-delete", P.actions.session_delete({ session_id: V }).run);
  }), deletableSessionIDs: (j = (N = (D = P.actions).session_delete) === null || N === void 0 ? void 0 : N.call(D, null).inputs.session_id.allowed_values) === null || j === void 0 ? void 0 : j.map((H) => H.value) }) })] }) : null, !((X = (W = P.actions).account_delete) === null || X === void 0) && X.call(W, null) ? r(O.Fragment, { children: [r(An, {}), r(q, { children: r(yo, {}) }), r(q, { children: r(ne, Object.assign({ onSubmit: (H) => (H.preventDefault(), R(r(Gr, { onBack: tt, onAccountDelete: Ft })), Promise.resolve()) }, { children: r(te, Object.assign({ dangerous: !0 }, { children: G("headlines.deleteAccount") })) })) })] }) : null] });
}, ea = Vi, li = ({ state: o, error: e }) => {
  const { t } = (0, _.useContext)(Z.TranslateContext), { init: n, componentName: i } = (0, _.useContext)(ue), s = (0, _.useCallback)(() => n(i), [i, n]);
  return (0, _.useEffect)(() => (addEventListener("hankoAuthSuccess", s), () => {
    removeEventListener("hankoAuthSuccess", s);
  }), [s]), r(Ce, { children: [r(de, { children: t("headlines.error") }), r(Ae, { state: o, error: e }), r(ne, Object.assign({ onSubmit: (a) => {
    a.preventDefault(), s();
  } }, { children: r(te, Object.assign({ uiAction: "retry" }, { children: t("labels.continue") })) }))] });
};
var Wn = function(o, e, t, n) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        c(n.next(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      try {
        c(n.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, d);
    }
    c((n = n.apply(o, [])).next());
  });
};
const ta = (o) => {
  var e, t, n, i;
  const { t: s } = (0, _.useContext)(Z.TranslateContext), { hanko: a, stateHandler: d, setLoadingAction: c } = (0, _.useContext)(ue), { flowState: l } = Le(o.state), [u, h] = (0, _.useState)();
  return r(O.Fragment, { children: [r(Ce, { children: [r(de, { children: s("headlines.createEmail") }), r(Ae, { state: l }), r(ne, Object.assign({ onSubmit: (v) => Wn(void 0, void 0, void 0, function* () {
    v.preventDefault(), c("email-submit");
    const p = yield l.actions.email_address_set({ email: u }).run();
    c(null), yield a.flow.run(p, d);
  }) }, { children: [r(qe, { type: "email", autoComplete: "email", autoCorrect: "off", flowInput: (t = (e = l.actions).email_address_set) === null || t === void 0 ? void 0 : t.call(e, null).inputs.email, onInput: (v) => Wn(void 0, void 0, void 0, function* () {
    v.target instanceof HTMLInputElement && h(v.target.value);
  }), placeholder: s("labels.email"), pattern: "^.*[^0-9]+$", value: u }), r(te, Object.assign({ uiAction: "email-submit" }, { children: s("labels.continue") }))] }))] }), r(Te, Object.assign({ hidden: !(!((i = (n = l.actions).skip) === null || i === void 0) && i.call(n, null)) }, { children: [r("span", { hidden: !0 }), r(ee, Object.assign({ uiAction: "skip", onClick: (v) => Wn(void 0, void 0, void 0, function* () {
    v.preventDefault(), c("skip");
    const p = yield l.actions.skip(null).run();
    c(null), yield a.flow.run(p, d);
  }), loadingSpinnerPosition: "left" }, { children: s("labels.skip") }))] }))] });
};
var zn = function(o, e, t, n) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        c(n.next(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      try {
        c(n.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, d);
    }
    c((n = n.apply(o, [])).next());
  });
};
const na = (o) => {
  var e, t, n, i;
  const { t: s } = (0, _.useContext)(Z.TranslateContext), { hanko: a, stateHandler: d, setLoadingAction: c } = (0, _.useContext)(ue), { flowState: l } = Le(o.state), [u, h] = (0, _.useState)();
  return r(O.Fragment, { children: [r(Ce, { children: [r(de, { children: s("headlines.createUsername") }), r(Ae, { state: l }), r(ne, Object.assign({ onSubmit: (v) => zn(void 0, void 0, void 0, function* () {
    v.preventDefault(), c("username-set");
    const p = yield l.actions.username_create({ username: u }).run();
    c(null), yield a.flow.run(p, d);
  }) }, { children: [r(qe, { type: "text", autoComplete: "username", autoCorrect: "off", flowInput: (t = (e = l.actions).username_create) === null || t === void 0 ? void 0 : t.call(e, null).inputs.username, onInput: (v) => zn(void 0, void 0, void 0, function* () {
    v.target instanceof HTMLInputElement && h(v.target.value);
  }), value: u, placeholder: s("labels.username") }), r(te, Object.assign({ uiAction: "username-set" }, { children: s("labels.continue") }))] }))] }), r(Te, Object.assign({ hidden: !(!((i = (n = l.actions).skip) === null || i === void 0) && i.call(n, null)) }, { children: [r("span", { hidden: !0 }), r(ee, Object.assign({ uiAction: "skip", onClick: (v) => zn(void 0, void 0, void 0, function* () {
    v.preventDefault(), c("skip");
    const p = yield l.actions.skip(null).run();
    c(null), yield a.flow.run(p, d);
  }), loadingSpinnerPosition: "left" }, { children: s("labels.skip") }))] }))] });
};
var Yt = function(o, e, t, n) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        c(n.next(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      try {
        c(n.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, d);
    }
    c((n = n.apply(o, [])).next());
  });
};
const oa = (o) => {
  var e, t, n, i, s, a, d, c, l, u, h, v;
  const { t: p } = (0, _.useContext)(Z.TranslateContext), { hanko: S, setLoadingAction: E, stateHandler: C } = (0, _.useContext)(ue), { flowState: x } = Le(o.state);
  return r(O.Fragment, { children: [r(Ce, { children: [r(de, { children: p("headlines.setupLoginMethod") }), r(Ae, { flowError: x == null ? void 0 : x.error }), r(q, { children: p("texts.selectLoginMethodForFutureLogins") }), r(ne, Object.assign({ hidden: !(!((t = (e = x.actions).continue_to_passkey_registration) === null || t === void 0) && t.call(e, null)), onSubmit: (A) => Yt(void 0, void 0, void 0, function* () {
    A.preventDefault(), E("passkey-submit");
    const I = yield x.actions.continue_to_passkey_registration(null).run();
    E(null), yield S.flow.run(I, C);
  }) }, { children: r(te, Object.assign({ secondary: !0, uiAction: "passkey-submit", icon: "passkey" }, { children: p("labels.passkey") })) })), r(ne, Object.assign({ hidden: !(!((i = (n = x.actions).continue_to_password_registration) === null || i === void 0) && i.call(n, null)), onSubmit: (A) => Yt(void 0, void 0, void 0, function* () {
    A.preventDefault(), E("password-submit");
    const I = yield x.actions.continue_to_password_registration(null).run();
    E(null), yield S.flow.run(I, C);
  }) }, { children: r(te, Object.assign({ secondary: !0, uiAction: "password-submit", icon: "password" }, { children: p("labels.password") })) }))] }), r(Te, Object.assign({ hidden: !(!((a = (s = x.actions).back) === null || a === void 0) && a.call(s, null)) && !(!((c = (d = x.actions).skip) === null || c === void 0) && c.call(d, null)) }, { children: [r(ee, Object.assign({ uiAction: "back", onClick: (A) => Yt(void 0, void 0, void 0, function* () {
    A.preventDefault(), E("back");
    const I = yield x.actions.back(null).run();
    E(null), yield S.flow.run(I, C);
  }), loadingSpinnerPosition: "right", hidden: !(!((u = (l = x.actions).back) === null || u === void 0) && u.call(l, null)) }, { children: p("labels.back") })), r(ee, Object.assign({ uiAction: "skip", onClick: (A) => Yt(void 0, void 0, void 0, function* () {
    A.preventDefault(), E("skip");
    const I = yield x.actions.skip(null).run();
    E(null), yield S.flow.run(I, C);
  }), loadingSpinnerPosition: "left", hidden: !(!((v = (h = x.actions).skip) === null || v === void 0) && v.call(h, null)) }, { children: p("labels.skip") }))] }))] });
};
var qn = function(o, e, t, n) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        c(n.next(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      try {
        c(n.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, d);
    }
    c((n = n.apply(o, [])).next());
  });
};
const ia = (o) => {
  var e, t, n, i;
  const { t: s } = (0, _.useContext)(Z.TranslateContext), { flowState: a } = Le(o.state), { hanko: d, setLoadingAction: c, stateHandler: l } = (0, _.useContext)(ue), [u, h] = (0, _.useState)([]), v = (0, _.useCallback)((p) => qn(void 0, void 0, void 0, function* () {
    c("passcode-submit");
    const S = yield a.actions.otp_code_validate({ otp_code: p }).run();
    c(null), yield d.flow.run(S, l);
  }), [d, a, c, l]);
  return (0, _.useEffect)(() => {
    var p;
    ((p = a.error) === null || p === void 0 ? void 0 : p.code) === "passcode_invalid" && h([]);
  }, [a]), r(O.Fragment, { children: [r(Ce, { children: [r(de, { children: s("headlines.otpLogin") }), r(Ae, { state: a }), r(q, { children: s("texts.otpLogin") }), r(ne, Object.assign({ onSubmit: (p) => qn(void 0, void 0, void 0, function* () {
    return p.preventDefault(), v(u.join(""));
  }) }, { children: [r(ko, { onInput: (p) => {
    if (h(p), p.filter((S) => S !== "").length === 6) return v(p.join(""));
  }, passcodeDigits: u, numberOfInputs: 6 }), r(te, Object.assign({ uiAction: "passcode-submit" }, { children: s("labels.continue") }))] }))] }), r(Te, Object.assign({ hidden: !(!((t = (e = a.actions).continue_to_login_security_key) === null || t === void 0) && t.call(e, null)) }, { children: r(ee, Object.assign({ uiAction: "skip", onClick: (p) => qn(void 0, void 0, void 0, function* () {
    p.preventDefault(), c("skip");
    const S = yield a.actions.continue_to_login_security_key(null).run();
    c(null), yield d.flow.run(S, l);
  }), loadingSpinnerPosition: "right", hidden: !(!((i = (n = a.actions).continue_to_login_security_key) === null || i === void 0) && i.call(n, null)) }, { children: s("labels.useAnotherMethod") })) }))] });
};
var ci = function(o, e, t, n) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        c(n.next(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      try {
        c(n.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, d);
    }
    c((n = n.apply(o, [])).next());
  });
};
const sa = (o) => {
  var e, t, n, i;
  const { t: s } = (0, _.useContext)(Z.TranslateContext), { hanko: a, setLoadingAction: d, stateHandler: c } = (0, _.useContext)(ue), { flowState: l } = Le(o.state);
  return r(O.Fragment, { children: [r(Ce, { children: [r(de, { children: s("headlines.securityKeyLogin") }), r(Ae, { state: l }), r(q, { children: s("texts.securityKeyLogin") }), r(ne, Object.assign({ onSubmit: (u) => ci(void 0, void 0, void 0, function* () {
    u.preventDefault(), d("passkey-submit");
    const h = yield l.actions.webauthn_generate_request_options(null).run();
    yield a.flow.run(h, c);
  }) }, { children: r(te, Object.assign({ uiAction: "passkey-submit", autofocus: !0, icon: "securityKey" }, { children: s("labels.securityKeyUse") })) }))] }), r(Te, Object.assign({ hidden: !(!((t = (e = l.actions).continue_to_login_otp) === null || t === void 0) && t.call(e, null)) }, { children: r(ee, Object.assign({ uiAction: "skip", onClick: (u) => ci(void 0, void 0, void 0, function* () {
    u.preventDefault(), d("skip");
    const h = yield l.actions.continue_to_login_otp(null).run();
    d(null), yield a.flow.run(h, c);
  }), loadingSpinnerPosition: "right", hidden: !(!((i = (n = l.actions).continue_to_login_otp) === null || i === void 0) && i.call(n, null)) }, { children: s("labels.useAnotherMethod") })) }))] });
};
var Xt = function(o, e, t, n) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        c(n.next(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      try {
        c(n.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, d);
    }
    c((n = n.apply(o, [])).next());
  });
};
const ra = (o) => {
  var e, t, n, i, s, a, d, c;
  const { t: l } = (0, _.useContext)(Z.TranslateContext), { hanko: u, setLoadingAction: h, stateHandler: v } = (0, _.useContext)(ue), { flowState: p } = Le(o.state), S = (x) => Xt(void 0, void 0, void 0, function* () {
    x.preventDefault(), h("passcode-submit");
    const A = yield p.actions.continue_to_security_key_creation(null).run();
    h(null), yield u.flow.run(A, v);
  }), E = (x) => Xt(void 0, void 0, void 0, function* () {
    x.preventDefault(), h("password-submit");
    const A = yield p.actions.continue_to_otp_secret_creation(null).run();
    h(null), yield u.flow.run(A, v);
  }), C = (0, _.useMemo)(() => {
    const { actions: x } = p;
    return x.continue_to_security_key_creation && !x.continue_to_otp_secret_creation ? S : !x.continue_to_security_key_creation && x.continue_to_otp_secret_creation ? E : void 0;
  }, [p, S, E]);
  return r(O.Fragment, { children: [r(Ce, { children: [r(de, { children: l("headlines.mfaSetUp") }), r(Ae, { flowError: p == null ? void 0 : p.error }), r(q, { children: l("texts.mfaSetUp") }), C ? r(ne, Object.assign({ onSubmit: C }, { children: r(te, Object.assign({ uiAction: "passcode-submit" }, { children: l("labels.continue") })) })) : r(O.Fragment, { children: [r(ne, Object.assign({ hidden: !(!((t = (e = p.actions).continue_to_security_key_creation) === null || t === void 0) && t.call(e, null)), onSubmit: S }, { children: r(te, Object.assign({ secondary: !0, uiAction: "passcode-submit", icon: "securityKey" }, { children: l("labels.securityKey") })) })), r(ne, Object.assign({ hidden: !(!((i = (n = p.actions).continue_to_otp_secret_creation) === null || i === void 0) && i.call(n, null)), onSubmit: E }, { children: r(te, Object.assign({ secondary: !0, uiAction: "password-submit", icon: "qrCodeScanner" }, { children: l("labels.authenticatorApp") })) }))] })] }), r(Te, { children: [r(ee, Object.assign({ uiAction: "back", onClick: (x) => Xt(void 0, void 0, void 0, function* () {
    x.preventDefault(), h("back");
    const A = yield p.actions.back(null).run();
    h(null), yield u.flow.run(A, v);
  }), loadingSpinnerPosition: "right", hidden: !(!((a = (s = p.actions).back) === null || a === void 0) && a.call(s, null)) }, { children: l("labels.back") })), r(ee, Object.assign({ uiAction: "skip", onClick: (x) => Xt(void 0, void 0, void 0, function* () {
    x.preventDefault(), h("skip");
    const A = yield p.actions.skip(null).run();
    h(null), yield u.flow.run(A, v);
  }), loadingSpinnerPosition: "left", hidden: !(!((c = (d = p.actions).skip) === null || c === void 0) && c.call(d, null)) }, { children: l("labels.skip") }))] })] });
};
var fn = Y(560), jt = {};
jt.setAttributes = Ye(), jt.insert = (o) => {
  window._hankoStyle = o;
}, jt.domAPI = Ge(), jt.insertStyleElement = Xe(), Qe()(fn.A, jt);
const aa = fn.A && fn.A.locals ? fn.A.locals : void 0, la = ({ children: o, text: e }) => {
  const { t } = (0, _.useContext)(Z.TranslateContext), [n, i] = (0, _.useState)(!1);
  return r("section", Object.assign({ className: Rt.clipboardContainer }, { children: [r("div", { children: [o, " "] }), r("div", Object.assign({ className: Rt.clipboardIcon, onClick: (s) => {
    return a = void 0, d = void 0, l = function* () {
      s.preventDefault();
      try {
        yield navigator.clipboard.writeText(e), i(!0), setTimeout(() => i(!1), 1500);
      } catch (u) {
        console.error("Failed to copy: ", u);
      }
    }, new ((c = void 0) || (c = Promise))(function(u, h) {
      function v(E) {
        try {
          S(l.next(E));
        } catch (C) {
          h(C);
        }
      }
      function p(E) {
        try {
          S(l.throw(E));
        } catch (C) {
          h(C);
        }
      }
      function S(E) {
        var C;
        E.done ? u(E.value) : (C = E.value, C instanceof c ? C : new c(function(x) {
          x(C);
        })).then(v, p);
      }
      S((l = l.apply(a, d || [])).next());
    });
    var a, d, c, l;
  } }, { children: n ? r("span", { children: ["- ", t("labels.copied")] }) : r(Ht, { name: "copy", secondary: !0, size: 13 }) }))] }));
}, ca = ({ src: o, secret: e }) => {
  const { t } = (0, _.useContext)(Z.TranslateContext);
  return r("div", Object.assign({ className: aa.otpCreationDetails }, { children: [r("img", { alt: "QR-Code", src: o }), r(An, {}), r(la, Object.assign({ text: e }, { children: t("texts.otpSecretKey") })), r("div", { children: e })] }));
};
var Fn = function(o, e, t, n) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        c(n.next(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      try {
        c(n.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, d);
    }
    c((n = n.apply(o, [])).next());
  });
};
const da = (o) => {
  const { t: e } = (0, _.useContext)(Z.TranslateContext), { flowState: t } = Le(o.state), { hanko: n, uiState: i, setLoadingAction: s, stateHandler: a } = (0, _.useContext)(ue), [d, c] = (0, _.useState)([]), l = (0, _.useCallback)((u) => Fn(void 0, void 0, void 0, function* () {
    s("passcode-submit");
    const h = yield t.actions.otp_code_verify({ otp_code: u }).run();
    s(null), yield n.flow.run(h, a);
  }), [t, s, a]);
  return (0, _.useEffect)(() => {
    var u;
    ((u = t.error) === null || u === void 0 ? void 0 : u.code) === "passcode_invalid" && c([]);
  }, [t]), r(O.Fragment, { children: [r(Ce, { children: [r(de, { children: e("headlines.otpSetUp") }), r(Ae, { state: t }), r(q, { children: e("texts.otpScanQRCode") }), r(ca, { src: t.payload.otp_image_source, secret: t.payload.otp_secret }), r(q, { children: e("texts.otpEnterVerificationCode") }), r(ne, Object.assign({ onSubmit: (u) => Fn(void 0, void 0, void 0, function* () {
    return u.preventDefault(), l(d.join(""));
  }) }, { children: [r(ko, { onInput: (u) => {
    if (c(u), u.filter((h) => h !== "").length === 6) return l(u.join(""));
  }, passcodeDigits: d, numberOfInputs: 6 }), r(te, Object.assign({ uiAction: "passcode-submit" }, { children: e("labels.continue") }))] }))] }), r(Te, { children: r(ee, Object.assign({ onClick: (u) => Fn(void 0, void 0, void 0, function* () {
    u.preventDefault(), s("back");
    const h = yield t.actions.back(null).run();
    s(null), yield n.flow.run(h, a);
  }), loadingSpinnerPosition: "right", isLoading: i.loadingAction === "back" }, { children: e("labels.back") })) })] });
};
var di = function(o, e, t, n) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        c(n.next(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      try {
        c(n.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, d);
    }
    c((n = n.apply(o, [])).next());
  });
};
const ua = (o) => {
  var e, t, n, i;
  const { t: s } = (0, _.useContext)(Z.TranslateContext), { hanko: a, setLoadingAction: d, stateHandler: c } = (0, _.useContext)(ue), { flowState: l } = Le(o.state);
  return r(O.Fragment, { children: [r(Ce, { children: [r(de, { children: s("headlines.securityKeySetUp") }), r(Ae, { state: l }), r(q, { children: s("texts.securityKeySetUp") }), r(ne, Object.assign({ onSubmit: (u) => di(void 0, void 0, void 0, function* () {
    u.preventDefault(), d("passkey-submit");
    const h = yield l.actions.webauthn_generate_creation_options(null).run();
    yield a.flow.run(h, c);
  }) }, { children: r(te, Object.assign({ uiAction: "passkey-submit", autofocus: !0, icon: "securityKey" }, { children: s("labels.createSecurityKey") })) }))] }), r(Te, Object.assign({ hidden: !(!((t = (e = l.actions).back) === null || t === void 0) && t.call(e, null)) }, { children: r(ee, Object.assign({ uiAction: "back", onClick: (u) => di(void 0, void 0, void 0, function* () {
    u.preventDefault(), d("back");
    const h = yield l.actions.back(null).run();
    d(null), yield a.flow.run(h, c);
  }), loadingSpinnerPosition: "right", hidden: !(!((i = (n = l.actions).back) === null || i === void 0) && i.call(n, null)) }, { children: s("labels.back") })) }))] });
};
var Kn = function(o, e, t, n) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        c(n.next(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      try {
        c(n.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, d);
    }
    c((n = n.apply(o, [])).next());
  });
};
const ha = (o) => {
  var e, t, n, i;
  const { t: s } = (0, _.useContext)(Z.TranslateContext), { hanko: a, setLoadingAction: d, stateHandler: c } = (0, _.useContext)(ue), { flowState: l } = Le(o.state);
  return r(O.Fragment, { children: [r(Ce, { children: [r(de, { children: s("headlines.trustDevice") }), r(Ae, { flowError: l == null ? void 0 : l.error }), r(q, { children: s("texts.trustDevice") }), r(ne, Object.assign({ onSubmit: (u) => Kn(void 0, void 0, void 0, function* () {
    u.preventDefault(), d("trust-device-submit");
    const h = yield l.actions.trust_device(null).run();
    d(null), yield a.flow.run(h, c);
  }) }, { children: r(te, Object.assign({ uiAction: "trust-device-submit" }, { children: s("labels.trustDevice") })) }))] }), r(Te, { children: [r(ee, Object.assign({ uiAction: "back", onClick: (u) => Kn(void 0, void 0, void 0, function* () {
    u.preventDefault(), d("back");
    const h = yield l.actions.back(null).run();
    d(null), yield a.flow.run(h, c);
  }), loadingSpinnerPosition: "right", hidden: !(!((t = (e = l.actions).back) === null || t === void 0) && t.call(e, null)) }, { children: s("labels.back") })), r(ee, Object.assign({ uiAction: "skip", onClick: (u) => Kn(void 0, void 0, void 0, function* () {
    u.preventDefault(), d("skip");
    const h = yield l.actions.skip(null).run();
    d(null), yield a.flow.run(h, c);
  }), loadingSpinnerPosition: "left", hidden: !(!((i = (n = l.actions).skip) === null || i === void 0) && i.call(n, null)) }, { children: s("labels.skip") }))] })] });
};
var ze = function(o, e, t, n) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        c(n.next(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      try {
        c(n.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, d);
    }
    c((n = n.apply(o, [])).next());
  });
};
const en = "flow-state", ue = (0, O.createContext)(null), pa = (o) => {
  var { lang: e, experimental: t = "", prefilledEmail: n, prefilledUsername: i, globalOptions: s, createWebauthnAbortSignal: a } = o, d = function(f, y) {
    var L = {};
    for (var K in f) Object.prototype.hasOwnProperty.call(f, K) && y.indexOf(K) < 0 && (L[K] = f[K]);
    if (f != null && typeof Object.getOwnPropertySymbols == "function") {
      var pe = 0;
      for (K = Object.getOwnPropertySymbols(f); pe < K.length; pe++) y.indexOf(K[pe]) < 0 && Object.prototype.propertyIsEnumerable.call(f, K[pe]) && (L[K[pe]] = f[K[pe]]);
    }
    return L;
  }(o, ["lang", "experimental", "prefilledEmail", "prefilledUsername", "globalOptions", "createWebauthnAbortSignal"]);
  const { hanko: c, injectStyles: l, hidePasskeyButtonOnLogin: u, translations: h, translationsLocation: v, fallbackLanguage: p } = s;
  c.setLang((e == null ? void 0 : e.toString()) || p);
  const S = (0, _.useRef)(null), E = (0, _.useMemo)(() => `${s.storageKey}_last_login`, [s.storageKey]), [C, x] = (0, _.useState)(d.componentName), A = (0, _.useMemo)(() => t.split(" ").filter((f) => f.length).map((f) => f), [t]), I = (0, _.useMemo)(() => r(Nr, {}), []), [T, U] = (0, _.useState)(I), [, ie] = (0, _.useState)(c), [_e, se] = (0, _.useState)(), [be, M] = (0, _.useState)({ email: n, username: i }), z = (0, _.useCallback)((f) => {
    M((y) => Object.assign(Object.assign({}, y), { loadingAction: f, succeededAction: null, error: null, lastAction: f || y.lastAction }));
  }, []), ve = (0, _.useCallback)((f) => {
    M((y) => Object.assign(Object.assign({}, y), { succeededAction: f, loadingAction: null }));
  }, []), je = (0, _.useCallback)(() => {
    M((f) => Object.assign(Object.assign({}, f), { succeededAction: f.lastAction, loadingAction: null, error: null }));
  }, []), Oe = (0, _.useMemo)(() => !!be.loadingAction || !!be.succeededAction, [be]), De = function(f, y) {
    var L;
    (L = S.current) === null || L === void 0 || L.dispatchEvent(new CustomEvent(f, { detail: y, bubbles: !1, composed: !0 }));
  }, re = (f) => {
    z(null), U(r(li, { error: f instanceof Se ? f : new Ie(f) }));
  }, ae = (0, _.useMemo)(() => ({ onError: (f) => {
    re(f);
  }, preflight(f) {
    return ze(this, void 0, void 0, function* () {
      const y = yield ht.isConditionalMediationAvailable(), L = yield ht.isPlatformAuthenticatorAvailable(), K = yield f.actions.register_client_capabilities({ webauthn_available: k, webauthn_conditional_mediation_available: y, webauthn_platform_authenticator_available: L }).run();
      return c.flow.run(K, ae);
    });
  }, login_init(f) {
    return ze(this, void 0, void 0, function* () {
      U(r(Mr, { state: f })), function() {
        ze(this, void 0, void 0, function* () {
          if (f.payload.request_options) {
            let y;
            try {
              y = yield ti({ publicKey: f.payload.request_options.publicKey, mediation: "conditional", signal: a() });
            } catch {
              return;
            }
            z("passkey-submit");
            const L = yield f.actions.webauthn_verify_assertion_response({ assertion_response: y }).run();
            z(null), yield c.flow.run(L, ae);
          }
        });
      }();
    });
  }, passcode_confirmation(f) {
    U(r(Wr, { state: f }));
  }, login_otp(f) {
    return ze(this, void 0, void 0, function* () {
      U(r(ia, { state: f }));
    });
  }, login_passkey(f) {
    return ze(this, void 0, void 0, function* () {
      let y;
      z("passkey-submit");
      try {
        y = yield ti(Object.assign(Object.assign({}, f.payload.request_options), { signal: a() }));
      } catch {
        const pe = yield f.actions.back(null).run();
        return M((Re) => Object.assign(Object.assign({}, Re), { error: f.error, loadingAction: null })), c.flow.run(pe, ae);
      }
      const L = yield f.actions.webauthn_verify_assertion_response({ assertion_response: y }).run();
      z(null), yield c.flow.run(L, ae);
    });
  }, onboarding_create_passkey(f) {
    U(r(zr, { state: f }));
  }, onboarding_verify_passkey_attestation(f) {
    return ze(this, void 0, void 0, function* () {
      let y;
      try {
        y = yield ei(Object.assign(Object.assign({}, f.payload.creation_options), { signal: a() }));
      } catch {
        const pe = yield f.actions.back(null).run();
        return z(null), yield c.flow.run(pe, ae), void M((Re) => Object.assign(Object.assign({}, Re), { error: { code: "webauthn_credential_already_exists", message: "Webauthn credential already exists" } }));
      }
      const L = yield f.actions.webauthn_verify_attestation_response({ public_key: y }).run();
      z(null), yield c.flow.run(L, ae);
    });
  }, webauthn_credential_verification(f) {
    return ze(this, void 0, void 0, function* () {
      let y;
      try {
        y = yield ei(Object.assign(Object.assign({}, f.payload.creation_options), { signal: a() }));
      } catch {
        const pe = yield f.actions.back(null).run();
        return z(null), yield c.flow.run(pe, ae), void M((Re) => Object.assign(Object.assign({}, Re), { error: { code: "webauthn_credential_already_exists", message: "Webauthn credential already exists" } }));
      }
      const L = yield f.actions.webauthn_verify_attestation_response({ public_key: y }).run();
      yield c.flow.run(L, ae);
    });
  }, login_password(f) {
    U(r(qr, { state: f }));
  }, login_password_recovery(f) {
    U(r(Fr, { state: f }));
  }, login_security_key(f) {
    return ze(this, void 0, void 0, function* () {
      U(r(sa, { state: f }));
    });
  }, mfa_method_chooser(f) {
    return ze(this, void 0, void 0, function* () {
      U(r(ra, { state: f }));
    });
  }, mfa_otp_secret_creation(f) {
    return ze(this, void 0, void 0, function* () {
      U(r(da, { state: f }));
    });
  }, mfa_security_key_creation(f) {
    return ze(this, void 0, void 0, function* () {
      U(r(ua, { state: f }));
    });
  }, login_method_chooser(f) {
    U(r(Kr, { state: f }));
  }, registration_init(f) {
    U(r(Br, { state: f }));
  }, password_creation(f) {
    U(r(Vr, { state: f }));
  }, success(f) {
    var y;
    !((y = f.payload) === null || y === void 0) && y.last_login && localStorage.setItem(E, JSON.stringify(f.payload.last_login));
    const { claims: L } = f.payload, K = Date.parse(L.expiration) - Date.now();
    c.relay.dispatchSessionCreatedEvent({ claims: L, expirationSeconds: K }), je();
  }, profile_init(f) {
    U(r(ea, { state: f, enablePasskeys: s.enablePasskeys }));
  }, thirdparty(f) {
    return ze(this, void 0, void 0, function* () {
      const y = new URLSearchParams(window.location.search).get("hanko_token");
      if (y && y.length > 0) {
        const L = new URLSearchParams(window.location.search), K = yield f.actions.exchange_token({ token: L.get("hanko_token") }).run();
        L.delete("hanko_token"), L.delete("saml_hint"), history.replaceState(null, null, window.location.pathname + (L.size < 1 ? "" : `?${L.toString()}`)), yield c.flow.run(K, ae);
      } else M((L) => Object.assign(Object.assign({}, L), { lastAction: null })), localStorage.setItem(en, JSON.stringify(f.toJSON())), window.location.assign(f.payload.redirect_url);
    });
  }, error(f) {
    z(null), U(r(li, { state: f }));
  }, onboarding_email(f) {
    U(r(ta, { state: f }));
  }, onboarding_username(f) {
    U(r(na, { state: f }));
  }, credential_onboarding_chooser(f) {
    U(r(oa, { state: f }));
  }, account_deleted(f) {
    return ze(this, void 0, void 0, function* () {
      yield c.user.logout(), c.relay.dispatchUserDeletedEvent();
    });
  }, device_trust(f) {
    U(r(ha, { state: f }));
  } }), [s.enablePasskeys, c, je, z]), he = (0, _.useCallback)((f) => ze(void 0, void 0, void 0, function* () {
    z("switch-flow");
    const y = localStorage.getItem(E);
    y && se(JSON.parse(y));
    const L = new URLSearchParams(window.location.search).get("hanko_token"), K = localStorage.getItem(en);
    new URLSearchParams(window.location.search).get("saml_hint") === "idp_initiated" ? yield c.flow.init("/token_exchange", Object.assign({}, ae)) : K && K.length > 0 && L && L.length > 0 ? (yield c.flow.fromString(localStorage.getItem(en), Object.assign({}, ae)), localStorage.removeItem(en)) : yield c.flow.init(f, Object.assign({}, ae)), z(null);
  }), [ae]), Ee = (0, _.useCallback)((f) => {
    switch (f) {
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
  (0, _.useEffect)(() => Ee(C), []), (0, _.useEffect)(() => {
    c.onUserDeleted(() => {
      De("onUserDeleted");
    }), c.onSessionCreated((f) => {
      De("onSessionCreated", f);
    }), c.onSessionExpired(() => {
      De("onSessionExpired");
    }), c.onUserLoggedOut(() => {
      De("onUserLoggedOut");
    });
  }, [c]), (0, _.useMemo)(() => {
    const f = () => {
      Ee(C);
    };
    ["auth", "login", "registration"].includes(C) ? (c.onUserLoggedOut(f), c.onSessionExpired(f), c.onUserDeleted(f)) : C === "profile" && c.onSessionCreated(f);
  }, []);
  const k = ht.supported();
  return r(ue.Provider, Object.assign({ value: { init: Ee, initialComponentName: d.componentName, isDisabled: Oe, setUIState: M, setLoadingAction: z, setSucceededAction: ve, uiState: be, hanko: c, setHanko: ie, lang: (e == null ? void 0 : e.toString()) || p, prefilledEmail: n, prefilledUsername: i, componentName: C, setComponentName: x, experimentalFeatures: A, hidePasskeyButtonOnLogin: u, page: T, setPage: U, stateHandler: ae, lastLogin: _e } }, { children: r(Z.TranslateProvider, Object.assign({ translations: h, fallbackLang: p, root: v }, { children: r(gr, Object.assign({ ref: S }, { children: C !== "events" ? r(O.Fragment, { children: [l ? r("style", { dangerouslySetInnerHTML: { __html: window._hankoStyle.innerHTML } }) : null, T] }) : null })) })) }));
}, fa = { en: Y(6).en };
var Zi = function(o, e, t, n) {
  return new (t || (t = Promise))(function(i, s) {
    function a(l) {
      try {
        c(n.next(l));
      } catch (u) {
        s(u);
      }
    }
    function d(l) {
      try {
        c(n.throw(l));
      } catch (u) {
        s(u);
      }
    }
    function c(l) {
      var u;
      l.done ? i(l.value) : (u = l.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(a, d);
    }
    c((n = n.apply(o, [])).next());
  });
};
const Ze = {}, qt = (o, e) => r(pa, Object.assign({ componentName: o, globalOptions: Ze, createWebauthnAbortSignal: ba }, e)), ma = (o) => qt("auth", o), va = (o) => qt("login", o), ga = (o) => qt("registration", o), _a = (o) => qt("profile", o), ya = (o) => qt("events", o);
let tn = new AbortController();
const ba = () => (tn && tn.abort(), tn = new AbortController(), tn.signal), Dt = ({ tagName: o, entryComponent: e, shadow: t = !0, observedAttributes: n }) => Zi(void 0, void 0, void 0, function* () {
  customElements.get(o) || function(i, s, a, d) {
    function c() {
      var l = Reflect.construct(HTMLElement, [], c);
      return l._vdomComponent = i, l._root = d && d.shadow ? l.attachShadow({ mode: "open" }) : l, l;
    }
    (c.prototype = Object.create(HTMLElement.prototype)).constructor = c, c.prototype.connectedCallback = $s, c.prototype.attributeChangedCallback = Ls, c.prototype.disconnectedCallback = Ts, a = a || i.observedAttributes || Object.keys(i.propTypes || {}), c.observedAttributes = a, a.forEach(function(l) {
      Object.defineProperty(c.prototype, l, { get: function() {
        var u, h, v, p;
        return (u = (h = this._vdom) == null || (v = h.props) == null ? void 0 : v[l]) != null ? u : (p = this._props) == null ? void 0 : p[l];
      }, set: function(u) {
        this._vdom ? this.attributeChangedCallback(l, null, u) : (this._props || (this._props = {}), this._props[l] = u, this.connectedCallback());
        var h = typeof u;
        u != null && h !== "string" && h !== "boolean" && h !== "number" || this.setAttribute(l, u);
      } });
    }), customElements.define(s || i.tagName || i.displayName || i.name, c);
  }(e, o, n, { shadow: t });
}), ka = (o, e = {}) => Zi(void 0, void 0, void 0, function* () {
  const t = ["api", "lang", "experimental", "prefilled-email", "entry"];
  return e = Object.assign({ shadow: !0, injectStyles: !0, enablePasskeys: !0, hidePasskeyButtonOnLogin: !1, translations: null, translationsLocation: "/i18n", fallbackLanguage: "en", storageKey: "hanko", sessionCheckInterval: 3e4 }, e), Ze.hanko = new Ki(o, { cookieName: e.storageKey, cookieDomain: e.cookieDomain, cookieSameSite: e.cookieSameSite, localStorageKey: e.storageKey, sessionCheckInterval: e.sessionCheckInterval, sessionTokenLocation: e.sessionTokenLocation }), Ze.injectStyles = e.injectStyles, Ze.enablePasskeys = e.enablePasskeys, Ze.hidePasskeyButtonOnLogin = e.hidePasskeyButtonOnLogin, Ze.translations = e.translations || fa, Ze.translationsLocation = e.translationsLocation, Ze.fallbackLanguage = e.fallbackLanguage, Ze.storageKey = e.storageKey, yield Promise.all([Dt(Object.assign(Object.assign({}, e), { tagName: "hanko-auth", entryComponent: ma, observedAttributes: t })), Dt(Object.assign(Object.assign({}, e), { tagName: "hanko-login", entryComponent: va, observedAttributes: t })), Dt(Object.assign(Object.assign({}, e), { tagName: "hanko-registration", entryComponent: ga, observedAttributes: t })), Dt(Object.assign(Object.assign({}, e), { tagName: "hanko-profile", entryComponent: _a, observedAttributes: t.filter((n) => ["api", "lang"].includes(n)) })), Dt(Object.assign(Object.assign({}, e), { tagName: "hanko-events", entryComponent: ya, observedAttributes: [] }))]), { hanko: Ze.hanko };
});
oe.fK;
oe.tJ;
oe.Z7;
oe.Q9;
oe.Lv;
oe.qQ;
var wa = oe.I4;
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
var Ji = oe.kz;
oe.fX;
oe.qA;
oe.tz;
oe.gN;
const Sa = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Hanko: wa,
  register: Ji
}, Symbol.toStringTag, { value: "Module" }));
var Yn = "";
function ui(o) {
  Yn = o;
}
function xa(o = "") {
  if (!Yn) {
    const e = document.querySelector("[data-webawesome]");
    if (e != null && e.hasAttribute("data-webawesome")) {
      const t = new URL(e.getAttribute("data-webawesome") ?? "", window.location.href).pathname;
      ui(t);
    } else {
      const n = [...document.getElementsByTagName("script")].find(
        (i) => i.src.endsWith("webawesome.js") || i.src.endsWith("webawesome.loader.js") || i.src.endsWith("webawesome.ssr-loader.js")
      );
      if (n) {
        const i = String(n.getAttribute("src"));
        ui(i.split("/").slice(0, -1).join("/"));
      }
    }
  }
  return Yn.replace(/\/$/, "") + (o ? `/${o.replace(/^\//, "")}` : "");
}
new MutationObserver((o) => {
  for (const { addedNodes: e } of o)
    for (const t of e)
      t.nodeType === Node.ELEMENT_NODE && Ca(t);
});
async function Ca(o) {
  const e = o instanceof Element ? o.tagName.toLowerCase() : "", t = e == null ? void 0 : e.startsWith("wa-"), n = [...o.querySelectorAll(":not(:defined)")].map((a) => a.tagName.toLowerCase()).filter((a) => a.startsWith("wa-"));
  t && !customElements.get(e) && n.push(e);
  const i = [...new Set(n)], s = await Promise.allSettled(i.map((a) => Aa(a)));
  for (const a of s)
    a.status === "rejected" && console.warn(a.reason);
  await new Promise(requestAnimationFrame), o.dispatchEvent(
    new CustomEvent("wa-discovery-complete", {
      bubbles: !1,
      cancelable: !1,
      composed: !0
    })
  );
}
function Aa(o) {
  if (customElements.get(o))
    return Promise.resolve();
  const e = o.replace(/^wa-/i, ""), t = xa(`components/${e}/${e}.js`);
  return new Promise((n, i) => {
    import(t).then(() => n()).catch(() => i(new Error(`Unable to autoload <${o}> from ${t}`)));
  });
}
const Oa = /* @__PURE__ */ new Set(), nn = /* @__PURE__ */ new Map(), Qi = typeof MutationObserver < "u" && typeof document < "u" && typeof document.documentElement < "u";
if (Qi) {
  const o = new MutationObserver(Yi);
  document.documentElement.dir, document.documentElement.lang || navigator.language, o.observe(document.documentElement, {
    attributes: !0,
    attributeFilter: ["dir", "lang"]
  });
}
function Gi(...o) {
  o.map((e) => {
    const t = e.$code.toLowerCase();
    nn.has(t) ? nn.set(t, Object.assign(Object.assign({}, nn.get(t)), e)) : nn.set(t, e);
  }), Yi();
}
function Yi() {
  Qi && (document.documentElement.dir, document.documentElement.lang || navigator.language), [...Oa.keys()].map((o) => {
    typeof o.requestUpdate == "function" && o.requestUpdate();
  });
}
var Xi = {
  $code: "en",
  $name: "English",
  $dir: "ltr",
  carousel: "Carousel",
  clearEntry: "Clear entry",
  close: "Close",
  copied: "Copied",
  copy: "Copy",
  currentValue: "Current value",
  error: "Error",
  goToSlide: (o, e) => `Go to slide ${o} of ${e}`,
  hidePassword: "Hide password",
  loading: "Loading",
  nextSlide: "Next slide",
  numOptionsSelected: (o) => o === 0 ? "No options selected" : o === 1 ? "1 option selected" : `${o} options selected`,
  previousSlide: "Previous slide",
  progress: "Progress",
  remove: "Remove",
  resize: "Resize",
  scrollableRegion: "Scrollable region",
  scrollToEnd: "Scroll to end",
  scrollToStart: "Scroll to start",
  selectAColorFromTheScreen: "Select a color from the screen",
  showPassword: "Show password",
  slideNum: (o) => `Slide ${o}`,
  toggleColorFormat: "Toggle color format",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out"
};
Gi(Xi);
var Ea = Xi;
Gi(Ea);
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
}, hi = (o) => `hanko-verified-${o}`, pi = (o) => `hanko-onboarding-${o}`;
var vi, Bn, Pa;
vi = [Es("hotosm-auth")];
let ut = class ut extends (Pa = Nt) {
  constructor() {
    super(...arguments), this.hankoUrlAttr = "", this.basePath = "", this.authPath = "/api/auth/osm", this.osmRequired = !1, this.osmScopes = "read_prefs", this.showProfile = !1, this.redirectAfterLogin = "", this.autoConnect = !1, this.verifySession = !1, this.redirectAfterLogout = "", this.displayNameAttr = "", this.mappingCheckUrl = "", this.appId = "", this.loginUrl = "", this.loginUrl = "", this.user = null, this.osmConnected = !1, this.osmData = null, this.osmLoading = !1, this.loading = !0, this.error = null, this.profileDisplayName = "", this.hasAppMapping = !1, this._trailingSlashCache = {}, this._debugMode = !1, this._lastSessionId = null, this._hanko = null, this._isPrimary = !1, this._handleVisibilityChange = () => {
      this._isPrimary && !document.hidden && !this.showProfile && !this.user && (this.log("👁️ Page visible, re-checking session..."), this.checkSession());
    }, this._handleWindowFocus = () => {
      this._isPrimary && !this.showProfile && !this.user && (this.log("🎯 Window focused, re-checking session..."), this.checkSession());
    }, this._handleExternalLogin = (e) => {
      var n;
      if (!this._isPrimary) return;
      const t = e;
      !this.showProfile && !this.user && ((n = t.detail) != null && n.user) && (this.log("🔔 External login detected, updating user state..."), this.user = t.detail.user, this._broadcastState(), this.osmRequired && this.checkOSMConnection());
    };
  }
  // Get computed hankoUrl (priority: attribute > meta tag > window.HANKO_URL > origin)
  get hankoUrl() {
    if (this.hankoUrlAttr)
      return this.hankoUrlAttr;
    const e = document.querySelector('meta[name="hanko-url"]');
    if (e) {
      const n = e.getAttribute("content");
      if (n)
        return this.log("🔍 hanko-url auto-detected from <meta> tag:", n), n;
    }
    if (window.HANKO_URL)
      return this.log(
        "🔍 hanko-url auto-detected from window.HANKO_URL:",
        window.HANKO_URL
      ), window.HANKO_URL;
    const t = window.location.origin;
    return this.log("🔍 hanko-url auto-detected from window.location.origin:", t), t;
  }
  connectedCallback() {
    super.connectedCallback(), this._debugMode = this._checkDebugMode(), this.log("🔌 hanko-auth connectedCallback called"), this.injectHankoStyles(), le.instances.add(this), document.addEventListener("visibilitychange", this._handleVisibilityChange), window.addEventListener("focus", this._handleWindowFocus), document.addEventListener("hanko-login", this._handleExternalLogin);
  }
  // Use firstUpdated instead of connectedCallback to ensure React props are set
  firstUpdated() {
    this.log("🔌 hanko-auth firstUpdated called"), this.log("  hankoUrl:", this.hankoUrl), this.log("  basePath:", this.basePath), le.initialized || le.primary ? (this.log("🔄 Using shared state from primary instance"), this._syncFromShared(), this._isPrimary = !1) : (this.log("👑 This is the primary instance"), this._isPrimary = !0, le.primary = this, le.initialized = !0, this.init());
  }
  disconnectedCallback() {
    if (super.disconnectedCallback(), document.removeEventListener(
      "visibilitychange",
      this._handleVisibilityChange
    ), window.removeEventListener("focus", this._handleWindowFocus), document.removeEventListener("hanko-login", this._handleExternalLogin), le.instances.delete(this), this._isPrimary && le.instances.size > 0) {
      const e = le.instances.values().next().value;
      e && (this.log("👑 Promoting new primary instance"), e._isPrimary = !0, le.primary = e);
    }
    le.instances.size === 0 && (le.initialized = !1, le.primary = null);
  }
  // Sync local state from shared state (only if values changed to prevent render loops)
  _syncFromShared() {
    this.user !== le.user && (this.user = le.user), this.osmConnected !== le.osmConnected && (this.osmConnected = le.osmConnected), this.osmData !== le.osmData && (this.osmData = le.osmData), this.loading !== le.loading && (this.loading = le.loading), this._hanko !== le.hanko && (this._hanko = le.hanko), this.profileDisplayName !== le.profileDisplayName && (this.profileDisplayName = le.profileDisplayName);
  }
  // Update shared state and broadcast to all instances
  _broadcastState() {
    le.user = this.user, le.osmConnected = this.osmConnected, le.osmData = this.osmData, le.loading = this.loading, le.profileDisplayName = this.profileDisplayName, le.instances.forEach((e) => {
      e !== this && e._syncFromShared();
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
  log(...e) {
    this._debugMode && console.log(...e);
  }
  warn(...e) {
    console.warn(...e);
  }
  logError(...e) {
    console.error(...e);
  }
  getBasePath() {
    return this.basePath ? (this.log("🔍 getBasePath() using basePath:", this.basePath), this.basePath) : (this.log("🔍 getBasePath() using default: empty string"), "");
  }
  addTrailingSlash(e, t) {
    const n = this._trailingSlashCache[t];
    return n !== void 0 && n && !e.endsWith("/") ? e + "/" : e;
  }
  injectHankoStyles() {
    if (document.getElementById("hot-design-system") || [
      "https://cdn.jsdelivr.net/npm/hotosm-ui-design@latest/dist/hot.css",
      "https://cdn.jsdelivr.net/npm/hotosm-ui-design@latest/dist/hot-font-face.css",
      "https://cdn.jsdelivr.net/npm/hotosm-ui-design@latest/dist/hot-wa.css"
    ].forEach((t, n) => {
      const i = document.createElement("link");
      i.rel = "stylesheet", i.href = t, n === 0 && (i.id = "hot-design-system"), document.head.appendChild(i);
    }), !document.getElementById("google-font-archivo")) {
      const e = document.createElement("link");
      e.rel = "stylesheet", e.href = "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&display=swap", e.id = "google-font-archivo", document.head.appendChild(e);
    }
  }
  async init() {
    if (!this._isPrimary) {
      this.log("⏭️ Not primary, skipping init...");
      return;
    }
    try {
      await Ji(this.hankoUrl, {
        enablePasskeys: !1,
        hidePasskeyButtonOnLogin: !0
      });
      const { Hanko: e } = await Promise.resolve().then(() => Sa), t = window.location.hostname, i = t === "localhost" || t === "127.0.0.1" ? {} : {
        cookieDomain: ".hotosm.org",
        cookieName: "hanko",
        cookieSameSite: "lax"
      };
      this._hanko = new e(this.hankoUrl, i), le.hanko = this._hanko, this._hanko.onSessionExpired(() => {
        this.log("🕒 Hanko session expired event received"), this.handleSessionExpired();
      }), this._hanko.onUserLoggedOut(() => {
        this.log("🚪 Hanko user logged out event received"), this.handleUserLoggedOut();
      }), await this.checkSession(), this.user && (this.osmRequired && await this.checkOSMConnection(), await this.fetchProfileDisplayName()), this.loading = !1, this._broadcastState(), this.setupEventListeners();
    } catch (e) {
      this.logError("Failed to initialize hanko-auth:", e), this.error = e.message, this.loading = !1, this._broadcastState();
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
        const e = await fetch(
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
        if (e.ok) {
          const t = await e.json();
          if (t.is_valid === !1) {
            this.log(
              "ℹ️ Session validation returned is_valid:false - no valid session"
            );
            return;
          }
          this.log("✅ Valid Hanko session found via cookie"), this.log("📋 Session data:", t);
          try {
            const n = await fetch(`${this.hankoUrl}/me`, {
              method: "GET",
              credentials: "include",
              // Include httpOnly cookies
              headers: {
                "Content-Type": "application/json"
              }
            });
            let i = !0;
            if (n.ok) {
              const s = await n.json();
              this.log("👤 User data retrieved from /me:", s), s.email ? (this.user = {
                id: s.user_id || s.id,
                email: s.email,
                username: s.username || null,
                emailVerified: s.email_verified || s.verified || !1
              }, i = !1) : this.log("⚠️ /me has no email, will use SDK fallback");
            }
            if (i) {
              this.log("🔄 Using SDK to get user with email");
              const s = await this._hanko.user.getCurrent();
              this.user = {
                id: s.id,
                email: s.email,
                username: s.username,
                emailVerified: s.email_verified || !1
              };
            }
          } catch (n) {
            this.log("⚠️ Failed to get user data:", n), t.user_id && (this.user = {
              id: t.user_id,
              email: t.email || null,
              username: null,
              emailVerified: !1
            });
          }
          if (this.user) {
            const n = hi(window.location.hostname), i = sessionStorage.getItem(n);
            if (this.verifySession && this.redirectAfterLogin && !i) {
              this.log(
                "🔄 verify-session enabled, redirecting to callback for app verification..."
              ), sessionStorage.setItem(n, "true"), window.location.href = this.redirectAfterLogin;
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
      } catch (e) {
        this.log("⚠️ Session validation failed:", e), this.log("ℹ️ No valid session - user needs to login");
      }
    } catch (e) {
      this.log("⚠️ Session check error:", e), this.log("ℹ️ No existing session - user needs to login");
    } finally {
      this._isPrimary && this._broadcastState();
    }
  }
  async checkOSMConnection() {
    if (this.osmConnected) {
      this.log("⏭️ Already connected to OSM, skipping check");
      return;
    }
    const e = this.loading;
    e || (this.osmLoading = !0);
    try {
      const t = this.getBasePath(), n = this.authPath, s = `${`${t}${n}/status`}`;
      this.log("🔍 Checking OSM connection at:", s), this.log("  basePath:", t), this.log("  authPath:", n), this.log("🍪 Current cookies:", document.cookie);
      const a = await fetch(s, {
        credentials: "include",
        redirect: "follow"
      });
      if (this.log("📡 OSM status response:", a.status), this.log("📡 Final URL after redirects:", a.url), this.log("📡 Response headers:", [...a.headers.entries()]), a.ok) {
        const d = await a.text();
        this.log("📡 OSM raw response:", d.substring(0, 200));
        let c;
        try {
          c = JSON.parse(d);
        } catch {
          throw this.logError(
            "Failed to parse OSM response as JSON:",
            d.substring(0, 500)
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
    } catch (t) {
      this.logError("OSM connection check failed:", t);
    } finally {
      e || (this.osmLoading = !1), this._isPrimary && this._broadcastState();
    }
  }
  // Check app mapping status (for cross-app auth scenarios)
  // Only used when mapping-check-url is configured
  async checkAppMapping() {
    if (!this.mappingCheckUrl || !this.user)
      return !0;
    const e = pi(window.location.hostname), t = sessionStorage.getItem(e);
    this.log("🔍 Checking app mapping at:", this.mappingCheckUrl);
    try {
      const n = await fetch(this.mappingCheckUrl, {
        credentials: "include"
      });
      if (n.ok) {
        const i = await n.json();
        if (this.log("📡 Mapping check response:", i), i.needs_onboarding) {
          if (t)
            return this.log(
              "⚠️ Already tried onboarding this session, skipping redirect"
            ), !0;
          this.log("⚠️ User needs onboarding, redirecting..."), sessionStorage.setItem(e, "true");
          const s = encodeURIComponent(window.location.origin), a = this.appId ? `onboarding=${this.appId}` : "";
          return window.location.href = `${this.hankoUrl}/app?${a}&return_to=${s}`, !1;
        }
        return sessionStorage.removeItem(e), this.hasAppMapping = !0, this.log("✅ User has app mapping"), !0;
      } else if (n.status === 401 || n.status === 403) {
        if (t)
          return this.log(
            "⚠️ Already tried onboarding this session, skipping redirect"
          ), !0;
        this.log("⚠️ 401/403 - User needs onboarding, redirecting..."), sessionStorage.setItem(e, "true");
        const i = encodeURIComponent(window.location.origin), s = this.appId ? `onboarding=${this.appId}` : "";
        return window.location.href = `${this.hankoUrl}/app?${s}&return_to=${i}`, !1;
      }
      return this.log("⚠️ Unexpected status from mapping check:", n.status), !0;
    } catch (n) {
      return this.log("⚠️ App mapping check failed:", n), !0;
    }
  }
  // Fetch profile display name from login backend
  async fetchProfileDisplayName() {
    try {
      const e = `${this.hankoUrl}/api/profile/me`;
      this.log("👤 Fetching profile from:", e);
      const t = await fetch(e, {
        credentials: "include"
      });
      if (t.ok) {
        const n = await t.json();
        this.log("👤 Profile data:", n), (n.first_name || n.last_name) && (this.profileDisplayName = `${n.first_name || ""} ${n.last_name || ""}`.trim(), this.log("👤 Display name set to:", this.profileDisplayName));
      }
    } catch (e) {
      this.log("⚠️ Could not fetch profile:", e);
    }
  }
  setupEventListeners() {
    this.updateComplete.then(() => {
      var t;
      const e = (t = this.shadowRoot) == null ? void 0 : t.querySelector("hanko-auth");
      e && (e.addEventListener("onSessionCreated", (n) => {
        var s, a;
        this.log("🎯 Hanko event: onSessionCreated", n.detail);
        const i = (a = (s = n.detail) == null ? void 0 : s.claims) == null ? void 0 : a.session_id;
        if (i && this._lastSessionId === i) {
          this.log("⏭️ Skipping duplicate session event");
          return;
        }
        this._lastSessionId = i, this.handleHankoSuccess(n);
      }), e.addEventListener(
        "hankoAuthLogout",
        () => this.handleLogout()
      ));
    });
  }
  async handleHankoSuccess(e) {
    var i;
    if (this.log("Hanko auth success:", e.detail), !this._hanko) {
      this.logError("Hanko instance not initialized");
      return;
    }
    let t = !1;
    try {
      const s = new AbortController(), a = setTimeout(() => s.abort(), 5e3), d = await fetch(`${this.hankoUrl}/me`, {
        method: "GET",
        credentials: "include",
        // Include httpOnly cookies
        headers: {
          "Content-Type": "application/json"
        },
        signal: s.signal
      });
      if (clearTimeout(a), d.ok) {
        const c = await d.json();
        this.log("👤 User data retrieved from /me:", c), c.email ? (this.user = {
          id: c.user_id || c.id,
          email: c.email,
          username: c.username || null,
          emailVerified: c.email_verified || c.verified || !1
        }, t = !0) : this.log("⚠️ /me has no email, will try SDK fallback");
      } else
        this.log(
          "⚠️ /me endpoint returned non-OK status, will try SDK fallback"
        );
    } catch (s) {
      this.log(
        "⚠️ /me endpoint fetch failed (timeout or cross-origin TLS issue):",
        s
      );
    }
    if (!t)
      try {
        this.log("🔄 Trying SDK fallback for user info...");
        const s = new Promise(
          (d, c) => setTimeout(() => c(new Error("SDK timeout")), 5e3)
        ), a = await Promise.race([
          this._hanko.user.getCurrent(),
          s
        ]);
        this.user = {
          id: a.id,
          email: a.email,
          username: a.username,
          emailVerified: a.email_verified || !1
        }, t = !0, this.log("✅ User info retrieved via SDK fallback");
      } catch (s) {
        this.log("⚠️ SDK fallback failed, trying JWT claims:", s);
        try {
          const a = (i = e.detail) == null ? void 0 : i.claims;
          if (a != null && a.sub)
            this.user = {
              id: a.sub,
              email: a.email || null,
              username: null,
              emailVerified: a.email_verified || !1
            }, t = !0, this.log("✅ User info extracted from JWT claims");
          else {
            this.logError("No user claims available in event"), this.user = null;
            return;
          }
        } catch (a) {
          this.logError(
            "Failed to extract user info from claims:",
            a
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
    const n = !this.osmRequired || this.osmConnected;
    this.log(
      "🔄 Checking redirect-after-login:",
      this.redirectAfterLogin,
      "showProfile:",
      this.showProfile,
      "canRedirect:",
      n
    ), n ? (this.dispatchEvent(
      new CustomEvent("auth-complete", {
        bubbles: !0,
        composed: !0
      })
    ), this.redirectAfterLogin ? (this.log("✅ Redirecting to:", this.redirectAfterLogin), window.location.href = this.redirectAfterLogin) : this.log("❌ No redirect (redirectAfterLogin not set)")) : this.log("⏸️ Waiting for OSM connection before redirect");
  }
  async handleOSMConnect() {
    const e = this.osmScopes.split(" ").join("+"), t = this.getBasePath(), n = this.authPath, s = `${`${t}${n}/login`}?scopes=${e}`;
    this.log("🔗 OSM Connect clicked!"), this.log("  basePath:", t), this.log("  authPath:", n), this.log("  Login path:", s), this.log("  Fetching redirect URL from backend...");
    try {
      const a = await fetch(s, {
        method: "GET",
        credentials: "include",
        redirect: "manual"
        // Don't follow redirect, we'll do it manually
      });
      if (this.log("  Response status:", a.status), this.log("  Response type:", a.type), a.status === 0 || a.type === "opaqueredirect") {
        const d = a.headers.get("Location") || a.url;
        this.log("  ✅ Got redirect URL:", d), window.location.href = d;
      } else if (a.status >= 300 && a.status < 400) {
        const d = a.headers.get("Location");
        this.log("  ✅ Got redirect URL from header:", d), d && (window.location.href = d);
      } else {
        this.logError("  ❌ Unexpected response:", a.status);
        const d = await a.text();
        this.logError("  Response body:", d.substring(0, 200));
      }
    } catch (a) {
      this.logError("  ❌ Failed to fetch redirect URL:", a);
    }
  }
  async handleLogout() {
    this.log("🚪 Logout initiated"), this.log("📊 Current state before logout:", {
      user: this.user,
      osmConnected: this.osmConnected,
      osmData: this.osmData
    }), this.log("🍪 Cookies before logout:", document.cookie);
    try {
      const e = this.getBasePath(), t = this.authPath, n = `${e}${t}/disconnect`, i = n.startsWith("http") ? n : `${window.location.origin}${n}`;
      this.log("🔌 Calling OSM disconnect:", i);
      const s = await fetch(i, {
        method: "POST",
        credentials: "include"
      });
      this.log("📡 Disconnect response status:", s.status);
      const a = await s.json();
      this.log("📡 Disconnect response data:", a), this.log("✅ OSM disconnected");
    } catch (e) {
      this.logError("❌ OSM disconnect failed:", e);
    }
    if (this._hanko)
      try {
        await this._hanko.user.logout(), this.log("✅ Hanko logout successful");
      } catch (e) {
        this.logError("Hanko logout failed:", e);
      }
    this._clearAuthState(), this.log(
      "✅ Logout complete - component will re-render with updated state"
    ), this.redirectAfterLogout && (this.log("🔄 Redirecting after logout to:", this.redirectAfterLogout), window.location.href = this.redirectAfterLogout);
  }
  /**
   * Clear all auth state - shared between logout and session expired handlers
   */
  _clearAuthState() {
    const e = window.location.hostname;
    document.cookie = `hanko=; path=/; domain=${e}; max-age=0`, document.cookie = "hanko=; path=/; max-age=0", document.cookie = `osm_connection=; path=/; domain=${e}; max-age=0`, document.cookie = "osm_connection=; path=/; max-age=0", this.log("🍪 Cookies cleared");
    const t = hi(e), n = pi(e);
    sessionStorage.removeItem(t), sessionStorage.removeItem(n), this.log("🔄 Session flags cleared"), this.user = null, this.osmConnected = !1, this.osmData = null, this.hasAppMapping = !1, this._isPrimary && this._broadcastState(), this.dispatchEvent(
      new CustomEvent("logout", {
        bubbles: !0,
        composed: !0
      })
    );
  }
  async handleSessionExpired() {
    if (this.log("🕒 Session expired event received"), this.log("📊 Current state:", {
      user: this.user,
      osmConnected: this.osmConnected
    }), this.user) {
      this.log("✅ User is logged in, ignoring stale session expired event");
      return;
    }
    this.log("🧹 No active user - cleaning up state");
    try {
      const e = this.getBasePath(), t = this.authPath, n = `${e}${t}/disconnect`, i = n.startsWith("http") ? n : `${window.location.origin}${n}`;
      this.log("🔌 Calling OSM disconnect (session expired):", i);
      const s = await fetch(i, {
        method: "POST",
        credentials: "include"
      });
      this.log("📡 Disconnect response status:", s.status);
      const a = await s.json();
      this.log("📡 Disconnect response data:", a), this.log("✅ OSM disconnected");
    } catch (e) {
      this.logError("❌ OSM disconnect failed:", e);
    }
    this._clearAuthState(), this.log("✅ Session cleanup complete"), this.redirectAfterLogout && (this.log(
      "🔄 Redirecting after session expired to:",
      this.redirectAfterLogout
    ), window.location.href = this.redirectAfterLogout);
  }
  handleUserLoggedOut() {
    this.log("🚪 User logged out in another window/tab"), this.handleSessionExpired();
  }
  handleDropdownSelect(e) {
    const t = e.detail.item.value;
    if (this.log("🎯 Dropdown item selected:", t), t === "profile") {
      const n = this.hankoUrl, i = this.redirectAfterLogin || window.location.origin;
      window.location.href = `${n}/app/profile?return_to=${encodeURIComponent(i)}`;
    } else if (t === "connect-osm") {
      const s = window.location.pathname.includes("/app") ? window.location.origin : window.location.href, a = this.hankoUrl;
      window.location.href = `${a}/app?return_to=${encodeURIComponent(
        s
      )}&osm_required=true`;
    } else t === "logout" && this.handleLogout();
  }
  handleSkipOSM() {
    this.dispatchEvent(new CustomEvent("osm-skipped")), this.dispatchEvent(new CustomEvent("auth-complete")), this.redirectAfterLogin && (window.location.href = this.redirectAfterLogin);
  }
  render() {
    var e, t, n;
    if (this.log(
      "🎨 RENDER - showProfile:",
      this.showProfile,
      "user:",
      !!this.user,
      "loading:",
      this.loading
    ), this.loading)
      return Ue`
        <wa-button appearance="plain" size="small" disabled>Log in</wa-button>
      `;
    if (this.error)
      return Ue`
        <div class="container">
          <div class="error">${this.error}</div>
        </div>
      `;
    if (this.user) {
      const i = this.osmRequired && !this.osmConnected && !this.osmLoading, s = this.displayNameAttr || this.profileDisplayName || this.user.username || this.user.email || this.user.id, a = s ? s[0].toUpperCase() : "U";
      return this.showProfile ? Ue`
          <div class="container">
            <div class="profile">
              <div class="profile-header">
                <div class="profile-avatar">${a}</div>
                <div class="profile-info">
                  <div class="profile-email">
                    ${this.user.email || this.user.id}
                  </div>
                </div>
              </div>

              ${this.osmRequired && this.osmLoading ? Ue`
                    <div class="osm-section">
                      <div class="loading">Checking OSM connection...</div>
                    </div>
                  ` : this.osmRequired && this.osmConnected ? Ue`
                      <div class="osm-section">
                        <div class="osm-connected">
                          <div class="osm-badge">
                            <span class="osm-badge-icon">🗺️</span>
                            <div>
                              <div>Connected to OpenStreetMap</div>
                              ${(e = this.osmData) != null && e.osm_username ? Ue`
                                    <div class="osm-username">
                                      @${this.osmData.osm_username}
                                    </div>
                                  ` : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    ` : ""}
              ${i ? Ue`
                    <div class="osm-section">
                      ${this.autoConnect ? Ue`
                            <div class="osm-connecting">
                              <div class="spinner"></div>
                              <div class="connecting-text">
                                🗺️ Connecting to OpenStreetMap...
                              </div>
                            </div>
                          ` : Ue`
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

              <button @click=${this.handleLogout} class="btn-logout">
                Logout
              </button>
            </div>
          </div>
        ` : Ue`
          <wa-dropdown
            placement="bottom-end"
            distance="4"
            @wa-select=${this.handleDropdownSelect}
          >
            <wa-button
              slot="trigger"
              class="no-hover"
              appearance="plain"
              size="small"
              style="position: relative;"
            >
              <span class="header-avatar">${a}</span>
              ${this.osmConnected ? Ue`
                    <span
                      class="osm-status-badge connected"
                      title="Connected to OSM as @${(t = this.osmData) == null ? void 0 : t.osm_username}"
                      >✓</span
                    >
                  ` : this.osmRequired ? Ue`
                      <span
                        class="osm-status-badge required"
                        title="OSM connection required"
                        >!</span
                      >
                    ` : ""}
            </wa-button>
            <div class="profile-info">
              <div class="profile-name">${s}</div>
              <div class="profile-email">
                ${this.user.email || this.user.id}
              </div>
            </div>
            <wa-dropdown-item value="profile">
              <wa-icon slot="icon" name="address-card"></wa-icon>
              My HOT Account
            </wa-dropdown-item>
            ${this.osmRequired ? this.osmConnected ? Ue`
                    <wa-dropdown-item value="osm-connected" disabled>
                      <wa-icon slot="icon" name="check"></wa-icon>
                      Connected to OSM (@${(n = this.osmData) == null ? void 0 : n.osm_username})
                    </wa-dropdown-item>
                  ` : Ue`
                    <wa-dropdown-item value="connect-osm">
                      <wa-icon slot="icon" name="map"></wa-icon>
                      Connect OSM
                    </wa-dropdown-item>
                  ` : ""}
            <wa-dropdown-item value="logout" variant="danger">
              <wa-icon slot="icon" name="right-from-bracket"></wa-icon>
              Sign Out
            </wa-dropdown-item>
          </wa-dropdown>
        `;
    } else {
      if (this.showProfile)
        return Ue`
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
        const s = window.location.pathname.includes("/app"), a = this.redirectAfterLogin || (s ? window.location.origin : window.location.href), c = new URLSearchParams(window.location.search).get("auto_connect") === "true" ? "&auto_connect=true" : "", l = this.hankoUrl;
        this.log("🔗 Login URL base:", l);
        const h = `${this.loginUrl || `${l}/app`}?return_to=${encodeURIComponent(
          a
        )}${this.osmRequired ? "&osm_required=true" : ""}${c}`;
        return Ue`<wa-button
          appearance="plain"
          size="small"
          href="${h}"
          >Log in
        </wa-button> `;
      }
    }
  }
};
Bn = Oo(Pa), ut = Io(Bn, 0, "HankoAuth", vi, ut), ut.styles = cs`
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
    // TODO replace with WA button
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
      background: #d73f3f;
      color: white;
    }

    .btn-primary:hover {
      background: #c23535;
    }

    .btn-secondary {
      background: #f0f0f0;
      color: #333;
      margin-top: 8px;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
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
      padding-bottom: var(--hot-spacing-medium);
      margin-top: var(--hot-spacing-medium);
      margin-bottom: var(--hot-spacing-medium);
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
      top: calc(-1 * var(--hot-spacing-2x-small));
      right: var(--hot-spacing-x-small);
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

    /* Remove hover styles from the dropdown trigger button */
    wa-button.no-hover::part(base) {
      transition: none;
    }
    wa-button.no-hover::part(base):hover,
    wa-button.no-hover::part(base):focus,
    wa-button.no-hover::part(base):active {
      background: transparent !important;
      box-shadow: none !important;
    }

    wa-dropdown::part(menu) {
      /* anchor the right edge of the panel to the right edge of the trigger (0 offset).
     */
      right: 0 !important;
      left: auto !important; /* Ensures 'right' takes precedence */
    }

    wa-dropdown-item {
      font-size: var(--hot-font-size-small);
    }

    wa-dropdown-item:hover {
      background-color: var(--hot-color-neutral-50);
    }
  `, Po(Bn, 1, ut);
let fi = ut;
export {
  fi as HankoAuth
};

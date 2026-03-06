/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const nn = globalThis, jn = nn.ShadowRoot && (nn.ShadyCSS === void 0 || nn.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Fn = Symbol(), so = /* @__PURE__ */ new WeakMap();
let oi = class {
  constructor(t, e, o) {
    if (this._$cssResult$ = !0, o !== Fn) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (jn && t === void 0) {
      const o = e !== void 0 && e.length === 1;
      o && (t = so.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), o && so.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Mi = (n) => new oi(typeof n == "string" ? n : n + "", void 0, Fn), Ri = (n, ...t) => {
  const e = n.length === 1 ? n[0] : t.reduce((o, i, r) => o + ((s) => {
    if (s._$cssResult$ === !0) return s.cssText;
    if (typeof s == "number") return s;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + s + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + n[r + 1], n[0]);
  return new oi(e, n, Fn);
}, zi = (n, t) => {
  if (jn) n.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const o = document.createElement("style"), i = nn.litNonce;
    i !== void 0 && o.setAttribute("nonce", i), o.textContent = e.cssText, n.appendChild(o);
  }
}, co = jn ? (n) => n : (n) => n instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const o of t.cssRules) e += o.cssText;
  return Mi(e);
})(n) : n;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Hi, defineProperty: qi, getOwnPropertyDescriptor: ji, getOwnPropertyNames: Fi, getOwnPropertySymbols: Wi, getPrototypeOf: Ki } = Object, tt = globalThis, lo = tt.trustedTypes, Vi = lo ? lo.emptyScript : "", En = tt.reactiveElementPolyfillSupport, Mt = (n, t) => n, mn = { toAttribute(n, t) {
  switch (t) {
    case Boolean:
      n = n ? Vi : null;
      break;
    case Object:
    case Array:
      n = n == null ? n : JSON.stringify(n);
  }
  return n;
}, fromAttribute(n, t) {
  let e = n;
  switch (t) {
    case Boolean:
      e = n !== null;
      break;
    case Number:
      e = n === null ? null : Number(n);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(n);
      } catch {
        e = null;
      }
  }
  return e;
} }, Wn = (n, t) => !Hi(n, t), uo = { attribute: !0, type: String, converter: mn, reflect: !1, useDefault: !1, hasChanged: Wn };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), tt.litPropertyMetadata ?? (tt.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let pt = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = uo) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const o = Symbol(), i = this.getPropertyDescriptor(t, o, e);
      i !== void 0 && qi(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, o) {
    const { get: i, set: r } = ji(this.prototype, t) ?? { get() {
      return this[e];
    }, set(s) {
      this[e] = s;
    } };
    return { get: i, set(s) {
      const d = i == null ? void 0 : i.call(this);
      r == null || r.call(this, s), this.requestUpdate(t, d, o);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? uo;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Mt("elementProperties"))) return;
    const t = Ki(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Mt("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Mt("properties"))) {
      const e = this.properties, o = [...Fi(e), ...Wi(e)];
      for (const i of o) this.createProperty(i, e[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [o, i] of e) this.elementProperties.set(o, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, o] of this.elementProperties) {
      const i = this._$Eu(e, o);
      i !== void 0 && this._$Eh.set(i, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const o = new Set(t.flat(1 / 0).reverse());
      for (const i of o) e.unshift(co(i));
    } else t !== void 0 && e.push(co(t));
    return e;
  }
  static _$Eu(t, e) {
    const o = e.attribute;
    return o === !1 ? void 0 : typeof o == "string" ? o : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var t;
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (t = this.constructor.l) == null || t.forEach((e) => e(this));
  }
  addController(t) {
    var e;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t), this.renderRoot !== void 0 && this.isConnected && ((e = t.hostConnected) == null || e.call(t));
  }
  removeController(t) {
    var e;
    (e = this._$EO) == null || e.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const o of e.keys()) this.hasOwnProperty(o) && (t.set(o, this[o]), delete this[o]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return zi(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((e) => {
      var o;
      return (o = e.hostConnected) == null ? void 0 : o.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((e) => {
      var o;
      return (o = e.hostDisconnected) == null ? void 0 : o.call(e);
    });
  }
  attributeChangedCallback(t, e, o) {
    this._$AK(t, o);
  }
  _$ET(t, e) {
    var r;
    const o = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, o);
    if (i !== void 0 && o.reflect === !0) {
      const s = (((r = o.converter) == null ? void 0 : r.toAttribute) !== void 0 ? o.converter : mn).toAttribute(e, o.type);
      this._$Em = t, s == null ? this.removeAttribute(i) : this.setAttribute(i, s), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var r, s;
    const o = this.constructor, i = o._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const d = o.getPropertyOptions(i), u = typeof d.converter == "function" ? { fromAttribute: d.converter } : ((r = d.converter) == null ? void 0 : r.fromAttribute) !== void 0 ? d.converter : mn;
      this._$Em = i;
      const c = u.fromAttribute(e, d.type);
      this[i] = c ?? ((s = this._$Ej) == null ? void 0 : s.get(i)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(t, e, o, i = !1, r) {
    var s;
    if (t !== void 0) {
      const d = this.constructor;
      if (i === !1 && (r = this[t]), o ?? (o = d.getPropertyOptions(t)), !((o.hasChanged ?? Wn)(r, e) || o.useDefault && o.reflect && r === ((s = this._$Ej) == null ? void 0 : s.get(t)) && !this.hasAttribute(d._$Eu(t, o)))) return;
      this.C(t, e, o);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: o, reflect: i, wrapped: r }, s) {
    o && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, s ?? e ?? this[t]), r !== !0 || s !== void 0) || (this._$AL.has(t) || (this.hasUpdated || o || (e = void 0), this._$AL.set(t, e)), i === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var o;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [r, s] of this._$Ep) this[r] = s;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [r, s] of i) {
        const { wrapped: d } = s, u = this[r];
        d !== !0 || this._$AL.has(r) || u === void 0 || this.C(r, void 0, s, u);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), (o = this._$EO) == null || o.forEach((i) => {
        var r;
        return (r = i.hostUpdate) == null ? void 0 : r.call(i);
      }), this.update(e)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$EO) == null || e.forEach((o) => {
      var i;
      return (i = o.hostUpdated) == null ? void 0 : i.call(o);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
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
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((e) => this._$ET(e, this[e]))), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
pt.elementStyles = [], pt.shadowRootOptions = { mode: "open" }, pt[Mt("elementProperties")] = /* @__PURE__ */ new Map(), pt[Mt("finalized")] = /* @__PURE__ */ new Map(), En == null || En({ ReactiveElement: pt }), (tt.reactiveElementVersions ?? (tt.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Rt = globalThis, ho = (n) => n, fn = Rt.trustedTypes, po = fn ? fn.createPolicy("lit-html", { createHTML: (n) => n }) : void 0, ii = "$lit$", et = `lit$${Math.random().toFixed(9).slice(2)}$`, ai = "?" + et, Bi = `<${ai}>`, dt = document, Ht = () => dt.createComment(""), qt = (n) => n === null || typeof n != "object" && typeof n != "function", Kn = Array.isArray, Zi = (n) => Kn(n) || typeof (n == null ? void 0 : n[Symbol.iterator]) == "function", In = `[ 	
\f\r]`, St = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, mo = /-->/g, fo = />/g, st = RegExp(`>|${In}(?:([^\\s"'>=/]+)(${In}*=${In}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), go = /'/g, vo = /"/g, ri = /^(?:script|style|textarea|title)$/i, Ji = (n) => (t, ...e) => ({ _$litType$: n, strings: t, values: e }), ve = Ji(1), gt = Symbol.for("lit-noChange"), Ae = Symbol.for("lit-nothing"), _o = /* @__PURE__ */ new WeakMap(), ct = dt.createTreeWalker(dt, 129);
function si(n, t) {
  if (!Kn(n) || !n.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return po !== void 0 ? po.createHTML(t) : t;
}
const Yi = (n, t) => {
  const e = n.length - 1, o = [];
  let i, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", s = St;
  for (let d = 0; d < e; d++) {
    const u = n[d];
    let c, l, m = -1, v = 0;
    for (; v < u.length && (s.lastIndex = v, l = s.exec(u), l !== null); ) v = s.lastIndex, s === St ? l[1] === "!--" ? s = mo : l[1] !== void 0 ? s = fo : l[2] !== void 0 ? (ri.test(l[2]) && (i = RegExp("</" + l[2], "g")), s = st) : l[3] !== void 0 && (s = st) : s === st ? l[0] === ">" ? (s = i ?? St, m = -1) : l[1] === void 0 ? m = -2 : (m = s.lastIndex - l[2].length, c = l[1], s = l[3] === void 0 ? st : l[3] === '"' ? vo : go) : s === vo || s === go ? s = st : s === mo || s === fo ? s = St : (s = st, i = void 0);
    const g = s === st && n[d + 1].startsWith("/>") ? " " : "";
    r += s === St ? u + Bi : m >= 0 ? (o.push(c), u.slice(0, m) + ii + u.slice(m) + et + g) : u + et + (m === -2 ? d : g);
  }
  return [si(n, r + (n[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), o];
};
let Mn = class ci {
  constructor({ strings: t, _$litType$: e }, o) {
    let i;
    this.parts = [];
    let r = 0, s = 0;
    const d = t.length - 1, u = this.parts, [c, l] = Yi(t, e);
    if (this.el = ci.createElement(c, o), ct.currentNode = this.el.content, e === 2 || e === 3) {
      const m = this.el.content.firstChild;
      m.replaceWith(...m.childNodes);
    }
    for (; (i = ct.nextNode()) !== null && u.length < d; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const m of i.getAttributeNames()) if (m.endsWith(ii)) {
          const v = l[s++], g = i.getAttribute(m).split(et), k = /([.?@])?(.*)/.exec(v);
          u.push({ type: 1, index: r, name: k[2], strings: g, ctor: k[1] === "." ? Gi : k[1] === "?" ? Xi : k[1] === "@" ? ea : _n }), i.removeAttribute(m);
        } else m.startsWith(et) && (u.push({ type: 6, index: r }), i.removeAttribute(m));
        if (ri.test(i.tagName)) {
          const m = i.textContent.split(et), v = m.length - 1;
          if (v > 0) {
            i.textContent = fn ? fn.emptyScript : "";
            for (let g = 0; g < v; g++) i.append(m[g], Ht()), ct.nextNode(), u.push({ type: 2, index: ++r });
            i.append(m[v], Ht());
          }
        }
      } else if (i.nodeType === 8) if (i.data === ai) u.push({ type: 2, index: r });
      else {
        let m = -1;
        for (; (m = i.data.indexOf(et, m + 1)) !== -1; ) u.push({ type: 7, index: r }), m += et.length - 1;
      }
      r++;
    }
  }
  static createElement(t, e) {
    const o = dt.createElement("template");
    return o.innerHTML = t, o;
  }
};
function vt(n, t, e = n, o) {
  var s, d;
  if (t === gt) return t;
  let i = o !== void 0 ? (s = e._$Co) == null ? void 0 : s[o] : e._$Cl;
  const r = qt(t) ? void 0 : t._$litDirective$;
  return (i == null ? void 0 : i.constructor) !== r && ((d = i == null ? void 0 : i._$AO) == null || d.call(i, !1), r === void 0 ? i = void 0 : (i = new r(n), i._$AT(n, e, o)), o !== void 0 ? (e._$Co ?? (e._$Co = []))[o] = i : e._$Cl = i), i !== void 0 && (t = vt(n, i._$AS(n, t.values), i, o)), t;
}
let Qi = class {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: o } = this._$AD, i = ((t == null ? void 0 : t.creationScope) ?? dt).importNode(e, !0);
    ct.currentNode = i;
    let r = ct.nextNode(), s = 0, d = 0, u = o[0];
    for (; u !== void 0; ) {
      if (s === u.index) {
        let c;
        u.type === 2 ? c = new Vn(r, r.nextSibling, this, t) : u.type === 1 ? c = new u.ctor(r, u.name, u.strings, this, t) : u.type === 6 && (c = new ta(r, this, t)), this._$AV.push(c), u = o[++d];
      }
      s !== (u == null ? void 0 : u.index) && (r = ct.nextNode(), s++);
    }
    return ct.currentNode = dt, i;
  }
  p(t) {
    let e = 0;
    for (const o of this._$AV) o !== void 0 && (o.strings !== void 0 ? (o._$AI(t, o, e), e += o.strings.length - 2) : o._$AI(t[e])), e++;
  }
}, Vn = class li {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, e, o, i) {
    this.type = 2, this._$AH = Ae, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = o, this.options = i, this._$Cv = (i == null ? void 0 : i.isConnected) ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = vt(this, t, e), qt(t) ? t === Ae || t == null || t === "" ? (this._$AH !== Ae && this._$AR(), this._$AH = Ae) : t !== this._$AH && t !== gt && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Zi(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== Ae && qt(this._$AH) ? this._$AA.nextSibling.data = t : this.T(dt.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var r;
    const { values: e, _$litType$: o } = t, i = typeof o == "number" ? this._$AC(t) : (o.el === void 0 && (o.el = Mn.createElement(si(o.h, o.h[0]), this.options)), o);
    if (((r = this._$AH) == null ? void 0 : r._$AD) === i) this._$AH.p(e);
    else {
      const s = new Qi(i, this), d = s.u(this.options);
      s.p(e), this.T(d), this._$AH = s;
    }
  }
  _$AC(t) {
    let e = _o.get(t.strings);
    return e === void 0 && _o.set(t.strings, e = new Mn(t)), e;
  }
  k(t) {
    Kn(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let o, i = 0;
    for (const r of t) i === e.length ? e.push(o = new li(this.O(Ht()), this.O(Ht()), this, this.options)) : o = e[i], o._$AI(r), i++;
    i < e.length && (this._$AR(o && o._$AB.nextSibling, i), e.length = i);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var o;
    for ((o = this._$AP) == null ? void 0 : o.call(this, !1, !0, e); t !== this._$AB; ) {
      const i = ho(t).nextSibling;
      ho(t).remove(), t = i;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cv = t, (e = this._$AP) == null || e.call(this, t));
  }
}, _n = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, o, i, r) {
    this.type = 1, this._$AH = Ae, this._$AN = void 0, this.element = t, this.name = e, this._$AM = i, this.options = r, o.length > 2 || o[0] !== "" || o[1] !== "" ? (this._$AH = Array(o.length - 1).fill(new String()), this.strings = o) : this._$AH = Ae;
  }
  _$AI(t, e = this, o, i) {
    const r = this.strings;
    let s = !1;
    if (r === void 0) t = vt(this, t, e, 0), s = !qt(t) || t !== this._$AH && t !== gt, s && (this._$AH = t);
    else {
      const d = t;
      let u, c;
      for (t = r[0], u = 0; u < r.length - 1; u++) c = vt(this, d[o + u], e, u), c === gt && (c = this._$AH[u]), s || (s = !qt(c) || c !== this._$AH[u]), c === Ae ? t = Ae : t !== Ae && (t += (c ?? "") + r[u + 1]), this._$AH[u] = c;
    }
    s && !i && this.j(t);
  }
  j(t) {
    t === Ae ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}, Gi = class extends _n {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === Ae ? void 0 : t;
  }
}, Xi = class extends _n {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== Ae);
  }
}, ea = class extends _n {
  constructor(t, e, o, i, r) {
    super(t, e, o, i, r), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = vt(this, t, e, 0) ?? Ae) === gt) return;
    const o = this._$AH, i = t === Ae && o !== Ae || t.capture !== o.capture || t.once !== o.once || t.passive !== o.passive, r = t !== Ae && (o === Ae || i);
    i && this.element.removeEventListener(this.name, this, o), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e;
    typeof this._$AH == "function" ? this._$AH.call(((e = this.options) == null ? void 0 : e.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}, ta = class {
  constructor(t, e, o) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = o;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    vt(this, t);
  }
};
const On = Rt.litHtmlPolyfillSupport;
On == null || On(Mn, Vn), (Rt.litHtmlVersions ?? (Rt.litHtmlVersions = [])).push("3.3.2");
const na = (n, t, e) => {
  const o = (e == null ? void 0 : e.renderBefore) ?? t;
  let i = o._$litPart$;
  if (i === void 0) {
    const r = (e == null ? void 0 : e.renderBefore) ?? null;
    o._$litPart$ = i = new Vn(t.insertBefore(Ht(), r), r, void 0, e ?? {});
  }
  return i._$AI(n), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const lt = globalThis;
let zt = class extends pt {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var e;
    const t = super.createRenderRoot();
    return (e = this.renderOptions).renderBefore ?? (e.renderBefore = t.firstChild), t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = na(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) == null || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) == null || t.setConnected(!1);
  }
  render() {
    return gt;
  }
};
var ni;
zt._$litElement$ = !0, zt.finalized = !0, (ni = lt.litElementHydrateSupport) == null || ni.call(lt, { LitElement: zt });
const Tn = lt.litElementPolyfillSupport;
Tn == null || Tn({ LitElement: zt });
(lt.litElementVersions ?? (lt.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const oa = (n) => (t, e) => {
  e !== void 0 ? e.addInitializer(() => {
    customElements.define(n, t);
  }) : customElements.define(n, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ia = { attribute: !0, type: String, converter: mn, reflect: !1, hasChanged: Wn }, aa = (n = ia, t, e) => {
  const { kind: o, metadata: i } = e;
  let r = globalThis.litPropertyMetadata.get(i);
  if (r === void 0 && globalThis.litPropertyMetadata.set(i, r = /* @__PURE__ */ new Map()), o === "setter" && ((n = Object.create(n)).wrapped = !0), r.set(e.name, n), o === "accessor") {
    const { name: s } = e;
    return { set(d) {
      const u = t.get.call(this);
      t.set.call(this, d), this.requestUpdate(s, u, n, !0, d);
    }, init(d) {
      return d !== void 0 && this.C(s, void 0, n, d), d;
    } };
  }
  if (o === "setter") {
    const { name: s } = e;
    return function(d) {
      const u = this[s];
      t.call(this, d), this.requestUpdate(s, u, n, !0, d);
    };
  }
  throw Error("Unsupported decorator location: " + o);
};
function Pe(n) {
  return (t, e) => typeof e == "object" ? aa(n, t, e) : ((o, i, r) => {
    const s = i.hasOwnProperty(r);
    return i.constructor.createProperty(r, o), s ? Object.getOwnPropertyDescriptor(i, r) : void 0;
  })(n, t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function qe(n) {
  return Pe({ ...n, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ra = (n) => (...t) => ({ _$litDirective$: n, values: t });
let sa = class {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, e, o) {
    this._$Ct = t, this._$AM = e, this._$Ci = o;
  }
  _$AS(t, e) {
    return this.update(t, e);
  }
  update(t, e) {
    return this.render(...e);
  }
};
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ca = {}, la = (n, t = ca) => n._$AH = t;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const da = ra(class extends sa {
  constructor() {
    super(...arguments), this.key = Ae;
  }
  render(n, t) {
    return this.key = n, t;
  }
  update(n, [t, e]) {
    return t !== this.key && (la(n), this.key = t), e;
  }
});
/*! For license information please see elements.js.LICENSE.txt */
var ua = { 7(n, t, e) {
  (function(o, i, r) {
    function s(w, E) {
      return [w, !w || w.endsWith("/") ? "" : "/", E, ".json"].join("");
    }
    function d(w, E) {
      let I = w;
      return E && Object.keys(E).forEach((M) => {
        const z = E[M], F = new RegExp(`{${M}}`, "gm");
        I = I.replace(F, z.toString());
      }), I;
    }
    function u(w, E, I) {
      let M = w[E];
      if (!M) return I;
      const z = I.split(".");
      let F = "";
      do {
        F += z.shift();
        const V = M[F];
        V === void 0 || typeof V != "object" && z.length ? z.length ? F += "." : M = I : (M = V, F = "");
      } while (z.length);
      return M;
    }
    var c = Object.defineProperty, l = Object.getOwnPropertySymbols, m = Object.prototype.hasOwnProperty, v = Object.prototype.propertyIsEnumerable, g = (w, E, I) => E in w ? c(w, E, { enumerable: !0, configurable: !0, writable: !0, value: I }) : w[E] = I, k = (w, E, I) => new Promise((M, z) => {
      var F = (N) => {
        try {
          X(I.next(N));
        } catch (fe) {
          z(fe);
        }
      }, V = (N) => {
        try {
          X(I.throw(N));
        } catch (fe) {
          z(fe);
        }
      }, X = (N) => N.done ? M(N.value) : Promise.resolve(N.value).then(F, V);
      X((I = I.apply(w, E)).next());
    });
    let x = {};
    const C = { root: "", lang: "en", fallbackLang: "en" };
    function D(w, E) {
      w = Object.assign({}, C, w), x = E || x;
      const [I, M] = r.useState(w.lang), [z, F] = r.useState(x), [V, X] = r.useState(!1), N = r.useCallback((_e) => k(null, null, function* () {
        if (!z[_e]) {
          X(!1);
          try {
            const ue = s(w.root, _e), le = yield fetch(ue);
            x[_e] = yield le.json();
          } catch (ue) {
            console.error(`Failed to load language data for ${_e}:`, ue);
          } finally {
            F(((ue, le) => {
              for (var re in le || (le = {})) m.call(le, re) && g(ue, re, le[re]);
              if (l) for (var re of l(le)) v.call(le, re) && g(ue, re, le[re]);
              return ue;
            })({}, x)), X(!0);
          }
        }
      }), [z, w.root]);
      r.useEffect(() => {
        k(null, null, function* () {
          yield N(w.fallbackLang), yield N(I);
        });
      }, [I, N, w.fallbackLang]);
      const fe = r.useMemo(() => (_e, ue) => {
        if (!Object.prototype.hasOwnProperty.call(z, I)) return _e;
        let le = u(z, I, _e);
        return le === _e && I !== w.fallbackLang && (le = u(z, w.fallbackLang, _e)), d(le, ue);
      }, [z, I, w.fallbackLang]);
      return { lang: I, setLang: M, t: fe, isReady: V };
    }
    const W = i.createContext(null);
    o.TranslateContext = W, o.TranslateProvider = (w) => {
      const { t: E, setLang: I, lang: M, isReady: z } = D({ root: w.root || "assets", lang: w.lang || "en", fallbackLang: w.fallbackLang || "en" }, w.translations);
      return i.h(W.Provider, { value: { t: E, setLang: I, lang: M, isReady: z } }, w.children);
    }, o.format = d, o.getResourceUrl = s, o.getValue = u, Object.defineProperty(o, "__esModule", { value: !0 });
  })(t, e(616), e(78));
}, 616(n, t, e) {
  e.r(t), e.d(t, { Component: () => X, Fragment: () => V, cloneElement: () => Re, createContext: () => An, createElement: () => M, createRef: () => F, h: () => M, hydrate: () => bt, isValidElement: () => s, options: () => i, render: () => at, toChildArray: () => Ne });
  var o, i, r, s, d, u, c, l, m, v, g, k, x, C = {}, D = [], W = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, w = Array.isArray;
  function E(p, h) {
    for (var _ in h) p[_] = h[_];
    return p;
  }
  function I(p) {
    p && p.parentNode && p.parentNode.removeChild(p);
  }
  function M(p, h, _) {
    var P, T, y, L = {};
    for (y in h) y == "key" ? P = h[y] : y == "ref" ? T = h[y] : L[y] = h[y];
    if (arguments.length > 2 && (L.children = arguments.length > 3 ? o.call(arguments, 2) : _), typeof p == "function" && p.defaultProps != null) for (y in p.defaultProps) L[y] === void 0 && (L[y] = p.defaultProps[y]);
    return z(p, L, P, T, null);
  }
  function z(p, h, _, P, T) {
    var y = { type: p, props: h, key: _, ref: P, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: T ?? ++r, __i: -1, __u: 0 };
    return T == null && i.vnode != null && i.vnode(y), y;
  }
  function F() {
    return { current: null };
  }
  function V(p) {
    return p.children;
  }
  function X(p, h) {
    this.props = p, this.context = h;
  }
  function N(p, h) {
    if (h == null) return p.__ ? N(p.__, p.__i + 1) : null;
    for (var _; h < p.__k.length; h++) if ((_ = p.__k[h]) != null && _.__e != null) return _.__e;
    return typeof p.type == "function" ? N(p) : null;
  }
  function fe(p) {
    var h, _;
    if ((p = p.__) != null && p.__c != null) {
      for (p.__e = p.__c.base = null, h = 0; h < p.__k.length; h++) if ((_ = p.__k[h]) != null && _.__e != null) {
        p.__e = p.__c.base = _.__e;
        break;
      }
      return fe(p);
    }
  }
  function _e(p) {
    (!p.__d && (p.__d = !0) && d.push(p) && !ue.__r++ || u != i.debounceRendering) && ((u = i.debounceRendering) || c)(ue);
  }
  function ue() {
    for (var p, h, _, P, T, y, L, j = 1; d.length; ) d.length > j && d.sort(l), p = d.shift(), j = d.length, p.__d && (_ = void 0, P = void 0, T = (P = (h = p).__v).__e, y = [], L = [], h.__P && ((_ = E({}, P)).__v = P.__v + 1, i.vnode && i.vnode(_), U(h.__P, _, P, h.__n, h.__P.namespaceURI, 32 & P.__u ? [T] : null, y, T ?? N(P), !!(32 & P.__u), L), _.__v = P.__v, _.__.__k[_.__i] = _, q(y, _, L), P.__e = P.__ = null, _.__e != T && fe(_)));
    ue.__r = 0;
  }
  function le(p, h, _, P, T, y, L, j, he, R, ie) {
    var S, be, B, Oe, je, $e, ge, pe = P && P.__k || D, Xe = h.length;
    for (he = re(_, h, pe, he, Xe), S = 0; S < Xe; S++) (B = _.__k[S]) != null && (be = B.__i == -1 ? C : pe[B.__i] || C, B.__i = S, $e = U(p, B, be, T, y, L, j, he, R, ie), Oe = B.__e, B.ref && be.ref != B.ref && (be.ref && se(be.ref, null, B), ie.push(B.ref, B.__c || Oe, B)), je == null && Oe != null && (je = Oe), (ge = !!(4 & B.__u)) || be.__k === B.__k ? he = ye(B, he, p, ge) : typeof B.type == "function" && $e !== void 0 ? he = $e : Oe && (he = Oe.nextSibling), B.__u &= -7);
    return _.__e = je, he;
  }
  function re(p, h, _, P, T) {
    var y, L, j, he, R, ie = _.length, S = ie, be = 0;
    for (p.__k = new Array(T), y = 0; y < T; y++) (L = h[y]) != null && typeof L != "boolean" && typeof L != "function" ? (typeof L == "string" || typeof L == "number" || typeof L == "bigint" || L.constructor == String ? L = p.__k[y] = z(null, L, null, null, null) : w(L) ? L = p.__k[y] = z(V, { children: L }, null, null, null) : L.constructor === void 0 && L.__b > 0 ? L = p.__k[y] = z(L.type, L.props, L.key, L.ref ? L.ref : null, L.__v) : p.__k[y] = L, he = y + be, L.__ = p, L.__b = p.__b + 1, j = null, (R = L.__i = ot(L, _, he, S)) != -1 && (S--, (j = _[R]) && (j.__u |= 2)), j == null || j.__v == null ? (R == -1 && (T > ie ? be-- : T < ie && be++), typeof L.type != "function" && (L.__u |= 4)) : R != he && (R == he - 1 ? be-- : R == he + 1 ? be++ : (R > he ? be-- : be++, L.__u |= 4))) : p.__k[y] = null;
    if (S) for (y = 0; y < ie; y++) (j = _[y]) != null && !(2 & j.__u) && (j.__e == P && (P = N(j)), Ie(j, j));
    return P;
  }
  function ye(p, h, _, P) {
    var T, y;
    if (typeof p.type == "function") {
      for (T = p.__k, y = 0; T && y < T.length; y++) T[y] && (T[y].__ = p, h = ye(T[y], h, _, P));
      return h;
    }
    p.__e != h && (P && (h && p.type && !h.parentNode && (h = N(p)), _.insertBefore(p.__e, h || null)), h = p.__e);
    do
      h = h && h.nextSibling;
    while (h != null && h.nodeType == 8);
    return h;
  }
  function Ne(p, h) {
    return h = h || [], p == null || typeof p == "boolean" || (w(p) ? p.some(function(_) {
      Ne(_, h);
    }) : h.push(p)), h;
  }
  function ot(p, h, _, P) {
    var T, y, L, j = p.key, he = p.type, R = h[_], ie = R != null && !(2 & R.__u);
    if (R === null && j == null || ie && j == R.key && he == R.type) return _;
    if (P > (ie ? 1 : 0)) {
      for (T = _ - 1, y = _ + 1; T >= 0 || y < h.length; ) if ((R = h[L = T >= 0 ? T-- : y++]) != null && !(2 & R.__u) && j == R.key && he == R.type) return L;
    }
    return -1;
  }
  function it(p, h, _) {
    h[0] == "-" ? p.setProperty(h, _ ?? "") : p[h] = _ == null ? "" : typeof _ != "number" || W.test(h) ? _ : _ + "px";
  }
  function A(p, h, _, P, T) {
    var y, L;
    e: if (h == "style") if (typeof _ == "string") p.style.cssText = _;
    else {
      if (typeof P == "string" && (p.style.cssText = P = ""), P) for (h in P) _ && h in _ || it(p.style, h, "");
      if (_) for (h in _) P && _[h] == P[h] || it(p.style, h, _[h]);
    }
    else if (h[0] == "o" && h[1] == "n") y = h != (h = h.replace(m, "$1")), L = h.toLowerCase(), h = L in p || h == "onFocusOut" || h == "onFocusIn" ? L.slice(2) : h.slice(2), p.l || (p.l = {}), p.l[h + y] = _, _ ? P ? _.u = P.u : (_.u = v, p.addEventListener(h, y ? k : g, y)) : p.removeEventListener(h, y ? k : g, y);
    else {
      if (T == "http://www.w3.org/2000/svg") h = h.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if (h != "width" && h != "height" && h != "href" && h != "list" && h != "form" && h != "tabIndex" && h != "download" && h != "rowSpan" && h != "colSpan" && h != "role" && h != "popover" && h in p) try {
        p[h] = _ ?? "";
        break e;
      } catch {
      }
      typeof _ == "function" || (_ == null || _ === !1 && h[4] != "-" ? p.removeAttribute(h) : p.setAttribute(h, h == "popover" && _ == 1 ? "" : _));
    }
  }
  function O(p) {
    return function(h) {
      if (this.l) {
        var _ = this.l[h.type + p];
        if (h.t == null) h.t = v++;
        else if (h.t < _.u) return;
        return _(i.event ? i.event(h) : h);
      }
    };
  }
  function U(p, h, _, P, T, y, L, j, he, R) {
    var ie, S, be, B, Oe, je, $e, ge, pe, Xe, rt, Bt, wt, ro, Zt, kt, Pn, Ve = h.type;
    if (h.constructor !== void 0) return null;
    128 & _.__u && (he = !!(32 & _.__u), y = [j = h.__e = _.__e]), (ie = i.__b) && ie(h);
    e: if (typeof Ve == "function") try {
      if (ge = h.props, pe = "prototype" in Ve && Ve.prototype.render, Xe = (ie = Ve.contextType) && P[ie.__c], rt = ie ? Xe ? Xe.props.value : ie.__ : P, _.__c ? $e = (S = h.__c = _.__c).__ = S.__E : (pe ? h.__c = S = new Ve(ge, rt) : (h.__c = S = new X(ge, rt), S.constructor = Ve, S.render = Ke), Xe && Xe.sub(S), S.state || (S.state = {}), S.__n = P, be = S.__d = !0, S.__h = [], S._sb = []), pe && S.__s == null && (S.__s = S.state), pe && Ve.getDerivedStateFromProps != null && (S.__s == S.state && (S.__s = E({}, S.__s)), E(S.__s, Ve.getDerivedStateFromProps(ge, S.__s))), B = S.props, Oe = S.state, S.__v = h, be) pe && Ve.getDerivedStateFromProps == null && S.componentWillMount != null && S.componentWillMount(), pe && S.componentDidMount != null && S.__h.push(S.componentDidMount);
      else {
        if (pe && Ve.getDerivedStateFromProps == null && ge !== B && S.componentWillReceiveProps != null && S.componentWillReceiveProps(ge, rt), h.__v == _.__v || !S.__e && S.shouldComponentUpdate != null && S.shouldComponentUpdate(ge, S.__s, rt) === !1) {
          for (h.__v != _.__v && (S.props = ge, S.state = S.__s, S.__d = !1), h.__e = _.__e, h.__k = _.__k, h.__k.some(function(ht) {
            ht && (ht.__ = h);
          }), Bt = 0; Bt < S._sb.length; Bt++) S.__h.push(S._sb[Bt]);
          S._sb = [], S.__h.length && L.push(S);
          break e;
        }
        S.componentWillUpdate != null && S.componentWillUpdate(ge, S.__s, rt), pe && S.componentDidUpdate != null && S.__h.push(function() {
          S.componentDidUpdate(B, Oe, je);
        });
      }
      if (S.context = rt, S.props = ge, S.__P = p, S.__e = !1, wt = i.__r, ro = 0, pe) {
        for (S.state = S.__s, S.__d = !1, wt && wt(h), ie = S.render(S.props, S.state, S.context), Zt = 0; Zt < S._sb.length; Zt++) S.__h.push(S._sb[Zt]);
        S._sb = [];
      } else do
        S.__d = !1, wt && wt(h), ie = S.render(S.props, S.state, S.context), S.state = S.__s;
      while (S.__d && ++ro < 25);
      S.state = S.__s, S.getChildContext != null && (P = E(E({}, P), S.getChildContext())), pe && !be && S.getSnapshotBeforeUpdate != null && (je = S.getSnapshotBeforeUpdate(B, Oe)), kt = ie, ie != null && ie.type === V && ie.key == null && (kt = H(ie.props.children)), j = le(p, w(kt) ? kt : [kt], h, _, P, T, y, L, j, he, R), S.base = h.__e, h.__u &= -161, S.__h.length && L.push(S), $e && (S.__E = S.__ = null);
    } catch (ht) {
      if (h.__v = null, he || y != null) if (ht.then) {
        for (h.__u |= he ? 160 : 128; j && j.nodeType == 8 && j.nextSibling; ) j = j.nextSibling;
        y[y.indexOf(j)] = null, h.__e = j;
      } else {
        for (Pn = y.length; Pn--; ) I(y[Pn]);
        Z(h);
      }
      else h.__e = _.__e, h.__k = _.__k, ht.then || Z(h);
      i.__e(ht, h, _);
    }
    else y == null && h.__v == _.__v ? (h.__k = _.__k, h.__e = _.__e) : j = h.__e = Ce(_.__e, h, _, P, T, y, L, he, R);
    return (ie = i.diffed) && ie(h), 128 & h.__u ? void 0 : j;
  }
  function Z(p) {
    p && p.__c && (p.__c.__e = !0), p && p.__k && p.__k.forEach(Z);
  }
  function q(p, h, _) {
    for (var P = 0; P < _.length; P++) se(_[P], _[++P], _[++P]);
    i.__c && i.__c(h, p), p.some(function(T) {
      try {
        p = T.__h, T.__h = [], p.some(function(y) {
          y.call(T);
        });
      } catch (y) {
        i.__e(y, T.__v);
      }
    });
  }
  function H(p) {
    return typeof p != "object" || p == null || p.__b && p.__b > 0 ? p : w(p) ? p.map(H) : E({}, p);
  }
  function Ce(p, h, _, P, T, y, L, j, he) {
    var R, ie, S, be, B, Oe, je, $e = _.props || C, ge = h.props, pe = h.type;
    if (pe == "svg" ? T = "http://www.w3.org/2000/svg" : pe == "math" ? T = "http://www.w3.org/1998/Math/MathML" : T || (T = "http://www.w3.org/1999/xhtml"), y != null) {
      for (R = 0; R < y.length; R++) if ((B = y[R]) && "setAttribute" in B == !!pe && (pe ? B.localName == pe : B.nodeType == 3)) {
        p = B, y[R] = null;
        break;
      }
    }
    if (p == null) {
      if (pe == null) return document.createTextNode(ge);
      p = document.createElementNS(T, pe, ge.is && ge), j && (i.__m && i.__m(h, y), j = !1), y = null;
    }
    if (pe == null) $e === ge || j && p.data == ge || (p.data = ge);
    else {
      if (y = y && o.call(p.childNodes), !j && y != null) for ($e = {}, R = 0; R < p.attributes.length; R++) $e[(B = p.attributes[R]).name] = B.value;
      for (R in $e) if (B = $e[R], R != "children") {
        if (R == "dangerouslySetInnerHTML") S = B;
        else if (!(R in ge)) {
          if (R == "value" && "defaultValue" in ge || R == "checked" && "defaultChecked" in ge) continue;
          A(p, R, null, B, T);
        }
      }
      for (R in ge) B = ge[R], R == "children" ? be = B : R == "dangerouslySetInnerHTML" ? ie = B : R == "value" ? Oe = B : R == "checked" ? je = B : j && typeof B != "function" || $e[R] === B || A(p, R, B, $e[R], T);
      if (ie) j || S && (ie.__html == S.__html || ie.__html == p.innerHTML) || (p.innerHTML = ie.__html), h.__k = [];
      else if (S && (p.innerHTML = ""), le(h.type == "template" ? p.content : p, w(be) ? be : [be], h, _, P, pe == "foreignObject" ? "http://www.w3.org/1999/xhtml" : T, y, L, y ? y[0] : _.__k && N(_, 0), j, he), y != null) for (R = y.length; R--; ) I(y[R]);
      j || (R = "value", pe == "progress" && Oe == null ? p.removeAttribute("value") : Oe != null && (Oe !== p[R] || pe == "progress" && !Oe || pe == "option" && Oe != $e[R]) && A(p, R, Oe, $e[R], T), R = "checked", je != null && je != p[R] && A(p, R, je, $e[R], T));
    }
    return p;
  }
  function se(p, h, _) {
    try {
      if (typeof p == "function") {
        var P = typeof p.__u == "function";
        P && p.__u(), P && h == null || (p.__u = p(h));
      } else p.current = h;
    } catch (T) {
      i.__e(T, _);
    }
  }
  function Ie(p, h, _) {
    var P, T;
    if (i.unmount && i.unmount(p), (P = p.ref) && (P.current && P.current != p.__e || se(P, null, h)), (P = p.__c) != null) {
      if (P.componentWillUnmount) try {
        P.componentWillUnmount();
      } catch (y) {
        i.__e(y, h);
      }
      P.base = P.__P = null;
    }
    if (P = p.__k) for (T = 0; T < P.length; T++) P[T] && Ie(P[T], h, _ || typeof p.type != "function");
    _ || I(p.__e), p.__c = p.__ = p.__e = void 0;
  }
  function Ke(p, h, _) {
    return this.constructor(p, _);
  }
  function at(p, h, _) {
    var P, T, y, L;
    h == document && (h = document.documentElement), i.__ && i.__(p, h), T = (P = typeof _ == "function") ? null : _ && _.__k || h.__k, y = [], L = [], U(h, p = (!P && _ || h).__k = M(V, null, [p]), T || C, C, h.namespaceURI, !P && _ ? [_] : T ? null : h.firstChild ? o.call(h.childNodes) : null, y, !P && _ ? _ : T ? T.__e : h.firstChild, P, L), q(y, p, L);
  }
  function bt(p, h) {
    at(p, h, bt);
  }
  function Re(p, h, _) {
    var P, T, y, L, j = E({}, p.props);
    for (y in p.type && p.type.defaultProps && (L = p.type.defaultProps), h) y == "key" ? P = h[y] : y == "ref" ? T = h[y] : j[y] = h[y] === void 0 && L != null ? L[y] : h[y];
    return arguments.length > 2 && (j.children = arguments.length > 3 ? o.call(arguments, 2) : _), z(p.type, j, P || p.key, T || p.ref, null);
  }
  function An(p) {
    function h(_) {
      var P, T;
      return this.getChildContext || (P = /* @__PURE__ */ new Set(), (T = {})[h.__c] = this, this.getChildContext = function() {
        return T;
      }, this.componentWillUnmount = function() {
        P = null;
      }, this.shouldComponentUpdate = function(y) {
        this.props.value != y.value && P.forEach(function(L) {
          L.__e = !0, _e(L);
        });
      }, this.sub = function(y) {
        P.add(y);
        var L = y.componentWillUnmount;
        y.componentWillUnmount = function() {
          P && P.delete(y), L && L.call(y);
        };
      }), _.children;
    }
    return h.__c = "__cC" + x++, h.__ = p, h.Provider = h.__l = (h.Consumer = function(_, P) {
      return _.children(P);
    }).contextType = h, h;
  }
  o = D.slice, i = { __e: function(p, h, _, P) {
    for (var T, y, L; h = h.__; ) if ((T = h.__c) && !T.__) try {
      if ((y = T.constructor) && y.getDerivedStateFromError != null && (T.setState(y.getDerivedStateFromError(p)), L = T.__d), T.componentDidCatch != null && (T.componentDidCatch(p, P || {}), L = T.__d), L) return T.__E = T;
    } catch (j) {
      p = j;
    }
    throw p;
  } }, r = 0, s = function(p) {
    return p != null && p.constructor === void 0;
  }, X.prototype.setState = function(p, h) {
    var _;
    _ = this.__s != null && this.__s != this.state ? this.__s : this.__s = E({}, this.state), typeof p == "function" && (p = p(E({}, _), this.props)), p && E(_, p), p != null && this.__v && (h && this._sb.push(h), _e(this));
  }, X.prototype.forceUpdate = function(p) {
    this.__v && (this.__e = !0, p && this.__h.push(p), _e(this));
  }, X.prototype.render = V, d = [], c = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, l = function(p, h) {
    return p.__v.__b - h.__v.__b;
  }, ue.__r = 0, m = /(PointerCapture)$|Capture$/i, v = 0, g = O(!1), k = O(!0), x = 0;
}, 78(n, t, e) {
  e.r(t), e.d(t, { useCallback: () => V, useContext: () => X, useDebugValue: () => N, useEffect: () => E, useErrorBoundary: () => fe, useId: () => _e, useImperativeHandle: () => z, useLayoutEffect: () => I, useMemo: () => F, useReducer: () => w, useRef: () => M, useState: () => W });
  var o, i, r, s, d = e(616), u = 0, c = [], l = d.options, m = l.__b, v = l.__r, g = l.diffed, k = l.__c, x = l.unmount, C = l.__;
  function D(A, O) {
    l.__h && l.__h(i, A, u || O), u = 0;
    var U = i.__H || (i.__H = { __: [], __h: [] });
    return A >= U.__.length && U.__.push({}), U.__[A];
  }
  function W(A) {
    return u = 1, w(it, A);
  }
  function w(A, O, U) {
    var Z = D(o++, 2);
    if (Z.t = A, !Z.__c && (Z.__ = [U ? U(O) : it(void 0, O), function(se) {
      var Ie = Z.__N ? Z.__N[0] : Z.__[0], Ke = Z.t(Ie, se);
      Ie !== Ke && (Z.__N = [Ke, Z.__[1]], Z.__c.setState({}));
    }], Z.__c = i, !i.__f)) {
      var q = function(se, Ie, Ke) {
        if (!Z.__c.__H) return !0;
        var at = Z.__c.__H.__.filter(function(Re) {
          return !!Re.__c;
        });
        if (at.every(function(Re) {
          return !Re.__N;
        })) return !H || H.call(this, se, Ie, Ke);
        var bt = Z.__c.props !== se;
        return at.forEach(function(Re) {
          if (Re.__N) {
            var An = Re.__[0];
            Re.__ = Re.__N, Re.__N = void 0, An !== Re.__[0] && (bt = !0);
          }
        }), H && H.call(this, se, Ie, Ke) || bt;
      };
      i.__f = !0;
      var H = i.shouldComponentUpdate, Ce = i.componentWillUpdate;
      i.componentWillUpdate = function(se, Ie, Ke) {
        if (this.__e) {
          var at = H;
          H = void 0, q(se, Ie, Ke), H = at;
        }
        Ce && Ce.call(this, se, Ie, Ke);
      }, i.shouldComponentUpdate = q;
    }
    return Z.__N || Z.__;
  }
  function E(A, O) {
    var U = D(o++, 3);
    !l.__s && ot(U.__H, O) && (U.__ = A, U.u = O, i.__H.__h.push(U));
  }
  function I(A, O) {
    var U = D(o++, 4);
    !l.__s && ot(U.__H, O) && (U.__ = A, U.u = O, i.__h.push(U));
  }
  function M(A) {
    return u = 5, F(function() {
      return { current: A };
    }, []);
  }
  function z(A, O, U) {
    u = 6, I(function() {
      if (typeof A == "function") {
        var Z = A(O());
        return function() {
          A(null), Z && typeof Z == "function" && Z();
        };
      }
      if (A) return A.current = O(), function() {
        return A.current = null;
      };
    }, U == null ? U : U.concat(A));
  }
  function F(A, O) {
    var U = D(o++, 7);
    return ot(U.__H, O) && (U.__ = A(), U.__H = O, U.__h = A), U.__;
  }
  function V(A, O) {
    return u = 8, F(function() {
      return A;
    }, O);
  }
  function X(A) {
    var O = i.context[A.__c], U = D(o++, 9);
    return U.c = A, O ? (U.__ == null && (U.__ = !0, O.sub(i)), O.props.value) : A.__;
  }
  function N(A, O) {
    l.useDebugValue && l.useDebugValue(O ? O(A) : A);
  }
  function fe(A) {
    var O = D(o++, 10), U = W();
    return O.__ = A, i.componentDidCatch || (i.componentDidCatch = function(Z, q) {
      O.__ && O.__(Z, q), U[1](Z);
    }), [U[0], function() {
      U[1](void 0);
    }];
  }
  function _e() {
    var A = D(o++, 11);
    if (!A.__) {
      for (var O = i.__v; O !== null && !O.__m && O.__ !== null; ) O = O.__;
      var U = O.__m || (O.__m = [0, 0]);
      A.__ = "P" + U[0] + "-" + U[1]++;
    }
    return A.__;
  }
  function ue() {
    for (var A; A = c.shift(); ) if (A.__P && A.__H) try {
      A.__H.__h.forEach(ye), A.__H.__h.forEach(Ne), A.__H.__h = [];
    } catch (O) {
      A.__H.__h = [], l.__e(O, A.__v);
    }
  }
  l.__b = function(A) {
    i = null, m && m(A);
  }, l.__ = function(A, O) {
    A && O.__k && O.__k.__m && (A.__m = O.__k.__m), C && C(A, O);
  }, l.__r = function(A) {
    v && v(A), o = 0;
    var O = (i = A.__c).__H;
    O && (r === i ? (O.__h = [], i.__h = [], O.__.forEach(function(U) {
      U.__N && (U.__ = U.__N), U.u = U.__N = void 0;
    })) : (O.__h.forEach(ye), O.__h.forEach(Ne), O.__h = [], o = 0)), r = i;
  }, l.diffed = function(A) {
    g && g(A);
    var O = A.__c;
    O && O.__H && (O.__H.__h.length && (c.push(O) !== 1 && s === l.requestAnimationFrame || ((s = l.requestAnimationFrame) || re)(ue)), O.__H.__.forEach(function(U) {
      U.u && (U.__H = U.u), U.u = void 0;
    })), r = i = null;
  }, l.__c = function(A, O) {
    O.some(function(U) {
      try {
        U.__h.forEach(ye), U.__h = U.__h.filter(function(Z) {
          return !Z.__ || Ne(Z);
        });
      } catch (Z) {
        O.some(function(q) {
          q.__h && (q.__h = []);
        }), O = [], l.__e(Z, U.__v);
      }
    }), k && k(A, O);
  }, l.unmount = function(A) {
    x && x(A);
    var O, U = A.__c;
    U && U.__H && (U.__H.__.forEach(function(Z) {
      try {
        ye(Z);
      } catch (q) {
        O = q;
      }
    }), U.__H = void 0, O && l.__e(O, U.__v));
  };
  var le = typeof requestAnimationFrame == "function";
  function re(A) {
    var O, U = function() {
      clearTimeout(Z), le && cancelAnimationFrame(O), setTimeout(A);
    }, Z = setTimeout(U, 35);
    le && (O = requestAnimationFrame(U));
  }
  function ye(A) {
    var O = i, U = A.__c;
    typeof U == "function" && (A.__c = void 0, U()), i = O;
  }
  function Ne(A) {
    var O = i;
    A.__c = A.__(), i = O;
  }
  function ot(A, O) {
    return !A || A.length !== O.length || O.some(function(U, Z) {
      return U !== A[Z];
    });
  }
  function it(A, O) {
    return typeof O == "function" ? O(A) : O;
  }
}, 292(n) {
  var t = [];
  function e(r) {
    for (var s = -1, d = 0; d < t.length; d++) if (t[d].identifier === r) {
      s = d;
      break;
    }
    return s;
  }
  function o(r, s) {
    for (var d = {}, u = [], c = 0; c < r.length; c++) {
      var l = r[c], m = s.base ? l[0] + s.base : l[0], v = d[m] || 0, g = "".concat(m, " ").concat(v);
      d[m] = v + 1;
      var k = e(g), x = { css: l[1], media: l[2], sourceMap: l[3], supports: l[4], layer: l[5] };
      if (k !== -1) t[k].references++, t[k].updater(x);
      else {
        var C = i(x, s);
        s.byIndex = c, t.splice(c, 0, { identifier: g, updater: C, references: 1 });
      }
      u.push(g);
    }
    return u;
  }
  function i(r, s) {
    var d = s.domAPI(s);
    return d.update(r), function(u) {
      if (u) {
        if (u.css === r.css && u.media === r.media && u.sourceMap === r.sourceMap && u.supports === r.supports && u.layer === r.layer) return;
        d.update(r = u);
      } else d.remove();
    };
  }
  n.exports = function(r, s) {
    var d = o(r = r || [], s = s || {});
    return function(u) {
      u = u || [];
      for (var c = 0; c < d.length; c++) {
        var l = e(d[c]);
        t[l].references--;
      }
      for (var m = o(u, s), v = 0; v < d.length; v++) {
        var g = e(d[v]);
        t[g].references === 0 && (t[g].updater(), t.splice(g, 1));
      }
      d = m;
    };
  };
}, 88(n) {
  n.exports = function(t) {
    var e = document.createElement("style");
    return t.setAttributes(e, t.attributes), t.insert(e, t.options), e;
  };
}, 884(n, t, e) {
  n.exports = function(o) {
    var i = e.nc;
    i && o.setAttribute("nonce", i);
  };
}, 360(n) {
  var t, e = (t = [], function(r, s) {
    return t[r] = s, t.filter(Boolean).join(`
`);
  });
  function o(r, s, d, u) {
    var c;
    if (d) c = "";
    else {
      c = "", u.supports && (c += "@supports (".concat(u.supports, ") {")), u.media && (c += "@media ".concat(u.media, " {"));
      var l = u.layer !== void 0;
      l && (c += "@layer".concat(u.layer.length > 0 ? " ".concat(u.layer) : "", " {")), c += u.css, l && (c += "}"), u.media && (c += "}"), u.supports && (c += "}");
    }
    if (r.styleSheet) r.styleSheet.cssText = e(s, c);
    else {
      var m = document.createTextNode(c), v = r.childNodes;
      v[s] && r.removeChild(v[s]), v.length ? r.insertBefore(m, v[s]) : r.appendChild(m);
    }
  }
  var i = { singleton: null, singletonCounter: 0 };
  n.exports = function(r) {
    if (typeof document > "u") return { update: function() {
    }, remove: function() {
    } };
    var s = i.singletonCounter++, d = i.singleton || (i.singleton = r.insertStyleElement(r));
    return { update: function(u) {
      o(d, s, !1, u);
    }, remove: function(u) {
      o(d, s, !0, u);
    } };
  };
}, 6(n, t, e) {
  e.d(t, { en: () => o });
  const o = { headlines: { error: "An error has occurred", loginEmail: "Sign in or create account", loginEmailNoSignup: "Sign in", loginFinished: "Login successful", loginPasscode: "Enter passcode", loginPassword: "Enter password", registerAuthenticator: "Create a passkey", registerConfirm: "Create account?", registerPassword: "Set new password", otpSetUp: "Set up authenticator app", profileEmails: "Emails", profilePassword: "Password", profilePasskeys: "Passkeys", isPrimaryEmail: "Primary email address", setPrimaryEmail: "Set primary email address", createEmail: "Enter a new email", createUsername: "Enter a new username", emailVerified: "Verified", emailUnverified: "Unverified", emailDelete: "Delete", renamePasskey: "Rename passkey", deletePasskey: "Delete passkey", lastUsedAt: "Last used at", createdAt: "Created at", connectedAccounts: "Connected accounts", deleteAccount: "Delete account", accountNotFound: "Account not found", signIn: "Sign in", signUp: "Create account", selectLoginMethod: "Select login method", setupLoginMethod: "Set up login method", lastUsed: "Last seen", ipAddress: "IP address", revokeSession: "Revoke session", profileSessions: "Sessions", mfaSetUp: "Set up MFA", securityKeySetUp: "Add security key", securityKeyLogin: "Security key", otpLogin: "Authentication code", renameSecurityKey: "Rename security key", deleteSecurityKey: "Delete security key", securityKeys: "Security keys", authenticatorApp: "Authenticator app", authenticatorAppAlreadySetUp: "Authenticator app is set up", authenticatorAppNotSetUp: "Set up authenticator app", trustDevice: "Trust this browser?", deleteIdentity: "Delete connection" }, texts: { enterPasscode: "Enter the passcode sent to your email address.", enterPasscodeNoEmail: "Enter the passcode that was sent to your primary email address.", setupPasskey: "Sign in to your account easily and securely with a passkey. Note: Your biometric data is only stored on your devices and will never be shared with anyone.", createAccount: 'No account exists for "{emailAddress}". Do you want to create a new account?', otpEnterVerificationCode: "Enter the one-time password (OTP) obtained from your authenticator app below:", otpScanQRCode: "Scan the QR code using your authenticator app (such as Google Authenticator or any other TOTP app). Alternatively, you can manually enter the OTP secret key into the app.", otpSecretKey: "OTP secret key", passwordFormatHint: "Must be between {minLength} and {maxLength} characters long.", securityKeySetUp: "Use a dedicated security key via USB, Bluetooth, or NFC, or your mobile phone. Connect or activate your security key, then click the button below and follow the prompts to complete the registration.", setPrimaryEmail: "Set this email address to be used for contacting you.", isPrimaryEmail: "This email address will be used to contact you if necessary.", emailVerified: "This email address has been verified.", emailUnverified: "This email address has not been verified.", emailDelete: "If you delete this email address, it can no longer be used to sign in.", renamePasskey: "Set a name for the passkey.", deletePasskey: "Delete this passkey from your account.", deleteAccount: "Are you sure you want to delete this account? All data will be deleted immediately and cannot be recovered.", noAccountExists: 'No account exists for "{emailAddress}".', selectLoginMethodForFutureLogins: "Select one of the following login methods to use for future logins.", howDoYouWantToLogin: "How do you want to login?", mfaSetUp: "Protect your account with Multi-Factor Authentication (MFA). MFA adds an additional step to your login process, ensuring that even if your password or email account is compromised, your account stays secure.", securityKeyLogin: "Connect or activate your security key, then click the button below. Once ready, use it via USB, NFC, your mobile phone. Follow the prompts to complete the login process.", otpLogin: "Open your authenticator app to obtain the one-time password (OTP). Enter the code in the field below to complete your login.", renameSecurityKey: "Set a name for the security key.", deleteSecurityKey: "Delete this security key from your account.", authenticatorAppAlreadySetUp: "Your account is secured with an authenticator app that generates time-based one-time passwords (TOTP) for multi-factor authentication.", authenticatorAppNotSetUp: "Secure your account with an authenticator app that generates time-based one-time passwords (TOTP) for multi-factor authentication.", trustDevice: "If you trust this browser, you won’t need to enter your OTP (One-Time-Password) or use your security key for multi-factor authentication (MFA) the next time you log in." }, labels: { or: "or", no: "no", yes: "yes", email: "Email", continue: "Continue", copied: "copied", skip: "Skip", save: "Save", password: "Password", passkey: "Passkey", passcode: "Passcode", signInPassword: "Sign in with a password", signInPasscode: "Sign in with a passcode", forgotYourPassword: "Forgot your password?", back: "Back", signInPasskey: "Sign in with a passkey", registerAuthenticator: "Create a passkey", signIn: "Sign in", signUp: "Create account", sendNewPasscode: "Send new code", passwordRetryAfter: "Retry in {passwordRetryAfter}", passcodeResendAfter: "Request a new code in {passcodeResendAfter}", unverifiedEmail: "unverified", primaryEmail: "primary", setAsPrimaryEmail: "Set as primary", verify: "Verify", delete: "Delete", newEmailAddress: "New email address", newPassword: "New password", rename: "Rename", newPasskeyName: "New passkey name", addEmail: "Add email", createPasskey: "Create a passkey", webauthnUnsupported: "Passkeys are not supported by your browser", signInWith: "Continue with {provider}", deleteAccount: "Yes, delete this account.", emailOrUsername: "Email or username", username: "Username", optional: "optional", dontHaveAnAccount: "Don't have an account?", alreadyHaveAnAccount: "Already have an account?", changeUsername: "Change username", setUsername: "Set username", changePassword: "Change password", setPassword: "Set password", revoke: "Revoke", currentSession: "Current session", authenticatorApp: "Authenticator app", securityKey: "Security key", securityKeyUse: "Use security key", newSecurityKeyName: "New security key name", createSecurityKey: "Add a security key", authenticatorAppManage: "Manage authenticator app", authenticatorAppAdd: "Set up", configured: "configured", useAnotherMethod: "Use another method", lastUsed: "Last used", trustDevice: "Trust this browser", staySignedIn: "Stay signed in", connectAccount: "Connect account" }, errors: { somethingWentWrong: "A technical error has occurred. Please try again later.", requestTimeout: "The request timed out.", invalidPassword: "Wrong email or password.", invalidPasscode: "The passcode provided was not correct.", passcodeAttemptsReached: "The passcode was entered incorrectly too many times. Please request a new code.", tooManyRequests: "Too many requests have been made. Please wait to repeat the requested operation.", unauthorized: "Your session has expired. Please log in again.", invalidWebauthnCredential: "This passkey cannot be used anymore.", passcodeExpired: "The passcode has expired. Please request a new one.", userVerification: "User verification required. Please ensure your authenticator device is protected with a PIN or biometric.", emailAddressAlreadyExistsError: "The email address already exists.", maxNumOfEmailAddressesReached: "No further email addresses can be added.", thirdPartyAccessDenied: "Access denied. The request was cancelled by the user or the provider has denied access for other reasons.", thirdPartyMultipleAccounts: "Cannot identify account. The email address is used by multiple accounts.", thirdPartyUnverifiedEmail: "Email verification required. Please verify the used email address with your provider.", signupDisabled: "Account registration is disabled.", handlerNotFoundError: "The current step in your process is not supported by this application version. Please try again later or contact support if the issue persists." }, flowErrors: { technical_error: "A technical error has occurred. Please try again later.", flow_expired_error: "The session has expired, please click the button to restart.", value_invalid_error: "The entered value is invalid.", passcode_invalid: "The passcode provided was not correct.", passkey_invalid: "This passkey cannot be used anymore.", passcode_max_attempts_reached: "The passcode was entered incorrectly too many times. Please request a new code.", rate_limit_exceeded: "Too many requests have been made. Please wait to repeat the requested operation.", unknown_username_error: "The username is unknown.", unknown_email_error: "The email address is unknown.", username_already_exists: "The username is already taken.", invalid_username_error: "The username must contain only letters, numbers, and underscores.", email_already_exists: "The email is already taken.", not_found: "The requested resource was not found.", operation_not_permitted_error: "The operation is not permitted.", flow_discontinuity_error: "The process cannot be continued due to user settings or the provider's configuration.", form_data_invalid_error: "The submitted form data contains errors.", unauthorized: "Your session has expired. Please log in again.", value_missing_error: "The value is missing.", value_too_long_error: "Value is too long.", value_too_short_error: "The value is too short.", webauthn_credential_invalid_mfa_only: "This credential can be used as a second factor security key only.", webauthn_credential_already_exists: "The request either timed out, was canceled or the device is already registered. Please try again or try using another device.", platform_authenticator_required: "Your account is configured to use platform authenticators, but your current device or browser does not support this feature. Please try again with a compatible device or browser.", third_party_access_denied: "Access denied. The request was cancelled by the user or the provider has denied access for other reasons." } };
}, 597(n, t, e) {
  e.d(t, { A: () => d });
  var o = e(601), i = e.n(o), r = e(314), s = e.n(r)()(i());
  s.push([n.id, '.hanko_accordion{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);width:100%;overflow:hidden}.hanko_accordion .hanko_accordionItem{color:var(--color, #333333);margin:.25rem 0;overflow:hidden}.hanko_accordion .hanko_accordionItem.hanko_dropdown{margin:0}.hanko_accordion .hanko_accordionItem .hanko_label{border-radius:var(--border-radius, 8px);border-style:none;height:var(--item-height, 42px);background:var(--background-color, white);box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;padding:0 1rem;margin:0;cursor:pointer;transition:all .35s}.hanko_accordion .hanko_accordionItem .hanko_label .hanko_labelText{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hanko_accordion .hanko_accordionItem .hanko_label .hanko_labelText .hanko_description{color:var(--color-shade-1, #8f9095)}.hanko_accordion .hanko_accordionItem .hanko_label.hanko_dropdown{margin:0;color:var(--link-color, #506cf0);justify-content:flex-start}.hanko_accordion .hanko_accordionItem .hanko_label:hover{color:var(--brand-contrast-color, white);background:var(--brand-color-shade-1, #6b84fb)}.hanko_accordion .hanko_accordionItem .hanko_label:hover .hanko_description{color:var(--brand-contrast-color, white)}.hanko_accordion .hanko_accordionItem .hanko_label:hover.hanko_dropdown{color:var(--link-color, #506cf0);background:none}.hanko_accordion .hanko_accordionItem .hanko_label:not(.hanko_dropdown)::after{content:"❯";width:1rem;text-align:center;transition:all .35s}.hanko_accordion .hanko_accordionItem .hanko_accordionInput{position:absolute;opacity:0;z-index:-1}.hanko_accordion .hanko_accordionItem .hanko_accordionInput:checked+.hanko_label{color:var(--brand-contrast-color, white);background:var(--brand-color, #506cf0)}.hanko_accordion .hanko_accordionItem .hanko_accordionInput:checked+.hanko_label .hanko_description{color:var(--brand-contrast-color, white)}.hanko_accordion .hanko_accordionItem .hanko_accordionInput:checked+.hanko_label.hanko_dropdown{color:var(--link-color, #506cf0);background:none}.hanko_accordion .hanko_accordionItem .hanko_accordionInput:checked+.hanko_label:not(.hanko_dropdown)::after{transform:rotate(90deg)}.hanko_accordion .hanko_accordionItem .hanko_accordionInput:checked+.hanko_label~.hanko_accordionContent{margin:.25rem 1rem;opacity:1;max-height:100vh}.hanko_accordion .hanko_accordionItem .hanko_accordionContent{max-height:0;margin:0 1rem;opacity:0;overflow:hidden;transition:all .35s}.hanko_accordion .hanko_accordionItem .hanko_accordionContent.hanko_dropdownContent{border-style:none}', ""]), s.locals = { accordion: "hanko_accordion", accordionItem: "hanko_accordionItem", dropdown: "hanko_dropdown", label: "hanko_label", labelText: "hanko_labelText", description: "hanko_description", accordionInput: "hanko_accordionInput", accordionContent: "hanko_accordionContent", dropdownContent: "hanko_dropdownContent" };
  const d = s;
}, 217(n, t, e) {
  e.d(t, { A: () => d });
  var o = e(601), i = e.n(o), r = e(314), s = e.n(r)()(i());
  s.push([n.id, ".hanko_errorBox{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);border-radius:var(--border-radius, 8px);border-style:var(--border-style, solid);border-width:var(--border-width, 1px);color:var(--error-color, #e82020);background:var(--background-color, white);margin:var(--item-margin, 0.5rem 0);display:flex;align-items:start;box-sizing:border-box;line-height:1.5rem;padding:.25em;gap:.2em}.hanko_errorBox>span{display:inline-flex}.hanko_errorBox>span:first-child{padding:.25em 0 .25em .19em}.hanko_errorBox[hidden]{display:none}.hanko_errorMessage{color:var(--error-color, #e82020)}", ""]), s.locals = { errorBox: "hanko_errorBox", errorMessage: "hanko_errorMessage" };
  const d = s;
}, 681(n, t, e) {
  e.d(t, { A: () => d });
  var o = e(601), i = e.n(o), r = e(314), s = e.n(r)()(i());
  s.push([n.id, '.hanko_form{display:flex;flex-grow:1}.hanko_form .hanko_ul{flex-grow:1;margin:var(--item-margin, 0.5rem 0);padding-inline-start:0;list-style-type:none;display:flex;flex-wrap:wrap;gap:1em}.hanko_form .hanko_li{display:flex;max-width:100%;flex-grow:1;flex-basis:min-content}.hanko_form .hanko_li.hanko_maxWidth{min-width:100%}.hanko_button{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);border-radius:var(--border-radius, 8px);border-style:var(--border-style, solid);border-width:var(--border-width, 1px);white-space:nowrap;width:100%;min-width:var(--button-min-width, 7em);min-height:var(--item-height, 42px);outline:none;cursor:pointer;transition:.1s ease-out;flex-grow:1;flex-shrink:1;display:inline-flex;position:relative}.hanko_button[data-bubble]:before{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);border-radius:var(--border-radius, 8px);border-style:var(--border-style, solid);border-width:var(--border-width, 1px);padding:2px 8px;font-size:9px;line-height:normal;content:attr(data-bubble);display:block;position:absolute;bottom:80%;left:80%;white-space:nowrap;width:max-content;text-align:center;background-color:inherit;color:var(--brand-color-shade-1, #6b84fb);border-color:var(--brand-color-shade-1, #6b84fb)}.hanko_button:disabled{cursor:default}.hanko_button.hanko_primary{color:var(--brand-contrast-color, white);background:var(--brand-color, #506cf0);border-color:var(--brand-color, #506cf0);justify-content:center}.hanko_button.hanko_primary:hover{color:var(--brand-contrast-color, white);background:var(--brand-color-shade-1, #6b84fb);border-color:var(--brand-color, #506cf0)}.hanko_button.hanko_primary:focus{color:var(--brand-contrast-color, white);background:var(--brand-color, #506cf0);border-color:var(--color, #333333)}.hanko_button.hanko_primary:disabled{color:var(--color-shade-1, #8f9095);background:var(--color-shade-2, #e5e6ef);border-color:var(--color-shade-2, #e5e6ef)}.hanko_button.hanko_secondary{color:var(--color, #333333);background:var(--background-color, white);border-color:var(--color-shade-1, #8f9095);justify-content:center}.hanko_button.hanko_secondary:hover{color:var(--color, #333333);background:var(--color-shade-2, #e5e6ef);border-color:var(--color, #333333)}.hanko_button.hanko_secondary:focus{color:var(--color, #333333);background:var(--background-color, white);border-color:var(--brand-color, #506cf0)}.hanko_button.hanko_secondary:disabled{color:var(--color-shade-1, #8f9095);background:var(--color-shade-2, #e5e6ef);border-color:var(--color-shade-1, #8f9095)}.hanko_button.hanko_dangerous{color:var(--error-color, #e82020);background:var(--background-color, white);border-color:var(--error-color, #e82020);flex-grow:0;width:auto}.hanko_caption{flex-wrap:wrap;display:flex;justify-content:space-between;align-items:baseline}.hanko_inputWrapper{flex-grow:1;position:relative;display:flex;min-width:var(--input-min-width, 14em);max-width:100%}.hanko_input{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);border-radius:var(--border-radius, 8px);border-style:var(--border-style, solid);border-width:var(--border-width, 1px);height:var(--item-height, 42px);color:var(--color, #333333);border-color:var(--color-shade-1, #8f9095);background:var(--background-color, white)}.hanko_input.hanko_error{border-color:var(--error-color, #e82020)}.hanko_input{padding:0 .5rem;outline:none;width:100%;box-sizing:border-box;transition:.1s ease-out}.hanko_input:-webkit-autofill,.hanko_input:-webkit-autofill:hover,.hanko_input:-webkit-autofill:focus{-webkit-text-fill-color:var(--color, #333333);-webkit-box-shadow:0 0 0 50px var(--background-color, white) inset}.hanko_input::-ms-reveal,.hanko_input::-ms-clear{display:none}.hanko_input::placeholder{color:var(--color-shade-1, #8f9095)}.hanko_input:focus{color:var(--color, #333333);border-color:var(--color, #333333)}.hanko_input:disabled{color:var(--color-shade-1, #8f9095);background:var(--color-shade-2, #e5e6ef);border-color:var(--color-shade-1, #8f9095)}.hanko_passcodeInputWrapper{flex-grow:1;min-width:var(--input-min-width, 14em);max-width:fit-content;position:relative;display:flex;justify-content:space-between}.hanko_passcodeInputWrapper .hanko_passcodeDigitWrapper{flex-grow:1;margin:0 .5rem 0 0}.hanko_passcodeInputWrapper .hanko_passcodeDigitWrapper:last-child{margin:0}.hanko_passcodeInputWrapper .hanko_passcodeDigitWrapper .hanko_input{text-align:center}.hanko_checkboxWrapper{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);color:var(--color, #333333);align-items:center;display:flex}.hanko_checkboxWrapper .hanko_label{color:inherit;padding-left:.5rem;cursor:pointer}.hanko_checkboxWrapper .hanko_label.hanko_disabled{cursor:default;color:var(--color-shade-1, #8f9095)}.hanko_checkboxWrapper .hanko_checkbox{border:currentColor solid 1px;border-radius:.15em;appearance:none;-webkit-appearance:none;width:1.1rem;height:1.1rem;margin:0;color:currentColor;background-color:var(--background-color, white);font:inherit;box-shadow:none;display:inline-flex;place-content:center;cursor:pointer}.hanko_checkboxWrapper .hanko_checkbox:checked{background-color:var(--color, #333333)}.hanko_checkboxWrapper .hanko_checkbox:disabled{cursor:default;background-color:var(--color-shade-2, #e5e6ef);border-color:var(--color-shade-1, #8f9095)}.hanko_checkboxWrapper .hanko_checkbox:checked:after{content:"✓";color:var(--background-color, white);position:absolute;line-height:1.1rem}.hanko_checkboxWrapper .hanko_checkbox:disabled:after{color:var(--color-shade-1, #8f9095)}', ""]), s.locals = { form: "hanko_form", ul: "hanko_ul", li: "hanko_li", maxWidth: "hanko_maxWidth", button: "hanko_button", primary: "hanko_primary", secondary: "hanko_secondary", dangerous: "hanko_dangerous", caption: "hanko_caption", inputWrapper: "hanko_inputWrapper", input: "hanko_input", error: "hanko_error", passcodeInputWrapper: "hanko_passcodeInputWrapper", passcodeDigitWrapper: "hanko_passcodeDigitWrapper", checkboxWrapper: "hanko_checkboxWrapper", label: "hanko_label", disabled: "hanko_disabled", checkbox: "hanko_checkbox" };
  const d = s;
}, 547(n, t, e) {
  e.d(t, { A: () => d });
  var o = e(601), i = e.n(o), r = e(314), s = e.n(r)()(i());
  s.push([n.id, ".hanko_headline{color:var(--color, #333333);font-family:var(--font-family, sans-serif);text-align:left;letter-spacing:0;font-style:normal;line-height:1.1}.hanko_headline.hanko_grade1{font-size:var(--headline1-font-size, 24px);font-weight:var(--headline1-font-weight, 600);margin:var(--headline1-margin, 0 0 0.5rem)}.hanko_headline.hanko_grade2{font-size:var(--headline2-font-size, 16px);font-weight:var(--headline2-font-weight, 600);margin:var(--headline2-margin, 1rem 0 0.5rem)}", ""]), s.locals = { headline: "hanko_headline", grade1: "hanko_grade1", grade2: "hanko_grade2" };
  const d = s;
}, 313(n, t, e) {
  e.d(t, { A: () => d });
  var o = e(601), i = e.n(o), r = e(314), s = e.n(r)()(i());
  s.push([n.id, ".hanko_icon,.hanko_loadingSpinnerWrapper .hanko_loadingSpinner,.hanko_loadingSpinnerWrapperIcon .hanko_loadingSpinner,.hanko_exclamationMark,.hanko_checkmark{display:inline-block;fill:var(--brand-contrast-color, white);width:18px}.hanko_icon.hanko_secondary,.hanko_loadingSpinnerWrapper .hanko_secondary.hanko_loadingSpinner,.hanko_loadingSpinnerWrapperIcon .hanko_secondary.hanko_loadingSpinner,.hanko_secondary.hanko_exclamationMark,.hanko_secondary.hanko_checkmark{fill:var(--color, #333333)}.hanko_icon.hanko_disabled,.hanko_loadingSpinnerWrapper .hanko_disabled.hanko_loadingSpinner,.hanko_loadingSpinnerWrapperIcon .hanko_disabled.hanko_loadingSpinner,.hanko_disabled.hanko_exclamationMark,.hanko_disabled.hanko_checkmark{fill:var(--color-shade-1, #8f9095)}.hanko_checkmark{fill:var(--brand-color, #506cf0)}.hanko_checkmark.hanko_secondary{fill:var(--color-shade-1, #8f9095)}.hanko_checkmark.hanko_fadeOut{animation:hanko_fadeOut ease-out 1.5s forwards !important}@keyframes hanko_fadeOut{0%{opacity:1}100%{opacity:0}}.hanko_exclamationMark{fill:var(--error-color, #e82020)}.hanko_loadingSpinnerWrapperIcon{width:100%;column-gap:10px;margin-left:10px}.hanko_loadingSpinnerWrapper,.hanko_loadingSpinnerWrapperIcon{display:inline-flex;align-items:center;height:100%;margin:0 5px;justify-content:inherit;flex-wrap:inherit}.hanko_loadingSpinnerWrapper.hanko_centerContent,.hanko_centerContent.hanko_loadingSpinnerWrapperIcon{justify-content:center}.hanko_loadingSpinnerWrapper.hanko_maxWidth,.hanko_maxWidth.hanko_loadingSpinnerWrapperIcon{width:100%}.hanko_loadingSpinnerWrapper .hanko_loadingSpinner,.hanko_loadingSpinnerWrapperIcon .hanko_loadingSpinner{fill:var(--brand-color, #506cf0);animation:hanko_spin 500ms ease-in-out infinite}.hanko_loadingSpinnerWrapper.hanko_secondary,.hanko_secondary.hanko_loadingSpinnerWrapperIcon{fill:var(--color-shade-1, #8f9095)}@keyframes hanko_spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}.hanko_googleIcon.hanko_disabled{fill:var(--color-shade-1, #8f9095)}.hanko_googleIcon.hanko_blue{fill:#4285f4}.hanko_googleIcon.hanko_green{fill:#34a853}.hanko_googleIcon.hanko_yellow{fill:#fbbc05}.hanko_googleIcon.hanko_red{fill:#ea4335}.hanko_microsoftIcon.hanko_disabled{fill:var(--color-shade-1, #8f9095)}.hanko_microsoftIcon.hanko_blue{fill:#00a4ef}.hanko_microsoftIcon.hanko_green{fill:#7fba00}.hanko_microsoftIcon.hanko_yellow{fill:#ffb900}.hanko_microsoftIcon.hanko_red{fill:#f25022}.hanko_facebookIcon.hanko_outline{fill:#0866ff}.hanko_facebookIcon.hanko_disabledOutline{fill:var(--color-shade-1, #8f9095)}.hanko_facebookIcon.hanko_letter{fill:#fff}.hanko_facebookIcon.hanko_disabledLetter{fill:var(--color-shade-2, #e5e6ef)}", ""]), s.locals = { icon: "hanko_icon", loadingSpinnerWrapper: "hanko_loadingSpinnerWrapper", loadingSpinner: "hanko_loadingSpinner", loadingSpinnerWrapperIcon: "hanko_loadingSpinnerWrapperIcon", exclamationMark: "hanko_exclamationMark", checkmark: "hanko_checkmark", secondary: "hanko_secondary", disabled: "hanko_disabled", fadeOut: "hanko_fadeOut", centerContent: "hanko_centerContent", maxWidth: "hanko_maxWidth", spin: "hanko_spin", googleIcon: "hanko_googleIcon", blue: "hanko_blue", green: "hanko_green", yellow: "hanko_yellow", red: "hanko_red", microsoftIcon: "hanko_microsoftIcon", facebookIcon: "hanko_facebookIcon", outline: "hanko_outline", disabledOutline: "hanko_disabledOutline", letter: "hanko_letter", disabledLetter: "hanko_disabledLetter" };
  const d = s;
}, 579(n, t, e) {
  e.d(t, { A: () => d });
  var o = e(601), i = e.n(o), r = e(314), s = e.n(r)()(i());
  s.push([n.id, ".hanko_link{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);color:var(--link-color, #506cf0);text-decoration:var(--link-text-decoration, none);cursor:pointer;background:none !important;border:none;padding:0 !important;transition:all .1s}.hanko_link:hover{text-decoration:var(--link-text-decoration-hover, underline)}.hanko_link:disabled{color:var(--color, #333333) !important;pointer-events:none;cursor:default}.hanko_link.hanko_danger{color:var(--error-color, #e82020)}.hanko_linkWrapper{display:inline-flex;flex-direction:row;justify-content:space-between;align-items:center;overflow:hidden}.hanko_linkWrapper.hanko_reverse{flex-direction:row-reverse}", ""]), s.locals = { link: "hanko_link", danger: "hanko_danger", linkWrapper: "hanko_linkWrapper", reverse: "hanko_reverse" };
  const d = s;
}, 8(n, t, e) {
  e.d(t, { A: () => d });
  var o = e(601), i = e.n(o), r = e(314), s = e.n(r)()(i());
  s.push([n.id, ".hanko_otpCreationDetails{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);color:var(--color, #333333);margin:var(--item-margin, 0.5rem 0);display:flex;justify-content:center;align-items:center;flex-direction:column;font-size:smaller}", ""]), s.locals = { otpCreationDetails: "hanko_otpCreationDetails" };
  const d = s;
}, 193(n, t, e) {
  e.d(t, { A: () => d });
  var o = e(601), i = e.n(o), r = e(314), s = e.n(r)()(i());
  s.push([n.id, ".hanko_paragraph{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);color:var(--color, #333333);margin:var(--item-margin, 0.5rem 0);text-align:left;word-break:break-word}.hanko_paragraph.hanko_center{align-items:center}.hanko_paragraph.hanko_column{display:flex;flex-direction:column;width:100%}", ""]), s.locals = { paragraph: "hanko_paragraph", center: "hanko_center", column: "hanko_column" };
  const d = s;
}, 751(n, t, e) {
  e.d(t, { A: () => d });
  var o = e(601), i = e.n(o), r = e(314), s = e.n(r)()(i());
  s.push([n.id, ".hanko_spacer{height:1em}.hanko_divider{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);display:flex;visibility:var(--divider-visibility, visible);color:var(--color-shade-1, #8f9095);margin:var(--item-margin, 0.5rem 0);padding:.5em 0}.hanko_divider .hanko_line{border-bottom-style:var(--border-style, solid);border-bottom-width:var(--border-width, 1px);color:inherit;font:inherit;width:100%}.hanko_divider .hanko_text{font:inherit;color:inherit;background:var(--background-color, white);padding:var(--divider-padding, 0 42px);line-height:.1em}", ""]), s.locals = { spacer: "hanko_spacer", divider: "hanko_divider", line: "hanko_line", text: "hanko_text" };
  const d = s;
}, 890(n, t, e) {
  e.d(t, { A: () => d });
  var o = e(601), i = e.n(o), r = e(314), s = e.n(r)()(i());
  s.push([n.id, ".hanko_container{background-color:var(--background-color, white);padding:var(--container-padding, 30px);max-width:var(--container-max-width, 410px);display:flex;flex-direction:column;flex-wrap:nowrap;justify-content:center;align-items:center;align-content:flex-start;box-sizing:border-box}.hanko_content{box-sizing:border-box;flex:0 1 auto;width:100%;height:100%}.hanko_footer{padding:.5rem 0 0;box-sizing:border-box;width:100%}.hanko_footer :nth-child(1){float:left}.hanko_footer :nth-child(2){float:right}.hanko_clipboardContainer{display:flex}.hanko_clipboardIcon{display:flex;margin:auto;cursor:pointer}", ""]), s.locals = { container: "hanko_container", content: "hanko_content", footer: "hanko_footer", clipboardContainer: "hanko_clipboardContainer", clipboardIcon: "hanko_clipboardIcon" };
  const d = s;
}, 314(n) {
  n.exports = function(t) {
    var e = [];
    return e.toString = function() {
      return this.map(function(o) {
        var i = "", r = o[5] !== void 0;
        return o[4] && (i += "@supports (".concat(o[4], ") {")), o[2] && (i += "@media ".concat(o[2], " {")), r && (i += "@layer".concat(o[5].length > 0 ? " ".concat(o[5]) : "", " {")), i += t(o), r && (i += "}"), o[2] && (i += "}"), o[4] && (i += "}"), i;
      }).join("");
    }, e.i = function(o, i, r, s, d) {
      typeof o == "string" && (o = [[null, o, void 0]]);
      var u = {};
      if (r) for (var c = 0; c < this.length; c++) {
        var l = this[c][0];
        l != null && (u[l] = !0);
      }
      for (var m = 0; m < o.length; m++) {
        var v = [].concat(o[m]);
        r && u[v[0]] || (d !== void 0 && (v[5] === void 0 || (v[1] = "@layer".concat(v[5].length > 0 ? " ".concat(v[5]) : "", " {").concat(v[1], "}")), v[5] = d), i && (v[2] && (v[1] = "@media ".concat(v[2], " {").concat(v[1], "}")), v[2] = i), s && (v[4] ? (v[1] = "@supports (".concat(v[4], ") {").concat(v[1], "}"), v[4] = s) : v[4] = "".concat(s)), e.push(v));
      }
    }, e;
  };
}, 601(n) {
  n.exports = function(t) {
    return t[1];
  };
}, 452(n, t) {
  var e;
  (function() {
    var o = {}.hasOwnProperty;
    function i() {
      for (var d = "", u = 0; u < arguments.length; u++) {
        var c = arguments[u];
        c && (d = s(d, r(c)));
      }
      return d;
    }
    function r(d) {
      if (typeof d == "string" || typeof d == "number") return d;
      if (typeof d != "object") return "";
      if (Array.isArray(d)) return i.apply(null, d);
      if (d.toString !== Object.prototype.toString && !d.toString.toString().includes("[native code]")) return d.toString();
      var u = "";
      for (var c in d) o.call(d, c) && d[c] && (u = s(u, c));
      return u;
    }
    function s(d, u) {
      return u ? d ? d + " " + u : d + u : d;
    }
    n.exports ? (i.default = i, n.exports = i) : (e = (function() {
      return i;
    }).apply(t, [])) === void 0 || (n.exports = e);
  })();
} }, yo = {};
function ee(n) {
  var t = yo[n];
  if (t !== void 0) return t.exports;
  var e = yo[n] = { id: n, exports: {} };
  return ua[n].call(e.exports, e, e.exports, ee), e.exports;
}
ee.n = (n) => {
  var t = n && n.__esModule ? () => n.default : () => n;
  return ee.d(t, { a: t }), t;
}, ee.d = (n, t) => {
  for (var e in t) ee.o(t, e) && !ee.o(n, e) && Object.defineProperty(n, e, { enumerable: !0, get: t[e] });
}, ee.o = (n, t) => Object.prototype.hasOwnProperty.call(n, t), ee.r = (n) => {
  typeof Symbol < "u" && Symbol.toStringTag && Object.defineProperty(n, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(n, "__esModule", { value: !0 });
}, ee.nc = void 0;
var Rn = {};
ee.r(Rn), ee.d(Rn, { apple: () => Za, checkmark: () => Ja, copy: () => Ya, customProvider: () => Qa, discord: () => Ga, exclamation: () => Xa, facebook: () => er, github: () => tr, google: () => nr, linkedin: () => or, mail: () => ir, microsoft: () => ar, passkey: () => rr, password: () => sr, qrCodeScanner: () => cr, securityKey: () => lr, spinner: () => dr });
var b = ee(616), ha = 0;
function a(n, t, e, o, i, r) {
  t || (t = {});
  var s, d, u = t;
  if ("ref" in u) for (d in u = {}, t) d == "ref" ? s = t[d] : u[d] = t[d];
  var c = { type: n, props: u, key: e, ref: s, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --ha, __i: -1, __u: 0, __source: i, __self: r };
  if (typeof n == "function" && (s = n.defaultProps)) for (d in s) u[d] === void 0 && (u[d] = s[d]);
  return b.options.vnode && b.options.vnode(c), c;
}
function gn() {
  return gn = Object.assign ? Object.assign.bind() : function(n) {
    for (var t = 1; t < arguments.length; t++) {
      var e = arguments[t];
      for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && (n[o] = e[o]);
    }
    return n;
  }, gn.apply(this, arguments);
}
var pa = ["context", "children"];
function ma(n) {
  this.getChildContext = function() {
    return n.context;
  };
  var t = n.children, e = function(o, i) {
    if (o == null) return {};
    var r, s, d = {}, u = Object.keys(o);
    for (s = 0; s < u.length; s++) i.indexOf(r = u[s]) >= 0 || (d[r] = o[r]);
    return d;
  }(n, pa);
  return (0, b.cloneElement)(t, e);
}
function fa() {
  var n = new CustomEvent("_preact", { detail: {}, bubbles: !0, cancelable: !0 });
  this.dispatchEvent(n), this._vdom = (0, b.h)(ma, gn({}, this._props, { context: n.detail.context }), ui(this, this._vdomComponent)), (this.hasAttribute("hydrate") ? b.hydrate : b.render)(this._vdom, this._root);
}
function di(n) {
  return n.replace(/-(\w)/g, function(t, e) {
    return e ? e.toUpperCase() : "";
  });
}
function ga(n, t, e) {
  if (this._vdom) {
    var o = {};
    o[n] = e = e ?? void 0, o[di(n)] = e, this._vdom = (0, b.cloneElement)(this._vdom, o), (0, b.render)(this._vdom, this._root);
  }
}
function va() {
  (0, b.render)(this._vdom = null, this._root);
}
function bo(n, t) {
  var e = this;
  return (0, b.h)("slot", gn({}, n, { ref: function(o) {
    o ? (e.ref = o, e._listener || (e._listener = function(i) {
      i.stopPropagation(), i.detail.context = t;
    }, o.addEventListener("_preact", e._listener))) : e.ref.removeEventListener("_preact", e._listener);
  } }));
}
function ui(n, t) {
  if (n.nodeType === 3) return n.data;
  if (n.nodeType !== 1) return null;
  var e = [], o = {}, i = 0, r = n.attributes, s = n.childNodes;
  for (i = r.length; i--; ) r[i].name !== "slot" && (o[r[i].name] = r[i].value, o[di(r[i].name)] = r[i].value);
  for (i = s.length; i--; ) {
    var d = ui(s[i], null), u = s[i].slot;
    u ? o[u] = (0, b.h)(bo, { name: u }, d) : e[i] = d;
  }
  var c = t ? (0, b.h)(bo, null, e) : e;
  return (0, b.h)(t || n.nodeName.toLowerCase(), o, c);
}
var J = ee(7), f = ee(78);
function hi(n, t) {
  for (var e in t) n[e] = t[e];
  return n;
}
function wo(n, t) {
  for (var e in n) if (e !== "__source" && !(e in t)) return !0;
  for (var o in t) if (o !== "__source" && n[o] !== t[o]) return !0;
  return !1;
}
f.useLayoutEffect;
function ko(n, t) {
  this.props = n, this.context = t;
}
(ko.prototype = new b.Component()).isPureReactComponent = !0, ko.prototype.shouldComponentUpdate = function(n, t) {
  return wo(this.props, n) || wo(this.state, t);
};
var So = b.options.__b;
b.options.__b = function(n) {
  n.type && n.type.__f && n.ref && (n.props.ref = n.ref, n.ref = null), So && So(n);
};
var _a = typeof Symbol < "u" && Symbol.for && Symbol.for("react.forward_ref") || 3911, ya = (b.toChildArray, b.options.__e);
b.options.__e = function(n, t, e, o) {
  if (n.then) {
    for (var i, r = t; r = r.__; ) if ((i = r.__c) && i.__c) return t.__e == null && (t.__e = e.__e, t.__k = e.__k), i.__c(n, t);
  }
  ya(n, t, e, o);
};
var xo = b.options.unmount;
function pi(n, t, e) {
  return n && (n.__c && n.__c.__H && (n.__c.__H.__.forEach(function(o) {
    typeof o.__c == "function" && o.__c();
  }), n.__c.__H = null), (n = hi({}, n)).__c != null && (n.__c.__P === e && (n.__c.__P = t), n.__c.__e = !0, n.__c = null), n.__k = n.__k && n.__k.map(function(o) {
    return pi(o, t, e);
  })), n;
}
function mi(n, t, e) {
  return n && e && (n.__v = null, n.__k = n.__k && n.__k.map(function(o) {
    return mi(o, t, e);
  }), n.__c && n.__c.__P === t && (n.__e && e.appendChild(n.__e), n.__c.__e = !0, n.__c.__P = e)), n;
}
function $n() {
  this.__u = 0, this.o = null, this.__b = null;
}
function fi(n) {
  var t = n.__.__c;
  return t && t.__a && t.__a(n);
}
function Jt() {
  this.i = null, this.l = null;
}
b.options.unmount = function(n) {
  var t = n.__c;
  t && t.__R && t.__R(), t && 32 & n.__u && (n.type = null), xo && xo(n);
}, ($n.prototype = new b.Component()).__c = function(n, t) {
  var e = t.__c, o = this;
  o.o == null && (o.o = []), o.o.push(e);
  var i = fi(o.__v), r = !1, s = function() {
    r || (r = !0, e.__R = null, i ? i(d) : d());
  };
  e.__R = s;
  var d = function() {
    if (!--o.__u) {
      if (o.state.__a) {
        var u = o.state.__a;
        o.__v.__k[0] = mi(u, u.__c.__P, u.__c.__O);
      }
      var c;
      for (o.setState({ __a: o.__b = null }); c = o.o.pop(); ) c.forceUpdate();
    }
  };
  o.__u++ || 32 & t.__u || o.setState({ __a: o.__b = o.__v.__k[0] }), n.then(s, s);
}, $n.prototype.componentWillUnmount = function() {
  this.o = [];
}, $n.prototype.render = function(n, t) {
  if (this.__b) {
    if (this.__v.__k) {
      var e = document.createElement("div"), o = this.__v.__k[0].__c;
      this.__v.__k[0] = pi(this.__b, e, o.__O = o.__P);
    }
    this.__b = null;
  }
  var i = t.__a && (0, b.createElement)(b.Fragment, null, n.fallback);
  return i && (i.__u &= -33), [(0, b.createElement)(b.Fragment, null, t.__a ? null : n.children), i];
};
var Co = function(n, t, e) {
  if (++e[1] === e[0] && n.l.delete(t), n.props.revealOrder && (n.props.revealOrder[0] !== "t" || !n.l.size)) for (e = n.i; e; ) {
    for (; e.length > 3; ) e.pop()();
    if (e[1] < e[0]) break;
    n.i = e = e[2];
  }
};
(Jt.prototype = new b.Component()).__a = function(n) {
  var t = this, e = fi(t.__v), o = t.l.get(n);
  return o[0]++, function(i) {
    var r = function() {
      t.props.revealOrder ? (o.push(i), Co(t, n, o)) : i();
    };
    e ? e(r) : r();
  };
}, Jt.prototype.render = function(n) {
  this.i = null, this.l = /* @__PURE__ */ new Map();
  var t = (0, b.toChildArray)(n.children);
  n.revealOrder && n.revealOrder[0] === "b" && t.reverse();
  for (var e = t.length; e--; ) this.l.set(t[e], this.i = [1, 0, this.i]);
  return n.children;
}, Jt.prototype.componentDidUpdate = Jt.prototype.componentDidMount = function() {
  var n = this;
  this.l.forEach(function(t, e) {
    Co(n, e, t);
  });
};
var ba = typeof Symbol < "u" && Symbol.for && Symbol.for("react.element") || 60103, wa = /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/, ka = /^on(Ani|Tra|Tou|BeforeInp|Compo)/, Sa = /[A-Z0-9]/g, xa = typeof document < "u", Ca = function(n) {
  return (typeof Symbol < "u" && typeof Symbol() == "symbol" ? /fil|che|rad/ : /fil|che|ra/).test(n);
};
b.Component.prototype.isReactComponent = {}, ["componentWillMount", "componentWillReceiveProps", "componentWillUpdate"].forEach(function(n) {
  Object.defineProperty(b.Component.prototype, n, { configurable: !0, get: function() {
    return this["UNSAFE_" + n];
  }, set: function(t) {
    Object.defineProperty(this, n, { configurable: !0, writable: !0, value: t });
  } });
});
var Ao = b.options.event;
function Aa() {
}
function Pa() {
  return this.cancelBubble;
}
function Ea() {
  return this.defaultPrevented;
}
b.options.event = function(n) {
  return Ao && (n = Ao(n)), n.persist = Aa, n.isPropagationStopped = Pa, n.isDefaultPrevented = Ea, n.nativeEvent = n;
};
var Ia = { enumerable: !1, configurable: !0, get: function() {
  return this.class;
} }, Po = b.options.vnode;
b.options.vnode = function(n) {
  typeof n.type == "string" && function(t) {
    var e = t.props, o = t.type, i = {}, r = o.indexOf("-") === -1;
    for (var s in e) {
      var d = e[s];
      if (!(s === "value" && "defaultValue" in e && d == null || xa && s === "children" && o === "noscript" || s === "class" || s === "className")) {
        var u = s.toLowerCase();
        s === "defaultValue" && "value" in e && e.value == null ? s = "value" : s === "download" && d === !0 ? d = "" : u === "translate" && d === "no" ? d = !1 : u[0] === "o" && u[1] === "n" ? u === "ondoubleclick" ? s = "ondblclick" : u !== "onchange" || o !== "input" && o !== "textarea" || Ca(e.type) ? u === "onfocus" ? s = "onfocusin" : u === "onblur" ? s = "onfocusout" : ka.test(s) && (s = u) : u = s = "oninput" : r && wa.test(s) ? s = s.replace(Sa, "-$&").toLowerCase() : d === null && (d = void 0), u === "oninput" && i[s = u] && (s = "oninputCapture"), i[s] = d;
      }
    }
    o == "select" && i.multiple && Array.isArray(i.value) && (i.value = (0, b.toChildArray)(e.children).forEach(function(c) {
      c.props.selected = i.value.indexOf(c.props.value) != -1;
    })), o == "select" && i.defaultValue != null && (i.value = (0, b.toChildArray)(e.children).forEach(function(c) {
      c.props.selected = i.multiple ? i.defaultValue.indexOf(c.props.value) != -1 : i.defaultValue == c.props.value;
    })), e.class && !e.className ? (i.class = e.class, Object.defineProperty(i, "className", Ia)) : (e.className && !e.class || e.class && e.className) && (i.class = i.className = e.className), t.props = i;
  }(n), n.$$typeof = ba, Po && Po(n);
};
var Eo = b.options.__r;
b.options.__r = function(n) {
  Eo && Eo(n), n.__c;
};
var Io = b.options.diffed;
function He() {
  return He = Object.assign ? Object.assign.bind() : function(n) {
    for (var t = 1; t < arguments.length; t++) {
      var e = arguments[t];
      for (var o in e) ({}).hasOwnProperty.call(e, o) && (n[o] = e[o]);
    }
    return n;
  }, He.apply(null, arguments);
}
b.options.diffed = function(n) {
  Io && Io(n);
  var t = n.props, e = n.__e;
  e != null && n.type === "textarea" && "value" in t && t.value !== e.value && (e.value = t.value == null ? "" : t.value);
}, f.useCallback, f.useContext, f.useDebugValue, f.useEffect, f.useId, f.useImperativeHandle, f.useLayoutEffect, f.useMemo, f.useReducer, f.useRef, f.useState, b.Fragment, f.useState, f.useId, f.useReducer, f.useEffect, f.useLayoutEffect, f.useRef, f.useImperativeHandle, f.useMemo, f.useCallback, f.useContext, f.useDebugValue, b.createElement, b.createContext, b.createRef, b.Fragment, b.Component;
class Oa {
  static throttle(t, e, o = {}) {
    const { leading: i = !0, trailing: r = !0 } = o;
    let s, d, u, c = 0;
    const l = () => {
      c = i === !1 ? 0 : Date.now(), u = null, t.apply(s, d);
    };
    return function(...m) {
      const v = Date.now();
      c || i !== !1 || (c = v);
      const g = e - (v - c);
      s = this, d = m, g <= 0 || g > e ? (u && (window.clearTimeout(u), u = null), c = v, t.apply(s, d)) : u || r === !1 || (u = window.setTimeout(l, g));
    };
  }
}
const Bn = "hanko-session-created", Zn = "hanko-session-expired", Jn = "hanko-user-logged-out", Yn = "hanko-user-deleted", gi = "hanko-after-state-change", vi = "hanko-before-state-change";
class _i extends CustomEvent {
  constructor(t, e) {
    super(t, { detail: e });
  }
}
class yn {
  constructor() {
    this.throttleLimit = 1e3, this._addEventListener = document.addEventListener.bind(document), this._removeEventListener = document.removeEventListener.bind(document), this._throttle = Oa.throttle;
  }
  wrapCallback(t, e) {
    const o = (i) => {
      t(i.detail);
    };
    return e ? this._throttle(o, this.throttleLimit, { leading: !0, trailing: !1 }) : o;
  }
  addEventListenerWithType({ type: t, callback: e, once: o = !1, throttle: i = !1 }) {
    const r = this.wrapCallback(e, i);
    return this._addEventListener(t, r, { once: o }), () => this._removeEventListener(t, r);
  }
  static mapAddEventListenerParams(t, { once: e, callback: o }, i) {
    return { type: t, callback: o, once: e, throttle: i };
  }
  addEventListener(t, e, o) {
    return this.addEventListenerWithType(yn.mapAddEventListenerParams(t, e, o));
  }
  onSessionCreated(t, e) {
    return this.addEventListener(Bn, { callback: t, once: e }, !0);
  }
  onSessionExpired(t, e) {
    return this.addEventListener(Zn, { callback: t, once: e }, !0);
  }
  onUserLoggedOut(t, e) {
    return this.addEventListener(Jn, { callback: t, once: e });
  }
  onUserDeleted(t, e) {
    return this.addEventListener(Yn, { callback: t, once: e });
  }
  onAfterStateChange(t, e) {
    return this.addEventListener(gi, { callback: t, once: e }, !1);
  }
  onBeforeStateChange(t, e) {
    return this.addEventListener(vi, { callback: t, once: e }, !1);
  }
}
class yi {
  constructor() {
    this._dispatchEvent = document.dispatchEvent.bind(document);
  }
  dispatch(t, e) {
    this._dispatchEvent(new _i(t, e));
  }
  dispatchSessionCreatedEvent(t) {
    this.dispatch(Bn, t);
  }
  dispatchSessionExpiredEvent() {
    this.dispatch(Zn, null);
  }
  dispatchUserLoggedOutEvent() {
    this.dispatch(Jn, null);
  }
  dispatchUserDeletedEvent() {
    this.dispatch(Yn, null);
  }
  dispatchAfterStateChangeEvent(t) {
    this.dispatch(gi, t);
  }
  dispatchBeforeStateChangeEvent(t) {
    this.dispatch(vi, t);
  }
}
class ut extends Error {
  constructor(t, e, o) {
    super(t), this.code = void 0, this.cause = void 0, this.code = e, this.cause = o, Object.setPrototypeOf(this, ut.prototype);
  }
}
class We extends ut {
  constructor(t) {
    super("Technical error", "somethingWentWrong", t), Object.setPrototypeOf(this, We.prototype);
  }
}
class bn extends ut {
  constructor(t) {
    super("Request timed out error", "requestTimeout", t), Object.setPrototypeOf(this, bn.prototype);
  }
}
class mt extends ut {
  constructor(t) {
    super("Unauthorized error", "unauthorized", t), Object.setPrototypeOf(this, mt.prototype);
  }
}
function Yt(n) {
  for (var t = 1; t < arguments.length; t++) {
    var e = arguments[t];
    for (var o in e) n[o] = e[o];
  }
  return n;
}
var Dn = function n(t, e) {
  function o(i, r, s) {
    if (typeof document < "u") {
      typeof (s = Yt({}, e, s)).expires == "number" && (s.expires = new Date(Date.now() + 864e5 * s.expires)), s.expires && (s.expires = s.expires.toUTCString()), i = encodeURIComponent(i).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
      var d = "";
      for (var u in s) s[u] && (d += "; " + u, s[u] !== !0 && (d += "=" + s[u].split(";")[0]));
      return document.cookie = i + "=" + t.write(r, i) + d;
    }
  }
  return Object.create({ set: o, get: function(i) {
    if (typeof document < "u" && (!arguments.length || i)) {
      for (var r = document.cookie ? document.cookie.split("; ") : [], s = {}, d = 0; d < r.length; d++) {
        var u = r[d].split("="), c = u.slice(1).join("=");
        try {
          var l = decodeURIComponent(u[0]);
          if (s[l] = t.read(c, l), i === l) break;
        } catch {
        }
      }
      return i ? s[i] : s;
    }
  }, remove: function(i, r) {
    o(i, "", Yt({}, r, { expires: -1 }));
  }, withAttributes: function(i) {
    return n(this.converter, Yt({}, this.attributes, i));
  }, withConverter: function(i) {
    return n(Yt({}, this.converter, i), this.attributes);
  } }, { attributes: { value: Object.freeze(e) }, converter: { value: Object.freeze(t) } });
}({ read: function(n) {
  return n[0] === '"' && (n = n.slice(1, -1)), n.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
}, write: function(n) {
  return encodeURIComponent(n).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent);
} }, { path: "/" });
class bi {
  constructor(t) {
    var e, o;
    this.authCookieName = void 0, this.authCookieDomain = void 0, this.authCookieSameSite = void 0, this.authCookieName = (e = t.cookieName) != null ? e : "hanko", this.authCookieDomain = t.cookieDomain, this.authCookieSameSite = (o = t.cookieSameSite) != null ? o : "lax";
  }
  getAuthCookie() {
    return Dn.get(this.authCookieName);
  }
  setAuthCookie(t, e) {
    const o = { secure: !0, sameSite: this.authCookieSameSite };
    this.authCookieDomain !== void 0 && (o.domain = this.authCookieDomain);
    const i = He({}, o, e);
    if ((i.sameSite === "none" || i.sameSite === "None") && i.secure === !1) throw new We(new Error("Secure attribute must be set when SameSite=None"));
    Dn.set(this.authCookieName, t, i);
  }
  removeAuthCookie() {
    Dn.remove(this.authCookieName);
  }
}
class Ta {
  constructor(t) {
    this.keyName = void 0, this.keyName = t.keyName;
  }
  getSessionToken() {
    return sessionStorage.getItem(this.keyName);
  }
  setSessionToken(t) {
    sessionStorage.setItem(this.keyName, t);
  }
  removeSessionToken() {
    sessionStorage.removeItem(this.keyName);
  }
}
class $a {
  constructor(t) {
    this._xhr = void 0, this._xhr = t;
  }
  getResponseHeader(t) {
    return this._xhr.getResponseHeader(t);
  }
}
class Da {
  constructor(t) {
    this.headers = void 0, this.ok = void 0, this.status = void 0, this.statusText = void 0, this.url = void 0, this._decodedJSON = void 0, this.xhr = void 0, this.headers = new $a(t), this.ok = t.status >= 200 && t.status <= 299, this.status = t.status, this.statusText = t.statusText, this.url = t.responseURL, this.xhr = t;
  }
  json() {
    return this._decodedJSON || (this._decodedJSON = JSON.parse(this.xhr.response)), this._decodedJSON;
  }
  parseNumericHeader(t) {
    const e = parseInt(this.headers.getResponseHeader(t), 10);
    return isNaN(e) ? 0 : e;
  }
}
class Qn {
  constructor(t, e) {
    var o;
    this.timeout = void 0, this.api = void 0, this.dispatcher = void 0, this.cookie = void 0, this.sessionTokenStorage = void 0, this.lang = void 0, this.sessionTokenLocation = void 0, this.api = t, this.timeout = (o = e.timeout) != null ? o : 13e3, this.dispatcher = new yi(), this.cookie = new bi(He({}, e)), this.sessionTokenStorage = new Ta({ keyName: e.cookieName }), this.lang = e.lang, this.sessionTokenLocation = e.sessionTokenLocation;
  }
  _fetch(t, e, o = new XMLHttpRequest()) {
    const i = this, r = this.api + t, s = this.timeout, d = this.getAuthToken(), u = this.lang;
    return new Promise(function(c, l) {
      o.open(e.method, r, !0), o.setRequestHeader("Accept", "application/json"), o.setRequestHeader("Content-Type", "application/json"), o.setRequestHeader("X-Language", u), d && o.setRequestHeader("Authorization", `Bearer ${d}`), o.timeout = s, o.withCredentials = !0, o.onload = () => {
        i.processHeaders(o), c(new Da(o));
      }, o.onerror = () => {
        l(new We());
      }, o.ontimeout = () => {
        l(new bn());
      }, o.send(e.body ? e.body.toString() : null);
    });
  }
  processHeaders(t) {
    let e = "", o = 0, i = "";
    if (t.getAllResponseHeaders().split(`\r
`).forEach((r) => {
      const s = r.toLowerCase();
      s.startsWith("x-auth-token") ? e = t.getResponseHeader("X-Auth-Token") : s.startsWith("x-session-lifetime") ? o = parseInt(t.getResponseHeader("X-Session-Lifetime"), 10) : s.startsWith("x-session-retention") && (i = t.getResponseHeader("X-Session-Retention"));
    }), e) {
      const r = new RegExp("^https://"), s = !!this.api.match(r) && !!window.location.href.match(r), d = i === "session" ? void 0 : new Date((/* @__PURE__ */ new Date()).getTime() + 1e3 * o);
      this.setAuthToken(e, { secure: s, expires: d });
    }
  }
  get(t) {
    return this._fetch(t, { method: "GET" });
  }
  post(t, e) {
    return this._fetch(t, { method: "POST", body: JSON.stringify(e) });
  }
  put(t, e) {
    return this._fetch(t, { method: "PUT", body: JSON.stringify(e) });
  }
  patch(t, e) {
    return this._fetch(t, { method: "PATCH", body: JSON.stringify(e) });
  }
  delete(t) {
    return this._fetch(t, { method: "DELETE" });
  }
  getAuthToken() {
    let t = "";
    switch (this.sessionTokenLocation) {
      case "cookie":
      default:
        t = this.cookie.getAuthCookie();
        break;
      case "sessionStorage":
        t = this.sessionTokenStorage.getSessionToken();
    }
    return t;
  }
  setAuthToken(t, e) {
    switch (this.sessionTokenLocation) {
      case "cookie":
      default:
        return this.cookie.setAuthCookie(t, e);
      case "sessionStorage":
        return this.sessionTokenStorage.setSessionToken(t);
    }
  }
}
class Gn {
  constructor(t, e) {
    this.client = void 0, this.client = new Qn(t, e);
  }
}
class Xn extends Gn {
  async validate() {
    const t = await this.client.get("/sessions/validate");
    if (!t.ok) throw new We();
    return await t.json();
  }
}
class Ua {
  constructor(t) {
    this.storageKey = void 0, this.defaultState = { expiration: 0, lastCheck: 0 }, this.storageKey = t;
  }
  load() {
    const t = window.localStorage.getItem(this.storageKey);
    return t == null ? this.defaultState : JSON.parse(t);
  }
  save(t) {
    window.localStorage.setItem(this.storageKey, JSON.stringify(t || this.defaultState));
  }
}
class La {
  constructor(t, e) {
    this.onActivityCallback = void 0, this.onInactivityCallback = void 0, this.handleFocus = () => {
      this.onActivityCallback();
    }, this.handleBlur = () => {
      this.onInactivityCallback();
    }, this.handleVisibilityChange = () => {
      document.visibilityState === "visible" ? this.onActivityCallback() : this.onInactivityCallback();
    }, this.hasFocus = () => document.hasFocus(), this.onActivityCallback = t, this.onInactivityCallback = e, window.addEventListener("focus", this.handleFocus), window.addEventListener("blur", this.handleBlur), document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }
}
class Na {
  constructor(t, e, o) {
    this.intervalID = null, this.timeoutID = null, this.checkInterval = void 0, this.checkSession = void 0, this.onSessionExpired = void 0, this.checkInterval = t, this.checkSession = e, this.onSessionExpired = o;
  }
  scheduleSessionExpiry(t) {
    var e = this;
    this.stop(), this.timeoutID = setTimeout(async function() {
      e.stop(), e.onSessionExpired();
    }, t);
  }
  start(t = 0, e = 0) {
    var o = this;
    const i = this.calcTimeToNextCheck(t);
    this.sessionExpiresSoon(e) ? this.scheduleSessionExpiry(i) : this.timeoutID = setTimeout(async function() {
      try {
        let r = await o.checkSession();
        if (r.is_valid) {
          if (o.sessionExpiresSoon(r.expiration)) return void o.scheduleSessionExpiry(r.expiration - Date.now());
          o.intervalID = setInterval(async function() {
            r = await o.checkSession(), r.is_valid ? o.sessionExpiresSoon(r.expiration) && o.scheduleSessionExpiry(r.expiration - Date.now()) : o.stop();
          }, o.checkInterval);
        } else o.stop();
      } catch (r) {
        console.log(r);
      }
    }, i);
  }
  stop() {
    this.timeoutID && (clearTimeout(this.timeoutID), this.timeoutID = null), this.intervalID && (clearInterval(this.intervalID), this.intervalID = null);
  }
  isRunning() {
    return this.timeoutID !== null || this.intervalID !== null;
  }
  sessionExpiresSoon(t) {
    return t > 0 && t - Date.now() <= this.checkInterval;
  }
  calcTimeToNextCheck(t) {
    const e = Date.now() - t;
    return this.checkInterval >= e ? this.checkInterval - e % this.checkInterval : 0;
  }
}
class Ma {
  constructor(t = "hanko_session", e, o, i) {
    this.channel = void 0, this.onSessionExpired = void 0, this.onSessionCreated = void 0, this.onLeadershipRequested = void 0, this.handleMessage = (r) => {
      const s = r.data;
      switch (s.action) {
        case "sessionExpired":
          this.onSessionExpired(s);
          break;
        case "sessionCreated":
          this.onSessionCreated(s);
          break;
        case "requestLeadership":
          this.onLeadershipRequested(s);
      }
    }, this.onSessionExpired = e, this.onSessionCreated = o, this.onLeadershipRequested = i, this.channel = new BroadcastChannel(t), this.channel.onmessage = this.handleMessage;
  }
  post(t) {
    this.channel.postMessage(t);
  }
}
class wi extends yi {
  constructor(t, e) {
    super(), this.listener = new yn(), this.checkInterval = 3e4, this.client = void 0, this.sessionState = void 0, this.windowActivityManager = void 0, this.scheduler = void 0, this.sessionChannel = void 0, this.isLoggedIn = void 0, this.client = new Xn(t, e), e.sessionCheckInterval && (this.checkInterval = e.sessionCheckInterval < 3e3 ? 3e3 : e.sessionCheckInterval), this.sessionState = new Ua(`${e.cookieName}_session_state`), this.sessionChannel = new Ma(this.getSessionCheckChannelName(e.sessionTokenLocation, e.sessionCheckChannelName), () => this.onChannelSessionExpired(), (r) => this.onChannelSessionCreated(r), () => this.onChannelLeadershipRequested()), this.scheduler = new Na(this.checkInterval, () => this.checkSession(), () => this.onSessionExpired()), this.windowActivityManager = new La(() => this.startSessionCheck(), () => this.scheduler.stop());
    const o = Date.now(), { expiration: i } = this.sessionState.load();
    this.isLoggedIn = o < i, this.initializeEventListeners(), this.startSessionCheck();
  }
  initializeEventListeners() {
    this.listener.onSessionCreated((t) => {
      const { claims: e } = t, o = Date.parse(e.expiration), i = Date.now();
      this.isLoggedIn = !0, this.sessionState.save({ expiration: o, lastCheck: i }), this.sessionChannel.post({ action: "sessionCreated", claims: e }), this.startSessionCheck();
    }), this.listener.onUserLoggedOut(() => {
      this.isLoggedIn = !1, this.sessionChannel.post({ action: "sessionExpired" }), this.sessionState.save(null), this.scheduler.stop();
    }), window.addEventListener("beforeunload", () => this.scheduler.stop());
  }
  startSessionCheck() {
    if (!this.windowActivityManager.hasFocus() || (this.sessionChannel.post({ action: "requestLeadership" }), this.scheduler.isRunning())) return;
    const { lastCheck: t, expiration: e } = this.sessionState.load();
    this.isLoggedIn && this.scheduler.start(t, e);
  }
  async checkSession() {
    const t = Date.now(), { is_valid: e, claims: o, expiration_time: i } = await this.client.validate(), r = i ? Date.parse(i) : 0;
    return !e && this.isLoggedIn && this.dispatchSessionExpiredEvent(), e ? (this.isLoggedIn = !0, this.sessionState.save({ lastCheck: t, expiration: r })) : (this.isLoggedIn = !1, this.sessionState.save(null), this.sessionChannel.post({ action: "sessionExpired" })), { is_valid: e, claims: o, expiration: r };
  }
  onSessionExpired() {
    this.isLoggedIn && (this.isLoggedIn = !1, this.sessionState.save(null), this.sessionChannel.post({ action: "sessionExpired" }), this.dispatchSessionExpiredEvent());
  }
  onChannelSessionExpired() {
    this.isLoggedIn && (this.isLoggedIn = !1, this.dispatchSessionExpiredEvent());
  }
  onChannelSessionCreated(t) {
    const { claims: e } = t, o = Date.now(), i = Date.parse(e.expiration) - o;
    this.isLoggedIn = !0, this.dispatchSessionCreatedEvent({ claims: e, expirationSeconds: i });
  }
  onChannelLeadershipRequested() {
    this.windowActivityManager.hasFocus() || this.scheduler.stop();
  }
  getSessionCheckChannelName(t, e) {
    if (t !== "sessionStorage") return e;
    let o = sessionStorage.getItem("sessionCheckChannelName");
    return o != null && o !== "" || (o = `${e}-${Math.floor(100 * Math.random()) + 1}`, sessionStorage.setItem("sessionCheckChannelName", o)), o;
  }
}
class ft {
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
function ki(n) {
  const t = "==".slice(0, (4 - n.length % 4) % 4), e = n.replace(/-/g, "+").replace(/_/g, "/") + t, o = atob(e), i = new ArrayBuffer(o.length), r = new Uint8Array(i);
  for (let s = 0; s < o.length; s++) r[s] = o.charCodeAt(s);
  return i;
}
function Si(n) {
  const t = new Uint8Array(n);
  let e = "";
  for (const o of t) e += String.fromCharCode(o);
  return btoa(e).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
var ce = "copy", Me = "convert";
function _t(n, t, e) {
  if (t === ce) return e;
  if (t === Me) return n(e);
  if (t instanceof Array) return e.map((o) => _t(n, t[0], o));
  if (t instanceof Object) {
    const o = {};
    for (const [i, r] of Object.entries(t)) {
      if (r.derive) {
        const s = r.derive(e);
        s !== void 0 && (e[i] = s);
      }
      if (i in e) o[i] = e[i] != null ? _t(n, r.schema, e[i]) : null;
      else if (r.required) throw new Error(`Missing key: ${i}`);
    }
    return o;
  }
}
function zn(n, t) {
  return { required: !0, schema: n, derive: t };
}
function me(n) {
  return { required: !0, schema: n };
}
function we(n) {
  return { required: !1, schema: n };
}
var xi = { type: me(ce), id: me(Me), transports: we(ce) }, Ci = { appid: we(ce), appidExclude: we(ce), credProps: we(ce) }, Ai = { appid: we(ce), appidExclude: we(ce), credProps: we(ce) }, Ra = { publicKey: me({ rp: me(ce), user: me({ id: me(Me), name: me(ce), displayName: me(ce) }), challenge: me(Me), pubKeyCredParams: me(ce), timeout: we(ce), excludeCredentials: we([xi]), authenticatorSelection: we(ce), attestation: we(ce), extensions: we(Ci) }), signal: we(ce) }, za = { type: me(ce), id: me(ce), rawId: me(Me), authenticatorAttachment: we(ce), response: me({ clientDataJSON: me(Me), attestationObject: me(Me), transports: zn(ce, (n) => {
  var t;
  return ((t = n.getTransports) == null ? void 0 : t.call(n)) || [];
}) }), clientExtensionResults: zn(Ai, (n) => n.getClientExtensionResults()) }, Ha = { mediation: we(ce), publicKey: me({ challenge: me(Me), timeout: we(ce), rpId: we(ce), allowCredentials: we([xi]), userVerification: we(ce), extensions: we(Ci) }), signal: we(ce) }, qa = { type: me(ce), id: me(ce), rawId: me(Me), authenticatorAttachment: we(ce), response: me({ clientDataJSON: me(Me), authenticatorData: me(Me), signature: me(Me), userHandle: me(Me) }), clientExtensionResults: zn(Ai, (n) => n.getClientExtensionResults()) };
async function Oo(n) {
  const t = await navigator.credentials.get(function(e) {
    return _t(ki, Ha, e);
  }(n));
  return function(e) {
    return _t(Si, qa, e);
  }(t);
}
class Ze {
  constructor() {
    this.abortController = new AbortController();
  }
  static getInstance() {
    return Ze.instance || (Ze.instance = new Ze()), Ze.instance;
  }
  createAbortSignal() {
    return this.abortController.abort(), this.abortController = new AbortController(), this.abortController.signal;
  }
  async getWebauthnCredential(t) {
    return await Oo(He({}, t, { signal: this.createAbortSignal() }));
  }
  async getConditionalWebauthnCredential(t) {
    return await Oo({ publicKey: t, mediation: "conditional", signal: this.createAbortSignal() });
  }
  async createWebauthnCredential(t) {
    return await async function(e) {
      return o = await navigator.credentials.create(function(i) {
        return _t(ki, Ra, i);
      }(e)), _t(Si, za, o);
      var o;
    }(He({}, t, { signal: this.createAbortSignal() }));
  }
}
Ze.instance = null;
const eo = "hanko_pkce_code_verifier", wn = () => {
  let n = "";
  const t = new Uint8Array(1);
  for (; n.length < 64; ) {
    window.crypto.getRandomValues(t);
    const e = t[0];
    e < 198 && (n += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~".charAt(e % 66));
  }
  return n;
}, kn = (n) => {
  typeof window < "u" && window.sessionStorage && window.sessionStorage.setItem(eo, n);
}, Pi = () => typeof window < "u" && window.sessionStorage ? window.sessionStorage.getItem(eo) : null, nt = () => {
  typeof window < "u" && window.sessionStorage && window.sessionStorage.removeItem(eo);
};
async function To(n, t, e, o = "webauthn_credential_already_exists", i = "Webauthn credential already exists") {
  try {
    const r = await t.createWebauthnCredential(e);
    return await n.actions.webauthn_verify_attestation_response.run({ public_key: r });
  } catch {
    const s = await n.actions.back.run();
    return s.error = { code: o, message: i }, s;
  }
}
const $o = { preflight: async (n) => await n.actions.register_client_capabilities.run({ webauthn_available: ft.supported(), webauthn_conditional_mediation_available: await ft.isConditionalMediationAvailable(), webauthn_platform_authenticator_available: await ft.isPlatformAuthenticatorAvailable() }), login_passkey: async (n) => {
  const t = Ze.getInstance();
  try {
    const e = await t.getWebauthnCredential(n.payload.request_options);
    return await n.actions.webauthn_verify_assertion_response.run({ assertion_response: e });
  } catch {
    const o = await n.actions.back.run();
    return n.error && (o.error = n.error), o;
  }
}, onboarding_verify_passkey_attestation: async (n) => To(n, Ze.getInstance(), n.payload.creation_options), webauthn_credential_verification: async (n) => To(n, Ze.getInstance(), n.payload.creation_options), async thirdparty(n) {
  const t = new URLSearchParams(window.location.search), e = t.get("hanko_token"), o = t.get("error"), i = (r) => {
    r.forEach((d) => t.delete(d));
    const s = t.toString() ? `?${t.toString()}` : "";
    history.replaceState(null, null, `${window.location.pathname}${s}`);
  };
  if ((e == null ? void 0 : e.length) > 0) {
    i(["hanko_token"]);
    const r = Pi();
    try {
      return await n.actions.exchange_token.run({ token: e, code_verifier: r || void 0 });
    } finally {
      nt();
    }
  }
  if ((o == null ? void 0 : o.length) > 0) {
    const r = o === "access_denied" ? "third_party_access_denied" : "technical_error", s = t.get("error_description");
    i(["error", "error_description"]);
    const d = await n.actions.back.run(null, { dispatchAfterStateChangeEvent: !1 });
    return d.error = { code: r, message: s }, d.dispatchAfterStateChangeEvent(), d;
  }
  return n.isCached ? await n.actions.back.run() : (n.saveToLocalStorage(), window.location.assign(n.payload.redirect_url), n);
}, success: async (n) => {
  const { claims: t } = n.payload, e = Date.parse(t.expiration) - Date.now();
  return n.removeFromLocalStorage(), n.hanko.relay.dispatchSessionCreatedEvent({ claims: t, expirationSeconds: e }), n;
}, account_deleted: async (n) => (n.removeFromLocalStorage(), n.hanko.relay.dispatchUserDeletedEvent(), n) }, Do = { login_init: async (n) => {
  (async function() {
    const t = Ze.getInstance();
    if (n.payload.request_options) try {
      const { publicKey: e } = n.payload.request_options, o = await t.getConditionalWebauthnCredential(e);
      return await n.actions.webauthn_verify_assertion_response.run({ assertion_response: o });
    } catch {
      return;
    }
  })();
} };
class ze {
  constructor(t, e, o, i = {}) {
    if (this.name = void 0, this.flowName = void 0, this.error = void 0, this.payload = void 0, this.actions = void 0, this.csrfToken = void 0, this.status = void 0, this.previousAction = void 0, this.isCached = void 0, this.cacheKey = void 0, this.hanko = void 0, this.invokedAction = void 0, this.excludeAutoSteps = void 0, this.autoStep = void 0, this.passkeyAutofillActivation = void 0, this.flowName = e, this.name = o.name, this.error = o.error, this.payload = o.payload, this.csrfToken = o.csrf_token, this.status = o.status, this.hanko = t, this.actions = this.buildActionMap(o.actions), this.name in $o) {
      const l = $o[this.name];
      this.autoStep = () => l(this);
    }
    if (this.name in Do) {
      const l = Do[this.name];
      this.passkeyAutofillActivation = () => l(this);
    }
    const { dispatchAfterStateChangeEvent: r = !0, excludeAutoSteps: s = null, previousAction: d = null, isCached: u = !1, cacheKey: c = "hanko-flow-state" } = i;
    this.excludeAutoSteps = s, this.previousAction = d, this.isCached = u, this.cacheKey = c, r && this.dispatchAfterStateChangeEvent();
  }
  buildActionMap(t) {
    const e = {};
    return Object.keys(t).forEach((o) => {
      e[o] = new jt(t[o], this);
    }), new Proxy(e, { get: (o, i) => {
      if (i in o) return o[i];
      const r = typeof i == "string" ? i : i.toString();
      return jt.createDisabled(r, this);
    } });
  }
  dispatchAfterStateChangeEvent() {
    this.hanko.relay.dispatchAfterStateChangeEvent({ state: this });
  }
  serialize() {
    return { flow_name: this.flowName, name: this.name, error: this.error, payload: this.payload, csrf_token: this.csrfToken, status: this.status, previous_action: this.previousAction, actions: Object.fromEntries(Object.entries(this.actions).map(([t, e]) => [t, { action: e.name, href: e.href, inputs: e.inputs, description: null }])) };
  }
  saveToLocalStorage() {
    localStorage.setItem(this.cacheKey, JSON.stringify(He({}, this.serialize(), { is_cached: !0 })));
  }
  removeFromLocalStorage() {
    localStorage.removeItem(this.cacheKey);
  }
  static async initializeFlowState(t, e, o, i = {}) {
    let r = new ze(t, e, o, i);
    if (r.excludeAutoSteps != "all") for (; r && r.autoStep && ((s = r.excludeAutoSteps) == null || !s.includes(r.name)); ) {
      var s;
      const d = await r.autoStep();
      if (d.name == r.name) return d;
      r = d;
    }
    return r;
  }
  static readFromLocalStorage(t) {
    const e = localStorage.getItem(t);
    if (e) try {
      return JSON.parse(e);
    } catch {
      return;
    }
  }
  static async create(t, e, o = {}) {
    const { cacheKey: i = "hanko-flow-state", loadFromCache: r = !0 } = o;
    if (r) {
      const d = ze.readFromLocalStorage(i);
      if (d) return ze.deserialize(t, d, He({}, o, { cacheKey: i }));
    }
    const s = await ze.fetchState(t, `/${e}`);
    return ze.initializeFlowState(t, e, s, He({}, o, { cacheKey: i }));
  }
  static async deserialize(t, e, o = {}) {
    return ze.initializeFlowState(t, e.flow_name, e, He({}, o, { previousAction: e.previous_action, isCached: e.is_cached }));
  }
  static async fetchState(t, e, o) {
    try {
      return (await t.client.post(e, o)).json();
    } catch (i) {
      return ze.createErrorResponse(i);
    }
  }
  static createErrorResponse(t) {
    return { actions: null, csrf_token: "", name: "error", payload: null, status: 0, error: t };
  }
}
class jt {
  constructor(t, e, o = !0) {
    this.enabled = void 0, this.href = void 0, this.name = void 0, this.inputs = void 0, this.parentState = void 0, this.enabled = o, this.href = t.href, this.name = t.action, this.inputs = t.inputs, this.parentState = e;
  }
  static createDisabled(t, e) {
    return new jt({ action: t, href: "", inputs: {}, description: "Disabled action" }, e, !1);
  }
  async run(t = null, e = {}) {
    const { name: o, hanko: i, flowName: r, csrfToken: s, invokedAction: d, excludeAutoSteps: u, cacheKey: c } = this.parentState, { dispatchAfterStateChangeEvent: l = !0 } = e;
    if (!this.enabled) throw new Error(`Action '${this.name}' is not enabled in state '${o}'`);
    if (d) throw new Error(`An action '${d.name}' has already been invoked on state '${d.relatedStateName}'. No further actions can be run.`);
    this.parentState.invokedAction = { name: this.name, relatedStateName: o }, i.relay.dispatchBeforeStateChangeEvent({ state: this.parentState });
    const m = { input_data: He({}, Object.keys(this.inputs).reduce((g, k) => {
      const x = this.inputs[k];
      return x.value !== void 0 && (g[k] = x.value), g;
    }, {}), t), csrf_token: s }, v = await ze.fetchState(i, this.href, m);
    return this.parentState.removeFromLocalStorage(), ze.initializeFlowState(i, r, v, { dispatchAfterStateChangeEvent: l, excludeAutoSteps: u, previousAction: d, cacheKey: c });
  }
}
class Ei extends Gn {
  async getCurrent() {
    const t = await this.client.get("/me");
    if (t.status === 401) throw this.client.dispatcher.dispatchSessionExpiredEvent(), new mt();
    if (!t.ok) throw new We();
    const e = t.json(), o = await this.client.get(`/users/${e.id}`);
    if (o.status === 401) throw this.client.dispatcher.dispatchSessionExpiredEvent(), new mt();
    if (!o.ok) throw new We();
    return o.json();
  }
  async getCurrentUser() {
    const t = await this.client.get("/me");
    if (t.status === 401) throw this.client.dispatcher.dispatchSessionExpiredEvent(), new mt();
    if (!t.ok) throw new We();
    return t.json();
  }
  async logout() {
    const t = await this.client.post("/logout");
    if (this.client.sessionTokenStorage.removeSessionToken(), this.client.cookie.removeAuthCookie(), this.client.dispatcher.dispatchUserLoggedOutEvent(), t.status !== 401 && !t.ok) throw new We();
  }
}
class Ii extends yn {
  constructor(t, e) {
    super(), this.session = void 0, this.user = void 0, this.cookie = void 0, this.client = void 0, this.relay = void 0;
    const o = He({ timeout: 13e3, cookieName: "hanko", localStorageKey: "hanko", sessionCheckInterval: 3e4, sessionCheckChannelName: "hanko-session-check" }, e);
    this.client = new Qn(t, o), this.session = new Xn(t, o), this.user = new Ei(t, o), this.relay = new wi(t, o), this.cookie = new bi(o);
  }
  setLang(t) {
    this.client.lang = t;
  }
  createState(t, e = {}) {
    return ze.create(this, t, e);
  }
  async getUser() {
    return this.user.getCurrent();
  }
  async getCurrentUser() {
    return this.user.getCurrentUser();
  }
  async validateSession() {
    return this.session.validate();
  }
  getSessionToken() {
    return this.cookie.getAuthCookie();
  }
  async logout() {
    return this.user.logout();
  }
}
var ja = ee(292), Je = ee.n(ja), Fa = ee(360), Ye = ee.n(Fa), Wa = ee(884), Qe = ee.n(Wa), Ka = ee(88), Ge = ee.n(Ka), on = ee(890), xt = {};
xt.setAttributes = Qe(), xt.insert = (n) => {
  window._hankoStyle = n;
}, xt.domAPI = Ye(), xt.insertStyleElement = Ge(), Je()(on.A, xt);
const Ft = on.A && on.A.locals ? on.A.locals : void 0, Va = function(n) {
  function t(e) {
    var o = hi({}, e);
    return delete o.ref, n(o, e.ref || null);
  }
  return t.$$typeof = _a, t.render = n, t.prototype.isReactComponent = t.__f = !0, t.displayName = "ForwardRef(" + (n.displayName || n.name) + ")", t;
}((n, t) => {
  const { lang: e, hanko: o, setHanko: i } = (0, f.useContext)(Ue), { setLang: r } = (0, f.useContext)(J.TranslateContext);
  return (0, f.useEffect)(() => {
    r(e.replace(/[-]/, "")), i((s) => (s.setLang(e), s));
  }, [o, e, i, r]), a("section", { part: "container", className: Ft.container, ref: t, children: n.children });
});
var an = ee(313), Ct = {};
Ct.setAttributes = Qe(), Ct.insert = (n) => {
  window._hankoStyle = n;
}, Ct.domAPI = Ye(), Ct.insertStyleElement = Ge(), Je()(an.A, Ct);
const $ = an.A && an.A.locals ? an.A.locals : void 0;
var Ba = ee(452), Q = ee.n(Ba);
const Za = ({ size: n, secondary: t, disabled: e }) => a("svg", { id: "icon-apple", xmlns: "http://www.w3.org/2000/svg", width: n, height: n, viewBox: "20.5 16 15 19", className: Q()($.icon, t && $.secondary, e && $.disabled), children: a("path", { d: "M28.2226562,20.3846154 C29.0546875,20.3846154 30.0976562,19.8048315 30.71875,19.0317864 C31.28125,18.3312142 31.6914062,17.352829 31.6914062,16.3744437 C31.6914062,16.2415766 31.6796875,16.1087095 31.65625,16 C30.7304687,16.0362365 29.6171875,16.640178 28.9492187,17.4494596 C28.421875,18.06548 27.9414062,19.0317864 27.9414062,20.0222505 C27.9414062,20.1671964 27.9648438,20.3121424 27.9765625,20.3604577 C28.0351562,20.3725366 28.1289062,20.3846154 28.2226562,20.3846154 Z M25.2929688,35 C26.4296875,35 26.9335938,34.214876 28.3515625,34.214876 C29.7929688,34.214876 30.109375,34.9758423 31.375,34.9758423 C32.6171875,34.9758423 33.4492188,33.792117 34.234375,32.6325493 C35.1132812,31.3038779 35.4765625,29.9993643 35.5,29.9389701 C35.4179688,29.9148125 33.0390625,28.9122695 33.0390625,26.0979021 C33.0390625,23.6579784 34.9140625,22.5588048 35.0195312,22.474253 C33.7773438,20.6382708 31.890625,20.5899555 31.375,20.5899555 C29.9804688,20.5899555 28.84375,21.4596313 28.1289062,21.4596313 C27.3554688,21.4596313 26.3359375,20.6382708 25.1289062,20.6382708 C22.8320312,20.6382708 20.5,22.5950413 20.5,26.2911634 C20.5,28.5861411 21.3671875,31.013986 22.4335938,32.5842339 C23.3476562,33.9129053 24.1445312,35 25.2929688,35 Z" }) }), Ja = ({ secondary: n, size: t, fadeOut: e, disabled: o }) => a("svg", { id: "icon-checkmark", xmlns: "http://www.w3.org/2000/svg", viewBox: "4 4 40 40", width: t, height: t, className: Q()($.checkmark, n && $.secondary, e && $.fadeOut, o && $.disabled), children: a("path", { d: "M21.05 33.1 35.2 18.95l-2.3-2.25-11.85 11.85-6-6-2.25 2.25ZM24 44q-4.1 0-7.75-1.575-3.65-1.575-6.375-4.3-2.725-2.725-4.3-6.375Q4 28.1 4 24q0-4.15 1.575-7.8 1.575-3.65 4.3-6.35 2.725-2.7 6.375-4.275Q19.9 4 24 4q4.15 0 7.8 1.575 3.65 1.575 6.35 4.275 2.7 2.7 4.275 6.35Q44 19.85 44 24q0 4.1-1.575 7.75-1.575 3.65-4.275 6.375t-6.35 4.3Q28.15 44 24 44Zm0-3q7.1 0 12.05-4.975Q41 31.05 41 24q0-7.1-4.95-12.05Q31.1 7 24 7q-7.05 0-12.025 4.95Q7 16.9 7 24q0 7.05 4.975 12.025Q16.95 41 24 41Zm0-17Z" }) }), Ya = ({ size: n, secondary: t, disabled: e }) => a("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 -960 960 960", width: n, height: n, className: Q()($.icon, t && $.secondary, e && $.disabled), children: a("path", { d: "M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" }) }), Qa = ({ size: n, secondary: t, disabled: e }) => a("svg", { id: "icon-custom-provider", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: n, height: n, className: Q()($.icon, t && $.secondary, e && $.disabled), children: [a("path", { d: "M0 0h24v24H0z", fill: "none" }), a("path", { d: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" })] }), Ga = ({ size: n, secondary: t, disabled: e }) => a("svg", { id: "icon-discord", fill: "#fff", xmlns: "http://www.w3.org/2000/svg", width: n, height: n, viewBox: "0 0 127.14 96.36", className: Q()($.icon, t && $.secondary, e && $.disabled), children: a("path", { d: "M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" }) }), Xa = ({ size: n, secondary: t, disabled: e }) => a("svg", { id: "icon-exclamation", xmlns: "http://www.w3.org/2000/svg", viewBox: "5 2 13 20", width: n, height: n, className: Q()($.exclamationMark, t && $.secondary, e && $.disabled), children: a("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" }) }), er = ({ size: n, secondary: t, disabled: e }) => a("svg", { width: n, height: n, viewBox: "0 0 666.66668 666.66717", xmlns: "http://www.w3.org/2000/svg", children: [a("defs", { id: "defs13", children: a("clipPath", { clipPathUnits: "userSpaceOnUse", id: "clipPath25", children: a("path", { d: "M 0,700 H 700 V 0 H 0 Z", id: "path23" }) }) }), a("g", { id: "g17", transform: "matrix(1.3333333,0,0,-1.3333333,-133.33333,799.99999)", children: a("g", { id: "g19", children: a("g", { id: "g21", clipPath: "url(#clipPath25)", children: [a("g", { id: "g27", transform: "translate(600,350)", children: a("path", { className: Q()($.facebookIcon, e ? $.disabledOutline : $.outline), d: "m 0,0 c 0,138.071 -111.929,250 -250,250 -138.071,0 -250,-111.929 -250,-250 0,-117.245 80.715,-215.622 189.606,-242.638 v 166.242 h -51.552 V 0 h 51.552 v 32.919 c 0,85.092 38.508,124.532 122.048,124.532 15.838,0 43.167,-3.105 54.347,-6.211 V 81.986 c -5.901,0.621 -16.149,0.932 -28.882,0.932 -40.993,0 -56.832,-15.528 -56.832,-55.9 V 0 h 81.659 l -14.028,-76.396 h -67.631 V -248.169 C -95.927,-233.218 0,-127.818 0,0", id: "path29" }) }), a("g", { id: "g31", transform: "translate(447.9175,273.6036)", children: a("path", { className: Q()($.facebookIcon, e ? $.disabledLetter : $.letter), d: "M 0,0 14.029,76.396 H -67.63 v 27.019 c 0,40.372 15.838,55.899 56.831,55.899 12.733,0 22.981,-0.31 28.882,-0.931 v 69.253 c -11.18,3.106 -38.509,6.212 -54.347,6.212 -83.539,0 -122.048,-39.441 -122.048,-124.533 V 76.396 h -51.552 V 0 h 51.552 v -166.242 c 19.343,-4.798 39.568,-7.362 60.394,-7.362 10.254,0 20.358,0.632 30.288,1.831 L -67.63,0 Z", id: "path33" }) })] }) }) })] }), tr = ({ size: n, secondary: t, disabled: e }) => a("svg", { id: "icon-github", xmlns: "http://www.w3.org/2000/svg", fill: "#fff", viewBox: "0 0 97.63 96", width: n, height: n, className: Q()($.icon, t && $.secondary, e && $.disabled), children: [a("path", { d: "M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" }), " "] }), nr = ({ size: n, disabled: t }) => a("svg", { id: "icon-google", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: n, height: n, className: $.googleIcon, children: [a("path", { className: Q()($.googleIcon, t ? $.disabled : $.blue), d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }), a("path", { className: Q()($.googleIcon, t ? $.disabled : $.green), d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), a("path", { className: Q()($.googleIcon, t ? $.disabled : $.yellow), d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }), a("path", { className: Q()($.googleIcon, t ? $.disabled : $.red), d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" }), a("path", { d: "M1 1h22v22H1z", fill: "none" })] }), or = ({ size: n, secondary: t, disabled: e }) => a("svg", { id: "icon-linkedin", fill: "#fff", xmlns: "http://www.w3.org/2000/svg", width: n, viewBox: "0 0 24 24", height: n, className: Q()($.icon, t && $.secondary, e && $.disabled), children: a("path", { d: "M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" }) }), ir = ({ size: n, secondary: t, disabled: e }) => a("svg", { id: "icon-mail", xmlns: "http://www.w3.org/2000/svg", width: n, height: n, viewBox: "0 -960 960 960", className: Q()($.icon, t && $.secondary, e && $.disabled), children: a("path", { d: "M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" }) }), ar = ({ size: n, disabled: t }) => a("svg", { id: "icon-microsoft", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: n, height: n, className: $.microsoftIcon, children: [a("rect", { className: Q()($.microsoftIcon, t ? $.disabled : $.blue), x: "1", y: "1", width: "9", height: "9" }), a("rect", { className: Q()($.microsoftIcon, t ? $.disabled : $.green), x: "1", y: "11", width: "9", height: "9" }), a("rect", { className: Q()($.microsoftIcon, t ? $.disabled : $.yellow), x: "11", y: "1", width: "9", height: "9" }), a("rect", { className: Q()($.microsoftIcon, t ? $.disabled : $.red), x: "11", y: "11", width: "9", height: "9" })] }), rr = ({ size: n, secondary: t, disabled: e }) => a("svg", { id: "icon-passkey", xmlns: "http://www.w3.org/2000/svg", viewBox: "3 1.5 19.5 19", width: n, height: n, className: Q()($.icon, t && $.secondary, e && $.disabled), children: a("g", { id: "icon-passkey-all", children: [a("circle", { id: "icon-passkey-head", cx: "10.5", cy: "6", r: "4.5" }), a("path", { id: "icon-passkey-key", d: "M22.5,10.5a3.5,3.5,0,1,0-5,3.15V19L19,20.5,21.5,18,20,16.5,21.5,15l-1.24-1.24A3.5,3.5,0,0,0,22.5,10.5Zm-3.5,0a1,1,0,1,1,1-1A1,1,0,0,1,19,10.5Z" }), a("path", { id: "icon-passkey-body", d: "M14.44,12.52A6,6,0,0,0,12,12H9a6,6,0,0,0-6,6v2H16V14.49A5.16,5.16,0,0,1,14.44,12.52Z" })] }) }), sr = ({ size: n, secondary: t, disabled: e }) => a("svg", { id: "icon-password", xmlns: "http://www.w3.org/2000/svg", width: n, height: n, viewBox: "0 -960 960 960", className: Q()($.icon, t && $.secondary, e && $.disabled), children: a("path", { d: "M80-200v-80h800v80H80Zm46-242-52-30 34-60H40v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Zm320 0-52-30 34-60h-68v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Zm320 0-52-30 34-60h-68v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Z" }) }), cr = ({ size: n, secondary: t, disabled: e }) => a("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 -960 960 960", width: n, height: n, className: Q()($.icon, t && $.secondary, e && $.disabled), children: a("path", { d: "M80-680v-200h200v80H160v120H80Zm0 600v-200h80v120h120v80H80Zm600 0v-80h120v-120h80v200H680Zm120-600v-120H680v-80h200v200h-80ZM700-260h60v60h-60v-60Zm0-120h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60-60h60v60h-60v-60Zm120-120h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60-60h60v60h-60v-60Zm240-320v240H520v-240h240ZM440-440v240H200v-240h240Zm0-320v240H200v-240h240Zm-60 500v-120H260v120h120Zm0-320v-120H260v120h120Zm320 0v-120H580v120h120Z" }) }), lr = ({ size: n, secondary: t, disabled: e }) => a("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 -960 960 960", width: n, height: n, className: Q()($.icon, t && $.secondary, e && $.disabled), children: a("path", { d: "M280-240q-100 0-170-70T40-480q0-100 70-170t170-70q66 0 121 33t87 87h432v240h-80v120H600v-120H488q-32 54-87 87t-121 33Zm0-80q66 0 106-40.5t48-79.5h246v120h80v-120h80v-80H434q-8-39-48-79.5T280-640q-66 0-113 47t-47 113q0 66 47 113t113 47Zm0-80q33 0 56.5-23.5T360-480q0-33-23.5-56.5T280-560q-33 0-56.5 23.5T200-480q0 33 23.5 56.5T280-400Zm0-80Z" }) }), dr = ({ size: n, disabled: t }) => a("svg", { id: "icon-spinner", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: n, height: n, className: Q()($.loadingSpinner, t && $.disabled), children: [a("path", { d: "M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z", opacity: ".25" }), a("path", { d: "M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z" })] }), Wt = ({ name: n, secondary: t, size: e = 18, fadeOut: o, disabled: i }) => a(Rn[n], { size: e, secondary: t, fadeOut: o, disabled: i }), to = ({ children: n, isLoading: t, isSuccess: e, fadeOut: o, secondary: i, hasIcon: r, maxWidth: s }) => a(b.Fragment, { children: a("div", t ? { className: Q()($.loadingSpinnerWrapper, $.centerContent, s && $.maxWidth), children: a(Wt, { name: "spinner", secondary: i }) } : e ? { className: Q()($.loadingSpinnerWrapper, $.centerContent, s && $.maxWidth), children: a(Wt, { name: "checkmark", secondary: i, fadeOut: o }) } : { className: r ? $.loadingSpinnerWrapperIcon : $.loadingSpinnerWrapper, children: n }) }), ur = () => a(to, { isLoading: !0 }), Ee = (n) => {
  const [t, e] = (0, f.useState)(n);
  return (0, f.useEffect)(() => {
    n && e(n);
  }, [n]), { flowState: t };
};
var rn = ee(681), At = {};
At.setAttributes = Qe(), At.insert = (n) => {
  window._hankoStyle = n;
}, At.domAPI = Ye(), At.insertStyleElement = Ge(), Je()(rn.A, At);
const xe = rn.A && rn.A.locals ? rn.A.locals : void 0, Oi = (n, t, e) => {
  const { hanko: o, setUIState: i, isOwnFlow: r } = (0, f.useContext)(Ue);
  (0, f.useEffect)(() => o.onBeforeStateChange(({ state: s }) => {
    n && r(s) && (i((d) => Object.assign(Object.assign({}, d), { isDisabled: !0, error: void 0 })), t(s.invokedAction.name == n.name));
  }), [n, o, r, t, i]), (0, f.useEffect)(() => o.onAfterStateChange(({ state: s }) => {
    var d;
    n && r(s) && (e(((d = s.previousAction) === null || d === void 0 ? void 0 : d.name) == n.name), t(!1));
  }), [o, e, t, n, r]);
}, Ti = (0, b.createContext)({}), te = ({ onSubmit: n, children: t, hidden: e = !1, maxWidth: o, flowAction: i }) => a(Ti.Provider, { value: { flowAction: i }, children: i && i.enabled && !e ? a("form", { onSubmit: n || ((r) => function(s, d, u, c) {
  return new (u || (u = Promise))(function(l, m) {
    function v(x) {
      try {
        k(c.next(x));
      } catch (C) {
        m(C);
      }
    }
    function g(x) {
      try {
        k(c.throw(x));
      } catch (C) {
        m(C);
      }
    }
    function k(x) {
      var C;
      x.done ? l(x.value) : (C = x.value, C instanceof u ? C : new u(function(D) {
        D(C);
      })).then(v, g);
    }
    k((c = c.apply(s, [])).next());
  });
}(void 0, void 0, void 0, function* () {
  return r.preventDefault(), yield i.run();
})), className: xe.form, children: a("ul", { className: xe.ul, children: (0, b.toChildArray)(t).map((r, s) => a("li", { part: "form-item", className: Q()(xe.li, o ? xe.maxWidth : null), children: r }, s)) }) }) : null }), ne = (n) => {
  var { title: t, children: e, secondary: o, dangerous: i, autofocus: r, showLastUsed: s, onClick: d, icon: u, showSuccessIcon: c } = n, l = function(I, M) {
    var z = {};
    for (var F in I) Object.prototype.hasOwnProperty.call(I, F) && M.indexOf(F) < 0 && (z[F] = I[F]);
    if (I != null && typeof Object.getOwnPropertySymbols == "function") {
      var V = 0;
      for (F = Object.getOwnPropertySymbols(I); V < F.length; V++) M.indexOf(F[V]) < 0 && Object.prototype.propertyIsEnumerable.call(I, F[V]) && (z[F[V]] = I[F[V]]);
    }
    return z;
  }(n, ["title", "children", "secondary", "dangerous", "autofocus", "showLastUsed", "onClick", "icon", "showSuccessIcon"]);
  const m = (0, f.useRef)(null), { uiState: v } = (0, f.useContext)(Ue), { t: g } = (0, f.useContext)(J.TranslateContext), [k, x] = (0, f.useState)(!1), [C, D] = (0, f.useState)(!1), { flowAction: W } = (0, f.useContext)(Ti);
  Oi(W, x, D), (0, f.useEffect)(() => {
    const { current: I } = m;
    I && r && I.focus();
  }, [r]);
  const w = (0, f.useMemo)(() => c && (C || l.isSuccess), [C, l, c]), E = (0, f.useMemo)(() => v.isDisabled || l.disabled, [l, v]);
  return a("button", { part: i ? "button dangerous-button" : o ? "button secondary-button" : "button primary-button", title: t, ref: m, type: "submit", disabled: E, onClick: d, className: Q()(xe.button, i ? xe.dangerous : o ? xe.secondary : xe.primary), "data-bubble": s ? g("labels.lastUsed") : void 0, children: a(to, { isLoading: k, isSuccess: w, secondary: !0, hasIcon: !!u, maxWidth: !0, children: [u ? a(Wt, { name: u, secondary: o, disabled: E }) : null, a("div", { className: xe.caption, children: a("span", { children: e }) })] }) });
}, Le = (n) => {
  var t, e, o, i, r, { label: s } = n, d = function(g, k) {
    var x = {};
    for (var C in g) Object.prototype.hasOwnProperty.call(g, C) && k.indexOf(C) < 0 && (x[C] = g[C]);
    if (g != null && typeof Object.getOwnPropertySymbols == "function") {
      var D = 0;
      for (C = Object.getOwnPropertySymbols(g); D < C.length; D++) k.indexOf(C[D]) < 0 && Object.prototype.propertyIsEnumerable.call(g, C[D]) && (x[C[D]] = g[C[D]]);
    }
    return x;
  }(n, ["label"]);
  const u = (0, f.useRef)(null), { uiState: c } = (0, f.useContext)(Ue), { t: l } = (0, f.useContext)(J.TranslateContext), m = (0, f.useMemo)(() => c.isDisabled || d.disabled, [d, c]);
  (0, f.useEffect)(() => {
    const { current: g } = u;
    g && d.autofocus && (g.focus(), g.select());
  }, [d.autofocus]);
  const v = (0, f.useMemo)(() => {
    var g;
    return d.markOptional && !(!((g = d.flowInput) === null || g === void 0) && g.required) ? `${d.placeholder} (${l("labels.optional")})` : d.placeholder;
  }, [d.markOptional, d.placeholder, d.flowInput, l]);
  return a("div", { className: xe.inputWrapper, children: a("input", Object.assign({ part: "input text-input", required: (t = d.flowInput) === null || t === void 0 ? void 0 : t.required, maxLength: (e = d.flowInput) === null || e === void 0 ? void 0 : e.max_length, minLength: (o = d.flowInput) === null || o === void 0 ? void 0 : o.min_length, hidden: (i = d.flowInput) === null || i === void 0 ? void 0 : i.hidden }, d, { ref: u, "aria-label": v, placeholder: v, className: Q()(xe.input, !!(!((r = d.flowInput) === null || r === void 0) && r.error) && d.markError && xe.error), disabled: m })) });
}, ke = ({ children: n }) => a("section", { className: Ft.content, children: n });
var sn = ee(751), Pt = {};
Pt.setAttributes = Qe(), Pt.insert = (n) => {
  window._hankoStyle = n;
}, Pt.domAPI = Ye(), Pt.insertStyleElement = Ge(), Je()(sn.A, Pt);
const Nt = sn.A && sn.A.locals ? sn.A.locals : void 0, no = ({ children: n, hidden: t }) => t ? null : a("section", { part: "divider", className: Nt.divider, children: [a("div", { part: "divider-line", className: Nt.line }), n ? a("div", { part: "divider-text", class: Nt.text, children: n }) : null, a("div", { part: "divider-line", className: Nt.line })] });
var cn = ee(217), Et = {};
Et.setAttributes = Qe(), Et.insert = (n) => {
  window._hankoStyle = n;
}, Et.domAPI = Ye(), Et.insertStyleElement = Ge(), Je()(cn.A, Et);
const $i = cn.A && cn.A.locals ? cn.A.locals : void 0, Se = ({ state: n, error: t, flowError: e }) => {
  var o, i;
  const { t: r } = (0, f.useContext)(J.TranslateContext), { uiState: s, setUIState: d } = (0, f.useContext)(Ue);
  return (0, f.useEffect)(() => {
    var u, c;
    if (((u = n == null ? void 0 : n.error) === null || u === void 0 ? void 0 : u.code) == "form_data_invalid_error") for (const l of Object.values(n == null ? void 0 : n.actions)) {
      let m = !1;
      for (const v of Object.values(l == null ? void 0 : l.inputs)) if (!((c = v.error) === null || c === void 0) && c.code) return d(Object.assign(Object.assign({}, s), { error: v.error })), void (m = !0);
      m || d(Object.assign(Object.assign({}, s), { error: n.error }));
    }
    else n != null && n.error && d(Object.assign(Object.assign({}, s), { error: n == null ? void 0 : n.error }));
  }, [n]), a("section", { part: "error", className: $i.errorBox, hidden: !(!((o = s.error) === null || o === void 0) && o.code) && !(e != null && e.code) && !t, children: [a("span", { children: a(Wt, { name: "exclamation", size: 15 }) }), a("span", { id: "errorMessage", part: "error-text", children: r(t ? `errors.${t.code}` : `flowErrors.${((i = s.error) === null || i === void 0 ? void 0 : i.code) || (e == null ? void 0 : e.code)}`) })] });
};
var ln = ee(547), It = {};
It.setAttributes = Qe(), It.insert = (n) => {
  window._hankoStyle = n;
}, It.domAPI = Ye(), It.insertStyleElement = Ge(), Je()(ln.A, It);
const vn = ln.A && ln.A.locals ? ln.A.locals : void 0, de = ({ children: n }) => a("h1", { part: "headline1", className: Q()(vn.headline, vn.grade1), children: n });
var dn = ee(579), Ot = {};
Ot.setAttributes = Qe(), Ot.insert = (n) => {
  window._hankoStyle = n;
}, Ot.domAPI = Ye(), Ot.insertStyleElement = Ge(), Je()(dn.A, Ot);
const Qt = dn.A && dn.A.locals ? dn.A.locals : void 0, Hn = (n) => {
  var { loadingSpinnerPosition: t, dangerous: e = !1, onClick: o, flowAction: i } = n, r = function(M, z) {
    var F = {};
    for (var V in M) Object.prototype.hasOwnProperty.call(M, V) && z.indexOf(V) < 0 && (F[V] = M[V]);
    if (M != null && typeof Object.getOwnPropertySymbols == "function") {
      var X = 0;
      for (V = Object.getOwnPropertySymbols(M); X < V.length; X++) z.indexOf(V[X]) < 0 && Object.prototype.propertyIsEnumerable.call(M, V[X]) && (F[V[X]] = M[V[X]]);
    }
    return F;
  }(n, ["loadingSpinnerPosition", "dangerous", "onClick", "flowAction"]);
  const { t: s } = (0, f.useContext)(J.TranslateContext), { uiState: d } = (0, f.useContext)(Ue), [u, c] = (0, f.useState)(), [l, m] = (0, f.useState)(!1), [v, g] = (0, f.useState)(!1);
  let k;
  o || (o = (M) => function(z, F, V, X) {
    return new (V || (V = Promise))(function(N, fe) {
      function _e(re) {
        try {
          le(X.next(re));
        } catch (ye) {
          fe(ye);
        }
      }
      function ue(re) {
        try {
          le(X.throw(re));
        } catch (ye) {
          fe(ye);
        }
      }
      function le(re) {
        var ye;
        re.done ? N(re.value) : (ye = re.value, ye instanceof V ? ye : new V(function(Ne) {
          Ne(ye);
        })).then(_e, ue);
      }
      le((X = X.apply(z, [])).next());
    });
  }(void 0, void 0, void 0, function* () {
    return M.preventDefault(), yield i == null ? void 0 : i.run();
  })), Oi(i, m, g);
  const x = (M) => {
    M.preventDefault(), c(!0);
  }, C = (M) => {
    M.preventDefault(), c(!1);
  }, D = (0, f.useMemo)(() => l || r.isLoading, [l, r]), W = (0, f.useMemo)(() => v || r.isSuccess, [v, r]), w = (0, f.useMemo)(() => i && !i.enabled || r.hidden, [i, r]), E = (0, f.useCallback)((M) => {
    M.preventDefault(), c(!1), o(M);
  }, [o]), I = (0, f.useCallback)(() => w ? null : a(b.Fragment, { children: [u ? a(b.Fragment, { children: [a(Hn, { onClick: E, children: s("labels.yes") }), " / ", a(Hn, { onClick: C, children: s("labels.no") }), " "] }) : null, a("button", Object.assign({}, r, { onClick: e ? x : o, disabled: u || r.disabled || d.isDisabled, part: "link", className: Q()(Qt.link, e ? Qt.danger : null), children: r.children }))] }), [w, d, u, e, o, E, r, s]);
  return a(b.Fragment, { children: a("span", { className: Q()(Qt.linkWrapper, t === "right" ? Qt.reverse : null), onMouseEnter: () => {
    k && window.clearTimeout(k);
  }, onMouseLeave: () => {
    k = window.setTimeout(() => {
      c(!1);
    }, 1e3);
  }, children: a(b.Fragment, u || !D && !W ? { children: I() } : { children: [a(to, { isLoading: D, isSuccess: W, secondary: r.secondary, fadeOut: !0 }), I()] }) }) });
}, G = Hn, Te = ({ children: n, hidden: t = !1 }) => t ? null : a("section", { className: Ft.footer, children: n }), oo = (n) => {
  var { label: t } = n, e = function(r, s) {
    var d = {};
    for (var u in r) Object.prototype.hasOwnProperty.call(r, u) && s.indexOf(u) < 0 && (d[u] = r[u]);
    if (r != null && typeof Object.getOwnPropertySymbols == "function") {
      var c = 0;
      for (u = Object.getOwnPropertySymbols(r); c < u.length; c++) s.indexOf(u[c]) < 0 && Object.prototype.propertyIsEnumerable.call(r, u[c]) && (d[u[c]] = r[u[c]]);
    }
    return d;
  }(n, ["label"]);
  const { uiState: o } = (0, f.useContext)(Ue), i = (0, f.useMemo)(() => o.isDisabled || e.disabled, [e, o]);
  return a("div", { className: xe.inputWrapper, children: a("label", { className: xe.checkboxWrapper, children: [a("input", Object.assign({ part: "input checkbox-input", type: "checkbox", "aria-label": t, className: xe.checkbox }, e)), a("span", { className: Q()(xe.label, i ? xe.disabled : null), children: t })] }) });
}, Sn = () => a("section", { className: Nt.spacer });
var un = ee(193), Tt = {};
Tt.setAttributes = Qe(), Tt.insert = (n) => {
  window._hankoStyle = n;
}, Tt.domAPI = Ye(), Tt.insertStyleElement = Ge(), Je()(un.A, Tt);
const Un = un.A && un.A.locals ? un.A.locals : void 0, K = ({ children: n, hidden: t, center: e }) => t ? null : a("p", { part: "paragraph", className: Q()(Un.paragraph, e && Un.center, e && Un.column), children: n });
var Gt = function(n, t, e, o) {
  return new (e || (e = Promise))(function(i, r) {
    function s(c) {
      try {
        u(o.next(c));
      } catch (l) {
        r(l);
      }
    }
    function d(c) {
      try {
        u(o.throw(c));
      } catch (l) {
        r(l);
      }
    }
    function u(c) {
      var l;
      c.done ? i(c.value) : (l = c.value, l instanceof e ? l : new e(function(m) {
        m(l);
      })).then(s, d);
    }
    u((o = o.apply(n, [])).next());
  });
};
const hr = (n) => {
  var t;
  const { t: e } = (0, f.useContext)(J.TranslateContext), { init: o, initialComponentName: i, uiState: r, setUIState: s, hidePasskeyButtonOnLogin: d, lastLogin: u } = (0, f.useContext)(Ue), [c, l] = (0, f.useState)(!1), [m, v] = (0, f.useState)(null), [g, k] = (0, f.useState)(null), { flowState: x } = Ee(n.state), C = ft.supported(), [D, W] = (0, f.useState)(void 0), [w, E] = (0, f.useState)(null), [I, M] = (0, f.useState)(!1), z = (N) => {
    if (N.preventDefault(), N.target instanceof HTMLInputElement) {
      const { value: fe } = N.target;
      k(fe), F(fe);
    }
  }, F = (N) => {
    const fe = () => s((ue) => Object.assign(Object.assign({}, ue), { email: N, username: null })), _e = () => s((ue) => Object.assign(Object.assign({}, ue), { email: null, username: N }));
    switch (m) {
      case "email":
        fe();
        break;
      case "username":
        _e();
        break;
      case "identifier":
        N.match(/^[^@]+@[^@]+\.[^@]+$/) ? fe() : _e();
    }
  }, V = (0, f.useMemo)(() => (!!x.actions.webauthn_generate_request_options.enabled || !!x.actions.thirdparty_oauth.enabled) && x.actions.continue_with_login_identifier.enabled, [x.actions]), X = x.actions.continue_with_login_identifier.inputs;
  return (0, f.useEffect)(() => {
    const N = x.actions.continue_with_login_identifier.inputs;
    N != null && N.email ? (v("email"), k(r.email)) : N != null && N.username ? (v("username"), k(r.username)) : (v("identifier"), k(r.email || r.username));
  }, [x, r.email, r.username]), a(b.Fragment, { children: [a(ke, { children: [a(de, { children: e("headlines.signIn") }), a(Se, { state: x, error: D }), X ? a(b.Fragment, { children: [a(te, { flowAction: x.actions.continue_with_login_identifier, onSubmit: (N) => Gt(void 0, void 0, void 0, function* () {
    return N.preventDefault(), F(g), x.actions.continue_with_login_identifier.run({ [m]: g });
  }), maxWidth: !0, children: [X.email ? a(Le, { type: "email", autoComplete: "username webauthn", autoCorrect: "off", flowInput: X.email, onInput: z, value: g, placeholder: e("labels.email"), pattern: "^[^@]+@[^@]+\\.[^@]+$" }) : X.username ? a(Le, { type: "text", autoComplete: "username webauthn", autoCorrect: "off", flowInput: X.username, onInput: z, value: g, placeholder: e("labels.username") }) : a(Le, { type: "text", autoComplete: "username webauthn", autoCorrect: "off", flowInput: X.identifier, onInput: z, value: g, placeholder: e("labels.emailOrUsername") }), a(ne, { children: e("labels.continue") })] }), a(no, { hidden: !V, children: e("labels.or") })] }) : null, x.actions.thirdparty_oauth.enabled ? (t = x.actions.thirdparty_oauth.inputs.provider.allowed_values) === null || t === void 0 ? void 0 : t.map((N) => a(te, { flowAction: x.actions.thirdparty_oauth, onSubmit: (fe) => ((_e, ue) => Gt(void 0, void 0, void 0, function* () {
    _e.preventDefault(), E(ue);
    const le = wn();
    kn(le);
    try {
      const re = yield x.actions.thirdparty_oauth.run({ provider: ue, redirect_to: window.location.toString(), code_verifier: le });
      return re.error && (nt(), E(null)), re;
    } catch (re) {
      throw nt(), E(null), re;
    }
  }))(fe, N.value), children: a(ne, { isLoading: N.value == w, secondary: !0, icon: N.value.startsWith("custom_") ? "customProvider" : N.value, showLastUsed: (u == null ? void 0 : u.login_method) == "third_party" && (u == null ? void 0 : u.third_party_provider) == N.value, children: e("labels.signInWith", { provider: N.name }) }) }, N.value)) : null, x.actions.webauthn_generate_request_options.enabled && !d ? a(te, { flowAction: x.actions.webauthn_generate_request_options, children: a(ne, { secondary: !0, title: C ? null : e("labels.webauthnUnsupported"), disabled: !C, children: e("labels.signInPasskey") }) }) : null, x.actions.remember_me.enabled && a(b.Fragment, { children: [a(Sn, {}), a(oo, { required: !1, type: "checkbox", label: e("labels.staySignedIn"), checked: I, onChange: (N) => Gt(void 0, void 0, void 0, function* () {
    return M((fe) => !fe), x.actions.remember_me.run({ remember_me: !I });
  }) })] })] }), a(Te, { hidden: i !== "auth", children: a(K, { center: !0, children: [a("span", { children: e("labels.dontHaveAnAccount") }), a(G, { onClick: (N) => Gt(void 0, void 0, void 0, function* () {
    N.preventDefault(), l(!0), o("registration");
  }), loadingSpinnerPosition: "left", isLoading: c, children: e("labels.signUp") })] }) })] });
}, pr = (n) => {
  var { index: t, focus: e, digit: o = "" } = n, i = function(c, l) {
    var m = {};
    for (var v in c) Object.prototype.hasOwnProperty.call(c, v) && l.indexOf(v) < 0 && (m[v] = c[v]);
    if (c != null && typeof Object.getOwnPropertySymbols == "function") {
      var g = 0;
      for (v = Object.getOwnPropertySymbols(c); g < v.length; g++) l.indexOf(v[g]) < 0 && Object.prototype.propertyIsEnumerable.call(c, v[g]) && (m[v[g]] = c[v[g]]);
    }
    return m;
  }(n, ["index", "focus", "digit"]);
  const r = (0, f.useRef)(null), { uiState: s } = (0, f.useContext)(Ue), d = () => {
    const { current: c } = r;
    c && (c.focus(), c.select());
  }, u = (0, f.useMemo)(() => s.isDisabled || i.disabled, [i, s]);
  return (0, f.useEffect)(() => {
    t === 0 && d();
  }, [t, i.disabled]), (0, f.useMemo)(() => {
    e && d();
  }, [e]), a("div", { className: xe.passcodeDigitWrapper, children: a("input", Object.assign({}, i, { part: "input passcode-input", "aria-label": `${i.name}-digit-${t + 1}`, name: i.name + t.toString(10), type: "text", inputMode: "numeric", maxLength: 1, ref: r, value: o.charAt(0), required: !0, className: xe.input, disabled: u })) });
}, io = ({ passcodeDigits: n = [], numberOfInputs: t = 6, onInput: e, disabled: o = !1 }) => {
  const [i, r] = (0, f.useState)(0), s = () => n.slice(), d = () => {
    i < t - 1 && r(i + 1);
  }, u = () => {
    i > 0 && r(i - 1);
  }, c = (g) => {
    const k = s();
    k[i] = g.charAt(0), e(k);
  }, l = (g) => {
    if (g.preventDefault(), o) return;
    const k = g.clipboardData.getData("text/plain").slice(0, t - i).split(""), x = s();
    let C = i;
    for (let D = 0; D < t; ++D) D >= i && k.length > 0 && (x[D] = k.shift(), C++);
    r(C), e(x);
  }, m = (g) => {
    g.key === "Backspace" ? (g.preventDefault(), c(""), u()) : g.key === "Delete" ? (g.preventDefault(), c("")) : g.key === "ArrowLeft" ? (g.preventDefault(), u()) : g.key === "ArrowRight" ? (g.preventDefault(), d()) : g.key !== " " && g.key !== "Spacebar" && g.key !== "Space" || g.preventDefault();
  }, v = (g) => {
    g.target instanceof HTMLInputElement && c(g.target.value), d();
  };
  return (0, f.useEffect)(() => {
    n.length === 0 && r(0);
  }, [n]), a("div", { className: xe.passcodeInputWrapper, children: Array.from(Array(t)).map((g, k) => a(pr, { name: "passcode", index: k, focus: i === k, digit: n[k], onKeyDown: m, onInput: v, onPaste: l, onFocus: () => ((x) => {
    r(x);
  })(k), disabled: o }, k)) });
};
var Uo = function(n, t, e, o) {
  return new (e || (e = Promise))(function(i, r) {
    function s(c) {
      try {
        u(o.next(c));
      } catch (l) {
        r(l);
      }
    }
    function d(c) {
      try {
        u(o.throw(c));
      } catch (l) {
        r(l);
      }
    }
    function u(c) {
      var l;
      c.done ? i(c.value) : (l = c.value, l instanceof e ? l : new e(function(m) {
        m(l);
      })).then(s, d);
    }
    u((o = o.apply(n, [])).next());
  });
};
const mr = (n) => {
  const { t } = (0, f.useContext)(J.TranslateContext), { flowState: e } = Ee(n.state), { uiState: o, setUIState: i } = (0, f.useContext)(Ue), [r, s] = (0, f.useState)(), [d, u] = (0, f.useState)(e.payload.resend_after), [c, l] = (0, f.useState)([]), m = (0, f.useMemo)(() => {
    var g;
    return ((g = e.error) === null || g === void 0 ? void 0 : g.code) === "passcode_max_attempts_reached";
  }, [e]), v = (0, f.useCallback)((g) => Uo(void 0, void 0, void 0, function* () {
    return yield e.actions.verify_passcode.run({ code: g });
  }), [e]);
  return (0, f.useEffect)(() => {
    const g = r > 0 && setInterval(() => s(r - 1), 1e3);
    return () => clearInterval(g);
  }, [r]), (0, f.useEffect)(() => {
    const g = d > 0 && setInterval(() => {
      u(d - 1);
    }, 1e3);
    return () => clearInterval(g);
  }, [d]), (0, f.useEffect)(() => {
    var g;
    d == 0 && ((g = e.error) === null || g === void 0 ? void 0 : g.code) == "rate_limit_exceeded" && i((k) => Object.assign(Object.assign({}, k), { error: null }));
  }, [d]), (0, f.useEffect)(() => {
    l([]), e.payload.resend_after >= 0 && u(e.payload.resend_after);
  }, [e]), a(b.Fragment, { children: [a(ke, { children: [a(de, { children: t("headlines.loginPasscode") }), a(Se, { state: e }), a(K, { children: o.email ? t("texts.enterPasscode") : t("texts.enterPasscodeNoEmail") }), a(K, { hidden: !o.email, children: a("b", { children: o.email }) }), a(te, { flowAction: e.actions.verify_passcode, onSubmit: (g) => Uo(void 0, void 0, void 0, function* () {
    return g.preventDefault(), v(c.join(""));
  }), children: [a(io, { onInput: (g) => {
    if (l(g), g.filter((k) => k !== "").length === 6) return v(g.join(""));
  }, passcodeDigits: c, numberOfInputs: 6, disabled: r <= 0 || m }), a(ne, { disabled: r <= 0 || m, children: t("labels.continue") })] })] }), a(Te, { children: [a(G, { flowAction: e.actions.back, loadingSpinnerPosition: "right", children: t("labels.back") }), a(G, { disabled: d > 0, flowAction: e.actions.resend_passcode, loadingSpinnerPosition: "left", children: d > 0 ? t("labels.passcodeResendAfter", { passcodeResendAfter: d }) : t("labels.sendNewPasscode") })] })] });
}, fr = (n) => {
  const { t } = (0, f.useContext)(J.TranslateContext), { flowState: e } = Ee(n.state);
  return a(b.Fragment, { children: [a(ke, { children: [a(de, { children: t("headlines.registerAuthenticator") }), a(Se, { state: e }), a(K, { children: t("texts.setupPasskey") }), a(te, { flowAction: e.actions.webauthn_generate_creation_options, children: a(ne, { autofocus: !0, icon: "passkey", children: t("labels.registerAuthenticator") }) })] }), a(Te, { hidden: !e.actions.skip.enabled && !e.actions.back.enabled, children: [a(G, { loadingSpinnerPosition: "right", flowAction: e.actions.back, children: t("labels.back") }), a(G, { loadingSpinnerPosition: "left", flowAction: e.actions.skip, children: t("labels.skip") })] })] });
};
var Lo = function(n, t, e, o) {
  return new (e || (e = Promise))(function(i, r) {
    function s(c) {
      try {
        u(o.next(c));
      } catch (l) {
        r(l);
      }
    }
    function d(c) {
      try {
        u(o.throw(c));
      } catch (l) {
        r(l);
      }
    }
    function u(c) {
      var l;
      c.done ? i(c.value) : (l = c.value, l instanceof e ? l : new e(function(m) {
        m(l);
      })).then(s, d);
    }
    u((o = o.apply(n, [])).next());
  });
};
const gr = (n) => {
  const { t } = (0, f.useContext)(J.TranslateContext), { flowState: e } = Ee(n.state), [o, i] = (0, f.useState)(), [r, s] = (0, f.useState)(), d = (0, f.useMemo)(() => a(G, { flowAction: e.actions.continue_to_passcode_confirmation_recovery, loadingSpinnerPosition: "left", children: t("labels.forgotYourPassword") }), [e, t]), u = (0, f.useMemo)(() => a(G, { flowAction: e.actions.continue_to_login_method_chooser, loadingSpinnerPosition: "left", children: "Choose another method" }), [e]);
  return (0, f.useEffect)(() => {
    const c = r > 0 && setInterval(() => s(r - 1), 1e3);
    return () => clearInterval(c);
  }, [r]), a(b.Fragment, { children: [a(ke, { children: [a(de, { children: t("headlines.loginPassword") }), a(Se, { state: e }), a(te, { flowAction: e.actions.password_login, onSubmit: (c) => Lo(void 0, void 0, void 0, function* () {
    return c.preventDefault(), e.actions.password_login.run({ password: o });
  }), children: [a(Le, { type: "password", flowInput: e.actions.password_login.inputs.password, autocomplete: "current-password", placeholder: t("labels.password"), onInput: (c) => Lo(void 0, void 0, void 0, function* () {
    c.target instanceof HTMLInputElement && i(c.target.value);
  }), autofocus: !0 }), a(ne, { disabled: r > 0, children: r > 0 ? t("labels.passwordRetryAfter", { passwordRetryAfter: r }) : t("labels.signIn") })] }), e.actions.continue_to_login_method_chooser.enabled ? d : null] }), a(Te, { children: [a(G, { flowAction: e.actions.back, loadingSpinnerPosition: "right", children: t("labels.back") }), e.actions.continue_to_login_method_chooser.enabled ? u : d] })] });
};
var No = function(n, t, e, o) {
  return new (e || (e = Promise))(function(i, r) {
    function s(c) {
      try {
        u(o.next(c));
      } catch (l) {
        r(l);
      }
    }
    function d(c) {
      try {
        u(o.throw(c));
      } catch (l) {
        r(l);
      }
    }
    function u(c) {
      var l;
      c.done ? i(c.value) : (l = c.value, l instanceof e ? l : new e(function(m) {
        m(l);
      })).then(s, d);
    }
    u((o = o.apply(n, [])).next());
  });
};
const vr = (n) => {
  const { t } = (0, f.useContext)(J.TranslateContext), { flowState: e } = Ee(n.state), [o, i] = (0, f.useState)();
  return a(ke, { children: [a(de, { children: t("headlines.registerPassword") }), a(Se, { state: e }), a(K, { children: t("texts.passwordFormatHint", { minLength: e.actions.password_recovery.inputs.new_password.min_length, maxLength: 72 }) }), a(te, { flowAction: e.actions.password_recovery, onSubmit: (r) => No(void 0, void 0, void 0, function* () {
    return r.preventDefault(), e.actions.password_recovery.run({ new_password: o });
  }), children: [a(Le, { type: "password", autocomplete: "new-password", flowInput: e.actions.password_recovery.inputs.new_password, placeholder: t("labels.newPassword"), onInput: (r) => No(void 0, void 0, void 0, function* () {
    r.target instanceof HTMLInputElement && i(r.target.value);
  }), autofocus: !0 }), a(ne, { children: t("labels.continue") })] })] });
}, _r = (n) => {
  const { t } = (0, f.useContext)(J.TranslateContext), { flowState: e } = Ee(n.state);
  return a(b.Fragment, { children: [a(ke, { children: [a(de, { children: t("headlines.selectLoginMethod") }), a(Se, { flowError: e == null ? void 0 : e.error }), a(K, { children: t("texts.howDoYouWantToLogin") }), a(te, { flowAction: e.actions.continue_to_passcode_confirmation, children: a(ne, { secondary: !0, icon: "mail", children: t("labels.passcode") }) }), a(te, { flowAction: e.actions.continue_to_password_login, children: a(ne, { secondary: !0, icon: "password", children: t("labels.password") }) }), a(te, { flowAction: e.actions.webauthn_generate_request_options, children: a(ne, { secondary: !0, icon: "passkey", children: t("labels.passkey") }) })] }), a(Te, { children: a(G, { flowAction: e.actions.back, loadingSpinnerPosition: "right", children: t("labels.back") }) })] });
};
var Xt = function(n, t, e, o) {
  return new (e || (e = Promise))(function(i, r) {
    function s(c) {
      try {
        u(o.next(c));
      } catch (l) {
        r(l);
      }
    }
    function d(c) {
      try {
        u(o.throw(c));
      } catch (l) {
        r(l);
      }
    }
    function u(c) {
      var l;
      c.done ? i(c.value) : (l = c.value, l instanceof e ? l : new e(function(m) {
        m(l);
      })).then(s, d);
    }
    u((o = o.apply(n, [])).next());
  });
};
const yr = (n) => {
  var t;
  const { t: e } = (0, f.useContext)(J.TranslateContext), { init: o, uiState: i, setUIState: r, initialComponentName: s } = (0, f.useContext)(Ue), { flowState: d } = Ee(n.state), u = d.actions.register_login_identifier.inputs, c = !(!(u != null && u.email) || !(u != null && u.username)), [l, m] = (0, f.useState)(void 0), [v, g] = (0, f.useState)(null), [k, x] = (0, f.useState)(!1), [C, D] = (0, f.useState)(!1), W = (0, f.useMemo)(() => !!d.actions.thirdparty_oauth.enabled && d.actions.register_login_identifier.enabled, [d.actions]);
  return a(b.Fragment, { children: [a(ke, { children: [a(de, { children: e("headlines.signUp") }), a(Se, { state: d, error: l }), u ? a(b.Fragment, { children: [a(te, { flowAction: d.actions.register_login_identifier, onSubmit: (w) => Xt(void 0, void 0, void 0, function* () {
    return w.preventDefault(), yield d.actions.register_login_identifier.run({ email: i.email, username: i.username });
  }), maxWidth: !0, children: [u.username ? a(Le, { markOptional: c, markError: c, type: "text", autoComplete: "username", autoCorrect: "off", flowInput: u.username, onInput: (w) => {
    if (w.preventDefault(), w.target instanceof HTMLInputElement) {
      const { value: E } = w.target;
      r((I) => Object.assign(Object.assign({}, I), { username: E }));
    }
  }, value: i.username, placeholder: e("labels.username") }) : null, u.email ? a(Le, { markOptional: c, markError: c, type: "email", autoComplete: "email", autoCorrect: "off", flowInput: u.email, onInput: (w) => {
    if (w.preventDefault(), w.target instanceof HTMLInputElement) {
      const { value: E } = w.target;
      r((I) => Object.assign(Object.assign({}, I), { email: E }));
    }
  }, value: i.email, placeholder: e("labels.email"), pattern: "^.*[^0-9]+$" }) : null, a(ne, { autofocus: !0, children: e("labels.continue") })] }), a(no, { hidden: !W, children: e("labels.or") })] }) : null, d.actions.thirdparty_oauth.enabled ? (t = d.actions.thirdparty_oauth.inputs.provider.allowed_values) === null || t === void 0 ? void 0 : t.map((w) => a(te, { flowAction: d.actions.thirdparty_oauth, onSubmit: (E) => ((I, M) => Xt(void 0, void 0, void 0, function* () {
    I.preventDefault(), g(M);
    const z = wn();
    kn(z);
    try {
      const F = yield d.actions.thirdparty_oauth.run({ provider: M, redirect_to: window.location.toString(), code_verifier: z }, { dispatchAfterStateChangeEvent: !1 });
      F.error && (nt(), g(null)), F.dispatchAfterStateChangeEvent();
    } catch (F) {
      throw nt(), g(null), F;
    }
  }))(E, w.value), children: a(ne, { isLoading: w.value == v, secondary: !0, icon: w.value.startsWith("custom_") ? "customProvider" : w.value, children: e("labels.signInWith", { provider: w.name }) }) }, w.value)) : null, d.actions.remember_me.enabled && a(b.Fragment, { children: [a(Sn, {}), a(oo, { required: !1, type: "checkbox", label: e("labels.staySignedIn"), checked: k, onChange: (w) => Xt(void 0, void 0, void 0, function* () {
    w.preventDefault();
    const E = yield d.actions.remember_me.run({ remember_me: !k }, { dispatchAfterStateChangeEvent: !1 });
    x((I) => !I), E.dispatchAfterStateChangeEvent();
  }) })] })] }), a(Te, { hidden: s !== "auth", children: a(K, { center: !0, children: [a("span", { children: e("labels.alreadyHaveAnAccount") }), a(G, { onClick: (w) => Xt(void 0, void 0, void 0, function* () {
    w.preventDefault(), D(!0), o("login");
  }), loadingSpinnerPosition: "left", isLoading: C, children: e("labels.signIn") })] }) })] });
};
var Mo = function(n, t, e, o) {
  return new (e || (e = Promise))(function(i, r) {
    function s(c) {
      try {
        u(o.next(c));
      } catch (l) {
        r(l);
      }
    }
    function d(c) {
      try {
        u(o.throw(c));
      } catch (l) {
        r(l);
      }
    }
    function u(c) {
      var l;
      c.done ? i(c.value) : (l = c.value, l instanceof e ? l : new e(function(m) {
        m(l);
      })).then(s, d);
    }
    u((o = o.apply(n, [])).next());
  });
};
const br = (n) => {
  const { t } = (0, f.useContext)(J.TranslateContext), { flowState: e } = Ee(n.state), [o, i] = (0, f.useState)();
  return a(b.Fragment, { children: [a(ke, { children: [a(de, { children: t("headlines.registerPassword") }), a(Se, { state: e }), a(K, { children: t("texts.passwordFormatHint", { minLength: e.actions.register_password.inputs.new_password.min_length, maxLength: 72 }) }), a(te, { flowAction: e.actions.register_password, onSubmit: (r) => Mo(void 0, void 0, void 0, function* () {
    return r.preventDefault(), e.actions.register_password.run({ new_password: o });
  }), children: [a(Le, { type: "password", autocomplete: "new-password", flowInput: e.actions.register_password.inputs.new_password, placeholder: t("labels.newPassword"), onInput: (r) => Mo(void 0, void 0, void 0, function* () {
    r.target instanceof HTMLInputElement && i(r.target.value);
  }), autofocus: !0 }), a(ne, { children: t("labels.continue") })] })] }), a(Te, { hidden: !e.actions.back.enabled && !e.actions.skip.enabled, children: [a(G, { loadingSpinnerPosition: "right", flowAction: e.actions.back, children: t("labels.back") }), a(G, { loadingSpinnerPosition: "left", flowAction: e.actions.skip, children: t("labels.skip") })] })] });
};
var hn = ee(597), $t = {};
$t.setAttributes = Qe(), $t.insert = (n) => {
  window._hankoStyle = n;
}, $t.domAPI = Ye(), $t.insertStyleElement = Ge(), Je()(hn.A, $t);
const Fe = hn.A && hn.A.locals ? hn.A.locals : void 0, Kt = function({ name: n, columnSelector: t, contentSelector: e, data: o = [], checkedItemID: i, setCheckedItemID: r, dropdown: s = !1 }) {
  const d = (0, f.useCallback)((l) => `${n}-${l}`, [n]), u = (0, f.useCallback)((l) => d(l) === i, [i, d]), c = (l) => {
    if (!(l.target instanceof HTMLInputElement)) return;
    const m = parseInt(l.target.value, 10), v = d(m);
    r(v === i ? null : v);
  };
  return a("div", { className: Fe.accordion, children: o.map((l, m) => a("div", { className: Fe.accordionItem, children: [a("input", { type: "radio", className: Fe.accordionInput, id: `${n}-${m}`, name: n, onClick: c, value: m, checked: u(m) }), a("label", { className: Q()(Fe.label, s && Fe.dropdown), for: `${n}-${m}`, children: a("span", { className: Fe.labelText, children: t(l, m) }) }), a("div", { className: Q()(Fe.accordionContent, s && Fe.dropdownContent), children: e(l, m) })] }, m)) });
}, De = ({ children: n }) => a("h2", { part: "headline2", className: Q()(vn.headline, vn.grade2), children: n });
var Ln = function(n, t, e, o) {
  return new (e || (e = Promise))(function(i, r) {
    function s(c) {
      try {
        u(o.next(c));
      } catch (l) {
        r(l);
      }
    }
    function d(c) {
      try {
        u(o.throw(c));
      } catch (l) {
        r(l);
      }
    }
    function u(c) {
      var l;
      c.done ? i(c.value) : (l = c.value, l instanceof e ? l : new e(function(m) {
        m(l);
      })).then(s, d);
    }
    u((o = o.apply(n, [])).next());
  });
};
const wr = ({ checkedItemID: n, setCheckedItemID: t, flowState: e, onState: o }) => {
  const { t: i } = (0, f.useContext)(J.TranslateContext), r = (0, f.useMemo)(() => !1, []);
  return a(Kt, { name: "email-edit-dropdown", columnSelector: (s) => {
    const d = a("span", { className: Fe.description, children: s.is_verified ? s.is_primary ? a(b.Fragment, { children: [" -", " ", i("labels.primaryEmail")] }) : null : a(b.Fragment, { children: [" -", " ", i("labels.unverifiedEmail")] }) });
    return s.is_primary ? a(b.Fragment, { children: [a("b", { children: s.address }), d] }) : a(b.Fragment, { children: [s.address, d] });
  }, data: e.payload.user.emails, contentSelector: (s) => {
    var d, u;
    return a(b.Fragment, { children: [s.is_primary ? a(b.Fragment, { children: a(K, { children: [a(De, { children: i("headlines.isPrimaryEmail") }), i("texts.isPrimaryEmail")] }) }) : a(b.Fragment, { children: a(K, { children: [a(De, { children: i("headlines.setPrimaryEmail") }), i("texts.setPrimaryEmail"), a("br", {}), a(G, { flowAction: e.actions.email_set_primary, onClick: (c) => ((l, m) => Ln(void 0, void 0, void 0, function* () {
      l.preventDefault();
      const v = yield e.actions.email_set_primary.run({ email_id: m }, { dispatchAfterStateChangeEvent: !1 });
      return o(v);
    }))(c, s.id), loadingSpinnerPosition: "right", children: i("labels.setAsPrimaryEmail") })] }) }), s.is_verified ? a(b.Fragment, { children: a(K, { children: [a(De, { children: i("headlines.emailVerified") }), i("texts.emailVerified")] }) }) : a(b.Fragment, { children: a(K, { children: [a(De, { children: i("headlines.emailUnverified") }), i("texts.emailUnverified"), a("br", {}), a(G, { flowAction: e.actions.email_verify, onClick: (c) => ((l, m) => Ln(void 0, void 0, void 0, function* () {
      l.preventDefault();
      const v = yield e.actions.email_verify.run({ email_id: m }, { dispatchAfterStateChangeEvent: !1 });
      return o(v);
    }))(c, s.id), loadingSpinnerPosition: "right", children: i("labels.verify") })] }) }), !((d = e.actions.email_delete.inputs.email_id.allowed_values) === null || d === void 0) && d.map((c) => c.value).includes(s.id) ? a(b.Fragment, { children: a(K, { children: [a(De, { children: i("headlines.emailDelete") }), i("texts.emailDelete"), a("br", {}), a(G, { dangerous: !0, flowAction: e.actions.email_delete, onClick: (c) => ((l, m) => Ln(void 0, void 0, void 0, function* () {
      l.preventDefault();
      const v = yield e.actions.email_delete.run({ email_id: m }, { dispatchAfterStateChangeEvent: !1 });
      return o(v);
    }))(c, s.id), disabled: r, loadingSpinnerPosition: "right", children: i("labels.delete") })] }) }) : null, ((u = s.identities) === null || u === void 0 ? void 0 : u.length) > 0 ? a(b.Fragment, { children: a(K, { children: [a(De, { children: i("headlines.connectedAccounts") }), s.identities.map((c) => c.provider).join(", ")] }) }) : null] });
  }, checkedItemID: n, setCheckedItemID: t });
}, kr = ({ onCredentialNameSubmit: n, oldName: t, onBack: e, credential: o, credentialType: i, flowState: r }) => {
  const { t: s } = (0, f.useContext)(J.TranslateContext), [d, u] = (0, f.useState)(t);
  return a(b.Fragment, { children: [a(ke, { children: [a(de, { children: s(i === "security-key" ? "headlines.renameSecurityKey" : "headlines.renamePasskey") }), a(Se, { flowError: null }), a(K, { children: s(i === "security-key" ? "texts.renameSecurityKey" : "texts.renamePasskey") }), a(te, { flowAction: r.actions.webauthn_credential_rename, onSubmit: (c) => n(c, o.id, d), children: [a(Le, { type: "text", name: i, value: d, minLength: 3, maxLength: 32, required: !0, placeholder: s(i === "security-key" ? "labels.newSecurityKeyName" : "labels.newPasskeyName"), onInput: (c) => function(l, m, v, g) {
    return new (v || (v = Promise))(function(k, x) {
      function C(w) {
        try {
          W(g.next(w));
        } catch (E) {
          x(E);
        }
      }
      function D(w) {
        try {
          W(g.throw(w));
        } catch (E) {
          x(E);
        }
      }
      function W(w) {
        var E;
        w.done ? k(w.value) : (E = w.value, E instanceof v ? E : new v(function(I) {
          I(E);
        })).then(C, D);
      }
      W((g = g.apply(l, [])).next());
    });
  }(void 0, void 0, void 0, function* () {
    c.target instanceof HTMLInputElement && u(c.target.value);
  }), autofocus: !0 }), a(ne, { children: s("labels.save") })] })] }), a(Te, { children: a(G, { onClick: e, loadingSpinnerPosition: "right", children: s("labels.back") }) })] });
}, Ro = ({ credentials: n = [], checkedItemID: t, setCheckedItemID: e, onBack: o, onCredentialNameSubmit: i, allowCredentialDeletion: r, credentialType: s, onCredentialDelete: d, flowState: u }) => {
  const { t: c } = (0, f.useContext)(J.TranslateContext), { setPage: l } = (0, f.useContext)(Ue), m = (g) => {
    if (g.name) return g.name;
    const k = g.public_key.replace(/[\W_]/g, "");
    return `${s === "security-key" ? "SecurityKey" : "Passkey"}-${k.substring(k.length - 7, k.length)}`;
  }, v = (g) => new Date(g).toLocaleString();
  return a(Kt, { name: s === "security-key" ? "security-key-edit-dropdown" : "passkey-edit-dropdown", columnSelector: (g) => m(g), data: n, contentSelector: (g) => a(b.Fragment, { children: [a(K, { children: [a(De, { children: c(s === "security-key" ? "headlines.renameSecurityKey" : "headlines.renamePasskey") }), c(s === "security-key" ? "texts.renameSecurityKey" : "texts.renamePasskey"), a("br", {}), a(G, { onClick: (k) => ((x, C, D) => {
    x.preventDefault(), l(a(kr, { oldName: m(C), credential: C, credentialType: D, onBack: o, onCredentialNameSubmit: i, flowState: u }));
  })(k, g, s), loadingSpinnerPosition: "right", children: c("labels.rename") })] }), a(K, { hidden: !r, children: [a(De, { children: c(s === "security-key" ? "headlines.deleteSecurityKey" : "headlines.deletePasskey") }), c(s === "security-key" ? "texts.deleteSecurityKey" : "texts.deletePasskey"), a("br", {}), a(G, { dangerous: !0, flowAction: u.actions.webauthn_credential_delete, onClick: (k) => d(k, g.id), loadingSpinnerPosition: "right", children: c("labels.delete") })] }), a(K, { children: [a(De, { children: c("headlines.lastUsedAt") }), g.last_used_at ? v(g.last_used_at) : "-"] }), a(K, { children: [a(De, { children: c("headlines.createdAt") }), v(g.created_at)] })] }), checkedItemID: t, setCheckedItemID: e });
}, yt = ({ name: n, title: t, children: e, checkedItemID: o, setCheckedItemID: i }) => a(Kt, { dropdown: !0, name: n, columnSelector: () => t, contentSelector: () => a(b.Fragment, { children: e }), setCheckedItemID: i, checkedItemID: o, data: [{}] }), xn = ({ flowError: n }) => {
  const { t } = (0, f.useContext)(J.TranslateContext);
  return a(b.Fragment, { children: n ? a("div", { className: $i.errorMessage, children: t(`flowErrors.${n == null ? void 0 : n.code}`) }) : null });
}, Sr = ({ checkedItemID: n, setCheckedItemID: t, flowState: e, onState: o }) => {
  var i;
  const { t: r } = (0, f.useContext)(J.TranslateContext), { setUIState: s } = (0, f.useContext)(Ue), [d, u] = (0, f.useState)();
  return a(yt, { name: "email-create-dropdown", title: r("labels.addEmail"), checkedItemID: n, setCheckedItemID: t, children: [a(xn, { flowError: (i = e.actions.email_create.inputs.email) === null || i === void 0 ? void 0 : i.error }), a(te, { flowAction: e.actions.email_create, onSubmit: (c) => ((l, m) => function(v, g, k, x) {
    return new (k || (k = Promise))(function(C, D) {
      function W(I) {
        try {
          E(x.next(I));
        } catch (M) {
          D(M);
        }
      }
      function w(I) {
        try {
          E(x.throw(I));
        } catch (M) {
          D(M);
        }
      }
      function E(I) {
        var M;
        I.done ? C(I.value) : (M = I.value, M instanceof k ? M : new k(function(z) {
          z(M);
        })).then(W, w);
      }
      E((x = x.apply(v, [])).next());
    });
  }(void 0, void 0, void 0, function* () {
    l.preventDefault(), s((g) => Object.assign(Object.assign({}, g), { email: m }));
    const v = yield e.actions.email_create.run({ email: m }, { dispatchAfterStateChangeEvent: !1 });
    return o(v);
  }))(c, d).then(() => u("")), children: [a(Le, { markError: !0, type: "email", placeholder: r("labels.newEmailAddress"), onInput: (c) => {
    c.preventDefault(), c.target instanceof HTMLInputElement && u(c.target.value);
  }, value: d, flowInput: e.actions.email_create.inputs.email }), a(ne, { children: r("labels.save") })] })] });
};
var zo = function(n, t, e, o) {
  return new (e || (e = Promise))(function(i, r) {
    function s(c) {
      try {
        u(o.next(c));
      } catch (l) {
        r(l);
      }
    }
    function d(c) {
      try {
        u(o.throw(c));
      } catch (l) {
        r(l);
      }
    }
    function u(c) {
      var l;
      c.done ? i(c.value) : (l = c.value, l instanceof e ? l : new e(function(m) {
        m(l);
      })).then(s, d);
    }
    u((o = o.apply(n, [])).next());
  });
};
const xr = ({ checkedItemID: n, setCheckedItemID: t, onState: e, flowState: o }) => {
  var i, r, s;
  const { t: d } = (0, f.useContext)(J.TranslateContext), [u, c] = (0, f.useState)(""), l = o.actions.password_create.enabled ? o.actions.password_create : o.actions.password_update;
  return a(yt, { name: "password-edit-dropdown", title: d(o.actions.password_create.enabled ? "labels.setPassword" : "labels.changePassword"), checkedItemID: n, setCheckedItemID: t, children: [a(K, { children: d("texts.passwordFormatHint", { minLength: (i = l.inputs.password.min_length) === null || i === void 0 ? void 0 : i.toString(10), maxLength: (r = l.inputs.password.max_length) === null || r === void 0 ? void 0 : r.toString(10) }) }), a(xn, { flowError: (s = o.actions.password_create.inputs.password) === null || s === void 0 ? void 0 : s.error }), a(te, { flowAction: l, onSubmit: (m) => ((v, g) => zo(void 0, void 0, void 0, function* () {
    v.preventDefault();
    const k = yield l.run({ password: g }, { dispatchAfterStateChangeEvent: !1 });
    return e(k);
  }))(m, u).then(() => c("")), children: [a(Le, { markError: !0, autoComplete: "new-password", placeholder: d("labels.newPassword"), type: "password", onInput: (m) => {
    m.preventDefault(), m.target instanceof HTMLInputElement && c(m.target.value);
  }, value: u, flowInput: l.inputs.password }), a(ne, { children: d("labels.save") })] }), a(G, { dangerous: !0, flowAction: o.actions.password_delete, onClick: (m) => ((v) => zo(void 0, void 0, void 0, function* () {
    v.preventDefault();
    const g = yield o.actions.password_delete.run(null, { dispatchAfterStateChangeEvent: !1 });
    return e(g);
  }))(m).then(() => c("")), loadingSpinnerPosition: "right", children: d("labels.delete") })] });
}, Ho = ({ checkedItemID: n, setCheckedItemID: t, credentialType: e, flowState: o, onState: i }) => {
  const { t: r } = (0, f.useContext)(J.TranslateContext), s = ft.supported(), d = e == "passkey" ? o.actions.webauthn_credential_create : o.actions.security_key_create;
  return a(yt, { name: e === "security-key" ? "security-key-create-dropdown" : "passkey-create-dropdown", title: r(e === "security-key" ? "labels.createSecurityKey" : "labels.createPasskey"), checkedItemID: n, setCheckedItemID: t, children: [a(K, { children: r(e === "security-key" ? "texts.securityKeySetUp" : "texts.setupPasskey") }), a(te, { onSubmit: (u) => function(c, l, m, v) {
    return new (m || (m = Promise))(function(g, k) {
      function x(W) {
        try {
          D(v.next(W));
        } catch (w) {
          k(w);
        }
      }
      function C(W) {
        try {
          D(v.throw(W));
        } catch (w) {
          k(w);
        }
      }
      function D(W) {
        var w;
        W.done ? g(W.value) : (w = W.value, w instanceof m ? w : new m(function(E) {
          E(w);
        })).then(x, C);
      }
      D((v = v.apply(c, [])).next());
    });
  }(void 0, void 0, void 0, function* () {
    u.preventDefault();
    const c = yield d.run(null, { dispatchAfterStateChangeEvent: !1 });
    return i(c);
  }), flowAction: d, children: a(ne, { title: s ? null : r("labels.webauthnUnsupported"), children: r(e === "security-key" ? "labels.createSecurityKey" : "labels.createPasskey") }) })] });
};
var qo = function(n, t, e, o) {
  return new (e || (e = Promise))(function(i, r) {
    function s(c) {
      try {
        u(o.next(c));
      } catch (l) {
        r(l);
      }
    }
    function d(c) {
      try {
        u(o.throw(c));
      } catch (l) {
        r(l);
      }
    }
    function u(c) {
      var l;
      c.done ? i(c.value) : (l = c.value, l instanceof e ? l : new e(function(m) {
        m(l);
      })).then(s, d);
    }
    u((o = o.apply(n, [])).next());
  });
};
const Cr = ({ checkedItemID: n, setCheckedItemID: t, flowState: e, onState: o }) => {
  var i, r;
  const { t: s } = (0, f.useContext)(J.TranslateContext), [d, u] = (0, f.useState)();
  return a(yt, { name: "username-edit-dropdown", title: s(e.payload.user.username ? "labels.changeUsername" : "labels.setUsername"), checkedItemID: n, setCheckedItemID: t, children: [a(xn, { flowError: e.payload.user.username ? (i = e.actions.username_update.inputs.username) === null || i === void 0 ? void 0 : i.error : (r = e.actions.username_create.inputs.username) === null || r === void 0 ? void 0 : r.error }), a(te, { flowAction: e.payload.user.username ? e.actions.username_update : e.actions.username_create, onSubmit: (c) => qo(void 0, void 0, void 0, function* () {
    c.preventDefault();
    const l = e.payload.user.username ? e.actions.username_update : e.actions.username_create, m = yield l.run({ username: d }, { dispatchAfterStateChangeEvent: !1 });
    return o(m).then(() => u(""));
  }), children: [a(Le, { markError: !0, placeholder: s("labels.username"), type: "text", onInput: (c) => {
    c.preventDefault(), c.target instanceof HTMLInputElement && u(c.target.value);
  }, value: d, flowInput: e.payload.user.username ? e.actions.username_update.inputs.username : e.actions.username_create.inputs.username }), a(ne, { children: s("labels.save") })] }), a(G, { flowAction: e.actions.username_delete, onClick: (c) => qo(void 0, void 0, void 0, function* () {
    c.preventDefault();
    const l = yield e.actions.username_delete.run(null, { dispatchAfterStateChangeEvent: !1 });
    return o(l).then(() => u(""));
  }), dangerous: !0, loadingSpinnerPosition: "right", children: s("labels.delete") })] });
}, Ar = ({ state: n, onBack: t }) => {
  const { t: e } = (0, f.useContext)(J.TranslateContext);
  return a(b.Fragment, { children: [a(ke, { children: [a(de, { children: e("headlines.deleteAccount") }), a(Se, { flowError: null }), a(K, { children: e("texts.deleteAccount") }), a(te, { flowAction: n.actions.account_delete, children: [a(oo, { required: !0, type: "checkbox", label: e("labels.deleteAccount") }), a(ne, { children: e("labels.delete") })] })] }), a(Te, { children: a(G, { onClick: t, children: e("labels.back") }) })] });
}, Pr = ({ checkedItemID: n, setCheckedItemID: t, flowState: e, onState: o }) => {
  const { t: i } = (0, f.useContext)(J.TranslateContext), r = (s) => new Date(s).toLocaleString();
  return a(Kt, { name: "session-edit-dropdown", columnSelector: (s) => {
    const d = a("b", { children: s.user_agent ? s.user_agent : s.id }), u = s.current ? a("span", { className: Fe.description, children: a(b.Fragment, { children: [" -", " ", i("labels.currentSession")] }) }) : null;
    return a(b.Fragment, { children: [d, u] });
  }, data: e.payload.sessions, contentSelector: (s) => {
    var d, u, c;
    return a(b.Fragment, { children: [a(K, { hidden: !s.ip_address, children: [a(De, { children: i("headlines.ipAddress") }), s.ip_address] }), a(K, { children: [a(De, { children: i("headlines.lastUsed") }), r(s.last_used)] }), a(K, { children: [a(De, { children: i("headlines.createdAt") }), r(s.created_at)] }), !((c = (u = (d = e.actions.session_delete.inputs.session_id) === null || d === void 0 ? void 0 : d.allowed_values) === null || u === void 0 ? void 0 : u.map((l) => l.value)) === null || c === void 0) && c.includes(s.id) ? a(K, { children: [a(De, { children: i("headlines.revokeSession") }), a(G, { dangerous: !0, onClick: (l) => ((m, v) => function(g, k, x, C) {
      return new (x || (x = Promise))(function(D, W) {
        function w(M) {
          try {
            I(C.next(M));
          } catch (z) {
            W(z);
          }
        }
        function E(M) {
          try {
            I(C.throw(M));
          } catch (z) {
            W(z);
          }
        }
        function I(M) {
          var z;
          M.done ? D(M.value) : (z = M.value, z instanceof x ? z : new x(function(F) {
            F(z);
          })).then(w, E);
        }
        I((C = C.apply(g, [])).next());
      });
    }(void 0, void 0, void 0, function* () {
      m.preventDefault();
      const g = yield e.actions.session_delete.run({ session_id: v }, { dispatchAfterStateChangeEvent: !1 });
      return o(g);
    }))(l, s.id), loadingSpinnerPosition: "right", children: i("labels.revoke") })] }) : null] });
  }, checkedItemID: n, setCheckedItemID: t });
};
var jo = function(n, t, e, o) {
  return new (e || (e = Promise))(function(i, r) {
    function s(c) {
      try {
        u(o.next(c));
      } catch (l) {
        r(l);
      }
    }
    function d(c) {
      try {
        u(o.throw(c));
      } catch (l) {
        r(l);
      }
    }
    function u(c) {
      var l;
      c.done ? i(c.value) : (l = c.value, l instanceof e ? l : new e(function(m) {
        m(l);
      })).then(s, d);
    }
    u((o = o.apply(n, [])).next());
  });
};
const Er = ({ checkedItemID: n, setCheckedItemID: t, flowState: e, onState: o }) => {
  var i, r, s, d;
  const { t: u } = (0, f.useContext)(J.TranslateContext), c = a("span", { className: Fe.description, children: !((i = e.payload.user.mfa_config) === null || i === void 0) && i.auth_app_set_up ? a(b.Fragment, { children: [" -", " ", u("labels.configured")] }) : null }), l = a(b.Fragment, { children: [u("labels.authenticatorAppManage"), " ", c] });
  return a(yt, { name: "authenticator-app-manage-dropdown", title: l, checkedItemID: n, setCheckedItemID: t, children: [a(De, { children: u(!((r = e.payload.user.mfa_config) === null || r === void 0) && r.auth_app_set_up ? "headlines.authenticatorAppAlreadySetUp" : "headlines.authenticatorAppNotSetUp") }), a(K, { children: [u(!((s = e.payload.user.mfa_config) === null || s === void 0) && s.auth_app_set_up ? "texts.authenticatorAppAlreadySetUp" : "texts.authenticatorAppNotSetUp"), a("br", {}), !((d = e.payload.user.mfa_config) === null || d === void 0) && d.auth_app_set_up ? a(G, { flowAction: e.actions.otp_secret_delete, onClick: (m) => jo(void 0, void 0, void 0, function* () {
    m.preventDefault();
    const v = yield e.actions.otp_secret_delete.run(null, { dispatchAfterStateChangeEvent: !1 });
    return o(v);
  }), loadingSpinnerPosition: "right", dangerous: !0, children: u("labels.delete") }) : a(G, { flowAction: e.actions.continue_to_otp_secret_creation, onClick: (m) => jo(void 0, void 0, void 0, function* () {
    m.preventDefault();
    const v = yield e.actions.continue_to_otp_secret_creation.run(null, { dispatchAfterStateChangeEvent: !1 });
    return o(v);
  }), loadingSpinnerPosition: "right", children: u("labels.authenticatorAppAdd") })] })] });
}, Ir = ({ checkedItemID: n, setCheckedItemID: t, flowState: e, onState: o }) => {
  const { t: i } = (0, f.useContext)(J.TranslateContext), r = (0, f.useMemo)(() => !1, []);
  return a(Kt, { name: "connected-accounts", columnSelector: (s) => {
    const d = a("b", { children: s.provider });
    return a(b.Fragment, { children: d });
  }, contentSelector: (s) => a(b.Fragment, { children: a(b.Fragment, { children: a(K, { children: [a(De, { children: i("headlines.deleteIdentity") }), a(G, { dangerous: !0, flowAction: e.actions.disconnect_thirdparty_oauth_provider, onClick: (d) => ((u, c) => function(l, m, v, g) {
    return new (v || (v = Promise))(function(k, x) {
      function C(w) {
        try {
          W(g.next(w));
        } catch (E) {
          x(E);
        }
      }
      function D(w) {
        try {
          W(g.throw(w));
        } catch (E) {
          x(E);
        }
      }
      function W(w) {
        var E;
        w.done ? k(w.value) : (E = w.value, E instanceof v ? E : new v(function(I) {
          I(E);
        })).then(C, D);
      }
      W((g = g.apply(l, [])).next());
    });
  }(void 0, void 0, void 0, function* () {
    u.preventDefault();
    const l = yield e.actions.disconnect_thirdparty_oauth_provider.run({ identity_id: c }, { dispatchAfterStateChangeEvent: !1 });
    return o(l);
  }))(d, s.identity_id), disabled: r, loadingSpinnerPosition: "right", children: i("labels.delete") })] }) }) }), checkedItemID: n, setCheckedItemID: t, data: e.payload.user.identities });
}, Or = ({ checkedItemID: n, setCheckedItemID: t, flowState: e, onState: o }) => {
  var i, r;
  const { t: s } = (0, f.useContext)(J.TranslateContext);
  return a(yt, { name: "connect-account-dropdown", title: s("labels.connectAccount"), checkedItemID: n, setCheckedItemID: t, children: [a(xn, { flowError: (i = e.actions.connect_thirdparty_oauth_provider.inputs.provider) === null || i === void 0 ? void 0 : i.error }), (r = e.actions.connect_thirdparty_oauth_provider.inputs.provider.allowed_values) === null || r === void 0 ? void 0 : r.map((d) => a(te, { flowAction: e.actions.connect_thirdparty_oauth_provider, onSubmit: (u) => ((c, l) => function(m, v, g, k) {
    return new (g || (g = Promise))(function(x, C) {
      function D(E) {
        try {
          w(k.next(E));
        } catch (I) {
          C(I);
        }
      }
      function W(E) {
        try {
          w(k.throw(E));
        } catch (I) {
          C(I);
        }
      }
      function w(E) {
        var I;
        E.done ? x(E.value) : (I = E.value, I instanceof g ? I : new g(function(M) {
          M(I);
        })).then(D, W);
      }
      w((k = k.apply(m, [])).next());
    });
  }(void 0, void 0, void 0, function* () {
    c.preventDefault();
    const m = wn();
    kn(m);
    try {
      const v = yield e.actions.connect_thirdparty_oauth_provider.run({ provider: l, redirect_to: window.location.href, code_verifier: m });
      return v.error && nt(), o(v);
    } catch (v) {
      throw nt(), v;
    }
  }))(u, d.value), children: a(ne, { icon: d.value.startsWith("custom_") ? "customProvider" : d.value, children: d.name }, d) }, d.value))] });
};
var en = function(n, t, e, o) {
  return new (e || (e = Promise))(function(i, r) {
    function s(c) {
      try {
        u(o.next(c));
      } catch (l) {
        r(l);
      }
    }
    function d(c) {
      try {
        u(o.throw(c));
      } catch (l) {
        r(l);
      }
    }
    function u(c) {
      var l;
      c.done ? i(c.value) : (l = c.value, l instanceof e ? l : new e(function(m) {
        m(l);
      })).then(s, d);
    }
    u((o = o.apply(n, [])).next());
  });
};
const Di = (n) => {
  var t, e, o, i, r, s, d;
  const { t: u } = (0, f.useContext)(J.TranslateContext), { setPage: c } = (0, f.useContext)(Ue), { flowState: l } = Ee(n.state), [m, v] = (0, f.useState)(""), g = (C) => en(void 0, void 0, void 0, function* () {
    C != null && C.error || (v(null), yield new Promise((D) => setTimeout(D, 360))), C.dispatchAfterStateChangeEvent();
  }), k = (C, D, W) => en(void 0, void 0, void 0, function* () {
    C.preventDefault();
    const w = yield l.actions.webauthn_credential_rename.run({ passkey_id: D, passkey_name: W }, { dispatchAfterStateChangeEvent: !1 });
    return g(w);
  }), x = (C) => (C.preventDefault(), c(a(Di, { state: l, enablePasskeys: n.enablePasskeys })), Promise.resolve());
  return a(ke, { children: [a(Se, { state: ((t = l == null ? void 0 : l.error) === null || t === void 0 ? void 0 : t.code) !== "form_data_invalid_error" ? l : null }), l.actions.username_create.enabled || l.actions.username_update.enabled || l.actions.username_delete.enabled ? a(b.Fragment, { children: [a(de, { children: u("labels.username") }), l.payload.user.username ? a(K, { children: a("b", { children: l.payload.user.username.username }) }) : null, a(K, { children: l.actions.username_create.enabled || l.actions.username_update.enabled ? a(Cr, { onState: g, flowState: l, checkedItemID: m, setCheckedItemID: v }) : null })] }) : null, !((o = (e = l.payload) === null || e === void 0 ? void 0 : e.user) === null || o === void 0) && o.emails || l.actions.email_create.enabled ? a(b.Fragment, { children: [a(de, { children: u("headlines.profileEmails") }), a(K, { children: [a(wr, { flowState: l, onState: g, checkedItemID: m, setCheckedItemID: v }), l.actions.email_create.enabled ? a(Sr, { flowState: l, onState: g, checkedItemID: m, setCheckedItemID: v }) : null] })] }) : null, l.actions.password_create.enabled || l.actions.password_update.enabled ? a(b.Fragment, { children: [a(de, { children: u("headlines.profilePassword") }), a(K, { children: a(xr, { flowState: l, onState: g, checkedItemID: m, setCheckedItemID: v }) })] }) : null, n.enablePasskeys && (!((r = (i = l.payload) === null || i === void 0 ? void 0 : i.user) === null || r === void 0) && r.passkeys || l.actions.webauthn_credential_create.enabled) ? a(b.Fragment, { children: [a(de, { children: u("headlines.profilePasskeys") }), a(K, { children: [a(Ro, { flowState: l, onBack: x, onCredentialNameSubmit: k, onCredentialDelete: (C, D) => en(void 0, void 0, void 0, function* () {
    C.preventDefault();
    const W = yield l.actions.webauthn_credential_delete.run({ passkey_id: D }, { dispatchAfterStateChangeEvent: !1 });
    return g(W);
  }), credentials: l.payload.user.passkeys, checkedItemID: m, setCheckedItemID: v, allowCredentialDeletion: !!l.actions.webauthn_credential_delete.enabled, credentialType: "passkey" }), l.actions.webauthn_credential_create.enabled ? a(Ho, { flowState: l, onState: g, credentialType: "passkey", checkedItemID: m, setCheckedItemID: v }) : null] })] }) : null, !((s = l.payload.user.mfa_config) === null || s === void 0) && s.security_keys_enabled ? a(b.Fragment, { children: [a(de, { children: u("headlines.securityKeys") }), a(K, { children: [a(Ro, { onBack: x, flowState: l, onCredentialNameSubmit: k, onCredentialDelete: (C, D) => en(void 0, void 0, void 0, function* () {
    C.preventDefault();
    const W = yield l.actions.security_key_delete.run({ security_key_id: D }, { dispatchAfterStateChangeEvent: !1 });
    return g(W);
  }), credentials: l.payload.user.security_keys, checkedItemID: m, setCheckedItemID: v, allowCredentialDeletion: !!l.actions.security_key_delete.enabled, credentialType: "security-key" }), l.actions.security_key_create.enabled ? a(Ho, { flowState: l, onState: g, credentialType: "security-key", checkedItemID: m, setCheckedItemID: v }) : null] })] }) : null, !((d = l.payload.user.mfa_config) === null || d === void 0) && d.totp_enabled ? a(b.Fragment, { children: [a(de, { children: u("headlines.authenticatorApp") }), a(K, { children: a(Er, { onState: g, flowState: l, checkedItemID: m, setCheckedItemID: v }) })] }) : null, l.actions.connect_thirdparty_oauth_provider.enabled || l.actions.disconnect_thirdparty_oauth_provider.enabled ? a(b.Fragment, { children: [a(de, { children: u("headlines.connectedAccounts") }), a(Ir, { flowState: l, onState: g, checkedItemID: m, setCheckedItemID: v }), l.actions.connect_thirdparty_oauth_provider.enabled ? a(Or, { setCheckedItemID: v, flowState: l, onState: g, checkedItemID: m }) : null] }) : null, l.payload.sessions ? a(b.Fragment, { children: [a(de, { children: u("headlines.profileSessions") }), a(K, { children: a(Pr, { flowState: l, onState: g, checkedItemID: m, setCheckedItemID: v }) })] }) : null, l.actions.account_delete.enabled ? a(b.Fragment, { children: [a(Sn, {}), a(K, { children: a(no, {}) }), a(K, { children: a(te, { onSubmit: (C) => (C.preventDefault(), c(a(Ar, { onBack: x, state: l })), Promise.resolve()), flowAction: l.actions.account_delete, children: a(ne, { dangerous: !0, children: u("headlines.deleteAccount") }) }) })] }) : null] });
}, Tr = Di, Fo = ({ state: n, error: t }) => {
  const { t: e } = (0, f.useContext)(J.TranslateContext), { init: o, componentName: i } = (0, f.useContext)(Ue), [r, s] = (0, f.useState)(!1), d = (0, f.useCallback)(() => o(i), [i, o]), { flowState: u } = Ee(n);
  return (0, f.useEffect)(() => (addEventListener("hankoAuthSuccess", d), () => {
    removeEventListener("hankoAuthSuccess", d);
  }), [d]), a(ke, { children: [a(de, { children: e("headlines.error") }), a(Se, { state: u, error: t }), a(te, { onSubmit: (c) => {
    c.preventDefault(), s(!0), d();
  }, children: a(ne, { isLoading: r, children: e("labels.continue") }) })] });
};
var Wo = function(n, t, e, o) {
  return new (e || (e = Promise))(function(i, r) {
    function s(c) {
      try {
        u(o.next(c));
      } catch (l) {
        r(l);
      }
    }
    function d(c) {
      try {
        u(o.throw(c));
      } catch (l) {
        r(l);
      }
    }
    function u(c) {
      var l;
      c.done ? i(c.value) : (l = c.value, l instanceof e ? l : new e(function(m) {
        m(l);
      })).then(s, d);
    }
    u((o = o.apply(n, [])).next());
  });
};
const $r = (n) => {
  const { t } = (0, f.useContext)(J.TranslateContext), { flowState: e } = Ee(n.state), [o, i] = (0, f.useState)();
  return a(b.Fragment, { children: [a(ke, { children: [a(de, { children: t("headlines.createEmail") }), a(Se, { state: e }), a(te, { onSubmit: (r) => Wo(void 0, void 0, void 0, function* () {
    return r.preventDefault(), e.actions.email_address_set.run({ email: o });
  }), flowAction: e.actions.email_address_set, children: [a(Le, { type: "email", autoComplete: "email", autoCorrect: "off", flowInput: e.actions.email_address_set.inputs.email, onInput: (r) => Wo(void 0, void 0, void 0, function* () {
    r.target instanceof HTMLInputElement && i(r.target.value);
  }), placeholder: t("labels.email"), pattern: "^.*[^0-9]+$", value: o }), a(ne, { children: t("labels.continue") })] })] }), a(Te, { hidden: !e.actions.skip.enabled, children: [a("span", { hidden: !0 }), a(G, { flowAction: e.actions.skip, loadingSpinnerPosition: "left", children: t("labels.skip") })] })] });
};
var Ko = function(n, t, e, o) {
  return new (e || (e = Promise))(function(i, r) {
    function s(c) {
      try {
        u(o.next(c));
      } catch (l) {
        r(l);
      }
    }
    function d(c) {
      try {
        u(o.throw(c));
      } catch (l) {
        r(l);
      }
    }
    function u(c) {
      var l;
      c.done ? i(c.value) : (l = c.value, l instanceof e ? l : new e(function(m) {
        m(l);
      })).then(s, d);
    }
    u((o = o.apply(n, [])).next());
  });
};
const Dr = (n) => {
  const { t } = (0, f.useContext)(J.TranslateContext), { flowState: e } = Ee(n.state), [o, i] = (0, f.useState)();
  return a(b.Fragment, { children: [a(ke, { children: [a(de, { children: t("headlines.createUsername") }), a(Se, { state: e }), a(te, { flowAction: e.actions.username_create, onSubmit: (r) => Ko(void 0, void 0, void 0, function* () {
    return r.preventDefault(), e.actions.username_create.run({ username: o });
  }), children: [a(Le, { type: "text", autoComplete: "username", autoCorrect: "off", flowInput: e.actions.username_create.inputs.username, onInput: (r) => Ko(void 0, void 0, void 0, function* () {
    r.target instanceof HTMLInputElement && i(r.target.value);
  }), value: o, placeholder: t("labels.username") }), a(ne, { children: t("labels.continue") })] })] }), a(Te, { hidden: !e.actions.skip.enabled, children: [a("span", { hidden: !0 }), a(G, { flowAction: e.actions.skip, loadingSpinnerPosition: "left", children: t("labels.skip") })] })] });
}, Ur = (n) => {
  const { t } = (0, f.useContext)(J.TranslateContext), { flowState: e } = Ee(n.state);
  return a(b.Fragment, { children: [a(ke, { children: [a(de, { children: t("headlines.setupLoginMethod") }), a(Se, { flowError: e == null ? void 0 : e.error }), a(K, { children: t("texts.selectLoginMethodForFutureLogins") }), a(te, { flowAction: e.actions.continue_to_passkey_registration, children: a(ne, { secondary: !0, icon: "passkey", children: t("labels.passkey") }) }), a(te, { flowAction: e.actions.continue_to_password_registration, children: a(ne, { secondary: !0, icon: "password", children: t("labels.password") }) })] }), a(Te, { hidden: !e.actions.back.enabled && !e.actions.skip.enabled, children: [a(G, { loadingSpinnerPosition: "right", flowAction: e.actions.back, children: t("labels.back") }), a(G, { loadingSpinnerPosition: "left", flowAction: e.actions.skip, children: t("labels.skip") })] })] });
};
var Vo = function(n, t, e, o) {
  return new (e || (e = Promise))(function(i, r) {
    function s(c) {
      try {
        u(o.next(c));
      } catch (l) {
        r(l);
      }
    }
    function d(c) {
      try {
        u(o.throw(c));
      } catch (l) {
        r(l);
      }
    }
    function u(c) {
      var l;
      c.done ? i(c.value) : (l = c.value, l instanceof e ? l : new e(function(m) {
        m(l);
      })).then(s, d);
    }
    u((o = o.apply(n, [])).next());
  });
};
const Lr = (n) => {
  const { t } = (0, f.useContext)(J.TranslateContext), { flowState: e } = Ee(n.state), [o, i] = (0, f.useState)([]), r = (0, f.useCallback)((s) => Vo(void 0, void 0, void 0, function* () {
    return e.actions.otp_code_validate.run({ otp_code: s });
  }), [e]);
  return (0, f.useEffect)(() => {
    i([]);
  }, [e]), a(b.Fragment, { children: [a(ke, { children: [a(de, { children: t("headlines.otpLogin") }), a(Se, { state: e }), a(K, { children: t("texts.otpLogin") }), a(te, { flowAction: e.actions.otp_code_validate, onSubmit: (s) => Vo(void 0, void 0, void 0, function* () {
    return s.preventDefault(), r(o.join(""));
  }), children: [a(io, { onInput: (s) => {
    if (i(s), s.filter((d) => d !== "").length === 6) return r(s.join(""));
  }, passcodeDigits: o, numberOfInputs: 6 }), a(ne, { children: t("labels.continue") })] })] }), a(Te, { hidden: !e.actions.continue_to_login_security_key.enabled, children: a(G, { loadingSpinnerPosition: "right", flowAction: e.actions.continue_to_login_security_key, children: t("labels.useAnotherMethod") }) })] });
}, Nr = (n) => {
  const { t } = (0, f.useContext)(J.TranslateContext), { flowState: e } = Ee(n.state);
  return a(b.Fragment, { children: [a(ke, { children: [a(de, { children: t("headlines.securityKeyLogin") }), a(Se, { state: e }), a(K, { children: t("texts.securityKeyLogin") }), a(te, { flowAction: e.actions.webauthn_generate_request_options, children: a(ne, { autofocus: !0, icon: "securityKey", children: t("labels.securityKeyUse") }) })] }), a(Te, { hidden: !e.actions.continue_to_login_otp.enabled, children: a(G, { loadingSpinnerPosition: "right", flowAction: e.actions.continue_to_login_otp, children: t("labels.useAnotherMethod") }) })] });
}, Mr = (n) => {
  const { t } = (0, f.useContext)(J.TranslateContext), { flowState: e } = Ee(n.state), o = (0, f.useMemo)(() => {
    const { actions: i } = e;
    return i.continue_to_security_key_creation.enabled && !i.continue_to_otp_secret_creation.enabled ? i.continue_to_security_key_creation : !i.continue_to_security_key_creation.enabled && i.continue_to_otp_secret_creation.enabled ? i.continue_to_otp_secret_creation : void 0;
  }, [e]);
  return a(b.Fragment, { children: [a(ke, { children: [a(de, { children: t("headlines.mfaSetUp") }), a(Se, { flowError: e == null ? void 0 : e.error }), a(K, { children: t("texts.mfaSetUp") }), o ? a(te, { flowAction: o, children: a(ne, { children: t("labels.continue") }) }) : a(b.Fragment, { children: [a(te, { flowAction: e.actions.continue_to_security_key_creation, children: a(ne, { secondary: !0, icon: "securityKey", children: t("labels.securityKey") }) }), a(te, { flowAction: e.actions.continue_to_otp_secret_creation, children: a(ne, { secondary: !0, icon: "qrCodeScanner", children: t("labels.authenticatorApp") }) })] })] }), a(Te, { children: [a(G, { loadingSpinnerPosition: "right", flowAction: e.actions.back, children: t("labels.back") }), a(G, { loadingSpinnerPosition: "left", flowAction: e.actions.skip, children: t("labels.skip") })] })] });
};
var pn = ee(8), Dt = {};
Dt.setAttributes = Qe(), Dt.insert = (n) => {
  window._hankoStyle = n;
}, Dt.domAPI = Ye(), Dt.insertStyleElement = Ge(), Je()(pn.A, Dt);
const Rr = pn.A && pn.A.locals ? pn.A.locals : void 0, zr = ({ children: n, text: t }) => {
  const { t: e } = (0, f.useContext)(J.TranslateContext), [o, i] = (0, f.useState)(!1);
  return a("section", { className: Ft.clipboardContainer, children: [a("div", { children: [n, " "] }), a("div", { className: Ft.clipboardIcon, onClick: (r) => function(s, d, u, c) {
    return new (u || (u = Promise))(function(l, m) {
      function v(x) {
        try {
          k(c.next(x));
        } catch (C) {
          m(C);
        }
      }
      function g(x) {
        try {
          k(c.throw(x));
        } catch (C) {
          m(C);
        }
      }
      function k(x) {
        var C;
        x.done ? l(x.value) : (C = x.value, C instanceof u ? C : new u(function(D) {
          D(C);
        })).then(v, g);
      }
      k((c = c.apply(s, [])).next());
    });
  }(void 0, void 0, void 0, function* () {
    r.preventDefault();
    try {
      yield navigator.clipboard.writeText(t), i(!0), setTimeout(() => i(!1), 1500);
    } catch (s) {
      console.error("Failed to copy: ", s);
    }
  }), children: o ? a("span", { children: ["- ", e("labels.copied")] }) : a(Wt, { name: "copy", secondary: !0, size: 13 }) })] });
}, Hr = ({ src: n, secret: t }) => {
  const { t: e } = (0, f.useContext)(J.TranslateContext);
  return a("div", { className: Rr.otpCreationDetails, children: [a("img", { alt: "QR-Code", src: n }), a(Sn, {}), a(zr, { text: t, children: e("texts.otpSecretKey") }), a("div", { children: t })] });
};
var Bo = function(n, t, e, o) {
  return new (e || (e = Promise))(function(i, r) {
    function s(c) {
      try {
        u(o.next(c));
      } catch (l) {
        r(l);
      }
    }
    function d(c) {
      try {
        u(o.throw(c));
      } catch (l) {
        r(l);
      }
    }
    function u(c) {
      var l;
      c.done ? i(c.value) : (l = c.value, l instanceof e ? l : new e(function(m) {
        m(l);
      })).then(s, d);
    }
    u((o = o.apply(n, [])).next());
  });
};
const qr = (n) => {
  const { t } = (0, f.useContext)(J.TranslateContext), { flowState: e } = Ee(n.state), [o, i] = (0, f.useState)([]), r = (0, f.useCallback)((s) => Bo(void 0, void 0, void 0, function* () {
    return e.actions.otp_code_verify.run({ otp_code: s });
  }), [e]);
  return (0, f.useEffect)(() => {
    var s;
    ((s = e.error) === null || s === void 0 ? void 0 : s.code) === "passcode_invalid" && i([]);
  }, [e]), a(b.Fragment, { children: [a(ke, { children: [a(de, { children: t("headlines.otpSetUp") }), a(Se, { state: e }), a(K, { children: t("texts.otpScanQRCode") }), a(Hr, { src: e.payload.otp_image_source, secret: e.payload.otp_secret }), a(K, { children: t("texts.otpEnterVerificationCode") }), a(te, { flowAction: e.actions.otp_code_verify, onSubmit: (s) => Bo(void 0, void 0, void 0, function* () {
    return s.preventDefault(), r(o.join(""));
  }), children: [a(io, { onInput: (s) => {
    if (i(s), s.filter((d) => d !== "").length === 6) return r(s.join(""));
  }, passcodeDigits: o, numberOfInputs: 6 }), a(ne, { children: t("labels.continue") })] })] }), a(Te, { children: a(G, { flowAction: e.actions.back, loadingSpinnerPosition: "right", children: t("labels.back") }) })] });
}, jr = (n) => {
  const { t } = (0, f.useContext)(J.TranslateContext), { flowState: e } = Ee(n.state);
  return a(b.Fragment, { children: [a(ke, { children: [a(de, { children: t("headlines.securityKeySetUp") }), a(Se, { state: e }), a(K, { children: t("texts.securityKeySetUp") }), a(te, { flowAction: e.actions.webauthn_generate_creation_options, children: a(ne, { autofocus: !0, icon: "securityKey", children: t("labels.createSecurityKey") }) })] }), a(Te, { hidden: !e.actions.back.enabled, children: a(G, { loadingSpinnerPosition: "right", flowAction: e.actions.back, children: t("labels.back") }) })] });
}, Fr = (n) => {
  const { t } = (0, f.useContext)(J.TranslateContext), { flowState: e } = Ee(n.state);
  return a(b.Fragment, { children: [a(ke, { children: [a(de, { children: t("headlines.trustDevice") }), a(Se, { flowError: e == null ? void 0 : e.error }), a(K, { children: t("texts.trustDevice") }), a(te, { flowAction: e.actions.trust_device, children: a(ne, { children: t("labels.trustDevice") }) })] }), a(Te, { children: [a(G, { flowAction: e.actions.back, loadingSpinnerPosition: "right", children: t("labels.back") }), a(G, { flowAction: e.actions.skip, loadingSpinnerPosition: "left", children: t("labels.skip") })] })] });
};
var Zo = function(n, t, e, o) {
  return new (e || (e = Promise))(function(i, r) {
    function s(c) {
      try {
        u(o.next(c));
      } catch (l) {
        r(l);
      }
    }
    function d(c) {
      try {
        u(o.throw(c));
      } catch (l) {
        r(l);
      }
    }
    function u(c) {
      var l;
      c.done ? i(c.value) : (l = c.value, l instanceof e ? l : new e(function(m) {
        m(l);
      })).then(s, d);
    }
    u((o = o.apply(n, t || [])).next());
  });
};
const Ue = (0, b.createContext)(null), Wr = (n) => {
  var t, { lang: e, prefilledEmail: o, prefilledUsername: i, globalOptions: r, createWebauthnAbortSignal: s, nonce: d } = n, u = function(q, H) {
    var Ce = {};
    for (var se in q) Object.prototype.hasOwnProperty.call(q, se) && H.indexOf(se) < 0 && (Ce[se] = q[se]);
    if (q != null && typeof Object.getOwnPropertySymbols == "function") {
      var Ie = 0;
      for (se = Object.getOwnPropertySymbols(q); Ie < se.length; Ie++) H.indexOf(se[Ie]) < 0 && Object.prototype.propertyIsEnumerable.call(q, se[Ie]) && (Ce[se[Ie]] = q[se[Ie]]);
    }
    return Ce;
  }(n, ["lang", "prefilledEmail", "prefilledUsername", "globalOptions", "createWebauthnAbortSignal", "nonce"]);
  const { hanko: c, injectStyles: l, hidePasskeyButtonOnLogin: m, translations: v, translationsLocation: g, fallbackLanguage: k } = r;
  c.setLang((e == null ? void 0 : e.toString()) || k);
  const x = (0, f.useRef)(null), C = (0, f.useMemo)(() => `${r.storageKey}_last_login`, [r.storageKey]), [D, W] = (0, f.useState)(u.componentName), [w, E] = (0, f.useState)((t = u.mode) !== null && t !== void 0 ? t : "login"), I = (0, f.useRef)(!1), [M, z] = (0, f.useState)(!1), F = (0, f.useMemo)(() => ({ auth: w, login: "login", registration: "registration", profile: "profile", events: null }), [w]), V = (0, f.useMemo)(() => a(ur, {}), []), [X, N] = (0, f.useState)(V), [, fe] = (0, f.useState)(c), [_e, ue] = (0, f.useState)(), [le, re] = (0, f.useState)({ email: o, username: i }), ye = function(q, H) {
    var Ce;
    (Ce = x.current) === null || Ce === void 0 || Ce.dispatchEvent(new CustomEvent(q, { detail: H, bubbles: !1, composed: !0 }));
  }, Ne = (0, f.useCallback)((q) => F[D] == q.flowName, [F, D, w]), ot = (q) => {
    N(a(Fo, { error: q instanceof ut ? q : new We(q) }));
  };
  (0, f.useMemo)(() => c.onBeforeStateChange(({ state: q }) => {
    Ne(q) && re((H) => Object.assign(Object.assign({}, H), { isDisabled: !0, error: void 0 }));
  }), [c, Ne]), (0, f.useEffect)(() => {
    re((q) => Object.assign(Object.assign(Object.assign({}, q), o && { email: o }), i && { username: i }));
  }, [o, i]), (0, f.useEffect)(() => c.onAfterStateChange((q) => Zo(void 0, [q], void 0, function* ({ state: H }) {
    var Ce;
    if (Ne(H)) switch (["onboarding_verify_passkey_attestation", "webauthn_credential_verification", "login_passkey", "thirdparty"].includes(H.name) || re((se) => Object.assign(Object.assign({}, se), { isDisabled: !1 })), H.name) {
      case "login_init":
        N(a(hr, { state: H })), H.passkeyAutofillActivation();
        break;
      case "passcode_confirmation":
        N(a(mr, { state: H }));
        break;
      case "login_otp":
        N(a(Lr, { state: H }));
        break;
      case "onboarding_create_passkey":
        N(a(fr, { state: H }));
        break;
      case "login_password":
        N(a(gr, { state: H }));
        break;
      case "login_password_recovery":
        N(a(vr, { state: H }));
        break;
      case "login_security_key":
        N(a(Nr, { state: H }));
        break;
      case "mfa_method_chooser":
        N(a(Mr, { state: H }));
        break;
      case "mfa_otp_secret_creation":
        N(a(qr, { state: H }));
        break;
      case "mfa_security_key_creation":
        N(a(jr, { state: H }));
        break;
      case "login_method_chooser":
        N(a(_r, { state: H }));
        break;
      case "registration_init":
        N(a(yr, { state: H }));
        break;
      case "password_creation":
        N(a(br, { state: H }));
        break;
      case "success":
        !((Ce = H.payload) === null || Ce === void 0) && Ce.last_login && localStorage.setItem(C, JSON.stringify(H.payload.last_login)), H.autoStep();
        break;
      case "profile_init":
        N(a(Tr, { state: H, enablePasskeys: r.enablePasskeys }));
        break;
      case "error":
        N(a(Fo, { state: H }));
        break;
      case "onboarding_email":
        N(a($r, { state: H }));
        break;
      case "onboarding_username":
        N(a(Dr, { state: H }));
        break;
      case "credential_onboarding_chooser":
        N(a(Ur, { state: H }));
        break;
      case "device_trust":
        N(a(Fr, { state: H }));
    }
  })), [D, F]);
  const it = (0, f.useCallback)((q) => Zo(void 0, void 0, void 0, function* () {
    re((se) => Object.assign(Object.assign({}, se), { isDisabled: !0 }));
    const H = localStorage.getItem(C);
    H && ue(JSON.parse(H));
    const Ce = { excludeAutoSteps: ["success"], cacheKey: "hanko-auth-flow-state", dispatchAfterStateChangeEvent: !1 };
    if (new URLSearchParams(window.location.search).get("saml_hint") === "idp_initiated") E("token_exchange"), yield c.createState("token_exchange", Object.assign(Object.assign({}, Ce), { dispatchAfterStateChangeEvent: !0 }));
    else {
      const se = yield c.createState(q, Ce);
      E(se.flowName), setTimeout(() => se.dispatchAfterStateChangeEvent(), 500);
    }
  }), []), A = (0, f.useCallback)((q) => {
    W(q);
    const H = F[q];
    H && it(H).catch(ot);
  }, [F]);
  (0, f.useEffect)(() => {
    if (!I.current) {
      const q = setTimeout(() => {
        var H;
        E((H = u.mode) !== null && H !== void 0 ? H : "login"), z(!0);
      }, 0);
      return () => clearTimeout(q);
    }
  }, [u.mode]), (0, f.useEffect)(() => {
    M && !I.current && (I.current = !0, A(D));
  }, [M, w, D, A]), (0, f.useEffect)(() => {
    c.onUserDeleted(() => {
      ye("onUserDeleted");
    }), c.onSessionCreated((q) => {
      ye("onSessionCreated", q);
    }), c.onSessionExpired(() => {
      ye("onSessionExpired");
    }), c.onUserLoggedOut(() => {
      ye("onUserLoggedOut");
    }), c.onBeforeStateChange((q) => {
      ye("onBeforeStateChange", q);
    }), c.onAfterStateChange((q) => {
      ye("onAfterStateChange", q);
    });
  }, [c]), (0, f.useMemo)(() => {
    const q = () => {
      A(D);
    };
    ["auth", "login", "registration"].includes(D) ? (c.onUserLoggedOut(q), c.onSessionExpired(q), c.onUserDeleted(q)) : D === "profile" && c.onSessionCreated(q);
  }, [D, c, A]);
  const O = Ue.Provider, U = J.TranslateProvider, Z = Va;
  return a(O, { value: { init: A, initialComponentName: u.componentName, setUIState: re, uiState: le, hanko: c, setHanko: fe, lang: (e == null ? void 0 : e.toString()) || k, prefilledEmail: o, prefilledUsername: i, componentName: D, setComponentName: W, hidePasskeyButtonOnLogin: m, page: X, setPage: N, lastLogin: _e, isOwnFlow: Ne }, children: a(U, { translations: v, fallbackLang: k, root: g, children: a(Z, { ref: x, children: D !== "events" ? a(b.Fragment, { children: [l ? a("style", { nonce: d || void 0, dangerouslySetInnerHTML: { __html: window._hankoStyle.innerHTML } }) : null, X] }) : null }) }) });
}, Kr = { en: ee(6).en };
var Ui = function(n, t, e, o) {
  return new (e || (e = Promise))(function(i, r) {
    function s(c) {
      try {
        u(o.next(c));
      } catch (l) {
        r(l);
      }
    }
    function d(c) {
      try {
        u(o.throw(c));
      } catch (l) {
        r(l);
      }
    }
    function u(c) {
      var l;
      c.done ? i(c.value) : (l = c.value, l instanceof e ? l : new e(function(m) {
        m(l);
      })).then(s, d);
    }
    u((o = o.apply(n, t || [])).next());
  });
};
const Be = {}, Vt = (n, t) => {
  var e;
  const o = (e = document.getElementsByTagName(`hanko-${n}`).item(0)) === null || e === void 0 ? void 0 : e.nonce;
  return a(Wr, Object.assign({ componentName: n, globalOptions: Be, createWebauthnAbortSignal: Qr }, t, { nonce: o }));
}, Vr = (n) => Vt("auth", n), Br = (n) => Vt("login", n), Zr = (n) => Vt("registration", n), Jr = (n) => Vt("profile", n), Yr = (n) => Vt("events", n);
let tn = new AbortController();
const Qr = () => (tn && tn.abort(), tn = new AbortController(), tn.signal), Ut = (n) => Ui(void 0, [n], void 0, function* ({ tagName: t, entryComponent: e, shadow: o = !0, observedAttributes: i }) {
  customElements.get(t) || function(r, s, d, u) {
    function c() {
      var l = Reflect.construct(HTMLElement, [], c);
      return l._vdomComponent = r, l._root = u && u.shadow ? l.attachShadow({ mode: "open" }) : l, l;
    }
    (c.prototype = Object.create(HTMLElement.prototype)).constructor = c, c.prototype.connectedCallback = fa, c.prototype.attributeChangedCallback = ga, c.prototype.disconnectedCallback = va, d = d || r.observedAttributes || Object.keys(r.propTypes || {}), c.observedAttributes = d, d.forEach(function(l) {
      Object.defineProperty(c.prototype, l, { get: function() {
        var m, v, g, k;
        return (m = (v = this._vdom) == null || (g = v.props) == null ? void 0 : g[l]) != null ? m : (k = this._props) == null ? void 0 : k[l];
      }, set: function(m) {
        this._vdom ? this.attributeChangedCallback(l, null, m) : (this._props || (this._props = {}), this._props[l] = m, this.connectedCallback());
        var v = typeof m;
        m != null && v !== "string" && v !== "boolean" && v !== "number" || this.setAttribute(l, m);
      } });
    }), customElements.define(s || r.tagName || r.displayName || r.name, c);
  }(e, t, i, { shadow: o });
}), Li = (n, ...t) => Ui(void 0, [n, ...t], void 0, function* (e, o = {}) {
  const i = ["api", "lang", "prefilled-email", "entry", "mode"];
  return o = Object.assign({ shadow: !0, injectStyles: !0, enablePasskeys: !0, hidePasskeyButtonOnLogin: !1, translations: null, translationsLocation: "/i18n", fallbackLanguage: "en", storageKey: "hanko", sessionCheckInterval: 3e4 }, o), Be.hanko = new Ii(e, { cookieName: o.storageKey, cookieDomain: o.cookieDomain, cookieSameSite: o.cookieSameSite, localStorageKey: o.storageKey, sessionCheckInterval: o.sessionCheckInterval, sessionTokenLocation: o.sessionTokenLocation }), Be.injectStyles = o.injectStyles, Be.enablePasskeys = o.enablePasskeys, Be.hidePasskeyButtonOnLogin = o.hidePasskeyButtonOnLogin, Be.translations = o.translations || Kr, Be.translationsLocation = o.translationsLocation, Be.fallbackLanguage = o.fallbackLanguage, Be.storageKey = o.storageKey, yield Promise.all([Ut(Object.assign(Object.assign({}, o), { tagName: "hanko-auth", entryComponent: Vr, observedAttributes: i })), Ut(Object.assign(Object.assign({}, o), { tagName: "hanko-login", entryComponent: Br, observedAttributes: i })), Ut(Object.assign(Object.assign({}, o), { tagName: "hanko-registration", entryComponent: Zr, observedAttributes: i })), Ut(Object.assign(Object.assign({}, o), { tagName: "hanko-profile", entryComponent: Jr, observedAttributes: i.filter((r) => ["api", "lang"].includes(r)) })), Ut(Object.assign(Object.assign({}, o), { tagName: "hanko-events", entryComponent: Yr, observedAttributes: [] }))]), { hanko: Be.hanko };
}), Gr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Action: jt,
  Client: Gn,
  CustomEventWithDetail: _i,
  Hanko: Ii,
  HankoError: ut,
  HttpClient: Qn,
  Relay: wi,
  RequestTimeoutError: bn,
  SessionClient: Xn,
  State: ze,
  TechnicalError: We,
  UnauthorizedError: mt,
  UserClient: Ei,
  WebauthnSupport: ft,
  clearStoredCodeVerifier: nt,
  generateCodeVerifier: wn,
  getStoredCodeVerifier: Pi,
  register: Li,
  sessionCreatedType: Bn,
  sessionExpiredType: Zn,
  setStoredCodeVerifier: kn,
  userDeletedType: Yn,
  userLoggedOutType: Jn
}, Symbol.toStringTag, { value: "Module" })), Xr = Ri`
  :host {
    display: block;
    font-family: var(--font-family, var(--hot-font-sans));
  }

  hanko-auth::part(headline1) {
    text-align: center;
  }

  .container {
    max-width: 400px;
    margin: 0 auto;
    padding: var(--hot-spacing-x-small) var(--hot-spacing-large);
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    padding: var(--hot-spacing-3x-large);
    color: var(--hot-color-gray-600);
  }

  .osm-connecting {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: var(--hot-spacing-small);
    padding: var(--hot-spacing-large);
    box-sizing: border-box;
  }

  .spinner {
    width: 25px;
    height: 25px;
    border: 4px solid var(--hot-color-red-50);
    border-top: 4px solid var(--hot-color-red-600);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  /* Container that mimics the avatar/dropdown-trigger dimensions */
  .loading-placeholder {
    display: inline-grid;
    place-items: center;
    /* Match dropdown-trigger padding so size is stable pre/post load */
    padding: var(--hot-spacing-x-small);
    width: var(--hot-spacing-2x-large);
    height: var(--hot-spacing-2x-large);
    box-sizing: content-box;
  }

  /* Invisible text to reserve button width */
  .loading-placeholder-text {
    display: none;
  }

  .spinner-small {
    grid-area: 1 / 1;
    width: var(--hot-spacing-2x-large);
    height: var(--hot-spacing-2x-large);
    border: 2px solid var(--hot-color-gray-200);
    border-top: 2px solid var(--hot-color-gray-600);
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
    font-family: var(--font-family, var(--hot-font-sans));
    font-weight: var(--font-weight, 500);
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary {
    background: var(--hot-color-red-700);
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
    overflow: hidden;
    flex-shrink: 0;
  }

  .profile-info {
    min-width: 0;
  }

  .profile-email {
    font-size: var(--hot-font-size-small);
    font-weight: var(--hot-font-weight-bold);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
  /* Avatar image — fills the circle, hides the initial letter */
  .avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    display: block;
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
    overflow: hidden;
    font-weight: var(--hot-font-weight-semibold);
    color: white;
    flex-shrink: 0;
  }

  .login-link {
    color: var(--login-btn-text-color, white);
    font-size: var(--login-btn-text-size, var(--hot-font-size-medium));
    border-radius: var(
      --login-btn-border-radius,
      var(--hot-border-radius-medium)
    );
    text-decoration: none;
    padding: var(
      --login-btn-padding,
      var(--hot-spacing-x-small) var(--hot-spacing-medium)
    );
    margin: var(--login-btn-margin, 0);
    display: inline-block;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: var(
      --login-btn-font-weight,
      var(--font-weight, var(--hot-font-weight-medium))
    );
    font-family: var(
      --login-btn-font-family,
      var(--font-family, var(--hot-font-sans))
    );
  }

  /* Button variants - filled */
  .login-link.filled {
    border: none;
  }
  .login-link.filled.primary {
    background: var(--login-btn-bg-color, var(--hot-color-primary-1000));
    color: var(--login-btn-text-color, white);
  }
  .login-link.filled.primary:hover {
    background: var(--login-btn-hover-bg-color, var(--hot-color-primary-900));
  }
  .login-link.filled.neutral {
    background: var(--login-btn-bg-color, var(--hot-color-neutral-600));
    color: var(--login-btn-text-color, white);
  }
  .login-link.filled.neutral:hover {
    background: var(--login-btn-hover-bg-color, var(--hot-color-neutral-700));
  }
  .login-link.filled.danger {
    background: var(--login-btn-bg-color, var(--hot-color-red-600));
    color: var(--login-btn-text-color, white);
  }
  .login-link.filled.danger:hover {
    background: var(--login-btn-hover-bg-color, var(--hot-color-red-700));
  }

  /* Button variants - outline */
  .login-link.outline {
    background: var(--login-btn-bg-color, transparent);
    border: 1px solid;
  }
  .login-link.outline.primary {
    border-color: var(--login-btn-bg-color, var(--hot-color-primary-1000));
    color: var(--login-btn-text-color, var(--hot-color-primary-1000));
  }
  .login-link.outline.primary:hover {
    background: var(--login-btn-hover-bg-color, var(--hot-color-primary-50));
  }
  .login-link.outline.neutral {
    border-color: var(--login-btn-bg-color, var(--hot-color-neutral-700));
    color: var(--login-btn-text-color, var(--hot-color-neutral-700));
  }
  .login-link.outline.neutral:hover {
    background: var(--login-btn-hover-bg-color, var(--hot-color-neutral-50));
  }
  .login-link.outline.danger {
    border-color: var(--login-btn-bg-color, var(--hot-color-red-600));
    color: var(--login-btn-text-color, var(--hot-color-red-600));
  }
  .login-link.outline.danger:hover {
    background: var(--login-btn-hover-bg-color, var(--hot-color-red-50));
  }

  /* Button variants - plain */
  .login-link.plain {
    background: var(--login-btn-bg-color, transparent);
    border: none;
  }
  .login-link.plain.primary {
    color: var(--login-btn-text-color, var(--hot-color-primary-1000));
  }
  .login-link.plain.primary:hover {
    background: var(--login-btn-hover-bg-color, var(--hot-color-primary-50));
  }
  .login-link.plain.neutral {
    color: var(--login-btn-text-color, var(--hot-color-neutral-700));
  }
  .login-link.plain.neutral:hover {
    background: var(--login-btn-hover-bg-color, var(--hot-color-neutral-50));
  }
  .login-link.plain.danger {
    color: var(--login-btn-text-color, var(--hot-color-red-600));
  }
  .login-link.plain.danger:hover {
    background: var(--login-btn-hover-bg-color, var(--hot-color-red-50));
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

  .dropdown-trigger:hover,
  .dropdown-trigger:active,
  .dropdown-trigger:focus {
    background: none;
    outline: none;
  }
  .dropdown-content {
    position: absolute;
    right: 0;
    background: white;
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
    transform: translateY(-1px);
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
    font-family: var(--font-family, var(--hot-font-sans, inherit));
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

  /* Bar display mode */

  :host([display="bar"]) {
    width: 100%;
  }

  :host([display="bar"]) .dropdown {
    display: block;
    width: 100%;
  }

  .bar-trigger {
    display: flex;
    align-items: center;
    width: 100%;
    padding: var(--hot-spacing-small) var(--hot-spacing-medium);
    background: none;
    border: none;
    cursor: pointer;
    gap: var(--hot-spacing-small);
    font-family: var(--font-family, var(--hot-font-sans, inherit));
  }

  .bar-trigger:hover,
  .bar-trigger:active,
  .bar-trigger:focus {
    background: none;
    outline: none;
  }

  .bar-info {
    display: flex;
    align-items: center;
    gap: var(--hot-spacing-small);
    flex: 1;
    min-width: 0;
  }

  .bar-email {
    font-size: var(--hot-font-size-medium);
    color: var(--hot-color-gray-900);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bar-chevron {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    color: var(--hot-color-gray-900);
  }

  /* When bar-trigger is used as a login-link, override width behavior */
  a.bar-trigger.login-link {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    text-decoration: none;
  }

  /* Style Hanko's internal link button (e.g. "Create account") */
  hanko-auth::part(link) {
    font-weight: bold;
    text-decoration: underline;
  }
`;
var qn = { d: (n, t) => {
  for (var e in t) qn.o(t, e) && !qn.o(n, e) && Object.defineProperty(n, e, { enumerable: !0, get: t[e] });
}, o: (n, t) => Object.prototype.hasOwnProperty.call(n, t) }, Ni = {};
qn.d(Ni, { en: () => es });
const es = { headlines: { error: "An error has occurred", loginEmail: "Sign in or create account", loginEmailNoSignup: "Sign in", loginFinished: "Login successful", loginPasscode: "Enter passcode", loginPassword: "Enter password", registerAuthenticator: "Create a passkey", registerConfirm: "Create account?", registerPassword: "Set new password", otpSetUp: "Set up authenticator app", profileEmails: "Emails", profilePassword: "Password", profilePasskeys: "Passkeys", isPrimaryEmail: "Primary email address", setPrimaryEmail: "Set primary email address", createEmail: "Enter a new email", createUsername: "Enter a new username", emailVerified: "Verified", emailUnverified: "Unverified", emailDelete: "Delete", renamePasskey: "Rename passkey", deletePasskey: "Delete passkey", lastUsedAt: "Last used at", createdAt: "Created at", connectedAccounts: "Connected accounts", deleteAccount: "Delete account", accountNotFound: "Account not found", signIn: "Sign in", signUp: "Create account", selectLoginMethod: "Select login method", setupLoginMethod: "Set up login method", lastUsed: "Last seen", ipAddress: "IP address", revokeSession: "Revoke session", profileSessions: "Sessions", mfaSetUp: "Set up MFA", securityKeySetUp: "Add security key", securityKeyLogin: "Security key", otpLogin: "Authentication code", renameSecurityKey: "Rename security key", deleteSecurityKey: "Delete security key", securityKeys: "Security keys", authenticatorApp: "Authenticator app", authenticatorAppAlreadySetUp: "Authenticator app is set up", authenticatorAppNotSetUp: "Set up authenticator app", trustDevice: "Trust this browser?", deleteIdentity: "Delete connection" }, texts: { enterPasscode: "Enter the passcode sent to your email address.", enterPasscodeNoEmail: "Enter the passcode that was sent to your primary email address.", setupPasskey: "Sign in to your account easily and securely with a passkey. Note: Your biometric data is only stored on your devices and will never be shared with anyone.", createAccount: 'No account exists for "{emailAddress}". Do you want to create a new account?', otpEnterVerificationCode: "Enter the one-time password (OTP) obtained from your authenticator app below:", otpScanQRCode: "Scan the QR code using your authenticator app (such as Google Authenticator or any other TOTP app). Alternatively, you can manually enter the OTP secret key into the app.", otpSecretKey: "OTP secret key", passwordFormatHint: "Must be between {minLength} and {maxLength} characters long.", securityKeySetUp: "Use a dedicated security key via USB, Bluetooth, or NFC, or your mobile phone. Connect or activate your security key, then click the button below and follow the prompts to complete the registration.", setPrimaryEmail: "Set this email address to be used for contacting you.", isPrimaryEmail: "This email address will be used to contact you if necessary.", emailVerified: "This email address has been verified.", emailUnverified: "This email address has not been verified.", emailDelete: "If you delete this email address, it can no longer be used to sign in.", renamePasskey: "Set a name for the passkey.", deletePasskey: "Delete this passkey from your account.", deleteAccount: "Are you sure you want to delete this account? All data will be deleted immediately and cannot be recovered.", noAccountExists: 'No account exists for "{emailAddress}".', selectLoginMethodForFutureLogins: "Select one of the following login methods to use for future logins.", howDoYouWantToLogin: "How do you want to login?", mfaSetUp: "Protect your account with Multi-Factor Authentication (MFA). MFA adds an additional step to your login process, ensuring that even if your password or email account is compromised, your account stays secure.", securityKeyLogin: "Connect or activate your security key, then click the button below. Once ready, use it via USB, NFC, your mobile phone. Follow the prompts to complete the login process.", otpLogin: "Open your authenticator app to obtain the one-time password (OTP). Enter the code in the field below to complete your login.", renameSecurityKey: "Set a name for the security key.", deleteSecurityKey: "Delete this security key from your account.", authenticatorAppAlreadySetUp: "Your account is secured with an authenticator app that generates time-based one-time passwords (TOTP) for multi-factor authentication.", authenticatorAppNotSetUp: "Secure your account with an authenticator app that generates time-based one-time passwords (TOTP) for multi-factor authentication.", trustDevice: "If you trust this browser, you won’t need to enter your OTP (One-Time-Password) or use your security key for multi-factor authentication (MFA) the next time you log in." }, labels: { or: "or", no: "no", yes: "yes", email: "Email", continue: "Continue", copied: "copied", skip: "Skip", save: "Save", password: "Password", passkey: "Passkey", passcode: "Passcode", signInPassword: "Sign in with a password", signInPasscode: "Sign in with a passcode", forgotYourPassword: "Forgot your password?", back: "Back", signInPasskey: "Sign in with a passkey", registerAuthenticator: "Create a passkey", signIn: "Sign in", signUp: "Create account", sendNewPasscode: "Send new code", passwordRetryAfter: "Retry in {passwordRetryAfter}", passcodeResendAfter: "Request a new code in {passcodeResendAfter}", unverifiedEmail: "unverified", primaryEmail: "primary", setAsPrimaryEmail: "Set as primary", verify: "Verify", delete: "Delete", newEmailAddress: "New email address", newPassword: "New password", rename: "Rename", newPasskeyName: "New passkey name", addEmail: "Add email", createPasskey: "Create a passkey", webauthnUnsupported: "Passkeys are not supported by your browser", signInWith: "Continue with {provider}", deleteAccount: "Yes, delete this account.", emailOrUsername: "Email or username", username: "Username", optional: "optional", dontHaveAnAccount: "Don't have an account?", alreadyHaveAnAccount: "Already have an account?", changeUsername: "Change username", setUsername: "Set username", changePassword: "Change password", setPassword: "Set password", revoke: "Revoke", currentSession: "Current session", authenticatorApp: "Authenticator app", securityKey: "Security key", securityKeyUse: "Use security key", newSecurityKeyName: "New security key name", createSecurityKey: "Add a security key", authenticatorAppManage: "Manage authenticator app", authenticatorAppAdd: "Set up", configured: "configured", useAnotherMethod: "Use another method", lastUsed: "Last used", trustDevice: "Trust this browser", staySignedIn: "Stay signed in", connectAccount: "Connect account" }, errors: { somethingWentWrong: "A technical error has occurred. Please try again later.", requestTimeout: "The request timed out.", invalidPassword: "Wrong email or password.", invalidPasscode: "The passcode provided was not correct.", passcodeAttemptsReached: "The passcode was entered incorrectly too many times. Please request a new code.", tooManyRequests: "Too many requests have been made. Please wait to repeat the requested operation.", unauthorized: "Your session has expired. Please log in again.", invalidWebauthnCredential: "This passkey cannot be used anymore.", passcodeExpired: "The passcode has expired. Please request a new one.", userVerification: "User verification required. Please ensure your authenticator device is protected with a PIN or biometric.", emailAddressAlreadyExistsError: "The email address already exists.", maxNumOfEmailAddressesReached: "No further email addresses can be added.", thirdPartyAccessDenied: "Access denied. The request was cancelled by the user or the provider has denied access for other reasons.", thirdPartyMultipleAccounts: "Cannot identify account. The email address is used by multiple accounts.", thirdPartyUnverifiedEmail: "Email verification required. Please verify the used email address with your provider.", signupDisabled: "Account registration is disabled.", handlerNotFoundError: "The current step in your process is not supported by this application version. Please try again later or contact support if the issue persists." }, flowErrors: { technical_error: "A technical error has occurred. Please try again later.", flow_expired_error: "The session has expired, please click the button to restart.", value_invalid_error: "The entered value is invalid.", passcode_invalid: "The passcode provided was not correct.", passkey_invalid: "This passkey cannot be used anymore.", passcode_max_attempts_reached: "The passcode was entered incorrectly too many times. Please request a new code.", rate_limit_exceeded: "Too many requests have been made. Please wait to repeat the requested operation.", unknown_username_error: "The username is unknown.", unknown_email_error: "The email address is unknown.", username_already_exists: "The username is already taken.", invalid_username_error: "The username must contain only letters, numbers, and underscores.", email_already_exists: "The email is already taken.", not_found: "The requested resource was not found.", operation_not_permitted_error: "The operation is not permitted.", flow_discontinuity_error: "The process cannot be continued due to user settings or the provider's configuration.", form_data_invalid_error: "The submitted form data contains errors.", unauthorized: "Your session has expired. Please log in again.", value_missing_error: "The value is missing.", value_too_long_error: "Value is too long.", value_too_short_error: "The value is too short.", webauthn_credential_invalid_mfa_only: "This credential can be used as a second factor security key only.", webauthn_credential_already_exists: "The request either timed out, was canceled or the device is already registered. Please try again or try using another device.", platform_authenticator_required: "Your account is configured to use platform authenticators, but your current device or browser does not support this feature. Please try again with a compatible device or browser.", third_party_access_denied: "Access denied. The request was cancelled by the user or the provider has denied access for other reasons." } }, Cn = Ni.en, ao = {
  headlines: {
    signUp: "Create an account"
  },
  labels: {
    signUp: "Create an account",
    alreadyHaveAnAccount: "Already have a HOT account?",
    signIn: "Sign in here"
  },
  texts: {
    enterPasscode: "Please enter below the passcode we’ve sent to your email address:"
  }
}, ts = {
  headlines: {
    error: "Ha ocurrido un error",
    loginEmail: "Iniciar sesión o crear cuenta",
    loginEmailNoSignup: "Iniciar sesión",
    loginFinished: "Inicio de sesión exitoso",
    loginPasscode: "Ingrese el código de acceso",
    loginPassword: "Ingrese la contraseña",
    registerAuthenticator: "Crear una llave de acceso",
    registerConfirm: "¿Crear cuenta?",
    registerPassword: "Establecer nueva contraseña",
    otpSetUp: "Configurar aplicación de autenticación",
    profileEmails: "Correos electrónicos",
    profilePassword: "Contraseña",
    profilePasskeys: "Llaves de acceso",
    isPrimaryEmail: "Dirección de correo principal",
    setPrimaryEmail: "Establecer correo principal",
    createEmail: "Ingrese un nuevo correo",
    createUsername: "Ingrese un nuevo nombre de usuario",
    emailVerified: "Verificado",
    emailUnverified: "No verificado",
    emailDelete: "Eliminar",
    renamePasskey: "Renombrar llave de acceso",
    deletePasskey: "Eliminar llave de acceso",
    lastUsedAt: "Último uso",
    createdAt: "Creado",
    connectedAccounts: "Cuentas conectadas",
    deleteAccount: "Eliminar cuenta",
    accountNotFound: "Cuenta no encontrada",
    signIn: "Iniciar sesión",
    signUp: "Crear cuenta",
    selectLoginMethod: "Seleccionar método de inicio de sesión",
    setupLoginMethod: "Configurar método de inicio de sesión",
    lastUsed: "Visto por última vez",
    ipAddress: "Dirección IP",
    revokeSession: "Revocar sesión",
    profileSessions: "Sesiones",
    mfaSetUp: "Configurar MFA",
    securityKeySetUp: "Agregar clave de seguridad",
    securityKeyLogin: "Clave de seguridad",
    otpLogin: "Código de autenticación",
    renameSecurityKey: "Renombrar clave de seguridad",
    deleteSecurityKey: "Eliminar clave de seguridad",
    securityKeys: "Claves de seguridad",
    authenticatorApp: "Aplicación de autenticación",
    authenticatorAppAlreadySetUp: "La aplicación de autenticación está configurada",
    authenticatorAppNotSetUp: "Configurar aplicación de autenticación",
    trustDevice: "¿Confiar en este navegador?"
  },
  texts: {
    enterPasscode: "Ingrese el código que se envió a su correo electrónico:",
    enterPasscodeNoEmail: "Ingrese el código que se envió a su dirección de correo principal.",
    setupPasskey: "Inicie sesión en su cuenta fácil y seguramente con una llave de acceso. Nota: Sus datos biométricos solo se almacenan en sus dispositivos y nunca se compartirán con nadie.",
    createAccount: 'No existe una cuenta para "{emailAddress}". ¿Desea crear una nueva cuenta?',
    otpEnterVerificationCode: "Ingrese la contraseña de un solo uso (OTP) obtenida de su aplicación de autenticación a continuación:",
    otpScanQRCode: "Escanee el código QR usando su aplicación de autenticación (como Google Authenticator o cualquier otra aplicación TOTP). Alternativamente, puede ingresar manualmente la clave secreta OTP en la aplicación.",
    otpSecretKey: "Clave secreta OTP",
    passwordFormatHint: "Debe tener entre {minLength} y {maxLength} caracteres.",
    securityKeySetUp: "Use una clave de seguridad dedicada a través de USB, Bluetooth o NFC, o su teléfono móvil. Conecte o active su clave de seguridad, luego haga clic en el botón a continuación y siga las indicaciones para completar el registro.",
    setPrimaryEmail: "Establezca esta dirección de correo para ser usada para contactarlo.",
    isPrimaryEmail: "Esta dirección de correo se utilizará para contactarlo si es necesario.",
    emailVerified: "Esta dirección de correo ha sido verificada.",
    emailUnverified: "Esta dirección de correo no ha sido verificada.",
    emailDelete: "Si elimina esta dirección de correo, ya no podrá usarla para iniciar sesión.",
    renamePasskey: "Establecer un nombre para la llave de acceso.",
    deletePasskey: "Eliminar esta llave de acceso de su cuenta.",
    deleteAccount: "¿Está seguro de que desea eliminar esta cuenta? Todos los datos se eliminarán inmediatamente y no se podrán recuperar.",
    noAccountExists: 'No existe una cuenta para "{emailAddress}".',
    selectLoginMethodForFutureLogins: "Seleccione uno de los siguientes métodos de inicio de sesión para usar en futuros inicios de sesión.",
    howDoYouWantToLogin: "¿Cómo desea iniciar sesión?",
    mfaSetUp: "Proteja su cuenta con autenticación multifactor (MFA). MFA agrega un paso adicional a su proceso de inicio de sesión, asegurando que incluso si su contraseña o cuenta de correo está comprometida, su cuenta permanezca segura.",
    securityKeyLogin: "Conecte o active su clave de seguridad, luego haga clic en el botón a continuación. Una vez listo, úselo a través de USB, NFC o su teléfono móvil. Siga las indicaciones para completar el proceso de inicio de sesión.",
    otpLogin: "Abra su aplicación de autenticación para obtener la contraseña de un solo uso (OTP). Ingrese el código en el campo a continuación para completar su inicio de sesión.",
    renameSecurityKey: "Establecer un nombre para la clave de seguridad.",
    deleteSecurityKey: "Eliminar esta clave de seguridad de su cuenta.",
    authenticatorAppAlreadySetUp: "Su cuenta está protegida con una aplicación de autenticación que genera contraseñas de un solo uso basadas en tiempo (TOTP) para autenticación multifactor.",
    authenticatorAppNotSetUp: "Proteja su cuenta con una aplicación de autenticación que genera contraseñas de un solo uso basadas en tiempo (TOTP) para autenticación multifactor.",
    trustDevice: "Si confía en este navegador, no necesitará ingresar su OTP (contraseña de un solo uso) o usar su clave de seguridad para la autenticación multifactor (MFA) la próxima vez que inicie sesión."
  },
  labels: {
    or: "o",
    no: "no",
    yes: "sí",
    email: "Correo electrónico",
    continue: "Continuar",
    copied: "copiado",
    skip: "Omitir",
    save: "Guardar",
    password: "Contraseña",
    passkey: "Llave de acceso",
    passcode: "Código de acceso",
    signInPassword: "Iniciar sesión con contraseña",
    signInPasscode: "Iniciar sesión con código",
    forgotYourPassword: "¿Olvidó su contraseña?",
    back: "Atrás",
    signInPasskey: "Iniciar sesión con llave de acceso",
    registerAuthenticator: "Crear una llave de acceso",
    signIn: "Iniciar sesión",
    signUp: "Crear cuenta",
    sendNewPasscode: "Enviar nuevo código",
    passwordRetryAfter: "Reintentar en {passwordRetryAfter}",
    passcodeResendAfter: "Solicitar nuevo código en {passcodeResendAfter}",
    unverifiedEmail: "no verificado",
    primaryEmail: "principal",
    setAsPrimaryEmail: "Establecer como principal",
    verify: "Verificar",
    delete: "Eliminar",
    newEmailAddress: "Nueva dirección de correo",
    newPassword: "Nueva contraseña",
    rename: "Renombrar",
    newPasskeyName: "Nuevo nombre de llave de acceso",
    addEmail: "Agregar correo",
    createPasskey: "Crear una llave de acceso",
    webauthnUnsupported: "Las llaves de acceso no son compatibles con su navegador",
    signInWith: "Iniciar sesión con {provider}",
    deleteAccount: "Sí, eliminar esta cuenta.",
    emailOrUsername: "Correo o nombre de usuario",
    username: "Nombre de usuario",
    optional: "opcional",
    dontHaveAnAccount: "¿No tiene una cuenta?",
    alreadyHaveAnAccount: "¿Ya tiene una cuenta?",
    changeUsername: "Cambiar nombre de usuario",
    setUsername: "Establecer nombre de usuario",
    changePassword: "Cambiar contraseña",
    setPassword: "Establecer contraseña",
    revoke: "Revocar",
    currentSession: "Sesión actual",
    authenticatorApp: "Aplicación de autenticación",
    securityKey: "Clave de seguridad",
    securityKeyUse: "Usar clave de seguridad",
    newSecurityKeyName: "Nuevo nombre de clave de seguridad",
    createSecurityKey: "Agregar una clave de seguridad",
    authenticatorAppManage: "Administrar aplicación de autenticación",
    authenticatorAppAdd: "Configurar",
    configured: "configurado",
    useAnotherMethod: "Usar otro método",
    lastUsed: "Último uso",
    trustDevice: "Confiar en este navegador",
    staySignedIn: "Mantener sesión iniciada"
  },
  errors: {
    somethingWentWrong: "Ha ocurrido un error técnico. Por favor, inténtelo de nuevo más tarde.",
    requestTimeout: "La solicitud ha expirado.",
    invalidPassword: "Correo o contraseña incorrectos.",
    invalidPasscode: "El código proporcionado no es correcto.",
    passcodeAttemptsReached: "El código se ha ingresado incorrectamente demasiadas veces. Por favor, solicite un nuevo código.",
    tooManyRequests: "Se han realizado demasiadas solicitudes. Por favor, espere para repetir la operación solicitada.",
    unauthorized: "Su sesión ha expirado. Por favor, inicie sesión nuevamente.",
    invalidWebauthnCredential: "Esta llave de acceso ya no se puede usar.",
    passcodeExpired: "El código ha expirado. Por favor, solicite uno nuevo.",
    userVerification: "Se requiere verificación de usuario. Asegúrese de que su dispositivo de autenticación esté protegido con un PIN o biometría.",
    emailAddressAlreadyExistsError: "La dirección de correo ya existe.",
    maxNumOfEmailAddressesReached: "No se pueden agregar más direcciones de correo.",
    thirdPartyAccessDenied: "Acceso denegado. La solicitud fue cancelada por el usuario o el proveedor ha denegado el acceso por otras razones.",
    thirdPartyMultipleAccounts: "No se puede identificar la cuenta. La dirección de correo es usada por múltiples cuentas.",
    thirdPartyUnverifiedEmail: "Se requiere verificación de correo. Por favor, verifique la dirección de correo usada con su proveedor.",
    signupDisabled: "El registro de cuentas está deshabilitado.",
    handlerNotFoundError: "El paso actual en su proceso no es compatible con esta versión de la aplicación. Inténtelo de nuevo más tarde o contacte al soporte si el problema persiste."
  },
  flowErrors: {
    technical_error: "Ha ocurrido un error técnico. Por favor, inténtelo de nuevo más tarde.",
    flow_expired_error: "La sesión ha expirado, haga clic en el botón para reiniciar.",
    value_invalid_error: "El valor ingresado no es válido.",
    passcode_invalid: "El código proporcionado no es correcto.",
    passkey_invalid: "Esta llave de acceso ya no se puede usar.",
    passcode_max_attempts_reached: "El código se ha ingresado incorrectamente demasiadas veces. Por favor, solicite un nuevo código.",
    rate_limit_exceeded: "Se han realizado demasiadas solicitudes. Por favor, espere para repetir la operación solicitada.",
    unknown_username_error: "El nombre de usuario es desconocido.",
    unknown_email_error: "La dirección de correo es desconocida.",
    username_already_exists: "El nombre de usuario ya está en uso.",
    invalid_username_error: "El nombre de usuario solo debe contener letras, números y guiones bajos.",
    email_already_exists: "El correo ya está en uso.",
    not_found: "No se encontró el recurso solicitado.",
    operation_not_permitted_error: "La operación no está permitida.",
    flow_discontinuity_error: "El proceso no se puede continuar debido a la configuración del usuario o del proveedor.",
    form_data_invalid_error: "Los datos del formulario enviados contienen errores.",
    unauthorized: "Su sesión ha expirado. Por favor, inicie sesión nuevamente.",
    value_missing_error: "Falta el valor.",
    value_too_long_error: "El valor es demasiado largo.",
    value_too_short_error: "El valor es demasiado corto.",
    webauthn_credential_invalid_mfa_only: "Esta credencial solo se puede usar como clave de seguridad de segundo factor.",
    webauthn_credential_already_exists: "La solicitud expiró, se canceló o el dispositivo ya está registrado. Inténtelo de nuevo o intente usar otro dispositivo.",
    platform_authenticator_required: "Su cuenta está configurada para usar autenticadores de plataforma, pero su dispositivo o navegador actual no admite esta función. Inténtelo de nuevo con un dispositivo o navegador compatible.",
    third_party_access_denied: "Acceso denegado por el proveedor de terceros. Por favor, inténtelo de nuevo."
  }
}, ns = {
  headlines: {
    error: "Une erreur s'est produite",
    loginEmail: "Se connecter ou créer un compte",
    loginEmailNoSignup: "Se connecter",
    loginFinished: "Connexion réussie",
    loginPasscode: "Entrez le code d'accès",
    loginPassword: "Entrez le mot de passe",
    registerAuthenticator: "Créer une clé d'accès",
    registerConfirm: "Créer un compte ?",
    registerPassword: "Définir un nouveau mot de passe",
    otpSetUp: "Configurer l'application d'authentification",
    profileEmails: "Adresses e-mail",
    profilePassword: "Mot de passe",
    profilePasskeys: "Clés d'accès",
    isPrimaryEmail: "Adresse e-mail principale",
    setPrimaryEmail: "Définir comme e-mail principal",
    createEmail: "Entrez un nouvel e-mail",
    createUsername: "Entrez un nouveau nom d'utilisateur",
    emailVerified: "Vérifié",
    emailUnverified: "Non vérifié",
    emailDelete: "Supprimer",
    renamePasskey: "Renommer la clé d'accès",
    deletePasskey: "Supprimer la clé d'accès",
    lastUsedAt: "Dernière utilisation",
    createdAt: "Créé",
    connectedAccounts: "Comptes connectés",
    deleteAccount: "Supprimer le compte",
    accountNotFound: "Compte introuvable",
    signIn: "Se connecter",
    signUp: "Créer un compte",
    selectLoginMethod: "Sélectionner la méthode de connexion",
    setupLoginMethod: "Configurer la méthode de connexion",
    lastUsed: "Vu pour la dernière fois",
    ipAddress: "Adresse IP",
    revokeSession: "Révoquer la session",
    profileSessions: "Sessions",
    mfaSetUp: "Configurer MFA",
    securityKeySetUp: "Ajouter une clé de sécurité",
    securityKeyLogin: "Clé de sécurité",
    otpLogin: "Code d'authentification",
    renameSecurityKey: "Renommer la clé de sécurité",
    deleteSecurityKey: "Supprimer la clé de sécurité",
    securityKeys: "Clés de sécurité",
    authenticatorApp: "Application d'authentification",
    authenticatorAppAlreadySetUp: "L'application d'authentification est configurée",
    authenticatorAppNotSetUp: "Configurer l'application d'authentification",
    trustDevice: "Faire confiance à ce navigateur ?"
  },
  texts: {
    enterPasscode: "Entrez le code envoyé à votre adresse e-mail:",
    enterPasscodeNoEmail: "Entrez le code envoyé à votre adresse e-mail principale.",
    setupPasskey: "Connectez-vous à votre compte facilement et en toute sécurité avec une clé d'accès. Remarque : Vos données biométriques ne sont stockées que sur vos appareils et ne seront jamais partagées avec personne.",
    createAccount: `Aucun compte n'existe pour "{emailAddress}". Souhaitez-vous créer un nouveau compte ?`,
    otpEnterVerificationCode: "Entrez le mot de passe à usage unique (OTP) obtenu depuis votre application d'authentification ci-dessous :",
    otpScanQRCode: "Scannez le code QR avec votre application d'authentification (comme Google Authenticator ou toute autre application TOTP). Vous pouvez également saisir manuellement la clé secrète OTP dans l'application.",
    otpSecretKey: "Clé secrète OTP",
    passwordFormatHint: "Doit contenir entre {minLength} et {maxLength} caractères.",
    securityKeySetUp: "Utilisez une clé de sécurité dédiée via USB, Bluetooth ou NFC, ou votre téléphone mobile. Connectez ou activez votre clé de sécurité, puis cliquez sur le bouton ci-dessous et suivez les instructions pour terminer l'inscription.",
    setPrimaryEmail: "Définir cette adresse e-mail pour être utilisée pour vous contacter.",
    isPrimaryEmail: "Cette adresse e-mail sera utilisée pour vous contacter si nécessaire.",
    emailVerified: "Cette adresse e-mail a été vérifiée.",
    emailUnverified: "Cette adresse e-mail n'a pas été vérifiée.",
    emailDelete: "Si vous supprimez cette adresse e-mail, vous ne pourrez plus l'utiliser pour vous connecter.",
    renamePasskey: "Définir un nom pour la clé d'accès.",
    deletePasskey: "Supprimer cette clé d'accès de votre compte.",
    deleteAccount: "Êtes-vous sûr de vouloir supprimer ce compte ? Toutes les données seront supprimées immédiatement et ne pourront pas être récupérées.",
    noAccountExists: `Aucun compte n'existe pour "{emailAddress}".`,
    selectLoginMethodForFutureLogins: "Sélectionnez l'une des méthodes de connexion suivantes à utiliser pour les futures connexions.",
    howDoYouWantToLogin: "Comment souhaitez-vous vous connecter ?",
    mfaSetUp: "Protégez votre compte avec l'authentification multifacteur (MFA). MFA ajoute une étape supplémentaire à votre processus de connexion, garantissant que même si votre mot de passe ou compte e-mail est compromis, votre compte reste sécurisé.",
    securityKeyLogin: "Connectez ou activez votre clé de sécurité, puis cliquez sur le bouton ci-dessous. Une fois prêt, utilisez-la via USB, NFC ou votre téléphone mobile. Suivez les instructions pour terminer le processus de connexion.",
    otpLogin: "Ouvrez votre application d'authentification pour obtenir le mot de passe à usage unique (OTP). Entrez le code dans le champ ci-dessous pour terminer votre connexion.",
    renameSecurityKey: "Définir un nom pour la clé de sécurité.",
    deleteSecurityKey: "Supprimer cette clé de sécurité de votre compte.",
    authenticatorAppAlreadySetUp: "Votre compte est protégé par une application d'authentification qui génère des mots de passe à usage unique basés sur le temps (TOTP) pour l'authentification multifacteur.",
    authenticatorAppNotSetUp: "Protégez votre compte avec une application d'authentification qui génère des mots de passe à usage unique basés sur le temps (TOTP) pour l'authentification multifacteur.",
    trustDevice: "Si vous faites confiance à ce navigateur, vous n'aurez pas besoin de saisir votre OTP (mot de passe à usage unique) ou d'utiliser votre clé de sécurité pour l'authentification multifacteur (MFA) la prochaine fois que vous vous connecterez."
  },
  labels: {
    or: "ou",
    no: "non",
    yes: "oui",
    email: "E-mail",
    continue: "Continuer",
    copied: "copié",
    skip: "Ignorer",
    save: "Enregistrer",
    password: "Mot de passe",
    passkey: "Clé d'accès",
    passcode: "Code d'accès",
    signInPassword: "Se connecter avec mot de passe",
    signInPasscode: "Se connecter avec code",
    forgotYourPassword: "Mot de passe oublié ?",
    back: "Retour",
    signInPasskey: "Se connecter avec clé d'accès",
    registerAuthenticator: "Créer une clé d'accès",
    signIn: "Se connecter",
    signUp: "Créer un compte",
    sendNewPasscode: "Envoyer un nouveau code",
    passwordRetryAfter: "Réessayer dans {passwordRetryAfter}",
    passcodeResendAfter: "Demander un nouveau code dans {passcodeResendAfter}",
    unverifiedEmail: "non vérifié",
    primaryEmail: "principal",
    setAsPrimaryEmail: "Définir comme principal",
    verify: "Vérifier",
    delete: "Supprimer",
    newEmailAddress: "Nouvelle adresse e-mail",
    newPassword: "Nouveau mot de passe",
    rename: "Renommer",
    newPasskeyName: "Nouveau nom de clé d'accès",
    addEmail: "Ajouter un e-mail",
    createPasskey: "Créer une clé d'accès",
    webauthnUnsupported: "Les clés d'accès ne sont pas compatibles avec votre navigateur",
    signInWith: "Se connecter avec {provider}",
    deleteAccount: "Oui, supprimer ce compte.",
    emailOrUsername: "E-mail ou nom d'utilisateur",
    username: "Nom d'utilisateur",
    optional: "optionnel",
    dontHaveAnAccount: "Vous n'avez pas de compte ?",
    alreadyHaveAnAccount: "Vous avez déjà un compte ?",
    changeUsername: "Changer le nom d'utilisateur",
    setUsername: "Définir le nom d'utilisateur",
    changePassword: "Changer le mot de passe",
    setPassword: "Définir le mot de passe",
    revoke: "Révoquer",
    currentSession: "Session actuelle",
    authenticatorApp: "Application d'authentification",
    securityKey: "Clé de sécurité",
    securityKeyUse: "Utiliser la clé de sécurité",
    newSecurityKeyName: "Nouveau nom de clé de sécurité",
    createSecurityKey: "Ajouter une clé de sécurité",
    authenticatorAppManage: "Gérer l'application d'authentification",
    authenticatorAppAdd: "Configurer",
    configured: "configuré",
    useAnotherMethod: "Utiliser une autre méthode",
    lastUsed: "Dernière utilisation",
    trustDevice: "Faire confiance à ce navigateur",
    staySignedIn: "Rester connecté"
  },
  errors: {
    somethingWentWrong: "Une erreur technique s'est produite. Veuillez réessayer plus tard.",
    requestTimeout: "La demande a expiré.",
    invalidPassword: "E-mail ou mot de passe incorrect.",
    invalidPasscode: "Le code fourni n'est pas correct.",
    passcodeAttemptsReached: "Le code a été saisi incorrectement trop de fois. Veuillez demander un nouveau code.",
    tooManyRequests: "Trop de demandes ont été effectuées. Veuillez attendre avant de répéter l'opération demandée.",
    unauthorized: "Votre session a expiré. Veuillez vous reconnecter.",
    invalidWebauthnCredential: "Cette clé d'accès ne peut plus être utilisée.",
    passcodeExpired: "Le code a expiré. Veuillez en demander un nouveau.",
    userVerification: "Une vérification de l'utilisateur est requise. Assurez-vous que votre dispositif d'authentification est protégé par un code PIN ou une biométrie.",
    emailAddressAlreadyExistsError: "L'adresse e-mail existe déjà.",
    maxNumOfEmailAddressesReached: "Impossible d'ajouter plus d'adresses e-mail.",
    thirdPartyAccessDenied: "Accès refusé. La demande a été annulée par l'utilisateur ou le fournisseur a refusé l'accès pour d'autres raisons.",
    thirdPartyMultipleAccounts: "Impossible d'identifier le compte. L'adresse e-mail est utilisée par plusieurs comptes.",
    thirdPartyUnverifiedEmail: "Une vérification de l'e-mail est requise. Veuillez vérifier l'adresse e-mail utilisée avec votre fournisseur.",
    signupDisabled: "L'inscription de comptes est désactivée.",
    handlerNotFoundError: "L'étape actuelle de votre processus n'est pas compatible avec cette version de l'application. Réessayez plus tard ou contactez le support si le problème persiste."
  },
  flowErrors: {
    technical_error: "Une erreur technique s'est produite. Veuillez réessayer plus tard.",
    flow_expired_error: "La session a expiré, cliquez sur le bouton pour redémarrer.",
    value_invalid_error: "La valeur saisie n'est pas valide.",
    passcode_invalid: "Le code fourni n'est pas correct.",
    passkey_invalid: "Cette clé d'accès ne peut plus être utilisée.",
    passcode_max_attempts_reached: "Le code a été saisi incorrectement trop de fois. Veuillez demander un nouveau code.",
    rate_limit_exceeded: "Trop de demandes ont été effectuées. Veuillez attendre avant de répéter l'opération demandée.",
    unknown_username_error: "Le nom d'utilisateur est inconnu.",
    unknown_email_error: "L'adresse e-mail est inconnue.",
    username_already_exists: "Le nom d'utilisateur est déjà utilisé.",
    invalid_username_error: "Le nom d'utilisateur ne doit contenir que des lettres, des chiffres et des traits de soulignement.",
    email_already_exists: "L'e-mail est déjà utilisé.",
    not_found: "La ressource demandée n'a pas été trouvée.",
    operation_not_permitted_error: "L'opération n'est pas autorisée.",
    flow_discontinuity_error: "Le processus ne peut pas continuer en raison de la configuration de l'utilisateur ou du fournisseur.",
    form_data_invalid_error: "Les données du formulaire soumises contiennent des erreurs.",
    unauthorized: "Votre session a expiré. Veuillez vous reconnecter.",
    value_missing_error: "La valeur est manquante.",
    value_too_long_error: "La valeur est trop longue.",
    value_too_short_error: "La valeur est trop courte.",
    webauthn_credential_invalid_mfa_only: "Cette credential ne peut être utilisée que comme clé de sécurité de second facteur.",
    webauthn_credential_already_exists: "La demande a expiré, a été annulée ou l'appareil est déjà enregistré. Réessayez ou essayez d'utiliser un autre appareil.",
    platform_authenticator_required: "Votre compte est configuré pour utiliser des authentificateurs de plateforme, mais votre appareil ou navigateur actuel ne prend pas en charge cette fonctionnalité. Réessayez avec un appareil ou navigateur compatible.",
    third_party_access_denied: "Accès refusé par le fournisseur tiers. Veuillez réessayer."
  }
}, os = {
  headlines: {
    error: "Ocorreu um erro",
    loginEmail: "Entrar ou criar conta",
    loginEmailNoSignup: "Entrar",
    loginFinished: "Login bem-sucedido",
    loginPasscode: "Digite o código de acesso",
    loginPassword: "Digite a senha",
    registerAuthenticator: "Criar uma chave de acesso",
    registerConfirm: "Criar conta?",
    registerPassword: "Definir nova senha",
    otpSetUp: "Configurar aplicativo de autenticação",
    profileEmails: "Endereços de e-mail",
    profilePassword: "Senha",
    profilePasskeys: "Chaves de acesso",
    isPrimaryEmail: "Endereço de e-mail principal",
    setPrimaryEmail: "Definir e-mail principal",
    createEmail: "Digite um novo e-mail",
    createUsername: "Digite um novo nome de usuário",
    emailVerified: "Verificado",
    emailUnverified: "Não verificado",
    emailDelete: "Excluir",
    renamePasskey: "Renomear chave de acesso",
    deletePasskey: "Excluir chave de acesso",
    lastUsedAt: "Último uso",
    createdAt: "Criado",
    connectedAccounts: "Contas conectadas",
    deleteAccount: "Excluir conta",
    accountNotFound: "Conta não encontrada",
    signIn: "Entrar",
    signUp: "Criar conta",
    selectLoginMethod: "Selecionar método de login",
    setupLoginMethod: "Configurar método de login",
    lastUsed: "Visto pela última vez",
    ipAddress: "Endereço IP",
    revokeSession: "Revogar sessão",
    profileSessions: "Sessões",
    mfaSetUp: "Configurar MFA",
    securityKeySetUp: "Adicionar chave de segurança",
    securityKeyLogin: "Chave de segurança",
    otpLogin: "Código de autenticação",
    renameSecurityKey: "Renomear chave de segurança",
    deleteSecurityKey: "Excluir chave de segurança",
    securityKeys: "Chaves de segurança",
    authenticatorApp: "Aplicativo de autenticação",
    authenticatorAppAlreadySetUp: "O aplicativo de autenticação está configurado",
    authenticatorAppNotSetUp: "Configurar aplicativo de autenticação",
    trustDevice: "Confiar neste navegador?"
  },
  texts: {
    enterPasscode: "Digite o código enviado para o seu endereço de e-mail:",
    enterPasscodeNoEmail: "Digite o código enviado para seu endereço de e-mail principal.",
    setupPasskey: "Faça login na sua conta de forma fácil e segura com uma chave de acesso. Nota: Seus dados biométricos são armazenados apenas em seus dispositivos e nunca serão compartilhados com ninguém.",
    createAccount: 'Não existe uma conta para "{emailAddress}". Deseja criar uma nova conta?',
    otpEnterVerificationCode: "Digite a senha de uso único (OTP) obtida do seu aplicativo de autenticação abaixo:",
    otpScanQRCode: "Digitalize o código QR usando seu aplicativo de autenticação (como Google Authenticator ou qualquer outro aplicativo TOTP). Alternativamente, você pode inserir manualmente a chave secreta OTP no aplicativo.",
    otpSecretKey: "Chave secreta OTP",
    passwordFormatHint: "Deve ter entre {minLength} e {maxLength} caracteres.",
    securityKeySetUp: "Use uma chave de segurança dedicada via USB, Bluetooth ou NFC, ou seu telefone celular. Conecte ou ative sua chave de segurança, depois clique no botão abaixo e siga as instruções para concluir o registro.",
    setPrimaryEmail: "Defina este endereço de e-mail para ser usado para entrar em contato com você.",
    isPrimaryEmail: "Este endereço de e-mail será usado para entrar em contato com você, se necessário.",
    emailVerified: "Este endereço de e-mail foi verificado.",
    emailUnverified: "Este endereço de e-mail não foi verificado.",
    emailDelete: "Se você excluir este endereço de e-mail, não poderá mais usá-lo para fazer login.",
    renamePasskey: "Definir um nome para a chave de acesso.",
    deletePasskey: "Excluir esta chave de acesso da sua conta.",
    deleteAccount: "Tem certeza de que deseja excluir esta conta? Todos os dados serão excluídos imediatamente e não poderão ser recuperados.",
    noAccountExists: 'Não existe uma conta para "{emailAddress}".',
    selectLoginMethodForFutureLogins: "Selecione um dos seguintes métodos de login para usar em futuros logins.",
    howDoYouWantToLogin: "Como você deseja fazer login?",
    mfaSetUp: "Proteja sua conta com autenticação multifator (MFA). MFA adiciona uma etapa extra ao seu processo de login, garantindo que, mesmo se sua senha ou conta de e-mail for comprometida, sua conta permaneça segura.",
    securityKeyLogin: "Conecte ou ative sua chave de segurança, depois clique no botão abaixo. Uma vez pronto, use-a via USB, NFC ou seu telefone celular. Siga as instruções para concluir o processo de login.",
    otpLogin: "Abra seu aplicativo de autenticação para obter a senha de uso único (OTP). Digite o código no campo abaixo para concluir seu login.",
    renameSecurityKey: "Definir um nome para a chave de segurança.",
    deleteSecurityKey: "Excluir esta chave de segurança da sua conta.",
    authenticatorAppAlreadySetUp: "Sua conta está protegida com um aplicativo de autenticação que gera senhas de uso único baseadas em tempo (TOTP) para autenticação multifator.",
    authenticatorAppNotSetUp: "Proteja sua conta com um aplicativo de autenticação que gera senhas de uso único baseadas em tempo (TOTP) para autenticação multifator.",
    trustDevice: "Se você confiar neste navegador, não precisará inserir seu OTP (senha de uso único) ou usar sua chave de segurança para autenticação multifator (MFA) na próxima vez que fizer login."
  },
  labels: {
    or: "ou",
    no: "não",
    yes: "sim",
    email: "E-mail",
    continue: "Continuar",
    copied: "copiado",
    skip: "Pular",
    save: "Salvar",
    password: "Senha",
    passkey: "Chave de acesso",
    passcode: "Código de acesso",
    signInPassword: "Entrar com senha",
    signInPasscode: "Entrar com código",
    forgotYourPassword: "Esqueceu sua senha?",
    back: "Voltar",
    signInPasskey: "Entrar com chave de acesso",
    registerAuthenticator: "Criar uma chave de acesso",
    signIn: "Entrar",
    signUp: "Criar conta",
    sendNewPasscode: "Enviar novo código",
    passwordRetryAfter: "Tentar novamente em {passwordRetryAfter}",
    passcodeResendAfter: "Solicitar novo código em {passcodeResendAfter}",
    unverifiedEmail: "não verificado",
    primaryEmail: "principal",
    setAsPrimaryEmail: "Definir como principal",
    verify: "Verificar",
    delete: "Excluir",
    newEmailAddress: "Novo endereço de e-mail",
    newPassword: "Nova senha",
    rename: "Renomear",
    newPasskeyName: "Novo nome de chave de acesso",
    addEmail: "Adicionar e-mail",
    createPasskey: "Criar uma chave de acesso",
    webauthnUnsupported: "As chaves de acesso não são compatíveis com seu navegador",
    signInWith: "Entrar com {provider}",
    deleteAccount: "Sim, excluir esta conta.",
    emailOrUsername: "E-mail ou nome de usuário",
    username: "Nome de usuário",
    optional: "opcional",
    dontHaveAnAccount: "Não tem uma conta?",
    alreadyHaveAnAccount: "Já tem uma conta?",
    changeUsername: "Alterar nome de usuário",
    setUsername: "Definir nome de usuário",
    changePassword: "Alterar senha",
    setPassword: "Definir senha",
    revoke: "Revogar",
    currentSession: "Sessão atual",
    authenticatorApp: "Aplicativo de autenticação",
    securityKey: "Chave de segurança",
    securityKeyUse: "Usar chave de segurança",
    newSecurityKeyName: "Novo nome de chave de segurança",
    createSecurityKey: "Adicionar uma chave de segurança",
    authenticatorAppManage: "Gerenciar aplicativo de autenticação",
    authenticatorAppAdd: "Configurar",
    configured: "configurado",
    useAnotherMethod: "Usar outro método",
    lastUsed: "Último uso",
    trustDevice: "Confiar neste navegador",
    staySignedIn: "Permanecer conectado"
  },
  errors: {
    somethingWentWrong: "Ocorreu um erro técnico. Por favor, tente novamente mais tarde.",
    requestTimeout: "A solicitação expirou.",
    invalidPassword: "E-mail ou senha incorretos.",
    invalidPasscode: "O código fornecido não está correto.",
    passcodeAttemptsReached: "O código foi inserido incorretamente muitas vezes. Por favor, solicite um novo código.",
    tooManyRequests: "Muitas solicitações foram feitas. Por favor, aguarde antes de repetir a operação solicitada.",
    unauthorized: "Sua sessão expirou. Por favor, faça login novamente.",
    invalidWebauthnCredential: "Esta chave de acesso não pode mais ser usada.",
    passcodeExpired: "O código expirou. Por favor, solicite um novo.",
    userVerification: "É necessária verificação do usuário. Certifique-se de que seu dispositivo de autenticação esteja protegido com um PIN ou biometria.",
    emailAddressAlreadyExistsError: "O endereço de e-mail já existe.",
    maxNumOfEmailAddressesReached: "Não é possível adicionar mais endereços de e-mail.",
    thirdPartyAccessDenied: "Acesso negado. A solicitação foi cancelada pelo usuário ou o provedor negou o acesso por outros motivos.",
    thirdPartyMultipleAccounts: "Não é possível identificar a conta. O endereço de e-mail é usado por várias contas.",
    thirdPartyUnverifiedEmail: "É necessária verificação de e-mail. Por favor, verifique o endereço de e-mail usado com seu provedor.",
    signupDisabled: "O registro de contas está desativado.",
    handlerNotFoundError: "A etapa atual em seu processo não é compatível com esta versão do aplicativo. Tente novamente mais tarde ou entre em contato com o suporte se o problema persistir."
  },
  flowErrors: {
    technical_error: "Ocorreu um erro técnico. Por favor, tente novamente mais tarde.",
    flow_expired_error: "A sessão expirou, clique no botão para reiniciar.",
    value_invalid_error: "O valor inserido não é válido.",
    passcode_invalid: "O código fornecido não está correto.",
    passkey_invalid: "Esta chave de acesso não pode mais ser usada.",
    passcode_max_attempts_reached: "O código foi inserido incorretamente muitas vezes. Por favor, solicite um novo código.",
    rate_limit_exceeded: "Muitas solicitações foram feitas. Por favor, aguarde antes de repetir a operação solicitada.",
    unknown_username_error: "O nome de usuário é desconhecido.",
    unknown_email_error: "O endereço de e-mail é desconhecido.",
    username_already_exists: "O nome de usuário já está em uso.",
    invalid_username_error: "O nome de usuário deve conter apenas letras, números e sublinhados.",
    email_already_exists: "O e-mail já está em uso.",
    not_found: "O recurso solicitado não foi encontrado.",
    operation_not_permitted_error: "A operação não é permitida.",
    flow_discontinuity_error: "O processo não pode continuar devido à configuração do usuário ou do provedor.",
    form_data_invalid_error: "Os dados do formulário enviados contêm erros.",
    unauthorized: "Sua sessão expirou. Por favor, faça login novamente.",
    value_missing_error: "O valor está faltando.",
    value_too_long_error: "O valor é muito longo.",
    value_too_short_error: "O valor é muito curto.",
    webauthn_credential_invalid_mfa_only: "Esta credencial só pode ser usada como chave de segurança de segundo fator.",
    webauthn_credential_already_exists: "A solicitação expirou, foi cancelada ou o dispositivo já está registrado. Tente novamente ou tente usar outro dispositivo.",
    platform_authenticator_required: "Sua conta está configurada para usar autenticadores de plataforma, mas seu dispositivo ou navegador atual não suporta esse recurso. Tente novamente com um dispositivo ou navegador compatível.",
    third_party_access_denied: "Acesso negado pelo provedor de terceiros. Por favor, tente novamente."
  }
};
Object.assign(Cn.headlines, ao.headlines);
Object.assign(Cn.labels, ao.labels);
Object.assign(Cn.texts, ao.texts);
function is() {
  return { en: Cn, es: ts, fr: ns, pt: os };
}
const Nn = {
  en: {
    logIn: "Log in",
    logOut: "Log Out",
    myHotAccount: "My HOT Account",
    connectToOsm: "Connect to OSM",
    connectedToOsm: "Connected to OSM",
    connectedToOpenStreetMap: "Connected to OpenStreetMap",
    connectingToOpenStreetMap: "Connecting to OpenStreetMap...",
    checkingOsmConnection: "Checking OSM connection...",
    osmRequired: "OSM Required",
    osmRequiredText: "This endpoint requires OSM connection.",
    connectOsmAccount: "Connect OSM Account",
    openAccountMenu: "Open account menu",
    connectedToOsmAs: "Connected to OSM as",
    osmConnectionRequired: "OSM connection required",
    signUpSubtitle: "Access all HOT tools and services",
    loginSubtitle: "With your HOT account"
  },
  es: {
    logIn: "Iniciar sesión",
    logOut: "Cerrar sesión",
    myHotAccount: "Mi cuenta HOT",
    connectToOsm: "Conectar a OSM",
    connectedToOsm: "Conectado a OSM",
    connectedToOpenStreetMap: "Conectado a OpenStreetMap",
    connectingToOpenStreetMap: "Conectando a OpenStreetMap...",
    checkingOsmConnection: "Verificando conexión OSM...",
    osmRequired: "OSM Requerido",
    osmRequiredText: "Este endpoint requiere conexión OSM.",
    connectOsmAccount: "Conectar cuenta OSM",
    openAccountMenu: "Abrir menú de cuenta",
    connectedToOsmAs: "Conectado a OSM como",
    osmConnectionRequired: "Se requiere conexión OSM",
    signUpSubtitle: "Accede a todas las herramientas y servicios de HOT",
    loginSubtitle: "Con tu cuenta HOT"
  },
  fr: {
    logIn: "Se connecter",
    logOut: "Se déconnecter",
    myHotAccount: "Mon compte HOT",
    connectToOsm: "Connecter à OSM",
    connectedToOsm: "Connecté à OSM",
    connectedToOpenStreetMap: "Connecté à OpenStreetMap",
    connectingToOpenStreetMap: "Connexion à OpenStreetMap...",
    checkingOsmConnection: "Vérification de la connexion OSM...",
    osmRequired: "OSM requis",
    osmRequiredText: "Ce point de terminaison nécessite une connexion OSM.",
    connectOsmAccount: "Connecter le compte OSM",
    openAccountMenu: "Ouvrir le menu du compte",
    connectedToOsmAs: "Connecté à OSM en tant que",
    osmConnectionRequired: "Connexion OSM requise",
    signUpSubtitle: "Accédez à tous les outils et services HOT",
    loginSubtitle: "Avec votre compte HOT"
  },
  pt: {
    logIn: "Entrar",
    logOut: "Sair",
    myHotAccount: "Minha conta HOT",
    connectToOsm: "Conectar ao OSM",
    connectedToOsm: "Conectado ao OSM",
    connectedToOpenStreetMap: "Conectado ao OpenStreetMap",
    connectingToOpenStreetMap: "Conectando ao OpenStreetMap...",
    checkingOsmConnection: "Verificando conexão OSM...",
    osmRequired: "OSM Necessário",
    osmRequiredText: "Este endpoint requer conexão OSM.",
    connectOsmAccount: "Conectar conta OSM",
    openAccountMenu: "Abrir menu da conta",
    connectedToOsmAs: "Conectado ao OSM como",
    osmConnectionRequired: "Conexão OSM necessária",
    signUpSubtitle: "Acesse todas as ferramentas e serviços HOT",
    loginSubtitle: "Com a sua conta HOT"
  }
}, Jo = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%20fill='currentColor'%20class='bi%20bi-person-vcard'%20viewBox='0%200%2016%2016'%3e%3cpath%20d='M5%208a2%202%200%201%200%200-4%202%202%200%200%200%200%204m4-2.5a.5.5%200%200%201%20.5-.5h4a.5.5%200%200%201%200%201h-4a.5.5%200%200%201-.5-.5M9%208a.5.5%200%200%201%20.5-.5h4a.5.5%200%200%201%200%201h-4A.5.5%200%200%201%209%208m1%202.5a.5.5%200%200%201%20.5-.5h3a.5.5%200%200%201%200%201h-3a.5.5%200%200%201-.5-.5'/%3e%3cpath%20d='M2%202a2%202%200%200%200-2%202v8a2%202%200%200%200%202%202h12a2%202%200%200%200%202-2V4a2%202%200%200%200-2-2zM1%204a1%201%200%200%201%201-1h12a1%201%200%200%201%201%201v8a1%201%200%200%201-1%201H8.96q.04-.245.04-.5C9%2010.567%207.21%209%205%209c-2.086%200-3.8%201.398-3.984%203.181A1%201%200%200%201%201%2012z'/%3e%3c/svg%3e", Yo = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%20fill='currentColor'%20class='bi%20bi-box-arrow-right'%20viewBox='0%200%2016%2016'%3e%3cpath%20fill-rule='evenodd'%20d='M10%2012.5a.5.5%200%200%201-.5.5h-8a.5.5%200%200%201-.5-.5v-9a.5.5%200%200%201%20.5-.5h8a.5.5%200%200%201%20.5.5v2a.5.5%200%200%200%201%200v-2A1.5%201.5%200%200%200%209.5%202h-8A1.5%201.5%200%200%200%200%203.5v9A1.5%201.5%200%200%200%201.5%2014h8a1.5%201.5%200%200%200%201.5-1.5v-2a.5.5%200%200%200-1%200z'/%3e%3cpath%20fill-rule='evenodd'%20d='M15.854%208.354a.5.5%200%200%200%200-.708l-3-3a.5.5%200%200%200-.708.708L14.293%207.5H5.5a.5.5%200%200%200%200%201h8.793l-2.147%202.146a.5.5%200%200%200%20.708.708z'/%3e%3c/svg%3e", Qo = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%20fill='currentColor'%20class='bi%20bi-map'%20viewBox='0%200%2016%2016'%3e%3cpath%20fill-rule='evenodd'%20d='M15.817.113A.5.5%200%200%201%2016%20.5v14a.5.5%200%200%201-.402.49l-5%201a.5.5%200%200%201-.196%200L5.5%2015.01l-4.902.98A.5.5%200%200%201%200%2015.5v-14a.5.5%200%200%201%20.402-.49l5-1a.5.5%200%200%201%20.196%200L10.5.99l4.902-.98a.5.5%200%200%201%20.415.103M10%201.91l-4-.8v12.98l4%20.8zm1%2012.98%204-.8V1.11l-4%20.8zm-6-.8V1.11l-4%20.8v12.98z'/%3e%3c/svg%3e", Go = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%20fill='currentColor'%20class='bi%20bi-person-check'%20viewBox='0%200%2016%2016'%3e%3cpath%20d='M12.5%2016a3.5%203.5%200%201%200%200-7%203.5%203.5%200%200%200%200%207m1.679-4.493-1.335%202.226a.75.75%200%200%201-1.174.144l-.774-.773a.5.5%200%200%201%20.708-.708l.547.548%201.17-1.951a.5.5%200%201%201%20.858.514M11%205a3%203%200%201%201-6%200%203%203%200%200%201%206%200M8%207a2%202%200%201%200%200-4%202%202%200%200%200%200%204'/%3e%3cpath%20d='M8.256%2014a4.5%204.5%200%200%201-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484%2010.68%205.711%2010%208%2010q.39%200%20.74.025c.226-.341.496-.65.804-.918Q8.844%209.002%208%209c-5%200-6%203-6%204s1%201%201%201z'/%3e%3c/svg%3e", as = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%20fill='currentColor'%20class='bi%20bi-chevron-down'%20viewBox='0%200%2016%2016'%3e%3cpath%20fill-rule='evenodd'%20d='M1.646%204.646a.5.5%200%200%201%20.708%200L8%2010.293l5.646-5.647a.5.5%200%200%201%20.708.708l-6%206a.5.5%200%200%201-.708%200l-6-6a.5.5%200%200%201%200-.708'/%3e%3c/svg%3e", rs = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%20fill='currentColor'%20class='bi%20bi-chevron-up'%20viewBox='0%200%2016%2016'%3e%3cpath%20fill-rule='evenodd'%20d='M7.646%204.646a.5.5%200%200%201%20.708%200l6%206a.5.5%200%200%201-.708.708L8%205.707l-5.646%205.647a.5.5%200%200%201-.708-.708z'/%3e%3c/svg%3e";
var ss = Object.defineProperty, cs = Object.getOwnPropertyDescriptor, ae = (n, t, e, o) => {
  for (var i = o > 1 ? void 0 : o ? cs(t, e) : t, r = n.length - 1, s; r >= 0; r--)
    (s = n[r]) && (i = (o ? s(t, e, i) : s(i)) || i);
  return o && i && ss(t, e, i), i;
};
let Xo = !1, Lt = null;
async function ls(n) {
  if (!Xo)
    return Lt || (Lt = (async () => {
      console.log("[hanko-auth] Pre-registering Hanko translations...");
      try {
        await Li(n, {
          enablePasskeys: !1,
          hidePasskeyButtonOnLogin: !0,
          translations: is(),
          fallbackLanguage: "en"
        }), Xo = !0, console.log("[hanko-auth] Hanko registration complete");
      } catch (t) {
        throw console.error("[hanko-auth] Hanko registration failed:", t), Lt = null, t;
      }
    })(), Lt);
}
const Y = {
  primary: null,
  // The primary instance that makes API calls
  user: null,
  osmConnected: !1,
  osmData: null,
  loading: !0,
  hanko: null,
  initialized: !1,
  instances: /* @__PURE__ */ new Set(),
  profileDisplayName: "",
  // Shared profile display name
  profilePictureUrl: "",
  // Shared profile picture URL
  hankoReady: !1
  // used for translations
}, ei = (n) => `hanko-verified-${n}`, ti = (n) => `hanko-onboarding-${n}`;
let oe = class extends zt {
  constructor() {
    super(), this.hankoUrlAttr = "", this.basePath = "", this.authPath = "/api/auth/osm", this.osmRequired = !1, this.osmScopes = "read_prefs", this.showProfile = !1, this.redirectAfterLogin = "", this.autoConnect = !1, this.verifySession = !1, this.redirectAfterLogout = "", this.displayNameAttr = "", this.mappingCheckUrl = "", this.appId = "", this.loginUrl = "", this.lang = "en", this.buttonVariant = "plain", this.buttonColor = "primary", this.display = "default", this.user = null, this.osmConnected = !1, this.osmData = null, this.osmLoading = !1, this.loading = !0, this.error = null, this.hankoReady = !1, this.profileDisplayName = "", this.profilePictureUrl = "", this.hasAppMapping = !1, this.userProfileLanguage = null, this.isOpen = !1, this.handleOutsideClick = (n) => {
      this.contains(n.target) || this.closeDropdown();
    }, this._debugMode = !1, this._lastSessionId = null, this._hanko = null, this._isPrimary = !1, this._hankoObserver = null, this._signUpHeadlines = /* @__PURE__ */ new Set([
      "Create an account",
      // en (our override)
      "Crear cuenta",
      // es
      "Créer un compte",
      // fr
      "Criar conta"
      // pt
    ]), this._loginHeadlines = /* @__PURE__ */ new Set([
      "Sign in or create account",
      // en loginEmail
      "Sign in",
      // en loginEmailNoSignup
      "Iniciar sesión o crear cuenta",
      // es loginEmail
      "Iniciar sesión",
      // es loginEmailNoSignup
      "Se connecter ou s'inscrire",
      // fr loginEmail
      "Se connecter",
      // fr loginEmailNoSignup
      "Entrar ou criar conta",
      // pt loginEmail
      "Entrar"
      // pt loginEmailNoSignup
    ]), this._handleVisibilityChange = () => {
      this._isPrimary && !document.hidden && !this.showProfile && !this.user && (this.log("Page visible, re-checking session..."), this.checkSession());
    }, this._handleWindowFocus = () => {
      this._isPrimary && !this.showProfile && !this.user && (this.log("Window focused, re-checking session..."), this.checkSession());
    }, this._handleExternalLogin = (n) => {
      var e;
      if (!this._isPrimary) return;
      const t = n;
      !this.showProfile && !this.user && ((e = t.detail) != null && e.user) && (this.log("External login detected, updating user state..."), this.user = t.detail.user, this._broadcastState(), this.osmRequired && this.checkOSMConnection());
    }, this._currentHankoAuthElement = null;
    try {
      const n = localStorage.getItem("hotosm-auth-user");
      if (n) {
        const t = JSON.parse(n);
        this.user = t, this.loading = !1, t.avatarUrl && (this.profilePictureUrl = t.avatarUrl);
      }
    } catch {
    }
  }
  toggleDropdown() {
    this.isOpen = !this.isOpen, this.isOpen ? setTimeout(() => {
      document.addEventListener("click", this.handleOutsideClick);
    }, 0) : document.removeEventListener("click", this.handleOutsideClick);
  }
  closeDropdown() {
    this.isOpen = !1, document.removeEventListener("click", this.handleOutsideClick);
  }
  /** Dropdown menu content for bar display mode (no email, only action links) */
  renderBarDropdownContent() {
    var n;
    return ve`
      <div class="dropdown-content ${this.isOpen ? "open" : ""}">
        <button data-action="profile" @click=${this.handleDropdownSelect}>
          <img src="${Jo}" class="icon" alt="Account icon" />
          ${this.t("myHotAccount")}
        </button>
        ${this.osmRequired ? this.osmConnected ? ve`
                <button class="osm-connected" disabled>
                  <img src="${Go}" alt="Check icon" class="icon" />
                  ${this.t("connectedToOsm")} (@${(n = this.osmData) == null ? void 0 : n.osm_username})
                </button>
              ` : ve`
                <button
                  data-action="connect-osm"
                  @click=${this.handleDropdownSelect}
                >
                  <img src="${Qo}" alt="Check icon" class="icon" />
                  ${this.t("connectToOsm")}
                </button>
              ` : ""}
        <button data-action="logout" @click=${this.handleDropdownSelect}>
          <img src="${Yo}" alt="Log out icon" class="icon" />
          ${this.t("logOut")}
        </button>
      </div>
    `;
  }
  // Get computed hankoUrl (priority: attribute > meta tag > window.HANKO_URL > origin)
  get hankoUrl() {
    if (this.hankoUrlAttr)
      return this.hankoUrlAttr;
    const n = document.querySelector('meta[name="hanko-url"]');
    if (n) {
      const e = n.getAttribute("content");
      if (e)
        return this.log("hanko-url auto-detected from <meta> tag:", e), e;
    }
    if (window.HANKO_URL)
      return this.log(
        "hanko-url auto-detected from window.HANKO_URL:",
        window.HANKO_URL
      ), window.HANKO_URL;
    const t = window.location.origin;
    return this.log("hanko-url auto-detected from window.location.origin:", t), t;
  }
  connectedCallback() {
    super.connectedCallback(), this._debugMode = this._checkDebugMode(), this.log("hanko-auth connectedCallback called"), this.injectHotStyles(), Y.instances.add(this), document.addEventListener("visibilitychange", this._handleVisibilityChange), window.addEventListener("focus", this._handleWindowFocus), document.addEventListener("hanko-login", this._handleExternalLogin);
  }
  // Use firstUpdated instead of connectedCallback to ensure React props are set
  firstUpdated() {
    this.log("hanko-auth firstUpdated called"), this.log("  hankoUrl:", this.hankoUrl), this.log("  basePath:", this.basePath), Y.initialized || Y.primary ? (this.log("Using shared state from primary instance"), this._syncFromShared(), this._isPrimary = !1) : (this.log("This is the primary instance"), this._isPrimary = !0, Y.primary = this, Y.initialized = !0, this.init());
  }
  disconnectedCallback() {
    if (super.disconnectedCallback(), document.removeEventListener(
      "visibilitychange",
      this._handleVisibilityChange
    ), window.removeEventListener("focus", this._handleWindowFocus), document.removeEventListener("hanko-login", this._handleExternalLogin), document.removeEventListener("click", this.handleOutsideClick), Y.instances.delete(this), this._isPrimary && Y.instances.size > 0) {
      const n = Y.instances.values().next().value;
      n && (this.log("Promoting new primary instance"), n._isPrimary = !0, Y.primary = n);
    }
    Y.instances.size === 0 && (Y.initialized = !1, Y.primary = null);
  }
  // Sync local state from shared state (only if values changed to prevent render loops)
  _syncFromShared() {
    this.user !== Y.user && (this.user = Y.user), this.osmConnected !== Y.osmConnected && (this.osmConnected = Y.osmConnected), this.osmData !== Y.osmData && (this.osmData = Y.osmData), this.loading !== Y.loading && (this.loading = Y.loading), this._hanko !== Y.hanko && (this._hanko = Y.hanko), this.profileDisplayName !== Y.profileDisplayName && (this.profileDisplayName = Y.profileDisplayName), this.profilePictureUrl !== Y.profilePictureUrl && (this.profilePictureUrl = Y.profilePictureUrl), this.hankoReady !== Y.hankoReady && (this.hankoReady = Y.hankoReady);
  }
  // Update shared state and broadcast to all instances
  _broadcastState() {
    Y.user = this.user, Y.osmConnected = this.osmConnected, Y.osmData = this.osmData, Y.loading = this.loading, Y.profileDisplayName = this.profileDisplayName, Y.profilePictureUrl = this.profilePictureUrl, Y.hankoReady = this.hankoReady, Y.instances.forEach((n) => {
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
  /* Translations */
  t(n) {
    const t = this.user && this.userProfileLanguage ? this.userProfileLanguage : this.lang;
    return (Nn[t] || Nn.en)[n] || Nn.en[n] || n;
  }
  logError(...n) {
    console.error(...n);
  }
  getBasePath() {
    return this.basePath ? (this.log("getBasePath() using basePath:", this.basePath), this.basePath) : (this.log("getBasePath() using default: empty string"), "");
  }
  // styles injected to ensure global availability
  injectHotStyles() {
    [
      {
        id: "hot-design-system",
        href: "https://cdn.jsdelivr.net/npm/@hotosm/ui-design@latest/dist/hot.css"
      },
      {
        id: "google-font-archivo",
        href: "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&display=swap"
      }
    ].forEach(({ id: t, href: e }) => {
      if (!document.getElementById(t)) {
        const o = document.createElement("link");
        o.rel = "stylesheet", o.href = e, o.id = t, document.head.appendChild(o);
      }
    });
  }
  async init() {
    if (!this._isPrimary) {
      this.log("Not primary, skipping init...");
      return;
    }
    try {
      this.log(
        "Ensuring Hanko is registered with translations for: en, es, fr, pt"
      ), this.log("Current lang prop:", this.lang), await ls(this.hankoUrl), this.hankoReady = !0, this._broadcastState();
      const { Hanko: n } = await Promise.resolve().then(() => Gr), t = window.location.hostname, e = t === "localhost" || t === "127.0.0.1", o = t.split("."), i = o.length >= 2 ? `.${o.slice(-2).join(".")}` : t, r = e ? {} : {
        cookieDomain: i,
        cookieName: "hanko",
        cookieSameSite: "lax"
      };
      this._hanko = new n(this.hankoUrl, r), Y.hanko = this._hanko, this._hanko.onSessionExpired(() => {
        this.log("Hanko session expired event received"), this.handleSessionExpired();
      }), this._hanko.onUserLoggedOut(() => {
        this.log("Hanko user logged out event received"), this.handleUserLoggedOut();
      }), await this.checkSession(), this.user && (this.osmRequired && await this.checkOSMConnection(), await this.fetchProfileDisplayName()), this.loading = !1, this._broadcastState(), this.setupEventListeners();
    } catch (n) {
      this.logError("Failed to initialize hanko-auth:", n), this.error = n.message, this.loading = !1, this._broadcastState();
    }
  }
  async checkSession() {
    var n, t, e, o, i;
    if (this.log("Checking for existing Hanko session..."), !this._hanko) {
      this.log("Hanko instance not initialized yet");
      return;
    }
    try {
      this.log("Checking session validity via cookie...");
      try {
        const r = await fetch(
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
        if (r.ok) {
          const s = await r.json();
          if (s.is_valid === !1) {
            this.log(
              "Session validation returned is_valid:false - no valid session"
            ), this.user && (this.user = null, this.profilePictureUrl = "", this.dispatchEvent(
              new CustomEvent("logout", { bubbles: !0, composed: !0 })
            ));
            return;
          }
          this.log("Valid Hanko session found via cookie"), this.log("Session data:", s);
          try {
            const d = await fetch(`${this.hankoUrl}/me`, {
              method: "GET",
              credentials: "include",
              // Include httpOnly cookies
              headers: {
                "Content-Type": "application/json"
              }
            });
            let u = !0;
            if (d.ok) {
              const c = await d.json();
              this.log("User data retrieved from /me:", c), c.email ? (this.user = {
                id: c.user_id || c.id,
                email: c.email,
                username: c.username || null,
                emailVerified: c.email_verified || c.verified || !1
              }, u = !1) : this.log("/me has no email, will use SDK fallback");
            }
            if (u) {
              this.log("Using SDK to get user with email");
              const c = await this._hanko.getCurrentUser();
              this.user = {
                id: c.user_id,
                email: ((t = (n = c.emails) == null ? void 0 : n[0]) == null ? void 0 : t.address) || null,
                username: ((e = c.username) == null ? void 0 : e.username) || null,
                emailVerified: ((i = (o = c.emails) == null ? void 0 : o[0]) == null ? void 0 : i.is_verified) || !1
              };
            }
          } catch (d) {
            this.log("Failed to get user data:", d), s.user_id && (this.user = {
              id: s.user_id,
              email: s.email || null,
              username: null,
              emailVerified: !1
            });
          }
          if (this.user) {
            const d = ei(window.location.hostname), u = sessionStorage.getItem(d);
            if (this.verifySession && this.redirectAfterLogin && !u) {
              this.log(
                "verify-session enabled, redirecting to callback for app verification..."
              ), sessionStorage.setItem(d, "true"), window.location.href = this.redirectAfterLogin;
              return;
            }
            if (!await this.checkAppMapping())
              return;
            await this.fetchProfileDisplayName(), this.user && this.profilePictureUrl && (this.user = { ...this.user, avatarUrl: this.profilePictureUrl }), this.dispatchEvent(
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
            ), this.osmRequired && await this.checkOSMConnection(), this.osmRequired && this.autoConnect && !this.osmConnected && (this.log("Auto-connecting to OSM (from existing session)..."), this.handleOSMConnect());
          }
        } else
          this.log("No valid session cookie found - user needs to login");
      } catch (r) {
        this.log("Session validation failed:", r), this.log("No valid session - user needs to login");
      }
    } catch (r) {
      this.log("Session check error:", r), this.log("No existing session - user needs to login");
    } finally {
      this._isPrimary && this._broadcastState();
    }
  }
  async checkOSMConnection() {
    if (!this.osmRequired) {
      this.log("OSM not required, skipping connection check");
      return;
    }
    if (this.osmConnected) {
      this.log("Already connected to OSM, skipping check");
      return;
    }
    const n = this.loading;
    n || (this.osmLoading = !0);
    try {
      const t = this.getBasePath(), e = this.authPath, i = `${`${t}${e}/status`}`;
      this.log("Checking OSM connection at:", i), this.log("  basePath:", t), this.log("  authPath:", e), this.log("Current cookies:", document.cookie);
      const r = await fetch(i, {
        credentials: "include",
        redirect: "follow"
      });
      if (this.log("OSM status response:", r.status), this.log("Final URL after redirects:", r.url), this.log("Response headers:", [...r.headers.entries()]), r.ok) {
        const s = await r.text();
        this.log("OSM raw response:", s.substring(0, 200));
        let d;
        try {
          d = JSON.parse(s);
        } catch {
          throw this.logError(
            "Failed to parse OSM response as JSON:",
            s.substring(0, 500)
          ), new Error("Invalid JSON response from OSM status endpoint");
        }
        this.log("OSM status data:", d), d.connected ? (this.log("OSM is connected:", d.osm_username), this.osmConnected = !0, this.osmData = d, this.dispatchEvent(
          new CustomEvent("osm-connected", {
            detail: { osmData: d },
            bubbles: !0,
            composed: !0
          })
        )) : (this.log("OSM is NOT connected"), this.osmConnected = !1, this.osmData = null);
      }
    } catch (t) {
      this.logError("OSM connection check failed:", t);
    } finally {
      n || (this.osmLoading = !1), this._isPrimary && this._broadcastState();
    }
  }
  // Check app mapping status (for cross-app auth scenarios)
  // Only used when mapping-check-url is configured
  async checkAppMapping() {
    if (!this.mappingCheckUrl || !this.user)
      return !0;
    const n = ti(window.location.hostname);
    if (sessionStorage.getItem(n))
      return this.log("Onboarding already completed this session, skipping check"), this.hasAppMapping = !0, !0;
    this.log("Checking app mapping at:", this.mappingCheckUrl);
    try {
      const e = await fetch(this.mappingCheckUrl, {
        credentials: "include"
      });
      if (e.ok) {
        const o = await e.json();
        if (this.log("Mapping check response:", o), o.needs_onboarding) {
          this.log("User needs onboarding, redirecting...");
          const i = encodeURIComponent(window.location.origin), r = this.appId ? `onboarding=${this.appId}` : "";
          return window.location.href = `${this.hankoUrl}/app?${r}&return_to=${i}`, !1;
        }
        return sessionStorage.setItem(n, "true"), this.hasAppMapping = !0, this.log("User has app mapping, onboarding marked complete"), !0;
      } else if (e.status === 401 || e.status === 403) {
        this.log("401/403 - User needs onboarding, redirecting...");
        const o = encodeURIComponent(window.location.origin), i = this.appId ? `onboarding=${this.appId}` : "";
        return window.location.href = `${this.hankoUrl}/app?${i}&return_to=${o}`, !1;
      }
      return this.log("Unexpected status from mapping check:", e.status), !0;
    } catch (e) {
      return this.log("App mapping check failed:", e), !0;
    }
  }
  // Fetch profile display name and language from login backend
  async fetchProfileDisplayName() {
    try {
      const n = `${this.hankoUrl}/api/profile/me`;
      this.log("Fetching profile from:", n);
      const t = await fetch(n, {
        credentials: "include"
      });
      if (t.ok) {
        const e = await t.json();
        this.log("Profile data:", e), (e.first_name || e.last_name) && (this.profileDisplayName = `${e.first_name || ""} ${e.last_name || ""}`.trim(), this.log("Display name set to:", this.profileDisplayName));
        const o = e.osm_avatar_url || e.picture_url;
        this.profilePictureUrl = o || "", this.log("Profile picture set to:", this.profilePictureUrl), e.language && (this.userProfileLanguage = e.language, this.log("Language set from profile:", this.userProfileLanguage));
      }
    } catch (n) {
      this.log("Could not fetch profile:", n);
    }
  }
  updated(n) {
    super.updated(n), n.has("user") && this.user === null && this.showProfile && (this.log("User logged out, re-attaching event listeners..."), this._currentHankoAuthElement = null, this.setupEventListeners());
  }
  setupEventListeners() {
    this.updateComplete.then(() => {
      var t;
      const n = (t = this.shadowRoot) == null ? void 0 : t.querySelector("hanko-auth");
      if (n && n === this._currentHankoAuthElement) {
        this.log("Event listeners already attached to this element");
        return;
      }
      n && (this._currentHankoAuthElement = n, this.log("Attaching event listeners to hanko-auth element"), this._setupSignUpSubtitleObserver(n), n.addEventListener("onSessionCreated", (e) => {
        var i, r;
        this.log("Hanko event: onSessionCreated", e.detail);
        const o = (r = (i = e.detail) == null ? void 0 : i.claims) == null ? void 0 : r.session_id;
        if (o && this._lastSessionId === o) {
          this.log("Skipping duplicate session event");
          return;
        }
        this._lastSessionId = o, this.handleHankoSuccess(e);
      }), n.addEventListener(
        "hankoAuthLogout",
        () => this.handleLogout()
      ));
    });
  }
  _setupSignUpSubtitleObserver(n) {
    const t = () => {
      var m, v, g, k, x;
      const o = n.shadowRoot;
      if (!o) return;
      const i = o.querySelector("h1[part='headline1']"), r = ((m = i == null ? void 0 : i.textContent) == null ? void 0 : m.trim()) ?? "", s = o.querySelector(".hot-subtitle"), d = this._signUpHeadlines.has(r), u = this._loginHeadlines.has(r);
      if (!d && !u) {
        s && ((v = this._hankoObserver) == null || v.disconnect(), s.remove(), (g = this._hankoObserver) == null || g.observe(o, { childList: !0, subtree: !0 }));
        return;
      }
      const c = d ? this.t("signUpSubtitle") : this.t("loginSubtitle");
      if (s && s.textContent === c || !i) return;
      (k = this._hankoObserver) == null || k.disconnect(), s && s.remove();
      const l = document.createElement("p");
      l.className = "hot-subtitle", l.textContent = c, l.style.cssText = "margin: -4px 0 16px; text-align: center; font-size: var(--hot-font-size-base, 16px); color: var(--hot-color-gray-600, #6b7280); font-weight: normal;", i.insertAdjacentElement("afterend", l), (x = this._hankoObserver) == null || x.observe(o, { childList: !0, subtree: !0 });
    };
    this._hankoObserver && this._hankoObserver.disconnect();
    const e = n.shadowRoot;
    e && (this._hankoObserver = new MutationObserver(() => t()), this._hankoObserver.observe(e, { childList: !0, subtree: !0 }), t());
  }
  async handleHankoSuccess(n) {
    var o, i, r, s, d, u;
    if (this.log("Hanko auth success:", n.detail), !this._hanko) {
      this.logError("Hanko instance not initialized");
      return;
    }
    let t = !1;
    try {
      const c = new AbortController(), l = setTimeout(() => c.abort(), 5e3), m = await fetch(`${this.hankoUrl}/me`, {
        method: "GET",
        credentials: "include",
        // Include httpOnly cookies
        headers: {
          "Content-Type": "application/json"
        },
        signal: c.signal
      });
      if (clearTimeout(l), m.ok) {
        const v = await m.json();
        this.log("User data retrieved from /me:", v), v.email ? (this.user = {
          id: v.user_id || v.id,
          email: v.email,
          username: v.username || null,
          emailVerified: v.email_verified || v.verified || !1
        }, t = !0) : this.log("/me has no email, will try SDK fallback");
      } else
        this.log("/me endpoint returned non-OK status, will try SDK fallback");
    } catch (c) {
      this.log(
        "/me endpoint fetch failed (timeout or cross-origin TLS issue):",
        c
      );
    }
    if (!t)
      try {
        this.log("Trying SDK fallback for user info...");
        const c = new Promise(
          (m, v) => setTimeout(() => v(new Error("SDK timeout")), 5e3)
        ), l = await Promise.race([
          this._hanko.getCurrentUser(),
          c
        ]);
        this.user = {
          id: l.user_id,
          email: ((i = (o = l.emails) == null ? void 0 : o[0]) == null ? void 0 : i.address) || null,
          username: ((r = l.username) == null ? void 0 : r.username) || null,
          emailVerified: ((d = (s = l.emails) == null ? void 0 : s[0]) == null ? void 0 : d.is_verified) || !1
        }, t = !0, this.log("User info retrieved via SDK fallback");
      } catch (c) {
        this.log("SDK fallback failed, trying JWT claims:", c);
        try {
          const l = (u = n.detail) == null ? void 0 : u.claims;
          if (l != null && l.sub)
            this.user = {
              id: l.sub,
              email: l.email || null,
              username: null,
              emailVerified: l.email_verified || !1
            }, t = !0, this.log("User info extracted from JWT claims");
          else {
            this.logError("No user claims available in event"), this.user = null;
            return;
          }
        } catch (l) {
          this.logError(
            "Failed to extract user info from claims:",
            l
          ), this.user = null;
          return;
        }
      }
    if (this.log("User state updated:", this.user), await this.fetchProfileDisplayName(), this.user && this.profilePictureUrl && (this.user = { ...this.user, avatarUrl: this.profilePictureUrl }), this._isPrimary && this._broadcastState(), this.dispatchEvent(
      new CustomEvent("hanko-login", {
        detail: { user: this.user },
        bubbles: !0,
        composed: !0
      })
    ), this.osmRequired && await this.checkOSMConnection(), this.osmRequired && this.autoConnect && !this.osmConnected) {
      this.log("Auto-connecting to OSM..."), this.handleOSMConnect();
      return;
    }
    const e = !this.osmRequired || this.osmConnected;
    this.log(
      "Checking redirect-after-login:",
      this.redirectAfterLogin,
      "showProfile:",
      this.showProfile,
      "canRedirect:",
      e
    ), e ? (this.dispatchEvent(
      new CustomEvent("auth-complete", {
        bubbles: !0,
        composed: !0
      })
    ), this.redirectAfterLogin ? (this.log("Redirecting to:", this.redirectAfterLogin), window.location.href = this.redirectAfterLogin) : this.log("No redirect (redirectAfterLogin not set)")) : this.log("Waiting for OSM connection before redirect");
  }
  async handleOSMConnect() {
    const n = this.osmScopes.split(" ").join("+"), t = this.getBasePath(), e = this.authPath, i = `${`${t}${e}/login`}?scopes=${n}`;
    this.log("OSM Connect clicked!"), this.log("  basePath:", t), this.log("  authPath:", e), this.log("  Login path:", i), this.log("  Fetching redirect URL from backend...");
    try {
      const r = await fetch(i, {
        method: "GET",
        credentials: "include",
        redirect: "manual"
        // Don't follow redirect, we'll do it manually
      });
      if (this.log("  Response status:", r.status), this.log("  Response type:", r.type), r.status === 0 || r.type === "opaqueredirect") {
        const s = r.headers.get("Location") || r.url;
        this.log("Got redirect URL:", s), window.location.href = s;
      } else if (r.status >= 300 && r.status < 400) {
        const s = r.headers.get("Location");
        this.log("Got redirect URL from header:", s), s && (window.location.href = s);
      } else {
        this.logError("Unexpected response:", r.status);
        const s = await r.text();
        this.logError("  Response body:", s.substring(0, 200));
      }
    } catch (r) {
      this.logError("Failed to fetch redirect URL:", r);
    }
  }
  async handleLogout() {
    this.log("Logout initiated"), this.log("Current state before logout:", {
      user: this.user,
      osmConnected: this.osmConnected,
      osmData: this.osmData
    }), this.log("Cookies before logout:", document.cookie);
    try {
      const n = this.getBasePath(), t = this.authPath, e = `${n}${t}/disconnect`, o = e.startsWith("http") ? e : `${window.location.origin}${e}`;
      this.log("Calling OSM disconnect:", o);
      const i = await fetch(o, {
        method: "POST",
        credentials: "include"
      });
      this.log("Disconnect response status:", i.status);
      const r = await i.json();
      this.log("Disconnect response data:", r), this.log("OSM disconnected");
    } catch (n) {
      this.logError("OSM disconnect failed:", n);
    }
    if (this._hanko)
      try {
        await this._hanko.logout(), this.log("Hanko logout successful");
      } catch (n) {
        this.logError("Hanko logout failed:", n);
      }
    if (this._clearAuthState(), this.log("Logout complete - component will re-render with updated state"), this.redirectAfterLogout) {
      const n = window.location.href.replace(/\/$/, ""), t = this.redirectAfterLogout.replace(/\/$/, "");
      n !== t && !n.startsWith(t + "#") ? (this.log("Redirecting after logout to:", this.redirectAfterLogout), window.location.href = this.redirectAfterLogout) : this.log("Already on logout target, skipping redirect");
    }
  }
  /**
   * Clear all auth state - shared between logout and session expired handlers
   */
  _clearAuthState() {
    const n = window.location.hostname;
    document.cookie = `hanko=; path=/; domain=${n}; max-age=0`, document.cookie = "hanko=; path=/; max-age=0", document.cookie = `osm_connection=; path=/; domain=${n}; max-age=0`, document.cookie = "osm_connection=; path=/; max-age=0", this.log("Cookies cleared");
    const t = ei(n), e = ti(n);
    sessionStorage.removeItem(t), sessionStorage.removeItem(e), this.log("Session flags cleared"), this.user = null, this.osmConnected = !1, this.osmData = null, this.hasAppMapping = !1, this.userProfileLanguage = null, this.profilePictureUrl = "", this._isPrimary && this._broadcastState(), this.dispatchEvent(
      new CustomEvent("logout", {
        bubbles: !0,
        composed: !0
      })
    );
  }
  async handleSessionExpired() {
    if (this.log("Session expired event received"), this.log("Current state:", {
      user: this.user,
      osmConnected: this.osmConnected,
      loading: this.loading
    }), this.loading) {
      this.log("Still loading, ignoring session expired event during init");
      return;
    }
    if (this.user) {
      this.log("User is logged in, ignoring stale session expired event");
      return;
    }
    this.log("No active user - cleaning up state");
    try {
      const n = this.getBasePath(), t = this.authPath, e = `${n}${t}/disconnect`, o = e.startsWith("http") ? e : `${window.location.origin}${e}`;
      this.log("Calling OSM disconnect (session expired):", o);
      const i = await fetch(o, {
        method: "POST",
        credentials: "include"
      });
      this.log("Disconnect response status:", i.status);
      const r = await i.json();
      this.log("Disconnect response data:", r), this.log("OSM disconnected");
    } catch (n) {
      this.logError("OSM disconnect failed:", n);
    }
    if (this._clearAuthState(), this.log("Session cleanup complete"), this.redirectAfterLogout) {
      const n = window.location.href.replace(/\/$/, ""), t = this.redirectAfterLogout.replace(/\/$/, "");
      n !== t && !n.startsWith(t + "#") ? (this.log(
        "Redirecting after session expired to:",
        this.redirectAfterLogout
      ), window.location.href = this.redirectAfterLogout) : this.log("Already on logout target, skipping redirect");
    }
  }
  handleUserLoggedOut() {
    this.log("User logged out in another window/tab"), this.handleSessionExpired();
  }
  handleDropdownSelect(n) {
    const e = n.currentTarget.dataset.action;
    if (this.log("Dropdown item selected:", e), e === "profile") {
      const o = this.hankoUrl, i = this.redirectAfterLogin || window.location.origin;
      window.location.href = `${o}/app/profile?return_to=${encodeURIComponent(i)}`;
    } else if (e === "connect-osm") {
      const r = window.location.pathname.includes("/app") ? window.location.origin : window.location.href, s = this.hankoUrl;
      window.location.href = `${s}/app?return_to=${encodeURIComponent(r)}&osm_required=true`;
    } else e === "logout" && this.handleLogout();
    this.closeDropdown();
  }
  render() {
    var n, t, e;
    if (this.log(
      "RENDER - showProfile:",
      this.showProfile,
      "user:",
      !!this.user,
      "loading:",
      this.loading,
      "lang:",
      this.lang
    ), this.loading)
      return ve`<span class="loading-placeholder"
        ><span class="loading-placeholder-text">${this.t("logIn")}</span
        ><span class="spinner-small"></span
      ></span>`;
    if (this.error)
      return ve`
        <div class="container">
          <div class="error">${this.error}</div>
        </div>
      `;
    if (this.user) {
      const o = this.osmRequired && !this.osmConnected && !this.osmLoading, i = this.displayNameAttr || this.profileDisplayName || this.user.username || this.user.email || this.user.id, r = i ? i[0].toUpperCase() : "U";
      return this.showProfile ? ve`
          <div class="container">
            <div class="profile">
              <div class="profile-header">
                <div class="profile-avatar">
                  ${this.profilePictureUrl ? ve`<img
                        class="avatar-img"
                        src="${this.profilePictureUrl}"
                        alt="${r}"
                        @error=${(s) => {
        s.target.style.display = "none";
      }}
                      />` : r}
                </div>
                <div class="profile-info">
                  <div class="profile-email">
                    ${this.user.email || this.user.id}
                  </div>
                </div>
              </div>

              ${this.osmRequired && this.osmLoading ? ve`
                    <div class="osm-section">
                      <div class="loading">
                        ${this.t("checkingOsmConnection")}
                      </div>
                    </div>
                  ` : this.osmRequired && this.osmConnected ? ve`
                      <div class="osm-section">
                        <div class="osm-connected">
                          <div class="osm-badge">
                            <div>
                              <div>${this.t("connectedToOpenStreetMap")}</div>
                              ${(n = this.osmData) != null && n.osm_username ? ve`
                                    <div class="osm-username">
                                      @${this.osmData.osm_username}
                                    </div>
                                  ` : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    ` : ""}
              ${o ? ve`
                    <div class="osm-section">
                      ${this.autoConnect ? ve`
                            <div class="osm-connecting">
                              <div class="spinner"></div>
                              <div class="connecting-text">
                                🗺️ ${this.t("connectingToOpenStreetMap")}
                              </div>
                            </div>
                          ` : ve`
                            <div class="osm-prompt-title">
                              🌍 ${this.t("osmRequired")}
                            </div>
                            <div class="osm-prompt-text">
                              ${this.t("osmRequiredText")}
                            </div>
                            <button
                              @click=${this.handleOSMConnect}
                              class="btn-primary"
                            >
                              ${this.t("connectOsmAccount")}
                            </button>
                          `}
                    </div>
                  ` : ""}

              <button @click=${this.handleLogout} class="btn-secondary">
                ${this.t("logOut")}
              </button>
            </div>
          </div>
        ` : this.display === "bar" ? ve`
          <div class="dropdown">
            <button
              @click=${this.toggleDropdown}
              aria-label="${this.t("openAccountMenu")}"
              aria-expanded=${this.isOpen}
              aria-haspopup="true"
              class="bar-trigger"
            >
              <div class="bar-info">
                <span class="header-avatar">
                  ${this.profilePictureUrl ? ve`<img
                        class="avatar-img"
                        src="${this.profilePictureUrl}"
                        alt="${r}"
                        @error=${(s) => {
        s.target.style.display = "none";
      }}
                      />` : r}
                </span>
                <span class="bar-email"
                  >${this.user.email || this.user.id}</span
                >
              </div>
              <img
                src="${this.isOpen ? rs : as}"
                class="bar-chevron"
                alt=""
              />
            </button>
            ${this.renderBarDropdownContent()}
          </div>
        ` : ve`
          <div class="dropdown">
            <button
              @click=${this.toggleDropdown}
              aria-label="${this.t("openAccountMenu")}"
              aria-expanded=${this.isOpen}
              aria-haspopup="true"
              class="dropdown-trigger"
            >
              <span class="header-avatar">
                ${this.profilePictureUrl ? ve`<img
                      class="avatar-img"
                      src="${this.profilePictureUrl}"
                      alt="${r}"
                      @error=${(s) => {
        s.target.style.display = "none";
      }}
                    />` : r}
              </span>

              ${this.osmConnected ? ve`
                    <span
                      class="osm-status-badge connected"
                      title="${this.t("connectedToOsmAs")} @${(t = this.osmData) == null ? void 0 : t.osm_username}"
                      >✓</span
                    >
                  ` : this.osmRequired ? ve`
                      <span
                        class="osm-status-badge required"
                        title="${this.t("osmConnectionRequired")}"
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
                <img src="${Jo}" class="icon" alt="Account icon" />
                ${this.t("myHotAccount")}
              </button>
              ${this.osmRequired ? this.osmConnected ? ve`
                      <button class="osm-connected" disabled>
                        <img src="${Go}" alt="Check icon" class="icon" />
                        ${this.t("connectedToOsm")}
                        (@${(e = this.osmData) == null ? void 0 : e.osm_username})
                      </button>
                    ` : ve`
                      <button
                        data-action="connect-osm"
                        @click=${this.handleDropdownSelect}
                      >
                        <img src="${Qo}" alt="Check icon" class="icon" />
                        ${this.t("connectToOsm")}
                      </button>
                    ` : ""}
              <button data-action="logout" @click=${this.handleDropdownSelect}>
                <img src="${Yo}" alt="Log out icon" class="icon" />
                ${this.t("logOut")}
              </button>
            </div>
          </div>
        `;
    } else {
      if (this.showProfile)
        return this.hankoReady ? ve`
          <div
            class="container"
            style="
            --color: var(--hot-color-gray-900);
            --color-shade-1: var(--hot-color-gray-700);
            --color-shade-2: var(--hot-color-gray-100);
            --brand-color: var(--hot-color-gray-1000);
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
            --headline1-font-size: var(--hot-font-size-xl);
            --headline1-font-weight: var(--hot-font-weight-semibold);
            --headline2-font-size: var(--hot-font-size-medium);
            --headline2-font-weight: var(--hot-font-weight-semibold);
          "
          >
            ${da(
          this.lang,
          ve`<hanko-auth lang="${this.lang}" exportparts="link"></hanko-auth>`
        )}
          </div>
        ` : (this.log(
          "Waiting for Hanko registration before rendering form..."
        ), ve`<span class="loading-placeholder"
            ><span class="loading-placeholder-text">${this.t("logIn")}</span
            ><span class="spinner-small"></span
          ></span>`);
      {
        const i = window.location.pathname.includes("/app"), r = this.redirectAfterLogin || (i ? window.location.origin : window.location.href), d = new URLSearchParams(window.location.search).get("auto_connect") === "true" ? "&auto_connect=true" : "", u = this.hankoUrl;
        this.log("Login URL base:", u);
        const l = `${this.loginUrl || `${u}/app`}?return_to=${encodeURIComponent(
          r
        )}${this.osmRequired ? "&osm_required=true" : ""}${d}&lang=${this.lang}`;
        return ve`<a
          class="login-link ${this.buttonVariant} ${this.buttonColor}"
          href="${l}"
          @click=${(m) => {
          m.preventDefault(), window.location.href = l;
        }}
          >${this.t("logIn")}</a
        > `;
      }
    }
  }
};
oe.styles = Xr;
ae([
  Pe({ type: String, attribute: "hanko-url" })
], oe.prototype, "hankoUrlAttr", 2);
ae([
  Pe({ type: String, attribute: "base-path" })
], oe.prototype, "basePath", 2);
ae([
  Pe({ type: String, attribute: "auth-path" })
], oe.prototype, "authPath", 2);
ae([
  Pe({ type: Boolean, attribute: "osm-required" })
], oe.prototype, "osmRequired", 2);
ae([
  Pe({ type: String, attribute: "osm-scopes" })
], oe.prototype, "osmScopes", 2);
ae([
  Pe({ type: Boolean, attribute: "show-profile" })
], oe.prototype, "showProfile", 2);
ae([
  Pe({ type: String, attribute: "redirect-after-login" })
], oe.prototype, "redirectAfterLogin", 2);
ae([
  Pe({ type: Boolean, attribute: "auto-connect" })
], oe.prototype, "autoConnect", 2);
ae([
  Pe({ type: Boolean, attribute: "verify-session" })
], oe.prototype, "verifySession", 2);
ae([
  Pe({ type: String, attribute: "redirect-after-logout" })
], oe.prototype, "redirectAfterLogout", 2);
ae([
  Pe({ type: String, attribute: "display-name" })
], oe.prototype, "displayNameAttr", 2);
ae([
  Pe({ type: String, attribute: "mapping-check-url" })
], oe.prototype, "mappingCheckUrl", 2);
ae([
  Pe({ type: String, attribute: "app-id" })
], oe.prototype, "appId", 2);
ae([
  Pe({ type: String, attribute: "login-url" })
], oe.prototype, "loginUrl", 2);
ae([
  Pe({ type: String, reflect: !0 })
], oe.prototype, "lang", 2);
ae([
  Pe({ type: String, attribute: "button-variant" })
], oe.prototype, "buttonVariant", 2);
ae([
  Pe({ type: String, attribute: "button-color" })
], oe.prototype, "buttonColor", 2);
ae([
  Pe({ type: String, reflect: !0 })
], oe.prototype, "display", 2);
ae([
  qe()
], oe.prototype, "user", 2);
ae([
  qe()
], oe.prototype, "osmConnected", 2);
ae([
  qe()
], oe.prototype, "osmData", 2);
ae([
  qe()
], oe.prototype, "osmLoading", 2);
ae([
  qe()
], oe.prototype, "loading", 2);
ae([
  qe()
], oe.prototype, "error", 2);
ae([
  qe()
], oe.prototype, "hankoReady", 2);
ae([
  qe()
], oe.prototype, "profileDisplayName", 2);
ae([
  qe()
], oe.prototype, "profilePictureUrl", 2);
ae([
  qe()
], oe.prototype, "hasAppMapping", 2);
ae([
  qe()
], oe.prototype, "userProfileLanguage", 2);
ae([
  qe()
], oe.prototype, "isOpen", 2);
oe = ae([
  oa("hotosm-auth")
], oe);
export {
  oe as HankoAuth,
  is as getTranslations
};

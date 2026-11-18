/**
 * <hotosm-share-dialog>: the one share dialog for HOT tools. Talks to the
 * tool's hotosm-permissions REST contract (`{access-url}/access…`,
 * `{access-url}/attribution`) and to Login for group search.
 *
 * Every change is applied immediately; each response replaces the local
 * `ItemAccess` and is announced with `hotosm-access-change`.
 */

import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { live } from "lit/directives/live.js";

// Web Awesome stays external: the tool's bundler resolves these to its copy.
import "@awesome.me/webawesome/dist/components/avatar/avatar.js";
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/callout/callout.js";
import "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import "@awesome.me/webawesome/dist/components/divider/divider.js";
import "@awesome.me/webawesome/dist/components/dropdown/dropdown.js";
import "@awesome.me/webawesome/dist/components/dropdown-item/dropdown-item.js";
import "@awesome.me/webawesome/dist/components/input/input.js";
import "@awesome.me/webawesome/dist/components/option/option.js";
import "@awesome.me/webawesome/dist/components/select/select.js";

import {
  AccessError,
  accessRequest,
  fetchMyGroups,
  searchPublicGroups,
  type AccessGrant,
  type GrantableRole,
  type GroupType,
  type ItemAccess,
  type MyGroup,
  type PublicGroup,
  type SubjectType,
} from "./api";
import {
  clipboardIcon,
  linkIcon,
  organizationIcon,
  personPlusIcon,
  teamIcon,
  warningIcon,
} from "./icons";
import { styles } from "./styles";
import { translations, type Translations } from "./translations";

export type {
  AccessGrant,
  ItemAccess,
  MyGroup,
  PublicGroup,
  RoleOption,
} from "./api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Org roles that may attribute an item to the org.
const ORG_MANAGER_ROLES = new Set(["owner", "manager"]);
// The "By" select's value for "no organization": the owner, personally.
const PERSONAL = "__personal__";
const SEARCH_DEBOUNCE_MS = 250;
const SEARCH_MIN_CHARS = 2;
const COPY_FEEDBACK_MS = 2000;

type Status = "idle" | "loading" | "ready" | "forbidden" | "error";

interface GroupOption {
  type: GroupType;
  id: string;
  name: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function format(text: string, values: Record<string, string | number>) {
  return text.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match,
  );
}

@customElement("hotosm-share-dialog")
export class HotosmShareDialog extends LitElement {
  static styles = styles;

  @property({ type: String, attribute: "access-url" }) accessUrl = "";
  @property({ type: String, attribute: "login-url" }) loginUrl = "";
  @property({ type: String, attribute: "share-url" }) shareUrl = "";
  @property({ type: String, reflect: true }) lang = "en";
  @property({ type: Boolean, reflect: true }) open = false;

  @state() private status: Status = "idle";
  @state() private access: ItemAccess | null = null;
  @state() private myGroups: MyGroup[] = [];
  @state() private publicGroups: PublicGroup[] = [];
  @state() private query = "";
  @state() private inputFocused = false;
  @state() private error: string | null = null;
  @state() private copyStatus: "rest" | "copied" | "failed" = "rest";

  private loadToken = 0;
  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private searchController: AbortController | null = null;
  private copyTimer: ReturnType<typeof setTimeout> | null = null;

  private get locale(): string {
    return this.lang in translations ? this.lang : "en";
  }

  private get t(): Translations {
    return translations[this.locale];
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cancelSearch();
    if (this.copyTimer) clearTimeout(this.copyTimer);
  }

  updated(changed: Map<string, unknown>) {
    const reopened = changed.has("open") && this.open;
    const retargeted =
      this.open && (changed.has("accessUrl") || changed.has("loginUrl"));
    if (reopened || retargeted) this.load();
  }

  // --- Data -------------------------------------------------------------

  private async load() {
    const token = ++this.loadToken;
    this.status = "loading";
    this.access = null;
    this.error = null;
    this.query = "";
    this.publicGroups = [];
    this.cancelSearch();

    const [access, groups] = await Promise.all([
      accessRequest(this.accessUrl, "/access", this.locale).catch(
        (e: unknown) => e,
      ),
      fetchMyGroups(this.loginUrl),
    ]);
    if (token !== this.loadToken) return;

    this.myGroups = groups;
    if (access instanceof AccessError) {
      this.status =
        access.status === 403 || access.status === 404 ? "forbidden" : "error";
    } else if (access instanceof Error) {
      this.status = "error";
    } else {
      this.access = access as ItemAccess;
      this.status = "ready";
    }
  }

  /** Run a write; on success store and announce the new access. */
  private async write(
    path: string,
    method: "POST" | "PUT" | "DELETE",
    body?: unknown,
    errorFor: (e: unknown) => string = () => this.t.errorGeneric,
  ) {
    this.error = null;
    try {
      const access = await accessRequest(
        this.accessUrl,
        path,
        this.locale,
        method,
        body,
      );
      this.access = access;
      this.dispatchEvent(
        new CustomEvent<ItemAccess>("hotosm-access-change", {
          detail: access,
          bubbles: true,
          composed: true,
        }),
      );
    } catch (e) {
      this.error = errorFor(e);
    }
  }

  /** The lowest role that may be granted: what new grants start with. */
  private get defaultRole(): GrantableRole | null {
    const role = this.access?.available_roles.find((r) => r.key !== "owner");
    return (role?.key as GrantableRole | undefined) ?? null;
  }

  private roleLabel(role: string): string {
    return (
      this.access?.available_roles.find((r) => r.key === role)?.label ?? role
    );
  }

  // --- Search -----------------------------------------------------------

  private cancelSearch() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = null;
    this.searchController?.abort();
    this.searchController = null;
  }

  private onQueryInput(event: Event) {
    this.query = (event.target as HTMLInputElement).value ?? "";
    this.error = null;
    this.cancelSearch();
    const q = this.query.trim();
    if (q.length < SEARCH_MIN_CHARS) {
      this.publicGroups = [];
      return;
    }
    this.searchTimer = setTimeout(async () => {
      const controller = new AbortController();
      this.searchController = controller;
      const items = await searchPublicGroups(
        this.loginUrl,
        q,
        controller.signal,
      );
      if (!controller.signal.aborted && this.query.trim() === q) {
        this.publicGroups = items;
      }
    }, SEARCH_DEBOUNCE_MS);
  }

  /** The caller's groups matching the query, then public ones; no dupes. */
  private get groupOptions(): GroupOption[] {
    const q = this.query.trim().toLowerCase();
    const grants = this.access?.grants ?? [];
    const seen = new Set(grants.map((g) => `${g.subject_type}:${g.subject_id}`));
    const options: GroupOption[] = [];
    const mine = this.myGroups.filter((g) => g.name.toLowerCase().includes(q));
    const others = q.length >= SEARCH_MIN_CHARS ? this.publicGroups : [];
    for (const g of [...mine, ...others]) {
      const key = `${g.type}:${g.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      options.push({ type: g.type, id: g.id, name: g.name });
    }
    return options;
  }

  private clearQuery() {
    this.query = "";
    this.publicGroups = [];
    this.cancelSearch();
  }

  private addGroup(group: GroupOption) {
    const role = this.defaultRole;
    this.clearQuery();
    if (!role) return;
    this.write(`/access/${group.type}/${encodeURIComponent(group.id)}`, "PUT", {
      role,
    });
  }

  private addEmail(email: string) {
    const role = this.defaultRole;
    this.clearQuery();
    if (!role) return;
    this.write("/access/user", "POST", { email, role }, (e) => {
      if (e instanceof AccessError && e.status === 404) {
        return this.t.errorUserNotFound;
      }
      if (e instanceof AccessError && e.status === 409) {
        return this.t.errorAlreadyOwner;
      }
      return this.t.errorGeneric;
    });
  }

  // --- Actions ----------------------------------------------------------

  private onGrantSelect(grant: AccessGrant, event: CustomEvent) {
    const value = (event.detail.item as HTMLElement & { value: string }).value;
    const path = `/access/${grant.subject_type}/${encodeURIComponent(grant.subject_id)}`;
    if (value === "remove") {
      this.write(path, "DELETE");
    } else if (value !== grant.role) {
      this.write(path, "PUT", { role: value });
    } else {
      // Unchecking the current role: keep it checked.
      this.requestUpdate();
    }
  }

  private onLinkSelect(event: CustomEvent) {
    const value = (event.detail.item as HTMLElement & { value: string }).value;
    const next = value === "none" ? null : value;
    if (next === (this.access?.link_role ?? null)) {
      this.requestUpdate();
      return;
    }
    if (next) {
      this.write("/access/link", "PUT", { role: next });
    } else {
      this.write("/access/link", "DELETE");
    }
  }

  private onAttributionChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const current = this.access?.attribution?.id ?? PERSONAL;
    if (value === current) return;
    this.write("/attribution", "PUT", {
      organization_id: value === PERSONAL ? null : value,
    });
  }

  private async copyLink() {
    if (this.copyTimer) clearTimeout(this.copyTimer);
    try {
      await navigator.clipboard.writeText(this.shareUrl);
      this.copyStatus = "copied";
    } catch {
      this.copyStatus = "failed";
    }
    this.copyTimer = setTimeout(() => {
      this.copyStatus = "rest";
    }, COPY_FEEDBACK_MS);
  }

  private onDialogHide(event: Event) {
    // Only the dialog's own wa-hide: inner dropdowns and selects bubble
    // wa-hide when they close, which would close us too.
    if (event.target !== event.currentTarget) return;
    this.open = false;
    this.dispatchEvent(
      new CustomEvent("hotosm-share-close", { bubbles: true, composed: true }),
    );
  }

  // --- Render -----------------------------------------------------------

  private subjectTypeLabel(type: SubjectType): string {
    if (type === "organization") return this.t.organization;
    if (type === "team") return this.t.team;
    return this.t.person;
  }

  private summary(grants: AccessGrant[]): string | null {
    const t = this.t;
    const count = (type: SubjectType) =>
      grants.filter((g) => g.subject_type === type).length;
    const parts = (
      [
        ["user", t.peopleSingular, t.peoplePlural],
        ["team", t.teamsSingular, t.teamsPlural],
        ["organization", t.orgsSingular, t.orgsPlural],
      ] as const
    )
      .map(([type, one, many]) => {
        const n = count(type);
        if (n === 0) return null;
        return format(n === 1 ? one : many, { count: n });
      })
      .filter((part): part is string => part !== null);
    return parts.length > 0
      ? format(t.summary, { list: parts.join(", ") })
      : null;
  }

  private renderRow(name: string, subtitle: string, end: unknown) {
    return html`<li>
      <wa-avatar shape="square" initials=${initials(name)} label=${name}>
      </wa-avatar>
      <div class="row-text">
        <span class="row-name">${name}</span>
        <span class="quiet">${subtitle}</span>
      </div>
      ${end}
    </li>`;
  }

  private renderSearch() {
    const trimmed = this.query.trim();
    const groupOptions = this.groupOptions;
    const email = EMAIL_RE.test(trimmed) ? trimmed : null;
    const showOptions =
      (this.inputFocused || trimmed !== "") &&
      (groupOptions.length > 0 || email);
    // Keep the input focused until the click lands.
    const keepFocus = (e: Event) => e.preventDefault();

    return html`<div class="search">
      <wa-input
        .value=${live(this.query)}
        placeholder=${this.t.addPlaceholder}
        autocomplete="off"
        @input=${this.onQueryInput}
        @focusin=${() => (this.inputFocused = true)}
        @focusout=${() => (this.inputFocused = false)}
      ></wa-input>
      ${showOptions
        ? html`<div class="options">
            ${groupOptions.map(
              (g) => html`<wa-button
                appearance="plain"
                @mousedown=${keepFocus}
                @click=${() => this.addGroup(g)}
              >
                <span slot="start"
                  >${g.type === "organization" ? organizationIcon : teamIcon}</span
                >
                <span class="option-name">${g.name}</span>
                <span class="option-type">${this.subjectTypeLabel(g.type)}</span>
              </wa-button>`,
            )}
            ${email
              ? html`<wa-button
                  appearance="plain"
                  @mousedown=${keepFocus}
                  @click=${() => this.addEmail(email)}
                >
                  <span slot="start">${personPlusIcon}</span>
                  <span class="option-name"
                    >${format(this.t.addEmail, { email })}</span
                  >
                </wa-button>`
              : nothing}
          </div>`
        : nothing}
    </div>`;
  }

  private renderAccessList(access: ItemAccess) {
    const t = this.t;
    const roles = access.available_roles.filter((r) => r.key !== "owner");
    const summary = this.summary(access.grants);
    return html`<section>
      <h3>${t.accessSection}</h3>
      <ul>
        ${this.renderRow(
          access.owner.name ?? t.unknownName,
          t.person,
          html`<span class="quiet">${t.owner}</span>`,
        )}
        ${access.grants.map((grant) =>
          this.renderRow(
            grant.subject_name ?? t.unknownName,
            this.subjectTypeLabel(grant.subject_type),
            html`<wa-dropdown
              @wa-select=${(e: CustomEvent) => this.onGrantSelect(grant, e)}
            >
              <wa-button slot="trigger" appearance="outlined" size="small" with-caret>
                ${this.roleLabel(grant.role)}
              </wa-button>
              ${roles.map(
                (r) => html`<wa-dropdown-item
                  value=${r.key}
                  type="checkbox"
                  .checked=${live(grant.role === r.key)}
                >
                  <span class="role-option">
                    <span>${r.label}</span>
                    <span class="role-description">${r.description}</span>
                  </span>
                </wa-dropdown-item>`,
              )}
              <wa-divider></wa-divider>
              <wa-dropdown-item value="remove" variant="danger">
                ${t.removeAccess}
              </wa-dropdown-item>
            </wa-dropdown>`,
          ),
        )}
      </ul>
      ${summary ? html`<p class="quiet">${summary}</p>` : nothing}
    </section>`;
  }

  private renderLink(access: ItemAccess) {
    if (access.link_roles.length === 0) return nothing;
    const t = this.t;
    const linkRole = access.link_role;
    return html`<div class="link-row">
        ${linkIcon}
        <span>${t.linkLabel}</span>
        <wa-dropdown @wa-select=${this.onLinkSelect}>
          <wa-button slot="trigger" appearance="outlined" size="small" with-caret>
            ${linkRole ? this.roleLabel(linkRole) : t.linkNone}
          </wa-button>
          <wa-dropdown-item
            value="none"
            type="checkbox"
            .checked=${live(linkRole == null)}
          >
            ${t.linkNone}
          </wa-dropdown-item>
          ${access.link_roles.map(
            (role) => html`<wa-dropdown-item
              value=${role}
              type="checkbox"
              .checked=${live(linkRole === role)}
            >
              ${this.roleLabel(role)}
            </wa-dropdown-item>`,
          )}
        </wa-dropdown>
      </div>
      ${linkRole
        ? html`<wa-callout variant="warning">
            <span slot="icon">${warningIcon}</span>
            ${t.linkWarning}
          </wa-callout>`
        : nothing}`;
  }

  private renderAttribution(access: ItemAccess) {
    if (!access.attribution_enabled) return nothing;
    const t = this.t;
    const attribution = access.attribution;
    // The owner personally, or an organization the caller owns or manages.
    // A current attribution outside that list (the owner stopped managing
    // it) is still shown so it doesn't change silently.
    const orgs = this.myGroups.filter(
      (g) => g.type === "organization" && ORG_MANAGER_ROLES.has(g.role),
    );
    const showCurrent =
      attribution !== null && !orgs.some((g) => g.id === attribution.id);
    return html`<div class="attribution">
      <wa-select
        label=${t.attributionLabel}
        size="small"
        .value=${live(attribution?.id ?? PERSONAL)}
        @change=${this.onAttributionChange}
      >
        <wa-option value=${PERSONAL}>
          ${format(t.attributionPersonal, {
            name: access.owner.name ?? t.unknownName,
          })}
        </wa-option>
        ${showCurrent
          ? html`<wa-option value=${attribution!.id}>
              ${attribution!.name ?? t.unknownName}
            </wa-option>`
          : nothing}
        ${orgs.map((g) => html`<wa-option value=${g.id}>${g.name}</wa-option>`)}
      </wa-select>
      <p class="quiet">${t.attributionHelp}</p>
    </div>`;
  }

  private renderBody() {
    const t = this.t;
    if (this.status === "forbidden") return html`<p>${t.cannotShare}</p>`;
    if (this.status === "error") {
      return html`<wa-callout variant="danger">${t.loadError}</wa-callout>`;
    }
    const access = this.access;
    if (!access) return nothing;
    return html`
      ${this.error
        ? html`<wa-callout variant="danger">${this.error}</wa-callout>`
        : nothing}
      ${this.renderSearch()} ${this.renderAccessList(access)}
      ${this.renderLink(access)} ${this.renderAttribution(access)}
    `;
  }

  render() {
    const t = this.t;
    const copyLabel =
      this.copyStatus === "copied"
        ? t.linkCopied
        : this.copyStatus === "failed"
          ? t.linkCopyError
          : t.copyLink;
    return html`<wa-dialog
      label=${t.dialogLabel}
      lang=${this.locale}
      ?open=${this.open}
      @wa-hide=${this.onDialogHide}
    >
      <div class="body">${this.renderBody()}</div>
      <div slot="footer" class="footer">
        ${this.shareUrl && this.status === "ready"
          ? html`<wa-button
              size="small"
              appearance="outlined"
              variant=${this.copyStatus === "failed" ? "danger" : "neutral"}
              @click=${this.copyLink}
            >
              <span slot="start">${clipboardIcon}</span>
              ${copyLabel}
            </wa-button>`
          : html`<span></span>`}
        <wa-button
          appearance="accent"
          variant="neutral"
          @click=${() => (this.open = false)}
        >
          ${t.done}
        </wa-button>
      </div>
    </wa-dialog>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hotosm-share-dialog": HotosmShareDialog;
  }
  interface HTMLElementEventMap {
    "hotosm-access-change": CustomEvent<ItemAccess>;
    "hotosm-share-close": CustomEvent<void>;
  }
}

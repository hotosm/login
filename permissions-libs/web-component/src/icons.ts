/**
 * Inline SVG icons, so the dialog doesn't depend on an icon library
 * registered by the host. Stroke icons, 24×24 grid, sized to 1em.
 */

import { html, type TemplateResult } from "lit";

function icon(body: TemplateResult): TemplateResult {
  return html`<svg
    class="icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    ${body}
  </svg>`;
}

export const linkIcon = icon(html`
  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
`);

export const teamIcon = icon(html`
  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
  <circle cx="9" cy="7" r="4" />
  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
`);

export const organizationIcon = icon(html`
  <rect x="4" y="2" width="16" height="20" rx="2" />
  <path d="M9 22v-4h6v4" />
  <path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
`);

export const personPlusIcon = icon(html`
  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
  <circle cx="8.5" cy="7" r="4" />
  <path d="M20 8v6M23 11h-6" />
`);

export const clipboardIcon = icon(html`
  <path
    d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
  />
  <rect x="8" y="2" width="8" height="4" rx="1" />
`);

export const warningIcon = icon(html`
  <path
    d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
  />
  <path d="M12 9v4M12 17h.01" />
`);

import { css } from "lit";

/** Layout only; colors, spacing and type come from Web Awesome's tokens. */
export const styles = css`
  :host {
    display: contents;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: var(--wa-space-m);
  }

  .icon {
    flex-shrink: 0;
  }

  .search {
    position: relative;
  }

  .options {
    position: absolute;
    z-index: 10;
    inset-inline: 0;
    margin-top: var(--wa-space-2xs);
    display: flex;
    flex-direction: column;
    padding-block: var(--wa-space-2xs);
    background: var(--wa-color-surface-raised);
    border: var(--wa-border-width-s) var(--wa-border-style)
      var(--wa-color-surface-border);
    border-radius: var(--wa-border-radius-m);
    box-shadow: var(--wa-shadow-m);
    max-height: 16rem;
    overflow-y: auto;
  }

  .options wa-button {
    width: 100%;
  }

  .options wa-button::part(base) {
    justify-content: flex-start;
  }

  .options wa-button::part(label) {
    display: flex;
    flex: 1;
    justify-content: space-between;
    gap: var(--wa-space-s);
    min-width: 0;
  }

  .option-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .option-type,
  .quiet {
    color: var(--wa-color-text-quiet);
    font-size: var(--wa-font-size-s);
  }

  section {
    display: flex;
    flex-direction: column;
    gap: var(--wa-space-s);
  }

  h3 {
    margin: 0;
    font-size: var(--wa-font-size-s);
    font-weight: var(--wa-font-weight-semibold);
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: var(--wa-space-s);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: flex;
    align-items: center;
    gap: var(--wa-space-s);
  }

  wa-avatar {
    --size: 2rem;
    flex-shrink: 0;
  }

  .row-text {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }

  .row-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  p {
    margin: 0;
  }

  .role-option {
    display: flex;
    flex-direction: column;
  }

  .role-description {
    color: var(--wa-color-text-quiet);
    font-size: var(--wa-font-size-xs);
    line-height: var(--wa-line-height-condensed);
    white-space: normal;
  }

  .link-row {
    display: flex;
    align-items: center;
    gap: var(--wa-space-s);
  }

  .link-row span {
    flex: 1;
  }

  .attribution {
    display: flex;
    flex-direction: column;
    gap: var(--wa-space-xs);
  }

  .footer {
    display: flex;
    justify-content: space-between;
    gap: var(--wa-space-s);
    width: 100%;
  }
`;

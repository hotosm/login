import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    font-family: var(--font-family, var(--hot-font-sans));
  }

  .container {
    max-width: 400px;
    margin: 0 auto;
    padding: var(--hot-spacing-large);
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
    gap: var(--hot-spacing-small);
    padding: var(--hot-spacing-large);
  }

  .spinner {
    width: clamp(40px, 10%, 60px);
    height: clamp(40px, 10%, 60px);
    border: 4px solid var(--hot-color-gray-50);
    border-top: 4px solid var(--hot-color-red-600);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
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
  }
`;

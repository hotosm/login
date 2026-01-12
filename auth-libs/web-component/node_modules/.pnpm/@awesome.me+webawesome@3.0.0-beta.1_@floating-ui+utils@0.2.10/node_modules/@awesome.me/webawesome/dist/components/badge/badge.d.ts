import WebAwesomeElement from '../../internal/webawesome-element.js';
/**
 * @summary Badges are used to draw attention and display statuses or counts.
 * @documentation https://backers.webawesome.com/docs/components/badge
 * @status stable
 * @since 2.0
 *
 * @slot - The badge's content.
 *
 * @csspart base - The component's base wrapper.
 *
 */
export default class WaBadge extends WebAwesomeElement {
    static css: string[];
    /** The badge's theme variant. Defaults to `brand` if not within another element with a variant. */
    variant: 'brand' | 'neutral' | 'success' | 'warning' | 'danger';
    /** The badge's visual appearance. */
    appearance: 'accent' | 'filled' | 'outlined';
    /** Draws a pill-style badge with rounded edges. */
    pill: boolean;
    /** Makes the badge pulsate to draw attention. */
    attention: 'none' | 'pulse';
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'wa-badge': WaBadge;
    }
}

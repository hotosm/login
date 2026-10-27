import WaAccordion from '@awesome.me/webawesome/dist/react/accordion/index.js';

// Group of AccordionItem children. Events: onWaExpand / onWaCollapse (both
// cancelable) and onWaAfterExpand / onWaAfterCollapse, all fired by the
// accordion itself with the item in `event.detail.item`.
//
// Lit properties (`appearance`, `mode`, ...) are valid at runtime but are not
// surfaced by the @lit/react wrapper types, so we declare them here.
export interface AccordionProps
  extends React.ComponentProps<typeof WaAccordion> {
  children?: React.ReactNode;
  appearance?: 'filled' | 'outlined' | 'filled-outlined' | 'plain';
  /** `multiple` lets any number of items be open at once. */
  mode?: 'single' | 'single-collapsible' | 'multiple';
  iconPlacement?: 'start' | 'end';
  headingLevel?: string;
}

function Accordion({ children, ...props }: AccordionProps) {
  // biome-ignore lint/suspicious/noExplicitAny: Lit properties are valid at runtime
  return <WaAccordion {...(props as any)}>{children}</WaAccordion>;
}

export default Accordion;

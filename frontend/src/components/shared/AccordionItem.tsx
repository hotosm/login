import WaAccordionItem from '@awesome.me/webawesome/dist/react/accordion-item/index.js';

// A single section inside an Accordion. Use the `label` attribute for plain
// text headers, or a child with `slot="label"` for markup. `appearance`,
// `iconPlacement` and `headingLevel` are set by the parent Accordion.
//
// `expanded` is a valid Lit property but isn't surfaced by the @lit/react
// wrapper types, so we declare it here.
export interface AccordionItemProps
  extends React.ComponentProps<typeof WaAccordionItem> {
  children?: React.ReactNode;
  expanded?: boolean;
}

function AccordionItem({ children, ...props }: AccordionItemProps) {
  // biome-ignore lint/suspicious/noExplicitAny: Lit properties are valid at runtime
  return <WaAccordionItem {...(props as any)}>{children}</WaAccordionItem>;
}

export default AccordionItem;

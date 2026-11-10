import WaAccordionItem from '@awesome.me/webawesome/dist/react/accordion-item/index.js';
import { useEffect, useRef } from 'react';

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

const ACCORDION_NAV_KEYS = new Set(['ArrowUp', 'ArrowDown', 'Home', 'End']);

function AccordionItem({ children, ...props }: AccordionItemProps) {
  const ref = useRef<HTMLElement>(null);

  // wa-accordion handles arrow/Home/End keys for any event in its slot and
  // moves focus to a header, even when typing in the item's content (inputs,
  // textareas). Stop those keys from bubbling past the item unless they come
  // from the header (which lives in the item's shadow root, so target is the
  // host). Native listener: React's onKeyDown runs after the accordion's.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        ACCORDION_NAV_KEYS.has(event.key) &&
        event.target !== event.currentTarget
      ) {
        event.stopPropagation();
      }
    };
    el.addEventListener('keydown', onKeyDown);
    return () => el.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    // biome-ignore lint/suspicious/noExplicitAny: Lit properties are valid at runtime
    <WaAccordionItem ref={ref as any} {...(props as any)}>
      {children}
    </WaAccordionItem>
  );
}

export default AccordionItem;

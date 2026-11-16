import WaCheckbox from '@awesome.me/webawesome/dist/react/checkbox/index.js';

// Web Awesome checkbox. Put the label text in the default slot:
//
//   <Checkbox checked={value} onCheckedChange={setValue}>Label</Checkbox>
//
// Lit properties (`checked`, `disabled`, `size`) are valid at runtime but are
// not surfaced by the @lit/react wrapper types, so we declare them here.
export interface CheckboxProps
  extends Omit<React.ComponentProps<typeof WaCheckbox>, 'onChange'> {
  children?: React.ReactNode;
  /** Draws the checkbox in a checked state. */
  checked?: boolean;
  /** Disables the checkbox. */
  disabled?: boolean;
  /** The checkbox's size. */
  size?: 'small' | 'medium' | 'large';
  /** Called with the new checked state whenever it changes. */
  onCheckedChange?: (checked: boolean) => void;
}

function Checkbox({ children, onCheckedChange, ...props }: CheckboxProps) {
  return (
    <WaCheckbox
      // biome-ignore lint/suspicious/noExplicitAny: Lit properties are valid at runtime
      {...(props as any)}
      onChange={(e) => onCheckedChange?.(e.currentTarget.checked)}
    >
      {children}
    </WaCheckbox>
  );
}

export default Checkbox;

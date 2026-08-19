import WaTextarea from '@awesome.me/webawesome/dist/react/textarea/index.js';

export interface TextareaProps
  extends Omit<React.ComponentProps<typeof WaTextarea>, 'onInput'> {
  /** Called with the current value on every keystroke. See Input for why. */
  onValueChange?: (value: string) => void;
}

function Textarea({ onValueChange, ...props }: TextareaProps) {
  return (
    <WaTextarea
      {...props}
      onInput={(e) => onValueChange?.(e.currentTarget.value ?? '')}
    />
  );
}

export default Textarea;

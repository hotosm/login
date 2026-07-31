import WaInput from '@awesome.me/webawesome/dist/react/input/index.js';

export interface InputProps
  extends Omit<React.ComponentProps<typeof WaInput>, 'onInput'> {
  /**
   * Called with the current value on every keystroke. Web Awesome emits native
   * `input` events, which React's synthetic `onChange` does not pick up on
   * custom elements — see https://webawesome.com/docs/frameworks/react/
   */
  onValueChange?: (value: string) => void;
}

function Input({ onValueChange, ...props }: InputProps) {
  return (
    <WaInput
      {...props}
      onInput={(e) => onValueChange?.(e.currentTarget.value ?? '')}
    />
  );
}

export default Input;

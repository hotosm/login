import { withScheme } from '@/utils/withScheme';
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

function Input({ onValueChange, onBlur, ...props }: InputProps) {
  return (
    <WaInput
      {...props}
      onInput={(e) => onValueChange?.(e.currentTarget.value ?? '')}
      onBlur={(e) => {
        // People type website addresses the way they say them, but `type="url"`
        // rejects anything without a scheme. Complete it once they leave the
        // field, so the value they're left looking at is the one we store.
        if (props.type === 'url') {
          const completed = withScheme(e.currentTarget.value ?? '');
          if (completed !== e.currentTarget.value) onValueChange?.(completed);
        }
        onBlur?.(e);
      }}
    />
  );
}

export default Input;

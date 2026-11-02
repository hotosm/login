import WaSwitch from '@awesome.me/webawesome/dist/react/switch/index.js';

export interface SwitchProps
  extends Omit<React.ComponentProps<typeof WaSwitch>, 'onInput'> {
  /** Called with the checked state whenever it's toggled. See Input for why. */
  onCheckedChange?: (checked: boolean) => void;
}

function Switch({ onCheckedChange, ...props }: SwitchProps) {
  return (
    <WaSwitch
      {...props}
      onInput={(e) => onCheckedChange?.(e.currentTarget.checked)}
    />
  );
}

export default Switch;

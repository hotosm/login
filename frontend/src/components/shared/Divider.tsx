import WaDivider from '@awesome.me/webawesome/dist/react/divider/index.js';

export interface DividerProps extends React.ComponentProps<typeof WaDivider> {}

function Divider(props: DividerProps) {
  return <WaDivider {...props} />;
}

export default Divider;

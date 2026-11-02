import WaBadge from '@awesome.me/webawesome/dist/react/badge/index.js';

export interface BadgeProps extends React.ComponentProps<typeof WaBadge> {
  children?: React.ReactNode;
}

function Badge({ children, ...props }: BadgeProps) {
  return <WaBadge {...props}>{children}</WaBadge>;
}

export default Badge;

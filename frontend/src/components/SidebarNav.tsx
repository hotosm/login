import WaBadge from '@awesome.me/webawesome/dist/react/badge/index.js';
import { NavLink, useHref } from 'react-router-dom';
import Icon from './shared/Icon';

export interface SidebarNavItem {
  to: string;
  label: string;
  /*  for admins and mangers */
  elevated?: boolean;
  /** URL of an SVG asset rendered after the label. */
  icon?: string;
  /** Open in a new tab instead of navigating in place. */
  newTab?: boolean;
  /** Count pill rendered after the label (hidden when 0). */
  badge?: number;
}

interface Props {
  title: string;
  items: SidebarNavItem[];
}

const baseClass =
  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors';

function linkClass(elevated: boolean) {
  return ({ isActive }: { isActive: boolean }) => {
    if (elevated) {
      return `${baseClass} font-semibold ${
        isActive ? 'text-hot-gray-800' : 'hover:bg-hot-gray-50'
      }`;
    }
    return `${baseClass} font-medium ${
      isActive
        ? 'bg-hot-gray-50'
        : 'text-hot-gray-700 hover:bg-hot-gray-50'
    }`;
  };
}


function SidebarLink({ item }: { item: SidebarNavItem }) {
  const href = useHref(item.to);
  const getClass = linkClass(!!item.elevated);
  const icon = item.icon && (
    <Icon src={item.icon} label="" className="w-3 h-3" />
  );
  const badge = !!item.badge && item.badge > 0 && (
    <WaBadge variant="danger" appearance="filled">
      {item.badge}
    </WaBadge>
  );

  if (item.newTab) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={getClass({ isActive: false })}
      >
        {icon}
        {item.label}
        {badge}
      </a>
    );
  }

  return (
    <NavLink to={item.to} className={getClass}>
      {icon}
      {item.label}
      {badge}
    </NavLink>
  );
}

function SidebarNav({ title, items }: Props) {
  const regular = items.filter((item) => !item.elevated);
  const elevated = items.filter((item) => item.elevated);

  const renderItem = (item: SidebarNavItem) => (
    <SidebarLink key={item.to} item={item} />
  );

  return (
    <div className="bg-white rounded-xl shadow-xl p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-hot-gray-500 px-3 mb-3">
        {title}
      </h2>
      <nav className="space-y-1">
        {regular.map(renderItem)}
        {elevated.length > 0 && (
          <>
            <div className="my-8 border-t border-hot-gray-200" />
            {elevated.map(renderItem)}
          </>
        )}
      </nav>
    </div>
  );
}

export default SidebarNav;

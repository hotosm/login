import { Link } from 'react-router-dom';
import type { GroupSummary } from '../types/groups';
import StatusBadge from './StatusBadge';

// Deterministic accent color for the initial-avatar when there's no logo.
const AVATAR_COLORS = [
  'bg-hot-red-500',
  'bg-emerald-500',
  'bg-blue-500',
  'bg-amber-500',
  'bg-violet-500',
  'bg-pink-500',
  'bg-teal-500',
];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

interface Props {
  group: GroupSummary;
  to: string;
  showStatus?: boolean;
}

function GroupCard({ group, to, showStatus }: Props) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 bg-white rounded-xl border border-hot-gray-200 p-4 hover:shadow-lg hover:border-hot-red-300 hover:-translate-y-0.5 transition-all"
    >
      {group.avatar_url ? (
        <img
          src={group.avatar_url}
          alt=""
          className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-hot-gray-100"
        />
      ) : (
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold flex-shrink-0 ${colorFor(
            group.name,
          )}`}
        >
          {group.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-hot-gray-900 truncate group-hover:text-hot-red-600 transition-colors">
          {group.name}
        </h3>
        {group.role && (
          <p className="text-xs text-hot-gray-500 capitalize">{group.role}</p>
        )}
      </div>
      {showStatus && <StatusBadge status={group.status} />}
    </Link>
  );
}

export default GroupCard;

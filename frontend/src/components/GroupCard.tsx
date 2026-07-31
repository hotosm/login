import { useNavigate } from 'react-router-dom';
import type { GroupSummary } from '../types/groups';
import Button from './Button';
import StatusBadge from './StatusBadge';
import Icon from './Icon';
import searchIcon from "../assets/icons/search.svg";
// Deterministic accent color for the initial-avatar when there's no logo.
// Soft tint + same-hue text, drawn from the hot.css palette. Every pair clears
// 5:1 against its background. The yellow scale has no dark step of its own, so
// it borrows hot-gray-950 for the letter.
const AVATAR_COLORS = [
  'bg-hot-red-100 text-hot-red-950',
  'bg-hot-blue-100 text-hot-blue-800',
  'bg-hot-success-100 text-hot-success-800',
  'bg-hot-yellow-100 text-hot-gray-950',
  'bg-hot-cyan-100 text-hot-cyan-950',
  'bg-hot-rose-100 text-hot-rose-800',
  'bg-hot-gray-100 text-hot-gray-900',
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
  const navigate = useNavigate();

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-[0_0_14px_rgba(0,0,0,0.2)] p-md flex flex-col justify-between gap-xl">
      <div className='flex flex-col gap-sm'>
      <div>{showStatus && <StatusBadge status={group.status} />}</div>
      <div className='flex flex-row gap-md'>
        {group.avatar_url ? (
        <img
          src={group.avatar_url}
          alt=""
          className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-hot-gray-100"
        />
      ) : (
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold flex-shrink-0 ${colorFor(
            group.name,
          )}`}
        >
          {group.name.charAt(0).toUpperCase()}
        </div>
      )}
        <div>
          <h3 className="font-bold text-xl leading-tight mb-1">{group.name}</h3>
          <span>{group.role}</span>
        </div>
      </div>
      </div>
      <Button
        className="self-start"
        onClick={() => navigate(to)}
      >
        <Icon slot='start' src={searchIcon} />
        View details
      </Button>
    </div>
    );
}

export default GroupCard;

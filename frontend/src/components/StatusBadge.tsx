import WaBadge from '@awesome.me/webawesome/dist/react/badge/index.js';
import type { CSSProperties } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

type Variant = 'success' | 'warning' | 'danger' | 'neutral';

/* TODO confirm tokens - same as toasts */ 
const palettes = {
  success: {
    '--wa-color-fill-normal': 'var(--hot-color-success-50)',
    '--wa-color-on-normal': 'var(--hot-color-success-900)',
    borderColor: 'var(--hot-color-success-200)',
  },
  warning: {
    '--wa-color-fill-normal': 'var(--hot-color-warning-50)',
    '--wa-color-on-normal': 'var(--hot-color-gray-950)',
    borderColor: 'var(--hot-color-warning-200)',
  },
  danger: {
    '--wa-color-fill-normal': 'var(--hot-color-red-50)',
    '--wa-color-on-normal': 'var(--hot-color-red-700)',
    borderColor: 'var(--hot-color-red-200)',
  },
  neutral: {
    '--wa-color-fill-normal': 'var(--hot-color-gray-100)',
    '--wa-color-on-normal': 'var(--hot-color-gray-700)',
    borderColor: 'var(--hot-color-gray-200)',
  },
} as Record<Variant, CSSProperties>;

const variants: Record<string, Variant> = {
  pending: 'warning',
  approved: 'success',
  active: 'success',
  rejected: 'danger',
};

// Colored pill reflecting a group's approval status
// (pending / approved / active / rejected).
function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();

  const labels: Record<string, string> = {
    pending: t('statusPending'),
    approved: t('statusApproved'),
    active: t('statusActive'),
    rejected: t('statusRejected'),
  };

  const variant = variants[status] ?? 'neutral';

  return (
    <WaBadge variant={variant} appearance="filled" style={palettes[variant]}>
      {labels[status] || status}
    </WaBadge>
  );
}

export default StatusBadge;

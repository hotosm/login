import { useLanguage } from '../contexts/LanguageContext';

// Colored pill reflecting a group's approval status
// (pending / approved / active / rejected).
function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();

  const styles: Record<string, string> = {
    pending: 'badge-warning',
    approved: 'badge-success',
    active: 'badge-success',
    rejected: 'bg-hot-red-100 text-hot-red-700',
  };
  const labels: Record<string, string> = {
    pending: t('statusPending'),
    approved: t('statusApproved'),
    active: t('statusActive'),
    rejected: t('statusRejected'),
  };

  const cls = styles[status] || 'bg-hot-gray-100 text-hot-gray-600';
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${cls}`}>{labels[status] || status}</span>;
}

export default StatusBadge;

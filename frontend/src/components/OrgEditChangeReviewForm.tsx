import { useLanguage } from '@/contexts/LanguageContext';
import type { GroupResponse } from '../types/groups';
import { creatorLabel } from '../utils/creatorLabel';
import Button from './shared/Button';

interface OrgEditChangeReviewFormProps {
  org: GroupResponse;
  onApproveEdit: () => void | Promise<void>;
  onRejectEdit: () => void | Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

type Translate = ReturnType<typeof useLanguage>['t'];

const FIELD_LABELS: Record<string, (t: Translate) => string> = {
  description: (t) => t('description'),
  contact_email: (t) => t('contactEmail'),
  website: (t) => t('website'),
  is_public: (t) => t('publicProfile'),
};

function formatValue(field: string, value: unknown, t: Translate): string {
  if (field === 'is_public') return value ? t('yes') : t('no');
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

function OrgEditChangeReviewForm({
  org,
  onApproveEdit,
  onRejectEdit,
  onCancel,
  submitting = false,
}: OrgEditChangeReviewFormProps) {
  const { t } = useLanguage();
  const requestedBy = creatorLabel(org);
  const pendingEdit = org.pending_edit ?? {};
  const currentValues: Record<string, unknown> = {
    description: org.description,
    contact_email: org.contact_email,
    website: org.website,
    is_public: org.is_public,
  };

  return (
    <div className="flex flex-col gap-xl border-b pb-xl">
      <dl className="space-y-3 text-sm">
        {Object.entries(pendingEdit).map(([field, proposedValue]) => (
          <div key={field} className="grid grid-cols-2 gap-3">
            <div>
              <dt className="font-medium text-hot-gray-700">
                {FIELD_LABELS[field]?.(t) ?? field}
              </dt>
              <dd className="text-hot-gray-500 break-words">
                {t('currentValue')}:{' '}
                {formatValue(field, currentValues[field], t)}
              </dd>
              <dd className="text-hot-gray-900 break-words">
                {t('proposedValue')}: {formatValue(field, proposedValue, t)}
              </dd>
            </div>
          </div>
        ))}
        {requestedBy && (
          <div>
            <dt className="font-medium text-hot-gray-700">
              {t('requestedBy')}
            </dt>
            <dd className="text-hot-gray-900 break-all">{requestedBy}</dd>
          </div>
        )}
      </dl>

      <div className="flex justify-end gap-2 flex-wrap">
        <Button appearance="plain" type="button" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button
          appearance="outlined"
          variant="danger"
          type="button"
          onClick={onRejectEdit}
          disabled={submitting}
        >
          {t('rejectEditBtn')}
        </Button>
        <Button
          appearance="accent"
          type="button"
          onClick={onApproveEdit}
          disabled={submitting}
        >
          {submitting ? t('saving') : t('approveEditBtn')}
        </Button>
      </div>
    </div>
  );
}

export default OrgEditChangeReviewForm;

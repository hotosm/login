import { useLanguage } from '@/contexts/LanguageContext';
import type { GroupResponse } from '../types/groups';
import { creatorLabel } from '../utils/creatorLabel';
import Button from './shared/Button';

interface OrgNameChangeReviewFormProps {
  org: GroupResponse;
  onApproveName: () => void | Promise<void>;
  onRejectName: () => void | Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

function OrgNameChangeReviewForm({
  org,
  onApproveName,
  onRejectName,
  onCancel,
  submitting = false,
}: OrgNameChangeReviewFormProps) {
  const { t } = useLanguage();
  const requestedBy = creatorLabel(org);

  return (
    <div className="flex flex-col gap-xl border-b pb-xl">
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="font-medium text-hot-gray-700">{t('currentName')}</dt>
          <dd className="text-hot-gray-900 break-words">{org.name}</dd>
        </div>
        <div>
          <dt className="font-medium text-hot-gray-700">{t('proposedName')}</dt>
          <dd className="text-hot-gray-900 break-words">{org.pending_name}</dd>
        </div>
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
          onClick={onRejectName}
          disabled={submitting}
        >
          {t('rejectNameBtn')}
        </Button>
        <Button
          appearance="accent"
          type="button"
          onClick={onApproveName}
          disabled={submitting}
        >
          {submitting ? t('saving') : t('approveNameBtn')}
        </Button>
      </div>
    </div>
  );
}

export default OrgNameChangeReviewForm;

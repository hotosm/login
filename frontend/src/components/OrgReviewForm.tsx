import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import type { GroupResponse } from '../types/groups';
import { creatorLabel } from '../utils/creatorLabel';
import Button from './Button';
import Textarea from './forms/Textarea';

interface OrgReviewFormProps {
  org: GroupResponse;
  onApprove: () => void | Promise<void>;
  onReject: (reason: string) => void | Promise<void>;
  onApproveName: () => void | Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

function OrgReviewForm({
  org,
  onApprove,
  onReject,
  onApproveName,
  onCancel,
  submitting = false,
}: OrgReviewFormProps) {
  const { t } = useLanguage();
  const [reason, setReason] = useState('');
  const requestedBy = creatorLabel(org);

  return (
    <div className="flex flex-col gap-xl border-b pb-xl">
      {org.banner_url && (
        <img
          src={org.banner_url}
          alt=""
          className="w-full h-32 object-cover rounded-lg"
        />
      )}

      {org.pending_name && (
        <p className="text-sm">
          <span className="text-hot-gray-500">{t('nameChangePending')}: </span>
          <span className="font-medium text-hot-gray-900">
            {org.pending_name}
          </span>
        </p>
      )}

      <dl className="space-y-3 text-sm">
        <div>
          <dt className="font-medium text-hot-gray-700">{t('description')}</dt>
          <dd className="text-hot-gray-900 whitespace-pre-wrap">
            {org.description || '—'}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-hot-gray-700">{t('website')}</dt>
          <dd>
            {org.website ? (
              <a
                href={org.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-hot-red-600 hover:underline break-all"
              >
                {org.website}
              </a>
            ) : (
              <span className="text-hot-gray-900">—</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-hot-gray-700">{t('contactEmail')}</dt>
          <dd className="text-hot-gray-900 break-all">
            {org.contact_email || '—'}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-hot-gray-700">{t('requestedOn')}</dt>
          <dd className="text-hot-gray-900">
            {new Date(org.created_at).toLocaleString()}
          </dd>
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

      <div>
        <label className="block text-sm font-medium text-hot-gray-700 mb-1">
          {t('rejectReason')}
        </label>
        <Textarea
          value={reason}
          onValueChange={setReason}
          rows={2}
          placeholder={t('rejectReasonHint')}
        />
      </div>

      <div className="flex justify-end gap-2 flex-wrap">
        <Button appearance="plain" type="button" onClick={onCancel}>
          {t('cancel')}
        </Button>
        {org.pending_name && (
          <Button
            appearance="outlined"
            type="button"
            onClick={onApproveName}
            disabled={submitting}
          >
            {t('approveNameBtn')}
          </Button>
        )}
        <Button
          appearance="outlined"
          variant="danger"
          type="button"
          onClick={() => onReject(reason)}
          disabled={submitting}
        >
          {t('rejectBtn')}
        </Button>
        <Button
          appearance="accent"
          type="button"
          onClick={onApprove}
          disabled={submitting}
        >
          {submitting ? t('saving') : t('approveBtn')}
        </Button>
      </div>
    </div>
  );
}

export default OrgReviewForm;

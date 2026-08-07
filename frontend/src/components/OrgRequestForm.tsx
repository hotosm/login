import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import Button from './Button';
import Input from './forms/Input';
import Textarea from './forms/Textarea';

export interface OrgRequestPayload {
  name: string;
  contactEmail: string;
  website: string;
  description: string;
  avatarFile: File | null;
  bannerFile: File | null;
}

const EMPTY: OrgRequestPayload = {
  name: '',
  contactEmail: '',
  website: '',
  description: '',
  avatarFile: null,
  bannerFile: null,
};

interface OrgRequestFormProps {
  onSubmit: (payload: OrgRequestPayload) => void | Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

function OrgRequestForm({
  onSubmit,
  onCancel,
  submitting = false,
}: OrgRequestFormProps) {
  const { t } = useLanguage();
  const [values, setValues] = useState<OrgRequestPayload>(EMPTY);

  const set = <K extends keyof OrgRequestPayload>(
    key: K,
    value: OrgRequestPayload[K],
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-xl border-b pb-xl">
      <div className='space-y-4'>
        <div>
          <Input
            type="text"
            label={t('name')}
            hint={t('orgNameHint')}
            required
            value={values.name}
            onValueChange={(value) => set('name', value)}
          />
        </div>
        <div>
          <Input
            type="email"
            required
            label={t('contactEmail')}
            value={values.contactEmail}
            onValueChange={(value) => set('contactEmail', value)}
          />
        </div>
        <div>
          <Input
            type="url"
            label={t('website')}
            value={values.website}
            onValueChange={(value) => set('website', value)}
          />
        </div>
        <div>
          <Textarea
            label={t('description')}
            value={values.description}
            onValueChange={(value) => set('description', value)}
            rows={3}
          />
        </div>
        {/* wa-input has no `file` type, so these stay native inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-hot-gray-700 mb-1">
              {t('avatarLabel')}
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => set('avatarFile', e.target.files?.[0] ?? null)}
              className="text-sm text-hot-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-hot-gray-700 mb-1">
              {t('bannerLabel')}
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => set('bannerFile', e.target.files?.[0] ?? null)}
              className="text-sm text-hot-gray-600"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button appearance="plain" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button appearance="accent" type="submit" disabled={submitting}>
          {submitting ? t('saving') : t('submitRequest')}
        </Button>
      </div>
    </form>
  );
}

export default OrgRequestForm;

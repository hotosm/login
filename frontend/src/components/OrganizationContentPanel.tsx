import type WaAccordion from '@awesome.me/webawesome/dist/components/accordion/accordion.js';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import externalLinkIcon from '../assets/icons/box-arrow-up-right.svg';
import { localeName } from '../constants/locales';
import { useLanguage } from '../contexts/LanguageContext';
import type { GroupDetailsPatch } from '../hooks/useGroups';
import { useOrgContentDrafts } from '../hooks/useOrgContentDrafts';
import type { GroupResponse } from '../types/groups';
import { TAGLINE_MAX, portalUrl } from '../utils/portal';
import { isValidYoutubeUrl } from '../utils/youtube';
import ConfirmDialog from './ConfirmDialog';
import Input from './forms/Input';
import Accordion from './shared/Accordion';
import AccordionItem from './shared/AccordionItem';
import Badge from './shared/Badge';
import Button from './shared/Button';
import Divider from './shared/Divider';
import Dropdown from './shared/Dropdown';
import DropdownItem from './shared/DropdownItem';
import Icon from './shared/Icon';
import MarkdownEditor from './shared/MarkdownEditor';

const TRANSLATION_STATUS_KEYS = {
  empty: 'orgLocaleEmpty',
  partial: 'orgLocalePartial',
  complete: 'orgLocaleComplete',
} as const;

// Locale of the item an Accordion event is about.
const eventLocale = (event: Event) =>
  (event as CustomEvent<{ item: HTMLElement }>).detail.item.dataset.locale;

interface OrganizationContentPanelProps {
  org: GroupResponse;
  saving: boolean;
  updateGeneral: (patch: GroupDetailsPatch) => Promise<GroupResponse | null>;
}

/**
 * The org's translatable content (Public profile tab): one collapsible group
 * per locale, the base plus translations added one at a time. Saves on its
 * own, apart from the Details tab.
 */
function OrganizationContentPanel({
  org,
  saving,
  updateGeneral,
}: OrganizationContentPanelProps) {
  const { t, currentLanguage } = useLanguage();
  const {
    listedLocales,
    openLocale,
    removingLocale,
    baseLocale,
    baseHasSavedContent,
    draftOf,
    hasContent,
    hasUnsavedChanges,
    translationStatus,
    addablePortalLocales,
    addableOtherLocales,
    setOpen,
    setDraftField,
    addLanguage,
    requestRemove,
    cancelRemove,
    confirmRemove,
    reset,
    buildSavePayload,
  } = useOrgContentDrafts(org);

  const name = (locale: string) => localeName(locale, currentLanguage);

  const accordionRef = useRef<WaAccordion>(null);
  // A new object per request, so asking for the already open group scrolls too.
  const [scrollTarget, setScrollTarget] = useState<{ locale: string } | null>(
    null,
  );

  const openAndScrollTo = (locale: string) => {
    setOpen(locale, true);
    setScrollTarget({ locale });
  };

  // The Accordion only fires its events for clicks, so programmatic opens
  // scroll from here, once every group has finished animating: the one
  // collapsing above would otherwise move the target.
  useEffect(() => {
    const items = accordionRef.current?.querySelectorAll<
      HTMLElement & { updateComplete: Promise<boolean> }
    >('wa-accordion-item');
    if (!scrollTarget || !items) return;
    let cancelled = false;
    (async () => {
      await Promise.all([...items].map((item) => item.updateComplete));
      await Promise.allSettled(
        [...items]
          .flatMap((item) => item.shadowRoot?.getAnimations() ?? [])
          .map((animation) => animation.finished),
      );
      if (cancelled) return;
      [...items]
        .find((item) => item.dataset.locale === scrollTarget.locale)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    })();
    return () => {
      cancelled = true;
    };
  }, [scrollTarget]);

  const handleSave = async () => {
    const result = buildSavePayload();
    if (!result.ok) {
      openAndScrollTo(result.locale);
      toast.error(
        t(
          result.error === 'required'
            ? 'orgRequiredFieldsMissing'
            : 'orgVideoInvalid',
        ),
      );
      return;
    }
    try {
      const updated = await updateGeneral(result.payload);
      if (updated) toast.success(t('generalSaved'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const showPortalLink =
    org.is_public && org.status === 'approved' && baseHasSavedContent;
  const portalLink = (locale: string) =>
    portalUrl(`org/${org.slug}?lang=${locale}`, currentLanguage);

  return (
    <div className="space-y-6">
      <div className="flex">
        {addablePortalLocales.length + addableOtherLocales.length > 0 && (
          <Dropdown
            className="wa-dropdown-scroll"
            onSelect={(e) => {
              const { value } = e.detail.item as HTMLElement & {
                value?: string;
              };
              if (value) {
                addLanguage(value);
                setScrollTarget({ locale: value });
              }
            }}
          >
            <Button slot="trigger" variant="neutral" appearance="accent">
              <Icon slot="start" name="plus" label="" />
              {t('orgAddLanguage')}
            </Button>
            {addablePortalLocales.length > 0 && (
              <>
                {addablePortalLocales.map((code) => (
                  <DropdownItem key={code} value={code}>
                    {name(code)}
                  </DropdownItem>
                ))}
              </>
            )}
            {addablePortalLocales.length > 0 &&
              addableOtherLocales.length > 0 && <Divider />}
            {addableOtherLocales.length > 0 && (
              <>
                {addableOtherLocales.map(({ code, name: label }) => (
                  <DropdownItem key={code} value={code}>
                    {label}
                  </DropdownItem>
                ))}
              </>
            )}
          </Dropdown>
        )}
      </div>

      <Accordion
        ref={accordionRef}
        appearance="plain"
        mode="single-collapsible"
        className="org-language-accordion"
        onWaExpand={(e) => {
          const locale = eventLocale(e);
          if (locale) setOpen(locale, true);
        }}
        onWaCollapse={(e) => {
          const locale = eventLocale(e);
          if (locale) setOpen(locale, false);
        }}
      >
        {listedLocales.map((locale) => {
          const isBase = locale === baseLocale;
          const draft = draftOf(locale);
          const base = draftOf(baseLocale);
          const videoInvalid = !isValidYoutubeUrl(draft.video_url);
          return (
            <AccordionItem
              key={locale}
              data-locale={locale}
              expanded={openLocale === locale}
              className="border-t border-b border-hot-gray-200"
            >
              <span
                slot="label"
                className="flex flex-wrap items-center gap-2 py-lg"
              >
                <Icon
                  name="chevron-down"
                  label=""
                  className="org-language-accordion__chevron"
                />
                <span className="font-semibold">{name(locale)}</span>
                {isBase ? (
                  <>
                    <Badge
                      variant="neutral"
                      appearance="accent"
                      className="uppercase"
                    >
                      {t('orgLocaleBase')}
                    </Badge>
                    <span className="text-sm text-hot-gray-500">
                      {t('orgBaseShownWhen')}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-hot-gray-500">
                    {t(TRANSLATION_STATUS_KEYS[translationStatus(locale)])}
                  </span>
                )}
                {hasUnsavedChanges(locale) && (
                  <span title={t('orgLocaleUnsaved')}>
                    <span aria-hidden="true">*</span>
                    <span className="sr-only">{t('orgLocaleUnsaved')}</span>
                  </span>
                )}
              </span>

              <div className="space-y-4 pb-lg">
                {isBase && locale === 'en' && !baseHasSavedContent && (
                  <p className="text-sm text-hot-gray-500">
                    {t('orgStartWithEnglish')}
                  </p>
                )}
                <Input
                  label={t('orgTagline')}
                  lang={locale}
                  value={draft.tagline}
                  maxlength={TAGLINE_MAX}
                  hint={t('orgTaglineCounter', {
                    count: draft.tagline.length,
                    max: TAGLINE_MAX,
                  })}
                  placeholder={isBase ? undefined : base.tagline}
                  onValueChange={(value) =>
                    setDraftField(locale, 'tagline', value)
                  }
                />
                <div>
                  <label
                    htmlFor={`org-description-${locale}`}
                    className="block mb-1"
                  >
                    {t('description')}
                  </label>
                  <MarkdownEditor
                    id={`org-description-${locale}`}
                    lang={locale}
                    value={draft.description}
                    // An empty translation shows what visitors get instead
                    placeholder={isBase ? t('markdownHint') : base.description}
                    onChange={(value) =>
                      setDraftField(locale, 'description', value)
                    }
                  />
                </div>
                <Input
                  type="url"
                  label={t('orgVideo')}
                  lang={locale}
                  value={draft.video_url}
                  placeholder={isBase ? undefined : base.video_url}
                  onValueChange={(value) =>
                    setDraftField(locale, 'video_url', value)
                  }
                >
                  <span
                    slot="hint"
                    className={videoInvalid ? 'text-hot-red-600' : undefined}
                  >
                    {videoInvalid ? t('orgVideoInvalid') : t('orgVideoHint')}
                  </span>
                </Input>
                {(showPortalLink || !isBase) && (
                  <div className="flex items-center justify-between gap-2">
                    {showPortalLink && (
                      <Button
                        appearance="plain"
                        size="small"
                        href={portalLink(locale)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t('orgViewInPortal')}
                        <Icon slot="end" src={externalLinkIcon} label="" />
                      </Button>
                    )}
                    {!isBase && (
                      <Button
                        variant="danger"
                        appearance="outlined"
                        className="ml-auto"
                        onClick={() => requestRemove(locale)}
                      >
                        {t('orgRemoveTranslation')}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </AccordionItem>
          );
        })}
      </Accordion>

      {listedLocales.length === 1 && hasContent(draftOf(baseLocale)) && (
        <p className="text-sm italic text-hot-gray-500">
          {t('orgNoTranslationsYet')}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button appearance="plain" onClick={reset}>
          {t('cancel')}
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? t('saving') : t('saveChanges')}
        </Button>
      </div>

      <ConfirmDialog
        open={removingLocale !== null}
        label={t('orgRemoveTranslationTitle', {
          // Rendered while closed too, and DisplayNames rejects an empty code
          language: removingLocale ? name(removingLocale) : '',
        })}
        message={t('orgRemoveTranslationConfirm', { base: name(baseLocale) })}
        confirmText={t('orgRemoveTranslationBtn')}
        danger
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
      />
    </div>
  );
}

export default OrganizationContentPanel;

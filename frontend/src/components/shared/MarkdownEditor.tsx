import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Textarea from '../forms/Textarea';
import { RichTextContent } from './RichTextContent';
import { Tab, TabGroup, TabPanel } from './Tabs';

interface MarkdownEditorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Language of the text being written, for spellcheck and screen readers. */
  lang?: string;
  maxLength?: number;
}

/**
 * Plain textarea with a markdown preview tab. Copied from portal's
 * MarkdownEditor.
 *
 * The preview renders through `RichTextContent` (react-markdown), the same
 * component that renders the stored description on the read view, so what the
 * user sees here matches what gets published — and it inherits react-markdown's
 * safe-by-default HTML handling.
 */
function MarkdownEditor({
  id,
  value,
  onChange,
  placeholder,
  lang,
  maxLength,
}: MarkdownEditorProps) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'write' | 'preview'>('write');

  return (
    <div className="markdown-editor">
      <TabGroup
        active={tab}
        onWaTabShow={(e) => {
          // Usually nested in a page's own tab group: keep this one's events here
          e.stopPropagation();
          setTab(e.detail.name as 'write' | 'preview');
        }}
        className="wa-tabs-equal-height wa-tabs-compact"
      >
        <Tab panel="write">{t('markdownWrite')}</Tab>
        <Tab panel="preview">{t('markdownPreview')}</Tab>

        <TabPanel name="write">
          <Textarea
            id={id}
            value={value}
            rows={14}
            placeholder={placeholder}
            lang={lang}
            maxlength={maxLength}
            onValueChange={onChange}
          />
        </TabPanel>

        <TabPanel name="preview">
          <div className="h-[350px] overflow-scroll" lang={lang}>
            <RichTextContent content={value} />
          </div>
        </TabPanel>
      </TabGroup>
    </div>
  );
}

export default MarkdownEditor;

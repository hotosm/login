import Button, { type ButtonProps } from './shared/Button'

interface PanelHeaderProps {
  sectionName: string;
  buttonText?: string;
  buttonOnPress?: ButtonProps['onClick'];
  hideButton?: boolean;
}

function PanelHeader({ sectionName, buttonText, buttonOnPress, hideButton }: PanelHeaderProps) {
  return <>
        <div className="flex items-center justify-between border-b border-gray-100 pb-lg mb-lg">
          <span className="text-xl font-bold">{sectionName}</span>
          {buttonText && !hideButton &&
            <Button
              type="button"
              onClick={buttonOnPress}
            >
              {buttonText}
            </Button>
          }
        </div>
        {/* <p className="text-sm text-hot-gray-500 mb-4">
          {t('organizationsSubtitle')}
        </p>  */}
    </>
}

export default PanelHeader
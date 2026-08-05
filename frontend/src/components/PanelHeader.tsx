import Button, { type ButtonProps } from './Button'

interface PanelHeaderProps {
  sectionName: string;
  buttonText?: string;
  buttonOnPress?: ButtonProps['onClick'];
}

function PanelHeader({ sectionName, buttonText, buttonOnPress }: PanelHeaderProps) {
  return <>
        <div className="flex items-center justify-between border-b border-gray-100 pb-lg mb-lg">
          <span className="text-xl font-bold">{sectionName}</span>
          {buttonText &&
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
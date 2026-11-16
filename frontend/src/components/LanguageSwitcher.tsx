import { useLanguage } from "../contexts/LanguageContext";
import { LANGUAGES } from "../translations";
import translateIcon from "../assets/images/icon-translate.svg";
import Button from "./shared/Button";
import Dropdown from "./shared/Dropdown";
import DropdownItem from "./shared/DropdownItem";
import Icon from "./shared/Icon";

function LanguageSwitcher() {
  const { setLanguage } = useLanguage();

  return (
    <div className="flex justify-end">
      <Dropdown
        onSelect={(e) => {
          const { value: selected } = e.detail.item as HTMLElement & {
            value?: string;
          };
          if (selected) setLanguage(selected);
        }}
      >
        <Button slot="trigger" appearance="plain">
          <Icon src={translateIcon} label="Language" className="text-base" />
        </Button>
        {LANGUAGES.map((lang) => (
          <DropdownItem
            key={lang.code}
            value={lang.code}
          >
            {lang.name}
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
}

export default LanguageSwitcher;

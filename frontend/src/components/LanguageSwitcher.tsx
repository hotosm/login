import { useLanguage } from "../contexts/LanguageContext";
import { LANGUAGES } from "../translations";
import translateIcon from "../assets/images/icon-translate.svg";
import Dropdown from "./shared/Dropdown";
import DropdownItem from "./shared/DropdownItem";

function LanguageSwitcher() {
  const { currentLanguage, setLanguage } = useLanguage();

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
        <button
          type="button"
          slot="trigger"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 cursor-pointer"
        >
          <img src={translateIcon} alt="Language" className="w-4 h-4 pointer-events-none" />
        </button>
        {LANGUAGES.map((lang) => (
          <DropdownItem
            key={lang.code}
            value={lang.code}
            type="checkbox"
            checked={currentLanguage === lang.code}
          >
            {lang.name}
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
}

export default LanguageSwitcher;

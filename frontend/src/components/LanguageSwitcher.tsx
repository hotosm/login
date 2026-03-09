import { useLanguage } from "../contexts/LanguageContext";
import { LANGUAGES } from "../translations";
import translateIcon from "../assets/images/icon-translate.svg";

function LanguageSwitcher() {
  const { currentLanguage, setLanguage } = useLanguage();

  return (
    <div className="flex justify-end mb-4">
      <div className="relative flex items-center gap-1.5 rounded-md px-2 py-1">
        <img src={translateIcon} alt="Language" className="w-4 h-4 pointer-events-none" />
        <select
          value={currentLanguage}
          onChange={(e) => setLanguage(e.target.value)}
          className="absolute opacity-0 inset-0 w-full h-full cursor-pointer"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default LanguageSwitcher;

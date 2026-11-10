import '@hotosm/ui';
import { Link } from 'react-router-dom';
import hotIcon from '../assets/images/hot-icon.svg';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

function Header() {
  const { t } = useLanguage();

  return (
    <div className="container flex gap-sm md:gap-xl py-md justify-between items-center">
      <Link
        to="/profile"
        className="flex items-center gap-lg hover:no-underline"
      >
        <img src={hotIcon} alt="HOT" className="h-8 w-auto" />

        <span
          className="text-[20px] font-bold text-hot-gray-950 leading-tight"
          style={{ fontFamily: 'Barlow, sans-serif' }}
        >
          {t('hotAccount')}
        </span>
      </Link>

      <div className="flex items-center gap-xs">
        <LanguageSwitcher />
        <hotosm-tool-menu />
      </div>
    </div>
  );
}

export default Header;

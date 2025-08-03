import React from 'react';
import { View } from '../types';
import Icon from './Icon';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isScrolled: boolean;
  scrollDirection: 'up' | 'down';
}

const Header = React.forwardRef<HTMLHeadElement, HeaderProps>(({ activeView, setActiveView, isScrolled, scrollDirection }, ref) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  
  const navItems: { id: View; labelKey: string; }[] = [
    { id: 'chatbot', labelKey: 'aiAnalyzer' },
    { id: 'tracker', labelKey: 'healthTracker' },
    { id: 'diet', labelKey: 'dietPlanner' },
    { id: 'exercise', labelKey: 'exercisePlanner' },
  ];
  
  return (
    <header 
      ref={ref} 
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
        scrollDirection === 'down' && isScrolled ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className={`pt-4 transition-all duration-300 ${isScrolled ? 'bg-gray-100/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/80 dark:border-slate-700/80' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className={`relative grid items-center justify-center transition-all duration-300 ${isScrolled ? 'h-14' : 'h-28'}`}>
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-2">
                <div className={`flex-shrink-0 bg-teal-500 flex items-center justify-center text-white shadow-sm rounded-full transition-all duration-300 ${isScrolled ? 'h-8 w-8' : 'h-10 w-10'}`}>
                    <Icon name="logo" className={`transition-all duration-300 ${isScrolled ? 'h-5 w-5' : 'h-6 w-6'}`} />
                </div>
                <h1 className={`font-bold text-gray-800 dark:text-gray-200 transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-3xl'}`}>পরামর্শক AI</h1>
              </div>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
               <button 
                  onClick={toggleLanguage}
                  className="px-3 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 bg-gray-200/80 hover:bg-gray-300/80 text-gray-700 dark:bg-slate-700/80 dark:hover:bg-slate-600/80 dark:text-gray-300"
                  aria-label={`Switch to ${language === 'en' ? 'Bengali' : 'English'}`}
                >
                  {language === 'en' ? 'বাংলা' : 'EN'}
                </button>
                <button
                  onClick={toggleTheme}
                  className="h-9 w-9 flex items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200 bg-gray-200/80 hover:bg-gray-300/80 text-gray-700 dark:bg-slate-700/80 dark:hover:bg-slate-600/80 dark:text-gray-300"
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  <Icon name={theme === 'light' ? 'moon' : 'sun'} className="h-5 w-5" />
                </button>
            </div>
          </div>
          
           {/* Segmented Control Navigation */}
           <div className="pb-3">
            <div className="p-1 bg-gray-200/70 dark:bg-slate-800 rounded-lg grid grid-cols-2 md:grid-cols-4 items-center justify-between gap-1">
                {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full py-2 text-sm font-semibold rounded-md transition-all duration-300 focus:outline-none ${
                    activeView === item.id
                        ? 'bg-white dark:bg-slate-950 text-gray-800 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300/50 dark:hover:bg-slate-700/50'
                    }`}
                >
                    {t(item.labelKey)}
                </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
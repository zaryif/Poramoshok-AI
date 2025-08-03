import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

const Loader: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
             <svg className="animate-spin h-5 w-5 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-medium">{t('thinking')}</span>
        </div>
    );
};

export default Loader;
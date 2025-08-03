import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { HealthEntry, HealthAdvice } from '../types';
import { getHealthAdvice } from '../services/geminiService';
import Icon from './Icon';
import Loader from './Loader';
import Disclaimer from './Disclaimer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../contexts/ThemeContext';

const SummaryCard: React.FC<{ title: string; value: string; unit: string; icon: 'weight' | 'bmi' }> = ({ title, value, unit, icon }) => {
    const icons = {
        weight: <Icon name="heart" className="h-6 w-6 text-red-500" />,
        bmi: <Icon name="summary" className="h-6 w-6 text-orange-500" />
    };
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200/80 dark:border-slate-700/80 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center text-sm font-semibold text-gray-500 dark:text-gray-400">
                {icons[icon]}
                <span className="ml-2">{title}</span>
            </div>
            <div className="mt-2">
                <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">{value}</span>
                <span className="ml-1 text-lg font-medium text-gray-500 dark:text-gray-400">{unit}</span>
            </div>
        </div>
    );
};

const AdviceCard: React.FC<{ title: string; advice: string[]; iconName: 'food' | 'exercise' | 'heart'}> = ({ title, advice, iconName }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl border border-gray-200/80 dark:border-slate-700/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center mb-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Icon name={iconName} className="h-5 w-5" />
                </div>
                <h4 className="ml-3 font-semibold text-gray-800 dark:text-gray-200">{title}</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 list-disc pl-5">
                {advice.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </div>
    );
};


const BMIIndicator: React.FC<{ bmi: number | null }> = ({ bmi }) => {
    const { t } = useLanguage();
    if (bmi === null) {
        return null;
    }

    const categories = [
        { name: t('bmiUnderweight'), max: 18.5, textColor: 'text-blue-600 dark:text-blue-400' },
        { name: t('bmiNormal'), max: 25, textColor: 'text-green-600 dark:text-green-400' },
        { name: t('bmiOverweight'), max: 30, textColor: 'text-yellow-600 dark:text-yellow-400' },
        { name: t('bmiObese'), max: Infinity, textColor: 'text-red-600 dark:text-red-400' },
    ];

    const currentCategory = categories.find(c => bmi < c.max)!;
    
    const scaleMin = 15;
    const scaleMax = 40;
    
    const percentage = Math.max(0, Math.min(100, ((bmi - scaleMin) / (scaleMax - scaleMin)) * 100));

    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl border border-gray-200/80 dark:border-slate-700/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('bmiAnalysis')}</h3>
            <div className="relative pt-10 pb-4">
                <div className="absolute top-0 transition-all duration-300 ease-out" style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}>
                     <div className="relative flex flex-col items-center">
                        <span className="px-2 py-0.5 rounded-md bg-gray-800 dark:bg-gray-200 text-white dark:text-black text-sm font-bold shadow-md">{bmi.toFixed(1)}</span>
                        <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-800 dark:border-t-gray-200 mt-1"></div>
                     </div>
                </div>

                <div className="w-full h-3 rounded-full mt-2 relative" >
                    <div 
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(to right, #60a5fa 14%, #4ade80 14% 40%, #facc15 40% 60%, #ef4444 60%)'}}
                    ></div>
                    <div className="absolute -bottom-5 w-full text-xs text-gray-500 dark:text-gray-400">
                        <span className="absolute" style={{ left: '14%', transform: 'translateX(-50%)' }}>18.5</span>
                        <span className="absolute" style={{ left: '40%', transform: 'translateX(-50%)' }}>25</span>
                        <span className="absolute" style={{ left: '60%', transform: 'translateX(-50%)' }}>30</span>
                    </div>
                </div>
                
                <div className="text-center mt-10">
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('bmiIndicatorText')} 
                        <span className={`font-bold text-lg mx-1 ${currentCategory.textColor}`}>{currentCategory.name}</span> 
                        {t('bmiCategoryText')}
                    </p>
                </div>
            </div>
        </div>
    );
};


const HealthTracker: React.FC = () => {
    const [age, setAge] = useState('');
    const [height, setHeight] = useState(''); // single source of truth: height in cm
    const [weight, setWeight] = useState('');
    const [history, setHistory] = useState<HealthEntry[]>([]);
    const [advice, setAdvice] = useState<HealthAdvice | null>(null);
    const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
    const [adviceError, setAdviceError] = useState<string | null>(null);
    const [ageError, setAgeError] = useState<string | null>(null);
    const downloadAreaRef = useRef<HTMLDivElement>(null);
    const { language, t } = useLanguage();
    const { theme } = useTheme();
    
    const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
    const [feet, setFeet] = useState('');
    const [inches, setInches] = useState('');


    const fetchAdvice = useCallback(async (currentHistory: HealthEntry[], lang: 'en' | 'bn') => {
        if (currentHistory.length === 0) return;
        setIsLoadingAdvice(true);
        setAdviceError(null);
        try {
            const newAdvice = await getHealthAdvice(currentHistory, lang);
            setAdvice(newAdvice);
            localStorage.setItem(`healthAdvice_${lang}`, JSON.stringify(newAdvice));
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : t('fetchAdviceError');
            setAdviceError(message);
        } finally {
            setIsLoadingAdvice(false);
        }
    }, [t]);
    
    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('healthHistory');
            const parsedHistory = storedHistory ? JSON.parse(storedHistory) : [];
            setHistory(parsedHistory);
            
            const storedAge = localStorage.getItem('userAge');
            if (storedAge) {
                setAge(storedAge);
            }
        } catch (error) {
            console.error("Failed to parse from localStorage", error);
            localStorage.removeItem('healthHistory');
            localStorage.removeItem('userAge');
        }
    }, []);
    
    useEffect(() => {
        if(history.length > 0) {
            localStorage.setItem('healthHistory', JSON.stringify(history));
            try {
                const storedAdvice = localStorage.getItem(`healthAdvice_${language}`);
                if (storedAdvice) {
                    setAdvice(JSON.parse(storedAdvice));
                } else {
                    fetchAdvice(history, language);
                }
            } catch (error) {
                 console.error("Failed to parse advice from localStorage", error);
                 localStorage.removeItem(`healthAdvice_${language}`);
                 fetchAdvice(history, language);
            }
        } else {
            localStorage.removeItem('healthHistory');
            localStorage.removeItem('healthAdvice_en');
            localStorage.removeItem('healthAdvice_bn');
            setAdvice(null);
        }
    }, [history, language, fetchAdvice]);

    useEffect(() => {
        if (heightUnit === 'ft') {
            const ft = parseFloat(feet) || 0;
            const inch = parseFloat(inches) || 0;
            const totalInches = (ft * 12) + inch;
            if (totalInches > 0) {
                setHeight((totalInches * 2.54).toFixed(1));
            } else {
                setHeight('');
            }
        }
    }, [feet, inches, heightUnit]);

    const handleHeightCmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHeight(e.target.value);
    };

    const handleToggleUnit = () => {
        if (heightUnit === 'cm') {
            const cm = parseFloat(height);
            if (!isNaN(cm) && cm > 0) {
                const totalInches = cm / 2.54;
                const ft = Math.floor(totalInches / 12);
                const inch = totalInches % 12;
                setFeet(ft.toString());
                setInches(inch.toFixed(1));
            } else {
                setFeet('');
                setInches('');
            }
            setHeightUnit('ft');
        } else {
            const cm = parseFloat(height);
            if (isNaN(cm) || cm <= 0) {
                setHeight('');
            }
            setHeightUnit('cm');
        }
    };
    
    const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAge = e.target.value;
        setAge(newAge);
        localStorage.setItem('userAge', newAge);
        if(ageError) setAgeError(null);
    };

    const lastEntry = useMemo(() => history.length > 0 ? history[history.length - 1] : null, [history]);

    const bmi = useMemo(() => {
        const h = parseFloat(height);
        const w = parseFloat(weight);
        if (h > 0 && w > 0) {
            const heightInMeters = h / 100;
            return w / (heightInMeters * heightInMeters);
        }
        return 0;
    }, [height, weight]);

    const handleAddEntry = (e: React.FormEvent) => {
        e.preventDefault();
        setAgeError(null);
        if (!age) {
            setAgeError(t('ageRequiredError'));
            return;
        }
        if (bmi > 0) {
            const newEntry: HealthEntry = {
                date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD for sorting
                age: parseInt(age, 10),
                height: parseFloat(height),
                weight: parseFloat(weight),
                bmi: bmi,
            };
            const updatedHistory = [...history, newEntry].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setHistory(updatedHistory);
            fetchAdvice(updatedHistory, language); // Fetch advice in current language
            setHeight('');
            setWeight('');
            setFeet('');
            setInches('');
        }
    };
    
    const handleDownloadImage = useCallback(() => {
        const node = downloadAreaRef.current;
        if (node === null) return;
        htmlToImage.toPng(node, { cacheBust: true, backgroundColor: theme === 'dark' ? '#0f172a' : '#f1f5f9', pixelRatio: 2, height: node.scrollHeight, width: node.scrollWidth })
          .then((dataUrl) => {
            const image = new Image();
             image.src = dataUrl;
             image.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                ctx.drawImage(image, 0, 0);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                const fontSize = image.width / 60;
                ctx.font = `bold ${fontSize}px sans-serif`;
                ctx.textAlign = 'right';
                ctx.textBaseline = 'bottom';
                ctx.fillText('পরামর্শক AI', canvas.width - (fontSize), canvas.height - (fontSize));
                const link = document.createElement('a');
                link.download = 'health-tracker-summary.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
             }
          }).catch((err) => console.error('oops, something went wrong!', err));
      }, [theme]);

    const localeDate = (dateString: string) => new Date(dateString).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US');

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl border border-gray-200/80 dark:border-slate-700/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                 <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('yourProfile')}</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('profileInfo')}</p>
                 <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t('ageLabel')}</label>
                    <input type="number" id="age" value={age} onChange={handleAgeChange} className="block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2.5 bg-gray-50 dark:bg-slate-700" placeholder={t('agePlaceholder')} required />
                 </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl border border-gray-200/80 dark:border-slate-700/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('addNewEntry')}</h3>
                    {history.length > 0 && (
                        <button onClick={handleDownloadImage} className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-slate-600 shadow-sm text-sm leading-5 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors">
                            <Icon name="image-download" className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400"/>
                            {t('downloadImage')}
                        </button>
                    )}
                </div>
                <form onSubmit={handleAddEntry} className="space-y-4">
                    <div>
                        <label htmlFor="weight" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t('weightLabel')} (kg)</label>
                        <input type="number" step="0.1" id="weight" value={weight} onChange={e => setWeight(e.target.value)} className="block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2.5 bg-gray-50 dark:bg-slate-700" placeholder={t('weightPlaceholder')} required />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                             <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">{t('heightLabel')}</label>
                             <button type="button" onClick={handleToggleUnit} className="text-xs font-semibold text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 transition-colors px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-900/40 hover:bg-teal-100 dark:hover:bg-teal-900/60">
                                {t('heightUnitToggle', { unit: heightUnit === 'cm' ? 'ft, in' : 'cm' })}
                            </button>
                        </div>
                        {heightUnit === 'cm' ? (
                             <input type="number" step="0.1" id="height" value={height} onChange={handleHeightCmChange} className="block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2.5 bg-gray-50 dark:bg-slate-700" placeholder={t('heightPlaceholder') + ' (cm)'} required />
                        ) : (
                            <div className="flex items-center space-x-2">
                                <input type="number" value={feet} onChange={e => setFeet(e.target.value)} className="block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2.5 bg-gray-50 dark:bg-slate-700" placeholder={t('feetPlaceholder')} aria-label="feet" />
                                <input type="number" step="0.1" value={inches} onChange={e => setInches(e.target.value)} className="block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2.5 bg-gray-50 dark:bg-slate-700" placeholder={t('inchesPlaceholder')} aria-label="inches" />
                            </div>
                        )}
                    </div>

                    {bmi > 0 && (
                        <div className="p-3 bg-teal-50 dark:bg-teal-900/30 rounded-md text-center">
                            <p className="font-medium text-teal-800 dark:text-teal-300">{t('yourBmiIs')} <span className="font-bold">{bmi.toFixed(2)}</span></p>
                        </div>
                    )}
                    
                    {ageError && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-sm text-red-800 dark:text-red-300 flex items-start gap-2 rounded-md">
                           <p>{ageError}</p>
                        </div>
                    )}

                    <button type="submit" className="w-full bg-teal-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-teal-600 transition duration-200 disabled:opacity-60" disabled={!height || !weight || !age}>{t('addEntryButton')}</button>
                </form>
            </div>
            
            <div ref={downloadAreaRef} className="space-y-6 bg-slate-100 dark:bg-slate-900 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SummaryCard title={t('latestWeight')} value={lastEntry?.weight.toString() ?? '--'} unit="kg" icon="weight" />
                    <SummaryCard title={t('latestBmi')} value={lastEntry?.bmi.toFixed(2) ?? '--'} unit="" icon="bmi" />
                </div>

                {lastEntry && <BMIIndicator bmi={lastEntry.bmi} />}

                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl border border-gray-200/80 dark:border-slate-700/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                     <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('trendsTitle')}</h3>
                     {history.length > 0 ? (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={history} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                                    <XAxis dataKey="date" fontSize={12} tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} tickFormatter={(str) => new Date(str).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {month:'short', day:'numeric'})} />
                                    <YAxis yAxisId="left" dataKey="weight" domain={['dataMin - 2', 'dataMax + 2']} fontSize={12} tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                                    <YAxis yAxisId="right" dataKey="bmi" orientation="right" domain={['dataMin - 1', 'dataMax + 1']} fontSize={12} tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                                    <Tooltip contentStyle={{backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem'}}/>
                                    <Legend wrapperStyle={{fontSize: "14px", color: theme === 'dark' ? '#d1d5db' : '#374151'}}/>
                                    <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#ef4444" strokeWidth={2.5} activeDot={{ r: 8 }} name={t('weightLabel')} dot={false} />
                                    <Line yAxisId="right" type="monotone" dataKey="bmi" stroke="#f97316" strokeWidth={2.5} name="BMI" dot={false} />
                                 </LineChart>
                            </ResponsiveContainer>
                        </div>
                        ) : (
                        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                             <Icon name="history" className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="font-medium">{t('noChartData')}</p>
                            <p className="text-sm mt-1">{t('addEntryForChart')}</p>
                        </div>
                     )}
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 ml-1">{t('aiGeneratedAdvice')}</h3>
                    {isLoadingAdvice ? <div className="flex justify-center items-center h-48"><Loader /></div> 
                    : adviceError ? <div className="text-center text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-500/30"><p><strong>{t('errorLabel')}:</strong> {adviceError}</p></div>
                    : advice ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            <AdviceCard title={t('dietaryAdvice')} advice={advice.dietaryAdvice} iconName="food" />
                            <AdviceCard title={t('exerciseRecommendations')} advice={advice.exerciseRecommendations} iconName="exercise" />
                            <div className="lg:col-span-2 xl:col-span-1">
                                <AdviceCard title={t('lifestyleSuggestions')} advice={advice.lifestyleSuggestions} iconName="heart" />
                            </div>
                            <div className="lg:col-span-2 xl:col-span-3"><Disclaimer /></div>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-xl border border-gray-200/80 dark:border-slate-700/80">
                             <p className="text-gray-500 dark:text-gray-400 text-sm">{t('addEntryForAdvice')}</p>
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl border border-gray-200/80 dark:border-slate-700/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('allDataTitle')}</h3>
                    {history.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr>
                                        <th className="pb-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">{t('dateLabel')}</th>
                                        <th className="pb-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">{t('ageLabel')}</th>
                                        <th className="pb-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">{t('weightLabel')}</th>
                                        <th className="pb-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">{t('heightLabel')}</th>
                                        <th className="pb-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">BMI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...history].reverse().map((entry, index) => (
                                        <tr key={index} className="border-t border-gray-200 dark:border-slate-700">
                                            <td className="py-3 pr-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-300">{localeDate(entry.date)}</td>
                                            <td className="py-3 pr-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-300">{entry.age}</td>
                                            <td className="py-3 pr-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-300">{entry.weight} kg</td>
                                            <td className="py-3 pr-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-300">{entry.height} cm</td>
                                            <td className="py-3 pr-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-300 font-semibold">{entry.bmi.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                            <p className="font-medium">{t('noHealthEntries')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HealthTracker;
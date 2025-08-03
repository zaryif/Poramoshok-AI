import React, { createContext, useState, useCallback, ReactNode, useMemo } from 'react';

type Language = 'en' | 'bn';

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

const translations: { [lang in Language]: { [key: string]: string } } = {
    en: {
        // Header
        aiAnalyzer: 'AI Analyzer',
        healthTracker: 'Health Tracker',
        dietPlanner: 'Diet Planner',
        exercisePlanner: 'Exercise Planner',

        // Chatbot
        downloadChat: 'Download Chat',
        symptomAnalyzerTitle: 'Symptom Analyzer',
        symptomAnalyzerDescription: 'Describe symptoms like "headache and fever" to get an AI-powered analysis.',
        identifiedSymptoms: 'Identified Symptoms',
        potentialCauses: 'Potential Causes',
        suggestedTreatments: 'Suggested Treatments',
        possibleMedications: 'Possible Medications',
        symptomInputPlaceholder: 'Describe your symptoms...',
        sendMessage: 'Send message',
        aiAnalysisDisclaimer: 'Here is a potential analysis based on the symptoms you provided. Please remember this is not a medical diagnosis.',
        aiProcessError: "Sorry, I couldn't process that.",

        // Health Tracker
        yourProfile: 'Your Profile',
        profileInfo: 'Your age is used to personalize all AI recommendations.',
        ageLabel: 'Age',
        agePlaceholder: 'e.g., 25',
        ageRequiredError: 'Please enter your age in your profile to add an entry.',
        addNewEntry: 'Add New Entry',
        downloadImage: 'Download Image',
        weightLabel: 'Weight',
        weightPlaceholder: 'e.g., 70',
        heightLabel: 'Height',
        heightPlaceholder: 'e.g., 175',
        feetPlaceholder: 'ft',
        inchesPlaceholder: 'in',
        heightUnitToggle: 'Switch to {unit}',
        yourBmiIs: 'Your BMI is',
        addEntryButton: 'Add Entry',
        latestWeight: 'Latest Weight',
        latestBmi: 'Latest BMI',
        bmiAnalysis: 'BMI Analysis',
        bmiIndicatorText: 'Your BMI indicates you are in the',
        bmiCategoryText: 'category.',
        bmiUnderweight: 'Underweight',
        bmiNormal: 'Normal',
        bmiOverweight: 'Overweight',
        bmiObese: 'Obese',
        trendsTitle: 'Trends',
        noChartData: 'No data to show chart.',
        addEntryForChart: 'Add an entry to see your progress.',
        allDataTitle: 'All Data',
        dateLabel: 'Date',
        noHealthEntries: 'No health entries yet.',
        aiGeneratedAdvice: 'AI-Generated Advice',
        dietaryAdvice: 'Dietary Advice',
        exerciseRecommendations: 'Exercise Recommendations',
        lifestyleSuggestions: 'Lifestyle Suggestions',
        addEntryForAdvice: 'Add an entry to get personalized health advice from our AI.',
        fetchAdviceError: "Sorry, I couldn't fetch health advice at this moment.",

        // Diet/Exercise Planners
        createYourPlan: 'Create Your Plan',
        createYourExercisePlan: 'Create Your Exercise Plan',
        healthGoalLabel: 'Health Goal',
        goalWeightLoss: 'Weight Loss',
        goalMaintainWeight: 'Maintain Weight',
        goalMuscleGain: 'Muscle Gain',
        goalWeightGain: 'Weight Gain',
        dietaryPreferenceLabel: 'Dietary Preference',
        prefNonVegetarian: 'Non-Vegetarian',
        prefVegetarian: 'Vegetarian',
        prefVegan: 'Vegan',
        usingLatestHealthData: 'Using latest health data (Age: {age}, BMI: {bmi}) to tailor your plan.',
        noHealthDataForExercise: 'No health data. Add an entry in the Health Tracker for a personalized plan.',
        generatePlan: 'Generate Plan',
        generating: 'Generating...',
        your7DayPlan: 'Your 7-Day Plan',
        your7DayDietPlan: 'Your 7-Day Diet Plan',
        your7DayExercisePlan: 'Your 7-Day Exercise Plan',
        image: 'Image',
        plan: 'Plan',
        planSummary: 'Plan Summary',
        dailyNote: 'Daily Note',
        planWillAppearHere: 'Your plan will appear here.',
        selectGoalsForDiet: 'Select your goals to get a diet routine.',
        selectGoalsForExercise: 'Select your goal to get an exercise routine.',
        noHealthDataError: 'No health data found. Please add an entry in the Health Tracker first.',
        fitnessLevelLabel: 'Fitness Level',
        fitnessBeginner: 'Beginner',
        fitnessIntermediate: 'Intermediate',
        fitnessAdvanced: 'Advanced',
        locationLabel: 'Workout Location',
        locationHome: 'Home',
        locationGym: 'Gym',
        timePerDayLabel: 'Time Per Day',
        time30min: '30 Minutes',
        time45min: '45 Minutes',
        time60min: '60 Minutes',
        personalizedAdviceTitle: 'Personalized Advice',
        
        // Fun Fact
        funHealthFact: 'Fun Health Fact!',
        funFactError: 'An apple a day keeps the doctor away! (And so does a good laugh).',

        // General
        thinking: 'Thinking...',
        errorLabel: 'Error',
        unknownError: 'An unknown error occurred.',
        disclaimerTitle: 'Disclaimer',
        disclaimerText: 'The information provided by পরামর্শক AI is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.',
    },
    bn: {
        // Header
        aiAnalyzer: 'এআই অ্যানালাইজার',
        healthTracker: 'স্বাস্থ্য ট্র্যাকার',
        dietPlanner: 'ডায়েট প্ল্যানার',
        exercisePlanner: 'ব্যায়াম পরিকল্পনাকারী',

        // Chatbot
        downloadChat: 'চ্যাট ডাউনলোড করুন',
        symptomAnalyzerTitle: 'লক্ষণ বিশ্লেষক',
        symptomAnalyzerDescription: '"মাথাব্যথা এবং জ্বর" এর মতো লক্ষণ বর্ণনা করে এআই-চালিত বিশ্লেষণ পান।',
        identifiedSymptoms: 'শনাক্তকৃত লক্ষণ',
        potentialCauses: 'সম্ভাব্য কারণ',
        suggestedTreatments: 'প্রস্তাবিত চিকিৎসা',
        possibleMedications: 'সম্ভাব্য ঔষধ',
        symptomInputPlaceholder: 'আপনার লক্ষণ বর্ণনা করুন...',
        sendMessage: 'বার্তা পাঠান',
        aiAnalysisDisclaimer: 'আপনার দেওয়া লক্ষণগুলির উপর ভিত্তি করে এখানে একটি সম্ভাব্য বিশ্লেষণ দেওয়া হলো। দয়া করে মনে রাখবেন এটি কোনও ডাক্তারি تشخیص নয়।',
        aiProcessError: 'দুঃখিত, আমি এটি প্রক্রিয়া করতে পারিনি।',

        // Health Tracker
        yourProfile: 'আপনার প্রোফাইল',
        profileInfo: 'আপনার বয়স সমস্ত এআই সুপারিশ ব্যক্তিগতকৃত করতে ব্যবহৃত হয়।',
        ageLabel: 'বয়স',
        agePlaceholder: 'যেমন, ২৫',
        ageRequiredError: 'একটি তথ্য যোগ করার জন্য অনুগ্রহ করে আপনার প্রোফাইলে বয়স লিখুন।',
        addNewEntry: 'নতুন তথ্য যোগ করুন',
        downloadImage: 'ছবি ডাউনলোড করুন',
        weightLabel: 'ওজন',
        weightPlaceholder: 'যেমন, ৭০',
        heightLabel: 'উচ্চতা',
        heightPlaceholder: 'যেমন, ১৭৫',
        feetPlaceholder: 'ফুট',
        inchesPlaceholder: 'ইঞ্চি',
        heightUnitToggle: '{unit} এ পরিবর্তন করুন',
        yourBmiIs: 'আপনার বিএমআই হলো',
        addEntryButton: 'তথ্য যোগ করুন',
        latestWeight: 'সর্বশেষ ওজন',
        latestBmi: 'সর্বশেষ বিএমআই',
        bmiAnalysis: 'বিএমআই বিশ্লেষণ',
        bmiIndicatorText: 'আপনার বিএমআই অনুযায়ী আপনি',
        bmiCategoryText: 'বিভাগে আছেন।',
        bmiUnderweight: 'কম ওজন',
        bmiNormal: 'স্বাভাবিক',
        bmiOverweight: 'অতিরিক্ত ওজন',
        bmiObese: 'স্থূল',
        trendsTitle: 'ট্রেন্ডস',
        noChartData: 'চার্ট দেখানোর জন্য কোন ডেটা নেই।',
        addEntryForChart: 'আপনার অগ্রগতি দেখতে একটি নতুন তথ্য যোগ করুন।',
        allDataTitle: 'সমস্ত ডেটা',
        dateLabel: 'তারিখ',
        noHealthEntries: 'এখনও কোন স্বাস্থ্য তথ্য নেই।',
        aiGeneratedAdvice: 'এআই-জেনারেটেড পরামর্শ',
        dietaryAdvice: 'খাদ্য সংক্রান্ত পরামর্শ',
        exerciseRecommendations: 'ব্যায়াম সংক্রান্ত সুপারিশ',
        lifestyleSuggestions: 'জীবনধারা সংক্রান্ত পরামর্শ',
        addEntryForAdvice: 'আমাদের এআই থেকে ব্যক্তিগত স্বাস্থ্য পরামর্শ পেতে একটি তথ্য যোগ করুন।',
        fetchAdviceError: 'দুঃখিত, এই মুহূর্তে স্বাস্থ্য পরামর্শ আনা সম্ভব হচ্ছে না।',

        // Diet/Exercise Planners
        createYourPlan: 'আপনার প্ল্যান তৈরি করুন',
        createYourExercisePlan: 'আপনার ব্যায়াম পরিকল্পনা তৈরি করুন',
        healthGoalLabel: 'স্বাস্থ্য লক্ষ্য',
        goalWeightLoss: 'ওজন কমানো',
        goalMaintainWeight: 'ওজন বজায় রাখা',
        goalMuscleGain: 'পেশী গঠন',
        goalWeightGain: 'ওজন বাড়ানো',
        dietaryPreferenceLabel: 'খাদ্য পছন্দ',
        prefNonVegetarian: 'আমিষভোজী',
        prefVegetarian: 'নিরামিষভোজী',
        prefVegan: 'ভেগান',
        usingLatestHealthData: 'আপনার পরিকল্পনাটি তৈরি করার জন্য সর্বশেষ স্বাস্থ্য ডেটা (বয়স: {age}, বিএমআই: {bmi}) ব্যবহার করা হচ্ছে।',
        noHealthDataForExercise: 'কোনো স্বাস্থ্য তথ্য নেই। একটি ব্যক্তিগত পরিকল্পনা পেতে স্বাস্থ্য ট্র্যাকারে একটি তথ্য যোগ করুন।',
        generatePlan: 'প্ল্যান তৈরি করুন',
        generating: 'তৈরি করা হচ্ছে...',
        your7DayPlan: 'আপনার ৭-দিনের পরিকল্পনা',
        your7DayDietPlan: 'আপনার ৭-দিনের ডায়েট প্ল্যান',
        your7DayExercisePlan: 'আপনার ৭-দিনের ব্যায়াম পরিকল্পনা',
        image: 'ছবি',
        plan: 'প্ল্যান',
        planSummary: 'পরিকল্পনার সারসংক্ষেপ',
        dailyNote: 'দৈনিক নোট',
        planWillAppearHere: 'আপনার পরিকল্পনা এখানে প্রদর্শিত হবে।',
        selectGoalsForDiet: 'একটি খাদ্য তালিকা পেতে আপনার লক্ষ্য নির্বাচন করুন।',
        selectGoalsForExercise: 'একটি ব্যায়াম রুটিন পেতে আপনার লক্ষ্য নির্বাচন করুন।',
        noHealthDataError: 'কোন স্বাস্থ্য তথ্য পাওয়া যায়নি। অনুগ্রহ করে প্রথমে স্বাস্থ্য ট্র্যাকারে একটি তথ্য যোগ করুন।',
        fitnessLevelLabel: 'ফিটনেস লেভেল',
        fitnessBeginner: 'শিক্ষানবিস',
        fitnessIntermediate: 'মধ্যবর্তী',
        fitnessAdvanced: 'অগ্রসর',
        locationLabel: 'ব্যায়ামের স্থান',
        locationHome: 'বাড়ি',
        locationGym: 'জিম',
        timePerDayLabel: 'প্রতিদিন সময়',
        time30min: '৩০ মিনিট',
        time45min: '৪৫ মিনিট',
        time60min: '৬০ মিনিট',
        personalizedAdviceTitle: 'ব্যক্তিগত পরামর্শ',

        // Fun Fact
        funHealthFact: 'মজার স্বাস্থ্য তথ্য!',
        funFactError: 'দিনে একটি আপেল ডাক্তার থেকে দূরে রাখে! (এবং একটি ভালো হাসিও)।',

        // General
        thinking: 'ভাবছে...',
        errorLabel: 'ত্রুটি',
        unknownError: 'একটি অজানা ত্রুটি ঘটেছে।',
        disclaimerTitle: 'দাবিত্যাগ',
        disclaimerText: 'পরামর্শক AI দ্বারা প্রদত্ত তথ্য শুধুমাত্র তথ্যগত উদ্দেশ্যে এবং পেশাদার চিকিৎসা পরামর্শ, রোগ নির্ণয় বা চিকিৎসার বিকল্প নয়। যেকোনো চিকিৎসা সংক্রান্ত প্রশ্ন থাকলে সর্বদা আপনার চিকিৎসক বা অন্য যোগ্য স্বাস্থ্য প্রদানকারীর পরামর্শ নিন।',
    },
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');

    const toggleLanguage = useCallback(() => {
        setLanguage(prevLang => (prevLang === 'en' ? 'bn' : 'en'));
    }, []);

    const t = useCallback((key: string, replacements?: { [key: string]: string | number }) => {
        let translation = translations[language][key] || key;
        if (replacements) {
            Object.entries(replacements).forEach(([placeholder, value]) => {
                translation = translation.replace(`{${placeholder}}`, String(value));
            });
        }
        return translation;
    }, [language]);
    
    const value = useMemo(() => ({ language, toggleLanguage, t }), [language, toggleLanguage, t]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
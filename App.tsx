import React, { useState, useCallback, useRef, useLayoutEffect } from 'react';
import { View } from './types';
import Header from './components/Header';
import Chatbot from './components/Chatbot';
import HealthTracker from './components/HealthTracker';
import DietPlanner from './components/DietPlanner';
import ExercisePlanner from './components/ExercisePlanner';
import FunFact from './components/FunFact';
import useScroll from './hooks/useScroll';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('chatbot');
  const headerRef = useRef<HTMLHeadElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const { isScrolled, scrollDirection } = useScroll(scrollRef);

  useLayoutEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setHeaderHeight(entry.target.getBoundingClientRect().height);
      }
    });

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const renderView = useCallback(() => {
    switch (activeView) {
      case 'tracker':
        return <HealthTracker key="tracker" />;
      case 'diet':
        return <DietPlanner key="diet" />;
      case 'exercise':
        return <ExercisePlanner key="exercise" />;
      case 'chatbot':
      default:
        return <Chatbot key="chatbot" />;
    }
  }, [activeView]);
  
  return (
    <div className="bg-gray-100 dark:bg-slate-900 font-sans text-gray-900 dark:text-gray-300">
      <Header 
        ref={headerRef}
        activeView={activeView} 
        setActiveView={setActiveView}
        isScrolled={isScrolled} 
        scrollDirection={scrollDirection}
      />
      <div ref={scrollRef} className="h-screen overflow-y-auto" style={{ paddingTop: `${headerHeight}px` }}>
        <main className="px-4 pb-4">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
          <FunFact />
        </main>
      </div>
    </div>
  );
};

export default App;
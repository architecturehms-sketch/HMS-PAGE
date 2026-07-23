import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { CanvasBackground } from './components/CanvasBackground';
import { IntroUI } from './components/IntroUI';
import { CarouselUI } from './components/CarouselUI';
import { MainContent } from './components/MainContent';
import { ProjectDetail } from './components/ProjectDetail';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomCursor } from './components/CustomCursor';
import { useFirebaseData } from '../hooks/useFirebaseData';
import { CategoryArchive } from './components/CategoryArchive';

export type AppState = 'intro' | 'carousel' | 'transitioning' | 'main' | 'project' | 'admin' | 'category';

export default function App() {
  const [appState, setAppState] = useState<AppState>('intro');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { projects, pageData, team, locations } = useFirebaseData();

  // Hidden admin shortcut (Ctrl/Cmd + Shift + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setAppState(prev => prev === 'admin' ? 'main' : 'admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const startCarousel = () => {
    setAppState('carousel');
  };

  const startTransition = (item: any) => {
    if (item.isLogo) {
      setSelectedProject(null);
      setAppState('transitioning');
    } else {
      setSelectedProject(item);
      setAppState('project');
    }
  };

  const completeTransition = () => {
    if (appState === 'transitioning') {
      setAppState('main');
    }
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setAppState('category');
  };

  const handleSelectProjectFromCategory = (item: any) => {
    setSelectedProject(item);
    setAppState('project');
  };
  
  const handleCloseProject = () => {
    if (selectedCategory) {
      setAppState('category');
    } else {
      setAppState('carousel');
    }
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden selection:bg-black selection:text-white">
      <CustomCursor />
      {/* 3D Canvas Background */}
      <CanvasBackground appState={appState} onTransitionComplete={completeTransition} />

      {/* Intro Overlay */}
      <IntroUI onEnter={startCarousel} isHidden={appState !== 'intro'} />

      {/* 3D Carousel Selection */}
      <CarouselUI isActive={appState === 'carousel'} onSelect={startTransition} projects={projects.filter(p => p.showInCarousel !== false)} />

      {/* Main Landing Page Content */}
      <MainContent isVisible={appState === 'main' || appState === 'transitioning'} onOpenAdmin={() => setAppState('admin')} onGoToCarousel={() => setAppState('carousel')} onSelectCategory={handleSelectCategory} projects={projects} pageData={pageData} team={team} locations={locations} />

      {/* Project Detail Page Content */}
      <AnimatePresence>
        {appState === 'project' && selectedProject && (
          <ProjectDetail key="project-detail" project={selectedProject} onClose={handleCloseProject} />
        )}
      </AnimatePresence>

      {/* Category Archive Page Content */}
      <AnimatePresence>
        {appState === 'category' && selectedCategory && (
          <CategoryArchive 
            key="category-archive"
            category={selectedCategory} 
            projects={projects} 
            onClose={() => { setSelectedCategory(''); setAppState('main'); }} 
            onSelectProject={handleSelectProjectFromCategory}
          />
        )}
      </AnimatePresence>

      {/* Admin Dashboard Overlay */}
      <AnimatePresence>
        {appState === 'admin' && (
          <AdminDashboard key="admin" onClose={() => setAppState('main')} initialProjects={projects} initialPageData={pageData} initialTeam={team} initialLocations={locations} />
        )}
      </AnimatePresence>
    </div>
  );
}

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

  // Initialize and sync history state
  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({ appState: 'intro', selectedCategory: '', selectedProject: null }, '');
    }
    
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.appState) {
        setAppState(e.state.appState);
        if (e.state.selectedCategory !== undefined) setSelectedCategory(e.state.selectedCategory);
        if (e.state.selectedProject !== undefined) setSelectedProject(e.state.selectedProject);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (stateObj: { appState: AppState, selectedCategory?: string, selectedProject?: any }) => {
    setAppState(stateObj.appState);
    if (stateObj.selectedCategory !== undefined) setSelectedCategory(stateObj.selectedCategory);
    if (stateObj.selectedProject !== undefined) setSelectedProject(stateObj.selectedProject);
    
    // Merge with current state to retain values if not explicitly overwritten
    const newState = {
      appState: stateObj.appState,
      selectedCategory: stateObj.selectedCategory !== undefined ? stateObj.selectedCategory : selectedCategory,
      selectedProject: stateObj.selectedProject !== undefined ? stateObj.selectedProject : selectedProject
    };
    window.history.pushState(newState, '');
  };

  // Hidden admin shortcut (Ctrl/Cmd + Shift + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (appState === 'admin') window.history.back();
        else navigateTo({ appState: 'admin' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState, selectedCategory, selectedProject]);

  const startCarousel = () => {
    navigateTo({ appState: 'carousel' });
  };

  const startTransition = (item: any) => {
    if (item.isLogo || item.title === 'MAIN' || item.desc === 'MAIN' || item.title === 'ABOUT US') {
      navigateTo({ appState: 'transitioning', selectedProject: null });
    } else if (item.isCategory) {
      navigateTo({ appState: 'category', selectedCategory: item.title });
    } else {
      navigateTo({ appState: 'project', selectedProject: item });
    }
  };

  const completeTransition = () => {
    if (appState === 'transitioning') {
      navigateTo({ appState: 'main' });
    }
  };

  const handleSelectCategory = (category: string) => {
    navigateTo({ appState: 'category', selectedCategory: category });
  };

  const handleSelectProjectFromCategory = (item: any) => {
    navigateTo({ appState: 'project', selectedProject: item });
  };
  
  const handleCloseProject = () => {
    window.history.back();
  };

  const projectCategories = Array.from(new Set(projects.flatMap(p => typeof p.desc === 'string' ? p.desc.split(',').map(c => c.trim()) : []))).filter(Boolean) as string[];
  const existingCategories = Array.from(new Set([...(pageData?.customCategories || []), ...projectCategories]));

  const carouselItems = [
    {
      id: `cat-MAIN`,
      isLogo: true,
      title: 'MAIN',
      desc: 'MAIN',
      img: "",
      year: "",
      showInCarousel: true,
    },
    ...existingCategories.filter(cat => cat !== 'ABOUT US').map(cat => {
      const orderList = pageData?.categoryProjectOrders?.[cat] || [];
      const catProjects = projects.filter(p => p.desc && p.desc.split(',').map(c => c.trim()).includes(cat) && !p.isLogo && p.img)
        .sort((a, b) => {
          const indexA = orderList.indexOf(a.id as string);
          const indexB = orderList.indexOf(b.id as string);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return 0;
        });
      const firstProject = catProjects[0];
      return {
        id: `cat-${cat}`,
        isCategory: true,
        title: cat,
        desc: cat,
        img: firstProject?.img || "",
        year: "",
        showInCarousel: true,
      };
    })
  ];

  return (
    <div className="w-full min-h-screen overflow-x-hidden selection:bg-black selection:text-white">
      <CustomCursor />
      {/* 3D Canvas Background */}
      <CanvasBackground appState={appState} onTransitionComplete={completeTransition} />

      {/* Intro Overlay */}
      <IntroUI onEnter={startCarousel} isHidden={appState !== 'intro'} />

      {/* 3D Carousel Selection */}
      <CarouselUI isActive={appState === 'carousel'} onSelect={startTransition} projects={carouselItems} />

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
            pageData={pageData || undefined}
            onClose={() => window.history.back()} 
            onSelectProject={handleSelectProjectFromCategory}
          />
        )}
      </AnimatePresence>

      {/* Admin Dashboard Overlay */}
      <AnimatePresence>
        {appState === 'admin' && (
          <AdminDashboard key="admin" onClose={() => window.history.back()} initialProjects={projects} initialPageData={pageData} initialTeam={team} initialLocations={locations} />
        )}
      </AnimatePresence>
    </div>
  );
}

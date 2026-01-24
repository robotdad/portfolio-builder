'use client';

/**
 * Portfolio Context
 * 
 * Manages global portfolio state including:
 * - Theme selection (modern/classic/bold)
 * - Template selection (featured-grid/clean-minimal)
 * - Portfolio data access
 * - localStorage persistence
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import portfolio from '@/data/mockData';
import { Portfolio, Theme, Template } from '@/data/types';

interface PortfolioContextType {
  portfolio: Portfolio;
  theme: Theme;
  template: Template;
  showAbout: boolean;
  setTheme: (theme: Theme) => void;
  setTemplate: (template: Template) => void;
  setShowAbout: (show: boolean) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

interface PortfolioProviderProps {
  children: ReactNode;
}

export function PortfolioProvider({ children }: PortfolioProviderProps) {
  // Initialize state with defaults
  const [theme, setThemeState] = useState<Theme>('modern');
  const [template, setTemplateState] = useState<Template>('featured-grid');
  const [showAbout, setShowAboutState] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme') as Theme;
    const savedTemplate = localStorage.getItem('portfolio-template') as Template;
    const savedShowAbout = localStorage.getItem('portfolio-show-about') === 'true';

    if (savedTheme && ['modern', 'classic', 'bold'].includes(savedTheme)) {
      setThemeState(savedTheme);
      applyThemeToDocument(savedTheme);
    }

    if (savedTemplate && ['featured-grid', 'clean-minimal'].includes(savedTemplate)) {
      setTemplateState(savedTemplate);
    }

    setShowAboutState(savedShowAbout);
    setIsHydrated(true);
  }, []);

  // Apply theme to document element
  const applyThemeToDocument = (newTheme: Theme) => {
    if (newTheme === 'modern') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      const themeValue = newTheme === 'classic' ? 'classic-elegant' : 'bold-editorial';
      document.documentElement.setAttribute('data-theme', themeValue);
    }
  };

  // Theme setter with persistence and DOM update
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('portfolio-theme', newTheme);
    applyThemeToDocument(newTheme);
  };

  // Template setter with persistence
  const setTemplate = (newTemplate: Template) => {
    setTemplateState(newTemplate);
    localStorage.setItem('portfolio-template', newTemplate);
  };

  // Show About setter with persistence
  const setShowAbout = (show: boolean) => {
    setShowAboutState(show);
    localStorage.setItem('portfolio-show-about', String(show));
  };

  const value: PortfolioContextType = {
    portfolio,
    theme,
    template,
    showAbout,
    setTheme,
    setTemplate,
    setShowAbout,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

/**
 * Hook to access portfolio context
 */
export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}

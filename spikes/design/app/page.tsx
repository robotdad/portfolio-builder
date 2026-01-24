'use client';

/**
 * Landing Page
 * 
 * Switches between template layouts based on context:
 * - Featured Grid (default)
 * - Clean Minimal
 */

import React from 'react';
import { usePortfolio } from '@/context/PortfolioContext';
import Navigation from '@/components/shared/Navigation';
import FeaturedGridLanding from '@/components/templates/FeaturedGridLanding';
import CleanMinimalLanding from '@/components/templates/CleanMinimalLanding';

export default function LandingPage() {
  const { portfolio, template } = usePortfolio();

  return (
    <>
      <Navigation />
      
      {template === 'featured-grid' ? (
        <FeaturedGridLanding portfolio={portfolio} />
      ) : (
        <CleanMinimalLanding portfolio={portfolio} />
      )}
    </>
  );
}

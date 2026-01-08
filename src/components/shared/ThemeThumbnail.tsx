/**
 * ThemeThumbnail Component
 * 
 * Visual preview thumbnails for portfolio themes showing actual colors,
 * typography characteristics, and design elements.
 * 
 * Used in both onboarding flow and settings page for consistent UX.
 */

interface ThemeThumbnailProps {
  /** Theme identifier: 'modern-minimal' | 'classic-elegant' | 'bold-editorial' */
  themeId: string
}

/**
 * Theme preview thumbnails showing ACTUAL colors and typography characteristics
 */
export function ThemeThumbnail({ themeId }: ThemeThumbnailProps) {
  if (themeId === 'modern-minimal') {
    // Modern Minimal: Cool blue-gray, Playfair Display + Inter, vibrant blue accent, rounded corners
    return (
      <svg viewBox="0 0 120 80" className="theme-thumbnail">
        {/* Background - actual theme background color */}
        <rect width="120" height="80" fill="hsl(210, 15%, 97%)" />
        
        {/* Surface card - actual surface color with rounded corners */}
        <rect x="8" y="8" width="104" height="64" rx="4" fill="hsl(210, 12%, 95%)" />
        
        {/* Heading - Playfair Display (serif, semibold) */}
        <text x="14" y="22" fontFamily="'Playfair Display', Georgia, serif" fontSize="8" fontWeight="600" fill="hsl(0, 0%, 10%)" letterSpacing="-0.02em">
          Portfolio
        </text>
        
        {/* Body text - Inter (sans-serif, regular) */}
        <text x="14" y="32" fontFamily="'Inter', sans-serif" fontSize="3.5" fill="hsl(0, 0%, 40%)">
          Clean, professional design that
        </text>
        <text x="14" y="37" fontFamily="'Inter', sans-serif" fontSize="3.5" fill="hsl(0, 0%, 40%)">
          lets your work take center stage
        </text>
        
        {/* Subheading - Playfair Display (serif, semibold) */}
        <text x="14" y="48" fontFamily="'Playfair Display', Georgia, serif" fontSize="5" fontWeight="600" fill="hsl(0, 0%, 10%)" letterSpacing="-0.02em">
          About
        </text>
        
        {/* More body text */}
        <text x="14" y="56" fontFamily="'Inter', sans-serif" fontSize="3" fill="hsl(0, 0%, 60%)">
          Neutral palette with editorial typography
        </text>
        
        {/* Accent button - vibrant blue with rounded corners */}
        <rect x="14" y="62" width="28" height="8" rx="3" fill="hsl(220, 90%, 56%)" />
        <text x="19" y="68" fontFamily="'Inter', sans-serif" fontSize="3.5" fontWeight="500" fill="white">
          View Work
        </text>
      </svg>
    )
  }
  
  if (themeId === 'classic-elegant') {
    // Classic Elegant: Warm cream, Playfair Display + Source Sans, terracotta accent, subtle corners
    return (
      <svg viewBox="0 0 120 80" className="theme-thumbnail">
        {/* Background - actual warm cream background */}
        <rect width="120" height="80" fill="hsl(40, 30%, 95%)" />
        
        {/* Surface card - actual warm surface color with subtle corners */}
        <rect x="8" y="8" width="104" height="64" rx="2" fill="hsl(40, 25%, 93%)" />
        
        {/* Decorative serif element */}
        <rect x="12" y="14" width="1" height="8" fill="hsl(25, 60%, 45%)" opacity="0.3" />
        
        {/* Heading - Playfair Display (serif, lighter weight) - LARGER */}
        <text x="16" y="22" fontFamily="'Playfair Display', Georgia, serif" fontSize="9" fontWeight="400" fill="hsl(30, 20%, 15%)" letterSpacing="0.01em">
          Portfolio
        </text>
        
        {/* Body text - Source Sans 3 (sans-serif) - LARGER */}
        <text x="16" y="33" fontFamily="'Source Sans 3', sans-serif" fontSize="3.8" fill="hsl(30, 10%, 35%)">
          Sophisticated, established aesthetic
        </text>
        <text x="16" y="38" fontFamily="'Source Sans 3', sans-serif" fontSize="3.8" fill="hsl(30, 10%, 35%)">
          with generous spacing and warmth
        </text>
        
        {/* Elegant divider with terracotta accent */}
        <line x1="20" y1="45" x2="100" y2="45" stroke="hsl(30, 5%, 55%)" strokeWidth="0.5" opacity="0.3" />
        <circle cx="60" cy="45" r="1.5" fill="hsl(25, 60%, 45%)" />
        
        {/* Subheading - Playfair Display (serif, lighter) */}
        <text x="16" y="54" fontFamily="'Playfair Display', Georgia, serif" fontSize="5.5" fontWeight="400" fill="hsl(30, 20%, 15%)" letterSpacing="0.01em">
          About
        </text>
        
        {/* Accent button - rich terracotta with subtle corners */}
        <rect x="16" y="60" width="30" height="9" rx="1.5" fill="hsl(25, 60%, 45%)" />
        <text x="21" y="66.5" fontFamily="'Source Sans 3', sans-serif" fontSize="3.5" fontWeight="400" fill="white">
          View Work
        </text>
      </svg>
    )
  }
  
  // Bold Editorial: Near-black background, Sora + Geist Sans, hot pink accent, sharp corners
  return (
    <svg viewBox="0 0 120 80" className="theme-thumbnail">
      {/* Background - actual dark theme background */}
      <rect width="120" height="80" fill="hsl(0, 0%, 5%)" />
      
      {/* Surface card - actual dark surface color with NO rounding (sharp) */}
      <rect x="8" y="8" width="104" height="64" rx="0" fill="hsl(0, 0%, 10%)" />
      
      {/* Large bold heading - Sora (sans-serif, bold) */}
      <text x="14" y="22" fontFamily="'Sora', sans-serif" fontSize="10" fontWeight="700" fill="hsl(0, 0%, 98%)" letterSpacing="-0.03em">
        PORTFOLIO
      </text>
      
      {/* Subheading - Sora (sans-serif, bold) */}
      <text x="14" y="33" fontFamily="'Sora', sans-serif" fontSize="5" fontWeight="700" fill="hsl(0, 0%, 70%)" letterSpacing="-0.02em">
        CREATIVE WORK
      </text>
      
      {/* Body text - Geist Sans (sans-serif) */}
      <text x="14" y="43" fontFamily="'Geist Sans', sans-serif" fontSize="3.5" fill="hsl(0, 0%, 70%)">
        Dramatic, contemporary design
        </text>
      <text x="14" y="48" fontFamily="'Geist Sans', sans-serif" fontSize="3.5" fill="hsl(0, 0%, 70%)">
        with high contrast and bold type
      </text>
      
      {/* Hot pink accent bar - sharp corners */}
      <rect x="14" y="54" width="92" height="2" rx="0" fill="hsl(340, 85%, 55%)" />
      
      {/* Body text continued */}
      <text x="14" y="62" fontFamily="'Geist Sans', sans-serif" fontSize="3" fill="hsl(0, 0%, 50%)">
        All sans-serif, fashion-forward aesthetic
      </text>
      
      {/* Accent button - hot pink with sharp corners */}
      <rect x="14" y="66" width="28" height="8" rx="0" fill="hsl(340, 85%, 55%)" />
      <text x="18" y="72" fontFamily="'Sora', sans-serif" fontSize="3.5" fontWeight="700" fill="hsl(0, 0%, 5%)">
        VIEW WORK
      </text>
    </svg>
  )
}

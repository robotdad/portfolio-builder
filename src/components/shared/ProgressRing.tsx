'use client';

interface ProgressRingProps {
  /** Progress from 0-100, undefined for indeterminate */
  progress?: number;
  /** Size in pixels (width and height) */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Whether to show percentage text */
  showText?: boolean;
  /** Additional class name */
  className?: string;
}

export function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 4,
  showText = true,
  className = '',
}: ProgressRingProps) {
  const isIndeterminate = progress === undefined;
  const normalizedProgress = Math.min(100, Math.max(0, progress ?? 0));
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;
  
  const center = size / 2;

  return (
    <div
      className={`progress-ring ${className}`}
      role="progressbar"
      aria-valuenow={isIndeterminate ? undefined : normalizedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={isIndeterminate ? 'Loading' : `${Math.round(normalizedProgress)}% complete`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={isIndeterminate ? 'progress-ring__svg--spinning' : ''}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-border, hsla(0, 0%, 100%, 0.2))"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={isIndeterminate ? circumference * 0.75 : strokeDashoffset}
          className="progress-ring__circle"
        />
      </svg>
      
      {/* Center text */}
      {showText && !isIndeterminate && (
        <span className="progress-ring__text">
          {Math.round(normalizedProgress)}%
        </span>
      )}

      <style jsx>{`
        .progress-ring {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .progress-ring svg {
          transform: rotate(-90deg);
        }

        .progress-ring__circle {
          transition: stroke-dashoffset 0.3s ease;
        }

        @media (prefers-reduced-motion: reduce) {
          .progress-ring__circle {
            transition: none;
          }
        }

        .progress-ring__svg--spinning {
          animation: progress-ring-spin 1.5s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .progress-ring__svg--spinning {
            animation: none;
          }
        }

        @keyframes progress-ring-spin {
          from {
            transform: rotate(-90deg);
          }
          to {
            transform: rotate(270deg);
          }
        }

        .progress-ring__text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: ${size * 0.22}px;
          font-weight: 500;
          color: var(--color-text-primary, white);
          line-height: 1;
        }
      `}</style>
    </div>
  );
}

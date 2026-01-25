'use client'

interface LayoutSettingsBarProps {
  layoutType: 'two-column' | 'three-column' | 'sidebar'
  ratio?: '50-50' | '60-40' | '40-60' | '70-30' | '30-70'
  onRatioChange?: (ratio: '50-50' | '60-40' | '40-60' | '70-30' | '30-70') => void
  sidebarPosition?: 'left' | 'right'
  onSidebarPositionChange?: (position: 'left' | 'right') => void
  sidebarWidth?: 240 | 280 | 320
  onSidebarWidthChange?: (width: 240 | 280 | 320) => void
  gap: 'narrow' | 'default' | 'wide'
  onGapChange: (gap: 'narrow' | 'default' | 'wide') => void
  mobileStackOrder: string
  onMobileStackOrderChange: (order: string) => void
}

export function LayoutSettingsBar({
  layoutType,
  ratio,
  onRatioChange,
  sidebarPosition,
  onSidebarPositionChange,
  sidebarWidth,
  onSidebarWidthChange,
  gap,
  onGapChange,
  mobileStackOrder,
  onMobileStackOrderChange,
}: LayoutSettingsBarProps) {
  // Get mobile stack order options based on layout type
  const getMobileStackOptions = () => {
    if (layoutType === 'sidebar') {
      return [
        { value: 'main-first', label: 'Main First' },
        { value: 'sidebar-first', label: 'Sidebar First' },
      ]
    }
    return [
      { value: 'left-first', label: 'Left First' },
      { value: 'right-first', label: 'Right First' },
    ]
  }

  return (
    <div className="layout-settings-bar">
      {/* Two-column specific: Ratio picker */}
      {layoutType === 'two-column' && onRatioChange && (
        <div className="layout-setting-group">
          <label className="layout-setting-label">Ratio</label>
          <select
            className="layout-setting-select"
            value={ratio}
            onChange={(e) =>
              onRatioChange(
                e.target.value as '50-50' | '60-40' | '40-60' | '70-30' | '30-70'
              )
            }
          >
            <option value="50-50">50 / 50</option>
            <option value="60-40">60 / 40</option>
            <option value="40-60">40 / 60</option>
            <option value="70-30">70 / 30</option>
            <option value="30-70">30 / 70</option>
          </select>
        </div>
      )}

      {/* Sidebar specific: Position */}
      {layoutType === 'sidebar' && onSidebarPositionChange && (
        <div className="layout-setting-group">
          <label className="layout-setting-label">Sidebar</label>
          <select
            className="layout-setting-select"
            value={sidebarPosition}
            onChange={(e) =>
              onSidebarPositionChange(e.target.value as 'left' | 'right')
            }
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
      )}

      {/* Sidebar specific: Width */}
      {layoutType === 'sidebar' && onSidebarWidthChange && (
        <div className="layout-setting-group">
          <label className="layout-setting-label">Width</label>
          <select
            className="layout-setting-select"
            value={sidebarWidth}
            onChange={(e) =>
              onSidebarWidthChange(Number(e.target.value) as 240 | 280 | 320)
            }
          >
            <option value={240}>Narrow (240px)</option>
            <option value={280}>Default (280px)</option>
            <option value={320}>Wide (320px)</option>
          </select>
        </div>
      )}

      {/* Common: Gap */}
      <div className="layout-setting-group">
        <label className="layout-setting-label">Gap</label>
        <select
          className="layout-setting-select"
          value={gap}
          onChange={(e) =>
            onGapChange(e.target.value as 'narrow' | 'default' | 'wide')
          }
        >
          <option value="narrow">Narrow</option>
          <option value="default">Default</option>
          <option value="wide">Wide</option>
        </select>
      </div>

      {/* Common: Mobile Stack Order */}
      <div className="layout-setting-group">
        <label className="layout-setting-label">Mobile Order</label>
        <select
          className="layout-setting-select"
          value={mobileStackOrder}
          onChange={(e) => onMobileStackOrderChange(e.target.value)}
        >
          {getMobileStackOptions().map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

/**
 * Event Category Configuration
 * Predefined event types with color coding
 */

export const EVENT_CATEGORIES = [
  { value: 'tournament', label: 'Tournament', color: '#dc2626', bgColor: '#fef2f2' },
  { value: 'game', label: 'Game', color: '#ea580c', bgColor: '#fff7ed' },
  { value: 'camp', label: 'Camp', color: '#16a34a', bgColor: '#f0fdf4' },
  { value: 'clinic', label: 'Clinic', color: '#0891b2', bgColor: '#ecfeff' },
  { value: 'workshop', label: 'Workshop', color: '#8b5cf6', bgColor: '#f5f3ff' },
  { value: 'orientation', label: 'Orientation', color: '#2563eb', bgColor: '#eff6ff' },
  { value: 'other', label: 'Other', color: '#64748b', bgColor: '#f8fafc' }
];

/**
 * Get category configuration by value
 */
export const getCategoryConfig = (categoryValue) => {
  const category = EVENT_CATEGORIES.find(cat => cat.value === categoryValue?.toLowerCase());
  return category || EVENT_CATEGORIES.find(cat => cat.value === 'other');
};

/**
 * Get color for category badge
 */
export const getCategoryColor = (categoryValue) => {
  const config = getCategoryConfig(categoryValue);
  return {
    color: config.color,
    backgroundColor: config.bgColor
  };
};

/**
 * Category Badge Component Props
 */
export const getCategoryBadgeStyle = (categoryValue) => {
  const colors = getCategoryColor(categoryValue);
  return {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: colors.color,
    backgroundColor: colors.backgroundColor,
    display: 'inline-block',
    textTransform: 'capitalize'
  };
};

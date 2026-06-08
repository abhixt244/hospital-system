/**
 * Utility functions for the Hospital Bed & Resource Allocation System
 */

/**
 * Format a date to a readable date string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date to a readable date+time string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date+time string (e.g., "Jan 15, 2024, 2:30 PM")
 */
export function formatDateTime(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get relative time string (e.g., "5 minutes ago", "2 hours ago")
 * @param {Date|string} date - Date to compare against now
 * @returns {string} Relative time string
 */
export function timeAgo(date) {
  if (!date) return '—';

  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 0) return 'just now';

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

/**
 * Get CSS variable/color class name for bed or patient status
 * @param {string} status - Status value (AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED, ADMITTED, DISCHARGED, TRANSFERRED)
 * @returns {string} CSS class name for the status
 */
export function getStatusColor(status) {
  const statusColors = {
    // Bed statuses
    AVAILABLE: 'status-available',
    OCCUPIED: 'status-occupied',
    MAINTENANCE: 'status-maintenance',
    RESERVED: 'status-reserved',
    // Patient statuses
    ADMITTED: 'status-admitted',
    DISCHARGED: 'status-discharged',
    TRANSFERRED: 'status-transferred',
  };
  return statusColors[status] || 'status-default';
}

/**
 * Get CSS variable/color class name for priority level
 * @param {string} priority - Priority value (LOW, MEDIUM, HIGH, CRITICAL)
 * @returns {string} CSS class name for the priority
 */
export function getPriorityColor(priority) {
  const priorityColors = {
    LOW: 'priority-low',
    MEDIUM: 'priority-medium',
    HIGH: 'priority-high',
    CRITICAL: 'priority-critical',
  };
  return priorityColors[priority] || 'priority-default';
}

/**
 * Capitalize the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Join class names, filtering out falsy values
 * Similar to clsx/classnames utility
 * @param  {...(string|boolean|undefined|null)} classes - Class names to join
 * @returns {string} Joined class names
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

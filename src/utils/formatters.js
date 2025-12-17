/**
 * Converts an international phone number (e.g., +85512345678) to a local format (e.g., 012345678).
 * @param {string|null|undefined} internationalNum The phone number in international format.
 * @returns {string} The phone number in local format. Returns original string if format is not recognized.
 */
export const toLocalPhone = (internationalNum) => {
  if (!internationalNum) return '';
  if (internationalNum.startsWith('+855')) {
    const numberPart = internationalNum.substring(4);
    if (numberPart.startsWith('0')) { // Handles cases like +855012345678
      return numberPart;
    }
    return '0' + numberPart;
  }
  return internationalNum;
};

/**
 * Converts a local phone number (e.g., 012345678) to international format (e.g., +85512345678).
 * Handles numbers with or without leading 0.
 * @param {string|null|undefined} localNum The phone number in local format.
 * @returns {string} The phone number in international format. Returns original string if format is not recognized.
 */
export const toInternationalPhone = (localNum) => {
  if (!localNum) return '';
  const cleaned = String(localNum).replace(/\D/g, ''); // Remove non-digit characters

  if (cleaned.startsWith('855')) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('0')) {
    return `+855${cleaned.substring(1)}`;
  }
  if (cleaned.length > 0) { // Assume it's a local number without the leading 0
    return `+855${cleaned}`;
  }
  return localNum;
};


/**
 * Formats a numeric value into a USD currency string.
 * @param {number|null|undefined} value - The numeric value to format.
 * @returns {string} The formatted currency string (e.g., "$1,234.56"), or an empty string if input is invalid.
 */
export const formatCurrency = (value) => {
  if (typeof value !== 'number') return '';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

/**
 * Formats a date-time string or Date object into a standardized 'YYYY-MM-DD HH:mm:ss' format.
 * @param {string|Date|null|undefined} value - The date value to format.
 * @returns {string} The formatted date-time string, or an empty string if input is invalid.
 */
export const formatDateTime = (value) => {
  if (!value) return '';
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date).replace(', ', ' ');
  } catch (e) {
    return '';
  }
};

/**
 * Formats a date-time string or Date object into a 'YYYY-MM-DD' format.
 * @param {string|Date|null|undefined} dateString - The date value to format.
 * @returns {string} The formatted date string, or an empty string if input is invalid.
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-CA').format(date);
  } catch (e) {
    return '';
  }
};

/**
 * Calculates the relative time from now for a given date string.
 * @param {string|Date|null|undefined} dateString - The date value.
 * @returns {string} The relative time (e.g., "Just now", "5m ago"), or an empty string if input is invalid.
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  } catch (e) {
    return '';
  }
};

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


export const formatCurrency = (value) => {
  if (typeof value !== 'number') return '';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

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

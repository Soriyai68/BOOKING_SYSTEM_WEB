import i18n from "@/i18n";

export const toLocalPhone = (internationalNum) => {
  if (internationalNum === undefined || internationalNum === null || internationalNum === "" || internationalNum === "undefined" || internationalNum === "null") {
    return "";
  }
  
  const str = String(internationalNum);
  if (str.startsWith("+855")) {
    const numberPart = str.substring(4);
    if (numberPart.startsWith("0")) {
      return numberPart;
    }
    return "0" + numberPart;
  }
  return str;
};

export const toInternationalPhone = (localNum) => {
  if (!localNum) return "";
  const cleaned = String(localNum).replace(/\D/g, ""); // Remove non-digit characters

  if (cleaned.startsWith("855")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("0")) {
    return `+855${cleaned.substring(1)}`;
  }
  if (cleaned.length > 0) {
    // Assume it's a local number without the leading 0
    return `+855${cleaned}`;
  }
  return localNum;
};

export const formatCurrency = (value) => {
  if (typeof value !== "number") return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

export const formatDateTime = (value) => {
  if (!value) return "";
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
      .format(date)
      .replace(", ", " ");
  } catch (e) {
    return "";
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-CA").format(date);
  } catch (e) {
    return "";
  }
};

export const formatDateWithDay = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const dayName = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
    }).format(date);
    const datePart = new Intl.DateTimeFormat("en-CA").format(date);
    return `${dayName} ${datePart}`;
  } catch (e) {
    return dateString;
  }
};

export const formatDateTimeWithAMPM = (value) => {
  if (!value) return "";
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return "";
    const datePart = new Intl.DateTimeFormat("en-CA").format(date);
    const hours = date.getHours();
    const hStr = String(hours).padStart(2, "0");
    const mStr = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    return `${datePart} ${hStr}:${mStr} ${ampm}`;
  } catch (e) {
    return "";
  }
};

export const formatTime = (timeString) => {
  if (!timeString) return "";
  try {
    const [hours] = timeString.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${timeString} ${ampm}`;
  } catch (e) {
    return timeString;
  }
};

export const getRelativeTime = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    const { t } = i18n.global;

    if (diffInSeconds < 60) return t("datetime.now") || "Just now";
    if (diffInSeconds < 3600)
      return t("datetime.minutesAgo", {
        count: Math.floor(diffInSeconds / 60),
      });
    if (diffInSeconds < 86400)
      return t("datetime.hoursAgo", {
        count: Math.floor(diffInSeconds / 3600),
      });
    return t("datetime.daysAgo", { count: Math.floor(diffInSeconds / 86400) });
  } catch (e) {
    return "";
  }
};

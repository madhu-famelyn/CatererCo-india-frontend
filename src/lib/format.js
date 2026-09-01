export const AED = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

export const INR = AED;

export const formatDate = (d) => {
  if (!d) return "N/A";
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return String(d);
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(dateObj);
};

export const formatDateTime = (d) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(d));

export const formatTimeAgo = (d) => {
  if (!d) return "";
  const diff = Math.floor((new Date() - new Date(d)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};


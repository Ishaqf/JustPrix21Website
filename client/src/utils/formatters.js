// fr-FR's thousands separator is U+202F (narrow no-break space), not a
// regular space — renders identically, just noting it's not a typo.
export const formatPrice = (value) => {
  const num = Number(value) || 0;
  return `${num.toLocaleString('fr-FR')} DA`;
};

export const formatDate = (value, options = { day: 'numeric', month: 'long', year: 'numeric' }) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('fr-FR', options);
};

export const truncate = (str, maxLength) => {
  if (typeof str !== 'string' || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength).trimEnd()}…`;
};

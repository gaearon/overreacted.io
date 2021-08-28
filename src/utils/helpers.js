export function formatReadingTime(minutes) {
  let cups = Math.round(minutes / 5);
  let bowls = 0;
  if (cups > 5) {
    return `${'🍱'.repeat(Math.round(cups / Math.E))} ${minutes} min read`;
  } else {
    return `${'☕️'.repeat(cups || 1)} ${minutes} min read`;
  }
}

// `lang` is optional and will default to the current user agent locale
export function formatPostDate(date, lang) {
  if (typeof Date.prototype.toLocaleDateString !== 'function') {
    return date;
  }

  date = new Date(date);
  const args = [
    lang,
    { day: 'numeric', month: 'long', year: 'numeric' },
  ].filter(Boolean);
  return date.toLocaleDateString(...args);
}

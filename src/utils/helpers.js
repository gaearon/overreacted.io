export function formatReadingTime(minutes) {
  const cupMinutes = minutes / 5;
  const bowlArr = new Array(Math.floor(cupMinutes / Math.E)).fill('🍱');
  let cupArr = new Array(Math.round(cupMinutes % Math.E)).fill('☕️');
  if (!bowlArr.length && !cupArr.length) {
    cupArr = new Array(1).fill('☕️');
  }
  return `${bowlArr.concat(cupArr).join('')} ${minutes} min read`;
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

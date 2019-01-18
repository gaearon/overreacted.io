export function formatReadingTime(minutes) {
  let cups = Math.round(minutes / 5);
  return `${new Array(cups || 1).fill('☕️').join('')} ${minutes} min read`;
}

export function loadState(key) {
	try {
		const serializedState = localStorage.getItem(key)
		if (serializedState === null) {
			return undefined
		}
		return JSON.parse(serializedState)
	} catch (err) {
		return undefined
	}
}

export function saveState(key, state) {
	try {
		const serializedState = JSON.stringify(state)
		localStorage.setItem(key, serializedState)
	} catch (err) {
    return undefined
	}
}

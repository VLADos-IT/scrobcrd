const { client, isValidUsername, requestWithRetry } = require('../utils');
const { parseTopTrack } = require('../parsers/index');

/**
 * Fetches Top Track from the library page.
 * @param {string} user 
 */
async function fetchTopTrackOnly(user) {
	if (!isValidUsername(user)) {
		console.error('Invalid username:', user);
		return null;
	}
	try {
		// Fetching top tracks from library
		const url = `https://www.last.fm/user/${encodeURIComponent(user)}/library/tracks`;
		const { data: html } = await requestWithRetry(() => client.get(url));
		return parseTopTrack(html, url);
	} catch (e) {
		console.error('Error fetching library page:', e.message);
		return null;
	}
}

module.exports = { fetchTopTrackOnly };

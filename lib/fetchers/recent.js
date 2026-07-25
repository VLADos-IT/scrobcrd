const { client, isValidUsername, upgradeImage, requestWithRetry } = require('../utils');
const { parseRecentTrack } = require('../parsers/index');

const API_KEY = process.env.LASTFM_API_KEY;

/**
 * Fetches Recent Track from the library page or API.
 * @param {string} user 
 */
async function fetchRecentTrack(user) {
	if (!isValidUsername(user)) {
		console.error('Invalid username:', user);
		return null;
	}

	if (API_KEY) {
		try {
			const response = await requestWithRetry(() => client.get(`https://ws.audioscrobbler.com/2.0/`, {
				params: {
					method: 'user.getrecenttracks',
					user,
					api_key: API_KEY,
					format: 'json',
					limit: 1
				}
			}));
			const track = response.data?.recenttracks?.track?.[0];
			if (track) {
				const image = upgradeImage(track.image?.find(img => img.size === 'extralarge')?.['#text'] || '');
				const nowPlaying = track['@attr']?.nowplaying === 'true';
				return {
					track: track.name,
					artist: track.artist['#text'] || track.artist.name,
					image,
					url: track.url,
					type: nowPlaying ? 'nowplaying' : 'recent_track'
				};
			}
		} catch (e) {
			console.error('API Recent fetch failed:', e.message);
		}
	}

	try {
		const url = `https://www.last.fm/user/${encodeURIComponent(user)}/library`;
		const { data: html } = await requestWithRetry(() => client.get(url));

		if (html.includes('recent tracks are set to private')) {
			throw new Error('RECENT_TRACKS_PRIVATE');
		}

		return parseRecentTrack(html, url);
	} catch (e) {
		if (e.message === 'RECENT_TRACKS_PRIVATE') throw e;
		console.error('Error fetching library page:', e.message);
		return null;
	}
}

module.exports = { fetchRecentTrack };

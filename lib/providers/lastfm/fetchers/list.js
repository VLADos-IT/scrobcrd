const { client, isValidUsername, upgradeImage, requestWithRetry } = require('../../../utils');
const { parseTopTracksList } = require('../parsers/index');

const API_KEY = process.env.LASTFM_API_KEY;
const MAX_LIST_LIMIT = 10;

const RANGE_TO_PERIOD = {
	all: 'overall',
	'7day': '7day',
	'1month': '1month',
	'3month': '3month',
	'6month': '6month',
	'12month': '12month'
};

async function fetchTopTracksList(user, range = 'all', limit = 5) {
	if (!isValidUsername(user)) {
		console.error('Invalid username:', user);
		return null;
	}

	const safeLimit = Math.max(1, Math.min(MAX_LIST_LIMIT, parseInt(limit, 10) || 5));
	if (range !== 'all' && !API_KEY) throw new Error('LASTFM_API_KEY_MISSING');

	if (API_KEY) {
		try {
			const response = await requestWithRetry(() => client.get(`https://ws.audioscrobbler.com/2.0/`, {
				params: {
					method: 'user.gettoptracks',
					user,
					period: RANGE_TO_PERIOD[range] || 'overall',
					api_key: API_KEY,
					format: 'json',
					limit: safeLimit
				}
			}));

			const tracks = response.data?.toptracks?.track;
			if (!Array.isArray(tracks) || tracks.length === 0) return null;

			return {
				tracks: tracks.slice(0, safeLimit).map((track, index) => ({
					rank: index + 1,
					track: track.name,
					artist: track.artist?.name || track.artist?.['#text'] || 'Unknown Artist',
					image: upgradeImage(track.image?.find(img => img.size === 'extralarge')?.['#text'] || ''),
					url: track.url,
					playcount: track.playcount || null
				})),
				url: `https://www.last.fm/user/${encodeURIComponent(user)}`,
				type: 'top_list'
			};
		} catch (e) {
			console.error('API top-list fetch failed, falling back to scrape:', e.message);
		}
	}

	try {
		const url = `https://www.last.fm/user/${encodeURIComponent(user)}/library/tracks`;
		const { data: html } = await requestWithRetry(() => client.get(url));
		const rows = parseTopTracksList(html, url, safeLimit);
		if (!rows.length) return null;

		return {
			tracks: rows.map((row, index) => ({
				rank: index + 1,
				track: row.track,
				artist: row.artist,
				image: row.image,
				url: row.url,
				playcount: row.playcount
			})),
			url,
			type: 'top_list'
		};
	} catch (e) {
		console.error('Error scraping top tracks list:', e.message);
		return null;
	}
}

module.exports = { fetchTopTracksList };

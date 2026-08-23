const { client, isValidUsername, upgradeImage, requestWithRetry } = require('../../../utils');
const { parseRecentTracksList } = require('../parsers/index');

const API_KEY = process.env.LASTFM_API_KEY;
const MAX_LIST_LIMIT = 10;

async function fetchRecentTracksList(user, limit = 5) {
	if (!isValidUsername(user)) {
		console.error('Invalid username:', user);
		return null;
	}

	const safeLimit = Math.max(1, Math.min(MAX_LIST_LIMIT, parseInt(limit, 10) || 5));

	if (API_KEY) {
		try {
			const response = await requestWithRetry(() => client.get(`https://ws.audioscrobbler.com/2.0/`, {
				params: {
					method: 'user.getrecenttracks',
					user,
					api_key: API_KEY,
					format: 'json',
					limit: safeLimit
				}
			}));

			const tracks = response.data?.recenttracks?.track;
			if (!Array.isArray(tracks) || tracks.length === 0) return null;

			return {
				tracks: tracks.slice(0, safeLimit).map((track, index) => ({
					rank: index + 1,
					track: track.name,
					artist: track.artist?.['#text'] || track.artist?.name || 'Unknown Artist',
					image: upgradeImage(track.image?.find(img => img.size === 'extralarge')?.['#text'] || ''),
					url: track.url,
					playcount: null,
					isPlaying: index === 0 && track['@attr']?.nowplaying === 'true'
				})),
				url: `https://www.last.fm/user/${encodeURIComponent(user)}`,
				type: 'recent_list'
			};
		} catch (e) {
			console.error('API recent-list fetch failed, falling back to scrape:', e.message);
		}
	}

	try {
		const url = `https://www.last.fm/user/${encodeURIComponent(user)}/library`;
		const { data: html } = await requestWithRetry(() => client.get(url));

		if (html.includes('recent tracks are set to private')) {
			throw new Error('RECENT_TRACKS_PRIVATE');
		}

		const rows = parseRecentTracksList(html, url, safeLimit);
		if (!rows.length) return null;

		return {
			tracks: rows.map((row, index) => ({
				rank: index + 1,
				track: row.track,
				artist: row.artist,
				image: row.image,
				url: row.url,
				playcount: null,
				isPlaying: Boolean(row.isPlaying)
			})),
			url,
			type: 'recent_list'
		};
	} catch (e) {
		if (e.message === 'RECENT_TRACKS_PRIVATE') throw e;
		console.error('Error scraping recent tracks list:', e.message);
		return null;
	}
}

module.exports = { fetchRecentTracksList };

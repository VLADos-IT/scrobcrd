const { client, upgradeImage, requestWithRetry } = require('../../../utils');
const API_KEY = process.env.LASTFM_API_KEY;

async function fetchTopTracksApi(user, range) {
	if (!API_KEY) {
		throw new Error('LASTFM_API_KEY_MISSING');
	}

	try {
		const response = await requestWithRetry(() => client.get(`https://ws.audioscrobbler.com/2.0/`, {
			params: {
				method: 'user.gettoptracks',
				user,
				period: range,
				api_key: API_KEY,
				format: 'json',
				limit: 1
			}
		}));

		const track = response.data?.toptracks?.track?.[0];
		if (!track) return null;

		let image = upgradeImage(track.image?.find(img => img.size === 'extralarge')?.['#text'] || '');

		if (!image || image.includes('2a96cbd8b46e442fc41c2b86b821562f')) {
			try {
				const { data } = await requestWithRetry(() => client.get(`https://ws.audioscrobbler.com/2.0/`, {
					params: {
						method: 'track.getInfo',
						api_key: API_KEY,
						artist: track.artist.name,
						track: track.name,
						format: 'json',
						autocorrect: 1
					}
				}), { retries: 1 });
				const albumImage = data?.track?.album?.image?.find(img => img.size === 'extralarge')?.['#text'];
				if (albumImage) image = upgradeImage(albumImage);
			} catch (e) { }
		}

		return {
			track: track.name,
			artist: track.artist.name,
			image,
			url: track.url,
			type: 'top_track'
		};

	} catch (e) {
		console.error('API Error:', e.message);
		throw e;
	}
}

module.exports = { fetchTopTracksApi };

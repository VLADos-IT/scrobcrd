const { isValidUsername, cached } = require('../../utils');
const { getPlayingNow, getRecentListen, getRecentListens, getTopTrack, getTopTracksList } = require('./api');

const SECOND = 1000;
const MINUTE = 60 * SECOND;

async function fetchListenBrainzData(user, mode = 'smart', range = 'all', limit = 5) {
	if (!isValidUsername(user)) {
		throw new Error('Invalid username');
	}

	const isList = mode === 'list' || mode === 'history';
	const key = `lb:${user}:${mode}:${range}:${isList ? limit : ''}`;

	switch (mode) {
		case 'list':
			return cached(key, 5 * MINUTE, () => getTopTracksList(user, range, limit));
		case 'history':
			return cached(key, MINUTE, () => getRecentListens(user, limit));
		case 'now':
			return cached(key, 30 * SECOND, () => getPlayingNow(user));
		case 'recent':
			return cached(key, MINUTE, () => getRecentListen(user));
		case 'obsession':
			return cached(key, 5 * MINUTE, () => getTopTrack(user, '7day', 'obsession'));
		case 'top':
			return cached(key, 5 * MINUTE, () => getTopTrack(user, range, 'top_track'));
		default:
			if (range && range !== 'all') {
				return cached(key, 5 * MINUTE, () => getTopTrack(user, range, 'top_track'));
			}
			return cached(key, 3 * MINUTE, async () =>
				(await getTopTrack(user, '7day', 'obsession')) || getTopTrack(user, 'all', 'top_track'));
	}
}

module.exports = {
    brand: 'LISTENBRAINZ',
    accentColor: '#eb743b',
    profileUrl: (user) => `https://listenbrainz.org/user/${encodeURIComponent(user)}/`,
    fetch: fetchListenBrainzData
};

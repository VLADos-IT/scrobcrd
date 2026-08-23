const { isValidUsername, dataCache } = require('../../utils');
const { getPlayingNow, getRecentListen, getRecentListens, getTopTrack, getTopTracksList } = require('./api');

async function fetchListenBrainzData(user, mode = 'smart', range = 'all', limit = 5) {
	if (!isValidUsername(user)) {
		throw new Error('Invalid username');
	}

	const cacheKey = `lb:${user}:${mode}:${range}:${mode === 'list' || mode === 'history' ? limit : ''}`;
	const cached = dataCache.get(cacheKey);
	if (cached) return cached;

    const cache = (result, ttlMs) => {
		if (result) dataCache.set(cacheKey, result, { ttl: ttlMs });
		return result;
	};

	if (mode === 'list') {
        return cache(await getTopTracksList(user, range, limit), 1000 * 60 * 5);
	}

	if (mode === 'history') {
        return cache(await getRecentListens(user, limit), 1000 * 60);
	}

	if (mode === 'now') {
		const result = await getPlayingNow(user);
        return cache(result, 1000 * 30);
	}

	if (mode === 'recent') {
        return cache(await getRecentListen(user), 1000 * 60);
	}

	if (mode === 'obsession') {
		const result = await getTopTrack(user, '7day', 'obsession');
        return cache(result, 1000 * 60 * 5);
	}

	if (mode === 'top' || (range && range !== 'all')) {
        return cache(await getTopTrack(user, range, 'top_track'), 1000 * 60 * 5);
	}

    const weeklyTop = await getTopTrack(user, '7day', 'obsession');
    if (weeklyTop) return cache(weeklyTop, 1000 * 60 * 3);

    return cache(await getTopTrack(user, 'all', 'top_track'), 1000 * 60 * 5);
}

module.exports = {
    brand: 'LISTENBRAINZ',
    accentColor: '#eb743b',
    profileUrl: (user) => `https://listenbrainz.org/user/${encodeURIComponent(user)}/`,
    fetch: fetchListenBrainzData
};

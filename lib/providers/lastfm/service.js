const { client, isValidUsername, dataCache, requestWithRetry } = require('../../utils');
const { parseObsession } = require('./parsers');
const { fetchObsessionOnly } = require('./fetchers/obsession');
const { fetchTopTrackOnly } = require('./fetchers/top');
const { fetchRecentTrack } = require('./fetchers/recent');
const { fetchTopTracksApi } = require('./fetchers/top-range');
const { fetchTopTracksList } = require('./fetchers/list');


async function fetchLastFmData(user, mode = 'smart', range = 'all', limit = 5) {
	if (!isValidUsername(user)) {
		throw new Error('Invalid username');
	}

	const cacheKey = `${user}:${mode}:${range}:${mode === 'list' ? limit : ''}`;
	const cached = dataCache.get(cacheKey);
	if (cached) return cached;

	if (mode === 'list') {
		const result = await fetchTopTracksList(user, range, limit);
		if (result) dataCache.set(cacheKey, result, { ttl: 1000 * 60 * 5 });
		return result;
	}

	if (mode === 'top') {
		const result = range === 'all'
			? await fetchTopTrackOnly(user)
			: await fetchTopTracksApi(user, range);
		if (result) dataCache.set(cacheKey, result, { ttl: 1000 * 60 * 5 });
		return result;
	}

	if (mode === 'recent') {
		const result = await fetchRecentTrack(user);
		if (result) dataCache.set(cacheKey, result, { ttl: 1000 * 60 });
		return result;
	}
	if (mode === 'now') {
		const result = await fetchRecentTrack(user);
		if (result && result.type === 'nowplaying') dataCache.set(cacheKey, result, { ttl: 1000 * 30 });
		return result && result.type === 'nowplaying' ? result : null;
	}

	const url = `https://www.last.fm/user/${encodeURIComponent(user)}`;

	try {
		const { data: html } = await requestWithRetry(() => client.get(url));

		let obsession = parseObsession(html, url);

		if (obsession && !obsession.image) {
			const obsData = await fetchObsessionOnly(user);
			if (obsData) obsession.image = obsData.image;
		}

		if (mode === 'obsession') {
			if (obsession) dataCache.set(cacheKey, obsession, { ttl: 1000 * 60 * 5 });
			return obsession;
		}

		if (obsession) {
			dataCache.set(cacheKey, obsession, { ttl: 1000 * 60 * 3 });
			return obsession;
		}

		const topResult = await fetchTopTrackOnly(user);
		if (topResult) dataCache.set(cacheKey, topResult, { ttl: 1000 * 60 * 5 });
		return topResult;

	} catch (error) {
		console.error('Error fetching Last.fm data:', error.message);
		throw error;
	}
}

module.exports = { fetchLastFmData };

const { client, isValidUsername, cached, requestWithRetry } = require('../../utils');
const { parseObsession } = require('./parsers');
const { fetchObsessionOnly } = require('./fetchers/obsession');
const { fetchTopTrackOnly } = require('./fetchers/top');
const { fetchRecentTrack } = require('./fetchers/recent');
const { fetchTopTracksApi } = require('./fetchers/top-range');
const { fetchTopTracksList } = require('./fetchers/list');
const { fetchRecentTracksList } = require('./fetchers/recent-list');

const SECOND = 1000;
const MINUTE = 60 * SECOND;

async function fetchObsessionOrTop(user) {
	const url = `https://www.last.fm/user/${encodeURIComponent(user)}`;
	const { data: html } = await requestWithRetry(() => client.get(url));

	const obsession = parseObsession(html, url);
	if (!obsession) return null;

	if (!obsession.image) {
		const page = await fetchObsessionOnly(user);
		if (page) obsession.image = page.image;
	}
	return obsession;
}

async function fetchLastFmData(user, mode = 'smart', range = 'all', limit = 5) {
	if (!isValidUsername(user)) {
		throw new Error('Invalid username');
	}

	const isList = mode === 'list' || mode === 'history';
	const key = `lastfm:${user}:${mode}:${range}:${isList ? limit : ''}`;

	switch (mode) {
		case 'list':
			return cached(key, 5 * MINUTE, () => fetchTopTracksList(user, range, limit));

		case 'history':
			return cached(key, MINUTE, () => fetchRecentTracksList(user, limit));

		case 'top':
			return cached(key, 5 * MINUTE, () => (range === 'all'
				? fetchTopTrackOnly(user)
				: fetchTopTracksApi(user, range)));

		case 'recent':
			return cached(key, MINUTE, () => fetchRecentTrack(user));

		case 'now':
			return cached(key, 30 * SECOND, async () => {
				const result = await fetchRecentTrack(user);
				return result?.type === 'nowplaying' ? result : null;
			});

		case 'obsession':
			return cached(key, 5 * MINUTE, () => fetchObsessionOrTop(user));

		default:
			return cached(key, 3 * MINUTE, async () => (await fetchObsessionOrTop(user)) || fetchTopTrackOnly(user));
	}
}

module.exports = { fetchLastFmData };

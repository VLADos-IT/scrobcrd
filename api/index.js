const { fetchLastFmData } = require('../lib/lastfm');
const { generateSvg, generateListSvg } = require('../lib/svg');
const { fetchImageAsBase64, isValidUsername } = require('../lib/utils');
const errorCard = require('../lib/templates/error');
const { validateParams, checkWhitelist } = require('../lib/validation');

/**
 * Last.fm Obsession Readme API
 * @author VLADos-IT <https://github.com/VLADos-IT>
 */
module.exports = async (req, res) => {
	const { user, safeWidth, safeBg, safeMode, safeRange, safeTheme, safeLimit } = validateParams(req.query);

	// Common headers
	res.setHeader('Content-Type', 'image/svg+xml');
	res.setHeader('Content-Disposition', 'inline; filename="lastfm-profile.svg"');
	res.setHeader('Content-Security-Policy', "default-src 'none'; img-src data: https:; style-src 'unsafe-inline'; sandbox");
	res.setHeader('X-Content-Type-Options', 'nosniff');

	const sendError = (message, status) => {
		if (status) res.status(status);
		res.send(errorCard({ width: safeWidth, height: 120, bgFill: safeBg, message }));
	};

	if (!user) {
		return sendError('Missing user parameter', 400);
	}

	if (!isValidUsername(user)) {
		return sendError('Invalid username', 400);
	}

	// Whitelist
	if (!checkWhitelist(user, req.query.range, safeRange)) {
		return sendError('Range feature restricted', 403);
	}

	try {
		if (safeMode === 'list') {
			const listData = await fetchLastFmData(user, safeMode, safeRange, safeLimit);
			if (!listData || !listData.tracks?.length) {
				return sendError('No data found', 404);
			}

			const tracksWithImages = await Promise.all(
				listData.tracks.map(async (t) => ({ ...t, imageBase64: await fetchImageAsBase64(t.image) }))
			);

			res.setHeader('Cache-Control', 'public, max-age=900, s-maxage=900, stale-while-revalidate=1800');
			const svg = generateListSvg({ tracks: tracksWithImages }, { width: safeWidth, bg: safeBg, theme: safeTheme });
			return res.send(svg);
		}

		const data = await fetchLastFmData(user, safeMode, safeRange);

		if (!data) {
			if (safeMode === 'now') {
				return sendError('Not playing', 200);
			}
			if (safeMode === 'obsession') {
				return sendError(`No current obsession found`, 404);
			}
			throw { response: { status: 404 } };
		}

		if (safeMode === 'top') {
			data.type = 'top_track';
		}

		if (safeMode === 'obsession' || (safeMode === 'smart' && !data.isRecent)) {
			res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=7200');
		} else {
			res.setHeader('Cache-Control', 'public, max-age=240, s-maxage=240, stale-while-revalidate=120');
		}
		if (safeMode === 'recent') {
			res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=30');
		}
		if (safeMode === 'now') {
			res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=30, stale-while-revalidate=15');
		}

		// Fetch Image
		const imageBase64 = await fetchImageAsBase64(data.image);

		const svg = generateSvg({ ...data, imageBase64 }, { width: safeWidth, bg: safeBg, mode: safeMode, theme: safeTheme });
		res.send(svg);

	} catch (error) {
		console.error(error);
		if (error.message === 'LASTFM_API_KEY_MISSING') {
			return sendError('Range needs LASTFM API Key', 501);
		}
		if (error.message === 'RECENT_TRACKS_PRIVATE') {
			return sendError('Recent tracks are private', 403);
		}
		if (error.response && error.response.status === 404) {
			sendError(`No data found`, 404);
		} else {
			sendError('Internal Server Error', 500);
		}
	}
};

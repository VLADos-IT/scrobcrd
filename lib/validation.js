const DEFAULT_WIDTH = 400;
const DEFAULT_BG = '181818';
const DEFAULT_MODE = 'smart';
const DEFAULT_RANGE = 'all';
const DEFAULT_THEME = 'default';
const DEFAULT_SOURCE = 'lastfm';

const DEFAULT_LIMIT = 5;
const MAX_LIST_LIMIT = 10;

const VALID_SOURCES = ['lastfm', 'listenbrainz'];

function isValidHex(value) {
	return /^([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value);
}

function validateParams(query) {
	const {
		user,
		bg = DEFAULT_BG,
		accent,
		width = DEFAULT_WIDTH,
		mode = DEFAULT_MODE,
		range = DEFAULT_RANGE,
		theme = DEFAULT_THEME,
		limit = DEFAULT_LIMIT,
		source = DEFAULT_SOURCE
	} = query;

	const safeWidth = Math.max(120, Math.min(1000, parseInt(width) || DEFAULT_WIDTH));
	const isValidHexBg = isValidHex(bg);
	const normalizedBg = bg === 'none' ? 'transparent' : bg;
	const safeBg = (normalizedBg !== 'transparent' && !isValidHexBg) ? DEFAULT_BG : normalizedBg;	const safeMode = ['smart', 'obsession', 'top', 'recent', 'now', 'list', 'history'].includes(mode) ? mode : DEFAULT_MODE;
	const safeRange = ['all', '7day', '1month', '3month', '6month', '12month'].includes(range) ? range : DEFAULT_RANGE;
	const safeTheme = theme || DEFAULT_THEME;
	const safeLimit = Math.max(1, Math.min(MAX_LIST_LIMIT, parseInt(limit, 10) || DEFAULT_LIMIT));
	const safeSource = VALID_SOURCES.includes(String(source).toLowerCase()) ? String(source).toLowerCase() : DEFAULT_SOURCE;

	const safeAccent = (accent && isValidHex(accent)) ? `#${accent.replace('#', '')}` : null;

	return {
		user,
		safeWidth,
		safeBg,
		safeAccent,
		safeMode,
		safeRange,
		safeTheme,
		safeLimit,
		safeSource
	};
}

function checkWhitelist(user, range) {
	if (range !== 'all') {
		const whitelist = process.env.WHITELIST_USERS ? process.env.WHITELIST_USERS.split(',').map(u => u.trim().toLowerCase()) : null;

		if (whitelist && !whitelist.includes(user.toLowerCase())) {
			return false;
		}
	}
	return true;
}

module.exports = {
	DEFAULT_WIDTH,
	DEFAULT_BG,
	validateParams,
	checkWhitelist
};
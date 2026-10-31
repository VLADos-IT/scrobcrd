const DEFAULT_WIDTH = 400;
const DEFAULT_BG = '181818';
const DEFAULT_MODE = 'smart';
const DEFAULT_RANGE = 'all';
const DEFAULT_THEME = 'default';
const DEFAULT_SOURCE = 'lastfm';

const DEFAULT_LIMIT = 5;
const MAX_LIST_LIMIT = 10;

const VALID_SOURCES = ['lastfm', 'listenbrainz'];
const VALID_MODES = ['smart', 'obsession', 'top', 'recent', 'now', 'list', 'history'];
const VALID_RANGES = ['all', '7day', '1month', '3month', '6month', '12month'];
const VALID_THEMES = ['default', 'compact', 'osx', 'retro', 'xorg'];

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

	const safeWidth = Math.max(120, Math.min(1000, parseInt(width, 10) || DEFAULT_WIDTH));
	const normalizedBg = bg === 'none' ? 'transparent' : bg;
	const safeBg = (normalizedBg === 'transparent' || isValidHex(normalizedBg)) ? normalizedBg : DEFAULT_BG;
	const safeMode = VALID_MODES.includes(mode) ? mode : DEFAULT_MODE;
	const safeRange = VALID_RANGES.includes(range) ? range : DEFAULT_RANGE;
	const safeTheme = VALID_THEMES.includes(theme) ? theme : DEFAULT_THEME;
	const safeLimit = Math.max(1, Math.min(MAX_LIST_LIMIT, parseInt(limit, 10) || DEFAULT_LIMIT));
	const normalizedSource = String(source).toLowerCase();
	const safeSource = VALID_SOURCES.includes(normalizedSource) ? normalizedSource : DEFAULT_SOURCE;

	const safeAccent = (accent && isValidHex(String(accent).replace('#', ''))) ? `#${accent.replace('#', '')}` : null;

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
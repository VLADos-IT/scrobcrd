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

// Query values can arrive as arrays/objects (?a=1&a=2, ?a[x]=1).
// Only plain strings are accepted; anything else counts as "not provided".
function asString(value) {
	return typeof value === 'string' ? value : undefined;
}

function pick(value, allowed, fallback) {
	const str = asString(value);
	return allowed.includes(str) ? str : fallback;
}

function normalizeHex(value) {
	const str = asString(value);
	if (str === undefined) return null;
	const hex = str.replace(/^#/, '');
	return isValidHex(hex) ? hex.toLowerCase() : null;
}

function validateParams(query = {}) {
	const user = asString(query.user);
	const bgParam = asString(query.bg);
	const bgHex = bgParam === 'none' || bgParam === 'transparent' ? 'transparent' : normalizeHex(bgParam);
	const accentHex = normalizeHex(query.accent);
	const source = (asString(query.source) || DEFAULT_SOURCE).toLowerCase();

	const safeWidth = Math.max(120, Math.min(1000, parseInt(asString(query.width), 10) || DEFAULT_WIDTH));
	const safeBg = bgHex || DEFAULT_BG;
	const safeMode = pick(query.mode, VALID_MODES, DEFAULT_MODE);
	const safeRange = pick(query.range, VALID_RANGES, DEFAULT_RANGE);
	const safeTheme = pick(query.theme, VALID_THEMES, DEFAULT_THEME);
	const safeLimit = Math.max(1, Math.min(MAX_LIST_LIMIT, parseInt(asString(query.limit), 10) || DEFAULT_LIMIT));
	const safeSource = pick(source, VALID_SOURCES, DEFAULT_SOURCE);
	const safeAccent = accentHex ? `#${accentHex}` : null;

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
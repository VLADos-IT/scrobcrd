const DEFAULT_WIDTH = 400;
const DEFAULT_BG = '181818';
const DEFAULT_MODE = 'smart';
const DEFAULT_RANGE = 'all';
const DEFAULT_THEME = 'default';

const DEFAULT_LIMIT = 5;
const MAX_LIST_LIMIT = 10;

function validateParams(query) {
	const {
		user,
		bg = DEFAULT_BG,
		width = DEFAULT_WIDTH,
		mode = DEFAULT_MODE,
		range = DEFAULT_RANGE,
		theme = DEFAULT_THEME,
		limit = DEFAULT_LIMIT
	} = query;

	const safeWidth = Math.max(120, Math.min(1000, parseInt(width) || DEFAULT_WIDTH));
	const isValidHexBg = /^([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(bg);
	const safeBg = (bg !== 'transparent' && bg !== 'none' && !isValidHexBg) ? DEFAULT_BG : bg;
	const safeMode = ['smart', 'obsession', 'top', 'recent', 'now', 'list'].includes(mode) ? mode : DEFAULT_MODE;
	const safeRange = ['all', '7day', '1month', '3month', '6month', '12month'].includes(range) ? range : DEFAULT_RANGE;
	const safeTheme = theme || DEFAULT_THEME;
	const safeLimit = Math.max(1, Math.min(MAX_LIST_LIMIT, parseInt(limit, 10) || DEFAULT_LIMIT));

	return {
		user,
		safeWidth,
		safeBg,
		safeMode,
		safeRange,
		safeTheme,
		safeLimit
	};
}

function checkWhitelist(user, range, safeRange) {
	if (safeRange !== 'all') {
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

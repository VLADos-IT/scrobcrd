const { parseChartlistRow, parseChartlistRows } = require('./chartlist-row');

function parseFirstRow(html, defaultUrl, type) {
	const rows = parseChartlistRows(html, defaultUrl, type, 1);
	return rows[0] || null;
}

const parseTopTrack = (html, defaultUrl) => parseFirstRow(html, defaultUrl, 'top_track');
function parseRecentTrack(html, defaultUrl) {
	const rows = parseChartlistRows(html, defaultUrl, 'recent_track', 1, { detectNowPlaying: true });
	const row = rows[0];
	if (!row) return null;
	return row.isPlaying ? { ...row, type: 'nowplaying' } : row;
}

function parseTopTracksList(html, defaultUrl, limit) {
	return parseChartlistRows(html, defaultUrl, 'top_track', limit);
}

function parseRecentTracksList(html, defaultUrl, limit) {
	return parseChartlistRows(html, defaultUrl, 'recent_track', limit, { detectNowPlaying: true });
}

module.exports = {
	parseTopTrack,
	parseRecentTrack,
	parseTopTracksList,
	parseRecentTracksList
};

const { parseChartlistRow, parseChartlistRows } = require('./chartlist-row');

function parseTopTrack(html, defaultUrl) {
	const rowStartIndex = html.indexOf('chartlist-row');
	if (rowStartIndex === -1) return null;

	const rowEndIndex = html.indexOf('</tr>', rowStartIndex);
	if (rowEndIndex === -1) return null;

	const rowHtml = html.substring(rowStartIndex, rowEndIndex);

	return parseChartlistRow(rowHtml, defaultUrl, 'top_track');
}

function parseTopTracksList(html, defaultUrl, limit) {
	return parseChartlistRows(html, defaultUrl, 'top_track', limit);
}

function parseRecentTracksList(html, defaultUrl, limit) {
	return parseChartlistRows(html, defaultUrl, 'recent_track', limit);
}

module.exports = {
	parseTopTrack,
	parseTopTracksList,
	parseRecentTracksList
};

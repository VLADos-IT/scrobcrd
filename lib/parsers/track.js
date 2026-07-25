const { parseChartlistRow, parseChartlistRows } = require('./chartlist-row');

/**
 * Parses Top Track (Recent Track) data from Last.fm Library HTML.
 * @param {string} html 
 * @param {string} defaultUrl 
 * @returns {object|null}
 */
function parseTopTrack(html, defaultUrl) {
	// We expect Library page HTML, so we look for the first chartlist-row
	const rowStartIndex = html.indexOf('chartlist-row');
	if (rowStartIndex === -1) return null;

	const rowEndIndex = html.indexOf('</tr>', rowStartIndex);
	if (rowEndIndex === -1) return null;

	const rowHtml = html.substring(rowStartIndex, rowEndIndex);

	return parseChartlistRow(rowHtml, defaultUrl, 'top_track');
}

/**
 * Parses the top N tracks from Last.fm Library.
 * @param {string} html
 * @param {string} defaultUrl
 * @param {number} limit
 * @returns {Array<object>}
 */
function parseTopTracksList(html, defaultUrl, limit) {
	return parseChartlistRows(html, defaultUrl, 'top_track', limit);
}

module.exports = {
	parseTopTrack,
	parseTopTracksList
};

/**
 * HTML Parsers for Last.fm
 * @author VLADos-IT <https://github.com/VLADos-IT>
 */

const { parseObsession, parseObsessionPage } = require('./obsession');
const { parseRecentTrack } = require('./recent');
const { parseTopTrack, parseTopTracksList } = require('./track');

module.exports = {
	parseObsession,
	parseObsessionPage,
	parseRecentTrack,
	parseTopTrack,
	parseTopTracksList
};

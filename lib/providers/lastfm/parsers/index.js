const { parseObsession, parseObsessionPage } = require('./obsession');
const { parseRecentTrack } = require('./recent');
const { parseTopTrack, parseTopTracksList, parseRecentTracksList } = require('./track');

module.exports = {
	parseObsession,
	parseObsessionPage,
	parseRecentTrack,
	parseTopTrack,
	parseTopTracksList,
	parseRecentTracksList
};

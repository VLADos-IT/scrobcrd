const { parseObsession, parseObsessionPage } = require('./obsession');
const { parseTopTrack, parseRecentTrack, parseTopTracksList, parseRecentTracksList } = require('./track');

module.exports = {
	parseObsession,
	parseObsessionPage,
	parseRecentTrack,
	parseTopTrack,
	parseTopTracksList,
	parseRecentTracksList
};

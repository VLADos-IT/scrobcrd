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

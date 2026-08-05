const { fetchLastFmData } = require('./service');

module.exports = {
    brand: 'LAST.FM',
    accentColor: '#d1170e',
    profileUrl: (user) => `https://www.last.fm/user/${encodeURIComponent(user)}`,
    fetch: fetchLastFmData
};

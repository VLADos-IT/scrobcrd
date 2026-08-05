const lastfm = require('./lastfm');
const listenbrainz = require('./listenbrainz');

const providers = { lastfm, listenbrainz };

function getProvider(source) {
    return providers[source] || lastfm;
}

module.exports = { getProvider };

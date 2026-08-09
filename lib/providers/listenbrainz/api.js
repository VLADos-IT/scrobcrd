const { client, requestWithRetry } = require('../../utils');

const LB_ROOT = 'https://api.listenbrainz.org/1';
const CAA_ROOT = 'https://coverartarchive.org';
const API_KEY = process.env.LISTENBRAINZ_API_KEY;

const RANGE_TO_LB_RANGE = {
    all: 'all_time',
    '7day': 'week',
    '1month': 'month',
    '3month': 'quarter',
    '6month': 'half_yearly',
    '12month': 'year'
};

const authHeaders = () => API_KEY ? { Authorization: `Token ${API_KEY}` } : {};

async function lbGet(path, params) {
    return requestWithRetry(() => client.get(`${LB_ROOT}${path}`, {
        params,
        headers: authHeaders(),
        validateStatus: (status) => (status >= 200 && status < 300) || status === 204 || status === 404
    }));
}

function resolveCoverArt(releaseMbid, releaseGroupMbid) {
    const urls = [];
    if (releaseMbid) urls.push(`${CAA_ROOT}/release/${releaseMbid}/front-500`);
    if (releaseGroupMbid) urls.push(`${CAA_ROOT}/release-group/${releaseGroupMbid}/front-500`);
    return urls;
}

function extractReleaseMbid(trackMetadata) {
    if (!trackMetadata) return '';
    return (
        trackMetadata.mbid_mapping?.release_mbid ||
        trackMetadata.additional_info?.release_mbid ||
        ''
    );
}

function extractReleaseGroupMbid(trackMetadata) {
    if (!trackMetadata) return '';
    return (
        trackMetadata.mbid_mapping?.release_group_mbid ||
        trackMetadata.additional_info?.release_group_mbid ||
        ''
    );
}

function extractRecordingMbid(trackMetadata) {
    if (!trackMetadata) return '';
    return (
        trackMetadata.mbid_mapping?.recording_mbid ||
        trackMetadata.additional_info?.recording_mbid ||
        trackMetadata.recording_mbid ||
        ''
    );
}

function getProfileUrl(user) {
    return `https://listenbrainz.org/user/${encodeURIComponent(user)}/`;
}

function getRecordingUrl(user, recordingMbid) {
    return recordingMbid ? `https://listenbrainz.org/recording/${recordingMbid}/` : getProfileUrl(user);
}

async function getPlayingNow(user) {
    const { data, status } = await lbGet(`/user/${encodeURIComponent(user)}/playing-now`);
    if (status === 404 || status === 204) return null;

    const listen = data?.payload?.listens?.[0];
    if (!listen || !data.payload.playing_now) return null;

    const meta = listen.track_metadata;
    return {
        track: meta.track_name,
        artist: meta.artist_name,
        image: resolveCoverArt(extractReleaseMbid(meta), extractReleaseGroupMbid(meta)),
        url: getRecordingUrl(user, extractRecordingMbid(meta)),
        type: 'nowplaying'
    };
}

async function getRecentListen(user) {
    const { data, status } = await lbGet(`/user/${encodeURIComponent(user)}/listens`, { count: 1 });
    if (status === 404 || status === 204) return null;

    const listen = data?.payload?.listens?.[0];
    if (!listen) return null;

    const meta = listen.track_metadata;
    return {
        track: meta.track_name,
        artist: meta.artist_name,
        image: resolveCoverArt(extractReleaseMbid(meta), extractReleaseGroupMbid(meta)),
        url: getRecordingUrl(user, extractRecordingMbid(meta)),
        type: 'recent_track'
    };
}

async function getRecentListens(user, limit) {
    const { data, status } = await lbGet(`/user/${encodeURIComponent(user)}/listens`, { count: limit });
    if (status === 404 || status === 204) return null;

    const listens = data?.payload?.listens;
    if (!Array.isArray(listens) || listens.length === 0) return null;

    const tracks = listens.slice(0, limit).map((listen, index) => {
        const meta = listen.track_metadata;
        return {
            rank: index + 1,
            track: meta.track_name,
            artist: meta.artist_name,
            image: resolveCoverArt(extractReleaseMbid(meta), extractReleaseGroupMbid(meta)),
            url: getRecordingUrl(user, extractRecordingMbid(meta)),
            playcount: null
        };
    });

    return {
        tracks,
        url: getProfileUrl(user),
        type: 'recent_list'
    };
}

async function getTopTrack(user, range, type = 'top_track') {
    const lbRange = RANGE_TO_LB_RANGE[range] || 'all_time';
    const { data, status } = await lbGet(`/stats/user/${encodeURIComponent(user)}/recordings`, {
        range: lbRange,
        count: 1
    });

    if (status === 204 || status === 404) return null;

    const recording = data?.payload?.recordings?.[0];
    if (!recording) return null;

    return {
        track: recording.track_name,
        artist: recording.artist_name,
        image: resolveCoverArt(recording.release_mbid, recording.release_group_mbid),
        url: getRecordingUrl(user, recording.recording_mbid),
        type
    };
}

async function getTopTracksList(user, range, limit) {
    const lbRange = RANGE_TO_LB_RANGE[range] || 'all_time';
    const { data, status } = await lbGet(`/stats/user/${encodeURIComponent(user)}/recordings`, {
        range: lbRange,
        count: limit
    });

    if (status === 204 || status === 404) return null;

    const recordings = data?.payload?.recordings;
    if (!Array.isArray(recordings) || recordings.length === 0) return null;

    const tracks = recordings.slice(0, limit).map((r, index) => ({
        rank: index + 1,
        track: r.track_name,
        artist: r.artist_name,
        image: resolveCoverArt(r.release_mbid, r.release_group_mbid),
        url: getRecordingUrl(user, r.recording_mbid),
        playcount: r.listen_count ?? null
    }));

    return {
        tracks,
        url: getProfileUrl(user),
        type: 'top_list'
    };
}

module.exports = { getPlayingNow, getRecentListen, getRecentListens, getTopTrack, getTopTracksList };

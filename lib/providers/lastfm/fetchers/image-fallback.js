const { client, requestWithRetry } = require('../../../utils');
const { parseRecentTracksList } = require('../parsers/index');

async function backfillMissingImages(user, tracks, limit) {
    const missing = tracks.filter((t) => !t.image);
    if (missing.length === 0) return tracks;

    try {
        const url = `https://www.last.fm/user/${encodeURIComponent(user)}/library`;
        const { data: html } = await requestWithRetry(
            () => client.get(url, { timeout: 4000 }),
            { retries: 0 }
        );

        const rows = parseRecentTracksList(html, url, Math.max(limit, missing.length, 10));
        const key = (track, artist) => `${track}`.trim().toLowerCase() + '::' + `${artist}`.trim().toLowerCase();
        const imageByKey = new Map(rows.map((r) => [key(r.track, r.artist), r.image]).filter(([, img]) => img));

        return tracks.map((t) => {
            if (t.image) return t;
            const found = imageByKey.get(key(t.track, t.artist));
            return found ? { ...t, image: found } : t;
        });
    } catch (e) {
        console.error('Image backfill scrape failed:', e.message);
        return tracks;
    }
}

module.exports = { backfillMissingImages };

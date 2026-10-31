const { LRUCache } = require('lru-cache');
const { client } = require('./utils');

const LOOKUP_TIMEOUT_MS = 2500;
const coverCache = new LRUCache({ max: 500, ttl: 1000 * 60 * 60 * 2 });

const norm = (s) => `${s || ''}`.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
const sameArtist = (a, b) => {
    const x = norm(a);
    const y = norm(b);
    return Boolean(x) && Boolean(y) && (x === y || x.includes(y) || y.includes(x));
};
const clean = (s) => `${s || ''}`.replace(/["\\]/g, ' ').trim();

async function fromDeezer(artist, track) {
    try {
        const { data } = await client.get('https://api.deezer.com/search', {
            params: { q: `artist:"${clean(artist)}" track:"${clean(track)}"`, limit: 5 },
            timeout: LOOKUP_TIMEOUT_MS
        });
        const hit = (data?.data || []).find((r) => sameArtist(r.artist?.name, artist) && r.album?.cover_medium);
        return hit ? (hit.album.cover_big || hit.album.cover_medium) : null;
    } catch (e) {
        return null;
    }
}

async function fromItunes(artist, track) {
    try {
        const { data } = await client.get('https://itunes.apple.com/search', {
            params: { term: `${clean(artist)} ${clean(track)}`, entity: 'song', limit: 5 },
            timeout: LOOKUP_TIMEOUT_MS
        });
        const hit = (data?.results || []).find((r) => sameArtist(r.artistName, artist) && r.artworkUrl100);
        return hit ? hit.artworkUrl100.replace(/\/\d+x\d+(bb)?\./, '/300x300bb.') : null;
    } catch (e) {
        return null;
    }
}

async function findFallbackCovers(artist, track) {
    if (!artist || !track) return [];
    const key = `${norm(artist)}::${norm(track)}`;
    const cached = coverCache.get(key);
    if (cached) return cached;

    const [deezer, itunes] = await Promise.all([fromDeezer(artist, track), fromItunes(artist, track)]);
    const urls = [deezer, itunes].filter(Boolean);
    coverCache.set(key, urls);
    return urls;
}

module.exports = { findFallbackCovers };

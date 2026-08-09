const { generateSvg, generateListSvg } = require('../lib/svg');
const { fetchImageAsBase64, isValidUsername } = require('../lib/utils');
const errorCard = require('../lib/templates/error');
const { validateParams, checkWhitelist } = require('../lib/validation');
const { getProvider } = require('../lib/providers');

module.exports = async (req, res) => {
    const { user, safeWidth, safeBg, safeAccent, safeMode, safeRange, safeTheme, safeLimit, safeSource } = validateParams(req.query);
    const provider = getProvider(safeSource);
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', 'inline; filename="scrobcrd.svg"');
    res.setHeader('Content-Security-Policy', "default-src 'none'; img-src data: https:; style-src 'unsafe-inline'; sandbox");
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const sendError = (message, status = 400) => {
        res.setHeader('Cache-Control', status >= 500
            ? 'no-store'
            : 'public, max-age=30, s-maxage=30, stale-while-revalidate=60');

        return res.status(status).send(errorCard({
            width: safeWidth,
            height: 120,
            bgFill: safeBg,
            message
        }));
    };

    if (!user) return sendError('Missing user parameter', 400);
    if (!isValidUsername(user)) return sendError('Invalid username', 400);
    if (safeSource === 'lastfm' && ['top', 'list'].includes(safeMode) && !checkWhitelist(user, safeRange)) {
        return sendError('Range feature restricted', 403);
    }

    try {
        if (safeMode === 'list' || safeMode === 'history') {
            const listData = await provider.fetch(user, safeMode, safeRange, safeLimit);

            if (!listData || !listData.tracks?.length) {
                return sendError(safeMode === 'history' ? 'No recent listens found' : 'No tracks found', 404);
            }

            const tracksWithImages = await Promise.all(listData.tracks.map(async (track) => ({
                ...track,
                imageBase64: await fetchImageAsBase64(track.image)
            })));

            res.setHeader('Cache-Control', safeMode === 'history'
                ? 'public, max-age=60, s-maxage=60, stale-while-revalidate=30'
                : 'public, max-age=900, s-maxage=900, stale-while-revalidate=1800');

            const svg = generateListSvg(
                { tracks: tracksWithImages },
                {
                    width: safeWidth,
                    bg: safeBg,
                    theme: safeTheme,
                    accentColor: safeAccent || provider.accentColor,
                    profileUrl: provider.profileUrl(user),
                    listType: listData.type
                }
            );
            return res.send(svg);
        }

        const data = await provider.fetch(user, safeMode, safeRange);

        if (!data) {
            if (safeMode === 'now') return sendError('Not playing', 200);
            if (safeMode === 'obsession') return sendError('No obsession set', 404);
            if (safeMode === 'recent') return sendError('No recent listens', 404);
            if (safeMode === 'top') return sendError('No top tracks found', 404);
            return sendError('No music activity found', 404);
        }

        if (safeMode === 'top') data.type = 'top_track';

        res.setHeader('Cache-Control', getCacheControl(safeMode, data.type));

        const imageBase64 = await fetchImageAsBase64(data.image);

        const svg = generateSvg(
            { ...data, imageBase64 },
            {
                width: safeWidth,
                bg: safeBg,
                theme: safeTheme,
                brand: provider.brand,
                accentColor: safeAccent || provider.accentColor,
                profileUrl: provider.profileUrl(user)
            }
        );

        res.send(svg);

    } catch (error) {
        console.error('Request failed:', error.message);
        const message = error.message || '';

        if (message.includes('API_KEY_MISSING')) {
            return sendError(`Range needs API Key for ${provider.brand}`, 501);
        }
        if (message.includes('PRIVATE')) {
            return sendError('Activity is private', 403);
        }
        if (error.response?.status === 404) {
            return sendError('No music activity found', 404);
        }

        return sendError('Internal Server Error', 500);
    }
};

function getCacheControl(mode, type) {
    if (mode === 'now' || type === 'nowplaying') return 'public, max-age=30, s-maxage=30, stale-while-revalidate=15';
    if (mode === 'recent') return 'public, max-age=60, s-maxage=60, stale-while-revalidate=30';
    if (mode === 'obsession' || (mode === 'smart' && type === 'obsession')) return 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=7200';
    return 'public, max-age=240, s-maxage=240, stale-while-revalidate=120';
}

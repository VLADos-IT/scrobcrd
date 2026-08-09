const { escapeXml, isLightColor, truncate } = require('./utils');
const cardDispatcher = require('./templates/card');
const { renderList } = require('./templates/list');

function generateSvg(data, options) {
    const { track, artist, imageBase64, url, type } = data;
    const { width, bg, theme, brand = 'LAST.FM', accentColor, profileUrl } = options;
    const numericWidth = parseInt(width, 10) || 400;

    const height = 120;
    const padding = 15;
    const imageSize = 90;
    const borderRadius = 12;

    const isObsession = type === 'obsession';
    const isRecent = type === 'recent_track';
    const isNowPlaying = type === 'nowplaying';
    let headerText = `${brand} TOP TRACK`;

    if (isObsession) {
        headerText = `${brand} OBSESSION`;
    } else if (isNowPlaying) {
        headerText = numericWidth < 205 ? 'NOW' : 'NOW PLAYING';
    } else if (isRecent) {
        headerText = `${brand} RECENT TRACK`;
    }

    const headerColor = accentColor || '#d1170e';
    if (numericWidth < 280) {
        if (isObsession) {
            headerText = 'OBSESSION';
        } else if (isNowPlaying) {
            headerText = numericWidth < 205 ? 'NOW' : 'NOW PLAYING';
        } else if (isRecent) {
            headerText = 'RECENT TRACK';
        } else {
            headerText = 'TOP TRACK';
        }
    }

    const bgFill = bg === 'transparent' ? 'none' : `#${escapeXml(bg)}`;
    const isLight = bg === 'transparent' ? true : isLightColor(bg);

    const textColor = isLight ? '#000000' : '#ffffff';
    const artistColor = isLight ? '#4a4a4a' : '#b3b3b3';

    const gap = 15;
    const startX = padding + imageSize + gap;
    const availableWidth = numericWidth - startX - padding;

    const maxTrackChars = Math.max(4, Math.floor(availableWidth / 9.5));
    const maxArtistChars = Math.max(4, Math.floor(availableWidth / 8.5));

    const safeUrl = (url && /^https?:\/\//i.test(url)) ? escapeXml(url) : '';

    return cardDispatcher({
        width,
        height,
        bgFill,
        borderRadius,
        padding,
        imageSize,
        url: safeUrl,
        profileUrl: escapeXml(profileUrl || ''),
        imageBase64,
        headerText,
        headerColor,
        textColor,
        artistColor,
        safeTrack: escapeXml(truncate(track, maxTrackChars)),
        safeArtist: escapeXml(truncate(artist, maxArtistChars)),
        rawTrack: track || '',
        rawArtist: artist || '',
        theme
    });
}

function generateListSvg(data, options) {
    const { width, bg, theme, accentColor, profileUrl, listType } = options;
    const bgFill = bg === 'transparent' ? 'none' : `#${escapeXml(bg)}`;

    return renderList({
        tracks: data.tracks,
        width,
        bg,
        bgFill,
        theme,
        accentColor,
        profileUrl: escapeXml(profileUrl || ''),
        listType
    });
}

module.exports = { generateSvg, generateListSvg };

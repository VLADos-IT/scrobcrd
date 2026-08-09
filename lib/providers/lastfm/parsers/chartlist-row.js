const { upgradeImage, toAbsolute } = require('../../../utils');

function parseChartlistRow(rowHtml, defaultUrl, type) {
    const getAttr = (name) => {
        const match = rowHtml.match(new RegExp(`data-${name}=["']([^"']+)["']`));
        return match ? match[1] : null;
    };

    let trackName = getAttr('track-name');
    let artistName = getAttr('artist-name');

    if (!trackName) {
        const m = rowHtml.match(/class="chartlist-name"[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/);
        if (m?.[1]) trackName = m[1].trim();
    }

    if (!artistName) {
        const m = rowHtml.match(/class="chartlist-artist"[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/);
        if (m?.[1]) artistName = m[1].trim();
    }

    trackName = trackName || 'Unknown Track';
    artistName = artistName || 'Unknown Artist';

    let trackUrl = defaultUrl;
    const hrefMatch = rowHtml.match(/class="chartlist-name"[\s\S]*?<a href="([^"]*)"/);
    if (hrefMatch?.[1]) {
        trackUrl = toAbsolute(hrefMatch[1]);
    } else {
        const dataUrl = getAttr('track-url');
        if (dataUrl) trackUrl = toAbsolute(dataUrl);
    }

    let imageUrl = '';
    const imgMatch = rowHtml.match(/<img[^>]*src="([^"]+)"/);
    if (imgMatch?.[1]) {
        imageUrl = imgMatch[1];
    } else {
        const dataSrc = rowHtml.match(/<img[^>]*data-src="([^"]+)"/);
        if (dataSrc?.[1]) imageUrl = dataSrc[1];
    }

    return {
        track: trackName,
        artist: artistName,
        image: upgradeImage(imageUrl),
        url: trackUrl,
        type
    };
}

function parseChartlistRows(html, defaultUrl, type, limit) {
    const rows = [];
    let searchFrom = 0;

    while (rows.length < limit) {
        const rowStartIndex = html.indexOf('chartlist-row', searchFrom);
        if (rowStartIndex === -1) break;

        const rowEndIndex = html.indexOf('</tr>', rowStartIndex);
        if (rowEndIndex === -1) break;

        const rowHtml = html.substring(rowStartIndex, rowEndIndex);
        const parsed = parseChartlistRow(rowHtml, defaultUrl, type);

        const playcountMatch = rowHtml.match(/class="chartlist-count-bar-value"[^>]*>\s*([\d,]+)/);
        parsed.playcount = playcountMatch?.[1] ? playcountMatch[1].replace(/,/g, '') : null;

        rows.push(parsed);
        searchFrom = rowEndIndex + 5;
    }

    return rows;
}

module.exports = { parseChartlistRow, parseChartlistRows };

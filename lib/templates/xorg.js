const getStyles = require('../styles');

const FALLBACK_BG = '#282828';
const FALLBACK_ACCENT = '#b16286';

function resolveBg(bgFill) {
    if (!bgFill || bgFill === 'none') return 'transparent';
    return bgFill;
}

function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const num = parseInt(full, 16);
    return { r: (num >> 16) & 0xff, g: (num >> 8) & 0xff, b: num & 0xff };
}

function luminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    return (r * 299 + g * 587 + b * 114) / 1000;
}

function isLight(hex) {
    return luminance(hex) > 150;
}

function shade(hex, amount) {
    const { r, g, b } = hexToRgb(hex);
    const clamp = (v) => Math.min(255, Math.max(0, v));
    const nr = clamp(r + amount);
    const ng = clamp(g + amount);
    const nb = clamp(b + amount);
    return `#${((1 << 24) + (nr << 16) + (ng << 8) + nb).toString(16).slice(1)}`;
}

function adaptAccent(accentHex, bgIsLight) {
    const base = (accentHex && accentHex.startsWith('#')) ? accentHex : FALLBACK_ACCENT;
    return shade(base, bgIsLight ? -50 : 10);
}

function resolveColors(bgFill, headerColor) {
    const resolved = resolveBg(bgFill);
    const isTransparent = resolved === 'transparent';
    const cardFill = isTransparent ? FALLBACK_BG : resolved;
    const bgIsLight = isLight(cardFill);
    const dir = bgIsLight ? -1 : 1;
    return {
        cardFill,
        isTransparent,
        BORDER: shade(cardFill, dir * 34),
        PANEL: shade(cardFill, dir * 18),
        ACCENT: adaptAccent(headerColor, bgIsLight)
    };
}

const STRIPE = 6;

function xorgCard({ width, height, url, profileUrl, imageBase64, headerText, headerColor, textColor, artistColor, safeTrack, safeArtist, bgFill }) {
    const { cardFill, isTransparent, PANEL, ACCENT } = resolveColors(bgFill, headerColor);
    const padding = 14;
    const coverSize = 76;
    const coverY = padding + STRIPE;
    const startX = padding + coverSize + 14;

    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs><clipPath id="xorg-cover-clip"><rect x="${padding}" y="${coverY}" width="${coverSize}" height="${coverSize}" rx="3" /></clipPath></defs>
        <style>${getStyles('xorg')}</style>
        <a xlink:href="${profileUrl || url}" target="_blank">
            <rect width="${width}" height="${height}" fill="${isTransparent ? 'transparent' : cardFill}" />
            <rect x="0" y="0" width="${width}" height="${STRIPE}" style="fill:${ACCENT}" />
            <rect width="${width}" height="${height}" fill="none" style="stroke:${ACCENT}" stroke-width="2" />
        </a>
        <a xlink:href="${url}" target="_blank">
            ${imageBase64 ? `<g clip-path="url(#xorg-cover-clip)"><image x="${padding}" y="${coverY}" width="${coverSize}" height="${coverSize}" preserveAspectRatio="xMidYMid slice" xlink:href="${imageBase64}" /></g>` : `<rect x="${padding}" y="${coverY}" width="${coverSize}" height="${coverSize}" fill="${PANEL}" />`}
            <text x="${startX}" y="${coverY + 20}" class="xorg-label" style="fill:${ACCENT}">${headerText}</text>
            <text x="${startX}" y="${coverY + 44}" class="track" style="fill:${textColor}">${safeTrack}</text>
            <text x="${startX}" y="${coverY + 65}" class="artist" style="fill:${artistColor}">${safeArtist}</text>
        </a>
    </svg>`;
}

function xorgNarrowCard({ width, height, url, profileUrl, imageBase64, headerText, headerColor, bgFill }) {
    const { cardFill, isTransparent, ACCENT } = resolveColors(bgFill, headerColor);
    const inset = 10;
    const coverSize = 74;
    const coverY = Math.floor((height - coverSize) / 2) + STRIPE / 2;

    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs><clipPath id="xorg-narrow-cover-clip"><rect x="${inset}" y="${coverY}" width="${coverSize}" height="${coverSize}" rx="3" /></clipPath></defs>
        <style>${getStyles('xorg')}</style>
        <a xlink:href="${profileUrl || url}" target="_blank">
            <rect width="${width}" height="${height}" fill="${isTransparent ? 'transparent' : cardFill}" />
            <rect x="0" y="0" width="${width}" height="${STRIPE}" style="fill:${ACCENT}" />
        </a>
        <a xlink:href="${url}" target="_blank">
            ${imageBase64 ? `<g clip-path="url(#xorg-narrow-cover-clip)"><image x="${inset}" y="${coverY}" width="${coverSize}" height="${coverSize}" preserveAspectRatio="xMidYMid slice" xlink:href="${imageBase64}" /></g>` : ''}
            <text x="${inset + coverSize + 8}" y="${coverY + coverSize / 2 + 4}" class="xorg-label" style="fill:${ACCENT}">${headerText.split(' ').pop()}</text>
        </a>
        <rect width="${width}" height="${height}" fill="none" style="stroke:${ACCENT}" stroke-width="2" pointer-events="none" />
    </svg>`;
}

function xorgTinyCard({ width, height, url, profileUrl, imageBase64, headerColor, bgFill }) {
    const { cardFill, isTransparent, ACCENT } = resolveColors(bgFill, headerColor);
    const inset = 8;
    const coverSize = Math.max(58, width - inset * 2);
    const coverX = Math.floor((width - coverSize) / 2);
    const coverY = Math.floor((height - coverSize) / 2);

    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs><clipPath id="xorg-tiny-cover-clip"><rect x="${coverX}" y="${coverY}" width="${coverSize}" height="${coverSize}" rx="3" /></clipPath></defs>
        <a xlink:href="${profileUrl || url}" target="_blank">
            <rect width="${width}" height="${height}" fill="${isTransparent ? 'transparent' : cardFill}" />
            <rect width="${width}" height="${height}" fill="none" style="stroke:${ACCENT}" stroke-width="2" />
            <rect x="0" y="0" width="${width}" height="4" style="fill:${ACCENT}" />
        </a>
        <a xlink:href="${url}" target="_blank">${imageBase64 ? `<g clip-path="url(#xorg-tiny-cover-clip)"><image x="${coverX}" y="${coverY}" width="${coverSize}" height="${coverSize}" preserveAspectRatio="xMidYMid slice" xlink:href="${imageBase64}" /></g>` : ''}</a>
    </svg>`;
}

module.exports = { render: xorgCard, renderNarrow: xorgNarrowCard, renderTiny: xorgTinyCard };
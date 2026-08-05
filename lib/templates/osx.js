const getStyles = require('../styles');

const FALLBACK_BG = '#0b0f14';
const FALLBACK_ACCENT = '#7ee787';

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

function chrome(cardFill, bgIsLight) {
    const dir = bgIsLight ? -1 : 1;
    return {
        panel: shade(cardFill, dir * 18),
        border: shade(cardFill, dir * 34)
    };
}

function adaptAccent(accentHex, bgIsLight) {
    const base = (accentHex && accentHex.startsWith('#')) ? accentHex : FALLBACK_ACCENT;
    return shade(base, bgIsLight ? -50 : 10);
}

function windowBar(height, panel) {
    return `
        <rect width="100%" height="${height}" fill="${panel}" />
        <circle cx="16" cy="${height / 2}" r="4" fill="#ff5f56" stroke="#e0443e" stroke-width="0.5" />
        <circle cx="30" cy="${height / 2}" r="4" fill="#ffbd2e" stroke="#dea123" stroke-width="0.5" />
        <circle cx="44" cy="${height / 2}" r="4" fill="#27c93f" stroke="#1aab29" stroke-width="0.5" />`;
}

function osxCard({ width, height, imageSize, url, profileUrl, imageBase64, headerText, headerColor, textColor, artistColor, safeTrack, safeArtist, bgFill }) {
    const resolvedBg = resolveBg(bgFill);
    const isTransparent = resolvedBg === 'transparent';
    const cardFill = isTransparent ? FALLBACK_BG : resolvedBg;
    const bgIsLight = isLight(cardFill);
    const { panel: PANEL, border: BORDER } = chrome(cardFill, bgIsLight);
    const ACCENT = adaptAccent(headerColor, bgIsLight);

    const padding = 14;
    const barHeight = 24;
    const gap = 14;

    const safeImageSize = Math.min(imageSize, height - barHeight - padding * 1.5);
    const startX = padding + safeImageSize + gap;
    const availableWidth = width - startX - padding;

    const waveStep = 32;
    const waveWidth = Math.ceil((availableWidth + 40) / waveStep) * waveStep;

    let d = 'M -20 4';
    for (let i = -20; i < waveWidth; i += waveStep) {
        d += ' l 8 -5 l 8 5 l 8 -5 l 8 5';
    }

    const promptLabel = (headerText || 'TOP TRACK').toLowerCase().replace(/\s+/g, '-');

    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
            <clipPath id="osx-card-clip"><rect width="${width}" height="${height}" rx="8" /></clipPath>
            <clipPath id="osx-wave-clip"><rect x="${-gap}" y="-10" width="${availableWidth + gap + 20}" height="30" /></clipPath>
        </defs>
        <style>
            ${getStyles('osx')}
            @keyframes wave { from { transform: translateX(0); } to { transform: translateX(-32px); } }
        </style>
        <g clip-path="url(#osx-card-clip)">
            <a xlink:href="${profileUrl || url}" target="_blank">
                <rect width="${width}" height="${height}" fill="${isTransparent ? 'transparent' : cardFill}" />
                ${windowBar(barHeight, PANEL)}
                <rect width="${width}" height="${height}" rx="8" fill="none" stroke="${BORDER}" stroke-width="1.5" />
            </a>
            <a xlink:href="${url}" target="_blank">
                ${imageBase64 ? `
                <rect x="${padding - 2}" y="${barHeight + padding - 2}" width="${safeImageSize + 4}" height="${safeImageSize + 4}" rx="6" fill="none" stroke="${BORDER}" stroke-width="1.5" />
                <image x="${padding}" y="${barHeight + padding}" width="${safeImageSize}" height="${safeImageSize}" xlink:href="${imageBase64}" rx="4" />
                ` : ''}
                <g transform="translate(${startX}, ${barHeight + padding + 10})">
                    <text x="0" y="0" class="osx-prompt" style="fill:${ACCENT}">~$ ${promptLabel}</text>
                    <text x="0" y="26" class="track" style="fill:${textColor}">${safeTrack}</text>
                    <text x="0" y="48" class="artist" style="fill:${artistColor}">${safeArtist}</text>
                    <g transform="translate(0, 58)" clip-path="url(#osx-wave-clip)">
                        <path class="osx-wave" d="${d}" style="stroke:${ACCENT}" />
                    </g>
                </g>
            </a>
        </g>
    </svg>`;
}

function toShortHeader(headerText) {
    if (!headerText) return 'top';
    if (headerText.includes('OBSESSION')) return 'obsession';
    if (headerText.includes('NOW')) return 'now';
    if (headerText.includes('RECENT')) return 'recent';
    return 'top';
}

function osxNarrowCard({ width, height, url, profileUrl, imageBase64, headerText, headerColor, bgFill }) {
    const resolvedBg = resolveBg(bgFill);
    const isTransparent = resolvedBg === 'transparent';
    const cardFill = isTransparent ? FALLBACK_BG : resolvedBg;
    const bgIsLight = isLight(cardFill);
    const { panel: PANEL, border: BORDER } = chrome(cardFill, bgIsLight);
    const ACCENT = adaptAccent(headerColor, bgIsLight);

    const padding = 10;
    const barHeight = 22;
    const coverSize = Math.min(72, height - barHeight - padding * 2);
    const coverY = barHeight + padding;
    const startX = padding + coverSize + 10;
    const shortHeader = toShortHeader(headerText);

    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs><clipPath id="osx-narrow-clip"><rect width="${width}" height="${height}" rx="8" /></clipPath></defs>
        <style>${getStyles('osx')}</style>
        <g clip-path="url(#osx-narrow-clip)">
            <a xlink:href="${profileUrl || url}" target="_blank">
                <rect width="${width}" height="${height}" fill="${isTransparent ? 'transparent' : cardFill}" />
                ${windowBar(barHeight, PANEL)}
                <rect width="${width}" height="${height}" rx="8" fill="none" stroke="${BORDER}" stroke-width="1.5" />
            </a>
            <a xlink:href="${url}" target="_blank">
                ${imageBase64 ? `<image x="${padding}" y="${coverY}" width="${coverSize}" height="${coverSize}" xlink:href="${imageBase64}" rx="4" />` : ''}
                <g transform="translate(${startX}, ${barHeight + 20})">
                    <text x="0" y="0" class="osx-prompt" style="fill:${ACCENT}; font-size:12px;">~$ ${shortHeader}</text>
                </g>
            </a>
        </g>
    </svg>`;
}

function osxTinyCard({ width, height, url, profileUrl, imageBase64, bgFill }) {
    const resolvedBg = resolveBg(bgFill);
    const isTransparent = resolvedBg === 'transparent';
    const cardFill = isTransparent ? FALLBACK_BG : resolvedBg;
    const bgIsLight = isLight(cardFill);
    const { border: BORDER } = chrome(cardFill, bgIsLight);

    const numericWidth = parseInt(width, 10);
    const inset = 8;
    const coverSize = Math.max(58, numericWidth - inset * 2);
    const coverX = Math.floor((numericWidth - coverSize) / 2);
    const coverY = Math.floor((height - coverSize) / 2);

    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <a xlink:href="${profileUrl || url}" target="_blank">
            <rect width="${width}" height="${height}" rx="8" fill="${isTransparent ? 'transparent' : cardFill}" />
            <rect width="${width}" height="${height}" rx="8" fill="none" stroke="${BORDER}" stroke-width="1.5" />
        </a>
        <a xlink:href="${url}" target="_blank">
            ${imageBase64 ? `<image x="${coverX}" y="${coverY}" width="${coverSize}" height="${coverSize}" xlink:href="${imageBase64}" rx="4" />` : ''}
        </a>
    </svg>`;
}

module.exports = { render: osxCard, renderNarrow: osxNarrowCard, renderTiny: osxTinyCard };
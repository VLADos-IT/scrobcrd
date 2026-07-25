const getStyles = require('../styles/index');

const osx_BG = '#0b0f14';
const osx_ACCENT = '#7ee787';
const osx_MUTED = '#9aa5b1';
const osx_BORDER = '#1c2733';

/**
 * Generates the osx-style track card SVG.
 * @param {object} params
 */
function osxCard({ width, height, imageSize, url, imageBase64, headerText, safeTrack, safeArtist }) {
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
            <clipPath id="osx-card-clip">
                <rect width="${width}" height="${height}" rx="8" />
            </clipPath>
            <clipPath id="osx-wave-clip">
                <rect x="${-gap}" y="-10" width="${availableWidth + gap + 20}" height="30" />
            </clipPath>
        </defs>
        <style>
            ${getStyles('osx')}
            @keyframes wave {
                from { transform: translateX(0); }
                to { transform: translateX(-32px); }
            }
        </style>
        <g clip-path="url(#osx-card-clip)">
            <rect width="${width}" height="${height}" fill="${osx_BG}" />
            <rect width="${width}" height="${barHeight}" fill="#111927" />
            
            <circle cx="16" cy="${barHeight / 2}" r="4" fill="#ff5f56" stroke="#e0443e" stroke-width="0.5" />
            <circle cx="30" cy="${barHeight / 2}" r="4" fill="#ffbd2e" stroke="#dea123" stroke-width="0.5" />
            <circle cx="44" cy="${barHeight / 2}" r="4" fill="#27c93f" stroke="#1aab29" stroke-width="0.5" />

            <rect width="${width}" height="${height}" rx="8" fill="none" stroke="${osx_BORDER}" stroke-width="1.5" />

            <a xlink:href="${url}" target="_blank">
                ${imageBase64 ? `
                <rect x="${padding - 2}" y="${barHeight + padding - 2}" width="${safeImageSize + 4}" height="${safeImageSize + 4}" rx="6" fill="none" stroke="${osx_BORDER}" stroke-width="1.5" />
                <image x="${padding}" y="${barHeight + padding}" width="${safeImageSize}" height="${safeImageSize}" xlink:href="${imageBase64}" rx="4" />
                ` : ''}

                <!-- Сдвигаем Y-координату с 16 на 10, чтобы текст выровнялся по новому размеру картинки -->
                <g transform="translate(${startX}, ${barHeight + padding + 10})">
                    <text x="0" y="0" class="osx-prompt">~$ ${promptLabel}</text>
                    <text x="0" y="26" class="track" fill="#e6edf3">${safeTrack}</text>
                    <text x="0" y="48" class="artist" fill="${osx_MUTED}">${safeArtist}</text>

                    <g transform="translate(0, 58)" clip-path="url(#osx-wave-clip)">
                        <path class="osx-wave" d="${d}" stroke="${osx_ACCENT}" />
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

function osxNarrowCard(params) {
    const width = parseInt(params.width, 10);
    const padding = 10;
    const barHeight = 22;
    const coverSize = Math.min(72, params.height - barHeight - padding * 2);
    const coverY = barHeight + padding;
    const startX = padding + coverSize + 10;
    const shortHeader = toShortHeader(params.headerText);

    return `
    <svg width="${params.width}" height="${params.height}" viewBox="0 0 ${params.width} ${params.height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
            <clipPath id="osx-narrow-clip">
                <rect width="${params.width}" height="${params.height}" rx="8" />
            </clipPath>
        </defs>
        <style>${getStyles('osx')}</style>
        <g clip-path="url(#osx-narrow-clip)">
            <rect width="${params.width}" height="${params.height}" fill="${osx_BG}" />
            <rect width="${params.width}" height="${barHeight}" fill="#111927" />
            <circle cx="13" cy="${barHeight / 2}" r="3.5" fill="#ff5f56" stroke="#e0443e" stroke-width="0.5" />
            <circle cx="24" cy="${barHeight / 2}" r="3.5" fill="#ffbd2e" stroke="#dea123" stroke-width="0.5" />
            <circle cx="35" cy="${barHeight / 2}" r="3.5" fill="#27c93f" stroke="#1aab29" stroke-width="0.5" />
            <rect width="${params.width}" height="${params.height}" rx="8" fill="none" stroke="${osx_BORDER}" stroke-width="1.5" />
            <a xlink:href="${params.url}" target="_blank">
                ${params.imageBase64 ? `<image x="${padding}" y="${coverY}" width="${coverSize}" height="${coverSize}" xlink:href="${params.imageBase64}" rx="4" />` : ''}
                <g transform="translate(${startX}, ${barHeight + 20})">
                    <text x="0" y="0" class="osx-prompt" style="font-size:12px;">~$ ${shortHeader}</text>
                </g>
            </a>
        </g>
    </svg>`;
}

function osxTinyCard({ width, height, url, imageBase64 }) {
    const numericWidth = parseInt(width, 10);
    const inset = 8;
    const coverSize = Math.max(58, numericWidth - inset * 2);
    const coverX = Math.floor((numericWidth - coverSize) / 2);
    const coverY = Math.floor((height - coverSize) / 2);

    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <rect width="${width}" height="${height}" rx="8" fill="${osx_BG}" />
        <rect width="${width}" height="${height}" rx="8" fill="none" stroke="${osx_BORDER}" stroke-width="1.5" />
        <a xlink:href="${url}" target="_blank">
            ${imageBase64 ? `<image x="${coverX}" y="${coverY}" width="${coverSize}" height="${coverSize}" xlink:href="${imageBase64}" rx="4" />` : ''}
        </a>
    </svg>`;
}

module.exports = {
    render: osxCard,
    renderNarrow: osxNarrowCard,
    renderTiny: osxTinyCard
};
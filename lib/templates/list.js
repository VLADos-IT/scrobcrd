const getStyles = require('../styles/index');
const { escapeXml, truncate, isLightColor } = require('../utils');

const ROW_HEIGHT = 44;
const HEADER_HEIGHT = 34;
const PADDING = 14;
const THUMB_SIZE = 32;

const THEME_PRESETS = {
    osx: {
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
        bg: '#0b0f14',
        border: '#1c2733',
        rowDivider: '#161f2b',
        accent: '#7ee787',
        title: '#e6edf3',
        artist: '#9aa5b1',
        rank: '#4c5a6b',
        fixedBg: true,
        barChrome: true
    },
    xorg: {
        fontFamily: "'DejaVu Sans Mono', 'Liberation Mono', monospace",
        bg: '#282828',
        border: '#504945',
        rowDivider: '#3c3836',
        accent: '#b16286',
        title: '#ebdbb2',
        artist: '#a89984',
        rank: '#928374',
        fixedBg: true
    },
    retro: {
        fontFamily: "'Courier New', Courier, monospace",
        accent: '#d1170e',
        fixedBg: false,
        pixelBevel: true
    },
    compact: {
        fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
        accent: '#ffe4ef',
        title: '#ffffff',
        artist: '#ffe1d2',
        rank: '#ffd0e0',
        rowDivider: 'rgba(255,255,255,0.18)',
        thumbFallback: 'rgba(255,255,255,0.22)',
        gradient: ['#b72874', '#c63055', '#d34824']
    },
    default: {
        fontFamily: "'Segoe UI', Ubuntu, sans-serif",
        accent: '#d1170e',
        fixedBg: false
    }
};

function renderList(params) {
    const { tracks = [], theme, accentColor, profileUrl, listType } = params;
    const numericWidth = parseInt(params.width, 10) || 400;
    const preset = THEME_PRESETS[theme] || THEME_PRESETS.default;
    const activeAccent = accentColor || preset.accent;
    const isRecent = listType === 'recent_list';
    const chromeHeight = preset.barChrome ? 26 : 0;
    const height = chromeHeight + HEADER_HEIGHT + tracks.length * ROW_HEIGHT + PADDING;

    const hasGradient = Array.isArray(preset.gradient) && preset.gradient.length > 0;
    const bgFill = hasGradient ? 'url(#list-gradient-bg)' : (preset.fixedBg ? preset.bg : params.bgFill);
    const isLight = hasGradient ? false : (preset.fixedBg ? false : (params.bgFill === 'none' ? true : isLightColor(params.bg || '')));
    const titleColor = preset.title || (isLight ? '#000000' : '#ffffff');
    const artistColor = preset.artist || (isLight ? '#4a4a4a' : '#b3b3b3');
    const rankColor = preset.rank || (isLight ? '#8a8a8a' : '#6b6b6b');
    const dividerColor = preset.rowDivider || (isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)');

    const thumbFallback = preset.thumbFallback || dividerColor;
    const cornerRadius = preset.pixelBevel ? 0 : (preset.cssVars ? 12 : 10);
    const thumbRadius = preset.pixelBevel ? 0 : 4;
    const imageRenderingStyle = preset.pixelBevel ? ' style="image-rendering: pixelated;"' : '';

    const availableTextWidth = numericWidth - PADDING * 2 - THUMB_SIZE - 75;
    const maxTrackChars = Math.max(6, Math.floor(availableTextWidth / 8.2));
    const maxArtistChars = Math.max(6, Math.floor(availableTextWidth / 8.6));

    const rows = tracks.map((t, i) => {
        const y = chromeHeight + HEADER_HEIGHT + i * ROW_HEIGHT;
        const safeTrack = escapeXml(truncate(t.track || 'Unknown Track', maxTrackChars));
        const safeArtist = escapeXml(truncate(t.artist || 'Unknown Artist', maxArtistChars));
        const safeUrl = (t.url && /^https?:\/\//i.test(t.url)) ? escapeXml(t.url) : '';
        const playcountLabel = t.playcount ? `${Number(t.playcount).toLocaleString('en-US')}▸` : '';

        let rightSide = '';
        if (t.isPlaying) {
            const dotCx = numericWidth - PADDING - 38;
            const dotCy = y + ROW_HEIGHT / 2 - 1;
            rightSide = `
            <circle class="now-ping" cx="${dotCx}" cy="${dotCy}" r="3.5" fill="#27c93f" style="transform-origin: ${dotCx}px ${dotCy}px;" />
            <circle class="now-dot" cx="${dotCx}" cy="${dotCy}" r="3.5" fill="#27c93f" />
            <text x="${numericWidth - PADDING}" y="${y + ROW_HEIGHT / 2 + 4}" text-anchor="end" class="playcount-row" fill="#27c93f">NOW</text>
            `;
        } else if (playcountLabel) {
            rightSide = `<text x="${numericWidth - PADDING}" y="${y + ROW_HEIGHT / 2 + 4}" text-anchor="end" class="playcount-row" fill="${activeAccent}">${playcountLabel}</text>`;
        }

        return `
        <a xlink:href="${safeUrl}" target="_blank">
            <rect x="0" y="${y}" width="${numericWidth}" height="${ROW_HEIGHT}" fill="transparent" />
            <text x="${PADDING}" y="${y + ROW_HEIGHT / 2 + 4}" class="rank" fill="${rankColor}">${t.rank}</text>
            ${t.imageBase64 ? `
            <image x="${PADDING + 22}" y="${y + (ROW_HEIGHT - THUMB_SIZE) / 2}" width="${THUMB_SIZE}" height="${THUMB_SIZE}" xlink:href="${t.imageBase64}" rx="${thumbRadius}"${imageRenderingStyle} />
            ` : `
            <rect x="${PADDING + 22}" y="${y + (ROW_HEIGHT - THUMB_SIZE) / 2}" width="${THUMB_SIZE}" height="${THUMB_SIZE}" rx="${thumbRadius}" fill="${thumbFallback}" />
            `}
            <text x="${PADDING + 22 + THUMB_SIZE + 12}" y="${y + ROW_HEIGHT / 2 - 3}" class="track-row" fill="${titleColor}">${safeTrack}</text>
            <text x="${PADDING + 22 + THUMB_SIZE + 12}" y="${y + ROW_HEIGHT / 2 + 14}" class="artist-row" fill="${artistColor}">${safeArtist}</text>
            ${rightSide}
            ${i < tracks.length - 1 ? `<line x1="${PADDING}" y1="${y + ROW_HEIGHT}" x2="${numericWidth - PADDING}" y2="${y + ROW_HEIGHT}" stroke="${dividerColor}" stroke-width="1" />` : ''}
        </a>`;
    }).join('');

    const chrome = preset.barChrome ? `
        <rect width="${numericWidth}" height="${chromeHeight}" fill="#111927" />
        <circle cx="16" cy="${chromeHeight / 2}" r="4" fill="#ff5f56" />
        <circle cx="30" cy="${chromeHeight / 2}" r="4" fill="#ffbd2e" />
        <circle cx="44" cy="${chromeHeight / 2}" r="4" fill="#27c93f" />
    ` : '';

    const headerLabel = preset.barChrome
        ? (isRecent ? '~$ recent-tracks' : '~$ top-tracks')
        : (isRecent ? 'RECENT TRACKS' : 'TOP TRACKS');
    const headerY = chromeHeight + 20;

    const pixelDefs = preset.pixelBevel ? `
        <rect id="pixel-tl" x="0" y="0" width="${numericWidth}" height="2" fill="#ffffff" opacity="0.6"/>
        <rect id="pixel-lt" x="0" y="0" width="2" height="${height}" fill="#ffffff" opacity="0.6"/>
        <rect id="pixel-br" x="0" y="${height - 2}" width="${numericWidth}" height="2" fill="#000000" opacity="0.6"/>
        <rect id="pixel-rb" x="${numericWidth - 2}" y="0" width="2" height="${height}" fill="#000000" opacity="0.6"/>
    ` : '';

    const pixelOverlay = preset.pixelBevel ? `
        <rect x="0" y="0" width="${numericWidth}" height="2" fill="#ffffff" />
        <rect x="0" y="2" width="${numericWidth}" height="1" fill="#dfdfdf" />
        24    <rect x="0" y="0" width="2" height="${height}" fill="#ffffff" />
        <rect x="2" y="0" width="1" height="${height}" fill="#dfdfdf" />
        <rect x="0" y="${height - 2}" width="${numericWidth}" height="2" fill="#404040" />
        <rect x="0" y="${height - 1}" width="${numericWidth}" height="1" fill="#000000" />
        <rect x="${numericWidth - 2}" y="0" width="2" height="${height}" fill="#404040" />
        <rect x="${numericWidth - 1}" y="0" width="1" height="${height}" fill="#000000" />
    ` : '';

    const outerBorder = preset.pixelBevel ? '' : `<rect width="${numericWidth}" height="${height}" rx="${cornerRadius}" fill="none" stroke="${preset.border || dividerColor}" stroke-width="1.5" pointer-events="none" />`;

    const gradientDefs = hasGradient ? `
        <linearGradient id="list-gradient-bg" x1="0" y1="0" x2="${numericWidth}" y2="${height}" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="${preset.gradient[0]}" />
            <stop offset="60%" stop-color="${preset.gradient[1]}" />
            <stop offset="100%" stop-color="${preset.gradient[2]}" />
        </linearGradient>
    ` : '';

    return `
    <svg width="${numericWidth}" height="${height}" viewBox="0 0 ${numericWidth} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
            <clipPath id="list-card-clip">
                <rect width="${numericWidth}" height="${height}" rx="${cornerRadius}" />
            </clipPath>
            ${pixelDefs}
            ${gradientDefs}
        </defs>
        <style>
            .rank { font: 700 12px ${preset.fontFamily}; }
            .track-row { font: 600 13px ${preset.fontFamily}; }
            .artist-row { font: 400 12px ${preset.fontFamily}; }
            .playcount-row { font: 600 11px ${preset.fontFamily}; }
            .list-header { font: 700 11px ${preset.fontFamily}; letter-spacing: 1.5px; text-transform: uppercase; }
            .now-dot { animation: nowDotPulse 1.8s ease-in-out infinite; }
            .now-ping { animation: nowPingPulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            @keyframes nowDotPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.45; }
            }
            @keyframes nowPingPulse {
                0% { opacity: 0.55; transform: scale(1); }
                100% { opacity: 0; transform: scale(2.6); }
            }
        </style>
        <g clip-path="url(#list-card-clip)">
            <a xlink:href="${profileUrl}" target="_blank">
                <rect width="${numericWidth}" height="${height}" fill="${bgFill}" />
                ${pixelOverlay}
                ${chrome}
                <text x="${PADDING}" y="${headerY}" class="list-header" fill="${activeAccent}">${headerLabel}</text>
            </a>
            ${rows}
            ${outerBorder}
        </g>
    </svg>`;
}

module.exports = { renderList };

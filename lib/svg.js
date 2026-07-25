const { escapeXml, isLightColor, truncate } = require('./utils');
const cardDispatcher = require('./templates/card');
const { renderList } = require('./templates/list');

/**
 * SVG Generator
 * @author VLADos-IT <https://github.com/VLADos-IT>
 */

/**
 * Generates the SVG card.
 * @param {object} data - Track data
 * @param {object} options - Display options
 * @returns {string} SVG string
 */
function generateSvg(data, options) {
	const { track, artist, imageBase64, url, type } = data;
	const { width, bg, theme } = options;
	const numericWidth = parseInt(width, 10) || 400;

	const height = 120;
	const padding = 15;
	const imageSize = 90;
	const borderRadius = 12;

	// Determine Header Text and Color
	const isObsession = type === 'obsession';
	const isRecent = type === 'recent_track';
	const isNowPlaying = type === 'nowplaying';
	let headerText = 'LAST.FM TOP TRACK';

	if (isObsession) {
		headerText = 'LAST.FM OBSESSION';
	} else if (isNowPlaying) {
		headerText = numericWidth < 205 ? 'NOW' : 'NOW PLAYING';
	} else if (isRecent) {
		headerText = 'LAST.FM RECENT TRACK';
	}
	
	const headerColor = '#d1170e';

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

	// Handle background transparency and text contrast
	const bgFill = bg === 'transparent' ? 'none' : `#${escapeXml(bg)}`;
	// Default to dark text for transparent background
	const isLight = bg === 'transparent' ? true : isLightColor(bg);

	const textColor = isLight ? '#000000' : '#ffffff';
	const artistColor = isLight ? '#4a4a4a' : '#b3b3b3';

	// Calculate available width for text
	const gap = 15;
	const startX = padding + imageSize + gap;
	const availableWidth = numericWidth - startX - padding;

	// Estimate max chars
	const maxTrackChars = Math.max(4, Math.floor(availableWidth / 9.5));
	const maxArtistChars = Math.max(4, Math.floor(availableWidth / 8.5));

	const safeUrl = (url && /^https?:\/\//i.test(url)) ? escapeXml(url) : '';

	const cardParams = {
		width,
		height,
		bgFill,
		borderRadius,
		padding,
		imageSize,
		url: safeUrl,
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
	};

	return cardDispatcher(cardParams);
}

/**
 * Generates the top-N tracks list card.
 * @param {object} data
 * @param {object} options
 * @returns {string}
 */
function generateListSvg(data, options) {
	const { width, bg, theme } = options;
	const bgFill = bg === 'transparent' ? 'none' : `#${escapeXml(bg)}`;

	return renderList({
		tracks: data.tracks,
		width,
		bg,
		bgFill,
		theme
	});
}

module.exports = { generateSvg, generateListSvg };

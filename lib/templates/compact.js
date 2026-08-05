const getStyles = require('../styles/index');
const { escapeXml, truncate } = require('../utils');

function compactCard({ width, height, borderRadius, padding, url, profileUrl, imageBase64, rawTrack, rawArtist, safeTrack, safeArtist, headerText, bgFill, textColor, artistColor, headerColor }) {
	const cardWidth = parseInt(width, 10);
	const sidePad = cardWidth < 180 ? 9 : padding;
	const coverSize = Math.max(40, Math.min(62, Math.floor(cardWidth * 0.45)));
	const coverX = sidePad;
	const coverY = 10;
	const markX = cardWidth - sidePad;
	const lineWidth = Math.max(70, cardWidth - (sidePad * 2));
	const maxTrackChars = Math.max(9, Math.floor(lineWidth / 7.4));
	const maxArtistChars = Math.max(10, Math.floor(lineWidth / 8.2));
	const trackFontSize = cardWidth < 150 ? 13 : 15;
	const artistFontSize = cardWidth < 150 ? 11 : 13;
	const showHeader = true;

	const displayTrack = escapeXml(truncate(rawTrack || '', maxTrackChars)) || safeTrack;
	const displayArtist = escapeXml(truncate(rawArtist || '', maxArtistChars)) || safeArtist;
	const trackY = Math.min(92, coverY + coverSize + 18);
	const artistY = Math.min(110, trackY + 17);
	const compactHeader = (() => {
		if (!headerText) return 'LAST.FM';
		if (headerText.includes('OBSESSION')) return 'OBS';
		if (headerText.includes('NOW')) return 'NOW';
		if (headerText.includes('RECENT')) return 'REC';
		if (headerText.includes('TOP')) return 'TOP';
		return 'LAST.FM';
	})();
	const useGradient = !bgFill || bgFill === 'none' || (typeof bgFill === 'string' && bgFill.toLowerCase() === '#181818');
	const background = useGradient ? 'url(#showcase-bg)' : bgFill;
	const titleFill = useGradient ? '#ffffff' : textColor;
	const artistFill = useGradient ? '#ffe1d2' : artistColor;
	const headerFill = useGradient ? '#ffe4ef' : headerColor;

	return `
	<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
		<defs>
			<linearGradient id="showcase-bg" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">
				<stop offset="0%" stop-color="#b72874"/>
				<stop offset="60%" stop-color="#c63055"/>
				<stop offset="100%" stop-color="#d34824"/>
			</linearGradient>
			<clipPath id="showcase-cover-clip">
				<rect x="${coverX}" y="${coverY}" width="${coverSize}" height="${coverSize}" rx="12" />
			</clipPath>
		</defs>
		<style>
			${getStyles('compact')}
		</style>
		<a xlink:href="${profileUrl}" target="_blank"><rect width="${width}" height="${height}" rx="${borderRadius}" fill="${background}" /></a>

		<a xlink:href="${url}" target="_blank">
			${imageBase64 ? `
			<g clip-path="url(#showcase-cover-clip)">
				<image x="${coverX}" y="${coverY}" width="${coverSize}" height="${coverSize}" xlink:href="${imageBase64}" />
			</g>
			` : `
			<rect x="${coverX}" y="${coverY}" width="${coverSize}" height="${coverSize}" rx="12" fill="#000000" fill-opacity="0.2" />
			`}

			${showHeader ? `<text x="${markX}" y="30" class="header" style="text-anchor:end;" fill="${headerFill}">${compactHeader}</text>` : ''}
			<text x="${sidePad}" y="${trackY}" class="track" style="font-size:${trackFontSize}px;" fill="${titleFill}">${displayTrack}</text>
			<text x="${sidePad}" y="${artistY}" class="artist" style="font-size:${artistFontSize}px;" fill="${artistFill}">${displayArtist}</text>
		</a>
	</svg>`;
}

module.exports = compactCard;

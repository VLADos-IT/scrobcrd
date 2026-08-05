const getStyles = require('../styles/index');

function defaultCard({ width, height, bgFill, borderRadius, padding, imageSize, url, profileUrl, imageBase64, headerText, headerColor, textColor, artistColor, safeTrack, safeArtist }) {
	const gap = 15;
	const startX = padding + imageSize + gap;
	const availableWidth = width - startX - padding;
	const waveWidth = availableWidth + 20; // Buffer

	let d = 'M -20 5';
	for (let i = -20; i < waveWidth; i += 20) {
		d += ' q 5 -6 10 0 t 10 0';
	}

	return `
	<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
		<defs>
			<clipPath id="wave-clip">
				<rect x="${-gap}" y="-10" width="${availableWidth + gap}" height="30" />
			</clipPath>
		</defs>
		<style>
			${getStyles('default')}
			.bg { fill: ${bgFill}; }
			.header { fill: ${headerColor}; }
			.track { fill: ${textColor}; }
			.artist { fill: ${artistColor}; }
			.wave { stroke: ${headerColor}; }
		</style>
		<a xlink:href="${profileUrl}" target="_blank"><rect width="${width}" height="${height}" rx="${borderRadius}" class="bg" /></a>
		
		<a xlink:href="${url}" target="_blank">
			${imageBase64 ? `<image x="${padding}" y="${padding}" width="${imageSize}" height="${imageSize}" xlink:href="${imageBase64}" rx="4" />` : ''}
			
			<g transform="translate(${startX}, ${padding + 15})">
				<text x="0" y="0" class="header">${headerText}</text>
				<text x="0" y="25" class="track">${safeTrack}</text>
				<text x="0" y="48" class="artist">${safeArtist}</text>
				
				<g transform="translate(0, 60)" clip-path="url(#wave-clip)">
					<path class="wave" d="${d}" />
				</g>
			</g>
		</a>
	</svg>`;
}

function toShortHeader(headerText) {
	if (headerText.includes('OBSESSION')) return 'OBS';
	if (headerText.includes('NOW')) return 'NOW';
	if (headerText.includes('RECENT')) return 'REC';
	return 'TOP';
}

function renderNarrow(params) {
	const width = parseInt(params.width, 10);
	const padding = 8;
	const coverSize = 76;
	const coverY = Math.floor((params.height - coverSize) / 2);
	const startX = padding + coverSize + 8;
	const textWidth = Math.max(18, width - startX - padding);
	const shortHeader = toShortHeader(params.headerText || '');
	let d = 'M -20 5';

	for (let i = -20; i < textWidth + 24; i += 20) {
		d += ' q 5 -6 10 0 t 10 0';
	}

	return `
	<svg width="${params.width}" height="${params.height}" viewBox="0 0 ${params.width} ${params.height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
		<defs>
			<clipPath id="narrow-card-clip">
				<rect width="${params.width}" height="${params.height}" rx="${params.borderRadius}" />
			</clipPath>
			<clipPath id="narrow-wave-clip">
				<rect x="-6" y="-10" width="${textWidth + 12}" height="24" />
			</clipPath>
		</defs>
		<style>
			${getStyles('default')}
			.bg { fill: ${params.bgFill}; }
			.header { fill: ${params.headerColor}; }
			.wave { stroke: ${params.headerColor}; }
		</style>
		<g clip-path="url(#narrow-card-clip)">
			<a xlink:href="${params.profileUrl}" target="_blank"><rect width="${params.width}" height="${params.height}" rx="${params.borderRadius}" class="bg" /></a>
			<a xlink:href="${params.url}" target="_blank">
				${params.imageBase64 ? `<image x="${padding}" y="${coverY}" width="${coverSize}" height="${coverSize}" xlink:href="${params.imageBase64}" rx="4" />` : ''}
				<g transform="translate(${startX}, 42)">
					<text x="0" y="0" class="header" style="font-size:14px; letter-spacing:0;">${shortHeader}</text>
					<g transform="translate(0, 44)" clip-path="url(#narrow-wave-clip)">
						<path d="${d}" class="wave" />
					</g>
				</g>
			</a>
		</g>
	</svg>`;
}

function renderTiny({ width, height, bgFill, borderRadius, url, profileUrl, imageBase64 }) {
	const numericWidth = parseInt(width, 10);
	const inset = 10;
	const coverSize = Math.max(58, numericWidth - (inset * 2));
	const coverX = Math.floor((numericWidth - coverSize) / 2);
	const coverY = Math.floor((height - coverSize) / 2);

	return `
	<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
		<a xlink:href="${profileUrl}" target="_blank"><rect width="${width}" height="${height}" rx="${borderRadius}" fill="${bgFill}" /></a>
		<a xlink:href="${url}" target="_blank">
			${imageBase64 ? `<image x="${coverX}" y="${coverY}" width="${coverSize}" height="${coverSize}" xlink:href="${imageBase64}" rx="10" />` : ''}
		</a>
	</svg>`;
}

module.exports = {
	render: defaultCard,
	renderNarrow,
	renderTiny
};

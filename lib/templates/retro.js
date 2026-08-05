const getStyles = require('../styles/index');

function retroCard({ width, height, bgFill, imageSize, url, profileUrl, imageBase64, headerText, headerColor, textColor, artistColor, safeTrack, safeArtist }) {
	const padding = 10;
	const gap = 10;
	const startX = padding + imageSize + gap;

	const availableWidth = width - startX - padding;
	const waveWidth = availableWidth + 20;

	let d = 'M -20 0';
	for (let i = -20; i < waveWidth; i += 20) {
		d += ' h 10 v -4 h 10 v 4';
	}

	return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
            <clipPath id="retro-clip">
                <rect x="0" y="-10" width="${availableWidth}" height="20" />
            </clipPath>
            <pattern id="pixel-pattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="2" height="2" fill="#000000" fill-opacity="0.05"/>
                <rect x="2" y="2" width="2" height="2" fill="#000000" fill-opacity="0.05"/>
            </pattern>
        </defs>
        <style>
            ${getStyles('retro')}
            .bg { fill: ${bgFill}; }
            .header { fill: ${headerColor}; }
            .track { fill: ${textColor}; }
            .artist { fill: ${artistColor}; }
        </style>

        <a xlink:href="${profileUrl}" target="_blank"><rect width="${width}" height="${height}" class="bg" /></a>
        <rect width="${width}" height="${height}" fill="url(#pixel-pattern)" pointer-events="none" />

        <rect x="0" y="0" width="${width}" height="2" fill="#ffffff" pointer-events="none" />
        <rect x="0" y="0" width="2" height="${height}" fill="#ffffff" pointer-events="none" />
        <rect x="0" y="${height - 2}" width="${width}" height="2" fill="#808080" pointer-events="none" />
        <rect x="${width - 2}" y="0" width="2" height="${height}" fill="#808080" pointer-events="none" />
        
        <rect x="2" y="2" width="${width - 4}" height="${height - 4}" fill="none" stroke="#dfdfdf" stroke-width="0" />

        <a xlink:href="${url}" target="_blank">
            ${imageBase64 ? `
            <g transform="translate(${padding}, ${padding})">
                <rect x="-2" y="-2" width="${imageSize + 4}" height="${imageSize + 4}" fill="none" stroke="#808080" stroke-width="2" />
                <image width="${imageSize}" height="${imageSize}" xlink:href="${imageBase64}" style="image-rendering: pixelated;" />
            </g>` : ''}
            
            <g transform="translate(${startX}, ${padding + 15})">
                <text x="0" y="0" class="header">${headerText}</text>
                <text x="0" y="25" class="track">${safeTrack}</text>
                <text x="0" y="48" class="artist">${safeArtist}</text>
                
                <g transform="translate(0, 65)" clip-path="url(#retro-clip)">
                    <path d="${d}" stroke="${headerColor}" stroke-width="2" class="retro-wave" />
                </g>
            </g>
        </a>
    </svg>`;
}

function retroNarrowCard(params) {
	const width = parseInt(params.width, 10);
	const padding = 8;
	const coverSize = 76;
	const coverY = Math.floor((params.height - coverSize) / 2);
	const startX = padding + coverSize + 8;
	const textWidth = Math.max(18, width - startX - padding);
	const shortHeader = (() => {
		const headerText = params.headerText || '';
		if (headerText.includes('OBSESSION')) return 'OBS';
		if (headerText.includes('NOW')) return 'NOW';
		if (headerText.includes('RECENT')) return 'REC';
		return 'TOP';
	})();

	let d = 'M -20 5';
	for (let i = -20; i < textWidth + 24; i += 20) {
		d += ' h 10 v -4 h 10 v 4';
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
			<pattern id="narrow-pixel-pattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
				<rect x="0" y="0" width="2" height="2" fill="#000000" fill-opacity="0.05"/>
				<rect x="2" y="2" width="2" height="2" fill="#000000" fill-opacity="0.05"/>
			</pattern>
		</defs>
		<style>
			${getStyles('retro')}
			.bg { fill: ${params.bgFill}; }
			.header { fill: ${params.headerColor}; }
			.retro-wave { stroke: ${params.headerColor}; }
		</style>
		<g clip-path="url(#narrow-card-clip)">
			<a xlink:href="${params.profileUrl}" target="_blank"><rect width="${params.width}" height="${params.height}" rx="${params.borderRadius}" class="bg" /></a>
			<rect width="${params.width}" height="${params.height}" fill="url(#narrow-pixel-pattern)" pointer-events="none" />
			<rect x="0" y="0" width="${params.width}" height="2" fill="#ffffff" pointer-events="none" />
			<rect x="0" y="0" width="2" height="${params.height}" fill="#ffffff" pointer-events="none" />
			<rect x="0" y="${params.height - 2}" width="${params.width}" height="2" fill="#808080" pointer-events="none" />
			<rect x="${params.width - 2}" y="0" width="2" height="${params.height}" fill="#808080" pointer-events="none" />
			<a xlink:href="${params.url}" target="_blank">
				${params.imageBase64 ? `<rect x="${padding - 2}" y="${coverY - 2}" width="${coverSize + 4}" height="${coverSize + 4}" fill="none" stroke="#808080" stroke-width="2" />` : ''}
				${params.imageBase64 ? `<image x="${padding}" y="${coverY}" width="${coverSize}" height="${coverSize}" xlink:href="${params.imageBase64}" style="image-rendering: pixelated;" />` : ''}
				<g transform="translate(${startX}, 42)">
					<text x="0" y="0" class="header" style="font-size:14px; letter-spacing:0;">${shortHeader}</text>
					<g transform="translate(0, 44)" clip-path="url(#narrow-wave-clip)">
						<path d="${d}" class="retro-wave" stroke-width="2" />
					</g>
				</g>
			</a>
		</g>
	</svg>`;
}

function retroTinyCard({ width, height, bgFill, borderRadius, url, profileUrl, imageBase64 }) {
	const numericWidth = parseInt(width, 10);
	const inset = 10;
	const coverSize = Math.max(58, numericWidth - (inset * 2));
	const coverX = Math.floor((numericWidth - coverSize) / 2);
	const coverY = Math.floor((height - coverSize) / 2);

	return `
	<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
		<defs>
			<pattern id="tiny-pixel-pattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
				<rect x="0" y="0" width="2" height="2" fill="#000000" fill-opacity="0.05"/>
				<rect x="2" y="2" width="2" height="2" fill="#000000" fill-opacity="0.05"/>
			</pattern>
		</defs>
		<a xlink:href="${profileUrl}" target="_blank"><rect width="${width}" height="${height}" rx="${borderRadius}" fill="${bgFill}" /></a>
		<rect width="${width}" height="${height}" fill="url(#tiny-pixel-pattern)" pointer-events="none" />
		<rect x="0" y="0" width="${width}" height="2" fill="#ffffff" pointer-events="none" />
		<rect x="0" y="0" width="2" height="${height}" fill="#ffffff" pointer-events="none" />
		<rect x="0" y="${height - 2}" width="${width}" height="2" fill="#808080" pointer-events="none" />
		<rect x="${width - 2}" y="0" width="2" height="${height}" fill="#808080" pointer-events="none" />
		<a xlink:href="${url}" target="_blank">
			${imageBase64 ? `
			<g transform="translate(${coverX}, ${coverY})">
				<rect x="-2" y="-2" width="${coverSize + 4}" height="${coverSize + 4}" fill="none" stroke="#808080" stroke-width="2" />
				<image width="${coverSize}" height="${coverSize}" xlink:href="${imageBase64}" style="image-rendering: pixelated;" />
			</g>` : ''}
		</a>
	</svg>`;
}

module.exports = {
	render: retroCard,
	renderNarrow: retroNarrowCard,
	renderTiny: retroTinyCard
};

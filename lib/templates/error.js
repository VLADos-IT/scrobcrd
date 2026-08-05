const getStyles = require('../styles/index');
const { escapeXml } = require('../utils');

const DEFAULT_BG_FILL = '#181818';

function sanitizeFill(bgFill) {
	if (!bgFill) {
		return DEFAULT_BG_FILL;
	}

	const value = String(bgFill).trim().toLowerCase();

	if (value === 'none' || value === 'transparent') {
		return value;
	}

    if (/^[0-9a-f]{3,4}$|^[0-9a-f]{6}$|^[0-9a-f]{8}$/.test(value)) {
		return `#${value}`;
	}

	return DEFAULT_BG_FILL;
}

function errorCard({ width, height, bgFill, message }) {
	const safeBgFill = sanitizeFill(bgFill);
	return `
	<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
		<style>
			${getStyles('default')}
			.bg { fill: ${safeBgFill}; }
		</style>
		<rect width="100%" height="100%" class="bg" rx="12" />
		<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" class="error-text">
			${escapeXml(message)}
		</text>
	</svg>`;
}

module.exports = errorCard;

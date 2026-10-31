function hexToRgb(hex) {
	let h = String(hex || '').replace('#', '');
	if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split('').map((c) => c + c).join('');
	else if (h.length === 8) h = h.slice(0, 6);
	if (!/^[0-9a-f]{6}$/i.test(h)) return null;
	const num = parseInt(h, 16);
	return { r: (num >> 16) & 0xff, g: (num >> 8) & 0xff, b: num & 0xff };
}

function isLight(hex, threshold = 150) {
	const rgb = hexToRgb(hex);
	if (!rgb) return false;
	return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 > threshold;
}

function shade(hex, amount) {
	const rgb = hexToRgb(hex) || { r: 24, g: 24, b: 24 };
	const clamp = (v) => Math.min(255, Math.max(0, v));
	const value = (clamp(rgb.r + amount) << 16) | (clamp(rgb.g + amount) << 8) | clamp(rgb.b + amount);
	return `#${value.toString(16).padStart(6, '0')}`;
}

function adaptAccent(accentHex, bgIsLight, fallback) {
	const base = (accentHex && accentHex.startsWith('#')) ? accentHex : fallback;
	return shade(base, bgIsLight ? -50 : 10);
}

module.exports = { hexToRgb, isLight, shade, adaptAccent };

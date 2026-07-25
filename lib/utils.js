const axios = require('axios');
const { LRUCache } = require('lru-cache');

const USER_AGENT = 'Mozilla/5.0 (compatible; LastFmObsession/1.0; +https://github.com/VLADos-IT/lastfm-github-profile)';

const client = axios.create({
	timeout: 10000,
	headers: {
		'User-Agent': USER_AGENT,
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
		'Accept-Language': 'en-US,en;q=0.9'
	}
});

const RETRYABLE_STATUSES = new Set([403, 406, 408, 429, 500, 502, 503, 504]);

async function requestWithRetry(requestFn, opts = {}) {
	const retries = opts.retries ?? 2;
	const baseDelayMs = opts.baseDelayMs ?? 350;
	let lastError;

	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			return await requestFn();
		} catch (error) {
			lastError = error;
			const status = error?.response?.status;
			const isRetryable = !status || RETRYABLE_STATUSES.has(status);
			const isLastAttempt = attempt === retries;
			if (!isRetryable || isLastAttempt) throw error;

			const delay = baseDelayMs * Math.pow(2, attempt) + Math.floor(Math.random() * 150);
			console.warn(`Retrying request after status ${status || error.code} (attempt ${attempt + 1}/${retries}), waiting ${delay}ms`);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}

	throw lastError;
}

const imageCache = new LRUCache({ max: 200, ttl: 1000 * 60 * 30 });
const dataCache = new LRUCache({ max: 300, ttl: 1000 * 60 * 3 });

function escapeXml(unsafe) {
	if (!unsafe) return '';
	return unsafe.replace(/[<>&'"]/g, (c) => {
		switch (c) {
			case '<': return '&lt;';
			case '>': return '&gt;';
			case '&': return '&amp;';
			case '\'': return '&apos;';
			case '"': return '&quot;';
		}
	});
}

function truncate(text, maxLength) {
	if (!text) return '';
	if (!Number.isFinite(maxLength) || maxLength < 2) return '…';
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength - 1) + '…';
}

async function fetchImageAsBase64(url) {
	if (!url) return '';
	const cached = imageCache.get(url);
	if (cached) return cached;

	try {
		const response = await requestWithRetry(() => client.get(url, { responseType: 'arraybuffer' }), { retries: 1 });
		const buffer = Buffer.from(response.data, 'binary');
		const contentType = response.headers['content-type'];
		const result = `data:${contentType};base64,${buffer.toString('base64')}`;
		imageCache.set(url, result);
		return result;
	} catch (e) {
		console.error('Failed to fetch image:', url, e.message);
		return '';
	}
}

function findImageBeforeIndex(html, endIndex) {
	if (endIndex === -1) return '';
	const searchWindow = html.substring(Math.max(0, endIndex - 1500), endIndex);

	const imgMatches = [...searchWindow.matchAll(/<img[^>]+src="([^"]+)"/g)];
	if (imgMatches.length > 0) return imgMatches[imgMatches.length - 1][1];

	const dataSrcMatches = [...searchWindow.matchAll(/<img[^>]+data-src="([^"]+)"/g)];
	if (dataSrcMatches.length > 0) return dataSrcMatches[dataSrcMatches.length - 1][1];

	return '';
}

function upgradeImage(url) {
	if (!url) return '';
	if (url.includes('/u/')) {
		return url.replace(/\/u\/[a-zA-Z0-9]+\//, '/u/300x300/');
	}
	return url.replace('/64s/', '/300s/');
}

function isLightColor(hex) {
	if (!hex || hex === 'transparent') return false;
	hex = hex.replace('#', '');
	if (hex.length === 3 || hex.length === 4) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	} else if (hex.length === 8) {
		hex = hex.substring(0, 6);
	}
	if (hex.length !== 6) return false;

	const r = parseInt(hex.substr(0, 2), 16);
	const g = parseInt(hex.substr(2, 2), 16);
	const b = parseInt(hex.substr(4, 2), 16);

	const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
	return brightness > 128;
}

function isValidUsername(user) {
	return /^[a-zA-Z0-9_-]+$/.test(user);
}

module.exports = {
	client,
	requestWithRetry,
	escapeXml,
	fetchImageAsBase64,
	findImageBeforeIndex,
	upgradeImage,
	isLightColor,
	truncate,
	isValidUsername,
	dataCache,
	imageCache
};
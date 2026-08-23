const axios = require('axios');
const { LRUCache } = require('lru-cache');

const USER_AGENT = 'Mozilla/5.0 (compatible; scrobcrd/1.0; +https://github.com/VLADos-IT/lastfm-github-profile)';

const client = axios.create({
	timeout: 6000,
	headers: {
		'User-Agent': USER_AGENT,
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
		'Accept-Language': 'en-US,en;q=0.9'
	}
});

const RETRYABLE_STATUSES = new Set([403, 406, 408, 429, 500, 502, 503, 504]);

async function requestWithRetry(requestFn, opts = {}) {
	const retries = opts.retries ?? 1;
	const baseDelayMs = opts.baseDelayMs ?? 300;
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

function withDeadline(promise, ms, timeoutMessage = 'DEADLINE_EXCEEDED') {
	let timer;
	const timeout = new Promise((_, reject) => {
		timer = setTimeout(() => reject(new Error(timeoutMessage)), ms);
	});
	return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
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

async function fetchImageAsBase64(urls) {
	const candidates = Array.isArray(urls) ? urls.filter(Boolean) : urls ? [urls] : [];
	if (candidates.length === 0) return '';

	for (const url of candidates) {
		const cached = imageCache.get(url);
		if (cached) return cached;
	}

	const fetchOne = async (url) => {
		const response = await requestWithRetry(
			() => client.get(url, { responseType: 'arraybuffer', timeout: 3500 }),
			{ retries: 1, baseDelayMs: 150 }
		);
		const buffer = Buffer.from(response.data, 'binary');
		const contentType = response.headers['content-type'];
		const result = `data:${contentType};base64,${buffer.toString('base64')}`;
		imageCache.set(url, result);
		return result;
	};

	try {
		return await Promise.any(candidates.map(fetchOne));
	} catch (aggregateError) {
		const reasons = (aggregateError.errors || [aggregateError]).map((e) => e.message).join('; ');
		console.error('Failed to fetch image, all candidates failed:', candidates, reasons);
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
	return /^[\w.-]{1,64}$/.test(user);
}

function toAbsolute(href) {
    if (!href || typeof href !== 'string') return 'https://www.last.fm';
    const cleanedHref = href.trim();
    if (!cleanedHref) return 'https://www.last.fm';

    try {
        return new URL(cleanedHref, 'https://www.last.fm').href;
    } catch {
        return 'https://www.last.fm';
    }
}

module.exports = {
	client,
	requestWithRetry,
	withDeadline,
	escapeXml,
	fetchImageAsBase64,
	findImageBeforeIndex,
	upgradeImage,
	isLightColor,
	truncate,
	isValidUsername,
	toAbsolute,
	dataCache,
	imageCache
};

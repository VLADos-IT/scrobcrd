const express = require('express');
const rateLimit = require('express-rate-limit');
const handler = require('./api/index');
const errorCard = require('./lib/templates/error');
const app = express();
const port = process.env.PORT || 3000;

// Behind a reverse proxy every visitor shares the proxy's IP unless this is set
// (e.g. TRUST_PROXY=1), which makes the rate limit hit everyone at once.
if (process.env.TRUST_PROXY) {
	const trust = Number(process.env.TRUST_PROXY);
	app.set('trust proxy', Number.isNaN(trust) ? process.env.TRUST_PROXY : trust);
}

const limiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 60,
	standardHeaders: true,
	legacyHeaders: false,
	// An <img> can't render a plain-text 429, so answer with an SVG card.
	handler: (req, res) => {
		res.status(429)
			.type('image/svg+xml')
			.set('Cache-Control', 'no-store')
			.send(errorCard({ width: 400, height: 120, bgFill: '181818', message: 'Too many requests' }));
	},
});
app.use('/api', limiter);

app.get('/api', handler);

app.get('/', (req, res) => {
	res.send('scrobcrd is running. Use /api?user=YOUR_USERNAME to get an SVG card.');
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});

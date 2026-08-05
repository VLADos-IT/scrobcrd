const express = require('express');
const rateLimit = require('express-rate-limit');
const handler = require('./api/index');
const app = express();
const port = process.env.PORT || 3000;

const limiter = rateLimit({
	windowMs: 60 * 1000,
	max: 60,
	standardHeaders: true,
	legacyHeaders: false,
});
app.use('/api', limiter);

app.get('/api', handler);

app.get('/', (req, res) => {
	res.send('scrobcrd is running. Use /api?user=YOUR_USERNAME to get an SVG card.');
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});

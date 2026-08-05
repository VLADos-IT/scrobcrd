const { client, isValidUsername, requestWithRetry } = require('../../../utils');
const { parseObsessionPage } = require('../parsers/index');

async function fetchObsessionOnly(user) {
	if (!isValidUsername(user)) {
		console.error('Invalid username:', user);
		return null;
	}
	const url = `https://www.last.fm/user/${encodeURIComponent(user)}/obsessions`;
	try {
		const { data: html } = await requestWithRetry(() => client.get(url));
		return parseObsessionPage(html, url);
	} catch (e) {
		console.error('Error fetching obsession page:', e.message);
		return null;
	}
}

module.exports = { fetchObsessionOnly };

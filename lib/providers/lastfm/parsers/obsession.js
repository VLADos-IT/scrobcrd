const { findImageBeforeIndex, upgradeImage } = require('../../../utils');

function parseObsession(html, defaultUrl) {
	const obsessionIndex = html.indexOf('data-analytics-action="ObsessionTrackName"');
	if (obsessionIndex === -1) return null;

	const trackNameMatch = html.match(/data-analytics-action="ObsessionTrackName"[^>]*>([\s\S]*?)<\/a>/);
	const trackName = trackNameMatch ? trackNameMatch[1].trim() : 'Unknown Track';

	const artistNameMatch = html.match(/data-analytics-action="ObsessionArtistName"[^>]*>([\s\S]*?)<\/a>/);
	const artistName = artistNameMatch ? artistNameMatch[1].trim() : 'Unknown Artist';

	const urlMatch = html.match(/href="([^"]*)"[^>]*data-analytics-action="ObsessionTrackName"/);
	const trackUrl = urlMatch ? `https://www.last.fm${urlMatch[1]}` : defaultUrl;

	let imageUrl = findImageBeforeIndex(html, obsessionIndex);

	if (!imageUrl) {
		const containerMatch = html.match(/class="header-new-content-image"[\s\S]*?<\/div>/);
		if (containerMatch) {
			const containerHtml = containerMatch[0];
			const imgMatch = containerHtml.match(/<img[^>]*src="([^"]*)"/);
			const dataSrcMatch = containerHtml.match(/<img[^>]*data-src="([^"]*)"/);

			if (imgMatch) imageUrl = imgMatch[1];
			else if (dataSrcMatch) imageUrl = dataSrcMatch[1];
		}
	}

	return {
		track: trackName,
		artist: artistName,
		image: upgradeImage(imageUrl),
		url: trackUrl,
		type: 'obsession'
	};
}

function parseObsessionPage(html, defaultUrl) {
	const trackNameMatch = html.match(/class="featured-item-name"[^>]*>([\s\S]*?)<\/a>/);
	if (!trackNameMatch) return null;

	const trackName = trackNameMatch[1].trim();
	const artistNameMatch = html.match(/class="featured-item-artist"[^>]*>([\s\S]*?)<\/a>/);
	const artistName = artistNameMatch ? artistNameMatch[1].trim() : 'Unknown Artist';

	const trackUrlMatch = html.match(/href="([^"]*)"[^>]*class="featured-item-name"/);
	const trackUrl = trackUrlMatch ? `https://www.last.fm${trackUrlMatch[1]}` : defaultUrl;

	const imageMatch = html.match(/class="cover-art"[\s\S]*?<img[^>]*src="([^"]*)"/);
	const imageUrl = imageMatch ? upgradeImage(imageMatch[1]) : '';

	return {
		track: trackName,
		artist: artistName,
		image: imageUrl,
		url: trackUrl,
		type: 'obsession'
	};
}

module.exports = {
	parseObsession,
	parseObsessionPage
};

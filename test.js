const assert = require('node:assert/strict');
const { validateParams } = require('./lib/validation');
const { getProvider } = require('./lib/providers');
const { generateSvg, generateListSvg } = require('./lib/svg');

const params = validateParams({ bg: 'none', width: '50', source: 'LISTENBRAINZ', limit: '20' });
assert.equal(params.safeBg, 'transparent');
assert.equal(params.safeWidth, 120);
assert.equal(params.safeSource, 'listenbrainz');
assert.equal(params.safeLimit, 10);
assert.equal(getProvider('listenbrainz').brand, 'LISTENBRAINZ');

const options = {
    width: 400,
    bg: '181818',
    brand: 'TEST',
    accentColor: '#000000',
    profileUrl: 'https://example.com/profile'
};
const track = { track: 'Track', artist: 'Artist', type: 'top_track', url: 'https://example.com/track' };
const card = generateSvg(track, { ...options, theme: 'default' });
const list = generateListSvg({ tracks: [{ rank: 1, track: 'Track', artist: 'Artist' }] }, {
    ...options,
    bg: 'transparent',
    theme: 'default',
});

assert.match(card, /^\s*<svg/);
assert.match(card, /TEST TOP TRACK/);
assert.match(card, /https:\/\/example\.com\/profile/);
assert.match(card, /https:\/\/example\.com\/track/);
assert.match(list, /^\s*<svg/);
assert.match(list, /https:\/\/example\.com\/profile/);

for (const theme of ['compact', 'retro', 'osx', 'xorg']) {
    const svg = generateSvg(track, { ...options, theme });
    assert.match(svg, /^\s*<svg/);
    assert.match(svg, /https:\/\/example\.com\/profile/);
    assert.match(svg, /https:\/\/example\.com\/track/);
}

for (const theme of ['compact', 'retro', 'osx', 'xorg']) {
    const svg = generateListSvg({ tracks: [{ rank: 1, track: 'Track', artist: 'Artist' }] }, {
        ...options,
        theme
    });
    assert.match(svg, /^\s*<svg/);
    assert.match(svg, /https:\/\/example\.com\/profile/);
}

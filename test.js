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

const { escapeXml, decodeHtml, upgradeImage, isPlaceholderImage, isLightColor } = require('./lib/utils');
const { parseChartlistRows } = require('./lib/providers/lastfm/parsers/chartlist-row');
const { parseRecentTrack } = require('./lib/providers/lastfm/parsers');
const { hexToRgb, shade } = require('./lib/color');

for (const theme of ['default', 'compact', 'osx', 'retro', 'xorg']) {
    const svg = generateListSvg({ tracks: [{ rank: 1, track: 'T', artist: 'A', playcount: 1234 }] }, { ...options, theme });
    assert.ok(!svg.includes('▸'), `${theme}: no text arrow glyph`);
    assert.match(svg, /<polygon /);
    assert.match(svg, />1,234</);
}

const PLACEHOLDER = 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png';
assert.ok(isPlaceholderImage(PLACEHOLDER));
assert.equal(upgradeImage(PLACEHOLDER), '');
assert.equal(upgradeImage('https://x/i/u/64s/abc123.jpg'), 'https://x/i/u/300x300/abc123.jpg');

assert.equal(decodeHtml('Rock &amp; Roll &#39;n&#x27; <b>Roll</b>'), "Rock & Roll 'n' Roll");
assert.equal(escapeXml(decodeHtml('Tom &amp; Jerry')), 'Tom &amp; Jerry');
assert.equal(escapeXml('a\u0000b'), 'ab');
assert.equal(escapeXml(42), '42');

const rowHtml = '<tr class="chartlist-row" data-track-name="Don&#039;t Stop" data-artist-name="Simon &amp; Garfunkel"><td class="chartlist-name"><a href="/music/x/_/y">Don&#039;t Stop</a></td><td><img src="https://x/i/u/64s/abc.jpg"></td></tr>';
const [row] = parseChartlistRows('x' + rowHtml, 'https://d', 'top_track', 1);
assert.equal(row.track, "Don't Stop");
assert.equal(row.artist, 'Simon & Garfunkel');
assert.equal(row.image, 'https://x/i/u/300x300/abc.jpg');
assert.equal(parseRecentTrack('<html></html>', 'https://d'), null);

assert.deepEqual(hexToRgb('fff'), { r: 255, g: 255, b: 255 });
assert.deepEqual(hexToRgb('#11223344'), { r: 0x11, g: 0x22, b: 0x33 });
assert.equal(hexToRgb('zzz'), null);
assert.equal(shade('#000000', 300), '#ffffff');
assert.equal(isLightColor('ffffff'), true);
assert.equal(isLightColor('181818'), false);

const v = validateParams({ theme: 'nope', mode: 'x', bg: 'zz', accent: '#abc' });
assert.equal(v.safeTheme, 'default');
assert.equal(v.safeMode, 'smart');
assert.equal(v.safeBg, '181818');
assert.equal(v.safeAccent, '#abc');

console.log('all tests passed');

// --- security regression tests ---
{
    const { decodeHtml: dh, escapeXml: ex } = require('./lib/utils');
    const { validateParams: vp } = require('./lib/validation');

    // nested tags must not re-assemble into a real tag
    assert.ok(!/<script/i.test(dh('<scr<b>ipt>alert(1)</scr</b>ipt>')));
    assert.ok(!/<script/i.test(dh('<<script>script>alert(1)')));
    assert.ok(!/[<>]/.test(dh('<script')));
    // entities still decode, and output stays safe after escaping
    assert.equal(dh('Rock &amp; Roll'), 'Rock & Roll');
    assert.equal(dh('<b>Bold</b> &#39;n&#x27; &amp;lt;'), "Bold 'n' &lt;");
    assert.equal(ex(dh('&lt;script&gt;')), '&lt;script&gt;');

    // array / object query values must not crash or leak through
    const weird = vp({ user: ['a', 'b'], bg: ['abc'], accent: ['fff'], theme: ['osx'], width: ['500'], mode: { x: 1 } });
    assert.equal(weird.user, undefined);
    assert.equal(weird.safeBg, '181818');
    assert.equal(weird.safeAccent, null);
    assert.equal(weird.safeTheme, 'default');
    assert.equal(weird.safeWidth, 400);
    assert.equal(weird.safeMode, 'smart');
    assert.equal(vp({ accent: '#FF00aa' }).safeAccent, '#ff00aa');
    assert.equal(vp({ bg: '"><script>' }).safeBg, '181818');
}
console.log('security tests passed');

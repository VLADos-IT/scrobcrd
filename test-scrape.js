const { fetchLastFmData } = require('./lib/lastfm');
const { generateSvg } = require('./lib/svg');
const { fetchImageAsBase64 } = require('./lib/utils');

async function test() {
    const user = 'vlados14311';
    console.log(`Running CI test for: ${user}`);

    try {
        const data = await fetchLastFmData(user, 'smart');
        if (!data) throw new Error('Fetch failed: No data returned');
        console.log(`✅ Data fetched: [${data.type}] ${data.track}`);

        let imageBase64 = '';
        if (data.image) {
            imageBase64 = await fetchImageAsBase64(data.image);
            if (imageBase64) console.log('✅ Image fetched');
            else console.warn('⚠️ Image fetch empty (timeout/invalid URL)');
        }

        const svg = generateSvg({ ...data, imageBase64 }, { width: 400, bg: '181818', mode: 'smart' });
        
        if (!svg?.trim().startsWith('<svg')) throw new Error('Invalid SVG format');
        if (svg.length < 100) throw new Error('SVG suspiciously short');
        if (imageBase64 && !svg.includes('<image')) throw new Error('Missing <image> tag');

        console.log('✅ SVG generated & validated');
        console.log('🚀 Test Passed!');
        process.exit(0);

    } catch (e) {
        if (e.status === 600 && process.env.CI) {
            console.warn('⚠️ CI WAF bypass (status 600). Exiting with success.');
            process.exit(0);
        }
        
        console.error('❌ Test failed:', e.message || e);
        process.exit(1);
    }
}

test();
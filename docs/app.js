(() => {
    'use strict';

    const API_BASE = 'https://lastfm-github-profile.vercel.app/api/';
    const REPO_URL = 'https://github.com/VLADos-IT/scrobcrd';
    const PROFILES = {
        lastfm: u => `https://www.last.fm/user/${encodeURIComponent(u)}`,
        listenbrainz: u => `https://listenbrainz.org/user/${encodeURIComponent(u)}/`
    };

    const $ = id => document.getElementById(id);
    const form = $('controls');
    let source = 'lastfm';

    document.querySelectorAll('[data-repo-link]').forEach(el => el.href = REPO_URL);

    document.querySelectorAll('.seg-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.seg-btn').forEach(b => b.classList.toggle('is-active', b === btn));
            source = btn.dataset.value;
            if (!$('accentEnabled').checked) {
                $('accentPicker').value = source === 'lastfm' ? '#d1170e' : '#eb743b';
            }
            update();
        };
    });

    const bindColor = (pickerId, textId) => {
        $(pickerId).oninput = e => { $(textId).value = e.target.value.replace('#', ''); update(); };
        $(textId).oninput = e => {
            const val = e.target.value.replace('#', '');
            if (/^[0-9a-fA-F]{6}$/.test(val)) $(pickerId).value = `#${val}`;
            update();
        };
    };
    bindColor('bgPicker', 'bg');
    bindColor('accentPicker', 'accent');

    $('bgTransparent').onchange = e => {
        $('bg').disabled = $('bgPicker').disabled = e.target.checked;
        update();
    };
    $('accentEnabled').onchange = e => {
        $('accent').disabled = $('accentPicker').disabled = !e.target.checked;
        update();
    };

    form.oninput = e => {
        if (e.target.id === 'limit') $('limitOut').textContent = e.target.value;
        if (e.target.id === 'width') $('widthOut').textContent = e.target.value;
        if (!['bg', 'bgPicker', 'accent', 'accentPicker'].includes(e.target.id)) update();
    };
    form.onchange = update;

    function update() {
        const user = $('user').value.trim();
        const mode = $('mode').value;

        document.querySelectorAll('[data-visible-for]').forEach(el => {
            el.style.display = el.dataset.visibleFor.split(',').includes(mode) ? '' : 'none';
        });

        if (!user) {
            $('previewImg').hidden = $('previewOpen').hidden = $('snippets').hidden = true;
            $('previewEmpty').hidden = false;
            return;
        }

        const p = new URLSearchParams({ user });
        if (source !== 'lastfm') p.set('source', source);
        if (mode !== 'smart') p.set('mode', mode);
        if (['top', 'list'].includes(mode) && $('range').value !== 'all') p.set('range', $('range').value);
        if (['list', 'history'].includes(mode) && $('limit').value !== '5') p.set('limit', $('limit').value);
        if ($('theme').value !== 'default') p.set('theme', $('theme').value);
        if ($('width').value !== '400') p.set('width', $('width').value);
        if ($('bgTransparent').checked) p.set('bg', 'none');
        else if ($('bg').value !== '181818') p.set('bg', $('bg').value);
        if ($('accentEnabled').checked && $('accent').value) p.set('accent', $('accent').value);

        const apiUrl = `${API_BASE}?${p}`;
        const profileUrl = PROFILES[source](user);
        const sourceName = source === 'lastfm' ? 'Last.fm' : 'ListenBrainz';

        $('previewImg').src = `${apiUrl}&_=${Date.now()}`;
        $('previewImg').hidden = false;
        $('previewEmpty').hidden = true;
        $('previewOpen').href = apiUrl;
        $('previewOpen').hidden = $('snippets').hidden = false;

        $('snippetUrl').textContent = apiUrl;
        $('snippetMd').textContent = `[![${sourceName}](${apiUrl})](${profileUrl})`;
        $('snippetHtml').textContent = `<a href="${profileUrl}"><img src="${apiUrl}" alt="${sourceName} activity" /></a>`;
    }

    let toastTimer;
    document.onclick = async e => {
        const btn = e.target.closest('.copy-btn');
        if (!btn) return;

        try {
            await navigator.clipboard.writeText($($(btn.dataset.copyTarget))?.textContent || '');
            $('toast').textContent = 'Copied to clipboard';
        } catch {
            $('toast').textContent = 'Copy failed';
        }

        $('toast').classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => $('toast').classList.remove('is-visible'), 1800);
    };

    update();
})();

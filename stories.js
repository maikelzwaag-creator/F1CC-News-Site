window.stories = {};
let _storiesLoaded = false;
let _loadingPromise = null;

function withCacheBust(url) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${Date.now()}`;
}

async function fetchFresh(url) {
  return fetch(withCacheBust(url), {
    cache: 'no-store'
  });
}

window.loadStories = async function() {
  if (_storiesLoaded) return;
  if (_loadingPromise) return _loadingPromise;

  _loadingPromise = (async () => {
    try {
      const indexRes = await fetchFresh('news/index.json');
      if (!indexRes.ok) {
        console.error('[stories] Failed to load news/index.json — HTTP', indexRes.status);
        return;
      }
      const keys = await indexRes.json();
      const jsonFiles = keys.map(k => k.endsWith('.json') ? k : k + '.json');

      const promises = jsonFiles.map(async (file) => {
        const key = file.replace('.json', '');
        try {
          const res = await fetchFresh(`news/${file}`);
          if (!res.ok) {
            console.warn(`[stories] Skipped "${file}" — HTTP ${res.status}`);
            return;
          }
          const text = await res.text();
          try {
            window.stories[key] = JSON.parse(text);
          } catch (parseErr) {
            console.error(`[stories] Skipped "${file}" — invalid JSON:`, parseErr.message);
          }
        } catch (fetchErr) {
          console.error(`[stories] Skipped "${file}" — fetch failed:`, fetchErr.message);
        }
      });

      await Promise.all(promises);
      _storiesLoaded = true;
    } catch (err) {
      console.error('[stories] Unexpected error:', err);
      _loadingPromise = null; // allow retry on error
    }
  })();

  return _loadingPromise;
};

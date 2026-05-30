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
        console.error('Failed to load news/index.json');
        return;
      }
      const keys = await indexRes.json();
      const jsonFiles = keys.map(k => k.endsWith('.json') ? k : k + '.json');

      const promises = jsonFiles.map(async (file) => {
        const key = file.replace('.json', '');
        const res = await fetchFresh(`news/${file}`);
        if (res.ok) {
          window.stories[key] = await res.json();
        }
      });

      await Promise.all(promises);
      _storiesLoaded = true;
    } catch (err) {
      console.error('Error loading stories:', err);
      _loadingPromise = null; // allow retry on error
    }
  })();

  return _loadingPromise;
};

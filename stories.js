window.stories = {};

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
  try {
    const listRes = await fetchFresh('news/');
    const text = await listRes.text();
    
    const regex = /href=(?:"|')([^"']+\.json)(?:"|')/gi;
    let match;
    const jsonFiles = [];
    while ((match = regex.exec(text)) !== null) {
      let file = match[1];
      if (file.includes('/')) {
        file = file.split('/').pop();
      }
      if (!jsonFiles.includes(file)) {
        jsonFiles.push(file);
      }
    }
    
    if (jsonFiles.length === 0) {
      console.log('Directory listing blocked, falling back to index.json');
      try {
        const fallback = await fetchFresh('news/index.json');
        if (fallback.ok) {
          const keys = await fallback.json();
          keys.forEach(k => jsonFiles.push(k.endsWith('.json') ? k : k + '.json'));
        }
      } catch(e) {}
    }
    
    const promises = jsonFiles.map(async (file) => {
      const key = file.replace('.json', '');
      const res = await fetchFresh(`news/${file}`);
      if (res.ok) {
        window.stories[key] = await res.json();
      }
    });
    
    await Promise.all(promises);
  } catch (err) {
    console.error('Error loading stories from news folder:', err);
  }
};

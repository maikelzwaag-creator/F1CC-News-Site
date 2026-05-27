function parseSidebarDate(meta) {
    const m = (meta || '').match(/Published:\s*(\d+)\s+(\w+)\s+(\d{4})/);
    if (!m) return new Date(0);
    return new Date(m[2] + ' ' + m[1] + ', ' + m[3]);
}

function escapeSidebarHtml(text) {
    return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function pickRandomStories(stories, limit) {
    const copy = [...stories];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, limit);
}

document.addEventListener("DOMContentLoaded", async function() {
    const sidebarContainer = document.getElementById("sidebar-container");
    if (!sidebarContainer) return;

    await window.loadStories();

    const params = new URLSearchParams(window.location.search);
    const currentStoryKey = params.get('story') || (window.location.pathname.endsWith('article.html') ? 'china-gp' : '');
    const currentStory = currentStoryKey ? window.stories[currentStoryKey] : null;
    const currentTags = new Set(Array.isArray(currentStory?.tags) ? currentStory.tags.map(t => String(t).toLowerCase()) : []);

    const nonF1 = Object.entries(window.stories)
        .map(([key, story]) => ({ key, ...story }))
        .filter(s => !Array.isArray(s.tags) || !s.tags.includes('F1'))
        .sort((a, b) => parseSidebarDate(b.meta) - parseSidebarDate(a.meta));

    const liHTML = nonF1.map((s, i) => {
        const border = i < nonF1.length - 1 ? 'border-bottom: 1px dotted #697282; padding-bottom: 0.6rem;' : '';
        return `<li style="display: flex; gap: 0.75rem; align-items: flex-start; ${border}">
            <img src="${escapeSidebarHtml(s.image)}" alt="${escapeSidebarHtml(s.title)}" style="width: 60px; height: 45px; object-fit: cover; border-radius: 3px; flex-shrink: 0; border: 1px solid #555d69;">
            <a href="article.html?story=${encodeURIComponent(s.key)}" style="color: inherit; text-decoration: none; font-size: 0.93rem; font-weight: 500; line-height: 1.3;">${escapeSidebarHtml(s.title)}</a>
        </li>`;
    }).join('');

    const relatedCandidates = Object.entries(window.stories)
        .map(([key, story]) => ({ key, ...story }))
        .filter((s) => s.key !== currentStoryKey)
        .filter((s) => {
            if (!currentTags.size) return false;
            if (!Array.isArray(s.tags) || !s.tags.length) return false;
            return s.tags.some(tag => currentTags.has(String(tag).toLowerCase()));
        });

    const recommended = pickRandomStories(relatedCandidates, 4);
    const recommendedHtml = recommended.length
        ? recommended.map((s, i) => {
            const border = i < recommended.length - 1 ? 'border-bottom: 1px dotted #697282; padding-bottom: 0.6rem;' : '';
            return `<li style="display: flex; gap: 0.75rem; align-items: flex-start; ${border}">
                <img src="${escapeSidebarHtml(s.image)}" alt="${escapeSidebarHtml(s.title)}" style="width: 60px; height: 45px; object-fit: cover; border-radius: 3px; flex-shrink: 0; border: 1px solid #555d69;">
                <a href="article.html?story=${encodeURIComponent(s.key)}" style="color: inherit; text-decoration: none; font-size: 0.93rem; font-weight: 500; line-height: 1.3;">${escapeSidebarHtml(s.title)}</a>
            </li>`;
        }).join('')
        : '<li style="font-size: 0.9rem; color: #c7cdd7;">No similar-tag stories available yet.</li>';

    const recommendedBlock = currentStory
        ? `
            <section class="side-block">
                <h4 class="side-title">Recommended for You</h4>
                <ul class="side-list">${recommendedHtml}</ul>
            </section>
        `
        : '';

    sidebarContainer.innerHTML = `
        <aside class="sidebar" aria-label="More stories">
            <div class="sidebar-head">More Headlines</div>
            <section class="side-block">
                <h4 class="side-title">Beyond F1</h4>
                <ul class="side-list">${liHTML}</ul>
            </section>
            ${recommendedBlock}
        </aside>
    `;
});

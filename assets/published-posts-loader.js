// ==================== PUBLISHED POSTS LOADER ====================
// Charge les posts publiés depuis le générateur IA et les fusionne avec POSTS_DATA
// Version 1.0

const PUBLISHED_POSTS_KEY = 'scarlet_published_posts';

/**
 * Récupère les posts publiés depuis localStorage
 */
function getPublishedPosts() {
    try {
        const data = localStorage.getItem(PUBLISHED_POSTS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Erreur lecture posts publiés:', e);
        return [];
    }
}

/**
 * Fusionne POSTS_DATA avec les posts publiés
 * Les posts publiés sont ajoutés au début avec des IDs uniques
 */
function getAllPosts() {
    const published = getPublishedPosts();
    
    // Assigner des IDs uniques aux posts publiés s'ils n'en ont pas de numériques
    const maxExistingId = POSTS_DATA.reduce((max, p) => Math.max(max, p.id || 0), 0);
    
    const publishedWithIds = published.map((post, index) => ({
        ...post,
        id: post.id || (maxExistingId + index + 1),
        formatLabel: post.formatLabel || getFormatLabel(post.format),
        isGenerated: true
    }));
    
    // Posts publiés en premier, puis les existants
    return [...publishedWithIds, ...POSTS_DATA];
}

/**
 * Génère le label de format si manquant
 */
function getFormatLabel(format) {
    const labels = {
        'pie_chart': '📊 Pie Chart',
        'meme': '😂 Meme',
        'checklist': '✅ Checklist',
        'poll': '📊 Poll'
    };
    return labels[format] || format;
}

/**
 * Supprime un post publié par son ID
 */
function removePublishedPost(postId) {
    const posts = getPublishedPosts();
    const filtered = posts.filter(p => p.id !== postId);
    localStorage.setItem(PUBLISHED_POSTS_KEY, JSON.stringify(filtered));
    return filtered;
}

/**
 * Vide tous les posts publiés
 */
function clearAllPublishedPosts() {
    if (confirm('⚠️ Supprimer tous les posts générés par l\'IA de la vue d\'ensemble ?')) {
        localStorage.removeItem(PUBLISHED_POSTS_KEY);
        location.reload();
    }
}

/**
 * Compte les posts publiés
 */
function getPublishedPostsCount() {
    return getPublishedPosts().length;
}

// Log au chargement
(function() {
    const count = getPublishedPostsCount();
    if (count > 0) {
        console.log(`🤖 ${count} posts IA chargés depuis le générateur`);
    }
})();

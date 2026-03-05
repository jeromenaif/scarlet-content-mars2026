// ==================== PUBLISHED POSTS LOADER ====================
// Ajouter ce code à votre page d'aperçu (index.html) pour charger les posts publiés
// depuis le générateur IA

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
 * Les posts publiés sont ajoutés au début
 */
function getAllPosts() {
    const published = getPublishedPosts();
    
    // Si POSTS_DATA existe, fusionner
    if (typeof POSTS_DATA !== 'undefined') {
        return [...published, ...POSTS_DATA];
    }
    
    return published;
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
    localStorage.removeItem(PUBLISHED_POSTS_KEY);
}

/**
 * Compte les posts publiés
 */
function getPublishedPostsCount() {
    return getPublishedPosts().length;
}

// ==================== INTÉGRATION AUTOMATIQUE ====================

// Cette fonction met à jour automatiquement l'affichage si vous utilisez
// une variable POSTS_DATA dans votre page d'aperçu

(function initPublishedPostsLoader() {
    // Attendre que la page soit chargée
    document.addEventListener('DOMContentLoaded', function() {
        const publishedCount = getPublishedPostsCount();
        
        if (publishedCount > 0) {
            console.log(`📥 ${publishedCount} posts publiés chargés depuis le générateur IA`);
            
            // Optionnel : afficher un badge ou notification
            showPublishedPostsBadge(publishedCount);
        }
        
        // Si votre page utilise POSTS_DATA, le remplacer par la version fusionnée
        if (typeof POSTS_DATA !== 'undefined' && typeof window.initializePosts === 'function') {
            // Si vous avez une fonction d'initialisation, l'appeler avec les posts fusionnés
            window.POSTS_DATA = getAllPosts();
            window.initializePosts();
        }
    });
})();

/**
 * Affiche un badge indiquant le nombre de posts publiés
 */
function showPublishedPostsBadge(count) {
    // Chercher un élément pour afficher le badge
    const headerEl = document.querySelector('header, .header, h1');
    
    if (headerEl && count > 0) {
        const badge = document.createElement('span');
        badge.className = 'published-badge';
        badge.innerHTML = `🤖 ${count} posts IA`;
        badge.style.cssText = `
            background: linear-gradient(135deg, #e63946, #ff6b6b);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            margin-left: 12px;
            font-weight: 500;
        `;
        badge.title = 'Posts générés par l\'IA et publiés vers l\'aperçu';
        
        // Ajouter après le titre principal
        if (!document.querySelector('.published-badge')) {
            headerEl.appendChild(badge);
        }
    }
}

// ==================== EXEMPLE D'UTILISATION ====================

/*
// Dans votre code d'affichage des posts, remplacez :
POSTS_DATA.forEach(post => { ... });

// Par :
getAllPosts().forEach(post => { ... });

// Ou bien, au chargement de la page :
const allPosts = getAllPosts();
// Utilisez allPosts au lieu de POSTS_DATA
*/

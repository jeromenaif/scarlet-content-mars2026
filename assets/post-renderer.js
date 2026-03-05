// Post Renderer Script - Version 2.0 with AI posts support
let currentPost = null;
let currentLang = 'fr';

// Storage key for published posts (must match the one in published-posts-loader.js)
const PUBLISHED_POSTS_KEY = 'scarlet_published_posts';

// Get published posts from localStorage
function getPublishedPosts() {
    try {
        const data = localStorage.getItem(PUBLISHED_POSTS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Erreur lecture posts publiés:', e);
        return [];
    }
}

// Get all posts (POSTS_DATA + published AI posts)
function getAllPosts() {
    const published = getPublishedPosts();
    
    // Assign unique IDs to published posts if needed
    const maxExistingId = POSTS_DATA.reduce((max, p) => Math.max(max, p.id || 0), 0);
    
    const publishedWithIds = published.map((post, index) => ({
        ...post,
        id: post.id || (maxExistingId + index + 1),
        formatLabel: post.formatLabel || getFormatLabelFromFormat(post.format),
        isGenerated: true
    }));
    
    return [...publishedWithIds, ...POSTS_DATA];
}

// Get format label
function getFormatLabelFromFormat(format) {
    const labels = {
        'pie_chart': '📊 Pie Chart',
        'meme': '😂 Meme',
        'checklist': '✅ Checklist',
        'poll': '📊 Poll'
    };
    return labels[format] || format;
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    const source = urlParams.get('source'); // 'ai' if from AI generator
    
    if (!postId) {
        window.location.href = 'index.html';
        return;
    }
    
    // Get all posts including AI-generated ones
    const allPosts = getAllPosts();
    
    // Find post - handle both numeric and string IDs
    currentPost = allPosts.find(p => {
        if (typeof p.id === 'number') {
            return p.id === parseInt(postId);
        }
        return p.id === postId || String(p.id) === postId;
    });
    
    if (!currentPost) {
        alert('Publication non trouvée');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('📄 Post chargé:', currentPost.theme, currentPost.isGenerated ? '(IA)' : '(Manuel)');
    
    renderPost();
    loadTallyForm();
});

// Main render function
function renderPost() {
    // Update header
    document.getElementById('postTitle').textContent = `Post #${currentPost.id} — ${currentPost.theme}`;
    
    const subtitleEl = document.getElementById('postSubtitle');
    if (currentPost.isGenerated) {
        subtitleEl.innerHTML = `${currentPost.date || '??/??'}/2026 • ${currentPost.formatLabel || currentPost.format} <span style="background: linear-gradient(135deg, #9b59b6, #8e44ad); color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; margin-left: 8px;">🤖 Généré par IA</span>`;
    } else {
        subtitleEl.textContent = `${currentPost.date}/2026 • ${currentPost.formatLabel}`;
    }
    
    // Render meta information
    renderPostMeta();
    
    // Render caption
    renderCaption();
    
    // Render visual
    renderVisual();
}

// Render post metadata
function renderPostMeta() {
    const pilierClass = {
        'Bon Marché': 'badge-green',
        'Qualité': 'badge-blue',
        'Transparence': 'badge-yellow'
    }[currentPost.pilier] || 'badge-format';
    
    // Add objectif media badge if available
    let objectifBadge = '';
    if (currentPost.objectif_media) {
        const isEngagement = currentPost.objectif_media === 'ENGAGEMENT';
        objectifBadge = `<span class="badge" style="background: ${isEngagement ? '#9b59b6' : '#3498db'}; color: white;">${isEngagement ? '💬 Engagement' : '🎯 Reach'}</span>`;
    }
    
    document.getElementById('postMeta').innerHTML = `
        <div style="margin-bottom: 20px;">
            <span class="badge ${pilierClass}">${currentPost.pilier}</span>
            <span class="badge badge-format">${currentPost.formatLabel || currentPost.format}</span>
            <span class="badge badge-date">${currentPost.date || '??/??'}/26</span>
            ${objectifBadge}
        </div>
        <h2>${currentPost.theme}</h2>
        ${currentPost.reasoning ? `<p style="font-size: 13px; color: #888; margin-top: 8px;">🎯 ${currentPost.reasoning}</p>` : ''}
        ${currentPost.objectif_justification ? `<p style="font-size: 12px; color: #9b59b6; margin-top: 4px;">📌 ${currentPost.objectif_justification}</p>` : ''}
    `;
}

// Render editable caption
function renderCaption() {
    const caption = currentPost.captions?.[currentLang] || currentPost.captions?.fr || '';
    document.getElementById('captionEditable').innerHTML = `
        <div class="caption-editable">
            <h4>
                📱 Caption ${currentLang.toUpperCase()}
                <span class="edit-hint">✏️ Éditable</span>
            </h4>
            <textarea 
                class="caption-textarea" 
                id="captionText"
                oninput="updateCaptionPreview()"
            >${caption}</textarea>
        </div>
    `;
}

// Update caption preview (for future use)
function updateCaptionPreview() {
    // Caption is now editable - stored in textarea
}

// Render visual based on format
function renderVisual() {
    const data = currentPost.data?.[currentLang] || currentPost.data?.fr;
    
    if (!data) {
        document.getElementById('visualContainer').innerHTML = `
            <div class="visual" id="visualToExport" style="display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px;">
                <div style="font-size: 64px;">🎨</div>
                <div style="color: #888; text-align: center;">
                    <p>Données visuelles non disponibles</p>
                    <p style="font-size: 12px; margin-top: 8px;">Ce post a été généré par l'IA.<br>Les données visuelles seront ajoutées manuellement.</p>
                </div>
                <div class="logo">scarlet</div>
            </div>
        `;
        return;
    }
    
    let visualHTML = '';
    
    switch (currentPost.format) {
        case 'pie_chart':
            visualHTML = renderPieChart(data);
            break;
        case 'meme':
            visualHTML = renderMeme(data);
            break;
        case 'checklist':
            visualHTML = renderChecklist(data);
            break;
        case 'poll':
            visualHTML = renderPoll(data);
            break;
        default:
            visualHTML = `<div style="padding: 40px; text-align: center; color: #888;">Format "${currentPost.format}" non supporté</div>`;
    }
    
    document.getElementById('visualContainer').innerHTML = `
        <div class="visual" id="visualToExport">
            ${visualHTML}
            <div class="logo">scarlet</div>
        </div>
    `;
}

// Render Pie Chart
function renderPieChart(data) {
    if (!data.percentages || !data.legends) {
        return '<div style="padding: 40px; text-align: center; color: #888;">Données de graphique manquantes</div>';
    }
    
    const total = data.percentages.reduce((a, b) => a + b, 0);
    let gradient = '';
    let cumul = 0;
    
    data.percentages.forEach((pct, i) => {
        const start = (cumul / total) * 100;
        cumul += pct;
        const end = (cumul / total) * 100;
        gradient += `${CONFIG.chartColors[i]} ${start}% ${end}%${i < data.percentages.length - 1 ? ',' : ''}`;
    });
    
    const legendsHTML = data.legends.map((legend, i) => `
        <div class="legend-item">
            <div class="legend-color" style="background:${CONFIG.chartColors[i]}"></div>
            <span class="legend-text editable-text" contenteditable="true" data-field="legend-${i}">${legend}</span>
        </div>
    `).join('');
    
    return `
        <div class="visual-inner">
            <div class="visual-title editable-text" contenteditable="true" data-field="title">${data.chartTitle || 'Titre'}</div>
            <div class="pie-container">
                <div class="pie-chart" style="background: conic-gradient(${gradient})"></div>
                <div>${legendsHTML}</div>
            </div>
        </div>
    `;
}

// Render Meme
function renderMeme(data) {
    return `
        <div class="meme-inner">
            <div class="meme-panel top">
                <div>
                    <div class="meme-emoji">😌</div>
                    <div class="meme-text editable-text" contenteditable="true" data-field="topText">${data.topText || 'Texte du haut'}</div>
                </div>
            </div>
            <div class="meme-panel bottom">
                <div>
                    <div class="meme-emoji">😵‍💫</div>
                    <div class="meme-text editable-text" contenteditable="true" data-field="bottomText">${data.bottomText || 'Texte du bas'}</div>
                </div>
            </div>
        </div>
    `;
}

// Render Checklist
function renderChecklist(data) {
    const items = data.items || ['Item 1', 'Item 2', 'Item 3'];
    const itemsHTML = items.map((item, i) => `
        <div class="check-item">
            <div class="check-box">✓</div>
            <span class="check-text editable-text" contenteditable="true" data-field="item-${i}">${item}</span>
        </div>
    `).join('');
    
    return `
        <div class="visual-inner">
            <div class="visual-title editable-text" contenteditable="true" data-field="title">${data.checklistTitle || 'Titre checklist'}</div>
            ${itemsHTML}
        </div>
    `;
}

// Render Poll
function renderPoll(data) {
    const options = data.options || ['Option 1', 'Option 2'];
    return `
        <div class="visual-inner" style="justify-content:center">
            <div class="poll-question editable-text" contenteditable="true" data-field="question">${data.question || 'Question ?'}</div>
            <div class="poll-option opt1 editable-text" contenteditable="true" data-field="option1">${options[0]}</div>
            <div class="poll-option opt2 editable-text" contenteditable="true" data-field="option2">${options[1]}</div>
        </div>
    `;
}

// Language switcher
function setLang(lang) {
    currentLang = lang;
    
    // Update button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Re-render
    renderCaption();
    renderVisual();
}

// Export to PNG
async function exportPNG() {
    const btn = document.getElementById('exportBtn');
    const visual = document.getElementById('visualToExport');
    
    btn.innerHTML = '⏳ Export en cours...';
    btn.disabled = true;
    
    try {
        const canvas = await html2canvas(visual, {
            scale: 2,
            backgroundColor: null,
            logging: false
        });
        
        const link = document.createElement('a');
        const postIdClean = String(currentPost.id).replace(/[^a-zA-Z0-9]/g, '_');
        link.download = `Scarlet_Post${postIdClean}_${currentPost.format}_${currentLang.toUpperCase()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        btn.innerHTML = '✅ Exporté !';
        setTimeout(() => {
            btn.innerHTML = '💾 Exporter en PNG';
            btn.disabled = false;
        }, 2000);
    } catch (error) {
        console.error('Export error:', error);
        btn.innerHTML = '❌ Erreur - Réessayer';
        btn.disabled = false;
    }
}

// Load Tally form
function loadTallyForm() {
    const container = document.getElementById('tallyContainer');
    
    // Don't show Tally form for AI-generated posts
    if (currentPost.isGenerated) {
        container.innerHTML = `
            <div style="background: rgba(155, 89, 182, 0.1); border: 1px solid rgba(155, 89, 182, 0.3); border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-size: 24px; margin-bottom: 12px;">🤖</div>
                <p style="color: #9b59b6; margin-bottom: 8px;"><strong>Post généré par IA</strong></p>
                <p style="font-size: 13px; color: #888;">Le formulaire de feedback sera disponible après validation et publication officielle.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <iframe 
            src="https://tally.so/embed/${CONFIG.tallyFormId}?transparentBackground=1&hideTitle=1&dynamicHeight=1&post=${currentPost.id}"
            class="tally-iframe"
            frameborder="0"
            marginheight="0"
            marginwidth="0"
            title="Feedback Publication ${currentPost.id}"
            loading="lazy"
            onload="window.scrollTo(0, 0);">
        </iframe>
    `;
}

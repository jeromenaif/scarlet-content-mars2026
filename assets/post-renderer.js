// Post Renderer Script - Version 2.1 (Fixed for AI posts)
// Requires: data.js and published-posts-loader.js loaded before this script

let currentPost = null;
let currentLang = 'fr';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    console.log('🔍 Recherche du post ID:', postId);
    
    if (!postId) {
        console.error('❌ Pas d\'ID dans l\'URL');
        window.location.href = 'index.html';
        return;
    }
    
    // Get all posts including AI-generated ones
    // getAllPosts() is defined in published-posts-loader.js
    let allPosts;
    if (typeof getAllPosts === 'function') {
        allPosts = getAllPosts();
        console.log('✅ Utilisation de getAllPosts() - posts IA inclus');
    } else {
        allPosts = POSTS_DATA;
        console.log('⚠️ getAllPosts() non disponible, utilisation de POSTS_DATA uniquement');
    }
    
    console.log('📚 Nombre total de posts:', allPosts.length);
    
    // Find post - handle both numeric and string IDs
    currentPost = allPosts.find(p => {
        const pId = String(p.id);
        const searchId = String(postId);
        return pId === searchId;
    });
    
    if (!currentPost) {
        console.error('❌ Post non trouvé avec ID:', postId);
        console.log('📋 IDs disponibles:', allPosts.map(p => p.id));
        alert('Publication non trouvée (ID: ' + postId + ')');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('✅ Post trouvé:', currentPost.theme);
    console.log('📄 Format:', currentPost.format);
    console.log('📄 Data:', currentPost.data);
    
    renderPost();
    loadTallyForm();
});

// Main render function
function renderPost() {
    // Determine if this is an AI-generated post
    const isGenerated = currentPost.isGenerated || 
                        (typeof currentPost.id === 'string' && currentPost.id.startsWith('gen_'));
    
    // Update header
    const postIdDisplay = isGenerated ? 'IA' : currentPost.id;
    document.getElementById('postTitle').textContent = `Post #${postIdDisplay} — ${currentPost.theme}`;
    
    const subtitleEl = document.getElementById('postSubtitle');
    const formatLabel = currentPost.formatLabel || getFormatLabelLocal(currentPost.format);
    
    if (isGenerated) {
        subtitleEl.innerHTML = `${currentPost.date || '??/??'}/2026 • ${formatLabel} <span style="background: linear-gradient(135deg, #9b59b6, #8e44ad); color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; margin-left: 8px;">🤖 Généré par IA</span>`;
    } else {
        subtitleEl.textContent = `${currentPost.date}/2026 • ${formatLabel}`;
    }
    
    // Render meta information
    renderPostMeta();
    
    // Render caption
    renderCaption();
    
    // Render visual
    renderVisual();
}

// Get format label
function getFormatLabelLocal(format) {
    const labels = {
        'pie_chart': '📊 Pie Chart',
        'meme': '😂 Meme',
        'checklist': '✅ Checklist',
        'poll': '📊 Poll'
    };
    return labels[format] || format;
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
    
    const formatLabel = currentPost.formatLabel || getFormatLabelLocal(currentPost.format);
    
    document.getElementById('postMeta').innerHTML = `
        <div style="margin-bottom: 20px;">
            <span class="badge ${pilierClass}">${currentPost.pilier}</span>
            <span class="badge badge-format">${formatLabel}</span>
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
    let caption = '';
    
    if (currentPost.captions) {
        caption = currentPost.captions[currentLang] || currentPost.captions.fr || '';
    }
    
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
    console.log('🎨 Rendu visuel pour format:', currentPost.format);
    
    // Get data for current language, with fallbacks
    let data = null;
    
    if (currentPost.data) {
        // Try to get language-specific data
        if (currentPost.data[currentLang]) {
            data = currentPost.data[currentLang];
        } else if (currentPost.data.fr) {
            data = currentPost.data.fr;
        } else {
            // Data might be at root level (not nested by language)
            data = currentPost.data;
        }
    }
    
    console.log('📊 Données pour rendu:', data);
    
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        document.getElementById('visualContainer').innerHTML = `
            <div class="visual" id="visualToExport" style="display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px;">
                <div style="font-size: 64px;">🎨</div>
                <div style="color: white; text-align: center; padding: 20px;">
                    <p style="font-size: 18px; font-weight: bold; margin-bottom: 12px;">Visuel en cours de création</p>
                    <p style="font-size: 13px; opacity: 0.8;">Les données visuelles seront ajoutées par l'équipe graphique.</p>
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
            visualHTML = `<div class="visual-inner" style="display: flex; align-items: center; justify-content: center;"><p style="color: #888;">Format "${currentPost.format}" non supporté</p></div>`;
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
    // Handle various data structures
    const chartTitle = data.chartTitle || data.title || 'Titre';
    const legends = data.legends || data.labels || ['Option 1', 'Option 2'];
    const percentages = data.percentages || data.values || [50, 50];
    
    if (!percentages || percentages.length === 0) {
        return '<div class="visual-inner" style="display: flex; align-items: center; justify-content: center;"><p>Données de graphique manquantes</p></div>';
    }
    
    const total = percentages.reduce((a, b) => a + b, 0);
    let gradient = '';
    let cumul = 0;
    
    const colors = (typeof CONFIG !== 'undefined' && CONFIG.chartColors) 
        ? CONFIG.chartColors 
        : ['#2BA600', '#E61F13', '#FFB800', '#0066CC'];
    
    percentages.forEach((pct, i) => {
        const start = (cumul / total) * 100;
        cumul += pct;
        const end = (cumul / total) * 100;
        gradient += `${colors[i % colors.length]} ${start}% ${end}%${i < percentages.length - 1 ? ',' : ''}`;
    });
    
    const legendsHTML = legends.map((legend, i) => `
        <div class="legend-item">
            <div class="legend-color" style="background:${colors[i % colors.length]}"></div>
            <span class="legend-text editable-text" contenteditable="true" data-field="legend-${i}">${legend}</span>
        </div>
    `).join('');
    
    return `
        <div class="visual-inner">
            <div class="visual-title editable-text" contenteditable="true" data-field="title">${chartTitle}</div>
            <div class="pie-container">
                <div class="pie-chart" style="background: conic-gradient(${gradient})"></div>
                <div>${legendsHTML}</div>
            </div>
        </div>
    `;
}

// Render Meme
function renderMeme(data) {
    const topText = data.topText || data.top || data.panel1 || 'Texte du haut';
    const bottomText = data.bottomText || data.bottom || data.panel2 || 'Texte du bas';
    
    return `
        <div class="meme-inner">
            <div class="meme-panel top">
                <div>
                    <div class="meme-emoji">😌</div>
                    <div class="meme-text editable-text" contenteditable="true" data-field="topText">${topText}</div>
                </div>
            </div>
            <div class="meme-panel bottom">
                <div>
                    <div class="meme-emoji">😵‍💫</div>
                    <div class="meme-text editable-text" contenteditable="true" data-field="bottomText">${bottomText}</div>
                </div>
            </div>
        </div>
    `;
}

// Render Checklist
function renderChecklist(data) {
    const title = data.checklistTitle || data.title || 'Titre checklist';
    const items = data.items || data.list || ['Item 1', 'Item 2', 'Item 3'];
    
    const itemsHTML = items.map((item, i) => `
        <div class="check-item">
            <div class="check-box">✓</div>
            <span class="check-text editable-text" contenteditable="true" data-field="item-${i}">${item}</span>
        </div>
    `).join('');
    
    return `
        <div class="visual-inner">
            <div class="visual-title editable-text" contenteditable="true" data-field="title">${title}</div>
            ${itemsHTML}
        </div>
    `;
}

// Render Poll
function renderPoll(data) {
    const question = data.question || 'Question ?';
    const options = data.options || ['Option 1', 'Option 2'];
    
    return `
        <div class="visual-inner" style="justify-content:center">
            <div class="poll-question editable-text" contenteditable="true" data-field="question">${question}</div>
            <div class="poll-option opt1 editable-text" contenteditable="true" data-field="option1">${options[0] || 'Option 1'}</div>
            <div class="poll-option opt2 editable-text" contenteditable="true" data-field="option2">${options[1] || 'Option 2'}</div>
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
    
    if (!visual) {
        alert('Aucun visuel à exporter');
        return;
    }
    
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
    const isGenerated = currentPost.isGenerated || 
                        (typeof currentPost.id === 'string' && currentPost.id.startsWith('gen_'));
    
    // Don't show Tally form for AI-generated posts
    if (isGenerated) {
        container.innerHTML = `
            <div style="background: rgba(155, 89, 182, 0.1); border: 1px solid rgba(155, 89, 182, 0.3); border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-size: 24px; margin-bottom: 12px;">🤖</div>
                <p style="color: #9b59b6; margin-bottom: 8px;"><strong>Post généré par IA</strong></p>
                <p style="font-size: 13px; color: #888;">Le formulaire de feedback sera disponible après validation et publication officielle.</p>
            </div>
        `;
        return;
    }
    
    const tallyFormId = (typeof CONFIG !== 'undefined' && CONFIG.tallyFormId) 
        ? CONFIG.tallyFormId 
        : 'b5dPb7';
    
    container.innerHTML = `
        <iframe 
            src="https://tally.so/embed/${tallyFormId}?transparentBackground=1&hideTitle=1&dynamicHeight=1&post=${currentPost.id}"
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

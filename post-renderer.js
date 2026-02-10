// Post Renderer Script
let currentPost = null;
let currentLang = 'fr';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = parseInt(urlParams.get('id'));
    
    if (!postId) {
        window.location.href = 'index.html';
        return;
    }
    
    currentPost = POSTS_DATA.find(p => p.id === postId);
    
    if (!currentPost) {
        alert('Publication non trouvée');
        window.location.href = 'index.html';
        return;
    }
    
    renderPost();
    loadTallyForm();
});

// Main render function
function renderPost() {
    // Update header
    document.getElementById('postTitle').textContent = `Post #${currentPost.id} — ${currentPost.theme}`;
    document.getElementById('postSubtitle').textContent = `${currentPost.date}/2026 • ${currentPost.formatLabel}`;
    
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
    }[currentPost.pilier];
    
    document.getElementById('postMeta').innerHTML = `
        <div style="margin-bottom: 20px;">
            <span class="badge ${pilierClass}">${currentPost.pilier}</span>
            <span class="badge badge-format">${currentPost.formatLabel}</span>
            <span class="badge badge-date">${currentPost.date}/26</span>
        </div>
        <h2>${currentPost.theme}</h2>
    `;
}

// Render editable caption
function renderCaption() {
    const caption = currentPost.captions[currentLang];
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
    // Can be used for export or other purposes
}

// Render visual based on format
function renderVisual() {
    const data = currentPost.data[currentLang];
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
            visualHTML = '<p>Format non supporté</p>';
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
            <div class="visual-title editable-text" contenteditable="true" data-field="title">${data.chartTitle}</div>
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
                    <div class="meme-text editable-text" contenteditable="true" data-field="topText">${data.topText}</div>
                </div>
            </div>
            <div class="meme-panel bottom">
                <div>
                    <div class="meme-emoji">😵‍💫</div>
                    <div class="meme-text editable-text" contenteditable="true" data-field="bottomText">${data.bottomText}</div>
                </div>
            </div>
        </div>
    `;
}

// Render Checklist
function renderChecklist(data) {
    const itemsHTML = data.items.map((item, i) => `
        <div class="check-item">
            <div class="check-box">✓</div>
            <span class="check-text editable-text" contenteditable="true" data-field="item-${i}">${item}</span>
        </div>
    `).join('');
    
    return `
        <div class="visual-inner">
            <div class="visual-title editable-text" contenteditable="true" data-field="title">${data.checklistTitle}</div>
            ${itemsHTML}
        </div>
    `;
}

// Render Poll
function renderPoll(data) {
    return `
        <div class="visual-inner" style="justify-content:center">
            <div class="poll-question editable-text" contenteditable="true" data-field="question">${data.question}</div>
            <div class="poll-option opt1 editable-text" contenteditable="true" data-field="option1">${data.options[0]}</div>
            <div class="poll-option opt2 editable-text" contenteditable="true" data-field="option2">${data.options[1]}</div>
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
        link.download = `Scarlet_Mars2026_Post${currentPost.id}_${currentPost.format}_${currentLang.toUpperCase()}.png`;
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

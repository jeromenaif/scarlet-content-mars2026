// AI Generator Script for Scarlet Content Factory
// Using Anthropic API (Claude)

let currentMode = null;
let generatedPosts = [];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkApiKeyStatus();
    loadSavedApiKey();
});

// API Key Management
function saveApiKey() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    
    if (!apiKey) {
        alert('⚠️ Veuillez entrer une clé API');
        return;
    }
    
    if (!apiKey.startsWith('sk-ant-')) {
        alert('⚠️ Format de clé invalide. La clé doit commencer par "sk-ant-"');
        return;
    }
    
    localStorage.setItem('anthropic_api_key', apiKey);
    checkApiKeyStatus();
    alert('✅ Clé API enregistrée avec succès !');
}

function loadSavedApiKey() {
    const savedKey = localStorage.getItem('anthropic_api_key');
    if (savedKey) {
        document.getElementById('apiKeyInput').value = savedKey;
    }
}

function checkApiKeyStatus() {
    const apiKey = localStorage.getItem('anthropic_api_key');
    const statusElement = document.getElementById('apiStatus');
    
    if (apiKey) {
        statusElement.className = 'api-status configured';
        statusElement.innerHTML = '✅ API configurée';
    } else {
        statusElement.className = 'api-status not-configured';
        statusElement.innerHTML = '❌ API non configurée';
    }
}

function getApiKey() {
    const apiKey = localStorage.getItem('anthropic_api_key');
    if (!apiKey) {
        alert('⚠️ Veuillez configurer votre clé API Anthropic d\'abord');
        return null;
    }
    return apiKey;
}

// Mode Selection
function selectMode(mode) {
    currentMode = mode;
    
    // Update UI
    document.querySelectorAll('.mode-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    // Show appropriate form
    showGenerationForm(mode);
}

// Show Generation Forms
function showGenerationForm(mode) {
    const formsContainer = document.getElementById('generationForms');
    
    let formHTML = '';
    
    switch(mode) {
        case 'full':
            formHTML = `
                <div class="config-section">
                    <h3>🚀 Génération Complète du Mois</h3>
                    
                    <div class="form-group">
                        <label>Mois à générer</label>
                        <select class="form-input" id="monthSelect">
                            <option value="avril-2026">Avril 2026</option>
                            <option value="mai-2026">Mai 2026</option>
                            <option value="juin-2026">Juin 2026</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Nombre de posts</label>
                        <select class="form-input" id="postCount">
                            <option value="4">4 posts</option>
                            <option value="6" selected>6 posts</option>
                            <option value="8">8 posts</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Options</label>
                        <div class="checkbox-group">
                            <div class="checkbox-item">
                                <input type="checkbox" id="analyzeHistory" checked>
                                <label for="analyzeHistory">Analyser les performances passées</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="belgianTrends" checked>
                                <label for="belgianTrends">Rechercher tendances belges</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="respectPiliers" checked>
                                <label for="respectPiliers">Équilibrer les 3 piliers</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="varyFormats" checked>
                                <label for="varyFormats">Varier les formats</label>
                            </div>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary" onclick="generateFull()">
                        🚀 Générer ${document.getElementById('postCount')?.value || 6} posts
                    </button>
                </div>
            `;
            break;
            
        case 'ideation':
            formHTML = `
                <div class="config-section">
                    <h3>💡 Assistant d'Idéation</h3>
                    
                    <div class="form-group">
                        <label>Thème ou sujet</label>
                        <input 
                            type="text" 
                            class="form-input" 
                            id="themeInput"
                            placeholder="Ex: Vacances d'été, Rentrée scolaire, Saint-Nicolas..."
                        >
                    </div>
                    
                    <div class="form-group">
                        <label>Pilier à mettre en avant (optionnel)</label>
                        <select class="form-input" id="pilierSelect">
                            <option value="">Tous les piliers</option>
                            <option value="Bon Marché">💰 Bon Marché</option>
                            <option value="Qualité">⭐ Qualité</option>
                            <option value="Transparence">🔍 Transparence</option>
                        </select>
                    </div>
                    
                    <button class="btn btn-primary" onclick="generateIdeation()">
                        💡 Générer 3 angles créatifs
                    </button>
                </div>
            `;
            break;
            
        case 'improve':
            formHTML = `
                <div class="config-section">
                    <h3>✨ Améliorer un Post Existant</h3>
                    
                    <div class="form-group">
                        <label>Sélectionnez un post</label>
                        <select class="form-input" id="postSelect">
                            ${POSTS_DATA.map(post => `
                                <option value="${post.id}">
                                    Post #${post.id} - ${post.theme} (${post.pilier})
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Que souhaitez-vous améliorer ?</label>
                        <div class="checkbox-group">
                            <div class="checkbox-item">
                                <input type="checkbox" id="improveEngagement" checked>
                                <label for="improveEngagement">Augmenter l'engagement</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="improveClarity" checked>
                                <label for="improveClarity">Améliorer la clarté</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="improveTone">
                                <label for="improveTone">Ajuster le tone of voice</label>
                            </div>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary" onclick="generateImprovement()">
                        ✨ Générer 3 variantes améliorées
                    </button>
                </div>
            `;
            break;
    }
    
    formsContainer.innerHTML = formHTML;
}

// Generate Full Month
async function generateFull() {
    const apiKey = getApiKey();
    if (!apiKey) return;
    
    const month = document.getElementById('monthSelect').value;
    const postCount = parseInt(document.getElementById('postCount').value);
    const options = {
        analyzeHistory: document.getElementById('analyzeHistory').checked,
        belgianTrends: document.getElementById('belgianTrends').checked,
        respectPiliers: document.getElementById('respectPiliers').checked,
        varyFormats: document.getElementById('varyFormats').checked
    };
    
    showLoading(`Génération de ${postCount} posts pour ${month}...`);
    
    try {
        // Analyze history
        const insights = analyzeHistory();
        
        // Build prompt
        const prompt = buildFullGenerationPrompt(month, postCount, options, insights);
        
        // Call API
        const result = await callClaudeAPI(apiKey, prompt);
        
        // Parse and display results
        displayGeneratedPosts(result, 'full');
        
    } catch (error) {
        showError(`Erreur lors de la génération: ${error.message}`);
    }
}

// Generate Ideation
async function generateIdeation() {
    const apiKey = getApiKey();
    if (!apiKey) return;
    
    const theme = document.getElementById('themeInput').value.trim();
    if (!theme) {
        alert('⚠️ Veuillez entrer un thème');
        return;
    }
    
    const pilier = document.getElementById('pilierSelect').value;
    
    showLoading(`Génération d'angles créatifs pour "${theme}"...`);
    
    try {
        const insights = analyzeHistory();
        const prompt = buildIdeationPrompt(theme, pilier, insights);
        const result = await callClaudeAPI(apiKey, prompt);
        displayGeneratedPosts(result, 'ideation');
    } catch (error) {
        showError(`Erreur lors de la génération: ${error.message}`);
    }
}

// Generate Improvement
async function generateImprovement() {
    const apiKey = getApiKey();
    if (!apiKey) return;
    
    const postId = parseInt(document.getElementById('postSelect').value);
    const post = POSTS_DATA.find(p => p.id === postId);
    
    const improvements = {
        engagement: document.getElementById('improveEngagement').checked,
        clarity: document.getElementById('improveClarity').checked,
        tone: document.getElementById('improveTone').checked
    };
    
    showLoading(`Amélioration du Post #${postId}...`);
    
    try {
        const insights = analyzeHistory();
        const prompt = buildImprovementPrompt(post, improvements, insights);
        const result = await callClaudeAPI(apiKey, prompt);
        displayGeneratedPosts(result, 'improve');
    } catch (error) {
        showError(`Erreur lors de la génération: ${error.message}`);
    }
}

// Analyze History
function analyzeHistory() {
    // Analyze POSTS_DATA to extract insights
    const totalPosts = POSTS_DATA.length;
    
    // Count by pilier
    const pilierCounts = {};
    POSTS_DATA.forEach(post => {
        pilierCounts[post.pilier] = (pilierCounts[post.pilier] || 0) + 1;
    });
    
    // Count by format
    const formatCounts = {};
    POSTS_DATA.forEach(post => {
        formatCounts[post.format] = (formatCounts[post.format] || 0) + 1;
    });
    
    // Extract themes
    const themes = POSTS_DATA.map(post => post.theme);
    
    return {
        totalPosts,
        pilierDistribution: pilierCounts,
        formatDistribution: formatCounts,
        recentThemes: themes,
        insights: `
            - Format le plus utilisé: ${Object.keys(formatCounts).sort((a,b) => formatCounts[b] - formatCounts[a])[0]}
            - Pilier le plus représenté: ${Object.keys(pilierCounts).sort((a,b) => pilierCounts[b] - pilierCounts[a])[0]}
            - Thèmes récents: ${themes.slice(0, 3).join(', ')}
        `
    };
}

// Build Prompts
function buildFullGenerationPrompt(month, postCount, options, insights) {
    return `Tu es un expert en création de contenu pour Scarlet, opérateur télécom belge.

CONTEXTE:
- Mois à générer: ${month}
- Nombre de posts: ${postCount}
- Analyser historique: ${options.analyzeHistory ? 'Oui' : 'Non'}
- Tendances belges: ${options.belgianTrends ? 'Oui' : 'Non'}

HISTORIQUE DES PERFORMANCES:
${insights.insights}

LES 3 PILIERS SCARLET (à équilibrer):
1. BON MARCHÉ: "Pourquoi payer plus?" / "Smart et pas cher"
2. QUALITÉ: "Réseau Proximus, prix Scarlet" / "Ça marche, point barre"
3. TRANSPARENCE: "Il n'y a pas de mais chez Scarlet" / "Ce que vous voyez = ce que vous payez"

FORMATS DISPONIBLES:
- pie_chart (Camembert avec légendes)
- meme (Format 2 panels avec emojis)
- checklist (Liste à cocher)
- poll (Question avec 2 options)

RÈGLES ABSOLUES:
- JAMAIS utiliser le mot "mais"
- Ton chouette et léger (jamais corporate)
- Belge et proche (comme un pote qui donne un bon plan)
- JAMAIS mentionner la 5G, Proximus directement, ou prétendre être le moins cher

Génère ${postCount} concepts de posts complets au format JSON suivant:

\`\`\`json
[
  {
    "date": "JJ/MM",
    "format": "meme|pie_chart|checklist|poll",
    "pilier": "Bon Marché|Qualité|Transparence",
    "theme": "Thème court et accrocheur",
    "data": {
      "fr": { ... },
      "nl": { ... }
    },
    "captions": {
      "fr": "Caption FR (2-3 phrases max)",
      "nl": "Caption NL (2-3 phrases max)"
    },
    "reasoning": "Pourquoi ce concept va performer"
  }
]
\`\`\`

IMPORTANT: Retourne UNIQUEMENT le JSON, sans texte avant ou après.`;
}

function buildIdeationPrompt(theme, pilier, insights) {
    const pilierFilter = pilier ? `Focus sur le pilier: ${pilier}` : 'Explore différents piliers';
    
    return `Tu es un expert en création de contenu pour Scarlet, opérateur télécom belge.

THÈME DEMANDÉ: ${theme}
${pilierFilter}

LES 3 PILIERS SCARLET:
1. BON MARCHÉ: "Pourquoi payer plus?" / "Smart et pas cher"
2. QUALITÉ: "Réseau Proximus, prix Scarlet" / "Ça marche, point barre"
3. TRANSPARENCE: "Il n'y a pas de mais chez Scarlet" / "Ce que vous voyez = ce que vous payez"

HISTORIQUE:
${insights.insights}

Propose 3 angles créatifs DIFFÉRENTS pour traiter ce thème.
Pour chaque angle, fournis un concept de post complet.

Génère 3 concepts au format JSON suivant:

\`\`\`json
[
  {
    "angle": "Description de l'angle créatif",
    "format": "meme|pie_chart|checklist|poll",
    "pilier": "Bon Marché|Qualité|Transparence",
    "theme": "Thème court",
    "data": {
      "fr": { ... },
      "nl": { ... }
    },
    "captions": {
      "fr": "Caption FR",
      "nl": "Caption NL"
    }
  }
]
\`\`\`

IMPORTANT: Retourne UNIQUEMENT le JSON, sans texte avant ou après.`;
}

function buildImprovementPrompt(post, improvements, insights) {
    return `Tu es un expert en création de contenu pour Scarlet, opérateur télécom belge.

POST ACTUEL À AMÉLIORER:
- Thème: ${post.theme}
- Format: ${post.format}
- Pilier: ${post.pilier}
- Caption FR: ${post.captions.fr}

AMÉLIORATIONS DEMANDÉES:
${improvements.engagement ? '- Augmenter l\'engagement' : ''}
${improvements.clarity ? '- Améliorer la clarté' : ''}
${improvements.tone ? '- Ajuster le tone of voice' : ''}

HISTORIQUE DES PERFORMANCES:
${insights.insights}

Crée 3 VARIANTES AMÉLIORÉES de ce post.
Garde le même format et pilier, mais propose des variations créatives.

Génère 3 variantes au format JSON suivant:

\`\`\`json
[
  {
    "variation": "Description de ce qui change",
    "format": "${post.format}",
    "pilier": "${post.pilier}",
    "theme": "Thème (peut être légèrement modifié)",
    "data": {
      "fr": { ... },
      "nl": { ... }
    },
    "captions": {
      "fr": "Caption FR améliorée",
      "nl": "Caption NL améliorée"
    }
  }
]
\`\`\`

IMPORTANT: Retourne UNIQUEMENT le JSON, sans texte avant ou après.`;
}

// Call Claude API
async function callClaudeAPI(apiKey, prompt) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            messages: [{
                role: 'user',
                content: prompt
            }]
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erreur API');
    }
    
    const data = await response.json();
    const content = data.content[0].text;
    
    // Extract JSON from response
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        throw new Error('Format de réponse invalide');
    }
    
    const jsonText = jsonMatch[1] || jsonMatch[0];
    return JSON.parse(jsonText);
}

// Display Generated Posts
function displayGeneratedPosts(posts, mode) {
    generatedPosts = posts;
    
    const output = document.getElementById('generationOutput');
    const outputContent = document.getElementById('outputContent');
    const outputTitle = document.getElementById('outputTitle');
    
    let title = '';
    switch(mode) {
        case 'full':
            title = `📝 ${posts.length} Posts Générés`;
            break;
        case 'ideation':
            title = `💡 3 Angles Créatifs`;
            break;
        case 'improve':
            title = `✨ 3 Variantes Améliorées`;
            break;
    }
    
    outputTitle.textContent = title;
    
    const postsHTML = posts.map((post, index) => {
        const formatEmoji = {
            'pie_chart': '📊',
            'meme': '😂',
            'checklist': '✅',
            'poll': '📊'
        }[post.format] || '📄';
        
        const pilierClass = {
            'Bon Marché': 'badge-green',
            'Qualité': 'badge-blue',
            'Transparence': 'badge-yellow'
        }[post.pilier] || 'badge-format';
        
        return `
            <div class="preview-card">
                <div class="preview-visual">${formatEmoji}</div>
                <div class="preview-content">
                    <div class="preview-meta">
                        ${post.date ? `<span class="badge badge-date">${post.date}</span>` : ''}
                        <span class="badge ${pilierClass}">${post.pilier}</span>
                        <span class="badge badge-format">${post.format}</span>
                    </div>
                    <div class="preview-theme">${post.theme}</div>
                    ${post.angle ? `<div style="font-size: 12px; color: #0DCAF0; margin-bottom: 8px;">💡 ${post.angle}</div>` : ''}
                    ${post.variation ? `<div style="font-size: 12px; color: #FFB800; margin-bottom: 8px;">✨ ${post.variation}</div>` : ''}
                    ${post.reasoning ? `<div style="font-size: 12px; color: #2ed573; margin-bottom: 8px;">🎯 ${post.reasoning}</div>` : ''}
                    <div class="preview-caption">${post.captions.fr}</div>
                    <div class="preview-actions">
                        <button class="btn btn-sm btn-primary" onclick="viewPostDetail(${index})">
                            👀 Prévisualiser
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="editPost(${index})">
                            ✏️ Éditer
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    outputContent.innerHTML = `
        <div class="preview-grid">
            ${postsHTML}
        </div>
        <div style="margin-top: 30px; text-align: center;">
            <button class="btn btn-primary" onclick="downloadAsJSON()">
                💾 Télécharger en JSON
            </button>
            <button class="btn btn-secondary" onclick="copyToClipboard()">
                📋 Copier le code
            </button>
        </div>
    `;
    
    output.classList.add('visible');
    output.scrollIntoView({ behavior: 'smooth' });
}

// View Post Detail
function viewPostDetail(index) {
    const post = generatedPosts[index];
    alert(`Prévisualisation complète à venir !\n\nThème: ${post.theme}\nFormat: ${post.format}\nPilier: ${post.pilier}\n\nCaption FR:\n${post.captions.fr}`);
    // TODO: Create modal with full preview
}

// Edit Post
function editPost(index) {
    const post = generatedPosts[index];
    const newCaption = prompt('Modifier le caption FR:', post.captions.fr);
    if (newCaption) {
        generatedPosts[index].captions.fr = newCaption;
        displayGeneratedPosts(generatedPosts, currentMode);
    }
}

// Download as JSON
function downloadAsJSON() {
    const dataStr = JSON.stringify(generatedPosts, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scarlet-posts-${Date.now()}.json`;
    link.click();
}

// Copy to Clipboard
function copyToClipboard() {
    const code = `// Ajoutez ces posts à POSTS_DATA dans assets/data.js:\n\n${JSON.stringify(generatedPosts, null, 2)}`;
    navigator.clipboard.writeText(code).then(() => {
        alert('✅ Code copié dans le presse-papier !\n\nCollez-le dans assets/data.js');
    });
}

// UI Helpers
function showLoading(message) {
    const output = document.getElementById('generationOutput');
    const outputContent = document.getElementById('outputContent');
    const outputTitle = document.getElementById('outputTitle');
    
    outputTitle.textContent = '⏳ Génération en cours...';
    outputContent.innerHTML = `
        <div class="status-message">
            <div class="status-icon">🤖</div>
            <div>${message}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 100%;"></div>
            </div>
            <div style="margin-top: 16px; font-size: 13px; color: var(--text-muted);">
                Cela peut prendre 10-30 secondes...
            </div>
        </div>
    `;
    
    output.classList.add('visible');
    output.scrollIntoView({ behavior: 'smooth' });
}

function showError(message) {
    const output = document.getElementById('generationOutput');
    const outputContent = document.getElementById('outputContent');
    const outputTitle = document.getElementById('outputTitle');
    
    outputTitle.textContent = '❌ Erreur';
    outputContent.innerHTML = `
        <div class="status-message">
            <div class="status-icon">⚠️</div>
            <div style="color: #ff6b6b;">${message}</div>
            <button class="btn btn-secondary" style="margin-top: 20px;" onclick="location.reload()">
                🔄 Réessayer
            </button>
        </div>
    `;
    
    output.classList.add('visible');
}

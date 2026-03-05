// AI Generator Script for Scarlet Content Factory
// Using Anthropic API (Claude)
// Version 2.0 - Avec historique et export Excel

let currentMode = null;
let generatedPosts = [];

// Cloudflare Worker proxy URL (clé API sécurisée côté serveur)
const PROXY_URL = 'https://scarlet-proxy.naifjerome.workers.dev';

// Storage key for localStorage
const STORAGE_KEY = 'scarlet_generated_posts_history';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // API is now handled by Cloudflare Worker - always configured
    const statusElement = document.getElementById('apiStatus');
    if (statusElement) {
        statusElement.className = 'api-status configured';
        statusElement.innerHTML = '✅ API configurée';
    }
    
    // Load history count
    updateHistoryBadge();
});

// Get dynamic month options based on current date
function getMonthOptions() {
    const months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const options = [];
    
    // Generate 6 months starting from current month
    for (let i = 0; i < 6; i++) {
        const monthIndex = (currentMonth + i) % 12;
        const year = currentYear + Math.floor((currentMonth + i) / 12);
        const value = `${months[monthIndex].toLowerCase()}-${year}`;
        const label = `${months[monthIndex]} ${year}`;
        options.push({ value, label });
    }
    
    return options;
}

// Update history badge
function updateHistoryBadge() {
    const history = getGenerationHistory();
    const badge = document.getElementById('historyBadge');
    if (badge) {
        badge.textContent = history.length;
        badge.style.display = history.length > 0 ? 'inline-flex' : 'none';
    }
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
            const monthOptions = getMonthOptions();
            formHTML = `
                <div class="config-section">
                    <h3>🚀 Génération Complète du Mois</h3>
                    
                    <div class="form-group">
                        <label>Mois à générer</label>
                        <select class="form-input" id="monthSelect">
                            ${monthOptions.map((opt, i) => `
                                <option value="${opt.value}" ${i === 0 ? 'selected' : ''}>${opt.label}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Nombre de posts (entre 1 et 15)</label>
                        <input 
                            type="number" 
                            class="form-input" 
                            id="postCount"
                            value="6"
                            min="1"
                            max="15"
                            placeholder="Ex: 6"
                            oninput="updateGenerateButton()"
                        >
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
                    
                    <button class="btn btn-primary" id="generateBtn" onclick="generateFull()">
                        🚀 Générer 6 posts
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
            
        case 'history':
            formHTML = buildHistoryView();
            break;
    }
    
    formsContainer.innerHTML = formHTML;
}

// Build History View
function buildHistoryView() {
    const history = getGenerationHistory();
    
    if (history.length === 0) {
        return `
            <div class="config-section">
                <h3>📚 Historique des Générations</h3>
                <div class="status-message">
                    <div class="status-icon">📭</div>
                    <div>Aucune génération sauvegardée</div>
                    <p style="margin-top: 12px; color: var(--text-muted); font-size: 14px;">
                        Vos prochaines générations apparaîtront ici.
                    </p>
                </div>
            </div>
        `;
    }
    
    const historyItems = history.map((item, index) => `
        <div class="history-item" style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; margin-bottom: 12px; border-left: 4px solid var(--scarlet-red);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong>${item.month || 'Génération'}</strong>
                <span style="font-size: 12px; color: var(--text-muted);">${new Date(item.timestamp).toLocaleDateString('fr-BE')} à ${new Date(item.timestamp).toLocaleTimeString('fr-BE', {hour: '2-digit', minute: '2-digit'})}</span>
            </div>
            <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
                ${item.posts.length} posts • Mode: ${item.mode || 'full'}
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="btn btn-sm btn-primary" onclick="loadFromHistory(${index})">
                    👀 Voir
                </button>
                <button class="btn btn-sm btn-secondary" onclick="exportHistoryToExcel(${index})">
                    📊 Excel
                </button>
                <button class="btn btn-sm btn-secondary" onclick="downloadHistoryAsJSON(${index})">
                    💾 JSON
                </button>
                <button class="btn btn-sm" style="background: rgba(255,107,107,0.2); color: #ff6b6b;" onclick="deleteFromHistory(${index})">
                    🗑️ Supprimer
                </button>
            </div>
        </div>
    `).join('');
    
    return `
        <div class="config-section">
            <h3>📚 Historique des Générations</h3>
            <div style="margin-bottom: 20px;">
                <button class="btn btn-secondary" onclick="clearAllHistory()" style="background: rgba(255,107,107,0.2); color: #ff6b6b;">
                    🗑️ Tout effacer
                </button>
            </div>
            ${historyItems}
        </div>
    `;
}

// Update generate button label dynamically
function updateGenerateButton() {
    const input = document.getElementById('postCount');
    const btn = document.getElementById('generateBtn');
    if (!input || !btn) return;
    
    const val = parseInt(input.value);
    if (val >= 1 && val <= 15) {
        btn.textContent = `🚀 Générer ${val} post${val > 1 ? 's' : ''}`;
        btn.disabled = false;
    } else {
        btn.textContent = '⚠️ Entre 1 et 15 posts';
        btn.disabled = true;
    }
}

// ==================== STORAGE FUNCTIONS ====================

function getGenerationHistory() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error loading history:', e);
        return [];
    }
}

function saveToHistory(posts, mode, month) {
    try {
        const history = getGenerationHistory();
        history.unshift({
            timestamp: Date.now(),
            mode: mode,
            month: month,
            posts: posts
        });
        // Keep only last 20 generations
        if (history.length > 20) {
            history.pop();
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        updateHistoryBadge();
    } catch (e) {
        console.error('Error saving to history:', e);
    }
}

function loadFromHistory(index) {
    const history = getGenerationHistory();
    if (history[index]) {
        generatedPosts = history[index].posts;
        displayGeneratedPosts(generatedPosts, history[index].mode || 'full');
    }
}

function deleteFromHistory(index) {
    if (confirm('Supprimer cette génération ?')) {
        const history = getGenerationHistory();
        history.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        updateHistoryBadge();
        showGenerationForm('history');
    }
}

function clearAllHistory() {
    if (confirm('Supprimer tout l\'historique ?')) {
        localStorage.removeItem(STORAGE_KEY);
        updateHistoryBadge();
        showGenerationForm('history');
    }
}

function downloadHistoryAsJSON(index) {
    const history = getGenerationHistory();
    if (history[index]) {
        const dataStr = JSON.stringify(history[index].posts, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `scarlet-posts-${history[index].month || 'export'}-${Date.now()}.json`;
        link.click();
    }
}

function exportHistoryToExcel(index) {
    const history = getGenerationHistory();
    if (history[index]) {
        exportToExcel(history[index].posts, history[index].month);
    }
}

// ==================== EXCEL EXPORT ====================

function exportToExcel(posts, monthLabel) {
    // Create workbook data
    const headers = [
        'N°', 'Date', 'Thème', 'Format', 'Pilier', 'Angle/Reasoning',
        'Caption FR', 'Caption NL', 'Texte visuel FR', 'Texte visuel NL', 'Brief visuel'
    ];
    
    const rows = posts.map((post, idx) => {
        // Extract visual text
        let visualFR = '';
        let visualNL = '';
        let brief = '';
        
        const dataFR = post.data?.fr || {};
        const dataNL = post.data?.nl || {};
        
        if (Array.isArray(dataFR)) {
            visualFR = dataFR.join('\n');
            visualNL = Array.isArray(dataNL) ? dataNL.join('\n') : '';
        } else {
            const frParts = [];
            const nlParts = [];
            
            for (const [key, value] of Object.entries(dataFR)) {
                if (key === 'image_description') {
                    brief = value;
                } else if (Array.isArray(value)) {
                    if (value[0] && typeof value[0] === 'object') {
                        value.forEach(seg => frParts.push(`${seg.label || ''}: ${seg.value || ''}%`));
                    } else {
                        frParts.push(value.join('\n'));
                    }
                } else if (typeof value === 'string') {
                    frParts.push(value);
                }
            }
            
            for (const [key, value] of Object.entries(dataNL)) {
                if (key !== 'image_description') {
                    if (Array.isArray(value)) {
                        if (value[0] && typeof value[0] === 'object') {
                            value.forEach(seg => nlParts.push(`${seg.label || ''}: ${seg.value || ''}%`));
                        } else {
                            nlParts.push(value.join('\n'));
                        }
                    } else if (typeof value === 'string') {
                        nlParts.push(value);
                    }
                }
            }
            
            visualFR = frParts.join('\n');
            visualNL = nlParts.join('\n');
        }
        
        return [
            idx + 1,
            post.date || '',
            post.theme || '',
            post.format || '',
            post.pilier || '',
            post.angle || post.reasoning || post.variation || '',
            post.captions?.fr || '',
            post.captions?.nl || '',
            visualFR,
            visualNL,
            brief
        ];
    });
    
    // Build CSV content (Excel-compatible with BOM for UTF-8)
    const BOM = '\uFEFF';
    const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.map(cell => {
            // Escape quotes and wrap in quotes if contains special chars
            const str = String(cell).replace(/"/g, '""');
            return `"${str}"`;
        }).join(';'))
    ].join('\n');
    
    // Download as CSV (Excel will open it correctly)
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Scarlet_Posts_${monthLabel || 'export'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

// ==================== GENERATION FUNCTIONS ====================

// Generate Full Month
async function generateFull() {
    const postCountInput = document.getElementById('postCount');
    const postCount = parseInt(postCountInput.value);
    
    if (!postCount || postCount < 1 || postCount > 15) {
        alert('⚠️ Veuillez entrer un nombre de posts entre 1 et 15');
        return;
    }
    const month = document.getElementById('monthSelect').value;
    const monthLabel = document.getElementById('monthSelect').options[document.getElementById('monthSelect').selectedIndex].text;
    
    const options = {
        analyzeHistory: document.getElementById('analyzeHistory').checked,
        belgianTrends: document.getElementById('belgianTrends').checked,
        respectPiliers: document.getElementById('respectPiliers').checked,
        varyFormats: document.getElementById('varyFormats').checked
    };
    
    showLoading(`Génération de ${postCount} posts pour ${monthLabel}...`);
    
    try {
        // Analyze history
        const insights = analyzeHistory();
        
        // Build prompt
        const prompt = buildFullGenerationPrompt(month, postCount, options, insights);
        
        // Call API
        const result = await callClaudeAPI(prompt);
        
        // Save to history
        saveToHistory(result, 'full', monthLabel);
        
        // Parse and display results
        displayGeneratedPosts(result, 'full');
        
    } catch (error) {
        showError(`Erreur lors de la génération: ${error.message}`);
    }
}

// Generate Ideation
async function generateIdeation() {
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
        const result = await callClaudeAPI(prompt);
        
        // Save to history
        saveToHistory(result, 'ideation', `Idéation: ${theme}`);
        
        displayGeneratedPosts(result, 'ideation');
    } catch (error) {
        showError(`Erreur lors de la génération: ${error.message}`);
    }
}

// Generate Improvement
async function generateImprovement() {
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
        const result = await callClaudeAPI(prompt);
        
        // Save to history
        saveToHistory(result, 'improve', `Amélioration: ${post.theme}`);
        
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
1. BON MARCHÉ: "Pourquoi payer plus?" / "Smart et pas cher" / "Tu paies ce dont tu as besoin"
2. QUALITÉ: "Ça marche, point barre" / "Un vrai service client"
3. TRANSPARENCE: "Il n'y a pas de mais chez Scarlet" / L'offre est simple, lisible, sans surprise tarifaire

FORMATS DISPONIBLES:
- pie_chart (Camembert avec légendes)
- meme (Format 2 panels avec emojis)
- checklist (Liste à cocher)
- poll (Question avec 2 options)

RÈGLES ABSOLUES:
- JAMAIS utiliser le mot "mais"
- Ton chouette et léger (jamais corporate)
- Belge et proche (comme un pote qui donne un bon plan)
- JAMAIS mentionner la 5G, Proximus, ou prétendre être le moins cher
- JAMAIS utiliser "Ce que tu vois = ce que tu paies" → utiliser "Tu paies ce dont tu as besoin"
- JAMAIS "data illimitées" dans un post générique (seulement sur un abonnement spécifique)
- JAMAIS "Ton prix ? Fixe" → utiliser "Ton prix ? Stable"
- JAMAIS prétendre que tout est compris
- Tout argument doit être 100% défendable pour Scarlet (ex: ne pas dire que le WiFi est plus simple si ce n'est pas le cas)
- La transparence Scarlet = clarté de l'offre tarifaire, PAS la longueur des contrats

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
1. BON MARCHÉ: "Pourquoi payer plus?" / "Smart et pas cher" / "Tu paies ce dont tu as besoin"
2. QUALITÉ: "Ça marche, point barre" / "Un vrai service client"
3. TRANSPARENCE: "Il n'y a pas de mais chez Scarlet" / L'offre est simple, lisible, sans surprise tarifaire

RÈGLES ABSOLUES:
- JAMAIS "mais", "Ce que tu vois = ce que tu paies", "data illimitées" en générique, "Ton prix ? Fixe"
- JAMAIS mentionner la 5G, Proximus, ou prétendre être le moins cher
- Tout argument doit être 100% défendable pour Scarlet spécifiquement
- Ton chouette, léger, belge et proche

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

// Call Claude API via Cloudflare Worker proxy
async function callClaudeAPI(prompt) {
    const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
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
    
    const data = await response.json();
    
    if (!response.ok || data.error) {
        throw new Error(`Erreur API (${response.status}): ${JSON.stringify(data.error || data)}`);
    }
    
    if (!data.content || !data.content[0]) {
        throw new Error(`Réponse inattendue du serveur: ${JSON.stringify(data)}`);
    }
    const content = data.content[0].text;
    
    // Extract JSON from response
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        throw new Error('Format de réponse invalide');
    }
    
    let jsonText = jsonMatch[1] || jsonMatch[0];
    
    // Clean up common JSON issues
    jsonText = cleanJSON(jsonText);
    
    try {
        return JSON.parse(jsonText);
    } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw JSON:', jsonText);
        
        // Try more aggressive cleaning
        jsonText = aggressiveJSONClean(jsonText);
        
        try {
            return JSON.parse(jsonText);
        } catch (secondError) {
            throw new Error(`JSON invalide généré par l'API. Veuillez réessayer.`);
        }
    }
}

// Clean common JSON formatting issues
function cleanJSON(jsonStr) {
    return jsonStr
        // Remove trailing commas before ] or }
        .replace(/,\s*([\]}])/g, '$1')
        // Fix unescaped quotes inside strings (basic attempt)
        .replace(/:\s*"([^"]*?)"\s*([,\}])/g, (match, content, ending) => {
            // Escape any unescaped quotes inside the content
            const escaped = content.replace(/(?<!\\)"/g, '\\"');
            return `: "${escaped}"${ending}`;
        })
        // Remove any control characters except newlines in strings
        .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, ' ')
        // Trim whitespace
        .trim();
}

// More aggressive JSON cleaning for stubborn cases
function aggressiveJSONClean(jsonStr) {
    // Try to extract just the array
    const arrayMatch = jsonStr.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!arrayMatch) {
        throw new Error('Impossible de trouver un tableau JSON valide');
    }
    
    let cleaned = arrayMatch[0];
    
    // Replace problematic characters
    cleaned = cleaned
        // Smart quotes to regular quotes
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'")
        // Remove zero-width characters
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        // Fix escaped newlines in strings
        .replace(/\n/g, '\\n')
        // Remove trailing commas
        .replace(/,\s*([\]}])/g, '$1');
    
    return cleaned;
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
        <div style="margin-top: 30px; text-align: center; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="exportToExcel(generatedPosts, '${new Date().toLocaleDateString('fr-BE')}')">
                📊 Télécharger Excel
            </button>
            <button class="btn btn-secondary" onclick="downloadAsJSON()">
                💾 Télécharger JSON
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

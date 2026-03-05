// AI Generator Script for Scarlet Content Factory
// Using Anthropic API (Claude)
// Version 4.0 - Chargement dynamique du FEEDBACK_LOG.md depuis GitHub

let currentMode = null;
let generatedPosts = [];
let SCARLET_CONTEXT = ''; // Sera chargé dynamiquement

// Cloudflare Worker proxy URL (clé API sécurisée côté serveur)
const PROXY_URL = 'https://scarlet-proxy.naifjerome.workers.dev';

// URL du FEEDBACK_LOG.md sur GitHub (raw content)
// IMPORTANT: Adapter cette URL à ton repo GitHub
const FEEDBACK_LOG_URL = 'https://raw.githubusercontent.com/jeromenaif/scarlet-content-mars2026/main/FEEDBACK_LOG.md';

// Storage key for localStorage
const STORAGE_KEY = 'scarlet_generated_posts_history';

// Cache pour le FEEDBACK_LOG (évite de recharger à chaque action)
const FEEDBACK_CACHE_KEY = 'scarlet_feedback_log_cache';
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 heure

// Fallback context si le chargement échoue
const FALLBACK_CONTEXT = `
## LES 3 PILIERS SCARLET

1. **BON MARCHÉ** : "Pourquoi payer plus?" / "Smart et pas cher" / "Tu paies ce dont tu as besoin"
2. **QUALITÉ** : "Ça marche, point barre" / "Un vrai service client"
3. **TRANSPARENCE** : "Il n'y a pas de mais chez Scarlet" / L'offre est simple, lisible, sans surprise tarifaire

## RÈGLES ABSOLUES
- JAMAIS utiliser le mot "mais"
- JAMAIS mentionner la 5G, Proximus, ou prétendre être le moins cher
- JAMAIS "Ce que tu vois = ce que tu paies" → utiliser "Tu paies ce dont tu as besoin"
- JAMAIS "data illimitées" en générique
- Ton chouette, léger, belge et proche

## FORMATS DISPONIBLES
- meme (meilleur performer ~4%)
- poll (très bon ~4%)
- pie_chart (bon ~2%)
- checklist (modéré ~0.7%)

## OBJECTIFS MÉDIA
- REACH : pour événements calendaires, brand awareness
- ENGAGEMENT : pour memes comportementaux, polls, posts interactifs
- Ratio recommandé : 60% Engagement / 40% Reach
`;

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', async () => {
    // Show loading state for context
    updateContextStatus('loading');
    
    // API is now handled by Cloudflare Worker - always configured
    const statusElement = document.getElementById('apiStatus');
    if (statusElement) {
        statusElement.className = 'api-status configured';
        statusElement.innerHTML = '✅ API configurée';
    }
    
    // Load FEEDBACK_LOG dynamically
    await loadFeedbackLog();
    
    // Load history count
    updateHistoryBadge();
});

// ==================== DYNAMIC FEEDBACK_LOG LOADING ====================

async function loadFeedbackLog() {
    try {
        // Check cache first
        const cached = getCachedFeedbackLog();
        if (cached) {
            SCARLET_CONTEXT = cached;
            updateContextStatus('cached');
            console.log('📋 FEEDBACK_LOG chargé depuis le cache');
            return;
        }
        
        // Fetch from GitHub
        console.log('📥 Chargement du FEEDBACK_LOG depuis GitHub...');
        const response = await fetch(FEEDBACK_LOG_URL, {
            cache: 'no-store' // Force fresh fetch
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const markdown = await response.text();
        
        // Store in context
        SCARLET_CONTEXT = markdown;
        
        // Cache it
        cacheFeedbackLog(markdown);
        
        updateContextStatus('loaded');
        console.log('✅ FEEDBACK_LOG chargé avec succès depuis GitHub');
        
    } catch (error) {
        console.error('❌ Erreur chargement FEEDBACK_LOG:', error);
        
        // Use fallback
        SCARLET_CONTEXT = FALLBACK_CONTEXT;
        updateContextStatus('fallback');
        console.log('⚠️ Utilisation du contexte de secours');
    }
}

function getCachedFeedbackLog() {
    try {
        const cached = localStorage.getItem(FEEDBACK_CACHE_KEY);
        if (!cached) return null;
        
        const { content, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        if (age > CACHE_DURATION_MS) {
            // Cache expired
            localStorage.removeItem(FEEDBACK_CACHE_KEY);
            return null;
        }
        
        return content;
    } catch (e) {
        return null;
    }
}

function cacheFeedbackLog(content) {
    try {
        localStorage.setItem(FEEDBACK_CACHE_KEY, JSON.stringify({
            content,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.warn('Impossible de mettre en cache le FEEDBACK_LOG');
    }
}

function updateContextStatus(status) {
    // Create or update status indicator
    let indicator = document.getElementById('contextStatus');
    
    if (!indicator) {
        // Create indicator next to API status
        const apiStatus = document.getElementById('apiStatus');
        if (apiStatus) {
            indicator = document.createElement('div');
            indicator.id = 'contextStatus';
            indicator.style.cssText = 'margin-top: 8px; font-size: 12px; padding: 6px 12px; border-radius: 6px;';
            apiStatus.parentNode.insertBefore(indicator, apiStatus.nextSibling);
        }
    }
    
    if (indicator) {
        switch(status) {
            case 'loading':
                indicator.innerHTML = '⏳ Chargement des règles...';
                indicator.style.background = 'rgba(255, 193, 7, 0.2)';
                indicator.style.color = '#ffc107';
                break;
            case 'loaded':
                indicator.innerHTML = '📋 Règles à jour (GitHub)';
                indicator.style.background = 'rgba(40, 167, 69, 0.2)';
                indicator.style.color = '#28a745';
                break;
            case 'cached':
                indicator.innerHTML = '📋 Règles chargées (cache)';
                indicator.style.background = 'rgba(23, 162, 184, 0.2)';
                indicator.style.color = '#17a2b8';
                break;
            case 'fallback':
                indicator.innerHTML = '⚠️ Règles de secours';
                indicator.style.background = 'rgba(255, 107, 107, 0.2)';
                indicator.style.color = '#ff6b6b';
                break;
        }
    }
}

// Force refresh of FEEDBACK_LOG
async function refreshFeedbackLog() {
    localStorage.removeItem(FEEDBACK_CACHE_KEY);
    updateContextStatus('loading');
    await loadFeedbackLog();
}

// ==================== REST OF THE CODE (unchanged logic) ====================

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
                    
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <button class="btn btn-primary" id="generateBtn" onclick="generateFull()">
                            🚀 Générer 6 posts
                        </button>
                        <button class="btn btn-secondary" onclick="refreshFeedbackLog()" title="Recharger les règles depuis GitHub">
                            🔄 Actualiser règles
                        </button>
                    </div>
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
    // Create workbook data - with objectif_media
    const headers = [
        'N°', 'Date', 'Thème', 'Format', 'Pilier', 'Objectif Média', 'Justification Objectif',
        'Angle/Reasoning', 'Caption FR', 'Caption NL', 'Texte visuel FR', 'Texte visuel NL', 'Brief visuel'
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
            post.objectif_media || '',
            post.objectif_justification || '',
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

// ==================== PROMPT BUILDERS ====================

function buildFullGenerationPrompt(month, postCount, options, insights) {
    return `Tu es un expert en création de contenu pour Scarlet, opérateur télécom belge.

## RÈGLES ET CONTEXTE SCARLET (FEEDBACK_LOG)
${SCARLET_CONTEXT}

## CONTEXTE DE GÉNÉRATION
- Mois à générer: ${month}
- Nombre de posts: ${postCount}
- Analyser historique: ${options.analyzeHistory ? 'Oui' : 'Non'}
- Tendances belges: ${options.belgianTrends ? 'Oui' : 'Non'}

## HISTORIQUE DES PERFORMANCES
${insights.insights}

## INSTRUCTIONS SPÉCIFIQUES

1. **Ratio objectifs média** : Sur ${postCount} posts, environ ${Math.round(postCount * 0.6)} en ENGAGEMENT et ${Math.round(postCount * 0.4)} en REACH
2. **Varier les formats** : Privilégier meme et poll (meilleurs performers)
3. **Éviter les répétitions** : Ne pas réutiliser les thèmes récents
4. **Posts calendaires** : Si événement du mois, ajouter un angle comportemental

## FORMAT DE SORTIE

Génère ${postCount} concepts de posts complets au format JSON suivant:

\`\`\`json
[
  {
    "date": "JJ/MM",
    "format": "meme|pie_chart|checklist|poll",
    "pilier": "Bon Marché|Qualité|Transparence",
    "theme": "Thème court et accrocheur",
    "objectif_media": "REACH|ENGAGEMENT",
    "objectif_justification": "Pourquoi cet objectif pour ce contenu (1 phrase)",
    "data": {
      "fr": { ... },
      "nl": { ... }
    },
    "captions": {
      "fr": "Caption FR (2-3 phrases max, avec CTA adapté à l'objectif)",
      "nl": "Caption NL (2-3 phrases max, avec CTA adapté à l'objectif)"
    },
    "reasoning": "Pourquoi ce concept va performer + KPI attendu"
  }
]
\`\`\`

IMPORTANT: 
- Retourne UNIQUEMENT le JSON, sans texte avant ou après.
- Pour les posts ENGAGEMENT : inclure un CTA interactif (question, tag un ami, etc.)
- Pour les posts REACH : inclure un CTA plus soft (découvrir, visiter, etc.)
- RESPECTE TOUTES LES RÈGLES du FEEDBACK_LOG ci-dessus`;
}

function buildIdeationPrompt(theme, pilier, insights) {
    const pilierFilter = pilier ? `Focus sur le pilier: ${pilier}` : 'Explore différents piliers';
    
    return `Tu es un expert en création de contenu pour Scarlet, opérateur télécom belge.

## RÈGLES ET CONTEXTE SCARLET (FEEDBACK_LOG)
${SCARLET_CONTEXT}

## THÈME DEMANDÉ: ${theme}
${pilierFilter}

## HISTORIQUE
${insights.insights}

## INSTRUCTIONS

Propose 3 angles créatifs DIFFÉRENTS pour traiter ce thème.
Pour chaque angle :
- Varie le format (meme, poll, checklist, pie_chart)
- Indique l'objectif média recommandé (REACH ou ENGAGEMENT)
- Justifie pourquoi cet angle va performer

Génère 3 concepts au format JSON suivant:

\`\`\`json
[
  {
    "angle": "Description de l'angle créatif",
    "format": "meme|pie_chart|checklist|poll",
    "pilier": "Bon Marché|Qualité|Transparence",
    "theme": "Thème court",
    "objectif_media": "REACH|ENGAGEMENT",
    "objectif_justification": "Pourquoi cet objectif",
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

IMPORTANT: 
- Retourne UNIQUEMENT le JSON, sans texte avant ou après.
- RESPECTE TOUTES LES RÈGLES du FEEDBACK_LOG ci-dessus`;
}

function buildImprovementPrompt(post, improvements, insights) {
    return `Tu es un expert en création de contenu pour Scarlet, opérateur télécom belge.

## RÈGLES ET CONTEXTE SCARLET (FEEDBACK_LOG)
${SCARLET_CONTEXT}

## POST ACTUEL À AMÉLIORER
- Thème: ${post.theme}
- Format: ${post.format}
- Pilier: ${post.pilier}
- Caption FR: ${post.captions.fr}

## AMÉLIORATIONS DEMANDÉES
${improvements.engagement ? '- Augmenter l\'engagement (ajouter CTA interactif, question, etc.)' : ''}
${improvements.clarity ? '- Améliorer la clarté (simplifier le message)' : ''}
${improvements.tone ? '- Ajuster le tone of voice (plus belge, plus complice)' : ''}

## HISTORIQUE DES PERFORMANCES
${insights.insights}

## INSTRUCTIONS

Crée 3 VARIANTES AMÉLIORÉES de ce post.
Pour chaque variante :
- Indique l'objectif média recommandé
- Explique ce qui change et pourquoi c'est mieux

Génère 3 variantes au format JSON suivant:

\`\`\`json
[
  {
    "variation": "Description de ce qui change et pourquoi",
    "format": "${post.format}",
    "pilier": "${post.pilier}",
    "theme": "Thème (peut être légèrement modifié)",
    "objectif_media": "REACH|ENGAGEMENT",
    "objectif_justification": "Pourquoi cet objectif",
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

IMPORTANT: 
- Retourne UNIQUEMENT le JSON, sans texte avant ou après.
- RESPECTE TOUTES LES RÈGLES du FEEDBACK_LOG ci-dessus`;
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
        
        // Objectif média badge
        const objectifBadge = post.objectif_media === 'ENGAGEMENT' 
            ? '<span class="badge" style="background: #9b59b6; color: white;">💬 ENGAGEMENT</span>'
            : '<span class="badge" style="background: #3498db; color: white;">🎯 REACH</span>';
        
        return `
            <div class="preview-card">
                <div class="preview-visual">${formatEmoji}</div>
                <div class="preview-content">
                    <div class="preview-meta">
                        ${post.date ? `<span class="badge badge-date">${post.date}</span>` : ''}
                        <span class="badge ${pilierClass}">${post.pilier}</span>
                        <span class="badge badge-format">${post.format}</span>
                        ${objectifBadge}
                    </div>
                    <div class="preview-theme">${post.theme}</div>
                    ${post.objectif_justification ? `<div style="font-size: 11px; color: #95a5a6; margin-bottom: 6px;">📌 ${post.objectif_justification}</div>` : ''}
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
    alert(`Prévisualisation complète à venir !\n\nThème: ${post.theme}\nFormat: ${post.format}\nPilier: ${post.pilier}\nObjectif: ${post.objectif_media || 'Non défini'}\n\nCaption FR:\n${post.captions.fr}`);
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

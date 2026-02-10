# 🎨 Scarlet Content Factory - Mini-Site

Mini-site professionnel pour gérer, prévisualiser et collecter des feedbacks sur les publications Scarlet Mars 2026.

## ✨ Fonctionnalités

### Page d'accueil (`index.html`)
- **Vue d'ensemble** : Grille de toutes les publications
- **Statistiques** : Répartition par pilier (Bon Marché, Qualité, Transparence)
- **Filtres dynamiques** : Par pilier, par format
- **Navigation fluide** : Accès direct à chaque publication

### Page de détail (`post.html`)
- **Visuel interactif** : Prévisualisation du post
- **Bilingue** : Switch FR/NL instantané
- **Export PNG** : Téléchargement haute qualité
- **Commentaires** : Formulaire Tally intégré (aucun compte requis)

### Formats supportés
- 📊 **Pie Chart** : Graphiques en camembert
- 😂 **Meme** : Format meme 2 panels
- ✅ **Checklist** : Listes à cocher
- 📊 **Poll** : Sondages à 2 options

---

## 🚀 Déploiement

### Option A : GitHub Pages (Recommandé)

#### 1. Créer un repo GitHub
```bash
# Depuis le dossier scarlet-content-site/
git init
git add .
git commit -m "Initial commit - Scarlet Content Factory"
```

#### 2. Push vers GitHub
```bash
# Créer un repo sur github.com (ex: scarlet-content-mars2026)
git remote add origin https://github.com/jeromenaif/scarlet-content-mars2026.git
git branch -M main
git push -u origin main
```

#### 3. Activer GitHub Pages
1. Sur GitHub → Settings
2. Pages (menu gauche)
3. Source : **main** branch, **/ (root)**
4. Save

**Votre site sera accessible à :**
```
https://jeromenaif.github.io/scarlet-content-mars2026/
```

---

### Option B : Utilisation locale

Simplement ouvrir `index.html` dans Chrome :
```bash
open index.html  # macOS
start index.html # Windows
```

---

## 📁 Structure du projet

```
scarlet-content-site/
├── index.html              # Page d'accueil (grille)
├── post.html               # Page de détail
├── assets/
│   ├── styles.css          # Styles globaux
│   ├── data.js             # Données des posts
│   └── post-renderer.js    # Logique de rendu
└── README.md               # Ce fichier
```

---

## 🎯 Workflow d'utilisation

### Pour le Content Manager (vous)

1. **Partager le lien**
   ```
   https://jeromenaif.github.io/scarlet-content-mars2026/
   ```

2. **Recevoir les feedbacks**
   - Notifications email automatiques
   - Dashboard Tally : https://tally.so

3. **Export des visuels**
   - Cliquez sur un post
   - Changez de langue si nécessaire
   - Cliquez "Exporter en PNG"

### Pour votre collègue graphiste

1. **Ouvrir le site**
   - Parcourir la grille des posts
   - Cliquer sur un post pour le détailler

2. **Laisser un feedback**
   - Scrollez jusqu'aux commentaires
   - Remplissez le formulaire (aucun compte requis)
   - Envoyez

3. **Pas besoin de créer de compte** ✨

---

## ⚙️ Configuration

### Tally.so (déjà configuré)

Le Form ID est déjà configuré dans `assets/data.js` :
```javascript
tallyFormId: 'b5dPb7'
```

Si vous devez le changer :
1. Éditez `assets/data.js`
2. Ligne 86 : `tallyFormId: 'NOUVEAU_ID'`

### Ajouter des publications

Éditez `assets/data.js` et ajoutez un objet dans `POSTS_DATA` :
```javascript
{
    id: 7,
    date: '05/04',
    format: 'meme',
    pilier: 'Bon Marché',
    theme: 'Votre thème',
    formatLabel: '😂 Meme',
    data: {
        fr: { /* ... */ },
        nl: { /* ... */ }
    },
    captions: {
        fr: "Caption FR",
        nl: "Caption NL"
    }
}
```

---

## 🎨 Personnalisation

### Couleurs

Éditez `assets/styles.css`, section `:root` :
```css
:root {
    --scarlet-red: #E61F13;
    --scarlet-orange: #F7931E;
    /* ... */
}
```

### Formats

Ajouter un nouveau format :
1. Ajoutez la logique dans `assets/post-renderer.js`
2. Créez une fonction `renderVotreFormat(data)`
3. Ajoutez le case dans `renderVisual()`

---

## 📊 Avantages vs fichier HTML unique

| Critère | HTML unique | Mini-site |
|---------|-------------|-----------|
| Navigation | Sélecteur 6 boutons | Grille visuelle infinie |
| URL partageable | Non (besoin de spécifier post) | Oui, 1 URL par post |
| Statistiques | Non | Oui |
| Filtres | Non | Oui |
| Scalabilité | ❌ Limite 10-15 posts | ✅ Illimité |
| Mobile friendly | ⚠️ Moyen | ✅ Optimisé |
| Bookmarks | ❌ | ✅ Par post |
| SEO | ❌ | ✅ |

---

## 🔧 Maintenance

### Mettre à jour les posts
```bash
# 1. Éditez assets/data.js
# 2. Commit et push
git add assets/data.js
git commit -m "Ajout Post #7"
git push

# Le site se met à jour automatiquement (GitHub Pages)
```

### Ajouter des fonctionnalités
- **Export multiple** : Ajouter un bouton "Export All"
- **Historique des versions** : Intégrer un système de versioning
- **Analytics** : Ajouter Google Analytics

---

## 🆘 Troubleshooting

### Le formulaire Tally ne s'affiche pas
1. Vérifiez que le formulaire est **publié** sur Tally.so
2. Vérifiez le Form ID dans `assets/data.js`
3. Testez le formulaire standalone : `https://tally.so/r/b5dPb7`

### Les visuels ne s'exportent pas
1. Vérifiez que `html2canvas` est chargé (ligne 7 de post.html)
2. Testez dans un autre navigateur
3. Désactivez les bloqueurs de publicité

### Erreur 404 sur GitHub Pages
1. Attendez 2-3 minutes après activation
2. Vérifiez que le repo est **public**
3. Settings → Pages → Vérifiez la source

---

## 💡 Prochaines évolutions possibles

- [ ] Dashboard admin avec stats
- [ ] Export PDF de toutes les publications
- [ ] Historique des feedbacks par post
- [ ] Calendrier de publication intégré
- [ ] Mode preview (avant publication)
- [ ] API pour intégration avec d'autres outils

---

## 📞 Support

Questions ? Contactez-moi sur GitHub : @jeromenaif

---

**Made with ❤️ for Scarlet Content Factory**  
*Version 1.0 - Février 2026*

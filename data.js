// Données des publications Scarlet Mars 2026
const POSTS_DATA = [
    {
        id: 1,
        date: '02/03',
        format: 'pie_chart',
        pilier: 'Bon Marché',
        theme: 'Le groupe WhatsApp familial',
        formatLabel: '📊 Pie Chart',
        data: {
            fr: {
                chartTitle: 'Le groupe familial',
                legends: ['Répondre aux messages', 'Mettre en sourdine'],
                percentages: [5, 95]
            },
            nl: {
                chartTitle: 'De familiegroep',
                legends: ['Berichten beantwoorden', 'Op stil zetten'],
                percentages: [5, 95]
            }
        },
        captions: {
            fr: "On adore notre famille. On adore aussi le bouton \"sourdine\" 🔇\n\nChez Scarlet, tu ne paies que pour ce que tu utilises vraiment. Si seulement on pouvait faire pareil avec les notifications du groupe familial...",
            nl: "We zijn gek op onze familie. We zijn ook gek op de \"stil\"-knop 🔇\n\nBij Scarlet betaal je enkel voor wat je echt gebruikt. Konden we dat ook met de meldingen van de familiegroep..."
        }
    },
    {
        id: 2,
        date: '09/03',
        format: 'meme',
        pilier: 'Qualité',
        theme: 'Le WiFi chez les parents',
        formatLabel: '😂 Meme',
        data: {
            fr: {
                topText: 'Moi expliquant que j\'ai besoin du WiFi pour travailler',
                bottomText: 'Mes parents pensant que je scrolle sur Instagram'
            },
            nl: {
                topText: 'Ik leg uit dat ik WiFi nodig heb om te werken',
                bottomText: 'Mijn ouders denken dat ik op Instagram scroll'
            }
        },
        captions: {
            fr: "La vraie lutte des visites familiales : convaincre tes parents que tu travailles vraiment 💻\n\nAvec Scarlet, ton forfait mobile fonctionne partout en Belgique. Même quand le WiFi de maman décide de faire des siennes.",
            nl: "De echte strijd bij familiebezoek: je ouders overtuigen dat je echt aan het werken bent 💻\n\nMet Scarlet werkt je mobiel abonnement overal in België. Ook als mama's WiFi het laat afweten."
        }
    },
    {
        id: 3,
        date: '16/03',
        format: 'checklist',
        pilier: 'Transparence',
        theme: 'Les choses qui durent longtemps',
        formatLabel: '✅ Checklist',
        data: {
            fr: {
                checklistTitle: 'Choses qui durent éternellement',
                items: [
                    'Les diamants',
                    'Votre abonnement Scarlet',
                    'Ce mail que vous devez envoyer'
                ]
            },
            nl: {
                checklistTitle: 'Dingen die eeuwig duren',
                items: [
                    'Diamanten',
                    'Je Scarlet-abonnement',
                    'Die mail die je moet versturen'
                ]
            }
        },
        captions: {
            fr: "Certaines choses ne changent jamais. Et chez Scarlet, c'est une bonne nouvelle 💎\n\nTon prix ? Fixe. Tes conditions? Claires. Tes données? Illimitées. Pas de surprise, juste ce que tu vois.",
            nl: "Sommige dingen veranderen nooit. En bij Scarlet is dat goed nieuws 💎\n\nJe prijs? Vast. Je voorwaarden? Helder. Je data? Onbeperkt. Geen verrassingen, gewoon wat je ziet."
        }
    },
    {
        id: 4,
        date: '23/03',
        format: 'poll',
        pilier: 'Bon Marché',
        theme: 'Netflix vs Dodo',
        formatLabel: '📊 Poll',
        data: {
            fr: {
                question: 'Il est minuit. Tu fais quoi?',
                options: [
                    '😴 Dormir (bonne décision)',
                    '📺 "Juste un épisode" (mensonge)'
                ]
            },
            nl: {
                question: 'Het is middernacht. Wat doe je?',
                options: [
                    '😴 Slapen (goede beslissing)',
                    '📺 "Nog één aflevering" (leugen)'
                ]
            }
        },
        captions: {
            fr: "Soyons honnêtes, on connaît tous la réponse 😅\n\nAvec Scarlet, stream autant que tu veux sans exploser ton budget. Parce qu'on sait que \"juste un épisode\" n'existe pas vraiment.",
            nl: "Laten we eerlijk zijn, we kennen allemaal het antwoord 😅\n\nMet Scarlet stream zoveel je wilt zonder je budget te springen. Want we weten dat \"nog één aflevering\" niet echt bestaat."
        }
    },
    {
        id: 5,
        date: '27/03',
        format: 'meme',
        pilier: 'Transparence',
        theme: 'Scarlet vs autres opérateurs',
        formatLabel: '😂 Meme',
        data: {
            fr: {
                topText: 'Autres opérateurs: "Des frais peuvent s\'appliquer*"',
                bottomText: 'Scarlet: Ce que tu vois, c\'est ce que tu paies'
            },
            nl: {
                topText: 'Andere operators: "Kosten kunnen van toepassing zijn*"',
                bottomText: 'Scarlet: Wat je ziet, is wat je betaalt'
            }
        },
        captions: {
            fr: "Pas de petites lignes, pas d'astérisques louches, pas de \"conditions générales de 47 pages\" 📄\n\nChez Scarlet, tout est transparent. Le prix que tu vois? C'est le prix que tu paies. Point.",
            nl: "Geen kleine lettertjes, geen verdachte asterisken, geen \"algemene voorwaarden van 47 pagina's\" 📄\n\nBij Scarlet is alles transparant. De prijs die je ziet? Dat is de prijs die je betaalt. Punt."
        }
    },
    {
        id: 6,
        date: '30/03',
        format: 'meme',
        pilier: 'Transparence',
        theme: 'Changement d\'heure',
        formatLabel: '😂 Meme',
        data: {
            fr: {
                topText: 'Perdre 1h de sommeil à cause du changement d\'heure',
                bottomText: 'Mais pas un centime avec Scarlet'
            },
            nl: {
                topText: '1 uur slaap verliezen door de tijdsverandering',
                bottomText: 'Maar geen cent bij Scarlet'
            }
        },
        captions: {
            fr: "Ce matin, on a tous perdu 1 heure de sommeil ⏰😴\n\nLa bonne nouvelle? Ton abonnement Scarlet ne te fait rien perdre. Pas de frais cachés, pas de mauvaises surprises. Juste du repos bien mérité (enfin, presque).",
            nl: "Vanochtend verloren we allemaal 1 uur slaap ⏰😴\n\nHet goede nieuws? Je Scarlet-abonnement heeft je niks doen verliezen. Geen verborgen kosten, geen slechte verrassingen. Gewoon welverdiende rust (nou ja, bijna)."
        }
    }
];

// Configuration
const CONFIG = {
    tallyFormId: 'b5dPb7',
    pilierColors: {
        'Bon Marché': '#2BA600',
        'Qualité': '#0066CC',
        'Transparence': '#FFB800'
    },
    chartColors: ['#2BA600', '#E61F13', '#FFB800', '#0066CC']
};

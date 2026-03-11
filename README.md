# TALAN

## !isNoTaTALAN

TALAN est un jeu de labyrinthe en génération procédurale développé en HTML, CSS et JavaScript. 
Le joueur choisit un personnage, sélectionne un mode de difficulté, puis doit explorer un labyrinthe généré dynamiquement 
pour récupérer une clé et atteindre la porte de sortie avant la fin du temps imparti.

Le projet propose une ambiance arcade/cyber inspirée du rétro-gaming, avec interface animée, effets sonores, modales de jeu et progression par niveaux.

## Concept

Chaque partie génère un nouveau labyrinthe de manière procédurale.
La génération repose sur un parcours aléatoire avec retour arrière, ce qui permet d'obtenir des labyrinthes différents à chaque lancement.

Objectif principal :

- récupérer la clé,
- éviter les dangers selon le mode choisi,
- atteindre la porte,
- terminer le niveau avant la fin du chronomètre.

## Technologies utilisées

- HTML5 pour la structure des écrans
- CSS3 pour le style, les animations et les modales
- JavaScript vanilla pour la logique de jeu
- Canvas API pour l'affichage du labyrinthe
- LocalStorage pour mémoriser le personnage et le mode choisis
- Express pour la partie API présente dans le dépôt

## Fonctionnalités

- génération procédurale du labyrinthe
- sélection du personnage depuis l'écran d'accueil
- trois modes de difficulté
- minuterie et progression par niveaux
- système de clé et de porte de sortie
- ennemis et pièges dans les modes avancés
- modales de pause, défaite, victoire, règles et tutoriel
- ambiance sonore et écran d'introduction animé

## Modes de jeu

### Mode Normal

- labyrinthe progressif sur 5 niveaux
- récupération directe de la clé
- difficulté croissante à chaque niveau
- temps de base : 20 secondes

### Mode Hardcore

- mode plus exigeant avec ennemis
- la clé est cachée dans un coffre
- présence de coffres bonus/malus et d'éléments hostiles
- augmentation de la taille du labyrinthe et de la pression au fil des niveaux
- temps de base : 30 secondes

### Mode Infinity

- enchaînement des niveaux sans fin
- le labyrinthe grandit progressivement
- objectif : aller le plus loin possible avant de perdre
- temps de base : 20 secondes

## Contrôles

- utiliser les flèches du clavier pour déplacer le personnage
- bouton pause pour suspendre la partie
- bouton son pour activer ou couper la musique
- bouton quitter pour revenir ou sortir de la session de jeu

## Structure du projet

```text
.
├── api/        # API Express
├── client/     # Jeu côté front
│   ├── html/   # Pages HTML
│   ├── js/     # Logique JavaScript
│   ├── styles/ # Feuilles de style
│   ├── public/ # Images et sons
│   └── functions/
└── README.md
```

## Lancer le projet

### 1. Lancer le client

Le jeu front-end se lance depuis l'écran d'accueil :

- ouvrir `client/html/welcome.html` avec une extension comme Live Server dans VS Code,
- ou servir le dossier `client` avec un serveur statique local.

Le dépôt contient déjà une configuration Live Server sur le port `5501`.

### 2. Lancer l'API Express

Depuis le dossier `api` :

```bash
npm install
npm start
```

L'API démarre par défaut sur le port `3000`.

## Parcours joueur

1. choisir un personnage,
2. sélectionner un mode de jeu,
3. attendre le chargement,
4. consulter les règles et le tutoriel,
5. récupérer la clé,
6. rejoindre la porte avant la fin du temps.

## Pistes d'amélioration

- ajout de nouveaux personnages
- sauvegarde des scores et meilleurs temps
- niveaux spéciaux ou événements aléatoires
- connexion entre le client et une API de score
- compatibilité mobile ou support manette

## Auteur

Projet réalisé dans le cadre d'un jeu de labyrinthe procédural en JavaScript.

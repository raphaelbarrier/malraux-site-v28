# Lycée André-Malraux — version de consolidation V26

Ce dossier `site/` est **la seule racine à publier**. Le dossier `configuration-supabase/` ne doit pas être publié.

## Publication recommandée
1. Conserver une sauvegarde de l’ancien dépôt et de la configuration Vercel.
2. Créer un **nouveau dépôt GitHub** et envoyer **le contenu de `site/`** à sa racine (index.html doit être à la racine).
3. Importer ce dépôt dans un **nouveau projet Vercel**, framework `Other`, Root Directory `./`, sans commande de build.
4. Vérifier les pages Accueil, Notre histoire, Ressources, Formations, Événements et Espace Prof avant de changer de domaine.

## Administration / événements
`cms-config.js` contient volontairement des champs vides. La publication dynamique nécessite une instance Supabase configurée et les politiques RLS appropriées. **Aucun compte n'est précréé.** Ne jamais placer la clé `service_role` dans un fichier public.
Les scripts SQL sont fournis à part, à examiner avant toute exécution ; ne pas les lancer sans vérifier les tables existantes, afin d’éviter des conflits ou pertes de données.

## Contenus historiques
Cette archive consolide les fichiers disponibles de V26. Elle ne prouve pas que tous les documents, images et archives de l'ancien site ont été récupérés. Des liens externes peuvent subsister dans les pages héritées.

## Note
Le site est un prototype non officiel, à valider avec l’établissement avant une publication officielle.

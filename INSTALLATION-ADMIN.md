# Activer l'administration (gratuit, ~15 min)

1. Créer un compte sur supabase.com, puis « New project » (offre Free).
2. SQL Editor > coller `configuration-supabase/01-installation.sql` > Run.
3. Authentication > Users > « Add user » : créez votre compte (email + mot de passe).
4. Exécutez la dernière ligne du SQL (commentée) avec votre email : vous devenez super administrateur.
5. Project Settings > API : copiez **Project URL** et la clé **anon public** dans `cms-config.js`
   (jamais la clé `service_role`). Poussez sur GitHub : Vercel redéploie seul.
6. Sur `/admin.html`, onglet « Comptes et rôles » : attribuez les rôles. Les autres comptes se créent
   via Authentication > Users > « Invite user ».

## Qui peut faire quoi
| Rôle | Textes | Événements |
|---|---|---|
| Rédacteur (enseignant, rédacteur) | brouillon | brouillon seulement |
| Éditeur (secrétariat, communication, intendance, resp. pédagogique) | brouillon + publier | créer, publier, supprimer |
| Administrateur (direction, super admin, admin du site) | tout | tout + gestion des comptes |

## Maintenance
- Supabase Free met le projet en pause après ~7 jours sans activité : se connecter une fois par semaine à /admin.html suffit.
- Pour ajouter un texte modifiable : ajouter une entrée (key, label, selector, default) dans `cms-fields.json`.

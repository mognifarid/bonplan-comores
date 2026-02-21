

## Remplir automatiquement les informations du profil

### Probleme actuel
La page Profil utilise `useState()` au lieu de `useEffect()` pour initialiser les champs du formulaire avec les donnees du profil. Cela signifie que les champs restent vides meme si l'utilisateur a renseigne ses informations lors de l'inscription.

### Solution
Remplacer le bloc `useState(() => { ... })` (lignes 32-39) par un `useEffect` qui se declenche quand les donnees du profil sont chargees. Cela remplira automatiquement les champs "Nom complet", "Telephone" et "Date de naissance" avec les valeurs enregistrees a l'inscription.

### Details techniques

**Fichier modifie : `src/pages/Profile.tsx`**

1. Ajouter `useEffect` dans les imports React (ligne 1)
2. Remplacer le bloc incorrect :
   ```typescript
   // AVANT (incorrect)
   useState(() => {
     if (profile) { ... }
   });
   
   // APRES (correct)
   useEffect(() => {
     if (profile) {
       setFullName(profile.full_name || '');
       setPhone(profile.phone || '');
       setBirthDate(profile.birth_date || '');
     }
   }, [profile]);
   ```

Ce changement est minimal et corrige le bug existant sans modifier la structure de la page.


# Déploiement

Cette application est composée de deux parties :

- **Frontend** (React + Vite) → déployé sur Netlify
- **Backend** (Express + MCP) → déployé sur Render (ou autre serveur Node.js long-running)

> Important : Netlify ne peut exécuter que le frontend. Le backend MCP nécessite un processus Node.js long-running, donc il faut un hébergeur comme Render, Railway ou un VPS.

---

## 1. Déployer le backend sur Render

1. Crée un compte sur https://render.com
2. Connecte ton repo GitHub/GitLab
3. Crée un nouveau **Web Service** avec les paramètres :
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm run server`
   - **Plan** : au minimum `Standard` (le plan gratuit s’endort après 15 min d’inactivité)
4. Ajoute les variables d’environnement dans l’onglet **Environment** :

   ```env
   OPENAI_API_KEY=sk-...
   STEPHANE_MCP_URL=https://mcp.supabase.com/mcp?project_ref=xcttosztgpqbwuwoivim&read_only=true
   CAL_MCP_URL=https://mcp.supabase.com/mcp?project_ref=jkzkflgtkrmuzmprtaak&read_only=true
   TERRASSES_MCP_URL=https://mcp.supabase.com/mcp?project_ref=aaaubviijkfsxmjjtfns&read_only=true
   CORS_ORIGIN=https://<ton-site-netlify>.netlify.app
   ```

5. Récupère l’URL publique du backend, par exemple :
   ```
   https://maximus-mcp-backend.onrender.com
   ```

---

## 2. Déployer le frontend sur Netlify

1. Crée un compte sur https://netlify.com
2. Importe le repo GitHub/GitLab
3. Netlify détectera automatiquement `netlify.toml` :
   - **Build command** : `npm run build`
   - **Publish directory** : `out`
4. Ajoute la variable d’environnement dans l’interface Netlify :

   ```env
   VITE_API_URL=https://maximus-mcp-backend.onrender.com
   ```

5. Déclenche le déploiement.

---

## 3. Variables d’environnement récapitulatif

### Backend (Render)

- `OPENAI_API_KEY` : clé API OpenAI
- `STEPHANE_MCP_URL` : URL MCP Supabase pour stephane
- `CAL_MCP_URL` : URL MCP Supabase pour cal
- `TERRASSES_MCP_URL` : URL MCP Supabase pour terrasses
- `CORS_ORIGIN` : URL Netlify du frontend (sécurité CORS)
- `PORT` : Render définit généralement 10000 automatiquement

### Frontend (Netlify)

- `VITE_API_URL` : URL publique du backend Render

---

## 4. Points de vigilance

- Les connexions MCP via `mcp-remote` peuvent nécessiter une authentification OAuth. Sur un serveur distant, il faut s’assurer que cette étape est possible ou que les tokens sont persistants.
- Le plan gratuit Render met le serveur en veille après 15 minutes d’inactivité. La première requête après la veille peut prendre 30-60 secondes.
- Garde `OPENAI_API_KEY` et les URLs MCP côté backend uniquement. Ne les mets jamais dans le code frontend.

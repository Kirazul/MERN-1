# MERN TP1 – Ma première API Express

Mini API blog en Node.js + Express (données en mémoire).

## Lancer

```bash
npm install
npm run dev   # http://localhost:3000 (recharge auto)
```

## Endpoints

| Méthode | URL | Réponse |
|---|---|---|
| GET | `/` | message d'accueil |
| GET | `/api/articles` | liste (`?author=` pour filtrer) |
| GET | `/api/articles/:id` | un article (404 sinon) |
| POST | `/api/articles` | crée `{title, author}` → 201 |
| GET | `/about` | infos appli |
| GET | `/api/users` | liste (`?name=` pour filtrer) |
| GET | `/api/users/:id` | un membre (404 sinon) |
| POST | `/contact` | `{email, message}` → 200 |

## Fichiers

- `app.js` – serveur Express
- `notions-js.js` – exercices JS (`node notions-js.js`)
- `captures/` – preuves Postman
- `compte-rendu/rapport-TP1.pdf` – rapport (`node compte-rendu/generer-pdf.js` pour le régénérer)

Mohamed Jegham – 5ème DS G3 – EPS 2026/2027

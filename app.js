const express = require("express");

// Création de l'instance du serveur HTTP
const serveur = express();
const PORT = 3000;

// Interprète les corps de requête envoyés en JSON (rend req.body utilisable)
serveur.use(express.json());

// Route d'accueil : simple message de présentation
serveur.get("/", (requete, reponse) => {
  reponse.json({ message: "Salut, ici l'API du journal" });
});

// ---------------------------------------------------------------------------
// Données gardées en mémoire vive (tout repart de zéro au redémarrage).
// Une base MongoDB prendra le relais à la séance 3.
// ---------------------------------------------------------------------------
const billetsBlog = [
  { id: 1, title: "Bienvenue sur le blog", author: "Admin" },
  { id: 2, title: "Mon premier serveur Express", author: "Aya" },
  { id: 3, title: "Tester une API avec Postman", author: "Aya" },
];

// GET /api/articles -> tous les billets
// GET /api/articles?author=Aya -> uniquement ceux de l'auteur demandé
serveur.get("/api/articles", (requete, reponse) => {
  const { author: auteurDemande } = requete.query;

  let selection = billetsBlog;
  if (auteurDemande) {
    selection = billetsBlog.filter((b) => b.author === auteurDemande);
  }
  reponse.json({ total: selection.length, articles: selection });
});

// GET /api/articles/2 -> le billet dont l'id vaut 2
serveur.get("/api/articles/:id", (requete, reponse) => {
  const identifiant = Number(requete.params.id); // l'URL fournit du texte : on le convertit
  const billet = billetsBlog.find((b) => b.id === identifiant);

  if (!billet) {
    return reponse.status(404).json({ error: `Article ${identifiant} introuvable` });
  }
  reponse.json(billet);
});

// Compteur pour les prochains identifiants (1, 2 et 3 déjà utilisés)
let prochainIdentifiant = 4;

// POST /api/articles -> ajoute un billet à partir de { "title": "...", "author": "..." }
serveur.post("/api/articles", (requete, reponse) => {
  const { title: titreRecu, author: auteurRecu } = requete.body;

  if (!titreRecu || !auteurRecu) {
    return reponse.status(400).json({ error: "Le titre et l'auteur sont obligatoires" });
  }

  const billetCree = { id: prochainIdentifiant, title: titreRecu, author: auteurRecu };
  prochainIdentifiant = prochainIdentifiant + 1;
  billetsBlog.push(billetCree);

  reponse.status(201).json({ message: "Article créé", article: billetCree });
});

// GET /about -> informations sur l'application
serveur.get("/about", (requete, reponse) => {
  reponse.json({ application: "API du blog", auteur: "Mohamed Aziz Mansour", version: "1.0.0" });
});

// Annuaire des membres (en mémoire, comme les articles)
const membres = [
  { id: 1, name: "Aya", email: "aya@example.com" },
  { id: 2, name: "Omar", email: "omar@example.com" },
  { id: 3, name: "Youssef", email: "youssef@example.com" },
];

// GET /api/users -> tous les membres
// GET /api/users?name=Aya -> membres filtrés par nom
serveur.get("/api/users", (requete, reponse) => {
  const { name: nomDemande } = requete.query;

  let selectionMembres = membres;
  if (nomDemande) {
    selectionMembres = membres.filter((m) => m.name === nomDemande);
  }
  reponse.json({ total: selectionMembres.length, users: selectionMembres });
});

// GET /api/users/2 -> le membre dont l'id vaut 2, sinon 404
serveur.get("/api/users/:id", (requete, reponse) => {
  const identifiant = Number(requete.params.id);
  const membre = membres.find((m) => m.id === identifiant);

  if (!membre) {
    return reponse.status(404).json({ error: `Utilisateur ${identifiant} introuvable` });
  }
  reponse.json(membre);
});

// POST /contact -> reçoit { "email": "...", "message": "..." }
serveur.post("/contact", (requete, reponse) => {
  const { email: courriel, message: contenu } = requete.body;

  if (!courriel || !contenu) {
    return reponse.status(400).json({ error: "L'email et le message sont obligatoires" });
  }
  reponse.status(200).json({ message: "Merci, votre message a bien été reçu" });
});

// Démarrage : le serveur écoute les requêtes sur le port choisi
serveur.listen(PORT, () => {
  console.log(`API en ligne sur http://localhost:${PORT}`);
});

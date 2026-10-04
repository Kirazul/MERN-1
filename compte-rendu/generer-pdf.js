// Construit rapport-TP1.html puis rapport-TP1.pdf (via Microsoft Edge)
// À lancer depuis la racine du projet :  node compte-rendu/generer-pdf.js
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const RACINE = path.join(__dirname, "..");
const PREUVES = path.join(RACINE, "captures");

// ---- À PERSONNALISER ------------------------------------------------------
const ETUDIANT = { nom: "Mohamed Jegham", groupe: "5ème DS G3" };
const DEPOT_GIT = "https://github.com/Kirazul/MERN-1";
// ---------------------------------------------------------------------------

const echapper = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const lireFichier = (f) => fs.readFileSync(path.join(RACINE, f), "utf8");
const blocCode = (s) => `<pre><code>${echapper(s.trim())}</code></pre>`;

const illustrationsManquantes = [];
function illustration(fichier, legende) {
  const chemin = path.join(PREUVES, fichier);
  if (!fs.existsSync(chemin)) {
    illustrationsManquantes.push(fichier);
    return `<div class="manquant">Illustration absente : captures/${fichier}</div>`;
  }
  const contenu = fs.readFileSync(chemin).toString("base64");
  return `<figure><img src="data:image/png;base64,${contenu}"><figcaption>${legende}</figcaption></figure>`;
}

// Découpe une route dans app.js : depuis "serveur.<methode>('<url>'" jusqu'au "});" qui la clôt
const sourceServeur = lireFichier("app.js");
function extraireRoute(debut) {
  const i = sourceServeur.indexOf(debut);
  if (i < 0) return `// introuvable : ${debut}`;
  const j = sourceServeur.indexOf("\n});", i);
  return sourceServeur.slice(i, j + 4);
}
function extraireBloc(debut, fin) {
  const i = sourceServeur.indexOf(debut);
  return sourceServeur.slice(i, sourceServeur.indexOf(fin, i) + fin.length);
}

const sortieNotions = execFileSync(process.execPath, ["notions-js.js"], {
  cwd: RACINE,
  encoding: "utf8",
});

const tableauStatuts = [
  ["GET", "/api/articles", "–", "200 OK", "Affichage de la collection : tout s'est bien passé.", "Capture1.PNG"],
  ["POST", "/api/articles", '{ "title": "Mon premier article", "author": "Jegham Mohamed" }', "201 Created", "Les deux champs fournis : le billet numéro 4 est ajouté.", "Capture2.PNG"],
  ["GET", "/api/articles/4", "–", "200 OK", "Le billet créé reste accessible tant que le processus tourne.", "Capture3.PNG"],
  ["POST", "/api/articles", '{ "title": "Sans auteur" }', "400 Bad Request", "Le champ <code>author</code> est absent : le contrôle bloque la demande.", "Capture4.PNG"],
  ["GET", "/api/articles/99", "–", "404 Not Found", "Aucun billet ne porte l'identifiant 99.", ""],
];

const extensions = [
  { titre: "1. GET /about", code: extraireRoute("serveur.get('/about'"),
    images: [["Capture6.PNG", "GET /about → 200 : le nom du service, son auteur et sa version."]] },
  { titre: "2. GET /api/users", code: extraireBloc("const membres", "];") + "\n\n" + extraireRoute("serveur.get('/api/users'"),
    images: [["Capture5.PNG", "GET /api/users → 200 : les trois membres stockés dans la constante <code>membres</code>."]] },
  { titre: "3. GET /api/users/:id", code: extraireRoute("serveur.get('/api/users/:id'"),
    images: [["Capture9.PNG", "Cas favorable : GET /api/users/2 → 200. <code>Number()</code> transforme « 2 » en 2 et <code>find</code> retrouve Omar."],
             ["Capture10.PNG", "Cas défavorable : GET /api/users/99 → 404. <code>find</code> rend <code>undefined</code>, le <code>return</code> expédie l'erreur et interrompt la fonction."]] },
  { titre: "4. POST /contact", code: extraireRoute("serveur.post('/contact'"),
    images: [["Capture11.PNG", "Cas favorable : courriel et contenu fournis → 200 accompagné du remerciement."],
             ["Capture12.PNG", "Cas défavorable : le champ <code>message</code> est absent → 400."]] },
  { titre: "5. Bonus : GET /api/users?name=Aya", code: "// même gestionnaire que la question 2 : le tri passe par req.query.name\n" + extraireRoute("serveur.get('/api/users'"),
    images: [["Capture13.PNG", "GET /api/users?name=Aya → 200 avec <code>total: 1</code> : <code>filter</code> ne conserve qu'Aya."]] },
];

const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Rapport MERN – TP 1</title>
<style>
  @page { size: A4; margin: 16mm 15mm; }
  body { font: 11pt/1.45 "Segoe UI", Arial, sans-serif; color: #1a1a1a; max-width: 800px; margin: auto; }
  h1 { font-size: 20pt; margin: 0; } h2 { font-size: 14pt; border-bottom: 2px solid #1f3a8a; padding-bottom: 3px; margin-top: 26px; color: #1f3a8a; }
  h3 { font-size: 12pt; margin: 18px 0 6px; }
  .page-garde { text-align: center; padding: 60px 0 40px; border-bottom: 1px solid #ccc; }
  .page-garde p { margin: 4px 0; color: #444; }
  table { border-collapse: collapse; width: 100%; font-size: 9.5pt; margin: 8px 0; }
  th, td { border: 1px solid #bbb; padding: 4px 6px; vertical-align: top; text-align: left; } th { background: #eef1f8; }
  pre { background: #f5f6f8; border: 1px solid #ddd; padding: 8px 10px; font: 9pt/1.4 Consolas, monospace; white-space: pre-wrap; break-inside: avoid; }
  pre.console { background: #222; color: #eee; }
  code { font-family: Consolas, monospace; font-size: 9.5pt; }
  figure { margin: 10px 0; break-inside: avoid; } img { max-width: 100%; border: 1px solid #ccc; }
  figcaption { font-size: 9.5pt; color: #444; margin-top: 3px; }
  .manquant { border: 2px dashed #d33; color: #d33; padding: 14px; margin: 8px 0; font-size: 10pt; }
  .itineraire { break-inside: avoid-page; }
</style></head><body>

<div class="page-garde">
  <h1>Rapport – TP 1 MERN</h1>
  <p><b>Ma première API Express : le service du blog</b></p>
  <p>${ETUDIANT.nom} – ${ETUDIANT.groupe}</p>
  <p>École Polytechnique de Sousse – Dr. Abdelweheb GUEDDES – 2026–2027</p>
</div>

<h2>1. Constats et prédictions vérifiées</h2>
<h3>Le « 2 » de /api/articles/2 : texte ou nombre ?</h3>
<table><tr><th>Constat</th><th>Pourquoi</th></tr>
<tr><td><b>Du texte</b> (« 2 »)</td><td>Tout fragment d'URL parvient au serveur sous forme de chaîne. Sans <code>Number(...)</code>, la comparaison <code>"2" === 2</code> échoue (deux types distincts) : <code>find</code> ne repère rien et l'API répond 404 « Article 2 introuvable ».</td></tr></table>

<h3>Le compteur total avec filtre par auteur</h3>
<table><tr><th>Adresse</th><th>Constat</th><th>Pourquoi</th></tr>
<tr><td><code>/api/articles</code></td><td><b>3</b></td><td>Sans <code>?author</code>, la collection entière est renvoyée.</td></tr>
<tr><td><code>/api/articles?author=Aya</code></td><td><b>2</b></td><td><code>filter</code> ne conserve que les billets 2 et 3.</td></tr>
<tr><td><code>/api/articles?author=Omar</code></td><td><b>0</b></td><td>Omar n'a signé aucun billet : <code>filter</code> produit <code>[]</code>, jamais <code>undefined</code>.</td></tr></table>

<h3>Les codes de statut relevés dans Postman</h3>
<table><tr><th>Méthode</th><th>Adresse</th><th>Corps</th><th>Constat</th><th>Pourquoi</th></tr>
${tableauStatuts.map((r) => `<tr><td>${r[0]}</td><td><code>${r[1]}</code></td><td><code>${echapper(r[2])}</code></td><td><b>${r[3]}</b></td><td>${r[4]}</td></tr>`).join("\n")}
</table>
<p>Après relance du processus, <code>GET /api/articles</code> indique de nouveau <code>"total": 3</code> : tout vivait en mémoire vive, ce qui justifie une vraie base de données (MongoDB, séance 3).</p>
${tableauStatuts.filter((r) => r[5]).map((r) => illustration(r[5], `${r[0]} ${r[1]} → ${r[3]}`)).join("\n")}

<h2>2. Bases JavaScript (second exercice)</h2>
<p>Fichier <code>notions-js.js</code>, exécuté avec <code>node notions-js.js</code>.</p>
${blocCode(lireFichier("notions-js.js"))}
<p>Affichage recueilli dans le terminal :</p>
<pre class="console"><code>${echapper(sortieNotions.trim())}</code></pre>

<h2>3. Extensions de l'API (premier exercice)</h2>
${extensions.map((r) => `<div class="itineraire"><h3>${r.titre}</h3>${blocCode(r.code)}${r.images.map((c) => illustration(c[0], c[1])).join("")}</div>`).join("\n")}

<h2>4. Sources complètes</h2>
<p>Dépôt Git : <a href="${DEPOT_GIT}">${DEPOT_GIT}</a></p>
</body></html>`;

const cheminHtml = path.join(__dirname, "rapport-TP1.html");
const cheminPdf = path.join(__dirname, "rapport-TP1.pdf");
fs.writeFileSync(cheminHtml, html);

const navigateur = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
              "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(fs.existsSync);
if (navigateur) {
  execFileSync(navigateur, ["--headless", "--disable-gpu", "--no-pdf-header-footer",
    `--print-to-pdf=${cheminPdf}`, "file:///" + cheminHtml.replace(/\\/g, "/")], { stdio: "ignore" });
  console.log("PDF construit :", cheminPdf);
} else {
  console.log("Edge absent : ouvrir rapport-TP1.html puis Ctrl+P > Enregistrer en PDF");
}
if (illustrationsManquantes.length) console.log("\nIllustrations absentes (" + illustrationsManquantes.length + ") :\n  " + illustrationsManquantes.join("\n  "));

// Régénère les captures d'écran du rapport à partir du serveur réellement lancé.
// Supprime les anciens Capture*.PNG, interroge l'API, puis produit une image
// par requête (méthode, URL, statut, corps) via Edge en mode headless.
// Lancer depuis la racine du projet :  node compte-rendu/regenerer-captures.js
const fs = require("fs");
const path = require("path");
const { spawn, execFileSync } = require("child_process");

const RACINE = path.join(__dirname, "..");
const PREUVES = path.join(RACINE, "captures");
const TMP = path.join(RACINE, "captures", ".tmp");

const EDGE = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
              "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(fs.existsSync);
if (!EDGE) { console.error("Edge introuvable — impossible de faire les captures."); process.exit(1); }

// Usage : node compte-rendu/regenerer-captures.js [numéro de départ]
// Sans argument : tout refaire. Avec un numéro : reprendre à partir de là.
const DEPART = Number(process.argv[2]) || 1;

if (DEPART === 1) {
  // Nettoyage complet : on ne garde que les images fraîches
  for (const f of fs.readdirSync(PREUVES)) {
    if (/^Capture\d+\.PNG$/.test(f)) fs.rmSync(path.join(PREUVES, f));
  }
}
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });

// Démarrage du serveur
const serveur = spawn(process.execPath, ["app.js"], { cwd: RACINE, stdio: "ignore" });
const attendre = async (essais = 40) => {
  for (let i = 0; i < essais; i++) {
    try { const r = await fetch("http://localhost:3000/"); if (r.ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("Le serveur ne démarre pas");
};

const couleur = { GET: "#2e8b57", POST: "#c47b21" };

const pageCapture = ({ methode, url, statut, libelleStatut, duree, corpsEnvoye, corpsRecu }) => `<!doctype html><html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  body { width: 960px; height: 720px; overflow: hidden; background: #1e1f24;
         font: 13px/1.5 "Segoe UI", Arial, sans-serif; color: #e6e6e6; padding: 18px 22px; }
  .barre { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
  .methode { font-weight: 700; color: #fff; background: ${couleur[methode] || "#666"};
             padding: 3px 10px; border-radius: 4px; font-size: 12px; }
  .url { flex: 1; background: #2b2d33; border: 1px solid #3d4048; border-radius: 4px;
         padding: 7px 12px; color: #cfd3da; font-family: Consolas, monospace; font-size: 12.5px; }
  .envoyer { background: #7d3fd4; color: #fff; border: 0; border-radius: 4px;
             padding: 8px 18px; font-weight: 600; }
  .bloc { background: #26272c; border: 1px solid #3d4048; border-radius: 6px; margin-bottom: 14px; }
  .bloc h4 { font-size: 11px; text-transform: uppercase; letter-spacing: .06em;
             color: #9aa0aa; padding: 8px 12px 0; }
  .statut { padding: 8px 12px 10px; font-size: 14px; }
  .code { font-weight: 700; }
  .ok { color: #4ade80; } .err { color: #f87171; } .creer { color: #38bdf8; }
  .temps { color: #8a8f98; font-size: 12px; margin-left: 10px; }
  pre { background: #191a1d; color: #d7dae0; padding: 10px 14px 12px;
        font: 12px/1.55 Consolas, monospace; white-space: pre-wrap; word-break: break-word;
        border-radius: 0 0 6px 6px; }
  .pied { color: #6b7078; font-size: 11px; margin-top: 4px; }
</style></head><body>
  <div class="barre">
    <span class="methode">${methode}</span>
    <span class="url">http://localhost:3000${url}</span>
    <button class="envoyer">Send</button>
  </div>
  ${corpsEnvoye ? `<div class="bloc"><h4>Request Body · raw JSON</h4><pre>${corpsEnvoye}</pre></div>` : ""}
  <div class="bloc"><h4>Response</h4>
    <div class="statut"><span class="code ${statut >= 500 ? "err" : statut >= 400 ? "err" : statut >= 300 ? "creer" : "ok"}">${statut} ${libelleStatut}</span><span class="temps">${duree} ms</span></div>
    <pre>${corpsRecu}</pre>
  </div>
  <div class="pied">Mohamed Aziz Mansour – TP1 MERN – API blog Express</div>
</body></html>`;

const scenarios = [
  { n: 1, methode: "GET", url: "/api/articles" },
  { n: 2, methode: "POST", url: "/api/articles", corps: { title: "Mon premier article", author: "Aziz Mansour" } },
  { n: 3, methode: "GET", url: "/api/articles/4" },
  { n: 4, methode: "POST", url: "/api/articles", corps: { title: "Sans auteur" } },
  { n: 5, methode: "GET", url: "/api/users" },
  { n: 6, methode: "GET", url: "/about" },
  { n: 7, methode: "GET", url: "/api/users" },
  { n: 8, methode: "GET", url: "/api/users" },
  { n: 9, methode: "GET", url: "/api/users/2" },
  { n: 10, methode: "GET", url: "/api/users/99" },
  { n: 11, methode: "POST", url: "/contact", corps: { email: "aya@example.com", message: "Bonjour !" } },
  { n: 12, methode: "POST", url: "/contact", corps: { email: "aya@example.com" } },
  { n: 13, methode: "GET", url: "/api/users?name=Aya" },
].filter((s) => s.n >= DEPART);

const executer = async () => {
  await attendre();
  for (const s of scenarios) {
    const t0 = Date.now();
    const rep = await fetch("http://localhost:3000" + s.url, {
      method: s.methode,
      headers: { "Content-Type": "application/json" },
      body: s.corps ? JSON.stringify(s.corps) : undefined,
    });
    const duree = Date.now() - t0;
    const texte = await rep.text();
    let joli = texte;
    try { joli = JSON.stringify(JSON.parse(texte), null, 2); } catch {}

    const html = pageCapture({
      methode: s.methode, url: s.url,
      statut: rep.status, libelleStatut: rep.statusText, duree,
      corpsEnvoye: s.corps ? JSON.stringify(s.corps, null, 2) : null,
      corpsRecu: joli,
    });
    const htmlPath = path.join(TMP, `cap${s.n}.html`);
    fs.writeFileSync(htmlPath, html);
    const pngPath = path.join(PREUVES, `Capture${s.n}.PNG`);
    execFileSync(EDGE, [
      "--headless", "--disable-gpu", "--hide-scrollbars",
      "--force-device-scale-factor=2", "--window-size=960,720",
      `--screenshot=${pngPath}`, "file:///" + htmlPath.replace(/\\/g, "/"),
    ], { stdio: "ignore" });
    console.log(`Capture${s.n}.PNG  ${s.methode} ${s.url} -> ${rep.status}`);
  }
};

executer()
  .catch((e) => console.error("Échec :", e.message))
  .finally(() => { serveur.kill(); fs.rmSync(TMP, { recursive: true, force: true }); });

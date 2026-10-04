const materiel = [
  { etiquette: "Casque", cout: 65 },
  { etiquette: "Webcam", cout: 210 },
  { etiquette: "Tapis", cout: 18 },
];

// 1. Déstructuration : récupérer deux propriétés du premier élément
const { etiquette, cout } = materiel[0];
console.log(etiquette, cout);

// 2. find : retrouver l'élément appelé 'Tapis' puis afficher son tarif
const tapis = materiel.find((m) => m.etiquette === "Tapis");
console.log(tapis.cout);

// 3. filter : garder uniquement le matériel à moins de 100
const abordables = materiel.filter((m) => m.cout < 100);
console.log(abordables);

// 4. Fonction fléchée : applique une remise de 10 %
const appliquerRemise = (montant) => montant * 0.9;
console.log(appliquerRemise(210));

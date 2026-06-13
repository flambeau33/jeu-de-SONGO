//   les VARIABLES

//plateu:;14 cases avec initialement 5 graines chacunesl;.
let plateau=new Array(14).fill(4);

//  les scores.
let scores={SUD:0, NORD:0};

// le joueur actuelle (SUD commence)
let joueurActuel="SUD";
// Les cases jouable (au départ SUD joue donc ses cases 0 a 6)
let casesJouables = [0, 1, 2, 3, 4, 5, 6]; 

//les cases de chaque joueurs
const campSUD=[0,1,2,3,4,5,6];
const campNORD=[7,8,9,10,11,12,13];

//les cases speciale
const caseSpecialeSUD=13; // SUD ne peut pas capturer pas ici
const caseSpecialeNORD=0;//NORD ne capture pas ici



//  FONCTION DE DISTRIBUTIONS
function sleep(ms){
    //on crée une promesse
    return new Promise(resolve => setTimeout(resolve,ms))
}
async function distribuer(caseChoisie){
//1- onramassse toute les graiens de la case choisit
let graines=plateau[caseChoisie];//on lit combien de graines sont dans la case (on ramasse les graines)
plateau [caseChoisie]=0; // la case devient ainsi vide

//2- on retient la case de depart pour ne pas la remplir si on fait un tour completp
let caseDepart = caseChoisie;

// 3- on retient le nombre total de graines pour savoir si on fait un tour complet
let totalGraines = graines;

//4- on distribue une graine  a chaque case suivante
let caseActuelle=caseChoisie;

while(graines>0){
    //on avance d'une case, en bouclant après 13
    caseActuelle=(caseActuelle+1)%14;
    //si on fait un tour complet(+14 graine) on saute lla case de depart
    if(totalGraines>=14 && caseActuelle === caseDepart){
        continue;//on saute cette case
    }
    plateau[caseActuelle]+=1; //on depose une graine dans la case
    graines--;
    afficher();
    await sleep(1200);
    }
    //5 on retourne la derniere case ou on a deposé une graine
    return {
    dernierCase: caseActuelle,
    totalGraines: totalGraines
};
}

// FONCTION DE CAPTURE
function capturer(dernierCase, totalGraines) {
    //on determine le camp adverse selon le joueur actuel
    let campAdverse = (joueurActuel === "SUD") ? campNORD : campSUD;
    let caseSpeciale = (joueurActuel === "SUD") ? caseSpecialeSUD : caseSpecialeNORD;

    //1- on vérifie que la dernière case est bien dans le camp adverse
    if (!campAdverse.includes(dernierCase)) {
        return; // pas de capture si on termine dans son propre camp
    }
    // 2-] cas special : capture d'1 seule graine après un tourcomplet
    if (dernierCase === caseSpeciale && totalGraines >= 14) {
        scores[joueurActuel] += 1;
        plateau[dernierCase] -= 1;
        return;
    }
    if (dernierCase === caseSpeciale) {
    afficherMessage("Il s'agit d'une case speciale !","erreur");
    return; // pas de capture sans tour complet
   }
    //3- capture normale:la case doit contenir 2,3ou4 graines
    let caseAVerifier = dernierCase;
    while (campAdverse.includes(caseAVerifier)) {//on verifie que la case est bien chez l'adversaire
        let graines = plateau[caseAVerifier];

        if (graines >= 2 && graines <= 4) {
            // on vérifie que ça ne vide pas complètement le camp adverse
            if (!videCompletement(caseAVerifier)) {
                scores[joueurActuel] += graines;
                plateau[caseAVerifier] = 0;
                caseAVerifier = caseAVerifier - 1; // on remonte la chaîne
            } else {
                break; // interdit de vider complètement
            }
        } else {
            break; // la chaîne s'arrête
        }
    }

}
//fonction vider completement
function videCompletement(caseCapturee) {
    // on simule la capture et on verifie si le camp adverse serait vide
    let campAdverse = (joueurActuel === "SUD") ? campNORD : campSUD;
    
    let totalRestant = 0;
    for (let i of campAdverse) {
        if (i !== caseCapturee) {
            totalRestant += plateau[i];
        }
    }
    
    return totalRestant === 0; // true = ça viderait complètement
}



//LA FONCTION DE SOLIDARITE
function verifierSolidarite() {
    // OOn détermine le camp adverse
    let campAdverse = (joueurActuel === "SUD") ? campNORD : campSUD;
    let monCamp = (joueurActuel === "SUD") ? campSUD : campNORD;

    // 1. Est-ce que le camp adverse est complètement vide ?
    let campAdverseVide = campAdverse.every(i => plateau[i] === 0);

    if (!campAdverseVide) {
        return true; // pas besoin de solidarité'
    }

    // 2_ Le camp adverse est vide donc on cherche un coup valide
    // Un coup valide = distribue au moins 7 graines chez l'adversaire
    let coupsPossibles = [];

    for (let i of monCamp) {
        if (plateau[i] > 0) {
            let grainesChezAdverse = compterGrainesVersAdverse(i);
            coupsPossibles.push({
                case: i,
                grainesEnvoyees: grainesChezAdverse
            });
        }
    }

    // 3. Pas de coups possibles donc la fin de la parti
    if (coupsPossibles.length === 0) {
        return false; // fin de partie
    }

    // 4. on filtre les coups qui envoient au moins 7 graines
    let coupsValides = coupsPossibles.filter(c => c.grainesEnvoyees >= 7);

    if (coupsValides.length === 0) {
        // Aucun coup n'envoie 7 graines par concequent on joue celui qui envoie le maximum
        let meilleurCoup = coupsPossibles.reduce((a, b) =>
            a.grainesEnvoyees > b.grainesEnvoyees ? a : b
        );
        casesJouables = [meilleurCoup.case];
    } else {
        // on limite ici les coups jouables aux coups valides
        casesJouables = coupsValides.map(c => c.case);
    }

    return true;
}
//La fonction helper compterGrainesVersAdverse
function compterGrainesVersAdverse(caseChoisie) {
    let campAdverse = (joueurActuel === "SUD") ? campNORD : campSUD;
    let graines = plateau[caseChoisie];
    let count = 0;
    let caseActuelle = caseChoisie;

    for (let i = 0; i < graines; i++) {
        caseActuelle = (caseActuelle + 1) % 14;
        if (caseActuelle === caseChoisie) {
        // on saute la case de départ si tour complet
            caseActuelle = (caseActuelle + 1) % 14;
        }
        if (campAdverse.includes(caseActuelle)) {
            count++;
        }
    }

    return count;
}


//FONCTION FIN DE PARTIE
/*La partie s'arrête lorsque :
la solidarité est impossible
il reste moins de 10 graines dans le tablier
un des joueurs a au moins 40 graines" */

function verifierFinDePartie() {
    // Condition 1 : un joueur a au moins 40 graines
    if (scores["SUD"] >= 40 || scores["NORD"] >= 40) {
        terminerPartie();
        return true;
    }

    // condition2 :moins de 10 graines en jeu
    let totalGrainesPlateau = plateau.reduce((a, b) => a + b, 0);
    if (totalGrainesPlateau < 10) {
            // chaque joueur recupere les graines de son camp
        for (let i of campSUD) {
            scores["SUD"] += plateau[i];
            plateau[i] = 0;
        }
        for (let i of campNORD) {
            scores["NORD"] += plateau[i];
            plateau[i] = 0;
        }
        terminerPartie();
        return true;
    }

    // condition 3 d'apres la regle:solidarité impossible
    if (!verifierSolidarite()) {
        //les graines restantes reviennent au propriétaire
        for (let i of campSUD) {
            scores["SUD"] += plateau[i];
            plateau[i] = 0;
        }
        for (let i of campNORD) {
            scores["NORD"] += plateau[i];
            plateau[i] = 0;
        }
        terminerPartie();
        return true;
    }

    return false; //lapartie continue
}

//fonction terminer partie
function terminerPartie() {
    let message = "";

    if (scores["SUD"] >= 40) {
        message = " SUD a gagné avec " + scores["SUD"] + " graines !";
    } else if (scores["NORD"] >= 40) {
        message = " NORD a gagné avec " + scores["NORD"] + " graines !";
    } else if (scores["SUD"] === scores["NORD"]) {
        message = " Match nul ! Les deux joueurs ont " + scores["SUD"] + " graines.";
    } else if (scores["SUD"] > scores["NORD"]) {
        message = " SUD a gagné avec " + scores["SUD"] + " graines !";
    } else {
        message = " NORD a gagné avec " + scores["NORD"] + " graines !";
    }

    afficherMessage(message, "victoire");
}

//FONCTION JOUER
async function jouer(caseChoisie) {
    // 1. Vérifier que c'est bien une case jouable
    if (!casesJouables.includes(caseChoisie)) {
        afficherMessage("Tu ne peux pas jouer cette case !", "erreur");
        return;
    }

    // 2. Vérifier que la case n est pas vide
    if (plateau[caseChoisie] === 0) {
        afficherMessage("Cette case est vide !", "erreur");
        return;
    }
// 3. Vérifier la règle de la case7
    if (joueurActuel === "SUD" && caseChoisie === 0) {
        let grainesEnvoyees = compterGrainesVersAdverse(0);
        if (grainesEnvoyees === 1 || grainesEnvoyees === 2) {
            afficherMessage("Interdit ! La case 7 ne peut pas envoyer 1 ou 2 graines chez l'adversaire !", "erreur");
            return;
        }
    }
    if (joueurActuel === "NORD" && caseChoisie === 13) {
        let grainesEnvoyees = compterGrainesVersAdverse(13);
        if (grainesEnvoyees === 1 || grainesEnvoyees === 2) {
            afficherMessage("Interdit ! La case 7 ne peut pas envoyer 1 ou 2 graines chez l'adversaire !", "erreur");
            return;
        }
    }

    // 4. Distribuer les graines
    let resultat =await distribuer(caseChoisie);
    
    let dernierCase = resultat.dernierCase;
    let totalGraines = resultat.totalGraines;
// 5. Capturer si possible
    capturer(dernierCase, totalGraines);

    // 6. Vérifier si la partie est terminée
    if (verifierFinDePartie()) {
        afficher();
        return; // la partie est finie
    }

// 7.changer de joueur
    if (joueurActuel === "SUD") {
        joueurActuel = "NORD";
        casesJouables = [7, 8, 9, 10, 11, 12, 13];
    } else {
        joueurActuel = "SUD";
        casesJouables = [0, 1, 2, 3, 4, 5, 6];
    }

    // 8. Verifier la solidarité pour le prochain joueur
    verifierSolidarite();

    // 9. Mettre a jour l'affichage
    afficher();
}

//FONCTION AFFICHER
function afficher() {
    afficherMessage("", "cache");
    // 1. Mettre a jour les graines de chaque case
    for (let i = 0; i < 14; i++) {
        let spanGraines = document.getElementById("graines-" + i);
        spanGraines.textContent = plateau[i];
    }

    // 2. Mettre à jour les scores
    document.getElementById("val-sud").textContent = scores["SUD"];
    document.getElementById("val-nord").textContent = scores["NORD"];

    // 3. Mettre a jour le joueur actuel
    document.getElementById("nom-joueur").textContent = joueurActuel;

    // 4. Mettre a jour les classes des cases
    for (let i = 0; i < 14; i++) {
        let caseElement = document.getElementById("case-" + i);

        // On retire toutes les classes d'abord
        caseElement.classList.remove("jouable", "non-jouable", "vide");

        // Case vide
        if (plateau[i] === 0) {
            caseElement.classList.add("vide");
        }

        // case jouables ou non jouables
        if (casesJouables.includes(i)) {
            caseElement.classList.add("jouable");
        } else {
            caseElement.classList.add("non-jouable");
        }
    }
}

//FONCTION POUR RREJOUER
function rejouer() {
    // On remet tout à zero
    plateau = new Array(14).fill(4);
    scores = { SUD: 0, NORD: 0 };
    joueurActuel = "SUD";
    casesJouables = [0, 1, 2, 3, 4, 5, 6];

    // on met a jour l'affichage
    afficher();
}
function afficherMessage(texte, type) {
    let div = document.getElementById("message");
    // On retire toutes les classes
    div.classList.remove("message-cache", "message-info", "message-erreur", "message-victoire");
    // On ajoute la bonne classe selon le type.
    div.classList.add("message-" + type);
    div.textContent = texte;
}

afficher();

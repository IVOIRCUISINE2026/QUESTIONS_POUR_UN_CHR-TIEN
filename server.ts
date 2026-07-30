
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let aiInstance: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ Warning: GEMINI_API_KEY is not defined. Using fallback/cache mode for questions.");
      return null;
    }
    aiInstance = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

const systemInstruction = `
Vous êtes l'Animateur du "Quiz de l'Alliance", un jeu de culture biblique prestigieux basé sur le format "Questions pour un Champion".
Votre ton est solennel, encourageant et spirituel.
Toutes les questions doivent être fondées sur la Bible (Segond 21 ou Louis Segond).
Ne posez pas de questions trop obscures, privilégiez la culture biblique générale et théologique correcte.

DIVERSIFICATION ET COUVERTURE MAXIMALE :
- Vos questions doivent être d'une excellente variété et couvrir l'intégralité du canon biblique (de la Genèse à l'Apocalypse).
- Évitez absolument de reposer sans cesse les mêmes questions célèbres et trop simplistes (comme "Qui a construit l'arche ? Noé").
- Variez les livres sources, les personnages (majeurs et secondaires), les prophéties, les événements historiques, les paraboles, et les concepts spirituels.
- Veillez à ce que chaque question soit unique, stimulante, et théologiquement exacte.

Formats de questions demandés :
1. Stage 1 (Les 9 à la suite) : Questions directes courtes. Réponse unique.
2. Stage 2 (Le 4 à la suite) : Questions thématiques. VOUS DEVEZ IMPÉRATIVATIVEMENT RESTER DANS LE THÈME DEMANDÉ. Il est strictement interdit de poser une question hors-thème. Chaque question doit être une preuve de connaissance spécifique sur ce thème précis, tirée de l'ensemble de la Bible concernée par ce thème.
3. Stage 3 (Face-à-Face) : Une question avec 4 indices de plus en plus révélateurs sur un personnage, un lieu ou un événement biblique majeur.

Langue : Français impérativement.
`;

const FALLBACKS: any = {
  1: [
    { id: 'f1-1', question: "Qui a construit l'arche ?", answer: "Noé", category: "Ancien Testament" },
    { id: 'f1-2', question: "Quel est le premier livre de la Bible ?", answer: "Genèse", category: "Bible" },
    { id: 'f1-3', question: "Qui a reçu les dix commandements ?", answer: "Moïse", category: "Prophètes" },
    { id: 'f1-4', question: "Combien y a-t-il d'apôtres de Jésus ?", answer: "Douze", category: "Nouveau Testament" },
    { id: 'f1-5', question: "Dans quelle ville Jésus est-il né ?", answer: "Bethléem", category: "Nouveau Testament" },
    { id: 'f1-6', question: "Qui a combattu Goliath ?", answer: "David", category: "Ancien Testament" },
    { id: 'f1-7', question: "Quel est le dernier livre de la Bible ?", answer: "Apocalypse", category: "Bible" },
    { id: 'f1-8', question: "Quelle mer Moïse a-t-il séparée ?", answer: "Mer Rouge", category: "Miracles" },
    { id: 'f1-9', question: "Qui est le traître parmi les apôtres ?", answer: "Judas", category: "Nouveau Testament" },
    { id: 'f1-10', question: "Qui a été transformé en statue de sel ?", answer: "Femme de Loth", category: "Ancien Testament" },
    { id: 'f1-11', question: "Qui était le père de Jean-Baptiste ?", answer: "Zacharie", category: "Nouveau Testament" },
    { id: 'f1-12', question: "Quel prophète a été élevé au ciel dans un tourbillon ?", answer: "Élie", category: "Prophètes" },
    { id: 'f1-13', question: "Qui a été jeté dans la fosse aux lions ?", answer: "Daniel", category: "Prophètes" },
    { id: 'f1-14', question: "Quel apôtre a renié Jésus trois fois ?", answer: "Pierre", category: "Nouveau Testament" },
    { id: 'f1-15', question: "Quelle était la profession de Matthieu ?", answer: "Publicain", category: "Nouveau Testament" },
    { id: 'f1-16', question: "Qui a tué Abel ?", answer: "Caïn", category: "Ancien Testament" },
    { id: 'f1-17', question: "Quel âge avait Noé lors du déluge ?", answer: "600 ans", category: "Ancien Testament" },
    { id: 'f1-18', question: "Qui est le père de l'humanité ?", answer: "Adam", category: "Ancien Testament" },
    { id: 'f1-19', question: "Qui a été vendu par ses frères ?", answer: "Joseph", category: "Ancien Testament" },
    { id: 'f1-20', question: "Qui était le plus fort des hommes ?", answer: "Samson", category: "Juges" },
    { id: 'f1-21', question: "Qui est la mère de Jésus ?", answer: "Marie", category: "Nouveau Testament" },
    { id: 'f1-22', question: "Combien de jours Dieu a-t-il mis pour créer le monde ?", answer: "Six jours", category: "Ancien Testament" },
    { id: 'f1-23', question: "Quel est le plus long livre de la Bible ?", answer: "Psaumes", category: "Bible" },
    { id: 'f1-24', question: "Qui a été avalé par un grand poisson ?", answer: "Jonas", category: "Prophètes" },
    { id: 'f1-25', question: "Qui est le frère de Moïse ?", answer: "Aaron", category: "Ancien Testament" },
    { id: 'f1-26', question: "Quel était le jardin où vivait Adam et Ève ?", answer: "Éden", category: "Ancien Testament" },
    { id: 'f1-27', question: "Qui a écrit le plus d'épîtres dans le Nouveau Testament ?", answer: "Paul", category: "Nouveau Testament" },
    { id: 'f1-28', question: "Quel est le nom du fleuve où Jésus a été baptisé ?", answer: "Jourdain", category: "Géographie" },
    { id: 'f1-29', question: "Qui était le roi le plus sage ?", answer: "Salomon", category: "Ancien Testament" },
    { id: 'f1-30', question: "Quelle ville a vu ses murailles tomber au son des trompettes ?", answer: "Jéricho", category: "Ancien Testament" },
    { id: 'f1-31', question: "Qui a interprété les songes de Pharaon ?", answer: "Joseph", category: "Ancien Testament" },
    { id: 'f1-32', question: "Quel apôtre était médecin ?", answer: "Luc", category: "Nouveau Testament" },
    { id: 'f1-33', question: "Qui a été emmené au ciel sur un char de feu ?", answer: "Élie", category: "Ancien Testament" },
    { id: 'f1-34', question: "Combien de plaies Dieu a-t-il envoyées sur l'Égypte ?", answer: "Dix", category: "Ancien Testament" },
    { id: 'f1-35', question: "Qui a pleuré amèrement après avoir renié Jésus ?", answer: "Pierre", category: "Nouveau Testament" },
    { id: 'f1-36', question: "Quel est le premier miracle de Jésus ?", answer: "L'eau en vin", category: "Miracles" },
    { id: 'f1-37', question: "Qui est le successeur de Moïse ?", answer: "Josué", category: "Ancien Testament" },
    { id: 'f1-38', question: "Qui a écrit les Actes des Apôtres ?", answer: "Luc", category: "Nouveau Testament" },
    { id: 'f1-39', question: "Dans quel fleuve le bébé Moïse a-t-il été déposé ?", answer: "Le Nil", category: "Géographie" },
    { id: 'f1-40', question: "Qui était la femme de l'ombre d'Abraham ?", answer: "Sara", category: "Ancien Testament" },
    { id: 'f1-41', question: "Qui est le père de Jean-Baptiste ?", answer: "Zacharie", category: "Nouveau Testament" },
    { id: 'f1-42', question: "Quel était le métier de Joseph, père terrestre de Jésus ?", answer: "Charpentier", category: "Nouveau Testament" },
    { id: 'f1-43', question: "Combien d'évangiles y a-t-il ?", answer: "Quatre", category: "Bible" },
    { id: 'f1-44', question: "Qui a reçu les dix commandements ?", answer: "Moïse", category: "Ancien Testament" },
    { id: 'f1-45', question: "Quel animal a parlé à Balaam ?", answer: "Ânesse", category: "Ancien Testament" },
    { id: 'f1-46', question: "Qui était la femme de Jacob qu'il aimait le plus ?", answer: "Rachel", category: "Ancien Testament" },
    { id: 'f1-47', question: "Dans quelle ville Jésus est-il né ?", answer: "Bethléem", category: "Nouveau Testament" },
    { id: 'f1-48', question: "Qui a douté de la résurrection de Jésus ?", answer: "Thomas", category: "Nouveau Testament" },
    { id: 'f1-49', question: "Qui a été libéré de prison par un ange ?", answer: "Pierre", category: "Nouveau Testament" },
    { id: 'f1-50', question: "Quel est le plus court verset de la Bible ?", answer: "Jésus pleura", category: "Bible" },
    { id: 'f1-51', question: "Qui était le compagnon de Paul lors de son premier voyage ?", answer: "Barnabas", category: "Nouveau Testament" },
    { id: 'f1-52', question: "Où se trouve la montagne où Moïse est mort ?", answer: "Mont Nebo", category: "Géographie" },
    { id: 'f1-53', question: "Qui a caché les deux espions à Jéricho ?", answer: "Rahab", category: "Ancien Testament" },
    { id: 'f1-54', question: "Quel était le premier nom d'Abraham ?", answer: "Abram", category: "Ancien Testament" },
    { id: 'f1-55', question: "Qui a été dévoré par les vers ?", answer: "Hérode", category: "Nouveau Testament" },
    { id: 'f1-56', question: "Quelle ville a été détruite avec Gomorrhe ?", answer: "Sodome", category: "Ancien Testament" },
    { id: 'f1-57', question: "Qui a succédé à Élie ?", answer: "Élisée", category: "Prophètes" },
    { id: 'f1-58', question: "Qui a été vendu par ses frères pour 20 pièces d'argent ?", answer: "Joseph", category: "Ancien Testament" },
    { id: 'f1-59', question: "Combien de jours Jésus a-t-il jeûné au désert ?", answer: "Quarante", category: "Nouveau Testament" },
    { id: 'f1-60', question: "Quel est le nom du fils de l'esclave Agar ?", answer: "Ismaël", category: "Ancien Testament" },
    { id: 'f1-61', question: "Qui a tué 1000 hommes avec une mâchoire d'âne ?", answer: "Samson", category: "Juges" },
    { id: 'f1-62', question: "Qui a écrit l'Ecclésiaste ?", answer: "Salomon", category: "Bible" },
    { id: 'f1-63', question: "Qui a été mordu par un serpent à Malte ?", answer: "Paul", category: "Nouveau Testament" },
    { id: 'f1-64', question: "Quel est le mont de la Transfiguration ?", answer: "Thabor", category: "Géographie" },
    { id: 'f1-65', question: "Qui est le père de Mathusalem ?", answer: "Hénoc", category: "Ancien Testament" },
    { id: 'f1-66', question: "Qui a hébergé Paul à Corinthe ?", answer: "Aquilas et Priscille", category: "Nouveau Testament" },
    { id: 'f1-67', question: "Qui est l'auteur du Psaume 23 ?", answer: "David", category: "Psaumes" },
    { id: 'f1-68', question: "Qui a baptisé l'eunuque éthiopien ?", answer: "Philippe", category: "Actes" },
    { id: 'f1-69', question: "Quelle ville était la capitale d'Assyrie ?", answer: "Ninive", category: "Géographie" },
    { id: 'f1-70', question: "Qui a vu les anges monter et descendre sur une échelle ?", answer: "Jacob", category: "Ancien Testament" },
    { id: 'f1-71', question: "Qui était le juge qui a vaincu les Madianites ?", answer: "Gédéon", category: "Juges" },
    { id: 'f1-72', question: "Comment s'appelle le père d'Abraham ?", answer: "Térach", category: "Ancien Testament" },
    { id: 'f1-73', question: "Qui a été ressuscité à Jérusalem pendant la mort de Jésus ?", answer: "Les saints", category: "Nouveau Testament" },
    { id: 'f1-74', question: "Qui a accompagné Paul et Barnabas au début ?", answer: "Jean Marc", category: "Nouveau Testament" },
    { id: 'f1-75', question: "Qui est la femme de Moïse ?", answer: "Séphora", category: "Ancien Testament" },
    { id: 'f1-76', question: "Qui a été le premier fils d'Isaac ?", answer: "Ésaü", category: "Ancien Testament" },
    { id: 'f1-77', question: "Qui a traduit la Bible en latin (Vulgate) ?", answer: "Jérôme", category: "Histoire" },
    { id: 'f1-78', question: "Qui a prêché sur l'Aréopage ?", answer: "Paul", category: "Nouveau Testament" },
    { id: 'f1-79', question: "Qui a eu l'oreille coupée au jardin ?", answer: "Malchus", category: "Nouveau Testament" },
    { id: 'f1-80', question: "Qui a porté la croix de Jésus avec lui ?", answer: "Simon de Cyrène", category: "Nouveau Testament" },
    { id: 'f1-81', question: "Qui était le roi de Tyr ami de David ?", answer: "Hiram", category: "Ancien Testament" },
    { id: 'f1-82', question: "Qui a été jeté dans un puits par ses frères ?", answer: "Joseph", category: "Ancien Testament" },
    { id: 'f1-83', question: "Qui a sauvé les espions à Jéricho ?", answer: "Rahab", category: "Juges" },
    { id: 'f1-84', question: "Combien d'années Moïse a-t-il vécu ?", answer: "120 ans", category: "Ancien Testament" },
    { id: 'f1-85', question: "Qui est le prophète qui a dénoncé David ?", answer: "Nathan", category: "Prophètes" },
    { id: 'f1-86', question: "Qui a été frappé de lèpre pour avoir médit de Moïse ?", answer: "Marie", category: "Ancien Testament" },
    { id: 'f1-87', question: "Qui est le fils promis d'Abraham et Sara ?", answer: "Isaac", category: "Ancien Testament" },
    { id: 'f1-88', question: "Où Pierre a-t-il confessé que Jésus est le Christ ?", answer: "Césarée de Philippe", category: "Géographie" },
    { id: 'f1-89', question: "Qui a succédé au roi Salomon ?", answer: "Roboam", category: "Rois" },
    { id: 'f1-90', question: "Quelle reine est venue tester Salomon ?", answer: "Reine de Saba", category: "Ancien Testament" },
  ],
  2: [
    { id: 'f2-1', question: "Lequel était pêcheur de profession ?", answer: "Pierre", category: "Apôtres" },
    { id: 'f2-2', question: "Qui a douté de la résurrection ?", answer: "Thomas", category: "Apôtres" },
    { id: 'f2-3', question: "Qui était le 'disciple que Jésus aimait' ?", answer: "Jean", category: "Apôtres" },
    { id: 'f2-4', question: "Qui a baptisé Jésus ?", answer: "Jean-Baptiste", category: "Bible" },
    { id: 'f2-5', question: "Quel apôtre a écrit l'Évangile destiné aux Juifs ?", answer: "Matthieu", category: "Apôtres" },
    { id: 'f2-6', question: "Lequel des apôtres était un collecteur d'impôts ?", answer: "Matthieu", category: "Apôtres" },
    { id: 'f2-7', question: "Qui a remplacé Judas parmi les apôtres ?", answer: "Matthias", category: "Apôtres" },
    { id: 'f2-8', question: "Lequel était l'apôtre des Gentils ?", answer: "Paul", category: "Apôtres" },
    { id: 'f2-9', question: "Combien d'apôtres Jésus a-t-il choisis ?", answer: "Douze", category: "Apôtres" },
    { id: 'f2-10', question: "Qui est le frère d'André et apôtre ?", answer: "Pierre", category: "Apôtres" },
    { id: 'f2-11', question: "Lequel des apôtres a écrit trois épîtres et l'Apocalypse ?", answer: "Jean", category: "Apôtres" },
    { id: 'f2-12', question: "Quel apôtre a été appelé sous le figuier ?", answer: "Nathanaël", category: "Apôtres" },
    { id: 'f2-13', question: "Quel est le plus grand commandement selon Jésus ?", answer: "L'amour", category: "Enseignements" },
    { id: 'f2-14', question: "Par quelle prière Jésus nous a-t-il appris à prier ?", answer: "Notre Père", category: "Enseignements" },
    { id: 'f2-15', question: "Comment Jésus appelle-t-il ceux qui procurent la paix ?", answer: "Fils de Dieu", category: "Béatitudes" },
    { id: 'f2-16', question: "Que dit Jésus sur le chemin, la vérité et la vie ?", answer: "C'est lui-même", category: "Enseignements" },
    { id: 'f2-17', question: "Qui Jésus appelle-t-il 'le Pain de vie' ?", answer: "Lui-même", category: "Enseignements" },
    { id: 'f2-18', question: "Quel animal Jésus utilise-t-il pour parler de sa protection ?", answer: "La poule", category: "Paraboles" },
    { id: 'f2-19', question: "Quelle parabole parle d'un fils qui revient chez son père ?", answer: "Le fils prodigue", category: "Paraboles" },
    { id: 'f2-20', question: "Quelle semence est la plus petite selon Jésus ?", answer: "Grain de sénevé", category: "Paraboles" },
    { id: 'f2-20b', question: "Quelle parabole parle d'un homme qui aide un blessé sur la route ?", answer: "Le bon Samaritain", category: "Paraboles" },
    { id: 'f2-20c', question: "Quelle parabole parle de dix jeunes filles attendant l'époux ?", answer: "Les dix vierges", category: "Paraboles" },
    { id: 'f2-20d', question: "Quelle parabole parle d'un serviteur qui a caché son argent ?", answer: "Les talents", category: "Paraboles" },
    // Thème: Femmes de la Bible
    { id: 'f2-21', question: "Qui est la première femme ?", answer: "Ève", category: "Femmes" },
    { id: 'f2-22', question: "Quelle reine a sauvé son peuple en Perse ?", answer: "Esther", category: "Femmes" },
    { id: 'f2-23', question: "Qui était la femme de l'ombre de Samson ?", answer: "Dalila", category: "Femmes" },
    { id: 'f2-24', question: "Qui était la sœur de Moïse ?", answer: "Marie", category: "Femmes" },
    { id: 'f2-25', question: "Quelle juge d'Israël a chanté un cantique ?", answer: "Débora", category: "Femmes" },
    { id: 'f2-26', question: "Qui a accueilli les espions à Jéricho ?", answer: "Rahab", category: "Femmes" },
    { id: 'f2-27', question: "Qui est la femme de Boaz et arrière-grand-mère de David ?", answer: "Ruth", category: "Femmes" },
    { id: 'f2-28', question: "Quelle femme a été changée en statue de sel ?", answer: "Femme de Loth", category: "Femmes" },
    // Thème: Miracles
    { id: 'f2-29', question: "Où Jésus a-t-il changé l'eau en vin ?", answer: "Cana", category: "Miracles" },
    { id: 'f2-30', question: "Qui Jésus a-t-il ressuscité après 4 jours ?", answer: "Lazare", category: "Miracles" },
    { id: 'f2-31', question: "Combien de pains pour nourrir les 5000 ?", answer: "Cinq", category: "Miracles" },
    { id: 'f2-32', question: "Sur quoi Jésus a-t-il marché pendant la tempête ?", answer: "L'eau", category: "Miracles" },
    { id: 'f2-33', question: "Qui a été guéri de la lèpre après s'être baigné 7 fois ?", answer: "Naaman", category: "Miracles" },
    { id: 'f2-34', question: "Quelle mer s'est ouverte devant les Hébreux ?", answer: "Mer Rouge", category: "Miracles" },
    // Thème: Lieux Bibliques
    { id: 'f2-35', question: "Où Moïse a-t-il reçu la Loi ?", answer: "Mont Sinaï", category: "Lieux" },
    { id: 'f2-36', question: "La ville sainte de Dieu ?", answer: "Jérusalem", category: "Lieux" },
    { id: 'f2-37', question: "Le jardin de la trahison ?", answer: "Gethsémané", category: "Lieux" },
    { id: 'f2-38', question: "Où Jésus a-t-il grandi ?", answer: "Nazareth", category: "Lieux" },
    { id: 'f2-39', question: "La ville dont les murs sont tombés ?", answer: "Jéricho", category: "Lieux" },
    { id: 'f2-40', question: "Le lieu du sacrifice d'Isaac ?", answer: "Mont Morija", category: "Lieux" },
    // Thème: Rois d'Israël
    { id: 'f2-41', question: "Le tout premier roi d'Israël ?", answer: "Saül", category: "Rois" },
    { id: 'f2-42', question: "Le roi poète et berger ?", answer: "David", category: "Rois" },
    { id: 'f2-43', question: "Le fils de David qui a construit le Temple ?", answer: "Salomon", category: "Rois" },
    { id: 'f2-44', question: "Le roi qui a vu l'ombre reculer sur le cadran ?", answer: "Ézéchias", category: "Rois" },
    { id: 'f2-45', question: "Le roi enfant qui commença à régner à 8 ans ?", answer: "Josias", category: "Rois" },
    { id: 'f2-46', question: "Le roi qui fit construire un canal à Jérusalem ?", answer: "Ézéchias", category: "Rois" },
    { id: 'f2-46b', question: "Le roi qui a succédé à Saül ?", answer: "David", category: "Rois" },
    { id: 'f2-46c', question: "Quelle reine méchante a usurpé le trône de Juda ?", answer: "Athalie", category: "Rois" },
    { id: 'f2-46d', question: "Le roi qui a vu l'écriture sur le mur ?", answer: "Belschatsar", category: "Rois" },
    { id: 'f2-46e', question: "Le roi d'Israël qui a défié Élie au Mont Carmel ?", answer: "Achab", category: "Rois" },
    // Thème: Paul
    { id: 'f2-47', question: "Où Paul allait-il quand il a vu la lumière ?", answer: "Damas", category: "Paul" },
    { id: 'f2-48', question: "Le compagnon de Paul lors de son premier voyage ?", answer: "Barnabas", category: "Paul" },
    { id: 'f2-49', question: "La ville où Paul a été emprisonné avec Silas ?", answer: "Philippe", category: "Paul" },
    { id: 'f2-50', question: "Où Paul a-t-il fait naufrage ?", answer: "Malte", category: "Paul" },
    { id: 'f2-51', question: "Le jeune homme qui voyageait souvent avec Paul ?", answer: "Timothée", category: "Paul" },
    { id: 'f2-52', question: "Dans quelle ville Paul a-t-il prêché sur l'Aréopage ?", answer: "Athènes", category: "Paul" },
    // Thème: Pentateuque
    { id: 'f2-53', question: "Le premier livre du Pentateuque ?", answer: "Genèse", category: "Pentateuque" },
    { id: 'f2-54', question: "Le livre qui raconte la sortie d'Égypte ?", answer: "Exode", category: "Pentateuque" },
    { id: 'f2-55', question: "Le livre centré sur les lois des prêtres ?", answer: "Lévitique", category: "Pentateuque" },
    { id: 'f2-56', question: "Le livre des recensements ?", answer: "Nombres", category: "Pentateuque" },
    { id: 'f2-57', question: "Le livre de la répétition de la Loi ?", answer: "Deutéronome", category: "Pentateuque" },
    { id: 'f2-58', question: "Qui a écrit traditionnellement ces cinq livres ?", answer: "Moïse", category: "Pentateuque" },
    // Thème: Prophètes
    { id: 'f2-p1', question: "Quel prophète a été jeté dans la fosse aux lions ?", answer: "Daniel", category: "Prophètes" },
    { id: 'f2-p2', question: "Le prophète appelé 'le prophète qui pleure' ?", answer: "Jérémie", category: "Prophètes" },
    { id: 'f2-p3', question: "Qui a vu une vallée d'ossements se ranimer ?", answer: "Ézéchiel", category: "Prophètes" },
    { id: 'f2-p4', question: "Quel prophète a dénoncé le péché de David avec Bathschéba ?", answer: "Nathan", category: "Prophètes" },
    // Thème: Genèse
    { id: 'f2-g1', question: "Qui est le premier fils d'Adam et Ève ?", answer: "Caïn", category: "Genèse" },
    { id: 'f2-g2', question: "Combien de jours a duré le déluge (pluie) ?", answer: "40 jours", category: "Genèse" },
    { id: 'f2-g3', question: "Qui a construit la tour de Babel ?", answer: "Nimrod", category: "Genèse" },
    { id: 'f2-g4', question: "Le fils d'Abraham et d'Agar ?", answer: "Ismaël", category: "Genèse" },
    // Thème: Actes
    { id: 'f2-a1', question: "Où les disciples furent appelés chrétiens pour la première fois ?", answer: "Antioche", category: "Actes" },
    { id: 'f2-a2', question: "Qui a accompagné Paul dans la prison de Philippe ?", answer: "Silas", category: "Actes" },
    { id: 'f2-a3', question: "Le couple frappé de mort pour avoir menti au Saint-Esprit ?", answer: "Ananias et Saphira", category: "Actes" },
    { id: 'f2-a4', question: "Qui a prêché à l'eunuque éthiopien sur la route de Gaza ?", answer: "Philippe", category: "Actes" },
    // Thème: Psaumes et Proverbes
    { id: 'f2-ps1', question: "Combien y a-t-il de Psaumes dans la Bible ?", answer: "150", category: "Psaumes" },
    { id: 'f2-ps2', question: "Le Psaume qui commence par 'L'Éternel est mon berger' ?", answer: "Psaume 23", category: "Psaumes" },
    { id: 'f2-ps3', question: "Quel roi est l'auteur principal des Proverbes ?", answer: "Salomon", category: "Proverbes" },
    { id: 'f2-ps4', question: "Le Psaume le plus long de la Bible ?", answer: "Psaume 119", category: "Psaumes" },
    // Thème: Exode et Désert
    { id: 'f2-ex1', question: "Quel aliment miraculeux tombait du ciel le matin ?", answer: "La manne", category: "Exode" },
    { id: 'f2-ex2', question: "Qu'est-ce que Moïse a frappé pour faire sortir de l'eau ?", answer: "Le rocher", category: "Exode" },
    { id: 'f2-ex3', question: "Quelle montagne est le lieu du don de la Loi ?", answer: "Sinaï", category: "Exode" },
    { id: 'f2-ex4', question: "Combien d'années Israël a-t-il erré dans le désert ?", answer: "40 ans", category: "Exode" },
    // Thème: Juges
    { id: 'f2-j1', question: "La seule femme juge d'Israël ?", answer: "Débora", category: "Juges" },
    { id: 'f2-j2', question: "Le juge qui a vaincu avec 300 hommes ?", answer: "Gédéon", category: "Juges" },
    { id: 'f2-j3', question: "Le juge dont la force était dans ses cheveux ?", answer: "Samson", category: "Juges" },
    { id: 'f2-j4', question: "Le juge qui a fait un vœu imprudent concernant sa fille ?", answer: "Jephthé", category: "Juges" },
    // Thème: Villes
    { id: 'f2-v1', question: "La ville où Jésus a grandi ?", answer: "Nazareth", category: "Villes" },
    { id: 'f2-v2', question: "La ville célèbre pour ses jardins suspendus (Bible) ?", answer: "Babylone", category: "Villes" },
    { id: 'f2-v3', question: "Où Pierre a-t-il eu la vision de la nappe descendant du ciel ?", answer: "Joppé", category: "Villes" },
    { id: 'f2-v4', question: "La ville de naissance de l'apôtre Paul ?", answer: "Tarse", category: "Villes" },
    // Thème: Loi
    { id: 'f2-l1', question: "Sur quel support les 10 commandements furent écrits ?", answer: "Tables de pierre", category: "Loi" },
    { id: 'f2-l2', question: "Quel est le premier commandement avec une promesse ?", answer: "Honore ton père et ta mère", category: "Loi" },
    { id: 'f2-l3', question: "Quel jour de la semaine est consacré au repos selon la Loi ?", answer: "Le sabbat", category: "Loi" },
    { id: 'f2-l4', question: "Le résumé de la Loi selon Jésus ?", answer: "L'amour", category: "Loi" },
    // Thème: Actes et Miracles
    { id: 'f2-59', question: "Qui a été libéré de prison par un ange ?", answer: "Pierre", category: "Actes" },
    { id: 'f2-60', question: "Qui a été frappé d'aveuglement sur le chemin de Damas ?", answer: "Saul", category: "Paul" },
    { id: 'f2-61', question: "Le premier martyr chrétien ?", answer: "Étienne", category: "Martyrs" },
    { id: 'f2-62', question: "Le centurion romain dont la foi a étonné Jésus ?", answer: "Corneille", category: "Foi" },
    { id: 'f2-63', question: "Qui a été guéri après avoir touché le bord du vêtement de Jésus ?", answer: "La femme malade", category: "Miracles" },
    { id: 'f2-64', question: "Ce que Pierre a trouvé dans la bouche du poisson ?", answer: "Une pièce", category: "Miracles" },
  ],
  3: [
    {
      id: 'f3-1',
      answer: "David",
      clues: [
        "Je suis le plus jeune de huit frères.",
        "J'étais un simple berger avant de devenir roi.",
        "J'ai vaincu un géant avec une simple fronde.",
        "On m'attribue la plupart des Psaumes."
      ],
      explanation: "Élu par Dieu pour succéder au roi Saül, David est l'ancêtre du Messie et l'auteur de nombreux Psaumes."
    },
    {
      id: 'f3-2',
      answer: "Moïse",
      clues: [
        "J'ai été sauvé des eaux du Nil étant bébé.",
        "J'ai vu un buisson qui brûlait sans se consumer.",
        "J'ai guidé le peuple d'Israël hors d'Égypte.",
        "J'ai reçu la Loi sur le mont Sinaï."
      ],
      explanation: "Prophète majeur chargé par Dieu de libérer les Hébreux de l'esclavage en Égypte et de leur remettre la Loi."
    },
    {
      id: 'f3-3',
      answer: "Paul",
      clues: [
        "Je m'appelais Saul de Tarse autrefois.",
        "J'ai rencontré Jésus sur le chemin de Damas.",
        "J'ai écrit de nombreuses lettres aux Églises.",
        "On m'appelle l'Apôtre des Gentils."
      ],
      explanation: "Pharisien converti miraculeusement, il devint le plus grand missionnaire du Nouveau Testament vers les non-Juifs."
    },
    {
      id: 'f3-4',
      answer: "Salomon",
      clues: [
        "Mon père était le roi David.",
        "Je suis célèbre pour ma grande sagesse.",
        "J'ai construit le premier Temple à Jérusalem.",
        "On dit que j'ai écrit le livre des Proverbes."
      ],
      explanation: "Roi d'Israël réputé pour sa sagesse infinie et la construction du temple de l'Éternel à Jérusalem."
    },
    {
      id: 'f3-5',
      answer: "Abraham",
      clues: [
        "Je suis considéré comme le père de la foi.",
        "Dieu m'a demandé de quitter mon pays pour une terre inconnue.",
        "Ma femme s'appelait Sara.",
        "Mon fils s'appelait Isaac."
      ],
      explanation: "Patriarche avec qui Dieu a conclu une alliance, promettant de faire de lui le père d'une multitude de nations."
    },
    {
      id: 'f3-6',
      answer: "Noé",
      clues: [
        "J'ai trouvé grâce aux yeux de l'Éternel dans un monde corrompu.",
        "Dieu m'a donné les dimensions exactes d'une grande structure.",
        "J'ai survécu avec ma famille à une catastrophe mondiale.",
        "L'arc-en-ciel est le signe de l'alliance de Dieu avec moi."
      ],
      explanation: "Juste parmi sa génération, il bâtit l'arche pour sauver sa famille et les animaux du Déluge."
    },
    {
      id: 'f3-7',
      answer: "Joseph",
      clues: [
        "Mon père m'a offert une tunique de plusieurs couleurs.",
        "Mes frères m'ont vendu comme esclave par jalousie.",
        "Je suis passé de la prison au palais de Pharaon.",
        "J'ai sauvé l'Égypte et ma famille de la famine."
      ],
      explanation: "Fils de Jacob, il devint gouverneur d'Égypte après avoir interprété les rêves de Pharaon."
    },
    {
      id: 'f3-8',
      answer: "Samson",
      clues: [
        "Je fus un juge d'Israël consacré dès le ventre de ma mère.",
        "Ma force résidait dans le fait que mon rasoir ne passait jamais sur ma tête.",
        "J'ai tué un lion à mains nues.",
        "J'ai été trahi par une femme nommée Dalila."
      ],
      explanation: "Naziréen doué d'une force surhumaine, il combattit les Philistins pour libérer Israël."
    },
    {
      id: 'f3-9',
      answer: "Jean-Baptiste",
      clues: [
        "Je criais dans le désert 'Préparez le chemin du Seigneur'.",
        "Je me nourrissais de sauterelles et de miel sauvage.",
        "J'ai eu le privilège de baptiser le Messie dans le Jourdain.",
        "Hérode m'a fait décapiter à cause d'une promesse."
      ],
      explanation: "Le précurseur du Messie, dernier des prophètes de l'ancienne alliance, il désigna Jésus comme l'Agneau de Dieu."
    },
    {
      id: 'f3-10',
      answer: "Esther",
      clues: [
        "J'étais un jeune orpheline juive devenue reine de Perse.",
        "J'ai risqué ma vie en me présentant devant le roi sans invitation.",
        "Avec l'aide de mon cousin Mardochée, j'ai sauvé mon peuple.",
        "La fête de Pourim célèbre cette délivrance."
      ],
      explanation: "Reine courageuse qui s'interposa pour annuler le décret d'extermination des Juifs en Perse."
    },
    {
      id: 'f3-11',
      answer: "Lazare",
      clues: [
        "Je suis le frère de Marthe et de Marie.",
        "J'habitais à Béthanie.",
        "J'étais mort depuis quatre jours quand Jésus est venu.",
        "Jésus a pleuré avant de me dire de sortir du tombeau."
      ],
      explanation: "Ami proche de Jésus, sa résurrection est l'un des miracles les plus marquants avant la Passion."
    },
    {
      id: 'f3-12',
      answer: "Élie",
      clues: [
        "J'ai défié les prophètes de Baal sur le mont Carmel.",
        "J'ai été nourri par des corbeaux près du torrent de Kerith.",
        "Je n'ai pas connu la mort physique.",
        "Je suis monté au ciel dans un char de feu."
      ],
      explanation: "L'un des plus grands prophètes d'Israël, symbole de la puissance prophétique."
    },
    {
      id: 'f3-13',
      answer: "Daniel",
      clues: [
        "J'ai été déporté à Babylone étant jeune.",
        "J'ai refusé de manger les mets du roi pour rester pur.",
        "J'ai interprété le songe de la statue de Nabuchodonosor.",
        "Je suis sorti indemne de la fosse aux lions."
      ],
      explanation: "Prophète et haut fonctionnaire à Babylone, connu pour sa fidélité inébranlable à Dieu."
    },
    {
      id: 'f3-14',
      answer: "Gédéon",
      clues: [
        "Je me considérais comme le plus petit dans la maison de mon père.",
        "J'ai demandé un signe à Dieu avec une toison de laine.",
        "J'ai réduit mon armée de 32 000 à seulement 300 hommes.",
        "J'ai vaincu les Madianites avec des trompettes et des cruches."
      ],
      explanation: "Juge d'Israël qui libéra le peuple par une victoire miraculeuse ordonnée par Dieu."
    },
    {
      id: 'f3-15',
      answer: "Thomas",
      clues: [
        "On m'appelait aussi Didyme.",
        "J'étais l'un des douze apôtres.",
        "J'ai dit que je ne croirais pas sans voir les marques des clous.",
        "J'ai fini par m'écrier : 'Mon Seigneur et mon Dieu !'."
      ],
      explanation: "Apôtre célèbre pour son doute initial, qui témoigna finalement d'une foi profonde."
    },
    {
      id: 'f3-16',
      answer: "Jérusalem",
      clues: [
        "Je suis une ville située sur des montagnes.",
        "On m'appelle la ville de la paix.",
        "Le roi David m'a choisie pour capitale.",
        "Je suis le lieu où se trouvait le Temple de Dieu."
      ],
      explanation: "Ville sainte centrale dans toute la Bible, lieu du Temple et de la passion de Jésus."
    },
    {
      id: 'f3-17',
      answer: "Marie-Madeleine",
      clues: [
        "J'ai été délivrée de sept démons par Jésus.",
        "Je suis restée au pied de la croix.",
        "Je suis allée au tombeau tôt le matin du dimanche.",
        "Je suis la première personne à avoir vu Jésus ressuscité."
      ],
      explanation: "Fidèle disciple de Jésus, elle est le témoin privilégié de la Résurrection."
    },
    {
      id: 'f3-18',
      answer: "Jonas",
      clues: [
        "Dieu m'a ordonné d'aller prêcher à Ninive.",
        "J'ai essayé de m'enfuir par bateau à Tarsis.",
        "J'ai passé trois jours et trois nuits dans l'obscurité.",
        "Un grand poisson m'a vomi sur la terre ferme."
      ],
      explanation: "Prophète dont l'histoire préfigure la mort et la résurrection du Christ."
    },
    {
      id: 'f3-19',
      answer: "Tabernacle",
      clues: [
        "Je suis une structure mobile transportée dans le désert.",
        "Je servais de sanctuaire pour la présence de Dieu.",
        "Je contenais l'Arche de l'Alliance.",
        "J'étais composé de rideaux, de peaux et d'un voile."
      ],
      explanation: "Tente sacrée lieu de rencontre entre Dieu et Israël avant la construction du Temple fixe."
    },
    {
      id: 'f3-20',
      answer: "Saül",
      clues: [
        "Je suis issu de la tribu de Benjamin.",
        "J'étais d'une taille supérieure à tout le peuple.",
        "Je suis devenu le tout premier roi d'Israël.",
        "J'ai fini par perdre la faveur de Dieu au profit de David."
      ],
      explanation: "Premier roi d'Israël dont le règne commença bien mais finit tragiquement par sa désobéissance."
    },
    {
      id: 'f3-21',
      answer: "Jézabel",
      clues: [
        "J'étais une princesse phénicienne devenue reine d'Israël.",
        "J'ai imposé le culte de Baal à tout le pays.",
        "J'ai persécuté les prophètes de l'Éternel, surtout Élie.",
        "Ma fin fut tragique, jetée par une fenêtre."
      ],
      explanation: "Épouse du roi Achab, elle symbolise l'apostasie et la méchanceté dans l'Ancien Testament."
    },
    {
      id: 'f3-22',
      answer: "Boaz",
      clues: [
        "Je suis un riche propriétaire terrien de Bethléem.",
        "J'ai permis à une étrangère de glaner dans mes champs.",
        "Je suis devenu le 'rédempteur' de la famille de Noémi.",
        "Je suis l'époux de Ruth et l'arrière-grand-père du roi David."
      ],
      explanation: "Homme de bonté et de piété, son mariage avec Ruth la Moabite l'intégra dans la lignée du Messie."
    },
    {
      id: 'f3-23',
      answer: "Nicodème",
      clues: [
        "Je suis un chef des Juifs et membre du Sanhédrin.",
        "Je suis venu voir Jésus de nuit pour lui poser des questions.",
        "J'ai entendu Jésus me parler de la nécessité de 'naître de nouveau'.",
        "J'ai aidé à l'ensevelissement du corps de Jésus."
      ],
      explanation: "Pharisien sincère qui, malgré sa position, a reconnu en Jésus un docteur venu de Dieu."
    },
    {
      id: 'f3-24',
      answer: "Matthieu",
      clues: [
        "Je travaillais pour l'occupant romain avant de suivre Jésus.",
        "J'étais assis à mon bureau de péage quand j'ai été appelé.",
        "J'ai organisé un grand festin pour Jésus chez moi.",
        "Je suis le rédacteur du premier évangile."
      ],
      explanation: "Ancien collecteur d'impôts, il a écrit son évangile principalement pour un public juif."
    },
    {
      id: 'f3-25',
      answer: "L'Arche de l'Alliance",
      clues: [
        "Je suis un coffre sacré recouvert d'or.",
        "Deux chérubins se font face sur mon couvercle.",
        "Je contenais les tables de la Loi, la manne et le bâton d'Aaron.",
        "Ma présence symbolisait la résidence de Dieu au milieu de Son peuple."
      ],
      explanation: "Objet le plus sacré du Tabernacle puis du Temple, centre de la manifestation de la gloire de Dieu."
    }
  ]
};

async function generateContentWithRetry(options: {
  contents: any;
  config: any;
  retries?: number;
  initialDelay?: number;
}) {
  const { contents, config, retries = 2, initialDelay = 800 } = options;
  let delay = initialDelay;

  // Try gemini-3.5-flash first with fast retries
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const ai = getAI();
      if (!ai) {
        throw new Error("GEMINI_API_KEY is missing");
      }
      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config,
      });
      return result;
    } catch (error: any) {
      const code = error.status || (error.response?.status) || 500;
      const msg = (error.message || String(error)).toLowerCase();
      
      const isHardQuotaLimit = code === 429 && (msg.includes("quota") || msg.includes("plan") || msg.includes("billing"));
      const isRetriable = !isHardQuotaLimit && (code === 503 || code === 429 || msg.includes("high demand") || msg.includes("overloaded"));

      if (isRetriable && attempt < retries) {
        console.warn(`[GEMINI 3.5 ATTEMPT ${attempt}] Transient error ${code} encountered: ${msg.substring(0, 80)}. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 1.5;
      } else {
        console.warn(`[GEMINI 3.5 FAILED] Falling back to gemini-3.1-flash-lite. Error: ${msg.substring(0, 80)}`);
        break;
      }
    }
  }

  // Fallback to gemini-3.1-flash-lite
  try {
    const ai = getAI();
    if (!ai) {
      throw new Error("GEMINI_API_KEY is missing");
    }
    const result = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents,
      config,
    });
    console.log("[GEMINI 3.1 SUCCESS] Successfully generated content using fallback model gemini-3.1-flash-lite.");
    return result;
  } catch (fallbackError: any) {
    const code = fallbackError.status || (fallbackError.response?.status) || 500;
    const msg = (fallbackError.message || String(fallbackError)).toLowerCase();
    console.warn(`[GEMINI 3.1 FAILED] Fallback model also failed with code ${code}: ${msg.substring(0, 80)}`);
    throw fallbackError;
  }
}

const inMemoryCache: Record<string, any[]> = {};

function populateStage1Choices(questions: any[]): any[] {
  if (!Array.isArray(questions) || questions.length === 0) return [];
  
  const allAnswers = Array.from(new Set(questions.map((q: any) => q.answer).filter(Boolean))) as string[];

  return questions.map((q: any) => {
    if (q.choices && Array.isArray(q.choices) && q.choices.length === 4) {
      const hasAnswer = q.choices.some((c: string) => c.toLowerCase() === q.answer.toLowerCase());
      if (hasAnswer) return q;
    }

    const choicesSet = new Set<string>();
    choicesSet.add(q.answer);

    const otherAnswers = allAnswers.filter((ans: string) => ans.toLowerCase() !== q.answer.toLowerCase());

    const shuffledOthers = [...otherAnswers].sort(() => Math.random() - 0.5);
    for (const dist of shuffledOthers) {
      if (choicesSet.size >= 4) break;
      choicesSet.add(dist);
    }

    const fallbackOptions = ["Noé", "Moïse", "David", "Marie", "Jérusalem", "Genèse", "Apocalypse", "Pierre", "Paul", "Jean", "Samson", "Isaac", "Salomon"];
    for (const opt of fallbackOptions) {
      if (choicesSet.size >= 4) break;
      if (opt.toLowerCase() !== q.answer.toLowerCase()) {
        choicesSet.add(opt);
      }
    }

    const finalChoices = Array.from(choicesSet).sort(() => Math.random() - 0.5);

    return {
      ...q,
      choices: finalChoices
    };
  });
}

const BIBLICAL_TOPICS = [
  "Noé, son arche et le Déluge",
  "Genèse, d'Adam à Abraham, Isaac, Jacob",
  "L'Exode, Moïse, les dix plaies d'Égypte",
  "Les commandements, le Lévitique, le Tabernacle",
  "La conquête de Canaan, Josué, Jéricho",
  "Les Juges: Samson, Gédéon, Débora",
  "La royauté de Saül et David du berger au trône",
  "La sagesse de Salomon, le Temple de Jérusalem",
  "Le prophète Élie et son successeur Élisée",
  "Les prophètes majeurs: Isaïe, Jérémie, Ézéchiel",
  "Les prophéties de Daniel à Babylone ou dans la fosse aux lions",
  "Les petits prophètes: Jonas et Ninive, Osée, Michée",
  "Les héroïnes de foi: Ruth, Esther, Judith, Sara",
  "Les Psaumes de David, Proverbes et Cantiques",
  "La reconstruction de Jérusalem: Néhémie, Esdras",
  "La naissance de Jésus, les bergers et mages",
  "Jean-Baptiste et le baptême au fleuve Jourdain",
  "Le Sermon sur la montagne, le sel de la terre et les Béatitudes",
  "Les miracles de Jésus (les noces de Cana, la multiplication des pains, la tempête apaisée)",
  "Les paraboles du Royaume (le semeur, le fils prodigue, le bon Samaritain)",
  "Les apôtres et disciples directs de Jésus (Jean, Pierre, André, Matthieu)",
  "La trahison de Judas et le reniement de Pierre",
  "Le procès de Jésus, sa crucifixion et résurrection",
  "La Pentecôte et les débuts de l'Église primitive",
  "La conversion de Saul de Tarse ( l'apôtre Paul ) sur le chemin de Damas",
  "Les voyages missionnaires de l'apôtre Paul à Athènes, Éphèse ou Corinthe",
  "Les révélations de l'Apocalypse aux sept Églises"
];

app.post("/api/questions/generate", async (req, res) => {
  const { stage, category, theme, exclude = [] } = req.body;
  const cacheKey = `${stage}-${theme || 'default'}-${category || 'default'}`;

  // Filter out excluded elements from current cache pool
  let cachedItems = inMemoryCache[cacheKey] || [];
  if (exclude && Array.isArray(exclude) && exclude.length > 0) {
    const excludeSet = new Set(exclude.map((x: any) => String(x || '').toLowerCase().trim()));
    cachedItems = cachedItems.filter((item: any) => {
      if (!item) return false;
      const questionLower = item.question ? item.question.toLowerCase().trim() : '';
      const answerLower = item.answer ? item.answer.toLowerCase().trim() : '';
      const idLower = item.id ? item.id.toLowerCase().trim() : '';
      return !excludeSet.has(questionLower) && !excludeSet.has(answerLower) && !excludeSet.has(idLower);
    });
  }

  // Serve from cache if available to save quota
  // We want a massive pool of unique questions to ensure excellent variety
  const stage1Threshold = 150;
  const stage2Threshold = 80;
  const stage3Threshold = 30;

  const threshold = stage === 1 ? stage1Threshold : stage === 2 ? stage2Threshold : stage3Threshold;

  if (cachedItems.length >= threshold) {
    console.log(`Serving cached questions for Stage ${stage} (${theme || 'general'}) - Pool size after exclude: ${cachedItems.length}`);
    let selected = cachedItems.sort(() => Math.random() - 0.5).slice(0, stage === 1 ? 15 : stage === 2 ? 12 : 8);
    if (stage === 1) {
      selected = populateStage1Choices(selected);
    }
    return res.json(selected);
  }

  let prompt = "";
  let responseSchema: any = {};

  if (stage === 1) {
    // Pick 3 random topics to guarantee topic variety in the LLM output
    const sampledTopics = [...BIBLICAL_TOPICS].sort(() => Math.random() - 0.5).slice(0, 3);
    prompt = `Générez 15 questions bibliques variées pour l'étape "Les 9 à la suite" avec chacune 4 propositions au choix (dont la bonne réponse).
    Évitez les questions trop basiques ou répétitives. Proposez un mélange de personnages, lieux, événements et faits doctrinaux.
    Pour ce lot de questions, demandez spécifiquement d'avoir des questions reliées à ces thèmes ou livres bibliques : ${sampledTopics.join(", ")}.
    Variation demandée (graine aléatoire interne: ${Math.floor(Math.random() * 100000)}).
    Pour chaque question, fournissez "choices" contenant la bonne réponse et 3 autres choix plausibles mais faux de la même nature. La bonne réponse de la question (le champ "answer") DOIT figurer exactement à l'intérieur du champ "choices".
    Format: court, direct, réponse simple.`;
    responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          question: { type: Type.STRING },
          answer: { type: Type.STRING },
          category: { type: Type.STRING },
          choices: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "4 options de réponses proposées de même type, dont la bonne réponse exacte."
          }
        },
        required: ["id", "question", "answer", "choices"]
      }
    };
  } else if (stage === 2) {
    prompt = `Générez 12 questions BIBLIQUES extrêmement variées qui portent EXCLUSIVEMENT sur le thème précis : "${theme}". 
    Il est vital que chaque question soit directement liée à ce thème.
    
    CONSIGNES DE DIVERSIFICATION :
    - Vos questions doivent provenir d'une exploration profonde de la Parole de Dieu, de la Genèse à l'Apocalypse (partout où ce thème s'applique).
    - Variez les livres bibliques d'origine, les époques historiques et les personnages impliqués.
    - Évitez les questions trop simples, évidentes ou superficielles. Cherchez des détails d'histoire, des faits théologiques ou des citations significatives propres à ce thème.
    - Graine aléatoire interne pour forcer la variété : ${Math.floor(Math.random() * 100000)}.`;
    responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          question: { type: Type.STRING },
          answer: { type: Type.STRING }
        },
        required: ["id", "question", "answer"]
      }
    };
  } else if (stage === 3) {
    prompt = `Générez 8 questions extrêmement riches et variées pour le "Face-à-Face Final", couvrant toute la Bible (de la Genèse à l'Apocalypse). 
    Chaque question doit porter sur un personnage, un lieu, un symbole ou un événement biblique majeur (Ancien et Nouveau Testament confondus). 
    Chaque question doit avoir 4 indices (clues) de plus en plus faciles, et une brève explication biblique (contexte) de la réponse.
    Graine de variation interne : ${Math.floor(Math.random() * 100000)}.`;
    responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          answer: { type: Type.STRING },
          clues: {
             type: Type.ARRAY,
             items: { type: Type.STRING },
             description: "4 indices, du plus dur au plus facile"
          },
          explanation: { type: Type.STRING, description: "Une brève explication biblique ou contexte de la réponse." }
        },
        required: ["id", "answer", "clues", "explanation"]
      }
    };
  }

  // Appending exclusion to prompt for variety
  if (exclude && Array.isArray(exclude) && exclude.length > 0) {
    const cleanExclude = exclude.filter((x: any) => x && String(x).trim().length > 0).slice(-25);
    if (cleanExclude.length > 0) {
      prompt += `\n\nIMPORTANT : Ne posez PAS de questions identiques, similaires ou s'approchant de ces questions/réponses déjà posées : [${cleanExclude.join(", ")}]. Innovez pour assurer une excellente diversité et éviter absolument toute répétition !`;
    }
  }

  try {
    const result = await generateContentWithRetry({
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 1.15
      }
    });

    const data = JSON.parse(result?.text || "[]");
    
    // Store in cache
    if (Array.isArray(data) && data.length > 0) {
      if (!inMemoryCache[cacheKey]) inMemoryCache[cacheKey] = [];
      const newItems = [...inMemoryCache[cacheKey], ...data];
      const uniqueMap = new Map();
      newItems.forEach(item => {
        const key = item.question || item.answer;
        if (key) uniqueMap.set(key, item);
      });
      inMemoryCache[cacheKey] = Array.from(uniqueMap.values());
    }

    // Filter resulting dynamic API questions against exclusion again
    let finalQuestions = data;
    if (exclude && Array.isArray(exclude) && exclude.length > 0) {
      const excludeSet = new Set(exclude.map((x: any) => String(x || '').toLowerCase().trim()));
      finalQuestions = finalQuestions.filter((item: any) => {
        if (!item) return false;
        const questionLower = item.question ? item.question.toLowerCase().trim() : '';
        const answerLower = item.answer ? item.answer.toLowerCase().trim() : '';
        const idLower = item.id ? item.id.toLowerCase().trim() : '';
        return !excludeSet.has(questionLower) && !excludeSet.has(answerLower) && !excludeSet.has(idLower);
      });
    }

    if (stage === 1) {
      finalQuestions = populateStage1Choices(finalQuestions);
    }
    res.json(finalQuestions);
  } catch (error: any) {
    const msg = error.message || String(error);
    const code = error.status || (error.response?.status) || 500;
    
    if (code === 429) {
      console.warn(`[GEMINI QUOTA] Limite atteinte. Conseil: Vérifiez votre clé d'API dans Paramètres ou patientez car vous utilisez le quota gratuit.`);
    } else if (code === 403 || code === 401) {
      console.warn(`[GEMINI KEY] Clé API invalide ou non configurée.`);
    } else {
      console.warn(`Gemini Error (${code}):`, msg.substring(0, 100) + "...");
    }
    
    // Check if we have ANYTHING in cache for this SPECIFIC stage/theme
    let fallbackCache = inMemoryCache[cacheKey] || [];
    if (exclude && Array.isArray(exclude) && exclude.length > 0) {
      const excludeSet = new Set(exclude.map((x: any) => String(x || '').toLowerCase().trim()));
      fallbackCache = fallbackCache.filter((item: any) => {
        if (!item) return false;
        const questionLower = item.question ? item.question.toLowerCase().trim() : '';
        const answerLower = item.answer ? item.answer.toLowerCase().trim() : '';
        const idLower = item.id ? item.id.toLowerCase().trim() : '';
        return !excludeSet.has(questionLower) && !excludeSet.has(answerLower) && !excludeSet.has(idLower);
      });
    }

    if (fallbackCache.length >= (stage === 1 ? 9 : stage === 2 ? 4 : 1)) {
       console.log(`[FALLBACK] Utilisation du cache spécifique excluant les répétitions (${cacheKey})`);
       const count = stage === 1 ? 15 : stage === 2 ? 12 : 8;
       let selected = fallbackCache.sort(() => Math.random() - 0.5).slice(0, count);
       if (stage === 1) {
         selected = populateStage1Choices(selected);
       }
       return res.json(selected);
    }

    const stageFallback = FALLBACKS[stage] || FALLBACKS[1];
    
    // For Stage 2, try to filter fallback data by theme/category if possible
    let filteredFallback = stageFallback;
    if (stage === 2 && theme) {
      const lowerTheme = theme.toLowerCase();
      filteredFallback = stageFallback.filter((q: any) => {
        if (!q.category) return false;
        const cat = q.category.toLowerCase();
        return lowerTheme.includes(cat) || cat.includes(lowerTheme) || 
               (cat === 'miracles' && lowerTheme.includes('miracles')) ||
               (cat === 'rois' && lowerTheme.includes('rois')) ||
               (cat === 'paul' && lowerTheme.includes('paul')) ||
               (cat === 'femmes' && lowerTheme.includes('femmes')) ||
               (cat === 'paraboles' && lowerTheme.includes('paraboles')) ||
               (cat === 'pentateuque' && lowerTheme.includes('pentateuque')) ||
               (cat === 'prophètes' && lowerTheme.includes('prophète')) ||
               (cat === 'genèse' && lowerTheme.includes('genèse')) ||
               (cat === 'actes' && lowerTheme.includes('actes')) ||
               (cat === 'psaumes' && lowerTheme.includes('psaume')) ||
               (cat === 'proverbes' && lowerTheme.includes('proverbe')) ||
               (cat === 'exode' && lowerTheme.includes('exode')) ||
               (cat === 'juges' && lowerTheme.includes('juge')) ||
               (cat === 'villes' && lowerTheme.includes('ville')) ||
               (cat === 'loi' && lowerTheme.includes('loi'));
      });
      
      if (filteredFallback.length < 4) {
        console.warn(`[FALLBACK] Pas assez de questions pour le thème "${theme}".`);
        filteredFallback = stageFallback.filter((q: any) => q.category === "Bible" || q.category === "Général");
        if (filteredFallback.length < 4) filteredFallback = stageFallback;
      }
    }

    // Apply exclusion filter with auto-relaxation to static fallbacks to guarantee no repeats
    if (exclude && Array.isArray(exclude) && exclude.length > 0) {
      let currentExclude = [...exclude];
      let attempts = 0;
      const requiredCount = stage === 1 ? 15 : stage === 2 ? 12 : 8;
      
      while (attempts < 5) {
        const excludeSet = new Set(currentExclude.map((x: any) => String(x || '').toLowerCase().trim()));
        const tempFiltered = filteredFallback.filter((item: any) => {
          if (!item) return false;
          const questionLower = item.question ? item.question.toLowerCase().trim() : '';
          const answerLower = item.answer ? item.answer.toLowerCase().trim() : '';
          const idLower = item.id ? item.id.toLowerCase().trim() : '';
          return !excludeSet.has(questionLower) && !excludeSet.has(answerLower) && !excludeSet.has(idLower);
        });
        
        if (tempFiltered.length >= requiredCount || currentExclude.length === 0) {
          filteredFallback = tempFiltered;
          break;
        }
        
        // Relax: slice exclusion list to keep only the most recent ones
        currentExclude = currentExclude.slice(Math.ceil(currentExclude.length / 2));
        attempts++;
      }
    }

    console.log(`[FALLBACK] Mode hors-ligne activé pour l'étape ${stage} (${theme || 'général'}) sans répétitions`);
    let finalFallback = filteredFallback.sort(() => Math.random() - 0.5).slice(0, stage === 1 ? 15 : stage === 2 ? 12 : 8);
    if (stage === 1) {
      finalFallback = populateStage1Choices(finalFallback);
    }
    res.json(finalFallback);
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

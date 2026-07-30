// Offline/Local question database ensuring the game is 100% playable without connection or server availability

export interface OfflineQuestionStage1 {
  id: string;
  question: string;
  answer: string;
  category: string;
  choices: string[];
}

export interface OfflineQuestionStage2 {
  id: string;
  question: string;
  answer: string;
}

export interface OfflineQuestionStage3 {
  id: string;
  answer: string;
  clues: string[];
  explanation: string;
}

export const OFFLINE_STAGE1: OfflineQuestionStage1[] = [
  {
    id: "off1-1",
    question: "Qui a construit l'arche salvatrice pour traverser le Déluge ?",
    answer: "Noé",
    category: "Ancien Testament",
    choices: ["Noé", "Abraham", "Moïse", "David"]
  },
  {
    id: "off1-2",
    question: "Quel arbre Dieu a-t-il formellement interdit de consommer en Éden ?",
    answer: "L'arbre de la connaissance du bien et du mal",
    category: "Genèse",
    choices: ["L'arbre de la vie", "L'arbre de la connaissance du bien et du mal", "Le figuier royal", "L'olivier sacré"]
  },
  {
    id: "off1-3",
    question: "Qui a reçu les Dix Commandements inscrits sur les tables de la loi ?",
    answer: "Moïse",
    category: "Loi",
    choices: ["Moïse", "Aaron", "Josué", "Élie"]
  },
  {
    id: "off1-4",
    question: "Combien de temps s'est abattue la pluie continuelle lors du Déluge ?",
    answer: "40 jours",
    category: "Ancien Testament",
    choices: ["7 jours", "12 jours", "40 jours", "120 jours"]
  },
  {
    id: "off1-5",
    question: "Dans quelle ville de Judée le Christ Jésus vit-il le jour ?",
    answer: "Bethléem",
    category: "Nouveau Testament",
    choices: ["Nazareth", "Jérusalem", "Bethléem", "Cana"]
  },
  {
    id: "off1-6",
    question: "Quel est le tout premier livre de la sainte Bible ?",
    answer: "Genèse",
    category: "Bible",
    choices: ["Genèse", "Exode", "Lévitique", "Psaumes"]
  },
  {
    id: "off1-7",
    question: "Quel est le tout dernier livre inspiré décrit dans la Bible ?",
    answer: "Apocalypse",
    category: "Bible",
    choices: ["Apocalypse", "Épître aux Romains", "Actes", "Évangile de Jean"]
  },
  {
    id: "off1-8",
    question: "Qui a été miraculously préservé après avoir été jeté dans la fosse aux lions ?",
    answer: "Daniel",
    category: "Prophètes",
    choices: ["Daniel", "Ézéchiel", "Jérémie", "Isaïe"]
  },
  {
    id: "off1-9",
    question: "Quel jeune homme berger terrassa le redoutable géant philistin Goliath ?",
    answer: "David",
    category: "Ancien Testament",
    choices: ["Saül", "David", "Samson", "Gédéon"]
  },
  {
    id: "off1-10",
    question: "Quel apôtre a renié Jésus trois fois de suite avant l'aube ?",
    answer: "Pierre",
    category: "Nouveau Testament",
    choices: ["Thomas", "Judas", "Pierre", "Jean"]
  },
  {
    id: "off1-11",
    question: "Pour combien de pièces d'argent Joseph fut-il vendu par ses frères ?",
    answer: "20 pièces",
    category: "Ancien Testament",
    choices: ["10 pièces", "20 pièces", "30 pièces", "50 pièces"]
  },
  {
    id: "off1-12",
    question: "Quel homme est réputé pour avoir possédé la plus longue longévité (969 ans) ?",
    answer: "Mathusalem",
    category: "Ancien Testament",
    choices: ["Mathusalem", "Énoch", "Adam", "Noé"]
  },
  {
    id: "off1-13",
    question: "Quelle mer Moïse a-t-il ouverte de sa verge lors du passage des Hébreux ?",
    answer: "Mer Rouge",
    category: "Miracles",
    choices: ["Mer Morte", "Mer Rouge", "Mer de Galilée", "Mer Méditerranée"]
  },
  {
    id: "off1-14",
    question: "Quel était le métier de Matthieu avant de devenir apôtre de Christ ?",
    answer: "Collecteur d'impôts",
    category: "Nouveau Testament",
    choices: ["Pêcheur", "Charpentier", "Collecteur d'impôts", "Tisseur de tentes"]
  },
  {
    id: "off1-15",
    question: "Sur quel relief de Moab Moïse s'éteignit-il de vieillesse ?",
    answer: "Mont Nebo",
    category: "Ancien Testament",
    choices: ["Mont Sinaï", "Mont Carmel", "Mont Nebo", "Mont des Oliviers"]
  },
  {
    id: "off1-16",
    question: "Quelle reine s'est déplacée d'orient pour éprouver la sagesse de Salomon ?",
    answer: "Reine de Saba",
    category: "Rois",
    choices: ["Reine de Saba", "Reine Jézabel", "Reine Esther", "Reine Vashti"]
  },
  {
    id: "off1-17",
    question: "Quel fleuve accueillit l'ensevelissement de Moïse bébé dans sa corbeille ?",
    answer: "Le Nil",
    category: "Géographie",
    choices: ["L'Euphrate", "Le Nil", "Le Jourdain", "Le Tigre"]
  },
  {
    id: "off1-18",
    question: "Combien de pains nourrirent la foule des cinq mille personnes ?",
    answer: "Cinq",
    category: "Miracles",
    choices: ["Deux", "Cinq", "Sept", "Douze"]
  },
  {
    id: "off1-19",
    question: "Qui fut le premier souverain oint sur le trône d'Israël ?",
    answer: "Saül",
    category: "Rois",
    choices: ["Saül", "David", "Salomon", "Jéroboam"]
  },
  {
    id: "off1-20",
    question: "Qui a succédé à Élie après son enlèvement dans le char de feu ?",
    answer: "Élisée",
    category: "Prophètes",
    choices: ["Élisée", "Ésaïe", "Jérémie", "Nathan"]
  },
  {
    id: "off1-21",
    question: "Dans quel livre de l'Ancien Testament trouve-t-on l'histoire de la reine Esther ?",
    answer: "Esther",
    category: "Femmes",
    choices: ["Ruth", "Esther", "Judith", "Néhémie"]
  },
  {
    id: "off1-22",
    question: "Quel roi de Juda a vu sa vie prolongée de 15 ans par l'Éternel ?",
    answer: "Ézéchias",
    category: "Rois",
    choices: ["Josias", "Ézéchias", "Manassé", "David"]
  },
  {
    id: "off1-23",
    question: "Quelle femme d'Isaac était la mère de Jacob et Ésaü ?",
    answer: "Rébecca",
    category: "Ancien Testament",
    choices: ["Sara", "Rachel", "Rébecca", "Léa"]
  },
  {
    id: "off1-24",
    question: "Dans quelle ville les disciples de Jésus ont-ils été appelés chrétiens pour la première fois ?",
    answer: "Antioche",
    category: "Nouveau Testament",
    choices: ["Jérusalem", "Antioche", "Rome", "Éphèse"]
  },
  {
    id: "off1-25",
    question: "Quel apôtre a écrit l'Évangile destiné principalement aux Juifs, montrant que Jésus est le Messie ?",
    answer: "Matthieu",
    category: "Nouveau Testament",
    choices: ["Jean", "Pierre", "Matthieu", "Luc"]
  },
  {
    id: "off1-26",
    question: "Quel disciple a remplacé Judas Iscariote dans le groupe des douze apôtres ?",
    answer: "Matthias",
    category: "Nouveau Testament",
    choices: ["Matthias", "Paul", "Barnabas", "Étienne"]
  },
  {
    id: "off1-27",
    question: "Quel jeune homme s'est endormi et est tombé d'une fenêtre pendant un sermon de l'apôtre Paul ?",
    answer: "Eutychus",
    category: "Nouveau Testament",
    choices: ["Eutychus", "Timothée", "Tite", "Philémon"]
  },
  {
    id: "off1-28",
    question: "Quel livre de la Bible contient le verset : 'L'Éternel est mon berger : je ne manquerai de rien' ?",
    answer: "Psaumes",
    category: "Bible",
    choices: ["Proverbes", "Psaumes", "Isaïe", "Genèse"]
  },
  {
    id: "off1-29",
    question: "Qui est la première personne à avoir vu Jésus après sa résurrection ?",
    answer: "Marie de Magdala",
    category: "Nouveau Testament",
    choices: ["Pierre", "Jean", "Marie de Magdala", "Marie, mère de Jésus"]
  },
  {
    id: "off1-30",
    question: "Sur quelle île l'apôtre Jean a-t-il reçu et écrit la vision de l'Apocalypse ?",
    answer: "Patmos",
    category: "Apocalypse",
    choices: ["Malte", "Patmos", "Chypre", "Crète"]
  },
  {
    id: "off1-31",
    question: "Quel prophète a été commandé par Dieu d'épouser une prostituée nommée Gomer ?",
    answer: "Osée",
    category: "Prophètes",
    choices: ["Osée", "Amos", "Michée", "Malachie"]
  },
  {
    id: "off1-32",
    question: "Quel homme juste de la Bible a perdu tous ses enfants, ses biens et sa santé mais est resté fidèle à Dieu ?",
    answer: "Job",
    category: "Sagesse",
    choices: ["Job", "Abraham", "Noé", "Daniel"]
  },
  {
    id: "off1-33",
    question: "Quel roi de Babylone a fait jeter les compagnons de Daniel dans la fournaise ardente ?",
    answer: "Nebucadnetsar",
    category: "Ancien Testament",
    choices: ["Belschatsar", "Darius", "Cyrus", "Nebucadnetsar"]
  },
  {
    id: "off1-34",
    question: "Quel est le nom de l'épouse de Moïse, fille du prêtre de Madian ?",
    answer: "Séphora",
    category: "Ancien Testament",
    choices: ["Marie", "Séphora", "Agar", "Ruth"]
  },
  {
    id: "off1-35",
    question: "Combien de tribus composaient le peuple d'Israël ?",
    answer: "12",
    category: "Ancien Testament",
    choices: ["7", "10", "12", "40"]
  },
  {
    id: "off1-36",
    question: "Quel prophète a confronté le roi Achab et les 450 prophètes de Baal sur le mont Carmel ?",
    answer: "Élie",
    category: "Prophètes",
    choices: ["Élie", "Élisée", "Nathan", "Isaïe"]
  },
  {
    id: "off1-37",
    question: "Quel est l'auteur principal du livre de l'Ecclésiaste, qui déclare 'Vanité des vanités, tout est vanité' ?",
    answer: "Salomon",
    category: "Sagesse",
    choices: ["David", "Salomon", "Moïse", "Jérémie"]
  },
  {
    id: "off1-38",
    question: "Quel roi de Juda a aboli l'idolâtrie et retrouvé le livre de la Loi dans le Temple à l'âge de 26 ans ?",
    answer: "Josias",
    category: "Rois",
    choices: ["Salomon", "Josias", "Ézéchias", "Asa"]
  },
  {
    id: "off1-39",
    question: "Dans le livre de l'Exode, sous quelle forme Dieu est-il apparu pour la première fois à Moïse ?",
    answer: "Un buisson ardent",
    category: "Ancien Testament",
    choices: ["Une nuée lumineuse", "Un buisson ardent", "Une tempête de feu", "Un ange armé"]
  },
  {
    id: "off1-40",
    question: "Qui était le père du roi David ?",
    answer: "Isaï",
    category: "Ancien Testament",
    choices: ["Jessé", "Saül", "Isaï", "Samuel"]
  },
  {
    id: "off1-41",
    question: "Quel ami de Jésus, frère de Marthe et Marie, a été ressuscité après quatre jours dans le tombeau ?",
    answer: "Lazare",
    category: "Miracles",
    choices: ["Lazare", "Simon", "Jean", "Barthélemy"]
  },
  {
    id: "off1-42",
    question: "Combien de jours s'écoulèrent entre la résurrection de Jésus et son Ascension au ciel ?",
    answer: "40 jours",
    category: "Nouveau Testament",
    choices: ["3 jours", "7 jours", "40 jours", "50 jours"]
  },
  {
    id: "off1-43",
    question: "Quel miracle Jésus a-t-il accompli aux noces de Cana ?",
    answer: "Changer l'eau en vin",
    category: "Miracles",
    choices: ["Guérir un aveugle", "Changer l'eau en vin", "Marcher sur l'eau", "Multiplier les poissons"]
  },
  {
    id: "off1-44",
    question: "Qui était le souverain sacrificateur d'Israël qui a présidé le procès religieux de Jésus ?",
    answer: "Caïphe",
    category: "Nouveau Testament",
    choices: ["Anne", "Caïphe", "Pilate", "Hérode"]
  },
  {
    id: "off1-45",
    question: "Quel prophète a eu la vision d'une vallée d'ossements desséchés qui reprenaient vie ?",
    answer: "Ézéchiel",
    category: "Prophètes",
    choices: ["Isaïe", "Jérémie", "Ézéchiel", "Daniel"]
  },
  {
    id: "off1-46",
    question: "Quel apôtre, autrefois appelé Lévi, était collecteur d'impôts avant d'être appelé par Jésus ?",
    answer: "Matthieu",
    category: "Nouveau Testament",
    choices: ["Jean", "Matthieu", "Thomas", "Jacques"]
  },
  {
    id: "off1-47",
    question: "De quel animal de sacrifice Abraham a-t-il disposé à la place de son fils Isaac sur le mont Morija ?",
    answer: "Un bélier",
    category: "Ancien Testament",
    choices: ["Un bélier", "Un agneau", "Un veau", "Une colombe"]
  },
  {
    id: "off1-48",
    question: "Quel souverain perse a promulgué le décret permettant aux Juifs de retourner à Jérusalem pour rebâtir le Temple ?",
    answer: "Cyrus",
    category: "Ancien Testament",
    choices: ["Artaxerxès", "Darius", "Cyrus", "Xerxès"]
  },
  {
    id: "off1-49",
    question: "Qui a dirigé la reconstruction des murailles de Jérusalem après l'exil ?",
    answer: "Néhémie",
    category: "Ancien Testament",
    choices: ["Esdras", "Néhémie", "Zorobabel", "Josué"]
  },
  {
    id: "off1-50",
    question: "Quelle femme pieuse a enfanté le prophète Samuel après avoir prié Dieu avec larmes au tabernacle de Silo ?",
    answer: "Anne",
    category: "Ancien Testament",
    choices: ["Péninna", "Anne", "Élisabeth", "Sara"]
  },
  {
    id: "off1-51",
    question: "Quel est le nom du mont sur lequel l'arche de Noé s'est posée après le Déluge ?",
    answer: "Mont Ararat",
    category: "Genèse",
    choices: ["Mont Sinaï", "Mont Ararat", "Mont Carmel", "Mont Horeb"]
  },
  {
    id: "off1-52",
    question: "Quel était le péché d'Ananias et Saphira dans le livre des Actes des Apôtres ?",
    answer: "Mentir au Saint-Esprit sur le prix d'un champ",
    category: "Nouveau Testament",
    choices: ["Voler le trésor du temple", "Mentir au Saint-Esprit sur le prix d'un champ", "Adorer des faux dieux", "Régner injustement"]
  },
  {
    id: "off1-53",
    question: "Qui a traduit la Bible en latin sous le nom de la Vulgate ?",
    answer: "Saint Jérôme",
    category: "Bible",
    choices: ["Saint Augustin", "Saint Jérôme", "Origène", "Eusèbe de Césarée"]
  },
  {
    id: "off1-54",
    question: "Quelle femme de Moab a dit à sa belle-mère Naomi : 'Ton peuple sera mon peuple, et ton Dieu sera mon Dieu' ?",
    answer: "Ruth",
    category: "Femmes",
    choices: ["Orpa", "Ruth", "Esther", "Vashti"]
  },
  {
    id: "off1-55",
    question: "Quel fils d'Adam et Ève a été donné par Dieu pour remplacer Abel qui avait été tué ?",
    answer: "Seth",
    category: "Genèse",
    choices: ["Seth", "Hénoc", "Lamech", "Noé"]
  },
  {
    id: "off1-56",
    question: "Quel apôtre a été mordu par une vipère sur l'île de Malte sans en subir aucun mal ?",
    answer: "Paul",
    category: "Nouveau Testament",
    choices: ["Pierre", "Paul", "Jean", "Luc"]
  },
  {
    id: "off1-57",
    question: "Dans quelle ville le roi David a-t-il régné en premier avant de s'établir à Jérusalem ?",
    answer: "Hébron",
    category: "Ancien Testament",
    choices: ["Bethléem", "Sichem", "Hébron", "Samarie"]
  },
  {
    id: "off1-58",
    question: "Quel miracle Moïse a-t-il accompli à Mara pour étancher la soif des Hébreux ?",
    answer: "Changer l'eau amère en eau douce avec un bois",
    category: "Miracles",
    choices: ["Frapper le rocher", "Changer l'eau amère en eau douce avec un bois", "Faire tomber la rosée", "Faire pleuvoir du miel"]
  },
  {
    id: "off1-59",
    question: "Quel livre du Nouveau Testament s'adresse spécifiquement à un propriétaire d'esclave pour qu'il accueille son esclave fugitif, Onésime, comme un frère ?",
    answer: "Philémon",
    category: "Nouveau Testament",
    choices: ["Tite", "Philémon", "Colossiens", "Galates"]
  },
  {
    id: "off1-60",
    question: "Quel était le premier nom de l'apôtre Paul de Tarse avant sa conversion ?",
    answer: "Saul",
    category: "Nouveau Testament",
    choices: ["Saul", "Simon", "Matthieu", "Luc"]
  }
];

export const OFFLINE_STAGE2: Record<string, OfflineQuestionStage2[]> = {
  "Les miracles de Jésus": [
    { id: "off2-m1", question: "Dans quel village de Galilée Jésus changea-t-il l'eau en vin lors d'un mariage ?", answer: "Cana" },
    { id: "off2-m2", question: "Qui est le frère de Marie et Marthe que Jésus ressuscita après 4 jours de sépulture ?", answer: "Lazare" },
    { id: "off2-m3", question: "Sur quel élément liquide Jésus a-t-il marché pour rejoindre ses apôtres terrifiés ?", answer: "L'eau" },
    { id: "off2-m4", question: "Combien de paniers d'orge ont été récoltés après la multiplication des pains d'orge ?", answer: "Douze" },
    { id: "off2-m5", question: "Quel mendiant aveugle de Jéricho cria continuellement de foi envers le Fils de David ?", answer: "Bartimée" },
    { id: "off2-m6", question: "Quel apôtre a tenté de marcher sur les eaux à la rencontre du Christ, puis a sombré ?", answer: "Pierre" },
    { id: "off2-m7", question: "Combien de lépreux ont été purifiés en chemin, bien qu'un seul soit revenu pour remercier ?", answer: "Dix" },
    { id: "off2-m8", question: "Où se situe la piscine à cinq portiques où Jésus guérit un malade de trente-huit ans ?", answer: "Béthesda" },
    { id: "off2-m9", question: "Quelle fille d'un chef de synagogue Jésus a-t-il ressuscitée en disant 'Talitha koumi' ?", answer: "La fille de Jaïrus" },
    { id: "off2-m10", question: "Dans quelle piscine à Jérusalem Jésus a-t-il envoyé l'aveugle-né se laver les yeux après lui avoir appliqué de la boue ?", answer: "Siloé" },
    { id: "off2-m11", question: "Combien de personnes Jésus a-t-il nourries avec seulement sept pains et quelques petits poissons ?", answer: "Quatre mille" },
    { id: "off2-m12", question: "Quel serviteur d'un officier romain Jésus a-t-il guéri à distance à Capernaüm en admirant la foi de ce dernier ?", answer: "Le serviteur du centurion" },
    { id: "off2-m13", question: "Quel miracle Jésus a-t-il accompli alors que ses disciples craignaient de sombrer dans une barque secouée ?", answer: "La tempête apaisée" },
    { id: "off2-m14", question: "De quelle affliction terrible la femme qui a touché le bord du vêtement de Jésus a-t-elle été guérie ?", answer: "Perte de sang" },
    { id: "off2-m15", question: "Où Jésus a-t-il guéri la belle-mère de l'apôtre Pierre qui souffrait d'une forte fièvre ?", answer: "Capernaüm" }
  ],
  "Les rois d'Israël": [
    { id: "off2-r1", question: "Qui fut le premier roi choisi par Dieu et oint par Samuel pour régner sur Israël ?", answer: "Saül" },
    { id: "off2-r2", question: "Quel jeune joueur de lyre et vaillant guerrier succéda à Saül sur le trône ?", answer: "David" },
    { id: "off2-r3", question: "Quel souverain éleva à Jérusalem le temple de l'Éternel en cèdre et or ?", answer: "Salomon" },
    { id: "off2-r4", question: "Qui engendra le schisme en érigeant des sanctuaires de veaux d'or à Dan et à Béthel ?", answer: "Jéroboam" },
    { id: "off2-r5", question: "Quel roi réformateur pieux monta sur le trône de Juda à l'âge précoce de 8 ans ?", answer: "Josias" },
    { id: "off2-r6", question: "Quel roi vit l'ombre reculer miraculeusement sur les degrés d'Achaz en signe de guérison ?", answer: "Ézéchias" },
    { id: "off2-r7", question: "Quel puissant monarque de Babylone assiégea Jérusalem et déporta ses notables ?", answer: "Nebucadnetsar" },
    { id: "off2-r8", question: "Quel roi profanateur fut jugé par une mystérieuse écriture tracée sur le mur lors d'un banquet ?", answer: "Belschatsar" },
    { id: "off2-r9", question: "Quel fils rebelle de David a tenté de lui usurper le trône et est mort suspendu par ses cheveux ?", answer: "Absalom" },
    { id: "off2-r10", question: "Quel roi impie d'Israël, époux de Jézabel, s'est emparé de la vigne de Naboth de Jizreel ?", answer: "Achab" },
    { id: "off2-r11", question: "Quel roi de Juda fut frappé de lèpre pour avoir voulu offrir lui-même l'encens dans le Temple ?", answer: "Ozias" },
    { id: "off2-r12", question: "Qui fut le dernier roi de Juda avant la destruction de Jérusalem par les Babyloniens ?", answer: "Sédécias" },
    { id: "off2-r13", question: "Quel roi d'Israël, célèbre pour sa conduite furieuse de char, extermina la maison d'Achab et les prêtres de Baal ?", answer: "Jéhu" },
    { id: "off2-r14", question: "Qui fut le premier roi du royaume du Nord (Israël) après le schisme de Salomon ?", answer: "Jéroboam" },
    { id: "off2-r15", question: "Quel roi de Juda, fils d'Achaz, a restauré le culte et résisté au siège de l'Assyrien Sannachérib ?", answer: "Ézéchias" }
  ],
  "Les voyages de Paul": [
    { id: "off2-v1", question: "Vers quelle ville se dirigeait Saul lorsqu'il fut projeté par une lumière éclatante ?", answer: "Damas" },
    { id: "off2-v2", question: "À quel fidèle compagnon Paul confia-t-il la surveillance des églises d'Éphèse ?", answer: "Timothée" },
    { id: "off2-v3", question: "Sur quelle île de la Méditérranée Paul fit-il naufrage lors de son transfert pour Rome ?", answer: "Malte" },
    { id: "off2-v4", question: "Qui accompagna l'apôtre Paul durant son premier grand voyage missionnaire ?", answer: "Barnabas" },
    { id: "off2-v5", question: "Dans quel quartier d'Athènes Paul fit-il face aux philosophes pour prêcher le Dieu inconnu ?", answer: "Aréopage" },
    { id: "off2-v6", question: "Dans quelle ville de Macédoine Paul et Silas louèrent-ils Dieu en prison à minuit ?", answer: "Philippes" },
    { id: "off2-v7", question: "De quelle ville importante de Cilicie Paul était-il originaire et citoyen ?", answer: "Tarse" },
    { id: "off2-v8", question: "Quel jeune homme s'endormit et tomba de la fenêtre lors d'un long sermon de Paul ?", answer: "Eutychus" },
    { id: "off2-v9", question: "Quelle marchande de pourpre de la ville de Thyatire fut la première convertie de Paul en Europe ?", answer: "Lydie" },
    { id: "off2-v10", question: "Qui était le compagnon de Paul lors de son second voyage missionnaire, emprisonné avec lui ?", answer: "Silas" },
    { id: "off2-v11", question: "Quel gouverneur romain de Judée fit trembler Paul en l'écoutant parler de justice et de jugement ?", answer: "Félix" },
    { id: "off2-v12", question: "Quelle église Paul a-t-il exhortée dans une longue lettre à corriger les divisions et les désordres ?", answer: "Corinthe" },
    { id: "off2-v13", question: "Dans quelle ville Paul a-t-il prêché sur l'Aréopage devant des philosophes stoïciens ?", answer: "Athènes" },
    { id: "off2-v14", question: "Qui était le jeune compagnon à qui Paul adressa deux épîtres pastorales ?", answer: "Timothée" },
    { id: "off2-v15", question: "Où Paul a-t-il passé deux ans en résidence surveillée à la fin du livre des Actes ?", answer: "Rome" }
  ],
  "Les femmes de la Bible": [
    { id: "off2-f1", question: "Quelle courageuse reine juive risqua sa vie pour sauver son peuple du complot d'Haman ?", answer: "Esther" },
    { id: "off2-f2", question: "Quelle femme fut changée en statue de sel pour avoir regardé la ruine de sa cité ?", answer: "Femme de Loth" },
    { id: "off2-f3", question: "Quelle Moabite s'attacha fidèlement à sa belle-mère Naomi et épousa Boaz ?", answer: "Ruth" },
    { id: "off2-f4", question: "Quelle prophétesse et seule femme juge d'Israël chanta un cantique de victoire avec Barak ?", answer: "Débora" },
    { id: "off2-f5", question: "Quelle femme rusée obtint les secrets de la force physique de Samson pour le trahir ?", answer: "Dalila" },
    { id: "off2-f6", question: "Quelle épouse d'Abraham mit au monde Isaac dans son grand âge selon la promesse de Dieu ?", answer: "Sara" },
    { id: "off2-f7", question: "Qui est la sœur aînée de Moïse et Aaron, qui mena le peuple d'Israël aux chants et tambourins ?", answer: "Marie" },
    { id: "off2-f8", question: "Qui hébergea avec foi les deux espions hébreux à Jéricho et fut épargnée avec les siens ?", answer: "Rahab" },
    { id: "off2-f9", question: "Quelle reine maléfique d'Israël, épouse d'Achab, persécuta les prophètes et menaça Élie ?", answer: "Jézabel" },
    { id: "off2-f10", question: "Quelle femme d'Abraham mit au monde Isaac à l'âge de 90 ans selon la promesse ?", answer: "Sara" },
    { id: "off2-f11", question: "Quelle femme stérile, épouse d'Elkana, pria avec larmes et enfanta le prophète Samuel ?", answer: "Anne" },
    { id: "off2-f12", question: "Quelle reine de Perse fut destituée pour avoir refusé de se présenter devant le roi Assuérus ?", answer: "Vashti" },
    { id: "off2-f13", question: "Quelle Moabite s'attacha fidèlement à Naomi et devint l'arrière-grand-mère de David ?", answer: "Ruth" },
    { id: "off2-f14", question: "Quelle femme de Jacob, mère de Joseph, fut sa préférée ?", answer: "Rachel" },
    { id: "off2-f15", question: "Quelle sœur de Lazare se tenait assise aux pieds de Jésus pour écouter sa parole ?", answer: "Marie" }
  ],
  "Les paraboles": [
    { id: "off2-p1", question: "Quel voyageur repentant fut accueilli avec amour par son père malgré ses débauches ?", answer: "Le fils prodigue" },
    { id: "off2-p2", question: "Quel homme, méprisé par les religieux, secourut le blessé gisant au bord de la route ?", answer: "Le bon Samaritain" },
    { id: "off2-p3", question: "Quelle petite graine végétale Jésus cite-t-il pour imager la croissance fulgurante du Royaume ?", answer: "Grain de sénevé" },
    { id: "off2-p4", question: "Quelle parabole oppose des vierges avisées prévoyantes en huile à d'autres insouciantes ?", answer: "Les dix vierges" },
    { id: "off2-p5", question: "De quel homme riche et égoïste Jésus conte-t-il la fin face au pauvre couvert d'ulcères ?", answer: "Lazare" },
    { id: "off2-p6", question: "Quelle brebis le berger va-t-il chercher en laissant les quatre-vingt-dix-neuf autres ?", answer: "La brebis perdue" },
    { id: "off2-p7", question: "Que fait le serviteur insensé du talent unique reçu de son maître dans la parabole ?", answer: "Caché en terre" },
    { id: "off2-p8", question: "Sur quelle fondation solide l'homme sage bâtit-il sa demeure protectrice de la tempête ?", answer: "Le roc" },
    { id: "off2-p9", question: "Dans la parabole du semeur, que représentent les grains tombés dans la bonne terre ?", answer: "Ceux qui écoutent la Parole et la comprennent" },
    { id: "off2-p10", question: "Dans quelle parabole un homme invite-t-il les pauvres après que les premiers invités se soient désistés ?", answer: "Le grand festin" },
    { id: "off2-p11", question: "Dans la parabole des dix vierges, de quoi les cinq vierges folles ont-elles manqué à la venue de l'époux ?", answer: "D'huile" },
    { id: "off2-p12", question: "Quelle parabole montre un serviteur impitoyable jeté en prison pour avoir refusé de pardonner une petite dette ?", answer: "Le serviteur impitoyable" },
    { id: "off2-p13", question: "Dans la parabole des vignerons homicides, qui le propriétaire envoie-t-il en dernier et qui est tué ?", answer: "Son fils" },
    { id: "off2-p14", question: "Dans la parabole de la brebis perdue, combien de brebis le berger laisse-t-il dans la montagne ?", answer: "Quatre-vingt-dix-neuf" },
    { id: "off2-p15", question: "Sur quelle fondation solide l'homme prudent bâtit-il sa maison dans le Sermon sur la montagne ?", answer: "Le roc" }
  ],
  "Le Pentateuque": [
    { id: "off2-pe1", question: "Quel livre relate le commencement du cosmos et des alliances patriarcales ?", answer: "Genèse" },
    { id: "off2-pe2", question: "Quel livre est consacré au départ spectaculaire des Israélites d'Égypte sous la houlette de Moïse ?", answer: "Exode" },
    { id: "off2-pe3", question: "Quel livre renferme principalement les dispositions rituelles des descendants d'Aaron ?", answer: "Lévitique" },
    { id: "off2-pe4", question: "Quel livre comptabilise les tribus mobiles lors du voyage à travers le désert ?", answer: "Nombres" },
    { id: "off2-pe5", question: "Quel dernier livre du Pentateuque récapitule les préceptes de la loi avant d'entrer en Canaan ?", answer: "Deutéronome" },
    { id: "off2-pe6", question: "Qui est le rédacteur traditionnel majeur de ces cinq volumes ?", answer: "Moïse" },
    { id: "off2-pe7", question: "Sous quel nom hébreu collectif désigne-t-on ces cinq livres sacrés ?", answer: "La Torah" },
    { id: "off2-pe8", question: "Quels sont les deux objets rituels consultés par le grand prêtre pour connaître la volonté de Dieu ?", answer: "Ourim et Thummim" },
    { id: "off2-pe9", question: "Quel livre du Pentateuque tire son nom des deux recensements du peuple d'Israël ?", answer: "Nombres" },
    { id: "off2-pe10", question: "Quel livre contient principalement les lois sur les sacrifices, la prêtrise et la pureté ?", answer: "Lévitique" },
    { id: "off2-pe11", question: "Quel livre s'achève par la mort de Moïse sur le mont Nebo ?", answer: "Deutéronome" },
    { id: "off2-pe12", question: "Quelle grande alliance scellée par l'arc-en-ciel est conclue dans la Genèse ?", answer: "L'alliance avec Noé" },
    { id: "off2-pe13", question: "Quel fils de Jacob fut vendu par ses frères en Égypte et y devint gouverneur ?", answer: "Joseph" },
    { id: "off2-pe14", question: "Combien de plaies Dieu infligea-t-il à l'Égypte dans le livre de l'Exode ?", answer: "Dix" },
    { id: "off2-pe15", question: "Quelle fille d'un prêtre de Madian Moïse épousa-t-il au désert ?", answer: "Séphora" }
  ],
  "Les prophètes majeurs": [
    { id: "off2-pr1", question: "Qui fut préservé de la gueule des lions après y avoir été jeté à cause de sa fidélité spirituelle ?", answer: "Daniel" },
    { id: "off2-pr2", question: "Quel grand prophète, surnommé 'celui qui pleure', assista à la destruction de Jérusalem ?", answer: "Jérémie" },
    { id: "off2-pr3", question: "Quel visionnaire décrivit une impressionnante vallée d'ossements desséchés reprenant vie ?", answer: "Ézéchiel" },
    { id: "off2-pr4", question: "Quel prophète de Juda a dénoncé David après son adultère en lui racontant une parabole de brebis ?", answer: "Nathan" },
    { id: "off2-pr5", question: "Quel livre de prophète majeur comporte de magnifiques prophéties sur le Serviteur Souffrant ?", answer: "Isaïe" },
    { id: "off2-pr6", question: "Quel prophète s'opposa à 450 prophètes de Baal lors de la confrontation du mont Carmel ?", answer: "Élie" },
    { id: "off2-pr7", question: "Quel successeur d'Élie accomplit le double de miracles, dont la flottaison d'un fer de hache ?", answer: "Élisée" },
    { id: "off2-pr8", question: "Quel prophète fut envoyé à contrecœur à Ninive pour y prêcher le repentir après sa fuite marine ?", answer: "Jonas" },
    { id: "off2-pr9", question: "Quel prophète de Juda a prédit que le Messie naîtrait d'une vierge et l'a appelé Emmanuel ?", answer: "Isaïe" },
    { id: "off2-pr10", question: "Quel jeune compagnon de Daniel fut jeté dans la fournaise ardente avec Schadrac et Méschac ?", answer: "Abed-Nego" },
    { id: "off2-pr11", question: "Quel prophète a écrit le livre des Lamentations après la chute de Jérusalem ?", answer: "Jérémie" },
    { id: "off2-pr12", question: "Quel roi de Babylone Daniel a-t-il servi en interprétant ses songes mystérieux ?", answer: "Nebucadnetsar" },
    { id: "off2-pr13", question: "Quel prophète a été emporté au ciel dans un tourbillon par un char de feu et des chevaux de feu ?", answer: "Élie" },
    { id: "off2-pr14", question: "Quel prophète a reçu l'ordre d'épouser une femme prostituée pour symboliser l'infidélité d'Israël ?", answer: "Osée" },
    { id: "off2-pr15", question: "Quel prophète a passé trois jours et trois nuits dans le ventre d'un grand poisson ?", answer: "Jonas" }
  ],
  "La Genèse": [
    { id: "off2-g1", question: "Qui is le tout premier-né de l'union d'Adam et Ève, auteur du premier meurtre d'Abel ?", answer: "Caïn" },
    { id: "off2-g2", question: "Combien de temps l'arche de Noé flotta-t-elle sur les eaux grandissantes ?", answer: "150 jours" },
    { id: "off2-g3", question: "Qui érigea la grandiose tour de Babel pour se faire un nom, provoquant la confusion ?", answer: "Nimrod" },
    { id: "off2-g4", question: "Quel fils Abraham eut-il de la servante égyptienne Agar avant la venue d'Isaac ?", answer: "Ismaël" },
    { id: "off2-g5", question: "Quelle femme de Jacob, mère de Joseph et de Benjamin, fut sa favorite ?", answer: "Rachel" },
    { id: "off2-g6", question: "Quel fut le nouveau nom spirituel attribué à Jacob après sa lutte avec l'ange divin ?", answer: "Israël" },
    { id: "off2-g7", question: "Qui fut transformée en colonne minérale saline pour avoir regretté Sodome de l'œil ?", answer: "La femme de Loth" },
    { id: "off2-g8", question: "Qui vendit son précieux droit d'aînesse à son cadet pour un simple potage de lentilles ?", answer: "Ésaü" },
    { id: "off2-g9", question: "De quel arbre du jardin d'Éden Dieu avait-il interdit de manger sous peine de mort ?", answer: "L'arbre de la connaissance du bien et du mal" },
    { id: "off2-g10", question: "Qui fut le père de Noé, qui prophétisa que son fils apporterait du soulagement ?", answer: "Lamech" },
    { id: "off2-g11", question: "Quel fils d'Adam et Ève fut donné pour remplacer Abel après son meurtre ?", answer: "Seth" },
    { id: "off2-g12", question: "De quelle ville d'Irak actuelle (Our en Chaldée) Abraham est-il parti sur ordre de Dieu ?", answer: "Our" },
    { id: "off2-g13", question: "Quel fils cadet d'Isaac a obtenu la bénédiction paternelle par ruse à la place de son frère Ésaü ?", answer: "Jacob" },
    { id: "off2-g14", question: "Combien de fils Jacob a-t-il eus, qui sont devenus les ancêtres des tribus d'Israël ?", answer: "Douze" },
    { id: "off2-g15", question: "Quel fils de Jacob avait un manteau de plusieurs couleurs offert par son père ?", answer: "Joseph" }
  ],
  "Les Actes des Apôtres": [
    { id: "off2-a1", question: "Dans quelle célèbre cité le terme protecteur de 'chrétiens' fut-il forgé d'importance ?", answer: "Antioche" },
    { id: "off2-a2", question: "Quel couple tomba inanimé devant l'apôtre Pierre après avoir camouflé le prix de leur vente ?", answer: "Ananias et Saphira" },
    { id: "off2-a3", question: "Quel diacre prononça un brillant plaidoyer avant d'être le premier martyr chrétien par lapidation ?", answer: "Étienne" },
    { id: "off2-a4", question: "Quel évangéliste expliqua le rouleau d'Ésaïe à l'eunuque éthiopien sur la route désertique ?", answer: "Philippe" },
    { id: "off2-a5", question: "Quel centurion romain de Césarée accueillit Pierre à la suite d'un songe de nappe descendante ?", answer: "Corneille" },
    { id: "off2-a6", question: "À quelle fête sainte de l'Esprit les apôtres commencèrent-ils à s'exprimer en langues variées ?", answer: "Pentecôte" },
    { id: "off2-a7", question: "Quel compagnon de cellule de Paul le seconda dans l'adoration nocturne de Philippes ?", answer: "Silas" },
    { id: "off2-a8", question: "Quelle pieuse couturière de Joppé, faisant des aumônes, fut ramenée à la vie par l'apôtre Pierre ?", answer: "Tabitha" },
    { id: "off2-a9", question: "Quel apôtre a prononcé le premier grand sermon de l'Église le jour de la Pentecôte ?", answer: "Pierre" },
    { id: "off2-a10", question: "Quel magicien de Samarie a voulu acheter le pouvoir de transmettre le Saint-Esprit avec de l'argent ?", answer: "Simon" },
    { id: "off2-a11", question: "Quel chrétien de Damas a été envoyé par Dieu pour imposer les mains à Saul et lui rendre la vue ?", answer: "Ananias" },
    { id: "off2-a12", question: "Quel apôtre fut miraculeusement délivré de prison par un ange la veille de son procès par Hérode ?", answer: "Pierre" },
    { id: "off2-a13", question: "Quel philosophe et compagnon de Paul l'a défendu et a voyagé avec lui lors de ses missions ?", answer: "Barnabas" },
    { id: "off2-a14", question: "Quel jeune homme s'est endormi pendant une longue prédication de Paul et est tombé de la fenêtre ?", answer: "Eutychus" },
    { id: "off2-a15", question: "Où Paul s'est-il rendu à la fin du livre des Actes pour y être jugé par l'empereur César ?", answer: "Rome" }
  ],
  "Les Psaumes et Proverbes": [
    { id: "off2-pp1", question: "Qui is le compositeur récurrent de la majorité des Psaumes du recueil central ?", answer: "David" },
    { id: "off2-pp2", question: "Combien d'unités de cantiques de louange constituent le livre sacré des Psaumes ?", answer: "150" },
    { id: "off2-pp3", question: "Quel cantique immensément déclamé entonne la métaphore protectrice de l'Éternel mon berger ?", answer: "Psaume 23" },
    { id: "off2-pp4", question: "Quel souverain célèbre réberta la majeure partie des sentences des Proverbes ?", answer: "Salomon" },
    { id: "off2-pp5", question: "Quel est le psaume le plus long, structuré en strophes acrostiches sur la loi divine ?", answer: "Psaume 119" },
    { id: "off2-pp6", question: "Quel psaume, chant de repentance suprême de David, succède au drame de Bathschéba ?", answer: "Psaume 51" },
    { id: "off2-pp7", question: "Selon les Proverbes, quel est le véritable commencement de la vraie sagesse spirituelle ?", answer: "La crainte de l'Éternel" },
    { id: "off2-pp8", question: "Quel animal laborieux et prévoyant le livre des Proverbes recommande-t-il d'imiter au paresseux ?", answer: "La fourmi" },
    { id: "off2-pp9", question: "Quel livre de sagesse déclare dans ses premiers versets que 'La crainte de l'Éternel est le commencement de la science' ?", answer: "Proverbes" },
    { id: "off2-pp10", question: "Quel psaume commence par : 'Mon Dieu ! mon Dieu ! pourquoi m'as-tu abandonné ?' ?", answer: "Psaume 22" },
    { id: "off2-pp11", question: "Quelle reine ou femme vertueuse est célébrée dans le dernier chapitre des Proverbes ?", answer: "La femme vertueuse" },
    { id: "off2-pp12", question: "Selon les Proverbes, qu'est-ce qui excite les querelles, tandis que l'amour couvre toutes les fautes ?", answer: "La haine" },
    { id: "off2-pp13", question: "Quel psaume David a-t-il écrit pour exprimer sa repentance après son péché avec Bathschéba ?", answer: "Psaume 51" },
    { id: "off2-pp14", question: "Quelle petite créature, bien que faible, prépare sa nourriture en été selon les Proverbes ?", answer: "La fourmi" },
    { id: "off2-pp15", question: "Quel est le nombre total de psaumes contenus dans le livre des Psaumes ?", answer: "150" }
  ],
  "L'Exode et le Désert": [
    { id: "off2-ed1", question: "Quelle substance tombée des cieux nourrissait les Hébreux chaque jour, sauf le Sabbat ?", answer: "La manne" },
    { id: "off2-ed2", question: "Où se dresse l'impressionnante montagne sainte où Moïse reçut la révélation décalogale ?", answer: "Sinaï" },
    { id: "off2-ed3", question: "Qu'est-ce que Moïse frappa de son bâton pour abreuver le peuple d'Israël altéré ?", answer: "Le rocher" },
    { id: "off2-ed4", question: "Combien d'années la génération dissidente erra-t-elle avant d'atteindre Canaan ?", answer: "40 ans" },
    { id: "off2-ed5", question: "Quel animal métallique érigé par Aaron suscita la fureur de Moïse à sa descente du Sinaï ?", answer: "Le veau d'or" },
    { id: "off2-ed6", question: "Quelle construction portative servait de temple central mobilisable pour l'assemblée ?", answer: "Le tabernacle" },
    { id: "off2-ed7", question: "Quel fléau animalier réprimanda la rébellion des Hébreux, requérant un serpent d'airain ?", answer: "Les serpents brûlants" },
    { id: "off2-ed8", question: "Quels oiseaux migrateurs déversés par le vent approvisionnèrent Israël en viande ?", answer: "Les cailles" },
    { id: "off2-ed9", question: "Quel prêtre de Madian était le beau-père de Moïse et lui a conseillé d'établir des juges ?", answer: "Jéthro" },
    { id: "off2-ed10", question: "Quelle sœur de Moïse et Aaron a été frappée de lèpre après s'être rebellée contre lui ?", answer: "Marie" },
    { id: "off2-ed11", question: "Quels deux espions sont revenus de Canaan avec un rapport encourageant, exhortant le peuple à la foi ?", answer: "Josué et Caleb" },
    { id: "off2-ed12", question: "Quelle mer Dieu a-t-il séparée en deux pour laisser passer le peuple d'Israël ?", answer: "La Mer Rouge" },
    { id: "off2-ed13", question: "De quel bois précieux était faite l'Arche de l'Alliance ?", answer: "Bois d'acacia" },
    { id: "off2-ed14", question: "Quel artisan doué d'esprit de Dieu a été désigné pour construire le Tabernacle ?", answer: "Betsaleel" },
    { id: "off2-ed15", question: "Quelle nourriture miraculeuse d'origine aviaire Dieu a-t-il fournie le soir aux Hébreux ?", answer: "Les cailles" }
  ],
  "Les Juges d'Israël": [
    { id: "off2-ju1", question: "Quel vaillant libérateur choisit de trier ses 300 soldats selon leur manière de laper l'eau ?", answer: "Gédéon" },
    { id: "off2-ju2", question: "Quel colosse d'une force prodigieuse trouva la mort en détruisant un temple philistin ?", answer: "Samson" },
    { id: "off2-ju3", question: "Qui fut la seule femme à rendre la justice sous son palmier et à guider les troupes d'Israël ?", answer: "Débora" },
    { id: "off2-ju4", question: "Quel juge s'engagea imprudemment à vouer à Dieu le premier être sortant de sa demeure ?", answer: "Jephthé" },
    { id: "off2-ju5", question: "Quel juge utiliser un aiguillon à bœufs pour occire six cents Philistins envahisseurs ?", answer: "Schamgar" },
    { id: "off2-ju6", question: "Quel juge gaucher délivra Israël en éliminant discrètement le tyrannique roi Églon de Moab ?", answer: "Éhud" },
    { id: "off2-ju7", question: "Sous la garde de quel grand prêtre le jeune Samuel fut-il consacré au Tabernacle ?", answer: "Héli" },
    { id: "off2-ju8", question: "Comment s'appelait le puissant père de Samson, visité par l'ange de l'Éternel ?", answer: "Manoach" },
    { id: "off2-ju9", question: "Quel juge a délivré Israël de la domination des Moabites en assassinant le roi Églon ?", answer: "Éhud" },
    { id: "off2-ju10", question: "Quelle femme a tué le général cananéen Sisera en lui enfonçant un pieu dans la tempe pendant son sommeil ?", answer: "Jaël" },
    { id: "off2-ju11", question: "Quel fils de Gédéon a tué ses soixante-dix frères pour régner en tyran sur Sichem ?", answer: "Abimélec" },
    { id: "off2-ju12", question: "Qui fut le dernier juge d'Israël, qui a également oint les deux premiers rois ?", answer: "Samuel" },
    { id: "off2-ju13", question: "Quel animal féroce Samson a-t-il déchiré à mains nues près des vignes de Thimna ?", answer: "Un lion" },
    { id: "off2-ju14", question: "Quel signe de rosée sur une toison de laine Gédéon a-t-il demandé à Dieu pour confirmer son appel ?", answer: "La rosée sur la toison" },
    { id: "off2-ju15", question: "Quel est le nom du sacrificateur auprès duquel grandit le jeune Samuel à Silo ?", answer: "Éli" }
  ],
  "Villes et cités bibliques": [
    { id: "off2-ci1", question: "Quelle métropole antique sainte abrita l'érection du temple et des palais de David ?", answer: "Jérusalem" },
    { id: "off2-ci2", question: "Dans quelle cité de Galilée grandit le Seigneur Jésus durant sa prime enfance ?", answer: "Nazareth" },
    { id: "off2-ci3", question: "Quelle forteresse phénicienne vit s'effondrer ses murailles au son bruyant des trompettes ?", answer: "Jéricho" },
    { id: "off2-ci4", question: "Quel port antique accueillit Jonas fuyant son devoir de prêche prophétique ?", answer: "Joppé" },
    { id: "off2-ci5", question: "Quelle capitale de l'empire assyrien fut sommée de se repentir par le prophète Jonas ?", answer: "Ninive" },
    { id: "off2-ci6", question: "Quelle cité cosmopolite d'Ionie fut le théâtre de l'émeute des orfèvres du temple d'Artémis ?", answer: "Éphèse" },
    { id: "off2-ci7", question: "Dans quel village de Judée, proche de Jérusalem, demeuraient les amis Marthe, Marie et Lazare ?", answer: "Béthanie" },
    { id: "off2-ci8", question: "De quelle métropole syrienne émanèrent les décrets de dévotion initiaux pour Paul converti ?", answer: "Antioche" },
    { id: "off2-ci9", question: "Dans quelle ville sainte de Syrie Saul a-t-il retrouvé la vue grâce à Ananias ?", answer: "Damas" },
    { id: "off2-ci10", question: "Dans quelle piscine de Jérusalem l'aveugle-né est-il allé se laver sur ordre de Jésus ?", answer: "Siloé" },
    { id: "off2-ci11", question: "Quelle ville de Judée est la cité de naissance du roi David et de Jésus-Christ ?", answer: "Bethléem" },
    { id: "off2-ci12", question: "De quelle ville de Galilée Jésus était-il originaire, où il a grandi ?", answer: "Nazareth" },
    { id: "off2-ci13", question: "Quelle capitale de la Syrie a accueilli la première grande église de païens chrétiens ?", answer: "Antioche" },
    { id: "off2-ci14", question: "Dans quel village de Judée Jésus a-t-il ressuscité son ami Lazare ?", answer: "Béthanie" },
    { id: "off2-ci15", question: "Quelle grande ville d'Assyrie a été sauvée de la destruction après la prédication de Jonas ?", answer: "Ninive" }
  ],
  "Les commandements et la Loi": [
    { id: "off2-cl1", question: "Que signifient étymologiquement les 'tables' sur lesquelles s'inscrivit le Décalogue ?", answer: "Tables de pierre" },
    { id: "off2-cl2", question: "Quel premier commandement est s'accompagnant d'une promesse d'allongement de jours ?", answer: "Honore ton père et ta mère" },
    { id: "off2-cl3", question: "Quel jour de repos hebdomadaire sacré fut établi pour imiter le sabbat créateur ?", answer: "Le Sabbat" },
    { id: "off2-cl4", question: "Quel est le plus grand et premier des commandements mis en valeur par Jésus-Christ ?", answer: "L'amour" },
    { id: "off2-cl5", question: "Sur quelle parure vestimentaire les Hébreux devaient-ils apposer des franges bleues mémorielles ?", answer: "Les vêtements" },
    { id: "off2-cl6", question: "De quel matériau précieux Aaron fondit-il la idole représentant la force égyptienne ?", answer: "L'or" },
    { id: "off2-cl7", question: "Quelle ordonnance de foi commence par les mots sacrés 'Écoute, Israël' (Shema) ?", answer: "L'Éternel est notre Dieu" },
    { id: "off2-cl8", question: "Quel est le dixième commandement du Décalogue interdisant de convoiter le bien d'autrui ?", answer: "Tu ne convoiteras pas" },
    { id: "off2-cl9", question: "Quel est le premier commandement du Décalogue concernant Dieu ?", answer: "Tu n'auras pas d'autres dieux devant ma face" },
    { id: "off2-cl10", question: "Quel commandement interdit de porter un témoignage mensonger contre son prochain ?", answer: "Tu ne porteras point de faux témoignage" },
    { id: "off2-cl11", question: "Sur quel mont Moïse a-t-il reçu la Loi écrite de la main de Dieu ?", answer: "Mont Sinaï" },
    { id: "off2-cl12", question: "De quel matériau était fait le veau d'or que le peuple a adoré au désert ?", answer: "Or" },
    { id: "off2-cl13", question: "Quel est le dixième et dernier commandement de la Loi ?", answer: "Tu ne convoiteras pas" },
    { id: "off2-cl14", question: "Quelle boîte sacrée en bois d'acacia plaqué d'or contenait les tables de la Loi ?", answer: "L'Arche de l'Alliance" },
    { id: "off2-cl15", question: "Combien de commandements composent la Loi fondamentale ou Décalogue reçue au Sinaï ?", answer: "Dix" }
  ]
};

export const OFFLINE_STAGE3: OfflineQuestionStage3[] = [
  {
    id: "off3-1",
    answer: "David",
    clues: [
      "Je suis le plus fringant et jeune fils d'Isaï, comptant sept aînés masculins.",
      "J'accomplissais les humbles corvées de berger des troupeaux familiaux de Bethléem.",
      "J'ai remporté un combat resté légendaire contre le géant Goliath à l'aide d'une fronde de cuir.",
      "On me désigne couramment comme l'auteur inspiré de la vaste majorité du livre des Psaumes."
    ],
    explanation: "Oint en secret par Samuel, terrassier de Goliath, berger-poète devenu le plus illustre souverain unificateur d'Israël."
  },
  {
    id: "off3-2",
    answer: "Moïse",
    clues: [
      "Né de la tribu de Lévi, ma mère me préserva du décret de mort en m'abritant dans un coffret de papyrus sur le Nil.",
      "Un grand buisson m'apparut embrasé par les feux de Dieu mais sans jamais être réduit en cendres.",
      "De ma verge dressée sur la mer, j'ai frayé un chemin à sec pour l'exode du peuple des Hébreux captifs.",
      "C'est à mon attention que Dieu écrivit ses Dix Paroles de feu au sommet ébranlé du mont Sinaï."
    ],
    explanation: "Libérateur infatigable d'Israël, intercesseur face au Pharaon et transmetteur de la Loi divine au désert."
  },
  {
    id: "off3-3",
    answer: "Paul",
    clues: [
      "J'ai suivi les stricts enseignements de Gamaliel et m'appelais initialement Saul de Tarse.",
      "Je fus renversé par une fulgurante clarté divine qui me rendit temporairement aveugle sur la route de Damas.",
      "J'ai réalisé plusieurs périples à travers l'Asie Mineure et la Grèce pour fonder de nombreuses communautés.",
      "On me qualifie volontiers de docteur théologique et d'Épicentre missionnaire universel vers les non-Juifs."
    ],
    explanation: "Apôtre par excellence des Nations (ou Gentils), auteur d'une quinzaine d'épîtres fondamentales du Nouveau Testament."
  },
  {
    id: "off3-4",
    answer: "Salomon",
    clues: [
      "Je naquis des amours restaurés du roi David et de Bathschéba de Jérusalem.",
      "Je dédaignai la richesse et la force militaire pour ne réclamer à Dieu qu'un cœur doué d'intelligence pour juger.",
      "Une reine prestigieuse venue du lointain orient accomplit un éprouvant voyage pour m'entendre deviser.",
      "Je dotai Israël de sa plus grandiose merveille, à savoir le premier Temple habillé de marbre et d'or."
    ],
    explanation: "Monarque d'or réputé pour sa sagesse d'esprit débordante, la prospérité de son royaume et la construction du Temple."
  },
  {
    id: "off3-5",
    answer: "Abraham",
    clues: [
      "Je partis de la cité d'Our en Chaldée sans connaître ma destination finale, m'élançant sur un simple appel.",
      "Dieu compara l'immense étendue de ma descendance future au nombre incommensurable des étoiles de la nuit.",
      "Ma compagne de toujours s'appelait Sara, et elle enfanta un fils de notre vieillesse nommé Isaac.",
      "Je fus soumis à l'éprouvant sacrifice de porter mon fils unique vers le mont de l'holocauste."
    ],
    explanation: "Père charismatique de la multitude et modèle fondateur de la foi inébranlable en la promesse divine."
  },
  {
    id: "off3-6",
    answer: "Noé",
    clues: [
      "Je vécus parmi une génération corrompue et fus le seul à trouver grâce aux yeux de l'Éternel.",
      "Je fabriquai avec dévotion une embarcation gigantesque en bois de gopher étanchée de poix.",
      "J'ai accueilli à mon bord des représentants de toute chair pour repeupler le monde après le Déluge.",
      "La fin des flots fut scellée par le retour d'une colombe apportant un rameau d'olivier frais."
    ],
    explanation: "Patriarche juste ayant sauvé l'humanité de la destruction, consolidateur de l'alliance sous l'arc-en-ciel."
  },
  {
    id: "off3-7",
    answer: "Jonas",
    clues: [
      "Recevant l'ordre de prophétiser l'imminence d'un châtiment, je louai une cabine en sens inverse pour Tarsis.",
      "Une effroyable bourrasque secoua mon embarcation et l'équipage me jeta par-dessus bord pour calmer le ciel.",
      "La miséricorde de l'Éternel m'hébergea trois nuits et trois jours dans les entrailles d'un énorme poisson.",
      "Ma prédication brève fit revêtir le sac et la cendre à l'immense capitale d'Assyrie."
    ],
    explanation: "Prophète rebelle délivré des abîmes marins pour accomplir enfin sa mission salvatrice au cœur de Ninive."
  },
  {
    id: "off3-8",
    answer: "Jean-Baptiste",
    clues: [
      "Un ange annonça ma future naissance à mon père Zacharie devenu muet d'incrédulité.",
      "Je demeurais au désert aride, me nourrissant de sauterelles sauvages et de miel des bois.",
      "Je revêtais un rude habit tissé de poils de chameau retenu par une simple ceinture de cuir à la taille.",
      "J'ai proclamé la venue imminente de l'Agneau de Dieu en plongeant les foules repentantes dans le Jourdain."
    ],
    explanation: "Le précurseur de Jésus-Christ, voix proclamant dans le désert la nécessité d'aplanir les sentiers du Seigneur."
  },
  {
    id: "off3-9",
    answer: "Samson",
    clues: [
      "Ma conception fut promise à une femme stérile sous le strict vœu du naziréat perpétuel.",
      "Je fis s'abattre une panade de mille philistins armé d'une simple mâchoire d'âne fraîche glanée au sol.",
      "Le secret de ma force mystique se cachait dans mes cheveux n'ayant jamais rencontré de rasoir.",
      "Je fus hélas livré aux Philistins par la trahison finale de Dalila et fini aveuglé dans les prisons de Gaza."
    ],
    explanation: "Juge d'Israël à la constitution herculéenne, dont les exploits tumultueux culminèrent lors de son ultime sacrifice à Gaza."
  },
  {
    id: "off3-10",
    answer: "Ruth",
    clues: [
      "Née païenne sur les collines du pays de Moab, je m'alliai par union conjugale à une famille hébreux émigrée.",
      "Je prononçai une déclaration éternelle à Naomi : 'Ton peuple sera mon peuple, et ton Dieu sera mon Dieu'.",
      "Je glanais péniblement les épis de céréales oubliés dans l'exploitation agricole d'un notable bienveillant.",
      "J'épousai Boaz, devenant fièrement l'arrière-grand-mère du futur roi David."
    ],
    explanation: "Moabite vertueuse et dévouée, dont l'histoire illustre l'intégration bienveillante des convertis dans la lignée royale messianique."
  }
];

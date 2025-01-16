const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
const Jimp = require('jimp');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware pour autoriser CORS et traiter les données JSON
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));

const pokemonsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'pokemon.json'), 'utf-8'));

// Fonction pour choisir un type au hasard parmi les types disponibles
function getRandomType() {
  const types = pokemonsData.pokemons.map(pokemonType => pokemonType.type);
  const randomType = types[Math.floor(Math.random() * types.length)];
  return randomType;
}

// Fonction pour choisir un Pokémon au hasard parmi un type donné
function getRandomPokemonImage(type) {
  const typeData = pokemonsData.pokemons.find(pokemonType => pokemonType.type === type);
  if (!typeData) {
    return null;
  }

  const randomPokemon = typeData.list[Math.floor(Math.random() * typeData.list.length)];
  return randomPokemon.imagePath;
}

app.get('/', (req, res) => {
  res.send('Bienvenue sur le générateur de QR code Pokémon !');
});

app.post('/generate', async (req, res) => {
  const randomType = getRandomType();
  var lienPage;
  if (randomType == "eau"){
    lienPage = "/afficher/eau";
  }else if(randomType == "terrestre"){  // Correction du type pour 'terrestre'
      lienPage = "/afficher/terrestre";
  }else{
      lienPage = "/afficher/vol";
  }
  const pokemonImage = getRandomPokemonImage(randomType);
  
  var { data } = req.body;
  if (data.startsWith('http://www.')) {
    data = data.slice(11);  // Enlève 'http://'
} else if (data.startsWith('https://www.')) {
    data = data.slice(12);  // Enlève 'https://'
}
console.log(data);
data= lienPage+"/"+data;
console.log(data);

  if (!data) {
    console.error("Erreur : Aucun lien fourni dans la requête.");
    return res.status(400).send('Aucun lien fourni.');
  }

  try {
    // Étape 1 : Génération du QR code
    console.log("Étape 1 : Génération du QR code...");
    const qrBuffer = await QRCode.toBuffer(data, { errorCorrectionLevel: 'H' });
    console.log("QR code généré avec succès.");

    // Étape 2 : Choisir un type au hasard et obtenir l'image du Pokémon
    if (!pokemonImage) {
      return res.status(400).send('Aucun Pokémon trouvé pour ce type.');
    }

    console.log("Étape 2 : Chargement de l'image Pokémon...");
    const pokemonPath = path.join(__dirname, 'public', pokemonImage);
    const pokemonImg = await Jimp.read(pokemonPath);
    console.log("Image Pokémon chargée avec succès.");

    // Étape 3 : Chargement du QR code
    console.log("Étape 3 : Chargement du QR code...");
    const qrImg = await Jimp.read(qrBuffer);
    console.log("QR code chargé avec succès.");

    // Étape 4 : Redimensionnement de l'image Pokémon
    console.log("Étape 4 : Redimensionnement de l'image Pokémon...");
    pokemonImg.resize(qrImg.bitmap.width, qrImg.bitmap.height);

    // Étape 5 : Fusionner les pixels
    console.log("Fusion des pixels...");
    qrImg.scan(0, 0, qrImg.bitmap.width, qrImg.bitmap.height, function (x, y, idx) {
      const qrPixel = this.bitmap.data[idx];
      if (qrPixel < 128) {
        const [r, g, b, a] = pokemonImg.bitmap.data.slice(idx, idx + 4);
        this.bitmap.data[idx] = r;
        this.bitmap.data[idx + 1] = g;
        this.bitmap.data[idx + 2] = b;
        this.bitmap.data[idx + 3] = a;
      }
    });

    
    // Étape 7 : Envoi de l'image résultante et du lien
    console.log("Envoi du QR code avec le lien...");
    const pngBuffer = await qrImg.getBufferAsync(Jimp.MIME_PNG);

    res.set('Content-Type', 'image/png');
    res.send(pngBuffer);

  } catch (err) {
    console.error("Erreur détectée :", err);
    res.status(500).send('Erreur lors de la génération du QR code.');
  }
});

app.get('/afficher/:randomType/:texte', (req, res) => {
    const Type = req.params.randomType;
    var texte = req.params.texte;
    const userUrl = 'https://www.' + texte;
  
  
    if (Type == "eau") {
      const htmlResponse = `<!DOCTYPE html>
  <html lang="fr">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>L'urgence de la pêche Intensive</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
         body {
      background-image: url('/pokemon_fond.png');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      height: 100vh;
      margin: 0;
      font-family: 'Arial', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
  }
  
  .content {
      background: rgba(255, 255, 255, 0.9); /* Fond semi-transparent */
      border-radius: 15px;
      padding: 30px;
      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
      width: 80%;
      max-width: 600px;
      text-align: center;
  }
  
  h1 {
      font-size: 2rem;
      font-weight: bold;
      color: #007BFF; /* Bleu Bootstrap */
      margin-bottom: 20px;
  }
  
  p {
      color: #333;
      line-height: 1.6;
      font-size: 1.1rem;
  }
  
  a {
      color: #007BFF;
      text-decoration: none;
      font-weight: bold;
  }
  
  a:hover {
      color: #0056b3;
      text-decoration: underline;
  }
  
  button {
      background-color: #007BFF;
      color: white;
      border: none;
      border-radius: 5px;
      padding: 10px 20px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
  }
  
  button:hover {
      background-color: #0056b3;
      transform: scale(1.05);
  }
  
      </style>
  </head>
  <body>
      <div class="content">
          <h1 class="text-center mb-4">Les dangers de la pêche intensive</h1>
          <p>
              🌊 La pêche intensive met en danger la biodiversité marine. Elle perturbe les écosystèmes marins en surexploitant des espèces clés, comme le thon et la morue. 
          </p>
          <p>
              Pour en savoir plus sur ce sujet, consultez cet article : 
              <a href="https://www.goodplanet.org/fr/3-minutes-pour-comprendre-la-surpeche/" target="_blank">Prévention de la pêche intensive</a>.
          </p>
          <div class="text-center mt-4">
              <button class="btn btn-primary" id="redirectBtn">
                  Accéder à votre lien.
              </button>
          </div>
      </div>
  
      <script>
          const redirectBtn = document.getElementById('redirectBtn');
          redirectBtn.addEventListener('click', function() {
              const url = "${userUrl}";
              window.location.href = url;
          });
      </script>
  </body>
  </html>`;
      res.send(htmlResponse);
    } else if (Type == "vol") {
      const htmlResponse = `<!DOCTYPE html>
  <html lang="fr">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Les animaux volants et leur évolution</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
         body {
      background-image: url("/pokemon_fond.png") !important;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      height: 100vh;
      margin: 0;
      font-family: 'Arial', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
  }
  
  .content {
      background: rgba(255, 255, 255, 0.95); /* Blanc légèrement transparent */
      border-radius: 15px;
      padding: 30px;
      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
      width: 80%;
      max-width: 600px;
      text-align: center;
  }
  
  h1 {
      font-size: 2rem;
      font-weight: bold;
      color: #4682B4; /* Bleu acier doux */
      margin-bottom: 20px;
  }
  
  p {
      color: #2F4F4F; /* Gris ardoise */
      line-height: 1.6;
      font-size: 1.1rem;
  }
  
  a {
      color: #00CED1; /* Turquoise clair */
      text-decoration: none;
      font-weight: bold;
  }
  
  a:hover {
      color: #20B2AA; /* Bleu sarcelle */
      text-decoration: underline;
  }
  
  button {
      background-color: #5F9EA0; /* Bleu cadet */
      color: white;
      border: none;
      border-radius: 5px;
      padding: 10px 20px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
  }
  
  button:hover {
      background-color: #4682B4; /* Même bleu que le titre pour cohérence */
      transform: scale(1.05);
  }
  
  
      </style>
  </head>
  <body>
      <div class="content">
          <h1 class="text-center mb-4">Effondrement des oiseaux en Europe</h1>
          <p>
              🕊️ Depuis les années 1980, l'Europe a perdu un tiers de ses populations d'oiseaux. La principale cause ? La destruction des habitats naturels. 
          </p>
          <p>
              Pour en savoir plus sur ce sujet, consultez cet article : 
              <a href="https://www.goodplanet.info/2023/05/16/effondrement-des-oiseaux-en-europe-des-chercheurs-pointent-lagriculture-intensive/" target="_blank">Effondrement des oiseaux</a>.
          </p>
          <div class="text-center mt-4">
              <button class="btn btn-primary" id="redirectBtn">
                  Accéder à votre lien.
              </button>
          </div>
      </div>
  
      <script>
          const redirectBtn = document.getElementById('redirectBtn');
          redirectBtn.addEventListener('click', function() {
              const url = "${userUrl}";
              window.location.href = url;
          });
      </script>
  </body>
  </html>`;
      res.send(htmlResponse);
    } else if (Type == "terrestre") {
      const htmlResponse = `<!DOCTYPE html>
  <html lang="fr">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Les animaux terrestres et leur conservation</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
         body {
      background-image: url("/pokemon_fond.png");
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      height: 100vh;
      margin: 0;
      font-family: 'Arial', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
  }
  
  .content {
      background: rgba(255, 248, 240, 0.95); /* Beige clair semi-transparent */
      border-radius: 15px;
      padding: 30px;
      box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.3);
      width: 80%;
      max-width: 600px;
      text-align: center;
  }
  
  h1 {
      font-size: 2rem;
      font-weight: bold;
      color: #5A3E2B; /* Marron foncé */
      margin-bottom: 20px;
  }
  
  p {
      color: #4A2E1E; /* Marron légèrement plus clair */
      line-height: 1.6;
      font-size: 1.1rem;
  }
  
  a {
      color: #6B8E23; /* Vert olive */
      text-decoration: none;
      font-weight: bold;
  }
  
  a:hover {
      color: #3E7327; /* Vert plus foncé */
      text-decoration: underline;
  }
  
  button {
      background-color: #A0522D; /* Marron terre */
      color: white;
      border: none;
      border-radius: 5px;
      padding: 10px 20px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
  }
  
  button:hover {
      background-color: #8B4513; /* Marron plus foncé */
      transform: scale(1.05);
  }
  
      </style>
  </head>
  <body>
      <div class="content">
          <h1 class="text-center mb-4">Conservation des espèces terrestres</h1>
          <p>
              🐾 La déforestation, le braconnage et la perte d'habitat menacent les espèces terrestres. Les éléphants, les tigres et les gorilles sont parmi les plus affectés. 
          </p>
          <p>
              Pour en savoir plus sur ce sujet, consultez cet article : 
              <a href="https://www.goodplanet.info/2021/11/07/les-animaux-nexplorent-plus-le-monde-comme-avant/" target="_blank">Conservation des animaux terrestres</a>.
          </p>
          <div class="text-center mt-4">
              <button class="btn btn-primary" id="redirectBtn">
                  Accéder à votre lien.
              </button>
          </div>
      </div>
  
      <script>
          const redirectBtn = document.getElementById('redirectBtn');
          redirectBtn.addEventListener('click', function() {
              const url = "${userUrl}";
              window.location.href = url;
          });
      </script>
  </body>
  </html>`;
      res.send(htmlResponse);
    }
  });
  

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

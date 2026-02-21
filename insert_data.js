require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const maleNames = ['Lucas', 'Gabriel', 'Léo', 'Raphaël', 'Arthur', 'Louis', 'Jules', 'Adam', 'Maël', 'Hugo', 'Liam', 'Noah', 'Paul', 'Ethan', 'Tiago', 'Sacha', 'Gabin', 'Nathan', 'Aaron', 'Enzo', 'Tom', 'Victor', 'Milan', 'Mathéo', 'Gaspard', 'Timéo', 'Antoine', 'Clément', 'Valentin', 'Maxime', 'Julien', 'Bastien', 'Thomas', 'Nicolas', 'Pierre'];
const femaleNames = ['Emma', 'Jade', 'Louise', 'Alice', 'Chloé', 'Lina', 'Léa', 'Rose', 'Anna', 'Mila', 'Inès', 'Ambre', 'Julia', 'Mia', 'Léna', 'Juliette', 'Lou', 'Zoé', 'Nina', 'Agathe', 'Jeanne', 'Lola', 'Eva', 'Victoria', 'Romane', 'Camille', 'Sarah', 'Clara', 'Margaux', 'Lucie', 'Marie', 'Manon', 'Océane', 'Laura', 'Julie'];
const lastNames = ['Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefebvre', 'Leroy', 'Roux', 'David', 'Bertrand', 'Morel', 'Fournier', 'Girard', 'Bonnet', 'Dupont', 'Lambert', 'Fontaine', 'Rousseau', 'Vincent', 'Muller', 'Garnier', 'Lefevre', 'Faure'];
const cities = ['Toulon', 'La Seyne-sur-Mer', 'Hyères', 'Bandol', 'Ollioules', 'Sanary-sur-Mer', 'Six-Fours-les-Plages', 'Le Pradet', 'Carqueiranne', 'La Garde'];

const bios = ["Grand amateur de gastronomie locale.", "Toujours à la recherche des meilleures adresses !", "Globe-trotteur culinaire en Provence.", "J'adore partager mes découvertes avec la communauté.", "Passionné de bons petits plats du Sud.", "En quête de l'ultime Pizza Napolitaine.", "Un bon repas c'est la vie.", "Épicurien avant tout.", "Découvrir et partager !", "Fin gourmet de la côte d'Azur, amoureux du terroir.", "Photographe culinaire à mes heures perdues.", "Mes reviews sont toujours 100% honnêtes.", "Le bon vin et la bonne bouffe !", "Chasseur de pépites cachées à Toulon.", "Ici pour trouver des restos sympa entre amis."];

const restaurants_prefix = ["Le Petit", "La Table de", "Chez", "L'Épicurien de", "Bistrot", "La Dolce Vita", "Les Saveurs de", "Le Piment", "Au fil de", "Le Comptoir", "Le Cabanon de", "L'Atelier de", "Cantine", "Le Boudoir", "La Guinguette de"];
const restaurants_suffix = ["Bouchon", "Léon", "Sud", "Rouge", "l'eau", "Gourmand", "Central", "Plage", "Jardin", "Terrasse", "la Baie", "Pêcheur", "Soleil", "Marius", "la Mer"];
const meal_types_list = ['Petit-déjeuner', 'Déjeuner', 'Pause sucrée', 'Dîner'];
const foods_list = ['Italien', 'Chinois', 'Japonais', 'Mexicain', 'Thai', 'Indien', 'Libanais', 'American'];
const dietary_list = ['Standard', 'Végan', 'Végétarien', 'Sans gluten', 'Halal', 'Casher'];
const atmospheres_list = ['Romantique', 'Familial', 'Conviviale', 'Animé', 'Calme'];
const services_list = ['Sur place', 'À emporter', 'Livraison', 'Click & Collect'];

const posAdjectives = ['incroyable', 'magique', 'superbe', 'génial', 'délicieux', 'parfait', 'fantastique', 'inoubliable', 'très bon'];
const posSubjects = ['Le service', 'Le repas', 'Le cadre', "L'accueil", 'Le rapport qualité/prix', "L'ambiance"];
const posEndings = ['À refaire vite !', 'Je recommande les yeux fermés.', 'Grosse recommandation !', 'Une pépite.', "On s'est régalés.", 'Bravo au chef !'];

const negAdjectives = ['décevant', 'moyen', 'fade', 'trop cher', 'bruyant', 'long'];
const negSubjects = ['Le service', 'Le plat', "L'accueil", 'Le serveur', 'Le prix'];
const negEndings = ['Dommage.', "Je n'y retournerai pas.", 'Passez votre chemin.', 'À éviter.', 'Pas terrible...', 'Bof.'];

const proFoodImages = [
    'https://www.themealdb.com/images/media/meals/wpputp1511812960.jpg',
    'https://www.themealdb.com/images/media/meals/vrspxv1511722107.jpg',
    'https://www.themealdb.com/images/media/meals/vdwloy1713225718.jpg',
    'https://www.themealdb.com/images/media/meals/u9ezi21764375474.jpg',
    'https://www.themealdb.com/images/media/meals/vvstvq1487342592.jpg',
    'https://www.themealdb.com/images/media/meals/fk80jp1763280767.jpg',
    'https://www.themealdb.com/images/media/meals/kwmdk41764120884.jpg',
    'https://www.themealdb.com/images/media/meals/vvpprx1487325699.jpg',
    'https://www.themealdb.com/images/media/meals/1550440197.jpg',
    'https://www.themealdb.com/images/media/meals/7vpsfp1608588991.jpg',
    'https://www.themealdb.com/images/media/meals/1529445893.jpg',
    'https://www.themealdb.com/images/media/meals/sqpqtp1515365614.jpg',
    'https://www.themealdb.com/images/media/meals/1550442508.jpg',
    'https://www.themealdb.com/images/media/meals/utxqpt1511639216.jpg',
    'https://www.themealdb.com/images/media/meals/er4d081765186828.jpg',
    'https://www.themealdb.com/images/media/meals/xlqqhw1764369924.jpg',
    'https://www.themealdb.com/images/media/meals/96lt871763480970.jpg',
    'https://www.themealdb.com/images/media/meals/sktequ1764447186.jpg',
    'https://www.themealdb.com/images/media/meals/7xte3u1763757761.jpg',
    'https://www.themealdb.com/images/media/meals/yxsurp1511304301.jpg',
    'https://www.themealdb.com/images/media/meals/cybyue1614349443.jpg',
    'https://www.themealdb.com/images/media/meals/yvpuuy1511797244.jpg',
    'https://www.themealdb.com/images/media/meals/47y6ii1765658818.jpg',
    'https://www.themealdb.com/images/media/meals/xquakq1619787532.jpg',
    'https://www.themealdb.com/images/media/meals/uuxwvq1483907861.jpg',
    'https://www.themealdb.com/images/media/meals/swttys1511385853.jpg',
    'https://www.themealdb.com/images/media/meals/swo87v1763595282.jpg',
    'https://www.themealdb.com/images/media/meals/st1ifa1583267248.jpg',
    'https://www.themealdb.com/images/media/meals/1549542994.jpg',
    'https://www.themealdb.com/images/media/meals/yuwtuu1511295751.jpg',
    'https://www.themealdb.com/images/media/meals/58bkyo1593350017.jpg',
    'https://www.themealdb.com/images/media/meals/zry07j1763779321.jpg',
    'https://www.themealdb.com/images/media/meals/1520084413.jpg',
    'https://www.themealdb.com/images/media/meals/s1jxzl1764369317.jpg',
    'https://www.themealdb.com/images/media/meals/xxyupu1468262513.jpg',
    'https://www.themealdb.com/images/media/meals/9zqrod1763075574.jpg',
    'https://www.themealdb.com/images/media/meals/4mzt101763761546.jpg',
    'https://www.themealdb.com/images/media/meals/d8f6qx1604182128.jpg',
    'https://www.themealdb.com/images/media/meals/sywswr1511383814.jpg',
    'https://www.themealdb.com/images/media/meals/8rfd4q1764112993.jpg',
    'https://www.themealdb.com/images/media/meals/vssrtx1511557680.jpg',
    'https://www.themealdb.com/images/media/meals/41cxjh1683207682.jpg',
    'https://www.themealdb.com/images/media/meals/ysqupp1511640538.jpg',
    'https://www.themealdb.com/images/media/meals/n7h5zs1765318909.jpg',
    'https://www.themealdb.com/images/media/meals/tqd3ac1763786065.jpg',
    'https://www.themealdb.com/images/media/meals/9kwatm1763327074.jpg',
    'https://www.themealdb.com/images/media/meals/1525873040.jpg',
    'https://www.themealdb.com/images/media/meals/o5fuq51764789643.jpg',
    'https://www.themealdb.com/images/media/meals/wdfa171763065079.jpg',
    'https://www.themealdb.com/images/media/meals/jyylmo1763790808.jpg',
    'https://www.themealdb.com/images/media/meals/lpd4wy1614347943.jpg',
    'https://www.themealdb.com/images/media/meals/vpcqn01763335688.jpg',
    'https://www.themealdb.com/images/media/meals/gtpvwp1763363947.jpg',
    'https://www.themealdb.com/images/media/meals/rxvxrr1511797671.jpg',
    'https://www.themealdb.com/images/media/meals/ytuvwr1503070420.jpg',
    'https://www.themealdb.com/images/media/meals/ntafxw1763586291.jpg',
    'https://www.themealdb.com/images/media/meals/uttupv1511815050.jpg',
    'https://www.themealdb.com/images/media/meals/h3ijwo1581013377.jpg',
    'https://www.themealdb.com/images/media/meals/uwxusv1487344500.jpg',
    'https://www.themealdb.com/images/media/meals/w36ets1764362474.jpg'
];
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomItems = (arr, count) => {
    let copy = [...arr];
    copy.sort(() => Math.random() - 0.5);
    return copy.slice(0, count);
};
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const NUM_RESTAURANTS = 60;
const NUM_LOCALS = 150;

const USERS_TO_KEEP = ['3a03cc54-3122-424b-8e68-45678385efd7', '0e6959fe-9d29-4d3f-bd16-f676ed23e1a9'];

async function run() {
    let users = [];
    for (let i = 1; i <= NUM_LOCALS; i++) {
        let gender = i % 2 === 0 ? 'female' : 'male';
        let fn = gender === 'female' ? randomItem(femaleNames) : randomItem(maleNames);
        let ln = randomItem(lastNames);
        let id = generateUUID();
        let username = `local_${fn.toLowerCase()}_${ln.toLowerCase()}_${randomInt(10, 999)}`;
        let picIdx = randomInt(0, 78);
        let avatarUrl = `https://xsgames.co/randomusers/assets/avatars/${gender}/${picIdx}.jpg`;

        users.push({
            id,
            username,
            full_name: `${fn} ${ln}`,
            bio: randomItem(bios),
            city: randomItem(cities),
            is_contributor: true,
            avatar_url: avatarUrl
        });
    }

    console.log(`Inserting ${users.length} profiles...`);
    const { error: err1 } = await supabase.from('profiles').insert(users);
    if (err1) { console.error('Profiles error:', err1); return; }

    let restaurants = [];
    const centerLat = 43.1242;
    const centerLng = 5.9280;

    for (let i = 1; i <= NUM_RESTAURANTS; i++) {
        let name = `${randomItem(restaurants_prefix)} ${randomItem(restaurants_suffix)}`;
        if (Math.random() > 0.6) name = `${randomItem(restaurants_prefix)} ${randomItem(cities)}`;
        else if (Math.random() > 0.8) name = `${randomItem(restaurants_prefix)} ${randomItem(lastNames)}`;

        let lat = (centerLat + (Math.random() * 0.1 - 0.05)).toFixed(6);
        let lng = (centerLng + (Math.random() * 0.1 - 0.05)).toFixed(6);

        let dietary = randomItems(dietary_list, randomInt(1, 2));

        // Assign a guaranteed high quality professional food image from our static array of 60 images
        let imageUrl = proFoodImages[i % proFoodImages.length];

        restaurants.push({
            id: generateUUID(),
            name,
            address: `${randomInt(1, 150)} rue ${randomItem(lastNames)}`,
            city: randomItem(cities),
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            budget_level: randomInt(9, 200),
            meal_types: randomItems(meal_types_list, randomInt(1, 3)),
            food_types: randomItems(foods_list, randomInt(1, 2)),
            dietary_prefs: dietary,
            services: randomItems(services_list, randomInt(1, 3)),
            atmospheres: randomItems(atmospheres_list, randomInt(1, 2)),
            image_url: imageUrl
        });
    }

    console.log(`Inserting ${restaurants.length} restaurants...`);
    const { error: err2 } = await supabase.from('restaurants').insert(restaurants);
    if (err2) { console.error('Restaurants error:', err2); return; }

    const allUsers = [...users, { id: USERS_TO_KEEP[0] }, { id: USERS_TO_KEEP[1] }];
    let reviews = [];

    restaurants.forEach((resto) => {
        let numReviews = randomInt(10, 25);
        let reviewers = randomItems(allUsers, numReviews);

        reviewers.forEach(user => {
            let isPositive = Math.random() > 0.25;
            let title, desc;
            if (isPositive) {
                title = `${randomItem(posSubjects)} est ${randomItem(posAdjectives)} !`;
                if (Math.random() > 0.5) title = randomItem(['Une belle surprise', 'Excellent', 'Très bon moment', 'Parfait']);
                desc = `${randomItem(posSubjects)} était vraiment ${randomItem(posAdjectives)}. ${randomItem(posEndings)}`;
            } else {
                title = `Assez ${randomItem(negAdjectives)}...`;
                if (Math.random() > 0.5) title = randomItem(['Décevant', 'Moyen', 'À éviter', 'Bof']);
                desc = `${randomItem(negSubjects)} était ${randomItem(negAdjectives)}. ${randomItem(negEndings)}`;
            }

            let date = new Date();
            date.setDate(date.getDate() - randomInt(0, 300));

            reviews.push({
                restaurant_id: resto.id,
                contributor_id: user.id,
                title,
                description: desc,
                rating: isPositive ? randomInt(4, 5) : randomInt(1, 3),
                created_at: date.toISOString()
            });
        });
    });

    console.log(`Inserting ${reviews.length} reviews...`);

    // batch chunk reviews because there might be hundreds
    const chunkSize = 500;
    for (let i = 0; i < reviews.length; i += chunkSize) {
        const chunk = reviews.slice(i, i + chunkSize);
        const { error: err3 } = await supabase.from('reviews').insert(chunk);
        if (err3) { console.error('Reviews chunk error:', err3); return; }
    }

    console.log('Done generating data successfully via Supabase JS client!');
}

run();

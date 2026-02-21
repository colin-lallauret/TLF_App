const fs = require('fs');

const USERS_TO_KEEP = ['3a03cc54-3122-424b-8e68-45678385efd7', '0e6959fe-9d29-4d3f-bd16-f676ed23e1a9'];

const maleNames = ['Lucas', 'Gabriel', 'Léo', 'Raphaël', 'Arthur', 'Louis', 'Jules', 'Adam', 'Maël', 'Hugo', 'Liam', 'Noah', 'Paul', 'Ethan', 'Tiago', 'Sacha', 'Gabin', 'Nathan', 'Aaron', 'Enzo', 'Tom', 'Victor', 'Milan', 'Mathéo', 'Gaspard', 'Timéo', 'Antoine', 'Clément', 'Valentin', 'Maxime', 'Julien', 'Bastien', 'Thomas', 'Nicolas', 'Pierre'];
const femaleNames = ['Emma', 'Jade', 'Louise', 'Alice', 'Chloé', 'Lina', 'Léa', 'Rose', 'Anna', 'Mila', 'Inès', 'Ambre', 'Julia', 'Mia', 'Léna', 'Juliette', 'Lou', 'Zoé', 'Nina', 'Agathe', 'Jeanne', 'Lola', 'Eva', 'Victoria', 'Romane', 'Camille', 'Sarah', 'Clara', 'Margaux', 'Lucie', 'Marie', 'Manon', 'Océane', 'Laura', 'Julie'];
const lastNames = ['Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefebvre', 'Leroy', 'Roux', 'David', 'Bertrand', 'Morel', 'Fournier', 'Girard', 'Bonnet', 'Dupont', 'Lambert', 'Fontaine', 'Rousseau', 'Vincent', 'Muller', 'Garnier', 'Lefevre', 'Faure'];
const cities = ['Toulon', 'La Seyne-sur-Mer', 'Hyères', 'Bandol', 'Ollioules', 'Sanary-sur-Mer', 'Six-Fours-les-Plages', 'Le Pradet', 'Carqueiranne', 'La Garde'];

// Realistic short bios
const bios = ["Grand amateur de gastronomie locale.", "Toujours à la recherche des meilleures adresses !", "Globe-trotteur culinaire en Provence.", "J'adore partager mes découvertes avec la communauté.", "Passionné de bons petits plats du Sud.", "En quête de l'ultime Pizza Napolitaine.", "Un bon repas c'est la vie.", "Épicurien avant tout.", "Découvrir et partager !", "Fin gourmet de la côte d'Azur, amoureux du terroir.", "Photographe culinaire à mes heures perdues.", "Mes reviews sont toujours 100% honnêtes.", "Le bon vin et la bonne bouffe !", "Chasseur de pépites cachées à Toulon.", "Ici pour trouver des restos sympa entre amis."];

const restaurants_prefix = ["Le Petit", "La Table de", "Chez", "L'Épicurien de", "Bistrot", "La Dolce Vita", "Les Saveurs de", "Le Piment", "Au fil de", "Le Comptoir", "Le Cabanon de", "L'Atelier de", "Cantine", "Le Boudoir", "La Guinguette de"];
const restaurants_suffix = ["Bouchon", "Léon", "Sud", "Rouge", "l'eau", "Gourmand", "Central", "Plage", "Jardin", "Terrasse", "la Baie", "Pêcheur", "Soleil", "Marius", "la Mer"];
const foods_list = ['Italien', 'Chinois', 'Japonais', 'Mexicain', 'Thaï', 'Indien', 'Libanais', 'Américain', 'Français', 'Méditerranéen', 'Espagnol', 'Coréen', 'Argentin', 'Vietnamien'];
const atmospheres_list = ['Conviviale', 'Romantique', 'Familiale', 'Festive', 'Chic', 'Décontractée', 'Cosy', 'Branchée', 'Chaleureuse', 'Lounge'];
const services_list = ['Sur place', 'À emporter', 'Livraison', 'Wifi gratuit', 'Terrasse', 'Parking', 'Voiturier', 'Accès PMR', 'Climatisation', 'Réservation en ligne'];

// Realistic Review Components
const posAdjectives = ['incroyable', 'magique', 'superbe', 'génial', 'délicieux', 'parfait', 'fantastique', 'inoubliable', 'très bon'];
const posSubjects = ['Le service', 'Le repas', 'Le cadre', "L'accueil", 'Le rapport qualité/prix', "L'ambiance"];
const posEndings = ['À refaire vite !', 'Je recommande les yeux fermés.', 'Grosse recommandation !', 'Une pépite.', "On s'est régalés.", 'Bravo au chef !'];

const negAdjectives = ['décevant', 'moyen', 'fade', 'trop cher', 'bruyant', 'long'];
const negSubjects = ['Le service', 'Le plat', "L'accueil", 'Le serveur', 'Le prix'];
const negEndings = ['Dommage.', "Je n'y retournerai pas.", 'Passez votre chemin.', 'À éviter.', 'Pas terrible...', 'Bof.'];

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

const NUM_RESTAURANTS = 30; // Keep it dense
const NUM_LOCALS = 50;

let sql = "TRUNCATE public.messages, public.conversations, public.souvenirs, public.reviews, public.trip_steps, public.trips, public.restaurants, public.favorite_restaurants, public.favorite_contributors RESTART IDENTITY CASCADE; ";
sql += "DELETE FROM public.profiles WHERE id NOT IN ('" + USERS_TO_KEEP.join("', '") + "'); ";

let users = [];
let usersVals = [];
for (let i = 1; i <= NUM_LOCALS; i++) {
    let gender = i % 2 === 0 ? 'female' : 'male';
    let fn = gender === 'female' ? randomItem(femaleNames) : randomItem(maleNames);
    let ln = randomItem(lastNames);
    let id = generateUUID();
    let username = `local_${fn.toLowerCase()}_${ln.toLowerCase()}_${randomInt(10, 999)}`;
    let picIdx = randomInt(1, 99);
    let avatarUrl = `https://randomuser.me/api/portraits/${gender === 'female' ? 'women' : 'men'}/${picIdx}.jpg`;

    let dbUsername = username.replace(/'/g, "''");
    let fullName = `${fn} ${ln}`.replace(/'/g, "''");
    let bio = randomItem(bios).replace(/'/g, "''");
    let city = randomItem(cities).replace(/'/g, "''");

    users.push({ id });
    usersVals.push(`('${id}', '${dbUsername}', '${fullName}', '${bio}', '${city}', true, '${avatarUrl}')`);
}
sql += `INSERT INTO public.profiles (id, username, full_name, bio, city, is_contributor, avatar_url) VALUES ` + usersVals.join(", ") + `; `;

let restaurants = [];
const centerLat = 43.1242;
const centerLng = 5.9280;
let restosVals = [];
for (let i = 1; i <= NUM_RESTAURANTS; i++) {
    let name = `${randomItem(restaurants_prefix)} ${randomItem(restaurants_suffix)}`;
    if (Math.random() > 0.6) name = `${randomItem(restaurants_prefix)} ${randomItem(cities)}`;
    else if (Math.random() > 0.8) name = `${randomItem(restaurants_prefix)} ${randomItem(lastNames)}`;

    let lat = (centerLat + (Math.random() * 0.1 - 0.05)).toFixed(6);
    let lng = (centerLng + (Math.random() * 0.1 - 0.05)).toFixed(6);

    let budget = randomInt(1, 4);
    let mealTypes = randomItems(['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Brunch'], randomInt(1, 3));
    let foodTypes = randomItems(foods_list, randomInt(1, 2));
    let dietary = [];
    if (Math.random() > 0.7) dietary.push('Végétarien');
    if (Math.random() > 0.9) dietary.push('Vegan');
    if (Math.random() > 0.9) dietary.push('Sans gluten');

    let services = randomItems(services_list, randomInt(2, 4));
    let atmospheres = randomItems(atmospheres_list, randomInt(1, 3));
    let city = randomItem(cities);

    let address = `${randomInt(1, 150)} rue ${randomItem(lastNames)}`;

    let id = generateUUID();
    restaurants.push({ id });

    let val = `('${id}', '${name.replace(/'/g, "''")}', '${address.replace(/'/g, "''")}', '${city.replace(/'/g, "''")}', ${lat}, ${lng}, ${budget}, ARRAY[${mealTypes.map(m => `'${m.replace(/'/g, "''")}'`).join(', ')}]::text[], ARRAY[${foodTypes.map(m => `'${m.replace(/'/g, "''")}'`).join(', ')}]::text[], ARRAY[${dietary.map(m => `'${m.replace(/'/g, "''")}'`).join(', ')}]::text[], ARRAY[${services.map(m => `'${m.replace(/'/g, "''")}'`).join(', ')}]::text[], ARRAY[${atmospheres.map(m => `'${m.replace(/'/g, "''")}'`).join(', ')}]::text[])`;
    restosVals.push(val);
}
sql += `INSERT INTO public.restaurants (id, name, address, city, lat, lng, budget_level, meal_types, food_types, dietary_prefs, services, atmospheres) VALUES ` + restosVals.join(", ") + `; `;

const allUsers = [...users, { id: USERS_TO_KEEP[0] }, { id: USERS_TO_KEEP[1] }];
let reviewsVals = [];
restaurants.forEach((resto) => {
    let numReviews = randomInt(10, 20);
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
        let rating = isPositive ? randomInt(4, 5) : randomInt(1, 3);
        let daysAgo = randomInt(0, 300);
        let created_at = `NOW() - interval '${daysAgo} days'`;
        reviewsVals.push(`('${resto.id}', '${user.id}', '${title.replace(/'/g, "''")}', '${desc.replace(/'/g, "''")}', ${rating}, ${created_at})`);
    });
});

sql += `INSERT INTO public.reviews (restaurant_id, contributor_id, title, description, rating, created_at) VALUES ` + reviewsVals.join(", ") + ` ON CONFLICT DO NOTHING; `;

fs.writeFileSync('/Users/colin/Documents/Git/TLF_App/tlf/AAA_GUIDELINES/data_exemple_single_line.sql', sql, 'utf8');
console.log('Script SQL généré !');

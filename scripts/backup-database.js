/**
 * Script de backup de la base de données Supabase
 * Usage: node scripts/backup-database.js
 * 
 * Note: Pour un backup complet, ajoutez SUPABASE_SERVICE_KEY dans votre .env
 * Vous pouvez le trouver dans: Supabase Dashboard > Settings > API > service_role key
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Erreur: Variables d\'environnement manquantes');
    console.error('Assurez-vous que EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY sont définis dans .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Liste des tables à sauvegarder
const TABLES = [
    'profiles',
    'restaurants',
    'reviews',
    'conversations',
    'messages',
    'favorite_restaurants',
    'favorite_contributors',
    'souvenirs'
];

async function backupTable(tableName) {
    console.log(`📥 Sauvegarde de la table: ${tableName}...`);

    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*');

        if (error) {
            console.error(`❌ Erreur pour ${tableName}:`, error.message);
            return null;
        }

        console.log(`✅ ${tableName}: ${data?.length || 0} enregistrements`);
        return { table: tableName, data, count: data?.length || 0 };
    } catch (err) {
        console.error(`❌ Exception pour ${tableName}:`, err.message);
        return null;
    }
}

async function createBackup() {
    console.log('🔄 Début du backup de la base de données...');
    console.log(`🔗 URL: ${SUPABASE_URL}`);
    console.log(`🔑 Utilisation de: ${process.env.SUPABASE_SERVICE_KEY ? 'Service Key' : 'Anon Key'}\n`);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupDir = path.join(__dirname, '..', 'backups');

    // Créer le dossier de backup s'il n'existe pas
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        supabase_url: SUPABASE_URL,
        tables: {}
    };

    let totalRecords = 0;

    // Sauvegarder chaque table
    for (const table of TABLES) {
        const result = await backupTable(table);
        if (result && result.data) {
            backup.tables[table] = result.data;
            totalRecords += result.count;
        }
    }

    // Sauvegarder dans un fichier JSON
    const filename = `tlf_backup_${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2), 'utf8');

    const stats = fs.statSync(filepath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log('\n✅ Backup terminé avec succès!');
    console.log(`📁 Fichier: ${filename}`);
    console.log(`📊 Taille: ${fileSizeMB} MB`);
    console.log(`📍 Emplacement: ${filepath}`);
    console.log(`📈 Total: ${totalRecords} enregistrements`);

    // Résumé
    console.log('\n📊 Résumé par table:');
    Object.entries(backup.tables).forEach(([table, data]) => {
        console.log(`   - ${table}: ${data.length} enregistrements`);
    });

    if (Object.keys(backup.tables).length === 0) {
        console.log('\n⚠️  Aucune donnée sauvegardée!');
        console.log('💡 Conseil: Ajoutez SUPABASE_SERVICE_KEY dans votre .env pour un backup complet');
        console.log('   Vous pouvez le trouver dans: Supabase Dashboard > Settings > API > service_role key');
    }
}

// Exécuter le backup
createBackup().catch(err => {
    console.error('❌ Erreur fatale:', err);
    process.exit(1);
});

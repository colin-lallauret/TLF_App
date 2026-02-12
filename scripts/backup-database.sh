#!/bin/bash

# Script de backup de la base de données Supabase
# Usage: ./scripts/backup-database.sh

# Configuration
PROJECT_REF="acrvdonyipmmhfimaknw"
DB_HOST="db.${PROJECT_REF}.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="Y3cSr5!C$7$TR4NK"

# Créer le dossier de backup s'il n'existe pas
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Nom du fichier de backup avec timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/tlf_backup_${TIMESTAMP}.sql"

echo "🔄 Début du backup de la base de données..."
echo "📁 Fichier de destination: $BACKUP_FILE"

# Exporter la variable d'environnement pour le mot de passe
export PGPASSWORD="$DB_PASSWORD"

# Effectuer le backup avec pg_dump
pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  -f "$BACKUP_FILE"

# Vérifier si le backup a réussi
if [ $? -eq 0 ]; then
    echo "✅ Backup réussi!"
    echo "📊 Taille du fichier: $(du -h "$BACKUP_FILE" | cut -f1)"
    
    # Compresser le backup
    echo "🗜️  Compression du backup..."
    gzip "$BACKUP_FILE"
    echo "✅ Backup compressé: ${BACKUP_FILE}.gz"
    echo "📊 Taille compressée: $(du -h "${BACKUP_FILE}.gz" | cut -f1)"
else
    echo "❌ Erreur lors du backup"
    exit 1
fi

# Nettoyer la variable d'environnement
unset PGPASSWORD

echo "🎉 Backup terminé avec succès!"

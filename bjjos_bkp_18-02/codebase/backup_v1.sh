#!/bin/bash

# Script de Backup Automático BjjOss V1
# Data: 18/02/2026
# Autor: DevOps Engineer (AI Agent)

BACKUP_DIR="bjjos_bkp_18-02"
PROJECT_ROOT=$(pwd)

echo "--- INICIANDO BACKUP DO SISTEMA BJJOSS V1 ---"

# 1. Criar Diretórios
mkdir -p "$BACKUP_DIR/codebase"
mkdir -p "$BACKUP_DIR/database"
mkdir -p "$BACKUP_DIR/documentation"

# 2. Copiar Código Fonte (Ignorando node_modules, dist, .git)
echo "[1/4] Copiando Código Fonte..."
rsync -av --progress . "$BACKUP_DIR/codebase/" \
    --exclude node_modules \
    --exclude dist \
    --exclude .git \
    --exclude bjjos_bkp_* \
    --exclude .DS_Store

# 3. Copiar Cérebro da IA (.agent) - CRÍTICO
echo "[2/4] Copiando Memória da IA (.agent)..."
rsync -av --progress .agent "$BACKUP_DIR/codebase/"

# 4. Mover Scripts de Banco de Dados Gerados
echo "[3/4] Organizando Scripts SQL..."
mv "$BACKUP_DIR/codebase/FULL_RESTORE_V1.sql" "$BACKUP_DIR/database/" 2>/dev/null || echo "Aviso: FULL_RESTORE_V1.sql já movido ou não encontrado na raiz."
# Mover outros scripts úteis se existirem
cp "$PROJECT_ROOT/RESCUE_PERMISSIONS.sql" "$BACKUP_DIR/database/" 2>/dev/null
cp "$PROJECT_ROOT/TOTAL_DATABASE_FIX_2026.sql" "$BACKUP_DIR/database/" 2>/dev/null

# 5. Mover Documentação
echo "[4/4] Finalizando Documentação..."
mv "$BACKUP_DIR/codebase/bjjos_bkp_18-02/BKP_BjjOss.md" "$BACKUP_DIR/" 2>/dev/null || echo "Aviso: BKP_BjjOss.md já movido."
# Se o arquivo foi criado dentro da pasta de backup pelo agente anterior, mova para a raiz do backup
if [ -f "$BACKUP_DIR/codebase/bjjos_bkp_18-02/BKP_BjjOss.md" ]; then
    mv "$BACKUP_DIR/codebase/bjjos_bkp_18-02/BKP_BjjOss.md" "$BACKUP_DIR/BKP_BjjOss.md"
fi

# Limpeza Final de Arquivos Duplicados
rm -rf "$BACKUP_DIR/codebase/bjjos_bkp_18-02"

echo "--- BACKUP CONCLUÍDO COM SUCESSO! ---"
echo "Localização: $(pwd)/$BACKUP_DIR"
echo "Para restaurar em outra máquina: copie esta pasta e leia o arquivo BKP_BjjOss.md"

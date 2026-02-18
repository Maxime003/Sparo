# 🚀 Finzeo - Guide de Développement MVP

**Version :** 1.0  
**Date :** 17 février 2026  
**Projet :** Finzeo - Gestion de Finances Personnelles  
**Statut :** En développement

---

## 📋 Table des matières

1. [Vue d'ensemble MVP](#1-vue-densemble-mvp)
2. [Stack technique](#2-stack-technique)
3. [Setup initial](#3-setup-initial)
4. [Configuration Supabase](#4-configuration-supabase)
5. [Configuration Vercel](#5-configuration-vercel)
6. [Architecture du code](#6-architecture-du-code)
7. [Parsing CSV Crédit Agricole](#7-parsing-csv-crédit-agricole)
8. [Parcours utilisateur MVP](#8-parcours-utilisateur-mvp)
9. [Checklist de développement](#9-checklist-de-développement)
10. [Ressources et références](#10-ressources-et-références)

---

## 1. Vue d'ensemble MVP

### 1.1 Objectif

Créer un **parcours utilisateur minimal fonctionnel** permettant de :
- ✅ S'inscrire/se connecter (email+password + Google OAuth)
- ✅ Importer un fichier CSV Crédit Agricole
- ✅ Parser et stocker les transactions
- ✅ Catégoriser les transactions une par une
- ✅ Consulter un dashboard simple avec revenus/dépenses/solde

### 1.2 Scope MVP (non négociable)

**Inclus :**
- ✅ Authentification complète (email/password + Google OAuth)
- ✅ Import CSV Crédit Agricole uniquement (un seul CSV à la fois)
- ✅ Parsing robuste des libellés multi-lignes
- ✅ Catégorisation manuelle avec suggestions basiques
- ✅ Dashboard minimal (revenus/dépenses/solde du mois)
- ✅ Liste des transactions avec filtres basiques
- ✅ Édition des transactions (description + catégorie)
- ✅ UI en français uniquement

**Hors scope MVP (version ultérieure) :**
- ❌ Multi-banques / autres formats CSV
- ❌ Système de budgets
- ❌ Alertes et notifications
- ❌ Exports Excel/PDF
- ❌ Multi-comptes bancaires
- ❌ Application mobile
- ❌ Partage avec d'autres utilisateurs

### 1.3 Critères de succès MVP

Un utilisateur peut :
1. Créer un compte et se connecter (email ou Google)
2. Importer un CSV Crédit Agricole sans erreur
3. Voir ses transactions importées en base
4. Catégoriser 20+ transactions rapidement
5. Consulter un dashboard mensuel cohérent
6. Modifier n'importe quelle transaction

---

## 2. Stack technique

### 2.1 Frontend

```json
{
  "framework": "React 18.3+",
  "language": "TypeScript 5.x",
  "build": "Vite 5.x",
  "routing": "React Router v6",
  "state": "Zustand 4.x",
  "data_fetching": "@tanstack/react-query 5.x",
  "ui_framework": "Tailwind CSS 3.x",
  "components": "shadcn/ui",
  "forms": "React Hook Form + Zod",
  "dates": "date-fns 3.x",
  "icons": "lucide-react",
  "csv_parsing": "papaparse 5.x"
}
```

### 2.2 Backend (BaaS)

```json
{
  "database": "Supabase (PostgreSQL 15+)",
  "auth": "Supabase Auth (email + Google OAuth)",
  "realtime": "Supabase Realtime (optionnel MVP)",
  "storage": "Supabase Storage (non utilisé MVP)"
}
```

### 2.3 Déploiement

- **Frontend** : Vercel (Hobby plan - gratuit)
- **Backend** : Supabase (Free plan - gratuit)

---

## 3. Setup initial

### 3.1 Prérequis

- ✅ Node.js LTS (v18+)
- ✅ npm ou yarn
- ✅ Git
- ✅ Compte Supabase (déjà créé)
- ✅ Compte Vercel (déjà créé)
- ✅ Un fichier CSV Crédit Agricole de test

### 3.2 Initialisation du projet

```bash
# Créer le projet Vite avec TypeScript
npm create vite@latest finzeo -- --template react-ts
cd finzeo

# Installer les dépendances core
npm install react-router-dom@6 zustand@4
npm install @tanstack/react-query@5
npm install @supabase/supabase-js@2

# Installer Tailwind CSS
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p

# Installer shadcn/ui
npx shadcn-ui@latest init
# Répondre aux questions :
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes

# Installer les composants shadcn de base
npx shadcn-ui@latest add button input card table select dialog dropdown-menu badge toast label form

# Installer les utilitaires
npm install papaparse@5
npm install date-fns@3
npm install lucide-react
npm install react-hook-form zod @hookform/resolvers

# Installer les types TypeScript
npm install -D @types/papaparse
```

### 3.3 Configuration Tailwind

Modifier `tailwind.config.js` :

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs des catégories
        housing: '#1e40af',
        energy: '#eab308',
        telecom: '#7c3aed',
        groceries: '#16a34a',
        restaurant: '#ea580c',
        transport: '#0ea5e9',
        shopping: '#ec4899',
        sport: '#dc2626',
        health: '#06b6d4',
        wellness: '#d946ef',
        education: '#6366f1',
        gifts: '#f43f5e',
        bank: '#6b7280',
        income: '#059669',
        transfer: '#9ca3af',
      }
    },
  },
  plugins: [],
}
```

### 3.4 Configuration Vite

Créer `vite.config.ts` :

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 3.5 Variables d'environnement

Créer `.env.local` (ne pas commiter) :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon
```

Ajouter `.env.local` au `.gitignore` :

```
.env.local
.env*.local
```

### 3.6 Client Supabase

Créer `src/lib/supabase.ts` :

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 3.7 Configuration TypeScript

Modifier `tsconfig.json` pour ajouter les alias de chemins :

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 4. Configuration Supabase

### 4.1 Créer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Cliquer sur **"New Project"**
3. Remplir :
   - **Name** : `finzeo` (ou `finzeo-dev`)
   - **Database Password** : Générer un mot de passe fort
   - **Region** : Choisir la région la plus proche (ex: `West EU (Paris)`)
4. Attendre la création du projet (2-3 minutes)

### 4.2 Récupérer les clés API

1. Aller dans **Settings** → **API**
2. Noter :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
3. Copier ces valeurs dans `.env.local`

### 4.3 Configurer l'authentification

#### Email + Password

1. Aller dans **Authentication** → **Providers**
2. Vérifier que **Email** est activé
3. Pour le MVP, désactiver **"Confirm email"** (Settings → Auth → Email Auth) :
   - Décocher **"Enable email confirmations"**

#### Google OAuth

1. Aller dans **Authentication** → **Providers**
2. Activer **Google**
3. Créer un projet Google Cloud :
   - Aller sur [console.cloud.google.com](https://console.cloud.google.com)
   - Créer un nouveau projet ou sélectionner un existant
   - Aller dans **APIs & Services** → **Credentials**
   - Cliquer **Create Credentials** → **OAuth client ID**
   - Type : **Web application**
   - Authorized redirect URIs : 
     ```
     https://votre-projet.supabase.co/auth/v1/callback
     ```
   - Copier **Client ID** et **Client Secret**
4. Retourner dans Supabase et coller :
   - **Client ID (for OAuth)**
   - **Client Secret (for OAuth)**
5. Sauvegarder

### 4.4 Créer le schéma de base de données

Aller dans **SQL Editor** et exécuter ce script complet :

```sql
-- ============================================
-- SCHÉMA BASE DE DONNÉES FINZEO MVP
-- ============================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: profiles
-- Extension du profil utilisateur Supabase Auth
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS pour profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger pour créer automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', new.email));
  
  -- Créer les catégories par défaut
  PERFORM public.create_default_categories(new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TABLE: categories
-- Catégories de dépenses/revenus
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('expense', 'income', 'transfer')),
  color text NOT NULL,
  icon text NOT NULL,
  parent_category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);

-- RLS pour categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_all_own"
  ON public.categories FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- TABLE: import_batches
-- Suivi des imports CSV
-- ============================================
CREATE TABLE IF NOT EXISTS public.import_batches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_size int,
  download_date date,
  account_name text,
  account_balance numeric(10,2),
  period_start date,
  period_end date,
  total_transactions int NOT NULL,
  imported_transactions int NOT NULL,
  duplicates_skipped int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_import_batches_user_id ON public.import_batches(user_id);

-- RLS pour import_batches
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "import_batches_select_own"
  ON public.import_batches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "import_batches_insert_own"
  ON public.import_batches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: account_snapshots
-- Historique des soldes de compte
-- ============================================
CREATE TABLE IF NOT EXISTS public.account_snapshots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL,
  balance numeric(10,2) NOT NULL,
  account_name text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, snapshot_date, account_name)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_user_date 
  ON public.account_snapshots(user_id, snapshot_date DESC);

-- RLS pour account_snapshots
ALTER TABLE public.account_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "snapshots_all_own"
  ON public.account_snapshots FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- TABLE: transactions
-- Transactions bancaires
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_date date NOT NULL,
  amount numeric(10,2) NOT NULL,
  original_label text NOT NULL,
  operation_type text,
  description text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  account_name text,
  is_recurring boolean DEFAULT false,
  import_batch_id uuid REFERENCES public.import_batches(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);

-- RLS pour transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_all_own"
  ON public.transactions FOR ALL
  USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- TABLE: categorization_rules
-- Règles apprises pour auto-catégorisation
-- ============================================
CREATE TABLE IF NOT EXISTS public.categorization_rules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern text NOT NULL,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  confidence numeric(3,2) DEFAULT 1.00 CHECK (confidence >= 0 AND confidence <= 1),
  usage_count int DEFAULT 1,
  last_used_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rules_user_id ON public.categorization_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_rules_pattern ON public.categorization_rules(pattern);

-- RLS pour categorization_rules
ALTER TABLE public.categorization_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rules_all_own"
  ON public.categorization_rules FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- FONCTION: create_default_categories
-- Crée les catégories par défaut pour un utilisateur
-- ============================================
CREATE OR REPLACE FUNCTION public.create_default_categories(p_user_id uuid)
RETURNS void AS $$
BEGIN
  -- Vérifier si l'utilisateur a déjà des catégories
  IF EXISTS (SELECT 1 FROM public.categories WHERE user_id = p_user_id) THEN
    RETURN;
  END IF;

  -- Catégories de dépenses
  INSERT INTO public.categories (user_id, name, type, color, icon, is_default) VALUES
    (p_user_id, 'Logement', 'expense', '#1e40af', 'Home', true),
    (p_user_id, 'Énergie & Eau', 'expense', '#eab308', 'Zap', true),
    (p_user_id, 'Télécom', 'expense', '#7c3aed', 'Smartphone', true),
    (p_user_id, 'Courses', 'expense', '#16a34a', 'ShoppingCart', true),
    (p_user_id, 'Restauration', 'expense', '#ea580c', 'UtensilsCrossed', true),
    (p_user_id, 'Transport', 'expense', '#0ea5e9', 'Car', true),
    (p_user_id, 'Shopping', 'expense', '#ec4899', 'ShoppingBag', true),
    (p_user_id, 'Sport & Loisirs', 'expense', '#dc2626', 'Dumbbell', true),
    (p_user_id, 'Santé', 'expense', '#06b6d4', 'Heart', true),
    (p_user_id, 'Bien-être', 'expense', '#d946ef', 'Sparkles', true),
    (p_user_id, 'Éducation', 'expense', '#6366f1', 'GraduationCap', true),
    (p_user_id, 'Cadeaux', 'expense', '#f43f5e', 'Gift', true),
    (p_user_id, 'Banque', 'expense', '#6b7280', 'Building2', true),
    (p_user_id, 'Revenus', 'income', '#059669', 'TrendingUp', true),
    (p_user_id, 'Transferts', 'transfer', '#9ca3af', 'ArrowLeftRight', true),
    (p_user_id, 'Non catégorisé', 'expense', '#9ca3af', 'HelpCircle', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.5 Configurer les URLs de redirection

1. Aller dans **Authentication** → **URL Configuration**
2. Configurer :
   - **Site URL** : `http://localhost:5173` (pour le dev local)
   - **Redirect URLs** : Ajouter :
     ```
     http://localhost:5173/**
     https://votre-domaine.vercel.app/**
     ```

---

## 5. Configuration Vercel

### 5.1 Créer le projet sur Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur **"Add New..."** → **"Project"**
3. Si le projet est sur GitHub :
   - Sélectionner le repository
   - Cliquer **"Import"**
4. Si le projet n'est pas sur GitHub :
   - Cliquer **"Deploy without Git"**
   - Installer Vercel CLI : `npm i -g vercel`
   - Dans le projet : `vercel`
   - Suivre les instructions

### 5.2 Configuration du build

Dans Vercel → Project → Settings → General :

- **Framework Preset** : Vite
- **Build Command** : `npm run build`
- **Output Directory** : `dist`
- **Install Command** : `npm install`

### 5.3 Variables d'environnement

Dans Vercel → Project → Settings → Environment Variables :

Ajouter :
- `VITE_SUPABASE_URL` = `https://votre-projet.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `votre-clé-anon`

⚠️ **Important** : Sélectionner **"Production"**, **"Preview"** et **"Development"** pour chaque variable.

### 5.4 Redéployer

1. Aller dans **Deployments**
2. Cliquer sur **"Redeploy"** sur le dernier déploiement
3. Vérifier que le build passe

### 5.5 Mettre à jour Supabase avec l'URL Vercel

1. Retourner dans Supabase → **Authentication** → **URL Configuration**
2. Ajouter l'URL Vercel dans **Redirect URLs** :
   ```
   https://votre-projet.vercel.app/**
   ```

---

## 6. Architecture du code

### 6.1 Structure des dossiers

```
finzeo/
├── public/
├── src/
│   ├── app/                    # Routing et layout principal
│   │   ├── App.tsx
│   │   ├── routes.tsx
│   │   └── layout/
│   │       ├── MainLayout.tsx
│   │       └── AuthLayout.tsx
│   │
│   ├── features/               # Features par domaine métier
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   └── stores/
│   │   │       └── authStore.ts
│   │   │
│   │   ├── import/
│   │   │   ├── components/
│   │   │   │   ├── CSVUpload.tsx
│   │   │   │   └── ImportSummary.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useCSVImport.ts
│   │   │   ├── pages/
│   │   │   │   └── ImportPage.tsx
│   │   │   └── services/
│   │   │       └── csvParser.ts
│   │   │
│   │   ├── transactions/
│   │   │   ├── components/
│   │   │   │   ├── TransactionList.tsx
│   │   │   │   ├── TransactionRow.tsx
│   │   │   │   ├── TransactionFilters.tsx
│   │   │   │   └── TransactionEditModal.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useTransactions.ts
│   │   │   ├── pages/
│   │   │   │   └── TransactionsPage.tsx
│   │   │   └── stores/
│   │   │       └── transactionStore.ts
│   │   │
│   │   ├── categorization/
│   │   │   ├── components/
│   │   │   │   ├── CategorizationFlow.tsx
│   │   │   │   └── CategorySelector.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useCategorization.ts
│   │   │   │   └── useCategorySuggestions.ts
│   │   │   ├── pages/
│   │   │   │   └── CategorizationPage.tsx
│   │   │   └── services/
│   │   │       └── categorizationEngine.ts
│   │   │
│   │   └── dashboard/
│   │       ├── components/
│   │       │   ├── DashboardOverview.tsx
│   │       │   ├── MonthlySummary.tsx
│   │       │   └── TopCategories.tsx
│   │       ├── hooks/
│   │       │   └── useDashboard.ts
│   │       └── pages/
│   │           └── DashboardPage.tsx
│   │
│   ├── components/             # Composants réutilisables
│   │   ├── ui/                 # Composants shadcn/ui
│   │   └── shared/             # Composants métier partagés
│   │       ├── CategoryBadge.tsx
│   │       └── AmountDisplay.tsx
│   │
│   ├── lib/                    # Utilitaires et config
│   │   ├── supabase.ts
│   │   ├── csv/
│   │   │   ├── parser.ts
│   │   │   └── normalizer.ts
│   │   └── utils/
│   │       ├── date.ts
│   │       └── currency.ts
│   │
│   ├── types/                  # Types TypeScript
│   │   ├── database.types.ts   # Généré par Supabase CLI (optionnel)
│   │   ├── transaction.ts
│   │   ├── category.ts
│   │   └── csv.ts
│   │
│   ├── stores/                 # Stores Zustand globaux
│   │   └── authStore.ts
│   │
│   └── main.tsx
│
├── .env.local                  # Variables d'environnement (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

### 6.2 Types TypeScript essentiels

Créer `src/types/transaction.ts` :

```typescript
export interface Transaction {
  id: string
  user_id: string
  transaction_date: string // YYYY-MM-DD
  amount: number
  original_label: string
  operation_type?: string
  description?: string
  category_id?: string
  category?: Category
  account_name?: string
  is_recurring: boolean
  import_batch_id?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: 'expense' | 'income' | 'transfer'
  color: string
  icon: string
  parent_category_id?: string
  is_default: boolean
  created_at: string
}

export interface ImportBatch {
  id: string
  user_id: string
  filename: string
  file_size?: number
  download_date?: string
  account_name?: string
  account_balance?: number
  period_start?: string
  period_end?: string
  total_transactions: number
  imported_transactions: number
  duplicates_skipped: number
  created_at: string
}

export interface CategorizationRule {
  id: string
  user_id: string
  pattern: string
  category_id: string
  confidence: number
  usage_count: number
  last_used_at: string
  created_at: string
}
```

Créer `src/types/csv.ts` :

```typescript
export interface ParsedCSVRow {
  date: string // YYYY-MM-DD
  label: string
  debit?: number
  credit?: number
}

export interface CSVMetadata {
  downloadDate: string // YYYY-MM-DD
  accountName: string
  accountNumber: string
  balance: number
  periodStart: string // YYYY-MM-DD
  periodEnd: string // YYYY-MM-DD
  accountHolder?: string
}

export interface ParsedCSVResult {
  metadata: CSVMetadata
  transactions: ParsedCSVRow[]
}
```

---

## 7. Parsing CSV Crédit Agricole

### 7.1 Format attendu

**En-tête :**
```
Téléchargement du 07/02/2026;

MONSIEUR DURAND MAXIME
Compte de Dépôt carte n° 76397041000;
Solde au 07/02/2026 607,85 €

Liste des opérations du compte entre le 01/10/2025 et le 06/02/2026;
```

**Colonnes :**
```
Date;Libellé;Débit euros;Crédit euros;
```

**Exemple de transaction :**
```
06/02/2026;"PAIEMENT PAR CARTE      
X1048 DELIVEROO 75009 PARI 06/02  


";21,72;;
```

### 7.2 Implémentation du parser

Créer `src/lib/csv/parser.ts` :

```typescript
import Papa from 'papaparse'
import { ParsedCSVRow, CSVMetadata, ParsedCSVResult } from '@/types/csv'

/**
 * Parse un fichier CSV Crédit Agricole
 */
export async function parseCreditAgricoleCSV(
  file: File
): Promise<ParsedCSVResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      delimiter: ';',
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        try {
          const lines = results.data as string[][]
          
          // Extraire les métadonnées depuis l'en-tête (lignes 0-6)
          const metadata = extractMetadata(lines.slice(0, 7))
          
          // Trouver la ligne d'en-tête des colonnes
          const headerIndex = findHeaderIndex(lines)
          if (headerIndex === -1) {
            throw new Error('En-tête des colonnes introuvable')
          }
          
          // Parser les transactions (après l'en-tête)
          const transactions = parseTransactions(lines.slice(headerIndex + 1))
          
          resolve({ metadata, transactions })
        } catch (error) {
          reject(error)
        }
      },
      error: (error) => reject(error)
    })
  })
}

/**
 * Extrait les métadonnées depuis l'en-tête du CSV
 */
function extractMetadata(headerLines: string[][]): CSVMetadata {
  const text = headerLines.map(line => line.join(' ')).join('\n')
  
  // Date de téléchargement
  const downloadDateMatch = text.match(/Téléchargement du (\d{2}\/\d{2}\/\d{4})/)
  const downloadDate = downloadDateMatch 
    ? parseFrenchDate(downloadDateMatch[1])
    : new Date().toISOString().split('T')[0]
  
  // Nom du titulaire
  const accountHolderMatch = text.match(/(MONSIEUR|MADAME|MADEMOISELLE)\s+([A-Z\s]+)/)
  const accountHolder = accountHolderMatch ? accountHolderMatch[2].trim() : ''
  
  // Numéro de compte
  const accountNumberMatch = text.match(/n°\s*(\d+)/)
  const accountNumber = accountNumberMatch ? accountNumberMatch[1] : ''
  
  // Nom du compte
  const accountNameMatch = text.match(/Compte de ([^n]+)n°/)
  const accountName = accountNameMatch 
    ? accountNameMatch[1].trim()
    : 'Compte de Dépôt'
  
  // Solde
  const balanceMatch = text.match(/Solde au \d{2}\/\d{2}\/\d{4}\s+([\d\s,]+)\s*€/)
  const balance = balanceMatch 
    ? parseFrenchNumber(balanceMatch[1])
    : 0
  
  // Période
  const periodMatch = text.match(/entre le (\d{2}\/\d{2}\/\d{4}) et le (\d{2}\/\d{2}\/\d{4})/)
  const periodStart = periodMatch 
    ? parseFrenchDate(periodMatch[1])
    : ''
  const periodEnd = periodMatch 
    ? parseFrenchDate(periodMatch[2])
    : ''
  
  return {
    downloadDate,
    accountName,
    accountNumber,
    balance,
    periodStart,
    periodEnd,
    accountHolder
  }
}

/**
 * Trouve l'index de la ligne d'en-tête des colonnes
 */
function findHeaderIndex(lines: string[][]): number {
  return lines.findIndex(line => 
    line[0]?.toLowerCase().includes('date') &&
    line[1]?.toLowerCase().includes('libellé')
  )
}

/**
 * Parse les lignes de transactions
 */
function parseTransactions(lines: string[][]): ParsedCSVRow[] {
  return lines
    .filter(line => line.length >= 4 && line[0]?.match(/\d{2}\/\d{2}\/\d{4}/))
    .map(line => {
      const date = parseFrenchDate(line[0])
      const label = cleanLabel(line[1])
      const debit = line[2] ? parseFrenchNumber(line[2]) : undefined
      const credit = line[3] ? parseFrenchNumber(line[3]) : undefined
      
      return {
        date,
        label,
        debit,
        credit
      }
    })
    .filter(tx => tx.date && (tx.debit !== undefined || tx.credit !== undefined))
}

/**
 * Nettoie un libellé multi-lignes
 */
function cleanLabel(label: string): string {
  if (!label) return ''
  
  // Retirer les guillemets
  let cleaned = label.replace(/^"|"$/g, '')
  
  // Remplacer les multiples espaces/newlines par un seul espace
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  
  return cleaned
}

/**
 * Parse une date française (DD/MM/YYYY) en ISO (YYYY-MM-DD)
 */
function parseFrenchDate(dateStr: string): string {
  const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (!match) return ''
  
  const [, day, month, year] = match
  return `${year}-${month}-${day}`
}

/**
 * Parse un nombre français (virgule comme séparateur décimal)
 */
function parseFrenchNumber(numStr: string): number {
  if (!numStr) return 0
  
  // Retirer les espaces et remplacer la virgule par un point
  const cleaned = numStr.replace(/\s/g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}
```

### 7.3 Détection des doublons

Créer `src/lib/csv/normalizer.ts` :

```typescript
import { ParsedCSVRow } from '@/types/csv'
import { Transaction } from '@/types/transaction'

/**
 * Détecte les transactions en doublon
 */
export function detectDuplicates(
  newTransactions: ParsedCSVRow[],
  existingTransactions: Transaction[]
): {
  unique: ParsedCSVRow[]
  duplicates: ParsedCSVRow[]
} {
  const unique: ParsedCSVRow[] = []
  const duplicates: ParsedCSVRow[] = []
  
  for (const newTx of newTransactions) {
    const amount = newTx.debit ? -newTx.debit : (newTx.credit || 0)
    const labelPrefix = newTx.label.slice(0, 20).toLowerCase()
    
    const isDuplicate = existingTransactions.some(existing => {
      const sameDate = existing.transaction_date === newTx.date
      const sameAmount = Math.abs(existing.amount - amount) < 0.01
      const sameLabel = existing.original_label
        .slice(0, 20)
        .toLowerCase() === labelPrefix
      
      return sameDate && sameAmount && sameLabel
    })
    
    if (isDuplicate) {
      duplicates.push(newTx)
    } else {
      unique.push(newTx)
    }
  }
  
  return { unique, duplicates }
}
```

### 7.4 Extraction du type d'opération

Ajouter dans `src/lib/csv/parser.ts` :

```typescript
/**
 * Extrait le type d'opération depuis le libellé
 */
export function extractOperationType(label: string): string | undefined {
  const upperLabel = label.toUpperCase()
  
  if (upperLabel.includes('PAIEMENT PAR CARTE')) return 'PAIEMENT PAR CARTE'
  if (upperLabel.includes('VIREMENT EMIS')) return 'VIREMENT EMIS'
  if (upperLabel.includes('VIREMENT EN VOTRE FAVEUR')) return 'VIREMENT EN VOTRE FAVEUR'
  if (upperLabel.includes('PRELEVEMENT')) return 'PRELEVEMENT'
  if (upperLabel.includes('COTISATION')) return 'COTISATION'
  if (upperLabel.includes('REMISE CHEQUE')) return 'REMISE CHEQUE'
  
  return undefined
}
```

---

## 8. Parcours utilisateur MVP

### 8.1 Routes principales

Créer `src/app/routes.tsx` :

```typescript
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from './layout/MainLayout'
import { AuthLayout } from './layout/AuthLayout'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { ImportPage } from '@/features/import/pages/ImportPage'
import { CategorizationPage } from '@/features/categorization/pages/CategorizationPage'
import { TransactionsPage } from '@/features/transactions/pages/TransactionsPage'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: '', element: <Navigate to="/login" replace /> },
    ]
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'import', element: <ImportPage /> },
      { path: 'categorize', element: <CategorizationPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
    ]
  }
])
```

### 8.2 Flux utilisateur

1. **Arrivée sur l'app** → Redirection vers `/login` si non authentifié
2. **Login/Register** → Après auth réussie → `/app` (dashboard)
3. **Dashboard** → Bouton "Importer un CSV" → `/app/import`
4. **Import** → Upload CSV → Parsing → Résumé → Import en BDD → Redirection `/app/categorize`
5. **Catégorisation** → Transactions non catégorisées une par une → Suggestions automatiques
6. **Transactions** → Liste complète → Filtres → Édition
7. **Dashboard** → Vue d'ensemble mensuelle

### 8.3 Composants clés à créer

**Auth :**
- `LoginForm.tsx` (email/password + bouton Google)
- `RegisterForm.tsx`
- `useAuth.ts` hook
- `ProtectedRoute.tsx` (wrapper pour routes protégées)

**Import :**
- `CSVUpload.tsx` (drag & drop)
- `ImportSummary.tsx` (résumé avant import)
- `useCSVImport.ts` hook

**Catégorisation :**
- `CategorizationFlow.tsx` (one-by-one)
- `CategorySelector.tsx` (sélecteur avec icônes)
- `useCategorySuggestions.ts` hook

**Dashboard :**
- `DashboardOverview.tsx` (revenus/dépenses/solde)
- `TopCategories.tsx` (top 5 catégories)

**Transactions :**
- `TransactionList.tsx` (tableau)
- `TransactionFilters.tsx`
- `TransactionEditModal.tsx`

### 8.4 Store d'authentification

Créer `src/features/auth/stores/authStore.ts` :

```typescript
import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    set({ user: data.user, session: data.session })
  },

  signUp: async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    if (error) throw error
    set({ user: data.user, session: data.session })
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app`,
      },
    })
    if (error) throw error
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, user: session?.user ?? null, loading: false })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
    })
  },
}))
```

---

## 9. Checklist de développement

### Phase 1 : Setup (Semaine 1)

- [ ] Projet Vite créé avec TypeScript
- [ ] Dépendances installées (React Router, Zustand, React Query, Supabase)
- [ ] Tailwind CSS configuré
- [ ] shadcn/ui initialisé et composants de base installés
- [ ] Client Supabase configuré (`src/lib/supabase.ts`)
- [ ] Variables d'environnement configurées (`.env.local`)
- [ ] Projet Supabase créé
- [ ] Schéma BDD créé (toutes les tables + RLS)
- [ ] Catégories par défaut seedées automatiquement
- [ ] Auth email/password configurée
- [ ] Auth Google OAuth configurée
- [ ] Projet Vercel créé et configuré
- [ ] Variables d'environnement Vercel ajoutées
- [ ] Première déploiement réussi

### Phase 2 : Authentification (Semaine 1-2)

- [ ] Pages Login et Register créées
- [ ] Formulaires avec validation (React Hook Form + Zod)
- [ ] Intégration Supabase Auth (email/password)
- [ ] Intégration Google OAuth
- [ ] Store Zustand pour l'auth (`authStore.ts`)
- [ ] Hook `useAuth` créé
- [ ] Protected routes configurées
- [ ] Redirection après login/register
- [ ] Gestion des erreurs d'auth
- [ ] Layout principal avec navigation

### Phase 3 : Import CSV (Semaine 2-3)

- [ ] Parser CSV Crédit Agricole implémenté (`src/lib/csv/parser.ts`)
- [ ] Extraction des métadonnées (date, solde, période)
- [ ] Nettoyage des libellés multi-lignes
- [ ] Conversion des montants (virgule → point)
- [ ] Normalisation des dates (DD/MM/YYYY → YYYY-MM-DD)
- [ ] Composant `CSVUpload` (drag & drop)
- [ ] Validation du fichier (extension, taille)
- [ ] Détection des doublons (`normalizer.ts`)
- [ ] Composant `ImportSummary` (résumé avant import)
- [ ] Hook `useCSVImport` pour l'import en BDD
- [ ] Création d'`import_batch` en BDD
- [ ] Insertion des transactions en batch
- [ ] Création de `account_snapshot`
- [ ] Gestion des erreurs d'import
- [ ] Page `/app/import` complète

### Phase 4 : Catégorisation (Semaine 3-4)

- [ ] Table `categories` avec catégories par défaut
- [ ] Composant `CategorySelector` avec icônes
- [ ] Page de catégorisation one-by-one
- [ ] Affichage d'une transaction à la fois
- [ ] Champ description personnalisée
- [ ] Sélection de catégorie
- [ ] Navigation (précédente/suivante/passer)
- [ ] Sauvegarde de la catégorisation
- [ ] Table `categorization_rules` créée
- [ ] Moteur de suggestions basique (`categorizationEngine.ts`)
- [ ] Patterns par défaut (Deliveroo → Restauration, etc.)
- [ ] Apprentissage automatique (mémorisation des règles)
- [ ] Hook `useCategorySuggestions`
- [ ] Page `/app/categorize` complète

### Phase 5 : Transactions (Semaine 4)

- [ ] Page liste des transactions (`/app/transactions`)
- [ ] Tableau avec colonnes (date, description, catégorie, montant)
- [ ] Pagination (20 par page)
- [ ] Filtres basiques (période, catégorie, recherche)
- [ ] Composant `TransactionFilters`
- [ ] Modal d'édition de transaction
- [ ] Modification description + catégorie
- [ ] Hook `useTransactions` pour les requêtes
- [ ] Mise à jour en temps réel après modification

### Phase 6 : Dashboard (Semaine 5)

- [ ] Page dashboard (`/app`)
- [ ] Composant `DashboardOverview` (revenus/dépenses/solde)
- [ ] Calcul des totaux mensuels
- [ ] Affichage du solde réel (dernier snapshot)
- [ ] Date de dernière mise à jour
- [ ] Composant `TopCategories` (top 5 catégories)
- [ ] Hook `useDashboard` pour les données
- [ ] Formatage des montants (€)
- [ ] Gestion du mois en cours

### Phase 7 : Finitions (Semaine 5-6)

- [ ] Navigation entre les pages
- [ ] Gestion des états de chargement
- [ ] Gestion des erreurs (toasts)
- [ ] Messages de succès
- [ ] Responsive design (mobile)
- [ ] Tests manuels complets
- [ ] Correction des bugs
- [ ] Optimisation des performances
- [ ] Documentation README

---

## 10. Ressources et références

### Documentation officielle

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Query](https://tanstack.com/query/latest/docs/framework/react/overview)
- [React Router](https://reactrouter.com/)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [PapaParse](https://www.papaparse.com/docs)
- [date-fns](https://date-fns.org/)

### Tutoriels Supabase

- [Supabase + React Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)

### Commandes utiles

```bash
# Démarrer le serveur de développement
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview

# Linter
npm run lint

# Générer les types Supabase (optionnel)
npx supabase gen types typescript --project-id votre-project-id > src/types/database.types.ts
```

### Patterns de suggestions par défaut

Pour le MVP, voici les patterns de base à implémenter dans `categorizationEngine.ts` :

```typescript
const DEFAULT_PATTERNS: Record<string, string> = {
  'deliveroo': 'Restauration',
  'uber eats': 'Restauration',
  'carrefour': 'Courses',
  'intermarche': 'Courses',
  'boulanger': 'Shopping', // ⚠️ Important : pas Courses !
  'tcl 69': 'Transport',
  'spl ru lyon': 'Transport',
  'aprr': 'Transport',
  'area': 'Transport',
  'coiffure': 'Bien-être',
  'ekwateur': 'Énergie & Eau',
  'eau du grand lyon': 'Énergie & Eau',
  'sfr': 'Télécom',
  'loyer': 'Logement',
  'akairo': 'Revenus',
}
```

---

## 📝 Notes importantes

1. **Un seul CSV à la fois** : Pour le MVP, on importe un seul CSV. Les imports suivants détecteront les doublons automatiquement.

2. **UI en français** : Tous les textes, labels, messages d'erreur doivent être en français.

3. **Auth double** : Email/password ET Google OAuth doivent être fonctionnels dès le MVP.

4. **Catégories par défaut** : Créées automatiquement à l'inscription via le trigger SQL.

5. **Modification permanente** : Toutes les transactions peuvent être modifiées à tout moment (description + catégorie).

6. **Suggestions basiques** : Le système de suggestions utilise des patterns simples (contains) pour le MVP. L'IA avancée viendra plus tard.

7. **Boulanger = Shopping** : Important de bien catégoriser Boulanger (magasin d'électroménager) comme Shopping et non Courses.

---

**Bon développement ! 🚀**

*Dernière mise à jour : 17 février 2026*

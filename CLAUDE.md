# CLAUDE.md - AI Assistant Guide for Mallow App

> **Last Updated**: 2025-11-13
> **Project**: Mallow - Pricing Calculator for Brazilian Microentrepreneurs
> **Tech Stack**: React Native + Expo + SQLite + Firebase + Uniwind (Tailwind 4)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Directory Structure](#directory-structure)
4. [Core Concepts](#core-concepts)
5. [Database Schema & Business Logic](#database-schema--business-logic)
6. [Development Workflows](#development-workflows)
7. [Uniwind Styling System](#uniwind-styling-system)
8. [Key Conventions](#key-conventions)
9. [Common Tasks](#common-tasks)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Mallow** is an offline-first mobile app helping Brazilian food & craft producers calculate product costs and pricing with proper profit margins. It manages ingredients (insumos), products (produtos), recipes, and fixed costs (custos globais) to provide accurate pricing recommendations.

### Business Domain (Portuguese Terms)

- **Insumos**: Raw ingredients/materials with purchase price tracking
- **Produtos**: Finished products with recipes, yield, and profit margins
- **Custos Globais**: Monthly fixed costs (rent, labor, utilities)
- **Rendimento**: Product yield (how many units produced per batch)
- **Margem de Lucro**: Profit margin percentage

### Key Features

- Multi-step product creation with recipe builder
- Ingredient cost tracking with quantity/unit management
- Automatic pricing calculation based on costs + margin
- Fixed cost allocation across products
- Brazilian Real (BRL) currency formatting
- Offline-first architecture with SQLite persistence

---

## Architecture & Tech Stack

### Frontend

- **React Native**: 0.81.5
- **React**: 19.1.0 (New Architecture enabled)
- **Expo**: 54.0.23 (managed workflow)
- **Expo Router**: 6.0.14 (file-based routing)
- **TypeScript**: 5.9.2 (strict mode)

### Styling

- **Uniwind**: 1.0.1 (Fast Tailwind bindings for React Native)
- **Tailwind CSS**: 4.0.0 (Latest version)
- **Icons**: Lucide React Native
- **Theme System**: CSS Variables with light/dark themes

### State Management

- **React Context API** (no Redux/Zustand)
- **UserProvider**: Manages default user and database initialization
- **ProductFormProvider**: Multi-step form state for product creation
- **AuthContext**: Firebase authentication (optional, not yet integrated)

### Data Layer

- **Expo SQLite**: 16.0.9 (local database)
- **Firebase**: 12.5.0 (authentication, future sync)
- **AsyncStorage**: Session persistence

### Navigation

- **Expo Router**: File-based routing with groups
- **React Navigation**: Bottom tabs + stack navigators

---

## Directory Structure

```
mallow-app/
├── app/                          # Expo Router - File-based routing
│   ├── (tabs)/                  # Tab navigation (5 tabs)
│   │   ├── _layout.tsx          # Tab bar configuration
│   │   ├── index.tsx            # Home/Dashboard screen
│   │   ├── produtos.tsx         # Products list
│   │   ├── insumos.tsx          # Ingredients list
│   │   ├── custos.tsx           # Fixed costs list
│   │   └── perfil.tsx           # Profile screen
│   ├── (auth)/                  # Authentication screens (unused)
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── produtos/                # Product management
│   │   ├── novo.tsx             # Step 1: Basic info
│   │   ├── novo-step2.tsx       # Step 2: Add ingredients
│   │   ├── novo-step3.tsx       # Step 3: Review & save
│   │   └── editar/[id].tsx      # Edit product
│   ├── insumos/                 # Ingredient management
│   │   ├── novo.tsx
│   │   └── editar/[id].tsx
│   ├── custos/                  # Cost management
│   │   ├── novo.tsx
│   │   └── editar/[id].tsx
│   └── _layout.tsx              # Root layout with providers
│
├── services/                     # Business logic layer
│   ├── database.ts              # 🔥 1800+ lines - Core business logic
│   └── firebase.ts              # Firebase initialization
│
├── context/                      # React Context providers
│   ├── ProductFormContext.tsx   # Multi-step form state
│   └── AuthContext.tsx          # Firebase auth state
│
├── components/                   # Reusable UI components
│   ├── ui/                      # Base components
│   ├── FabMenu.tsx              # Floating action button menu
│   ├── themed-text.tsx
│   └── themed-view.tsx
│
├── hooks/                        # Custom React hooks
│   ├── useUser.tsx              # User context & DB init
│   ├── use-color-scheme.ts      # Theme detection
│   └── use-theme-color.ts
│
├── utils/                        # Utility functions
│   └── format.ts                # Currency formatting (BRL)
│
├── constants/                    # App constants
│   └── theme.ts                 # Color palette
│
├── docs/                         # 🇧🇷 Portuguese documentation
│   ├── Arquitetura-e-Estrategia-Tecnica.md
│   ├── Logica-de-Negocio-e-Formulas.md
│   ├── Constituicao-do-Produto.md
│   └── ... (comprehensive specs)
│
└── Config Files
    ├── app.config.js            # Expo + Firebase config
    ├── tsconfig.json
    ├── babel.config.js          # Expo preset
    ├── metro.config.js          # Uniwind configuration
    ├── global.css               # Uniwind + Tailwind + Themes
    └── uniwind-types.d.ts       # Auto-generated TypeScript types
```

---

## Core Concepts

### 1. Database Architecture (`/services/database.ts`)

**Single source of truth** for all data operations. This 1800+ line file contains:

- **Type Definitions**: User, Insumo, Produto, ProdutoCompleto, etc.
- **SQLite Setup**: WAL mode for better performance
- **CRUD Operations**: All database operations
- **Pricing Engine**: Complex cost calculation logic

### 2. Multi-Step Form Pattern

Product creation uses a 3-step wizard with state preserved via Context:

```typescript
// Step 1: produtos/novo.tsx
→ Name, Yield, Margin, Production Time

// Step 2: produtos/novo-step2.tsx
→ Select ingredients, specify quantities

// Step 3: produtos/novo-step3.tsx
→ Review all data, save to database
```

**State Management**: `ProductFormContext` holds data across steps.

### 3. Pricing Calculation Logic

Located in `getProdutosCompletos()` function:

```typescript
// For each product:
1. Sum ingredient costs (quantity × unit price)
2. Allocate fixed costs based on production time
   - Default: 160 hours/month for labor calculation
   - Cost per minute = (total fixed costs) / (160 hours × 60 min)
   - Allocated cost = cost per minute × production time
3. Calculate unit cost = (ingredient cost + fixed cost) / yield
4. Calculate suggested price = unit cost × (1 + profit margin)
```

### 4. Navigation Pattern

**Expo Router** uses file-based routing:

```typescript
// Navigate to screen
router.push('/produtos/novo');

// Go back
router.back();

// Replace current
router.replace('/produtos');

// With params
router.push(`/insumos/editar/${id}`);

// Get params
const { id } = useLocalSearchParams<{ id: string }>();
```

### 5. Data Refresh Pattern

Screens reload data when focused:

```typescript
useFocusEffect(
  useCallback(() => {
    loadData();
  }, [])
);
```

---

## Database Schema & Business Logic

### Tables

#### **users**
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
name TEXT NOT NULL
email TEXT NOT NULL
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### **insumos** (Ingredients)
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
user_id INTEGER NOT NULL
nome TEXT NOT NULL                    -- Name
preco_compra REAL NOT NULL            -- Purchase price
quantidade_comprada REAL NOT NULL     -- Quantity purchased
unidade_medida TEXT NOT NULL          -- Unit (kg, L, un)
custo_por_unidade REAL NOT NULL       -- Calculated: price / quantity
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### **produtos** (Products)
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
user_id INTEGER NOT NULL
nome TEXT NOT NULL
rendimento INTEGER NOT NULL           -- Yield (units per batch)
margem_lucro REAL NOT NULL           -- Profit margin (0.30 = 30%)
tempo_producao INTEGER               -- Production time (minutes)
custo_total REAL                     -- Total cost (calculated)
preco_sugerido REAL                  -- Suggested price (calculated)
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### **produtos_insumos** (Recipe Junction Table)
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
produto_id INTEGER NOT NULL
insumo_id INTEGER NOT NULL
quantidade_usada REAL NOT NULL        -- Quantity used in recipe
FOREIGN KEY (produto_id) REFERENCES produtos(id)
FOREIGN KEY (insumo_id) REFERENCES insumos(id)
```

#### **custos_globais** (Fixed Costs)
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
user_id INTEGER NOT NULL
descricao TEXT NOT NULL              -- Description (rent, utilities, etc.)
valor_mensal REAL NOT NULL           -- Monthly cost value
created_at TIMESTAMP
updated_at TIMESTAMP
```

### Key Business Functions

| Function | Purpose | Location |
|----------|---------|----------|
| `setupDatabase()` | Initialize DB with WAL mode | database.ts:50 |
| `createInsumo()` | Create ingredient, calculate cost/unit | database.ts:150 |
| `createProduto()` | Create product with recipe | database.ts:400 |
| `getProdutosCompletos()` | 🔥 Calculate all costs & pricing | database.ts:800 |
| `getAllInsumos()` | Get ingredients for user | database.ts:250 |
| `getCustosGlobais()` | Get fixed costs | database.ts:600 |

---

## Development Workflows

### Starting Development

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Database Changes

**⚠️ No migration system yet**. To modify schema:

1. Edit table definitions in `setupDatabase()` in `database.ts`
2. Delete app data or increment schema version
3. Update TypeScript types to match new schema

### Adding a New Screen

1. Create file in appropriate directory under `app/`
2. Use existing screen as template
3. Wrap with `SafeAreaView`
4. Add to navigation if needed (update `_layout.tsx`)
5. Follow naming convention: `novo.tsx` for create, `editar/[id].tsx` for edit

### Adding a New Entity

1. Define type in `database.ts`
2. Add table in `setupDatabase()`
3. Create CRUD functions (create, getAll, getById, update, delete)
4. Create screens: list, create, edit
5. Add to FabMenu if needed
6. Update tab navigation if needed

### Styling Components

Use Uniwind (Tailwind 4) only:

```tsx
// ✅ Correct
<View className="flex-1 bg-white p-4">
  <Text className="text-lg font-bold text-gray-800">Title</Text>
</View>

// ✅ Using CSS variables from theme
<View className="bg-background p-4">
  <Text className="text-foreground font-bold">Title</Text>
</View>

// ❌ Wrong - Don't use StyleSheet
<View style={styles.container}>
  <Text style={styles.title}>Title</Text>
</View>
```

### Common Tailwind Classes Used

- Layout: `flex-1 flex-row items-center justify-between`
- Spacing: `p-4 px-6 py-3 mb-4 gap-2`
- Colors: `bg-primary text-white bg-gray-100`
- CSS Variables: `bg-background text-foreground bg-card border-border`
- Typography: `text-lg font-bold text-center`
- Borders: `rounded-lg border border-gray-300`
- Shadows: `shadow-sm shadow-md`
- Theme-aware: `bg-white dark:bg-gray-900 text-gray-900 dark:text-white`

---

## Uniwind Styling System

### What is Uniwind?

Uniwind is the fastest Tailwind CSS bindings for React Native. It provides:

- **Full Tailwind 4 support** with all utility classes
- **Built-in theme system** with light/dark modes
- **Platform selectors** (ios:, android:, web:, native:)
- **CSS variables** for theme-aware styling
- **Zero runtime overhead** - styles compiled at build time

### Configuration

**metro.config.js**:
```javascript
const { withUniwindConfig } = require('uniwind/metro');

module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  dtsFile: './uniwind-types.d.ts',
});
```

**global.css**:
```css
@import 'tailwindcss';
@import 'uniwind';

@layer theme {
  :root {
    @variant light {
      --color-primary: #8A2BE2;
      --color-background: #FFFFFF;
      --color-foreground: #000000;
      /* ... more variables */
    }

    @variant dark {
      --color-primary: #A855F7;
      --color-background: #000000;
      --color-foreground: #FFFFFF;
      /* ... more variables */
    }
  }
}
```

### Theme Variables

The app uses CSS variables for theme-aware colors:

| Variable | Light | Dark | Usage |
|----------|-------|------|-------|
| `--color-primary` | #8A2BE2 | #A855F7 | `bg-primary` |
| `--color-secondary` | #E9D5FF | #4C1D95 | `bg-secondary` |
| `--color-background` | #FFFFFF | #000000 | `bg-background` |
| `--color-foreground` | #000000 | #FFFFFF | `text-foreground` |
| `--color-card` | #F9FAFB | #1F2937 | `bg-card` |
| `--color-border` | #E5E7EB | #374151 | `border-border` |
| `--color-muted-foreground` | #6B7280 | #9CA3AF | `text-muted-foreground` |

### Platform Selectors

Apply platform-specific styles:

```tsx
<View className="ios:pt-12 android:pt-6 web:pt-4" />
<View className="native:bg-blue-500 web:bg-gray-500" />
```

- `ios:` - iOS only
- `android:` - Android only
- `web:` - Web only
- `native:` - Both iOS and Android (shorthand)

### Theme Switching

Uniwind automatically manages themes:

```typescript
import { Uniwind } from 'uniwind';

// Switch to dark theme
Uniwind.setTheme('dark');

// Switch to light theme
Uniwind.setTheme('light');

// Follow system theme
Uniwind.setTheme('system');
```

### Using className Props

All React Native components support the `className` prop:

```tsx
// View, Text, ScrollView, etc.
<View className="flex-1 bg-background p-4" />
<Text className="text-foreground text-lg" />
<ScrollView contentContainerClassName="p-4 gap-2" />

// For color props, use accent- prefix
<ActivityIndicator
  className="m-4"
  colorClassName="accent-primary"
/>

<TextInput
  className="border border-border rounded p-2"
  placeholderTextColorClassName="accent-muted-foreground"
/>
```

### Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

  **For non-style props** (like `color`): Use the `accent-` prefix (e.g., `colorClassName="accent-blue-500"`).
</Info>

### TypeScript Support

Uniwind auto-generates type definitions in `uniwind-types.d.ts`. This file is regenerated when Metro starts and provides full autocomplete for:

- `className` props on all React Native components
- Special className variants (contentContainerClassName, etc.)
- Color className props (colorClassName, tintColorClassName, etc.)

**Do not edit this file manually** - it's auto-generated.

### Important Notes

- **No tailwind.config.js**: Theme configuration is in CSS only
- **No StyleSheet**: Use className exclusively
- **Restart Metro**: After changing global.css or metro.config.js
- **className deduplication**: Uniwind doesn't auto-dedupe classes - use `tailwind-merge` if needed

---

## Key Conventions

### 1. Language & Naming

**Code**: English for technical terms, Portuguese for business domain

```typescript
// ✅ Good
function createInsumo(userId: number, nome: string) { }
const produtos = await getAllProdutos(userId);

// Types use Portuguese business terms
type Insumo = { nome: string; preco_compra: number; }
```

**Database**: snake_case (SQL convention)
```sql
produtos_insumos, custos_globais, preco_compra
```

**TypeScript**: camelCase for variables/functions, PascalCase for types/components
```typescript
const produtoCompleto: ProdutoCompleto = await getProdutosCompletos(userId);
```

### 2. Number Formatting

**Brazilian Locale**: Comma as decimal separator

```typescript
// Input parsing (handles both . and ,)
const price = parseFloat(text.replace(',', '.'));

// Currency display
formatCurrency(123.45) // → "R$ 123,45"
```

### 3. Error Handling

Use Alert dialogs for user-facing errors:

```typescript
try {
  await createProduto(...);
  Alert.alert('Sucesso', 'Produto criado!');
  router.back();
} catch (error) {
  console.error('Error:', error);
  Alert.alert('Erro', 'Não foi possível criar o produto');
}
```

### 4. Data Loading Pattern

```typescript
const [data, setData] = useState<Type[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  setLoading(true);
  try {
    const result = await getData();
    setData(result);
  } catch (error) {
    console.error(error);
    Alert.alert('Erro', 'Falha ao carregar dados');
  } finally {
    setLoading(false);
  }
};

// Refresh on screen focus
useFocusEffect(
  useCallback(() => {
    loadData();
  }, [])
);
```

### 5. Form Validation

```typescript
// Check required fields
if (!nome.trim()) {
  Alert.alert('Erro', 'Nome é obrigatório');
  return;
}

// Validate numbers
const valor = parseFloat(valorText.replace(',', '.'));
if (isNaN(valor) || valor <= 0) {
  Alert.alert('Erro', 'Valor inválido');
  return;
}
```

### 6. TypeScript Strictness

All code must be typed. Common patterns:

```typescript
// Function parameters and returns
async function createInsumo(
  userId: number,
  nome: string,
  precoCompra: number
): Promise<number> {
  // ...
}

// State with types
const [produtos, setProdutos] = useState<Produto[]>([]);

// Optional chaining for safety
const price = produto?.preco_sugerido ?? 0;
```

### 7. Component Structure

Standard screen component pattern:

```tsx
export default function ScreenName() {
  // 1. Hooks
  const { user } = useUser();
  const router = useRouter();

  // 2. State
  const [data, setData] = useState<Type[]>([]);
  const [loading, setLoading] = useState(true);

  // 3. Effects
  useEffect(() => {
    loadData();
  }, []);

  // 4. Functions
  const loadData = async () => { };
  const handleAction = () => { };

  // 5. Render
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      {/* Content */}
      {/* FAB */}
    </SafeAreaView>
  );
}
```

---

## Common Tasks

### Task: Add a New Field to Insumos

**Example**: Add "supplier" field to ingredients

1. **Update Type** (`database.ts`):
```typescript
export type Insumo = {
  id: number;
  user_id: number;
  nome: string;
  preco_compra: number;
  quantidade_comprada: number;
  unidade_medida: string;
  custo_por_unidade: number;
  fornecedor?: string; // NEW
  created_at: string;
  updated_at: string;
};
```

2. **Update Table Schema** (`database.ts` in `setupDatabase()`):
```sql
ALTER TABLE insumos ADD COLUMN fornecedor TEXT;
```

3. **Update Create Function**:
```typescript
export async function createInsumo(
  userId: number,
  nome: string,
  precoCompra: number,
  quantidadeComprada: number,
  unidadeMedida: string,
  fornecedor?: string // NEW
): Promise<number> {
  const db = await getDb();
  const custoUnidade = precoCompra / quantidadeComprada;

  const result = await db.runAsync(
    `INSERT INTO insumos (user_id, nome, preco_compra, quantidade_comprada,
     unidade_medida, custo_por_unidade, fornecedor)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, nome, precoCompra, quantidadeComprada, unidadeMedida, custoUnidade, fornecedor]
  );

  return result.lastInsertRowId;
}
```

4. **Update UI** (`app/insumos/novo.tsx`):
```tsx
const [fornecedor, setFornecedor] = useState('');

// Add input field
<TextInput
  className="..."
  placeholder="Fornecedor (opcional)"
  value={fornecedor}
  onChangeText={setFornecedor}
/>

// Update save handler
await createInsumo(
  user!.id,
  nome,
  precoCompra,
  quantidade,
  unidade,
  fornecedor // NEW
);
```

### Task: Add a List Filter/Search

**Example**: Filter products by name

```tsx
const [searchQuery, setSearchQuery] = useState('');
const [allProdutos, setAllProdutos] = useState<Produto[]>([]);

// Filtered list
const filteredProdutos = useMemo(() => {
  if (!searchQuery.trim()) return allProdutos;

  return allProdutos.filter(p =>
    p.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [allProdutos, searchQuery]);

// UI
<TextInput
  className="bg-gray-100 px-4 py-3 rounded-lg mb-4"
  placeholder="Buscar produtos..."
  value={searchQuery}
  onChangeText={setSearchQuery}
/>

<FlatList
  data={filteredProdutos} // Use filtered data
  // ...
/>
```

### Task: Add Navigation to New Screen

1. Create screen file: `app/relatorios/index.tsx`

2. Add to tab bar (`app/(tabs)/_layout.tsx`):
```tsx
<Tabs.Screen
  name="relatorios"
  options={{
    title: 'Relatórios',
    tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
  }}
/>
```

3. Or add as modal stack in root layout (`app/_layout.tsx`)

### Task: Update Business Logic

**Example**: Change fixed cost allocation from 160 to 176 hours/month

Edit `getProdutosCompletos()` in `database.ts`:

```typescript
// Find this line (around line 850)
const horasPorMes = 160; // Change to 176

// Or make it configurable
const horasPorMes = 176; // 22 days × 8 hours
```

---

## Troubleshooting

### Database Issues

**Problem**: "Database is locked"
```bash
# Reset app state
expo start -c
# Or delete app and reinstall
```

**Problem**: Schema mismatch errors
```typescript
// Add schema version management in setupDatabase()
const DB_VERSION = 2; // Increment when schema changes
// Check version and run migrations
```

### Navigation Issues

**Problem**: Can't navigate to screen
```typescript
// Check file exists in app/ directory
// Check _layout.tsx includes the route
// Use correct path: router.push('/produtos/novo') not 'produtos/novo'
```

### Styling Issues

**Problem**: Tailwind classes not working
```bash
# Restart with cache clear
npm start -- --clear

# Check babel.config.js has nativewind preset
# Check metro.config.js has withNativeWind
```

**Problem**: Colors not showing
```typescript
// Use DEFAULT suffix for custom colors
className="bg-primary-DEFAULT" // Not just "bg-primary"
```

### Type Errors

**Problem**: Type mismatch in database functions
```typescript
// Check types match database schema
// Use optional chaining for nullable values
const price = produto?.preco_sugerido ?? 0;
```

### Build Errors

**Firebase iOS build fails**:
- Check `plugins/withFirebaseFix.js` is configured
- Ensure `google-services.json` and `GoogleService-Info.plist` exist
- Verify Firebase config in `app.config.js`

**Android build fails**:
- Check `google-services.json` is valid
- Verify package name matches Firebase project

---

## Firebase Configuration

### Current Setup

Firebase is **optional** and not required for core functionality. It's configured for future features:

- **Authentication**: Google Sign-In capability (not enforced)
- **Analytics**: Planned but not active
- **Sync**: Future feature for multi-device support

### Environment Variables

Required in `app.config.js`:

```javascript
process.env.FIREBASE_API_KEY
process.env.FIREBASE_AUTH_DOMAIN
process.env.FIREBASE_PROJECT_ID
process.env.FIREBASE_STORAGE_BUCKET
process.env.FIREBASE_MESSAGING_SENDER_ID
process.env.FIREBASE_APP_ID
```

### Offline-First Strategy

The app works 100% offline:
- All data in SQLite
- No network calls required
- Firebase is additive, not foundational

---

## Testing Strategy

### Current Status

⚠️ **No automated testing configured**

**Available Quality Checks**:
```bash
npm run typecheck  # TypeScript type checking
npm run lint       # ESLint code quality
```

### Recommended Testing Setup (Future)

1. **Unit Tests**: Jest for `database.ts` business logic
2. **Component Tests**: React Native Testing Library
3. **E2E Tests**: Detox for critical user flows
4. **Type Safety**: TypeScript strict mode (already enabled)

---

## Code Quality Guidelines

### Do's ✅

- Use TypeScript strict mode for all files
- Use NativeWind/Tailwind for styling (no StyleSheet)
- Handle errors with user-friendly Alert dialogs
- Use `useFocusEffect` for data refresh on screen focus
- Keep business logic in `database.ts`, not in components
- Use Portuguese for business domain terms (produtos, insumos)
- Format currency with `formatCurrency()` utility
- Validate form inputs before database operations
- Use optional chaining for nullable values

### Don'ts ❌

- Don't use StyleSheet.create (use Tailwind only)
- Don't put business logic in components
- Don't forget to handle loading states
- Don't use inline styles except for dynamic values
- Don't skip error handling in async operations
- Don't assume network connectivity
- Don't modify database.ts without updating types
- Don't create tests yet (no framework configured)
- Don't use Firebase as a requirement (it's optional)

---

## Important Files Reference

### Must-Read Files

1. **`/services/database.ts`** (1800+ lines)
   - All data operations
   - Pricing calculation engine
   - Database schema definitions

2. **`/docs/Logica-de-Negocio-e-Formulas.md`** (Portuguese)
   - Business rules and formulas
   - Pricing methodology
   - Cost allocation logic

3. **`/docs/Arquitetura-e-Estrategia-Tecnica.md`** (Portuguese)
   - Technical architecture decisions
   - Technology choices rationale

4. **`/app/(tabs)/_layout.tsx`**
   - Main navigation structure
   - Tab bar configuration

5. **`/context/ProductFormContext.tsx`**
   - Multi-step form state management pattern

### Configuration Files

- **`app.config.js`**: Expo + Firebase configuration
- **`tailwind.config.js`**: Theme colors and Tailwind setup
- **`tsconfig.json`**: TypeScript strict mode settings
- **`babel.config.js`**: NativeWind v4 preset

---

## Git Workflow

### Branch Strategy

- Work on feature branches with pattern: `claude/claude-md-*`
- Main branch: (not specified in current setup)
- Current branch: `claude/claude-md-mhxyinksacjur4un-01WBmReJwYYnYF549Q74GCtW`

### Commit Guidelines

```bash
# Descriptive commits
git commit -m "feat: add supplier field to ingredients"
git commit -m "fix: resolve pricing calculation rounding error"
git commit -m "refactor: extract validation logic to utilities"
git commit -m "docs: update CLAUDE.md with testing section"

# Categories: feat, fix, refactor, docs, chore, style, test
```

### Push with Retries

Always use push with upstream and retry on network errors:

```bash
git push -u origin <branch-name>

# On network failure, retry with exponential backoff (2s, 4s, 8s, 16s)
```

---

## Quick Reference Card

### Key Directories
```
app/          - Screens (Expo Router)
services/     - Business logic (database.ts is the heart)
components/   - Reusable UI
context/      - React Context providers
docs/         - Portuguese specs (comprehensive)
```

### Key Commands
```bash
npm start           # Start dev server
npm run android     # Run Android
npm run typecheck   # Type safety check
npm run lint        # Code quality
```

### Key Functions (database.ts)
```typescript
setupDatabase()              // Initialize DB
createInsumo()               // Create ingredient
createProduto()              // Create product with recipe
getProdutosCompletos()       // Calculate all pricing (CORE LOGIC)
getAllInsumos()              // Get ingredients list
getCustosGlobais()           // Get fixed costs
```

### Key Patterns
```typescript
// Navigation
router.push('/path')
router.back()

// Data loading
useFocusEffect(useCallback(() => { loadData(); }, []))

// Error handling
try { await action(); Alert.alert('Sucesso'); }
catch { Alert.alert('Erro', 'Message'); }

// Currency
formatCurrency(value) → "R$ 123,45"

// Styling
className="flex-1 bg-white p-4 rounded-lg"
```

### Color Palette
- Primary: `#8A2BE2` (Purple)
- Secondary: `#E9D5FF` (Light Purple)
- Background: `#FFFFFF`
- Card: `#F9FAFB`
- Text Muted: `#6B7280`

---

## Getting Help

### Documentation Locations

1. **This file**: Overall codebase guide
2. **`/docs/*.md`**: Detailed business requirements (Portuguese)
3. **`README.md`**: Expo setup instructions
4. **Code comments**: Inline explanations in complex functions

### When Making Changes

1. Read relevant `/docs` files for business context
2. Check `database.ts` for data models and logic
3. Follow existing patterns in similar screens
4. Test on both Android and iOS if possible
5. Run `npm run typecheck` before committing
6. Update this CLAUDE.md if adding major features

---

## Changelog

### 2025-11-13 - Initial Creation
- Comprehensive codebase analysis
- Documented all key patterns and conventions
- Added troubleshooting guide
- Included common tasks and examples
- Mapped all directories and files
- Documented database schema and business logic

---

**End of CLAUDE.md** - Happy coding! 🚀

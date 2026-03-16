# NutriVault

**Track. Fuel. Thrive.**

A premium full-stack nutrition and calorie tracking web application built with Next.js 15, TypeScript, PostgreSQL, and Prisma.

---

## Features

- **Calorie Tracking** — Log meals and stay within your daily target
- **Macro Monitoring** — Track protein, carbs, and fat with visual progress bars
- **Smart Food Diary** — Organized by meal type: Breakfast, Lunch, Dinner, Snacks
- **Weight Tracking** — Log weight entries and visualize your progress over time
- **Goal Engine** — Personalized calorie and macro targets using the Mifflin-St Jeor formula
- **Weekly Charts** — Beautiful Recharts-powered visualizations
- **Water Intake** — Track daily hydration
- **Onboarding Flow** — Multi-step setup with profile + goal configuration
- **OpenFoodFacts Integration** — Optional fallback food search via public API
- **Dark Premium UI** — Elegant SaaS-style dashboard

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth v4 (Credentials) |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| UI Primitives | Radix UI |

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd nutrivault
npm install
```

### 2. Environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Required variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/nutrivault"
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

Optional:

```env
OPENFOODFACTS_API_URL="https://world.openfoodfacts.org/api/v2"
```

### 3. Database setup

Make sure PostgreSQL is running, then:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

### 4. Seed the database

```bash
npm run db:seed
```

This will populate the food database with ~45 realistic foods including:
- Proteins (chicken, salmon, eggs, turkey, tuna)
- Carbs (oats, rice, pasta, bread, quinoa)
- Fruits (apple, banana, berries, avocado)
- Dairy (Greek yogurt, milk, cottage cheese)
- Fats & nuts (almonds, walnuts, olive oil, peanut butter)
- Snacks (protein bar, rice cakes, dark chocolate)
- Beverages (coffee, green tea, juice)

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Application Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── dashboard/     # Main dashboard
│   │   ├── diary/         # Food diary
│   │   ├── progress/      # Progress tracking
│   │   └── settings/      # User settings
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth + registration
│   │   ├── diary/         # Meal entry CRUD
│   │   ├── foods/         # Food search
│   │   ├── meals/[id]/    # Single meal entry
│   │   ├── onboarding/    # Onboarding setup
│   │   ├── profile/       # Profile management
│   │   ├── water/         # Water logging
│   │   └── weight/        # Weight tracking
│   ├── onboarding/        # Onboarding flow
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # Primitive UI components
│   ├── layout/            # Sidebar, header, footer
│   ├── dashboard/         # Dashboard widgets
│   ├── diary/             # Diary components
│   ├── progress/          # Progress charts
│   ├── onboarding/        # Onboarding form
│   ├── settings/          # Settings page
│   └── shared/            # Reusable components
├── lib/                   # Core utilities
│   ├── auth.ts            # NextAuth config
│   ├── prisma.ts          # Prisma client
│   ├── validations.ts     # Zod schemas
│   └── utils.ts           # Helper functions
├── utils/
│   ├── calorie-calculator.ts  # BMR/TDEE calculations
│   └── date.ts                # Date utilities
├── types/                 # TypeScript types
├── hooks/                 # Custom React hooks
└── constants/             # App constants
```

---

## Calorie Calculation

NutriVault uses the **Mifflin-St Jeor equation** for BMR:

- **Male**: `(10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5`
- **Female**: `(10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161`

TDEE = BMR × Activity Multiplier

| Activity Level | Multiplier |
|---------------|------------|
| Sedentary | 1.2 |
| Lightly Active | 1.375 |
| Moderately Active | 1.55 |
| Very Active | 1.725 |
| Extremely Active | 1.9 |

Goal adjustments:
- Lose weight: -500 kcal/day
- Maintain: 0 adjustment
- Gain weight: +300 kcal/day
- Build muscle: +250 kcal/day

---

## OpenFoodFacts Integration

NutriVault optionally queries the free OpenFoodFacts API when local search returns fewer than 5 results. No API key required.

Set in `.env`:
```env
OPENFOODFACTS_API_URL="https://world.openfoodfacts.org/api/v2"
```

---

## Database Commands

```bash
npm run db:generate    # Regenerate Prisma client
npm run db:push        # Sync schema without migration
npm run db:migrate     # Create and apply migration
npm run db:seed        # Seed food database
npm run db:studio      # Open Prisma Studio
```

---

## License

MIT

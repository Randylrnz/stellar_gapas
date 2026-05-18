# 🌾 GAPAS — Global Agricultural Payment & Asset Settlement

A blockchain-based agricultural finance platform built on **Stellar + Soroban** connecting farmers, investors, and cooperatives through transparent funding, tokenization, and automated profit distribution using **USDC**.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | TailwindCSS v4 + Custom CSS Design System |
| State | Zustand (with localStorage persistence) |
| Blockchain | Stellar Network (Testnet) |
| Smart Contracts | Soroban (Rust) |
| Wallet | Freighter Browser Extension |
| Payments | USDC on Stellar |
| Database | PostgreSQL + Prisma (metadata only) |

---

## 👥 User Roles

### 🌾 Farmer
- Creates farm listings (crops or livestock)
- Receives funding via Soroban escrow
- Gets profit after harvest (69% with coop, 70% without)

### 💼 Investor
- Browses farm marketplace
- Funds farms using USDC via Freighter
- Earns 30% of farm profit proportionally

### 🤝 Cooperative
- Barangay-level agricultural organizations
- Assists farmers with registration & tokenization
- Earns **1% of farm profit** when they assist

---

## 💰 Profit Distribution

| Role | With Cooperative | Without Cooperative |
|------|-----------------|---------------------|
| Farmer | 69% | 70% |
| Investors | 30% | 30% |
| Cooperative | 1% | 0% |

---

## 📱 Pages

### Public
- `/` — Landing page
- `/farms` — Marketplace
- `/farms/[id]` — Farm details + invest

### App (requires wallet)
- `/dashboard` — Home dashboard
- `/wallet` — USDC wallet & transactions
- `/portfolio` — Investment portfolio
- `/create-farm` — Create farm listing
- `/cooperative` — Cooperative portal
- `/transactions` — TX history
- `/cash-out` — USDC → PHP simulation
- `/profile` — Account settings

---

## ⚙️ Smart Contract Functions

```rust
fn initialize(farmer, funding_goal, expected_return_bps, duration_days, cooperative_wallet)
fn fund_farm(investor, amount, usdc_token)
fn get_funding() -> FarmState
fn distribute_profit(total_profit, usdc_token)
```

See `contracts/gapas_farm.ts` for the full TypeScript interface and Rust implementation stub.

---

## 🔧 Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Set up database (optional for demo)
```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Run development server
```bash
npm run dev
```

### 5. Install Freighter Wallet
Visit [freighter.app](https://freighter.app) and install the browser extension.
Switch to **Testnet** in Freighter settings.

---

## 🌐 Stellar Configuration

| Setting | Value |
|---------|-------|
| Network | Testnet |
| Horizon | https://horizon-testnet.stellar.org |
| Soroban RPC | https://soroban-testnet.stellar.org |
| USDC Issuer | GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5 |
| Explorer | https://stellar.expert/explorer/testnet |

---

## 🔐 Security Notes

- Wallet signing required for all transactions
- Smart contract is the source of truth — backend handles metadata only
- Backend cannot move funds
- All inputs validated client-side and server-side
- Environment variables never exposed to client

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (app)/              # App routes (require wallet)
│   │   ├── dashboard/
│   │   ├── farms/
│   │   │   └── [id]/
│   │   ├── wallet/
│   │   ├── portfolio/
│   │   ├── create-farm/
│   │   ├── cooperative/
│   │   ├── transactions/
│   │   ├── cash-out/
│   │   └── profile/
│   ├── api/                # API routes
│   │   ├── farms/
│   │   ├── investments/
│   │   └── cooperatives/
│   ├── layout.tsx
│   └── page.tsx            # Landing page
├── components/
│   ├── BottomNav.tsx
│   ├── FarmCard.tsx
│   ├── Toast.tsx
│   └── WalletConnect.tsx
├── lib/
│   ├── types.ts
│   ├── stellar.ts
│   └── mockData.ts
├── store/
│   └── useGapasStore.ts
contracts/
└── gapas_farm.ts           # Soroban contract interface
prisma/
└── schema.prisma
```

---

## 🏆 Hackathon Checklist

- [x] Freighter wallet integration
- [x] Farm tokenization (crops + livestock)
- [x] Cooperative system with 1% profit split
- [x] Investment marketplace with filters
- [x] Soroban escrow contract interface
- [x] USDC profit distribution (69/30/1 split)
- [x] Transaction tracking with Stellar Explorer links
- [x] USDC → PHP cash-out simulation
- [x] Weather risk scoring
- [x] Reinvestment system
- [x] PWA manifest
- [x] Mobile-first design (Agricultural Clarity System)
- [x] TypeScript strict mode
- [x] API routes (metadata only, no funds)
- [x] Prisma database schema

---

Built with ❤️ for Filipino farmers by the GAPAS team.

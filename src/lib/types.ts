// GAPAS Type Definitions

export type UserRole = 'FARMER' | 'INVESTOR' | 'COOPERATIVE' | 'ADMIN'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type FarmStatus = 'PENDING' | 'ACTIVE' | 'FUNDED' | 'HARVESTING' | 'COMPLETED' | 'CANCELLED'
export type WeatherRisk = 'LOW' | 'MODERATE' | 'HIGH'
export type TransactionType = 'FUND' | 'PAYOUT' | 'RETURN' | 'COOPERATIVE_FEE' | 'REINVESTMENT' | 'CASHOUT'

export interface Credential {
  name: string
  issuer: string
  status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED'
  reviewer: string
  issuedVc?: string
}

export interface User {
  id: string
  walletAddress: string
  role: UserRole
  roles?: UserRole[] // support dual role: e.g. ['FARMER', 'INVESTOR']
  displayName?: string
  did?: string
  name?: string
  location?: string
  creditScore?: number
  cooperativeId?: string
  credentials?: Credential[]
  createdAt: string
}

export interface Cooperative {
  id: string
  name: string
  barangay: string
  municipality: string
  walletAddress: string
  verifiedStatus: boolean
  totalEarnings: number
  description?: string
  createdAt: string
  _count?: { farms: number }
}

export interface Farm {
  id: string
  tokenId?: string // CROP-XXXX, LIVE-XXXX, EQP-XXXX, CARB-XXXX
  assetType?: 'CROP' | 'LIVESTOCK' | 'EQUIPMENT' | 'CARBON'
  name: string
  cropType?: string
  livestockType?: string
  description?: string
  location?: string
  fundingGoal: number
  currentFunding: number
  expectedYield?: string
  expectedReturn: number
  riskLevel: RiskLevel
  duration: number
  harvestSchedule?: string
  status: FarmStatus
  contractAddress?: string
  farmerWallet: string
  cooperativeId?: string
  cooperative?: Cooperative
  cooperativeEnabled: boolean
  weatherRisk: WeatherRisk
  imageUrl?: string
  createdAt: string
  updatedAt: string
  farmer?: User
  investments?: Investment[]
  _count?: { investments: number }

  // Equipment specific fields
  equipmentDetails?: {
    model: string
    purchased: string
    nextMaint: string
    condition: 'NEW' | 'GOOD' | 'FAIR' | 'NEEDS_REPAIR'
  } | null

  // Quantity fields for tokenization details
  quantity?: number
  unit?: string // tons, heads, units, tCO2, kg
  valuePhp?: number
  riskReason?: string
  verified?: boolean
  registeredBy?: 'self' | 'cooperative'
}

export interface Investment {
  id: string
  farmId: string
  farm?: Farm
  investorWallet: string
  amount: number
  txHash?: string
  status: string
  returnAmount?: number
  createdAt: string
}

export interface Transaction {
  id: string
  txHash: string
  type: TransactionType
  amount: number
  fromWallet?: string
  toWallet?: string
  farmId?: string
  farm?: Farm
  userWallet?: string
  memo?: string
  status: string
  createdAt: string
}

export interface Ticket {
  id: string // TKT-YYYY-XXXXX
  farmerId: string
  farmerName: string
  cooperativeId: string
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED'
  assetId?: string
  createdAt: string
  completedAt?: string
}

export interface Proposal {
  id: string
  title: string
  type: 'EQUIPMENT_PURCHASE' | 'DISTRIBUTION_CHANGE' | 'EMERGENCY_FUND' | 'BUDGET_ALLOCATION' | 'CROP_PLANNING' | 'OTHER'
  requesterDid: string
  budget?: string
  deadline: string
  detail: string
  yesVotes: number
  noVotes: number
  status: 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXPIRED'
  createdAt: string
  executedTx?: string
  voters?: string[] // Track who has voted
}

export interface Receipt {
  id: string // TXN-XXXXX
  txHash: string
  type: 'INVESTMENT' | 'PAYOUT' | 'WITHDRAWAL' | 'FEE' | 'SWAP' | 'TRANSFER' | 'INSURANCE'
  fromDid: string
  toDid: string
  amountUsdc: number
  amountPhp: number
  exchangeRate: number
  assetId?: string
  status: 'PENDING' | 'CONFIRMED' | 'FAILED'
  createdAt: string
  blockLedger?: number
  referenceId?: string
  blockchain?: string
}

// Profit distribution model (V2.0 rules: 40% farmer, 60% investor pool after fees)
export interface ProfitDistribution {
  farmerPercent: number     // 40%
  investorPercent: number   // 60%
  platformPercent: number   // 1% platform fee
  cooperativeFeePercent: number // 0.5% of original asset value (only crops registered by coops)
}

export function getProfitDistribution(): ProfitDistribution {
  return {
    farmerPercent: 40,
    investorPercent: 60,
    platformPercent: 1,
    cooperativeFeePercent: 0.5,
  }
}

// Weather risk helpers
export function getWeatherRiskLabel(risk: WeatherRisk): string {
  const labels: Record<WeatherRisk, string> = {
    LOW: 'Low Risk',
    MODERATE: 'Medium Risk',
    HIGH: 'High Risk',
  }
  return labels[risk]
}

export function getRiskBadgeClass(risk: RiskLevel | WeatherRisk): string {
  if (risk === 'LOW') return 'badge-success'
  if (risk === 'MEDIUM' || risk === 'MODERATE') return 'badge-warning'
  return 'badge-danger'
}

// Format helpers
export function formatUSDC(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPHP(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount)
}

// 1 USDC ≈ 57.43 PHP (V2.0 exact live rate)
export const USDC_TO_PHP_RATE = 57.43

export function usdcToPhp(usdc: number): number {
  return usdc * USDC_TO_PHP_RATE
}

export function phpToUsdc(php: number): number {
  return php / USDC_TO_PHP_RATE
}

export function shortenAddress(address: string, chars = 6): string {
  if (!address) return ''
  return `${address.slice(0, chars)}...${address.slice(-4)}`
}

export function getFundingProgress(current: number, goal: number): number {
  if (goal === 0) return 0
  return Math.min(Math.round((current / goal) * 100), 100)
}


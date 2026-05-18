// GAPAS Type Definitions

export type UserRole = 'FARMER' | 'INVESTOR' | 'COOPERATIVE' | 'ADMIN'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type FarmStatus = 'PENDING' | 'ACTIVE' | 'FUNDED' | 'HARVESTING' | 'COMPLETED' | 'CANCELLED'
export type WeatherRisk = 'LOW' | 'MODERATE' | 'HIGH'
export type TransactionType = 'FUND' | 'PAYOUT' | 'RETURN' | 'COOPERATIVE_FEE' | 'REINVESTMENT' | 'CASHOUT'

export interface User {
  id: string
  walletAddress: string
  role: UserRole
  displayName?: string
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

// Profit distribution model
export interface ProfitDistribution {
  farmerPercent: number     // 69% with coop, 70% without
  investorPercent: number   // 30%
  cooperativePercent: number // 1% with coop, 0% without
  cooperativeEnabled: boolean
}

export function getProfitDistribution(cooperativeEnabled: boolean): ProfitDistribution {
  return {
    farmerPercent: cooperativeEnabled ? 69 : 70,
    investorPercent: 30,
    cooperativePercent: cooperativeEnabled ? 1 : 0,
    cooperativeEnabled,
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

// 1 USDC ≈ 57 PHP (approximate, for display only)
export const USDC_TO_PHP_RATE = 57

export function usdcToPhp(usdc: number): number {
  return usdc * USDC_TO_PHP_RATE
}

export function shortenAddress(address: string, chars = 6): string {
  if (!address) return ''
  return `${address.slice(0, chars)}...${address.slice(-4)}`
}

export function getFundingProgress(current: number, goal: number): number {
  if (goal === 0) return 0
  return Math.min(Math.round((current / goal) * 100), 100)
}

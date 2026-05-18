import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, Farm, Investment, Transaction, Cooperative } from '@/lib/types'

interface WalletState {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  network: string
  user: User | null
}

interface UIState {
  toast: { message: string; type: 'success' | 'error' | 'info' } | null
  isLoading: boolean
}

interface DataState {
  farms: Farm[]
  myInvestments: Investment[]
  myTransactions: Transaction[]
  cooperatives: Cooperative[]
  portfolioTotal: number
  totalEarnings: number
}

interface GapasStore extends WalletState, UIState, DataState {
  // Wallet actions
  setWalletConnected: (address: string, network: string) => void
  setWalletDisconnected: () => void
  setConnecting: (val: boolean) => void
  setUser: (user: User | null) => void

  // UI actions
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  clearToast: () => void
  setLoading: (val: boolean) => void

  // Data actions
  setFarms: (farms: Farm[]) => void
  addFarm: (farm: Farm) => void
  updateFarm: (id: string, updates: Partial<Farm>) => void
  setMyInvestments: (investments: Investment[]) => void
  addInvestment: (investment: Investment) => void
  setMyTransactions: (txs: Transaction[]) => void
  addTransaction: (tx: Transaction) => void
  setCooperatives: (coops: Cooperative[]) => void
  setPortfolioStats: (total: number, earnings: number) => void
}

export const useGapasStore = create<GapasStore>()(
  persist(
    (set) => ({
      // Wallet initial state
      address: null,
      isConnected: false,
      isConnecting: false,
      network: 'testnet',
      user: null,

      // UI initial state
      toast: null,
      isLoading: false,

      // Data initial state
      farms: [],
      myInvestments: [],
      myTransactions: [],
      cooperatives: [],
      portfolioTotal: 0,
      totalEarnings: 0,

      // Wallet actions
      setWalletConnected: (address, network) =>
        set({ address, isConnected: true, isConnecting: false, network }),
      setWalletDisconnected: () =>
        set({
          address: null,
          isConnected: false,
          user: null,
          myInvestments: [],
          myTransactions: [],
          portfolioTotal: 0,
          totalEarnings: 0,
        }),
      setConnecting: (val) => set({ isConnecting: val }),
      setUser: (user) => set({ user }),

      // UI actions
      showToast: (message, type = 'info') => {
        set({ toast: { message, type } })
        setTimeout(() => set({ toast: null }), 3500)
      },
      clearToast: () => set({ toast: null }),
      setLoading: (val) => set({ isLoading: val }),

      // Data actions
      setFarms: (farms) => set({ farms }),
      addFarm: (farm) => set((state) => ({ farms: [farm, ...state.farms] })),
      updateFarm: (id, updates) =>
        set((state) => ({
          farms: state.farms.map((f) => (f.id === id ? { ...f, ...updates } : f)),
        })),
      setMyInvestments: (myInvestments) => set({ myInvestments }),
      addInvestment: (investment) =>
        set((state) => ({ myInvestments: [investment, ...state.myInvestments] })),
      setMyTransactions: (myTransactions) => set({ myTransactions }),
      addTransaction: (tx) =>
        set((state) => ({ myTransactions: [tx, ...state.myTransactions] })),
      setCooperatives: (cooperatives) => set({ cooperatives }),
      setPortfolioStats: (portfolioTotal, totalEarnings) =>
        set({ portfolioTotal, totalEarnings }),
    }),
    {
      name: 'gapas-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        address: state.address,
        isConnected: state.isConnected,
        network: state.network,
        user: state.user,
      }),
    }
  )
)

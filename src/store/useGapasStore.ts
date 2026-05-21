import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, Farm, Investment, Transaction, Cooperative, Ticket, Proposal, Receipt, Credential } from '@/lib/types'
import { MOCK_FARMS, MOCK_INVESTMENTS, MOCK_TRANSACTIONS, MOCK_COOPERATIVES } from '@/lib/mockData'

interface WalletState {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  network: string
  user: User | null
  activeRole: 'INVESTOR' | 'FARMER' | 'COOPERATIVE'
  balances: { usdc: number }
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
  tickets: Ticket[]
  proposals: Proposal[]
  receipts: Receipt[]
}

interface GapasStore extends WalletState, UIState, DataState {
  // Wallet actions
  setWalletConnected: (address: string, network: string) => void
  setWalletDisconnected: () => void
  setConnecting: (val: boolean) => void
  setUser: (user: User | null) => void
  switchRole: (role: 'INVESTOR' | 'FARMER' | 'COOPERATIVE') => void
  updateBalances: (updates: Partial<{ usdc: number }>) => void

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

  // Ticket actions
  generateTicket: () => string
  completeTicket: (ticketId: string, farmId: string) => void
  setTickets: (tickets: Ticket[]) => void

  // DAO actions
  createProposal: (title: string, type: Proposal['type'], budget: string | undefined, detail: string, durationDays: number) => void
  voteProposal: (proposalId: string, voteType: 'YES' | 'NO') => void
  setProposals: (proposals: Proposal[]) => void

  // Receipt actions
  addReceipt: (receipt: Receipt) => void
  setReceipts: (receipts: Receipt[]) => void

  // Credentials actions
  uploadCredential: (credentialName: string) => void
  simulateCredentialApproval: (credentialName: string, approve: boolean) => void

  // Weather & Coordinates
  gmapsApiKey: string
  setGmapsApiKey: (key: string) => void
  farmBarangay: string
  setFarmBarangay: (barangay: string) => void
  farmCoordinates: { lat: number; lng: number } | null
  setFarmCoordinates: (coords: { lat: number; lng: number } | null) => void
  disasterEvents: any[]
  addDisasterEvent: (event: any) => void
}

const INITIAL_CREDENTIALS: Credential[] = [
  { name: 'Land Ownership Certificate', issuer: 'DENR', status: 'VERIFIED', reviewer: 'System — cross-checked via DENR public registry API', issuedVc: 'vc:stellar:GAPAS:land_ownership:denr99f0' },
  { name: 'Farming History (5 years)', issuer: 'DA Philippines', status: 'VERIFIED', reviewer: 'System — verified via DA Philippines registry API', issuedVc: 'vc:stellar:GAPAS:farming_history:da102b3c4f' },
  { name: 'Sustainable Practices Certificate', issuer: 'ATI', status: 'VERIFIED', reviewer: 'System — verified via ATI registry API', issuedVc: 'vc:stellar:GAPAS:sustainable:ati432a' },
  { name: 'KYC Verification', issuer: 'G.A.P.A.S Platform', status: 'VERIFIED', reviewer: 'G.A.P.A.S Compliance Team (manual, 1-2 business days)', issuedVc: 'vc:stellar:GAPAS:kyc:c78f90ea23' },
  { name: 'AML Compliance', issuer: 'G.A.P.A.S Platform', status: 'VERIFIED', reviewer: 'G.A.P.A.S Compliance Team (manual, 1-2 business days)', issuedVc: 'vc:stellar:GAPAS:aml:aef9012b1a' },
  { name: 'Barangay Clearance', issuer: "Farmer's Barangay", status: 'PENDING', reviewer: 'Barangay Officer — manual review after document upload' }
]

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TKT-2026-00411',
    farmerId: 'GAX_MOCK_USER_7F8E9D2C3B4A5',
    farmerName: 'Demo User (Farmer)',
    cooperativeId: 'coop-1',
    status: 'PENDING',
    createdAt: '2026-05-18T10:00:00Z'
  },
  {
    id: 'TKT-2026-00912',
    farmerId: 'GAX_MOCK_USER_7F8E9D2C3B4A5',
    farmerName: 'Demo User (Farmer)',
    cooperativeId: 'coop-1',
    status: 'COMPLETED',
    assetId: 'farm-1',
    createdAt: '2026-05-15T08:30:00Z',
    completedAt: '2026-05-16T12:00:00Z'
  }
]

const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'prop-1',
    title: 'Purchase drip-irrigation system',
    type: 'EQUIPMENT_PURCHASE',
    requesterDid: 'did:stellar:GAPAS:GFARMER1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    budget: '₱8,500',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    detail: 'Purchase and installation of high-efficiency drip irrigation pipes for the Verde Rice Terraces. This system will maintain critical moisture levels, increasing projected crop yield by up to 15% even during irregular rainfall cycles.',
    yesVotes: 12500,
    noVotes: 3200,
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    voters: []
  },
  {
    id: 'prop-2',
    title: 'Emergency Storm Drainage Budget',
    type: 'EMERGENCY_FUND',
    requesterDid: 'did:stellar:GAPAS:GFARMER2BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    budget: '₱12,000',
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    detail: 'Urgent reinforcement of farm runoff canals to prevent soil washouts in Valencia, Bukidnon highlands due to early storm forecasts.',
    yesVotes: 15400,
    noVotes: 1100,
    status: 'PASSED',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    executedTx: '0x3a5ef8c810b1d3d6e5a4f7b2c0df3b123ac4b5e7d8f9e0a1b2c3d4e5f6a7b8c9',
    voters: []
  }
]

const INITIAL_RECEIPTS: Receipt[] = [
  {
    id: 'TXN-00041',
    txHash: 'abc123def456abc123def456abc123def456abc123def456abc123def456abc1',
    type: 'INVESTMENT',
    fromDid: 'did:stellar:GAPAS:GAX_MOCK_USER_7F8E9D2C3B4A5',
    toDid: 'did:stellar:GAPAS:GFARMER1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    amountUsdc: 500,
    amountPhp: 28715,
    exchangeRate: 57.43,
    assetId: 'farm-1',
    status: 'CONFIRMED',
    createdAt: '2026-03-10T08:30:00Z'
  },
  {
    id: 'TXN-00042',
    txHash: 'def789ghi012def789ghi012def789ghi012def789ghi012def789ghi012def7',
    type: 'INVESTMENT',
    fromDid: 'did:stellar:GAPAS:GAX_MOCK_USER_7F8E9D2C3B4A5',
    toDid: 'did:stellar:GAPAS:GFARMER2BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    amountUsdc: 1000,
    amountPhp: 57430,
    exchangeRate: 57.43,
    assetId: 'farm-2',
    status: 'CONFIRMED',
    createdAt: '2026-03-20T14:15:00Z'
  },
  {
    id: 'TXN-00043',
    txHash: 'ghi345jkl678ghi345jkl678ghi345jkl678ghi345jkl678ghi345jkl678ghi3',
    type: 'PAYOUT',
    fromDid: 'did:stellar:GAPAS:GFARMER4DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    toDid: 'did:stellar:GAPAS:GAX_MOCK_USER_7F8E9D2C3B4A5',
    amountUsdc: 1012.5,
    amountPhp: 58147.88,
    exchangeRate: 57.43,
    assetId: 'farm-4',
    status: 'CONFIRMED',
    createdAt: '2026-05-01T10:00:00Z'
  }
]

export const useGapasStore = create<GapasStore>()(
  persist(
    (set) => ({
      // Wallet initial state
      address: null,
      isConnected: false,
      isConnecting: false,
      network: 'testnet',
      user: null,
      activeRole: 'INVESTOR',
      balances: { usdc: 2450.75 },

      // UI initial state
      toast: null,
      isLoading: false,

      // Data initial state
      farms: MOCK_FARMS,
      myInvestments: MOCK_INVESTMENTS,
      myTransactions: MOCK_TRANSACTIONS,
      cooperatives: MOCK_COOPERATIVES,
      portfolioTotal: 0,
      totalEarnings: 0,
      tickets: INITIAL_TICKETS,
      proposals: INITIAL_PROPOSALS,
      receipts: INITIAL_RECEIPTS,

      // Weather & coordinates state
      gmapsApiKey: '',
      farmBarangay: 'Atok',
      farmCoordinates: { lat: 16.5779, lng: 120.7013 },
      disasterEvents: [],

      // Wallet actions
      setWalletConnected: (address, network) => {
        const did = `did:stellar:GAPAS:GC3DRQQ3S7LNDDEX5AB74MX26P`
        set((state) => ({
          address,
          isConnected: true,
          isConnecting: false,
          network,
          user: {
            id: address,
            walletAddress: address,
            role: state.user?.role || 'FARMER',
            roles: ['INVESTOR', 'FARMER', 'COOPERATIVE'],
            displayName: 'Juan dela Cruz',
            did,
            creditScore: 782,
            location: 'Barangay Atok, Benguet Province',
            cooperativeId: 'coop-1',
            credentials: INITIAL_CREDENTIALS,
            createdAt: state.user?.createdAt || new Date().toISOString()
          }
        }))
      },
      setWalletDisconnected: () =>
        set({
          address: null,
          isConnected: false,
          user: null,
          activeRole: 'INVESTOR',
          balances: { usdc: 0 },
          myInvestments: [],
          myTransactions: [],
          portfolioTotal: 0,
          totalEarnings: 0,
          tickets: [],
          proposals: [],
          receipts: []
        }),
      setConnecting: (val) => set({ isConnecting: val }),
      setUser: (user) => set({ user }),
      switchRole: (activeRole) => set({ activeRole }),
      updateBalances: (updates) =>
        set((state) => ({ balances: { ...state.balances, ...updates } })),

      // UI actions
      showToast: (message, type = 'info') => {
        set({ toast: { message, type } })
        setTimeout(() => set({ toast: null }), 3500)
      },
      clearToast: () => set({ toast: null }),
      setLoading: (val) => set({ isLoading: val }),

      // Data actions
      setFarms: (farms) => set((state) => ({ farms: state.farms.length > 0 ? state.farms : farms })),
      addFarm: (farm) => set((state) => ({ farms: [farm, ...state.farms] })),
      updateFarm: (id, updates) =>
        set((state) => ({
          farms: state.farms.map((f) => (f.id === id ? { ...f, ...updates } : f)),
        })),
      setMyInvestments: (myInvestments) => set((state) => ({ myInvestments: state.myInvestments.length > 0 ? state.myInvestments : myInvestments })),
      addInvestment: (investment) =>
        set((state) => ({ myInvestments: [investment, ...state.myInvestments] })),
      setMyTransactions: (myTransactions) => set((state) => ({ myTransactions: state.myTransactions.length > 0 ? state.myTransactions : myTransactions })),
      addTransaction: (tx) =>
        set((state) => ({ myTransactions: [tx, ...state.myTransactions] })),
      setCooperatives: (cooperatives) => set((state) => ({ cooperatives: state.cooperatives.length > 0 ? state.cooperatives : cooperatives })),
      setPortfolioStats: (portfolioTotal, totalEarnings) =>
        set({ portfolioTotal, totalEarnings }),

      // Ticket actions
      generateTicket: () => {
        const ticketId = `TKT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`
        set((state) => {
          const newTicket: Ticket = {
            id: ticketId,
            farmerId: state.address || 'farmer-demo',
            farmerName: state.user?.displayName || 'Demo User',
            cooperativeId: 'coop-1',
            status: 'PENDING',
            createdAt: new Date().toISOString()
          }
          return { tickets: [newTicket, ...state.tickets] }
        })
        return ticketId
      },
      completeTicket: (ticketId, assetId) =>
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === ticketId
              ? { ...t, status: 'COMPLETED', assetId, completedAt: new Date().toISOString() }
              : t
          )
        })),
      setTickets: (tickets) => set({ tickets }),

      // DAO actions
      createProposal: (title, type, budget, detail, durationDays) =>
        set((state) => {
          const newProp: Proposal = {
            id: `prop-${Date.now()}`,
            title,
            type,
            requesterDid: state.user?.did || 'did:stellar:GAPAS:GFARMER',
            budget,
            deadline: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
            detail,
            yesVotes: 0,
            noVotes: 0,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            voters: []
          }
          return { proposals: [newProp, ...state.proposals] }
        }),
      voteProposal: (proposalId, voteType) =>
        set((state) => {
          if (!state.address) return {}
          const userVoteWeight = state.activeRole === 'FARMER'
            ? (state.farms.filter(f => f.farmerWallet === state.address).reduce((acc, f) => acc + (f.valuePhp || f.fundingGoal * 57.43), 0))
            : (state.myInvestments.reduce((acc, i) => acc + i.amount * 57.43, 0) || 500 * 57.43) // Fallback investment weight

          return {
            proposals: state.proposals.map((p) => {
              if (p.id !== proposalId) return p
              if (p.voters?.includes(state.address!)) return p // Double vote prevention

              const addedYes = voteType === 'YES' ? userVoteWeight : 0
              const addedNo = voteType === 'NO' ? userVoteWeight : 0

              return {
                ...p,
                yesVotes: p.yesVotes + addedYes,
                noVotes: p.noVotes + addedNo,
                voters: [...(p.voters || []), state.address!]
              }
            })
          }
        }),
      setProposals: (proposals) => set({ proposals }),

      // Receipt actions
      addReceipt: (receipt) => set((state) => ({ receipts: [receipt, ...state.receipts] })),
      setReceipts: (receipts) => set({ receipts }),

      // Credentials actions
      uploadCredential: (credentialName) =>
        set((state) => {
          if (!state.user) return {}
          const updatedCreds = state.user.credentials?.map((c) =>
            c.name === credentialName ? { ...c, status: 'UNDER_REVIEW' as const } : c
          )
          return {
            user: { ...state.user, credentials: updatedCreds }
          }
        }),
      simulateCredentialApproval: (credentialName, approve) =>
        set((state) => {
          if (!state.user) return {}
          const updatedCreds = state.user.credentials?.map((c) => {
            if (c.name !== credentialName) return c
            const status = approve ? ('VERIFIED' as const) : ('REJECTED' as const)
            const issuedVc = approve ? `vc:stellar:GAPAS:${credentialName.toLowerCase().replace(/\s+/g, '_')}:${Math.random().toString(16).slice(2, 10)}` : undefined
            return { ...c, status, issuedVc }
          })
          const scoreDelta = approve ? 45 : -10
          const currentScore = state.user.creditScore || 700
          return {
            user: {
              ...state.user,
              credentials: updatedCreds,
              creditScore: Math.min(Math.max(currentScore + scoreDelta, 0), 1000)
            }
          }
        }),

      // Weather & Coordinates actions
      setGmapsApiKey: (gmapsApiKey) => set({ gmapsApiKey }),
      setFarmBarangay: (farmBarangay) => set({ farmBarangay }),
      setFarmCoordinates: (farmCoordinates) => set({ farmCoordinates }),
      addDisasterEvent: (event) => set((state) => ({ disasterEvents: [event, ...state.disasterEvents] })),
    }),
    {
      name: 'gapas-storage-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        address: state.address,
        isConnected: state.isConnected,
        network: state.network,
        user: state.user,
        activeRole: state.activeRole,
        balances: state.balances,
        farms: state.farms,
        myInvestments: state.myInvestments,
        myTransactions: state.myTransactions,
        cooperatives: state.cooperatives,
        tickets: state.tickets,
        proposals: state.proposals,
        receipts: state.receipts,
        gmapsApiKey: state.gmapsApiKey,
        farmBarangay: state.farmBarangay,
        farmCoordinates: state.farmCoordinates,
        disasterEvents: state.disasterEvents
      }),
    }
  )
)


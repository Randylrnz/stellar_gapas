'use client'

// Stellar + Freighter wallet integration for GAPAS
// Uses the Freighter browser extension for wallet auth

export const STELLAR_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet'
export const HORIZON_URL =
  process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org'
export const SOROBAN_RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org'
export const STELLAR_EXPERT_URL =
  process.env.NEXT_PUBLIC_STELLAR_EXPERT_URL || 'https://stellar.expert/explorer/testnet'

export const USDC_ASSET_CODE = process.env.NEXT_PUBLIC_USDC_ASSET_CODE || 'USDC'
export const USDC_ISSUER =
  process.env.NEXT_PUBLIC_USDC_ISSUER ||
  'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'

// Freighter API (injected by the browser extension)
declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<{ isConnected: boolean }>
      getAddress: () => Promise<{ address: string; error?: string }>
      getNetwork: () => Promise<{ network: string; networkPassphrase: string }>
      signTransaction: (
        xdr: string,
        opts?: { network?: string; networkPassphrase?: string }
      ) => Promise<{ signedTxXdr: string; error?: string }>
      getUser?: () => Promise<{ publicKey: string }>
    }
  }
}

export type FreighterConnectionResult =
  | { success: true; address: string; network: string }
  | { success: false; error: string }

/**
 * Check if Freighter extension is installed
 */
export async function isFreighterInstalled(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  // Give the extension a moment to inject
  await new Promise((r) => setTimeout(r, 300))
  return !!window.freighter
}

/**
 * Connect to Freighter wallet
 */
export async function connectFreighter(): Promise<FreighterConnectionResult> {
  try {
    if (!(await isFreighterInstalled())) {
      return {
        success: false,
        error: 'Freighter wallet is not installed. Please install it from freighter.app',
      }
    }

    const { isConnected } = await window.freighter!.isConnected()
    if (!isConnected) {
      // Trigger connection request
    }

    const { address, error: addrError } = await window.freighter!.getAddress()
    if (addrError || !address) {
      return { success: false, error: addrError || 'Failed to get wallet address' }
    }

    const { network } = await window.freighter!.getNetwork()

    return { success: true, address, network }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to connect wallet',
    }
  }
}

/**
 * Get current connected Freighter address
 */
export async function getFreighterAddress(): Promise<string | null> {
  try {
    if (typeof window === 'undefined' || !window.freighter) return null
    const { address, error } = await window.freighter.getAddress()
    if (error || !address) return null
    return address
  } catch {
    return null
  }
}

/**
 * Get explorer link for a transaction
 */
export function getTxExplorerUrl(txHash: string): string {
  return `${STELLAR_EXPERT_URL}/tx/${txHash}`
}

/**
 * Get explorer link for an account
 */
export function getAccountExplorerUrl(address: string): string {
  return `${STELLAR_EXPERT_URL}/account/${address}`
}

/**
 * Simulate a Stellar USDC transfer (mock for demo)
 * In production, this would build and submit a real Stellar transaction
 */
export async function simulateStellarTransfer(params: {
  fromAddress: string
  toAddress: string
  amount: number
  memo?: string
}): Promise<{ success: boolean; txHash?: string; error?: string }> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 1500))

  // Generate a mock tx hash
  const mockHash = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')

  // 95% success rate for demo
  if (Math.random() > 0.05) {
    return { success: true, txHash: mockHash }
  }

  return { success: false, error: 'Transaction simulation failed. Please try again.' }
}

/**
 * Simulate Soroban contract interaction (mock for demo)
 * In production this would use the Soroban JS SDK
 */
export async function simulateContractCall(params: {
  contractAddress: string
  method: string
  args: unknown[]
}): Promise<{ success: boolean; result?: unknown; error?: string }> {
  await new Promise((r) => setTimeout(r, 1000))
  return { success: true, result: { status: 'ok', method: params.method } }
}

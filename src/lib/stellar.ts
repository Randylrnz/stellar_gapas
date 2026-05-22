'use client'

// Stellar + Freighter wallet integration for GAPAS
// Uses @stellar/freighter-api for real wallet connection
// Uses @stellar/stellar-sdk for transaction building + Soroban RPC calls

import * as FreighterApi from '@stellar/freighter-api'
import { StellarSdk } from '@/lib/stellarSdk'

// Robust compatibility mapping for @stellar/freighter-api
export const freighterIsConnected = async (): Promise<{ isConnected: boolean }> => {
  if (typeof FreighterApi.isConnected === 'function') {
    const res = await FreighterApi.isConnected()
    return typeof res === 'boolean' ? { isConnected: res } : res
  }
  return { isConnected: false }
}

export const freighterGetAddress = async (): Promise<{ address?: string; error?: string }> => {
  try {
    if (typeof (FreighterApi as any).getAddress === 'function') {
      const res = await (FreighterApi as any).getAddress()
      return typeof res === 'string' ? { address: res } : { address: res?.address || (res as any)?.publicKey, error: res?.error }
    }
    if (typeof (FreighterApi as any).getPublicKey === 'function') {
      const pubKey = await (FreighterApi as any).getPublicKey()
      return typeof pubKey === 'string' ? { address: pubKey } : { address: pubKey?.address || pubKey?.publicKey || pubKey, error: pubKey?.error }
    }
    return { error: 'freighter-api getAddress/getPublicKey not available' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

export const freighterGetNetwork = async (): Promise<{ network?: string; error?: string }> => {
  if (typeof FreighterApi.getNetwork === 'function') {
    const res = await FreighterApi.getNetwork()
    return typeof res === 'string' ? { network: res } : res
  }
  return { network: 'testnet' }
}

export const freighterSignTransaction = async (xdr: string, opts?: any): Promise<any> => {
  if (typeof FreighterApi.signTransaction === 'function') {
    return await FreighterApi.signTransaction(xdr, opts)
  }
  return { error: 'signTransaction not available' }
}

export const requestAccess = async (): Promise<{ address?: string; error?: string }> => {
  try {
    if (typeof FreighterApi.requestAccess === 'function') {
      const res = await FreighterApi.requestAccess()
      return typeof res === 'string' ? { address: res } : { address: res?.address, error: res?.error }
    }
    return await freighterGetAddress()
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}


export const STELLAR_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet'
export const HORIZON_URL =
  process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org'
export const SOROBAN_RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org'
export const STELLAR_EXPERT_URL =
  process.env.NEXT_PUBLIC_STELLAR_EXPERT_URL || 'https://stellar.expert/explorer/testnet'
export const STELLAR_LAB_URL = 'https://laboratory.stellar.org'

export const USDC_ASSET_CODE = process.env.NEXT_PUBLIC_USDC_ASSET_CODE || 'USDC'
export const USDC_ISSUER =
  process.env.NEXT_PUBLIC_USDC_ISSUER ||
  'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'

export const NETWORK_PASSPHRASE =
  STELLAR_NETWORK === 'mainnet'
    ? 'Public Global Stellar Network ; September 2015'
    : 'Test SDF Network ; September 2015'

// ─── Types ───────────────────────────────────────────────────────────────────

export type FreighterConnectionResult =
  | { success: true; address: string; network: string }
  | { success: false; error: string }

export type SorobanRpcResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export interface SorobanEvent {
  id: string
  type: string
  ledger: number
  ledgerClosedAt: string
  contractId: string
  topic: string[]
  value: string
  inSuccessfulContractCall: boolean
}

// ─── Freighter Wallet ─────────────────────────────────────────────────────────

/**
 * Check if Freighter extension is installed and connected
 */
export async function isFreighterInstalled(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  try {
    const result = await freighterIsConnected()
    return result.isConnected
  } catch {
    return false
  }
}

/**
 * Request wallet access and connect to Freighter.
 * This triggers the real Freighter browser extension popup.
 */
export async function connectFreighter(): Promise<FreighterConnectionResult> {
  try {
    if (typeof window === 'undefined') {
      return { success: false, error: 'Cannot connect wallet on server side.' }
    }

    // Trigger Freighter permission request — this shows the wallet popup
    const accessResult = await requestAccess()
    if (accessResult.error) {
      return {
        success: false,
        error: accessResult.error || 'User denied wallet access',
      }
    }

    // Get the connected address
    const addressResult = await freighterGetAddress()
    if (addressResult.error || !addressResult.address) {
      return {
        success: false,
        error: addressResult.error || 'Failed to get wallet address',
      }
    }

    // Get the network the wallet is on
    const networkResult = await freighterGetNetwork()
    const walletNetwork = networkResult.network?.toLowerCase() || 'testnet'

    return {
      success: true,
      address: addressResult.address,
      network: walletNetwork,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to connect wallet',
    }
  }
}

/**
 * Get current connected Freighter address without triggering a popup
 */
export async function getFreighterAddress(): Promise<string | null> {
  try {
    if (typeof window === 'undefined') return null
    const result = await freighterGetAddress()
    if (result.error || !result.address) return null
    return result.address
  } catch {
    return null
  }
}

/**
 * Sign a transaction XDR string with Freighter.
 * Returns the signed XDR or an error.
 */
export async function signWithFreighter(
  xdr: string
): Promise<{ signedXdr: string } | { error: string }> {
  try {
    const result = await freighterSignTransaction(xdr, {
      network: STELLAR_NETWORK,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
    if (result.error) return { error: result.error }
    return { signedXdr: result.signedTxXdr }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Signing failed' }
  }
}

// ─── Soroban RPC ──────────────────────────────────────────────────────────────

/**
 * Generic JSON-RPC call to the Soroban RPC endpoint
 */
async function sorobanRpc<T>(method: string, params: unknown): Promise<SorobanRpcResponse<T>> {
  try {
    const res = await fetch(SOROBAN_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      }),
    })

    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}: ${res.statusText}` }
    }

    const json = await res.json()
    if (json.error) {
      return { success: false, error: json.error.message || 'RPC error' }
    }

    return { success: true, data: json.result as T }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'RPC request failed',
    }
  }
}

/**
 * Get the latest ledger number from Soroban RPC
 */
export async function getLatestLedger(): Promise<number | null> {
  const result = await sorobanRpc<{ sequence: number }>('getLatestLedger', {})
  if (!result.success) return null
  return result.data.sequence
}

/**
 * Simulate a transaction on Soroban RPC (read-only — no signing needed)
 */
export async function simulateTransaction(
  xdr: string
): Promise<SorobanRpcResponse<{ results?: Array<{ xdr: string }>; minResourceFee?: string }>> {
  return sorobanRpc('simulateTransaction', { transaction: xdr })
}

/**
 * Submit a signed transaction to Soroban RPC
 */
export async function sendTransaction(
  signedXdr: string
): Promise<SorobanRpcResponse<{ hash: string; status: string }>> {
  return sorobanRpc('sendTransaction', { transaction: signedXdr })
}

/**
 * Fetch contract events from Soroban RPC using getEvents.
 *
 * Per Stellar docs:
 * - startLedger: beginning of query window (inclusive)
 * - filters.type: 'contract' for Soroban contract events
 * - filters.contractIds: array of contract IDs to filter by
 * - RPC retains last 24 hours of events by default
 */
export async function fetchContractEvents(params: {
  contractAddress: string
  startLedger: number
  limit?: number
}): Promise<SorobanEvent[]> {
  const result = await sorobanRpc<{
    events: Array<{
      id: string
      type: string
      ledger: number
      ledgerClosedAt: string
      contractId: string
      topic: string[]
      value: string
      inSuccessfulContractCall: boolean
    }>
    latestLedger: number
  }>('getEvents', {
    startLedger: params.startLedger,
    filters: [
      {
        type: 'contract',
        contractIds: [params.contractAddress],
      },
    ],
    pagination: {
      limit: params.limit ?? 50,
    },
  })

  if (!result.success) return []
  return result.data.events || []
}

/**
 * Decode a Soroban event using stellar-sdk.
 * Parses the base64 ScVal topics and value into native JS values.
 */
export async function parseSorobanEvent(event: SorobanEvent): Promise<{
  id: string
  ledger: number
  ledgerClosedAt: string
  contractId: string
  topics: any[]
  value: any
  txHash: string
}> {
  try {
    const sdk = await StellarSdk()
    const { xdr, scValToNative } = sdk

    const parsedTopics = event.topic.map((t) => {
      try {
        const scVal = xdr.ScVal.fromXDR(t, 'base64')
        return scValToNative(scVal)
      } catch {
        return t
      }
    })

    let parsedValue = null
    try {
      const scVal = xdr.ScVal.fromXDR(event.value, 'base64')
      parsedValue = scValToNative(scVal)
    } catch {
      parsedValue = event.value
    }

    return {
      id: event.id,
      ledger: event.ledger,
      ledgerClosedAt: event.ledgerClosedAt,
      contractId: event.contractId,
      topics: parsedTopics,
      value: parsedValue,
      txHash: (event as any).txHash || '',
    }
  } catch (err) {
    console.error('Error parsing Soroban event:', err)
    return {
      id: event.id,
      ledger: event.ledger,
      ledgerClosedAt: event.ledgerClosedAt,
      contractId: event.contractId,
      topics: event.topic,
      value: event.value,
      txHash: (event as any).txHash || '',
    }
  }
}

/**
 * Simulate or execute a Stellar/Soroban transfer or smart contract investment.
 * Redirects to the Soroban contract fundFarm if it's a smart contract, or performs a classic payment.
 */
export async function simulateStellarTransfer(params: {
  fromAddress: string
  toAddress: string
  amount: number
  memo?: string
}): Promise<{ success: true; txHash: string } | { success: false; error: string }> {
  try {
    const { fundFarm } = await import('./contract')
    const cleanFrom = params.fromAddress.trim()
    const cleanTo = params.toAddress.trim()

    // If the destination address is a valid Soroban Contract ID (starts with 'C')
    if (cleanTo.startsWith('C')) {
      const res = await fundFarm({
        investorAddress: cleanFrom,
        amountUsdc: params.amount,
        contractAddress: cleanTo,
      })
      if (res.success) {
        return { success: true, txHash: res.txHash }
      }
      return { success: false, error: res.error || 'Contract call failed' }
    }

    // Otherwise, simulate/build a classic payment for demo
    const sdk = await StellarSdk()
    
    // Fetch sequence
    const sequenceRes = await fetch(`/api/sequence?address=${cleanFrom}`)
    if (!sequenceRes.ok) throw new Error('Could not fetch account sequence.')
    const sequenceData = await sequenceRes.json()
    if (!sequenceData.success || !sequenceData.sequence) throw new Error('Could not fetch account sequence.')

    const account = new sdk.Account(cleanFrom, sequenceData.sequence)
    const tx = new sdk.TransactionBuilder(account, {
      fee: sdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        sdk.Operation.payment({
          destination: cleanTo.startsWith('G') ? cleanTo : cleanFrom, // fallback to self if invalid
          asset: sdk.Asset.native(),
          amount: String(params.amount * 0.0001), // dummy scaling
        })
      )
      .setTimeout(300)
    
    if (params.memo) {
      tx.addMemo(sdk.Memo.text(params.memo.slice(0, 28)))
    }

    const builtTx = tx.build()
    const signed = await signWithFreighter(builtTx.toXDR())
    if ('error' in signed) {
      return { success: false, error: signed.error }
    }

    const submitted = await sendTransaction(signed.signedXdr)
    if (!submitted.success) {
      return { success: false, error: submitted.error }
    }

    return { success: true, txHash: submitted.data.hash }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Transfer failed' }
  }
}

// ─── Explorer / Lab helpers ───────────────────────────────────────────────────

/**
 * Get Stellar Expert explorer link for a transaction
 */
export function getTxExplorerUrl(txHash: string): string {
  return `${STELLAR_EXPERT_URL}/tx/${txHash}`
}

/**
 * Get Stellar Expert explorer link for an account
 */
export function getAccountExplorerUrl(address: string): string {
  return `${STELLAR_EXPERT_URL}/account/${address}`
}

/**
 * Build a Stellar Lab URL for signing a pre-built transaction XDR.
 * User can open this to sign & submit manually on the testnet.
 */
export function getStellarLabSignUrl(xdr: string): string {
  const encoded = encodeURIComponent(xdr)
  return `${STELLAR_LAB_URL}/#txsigner?xdr=${encoded}&network=test`
}

/**
 * Build a Stellar Lab URL to inspect a transaction XDR
 */
export function getStellarLabXdrUrl(xdr: string): string {
  const encoded = encodeURIComponent(xdr)
  return `${STELLAR_LAB_URL}/#xdr-viewer?input=${encoded}&type=TransactionEnvelope&network=test`
}

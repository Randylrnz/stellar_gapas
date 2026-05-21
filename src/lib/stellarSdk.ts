// Dynamic loader for @stellar/stellar-sdk
// Loaded client-side only to avoid SSR bundling issues with WASM/binary modules

let _sdk: typeof import('@stellar/stellar-sdk') | null = null

export async function StellarSdk() {
  if (!_sdk) {
    _sdk = await import('@stellar/stellar-sdk')
  }
  return _sdk
}

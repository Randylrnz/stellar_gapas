import { NextResponse } from 'next/server'

// Simulated fund farm endpoint
// In production: would validate signature and submit to Soroban
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { farmId, investorWallet, amount, txHash } = body

    if (!farmId || !investorWallet || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // In production:
    // 1. Verify txHash on Stellar horizon
    // 2. Create Investment record in DB
    // 3. Update farm.currentFunding
    // 4. Create Transaction record

    const investment = {
      id: `inv-${Date.now()}`,
      farmId,
      investorWallet,
      amount: parseFloat(amount),
      txHash,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ investment }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

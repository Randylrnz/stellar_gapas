import { NextResponse } from 'next/server'
import type { Farm } from '@/lib/types'
import { MOCK_FARMS } from '@/lib/mockData'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')
  const risk = searchParams.get('risk')

  let farms = [...MOCK_FARMS]

  if (status) farms = farms.filter(f => f.status === status)
  if (type === 'crop') farms = farms.filter(f => f.cropType)
  if (type === 'livestock') farms = farms.filter(f => f.livestockType)
  if (risk) farms = farms.filter(f => f.riskLevel === risk)

  return NextResponse.json({ farms, total: farms.length })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, cropType, livestockType, fundingGoal, farmerWallet } = body

    if (!name || !fundingGoal || !farmerWallet) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!cropType && !livestockType) {
      return NextResponse.json({ error: 'Either cropType or livestockType is required' }, { status: 400 })
    }

    // In production: save to database via Prisma
    const newFarm: Partial<Farm> = {
      id: `farm-${Date.now()}`,
      name,
      cropType,
      livestockType,
      fundingGoal: parseFloat(fundingGoal),
      currentFunding: 0,
      status: 'PENDING',
      farmerWallet,
      cooperativeEnabled: body.cooperativeEnabled || false,
      cooperativeId: body.cooperativeId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({ farm: newFarm }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

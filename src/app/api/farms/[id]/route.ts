import { NextResponse } from 'next/server'
import { MOCK_FARMS } from '@/lib/mockData'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const farm = MOCK_FARMS.find(f => f.id === id)

  if (!farm) {
    return NextResponse.json({ error: 'Farm not found' }, { status: 404 })
  }

  return NextResponse.json({ farm })
}

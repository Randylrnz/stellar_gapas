import { NextResponse } from 'next/server'

// Cooperative API route
export async function GET() {
  const { MOCK_COOPERATIVES } = await import('@/lib/mockData')
  return NextResponse.json({ cooperatives: MOCK_COOPERATIVES })
}

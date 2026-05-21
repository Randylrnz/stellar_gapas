import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: Request) {
  try {
    const { contractAddress } = await req.json()
    if (!contractAddress) {
      return NextResponse.json({ success: false, error: 'Missing contract address' }, { status: 400 })
    }

    const envPath = path.join(process.cwd(), '.env')
    let envContent = ''
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8')
    } else {
      envContent = ''
    }

    // Replace or add NEXT_PUBLIC_CONTRACT_ADDRESS
    const regex = /^NEXT_PUBLIC_CONTRACT_ADDRESS=.*$/m
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `NEXT_PUBLIC_CONTRACT_ADDRESS="${contractAddress}"`)
    } else {
      envContent += `\nNEXT_PUBLIC_CONTRACT_ADDRESS="${contractAddress}"`
    }

    fs.writeFileSync(envPath, envContent, 'utf8')

    return NextResponse.json({ success: true, contractAddress })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed to update .env' }, { status: 500 })
  }
}

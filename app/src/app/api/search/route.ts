import { NextRequest, NextResponse } from 'next/server';
import client from '@/src/lib/mongodb';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const searchTerm = searchParams.get('searchTerm');

  if (!searchTerm) {
    return NextResponse.json(
      { message: 'Search term is required' },
      { status: 400 }
    );
  }

  try {
    await client.connect();
    const db = client.db();
    const results = await db
      .collection('fixtures')
      .find({
        $or: [
          { home_team: { $regex: searchTerm, $options: 'i' } },
          { away_team: { $regex: searchTerm, $options: 'i' } }
        ]
      })
      .limit(10)
      .toArray();

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching fixtures:', error);
    return NextResponse.json(
      { message: 'Error searching fixtures' },
      { status: 500 }
    );
  }
} 
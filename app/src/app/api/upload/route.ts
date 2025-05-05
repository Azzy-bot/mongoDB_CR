import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse';
import client from '@/src/lib/mongodb';
import { Readable } from 'stream';
import { Document } from 'mongodb';

interface FixtureRecord extends Document {
  fixture_mid: string;
  season: number;
  competition_name: string;
  fixture_datetime: Date;
  fixture_round: string;
  home_team: string;
  away_team: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { message: 'No file found in the request' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const csvContent = Buffer.from(buffer).toString();

    // Parse CSV content
    const records = await new Promise<FixtureRecord[]>((resolve, reject) => {
      const parser = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
      });
      
      const parsedRecords: FixtureRecord[] = [];
      parser.on('readable', () => {
        let record;
        while ((record = parser.read()) !== null) {
          // Transform the data
          const transformedRecord: FixtureRecord = {
            ...record,
            season: parseInt(record.season, 10),
            fixture_datetime: new Date(record.fixture_datetime)
          };
          parsedRecords.push(transformedRecord);
        }
      });
      
      parser.on('error', (err) => {
        reject(err);
      });
      
      parser.on('end', () => {
        resolve(parsedRecords);
      });
    });

    // Connect to MongoDB
    await client.connect();
    const db = client.db();
    const collection = db.collection('fixtures');

    // Create unique index on fixture_mid if it doesn't exist
    try {
      await collection.createIndex({ fixture_mid: 1 }, { unique: true });
    } catch (error) {
      // Index might already exist, which is fine
      console.log('Index creation skipped (might already exist)');
    }

    // Use updateMany with upsert to handle duplicates
    const operations = records.map(record => ({
      updateOne: {
        filter: { fixture_mid: record.fixture_mid },
        update: { $set: record },
        upsert: true
      }
    }));

    const result = await collection.bulkWrite(operations);

    return NextResponse.json({
      message: 'File uploaded and processed successfully',
      insertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json(
      { message: 'Error processing upload' },
      { status: 500 }
    );
  }
} 
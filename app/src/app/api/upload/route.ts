import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse';
import client from '@/src/lib/mongodb';
import { Readable } from 'stream';
import { Document } from 'mongodb';

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
    const records = await new Promise<Document[]>((resolve, reject) => {
      const parser = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
      });
      
      const parsedRecords: Document[] = [];
      parser.on('readable', () => {
        let record;
        while ((record = parser.read()) !== null) {
          parsedRecords.push(record as Document);
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

    // Insert the records into MongoDB
    const result = await collection.insertMany(records);

    return NextResponse.json({
      message: 'File uploaded and processed successfully',
      insertedCount: result.insertedCount,
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json(
      { message: 'Error processing upload' },
      { status: 500 }
    );
  }
} 
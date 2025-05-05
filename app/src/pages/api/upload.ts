import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'csv-parse';
import client from '../../lib/mongodb';
import { Readable } from 'stream';
import { Document } from 'mongodb';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Parse the multipart form data
    const boundary = req.headers['content-type']?.split('boundary=')[1];
    if (!boundary) {
      throw new Error('No boundary found in content-type header');
    }

    const parts = buffer.toString().split(boundary);
    const filePart = parts.find(part => part.includes('filename="fixtures.csv"'));
    
    if (!filePart) {
      throw new Error('No file found in the request');
    }

    // Extract the CSV content
    const csvContent = filePart.split('\r\n\r\n')[1].trim();
    
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

    return res.status(200).json({
      message: 'File uploaded and processed successfully',
      insertedCount: result.insertedCount,
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return res.status(500).json({
      message: 'Error processing file',
      error: (error as Error).message,
    });
  }
} 
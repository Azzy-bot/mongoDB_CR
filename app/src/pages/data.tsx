import { GetServerSideProps } from 'next';
import client from '../lib/mongodb';

interface Fixture {
  _id: string;
  [key: string]: any; // This allows for dynamic fields from the fixtures collection
}

interface DataPageProps {
  fixtures: Fixture[];
}

export const getServerSideProps: GetServerSideProps<DataPageProps> = async () => {
  try {
    await client.connect();
    const db = client.db();
    const fixtures = await db
      .collection('fixtures')
      .find({})
      .toArray();

    return {
      props: {
        fixtures: JSON.parse(JSON.stringify(fixtures)),
      },
    };
  } catch (e) {
    console.error(e);
    return {
      props: {
        fixtures: [],
      },
    };
  }
};

export default function DataPage({ fixtures }: DataPageProps) {
  if (fixtures.length === 0) {
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">Database Data</h1>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                The database is currently empty. No documents were found in the fixtures collection.
                <br />
                You can upload data using the <a href="/upload" className="font-medium underline text-yellow-700 hover:text-yellow-600">upload page</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get all unique keys from the fixtures
  const headers = Array.from(
    new Set(fixtures.flatMap(fixture => Object.keys(fixture)))
  ).filter(key => key !== '_id');

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Database Data</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">ID</th>
              {headers.map(header => (
                <th key={header} className="px-4 py-2 border-b">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fixtures.map(fixture => (
              <tr key={fixture._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{fixture._id}</td>
                {headers.map(header => (
                  <td key={`${fixture._id}-${header}`} className="px-4 py-2 border-b">
                    {typeof fixture[header] === 'object'
                      ? JSON.stringify(fixture[header])
                      : fixture[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
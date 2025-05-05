'use client';

import { useState, useEffect } from 'react';

interface Fixture {
  _id: string;
  home_team: string;
  away_team: string;
  date: string;
  [key: string]: any;
}

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Fixture[]>([]);
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchFixtures = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?searchTerm=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
          throw new Error('Search failed');
        }
        const results = await response.json();
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching fixtures:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchFixtures, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Search Fixtures</h1>
      
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for a team..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isLoading && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map((fixture) => (
              <div
                key={fixture._id}
                onClick={() => setSelectedFixture(fixture)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{fixture.home_team}</span>
                    <span className="mx-2">vs</span>
                    <span className="font-medium">{fixture.away_team}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(fixture.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchTerm.length >= 2 && !isLoading && searchResults.length === 0 && (
          <div className="mt-4 text-center text-gray-500">
            No fixtures found matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Fixture Details Modal */}
      {selectedFixture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Fixture Details</h2>
              <button
                onClick={() => setSelectedFixture(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-500">Home Team</h3>
                  <p className="text-lg">{selectedFixture.home_team}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Away Team</h3>
                  <p className="text-lg">{selectedFixture.away_team}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-500">Date</h3>
                <p>{new Date(selectedFixture.date).toLocaleDateString()}</p>
              </div>

              {/* Display all other fields */}
              {Object.entries(selectedFixture)
                .filter(([key]) => !['_id', 'home_team', 'away_team', 'date'].includes(key))
                .map(([key, value]) => (
                  <div key={key}>
                    <h3 className="font-medium text-gray-500">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </h3>
                    <p>
                      {typeof value === 'object'
                        ? JSON.stringify(value)
                        : value}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
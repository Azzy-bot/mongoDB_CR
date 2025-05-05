'use client';

import { useState, useEffect } from 'react';
import './search-container.scss';

export interface Fixture {
  _id: string;
  home_team: string;
  away_team: string;
  fixture_datetime: Date;
  season: string;
  competition_name: string;
  fixture_round: string;
  [key: string]: any;
}

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Fixture[]>([]);
  const [expandedFixtureId, setExpandedFixtureId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleExpand = (fixtureId: string) => {
    setExpandedFixtureId(expandedFixtureId === fixtureId ? null : fixtureId);
  };

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
        const sortedResults = results.sort((a: Fixture, b: Fixture) => 
          new Date(a.fixture_datetime).getTime() - new Date(b.fixture_datetime).getTime()
        );
        setSearchResults(sortedResults);
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
    <div className="search-container">
      <div className="search-header">
        <h1>Search Fixtures</h1>
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for a team..."
          />
          {isLoading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          )}
        </div>
      </div>
      
      <div className="search-wrapper">
        {searchResults.length > 0 && (
          <div className="results-container">
            {searchResults.map((fixture) => (
              <div
                key={fixture._id}
                className={`result-item ${expandedFixtureId === fixture._id ? 'expanded' : ''}`}
              >
                <div 
                  className="result-header"
                  onClick={() => toggleExpand(fixture._id)}
                >
                  <div className="teams">
                    <div className="team-names">
                      <span>{fixture.home_team}</span>
                      <span className="vs"> vs </span>
                      <span>{fixture.away_team}</span>
                    </div>
                    <span className="date">
                      {new Date(fixture.fixture_datetime).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </span>
                  </div>
                  <div className="expand-arrow">
                    <svg 
                      className={expandedFixtureId === fixture._id ? 'expanded' : ''}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                <div className="expanded-content">
                  <div className="teams-grid">
                    <div className="team-info">
                      <h3>Home Team</h3>
                      <p>{fixture.home_team}</p>
                    </div>
                    <div className="team-info">
                      <h3>Away Team</h3>
                      <p>{fixture.away_team}</p>
                    </div>
                  </div>
                  
                  <div className="date-info">
                    <h3>Date Time</h3>
                    <p>{new Date(fixture.fixture_datetime).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}</p>
                  </div>

                  {Object.entries(fixture)
                    .filter(([key]) => !['_id', 'home_team', 'away_team', 'fixture_datetime'].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="additional-info">
                        <h3>{key}</h3>
                        <p>
                          {typeof value === 'object'
                            ? JSON.stringify(value)
                            : value}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {searchTerm.length >= 2 && !isLoading && searchResults.length === 0 && (
          <div className="no-results">
            No fixtures found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
} 
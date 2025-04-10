
import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MobileLayout from '@/components/layout/MobileLayout';
import PatientSearchResult from '@/components/common/PatientSearchResult';
import { useAppContext } from '@/context/AppContext';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ReturnType<typeof useAppContext>['patients']>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { searchPatients, patients } = useAppContext();

  useEffect(()=>{
    setHasSearched(true);
    setSearchResults(patients)
  }, [])
  
  const handleSearch = () => {
    const results = searchPatients(searchQuery);
    setSearchResults(!searchQuery ? patients : results);
    setHasSearched(true);
  };

  return (
    <MobileLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Find a Person</h1>
        
        <div className="mb-6">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter name to search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
              <Search size={20} className="mr-2" />
              Search
            </Button>
          </div>
        </div>
        
        {hasSearched && (
          <div>
            {searchResults.length > 0 ? (
              <div>
                <h2 className="text-lg font-medium mb-4">Search Results</h2>
                {searchResults.map((patient) => (
                  <PatientSearchResult key={patient.id} patient={patient} />
                ))} 
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-gray-600 mb-2">No results found for "{searchQuery}"</p>
                <p className="text-sm text-gray-500">
                  Try using a different name or check back later as lists are updated regularly.
                </p>
              </div>
            )}
          </div>
        )}
        
        {!hasSearched && (
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-600 mb-2">Search for a person affected by an emergency event</p>
            <p className="text-sm text-gray-500">
              Enter the name of the person you are looking for to see which hospital they may be at.
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default SearchPage;


import React, { useEffect, useState, useMemo } from 'react'; // Added useMemo
import { Search } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"; // Added Pagination imports
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MobileLayout from '@/components/layout/MobileLayout';
import PatientSearchResult from '@/components/common/PatientSearchResult';
import { useAppContext } from '@/context/AppContext';
import { useI18n } from '@/context/I18nContext'; // Import useI18n

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ReturnType<typeof useAppContext>['patients']>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Added currentPage state
  const itemsPerPage = 10; // Define items per page

  const { searchPatients, patients } = useAppContext();
  const { t } = useI18n(); // Initialize useI18n

  useEffect(()=>{
    setHasSearched(true);
    setSearchResults(patients)
  }, [])
  const handleSearch = () => {
    const results = searchPatients(searchQuery);
    setSearchResults(!searchQuery ? patients : results);
    setHasSearched(true);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Calculate pagination data
  const totalPages = useMemo(() => Math.ceil(searchResults.length / itemsPerPage), [searchResults, itemsPerPage]);
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return searchResults.slice(startIndex, endIndex);
  }, [searchResults, currentPage, itemsPerPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };


  return (
    <MobileLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">{t('searchPage.title')}</h1>
        
        <div className="mb-6">
          <div className="flex space-x-2">
            <Input
              placeholder={t('searchPage.inputPlaceholder')}
              value={searchQuery}
              onChange={(e) => {
                const newQuery = e.target.value;
                setSearchQuery(newQuery);
                // Trigger search immediately or update results based on query presence
                if (!newQuery) {
                  setSearchResults(patients); // Show all if query is cleared
                } else {
                  // Optionally, you could re-run search here or wait for button/enter
                  // For simplicity, let's assume results update dynamically or wait for explicit search
                  // If you want dynamic filtering as user types:
                  // const results = searchPatients(newQuery);
                  // setSearchResults(results);
                }
                setCurrentPage(1); // Reset page when query changes
              }}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
              <Search size={20} className="mr-2" />
              {t('searchPage.buttonText')}
            </Button>
          </div>
        </div>
        
        {hasSearched && (
          <div>
            {searchResults.length > 0 ? (
              <div>
                <h2 className="text-lg font-medium mb-4">{t('searchPage.resultsTitle')} ({searchResults.length})</h2>
                {paginatedResults.map((patient) => ( // Use paginatedResults
                  <PatientSearchResult key={patient.id} patient={patient} />
                ))}
                {totalPages > 1 && ( // Render pagination only if needed
                  <Pagination className="mt-6">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); handlePreviousPage(); }} 
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="text-sm px-3">
                          Page {currentPage} of {totalPages}
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); handleNextPage(); }} 
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-gray-600 mb-2">{t('searchPage.noResults.message', { searchQuery })}</p>
                <p className="text-sm text-gray-500">
                  {t('searchPage.noResults.suggestion')}
                </p>
              </div>
            )}
          </div>
        )}
        
        {!hasSearched && (
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-600 mb-2">{t('searchPage.default.message')}</p>
            <p className="text-sm text-gray-500">
              {t('searchPage.default.suggestion')}
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default SearchPage;

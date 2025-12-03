'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Globe, Building2, Map, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  streetsApi,
  type Street,
  type Country,
  type State,
  type City,
} from '@/lib/api/streets';
import { toast } from 'sonner';

export default function StreetsPage() {
  const [streets, setStreets] = useState<Street[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Pagination
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  // Load countries on mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (selectedCountry) {
      loadStates(selectedCountry);
      setSelectedState('');
      setSelectedCity('');
    } else {
      setStates([]);
      setCities([]);
    }
  }, [selectedCountry]);

  // Load cities when state or country changes
  useEffect(() => {
    if (selectedState) {
      loadCities({ stateId: selectedState });
      setSelectedCity('');
    } else if (selectedCountry) {
      loadCities({ countryId: selectedCountry });
      setSelectedCity('');
    } else {
      setCities([]);
    }
  }, [selectedState, selectedCountry]);

  // Load streets when offset changes (pagination)
  useEffect(() => {
    if (!isLoading && offset > 0) {
      searchStreets();
    }
  }, [offset]);

  const loadCountries = async () => {
    try {
      const response = await streetsApi.getCountries();
      if (response.success && response.data) {
        setCountries(response.data);
      }
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  const loadStates = async (countryId: string) => {
    try {
      const response = await streetsApi.getStatesByCountry(countryId);
      if (response.success && response.data) {
        setStates(response.data);
      }
    } catch (error) {
      console.error('Error loading states:', error);
    }
  };

  const loadCities = async (params: { stateId?: string; countryId?: string }) => {
    try {
      const response = await streetsApi.getCities(params);
      if (response.success && response.data) {
        setCities(response.data);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const searchStreets = async () => {
    setIsSearching(true);
    setIsLoading(true);
    try {
      const response = await streetsApi.searchStreets({
        query: searchQuery || undefined,
        countryId: selectedCountry || undefined,
        stateId: selectedState || undefined,
        cityId: selectedCity || undefined,
        limit,
        offset,
      });

      if (response.success && response.data) {
        setStreets(response.data.streets);
        setTotal(response.data.pagination.total);
      } else {
        toast.error(response.error || 'Failed to search streets');
      }
    } catch (error) {
      toast.error('Failed to search streets');
      console.error('Error searching streets:', error);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    searchStreets();
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCountry('');
    setSelectedState('');
    setSelectedCity('');
    setOffset(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Streets Platform
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Discover and contribute to the global street database
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Streets</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Query */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by street name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Location Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  <option value="">All Countries</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  State/Province
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  disabled={!selectedCountry}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm disabled:opacity-50"
                >
                  <option value="">All States</option>
                  {states.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedCountry && !selectedState}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm disabled:opacity-50"
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button type="submit" disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isLoading ? 'Loading...' : `${total} Street${total !== 1 ? 's' : ''} Found`}
          </h2>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">Loading streets...</p>
            </CardContent>
          </Card>
        ) : streets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Map className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">
                No streets found. Try adjusting your search filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {streets.map((street) => (
                <Card key={street.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{street.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {street.fullAddress && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {street.fullAddress}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                      {street.location.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {street.location.city}
                        </span>
                      )}
                      {street.location.state && (
                        <span>{street.location.state}</span>
                      )}
                      {street.location.country && (
                        <span>{street.location.country}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {street.contributionCount} contribution
                        {street.contributionCount !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {street.latitude.toFixed(4)}, {street.longitude.toFixed(4)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {total > limit && (
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {offset + 1} - {Math.min(offset + limit, total)} of {total}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setOffset(offset + limit)}
                  disabled={offset + limit >= total}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

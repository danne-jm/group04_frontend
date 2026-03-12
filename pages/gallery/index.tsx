import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import service from '../../services/artPiece.service';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search, Filter, X, ChevronDown, Grid, List, Heart, ShoppingCart, Calendar, Tag, Palette, Plus } from 'lucide-react';
import userService from '@/services/user.service';

interface ArtPiece {
  id: string;
  title: string;
  description: string;
  artist: string;
  price: number;
  tags: string[];
  year: number;
  url: string;
  publishOnMarket: boolean;
  userId: string;
  folderName: string;
  likedBy: string[];
  inCart: string[];
  createdAt: string;
  updatedAt: string;
}

const AllProductPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArtist, setSelectedArtist] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [yearRange, setYearRange] = useState({ min: 0, max: 0 });
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const [data, setData] = useState<ArtPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {

        const userX = await userService.getAllProducts();

        const result = await service.getAllProducts();
        console.log("Parsed JSON result:", result);

        let artPieces: ArtPiece[] = [];
        if (result.artPieces && Array.isArray(result.artPieces.artPieces)) {
          artPieces = result.artPieces.artPieces;
        } else if (Array.isArray(result.artPieces)) {
          artPieces = result.artPieces;
        } else if (Array.isArray(result)) {
          artPieces = result;
        }
        
        setData(artPieces);
        
        // Set initial price and year ranges
        if (artPieces.length > 0) {
          const prices = artPieces.map(p => p.price);
          const years = artPieces.map(p => p.year);
          setPriceRange({
            min: Math.min(...prices),
            max: Math.max(...prices)
          });
          setYearRange({
            min: Math.min(...years),
            max: Math.max(...years)
          });
        }
      } catch (e) {
        console.error("Error in fetcher:", e);
        setError("Failed to load art pieces");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Extract unique values for filters
  const artists = useMemo(() => 
    [...new Set(data.map(piece => piece.artist))].sort(), 
    [data]
  );
  
  const allTags = useMemo(() => 
    [...new Set(data.flatMap(piece => piece.tags))].sort(), 
    [data]
  );

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(artPiece => {
      const matchesSearch = artPiece.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           artPiece.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           artPiece.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesArtist = selectedArtist ? artPiece.artist === selectedArtist : true;
      
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.every(tag => artPiece.tags.includes(tag));
      
      const matchesPrice = artPiece.price >= priceRange.min && artPiece.price <= priceRange.max;
      
      const matchesYear = artPiece.year >= yearRange.min && artPiece.year <= yearRange.max;

      return matchesSearch && matchesArtist && matchesTags && matchesPrice && matchesYear;
    });

    // Sort the filtered data
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'artist':
          comparison = a.artist.localeCompare(b.artist);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'year':
          comparison = a.year - b.year;
          break;
        case 'newest':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [data, searchTerm, selectedArtist, selectedTags, priceRange, yearRange, sortBy, sortOrder]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedArtist('');
    setSelectedTags([]);
    if (data.length > 0) {
      const prices = data.map(p => p.price);
      const years = data.map(p => p.year);
      setPriceRange({
        min: Math.min(...prices),
        max: Math.max(...prices)
      });
      setYearRange({
        min: Math.min(...years),
        max: Math.max(...years)
      });
    }
  };

  if (loading) return (
    <div className='display-flex justify-center text-black min-h-screen bg-[#F9F2EA] flex items-start text-s pt-5'>
    <p>Loading...</p>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-[#F9F2EA] flex items-center justify-center">
      <div className="text-center">
        <p className="text-[#B78370] text-lg">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4 bg-[#C8977F] hover:bg-[#B78370]">
          Try Again
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F2EA] text-[#8A5A3B]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#F9F2EA] to-[#EFE5DD] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-light tracking-wider mb-4">Art Gallery</h1>
          <p className="text-lg text-[#A67C52] mb-6">Discover masterpieces from renowned artists</p>
          
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and View Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A67C52] w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title, artist, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-[#C8977F] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C8977F] bg-white"
            />
          </div>

          {/* View Mode and Filter Toggle */}
          <div className="flex gap-2">
            <div className="flex border border-[#C8977F] rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${viewMode === 'grid' ? 'bg-[#C8977F] text-white' : 'bg-white text-[#8A5A3B]'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${viewMode === 'list' ? 'bg-[#C8977F] text-white' : 'bg-white text-[#8A5A3B]'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
            
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-6 bg-white border border-[#C8977F] text-[#8A5A3B] hover:bg-[#C8977F] hover:text-white"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
              {(selectedArtist || selectedTags.length > 0) && (
                <span className="ml-2 bg-[#B78370] text-white rounded-full px-2 py-1 text-xs">
                  {(selectedArtist ? 1 : 0) + selectedTags.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedArtist || selectedTags.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedArtist && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#C8977F] text-white">
                <Palette className="w-4 h-4 mr-1" />
                {selectedArtist}
                <button
                  onClick={() => setSelectedArtist('')}
                  className="ml-2 hover:bg-[#B78370] rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedTags.map(tag => (
              <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#B78370] text-white">
                <Tag className="w-4 h-4 mr-1" />
                {tag}
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="ml-2 hover:bg-[#A67C52] rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-sm text-[#B78370] hover:text-[#8A5A3B] underline"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-72 bg-white rounded-lg border border-[#E8D7C9] p-6 h-fit lg:sticky lg:top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-[#A67C52] hover:text-[#8A5A3B]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Sort by</label>
                <div className="flex gap-2 mb-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-3 py-2 border border-[#C8977F] rounded focus:outline-none focus:ring-2 focus:ring-[#C8977F]"
                  >
                    <option value="title">Title</option>
                    <option value="artist">Artist</option>
                    <option value="price">Price</option>
                    <option value="year">Year</option>
                    <option value="newest">Newest</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-[#C8977F] rounded hover:bg-[#C8977F] hover:text-white"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>

              {/* Artist Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Artist</label>
                <select
                  value={selectedArtist}
                  onChange={(e) => setSelectedArtist(e.target.value)}
                  className="w-full px-3 py-2 border border-[#C8977F] rounded focus:outline-none focus:ring-2 focus:ring-[#C8977F]"
                >
                  <option value="">All Artists</option>
                  {artists.map((artist) => (
                    <option key={artist} value={artist}>
                      {artist}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-[#A67C52] mb-1">Minimum Price</label>
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-[#C8977F] rounded focus:outline-none focus:ring-2 focus:ring-[#C8977F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#A67C52] mb-1">Maximum Price</label>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-[#C8977F] rounded focus:outline-none focus:ring-2 focus:ring-[#C8977F]"
                    />
                  </div>
                </div>
              </div>

              {/* Year Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Year Range</label>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-[#A67C52] mb-1">From Year</label>
                    <input
                      type="number"
                      placeholder="From"
                      value={yearRange.min}
                      onChange={(e) => setYearRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-[#C8977F] rounded focus:outline-none focus:ring-2 focus:ring-[#C8977F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#A67C52] mb-1">To Year</label>
                    <input
                      type="number"
                      placeholder="To"
                      value={yearRange.max}
                      onChange={(e) => setYearRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-[#C8977F] rounded focus:outline-none focus:ring-2 focus:ring-[#C8977F]"
                    />
                  </div>
                </div>
              </div>

              {/* Tags Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Tags</label>
                
                {/* Custom Tag Input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Add custom tag..."
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
                    className="flex-1 px-3 py-2 text-sm border border-[#C8977F] rounded focus:outline-none focus:ring-2 focus:ring-[#C8977F]"
                  />
                  <button
                    onClick={handleAddCustomTag}
                    className="px-3 py-2 bg-[#C8977F] text-white rounded hover:bg-[#B78370] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-[#C8977F] text-white border-[#C8977F]'
                          : 'bg-white text-[#8A5A3B] border-[#C8977F] hover:bg-[#C8977F] hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={clearAllFilters}
                className="w-full bg-[#C8977F] hover:bg-[#B78370] text-white"
              >
                Clear All Filters
              </Button>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {filteredAndSortedData.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg border border-[#E8D7C9]">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-xl font-medium mb-2">No artworks found</h3>
                <p className="text-[#A67C52] mb-4">Try adjusting your search or filters</p>
                <Button
                  onClick={clearAllFilters}
                  className="bg-[#C8977F] hover:bg-[#B78370] text-white"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-6"
              }>
                {filteredAndSortedData.map((artPiece) => (
                  <div
                    key={artPiece.id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-[#E8D7C9] group ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div className={`relative overflow-hidden ${
                      viewMode === 'list' ? 'w-48 h-32 flex-shrink-0' : 'w-full h-64'
                    }`}>
                      <img
                        src={artPiece.url}
                        alt={artPiece.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                    </div>
                    
                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                      <div>
                        <h2 className="text-lg font-semibold text-[#8A5A3B] mb-1 group-hover:text-[#C8977F] transition-colors">
                          {artPiece.title}
                        </h2>
                        <p className="text-sm text-[#A67C52] mb-1">By: {artPiece.artist}</p>
                        <div className="flex items-center gap-2 text-xs text-[#B78370] mb-2">
                          <Calendar className="w-3 h-3" />
                          <span>{artPiece.year}</span>
                        </div>
                        
                        {viewMode === 'list' && (
                          <p className="text-sm text-[#8A5A3B] mb-3 line-clamp-2">{artPiece.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {artPiece.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-[#F0E8DC] text-[#8A5A3B] text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {artPiece.tags.length > 2 && (
                            <span className="px-2 py-1 bg-[#E8D7C9] text-[#A67C52] text-xs rounded-full">
                              +{artPiece.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className={`${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
                        <p className="text-lg font-bold text-[#8A5A3B] mb-3">
                          {Number(artPiece.price).toLocaleString('en-US', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })} €
                        </p>
                        
                        <div className={`${viewMode === 'list' ? 'flex gap-2' : 'flex justify-between items-center'}`}>
                          <div className="flex gap-2">
                            
                          </div>
                          
                          <Link href={`/product/${artPiece.id}`}>
                            <Button size="sm" className="bg-[#C8977F] hover:bg-[#B78370] text-white border-none rounded-lg">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProductPage;
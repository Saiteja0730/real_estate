import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ListingItem from '../components/ListingItem';

const Search = () => {
  const navigate = useNavigate();
  const [sidebardata, setSidebardata] = useState({
    searchTerm: '',
    type: 'all',
    parking: false,
    furnished: false,
    offer: false,
    sort: 'created_at',
    order: 'desc',
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const typeFromUrl = urlParams.get('type');
    const parkingFromUrl = urlParams.get('parking');
    const furnishedFromUrl = urlParams.get('furnished');
    const offerFromUrl = urlParams.get('offer');
    const sortFromUrl = urlParams.get('sort');
    const orderFromUrl = urlParams.get('order');

    if (
      searchTermFromUrl ||
      typeFromUrl ||
      parkingFromUrl ||
      furnishedFromUrl ||
      offerFromUrl ||
      sortFromUrl ||
      orderFromUrl
    ) {
      setSidebardata({
        searchTerm: searchTermFromUrl || '',
        type: typeFromUrl || 'all',
        parking: parkingFromUrl === 'true' ? true : false,
        furnished: furnishedFromUrl === 'true' ? true : false,
        offer: offerFromUrl === 'true' ? true : false,
        sort: sortFromUrl || 'created_at',
        order: orderFromUrl || 'desc',
      });
    }

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      setError(null);
      try {
        const searchQuery = urlParams.toString();
        console.log('Making API request with query:', searchQuery);
        console.log('Full URL:', `https://real-estate-nhro.onrender.com/listing/get?${searchQuery}`);
        
        const res = await fetch(`https://real-estate-nhro.onrender.com/listing/get?${searchQuery}`);
        console.log('API response status:', res.status);
        console.log('API response headers:', res.headers);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('API error response:', errorText);
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const contentType = res.headers.get('content-type');
        console.log('Content type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
          const text = await res.text();
          console.error('Non-JSON response:', text);
          throw new Error('Server returned non-JSON response');
        }

        const data = await res.json();
        console.log('Full API response:', data);

        // Check if data is an array or has a listings property
        let listingsData = data;
        if (Array.isArray(data)) {
          console.log('Response is direct array');
        } else if (data.listings) {
          console.log('Response has listings property');
          listingsData = data.listings;
        } else {
          console.error('Unexpected response format:', data);
          throw new Error('Unexpected response format from server');
        }

        // Ensure we have an array
        const listingsArray = Array.isArray(listingsData) ? listingsData : [];
        console.log('Final listings array:', listingsArray);

        // If no results, try a simpler search
        if (listingsArray.length === 0) {
          console.log('No results found, trying simpler search');
          
          // Try again without search term
          const simplerParams = new URLSearchParams();
          if (sidebardata.type !== 'all') {
            simplerParams.set('type', sidebardata.type);
          }
          
          const simplerRes = await fetch(`https://real-estate-nhro.onrender.com/listing/get?${simplerParams.toString()}`);
          const simplerData = await simplerRes.json();
          
          if (simplerData.listings && simplerData.listings.length > 0) {
            console.log('Found results with simpler search');
            setListings(simplerData.listings);
            setError('No exact matches found. Showing all listings of type ' + sidebardata.type);
            return;
          }
        }

        // If still no results, check if we have any listings at all
        if (listingsArray.length === 0) {
          console.log('Checking if any listings exist...');
          const checkRes = await fetch('https://real-estate-nhro.onrender.com/listing/get');
          const checkData = await checkRes.json();
          
          if (checkData.listings && checkData.listings.length === 0) {
            setError('No listings found in the database. Please try again later.');
          } else {
            setError('No listings found matching your criteria. Try searching with fewer filters.');
          }
        }

        setListings(listingsArray);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setListings([]);
        setShowMore(false);
        setError('Failed to fetch listings: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [location.search]);
  

  const handleChange = (e) => {
    if (
      e.target.id === 'all' ||
      e.target.id === 'rent' ||
      e.target.id === 'sale'
    ) {
      setSidebardata({ ...sidebardata, type: e.target.id });
    }

    if (e.target.id === 'searchTerm') {
      setSidebardata({ ...sidebardata, searchTerm: e.target.value });
    }

    if (
      e.target.id === 'parking' ||
      e.target.id === 'furnished' ||
      e.target.id === 'offer'
    ) {
      setSidebardata({
        ...sidebardata,
        [e.target.id]:
          e.target.checked || e.target.checked === 'true' ? true : false,
      });
    }

    if (e.target.id === 'sort_order') {
      const sort = e.target.value.split('_')[0] || 'created_at';

      const order = e.target.value.split('_')[1] || 'desc';

      setSidebardata({ ...sidebardata, sort, order });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set('searchTerm', sidebardata.searchTerm);
    urlParams.set('type', sidebardata.type);
    urlParams.set('parking', sidebardata.parking);
    urlParams.set('furnished', sidebardata.furnished);
    urlParams.set('offer', sidebardata.offer);
    urlParams.set('sort', sidebardata.sort);
    urlParams.set('order', sidebardata.order);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const onShowMoreClick = async () => {
    try {
      const numberOfListings = listings.length;
      const startIndex = numberOfListings;
      const urlParams = new URLSearchParams(location.search);
      urlParams.set('startIndex', startIndex);
      const searchQuery = urlParams.toString();
      
      const res = await fetch(`https://real-estate-nhro.onrender.com/listing/get?${searchQuery}`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await res.json();
      console.log('More listings response:', data);

      if (data.length < 9) {
        setShowMore(false);
      }

      setListings([...listings, ...data]);
    } catch (error) {
      console.error('Error fetching more listings:', error);
      setError('Failed to load more listings: ' + error.message);
    }
  };
  return (
    <div className='flex flex-col md:flex-row'>
    <div className='p-7  border-b-2 md:border-r-2 md:min-h-screen'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
        <div className='flex items-center gap-2'>
          <label className='whitespace-nowrap font-semibold'>
            Search Term:
          </label>
          <input
            type='text'
            id='searchTerm'
            placeholder='Search...'
            className='border rounded-lg p-3 w-full'
            value={sidebardata.searchTerm}
            onChange={handleChange}
          />
        </div>
        <div className='flex gap-2 flex-wrap items-center'>
          <label className='font-semibold'>Type:</label>
          <div className='flex gap-2'>
            <input
              type='checkbox'
              id='all'
              className='w-5'
              onChange={handleChange}
              checked={sidebardata.type === 'all'}
            />
            <span>Rent & Sale</span>
          </div>
          <div className='flex gap-2'>
            <input
              type='checkbox'
              id='rent'
              className='w-5'
              onChange={handleChange}
              checked={sidebardata.type === 'rent'}
            />
            <span>Rent</span>
          </div>
          <div className='flex gap-2'>
            <input
              type='checkbox'
              id='sale'
              className='w-5'
              onChange={handleChange}
              checked={sidebardata.type === 'sale'}
            />
            <span>Sale</span>
          </div>
          <div className='flex gap-2'>
            <input
              type='checkbox'
              id='offer'
              className='w-5'
              onChange={handleChange}
              checked={sidebardata.offer}
            />
            <span>Offer</span>
          </div>
        </div>
        <div className='flex gap-2 flex-wrap items-center'>
          <label className='font-semibold'>Amenities:</label>
          <div className='flex gap-2'>
            <input
              type='checkbox'
              id='parking'
              className='w-5'
              onChange={handleChange}
              checked={sidebardata.parking}
            />
            <span>Parking</span>
          </div>
          <div className='flex gap-2'>
            <input
              type='checkbox'
              id='furnished'
              className='w-5'
              onChange={handleChange}
              checked={sidebardata.furnished}
            />
            <span>Furnished</span>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <label className='font-semibold'>Sort:</label>
          <select
            onChange={handleChange}
            defaultValue={'created_at_desc'}
            id='sort_order'
            className='border rounded-lg p-3'
          >
            <option value='regularPrice_desc'>Price high to low</option>
            <option value='regularPrice_asc'>Price low to hight</option>
            <option value='createdAt_desc'>Latest</option>
            <option value='createdAt_asc'>Oldest</option>
          </select>
        </div>
        <button className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95'>
          Search
        </button>
      </form>
    </div>
    <div className='flex-1'>
      <h1 className='text-3xl font-semibold border-b p-3 text-slate-700 mt-5'>
        Listing results:
      </h1>
      <div className='p-7 flex flex-wrap gap-4'>
        {loading && (
          <p className='text-xl text-slate-700 text-center w-full'>
            Loading...
          </p>
        )}
        {error && (
          <p className='text-xl text-slate-700 text-center w-full'>
            {error}
          </p>
        )}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {Array.isArray(listings) && listings.length > 0 ? (
              listings.map((listing) => (
                <ListingItem key={listing._id} listing={listing} />
              ))
            ) : (
              <p className="text-xl text-slate-700 text-center w-full">
                No listings found
              </p>
            )}
          </div>
        )}
        {showMore && (
          <button
            onClick={onShowMoreClick}
            className="text-green-700 hover:underline p-7 text-center w-full"
          >
            Show more
          </button>
        )}
      </div>
    </div>
  </div>
  )
}

export default Search
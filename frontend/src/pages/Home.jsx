import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import SwiperCore from 'swiper';  
import 'swiper/css/bundle';
import ListingItem from '../components/ListingItem';

const Home = () => {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize Swiper modules
    SwiperCore.use([Navigation]);

    const fetchListings = async () => {
      try {
        // Fetch offer listings
        const offerRes = await fetch('http://localhost:3000/listing/get?offer=true&limit=4');
        if (!offerRes.ok) throw new Error('Failed to fetch offer listings');
        const offerData = await offerRes.json();
        setOfferListings(offerData.listings || []);
        // Fetch rent listings
        const rentRes = await fetch('http://localhost:3000/listing/get?type=rent&limit=4');
        if (!rentRes.ok) throw new Error('Failed to fetch rent listings');
        const rentData = await rentRes.json();
        setRentListings(rentData.listings || []);
       
        // Fetch sale listings
        const saleRes = await fetch('http://localhost:3000/listing/get?type=sale&limit=4');
        if (!saleRes.ok) throw new Error('Failed to fetch sale listings');
        const saleData = await saleRes.json();
        setSaleListings(saleData.listings || []);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setError('Failed to load listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Hero Section */}
      <div className='flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto'>
        <h1 className='text-slate-700 font-bold text-3xl lg:text-6xl'>
          Find your next <span className='text-slate-500'>perfect</span>
          <br />
          place with ease
        </h1>
        <div className='text-gray-400 text-xs sm:text-sm'>
          Bhavani Estate is the best place to find your next perfect place to
          live.
          <br />
          We have a wide range of properties for you to choose from.
        </div>
        <Link
          to={'/search'}
          className='text-xs sm:text-sm text-blue-800 font-bold hover:underline'
        >
          Let's get started...
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className='flex justify-center items-center min-h-[300px]'>
          <div className='text-xl text-slate-500'>Loading listings...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className='flex justify-center items-center min-h-[300px]'>
          <div className='text-xl text-red-500'>{error}</div>
        </div>
      )}

      {/* Swiper */}
     
      <Swiper navigation>
  {offerListings.length > 0 &&
    offerListings.map((listing) => (
      <SwiperSlide key={listing._id}>
        <img
          src={listing.imageUrls?.[0] || 'https://via.placeholder.com/1920x500'}
          alt="Listing"
          className="w-full h-[500px] object-cover"
        />
      </SwiperSlide>
    ))}
</Swiper>


      {/* Offer Listings */}
      {!loading && !error && offerListings.length > 0 && (
        <div className='max-w-6xl mx-auto p-3'>
          <div className='my-3'>
            <h2 className='text-2xl font-semibold text-slate-600'>Recent offers</h2>
            <Link className='text-sm text-blue-800 hover:underline' to={'/search?offer=true'}>
              Show more offers
            </Link>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {offerListings.map((listing) => (
              <ListingItem listing={listing} key={listing._id} />
            ))}
          </div>
        </div>
      )}

      {/* Rent Listings */}
      {!loading && !error && rentListings.length > 0 && (
        <div className='max-w-6xl mx-auto p-3'>
          <div className='my-3'>
            <h2 className='text-2xl font-semibold text-slate-600'>Recent places for rent</h2>
            <Link className='text-sm text-blue-800 hover:underline' to={'/search?type=rent'}>
              Show more places for rent
            </Link>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {rentListings.map((listing) => (
              <ListingItem listing={listing} key={listing._id} />
            ))}
          </div>
        </div>
      )}

      {/* Sale Listings */}
      {!loading && !error && saleListings.length > 0 && (
        <div className='max-w-6xl mx-auto p-3'>
          <div className='my-3'>
            <h2 className='text-2xl font-semibold text-slate-600'>Recent places for sale</h2>
            <Link className='text-sm text-blue-800 hover:underline' to={'/search?type=sale'}>
              Show more places for sale
            </Link>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {saleListings.map((listing) => (
              <ListingItem listing={listing} key={listing._id} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

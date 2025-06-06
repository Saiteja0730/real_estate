import React, { useState, useEffect } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'; 

const UpdateListing = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    imageFiles: [],
    name: '',
    description: '',
    address: '',
    type: '',
    bedrooms: '1',
    bathrooms: '1',
    regularPrice: '50',
    discountPrice: '0',
    parking: false,
    furnished: false,
    offer: false  
  });
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const auth = getAuth(app);
  const { currentUser } = useSelector((state) => state.user);
  const params = useParams();

  // Check authentication state
  useEffect(() => {
    if (!currentUser) {
      setError("Please sign in first");
      return;
    }
    
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  }, [auth]);

  useEffect(() => {
    const fetchListing = async () => {
     const listingId = params.listingId;
     const res = await fetch(`https://real-estate-nhro.onrender.com/listing/get/${listingId}`);
     const data = await res.json();
     if (data.success === false) {
        console.log(data.message)
        return;
     }
     setFormData(data.listing)
    }
    fetchListing(); 
  }, [])
 
  const handleImageSubmit = (e) => {
    if (!user) {
      console.error('User must be authenticated to upload images');
      return;
    }
    
    if(files.length > 0 && files.length <= 7) {
      setUploading(true);
      const promises = [];
      
      for(let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
      .then((urls) => {
        setFormData({...formData, imageUrls: formData.imageUrls.concat(urls)});
      })
      .catch((error) => {
        console.error('Error uploading images:', error);
      })
      .finally(() => {
        setUploading(false);
      });
    };

  }; 
   const storeImage = async (file) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage(app);
        const fileName = new Date().getTime() + file.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload progress: ${progress}%`);
          },  
          (error) => {
            console.error('Upload failed:', error.message || error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      })
   }


   const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index) 
    })
   }  

  const handleChange = (e) => {
   if(e.target.id === 'sale' || e.target.id === 'rent') {
    setFormData({...formData, type: e.target.id}) 
   }
   if(e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer') {
    setFormData({...formData, [e.target.id]: e.target.checked})   
   }
   if(e.target.type === 'number' || e.target.type === 'text' || e.target.type ==='textarea'){
    setFormData({...formData, [e.target.id]: e.target.value}) 
   } 

  };
   
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if(formData.imageUrls.length < 1) return setError('Please upload at least one image'); 
      if(+formData.regularPrice < +formData.discountPrice  ) return setError('Discount price should be less than regular price');
      setLoading(true);
      setError(false);
      const res = await (`https://real-estate-nhro.onrender.com/listing/update/${params.listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false){
        setError(data.message);
      }
      navigate(`/listing/${data.updatedListing._id}`); 
      console.log("Listing created successfully:", data);
    } catch (error) {
      setError(error.message);  
      setLoading(false);  
    }
  } 
   
  return (
    <main className='p-3 max-w-4xl mx-auto'>
      <h1 className='text-2xl font-semibold text-center my-5'>Update Listing</h1>
      <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
        {/* Left Side */}
        <div className='flex flex-col gap-4 flex-1'>
          <input
            type="text"
            placeholder='name'
            className='border p-2 rounded-lg'
            id='name'
            maxLength='62'
            minLength='10'
            required
            value={formData.name}
            onChange={handleChange}
          />
          <textarea
            placeholder='Description'
            className='border p-2 rounded-lg'
            id='description'
            required
            value={formData.description}
            onChange={handleChange}
          ></textarea>
          <input
            type="text"
            placeholder='Address'
            className='border p-2 rounded-lg'
            id='address'
            required
            value={formData.address}
            onChange={handleChange}
          />

          {/* Checkboxes */}
          <div className="flex gap-6 flex-wrap">
            <div className='flex gap-2'>
              <input type="checkbox" id='sale' className='w-5' onChange={handleChange} checked={formData.type === 'sale'}/>
              <span>Sale</span>
            </div>
            <div className='flex gap-2'>
              <input type="checkbox" id='rent' className='w-5' onChange={handleChange} checked={formData.type === 'rent'}/>
              <span>Rent</span>
            </div>
            <div className='flex gap-2'>
              <input type="checkbox" id='parking' className='w-5' onChange={handleChange} checked={formData.parking}/>
              <span>Parking spot</span>
            </div>
            <div className='flex gap-2'>
              <input type="checkbox" id='furnished' className='w-5' onChange={handleChange} checked={formData.furnished}/>
              <span>Furnished</span>
            </div>
            <div className='flex gap-2'>
              <input type="checkbox" id='offer' className='w-5' onChange={handleChange} checked={formData.offer} />
              <span>Offer</span>
            </div>
          </div>

          {/* Inputs for beds, baths, price */}
          <div className='flex gap-4 flex-wrap'>
            <div className='flex items-center gap-2'>
              <input
                type="number"
                id='bedrooms'
                min='1'
                max='10'
                required
                className='p-2 border border-gray-300 rounded-lg'
                value={formData.bedrooms}
                onChange={handleChange} 
              />
              <p>Beds</p>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type="number"
                id='bathrooms'
                min='1'
                max='10'
                required
                className='p-2 border border-gray-300 rounded-lg'
                value={formData.bathrooms}
                onChange={handleChange}   
              />
              <p>Baths</p>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type="number"
                id='regularPrice'
                min='50'
                max='100000'
                required
                className='p-2 border border-gray-300 rounded-lg'
                value={formData.regularPrice}
                onChange={handleChange}   
              />
              <div className='flex flex-col items-center'>
                <p>Regular price</p>
                <span className='text-xs'>(₹ / Month)</span>
              </div>
            </div>
            {formData.offer && (
            <div className='flex items-center gap-2'>
            <input
              type="number"
              id='discountPrice'
              min='0'
              max='100000'
              required
              className='p-2 border border-gray-300 rounded-lg'
              value={formData.discountPrice}
              onChange={handleChange}     
            />
              <div className='flex flex-col items-center'>
                <p>Discounted price</p>
                <span className='text-xs'>(₹ / Month)</span>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-col flex-1 gap-4">
          <p className='font-semibold'>
            Images:
            <span className='font-normal text-gray-600 ml-2'>
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className='flex gap-4'>
            <input
              onChange={(e)=>setFiles(e.target.files)}
              className='p-3 border border-gray-300 rounded w-full'
              type="file"
              id='images'
              accept='image/*'
              multiple
            />
            <button disabled={uploading}  type='button' onClick={handleImageSubmit} className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80'>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

            {
              formData.imageUrls.length > 0 && formData.imageUrls.map((url, index) => (
                <div key={url} className="flex justify-between p-3 border items-center">
                 <img src={url} alt="listing image" className='w-20 h-20 object-contain rounded-lg' />
                 <button type='button' onClick={() => handleRemoveImage(index)} className='text-red-700 hover:opacity-80'>
                   Remove
                 </button>
                </div>
              ))
            }

          <button disabled={loading || uploading}   className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
            {loading ? 'Updating...' : 'Update Listing'}  
          </button>
          {error && <p className='text-red-700 text-sm'>{error}</p> }
        </div>
      </form>
    </main>
  );
};

export default UpdateListing;
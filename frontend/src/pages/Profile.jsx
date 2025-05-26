import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from 'react'
import { getDownloadURL, getStorage, ref, uploadBytesResumable} from 'firebase/storage';
import { app } from "../firebase.js";
import {updateUserStart, updateUserSuccess, updateUserFailure, deleteUserStart, deleteUserSuccess, deleteUserFailure, signoutFailure, signoutStart, signoutSuccess} from "../redux/user/userSlice.js"
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const dispatch = useDispatch();
  const { currentUser,loading, error } = useSelector((state) => state.user);
  const token = useSelector((state) => state.user.token);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileuploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({
    avatar: currentUser?.avatar || '',
    name: currentUser?.username || '',
    email: currentUser?.email || ''
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  useEffect(() => {
    if (currentUser) {
      setFormData({
        avatar: currentUser.avatar || '',
        name: currentUser.username || '',
        email: currentUser.email || ''
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if(file) {
      handleFileUpload(file);
    }
  }, [file]);

  console.log('User state:', useSelector((state) => state.user));

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
        setUploadProgress(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
        console.error('Upload error:', error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then
        ((downloadURL) => 
          setFormData({...formData, avatar: downloadURL})
      );
      }
    );
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.id]: e.target.value})
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("this is form data", formData)
    try {

      dispatch(updateUserStart());
      const res = await fetch(`https://real-estate-nhro.onrender.com/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

        const data = await res.json();
        if (data.success === false) {
          dispatch(updateUserFailure(data.message));
          return;
        }
        dispatch(updateUserSuccess(data));
        setUpdateSuccess(true)
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  }

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      console.log('Current User Object:', currentUser);
      const res = await fetch(`https://real-estate-nhro.onrender.com/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      console.error('Delete request failed:', res.status, data);
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
      navigate('/signin');
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  }

  const handleSignout = async() => {
    try {
      dispatch(signoutStart());
      const res = await fetch('https://real-estate-nhro.onrender.com/auth/signout');
      const data = await res.json();
      console.error('Signout request failed:', res.status, data);
      if (data.success === false) {
        dispatch(signoutFailure(data.message));
        return;
      }
      dispatch(signoutSuccess(data));
      navigate('/signin');
    } catch (error) {
      dispatch(signoutFailure(error.message));
    }
  }

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);

      console.log('Current User:', currentUser);
      console.log('Token:', token);
      // Make the request with the token
      const res = await fetch(`https://real-estate-nhro.onrender.com/user/listings/${currentUser._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const data = await res.json();
      console.log('Response:', data);
      if (data.success === false ||  !res.ok) {
        console.error('Failed to fetch listings:', data);
        setShowListingsError(true);
        return;
      }
      setUserListings(data);  
      console.log('Listings fetched successfully:', data);
    } catch (error) {
      console.error('Error during fetch:', error);
      setShowListingsError(true);
    }
  };
  
     const handleListingDelete = async (listingId) => {
  try {
    const res = await fetch(`https://real-estate-nhro.onrender.com/listing/delete/${listingId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    // Check if response is successful
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Server error:', errorText);
      setShowListingsError(true);
      return;
    }

    // Try to parse JSON if available
    let data;
    try {
      data = await res.json();
    } catch (e) {
      console.error('Response is not JSON:', e);
      return;
    }

    if (data.success === false) {
      console.error('Delete failed:', data.message);
      setShowListingsError(true);
      return;
    }

    // Update listings state
    setUserListings((prev) =>
      prev.filter((listing) => listing._id !== listingId)
    );

  } catch (error) {
    console.error('Error deleting listing:', error);
    setShowListingsError(true);
  }
};
  return (
    <div className="p-3 max-w-lg mx-auto rounded-lg">
      <h1 className="text-3xl font-semibold text-center my-3">Profile</h1>
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="text-center text-blue-600 my-1">
          Uploading: {uploadProgress}%
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input onChange={(e) => setFile(e.target.files[0]) } type="file" ref={fileRef} hidden accept="image/*"/>
        <img
          onClick={(()=>fileRef.current.click())}
          src={ formData.avatar ||  currentUser?.avatar} 
          alt="profile"
          className="rounded-full h-20 w-20 object-cover cursor-pointer self-center mt-1 "
        />
        <p className="text-sm self-center">
          {fileuploadError ? 
        (<span className="text-red-600">Error Image upload</span>)  :
        filePerc > 0 && filePerc < 100 ? (
          <span className="text-green-600">{`Uploading ${filePerc}`}</span>)
          :
          filePerc === 100 ? (
            <span className="text-green-600">successfully uploaded!</span>)
            : (
              ''
            )}
        </p>
        <input
          type="text"
          placeholder="username"
          defaultValue={currentUser.username}
          id="name"
          className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="email"
          defaultValue={currentUser.email}
          id="email"
          className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={handleChange}
        />
        <input
          type="password"
          id="password"
          className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={handleChange}
        />
        <button disabled={loading} className="bg-slate-600 text-white rounded-lg p-2 uppercase hover:opacity-90 disabled:opacity-80">
          {loading ? 'loading...' : 'Update'}
        </button>

        <Link className="bg-green-700 text-white p-2 rounded-lg uppercase hover:opacity-80" to="/create-listing">
        Create Listing
        </Link>

      </form>

      <div className="flex justify-between mt-3">
        <span onClick={handleDeleteUser} className="text-red-600 cursor-pointer">Delete account</span>
        <span onClick={handleSignout} className="text-red-600 cursor-pointer">Sign out</span>
      </div>
      <div className="flex justify-between mt-3">
        <p className="text-red-600">{error ? error : ''}</p>
        <p className="text-green-700 mt-3">{updateSuccess ? 'User updated successfully' : ''}</p>
      </div>
      <button onClick={handleShowListings} className="text-green-700 w-full rounded-lg  hover:opacity-80">Show Listings</button>
      <p className="text-red-700 mt-5">{showListingsError ? 'Error showing listings' : ''} </p>
      {userListings && userListings.length > 0 && userListings.map((listing) => <div key={listing._id}
      className="border rounded-lg p-3 flex justify-between items-center gap-4">
        <Link to={`/listing/${listing._id}`}>{listing.title}
        <img src={listing.imageUrls[0]} alt="listing cover"
        className="h-16 w-16 object-contain" />  
        </Link>
        <Link className="text-slate-7 font-semibold hover:underline truncate flex-1" to={`/listing/${listing._id}`}>
        <p>{listing.name}</p>
        </Link> 

         <div className="flex flex-col items-center gap-2">
         <button onClick={()=>handleListingDelete(listing._id)} className="text-red-600 uppercase"  >Delete</button>
          <Link to={`/update-listing/${listing._id}`}>
         <button className="text-green-600 uppercase"  >Edit</button>    
         </Link>
         </div>

      </div>)}
    </div>
  );
};

export default Profile;

 //  Firebase storage
      // allow read;
      // allow write:if 
      // request.resource.size < 2 * 1024 * 1024 &&
      // request.resource.contentType.matches('image/.*')
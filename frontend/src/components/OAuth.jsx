import { GoogleAuthProvider, getAuth, signInWithPopup,  } from 'firebase/auth';
import { app } from '../firebase.js';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';

const OAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider(); 
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);

      const res = await fetch('https://real-estate-nhro.onrender.com/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });
      
      const data = await res.json();
      
      if (res.status !== 200) {
        throw new Error(data.message || 'Authentication failed');
      }
      
      // Extract token from cookie
      const cookies = document.cookie.split('; ').find(row => row.startsWith('access_token='));
      const token = cookies ? cookies.split('=')[1] : null;

      // Store user data in Redux
      dispatch(signInSuccess({
        ...data,
        name: result.user.displayName,
        email: result.user.email,
        avatar: result.user.photoURL,
        _id: data._id,
        token
      }));
      navigate('/');
    } catch (error) {
      console.log('Could not sign in with google', error)  
    }
  }

  return (
  <div>
    <button onClick={handleGoogleClick} type='button' className='bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-85 w-full'>Continue with google</button>
  </div>
  )
}

export default OAuth

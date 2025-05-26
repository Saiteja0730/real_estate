import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {signInStart, signInSuccess, signInFailure, setUser} from '../redux/user/userSlice.js';
import OAuth from '../components/OAuth.jsx';


const Signin = () => {

  const [formData, setFormData] = useState({ email: '', password: '' });
  const { loading, error } = useSelector((state) => state.user);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    dispatch(signInStart());
    const res = await fetch('https://real-estate-nhro.onrender.com/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) {
      dispatch(signInFailure(data.message || 'Sign in failed'));
      return;
    }
    if (data.success) {
      dispatch(setUser({
        currentUser: data,
        token: data.token, 
        error: null,
        loading: false
      }));
      dispatch(signInSuccess(data));
      navigate('/');
    }
  } catch (error) {
    dispatch(signInFailure(error.message || 'Network error'));
  }
};


  console.log(formData)

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign In </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        <input
          type="email"
          placeholder="email"
          className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-700"
          id="email"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-700"
          id="password"
          onChange={handleChange}
        />
        <button disabled={loading} className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
          {loading ? 'Loading...' : 'Sign In'}
        </button>
        <OAuth/>
      </form>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div className='flex gap-2 mt-5'>
        <p>Dont have an account?</p>
        <Link to='/signup'>
        <span className='text-blue-700'>Sign up</span>
        </Link>
      </div>

    </div>
  )
}

export default Signin



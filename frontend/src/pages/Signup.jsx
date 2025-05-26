import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';

const Signup = () => {

  const [formData, setFormData] = useState({})
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(
      {
        ...formData,
        [e.target.id]: e.target.value,
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/auth/signup',{
      method: 'POST',
      headers:{
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    navigate('/signin');
    if (!res.ok) {
      setLoading(false);
      setError(data.message);
      return;
    }
    // handle success (e.g., redirect or show success message)
    setLoading(false);
    // console.log(data)
  }

  // console.log(formData)

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign Up </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="username"
          className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-700"
          id="username"
          onChange={handleChange}
        />
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
          {loading ? 'Loading...' : 'Sign Up'}
        </button>
        <OAuth/>
      </form>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div className='flex gap-2 mt-5'>
        <p>Have an account?</p>
        <Link to='/signin'>
        <span className='text-blue-700'>Sign in</span>
        </Link>
      </div>

    </div>
  )
}

export default Signup


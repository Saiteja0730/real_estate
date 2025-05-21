import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
    
const Contact = ({listing}) => {
    const [landlord, setLandlord] = useState(null);
    const [message, setMessage] = useState(''); 
    const token = localStorage.getItem('token');
    
    const onChange = (e) => {
        setMessage(e.target.value);
    };  

    useEffect(() => {
        const fetchLandlord = async () => {
            try {
                const res = await fetch(`http://localhost:3000/user/${listing.userRef}`,{
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                const data = await res.json();
                setLandlord(data);
            } catch (error) {
                console.error('Error fetching landlord:', error);
            }
        };
        fetchLandlord();
    }, [listing.userRef]);
    
  return (
    <>
    {landlord && (
        <div className='flex flex-col gap-2'>
          <p>
            Contact <span className='font-semibold'>{landlord.username}</span>{' '}
            for{' '}
            <span className='font-semibold'>{listing.name.toLowerCase()}</span>
          </p>
          <textarea
            name='message'
            id='message'
            rows='2'
            value={message}
            onChange={onChange}
            placeholder='Enter your message here...'
            className='w-full border p-3 rounded-lg'
          ></textarea>

          <Link
          to={`mailto:${landlord.email}?subject=Regarding ${listing.name}&body=${message}`}
          className='bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95'
          >
            Send Message          
          </Link>
        </div>
      )}
    </>
  )
}

export default Contact
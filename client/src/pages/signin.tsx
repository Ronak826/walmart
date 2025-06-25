import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Signin() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const naigate=useNavigate();
  const handleSignin = async (e:any) => {
    e.preventDefault();

    try {
      const res = await axios.post('https://walmart-xjjd.onrender.com/api/auth/signin', { email });

      localStorage.setItem('token', res.data.token);
      naigate("/")
      setMessage('✅ Signin successful!');
    } catch (err) {
      console.error(err);
      setMessage('❌ Signin failed. Check email.');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSignin} className="bg-white p-8 rounded shadow-md w-96 space-y-4">
        <h1 className="text-3xl font-bold text-center text-blue-600">HelpOnRoute</h1>

        <input
          type="email"
          className="w-full border border-gray-300 p-2 rounded"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Sign In
        </button>

        {message && <p className="text-center mt-2 text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  );
}

export default Signin;

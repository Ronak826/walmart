import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';

function Signup() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const res = await axios.post('https://walmart-xjjd.onrender.com/api/auth/signup', { email });
      localStorage.setItem('token', res.data.token);
      navigate('/');
      setMessage('✅ Signup successful!');
    } catch (err) {
      console.error(err);
      setMessage('❌ Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <svg viewBox="0 0 100 32" className="h-12 w-auto">
              <path
                fill="#0071DC"
         //       d="M8.56 16.18c0 1.35.86 2.24 2.33 2.24 1.44 0 2.3-.89 2.3-2.24V8.72h3.36v7.46c0 3.2-1.96 5.2-5.66 5.2-3.67 0-5.63-2-5.63-5.2V8.72h3.3v7.46zm12.5-7.46h3.3v10.66h-3.3V8.72zm6.6 0h3.3v10.66h-3.3V8.72zm12.5 0h-3.3v7.46c0 1.35-.86 2.24-2.3 2.24-1.47 0-2.33-.89-2.33-2.24V8.72h-3.36v7.46c0 3.2 1.96 5.2 5.63 5.2 3.7 0 5.66-2 5.66-5.2V8.72zm12.5 0h-3.3v10.66h3.3V8.72zm6.6 0h-3.3v10.66h3.3V8.72zm12.5 0h-5.66v10.66h3.3v-3.9h2.36c3.7 0 5.66-1.5 5.66-3.9 0-2.4-1.96-3.86-5.66-3.86zm-.03 5.1h-2.33v-2.4h2.33c1.47 0 2.33.5 2.33 1.2s-.86 1.2-2.33 1.2z"
              />
            </svg>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email to sign up for HelpOnRoute
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-md sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSignup}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </>
                  ) : 'Sign up'}
                </button>
              </div>

              {message && (
                <div className={`rounded-md p-4 ${message.includes('✅') ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className={`text-sm ${message.includes('✅') ? 'text-green-800' : 'text-red-800'}`}>
                    {message}
                  </div>
                </div>
              )}
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Already have an account?{" "}
                    <button onClick={() => navigate("/signin")} className="text-blue-600 hover:underline ml-1">
                      Sign in
                    </button>
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;

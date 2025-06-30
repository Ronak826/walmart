import  { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

function MyProfile() {
  const [driverDetails, setDriverDetails]:any = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const decode:any = jwtDecode(token);

    const getDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`https://walmart-xjjd.onrender.com/api/driver/details/${decode.userid}`);
        setDriverDetails(res.data.driver);
      } catch (error) {
        console.error("Error fetching driver details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getDetails();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  if (!driverDetails) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Failed to load driver details</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Profile Header */}
            <div className="bg-blue-600 p-6 text-white">
              <h1 className="text-2xl font-bold">Driver Profile</h1>
              <p className="text-blue-100">Manage your account details</p>
            </div>
            
            {/* Profile Content */}
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Picture Section */}
                <div className="w-full md:w-1/3 flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-blue-100">
                      <LazyLoadImage
                        src={driverDetails.driverimage || "https://via.placeholder.com/150"}
                        alt={`Driver ${driverDetails.name}`}
                        effect="blur"
                        className="w-full h-full object-cover"
                        placeholderSrc="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlZWVlZWUiLz48L3N2Zz4="
                      />
                    </div>
                    <span className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      ID: {driverDetails.id}
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-800">{driverDetails.name}</h2>
                    <p className="text-sm text-gray-600">{driverDetails.email}</p>
                    <div className="mt-2 flex items-center justify-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        driverDetails.status === 'AVAILABLE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {driverDetails.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Profile Details Section */}
                <div className="w-full md:w-2/3">
                  <div className="space-y-6">
                    {/* Personal Information Card */}
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Phone Number</p>
                          <p className="font-medium">{driverDetails.phoneNo || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-medium">{driverDetails.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Member Since</p>
                          <p className="font-medium">
                            {new Date(driverDetails.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Last Updated</p>
                          <p className="font-medium">
                            {new Date(driverDetails.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Vehicle Information Card */}
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        Vehicle Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Vehicle Number</p>
                          <p className="font-medium">{driverDetails.vehicleNo}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Current Location</p>
                          <p className="font-medium">
                            {driverDetails.latitude.toFixed(6)}, {driverDetails.longitude.toFixed(6)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats Card */}
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Statistics
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-blue-600">{driverDetails.helpsCount}</p>
                          <p className="text-xs text-gray-500">Helps Provided</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-green-600">{driverDetails.coins}</p>
                          <p className="text-xs text-gray-500">Reward Coins</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-yellow-600">0</p>
                          <p className="text-xs text-gray-500">Ratings</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-3">
                <button className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MyProfile; 
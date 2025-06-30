// imports
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { jwtDecode } from "jwt-decode";
import HelpModal from "../model/Helpmodel";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import socket from "../socket/socket";

import "leaflet/dist/leaflet.css";

// 🔁 Fetch road-based route using OpenRouteService
const getRouteCoordinates = async (from: any, to: any) => {
  const response = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "5b3ce3597851110001cf62489d93fe0999b74acdbc7f75a2acabdabb", // 🧠 Replace with your actual key
    },
    body: JSON.stringify({
      coordinates: [
        [from.lng, from.lat],
        [to.lng, to.lat]
      ]
    }),
  });

  const data = await response.json();
  return data.features[0].geometry.coordinates.map(([lng, lat]: any) => [lat, lng]);
};

// 📏 Distance Calculation
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

function Dashboard() {
  const [name, setName]: any = useState("");
  const [locationInfo, setLocationInfo]: any = useState(null);
  const [id, setId]: any = useState();
  const [isModalOpen, setIsModalOpen]: any = useState(false);
  const [allDrivers, setAllDrivers]: any = useState([]);
  const [helpAccepted, setHelpAccepted]: any = useState(null);
  const [helpSent, setHelpSent]: any = useState(false);
  const [routeCoords, setRouteCoords]: any = useState([]);
  const [showDrivers, setShowDrivers] = useState(false); // New state for showing drivers

  // Demo drivers data
  const demoDrivers = [
    { name: "Ritesh", phone: "8265097155" },
    { name: "Jayesh K", phone: "8767955108" }
  ];

  const openHelpModal = () => setIsModalOpen(true);
  const closeHelpModal = () => setIsModalOpen(false);
  const toggleDrivers = () => setShowDrivers(!showDrivers);

  const handleSend = async (formData: FormData) => {
    console.log(formData)
    try {
      
    formData.append("latitude", locationInfo.latitude);
    formData.append("longitude", locationInfo.longitude);
    formData.append("requesterId", id);
    
  

    const res = await axios.post(
      "https://walmart-xjjd.onrender.com/api/request/help-request",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );
      const helpRequestId = res.data.helpRequest.id;
      socket.emit("send-help-request", { helpRequestId });

      setHelpSent(true);
      closeHelpModal();
    } catch (error) {
      console.error("Error sending help request:", error);
      alert("Failed to send help request. Please try again.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      if (decoded?.name) {
        setName(decoded.name);
        setId(decoded.userid);
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocationInfo({ latitude, longitude });

          axios.get("https://walmart-xjjd.onrender.com/api/drivers")
            .then((res) => {
              const nearbyDrivers = res.data.drivers.filter((driver: any) =>
                getDistanceFromLatLonInKm(
                  latitude,
                  longitude,
                  driver.latitude,
                  driver.longitude
                ) <= 6
              );
              setAllDrivers(nearbyDrivers);
            })
            .catch((err) => {
              console.error("Failed to fetch drivers", err);
            });
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  useEffect(():any => {
    const handleHelpAccepted = (data: any) => {
      setHelpAccepted(data);
      setHelpSent(false);
    };

    socket.on("help-accepted", handleHelpAccepted);
    return () => socket.off("help-accepted", handleHelpAccepted);
  }, []);

  
  useEffect(() => {
    const fetchRoute = async () => {
      if (helpAccepted?.helperId && locationInfo) {
        const from = { lat: locationInfo.latitude, lng: locationInfo.longitude };
        const to = {
          lat: helpAccepted.location.latitude,
          lng: helpAccepted.location.longitude,
        };
        try {
          const coords = await getRouteCoordinates(from, to);
          setRouteCoords(coords);
        } catch (err) {
          console.error("Failed to fetch route", err);
        }
      }
    };
    fetchRoute();
  }, [helpAccepted, locationInfo]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side — info */}
          <div className="w-full lg:w-1/2 space-y-6">
          {!helpAccepted &&  <div className="bg-white rounded-xl shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">📋</span>
                Dashboard
              </h1>

              {/* Info cards */}
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">👤</span>
                  <div>
                    <p className="text-sm text-gray-500">Your name</p>
                    <p className="font-medium text-gray-800">{name}</p>
                  </div>
                </div>

                {/* Location */}
                {locationInfo ? (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">📍</span>
                      <p className="text-sm text-gray-500">Your current location</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pl-11">
                      <div>
                        <p className="text-xs text-gray-500">Latitude</p>
                        <p className="font-medium text-gray-800">
                          {locationInfo.latitude.toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Longitude</p>
                        <p className="font-medium text-gray-800">
                          {locationInfo.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center">
                    <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">📡</span>
                    <p>Fetching your location...</p>
                  </div>
                )}

                {/* Help Button */}
                <button
                  onClick={openHelpModal}
                  className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center transition-all ${helpSent ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                  disabled={helpSent}
                >
                  <span className="mr-2">🚨</span>
                  {helpSent ? 'Help Request Sent' : 'Need Help'}
                </button>

                {/* Nearby Drivers Button */}
                <button
                  onClick={toggleDrivers}
                  className="w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white transition-all"
                >
                  <span className="mr-2">👥</span>
                  {showDrivers ? 'Hide Nearby Drivers' : 'Show Nearby Drivers'}
                </button>

                {/* Drivers List */}
                {showDrivers && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="font-medium text-gray-800 mb-3">Nearby Drivers</h3>
                    <div className="space-y-3">
                      {demoDrivers.map((driver, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">🚗</span>
                            <div>
                              <p className="font-medium">{driver.name}</p>
                            </div>
                          </div>
                          <a 
                            href={`tel:${driver.phone}`}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                          >
                            Call: {driver.phone}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
}
            <HelpModal isOpen={isModalOpen} onClose={closeHelpModal} onSend={handleSend} />
         
            {/* Accepted info */}
           {helpAccepted && (
  <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
    {/* Header */}
    <div className="bg-blue-600 p-4 text-white">
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <h2 className="text-lg font-bold">Help is on the way!</h2>
      </div>
      <p className="text-sm opacity-90 mt-1">Helper has accepted your request</p>
    </div>

    {/* Helper Profile */}
    <div className="p-5">
      <div className="flex items-start">
        {/* Helper Photo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-blue-100 overflow-hidden border-2 border-blue-500 flex items-center justify-center">
            {helpAccepted.driverphoto ? (
              <img 
                src={helpAccepted.driverphoto} 
                alt={helpAccepted.helperName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-blue-600">
                {helpAccepted.helperName.charAt(0)}
              </span>
            )}
          </div>
          <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            🛠️ Helper
          </span>
        </div>

        {/* Helper Info */}
        <div className="ml-4 flex-1">
          <h3 className="font-bold text-lg text-gray-800">{helpAccepted.helperName}</h3>
          
          {/* Vehicle Info */}
          {helpAccepted.vehicleno && (
            <div className="flex items-center mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="text-sm text-gray-600">Vehicle: {helpAccepted.vehicleno}</span>
            </div>
          )}

          {/* Driver Number */}
          {helpAccepted.driverno && (
            <div className="flex items-center mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-sm text-gray-600">Driver ID: {helpAccepted.driverno}</span>
            </div>
          )}
        </div>
      </div>

      {/* Issue Details */}
      <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-2">Your Reported Issue</h4>
        <div className="flex items-start">
          <span className="bg-red-100 text-red-600 p-1 rounded mr-2 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </span>
          <div>
            <p className="font-medium text-gray-800">{helpAccepted.issue}</p>
            {helpAccepted.description && (
              <p className="text-sm text-gray-600 mt-1">{helpAccepted.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview */}
     

      {/* Distance and Contact */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-600 mb-1">Distance</p>
          <p className="font-bold text-blue-800">
            {getDistanceFromLatLonInKm(
              helpAccepted.location.latitude,
              helpAccepted.location.longitude,
              locationInfo.latitude,
              locationInfo.longitude
            ).toFixed(2)} km
          </p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xs text-green-600 mb-1">Estimated Time</p>
          <p className="font-bold text-green-800">
            ~{(getDistanceFromLatLonInKm(
              helpAccepted.location.latitude,
              helpAccepted.location.longitude,
              locationInfo.latitude,
              locationInfo.longitude
            ) * 2).toFixed(0)} mins
          </p>
        </div>
      </div>

      {/* Contact Buttons */}
      <div className="mt-4 flex space-x-2">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Call Helper
        </button>
        <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Message
        </button>
      </div>

      {/* Track Button */}
     
    </div>
  </div>
)}
          </div>

          {/* Right side — map */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-xl shadow-sm p-4 h-full">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">🗺️</span>
                Location Map
              </h2>
              {locationInfo && (
                <div className="h-[500px] rounded-lg overflow-hidden">
                  <MapContainer
                    //@ts-ignore
                    center={[locationInfo.latitude, locationInfo.longitude]}
                    zoom={14}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* You marker */}
                    <Marker position={[locationInfo.latitude, locationInfo.longitude]}>
                      <Popup>You</Popup>
                    </Marker>

                    {/* Drivers */}
                    {allDrivers.map((driver: any) => (
                      <Marker
                        key={driver.id}
                        position={[driver.latitude, driver.longitude]}
                      >
                        <Popup>{driver.name}</Popup>
                      </Marker>
                    ))}

                    {/* Helper */}
                    {helpAccepted?.helperId && (
                      <Marker
                        position={[helpAccepted.location.latitude, helpAccepted.location.longitude]}
                      >
                        <Popup>Helper</Popup>
                      </Marker>
                    )}

                    {/* Route */}
                    {routeCoords.length > 0 && (
                      <Polyline positions={routeCoords} color="blue" weight={4} />
                    )}
                  </MapContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
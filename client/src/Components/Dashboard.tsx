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

  const handleSend = async ({issue,description}:any) => {
    console.log(description)
    try {
      const res = await axios.post("https://walmart-xjjd.onrender.com/api/request/help-request", {
        latitude: locationInfo.latitude,
        longitude: locationInfo.longitude,
        requesterId: id,
        issue,
        description,
      });

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

  // 🎯 Fetch route when help is accepted
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
            <div className="bg-white rounded-xl shadow-sm p-6">
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

            <HelpModal isOpen={isModalOpen} onClose={closeHelpModal} onSend={handleSend} />

            {/* Accepted info */}
            {helpAccepted && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-blue-800 mb-2">Help Accepted 🚨</h2>
                <p className="text-sm text-gray-600 mb-2">Helper: {helpAccepted.helperName}</p>
                <p className="text-sm text-gray-600 mb-2">Issue: {helpAccepted.issue}</p>
                <p className="text-sm text-gray-600 mb-2">
                  Distance: {
                    getDistanceFromLatLonInKm(
                      helpAccepted.location.latitude,
                      helpAccepted.location.longitude,
                      locationInfo.latitude,
                      locationInfo.longitude
                    ).toFixed(2)
                  } km
                </p>
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
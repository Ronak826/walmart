import { useEffect, useState, useRef } from "react";
import Navbar from "./Navbar";
import { jwtDecode } from "jwt-decode";
import socket from "../socket/socket";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import siren from "../assets/Siren.mp3";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useNavigate } from "react-router-dom";
import L from "leaflet";

// const redIcon = new L.Icon({
//   iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41],
// });
const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function getDistanceFromLatLonInKm(lat1: any, lon1: any, lat2: any, lon2: any) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: any) {
  return deg * (Math.PI / 180);
}

async function getRouteCoordinates(from: any, to: any) {
  try {
    const response = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "5b3ce3597851110001cf62489d93fe0999b74acdbc7f75a2acabdabb",
      },
      body: JSON.stringify({
        coordinates: [
          [from.longitude, from.latitude],
          [to.longitude, to.latitude],
        ],
      }),
    });
    const data = await response.json();
    return data.features[0].geometry.coordinates.map(([lng, lat]: any) => [lat, lng]);
  } catch (error) {
    console.error("Error fetching route:", error);
    return [
      [from.latitude, from.longitude],
      [to.latitude, to.longitude]
    ];
  }
}

function HelpDashboard() {
  const [helpRequests, setHelpRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [helperLocation, setHelperLocation] = useState<any>(null);
  const [helperName, setHelperName] = useState("");
  const [allDrivers, setAllDrivers] = useState<any[]>([]);
  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const navigate=useNavigate();
  const notificationRef = useRef<HTMLAudioElement | null>(null);

  const staticHelperLocation = {
    latitude: 21.1465,
    longitude: 79.067,
  };

  useEffect(() => {
    notificationRef.current = new Audio(siren);
  }, []);

  useEffect(() => {
    axios
      .get("https://walmart-xjjd.onrender.com/api/drivers")
      .then((res) => setAllDrivers(res.data.drivers))
      .catch((err) => console.error("Failed to fetch drivers", err));
  }, []);
  const handleCompleted=async()=>{
      const token = localStorage.getItem("token") || "";
      const decoded: any = jwtDecode(token);
      const helperId = decoded.userid;
      await axios.put(`https://walmart-xjjd.onrender.com/api/driver/details/${helperId}`)
      navigate("/completed")
  }
  useEffect(() => {
    const handleReceiveHelpRequest = (data: any) => {
      setHelpRequests((prevRequests) => [data, ...prevRequests]);
      
      if (notificationRef.current) {
        notificationRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
    };

    socket.on("receive-help-request", handleReceiveHelpRequest);

    return () => {
      socket.off("receive-help-request", handleReceiveHelpRequest);
    };
  }, []);

  useEffect(() => {
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      setHelperLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    (error) => {
      console.error("Error getting location:", error);
      // fallback if location permission denied
      setHelperLocation(staticHelperLocation);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}, []);

  const handleAccept = async (helpRequestId: any) => {
    try {
      setIsAccepting(true);
      setIsLoadingRoute(true);
      const token = localStorage.getItem("token") || "";
      const decoded: any = jwtDecode(token);
      const helperId = decoded.userid;
      const helperNameFromToken = decoded.name || "Helper";

      await axios.put(`https://walmart-xjjd.onrender.com/api/request/help-request/${helpRequestId}/accept`, {
        helperId,
      });

      setHelperName(helperNameFromToken);
      socket.emit("accept-help", { helpRequestId, helperId });

      const request = helpRequests.find((r: any) => r.helpRequestId === helpRequestId);
      setSelectedRequest(request);
      setHelperLocation(staticHelperLocation);

      const route = await getRouteCoordinates(staticHelperLocation, request.location);
      setRouteCoords(route);

      setHelpRequests((prev) =>
        prev.filter((r: any) => r.helpRequestId !== helpRequestId)
      );
    } catch (error) {
      console.error("Error accepting help request:", error);
    } finally {
      setIsLoadingRoute(false);
      setIsAccepting(false);
    }
  };

  const handleReject = (helpRequestId: any) => {
    setHelpRequests((prev) =>
      prev.filter((r: any) => r.helpRequestId !== helpRequestId)
    );
  };
  
 return (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel */}
        <div className="w-full lg:w-1/2">
          {/* Conditionally render either Help Requests or Accepted Request */}
          {selectedRequest && helperLocation ? (
            // Show only the Accepted Request section when there's a selected request
            <div className="bg-white rounded-xl shadow-md p-6">
              {/* Header with status indicator */}
              <div className="flex items-center mb-6">
                <div className="bg-green-100 text-green-600 p-3 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Request Accepted</h2>
                  <p className="text-sm text-gray-500">You're helping {selectedRequest.requesterName}</p>
                </div>
              </div>
              
              {/* Driver and Helper Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Driver Details Card */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Driver Details
                  </h3>
                  <div className="flex items-start">
                    {selectedRequest.driverphoto ? (
                      <div className="relative mr-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500">
                          <LazyLoadImage
                            src={selectedRequest.driverphoto}
                            alt={`Driver ${selectedRequest.requesterName}`}
                            effect="blur"
                            className="w-full h-full object-cover"
                            placeholderSrc="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlZWVlZWUiLz48L3N2Zz4="
                          />
                        </div>
                        <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {selectedRequest.driverno}
                        </span>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mr-4">
                        {selectedRequest.requesterName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{selectedRequest.requesterName}</p>
                      <p className="text-sm text-gray-600 mb-1">{selectedRequest.requesterEmail}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Vehicle: {selectedRequest.vehicleno}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>
                          {selectedRequest.location.latitude.toFixed(4)}, {selectedRequest.location.longitude.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Helper Details Card */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Your Details
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Helper</p>
                      <p className="font-medium">{helperName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Distance to Driver</p>
                      <p className="font-medium">
                        {getDistanceFromLatLonInKm(
                          helperLocation.latitude,
                          helperLocation.longitude,
                          selectedRequest.location.latitude,
                          selectedRequest.location.longitude
                        ).toFixed(2)} km
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ETA</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Issue Details */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Issue Details
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Issue Type</p>
                      <p className="font-medium">{selectedRequest.issue}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Reported At</p>
                      <p className="font-medium">
                        {new Date(selectedRequest.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedRequest.description && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Description</p>
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {selectedRequest.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Image */}
                  {selectedRequest.image && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Attached Image</p>
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <LazyLoadImage
                          src={selectedRequest.image}
                          alt={`${selectedRequest.requesterName}'s reported issue`}
                          effect="blur"
                          className="w-full h-48 object-contain"
                          placeholderSrc="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlZWVlZWUiLz48L3N2Zz4="
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel Assistance
                </button>
                <button 
                onClick={handleCompleted}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mark as Completed
                </button>
              </div>
            </div>
          ) : (
            // Show Help Requests section when no request is selected
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                  🆘
                </span>
                Help Requests
              </h1>

              {helpRequests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2 text-4xl">🕒</div>
                  <p className="text-gray-500">No active help requests</p>
                  <p className="text-sm text-gray-400 mt-1">New requests will appear here automatically</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {helpRequests.map((request: any) => (
                    <div key={request.helpRequestId} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
                      {/* Header with emergency indicator */}
                      <div className="flex items-center mb-4">
                        <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">{request.issue}</h3>
                      </div>

                      {/* Driver Profile Section */}
                      <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                        {request.driverphoto ? (
                          <div className="relative">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500">
                              <LazyLoadImage
                                src={request.driverphoto}
                                alt={`Driver ${request.requesterName}`}
                                effect="blur"
                                className="w-full h-full object-cover"
                                placeholderSrc="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlZWVlZWUiLz48L3N2Zz4="
                              />
                            </div>
                            <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              {request.driverno}
                            </span>
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {request.requesterName.charAt(0)}
                          </div>
                        )}
                        <div className="ml-4">
                          <h4 className="font-semibold text-gray-800">{request.requesterName}</h4>
                          <p className="text-sm text-gray-600">{request.requesterEmail}</p>
                          <div className="flex items-center mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-xs text-gray-500">Vehicle No: {request.vehicleno}</span>
                          </div>
                        </div>
                      </div>

                      {/* Issue Details */}
                      <div className="mb-4">
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Location</p>
                            <p className="font-medium">
                              {request.location.latitude.toFixed(4)}, {request.location.longitude.toFixed(4)}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Time Reported</p>
                            <p className="font-medium">
                              {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>

                        {/* Description */}
                        {request.description && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-3">
                            <p className="text-xs text-gray-500 mb-1">Description</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {request.description}
                            </p>
                          </div>
                        )}

                        {/* Issue Image */}
                        {request.image && (
                          <div className="rounded-lg border border-gray-200 overflow-hidden">
                            <LazyLoadImage
                              src={request.image}
                              alt={`${request.requesterName}'s reported issue`}
                              effect="blur"
                              className="w-full h-48 object-cover"
                              placeholderSrc="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlZWVlZWUiLz48L3N2Zz4="
                            />
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3">
                        <button 
                          onClick={() => handleReject(request.helpRequestId)}
                          disabled={isAccepting}
                          className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </button>
                        <button 
                          onClick={() => handleAccept(request.helpRequestId)}
                          disabled={isAccepting}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center"
                        >
                          {isAccepting ? (
                            <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Map */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white rounded-xl shadow-sm p-6 h-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                🗺️
              </span>
              Location Map
            </h2>
            
            <div className="h-[500px] rounded-lg overflow-hidden relative">
              {isLoadingRoute && (
                <div className="absolute inset-0 bg-black bg-opacity-20 z-10 flex items-center justify-center">
                  <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                    <span>Calculating best route...</span>
                  </div>
                </div>
              )}
              
              <MapContainer
                center={[21.118976, 79.0790144]}
                zoom={13}
                scrollWheelZoom={true}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Drivers */}
                {allDrivers.map((driver: any) => (
                  <Marker
                    key={driver.id}
                    position={[driver.latitude, driver.longitude]}
                  >
                    <Popup className="custom-popup">
                      <div className="space-y-1">
                        <p className="font-semibold">🚕 {driver.name}</p>
                        <p className="text-sm">Status: {driver.status}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Helper Marker */}
                {helperLocation && (
  <Marker
    position={[helperLocation.latitude, helperLocation.longitude]}
    icon={blueIcon}
  >
    <Popup className="custom-popup">
      <div className="space-y-1">
        <p className="font-semibold">🛟 You (Helper)</p>
        <p>{helperName || "Current Location"}</p>
      </div>
    </Popup>
  </Marker>
)}



                {/* Requester Marker */}
                {selectedRequest && (
  <Marker 
    position={[selectedRequest.location.latitude, selectedRequest.location.longitude]} 
    icon={greenIcon} // 👈 Add this line
  >
    <Popup className="custom-popup">
      <div className="space-y-1">
        <p className="font-semibold">🆘 Requester</p>
        <p>{selectedRequest.requesterName}</p>
        <p className="text-sm">Issue: {selectedRequest.issue}</p>
        {selectedRequest.description && (
          <div className="mt-1 pt-1 border-t border-gray-200">
            <p className="text-xs text-gray-500">Description:</p>
            <p className="text-xs">{selectedRequest.description}</p>
          </div>
        )}
        {selectedRequest.image && (
          <div className="mt-2">
            <img 
              src={selectedRequest.image} 
              alt="Reported issue" 
              className="w-full h-auto rounded border border-gray-200"
            />
          </div>
        )}
      </div>
    </Popup>
  </Marker>
)}


                {/* Route Polyline */}
                {routeCoords.length > 0 && (
                  <>
                    <Polyline 
                      positions={routeCoords} 
                      color="blue" 
                    />
                    <Polyline
                      positions={routeCoords}
                      color="blue"
                      weight={3}
                    />
                  </>
                )}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* @ts-ignore */ }
    <style jsx global>{`
      .custom-popup .leaflet-popup-content-wrapper {
        border-radius: 8px;
        padding: 0;
      }
      .custom-popup .leaflet-popup-content {
        margin: 8px;
      }
      .custom-popup img {
        max-width: 200px;
        max-height: 150px;
      }
    `}</style>
  </div>
);
}

export default HelpDashboard;
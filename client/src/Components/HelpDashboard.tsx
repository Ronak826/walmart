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
          {/* Left Panel - Help Requests */}
          <div className="w-full lg:w-1/2">
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
                  {helpRequests.map((request: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start mb-2">
                        <div className="bg-red-100 text-red-600 p-2 rounded-lg mr-3">
                          🚨
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">{request.requesterName}</h3>
                          <p className="text-sm text-gray-600">{request.issue}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm pl-11">
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p>{request.location.latitude.toFixed(4)}, {request.location.longitude.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Time</p>
                          <p>{new Date(request.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      
                      {/* Image Display */}
                      {request.image && (
                        <div className="mt-3 pl-11">
                          <p className="text-xs text-gray-500 mb-1">Image</p>
                          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                            <LazyLoadImage
                              src={request.image}
                              alt={`${request.requesterName}'s reported issue`}
                              effect="blur"
                              className="w-full h-48 object-contain"
                              placeholderSrc="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlZWVlZWUiLz48L3N2Zz4="
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Description */}
                      {request.description && (
                        <div className="mt-3 pl-11">
                          <p className="text-xs text-gray-500 mb-1">Description</p>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {request.description}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end space-x-2 mt-3">
                        <button 
                          onClick={() => handleAccept(request.helpRequestId)}
                          disabled={isAccepting}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center min-w-20"
                        >
                          {isAccepting ? (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <>
                              <span className="mr-1">✓</span> Accept
                            </>
                          )}
                        </button>
                        <button 
                          onClick={() => handleReject(request.helpRequestId)}
                          disabled={isAccepting}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition-colors"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Accepted Request Details */}
            {selectedRequest && helperLocation && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-green-100 text-green-600 p-2 rounded-lg mr-3">
                    ✅
                  </span>
                  Accepted Request
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Helper</p>
                    <p className="font-medium">{helperName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Requester</p>
                    <p className="font-medium">{selectedRequest.requesterName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Issue</p>
                    <p className="font-medium">{selectedRequest.issue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Distance</p>
                    <p className="font-medium">
                      {getDistanceFromLatLonInKm(
                        helperLocation.latitude,
                        helperLocation.longitude,
                        selectedRequest.location.latitude,
                        selectedRequest.location.longitude
                      ).toFixed(2)} km
                    </p>
                  </div>
                </div>
                
                {/* Image in Accepted Request */}
                {selectedRequest.image && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-1">Image</p>
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
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
                
                {/* Description in Accepted Request */}
                {selectedRequest.description && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-1">Description</p>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedRequest.description}
                      </p>
                    </div>
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
                    <Marker position={[helperLocation.latitude, helperLocation.longitude]}>
                      <Popup className="custom-popup">
                        <div className="space-y-1">
                          <p className="font-semibold">🛟 You (Helper)</p>
                          <p>{helperName}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Requester Marker */}
                  {selectedRequest && (
                    <Marker position={[selectedRequest.location.latitude, selectedRequest.location.longitude]}>
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
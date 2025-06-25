import  { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { jwtDecode } from "jwt-decode";
import socket from "../socket/socket";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Utility to calculate distance
function getDistanceFromLatLonInKm(lat1:any, lon1:any, lat2:any, lon2:any) {
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
function deg2rad(deg:any) {
  return deg * (Math.PI / 180);
}

function HelpDashboard() {
  const [helpRequests, setHelpRequests] = useState([]);
  const [selectedRequest, setSelectedRequest]:any = useState(null);
  const [helperLocation, setHelperLocation]:any = useState(null);
  const [helperName, setHelperName] = useState("");
  const [allDrivers, setAllDrivers] = useState([]);

  // Hardcoded helper location (for demo/testing)
  const staticHelperLocation:any= {
    latitude: 21.1465,
    longitude: 79.067,
  };

  // Get drivers on load
  useEffect(() => {
    axios
      .get("https://walmart-xjjd.onrender.com/api/drivers")
      .then((res) => setAllDrivers(res.data.drivers))
      .catch((err) => console.error("Failed to fetch drivers", err));
  }, []);

  // Listen for new help requests
  useEffect(() => {
    const handleReceiveHelpRequest = (data:any) => {
        console.log(data)
      setHelpRequests((prevRequests):any => [data, ...prevRequests]);
    };

    socket.on("receive-help-request", handleReceiveHelpRequest);

    return () => {
      socket.off("receive-help-request", handleReceiveHelpRequest);
    };
  }, []);

  // Accept handler
  const handleAccept = async(helpRequestId:any) => {
    const token = localStorage.getItem("token") || "";
    const decoded:any = jwtDecode(token);
    const helperId = decoded.userid;
    const helperNameFromToken = decoded.name || "Helper";
    await axios.put(`https://walmart-xjjd.onrender.com/api/request/help-request/${helpRequestId}/accept`,{
        helperId
    })
    
    setHelperName(helperNameFromToken);

    socket.emit("accept-help", { helpRequestId, helperId });

    const request:any = helpRequests.find(
      (r:any) => r.helpRequestId  === helpRequestId
    );
    setSelectedRequest(request);
    setHelperLocation(staticHelperLocation); // use hardcoded location for now

    setHelpRequests((prev) =>
      prev.filter((r:any) => r.helpRequestId !== helpRequestId)
    );
  };

  const handleReject = (helpRequestId:any) => {
    setHelpRequests((prev) =>
      prev.filter((r:any) => r.helpRequestId  !== helpRequestId)
    );
  };

  return (
    <>
      <Navbar />
      <div className="flex p-6 gap-6">
        {/* Left side: Requests */}
        <div className="w-1/2">
          <h1 className="text-3xl font-bold mb-4">Help Requests</h1>
          {helpRequests.length === 0 ? (
            <p className="text-gray-500">No help requests yet.</p>
          ) : (
            helpRequests.map((request:any, index) => (
              <div key={index} className="border p-4 rounded-lg shadow mb-4">
                <div>
                  <strong>Requester:</strong> {request.requesterName}
                </div>
                <div>
                  <strong>Issue:</strong> {request.issue}
                </div>
                <div>
                  <strong>Location:</strong>{" "}
                  {request.location.latitude}, {request.location.longitude}
                </div>
                <div>
                  <strong>Time:</strong>{" "}
                  {new Date(request.createdAt).toLocaleString()}
                </div>
                <div className="mt-3 space-x-3">
                  <button
                    onClick={() => handleAccept(request.helpRequestId)}
                    className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(request.helpRequestId)}
                    className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}

          {selectedRequest && helperLocation && (
            <div className="bg-gray-100 rounded-lg shadow p-4 mt-6">
              <h2 className="text-xl font-semibold mb-2">
                Accepted Help Request
              </h2>
              <p>
                <strong>Helper:</strong> {helperName}
              </p>
              <p>
                <strong>Requester:</strong> {(selectedRequest as any).requesterName}
              </p>
              <p>
                <strong>Distance:</strong>{" "}
                {getDistanceFromLatLonInKm(
                  helperLocation.latitude,
                  helperLocation.longitude,
                  selectedRequest.location.latitude,
                  selectedRequest.location.longitude
                ).toFixed(2)}{" "}
                km
              </p>
            </div>
          )}
        </div>

        {/* Right side: Map */}
        <div className="w-1/2 h-[600px]">
          <MapContainer
          //@ts-ignore
            center={[21.118976, 79.0790144]}
            zoom={13}
            scrollWheelZoom={true}
            className="h-full w-full rounded-lg shadow"
          >
            <TileLayer
            //@ts-ignore
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Show all driver markers */}
            {allDrivers.map((driver:any) => (
              <Marker
                key={driver.id}
                position={[driver.latitude, driver.longitude]}
              >
                <Popup>
                  Driver: <strong>{driver.name}</strong>
                  <br />
                  Status: {driver.status}
                </Popup>
              </Marker>
            ))}

            {/* Show helper marker */}
            {helperLocation && (
              <Marker
                position={[helperLocation.latitude, helperLocation.longitude]}
              >
                <Popup>You (Helper)</Popup>
              </Marker>
            )}

            {/* Show requester marker */}
            {selectedRequest && (
              <Marker
                position={[
                  selectedRequest.location.latitude,
                  selectedRequest.location.longitude,
                ]}
              >
                <Popup>Requester</Popup>
              </Marker>
            )}

            {/* Show polyline after acceptance */}
            {helperLocation && selectedRequest && (
              <Polyline
                positions={[
                  [helperLocation.latitude, helperLocation.longitude],
                  [
                    selectedRequest.location.latitude,
                    selectedRequest.location.longitude,
                  ],
                ]}
                // @ts-ignore
                color="blue"
              />
            )}
          </MapContainer>
        </div>
      </div>
    </>
  );
}

export default HelpDashboard;

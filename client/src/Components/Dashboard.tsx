import{ useEffect, useState } from "react";
import Navbar from "./Navbar";
import { jwtDecode } from "jwt-decode";
import HelpModal from "../model/Helpmodel";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import socket from "../socket/socket";

// Distance Calculation Utility
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

function Dashboard() {
  const [name, setName]:any = useState("");
  const [locationInfo, setLocationInfo]:any = useState(null);
  const [id, setId]:any = useState();
  const [isModalOpen, setIsModalOpen]:any = useState(false);
  const [allDrivers, setAllDrivers]:any = useState([]);
  const [helpAccepted, setHelpAccepted]:any = useState(null); // accepted help
  const [helpSent, setHelpSent]:any = useState(false); // help request sent state

  const openHelpModal = () => setIsModalOpen(true);
  const closeHelpModal = () => setIsModalOpen(false);

  const handleSend = async (issue:any) => {
    try {
      const res = await axios.post("https://walmart-xjjd.onrender.com/api/request/help-request", {
        latitude: locationInfo.latitude,
        longitude: locationInfo.longitude,
        requesterId: id,
        issue,
      });

      const helpRequestId = res.data.helpRequest.id;
      socket.emit("send-help-request", { helpRequestId });

      setHelpSent(true); // Set help sent state
      closeHelpModal();
    } catch (error) {
      console.error("Error sending help request:", error);
      alert("Failed to send help request. Please try again.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded:any = jwtDecode(token);
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

          axios
            .get("https://walmart-xjjd.onrender.com/api/drivers")
            .then((res) => {
              const nearbyDrivers = res.data.drivers.filter((driver:any) =>
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

  useEffect(() => {
    const handleHelpAccepted = (data:any) => {
      console.log("Help Accepted:", data);
      setHelpAccepted(data);
      setHelpSent(false); // Reset help sent state when help is accepted
    };

    socket.on("help-accepted", handleHelpAccepted);

    return () => {
      socket.off("help-accepted", handleHelpAccepted);
    };
  }, []);

  return (
    <div>
      <Navbar />

      <div className="flex p-6 gap-6">
        {/* LEFT SIDE */}
        <div className="w-1/2 space-y-4">
          <h1 className="text-2xl font-bold">📋 Dashboard</h1>

          <div>
            👤 Your name: <strong>{name}</strong>
          </div>

          {locationInfo ? (
            <div>
              📍 Your current location:
              <br />
              Latitude: <strong>{locationInfo.latitude.toFixed(4)}</strong>
              <br />
              Longitude: <strong>{locationInfo.longitude.toFixed(4)}</strong>
            </div>
          ) : (
            <div>📡 Fetching your location...</div>
          )}

          <button
            onClick={openHelpModal}
            className="mt-4 border rounded-2xl p-2 bg-red-600 text-white hover:bg-red-700 transition-colors"
            disabled={helpSent}
          >
            🚨 Need Help
          </button>

          <HelpModal
            isOpen={isModalOpen}
            onClose={closeHelpModal}
            onSend={handleSend}
          />

          {/* Show help sent message */}
          {helpSent && !helpAccepted && (
            <div className="mt-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">📤 Help Request Sent!</h2>
              <p className="mb-2">
                <strong>✅ Your help request has been sent successfully.</strong>
              </p>
              <p>
                <strong>⏳ Status:</strong> Waiting for someone to accept your request...
              </p>
              <div className="flex items-center mt-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                <span className="text-sm">Looking for nearby helpers...</span>
              </div>
            </div>
          )}

          {/* Show if help has been accepted */}
          {helpAccepted && helpAccepted.requesterId === id && (
            <div className="mt-6 p-4 bg-blue-100 border border-blue-400 text-blue-900 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">🚨 Help Request Accepted</h2>
              <p>
                <strong>👨‍🔧 Helper:</strong> {helpAccepted.helperName}
              </p>
              <p>
                <strong>🧑‍💼 You (Requester):</strong> {helpAccepted.requesterName}
              </p>
              <p>
                <strong>🛠 Issue:</strong> {helpAccepted.issue}
              </p>
              <p>
                <strong>📍 Helper Location:</strong>{" "}
                {helpAccepted.location.latitude.toFixed(4)},{" "}
                {helpAccepted.location.longitude.toFixed(4)}
              </p>
              <p>
                <strong>📍 Your Location:</strong>{" "}
                {locationInfo.latitude.toFixed(4)},{" "}
                {locationInfo.longitude.toFixed(4)}
              </p>
              <p>
                <strong>📏 Distance:</strong>{" "}
                {getDistanceFromLatLonInKm(
                  helpAccepted.location.latitude,
                  helpAccepted.location.longitude,
                  locationInfo.latitude,
                  locationInfo.longitude
                ).toFixed(2)}{" "}
                km
              </p>
              <p>
                <strong>🕒 Accepted At:</strong>{" "}
                {new Date(helpAccepted.updatedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: MAP */}
        <div className="w-1/2 h-[500px] relative">
          {locationInfo && (
            <MapContainer
            //@ts-ignore
              center={[locationInfo.latitude, locationInfo.longitude]}
              zoom={14}
              scrollWheelZoom={true}
              className="h-full w-full rounded-lg shadow"
              style={{ zIndex: 1 }} // Lower z-index for map
            >
              <TileLayer
                //@ts-ignore
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Requester Marker */}
              <Marker position={[locationInfo.latitude, locationInfo.longitude]}>
                <Popup>You (Requester)</Popup>
              </Marker>

              {/* Nearby Drivers */}
              {allDrivers.map((driver:any) => (
                <Marker
                  key={driver.id}
                  position={[driver.latitude, driver.longitude]}
                >
                  <Popup>
                    🚕 Driver: <strong>{driver.name}</strong>
                    <br />
                    Status: {driver.status}
                  </Popup>
                </Marker>
              ))}

              {/* Helper Marker */}
              {helpAccepted?.helperId && (
                <Marker
                  position={[
                    helpAccepted.location.latitude,
                    helpAccepted.location.longitude,
                  ]}
                >
                  <Popup>Helper: {helpAccepted.helperName}</Popup>
                </Marker>
              )}

              {/* Polyline between helper and requester */}
              {helpAccepted?.helperId && (
                <Polyline
                  positions={[
                    [locationInfo.latitude, locationInfo.longitude],
                    [
                      helpAccepted.location.latitude,
                      helpAccepted.location.longitude,
                    ],
                  ]}
                  // @ts-ignore
                  color="blue"
                />
              )}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
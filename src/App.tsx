import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function App() {
  const [earthquakeData, setEarthquakeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEarthquakeData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
        );
        if (!res.ok) throw new Error("Failed to fetch earthquake data");
        const data = await res.json();
        setEarthquakeData(data.features);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEarthquakeData();
  }, []);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading data...</p>;
  if (error)
    return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {earthquakeData.map((quake) => {
          const [lon, lat] = quake.geometry.coordinates;
          const { mag, place, time } = quake.properties;

          return (
            <Marker key={quake.id} position={[lat, lon]}>
              <Popup>
                <strong>Magnitude:</strong> {mag ?? "N/A"} <br />
                <strong>Location:</strong> {place ?? "Unknown"} <br />
                <strong>Time:</strong> {formatTime(time)}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 50,
          background: "white",
          color: "black",
          padding: "6px 12px",
          borderRadius: "6px",
          fontSize: "14px",
        }}
      >
        🌍 Showing {earthquakeData.length} earthquakes (past 24 hrs)
      </div>
    </div>
  );
}

export default App;

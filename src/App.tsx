import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

function App() {
  const [earthquakeData, setEarthquakeData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
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
        if (!data.features || data.features.length === 0)
          throw new Error("No earthquake data available");
        setEarthquakeData(data.features);
        setFilteredData(data.features);
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
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMarkerIcon = (magnitude) => {
    let color = "#22c55e"; // green
    if (magnitude >= 3 && magnitude < 5) color = "#facc15"; // yellow
    if (magnitude >= 5) color = "#ef4444"; // red
    return L.divIcon({
      className: "custom-marker",
      html: `<div style="
        background-color:${color};
        width:14px;
        height:14px;
        border-radius:50%;
        border:2px solid white;
        box-shadow:0 0 6px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    if (filter === "all") {
      setFilteredData(earthquakeData);
    } else {
      const filtered = earthquakeData.filter((q) => {
        const mag = q.properties.mag || 0;
        if (filter === "minor") return mag < 3;
        if (filter === "moderate") return mag >= 3 && mag < 5;
        if (filter === "strong") return mag >= 5;
        return true;
      });
      setFilteredData(filtered);
    }
  };

  if (loading)
    return (
      <div className="centered-container">
        <div className="spinner"></div>
        <p>Fetching live earthquake data...</p>
      </div>
    );

  if (error || earthquakeData.length === 0)
    return (
      <div className="centered-container">
        <p className="error-text">⚠️ {error || "No data available"}</p>
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="app-container">
      <header className="header">
        🌎 Global Earthquake Tracker — Live Data
      </header>

      <div className="filter-bar">
        {["all", "minor", "moderate", "strong"].map((filter) => (
          <button
            key={filter}
            className={`filter-btn ${activeFilter === filter ? "active" : ""}`}
            onClick={() => handleFilterChange(filter)}
          >
            {filter === "all"
              ? "All"
              : filter === "minor"
              ? "Minor (<3)"
              : filter === "moderate"
              ? "Moderate (3–5)"
              : "Strong (≥5)"}
          </button>
        ))}
      </div>

      <MapContainer center={[20, 0]} zoom={2} className="map-container">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredData.map((quake) => {
          const [lon, lat] = quake.geometry.coordinates;
          const { mag, place, time } = quake.properties;

          return (
            <Marker
              key={quake.id}
              position={[lat, lon]}
              icon={getMarkerIcon(mag)}
            >
              <Popup>
                <strong>Magnitude:</strong> {mag ?? "N/A"} <br />
                <strong>Location:</strong> {place ?? "Unknown"} <br />
                <strong>Time:</strong> {formatTime(time)}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="info-box">
        Showing {filteredData.length} earthquakes ({activeFilter})
      </div>
    </div>
  );
}

export default App;

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import axios from "axios";

/* MAP CLICK HANDLER */
const MapClickHandler = ({ setCoordinates, setLocation }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;

      setPosition([lat, lng]);
      setCoordinates({ lat, lng });

      try {
        const res = await axios.get(
          "https://nominatim.openstreetmap.org/reverse",
          {
            params: {
              lat,
              lon: lng,
              format: "json",
            },
          },
        );

        setLocation(res.data.display_name);
      } catch (err) {
        console.log("Reverse geocode error", err);
      }
    },
  });

  return position ? <Marker position={position} /> : null;
};

/* MAIN MAP COMPONENT */
const MapPicker = ({ setCoordinates, setLocation }) => {
  return (
    <MapContainer
      center={[18.5204, 73.8567]} // Pune default
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler
        setCoordinates={setCoordinates}
        setLocation={setLocation}
      />
    </MapContainer>
  );
};

export default MapPicker;

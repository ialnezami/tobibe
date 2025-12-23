"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Create custom doctor icon with medical cross
const createDoctorIcon = () => {
  return L.divIcon({
    className: "custom-doctor-icon",
    html: `
      <div style="
        position: relative;
        width: 50px;
        height: 50px;
      ">
        <div style="
          background-color: #3b82f6;
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          top: 0;
          left: 0;
        ">
          <svg 
            style="
              transform: rotate(45deg);
              width: 22px;
              height: 22px;
              fill: white;
              stroke: white;
              stroke-width: 2;
            " 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="12" y1="5" x2="12" y2="19" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="5" y1="12" x2="19" y2="12" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
    popupAnchor: [0, -50],
  });
};

// Fix for default marker icons in Next.js (for fallback)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Doctor {
  _id: string;
  name: string;
  description?: string;
  location?: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  phone?: string;
  email?: string;
}

interface MapProps {
  doctors: Doctor[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (doctor: Doctor) => void;
}

// Component to handle map view updates
function MapViewUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
}

export default function Map({ doctors, center, zoom = 13, onMarkerClick }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Calculate center from doctors if not provided
  const mapCenter: [number, number] = center || (() => {
    const doctorsWithLocation = doctors.filter((d) => d.location?.coordinates);
    if (doctorsWithLocation.length === 0) {
      return [40.7128, -74.0060]; // Default to New York
    }
    const avgLat = doctorsWithLocation.reduce((sum, d) => sum + (d.location?.coordinates.lat || 0), 0) / doctorsWithLocation.length;
    const avgLng = doctorsWithLocation.reduce((sum, d) => sum + (d.location?.coordinates.lng || 0), 0) / doctorsWithLocation.length;
    return [avgLat, avgLng];
  })();

  const doctorsWithLocation = doctors.filter((d) => d.location?.coordinates);

  return (
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        scrollWheelZoom={true}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewUpdater center={mapCenter} zoom={zoom} />
        {doctorsWithLocation.map((doctor) => (
          <Marker
            key={doctor._id}
            position={[doctor.location!.coordinates.lat, doctor.location!.coordinates.lng]}
            icon={createDoctorIcon()}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(doctor);
                }
              },
            }}
          >
            <Popup>
              <div className="p-3 min-w-[200px]">
                <h3 className="font-semibold text-slate-900 mb-2 text-base">{doctor.name}</h3>
                {doctor.description && (
                  <p className="text-sm text-slate-600 mb-2 line-clamp-2">{doctor.description}</p>
                )}
                {doctor.location?.address && (
                  <div className="flex items-start text-xs text-slate-500 mb-2">
                    <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="line-clamp-2">{doctor.location.address}</span>
                  </div>
                )}
                <button
                  className="mt-2 w-full px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition-colors"
                  onClick={() => {
                    if (onMarkerClick) {
                      onMarkerClick(doctor);
                    }
                  }}
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}


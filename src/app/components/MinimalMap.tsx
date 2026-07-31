import React, { useState, useEffect, useRef } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker
} from "react-simple-maps";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-50m.json";
import { MapLocation } from '../../hooks/useFirebaseData';

interface MinimalMapProps {
  locations?: MapLocation[];
}

export const MinimalMap = React.memo(function MinimalMap({ locations = [] }: MinimalMapProps) {
  const KOREA_COORD: [number, number] = [127.7669, 35.9078];
  const [position, setPosition] = useState({ coordinates: KOREA_COORD, zoom: 12 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Use a non-passive event listener to prevent page scrolling while zooming
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); // Stop sidebar from scrolling
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const handleMoveEnd = (position: any) => {
    setPosition(position);
  };

  return (
    <div className="w-full pt-0 md:pt-5 mt-auto border-t-0 md:border-t border-[#f4f4f0]/20 flex flex-col gap-3 opacity-80 hover:opacity-100 transition-opacity group">
      <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-[#f4f4f0]/60">
        <span>Global Sites</span>
        <span className="flex items-center gap-1.5 group-hover:text-[#f4f4f0] transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f4f4f0] animate-pulse" />
          Scroll to Zoom
        </span>
      </div>
      
      <div 
        ref={mapContainerRef}
        className="relative w-full aspect-[4/3] rounded-sm overflow-hidden bg-[#1a1a1a] cursor-grab active:cursor-grabbing border border-[#f4f4f0]/10"
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 100 }}
          width={400}
          height={300}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            maxZoom={100}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#f4f4f0"
                    fillOpacity={0.15}
                    stroke="#1a1a1a"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fillOpacity: 0.3, outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {locations.map(({ name, coordinates }) => (
              <Marker key={name} coordinates={coordinates as [number, number]}>
                <circle r={3 / position.zoom} fill="#f4f4f0" />
                <circle r={10 / position.zoom} fill="#f4f4f0" opacity={0.2} className="animate-ping" style={{ animationDuration: '3s' }} />
                {position.zoom > 10 && (
                  <text
                    textAnchor="middle"
                    y={-8 / position.zoom}
                    style={{ fontFamily: "monospace", fontSize: `${10 / position.zoom}px`, fill: "#f4f4f0", opacity: 0.8 }}
                  >
                    {name}
                  </text>
                )}
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  );
});

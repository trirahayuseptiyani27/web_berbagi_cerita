// src/scripts/utils/map-utils.js
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ✅ Tambahkan konfigurasi ikon default agar marker tidak rusak di semua halaman
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const initializeMap = (containerId, options = {}) => {
  const map = L.map(containerId, options);

  // Define basemap layers
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  });

  const satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      maxZoom: 19,
      attribution: 'Source: Esri, Maxar, Earthstar Geographics'
    }
  );

  const terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: '© OpenTopoMap contributors'
  });

  // Add default layer
  osm.addTo(map);

  // Add layer control
  const baseMaps = {
    'Peta Jalan': osm,
    'Satelit': satellite,
    'Terrain': terrain,
  };

  L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map);

  return { map, layers: { osm, satellite, terrain } };
};

export { initializeMap };

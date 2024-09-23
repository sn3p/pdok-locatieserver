import L from "leaflet";

class Map {
  constructor(element) {
    this.element = element;
    this.map = L.map(this.element);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      scrollWheelZoom: false,
    }).addTo(this.map);

    this.markers = L.layerGroup().addTo(this.map);
  }

  setView(latLon, zoom = 16) {
    // Clear previous markers
    this.clear();

    // Add new marker
    L.marker(latLon).addTo(this.markers);

    // Set view
    this.map.setView(latLon, zoom);
  }

  clear() {
    this.markers.clearLayers();
  }

  reload() {
    this.map.invalidateSize();
  }
}

export default Map;

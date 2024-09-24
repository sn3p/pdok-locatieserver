import L from "leaflet";

class Map {
  constructor(element) {
    this.element = element;
    this.map = L.map(this.element);

    this.tileLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      scrollWheelZoom: false,
    });

    this.markers = L.layerGroup().addTo(this.map);
  }

  setView(latLon, zoom = 16) {
    // Clear previous markers
    this.clear();

    // Add tile layer and marker
    this.tileLayer.addTo(this.map);
    L.marker(latLon).addTo(this.markers);

    // Set view
    this.map.setView(latLon, zoom);
  }

  clear() {
    // Remove tile layer and markers
    this.tileLayer.remove();
    this.markers.clearLayers();
  }

  refresh() {
    this.map.invalidateSize();
  }
}

export default Map;

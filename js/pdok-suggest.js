import L from "leaflet";
import PDOK from "./pdok.js";
import ResultsList from "./results-list.js";

class PDOKSuggest {
  constructor(selector) {
    this.element = document.querySelector(selector);
    this.element._pdok = this;

    this.form = this.element.querySelector("form");
    this.response = this.element.querySelector(".response");

    this.resultsList = new ResultsList(".results");
    this.resultsList.addEventListener("result-click", this.onResultClick.bind(this));

    this.pdok = new PDOK();
    this.initMap();

    this.form.addEventListener("submit", this.onSubmit.bind(this));

    // Initial submit
    // this.form.dispatchEvent(new CustomEvent("submit", { cancelable: true }));
    this.handleResponse({
      response: {
        numFound: 272,
        start: 0,
        maxScore: 7.258797,
        numFoundExact: true,
        docs: [
          {
            id: "adr-c5dc8866579d22ee9421624b86871a2a",
            weergavenaam: "Zuiderpark 3, 1433PP Kudelstaart",
            centroide_ll: "POINT(4.74668107 52.23025982)",
          },
          {
            id: "adr-8a86c764c18df2cd6391eb48cb9aec35",
            weergavenaam: "Zuiderpark 3, 1771AA Wieringerwerf",
            centroide_ll: "POINT(5.02217165 52.84774227)",
          },
        ],
      },
      highlighting: {
        "adr-c5dc8866579d22ee9421624b86871a2a": {
          suggest: ["<b>Zuiderpark 3</b>, 1433PP Kudelstaart"],
        },
        "adr-8a86c764c18df2cd6391eb48cb9aec35": {
          suggest: ["<b>Zuiderpark 3</b>, 1771AA Wieringerwerf"],
        },
      },
      spellcheck: {
        suggestions: [],
        collations: [],
      },
    });
  }

  initMap() {
    const mapContainer = this.element.querySelector(".map");
    this.map = L.map(mapContainer);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      scrollWheelZoom: false,
    }).addTo(this.map);

    this.mapMarkers = L.layerGroup().addTo(this.map);
  }

  async onSubmit(event) {
    event.preventDefault();

    // Form data to query object
    const formData = new FormData(this.form);
    const params = Object.fromEntries(formData);
    params.rows = 5;
    params.fl = "id,weergavenaam,centroide_ll";
    // params.fq = "*:*";

    // Search PDOK Locatieserver
    const response = await this.pdok.suggest(params);

    // Handle response
    this.handleResponse(response);
  }

  handleResponse(response) {
    // Preview response
    this.response.innerHTML = JSON.stringify(response, null, 2);

    const results = response.response.docs;

    // List results
    this.resultsList.render(response);

    // Check for results
    if (!results.length) {
      // TODO: clear/hide map
      return;
    }

    // Render first result
    this.renderResult(results[0]);
  }

  renderResult(result) {
    const latLon = this.getCoordinates(result);

    this.setMap(latLon);
  }

  setMap(latLon, zoom = 16) {
    // Clear previous markers
    this.mapMarkers.clearLayers();

    // Add new marker
    L.marker(latLon).addTo(this.mapMarkers);

    // Set view
    this.map.setView(latLon, zoom);
  }

  onResultClick({ detail: result }) {
    console.log(result);

    // TODO: set value in input field

    this.renderResult(result);
  }

  getCoordinates(result) {
    const [lon, lat] = result.centroide_ll.match(/\(([^)]+)\)/)[1].split(" ");
    return [lat, lon];
  }
}

export default PDOKSuggest;

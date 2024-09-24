import debounce from "debounce";
import PDOK from "./pdok.js";
import ResultsList from "./results-list.js";
import Map from "./map.js";

class PDOKSuggest {
  constructor(selector) {
    this.element = document.querySelector(selector);
    this.element._pdok = this;

    this.pdok = new PDOK();
    this.response = this.element.querySelector(".response");

    // Map
    const mapElement = this.element.querySelector(".map");
    this.map = new Map(mapElement);

    // Results list
    const resultsListElement = this.element.querySelector(".results");
    this.resultsList = new ResultsList(resultsListElement);
    this.resultsList.addEventListener("result-click", this.onResultClick.bind(this));

    // Form
    this.form = this.element.querySelector("form");
    this.queryInput = this.form.querySelector("input[name=q]");
    this.form.addEventListener("submit", this.onSubmit.bind(this));
    this.form.addEventListener("input", debounce(this.onInput.bind(this), 500));
  }

  onInput(event) {
    this.form.dispatchEvent(new CustomEvent("submit", { cancelable: true }));
  }

  onSubmit(event) {
    event.preventDefault();

    // Form data to query object with removed empty values
    const params = Object.fromEntries([...new FormData(this.form)].filter(([_, v]) => v !== ""));

    // Make sure query is at least 3 characters
    if (params.q.length < 3) {
      this.resultsList.clear();
      return;
    }

    // Search PDOK Locatieserver
    this.query(params);
  }

  async query(params) {
    // Search PDOK Locatieserver
    const response = await this.pdok.suggest(params);

    // Handle response
    this.handleResponse(response);
  }

  handleResponse(response) {
    // Preview response
    this.response.innerHTML = JSON.stringify(response, null, 2);

    // List results
    this.resultsList.render(response);

    const results = response.response.docs;

    // Check for results
    if (!results.length) {
      this.map.clear();
      return;
    }
  }

  renderResult(result) {
    const latLon = this.getCoordinates(result);
    this.map.setView(latLon);
  }

  onResultClick({ detail: result }) {
    // Set query input value
    this.queryInput.value = result.weergavenaam;
    // Render result
    this.renderResult(result);
    // Clear results list
    this.resultsList.clear();
  }

  getCoordinates(result) {
    const [lon, lat] = result.centroide_ll.match(/\(([^)]+)\)/)[1].split(" ");
    return [lat, lon];
  }

  onShow() {
    this.map.reload();

    // Check user location
    this.useCurrentCoordinates();
  }

  useCurrentCoordinates() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.form.lat.value = position.coords.latitude;
          this.form.lon.value = position.coords.longitude;
          return position.coords;
        },
        (error) => console.error(error),
        { enableHighAccuracy: true }
      );
    }

    return false;
  }
}

export default PDOKSuggest;

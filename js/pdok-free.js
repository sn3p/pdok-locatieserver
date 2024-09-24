import PDOK from "./pdok.js";
import Map from "./map.js";

class PDOKFree {
  constructor(selector) {
    this.element = document.querySelector(selector);
    this.element._pdok = this;

    this.pdok = new PDOK();
    this.response = this.element.querySelector(".response");

    // Map
    const mapElement = this.element.querySelector(".map");
    this.map = new Map(mapElement);

    // Form
    this.form = this.element.querySelector("form");
    this.form.addEventListener("submit", this.onSubmit.bind(this));

    // Initial submit
    this.form.dispatchEvent(new CustomEvent("submit", { cancelable: true }));
  }

  async onSubmit(event) {
    event.preventDefault();

    // Form data to query object
    const formData = new FormData(this.form);
    const query = Object.fromEntries(formData);
    const params = { q: query };
    params.fq = "type:adres";

    // Search PDOK Locatieserver
    const response = await this.pdok.free(params);

    // Handle response
    this.handleResponse(response);
  }

  handleResponse(response) {
    // Preview response
    this.response.innerHTML = JSON.stringify(response, null, 2);

    // Check for results
    const results = response.response.docs;
    if (!results.length) {
      // TODO: clear/hide map
      console.warn("No results found");
      return;
    }

    // Render first result
    this.renderResult(results[0]);
  }

  renderResult(result) {
    const latLon = this.getCoordinates(result);
    this.map.setView(latLon);
  }

  getCoordinates(result) {
    const [lon, lat] = result.centroide_ll.match(/\(([^)]+)\)/)[1].split(" ");
    return [lat, lon];
  }
}

export default PDOKFree;

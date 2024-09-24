import debounce from "debounce";
import PDOK from "./pdok.js";
import Map from "./map.js";

class PDOKFree {
  constructor(selector) {
    this.element = document.querySelector(selector);
    this.element._pdok = this;

    this.pdok = new PDOK();
    this.response = this.element.querySelector(".response");

    // Form
    this.form = this.element.querySelector("form");
    this.form.addEventListener("submit", this.onSubmit.bind(this));
    this.form.addEventListener("input", debounce(this.dispatchSubmit.bind(this), 500));

    // Map
    const mapElement = this.element.querySelector(".map");
    this.map = new Map(mapElement);

    // Initial submit
    this.dispatchSubmit();
  }

  dispatchSubmit() {
    this.form.dispatchEvent(new CustomEvent("submit", { cancelable: true }));
  }

  onSubmit(event) {
    event.preventDefault();

    // Form data to query object
    const formData = new FormData(this.form);
    const query = Object.fromEntries(formData);
    const params = { q: query };
    params.fq = "type:adres";

    // Search PDOK Locatieserver
    this.query(params);
  }

  async query(params) {
    // TODO: Handle errors

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
      this.map.clear();
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

  onShow() {
    this.map.refresh();
  }
}

export default PDOKFree;

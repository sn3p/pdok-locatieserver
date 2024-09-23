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

    // Initial submit
    // this.handleResponse({
    //   response: {
    //     numFound: 272,
    //     start: 0,
    //     maxScore: 7.258797,
    //     numFoundExact: true,
    //     docs: [
    //       {
    //         id: "adr-c5dc8866579d22ee9421624b86871a2a",
    //         weergavenaam: "Zuiderpark 3, 1433PP Kudelstaart",
    //         centroide_ll: "POINT(4.74668107 52.23025982)",
    //       },
    //       {
    //         id: "adr-8a86c764c18df2cd6391eb48cb9aec35",
    //         weergavenaam: "Zuiderpark 3, 1771AA Wieringerwerf",
    //         centroide_ll: "POINT(5.02217165 52.84774227)",
    //       },
    //     ],
    //   },
    //   highlighting: {
    //     "adr-c5dc8866579d22ee9421624b86871a2a": {
    //       suggest: ["<b>Zuiderpark 3</b>, 1433PP Kudelstaart"],
    //     },
    //     "adr-8a86c764c18df2cd6391eb48cb9aec35": {
    //       suggest: ["<b>Zuiderpark 3</b>, 1771AA Wieringerwerf"],
    //     },
    //   },
    //   spellcheck: {
    //     suggestions: [],
    //     collations: [],
    //   },
    // });
  }

  onInput(event) {
    this.form.dispatchEvent(new CustomEvent("submit", { cancelable: true }));
  }

  onSubmit(event) {
    event.preventDefault();

    // Form data to query object
    const formData = new FormData(this.form);
    const params = Object.fromEntries(formData);

    // Make sure query is at least 3 characters
    if (params.q.length < 3) {
      this.resultsList.clear();
      return;
    }

    // Additional query parameters
    params.rows = 5;
    params.fq = "type:adres";
    params.fl = "id,weergavenaam,centroide_ll";

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
}

export default PDOKSuggest;

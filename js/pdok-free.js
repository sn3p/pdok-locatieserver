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
    // this.form.dispatchEvent(new CustomEvent("submit", { cancelable: true }));
    this.handleResponse({
      response: {
        numFound: 1,
        start: 0,
        maxScore: 8.158252,
        numFoundExact: true,
        docs: [
          {
            bron: "BAG",
            woonplaatscode: "1070",
            type: "adres",
            woonplaatsnaam: "Groningen",
            wijkcode: "WK001401",
            huis_nlt: "3",
            openbareruimtetype: "Weg",
            buurtnaam: "Oosterpoort",
            gemeentecode: "0014",
            rdf_seealso:
              "http://bag.basisregistraties.overheid.nl/bag/id/nummeraanduiding/0014200010875583",
            weergavenaam: "Zuiderpark 3, 9724AD Groningen",
            straatnaam_verkort: "Zuiderprk",
            id: "adr-a64c3eb5a79be1c8da5840dc931f4efe",
            gekoppeld_perceel: ["GNG00-B-10361"],
            gemeentenaam: "Groningen",
            buurtcode: "BU00140101",
            wijknaam: "Oud-Zuid",
            identificatie: "0014010011068010-0014200010875583",
            openbareruimte_id: "0014300010786255",
            waterschapsnaam: "Waterschap Hunze en Aa's",
            provinciecode: "PV20",
            postcode: "9724AD",
            provincienaam: "Groningen",
            centroide_ll: "POINT(6.57236951 53.21219828)",
            nummeraanduiding_id: "0014200010875583",
            waterschapscode: "33",
            adresseerbaarobject_id: "0014010011068010",
            huisnummer: 3,
            provincieafkorting: "GR",
            centroide_rd: "POINT(234174.916 581270.45)",
            straatnaam: "Zuiderpark",
            score: 8.158252,
          },
        ],
      },
    });
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

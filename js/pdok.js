/**
 * @class PDOK
 * @classdesc API for searching the [PDOK Locatieserver](https://www.pdok.nl/pdok-locatieserver).
 *
 * https://github.com/PDOK/locatieserver/wiki/API-Locatieserver
 * https://api.pdok.nl/bzk/locatieserver/search/v3_1/ui/
 *
 * @param {String} endpoint - PDOK Locatieserver API base endpoint.
 */

class PDOK {
  static apiEndpoint = "https://api.pdok.nl/bzk/locatieserver/search/v3_1";

  constructor(endpoint) {
    this.endpoint = endpoint || PDOK.apiEndpoint;
  }

  // https://api.pdok.nl/bzk/locatieserver/search/v3_1/free
  async free(params) {
    // Convert query object to Solr query string
    if (typeof params?.q === "object") {
      params["q"] = this.toSolrQuery(params["q"]);
    }

    // Construct API url
    const url = new URL(this.endpoint + "/free");
    url.search = new URLSearchParams(params);

    // Fetch and return JSON response
    const response = await fetch(url);
    return await response.json();
  }

  // https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest
  async suggest(params) {
    // Construct API url
    const url = new URL(this.endpoint + "/suggest");
    url.search = new URLSearchParams(params);

    // Fetch and return JSON response
    const response = await fetch(url);
    return await response.json();
  }

  toSolrQuery(object) {
    return Object.entries(object)
      .map((entry) => this.normalizeQueryEntry(entry).join(":"))
      .join(" and ");
  }

  normalizeQueryEntry([key, value]) {
    value = value.trim();

    switch (key) {
      case "postcode":
        // Remove whitespaces (e.g. "9724 AD" to "9724AD")
        value = value.replace(/\s+/g, "");
        break;

      // equals huisnummer + huisletter + huisnummertoevoeging
      case "huis_nlt":
        // Remove whitespaces and dashes (e.g. "3 a" or "3-a" to "3a")
        value = value.replace(/\s+|-/g, "");
        break;
    }

    return [key, value];
  }
}

export default PDOK;

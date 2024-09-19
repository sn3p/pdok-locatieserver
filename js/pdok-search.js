/**
 * @class PDOKSearch
 * @classdesc API for searching the [PDOK Locatieserver](https://www.pdok.nl/pdok-locatieserver).
 *
 * @param {String} endpoint - PDOK Locatieserver API endpoint (defaults to `/free` endpoint).
 */

class PDOKSearch {
  static defaultEndpoint = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/free";

  constructor(endpoint = PDOKSearch.defaultEndpoint) {
    this.endpoint = endpoint;
  }

  async query(params) {
    // Convert query object to Solr query string
    if (typeof params?.q === "object") {
      params["q"] = this.toSolrQuery(params["q"]);
    }

    const url = new URL(this.endpoint);
    url.search = new URLSearchParams(params);

    return fetch(url).then((response) => response.json());
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

export default PDOKSearch;

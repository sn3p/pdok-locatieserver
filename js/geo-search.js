import PDOKSearch from "./pdok-search.js";

class GeoSearch {
  constructor(endpoint = PDOKSearch.defaultEndpoint) {
    const pdok = new PDOKSearch();

    console.log(pdok);
  }
}

export default GeoSearch;

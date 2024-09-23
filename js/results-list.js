class ResultsList {
  constructor(selector) {
    this.element = document.querySelector(selector);

    this.element.addEventListener("click", this.onResultClick.bind(this));
  }

  render(response) {
    if (response.response.numFound === 0) {
      this.renderNoResults();
    } else {
      this.renderResults(response);
    }
  }

  renderResults({ response, highlighting }) {
    this.element.innerHTML = response.docs
      .map((result) => this.resultHTML(result, highlighting))
      .join("\n");
  }

  resultHTML(result, highlighting = {}) {
    const hightlight = highlighting[result.id]?.suggest[0];
    const text = hightlight || result.weergavenaam;
    const dataString = encodeURIComponent(JSON.stringify(result));

    return `<button type="button" class="list-group-item list-group-item-action" data-result="${dataString}">${text}</button>`;
  }

  renderNoResults() {
    this.element.innerHTML = `<div class="list-group-item">Geen locatie gevonden</div>`;
    // TODO: auto hide after some time
  }

  onResultClick(event) {
    // Check if we clicked a result item
    const button = event.target.closest(".list-group-item-action");
    if (!button) return;

    // Parse result data
    const result = JSON.parse(decodeURIComponent(button.dataset.result));

    // Dispatch custom event
    this.dispatchEvent(new CustomEvent("result-click", { detail: result }));
  }

  /*
  Proxy event methods to element
  */

  dispatchEvent(event) {
    this.element.dispatchEvent(event);
  }

  addEventListener(type, listener) {
    this.element.addEventListener(type, listener);
  }

  removeEventListener(type, listener) {
    this.element.removeEventListener(type, listener);
  }
}

export default ResultsList;

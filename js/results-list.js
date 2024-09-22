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
  }

  onResultClick(event) {
    // Check if we clicked a result item
    const button = event.target.closest(".list-group-item");
    if (!button) return;

    const result = JSON.parse(decodeURIComponent(button.dataset.result));
    console.log(result);
    // this.renderResult(result);
  }
}

export default ResultsList;

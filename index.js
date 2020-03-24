import { app } from "./web_modules/hyperapp.js";
import { worldMap } from "./countriesMap.js";
import { chartView, ChartListen } from "./chart.js";
import { html } from "./html.js";
import { Container } from "./container.js";
import { header } from "./header.js";
import { tab } from "./tab.js";
import { table } from "./table.js";
import { select } from "./select.js";
import { chips } from "./chips.js";
import { fetchReport } from "./fetch.js";

const main = state => html`
  <${Container}>
      ${chips(state)} ${chartView} ${select(state)} ${worldMap(state)} 
      ${chips(state)}
  </Container>
`;

const view = state =>
  html`
    <div>
      ${header} ${tab(state)} ${main(state)} ${table(state)}
    </div>
  `;

const initialState = {
  report: {},
  reportType: "confirmed",
  strategy: ["byDate", ""],
  currentCountry: "Italy",
  selectedCountries: ["China", "Italy"],
  sortOrder: ["lastCases", "desc"]
};

app({
  init: [initialState, fetchReport, ChartListen],
  view,
  node: document.getElementById("app")
});

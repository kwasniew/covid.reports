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
import { initialState } from "./state.js";
import { LoadPreferences, SavePreferencesListen } from "./preferences.js";
import { HistoryListen, ReadStateFromUrl } from "./history.js";

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

window.onerror = function(errorMsg, url, lineNumber) {
  console.log(errorMsg, url, lineNumber);
  localStorage.clear();
  return false;
};

app({
  init: [
    initialState,
    LoadPreferences,
    fetchReport,
    ChartListen,
    ReadStateFromUrl,
    SavePreferencesListen,
    HistoryListen
  ],
  view,
  node: document.getElementById("app")
});

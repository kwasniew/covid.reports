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
import {
  LoadPreferences,
  SavePreferencesListen,
  CleanPreferencesOnErrorListen
} from "./preferences.js";
import { HistoryListen, ReadStateFromUrl } from "./history.js";
// import logger from "./web_modules/hyperapp-v2-basiclogger.js";

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

app({
  init: [
    initialState,
    // CleanPreferencesOnErrorListen,
    LoadPreferences,
    fetchReport,
    ChartListen,
    ReadStateFromUrl,
    SavePreferencesListen,
    HistoryListen
  ],
  view,
  // middleware: logger,
  node: document.getElementById("app")
});

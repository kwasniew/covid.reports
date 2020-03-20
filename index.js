import { h, app } from "./web_modules/hyperapp.js";
import { request } from "./web_modules/@hyperapp/http.js";
import htm from "./web_modules/htm.js";
import { preventDefault, targetValue } from "./web_modules/@hyperapp/events.js";

const html = htm.bind(h);

const GotReport = (state, report) => ({ ...state, report });
const fetchReport = request({
  url: "https://pomber.github.io/covid19/timeseries.json",
  expect: "json",
  action: GotReport
});
const SelectCountry = (state, currentCountry) => ({
    ...state,
    currentCountry,
});
const unique = list => [...new Set(list)];
const AddCountry = state => ({
    ...state,
    selectedCountries: unique([...state.selectedCountries, state.currentCountry]),
});
const RemoveCountry = country => state => ({
    ...state,
    selectedCountries: state.selectedCountries.filter(c => c !== country)
});

const countryNames = report => Object.keys(report).sort();

const selectedOption = (selected, name) => selected === name ? html`<option selected value="${name}">${name}</option>` : html`<option value="${name}">${name}</option>`

app({
  init: [{ report: {}, currentCountry: "Poland", selectedCountries: [] }, fetchReport],
  view: state =>console.log(state) ||
    html`
      <div>
      <select oninput=${[SelectCountry, targetValue]} class="countries"> 
            ${countryNames(state.report).map(name => selectedOption(state.currentCountry, name))}
      </select>
      <button onclick=${AddCountry}>Select</button>
      <ul>
      ${Array.from(state.selectedCountries).map(country => html`<li onclick=${RemoveCountry(country)}>${country} (x)</li>`)}
</ul>
      </div>
    `,
  node: document.getElementById("control-panel")
});

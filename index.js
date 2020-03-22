import { app, h } from "./web_modules/hyperapp.js";
import { request } from "./web_modules/@hyperapp/http.js";
import htm from "./web_modules/htm.js";
import { preventDefault, targetValue } from "./web_modules/@hyperapp/events.js";
import { stringToHex } from "./stringToColor.js";
import { countries } from "./countries.js";
import orderBy from "./web_modules/lodash.orderby.js";
import pick from "./web_modules/lodash.pick.js";
import { updateChart, ChartListen } from "./chart.js";
import { addCustomStatsToReport } from "./stats.js";
import cc from "./web_modules/classcat.js";

const html = htm.bind(h);

const GotReport = (state, report) => {
  const newState = {
    ...state,
    report: addCustomStatsToReport({ report, reportType: state.reportType })
  };
  return [newState, [updateChart(newState)]];
};
const fetchReport = request({
  url: "https://pomber.github.io/covid19/timeseries.json",
  expect: "json",
  action: GotReport
});

const SetDateFrom = (state, dateFrom) => {
    const newState = {...state, dateFrom};
    return [newState, [updateChart(newState)]];
};

const RemoveDateFrom = state => {
    const newState = {...state, dateFrom: ""};
    return [newState, [updateChart(newState)]];
};

const AddCountry = currentCountry => state => {
  const newState = {
    ...state,
    currentCountry,
    selectedCountries: unique([...state.selectedCountries, currentCountry])
  };
  return [newState, [updateChart(newState)]];
};
const SelectCountry = currentCountry => state => {
  const newState = {
    ...state,
    currentCountry
  };
  return newState;
};
const ChangeReportType = reportType => state => {
  const report = addCustomStatsToReport({ report: state.report, reportType });
  const newState = {
    ...state,
    reportType,
    report,
    sortOrder: ["lastCases", "desc"]
  };
  return [newState, [updateChart(newState)]];
};

const unique = list => [...new Set(list)];
const AddSelectedCountry = (state, currentCountry) =>
  AddCountry(currentCountry)(state);
const RemoveCountry = country => state => {
  const newState = {
    ...state,
    selectedCountries: state.selectedCountries.filter(c => c !== country)
  };
  return [newState, [updateChart(newState)]];
};

const negateOrder = order => (order === "asc" ? "desc" : "asc");

const SortBy = newSortBy => state => {
  const [oldSortBy, oldDirection] = state.sortOrder;
  return {
    ...state,
    sortOrder: [
      newSortBy,
      oldSortBy === newSortBy
        ? negateOrder(oldDirection)
        : newSortBy === "name"
        ? "asc"
        : "desc"
    ]
  };
};

const sortedCountryNames = Object.keys(countries).sort();

const selectedOption = (selected, name) =>
  selected === name
    ? html`
        <option selected value="${name}">${name}</option>
      `
    : html`
        <option value="${name}">${name}</option>
      `;

const isActive = state => country => state.selectedCountries.includes(country);

const countryHighlight = state => country => {
  const isCountryActive = isActive(state)(country);

  if (isCountryActive) {
    return { "font-weight": "bold", color: stringToHex(country) };
  } else {
    return {};
  }
};

const countryAction = state => country => {
  const isCountryActive = isActive(state)(country);

  if (isCountryActive) {
    return RemoveCountry(country);
  } else {
    return AddCountry(country);
  }
};

const countrySvg = state => country => {
  const isCountryActive = isActive(state)(country);

  if (isCountryActive) {
    return html`
      <path
        onmouseover=${SelectCountry(country)}
        stroke="${stringToHex(country)}"
        fill="${stringToHex(country)}"
        onclick=${RemoveCountry(country)}
        id="${country}"
        d="${countries[country].d}"
      />
    `;
  } else {
    return html`
      <path
        onmouseover=${SelectCountry(country)}
        onclick=${AddCountry(country)}
        fill="#dddddd"
        stroke="#111111"
        id="${country}"
        d="${countries[country].d}"
      />
    `;
  }
};

const sorted = ({ report, sortOrder: [sortBy, asc] }) =>
  orderBy(
    Object.entries(pick(report, sortedCountryNames)).map(
      ([name, { growth, totalCases, lastCases }]) => ({
        name,
        growth,
        totalCases,
        lastCases
      })
    ),
    [sortBy],
    [asc]
  );

const sortIcon = current => ({ sortOrder: [name, asc] }) => {
  if (current !== name) {
    return html``;
  }
  return asc === "asc"
    ? html`
        ▲
      `
    : html`
        ▼
      `;
};

const tableHeader = (name, text) => state => {
  return html`
    <th class="c-hand" onclick=${SortBy(name)}>
      <span>${text} ${sortIcon(name)(state)}</span>
    </th>
  `;
};

const dateChip = dateFrom => dateFrom ? html`
  <span
    class="chip"
    onclick=${RemoveDateFrom}
  >
    ${dateFrom}
    <span
      class="btn btn-clear"
      href="#"
      aria-label="Remove Date"
      role="button"
    ></span>
  </span>
` : "";

const countryChip = name => state => html`
  <span
    class="chip"
    onclick=${countryAction(state)(name)}
    style=${countryHighlight(state)(name)}
  >
    ${name}
    <span
      class="btn btn-clear"
      href="#"
      aria-label="Remove Country"
      role="button"
    ></span>
  </span>
`;

const chipOrName = name => state =>
  isActive(state)(name) ? countryChip(name)(state) : name;

const selectionCriteria = state => html`
  <div class="m-2">
    ${dateChip(state.dateFrom)}
    ${Array.from(state.selectedCountries).map(name => countryChip(name)(state))}
  </div>
`;

const Container = (props, children) => html`
  <div class="${props.class || ""} mt-2 pt-2 pb-2">
    <div class="container grid-md">
      ${children}
    </div>
  </div>
`;

const header = html`
  <${Container} class="bg-primary">
      <header>
        <div class="navbar">
          <section class="navbar-section">
            <span class="navbar-brand text-bold text-light mt-2"
              >Covid Reports</span
            >
          </section>
          <section class="navbar-section">
            <a
              href="https://github.com/kwasniew/covid.reports"
              class="btn btn-link text-light"
              >GitHub</a
            >
          </section>
        </div>
        <div class="hero hero-sm">
          <div class="hero-body columns">
            <div class="column col-auto">
              <figure
                class="avatar avatar-xl badge"
                data-badge="19"
                data-initial="YZ"
              >
                <img
                  src="https://picturepan2.github.io/spectre/img/avatar-1.png"
                />
              </figure>
            </div>
            <div class="column column-center">
              <kbd class="text-large"
                >Coronavirus trends comparison by country</kbd
              >
            </div>
          </div>
        </div>
      </header>
  </Container>
`;

const table = state => html`
  <${Container} class="bg-gray">
        <table class="table">
          <tr>
            ${tableHeader("name", "Country")(state)}
            ${tableHeader("growth", "Weekly Growth Rate")(state)}
            ${tableHeader("totalCases", "Total cases")(state)}
            ${tableHeader("lastCases", "Last week cases")(state)}
          </tr>
          ${sorted(state).map(
            ({ name, growth, totalCases, lastCases }) => html`
              <tr
                class="c-hand"
                onclick=${countryAction(state)(name)}
                style=${countryHighlight(state)(name)}
              >
                <td>${chipOrName(name)(state)}</td>
                <td>${growth}%</td>
                <td>${totalCases}</td>
                <td>${lastCases}</td>
              </tr>
            `
          )}
        </table>
  </Container>
`;

const map = state => html`
  <div class="mt-2">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1001">
      ${sortedCountryNames.map(countrySvg(state))}
    </svg>
  </div>
`;

const select = state => html`
  <div class="m-2 p-2">
    <div class=" form-group input-group">
      <select
        oninput=${[AddSelectedCountry, targetValue]}
        class="countries form-select"
      >
        ${sortedCountryNames.map(name =>
          selectedOption(state.currentCountry, name)
        )}
      </select>
    </div>
  </div>
`;

const chart = html`
  <div>
    <figure class="figure">
      <canvas id="chart"></canvas>
      <figcaption class="figure-caption text-right text-normal">
        <sup>
          ${"*Data comes from "}
          <a href="https://github.com/pomber/covid19">
            https://github.com/pomber/covid19 </a
          >${" and is updated three times a day."}
        </sup>
      </figcaption>
    </figure>
  </div>
`;

const main = state => html`
  <${Container}>
      ${selectionCriteria(state)} ${chart} ${select(state)} ${map(state)}
      ${selectionCriteria(state)}
   </Container>
`;

const tab = ({ reportType }) => html`
 <${Container}>
    <ul class="tab tab-block">
      <li class=${cc({ "tab-item": true, active: reportType === "confirmed" })}>
        <a href="#" onclick=${preventDefault(
          ChangeReportType("confirmed")
        )}>Confirmed</a>
      </li>
      <li class=${cc({ "tab-item": true, active: reportType === "deaths" })}>
        <a href="#" onclick=${preventDefault(
          ChangeReportType("deaths")
        )}>Deaths</a>
      </li>
    </ul>
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
  currentCountry: "Italy",
  selectedCountries: ["China", "Italy"],
  sortOrder: ["lastCases", "desc"]
};

app({
  init: [initialState, fetchReport, ChartListen(SetDateFrom)],
  view,
  node: document.getElementById("app")
});

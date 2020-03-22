import { h, app } from "./web_modules/hyperapp.js";
import { request } from "./web_modules/@hyperapp/http.js";
import htm from "./web_modules/htm.js";
import { targetValue } from "./web_modules/@hyperapp/events.js";
import { stringToHex } from "./stringToColor.js";
import { countries } from "./countries.js";
import mapValues from "./web_modules/lodash.mapvalues.js";
import orderBy from "./web_modules/lodash.orderby.js";
import pick from "./web_modules/lodash.pick.js";
import {updateChart} from "./chart.js";

const confirmed = stats => stats.confirmed;


const html = htm.bind(h);

const lastNDays = (dataPoints, days) => dataPoints.slice(-days);

const calculateGrowth = (dataPoints, days) => {
  const lastDays = lastNDays(dataPoints, days);
  const past = lastDays[0] || 1;
  const present = lastDays[lastDays.length - 1];
  return (100 * (present - past)) / past;
};

const lastWeekCases = dataPoints => {
  const lastDays = lastNDays(dataPoints, 7);
  const past = lastDays[0];
  const present = lastDays[lastDays.length - 1];
  return present - past;
};

const GotReport = (state, report) => {
  const enhancedReport = mapValues(report, stats =>
    Object.assign(stats, {
      weeklyGrowth: Math.round(calculateGrowth(stats.map(confirmed), 7)),
      lastWeekCases: lastWeekCases(stats.map(confirmed)),
      totalCases: confirmed(stats[stats.length - 1])
    })
  );
  const newState = { ...state, report: enhancedReport };
  return [newState, [updateChart(newState)]];
};
const fetchReport = request({
  url: "https://pomber.github.io/covid19/timeseries.json",
  expect: "json",
  action: GotReport
});

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
      ([name, { weeklyGrowth, totalCases, lastWeekCases }]) => ({
        name,
        weeklyGrowth,
        totalCases,
        lastWeekCases
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

const chip = name => state => html`
    <span class="chip" onclick=${countryAction(state)(name)}
            style=${countryHighlight(state)(name)}>
            ${name}
            <span
              class="btn btn-clear"
              href="#"
              aria-label="Close"
              role="button"
            ></span>
            
</span>
`;

const chipOrName = name => state => isActive(state)(name) ? chip(name)(state) : name;

const selectedCountries = state => html`
  <div class="m-2">
    ${Array.from(state.selectedCountries).map(
      name =>
        chip(name)(state)
    )}
  </div>
`;

app({
  init: [
    {
      report: {},
      currentCountry: "Italy",
      selectedCountries: ["China", "Italy"],
      sortOrder: ["lastWeekCases", "desc"]
    },
    fetchReport
  ],
  view: state =>
    html`
      <div>
        <div class="bg-primary">
          <header class="container grid-md">
            <div class="navbar">
              <section class="navbar-section">
                <span class="navbar-brand text-bold text-light mt-2"
                  >Covid Reports</span
                >
              </section>
              <section class="navbar-section">
                <a
                  href="https://github.com/kwasniew/corona"
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
                  <kbd class="text-large">Reported Coronavirus cases trends by country</kbd>
                </div>
              </div>
            </div>
          </header>
        </div>
        <div class="container grid-md">
          ${selectedCountries(state)}
          <canvas id="chart"></canvas>
          <div class="mt-2">
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
          <div class="mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1001">
              ${sortedCountryNames.map(countrySvg(state))}
            </svg>
          </div>
          ${selectedCountries(state)}
        </div>
        <div class="bg-gray">
          <table class="table container grid-md">
            <tr>
              ${tableHeader("name", "Country")(state)}
              ${tableHeader("weeklyGrowth", "Weekly Growth Rate")(state)}
              ${tableHeader("totalCases", "Total cases")(state)}
              ${tableHeader("lastWeekCases", "Last week cases")(state)}
            </tr>
            ${sorted(state).map(
              ({ name, weeklyGrowth, totalCases, lastWeekCases }) => html`
                <tr
                  class="c-hand"
                  onclick=${countryAction(state)(name)}
                  style=${countryHighlight(state)(name)}
                >
                  <td>${chipOrName(name)(state)}</td>
                  <td>${weeklyGrowth}%</td>
                  <td>${totalCases}</td>
                  <td>${lastWeekCases}</td>
                </tr>
              `
            )}
          </table>
        </div>
      </div>
    `,
  node: document.getElementById("control-panel")
});

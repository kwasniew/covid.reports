import { h, app } from "./web_modules/hyperapp.js";
import { request } from "./web_modules/@hyperapp/http.js";
import htm from "./web_modules/htm.js";
import { targetValue } from "./web_modules/@hyperapp/events.js";
import Chart from "./web_modules/chart.js/dist/Chart.js";
import { stringToRGB, stringToHex } from "./stringToColor.js";
import { countries } from "./countries.js";
import mapValues from "./web_modules/lodash.mapvalues.js";
import orderBy from "./web_modules/lodash.orderby.js";
import zip from "./web_modules/lodash.zip.js";
import unzip from "./web_modules/lodash.unzip.js";
import dropWhile from "./web_modules/lodash.dropwhile.js";
import pick from "./web_modules/lodash.pick.js";

const personify = d => d + (d === 1 ? " person" : " people");

Object.assign(window, zip, unzip, dropWhile);

let chart = null;
const makeChart = data => {
  if (chart) {
    chart.data.labels = data.labels;
    chart.data.datasets = data.datasets;
    chart.update();
    return;
  }

  chart = new Chart("chart", {
    type: "line",
    data: {
      labels: data.labels,
      datasets: data.datasets
    },
    options: {}
  });
  return chart;
};

const confirmed = stats => stats.confirmed;

const updateChart = state => [
  () => {
    const data = toChartData(state);
    makeChart(data);
  }
];

const toChartData = state => {
  const datasets = state.selectedCountries
    .map(name => {
      const { r, g, b } = stringToRGB(name);
      return state.report[name]
        ? {
            label: name,
            data: state.report[name].map(confirmed),
            backgroundColor: [`rgba(${r}, ${g}, ${b}, 0.2)`],
            borderColor: [`rgba(${r}, ${g}, ${b}, 1)`]
          }
        : null;
    })
    .filter(x => x);

  const days = dropWhile(zip(...datasets.map(set => set.data)), cases =>
    cases.every(x => x === 0)
  );
  const length = days.length;
  const cleanData = unzip(
    dropWhile(zip(...datasets.map(set => set.data)), cases =>
      cases.every(x => x === 0)
    )
  );

  const cleanDatasets = datasets.map((dataset, i) => ({
    ...dataset,
    data: cleanData[i]
  }));

  const [first] = datasets;
  return {
    labels: first
      ? state.report[first.label].map(stats => stats.date).slice(-length)
      : [],
    datasets: cleanDatasets
  };
};

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
const SelectCountry = (state, currentCountry) => ({
  ...state,
  currentCountry
});
const AddCountry = currentCountry => state => {
  const newState = {
    ...state,
    currentCountry,
    selectedCountries: unique([...state.selectedCountries, currentCountry])
  };
  return [newState, [updateChart(newState)]];
};

const unique = list => [...new Set(list)];
const AddSelectedCountry = state => {
  const newState = {
    ...state,
    selectedCountries: unique([
      ...state.selectedCountries,
      state.currentCountry
    ])
  };
  return [newState, [updateChart(newState)]];
};
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
      oldSortBy === newSortBy ? negateOrder(oldDirection) : "desc"
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
        onclick=${AddCountry(country)}
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

app({
  init: [
    {
      report: {},
      currentCountry: "Poland",
      selectedCountries: ["Poland"],
      sortOrder: ["name", "asc"]
    },
    fetchReport
  ],
  view: state =>
    console.log(state) ||
    html`
      <div class="mt-2">
        <div class="mt-2">
          <h4 class="mt-2">Select country from a map</h4>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1001">
            ${sortedCountryNames.map(countrySvg(state))}
          </svg>
        </div>
        <div class="mt-2">
          <h4>Or from the list</h4>
          <div class=" form-group input-group">
            <select
              oninput=${[SelectCountry, targetValue]}
              class="countries form-select"
            >
              ${sortedCountryNames.map(name =>
                selectedOption(state.currentCountry, name)
              )}
            </select>
            <button class="btn" onclick=${AddSelectedCountry}>Select</button>
          </div>

          <div>
            <ul>
              ${Array.from(state.selectedCountries).map(
                name =>
                  html`
                    <li
                      onclick=${countryAction(state)(name)}
                      style=${countryHighlight(state)(name)}
                    >
                      ${name} (x)
                    </li>
                  `
              )}
            </ul>
          </div>
        </div>
        <h4>Or from the table</h4>
        <table class="table">
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
                <td>${name}</td>
                <td>${weeklyGrowth}%</td>
                <td>${totalCases}</td>
                <td>${lastWeekCases}</td>
              </tr>
            `
          )}
        </table>
      </div>
    `,
  node: document.getElementById("control-panel")
});

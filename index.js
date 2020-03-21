import { h, app } from "./web_modules/hyperapp.js";
import { request } from "./web_modules/@hyperapp/http.js";
import htm from "./web_modules/htm.js";
import { targetValue } from "./web_modules/@hyperapp/events.js";
import Chart from "./web_modules/chart.js/dist/Chart.js";
import { stringToRGB, stringToHex } from "./stringToColor.js";
import { countries } from "./countries.js";


const personify = d => d + (d === 1 ? " person" : " people");

let chart = null;
const makeChart = data => {
  console.log("data", data);
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

const updateChart = data => [
  () => {
    makeChart(data);
  }
];

const toChartData = state => {
  const [firstCountry] = state.selectedCountries;
  return {
    labels: firstCountry
      ? state.report[firstCountry].map(stats => stats.date)
      : [],
    datasets: state.selectedCountries.map(name => {
      const { r, g, b } = stringToRGB(name);
      return {
        label: name,
        data: state.report[name].map(stats => stats.confirmed),
        backgroundColor: [`rgba(${r}, ${g}, ${b}, 0.2)`],
        borderColor: [`rgba(${r}, ${g}, ${b}, 1)`]
      };
    })
  };
};

const html = htm.bind(h);

const GotReport = (state, report) => ({ ...state, report });
const fetchReport = request({
  url: "https://pomber.github.io/covid19/timeseries.json",
  expect: "json",
  action: GotReport
});
const SelectCountry = (state, currentCountry) => ({
  ...state,
  currentCountry
});
const AddCountryFromMap = currentCountry => state => {
    const newState = {
        ...state,
        selectedCountries: unique([
            ...state.selectedCountries,
            currentCountry
        ])
    };
    return [newState, [updateChart(toChartData(newState))]];
};
const RemoveCountryFromMap = currentCountry => state => {
    const newState = {
        ...state,
        selectedCountries: state.selectedCountries.filter(country => currentCountry !== country)
    };
    return [newState, [updateChart(toChartData(newState))]];
};
const unique = list => [...new Set(list)];
const AddCountry = state => {
  const newState = {
    ...state,
    selectedCountries: unique([
      ...state.selectedCountries,
      state.currentCountry
    ])
  };
  return [newState, [updateChart(toChartData(newState))]];
};
const RemoveCountry = country => state => {
  const newState = {
    ...state,
    selectedCountries: state.selectedCountries.filter(c => c !== country)
  };
  return [newState, [updateChart(toChartData(newState))]];
};

const countryNames = report => Object.keys(report).sort();

const selectedOption = (selected, name) =>
  selected === name
    ? html`
        <option selected value="${name}">${name}</option>
      `
    : html`
        <option value="${name}">${name}</option>
      `;

const isActive = state => country => state.selectedCountries.includes(country);

app({
  init: [
    { report: {}, currentCountry: "Poland", selectedCountries: [] },
    fetchReport
  ],
  view: state =>
    console.log(state) ||
    html`
      <div>
        <select oninput=${[SelectCountry, targetValue]} class="countries">
          ${countryNames(state.report).map(name =>
            selectedOption(state.currentCountry, name)
          )}
        </select>
        <button onclick=${AddCountry}>Select</button>
        <ul>
          ${Array.from(state.selectedCountries).map(
            country =>
              html`
                <li onclick=${RemoveCountry(country)}>${country} (x)</li>
              `
          )}
        </ul>

        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1001">
          ${Object.keys(countries).map(
            country => html`
              <path stroke="${isActive(state)(countries[country].name) ? stringToHex(countries[country].name) : ""}" 
              onclick=${isActive(state)(countries[country].name) ? RemoveCountryFromMap(countries[country].name) : AddCountryFromMap(countries[country].name)} id="${country}" d="${countries[country].d}" />
            `
          )}
        </svg>
      </div>
    `,
  node: document.getElementById("control-panel")
});

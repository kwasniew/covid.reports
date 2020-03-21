import {h, app} from "./web_modules/hyperapp.js";
import {request} from "./web_modules/@hyperapp/http.js";
import htm from "./web_modules/htm.js";
import {targetValue} from "./web_modules/@hyperapp/events.js";
import Chart from "./web_modules/chart.js/dist/Chart.js";
import {stringToRGB, stringToHex} from "./stringToColor.js";
import {countries} from "./countries.js";
import mapValues from "./web_modules/lodash.mapvalues.js";
import orderBy from "./web_modules/lodash.orderby.js";

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

const confirmed = stats => stats.confirmed;

const updateChart = state => [
    () => {
        const data = toChartData(state);
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
            const {r, g, b} = stringToRGB(name);
            return {
                label: name,
                data: state.report[name].map(confirmed),
                backgroundColor: [`rgba(${r}, ${g}, ${b}, 0.2)`],
                borderColor: [`rgba(${r}, ${g}, ${b}, 1)`]
            };
        })
    };
};

const html = htm.bind(h);

const calculateGrowth = (dataPoints, days) => {
    const lastDays = dataPoints.slice(-days);
    const past = lastDays[0] || 1;
    const present = lastDays[lastDays.length - 1];
    return 100 * (present - past) / past;
};


const GotReport = (state, report) => {
    const enhancedReport = mapValues(report, stats => Object.assign(stats, {
        weeklyGrowth: Math.round(calculateGrowth(stats.map(confirmed), 7)),
        totalCases: confirmed(stats[stats.length - 1])
    }));
    const newState = {...state, report: enhancedReport};
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
        selectedCountries: unique([
            ...state.selectedCountries,
            currentCountry
        ])
    };
    return [newState, [updateChart(newState)]];
};
const RemoveCountryFromMap = currentCountry => state => {
    const newState = {
        ...state,
        selectedCountries: state.selectedCountries.filter(country => currentCountry !== country)
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
    return [newState, [updateChart((newState))]];
};
const RemoveCountry = country => state => {
    const newState = {
        ...state,
        selectedCountries: state.selectedCountries.filter(c => c !== country)
    };
    return [newState, [updateChart(newState)]];
};

const negateOrder = order => order === "asc" ? "desc" : "asc";

const SortBy = newSortBy => state => {
    const [oldSortBy, oldDirection] = state.sortOrder;
    return {...state, sortOrder: [newSortBy, oldSortBy === newSortBy ? negateOrder(oldDirection) : "desc"]};
};

const sortCountryNames = report => Object.keys(report).sort();

const selectedOption = (selected, name) =>
    selected === name
        ? html`
        <option selected value="${name}">${name}</option>
      `
        : html`
        <option value="${name}">${name}</option>
      `;

const isActive = state => country => state.selectedCountries.includes(country);

const countrySvg = state => country => {
    const isCountryActive = isActive(state)(country);

    if (isCountryActive) {
        return html`
              <path stroke="${stringToHex(country)}" fill="${stringToHex(country)}"
              onclick=${RemoveCountryFromMap(country)} id="${country}" d="${countries[country].d}" />
            `;
    } else {
        return html`
              <path  
              onclick=${AddCountry(country)} id="${country}" d="${countries[country].d}" />
            `;
    }
};



const sorted = ({report, sortOrder: [name, asc]}) => orderBy(Object.entries(report)
        .map(([name, {weeklyGrowth, totalCases}]) => ({name, weeklyGrowth, totalCases}))
    , [name], [asc]);

app({
    init: [
        {report: {}, currentCountry: "Poland", selectedCountries: ["Poland"], sortOrder: ["name", "asc"]},
        fetchReport
    ],
    view: state =>
        console.log(state) ||
        html`
      <div>
        <select oninput=${[SelectCountry, targetValue]} class="countries">
          ${sortCountryNames(state.report).map(name =>
            selectedOption(state.currentCountry, name)
        )}
        </select>
        <button onclick=${AddSelectedCountry}>Select</button>
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
            countrySvg(state)
        )}
        </svg>
        
        <table>
        <tr>
        <th onclick=${SortBy('name')}>Country</th>
        <th onclick=${SortBy('weeklyGrowth')}>Weekly Growth Rate</th>
        <th onclick=${SortBy('totalCases')}>Total cases</th>
</tr>
       ${sorted(state).map(({name, weeklyGrowth, totalCases}) => html`
            <tr>
                <td onclick=${AddCountry(name)}>${name}</td>
                <td>${weeklyGrowth}%</td>
                <td>${totalCases}</td>
            
</tr>
       `)}
</table>
      </div>
    `,
    node: document.getElementById("control-panel")
});

import {h, app} from "./web_modules/hyperapp.js";
import {request} from "./web_modules/@hyperapp/http.js";
import htm from "./web_modules/htm.js";
import {targetValue} from "./web_modules/@hyperapp/events.js";
import Chart from './web_modules/chart.js/dist/Chart.js';
import {stringToRGB} from "./stringToColor.js";

// const initialData = {
//     labels: [
//         "29/01", "29/01", "29/01", "29/01", "29/01"
//     ],
//     datasets: [
//         {name: "China", type: "line", values: [0,0,0,0,0]},
//         // {name: "Poland", type: "line", values: [1, 20, 30, 40, 5]},
//         // {name: "Italy", type: "line", values: [100, 200, 300, 40, 5]},
//         // {name: "Italy1", type: "line", values: [120, 220, 300, 40, 5]},
//     ]
// };

const personify = d => d + (d === 1 ? " person" : " people");

// let chart;
// const makeApexChart = ({series, categories}) => {
//     if(chart) {
//         chart.updateSeries(series);
//         return;
//     }
//     const newChart = new ApexCharts(document.querySelector('#chart'), {
//         chart: {
//             type: 'line'
//         },
//         series,
//         xaxis: {
//             categories
//         }
//     });
//     newChart.render();
//     return newChart;
// };

// const makeChart = (data) => new Chart("#chart", { // or DOM element
//     data,
//     title: "Coronavirus Confirmed Cases",
//     type: 'line', // or 'bar', 'line', 'pie', 'percentage'
//     height: 800,
//
//     tooltipOptions: {
//         formatTooltipX: d => d,
//         formatTooltipY: personify,
//     },
//     axisOptions: {
//         // xAxisMode: 'tick',
//         // yAxisMode: 'tick',
//         truncateLegends: true
//     }
// });

let chart = null;
const makeChart = data => {
    console.log("data", data);
    if(chart) {
        chart.data.labels = data.labels;
        chart.data.datasets = data.datasets;
        chart.update();
        return;
    }

    chart = new Chart("chart", {
        type: 'line',
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
        labels: firstCountry ? state.report[firstCountry].map(stats => stats.date) : [],
        datasets: state.selectedCountries.map(name => {
            const {r,g,b} = stringToRGB(name);
            return {
                label: name,
                data: state.report[name].map(stats => stats.confirmed),
                backgroundColor: [
                        `rgba(${r}, ${g}, ${b}, 0.2)`
                ],
                borderColor: [
                        `rgba(${r}, ${g}, ${b}, 1)`
                ],
            }
        })
    };
};

const html = htm.bind(h);

const GotReport = (state, report) => ({...state, report});
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
const AddCountry = state => {
    const newState = {
        ...state,
        selectedCountries: unique([...state.selectedCountries, state.currentCountry]),
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

const selectedOption = (selected, name) => selected === name ? html`<option selected value="${name}">${name}</option>` : html`<option value="${name}">${name}</option>`

app({
    init: [{report: {}, currentCountry: "Poland", selectedCountries: []}, fetchReport],
    view: state => console.log(state) ||
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

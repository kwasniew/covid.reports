import Chart from "./web_modules/chart.js/dist/Chart.js";
import {stringToRGB} from "./stringToColor.js";
import dropWhile from "./web_modules/lodash.dropwhile.js";
import zip from "./web_modules/lodash.zip.js";
import unzip from "./web_modules/lodash.unzip.js";
import prop from "./web_modules/lodash.property.js";

let chart;
const updateChartData = data => {
    chart.data.labels = data.labels;
    chart.data.datasets = data.datasets;
    chart.update();
};

const createChart = ({labels, datasets}) =>
    new Chart("chart", {
        type: "line",
        data: {
            labels,
            datasets
        },
        options: {
            legend: false,
            tooltips: {
                mode: "point",
                displayColors: true
            },
            onClick(e, item) {
                if (item.length > 0) {
                    const {_index} = item[0];
                    const label = chart.data.labels[_index];
                    ChartListen.dispatch(label);
                }
            }
        }
    });

export const ChartListen = action => [(dispatch, action) => {
    ChartListen.dispatch = label => dispatch(action, label);
    return () => {
    };
}, action];

const createOrUpdateChart = data => {
    if (chart) {
        updateChartData(data);
    } else if (document.getElementById("chart")) {
        chart = createChart(data);
    } else {
        requestAnimationFrame(() => createOrUpdateChart(data));
    }
};

const toChartDataItem = ({report, reportType}) => name => {
    const {r, g, b} = stringToRGB(name);
    return report[name]
        ? {
            label: name,
            data: report[name].map(prop(reportType)),
            backgroundColor: `rgba(${r}, ${g}, ${b}, 0.2)`,
            pointBackgroundColor: `rgba(${r}, ${g}, ${b}, 1)`,
            borderColor: `rgba(${r}, ${g}, ${b}, 1)`
        }
        : null;
};

const isZerosArray = cases => cases.every(x => x === 0);

const trimLeadingData = datasets => {
    const daysWithCases = dropWhile(
        zip(...datasets.map(prop("data"))),
        isZerosArray
    );
    const length = daysWithCases.length;
    const cleanData = unzip(daysWithCases);

    const cleanDatasets = datasets.map((dataset, i) => ({
        ...dataset,
        data: cleanData[i] || []
    }));

    return {cleanDatasets, length};
};

const trimLeadingLabels = ({report, datasets, length}) => {
    const [first] = datasets;
    return first && first.data.length > 0
        ? report[first.label].map(stats => stats.date).slice(-length)
        : [];
};

export const toChartData = ({selectedCountries, reportType, report, dateFrom}) => {
    const datasets = selectedCountries
        .map(toChartDataItem({report, reportType}))
        .filter(x => x);

    const {cleanDatasets, length} = trimLeadingData(datasets);

    const labels = trimLeadingLabels({report, datasets: cleanDatasets, length});
    return {labels, datasets: cleanDatasets};
};

export const updateChart = state => [
    () => {
        createOrUpdateChart(toChartData(state));
    }
];


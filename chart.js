import Chart from "./web_modules/chart.js/dist/Chart.js";
import { stringToRGB } from "./stringToColor.js";
import dropWhile from "./web_modules/lodash.dropwhile.js";
import zip from "./web_modules/lodash.zip.js";
import unzip from "./web_modules/lodash.unzip.js";
import prop from "./web_modules/lodash.property.js";

let chart = null;
const makeChart = data => {
  if (chart) {
    chart.data.labels = data.labels;
    chart.data.datasets = data.datasets;
    chart.update();
    return;
  }

  requestAnimationFrame(() => {
    chart = new Chart("chart", {
      type: "line",
      data: {
        labels: data.labels,
        datasets: data.datasets
      },
      options: {
        legend: false,
        tooltips: {
          mode: "point",
          displayColors: true
        }
      }
    });
  });
};

export const toChartData = state => {
  const datasets = state.selectedCountries
    .map(name => {
      const { r, g, b } = stringToRGB(name);
      return state.report[name]
        ? {
            label: name,
            data: state.report[name].map(prop(state.reportType)),
            backgroundColor: `rgba(${r}, ${g}, ${b}, 0.2)`,
            pointBackgroundColor: `rgba(${r}, ${g}, ${b}, 1)`,
            borderColor: `rgba(${r}, ${g}, ${b}, 1)`
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

export const updateChart = state => [
  () => {
    const data = toChartData(state);
    makeChart(data);
  }
];

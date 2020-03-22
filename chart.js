import Chart from "./web_modules/chart.js/dist/Chart.js";
import { stringToRGB } from "./stringToColor.js";
import dropWhile from "./web_modules/lodash.dropwhile.js";
import zip from "./web_modules/lodash.zip.js";
import unzip from "./web_modules/lodash.unzip.js";
import prop from "./web_modules/lodash.property.js";

let chart = null;
const makeChart = data => {
  if (chart) {
    // chart.data.labels.pop();
    // chart.data.datasets.forEach((dataset) => {
    //   dataset.data.pop();
    // });
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

const toChartDataItem = ({report, reportType}) => name => {
  const { r, g, b } = stringToRGB(name);
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

const trimLeadingData = datasets => {
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

export const toChartData = ({selectedCountries, reportType, report}) => {
  const datasets = selectedCountries
    .map(toChartDataItem({report, reportType}))
    .filter(x => x);
  const {cleanDatasets, length} = trimLeadingData(datasets);

  const labels = trimLeadingLabels({report, datasets: cleanDatasets, length});
  return {labels, datasets: cleanDatasets};
};

export const updateChart = state => [
  () => {
    const data = toChartData(state);
    makeChart(data);
  }
];

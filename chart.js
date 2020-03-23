import Chart from "./web_modules/chart.js/dist/Chart.js";
import { stringToRGB } from "./stringToColor.js";
import dropWhile from "./web_modules/lodash.dropwhile.js";
import zip from "./web_modules/lodash.zip.js";
import unzip from "./web_modules/lodash.unzip.js";
import prop from "./web_modules/lodash.property.js";
import { html } from "./html.js";

let chart;
const updateChartData = data => {
  chart.data.labels = data.labels;
  chart.data.datasets = data.datasets;
  chart.update();
};

const createChart = ({ labels, datasets }) =>
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
          const { _index } = item[0];
          const label = chart.data.labels[_index];
          ChartSubscription.dispatch(label);
        }
      }
    }
  });

const ChartSubscription = action => [
  (dispatch, action) => {
    ChartSubscription.dispatch = label => dispatch(action, label);
    return () => {};
  },
  action
];

const SetDateFrom = (state, dateFrom) => {
  const newState = { ...state, dateFrom };
  return [newState, [updateChart(newState)]];
};

export const ChartListen = ChartSubscription(SetDateFrom);

const createOrUpdateChart = data => {
  if (chart) {
    updateChartData(data);
  } else if (document.getElementById("chart")) {
    chart = createChart(data);
  } else {
    requestAnimationFrame(() => createOrUpdateChart(data));
  }
};

const toChartDataItem = ({ report, reportType }) => name => {
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

const isZero = x => x === 0;
const isZerosArray = cases => cases.every(isZero);

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

  return { cleanDatasets, length };
};

const listLabels = ({ report, datasets }) => {
  const [first] = datasets;
  return first && first.data.length > 0
    ? report[first.label].map(stats => stats.date)
    : [];
};

const trimLeadingLabels = ({ report, datasets, length }) =>
  listLabels({ report, datasets }).slice(-length);

const dateBasedStrategy = ({ report, datasets, dateFrom }) => {
  const labels = dropWhile(
    listLabels({ report, datasets }),
    label => label !== dateFrom
  );
  const length = labels.length;
  const trimmedDatasets = datasets.map(dataset => ({
    ...dataset,
    data: dataset.data.slice(-length)
  }));
  return { labels, datasets: trimmedDatasets };
};

const fromPatientZeroStrategy = ({ report, datasets }) => {
  const { cleanDatasets, length } = trimLeadingData(datasets);
  const labels = trimLeadingLabels({ report, datasets: cleanDatasets, length });

  return { labels, datasets: cleanDatasets };
};

const alignToPatientZeroStrategy = ({ datasets }) => {
  const trimmedDatasets = datasets.map(dataset => {
    return {
      ...dataset,
      data: dropWhile(dataset.data, isZero)
    };
  });

  const longestDatasetLength = trimmedDatasets.reduce((days, dataset) => {
    return dataset.data.length > days ? dataset.data.length : days;
  }, 0);

  return {
    labels: Array.from({ length: longestDatasetLength }, (v, i) =>
      (i + 1).toString()
    ),
    datasets: trimmedDatasets
  };
};

export const toChartData = ({
  selectedCountries,
  reportType,
  report,
  dateFrom,
  alignToPatientZero
}) => {
  const countryExists = x => x;
  const datasets = selectedCountries
    .map(toChartDataItem({ report, reportType }))
    .filter(countryExists);

  if (dateFrom) {
    return dateBasedStrategy({ report, datasets, dateFrom });
  } else if (alignToPatientZero) {
    return alignToPatientZeroStrategy({ report, datasets });
  } else {
    return fromPatientZeroStrategy({ report, datasets });
  }
};

export const updateChart = state => [
  () => {
    createOrUpdateChart(toChartData(state));
  }
];

export const chartView = html`
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

import Chart from "./web_modules/chart.js/dist/Chart.js";
import { stringToRGB } from "./stringToColor.js";
import dropWhile from "./web_modules/lodash.dropwhile.js";
import zip from "./web_modules/lodash.zip.js";
import unzip from "./web_modules/lodash.unzip.js";
import prop from "./web_modules/lodash.property.js";
import { html } from "./html.js";
import { Strategies } from "./state.js";
import { update } from "./update.js";

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
      elements: {
        line: {
          tension: 0
        }
      },
      scales: {
        yAxes: [
          {
            ticks: {
              precision: 0
            }
          }
        ]
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

const SetFromSelector = (state, from) =>
  update({
    ...state,
    strategy: [state.strategy[0], from]
  });

export const ChartListen = ChartSubscription(SetFromSelector);

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
const isLowerOrEq = n => x => x <= n;
const isZerosArray = cases => cases.every(isZero);

const mapDatasets = (f, datasets) =>
  datasets.map((dataset, i) => ({ ...dataset, data: f(dataset.data, i) }));

const trimLeadingData = datasets => {
  const daysWithCases = dropWhile(
    zip(...datasets.map(prop("data"))),
    isZerosArray
  );
  const length = daysWithCases.length;
  const cleanData = unzip(daysWithCases);

  const cleanDatasets = mapDatasets((data, i) => cleanData[i] || [], datasets);

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

const fromGivenDateStrategy = ({ report, datasets, from }) => {
  const labels = dropWhile(
    listLabels({ report, datasets }),
    label => label !== from
  );
  const length = labels.length;
  const trimmedDatasets = mapDatasets(data => data.slice(-length), datasets);

  return { labels, datasets: trimmedDatasets };
};

const fromFirstDateStrategy = ({ report, datasets }) => {
  const { cleanDatasets, length } = trimLeadingData(datasets);
  const labels = trimLeadingLabels({ report, datasets: cleanDatasets, length });

  return { labels, datasets: cleanDatasets };
};

const fromPatientNStrategy = ({ datasets, from, n }) => {
  const trimmedDatasets = mapDatasets(
    data => dropWhile(data, isLowerOrEq(n)),
    datasets
  );

  const longestDatasetLength = trimmedDatasets.reduce((days, dataset) => {
    return dataset.data.length > days ? dataset.data.length : days;
  }, 0);

  const toHumanDays = length =>
    Array.from({ length }, (v, i) => (i + 1).toString());
  const labels = toHumanDays(longestDatasetLength);

  if (from) {
    const initialDaysToTrim = Number(from) - 1;
    return {
      labels: labels.slice(initialDaysToTrim),
      datasets: mapDatasets(
        data => data.slice(initialDaysToTrim),
        trimmedDatasets
      )
    };
  }

  return {
    labels,
    datasets: trimmedDatasets
  };
};

export const toChartData = ({
  selectedCountries,
  reportType,
  report,
  strategy: [strategy, from]
}) => {
  const countryExists = x => x;
  const datasets = selectedCountries
    .map(toChartDataItem({ report, reportType }))
    .filter(countryExists);

  if (strategy[0] === Strategies.FROM_PATIENT) {
    return fromPatientNStrategy({ datasets, from, n: strategy[1] });
  } else if (strategy === Strategies.BY_DATE && from) {
    return fromGivenDateStrategy({ report, datasets, from });
  } else if (strategy === Strategies.BY_DATE) {
    return fromFirstDateStrategy({ report, datasets });
  }
};

export const UpdateChart = state => [
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
          >${" and is updated three times a day. Hopefully it will contain number of tests in future."}
        </sup>
      </figcaption>
    </figure>
  </div>
`;

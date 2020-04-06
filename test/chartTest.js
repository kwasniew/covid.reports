import test from "tape";
import omit from "lodash.omit";
import { toChartData } from "../chart.js";
import { defaultByDate, LabelStrategies, ValueStrategies } from "../state.js";

const cleanData = data =>
  omit(data, ["backgroundColor", "pointBackgroundColor", "borderColor"]);
const cleanChart = chartData => ({
  ...chartData,
  datasets: chartData.datasets.map(cleanData)
});
const assertStateToChart = (state, chartData) => t => {
  t.deepEqual(cleanChart(toChartData(state)), cleanChart(chartData));

  t.end();
};

test(
  "trim initial cases with zero",
  assertStateToChart(
    {
      selectedCountries: ["Country A", "Country B"],
      reportType: "confirmed",
      labelStrategy: defaultByDate,
      report: {
        "Country A": [
          { date: "2020-1-22", confirmed: 0 },
          { date: "2020-1-23", confirmed: 0 },
          { date: "2020-1-24", confirmed: 1 }
        ],
        "Country B": [
          { date: "2020-1-22", confirmed: 0 },
          { date: "2020-1-23", confirmed: 1 },
          { date: "2020-1-24", confirmed: 2 }
        ]
      }
    },
    {
      labels: ["2020-1-23", "2020-1-24"],
      datasets: [
        {
          label: "Country A",
          data: [0, 1]
        },
        {
          label: "Country B",
          data: [1, 2]
        }
      ]
    }
  )
);

test(
  "increase value strategy",
  assertStateToChart(
    {
      selectedCountries: ["Country A", "Country B"],
      reportType: "confirmed",
      labelStrategy: defaultByDate,
      valueStrategy: ValueStrategies.INCREASE,
      report: {
        "Country A": [
          { date: "2020-1-22", confirmed: 0 },
          { date: "2020-1-23", confirmed: 0 },
          { date: "2020-1-24", confirmed: 1 }
        ],
        "Country B": [
          { date: "2020-1-22", confirmed: 0 },
          { date: "2020-1-23", confirmed: 1 },
          { date: "2020-1-24", confirmed: 2 }
        ]
      }
    },
    {
      labels: ["2020-1-23", "2020-1-24"],
      datasets: [
        {
          label: "Country A",
          data: [0, 1]
        },
        {
          label: "Country B",
          data: [1, 1]
        }
      ]
    }
  )
);

test(
  "align initial cases to patient zero",
  assertStateToChart(
    {
      selectedCountries: ["Country A", "Country B"],
      reportType: "confirmed",
      labelStrategy: [[LabelStrategies.FROM_PATIENT, 0], ""],
      report: {
        "Country A": [
          { date: "2020-1-22", confirmed: 0 },
          { date: "2020-1-23", confirmed: 0 },
          { date: "2020-1-24", confirmed: 1 }
        ],
        "Country B": [
          { date: "2020-1-22", confirmed: 0 },
          { date: "2020-1-23", confirmed: 1 },
          { date: "2020-1-24", confirmed: 2 }
        ]
      }
    },
    {
      labels: ["1", "2"],
      datasets: [
        {
          label: "Country A",
          data: [1]
        },
        {
          label: "Country B",
          data: [1, 2]
        }
      ]
    }
  )
);

test(
  "align initial cases to patient zero from given day",
  assertStateToChart(
    {
      selectedCountries: ["Country A", "Country B"],
      reportType: "confirmed",
      labelStrategy: [[LabelStrategies.FROM_PATIENT, 0], "2"],
      report: {
        "Country A": [
          { date: "2020-1-22", confirmed: 1 },
          { date: "2020-1-23", confirmed: 1 },
          { date: "2020-1-24", confirmed: 2 }
        ],
        "Country B": [
          { date: "2020-1-22", confirmed: 0 },
          { date: "2020-1-23", confirmed: 1 },
          { date: "2020-1-24", confirmed: 2 }
        ]
      }
    },
    {
      labels: ["2", "3"],
      datasets: [
        {
          label: "Country A",
          data: [1, 2]
        },
        {
          label: "Country B",
          data: [2]
        }
      ]
    }
  )
);

test(
  "no reported cases",
  assertStateToChart(
    {
      selectedCountries: ["Country A", "Country B"],
      reportType: "confirmed",
      labelStrategy: defaultByDate,
      report: {
        "Country A": [
          { date: "2020-1-22", confirmed: 0 },
          { date: "2020-1-23", confirmed: 0 },
          { date: "2020-1-24", confirmed: 0 }
        ],
        "Country B": [
          { date: "2020-1-22", confirmed: 0 },
          { date: "2020-1-23", confirmed: 0 },
          { date: "2020-1-24", confirmed: 0 }
        ]
      }
    },
    {
      labels: [],
      datasets: [
        {
          label: "Country A",
          data: []
        },
        {
          label: "Country B",
          data: []
        }
      ]
    }
  )
);

test(
  "no countries selected",
  assertStateToChart(
    {
      selectedCountries: [],
      reportType: "confirmed",
      labelStrategy: defaultByDate,
      report: {
        "Country A": [{ date: "2020-1-22", confirmed: 0 }],
        "Country B": [{ date: "2020-1-22", confirmed: 0 }]
      }
    },
    {
      labels: [],
      datasets: []
    }
  )
);

test(
  "from given date",
  assertStateToChart(
    {
      selectedCountries: ["Country A", "Country B"],
      reportType: "confirmed",
      labelStrategy: ["byDate", "2020-1-23"],
      report: {
        "Country A": [
          { date: "2020-1-22", confirmed: 1 },
          { date: "2020-1-23", confirmed: 2 },
          { date: "2020-1-24", confirmed: 3 }
        ],
        "Country B": [
          { date: "2020-1-22", confirmed: 3 },
          { date: "2020-1-23", confirmed: 4 },
          { date: "2020-1-24", confirmed: 5 }
        ]
      }
    },
    {
      labels: ["2020-1-23", "2020-1-24"],
      datasets: [
        {
          label: "Country A",
          data: [2, 3]
        },
        {
          label: "Country B",
          data: [4, 5]
        }
      ]
    }
  )
);

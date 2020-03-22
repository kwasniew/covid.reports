import test from "tape";
import { toChartData } from "../chart.js";

test("trim initial cases with zero", t => {
  const state = {
    selectedCountries: ["Country A", "Country B"],
    reportType: "confirmed",
    report: {
      "Country A": [
        { date: "2020-1-22", confirmed: 0, deaths: 0 },
        { date: "2020-1-23", confirmed: 0, deaths: 0 },
        { date: "2020-1-24", confirmed: 1, deaths: 0 }
      ],
      "Country B": [
        { date: "2020-1-22", confirmed: 0, deaths: 0 },
        { date: "2020-1-23", confirmed: 1, deaths: 0 },
        { date: "2020-1-24", confirmed: 2, deaths: 1 }
      ]
    }
  };
  const chartData = {
    labels: ["2020-1-23", "2020-1-24"],
    datasets: [
      {
        label: "Country A",
        data: [0, 1],
        backgroundColor: "rgba(28, 68, 87, 0.2)",
        pointBackgroundColor: "rgba(28, 68, 87, 1)",
        borderColor: "rgba(28, 68, 87, 1)"
      },
      {
        label: "Country B",
        data: [1, 2],
        backgroundColor: "rgba(160, 231, 59, 0.2)",
        pointBackgroundColor: "rgba(160, 231, 59, 1)",
        borderColor: "rgba(160, 231, 59, 1)"
      }
    ]
  };

  t.deepEqual(toChartData(state), chartData);

  t.end();
});

test("no reported cases", t => {
  const state = {
    selectedCountries: ["Country A", "Country B"],
    reportType: "confirmed",
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
  };
  const chartData = {
    labels: [],
    datasets: [
      {
        label: "Country A",
        data: [],
        backgroundColor: "rgba(28, 68, 87, 0.2)",
        pointBackgroundColor: "rgba(28, 68, 87, 1)",
        borderColor: "rgba(28, 68, 87, 1)"
      },
      {
        label: "Country B",
        data: [],
        backgroundColor: "rgba(160, 231, 59, 0.2)",
        pointBackgroundColor: "rgba(160, 231, 59, 1)",
        borderColor: "rgba(160, 231, 59, 1)"
      }
    ]
  };

  t.deepEqual(toChartData(state), chartData);

  t.end();
});

test("no countries selected", t => {
  const state = {
    selectedCountries: [],
    reportType: "confirmed",
    report: {
      "Country A": [{ date: "2020-1-22", confirmed: 0 }],
      "Country B": [{ date: "2020-1-22", confirmed: 0 }]
    }
  };
  const chartData = {
    labels: [],
    datasets: []
  };

  t.deepEqual(toChartData(state), chartData);

  t.end();
});

test("from given date", t => {
  const state = {
    dateFrom: "2020-1-23",
    selectedCountries: ["Country A", "Country B"],
    reportType: "confirmed",
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
  };
  const chartData = {
    labels: ["2020-1-23", "2020-1-24"],
    datasets: [
      {
        label: "Country A",
        data: [2, 3],
        backgroundColor: "rgba(28, 68, 87, 0.2)",
        pointBackgroundColor: "rgba(28, 68, 87, 1)",
        borderColor: "rgba(28, 68, 87, 1)"
      },
      {
        label: "Country B",
        data: [4, 5],
        backgroundColor: "rgba(160, 231, 59, 0.2)",
        pointBackgroundColor: "rgba(160, 231, 59, 1)",
        borderColor: "rgba(160, 231, 59, 1)"
      }
    ]
  };

  t.deepEqual(toChartData(state), chartData);

  t.end();
});

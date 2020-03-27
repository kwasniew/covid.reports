import { addCustomStatsToReport } from "./stats.js";
import { updateChart } from "./chart.js";
import { request } from "./web_modules/@hyperapp/http.js";

const GotReport = (state, report) => {
  const newState = {
    ...state,
    report: addCustomStatsToReport({
      report,
      reportType: state.reportType,
      days: state.days
    })
  };
  return [newState, [updateChart(newState)]];
};
export const fetchReport = request({
  url: "https://pomber.github.io/covid19/timeseries.json",
  expect: "json",
  action: GotReport
});

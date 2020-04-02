import { addCustomStatsToReport } from "./stats.js";
import { request } from "./web_modules/@hyperapp/http.js";
import { update } from "./update.js";

const GotReport = (state, report) =>
  update({
    ...state,
    report: addCustomStatsToReport({
      report,
      reportType: state.reportType,
      days: state.days
    })
  });
export const fetchReport = request({
  url: "https://pomber.github.io/covid19/timeseries.json",
  expect: "json",
  action: GotReport
});

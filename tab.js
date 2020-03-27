import { html } from "./html.js";
import { Container } from "./container.js";
import cc from "./web_modules/classcat.js";
import { preventDefault } from "./web_modules/@hyperapp/events.js";
import { addCustomStatsToReport } from "./stats.js";
import { updateChart } from "./chart.js";

const ChangeReportType = reportType => state => {
  const report = addCustomStatsToReport({
    report: state.report,
    reportType,
    days: state.days
  });
  const newState = {
    ...state,
    reportType,
    report,
    sortOrder: ["lastCases", "desc"]
  };
  return [newState, [updateChart(newState)]];
};

export const tab = ({ reportType }) => html`
 <${Container}>
    <ul class="tab tab-block">
      <li class=${cc({ "tab-item": true, active: reportType === "confirmed" })}>
        <a href="#" onclick=${preventDefault(
          ChangeReportType("confirmed")
        )}>Confirmed</a>
      </li>
      <li class=${cc({ "tab-item": true, active: reportType === "deaths" })}>
        <a href="#" onclick=${preventDefault(
          ChangeReportType("deaths")
        )}>Deaths</a>
      </li>
    </ul>
 </${Container}>
`;

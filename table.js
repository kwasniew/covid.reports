import { html } from "./html.js";
import { Container } from "./container.js";
import orderBy from "./web_modules/lodash.orderby.js";
import pick from "./web_modules/lodash.pick.js";
import { sortedCountryNames } from "./countriesMap.js";
import {
  countryAction,
  countryHighlight,
  countryChip,
  isActive
} from "./country.js";
import { addCustomStatsToReport } from "./stats.js";
import cc from "./web_modules/classcat.js";
import { updateWithHistory } from "./update.js";

export const sortReport = ({ report, sortOrder: [sortBy, asc] }) =>
  orderBy(
    Object.entries(pick(report, sortedCountryNames)).map(
      ([name, { growth, totalCases, lastCases }]) => ({
        name,
        growth,
        totalCases,
        lastCases
      })
    ),
    [sortBy],
    [asc]
  );

const negateOrder = order => (order === "asc" ? "desc" : "asc");

export const SortBy = newSortBy => state => {
  const [oldSortBy, oldDirection] = state.sortOrder;
  return updateWithHistory({
    ...state,
    sortOrder: [
      newSortBy,
      oldSortBy === newSortBy
        ? negateOrder(oldDirection)
        : newSortBy === "name"
        ? "asc"
        : "desc"
    ]
  });
};

const tableHeader = (name, text) => state => {
  return html`
    <th class="c-hand bg-gray" onclick=${SortBy(name)}>
      <span>${text} ${sortIcon(name)(state)}</span>
    </th>
  `;
};

const sortIcon = current => ({ sortOrder: [name, asc] }) => {
  if (current !== name) {
    return html``;
  }
  return asc === "asc"
    ? html`
        ▲
      `
    : html`
        ▼
      `;
};

const chipOrName = name => state =>
  isActive(state)(name) ? countryChip(name)(state) : name;

const option = (label, value, selected) =>
  selected
    ? html`
        <option selected value=${value}>${label}</option>
      `
    : html`
        <option value=${value}>${label}</option>
      `;

const SetStatsDays = days => state => {
  const report = addCustomStatsToReport({
    report: state.report,
    reportType: state.reportType,
    days
  });
  return updateWithHistory({ ...state, report, days: Number(days) });
};

const timeframeButton = (label, value, actual) =>
  html`
    <button
      onclick=${SetStatsDays(value)}
      class=${cc({
        "btn-sm": true,
        btn: true,
        "btn-primary": actual === value
      })}
    >
      ${label}
    </button>
  `;

const timeFrameSwitch = ({ days }) => html`
  <div class="float-right btn-group btn-group-block col-5 m-2">
    ${timeframeButton("Weekly", 7, days)} ${timeframeButton("Daily", 1, days)}
  </div>
`;

export const table = state => html`
  <${Container} class="bg-gray">
  ${timeFrameSwitch(state)}
        <table class="table">
          <tr class="sticky-header">
            <th class="bg-gray"></th>
            ${tableHeader("name", "Country")(state)}
            ${tableHeader("totalCases", "Total cases")(state)}
            ${tableHeader("lastCases", "Last cases")(state)}            
            ${tableHeader("growth", "Growth rate")(state)}
          </tr>
          ${sortReport(state).map(
            ({ name, growth, totalCases, lastCases }, index) => html`
              <tr
                class="c-hand"
                onclick=${countryAction(state)(name)}
                style=${countryHighlight(state)(name)}
              >
                <td class="index">${index + 1}.</td>
                <td>${chipOrName(name)(state)}</td>
                <td>${totalCases}</td>
                <td>${lastCases}</td>
                <td>${growth}%</td>
              </tr>
            `
          )}
        </table>
  </${Container}>
`;

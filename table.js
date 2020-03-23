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
} from "./sharedCountry.js";

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
  return {
    ...state,
    sortOrder: [
      newSortBy,
      oldSortBy === newSortBy
        ? negateOrder(oldDirection)
        : newSortBy === "name"
        ? "asc"
        : "desc"
    ]
  };
};

const tableHeader = (name, text) => state => {
  return html`
    <th class="c-hand" onclick=${SortBy(name)}>
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

export const table = state => html`
  <${Container} class="bg-gray">
        <table class="table">
          <tr>
            ${tableHeader("name", "Country")(state)}
            ${tableHeader("growth", "Weekly Growth Rate")(state)}
            ${tableHeader("totalCases", "Total cases")(state)}
            ${tableHeader("lastCases", "Last week cases")(state)}
          </tr>
          ${sortReport(state).map(
            ({ name, growth, totalCases, lastCases }) => html`
              <tr
                class="c-hand"
                onclick=${countryAction(state)(name)}
                style=${countryHighlight(state)(name)}
              >
                <td>${chipOrName(name)(state)}</td>
                <td>${growth}%</td>
                <td>${totalCases}</td>
                <td>${lastCases}</td>
              </tr>
            `
          )}
        </table>
  </Container>
`;

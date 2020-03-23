import { html } from "./html.js";
import { countryChip } from "./sharedCountry.js";
import { updateChart } from "./chart.js";

const RemoveDateFrom = state => {
  const newState = { ...state, dateFrom: "" };
  return [newState, [updateChart(newState)]];
};

const dateChip = dateFrom =>
  dateFrom
    ? html`
        <span class="chip" onclick=${RemoveDateFrom}>
          From: ${dateFrom}
          <span
            class="btn btn-clear"
            href="#"
            aria-label="Remove Date"
            role="button"
          ></span>
        </span>
      `
    : "";

export const chips = state => html`
  <div class="m-2">
    ${dateChip(state.dateFrom)}
    ${Array.from(state.selectedCountries).map(name => countryChip(name)(state))}
  </div>
`;

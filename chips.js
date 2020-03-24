import { html } from "./html.js";
import { countryChip } from "./sharedCountry.js";
import { updateChart } from "./chart.js";

const RemoveFromSelector = state => {
  const newState = {
    ...state,
    strategy: [state.strategy[0], ""]
  };
  return [newState, [updateChart(newState)]];
};

const ChangeStrategy = by => state => {
  const newState = { ...state, strategy: [by, ""] };
  return [newState, [updateChart(newState)]];
};

const fromChip = value =>
  value
    ? html`
        <span class="chip" onclick=${RemoveFromSelector}>
          From: ${value}
          <span
            class="btn btn-clear"
            href="#"
            aria-label="Remove Date"
            role="button"
          ></span>
        </span>
      `
    : "";

const strategyChip = ({ strategy: [name, from] }) => {
  const strategy = name === "byDay" ? byDay : byDate;
  return html`
    <span>
      ${strategy()} ${fromChip(from)}
    </span>
  `;
};

const byDay = () =>
  html`
    <span class="chip" onclick=${ChangeStrategy("byDate")}>
      By Day
      <span class="btn btn-clear" href="#" role="button"></span>
    </span>
  `;

const byDate = () =>
  html`
    <span class="chip" onclick=${ChangeStrategy("byDay")}>
      By Date
      <span class="btn btn-clear" href="#" role="button"></span>
    </span>
  `;

export const chips = state =>
  console.log(state) ||
  html`
    <div class="m-2">
      ${strategyChip(state)}
      ${Array.from(state.selectedCountries).map(name =>
        countryChip(name)(state)
      )}
    </div>
  `;

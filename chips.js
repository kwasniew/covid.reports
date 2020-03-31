import { html } from "./html.js";
import { countryChip } from "./country.js";
import { updateChart } from "./chart.js";
import { targetValue } from "./web_modules/@hyperapp/events.js";

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

const SetFromPatient = (state, patient) => {
  const newState = {
    ...state
  };
  newState.strategy[0][1] = Math.min(999999, Math.max(0, Number(patient)));
  return [newState, updateChart(newState)];
};

const fromChip = value =>
  value
    ? html`
        <span class="chip c-hand" onclick=${RemoveFromSelector}>
          From Day ${value}
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
  const strategy = name === "byDate" ? byDate : fromPatient;
  return html`
    <span>
      ${strategy(name[1])} ${fromChip(from)}
    </span>
  `;
};

const fromPatient = n =>
  html`
    <span key="patient" class="chip c-hand" onclick=${ChangeStrategy("byDate")}>
      ${"From Patient"}
      <span class="btn btn-clear" href="#" role="button"></span>
    </span>
    ${patientNumber(n)}
  `;

const patientNumber = n =>
  html`
    <span class="chip">
      <input
        onchange=${[SetFromPatient, targetValue]}
        type="number"
        min="0"
        max="99999"
        value=${n}
      />
    </span>
  `;

const byDate = () =>
  html`
    <span
      key="date"
      class="chip c-hand"
      onclick=${ChangeStrategy(["fromPatient", 100])}
    >
      By Date
      <span class="btn btn-clear" href="#" role="button"></span>
    </span>
  `;

export const chips = state =>
  html`
    <div class="m-2">
      ${strategyChip(state)}
      ${Array.from(state.selectedCountries).map(name =>
        countryChip(name)(state)
      )}
    </div>
  `;

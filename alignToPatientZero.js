import { html } from "./html.js";
import { updateChart } from "./chart";

const SetCheck = (state, { alignToPatientZero }) => {
  const newState = { ...state, alignToPatientZero };
  return [newState, [updateChart(newState)]];
};

export const alignToPatientZero = state => html`
  <div class="m-2 p-2">
    <div class=" form-group input-group">
      <input
        id="align-to-first"
        type="checkbox"
        checked=${state.alignToPatientZero}
        onClick=${[SetCheck, { alignToPatientZero: !state.alignToPatientZero }]}
      />
      <label for="align-to-first">Align to first reported case(s)</label>
    </div>
  </div>
`;

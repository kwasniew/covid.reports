import { html } from "./html.js";
import { targetValue } from "./web_modules/@hyperapp/events.js";
import { sortedCountryNames } from "./countriesMap.js";
import { AddCountry } from "./sharedCountry.js";

const AddSelectedCountry = (state, currentCountry) =>
  AddCountry(currentCountry)(state);

const selectedOption = (selected, name) =>
  selected === name
    ? html`
        <option selected value="${name}">${name}</option>
      `
    : html`
        <option value="${name}">${name}</option>
      `;

export const select = state => html`
  <div class="m-2 p-2">
    <div class=" form-group input-group">
      <select
        oninput=${[AddSelectedCountry, targetValue]}
        class="countries form-select"
      >
        ${sortedCountryNames.map(name =>
          selectedOption(state.currentCountry, name)
        )}
      </select>
    </div>
  </div>
`;

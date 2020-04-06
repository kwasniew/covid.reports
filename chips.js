import { html } from "./html.js";
import { countryChip } from "./country.js";

export const chips = state =>
  html`
    <div class="m-2">
      ${Array.from(state.selectedCountries).map(name =>
        countryChip(name)(state)
      )}
    </div>
  `;

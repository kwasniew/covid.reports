import { stringToHex } from "./stringToColor.js";
import { html } from "./html.js";
import { update } from "./update.js";

const unique = list => [...new Set(list)];
export const AddCountry = currentCountry => state =>
  update({
    ...state,
    currentCountry,
    selectedCountries: unique([...state.selectedCountries, currentCountry])
  });

export const RemoveCountry = country => state =>
  update({
    ...state,
    selectedCountries: state.selectedCountries.filter(c => c !== country)
  });

export const isActive = ({ selectedCountries }) => country =>
  selectedCountries.includes(country);

export const countryAction = state => country => {
  const isCountryActive = isActive(state)(country);

  if (isCountryActive) {
    return RemoveCountry(country);
  } else {
    return AddCountry(country);
  }
};

export const countryHighlight = state => country => {
  const isCountryActive = isActive(state)(country);

  if (isCountryActive) {
    return { "font-weight": "bold", color: stringToHex(country) };
  } else {
    return {};
  }
};

const truncate = name => name.length > 15 ? name.substring(0, 12) + "..." : name;

export const countryChip = name => state => html`
  <span
    class="chip c-hand"
    onclick=${countryAction(state)(name)}
    style=${countryHighlight(state)(name)}
  >
    ${truncate(name)}
    <span
      class="btn btn-clear"
      href="#"
      aria-label="Remove Country"
      role="button"
    ></span>
  </span>
`;

export const countryChips = state =>
  html`
    <div class="m-2 country-chips">
      ${Array.from(state.selectedCountries).map(name =>
        countryChip(name)(state)
      )}
    </div>
  `;

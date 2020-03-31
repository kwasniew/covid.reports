import { updateChart } from "./chart.js";
import { stringToHex } from "./stringToColor.js";
import { html } from "./html.js";

const unique = list => [...new Set(list)];
export const AddCountry = currentCountry => state => {
  const newState = {
    ...state,
    currentCountry,
    selectedCountries: unique([...state.selectedCountries, currentCountry])
  };
  return [newState, [updateChart(newState)]];
};

export const RemoveCountry = country => state => {
  const newState = {
    ...state,
    selectedCountries: state.selectedCountries.filter(c => c !== country)
  };
  return [newState, [updateChart(newState)]];
};

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

export const countryChip = name => state => html`
  <span
    class="chip c-hand"
    onclick=${countryAction(state)(name)}
    style=${countryHighlight(state)(name)}
  >
    ${name}
    <span
      class="btn btn-clear"
      href="#"
      aria-label="Remove Country"
      role="button"
    ></span>
  </span>
`;

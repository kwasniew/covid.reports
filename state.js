export const Strategies = {
  BY_DATE: "byDate",
  FROM_PATIENT: "fromPatient"
};
export const defaultByDate = [Strategies.BY_DATE, ""];
export const fromNPatient = n => [[Strategies.FROM_PATIENT, n], ""];
export const defaultFromPatient = fromNPatient(100);

export const initialState = {
  report: {},
  reportType: "confirmed",
  strategy: defaultByDate,
  currentCountry: "Italy",
  selectedCountries: ["China", "Italy"],
  days: 7,
  sortOrder: ["lastCases", "desc"]
};

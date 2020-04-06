export const LabelStrategies = {
  BY_DATE: "byDate",
  FROM_PATIENT: "fromPatient"
};
export const ValueStrategies = {
  TOTAL: "total",
  INCREASE: "increase"
};

export const defaultByDate = [LabelStrategies.BY_DATE, ""];
export const fromNPatient = n => [[LabelStrategies.FROM_PATIENT, n], ""];
export const defaultFromPatient = fromNPatient(100);

export const initialState = {
  report: {},
  reportType: "confirmed",
  labelStrategy: defaultByDate,
  valueStrategy: ValueStrategies.TOTAL,
  currentCountry: "Italy",
  selectedCountries: ["China", "Italy"],
  days: 7,
  sortOrder: ["lastCases", "desc"]
};

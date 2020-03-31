import { ReadFromStorage, WriteToStorage } from "./web_modules/hyperapp-fx.js";

const SavePreferences = ({ report, ...preferences }) =>
  WriteToStorage({ key: "covid.reports", value: preferences });
const SetPreferences = (state, { value }) =>
  value ? { ...state, ...value } : state;
export const LoadPreferences = ReadFromStorage({
  key: "covid.reports",
  action: SetPreferences
});

const WindowUnloadListen = props => [
  (dispatch, props) => {
    window.addEventListener("unload", () => {
      dispatch(props);
    });
    return () => {};
  },
  props
];

export const SavePreferencesListen = WindowUnloadListen(SavePreferences);

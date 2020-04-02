import { ReadFromStorage, WriteToStorage, RemoveFromStorage } from "./web_modules/hyperapp-fx.js";

const key = "covid.reports";
const SavePreferences = ({ report, ...preferences }) =>
  WriteToStorage({ key, value: preferences });
const ClearPreferences = RemoveFromStorage({key});
const SetPreferences = (state, { value }) =>
  value ? { ...state, ...value } : state;
export const LoadPreferences = ReadFromStorage({
  key,
  action: SetPreferences
});

const Listen = (element, event) => props => [
  (dispatch, props) => {
    element.addEventListener(event, () => {
      dispatch(props);
    });
    return () => {};
  },
  props
];

const WindowUnloadListen = Listen(window, "unload");
const WindowErrorListen = Listen(window, "error");

export const CleanPreferencesOnErrorListen = WindowErrorListen(ClearPreferences);
export const SavePreferencesListen = WindowUnloadListen(SavePreferences);

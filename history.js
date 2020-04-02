import { HistoryPop, HistoryPush } from "./web_modules/hyperapp-fx.js";
import qs from "./web_modules/qs.js";
import { update } from "./update.js";

const settings = ({ report, ...rest }) => rest;

export const stateToUrl = state => "?" + qs.stringify(settings(state));

const isInteger = value => /^-{0,1}\d+$/.test(value);
const decoder = (s, defaultDecoder) =>
  isInteger(s) ? Number(s) : defaultDecoder(s);
export const urlToState = url =>
  qs.parse(url.substring(1), { arrayLimit: 1000, decoder });

const SetState = stateFromUrl => state => ({ ...state, ...stateFromUrl });
export const ReadStateFromUrl = [
  dispatch => {
    dispatch(SetState(qs.parse(urlToState(window.location.search))));
  }
];

export const UpdateHistory = state =>
  HistoryPush({ state: settings(state), url: stateToUrl(state) });

export const HistoryListen = HistoryPop({
  action: (state, event) => update({ ...state, ...event.state })
});

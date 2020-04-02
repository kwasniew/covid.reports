import { UpdateChart } from "./chart.js";
import { UpdateHistory } from "./history.js";

export const action = effects => state => [state, effects];

export const update = state => [
  state,
  [UpdateChart(state), UpdateHistory(state)]
];

export const updateWithoutHistory = state => [state, [UpdateChart(state)]];

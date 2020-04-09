import { UpdateChart } from "./chart.js";
import { UpdateHistory } from "./history.js";

export const action = effects => state => [state, effects];

export const update = state => [
  state,
  [UpdateChart(state), UpdateHistory(state)]
];

export const updateWithHistory = state => [state, [UpdateHistory(state)]];

export const updateWithChart = state => [state, [UpdateChart(state)]];

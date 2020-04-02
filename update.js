import { UpdateChart } from "./chart.js";
import { UpdateHistory } from "./history.js";

export const update = state => [
  state,
  [UpdateChart(state), UpdateHistory(state)]
];

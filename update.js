import { updateChart } from "./chart.js";

export const update = state => [state, [updateChart(state)]];

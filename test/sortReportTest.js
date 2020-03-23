import test from "tape";
import { sortReport } from "../table.js";

test("sort report", t => {
  const state = {
    report: {
      Poland: { growth: 100, totalCases: 1, lastCases: 1 },
      Italy: { growth: 300, totalCases: 1, lastCases: 1 },
      China: { growth: 200, totalCases: 1, lastCases: 1 },
      "Ignore this country": { growth: 1200, totalCases: 1, lastCases: 1 }
    },
    sortOrder: ["growth", "desc"]
  };
  const expectedOutput = [
    { name: "Italy", growth: 300, totalCases: 1, lastCases: 1 },
    { name: "China", growth: 200, totalCases: 1, lastCases: 1 },
    { name: "Poland", growth: 100, totalCases: 1, lastCases: 1 }
  ];

  t.deepEqual(sortReport(state), expectedOutput);

  t.end();
});

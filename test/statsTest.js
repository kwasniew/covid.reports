import test from "tape";
import {
  calculateGrowth,
  calculateCasesInLastDays,
  addCustomStatsToReport
} from "../stats.js";

test("calculate growth", t => {
  t.deepEqual(calculateGrowth([1, 1, 1], 2), 0, "no growth");
  t.deepEqual(calculateGrowth([1, 2, 3], 2), 200, "growth");
  t.deepEqual(
    calculateGrowth([0, 2, 3], 2),
    200,
    "growth with 0 cases on day 1"
  );
  t.deepEqual(calculateGrowth([1, 2, 3, 8], 2), 300, "ignore previous days");
  t.deepEqual(calculateGrowth([0, 0, 0], 2), 0, "zero reported cases");
  t.deepEqual(
    calculateGrowth([1, 0, 0], 2),
    0,
    "invalid number of cases in the past"
  );

  t.end();
});

test("calculate cases in last days", t => {
  t.deepEqual(calculateCasesInLastDays([1, 2, 7], 2), 6, "simple sum");
  t.deepEqual(
    calculateCasesInLastDays([10, 20, 21, 22, 23], 2),
    2,
    "ignore previous days"
  );
  t.deepEqual(
    calculateCasesInLastDays([1, 0, 0], 2),
    0,
    "invalid number of cases in the past"
  );

  t.end();
});

test("add custom stats to report", t => {
  const report = {
    "Country A": [
      { confirmed: 1 },
      { confirmed: 2 },
      { confirmed: 3 },
      { confirmed: 4 }
    ]
  };
  const enhancedReport = {
    "Country A": Object.assign(
      [{ confirmed: 1 }, { confirmed: 2 }, { confirmed: 3 }, { confirmed: 4 }],
      { growth: 100, lastCases: 2, totalCases: 4 }
    )
  };
  t.deepEqual(
    addCustomStatsToReport({ report, reportType: "confirmed", days: 2 }),
    enhancedReport
  );

  t.end();
});

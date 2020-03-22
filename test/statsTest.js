import test from "tape";
import { calculateGrowth, calculateCasesInLastDays } from "../stats.js";

test("calculate growth", t => {
  t.deepEqual(calculateGrowth([1, 1, 1], 3), 0, "no growth");
  t.deepEqual(calculateGrowth([1, 2, 3], 3), 200, "growth");
  t.deepEqual(
    calculateGrowth([0, 2, 3], 3),
    200,
    "growth with 0 cases on day 1"
  );
  t.deepEqual(calculateGrowth([1, 2, 3, 8], 3), 300, "ignore previous days");

  t.end();
});

test("calculate cases in last days", t => {
  t.deepEqual(calculateCasesInLastDays([1, 2, 7], 3), 6, "simple sum");
  t.deepEqual(
    calculateCasesInLastDays([10, 20, 21, 22, 23], 3),
    2,
    "ignore previous days"
  );

  t.end();
});

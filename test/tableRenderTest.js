import test from "tape";
import snap from "snap-shot";
import { table } from "../table.js";
import { renderToString } from "hyperapp-render";
import pretty from "pretty";

const snapshot = (view, state) => snap(pretty(renderToString(view, state)));

test("render table", t => {
  const state = {
    report: {
      China: { growth: 50, totalCases: 100, lastCases: 10 },
      Italy: { growth: 200, totalCases: 80, lastCases: 60 }
    },
    currentCountry: "Italy",
    selectedCountries: ["China"],
    sortOrder: ["lastCases", "desc"]
  };

  snapshot(table, state);

  t.end();
});

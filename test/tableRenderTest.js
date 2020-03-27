import test from "tape";
import { table } from "../table.js";
import { renderToString } from "hyperapp-render";
import cheerio from "cheerio";
const render = (table, state) => cheerio.load(renderToString(table, state));
import { selectors } from "./selectors.js";

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

  const $ = render(table, state);
  const { $table, $row, $textIn } = selectors($);
  const $chip = $textIn(".chip");

  const { actual, expected } = $table([
    $row(["Country", "Total cases", "Last cases ▼", "Growth rate"]),
    $row(["Italy", "80", "60", "200%"]),
    $row([$chip("China"), "100", "10", "50%"])
  ]);
  t.deepEqual(actual, expected, "table matches expected shape");

  t.end();
});

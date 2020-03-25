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
  const { $table, $row, $class } = selectors($);
  const $chip = expected => element => {
    return $class(".chip")(expected)(element);
  };

  const { actual, expected } = $table([
    $row(["Country", "Weekly Growth Rate", "Total cases", "Last week cases ▼"]),
    $row(["Italy", "200%", "80", "60"]),
    $row([$chip("China"), "50%", "100", "10"])
  ]);
  t.deepEqual(actual, expected);

  t.end();
});

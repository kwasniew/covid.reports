import test from "tape";
import { AddCountry, RemoveCountry, countryAction } from "../sharedCountry.js";

test("add country", t => {
  const oldState = {
    selectedCountries: ["Country A", "Country B"]
  };
  const expectedState = {
    currentCountry: "Country C",
    selectedCountries: ["Country A", "Country B", "Country C"]
  };

  const [newState] = AddCountry("Country C")(oldState);

  t.deepEqual(newState, expectedState);

  t.end();
});

test("add same country", t => {
  const oldState = {
    currentCountry: "Country B",
    selectedCountries: ["Country A", "Country B"]
  };
  const expectedState = {
    currentCountry: "Country A",
    selectedCountries: ["Country A", "Country B"]
  };

  const [newState] = AddCountry("Country A")(oldState);

  t.deepEqual(newState, expectedState);

  t.end();
});

test("remove country", t => {
  const oldState = {
    currentCountry: "Country A",
    selectedCountries: ["Country A", "Country B"]
  };
  const expectedState = {
    currentCountry: "Country A",
    selectedCountries: ["Country B"]
  };

  const [newState] = RemoveCountry("Country A")(oldState);

  t.deepEqual(newState, expectedState);

  t.end();
});

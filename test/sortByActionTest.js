import test from "tape";
import { SortBy } from "../table.js";

test("change between asc and desc", t => {
  const oldState = {
    sortOrder: ["name", "asc"]
  };

  const [newState1] = SortBy("name")(oldState);
  const [newState2] = SortBy("name")(newState1);

  t.deepEqual(newState1, { sortOrder: ["name", "desc"] });
  t.deepEqual(newState2, { sortOrder: ["name", "asc"] });

  t.end();
});

test("change of sort criteria to desc", t => {
  const oldState = {
    sortOrder: ["name", "asc"]
  };

  const [newState] = SortBy("totalCases")(oldState);

  t.deepEqual(newState, { sortOrder: ["totalCases", "desc"] });

  t.end();
});

test("change of sort criteria to name is always asc", t => {
  const oldState = {
    sortOrder: ["totalCases", "irrelevant"]
  };

  const [newState] = SortBy("name")(oldState);

  t.deepEqual(newState, { sortOrder: ["name", "asc"] });

  t.end();
});

import test from "tape";
import {
  RemoveFromSelector,
  ChangeStrategy,
  SetFromPatient
} from "../chips.js";
import { Strategies, defaultByDate, defaultFromPatient } from "../state.js";

test("change strategy to fromPatient", t => {
  const oldState = {
    strategy: [Strategies.BY_DATE, "2012-10-3"]
  };

  const [newState] = ChangeStrategy(defaultFromPatient)(oldState);

  t.deepEqual(newState, { strategy: [[Strategies.FROM_PATIENT, 100], ""] });

  t.end();
});

test("change strategy to byDate", t => {
  const oldState = {
    strategy: [["fromPatient", 100], "15"]
  };

  const [newState] = ChangeStrategy(defaultByDate)(oldState);

  t.deepEqual(newState, { strategy: [Strategies.BY_DATE, ""] });

  t.end();
});

test("from from selectors in patient mode", t => {
  const oldState = {
    strategy: [[Strategies.FROM_PATIENT, 100], "15"]
  };

  const [newState] = RemoveFromSelector(oldState);

  t.deepEqual(newState, { strategy: [[Strategies.FROM_PATIENT, 100], ""] });

  t.end();
});

test("from from selectors in date mode", t => {
  const oldState = {
    strategy: [Strategies.BY_DATE, "2012-10-3"]
  };

  const [newState] = RemoveFromSelector(oldState);

  t.deepEqual(newState, { strategy: [Strategies.BY_DATE, ""] });

  t.end();
});

test("set from patient", t => {
  const oldState = {
    strategy: [[Strategies.FROM_PATIENT, 100], "15"]
  };

  const [newState] = SetFromPatient(oldState, 0);

  t.deepEqual(newState, { strategy: [[Strategies.FROM_PATIENT, 0], "15"] });

  t.end();
});

test("set from patient min value", t => {
  const oldState = {
    strategy: [[Strategies.FROM_PATIENT, 100], "15"]
  };

  const [newState] = SetFromPatient(oldState, -20);

  t.deepEqual(newState, { strategy: [[Strategies.FROM_PATIENT, 0], "15"] });

  t.end();
});

test("set from patient max value", t => {
  const oldState = {
    strategy: [[Strategies.FROM_PATIENT, 100], "15"]
  };

  const [newState] = SetFromPatient(oldState, 999999999);

  t.deepEqual(newState, { strategy: [[Strategies.FROM_PATIENT, 99999], "15"] });

  t.end();
});

test("set from patient on invalid state", t => {
  const oldState = {
    strategy: [Strategies.BY_DATE, "2020-3-12"]
  };

  const newState = SetFromPatient(oldState, 0);

  t.deepEqual(newState, { strategy: [Strategies.BY_DATE, "2020-3-12"] });

  t.end();
});

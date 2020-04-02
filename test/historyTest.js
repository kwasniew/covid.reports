import test from "tape";
import { stateToUrl, urlToState } from "../history.js";
import { initialState } from "../state.js";

const assertConvert = states => t => {
  states.map(({ report, ...state }) =>
    t.deepEqual(
      urlToState(stateToUrl(state)),
      state,
      "state to url and back should match"
    )
  );
  t.end();
};

const stateWithLargeArray = { x: [...Array(100).keys()] };

test(
  "convert state to url and back",
  assertConvert([initialState, stateWithLargeArray, "", {}])
);

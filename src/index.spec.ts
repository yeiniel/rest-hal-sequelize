
import test from "ava";

import * as restHalSequelize from "./index";

test("provide Router", (t) => {
  t.truthy(restHalSequelize.Router);
});

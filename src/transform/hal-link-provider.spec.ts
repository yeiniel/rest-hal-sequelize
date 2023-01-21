
import test from "ava";

import * as halLinkProvider from "./hal-link-provider";

test("transform stream", (t) => {
  const transform = new halLinkProvider.HALLinkProvider({
    operator: () => "/test",
    relation: "test",
  });

  transform.write({});
  const obj = transform.read();

  t.is(obj._links.test.href, "/test");
});

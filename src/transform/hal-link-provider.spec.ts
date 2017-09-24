
import test from "ava";

import * as halLinkProvider from "./hal-link-provider";

test((t) => {
  const transform = new halLinkProvider.HALLinkProvider({
    operator: (object: any) => "/test",
    relation: "test",
  });

  transform.write({});
  const obj = transform.read();

  t.is(obj._links.test.href, "/test");
});

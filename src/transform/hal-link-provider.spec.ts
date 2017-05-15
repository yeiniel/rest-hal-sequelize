
import test from "ava";

import * as halLinkProvider from "./hal-link-provider";

test(t => {
    let transform = new halLinkProvider.HALLinkProvider({
        relation: "test",
        operator: (obj: any) => "/test"
    });

  transform.write({});
    let obj = transform.read();

    t.is(obj._links.test.href, "/test");
});

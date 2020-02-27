
import test from "ava";

import * as instanceToJSON from "./instance-to-json";

test("transform stream", (t) => {
    const transform = new instanceToJSON.InstanceToJSON();

    transform.write({toJSON: () => "instance"});
    const obj = transform.read();

    t.is(obj, "instance");
});

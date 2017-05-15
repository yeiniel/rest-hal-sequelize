
import test from "ava";

import * as instanceToJSON from "./instance-to-json";

test((t) => {
    const transform = new instanceToJSON.InstanceToJSON();

    transform.write({toJSON: () => "instance"});
    const obj = transform.read();

    t.is(obj, "instance");
});

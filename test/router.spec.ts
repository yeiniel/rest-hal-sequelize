
import ava from "ava";
import * as express from "express";
import * as restHalSequelize from "../src";
import * as restHalTestTools from "@zephyrec/rest-hal-test-tools";
import * as Sequelize from "sequelize";
import * as superTest from "supertest";

ava.beforeEach((t) => {
  const app = express();

  app.use(restHalSequelize.Router(
    new Sequelize("sqlite://:memory"),
    {},
  ));

  t.context.agent = superTest(app);
  t.context.resource = "/";
});

/* Check that requests to the root resource of the API are handled */
ava(restHalTestTools.resourceImplementOptionsMethod);

/** Test if resource OPTIONS method allow GET requests.
 *
 * It requires the agent attribute of the Ava execution context to be an
 * instance of supertest. The target resource must be passed as the resource
 * attribute of the Ava execution context.
 *
 * @param t Ava execution object.
 */
function optionsAllowGet(t) {
  return t.context.agent.options(t.context.resource)
    .expect(200)
    .expect((res) => {
      t.not(res.header.allow.indexOf("GET"), -1);
    });
}

/** Test if resource GET method implement HAL+JSON representation.
 *
 * It requires the agent attribute of the Ava execution context to be an
 * instance of supertest. The target resource must be passed as the resource
 * attribute of the Ava execution context.
 *
 * @param t Ava execution object.
 */
function getHalJsonImplemented(t) {
  return t.context.agent.get(t.context.resource)
    .set("Accept", "application/hal+json")
    // .expect(200)
    .expect("Content-Type", /hal/)
    .expect((res) => {
      t.true(res.status >= 200 && res.status < 400);
    });
}

ava(optionsAllowGet);

ava(restHalTestTools.resourceImplementGetMethod);

ava(getHalJsonImplemented);

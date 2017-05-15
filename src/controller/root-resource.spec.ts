
import * as restHalTestTools from "@zephyrec/rest-hal-test-tools";

import ava from "ava";
import * as express from "express";
import * as superTest from "supertest";

import * as rootResourceController from "./root-resource";

ava.beforeEach((t) => {
  const app = express();
  const models = ["a", "b", "c"];
  const controller = new rootResourceController.RootResourceController(models);

  controller.setUpRoute(app.route("/"));

  t.context.agent = superTest(app);
  t.context.resource = "/";
  t.context.models = models;
});

ava(restHalTestTools.resourceImplementOPTIONSMethod);
ava(restHalTestTools.resourceOPTIONSMethodAllowGET);
ava(restHalTestTools.resourceImplementGETMethod);


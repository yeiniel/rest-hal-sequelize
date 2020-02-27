
import ava from "ava";
import * as express from "express";
import * as superTest from "supertest";

import * as restHalTestTools from "@yeiniel/rest-hal-test-tools";

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

ava(restHalTestTools.implement, "options");
ava(restHalTestTools.optionsAllow, "get");
ava(restHalTestTools.implement, "get");
ava(restHalTestTools.implementSDCN, "get");


import anyTest, { TestFn } from "ava";
import * as express from "express";
import * as superTest from "supertest";

import * as restHalTestTools from "@yeiniel/rest-hal-test-tools";

import * as rootResourceController from "./root-resource";

const test = anyTest as TestFn<restHalTestTools.IContext>;

test.beforeEach((t) => {
  const app = express();
  const models = ["a", "b", "c"];
  const controller = new rootResourceController.RootResourceController(models);

  controller.setUpRoute(app.route<string>("/"));

  t.context.agent = superTest(app);
  t.context.resource = "/";
  t.context.models = models;
});

test(restHalTestTools.implement, "options");
test(restHalTestTools.optionsAllow, "get");
test(restHalTestTools.implement, "get");
test(restHalTestTools.implementSDCN, "get");


import anyTest, { TestFn } from "ava";
import * as express from "express";
import * as Sequelize from "sequelize";
import * as superTest from "supertest";

import * as restHalTestTools from "@yeiniel/rest-hal-test-tools";

import * as resourceController from "./resource";

const test = anyTest as TestFn<restHalTestTools.IContext>;

function _setUpRouterParams(router: express.Router,
                            params: { [name: string]: express.RequestParamHandler }) {
  Object.keys(params).forEach((name) => router.param(name, params[name]));
}

test.beforeEach((t) => {
  const app = express();

  const sequelize = new Sequelize.Sequelize("sqlite:///tmp/test.db");

  sequelize.define("item", {
    example: Sequelize.STRING,
  });

  const controller = new resourceController.ResourceController(
    sequelize.models.item, ["get", "patch", "delete"]);

  controller.setUpRoute(app.route<string>("/:item"));

  _setUpRouterParams(app, controller.params);

  t.context.agent = superTest(app);
  t.context.resource = "/1";

  return sequelize.sync().then(() => sequelize.models.item.create({example: "value"}));
});

test(restHalTestTools.implement, "options");
test(restHalTestTools.optionsAllow, "get");
test(restHalTestTools.optionsAllow, "patch");
test(restHalTestTools.optionsAllow, "delete");
test(restHalTestTools.implement, "get");
test(restHalTestTools.implementSDCN, "get");
test(restHalTestTools.implement, "patch");
test(restHalTestTools.implement, "delete");

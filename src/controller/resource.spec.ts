
import * as restHalTestTools from "@zephyrec/rest-hal-test-tools";

import ava from "ava";
import * as express from "express";
import * as Sequelize from "sequelize";
import * as superTest from "supertest";

import * as resourceController from "./resource";

function _setUpRouterParams(router: express.Router,
                            params: { [name: string]: express.RequestParamHandler }) {
  Object.keys(params).forEach((name) => router.param(name, params[name]));
}

ava.beforeEach((t) => {
  const app = express();

  const sequelize = new Sequelize("sqlite:///tmp/test.db");

  sequelize.define("item", {
    example: Sequelize.STRING,
  });

  const controller = new resourceController.ResourceController(
    sequelize.models.item, ["get", "patch", "delete"]);

  controller.setUpRoute(app.route("/:item"));

  _setUpRouterParams(app, controller.params);

  app.use((err, req, res, next) => {
    console.trace(err);
    next(err);
  });

  t.context.agent = superTest(app);
  t.context.resource = "/1";

  return sequelize.sync().then(() => sequelize.models.item.create({example: "value"}));
});

ava(restHalTestTools.resourceImplementOPTIONSMethod);
ava(restHalTestTools.resourceOPTIONSMethodAllowGET);
ava(restHalTestTools.resourceImplementGETMethod);
ava(restHalTestTools.resourceGETMethodImplementServerDrivenContentNegotiation);

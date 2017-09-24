
import * as restHalTestTools from "@zephyrec/rest-hal-test-tools";

import ava from "ava";
import * as express from "express";
import * as Sequelize from "sequelize";
import * as superTest from "supertest";

import * as collectionController from "./collection";

ava.beforeEach((t) => {
  const app = express();

  const sequelize = new Sequelize("sqlite:///tmp/test.db");

  sequelize.define("item", {
    example: Sequelize.STRING,
  });

  const controller = new collectionController.CollectionController(
    sequelize.models.item, ["get", "post"]);

  controller.setUpRoute(app.route("/"));

  t.context.agent = superTest(app);
  t.context.resource = "/";

  return sequelize.sync();
});

ava(restHalTestTools.resourceImplementOPTIONSMethod);
ava(restHalTestTools.resourceOPTIONSMethodAllowGET);
ava(restHalTestTools.resourceImplementGETMethod);
ava(restHalTestTools.resourceGETMethodImplementServerDrivenContentNegotiation);

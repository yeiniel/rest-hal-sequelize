
import anyTest, { TestInterface } from "ava";
import * as express from "express";
import * as Sequelize from "sequelize";
import * as superTest from "supertest";

import * as restHalTestTools from "@yeiniel/rest-hal-test-tools";

import * as collectionController from "./collection";

const test = anyTest as TestInterface<restHalTestTools.IContext>;

test.beforeEach((t) => {
  const app = express();

  const sequelize = new Sequelize.Sequelize("sqlite:///tmp/test.db");

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

test(restHalTestTools.implement, "options");
test(restHalTestTools.optionsAllow, "get");
test(restHalTestTools.optionsAllow, "post");
test(restHalTestTools.implement, "get");
test(restHalTestTools.implementSDCN, "get");
test(restHalTestTools.implement, "post");

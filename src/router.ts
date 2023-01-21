import * as express from "express";
import * as sequelize from "sequelize";

import * as controller from "./controller";
import * as routerRule from "./router-rule";

const DEFAULT_RULE: routerRule.IRouterRule = {
  enabled: ["get", "post", "patch", "delete"],
};

function _setUpRouterParams(router: express.Router,
                            params: { [name: string]: express.RequestParamHandler }) {
  Object.keys(params).forEach((name) => router.param(name, params[name]));
}

/** Web request router providing request handling for REST API.
 *
 * @param sequelizeInstance Sequelize ORM instance
 * @param rules Routing rules for each model
 * @returns {express.Router} REST API router
 * @constructor
 */
export function Router(sequelizeInstance: sequelize.Sequelize,
                       rules: { [key: string]: routerRule.IRouterRule }): express.IRouter {
  const router = express.Router();

  // route requests for the root resource
  (new controller.RootResourceController(Object.keys(sequelizeInstance.models)))
    .setUpRoute(router.route<string>(`/`));

  // set up routing for all routes
  Object.keys(sequelizeInstance.models).forEach((name) => {

    // prepare router rule for this model
    const rule = Object.assign({}, DEFAULT_RULE, rules.default || {},
      rules[name] || {});

    // route requests for model resources
    _setUpRouterParams(
      router,
      (new controller.ResourceController(sequelizeInstance.models[name], rule.enabled))
        .setUpRoute(router.route<string>(`/${name}s/:${name}`)).params,
    );

    // route requests for model collection
    (new controller.CollectionController(sequelizeInstance.models[name], rule.enabled))
      .setUpRoute(router.route<string>(`/${name}s`));

    // route requests for model relations
    Object.keys(sequelizeInstance.models[name].associations).forEach((key) => {
      const association = sequelizeInstance.models[name].associations[key];

      if (association.associationType === "HasMany") {
        // route requests for associated model collection
        (new controller.CollectionController(association.target, rule.enabled))
          .setUpRoute(router.route<string>(`/${name}s/:${association.options.foreignKey}/${key}`));
      }
    });
  });

  return router;
}

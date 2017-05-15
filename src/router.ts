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
 * @param sequelize Sequelize ORM instance
 * @param rules Routing rules for each model
 * @returns {express.Router} REST API router
 * @constructor
 */
export function Router(sequelize: sequelize.Sequelize,
                       rules: { [key: string]: routerRule.IRouterRule }): express.IRouter<any> {
  const router = express.Router();

  // route requests for the root resource
  (new controller.RootResourceController(Object.keys(sequelize.models)))
    .setUpRoute(router.route(`/`));

  // set up routing for all routes
  Object.keys(sequelize.models).forEach((name) => {

    // prepare router rule for this model
    const rule = Object.assign({}, DEFAULT_RULE, rules.default || {},
      rules[name] || {});

    // route requests for model resources
    _setUpRouterParams(
      router,
      (new controller.ResourceController(sequelize.models[name], rule.enabled))
        .setUpRoute(router.route(`/${name}s/:${name}`)).params,
    );

    // route requests for model collection
    (new controller.CollectionController(sequelize.models[name], rule.enabled))
      .setUpRoute(router.route(`/${name}s`));

    // route requests for model relations
    Object.keys((sequelize.models[name] as any).associations).forEach((key) => {
      const association = (sequelize.models[name] as any).associations[key];

      if (association.associationType === "HasMany") {
        // route requests for associated model collection
        (new controller.CollectionController(association.target, rule.enabled))
          .setUpRoute(router.route(`/${name}s/:${name}/${key}`));
      }
    });
  });

  return router;
}

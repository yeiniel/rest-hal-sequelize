import * as bodyParser from "body-parser";
import * as express from "express";
import * as sequelize from "sequelize";

import jsonStream = require("JSONStream");

import * as patch from "../patch";
import * as routerRule from "../router-rule";
import * as transform from "../transform";

import * as controller from "./controller";

export class ResourceController implements controller.IController {

  /** Resource name.
   */
  private name: string;

  constructor(private model: sequelize.ModelStatic<sequelize.Model>, private methods: routerRule.Method[]) {

    this.name = (this.model as any).name;
  }

  /** Set up an Express route
   *
   * @see controller.Controller.setUpRoute
   */
  public setUpRoute(route: express.IRoute) {

    if (this.methods.indexOf("get") !== -1) {
      route.get(this.get.bind(this));
    }

    if (this.methods.indexOf("patch") !== -1) {
      route.patch(bodyParser.json({type: "application/json-patch+json"}), this.patch.bind(this));
    }

    if (this.methods.indexOf("delete") !== -1) {
      route.delete(this.delete_.bind(this));
    }

    return this;
  }

  /** Mapping of route parameter handlers provided by the controller.
   *
   * @see controller.Controller.params
   */
  public get params() {
    const params: { [name: string]: express.RequestParamHandler } = {};

    params[this.name] = this.item.bind(this);

    return params;
  }

  /** Route parameter handler for resource.
   *
   * @see express.RequestParamHandler
   */
  protected item(req: express.Request, res: express.Response,
                 next: express.NextFunction, id: string) {

    this.model.findByPk(id).then((instance) => {
        if (!instance) {
          const error = new Error("Not Found");

          // set status attribute for status aware error handling middleware
          (error as any).status = 404;

          return next(error);
        }

        (req as any)[this.name] = instance;

        next();
      }, (err) => next(err),
    );
  }

  protected resource(req: express.Request): sequelize.Model<never> {
    return (req as any)[this.name];
  }

  protected get(req: express.Request, res: express.Response,
                next: express.NextFunction) {

    // perform basic content negotiation check to avoid invoke de backend
    // unnecessary
    if (!req.accepts(["application/hal+json"])) {
      const error = new Error("Not Acceptable");

      // set status attribute for status aware error handling middleware
      (error as any).status = 406;

      return next(error);
    }

    let outStream: transform.HALLinkProvider;
    const inStream = new transform.InstanceToJSON();

    outStream = inStream
      .pipe(new transform.HALLinkProvider({
        operator: (instance) => `/${this.name}s/${instance.id}`,
        relation: "self",
      }));

    // provide a link to each relation
    Object.keys(this.model.associations).forEach((name) => {
      const association = this.model.associations[name];

      if (association.associationType === "HasMany") {
        outStream = outStream.pipe(new transform.HALLinkProvider({
          operator: (instance) => `/${this.name}s/${instance.id}/${name}`,
          relation: `${this.name}-has-${name}`,
        }));
      }
    });

    res.format({
      "application/hal+json": () => {
        outStream
          .pipe(jsonStream.stringify("", "", ""))
          .pipe(res);

        inStream.write(this.resource(req));
        inStream.end();
      },
    });
  }

  protected patch(req: express.Request, res: express.Response,
                  next: express.NextFunction) {

    // perform basic content negotiation check to avoid invoke de backend
    // unnecessary
    if (!req.is("application/json-patch+json")) {
      const err = new Error("Unsupported Media Type");

      // set status attribute for status aware error handling middleware
      (err as any).status = 415;

      return next(err);
    }

    // check request is array
    if (!Array.isArray(req.body)) {
      return next(new Error("Request body need to be an array of operations"));
    }

    const values: { [name: string]: string } = {};
    let error = null;

    for (let i = 0; i < (req.body as patch.IPatch[]).length; i++) {
      const patchItem = (req.body as patch.IPatch[])[i];
      const attr = patchItem.path.split("/").pop();
      switch (patchItem.op) {
        case "replace":
          values[attr] = patchItem.value;
          break;
        default:
          error = new Error(`Operation with index ${i} and name \
                                 ${patchItem.op} not supported`);
          break;
      }
      if (error) {
        return Promise.reject(error);
      }
    }

    this.resource(req).update(values).then(
      () => res.end(), (err) => {
        err.status = 422;
        next(err);
      },
    );
  }

  protected delete_(req: express.Request, res: express.Response,
                    next: express.NextFunction) {

    this.resource(req).destroy().then(
      () => res.end(), (err) => {
        next(err);
      },
    );
  }
}

import * as bodyParser from "body-parser";
import * as express from "express";
import * as sequelize from "sequelize";

import jsonStream = require("JSONStream");

import * as routerRule from "../router-rule";
import * as transform from "../transform";
import * as utils from "../utils";

import * as controller from "./controller";

export class CollectionController implements controller.IController {

  /** Resource name.
   */
  private name: string;

  constructor(private model: sequelize.Model<any, any>, private methods: routerRule.Method[]) {

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

    if (this.methods.indexOf("post") !== -1) {
      route.post(bodyParser.json(), this.post.bind(this));
    }

    return this;
  }

  protected get(req: express.Request, res: express.Response, next: express.NextFunction) {
    // perform basic content negotiation check to avoid invoke de backend
    // unnecessary
    if (!req.accepts(["application/hal+json"])) {
      const error = new Error("Not Acceptable");

      // set status attribute for status aware error handling middleware
      (error as any).status = 406;

      return next(error);
    }

    // pre-process input parameters before passing them to the store API
    const start = parseInt(req.query.start, 10) || 0;
    const items = parseInt(req.query.items, 10) || Infinity;
    const links: any = {self: {href: req.originalUrl}};

    // provide a prev link if not at the start
    if (start > 0) {
      const prevStart = start - items >= 0 ? start - items : 0;
      const prevItems = start - items >= 0 ? items : start - prevStart;
      links.prev = {
        href: utils.makeUpdatedUrl(req.originalUrl, {
          items: prevItems,
          start: prevStart,
        }),
      };
    }
    // provide a next link if pagination requested
    if (items !== Infinity) {
      const nextStart = start + items;
      links.next = {
        href: utils.makeUpdatedUrl(req.originalUrl, {
          items,
          start: nextStart,
        }),
      };
    }

    const options: any = Object.assign(
      {}, {offset: start, limit: items}, {where: req.params});

    let instanceStream = (this.model as any).findAllStream(options)
      .pipe(new transform.InstanceToJSON())
      .pipe(new transform.HALLinkProvider({
        operator: (instance) => `/${this.name}s/${instance.id}`,
        relation: "self",
      }));

    // provide a link to each relation
    Object.keys((this.model as any).associations).forEach((name) => {
      const association = (this.model as any).associations[name];

      if (association.associationType === "HasMany") {
        instanceStream = instanceStream.pipe(new transform.HALLinkProvider({
          operator: (instance) => `/${this.name}s/${instance.id}/${name}`,
          relation: `${this.name}-has-${name}`,
        }));
      }
    });

    res.format({
      "application/hal+json": () =>
        instanceStream.pipe(jsonStream.stringify(
          `{"_links":${JSON.stringify(links)}, "_embedded": {"${this.name}s":[\n`,
          ",\n",
          "\n]}}\n",
        )).pipe(res),
    });

  }

  protected post(request: express.Request, response: express.Response, next: express.NextFunction) {
    // perform basic content negotiation check to avoid invoke de backend
    // unnecessary
    if (!request.is("application/json")) {
      const error = new Error("Unsupported Media Type");

      // set status attribute for status aware error handling middleware
      (error as any).status = 415;

      return next(error);
    }

    // move params into request body for persistence
    request.body = Object.assign({}, request.body, request.params);

    this.model.create(request.body)
      .then(
        (instance) => response.status(201)
          .location(`/${this.name}s/${instance.get("id")}`).end(),
        (err) => next(err),
      );
  }
}

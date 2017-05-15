
import * as express from "express";

import jsonStream = require("JSONStream");

import * as transform from "../transform";
import * as controller from "./controller";

export class RootResourceController implements controller.IController {

  constructor(protected models: string[]) {}

  public setUpRoute(route: express.IRoute) {

    route.get(this.get.bind(this));

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

    let outStream: transform.HALLinkProvider;
    const inStream = new transform.HALLinkProvider({
      operator: () => req.originalUrl,
      relation: "self",
    });

    outStream = inStream;

    // provide a link to each relation
    this.models.forEach((name) => {
      outStream = outStream.pipe(new transform.HALLinkProvider({
        operator: () => `/${name}s`,
        relation: `has-${name}s`,
      }));
    });

    res.format({
      "application/hal+json": () => {
        outStream
          .pipe(jsonStream.stringify("", "", ""))
          .pipe(res);

        inStream.write({});
        inStream.end();
      },
    });
  }
}

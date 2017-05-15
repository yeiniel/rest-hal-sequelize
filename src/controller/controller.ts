
import * as express from "express";

/** Web controller.
 *
 * Provide Web `request` event handling for a concrete resource.
 */
export interface IController {

  /** Mapping of route parameter handlers provided by the controller.
   */
  params?: { [name: string]: express.RequestParamHandler };

  /** Set up an Express route
   *
   * Set up an Express route using Web `request` event handlers provided by
   * this controller. This Method is chain-able, it return the controller
   * instance.
   *
   * @param route Express route.
   * @returns {IController}
   */
  setUpRoute(route: express.IRoute): this;
}


import * as stream from "stream";

export interface IHALLinkProviderOptions extends stream.TransformOptions {

  relation: string;

  operator: (object: Record<string, never>) => string;
}

/** Provide HAL relation link.
 *
 * This transformation create the `_links` attribute on the transformed object
 * if not present.
 */
export class HALLinkProvider extends stream.Transform {

  private relation: string;
  private operator: IHALLinkProviderOptions['operator'];

  /** Constructor.
   *
   * @params options.relation Relation target for link.
   * @params options.operator Produce the href value of the link
   */
  constructor(options: IHALLinkProviderOptions) {
    // force object mode
    options.objectMode = true;

    // call super constructor
    super(options);

    this.relation = options.relation;
    this.operator = options.operator;
  }

  public _transform(object: Parameters<IHALLinkProviderOptions['operator']>[0], _: Parameters<stream.Transform['_transform']>[1], done: Parameters<stream.Transform['_transform']>[2]) {
    // create the _links object if not present
    object._links = object._links || {};

    object._links[this.relation] = {
      href: this.operator.call(object, object),
    } as never;

    done(null, object);
  }
}

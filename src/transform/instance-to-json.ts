import * as stream from "stream";

import * as sequelize from "sequelize";

/** Transform a stream of Sequelize instances into normal objects */
export class InstanceToJSON extends stream.Transform {

  constructor(options: ConstructorParameters<typeof stream.Transform>[0] = {}) {
    options.objectMode = true;

    super(options);
  }

  public _transform(row: sequelize.Model<never>, _: Parameters<stream.Transform['_transform']>[1], done: Parameters<stream.Transform['_transform']>[2]) {
    this.push(row.toJSON());
    done();
  }
}

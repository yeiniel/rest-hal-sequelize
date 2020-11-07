import * as stream from "stream";

import * as sequelize from "sequelize";

/** Transform a stream of Sequelize instances into normal objects */
export class InstanceToJSON extends stream.Transform {

  constructor(options: any = {}) {
    options.objectMode = true;

    super(options);
  }

  public _transform(row: sequelize.Model<any>, _: any, done: (error?: Error, result?: any) => void) {
    this.push(row.toJSON());
    done();
  }
}

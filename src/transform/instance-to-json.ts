import * as stream from "stream";

import * as sequelize from "sequelize";

/** Transform a stream of Sequelize instances into normal objects */
export class InstanceToJson extends stream.Transform {

  constructor(options: any = {}) {
    options.objectMode = true;

    super(options);
  }

  public _transform(row: sequelize.Instance<any>, _, done) {
    this.push(row.toJSON());
    done();
  }
}

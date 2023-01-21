
import * as stream from "stream";

import * as sequelize from "sequelize";

/** Model extension providing findAllStream() impl. */
export function FindAllStream(Model: sequelize.ModelStatic<sequelize.Model>) {
  (Model as any).findAllStream = (options, batchOptions: any = {limit: 1000}) => {
    // set initial offset to its default if not provided
    if (options.offset === null || options.offset === undefined) {
      options.offset = 0;
    }

    // set initial limit to its default if not provided
    if (options.limit === null || options.limit === undefined) {
      options.limit = Infinity;
    }

    // create a copy of the query options for baching
    batchOptions = Object.assign({}, options, batchOptions);

    return new stream.Readable({
      objectMode: true,
      read() {
        this.pause();

        Model.findAll(batchOptions)
          .then((rows) => {
            if (rows.length === 0) {
              this.push(null);
            } else {
              rows.forEach((row) => {
                this.push(row);
              });
            }

            batchOptions.offset += batchOptions.limit;

            if (batchOptions.offset >= options.limit) {
              this.push(null);
            }

            // honor limit if set
            if (batchOptions.offset + batchOptions.limit > options.limit) {
              batchOptions.limit = options.limit - batchOptions.offset;
            }

            this.resume();
          })
          .catch((err) => {
            batchOptions.offset += batchOptions.limit;
            this.resume();
            this.emit("error", err);
          });
      },
    });
  };

  return Model;
}

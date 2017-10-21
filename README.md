# REST HAL Sequelize
[![Build Status](https://travis-ci.org/zephyrec/rest-hal-sequelize.svg?branch=master)](https://travis-ci.org/zephyrec/rest-hal-sequelize)
[![Coverage Status](https://coveralls.io/repos/github/zephyrec/rest-hal-sequelize/badge.svg?branch=master)](https://coveralls.io/github/zephyrec/rest-hal-sequelize?branch=master)

This project provide a mapping from [Sequelize][sequelize] models into
a [REST][rest] API that use the
[JSON Hypertext Application Language][hal] Media Type.

## Installation
`rest-hal-sequelize` runs on Node.js and is available as an NPM
package. You can install `rest-hal-sequelize` in your project's
directory as usual:

    npm install @zephyrec/rest-hal-sequelize --save

## Reference Documentation
Reference documentation for this project can be generated from the
inline comments on source code using the [Typedoc][typedoc]
documentation generator. The following command ease the task:

    npm run typedoc

## Typescript Support
This package is written in [Typescript][typescript] and it provide a
declaration file for its content so you can use it on Typescript
projects without problems.

## Licensing

The code in this project is licensed under MIT license.

[hal]: https://tools.ietf.org/html/draft-kelly-json-hal-08
[rest]: https://en.wikipedia.org/wiki/Representational_state_transfer
[sequelize]: http://sequelize.readthedocs.io
[typedoc]: http://typedoc.org/

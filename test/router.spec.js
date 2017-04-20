
'use strict';

const ava = require('ava'),
      express = require('express'),
      restHalSequelize = require('..'),
      restHalTestTools = require('@zephyrec/rest-hal-test-tools'),
      Sequelize = require('sequelize'),
      superTest = require('supertest');

ava.beforeEach((t) => {
  const app = express();

  app.use(restHalSequelize.Router(
    new Sequelize('sqlite://:memory'),
    {}
  ));

  t.context.agent = superTest(app);
  t.context.resource = '/';
});

/* Check that requests to the root resource of the API are handled */
ava(restHalTestTools.resourceImplementOptionsMethod);

ava(restHalTestTools.resourceImplementGetMethod);

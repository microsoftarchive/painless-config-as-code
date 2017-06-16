//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
//

'use strict';

const assert = require('chai').assert;
const library = require('../lib');

function wrappingConfigurationHelper(env) {
  return {
    get: function (key) {
      return env[key];
    },
    testSet: function (key, value) {
      env[key] = value;
    }
  };
}

function createBareMinimumConfiguration() {
  return wrappingConfigurationHelper({});
}

function createAppServiceWrappedConfiguration(appServiceSiteName) {
  const testEnv = createBareMinimumConfiguration();
  testEnv.testConfiguration = {
    'test-site.domain': {
      'COMPANY_NAME': 'Contoso',
      'REDIS_PREFIX': 'prefix',
    },
    'test-site2.domain': {
      'COMPANY_NAME': 'Contoso II',
      'AUTHENTICATION_SCHEME': 'unicorn-authentication',
    },
  };
  testEnv.testSet('CONFIGURATION_ENVIRONMENT', appServiceSiteName);
  return testEnv;
}

describe('configuration', () => {

  describe('config as code', () => {

    it('required module works without calling as a function', () => {
      assert.isDefined(library.get, 'no get method present on the library');
    });

    it('app service JSON + env config', () => {
      const testProvider = createAppServiceWrappedConfiguration('test-site.domain');
      const configResult = library({ provider: testProvider });
      assert.strictEqual(configResult.get('COMPANY_NAME'), 'Contoso', 'Provider values win vs the app service file');
      assert.strictEqual(configResult.get('REDIS_PREFIX'), 'prefix', 'App Service values not defined in config win');
    });

    it('values not in a provider do not crash', () => {
      const testProvider = createAppServiceWrappedConfiguration('test-site2.domain');
      const configResult = library({ provider: testProvider });
      assert.isUndefined(configResult.get('REDIS_PREFIX'), 'App Service values not defined in config win');
    });

    it('unicorn authentication', () => {
      const testProvider = createAppServiceWrappedConfiguration('test-site2.domain');
      const configResult = library({ provider: testProvider });
      assert.strictEqual(configResult.get('AUTHENTICATION_SCHEME'), 'unicorn-authentication', 'Resolving an app service value works');
    });
  });
});

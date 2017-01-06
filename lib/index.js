//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
//

'use strict';

const appRoot = require('app-root-path');
const painlessConfig = require('painless-config');
const path = require('path');

module.exports = function (options) {
  const applicationRoot = options && options.applicationRoot ? options.applicationRoot : appRoot;
  const directoryName = options && options.directoryName ? options.directoryName : 'env';
  const provider = options && options.provider ? options.provider : painlessConfig;

  const environment = provider.get('CONFIGURATION_ENVIRONMENT') || provider.get('NODE_ENV');
  if (!environment) {
    return provider;
  }

  let json = null;
  if (!provider.testConfiguration) {
    const envFile = `${environment}.json`;
    const envPath = path.join(applicationRoot.toString(), directoryName, envFile);
    try {
      json = require(envPath);
    } catch (noFile) {
      // no file
    }
  } else {
    const tree = provider.testConfiguration;
    json = tree[environment];
  }

  if (!json) {
    return provider;
  }

  return {
    get: function (key) {
      const value = provider.get(key);
      if (value !== undefined) {
        return value;
      }
      return json[key];
    }
  };
};

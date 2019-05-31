require('chai/register-should');

const solcStable = {
  version: '0.5.7',
};

const solcNightly = {
  version: 'nightly',
  docker: true,
};

const useSolcNightly = process.env.SOLC_NIGHTLY === 'true';

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 23889, // janus QTUM-ETH RPC bridge
      network_id: '*', // eslint-disable-line camelcase
      from: '0x7926223070547d2d15b2ef5e7383e541c338ffe9',
      gasPrice: '0x64', // minimal gas for qtum
    },
    // development: {
    //   host: '127.0.0.1',
    //   port: 8545, // ganache
    //   network_id: '*', // eslint-disable-line camelcase
    //   // from: '0x7926223070547d2d15b2ef5e7383e541c338ffe9',
    //   // gasPrice: '0x64', // minimal gas for qtum
    // },
    coverage: {
      host: 'localhost',
      network_id: '*', // eslint-disable-line camelcase
      port: 8555,
      gas: 0xfffffffffff,
      gasPrice: 0x01,
    },
  },

  compilers: {
    solc: useSolcNightly ? solcNightly : solcStable,
  },
};

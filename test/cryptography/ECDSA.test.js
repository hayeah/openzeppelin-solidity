const { constants, shouldFail } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;
// const { toEthSignedMessageHash, fixSignature } = require('../helpers/sign');

const ECDSAMock = artifacts.require('ECDSAMock');

contract('ECDSA', function ([_, other]) {
  beforeEach(async function () {
    this.ecdsa = await ECDSAMock.new();
  });

  const TEST_MSG_HASH_BAD = '0x62594ff4caaed52fb458bd4fe9e655689a957812dcba731111564d92e66a9307';

  // private key: cMbgxCJrTYUqgcmiC1berh5DFrtY1KeU4PXZ6NZxgenniF1mXCRk
  // public key: qUbxboqjBRp96j3La8D1RYkyqx5uQbJPoW
  // message: "hello world"

  const SIGNER = '0x7926223070547d2d15b2ef5e7383e541c338ffe9';
  const TEST_MSG_HASH = '0x33fd9f69e51a562f5457e71dcf14bd723cdc9134bae6cdef5891baa8386ebb5c';
  const R = '3595e4f92e91aaf731127b43aceec0848948848421800660b7f8ace50b668a4b';
  const S = '4ed3bad5a93f1c1685c50958efe40fd566b8afdb0b2ef679013277506380ce1f';

  context('recover with valid signature', function () {
    context('with v0 signature', function () {
      // Get pubkeyhash address from recovered not compressed public key
      // in msgh:  1476abb745d423bf09273f1afd887d951181d25adc66c4834a70491911b7f750
      // in v:     28
      // in r:     e6ca9bba58c88611fad66a6ce8f996908195593807c4b38bd528d2cff09d4eb3
      // in s:     3e5bfbbf4d3e39b1a2fd816a7680c19ebebaf3a141b239934ad43cb33fcec8ce
      // out addr: 0000000000000000000000005b0bf163d8d62090d634bc5c20bb47602cc686fe

      // const signer = '0x5b0BF163d8d62090d634bC5c20bB47602cc686Fe';
      // const TEST_MSG_HASH = '0x1476abb745d423bf09273f1afd887d951181d25adc66c4834a70491911b7f750';
      // const V = '1c';
      // const R = 'e6ca9bba58c88611fad66a6ce8f996908195593807c4b38bd528d2cff09d4eb3';
      // const S = '3e5bfbbf4d3e39b1a2fd816a7680c19ebebaf3a141b239934ad43cb33fcec8ce';
      // const SIG = '0x' + V + R + S;

      context('with 00 as version value', function () {
        it('returns 0', async function () {
          const V = '00';
          const SIG = '0x' + V + R + S;
          (await this.ecdsa.recover(TEST_MSG_HASH, SIG)).should.equal(ZERO_ADDRESS);
        });
      });

      context('with 0x1f as version value', function () {
        it('works', async function () {
          const V = '1f';
          const SIG = '0x' + V + R + S;
          (await this.ecdsa.recover(TEST_MSG_HASH, SIG)).toLowerCase().should.equal(SIGNER);
        });
      });

      context('with wrong version', function () {
        it('returns 0', async function () {
          const V = '02';
          const SIG = '0x' + V + R + S;
          (await this.ecdsa.recover(TEST_MSG_HASH, SIG)).should.equal(ZERO_ADDRESS);
        });
      });
    });
  });

  //   context('with high-s value signature', function () {
  //     it('returns 0', async function () {
  //       const message = '0xb94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9';
  //       // eslint-disable-next-line max-len
  //       const highSSignature =
  //         '0xe742ff452d41413616a5bf43fe15dd88294e983d3d36206c2712f39083d638bde0a0fc89be718fbc1033e1d30d78be1c68081562ed2e97af876f286f3453231d1b';

  //       (await this.ecdsa.recover(message, highSSignature)).should.equal(ZERO_ADDRESS);
  //     });
  //   });

  context('with wrong signature', function () {
    it('does not return signer address', async function () {
      const V = '1f';
      const SIG = '0x' + V + R + S;
      (await this.ecdsa.recover(TEST_MSG_HASH_BAD, SIG)).should.not.equal(SIGNER);
    });
  });

  //   context('with small hash', function () {
  //     // @TODO - remove `skip` once we upgrade to solc^0.5
  //     it.skip('reverts', async function () {
  //       // Create the signature
  //       const signature = await web3.eth.sign(TEST_MESSAGE, other);
  //       await shouldFail.reverting.withMessage(
  //         this.ecdsa.recover(TEST_MESSAGE.substring(2), signature),
  //         'Failure message'
  //       );
  //     });
  //   });
  // });

  // context('toEthSignedMessage', function () {
  //   it('should prefix hashes correctly', async function () {
  //     (await this.ecdsa.toEthSignedMessageHash(TEST_MESSAGE)).should.equal(toEthSignedMessageHash(TEST_MESSAGE));
  //   });
  // });
});

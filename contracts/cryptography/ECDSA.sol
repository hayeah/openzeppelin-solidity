pragma solidity ^0.5.0;

/**
 * @title Elliptic curve signature operations
 * @dev Based on https://gist.github.com/axic/5b33912c6f61ae6fd96d6c4a47afde6d
 * TODO Remove this library once solidity supports passing a signature to ecrecover.
 * See https://github.com/ethereum/solidity/issues/864
 */

library ECDSA {
    /**
     * @dev Recover signer address from a message by using their signature.
     * @param hash bytes32 message, the hash is the signed message. What is recovered is the signer address.
     * @param signature bytes signature, the signature is generated using web3.eth.sign()
     */
    function recover(bytes32 hash, bytes memory signature) internal returns (address) {
        // Check the signature length
        if (signature.length != 65) {
            return (address(0));
        }

        // Divide the signature in r, s and v variables
        bytes32 r;
        bytes32 s;
        uint8 v;

        // ecrecover takes the signature parameters, and the only way to get them
        // currently is to use assembly.
        // solhint-disable-next-line no-inline-assembly
        assembly {
            v := byte(0, mload(0x00))
            r := mload(add(signature, 0x21))
            s := mload(add(signature, 0x41))
        }

        // EIP-2 still allows signature malleability for ecrecover(). Remove this possibility and make the signature
        // unique. Appendix F in the Ethereum Yellow paper (https://ethereum.github.io/yellowpaper/paper.pdf), defines
        // the valid range for s in (281): 0 < s < secp256k1n ÷ 2 + 1, and for v in (282): v ∈ {27, 28}. Most
        // signatures from current libraries generate a unique signature with an s-value in the lower half order.
        //
        // If your library generates malleable signatures, such as s-values in the upper range, calculate a new s-value
        // with 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141 - s1 and flip v from 27 to 28 or
        // vice versa. If your library also generates signatures with 0/1 for v instead 27/28, add 27 to v to accept
        // these malleable signatures as well.
        if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) {
            return address(0);
        }

        // HY: I think the check for BTC signature is whether v-27 == 4 || v-27 == 5
        // Oh, it's actually the same. This is check if pubkey is compressed.
        if (v != 31 && v != 32) {
            return address(0);
        }

        // If the signature is valid (and not malleable), return the signer address
        return btc_ecrecover(hash, v, r, s);
    }

    /**
     * toEthSignedMessageHash
     * @dev Prefix a bytes32 value with "\x19Ethereum Signed Message:"
     * and hash the result.
     */
    function toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32) {
        // 32 is the length in bytes of hash,
        // enforced by the type signature above
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    function btc_ecrecover(bytes32 msgh, uint8 v, bytes32 r, bytes32 s) public returns(address)
    {
        uint256[4] memory input;
        input[0] = uint256(msgh);
        input[1] = v;
        input[2] = uint256(r);
        input[3] = uint256(s);
        uint256 p;
        assembly
        {
            if iszero(call(not(0), 0x85, 0, input, 0x80, p, 32))
            {
                revert(0, 0)
            }
        }
        return address(p);
    }

    // function toBytes(uint256 x) internal pure returns (bytes memory)
    // {
    //     bytes memory b = new bytes(32);
    //     assembly { mstore(add(b, 32), x) }
    //     return b;
    // }
}

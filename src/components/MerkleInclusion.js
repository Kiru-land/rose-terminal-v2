import { Buffer } from 'buffer'; // Add this import
import { keccak256 } from 'keccak256'; // Keccak256 hashing
import MerkleTree from 'merkletreejs'; // MerkleTree.js
import { ethers } from 'ethers'; // Ethers.js
import config from '../config'; // Airdrop configuration

function generateLeaf(address, value) {
    return Buffer.from(
        ethers.keccak256(
            ethers.solidityPacked(['address', 'uint256'], [address, value])
        ).slice(2),
        'hex'
    );
}

const merkleTree = new MerkleTree(
    Object.entries(config.airdrop).map(([address, tokens]) =>
        generateLeaf(
            ethers.getAddress(address),
            ethers.parseUnits(tokens.toString(), config.decimals).toString()
        )
    ),
    keccak256,
    { sortPairs: true }
);

function generateProof(address) {
    const formattedAddress = ethers.getAddress(address);
    const tokens = config.airdrop[formattedAddress];
    if (!tokens) {
        throw new Error('Address not found in the airdrop list.');
    }
    const numTokens = ethers
        .parseUnits(tokens.toString(), config.decimals)
        .toString();
    const leaf = generateLeaf(formattedAddress, numTokens);
    const proof = merkleTree.getHexProof(leaf);

    return proof;
}

function verifyProof(leaf, proof) {
    const root = merkleTree.getRoot();
    return merkleTree.verify(proof, leaf, root);
}

export { generateProof, verifyProof };

// const addressToCheck = '0xYourAddressHere';

// try {
//     const proof = generateProof(addressToCheck);
//     const tokens = config.airdrop[ethers.utils.getAddress(addressToCheck)];
//     const numTokens = ethers.utils
//         .parseUnits(tokens.toString(), config.decimals)
//         .toString();
//     const leaf = generateLeaf(ethers.utils.getAddress(addressToCheck), numTokens);

//     const isValid = verifyProof(leaf, proof);
//     console.log(`Is the address included in the Merkle Tree? ${isValid}`);
// } catch (error) {
//     console.error(error.message);
// }

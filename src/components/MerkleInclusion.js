import { ethers } from 'ethers';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';

// const elements = [["0x023DbE08bEC000dDc4b743aC0d5cc65b1C4A086D"], ["0x1CccC4D3789799a4513D85243bECc93412BBDc22"], ["0xA60489284B69E58781FAfF4C70AA69AE5Ada0f00"], ["0xdBD4D75960ae8A08b53E0B4f679c4Af487256B31"]];

// const generateMerkleTree = (elements) => {
//     const tree = StandardMerkleTree.of(elements, ["address"])
//     fs.writeFileSync("tree.json", JSON.stringify(tree.dump()));
//     console.log(tree.root);
//     return tree;
// };

// const tree = generateMerkleTree(elements);
const tree = { "format": "standard-v1", "leafEncoding": ["address"], "tree": ["0x8b539aa748eecbdf24592b772311d814f9159c637eccaa7ab45426823817406f", "0xf66fba4117efc2b3d679b00758cc982ba0d2732e454ccc7a023a528679a1121b", "0xae5b25aeba360306bb0f64f589d9462ba3873bde5e4d516144a5e012d08365cb", "0xd71b24abc3e8bcd2eea964afe079c40e8859c15adc7cc65417dec1edcc731cfe", "0xd5020030ccc170e67ba3f2a0d9c3a5a5121122285b570976dc7bcd40aa6c6559", "0x6e5303ef81fc29889f05a8457e934a942e6d028f11c60c5a5c09cc740ecda090", "0x0329805a59b3d92882ed6b5701176cb937b6c45186570da04805c4499bda6535"], "values": [{ "value": ["0x023DbE08bEC000dDc4b743aC0d5cc65b1C4A086D"], "treeIndex": 5 }, { "value": ["0x1CccC4D3789799a4513D85243bECc93412BBDc22"], "treeIndex": 3 }, { "value": ["0xA60489284B69E58781FAfF4C70AA69AE5Ada0f00"], "treeIndex": 6 }, { "value": ["0xdBD4D75960ae8A08b53E0B4f679c4Af487256B31"], "treeIndex": 4 }] }

export const generateMerkleProof = (address) => {
    const jsonTree = StandardMerkleTree.load(tree);
    for (const [i, v] of jsonTree.entries()) {
        if (v[0] === address) {
            const proof = jsonTree.getProof(i);
            console.log(proof);
            return proof;
        }
    }
};

export function verifyProof(address, amount, proof, root) {
  // ... rest of the function
}

export function generateProof(address, amount, whitelist) {
  // ... rest of the function
}

// ... any other functions or exports

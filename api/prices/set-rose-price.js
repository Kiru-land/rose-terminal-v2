import { 
    Contract, 
    JsonRpcProvider, 
    formatEther, 
    formatUnits 
  } from 'ethers';
  import { getEthPrice } from './utils/getEthPrice.js';
  import { pricesKV } from '../../config.js';
  
  export default async function handler(req, res) {
      // Ethereum provider (e.g., Infura, Alchemy)
      const provider = new JsonRpcProvider(process.env.ETH_RPC_URL);
      
      // Contract address
      const contractAddress = '0xdB02B6a7cfe9d4DE7D2dC585EFc27a24b6345aD1';
  
      // ERC20 token address
      const erc20TokenAddress = '0xdB02B6a7cfe9d4DE7D2dC585EFc27a24b6345aD1';
  
      // ERC20 ABI (minimal)
      const erc20Abi = [
          // Read-Only Functions
          "function balanceOf(address owner) view returns (uint256)",
          "function decimals() view returns (uint8)"
      ];
  
      // Create ERC20 contract instance
      const erc20Contract = new Contract(erc20TokenAddress, erc20Abi, provider);
  
      try {
          // Get Ether balance of the contract
          const etherBalanceWei = await provider.getBalance(contractAddress);
          const etherBalance = formatEther(etherBalanceWei);
  
          // Get ERC20 token balance of the contract
          const erc20BalanceRaw = await erc20Contract.balanceOf(contractAddress);
          const erc20Decimals = await erc20Contract.decimals();
          const erc20Balance = formatUnits(erc20BalanceRaw, erc20Decimals);
  
          // Divide the ERC20 balance by the Ether balance
          const roseEthRatio = parseFloat(etherBalance) / parseFloat(erc20Balance);
  
          // Get the current ETH price in USD
          const ethPriceInUsd = await getEthPrice();
  
          // Calculate ROSE price in USD
          const rosePriceInUsd = Number((roseEthRatio * ethPriceInUsd).toFixed(2));

          // Generate a timestamp as the key
          const timestamp = Date.now().toString();
  
          // Store the timestamp as key and ROSE price in USD as value in Vercel KV database
          await pricesKV.set(timestamp, rosePriceInUsd);
  
          res.status(200).json({ success: true, timestamp, rosePriceInUsd });
      } catch (error) {
          console.error('Error in getRosePrice:', error);
          res.status(500).json({ success: false, error: error.message });
      }
  }
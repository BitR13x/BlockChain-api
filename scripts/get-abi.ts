import { BLOCKNETWORK } from "../config";

const getContractABI = async (address: string) => {
  try {
    const response = await fetch(BLOCKNETWORK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getCode',
        params: [address, 'latest']
      })
    });

    const result = await response.json();
    const bytecode = result.result;

    // Extract ABI from bytecode
    const abiStart = bytecode.indexOf('6080604052'); // This is a marker in the bytecode
    const abiHexString = bytecode.substring(abiStart + 18); // Skip the marker bytes
    const abi = Buffer.from(abiHexString, 'hex').toString('utf-8');
    
    console.log('Contract ABI:', abi);
    return abi
} catch (error) {
    console.error('Error:', error);
    return error
  }
}

export { getContractABI }

import { PinataSDK } from 'pinata';

const pinata = new PinataSDK({
  pinataJwt: process.env.REACT_APP_PINATA_JWT,
  pinataGateway: process.env.REACT_APP_PINATA_GATEWAY
});

/**
 * Upload file lên Pinata IPFS
 * @param {File} file - File cần upload
 * @returns {Promise<{cid: string, url: string}>} - CID và URL của file
 */
export async function uploadToPinata(file) {
  try {
    const upload = await pinata.upload.public.file(file);

    if (upload.cid) {
      const ipfsUrl = await pinata.gateways.public.convert(upload.cid);
      return {
        cid: upload.cid,
        url: ipfsUrl
      };
    }
    throw new Error('Upload failed - no CID returned');
  } catch (error) {
    console.error('Pinata upload error:', error);
    throw error;
  }
}

/**
 * Hash file bằng SHA-256 để lưu vào blockchain
 * @param {File} file - File cần hash
 * @returns {Promise<string>} - Hash dạng bytes32 (0x...)
 */
export async function hashFile(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
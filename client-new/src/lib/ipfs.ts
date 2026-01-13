import { PinataSDK } from 'pinata';

const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT,
  pinataGateway: import.meta.env.VITE_PINATA_GATEWAY,
});

export interface UploadResult {
  cid: string;
  url: string;
}

/**
 * Upload file to Pinata IPFS
 * @param file - File to upload
 * @returns CID and URL of the uploaded file
 */
export async function uploadToPinata(file: File): Promise<UploadResult> {
  try {
    // Use the correct Pinata SDK method: upload.public.file()
    const upload = await pinata.upload.public.file(file);

    if (upload.cid) {
      // Use gateways.public.convert() to get the URL like the old client
      const ipfsUrl = await pinata.gateways.public.convert(upload.cid);
      return {
        cid: upload.cid,
        url: ipfsUrl,
      };
    }
    throw new Error('Upload failed - no CID returned');
  } catch (error) {
    console.error('Pinata upload error:', error);
    throw error;
  }
}

/**
 * Hash file using SHA-256 for blockchain storage
 * @param file - File to hash
 * @returns Hash in bytes32 format (0x...)
 */
export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex =
    '0x' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

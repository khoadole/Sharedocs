import { useState, useCallback } from 'react';
import { Upload, FileCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { H2, Text, Code } from '@/components/typography';
import { uploadToPinata, hashFile } from '@/lib/ipfs';
import { getContract } from '@/lib/web3';
import { toast } from 'sonner';

export function UploadDocument() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    hash: string;
    cid: string;
    txHash: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setProgress(10);

      // Step 1: Hash the file
      toast.info('Computing file hash...');
      const documentHash = await hashFile(file);
      setProgress(30);

      // Step 2: Upload to IPFS
      toast.info('Uploading to IPFS...');
      const { cid } = await uploadToPinata(file);
      setProgress(60);

      // Step 3: Record on blockchain
      toast.info('Recording on blockchain...');
      const contract = await getContract(true);
      const metadata = JSON.stringify({
        filename: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      });

      const tx = await contract.uploadDocument(documentHash, cid, metadata);
      setProgress(80);

      await tx.wait();
      setProgress(100);

      setResult({
        hash: documentHash,
        cid,
        txHash: tx.hash,
      });

      toast.success('Document uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <H2>Upload Document</H2>
        <Text variant="secondary" className="mt-2">
          Upload your document to the blockchain for permanent verification
        </Text>
      </div>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Select File</CardTitle>
          <CardDescription>
            Choose a document to upload. It will be hashed, stored on IPFS, and recorded on the blockchain.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag & Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              file
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            {file ? (
              <div className="space-y-2">
                <FileCheck className="h-12 w-12 mx-auto text-primary" />
                <Text className="font-medium">{file.name}</Text>
                <Text variant="secondary" className="text-sm">
                  {(file.size / 1024).toFixed(2)} KB
                </Text>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <Text variant="secondary">
                  Drag and drop a file here, or click to browse
                </Text>
              </div>
            )}
          </div>

          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="file">Or choose a file</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>

          {/* Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Text className="text-sm">Uploading...</Text>
                <Text className="text-sm text-muted-foreground">{progress}%</Text>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result Card */}
      {result && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileCheck className="mr-2 h-5 w-5" />
              Upload Successful
            </CardTitle>
            <CardDescription>
              Your document has been recorded on the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Document Hash</Label>
              <Code className="block mt-1 text-xs break-all">{result.hash}</Code>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">IPFS CID</Label>
              <Code className="block mt-1 text-xs break-all">{result.cid}</Code>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Transaction Hash</Label>
              <Code className="block mt-1 text-xs break-all">{result.txHash}</Code>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <Text variant="secondary" className="text-xs">
                  Save this hash to verify your document later. Any modification to the file will result in a different hash.
                </Text>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

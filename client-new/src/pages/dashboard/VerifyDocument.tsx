import { useState } from 'react';
import { FileSearch, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { H2, Text, Code } from '@/components/typography';
import { hashFile } from '@/lib/ipfs';
import { getContract, formatTimestamp } from '@/lib/web3';
import { toast } from 'sonner';

export function VerifyDocument() {
  const [verifying, setVerifying] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [hashInput, setHashInput] = useState('');
  const [result, setResult] = useState<{
    exists: boolean;
    documentHash?: string;
    ipfsCID?: string;
    uploader?: string;
    timestamp?: number;
    metadata?: {
      filename: string;
      size: number;
      type: string;
      uploadedAt: string;
    };
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const verifyByFile = async () => {
    if (!file) return;

    try {
      setVerifying(true);
      toast.info('Computing file hash...');
      
      const documentHash = await hashFile(file);
      await verifyHash(documentHash);
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Failed to verify document');
    } finally {
      setVerifying(false);
    }
  };

  const verifyByHash = async () => {
    if (!hashInput) return;

    try {
      setVerifying(true);
      await verifyHash(hashInput);
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Failed to verify document');
    } finally {
      setVerifying(false);
    }
  };

  const verifyHash = async (hash: string) => {
    const contract = await getContract(false);
    const exists = await contract.documentExists(hash);

    if (exists) {
      const doc = await contract.getDocument(hash);
      const metadata = JSON.parse(doc.metadata);

      setResult({
        exists: true,
        documentHash: doc.documentHash,
        ipfsCID: doc.ipfsCID,
        uploader: doc.uploader,
        timestamp: Number(doc.timestamp),
        metadata,
      });

      toast.success('Document verified! This document is registered on the blockchain.');
    } else {
      setResult({
        exists: false,
        documentHash: hash,
      });

      toast.error('Document not found or has been modified.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <H2>Verify Document</H2>
        <Text variant="secondary" className="mt-2">
          Check if a document is registered on the blockchain
        </Text>
      </div>

      {/* Verification Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Verification Method</CardTitle>
          <CardDescription>
            Verify by uploading the file or entering its hash
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="file" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file">By File</TabsTrigger>
              <TabsTrigger value="hash">By Hash</TabsTrigger>
            </TabsList>

            {/* Verify by File */}
            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verify-file">Upload File</Label>
                <Input
                  id="verify-file"
                  type="file"
                  onChange={handleFileChange}
                  disabled={verifying}
                />
                {file && (
                  <Text variant="secondary" className="text-sm">
                    Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </Text>
                )}
              </div>
              <Button
                onClick={verifyByFile}
                disabled={!file || verifying}
                className="w-full"
              >
                {verifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <FileSearch className="mr-2 h-4 w-4" />
                    Verify File
                  </>
                )}
              </Button>
            </TabsContent>

            {/* Verify by Hash */}
            <TabsContent value="hash" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hash-input">Document Hash</Label>
                <Input
                  id="hash-input"
                  type="text"
                  placeholder="0x..."
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  disabled={verifying}
                />
                <Text variant="secondary" className="text-sm">
                  Enter the 66-character hash (starting with 0x)
                </Text>
              </div>
              <Button
                onClick={verifyByHash}
                disabled={!hashInput || verifying}
                className="w-full"
              >
                {verifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <FileSearch className="mr-2 h-4 w-4" />
                    Verify Hash
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Result Card */}
      {result && (
        <Card
          className={
            result.exists
              ? 'border-green-500/50 bg-green-500/5'
              : 'border-destructive/50 bg-destructive/5'
          }
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              {result.exists ? (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  Document Verified
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-5 w-5 text-destructive" />
                  Document Not Found
                </>
              )}
            </CardTitle>
            <CardDescription>
              {result.exists
                ? 'This document is registered on the blockchain'
                : 'This document has not been registered or has been modified'}
            </CardDescription>
          </CardHeader>
          {result.exists && result.metadata && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Filename</Label>
                  <Text className="mt-1">{result.metadata.filename}</Text>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">File Size</Label>
                  <Text className="mt-1">{(result.metadata.size / 1024).toFixed(2)} KB</Text>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">File Type</Label>
                  <Text className="mt-1">{result.metadata.type || 'Unknown'}</Text>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Uploaded At</Label>
                  <Text className="mt-1">
                    {result.timestamp ? formatTimestamp(result.timestamp) : 'Unknown'}
                  </Text>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Document Hash</Label>
                <Code className="block mt-1 text-xs break-all">{result.documentHash}</Code>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">IPFS CID</Label>
                <Code className="block mt-1 text-xs break-all">{result.ipfsCID}</Code>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Uploader Address</Label>
                <Code className="block mt-1 text-xs break-all">{result.uploader}</Code>
              </div>

              <div className="pt-2 border-t">
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/50">
                  ✓ Authentic Document
                </Badge>
              </div>
            </CardContent>
          )}
          {!result.exists && (
            <CardContent>
              <div>
                <Label className="text-xs text-muted-foreground">Hash Checked</Label>
                <Code className="block mt-1 text-xs break-all">{result.documentHash}</Code>
              </div>
              <div className="mt-4">
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/50">
                  ✗ Not Registered or Modified
                </Badge>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}

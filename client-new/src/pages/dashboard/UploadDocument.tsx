import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { H2, Text } from '@/components/typography';
import { uploadToPinata, hashFile } from '@/lib/ipfs';
import { getContract } from '@/lib/web3';
import { toast } from 'sonner';
import { getUser } from '@/features/auth/authStorage';
import { LoginRequired } from '@/components/auth/LoginRequired';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ExternalLink, Copy } from 'lucide-react';

export function UploadDocument() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    hash: string;
    cid: string;
    txHash: string;
    timestamp: string;
    filename: string;
  } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isValidFileType = (file: File) => {
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/webp'
    ];
    return allowedTypes.includes(file.type) || file.type.startsWith('text/');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (!isValidFileType(droppedFile)) {
        toast.error('Invalid file type. Please upload a document or image.');
        return;
      }
      setFile(droppedFile);
      setResult(null);
    }
  }, []);

  const user = getUser();

  if (!user) {
    return <LoginRequired />;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!isValidFileType(selectedFile)) {
        toast.error('Invalid file type. Please upload a document or image.');
        e.target.value = ''; // Reset input
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

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

      const successData = {
        hash: documentHash,
        cid,
        txHash: tx.hash,
        timestamp: new Date().toLocaleString(),
        filename: file.name
      };

      setResult(successData);
      setShowSuccessModal(true);
      toast.success('Document uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);

      // Handle MetaMask refusal
      if (error.code === 'ACTION_REJECTED' || error.message?.includes('user rejected')) {
        toast.error('Transaction refused by user.');
        return;
      }

      toast.error('Failed to upload document');
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
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${file
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

      {/* Result Card removed as it is now redundant with the Success Dialog popup */}

      {/* Success Dialog */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-950 border-border shadow-2xl p-0 overflow-hidden !opacity-100 !fill-mode-forwards">
          <div className="bg-primary/5 p-6 border-b border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-primary text-2xl font-bold">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <FileCheck className="h-6 w-6 text-primary" />
                </div>
                Upload Confirmed
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-2">
                Your document has been safely recorded on the blockchain and IPFS.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Document Hash</Label>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border group">
                  <code className="font-mono text-xs break-all leading-relaxed text-foreground pr-4">
                    {result?.hash}
                  </code>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-primary/20" onClick={() => {
                    navigator.clipboard.writeText(result?.hash || '');
                    toast.success('Hash copied!');
                  }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-muted/30 border border-border/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Timestamp</span>
                  <span className="text-sm font-semibold">{result?.timestamp}</span>
                </div>
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-muted/30 border border-border/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">File Name</span>
                  <span className="text-sm font-semibold truncate" title={result?.filename}>{result?.filename}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Transaction Hash</Label>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border group">
                  <code className="font-mono text-xs break-all leading-relaxed text-foreground pr-4">
                    {result?.txHash}
                  </code>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-primary/20" onClick={() => {
                    navigator.clipboard.writeText(result?.txHash || '');
                    toast.success('Tx hash copied!');
                  }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Storage (IPFS)</Label>
              <a
                href={`https://gateway.pinata.cloud/ipfs/${result?.cid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all group lg:p-5"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-105 transition-transform">
                    <ExternalLink className="h-6 w-6 text-primary" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-foreground">View on IPFS</p>
                    <p className="text-[10px] text-muted-foreground truncate font-mono">ipfs://{result?.cid}</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-primary opacity-40 group-hover:opacity-100" />
              </a>
            </div>
          </div>

          <DialogFooter className="p-6 bg-muted/20 border-t border-border gap-3 sm:gap-0">
            <Button variant="ghost" className="rounded-xl px-6 hover:bg-muted font-medium" onClick={() => setShowSuccessModal(false)}>
              Close
            </Button>
            <Button className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

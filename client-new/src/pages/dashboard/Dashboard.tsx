import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, Upload, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { H2, Text, Code } from '@/components/typography';
import { getContract, formatTimestamp, formatAddress } from '@/lib/web3';

interface Document {
  hash: string;
  filename: string;
  size: number;
  timestamp: number;
  ipfsCID: string;
}

export function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<string>('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const contract = await getContract(false);
      
      // Get current account
      const provider = contract.runner?.provider;
      if (provider) {
        const accounts = await (provider as any).send('eth_requestAccounts', []);
        setAccount(accounts[0]);

        // Get documents by uploader
        const docHashes = await contract.getDocumentsByUploader(accounts[0]);
        
        const docs: Document[] = [];
        for (const hash of docHashes) {
          const [ipfsCID, uploader, timestamp, metadata] = await contract.getDocument(hash);
          const meta = JSON.parse(metadata);
          
          docs.push({
            hash: hash,
            filename: meta.filename,
            size: meta.size,
            timestamp: Number(timestamp),
            ipfsCID: ipfsCID,
          });
        }

        setDocuments(docs.reverse()); // Show newest first
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <H2>My Documents</H2>
          <Text variant="secondary" className="mt-2">
            View and manage your uploaded documents
          </Text>
        </div>
        <Link to="/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload New
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered on blockchain
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(documents.reduce((acc, doc) => acc + doc.size, 0) / 1024 / 1024).toFixed(2)} MB
            </div>
            <p className="text-xs text-muted-foreground">
              Stored on IPFS
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAddress(account)}</div>
            <p className="text-xs text-muted-foreground">
              Connected wallet
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            All documents you've uploaded to the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <Text variant="secondary">No documents yet</Text>
              <Link to="/upload">
                <Button variant="link" className="mt-2">
                  Upload your first document
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead>IPFS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.hash}>
                    <TableCell className="font-medium">{doc.filename}</TableCell>
                    <TableCell>{(doc.size / 1024).toFixed(2)} KB</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {formatTimestamp(doc.timestamp)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Code className="text-xs">
                        {doc.hash.substring(0, 10)}...
                      </Code>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${doc.ipfsCID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center"
                      >
                        View
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

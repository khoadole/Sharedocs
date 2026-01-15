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
import { formatAddress } from '@/lib/web3';
import { getUser } from '@/features/auth/authStorage';
import { LoginRequired } from '@/components/auth/LoginRequired';
import { getUserDocuments } from '@/features/documents/documentService';
import type { Document } from '@/types/documents/types';
import { toast } from 'sonner';

export function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });

  const user = getUser();

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [pagination.page]); 

  const loadDocuments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await getUserDocuments({
        userId: user.id,
        page: pagination.page,
        limit: pagination.limit,
        sortBy: 'created_at',
        order: 'DESC'
      });

      setDocuments(response.documents);
      // Only update total and totalPages, not page (to avoid infinite loop)
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      }));
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <LoginRequired />;
  }

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
            <div className="text-2xl font-bold">{pagination.total}</div>
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
              {(documents.reduce((acc, doc) => acc + doc.file_size, 0) / 1024 / 1024).toFixed(2)} MB
            </div>
            <p className="text-xs text-muted-foreground">
              Stored on IPFS
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.email || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {user?.walletAddress ? formatAddress(user.walletAddress) : 'No wallet connected'}
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
                  <TableHead>Visibility</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.filename}</TableCell>
                    <TableCell>{(doc.file_size / 1024).toFixed(2)} KB</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Code className="text-xs">
                        {doc.document_hash.substring(0, 10)}...
                      </Code>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${doc.ipfs_cid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center"
                      >
                        View
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge variant={doc.visibility === 'PUBLIC' ? 'default' : 'secondary'}>
                        {doc.visibility}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

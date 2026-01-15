import { useState, useEffect } from 'react';
import { Search, Filter, FileText, ExternalLink, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { H2, Text, Code } from '@/components/typography';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Document } from '@/types/documents/types';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function PublicDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileType, setFileType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  });

  useEffect(() => {
    loadDocuments();
  }, [searchTerm, fileType, sortBy, order, pagination.page]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        order
      });

      if (searchTerm) params.append('search', searchTerm);
      if (fileType && fileType !== 'all') params.append('fileType', fileType);

      const response = await fetch(`${API_BASE_URL}/api/documents/public?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch documents');
      }

      setDocuments(result.documents);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(p => ({ ...p, page: 1 }));
    loadDocuments();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <H2>Public Documents</H2>
        <Text variant="secondary" className="mt-2">
          Browse and verify documents on the blockchain
        </Text>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by filename or hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Filters & Sorting */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Type Filter */}
              <div className="space-y-2">
                <Label>File Type</Label>
                <Select value={fileType} onValueChange={setFileType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="application/pdf">PDF</SelectItem>
                    <SelectItem value="application/msword">Word</SelectItem>
                    <SelectItem value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">
                      Word (DOCX)
                    </SelectItem>
                    <SelectItem value="text/plain">Text</SelectItem>
                    <SelectItem value="image/png">PNG</SelectItem>
                    <SelectItem value="image/jpeg">JPEG</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Upload Date</SelectItem>
                    <SelectItem value="filename">Filename</SelectItem>
                    <SelectItem value="file_size">File Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Order */}
              <div className="space-y-2">
                <Label>Order</Label>
                <Select value={order} onValueChange={(v) => setOrder(v as 'ASC' | 'DESC')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DESC">Newest First</SelectItem>
                    <SelectItem value="ASC">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchTerm('');
                  setFileType('all');
                  setSortBy('created_at');
                  setOrder('DESC');
                }}
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Documents</span>
                <span className="font-bold">{pagination.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Page</span>
                <span className="font-bold">{pagination.page} / {pagination.totalPages}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Content - Documents Grid */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <Text variant="secondary">No documents found</Text>
                <Text variant="secondary" className="text-sm mt-2">
                  Try adjusting your search or filters
                </Text>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate" title={doc.filename}>
                              {doc.filename}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {(doc.file_size / 1024).toFixed(2)} KB
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Hash */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Document Hash</Label>
                        <Code className="text-xs block">
                          {doc.document_hash.substring(0, 20)}...
                        </Code>
                      </div>

                      {/* IPFS CID */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">IPFS CID</Label>
                        <Code className="text-xs block truncate">
                          {doc.ipfs_cid}
                        </Code>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(doc.created_at).toLocaleDateString()}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {doc.file_type?.split('/')[1]?.toUpperCase() || 'FILE'}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            navigator.clipboard.writeText(doc.document_hash);
                            toast.success('Hash copied!');
                          }}
                        >
                          Copy Hash
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <a
                            href={`https://gateway.pinata.cloud/ipfs/${doc.ipfs_cid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1"
                          >
                            View on IPFS
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-4">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

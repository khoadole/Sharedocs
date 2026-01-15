import type {
  Document,
  CreateDocumentData,
  DocumentsResponse,
  DocumentResponse
} from '@/types/documents/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Re-export types for convenience
export type {
  Document,
  CreateDocumentData,
  DocumentsResponse,
  DocumentResponse
};

/**
 * Create document record after blockchain upload
 */
export async function createDocument(data: CreateDocumentData): Promise<DocumentResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to create document');
    }

    return result;
  } catch (error) {
    console.error('Create document error:', error);
    throw error;
  }
}

/**
 * Get user's documents with search and filter
 */
export async function getUserDocuments({
  userId,
  search = '',
  fileType = null,
  visibility = null,
  sortBy = 'created_at',
  order = 'DESC',
  page = 1,
  limit = 20
}: {
  userId: string;
  search?: string;
  fileType?: string | null;
  visibility?: 'PUBLIC' | 'PRIVATE' | null;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}): Promise<DocumentsResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      order
    });

    if (search) params.append('search', search);
    if (fileType) params.append('fileType', fileType);
    if (visibility) params.append('visibility', visibility);

    const response = await fetch(`${API_BASE_URL}/api/documents/user/${userId}?${params.toString()}`);

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch documents');
    }

    return result;
  } catch (error) {
    console.error('Get documents error:', error);
    throw error;
  }
}

/**
 * Get single document by ID
 */
export async function getDocumentById(documentId: string, userId: string): Promise<DocumentResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/documents/${documentId}?userId=${userId}`
    );

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch document');
    }

    return result;
  } catch (error) {
    console.error('Get document error:', error);
    throw error;
  }
}

/**
 * Update document visibility or metadata
 */
export async function updateDocument(
  documentId: string,
  userId: string,
  updates: {
    visibility?: 'PUBLIC' | 'PRIVATE';
    metadata?: any;
  }
): Promise<DocumentResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, ...updates }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update document');
    }

    return result;
  } catch (error) {
    console.error('Update document error:', error);
    throw error;
  }
}

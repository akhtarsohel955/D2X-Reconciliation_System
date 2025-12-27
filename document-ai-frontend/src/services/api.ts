const API_BASE_URL = 'http://localhost:3000';

export interface JobStatus {
  jobId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error?: string;
}

export interface JobResponse {
  jobId: string;
  status: string;
}

export interface DownloadResponse {
  statusCode: number;
  status: string;
  downloadUrl?: string;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  accessToken: string;
}

export interface User {
  email: string;
  name?: string;
}

// Token management
export const TokenManager = {
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  },
  
  setToken(token: string): void {
    localStorage.setItem('accessToken', token);
  },
  
  removeToken(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },
  
  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Helper function to get headers with auth token
function getAuthHeaders(): HeadersInit {
  const token = TokenManager.getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// Authentication functions
export async function register(email: string, password: string, name?: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(error.message || 'Registration failed');
  }

  const authResponse = await response.json();
  
  // Store token and user info
  TokenManager.setToken(authResponse.accessToken);
  TokenManager.setUser({ email, name: name || email.split('@')[0] });
  
  return authResponse;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.message || 'Invalid credentials');
  }

  const authResponse = await response.json();
  
  // Store token and user info
  TokenManager.setToken(authResponse.accessToken);
  TokenManager.setUser({ email });
  
  return authResponse;
}

export function logout(): void {
  TokenManager.removeToken();
}

export function isAuthenticated(): boolean {
  return !!TokenManager.getToken();
}

// Upload file to S3 using presigned URL
export async function uploadToS3(file: File): Promise<string> {
  // Get presigned URL
  const response = await fetch(`${API_BASE_URL}/upload/presigned-url`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required. Please login again.');
    }
    throw new Error('Failed to get presigned URL');
  }

  const { url, key } = await response.json();

  // Upload file to S3
  const uploadResponse = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload file to S3');
  }

  return key;
}

// Create processing job
export async function createJob(
  fileKey: string, 
  documentType: 'EXPENSE' | 'HR'
): Promise<JobResponse> {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      inputFileKey: fileKey,
      documentType,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required. Please login again.');
    }
    throw new Error('Failed to create job');
  }

  return response.json();
}

// Get job status
export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/status`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required. Please login again.');
    }
    throw new Error('Failed to get job status');
  }

  return response.json();
}

// Get download URL for completed job
export async function getDownloadUrl(jobId: string): Promise<DownloadResponse> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/download`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required. Please login again.');
    }
    throw new Error('Failed to get download URL');
  }

  return response.json();
}

// Complete upload and processing workflow with percentage tracking
export async function processDocument(
  file: File,
  documentType: 'EXPENSE' | 'HR',
  onStatusUpdate?: (status: string, percentage?: number) => void
): Promise<string> {
  try {
    // Step 1: Upload file (0-30%)
    onStatusUpdate?.('UPLOADING', 0);
    const fileKey = await uploadToS3(file);
    onStatusUpdate?.('UPLOADING', 30);

    // Step 2: Create job (30-40%)
    onStatusUpdate?.('CREATING_JOB', 35);
    const job = await createJob(fileKey, documentType);
    onStatusUpdate?.('CREATING_JOB', 40);

    // Step 3: Poll for completion (40-100%)
    onStatusUpdate?.('PROCESSING', 45);
    
    return new Promise((resolve, reject) => {
      let pollCount = 0;
      const maxPolls = 100; // 5 minutes with 3-second intervals
      
      const pollInterval = setInterval(async () => {
        try {
          pollCount++;
          const status = await getJobStatus(job.jobId);
          
          // Calculate progress percentage for processing phase (45-95%)
          const processingProgress = Math.min(45 + (pollCount / maxPolls) * 50, 95);
          onStatusUpdate?.(status.status, processingProgress);

          if (status.status === 'COMPLETED') {
            clearInterval(pollInterval);
            
            // Final step: Get download URL (95-100%)
            onStatusUpdate?.('COMPLETED', 98);
            const downloadResponse = await getDownloadUrl(job.jobId);
            onStatusUpdate?.('COMPLETED', 100);
            
            if (downloadResponse.downloadUrl) {
              resolve(downloadResponse.downloadUrl);
            } else {
              reject(new Error('No download URL available'));
            }
          } else if (status.status === 'FAILED') {
            clearInterval(pollInterval);
            reject(new Error(status.error || 'Processing failed'));
          }
          
          // Timeout check
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            reject(new Error('Processing timeout'));
          }
        } catch (error) {
          clearInterval(pollInterval);
          reject(error);
        }
      }, 3000); // Poll every 3 seconds
    });
  } catch (error) {
    throw error;
  }
}
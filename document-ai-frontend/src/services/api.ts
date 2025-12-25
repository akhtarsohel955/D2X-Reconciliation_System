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

// Upload file to S3 using presigned URL
export async function uploadToS3(file: File): Promise<string> {
  // Get presigned URL
  const response = await fetch(`${API_BASE_URL}/upload/presigned-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
    }),
  });

  if (!response.ok) {
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inputFileKey: fileKey,
      documentType,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create job');
  }

  return response.json();
}

// Get job status
export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/status`);
  
  if (!response.ok) {
    throw new Error('Failed to get job status');
  }

  return response.json();
}

// Get download URL for completed job
export async function getDownloadUrl(jobId: string): Promise<DownloadResponse> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/download`);
  
  if (!response.ok) {
    throw new Error('Failed to get download URL');
  }

  return response.json();
}

// Complete upload and processing workflow
export async function processDocument(
  file: File,
  documentType: 'EXPENSE' | 'HR',
  onStatusUpdate?: (status: string) => void
): Promise<string> {
  try {
    // Step 1: Upload file
    onStatusUpdate?.('UPLOADING');
    const fileKey = await uploadToS3(file);

    // Step 2: Create job
    onStatusUpdate?.('CREATING_JOB');
    const job = await createJob(fileKey, documentType);

    // Step 3: Poll for completion
    onStatusUpdate?.('PROCESSING');
    
    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const status = await getJobStatus(job.jobId);
          onStatusUpdate?.(status.status);

          if (status.status === 'COMPLETED') {
            clearInterval(pollInterval);
            
            // Get download URL
            const downloadResponse = await getDownloadUrl(job.jobId);
            if (downloadResponse.downloadUrl) {
              resolve(downloadResponse.downloadUrl);
            } else {
              reject(new Error('No download URL available'));
            }
          } else if (status.status === 'FAILED') {
            clearInterval(pollInterval);
            reject(new Error(status.error || 'Processing failed'));
          }
        } catch (error) {
          clearInterval(pollInterval);
          reject(error);
        }
      }, 3000); // Poll every 3 seconds

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        reject(new Error('Processing timeout'));
      }, 300000);
    });
  } catch (error) {
    throw error;
  }
}
# Document to Excel Converter - Enhanced Frontend

This is an enhanced React frontend for the Document to Excel conversion system. It provides a sophisticated UI for uploading and converting documents using the document-ai-backend API.

## Features

- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Document Upload**: Drag & drop file upload with progress tracking
- **Real-time Processing**: Live status updates during document processing
- **Multiple Document Types**: Support for Expense and HR documents
- **Download Management**: Easy access to converted Excel files
- **User Authentication**: Simple login/signup system
- **Conversion History**: Track all your document conversions

## Tech Stack

- React 19 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- React Router for navigation
- Integration with document-ai-backend API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- document-ai-backend running on localhost:3000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:5173 in your browser

### Backend Integration

This frontend is designed to work with the document-ai-backend. Make sure the backend is running on `http://localhost:3000` before using the application.

The frontend integrates with these backend endpoints:
- `POST /upload/presigned-url` - Get S3 upload URL
- `POST /jobs` - Create processing job
- `GET /jobs/:id/status` - Check job status
- `GET /jobs/:id/download` - Get download URL

## Usage

1. **Sign Up/Login**: Create an account or sign in
2. **Dashboard**: Choose between Expense or HR document conversion
3. **Upload**: Drag & drop or select your document file
4. **Convert**: Click convert and watch real-time progress
5. **Download**: Download your Excel file when processing completes

## Document Types Supported

### Expense Documents
- Invoices
- Receipts
- Bills
- Financial statements

### HR Documents
- Employee forms
- Records
- Applications
- Any structured HR document

## File Formats

- PDF documents
- JPEG/JPG images
- PNG images
- WebP images
- BMP images
- TIFF images

Maximum file size: 50MB

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Environment Variables

No environment variables needed for development. The API base URL is configured to `http://localhost:3000`.

For production, you may want to configure:
- API_BASE_URL
- Other environment-specific settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Document to Excel conversion system.
# 📊 D2X - Document to Excel Reconciliation System

An enterprise-grade AI-powered document processing and reconciliation system that converts documents to Excel and automatically matches financial records using AWS Textract and intelligent algorithms.

![Tech Stack](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)

## 🌟 Features

### 📄 Document Processing
- **Expense Document Conversion** - Convert invoices and receipts to structured Excel
- **HR Document Processing** - Extract employee and payroll data
- **Multi-format Support** - PDF, PNG, JPG, DOCX

### 🔄 Intelligent Reconciliation
- **4 Matching Algorithms** - Exact, Fuzzy (Levenshtein), Amount-based, Date-based
- **Multi-file Processing** - Handle multiple source and target documents
- **Real-time Progress Tracking** - Live status updates with percentage
- **Comprehensive Reports** - 4-sheet Excel with Summary, Matched, Unmatched, Discrepancies

### 🎯 Reconciliation Types
1. **Invoice vs Purchase Order** - Verify invoice accuracy
2. **Bank Statement vs Ledger** - Find missing transactions
3. **Timesheet vs Payroll** - Validate employee payments
4. **General Reconciliation** - Custom document matching

### 🔐 Authentication
- JWT-based user authentication
- Guest mode for instant testing
- Session and persistent history

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│   Backend API   │───▶│     Worker      │
│  React + TS     │    │   NestJS + TS   │    │   Node.js + TS  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
                       ┌─────────────┐        ┌─────────────────┐
                       │   MySQL     │        │   AWS Services  │
                       │  Database   │        │ S3, SQS, Textract│
                       └─────────────┘        └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- AWS Account (Textract, S3, SQS)

### Installation

**1. Clone Repository**
```bash
git clone https://github.com/akhtarsohel955/D2X-Reconciliation_System.git
cd D2X-Reconciliation_System
```

**2. Setup Environment Variables**

Create `.env` files in backend and worker directories:

```env
# Backend & Worker .env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=document_ai

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET=your-bucket
SQS_QUEUE_URL=your-queue-url

JWT_SECRET=your_jwt_secret
```

**3. Start Services**

Open 3 terminals:

```bash
# Terminal 1 - Backend
cd document-ai-backend
npm install
npm start
# http://localhost:3000

# Terminal 2 - Worker
cd document-ai-worker
npm install
npm start

# Terminal 3 - Frontend
cd document-ai-frontend
npm install
npm run dev
# http://localhost:5173
```

**4. Initialize Database**
```sql
-- Auto-created by TypeORM synchronize
-- Or run manually:
mysql -u root -p document_ai < document-ai-backend/migrations/001_create_reconciliation_table.sql
```

## 📂 Project Structure

```
D2X-Reconciliation_System/
├── document-ai-backend/          # NestJS Backend API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── reconciliation/   # Reconciliation module
│   │   │   ├── jobs/             # Job processing
│   │   │   ├── upload/           # File upload
│   │   │   └── auth/             # Authentication
│   │   ├── infra/                # S3, SQS clients
│   │   └── config/               # Configuration
│   └── migrations/               # Database migrations
│
├── document-ai-worker/           # Background Worker
│   ├── src/
│   │   ├── reconciliation/       # Reconciliation logic
│   │   │   ├── matching.engine.ts    # 4 algorithms
│   │   │   ├── reconciliation.processor.ts
│   │   │   └── reconciliation.exporter.ts
│   │   ├── entity/               # TypeORM entities
│   │   └── sqs/                  # SQS consumer
│
└── document-ai-frontend/         # React Frontend
    ├── src/
    │   ├── pages/                # Page components
    │   │   ├── ReconciliationConverter.tsx
    │   │   ├── ExpenseConverter.tsx
    │   │   └── HRConverter.tsx
    │   ├── services/             # API integration
    │   └── contexts/             # State management
```

## 💻 Tech Stack

### Backend
- **Framework:** NestJS 11
- **ORM:** TypeORM
- **Database:** MySQL 8
- **Authentication:** JWT + Passport
- **Validation:** class-validator

### Worker
- **Runtime:** Node.js + TypeScript
- **AWS SDK:** v3 (Textract, S3, SQS)
- **Excel:** ExcelJS
- **Database:** TypeORM

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Build:** Vite
- **Routing:** React Router

### Cloud Services
- **AWS Textract** - AI document extraction
- **AWS S3** - File storage
- **AWS SQS** - Message queue
- **MySQL** - Relational database

## 🔧 Key Technical Features

### Matching Algorithms

1. **Exact Match** (100% confidence)
   - Reference number matching
   - Perfect for documents with unique IDs

2. **Fuzzy Match** (≥80% similarity)
   - Levenshtein distance algorithm
   - Handles description variations

3. **Amount + Date Match** (90% confidence)
   - 1% amount tolerance
   - 3-day date tolerance

4. **Unmatched Detection**
   - Identifies records without pairs

### Performance
- Processing Time: 2-5 minutes per reconciliation
- Capacity: 10,000+ records per batch
- Scalability: Horizontal worker scaling

## 📊 API Endpoints

```
POST   /reconciliation              # Create reconciliation (auth)
POST   /reconciliation/guest        # Create reconciliation (guest)
GET    /reconciliation/:id/status   # Get status
GET    /reconciliation/:id/download # Download report
GET    /reconciliation/user/list    # List user reconciliations

POST   /jobs                        # Create document job
GET    /jobs/:id/status             # Get job status
GET    /jobs/:id/download           # Download result
```

## 📖 Documentation

- [**Reconciliation Feature Guide**](RECONCILIATION_FEATURE.md) - Technical deep dive
- [**Complete System Documentation**](RECONCILIATION_SYSTEM_DOCUMENTATION.md) - Full reference

## 🧪 Testing

```bash
# Verify setup
node verify-reconciliation-setup.js

# Check database
mysql -u root -p document_ai
source check-database.sql
```

## 🛡️ Security

- JWT authentication for protected endpoints
- Environment-based configuration
- AWS IAM roles (production)
- Input validation with DTOs
- .env files excluded from git

## 📈 Roadmap

- [ ] Type-specific parsers (Bank, Timesheet, HR)
- [ ] Many-to-many matching
- [ ] Machine learning integration
- [ ] Custom matching rules UI
- [ ] Scheduled reconciliations
- [ ] Email notifications

## 👨‍💻 Author

**Akhtar Sohel**
- GitHub: [@akhtarsohel955](https://github.com/akhtarsohel955)

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- AWS Textract for AI document processing
- NestJS for backend framework
- React community for frontend tools

---

**Status:** ✅ Production-ready | Fully tested | Documented

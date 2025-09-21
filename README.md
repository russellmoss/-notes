# 📝 Notes Middleware

> **Never forget anything again** - A Next.js application that automatically processes and organizes notes from multiple sources into a searchable Notion database, creating a comprehensive knowledge base that can be queried with LLMs.

![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black?style=for-the-badge&logo=next.js)
![Notion](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

## 🎯 Why This Was Created

I wanted something where I could write notes and record meetings using Otter.ai and put all those files into a database that I could query later with an LLM. This way we **never forget anything**. We can use Otter and record and we take the summary and put it into a Google doc. If we need the original transcript, it links to it for us. We can also write notes in MyScript and turn those into typing and put those in a Google doc too. This is good because I have bad handwriting and MyScript converts even my handwriting into text at about a 90% accuracy. 🖋️✨

## 🚀 What This App Does

This middleware automatically:

1. 🔍 **Monitors Google Drive folders** for new documents from Otter.ai and MyScript
2. 🤖 **Processes documents** using OpenAI's LLM to extract structured information
3. 📊 **Stores organized data** in Notion with summaries, action items, and key takeaways
4. 🛡️ **Prevents duplicates** using Google Drive Document ID tracking
5. ⏰ **Runs automatically** via cron jobs to catch new documents

### 📱 Supported Sources

- 🎙️ **Otter.ai**: Audio transcription and meeting notes
- ✍️ **MyScript**: Handwritten notes converted to text (90% accuracy!)
- 📝 **Manual**: Direct text input for manual notes

### 📋 What Gets Extracted

For each document, the system extracts:
- 📄 **Title and date**
- 🔥 **TL;DR summary**
- 💡 **Key takeaways**
- ✅ **Action items with owners and due dates**
- 📖 **Full text content**
- 🏷️ **Source information**

## 🛠️ Getting Started

### 📋 Prerequisites

- 🟢 Node.js 18+ 
- 📝 A Notion account with API access
- 🤖 OpenAI API key
- 📁 Google Drive API access
- ☁️ Google Cloud Service Account

### ⚡ Quick Installation

1. **📥 Clone the repository**
   ```bash
   git clone https://github.com/yourusername/notes-middleware.git
   cd notes-middleware
   ```

2. **📦 Install dependencies**
   ```bash
   npm install
   ```

3. **⚙️ Set up environment variables** (see Environment Setup below)

4. **🚀 Run the development server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your-openai-api-key

# Notion Configuration
NOTION_TOKEN=ntn_your-notion-integration-token
NOTION_DB_ID=your-notion-database-id

# Security
INGEST_SHARED_SECRET=your-shared-secret-for-api-authentication

# Google Drive Sync
SYNC_API_KEY=your-sync-api-key
CRON_SECRET=your-cron-secret

# Application URL
NEXT_PUBLIC_APP_URL=https://your-app-domain.vercel.app

# Google Credentials (Service Account JSON)
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"your-project",...}
```

### 🔍 Where to Get These Values

#### 🤖 OpenAI API Key
1. 🌐 Go to [OpenAI Platform](https://platform.openai.com/)
2. 👤 Create an account and navigate to API keys
3. 🔑 Generate a new API key

#### 📝 Notion Integration
1. 🌐 Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. ➕ Create a new integration
3. 📋 Copy the "Internal Integration Token"
4. 🔗 Share your database with the integration
5. 🆔 Get your database ID from the database URL

#### ☁️ Google Cloud Service Account
1. 🌐 Go to [Google Cloud Console](https://console.cloud.google.com/)
2. 📁 Create a new project or select existing one
3. 🔌 Enable Google Drive API and Google Docs API
4. 👤 Create a Service Account
5. 📄 Download the JSON credentials file
6. 🔗 Share your Google Drive folders with the service account email

#### 🆔 Database ID
- 📍 Found in your Notion database URL: `https://notion.so/[database-id]?v=...`

## 🚀 Deployment

### ⚡ Vercel Deployment

1. 🔗 **Connect your GitHub repository to Vercel**
2. ⚙️ **Set environment variables** in Vercel dashboard
3. 🚀 **Deploy** - Vercel will automatically build and deploy

### ⏰ Setting Up Cron Jobs

We use [cron-job.org](https://cron-job.org) for **free** cron job scheduling:

1. 🆓 **Create a free account** at cron-job.org
2. ➕ **Add a new cron job** with these settings:
   - 🌐 **URL**: `https://your-app.vercel.app/api/sync-drive`
   - 📤 **Method**: POST
   - 🔐 **Headers**: `Authorization: Bearer YOUR_SYNC_API_KEY`
   - ⏰ **Schedule**: Every 5 minutes
   - ⏱️ **Timeout**: 30 seconds

## 🔌 API Endpoints

### 🏥 Health Check
```
GET /api/health
```
Returns basic health status.

### 🔄 Sync Drive
```
POST /api/sync-drive
```
Triggers manual sync of Google Drive folders. Requires `SYNC_API_KEY` in Authorization header.

### 📥 Ingest Notes
```
POST /api/ingest
```
Processes raw text content and creates structured Notion pages.

### 🧪 Environment Test
```
GET /api/test-env
```
Checks if all required environment variables are configured.

## 🏗️ Architecture

```
📁 Google Drive Folders → ⏰ Cron Job → 🔄 Sync API → 🤖 Document Processor → 🧠 OpenAI LLM → 📊 Notion Database
```

1. 📁 **Google Drive**: Documents from Otter.ai and MyScript
2. ⏰ **Cron Job**: Triggers sync every 5 minutes
3. 🤖 **Document Processor**: Extracts content and checks for duplicates
4. 🧠 **OpenAI LLM**: Processes text and extracts structured information
5. 📊 **Notion**: Stores organized, searchable knowledge base

## 🛡️ Duplicate Prevention

The system uses Google Drive Document IDs to prevent duplicate processing:
- 🆔 Each document gets a unique Document ID property in Notion
- 🔍 Before processing, the system checks if the Document ID already exists
- ⏭️ If found, the document is skipped
- ✅ This ensures no duplicate entries in your knowledge base

## 🚀 Future Enhancements

### 🧠 Vector Database Integration
We may want to push these things to a vector database in the future for better parsing and accuracy of recall of our knowledge base, but this is good enough for now. The idea is to build up as much of a knowledge base as possible such that the LLM can act as the best possible assistant and force multiplier. 💪

Potential improvements:
- 🔍 **Vector embeddings** for semantic search
- 🎯 **Better context retrieval** for LLM queries
- 🏷️ **Advanced filtering** and categorization
- 🔗 **Cross-reference analysis** between documents

## 🤝 Contributing

1. 🍴 Fork the repository
2. 🌿 Create a feature branch
3. ✏️ Make your changes
4. 🧪 Test thoroughly
5. 📤 Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues or questions, please open an issue on GitHub or contact the maintainer.

---

> **🎯 Goal**: Create a comprehensive, searchable knowledge base that acts as a force multiplier for decision-making and information recall.

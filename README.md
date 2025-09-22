# 📚 Russell's Notes

> **Never forget anything again** - A comprehensive Next.js application that processes, organizes, and manages notes from multiple sources with AI-powered insights, review workflows, and intelligent chat capabilities.

![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black?style=for-the-badge&logo=next.js)
![Notion](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

## 🎯 What This App Does

Russell's Notes is a comprehensive knowledge management system that:

1. 🔍 **Processes notes from multiple sources** (Otter.ai, MyScript, manual uploads)
2. 🤖 **Uses AI to extract insights** with GPT-5 for document processing and GPT-5-chat-latest for conversations
3. 📊 **Organizes everything in Notion** with structured summaries, action items, and metadata
4. 🔄 **Manages review workflows** with automated email reminders and review tracking
5. 💬 **Provides intelligent chat** to query your entire knowledge base
6. 📱 **Offers a beautiful web interface** with dark mode, search, and filtering
7. ⏰ **Runs automated workflows** via Vercel cron jobs

## ✨ Key Features

### 📝 **Multi-Source Note Processing**
- 🎙️ **Otter.ai Integration**: Automatic transcription processing
- ✍️ **MyScript Support**: Handwritten notes with 90% accuracy conversion
- 📤 **Manual Upload**: Direct file upload with transcript/written note merging
- 🔄 **Google Drive Sync**: Automated monitoring of designated folders

### 🤖 **AI-Powered Intelligence**
- 🧠 **GPT-5 Document Processing**: Advanced summarization and insight extraction
- 💬 **GPT-5-Chat-Latest**: Conversational AI for knowledge base queries
- 👥 **People Identification**: Automatic detection of meeting participants
- 📋 **Action Item Extraction**: Structured task identification with owners and due dates
- 🔍 **Key Takeaway Generation**: Intelligent content summarization

### 📊 **Review & Workflow Management**
- ⏰ **Automated Review Reminders**: Daily email notifications for pending reviews
- 📅 **Review Scheduling**: Next-day and week-later review workflows
- ✅ **Review Tracking**: Mark notes as reviewed with custom notes
- 📧 **Email Integration**: Beautiful HTML emails with Gmail SMTP support

### 💬 **Intelligent Chat Interface**
- 🗣️ **Conversational AI**: Query your entire knowledge base naturally
- 📚 **Context-Aware**: Maintains conversation history and context
- 🔍 **Smart Retrieval**: Finds relevant notes based on your questions
- 💾 **Persistent History**: Chat sessions saved in Supabase database
- 🎨 **Beautiful Rendering**: Rich HTML responses with proper formatting

### 📱 **Modern Web Interface**
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 🔍 **Advanced Search**: Keyword search across all notes
- 🏷️ **Smart Filtering**: Filter by date range, people, and source
- 📊 **Sorting Options**: Sort by date, submission date, or title
- 📱 **Responsive Design**: Works perfectly on desktop and mobile

### 🏗️ **Robust Infrastructure**
- ☁️ **Vercel Deployment**: Serverless architecture with automatic scaling
- 🗄️ **Supabase Backend**: Authentication and chat history storage
- 🔐 **Secure Authentication**: Supabase Auth with session management
- ⏰ **Cron Jobs**: Automated daily email reminders and sync processes
- 🛡️ **Error Handling**: Comprehensive error handling and logging

## 🚀 Getting Started

### 📋 Prerequisites

- 🟢 Node.js 18+
- 📝 Notion account with API access
- 🤖 OpenAI API key
- 📁 Google Drive API access (optional)
- ☁️ Supabase account
- 📧 Gmail account for email notifications

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

Create a `.env.local` file in the root directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your-openai-api-key

# Notion Configuration
NOTION_TOKEN=ntn_your-notion-integration-token
NOTION_DB_ID=your-notion-database-id

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key

# Email Configuration (Gmail SMTP)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Security Keys
SYNC_API_KEY=your-sync-api-key
CRON_SECRET=your-cron-secret

# Application URL
NEXT_PUBLIC_APP_URL=https://your-app-domain.vercel.app

# Google Drive (Optional)
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

#### ☁️ Supabase Setup
1. 🌐 Go to [Supabase](https://supabase.com/)
2. 📁 Create a new project
3. 🔑 Copy the project URL and anon key
4. 🗄️ Run the SQL schema from `scripts/supabase-chat-schema.sql`
5. 🔐 Set up authentication providers

#### 📧 Gmail App Password
1. 🔐 Enable 2-factor authentication on your Gmail account
2. 🔑 Generate an app password for this application
3. 📝 Use the app password (not your regular password)

## 🏗️ Application Architecture

```
📁 Sources (Otter.ai, MyScript, Manual) 
    ↓
🔄 Processing Pipeline (GPT-5)
    ↓
📊 Notion Database (Structured Storage)
    ↓
💬 Chat Interface (GPT-5-Chat-Latest)
    ↓
📱 Web Interface (Next.js + Supabase)
```

### 🔄 **Data Flow**

1. **📥 Ingestion**: Notes from various sources (Otter.ai, MyScript, manual uploads)
2. **🤖 Processing**: GPT-5 extracts summaries, action items, and insights
3. **📊 Storage**: Structured data stored in Notion with metadata
4. **⏰ Review**: Automated email reminders and review workflows
5. **💬 Query**: Chat interface for intelligent knowledge base queries
6. **📱 Interface**: Modern web app with search, filtering, and management

## 🎨 User Interface

### 🏠 **Homepage**
- 🎯 Quick access to all major features
- 📊 Dashboard with navigation cards
- 🌙 Dark mode toggle

### 📝 **Review Page**
- ⏰ Pending reviews for next-day and week-later workflows
- ✅ Mark notes as reviewed with custom notes
- 📊 Statistics and progress tracking
- 🎨 Beautiful card-based interface

### 📚 **Notes Page**
- 🔍 Advanced search and filtering
- 📅 Date range filtering
- 👥 People-based filtering
- 📊 Multiple sorting options
- 📱 Responsive grid layout

### 💬 **Chat Interface**
- 🗣️ Natural language queries
- 📚 Context-aware responses
- 💾 Persistent conversation history
- 🎨 Rich HTML response rendering
- 🔍 Smart note retrieval

### 📤 **Upload Page**
- 📁 Multi-file upload support
- 🔄 Transcript and written note merging
- 👁️ Preview before submission
- ✏️ Editable preview fields
- 🚀 One-click Notion submission

## 🔌 API Endpoints

### 🏥 **Health & Testing**
- `GET /api/health` - Health check
- `GET /api/test-env` - Environment validation

### 📝 **Note Management**
- `GET /api/notes` - List all notes
- `POST /api/upload/preview` - Process uploaded files
- `POST /api/upload/submit` - Submit to Notion

### 🔄 **Review Workflow**
- `GET /api/review/pending` - Get pending reviews
- `POST /api/review/submit` - Submit review
- `POST /api/review/complete` - Mark as complete
- `POST /api/review/email` - Send review reminders

### 💬 **Chat System**
- `GET /api/chat/conversations` - List conversations
- `POST /api/chat/conversations` - Create conversation
- `GET /api/chat/messages` - Get messages
- `POST /api/chat/messages` - Send message

### 🔄 **Sync & Automation**
- `POST /api/sync-drive` - Sync Google Drive
- `POST /api/cron` - Cron job trigger

### 🔐 **Authentication**
- `POST /api/auth/logout` - User logout

## ⏰ Automated Workflows

### 📧 **Daily Email Reminders**
- ⏰ Runs daily at 8:00 AM EST (13:00 UTC)
- 📧 Sends beautiful HTML emails with pending reviews
- 🔗 Includes direct links to review interface
- 📊 Shows review statistics and progress

### 🔄 **Google Drive Sync**
- ⏰ Runs every 5 minutes (configurable)
- 🔍 Monitors designated folders for new documents
- 🛡️ Prevents duplicate processing
- 🤖 Automatically processes new content

## 🛡️ Security & Data Protection

### 🔐 **Authentication**
- 🔑 Supabase Auth with secure session management
- 🛡️ Protected routes with middleware
- 👤 User-specific data isolation

### 🗄️ **Data Storage**
- 📊 Notion: Primary knowledge base storage
- ☁️ Supabase: User authentication and chat history
- 🔒 Encrypted data transmission
- 🛡️ Row-level security policies

### 🔑 **API Security**
- 🔐 API key authentication for external services
- 🛡️ CORS protection
- 🔒 Environment variable protection

## 🚀 Deployment

### ⚡ **Vercel Deployment**

1. 🔗 **Connect GitHub repository to Vercel**
2. ⚙️ **Set environment variables** in Vercel dashboard
3. 🚀 **Deploy** - Automatic build and deployment

### ⏰ **Cron Job Setup**

The app uses Vercel's built-in cron functionality:

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 13 * * *"
    }
  ]
}
```

This runs daily at 13:00 UTC (8:00 AM EST) for email reminders.

## 🎯 Use Cases

### 👔 **Business Meetings**
- 📝 Record meetings with Otter.ai
- 🤖 Extract action items and decisions
- ⏰ Get reminders to review key points
- 💬 Query past meetings for context

### 📚 **Learning & Research**
- ✍️ Take handwritten notes with MyScript
- 🔍 Search across all your notes
- 💡 Get AI insights on your content
- 📊 Track learning progress

### 🏢 **Project Management**
- ✅ Track action items with owners and due dates
- 📅 Review workflows for important decisions
- 🔍 Find relevant information quickly
- 💬 Brainstorm with AI assistance

## 🔮 Future Enhancements

### 🧠 **Advanced AI Features**
- 🔍 Vector database integration for semantic search
- 🎯 Better context retrieval and relevance scoring
- 🏷️ Automatic tagging and categorization
- 🔗 Cross-reference analysis between documents

### 📊 **Analytics & Insights**
- 📈 Usage analytics and patterns
- 🎯 Content effectiveness metrics
- 📊 Review completion tracking
- 💡 AI-powered content recommendations

### 🔌 **Integrations**
- 📅 Calendar integration for meeting context
- 💼 CRM integration for contact management
- 📧 Email integration for note extraction
- 🎥 Video transcription services

## 🤝 Contributing

1. 🍴 Fork the repository
2. 🌿 Create a feature branch
3. ✏️ Make your changes
4. 🧪 Test thoroughly
5. 📤 Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues or questions:
- 🐛 Open an issue on GitHub
- 📧 Contact the maintainer
- 📚 Check the documentation

---

> **🎯 Mission**: Create a comprehensive, intelligent knowledge management system that acts as a force multiplier for decision-making, learning, and information recall. Never forget anything again! 🧠✨
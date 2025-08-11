# TicketTrack Pro

A comprehensive ticket tracking and management application built with React and Supabase.

## Features

### 🎫 Ticket Management
- Create, read, update, and delete tickets
- Track ticket status (Resolved, Awaiting Response)
- Add notes to tickets
- Real-time updates
- Duplicate ticket handling

### 📊 Dashboard & Analytics
- Today's statistics (resolved tickets, pending tickets)
- Success rate calculation
- Total ticket count
- Animated statistics cards

### 📝 Notes System
- Create and manage notes with priority levels (Low, Medium, High, Critical)
- Link notes to specific tickets
- Search and filter notes
- Rich text content support

### 🔍 Search & Filtering
- Search tickets by ID or notes
- Filter tickets by status
- Advanced filtering options
- Real-time search results

### 📤 Export Functionality
- Export tickets to PDF with professional formatting
- Export tickets to CSV for spreadsheet applications
- Proper data escaping and formatting
- Custom file naming with timestamps

### 🔐 Authentication
- User registration and login
- Secure session management
- Profile management
- Row-level security

### 🎨 Modern UI/UX
- Glassmorphism design
- Smooth animations with Framer Motion
- Responsive design for all devices
- Dark/light theme support
- Toast notifications

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Export**: jsPDF, jsPDF-AutoTable
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Notifications**: React Hot Toast

## Setup Instructions

### 1. Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### 2. Supabase Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL commands from `database-schema.sql` to create the required tables and policies
4. Get your project URL and anon key from Settings > API

### 3. Environment Configuration
1. Copy `.env.example` to `.env`
2. Update the environment variables:
```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Installation
```bash
# Install dependencies
npm install

# Start the development server
npm start
```

The application will be available at `http://localhost:3000`

## 🚀 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Vigh24/Ticket-tracker)

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Set up environment variables:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
4. Deploy!

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## Database Schema

The application uses the following tables:

### `profiles`
- User profile information
- Automatically created on user registration

### `tickets`
- Ticket ID (unique per user)
- Status (Resolved, Awaiting Response)
- Notes
- Created/Updated timestamps
- User association

### `notes`
- Title and content
- Priority levels
- Optional ticket linking
- User association

## Usage

### Getting Started
1. Register a new account or sign in
2. Create your first ticket using the "Add Ticket" button
3. Manage ticket status and add notes as needed
4. Use the Notes panel for additional task management
5. Export reports when needed

### Ticket Management
- **Add Ticket**: Click "Add Ticket" and fill in the ticket ID and status
- **Edit Ticket**: Click the edit icon in the ticket table
- **Delete Ticket**: Click the delete icon (with confirmation)
- **Status Toggle**: Use the toggle button in edit mode

### Notes Management
- **Access Notes**: Click "Notes" in the header or sidebar
- **Create Note**: Click "Add Note" in the notes panel
- **Link to Ticket**: Optionally link notes to specific tickets
- **Priority Levels**: Set priority from Low to Critical

### Export Options
- **PDF Report**: Professional formatted report with statistics
- **CSV Export**: Spreadsheet-compatible format
- **Filtered Export**: Export only filtered/searched results

## Development

### Project Structure
```
src/
├── components/
│   ├── Auth/           # Authentication components
│   ├── Dashboard/      # Dashboard and stats
│   ├── Export/         # Export functionality
│   ├── Notes/          # Notes management
│   ├── Tickets/        # Ticket CRUD operations
│   └── UI/             # Reusable UI components
├── lib/                # Supabase configuration
├── utils/              # Utility functions
└── App.js              # Main application component
```

### Available Scripts
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.

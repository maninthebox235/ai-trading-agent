# Nocture AI Trading Agent - Frontend

A modern web dashboard for monitoring the Nocture AI Trading Agent running on Hyperliquid.

## Features

- **Dashboard**: Real-time overview of trading activity with statistics and charts
- **Trading Diary**: Detailed view of all trading decisions, entries, and exits
- **Logs Viewer**: Monitor system logs and LLM request/response logs
- **Auto-refresh**: Automatic updates to keep data current
- **Download**: Export diary and logs for offline analysis

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- The backend trading agent must be running on port 3000

### Installation

```bash
cd frontend
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

The dev server is configured to proxy API requests to `http://localhost:3000` (the backend).

### Production Build

Build for production:

```bash
npm run build
```

Serve the production build:

```bash
npm run preview
```

## Configuration

Create a `.env` file in the frontend directory to configure the API URL:

```env
VITE_API_URL=http://localhost:3000
```

For production deployments, set this to your backend API URL.

## API Endpoints

The frontend connects to these backend endpoints:

- `GET /diary?limit=200` - Fetch trading diary entries
- `GET /logs?path=llm_requests.log&limit=2000` - Fetch log files
- `GET /diary?download=1` - Download complete diary

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx      # Overview dashboard with stats and charts
│   │   ├── DiaryView.tsx      # Trading diary table view
│   │   └── LogsView.tsx       # Log file viewer
│   ├── api.ts                 # API client functions
│   ├── types.ts               # TypeScript type definitions
│   ├── App.tsx                # Main application component
│   └── index.css              # Global styles
├── public/                    # Static assets
├── .env                       # Environment variables
└── vite.config.ts            # Vite configuration
```

## Development Tips

- The dashboard auto-refreshes every 15 seconds
- The diary view refreshes every 10 seconds
- Logs refresh every 5 seconds
- Use the refresh button to manually update data
- Toggle auto-scroll in logs view to stop automatic scrolling

## License

Part of the Nocture AI Trading Agent project.

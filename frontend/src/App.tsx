import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { DiaryView } from './components/DiaryView';
import { LogsView } from './components/LogsView';
import { LayoutDashboard, BookOpen, FileText, Bot } from 'lucide-react';

type Tab = 'dashboard' | 'diary' | 'logs';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <nav className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Nocture AI Trading Agent</h1>
                <p className="text-xs text-gray-400">Hyperliquid Trading Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TabButton
                active={activeTab === 'dashboard'}
                onClick={() => setActiveTab('dashboard')}
                icon={<LayoutDashboard className="w-4 h-4" />}
                label="Dashboard"
              />
              <TabButton
                active={activeTab === 'diary'}
                onClick={() => setActiveTab('diary')}
                icon={<BookOpen className="w-4 h-4" />}
                label="Diary"
              />
              <TabButton
                active={activeTab === 'logs'}
                onClick={() => setActiveTab('logs')}
                icon={<FileText className="w-4 h-4" />}
                label="Logs"
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'diary' && <DiaryView />}
        {activeTab === 'logs' && <LogsView />}
      </main>

      <footer className="border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            Nocture AI Trading Agent - Powered by LLMs on Hyperliquid
          </p>
        </div>
      </footer>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default App;

import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { RefreshCw, Download } from 'lucide-react';

export function LogsView() {
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logPath, setLogPath] = useState('llm_requests.log');
  const [limit, setLimit] = useState(2000);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getLogs(logPath, limit);
      setLogs(data);
      if (autoScroll) {
        setTimeout(() => logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [logPath, limit]);

  const handleDownload = () => {
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = logPath;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Logs</h2>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded bg-gray-700 border-gray-600"
            />
            Auto-scroll
          </label>
          <select
            value={logPath}
            onChange={(e) => setLogPath(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="llm_requests.log">LLM Requests</option>
            <option value="prompts.log">Prompts</option>
            <option value="diary.jsonl">Diary</option>
          </select>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            placeholder="Limit"
            className="w-24 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
          {error}
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 overflow-auto max-h-[600px]">
          <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap break-words">
            {logs || 'No logs available'}
          </pre>
          <div ref={logsEndRef} />
        </div>
      )}
    </div>
  );
}

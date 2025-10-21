import { useState, useEffect } from 'react';
import type { DiaryEntry } from '../types';
import { api } from '../api';
import { TrendingUp, TrendingDown, Minus, Download, RefreshCw } from 'lucide-react';

export function DiaryView() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(200);

  const fetchDiary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDiary(limit);
      setEntries(data.entries.reverse()); // Show newest first
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load diary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiary();
    const interval = setInterval(fetchDiary, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [limit]);

  const handleDownload = async () => {
    try {
      const blob = await api.downloadDiary();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diary.jsonl';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download diary:', err);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'buy':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'sell':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'buy':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'sell':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'close':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Trading Diary</h2>
          <button
            onClick={fetchDiary}
            disabled={loading}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value={50}>Last 50</option>
            <option value={100}>Last 100</option>
            <option value={200}>Last 200</option>
            <option value={500}>Last 500</option>
          </select>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr className="text-left text-gray-400 text-sm">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Entry Price</th>
                <th className="px-4 py-3">TP/SL</th>
                <th className="px-4 py-3">Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No diary entries yet
                  </td>
                </tr>
              ) : (
                entries.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">
                      {entry.asset}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getActionIcon(entry.action)}
                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getActionColor(entry.action)}`}>
                          {entry.action.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {entry.amount ? entry.amount.toFixed(4) : '-'}
                      {entry.allocation_usd && (
                        <span className="text-gray-500 ml-1">
                          (${entry.allocation_usd.toFixed(2)})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {entry.entry_price ? `$${entry.entry_price.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {entry.tp_price && (
                        <div className="text-green-400">TP: ${entry.tp_price.toFixed(2)}</div>
                      )}
                      {entry.sl_price && (
                        <div className="text-red-400">SL: ${entry.sl_price.toFixed(2)}</div>
                      )}
                      {!entry.tp_price && !entry.sl_price && '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 max-w-md truncate">
                      {entry.rationale || entry.exit_plan || entry.reason || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

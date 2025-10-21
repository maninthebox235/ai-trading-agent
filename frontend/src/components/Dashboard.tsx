import { useState, useEffect } from 'react';
import type { DiaryEntry } from '../types';
import { api } from '../api';
import { Activity, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getDiary(500);
        setEntries(data.entries);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const stats = {
    totalTrades: entries.filter(e => e.action === 'buy' || e.action === 'sell').length,
    buyTrades: entries.filter(e => e.action === 'buy').length,
    sellTrades: entries.filter(e => e.action === 'sell').length,
    holdDecisions: entries.filter(e => e.action === 'hold').length,
    totalVolume: entries
      .filter(e => e.allocation_usd)
      .reduce((sum, e) => sum + (e.allocation_usd || 0), 0),
  };

  const recentEntries = entries.slice(-20).reverse();

  // Prepare chart data - group by hour
  const chartData = entries
    .filter(e => e.action === 'buy' || e.action === 'sell')
    .reduce((acc, entry) => {
      const date = new Date(entry.timestamp);
      const hour = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).toISOString();

      if (!acc[hour]) {
        acc[hour] = { time: hour, trades: 0, volume: 0 };
      }

      acc[hour].trades += 1;
      acc[hour].volume += entry.allocation_usd || 0;

      return acc;
    }, {} as Record<string, { time: string; trades: number; volume: number }>);

  const chartArray = Object.values(chartData).sort((a, b) =>
    new Date(a.time).getTime() - new Date(b.time).getTime()
  ).slice(-24); // Last 24 hours

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Trades"
            value={stats.totalTrades}
            icon={<Activity className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Buy Trades"
            value={stats.buyTrades}
            icon={<TrendingUp className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Sell Trades"
            value={stats.sellTrades}
            icon={<TrendingDown className="w-6 h-6" />}
            color="red"
          />
          <StatCard
            title="Total Volume"
            value={`$${stats.totalVolume.toFixed(2)}`}
            icon={<DollarSign className="w-6 h-6" />}
            color="purple"
          />
        </div>
      </div>

      {chartArray.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-white">Trading Activity (Last 24 Hours)</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartArray}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="time"
                stroke="#9CA3AF"
                tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#9CA3AF' }}
                itemStyle={{ color: '#60A5FA' }}
                labelFormatter={(value) => new Date(value).toLocaleString()}
              />
              <Line type="monotone" dataKey="trades" stroke="#60A5FA" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentEntries.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            recentEntries.slice(0, 10).map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    entry.action === 'buy' ? 'bg-green-500/10' :
                    entry.action === 'sell' ? 'bg-red-500/10' :
                    'bg-gray-500/10'
                  }`}>
                    {entry.action === 'buy' ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : entry.action === 'sell' ? (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    ) : (
                      <Activity className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {entry.asset} - {entry.action.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {entry.entry_price && (
                    <div className="text-white font-medium">
                      ${entry.entry_price.toFixed(2)}
                    </div>
                  )}
                  {entry.amount && (
                    <div className="text-sm text-gray-400">
                      {entry.amount.toFixed(4)} {entry.asset}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    red: 'bg-red-500/10 text-red-500',
    purple: 'bg-purple-500/10 text-purple-500',
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-white text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

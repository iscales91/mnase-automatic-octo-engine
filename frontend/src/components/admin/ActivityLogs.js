import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    action: '',
    resource_type: '',
    status: '',
    user_id: '',
    limit: 100
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch recent logs
      const logsRes = await fetch(`${API_BASE_URL}/api/admin/activity-logs/recent?limit=100`, { headers });
      const logsData = await logsRes.json();
      setLogs(logsData);

      // Fetch stats
      const statsRes = await fetch(`${API_BASE_URL}/api/admin/activity-logs/stats`, { headers });
      const statsData = await statsRes.json();
      setStats(statsData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/activity-logs/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filter)
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Error filtering logs:', error);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failure':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return <div className="p-4">Loading activity logs...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Activity Logs</h2>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-sm font-semibold text-gray-600">Total Logs</h3>
          <p className="text-2xl font-bold">{stats.total_logs || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-sm font-semibold text-gray-600">Success</h3>
          <p className="text-2xl font-bold">{stats.success_count || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <h3 className="text-sm font-semibold text-gray-600">Failures</h3>
          <p className="text-2xl font-bold">{stats.failure_count || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
          <h3 className="text-sm font-semibold text-gray-600">Errors</h3>
          <p className="text-2xl font-bold">{stats.error_count || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-3">Filter Logs</h3>
        <div className="grid grid-cols-5 gap-3">
          <Input
            placeholder="Action (e.g., login)"
            value={filter.action}
            onChange={(e) => setFilter({ ...filter, action: e.target.value })}
          />
          <Input
            placeholder="Resource Type"
            value={filter.resource_type}
            onChange={(e) => setFilter({ ...filter, resource_type: e.target.value })}
          />
          <select
            className="border rounded px-3 py-2"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="error">Error</option>
          </select>
          <Input
            placeholder="User ID"
            value={filter.user_id}
            onChange={(e) => setFilter({ ...filter, user_id: e.target.value })}
          />
          <Button onClick={handleFilter}>Apply Filter</Button>
        </div>
        <div className="mt-2">
          <Button
            onClick={() => {
              setFilter({ action: '', resource_type: '', status: '', user_id: '', limit: 100 });
              fetchData();
            }}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Common Actions */}
      {stats.common_actions && stats.common_actions.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-3">Most Common Actions</h3>
          <div className="flex flex-wrap gap-2">
            {stats.common_actions.map((action, index) => (
              <div key={index} className="bg-blue-50 px-3 py-1 rounded-full text-sm">
                <span className="font-semibold">{action._id}</span>: {action.count}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Resource</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">IP Address</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div>
                      <div className="font-medium">{log.user_email || 'System'}</div>
                      {log.user_id && (
                        <div className="text-xs text-gray-500">{log.user_id.slice(0, 8)}...</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="font-medium">{log.action}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div>
                      <div className="font-medium">{log.resource_type}</div>
                      {log.resource_id && (
                        <div className="text-xs text-gray-500">{log.resource_id.slice(0, 8)}...</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {log.ip_address || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {log.error_message ? (
                      <span className="text-red-600">{log.error_message}</span>
                    ) : log.details && Object.keys(log.details).length > 0 ? (
                      <details className="cursor-pointer">
                        <summary className="text-blue-600">View</summary>
                        <pre className="text-xs mt-1 bg-gray-50 p-2 rounded">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {logs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No activity logs found
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;

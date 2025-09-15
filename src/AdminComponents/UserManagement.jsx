import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';

const StatusBadge = ({ status }) => {
  const baseClasses = 'inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium capitalize';
  const statusStyles = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    deactivated: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };
  const statusDotStyles = { active: 'bg-green-500', deactivated: 'bg-slate-500' };
  return (
    <span className={`${baseClasses} ${statusStyles[status] || ''}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${statusDotStyles[status] || ''}`}></span>
      {status}
    </span>
  );
};

const Highlight = ({ text, highlight }) => {
  if (!text) return null;
  if (!highlight.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-600/40 text-black dark:text-white rounded px-0.5">{part}</mark>
        ) : ( part )
      )}
    </span>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);

  const { getUsers, updateUserStatus } = useAuth();

  const fetchUsers = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const data = await getUsers();
      const formattedData = data.map(user => ({
        ...user,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        state: user.status,
        registered_at: user.created_at,
      }));
      setUsers(formattedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(user =>
      user.firstName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      (user.phone && user.phone.toLowerCase().includes(term)) ||
      (user.location && user.location.toLowerCase().includes(term)) ||
      user.state.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const handleUpdateStatus = async (id, newStatus) => {
    const action = newStatus === 'active' ? 'activate' : 'deactivate';
    const isConfirmed = window.confirm(`Are you sure you want to ${action} this user?`);
    if (!isConfirmed) return;

    try {
      await updateUserStatus(id, newStatus);
      setUsers(currentUsers => currentUsers.map(user => user.id === id ? { ...user, state: newStatus } : user));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleShowMore = () => {
    setVisibleCount(prevCount => prevCount + 5);
  };
  
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

  const baseButtonClasses = "py-1 px-3 rounded-md text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900";
  const activateButtonClasses = "border-green-600/50 text-green-700 hover:bg-green-50 dark:border-green-500/50 dark:text-green-400 dark:hover:bg-green-500/10 focus-visible:ring-green-400";
  const deactivateButtonClasses = "border-red-600/50 text-red-700 hover:bg-red-50 dark:border-red-500/50 dark:text-red-400 dark:hover:bg-red-500/10 focus-visible:ring-red-400";
  const inputClasses = "flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-900";

  if (loading) return <div className="p-4 text-center text-slate-500 dark:text-slate-400">Loading users... ⏳</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">User Management</h1>
        <div className="w-full sm:w-72">
          <input type="text" placeholder="Search by name, email, phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={inputClasses} />
        </div>
      </div>
      
      {filteredUsers.length === 0 ? (
        <div className="text-center p-8 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900/70">
           <p className="text-slate-500 dark:text-slate-400">{searchTerm ? `No users found for "${searchTerm}"` : 'There are no registered users.'}</p>
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-500 dark:text-slate-400">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 font-medium text-left">User</th>
                  <th className="p-4 font-medium text-left">Contact Information</th>
                  <th className="p-4 font-medium text-left">Location</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-left">Registration Date</th>
                  <th className="p-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.slice(0, visibleCount).map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-left font-medium text-slate-900 dark:text-slate-50 whitespace-nowrap">
                      <Highlight text={`${user.firstName} ${user.lastName}`} highlight={searchTerm} />
                    </td>
                    <td className="p-4 text-left">
                      <div><Highlight text={user.email} highlight={searchTerm} /></div>
                      <div className="text-slate-500 dark:text-slate-400"><Highlight text={user.phone} highlight={searchTerm} /></div>
                    </td>
                    <td className="p-4 text-left text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      <Highlight text={user.location} highlight={searchTerm} />
                    </td>
                    <td className="p-4 text-center"><StatusBadge status={user.state} /></td>
                    <td className="p-4 text-left text-slate-600 dark:text-slate-300 whitespace-nowrap">{formatDate(user.registered_at)}</td>
                    <td className="p-4 text-center">
                      {user.state === 'active' 
                        ? <button onClick={() => handleUpdateStatus(user.id, 'deactivated')} className={`${baseButtonClasses} ${deactivateButtonClasses}`}>Deactivate</button>
                        : <button onClick={() => handleUpdateStatus(user.id, 'active')} className={`${baseButtonClasses} ${activateButtonClasses}`}>Activate</button>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {visibleCount < filteredUsers.length && (
             <div className="p-4 text-center border-t border-slate-100 dark:border-slate-800">
              <button onClick={handleShowMore} className="py-2 px-4 text-sm font-medium rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Show More ({Math.min(5, filteredUsers.length - visibleCount)} more)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
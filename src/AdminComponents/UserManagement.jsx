import React, { useState, useEffect, useMemo } from 'react';

// === Розширений набір статичних даних (США) ===
const mockUsers = [
  { id: 1, firstName: 'John', lastName: 'Smith', phone: '(555) 123-4567', email: 'john.smith@example.com', location: 'New York, NY', state: 'active', registered_at: '2025-09-11T10:00:00Z' },
  { id: 2, firstName: 'Emily', lastName: 'Jones', phone: '(555) 987-6543', email: 'emily.j@example.com', location: 'Los Angeles, CA', state: 'active', registered_at: '2025-09-10T15:30:00Z' },
  { id: 3, firstName: 'Michael', lastName: 'Williams', phone: '(555) 234-5678', email: 'michael.w@example.com', location: 'Chicago, IL', state: 'deactivated', registered_at: '2025-09-09T12:00:00Z' },
  { id: 4, firstName: 'Jessica', lastName: 'Brown', phone: '(555) 876-5432', email: 'jessica.b@example.com', location: 'Houston, TX', state: 'active', registered_at: '2025-09-11T09:00:00Z' },
  { id: 5, firstName: 'David', lastName: 'Davis', phone: '(555) 345-6789', email: 'david.d@example.com', location: 'Phoenix, AZ', state: 'active', registered_at: '2025-09-11T11:00:00Z' },
  { id: 6, firstName: 'Sarah', lastName: 'Miller', phone: '(555) 765-4321', email: 'sarah.m@example.com', location: 'Philadelphia, PA', state: 'deactivated', registered_at: '2025-09-08T14:20:00Z' },
  { id: 7, firstName: 'James', lastName: 'Wilson', phone: '(555) 456-7890', email: 'james.w@example.com', location: 'San Antonio, TX', state: 'active', registered_at: '2025-09-11T12:30:00Z' },
  { id: 8, firstName: 'Jennifer', lastName: 'Moore', phone: '(555) 654-3210', email: 'jennifer.m@example.com', location: 'San Diego, CA', state: 'active', registered_at: '2025-09-10T18:45:00Z' },
  { id: 9, firstName: 'Robert', lastName: 'Taylor', phone: '(555) 567-8901', email: 'robert.t@example.com', location: 'Dallas, TX', state: 'active', registered_at: '2025-09-11T13:00:00Z' },
  { id: 10, firstName: 'Linda', lastName: 'Anderson', phone: '(555) 432-1098', email: 'linda.a@example.com', location: 'San Jose, CA', state: 'deactivated', registered_at: '2025-09-07T09:10:00Z' },
  { id: 11, firstName: 'William', lastName: 'Thomas', phone: '(555) 321-0987', email: 'william.t@example.com', location: 'Austin, TX', state: 'active', registered_at: '2025-09-11T14:00:00Z' },
  { id: 12, firstName: 'Elizabeth', lastName: 'Jackson', phone: '(555) 210-9876', email: 'elizabeth.j@example.com', location: 'Jacksonville, FL', state: 'active', registered_at: '2025-09-10T20:00:00Z' },
  { id: 13, firstName: 'Richard', lastName: 'White', phone: '(555) 109-8765', email: 'richard.w@example.com', location: 'Fort Worth, TX', state: 'active', registered_at: '2025-09-11T15:15:00Z' },
  { id: 14, firstName: 'Susan', lastName: 'Harris', phone: '(555) 098-7654', email: 'susan.h@example.com', location: 'Columbus, OH', state: 'deactivated', registered_at: '2025-09-06T16:50:00Z' },
];

// === Допоміжні компоненти ===
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
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    setTimeout(() => {
      const sortedData = [...mockUsers].sort((a, b) => new Date(b.registered_at) - new Date(a.registered_at));
      setUsers(sortedData);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(user =>
      user.firstName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.phone.toLowerCase().includes(term) ||
      user.location.toLowerCase().includes(term) ||
      user.state.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const handleUpdateStatus = (id, newStatus) => {
    setUsers(currentUsers => currentUsers.map(user => user.id === id ? { ...user, state: newStatus } : user));
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          User Management
        </h1>
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={inputClasses}
          />
        </div>
      </div>
      
      {filteredUsers.length === 0 ? (
        <div className="text-center p-8 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900/70">
           <p className="text-slate-500 dark:text-slate-400">
             {searchTerm ? `No users found for "${searchTerm}"` : 'There are no registered users.'}
           </p>
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
                    <td className="p-4 text-center">
                      <StatusBadge status={user.state} />
                    </td>
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
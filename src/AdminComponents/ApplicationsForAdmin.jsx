import React, { useState, useEffect } from 'react';

// Static data for demonstration, instead of a database query
const mockApplications = [
  {
    id: 1,
    email: 'test.user1@example.com',
    text: 'I would like to join your team. I have experience in React and Node.js.',
    status: 'in progress',
    created_at: '2023-10-27T10:00:00Z',
  },
  {
    id: 2,
    email: 'developer2@example.com',
    text: 'I am interested in the frontend developer position. My portfolio can be viewed at the link.',
    status: 'approved',
    created_at: '2023-10-26T15:30:00Z',
  },
  {
    id: 3,
    email: 'another.dev@example.com',
    text: 'Application for an internship. I am a 3rd-year student.',
    status: 'denied',
    created_at: '2023-10-25T12:00:00Z',
  },
    {
    id: 4,
    email: 'new.applicant@example.com',
    text: 'Please consider my candidacy for the UI/UX designer position.',
    status: 'in progress',
    created_at: '2023-10-28T09:00:00Z',
  },
];

const ApplicationsForAdmin = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulate data fetching on component mount
  useEffect(() => {
    console.log('Simulating data fetch...');
    setLoading(true);
    // Simulate a network delay
    setTimeout(() => {
      // Sort data as a backend would
      const sortedData = [...mockApplications].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setApplications(sortedData);
      setLoading(false);
      console.log('Data "fetched" successfully.');
    }, 1000); // 1-second delay
  }, []);

  // Update application status locally in the component's state
  const handleUpdateStatus = (id, newStatus) => {
    console.log(`Updating status for ID ${id} to "${newStatus}"`);
    setApplications(currentApps =>
      currentApps.map(app =>
        app.id === id ? { ...app, status: newStatus } : app
      )
    );
  };

  // Function for styling statuses remains unchanged
  const getStatusClasses = (status) => {
    const baseClasses = 'py-1 px-3 rounded-full text-xs font-semibold inline-block';
    switch (status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'denied':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      case 'in progress':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      default:
        return `${baseClasses} bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading applications... ⏳</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 text-center">Error: {error} ❌</div>;
  }
  
  if (applications.length === 0 && !loading) {
    return (
       <div>
         <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
           Applications
         </h1>
         <div className="text-center p-8 bg-white dark:bg-gray-800 shadow-md rounded-lg">
           <p className="text-gray-500 dark:text-gray-400">There are no new applications.</p>
         </div>
       </div>
    );
  }

  // The component's UI remains unchanged
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Applications
      </h1>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Application Text</th>
              <th className="py-3 px-6 text-center">Status</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-800 dark:text-gray-200 text-sm font-light">
            {applications.map((app) => (
              <tr key={app.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  {app.email}
                </td>
                <td className="py-3 px-6 text-left">
                  {app.text}
                </td>
                <td className="py-3 px-6 text-center">
                  <span className={getStatusClasses(app.status)}>
                    {app.status}
                  </span>
                </td>
                <td className="py-3 px-6 text-center">
                  {app.status === 'in progress' && (
                    <div className="flex item-center justify-center">
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'approved')}
                        className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300 mr-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'denied')}
                        className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-300"
                      >
                        Deny
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationsForAdmin;

import React from 'react';
import { useUser } from '../../context/UserContext';
import Card from './Card';
import Loading from './Loading';

const UserSelector = () => {
  const { currentUser, users, loading, selectUser } = useUser();

  if (loading) return <Loading size="small" />;

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-800">Current User</h2>
          {currentUser && (
            <p className="text-sm text-gray-600">Logged in as {currentUser.name}</p>
          )}
        </div>
        <div>
          <select
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            value={currentUser?.id || ''}
            onChange={(e) => selectUser(e.target.value)}
          >
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
};

export default UserSelector;
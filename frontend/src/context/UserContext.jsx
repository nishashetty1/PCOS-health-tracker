import React, { createContext, useState, useEffect, useContext } from 'react';
import useApi from '../hooks/useApi';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const api = useApi();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/users');
        setUsers(data);
        
        // Set first user as current by default or from localStorage
        const savedUserId = localStorage.getItem('currentUserId');
        if (savedUserId && data.some(user => user.id === parseInt(savedUserId))) {
          const user = data.find(user => user.id === parseInt(savedUserId));
          setCurrentUser(user);
        } else if (data.length > 0) {
          setCurrentUser(data[0]);
          localStorage.setItem('currentUserId', data[0].id);
        }
      } catch (err) {
        setError('Failed to load users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const selectUser = (userId) => {
    const user = users.find(u => u.id === parseInt(userId));
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUserId', userId);
    }
  };

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      users, 
      loading, 
      error, 
      selectUser 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
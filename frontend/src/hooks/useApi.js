import { useState, useCallback } from 'react';

// const API_BASE_URL = 'http://localhost:3000/api';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (endpoint, options = {}) => {
    const url = `/api${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return { data, status: response.status };
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((endpoint) => {
    return request(endpoint);
  }, [request]);

  const post = useCallback((endpoint, body) => {
    return request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }, [request]);

  const put = useCallback((endpoint, body) => {
    return request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }, [request]);

  const del = useCallback((endpoint) => {
    return request(endpoint, {
      method: 'DELETE',
    });
  }, [request]);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
  };
};

export default useApi;
import { getSession } from 'next-auth/react';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const fetcher = async (endpoint: string, options?: RequestInit) => {
  let token = null;
  if (typeof window !== 'undefined') {
    const session = await getSession();
    token = session?.user?.apiToken || null;
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
};

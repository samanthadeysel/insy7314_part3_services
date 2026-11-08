const API_URL = import.meta.env.VITE_API_URL || '';

export const getToken = () => { 
  return sessionStorage.getItem('token'); 
}; 

export const saveAuth = (token, user) => { 
  sessionStorage.setItem('token', token); 
  sessionStorage.setItem('user', JSON.stringify(user)); 
}; 

export const clearAuth = () => { 
  sessionStorage.removeItem('token'); 
  sessionStorage.removeItem('user'); 
}; 

export const getSavedUser = () => { 
  const user = sessionStorage.getItem('user'); 
  return user ? JSON.parse(user) : null; 
}; 

export const apiRequest = async (path, options = {}) => { 
  const token = getToken(); 
  const headers = { 
    'Content-Type': 'application/json', 
    ...options.headers 
  }; 
  if (token) { 
    headers.Authorization = `Bearer ${token}`; 
  } 
  const response = await fetch(`${API_URL}${path}`, { 
    ...options, 
    headers 
  }); 
  const data = await response.json().catch(() => ({})); 
  if (!response.ok) { 
    throw new Error(data.error || 'Request failed'); 
  } 
  return data; 
}; 
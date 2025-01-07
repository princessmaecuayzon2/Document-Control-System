const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  throw new Error('API_BASE_URL is not defined');
}

export const loginUser = async (credentials) => {
  try {
    console.log('Login URL:', `${API_BASE_URL}/api/auth/login`);
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) throw new Error(data.message || 'Login failed');
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error.message);
  }
};

export const registerStaff = async (userData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error registering staff');
  return data;
};

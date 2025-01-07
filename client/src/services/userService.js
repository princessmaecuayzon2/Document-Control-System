const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  throw new Error('API_BASE_URL is not defined');
}

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Full error response:', { 
      status: response.status, 
      statusText: response.statusText, 
      errorText 
    });
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }
  return response.json();
};

export const userService = {
  getAllUsers: async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No authorization token found');
    }

    try {
   
      const response = await fetch(`${API_BASE_URL}/api/list-users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Full response for getAllUsers:', response);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  updateUserPermissions: async (userId, permissions) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authorization token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/permissions`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(permissions)
    });

    return handleResponse(response);
  },

};
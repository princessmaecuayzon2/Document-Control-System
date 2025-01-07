export const documentService = {
    async updateDocument(documentId, formData, token) {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${documentId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error('Update failed');
      return response.json();
    },
  
    async updateReminder(documentId, reminderData, token) {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reminders/by-document/${documentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reminderData),
      });
      if (!response.ok) throw new Error('Failed to update reminder');
      return response.json();
    },
  
    async deleteDocument(documentId, token) {
 
      const docResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!docResponse.ok) throw new Error('Delete failed');

      const reminderResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/reminders/by-document/${documentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!reminderResponse.ok) {
        console.error('Failed to delete reminder');
      }
  
      return docResponse.json();
    }
  
  };
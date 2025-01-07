import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  CalendarDays, Bell, AlertTriangle, 
  ChevronLeft, ChevronRight, CheckCircle 
} from 'lucide-react';
import { toast } from 'react-toastify';

const REMINDER_STYLES = {
  dueToday: {
    icon: <Bell className="w-6 h-6 text-amber-500" />,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    label: 'Due Today'
  },
  upcoming: {
    icon: <CalendarDays className="w-6 h-6 text-blue-500" />,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    label: 'Upcoming'
  }
};

const DocumentReminderTimeline = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [reminders, setReminders] = useState([]);
  const ITEMS_PER_PAGE = 5;

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reminders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch reminders');
      
      const data = await response.json();
      setReminders(processReminders(data));
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast.error('Failed to load reminders');
    }
  };

  const processReminders = useCallback((documents) => {
    if (!Array.isArray(documents)) {
      console.error('Invalid documents data:', documents);
      return [];
    }

    const manila = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    const normalizedManila = new Date(manila.setHours(0, 0, 0, 0));

    return documents
      .filter(doc => doc && doc.documentTitle && doc.submissionDate && !doc.isDeleted && !doc.isCompleted)
      .map(doc => {
        try {
          const submissionDate = new Date(doc.submissionDate);
          const normalizedSubmission = new Date(submissionDate.setHours(0, 0, 0, 0));
          const diffTime = normalizedSubmission.getTime() - normalizedManila.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 0) {
            return {
              id: doc._id,
              message: `Due Today: ${doc.documentTitle}`,
              type: 'dueToday',
              date: doc.submissionDate,
              priority: 1,
              fileId: doc._id
            };
          } else if (diffDays > 0 && diffDays <= 10) {
            return {
              id: doc._id,
              message: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}: ${doc.documentTitle}`,
              type: 'upcoming',
              date: doc.submissionDate,
              priority: 2,
              fileId: doc._id
            };
          }
          return null;
        } catch (error) {
          console.error('Error processing reminder:', error);
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.priority - b.priority || new Date(a.date) - new Date(b.date));
  }, []);

  const markReminderComplete = async (reminderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reminders/${reminderId}/complete`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to mark reminder as complete');
      
      fetchReminders();
      toast.success('Reminder marked as complete');
    } catch (error) {
      console.error('Error marking reminder complete:', error);
      toast.error('Failed to update reminder');
    }
  };

  useEffect(() => {
    fetchReminders();

    const handleDocumentUpdate = () => fetchReminders();
    
    window.addEventListener('documentDeleted', handleDocumentUpdate);
    window.addEventListener('documentUpdated', handleDocumentUpdate);

    return () => {
      window.removeEventListener('documentDeleted', handleDocumentUpdate);
      window.removeEventListener('documentUpdated', handleDocumentUpdate);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [reminders.length]);

  const paginatedReminders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return reminders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [reminders, currentPage]);

  const totalPages = Math.ceil(reminders.length / ITEMS_PER_PAGE);

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-8 h-8 text-white" />
          <h2 className="text-md  text-white ">
            Document Reminder Timeline
          </h2>
        </div>
      </div>

      <div className="p-6">
        {paginatedReminders.length > 0 ? (
          <ul className="space-y-4">
            {paginatedReminders.map((reminder, index) => {
              const style = REMINDER_STYLES[reminder.type];
              return (
                <li key={reminder.id || `reminder-${index}`}
                    className={`${style.bgColor} ${style.borderColor} ${style.textColor} 
                      border-2 rounded-xl p-4 shadow-sm flex items-center justify-between`}>
                  <div className="flex items-center space-x-4">
                    <div>{style.icon}</div>
                    <div>
                      <p className="font-semibold text-sm">{reminder.message}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(reminder.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
    <span className="text-xs font-semibold bg-white/70 text-gray-700 px-2 py-1 rounded-md">
      {style.label}
    </span>

  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <CalendarDays className="mx-auto w-16 h-16 mb-4 text-cyan-500 opacity-50" />
            <p className="text-lg text-gray-600 font-medium">No reminders at this time</p>
            <p className="text-sm text-gray-500 mt-2">Your document timeline is clear</p>
          </div>
        )}

        {reminders.length > ITEMS_PER_PAGE && (
          <div className="flex justify-center items-center mt-6 space-x-4">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50">
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <span className="text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50">
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentReminderTimeline;
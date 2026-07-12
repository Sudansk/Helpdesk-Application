export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
};

export const getStatusBadgeClass = (status) => {
  const statusMap = {
    open: 'badge-open',
    in_progress: 'badge-in-progress',
    resolved: 'badge-resolved',
    closed: 'badge-closed'
  };
  return statusMap[status] || '';
};

export const getPriorityBadgeClass = (priority) => {
  const priorityMap = {
    low: 'badge-low',
    medium: 'badge-medium',
    high: 'badge-high',
    urgent: 'badge-urgent'
  };
  return priorityMap[priority] || '';
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};


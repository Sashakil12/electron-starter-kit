/**
 * Utility functions for displaying toast notifications
 */

export function showNotification(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Set up print status listener
export function setupPrintStatusListener() {
  window.electron.receive('print-status', (status) => {
    if (status.success) {
      showNotification(status.message, 'success');
    } else {
      showNotification(status.message, 'error');
    }
  });
}

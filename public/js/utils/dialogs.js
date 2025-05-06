window.confirmDialog = function(message, callback) {
    const confirmed = window.confirm(message);
    if (confirmed && typeof callback === 'function') {
        callback();
    }
};

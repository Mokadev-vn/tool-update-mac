const updateOnlineStatus = () => {
    if (!navigator.onLine) {
        window.electronAPI.setTitle("Offline");
    } else {
        // window.electronAPI.setWeb("Online");
    }
};

window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);

updateOnlineStatus();


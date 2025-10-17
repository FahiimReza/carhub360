function NotificationPanel() {
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
      loadNotifications(currentUser.email);
    }
  }, []);

  const loadNotifications = async (userEmail) => {
    try {
      const result = await trickleListObjects('notification', 50, true);
      const userNotifications = result.items.filter(n => n.objectData.userId === userEmail);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.objectData.isRead).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
    setLoading(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await trickleUpdateObject('notification', notificationId, { isRead: true });
      setNotifications(prev => prev.map(n =>
        n.objectId === notificationId ? {...n, objectData: {...n.objectData, isRead: true}} : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.objectData.isRead);
      await Promise.all(
        unreadNotifications.map(n => trickleUpdateObject('notification', n.objectId, { isRead: true }))
      );
      setNotifications(prev => prev.map(n => ({...n, objectData: {...n.objectData, isRead: true}})));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'confirmed': return 'check-circle';
      case 'cancelled': return 'x-circle';
      default: return 'bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'confirmed': return 'text-green-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  try {
    if (loading) {
      return (
        <div className="glass-card p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/10 rounded"></div>
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="glass-card p-6" data-name="notification-panel" data-file="components/NotificationPanel.js">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center">
            <div className="icon-bell text-[var(--primary-color)] mr-3"></div>
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 bg-[var(--accent-color)] text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[var(--primary-color)] hover:underline text-sm"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="icon-bell text-6xl text-[var(--text-secondary)] mb-4"></div>
            <p className="text-[var(--text-secondary)]">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.objectId}
                className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                  notification.objectData.isRead
                    ? 'bg-white/5 border-white/10'
                    : 'bg-[var(--primary-color)]/10 border-[var(--primary-color)]/20'
                }`}
                onClick={() => !notification.objectData.isRead && markAsRead(notification.objectId)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`icon-${getNotificationIcon(notification.objectData.type)} text-lg ${getNotificationColor(notification.objectData.type)}`}></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-[var(--text-primary)] mb-1">
                      {notification.objectData.title}
                    </h4>
                    <p className="text-[var(--text-secondary)] text-sm mb-2">
                      {notification.objectData.message}
                    </p>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                  {!notification.objectData.isRead && (
                    <div className="w-2 h-2 bg-[var(--accent-color)] rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('NotificationPanel component error:', error);
    return null;
  }
}
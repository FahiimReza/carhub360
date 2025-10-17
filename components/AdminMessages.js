function AdminMessages({ token, onRefresh }) {
  const [conversations, setConversations] = React.useState([]);
  const [selectedConversation, setSelectedConversation] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [replyContent, setReplyContent] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/messages/admin/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conversation) => {
    try {
      setSelectedConversation(conversation);
      const response = await fetch(`/api/messages/${conversation.id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMessages(data.messages.map(msg => ({
        id: msg.id,
        sender_id: msg.sender_id,
        content: msg.content,
        created_at: msg.created_at,
        sender_name: msg.sender_name,
        last_name: msg.last_name || '',
        is_admin: msg.sender_id === 1  // Admin ID
      })));
    } catch (error) {
      console.error('Error loading conversation details:', error);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !selectedConversation) return;

    try {
      const payload = { content: replyContent };

      const response = await fetch(`/api/messages/${selectedConversation.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setReplyContent('');

      // Reload the selected conversation
      await selectConversation(selectedConversation);
      
      // Refresh the conversations list
      await loadConversations();
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send response');
    }
  };

  const closeConversation = async (conversationId) => {
    try {
      const response = await fetch(`/api/messages/${conversationId}/close`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh conversations
      await loadConversations();
    } catch (error) {
      console.error('Error closing conversation:', error);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[70vh]">
      {/* Conversations List */}
      <div className="w-1/3 glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[var(--text-primary)]">Customer Conversations</h3>
          <button
            onClick={loadConversations}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <div className="icon-refresh-cw text-lg"></div>
          </button>
        </div>
        
        <div className="space-y-3 overflow-y-auto max-h-96">
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => selectConversation(conv)}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedConversation?.id === conv.id
                  ? 'bg-[var(--primary-color)]/20 border border-[var(--primary-color)]'
                  : 'glass-card hover:border-[var(--primary-color)]/50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-[var(--text-primary)] text-sm truncate">
                  {conv.subject}
                </h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  conv.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {conv.status || 'Open'}
                </span>
              </div>
              <p className="text-[var(--text-secondary)] text-sm truncate">
                {conv.customer_name} • {conv.email}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {new Date(conv.created_at).toLocaleDateString()}
              </p>
              {conv.message_count > 0 && (
                <p className="text-xs text-[var(--primary-color)] mt-1">
                  {conv.message_count} messages
                </p>
              )}
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              <div className="icon-message-circle text-4xl mb-2 mx-auto"></div>
              <p>No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Conversation Details */}
      <div className="flex-1 glass-card p-6">
        {selectedConversation ? (
          <div className="flex flex-col h-full">
            <div className="border-b border-white/10 pb-4 mb-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  {selectedConversation.subject}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  {selectedConversation.customer_name} • {selectedConversation.email}
                </p>
                <p className="text-[var(--text-secondary)] text-sm">
                  Started: {new Date(selectedConversation.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => closeConversation(selectedConversation.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                disabled={selectedConversation.status === 'closed'}
              >
                {selectedConversation.status === 'closed' ? 'Closed' : 'Close Conversation'}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-lg ${
                    msg.is_admin
                      ? 'bg-[var(--primary-color)]/20 ml-8'
                      : 'bg-white/5 mr-8'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-[var(--text-primary)]">
                      {msg.sender_name}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[var(--text-primary)]">{msg.content}</p>
                </div>
              ))}
            </div>
            
            <div className="border-t border-white/10 pt-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Type your response..."
                  className="flex-1 input-field"
                  onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                />
                <button
                  onClick={handleReply}
                  className="btn-primary"
                  disabled={!replyContent.trim()}
                >
                  <div className="icon-send text-lg"></div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="icon-message-circle text-6xl text-[var(--text-secondary)] mb-4"></div>
              <p className="text-[var(--text-secondary)]">Select a conversation to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
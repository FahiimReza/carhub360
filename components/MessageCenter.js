function MessageCenter({ user }) {
  const [conversations, setConversations] = React.useState([]);
  const [selectedConversation, setSelectedConversation] = React.useState(null);
  const [conversationMessages, setConversationMessages] = React.useState([]);
  const [newMessageModal, setNewMessageModal] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [replyContent, setReplyContent] = React.useState('');

  React.useEffect(() => {
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/messages/conversations/${user.id}`);
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
      const response = await fetch(`/api/messages/${conversation.id}?userId=${user.id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setConversationMessages(data.messages.map(msg => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        content: msg.content,
        created_at: msg.created_at,
        sender_name: msg.sender_name,
        last_name: msg.last_name || '',
        is_read: msg.is_read
      })));
    } catch (error) {
      console.error('Error loading conversation messages:', error);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !selectedConversation) return;

    const token = localStorage.getItem('token') || '';

    try {
      const response = await fetch(`/api/messages/${selectedConversation.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: replyContent }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error details:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setReplyContent('');
      
      // Reload conversations and messages
      await loadConversations();
      await selectConversation(selectedConversation);
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
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
    <div className="container mx-auto px-6 py-24">
      <div className="flex gap-6 h-[80vh]">
        {/* Conversation List */}
        <div className="w-1/3 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Messages</h2>
            <button
              onClick={() => setNewMessageModal(true)}
              className="btn-primary text-sm"
            >
              <div className="icon-plus text-lg mr-2"></div>
              New Message
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
                  <h3 className="font-semibold text-[var(--text-primary)] text-sm truncate">
                    {conv.subject || 'New Conversation'}
                  </h3>
                  {conv.unread_count > 0 && (
                    <span className="bg-[var(--secondary-color)] text-white text-xs px-2 py-1 rounded-full">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                <p className="text-[var(--text-secondary)] text-sm truncate">
                  {conv.last_message_preview || 'No messages yet'}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {conv.last_sender_name} • {new Date(conv.last_message_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Conversation View */}
        <div className="flex-1 glass-card p-6">
          {selectedConversation ? (
            <div className="flex flex-col h-full">
              <div className="border-b border-white/10 pb-4 mb-4">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  {selectedConversation.subject}
                </h3>
                <p className="text-[var(--text-secondary)]">
                  {selectedConversation.message_count} responses
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto mb-4 bg-[rgba(20,20,20,0.5)] rounded-lg p-4">
                <div className="space-y-4">
                  {conversationMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${msg.sender_id === user.id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                          msg.sender_id === user.id
                            ? 'bg-[rgba(0,150,200,0.7)] text-white'
                            : 'bg-[rgba(100,100,100,0.5)] text-white'
                        }`}>
                          {msg.sender_name ? msg.sender_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        
                        {/* Message Bubble */}
                        <div className={`px-4 py-2 rounded-2xl ${
                          msg.sender_id === user.id
                            ? 'bg-[rgba(0,150,200,0.3)] text-white rounded-br-none border border-[rgba(0,150,200,0.2)]'
                            : 'bg-[rgba(60,60,60,0.7)] text-white rounded-bl-none border border-[rgba(80,80,80,0.3)]'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender_id === user.id
                              ? 'text-white/60'
                              : 'text-white/50'
                          }`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Type your message..."
                      className="w-full px-4 py-3 pr-12 rounded-full border border-white/20 bg-[rgba(30,30,30,0.7)] text-white placeholder-white/50 focus:border-[rgba(0,150,200,0.5)] focus:outline-none transition-colors"
                      onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                    />
                    <button
                      onClick={handleReply}
                      className={`absolute right-1 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        replyContent.trim()
                          ? 'bg-[rgba(0,150,200,0.7)] text-white hover:bg-[rgba(0,150,200,0.9)]'
                          : 'bg-white/10 text-white/50 cursor-not-allowed'
                      }`}
                      disabled={!replyContent.trim()}
                    >
                      <div className="icon-send text-sm"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="icon-message-circle text-6xl text-[var(--text-secondary)] mb-4"></div>
                <p className="text-[var(--text-secondary)]">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* New Message Modal */}
      {newMessageModal && (
        <NewMessageModal
          user={user}
          onClose={() => setNewMessageModal(false)}
          onSent={() => {
            setNewMessageModal(false);
            loadConversations();
          }}
        />
      )}
    </div>
  );
}
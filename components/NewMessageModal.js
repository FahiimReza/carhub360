function NewMessageModal({ user, onClose, onSent }) {
  const [subject, setSubject] = React.useState('');
  const [content, setContent] = React.useState('');
  const [categoryId, setCategoryId] = React.useState(1);  // Default to General Inquiry (id=1)
  const [priority, setPriority] = React.useState('medium');
  const [sending, setSending] = React.useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setSending(true);
      
      // Create new conversation using user details
      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          message: content,
          userId: user.id
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const conversationResponse = await response.json();
      
      setSubject('');
      setContent('');
      onSent();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[var(--text-primary)]">New Message</h3>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <div className="icon-x text-xl"></div>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[var(--text-secondary)] text-sm mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input-field"
              placeholder="Enter subject..."
            />
          </div>

          <div>
            <label className="block text-[var(--text-secondary)] text-sm mb-2">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(parseInt(e.target.value))}
              className="input-field"
            >
              <option value={1}>General Inquiry</option>
              <option value={2}>Car Rental</option>
              <option value={3}>Car Purchase</option>
              <option value={4}>Service Support</option>
              <option value={5}>Technical Issue</option>
              <option value={6}>Complaint</option>
              <option value={7}>Partnership</option>
            </select>
          </div>

          <div>
            <label className="block text-[var(--text-secondary)] text-sm mb-2">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="input-field"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-[var(--text-secondary)] text-sm mb-2">Message</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="input-field resize-none"
              placeholder="Type your message here..."
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-white/20 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !subject.trim() || !content.trim()}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send Inquiry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
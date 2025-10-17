// Message Service for handling inquiries and responses

// Create new inquiry
window.createInquiry = async (categoryId, name, email, phone, subject, message, priority = 'medium', userId) => {
  try {
    const response = await fetch('/api/messages/inquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categoryId, name, email, phone, subject, message, priority, userId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating inquiry:', error);
    throw error;
  }
};

// Send response to inquiry
window.sendResponse = async (inquiryId, responderId, content, responseType = 'email') => {
  try {
    const response = await fetch('/api/messages/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inquiryId, responderId, content, responseType }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending response:', error);
    throw error;
  }
};

// Get user's inquiries
window.getUserInquiries = async (userId) => {
  try {
    const response = await fetch(`/api/messages/inquiries/${userId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // Map to old structure for compatibility
    return data.map(inq => ({
      id: inq.id,
      subject: inq.subject,
      created_at: inq.created_at,
      message_count: inq.response_count,
      last_message_at: inq.last_response_at,
      last_message_preview: inq.last_response_preview,
      last_sender_id: inq.last_responder_id,
      last_sender_name: inq.last_responder_name,
      unread_count: inq.unread_responses,
      reference: inq.reference,
      status: inq.status,
      priority: inq.priority,
      category_name: inq.category_name
    }));
  } catch (error) {
    console.error('Error getting inquiries:', error);
    throw error;
  }
};

// Get inquiry responses
window.getInquiryResponses = async (inquiryId) => {
  try {
    const response = await fetch(`/api/messages/inquiries/${inquiryId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // Map responses to old message structure for compatibility
    return data.responses.map(resp => ({
      id: resp.id,
      conversation_id: data.inquiry.id,
      sender_id: resp.responder_id,
      content: resp.content,
      created_at: resp.created_at,
      sender_name: resp.responder_name,
      last_name: resp.last_name || '',
      is_read: resp.is_read
    }));
  } catch (error) {
    console.error('Error getting inquiry responses:', error);
    throw error;
  }
};

// Delete inquiry
window.deleteInquiry = async (inquiryId) => {
  try {
    const response = await fetch(`/api/messages/inquiries/${inquiryId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    throw error;
  }
};
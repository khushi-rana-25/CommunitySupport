// OmniDimension AI Assistant Integration

function initializeAIAssistant() {
  if (typeof window.OmniDimension !== 'undefined') {
    console.log('OmniDimension AI Assistant loaded successfully');
    
    // The agent is already configured on the server side
    // We just need to handle the callbacks
    window.OmniDimension.configure({
      onCallStart: function() {
        console.log('CommunityCare Assistant call started');
        showMessage('CommunityCare Assistant is ready to help!', 'info');
      },
      onCallEnd: function(data) {
        console.log('CommunityCare Assistant call ended', data);
        handleAICallEnd(data);
      },
      onError: function(error) {
        console.error('CommunityCare Assistant error:', error);
        showMessage('CommunityCare Assistant encountered an error. Please try again.', 'error');
      }
    });
  } else {
    // Retry after a short delay
    setTimeout(initializeAIAssistant, 1000);
  }
}

// Handle AI call end and process the data
function handleAICallEnd(data) {
  if (data && data.summary) {
    // Extract relevant information from the call
    const extractedData = data.extracted_variables || {};
    
    // Generate a unique ticket ID
    const ticketId = 'TKT' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    
    // Create enhanced complaint/ticket object
    const ticket = {
      ticket_id: ticketId,
      resident_name: extractedData.resident_name || extractedData.name || 'Unknown',
      address: extractedData.address || extractedData.unit_number || 'Unknown',
      issue_type: extractedData.issue_type || 'General',
      location: extractedData.location || 'Unknown',
      description: extractedData.description || extractedData.issue_description || data.summary,
      priority: extractedData.priority || determinePriority(extractedData.issue_type || 'General'),
      urgency_level: extractedData.urgency_level || 'Normal',
      safety_concern: extractedData.safety_concern || false,
      preferred_contact_method: extractedData.preferred_contact_method || 'Email',
      timestamp: new Date().toISOString(),
      status: 'Pending',
      assigned_technician: null, // Will be assigned by admin
      source: 'CommunityCare Assistant',
      call_summary: data.summary,
      full_conversation: data.fullConversation || null,
      sentiment: data.sentiment || 'neutral'
    };
    
    // Save to Firebase
    saveTicketToFirebase(ticket);
    
    // Show success message with ticket ID
    showMessage(`Ticket #${ticketId} has been created successfully! Priority: ${ticket.priority}`, 'success');
  }
}

// Determine priority based on issue type
function determinePriority(issueType) {
  const issueTypeLower = issueType.toLowerCase();
  
  // P1 - Emergency
  if (issueTypeLower.includes('fire') || issueTypeLower.includes('gas') || 
      issueTypeLower.includes('power outage') || issueTypeLower.includes('safety')) {
    return 'P1';
  }
  
  // P2 - Urgent
  if (issueTypeLower.includes('water leakage') || issueTypeLower.includes('broken lock') || 
      issueTypeLower.includes('no internet') || issueTypeLower.includes('security')) {
    return 'P2';
  }
  
  // P3 - Normal maintenance
  if (issueTypeLower.includes('plumbing') || issueTypeLower.includes('electricity') || 
      issueTypeLower.includes('ac') || issueTypeLower.includes('fan') || 
      issueTypeLower.includes('cleaning')) {
    return 'P3';
  }
  
  // P4 - Minor issues
  return 'P4';
}

// Save ticket to Firebase
async function saveTicketToFirebase(ticket) {
  try {
    const user = auth.currentUser;
    if (user) {
      await db.collection('tickets').add({
        ...ticket,
        user_id: user.uid,
        user_email: user.email
      });
      console.log('Ticket saved to Firebase:', ticket);
    }
  } catch (error) {
    console.error('Error saving ticket to Firebase:', error);
    showMessage('Failed to save ticket. Please try again.', 'error');
  }
}

// Webhook handler for OmniDimension callbacks
function handleWebhookCallback(data) {
  console.log('Webhook callback received:', data);
  
  // Process the webhook data
  if (data.summary && data.extracted_variables) {
    handleAICallEnd(data);
  }
}

// Expose webhook handler globally for OmniDimension
window.handleOmniDimensionWebhook = handleWebhookCallback;

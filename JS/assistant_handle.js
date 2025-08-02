// OmniDimension AI Assistant Integration

// This function will load dummy data into Firebase once.
async function loadDummyDataOnce() {
  // Check if dummy data has already been loaded
  if (localStorage.getItem('dummyDataLoaded')) {
    console.log('Dummy data has already been loaded.');
    return;
  }

  try {
    // Adjust the path to your dummy JSON file as needed
    const response = await fetch('../Dummy/complaint.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    if (data && data.tickets) {
      console.log('Loading dummy data into Firebase for the first time...');
      
      const ticketPromises = data.tickets.map(dummyTicket => {
        const ticketId = 'TKT' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
        const ticket = {
          ticket_id: ticketId,
          issue_type: dummyTicket.type,
          issue_description: dummyTicket.description,
          priority: determinePriority(dummyTicket.type),
          created_date: new Date().toISOString(),
          status: 'Unassigned',
          user_id: null, // Will be set in saveTicketToFirebase
        };
        return saveTicketToFirebase(ticket);
      });

      await Promise.all(ticketPromises);

      // Set a flag in localStorage to indicate that dummy data has been loaded
      localStorage.setItem('dummyDataLoaded', 'true');
      console.log('Dummy data successfully loaded into Firebase.');
      showMessage('Dummy ticket data has been loaded for the first time.', 'success');
    }
  } catch (error) {
    console.error('Error fetching or processing dummy complaint data:', error);
    showMessage('Could not load dummy ticket data.', 'error');
  }
}

function initializeAIAssistant() {
  console.log('Initializing...');

  // Using dummy data once instead of the AI assistant for now
  loadDummyDataOnce();
  
  // The rest of the AI initialization is commented out for now
  /* 
  // Check if the script is already loaded
  if (typeof window.OmniDimension !== 'undefined') {
    console.log('OmniDimension already loaded.');
    onOmniDimensionLoaded();
    return;
  }

  // Find the script tag and attach load/error handlers
  const widgetScript = document.getElementById('omnidimension-web-widget');
  if (widgetScript) {
    console.log('OmniDimension script tag found, waiting for it to load...');
    widgetScript.onload = onOmniDimensionLoaded;
    widgetScript.onerror = () => {
      console.error('OmniDimension widget script failed to load.');
      showMessage('Could not load the AI Assistant. Please check your connection and refresh the page.', 'error');
    };
  } else {
    console.error('OmniDimension widget script tag not found in the DOM.');
    showMessage('AI Assistant script not found. Please contact support.', 'error');
  }
  */
}

// Handle AI call end and process the data
function handleAICallEnd(data) {
  if (data && data.summary && data.extracted_variables) {
    const extractedData = data.extracted_variables;

    // Check if it's a complaint or feedback
    if (extractedData.interaction_type === 'complaint') {
      // Generate a unique ticket ID
      const ticketId = 'TKT' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
      
      const ticket = {
        ticket_id: ticketId,
        issue_type: extractedData.issue_type || 'General',
        issue_description: extractedData.issue_description || data.summary,
        priority: determinePriority(extractedData.issue_type || 'General'),
        created_date: new Date().toISOString(),
        status: 'Unassigned', // Default status
        user_id: null, // Will be set in saveTicketToFirebase
      };
      
      saveTicketToFirebase(ticket);
      
      // Show success message with ticket ID
      showMessage(`Ticket #${ticketId} has been created successfully! Priority: ${ticket.priority}`, 'success');

    } else if (extractedData.interaction_type === 'feedback') {
      const feedback = {
        feedback_text: extractedData.feedback_text || data.summary,
        sentiment: extractedData.sentiment || 'neutral',
        created_date: new Date().toISOString(),
        user_id: null, 
      };

      saveFeedbackToFirebase(feedback);
      showMessage(`Thank you for your feedback! It has been recorded.`, 'success');
    }
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
    } else {
      // Handle case where user is not logged in, if necessary
      await db.collection('tickets').add(ticket);
      console.log('Ticket saved for anonymous user:', ticket);
    }
  } catch (error) {
    console.error('Error saving ticket to Firebase:', error);
    showMessage('Failed to save ticket. Please try again.', 'error');
  }
}

// Save feedback to Firebase
async function saveFeedbackToFirebase(feedback) {
  try {
    const user = auth.currentUser;
    if (user) {
      await db.collection('feedback').add({
        ...feedback,
        user_id: user.uid
      });
      console.log('Feedback saved to Firebase:', feedback);
    } else {
      // Handle case where user is not logged in, if necessary
      await db.collection('feedback').add(feedback);
      console.log('Feedback saved for anonymous user:', feedback);
    }
  } catch (error) {
    console.error('Error saving feedback to Firebase:', error);
    showMessage('Failed to save feedback. Please try again.', 'error');
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

// Initialize the AI Assistant when the script loads
initializeAIAssistant();

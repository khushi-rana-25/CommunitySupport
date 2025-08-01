// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-ndD8GLOmNWZdpaHqXLGxdTCHLSO0raE",
  authDomain: "supportassistant-74986.firebaseapp.com",
  projectId: "supportassistant-74986",
  storageBucket: "supportassistant-74986.firebasestorage.app",
  messagingSenderId: "927348252383",
  appId: "1:927348252383:web:3f48dfea85a6adfcc5d36a",
  measurementId: "G-56CMK009MB"
};

// Firebase SDK URLs
const firebaseSDKUrls = [
  'https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/8.10.0/firebase-analytics.js',
  'https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js'
];

// Global Firebase variables
let app, analytics, auth, db;

// Message system
function showMessage(message, type = 'info', duration = 5000) {
  const container = document.getElementById('message-container');
  const messageBox = document.getElementById('message-box');
  const messageText = document.getElementById('message-text');
  const closeBtn = document.getElementById('message-close');

  if (!container || !messageBox || !messageText) {
    // Fallback to alert if message system not loaded
    alert(message);
    return;
  }

  // Set message content
  messageText.textContent = message;
  
  // Set message type
  messageBox.className = `message-box ${type}`;
  
  // Show message
  container.style.display = 'block';
  container.classList.remove('hide');
  
  // Auto hide after duration
  const autoHide = setTimeout(() => {
    hideMessage();
  }, duration);
  
  // Close button functionality
  closeBtn.onclick = () => {
    clearTimeout(autoHide);
    hideMessage();
  };
}

function hideMessage() {
  const container = document.getElementById('message-container');
  if (container) {
    container.classList.add('hide');
    setTimeout(() => {
      container.style.display = 'none';
      container.classList.remove('hide');
    }, 300);
  }
}

// Function to load Firebase scripts dynamically
function loadFirebaseScripts() {
  return new Promise((resolve, reject) => {
    let loadedScripts = 0;
    const totalScripts = firebaseSDKUrls.length;

    firebaseSDKUrls.forEach(url => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        loadedScripts++;
        if (loadedScripts === totalScripts) {
          // All scripts loaded, initialize Firebase
          initializeFirebase();
          resolve();
        }
      };
      script.onerror = () => {
        reject(new Error(`Failed to load Firebase script: ${url}`));
      };
      document.head.appendChild(script);
    });
  });
}

// Initialize Firebase after scripts are loaded
function initializeFirebase() {
  app = firebase.initializeApp(firebaseConfig);
  analytics = firebase.analytics();
  auth = firebase.auth();
  db = firebase.firestore();
}

// Function to load complaint cards
function loadComplaintCards() {
  const complaintsList = document.querySelector(".complaints-list");
  if (!complaintsList) {
    return;
  }

  const cardUrl = "../Templates/complaint-card.html";

  // Data for the cards
  const complaints = [
    {
      ticketId: "#TKT-001",
      status: "pending",
      issue: "Water Leakage",
      location: "Apartment 5B, Tower A",
      date: "Jun 28, 2024",
    },
    {
      ticketId: "#TKT-002",
      status: "in-progress",
      issue: "Elevator Malfunction",
      location: "Tower B",
      date: "Jun 27, 2024",
    },
    {
      ticketId: "#TKT-003",
      status: "resolved",
      issue: "Noise Complaint",
      location: "Community Hall",
      date: "Jun 25, 2024",
    },
  ];

  fetch(cardUrl)
    .then((response) => response.text())
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const cardTemplate = doc.querySelector(".complaint-card");

      if (cardTemplate) {
        complaintsList.innerHTML = ""; // Clear existing content
        complaints.forEach((complaint) => {
          const newCard = cardTemplate.cloneNode(true);
          newCard.querySelector(".ticket-id").textContent = complaint.ticketId;
          const statusEl = newCard.querySelector(".status");
          statusEl.className = `status ${complaint.status}`;
          statusEl.textContent = complaint.status.replace("-", " ");
          newCard.querySelector(
            ".card-body"
          ).innerHTML = `<p><strong>Issue:</strong> ${complaint.issue}</p><p><strong>Location:</strong> ${complaint.location}</p>`;
          newCard.querySelector(".date").textContent = complaint.date;
          complaintsList.appendChild(newCard);
        });
      }
    });
}

// Load external HTML content (like navbar)
document.addEventListener("DOMContentLoaded", () => {
  // Load Firebase scripts if not already loaded
  if (typeof firebase === 'undefined') {
    loadFirebaseScripts();
  } else {
    initializeFirebase();
  }

  // Load message component
  loadComponent('message-container', 'message.html');

  // Load navbar if navbar container exists
  const navbarContainer = document.getElementById('navbar-container');
  if (navbarContainer) {
    loadComponent('navbar-container', 'navbar.html').then(() => {
      // Add other navbar related initializations here
    });
  }

  // Load complaint cards on track page
  if (window.location.pathname.endsWith("track.html")) {
    loadComplaintCards();
  }

  // Initialize AI Assistant if on home page
  if (window.location.pathname.includes('home.html')) {
    initializeAIAssistant();
  }

  // Check authentication state
  checkAuthState().then((user) => {
    if (user) {
      console.log('User is signed in:', user.email);
      // Redirect to home if on login/signup page
      if (window.location.pathname.includes('index.html') || 
          window.location.pathname.includes('signup.html')) {
        window.location.href = 'home.html';
      }
    } else {
      console.log('User is signed out');
      // Redirect to login if on home page
      if (window.location.pathname.includes('home.html')) {
        window.location.href = 'index.html';
      }
    }
  });
});

// Authentication functions
function handleSignup(username, email, password, role) {
  return auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      return db.collection('users').doc(user.uid).set({
        username: username,
        email: email,
        role: role
      });
    });
}

function handleLogin(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

function handleLogout() {
  return auth.signOut();
}

// Check if user is authenticated
function checkAuthState() {
  return new Promise((resolve) => {
    auth.onAuthStateChanged((user) => {
      resolve(user);
    });
  });
}

// Function to load HTML components
async function loadComponent(containerId, componentPath) {
  try {
    const response = await fetch(componentPath);
    const html = await response.text();
    document.getElementById(containerId).innerHTML = html;
    return true;
  } catch (error) {
    console.error(`Error loading component ${componentPath}:`, error);
    return false;
  }
}

// Main initialization function
async function initializeApp() {
  try {
    // Load Firebase scripts if not already loaded
    if (typeof firebase === 'undefined') {
      await loadFirebaseScripts();
    } else {
      initializeFirebase();
    }

    // Load message component
    await loadComponent('message-container', 'message.html');

    // Load navbar if navbar container exists
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
      await loadComponent('navbar-container', 'navbar.html');
    }

    // Set up event listeners based on current page
    setupEventListeners();
    
    // Initialize AI Assistant if on home page
    if (window.location.pathname.includes('home.html')) {
      initializeAIAssistant();
    }
    
    // Check authentication state
    const user = await checkAuthState();
    if (user) {
      console.log('User is signed in:', user.email);
      // Redirect to home if on login/signup page
      if (window.location.pathname.includes('index.html') || 
          window.location.pathname.includes('signup.html')) {
        window.location.href = 'home.html';
      }
    } else {
      console.log('User is signed out');
      // Redirect to login if on home page
      if (window.location.pathname.includes('home.html')) {
        window.location.href = 'index.html';
      }
    }
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

// Set up event listeners for different pages
function setupEventListeners() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
  const logoutBtn = document.getElementById('logoutBtn');
  
  // Navbar buttons
  const complaintBtn = document.getElementById('complaintBtn');
  const trackBtn = document.getElementById('trackBtn');
  const feedbackBtn = document.getElementById('feedbackBtn');

    if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
      const email = loginForm.loginEmail?.value || loginForm.querySelector('[name="loginEmail"]')?.value;
      const password = loginForm.loginPassword?.value || loginForm.querySelector('[name="loginPassword"]')?.value;
      
      if (!email || !password) {
        showMessage('Please enter both email and password', 'warning');
        return;
      }

      try {
        await handleLogin(email, password);
        showMessage('Login successful!', 'success');
        setTimeout(() => {
          window.location.href = 'home.html';
        }, 1000);
      } catch (error) {
        console.error('Login error:', error);
        showMessage(`Login failed: ${error.message}`, 'error');
      }
        });
    }

    if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = signupForm.signupUsername.value;
            const email = signupForm.signupEmail.value;
            const password = signupForm.signupPassword.value;
            const role = signupForm.signupRole.value;

      try {
        await handleSignup(username, email, password, role);
        showMessage('Sign up successful! Please log in.', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);
      } catch (error) {
        console.error('Signup error:', error);
        showMessage(`Sign up failed: ${error.message}`, 'error');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await handleLogout();
        showMessage('Logged out successfully', 'info');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      } catch (error) {
        console.error('Sign out error:', error);
        showMessage('Logout failed. Please try again.', 'error');
      }
    });
  }

  // Navbar functionality
  if (complaintBtn) {
    complaintBtn.addEventListener('click', () => {
      window.location.href = 'home.html';
    });
  }

  if (trackBtn) {
    trackBtn.addEventListener('click', () => {
      window.location.href = 'track.html';
    });
  }

  if (feedbackBtn) {
    feedbackBtn.addEventListener('click', () => {
      window.location.href = 'feedback.html';
    });
  }

  // Track page functionality
  const searchBtn = document.getElementById('searchBtn');
  const searchComplaint = document.getElementById('searchComplaint');
  
  if (searchBtn && searchComplaint) {
    searchBtn.addEventListener('click', () => {
      const searchTerm = searchComplaint.value.trim();
      if (searchTerm) {
        // TODO: Implement search functionality
        showMessage(`Searching for: ${searchTerm}`, 'info');
      } else {
        showMessage('Please enter a search term', 'warning');
      }
    });
    
    searchComplaint.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchBtn.click();
      }
    });
  }

  // Feedback form functionality
  const feedbackForm = document.getElementById('feedbackForm');
  
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const feedbackType = feedbackForm.feedbackType.value;
      const feedbackTitle = feedbackForm.feedbackTitle.value;
      const feedbackDescription = feedbackForm.feedbackDescription.value;
      const rating = feedbackForm.rating.value;
      const feedbackSuggestions = feedbackForm.feedbackSuggestions.value;
      
      if (!rating) {
        showMessage('Please select a rating', 'warning');
        return;
      }
      
      try {
        // TODO: Save feedback to Firebase
        console.log('Feedback submitted:', {
          type: feedbackType,
          title: feedbackTitle,
          description: feedbackDescription,
          rating: rating,
          suggestions: feedbackSuggestions
        });
        
        showMessage('Feedback submitted successfully!', 'success');
        feedbackForm.reset();
      } catch (error) {
        console.error('Feedback submission error:', error);
        showMessage('Failed to submit feedback. Please try again.', 'error');
      }
    });
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// OmniDimension AI Assistant Integration
function initializeAIAssistant() {
  // Wait for the OmniDimension widget to load
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

// Save complaint to Firebase
async function saveComplaintToFirebase(complaint) {
  try {
    const user = auth.currentUser;
    if (user) {
      await db.collection('complaints').add({
        ...complaint,
        user_id: user.uid,
        user_email: user.email
      });
      console.log('Complaint saved to Firebase:', complaint);
    }
  } catch (error) {
    console.error('Error saving complaint to Firebase:', error);
    showMessage('Failed to save complaint. Please try again.', 'error');
  }
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

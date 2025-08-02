//by updating your code in this // Firebase Configuration
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
    alert(message);
    return;
  }

  messageText.textContent = message;
  messageBox.className = `message-box ${type}`;
  container.style.display = 'block';
  container.classList.remove('hide');

  const autoHide = setTimeout(() => {
    hideMessage();
  }, duration);

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
          initializeFirebase();
          resolve();
        }
      };
      script.onerror = () => reject(new Error(`Failed to load Firebase script: ${url}`));
      document.head.appendChild(script);
    });
  });
}

function initializeFirebase() {
  app = firebase.initializeApp(firebaseConfig);
  analytics = firebase.analytics();
  auth = firebase.auth();
  db = firebase.firestore();
}

function loadComplaintCards() {
  const complaintsList = document.querySelector(".complaints-list");
  if (!complaintsList) return;

  const cardUrl = "../Templates/complaint-card.html";
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
        complaintsList.innerHTML = "";
        complaints.forEach((complaint) => {
          const newCard = cardTemplate.cloneNode(true);
          newCard.querySelector(".ticket-id").textContent = complaint.ticketId;
          const statusEl = newCard.querySelector(".status");
          statusEl.className = `status ${complaint.status}`;
          statusEl.textContent = complaint.status.replace("-", " ");
          newCard.querySelector(".card-body").innerHTML = `
            <p><strong>Issue:</strong> ${complaint.issue}</p>
            <p><strong>Location:</strong> ${complaint.location}</p>`;
          newCard.querySelector(".date").textContent = complaint.date;
          complaintsList.appendChild(newCard);
        });
      }
    });
}

function handleSignup(fullName, username, email, password, role, address, phoneNumber) {
  return auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      return db.collection('users').doc(user.uid).set({
        fullName, username, email, role, address, phoneNumber
      });
    });
}

function handleLogin(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

function handleLogout() {
  return auth.signOut();
}

function checkAuthState() {
  return new Promise((resolve) => {
    auth.onAuthStateChanged((user) => resolve(user));
  });
}

async function loadUserProfileData() {
  try {
    const user = await checkAuthState();
    if (user) {
      const userDoc = await db.collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        document.getElementById('fullName').textContent = userData.fullName || 'Not provided';
        document.getElementById('username').textContent = userData.username || 'Not provided';
        document.getElementById('userEmail').textContent = userData.email || 'Not provided';
        document.getElementById('userPhone').textContent = userData.phoneNumber || 'Not provided';
        document.getElementById('userAddress').textContent = userData.address || 'Not provided';
      } else {
        showMessage('Could not find user profile data.', 'error');
      }
    }
  } catch (error) {
    console.error('Error loading user profile data:', error);
    showMessage('Failed to load profile data.', 'error');
  }
}

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

async function initializeApp() {
  try {
    if (typeof firebase === 'undefined') {
      await loadFirebaseScripts();
    } else {
      initializeFirebase();
    }

    await loadComponent('message-container', 'message.html');

    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
      await loadComponent('navbar-container', 'navbar.html');
    }

    setupEventListeners();

    if (window.location.pathname.includes('profile.html')) {
      await loadUserProfileData();
    }

    if (window.location.pathname.includes('home.html')) {
      initializeAIAssistant?.(); // Optional chaining in case it's not defined
    }

    if (window.location.pathname.endsWith("track.html")) {
      loadComplaintCards();
    }

    const user = await checkAuthState();
    if (user) {
      console.log('User is signed in:', user.email);
      if (window.location.pathname.includes('index.html') || window.location.pathname.includes('signup.html')) {
        window.location.href = 'home.html';
      }
    } else {
      console.log('User is signed out');
      if (window.location.pathname.includes('home.html')) {
        window.location.href = 'index.html';
      }
    }
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

function setupEventListeners() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const logoutBtn = document.getElementById('logoutBtn');
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
        const userCredential = await handleLogin(email, password);
        const user = userCredential.user;
        const userDoc = await db.collection('users').doc(user.uid).get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            showMessage('Login successful!', 'success');
            if (userData.role === 'resident') {
                setTimeout(() => window.location.href = 'home.html', 1000);
            } else if (userData.role === 'community_manager') {
                setTimeout(() => window.location.href = 'manager_home.html', 1000);
            } else {
                // Default redirect
                setTimeout(() => window.location.href = 'home.html', 1000);
            }
        } else {
            showMessage('Could not find user profile. Please contact support.', 'error');
            await handleLogout();
        }
      } catch (error) {
        showMessage(`Login failed: ${error.message}`, 'error');
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = signupForm.fullName.value;
      const username = signupForm.signupUsername.value;
      const email = signupForm.signupEmail.value;
      const password = signupForm.signupPassword.value;
      const role = signupForm.signupRole.value;
      const address = signupForm.address.value;
      const phoneNumber = signupForm.phoneNumber.value;
      try {
        await handleSignup(fullName, username, email, password, role, address, phoneNumber);
        await handleLogout();
        showMessage('Sign up successful! Please log in.', 'success');
        setTimeout(() => window.location.href = 'index.html', 1500);
      } catch (error) {
        showMessage(`Sign up failed: ${error.message}`, 'error');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await handleLogout();
        showMessage('Logged out successfully', 'info');
        setTimeout(() => window.location.href = 'index.html', 1000);
      } catch (error) {
        showMessage('Logout failed. Please try again.', 'error');
      }
    });
  }

  if (complaintBtn) {
    complaintBtn.addEventListener('click', () => window.location.href = 'home.html');
  }

  if (trackBtn) {
    trackBtn.addEventListener('click', () => window.location.href = 'track.html');
  }

  if (feedbackBtn) {
    feedbackBtn.addEventListener('click', () => window.location.href = 'feedback.html');
  }

  const searchBtn = document.getElementById('searchBtn');
  const searchComplaint = document.getElementById('searchComplaint');

  if (searchBtn && searchComplaint) {
    searchBtn.addEventListener('click', () => {
      const searchTerm = searchComplaint.value.trim();
      if (searchTerm) {
        showMessage(`Searching for: ${searchTerm}`, 'info');
      } else {
        showMessage('Please enter a search term', 'warning');
      }
    });
    searchComplaint.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') searchBtn.click();
    });
  }

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
        showMessage('Failed to submit feedback. Please try again.', 'error');
      }
    });
  }
}

// ✅ Final single DOMContentLoaded entry point
document.addEventListener('DOMContentLoaded', initializeApp);
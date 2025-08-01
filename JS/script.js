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

// Main initialization function
async function initializeApp() {
  try {
    // Load Firebase scripts if not already loaded
    if (typeof firebase === 'undefined') {
      await loadFirebaseScripts();
    } else {
      initializeFirebase();
    }

    // Set up event listeners based on current page
    setupEventListeners();
    
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

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.loginEmail?.value || loginForm.querySelector('[name="loginEmail"]')?.value;
      const password = loginForm.loginPassword?.value || loginForm.querySelector('[name="loginPassword"]')?.value;
      
      if (!email || !password) {
        alert('Please enter both email and password');
        return;
      }

      try {
        await handleLogin(email, password);
        alert('Login successful!');
        window.location.href = 'home.html';
      } catch (error) {
        console.error('Login error:', error);
        alert(`Login failed: ${error.message}`);
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
        alert('Sign up successful! Please log in.');
        window.location.href = 'index.html';
      } catch (error) {
        console.error('Signup error:', error);
        alert(`Sign up failed: ${error.message}`);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await handleLogout();
        window.location.href = 'index.html';
      } catch (error) {
        console.error('Sign out error:', error);
        alert('Logout failed. Please try again.');
      }
    });
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

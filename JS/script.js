// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-ndD8GLOmNWZdpaHqXLGxdTCHLSO0raE",
  authDomain: "supportassistant-74986.firebaseapp.com",
  projectId: "supportassistant-74986",
  storageBucket: "supportassistant-74986.firebasestorage.app",
  messagingSenderId: "927348252383",
  appId: "1:927348252383:web:3f48dfea85a6adfcc5d36a",
  measurementId: "G-56CMK009MB"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics();
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Handle login logic here
            alert('Login form submitted');
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = signupForm.signupUsername.value;
            const email = signupForm.signupEmail.value;
            const password = signupForm.signupPassword.value;
            const role = signupForm.signupRole.value;

            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Signed in 
                    const user = userCredential.user;
                    
                    // Now store the user's details in Firestore
                    return db.collection('users').doc(user.uid).set({
                        username: username,
                        email: email,
                        role: role
                    });
                })
                .then(() => {
                    alert('Sign up successful! Please log in.');
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.error(error);
                    alert(`Error: ${errorMessage}`);
                });
        });
    }
});

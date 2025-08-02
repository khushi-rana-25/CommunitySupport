document.addEventListener('DOMContentLoaded', () => {
    const logoutBtnProfile = document.getElementById('logoutBtnProfile');

    if (logoutBtnProfile) {
        logoutBtnProfile.addEventListener('click', async () => {
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
});

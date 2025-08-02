document.addEventListener("DOMContentLoaded", function () {
    // Function to load navbar
    function loadNavbar() {
        fetch('cavbar.html')
            .then(response => response.text())
            .then(data => {
                const navbarContainer = document.getElementById('navbar-container') || document.getElementById('navbar-container-manager');
                if (navbarContainer) {
                    navbarContainer.innerHTML = data;
                    // After loading navbar, attach event listeners
                    attachNavEventListeners();
                }
            });
    }

    // Function to attach event listeners to navbar links
    function attachNavEventListeners() {
        const managerHomeBtn = document.getElementById("manager_home-btn");
        const dashboardBtn = document.getElementById("dashboard-btn");

        if (managerHomeBtn) {
            managerHomeBtn.addEventListener("click", function (event) {
                event.preventDefault();
                window.location.href = 'manager_home.html';
            });
        }

        if (dashboardBtn) {
            dashboardBtn.addEventListener("click", function (event) {
                event.preventDefault();
                window.location.href = 'dashboard.html';
            });
        }
    }

    // Load the navbar
    loadNavbar();
});

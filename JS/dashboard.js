document.addEventListener('DOMContentLoaded', () => {
    fetch('../feedback.json')
        .then(response => response.json())
        .then(data => {
            const ratings = data.map(item => item.rating);
            const labels = data.map(item => `ID: ${item.id} (${item.user})`);

            const ratingCounts = {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0
            };

            ratings.forEach(rating => {
                if (ratingCounts[rating] !== undefined) {
                    ratingCounts[rating]++;
                }
            });

            const chartData = {
                labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
                datasets: [{
                    label: 'Feedback Ratings',
                    data: Object.values(ratingCounts),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(255, 205, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(54, 162, 235, 0.2)'
                    ],
                    borderColor: [
                        'rgb(255, 99, 132)',
                        'rgb(255, 159, 64)',
                        'rgb(255, 205, 86)',
                        'rgb(75, 192, 192)',
                        'rgb(54, 162, 235)'
                    ],
                    borderWidth: 1
                }]
            };

            const ctx = document.getElementById('feedbackChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        });
});

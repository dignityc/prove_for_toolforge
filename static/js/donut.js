function drawDonut(donutdata,text){
    var data = {
        labels: [
        "w ref.",
        "w/o ref.",
        ],
        datasets: [
        {
            data: [0, 0],
            backgroundColor: [
            "#91cf60",
            "#fc8d59",
            ],
            hoverBackgroundColor: [
            "#91cf60",
            "#fc8d59",
            ]
        }],
    };
    
    var promisedDeliveryChart = new Chart(document.getElementById('donutChart'), {
        type: 'doughnut',
        data: data,
        options: {
            responsive: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Claims',
                    position: 'top', // Change the position of the title
                    font: {
                        size: 32, // Set the font size
                    },
                },
                legend: {
                    display: false,
                    position: 'right',
                    labels: {
                        font: {
                            size: 16,
                        },
                    },
                },
            },
        }
    });
}

$(document).ready(function() {
    drawDonut();
});

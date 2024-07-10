let donutChart1, donutChart2, donutChart3;

function createDonutChart(ctx,labels, data) {
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            label: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#91cf60', '#fdae61', '#ffffbf'],
                hoverBackgroundColor: ['#66bd63', '#fc8d59','#ffffb0']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '50%',
            plugins: {
                legend: {
                    display: false,
                }
            }
        }
    });
}

function createBarChart(ctx, labels, data) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Per Property',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '50%',
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateCharts(data) {
    
    ctx1 = document.getElementById('donutChart1').getContext('2d');
    ctx2 = document.getElementById('donutChart2').getContext('2d');
    ctx3 = document.getElementById('donutChart3').getContext('2d');
    
    if (donutChart1) donutChart1.destroy();
    if (donutChart2) donutChart2.destroy();
    if (donutChart3) donutChart3.destroy();

    if (ctx1 && ctx2 && ctx3) {
        donutChart1 = createDonutChart(ctx1,['w ref.', 'w/o ref.'], [data.Claims_ref, data.Claims_tot-data.Claims_ref]);
        donutChart2 = createDonutChart(ctx2, ['w ref.', 'w/o ref.'], [data.Property_ref, data.Property_tot-data.Property_ref]);
        donutChart3 = createDonutChart(ctx3, ['support.', 'refute', 'lacking info.'], [data.Ref_support, data.Ref_unsupport, data.Ref_noinfo]);
    } else {
        console.error('One or more canvas elements could not be found');
    }


    // const barCtx = document.getElementById('barChart').getContext('2d');
    // createBarChart(barCtx, barData.labels, barData.data);
}

function updateDescription(blockId, newValues) {
    // Select the block based on a unique identifier, here we use the id of the parent .metric-block
    const block = document.getElementById(blockId);
    const paragraphs = block.querySelectorAll('.description p');
    paragraphs.forEach((p, index) => {
        if (newValues[index]) { // Check if a new value exists for this paragraph
            p.innerText = newValues[index];
        }
    });
}


document.addEventListener('DOMContentLoaded', (event) => {
    const ctx1 = document.getElementById('donutChart1')?.getContext('2d');
    const ctx2 = document.getElementById('donutChart2')?.getContext('2d');
    const ctx3 = document.getElementById('donutChart3')?.getContext('2d');

    if (ctx1 && ctx2 && ctx3) {
        donutChart1 = createDonutChart(ctx1,['w ref.', 'w/o ref.'], [1, 0]);
        donutChart2 =createDonutChart(ctx2, ['w ref.', 'w/o ref.'], [1, 0]);
        donutChart3 =createDonutChart(ctx3, ['support.', 'refute', 'lacking info.'], [1, 0, 0]);
    } else {
        console.error('One or more canvas elements could not be found');
    }

    // Moved inside the DOMContentLoaded listener
    const ctx = document.getElementById('barChart')?.getContext('2d');
    if (ctx) {
        const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Property 1', 'Property 2', 'Property 3', 'Property 4', 'Property 5', 'Property 6', 'Property 7', 'Property 8', 'Property 9', 'Property 10', 'Property 11', 'Property 12', 'Property 13', 'Property 14', 'Property 15', 'Property 16', 'Property 17', 'Property 18', 'Property 19', 'Property 20'],
                datasets: [{
                    label: 'Per Property',
                    data: [12, 19, 3, 5, 2, 3, 10, 8, 7, 11, 6, 5, 9, 4, 7, 10, 8, 6, 9, 3],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: false,
                        text: 'Claims',
                        position: 'top',
                        font: {
                            size: 32
                        }
                    },
                    legend: {
                        display: false,
                        position: 'right',
                        labels: {
                            font: {
                                size: 16
                            }
                        }
                    }
                }
            }
        });
    } else {
        console.error('Failed to get context for myChart');
    }
});
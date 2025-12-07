import { Card } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function SalesPerformanceChart() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = {
        labels: months,
        datasets: [
            {
                type: 'line',
                label: 'Gross Profit',
                data: [12000, 15000, 14000, 17000, 16000, 18000, 17500, 19000, 18500, 20000, 21000, 22000],
                borderColor: '#2979FF',
                backgroundColor: 'rgba(41,121,255,0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                pointRadius: 4,
                fill: false,
                order: 2,
            },
            {
                type: 'line',
                label: 'Revenue',
                data: [30000, 32000, 31000, 35000, 34000, 36000, 35500, 37000, 36500, 38000, 39000, 40000],
                borderColor: 'rgba(76,175,80,0.7)',
                backgroundColor: 'rgba(76,175,80,0.2)',
                yAxisID: 'y',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                order: 1,
            },
        ],
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: {
                display: true,
                text: 'Sales Performance over Time',
                font: { size: 22 },
            },
            tooltip: { mode: 'index', intersect: false },
        },
        scales: {
            x: {
                title: { display: true, text: 'Month' },
                grid: { display: false },
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: { display: true, text: 'Revenue (₱)' },
                grid: { color: '#F0F0F0' },
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: { display: true, text: 'Gross Profit (₱)' },
                grid: { drawOnChartArea: false },
            },
        },
    };
    return (
        <Card className="shadow-sm border-0 mb-4" style={{ minHeight: 500, maxHeight: 500, padding: 24, width: 900, maxWidth: 900 }}>
            <div style={{ width: '100%', height: 360 }}>
                <Line data={data} options={options} />
            </div>
        </Card>
    );
}

export default SalesPerformanceChart;

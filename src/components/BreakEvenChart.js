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

function BreakEvenChart() {
    const units = Array.from({ length: 12 }, (_, i) => (i + 1) * 100); // Units sold
    const data = {
        labels: units,
        datasets: [
            {
                label: 'Total Revenue',
                data: units.map(u => u * 250), // Revenue per unit
                borderColor: '#2979FF',
                backgroundColor: 'rgba(41,121,255,0.08)',
                borderWidth: 3,
                pointRadius: 3,
                fill: false,
                tension: 0.3,
            },
            {
                label: 'Total Fixed Costs',
                data: units.map(() => 150000), // Fixed cost
                borderColor: '#FF7043',
                borderDash: [8, 4],
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0,
            },
            {
                label: 'Total Variable Costs',
                data: units.map(u => u * 100 + 150000), // Variable cost per unit + fixed cost
                borderColor: '#43A047',
                backgroundColor: 'rgba(67,160,71,0.08)',
                borderWidth: 3,
                pointRadius: 3,
                fill: false,
                tension: 0.3,
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
                text: 'Break-Even Analysis',
                font: { size: 22 },
            },
            tooltip: { mode: 'index', intersect: false },
        },
        scales: {
            x: {
                title: { display: true, text: 'Units Sold' },
                grid: { display: false },
            },
            y: {
                title: { display: true, text: 'Amount (₱)' },
                grid: { color: '#F0F0F0' },
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

export default BreakEvenChart;

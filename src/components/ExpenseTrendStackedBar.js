import React from 'react';
import { Card } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Sample data for 12 months, 5 categories
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const categories = [
    { label: 'Salaries', color: '#2979FF' },
    { label: 'Rent', color: '#43A047' },
    { label: 'Marketing', color: '#FF7043' },
    { label: 'Utilities', color: '#FFD600' },
    { label: 'Supplies', color: '#7C4DFF' },
];
const data = {
    labels: months,
    datasets: [
        {
            label: 'Salaries',
            data: [15000, 15000, 15000, 16000, 16000, 17000, 17000, 18000, 18000, 19000, 19000, 20000],
            backgroundColor: '#2979FF',
            stack: 'expenses',
        },
        {
            label: 'Rent',
            data: [10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000],
            backgroundColor: '#43A047',
            stack: 'expenses',
        },
        {
            label: 'Marketing',
            data: [3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500],
            backgroundColor: '#FF7043',
            stack: 'expenses',
        },
        {
            label: 'Utilities',
            data: [2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100],
            backgroundColor: '#FFD600',
            stack: 'expenses',
        },
        {
            label: 'Supplies',
            data: [1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3200],
            backgroundColor: '#7C4DFF',
            stack: 'expenses',
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
            text: 'Expense Trend',
            font: { size: 22 },
        },
        tooltip: {
            mode: 'index',
            intersect: false,
        },
    },
    scales: {
        x: {
            stacked: true,
            title: { display: true, text: 'Month' },
            grid: { display: false },
        },
        y: {
            stacked: true,
            title: { display: true, text: 'Total Expenses (₱)' },
            grid: { color: '#F0F0F0' },
        },
    },
};

function ExpenseTrendStackedBar() {
    return (
        <Card className="shadow-sm border-0 mb-4" style={{ minHeight: 400, maxHeight: 500, padding: 24, width: '100%', maxWidth: 900 }}>
            <div style={{ width: '100%', height: 340 }}>
                <Bar data={data} options={options} />
            </div>
        </Card>
    );
}

export default ExpenseTrendStackedBar;

import React from 'react';
import { Card } from 'react-bootstrap';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const expenseData = [
    { label: 'Rent', value: 120000 },
    { label: 'Salaries', value: 180000 },
    { label: 'Marketing', value: 40000 },
    { label: 'Utilities', value: 25000 },
    { label: 'Supplies', value: 15000 },
    { label: 'Other', value: 10000 },
];

const totalExpense = expenseData.reduce((sum, e) => sum + e.value, 0);

const data = {
    labels: expenseData.map(e => e.label),
    datasets: [
        {
            data: expenseData.map(e => e.value),
            backgroundColor: [
                '#2979FF',
                '#43A047',
                '#FF7043',
                '#FFD600',
                '#7C4DFF',
                '#90A4AE',
            ],
            borderWidth: 2,
        },
    ],
};

const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
        legend: { position: 'right' },
        title: {
            display: true,
            text: 'Expense Breakdown',
            font: { size: 22 },
        },
        tooltip: {
            callbacks: {
                label: function (context) {
                    const label = context.label || '';
                    const value = context.parsed;
                    const percent = ((value / totalExpense) * 100).toFixed(1);
                    return `${label}: ₱${value.toLocaleString()} (${percent}%)`;
                },
            },
        },
    },
};

function ExpenseBreakdownDonut() {
    return (
        <Card className="shadow-sm border-0 mb-4" style={{ minHeight: 500, maxHeight: 500, padding: 8, width: '50%', maxWidth: 450, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', height: 340, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Doughnut data={data} options={options} />
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                }}>
                    <div style={{ fontWeight: 700, fontSize: 22 }}>₱{totalExpense.toLocaleString()}</div>
                    <div style={{ fontSize: 14, color: '#888' }}>Total Expense</div>
                </div>
            </div>
        </Card>
    );
}

export default ExpenseBreakdownDonut;

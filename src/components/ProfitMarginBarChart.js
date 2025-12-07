import React, { useState } from 'react';
import { Card, Dropdown, Table, Form } from 'react-bootstrap';
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

// Sample data for 15+ items
const itemsData = [
    { name: 'Item A', revenue: 50000, cogs: 30000, quantity: 200, grossProfit: 20000 },
    { name: 'Item B', revenue: 40000, cogs: 25000, quantity: 180, grossProfit: 15000 },
    { name: 'Item C', revenue: 35000, cogs: 20000, quantity: 160, grossProfit: 15000 },
    { name: 'Item D', revenue: 30000, cogs: 18000, quantity: 150, grossProfit: 12000 },
    { name: 'Item E', revenue: 28000, cogs: 17000, quantity: 140, grossProfit: 11000 },
    { name: 'Item F', revenue: 26000, cogs: 16000, quantity: 130, grossProfit: 10000 },
    { name: 'Item G', revenue: 24000, cogs: 15000, quantity: 120, grossProfit: 9000 },
    { name: 'Item H', revenue: 22000, cogs: 14000, quantity: 110, grossProfit: 8000 },
    { name: 'Item I', revenue: 20000, cogs: 13000, quantity: 100, grossProfit: 7000 },
    { name: 'Item J', revenue: 18000, cogs: 12000, quantity: 90, grossProfit: 6000 },
    { name: 'Item K', revenue: 16000, cogs: 11000, quantity: 80, grossProfit: 5000 },
    { name: 'Item L', revenue: 14000, cogs: 10000, quantity: 70, grossProfit: 4000 },
    { name: 'Item M', revenue: 12000, cogs: 9000, quantity: 60, grossProfit: 3000 },
    { name: 'Item N', revenue: 10000, cogs: 8000, quantity: 50, grossProfit: 2000 },
    { name: 'Item O', revenue: 8000, cogs: 7000, quantity: 40, grossProfit: 1000 },
];

function getGrossProfitPercent(item) {
    return item.revenue === 0 ? 0 : ((item.grossProfit / item.revenue) * 100).toFixed(2);
}

const rankingOptions = [
    { value: 'grossProfitPercent', label: 'Gross Profit %' },
    { value: 'revenue', label: 'Total Revenue' },
    { value: 'quantity', label: 'Volume/Quantity Sold' },
];

function ProfitMarginBarChart() {
    const [rankingBasis, setRankingBasis] = useState('grossProfitPercent');
    const [topN, setTopN] = useState(10);
    const [search, setSearch] = useState('');
    const [sortCol, setSortCol] = useState('grossProfitPercent');
    const [sortAsc, setSortAsc] = useState(false);

    // Add grossProfitPercent to each item
    const items = itemsData.map(item => ({
        ...item,
        grossProfitPercent: parseFloat(getGrossProfitPercent(item)),
    }));

    // Filter and sort for chart
    let rankedItems = [...items];
    if (rankingBasis === 'grossProfitPercent') {
        rankedItems.sort((a, b) => b.grossProfitPercent - a.grossProfitPercent);
    } else if (rankingBasis === 'revenue') {
        rankedItems.sort((a, b) => b.revenue - a.revenue);
    } else if (rankingBasis === 'quantity') {
        rankedItems.sort((a, b) => b.quantity - a.quantity);
    }
    const chartItems = rankedItems.slice(0, topN);

    // Chart data
    const chartData = {
        labels: chartItems.map(item => item.name),
        datasets: [
            {
                label:
                    rankingBasis === 'grossProfitPercent'
                        ? 'Gross Profit %'
                        : rankingBasis === 'revenue'
                            ? 'Total Revenue'
                            : 'Quantity Sold',
                data: chartItems.map(item =>
                    rankingBasis === 'grossProfitPercent'
                        ? item.grossProfitPercent
                        : rankingBasis === 'revenue'
                            ? item.revenue
                            : item.quantity
                ),
                backgroundColor: 'rgba(41,121,255,0.7)',
                borderRadius: 8,
                barThickness: 24,
            },
        ],
    };
    const chartOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: `Profit Margin (Top ${topN})`,
                font: { size: 22 },
            },
            tooltip: { mode: 'index', intersect: false },
        },
        scales: {
            x: {
                beginAtZero: true,
                title: {
                    display: true,
                    text:
                        rankingBasis === 'grossProfitPercent'
                            ? 'Gross Profit %'
                            : rankingBasis === 'revenue'
                                ? 'Total Revenue (₱)'
                                : 'Quantity Sold',
                },
                grid: { color: '#F0F0F0' },
            },
            y: {
                grid: { display: false },
            },
        },
    };

    // Table filtering, sorting
    let filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );
    filteredItems.sort((a, b) => {
        if (sortCol === 'grossProfitPercent') {
            return sortAsc
                ? a.grossProfitPercent - b.grossProfitPercent
                : b.grossProfitPercent - a.grossProfitPercent;
        } else if (sortCol === 'revenue') {
            return sortAsc ? a.revenue - b.revenue : b.revenue - a.revenue;
        } else if (sortCol === 'cogs') {
            return sortAsc ? a.cogs - b.cogs : b.cogs - a.cogs;
        } else if (sortCol === 'quantity') {
            return sortAsc ? a.quantity - b.quantity : b.quantity - a.quantity;
        } else if (sortCol === 'grossProfit') {
            return sortAsc ? a.grossProfit - b.grossProfit : b.grossProfit - a.grossProfit;
        }
        return 0;
    });

    return (
        <div className="mb-5 d-flex" style={{ width: '1350px', minWidth: 675, maxWidth: 1350, minHeight: 500, alignItems: 'stretch', marginLeft: 0 }}>
            <Card className="shadow-sm border-0 mb-4" style={{ minHeight: 500, padding: 24, width: '675px', maxWidth: 675 }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <Dropdown onSelect={val => setRankingBasis(val)}>
                            <Dropdown.Toggle variant="outline-primary" id="dropdown-ranking">
                                Rank by: {rankingOptions.find(opt => opt.value === rankingBasis).label}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {rankingOptions.map(opt => (
                                    <Dropdown.Item key={opt.value} eventKey={opt.value} active={rankingBasis === opt.value}>
                                        {opt.label}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <div>
                        <Form.Select
                            value={topN}
                            onChange={e => setTopN(Number(e.target.value))}
                            style={{ width: 120 }}
                        >
                            <option value={5}>Top 5</option>
                            <option value={10}>Top 10</option>
                        </Form.Select>
                    </div>
                </div>
                <div style={{ width: '100%', height: 340 }}>
                    <Bar data={chartData} options={chartOptions} />
                </div>
            </Card>
            <Card className="shadow-sm border-0 mb-4" style={{ marginLeft: 24, padding: 24, minHeight: 500, maxHeight: 500, overflowY: 'auto', width: '675px', maxWidth: 675 }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0">All Items</h5>
                    <Form.Control
                        type="text"
                        placeholder="Search items..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: 220 }}
                    />
                </div>
                <Table striped hover responsive size="sm" className="mb-0">
                    <thead>
                        <tr>
                            <th onClick={() => { setSortCol('name'); setSortAsc(!sortAsc); }} style={{ cursor: 'pointer' }}>Item</th>
                            <th onClick={() => { setSortCol('revenue'); setSortAsc(!sortAsc); }} style={{ cursor: 'pointer' }}>Revenue (₱)</th>
                            <th onClick={() => { setSortCol('cogs'); setSortAsc(!sortAsc); }} style={{ cursor: 'pointer' }}>COGS (₱)</th>
                            <th onClick={() => { setSortCol('quantity'); setSortAsc(!sortAsc); }} style={{ cursor: 'pointer' }}>Quantity</th>
                            <th onClick={() => { setSortCol('grossProfit'); setSortAsc(!sortAsc); }} style={{ cursor: 'pointer' }}>Gross Profit (₱)</th>
                            <th onClick={() => { setSortCol('grossProfitPercent'); setSortAsc(!sortAsc); }} style={{ cursor: 'pointer' }}>Gross Profit %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(item => (
                            <tr key={item.name}>
                                <td className="text-center">{item.name}</td>
                                <td className="text-center">{item.revenue.toLocaleString()}</td>
                                <td className="text-center">{item.cogs.toLocaleString()}</td>
                                <td className="text-center">{item.quantity}</td>
                                <td className="text-center">{item.grossProfit.toLocaleString()}</td>
                                <td className="text-center">{item.grossProfitPercent}%</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
}

export default ProfitMarginBarChart;

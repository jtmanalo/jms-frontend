import React, { useState } from 'react';
import { Card, Table, Form } from 'react-bootstrap';

// Sample data for locations
const locationData = [
    { name: 'Alaminos', revenue: 320000, grossProfitPercent: 28.5, netIncome: 65000 },
    { name: 'Tiaong', revenue: 210000, grossProfitPercent: 22.1, netIncome: 32000 },
    { name: 'San Pablo', revenue: 180000, grossProfitPercent: 19.8, netIncome: 21000 },
    { name: 'Lipa', revenue: 250000, grossProfitPercent: 25.2, netIncome: 48000 },
    { name: 'Tanauan', revenue: 150000, grossProfitPercent: 15.7, netIncome: 9000 },
];

function getPerfColor(value, type) {
    // Simple color logic: green for high, yellow for mid, red for low
    if (type === 'grossProfitPercent') {
        if (value >= 25) return '#43A047'; // green
        if (value >= 20) return '#FFD600'; // yellow
        return '#FF7043'; // red
    }
    if (type === 'netIncome') {
        if (value >= 50000) return '#43A047';
        if (value >= 20000) return '#FFD600';
        return '#FF7043';
    }
    return '#90A4AE';
}

function LocationAnalysisTable() {
    const [sortCol, setSortCol] = useState('revenue');
    const [sortAsc, setSortAsc] = useState(false);
    const [search, setSearch] = useState('');

    let filtered = locationData.filter(loc =>
        loc.name.toLowerCase().includes(search.toLowerCase())
    );
    filtered.sort((a, b) => {
        if (sortCol === 'name') {
            return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else {
            return sortAsc ? a[sortCol] - b[sortCol] : b[sortCol] - a[sortCol];
        }
    });

    return (
        <Card className="shadow-sm border-0 mb-4" style={{ minHeight: 400, maxHeight: 500, padding: 24, width: '100%', maxWidth: 900 }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0">Geographic/Location Analysis</h5>
                <Form.Control
                    type="text"
                    placeholder="Search location..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: 180 }}
                />
            </div>
            <Table striped hover responsive size="sm" className="mb-0">
                <thead>
                    <tr>
                        <th onClick={() => { setSortCol('name'); setSortAsc(!sortAsc); }} style={{ cursor: 'pointer' }}>Location</th>
                        <th onClick={() => { setSortCol('revenue'); setSortAsc(!sortAsc); }} style={{ cursor: 'pointer' }}>Revenue (₱)</th>
                        <th onClick={() => { setSortCol('grossProfitPercent'); setSortAsc(!sortAsc); }} style={{ cursor: 'pointer' }}>Gross Profit %</th>
                        <th onClick={() => { setSortCol('netIncome'); setSortAsc(!sortAsc); }} style={{ cursor: 'pointer' }}>Net Income (₱)</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(loc => (
                        <tr key={loc.name}>
                            <td>{loc.name}</td>
                            <td>{loc.revenue.toLocaleString()}</td>
                            <td>
                                <span style={{
                                    background: getPerfColor(loc.grossProfitPercent, 'grossProfitPercent'),
                                    color: '#fff',
                                    borderRadius: 6,
                                    padding: '2px 8px',
                                    fontWeight: 600,
                                    fontSize: 14,
                                    minWidth: 48,
                                    display: 'inline-block',
                                    textAlign: 'center',
                                }}>{loc.grossProfitPercent}%</span>
                            </td>
                            <td>
                                <span style={{
                                    background: getPerfColor(loc.netIncome, 'netIncome'),
                                    color: '#fff',
                                    borderRadius: 6,
                                    padding: '2px 8px',
                                    fontWeight: 600,
                                    fontSize: 14,
                                    minWidth: 48,
                                    display: 'inline-block',
                                    textAlign: 'center',
                                }}>₱{loc.netIncome.toLocaleString()}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Card>
    );
}

export default LocationAnalysisTable;

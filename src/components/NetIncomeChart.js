import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import moment from 'moment';

function NetIncomeChart({ data }) {

    // 1. Data Transformation: Format the raw data for Recharts
    // The backend returns: [{ report_month_num: 1, net_income_value: 1500.50 }, ...]
    const formattedData = data.map(item => {
        const monthName = moment().month(item.report_month_num - 1).format('MMM');
        return {
            month: monthName,
            'Net Income': parseFloat(item.net_income_value) || 0,
            'Revenue': parseFloat(item.total_revenue) || 0,
            'Expenses': parseFloat(item.total_expenses_and_costs) || 0,
        };
    });

    // 2. Error/No Data Handling
    if (!data || data.length === 0) {
        return (
            <div className="text-center p-5 text-muted">
                No completed transactions found for the selected year.
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={formattedData}
                margin={{ top: 10, right: 30, left: 30, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />

                {/* X-Axis shows the Month Name */}
                <XAxis dataKey="month" />

                {/* Y-Axis shows the income value. A reference line at Y=0 is crucial. */}
                <YAxis
                    label={{ value: 'Income (PHP)', angle: -90, position: 'left', dx: -10 }}
                    tickFormatter={(value) => `₱${value.toLocaleString()}`}
                />

                {/* Custom Tooltip to show details on hover */}
                <Tooltip
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                                <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '10px' }}>
                                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{data.month}</p>
                                    <p style={{ margin: '2px 0' }}>Net Income: <strong>₱{data['Net Income'].toLocaleString()}</strong></p>
                                    <p style={{ margin: '2px 0' }}>Revenue: <strong>₱{data['Revenue'].toLocaleString()}</strong></p>
                                    <p style={{ margin: '2px 0' }}>Expenses: <strong>₱{data['Expenses'].toLocaleString()}</strong></p>
                                </div>
                            );
                        }
                        return null;
                    }}
                />

                <Legend />

                {/* The Bar for Net Income */}
                {/* The color changes based on whether income is positive (profit) or negative (loss) */}
                <Bar
                    dataKey="Net Income"
                    fill="#8884d8"
                // cell={<CustomBar color={data.net_income_value > 0 ? '#4CAF50' : '#F44336'} />}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}

export default NetIncomeChart;
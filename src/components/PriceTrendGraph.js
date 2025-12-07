import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import moment from 'moment-timezone';

function PriceTrendGraph({ entityId, entityType, itemId }) {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatPriceTrendData = (rawData) => {
        if (!rawData || rawData.length === 0) return [];

        // The data must be sorted chronologically (ensured by SQL: ORDER BY UpdatedAt ASC)
        return rawData.map(point => ({
            date: moment(point.UpdatedAt).tz('Asia/Manila').format('YYYY-MM-DD HH:mm'),
            price: parseFloat(point.NewPrice),
        }));
    };

    useEffect(() => {
        const fetchTrendData = async () => {
            setLoading(true);
            try {
                // console.log('Fetching price trend for:', { itemId, entityId, entityType });
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/pricelist/trend`, {
                    params: {
                        itemId: itemId,
                        entityId: entityId,
                        entityType: entityType
                    }
                });

                const formattedData = formatPriceTrendData(response.data);

                if (formattedData.length > 0) {
                    const lastPoint = formattedData[formattedData.length - 1];
                    const nowPoint = {
                        date: moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm'),
                        price: lastPoint.price
                    };
                    formattedData.push(nowPoint);
                }

                setChartData(formattedData);
            } catch (error) {
                console.error('Error fetching price trend data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (entityId && itemId) {
            fetchTrendData();
        }
    }, [entityId, entityType, itemId]);

    if (loading) return <div>Loading Price History...</div>;
    if (chartData.length <= 1) return <div>Not enough data points to show a trend.</div>;

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Price', angle: -90, position: 'insideLeft' }} domain={['auto', 'auto']} />
                <Tooltip />
                <Legend />
                {/* The 'type="stepAfter"' attribute creates the stepped line graph */}
                <Line
                    type="stepAfter"
                    dataKey="price"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

export default PriceTrendGraph;
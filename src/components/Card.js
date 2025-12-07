import React from 'react';
import { Card, Button, Form } from 'react-bootstrap';
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
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
/**
 * MetricChartCard - Reusable metric card with chart and dropdown filter
 * Props:
 *  - title: string (e.g. 'Total User')
 *  - value: string or number (e.g. '40,689')
 *  - icon: React element (optional)
 *  - subtitle: string (optional, e.g. 'Up from yesterday')
 *  - trend: string (optional, e.g. '+8.5%')
 *  - trendColor: string (optional, e.g. '#4CAF50')
 *  - bgColor: string (optional, card background)
 *  - iconBg: string (optional, icon background)
 *  - chartData: chart.js data object
 *  - chartOptions: chart.js options object
 *  - months: array of month strings
 *  - years: array of year strings
 *  - selectedMonth: string
 *  - selectedYear: string
 *  - onMonthChange: function
 *  - onYearChange: function
 */
export function MetricChartCard({
    title,
    chartData,
    chartOptions,
    months = [],
    years = [],
    selectedMonth,
    selectedYear,
    onMonthChange,
    onYearChange,
    bgColor = '#fff',
}) {
    return (
        <Card className="shadow-sm border-0" style={{ background: bgColor, borderRadius: 18, width: '100%', maxWidth: 1700, minWidth: 320, minHeight: 320, overflow: 'hidden' }}>
            <Card.Body className="d-flex flex-column p-4" style={{ height: '100%', overflow: 'hidden' }}>
                <div className="d-flex align-items-center justify-content-between mb-2" style={{ width: '100%' }}>
                    <span className="fw-semibold" style={{ fontSize: 24 }}>{title}</span>
                    <div className="d-flex gap-2 align-items-center">
                        <Form.Select size="sm" value={selectedMonth} onChange={onMonthChange} style={{ maxWidth: 120 }}>
                            {months.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </Form.Select>
                        <Form.Select size="sm" value={selectedYear} onChange={onYearChange} style={{ maxWidth: 80 }}>
                            {years.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </Form.Select>
                    </div>
                </div>
                <div style={{ width: '100%', minHeight: 220, maxHeight: 260, overflow: 'hidden' }}>
                    <Line
                        data={chartData}
                        options={{ ...chartOptions, maintainAspectRatio: false }}
                        style={{ width: '100%', height: '100%' }}
                        height={null}
                        width={null}
                    />
                </div>
            </Card.Body>
        </Card>
    );
}
/**
 * Generalized ActiveTabCard for reuse.
 * Props:
 * - title: string (header text)
 * - value: string or number (main value)
 * - color: string (background color, e.g. '#232323')
 * - textColor: string (text color, e.g. 'white')
 * - style: object (additional styles)
 * - children: ReactNode (optional extra content)
 */
export const ActiveTabCard = ({ title, value, branchDisplay, color = '#232323', textColor = 'white', style = {}, handleSwitchLocation, children }) => (
    <Card className="shadow-sm text-center" style={{ background: color, borderRadius: 0, color: textColor, marginTop: 0, borderTop: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', ...style }}>
        <Card.Body>
            <div className="mb-2" style={{ fontWeight: 500, fontSize: '1rem', letterSpacing: 1, color: textColor }}>
                {title}
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: textColor }}>
                {value}
            </div>
            {/* {name && (
                <div className="mt-2" style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 500, color: textColor, letterSpacing: 10 }}>
                    {name}
                </div>
            )}
            {location && (
                <div className="mt-1" style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 400, color: textColor, letterSpacing: 5 }}>
                    {location}
                </div>
            )} */}
            {branchDisplay && (
                <div className="mt-2" style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 500, color: textColor }}>
                    <strong>{branchDisplay.toUpperCase()}</strong>
                </div>
            )}
            <Button
                variant="link"
                className="me-3"
                onClick={handleSwitchLocation}
            >
                Switch Branch
            </Button>
            {children}
        </Card.Body>
    </Card>
);

export const ButtonsCard = ({ actions, endButton = null, header = 'Record' }) => {
    const gridTemplate = actions.length === 5 ? 'repeat(3, 1fr) repeat(2, 1fr)' : `repeat(${actions.length}, 1fr)`;

    return (
        <Card className="shadow-sm" style={{ borderRadius: '1rem', border: 'none', background: '#fff' }}>
            <Card.Body>
                <div className="mb-2 text-dark fw-semibold text-center" style={{ fontSize: '1rem', letterSpacing: 1 }}>{header}</div>
                <div
                    className="d-grid gap-3"
                    style={{
                        gridTemplateColumns: gridTemplate,
                        display: 'grid',
                        justifyContent: 'center',
                    }}
                >
                    {actions.map(({ label, icon, onClick }, idx) => (
                        <div key={label} className="d-flex flex-column align-items-center">
                            <Button
                                variant="light"
                                className="d-flex align-items-center justify-content-center mb-2 shadow-sm"
                                style={{ width: 56, height: 56, padding: 0, background: '#fff', border: '1px solid #343a40', borderRadius: '8px' }}
                                onClick={onClick}
                            >
                                {icon}
                            </Button>
                            <span className="small text-dark">{label}</span>
                        </div>
                    ))}
                </div>
                {endButton && (
                    <div className="d-flex justify-content-center mt-3">
                        {endButton}
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

/**
 * MetricCard - Reusable dashboard metric card
 * Props:
 *  - title: string (e.g. 'Revenue')
 *  - value: string or number (e.g. '$12,400')
 *  - icon: React element (optional)
 *  - subtitle: string (optional, e.g. 'Up from yesterday')
 *  - trend: string (optional, e.g. '+8.5%')
 *  - trendColor: string (optional, e.g. '#4CAF50')
 *  - bgColor: string (optional, card background)
 *  - iconBg: string (optional, icon background)
 */
export function MetricCard({
    title,
    value,
    icon,
    subtitle,
    trend,
    trendColor = '#4CAF50',
    bgColor = '#fff',
    iconBg = '#f5f6fa',
}) {
    return (
        <Card className="shadow-sm border-0" style={{ background: bgColor, borderRadius: 18, width: 320, minWidth: 320, maxWidth: 320, minHeight: 180, height: 180 }}>
            <Card.Body className="d-flex flex-column p-4" style={{ height: '100%' }}>
                <div className="d-flex align-items-center justify-content-between mb-2" style={{ width: '100%' }}>
                    <span className="fw-semibold text-muted small">{title}</span>
                    <div
                        className="d-flex align-items-center justify-content-center ms-2"
                        style={{ width: 40, height: 40, borderRadius: 12, background: iconBg }}
                    >
                        {icon}
                    </div>
                </div>
                <div className="fw-bold" style={{ fontSize: 28, marginBottom: 4 }}>{value}</div>
                {trend && (
                    <div className="d-flex align-items-center mb-1" style={{ fontSize: 14, color: trendColor }}>
                        <span>{trend}</span>
                        {subtitle && <span className="ms-2 text-muted">{subtitle}</span>}
                    </div>
                )}
                {!trend && subtitle && (
                    <div className="text-muted small mb-1">{subtitle}</div>
                )}
            </Card.Body>
        </Card>
    );
}
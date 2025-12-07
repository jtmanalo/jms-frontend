import React from 'react';
import { Spinner } from 'react-bootstrap';

function LoadingScreen() {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#f8f9fa',
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                zIndex: 1050,
            }}
        >
            <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem' }}>
            </Spinner>
        </div>
    );
}

export default LoadingScreen;
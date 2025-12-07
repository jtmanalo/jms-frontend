import React from 'react';
import { Button } from 'react-bootstrap';

/**
 * CustomButton - A general button with customizable text, color, and props.
 * @param {string} text - Button label
 * @param {string} color - Bootstrap color (e.g. 'primary', 'danger', 'success')
 * @param {string} variant - Bootstrap variant (optional)
 * @param {object} style - Inline style (optional)
 * @param {string} className - Additional class names (optional)
 * @param {function} onClick - Click handler
 * @param {any} rest - Other props
 */
const CustomButton = ({
    text,
    color = 'primary',
    variant,
    style = {},
    className = '',
    onClick,
    ...rest
}) => {
    // Use variant if provided, else use color
    const btnVariant = variant || color;
    return (
        <Button
            variant={btnVariant}
            style={style}
            className={className}
            onClick={onClick}
            {...rest}
        >
            {text}
        </Button>
    );
};

export default CustomButton;
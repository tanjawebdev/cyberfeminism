import React, { useState, useEffect } from 'react';
import './Scroller.scss';

interface ScrollerProps {
    min?: number;
    max?: number;
    step?: number;
    initialValue?: number;
    disabled?: boolean;
}

const Scroller: React.FC<ScrollerProps> = ({
                                               min = 0,
                                               max = 100,
                                               step = 1,
                                               initialValue = min,
                                               disabled = false,
                                           }) => {
    const [value, setValue] = useState(initialValue);

    // Prozent 0–1
    const pct = (v: number) => (v - min) / (max - min);

    // scrollt live beim Wertwechsel
    useEffect(() => {
        const p = pct(value);
        const doc = document.documentElement;
        const scrollable = doc.scrollHeight - window.innerHeight;
        window.scrollTo({ top: scrollable * p, behavior: 'auto' });
    }, [value]);

    return (
        <div className={`scroller ${disabled ? 'disabled' : ''}`}>
            <input
                type="range"
                className="scroller__range"
                min={min}
                max={max}
                step={step}
                value={value}
                disabled={disabled}
                onChange={(e) => setValue(Number(e.target.value))}
            />
        </div>
    );
};

export default Scroller;
import React, { useState, useRef, useEffect } from 'react';
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
    const [dragging, setDragging] = useState(false);
    const trackRef = useRef<HTMLDivElement>(null);

    // Prozent-Wert 0–1
    const pct = (val: number) => (val - min) / (max - min);

    // scrollt auf pct(0–1) der Seite
    const scrollToPct = (p: number) => {
        const doc = document.documentElement;
        const scrollable = doc.scrollHeight - window.innerHeight;
        window.scrollTo({ top: scrollable * p, behavior: 'auto' });
    };

    const updateValue = (clientX: number) => {
        if (!trackRef.current) return;
        const { left, width } = trackRef.current.getBoundingClientRect();
        let x = clientX - left;
        let p = Math.min(Math.max(x / width, 0), 1);
        const raw = min + p * (max - min);
        const snapped = Math.round(raw / step) * step;
        setValue(snapped);
        scrollToPct(p);
    };

    const onMouseDownThumb = (e: React.MouseEvent) => {
        if (disabled) return;
        e.stopPropagation();
        setDragging(true);
    };
    const onMouseMove = (e: MouseEvent) => {
        if (dragging) updateValue(e.clientX);
    };
    const onMouseUp = () => {
        if (dragging) setDragging(false);
    };

    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [dragging]);

    return (
        <div className={`scroller ${disabled ? 'disabled' : ''}`}>
            <div
                className="scroller__track"
                ref={trackRef}
                onMouseDown={(e) => {
                    if (!disabled) updateValue(e.clientX);
                }}
            >
                <div
                    className="scroller__filled"
                    style={{ width: `${pct(value) * 100}%` }}
                />
                <div
                    role="slider"
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={value}
                    tabIndex={disabled ? -1 : 0}
                    className={`scroller__thumb ${dragging ? 'active' : ''}`}
                    style={{ left: `${pct(value) * 100}%` }}
                    onMouseDown={onMouseDownThumb}
                    onKeyDown={(e) => {
                        if (disabled) return;
                        let v = value;
                        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') v = Math.min(value + step, max);
                        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') v = Math.max(value - step, min);
                        if (v !== value) {
                            const p = pct(v);
                            setValue(v);
                            scrollToPct(p);
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default Scroller;
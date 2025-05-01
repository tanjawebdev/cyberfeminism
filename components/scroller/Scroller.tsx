import React, { useState, useRef, useEffect } from 'react';
import './Scroller.scss';

interface ScrollerProps {
    min?: number;
    max?: number;
    step?: number;
    initialValue?: number;
    onChange?: (val: number) => void;
    disabled?: boolean;
}

const Scroller: React.FC<ScrollerProps> = ({
                                               min = 0,
                                               max = 100,
                                               step = 1,
                                               initialValue = min,
                                               onChange,
                                               disabled = false,
                                           }) => {
    const [value, setValue] = useState(initialValue);
    const [dragging, setDragging] = useState(false);
    const trackRef = useRef<HTMLDivElement>(null);

    const percent = () => ((value - min) / (max - min)) * 100;

    const updateValue = (clientX: number) => {
        if (!trackRef.current) return;
        const { left, width } = trackRef.current.getBoundingClientRect();
        let x = clientX - left;
        let p = Math.min(Math.max(x / width, 0), 1);
        const raw = min + p * (max - min);
        const snapped = Math.round(raw / step) * step;
        setValue(snapped);
        onChange?.(snapped);
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
                    style={{ width: `${percent()}%` }}
                />
                <div
                    role="slider"
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={value}
                    tabIndex={disabled ? -1 : 0}
                    className={`scroller__thumb ${dragging ? 'active' : ''}`}
                    style={{ left: `${percent()}%` }}
                    onMouseDown={onMouseDownThumb}
                    onKeyDown={(e) => {
                        if (disabled) return;
                        let v = value;
                        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') v = Math.min(value + step, max);
                        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') v = Math.max(value - step, min);
                        if (v !== value) {
                            setValue(v);
                            onChange?.(v);
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default Scroller;
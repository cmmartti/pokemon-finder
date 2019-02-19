import React, {useState, useRef, useEffect} from 'react';
import classNames from 'classnames';

import VariableWidthInput from '../utils/VariableWidthInput';
import useInterval from '../utils/useInterval';
import styles from './NumberInput.module.scss';

const UpChevron = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M10.707 7.05L10 6.343 4.343 12l1.414 1.414L10 9.172l4.243 4.242L15.657 12z" />
    </svg>
);
const DownChevron = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
    </svg>
);
const Checkmark = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
    </svg>
);

function NumberInput({forwardedRef, value, onChange, min = 0, max = 10000, step = 1}) {
    const inputRef = useRef(null);
    const timeoutRef = useRef(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinDirection, setSpinDirection] = useState(null);
    const [inputValue, setInputValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);

    useInterval(
        () => {
            spin(spinDirection);
        },
        isSpinning ? 50 : null
    );

    /* Mouseup event listeners only trigger over the element the listener was set up on.
       If the event listener is set up on the spinner buttons and the user mouses down,
       then moves the pointer off the button before mousing up, the mouseup event
       listener will not fire. Set it on the window instead. */
    useEffect(() => {
        window.addEventListener('mouseup', cancelSpin);
        return function cleanUp() {
            window.removeEventListener('mouseup', cancelSpin);
        };
    }, [isSpinning]);

    function spin(direction) {
        if (direction === 'up' && parseInt(inputValue, 10) < max) {
            setInputValue(val => (!val ? step : parseInt(val, 10) + step));
        } //
        else if (direction === 'down' && parseInt(inputValue, 10) > min) {
            setInputValue(val => (!val ? -step : parseInt(val, 10) - step));
        } else {
            cancelSpin();
        }
    }

    function onMouseDown(direction) {
        return function handleMouseDown() {
            spin(direction);

            setSpinDirection(direction);
            const timeout = setTimeout(() => {
                setIsSpinning(true);
            }, 250);
            timeoutRef.current = timeout;
        };
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter' || event.key === 'Tab') {
            onChange(inputValue);
        }
    }

    function cancelSpin() {
        clearTimeout(timeoutRef.current);
        setIsSpinning(false);
        setSpinDirection(null);
    }

    function manageRef(element) {
        // Keep our own copy
        inputRef.current = element;

        // Set the original ref, if any
        if (typeof forwardedRef === 'function') {
            forwardedRef(element);
        } else if (typeof forwardedRef === 'object') {
            forwardedRef.current = element;
        }
    }
    console.log(inputValue, value);
    return (
        <div
            className={classNames({
                [styles['number-input']]: true,
                [styles['number-input--is-focused']]: isFocused,
            })}
        >
            <VariableWidthInput
                className={styles['input']}
                sizerClassName={styles['input']}
                ref={manageRef}
                value={inputValue}
                type="number"
                onChange={event => setInputValue(event.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                min={min}
                max={max}
                step={step}
            />
            <div
                className={styles['spinner']}
                onMouseDown={event => {
                    event.preventDefault(); // prevent loss of focus
                    inputRef.current.focus();
                }}
            >
                <button
                    className={styles['spinner-button']}
                    onMouseDown={onMouseDown('up')}
                    onMouseLeave={() => cancelSpin()}
                    tabIndex="-1"
                >
                    <UpChevron />
                </button>
                <button
                    className={styles['spinner-button']}
                    onMouseDown={onMouseDown('down')}
                    onMouseLeave={() => cancelSpin()}
                    tabIndex="-1"
                >
                    <DownChevron />
                </button>
            </div>
            {parseInt(inputValue, 10) !== parseInt(value, 10) && (
                <button
                    className={styles['submit-button']}
                    aria-label="Submit"
                    disabled={parseInt(inputValue, 10) === parseInt(value, 10)}
                    tabIndex="-1"
                    onClick={() => onChange(inputValue)}
                >
                    <Checkmark />
                </button>
            )}
        </div>
    );
}

export default React.forwardRef((props, ref) => (
    <NumberInput forwardedRef={ref} {...props} />
));

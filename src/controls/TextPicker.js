import React, {useState, useRef, useImperativeHandle} from 'react';
import classNames from 'classnames';

import useOnClickOutside from '../utils/useOnClickOutside';
import VariableWidthInput from '../utils/VariableWidthInput';
import styles from './TextInput.module.scss';

function Option({innerProps, isFocused, text, search}) {
    const index = text.indexOf(search);
    return (
        <div
            className={classNames({
                [styles['option']]: true,
                [styles['option--is-focused']]: isFocused,
            })}
            {...innerProps}
        >
            <span>
                <b>{text.slice(0, index)}</b>
                {search}
                <b>{text.slice(index + search.length)}</b>
            </span>
        </div>
    );
}

function TextPicker({value, onChange, onSubmit, suggestions = [], forwardedRef}) {
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    useOnClickOutside(containerRef, close);

    const [isOpen, setIsOpen] = useState(false);
    const [focused, setFocused] = useState(null);
    const [typed, setTyped] = useState(value || '');
    const [inputValue, setInputValue] = useState(typed);

    function close() {
        setIsOpen(false);
        setInputValue(value);
        setFocused(null);
    }

    useImperativeHandle(forwardedRef, () => ({
        focus: () => {
            inputRef.current.focus();
            setIsOpen(true);
        },
        blur: () => {
            inputRef.current.blur();
            close();
        },
    }));

    function handleKeyDown(event) {
        switch (event.key) {
            case 'Escape':
                event.preventDefault();
                close();
                break;
            case 'Tab':
                close();
                break;
            case 'Enter':
                event.preventDefault();
                submit(inputValue);
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (isOpen) focusSuggestion('up');
                else setIsOpen(true);
                break;
            case 'ArrowDown':
                event.preventDefault();
                if (isOpen) focusSuggestion('down');
                else setIsOpen(true);
                break;
            default:
                break;
        }
    }

    function focusSuggestion(direction = 'first') {
        if (!suggestions.length) return;

        const focusIndex = suggestions.indexOf(focused);
        var newFocusIndex;

        if (direction === 'up') {
            if (focusIndex === -1) {
                newFocusIndex = suggestions.length - 1;
            } else if (focusIndex === 0) {
                newFocusIndex = -1;
            } else {
                newFocusIndex = focusIndex - 1;
            }
        } else if (direction === 'down') {
            if (focusIndex === -1) {
                newFocusIndex = 0;
            } else if (focusIndex === suggestions.length - 1) {
                newFocusIndex = -1;
            } else {
                newFocusIndex = focusIndex + 1;
            }
        }
        if (newFocusIndex === -1) {
            setInputValue(typed);
            setFocused(null);
        } else {
            setInputValue(suggestions[newFocusIndex]);
            setFocused(suggestions[newFocusIndex]);
        }
    }

    function submit(text) {
        setInputValue(text);
        setTyped(text);
        setIsOpen(false);
        setFocused(null);
        onSubmit(text);
        onChange(text);
    }

    function handleChange(event) {
        setInputValue(event.target.value);
        setTyped(event.target.value);
        setIsOpen(true);
        onChange(event.target.value);
    }

    return (
        <div
            className={styles['text-input']}
            ref={containerRef}
            onKeyDown={handleKeyDown}
        >
            <VariableWidthInput
                type="text"
                className={styles['input']}
                sizerClassName={styles['input']}
                autoComplete="off"
                ref={inputRef}
                value={inputValue}
                onChange={handleChange}
                onBlur={close}
            />
            {isOpen && typed.length > 0 && (
                <div className={styles['menu']} onMouseLeave={() => setFocused(null)}>
                    {suggestions.map(text => (
                        <Option
                            text={text}
                            search={typed}
                            key={text}
                            isFocused={focused === text}
                            innerProps={{
                                onClick: () => submit(text),
                                onMouseEnter: () => setFocused(text),
                                'aria-selected': focused === text,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default React.forwardRef((props, ref) => (
    <TextPicker forwardedRef={ref} {...props} />
));

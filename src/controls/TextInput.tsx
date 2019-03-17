import React, {useState, useRef, useImperativeHandle} from 'react';
import classNames from 'classnames';

import useOnClickOutside from '../utils/useOnClickOutside';
import VariableWidthInput from './VariableWidthInput';
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

type Props = {
    submitOnChange?: boolean;
    forwardedRef?: any;
    onChange(newValue: string): any;
    onSubmit(newValue: string): any;
    suggestions?: string[];
    value: string;
};

function TextInput({
    submitOnChange = false,
    forwardedRef,
    onChange,
    onSubmit,
    suggestions = [],
    value,
}: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const containerRef = useRef(null);
    useOnClickOutside(containerRef, close);

    const [isOpen, setIsOpen] = useState(false);
    const [focused, setFocused] = useState<string | null>(null);
    const [typed, setTyped] = useState(value || '');
    const [inputValue, setInputValue] = useState(typed);

    function close() {
        setIsOpen(false);
        setInputValue(value);
        setFocused(null);
    }

    useImperativeHandle(forwardedRef, () => ({
        focus: () => {
            if (inputRef.current) inputRef.current.focus();
            setIsOpen(true);
        },
        blur: () => {
            if (inputRef.current) inputRef.current.blur();
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
                if (!event.ctrlKey && !event.metaKey && !event.altKey) {
                    event.preventDefault();
                }
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

        let newFocusIndex;
        let focusIndex = -1;
        if (focused !== null) focusIndex = suggestions.indexOf(focused!);

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
        const text = event.target.value;
        setInputValue(text);
        setTyped(text);
        setIsOpen(true);
        onChange(text);
        if (submitOnChange) {
            onSubmit(text);
        }
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
                                onMouseDown: event => event.preventDefault(),
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

export default React.forwardRef<HTMLElement, Props>((props, ref) => (
    <TextInput forwardedRef={ref} {...props} />
));

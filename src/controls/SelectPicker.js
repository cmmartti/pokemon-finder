import React, {useState, useRef, useEffect, useImperativeHandle} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import VariableWidthInput from '../utils/VariableWidthInput';
import useOnClickOutside from '../utils/useOnClickOutside';
import scrollIntoView from '../utils/scrollIntoView';
import styles from './Picker.module.scss';

function defaultOnSearch(search, initialOptions) {
    return initialOptions.filter(option => {
        return (
            option.label.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
            (option.description &&
                option.description.toLowerCase().indexOf(search.toLowerCase()) >= 0)
        );
    });
}

function List({children, innerProps, innerRef}) {
    return (
        <div className={styles['options-list']} {...innerProps} ref={innerRef}>
            {children}
        </div>
    );
}

function Option({data, innerProps, innerRef, isActive, isSelected, isDelete, isClear}) {
    return (
        <div
            className={classNames({
                [styles['option']]: true,
                [styles['focused']]: isActive,
                [styles['delete-option']]: isDelete || isClear,
            })}
            title={'ID: ' + data.id}
            ref={innerRef}
            {...innerProps}
        >
            {isClear ? (
                <>
                    <svg
                        className={styles['icon']}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                    >
                        <path d="M6 2l2-2h4l2 2h4v2H2V2h4zM3 6h14l-1 14H4L3 6zm5 2v10h1V8H8zm3 0v10h1V8h-1z" />
                    </svg>{' '}
                    Clear
                </>
            ) : (
                <>
                    <div>
                        <div>{data.label}</div>
                        <div className={styles['option-description']}>
                            {data.description}
                        </div>
                    </div>
                    {isSelected && (
                        <svg
                            className={styles['icon']}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                        >
                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                        </svg>
                    )}
                </>
            )}
        </div>
    );
}

function SelectPicker({
    value,
    name,
    onChange,
    options = [],
    onDelete,
    onClear,
    onSearch = defaultOnSearch,
    forwardedRef,
}) {
    const inputRef = useRef(null);
    const listRef = useRef(null);
    const optionRefs = useRef({});

    const staticOptions = [];
    if (onDelete) {
        // staticOptions.push({id: 'SelectPicker_delete', label: 'Delete'});
    }
    if (value && onClear) {
        staticOptions.push({id: 'SelectPicker_clear', label: 'Clear'});
    }

    const [search, setSearch] = useState(value ? value.label : '');
    const [isExpanded, setIsExpanded] = useState(false);
    const [listOptions, setListOptions] = useState([...staticOptions, ...options]);
    const [announcement, setAnnouncement] = useState();
    const [focusedOption, setFocusedOption] = useState(listOptions[0]);

    function resetActiveOption(availableOptions) {
        const selectedOption = availableOptions.find(option =>
            compareOptions(option, value)
        );
        if (selectedOption) {
            setFocusedOption(selectedOption);
        } else {
            setFocusedOption(availableOptions[0]);
        }
    }

    function reset() {
        setSearch(value ? value.label : '');
        setIsExpanded(false);
        setListOptions([...staticOptions, ...options]);
        setAnnouncement();
        resetActiveOption(options);
    }

    // Reset when the mouse is clicked outside this component
    const containerRef = useRef(null);
    useOnClickOutside(containerRef, reset);

    useEffect(reset, [value]);
    useEffect(() => resetActiveOption(options), [options]);

    // Scroll to the focused option whenever the options list is first expanded
    useEffect(() => {
        if (isExpanded) {
            const el = optionRefs.current[focusedOption.id];
            if (el) {
                const list = listRef.current;
                list.scrollTop = el.offsetTop - (list.offsetHeight - el.offsetHeight) / 2;
            }
        }
    }, [isExpanded]);

    // Allow outside code to control the SelectPicker
    useImperativeHandle(forwardedRef, () => ({
        focus: () => {
            inputRef.current.focus();
            setIsExpanded(true);
        },
        blur: () => {
            inputRef.current.blur();
            setIsExpanded(false);
        },
    }));

    function compareOptions(option1, option2) {
        return option1 && option2 && option1.id === option2.id;
    }

    function expand() {
        resetActiveOption(listOptions);
        setIsExpanded(true);
    }

    function selectOption(option) {
        if (option.id === 'SelectPicker_delete') {
            if (typeof onDelete === 'function') onDelete();
        } else if (option.id === 'SelectPicker_clear') {
            if (typeof onClear === 'function') onClear();
        } else {
            onChange(option);
        }
        reset();
    }

    function focusOption(direction = 'first') {
        if (!listOptions.length) return;

        const focusIndex = listOptions.indexOf(focusedOption);
        var newFocusIndex;
        if (direction === 'first') {
            newFocusIndex = 0;
        } else if (direction === 'last') {
            newFocusIndex = listOptions.length - 1;
        } else if (direction === 'up') {
            newFocusIndex = (focusIndex + listOptions.length - 1) % listOptions.length;
        } else if (direction === 'down') {
            newFocusIndex = (focusIndex + 1) % listOptions.length;
        }
        const option = listOptions[newFocusIndex];

        setFocusedOption(option);
        announceFocused(option);
        if (['SelectPicker_delete', 'SelectPicker_clear'].includes(option.id)) {
            listRef.current.scrollTop = 0;
        } else {
            const element = optionRefs.current[option.id];
            if (element) {
                scrollIntoView(listRef.current, element, {block: 'nearest'});
            }
        }
    }

    function announceFocused(option) {
        var selectionStatus = '';
        if (value) {
            selectionStatus = ', not selected';
            if (compareOptions(option, value)) {
                selectionStatus = ', selected';
            }
        }
        const index = listOptions.indexOf(option);
        setAnnouncement(
            `${option.label}, ${index + 1} of ${listOptions.length} ${selectionStatus}`
        );
    }

    function handleKeyDown(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            reset();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (!isExpanded) expand();
            else focusOption('up');
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!isExpanded) expand();
            else focusOption('down');
        } else if (event.key === 'Tab') {
            reset();
        } else if (event.key === 'Home') {
            if (isExpanded) focusOption('first');
        } else if (event.key === 'End') {
            if (isExpanded) focusOption('last');
        }
    }

    function handleInputKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            selectOption(focusedOption);
        }
    }

    function handleChange(event) {
        setIsExpanded(true);
        setSearch(event.target.value);

        // Filter the available options based on the search query
        const filteredOptions = onSearch(event.target.value, options);

        setListOptions([...staticOptions, ...filteredOptions]);
        resetActiveOption(filteredOptions);
    }

    function renderOption(option) {
        return (
            <Option
                data={option}
                isActive={compareOptions(option, focusedOption)}
                isSelected={compareOptions(option, value)}
                isDelete={option.id === 'SelectPicker_delete'}
                isClear={option.id === 'SelectPicker_clear'}
                key={option.id}
                innerRef={element => {
                    optionRefs.current[option.id] = element;
                }}
                innerProps={{
                    // Prevent the input from losing focus:
                    onMouseDown: event => event.preventDefault(),
                    onClick: () => {
                        selectOption(option);
                        // Only lose focus when a new value is selected:
                        inputRef.current.blur();
                    },
                    onMouseEnter: () => setFocusedOption(option),
                    'aria-selected': compareOptions(option, value),
                    role: 'option',
                    id: `SelectPicker_${option.id}`,
                }}
            />
        );
    }
    return (
        <div
            className={styles['picker']}
            role="presentation"
            onKeyDown={handleKeyDown}
            ref={containerRef}
        >
            <VariableWidthInput
                className={styles['text-input']}
                sizerClassName={styles['text-input']}
                type="text"
                autoComplete="off"
                title={name}
                placeholder={name}
                ref={inputRef}
                value={search}
                onChange={handleChange}
                id="search"
                onClick={expand}
                onKeyDown={handleInputKeyDown}
                onMouseDown={expand}
                onBlur={reset}
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={isExpanded}
                aria-label={name}
                aria-describedby="instructions"
                // aria-activedescendant={`SelectPicker_${focusedOption.id}`}
                aria-autocomplete="list"
                // aria-owns="options_list"
                // aria-controls="options_list"
            />
            {isExpanded && (
                <div
                    className={styles['popup']}
                    onMouseLeave={() => setFocusedOption(null)}
                >
                    {staticOptions.map(renderOption)}

                    {listOptions.slice(staticOptions.length).length === 0 && (
                        <div className={styles['option']}>No results</div>
                    )}
                    <List
                        innerRef={listRef}
                        innerProps={{
                            id: 'options_list',
                            style: {position: 'relative'},
                        }}
                    >
                        {listOptions.slice(staticOptions.length).map(renderOption)}
                    </List>
                    <div className={styles['visually-hidden']} id="instructions">
                        Use up and down to choose options. Press Enter to select. Type to
                        refine list.
                    </div>
                    <div
                        className={styles['visually-hidden']}
                        aria-live="assertive"
                        aria-atomic="false"
                        aria-relevant="additions"
                    >
                        {announcement}
                    </div>
                </div>
            )}
        </div>
    );
}

const optionShape = PropTypes.shape({
    id: PropTypes.any.isRequired,
    label: PropTypes.string.isRequired,
});

SelectPicker.propTypes = {
    name: PropTypes.string.isRequired,
    value: optionShape,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
    onClear: PropTypes.func,
    options: PropTypes.arrayOf(optionShape),
    onSearch: PropTypes.func,
};

export default React.forwardRef((props, ref) => (
    <SelectPicker forwardedRef={ref} {...props} />
));

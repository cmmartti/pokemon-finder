import React, {useState, useEffect} from 'react';
import Select from 'react-select';
import classNames from 'classnames';

import VariableWidthInput from '../utils/VariableWidthInput';
import styles from './Picker.module.scss';

function InlineSelect({
    value,
    onChange,
    options = [],
    isMulti,
    isClearable,
    forwardedRef,
}) {
    const [dynamicOptions, setDynamicOptions] = useState(options);

    function handleInputChange(inputValue, {action}) {
        const searchTerm = normaliseString(inputValue);

        if (inputValue === '') {
            setDynamicOptions(options);
        } else if (action === 'input-change') {
            const newOptions = options
                .filter(option => {
                    return filterOption(
                        {
                            label: getOptionLabel(option),
                            value: getOptionValue(option),
                            data: option,
                        },
                        searchTerm
                    );
                })
                // Order results by relevancy
                .sort((optionA, optionB) => {
                    const a = normaliseString(getOptionLabel(optionA));
                    const b = normaliseString(getOptionLabel(optionB));

                    if (a.startsWith(searchTerm) && b.startsWith(searchTerm)) return 0;
                    if (a.startsWith(searchTerm)) return -1;
                    if (b.startsWith(searchTerm)) return 1;
                    return 0;
                });
            setDynamicOptions(newOptions);
        }
    }

    return (
        <Select
            ref={forwardedRef}
            value={value}
            options={dynamicOptions}
            onChange={onChange}
            onInputChange={handleInputChange}
            // filterOption={filterOption}
            filterOption={() => true}
            isMulti={isMulti}
            // openMenuOnFocus
            tabSelectsValue={false}
            backspaceRemovesValue={false}
            controlShouldRenderValue={false}
            className="inline-select"
            classNamePrefix="inline-select"
            getOptionValue={getOptionValue}
            getOptionLabel={getOptionLabel}
            formatOptionLabel={formatOptionLabel}
            components={{
                SelectContainer,
                Control: PlainDiv,
                ValueContainer: PlainDiv,
                Input,
                Placeholder: () => null,
                IndicatorsContainer: () => null,
                Menu,
                MenuList,
                Option,
            }}
        />
    );
}

export default React.forwardRef((props, ref) => (
    <InlineSelect forwardedRef={ref} {...props} />
));

///////////////////////////////////////////////////////////////////////////////
// Functions

function normaliseString(string) {
    return string.trim().toLowerCase();
}

function getOptionValue(option) {
    return option.id;
}

function getOptionLabel(option) {
    return option.label;
}

function formatOptionLabel(data, {context}) {
    if (context === 'menu') {
        return (
            <div>
                <div>{getOptionLabel(data)}</div>
                {data.description && (
                    <div className={styles['option-description']}>{data.description}</div>
                )}
            </div>
        );
    }
    return getOptionLabel(data);
}

function filterOption({label, data}, query) {
    return (
        label.toLowerCase().indexOf(query.toLowerCase()) >= 0 ||
        (data.description &&
            data.description.toLowerCase().indexOf(query.toLowerCase()) >= 0)
    );
}

///////////////////////////////////////////////////////////////////////////////
// Components

const SelectContainer = ({innerProps, innerRef, children}) => (
    <div {...innerProps} ref={innerRef} className={styles['picker']}>
        {children}
    </div>
);

const PlainDiv = ({innerRef, children, innerProps}) => (
    <div ref={innerRef} {...innerProps}>
        {children}
    </div>
);

function Input({innerRef, isDisabled, selectProps, onChange, onBlur, ...props}) {
    // Discard unused props
    const {cx, getStyles, isHidden, theme, ...inputProps} = props;

    const {value, getOptionLabel} = selectProps;
    const [inputValue, setInputValue] = useState(value ? getOptionLabel(value) : '');
    const [typed, setTyped] = useState(null);

    useEffect(() => {
        if (typed !== null) {
            setInputValue(typed);
        }
    }, [typed]);

    useEffect(() => {
        setTyped(null);
        setInputValue(value ? getOptionLabel(value) : '');
    }, [value]);

    function handleChange(event) {
        setInputValue(event.target.value);
        setTyped(event.target.value);
        onChange(event);
    }

    function handleBlur(event) {
        setTyped(null);
        setInputValue(value ? getOptionLabel(value) : '');
        onBlur(event);
    }

    return (
        <VariableWidthInput
            ref={innerRef}
            {...inputProps}
            className={styles['text-input']}
            sizerClassName={styles['text-input']}
            disabled={isDisabled}
            onChange={handleChange}
            onBlur={handleBlur}
            value={inputValue}
        />
    );
}

const Menu = ({innerProps, innerRef, children}) => (
    <div {...innerProps} ref={innerRef} className={styles['popup']}>
        {children}
    </div>
);

const MenuList = ({innerProps, innerRef, children}) => (
    <div {...innerProps} ref={innerRef} className={styles['options-list']}>
        {children}
    </div>
);

const Option = ({innerProps, innerRef, children, isFocused, isSelected, data}) => (
    <div
        {...innerProps}
        ref={innerRef}
        className={classNames({
            [styles['option']]: true,
            [styles['focused']]: isFocused,
            [styles['selected']]: isSelected,
            [styles['delete-option']]: data.id === 'clear_selection_mwtgbvkr',
        })}
    >
        {data.id === 'clear_selection_mwtgbvkr' && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M6 2l2-2h4l2 2h4v2H2V2h4zM3 6h14l-1 14H4L3 6zm5 2v10h1V8H8zm3 0v10h1V8h-1z" />
            </svg>
        )}
        {children}
        {isSelected && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
            </svg>
        )}
    </div>
);

const LoadingMessage = ({innerProps}) => <div {...innerProps}>Loading...</div>;
const NoOptionsMessage = ({innerProps}) => <div {...innerProps}>No results</div>;

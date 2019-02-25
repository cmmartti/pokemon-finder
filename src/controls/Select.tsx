import React, {useState, useEffect, forwardRef} from 'react';
import Select, {components} from 'react-select';

import styles from './Select.module.scss';
import VariableWidthInput from '../utils/VariableWidthInput';

type Props = {
    value: any;
    onChange: (newValue: any) => any;
    options: any[];
};

type Ref = HTMLElement;

function SingleSelectBase({value, onChange, options, forwardedRef}) {
    return (
        <Select
            ref={forwardedRef}
            value={value}
            options={options}
            onChange={onChange}
            isSearchable={false}
            isClearable={false}
            blurInputOnSelect={false}
            tabSelectsValue={false}
            backspaceRemovesValue={false}
            getOptionValue={getOptionValue}
            getOptionLabel={getOptionLabel}
            placeholder="select…"
            components={{
                SelectContainer,
                IndicatorSeparator: null,
                DropdownIndicator,
                Option,
            }}
            {...styleProps}
        />
    );
}

function SearchSelectBase({value, onChange, options, forwardedRef}) {
    const [relevantOptions, setRelevantOptions] = useState(options);

    function handleInputChange(inputValue, {action}) {
        if (inputValue === '') {
            setRelevantOptions(options);
        } else if (action === 'input-change') {
            const newOptions = filterAndSort(options, normaliseString(inputValue));
            setRelevantOptions(newOptions);
        }
    }

    return (
        <Select
            ref={forwardedRef}
            value={value}
            options={relevantOptions}
            onChange={onChange}
            onInputChange={handleInputChange}
            filterOption={() => true}
            isSearchable
            isClearable={false}
            blurInputOnSelect={false}
            controlShouldRenderValue={false}
            tabSelectsValue={false}
            backspaceRemovesValue={false}
            getOptionValue={getOptionValue}
            getOptionLabel={getOptionLabel}
            placeholder="search…"
            components={{
                SelectContainer,
                Placeholder: () => null,
                Input,
                IndicatorSeparator: null,
                DropdownIndicator,
                Option,
            }}
            {...styleProps}
        />
    );
}

function MultiSelectBase({value, onChange, options, forwardedRef}) {
    const [relevantOptions, setRelevantOptions] = useState(options);

    function handleInputChange(inputValue, {action}) {
        if (inputValue === '') {
            setRelevantOptions(options);
        } else if (action === 'input-change') {
            const newOptions = filterAndSort(options, normaliseString(inputValue));
            setRelevantOptions(newOptions);
        }
    }

    return (
        <Select
            ref={forwardedRef}
            value={value}
            options={relevantOptions}
            onChange={onChange}
            onInputChange={handleInputChange}
            filterOption={() => true}
            isSearchable
            isMulti
            isClearable={false}
            blurInputOnSelect={false}
            hideSelectedOptions={false}
            tabSelectsValue={false}
            getOptionValue={getOptionValue}
            getOptionLabel={getOptionLabel}
            placeholder="search…"
            components={{
                SelectContainer,
                Placeholder: () => null,
                MultiValueRemove,
                Input: PlainInput,
                IndicatorSeparator: null,
                DropdownIndicator,
                Option,
            }}
            {...styleProps}
        />
    );
}

export const SingleSelect = forwardRef<HTMLElement, Props>((props, ref) => (
    <SingleSelectBase forwardedRef={ref} {...props} />
));
export const SearchSelect = forwardRef<HTMLElement, Props>((props, ref) => (
    <SearchSelectBase forwardedRef={ref} {...props} />
));
export const MultiSelect = forwardRef<HTMLElement, Props>((props, ref) => (
    <MultiSelectBase forwardedRef={ref} {...props} />
));

///////////////////////////////////////////////////////////////////////////////
// Common Props

const styleProps = {
    className: styles['select'],
    classNamePrefix: styles['select'],

    // Clear all interfering default styles
    styles: {
        selectContainer: () => ({}),
        control: () => ({}),
        valueContainer: () => ({}),
        placeholder: () => ({}),
        singleValue: () => ({}),
        multiValue: () => ({}),
        multiValueLabel: () => ({}),
        multiValueRemove: () => ({}),
        indicatorSeparator: () => ({}),
        indicatorsContainer: () => ({}),
        dropdownIndicator: () => ({}),
        menu: () => ({}),
        menuList: () => ({}),
        option: () => ({}),
        input: () => ({}),
    },
};

///////////////////////////////////////////////////////////////////////////////
// Functions

function normaliseString(string) {
    return string.trim().toLowerCase();
}

function filterAndSort(options, searchTerm) {
    return (
        options
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
            })
    );
}

function getOptionValue(option) {
    return option.id;
}

function getOptionLabel(option) {
    return option.label;
}

function filterOption({label, value, data}, query) {
    return (
        label.toLowerCase().indexOf(query.toLowerCase()) >= 0 ||
        (data.description &&
            data.description.toLowerCase().indexOf(query.toLowerCase()) >= 0)
    );
}

///////////////////////////////////////////////////////////////////////////////
// Custom Components

const SelectContainer = ({
    children,
    className,
    cx,
    innerProps,
    isDisabled,
    isRtl,
    selectProps,
}) => (
    <div
        className={cx(
            '',
            {
                '--is-disabled': isDisabled,
                '--is-rtl': isRtl,
                '--is-searchable': selectProps.isSearchable,
            },
            className
        )}
        {...innerProps}
    >
        {children}
    </div>
);

const MultiValueRemove = ({...props}) => (
    <components.MultiValueRemove {...props}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
        </svg>
    </components.MultiValueRemove>
);

const DropdownIndicator = ({innerRef, ...props}) => (
    <components.DropdownIndicator ref={innerRef} {...props}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
    </components.DropdownIndicator>
);

const Option = ({children, data, selectProps, ...props}) => {
    const {classNamePrefix} = selectProps;
    return (
        <components.Option {...props}>
            <div>
                <div className={classNamePrefix + '__option-label'}>
                    {getOptionLabel(data)}
                </div>

                {data.description && (
                    <div className={classNamePrefix + '__option-description'}>
                        {data.description}
                    </div>
                )}
            </div>
            {props.isSelected && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                </svg>
            )}
        </components.Option>
    );
};

// const LoadingMessage = ({innerProps}) => <div {...innerProps}>Loading...</div>;
// const NoOptionsMessage = ({innerProps}) => <div {...innerProps}>No results</div>;

function PlainInput({innerRef, isDisabled, selectProps, ...props}) {
    // Discard unused props
    const {cx, getStyles, isHidden, theme, ...inputProps} = props;

    const {classNamePrefix, placeholder, value, isMulti} = selectProps;
    return (
        <VariableWidthInput
            ref={innerRef}
            {...inputProps}
            className={classNamePrefix + '__input'}
            sizerClassName={classNamePrefix + '__input'}
            disabled={isDisabled}
            placeholder={isMulti && !value.length ? placeholder : ''}
        />
    );
}

function Input({innerRef, isDisabled, selectProps, onChange, onBlur, ...props}) {
    // Discard unused props
    const {cx, getStyles, isHidden, theme, ...inputProps} = props;

    const {value, getOptionLabel, classNamePrefix, placeholder, isMulti} = selectProps;

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
            className={classNamePrefix + '__input'}
            sizerClassName={classNamePrefix + '__input'}
            disabled={isDisabled}
            onChange={handleChange}
            onBlur={handleBlur}
            value={inputValue}
            placeholder={isMulti && value && value.length ? '' : placeholder}
        />
    );
}

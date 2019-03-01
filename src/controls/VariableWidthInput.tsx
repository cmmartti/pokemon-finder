import React, {useLayoutEffect, useRef} from 'react';

function VariableWidthInput({
    forwardedRef,
    sizerClassName = '',
    sizerStyle = {},
    ...props
}) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const sizerRef = useRef<HTMLElement | null>(null);

    // Imperatively resize the input element when the 'value' or 'placeholder'
    // props change, using the hidden span as a measuring stick.
    useLayoutEffect(() => {
        if (inputRef.current && sizerRef.current) {
            inputRef.current.style.width = sizerRef.current.offsetWidth + 1 + 'px';
        }
    }, [props.value, props.placeholder]);

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

    return (
        <React.Fragment>
            <input {...props} ref={manageRef} />
            <span
                className={sizerClassName}
                style={{
                    ...sizerStyle,
                    display: 'block',
                    position: 'absolute',
                    left: '-9999px',
                    top: '-9999px',
                    whiteSpace: 'pre',
                }}
                ref={sizerRef}
            >
                {props.value || props.value === 0 ? props.value : props.placeholder}
            </span>
        </React.Fragment>
    );
}

type Props = React.HTMLProps<HTMLInputElement> & {
    sizerClassName?: string;
    sizerStyle?: {};
};

export default React.forwardRef<HTMLElement, Props>((props, ref) => (
    <VariableWidthInput {...props} forwardedRef={ref} />
));

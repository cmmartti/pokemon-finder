import React, {useLayoutEffect, useRef} from 'react';

function VariableWidthInput({
    forwardedRef,
    sizerClassName = '',
    copyStyle = {},
    ...props
}) {
    const inputRef = useRef(null);
    const sizerRef = useRef(null);

    // Imperatively resize the input element when the 'value' or 'placeholder'
    // props change, using the hidden span as a measuring stick.
    useLayoutEffect(() => {
        let width = sizerRef.current.offsetWidth;
        // if (props.type === 'number') {
        //     width += 20;
        // }
        inputRef.current.style.width = width + 1 + 'px';
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
                    ...copyStyle,
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

export default React.forwardRef((props, ref) => (
    <VariableWidthInput {...props} forwardedRef={ref} />
));

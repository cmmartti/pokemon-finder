import React, {useState, useEffect, useRef} from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import Menu from './Menu';
import styles from './SentenceFilter.module.scss';

function MenuButton({innerRef, innerProps, menuIsOpen}) {
    return (
        <button
            className={classNames({
                [styles['menu-button']]: true,
                [styles['open']]: menuIsOpen,
            })}
            aria-label="Add more"
            title="Add more"
            ref={innerRef}
            {...innerProps}
        >
            {menuIsOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM11.4 10l2.83-2.83-1.41-1.41L10 8.59 7.17 5.76 5.76 7.17 8.59 10l-2.83 2.83 1.41 1.41L10 11.41l2.83 2.83 1.41-1.41L11.41 10z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M11 9h4v2h-4v4H9v-4H5V9h4V5h2v4zm-1 11a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
                </svg>
            )}
        </button>
    );
}

/* ************************************************************************************
 * ABOUT SentenceFilter and SentencePart
 *
 * SentenceFilter accepts an object of parameters as a prop, and a list of SentenceParts
 * as children, each of which is associated with a parameter through its 'id' prop.
 * SentenceFilter renders the 'node' prop of that parameter's SentenceParts. 'node' can
 * be either a string or a component that renders an input control of some sort. If it's
 * a component, the parameter object is spread onto it as props. The remaining parameters
 * whose SentenceParts have not been rendered are added to the "Add more" menu.
 *
 * SentencePart itself is a shell component, meaning it has no functionality of its own
 * and serves only as a container to be controlled by SentenceFilter (kind of like a
 * shell corporation). SentenceFilter is able to do this by reaching into its
 * SentenceParts and reading their props. SentencePart is actually just an empty
 * function with some prop types.
 *
 **************************************************************************************/

export default function SentenceFilter({parameters, children, setActive}) {
    const partRefs = useRef({});

    // Try to focus the parameter's main sentence part after it is activated
    const [newParameter, setNewParameter] = useState(null);
    useEffect(() => {
        const element = partRefs.current[newParameter];
        if (element && typeof element.focus === 'function') {
            element.focus();
        }
    }, [newParameter]);

    const sentenceParts = [];
    const menuParameters = [];

    React.Children.forEach(children, part => {
        const {id, text, render, main, fixed} = part.props;

        if (!id) {
            sentenceParts.push(text);
        } //
        else if (parameters[id].active || fixed) {
            if (render) {
                let ref;
                if (main) {
                    ref = element => (partRefs.current[id] = element);
                }
                sentenceParts.push(
                    <React.Fragment key={`${id}_${render.name}`}>
                        {render(ref)}
                    </React.Fragment>
                );
            } else {
                sentenceParts.push(text);
            }
        }

        if (main && !fixed) {
            menuParameters.push({...parameters[id], id});
        }
    });

    menuParameters.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    return (
        <div className={styles['parameter-list']}>
            <div className={styles['sentence']}>{sentenceParts}</div>

            <Menu
                Button={MenuButton}
                className={styles['menu']}
                classNames={{
                    menuItem: styles['menu-item'],
                    list: styles['menu-list'],
                }}
                items={menuParameters.map(parameter => ({
                    id: parameter.id,
                    label: parameter.name,
                    checked: parameter.active,
                    onSelect: isChecked => {
                        setActive(parameter.id, isChecked);
                        if (isChecked) {
                            setNewParameter(parameter.id);
                        }
                    },
                }))}
            />
        </div>
    );
}

SentenceFilter.propTypes = {
    parameters: PropTypes.objectOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            active: PropTypes.bool.isRequired,
        })
    ),
    children: (props, propName, componentName) => {
        React.Children.forEach(props[propName], child => {
            if (child.type !== SentencePart) {
                const type = child.type || typeof child;
                return new Error(
                    `'${componentName}' children should be of type 'Part', not '${type}'.`
                );
            }
        });
    },
};

export const SentencePart = () => null;
SentencePart.propTypes = {
    text: PropTypes.string,
    render: PropTypes.func,
    id: PropTypes.string,
    main: PropTypes.bool,
    keepWithNext: PropTypes.bool,
};
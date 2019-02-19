import React, {useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';

import useOnClickOutside from '../utils/useOnClickOutside';
import styles from './Menu.module.scss';

function DefaultContainer({innerRef, innerProps, children, className = ''}) {
    return (
        <div className={styles['menu'] + ' ' + className} ref={innerRef} {...innerProps}>
            {children}
        </div>
    );
}

function DefaultButton({innerRef, innerProps, label, menuIsOpen, className = ''}) {
    return (
        <button
            className={styles['menu-button'] + ' ' + className}
            ref={innerRef}
            {...innerProps}
        >
            {label}
        </button>
    );
}

function DefaultList({innerProps, children, className = ''}) {
    return (
        <div className={styles['menu-list'] + ' ' + className} {...innerProps}>
            {children}
        </div>
    );
}

function DefaultMenuItem({innerRef, innerProps, id, checked, label, className = ''}) {
    return (
        <button
            className={styles['menu-item'] + ' ' + className}
            ref={innerRef}
            {...innerProps}
        >
            <span className={styles['menu-item-icon']}>
                {checked && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                    </svg>
                )}
            </span>
            {label}
        </button>
    );
}

function Menu({
    label = '',
    items = [],
    Container = DefaultContainer,
    Button = DefaultButton,
    List = DefaultList,
    MenuItem = DefaultMenuItem,
    className = '',
    classNames = {},
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [withKeyboard, setWithKeyboard] = useState(false);

    const menuRef = useRef(null);
    const menuButtonRef = useRef(null);
    const itemRefs = useRef([]);

    useOnClickOutside(menuRef, () => {
        setIsOpen(false);
    });

    function setCurrentIndex(index) {
        itemRefs.current[index].focus();
    }

    // Focus the first menu item each time the menu is opened using the keyboard
    useEffect(() => {
        if (isOpen && withKeyboard) {
            setCurrentIndex(0);
            setWithKeyboard(false);
        }
    }, [isOpen]);

    useEffect(() => {
        function handleKeyDown(event) {
            if (isOpen) {
                const currentIndex = itemRefs.current.findIndex(
                    item => document.activeElement === item
                );
                switch (event.key) {
                    case 'ArrowDown':
                        event.preventDefault();
                        setCurrentIndex((currentIndex + 1) % items.length);
                        break;
                    case 'ArrowUp':
                        event.preventDefault();
                        setCurrentIndex((currentIndex + items.length - 1) % items.length);
                        break;
                    case 'Home':
                        event.preventDefault();
                        setCurrentIndex(0);
                        break;
                    case 'End':
                        event.preventDefault();
                        setCurrentIndex(items.length - 1);
                        break;
                    case 'Escape':
                        event.preventDefault();
                        menuButtonRef.current.focus();
                        setIsOpen(false);
                        break;
                    case 'Tab':
                        setIsOpen(false);
                        break;
                    default:
                        break;
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return function cleanUp() {
            window.removeEventListener('keydown', handleKeyDown);
        };
    });

    function onMenuButtonKeyDown(event) {
        if (event.key === 'Space' || event.key === ' ' || event.key === 'Enter') {
            setWithKeyboard(true);
        }
    }

    return (
        <Container innerRef={menuRef} innerProps={{}} className={className}>
            <Button
                label={label}
                menuIsOpen={isOpen}
                innerRef={menuButtonRef}
                innerProps={{
                    onClick: () => setIsOpen(!isOpen),
                    onKeyDown: onMenuButtonKeyDown,
                    tabIndex: isOpen ? '-1' : '0',
                    disabled: items.length === 0,
                    'aria-haspopup': true,
                    'aria-expanded': isOpen,
                }}
                className={classNames.button}
            />

            {isOpen && (
                <List innerProps={{role: 'menu'}} className={classNames.list}>
                    {items.map(({id, label, checked, onSelect}, i) => (
                        <MenuItem
                            key={id}
                            label={label}
                            checked={checked}
                            innerRef={element => (itemRefs.current[i] = element)}
                            innerProps={{
                                role: 'menuitem',
                                'aria-checked': checked !== undefined ? checked : null,
                                tabIndex: '-1',
                                onClick: () => {
                                    // menuButtonRef.current.focus();
                                    onSelect(!checked);
                                    setIsOpen(false);
                                },
                                onMouseEnter: event => event.target.focus(),
                                onMouseLeave: event => event.target.blur(),
                            }}
                            className={classNames.menuItem}
                        />
                    ))}
                </List>
            )}
        </Container>
    );
}

Menu.propTypes = {
    label: PropTypes.any,
    items: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            label: PropTypes.string,
            onSelect: PropTypes.func,
            checked: PropTypes.bool,
        })
    ),
    Container: PropTypes.func,
    Button: PropTypes.func,
    List: PropTypes.func,
    MenuItem: PropTypes.func,
};

export default Menu;

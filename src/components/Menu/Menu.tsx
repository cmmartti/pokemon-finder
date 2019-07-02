import React, {useState, useEffect, useRef} from 'react';

import useOnClickOutside from '../../utils/useOnClickOutside';
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
                {checked ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                    </svg>
                ) : (
                    <div className={styles['checkbox']} />
                )}
            </span>
            {label}
        </button>
    );
}

type ContainerProps = {
    innerRef: any;
    innerProps: any;
    children: any;
    className?: string;
};
type ButtonProps = {
    innerRef: any;
    innerProps: any;
    className: string;
    label: string;
    menuIsOpen: boolean;
};
type ListProps = {
    innerProps: any;
    children: any;
    className: string;
};
type MenuItemProps = {
    innerRef: any;
    innerProps: any;
    checked: boolean;
    className: string;
    id: string;
    label: string;
};

type Props = {
    label: any;
    items: Item[];
    Container?: (props: ContainerProps) => any;
    Button?: (props: ButtonProps) => any;
    List?: (props: ListProps) => any;
    MenuItem?: (props: MenuItemProps) => any;
    className?: string;
    classNames?: {
        button?: string;
        list?: string;
        menuItem?: string;
    };
};

type Item = {
    id: string;
    label: string;
    onSelect(isChecked: boolean): any;
    checked: boolean;
};

export default function Menu({
    label = '',
    items = [],
    Container = DefaultContainer,
    Button = DefaultButton,
    List = DefaultList,
    MenuItem = DefaultMenuItem,
    className = '',
    classNames = {},
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [withKeyboard, setWithKeyboard] = useState(false);

    const menuRef = useRef<HTMLElement | null>(null);
    const menuButtonRef = useRef<HTMLElement | null>(null);
    const itemRefs = useRef([] as HTMLElement[]);

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
                        if (menuButtonRef.current) menuButtonRef.current.focus();
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
                className={classNames.button || ''}
            />

            {isOpen && (
                <List innerProps={{role: 'menu'}} className={classNames.list || ''}>
                    {items.map(({id, label, checked, onSelect}, i) => (
                        <MenuItem
                            key={id}
                            id={id}
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
                            className={classNames.menuItem || ''}
                        />
                    ))}
                </List>
            )}
        </Container>
    );
}

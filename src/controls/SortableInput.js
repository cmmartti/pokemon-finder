import React, {useState} from 'react';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import classNames from 'classnames';

import styles from './SortableInput.module.scss';

function TrashSVG() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M6 2l2-2h4l2 2h4v2H2V2h4zM3 6h14l-1 14H4L3 6zm5 2v10h1V8H8zm3 0v10h1V8h-1z" />
        </svg>
    );
}

const AddOutlineSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M11 9h4v2h-4v4H9v-4H5V9h4V5h2v4zm-1 11a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
    </svg>
);

const CloseSolidSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM11.4 10l2.83-2.83-1.41-1.41L10 8.59 7.17 5.76 5.76 7.17 8.59 10l-2.83 2.83 1.41 1.41L10 11.41l2.83 2.83 1.41-1.41L11.41 10z" />
    </svg>
);

function Item({index, data, isSelected, Action}) {
    return (
        <Draggable draggableId={data.id} index={index}>
            {(provided, snapshot) => (
                <div
                    className={classNames({
                        [styles['item']]: true,
                        [styles['is-dragging']]: snapshot.isDragging,
                        [styles['over-delete-dropzone']]:
                            snapshot.draggingOver === 'delete',
                    })}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                >
                    <span className={styles['drag-handle']} {...provided.dragHandleProps}>
                        {data.header}
                    </span>
                    {Action && (
                        <Action key={data.id} data={data} isSelected={isSelected} />
                    )}
                </div>
            )}
        </Draggable>
    );
}

export default function SortableInput({
    options,
    value,
    onChange,
    OptionAction,
    themeClassName,
}) {
    const [deleteMode, setDeleteMode] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [menuOptions, setMenuOptions] = useState(
        options.filter(option => !value.map(({id}) => id).includes(option.id))
    );

    function onDragStart(start) {
        if (start.source.droppableId === 'items') {
            setDeleteMode(true);
        }
    }

    function getOption(id) {
        return options.find(option => option.id === id);
    }

    function onDragEnd({destination, source, draggableId}) {
        setDeleteMode(false);

        // Dragged to nowhere
        if (!destination) {
            return;
        }

        // Dragged and returned to same location
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // Dragged to delete dropzone
        if (source.droppableId === 'items' && destination.droppableId === 'delete') {
            // Remove from items
            onChange([
                ...value.slice(0, source.index),
                ...value.slice(source.index + 1, value.length),
            ]);

            // Add to menu
            setMenuOptions([...menuOptions, getOption(draggableId)]);
            return;
        }

        // Util stuff
        let home, foreign;
        if (source.droppableId === 'items') {
            home = value;
            foreign = menuOptions;
        } else if (source.droppableId === 'menu') {
            home = menuOptions;
            foreign = value;
        }
        function set(droppableId, value) {
            if (droppableId === 'menu') {
                setMenuOptions(value);
            } else if (droppableId === 'items') {
                onChange(value);
            }
        }

        // Dragged to another location in same list
        if (destination.droppableId === source.droppableId) {
            const newValue = Array.from(home);
            newValue.splice(source.index, 1);
            newValue.splice(destination.index, 0, getOption(draggableId));
            set(source.droppableId, newValue);
            return;
        }

        // Otherwise dragged to another list

        // Add to foreign
        set(destination.droppableId, [
            ...foreign.slice(0, destination.index),
            getOption(draggableId),
            ...foreign.slice(destination.index, foreign.length),
        ]);

        // Remove from home
        set(source.droppableId, [
            ...home.slice(0, source.index),
            ...home.slice(source.index + 1, home.length),
        ]);
    }

    return (
        <div className={classNames(styles['sortable-input'], themeClassName)}>
            <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                <Droppable droppableId="items" direction="horizontal">
                    {provided => (
                        <div
                            className={classNames({
                                [styles['items-list']]: true,
                            })}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {value.map((item, i) => (
                                <Item
                                    key={item.id}
                                    index={i}
                                    data={item}
                                    isSelected
                                    Action={OptionAction}
                                />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                <Droppable droppableId="delete">
                    {provided =>
                        deleteMode ? (
                            <div
                                className={styles['delete-dropzone']}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                <TrashSVG />
                            </div>
                        ) : (
                            <button
                                className={classNames({
                                    [styles['add-button']]: true,
                                    [styles['open']]: isMenuOpen,
                                })}
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-haspopup
                                aria-expanded={isMenuOpen}
                                title={isMenuOpen ? 'Close' : 'Add more'}
                                aria-label={isMenuOpen ? 'Close' : 'Add more'}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {isMenuOpen ? <CloseSolidSVG /> : <AddOutlineSVG />}
                            </button>
                        )
                    }
                </Droppable>
                {isMenuOpen && (
                    <Droppable droppableId="menu" direction="horizontal">
                        {provided => (
                            <div
                                className={classNames([styles['menu-list']])}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {menuOptions.map((item, i) => (
                                    <Item
                                        key={item.id}
                                        index={i}
                                        data={item}
                                        Action={OptionAction}
                                    />
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                )}
            </DragDropContext>
        </div>
    );
}

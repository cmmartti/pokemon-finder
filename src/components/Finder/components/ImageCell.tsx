import React from 'react';

import styles from './SearchResults.module.scss';

function NoImageSVG() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="44"
            height="44"
            viewBox="0 0 44 44"
        >
            <g transform="translate(-281 -1003)">
                <g
                    transform="translate(281 1003)"
                    fill="#f9f9f9"
                    stroke="#d7d7cf"
                    strokeWidth="3"
                >
                    <rect width="44" height="44" stroke="none" />
                    <rect x="1.5" y="1.5" width="41" height="41" fill="none" />
                </g>
                <rect
                    width="14.127"
                    height="3.532"
                    transform="translate(296.757 1028.746) rotate(-45)"
                    fill="#d7d7cf"
                />
                <rect
                    width="14.127"
                    height="3.532"
                    transform="translate(299.254 1018.757) rotate(45)"
                    fill="#d7d7cf"
                />
            </g>
        </svg>
    );
}

export default function ImageCell({src}) {
    return (
        <span className={styles['wrapper']}>
            {src ? (
                <>
                    <img
                        className={styles['dummy']}
                        src={src}
                        alt=""
                        style={{imageRendering: 'pixelated'}}
                    />
                    <img src={src} alt="" style={{imageRendering: 'pixelated'}} />
                </>
            ) : (
                <>
                    <span className={styles['dummy']}>
                        <NoImageSVG />
                    </span>
                    <span>
                        <NoImageSVG />
                    </span>
                </>
            )}
        </span>
    );
}

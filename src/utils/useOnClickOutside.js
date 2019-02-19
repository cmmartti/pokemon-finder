import {useEffect} from 'react';

export default function useOnClickOutside(ref, effect) {
    useEffect(() => {
        function handleEvent(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                effect();
            }
        }
        window.addEventListener('mousedown', handleEvent);
        window.addEventListener('touchstart', handleEvent);

        return function cleanUp() {
            window.removeEventListener('mousedown', handleEvent);
            window.removeEventListener('touchstart', handleEvent);
        };
    });
}

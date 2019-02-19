/*
   Scroll `scrollContainer` so that `element` comes into view, either to the center
   or the nearest edge of `scrollContainer`. `scrollContainer` must be the
   [offsetParent](https://developer.mozilla.org/en-US/docs/Web/API/HTMLelement/offsetParent)
   of `element` (that is, it must have a CSS position of absolute or relative).
*/
export default function scrollIntoView(scrollContainer, element, {block = 'center'}) {
    const sc = scrollContainer;
    const el = element;

    const above = el.offsetTop < sc.scrollTop;
    const below = el.offsetTop + el.offsetHeight > sc.scrollTop + sc.offsetHeight;

    if (above || below) {
        if (block === 'center') {
            sc.scrollTop = el.offsetTop - (sc.offsetHeight - el.offsetHeight) / 2;
        } //
        else if (block === 'nearest') {
            if (above) {
                sc.scrollTop = el.offsetTop;
            } else {
                sc.scrollTop = el.offsetTop + el.offsetHeight - sc.offsetHeight;
            }
        }
    }
}

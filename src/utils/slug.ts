export function slug(titleStr: string, divider: string = '-'){
    titleStr = titleStr.replace(/^\s+|\s+$/g, '');
    titleStr = titleStr.toLowerCase();
    //persian support
    titleStr = titleStr.replace(/[^a-z0-9_\s-ءاأإآؤئبتثجحخدذرزسشصضطظعغفقكلمنهويةى]#u/, '')
    // Collapse whitespace and replace by -
        .replace(/\s+/g, divider)
        // Collapse dashes
        .replace(/-+/g, divider);
    return titleStr;
}
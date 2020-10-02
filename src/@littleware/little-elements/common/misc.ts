/**
 * Construct list of numbers (start, end] by step -
 * including start, not including end
 * 
 * @param {number} start 
 * @param {number} end 
 * @param {number} step
 * @return {[number]} 
 */
export function range(start:number, end:number, step=1):number[] {
    const result = [];
    if (end > start && step > 0 || end < start && step < 0) {
      for (let i=start; i < end; i += step) {
        result.push(i);
      }
    }
    return result;
}


export function relativeUrl(relativeTo:URL, relativePath:string):string {
    const pathParts = relativeTo.pathname.split(/\/+/).filter(s => !!s);
    const relParts = relativePath.split(/\/+/).filter(s => !!s);

    for (let it of relParts) {
        if (it === '..') {
            pathParts.pop();
        } else if (it !== '.') {
            pathParts.push(it);
        }
    }
    return relativeTo.origin + '/' + pathParts.join('/');
}
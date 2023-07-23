/**
 * Makes the supplied function wait for a couple of seconds till the next execution
 * @param {Function} func The function to debounce
 * @param {number} wait the number of milliseconds to wait till next execution
 * @returns {Function} The debounced function that will `wait` for the next execution
 */


export const debounce = (func: Function, wait: number): Function  => {
  let timeout: ReturnType<typeof setTimeout>
  return  (...args: any[]) => {
    const context=  this
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}
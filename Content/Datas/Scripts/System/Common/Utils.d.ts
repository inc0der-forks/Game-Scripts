/** @class
 *  @static
 *  The static class containing all the utils functions.
 */
declare class Utils {
    constructor();
    /**
     *  Return default value if undefined, else the value.
     *  @static
     *  @param {any} value The value
     *  @param {any} defaultValue The default value
     *  @returns {any}
     */
    static defaultValue<T>(value: T, defaultValue: T): T;
    /** Check if the value is undefined
    *   @static
    *   @param {any} value The value
    *   @returns {boolean}
    */
    static isUndefined(value: any): boolean;
    /** Check if the value is a number
    *   @static
    *   @param {any} value The value
    *   @returns {boolean}
    */
    static isNumber(value: any): boolean;
    /** Check if the value is a string
     *   @static
     *   @param {any} value The value
     *   @returns {boolean}
     */
    static isString(value: any): boolean;
    /** Convert a number to boolean
     *   @static
     *   @param {number} num The number
     *   @returns {boolean}
     */
    static numToBool(num: number): boolean;
    /** Convert a boolean to number
     *   @static
     *   @param {boolean} b The boolean
     *   @returns {number}
     */
    static boolToNum(b: boolean): number;
    /** Convert number to string
     *   @static
     *   @param {number} n The number
     *   @returns {string}
     */
    static numToString(n: number): string;
    /** Try catch for async functions
     *   @static
     *   @param {function} func The async function to apply
     *   @returns {Promise<any>}
     */
    static tryCatch(func: Function, that?: Object): Promise<any>;
    /** Return a string of the date by passing all the seconds
     *   @static
     *   @param {number} total Total number of seconds
     *   @returns {string}
     */
    static getStringDate(total: number): string;
    /** Return the string of a number and parse with 0 according to a given size
     *   @static
     *   @param {number} num Number
     *   @param {number} size Max number to display
     *   @returns {string}
     */
    static formatNumber(num: number, size: number): string;
    /** Create a new array list initialed with null everywhere
     *   @static
     *   @param {number} size The list size
     *   @returns {any[]}
     */
    static fillNullList(size: number): any[];
    /** Link the fontSize and the fontName to a string that can be used by the
    *   canvasHUD
    *   @static
    *   @param {number} fontSize The fontSize
    *   @param {string} fontName The fontName
    *   @param {boolean} bold Indicate if the text is bold
    *   @param {boolean} italic Indicate if the text is italic
    *   @returns {string}
    */
    static createFont: (fontSize: number, fontName: string, bold: boolean, italic: boolean) => string;
    /**
     *  Read a json list and create a System list sorted by ID, index, and
     *  return max ID.
     *  @static
     *  @param {Record<string, any>[]} opts.list The json list to read
     *  @param {any[]} opts.listIDs The list to fill by ID
     *  @param {any[]} opts.listIndexes The list to fill by index
     *  @param {function} opts.func The function to apply
     *  @param {function} opts.cons The function to apply
     *  @returns {number}
     */
    static readJSONSystemList({ list, listIDs, listIndexes, indexesIDs, listHash, cons, func }: {
        list: Record<string, any>[];
        listIDs?: any[];
        listIndexes?: any[];
        indexesIDs?: boolean;
        listHash?: any[];
        cons?: any;
        func?: any;
    }): number;
    /**
     *  Get the number of fields of an object
     *  @static
     *  @param {Object} obj The object to count fields
     *  @returns {number}
     */
    static countFields(obj: Record<string, any>): number;
    /**
     *  Get the index of an object in a array containing a property with a
     *  specific value.
     *  @static
     *  @param {Object[]} array The array to check
     *  @param {string} attr The attribute of the object to check
     *  @param {any} value The value to check on the object attribute
     *  @returns {number}
     */
    static indexOfProp(array: Object[], attr: string, value: any): number;
}
export { Utils };

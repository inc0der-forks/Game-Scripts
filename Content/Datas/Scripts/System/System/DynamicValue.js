/*
    RPG Paper Maker Copyright (C) 2017-2020 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/
import { Enum, Utils } from "../Common";
var DynamicValueKind = Enum.DynamicValueKind;
import { System, Datas } from "..";
import { Stack } from "../Manager";
import { ReactionInterpreter } from "../Core";
/** @class
 *  The class who handle dynamic value.
 *  @extends {System.Base}
 *  @param {Record<string, any>} [json=undefined] Json object describing the value
 */
class DynamicValue extends System.Base {
    constructor(json) {
        super(json);
    }
    /**
     *  Create a new value from kind and value.
     *  @static
     *  @param {DynamicValueKind} [k=DynamicValueKind.None] The kind of value
     *  @param {any} [v=0] The value
     *  @returns {SystemValue}
     */
    static create(k = DynamicValueKind.None, v = 0) {
        let systemValue = new System.DynamicValue();
        systemValue.kind = k;
        switch (k) {
            case DynamicValueKind.None:
                systemValue.value = null;
                break;
            case DynamicValueKind.Message:
                systemValue.value = Utils.numToString(v);
                break;
            case DynamicValueKind.Switch:
                systemValue.value = Utils.numToBool(v);
                break;
            default:
                systemValue.value = v;
                break;
        }
        return systemValue;
    }
    /**
     *  Create a new value from a command and iterator.
     *  @static
     *  @param {any[]} command The list describing the command
     *  @param {StructIterator} iterator The iterator
     *  @returns {System.DynamicValue}
     */
    static createValueCommand(command, iterator) {
        let k = command[iterator.i++];
        let v = command[iterator.i++];
        return System.DynamicValue.create(k, v);
    }
    /**
     *  Create a none value.
     *  @static
     *  @returns {System.DynamicValue}
     */
    static createNone() {
        return System.DynamicValue.create(DynamicValueKind.None, null);
    }
    /**
     *  Create a new value number.
     *  @static
     *  @param {number} n The number
     *  @returns {System.DynamicValue}
     */
    static createNumber(n) {
        return System.DynamicValue.create(DynamicValueKind.Number, n);
    }
    /**
     *  Create a new value message.
     *  @static
     *  @param {string} m The message
     *  @returns {System.DynamicValue}
     */
    static createMessage(m) {
        return System.DynamicValue.create(DynamicValueKind.Message, m);
    }
    /**
     *  Create a new value decimal number.
     *  @static
     *  @param {number} n The number
     *  @returns {System.DynamicValue}
     */
    static createNumberDouble(n) {
        return System.DynamicValue.create(DynamicValueKind.NumberDouble, n);
    }
    /**
     *  Create a new value keyBoard.
     *  @static
     *  @param {number} k The key number
     *  @returns {System.DynamicValue}
     */
    static createKeyBoard(k) {
        return System.DynamicValue.create(DynamicValueKind.KeyBoard, k);
    }
    /**
     *  Create a new value switch.
     *  @static
     *  @param {boolean} b The value of the switch
     *  @returns {System.DynamicValue}
     */
    static createSwitch(b) {
        return System.DynamicValue.create(DynamicValueKind.Switch, Utils.boolToNum(b));
    }
    /**
     *  Create a new value variable.
     *  @static
     *  @param {number} id The variable ID
     *  @returns {System.DynamicValue}
     */
    static createVariable(id) {
        return System.DynamicValue.create(DynamicValueKind.Variable, id);
    }
    /**
     *  Create a new value parameter.
     *  @static
     *  @param {number} id The parameter ID
     *  @returns {System.DynamicValue}
     */
    static createParameter(id) {
        return System.DynamicValue.create(DynamicValueKind.Parameter, id);
    }
    /**
     *  Create a new value property.
     *  @static
     *  @param {number} id The property id
     *  @returns {System.DynamicValue}
     */
    static createProperty(id) {
        return System.DynamicValue.create(DynamicValueKind.Property, id);
    }
    /**
     *  Try to read a number value, if not possible put default value.
     *  @static
     *  @param {StructJSONDynamicValue} json The json value
     *  @param {number} [n=0] The default value
     *  @returns {System.DynamicValue}
     */
    static readOrDefaultNumber(json, n = 0) {
        return Utils.isUndefined(json) ? System.DynamicValue.createNumber(n) :
            System.DynamicValue.readFromJSON(json);
    }
    /**
     *  Try to read a double number value, if not possible put default value.
     *  @static
     *  @param {StructJSONDynamicValue} json The json value
     *  @param {number} [n=0] The default value
     *  @returns {System.DynamicValue}
     */
    static readOrDefaultNumberDouble(json, n = 0) {
        return Utils.isUndefined(json) ? System.DynamicValue.createNumberDouble(n) : System.DynamicValue.readFromJSON(json);
    }
    /**
     *  Try to read a database value, if not possible put default value.
     *  @static
     *  @param {StructJSONDynamicValue} json The json value
     *  @param {number} [id=1] The default value
     *  @returns {System.DynamicValue}
     */
    static readOrDefaultDatabase(json, id = 1) {
        return Utils.isUndefined(json) ? System.DynamicValue.create(DynamicValueKind.DataBase, id) : System.DynamicValue.readFromJSON(json);
    }
    /**
     *  Try to read a message value, if not possible put default value.
     *  @static
     *  @param {StructJSONDynamicValue} json The json value
     *  @param {string} [m=""] The default value
     *  @returns {System.DynamicValue}
     */
    static readOrDefaultMessage(json, m = "") {
        return Utils.isUndefined(json) ? System.DynamicValue.create(DynamicValueKind.Message, m) : System.DynamicValue.readFromJSON(json);
    }
    /**
     *  Try to read a value, if not possible put none value.
     *  @static
     *  @param {StructJSONDynamicValue} json The json value
     *  @returns {System.DynamicValue}
     */
    static readOrNone(json) {
        return Utils.isUndefined(json) ? System.DynamicValue.createNone() :
            System.DynamicValue.readFromJSON(json);
    }
    /**
     *  Read a value of any kind and return it.
     *  @static
     *  @param {StructJSONDynamicValue} json The json value
     *  @returns {System.DynamicValue}
     */
    static readFromJSON(json) {
        let value = new System.DynamicValue();
        value.read(json);
        return value;
    }
    /**
     *  Read the JSON associated to the value
     *  @param {StructJSONDynamicValue} json Json object describing the value
     */
    read(json) {
        this.kind = json.k;
        this.value = json.v;
        switch (this.kind) {
            case DynamicValueKind.CustomStructure:
                this.customStructure = {};
                let jsonList = Utils.defaultValue(json.cs.p, []);
                let parameter, jsonParameter;
                for (let i = 0, l = jsonList.length; i < l; i++) {
                    jsonParameter = jsonList[i];
                    parameter = System.DynamicValue.readOrDefaultNumber(jsonParameter.v);
                    this.customStructure[jsonParameter.name] = parameter;
                }
                break;
            case DynamicValueKind.CustomList:
                this.customList = [];
                Utils.readJSONSystemList({ list: Utils.defaultValue(json.cl.l, []), listIndexes: this.customList, func: (jsonParameter) => {
                        return System.DynamicValue.readOrDefaultNumber(jsonParameter.v);
                    }
                });
                break;
            default:
                break;
        }
    }
    /**
     *  Get the value
     *  @returns {any}
     */
    getValue() {
        switch (this.kind) {
            case DynamicValueKind.Variable:
                return Stack.game.variables[this.value];
            case DynamicValueKind.Parameter:
                return ReactionInterpreter.currentParameters[this.value]
                    .getValue();
            case DynamicValueKind.Property:
                return ReactionInterpreter.currentObject.properties[this.value];
            case DynamicValueKind.CustomStructure:
                return this.customStructure;
            case DynamicValueKind.CustomList:
                return this.customList;
            default:
                return this.value;
        }
    }
    /**
     *  Check if a value is equal to another one
     *  @param {System.DynamicValue} value The value to compare
     *  @returns {boolean}
     */
    isEqual(value) {
        // If keyBoard
        if (this.kind === DynamicValueKind.KeyBoard && value.kind !==
            DynamicValueKind.KeyBoard) {
            return Datas.Keyboards.isKeyEqual(value.value, Datas.Keyboards.get(this.value));
        }
        else if (value.kind === DynamicValueKind.KeyBoard && this.kind !==
            DynamicValueKind.KeyBoard) {
            return Datas.Keyboards.isKeyEqual(this.value, Datas.Keyboards.get(value.value));
        }
        else if (this.kind === DynamicValueKind.Anything || value.kind ===
            DynamicValueKind.Anything) {
            return true;
        }
        // If any other value, compare the direct values
        return this.getValue() === value.getValue();
    }
}
export { DynamicValue };

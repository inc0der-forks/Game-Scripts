/*
    RPG Paper Maker Copyright (C) 2017-2020 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

// -------------------------------------------------------
//
//  CLASS EventCommandStartBattle
//
// -------------------------------------------------------

/** @class
*   An event command for battle processing.
*   @property {boolean} isDirectNode Indicates if this node is directly
*   going to the next node (takes only one frame).
*   @property {boolean} canEscape Boolean indicating if the player can escape
*   this battle.
*   @property {boolean} canGameOver Boolean indicating if there a win/lose node
*   or not.
*   @property {JSON} command Direct JSON command to parse.
*   @param {JSON} command Direct JSON command to parse.
*/
function EventCommandStartBattle(command){
    var i = 0, type, k, v;

    this.battleMapID = null;
    this.idMap = null;
    this.x = null;
    this.y = null;
    this.yPlus = null;
    this.z = null;

    // Options
    this.canEscape = command[i++] === 1;
    this.canGameOver = command[i++] === 1;

    // Troop
    type = command[i++];
    switch(type){
    case 0: // Existing troop ID
        k = command[i++];
        v = command[i++];
        this.troopID = SystemValue.create(k, v);
        break;
    case 1: // If random troop in map properties
        // TODO
    }

    // Battle map
    type = command[i++];
    switch(type){
    case 0: // Existing battle map ID
        k = command[i++];
        v = command[i++];
        this.battleMapID = SystemValue.create(k, v);
        break;
    case 1: // Select
        this.idMap = SystemValue.createNumber(command[i++]);
        this.x = SystemValue.createNumber(command[i++]);
        this.y = SystemValue.createNumber(command[i++]);
        this.yPlus = SystemValue.createNumber(command[i++]);
        this.z = SystemValue.createNumber(command[i++]);
        break;
    case 2: // Numbers
        k = command[i++];
        v = command[i++];
        this.idMap = SystemValue.create(k, v);
        k = command[i++];
        v = command[i++];
        this.x = SystemValue.create(k, v);
        k = command[i++];
        v = command[i++];
        this.y = SystemValue.create(k, v);
        k = command[i++];
        v = command[i++];
        this.yPlus = SystemValue.create(k, v);
        k = command[i++];
        v = command[i++];
        this.z = SystemValue.create(k, v);
        break;
    }

    // Transition
    this.transitionStart = command[i++];
    if (this.transitionStart === 1) {
        k = command[i++];
        v = command[i++];
        this.transitionStartColor = SystemValue.create(k, v);
    }
    this.transitionEnd = command[i++];
    if (this.transitionEnd === 1) {
        k = command[i++];
        v = command[i++];
        this.transitionEndColor = SystemValue.create(k, v);
    }

    this.isDirectNode = false;
    this.parallel = false;
}

EventCommandStartBattle.prototype = {

    /** Initialize the current state.
    *   @returns {Object} The current state (sceneBattle).
    */
    initialize: function(){
        return {
            mapScene: null,
            sceneBattle: null
        };
    },

    // -------------------------------------------------------

    /** Parsing and starting a battle scene.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The current object reacting.
    *   @param {number} state The state ID.
    *   @returns {number} The number of node to pass.
    */
    update: function(currentState, object, state) {

        // Initializing battle
        if (currentState.sceneBattle === null) {
            var battleMap = (this.battleMapID === null) ? SystemBattleMap.create
                (this.idMap.getValue(), [this.x.getValue(), this.y.getValue(), 
                this.yPlus.getValue(), this.z.getValue()]) : RPM.datasGame
                .battleSystem.battleMaps[this.battleMapID.getValue()];
            RPM.game.heroBattle = {
                position: RPM.positionToVector3(battleMap.position)
            };

            // Defining the battle state instance
            var sceneBattle = new SceneBattle(this.troopID.getValue(),
                this.canGameOver, this.canEscape, battleMap,
                this.transitionStart, this.transitionEnd, this
                .transitionStartColor ? RPM.datasGame.system.colors
                [this.transitionStartColor.getValue()] : null, this
                .transitionEndColor ? RPM.datasGame.system.colors[this
                .transitionEndColor.getValue()] : null);
            
            // Keep instance of battle state for results
            currentState.sceneBattle = sceneBattle;
            currentState.mapScene = RPM.gameStack.top;
            RPM.gameStack.push(sceneBattle);

            return 0; // Stay on this command as soon as we are in battle state
        }

        var result = 1;
        // If there are not game overs, go to win/lose nodes
        if (!this.canGameOver) {
            if (!currentState.sceneBattle.winning) {
                result = 2;
            }
        }

        return result;
    },

    // -------------------------------------------------------

    onKeyPressed: function(currentState, key){},
    onKeyReleased: function(currentState, key){},
    onKeyPressedRepeat: function(currentState, key){ return true; },
    onKeyPressedAndRepeat: function(currentState, key){},
    drawHUD: function(currentState){}
}

// -------------------------------------------------------
//
//  CLASS EventCommandIfWin
//
// -------------------------------------------------------

/** @class
*   An event command for after a battle winning.
*   @property {boolean} isDirectNode Indicates if this node is directly
*   going to the next node (takes only one frame).
*   @param {JSON} command Direct JSON command to parse.
*/
function EventCommandIfWin(command){
    this.isDirectNode = true;
    this.parallel = false;
}

EventCommandIfWin.prototype = {
    initialize: function(){ return null; },

    /** Go inside the ifWin node.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The current object reacting.
    *   @param {number} state The state ID.
    *   @returns {number} The number of node to pass.
    */
    update: function(currentState, object, state){
        return -1;
    },

    // -------------------------------------------------------

    /** Returns the number of node to pass.
    *   @returns {number}
    */
    goToNextCommand : function(){
        return 3;
    },

    // -------------------------------------------------------

    onKeyPressed: function(currentState, key){},
    onKeyReleased: function(currentState, key){},
    onKeyPressedRepeat: function(currentState, key){ return true; },
    onKeyPressedAndRepeat: function(currentState, key){},
    drawHUD: function(currentState){}
}

// -------------------------------------------------------
//
//  CLASS EventCommandIfLose
//
// -------------------------------------------------------

/** @class
*   An event command for after a battle winning.
*   @property {boolean} isDirectNode Indicates if this node is directly
*   going to the next node (takes only one frame).
*   @param {JSON} command Direct JSON command to parse.
*/
function EventCommandIfLose(command){
    this.isDirectNode = true;
    this.parallel = false;
}

EventCommandIfLose.prototype = {
    initialize: function(){ return null; },

    /** Go inside the ifLose node.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The current object reacting.
    *   @param {number} state The state ID.
    *   @returns {number} The number of node to pass.
    */
    update: function(currentState, object, state){
        return -1;
    },

    // -------------------------------------------------------

    /** Returns the number of node to pass.
    *   @returns {number}
    */
    goToNextCommand : function(){
        return 2;
    },

    // -------------------------------------------------------

    onKeyPressed: function(currentState, key){},
    onKeyReleased: function(currentState, key){},
    onKeyPressedRepeat: function(currentState, key){ return true; },
    onKeyPressedAndRepeat: function(currentState, key){},
    drawHUD: function(currentState){}
}

// -------------------------------------------------------
//
//  CLASS EventCommandChangeState
//
// -------------------------------------------------------

/** @class
*   An event command for changing an object state.
*   @property {boolean} isDirectNode Indicates if this node is directly
*   going to the next node (takes only one frame).
*   @property {number} idState The ID of the state to change.
*   @property {number} operationKind Index of operation.
*   @param {JSON} command Direct JSON command to parse.
*/
function EventCommandChangeState(command)
{
    EventCommand.call(this, command);
    var iterator = {
        i: 0
    }
    this.mapID = SystemValue.createValueCommand(command, iterator);
    this.objectID = SystemValue.createValueCommand(command, iterator);
    this.idState = SystemValue.createValueCommand(command, iterator);
    this.operationKind = command[iterator.i++];

    this.isDirectNode = true;
    this.parallel = false;
}

/** Add a state to an object.
*   @static
*   @param {Object} portionDatas Datas inside a portion.
*   @param {number} index Index in the portion datas.
*   @param {number} state ID of the state.
*/
EventCommandChangeState.addState = function(portionDatas, index, state){
    var states = portionDatas.s[index];

    if (states.indexOf(state) === -1)
        states.push(state);

    EventCommandChangeState.removeFromDatas(portionDatas, index, states);
}

// -------------------------------------------------------

/** Remove a state from an object.
*   @static
*   @param {Object} portionDatas Datas inside a portion.
*   @param {number} index Index in the portion datas.
*   @param {number} state ID of the state.
*/
EventCommandChangeState.removeState = function(portionDatas, index, state){
    var states = portionDatas.s[index];

    var indexState = states.indexOf(state);
    if (states.indexOf(state) !== -1)
        states.splice(indexState, 1);

    EventCommandChangeState.removeFromDatas(portionDatas, index, states);
}

// -------------------------------------------------------

/** Remove all the states from an object.
*   @static
*   @param {Object} portionDatas Datas inside a portion.
*   @param {number} index Index in the portion datas.
*   @param {number} state ID of the state.
*/
EventCommandChangeState.removeAll = function(portionDatas, index){
    portionDatas.s[index] = [];
}

// -------------------------------------------------------

/** Remove states from datas.
*   @static
*   @param {Object} portionDatas Datas inside a portion.
*   @param {number} index Index in the portion datas.
*   @param {number} state ID of the state.
*/
EventCommandChangeState.removeFromDatas = function(portionDatas, index, states){
    if (states.length === 1 && states[0] === 1){
        portionDatas.si.splice(index, 1);
        portionDatas.s.splice(index, 1);
    }
}

// -------------------------------------------------------

EventCommandChangeState.addStateSpecial = function(states, state) {
    if (states.indexOf(state) === -1) {
        states.push(state);
    }
}

// -------------------------------------------------------

EventCommandChangeState.removeStateSpecial = function(states, state) {
    var indexState;

    indexState = states.indexOf(state);
    if (states.indexOf(state) !== -1) {
        states.splice(indexState, 1);
    }
}

// -------------------------------------------------------

EventCommandChangeState.prototype = {

    initialize: function()
    { 
        return {
            map: null,
            object: null,
            mapID: this.mapID.getValue(),
            objectID: this.objectID.getValue()
        }; 
    },

    /** Change the state of the object and finish.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The current object reacting.
    *   @param {number} state The state ID.
    *   @returns {number} The number of node to pass.
    */
    update: function(currentState, object, state) 
    {
        if (!currentState.waitingObject) {
            if (currentState.map === null)
            {
                if (currentState.mapID === -1 || currentState.mapID === RPM
                    .currentMap.id || currentState.objectID === -1)
                {
                    currentState.map = RPM.currentMap;
                } else
                {
                    currentState.map = new SceneMap(currentState.mapID, false, 
                        true);
                    currentState.map.readMapProperties();
                    currentState.map.initializeObjects();
                }
            }
            if (currentState.map.allObjects && currentState.map
                .portionsObjectsUpdated)
            {
                if (currentState.map === RPM.currentMap)
                {
                    MapObject.updateObjectWithID(object, currentState.objectID, 
                        this, function(moved)
                    {
                        currentState.object = moved;
                    });
                } else
                {
                    currentState.object = {};
                }
                currentState.waitingObject = true;
            }
        }
        if (currentState.waitingObject && currentState.object !== null) 
        {
            if (currentState.object.isHero || currentState.object.isStartup) 
            {
                var states = currentState.object.isHero ? RPM.game.heroStates : 
                    RPM.game.startupStates[RPM.currentMap.id];
                switch (this.operationKind) {
                case 0: // Replacing
                    if (currentState.object.isHero) {
                        RPM.game.heroStates = [];
                    } else {
                        RPM.game.startupStates[RPM.currentMap.id] = [];
                    }
                    states = currentState.object.isHero ? RPM.game.heroStates : 
                        RPM.game.startupStates[RPM.currentMap.id];
                    EventCommandChangeState.addStateSpecial(states, this.idState
                        .getValue());
                    break;
                case 1: // Adding
                    EventCommandChangeState.addStateSpecial(states, this.idState
                        .getValue());
                    break;
                case 2: // Deleting
                    EventCommandChangeState.removeStateSpecial(states, this
                        .idState.getValue());
                    break;
                }
            } else {
                let objectID = currentState.objectID === -1 ? object.system.id : 
                    currentState.objectID;
                var portion = SceneMap.getGlobalPortion(currentState.map
                    .allObjects[objectID]);
                var portionDatas = RPM.game.getPotionsDatas(currentState.map.id,
                    portion[0],portion[1],portion[2]);
                var indexState = portionDatas.si.indexOf(objectID);
                if (indexState === -1){
                    indexState = portionDatas.si.length;
                    portionDatas.si.push(objectID);
                    portionDatas.s.push([1]);
                }
    
                switch (this.operationKind) {
                case 0: // Replacing
                    EventCommandChangeState.removeAll(portionDatas, indexState);
                    EventCommandChangeState.addState(portionDatas, indexState,
                                                        this.idState.getValue());
                    break;
                case 1: // Adding
                    EventCommandChangeState.addState(portionDatas, indexState,
                                                        this.idState.getValue());
                    break;
                case 2: // Deleting
                    EventCommandChangeState.removeState(portionDatas, indexState,
                                                        this.idState.getValue());
                    break;
                }
            }
            if (currentState.map === RPM.currentMap)
            {
                currentState.object.changeState();
            }
            return 1;
        }
        return 0;
    },

    // -------------------------------------------------------

    onKeyPressed: function(currentState, key){},
    onKeyReleased: function(currentState, key){},
    onKeyPressedRepeat: function(currentState, key){ return true; },
    onKeyPressedAndRepeat: function(currentState, key){},
    drawHUD: function(currentState){}
}

// -------------------------------------------------------
//
//  CLASS EventCommandSendEvent
//
// -------------------------------------------------------

/** @class
*   An event command for sending an event.
*   @property {boolean} isDirectNode Indicates if this node is directly
*   going to the next node (takes only one frame).
*   @property {number} targetKind The kind of target.
*   @property {number} idTarget ID of target.
*   @property {boolean} isSystem Boolean indicating if it is an event system.
*   @property {number} eventId ID of the event.
*   @property {SystemParameter[]} parameters List of all the parameters.
*   @param {JSON} command Direct JSON command to parse.
*/
function EventCommandSendEvent(command) {
    var i, j, l, k, v;

    // Target
    i = 0;
    l = command.length;
    this.targetKind = command[i++];
    this.senderNoReceiver = false;
    switch (this.targetKind) {
    case 1:
        k = command[i++];
        v = command[i++];
        this.idTarget = SystemValue.create(k, v);
        this.senderNoReceiver = command[i++] === 1;
        break;
    case 2:
        k = command[i++];
        v = command[i++];
        this.idTarget = SystemValue.create(k, v);
        break;
    }

    this.isSystem = command[i++] === 0;
    this.eventId = command[i++];

    // Parameters
    var events = this.isSystem ? RPM.datasGame.commonEvents.eventsSystem :
                                 RPM.datasGame.commonEvents.eventsUser;
    var parameters = events[this.eventId].parameters;
    this.parameters = [];
    while (i < l) {
        var parameter;
        var paramID = command[i++];
        k = command[i++];

        if (k <= PrimitiveValueKind.Default) {
            // If default value
            if (k === PrimitiveValueKind.Default) {
                parameter = parameters[paramID].value;
            } else {
                parameter = SystemValue.create(k, null);
            }
        } else {
            v = command[i++];
            parameter = SystemValue.create(k, v);
        }
        this.parameters[paramID] = parameter;
    }

    this.isDirectNode = true;
    this.parallel = false;
}

// -------------------------------------------------------

/** Send an event.
*   @static
*   @param {MapObject} sender The sender of this event.
*   @param {number} targetKind The kind of target.
*   @param {number} idTarget ID of target.
*   @param {boolean} isSystem Boolean indicating if it is an event system.
*   @param {number} eventId ID of the event.
*   @param {SystemParameter[]} parameters List of all the parameters.
*/
EventCommandSendEvent.sendEvent = function(sender, targetKind, idTarget,
                                           isSystem, idEvent, parameters,
                                           senderNoReceiver)
{
    switch (targetKind) {
    case 0: // Send to all
        EventCommandSendEvent.sendEventDetection(sender, -1, isSystem, idEvent,
            parameters);
        break;
    case 1: // Send to detection
        EventCommandSendEvent.sendEventDetection(sender, idTarget, isSystem,
            idEvent, parameters, senderNoReceiver);
        break;
    case 2: // Send to a particular object
        if (idTarget === -1) {
            // Send to sender
            sender.receiveEvent(sender, isSystem, idEvent, parameters, sender
                .states);
        } else if (idTarget === 0) {
            // Send to the hero
            RPM.game.hero.receiveEvent(sender, isSystem, idEvent, parameters, RPM.game
                .heroStates);
        } else {
            RPM.currentMap.updatePortions(this, function(x, y, z, i, j, k) {
                var a, l, objects, object, mapPortion;

                objects = RPM.game.getPotionsDatas(RPM.currentMap.id, x, y, z);

                // Moved objects
                for (a = 0, l = objects.min.length; a < l; a++) {
                    object = objects.min[a];
                    if (object.system.id === idTarget) {
                        object.receiveEvent(sender, isSystem, idEvent,
                            parameters, object.states);
                        break;
                    }
                }
                for (a = 0, l = objects.mout.length; a < l; a++) {
                    object = objects.mout[a];
                    if (object.system.id === idTarget) {
                        object.receiveEvent(sender, isSystem, idEvent,
                            parameters, object.states);
                        break;
                    }
                }

                // Static
                mapPortion = RPM.currentMap.getMapPortion(i, j, k);
                if (mapPortion) {
                    for (a = 0, l = mapPortion.objectsList.length; a < l; a++) {
                        object = mapPortion.objectsList[a];
                        if (object.system.id === idTarget) {
                            object.receiveEvent(sender, isSystem, idEvent,
                                parameters, object.states);
                            break;
                        }
                    }
                    if (mapPortion.heroID === idTarget) {
                        RPM.game.hero.receiveEvent(sender, isSystem, idEvent,
                            parameters, RPM.game.heroStates);
                    }
                }
            });
        }
        break;
    }
}

// -------------------------------------------------------

EventCommandSendEvent.sendEventDetection = function(
    sender, idTarget, isSystem, idEvent, parameters, senderNoReceiver)
{
    var objects;

    RPM.currentMap.updatePortions(this, function(x, y, z, i, j, k) {
        objects = RPM.game.getPotionsDatas(RPM.currentMap.id, x, y, z);

        // Moved objects
        EventCommandSendEvent.sendEventObjects(objects.min, objects,
                                              sender, idTarget, isSystem,
                                              idEvent, parameters, senderNoReceiver);
        EventCommandSendEvent.sendEventObjects(objects.mout, objects, sender,
                                              idTarget, isSystem, idEvent,
                                              parameters, senderNoReceiver);

        // Static
        var mapPortion = RPM.currentMap.getMapPortion(i, j, k);
        if (mapPortion) {
            EventCommandSendEvent.sendEventObjects(mapPortion.objectsList,
                                                  objects, sender, idTarget,
                                                  isSystem, idEvent,
                                                  parameters, senderNoReceiver);
        }
    });

    // And the hero!
    if (!senderNoReceiver || sender !== RPM.game.hero) {
        if (idTarget !== -1) {
            // Check according to detection model
            if (!RPM.datasGame.system.detections[idTarget].checkCollision(sender,
                RPM.game.hero))
            {
                return;
            }
        }

        RPM.game.hero.receiveEvent(sender, isSystem, idEvent, parameters, RPM.game
            .heroStates);
    }
}

// -------------------------------------------------------

EventCommandSendEvent.sendEventObjects = function(
    objects, portionDatas, sender, idTarget, isSystem, idEvent, parameters, senderNoReceiver)
{
    var i, l, object, indexState, posObject, test, detection, pos,
        boundingBox;
    if (sender !== null)
        pos = sender.position;

    for (i = 0, l = objects.length; i < l; i++) {
        object = objects[i];
        if (senderNoReceiver && sender === object) {
            continue;
        }

        if (idTarget !== -1) {
            // Check according to detection model
            if (!RPM.datasGame.system.detections[idTarget].checkCollision(sender,
                object))
            {
                continue;
            }
        }

        // Make the object receive the event
        object.receiveEvent(sender, isSystem, idEvent, parameters, object.states);
    }
}

EventCommandSendEvent.prototype = {

    initialize: function(){ return null; },

    /** Send the event and finish.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The current object reacting.
    *   @param {number} state The state ID.
    *   @returns {number} The number of node to pass.
    */
    update: function(currentState, object, state){
        EventCommandSendEvent.sendEvent(object, this.targetKind, this.idTarget
            .getValue(), this.isSystem, this.eventId, this.parameters, this
            .senderNoReceiver);

        return 1;
    },

    // -------------------------------------------------------

    onKeyPressed: function(currentState, key){},
    onKeyReleased: function(currentState, key){},
    onKeyPressedRepeat: function(currentState, key){ return true; },
    onKeyPressedAndRepeat: function(currentState, key){},
    drawHUD: function(currentState){}
}

// -------------------------------------------------------
//
//  CLASS EventCommandTeleportObject
//
// -------------------------------------------------------

/** @class
*   An event command for teleporting an object.
*   @property {boolean} isDirectNode Indicates if this node is directly
*   going to the next node (takes only one frame).
*   @property {number} objectID The ID of the object to teleport.
*   @property {number} idMap The ID of the map.
*   @property {number} x The x coordinate of the map.
*   @property {number} y The y coordinate of the map.
*   @property {number} yPlus The y plus coordinate of the map.
*   @property {number} z The z coordinate of the map.
*   @property {number} objectIDPosition The ID of the object to teleport on.
*   @param {JSON} command Direct JSON command to parse.
*/
function EventCommandTeleportObject(command){
    var i = 0, k, v;

    // Object ID
    k = command[i++];
    v = command[i++];
    this.objectID = SystemValue.create(k, v);

    // Position
    this.objectIDPosition = null;
    this.idMap = null;
    switch (command[i++]){
    case 0:
        this.idMap = SystemValue.createNumber(command[i++]);
        this.x = SystemValue.createNumber(command[i++]);
        this.y = SystemValue.createNumber(command[i++]);
        this.yPlus = SystemValue.createNumber(command[i++]);
        this.z = SystemValue.createNumber(command[i++]);
        break;
    case 1:
        k = command[i++];
        v = command[i++];
        this.idMap = SystemValue.create(k, v);
        k = command[i++];
        v = command[i++];
        this.x = SystemValue.create(k, v);
        k = command[i++];
        v = command[i++];
        this.y = SystemValue.create(k, v);
        k = command[i++];
        v = command[i++];
        this.yPlus = SystemValue.create(k, v);
        k = command[i++];
        v = command[i++];
        this.z = SystemValue.create(k, v);
        break;
    case 2:
        k = command[i++];
        v = command[i++];
        this.objectIDPosition = SystemValue.create(k, v);
        break;
    }

    // Options
    // TODO

    this.isDirectNode = false;
    this.parallel = false;
}

EventCommandTeleportObject.prototype = {

    /** Initialize the current state.
    *   @returns {Object} The current state (waitingFileRead, teleported).
    */
    initialize: function(){
        return {
            position: null,
            waitingPosition: false,
            waitingObject: false,
            teleported: false
        }
    },

    /** Teleport the object.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The current object reacting.
    *   @param {number} state The state ID.
    *   @returns {number} The number of node to pass.
    */
    update: function(currentState, object, state){

        if (!currentState.waitingObject){
            var objectID = this.objectID.getValue();

            if (!currentState.waitingPosition){

                // Set object's position
                if (this.objectIDPosition === null){
                    currentState.position = RPM.positionToVector3(
                        [
                            this.x.getValue(),
                            this.y.getValue(),
                            this.yPlus.getValue(),
                            this.z.getValue()
                        ]
                    );
                }
                else {
                    var objectIDPosition = this.objectIDPosition.getValue();
                    MapObject.updateObjectWithID(object, objectIDPosition,
                                                 this, function(moved)
                    {
                        currentState.position = moved.position;
                    });
                }

                currentState.waitingPosition = true;
            }

            if (currentState.position !== null){
                // Teleport
                MapObject.updateObjectWithID(object, objectID, this,
                                             function(moved)
                {
                    // If needs teleport hero in another map
                    if (this.idMap !== null){
                        var id = this.idMap.getValue();

                        // If hero set the current map
                        if (moved.isHero) {
                            RPM.game.hero.position = currentState.position;
                            if (RPM.currentMap.id !== id) {
                                let map = new SceneMap(id);
                                map.reactionInterpreters.push(RPM
                                    .currentReaction);
                                RPM.gameStack.replace(map);
                            } else {
                                RPM.currentMap.loadPortions(true);
                            }
                        }
                    }
                    moved.teleport(currentState.position);
                    currentState.teleported = true;
                });

                currentState.waitingObject = true;
            }
        }

        return currentState.teleported ? 1 : 0;
    },

    // -------------------------------------------------------

    onKeyPressed: function(currentState, key){},
    onKeyReleased: function(currentState, key){},
    onKeyPressedRepeat: function(currentState, key){ return true; },
    onKeyPressedAndRepeat: function(currentState, key){},
    drawHUD: function(currentState){}
}

// -------------------------------------------------------

/** @class
*   An event command for moving object.
*   @property {boolean} isDirectNode Indicates if this node is directly
*   going to the next node (takes only one frame).
*   @property {number} objectID The ID of the object.
*   @property {boolean} isIgnore Ignore a move if impossible.
*   @property {boolean} isWaitEnd Wait then of all the moves to end the command
*   (parallel command).
*   @property {boolean} isCameraOrientation Take the orientation of the came in
*   count.
*   @property {function[]} moves All the moves callbacks.
*   @property {Object[]} parameters Parameters for ach moves callbacks.
*   @param {JSON} command Direct JSON command to parse.
*/
function EventCommandMoveObject(command) {
    var i = 0, l = command.length;

    // Object ID
    var k = command[i++];
    var v = command[i++];
    this.objectID = SystemValue.create(k, v);

    // Options
    this.isIgnore = command[i++] === 1;
    this.isWaitEnd = command[i++] === 1;
    this.isCameraOrientation = command[i++] === 1;

    // List of move commands
    this.moves = [];
    this.parameters = [];
    let permanent;
    while (i < l)
    {
        this.kind = command[i++];
        if (this.kind >= CommandMoveKind.MoveNorth && this.kind <= 
            CommandMoveKind.MoveBack)
        {
            this.parameters.push({ square: command[i++] === 0 });
            switch (this.kind)
            {
            case CommandMoveKind.MoveNorth:
                this.moves.push(this.moveNorth);
                break;
            case CommandMoveKind.MoveSouth:
                this.moves.push(this.moveSouth);
                break;
            case CommandMoveKind.MoveWest:
                this.moves.push(this.moveWest);
                break;
            case CommandMoveKind.MoveEast:
                this.moves.push(this.moveEast);
                break;
            case CommandMoveKind.MoveNorthWest:
                this.moves.push(this.moveNorthWest);
                break;
            case CommandMoveKind.MoveNorthEast:
                this.moves.push(this.moveNorthEast);
                break;
            case CommandMoveKind.MoveSouthWest:
                this.moves.push(this.moveSouthWest);
                break;
            case CommandMoveKind.MoveSouthEast:
                this.moves.push(this.moveSouthEast);
                break;
            case CommandMoveKind.MoveRandom:
                this.moves.push(this.moveRandom);
                break;
            case CommandMoveKind.MoveHero:
                this.moves.push(this.moveHero);
                break;
            case CommandMoveKind.MoveOppositeHero:
                this.moves.push(this.moveOppositeHero);
                break;
            case CommandMoveKind.MoveFront:
                this.moves.push(this.moveFront);
                break;
            case CommandMoveKind.MoveBack:
                this.moves.push(this.moveBack);
                break;
            }
        }
        if (this.kind === CommandMoveKind.ChangeGraphics)
        {
            permanent = RPM.numToBool(command[i++]);
            var k = command[i++];
            var v = command[i++];
            let pictureID = SystemValue.create(k, v);
            let indexX = command[i++];
            let indexY = command[i++];
            let width = command[i++];
            let height = command[i++];
            this.parameters.push({ permanent: permanent, pictureID: pictureID, 
                indexX: indexX, indexY: indexY, width: width, height: height});
            this.moves.push(this.changeGraphics);
        }
    }

    this.isDirectNode = !this.isWaitEnd;
    this.parallel = !this.isWaitEnd;
}

EventCommandMoveObject.oppositeOrientation = function(orientation) {
    switch (orientation) {
    case Orientation.South:
        return Orientation.North;
    case Orientation.West:
        return Orientation.East;
    case Orientation.North:
        return Orientation.South;
    case Orientation.East:
        return Orientation.West;
    }
}

EventCommandMoveObject.prototype = {

    /** Initialize the current state.
    *   @returns {Object} The current state (position, distance).
    */
    initialize: function() {
        return {
            parallel: this.isWaitEnd,
            index: 0,
            distance: 0,
            normalDistance: 0,
            position: null,
            waitingPosition: false,
            moved: false,
            object: null,
            random: RPM.random(0, 3),
            moveHeroOrientation: null,
            pause: false
        }
    },

    // -------------------------------------------------------

    /** Function to move north.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The object to move.
    *   @param {bool} square Indicate if it is a square move.
    *   @param {Orientation} orientation The orientation where to move.
    */
    move: function(currentState, object, square, orientation) {
        if (object.moveFrequencyTick > 0) {
            return false;
        }

        var angle = this.isCameraOrientation ?
                    RPM.currentMap.camera.horizontalAngle : -90.0;

        if (currentState.position === null && square) {
            var position;

            position = object.position;
            currentState.position = object.getFuturPosition(orientation,
                RPM.SQUARE_SIZE, angle);
            if (position.equals(currentState.position)) {
                if (this.isIgnore)
                {
                    currentState.position = null;
                    object.moving = true;
                    return false;
                }
                object.move(orientation, 0, angle, this.isCameraOrientation);
                this.moveFrequency(object);
                return true;
            }
        }
        if (object.previousMoveCommand === null && object.previousOrientation
            === null)
        {
            object.previousMoveCommand = this;
            object.previousOrientation = orientation;
        } else if (object.previousMoveCommand === this) {
            if (object.otherMoveCommand) {
                this.moveFrequency(object);
                return true;
            }
        } else if (object.previousMoveCommand && object.otherMoveCommand &&
            object.otherMoveCommand !== this)
        {
            this.moveFrequency(object);
            return true;
        } else if (object.previousMoveCommand !== this) {
            object.otherMoveCommand = this;
        }

        var distances = object.move(orientation, RPM.SQUARE_SIZE - currentState
            .distance, angle, this.isCameraOrientation);
        currentState.distance += distances[0];
        currentState.normalDistance += distances[1];
        if (!square || (square && currentState.normalDistance >= RPM.SQUARE_SIZE
            ) || (square && currentState.distance >= RPM.SQUARE_SIZE
            || (distances[0] === 0)))
        {
            if (this.isIgnore && distances[0] === 0)
            {
                currentState.position = null;
                object.moving = true;
                return false;
            }
            if (square && currentState.distance === currentState.normalDistance)
            {
                object.position = currentState.position;
            }

            object.previousOrientation = null;
            object.previousMoveCommand = null;
            object.otherMoveCommand = null;

            this.moveFrequency(object);
            return true;
        }

        return false;
    },

    // -------------------------------------------------------

    moveFrequency: function(object) {
        object.moveFrequencyTick = object.frequency.getValue() * 1000;
    },

    // -------------------------------------------------------

    /** Function to move north.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The object to move.
    *   @param {Object} parameters The parameters.
    */
    moveNorth: function(currentState, object, parameters){
        return object ? this.move(currentState, object, parameters.square,
            Orientation.North) : Orientation.North;
    },

    // -------------------------------------------------------

    /** Function to move south.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The object to move.
    *   @param {Object} parameters The parameters.
    */
    moveSouth: function(currentState, object, parameters){
        return object ? this.move(currentState, object, parameters.square,
            Orientation.South) : Orientation.South;
    },

    // -------------------------------------------------------

    /** Function to move west.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The object to move.
    *   @param {Object} parameters The parameters.
    */
    moveWest: function(currentState, object, parameters){
        return object ? this.move(currentState, object, parameters.square,
            Orientation.West) : Orientation.West;
    },

    // -------------------------------------------------------

    /** Function to move east.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The object to move.
    *   @param {Object} parameters The parameters.
    */
    moveEast: function(currentState, object, parameters){
        return object ? this.move(currentState, object, parameters.square,
            Orientation.East) : Orientation.East;
    },

    // -------------------------------------------------------

    /** Function to move north west.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The object to move.
    *   @param {Object} parameters The parameters.
    */
    moveNorthWest: function(currentState, object, parameters) {
        var orientation;

        if (object) {
            object.previousOrientation = Orientation.North;
        }
        orientation = this.moveWest(currentState, object, parameters);

        return object ? orientation : Orientation.North;
    },

    // -------------------------------------------------------

    /** Function to move north west.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The object to move.
    *   @param {Object} parameters The parameters.
    */
    moveNorthEast: function(currentState, object, parameters) {
        var orientation;

        if (object) {
            object.previousOrientation = Orientation.North;
        }
        orientation = this.moveEast(currentState, object, parameters);

        return object ? orientation : Orientation.North;
    },

    // -------------------------------------------------------

    /** Function to move north west.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The object to move.
    *   @param {Object} parameters The parameters.
    */
    moveSouthWest: function(currentState, object, parameters) {
        var orientation;

        if (object) {
            object.previousOrientation = Orientation.South;
        }
        orientation = this.moveWest(currentState, object, parameters);

        return object ? orientation : Orientation.South;
    },

    // -------------------------------------------------------

    /** Function to move north west.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The object to move.
    *   @param {Object} parameters The parameters.
    */
    moveSouthEast: function(currentState, object, parameters) {
        var orientation;

        if (object) {
            object.previousOrientation = Orientation.South;
        }
        orientation = this.moveEast(currentState, object, parameters);

        return object ? orientation : Orientation.South;
    },

    // -------------------------------------------------------

    /** Function to move random.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The object to move.
    *   @param {Object} parameters The parameters.
    */
    moveRandom: function(currentState, object, parameters) {
        switch (currentState.random) {
        case CommandMoveKind.MoveNorth:
            return this.moveNorth(currentState, object, parameters);
        case CommandMoveKind.MoveSouth:
            return this.moveSouth(currentState, object, parameters);
        case CommandMoveKind.MoveWest:
            return this.moveWest(currentState, object, parameters);
        case CommandMoveKind.MoveEast:
            return this.moveEast(currentState, object, parameters);
        }
    },

    /** Function to move north west.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The object to move.
    *   @param {Object} parameters The parameters.
    */
    moveHero: function(currentState, object, parameters) {
        return this.moveHeroAndOpposite(currentState, object, parameters, false);
    },

    /** Function to move north west.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The object to move.
    *   @param {Object} parameters The parameters.
    */
    moveOppositeHero: function(currentState, object, parameters) {
        return this.moveHeroAndOpposite(currentState, object, parameters, true);
    },

    /** Function to move north west.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The object to move.
    *   @param {Object} parameters The parameters.
    */
    moveHeroAndOpposite: function(currentState, object, parameters, opposite) {
        var position;

        if (object) {
            var orientation;

            orientation = currentState.moveHeroOrientation === null ? this
                .getHeroOrientation(object) : currentState.moveHeroOrientation;
            currentState.moveHeroOrientation = orientation;
            if (opposite) {
                orientation = EventCommandMoveObject.oppositeOrientation(
                    orientation);
            }
            return this.move(currentState, object, parameters.square,
                orientation);
        }

        return Orientation.None;
    },

    /** Function to move north west.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The object to move.
    *   @param {Object} parameters The parameters.
    */
    moveFront: function(currentState, object, parameters) {
        var orientation;

        if (object) {
            orientation = currentState.moveHeroOrientation === null ? object
                .orientationEye : currentState.moveHeroOrientation;
            currentState.moveHeroOrientation = orientation;
            return this.move(currentState, object, parameters.square,
                currentState.moveHeroOrientation);
        }

        return Orientation.None;
    },

    /** Function to move north west.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The object to move.
    *   @param {Object} parameters The parameters.
    */
    moveBack: function(currentState, object, parameters) {
        var orientation;

        if (object) {
            orientation = currentState.moveHeroOrientation === null ?
                EventCommandMoveObject.oppositeOrientation(object
                .orientationEye) : currentState.moveHeroOrientation;
            currentState.moveHeroOrientation = orientation;
            return this.move(currentState, object, parameters.square,
                currentState.moveHeroOrientation);
        }

        return Orientation.None;
    },

    // -------------------------------------------------------

    changeGraphics: function(currentState, object, parameters) {
        if (object)
        {
            // Change object current state value
            object.currentStateInstance.graphicID = parameters.pictureID
                .getValue();
            if (object.currentStateInstance.graphicID === 0)
            {
                object.currentStateInstance.rectTileset = [
                    parameters.indexX,
                    parameters.indexY,
                    parameters.width,
                    parameters.height
                ];
            } else
            {
                object.currentStateInstance.indexX = parameters.indexX;
                object.currentStateInstance.indexY = parameters.indexY;
            }

            // Permanent change
            if (parameters.permanent)
            {
                let statesOptions;
                if (object.isHero) {
                    statesOptions = RPM.game.heroStatesOptions;
                } else if (object.isStartup)
                {
                    return;
                } else 
                {
                    let portion = SceneMap.getGlobalPortion(RPM.currentMap
                        .allObjects[object.system.id]);
                    let portionDatas = RPM.game.getPotionsDatas(RPM.currentMap
                        .id, portion[0], portion[1], portion[2]);
                    let indexProp = portionDatas.soi.indexOf(object.system.id);
                    if (indexProp === -1) {
                        statesOptions = [];
                        portionDatas.soi.push(object.system.id);
                        portionDatas.so.push(statesOptions);
                    } else {
                        statesOptions = portionDatas.so[indexProp];
                    }
                }
                let options = statesOptions[object.currentState.id - 1];
                if (!options)
                {
                    options = {};
                    statesOptions[object.currentState.id - 1] = options;
                }
                options.gid = object.currentStateInstance.graphicID;
                options.gt = object.currentStateInstance.rectTileset;
                options.gix = object.currentStateInstance.indexX;
                options.giy = object.currentStateInstance.indexY;
            }

            // Graphic update
            object.changeState();
        }
        return Orientation.None;
    },

    /** Function to move north west.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The object to move.
    *   @param {Object} parameters The parameters.
    */
    getHeroOrientation: function(object) {
        var xDif, zDif;

        xDif = object.position.x - RPM.game.hero.position.x;
        zDif = object.position.z - RPM.game.hero.position.z;
        if (Math.abs(xDif) > Math.abs(zDif)) {
            if (xDif > 0) {
                return Orientation.West;
            } else {
                return Orientation.East;
            }
        } else {
            if (zDif > 0) {
                return Orientation.North;
            } else {
                return Orientation.South;
            }
        }
    },

    // -------------------------------------------------------

    /** Move the object(s).
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The current object reacting.
    *   @param {number} state The state ID.
    *   @returns {number} The number of node to pass.
    */
    update: function(currentState, object, state){
        if (currentState.pause) {
            return 0;
        }
        if (currentState.parallel && this.moves.length > 0) {
            if (!currentState.waitingObject) {
                var objectID = this.objectID.getValue();

                MapObject.updateObjectWithID(object, objectID, this, function(
                    moved)
                {
                    currentState.object = moved;
                });
                currentState.waitingObject = true;
            }
            if (currentState.object !== null) {

                var finished = this.moves[currentState.index].call(this,
                    currentState, currentState.object, this.parameters[
                    currentState.index]);

                if (finished) {
                    currentState.distance = 0;
                    currentState.normalDistance = 0;
                    currentState.index = currentState.index + 1;
                    currentState.random = RPM.random(0, 3);
                    currentState.position = null;
                    currentState.moveHeroOrientation = null;
                }

                return (this.moves[currentState.index] == null) ? 1 : 0;
            }

            return 0;
        }

        return 1;
    },

    // -------------------------------------------------------

    getCurrentOrientation: function(currentState) {
        if (this.moves.length === 0) {
            return Orientation.None;
        }

        return this.moves[currentState.index].call(this, currentState);
    },

    // -------------------------------------------------------

    onKeyPressed: function(currentState, key){},
    onKeyReleased: function(currentState, key){},
    onKeyPressedRepeat: function(currentState, key){ return true; },
    onKeyPressedAndRepeat: function(currentState, key){},
    drawHUD: function(currentState){}
}

// -------------------------------------------------------
//
//  CLASS EventCommandWait
//
// -------------------------------------------------------

/** @class
*   An event command for displaying text.
*   @property {boolean} isDirectNode Indicates if this node is directly
*   going to the next node (takes only one frame).
*   @property {number} milliseconds The number of milliseconds to wait.
*   @param {JSON} command Direct JSON command to parse.
*/
function EventCommandWait(command) {
    var i, k, v;

    i = 0;
    k = command[i++];
    v = command[i++];
    this.milliseconds = SystemValue.create(k, v);

    this.isDirectNode = false;
    this.parallel = false;
}

EventCommandWait.prototype = {

    /** Initialize the current state.
    *   @returns {Object} The current state (clicked).
    */
    initialize: function() {
        return {
            milliseconds: this.milliseconds.getValue() * 1000,
            currentTime: new Date().getTime()
        }
    },

    // -------------------------------------------------------

    /** Update and check if the event is finished.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The current object reacting.
    *   @param {number} state The state ID.
    *   @returns {number} The number of node to pass.
    */
    update: function(currentState, object, state) {
        return (currentState.currentTime + currentState.milliseconds <= new
            Date().getTime()) ? 1 : 0;
    },

    // -------------------------------------------------------

    onKeyPressed: function(currentState, key){},
    onKeyReleased: function(currentState, key){},
    onKeyPressedRepeat: function(currentState, key){ return true; },
    onKeyPressedAndRepeat: function(currentState, key){},
    drawHUD: function(currentState){}
}

// -------------------------------------------------------
//
//  CLASS EventCommandMoveCamera
//
// -------------------------------------------------------

/** @class
*   An event command for displaying text.
*   @property {boolean} isDirectNode Indicates if this node is directly
*   going to the next node (takes only one frame).
*   @property {SystemValue} targetID The ID of the camera target.
*   @property {number} operation The operation used for the transformations.
*   @property {SystemValue} time The time to wait.
*   @param {JSON} command Direct JSON command to parse.
*/
function EventCommandMoveCamera(command){
    var i = 0, k, v;

    // Target
    if (command[i++] === 0) // Unchanged
        this.targetID = null;
    else {
        k = command[i++];
        v = command[i++];
        this.targetID = SystemValue.create(k, v);
    }

    // Operation
    this.operation = command[i++];

    // Move
    this.moveTargetOffset = command[i++] === 1;
    this.cameraOrientation = command[i++] === 1;
    k = command[i++];
    v = command[i++];
    this.x = SystemValue.create(k, v);
    this.xSquare = command[i++] === 0;
    k = command[i++];
    v = command[i++];
    this.y = SystemValue.create(k, v);
    this.ySquare = command[i++] === 0;
    k = command[i++];
    v = command[i++];
    this.z = SystemValue.create(k, v);
    this.zSquare = command[i++] === 0;

    // Rotation
    this.rotationTargetOffset = command[i++] === 1;
    k = command[i++];
    v = command[i++];
    this.h = SystemValue.create(k, v);
    k = command[i++];
    v = command[i++];
    this.v = SystemValue.create(k, v);

    // Zoom
    k = command[i++];
    v = command[i++];
    this.distance = SystemValue.create(k, v);

    // Options
    this.isWaitEnd = command[i++] === 1;
    k = command[i++];
    v = command[i++];
    this.time = SystemValue.create(k, v);

    this.isDirectNode = false;
    this.parallel = !this.isWaitEnd;
}

EventCommandMoveCamera.prototype = {

    /** Initialize the current state.
    *   @returns {Object} The current state (clicked).
    */
    initialize: function(){
        var time = this.time.getValue() * 1000;
        var operation = RPM.operators_numbers[this.operation];
        var finalX = operation(RPM.currentMap.camera.threeCamera.position.x,
                               this.x.getValue() *
                               (this.xSquare ? RPM.SQUARE_SIZE : 1));
        var finalY = operation(RPM.currentMap.camera.threeCamera.position.y,
                               this.y.getValue() *
                               (this.ySquare ? RPM.SQUARE_SIZE : 1));
        var finalZ = operation(RPM.currentMap.camera.threeCamera.position.z,
                               this.z.getValue() *
                               (this.zSquare ? RPM.SQUARE_SIZE : 1));
        var finalH = operation(RPM.currentMap.camera.horizontalAngle,
                               this.h.getValue());
        var finalV = operation(RPM.currentMap.camera.verticalAngle,
                               this.v.getValue());
        var finalDistance = operation(RPM.currentMap.camera.distance,
                                      this.distance.getValue());
                                      
        return {
            parallel: this.isWaitEnd,
            finalPosition: new THREE.Vector3(finalX, finalY, finalZ),
            finalDifH: finalH - RPM.currentMap.camera.horizontalAngle,
            finalDifV: finalV - RPM.currentMap.camera.verticalAngle,
            finalDistance: finalDistance - RPM.currentMap.camera.distance,
            time: time,
            timeLeft: time,
            targetID: this.targetID === null ? null : this.targetID.getValue(),
            target: null
        }
    },

    // -------------------------------------------------------

    /** Update and check if the event is finished.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The current object reacting.
    *   @param {number} state The state ID.
    *   @returns {number} The number of node to pass.
    */
    update: function(currentState, object, state)
    {

        if (currentState.parallel) 
        {
            if (!currentState.waitingObject) {
                if (currentState.targetID === null)
                {
                    currentState.target = false;
                } else
                {
                    MapObject.updateObjectWithID(object, currentState.targetID, 
                        this, function(target)
                    {
                        currentState.target = target;
                    });
                }
                currentState.waitingObject = true;
            }
            if (currentState.target !== null) 
            {
                if (!currentState.editedTarget)
                {
                    if (currentState.target)
                    {
                        RPM.currentMap.camera.targetOffset.add(RPM.currentMap
                            .camera.target.position.clone().sub(currentState
                            .target.position));
                        let dif = currentState.target.position.clone().sub(RPM
                            .currentMap.camera.target.position);
                        currentState.finalPosition.add(dif);
                        RPM.currentMap.camera.target = currentState.target;
                        if (!this.moveTargetOffset)
                        {
                            currentState.moveChangeTargetDif = currentState
                                .finalPosition.clone().sub(dif).sub(RPM
                                .currentMap.camera.threeCamera.position);
                        }
                    }
                    currentState.finalDifPosition = currentState.finalPosition
                        .sub(RPM.currentMap.camera.threeCamera.position);
                    currentState.editedTarget = true;
                }

                // Updating the time left
                let timeRate, dif;
                if (currentState.time === 0)
                {
                    timeRate = 1;
                } else 
                {
                    dif = RPM.elapsedTime;
                    currentState.timeLeft -= RPM.elapsedTime;
                    if (currentState.timeLeft < 0) 
                    {
                        dif += currentState.timeLeft;
                        currentState.timeLeft = 0;
                    }
                    timeRate = dif / currentState.time;
                }

                // Move
                var positionOffset;
                positionOffset = new THREE.Vector3(
                    timeRate * currentState.finalDifPosition.x,
                    timeRate * currentState.finalDifPosition.y,
                    timeRate * currentState.finalDifPosition.z
                );
                RPM.currentMap.camera.threeCamera.position.add(positionOffset);
                if (this.moveTargetOffset)
                    RPM.currentMap.camera.targetOffset.add(positionOffset);
                else {
                    if (currentState.moveChangeTargetDif)
                    {
                        positionOffset = new THREE.Vector3(
                            timeRate * (currentState.finalDifPosition.x - 
                                currentState.moveChangeTargetDif.x),
                            timeRate * (currentState.finalDifPosition.y - 
                                currentState.moveChangeTargetDif.y),
                            timeRate * (currentState.finalDifPosition.z - 
                                currentState.moveChangeTargetDif.z)
                        );
                        RPM.currentMap.camera.targetOffset.add(positionOffset);
                    }
                }
                RPM.currentMap.camera.updateTargetPosition();
                RPM.currentMap.camera.updateAngles();
                RPM.currentMap.camera.updateDistance();

                // Rotation
                RPM.currentMap.camera.horizontalAngle +=
                        timeRate * currentState.finalDifH;
                RPM.currentMap.camera.addVerticalAngle(
                        timeRate * currentState.finalDifV);
                if (this.rotationTargetOffset)
                    RPM.currentMap.camera.updateTargetOffset();

                // Zoom
                RPM.currentMap.camera.distance += timeRate *
                        currentState.finalDistance;

                // Update
                RPM.currentMap.camera.update();

                // If time = 0, then this is the end of the command
                return currentState.timeLeft === 0 ? 1 : 0;
            }

            return 0;
        }

        return 1;
    },

    // -------------------------------------------------------

    onKeyPressed: function(currentState, key){},
    onKeyReleased: function(currentState, key){},
    onKeyPressedRepeat: function(currentState, key){ return true; },
    onKeyPressedAndRepeat: function(currentState, key){},
    drawHUD: function(currentState){}
}

// -------------------------------------------------------
//
//  CLASS EventCommandPlayMusic
//
// -------------------------------------------------------

/** @class
*   An event command for playing a music.
*   @property {boolean} isDirectNode Indicates if this node is directly
*   going to the next node (takes only one frame).
*/

function EventCommandPlayMusic(command) {
    EventCommandPlayMusic.parsePlaySong(this, command, SongKind.Music);
    this.isDirectNode = true;
    this.parallel = false;
}

// -------------------------------------------------------

EventCommandPlayMusic.parsePlaySong = function(that, command, kind) {
    var i = 0;

    var isIDprimitive = command[i++] === 1;
    var k = command[i++];
    var v = command[i++];
    var idValue = SystemValue.create(k, v);
    var id = SystemValue.createNumber(command[i++]);
    var songID = isIDprimitive ? idValue : id;
    k = command[i++];
    v = command[i++];
    var volume = SystemValue.create(k, v);
    var isStart = command[i++] === 1;
    k = command[i++];
    v = command[i++];
    var start = SystemValue.create(k, v);
    start = isStart ? start : null;
    var isEnd = command[i++] === 1;
    k = command[i++];
    v = command[i++];
    var end = SystemValue.create(k, v);
    end = isEnd ? end : null;

    that.song = new SystemPlaySong(kind);
    that.song.updateValues(songID, volume, isStart, start, isEnd, end);
};

// -------------------------------------------------------

EventCommandPlayMusic.prototype = {

    initialize: function(){
        return this.song.initialize();
    },

    // -------------------------------------------------------

    /** Update and check if the event is finished.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The current object reacting.
    *   @param {number} state The state ID.
    *   @returns {number} The number of node to pass.
    */

    update: function(currentState, object, state){
        return this.song.playMusic();
    },

    // -------------------------------------------------------

    onKeyPressed: function(currentState, key){},
    onKeyReleased: function(currentState, key){},
    onKeyPressedRepeat: function(currentState, key){ return true; },
    onKeyPressedAndRepeat: function(currentState, key){},
    drawHUD: function(currentState){}
}

// -------------------------------------------------------
//
//  CLASS EventCommandStopMusic
//
// -------------------------------------------------------

/** @class
*   An event command for stopping the music.
*   @property {boolean} isDirectNode Indicates if this node is directly
*   going to the next node (takes only one frame).
*/

function EventCommandStopMusic(command){
    EventCommandStopMusic.parseStopSong(this, command);
    this.isDirectNode = true;
    this.parallel = true;
}

// -------------------------------------------------------

EventCommandStopMusic.parseStopSong = function(that, command) {
    var i = 0;

    var k = command[i++];
    var v = command[i++];
    that.seconds = SystemValue.create(k, v);
};

// -------------------------------------------------------

EventCommandStopMusic.stopSong = function(that, kind, time) {
    return RPM.songsManager.stopSong(kind, time, that.seconds.getValue()) ? 1 : 0;
};

// -------------------------------------------------------

EventCommandStopMusic.prototype = {

    initialize: function(){
        return {
            parallel: false,
            time: new Date().getTime()
        };
    },

    // -------------------------------------------------------

    /** Update and check if the event is finished.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The current object reacting.
    *   @param {number} state The state ID.
    *   @returns {number} The number of node to pass.
    */

    update: function(currentState, object, state){
        var stopped = EventCommandStopMusic.stopSong(this, SongKind.Music,
            currentState.time);
        return currentState.parallel ? stopped : 1;
    },

    // -------------------------------------------------------

    onKeyPressed: function(currentState, key){},
    onKeyReleased: function(currentState, key){},
    onKeyPressedRepeat: function(currentState, key){ return true; },
    onKeyPressedAndRepeat: function(currentState, key){},
    drawHUD: function(currentState){}
}

// -------------------------------------------------------
//
//  CLASS EventCommandPlayBackgroundSound
//
// -------------------------------------------------------

/** @class
*   An event command for playing a backgroundsound.
*   @property {boolean} isDirectNode Indicates if this node is directly
*   going to the next node (takes only one frame).
*/

function EventCommandPlayBackgroundSound(command){
    EventCommandPlayMusic.parsePlaySong(this, command, SongKind.BackgroundSound);
    this.isDirectNode = true;
    this.parallel = false;
}

EventCommandPlayBackgroundSound.prototype = {

    initialize: function(){
        return this.song.initialize();
    },

    // -------------------------------------------------------

    /** Update and check if the event is finished.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The current object reacting.
    *   @param {number} state The state ID.
    *   @returns {number} The number of node to pass.
    */

    update: function(currentState, object, state){
        return this.song.playMusic();
    },

    // -------------------------------------------------------

    onKeyPressed: function(currentState, key){},
    onKeyReleased: function(currentState, key){},
    onKeyPressedRepeat: function(currentState, key){ return true; },
    onKeyPressedAndRepeat: function(currentState, key){},
    drawHUD: function(currentState){}
}

// -------------------------------------------------------
//
//  CLASS EventCommandStopBackgroundSound
//
// -------------------------------------------------------

/** @class
*   An event command for stopping the background sound.
*   @property {boolean} isDirectNode Indicates if this node is directly
*   going to the next node (takes only one frame).
*/

function EventCommandStopBackgroundSound(command) {
    EventCommandStopMusic.parseStopSong(this, command);
    this.isDirectNode = false;
    this.parallel = true;
}

EventCommandStopBackgroundSound.prototype = {

    initialize: function(){
        return {
            parallel: false,
            time: new Date().getTime()
        };
    },

    // -------------------------------------------------------

    /** Update and check if the event is finished.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The current object reacting.
    *   @param {number} state The state ID.
    *   @returns {number} The number of node to pass.
    */

    update: function(currentState, object, state){
        var stopped = EventCommandStopMusic.stopSong(this,
            SongKind.BackgroundSound, currentState.time);
        return currentState.parallel ? stopped : 1;
    },

    // -------------------------------------------------------

    onKeyPressed: function(currentState, key){},
    onKeyReleased: function(currentState, key){},
    onKeyPressedRepeat: function(currentState, key){ return true; },
    onKeyPressedAndRepeat: function(currentState, key){},
    drawHUD: function(currentState){}
}

// -------------------------------------------------------
//
//  CLASS EventCommandPlaySound
//
// -------------------------------------------------------

/** @class
*   An event command for playing a backgroundsound.
*   @property {boolean} isDirectNode Indicates if this node is directly
*   going to the next node (takes only one frame).
*/

function EventCommandPlaySound(command){
    EventCommandPlayMusic.parsePlaySong(this, command, SongKind.Sound);
    this.isDirectNode = true;
    this.parallel = false;
}

EventCommandPlaySound.prototype = {

    initialize: function(){
        return this.song.initialize();
    },

    // -------------------------------------------------------

    play: function() {
        return this.song.playSound();
    },

    // -------------------------------------------------------

    /** Update and check if the event is finished.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The current object reacting.
    *   @param {number} state The state ID.
    *   @returns {number} The number of node to pass.
    */

    update: function(currentState, object, state){
        this.play();
        return 1;
    },

    // -------------------------------------------------------

    onKeyPressed: function(currentState, key){},
    onKeyReleased: function(currentState, key){},
    onKeyPressedRepeat: function(currentState, key){ return true; },
    onKeyPressedAndRepeat: function(currentState, key){},
    drawHUD: function(currentState){}
}

// -------------------------------------------------------
//
//  CLASS EventCommandPlayMusicEffect
//
// -------------------------------------------------------

/** @class
*   An event command for playing a music effect.
*   @property {boolean} isDirectNode Indicates if this node is directly
*   going to the next node (takes only one frame).
*/

function EventCommandPlayMusicEffect(command){
    EventCommandPlayMusic.parsePlaySong(this, command, SongKind.MusicEffect);
    this.isDirectNode = true;
    this.parallel = true;
}

EventCommandPlayMusicEffect.prototype = {

    initialize: function(){
        return this.song.initialize();
    },

    // -------------------------------------------------------

    /** Update and check if the event is finished.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The current object reacting.
    *   @param {number} state The state ID.
    *   @returns {number} The number of node to pass.
    */

    update: function(currentState, object, state){
        return this.song.playMusicEffect(currentState);
    },

    // -------------------------------------------------------

    onKeyPressed: function(currentState, key){},
    onKeyReleased: function(currentState, key){},
    onKeyPressedRepeat: function(currentState, key){ return true; },
    onKeyPressedAndRepeat: function(currentState, key){},
    drawHUD: function(currentState){}
}

// -------------------------------------------------------
//
//  CLASS EventCommandChangeProperty
//
// -------------------------------------------------------

/** @class
*   An event command for changing a property value.
*   @param {JSON} command Direct JSON command to parse.
*/
function EventCommandChangeProperty(command) {
    var i, k, v;

    // Parsing
    i = 0;
    k = command[i++];
    v = command[i++];
    this.propertyID = SystemValue.create(k, v);
    this.operationKind = command[i++];
    k = command[i++];
    v = command[i++];
    this.newValue = SystemValue.create(k, v);

    this.isDirectNode = true;
    this.parallel = false;
}

EventCommandChangeProperty.prototype = {

    initialize: function(){ return null; },

    update: function(currentState, object, state) {
        var propertyID, newValue, portion, portionDatas, indexProp, props;

        propertyID = this.propertyID.getValue();
        newValue = RPM.operators_numbers[this.operationKind](object.properties[
            propertyID], this.newValue.getValue());
        object.properties[propertyID] = newValue;

        if (object.isHero) {
            props = RPM.game.heroProperties;
        } else if (object.isStartup) {
            props = RPM.game.startupProperties[RPM.currentMap.id];
            if (typeof props === 'undefined') {
                props = [];
                RPM.game.startupProperties[RPM.currentMap.id] = props;
            }
        } else {
            portion = SceneMap.getGlobalPortion(RPM.currentMap.allObjects[object
                .system.id]);
            portionDatas = RPM.game.getPotionsDatas(RPM.currentMap.id, portion[0
                ], portion[1], portion[2]);
            indexProp = portionDatas.pi.indexOf(object.system.id);
            if (indexProp === -1) {
                props = [];
                portionDatas.pi.push(object.system.id);
                portionDatas.p.push(props);
            } else {
                props = portionDatas.p[indexProp];
            }
        }
        props[propertyID - 1] = newValue;

        return 1;
    },

    onKeyPressed: function(currentState, key){},
    onKeyReleased: function(currentState, key){},
    onKeyPressedRepeat: function(currentState, key){ return true; },
    onKeyPressedAndRepeat: function(currentState, key){},
    drawHUD: function(currentState){}
}

// -------------------------------------------------------
//
//  CLASS EventCommandDisplayChoice
//
// -------------------------------------------------------

function EventCommandDisplayChoice(command) {
    var l, lang, next, w, graphics, graphic;

    var iterator = {
        i: 0
    };
    this.cancelAutoIndex = SystemValue.createValueCommand(command, iterator);
    this.choices = [];
    l = command.length;
    lang = null;
    while (iterator.i < l) {
        next = command[i];
        if (next === RPM.STRING_DASH) {
            iterator.i++;
            if (lang !== null) {
                this.choices.push(lang.name);
            }
            lang = new SystemLang();
            iterator.i++;
        }
        lang.getCommand(command, iterator);
    }
    if (lang !== null) {
        this.choices.push(lang.name);
    }

    // Determine slots width
    l = this.choices.length;
    graphics = new Array(l);
    w = RPM.MEDIUM_SLOT_WIDTH;
    for (let i = 0; i < l; i++) {
        graphic = new GraphicText(this.choices[i], { align: Align.Center });
        graphics[i] = graphic;
        if (graphic.textWidth > w) {
            w = graphic.textWidth;
        }
    }
    w += RPM.SMALL_SLOT_PADDING[0] + RPM.SMALL_SLOT_PADDING[2];

    // Window
    this.windowChoices = new WindowChoices((RPM.SCREEN_X - w) / 2, RPM.SCREEN_Y 
        - 10 - 150 - (l * RPM.MEDIUM_SLOT_HEIGHT), w, RPM.MEDIUM_SLOT_HEIGHT, 
        graphics, 
        {
            nbItemsMax: l
        }
    );
    this.isDirectNode = true;
    this.parallel = false;
}

EventCommandDisplayChoice.prototype = {

    setShowText: function(showText) {
        this.showText = showText;

        // Move to right if show text before
        if (showText) {
            this.windowChoices.setX(RPM.SCREEN_X - this.windowChoices.oW - 10);
        }
    },

    initialize: function() {
        this.windowChoices.unselect();
        this.windowChoices.select(0);

        return {
            index: -1
        };
    },

    /** Go inside the else block.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The current object reacting.
    *   @param {number} state The state ID.
    *   @returns {number} The number of node to pass.
    */
    update: function(currentState, object, state) {
        return currentState.index + 1;
    },

    // -------------------------------------------------------

    /** Returns the number of node to pass.
    *   @returns {number}
    */
    goToNextCommand : function() {
        return 1;
    },

    // -------------------------------------------------------

    onKeyPressed: function(currentState, key) {
        if (DatasKeyBoard.isKeyEqual(key, RPM.datasGame.keyBoard.menuControls
            .Action))
        {
            currentState.index = this.windowChoices.currentSelectedIndex;
        } else if (DatasKeyBoard.isKeyEqual(key, RPM.datasGame.keyBoard
            .menuControls.Cancel))
        {
            currentState.index = this.cancelAutoIndex.getValue() - 1;
        }
    },

    // -------------------------------------------------------

    onKeyReleased: function(currentState, key){},
    onKeyPressedRepeat: function(currentState, key){ return true; },

    // -------------------------------------------------------

    onKeyPressedAndRepeat: function(currentState, key) {
        this.windowChoices.onKeyPressedAndRepeat(key);
    },

    // -------------------------------------------------------

    drawHUD: function(currentState) {
        // Display text command if existing
        if (this.showText) {
            this.showText.drawHUD();
        }

        this.windowChoices.draw();
    }
}

// -------------------------------------------------------
//
//  CLASS EventCommandChoice
//
// -------------------------------------------------------

function EventCommandChoice(command) {
    this.index = command[0];
    this.isDirectNode = true;
    this.parallel = false;
}

EventCommandChoice.prototype = {

    initialize: function() { return null; },

    /** Go inside the else block.
    *   @param {Object} currentState The current state of the event.
    *   @param {MapObject} object The current object reacting.
    *   @param {number} state The state ID.
    *   @returns {number} The number of node to pass.
    */
    update: function(currentState, object, state) {
        return -1;
    },

    // -------------------------------------------------------

    /** Returns the number of node to pass.
    *   @returns {number}
    */
    goToNextCommand : function() {
        return 1;
    },

    // -------------------------------------------------------

    onKeyPressed: function(currentState, key){},
    onKeyReleased: function(currentState, key){},
    onKeyPressedRepeat: function(currentState, key){ return true; },
    onKeyPressedAndRepeat: function(currentState, key){},
    drawHUD: function(currentState){}
}

// -------------------------------------------------------
//
//  CLASS EventCommandScript
//
// -------------------------------------------------------

function EventCommandScript(command) {
    var i, k, v;

    i = 0;
    this.isDynamic = command[i++] === RPM.NUM_BOOL_TRUE;
    if (this.isDynamic) {
        k = command[i++];
        v = command[i++];
        this.script = SystemValue.create(k, v);
    } else {
        this.script = SystemValue.createMessage("" + command[i]);
    }

    this.isDirectNode = true;
    this.parallel = false;
}

EventCommandScript.prototype = Object.create(EventCommand.prototype);

// -------------------------------------------------------

EventCommandScript.prototype.update = function(currentState, object, state) {
    let res = new Function("$that", "$object", this.script.getValue())($that, 
        object);
    return RPM.isUndefined(res) ? 1 : res;
}

// -------------------------------------------------------
//
//  CLASS EventCommandDisplayAPicture
//
// -------------------------------------------------------

function EventCommandDisplayAPicture(command) {
    var i, k, v;

    i = 0;
    k = command[i++];
    v = command[i++];
    i++;
    this.pictureID = SystemValue.create(k, v);
    k = command[i++];
    v = command[i++];
    this.index = SystemValue.create(k, v);
    this.centered = command[i++] === RPM.NUM_BOOL_TRUE;
    if (this.centered) {
        this.originX = RPM.SCREEN_X / 2;
        this.originY = RPM.SCREEN_Y / 2;
    } else {
        this.originX = 0;
        this.originY = 0;
    }
    k = command[i++];
    v = command[i++];
    this.x = SystemValue.create(k, v);
    k = command[i++];
    v = command[i++];
    this.y = SystemValue.create(k, v);
    k = command[i++];
    v = command[i++];
    this.zoom = SystemValue.create(k, v);
    k = command[i++];
    v = command[i++];
    this.opacity = SystemValue.create(k, v);
    k = command[i++];
    v = command[i++];
    this.angle = SystemValue.create(k, v);

    this.isDirectNode = true;
    this.parallel = false;
}

EventCommandDisplayAPicture.prototype = Object.create(EventCommand.prototype);

// -------------------------------------------------------

EventCommandDisplayAPicture.prototype.update = function(currentState, object,
    state)
{
    var i, l, index, currentIndex, value, picture, ok;

    currentIndex = this.index.getValue();
    picture = RPM.datasGame.pictures.get(PictureKind.Pictures, this.pictureID
        .getValue()).picture.createCopy();
    picture.setX(this.originX + this.x.getValue());
    picture.setY(this.originY + this.y.getValue());
    picture.centered = this.centered;
    picture.zoom = this.zoom.getValue() / 100;
    picture.opacity = this.opacity.getValue() / 100;
    picture.angle = this.angle.getValue();
    value = [currentIndex, picture];
    ok = false;
    for (i = 0, l = RPM.displayedPictures.length; i < l; i++) {
        index = RPM.displayedPictures[i][0];
        if (currentIndex === index) {
            RPM.displayedPictures[i] = value;
            ok = true;
            break;
        } else if (currentIndex < index) {
            RPM.displayedPictures.splice(i, 0, value);
            ok = true;
            break;
        }
    }
    if (!ok) {
        RPM.displayedPictures.push(value);
    }
    RPM.requestPaintHUD = true;

    return 1;
}

// -------------------------------------------------------
//
//  CLASS EventCommandSetMoveTurnAPicture
//
// -------------------------------------------------------

function EventCommandSetMoveTurnAPicture(command) {
    var i, k, v, checked;

    i = 0;
    k = command[i++];
    v = command[i++];
    this.index = SystemValue.create(k, v);
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        k = command[i++];
        v = command[i++];
        i++; 
        this.pictureID = SystemValue.create(k, v);
    }
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        k = command[i++];
        v = command[i++];
        this.zoom = SystemValue.create(k, v);
    }
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        k = command[i++];
        v = command[i++];
        this.opacity = SystemValue.create(k, v);
    }
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        k = command[i++];
        v = command[i++];
        this.x = SystemValue.create(k, v);
    }
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        k = command[i++];
        v = command[i++];
        this.y = SystemValue.create(k, v);
    }
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        k = command[i++];
        v = command[i++];
        this.angle = SystemValue.create(k, v);
    }
    k = command[i++];
    v = command[i++];
    this.time = SystemValue.create(k, v);
    this.waitEnd = command[i++] === RPM.NUM_BOOL_TRUE;

    this.isDirectNode = true;
    this.parallel = !this.waitEnd;
}

EventCommandSetMoveTurnAPicture.prototype = Object.create(EventCommand.prototype);

// -------------------------------------------------------

EventCommandSetMoveTurnAPicture.prototype.initialize = function() {
    var i, l, time, index, finalZoom, finalOpacity, finalX, finalY, finalAngle,
        picture, obj;

    time = this.time.getValue() * 1000;
    index = this.index.getValue();
    for (i = 0, l = RPM.displayedPictures.length; i < l; i++) {
        obj = RPM.displayedPictures[i];
        if (index === obj[0]) {
            picture = obj[1];
            break;
        }
    }
    if (picture) {
        // If new picture ID, create a new picture
        if (this.pictureID) {
            var prevX, prevY, prevW, prevH, prevCentered, prevZoom, prevOpacity,
                prevAngle;

            prevX = picture.oX;
            prevY = picture.oY;
            prevW = picture.oW;
            prevH = picture.oH;
            prevCentered = picture.centered;
            prevZoom = picture.zoom;
            prevOpacity = picture.opacity;
            prevAngle = picture.angle;
            picture = RPM.datasGame.pictures.get(PictureKind.Pictures, this
                .pictureID.getValue()).picture.createCopy();
            if (prevCentered) {
                prevX += (prevW - picture.oW) / 2;
                prevY += (prevH - picture.oH) / 2;
            }
            picture.setX(prevX);
            picture.setY(prevY);
            picture.centered = prevCentered;
            picture.zoom = prevZoom;
            picture.opacity = prevOpacity;
            picture.angle = prevAngle;
            RPM.displayedPictures[i][1] = picture;
        }
    } else {
        return {};
    }

    return {
        parallel: this.waitEnd,
        picture: picture,
        finalDifZoom: this.zoom ? (this.zoom.getValue() / 100) - picture.zoom :
            null,
        finalDifOpacity: this.opacity ? (this.opacity.getValue() / 100) -
            picture.opacity : null,
        finalDifX: this.x ? (picture.centered ? RPM.SCREEN_X / 2 : 0) + this.x
            .getValue() - picture.oX : null,
        finalDifY: this.y ? (picture.centered ? RPM.SCREEN_Y / 2 : 0) + this.y
            .getValue() - picture.oY : null,
        finalDifAngle: this.angle ? this.angle.getValue() - picture.angle : null,
        time: time,
        timeLeft: time
    }
}

// -------------------------------------------------------

EventCommandSetMoveTurnAPicture.prototype.update = function(currentState, object
    , state)
{
    // If no picture corresponds, go to next command
    if (!currentState.picture) {
        return 1;
    }

    if (currentState.parallel) {
        // Updating the time left
        var timeRate, dif;

        if (currentState.time === 0) {
            timeRate = 1;
        } else {
            dif = RPM.elapsedTime;
            currentState.timeLeft -= RPM.elapsedTime;
            if (currentState.timeLeft < 0) {
                dif += currentState.timeLeft;
                currentState.timeLeft = 0;
            }
            timeRate = dif / currentState.time;
        }

        // Set
        if (this.zoom) {
            currentState.picture.zoom += timeRate * currentState.finalDifZoom;
        }
        if (this.opacity) {
            currentState.picture.opacity += timeRate * currentState
                .finalDifOpacity;
        }

        // Move
        if (this.x) {
            currentState.picture.setX(currentState.picture.oX + (timeRate *
                currentState.finalDifX));
        }
        if (this.y) {
            currentState.picture.setY(currentState.picture.oY + (timeRate *
                currentState.finalDifY));
        }

        // Turn
        if (this.angle) {
            currentState.picture.angle += timeRate * currentState.finalDifAngle;
        }

        RPM.requestPaintHUD = true;

        // If time = 0, then this is the end of the command
        if (currentState.timeLeft === 0) {
            return 1;
        }

        return 0;
    }

    return 1;
}

// -------------------------------------------------------
//
//  CLASS EventCommandRemoveAPicture
//
// -------------------------------------------------------

function EventCommandRemoveAPicture(command) {
    var i, k, v;

    i = 0;
    k = command[i++];
    v = command[i++];
    this.index = SystemValue.create(k, v);

    this.isDirectNode = true;
    this.parallel = false;
}

EventCommandRemoveAPicture.prototype = Object.create(EventCommand.prototype);

// -------------------------------------------------------

EventCommandRemoveAPicture.prototype.update = function(currentState, object,
    state)
{
    var i, l, currentIndex;

    currentIndex = this.index.getValue();
    for (i = 0, l = RPM.displayedPictures.length; i < l; i++) {
        if (currentIndex === RPM.displayedPictures[i][0]) {
            RPM.displayedPictures.splice(i, 1);
            break;
        }
    }
    RPM.requestPaintHUD = true;

    return 1;
}

// -------------------------------------------------------
//
//  CLASS EventCommandSetDialogBoxOptions
//
// -------------------------------------------------------

function EventCommandSetDialogBoxOptions(command) {
    var i, k, v, checked;

    i = 0;
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        k = command[i++];
        v = command[i++];
        this.windowSkinID = SystemValue.create(k, v);
    }
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        k = command[i++];
        v = command[i++];
        this.x = SystemValue.create(k, v);
    }
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        k = command[i++];
        v = command[i++];
        this.y = SystemValue.create(k, v);
    }
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        k = command[i++];
        v = command[i++];
        this.w = SystemValue.create(k, v);
    }
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        k = command[i++];
        v = command[i++];
        this.h = SystemValue.create(k, v);
    }
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        k = command[i++];
        v = command[i++];
        this.pLeft = SystemValue.create(k, v);
    }
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        k = command[i++];
        v = command[i++];
        this.pTop = SystemValue.create(k, v);
    }
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        k = command[i++];
        v = command[i++];
        this.pRight = SystemValue.create(k, v);
    }
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        k = command[i++];
        v = command[i++];
        this.pBottom = SystemValue.create(k, v);
    }
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        this.fPosAbove = command[i++] === RPM.NUM_BOOL_TRUE;
    }
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        k = command[i++];
        v = command[i++];
        this.fX = SystemValue.create(k, v);
    }
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        k = command[i++];
        v = command[i++];
        this.fY = SystemValue.create(k, v);
    }
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        this.tOutline = command[i++] !== RPM.NUM_BOOL_TRUE;
    }
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        k = command[i++];
        v = command[i++];
        this.tcText = SystemValue.create(k, v);
    }
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        k = command[i++];
        v = command[i++];
        this.tcOutline = SystemValue.create(k, v);
    }
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        k = command[i++];
        v = command[i++];
        this.tcBackground = SystemValue.create(k, v);
    }
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        k = command[i++];
        v = command[i++];
        this.tSize = SystemValue.create(k, v);
    }
    checked = command[i++] === RPM.NUM_BOOL_TRUE;
    if (checked) {
        k = command[i++];
        v = command[i++];
        this.tFont = SystemValue.create(k, v);
    }

    this.isDirectNode = true;
    this.parallel = false;
}

EventCommandSetDialogBoxOptions.prototype = Object.create(EventCommand.prototype);

// -------------------------------------------------------

EventCommandSetDialogBoxOptions.prototype.update = function(currentState, object
    , state)
{
    if (!RPM.isUndefined(this.windowSkinID)) {
        RPM.datasGame.system.dbOptions.vwindowSkinID = this.windowSkinID.getValue();
    }
    if (!RPM.isUndefined(this.x)) {
        RPM.datasGame.system.dbOptions.vx = this.x.getValue();
    }
    if (!RPM.isUndefined(this.y)) {
        RPM.datasGame.system.dbOptions.vy = this.y.getValue();
    }
    if (!RPM.isUndefined(this.w)) {
        RPM.datasGame.system.dbOptions.vw = this.w.getValue();
    }
    if (!RPM.isUndefined(this.h)) {
        RPM.datasGame.system.dbOptions.vh = this.h.getValue();
    }
    if (!RPM.isUndefined(this.pLeft)) {
        RPM.datasGame.system.dbOptions.vpLeft = this.pLeft.getValue();
    }
    if (!RPM.isUndefined(this.pTop)) {
        RPM.datasGame.system.dbOptions.vpTop = this.pTop.getValue();
    }
    if (!RPM.isUndefined(this.pRight)) {
        RPM.datasGame.system.dbOptions.vpRight = this.pRight.getValue();
    }
    if (!RPM.isUndefined(this.pBottom)) {
        RPM.datasGame.system.dbOptions.vpBottom = this.pBottom.getValue();
    }
    if (!RPM.isUndefined(this.fPosAbove)) {
        RPM.datasGame.system.dbOptions.vfPosAbove = this.fPosAbove;
    }
    if (!RPM.isUndefined(this.fX)) {
        RPM.datasGame.system.dbOptions.fX = this.fX.getValue();
    }
    if (!RPM.isUndefined(this.fY)) {
        RPM.datasGame.system.dbOptions.fY = this.fY.getValue();
    }
    if (!RPM.isUndefined(this.tOutline)) {
        RPM.datasGame.system.dbOptions.vtOutline = this.tOutline;
    }
    if (!RPM.isUndefined(this.tcText)) {
        RPM.datasGame.system.dbOptions.vtcText = RPM.datasGame.system.colors[this
            .tcText.getValue()];
    }
    if (!RPM.isUndefined(this.tcOutline)) {
        RPM.datasGame.system.dbOptions.vtcOutline = RPM.datasGame.system.colors[this
            .tcOutline.getValue()];
    }
    if (!RPM.isUndefined(this.tcBackground)) {
        RPM.datasGame.system.dbOptions.vtcBackground = RPM.datasGame.system.colors[
            this.tcBackground.getValue()];
    }
    if (!RPM.isUndefined(this.tSize)) {
        RPM.datasGame.system.dbOptions.vtSize = RPM.datasGame.system.fontSizes[this
            .tSize.getValue()].getValue();
    }
    if (!RPM.isUndefined(this.tFont)) {
        RPM.datasGame.system.dbOptions.vtFont = RPM.datasGame.system.fontNames[this
            .tFont.getValue()].getValue();
    }

    return 1;
}

// -------------------------------------------------------
//
//  CLASS EventCommandTitleScreen
//
// -------------------------------------------------------

function EventCommandTitleScreen(command) {
    this.isDirectNode = true;
    this.parallel = false;
}

EventCommandTitleScreen.prototype = Object.create(EventCommand.prototype);

// -------------------------------------------------------

EventCommandTitleScreen.prototype.update = function(currentState, object,
    state)
{
    RPM.gameStack.pop();
    RPM.gameStack.pushTitleScreen();

    return 1;
}

// -------------------------------------------------------
//
//  CLASS EventCommandChangeScreenTone
//
// -------------------------------------------------------

function EventCommandChangeScreenTone(command) {
    if (!command)
    {
        return;
    }
    var iterator = {
        i: 0
    };
    this.r = SystemValue.createValueCommand(command, iterator);
    this.g = SystemValue.createValueCommand(command, iterator);
    this.b = SystemValue.createValueCommand(command, iterator);
    this.grey = SystemValue.createValueCommand(command, iterator);
    if (RPM.numToBool(command[iterator.i++])) {
        this.subColor = RPM.numToBool(command[iterator.i++]);
        this.colorID = SystemValue.createValueCommand(command, iterator);
    }
    this.waitEnd = RPM.numToBool(command[iterator.i++]);
    this.time = SystemValue.createValueCommand(command, iterator);

    this.isDirectNode = true;
    this.parallel = !this.waitEnd;
}

EventCommandChangeScreenTone.prototype = Object.create(EventCommand.prototype);

// -------------------------------------------------------

EventCommandChangeScreenTone.prototype.initialize = function() {
    var time, color;

    time = this.time.getValue() * 1000;
    color = this.colorID ? RPM.datasGame.system.colors[this.colorID.getValue()] :
        null;

    return {
        parallel: this.waitEnd,
        finalDifRed: Math.max(Math.min((this.r.getValue() + (color ? color.red :
            0)) / 255, 1), -1) - RPM.screenTone.x,
        finalDifGreen: Math.max(Math.min((this.g.getValue() + (color ? color
            .green : 0)) / 255, 1), -1) - RPM.screenTone.y,
        finalDifBlue: Math.max(Math.min((this.b.getValue() + (color ? color.blue
            : 0)) / 255, 1), -1) - RPM.screenTone.z,
        finalDifGrey: Math.max(Math.min(1 - (this.grey.getValue() / 100), 1),
            -1) - RPM.screenTone.w,
        time: time,
        timeLeft: time
    }
}

// -------------------------------------------------------

EventCommandChangeScreenTone.prototype.update = function(currentState, object,
    state)
{
    if (currentState.parallel) {
        // Updating the time left
        let timeRate, dif;

        if (currentState.time === 0) {
            timeRate = 1;
        } else {
            dif = RPM.elapsedTime;
            currentState.timeLeft -= RPM.elapsedTime;
            if (currentState.timeLeft < 0) {
                dif += currentState.timeLeft;
                currentState.timeLeft = 0;
            }
            timeRate = dif / currentState.time;
        }

        // Update values
        RPM.screenTone.setX(RPM.screenTone.x + (timeRate * currentState
            .finalDifRed));
        RPM.screenTone.setY(RPM.screenTone.y + (timeRate * currentState
            .finalDifGreen));
        RPM.screenTone.setZ(RPM.screenTone.z + (timeRate * currentState
            .finalDifBlue));
        RPM.screenTone.setW(RPM.screenTone.w + (timeRate * currentState
            .finalDifGrey));
        RPM.updateBackgroundColor(RPM.currentMap.mapProperties.backgroundColor);

        // If time = 0, then this is the end of the command
        if (currentState.timeLeft === 0) {
            return 1;
        }

        return 0;
    }

    return 1;
}

// -------------------------------------------------------
//
//  CLASS EventCommandRemoveObjectFromMap
//
// -------------------------------------------------------

function EventCommandRemoveObjectFromMap(command) {
    var i, k, v;

    i = 0;
    k = command[i++];
    v = command[i++];
    this.objectID = SystemValue.create(k, v);

    this.isDirectNode = true;
    this.parallel = false;
}

EventCommandRemoveObjectFromMap.prototype = Object.create(EventCommand.prototype);

// -------------------------------------------------------

EventCommandRemoveObjectFromMap.prototype.initialize = function() {
    return {
        started: false,
        finished: false
    }
}

// -------------------------------------------------------

EventCommandRemoveObjectFromMap.prototype.update = function(currentState, object
    , state)
{
    var objectID;

    objectID = this.objectID.getValue();

    if (!currentState.started) {
        currentState.started = true;
        MapObject.getObjectAndPortion(object, objectID, this, function(removed,
            id, kind, i, objects, datas)
        {
            var index;

            if (datas.r.indexOf(id) === -1) {
                switch (kind) {
                case 0:
                    datas.m.splice(i, 1);
                    index = datas.min.indexOf(removed);
                    if (index === -1) {
                        datas = RPM.game.getPotionsDatas(RPM.currentMap.id, Math
                            .floor(removed.position.x / RPM.PORTION_SIZE), Math
                            .floor(removed.position.y / RPM.PORTION_SIZE), Math
                            .floor(removed.position.z / RPM.PORTION_SIZE));
                        datas.mout.splice(datas.mout.indexOf(removed), 1);
                    } else {
                        datas.min.splice(index, 1);
                    }
                    break;
                case 1:
                    if (i > -1) {
                        objects.splice(i, 1);
                    }
                    break;
                }

                removed.removed = true;
                removed.removeFromScene();
            }
            currentState.finished = true;
        });
    }

    return currentState.finished ? 1 : 0;
}

// -------------------------------------------------------
//
//  CLASS EventCommandStopReaction
//
// -------------------------------------------------------

function EventCommandStopReaction(command) {
    EventCommand.call(this, command);
}

EventCommandStopReaction.prototype = Object.create(EventCommand.prototype);

// -------------------------------------------------------

EventCommandStopReaction.prototype.update = function(currentState, object, state)
{
    return -3;
}

// -------------------------------------------------------
//
//  CLASS EventCommandAllowForbidSaves
//
// -------------------------------------------------------

function EventCommandAllowForbidSaves(command) {
    var i, k, v;

    EventCommand.call(this, command);
    i = 0;
    k = command[i++];
    v = command[i++];
    this.allow = SystemValue.create(k, v);
}

EventCommandAllowForbidSaves.prototype = Object.create(EventCommand.prototype);

// -------------------------------------------------------

EventCommandAllowForbidSaves.prototype.update = function(currentState, object,
    state)
{
    RPM.allowSaves = this.allow.getValue();

    return 1;
}

// -------------------------------------------------------
//
//  CLASS EventCommandAllowForbidMainMenu
//
// -------------------------------------------------------

function EventCommandAllowForbidMainMenu(command) {
    var i, k, v;

    EventCommand.call(this, command);
    i = 0;
    k = command[i++];
    v = command[i++];
    this.allow = SystemValue.create(k, v);
}

EventCommandAllowForbidMainMenu.prototype = Object.create(EventCommand.prototype);

// -------------------------------------------------------

EventCommandAllowForbidMainMenu.prototype.update = function(currentState, object
    , state)
{
    RPM.allowMainMenu = this.allow.getValue();

    return 1;
}

// -------------------------------------------------------
//
//  CLASS EventCommandCallACommonReaction
//
// -------------------------------------------------------

function EventCommandCallACommonReaction(command) {
    var i, l, k, v, paramID;

    EventCommand.call(this, command);
    i = 0;
    this.commonReactionID = command[i++];
    this.parameters = [];
    l = command.length;
    while (i < l) {
        paramID = command[i++];
        k = command[i++];
        v = command[i++];
        this.parameters[paramID] = SystemValue.create(k, v);
    }
}

EventCommandCallACommonReaction.prototype = Object.create(EventCommand.prototype);

// -------------------------------------------------------

EventCommandCallACommonReaction.prototype.initialize = function() {
    return {
        interpreter: null
    };
}

// -------------------------------------------------------

EventCommandCallACommonReaction.prototype.update = function(currentState, object
    , state)
{
    if (!currentState.interpreter) {
        var id, reaction, k, v, parameter;

        reaction = RPM.datasGame.commonEvents.commonReactions[this.commonReactionID];

        // Correct parameters for default values
        for (id in reaction.parameters) {
            v = reaction.parameters[id].value;
            parameter = this.parameters[id];
            k = parameter ? parameter.kind : PrimitiveValueKind.None;
            if (k <= PrimitiveValueKind.Default) {
                // If default value
                if (k === PrimitiveValueKind.Default) {
                    parameter = v;
                } else {
                    parameter = SystemValue.create(k, null);
                }
            }
            this.parameters[id] = parameter;
        }

        currentState.interpreter = new ReactionInterpreter(object, RPM.datasGame
            .commonEvents.commonReactions[this.commonReactionID], null, null,
            this.parameters);
    }

    RPM.blockingHero = currentState.interpreter.currentReaction.blockingHero;
    currentState.interpreter.update();
    if (currentState.interpreter.isFinished()) {
        currentState.interpreter.updateFinish();
        return 1;
    }

    return 0;
}

// -------------------------------------------------------

EventCommandCallACommonReaction.prototype.onKeyPressed = function(currentState,
    key)
{
    if (currentState.interpreter && currentState.interpreter.currentCommand) {
        currentState.interpreter.currentCommand.data.onKeyPressed(currentState
            .interpreter.currentCommandState, key);
    }

    EventCommand.prototype.onKeyPressed.call(this, currentState, key);
}

// -------------------------------------------------------

EventCommandCallACommonReaction.prototype.onKeyReleased = function(currentState,
    key)
{
    if (currentState.interpreter && currentState.interpreter.currentCommand) {
        currentState.interpreter.currentCommand.data.onKeyReleased(currentState
            .interpreter.currentCommandState, key);
    }

    EventCommand.prototype.onKeyReleased.call(this, currentState, key);
}

// -------------------------------------------------------

EventCommandCallACommonReaction.prototype.onKeyPressedRepeat = function(
    currentState, key)
{
    if (currentState.interpreter && currentState.interpreter.currentCommand) {
        return currentState.interpreter.currentCommand.data.onKeyPressedRepeat(
            currentState.interpreter.currentCommandState, key);
    }

    return EventCommand.prototype.onKeyPressedRepeat.call(this, currentState,
        key);
}

// -------------------------------------------------------

EventCommandCallACommonReaction.prototype.onKeyPressedAndRepeat = function(
    currentState, key)
{
    if (currentState.interpreter && currentState.interpreter.currentCommand) {
        currentState.interpreter.currentCommand.data.onKeyPressedAndRepeat(
            currentState.interpreter.currentCommandState, key);
    }

    EventCommand.prototype.onKeyPressedAndRepeat.call(this, currentState, key);
}

// -------------------------------------------------------

/** Draw the dialog box.
*   @param {Object} currentState The current state of the event.
*/
EventCommandCallACommonReaction.prototype.drawHUD = function(currentState) {
    if (currentState.interpreter && currentState.interpreter.currentCommand) {
        currentState.interpreter.currentCommand.data.drawHUD(currentState
            .interpreter.currentCommandState);
    }

    EventCommand.prototype.drawHUD.call(this, currentState);
}

// -------------------------------------------------------
//
//  CLASS EventCommandLabel
//
// -------------------------------------------------------

function EventCommandLabel(command) {
    EventCommand.call(this, command);
    let iterator = {
        i: 0
    }
    this.label = SystemValue.createValueCommand(command, iterator);
}

EventCommandLabel.prototype = Object.create(EventCommand.prototype);

// -------------------------------------------------------
//
//  CLASS EventCommandJumpToLabel
//
// -------------------------------------------------------

function EventCommandJumpToLabel(command) {
    EventCommand.call(this, command);
    let iterator = {
        i: 0
    }
    this.label = SystemValue.createValueCommand(command, iterator);
}

EventCommandJumpToLabel.prototype = Object.create(EventCommand.prototype);

// -------------------------------------------------------

EventCommandJumpToLabel.prototype.update = function(currentState, object
    , state)
{
    return this.label.getValue();
}

// -------------------------------------------------------
//
//  CLASS EventCommandComment
//
// -------------------------------------------------------

function EventCommandComment() {
    
}

// -------------------------------------------------------
//
//  CLASS EventCommandChangeAStatistic
//
// -------------------------------------------------------

function EventCommandChangeAStatistic(command) {
    EventCommand.call(this, command);
    var iterator = {
        i: 0
    }
    this.statisticID = SystemValue.createValueCommand(command, iterator);

    // Selection
    this.selection = command[iterator.i++];
    switch (this.selection)
    {
    case 0:
        this.heInstanceID = SystemValue.createValueCommand(command, iterator);
        break;
    case 1:
        this.groupIndex = command[iterator.i++];
        break;
    }
    
    // Operation
    this.operation = command[iterator.i++];

    // Value
    this.value = command[iterator.i++];
    switch (this.value)
    {
    case 0:
        this.vNumber = SystemValue.createValueCommand(command, iterator);
        break;
    case 1:
        this.vFormula = SystemValue.createValueCommand(command, iterator);
        break;
    case 2:
        this.vMax = true;
        break;
    }

    // Option
    this.canAboveMax = command[iterator.i++] === RPM.NUM_BOOL_TRUE;
}

EventCommandChangeAStatistic.prototype = Object.create(EventCommand.prototype);

// -------------------------------------------------------

EventCommandChangeAStatistic.prototype.update = function(currentState, object
    , state)
{
    let targets, target;
    let stat = RPM.datasGame.battleSystem.statistics[this.statisticID.getValue()];
    let abr = stat.abbreviation;
    switch (this.selection)
    {
    case 0:
        targets = [RPM.game.getHeroByInstanceID(this.heInstanceID.getValue())];
        break;
    case 1:
        targets = RPM.game.getTeam(this.groupIndex);
        break;
    }
    for (let i = 0, l = targets.length; i < l; i++)
    {
        target = targets[i];
        switch (this.value)
        {
        case 0:
            target[abr] = RPM.operators_numbers[this.operation](target[abr], 
                this.vNumber.getValue());
            break;
        case 1:
            target[abr] = RPM.operators_numbers[this.operation](target[abr],
                RPM.evaluateFormula(this.vFormula.getValue(), target, null));
            break;
        case 2:
            target[abr] = RPM.operators_numbers[this.operation](target[abr], 
                target[stat.getMaxAbbreviation()]);
            break;
        }
        if (!this.canAboveMax)
        {
            let max = target[stat.getMaxAbbreviation()];
            if (target[abr] > max)
            {
                target[abr] = max;
            }
        }
    }

    return 1;
}

// -------------------------------------------------------
//
//  CLASS EventCommandChangeName
//
// -------------------------------------------------------

function EventCommandChangeName(command) {
    EventCommand.call(this, command);
    var iterator = {
        i: 0
    }
    this.name = SystemValue.createValueCommand(command, iterator);

    // Selection
    this.selection = command[iterator.i++];
    switch (this.selection)
    {
    case 0:
        this.heInstanceID = SystemValue.createValueCommand(command, iterator);
        break;
    case 1:
        this.groupIndex = command[iterator.i++];
        break;
    }
}

EventCommandChangeName.prototype = Object.create(EventCommand.prototype);

// -------------------------------------------------------

EventCommandChangeName.prototype.update = function(currentState, object
    , state)
{
    let targets, target;
    let name = this.name.getValue();
    switch (this.selection)
    {
    case 0:
        targets = [RPM.game.getHeroByInstanceID(this.heInstanceID.getValue())];
        break;
    case 1:
        targets = RPM.game.getTeam(this.groupIndex);
        break;
    }
    for (let i = 0, l = targets.length; i < l; i++)
    {
        target = targets[i];
        target.character.name = name;
        target.name = name;
    }

    return 1;
}

// -------------------------------------------------------
//
//  CLASS EventCommandChangeEquipment
//
// -------------------------------------------------------

function EventCommandChangeEquipment(command) {
    EventCommand.call(this, command);
    var iterator = {
        i: 0
    };
    this.equipmentID = SystemValue.createValueCommand(command, iterator);
    this.isWeapon = RPM.numToBool(command[iterator.i++]);
    this.weaponArmorID = SystemValue.createValueCommand(command, iterator);

    // Selection
    this.selection = command[iterator.i++];
    switch (this.selection)
    {
    case 0:
        this.heInstanceID = SystemValue.createValueCommand(command, iterator);
        break;
    case 1:
        this.groupIndex = command[iterator.i++];
        break;
    }

    this.isApplyInInventory = RPM.numToBool(command[iterator.i++]);
}

EventCommandChangeEquipment.prototype = Object.create(EventCommand.prototype);

// -------------------------------------------------------

EventCommandChangeEquipment.prototype.update = function(currentState, object
    , state)
{
    let equipmentID = this.equipmentID.getValue();
    let kind = this.isWeapon ? ItemKind.Weapon : ItemKind.Armor;
    let weaponArmorID = this.weaponArmorID.getValue();
    let targets, target, item;
    switch (this.selection)
    {
    case 0:
        targets = [RPM.game.getHeroByInstanceID(this.heInstanceID.getValue())];
        break;
    case 1:
        targets = RPM.game.getTeam(this.groupIndex);
        break;
    }
    for (let i = 0, l = targets.length; i < l; i++)
    {
        target = targets[i];
        item = GameItem.findItem(kind, weaponArmorID);
        if (item === null)
        {
            if (this.isApplyInInventory)
            {
                break; // Don't apply because not in inventory
            }
            item = new GameItem(kind, weaponArmorID, 0);
        }
        if (target.equip[equipmentID] !== null)
        {
            target.equip[equipmentID].add(1);
        }
        target.equip[equipmentID] = item;
        if (this.isApplyInInventory)
        {
            item.remove(1);
        }
    }

    return 1;
}

// -------------------------------------------------------
//
//  CLASS EventCommandModifyCurrency
//
// -------------------------------------------------------

function EventCommandModifyCurrency(command) {
    EventCommand.call(this, command);
    var iterator = {
        i: 0
    };
    this.currencyID = SystemValue.createValueCommand(command, iterator);
    this.operation = command[iterator.i++];
    this.value = SystemValue.createValueCommand(command, iterator);
}

EventCommandModifyCurrency.prototype = Object.create(EventCommand.prototype);

// -------------------------------------------------------

EventCommandModifyCurrency.prototype.update = function(currentState, object
    , state)
{
    let currencyID = this.currencyID.getValue();
    RPM.game.currencies[currencyID] = RPM.operators_numbers[this.operation](RPM
        .game.currencies[currencyID], this.value.getValue());

    return 1;
}

// -------------------------------------------------------
//
//  CLASS EventCommandDisplayAnAnimation
//
// -------------------------------------------------------

function EventCommandDisplayAnAnimation(command) {
    EventCommand.call(this, command);
    var iterator = {
        i: 0
    };
    this.objectID = SystemValue.createValueCommand(command, iterator);
    this.animationID = SystemValue.createValueCommand(command, iterator);
    this.isWaitEnd = RPM.numToBool(command[iterator.i++]);
    this.isDirectNode = !this.isWaitEnd;
    this.parallel = !this.isWaitEnd;
}

EventCommandDisplayAnAnimation.prototype = Object.create(EventCommand.prototype);


EventCommandDisplayAnAnimation.prototype.initialize = function() {
    let animation = RPM.datasGame.animations.list[this.animationID.getValue()];
    return {
        parallel: this.isWaitEnd,
        animation: animation,
        picture: animation.createPicture(),
        frame: 1,
        frameMax: animation.frames.length - 1,
        object: null,
        waitingObject: false
    }
}

// -------------------------------------------------------

EventCommandDisplayAnAnimation.prototype.update = function(currentState, object
    , state)
{
    if (currentState.parallel) {
        if (!currentState.waitingObject) {
            let objectID = this.objectID.getValue();
            MapObject.updateObjectWithID(object, objectID, this, function(
                moved)
            {
                currentState.object = moved;
            });
            currentState.waitingObject = true;
        }
        if (currentState.object !== null) {
            currentState.object.topPosition = RPM.toScreenPosition(currentState
                .object.upPosition, RPM.currentMap.camera.threeCamera);
            currentState.object.midPosition = RPM.toScreenPosition(currentState
                .object.halfPosition, RPM.currentMap.camera.threeCamera);
            currentState.object.botPosition = RPM.toScreenPosition(currentState
                .object.position, RPM.currentMap.camera.threeCamera);
            currentState.animation.playSounds(currentState.frame, 
                AnimationEffectConditionKind.None);
            currentState.frame++;
            RPM.requestPaintHUD = true;
            return currentState.frame > currentState.frameMax ? 1 : 0;
        }
    }

    return 1;
}

// -------------------------------------------------------

EventCommandDisplayAnAnimation.prototype.drawHUD = function(currentState)
{
    if (currentState.object !== null) {
        currentState.animation.draw(currentState.picture, currentState.frame, 
            currentState.object)
    }
}

// -------------------------------------------------------
//
//  CLASS EventCommandShakeScreen
//
// -------------------------------------------------------

function EventCommandShakeScreen(command) {
    EventCommandChangeScreenTone.call(this, command);
    var iterator = {
        i: 0
    };
    this.offset = SystemValue.createValueCommand(command, iterator);
    this.shakeNumber = SystemValue.createValueCommand(command, iterator);
    this.isWaitEnd = RPM.numToBool(command[iterator.i++]);
    this.time = SystemValue.createValueCommand(command, iterator);

    this.isDirectNode = !this.isWaitEnd;
    this.parallel = !this.isWaitEnd;
}

EventCommandShakeScreen.updateTargetOffset = function(currentState, 
    timeRate)
{
    let value = timeRate * currentState.finalDifPos;
    RPM.currentMap.camera.targetOffset.x += value * -Math.sin(RPM.currentMap
        .camera.horizontalAngle * Math.PI / 180.0);
    RPM.currentMap.camera.targetOffset.z += value * Math.cos(RPM.currentMap
        .camera.horizontalAngle * Math.PI / 180.0);
}

EventCommandShakeScreen.prototype = Object.create(EventCommand.prototype);

EventCommandShakeScreen.prototype.initialize = function()
{
    let t = this.time.getValue();
    let time = t * 1000;
    let shakeNumber = this.shakeNumber.getValue() * 2;
    // Should be pair to have perfect cycles
    let totalShakes = shakeNumber * t;
    if (totalShakes % 2 !== 0)
    {
        let floor = Math.floor(totalShakes / 2) * 2;
        let ceil = floor + 2;
        shakeNumber = ((floor !== 0 && (totalShakes - floor) < (ceil - totalShakes)) ? floor : ceil) 
            / t; 
    }
    let shakeTime = 1 / (shakeNumber * 2) * 1000;
    let offset = this.offset.getValue();

    return {
        parallel: this.isWaitEnd,
        offset: offset,
        shakeTime: shakeTime,
        shakeTimeLeft: shakeTime,
        currentOffset: 0,
        beginPosX: RPM.currentMap.camera.targetOffset.x,
        beginPosZ: RPM.currentMap.camera.targetOffset.z,
        finalDifPos: -offset,
        time: time,
        timeLeft: time,
        left: true
    }
}

// -------------------------------------------------------

EventCommandShakeScreen.prototype.update = function(currentState, object
    , state)
{
    if (currentState.parallel) {
        let timeRate, dif, value;

        if (currentState.time === 0) {
            timeRate = 1;
        } else 
        {
            dif = RPM.elapsedTime;
            currentState.timeLeft -= RPM.elapsedTime;
            if (currentState.timeLeft < 0) {
                dif += currentState.timeLeft;
                currentState.timeLeft = 0;
            }
            currentState.shakeTimeLeft -= RPM.elapsedTime;
            if (currentState.shakeTimeLeft <= 0) {
                timeRate = (dif + currentState.shakeTimeLeft) / currentState
                    .shakeTime;
                EventCommandShakeScreen.updateTargetOffset(currentState, 
                    timeRate);
                dif = -currentState.shakeTimeLeft;
                currentState.shakeTimeLeft = currentState.shakeTime + 
                    currentState.shakeTimeLeft;
                currentState.currentOffset++;
                currentState.finalDifPos = (Math.ceil(currentState.currentOffset 
                    / 2) % 2 === 0) ? -currentState.offset : currentState.offset;
            }
            timeRate = dif / currentState.shakeTime;
        }
        EventCommandShakeScreen.updateTargetOffset(currentState, timeRate);
        if (currentState.timeLeft === 0)
        {
            RPM.currentMap.camera.targetOffset.x = currentState.beginPosX;
            RPM.currentMap.camera.targetOffset.z = currentState.beginPosZ;
            return 1;
        }
        return 0;
    }

    return 1;
}

// -------------------------------------------------------
//
//  CLASS EventCommandFlashScreen
//
// -------------------------------------------------------

function EventCommandFlashScreen(command) {
    EventCommand.call(this, command);
    var iterator = {
        i: 0
    }
    this.colorID = SystemValue.createValueCommand(command, iterator);
    this.isWaitEnd = RPM.numToBool(command[iterator.i++]);
    this.time = SystemValue.createValueCommand(command, iterator);
    this.isDirectNode = !this.isWaitEnd;
    this.parallel = !this.isWaitEnd;
}

EventCommandFlashScreen.prototype = Object.create(EventCommand.prototype);

EventCommandFlashScreen.prototype.initialize = function() {
    let time = this.time.getValue() * 1000;
    let color = RPM.datasGame.system.colors[this.colorID.getValue()];

    return {
        parallel: this.isWaitEnd,
        time: time,
        timeLeft: time,
        color: color.getHex(),
        finalDifA: -color.alpha,
        a: color.alpha
    }
}

// -------------------------------------------------------

EventCommandFlashScreen.prototype.update = function(currentState, object
    , state)
{
    if (currentState.parallel)
    {
        let timeRate, dif;

        if (currentState.time === 0) {
            timeRate = 1;
        } else {
            dif = RPM.elapsedTime;
            currentState.timeLeft -= RPM.elapsedTime;
            if (currentState.timeLeft < 0) {
                dif += currentState.timeLeft;
                currentState.timeLeft = 0;
            }
            timeRate = dif / currentState.time;
        }

        // Update values
        currentState.a = currentState.a + (timeRate * currentState.finalDifA);
        RPM.requestPaintHUD = true;

        return currentState.timeLeft === 0 ? 1 : 0;
    }

    return 1;
}

// -------------------------------------------------------

EventCommandFlashScreen.prototype.drawHUD = function(currentState) {
    Platform.ctx.fillStyle = currentState.color;
    Platform.ctx.globalAlpha = currentState.a;
    Platform.ctx.fillRect(0, 0, RPM.CANVAS_WIDTH, RPM.CANVAS_HEIGHT);
    Platform.ctx.globalAlpha = 1.0;
}
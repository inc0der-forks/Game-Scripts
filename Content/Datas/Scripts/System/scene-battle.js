/*
    RPG Paper Maker Copyright (C) 2017-2019 Marie Laporte

    Commercial license for commercial use of your games:
        https://creativecommons.org/licenses/by-nc/4.0/.

    See more information here: http://rpg-paper-maker.com/index.php/downloads.
*/

// -------------------------------------------------------
//
//  CLASS SceneBattle : SceneGame
//
// -------------------------------------------------------

/** @class
*   A scene for battling.
*   @extends SceneGame
*   @property {boolean} winning Boolean indicating whether the player won the
*                       battle or not.
*   @property {number} troopID Current troop the allies are fighting.
*   @property {boolean} canEscape Boolean indicating if the player can escape
*                       this battle.
*   @property {boolean} canGameOver Boolean indicating if there a win/lose node
*                       or not.
*   @property {CharacterKind} kindSelection Indicating which group is currently
*                             selected.
*   @property {CharacterKind} attackingGroup Indicating which group is currently
*                             attacking.
*   @property {number} step Step of the battle.
*   @property {number} subStep Sub-step of the battle (usefull for menus or
*                              other sub-steps).
*   @property {number} selectedUserIndex Index of the selected user.
*   @property {number} distanceCenterAlly The distance between the center of map
*                      battle and ally.
*   @property {number} time A chronometer.
*   @property {Player[]} targets List of all the current targets.
*   @property {Array.<Array.<Player>>} battlers Battlers of all the
*                                      allies/enemies.
*   @property {WindowBox} windowTopInformations The window on top that shows
*   specific informations.
*   @property {WindowBox} windowCharacterInformations The window on bot that
*   shows characteristics informations.
*   @property {WindowChoice} windowChoicesBattleCommands The window for battle
*   commands.
*   @property {WindowBox} arrowSelection The arrow used to select
*   allies/ennemies.
*   @property {GraphicText} textsDamages List of all the damages to display.
*/

function SceneBattle(troopID, canGameOver, canEscape, battleMap, transitionStart,
    transitionEnd, cameraDistance, transitionStartColor, transitionEndColor)
{
    SceneMap.call(this, battleMap.idMap, true);

    this.transitionStart = transitionStart;
    this.transitionEnd = transitionEnd;
    this.transitionZoom = false;
    this.transitionStartColor = transitionStartColor;
    this.transitionEndColor = transitionEndColor;
    this.transitionColorAlpha = 0;
    this.transitionColor = transitionStart === 1;
    this.cameraDistance = cameraDistance;
    this.camera.distance = 180;
    this.camera.verticalAngle = 60;
    this.step = 0;
    this.troopID = troopID;
    this.canGameOver = canGameOver;
    this.canEscape = canEscape;
    this.sceneMap = $gameStack.top();

    // Camera settings
    this.cameraStep = 0;
    this.cameraTick = 0.05;
    this.cameraOffset = 3;
    this.cameraON = transitionStart !== 2;
    if (!this.cameraON) {
        this.camera.distance = 10;
        this.transitionZoom = true;
    }
    this.camera.update();

    this.initialize();
}

SceneBattle.TRANSITION_COLOR_VALUE = 0.1;
SceneBattle.TRANSITION_COLOR_END_WAIT = 600;
SceneBattle.TIME_END_WAIT = 1000;
SceneBattle.TIME_PROGRESSION_XP = 3000;
SceneBattle.TIME_LINEAR_MUSIC_END = 500;
SceneBattle.TIME_LINEAR_MUSIC_START = 500;
SceneBattle.TIME_ACTION_ANIMATION = 2000;

SceneBattle.prototype = Object.create(SceneMap.prototype);

/** Make the attacking group all actives.
*/
SceneBattle.prototype.activeGroup = function(){
    var i, l;
    for (i = 0, l = this.battlers[this.attackingGroup].length; i < l; i++){
        this.battlers[this.attackingGroup][i].setActive(true);
    }
};

// -------------------------------------------------------

/** Check if a player is defined (active and not dead).
*   @param {CharacterKind} kind Kind of player.
*   @param {number} index Index in the group.
*   @returns {boolean}
*/
SceneBattle.prototype.isDefined = function(kind, index, target) {
    return ((target || this.battlers[kind][index].active) &&
            !this.battlers[kind][index].character.isDead())
};

// -------------------------------------------------------

/** Check if all the heroes or enemies are inactive.
*   @returns {boolean}
*/
SceneBattle.prototype.isEndTurn = function(){
    var i, l;

    for (i = 0, l = this.battlers[this.attackingGroup].length; i < l; i++){
        if (this.isDefined(this.attackingGroup, i))
            return false;
    }

    return true;
};

// -------------------------------------------------------

/** Check if all the heroes or enemies are dead.
*   @param {CharacterKind} group Kind of player.
*   @returns {boolean}
*/
SceneBattle.prototype.isGroupDead = function(group){
    var i, l;

    for (i = 0, l = this.battlers[group].length; i < l; i++){
        if (!this.battlers[group][i].character.isDead())
            return false;
    }

    return true;
};

// -------------------------------------------------------

/** Check if all the enemies are dead.
*   @returns {boolean}
*/
SceneBattle.prototype.isWin = function(){
    return this.isGroupDead(CharacterKind.Monster);
};

// -------------------------------------------------------

/** Check if all the heroes are dead.
*   @returns {boolean}
*/
SceneBattle.prototype.isLose = function(){
    return this.isGroupDead(CharacterKind.Hero);
};

// -------------------------------------------------------

/** Transition to game over scene.
*/
SceneBattle.prototype.gameOver = function(){
    if (this.canGameOver){
        quit(); // TODO
    }
    else {
        this.endBattle();
    }
};

// -------------------------------------------------------

/** Win the battle.
*/
SceneBattle.prototype.win = function(){
    this.winning = true;
    this.endBattle();
};

// -------------------------------------------------------

/** Win the battle.
*/
SceneBattle.prototype.endBattle = function(){
    var i, l;

    // Heroes
    l = $game.teamHeroes.length;
    for (i = 0; i < l; i++) {
        this.battlers[CharacterKind.Hero][i].removeFromScene();
    }

    $currentMap.closeMap();
    $gameStack.pop();
    $currentMap = $gameStack.top();
};

// -------------------------------------------------------

/** Change the step of the battle.
*   @param {number} i Step of the battle.
*/
SceneBattle.prototype.changeStep = function(i){
    this.step = i;
    this.subStep = 0;
    this.initialize();
};

// -------------------------------------------------------

/** Initialize the current step.
*/
SceneBattle.prototype.initialize = function(){
    switch(this.step){
    case 0:
        this.initializeStep0(); break;
    case 1:
        this.initializeStep1(); break;
    case 2:
        this.initializeStep2(); break;
    case 3:
        this.initializeStep3(); break;
    case 4:
        this.initializeStep4(); break;
    }
    $requestPaintHUD = true;
};

// -------------------------------------------------------

SceneBattle.prototype.update = function(){
    var i, l, battlers;

    SceneMap.prototype.update.call(this);

    // Heroes
    battlers = this.battlers[CharacterKind.Hero];
    for (i = 0, l = battlers.length; i < l; i++) {
        battlers[i].update();
    }
    // Ennemies
    battlers = this.battlers[CharacterKind.Monster];
    for (i = 0, l = battlers.length; i < l; i++) {
        battlers[i].update();
    }

    // Camera temp code for moving
    if (this.cameraON) {
        switch (this.cameraStep) {
        case 0:
            this.camera.distance -= this.cameraTick;
            this.camera.targetOffset.x += this.cameraTick;
            if (this.camera.distance <= 180 - this.cameraOffset) {
                this.camera.distance = 180 - this.cameraOffset;
                this.camera.targetOffset.x = this.cameraOffset;
                this.cameraStep = 1;
            }
            break;
        case 1:
            this.camera.distance += this.cameraTick;
            if (this.camera.distance >= 180 + this.cameraOffset) {
                this.camera.distance = 180 + this.cameraOffset;
                this.cameraStep = 2;
            }
            break;
        case 2:
            this.camera.distance -= this.cameraTick;
            this.camera.targetOffset.x -= this.cameraTick;
            if (this.camera.distance <= 180 - this.cameraOffset) {
                this.camera.distance = 180 - this.cameraOffset;
                this.camera.targetOffset.x = -this.cameraOffset;
                this.cameraStep = 3;
            }
            break;
        case 3:
            this.camera.distance += this.cameraTick;
            if (this.camera.distance >= 180 + this.cameraOffset) {
                this.camera.distance = 180 + this.cameraOffset;
                this.cameraStep = 4;
            }
            break;
        case 4:
            this.camera.distance -= this.cameraTick;
            this.camera.targetOffset.x += this.cameraTick;
            if (this.camera.distance <= 180) {
                this.camera.distance = 180;
                this.camera.targetOffset.x = 0;
                this.cameraStep = 0;
            }
            break;
        }
    }

    switch(this.step) {
    case 0:
        this.updateStep0(); break;
    case 1:
        this.updateStep1(); break;
    case 2:
        this.updateStep2(); break;
    case 3:
        this.updateStep3(); break;
    case 4:
        this.updateStep4(); break;
    }
};

// -------------------------------------------------------

SceneBattle.prototype.onKeyPressed = function(key){
    switch(this.step){
    case 0:
        this.onKeyPressedStep0(key); break;
    case 1:
        this.onKeyPressedStep1(key); break;
    case 2:
        this.onKeyPressedStep2(key); break;
    case 3:
        this.onKeyPressedStep3(key); break;
    case 4:
        this.onKeyPressedStep4(key); break;
    }
};

// -------------------------------------------------------

SceneBattle.prototype.onKeyReleased = function(key){
    switch(this.step){
    case 0:
        this.onKeyReleasedStep0(key); break;
    case 1:
        this.onKeyReleasedStep1(key); break;
    case 2:
        this.onKeyReleasedStep2(key); break;
    case 3:
        this.onKeyReleasedStep3(key); break;
    case 4:
        this.onKeyReleasedStep4(key); break;
    }
};

// -------------------------------------------------------

SceneBattle.prototype.onKeyPressedRepeat = function(key){
    switch(this.step){
    case 0:
        this.onKeyPressedRepeatStep0(key); break;
    case 1:
        this.onKeyPressedRepeatStep1(key); break;
    case 2:
        this.onKeyPressedRepeatStep2(key); break;
    case 3:
        this.onKeyPressedRepeatStep3(key); break;
    case 4:
        this.onKeyPressedRepeatStep4(key); break;
    }
};

// -------------------------------------------------------

SceneBattle.prototype.onKeyPressedAndRepeat = function(key){
    switch(this.step){
    case 0:
        this.onKeyPressedAndRepeatStep0(key); break;
    case 1:
        this.onKeyPressedAndRepeatStep1(key); break;
    case 2:
        this.onKeyPressedAndRepeatStep2(key); break;
    case 3:
        this.onKeyPressedAndRepeatStep3(key); break;
    case 4:
        this.onKeyPressedAndRepeatStep4(key); break;
    }
};

// -------------------------------------------------------

SceneBattle.prototype.draw3D = function(canvas){
    if (this.transitionZoom || this.transitionColor) {
        this.sceneMap.draw3D(canvas);
    } else {
        SceneMap.prototype.draw3D.call(this, canvas);
    }
};

// -------------------------------------------------------

SceneBattle.prototype.drawHUD = function() {
    switch(this.step){
    case 0:
        this.drawHUDStep0(); break;
    case 1:
        this.drawHUDStep1(); break;
    case 2:
        this.drawHUDStep2(); break;
    case 3:
        this.drawHUDStep3(); break;
    case 4:
        this.drawHUDStep4(); break;
    }
};

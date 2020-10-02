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
//  CLASS SceneDescriptionState : SceneGame
//
// -------------------------------------------------------

/** @class
*   A scene in the menu for describing players statistics.
*   @extends SceneGame
*   @property {WindowBox} windowTop Window on top with "State" text.
*   @property {WindowTabs} windowChoicesTabs Window for each tabs.
*   @property {WindowBox} windowInformations Window for skill informations.
*/
function SceneDescriptionState() {
    SceneGame.call(this);

    var nbHeroes, i;
    var listHeroes;

    // Tab heroes
    nbHeroes = RPM.game.teamHeroes.length;
    listHeroes = new Array(nbHeroes);
    for (i = 0; i < nbHeroes; i++)
        listHeroes[i] = new GraphicPlayerDescription(RPM.game.teamHeroes[i]);

    // All the windows
    this.windowTop = new WindowBox(20, 20, 200, 30, 
        {
            content: new GraphicText("State", { align: Align.Center })
        }
    );
    this.windowChoicesTabs = new WindowChoices(50, 60, 110, RPM
        .SMALL_SLOT_HEIGHT, listHeroes,
        {
            orientation: OrientationWindow.Horizontal,
            nbItemsMax: 4
        }
    );
    this.windowInformations = new WindowBox(20, 100, 600, 340,
        {
            padding: RPM.HUGE_PADDING_BOX
        }
    );
    this.synchronize();
}

SceneDescriptionState.prototype = {

    /** Synchronize informations with selected hero.
    */
    synchronize: function(){
        this.windowInformations.content =
             this.windowChoicesTabs.getCurrentContent();
    },

    // -------------------------------------------------------

    update: function(){
        SceneGame.prototype.update.call(RPM.currentMap);
        this.windowInformations.content.updateBattler();
    },

    // -------------------------------------------------------

    onKeyPressed: function(key){
        SceneGame.prototype.onKeyPressed.call(RPM.currentMap, key);

        if (DatasKeyBoard.isKeyEqual(key,
                                     RPM.datasGame.keyBoard.menuControls.Cancel) ||
            DatasKeyBoard.isKeyEqual(key,
                                     RPM.datasGame.keyBoard.MainMenu))
        {
            RPM.datasGame.system.soundCancel.playSound();
            RPM.gameStack.pop();
        }
    },

    // -------------------------------------------------------

    onKeyReleased: function(key){
        SceneGame.prototype.onKeyReleased.call(RPM.currentMap, key);
    },

    // -------------------------------------------------------

    onKeyPressedRepeat: function(key){
        SceneGame.prototype.onKeyPressedRepeat.call(RPM.currentMap, key);
    },

    // -------------------------------------------------------

    onKeyPressedAndRepeat: function(key){
        SceneGame.prototype.onKeyPressedAndRepeat.call(RPM.currentMap, key);

        var indexTab = this.windowChoicesTabs.currentSelectedIndex;
        this.windowChoicesTabs.onKeyPressedAndRepeat(key);
        this.synchronize();
    },

    // -------------------------------------------------------

    draw3D: function(canvas){
        RPM.currentMap.draw3D(canvas);
    },

    // -------------------------------------------------------

    drawHUD: function(){

        // Draw the local map behind
        RPM.currentMap.drawHUD();

        // Draw the menu
        this.windowTop.draw();
        this.windowChoicesTabs.draw();
        this.windowInformations.draw();
    },

    close: function()
    {

    }
}

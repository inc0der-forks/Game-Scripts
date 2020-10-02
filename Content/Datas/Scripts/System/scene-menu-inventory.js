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
//  CLASS SceneMenuInventory : GameState
//
// -------------------------------------------------------

/** @class
*   A scene in the menu for describing inventory.
*   @extends SceneGame
*   @property {WindowBox} windowTop Window on top with "Inventory" text.
*   @property {WindowTabs} windowChoicesTabs Window for each tabs.
*   @property {WindowBox} windowInformations Window for item informations.
*   @property {WindowChoices} windowChoicesList Window for each items.
*/
function SceneMenuInventory() {
    SceneGame.call(this);

    var menuKind;
    var i, l;

    // Initializing the top menu for item kinds
    menuKind = [
        new GraphicText("All", { align: Align.Center }),
        new GraphicText("Consumables", { align: Align.Center }),
        new GraphicText(RPM.datasGame.system.itemsTypes[1].name, { align: Align
            .Center }),
        new GraphicText(RPM.datasGame.system.itemsTypes[2].name, { align: Align
            .Center }),
        new GraphicText("Weapons", { align: Align.Center }),
        new GraphicText("Armors", { align: Align.Center })
    ];

    // All the windows
    this.windowTop = new WindowBox(20, 20, 200, 30,
        {
            content: new GraphicText("Inventory", { align: Align.Center })
        }
    );
    this.windowChoicesTabs = new WindowChoices(5, 60, 105, RPM.SMALL_SLOT_HEIGHT
        , menuKind,
        {
            orientation: OrientationWindow.Horizontal,
            nbItemsMax: 6
        }
    );
    this.windowChoicesList = new WindowChoices(20, 100, 200, RPM
        .SMALL_SLOT_HEIGHT, [],
        {
            nbItemsMax: SceneMenu.nbItemsToDisplay,
        }
    );
    this.windowInformations = new WindowBox(240, 100, 360, 200,
        {
            padding: RPM.HUGE_PADDING_BOX
        }
    );
    this.windowEmpty = new WindowBox(10, 100, RPM.SCREEN_X - 20, RPM
        .SMALL_SLOT_HEIGHT, 
        {
            content: new GraphicText("Empty", { align: Align.Center }),
            padding: RPM.SMALL_SLOT_PADDING
        }
    );
    this.windowBoxUseItem = new WindowBox(240, 320, 360, 140,
        {
            content: new GraphicUserSkillItem(),
            padding: RPM.SMALL_PADDING_BOX
        }
    );
    l = menuKind.length;
    this.positionChoice = new Array(l);
    for (i = 0; i < l; i++) {
        this.positionChoice[i] = {
            index: 0,
            offset: 0
        };
    }

    // Update for changing tab
    this.substep = 0;
    this.updateForTab();

    this.synchronize();
}

SceneMenuInventory.prototype = {

    /** Update informations to display.
    */
    synchronize: function(){
        this.windowInformations.content =
             this.windowChoicesList.getCurrentContent();
    },

    // -------------------------------------------------------

    /** Update tab.
    */
    updateForTab: function(){
        var i, list;
        var indexTab = this.windowChoicesTabs.currentSelectedIndex;
        var nbItems = RPM.game.items.length;

        list = [];
        for (i = 0; i < nbItems; i++){
            var ownedItem = RPM.game.items[i];
            var item = RPM.datasGame.items.list[ownedItem.id];
            if (indexTab === 0 ||
                (indexTab === 1 && (ownedItem.k === ItemKind.Item
                                    && item.consumable)) ||
                (indexTab === 2 && (ownedItem.k === ItemKind.Item
                                    && item.idType === 1)) ||
                (indexTab === 3 && (ownedItem.k === ItemKind.Item
                                    && item.idType === 2)) ||
                (indexTab === 4 && ownedItem.k === ItemKind.Weapon) ||
                (indexTab === 5 && ownedItem.k === ItemKind.Armor))
            {
                list.push(new GraphicItem(ownedItem));
            }
        }

        this.windowChoicesList.setContentsCallbacks(list);
        this.windowChoicesList.unselect();
        this.windowChoicesList.offsetSelectedIndex = this.positionChoice[
            indexTab].offset;
        this.windowChoicesList.select(this.positionChoice[indexTab].index);
    },

    // -------------------------------------------------------

    update: function() {
        SceneGame.prototype.update.call(RPM.currentMap);

        if (this.windowChoicesList.currentSelectedIndex !== -1) {
            this.windowBoxUseItem.update();
        }
    },

    // -------------------------------------------------------

    onKeyPressed: function(key) {
        SceneGame.prototype.onKeyPressed.call(RPM.currentMap, key);

        switch (this.substep) {
        case 0:
            if (DatasKeyBoard.isKeyEqual(key, RPM.datasGame.keyBoard.menuControls
                .Action))
            {
                var targetKind, availableKind;

                if (this.windowInformations.content === null) {
                    return;
                }

                targetKind = this.windowInformations.content.item.targetKind;
                availableKind = this.windowInformations.content.item
                    .availableKind;
                if (this.windowInformations.content.item.consumable && (
                    targetKind === TargetKind.Ally || targetKind === TargetKind
                    .AllAllies) && (availableKind === AvailableKind.Always ||
                    availableKind === AvailableKind.MainMenu))
                {
                    RPM.datasGame.system.soundConfirmation.playSound();
                    this.substep = 1;
                    this.windowBoxUseItem.content.setAll(targetKind ===
                        TargetKind.AllAllies);
                    RPM.requestPaintHUD = true;
                } else {
                    RPM.datasGame.system.soundImpossible.playSound();
                }
            } else if (DatasKeyBoard.isKeyEqual(key, RPM.datasGame.keyBoard
                .menuControls.Cancel) || DatasKeyBoard.isKeyEqual(key,
                RPM.datasGame.keyBoard.MainMenu))
            {
                RPM.datasGame.system.soundCancel.playSound();
                RPM.gameStack.pop();
            }
            break;
        case 1:
            if (DatasKeyBoard.isKeyEqual(key, RPM.datasGame.keyBoard.menuControls
                .Action))
            {
                if (this.windowInformations.content.item.isPossible() && this
                    .windowInformations.content.item.use())
                {
                    RPM.game.useItem(this.windowInformations.content.gameItem);
                    if (this.windowInformations.content.gameItem.nb > 0) {
                        this.windowInformations.content.updateNb();
                    } else {
                        this.updateForTab();
                    }
                    this.windowBoxUseItem.content.updateStats();
                    RPM.requestPaintHUD = true;
                }
            } else if (DatasKeyBoard.isKeyEqual(key, RPM.datasGame.keyBoard
                .menuControls.Cancel) || DatasKeyBoard.isKeyEqual(key,
                RPM.datasGame.keyBoard.MainMenu))
            {
                RPM.datasGame.system.soundCancel.playSound();
                this.substep = 0;
                RPM.requestPaintHUD = true;
            }
            break;
        }
    },

    // -------------------------------------------------------

    onKeyReleased: function(key) {
        SceneGame.prototype.onKeyReleased.call(RPM.currentMap, key);
    },

    // -------------------------------------------------------

    onKeyPressedRepeat: function(key) {
        SceneGame.prototype.onKeyPressedRepeat.call(RPM.currentMap, key);
    },

    // -------------------------------------------------------

    onKeyPressedAndRepeat: function(key) {
        SceneGame.prototype.onKeyPressedAndRepeat.call(RPM.currentMap, key);
        
        switch (this.substep) {
        case 0:
            var position;

            // Tab
            var indexTab = this.windowChoicesTabs.currentSelectedIndex;
            this.windowChoicesTabs.onKeyPressedAndRepeat(key);
            if (indexTab !== this.windowChoicesTabs.currentSelectedIndex) {
                this.updateForTab();
            }

            // List
            this.windowChoicesList.onKeyPressedAndRepeat(key);
            position = this.positionChoice[this.windowChoicesTabs
                .currentSelectedIndex];
            position.index = this.windowChoicesList.currentSelectedIndex;
            position.offset = this.windowChoicesList.offsetSelectedIndex;
            break;
        case 1:
            this.windowBoxUseItem.content.onKeyPressedAndRepeat(key);
            break;
        }

        this.synchronize();
    },

    // -------------------------------------------------------

    draw3D: function(canvas){
        RPM.currentMap.draw3D(canvas);
    },

    // -------------------------------------------------------

    drawHUD: function(context){

        // Draw the local map behind
        RPM.currentMap.drawHUD(context);

        // Draw the menu
        this.windowTop.draw();
        this.windowChoicesTabs.draw();
        this.windowChoicesList.draw();
        if (this.windowChoicesList.listWindows.length > 0) {
            this.windowInformations.draw();
            if (this.substep === 1) {
                this.windowBoxUseItem.draw();
            }
        } else {
            this.windowEmpty.draw();
        }
    },

    close: function()
    {

    }
}

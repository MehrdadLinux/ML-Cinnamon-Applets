const Lang = imports.lang;
const Applet = imports.ui.applet;
const GLib = imports.gi.GLib;
const St = imports.gi.St;
const PopupMenu = imports.ui.popupMenu;
const Mainloop = imports.mainloop;
const ByteArray = imports.byteArray;
const Settings = imports.ui.settings;

class SimpleGoldApplet extends Applet.TextApplet {
    constructor(metadata, orientation, panel_height, instance_id) {
        super(orientation, panel_height, instance_id);
        
        this.set_applet_tooltip(_("Gold Price"));
        
        // Initialize settings
        this.settings = new Settings.AppletSettings(this, metadata.uuid, instance_id);
        this.settings.bind("up-color", "upColor", this._updatePrice);
        this.settings.bind("down-color", "downColor", this._updatePrice);
        this.settings.bind("neutral-color", "neutralColor", this._updatePrice);
        
        // Create a menu
        this.menuManager = new PopupMenu.PopupMenuManager(this);
        this.menu = new Applet.AppletPopupMenu(this, orientation);
        this.menuManager.addMenu(this.menu);
        
        // Add menu items
        this.menuItemLastUpdate = new PopupMenu.PopupMenuItem(_("Last update: Never"));
        this.menuItemLastUpdate.setSensitive(false);
        this.menu.addMenuItem(this.menuItemLastUpdate);
        
        this.menuItemDirection = new PopupMenu.PopupMenuItem(_("Direction: None"));
        this.menuItemDirection.setSensitive(false);
        this.menu.addMenuItem(this.menuItemDirection);
        
        this.menuItemChange = new PopupMenu.PopupMenuItem(_("Change: None"));
        this.menuItemChange.setSensitive(false);
        this.menu.addMenuItem(this.menuItemChange);
        
        // Add refresh button
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        let menuItemRefresh = new PopupMenu.PopupMenuItem(_("Refresh Now"));
        menuItemRefresh.connect('activate', Lang.bind(this, this._updatePrice));
        this.menu.addMenuItem(menuItemRefresh);
        
        this._timeout = null;
        this.set_applet_label("Loading...");
        
        // Start update cycle
        this._updatePrice();
    }
    
    _updatePrice() {
        try {
            let command = ["curl", "-s", "https://api.tgju.org/v1/widget/tmp?keys=geram18"];
            let [success, output] = GLib.spawn_sync(null, command, null, GLib.SpawnFlags.SEARCH_PATH, null);
            
            if (success) {
                if (typeof output === 'object' && output instanceof Uint8Array) {
                    output = ByteArray.toString(output);
                }
                
                let data = JSON.parse(output);
                
                // Correctly traverse the JSON structure
                if (data && data.response && data.response.indicators && 
                    data.response.indicators.length > 0) {
                    
                    let goldData = data.response.indicators[0];
                    
                    if (goldData.p) {
                        // Get the "p" value from the correct location in the JSON
                        let pValue = goldData.p;
                        
                        // Format the number with commas for better readability
                        let formattedValue = this._formatNumber(pValue);
                        
                        // Update the applet label
                        this.set_applet_label(formattedValue);
                        
                        // Set color based on dt value (direction)
                        if (goldData.dt === "low") {
                            // Price is decreasing
                            this.actor.style = "color: " + this.downColor + ";";
                            this.menuItemDirection.label.text = _("وضعیت قیمت: کاهشی");
                        } else if (goldData.dt === "high") {
                            // Price is increasing
                            this.actor.style = "color: " + this.upColor + ";";
                            this.menuItemDirection.label.text = _("وضعیت قیمت: افزایشی");
                        } else {
                            // No change or unknown
                            this.actor.style = "color: " + this.neutralColor + ";";
                            this.menuItemDirection.label.text = _("میزان تغییرات: " + goldData.dt);
                        }
                        
                        // Update additional info in menu
                        if (goldData.dp) {
                            this.menuItemChange.label.text = _("تغییر " + goldData.dp + "% (" + this._formatNumber(goldData.d) + ")");
                        }
                        
                        // Update last update time
                        let now = new Date();
                        this.menuItemLastUpdate.label.text = _("آخرین به‌روزرسانی ") + now.toLocaleTimeString();
                    } else {
                        global.logError("Gold Price applet error: Could not find price in API response");
                        this.set_applet_label("No data");
                    }
                } else {
                    global.logError("Gold Price applet error: Invalid API response structure");
                    this.set_applet_label("No data");
                }
            }
        } catch (e) {
            global.logError("Gold Price applet error: " + e);
            this.set_applet_label("Error");
        }
        
        // Update every 5 minutes
        if (this._timeout) {
            Mainloop.source_remove(this._timeout);
        }
        this._timeout = Mainloop.timeout_add_seconds(300, Lang.bind(this, this._updatePrice));
        return false;
    }
    
    // Helper function to format numbers with commas
    _formatNumber(num) {
        //Convert Rial to Toman by dividing the number by 10
        num = Math.floor(num / 10);
        let numStr = num.toString();
        let result = '';
        let counter = 0;
        
        // Add commas every 3 digits from right to left
        for (let i = numStr.length - 1; i >= 0; i--) {
            result = numStr.charAt(i) + result;
            counter++;
            if (counter % 3 === 0 && i > 0) {
                result = ',' + result;
            }
        }
        
        return result;
    }
    
    on_applet_clicked() {
        this.menu.toggle();
    }
    
    on_applet_removed_from_panel() {
        if (this._timeout) {
            Mainloop.source_remove(this._timeout);
        }
        this.settings.finalize();
    }
}

function main(metadata, orientation, panel_height, instance_id) {
    return new SimpleGoldApplet(metadata, orientation, panel_height, instance_id);
}
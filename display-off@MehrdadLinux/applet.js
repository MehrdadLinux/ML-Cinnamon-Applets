const Applet = imports.ui.applet;
const GLib = imports.gi.GLib;
const Lang = imports.lang;
const St = imports.gi.St;
const Util = imports.misc.util;

function MyApplet(orientation, panel_height, instance_id) {
    this._init(orientation, panel_height, instance_id);
}

MyApplet.prototype = {
    __proto__: Applet.IconApplet.prototype,

    _init: function(orientation, panel_height, instance_id) {
        Applet.IconApplet.prototype._init.call(this, orientation, panel_height, instance_id);

        // Set icon
        this.set_applet_icon_name("video-display-symbolic");
        this.set_applet_tooltip(_("Turn Display Off"));
    },

    on_applet_clicked: function() {
        // Execute the command to turn off the display
        Util.spawnCommandLine("bash -c 'cinnamon-screensaver-command -l; xset dpms force off;'");
    }
};

function main(metadata, orientation, panel_height, instance_id) {
    return new MyApplet(orientation, panel_height, instance_id);
}
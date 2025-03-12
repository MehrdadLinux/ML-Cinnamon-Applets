# ML-Cinnamon-Applets
Simple examples for writing a Cinnamon Applet



- Applets are stored in the ~/.local/share/cinnamon/applets directory

```
mkdir -p ~/.local/share/cinnamon/applets/hello-world@yourname
cd ~/.local/share/cinnamon/applets/hello-world@yourname
```

## metadata.json
to set icon for applet 
https://specifications.freedesktop.org/icon-naming-spec/latest/#index
```
"icon": "mail-mark-notjunk"
or 
"icon": "path/to/your/icon.png"

```
## applet.js
## Reload Cinnamon:
```
cinnamon --replace &
```

# Load Icon
in linux in this path 
```
/usr/share/icons
/.local/share/icons/

```

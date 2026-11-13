(() => {
    "use strict";

    const ROOT_CLASS = "dsn-nova-runtime";
    const LIGHT_CLASS = "dsn-nova-light-mode";
    const DARK_CLASS = "dsn-nova-dark-mode";
    const WALLPAPER_CLASS = "dsn-nova-wallpaper-enabled";

    const STYLE_ID = "dsn-nova-runtime-wallpaper-style";
    const GEOMETRY_LAYER_CLASS = "dsn-nova-geometry-layer";

    let refreshPending = false;
    let observer = null;

    function getWorkbench() {
        return document.querySelector(".monaco-workbench");
    }

    function getCurrentThemeType() {
        const workbench = getWorkbench();

        if (!workbench) {
            return "dark";
        }

        const isLightTheme =
            workbench.classList.contains("vs") &&
            !workbench.classList.contains("vs-dark") &&
            !workbench.classList.contains("hc-black");

        return isLightTheme ? "light" : "dark";
    }

    function isHorizonTheme() {
        const workbench = getWorkbench();

        return (
            !!workbench &&
            window
                .getComputedStyle(workbench)
                .getPropertyValue("--vscode-editorGutter-commentRangeForeground")
                .trim()
                .toLowerCase()
                .startsWith("#0a1b2c")
        );
    }

    function roleDefault(role, light) {
        if (light) {
            return role.light;
        }

        return isHorizonTheme() ? role.horizon : role.dark;
    }

    function applyAppearance() {
        const workbench = getWorkbench();
        const appearance = getCurrentThemeType();

        document.documentElement.classList.add(ROOT_CLASS);
        document.body.classList.add(ROOT_CLASS);

        document.documentElement.classList.remove(
            LIGHT_CLASS,
            DARK_CLASS
        );

        document.body.classList.remove(
            LIGHT_CLASS,
            DARK_CLASS
        );

        const appearanceClass =
            appearance === "light"
                ? LIGHT_CLASS
                : DARK_CLASS;

        document.documentElement.classList.add(
            appearanceClass
        );

        document.body.classList.add(
            appearanceClass
        );

        document.documentElement.dataset.dsnNovaAppearance =
            appearance;

        if (!workbench) {
            return;
        }

        workbench.classList.add(ROOT_CLASS);

        workbench.classList.remove(
            LIGHT_CLASS,
            DARK_CLASS
        );

        workbench.classList.add(appearanceClass);
        workbench.classList.toggle("dsn-nova-horizon-mode", isHorizonTheme());
    }

    function createGeometryLayer() {
        const workbench = getWorkbench();

        if (!workbench) {
            return;
        }

        let geometryLayer = workbench.querySelector(
            `.${GEOMETRY_LAYER_CLASS}`
        );

        if (geometryLayer) {
            return;
        }

        geometryLayer = document.createElement("div");

        geometryLayer.className =
            GEOMETRY_LAYER_CLASS;

        geometryLayer.setAttribute(
            "aria-hidden",
            "true"
        );

        workbench.appendChild(geometryLayer);
    }

    function createWallpaperStyle() {
        let style = document.getElementById(STYLE_ID);

        if (style) {
            return style;
        }

        style = document.createElement("style");
        style.id = STYLE_ID;

        style.textContent = `
            /* =========================================================
               DSN NOVA WALLPAPER RUNTIME
               ========================================================= */

            .monaco-workbench.${WALLPAPER_CLASS} {
                --vscode-editor-background:
                    transparent !important;

                --vscode-editorPane-background:
                    transparent !important;

                --vscode-editorGutter-background:
                    transparent !important;

                --vscode-editorGroupHeader-noTabsBackground:
                    transparent !important;

                --vscode-editorStickyScroll-background:
                    var(
                        --dsn-nova-sticky-background,
                        rgba(11, 16, 23, 0.88)
                    ) !important;

                --vscode-editorStickyScrollGutter-background:
                    var(
                        --dsn-nova-sticky-background,
                        rgba(11, 16, 23, 0.88)
                    ) !important;

                --vscode-breadcrumb-background:
                    var(
                        --dsn-nova-breadcrumb-background,
                        rgba(11, 16, 23, 0.82)
                    ) !important;

                --vscode-multiDiffEditor-background:
                    transparent !important;

                --vscode-notebook-editorBackground:
                    transparent !important;

                --vscode-notebook-cellEditorBackground:
                    transparent !important;
            }

            /* ---------------------------------------------------------
               Contenedor real del wallpaper
               --------------------------------------------------------- */

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor > .content {
                position: relative !important;

                background-color: transparent !important;

                background-image:
                    linear-gradient(
                        var(
                            --dsn-nova-wallpaper-overlay,
                            rgba(5, 9, 18, 0.72)
                        ),
                        var(
                            --dsn-nova-wallpaper-overlay,
                            rgba(5, 9, 18, 0.72)
                        )
                    ),
                    var(
                        --dsn-nova-wallpaper-image,
                        none
                    ) !important;

                background-position:
                    var(
                        --dsn-nova-wallpaper-position,
                        center center
                    ) !important;

                background-size:
                    var(
                        --dsn-nova-wallpaper-size,
                        cover
                    ) !important;

                background-repeat:
                    var(
                        --dsn-nova-wallpaper-repeat,
                        no-repeat
                    ) !important;

                background-attachment:
                    var(
                        --dsn-nova-wallpaper-attachment,
                        fixed
                    ) !important;
            }

            /* ---------------------------------------------------------
               Estructura general del editor
               --------------------------------------------------------- */

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor > .content,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor > .content
            .editor-group-container,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor > .content
            .editor-group-container > .editor-container,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .editor-container,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .editor-instance,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .text-editor {
                background-color: transparent !important;
            }

            /* ---------------------------------------------------------
               Monaco Editor
               --------------------------------------------------------- */

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .monaco-editor,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .monaco-editor-background,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .monaco-editor
            .overflow-guard,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .monaco-editor
            .monaco-scrollable-element,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .monaco-editor
            .lines-content,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .monaco-editor
            .view-lines,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .monaco-editor
            .view-overlays {
                background-color: transparent !important;
                background-image: none !important;
            }

            /* ---------------------------------------------------------
               Margin, gutter y números de línea
               --------------------------------------------------------- */

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .monaco-editor
            .margin,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .monaco-editor
            .margin-view-overlays,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .monaco-editor
            .glyph-margin,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .monaco-editor
            .line-numbers {
                background-color: transparent !important;
                background-image: none !important;
            }

            /* ---------------------------------------------------------
               Scrollbars
               --------------------------------------------------------- */

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .monaco-editor
            .decorationsOverviewRuler,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .monaco-editor
            .minimap,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .monaco-editor
            .minimap-shadow-visible {
                background-color: transparent !important;
            }

            /* ---------------------------------------------------------
               Breadcrumbs
               --------------------------------------------------------- */

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .breadcrumbs-below-tabs,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .breadcrumbs-control {
                background-color:
                    var(
                        --dsn-nova-breadcrumb-background,
                        rgba(11, 16, 23, 0.82)
                    ) !important;
            }

            /* ---------------------------------------------------------
               Sticky Scroll

               Se mantiene semitransparente para que el texto no se
               mezcle visualmente con las líneas del editor.
               --------------------------------------------------------- */

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .sticky-widget,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .sticky-widget
            .monaco-editor,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .sticky-widget
            .monaco-editor-background,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .sticky-widget
            .margin {
                background-color:
                    var(
                        --dsn-nova-sticky-background,
                        rgba(11, 16, 23, 0.88)
                    ) !important;
            }

            /* ---------------------------------------------------------
               Diff Editor
               --------------------------------------------------------- */

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .diff-editor,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .diff-editor
            .editor,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .diff-editor
            .monaco-diff-editor,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .multi-diff-editor,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .multi-diff-editor
            .multi-diff-editor-item {
                background-color: transparent !important;
            }

            /* ---------------------------------------------------------
               Notebook

               Solo se transparenta la superficie externa. Las celdas
               conservan su color para no perder legibilidad.
               --------------------------------------------------------- */

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .notebook-editor,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .notebook-editor
            .cell-list-container,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .notebook-editor
            .monaco-list,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .notebook-editor
            .monaco-list-rows {
                background-color: transparent !important;
            }

            /* ---------------------------------------------------------
               Pantalla vacía y editor sin archivo abierto
               --------------------------------------------------------- */

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .empty-editor-group,

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .empty-editor-group
            .empty-editor-group-watermark {
                background-color: transparent !important;
            }

            /* ---------------------------------------------------------
               Loading overlay
               --------------------------------------------------------- */

            .monaco-workbench.${WALLPAPER_CLASS}
            .part.editor
            .editor-progress {
                background-color: transparent !important;
            }

            /* ---------------------------------------------------------
               Apariencia clara
               --------------------------------------------------------- */

            .monaco-workbench.${LIGHT_CLASS} {
                --dsn-nova-runtime-default-overlay:
                    rgba(238, 243, 250, 0.76);

                --dsn-nova-sticky-background:
                    rgba(238, 243, 250, 0.9);

                --dsn-nova-breadcrumb-background:
                    rgba(238, 243, 250, 0.84);
            }

            /* ---------------------------------------------------------
               Apariencia oscura
               --------------------------------------------------------- */

            .monaco-workbench.${DARK_CLASS} {
                --dsn-nova-runtime-default-overlay:
                    rgba(5, 9, 18, 0.72);

                --dsn-nova-sticky-background:
                    rgba(11, 16, 23, 0.88);

                --dsn-nova-breadcrumb-background:
                    rgba(11, 16, 23, 0.82);
            }
        `;

        document.head.appendChild(style);

        return style;
    }

    function hasWallpaperConfiguration(workbench) {
        if (!workbench) {
            return false;
        }

        const styles = window.getComputedStyle(workbench);

        const wallpaperImage = styles
            .getPropertyValue(
                "--dsn-nova-wallpaper-image"
            )
            .trim();

        return Boolean(
            wallpaperImage &&
            wallpaperImage !== "none" &&
            wallpaperImage !== 'url("")' &&
            wallpaperImage !== "url('')" &&
            wallpaperImage !== 'url("")'
        );
    }

    function applyWallpaperState() {
        const workbench = getWorkbench();

        if (!workbench) {
            return;
        }

        createWallpaperStyle();

        if (hasWallpaperConfiguration(workbench)) {
            workbench.classList.add(
                WALLPAPER_CLASS
            );
        } else {
            workbench.classList.remove(
                WALLPAPER_CLASS
            );
        }
    }

    function forceEditorTransparency() {
        const workbench = getWorkbench();

        if (
            !workbench ||
            !workbench.classList.contains(
                WALLPAPER_CLASS
            )
        ) {
            return;
        }

        workbench.style.setProperty(
            "--vscode-editor-background",
            "transparent",
            "important"
        );

        workbench.style.setProperty(
            "--vscode-editorPane-background",
            "transparent",
            "important"
        );

        workbench.style.setProperty(
            "--vscode-editorGutter-background",
            "transparent",
            "important"
        );

        workbench.style.setProperty(
            "--vscode-editorGroupHeader-noTabsBackground",
            "transparent",
            "important"
        );

        workbench.style.setProperty(
            "--vscode-multiDiffEditor-background",
            "transparent",
            "important"
        );

        workbench.style.setProperty(
            "--vscode-notebook-editorBackground",
            "transparent",
            "important"
        );

        workbench.style.setProperty(
            "--vscode-notebook-cellEditorBackground",
            "transparent",
            "important"
        );
    }

    const SHADOW_STYLE_ID = "dsn-nova-shadow-style";

    const SHADOW_CSS = `
        .monaco-menu {
            position: relative;
            isolation: isolate;
            background-color: var(--dsn-menu-bg, rgba(14, 22, 34, 0.72)) !important;
        }

        .monaco-menu .monaco-action-bar,
        .monaco-menu .monaco-action-bar.vertical,
        .monaco-menu .monaco-scrollable-element {
            background-color: transparent !important;
        }

        /* Blur lives in a pseudo-element: a filter on the menu itself would
           become the containing block of the fixed-position submenus. */
        .monaco-menu::before {
            content: "";
            position: absolute;
            inset: 0;
            z-index: -1;
            border-radius: inherit;
            pointer-events: none;
            -webkit-backdrop-filter: blur(var(--dsn-menu-blur, 6px));
            backdrop-filter: blur(var(--dsn-menu-blur, 6px));
        }

        .monaco-menu .action-item.focused > .action-menu-item,
        .monaco-menu .action-item:hover > .action-menu-item {
            background-color: rgba(93, 175, 235, 0.28) !important;
        }
    `;

    // Menus render inside shadow roots, so page CSS cannot reach them.
    function patchShadowRoots() {
        document
            .querySelectorAll(".shadow-root-host")
            .forEach((host) => {
                const root = host.shadowRoot;

                if (
                    !root ||
                    root.getElementById(SHADOW_STYLE_ID)
                ) {
                    return;
                }

                const style = document.createElement("style");
                style.id = SHADOW_STYLE_ID;
                style.textContent = SHADOW_CSS;
                root.appendChild(style);
            });
    }

    const LIVE_KEY = "dsnNova.liveSettings";

    const LIVE_FIELDS = [
        { key: "wall", label: "Wallpaper visibility (editor)", css: "--dsn-wallpaper-opacity", min: 0, max: 1, step: 0.01 },
        { key: "sidebar", label: "Sidebar opacity", css: "--dsn-sidebar-opacity", min: 0.4, max: 1, step: 0.01 },
        { key: "activity", label: "Activity bar opacity", css: "--dsn-activity-opacity", min: 0.4, max: 1, step: 0.01 },
        { key: "panel", label: "Panel opacity", css: "--dsn-panel-opacity", min: 0.4, max: 1, step: 0.01 },
        { key: "status", label: "Status bar opacity", css: "--dsn-status-opacity", min: 0.4, max: 1, step: 0.01 },
        { key: "textFx", label: "Text effect (0 = off)", css: "--dsn-text-fx", min: 0, max: 1, step: 0.05 },
        { key: "menuBlur", label: "Menu blur (0 = off)", css: "--dsn-menu-blur", unit: "px", min: 0, max: 12, step: 1 },
        { key: "page", label: "Pages (Settings, Extensions...)", css: "--dsn-page-opacity", min: 0.3, max: 1, step: 0.01 },
        { key: "popup", label: "Popups (Command Palette, dialogs)", css: "--dsn-popup-opacity", min: 0.4, max: 1, step: 0.01 },
        { key: "popupBlur", label: "Popup blur (0 = off)", css: "--dsn-popup-blur", unit: "px", min: 0, max: 24, step: 1 },
        { key: "menuOpacity", label: "Menu opacity", css: "--dsn-menu-opacity", min: 0.3, max: 1, step: 0.01 },
        { key: "neonBorder", label: "Neon borders (0 = off)", css: "--dsn-neon-border", min: 0, max: 1, step: 0.05 },
        { key: "neonScroll", label: "Neon scrollbar (0 = off)", css: "--dsn-neon-scroll", min: 0, max: 1, step: 0.05 }
    ];

    const LIVE_PANEL_ID = "dsn-nova-live-panel";
    const LIVE_STYLE_ID = "dsn-nova-live-style";

    let liveState = {};
    let liveDefaults = {};
    let liveApplied = "";

    function loadLiveState() {
        try {
            liveState = JSON.parse(
                window.localStorage.getItem(LIVE_KEY) || "{}"
            ) || {};
        } catch (error) {
            liveState = {};
        }
    }

    function saveLiveState() {
        try {
            window.localStorage.setItem(
                LIVE_KEY,
                JSON.stringify(liveState)
            );
        } catch (error) {
            /* storage unavailable */
        }
    }

    function readLiveDefaults() {
        const style = window.getComputedStyle(
            document.documentElement
        );

        LIVE_FIELDS.forEach((field) => {
            const value = parseFloat(
                style.getPropertyValue(field.css)
            );

            liveDefaults[field.key] = Number.isFinite(value)
                ? value
                : field.max;
        });
    }

    function applyLiveState(force) {
        const workbench = getWorkbench();

        if (!workbench) {
            return;
        }

        const light = document.body.classList.contains(LIGHT_CLASS);
        const signature = JSON.stringify(liveState) + light;

        if (!force && signature === liveApplied) {
            return;
        }

        liveApplied = signature;

        LIVE_FIELDS.forEach((field) => {
            if (liveState[field.key] === undefined) {
                document.documentElement.style.removeProperty(field.css);
                return;
            }

            document.documentElement.style.setProperty(
                field.css,
                liveState[field.key] + (field.unit || "")
            );
        });

        if (liveState.neon) {
            document.documentElement.style.setProperty(
                "--dsn-neon-color",
                liveState.neon
            );
        } else {
            document.documentElement.style.removeProperty("--dsn-neon-color");
        }

        document.body.classList.toggle(
            "dsn-nova-neon-border-off",
            liveState.neonBorder === 0
        );
        document.body.classList.toggle(
            "dsn-nova-neon-scroll-off",
            liveState.neonScroll === 0
        );

        // Concrete colors on body avoid depending on nested var() resolution.
        [
            ["menuOpacity", "--dsn-menu-bg", [14, 22, 34], [244, 247, 251]],
            ["popup", "--dsn-popup-bg", [14, 22, 34], [248, 250, 253]],
            ["page", "--dsn-page-bg", [8, 13, 20], [244, 247, 251]]
        ].forEach(([key, name, darkRgb, lightRgb]) => {
            if (liveState[key] === undefined) {
                document.body.style.removeProperty(name);
                return;
            }

            document.body.style.setProperty(
                name,
                "rgba(" + (light ? lightRgb : darkRgb).join(",") +
                    "," + liveState[key] + ")"
            );
        });

        if (liveState.wall === undefined) {
            workbench.style.removeProperty("--dsn-nova-wallpaper-overlay");
            return;
        }

        const veil = 1 - liveState.wall;
        const alpha = Math.min(
            1,
            light ? 0.25 + veil * 0.8 : veil
        ).toFixed(2);

        workbench.style.setProperty(
            "--dsn-nova-wallpaper-overlay",
            light
                ? "rgba(238, 243, 250, " + alpha + ")"
                : "rgba(5, 9, 18, " + alpha + ")"
        );
    }

    const ROLES = [
        { key: "cyan", label: "Cyan", hint: "Structure, focus and navigation", dark: "#66c8ff", light: "#0a7c9e", horizon: "#5cb8ff" },
        { key: "blue", label: "Blue", hint: "Functions and methods", dark: "#6c9eff", light: "#1f5fd0", horizon: "#8fb4ff" },
        { key: "purple", label: "Purple", hint: "Classes, types and properties", dark: "#b794f6", light: "#7a4db0", horizon: "#d2a8ff" },
        { key: "green", label: "Green", hint: "Strings and successful states", dark: "#7ee2a8", light: "#1e7f4f", horizon: "#8ce8c0" },
        { key: "orange", label: "Orange", hint: "Numbers, decorators and active details", dark: "#ffa95a", light: "#b85a00", horizon: "#ffb873" },
        { key: "red", label: "Red", hint: "Constants, errors and critical actions", dark: "#ff5266", light: "#c02339", horizon: "#ff6b6b" },
        { key: "gold", label: "Gold", hint: "Warnings and modified resources", dark: "#f2c94c", light: "#8f6a00", horizon: "#ffd27a" }
    ];

    const UI_FONTS = [
        { label: "Default", value: "" },
        { label: "Segoe UI", value: "'Segoe UI', sans-serif" },
        { label: "Inter", value: "Inter, 'Segoe UI', sans-serif" },
        { label: "Calibri", value: "Calibri, 'Segoe UI', sans-serif" },
        { label: "Verdana", value: "Verdana, sans-serif" },
        { label: "Cascadia Code", value: "'Cascadia Code', Consolas, monospace" },
        { label: "Consolas", value: "Consolas, monospace" }
    ];

    const LIVE_TABS = [
        { id: "wallpaper", label: "Wallpaper", keys: ["wall"] },
        { id: "zones", label: "Zones", keys: ["sidebar", "activity", "panel", "status"] },
        { id: "windows", label: "Windows", keys: ["page", "popup", "popupBlur"] },
        { id: "effects", label: "Effects", keys: ["textFx", "menuBlur", "menuOpacity", "neonBorder", "neonScroll"] },
        { id: "colors", label: "Colors" },
        { id: "fonts", label: "Fonts" }
    ];

    const WALLPAPER_FITS = {
        fill: { size: "cover", repeat: "no-repeat" },
        fit: { size: "contain", repeat: "no-repeat" },
        stretch: { size: "100% 100%", repeat: "no-repeat" },
        center: { size: "auto", repeat: "no-repeat" },
        tile: { size: "auto", repeat: "repeat" }
    };

    const ZONE_PRESETS = [
        { label: "Clear", values: { wall: 0.95, sidebar: 0.45, activity: 0.45, panel: 0.45, status: 0.55 } },
        { label: "Default", values: null },
        { label: "Readable", values: { wall: 0.55, sidebar: 0.95, activity: 0.95, panel: 0.95, status: 0.95 } }
    ];

    let wallpaperBlobUrl = null;
    let wallpaperLoading = false;
    let wallpaperLoadFailed = false;
    let wallpaperApplied = "";
    let wallpaperWorkbench = null;

    function wallpaperDb() {
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open("dsnNova", 1);
            request.onupgradeneeded = () =>
                request.result.createObjectStore("wallpaper");
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    function wallpaperStore(mode, operation) {
        return wallpaperDb().then((db) => new Promise((resolve, reject) => {
            const tx = db.transaction("wallpaper", mode);
            const request = operation(tx.objectStore("wallpaper"));
            tx.oncomplete = () => {
                db.close();
                resolve(request && request.result);
            };
            tx.onerror = () => reject(tx.error);
        }));
    }

    function loadWallpaperBlob() {
        return wallpaperStore("readonly", (store) => store.get("image"))
            .then((blob) => {
                if (wallpaperBlobUrl) {
                    URL.revokeObjectURL(wallpaperBlobUrl);
                    wallpaperBlobUrl = null;
                }

                if (blob) {
                    wallpaperBlobUrl = URL.createObjectURL(blob);
                } else {
                    wallpaperLoadFailed = true;
                }
            });
    }

    function clearWallpaperImage() {
        if (wallpaperBlobUrl) {
            URL.revokeObjectURL(wallpaperBlobUrl);
            wallpaperBlobUrl = null;
        }

        wallpaperLoadFailed = false;

        return wallpaperStore("readwrite", (store) => store.delete("image"))
            .catch(() => undefined);
    }

    // Large images are downscaled so the stored copy stays light.
    function prepareWallpaper(file) {
        if (file.type === "image/svg+xml" || file.size < 6 * 1024 * 1024) {
            return Promise.resolve(file);
        }

        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const image = new Image();

            image.onload = () => {
                const ratio = Math.min(
                    1,
                    3840 / Math.max(image.naturalWidth, image.naturalHeight)
                );
                const canvas = document.createElement("canvas");
                canvas.width = Math.round(image.naturalWidth * ratio);
                canvas.height = Math.round(image.naturalHeight * ratio);
                canvas.getContext("2d").drawImage(
                    image, 0, 0, canvas.width, canvas.height
                );
                URL.revokeObjectURL(url);
                canvas.toBlob(
                    (blob) => (blob ? resolve(blob) : reject(new Error("blob"))),
                    "image/jpeg",
                    0.9
                );
            };

            image.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error("image"));
            };

            image.src = url;
        });
    }

    function applyWallpaperLive() {
        const workbench = getWorkbench();

        if (!workbench) {
            return;
        }

        if (
            liveState.wpHasImage &&
            !wallpaperBlobUrl &&
            !wallpaperLoading &&
            !wallpaperLoadFailed
        ) {
            wallpaperLoading = true;

            loadWallpaperBlob()
                .catch(() => {
                    wallpaperLoadFailed = true;
                })
                .then(() => {
                    wallpaperLoading = false;
                    applyWallpaperLive();
                });

            return;
        }

        workbench.classList.toggle(
            "dsn-nova-wp-editor-only",
            liveState.wpScope === "editor"
        );

        const signature = [
            liveState.wpHasImage ? wallpaperBlobUrl : "",
            liveState.wpHide ? "hide" : "",
            liveState.wpFit || "",
            liveState.wpScope || ""
        ].join("|");

        if (
            signature === wallpaperApplied &&
            workbench === wallpaperWorkbench
        ) {
            return;
        }

        wallpaperApplied = signature;
        wallpaperWorkbench = workbench;

        const assign = (name, value) => {
            if (value === null) {
                workbench.style.removeProperty(name);
            } else {
                workbench.style.setProperty(name, value);
            }
        };

        if (liveState.wpHide) {
            assign("--dsn-nova-wallpaper-image", "none");
        } else if (liveState.wpHasImage && wallpaperBlobUrl) {
            assign("--dsn-nova-wallpaper-image", 'url("' + wallpaperBlobUrl + '")');
        } else {
            assign("--dsn-nova-wallpaper-image", null);
        }

        const fit = WALLPAPER_FITS[liveState.wpFit];

        assign("--dsn-nova-wallpaper-size", fit ? fit.size : null);
        assign("--dsn-nova-wallpaper-repeat", fit ? fit.repeat : null);
        assign("--dsn-nova-wallpaper-position", fit ? "center center" : null);
        // Scrolling attachment sizes the image to the editor box instead of the window.
        assign(
            "--dsn-nova-wallpaper-attachment",
            liveState.wpScope === "editor" ? "scroll" : null
        );
    }

    const PALETTE_STYLE_ID = "dsn-nova-palette-style";

    let paletteSheet = null;
    let paletteApplied = null;

    function hexToRgb(hex) {
        const match = /^#?([0-9a-f]{6})/i.exec(hex || "");

        if (!match) {
            return null;
        }

        const value = parseInt(match[1], 16);

        return "rgb(" + ((value >> 16) & 255) + ", " +
            ((value >> 8) & 255) + ", " + (value & 255) + ")";
    }

    function findTokenSheet() {
        if (paletteSheet && paletteSheet.ownerNode && paletteSheet.ownerNode.isConnected) {
            return paletteSheet;
        }

        paletteSheet = null;

        for (const sheet of Array.from(document.styleSheets)) {
            try {
                const first = sheet.cssRules && sheet.cssRules[0];

                if (first && first.selectorText === ".mtk1") {
                    paletteSheet = sheet;
                    break;
                }
            } catch (error) {
                /* cross-origin sheet */
            }
        }

        return paletteSheet;
    }

    function applyPalette() {
        let style = document.getElementById(PALETTE_STYLE_ID);

        if (!style) {
            style = document.createElement("style");
            style.id = PALETTE_STYLE_ID;
            document.head.appendChild(style);
        }

        const light = document.body.classList.contains(LIGHT_CLASS);
        const custom = liveState.colors || {};
        const rules = [];

        const sheet = findTokenSheet();

        if (sheet) {
            const byColor = {};

            ROLES.forEach((role) => {
                const rgb = hexToRgb(roleDefault(role, light));

                if (rgb && custom[role.key]) {
                    byColor[rgb] = custom[role.key];
                }
            });

            Array.from(sheet.cssRules).forEach((rule) => {
                if (!/^\.mtk\d+$/.test(rule.selectorText || "")) {
                    return;
                }

                const target = byColor[rule.style.color];

                if (target) {
                    rules.push(
                        ".monaco-editor " + rule.selectorText +
                        " { color: " + target + " !important; }"
                    );
                }
            });
        }

        if (custom.gold) {
            rules.push(
                ".monaco-workbench .codicon-warning, .monaco-workbench .codicon-diff-modified { color: " +
                custom.gold + " !important; }"
            );
        }

        if (custom.cyan) {
            rules.push(
                ".monaco-workbench { --vscode-focusBorder: " + custom.cyan + "; }"
            );
        }

        if (liveState.uiFont) {
            rules.push(
                ".monaco-workbench, .monaco-workbench .part:not(.editor) { font-family: " +
                liveState.uiFont + " !important; }"
            );
        }

        const css = rules.join("\n");

        if (css !== paletteApplied) {
            paletteApplied = css;
            style.textContent = css;
        }
    }

    let liveButtonLayout = "";

    function attachLiveButton() {
        const button = document.getElementById("dsn-nova-live-button");
        const bar = document.querySelector(".monaco-workbench .part.activitybar");

        if (!button || !bar) {
            return;
        }

        if (button.parentElement !== bar) {
            bar.appendChild(button);
        }

        const items = Array.from(
            bar.querySelectorAll(".content > .composite-bar .action-item")
        ).filter((item) => item.offsetHeight > 0);

        const barRect = bar.getBoundingClientRect();
        let last = null;

        items.forEach((item) => {
            const rect = item.getBoundingClientRect();

            if (!last || rect.bottom > last.bottom) {
                last = rect;
            }
        });

        const left = last ? last.left - barRect.left : 0;
        const top = last ? last.bottom - barRect.top : 200;
        const width = last ? last.width : 48;
        const height = last ? last.height : 48;
        const layout = [left, top, width, height].map(Math.round).join(",");

        if (layout !== liveButtonLayout) {
            liveButtonLayout = layout;
            button.style.left = Math.round(left) + "px";
            button.style.top = Math.round(top) + "px";
            button.style.width = Math.round(width) + "px";
            button.style.height = Math.round(height) + "px";
        }
    }

    function ensureLivePanel() {
        if (document.getElementById(LIVE_PANEL_ID)) {
            return;
        }

        const style = document.createElement("style");
        style.id = LIVE_STYLE_ID;
        style.textContent = `
            #dsn-nova-live-button {
                position: absolute; left: 0; top: 0; z-index: 5;
                width: 48px; height: 48px;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; user-select: none;
                color: var(--vscode-activityBar-inactiveForeground, #ccc);
                -webkit-app-region: no-drag;
            }
            #dsn-nova-live-button:hover,
            #dsn-nova-live-button.active {
                color: var(--vscode-activityBar-foreground, #fff);
            }
            #dsn-nova-live-button svg { width: 24px; height: 24px; pointer-events: none; }
            #${LIVE_PANEL_ID} {
                position: fixed; left: 56px; bottom: 40px; z-index: 4000;
                width: 340px; max-height: 80vh; overflow: auto;
                padding: 10px 14px 12px; border-radius: 10px; display: none;
                background: rgb(14, 22, 34) !important; color: #e6eef8 !important;
                color-scheme: dark;
                border: 1px solid rgba(150,190,230,.35);
                box-shadow: 0 6px 24px rgba(0,0,0,.4);
                font-family: var(--vscode-font-family, sans-serif); font-size: 12px;
            }
            body.dsn-nova-light-mode #${LIVE_PANEL_ID} {
                background: rgb(250, 252, 255) !important; color: #14202c !important;
                color-scheme: light;
                border-color: rgba(30, 50, 80, .32);
                box-shadow: 0 6px 24px rgba(20,40,70,.25);
            }
            body.dsn-nova-light-mode #dsn-nova-live-button { color: #111d29; }
            body:not(.dsn-nova-light-mode) #dsn-nova-live-button { color: #cfe0f0; }
            body.dsn-nova-light-mode #${LIVE_PANEL_ID} .tab { background: rgba(30, 60, 100, .12); }
            body.dsn-nova-light-mode #${LIVE_PANEL_ID} select { background: #fff; border-color: rgba(30, 50, 80, .35); }
            #${LIVE_PANEL_ID} select { background: #1b2736; color: #e6eef8; }
            #${LIVE_PANEL_ID} option { background: #1b2736; color: #e6eef8; }
            body.dsn-nova-light-mode #${LIVE_PANEL_ID} select, body.dsn-nova-light-mode #${LIVE_PANEL_ID} option { background: #fff; color: #14202c; }
            #${LIVE_PANEL_ID} input[type=range] { accent-color: #3b9eea; }
            #${LIVE_PANEL_ID} .actions { display: flex; gap: 6px; flex-wrap: wrap; margin: 6px 0; }
            #${LIVE_PANEL_ID} .actions button, #${LIVE_PANEL_ID} button.reset {
                margin: 0; padding: 4px 10px; cursor: pointer; border-radius: 3px;
                color: #fff; background: #1f6fb5; border: 0;
            }
            #${LIVE_PANEL_ID} .actions button.secondary { background: rgba(128,150,180,.35); color: inherit; }
            #${LIVE_PANEL_ID} label.check { display: flex; gap: 6px; align-items: center; margin: 8px 0; }
            #${LIVE_PANEL_ID}.open { display: block; }
            #${LIVE_PANEL_ID} h4 { margin: 0 0 8px; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; }
            #${LIVE_PANEL_ID} .tabs { display: flex; gap: 4px; margin-bottom: 8px; flex-wrap: wrap; }
            #${LIVE_PANEL_ID} .tab {
                padding: 3px 8px; border-radius: 10px; cursor: pointer; margin: 0; font-size: 11px;
                background: rgba(128,150,180,.18); color: inherit;
            }
            #${LIVE_PANEL_ID} .tab.active { background: var(--vscode-button-background, #0e639c); color: var(--vscode-button-foreground, #fff); }
            #${LIVE_PANEL_ID} .page { display: none; }
            #${LIVE_PANEL_ID} .page.active { display: block; }
            #${LIVE_PANEL_ID} .row { margin: 8px 0; }
            #${LIVE_PANEL_ID} .row > div { display: flex; justify-content: space-between; }
            #${LIVE_PANEL_ID} input[type=range] { width: 100%; }
            #${LIVE_PANEL_ID} .color { display: flex; align-items: center; gap: 8px; margin: 7px 0; }
            #${LIVE_PANEL_ID} .color input { width: 34px; height: 24px; padding: 0; border: 0; background: none; cursor: pointer; }
            #${LIVE_PANEL_ID} .color small { display: block; opacity: .7; }
            #${LIVE_PANEL_ID} .color .grow { flex: 1; }
            #${LIVE_PANEL_ID} .color .undo { cursor: pointer; opacity: .7; }
            #${LIVE_PANEL_ID} select { width: 100%; margin-top: 4px; padding: 3px; color: inherit; background: rgba(128,150,180,.2); border: 1px solid rgba(150,190,230,.3); }
            #${LIVE_PANEL_ID} p { opacity: .85; margin: 8px 0 0; line-height: 1.4; }
            #${LIVE_PANEL_ID} button.reset {
                margin-top: 10px; padding: 4px 10px; cursor: pointer;
                color: var(--vscode-button-foreground, #fff);
                background: var(--vscode-button-background, #0e639c); border: 0;
            }
        `;
        document.head.appendChild(style);

        const button = document.createElement("div");
        button.id = "dsn-nova-live-button";
        button.title = "DSN Nova appearance (Ctrl+Alt+N)";
        button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 2.5 21.5 12 12 21.5 2.5 12Z"/><path d="M12 7.5 16.5 12 12 16.5 7.5 12Z" fill="#43AAA0" stroke="none"/></svg>';

        const panelElement = document.createElement("div");
        panelElement.id = LIVE_PANEL_ID;

        const title = document.createElement("h4");
        title.textContent = "DSN Nova Appearance";
        panelElement.appendChild(title);

        const tabBar = document.createElement("div");
        tabBar.className = "tabs";
        panelElement.appendChild(tabBar);

        const pages = {};
        const tabButtons = {};
        const refreshers = [];

        const showTab = (id) => {
            LIVE_TABS.forEach((tab) => {
                pages[tab.id].classList.toggle("active", tab.id === id);
                tabButtons[tab.id].classList.toggle("active", tab.id === id);
            });
        };

        LIVE_TABS.forEach((tab) => {
            const tabButton = document.createElement("span");
            tabButton.className = "tab";
            tabButton.textContent = tab.label;
            tabButton.addEventListener("click", () => showTab(tab.id));
            tabBar.appendChild(tabButton);
            tabButtons[tab.id] = tabButton;

            const page = document.createElement("div");
            page.className = "page";
            panelElement.appendChild(page);
            pages[tab.id] = page;
        });

        const makeButton = (label, secondary) => {
            const item = document.createElement("button");
            item.textContent = label;

            if (secondary) {
                item.className = "secondary";
            }

            return item;
        };

        const wallpaperPage = pages.wallpaper;
        const wallpaperStatus = document.createElement("p");
        wallpaperStatus.style.margin = "0 0 6px";

        const wallpaperActions = document.createElement("div");
        wallpaperActions.className = "actions";
        const chooseButton = makeButton("Choose image...");
        const defaultButton = makeButton("Use default", true);
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.style.display = "none";

        wallpaperActions.appendChild(chooseButton);
        wallpaperActions.appendChild(defaultButton);

        const showLabel = document.createElement("label");
        showLabel.className = "check";
        const showBox = document.createElement("input");
        showBox.type = "checkbox";
        showLabel.appendChild(showBox);
        showLabel.appendChild(document.createTextNode("Show wallpaper"));

        const fitLabel = document.createElement("div");
        fitLabel.textContent = "Image fit";
        const fitSelect = document.createElement("select");

        [
            ["", "Default (from settings)"],
            ["fill", "Fill (cover the window)"],
            ["fit", "Fit (show the whole image)"],
            ["stretch", "Stretch"],
            ["center", "Center (original size)"],
            ["tile", "Tile"]
        ].forEach(([value, text]) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = text;
            fitSelect.appendChild(option);
        });

        const scopeLabel = document.createElement("div");
        scopeLabel.textContent = "Show the image in";
        const scopeSelect = document.createElement("select");

        [
            ["", "Whole window"],
            ["editor", "Editor area only"]
        ].forEach(([value, text]) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = text;
            scopeSelect.appendChild(option);
        });

        const syncWallpaper = () => {
            scopeSelect.value = liveState.wpScope || "";
            wallpaperStatus.textContent = liveState.wpHasImage
                ? "Custom image: " + (liveState.wpName || "selected")
                : "Using the default or configured wallpaper.";
            showBox.checked = !liveState.wpHide;
            fitSelect.value = liveState.wpFit || "";
        };

        const commitWallpaper = () => {
            saveLiveState();
            applyWallpaperLive();
            syncWallpaper();
        };

        chooseButton.addEventListener("click", () => fileInput.click());

        fileInput.addEventListener("change", () => {
            const file = fileInput.files && fileInput.files[0];
            fileInput.value = "";

            if (!file) {
                return;
            }

            wallpaperStatus.textContent = "Loading image...";

            prepareWallpaper(file)
                .then((blob) =>
                    wallpaperStore("readwrite", (store) => store.put(blob, "image"))
                )
                .then(() => {
                    wallpaperLoadFailed = false;
                    liveState.wpHasImage = true;
                    liveState.wpName = file.name;
                    delete liveState.wpHide;
                    return loadWallpaperBlob();
                })
                .then(commitWallpaper)
                .catch(() => {
                    wallpaperStatus.textContent =
                        "That image could not be loaded.";
                });
        });

        defaultButton.addEventListener("click", () => {
            delete liveState.wpHasImage;
            delete liveState.wpName;
            clearWallpaperImage().then(commitWallpaper);
        });

        showBox.addEventListener("change", () => {
            if (showBox.checked) {
                delete liveState.wpHide;
            } else {
                liveState.wpHide = true;
            }

            commitWallpaper();
        });

        scopeSelect.addEventListener("change", () => {
            if (scopeSelect.value) {
                liveState.wpScope = scopeSelect.value;
            } else {
                delete liveState.wpScope;
            }

            commitWallpaper();
        });

        fitSelect.addEventListener("change", () => {
            if (fitSelect.value) {
                liveState.wpFit = fitSelect.value;
            } else {
                delete liveState.wpFit;
            }

            commitWallpaper();
        });

        refreshers.push(syncWallpaper);

        [
            wallpaperStatus, wallpaperActions, fileInput, showLabel,
            scopeLabel, scopeSelect, fitLabel, fitSelect
        ].forEach((node) => wallpaperPage.appendChild(node));

        const presetLabel = document.createElement("div");
        presetLabel.textContent = "Quick presets";
        const presetRow = document.createElement("div");
        presetRow.className = "actions";

        ZONE_PRESETS.forEach((preset) => {
            const item = makeButton(preset.label, true);

            item.addEventListener("click", () => {
                ["wall", "sidebar", "activity", "panel", "status"].forEach(
                    (key) => delete liveState[key]
                );

                if (preset.values) {
                    Object.assign(liveState, preset.values);
                }

                saveLiveState();
                applyLiveState(true);
                refreshers.forEach((sync) => sync());
            });

            presetRow.appendChild(item);
        });

        pages.zones.appendChild(presetLabel);
        pages.zones.appendChild(presetRow);

        LIVE_FIELDS.forEach((field) => {
            const tab = LIVE_TABS.find(
                (item) => item.keys && item.keys.includes(field.key)
            );

            const row = document.createElement("div");
            row.className = "row";

            const head = document.createElement("div");
            const label = document.createElement("span");
            label.textContent = field.label;
            const output = document.createElement("span");
            head.appendChild(label);
            head.appendChild(output);

            const input = document.createElement("input");
            input.type = "range";
            input.min = field.min;
            input.max = field.max;
            input.step = field.step;

            const current = () =>
                liveState[field.key] !== undefined
                    ? liveState[field.key]
                    : liveDefaults[field.key];

            const sync = () => {
                input.value = current();
                output.textContent = Number(current()).toFixed(
                    field.step >= 1 ? 0 : 2
                );
            };

            input.addEventListener("input", () => {
                liveState[field.key] = Number(input.value);
                saveLiveState();
                applyLiveState(true);
                sync();
            });

            sync();
            refreshers.push(sync);

            row.appendChild(head);
            row.appendChild(input);
            pages[tab.id].appendChild(row);
        });

        const neonLine = document.createElement("div");
        neonLine.className = "color";
        const neonPicker = document.createElement("input");
        neonPicker.type = "color";
        const neonText = document.createElement("div");
        neonText.className = "grow";
        neonText.innerHTML = "<b>Neon color</b><small>Borders and scrollbar glow</small>";
        const neonUndo = document.createElement("span");
        neonUndo.className = "undo";
        neonUndo.textContent = "\u21BA";
        neonUndo.title = "Restore default neon";

        const neonSync = () => {
            neonPicker.value = liveState.neon || "#00e5ff";
        };

        neonPicker.addEventListener("input", () => {
            liveState.neon = neonPicker.value;
            saveLiveState();
            applyLiveState(true);
        });

        neonUndo.addEventListener("click", () => {
            delete liveState.neon;
            saveLiveState();
            applyLiveState(true);
            neonSync();
        });

        neonSync();
        refreshers.push(neonSync);
        neonLine.appendChild(neonPicker);
        neonLine.appendChild(neonText);
        neonLine.appendChild(neonUndo);
        pages.effects.appendChild(neonLine);

        const colorPage = pages.colors;
        const colorSyncs = [];

        ROLES.forEach((role) => {
            const line = document.createElement("div");
            line.className = "color";

            const picker = document.createElement("input");
            picker.type = "color";

            const text = document.createElement("div");
            text.className = "grow";
            text.innerHTML = "<b></b><small></small>";
            text.firstChild.textContent = role.label;
            text.lastChild.textContent = role.hint;

            const undo = document.createElement("span");
            undo.className = "undo";
            undo.textContent = "\u21BA";
            undo.title = "Restore theme color";

            const sync = () => {
                const light = document.body.classList.contains(LIGHT_CLASS);
                const custom = liveState.colors && liveState.colors[role.key];
                picker.value = custom || roleDefault(role, light);
            };

            picker.addEventListener("input", () => {
                liveState.colors = liveState.colors || {};
                liveState.colors[role.key] = picker.value;
                saveLiveState();
                applyPalette();
            });

            undo.addEventListener("click", () => {
                if (liveState.colors) {
                    delete liveState.colors[role.key];
                }
                saveLiveState();
                applyPalette();
                sync();
            });

            sync();
            colorSyncs.push(sync);
            refreshers.push(sync);

            line.appendChild(picker);
            line.appendChild(text);
            line.appendChild(undo);
            colorPage.appendChild(line);
        });

        const colorNote = document.createElement("p");
        colorNote.textContent =
            "Changes the syntax colors of the code in the current theme.";
        colorPage.appendChild(colorNote);

        const fontPage = pages.fonts;
        const fontLabel = document.createElement("div");
        fontLabel.textContent = "Interface font (menus, explorer, panels)";
        const fontSelect = document.createElement("select");

        UI_FONTS.forEach((font) => {
            const option = document.createElement("option");
            option.value = font.value;
            option.textContent = font.label;
            fontSelect.appendChild(option);
        });

        fontSelect.addEventListener("change", () => {
            liveState.uiFont = fontSelect.value;
            saveLiveState();
            applyPalette();
        });

        refreshers.push(() => {
            fontSelect.value = liveState.uiFont || "";
        });

        const fontNote = document.createElement("p");
        fontNote.textContent =
            "Editor font groups (family, size, ligatures): click DSN Nova in the status bar and choose Font group.";

        fontPage.appendChild(fontLabel);
        fontPage.appendChild(fontSelect);
        fontPage.appendChild(fontNote);

        LIVE_TABS.forEach((tab) => {
            const reset = document.createElement("button");
            reset.className = "reset";
            reset.textContent = "Reset " + tab.label.toLowerCase();
            reset.addEventListener("click", () => {
                if (tab.keys) {
                    tab.keys.forEach((key) => delete liveState[key]);
                } else if (tab.id === "colors") {
                    delete liveState.colors;
                } else if (tab.id === "fonts") {
                    delete liveState.uiFont;
                }

                if (tab.id === "effects") {
                    delete liveState.neon;
                }

                if (tab.id === "wallpaper") {
                    delete liveState.wpFit;
                    delete liveState.wpScope;
                    delete liveState.wpHide;
                    delete liveState.wpHasImage;
                    delete liveState.wpName;
                    clearWallpaperImage();
                }

                saveLiveState();
                applyLiveState(true);
                applyPalette();
                applyWallpaperLive();
                refreshers.forEach((sync) => sync());
            });
            pages[tab.id].appendChild(reset);
        });

        showTab("wallpaper");
        refreshers.forEach((sync) => sync());

        const toggle = () => {
            panelElement.classList.toggle("open");
            button.classList.toggle(
                "active",
                panelElement.classList.contains("open")
            );
            colorSyncs.forEach((sync) => sync());
        };

        button.addEventListener("click", toggle);

        window.addEventListener("mousedown", (event) => {
            if (!panelElement.classList.contains("open")) {
                return;
            }

            const path = event.composedPath();

            if (!path.includes(panelElement) && !path.includes(button)) {
                panelElement.classList.remove("open");
            }
        }, true);

        window.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                panelElement.classList.remove("open");
            }

            if (
                event.ctrlKey &&
                event.altKey &&
                event.key.toLowerCase() === "n"
            ) {
                toggle();
            }
        });

        document.body.appendChild(panelElement);
        document.body.appendChild(button);
        attachLiveButton();
    }

    function refreshRuntime() {
        applyAppearance();
        createGeometryLayer();
        createWallpaperStyle();
        applyWallpaperState();
        forceEditorTransparency();
        patchShadowRoots();
        ensureLivePanel();
        attachLiveButton();
        applyLiveState(false);
        applyPalette();
        applyWallpaperLive();
    }

    function scheduleRefresh() {
        if (refreshPending) {
            return;
        }

        refreshPending = true;

        window.requestAnimationFrame(() => {
            refreshPending = false;
            refreshRuntime();

            // Discard mutations caused by the runtime itself to avoid a refresh loop.
            if (observer) {
                observer.takeRecords();
            }
        });
    }

    function startObserver() {
        if (observer) {
            observer.disconnect();
        }

        // Notebooks, editors and lists mutate class/style constantly; reacting
        // to them would re-run the whole runtime on every frame.
        const NOISY = ".notebook-editor, .monaco-editor, .monaco-list, .webview, #" + LIVE_PANEL_ID;

        observer = new MutationObserver((records) => {
            const relevant = records.some((record) => {
                const el = record.target.nodeType === 1
                    ? record.target
                    : record.target.parentElement;

                return !el || !el.closest(NOISY);
            });

            if (relevant) {
                scheduleRefresh();
            }
        });

        observer.observe(
            document.documentElement,
            {
                attributes: true,
                childList: true,
                subtree: true,
                attributeFilter: [
                    "class",
                    "style"
                ]
            }
        );
    }

    function initialize() {
        readLiveDefaults();
        loadLiveState();
        refreshRuntime();
        startObserver();

        window.addEventListener(
            "focus",
            scheduleRefresh
        );

        window.addEventListener(
            "resize",
            scheduleRefresh
        );

        document.addEventListener(
            "visibilitychange",
            () => {
                if (!document.hidden) {
                    scheduleRefresh();
                }
            }
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once: true
            }
        );
    } else {
        initialize();
    }
})();
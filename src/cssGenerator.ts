import * as crypto from "crypto";
import * as path from "path";
import * as vscode from "vscode";

import {
    DsnNovaSettings,
    getSettings
} from "./settingsManager";

import {
    pathToCssUrl
} from "./wallpaperManager";

function clamp(
    value: number,
    minimum: number,
    maximum: number
): number {
    return Math.min(
        Math.max(value, minimum),
        maximum
    );
}

function escapeCssUrl(
    value: string
): string {
    return value
        .replace(/\\/g, "/")
        .replace(/"/g, '\\"')
        .replace(/\n|\r/g, "");
}

function isLightAppearance(
    settings: DsnNovaSettings
): boolean {
    if (settings.appearance === "light") {
        return true;
    }

    if (settings.appearance === "dark") {
        return false;
    }

    const activeTheme =
        vscode.workspace
            .getConfiguration("workbench")
            .get<string>(
                "colorTheme",
                ""
            )
            .toLowerCase();

    return activeTheme.includes(
        "dsn nova light"
    );
}

function getDefaultWallpaperUri(
    context: vscode.ExtensionContext,
    settings: DsnNovaSettings
): vscode.Uri {
    const wallpaperFileName =
        isLightAppearance(settings)
            ? "dsn-nova-light.svg"
            : "dsn-nova-dark.svg";

    return vscode.Uri.joinPath(
        context.extensionUri,
        "assets",
        "wallpapers",
        wallpaperFileName
    );
}

function getWallpaperUrl(
    context: vscode.ExtensionContext,
    settings: DsnNovaSettings,
    customWallpaperUrl?: string
): string {
    if (customWallpaperUrl) {
        return customWallpaperUrl;
    }

    return decodeURIComponent(
        getDefaultWallpaperUri(
            context,
            settings
        )
            .with({
                scheme: "vscode-file",
                authority: "vscode-app"
            })
            .toString()
    );
}

function getWallpaperOverlayOpacity(
    settings: DsnNovaSettings
): number {
    const wallpaperVisibility = clamp(
        settings.wallpaperOpacity,
        0,
        1
    );

    /*
     * wallpaperOpacity indica cuánto debe verse
     * el wallpaper.
     *
     * 0   = wallpaper invisible
     * 1   = wallpaper completamente visible
     *
     * El runtime utiliza un overlay sólido encima
     * de la imagen, por eso se invierte el valor.
     */
    return clamp(
        1 - wallpaperVisibility,
        0,
        1
    );
}

function createWallpaperRule(
    context: vscode.ExtensionContext,
    settings: DsnNovaSettings,
    customWallpaperUrl?: string
): string {
    if (!settings.wallpaperEnabled) {
        return `
.monaco-workbench {
    --dsn-nova-wallpaper-image: none;
}
`;
    }

    const wallpaperUrl = escapeCssUrl(
        getWallpaperUrl(
            context,
            settings,
            customWallpaperUrl
        )
    );

    const overlayOpacity =
        getWallpaperOverlayOpacity(
            settings
        );

    const lightAppearance =
        isLightAppearance(settings);

    const overlayColor =
        lightAppearance
            ? `rgba(
                238,
                243,
                250,
                ${overlayOpacity}
            )`
            : `rgba(
                5,
                9,
                18,
                ${overlayOpacity}
            )`;

    return `
.monaco-workbench {
    --dsn-nova-wallpaper-image:
        url("${wallpaperUrl}");

    --dsn-nova-wallpaper-size:
        ${settings.wallpaperFit};

    --dsn-nova-wallpaper-position:
        ${settings.wallpaperPosition};

    --dsn-nova-wallpaper-repeat:
        no-repeat;

    --dsn-nova-wallpaper-attachment:
        fixed;

    --dsn-nova-wallpaper-overlay:
        ${overlayColor};
}
${createThemeSwitchRules(
    context,
    settings,
    overlayOpacity,
    Boolean(customWallpaperUrl)
)}`;
}

// In auto mode the loader bakes the CSS in at startup, so both variants are
// emitted and selected by the theme class VS Code sets on the workbench.
function createThemeSwitchRules(
    context: vscode.ExtensionContext,
    settings: DsnNovaSettings,
    overlayOpacity: number,
    hasCustomWallpaper: boolean
): string {
    const toUrl = (fileName: string): string =>
        escapeCssUrl(
            decodeURIComponent(
                vscode.Uri.joinPath(
                    context.extensionUri,
                    "assets",
                    "wallpapers",
                    fileName
                )
                    .with({
                        scheme: "vscode-file",
                        authority: "vscode-app"
                    })
                    .toString()
            )
        );

    const rule = (
        selector: string,
        fileName: string,
        overlay: string
    ): string => `
${selector} {
${hasCustomWallpaper ? "" : `    --dsn-nova-wallpaper-image:
        url("${toUrl(fileName)}");
`}
    --dsn-nova-wallpaper-overlay:
        ${overlay};
}
`;

    const horizonRule = rule(
        ".monaco-workbench.vs-dark.dsn-nova-horizon-mode",
        "dsn-nova-horizon.png",
        `rgba(5, 9, 18, ${overlayOpacity})`
    );

    // Horizon keeps its own image even when the appearance is forced.
    if (settings.appearance !== "auto") {
        return horizonRule;
    }

    return (
        rule(
            ".monaco-workbench.vs-dark, .monaco-workbench.hc-black",
            "dsn-nova-dark.svg",
            `rgba(5, 9, 18, ${overlayOpacity})`
        ) +
        rule(
            ".monaco-workbench.vs, .monaco-workbench.hc-light",
            "dsn-nova-light.svg",
            `rgba(238, 243, 250, ${(0.25 + overlayOpacity * 0.8).toFixed(2)})`
        ) +
        horizonRule
    );
}

export function generateConfigurationCss(
    context: vscode.ExtensionContext,
    settings: DsnNovaSettings,
    customWallpaperUrl?: string
): string {
    const wallpaperEnabled =
        settings.wallpaperEnabled ? 1 : 0;

    const glassEnabled =
        settings.glassEnabled ? 1 : 0;

    const debugOutline =
        settings.debugOutlines ? 1 : 0;

    const wallpaperOpacity = clamp(
        settings.wallpaperOpacity,
        0,
        1
    );

    const wallpaperBrightness = clamp(
        settings.wallpaperBrightness,
        0.2,
        1.5
    );

    const wallpaperSaturation = clamp(
        settings.wallpaperSaturation,
        0,
        2
    );

    const wallpaperBlur = clamp(
        settings.wallpaperBlur,
        0,
        30
    );

    const glassBlur = clamp(
        settings.glassBlur,
        0,
        40
    );

    const glassSaturation = clamp(
        settings.glassSaturation,
        50,
        200
    );

    const editorOpacity = clamp(
        settings.editorOpacity,
        0.5,
        1
    );

    const sidebarOpacity = clamp(
        settings.sidebarOpacity,
        0.5,
        1
    );

    const activityOpacity = clamp(
        settings.activityBarOpacity,
        0.5,
        1
    );

    const panelOpacity = clamp(
        settings.panelOpacity,
        0.5,
        1
    );

    const statusOpacity = clamp(
        settings.statusBarOpacity,
        0.5,
        1
    );

    const geometryOpacity = clamp(
        settings.geometryOpacity,
        0,
        1
    );

    const textEffect =
        settings.textEffectEnabled
            ? clamp(settings.textEffectStrength, 0, 1)
            : 0;

    const menuBlur = clamp(settings.menuBlur, 0, 12);
    const menuOpacity = clamp(settings.menuOpacity, 0.3, 1);

    return `/* =========================================================
   DSN NOVA GENERATED CONFIGURATION
   This file is generated automatically.
   Do not edit manually.
   ========================================================= */

:root {
    /* Wallpaper state */

    --dsn-wallpaper-enabled:
        ${wallpaperEnabled};

    --dsn-wallpaper-opacity:
        ${wallpaperOpacity};

    --dsn-wallpaper-brightness:
        ${wallpaperBrightness};

    --dsn-wallpaper-saturation:
        ${wallpaperSaturation};

    --dsn-wallpaper-blur:
        ${wallpaperBlur}px;

    /* Glass state */

    --dsn-glass-enabled:
        ${glassEnabled};

    --dsn-glass-blur:
        ${glassBlur}px;

    --dsn-glass-saturation:
        ${glassSaturation}%;

    /* Surface opacity */

    --dsn-editor-opacity:
        ${editorOpacity};

    --dsn-sidebar-opacity:
        ${sidebarOpacity};

    --dsn-activity-opacity:
        ${activityOpacity};

    --dsn-panel-opacity:
        ${panelOpacity};

    --dsn-status-opacity:
        ${statusOpacity};

    /* Text effect and menus */

    --dsn-text-fx:
        ;

    --dsn-menu-blur:
        px;

    --dsn-menu-opacity:
        ;

    /* Geometry and debugging */

    --dsn-geometry-opacity:
        ${geometryOpacity};

    --dsn-debug-outline:
        ${debugOutline};

    /* Legacy wallpaper variables */

    --dsn-wallpaper-size:
        ${settings.wallpaperFit};

    --dsn-wallpaper-position:
        ${settings.wallpaperPosition};

    /* Variables used by dsn-nova-runtime.js */

    --dsn-nova-wallpaper-size:
        ${settings.wallpaperFit};

    --dsn-nova-wallpaper-position:
        ${settings.wallpaperPosition};

    --dsn-nova-wallpaper-repeat:
        no-repeat;

    --dsn-nova-wallpaper-attachment:
        fixed;
}

/* =========================================================
   DSN NOVA GLASS SURFACES
   ========================================================= */

.monaco-workbench .part.sidebar,
.monaco-workbench .part.activitybar,
.monaco-workbench .part.editor,
.monaco-workbench .part.panel,
.monaco-workbench .part.statusbar {
    backdrop-filter:
        blur(
            calc(
                var(--dsn-glass-blur) *
                var(--dsn-glass-enabled)
            )
        )
        saturate(
            var(--dsn-glass-saturation)
        ) !important;

    -webkit-backdrop-filter:
        blur(
            calc(
                var(--dsn-glass-blur) *
                var(--dsn-glass-enabled)
            )
        )
        saturate(
            var(--dsn-glass-saturation)
        ) !important;
}

/* =========================================================
   DSN NOVA SURFACE OPACITY
   These variables remain available for safe.css/runtime.css.
   ========================================================= */

.monaco-workbench .part.editor {
    --dsn-current-surface-opacity:
        var(--dsn-editor-opacity);
}

.monaco-workbench .part.sidebar {
    --dsn-current-surface-opacity:
        var(--dsn-sidebar-opacity);
}

.monaco-workbench .part.activitybar {
    --dsn-current-surface-opacity:
        var(--dsn-activity-opacity);
}

.monaco-workbench .part.panel {
    --dsn-current-surface-opacity:
        var(--dsn-panel-opacity);
}

.monaco-workbench .part.statusbar {
    --dsn-current-surface-opacity:
        var(--dsn-status-opacity);
}

/* =========================================================
   DSN NOVA DEBUG OUTLINES
   ========================================================= */

.monaco-workbench.dsn-nova-runtime
.part.editor {
    outline:
        calc(
            1px *
            var(--dsn-debug-outline)
        )
        solid
        rgba(
            102,
            200,
            255,
            calc(
                0.7 *
                var(--dsn-debug-outline)
            )
        ) !important;

    outline-offset: -1px;
}

.monaco-workbench.dsn-nova-runtime
.part.sidebar {
    outline:
        calc(
            1px *
            var(--dsn-debug-outline)
        )
        solid
        rgba(
            218,
            112,
            214,
            calc(
                0.7 *
                var(--dsn-debug-outline)
            )
        ) !important;

    outline-offset: -1px;
}

.monaco-workbench.dsn-nova-runtime
.part.panel {
    outline:
        calc(
            1px *
            var(--dsn-debug-outline)
        )
        solid
        rgba(
            255,
            215,
            0,
            calc(
                0.7 *
                var(--dsn-debug-outline)
            )
        ) !important;

    outline-offset: -1px;
}

/* =========================================================
   WALLPAPER CONFIGURATION FOR dsn-nova-runtime.js
   ========================================================= */

${createWallpaperRule(
    context,
    settings,
    customWallpaperUrl
)}
`;
}

// VS Code only serves vscode-file:// resources from trusted roots, so a
// user-selected image is copied into globalStorage (named by content hash).
async function prepareCustomWallpaper(
    context: vscode.ExtensionContext,
    settings: DsnNovaSettings
): Promise<string | undefined> {
    const sourcePath = settings.wallpaperPath.trim();

    if (!sourcePath) {
        return undefined;
    }

    try {
        const data = await vscode.workspace.fs.readFile(
            vscode.Uri.file(sourcePath)
        );

        const hash = crypto
            .createHash("sha1")
            .update(data)
            .digest("hex")
            .slice(0, 10);

        const targetName =
            `wallpaper-${hash}${path.extname(sourcePath).toLowerCase()}`;

        const targetUri = vscode.Uri.joinPath(
            context.globalStorageUri,
            targetName
        );

        const existing =
            await vscode.workspace.fs.readDirectory(
                context.globalStorageUri
            );

        for (const [name] of existing) {
            if (
                name.startsWith("wallpaper-") &&
                name !== targetName
            ) {
                await vscode.workspace.fs.delete(
                    vscode.Uri.joinPath(
                        context.globalStorageUri,
                        name
                    )
                );
            }
        }

        await vscode.workspace.fs.writeFile(
            targetUri,
            data
        );

        return pathToCssUrl(targetUri.fsPath);
    } catch {
        void vscode.window.showWarningMessage(
            `DSN Nova could not read the wallpaper "${sourcePath}". Using the default wallpaper.`
        );

        return undefined;
    }
}

export async function writeGeneratedCss(
    context: vscode.ExtensionContext
): Promise<vscode.Uri> {
    const settings = getSettings();

    await vscode.workspace.fs.createDirectory(
        context.globalStorageUri
    );

    const customWallpaperUrl =
        await prepareCustomWallpaper(
            context,
            settings
        );

    const generatedCssUri =
        vscode.Uri.joinPath(
            context.globalStorageUri,
            "dsn-nova-generated.css"
        );

    const content =
        generateConfigurationCss(
            context,
            settings,
            customWallpaperUrl
        );

    await vscode.workspace.fs.writeFile(
        generatedCssUri,
        Buffer.from(
            content,
            "utf8"
        )
    );

    return generatedCssUri;
}
import * as vscode from "vscode";

export interface DsnNovaSettings {
    appearance: "auto" | "dark" | "light";

    wallpaperEnabled: boolean;
    wallpaperPath: string;
    wallpaperFit: string;
    wallpaperPosition: string;
    wallpaperOpacity: number;
    wallpaperBrightness: number;
    wallpaperSaturation: number;
    wallpaperBlur: number;

    glassEnabled: boolean;
    glassBlur: number;
    glassSaturation: number;

    editorOpacity: number;
    sidebarOpacity: number;
    activityBarOpacity: number;
    panelOpacity: number;
    statusBarOpacity: number;

    geometryOpacity: number;
    debugOutlines: boolean;

    textEffectEnabled: boolean;
    textEffectStrength: number;
    menuBlur: number;
    menuOpacity: number;
}

export function getSettings(): DsnNovaSettings {
    const configuration =
        vscode.workspace.getConfiguration("dsnNova");

    return {
        appearance:
            configuration.get<"auto" | "dark" | "light">(
                "appearance",
                "auto"
            ),

        wallpaperEnabled:
            configuration.get<boolean>(
                "wallpaper.enabled",
                true
            ),

        wallpaperPath:
            configuration.get<string>(
                "wallpaper.path",
                ""
            ),

        wallpaperFit:
            configuration.get<string>(
                "wallpaper.fit",
                "cover"
            ),

        wallpaperPosition:
            configuration.get<string>(
                "wallpaper.position",
                "center"
            ),

        wallpaperOpacity:
            configuration.get<number>(
                "wallpaper.opacity",
                0.42
            ),

        wallpaperBrightness:
            configuration.get<number>(
                "wallpaper.brightness",
                0.82
            ),

        wallpaperSaturation:
            configuration.get<number>(
                "wallpaper.saturation",
                0.9
            ),

        wallpaperBlur:
            configuration.get<number>(
                "wallpaper.blur",
                0
            ),

        glassEnabled:
            configuration.get<boolean>(
                "glass.enabled",
                true
            ),

        glassBlur:
            configuration.get<number>(
                "glass.blur",
                18
            ),

        glassSaturation:
            configuration.get<number>(
                "glass.saturation",
                118
            ),

        editorOpacity:
            configuration.get<number>(
                "opacity.editor",
                0.82
            ),

        sidebarOpacity:
            configuration.get<number>(
                "opacity.sidebar",
                0.78
            ),

        activityBarOpacity:
            configuration.get<number>(
                "opacity.activityBar",
                0.82
            ),

        panelOpacity:
            configuration.get<number>(
                "opacity.panel",
                0.84
            ),

        statusBarOpacity:
            configuration.get<number>(
                "opacity.statusBar",
                0.92
            ),

        geometryOpacity:
            configuration.get<number>(
                "geometry.opacity",
                0.38
            ),

        debugOutlines:
            configuration.get<boolean>(
                "debug.outlines",
                false
            ),

        textEffectEnabled:
            configuration.get<boolean>(
                "textEffect.enabled",
                true
            ),

        textEffectStrength:
            configuration.get<number>(
                "textEffect.strength",
                0.6
            ),

        menuBlur:
            configuration.get<number>(
                "menus.blur",
                4
            ),

        menuOpacity:
            configuration.get<number>(
                "menus.opacity",
                0.72
            )
    };
}

export async function updateSetting(
    key: string,
    value: unknown
): Promise<void> {
    await vscode.workspace
        .getConfiguration("dsnNova")
        .update(
            key,
            value,
            vscode.ConfigurationTarget.Global
        );
}

export async function resetSettings(): Promise<void> {
    const defaults: Record<string, unknown> = {
        "appearance": "auto",
        "wallpaper.enabled": true,
        "wallpaper.path": "",
        "wallpaper.fit": "cover",
        "wallpaper.position": "center",
        "wallpaper.opacity": 0.42,
        "wallpaper.brightness": 0.82,
        "wallpaper.saturation": 0.9,
        "wallpaper.blur": 0,
        "glass.enabled": true,
        "glass.blur": 18,
        "glass.saturation": 118,
        "opacity.editor": 0.82,
        "opacity.sidebar": 0.78,
        "opacity.activityBar": 0.82,
        "opacity.panel": 0.84,
        "opacity.statusBar": 0.92,
        "geometry.opacity": 0.38,
        "debug.outlines": false,
        "textEffect.enabled": true,
        "textEffect.strength": 0.6,
        "menus.blur": 4,
        "menus.opacity": 0.72
    };

    const configuration =
        vscode.workspace.getConfiguration("dsnNova");

    for (const [key, value] of Object.entries(defaults)) {
        await configuration.update(
            key,
            value,
            vscode.ConfigurationTarget.Global
        );
    }
}
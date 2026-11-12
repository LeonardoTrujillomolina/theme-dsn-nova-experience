import * as vscode from "vscode";
import {
    getSettings,
    updateSetting
} from "./settingsManager";

const DARK_THEME =
    "DSN Nova Dark";

const LIGHT_THEME =
    "DSN Nova Light";

const HORIZON_THEME =
    "DSN Nova Horizon";

export const DSN_THEMES = [
    { label: "DSN Nova Dark", icon: "$(circle-filled)", detail: "Deep dark with the default wallpaper" },
    { label: "DSN Nova Light", icon: "$(circle-large-outline)", detail: "Light with its own wallpaper" },
    { label: HORIZON_THEME, icon: "$(globe)", detail: "Space theme with the Earth and black hole image" }
];

export async function chooseTheme(): Promise<void> {
    const pick = await vscode.window.showQuickPick(
        DSN_THEMES.map((theme) => ({
            label: theme.icon + " " + theme.label,
            detail: theme.detail,
            name: theme.label
        })),
        { placeHolder: "DSN Nova theme" }
    );

    if (!pick) {
        return;
    }

    await updateSetting(
        "appearance",
        pick.name === LIGHT_THEME ? "light" : "dark"
    );

    await vscode.workspace
        .getConfiguration("workbench")
        .update(
            "colorTheme",
            pick.name,
            vscode.ConfigurationTarget.Global
        );
}

export async function applyConfiguredTheme(): Promise<void> {
    const settings = getSettings();

    if (settings.appearance === "auto") {
        return;
    }

    const current = vscode.workspace
        .getConfiguration("workbench")
        .get<string>("colorTheme", "");

    if (settings.appearance === "dark" && current === HORIZON_THEME) {
        return;
    }

    const theme =
        settings.appearance === "light"
            ? LIGHT_THEME
            : DARK_THEME;

    await vscode.workspace
        .getConfiguration("workbench")
        .update(
            "colorTheme",
            theme,
            vscode.ConfigurationTarget.Global
        );
}

export async function toggleTheme(): Promise<void> {
    const currentTheme =
        vscode.workspace
            .getConfiguration("workbench")
            .get<string>(
                "colorTheme",
                DARK_THEME
            );

    const useLight =
        currentTheme !== LIGHT_THEME;

    const nextTheme =
        useLight
            ? LIGHT_THEME
            : DARK_THEME;

    const nextAppearance =
        useLight
            ? "light"
            : "dark";

    await updateSetting(
        "appearance",
        nextAppearance
    );

    await vscode.workspace
        .getConfiguration("workbench")
        .update(
            "colorTheme",
            nextTheme,
            vscode.ConfigurationTarget.Global
        );
}
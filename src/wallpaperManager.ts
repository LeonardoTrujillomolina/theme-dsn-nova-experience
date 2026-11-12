import * as path from "path";
import * as vscode from "vscode";
import { updateSetting } from "./settingsManager";

const SUPPORTED_EXTENSIONS = [
    "png",
    "jpg",
    "jpeg",
    "webp",
    "svg",
    "gif"
];

export async function selectWallpaper(): Promise<
    vscode.Uri | undefined
> {
    const selectedFiles =
        await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            title: "Select DSN Nova Wallpaper",
            filters: {
                "Supported images": SUPPORTED_EXTENSIONS
            }
        });

    if (!selectedFiles || selectedFiles.length === 0) {
        return undefined;
    }

    const selectedWallpaper = selectedFiles[0];
    const extension = path
        .extname(selectedWallpaper.fsPath)
        .replace(".", "")
        .toLowerCase();

    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
        void vscode.window.showErrorMessage(
            "DSN Nova does not support this image format."
        );

        return undefined;
    }

    await updateSetting(
        "wallpaper.path",
        selectedWallpaper.fsPath
    );

    await updateSetting(
        "wallpaper.enabled",
        true
    );

    return selectedWallpaper;
}

export async function useDefaultWallpaper(): Promise<void> {
    await updateSetting(
        "wallpaper.path",
        ""
    );

    await updateSetting(
        "wallpaper.enabled",
        true
    );
}

export function pathToCssUrl(filePath: string): string {
    return decodeURIComponent(
        vscode.Uri
            .file(filePath)
            .with({
                scheme: "vscode-file",
                authority: "vscode-app"
            })
            .toString()
    );
}
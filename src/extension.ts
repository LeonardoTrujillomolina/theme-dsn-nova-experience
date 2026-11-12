import * as crypto from "crypto";
import * as vscode from "vscode";
import {
    configureLoader,
    configureSafeMode,
    getLoaderStatus,
    isLoaderInstalled
} from "./loaderIntegration";
import {
    resetSettings
} from "./settingsManager";
import {
    applyConfiguredTheme,
    toggleTheme,
    chooseTheme
} from "./themeController";
import {
    selectWallpaper,
    useDefaultWallpaper
} from "./wallpaperManager";

async function showReloadMessage(): Promise<void> {
    const selection =
        await vscode.window.showInformationMessage(
            "DSN Nova configuration was generated. Reload the Custom CSS and JS Loader to apply the changes.",
            "Reload Window",
            "Later"
        );

    if (selection === "Reload Window") {
        await vscode.commands.executeCommand(
            "workbench.action.reloadWindow"
        );
    }
}

async function enableFullExperience(
    context: vscode.ExtensionContext
): Promise<void> {
    if (!isLoaderInstalled()) {
        const selection =
            await vscode.window.showWarningMessage(
                "DSN Nova Atmosphere requires Custom CSS and JS Loader.",
                "Open Extensions",
                "Continue Anyway"
            );

        if (selection === "Open Extensions") {
            await vscode.commands.executeCommand(
                "workbench.extensions.search",
                "@id:be5invis.vscode-custom-css"
            );

            return;
        }

        if (selection !== "Continue Anyway") {
            return;
        }
    }

    await configureLoader(context);
    await applyConfiguredTheme();

    void vscode.window.showInformationMessage(
        "DSN Nova files are configured. Run 'Enable Custom CSS and JS' from the Command Palette as administrator, then restart VS Code."
    );
}

async function applyAppearance(
    context: vscode.ExtensionContext
): Promise<void> {
    await configureLoader(context);
    await applyConfiguredTheme();
    await showReloadMessage();
}

async function selectCustomWallpaper(
    context: vscode.ExtensionContext
): Promise<void> {
    const selectedWallpaper =
        await selectWallpaper();

    if (!selectedWallpaper) {
        return;
    }

    await configureLoader(context);

    void vscode.window.showInformationMessage(
        `DSN Nova wallpaper selected: ${selectedWallpaper.fsPath}`
    );

    await showReloadMessage();
}

async function restoreDefaultWallpaper(
    context: vscode.ExtensionContext
): Promise<void> {
    await useDefaultWallpaper();
    await configureLoader(context);

    void vscode.window.showInformationMessage(
        "DSN Nova default wallpaper restored."
    );

    await showReloadMessage();
}

async function restoreDefaults(
    context: vscode.ExtensionContext
): Promise<void> {
    await resetSettings();
    await configureLoader(context);

    void vscode.window.showInformationMessage(
        "DSN Nova appearance defaults restored."
    );

    await showReloadMessage();
}

async function restoreSafeMode(
    context: vscode.ExtensionContext
): Promise<void> {
    await configureSafeMode(context);

    void vscode.window.showWarningMessage(
        "DSN Nova Safe Mode is configured. Run 'Reload Custom CSS and JS' or disable the Loader, then restart VS Code."
    );
}

async function showDiagnostics(
    context: vscode.ExtensionContext
): Promise<void> {
    const imports =
        vscode.workspace
            .getConfiguration()
            .get<string[]>(
                "vscode_custom_css.imports",
                []
            );

    const message = [
        `Loader: ${getLoaderStatus()}`,
        `Extension path: ${context.extensionUri.fsPath}`,
        `Storage path: ${context.globalStorageUri.fsPath}`,
        `Configured imports: ${imports.length}`
    ].join("\n");

    const document =
        await vscode.workspace.openTextDocument({
            language: "text",
            content: message
        });

    await vscode.window.showTextDocument(
        document,
        {
            preview: true
        }
    );
}

const APPLIED_HASH_KEY = "dsnNova.loaderAppliedHash";

// The loader bakes the imported CSS/JS into VS Code, so it must be re-applied
// whenever any imported file changes (settings, extension update).
async function syncLoader(
    context: vscode.ExtensionContext
): Promise<void> {
    const imports = await configureLoader(context);

    if (!isLoaderInstalled()) {
        return;
    }

    const hash = crypto.createHash("sha1");

    for (const entry of imports) {
        try {
            hash.update(
                await vscode.workspace.fs.readFile(
                    vscode.Uri.parse(entry)
                )
            );
        } catch {
            hash.update(entry);
        }
    }

    const digest = hash.digest("hex");

    if (
        context.globalState.get<string>(
            APPLIED_HASH_KEY
        ) === digest
    ) {
        return;
    }

    try {
        await vscode.commands.executeCommand(
            "extension.updateCustomCSS"
        );
        await context.globalState.update(
            APPLIED_HASH_KEY,
            digest
        );
    } catch {
        void vscode.window.showWarningMessage(
            "DSN Nova could not enable Custom CSS and JS automatically. Run 'Enable Custom CSS and JS' from the Command Palette."
        );
    }
}

let syncTimer: NodeJS.Timeout | undefined;

function scheduleSync(
    context: vscode.ExtensionContext
): void {
    if (syncTimer) {
        clearTimeout(syncTimer);
    }

    syncTimer = setTimeout(() => {
        void syncLoader(context);
    }, 1500);
}

interface FontGroup {
    label: string;
    description: string;
    family: string;
    size: number;
    lineHeight: number;
    ligatures: boolean;
}

const FONT_GROUPS: FontGroup[] = [
    {
        label: "Classic",
        description: "Consolas, 14px",
        family: "Consolas, 'Courier New', monospace",
        size: 14,
        lineHeight: 0,
        ligatures: false
    },
    {
        label: "Modern",
        description: "Cascadia Code with ligatures, 14px",
        family: "'Cascadia Code', Consolas, monospace",
        size: 14,
        lineHeight: 22,
        ligatures: true
    },
    {
        label: "Developer",
        description: "JetBrains Mono / Fira Code, 14px",
        family: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
        size: 14,
        lineHeight: 22,
        ligatures: true
    },
    {
        label: "Comfortable",
        description: "Larger text and airy lines, 16px",
        family: "'Cascadia Code', Consolas, monospace",
        size: 16,
        lineHeight: 26,
        ligatures: true
    },
    {
        label: "Compact",
        description: "Small and dense, 12px",
        family: "Consolas, 'Courier New', monospace",
        size: 12,
        lineHeight: 18,
        ligatures: false
    }
];

async function chooseFontGroup(): Promise<void> {
    const pick = await vscode.window.showQuickPick(
        FONT_GROUPS.map((group) => ({
            label: group.label,
            description: group.description,
            group
        })),
        { placeHolder: "Choose a font group for the editor" }
    );

    if (!pick) {
        return;
    }

    const { group } = pick;
    const editor = vscode.workspace.getConfiguration("editor");
    const target = vscode.ConfigurationTarget.Global;

    await editor.update("fontFamily", group.family, target);
    await editor.update("fontSize", group.size, target);
    await editor.update("lineHeight", group.lineHeight, target);
    await editor.update("fontLigatures", group.ligatures, target);

    void vscode.window.showInformationMessage(
        `DSN Nova: font group "${group.label}" applied.`
    );
}

export function activate(
    context: vscode.ExtensionContext
): void {
    const statusItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        0
    );
    statusItem.text = "$(paintcan) DSN Nova";
    statusItem.tooltip = "DSN Nova appearance sliders: diamond button or Ctrl+Alt+N";
    statusItem.command = "dsnNova.openSettings";
    statusItem.show();
    context.subscriptions.push(statusItem);

    const commands: vscode.Disposable[] = [
        vscode.commands.registerCommand(
            "dsnNova.enableFullExperience",
            async () => {
                await enableFullExperience(context);
            }
        ),

        vscode.commands.registerCommand(
            "dsnNova.applyAppearance",
            async () => {
                await applyAppearance(context);
            }
        ),

        vscode.commands.registerCommand(
            "dsnNova.selectWallpaper",
            async () => {
                await selectCustomWallpaper(context);
            }
        ),

        vscode.commands.registerCommand(
            "dsnNova.useDefaultWallpaper",
            async () => {
                await restoreDefaultWallpaper(context);
            }
        ),

        vscode.commands.registerCommand(
            "dsnNova.toggleTheme",
            async () => {
                await toggleTheme();
            }
        ),

        vscode.commands.registerCommand(
            "dsnNova.openSettings",
            async () => {
                const pick = await vscode.window.showQuickPick(
                    [
                        {
                            label: "$(paintcan) Theme",
                            description: "Dark, Light or Horizon",
                            id: "theme"
                        },
                        {
                            label: "$(symbol-color) Sliders and code colors",
                            description: "Opacity, blur, text effect, palette (Ctrl+Alt+N)",
                            id: "panel"
                        },
                        {
                            label: "$(case-sensitive) Font group",
                            description: "Editor font, size and ligatures",
                            id: "fonts"
                        }
                    ],
                    { placeHolder: "DSN Nova" }
                );

                if (pick?.id === "theme") {
                    await chooseTheme();
                } else if (pick?.id === "fonts") {
                    await chooseFontGroup();
                } else if (pick?.id === "panel") {
                    void vscode.window.showInformationMessage(
                        "Press Ctrl+Alt+N or click the diamond button in the activity bar."
                    );
                }
            }
        ),

        vscode.commands.registerCommand(
            "dsnNova.chooseFontGroup",
            async () => {
                await chooseFontGroup();
            }
        ),

        vscode.commands.registerCommand(
            "dsnNova.restoreDefaults",
            async () => {
                await restoreDefaults(context);
            }
        ),

        vscode.commands.registerCommand(
            "dsnNova.restoreSafeMode",
            async () => {
                await restoreSafeMode(context);
            }
        ),

        vscode.commands.registerCommand(
            "dsnNova.showDiagnostics",
            async () => {
                await showDiagnostics(context);
            }
        )
    ];

    context.subscriptions.push(...commands);

    void syncLoader(context);

    const configurationWatcher =
        vscode.workspace.onDidChangeConfiguration(
            (event) => {
                if (
                    event.affectsConfiguration(
                        "dsnNova"
                    )
                ) {
                    scheduleSync(context);
                }
            }
        );

    context.subscriptions.push(
        configurationWatcher
    );
}

export function deactivate(): void {
    // No persistent process requires manual disposal.
}
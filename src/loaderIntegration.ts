import * as vscode from "vscode";
import { writeGeneratedCss } from "./cssGenerator";

const LOADER_EXTENSION_ID =
    "be5invis.vscode-custom-css";

const CUSTOM_CSS_IMPORTS_SETTING =
    "vscode_custom_css.imports";

function toExternalUri(uri: vscode.Uri): string {
    // The CSS loader only reads file:// URIs; globalStorage may yield other schemes.
    return vscode.Uri.file(uri.fsPath).toString();
}

export function isLoaderInstalled(): boolean {
    return Boolean(
        vscode.extensions.getExtension(
            LOADER_EXTENSION_ID
        )
    );
}

export function getRequiredImports(
    context: vscode.ExtensionContext,
    generatedCssUri: vscode.Uri
): string[] {
    const configurationCssUri =
        vscode.Uri.joinPath(
            context.extensionUri,
            "styles",
            "dsn-nova-config.css"
        );

    const baseCssUri =
        vscode.Uri.joinPath(
            context.extensionUri,
            "styles",
            "dsn-nova.css"
        );

    const wallpaperCssUri =
        vscode.Uri.joinPath(
            context.extensionUri,
            "styles",
            "dsn-nova-wallpaper.css"
        );

    const lightCssUri =
        vscode.Uri.joinPath(
            context.extensionUri,
            "styles",
            "dsn-nova-light.css"
        );

    const geometryCssUri =
        vscode.Uri.joinPath(
            context.extensionUri,
            "styles",
            "dsn-nova-geometry.css"
        );

    const runtimeJsUri =
        vscode.Uri.joinPath(
            context.extensionUri,
            "scripts",
            "dsn-nova-runtime.js"
        );

    return [
        toExternalUri(configurationCssUri),
        toExternalUri(baseCssUri),
        toExternalUri(wallpaperCssUri),
        toExternalUri(lightCssUri),
        toExternalUri(geometryCssUri),
        toExternalUri(generatedCssUri),
        toExternalUri(runtimeJsUri)
    ];
}

export async function configureLoader(
    context: vscode.ExtensionContext
): Promise<string[]> {
    const generatedCssUri =
        await writeGeneratedCss(context);

    const imports = getRequiredImports(
        context,
        generatedCssUri
    );

    await vscode.workspace
        .getConfiguration()
        .update(
            CUSTOM_CSS_IMPORTS_SETTING,
            imports,
            vscode.ConfigurationTarget.Global
        );

    return imports;
}

export async function configureSafeMode(
    context: vscode.ExtensionContext
): Promise<void> {
    const safeCssUri =
        vscode.Uri.joinPath(
            context.extensionUri,
            "styles",
            "safe.css"
        );

    await vscode.workspace
        .getConfiguration()
        .update(
            CUSTOM_CSS_IMPORTS_SETTING,
            [
                safeCssUri.toString()
            ],
            vscode.ConfigurationTarget.Global
        );
}

export function getLoaderStatus(): string {
    if (isLoaderInstalled()) {
        return "Installed";
    }

    return "Not installed";
}
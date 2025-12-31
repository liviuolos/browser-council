// Clipboard utilities for safe copy/paste operations

/**
 * Copy text to clipboard
 * @returns true if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        console.log('[Clipboard] Copied to clipboard:', text.length, 'characters');
        return true;
    } catch (error) {
        console.error('[Clipboard] Failed to copy:', error);

        // Fallback: try execCommand (deprecated but more compatible)
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (success) {
                console.log('[Clipboard] Copied via fallback method');
                return true;
            }
        } catch (fallbackError) {
            console.error('[Clipboard] Fallback also failed:', fallbackError);
        }

        return false;
    }
}

/**
 * Read text from clipboard
 * @returns clipboard text or null if failed
 */
export async function pasteFromClipboard(): Promise<string | null> {
    try {
        const text = await navigator.clipboard.readText();
        console.log('[Clipboard] Read from clipboard:', text.length, 'characters');
        return text;
    } catch (error) {
        console.error('[Clipboard] Failed to read:', error);
        return null;
    }
}

/**
 * Copy prompt with platform-specific instructions
 */
export async function copyPromptWithInstructions(
    prompt: string,
    platform: string
): Promise<boolean> {
    const instructions = `
/* Instructions for ${platform}:
 * 1. Paste this prompt into the input box
 * 2. Review the prompt
 * 3. Click Send
 * 4. Wait for complete response
 * 5. Return to the extension
 */

${prompt}`;

    return copyToClipboard(instructions);
}

/**
 * Show toast notification for clipboard action
 */
export function showClipboardToast(success: boolean, action: 'copy' | 'paste'): void {
    const message = success
        ? `✅ ${action === 'copy' ? 'Copied to' : 'Pasted from'} clipboard`
        : `❌ Failed to ${action}`;

    console.log('[Clipboard]', message);

    // You can integrate with a toast library here
    // For now, just console log
}

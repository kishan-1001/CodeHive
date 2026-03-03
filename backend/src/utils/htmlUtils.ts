/**
 * Simple utility to decode common HTML entities that might be introduced
 * by XSS sanitization or other processes. This is especially important for
 * code snippets and templates.
 */
export const decodeHTMLEntities = (text: string): string => {
    if (!text) return '';
    let decoded = text;
    let prev;
    do {
        prev = decoded;
        decoded = decoded
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&#39;/g, "'")
            .replace(/&#x2F;/g, '/')
            .replace(/&#x27;/g, "'");
    } while (decoded !== prev);
    return decoded;
};

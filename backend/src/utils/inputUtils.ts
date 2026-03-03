/**
 * Preprocesses LeetCode-style inputs into standard competitive programming inputs.
 * For example:
 *   "nums = [1,2,3], target = 5" -> "1 2 3\n5"
 *   "nums = [1,1,2]" -> "1 1 2"
 *   "s = \"abc\"" -> "abc"
 */
export const preprocessInput = (input: string): string => {
    if (!input) return '';

    // Split multiple variables by comma, but only if they are inside brackets
    // Simple way: find ", [a-z]" patterns or similar.
    // However, LeetCode inputs usually look like "var1 = val1, var2 = val2"

    // 1. Handle comma-separated variable assignments
    // We look for patterns like: something = [..., ...], something_else = ...
    const parts = input.split(/, (?=[a-z_]+\s*=)/i);

    const cleanedParts = parts.map(part => {
        // 1.5 Trim the part to handle leading/trailing spaces in the split parts
        let value = part.trim();

        // 2. Remove variable name up to the equals sign (robustly)
        value = value.replace(/^\s*[a-z_]+\s*=\s*/i, '').trim();

        // 3. Remove brackets for arrays
        if (value.startsWith('[') && value.endsWith(']')) {
            value = value.substring(1, value.length - 1);
            // Replace commas inside the array with spaces (handle cases like [1, 2, 3])
            // We replace commas with spaces and then collapse multiple spaces
            value = value.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
        }

        // 4. Remove quotes for strings
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
        }

        return value.trim();
    });

    // 5. Join cleaned values with newlines
    return cleanedParts.join('\n');
};

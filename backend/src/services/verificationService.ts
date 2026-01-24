import axios from 'axios';
import { load } from 'cheerio';

interface VerificationResult {
    success: boolean;
    error?: string;
}

class VerificationService {

    static async verifyProfile(platform: string, username: string | null, token: string): Promise<VerificationResult> {
        if (!username) {
            return { success: false, error: 'Username is missing. Please save your profile username first.' };
        }

        // Input cleaning: Remove URL parts if user pasted a link
        let cleanUsername = username.trim();
        // Remove trailing slash
        if (cleanUsername.endsWith('/')) cleanUsername = cleanUsername.slice(0, -1);

        const urlParts = cleanUsername.split('/');
        if (urlParts.length > 1) {
            // Take the last part of the URL as the username
            cleanUsername = urlParts[urlParts.length - 1];
        }

        console.log(`[Verification] Verifying ${platform} user: '${cleanUsername}' with token: ${token}`);

        try {
            switch (platform.toLowerCase()) {
                case 'leetcode':
                    console.log(`[Verification] Calling verifyLeetCode with: '${cleanUsername}'`);
                    return await this.verifyLeetCode(cleanUsername, token);
                case 'codeforces':
                    return await this.verifyCodeForces(cleanUsername, token);
                case 'codechef':
                    return await this.verifyCodeChef(cleanUsername, token);
                case 'geeksforgeeks':
                    return await this.verifyGeeksForGeeks(cleanUsername, token);
                case 'hackerrank':
                    return await this.verifyHackerRank(cleanUsername, token);
                default:
                    return { success: false, error: 'Platform not supported' };
            }
        } catch (error: any) {
            console.error(`Verification failed for ${platform} user ${cleanUsername}:`, error);
            return { success: false, error: `Internal verification error: ${error.message}` };
        }
    }

    private static async verifyLeetCode(username: string, token: string): Promise<VerificationResult> {
        try {
            console.log(`[LeetCode Verify] Requesting profile for: '${username}' (type: ${typeof username})`);

            if (!username) {
                return { success: false, error: 'Username is empty after cleaning.' };
            }

            const query = `
                query userProfile($username: String!) {
                    matchedUser(username: $username) {
                        profile {
                            aboutMe
                        }
                    }
                }
            `;

            const payload = {
                query,
                variables: { username }
            };
            console.log(`[LeetCode Verify] Payload:`, JSON.stringify(payload));

            const response = await axios.post('https://leetcode.com/graphql', payload);

            const profile = response.data.data?.matchedUser?.profile;
            if (!profile) {
                return { success: false, error: `LeetCode user '${username}' not found. Please check the spelling.` };
            }

            const aboutMe = profile.aboutMe || '';

            console.log(`[LeetCode Verify] Token to find: ${token}`);
            // console.log(`[LeetCode Verify] AboutMe found: ${aboutMe}`);

            if (aboutMe.includes(token)) {
                return { success: true };
            }

            return {
                success: false,
                error: `Token not found in LeetCode 'About'. We found: "${aboutMe.substring(0, 100)}..."`
            };
        } catch (e: any) {
            console.error('[LeetCode Verify] Error:', e.message);
            if (e.response) {
                console.error('[LeetCode Verify] API Error data:', JSON.stringify(e.response.data));
            }
            return { success: false, error: 'Failed to connect to LeetCode API. Please try again later.' };
        }
    }

    private static async verifyCodeForces(username: string, token: string): Promise<VerificationResult> {
        try {
            const response = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`);
            if (response.data.status !== 'OK') {
                return { success: false, error: `CodeForces user '${username}' not found.` };
            }
            const user = response.data.result[0];
            const fieldsToCheck = [user.firstName, user.lastName, user.organization, user.city];

            // Debugging
            const cleanToken = token.trim();
            console.log(`[CodeForces Verify] Token: '${cleanToken}' (len=${cleanToken.length})`);

            const match = fieldsToCheck.some(field => {
                if (!field) return false;
                const isMatch = field.includes(cleanToken);
                // console.log(`[CodeForces Field] '${field}' (len=${field.length}) includes token? ${isMatch}`);
                return isMatch;
            });

            if (match) {
                return { success: true };
            }

            return {
                success: false,
                error: `Token not found in CodeForces 'First Name', 'Last Name', or 'Organization'. Found: firstName='${user.firstName}', organization='${user.organization}'`
            };
        } catch (e: any) {
            console.error('[CodeForces Verify] Error:', e.message);
            return { success: false, error: `CodeForces user '${username}' not found or API error.` };
        }
    }

    private static async verifyCodeChef(username: string, token: string): Promise<VerificationResult> {
        try {
            const response = await axios.get(`https://www.codechef.com/users/${username}`);
            // CodeChef might be client-side rendered for some parts, but usually invalid field updates reflect in the source or API calls.
            // We check the raw HTML for the token.
            const cleanToken = token.trim();

            console.log(`[CodeChef Verify] Checking for token '${cleanToken}' in profile of '${username}'`);

            if (response.data.includes(cleanToken)) {
                return { success: true };
            }

            return { success: false, error: 'Token not found on CodeChef profile. Please ensure you have added it to your Name or About Me.' };
        } catch (e: any) {
            console.error('[CodeChef Verify] Error:', e.message);
            return { success: false, error: `CodeChef user '${username}' not found.` };
        }
    }

    private static async verifyGeeksForGeeks(username: string, token: string): Promise<VerificationResult> {
        try {
            // GFG profiles: https://www.geeksforgeeks.org/user/USERNAME/
            const response = await axios.get(`https://www.geeksforgeeks.org/user/${username}/`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            // Check raw HTML
            if (response.data.includes(token)) return { success: true };
            return { success: false, error: 'Token not found on GeeksForGeeks profile page.' };
        } catch (e) {
            return { success: false, error: `GeeksForGeeks user '${username}' not found.` };
        }
    }

    private static async verifyHackerRank(username: string, token: string): Promise<VerificationResult> {
        const cleanUsername = username.trim();
        const cleanToken = token.trim();

        console.log(`[HackerRank Verify] Starting verification for '${cleanUsername}'`);

        // 1. Try JSON API
        try {
            console.log(`[HackerRank Verify] API checking...`);
            const response = await axios.get(`https://www.hackerrank.com/rest/hackers/${cleanUsername}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*'
                }
            });

            const model = response.data?.model;
            if (model) {
                const fieldsToCheck = [
                    model.short_bio,
                    model.name,
                    model.personal_first_name,
                    model.username,
                    model.about
                ];
                console.log(`[HackerRank Verify] API Fields:`, fieldsToCheck);
                if (fieldsToCheck.some(field => field && field.includes(cleanToken))) {
                    return { success: true };
                }
            }
        } catch (e: any) {
            console.log(`[HackerRank Verify] API failed (${e.message}), trying HTML fallback...`);
            if (e.response && e.response.status === 404) {
                return { success: false, error: `HackerRank user '${cleanUsername}' does not exist (API returned 404). Please ensure the username is correct.` };
            }
        }

        // 2. Fallback: Check Public Profile HTML
        try {
            console.log(`[HackerRank Verify] HTML checking...`);
            const response = await axios.get(`https://www.hackerrank.com/profile/${cleanUsername}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            // Check body inclusion
            if (response.data.includes(cleanToken)) {
                return { success: true };
            }

            return { success: false, error: `Token not found in HackerRank profile (checked Name, Bio, and Page Source).` };

        } catch (e: any) {
            console.error('[HackerRank Verify] Error:', e.message);
            return { success: false, error: `Failed to fetch HackerRank profile for '${cleanUsername}'. User may not exist or is blocked.` };
        }
    }
}

export default VerificationService;

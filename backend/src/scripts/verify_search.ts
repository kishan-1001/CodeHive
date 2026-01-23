
import { GlobalLeaderboardService } from '../services/globalLeaderboard';
import { pool } from '../config/db';

async function run() {
    console.log('Testing Global Leaderboard Search...');
    try {
        // Test 1: Count
        const count = await GlobalLeaderboardService.getLeaderboardCount('');
        console.log('Total Users:', count);

        // Test 2: Search for 'Kishan' (assuming user 36 is Kishan)
        const searchResults = await GlobalLeaderboardService.getLeaderboard(10, 0, 'Kishan');
        console.log(`Search 'Kishan': Found ${searchResults.length} users`);
        if (searchResults.length > 0) {
            console.log('Sample:', searchResults[0].name, searchResults[0].email);
        }

        // Test 3: Pagination count
        const searchCount = await GlobalLeaderboardService.getLeaderboardCount('Kishan');
        console.log(`Search 'Kishan' Total Count: ${searchCount}`);

    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

run();

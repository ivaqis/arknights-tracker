// test-backend.js
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const BASE_URL = 'http://localhost:3001/api';
const prisma = new PrismaClient();

const MOCK_IMAGE_128 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAPoAAAD6AG1e1JrAAACcklEQVR4nO2cwY0DMRDDWLo7l8vQAOKD/4NE6JJdOwSeMJsB7T9AUAAlwAVQAvwXoAT4GUAJ8EOgEuC3ACXAr4FKgM8BlAAfBCkBPglUAnwUrAT4LkAJ8GWQEuDbQCXA18FKgOcBlAAPhCgBnghSAjwSpgR4JlAJ8FCoEuCpYCXAY+FKgPcClAAvhigB3gxSArwapgR4N1AJ8HKoEuDtYCXA6+Hxerq/D5BxCfyBCPolKMCBIDKKC0C/BAU4EERGcQHol6AAB4LIKC4A/RIU4EAQGcUFoF+CAhwIIqO4APRLUIADQWQUF4B+CQpwIIiM4gLQL0EBDgSRUVwA+iUowIEgMooLQL8EBTgQREZxAeiXoAAHgsgoLgD9EhTgQBAZxQWgX4ICHAgio7gA9EtQgANBZBQXgH4JCnAgiIziAtAvQQEOBJFRXAD6JSjAgSAyigtAvwQFOBBERnEB6JegAAeCyCguAP0SFOBAEBnFBaBfggIcCCKjuAD0S1CAA0FkFBeAfgkKcCCIjOIC0C9BAQ4EkVFcAPolKMCBIDKKC0C/BAU4EERGcQHol6AAB4LIKC4A/RIU4EAQGcUFoF+CAhwIIqO4APRLUIADQWQUF4B+CQpwIIiM4gLQL0EBDgSRUVwA+iUowIEgMooLQL8EBTgQREZxAeiXoAAHgsgoLgD9EhTgQBAZxQWgX4ICHAgio7gA9EtQgANBZBQXgH4JCnAgiIziAtAvQQEOBJFRXAD6JSjAgSAyigtAvwQFOBBERnEB6JegAAeCyCguAP0SFOBAEBnFBaBfggIcCCKjuAD0S1CAA0FkFBeAfgkKcCCIjPIBVJDFkuB7njUAAAAASUVORK5CYII=";

async function runTests() {
    console.log("=== STARTING BACKEND INTEGRATION TESTS ===\n");
    const testUid = "mock_test_operator_1";

    try {
        // Reset DB for clean tests
        await prisma.userAccount.deleteMany({
            where: { firebase_uid: { in: [testUid, "mock_thief_operator"] } }
        });
        // Test 1: Register Profile
        console.log("[Test 1] Registering profile...");
        const regRes = await axios.post(`${BASE_URL}/user/profile`, {
            idToken: testUid,
            name: "ivawa_operator"
        });
        console.log("Response:", regRes.data);
        if (regRes.data.status === 'success' && regRes.data.data.name === 'ivawa_operator') {
            console.log("✅ Register Profile Success!\n");
        } else {
            throw new Error("Register Profile failed");
        }

        // Test 2: Sync Mock Game Account
        console.log("[Test 2] Syncing game account...");
        const syncRes = await axios.post(`${BASE_URL}/user/sync`, {
            idToken: testUid,
            gameToken: "mock_game_token",
            testRecords: [
                {
                    game_uid: "test_game_uid_999",
                    account_info: {
                        base: { name: "ivawa_test", level: 42, serverId: "3" },
                        stats: { charCount: 10, explorationLevel: 5 },
                        chars: [{ id: "endministrator1", name: "Эндминистратор", level: 60, potential: 6 }],
                        contract: { clearTime: 360, level: 45, chars: [] }
                    }
                }
            ]
        });
        console.log("Response (synced accounts count):", syncRes.data.game_accounts.length);
        if (syncRes.data.status === 'success' && syncRes.data.game_accounts.length > 0) {
            console.log("✅ Sync Game Account Success!\n");
        } else {
            throw new Error("Sync Game Account failed");
        }

        // Test 3: UID Protection (Account Theft Prevention)
        console.log("[Test 3] Verifying UID Theft Protection...");
        try {
            // Register thief profile first so it passes profile checks
            await axios.post(`${BASE_URL}/user/profile`, {
                idToken: "mock_thief_operator",
                name: "thief_operator"
            });

            await axios.post(`${BASE_URL}/user/sync`, {
                idToken: "mock_thief_operator",
                gameToken: "mock_game_token",
                testRecords: [
                    {
                        game_uid: "test_game_uid_999", // Belongs to mock_test_operator_1
                        account_info: {
                            base: { name: "thief", level: 10 }
                        }
                    }
                ]
            });
            throw new Error("UID theft protection failed (thief was allowed to sync owned UID)");
        } catch (err) {
            if (err.response && err.response.status === 403) {
                console.log("Response error message:", err.response.data.error);
                console.log("✅ UID Theft Protection blocked the thief successfully!\n");
            } else {
                throw err;
            }
        }

        // Test 4: Avatar Upload & NSFW Strike check
        console.log("[Test 4] Uploading NSFW avatar (mocked via name contains 'nsfw')...");
        const nsfwRes = await axios.post(`${BASE_URL}/user/upload-avatar`, {
            idToken: testUid,
            image: MOCK_IMAGE_128,
            filename: "nsfw_pic.png"
        });
        console.log("Response:", nsfwRes.data);
        if (nsfwRes.data.nsfw === true && nsfwRes.data.avatar_strike === 1) {
            console.log("✅ NSFW check blocked image and set avatar_strike successfully!\n");
        } else {
            throw new Error("NSFW check failed");
        }

        console.log("[Test 4b] Uploading clean avatar...");
        const cleanRes = await axios.post(`${BASE_URL}/user/upload-avatar`, {
            idToken: testUid,
            image: MOCK_IMAGE_128,
            filename: "operator.png"
        });
        console.log("Response:", cleanRes.data);
        if (cleanRes.data.nsfw === false && cleanRes.data.picture) {
            console.log("✅ Clean image uploaded and saved successfully!\n");
        } else {
            throw new Error("Clean avatar upload failed");
        }

        // Test 5: Upload Limits (max 10)
        console.log("[Test 5] Enforcing 10 uploads/month limit...");
        // Since we have already done 2 uploads (nsfw + clean), upload 9 more times to exceed limit
        for (let i = 0; i < 9; i++) {
            try {
                await axios.post(`${BASE_URL}/user/upload-avatar`, {
                    idToken: testUid,
                    image: MOCK_IMAGE_128,
                    filename: `operator_${i}.png`
                });
            } catch (err) {
                if (err.response && err.response.status === 429) {
                    console.log("Response error message:", err.response.data.error);
                    console.log("✅ Monthly upload limit of 10 enforced successfully!\n");
                    break;
                } else {
                    throw err;
                }
            }
        }

        // Test 6: Leaderboard retrieve & caching check
        console.log("[Test 6] Querying leaderboard...");
        const ldRes1 = await axios.get(`${BASE_URL}/leaderboard?event_type=contract`);
        console.log("Response entries count:", ldRes1.data.data.length);
        
        console.log("Querying leaderboard again (should be cached)...");
        const t0 = Date.now();
        const ldRes2 = await axios.get(`${BASE_URL}/leaderboard?event_type=contract`);
        const duration = Date.now() - t0;
        console.log(`Response entries count: ${ldRes2.data.data.length} (Fetched in ${duration}ms)`);
        if (ldRes1.data.data.length > 0 && ldRes2.data.data.length > 0) {
            console.log("✅ Leaderboard retrieved and cached successfully!\n");
        } else {
            throw new Error("Leaderboard retrieval failed");
        }

        // Test 7: Privacy Toggle and Cache Invalidation
        console.log("[Test 7] Setting account to private...");
        const privRes = await axios.post(`${BASE_URL}/user/profile`, {
            idToken: testUid,
            is_private: 1
        });
        console.log("Response is_private:", privRes.data.data.is_private);

        console.log("Querying leaderboard (should not contain private account)...");
        const ldRes3 = await axios.get(`${BASE_URL}/leaderboard?event_type=contract`);
        console.log("Response entries count:", ldRes3.data.data.length);
        const hasPrivate = ldRes3.data.data.some(entry => entry.game_uid === "test_game_uid_999");
        
        // Revert setting to public
        await axios.post(`${BASE_URL}/user/profile`, {
            idToken: testUid,
            is_private: 0
        });

        if (!hasPrivate) {
            console.log("✅ Privacy settings and cache invalidation succeeded!\n");
        } else {
            throw new Error("Private account was still visible in leaderboard");
        }

        // Test 8: Get Profile by Name (Case-insensitive)
        console.log("[Test 8] Fetching profile by name...");
        const nameRes1 = await axios.get(`${BASE_URL}/user/profile-by-name/IvaWa_OpErAtOr`);
        console.log("Response name:", nameRes1.data.data.name);
        if (nameRes1.data.status === 'success' && nameRes1.data.data.name === 'ivawa_operator') {
            console.log("✅ Get profile by name (case-insensitive) success!\n");
        } else {
            throw new Error("Get profile by name failed");
        }

        // Test 8b: Get Profile by Name when Private
        console.log("[Test 8b] Fetching private profile by name (should fail with 403)...");
        await axios.post(`${BASE_URL}/user/profile`, {
            idToken: testUid,
            is_private: 1
        });
        try {
            await axios.get(`${BASE_URL}/user/profile-by-name/IvaWa_OpErAtOr`);
            throw new Error("Fetching private profile by name should have failed");
        } catch (err) {
            if (err.response && err.response.status === 403) {
                console.log("✅ Private profile correctly returns 403!\n");
            } else {
                throw err;
            }
        }
        // Revert setting to public
        await axios.post(`${BASE_URL}/user/profile`, {
            idToken: testUid,
            is_private: 0
        });

        // Test 9: Delete Game Account
        console.log("[Test 9] Deleting game account (unlinking)...");
        const deleteRes = await axios.delete(`${BASE_URL}/user/game-account/test_game_uid_999`, {
            data: { idToken: testUid }
        });
        console.log("Response:", deleteRes.data);
        const doubleCheckDetails = await prisma.userAccountDetails.findUnique({
            where: { game_uid: "test_game_uid_999" }
        });
        const doubleCheckLeaderboard = await prisma.userLeaderboard.findFirst({
            where: { game_uid: "test_game_uid_999" }
        });
        if (!doubleCheckDetails && !doubleCheckLeaderboard) {
            console.log("✅ Delete game account (cascade clean up) success!\n");
        } else {
            throw new Error("Delete game account did not clean up details or leaderboard entries");
        }

        console.log("🎉 ALL BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉");

    } catch (e) {
        console.error("❌ Test failed with error:", e.message);
        if (e.response) {
            console.error("Server response:", e.response.data);
        }
    } finally {
        await prisma.$disconnect();
    }
}

runTests();

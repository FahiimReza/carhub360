// Generate unique coupon codes
function generateCouponCode() {
    return "CH360-" + Math.floor(Math.random() * 100000);
}

// Save reward to localStorage
function saveReward(code) {
    try {
        const rewards = JSON.parse(localStorage.getItem('carhub360_rewards') || '[]');
        rewards.push({
            code: code,
            timestamp: new Date().toISOString(),
            used: false
        });
        localStorage.setItem('carhub360_rewards', JSON.stringify(rewards));
    } catch (error) {
        console.error('Error saving reward:', error);
    }
}

// Get all saved rewards
function getSavedRewards() {
    try {
        return JSON.parse(localStorage.getItem('carhub360_rewards') || '[]');
    } catch (error) {
        console.error('Error getting rewards:', error);
        return [];
    }
}

// Check if user has played recently (prevent spam)
function canPlayGame(gameId) {
    try {
        const lastPlayed = localStorage.getItem(`carhub360_last_${gameId}`);
        if (!lastPlayed) return true;
        
        const timeDiff = Date.now() - parseInt(lastPlayed);
        const cooldownTime = 5 * 60 * 1000; // 5 minutes cooldown
        
        return timeDiff > cooldownTime;
    } catch (error) {
        console.error('Error checking game cooldown:', error);
        return true;
    }
}

// Set last played time
function setLastPlayed(gameId) {
    try {
        localStorage.setItem(`carhub360_last_${gameId}`, Date.now().toString());
    } catch (error) {
        console.error('Error setting last played:', error);
    }
}
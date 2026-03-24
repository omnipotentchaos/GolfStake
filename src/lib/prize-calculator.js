/**
 * Prize Pool Calculator
 * Calculates prize pools based on active subscribers and enforces
 * the distribution rules from the PRD:
 * 
 * - 5-Number Match: 40% (Jackpot, rolls over if unclaimed)
 * - 4-Number Match: 35% (no rollover)
 * - 3-Number Match: 25% (no rollover)
 */

// Subscription pricing
export const SUBSCRIPTION_PRICES = {
  monthly: 9.99,
  yearly: 99.99,
};

// Percentage of subscription that goes to prize pool
export const PRIZE_POOL_PERCENTAGE = 0.50; // 50% of subscription contributes to prize pool

// Prize distribution percentages
export const PRIZE_DISTRIBUTION = {
  '5-match': { share: 0.40, rollover: true, label: '5-Number Match (Jackpot)' },
  '4-match': { share: 0.35, rollover: false, label: '4-Number Match' },
  '3-match': { share: 0.25, rollover: false, label: '3-Number Match' },
};

/**
 * Calculate the total prize pool for a given month
 * @param {number} activeSubscribers - Number of active subscribers
 * @param {number} avgSubscriptionPrice - Average subscription price
 * @param {number} previousJackpot - Rolled-over jackpot from previous months
 * @returns {Object} - Pool breakdown by match type
 */
export function calculatePrizePool(activeSubscribers, avgSubscriptionPrice = SUBSCRIPTION_PRICES.monthly, previousJackpot = 0) {
  const totalRevenue = activeSubscribers * avgSubscriptionPrice;
  const totalPool = totalRevenue * PRIZE_POOL_PERCENTAGE;

  return {
    totalPool: totalPool + previousJackpot,
    breakdown: {
      '5-match': {
        ...PRIZE_DISTRIBUTION['5-match'],
        amount: (totalPool * PRIZE_DISTRIBUTION['5-match'].share) + previousJackpot,
      },
      '4-match': {
        ...PRIZE_DISTRIBUTION['4-match'],
        amount: totalPool * PRIZE_DISTRIBUTION['4-match'].share,
      },
      '3-match': {
        ...PRIZE_DISTRIBUTION['3-match'],
        amount: totalPool * PRIZE_DISTRIBUTION['3-match'].share,
      },
    },
    activeSubscribers,
    totalRevenue,
  };
}

/**
 * Distribute prizes among winners of a given tier
 * @param {number} poolAmount - Total pool for this tier
 * @param {number} winnerCount - Number of winners in this tier
 * @returns {number} - Prize per winner
 */
export function calculatePerWinnerPrize(poolAmount, winnerCount) {
  if (winnerCount <= 0) return 0;
  return Math.floor((poolAmount / winnerCount) * 100) / 100; // Round down to 2 decimal places
}

/**
 * Calculate complete draw payouts
 * @param {Object} drawResults - Results from simulateDraw
 * @param {number} activeSubscribers
 * @param {number} previousJackpot
 * @returns {Object} - Complete payout breakdown
 */
export function calculateDrawPayouts(drawResults, activeSubscribers, previousJackpot = 0) {
  const pool = calculatePrizePool(activeSubscribers, SUBSCRIPTION_PRICES.monthly, previousJackpot);

  // Count winners per tier
  const winnersByTier = { '5-match': [], '4-match': [], '3-match': [] };
  drawResults.forEach(result => {
    if (result.matchType && winnersByTier[result.matchType]) {
      winnersByTier[result.matchType].push(result);
    }
  });

  // Calculate payouts
  const payouts = {};
  let newJackpot = 0;

  Object.entries(winnersByTier).forEach(([tier, winners]) => {
    const tierPool = pool.breakdown[tier].amount;
    const prizePerWinner = calculatePerWinnerPrize(tierPool, winners.length);

    payouts[tier] = {
      pool: tierPool,
      winners: winners.length,
      prizePerWinner,
      totalPaid: prizePerWinner * winners.length,
      winnerDetails: winners.map(w => ({
        userId: w.userId,
        userName: w.userName,
        prize: prizePerWinner,
      })),
    };

    // Track jackpot rollover
    if (tier === '5-match' && winners.length === 0) {
      newJackpot = tierPool;
    }
  });

  return {
    pool,
    payouts,
    jackpotRollover: newJackpot,
    totalPaidOut: Object.values(payouts).reduce((sum, p) => sum + p.totalPaid, 0),
  };
}

/**
 * Calculate charity contribution from a subscription
 * @param {number} subscriptionPrice
 * @param {number} charityPercentage - Minimum 10%
 * @returns {number}
 */
export function calculateCharityContribution(subscriptionPrice, charityPercentage = 10) {
  const percentage = Math.max(10, charityPercentage); // Enforce minimum 10%
  return Math.floor((subscriptionPrice * percentage / 100) * 100) / 100;
}

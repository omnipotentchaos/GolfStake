/**
 * Draw Engine
 * Handles the core draw logic for the Golf Charity Platform.
 * Supports both random and algorithmic (frequency-weighted) draw generation.
 * 
 * Draw Types:
 * - 5-Number Match (Jackpot, 40% pool)
 * - 4-Number Match (35% pool)
 * - 3-Number Match (25% pool)
 */

/**
 * Generate a random draw — 5 unique numbers between 1 and 45
 * Standard lottery-style draw
 */
export function generateRandomDraw() {
  const numbers = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Generate an algorithmic draw — weighted by score frequency analysis
 * Scores that appear more frequently across all users have higher probability
 * @param {number[][]} allUserScores - Array of user score arrays
 */
export function generateAlgorithmicDraw(allUserScores) {
  // Build frequency map from all user scores
  const frequencyMap = new Map();
  for (let i = 1; i <= 45; i++) {
    frequencyMap.set(i, 0);
  }

  allUserScores.forEach(scores => {
    scores.forEach(score => {
      frequencyMap.set(score, (frequencyMap.get(score) || 0) + 1);
    });
  });

  // Create weighted pool — more frequent scores get more entries
  const weightedPool = [];
  frequencyMap.forEach((count, number) => {
    // Minimum weight of 1 so all numbers have a chance
    const weight = Math.max(1, count);
    for (let i = 0; i < weight; i++) {
      weightedPool.push(number);
    }
  });

  // Draw 5 unique numbers from the weighted pool
  const drawn = new Set();
  let attempts = 0;
  const maxAttempts = 10000;

  while (drawn.size < 5 && attempts < maxAttempts) {
    const idx = Math.floor(Math.random() * weightedPool.length);
    drawn.add(weightedPool[idx]);
    attempts++;
  }

  // Fallback if not enough unique numbers
  while (drawn.size < 5) {
    drawn.add(Math.floor(Math.random() * 45) + 1);
  }

  return Array.from(drawn).sort((a, b) => a - b);
}

/**
 * Calculate how many numbers match between user scores and drawn numbers
 * @param {number[]} userScores - User's 5 scores (values only)
 * @param {number[]} drawnNumbers - The 5 drawn numbers
 * @returns {Object} - { matchCount, matchedNumbers }
 */
export function calculateMatches(userScores, drawnNumbers) {
  const drawnSet = new Set(drawnNumbers);
  const matchedNumbers = userScores.filter(score => drawnSet.has(score));
  return {
    matchCount: matchedNumbers.length,
    matchedNumbers,
  };
}

/**
 * Determine the match type for prize allocation
 * @param {number} matchCount
 * @returns {string|null} - '5-match', '4-match', '3-match', or null
 */
export function getMatchType(matchCount) {
  if (matchCount >= 5) return '5-match';
  if (matchCount === 4) return '4-match';
  if (matchCount === 3) return '3-match';
  return null;
}

/**
 * Run a complete draw simulation
 * @param {Object} params
 * @param {string} params.drawType - 'random' or 'algorithmic'
 * @param {Array} params.participants - [{ userId, scores: [number] }]
 * @returns {Object} - { drawnNumbers, results: [{ userId, matchCount, matchType, matchedNumbers }] }
 */
export function simulateDraw({ drawType = 'random', participants = [] }) {
  const allScores = participants.map(p => p.scores);
  const drawnNumbers = drawType === 'algorithmic'
    ? generateAlgorithmicDraw(allScores)
    : generateRandomDraw();

  const results = participants.map(participant => {
    const { matchCount, matchedNumbers } = calculateMatches(
      participant.scores,
      drawnNumbers
    );
    const matchType = getMatchType(matchCount);

    return {
      userId: participant.userId,
      userName: participant.userName || 'Unknown',
      scores: participant.scores,
      matchCount,
      matchType,
      matchedNumbers,
    };
  });

  // Sort results by match count (highest first)
  results.sort((a, b) => b.matchCount - a.matchCount);

  return { drawnNumbers, results };
}

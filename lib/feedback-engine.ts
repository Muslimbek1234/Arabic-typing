// AI Feedback Engine
// Provides performance feedback in Uzbek and adjusts skill level

/**
 * Calculate feedback message based on typing performance
 * Returns an Uzbek feedback string analyzing speed and accuracy
 *
 * @param wpm - Words per minute
 * @param accuracy - Accuracy percentage (0-100)
 * @param errors - Number of errors made
 * @returns Feedback string in Uzbek
 */
export function calculateFeedback(
  wpm: number,
  accuracy: number,
  errors: number
): string {
  // Exceptional performance: fast and highly accurate
  if (wpm > 40 && accuracy >= 98) {
    return 'Mukammal natija! Mushak xotirangiz alo darajada shakllangan.';
  }

  // Fast but inaccurate: speed without precision
  if (wpm > 40 && accuracy < 90) {
    return `Siz juda tez yozyapsiz, lekin xatolar ko'p. ${errors} ta xato qayd etildi. Tezlikni biroz pasaytirib, aniqlikka e'tibor bering.`;
  }

  // Slow but accurate: precision without speed
  if (wpm < 20 && accuracy >= 95) {
    return "Aniqlik ajoyib! Endi ritmni tezlashtiring. Har bir harfni o'ylamasdan yozishga harakat qiling.";
  }

  // Slow and inaccurate: needs fundamental practice
  if (wpm < 20 && accuracy < 90) {
    return `Harflar joylashuviga ko'proq e'tibor bering. ${errors} ta xatoni kamaytirish uchun sekin va aniq yozing.`;
  }

  // Default: decent performance with room for improvement
  return 'Yaxshi natija. Xatosiz yozish qobiliyatini mustahkamlang.';
}

/**
 * Adjust skill level based on performance metrics
 * Increases on good performance, decreases on poor accuracy
 *
 * @param current - Current skill level (1-10)
 * @param wpm - Words per minute achieved
 * @param accuracy - Accuracy percentage (0-100)
 * @returns New skill level (1-10)
 */
export function adjustSkillLevel(
  current: number,
  wpm: number,
  accuracy: number
): number {
  // Promote: fast and accurate typing
  if (wpm >= 30 && accuracy >= 95) {
    return Math.min(10, current + 1);
  }

  // Demote: poor accuracy indicates need for easier content
  if (accuracy < 80) {
    return Math.max(1, current - 1);
  }

  // Maintain: acceptable performance, no change needed
  return current;
}

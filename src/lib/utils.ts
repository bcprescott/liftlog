export const calculate1RM = (weight: number, reps: number): number => {
    if (reps === 1) return weight
    // Epley Formula
    return Math.round(weight * (1 + reps / 30))
}

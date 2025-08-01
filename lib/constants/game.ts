export const COUNT_DOWN_TIME = 5
export const RANDOM_NUMBER_MIN = 1
export const RANDOM_NUMBER_MAX = 10
export const OPERATORS = ["+", "-", "*", "/"] as const

export type Operator = typeof OPERATORS[number]

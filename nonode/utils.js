const random = (a = 1, b = 0) => fxrand() * (b - a) + a
const round_random = (a = 1, b = 0) => Math.floor(random(a, b + 1))
const choose = (arr) => arr[Math.floor(random(arr.length))]
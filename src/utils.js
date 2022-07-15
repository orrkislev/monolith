import SimplexNoise from 'simplex-noise';

export const random = (a = 1, b = 0) => Math.random() * (b - a) + a

const map = (value, min, max, a, b) => {
    return (value - min) / (max - min) * (b - a) + a
}

export const choose = (arr) => arr[Math.floor(random(arr.length))]

export const noise = new SimplexNoise()
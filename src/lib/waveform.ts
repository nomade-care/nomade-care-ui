// A simple deterministic pseudo-random number generator
const mulberry32 = (a: number) => {
    return () => {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Function to generate a waveform array from a seed
export const generateWaveform = (seed: string, length: number): number[] => {
    if(!seed) return new Array(length).fill(0);
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    const random = mulberry32(hash);
    const data = new Array(length);
    let last = 0.5;

    for (let i = 0; i < length; i++) {
        const smoothingFactor = 0.7;
        const next = random();
        last = last * smoothingFactor + next * (1 - smoothingFactor);
        data[i] = last;
    }

    return data;
};

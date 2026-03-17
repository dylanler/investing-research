export interface PayoffMatrixData {
  id: string;
  title: string;
  description: string;
  players: [string, string];
  strategies: [string[], string[]];
  payoffs: [number, number][][];
  nashEquilibrium: [number, number];
  actualOutcome: [number, number];
  lesson: string;
}

export const gameTheoryData: PayoffMatrixData[] = [
  {
    id: 'commitment',
    title: 'The Commitment Game',
    description: 'Anthropic vs OpenAI: Who commits to compute early?',
    players: ['Anthropic', 'OpenAI'],
    strategies: [['Commit Early', 'Be Conservative'], ['Commit Early', 'Be Conservative']],
    payoffs: [
      [[8, 8], [10, 5]],
      [[5, 10], [6, 6]],
    ],
    nashEquilibrium: [0, 0],
    actualOutcome: [1, 0],
    lesson: 'OpenAI committed early while Anthropic was conservative. Now Anthropic pays premium for spot capacity. In supply-constrained markets with increasing returns, early commitment dominates.',
  },
  {
    id: 'tsmc',
    title: 'TSMC Allocation Politics',
    description: 'Who gets wafer capacity? First-mover wins.',
    players: ['Nvidia', 'Google/Amazon'],
    strategies: [['Commit NNR Early', 'Wait & See'], ['Commit NNR Early', 'Wait & See']],
    payoffs: [
      [[7, 7], [10, 3]],
      [[3, 10], [5, 5]],
    ],
    nashEquilibrium: [0, 0],
    actualOutcome: [0, 1],
    lesson: 'Nvidia committed massive non-cancelable orders early. Google realized too late — told by TSMC "sold out." Nvidia now controls 70%+ of N3 capacity.',
  },
  {
    id: 'memory',
    title: 'Memory Pricing Oligopoly',
    description: 'SK Hynix, Samsung, Micron: Convert to HBM or maintain commodity DRAM?',
    players: ['SK Hynix', 'Samsung/Micron'],
    strategies: [['Max HBM Convert', 'Maintain DRAM Mix'], ['Max HBM Convert', 'Maintain DRAM Mix']],
    payoffs: [
      [[9, 7], [10, 4]],
      [[4, 10], [6, 6]],
    ],
    nashEquilibrium: [0, 0],
    actualOutcome: [0, 0],
    lesson: 'All three are converting maximum capacity to HBM. Margins: HBM 50-70% vs DRAM 20-30%. Consumer electronics (phones, PCs) suffer from memory reallocation. Prices quadrupled.',
  },
  {
    id: 'asml-monopoly',
    title: 'The ASML Benevolence Paradox',
    description: 'ASML has an absolute monopoly on EUV but hasn\'t raised prices to value. Why?',
    players: ['ASML', 'Customers (TSMC, etc.)'],
    strategies: [['Raise to Value ($1-2B/tool)', 'Keep Current ($400M)'], ['Accept', 'Seek Alternatives']],
    payoffs: [
      [[10, 4], [6, 8]],
      [[8, 7], [7, 7]],
    ],
    nashEquilibrium: [1, 0],
    actualOutcome: [1, 0],
    lesson: 'ASML captures <3% of the value it creates. $400M tool enables $14.3B downstream. "Most generous company in the world." Prediction: prices rise 2028-2030 as demand becomes undeniable.',
  },
];

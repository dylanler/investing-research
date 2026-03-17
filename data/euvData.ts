export interface EUVDataPoint {
  year: number;
  supplyGW: number;
  supplyHighNA: number;
  demandLow: number;
  demandHigh: number;
  toolsPerYear: number;
  cumulativeTools: number;
}

export const euvData: EUVDataPoint[] = [
  { year: 2026, supplyGW: 26, supplyHighNA: 26, demandLow: 20, demandHigh: 30, toolsPerYear: 52, cumulativeTools: 192 },
  { year: 2027, supplyGW: 37, supplyHighNA: 39, demandLow: 40, demandHigh: 60, toolsPerYear: 62, cumulativeTools: 254 },
  { year: 2028, supplyGW: 52, supplyHighNA: 58, demandLow: 60, demandHigh: 100, toolsPerYear: 72, cumulativeTools: 326 },
  { year: 2029, supplyGW: 67, supplyHighNA: 78, demandLow: 80, demandHigh: 140, toolsPerYear: 82, cumulativeTools: 408 },
  { year: 2030, supplyGW: 85, supplyHighNA: 103, demandLow: 100, demandHigh: 200, toolsPerYear: 95, cumulativeTools: 503 },
  { year: 2031, supplyGW: 105, supplyHighNA: 130, demandLow: 130, demandHigh: 260, toolsPerYear: 105, cumulativeTools: 608 },
  { year: 2032, supplyGW: 128, supplyHighNA: 162, demandLow: 160, demandHigh: 320, toolsPerYear: 115, cumulativeTools: 723 },
];

export const transcriptEstimates: EUVDataPoint[] = [
  { year: 2026, supplyGW: 37, supplyHighNA: 37, demandLow: 20, demandHigh: 30, toolsPerYear: 70, cumulativeTools: 320 },
  { year: 2027, supplyGW: 51, supplyHighNA: 51, demandLow: 40, demandHigh: 60, toolsPerYear: 80, cumulativeTools: 400 },
  { year: 2028, supplyGW: 66, supplyHighNA: 70, demandLow: 60, demandHigh: 100, toolsPerYear: 85, cumulativeTools: 485 },
  { year: 2029, supplyGW: 80, supplyHighNA: 88, demandLow: 80, demandHigh: 140, toolsPerYear: 90, cumulativeTools: 575 },
  { year: 2030, supplyGW: 120, supplyHighNA: 140, demandLow: 100, demandHigh: 200, toolsPerYear: 100, cumulativeTools: 700 },
  { year: 2031, supplyGW: 143, supplyHighNA: 170, demandLow: 130, demandHigh: 260, toolsPerYear: 110, cumulativeTools: 810 },
  { year: 2032, supplyGW: 168, supplyHighNA: 205, demandLow: 160, demandHigh: 320, toolsPerYear: 120, cumulativeTools: 930 },
];

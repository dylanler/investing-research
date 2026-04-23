/**
 * EUV Supply/Demand data
 *
 * Sources:
 * - ASML 2025 Annual Report: 48 EUV shipped in 2025
 * - ASML Q1 2026 results / Reuters: 60 low-NA EUV systems in 2026, 80 in 2027
 * - ASML 2022 Investor Day: capacity plan of 90 EUV + 20 High-NA by 2027-2028
 * - Dylan Patel transcript: 3.5 EUV tools per GW heuristic (engineering calc: 2M passes / 591K passes per tool-year ≈ 3.38)
 * - IEA "Energy and AI" (2025): global DC electricity 415 TWh (2024) → 945 TWh (2030) → 1,300 TWh (2035)
 * - GPT-5.4 cross-reference: AI allocation shares of 50%/70%/80% applied to annual EUV output
 */

export interface EUVDataPoint {
  year: number;
  supplyGW_50pct: number;   // AI-GW ceiling at 50% AI allocation
  supplyGW_70pct: number;   // AI-GW ceiling at 70% AI allocation
  supplyGW_80pct: number;   // AI-GW ceiling at 80% AI allocation
  cumulativeGW_70pct: number; // Cumulative mid-case AI GW since 2025
  demandBase_GW: number;    // IEA base case avg GW
  demandLiftoff_GW: number; // IEA lift-off avg GW
  toolsPerYear: number;
}

// Source: GPT-5.4 Scenario_Calcs sheet, cross-referenced with ASML Q1 2026 guidance and IEA data
export const euvScenarioData: EUVDataPoint[] = [
  // 2025: ASML Annual Report actual = 48 tools shipped
  { year: 2025, supplyGW_50pct: 6.9, supplyGW_70pct: 9.6, supplyGW_80pct: 11.0, cumulativeGW_70pct: 9.6, demandBase_GW: 54.3, demandLiftoff_GW: 54.3, toolsPerYear: 48 },
  // 2026: ASML said it can ship 60 low-NA EUV systems this year (25% above 2025)
  { year: 2026, supplyGW_50pct: 8.6, supplyGW_70pct: 12.0, supplyGW_80pct: 13.7, cumulativeGW_70pct: 21.6, demandBase_GW: 62.3, demandLiftoff_GW: 62.3, toolsPerYear: 60 },
  // 2027: ASML said it has capacity to ship 80 low-NA EUV systems
  { year: 2027, supplyGW_50pct: 11.4, supplyGW_70pct: 16.0, supplyGW_80pct: 18.3, cumulativeGW_70pct: 37.6, demandBase_GW: 71.5, demandLiftoff_GW: 71.5, toolsPerYear: 80 },
  // 2028: ASML reaches planned 90-tool capacity (Source: ASML 2022 Investor Day)
  { year: 2028, supplyGW_50pct: 12.9, supplyGW_70pct: 18.0, supplyGW_80pct: 20.6, cumulativeGW_70pct: 55.6, demandBase_GW: 82.0, demandLiftoff_GW: 82.0, toolsPerYear: 90 },
  // 2029: Modest increase + High-NA ramp
  { year: 2029, supplyGW_50pct: 13.6, supplyGW_70pct: 19.0, supplyGW_80pct: 21.7, cumulativeGW_70pct: 74.6, demandBase_GW: 94.1, demandLiftoff_GW: 94.1, toolsPerYear: 95 },
  // 2030: IEA base = 945 TWh = 107.9 avg GW (Source: IEA Energy and AI 2025)
  { year: 2030, supplyGW_50pct: 14.3, supplyGW_70pct: 20.0, supplyGW_80pct: 22.9, cumulativeGW_70pct: 94.6, demandBase_GW: 107.9, demandLiftoff_GW: 107.9, toolsPerYear: 100 },
  // 2031-2035: IEA scenarios diverge
  { year: 2031, supplyGW_50pct: 14.3, supplyGW_70pct: 20.0, supplyGW_80pct: 22.9, cumulativeGW_70pct: 114.6, demandBase_GW: 115.0, demandLiftoff_GW: 121.3, toolsPerYear: 100 },
  { year: 2032, supplyGW_50pct: 15.0, supplyGW_70pct: 21.0, supplyGW_80pct: 24.0, cumulativeGW_70pct: 135.6, demandBase_GW: 122.6, demandLiftoff_GW: 136.4, toolsPerYear: 105 },
  { year: 2033, supplyGW_50pct: 15.0, supplyGW_70pct: 21.0, supplyGW_80pct: 24.0, cumulativeGW_70pct: 156.6, demandBase_GW: 130.6, demandLiftoff_GW: 153.4, toolsPerYear: 105 },
  { year: 2034, supplyGW_50pct: 15.7, supplyGW_70pct: 22.0, supplyGW_80pct: 25.1, cumulativeGW_70pct: 178.6, demandBase_GW: 139.2, demandLiftoff_GW: 172.6, toolsPerYear: 110 },
  // 2035: IEA base = 1,300 TWh = 148.4 avg GW; lift-off = 1,700 TWh = 194.1 avg GW
  { year: 2035, supplyGW_50pct: 15.7, supplyGW_70pct: 22.0, supplyGW_80pct: 25.1, cumulativeGW_70pct: 200.6, demandBase_GW: 148.4, demandLiftoff_GW: 194.1, toolsPerYear: 110 },
  { year: 2036, supplyGW_50pct: 16.4, supplyGW_70pct: 23.0, supplyGW_80pct: 26.3, cumulativeGW_70pct: 223.6, demandBase_GW: 157.3, demandLiftoff_GW: 209.6, toolsPerYear: 115 },
  { year: 2037, supplyGW_50pct: 17.1, supplyGW_70pct: 24.0, supplyGW_80pct: 27.4, cumulativeGW_70pct: 247.6, demandBase_GW: 166.7, demandLiftoff_GW: 226.4, toolsPerYear: 120 },
  { year: 2038, supplyGW_50pct: 17.9, supplyGW_70pct: 25.0, supplyGW_80pct: 28.6, cumulativeGW_70pct: 272.6, demandBase_GW: 176.7, demandLiftoff_GW: 244.5, toolsPerYear: 125 },
  { year: 2039, supplyGW_50pct: 18.6, supplyGW_70pct: 26.0, supplyGW_80pct: 29.7, cumulativeGW_70pct: 298.6, demandBase_GW: 187.4, demandLiftoff_GW: 264.0, toolsPerYear: 130 },
  { year: 2040, supplyGW_50pct: 19.3, supplyGW_70pct: 27.0, supplyGW_80pct: 30.9, cumulativeGW_70pct: 325.6, demandBase_GW: 198.6, demandLiftoff_GW: 285.1, toolsPerYear: 135 },
];

/**
 * Simplified chart data for the EUV gap visualization
 * Uses the 70% AI allocation mid-case for supply
 */
export const euvChartData = euvScenarioData.map(d => ({
  year: d.year,
  'Annual AI-GW Ceiling (70% AI)': d.supplyGW_70pct,
  'Cumulative AI GW (mid-case)': d.cumulativeGW_70pct,
  'Global DC Demand (IEA Base)': d.demandBase_GW,
  'Global DC Demand (IEA Lift-off)': d.demandLiftoff_GW,
  'EUV Tools/Year': d.toolsPerYear,
}));

/**
 * IEA scenario power demand data (TWh)
 * Source: IEA "Energy and AI" report (2025)
 */
export const ieaPowerScenarios = [
  { year: 2024, base: 415, liftoff: 415, highEff: 415, headwinds: 415 },
  { year: 2025, base: 476, liftoff: 476, highEff: 476, headwinds: 476 },
  { year: 2026, base: 546, liftoff: 546, highEff: 546, headwinds: 546 },
  { year: 2027, base: 626, liftoff: 626, highEff: 626, headwinds: 626 },
  { year: 2028, base: 718, liftoff: 718, highEff: 718, headwinds: 718 },
  { year: 2029, base: 824, liftoff: 824, highEff: 824, headwinds: 824 },
  { year: 2030, base: 945, liftoff: 945, highEff: 945, headwinds: 945 },
  { year: 2031, base: 1007, liftoff: 1063, highEff: 950, headwinds: 890 },
  { year: 2032, base: 1074, liftoff: 1195, highEff: 955, headwinds: 838 },
  { year: 2033, base: 1144, liftoff: 1344, highEff: 960, headwinds: 789 },
  { year: 2034, base: 1220, liftoff: 1512, highEff: 965, headwinds: 743 },
  { year: 2035, base: 1300, liftoff: 1700, highEff: 970, headwinds: 700 },
  { year: 2036, base: 1378, liftoff: 1836, highEff: 1009, headwinds: 714 },
  { year: 2037, base: 1461, liftoff: 1983, highEff: 1049, headwinds: 728 },
  { year: 2038, base: 1548, liftoff: 2142, highEff: 1091, headwinds: 743 },
  { year: 2039, base: 1641, liftoff: 2313, highEff: 1135, headwinds: 758 },
  { year: 2040, base: 1740, liftoff: 2498, highEff: 1180, headwinds: 773 },
];

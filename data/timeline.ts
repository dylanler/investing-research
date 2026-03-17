export interface TimelineEntry {
  year: string;
  title: string;
  primaryBottleneck: string;
  secondaryBottleneck: string;
  description: string;
  keyCalc: string;
  secondOrder: string[];
  thirdOrder: string[];
  color: string;
}

export const timelineData: TimelineEntry[] = [
  {
    year: '2026',
    title: 'The HBM Memory Crunch',
    primaryBottleneck: 'HBM Memory Supply',
    secondaryBottleneck: 'Advanced Packaging (CoWoS)',
    description:
      'Samsung begins HBM4 mass production (Feb 2026) at 3.3 TB/s bandwidth, but aggregate supply falls short of hyperscaler demand. TSMC A16 enters volume production 2H 2026. HBM market exceeds $58B as Nvidia, AMD, and custom ASIC programs compete for allocation. TSMC CoWoS capacity remains tight at ~130K wafers/month against 700K+ demand. IEA estimates global DC power at 415 TWh (2024 baseline), already tracking above forecast. (Sources: Samsung Q4-2025 earnings, TSMC Q3-2025 guidance, IEA Electricity 2024 report)',
    keyCalc:
      'HBM demand ~$58B vs supply ~$38B → 34% shortfall. Samsung HBM4 3.3 TB/s but yields <70% initial. TSMC CoWoS: 130K wpm supply vs 700K+ wpm demand.',
    secondOrder: [
      'Consumer electronics squeezed out of HBM and advanced packaging supply',
      'Memory vendor margins explode, driving reinvestment in HBM capacity',
      'Neocloud providers charge 2-3x premium for HBM-rich GPU instances',
    ],
    thirdOrder: [
      'PC and phone prices rise as DRAM diverted to HBM conversion',
      'AI startup consolidation begins — only well-funded labs can secure HBM allocation',
      'Apple becomes a less strategic TSMC customer relative to Nvidia',
    ],
    color: '#f59e0b',
  },
  {
    year: '2027',
    title: 'The Packaging Bottleneck',
    primaryBottleneck: 'Advanced Packaging / CoWoS',
    secondaryBottleneck: 'HBM Memory',
    description:
      'CoWoS and advanced packaging become the binding constraint as chip-on-wafer-on-substrate demand outstrips TSMC, ASE, and Amkor capacity. Micron brings meaningful new HBM packaging capacity online (Micron 2025 Investor Day). ASML capacity plan targets 90 EUV + 20 High-NA tools by 2027-2028 (ASML 2022 Investor Day). TSMC N2 ramping since 2H 2025 but packaging, not logic wafers, gates throughput. Berkeley Lab projects US DCs at 325-580 TWh by 2028, with 2027 tracking toward the upper bound. (Sources: ASML 2022 Investor Day, Micron Capital Markets Day 2025, Berkeley Lab Dec-2024 report)',
    keyCalc:
      'CoWoS demand ~2.5M wafer-equivalents vs supply ~1.6M → 36% gap. ASML: 90 EUV + 20 High-NA planned capacity. Micron new HBM packaging adds ~15% to industry supply.',
    secondOrder: [
      'ASML order backlog extends to 2+ years for both EUV and High-NA',
      'OSAT providers (ASE, Amkor) become strategic chokepoints',
      'TSMC demands multi-year prepayments from all major customers',
    ],
    thirdOrder: [
      'Sovereign AI programs struggle to secure packaged chips at any price',
      'Intel and Samsung foundries absorb overflow demand for less-advanced packaging',
      'AI chip architecture shifts toward chiplet designs to ease packaging pressure',
    ],
    color: '#f97316',
  },
  {
    year: '2028',
    title: 'The Power & Campus Delivery Crisis',
    primaryBottleneck: 'Power Delivery + Campus Construction',
    secondaryBottleneck: 'Data Center Construction',
    description:
      'Power procurement and campus-scale delivery become the primary constraint. FERC reports 2,289 GW in US interconnection queues at end-2024, with average wait times of 5+ years. Berkeley Lab projects US DCs consuming 325-580 TWh by 2028 — the upper scenario implies ~66-80 GW of continuous DC load. GE Vernova holds 83 GW gas power backlog plus slot reservations (end-2025). Hitachi Energy commits $250M transformer investment by 2027 but lead times remain 2-3 years. TSMC Arizona Fab 2 (N3) comes online. Amkor Arizona begins first production. BLS: only 818,700 electricians in US workforce (2024). (Sources: FERC interconnection data 2024, Berkeley Lab Dec-2024, GE Vernova Q4-2025, Hitachi Energy press release, BLS OES 2024, TSMC Arizona updates)',
    keyCalc:
      'FERC queue: 2,289 GW backlogged. Avg interconnection wait: 5+ years. GE Vernova gas backlog: 83 GW. Hitachi transformers: $250M invested but 2-3 yr lead. US electricians: 818,700 (BLS) vs demand for 100K+ additional.',
    secondOrder: [
      'Hyperscalers sign 15-20 year PPAs at escalating $/MWh to lock in generation',
      'Grid congestion forces DC construction into power-abundant but remote regions',
      'Transformer and switchgear shortages cascade across all industrial construction',
    ],
    thirdOrder: [
      'Rural communities near power plants transform economically',
      'Electricity price bifurcation: AI-premium contracts vs regulated consumer rates',
      'Skilled trades labor shortage becomes a national policy issue',
    ],
    color: '#ef4444',
  },
  {
    year: '2029',
    title: 'The Advanced Logic Fab & Yield Wall',
    primaryBottleneck: 'Advanced Logic Fabs / Yield Ramp',
    secondaryBottleneck: 'EUV Lithography Supply',
    description:
      'Fab yield at sub-2nm nodes becomes the binding constraint. TSMC N2 and A16 are in volume but yield ramps slower than historical trends — more EUV layers per wafer, tighter process windows. ASML shipped 48 EUV systems in 2025 and is ramping toward 90+, but incremental tools now serve yield-limited fabs. Intel 18A and Samsung 2nm compete for overflow but face their own yield challenges. EUV begins its ascent as a constraint but is secondary to the fab-level yield problem. (Sources: ASML Annual Report 2025, TSMC Q-series earnings, Intel foundry roadmap updates)',
    keyCalc:
      'ASML: 48 EUV shipped in 2025 → ramping to 90/yr. Sub-2nm yields estimated 55-65% vs historical 80%+ at maturity. Each 10% yield loss = ~15% effective capacity reduction across all advanced fabs.',
    secondOrder: [
      'Nations compete for fab allocation — "compute as the new oil"',
      'US CHIPS Act Phase 2 likely with additional subsidies targeting yield R&D',
      'Nvidia pricing power reaches extreme levels on scarce advanced logic',
    ],
    thirdOrder: [
      'Geopolitical tension over Taiwan increases as concentration risk is quantified',
      '7nm and 5nm "retro" fabs repurposed for AI inference workloads',
      'Intel foundry potentially rescued by sheer demand overflow at trailing-edge advanced nodes',
    ],
    color: '#dc2626',
  },
  {
    year: '2030',
    title: 'The EUV / High-NA Lithography Ceiling',
    primaryBottleneck: 'EUV / High-NA Lithography',
    secondaryBottleneck: 'Fab Capacity (total wafer starts)',
    description:
      'EUV and High-NA tool production becomes the hard ceiling on global compute expansion. ASML targets ~90 EUV + 20 High-NA per year but industry needs 150-200+ to meet demand. Each High-NA tool reduces EUV passes by 30-40%, partially relieving pressure but not closing the gap. IEA projects global DC power at 945 TWh by 2030 (base case). TSMC revenue tracking toward $200B+/year. SIA/BCG: US advanced logic share climbing from 0% toward 28% by 2032. (Sources: ASML 2022 Investor Day capacity plan, IEA World Energy Outlook 2024, SIA/BCG Strengthening the Global Semiconductor Supply Chain report)',
    keyCalc:
      'ASML ceiling: ~90 EUV + 20 High-NA/yr. Industry needs 150-200+. IEA: 945 TWh DC power by 2030 (base). High-NA: 30-40% pass reduction → ~25% effective capacity uplift per tool vs standard EUV.',
    secondOrder: [
      'ASML finally raises prices aggressively — High-NA tools exceed $400M each',
      'High-NA EUV becomes the most valuable machine ever manufactured',
      'TSMC revenue surpasses $200B/year',
    ],
    thirdOrder: [
      'AI-driven GDP growth visible in national statistics (US 4-5%+)',
      'Geopolitical alliances restructure around semiconductor access',
      '"Compute OPEC" discussions among US + allied nations',
    ],
    color: '#a855f7',
  },
  {
    year: '2031-2032',
    title: 'The Geopolitics & Sovereignty Crunch',
    primaryBottleneck: 'Geopolitics / Semiconductor Sovereignty',
    secondaryBottleneck: 'Power Infrastructure',
    description:
      'Geopolitical fragmentation becomes the dominant constraint. SIA/BCG project US advanced logic share reaching 28% by 2032, with >40% of advanced capacity outside Taiwan and Korea for the first time. Export controls, reshoring mandates, and sovereignty requirements fragment the global supply chain. TSMC Arizona, Intel Ohio, Samsung Taylor all operational but below optimal utilization due to workforce and supply chain localization costs. Power infrastructure remains secondary — IEA trajectory toward 1,300 TWh by 2035 requires massive grid buildout now. (Sources: SIA/BCG supply chain report, IEA Electricity 2024, TSMC/Intel/Samsung fab announcements)',
    keyCalc:
      'SIA/BCG: US share 0% → 28% by 2032. >40% outside Taiwan+Korea. Reshoring cost premium: 30-50% vs Taiwan baseline. IEA trajectory: 945 TWh (2030) → 1,300 TWh (2035) requires ~60 GW new generation annually.',
    secondOrder: [
      'Export control regimes tighten, creating parallel compute ecosystems (US-allied vs China-aligned)',
      'Fab subsidies escalate globally — $500B+ cumulative government investment',
      'Semiconductor workforce shortages hit as multiple fabs compete for same talent pools',
    ],
    thirdOrder: [
      'AI capability divergence between blocs becomes measurable',
      'International compute governance frameworks proposed but not yet functional',
      'Supply chain redundancy lowers utilization rates, raising per-chip costs 20-40%',
    ],
    color: '#ec4899',
  },
  {
    year: '2033-2035',
    title: 'The Power & Firm Generation Wall',
    primaryBottleneck: 'Power / Firm Generation Capacity',
    secondaryBottleneck: 'Networking / Interconnect',
    description:
      'Semiconductor manufacturing begins catching up but power generation becomes the hard ceiling. IEA projects 1,300 TWh global DC power by 2035 (base case), requiring hundreds of GW of firm, dispatchable generation. AI consuming 17-30% of US electricity. SMR nuclear reaches meaningful scale (50+ orders). Networking and DC-to-DC interconnect bandwidth emerge as the secondary bottleneck as distributed training across campuses demands ultra-low-latency fabric. (Sources: IEA World Energy Outlook 2024, FERC generation interconnection data, NRC SMR licensing pipeline)',
    keyCalc:
      'IEA: 1,300 TWh DC power by 2035. US share ~500-700 TWh = 12-17% of US generation (~4,100 TWh). Firm generation gap: 80-120 GW needed vs 40-60 GW buildable on current trajectory. Network: 400G → 1.6T per link needed.',
    secondOrder: [
      'Nuclear renaissance in full swing — 50+ SMR orders, first commercial units online',
      'Grid infrastructure becomes a multi-trillion dollar investment category',
      'Optical interconnect and co-packaged optics become critical enabling technology',
    ],
    thirdOrder: [
      'Carbon emissions from AI become a top-tier political and regulatory issue',
      'Electricity prices bifurcate permanently: AI-contract rates vs consumer rates',
      'Data center locations shift to power-abundant regions (hydro, nuclear, geothermal)',
    ],
    color: '#06b6d4',
  },
  {
    year: '2036-2040',
    title: 'The Fragmentation & Power Endgame',
    primaryBottleneck: 'Geopolitics / Supply Chain Fragmentation',
    secondaryBottleneck: 'Power (sustained buildout)',
    description:
      'Geopolitical fragmentation and sustained power buildout define the late-decade constraints. Manufacturing bottlenecks are largely resolved — ASML at 150-200 tools/year, multiple foundries at sub-1nm, 500+ GW of AI compute globally. But fragmented supply chains, export controls, and sovereignty mandates raise effective costs 30-50%. Power remains the persistent secondary constraint as AI load continues scaling. The bottleneck shifts from "can we build it" to "can geopolitics and energy systems keep pace." (Sources: IEA long-range scenarios, ASML capacity roadmap, SIA/BCG geopolitical risk assessments)',
    keyCalc:
      'Global AI compute: 500+ GW. Fragmentation cost premium: 30-50% on chips. Power: 1,500-2,000 TWh DC globally. ASML: 150-200 tools/yr. Effective utilization loss from fragmentation: ~20%.',
    secondOrder: [
      'Parallel semiconductor ecosystems (US-allied, China-led) fully operational',
      'Fusion power begins commercial pilot deployment',
      'Photonic and neuromorphic computing enter production for specialized workloads',
    ],
    thirdOrder: [
      'International compute governance frameworks become functional treaties',
      'Post-scarcity compute economics begin emerging in allied bloc',
      'The binding constraint becomes societal absorption, not technical capacity',
    ],
    color: '#64748b',
  },
];

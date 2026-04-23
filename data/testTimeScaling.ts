// Auto-generated from structured_test_time_scaling_investment_thesis_2026_2036_rlm_addendum.xlsx
// Source: March 27, 2026

export interface Claim { claim: string; verdict: string; why: string; confidence: string; }
export const claims: Claim[] = [
  {
    "claim": "Structured test-time scaling is a more promising frontier than simply lengthening a single chain-of-thought.",
    "verdict": "Supported",
    "why": "Recent agent, recursive, and coding-agent work shows performance gains from organizing inference into multiple contexts and tool-verified loops rather than only extending one monolithic trace.",
    "confidence": "High"
  },
  {
    "claim": "Naive longer-is-better CoT scales poorly and can reduce accuracy.",
    "verdict": "Supported",
    "why": "Long-context and reasoning-structure work finds that more tokens or more review alone do not guarantee better performance; structure matters more than raw length.",
    "confidence": "High"
  },
  {
    "claim": "Topology compression (hierarchy / recursion / sub-agents) is the key reason structured systems avoid linear long-horizon collapse.",
    "verdict": "Conditionally supported",
    "why": "Recursive and orchestration papers support the mechanism qualitatively, but the exact work-span mapping is still an analogy and not a universal empirical theorem across domains.",
    "confidence": "Medium"
  },
  {
    "claim": "Scope isolation lowers error rates by reducing context noise and local task difficulty.",
    "verdict": "Supported",
    "why": "Long-context evidence plus recursive / agent harness guidance strongly supports the idea that curating and resetting context can improve reliability.",
    "confidence": "High"
  },
  {
    "claim": "Verification is the decisive third layer that turns residual errors into bounded tails.",
    "verdict": "Supported in verifier-rich domains",
    "why": "This is strongest in coding, formal math, and other settings where compilers, tests, or strong independent critics exist. It is materially weaker in open-ended real-world reasoning.",
    "confidence": "High"
  },
  {
    "claim": "Dynamic communication routing alone is not equivalent to true span compression.",
    "verdict": "Supported",
    "why": "Papers on dynamic topology show coordination gains, but they do not necessarily prove the same benefits as recursive hierarchical decomposition.",
    "confidence": "Medium"
  },
  {
    "claim": "The unified law reduces effective failure growth from Theta(W) to O(log W).",
    "verdict": "Overstated / not yet established",
    "why": "The article itself describes its equations as simplified approximate scaling laws rather than rigorous tight theorems, and cross-domain empirical validation is still missing.",
    "confidence": "High"
  },
  {
    "claim": "Coding agents are the cleanest real-world proof point for the thesis.",
    "verdict": "Supported",
    "why": "They combine isolation, independent execution environments, and powerful automated verification through tests, type-checkers, and logs.",
    "confidence": "High"
  },
  {
    "claim": "Larger context windows alone will not remove the need for scope isolation.",
    "verdict": "Conditionally supported",
    "why": "Available evidence suggests retrieval/attention quality degrades well before hard context limits, but the extent to which future architectures reduce this problem remains open.",
    "confidence": "Medium"
  },
  {
    "claim": "If AI 2027-style acceleration happens, power, packaging, cooling, and export controls become the real bottlenecks.",
    "verdict": "Supported",
    "why": "IEA, packaging/HBM vendor updates, and export-control developments all point to electricity, grid equipment, advanced packaging, and geopolitics as likely chokepoints.",
    "confidence": "High"
  },
  {
    "claim": "AI 2027 should be read as a forecast of what will happen.",
    "verdict": "Not supported",
    "why": "AI 2027 explicitly presents itself as a scenario exercise informed by tabletop games, useful for strategic planning but not a literal prediction market probability distribution.",
    "confidence": "High"
  },
  {
    "claim": "The article is a finished paper with completed experiments.",
    "verdict": "False",
    "why": "The page states it is a work in progress and may be updated frequently, with experiments still underway.",
    "confidence": "High"
  },
  {
    "claim": "The frontier is shifting from scaffold-only agent systems toward models post-trained to manage recursion and state internally.",
    "verdict": "Supported",
    "why": "RLM introduces the first natively recursive language model, and Pensieve/StateLM trains models to manage pruning, indexing, and note-taking themselves.",
    "confidence": "Medium-High"
  },
  {
    "claim": "Reasoning can improve without additional human labels via self-play, debate, or automated trajectory feedback.",
    "verdict": "Supported",
    "why": "SPIN improves models via self-play on self-generated responses, SPAG improves via adversarial language self-play, and MACA uses RL over multi-agent debate traces.",
    "confidence": "High"
  },
  {
    "claim": "The strongest medium-term moat may be better recursive controllers and verifier-rich synthetic training flywheels, not just prompt-engineered orchestration wrappers.",
    "verdict": "Conditionally supported",
    "why": "AgentArk distills multi-agent dynamics into a single model, MiroThinker-H1 adds local/global verification, and compute-optimal test-time scaling suggests allocation policy itself matters. This points toward learned controllers and training loops as the likely durable edge, but the evidence is still early.",
    "confidence": "Medium"
  }
];

export interface TTSTimelineEntry { year: string; whatChanges: string; indicators: string; risk: string; beneficiaries: string; }
export const ttsTimeline: TTSTimelineEntry[] = [
  {
    "year": "2026",
    "whatChanges": "Structured inference proves itself first in coding, math, and research copilots; the first natively recursive and state-managing post-trained models appear, showing that some scaffold logic can move into the weights.",
    "indicators": "RLM releases, state-aware memory training, verification-heavy research agents, more sub-agent tooling, and model-managed memory in major platforms",
    "risk": "Gains stay narrow; recursive/stateful training proves brittle or too expensive outside verifier-rich domains",
    "beneficiaries": "Evaluation/verification, coding agents, state management, synthetic trajectory tooling, advanced packaging, grid equipment"
  },
  {
    "year": "2027",
    "whatChanges": "Inference-time compute budgets rise, but the best labs increasingly train the controller itself: recursion depth, memory writes, and verification policies become learned rather than manually scripted.",
    "indicators": "More papers on self-play/debate post-training, distillation of agent traces, adaptive compute allocation, model-managed memory, and benchmark wins from native recursive/stateful models",
    "risk": "Off-policy training instability, weak verifiers, or excessive inference cost keep manual orchestration competitive",
    "beneficiaries": "Verification/test infrastructure, synthetic environment generation, telemetry-rich orchestration, state stores, AI-native security"
  },
  {
    "year": "2028",
    "whatChanges": "The bottleneck shifts from model quality alone to infrastructure quality: power, cooling, HBM, advanced packaging, and networking.",
    "indicators": "Data-center power queues lengthen; HBM and packaging lead times remain strategic; liquid-cooling capex accelerates",
    "risk": "Overbuild in some regions or a chip-cycle downturn compresses pricing",
    "beneficiaries": "Power developers, transformers, cooling, optical interconnect, packaging/metrology"
  },
  {
    "year": "2029",
    "whatChanges": "Sovereign and regional AI stacks emerge as export controls, trusted supply chains, and data-locality rules shape deployment.",
    "indicators": "More national AI infrastructure programs, sovereign cloud/compute partnerships, export-control revisions",
    "risk": "Geopolitical de-escalation or technological substitution reduces fragmentation",
    "beneficiaries": "Non-US sovereign-stack partners, European/Japanese/Korean/Taiwanese suppliers, compliance software"
  },
  {
    "year": "2030",
    "whatChanges": "For many enterprise workloads, inference operating cost becomes as strategically important as training cost.",
    "indicators": "Utilities cite data centers as a major demand driver; enterprises optimize for efficient verified agents rather than raw model size",
    "risk": "Cheaper compute or highly efficient architectures blunt the infra bottleneck",
    "beneficiaries": "Efficient inference silicon, power-management, context/agent middleware, enterprise observability"
  },
  {
    "year": "2031",
    "whatChanges": "Winning products behave like 'AI operating systems': orchestration, memory, policy, verification, and tool execution bundled together.",
    "indicators": "Mature agent platforms offer routing, memory, subagents, evaluation, audit trails, and policy controls out-of-the-box",
    "risk": "Platform consolidation squeezes independents; hyperscalers subsume the middleware layer",
    "beneficiaries": "Open but enterprise-ready middleware, trust/security, workflow integration vendors"
  },
  {
    "year": "2032",
    "whatChanges": "High-stakes industries require auditable verification and formal assurance layers before large-scale autonomy is allowed.",
    "indicators": "Procurement standards for traceability, test evidence, model risk management, and human override",
    "risk": "Regulation lags or remains fragmented across jurisdictions",
    "beneficiaries": "Verification, compliance, cyber, model observability, industrial QA"
  },
  {
    "year": "2033",
    "whatChanges": "Physical-world deployment expands: robotics, industrial automation, and edge inference benefit from structured reasoning plus localized verification.",
    "indicators": "More on-device/edge AI accelerators, industrial MLOps, robotics with tighter task-specific feedback loops",
    "risk": "Robotics adoption remains slower than software due to safety and labor/process friction",
    "beneficiaries": "Robotics, edge AI silicon, sensors, industrial AI ops, safety infrastructure"
  },
  {
    "year": "2034",
    "whatChanges": "Model-layer margins compress if open models and commodity orchestration spread; durable rents move down-stack and into regulated trust layers.",
    "indicators": "Open-weight adoption, price competition, enterprise preference for audited integrations over premium raw tokens",
    "risk": "A few frontier labs preserve moat via superior verifier-rich systems or exclusive data/compute",
    "beneficiaries": "Infrastructure, security, compliance, data rights, sovereign/local providers"
  },
  {
    "year": "2035",
    "whatChanges": "AI supply chains regionalize further around allied blocs for chips, energy, data, and security assurance.",
    "indicators": "Regional fabs, packaging sites, power-heavy AI campus deals, industrial policy tied to strategic tech",
    "risk": "Trade normalization or new architectures reduce dependency on current chokepoints",
    "beneficiaries": "Allied non-US suppliers in semis, packaging, grid, and secure infrastructure"
  },
  {
    "year": "2036",
    "whatChanges": "The long-run winners are not just model creators but operators of reliable inference systems: power, packaging, cooling, orchestration, and verification.",
    "indicators": "Enterprise spend concentrates on uptime, auditability, efficiency, and sovereign control rather than raw benchmark wins",
    "risk": "A discontinuous model breakthrough re-centralizes value at the frontier model layer",
    "beneficiaries": "Companies with bottleneck control, verification trust, or sovereign deployment advantages"
  }
];

export interface StrategicGame { actors: string; archetype: string; conflict: string; equilibrium: string; breaks: string; assetImplication: string; }
export const strategicGames: StrategicGame[] = [
  {
    "actors": "US vs China",
    "archetype": "Repeated prisoner's dilemma / arms race",
    "conflict": "Each side wants leadership in chips, compute, and frontier models while fearing relative loss from restraint.",
    "equilibrium": "Persistent competition with episodic cooperation on safety or standards; tighter export controls and espionage risk remain central.",
    "breaks": "Severe crisis over Taiwan, major security incident, or verified mutual restraint framework.",
    "assetImplication": "Favor allied supply chains, sovereign-stack enablers, cybersecurity, non-US suppliers inside trusted blocs."
  },
  {
    "actors": "Frontier lab vs frontier lab",
    "archetype": "All-pay race / Red Queen competition",
    "conflict": "Being second can be economically or strategically costly, so labs overspend on compute, talent, and data-center access.",
    "equilibrium": "Capex race with compressed product cycles and strong demand for bottleneck suppliers.",
    "breaks": "Profit discipline, regulation, or a sudden open-model shock that commoditizes model output.",
    "assetImplication": "Suppliers of compute, packaging, power, cooling, and model-evaluation tooling benefit more durably than app-layer copycats."
  },
  {
    "actors": "Labs vs regulators",
    "archetype": "Chicken / hold-up",
    "conflict": "Labs push speed; regulators threaten delay or restrictions after incidents.",
    "equilibrium": "Regulation focuses first on deployment assurance, auditability, and sector-specific controls rather than blanket model caps.",
    "breaks": "Large public failure event, bio/cyber misuse case, or credible international regime.",
    "assetImplication": "Verification, compliance, audit, safety, and secure deployment infrastructure gain."
  },
  {
    "actors": "Hyperscalers vs utilities / grids",
    "archetype": "Bilateral coordination / hold-up",
    "conflict": "Cloud builders need power quickly; utilities need time, permits, transformers, and rate recovery.",
    "equilibrium": "Long queues, negotiated PPAs, and local political bargaining around grid upgrades.",
    "breaks": "Faster permitting, distributed generation, or more efficient hardware reduces peak demand growth.",
    "assetImplication": "Grid equipment, transformers, independent power, and cooling efficiency plays matter."
  },
  {
    "actors": "Chipmakers vs hyperscalers",
    "archetype": "Capacity auction / supplier power",
    "conflict": "Scarce HBM, advanced packaging, and leading-edge wafer capacity give suppliers temporary pricing power.",
    "equilibrium": "Seller's market for scarce components until capacity catches up.",
    "breaks": "Overcapacity, architectural substitution, or weak end-demand.",
    "assetImplication": "Smaller metrology, packaging, photomask, test, and specialty-material vendors can capture outsized upside."
  },
  {
    "actors": "Closed-model platforms vs open ecosystems",
    "archetype": "Public-goods / standards battle",
    "conflict": "Closed platforms monetize reliability and integrated tooling; open ecosystems drive diffusion and price pressure.",
    "equilibrium": "Hybrid equilibrium: closed stacks dominate regulated/high-assurance workloads, open stacks commoditize lower-end usage.",
    "breaks": "A major open-source quality leap or, conversely, security/legal barriers to open deployment.",
    "assetImplication": "Own both sides: infra and trust layer for open diffusion; premium verifier-rich platforms for closed stacks."
  },
  {
    "actors": "Enterprises vs AI vendors",
    "archetype": "Real-options adoption game",
    "conflict": "Buyers delay large commitments until reliability, governance, and ROI are visible.",
    "equilibrium": "Spend concentrates where verification is easiest: coding, analytics, compliance, security, internal search.",
    "breaks": "Low-cost reliable agent bundles remove option value of waiting.",
    "assetImplication": "Vendors selling measurable ROI, observability, and audit trails win first."
  },
  {
    "actors": "Data-center developers vs local communities",
    "archetype": "War of attrition / permitting game",
    "conflict": "Developers want scale and speed; communities worry about power, water, land, and rates.",
    "equilibrium": "Projects move toward power-friendly jurisdictions with supportive industrial policy.",
    "breaks": "Clear local revenue-sharing or abundant clean power reduces opposition.",
    "assetImplication": "Favor geographies and operators with superior siting, cooling efficiency, and policy relationships."
  },
  {
    "actors": "Generator model vs verifier / critic",
    "archetype": "Principal-agent / internal governance game",
    "conflict": "The system wants speed and creativity from generators but must constrain silent error propagation.",
    "equilibrium": "High-value workflows shift toward explicit verification, sandboxes, tests, and independent critics.",
    "breaks": "If verification cost remains too high or critics share the same blind spots, gains stall.",
    "assetImplication": "Back verification, evaluation, and observability vendors; discount purely brute-force prompt wrappers."
  },
  {
    "actors": "Allies vs US export-control regime",
    "archetype": "Coordination game",
    "conflict": "Allies want access to US tech but also local industrial upside and strategic autonomy.",
    "equilibrium": "Trusted-bloc supply chains deepen, but each region also subsidizes local capacity.",
    "breaks": "Policy fragmentation or aggressive extraterritorial controls provoke balancing behavior.",
    "assetImplication": "Non-US companies inside trusted ecosystems can rerate as sovereign alternatives."
  },
  {
    "actors": "Attackers vs defenders in AI-native software",
    "archetype": "Offense-defense race",
    "conflict": "Autonomous tooling raises both attack surface and defensive automation potential.",
    "equilibrium": "Security, model governance, and runtime verification become mandatory spend rather than optional add-ons.",
    "breaks": "If agent adoption underwhelms, some security spend is deferred.",
    "assetImplication": "Security, cyber-intel, compliance, and trusted execution vendors benefit."
  },
  {
    "actors": "Capital markets vs AI infrastructure builders",
    "archetype": "Cobweb / boom-bust cycle",
    "conflict": "Cheap capital chases AI capacity; project returns depend on utilization and power access.",
    "equilibrium": "Boom in 2026-2030 followed by winners/losers based on utilization, power contracts, and differentiation.",
    "breaks": "Severe demand disappointment or cheaper inference architectures create oversupply.",
    "assetImplication": "Prefer bottleneck suppliers and efficient operators over undifferentiated capacity builders."
  }
];

export interface GeoScenario { scenario: string; description: string; consequence: string; beneficiaries: string; indicators: string; likelihood: string; }
export const geoScenarios: GeoScenario[] = [
  {
    "scenario": "Managed race, ample power",
    "description": "US-China competition stays intense but below crisis level; utilities and independent power keep up enough to avoid severe rationing.",
    "consequence": "Strong capex, steady but not panicked supplier pricing, enterprise adoption broadens.",
    "beneficiaries": "Efficient inference silicon, packaging, mid-cap power developers, orchestration middleware",
    "indicators": "AI 2027 style race without acute infrastructure failure",
    "likelihood": "Medium"
  },
  {
    "scenario": "Managed race, power bottleneck",
    "description": "Demand for AI campuses outruns grid upgrades, transformers, and cooling capacity.",
    "consequence": "Value accrues to power access, cooling, transformers, and energy-efficient compute; some app/software stories de-rate.",
    "beneficiaries": "Transformers, grid equipment, liquid cooling, efficient silicon, local power producers",
    "indicators": "Interconnection queues, power-price spikes, repeated project delays",
    "likelihood": "High"
  },
  {
    "scenario": "Export-control ratchet",
    "description": "Semiconductor and model-stack controls tighten further; trusted-bloc procurement becomes strategic.",
    "consequence": "Non-US allied suppliers with hard-to-replace capabilities gain strategic pricing power.",
    "beneficiaries": "Taiwanese, Japanese, European, Israeli, Korean suppliers inside friendly blocs; sovereign-stack software",
    "indicators": "New BIS actions, tougher licensing, localization subsidies",
    "likelihood": "High"
  },
  {
    "scenario": "Packaging / HBM squeeze",
    "description": "Compute exists on paper but advanced packaging and HBM remain the scarce layer.",
    "consequence": "Upstream materials, photomasks, testing, metrology, and packaging-equipment names outperform.",
    "beneficiaries": "Photomask, packaging equipment, test, specialty wafer/material vendors",
    "indicators": "Persistent CoWoS/HBM tightness, long lead times, premium pricing",
    "likelihood": "High"
  },
  {
    "scenario": "Cooling becomes the gating factor",
    "description": "Thermal density rises faster than conventional air-cooling can handle.",
    "consequence": "Chip-level and datacenter-level cooling vendors become strategic acquisition targets or partner channels.",
    "beneficiaries": "Liquid cooling, immersion cooling, thermal interface materials, design-build datacenter specialists",
    "indicators": "Server-rack density rises sharply, more liquid-cooled reference designs, major customer wins",
    "likelihood": "Medium-High"
  },
  {
    "scenario": "Verification-first enterprise adoption",
    "description": "Enterprises adopt AI fastest where outputs are testable, auditable, and attributable.",
    "consequence": "Coding, compliance, security, internal search, and industrial QA compound faster than open-ended agent use cases.",
    "beneficiaries": "Evaluation, observability, compliance, secure agent deployment, coding agents",
    "indicators": "Procurement standards for audit trails, test evidence, and model-risk controls",
    "likelihood": "High"
  },
  {
    "scenario": "Open-model diffusion / model margin compression",
    "description": "Model quality diffuses broadly and pricing compresses at the raw model layer.",
    "consequence": "Value migrates to power, data rights, distribution, workflow integration, verification, and sovereign packaging.",
    "beneficiaries": "Infra, trust layer, workflow integration, local operators",
    "indicators": "Faster open-model releases, falling inference prices, enterprise multi-model routing",
    "likelihood": "Medium"
  },
  {
    "scenario": "Sovereign stack build-out",
    "description": "Europe, Middle East, India, and parts of Asia accelerate local compute, cloud, and data-governance ecosystems.",
    "consequence": "Non-US regional champions re-rate despite smaller scale.",
    "beneficiaries": "Sovereign cloud/compute, regional chips/packaging, compliance and data-locality vendors",
    "indicators": "Subsidies, public-private AI campus deals, procurement localization",
    "likelihood": "Medium-High"
  },
  {
    "scenario": "Security incident / trust shock",
    "description": "A major cyber, model poisoning, or agent misuse event drives a trust reset.",
    "consequence": "Budget rotates from experimentation to security, monitoring, verification, and human oversight.",
    "beneficiaries": "AI security, model governance, cyber intel, runtime monitoring",
    "indicators": "High-profile agent failure, breach, or regulatory enforcement wave",
    "likelihood": "Medium"
  },
  {
    "scenario": "Overbuild / utilization bust",
    "description": "Capital floods into capacity before steady demand materializes, hurting undifferentiated operators.",
    "consequence": "Best-positioned suppliers still do fine, while generic capacity builders and thin-moat wrappers suffer.",
    "beneficiaries": "Efficient niche suppliers, low-cost power operators, verification vendors",
    "indicators": "Falling cloud GPU utilization, price cuts, project cancellations",
    "likelihood": "Medium"
  }
];

export interface ScenarioCell { id: string; geopolitics: string; resource: string; architecture: string; market: string; summary: string; winningBuckets: string; stance: string; likelihood: string; }
export const scenarioLattice: ScenarioCell[] = [
  {
    "id": "S01",
    "geopolitics": "Coordinated competition",
    "resource": "Resource slack",
    "architecture": "Structured + verified",
    "market": "Concentrated / closed",
    "summary": "Lowest systemic stress. Cross-border ecosystems remain investable, especially high-quality non-US suppliers. Verification, observability, and orchestration capture more value than raw prompt wrappers. More value shifts to software ROI and workflow ad",
    "winningBuckets": "Agent middleware, verification, workflow software, selected semis, security",
    "stance": "Lean toward software infrastructure, observability, and enterprise automation.",
    "likelihood": "Medium-High"
  },
  {
    "id": "S02",
    "geopolitics": "Coordinated competition",
    "resource": "Resource slack",
    "architecture": "Structured + verified",
    "market": "Diffuse / open",
    "summary": "Lowest systemic stress. Cross-border ecosystems remain investable, especially high-quality non-US suppliers. Verification, observability, and orchestration capture more value than raw prompt wrappers. More value shifts to software ROI and workflow ad",
    "winningBuckets": "Agent middleware, verification, workflow software, selected semis, security",
    "stance": "Lean toward software infrastructure, observability, and enterprise automation.",
    "likelihood": "Medium-High"
  },
  {
    "id": "S03",
    "geopolitics": "Coordinated competition",
    "resource": "Resource slack",
    "architecture": "Brute-force / monolithic",
    "market": "Concentrated / closed",
    "summary": "Lowest systemic stress. Cross-border ecosystems remain investable, especially high-quality non-US suppliers. Raw model spend stays high, but silent-error risk and cost blowouts remain a drag. More value shifts to software ROI and workflow adoption be",
    "winningBuckets": "Agent middleware, verification, workflow software, selected semis, security",
    "stance": "Favor differentiated platforms and cost leaders; avoid me-too wrappers.",
    "likelihood": "Medium"
  },
  {
    "id": "S04",
    "geopolitics": "Coordinated competition",
    "resource": "Resource slack",
    "architecture": "Brute-force / monolithic",
    "market": "Diffuse / open",
    "summary": "Lowest systemic stress. Cross-border ecosystems remain investable, especially high-quality non-US suppliers. Raw model spend stays high, but silent-error risk and cost blowouts remain a drag. More value shifts to software ROI and workflow adoption be",
    "winningBuckets": "Agent middleware, verification, workflow software, selected semis, security",
    "stance": "Favor differentiated platforms and cost leaders; avoid me-too wrappers.",
    "likelihood": "Medium-High"
  },
  {
    "id": "S05",
    "geopolitics": "Coordinated competition",
    "resource": "Resource bottleneck",
    "architecture": "Structured + verified",
    "market": "Concentrated / closed",
    "summary": "Intermediate stress. Cross-border ecosystems remain investable, especially high-quality non-US suppliers. Verification, observability, and orchestration capture more value than raw prompt wrappers. Power, cooling, transformers, HBM, and packaging com",
    "winningBuckets": "Power, cooling, packaging, grid equipment, efficient silicon, security",
    "stance": "Best barbell: bottleneck hardware + verification/trust software.",
    "likelihood": "Medium"
  },
  {
    "id": "S06",
    "geopolitics": "Coordinated competition",
    "resource": "Resource bottleneck",
    "architecture": "Structured + verified",
    "market": "Diffuse / open",
    "summary": "Intermediate stress. Cross-border ecosystems remain investable, especially high-quality non-US suppliers. Verification, observability, and orchestration capture more value than raw prompt wrappers. Power, cooling, transformers, HBM, and packaging com",
    "winningBuckets": "Power, cooling, packaging, grid equipment, efficient silicon, security",
    "stance": "Best barbell: bottleneck hardware + verification/trust software.",
    "likelihood": "Medium-High"
  },
  {
    "id": "S07",
    "geopolitics": "Coordinated competition",
    "resource": "Resource bottleneck",
    "architecture": "Brute-force / monolithic",
    "market": "Concentrated / closed",
    "summary": "Intermediate stress. Cross-border ecosystems remain investable, especially high-quality non-US suppliers. Raw model spend stays high, but silent-error risk and cost blowouts remain a drag. Power, cooling, transformers, HBM, and packaging command prem",
    "winningBuckets": "Power, cooling, packaging, grid equipment, efficient silicon, security",
    "stance": "Favor hard bottlenecks over app-layer exposure.",
    "likelihood": "Medium"
  },
  {
    "id": "S08",
    "geopolitics": "Coordinated competition",
    "resource": "Resource bottleneck",
    "architecture": "Brute-force / monolithic",
    "market": "Diffuse / open",
    "summary": "Intermediate stress. Cross-border ecosystems remain investable, especially high-quality non-US suppliers. Raw model spend stays high, but silent-error risk and cost blowouts remain a drag. Power, cooling, transformers, HBM, and packaging command prem",
    "winningBuckets": "Power, cooling, packaging, grid equipment, efficient silicon, security",
    "stance": "Favor hard bottlenecks over app-layer exposure.",
    "likelihood": "Medium"
  },
  {
    "id": "S09",
    "geopolitics": "Hard race",
    "resource": "Resource slack",
    "architecture": "Structured + verified",
    "market": "Concentrated / closed",
    "summary": "Intermediate stress. Export controls, sovereign procurement, and trusted-bloc supply chains matter more. Verification, observability, and orchestration capture more value than raw prompt wrappers. More value shifts to software ROI and workflow adopti",
    "winningBuckets": "Agent middleware, verification, workflow software, selected semis, security",
    "stance": "Lean toward software infrastructure, observability, and enterprise automation.",
    "likelihood": "Medium"
  },
  {
    "id": "S10",
    "geopolitics": "Hard race",
    "resource": "Resource slack",
    "architecture": "Structured + verified",
    "market": "Diffuse / open",
    "summary": "Intermediate stress. Export controls, sovereign procurement, and trusted-bloc supply chains matter more. Verification, observability, and orchestration capture more value than raw prompt wrappers. More value shifts to software ROI and workflow adopti",
    "winningBuckets": "Agent middleware, verification, workflow software, selected semis, security",
    "stance": "Lean toward software infrastructure, observability, and enterprise automation.",
    "likelihood": "Medium-High"
  },
  {
    "id": "S11",
    "geopolitics": "Hard race",
    "resource": "Resource slack",
    "architecture": "Brute-force / monolithic",
    "market": "Concentrated / closed",
    "summary": "Intermediate stress. Export controls, sovereign procurement, and trusted-bloc supply chains matter more. Raw model spend stays high, but silent-error risk and cost blowouts remain a drag. More value shifts to software ROI and workflow adoption becaus",
    "winningBuckets": "Agent middleware, verification, workflow software, selected semis, security",
    "stance": "Favor differentiated platforms and cost leaders; avoid me-too wrappers.",
    "likelihood": "Medium"
  },
  {
    "id": "S12",
    "geopolitics": "Hard race",
    "resource": "Resource slack",
    "architecture": "Brute-force / monolithic",
    "market": "Diffuse / open",
    "summary": "Intermediate stress. Export controls, sovereign procurement, and trusted-bloc supply chains matter more. Raw model spend stays high, but silent-error risk and cost blowouts remain a drag. More value shifts to software ROI and workflow adoption becaus",
    "winningBuckets": "Agent middleware, verification, workflow software, selected semis, security",
    "stance": "Favor differentiated platforms and cost leaders; avoid me-too wrappers.",
    "likelihood": "Medium"
  },
  {
    "id": "S13",
    "geopolitics": "Hard race",
    "resource": "Resource bottleneck",
    "architecture": "Structured + verified",
    "market": "Concentrated / closed",
    "summary": "Highest tail risk. Export controls, sovereign procurement, and trusted-bloc supply chains matter more. Verification, observability, and orchestration capture more value than raw prompt wrappers. Power, cooling, transformers, HBM, and packaging comman",
    "winningBuckets": "Power, cooling, packaging, grid equipment, efficient silicon, security",
    "stance": "Best barbell: bottleneck hardware + verification/trust software.",
    "likelihood": "Medium"
  },
  {
    "id": "S14",
    "geopolitics": "Hard race",
    "resource": "Resource bottleneck",
    "architecture": "Structured + verified",
    "market": "Diffuse / open",
    "summary": "Highest tail risk. Export controls, sovereign procurement, and trusted-bloc supply chains matter more. Verification, observability, and orchestration capture more value than raw prompt wrappers. Power, cooling, transformers, HBM, and packaging comman",
    "winningBuckets": "Power, cooling, packaging, grid equipment, efficient silicon, security",
    "stance": "Best barbell: bottleneck hardware + verification/trust software.",
    "likelihood": "Medium"
  },
  {
    "id": "S15",
    "geopolitics": "Hard race",
    "resource": "Resource bottleneck",
    "architecture": "Brute-force / monolithic",
    "market": "Concentrated / closed",
    "summary": "Highest tail risk. Export controls, sovereign procurement, and trusted-bloc supply chains matter more. Raw model spend stays high, but silent-error risk and cost blowouts remain a drag. Power, cooling, transformers, HBM, and packaging command premium",
    "winningBuckets": "Power, cooling, packaging, grid equipment, efficient silicon, security",
    "stance": "Favor hard bottlenecks over app-layer exposure.",
    "likelihood": "Low-Medium"
  },
  {
    "id": "S16",
    "geopolitics": "Hard race",
    "resource": "Resource bottleneck",
    "architecture": "Brute-force / monolithic",
    "market": "Diffuse / open",
    "summary": "Highest tail risk. Export controls, sovereign procurement, and trusted-bloc supply chains matter more. Raw model spend stays high, but silent-error risk and cost blowouts remain a drag. Power, cooling, transformers, HBM, and packaging command premium",
    "winningBuckets": "Power, cooling, packaging, grid equipment, efficient silicon, security",
    "stance": "Favor hard bottlenecks over app-layer exposure.",
    "likelihood": "Medium"
  }
];

export interface PublicName { rank: number; company: string; ticker: string; country: string; usNonUs: string; bucket: string; marketCapUsd: number; whyFits: string; keyRisk: string; }
export const publicWatchlist: PublicName[] = [
  {
    "rank": 1,
    "company": "Siltronic",
    "ticker": "WAF.F",
    "country": "Germany",
    "usNonUs": "Non-US",
    "bucket": "semiconductors",
    "marketCapUsd": 1986159207,
    "whyFits": "Wafer substrate supply; upstream semiconductor bottleneck",
    "keyRisk": "Capex cyclicality, customer concentration, and execution on node/package transitions"
  },
  {
    "rank": 2,
    "company": "Formosa Sumco Technology",
    "ticker": "3532.TW",
    "country": "Taiwan",
    "usNonUs": "Non-US",
    "bucket": "semiconductors",
    "marketCapUsd": 1771661614,
    "whyFits": "Silicon wafer supply for AI-related semiconductor capacity",
    "keyRisk": "Capex cyclicality, customer concentration, and execution on node/package transitions"
  },
  {
    "rank": 3,
    "company": "Tekscend Photomask",
    "ticker": "429A.T",
    "country": "Japan",
    "usNonUs": "Non-US",
    "bucket": "semiconductors",
    "marketCapUsd": 1748743577,
    "whyFits": "Photomask/reticle infrastructure for advanced chip production",
    "keyRisk": "Capex cyclicality, customer concentration, and execution on node/package transitions"
  },
  {
    "rank": 4,
    "company": "Himax Technologies",
    "ticker": "HIMX",
    "country": "Taiwan",
    "usNonUs": "Non-US",
    "bucket": "semiconductors",
    "marketCapUsd": 1460526976,
    "whyFits": "Edge AI vision/display chips and interface silicon",
    "keyRisk": "Capex cyclicality, customer concentration, and execution on node/package transitions"
  },
  {
    "rank": 5,
    "company": "Cohu",
    "ticker": "COHU",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "semiconductors",
    "marketCapUsd": 2094777880,
    "whyFits": "Test and inspection gear; verification layer for chip manufacturing",
    "keyRisk": "Capex cyclicality, customer concentration, and execution on node/package transitions"
  },
  {
    "rank": 6,
    "company": "PDF Solutions",
    "ticker": "PDFS",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "semiconductors",
    "marketCapUsd": 1734519820,
    "whyFits": "Yield analytics / process data software for fabs",
    "keyRisk": "Capex cyclicality, customer concentration, and execution on node/package transitions"
  },
  {
    "rank": 7,
    "company": "SkyWater Technology",
    "ticker": "SKYT",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "semiconductors",
    "marketCapUsd": 1672323300,
    "whyFits": "US specialty foundry leverage in sovereign AI supply chains",
    "keyRisk": "Capex cyclicality, customer concentration, and execution on node/package transitions"
  },
  {
    "rank": 8,
    "company": "ChipMOS Technologies",
    "ticker": "IMOS",
    "country": "Taiwan",
    "usNonUs": "Non-US",
    "bucket": "semiconductors",
    "marketCapUsd": 1265759232,
    "whyFits": "Backend packaging and test exposure",
    "keyRisk": "Capex cyclicality, customer concentration, and execution on node/package transitions"
  },
  {
    "rank": 9,
    "company": "SÜSS MicroTec",
    "ticker": "SMHN.DE",
    "country": "Germany",
    "usNonUs": "Non-US",
    "bucket": "semiconductors",
    "marketCapUsd": 1250116674,
    "whyFits": "Advanced packaging and lithography process tools",
    "keyRisk": "Capex cyclicality, customer concentration, and execution on node/package transitions"
  },
  {
    "rank": 10,
    "company": "TOWA Corporation",
    "ticker": "6315.T",
    "country": "Japan",
    "usNonUs": "Non-US",
    "bucket": "semiconductors",
    "marketCapUsd": 1136845375,
    "whyFits": "Packaging/molding equipment for semiconductor backend",
    "keyRisk": "Capex cyclicality, customer concentration, and execution on node/package transitions"
  },
  {
    "rank": 11,
    "company": "Aehr Test Systems",
    "ticker": "AEHR",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "semiconductors",
    "marketCapUsd": 2988465200,
    "whyFits": "Burn-in / reliability testing for power and AI-adjacent chips",
    "keyRisk": "Capex cyclicality, customer concentration, and execution on node/package transitions"
  },
  {
    "rank": 12,
    "company": "POET Technologies",
    "ticker": "POET",
    "country": "Canada",
    "usNonUs": "Non-US",
    "bucket": "semiconductors",
    "marketCapUsd": 838384384,
    "whyFits": "Optical interposer/packaging for AI networking bottlenecks",
    "keyRisk": "Capex cyclicality, customer concentration, and execution on node/package transitions"
  },
  {
    "rank": 13,
    "company": "Arteris",
    "ticker": "AIP",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "semiconductors",
    "marketCapUsd": 1037385182,
    "whyFits": "On-chip interconnect IP; complexity scaling inside AI silicon",
    "keyRisk": "Capex cyclicality, customer concentration, and execution on node/package transitions"
  },
  {
    "rank": 14,
    "company": "Wolfspeed",
    "ticker": "WOLF",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "semiconductors",
    "marketCapUsd": 723081750,
    "whyFits": "Power semiconductors for AI power-density growth; very high risk",
    "keyRisk": "Capex cyclicality, customer concentration, and execution on node/package transitions"
  },
  {
    "rank": 15,
    "company": "X-FAB",
    "ticker": "XFAB.PA",
    "country": "Belgium",
    "usNonUs": "Non-US",
    "bucket": "semiconductors",
    "marketCapUsd": 730453938,
    "whyFits": "Specialty foundry for mixed-signal/industrial/auto compute edge",
    "keyRisk": "Capex cyclicality, customer concentration, and execution on node/package transitions"
  },
  {
    "rank": 16,
    "company": "Alpha & Omega Semiconductor",
    "ticker": "AOSL",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "semiconductors",
    "marketCapUsd": 1212914880,
    "whyFits": "Power semiconductors and power management",
    "keyRisk": "Capex cyclicality, customer concentration, and execution on node/package transitions"
  },
  {
    "rank": 17,
    "company": "IQE plc",
    "ticker": "IQE.L",
    "country": "United Kingdom",
    "usNonUs": "Non-US",
    "bucket": "semiconductors",
    "marketCapUsd": 347038722,
    "whyFits": "Epitaxy materials stack; upstream bottleneck exposure",
    "keyRisk": "Capex cyclicality, customer concentration, and execution on node/package transitions"
  },
  {
    "rank": 18,
    "company": "Valens Semiconductor",
    "ticker": "VLN",
    "country": "Israel",
    "usNonUs": "Non-US",
    "bucket": "semiconductors",
    "marketCapUsd": 128457104,
    "whyFits": "High-speed connectivity silicon",
    "keyRisk": "Capex cyclicality, customer concentration, and execution on node/package transitions"
  },
  {
    "rank": 19,
    "company": "Kalray",
    "ticker": "ALKAL.PA",
    "country": "France",
    "usNonUs": "Non-US",
    "bucket": "semiconductors",
    "marketCapUsd": 66126059,
    "whyFits": "Data-processing / DPU-style optionality",
    "keyRisk": "Capex cyclicality, customer concentration, and execution on node/package transitions"
  },
  {
    "rank": 20,
    "company": "u-blox",
    "ticker": "UBXN.SW",
    "country": "Switzerland",
    "usNonUs": "Non-US",
    "bucket": "semiconductors",
    "marketCapUsd": 1311010728,
    "whyFits": "Positioning and wireless modules for edge/robotic deployment",
    "keyRisk": "Capex cyclicality, customer concentration, and execution on node/package transitions"
  },
  {
    "rank": 21,
    "company": "Sterlite Technologies",
    "ticker": "STLTECH.NS",
    "country": "India",
    "usNonUs": "Non-US",
    "bucket": "networking",
    "marketCapUsd": 997930177,
    "whyFits": "Fiber and optical transport for AI data movement",
    "keyRisk": "Telecom / enterprise spending cycles and intense pricing competition"
  },
  {
    "rank": 22,
    "company": "Tejas Networks",
    "ticker": "TEJASNET.NS",
    "country": "India",
    "usNonUs": "Non-US",
    "bucket": "networking",
    "marketCapUsd": 797646451,
    "whyFits": "Telecom/networking equipment in sovereign build-outs",
    "keyRisk": "Telecom / enterprise spending cycles and intense pricing competition"
  },
  {
    "rank": 23,
    "company": "Aviat Networks",
    "ticker": "AVNW",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "networking",
    "marketCapUsd": 293782950,
    "whyFits": "Microwave backhaul / resilient enterprise network links",
    "keyRisk": "Telecom / enterprise spending cycles and intense pricing competition"
  },
  {
    "rank": 24,
    "company": "Ceragon Networks",
    "ticker": "CRNT",
    "country": "Israel",
    "usNonUs": "Non-US",
    "bucket": "networking",
    "marketCapUsd": 199555728,
    "whyFits": "Wireless backhaul and network densification",
    "keyRisk": "Telecom / enterprise spending cycles and intense pricing competition"
  },
  {
    "rank": 25,
    "company": "Ekinops",
    "ticker": "EKI.PA",
    "country": "France",
    "usNonUs": "Non-US",
    "bucket": "networking",
    "marketCapUsd": 53173916,
    "whyFits": "Optical transport/access infrastructure",
    "keyRisk": "Telecom / enterprise spending cycles and intense pricing competition"
  },
  {
    "rank": 26,
    "company": "LumenRadio",
    "ticker": "LUMEN.ST",
    "country": "Sweden",
    "usNonUs": "Non-US",
    "bucket": "networking",
    "marketCapUsd": 77826590,
    "whyFits": "Industrial wireless connectivity / edge control",
    "keyRisk": "Telecom / enterprise spending cycles and intense pricing competition"
  },
  {
    "rank": 27,
    "company": "A10 Networks",
    "ticker": "ATEN",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "it_security",
    "marketCapUsd": 2058686805,
    "whyFits": "Network security and application delivery for AI-heavy traffic",
    "keyRisk": "Crowded market, platform bundling, and elongated enterprise sales cycles"
  },
  {
    "rank": 28,
    "company": "secunet",
    "ticker": "YSN.F",
    "country": "Germany",
    "usNonUs": "Non-US",
    "bucket": "it_security",
    "marketCapUsd": 1341509119,
    "whyFits": "Sovereign cybersecurity / regulated deployment",
    "keyRisk": "Crowded market, platform bundling, and elongated enterprise sales cycles"
  },
  {
    "rank": 29,
    "company": "NCC Group plc",
    "ticker": "NCC.L",
    "country": "United Kingdom",
    "usNonUs": "Non-US",
    "bucket": "it_security",
    "marketCapUsd": 434137608,
    "whyFits": "Cyber assurance and security testing",
    "keyRisk": "Crowded market, platform bundling, and elongated enterprise sales cycles"
  },
  {
    "rank": 30,
    "company": "WithSecure Oyj",
    "ticker": "WITH.HE",
    "country": "Finland",
    "usNonUs": "Non-US",
    "bucket": "it_security",
    "marketCapUsd": 348449446,
    "whyFits": "Managed detection / enterprise cyber resilience",
    "keyRisk": "Crowded market, platform bundling, and elongated enterprise sales cycles"
  },
  {
    "rank": 31,
    "company": "F-Secure",
    "ticker": "FSECURE.HE",
    "country": "Finland",
    "usNonUs": "Non-US",
    "bucket": "it_security",
    "marketCapUsd": 334502576,
    "whyFits": "Endpoint and consumer/business security",
    "keyRisk": "Crowded market, platform bundling, and elongated enterprise sales cycles"
  },
  {
    "rank": 32,
    "company": "Yubico",
    "ticker": "YUBICO.ST",
    "country": "Sweden",
    "usNonUs": "Non-US",
    "bucket": "it_security",
    "marketCapUsd": 281764685,
    "whyFits": "Identity/authentication for agentic workflows",
    "keyRisk": "Crowded market, platform bundling, and elongated enterprise sales cycles"
  },
  {
    "rank": 33,
    "company": "Allot",
    "ticker": "ALLT",
    "country": "Israel",
    "usNonUs": "Non-US",
    "bucket": "it_security",
    "marketCapUsd": 317187808,
    "whyFits": "Network intelligence / traffic control",
    "keyRisk": "Crowded market, platform bundling, and elongated enterprise sales cycles"
  },
  {
    "rank": 34,
    "company": "Kraken Robotics",
    "ticker": "PNG.V",
    "country": "Canada",
    "usNonUs": "Non-US",
    "bucket": "robotics",
    "marketCapUsd": 1823634704,
    "whyFits": "Autonomous sensing and robotics systems",
    "keyRisk": "Commercial adoption risk, hardware margin pressure, and service economics"
  },
  {
    "rank": 35,
    "company": "Serve Robotics",
    "ticker": "SERV",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "robotics",
    "marketCapUsd": 602390401,
    "whyFits": "Autonomous delivery optionality",
    "keyRisk": "Commercial adoption risk, hardware margin pressure, and service economics"
  },
  {
    "rank": 36,
    "company": "Nachi-Fujikoshi",
    "ticker": "6474.T",
    "country": "Japan",
    "usNonUs": "Non-US",
    "bucket": "robotics",
    "marketCapUsd": 639958603,
    "whyFits": "Industrial automation / robotics components",
    "keyRisk": "Commercial adoption risk, hardware margin pressure, and service economics"
  },
  {
    "rank": 37,
    "company": "Scott Technology",
    "ticker": "SCT.NZ",
    "country": "New Zealand",
    "usNonUs": "Non-US",
    "bucket": "robotics",
    "marketCapUsd": 113852387,
    "whyFits": "Industrial automation and robotics systems",
    "keyRisk": "Commercial adoption risk, hardware margin pressure, and service economics"
  },
  {
    "rank": 38,
    "company": "Maytronics",
    "ticker": "MTRN.TA",
    "country": "Israel",
    "usNonUs": "Non-US",
    "bucket": "robotics",
    "marketCapUsd": 115657749,
    "whyFits": "Robotic systems / consumer automation",
    "keyRisk": "Commercial adoption risk, hardware margin pressure, and service economics"
  },
  {
    "rank": 39,
    "company": "JEOL Ltd.",
    "ticker": "6951.T",
    "country": "Japan",
    "usNonUs": "Non-US",
    "bucket": "scientific_instruments",
    "marketCapUsd": 1896087706,
    "whyFits": "Scientific instrumentation / metrology and analysis",
    "keyRisk": "Industrial / research capex cyclicality and slower procurement cycles"
  },
  {
    "rank": 40,
    "company": "Jenoptik",
    "ticker": "JEN.F",
    "country": "Germany",
    "usNonUs": "Non-US",
    "bucket": "scientific_instruments",
    "marketCapUsd": 1863044612,
    "whyFits": "Optical systems, metrology, photonics",
    "keyRisk": "Industrial / research capex cyclicality and slower procurement cycles"
  },
  {
    "rank": 41,
    "company": "Sensirion Holding",
    "ticker": "SENS.SW",
    "country": "Switzerland",
    "usNonUs": "Non-US",
    "bucket": "scientific_instruments",
    "marketCapUsd": 1156198092,
    "whyFits": "Sensors for thermal/industrial control",
    "keyRisk": "Industrial / research capex cyclicality and slower procurement cycles"
  },
  {
    "rank": 42,
    "company": "VIGO Photonics",
    "ticker": "VGO.WA",
    "country": "Poland",
    "usNonUs": "Non-US",
    "bucket": "scientific_instruments",
    "marketCapUsd": 116979483,
    "whyFits": "Photonics and infrared detector leverage",
    "keyRisk": "Industrial / research capex cyclicality and slower procurement cycles"
  },
  {
    "rank": 43,
    "company": "O.Y. Nofar Energy",
    "ticker": "NOFR.TA",
    "country": "Israel",
    "usNonUs": "Non-US",
    "bucket": "electricity",
    "marketCapUsd": 1970925276,
    "whyFits": "Power build-out and renewable generation",
    "keyRisk": "Permitting, leverage, project execution, and power-price/regulatory exposure"
  },
  {
    "rank": 44,
    "company": "Babcock & Wilcox",
    "ticker": "BW",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "electricity",
    "marketCapUsd": 1639477770,
    "whyFits": "Power systems / thermal infrastructure",
    "keyRisk": "Permitting, leverage, project execution, and power-price/regulatory exposure"
  },
  {
    "rank": 45,
    "company": "Eos Energy Enterprises",
    "ticker": "EOSE",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "electricity",
    "marketCapUsd": 1993676450,
    "whyFits": "Long-duration storage optionality",
    "keyRisk": "Permitting, leverage, project execution, and power-price/regulatory exposure"
  },
  {
    "rank": 46,
    "company": "Romande Energie",
    "ticker": "REHN.SW",
    "country": "Switzerland",
    "usNonUs": "Non-US",
    "bucket": "electricity",
    "marketCapUsd": 1607167133,
    "whyFits": "Utility exposure to electricity demand growth",
    "keyRisk": "Permitting, leverage, project execution, and power-price/regulatory exposure"
  },
  {
    "rank": 47,
    "company": "Inox Wind",
    "ticker": "INOXWIND.NS",
    "country": "India",
    "usNonUs": "Non-US",
    "bucket": "electricity",
    "marketCapUsd": 1503411811,
    "whyFits": "Wind generation equipment and power capacity build-out",
    "keyRisk": "Permitting, leverage, project execution, and power-price/regulatory exposure"
  },
  {
    "rank": 48,
    "company": "Voltamp Transformers",
    "ticker": "VOLTAMP.NS",
    "country": "India",
    "usNonUs": "Non-US",
    "bucket": "electricity",
    "marketCapUsd": 921475683,
    "whyFits": "Transformer bottleneck exposure",
    "keyRisk": "Permitting, leverage, project execution, and power-price/regulatory exposure"
  },
  {
    "rank": 49,
    "company": "Voltalia",
    "ticker": "VLTSA.PA",
    "country": "France",
    "usNonUs": "Non-US",
    "bucket": "electricity",
    "marketCapUsd": 990676023,
    "whyFits": "Renewable power developer",
    "keyRisk": "Permitting, leverage, project execution, and power-price/regulatory exposure"
  },
  {
    "rank": 50,
    "company": "Genesis Energy",
    "ticker": "GNE.NZ",
    "country": "New Zealand",
    "usNonUs": "Non-US",
    "bucket": "electricity",
    "marketCapUsd": 1414366794,
    "whyFits": "Utility / power demand exposure",
    "keyRisk": "Permitting, leverage, project execution, and power-price/regulatory exposure"
  }
];

export interface PrivateName { rank: number; company: string; country: string; usNonUs: string; bucket: string; funding: string; whyFits: string; keyRisk: string; }
export const privateWatchlist: PrivateName[] = [
  {
    "rank": 1,
    "company": "Articul8",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "agents",
    "funding": "$40M disclosed funding",
    "whyFits": "Enterprise agent stack / sovereign deployment fit",
    "keyRisk": "Thin moats, fast product churn, and dependence on frontier-model platforms"
  },
  {
    "rank": 2,
    "company": "Wonderful",
    "country": "Netherlands",
    "usNonUs": "Non-US",
    "bucket": "agents",
    "funding": "$283M disclosed funding",
    "whyFits": "Agentic productivity / workflow exposure in Europe",
    "keyRisk": "Thin moats, fast product churn, and dependence on frontier-model platforms"
  },
  {
    "rank": 3,
    "company": "Port",
    "country": "Israel",
    "usNonUs": "Non-US",
    "bucket": "agents",
    "funding": "$160M disclosed funding",
    "whyFits": "Developer portal / orchestration surface for AI-native ops",
    "keyRisk": "Thin moats, fast product churn, and dependence on frontier-model platforms"
  },
  {
    "rank": 4,
    "company": "Artisan",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "agents",
    "funding": "$46.1M disclosed funding",
    "whyFits": "AI workflow automation with go-to-market agent exposure",
    "keyRisk": "Thin moats, fast product churn, and dependence on frontier-model platforms"
  },
  {
    "rank": 5,
    "company": "iGenius (Domyn)",
    "country": "Italy",
    "usNonUs": "Non-US",
    "bucket": "agents",
    "funding": "€40M disclosed funding",
    "whyFits": "European sovereign/enterprise agent deployment angle",
    "keyRisk": "Thin moats, fast product churn, and dependence on frontier-model platforms"
  },
  {
    "rank": 6,
    "company": "Trace",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "agents",
    "funding": "$3M disclosed funding",
    "whyFits": "Early-stage agentic workflow tooling",
    "keyRisk": "Thin moats, fast product churn, and dependence on frontier-model platforms"
  },
  {
    "rank": 7,
    "company": "Empromptu",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "agents",
    "funding": "$2M disclosed funding",
    "whyFits": "Agent application layer / orchestration middleware",
    "keyRisk": "Thin moats, fast product churn, and dependence on frontier-model platforms"
  },
  {
    "rank": 8,
    "company": "LangChain",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "agents",
    "funding": "$160M disclosed funding",
    "whyFits": "Core agent framework / orchestration picks-and-shovels",
    "keyRisk": "Thin moats, fast product churn, and dependence on frontier-model platforms"
  },
  {
    "rank": 9,
    "company": "Manus AI",
    "country": "Singapore",
    "usNonUs": "Non-US",
    "bucket": "agents",
    "funding": "$85M disclosed funding",
    "whyFits": "Consumer/prosumer autonomous-agent platform exposure",
    "keyRisk": "Thin moats, fast product churn, and dependence on frontier-model platforms"
  },
  {
    "rank": 10,
    "company": "Relevance AI",
    "country": "Australia",
    "usNonUs": "Non-US",
    "bucket": "agents",
    "funding": "$42M disclosed funding",
    "whyFits": "Enterprise agent-builder and workflow automation",
    "keyRisk": "Thin moats, fast product churn, and dependence on frontier-model platforms"
  },
  {
    "rank": 11,
    "company": "1Mind",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "agents",
    "funding": "$40M disclosed funding",
    "whyFits": "Multi-agent customer/knowledge orchestration",
    "keyRisk": "Thin moats, fast product churn, and dependence on frontier-model platforms"
  },
  {
    "rank": 12,
    "company": "Wordsmith",
    "country": "United Kingdom",
    "usNonUs": "Non-US",
    "bucket": "agents",
    "funding": "$30M disclosed funding",
    "whyFits": "Enterprise AI-worker / legal workflow angle",
    "keyRisk": "Thin moats, fast product churn, and dependence on frontier-model platforms"
  },
  {
    "rank": 13,
    "company": "Maisa AI",
    "country": "Spain",
    "usNonUs": "Non-US",
    "bucket": "agents",
    "funding": "$25M disclosed funding",
    "whyFits": "Agentic enterprise operations and orchestration",
    "keyRisk": "Thin moats, fast product churn, and dependence on frontier-model platforms"
  },
  {
    "rank": 14,
    "company": "Tavily",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "agents",
    "funding": "$25M disclosed funding",
    "whyFits": "Retrieval/search infrastructure for agent systems",
    "keyRisk": "Thin moats, fast product churn, and dependence on frontier-model platforms"
  },
  {
    "rank": 15,
    "company": "Dust",
    "country": "France",
    "usNonUs": "Non-US",
    "bucket": "agents",
    "funding": "€20M disclosed funding",
    "whyFits": "Enterprise assistant layer for internal knowledge + agents",
    "keyRisk": "Thin moats, fast product churn, and dependence on frontier-model platforms"
  },
  {
    "rank": 16,
    "company": "Arcade",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "agents",
    "funding": "$12M disclosed funding",
    "whyFits": "Agent tools / workflow commerce infrastructure",
    "keyRisk": "Thin moats, fast product churn, and dependence on frontier-model platforms"
  },
  {
    "rank": 17,
    "company": "Eridu",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "hardware",
    "funding": "$200M disclosed funding",
    "whyFits": "AI data-center hardware and infrastructure leverage",
    "keyRisk": "Capital intensity, tape-out risk, and customer qualification cycles"
  },
  {
    "rank": 18,
    "company": "Ethernovia",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "hardware",
    "funding": "$154M disclosed funding",
    "whyFits": "High-speed automotive/AI networking silicon",
    "keyRisk": "Capital intensity, tape-out risk, and customer qualification cycles"
  },
  {
    "rank": 19,
    "company": "Axelera AI",
    "country": "Netherlands",
    "usNonUs": "Non-US",
    "bucket": "hardware",
    "funding": "$203.2M disclosed funding",
    "whyFits": "Edge AI accelerator exposure with European base",
    "keyRisk": "Capital intensity, tape-out risk, and customer qualification cycles"
  },
  {
    "rank": 20,
    "company": "EnCharge AI",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "hardware",
    "funding": "$162.9M disclosed funding",
    "whyFits": "Analog/in-memory compute thesis exposure",
    "keyRisk": "Capital intensity, tape-out risk, and customer qualification cycles"
  },
  {
    "rank": 21,
    "company": "EdgeQ",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "hardware",
    "funding": "$126M disclosed funding",
    "whyFits": "Baseband + edge AI silicon platform",
    "keyRisk": "Capital intensity, tape-out risk, and customer qualification cycles"
  },
  {
    "rank": 22,
    "company": "Etched",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "hardware",
    "funding": "$125.4M disclosed funding",
    "whyFits": "Specialized transformer inference ASIC exposure",
    "keyRisk": "Capital intensity, tape-out risk, and customer qualification cycles"
  },
  {
    "rank": 23,
    "company": "Esperanto Technologies",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "hardware",
    "funding": "$124M disclosed funding",
    "whyFits": "RISC-V AI compute platform leverage",
    "keyRisk": "Capital intensity, tape-out risk, and customer qualification cycles"
  },
  {
    "rank": 24,
    "company": "Prophesee",
    "country": "France",
    "usNonUs": "Non-US",
    "bucket": "hardware",
    "funding": "$111.4M disclosed funding",
    "whyFits": "Event-based sensor stack for efficient machine vision",
    "keyRisk": "Capital intensity, tape-out risk, and customer qualification cycles"
  },
  {
    "rank": 25,
    "company": "DEEPX",
    "country": "South Korea",
    "usNonUs": "Non-US",
    "bucket": "hardware",
    "funding": "₩134.5B disclosed funding",
    "whyFits": "Korean edge-AI chip leverage",
    "keyRisk": "Capital intensity, tape-out risk, and customer qualification cycles"
  },
  {
    "rank": 26,
    "company": "DataCrunch",
    "country": "Finland",
    "usNonUs": "Non-US",
    "bucket": "hardware",
    "funding": "$78.6M disclosed funding",
    "whyFits": "GPU cloud / sovereign European compute exposure",
    "keyRisk": "Capital intensity, tape-out risk, and customer qualification cycles"
  },
  {
    "rank": 27,
    "company": "NeuReality",
    "country": "Israel",
    "usNonUs": "Non-US",
    "bucket": "hardware",
    "funding": "$59.7M disclosed funding",
    "whyFits": "Inference-serving architecture / AI networking",
    "keyRisk": "Capital intensity, tape-out risk, and customer qualification cycles"
  },
  {
    "rank": 28,
    "company": "Mesh",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "hardware",
    "funding": "$50M disclosed funding",
    "whyFits": "Optical interconnect / bandwidth bottleneck play",
    "keyRisk": "Capital intensity, tape-out risk, and customer qualification cycles"
  },
  {
    "rank": 29,
    "company": "Extropic",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "hardware",
    "funding": "$14.1M disclosed funding",
    "whyFits": "Probabilistic/analog compute optionality",
    "keyRisk": "Capital intensity, tape-out risk, and customer qualification cycles"
  },
  {
    "rank": 30,
    "company": "Ephos",
    "country": "Italy",
    "usNonUs": "Non-US",
    "bucket": "hardware",
    "funding": "€8.1M disclosed funding",
    "whyFits": "Photonic interconnect and datacenter optics angle",
    "keyRisk": "Capital intensity, tape-out risk, and customer qualification cycles"
  },
  {
    "rank": 31,
    "company": "Corintis",
    "country": "Switzerland",
    "usNonUs": "Non-US",
    "bucket": "cooling",
    "funding": "$58M disclosed funding",
    "whyFits": "Chip-level liquid cooling for AI thermal bottlenecks",
    "keyRisk": "Lengthy datacenter qualification cycles and project-financing dependence"
  },
  {
    "rank": 32,
    "company": "Submer",
    "country": "Spain",
    "usNonUs": "Non-US",
    "bucket": "cooling",
    "funding": "$55.5M latest round disclosed",
    "whyFits": "Immersion/liquid cooling + AI datacenter design leverage",
    "keyRisk": "Lengthy datacenter qualification cycles and project-financing dependence"
  },
  {
    "rank": 33,
    "company": "Iceotope",
    "country": "United Kingdom",
    "usNonUs": "Non-US",
    "bucket": "cooling",
    "funding": "£30M disclosed round",
    "whyFits": "Precision liquid cooling for dense AI datacenters",
    "keyRisk": "Lengthy datacenter qualification cycles and project-financing dependence"
  },
  {
    "rank": 34,
    "company": "Milestone",
    "country": "Israel",
    "usNonUs": "Non-US",
    "bucket": "verification_security",
    "funding": "$10M disclosed funding",
    "whyFits": "GenAI ROI and governance telemetry",
    "keyRisk": "Platform bundling, crowded markets, and ROI proof requirements"
  },
  {
    "rank": 35,
    "company": "Arize AI",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "verification_security",
    "funding": "$131M disclosed funding",
    "whyFits": "Model/agent observability and evaluation layer",
    "keyRisk": "Platform bundling, crowded markets, and ROI proof requirements"
  },
  {
    "rank": 36,
    "company": "Deepset",
    "country": "Germany",
    "usNonUs": "Non-US",
    "bucket": "verification_security",
    "funding": "$45.6M disclosed funding",
    "whyFits": "Enterprise retrieval / evaluation / search stack",
    "keyRisk": "Platform bundling, crowded markets, and ROI proof requirements"
  },
  {
    "rank": 37,
    "company": "CalypsoAI",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "verification_security",
    "funding": "$43.2M disclosed funding",
    "whyFits": "LLM guardrails and secure model deployment",
    "keyRisk": "Platform bundling, crowded markets, and ROI proof requirements"
  },
  {
    "rank": 38,
    "company": "MakinaRocks",
    "country": "South Korea",
    "usNonUs": "Non-US",
    "bucket": "verification_security",
    "funding": "$38.4M disclosed funding",
    "whyFits": "Industrial MLOps and deployment tooling",
    "keyRisk": "Platform bundling, crowded markets, and ROI proof requirements"
  },
  {
    "rank": 39,
    "company": "Seldon",
    "country": "United Kingdom",
    "usNonUs": "Non-US",
    "bucket": "verification_security",
    "funding": "$33.7M disclosed funding",
    "whyFits": "Model serving, monitoring, and policy controls",
    "keyRisk": "Platform bundling, crowded markets, and ROI proof requirements"
  },
  {
    "rank": 40,
    "company": "Qwak",
    "country": "Israel",
    "usNonUs": "Non-US",
    "bucket": "verification_security",
    "funding": "$27M disclosed funding",
    "whyFits": "Production ML/AI ops platform",
    "keyRisk": "Platform bundling, crowded markets, and ROI proof requirements"
  },
  {
    "rank": 41,
    "company": "FedML",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "verification_security",
    "funding": "$19.5M disclosed funding",
    "whyFits": "Distributed training/deployment tooling",
    "keyRisk": "Platform bundling, crowded markets, and ROI proof requirements"
  },
  {
    "rank": 42,
    "company": "Deepchecks",
    "country": "Israel",
    "usNonUs": "Non-US",
    "bucket": "verification_security",
    "funding": "$14M disclosed funding",
    "whyFits": "Testing and monitoring for ML systems",
    "keyRisk": "Platform bundling, crowded markets, and ROI proof requirements"
  },
  {
    "rank": 43,
    "company": "Senser",
    "country": "Israel",
    "usNonUs": "Non-US",
    "bucket": "verification_security",
    "funding": "$9.5M disclosed funding",
    "whyFits": "AIOps / runtime observability for AI-heavy systems",
    "keyRisk": "Platform bundling, crowded markets, and ROI proof requirements"
  },
  {
    "rank": 44,
    "company": "Keep",
    "country": "Israel",
    "usNonUs": "Non-US",
    "bucket": "verification_security",
    "funding": "$3.2M disclosed funding",
    "whyFits": "Open-source AIOps / alerting stack",
    "keyRisk": "Platform bundling, crowded markets, and ROI proof requirements"
  },
  {
    "rank": 45,
    "company": "Relyance AI",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "verification_security",
    "funding": "$62M disclosed funding",
    "whyFits": "AI governance, privacy, and compliance layer",
    "keyRisk": "Platform bundling, crowded markets, and ROI proof requirements"
  },
  {
    "rank": 46,
    "company": "Cynomi",
    "country": "United Kingdom",
    "usNonUs": "Non-US",
    "bucket": "verification_security",
    "funding": "$60M disclosed funding",
    "whyFits": "AI-enabled vCISO / cyber-assurance automation",
    "keyRisk": "Platform bundling, crowded markets, and ROI proof requirements"
  },
  {
    "rank": 47,
    "company": "Robust Intelligence",
    "country": "United States",
    "usNonUs": "US",
    "bucket": "verification_security",
    "funding": "$44M disclosed funding",
    "whyFits": "Adversarial robustness / model validation",
    "keyRisk": "Platform bundling, crowded markets, and ROI proof requirements"
  },
  {
    "rank": 48,
    "company": "Ripjar",
    "country": "United Kingdom",
    "usNonUs": "Non-US",
    "bucket": "verification_security",
    "funding": "$41.5M disclosed funding",
    "whyFits": "Risk intelligence / fraud / AML infrastructure",
    "keyRisk": "Platform bundling, crowded markets, and ROI proof requirements"
  },
  {
    "rank": 49,
    "company": "Shield",
    "country": "Israel",
    "usNonUs": "Non-US",
    "bucket": "verification_security",
    "funding": "$35M disclosed funding",
    "whyFits": "Enterprise communications surveillance / compliance",
    "keyRisk": "Platform bundling, crowded markets, and ROI proof requirements"
  },
  {
    "rank": 50,
    "company": "Factiverse",
    "country": "Norway",
    "usNonUs": "Non-US",
    "bucket": "verification_security",
    "funding": "$2.4M disclosed funding",
    "whyFits": "Automated fact-checking / verification layer",
    "keyRisk": "Platform bundling, crowded markets, and ROI proof requirements"
  }
];

export interface RLMMethod { method: string; mechanism: string; whyBitter: string; whyWorks: string; landscapeChange: string; overlaps: string; whyNew: string; novelty: string; }
export const rlmMethods: RLMMethod[] = [
  {
    "method": "Verifier-First Recursive Compilation (VFRC)",
    "mechanism": "Before solving, the controller recursively compiles the task into contracts, tests, invariants, simulators, and typed outputs. It only spends large solve-budget once the task is maximally machine-checkable.",
    "whyBitter": "General search over automatically generated verifier artifacts replaces hand-authored prompts and domain heuristics.",
    "whyWorks": "Parsel shows automatic decomposition + tests help on hard algorithmic tasks; MiroThinker-H1 shows local/global verification improves long-horizon reliability; RLM shows recursion can manage long inputs.",
    "landscapeChange": "Shifts value toward automated verifier generators, synthetic environment builders, and domains with cheap executable feedback.",
    "overlaps": "Parsel (2212.10561), MiroThinker-H1 (2603.15726), Recursive Language Models (2512.24601)",
    "whyNew": "Current systems mostly verify after or during solving. This proposal compiles tasks into verifier-rich recursive representations first, then solves inside that compiled space.",
    "novelty": "Medium-High"
  },
  {
    "method": "Counterfactual Call-Graph Credit Assignment (CCGA)",
    "mechanism": "Sample many decomposition trees for the same prompt, run them to verified completion, and assign regret/credit to split choices, stop decisions, memory writes, and model/tool routing. Train the recursive controller off-policy on that signal.",
    "whyBitter": "Uses large-scale search plus automated outcome feedback; no human labeling of “good decomposition” is needed.",
    "whyWorks": "ATTS shows diverse rollouts and list-wise verifiers help agents; MACA shows richer debate traces can train models; AgentArk shows interaction dynamics can be distilled into weights.",
    "landscapeChange": "Better recursive controllers become a moat. Trajectory farms and call-graph datasets gain value while thin external wrappers commoditize.",
    "overlaps": "Scaling Test-time Compute for LLM Agents (2506.12928), MACA debate post-training (2509.15172), AgentArk (2602.03955)",
    "whyNew": "Existing work improves final reasoning or distills debate, but does not explicitly assign counterfactual credit to recursive call-graph decisions in RLMs.",
    "novelty": "High"
  },
  {
    "method": "Recursive Compute Markets (RCM)",
    "mechanism": "Each branch predicts its verifier-adjusted value of additional compute (tokens, depth, model size, tool calls) and bids for budget. The parent allocates budget across branches and learns from realized payoffs.",
    "whyBitter": "Automates resource allocation with reward and compute rather than scripted budgets or hand-tuned branching rules.",
    "whyWorks": "Compute-optimal test-time scaling already works at prompt level; ATTS and AOrchestra show cost/performance trade-offs matter; branch-level value-of-compute should reduce wasted recursion and deepen the useful search frontier.",
    "landscapeChange": "Inference schedulers become first-class. Smaller models with better budget policy can beat bigger models on structured workloads.",
    "overlaps": "Compute-optimal test-time scaling (2408.03314), ATTS (2506.12928), AOrchestra (2602.03786)",
    "whyNew": "Current papers allocate adaptively per prompt or per system. This proposal turns budget allocation into a learned economic policy over recursive branches.",
    "novelty": "Medium"
  },
  {
    "method": "Auto-Discovered Recursive Interfaces (ADRI)",
    "mechanism": "Train branches to invent compact typed schemas, DSL fragments, or latent APIs for recurring subproblems, constrained by round-trip reconstruction and verifier success. Parent-child communication shifts from verbose natural language to discovered interfaces.",
    "whyBitter": "Learns abstractions by compression + task reward instead of relying on human-authored ontologies or function signatures.",
    "whyWorks": "RLM/THREAD benefit from scope isolation; Pensieve shows models can manage state; Parsel and automated model discovery show LMs can search within or beyond DSLs. Learned interfaces could raise semantic bandwidth and allow deeper trees.",
    "landscapeChange": "Winners own internal AI protocols, compiler-like tooling, and reusable recursive skill ecosystems. Raw context-window size matters less.",
    "overlaps": "Recursive Language Models (2512.24601), THREAD (2405.17402), Pensieve (2602.12108), Parsel (2212.10561), Automated Statistical Model Discovery (2402.17879)",
    "whyNew": "Existing work uses human-authored function descriptions, memory tools, or fixed languages. It does not discover branch-to-branch interfaces jointly with recursive training.",
    "novelty": "Medium-High"
  },
  {
    "method": "Recursive Self-Play Environment Mutation (RSEM)",
    "mechanism": "The system generates synthetic tasks/environments that specifically require deeper recursion, memory hygiene, and stronger verification; it keeps only automatically scored tasks and ratchets up depth/branching as the model improves.",
    "whyBitter": "Creates an endless curriculum with automated verifiers and self-generated data instead of waiting for human benchmarks.",
    "whyWorks": "SPIN and SPAG show self-play can improve LMs without more human labels; Societies of Thought suggests diversity/conflict helps reasoning; RLM still needs direct training pressure for recursion depth, which synthetic environment mutation would provide.",
    "landscapeChange": "Labs with better verifier farms and environment generators compound faster than labs relying on static human-curated datasets. Benchmark culture shifts toward moving synthetic frontiers.",
    "overlaps": "SPIN (2401.01335), SPAG (2404.10642), MACA debate post-training (2509.15172), Societies of Thought (2601.10825), Recursive Language Models (2512.24601)",
    "whyNew": "Prior self-play is generic or debate-centric. It does not target recursion depth, memory writes, and call-graph competence as the curriculum objective.",
    "novelty": "Medium-High"
  }
];

export interface NoveltyAudit { method: string; exists: string; missing: string; view: string; shift: string; }
export const noveltyAudit: NoveltyAudit[] = [
  {
    "method": "Verifier-First Recursive Compilation (VFRC)",
    "exists": "Hierarchical decomposition, tests, and local/global verification already exist.",
    "missing": "A controller that first compiles tasks into recursive machine-checkable contracts before doing the expensive solve.",
    "view": "Still looks new",
    "shift": "Pushes the thesis from “verification matters” to “verification should shape the problem before solving begins.”"
  },
  {
    "method": "Counterfactual Call-Graph Credit Assignment (CCGA)",
    "exists": "Rollout diversification, debate-based post-training, and distillation of interaction traces already exist.",
    "missing": "Explicit off-policy credit assignment to recursive split/merge/memory decisions inside an RLM call graph.",
    "view": "Still looks new",
    "shift": "Makes the recursive controller itself the main object of scaling, not just the base model or wrapper."
  },
  {
    "method": "Recursive Compute Markets (RCM)",
    "exists": "Adaptive compute allocation per prompt and cost-aware orchestration already exist.",
    "missing": "A learned market over recursive branches where budget follows branch-level value-of-compute rather than a fixed controller rule.",
    "view": "Partly new",
    "shift": "Strengthens the conclusion that inference economics and scheduling policy may matter almost as much as model scale."
  },
  {
    "method": "Auto-Discovered Recursive Interfaces (ADRI)",
    "exists": "LMs can search in or beyond DSLs, and can learn to manage state.",
    "missing": "Jointly training recursive branches to invent compact typed interfaces for communication and memory compression.",
    "view": "Still looks new",
    "shift": "Revises the thesis toward bandwidth and abstraction discovery as the next bottleneck after basic topology compression."
  },
  {
    "method": "Recursive Self-Play Environment Mutation (RSEM)",
    "exists": "Self-play, adversarial language games, and debate-based improvement already exist.",
    "missing": "A synthetic curriculum that specifically targets recursion depth, memory writes, and call-graph competence rather than generic reasoning.",
    "view": "Still looks new",
    "shift": "Moves the thesis from static benchmark scaling to self-generated recursive training worlds as the main compounding flywheel."
  }
];

export const bucketColors: Record<string, string> = {
  'agents': 'oklch(50% 0.12 155)',
  'cooling': 'oklch(55% 0.12 25)',
  'electricity': 'oklch(60% 0.12 60)',
  'hardware': 'oklch(45% 0.10 300)',
  'it_security': 'oklch(55% 0.08 280)',
  'networking': 'oklch(50% 0.10 200)',
  'robotics': 'oklch(55% 0.10 330)',
  'scientific_instruments': 'oklch(50% 0.08 100)',
  'semiconductors': 'oklch(45% 0.12 250)',
  'verification_security': 'oklch(50% 0.12 180)',
};

export const bottomLines = [
  "Directionally, the thesis is strong: structure, context isolation, and verification matter more than merely asking a model to think longer.",
  "The overreach is theoretical certainty: the exponent claim is best read as a heuristic rather than a proven universal law.",
  "Durable rents sit in bottlenecks and trust layers. New arXiv evidence shifts value toward recursive training data flywheels, state management, synthetic environments, and verifier infrastructure.",
  "The next frontier looks less like manually prompt-engineered multi-agent systems and more like models that natively learn when to recurse, what to remember, and what to verify.",
];

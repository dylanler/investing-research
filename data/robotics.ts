// Robotics Revolution: End-to-End Learning, Data Infrastructure, and Investment Landscape
// Source: robotics_revolution_report_v2_with_egoverse_update.md (March 25, 2026)
// Cross-referenced with: robotics_end_to_end_learning_report.md, validation addendum

export interface LearningMethod {
  id: number;
  name: string;
  shortName: string;
  scores: { m1: number; m2: number; m3: number; m4: number; m5: number; m6: number; m7: number; m8: number };
  composite: number;
  confidence2030: string;
  description: string;
  justifications: { [key: string]: string };
}

export const scoringMetrics = [
  { key: 'm1', name: 'Data Scalability', short: 'Data', description: 'How much naturally occurring or cheaply collectible data exists for this method? Score 10 = internet-scale data supply (e.g., human video). Score 1 = every hour requires a robot, operator, and task setup.', question: 'Can this method tap abundant, cheap data — or is every training sample expensive?' },
  { key: 'm2', name: 'Compute Scalability', short: 'Compute', description: 'Does throwing more compute at this method reliably improve performance? Score 10 = clear log-linear scaling laws demonstrated (e.g., EgoScale R²=0.9983). Score 1 = more compute yields diminishing or no returns.', question: 'Does more GPU time translate into better robot capability?' },
  { key: 'm3', name: 'Task Generalization', short: 'Tasks', description: 'How well does a model trained with this method generalize to unseen tasks, objects, and environments? Score 10 = broad open-world generalization. Score 1 = narrow, per-task-only performance.', question: 'Can the robot handle tasks it was never specifically trained for?' },
  { key: 'm4', name: 'Cross-Embodiment Transfer', short: 'Transfer', description: 'Can knowledge learned on one robot body transfer to a different robot form? Score 10 = works across arms, hands, humanoids, and mobile platforms. Score 1 = completely embodiment-specific.', question: 'Does training on Robot A help Robot B learn faster?' },
  { key: 'm5', name: 'Real-World Sample Efficiency', short: 'Efficiency', description: 'How few real robot interactions are needed after pretraining? Score 10 = near zero-shot from pretraining alone. Score 1 = every task needs hundreds of robot-specific demos.', question: 'How much expensive real-world robot time is still needed?' },
  { key: 'm6', name: 'Sim-to-Real Viability', short: 'Sim2Real', description: 'Does this method benefit from simulation? Score 10 = sim is the primary training environment with reliable transfer. Score 1 = simulation provides no meaningful benefit.', question: 'Can simulation substitute for real-world data collection?' },
  { key: 'm7', name: 'Inference Speed', short: 'Speed', description: 'Can the trained model run fast enough for real-time robot control? Score 10 = sub-5ms inference suitable for 200Hz+ control. Score 1 = too slow for any reactive behavior.', question: 'Is the model fast enough to control a robot in real time?' },
  { key: 'm8', name: 'Bitter Lesson Alignment', short: 'Bitter', description: 'Does this method align with Rich Sutton\'s Bitter Lesson — that general methods leveraging computation and data ultimately outperform methods that exploit human knowledge? Score 10 = pure scaling play. Score 1 = heavy hand-engineering.', question: 'Does this method win by throwing more data and compute at the problem?' },
];

export const learningMethods: LearningMethod[] = [
  { id: 5, name: 'Scaled Egocentric Human Video → Robot Transfer', shortName: 'Human Video→Robot', scores: { m1: 10, m2: 9, m3: 8, m4: 8, m5: 9, m6: 6, m7: 7, m8: 10 }, composite: 106, confidence2030: '55-65%', description: 'Map massive egocentric human video (EgoScale: 20,854h, DreamDojo: 44,711h) to robot embodiments via retargeting and alignment. The Bitter Lesson winner.',
    justifications: { m1: 'Best-in-class: egocentric human video is far cheaper and more abundant than teleoperation', m2: 'EgoScale provides near-perfect log-linear fit (R²=0.9983) between data scale and downstream performance', m3: 'Learns from human activity distributions rather than narrow robot task scripts', m4: 'Core design goal; EgoScale already reports transfer from high-DoF to lower-DoF hands', m5: 'Robot-specific finetuning can be small relative to human-video pretraining set', m6: 'Useful but not mandatory; key advantage is bypassing teleop, not depending on sim fidelity', m7: 'Real-time feasible but typically slower than plain BC due to richer multimodal models', m8: 'Most Bitter-Lesson-aligned method: attacks robotics\' scarcest resource by tapping internet-scale modality' } },
  { id: 9, name: 'Cross-Embodiment Foundation Models', shortName: 'Cross-Embodiment', scores: { m1: 9, m2: 9, m3: 9, m4: 9, m5: 7, m6: 5, m7: 6, m8: 10 }, composite: 102, confidence2030: '65-75%', description: 'Pretrain on heterogeneous multi-robot datasets (Open X-Embodiment: 22 robots, 527 skills, 1M+ trajectories). Transfer to new embodiments.',
    justifications: { m1: 'Aggregates many robots, institutions, embodiments into one pretraining corpus', m2: 'Clearest robotics analog to language-model scaling: larger heterogeneous corpora yield better transfer', m3: 'Sees many tasks, objects, and embodiments during pretraining — among the best', m4: 'Cross-embodiment transfer is the defining strength of the method', m5: 'After pretraining, relatively small finetuning sets can adapt to new platforms', m6: 'Can be appended, but current wins come more from real heterogeneous data than sim', m7: 'Acceptable but not ultra-fast due to large models with chunked actions', m8: 'Arguably cleanest Bitter-Lesson winner: general methods, broad data, more compute all point same direction' } },
  { id: 3, name: 'World Models for Robotics', shortName: 'World Models', scores: { m1: 8, m2: 9, m3: 8, m4: 6, m5: 8, m6: 8, m7: 6, m8: 9 }, composite: 97, confidence2030: '60-70%', description: 'Learn physics simulators from data (1X: 14B WM, NVIDIA Cosmos: 20M+ hours). Generate synthetic trajectories to amplify real data by 10-100x.',
    justifications: { m1: 'Can absorb robot logs, egocentric video, and synthetic rollouts, broadening usable corpus', m2: 'Predictive models and latent planners improve with model size, horizon length, and simulation budget', m3: 'Models dynamics instead of memorizing single trajectories — better novel-scenario transfer', m4: 'Latent dynamics can transfer across embodiments but embodiment-specific control layers still needed', m5: 'Imagined rollouts and model-based planning reduce on-robot data demand', m6: 'One of the best methods for exploiting simulation/synthetic data, though model bias limits', m7: 'Slower than simple BC because planning or rollouts add overhead', m8: 'More data and compute buy better internal simulation, reducing dependence on hand-coded structure' } },
  { id: 6, name: 'Vision-Language-Action Models (VLAs)', shortName: 'VLAs', scores: { m1: 8, m2: 8, m3: 8, m4: 7, m5: 6, m6: 4, m7: 5, m8: 8 }, composite: 86, confidence2030: 'Near-term dominant', description: 'End-to-end models mapping vision+language to motor actions. RT-2 jumped from 32% to 62% on unseen tasks. VLA alone is NOT the answer — it is one layer.',
    justifications: { m1: 'Can mix robot data with web-scale language/vision, but actions still require robot or aligned human data', m2: 'Strong by inheritance from LLM/VLM pretraining, evidence from RT-2, OpenVLA, pi0', m3: 'Language lets the policy bind semantics to new objects and instructions', m4: 'Improving but action heads and control frequencies still vary by platform', m5: 'Better than pure BC but still materially dependent on robot-action data', m6: 'Helps for augmentation/evaluation but VLAs are not yet sim-first winners', m7: 'Inference constraint: autoregressive/multimodal stacks struggle at high control frequencies', m8: 'Strongly aligned but current systems still rely on curated mixtures and some scaffolding' } },
  { id: 7, name: 'Sim RL + Sim-to-Real Transfer', shortName: 'Sim RL', scores: { m1: 6, m2: 8, m3: 5, m4: 4, m5: 7, m6: 9, m7: 9, m8: 6 }, composite: 80, confidence2030: 'Complementary', description: 'Train in simulation with massive RL, transfer to real (Tesla FSD philosophy). Highest inference speed but sim-to-real gap persists for manipulation.',
    justifications: { m1: 'Simulators generate enormous volumes but task reward design and env authoring remain manual', m2: 'More parallel envs and more rollouts reliably improve policies in many domains', m3: 'Modest outside simulator distribution unless randomization is extremely rich', m4: 'Possible but usually demands morphology-specific training loops', m5: 'Good: many skills learned in sim before limited real finetuning', m6: 'Core strength: for locomotion and navigation, sim-to-real is production-grade', m7: 'Excellent: learned RL policies are compact and fast at control time', m8: 'Only moderately aligned: still leans heavily on human reward shaping and simulator engineering' } },
  { id: 1, name: 'End-to-End ViT Visuomotor Policy', shortName: 'ViT Visuomotor', scores: { m1: 6, m2: 7, m3: 7, m4: 4, m5: 5, m6: 4, m7: 8, m8: 8 }, composite: 78, confidence2030: 'Declining', description: 'Direct vision-to-action with Vision Transformers. Clean and fast but limited by data diversity.',
    justifications: { m1: 'Can pool multi-camera robot logs but still needs action-labeled robot data, not raw internet video', m2: 'Transformer backbones inherit some LLM/ViT scaling behavior, but robotics power laws weakly characterized', m3: 'Good object-level generalization when trained broadly, but long-horizon transfer inconsistent', m4: 'Limited unless wrapped in embodiment-specific heads or tokenization schemes', m5: 'Middling: most gains still come from expensive robot-action trajectories', m6: 'Helps with perception pretraining, but pure sim usually insufficient for dexterous manipulation', m7: 'Fast enough: one forward pass outputs chunks or low-rate actions in real time', m8: 'Strongly aligned (removes hand-engineered modules) but depends on curated robot datasets' } },
  { id: 2, name: 'IDM → Pseudo-Label → FDM Pipeline', shortName: 'IDM→FDM', scores: { m1: 10, m2: 6, m3: 3, m4: 2, m5: 7, m6: 1, m7: 6, m8: 8 }, composite: 75, confidence2030: 'Niche', description: 'Standard Intelligence approach: IDM on 40K hours labeled data, pseudo-label 11M hour corpus, train FDM. 11ms inference latency.',
    justifications: { m1: 'Maximum in principle: small labeled set unlocks massive unlabeled video via pseudo-labeling', m2: 'Promising (larger context windows improve behavior) but robot-specific scaling laws not yet public', m3: 'Unproven in robotics; best evidence is adjacent computer-use work, not broad physical manipulation', m4: 'Weak until a reliable embodiment-invariant action space exists', m5: 'Potentially strong (minimizes real robot labeling) if IDM quality is high enough', m6: 'Not central to the method, so sim-to-real leverage is minimal', m7: 'Feasible but very long-context video models carry latency overhead', m8: 'Philosophically aligned: converts abundant unlabeled data into supervision with minimal human engineering' } },
  { id: 10, name: 'Hierarchical/Modular + LLM Planner', shortName: 'LLM Planner', scores: { m1: 6, m2: 6, m3: 7, m4: 4, m5: 5, m6: 4, m7: 4, m8: 4 }, composite: 60, confidence2030: 'Declining', description: 'LLM plans, skills execute. Google SayCan/Palm-E lineage. Neat but violates the Bitter Lesson — engineered, not learned.',
    justifications: { m1: 'High-level planning leverages web text, but low-level skill data still need robot collection', m2: 'Compute helps the planner but system bottlenecked by weakest module, not one unified scaling curve', m3: 'Often good at task-planning level, especially long-horizon instruction following', m4: 'Limited: each embodiment still needs its own skill library or controller bank', m5: 'Middling: planner is data-rich, skills are not', m6: 'Useful for skill libraries and testing but does not remove integration burden', m7: 'Can be slow: orchestration adds planner latency and tool-calling overhead', m8: 'Least Bitter-Lesson aligned: reintroduces modular decomposition and human-selected interfaces' } },
  { id: 8, name: 'Diffusion/Flow Action Generation', shortName: 'Diffusion/Flow', scores: { m1: 4, m2: 6, m3: 7, m4: 3, m5: 4, m6: 3, m7: 4, m8: 6 }, composite: 59, confidence2030: 'Component', description: 'Diffusion Policy: 46.9% avg improvement over prior. Used inside other methods (pi0, GR00T N1.5 FLARE) rather than standalone.',
    justifications: { m1: 'Low-to-moderate: diffusion improves the policy class, not the data bottleneck', m2: 'Less clean than autoregressive transformers, especially once denoising steps dominate costs', m3: 'Good on multimodal manipulation: can represent multiple valid futures', m4: 'Limited: most published systems tied to specific embodiments or small families', m5: 'Middling: demonstration data still needed in quantity', m6: 'Can help but diffusion itself does not solve sim-to-real', m7: 'Biggest weakness unless flow matching/distillation/consistency methods shrink denoising latency', m8: 'Moderately aligned: general learning method but not the main unlock for scaling data' } },
  { id: 4, name: 'Imitation Learning / Learning from Demonstration', shortName: 'Imitation/LfD', scores: { m1: 3, m2: 6, m3: 6, m4: 3, m5: 4, m6: 2, m7: 8, m8: 5 }, composite: 56, confidence2030: 'Bootstrap only', description: 'Classic behavior cloning from human demos. 50 demos/task × 3 min = 2.5h/task; 10K tasks = 25,000h. Bootstrap, not terminal.',
    justifications: { m1: 'Low: every additional hour usually requires a robot, an operator, and a task setup', m2: 'BC models scale somewhat with compute, but returns bottlenecked by demonstration diversity not FLOPs', m3: 'Modern BC generalizes better than classic LfD but still degrades quickly out of distribution', m4: 'Poor unless data are carefully retargeted or normalized', m5: 'Weak: each new task typically needs fresh demonstrations', m6: 'Sim can pretrain policies but real demonstrations remain the binding constraint', m7: 'Excellent: cloned policies are usually lightweight and reactive', m8: 'Only moderately aligned: learns from data, but the data source itself is labor intensive' } },
];

// Dataset comparison data
export interface DatasetComparison {
  name: string;
  hours: number;
  type: string;
  source: string;
  year: string;
}

export const datasetComparisons: DatasetComparison[] = [
  { name: 'DreamDojo', hours: 44711, type: 'Human egocentric video', source: 'NVIDIA', year: '2026' },
  { name: 'EgoScale', hours: 20854, type: 'Action-labeled ego video', source: 'NVIDIA', year: '2026' },
  { name: 'NVIDIA Cosmos', hours: 20000000, type: 'Robotics + driving video', source: 'NVIDIA', year: '2025' },
  { name: 'Ego4D', hours: 3670, type: 'Egocentric video', source: 'Meta + consortium', year: '2024' },
  { name: 'EgoVerse', hours: 1362, type: 'Multi-lab ego robot data', source: '4 labs + 3 partners', year: '2026' },
  { name: '1XWM Human', hours: 900, type: 'Egocentric human', source: '1X Technologies', year: '2025' },
  { name: 'EgoDex', hours: 829, type: 'Tabletop tasks', source: 'Apple', year: '2025' },
  { name: 'Figure Helix', hours: 500, type: 'Teleoperated robot', source: 'Figure AI', year: '2025' },
  { name: '1XWM Robot', hours: 70, type: 'Robot fine-tune', source: '1X Technologies', year: '2025' },
];

// Key ratios
export const keyRatios = [
  { comparison: 'EgoScale vs EgoVerse hours', value: 15.31, unit: 'x' },
  { comparison: 'DreamDojo vs EgoScale', value: 2.14, unit: 'x' },
  { comparison: 'DreamDojo vs Figure Helix teleop', value: 89.4, unit: 'x' },
  { comparison: 'EgoScale vs Figure Helix teleop', value: 41.7, unit: 'x' },
  { comparison: '1XWM human vs robot hours', value: 12.9, unit: 'x' },
  { comparison: 'EgoScale vs 1XWM human', value: 23.2, unit: 'x' },
];

// Ship-Now vs Scale-to-2030 dual scoring
export interface DualScore {
  method: string;
  shipNow: number;
  scale2030: number;
}

export const dualScores: DualScore[] = [
  { method: 'Human-video pretrain + retarget', shipNow: 95, scale2030: 110 },
  { method: 'Cross-embodiment foundation', shipNow: 94, scale2030: 110 },
  { method: 'UMI/DexCap/teleop', shipNow: 101, scale2030: 76 },
  { method: 'World models', shipNow: 78, scale2030: 101 },
  { method: 'Hybrid VLA + reactive', shipNow: 96, scale2030: 94 },
  { method: 'ACT/BC (behavior cloning)', shipNow: 97, scale2030: 74 },
  { method: 'Pure VLA', shipNow: 77, scale2030: 88 },
  { method: 'Diffusion/flow', shipNow: 89, scale2030: 78 },
  { method: 'Planner + skills', shipNow: 86, scale2030: 82 },
  { method: 'Sim RL + sim-to-real', shipNow: 76, scale2030: 80 },
];

// Control-loop comparison
export const controlLoops = [
  { system: 'Helix 02 S0 (whole-body)', rate: 1000, cycleMs: 1, use: 'Balance/contact execution' },
  { system: 'Helix S1 (visuomotor)', rate: 200, cycleMs: 5, use: 'Fast visuomotor control' },
  { system: 'pi0 action output', rate: 50, cycleMs: 20, use: 'Continuous motor commands' },
  { system: 'Helix S2 (semantic)', rate: 8, cycleMs: 125, use: 'Semantic reasoning' },
  { system: '1XWM planning', rate: 0.083, cycleMs: 12000, use: 'Planning/evaluation' },
];

// Top 10 Alpha rankings (combined public + private)
export interface AlphaCompany {
  rank: number;
  company: string;
  type: 'Public' | 'Private';
  ticker?: string;
  alpha: number;
  marketCap?: string;
  valuation?: string;
  keyFact: string;
}

export const topAlpha: AlphaCompany[] = [
  { rank: 1, company: 'NVIDIA', type: 'Public', ticker: 'NVDA', alpha: 111, marketCap: '$4.52T', keyFact: 'Cosmos 20M+ hrs, GR00T models, EgoScale, DreamDojo' },
  { rank: 2, company: 'Tesla', type: 'Public', ticker: 'TSLA', alpha: 111, marketCap: '$1.53T', keyFact: 'FSD→Optimus transfer, highest variance play' },
  { rank: 3, company: 'Figure AI', type: 'Private', alpha: 111, valuation: '$39B', keyFact: 'Helix 02, BMW: 1,250+ hrs, 90K+ parts handled, $2B raised' },
  { rank: 4, company: 'Alphabet', type: 'Public', ticker: 'GOOGL', alpha: 108, marketCap: '$3.73T', keyFact: 'RT-2, Open X-Embodiment, Gemini Robotics' },
  { rank: 5, company: 'Skild AI', type: 'Private', alpha: 107, valuation: '>$14B', keyFact: 'Omni-bodied intelligence, $1.7B+ raised' },
  { rank: 6, company: 'Amazon', type: 'Public', ticker: 'AMZN', alpha: 105, marketCap: '$2.28T', keyFact: 'Warehouse robotics at scale + Digit deployment' },
  { rank: 7, company: 'Scale AI', type: 'Private', alpha: 105, valuation: 'up to $25B', keyFact: 'Robotics data labeling + EgoVerse partner' },
  { rank: 8, company: 'Physical Intelligence', type: 'Private', alpha: 100, valuation: '$5.6B', keyFact: 'pi0: 10,000+ hrs robot data, $600M raised' },
  { rank: 9, company: 'Microsoft', type: 'Public', ticker: 'MSFT', alpha: 99, marketCap: '$3.01T', keyFact: 'Azure robotics + OpenAI robotics alignment' },
  { rank: 10, company: '1X Technologies', type: 'Private', alpha: 99, valuation: '>$125M raised', keyFact: '14B world model, 900h human + 70h robot data' },
];

// Full public companies list
export interface PublicCompany {
  company: string;
  ticker: string;
  country: string;
  marketCap: string;
  alpha: number;
}

export const publicCompanies: PublicCompany[] = [
  { company: 'NVIDIA', ticker: 'NVDA', country: 'US', marketCap: '$4.52T', alpha: 111 },
  { company: 'Tesla', ticker: 'TSLA', country: 'US', marketCap: '$1.53T', alpha: 111 },
  { company: 'Alphabet', ticker: 'GOOGL', country: 'US', marketCap: '$3.73T', alpha: 108 },
  { company: 'Amazon', ticker: 'AMZN', country: 'US', marketCap: '$2.28T', alpha: 105 },
  { company: 'Microsoft', ticker: 'MSFT', country: 'US', marketCap: '$3.01T', alpha: 99 },
  { company: 'Symbotic', ticker: 'SYM', country: 'US', marketCap: '$30.7B', alpha: 97 },
  { company: 'Hon Hai (Foxconn)', ticker: '2317.TW', country: 'Taiwan', marketCap: '$94B', alpha: 97 },
  { company: 'TSMC', ticker: 'TSM', country: 'Taiwan', marketCap: '$1.58T', alpha: 92 },
  { company: 'Intuitive Surgical', ticker: 'ISRG', country: 'US', marketCap: '$175B', alpha: 86 },
  { company: 'Hyundai Motor', ticker: '005380.KS', country: 'South Korea', marketCap: '$85B', alpha: 86 },
  { company: 'UBTECH Robotics', ticker: '9880.HK', country: 'China', marketCap: '$6.83B', alpha: 85 },
  { company: 'AMD', ticker: 'AMD', country: 'US', marketCap: '$334B', alpha: 80 },
  { company: 'Qualcomm', ticker: 'QCOM', country: 'US', marketCap: '$143B', alpha: 79 },
  { company: 'ABB', ticker: 'ABBN.SW', country: 'Switzerland', marketCap: '$157.5B', alpha: 79 },
  { company: 'Fanuc', ticker: '6954.T', country: 'Japan', marketCap: '$36.8B', alpha: 77 },
  { company: 'Serve Robotics', ticker: 'SERV', country: 'US', marketCap: '$794M', alpha: 75 },
  { company: 'Yaskawa', ticker: '6506.T', country: 'Japan', marketCap: '$7.62B', alpha: 73 },
  { company: 'Sony', ticker: '6758.T', country: 'Japan', marketCap: '$129B', alpha: 67 },
  { company: 'Harmonic Drive', ticker: '6324.T', country: 'Japan', marketCap: '$2.5B', alpha: 67 },
  { company: 'Keyence', ticker: '6861.T', country: 'Japan', marketCap: '$94B', alpha: 66 },
  { company: 'Nabtesco', ticker: '6268.T', country: 'Japan', marketCap: '$3.5B', alpha: 66 },
  { company: 'BMW', ticker: 'BMW.DE', country: 'Germany', marketCap: '$53B', alpha: 65 },
  { company: 'Cognex', ticker: 'CGNX', country: 'US', marketCap: '$8.45B', alpha: 64 },
  { company: 'Nidec', ticker: '6594.T', country: 'Japan', marketCap: '$16.66B', alpha: 62 },
  { company: 'Ouster', ticker: 'OUST', country: 'US', marketCap: '$1.55B', alpha: 57 },
];

// Full private companies list
export interface PrivateCompany {
  company: string;
  country: string;
  totalRaised: string;
  valuation: string;
  alpha: number;
}

export const privateCompanies: PrivateCompany[] = [
  { company: 'Figure AI', country: 'US', totalRaised: '~$2B', valuation: '$39B', alpha: 111 },
  { company: 'Skild AI', country: 'US', totalRaised: '~$1.7B+', valuation: '>$14B', alpha: 107 },
  { company: 'Scale AI', country: 'US', totalRaised: 'N/D', valuation: 'up to $25B', alpha: 105 },
  { company: 'Physical Intelligence', country: 'US', totalRaised: '~$1B', valuation: '$5.6B', alpha: 100 },
  { company: '1X Technologies', country: 'Norway', totalRaised: '>$125M', valuation: 'N/D', alpha: 99 },
  { company: 'Applied Intuition', country: 'US', totalRaised: 'N/D', valuation: '$15B', alpha: 96 },
  { company: 'Genesis AI', country: 'France', totalRaised: '$105M', valuation: 'N/D', alpha: 93 },
  { company: 'NEURA Robotics', country: 'Germany', totalRaised: '>$1.4B', valuation: 'N/D', alpha: 90 },
  { company: 'Foxglove', country: 'US', totalRaised: '$40M', valuation: 'N/D', alpha: 90 },
  { company: 'Nominal', country: 'US', totalRaised: '$75M', valuation: 'N/D', alpha: 90 },
  { company: 'Unitree Robotics', country: 'China', totalRaised: 'N/D', valuation: 'up to $7B IPO', alpha: 89 },
  { company: 'Asimov', country: 'US', totalRaised: 'Seed', valuation: 'N/D', alpha: 89 },
  { company: 'Rerun', country: 'Sweden', totalRaised: '$20.2M', valuation: 'N/D', alpha: 86 },
  { company: 'Formic', country: 'US', totalRaised: '$53.9M', valuation: 'N/D', alpha: 86 },
  { company: 'Agility Robotics', country: 'US', totalRaised: '~$641M', valuation: '~$2.1B', alpha: 85 },
  { company: 'Apptronik', country: 'US', totalRaised: '~$935M', valuation: '~$5B', alpha: 81 },
  { company: 'Sanctuary AI', country: 'Canada', totalRaised: '>$140M', valuation: 'N/D', alpha: 81 },
  { company: 'LimX Dynamics', country: 'China', totalRaised: '$200M', valuation: 'N/D', alpha: 80 },
  { company: 'AgiBot', country: 'China', totalRaised: 'N/D', valuation: 'N/D', alpha: 78 },
  { company: 'Fourier Intelligence', country: 'China', totalRaised: 'N/D', valuation: 'N/D', alpha: 76 },
  { company: 'RealSense', country: 'US', totalRaised: '$50M', valuation: 'N/D', alpha: 75 },
  { company: 'Sunday Robotics', country: 'US', totalRaised: '$165M', valuation: '$1.15B', alpha: 74 },
  { company: 'Robust.AI', country: 'US', totalRaised: '~$45M', valuation: 'N/D', alpha: 71 },
  { company: 'Booster Robotics', country: 'China', totalRaised: '~$70M', valuation: 'N/D', alpha: 70 },
  { company: 'HaptX', country: 'US', totalRaised: '>$58M', valuation: 'N/D', alpha: 46 },
];

// EgoVerse structural metrics
export const egoVerseMetrics = {
  hours: 1362,
  episodes: 80000,
  tasks: 1965,
  scenes: 240,
  demonstrators: 2087,
  labs: 4,
  industryPartners: 3,
  avgEpisodeLength: 61.3,
  tasksPerScene: 8.19,
  episodesPerTask: 40.71,
  hoursPerScene: 5.67,
};

// EgoScale key facts
export const egoScaleMetrics = {
  hours: 20854,
  rSquared: 0.9983,
  successImprovement: 54,
  dof: 22,
};

// Timeline milestones
export const timeline = [
  { year: '2026', milestone: 'VLAs and teleop-heavy systems win near-term pilots', detail: 'Figure Helix 02, GR00T N1.5, pi0 deployed. Teleop is the primary data source.' },
  { year: '2027', milestone: 'Cross-embodiment pretraining becomes the moat', detail: 'Industrial deployment datasets (BMW, Amazon warehouses) become competitive advantages.' },
  { year: '2028', milestone: 'Egocentric human data reduces teleop dependency', detail: 'EgoScale/DreamDojo-scale datasets prove 40-90x more efficient than pure teleop.' },
  { year: '2029', milestone: 'World models convert compute into capability', detail: 'Synthetic trajectories amplify real data 10-100x. 1X, NVIDIA, Genesis leading.' },
  { year: '2030', milestone: 'The winning stack crystallizes', detail: 'Cross-embodiment + human-video pretrain + world-model amplification + edge inference.' },
];

// Winning formula
export const winningFormula = [
  'Cross-embodiment foundation models (Open X / GR00T)',
  'Egocentric human-video pretraining (EgoScale / DreamDojo)',
  'World-model synthetic amplification (Cosmos / 1XWM)',
  'Robotics-native data infrastructure (Foxglove / Build AI / Nominal)',
  'Cheap deployment-time edge inference',
];

// ── Frontier Lab Profiles ──
export interface FrontierLab {
  name: string;
  coreApproach: string;
  whyItMatters: string;
  verdict: string;
  scalingRank: number;
  keyMethods: string[];
}

export const frontierLabs: FrontierLab[] = [
  { name: 'NVIDIA Robotics Labs', coreApproach: 'Stacked scaling: VLA foundation models (GR00T N1/N1.5/N1.6) + human-video pretraining (EgoScale, DreamDojo) + world models (Cosmos 20M+ hrs) + synthetic trajectory generation (DreamGen) + open-weight tooling', whyItMatters: 'Strongest public evidence that robotics can move from "collect more teleop" to "pretrain broadly, then adapt cheaply." Has explicit log-linear scaling law (R²=0.9983).', verdict: 'Best published scaling story. Combines broad data sources, explicit compute leverage, cross-embodiment transfer, synthetic trajectory amplification, and actual benchmark improvements.', scalingRank: 1, keyMethods: ['Human-video pretraining', 'World models', 'Synthetic trajectories', 'Cross-embodiment VLA', 'Open data/models'] },
  { name: 'Figure AI', coreApproach: 'Commercial end-to-end VLA stack: Helix (System 1/System 2), single neural network/one set of weights for many behaviors, pixels-to-actions, BMW deployment (1,250+ hrs, 90K+ parts), Brookfield partnership for home-scale data', whyItMatters: 'Strongest public evidence of translating end-to-end learning into real deployment metrics. Same architecture transferred from logistics to laundry/dishwasher with data-only changes.', verdict: 'Best pure humanoid OEM execution of the scaling thesis. Strongest commercial humanoid end-to-end learner in public view.', scalingRank: 2, keyMethods: ['End-to-end VLA', 'Teleop imitation', 'Human-video pretraining (pivot)', 'Real-world data flywheel'] },
  { name: '1X Technologies', coreApproach: 'World-model-first home robotics: Redwood AI for manipulation, RL locomotion, 1X World Model (14B params, 900h human + 70h robot data) as cognitive core, product mix of autonomy + expert supervision', whyItMatters: 'One of few product companies saying the world model itself should become a central cognitive layer, not just an offline evaluator. Targeting home — the hardest generalization environment.', verdict: 'Most interesting world-model-centric product thesis. Less public benchmark detail than NVIDIA/Figure but strongest product thesis if world models win.', scalingRank: 3, keyMethods: ['World models (14B)', 'RL locomotion', 'Egocentric human pretraining', 'Learned evaluation'] },
  { name: 'Tesla Optimus', coreApproach: 'Transfer of FSD vision + planning + inference philosophy into humanoids. Multimodal foundation models, end-to-end RL + imitation learning, high-fidelity simulation. NeurIPS 2025 talks on "Building Foundational Models for Robotics at Tesla."', whyItMatters: 'May eventually have best manufacturing scale, most aggressive compute culture, deep auto-labeling instincts, custom inference hardware, and enormous experience deploying AI in physical world.', verdict: 'Highest-variance name on the board. Very likely top-tier if internal stack matches hiring signals, but today under-documented relative to Figure and NVIDIA.', scalingRank: 4, keyMethods: ['FSD transfer', 'Multimodal foundation models', 'Simulation', 'RL + imitation'] },
  { name: 'Sunday Robotics', coreApproach: 'Skill Capture Glove instead of teleoperation, distributed "Memory Developers" collecting household behavior, push from imitation to intuition, home-first skills. Shipped 2,000+ gloves.', whyItMatters: 'Trying to build a distributed household behavior archive without requiring teleoperated robot control during collection. Important because teleop is expensive and morphologically awkward for homes at scale.', verdict: 'Best pure novel-data-collection thesis. Very promising data flywheel but earlier and less benchmarked than the other four.', scalingRank: 5, keyMethods: ['Glove-based data capture', 'Distributed collection', 'Imitation-to-intuition'] },
];

// ── Data Company Tiers ──
export interface DataCompanyTier {
  tier: number;
  name: string;
  description: string;
  companies: string[];
}

export const dataCompanyTiers: DataCompanyTier[] = [
  { tier: 1, name: 'Direct Data Flywheel Enablers', description: 'Generate egocentric/first-person human action data, multimodal aligned streams, diverse real environments', companies: ['Build AI', 'Human Archive', 'Asimov', 'Oceanveo', 'Sensei Robotics', 'Ropedia', 'MeckaAI', 'GenrobotAI'] },
  { tier: 2, name: 'Critical Data Infrastructure', description: 'Observability, curation, analytics, annotation workflows around the winning method', companies: ['Foxglove', 'Rerun', 'Roboto AI', 'Neuracore', 'Orbifold AI', 'Labelbox', 'Scale AI', 'Nominal'] },
  { tier: 3, name: 'Operations & Services', description: 'Deployment support, workforce, processing layer', companies: ['DeepReach AI', 'micro1', 'Surge AI'] },
  { tier: 4, name: 'Insufficient Evidence', description: 'Too little public evidence to evaluate', companies: ['GI Labs', 'T* (stealth)', 'microAGI'] },
];

// ── Scaling Loop ──
export const scalingLoop = [
  'Human-video pretraining at internet scale',
  'Latent/action alignment with small robot dataset',
  'World model / synthetic trajectory expansion',
  'End-to-end policy post-training',
  'Autonomous rollout collection',
  'Learned evaluation',
  'Repeat (flywheel)',
];

// ── End-to-End Learning Report Method Rankings ──
export interface E2EMethodRank {
  rank: number;
  method: string;
  bestExamples: string;
  whyScales: string;
}

export const e2eMethodRanks: E2EMethodRank[] = [
  { rank: 1, method: 'Human-video pretraining + small robot alignment', bestExamples: 'NVIDIA EgoScale, Figure Go-Big, DreamDojo', whyScales: 'Human data is cheaper and broader than robot teleop' },
  { rank: 2, method: 'World-model pretraining + policy distillation', bestExamples: '1X World Model, NVIDIA DreamDojo', whyScales: 'Converts expensive real-world trials into cheaper model-space search' },
  { rank: 3, method: 'Synthetic trajectory generation from world models', bestExamples: 'NVIDIA GR00T-Dreams, DreamGen', whyScales: 'Replaces human data generation with compute' },
  { rank: 4, method: 'Learned evaluator / world simulator for policy selection', bestExamples: '1X WM evaluation stack', whyScales: 'Shrinks costly real-world evaluation loops' },
  { rank: 5, method: 'VPT-style IDM → FDM autoregressive action modeling', bestExamples: 'OpenAI VPT, Standard Intelligence FDM-1', whyScales: 'Action labels become bootstrappable; unlabeled video trainable' },
  { rank: 6, method: 'RL for locomotion/mobile manipulation', bestExamples: '1X Redwood mobility, Tesla, NVIDIA', whyScales: 'Compute-heavy, good for low-level control' },
  { rank: 7, method: 'Human-to-robot paired video transfer', bestExamples: 'EgoScale mid-training, Figure transfer', whyScales: 'More sample-efficient than pure teleop' },
  { rank: 8, method: 'End-to-end VLA on robot data only', bestExamples: 'Figure Helix, GR00T, Redwood', whyScales: 'Powerful but data-constrained if only robot trajectories' },
  { rank: 9, method: 'Classic teleop imitation learning', bestExamples: 'Almost all current teams', whyScales: 'Strong local performance, poor long-run scaling economics' },
  { rank: 10, method: 'Modular trajectory planning stacks', bestExamples: 'Legacy robotics stacks', whyScales: 'Useful for safety but least aligned with Bitter Lesson' },
];

// ── Key Research Papers/Benchmarks ──
export const keyBenchmarks = [
  { name: 'RT-2', metric: 'Unseen task success', before: 32, after: 62, unit: '%', source: 'Google DeepMind' },
  { name: 'RT-2 emergent reasoning', metric: 'Emergent skill improvement', value: '3x+', source: 'Google DeepMind' },
  { name: 'Diffusion Policy', metric: 'Avg improvement over prior baselines', value: 46.9, unit: '%', source: 'Toyota Research' },
  { name: 'EgoScale scaling law', metric: 'R-squared', value: 0.9983, source: 'NVIDIA' },
  { name: 'EgoScale avg improvement', metric: 'Task success over baseline', value: 54, unit: '%', source: 'NVIDIA' },
  { name: 'Open X-Embodiment', metric: 'Robot types / institutions', value: '22 robots, 21 institutions, 527 skills, 1M+ trajectories', source: 'RT-X consortium' },
  { name: 'OpenVLA', metric: 'Model size / demos', value: '7B model, 970K real demonstrations', source: 'Stanford' },
  { name: 'Physical Intelligence pi0', metric: 'Training data', value: '10,000+ hours of robot data', source: 'Physical Intelligence' },
  { name: 'Standard Intelligence FDM-1', metric: 'IDM training / corpus / latency', value: '40K hrs labeled, 11M hrs unlabeled, 11ms inference', source: 'Standard Intelligence' },
  { name: 'Octo', metric: 'Pretraining episodes', value: '~800,000 robot episodes', source: 'Berkeley' },
];

// ── Validation Addendum Calculations ──
export const taskCalculations = [
  { label: 'Task coverage via imitation', calc: '50 demos/task × 3 min = 2.5h/task; 10K tasks = 25,000h', implication: 'Teleop-only approach is bootstrap, not terminal' },
  { label: '20-operator team throughput', calc: '25,000h / (20 ops × 5h/day) = 250 calendar days', implication: 'Almost a year for 10K tasks with dedicated team' },
  { label: '1X human-video leverage', calc: '900h human / 70h robot = 12.9×', implication: 'Human data is 13x cheaper per unit of robot capability' },
  { label: 'DreamDojo vs Figure teleop', calc: '44,711h / 500h = 89.4×', implication: 'Data bottleneck is decisively shifting to human video' },
  { label: 'EgoScale vs 1XWM human', calc: '20,854h / 900h = 23.2×', implication: 'EgoScale is much larger dexterous-human-data result' },
];

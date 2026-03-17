'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SectionWrapper from '../ui/SectionWrapper';
import SectionTitle from '../ui/SectionTitle';

const scenarios = [
  { year: 2028, label: 'Fast Takeoff', usWins: 95, chinaWins: 5, desc: 'US wins decisively. Revenue flywheel ($20B→$200B→$2T) funds massive infrastructure. China can\'t catch up.' },
  { year: 2029, label: '', usWins: 88, chinaWins: 12, desc: 'US maintains strong lead. Western alliance compute supremacy locked in.' },
  { year: 2030, label: '', usWins: 78, chinaWins: 22, desc: 'Gap starts narrowing. China has working DUV fleet. US still has 3-5x compute advantage.' },
  { year: 2031, label: 'Medium', usWins: 65, chinaWins: 35, desc: 'Knife\'s edge. China achieves working EUV in lab. Both sides have significant capacity.' },
  { year: 2032, label: '', usWins: 55, chinaWins: 45, desc: 'Competition intensifies. Taiwan becomes most dangerous flashpoint.' },
  { year: 2033, label: '', usWins: 48, chinaWins: 52, desc: 'China begins production hell with EUV. Fully indigenized DUV at scale.' },
  { year: 2034, label: '', usWins: 42, chinaWins: 58, desc: 'China\'s vertical supply chain advantage growing. Single country vs multi-nation coordination.' },
  { year: 2035, label: 'Slow Takeoff', usWins: 35, chinaWins: 65, desc: 'China catches up or surpasses. Fully vertical supply chain. 7nm + mass volume compensates.' },
];

export default function USChinaRace() {
  const [selectedIdx, setSelectedIdx] = useState(3);
  const scenario = scenarios[selectedIdx];

  return (
    <SectionWrapper id="us-china">
      <SectionTitle
        title="US vs China: The Timeline Determines the Winner"
        subtitle="Fast AI timelines favor the US (infrastructure lead). Slow timelines favor China (vertical supply chain). Drag the slider to explore."
        accent="#f59e0b"
      />

      <div className="rounded-xl border border-white/5 bg-[#12121a] p-6 md:p-8">
        {/* Slider */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-500 mb-2">
            <span>Fast Takeoff (2028)</span>
            <span>AGI Arrival Year</span>
            <span>Slow Takeoff (2035)</span>
          </div>
          <input
            type="range"
            min={0}
            max={scenarios.length - 1}
            value={selectedIdx}
            onChange={(e) => setSelectedIdx(parseInt(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-indigo-500 via-amber-500 to-red-500"
            style={{
              WebkitAppearance: 'none',
            }}
          />
          <div className="text-center mt-2">
            <span className="text-2xl font-bold text-white font-mono">{scenario.year}</span>
            {scenario.label && <span className="ml-2 text-sm text-amber-400">({scenario.label})</span>}
          </div>
        </div>

        {/* Bars */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <motion.div
            key={`us-${selectedIdx}`}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: scenario.usWins > 50 ? 1 : 0.5 }}
            className={`rounded-xl p-6 border transition-all ${
              scenario.usWins > 50
                ? 'border-indigo-500/30 bg-indigo-500/5'
                : 'border-white/5 bg-white/[0.02]'
            }`}
          >
            <div className="text-sm text-indigo-400 font-semibold uppercase mb-2">United States + Allies</div>
            <div className="text-4xl font-bold text-white mb-3">{scenario.usWins}%</div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${scenario.usWins}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <ul className="space-y-1 text-sm text-slate-400">
              <li>140+ EUV tools installed</li>
              <li>$600B annual CapEx</li>
              <li>TSMC, Samsung, Intel foundries</li>
              <li>Multi-country coordination cost</li>
            </ul>
          </motion.div>

          <motion.div
            key={`cn-${selectedIdx}`}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: scenario.chinaWins > 50 ? 1 : 0.5 }}
            className={`rounded-xl p-6 border transition-all ${
              scenario.chinaWins > 50
                ? 'border-red-500/30 bg-red-500/5'
                : 'border-white/5 bg-white/[0.02]'
            }`}
          >
            <div className="text-sm text-red-400 font-semibold uppercase mb-2">China</div>
            <div className="text-4xl font-bold text-white mb-3">{scenario.chinaWins}%</div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-red-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${scenario.chinaWins}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <ul className="space-y-1 text-sm text-slate-400">
              <li>SMIC 7nm at 60K wafers/mo</li>
              <li>Huawei Ascend 1.6M dies/yr</li>
              <li>Fully vertical ambition</li>
              <li>Single-country coordination</li>
            </ul>
          </motion.div>
        </div>

        {/* Scenario description */}
        <motion.div
          key={selectedIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg bg-white/[0.03] border border-white/5 p-4"
        >
          <p className="text-slate-300">{scenario.desc}</p>
        </motion.div>

        {/* Key quote */}
        <div className="mt-6 p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
          <p className="text-amber-200 italic text-sm">
            &ldquo;Fast timelines, the US wins; long timelines, China wins.&rdquo;
          </p>
          <p className="text-xs text-amber-400/60 mt-1">— Dylan Patel, SemiAnalysis</p>
        </div>
      </div>
    </SectionWrapper>
  );
}

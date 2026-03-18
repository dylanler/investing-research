'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SectionWrapper from '../ui/SectionWrapper';
import SectionTitle from '../ui/SectionTitle';

const scenarios = [
  { year: 2028, label: 'Fast Takeoff', usWins: 95, chinaWins: 5, desc: 'US wins decisively. Revenue flywheel ($20B\u2192$200B\u2192$2T) funds massive infrastructure. China can\u2019t catch up.' },
  { year: 2029, label: '', usWins: 88, chinaWins: 12, desc: 'US maintains strong lead. Western alliance compute supremacy locked in.' },
  { year: 2030, label: '', usWins: 78, chinaWins: 22, desc: 'Gap starts narrowing. China has working DUV fleet. US still has 3\u20135x compute advantage.' },
  { year: 2031, label: 'Medium', usWins: 65, chinaWins: 35, desc: 'Knife\u2019s edge. China achieves working EUV in lab. Both sides have significant capacity.' },
  { year: 2032, label: '', usWins: 55, chinaWins: 45, desc: 'Competition intensifies. Taiwan becomes most dangerous flashpoint.' },
  { year: 2033, label: '', usWins: 48, chinaWins: 52, desc: 'China begins production with indigenous EUV. Fully indigenized DUV at scale.' },
  { year: 2034, label: '', usWins: 42, chinaWins: 58, desc: 'China\u2019s vertical supply chain advantage grows. Single country vs multi-nation coordination.' },
  { year: 2035, label: 'Slow Takeoff', usWins: 35, chinaWins: 65, desc: 'China catches up or surpasses. Fully vertical supply chain. 7nm + mass volume compensates.' },
];

export default function USChinaRace() {
  const [selectedIdx, setSelectedIdx] = useState(3);
  const scenario = scenarios[selectedIdx];

  return (
    <SectionWrapper id="us-china">
      <SectionTitle
        number="08"
        title="US vs China: The Timeline Determines the Winner"
        subtitle="Fast AI timelines favor the US (infrastructure lead). Slow timelines favor China (vertical supply chain). Drag the slider to explore."
      />

      <div style={{ border: '1px solid var(--ink-100)', background: 'var(--surface-raised)', padding: 'var(--space-xl)', borderRadius: '2px' }}>
        {/* Slider */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="flex justify-between" style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', marginBottom: 'var(--space-sm)' }}>
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
            className="w-full"
          />
          <div className="text-center" style={{ marginTop: 'var(--space-sm)' }}>
            <span className="font-display" style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--ink-950)' }}>{scenario.year}</span>
            {scenario.label && <span style={{ marginLeft: 'var(--space-sm)', fontSize: 'var(--text-sm)', color: 'var(--ink-400)' }}>({scenario.label})</span>}
          </div>
        </div>

        {/* Comparison bars */}
        <div className="grid md:grid-cols-2" style={{ gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
          <div style={{ padding: 'var(--space-lg)', border: `1px solid ${scenario.usWins > 50 ? 'var(--accent)' : 'var(--ink-100)'}`, borderRadius: '2px', opacity: scenario.usWins > 50 ? 1 : 0.6, transition: 'all 300ms' }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-500)', marginBottom: 'var(--space-sm)' }}>United States + Allies</div>
            <div className="font-display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--ink-950)', marginBottom: 'var(--space-md)' }}>{scenario.usWins}%</div>
            <div style={{ height: '4px', background: 'var(--ink-100)', borderRadius: '2px', overflow: 'hidden', marginBottom: 'var(--space-md)' }}>
              <motion.div style={{ height: '100%', background: 'var(--accent)', borderRadius: '2px' }} animate={{ width: `${scenario.usWins}%` }} transition={{ duration: 0.4 }} />
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px', fontSize: 'var(--text-sm)', color: 'var(--ink-500)' }}>
              <li>140+ EUV tools installed</li>
              <li>$600B annual CapEx</li>
              <li>TSMC, Samsung, Intel foundries</li>
            </ul>
          </div>

          <div style={{ padding: 'var(--space-lg)', border: `1px solid ${scenario.chinaWins > 50 ? 'var(--danger)' : 'var(--ink-100)'}`, borderRadius: '2px', opacity: scenario.chinaWins > 50 ? 1 : 0.6, transition: 'all 300ms' }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-500)', marginBottom: 'var(--space-sm)' }}>China</div>
            <div className="font-display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--ink-950)', marginBottom: 'var(--space-md)' }}>{scenario.chinaWins}%</div>
            <div style={{ height: '4px', background: 'var(--ink-100)', borderRadius: '2px', overflow: 'hidden', marginBottom: 'var(--space-md)' }}>
              <motion.div style={{ height: '100%', background: 'var(--danger)', borderRadius: '2px' }} animate={{ width: `${scenario.chinaWins}%` }} transition={{ duration: 0.4 }} />
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px', fontSize: 'var(--text-sm)', color: 'var(--ink-500)' }}>
              <li>SMIC 7nm at 60K wafers/mo</li>
              <li>Huawei Ascend 1.6M dies/yr</li>
              <li>Fully vertical ambition</li>
            </ul>
          </div>
        </div>

        {/* Description */}
        <motion.div key={selectedIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 'var(--space-md)', background: 'var(--surface-sunken)', borderRadius: '2px' }}>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--ink-700)', margin: 0 }}>{scenario.desc}</p>
        </motion.div>

        {/* Quote */}
        <blockquote style={{ borderLeft: '3px solid var(--ink-200)', paddingLeft: 'var(--space-md)', marginTop: 'var(--space-lg)', marginBottom: 0, marginLeft: 0, marginRight: 0 }}>
          <p className="font-display" style={{ fontSize: 'var(--text-base)', color: 'var(--ink-700)', fontStyle: 'italic', margin: 0 }}>
            &ldquo;Fast timelines, the US wins; long timelines, China wins.&rdquo;
          </p>
          <cite style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', fontStyle: 'normal', marginTop: 'var(--space-xs)', display: 'block' }}>
            Dylan Patel, SemiAnalysis
          </cite>
        </blockquote>
      </div>
    </SectionWrapper>
  );
}

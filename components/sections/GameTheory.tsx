'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SectionWrapper from '../ui/SectionWrapper';
import SectionTitle from '../ui/SectionTitle';
import { gameTheoryData } from '@/data/gameTheory';

export default function GameTheory() {
  const [activeGame, setActiveGame] = useState(0);
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);
  const game = gameTheoryData[activeGame];

  return (
    <SectionWrapper id="game-theory">
      <SectionTitle
        title="Game Theory of the AI Compute Race"
        subtitle="Strategic dynamics between labs, chip makers, and nations. Hover over cells to explore payoffs."
      />

      {/* Game selector tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginBottom: 'var(--space-xl)' }}>
        {gameTheoryData.map((g, i) => (
          <button
            key={g.id}
            onClick={() => { setActiveGame(i); setHoveredCell(null); }}
            style={{
              padding: 'var(--space-xs) var(--space-md)',
              borderRadius: '2px',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              transition: 'all 0.2s',
              cursor: 'pointer',
              border: 'none',
              borderBottom: i === activeGame ? '2px solid var(--accent)' : '2px solid transparent',
              background: i === activeGame ? 'var(--surface-sunken)' : 'transparent',
              color: i === activeGame ? 'var(--ink-950)' : 'var(--ink-500)',
            }}
          >
            {g.title}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-xl)' }} className="lg:grid-cols-2">
        {/* Matrix */}
        <div
          style={{
            border: '1px solid var(--ink-100)',
            padding: 'var(--space-lg)',
            background: 'var(--surface-page)',
          }}
        >
          <h3
            className="font-display"
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 600,
              color: 'var(--ink-950)',
              marginBottom: 'var(--space-xs)',
              marginTop: 0,
            }}
          >
            {game.title}
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)', marginBottom: 'var(--space-lg)', marginTop: 0 }}>
            {game.description}
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: 'var(--space-xs)', fontSize: 'var(--text-sm)', color: 'var(--ink-400)' }} />
                  <th style={{ padding: 'var(--space-xs)', fontSize: 'var(--text-sm)', color: 'var(--ink-400)' }} />
                  <th
                    colSpan={2}
                    style={{
                      textAlign: 'center',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 400,
                      color: 'var(--accent)',
                      paddingBottom: 'var(--space-xs)',
                    }}
                  >
                    {game.players[1]}
                  </th>
                </tr>
                <tr>
                  <th style={{ padding: 'var(--space-xs)' }} />
                  <th style={{ padding: 'var(--space-xs)' }} />
                  {game.strategies[1].map((s) => (
                    <th
                      key={s}
                      style={{
                        padding: 'var(--space-xs)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--ink-500)',
                        fontWeight: 400,
                        borderBottom: '1px solid var(--ink-100)',
                      }}
                    >
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {game.strategies[0].map((rowStrategy, r) => (
                  <tr key={rowStrategy}>
                    {r === 0 && (
                      <td
                        rowSpan={game.strategies[0].length}
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 400,
                          color: 'var(--ink-700)',
                          verticalAlign: 'middle',
                          paddingRight: 'var(--space-xs)',
                        }}
                      >
                        <div style={{ fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>{game.players[0]}</div>
                      </td>
                    )}
                    <td style={{ padding: 'var(--space-xs)', fontSize: 'var(--text-xs)', color: 'var(--ink-500)', borderBottom: '1px solid var(--ink-100)' }}>
                      {rowStrategy}
                    </td>
                    {game.strategies[1].map((_, c) => {
                      const isNash = r === game.nashEquilibrium[0] && c === game.nashEquilibrium[1];
                      const isActual = r === game.actualOutcome[0] && c === game.actualOutcome[1];
                      const isHovered = hoveredCell && hoveredCell[0] === r && hoveredCell[1] === c;
                      const isRowHover = hoveredCell && hoveredCell[0] === r;
                      const isColHover = hoveredCell && hoveredCell[1] === c;

                      let bg = 'transparent';
                      if (isHovered) bg = 'var(--surface-sunken)';
                      else if (isRowHover || isColHover) bg = 'var(--surface-raised)';

                      return (
                        <td
                          key={c}
                          style={{
                            padding: 'var(--space-sm)',
                            textAlign: 'center',
                            borderBottom: '1px solid var(--ink-100)',
                            borderLeft: '1px solid var(--ink-100)',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                            background: bg,
                          }}
                          onMouseEnter={() => setHoveredCell([r, c])}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <span style={{ color: 'var(--ink-700)', fontWeight: 600 }}>{game.payoffs[r][c][0]}</span>
                            <span style={{ color: 'var(--ink-300)' }}>,</span>
                            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{game.payoffs[r][c][1]}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '4px' }}>
                            {isNash && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  padding: '1px 6px',
                                  border: '1px solid var(--ink-200)',
                                  color: 'var(--ink-600)',
                                  background: 'var(--surface-raised)',
                                  letterSpacing: '0.03em',
                                }}
                              >
                                Nash
                              </span>
                            )}
                            {isActual && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  padding: '1px 6px',
                                  border: '1px solid var(--accent)',
                                  color: 'var(--accent)',
                                  background: 'var(--surface-page)',
                                  letterSpacing: '0.03em',
                                }}
                              >
                                Actual
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-md)', fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--ink-700)', display: 'inline-block' }} />
              {game.players[0]}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
              {game.players[1]}
            </div>
          </div>
        </div>

        {/* Lesson */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <motion.div
            key={game.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <blockquote
              style={{
                borderLeft: '3px solid var(--accent)',
                paddingLeft: 'var(--space-lg)',
                margin: 0,
              }}
            >
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--ink-500)',
                  marginBottom: 'var(--space-sm)',
                }}
              >
                Strategic Insight
              </div>
              <p
                style={{
                  color: 'var(--ink-700)',
                  lineHeight: 1.7,
                  fontSize: 'var(--text-lg)',
                  margin: 0,
                }}
              >
                {game.lesson}
              </p>
            </blockquote>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}

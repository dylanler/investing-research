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
        accent="#a855f7"
      />

      {/* Game selector tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {gameTheoryData.map((g, i) => (
          <button
            key={g.id}
            onClick={() => { setActiveGame(i); setHoveredCell(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              i === activeGame
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-white/5 text-slate-400 border border-white/5 hover:border-white/10'
            }`}
          >
            {g.title}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Matrix */}
        <div className="rounded-xl border border-white/5 bg-[#12121a] p-6">
          <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
          <p className="text-sm text-slate-400 mb-6">{game.description}</p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-2 text-sm text-slate-500" />
                  <th className="p-2 text-sm text-slate-500" />
                  <th colSpan={2} className="text-center text-sm font-semibold text-cyan-400 pb-2">{game.players[1]}</th>
                </tr>
                <tr>
                  <th className="p-2" />
                  <th className="p-2" />
                  {game.strategies[1].map((s) => (
                    <th key={s} className="p-2 text-xs text-slate-400 font-normal">{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {game.strategies[0].map((rowStrategy, r) => (
                  <tr key={rowStrategy}>
                    {r === 0 && (
                      <td rowSpan={game.strategies[0].length} className="text-sm font-semibold text-indigo-400 align-middle pr-2 writing-mode-vertical">
                        <div className="transform -rotate-0 whitespace-nowrap text-xs">{game.players[0]}</div>
                      </td>
                    )}
                    <td className="p-2 text-xs text-slate-400">{rowStrategy}</td>
                    {game.strategies[1].map((_, c) => {
                      const isNash = r === game.nashEquilibrium[0] && c === game.nashEquilibrium[1];
                      const isActual = r === game.actualOutcome[0] && c === game.actualOutcome[1];
                      const isHovered = hoveredCell && hoveredCell[0] === r && hoveredCell[1] === c;
                      const isRowHover = hoveredCell && hoveredCell[0] === r;
                      const isColHover = hoveredCell && hoveredCell[1] === c;

                      return (
                        <td
                          key={c}
                          className={`p-3 text-center border border-white/5 rounded-lg cursor-pointer transition-all ${
                            isHovered ? 'bg-white/10' :
                            isRowHover || isColHover ? 'bg-white/[0.03]' : ''
                          }`}
                          onMouseEnter={() => setHoveredCell([r, c])}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-indigo-400 font-bold">{game.payoffs[r][c][0]}</span>
                            <span className="text-slate-600">,</span>
                            <span className="text-cyan-400 font-bold">{game.payoffs[r][c][1]}</span>
                          </div>
                          <div className="flex justify-center gap-1 mt-1">
                            {isNash && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">Nash</span>
                            )}
                            {isActual && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">Actual</span>
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

          <div className="mt-4 flex gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400" /> {game.players[0]}
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> {game.players[1]}
            </div>
          </div>
        </div>

        {/* Lesson */}
        <div className="flex flex-col justify-center">
          <motion.div
            key={game.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-6">
              <div className="text-xs text-purple-400 font-semibold uppercase mb-3">Strategic Insight</div>
              <p className="text-slate-300 leading-relaxed text-lg">{game.lesson}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}

import React from 'react';
import type { ProcessedPlayer } from '../types';
import { Position } from '../types';

interface PlayersTableProps {
    players: ProcessedPlayer[];
    onPlayerClick: (player: ProcessedPlayer) => void;
}

const PositionBadge: React.FC<{ position: Position }> = ({ position }) => {
    const baseClasses = "inline-block px-3 py-1 text-xs font-bold text-white rounded-full uppercase";
    const positionClasses: Record<Position, string> = {
        [Position.GOL]: "bg-gradient-to-r from-yellow-500 to-amber-500",
        [Position.LAT]: "bg-gradient-to-r from-cyan-500 to-blue-500",
        [Position.ZAG]: "bg-gradient-to-r from-indigo-500 to-purple-500",
        [Position.MEI]: "bg-gradient-to-r from-green-500 to-emerald-500",
        [Position.ATA]: "bg-gradient-to-r from-rose-500 to-pink-500",
        [Position.TEC]: "bg-gradient-to-r from-gray-500 to-slate-500",
    };
    return <span className={`${baseClasses} ${positionClasses[position]}`}>{position}</span>;
};

const PlayersTable: React.FC<PlayersTableProps> = ({ players, onPlayerClick }) => {
    return (
        <section className="overflow-hidden rounded-2xl shadow-lg bg-white/95">
            <div className="overflow-x-auto">
                <table className="w-full min-w-max text-left">
                    <thead>
                        <tr className="bg-gradient-to-r from-[#FF8C42] to-[#FFA85C] text-white">
                            <th className="p-4 font-semibold">Posição</th>
                            <th className="p-4 font-semibold">Jogador</th>
                            <th className="p-4 font-semibold">Time</th>
                            <th className="p-4 font-semibold">Potencial</th>
                            <th className="p-4 font-semibold">Média</th>
                            <th className="p-4 font-semibold">M. Básica</th>
                            <th className="p-4 font-semibold">Gols</th>
                            <th className="p-4 font-semibold">Assist.</th>
                            <th className="p-4 font-semibold">Desarmes</th>
                            <th className="p-4 font-semibold">RB</th>
                            <th className="p-4 font-semibold">CA</th>
                            <th className="p-4 font-semibold">CV</th>
                            <th className="p-4 font-semibold">FC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.slice(0, 20).map((player) => (
                            <tr 
                                key={player.id} 
                                className="border-b border-orange-100 hover:bg-orange-50/50 transition-colors cursor-pointer"
                                onClick={() => onPlayerClick(player)}
                            >
                                <td className="p-4"><PositionBadge position={player.posicao} /></td>
                                <td className="p-4 font-medium">{player.nome}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <img src={player.timeEscudo} alt={player.time} className="w-6 h-6 object-contain" />
                                        <span>{player.time}</span>
                                    </div>
                                </td>
                                <td className="p-4 font-bold text-[#FF8C42]">{player.potencial?.toFixed(2) ?? '-'}</td>
                                <td className="p-4">{player.media?.toFixed(2) ?? '-'}</td>
                                <td className="p-4">{player.mediaBasica?.toFixed(2) ?? '-'}</td>
                                <td className="p-4">{player.gols ?? '-'}</td>
                                <td className="p-4">{player.assistencias ?? '-'}</td>
                                <td className="p-4">{player.desarmes ?? '-'}</td>
                                <td className="p-4">{player.roubosDeBola ?? '-'}</td>
                                <td className="p-4">{player.cartoesAmarelos ?? '-'}</td>
                                <td className="p-4">{player.cartoesVermelhos ?? '-'}</td>
                                <td className="p-4">{player.faltasCometidas ?? '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default PlayersTable;
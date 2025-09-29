import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { SG_PROBABILITY_DATA as defaultSgData } from './constants';
import type { FullLineupVariation, ProcessedPlayer, ClubsMap, Match, MarketStatus, ApiPlayer, Club, SgTeam } from './types';
import { Position, POSITIONS_MAP } from './types';
import Header from './components/Header';
import DashboardCharts from './components/DashboardCharts';
import SgSection from './components/SgSection';
import VariationsSection from './components/VariationsSection';
import Filters from './components/Filters';
import PlayersTable from './components/PlayersTable';
import Footer from './components/Footer';
import MatchesSection from './components/MatchesSection';
import ProbableLineup from './components/ProbableLineup';
import PlayerScoutDetail from './components/PlayerScoutDetail';
import Card from './components/Card';
import SgEditModal from './components/SgEditModal';
import Modal from './components/Modal';

const STATUS_MAP: { [key: number]: string } = {
    7: 'Provável',
    2: 'Dúvida',
    3: 'Suspenso',
    5: 'Contundido',
    6: 'Nulo',
};

type Formation = "4-3-3" | "4-4-2" | "3-5-2" | "3-4-3" | "5-3-2" | "4-5-1";
const FORMATIONS: Formation[] = ["4-3-3", "4-4-2", "3-5-2", "3-4-3", "5-3-2", "4-5-1"];

const parseFormation = (formation: Formation): { def: number; mid: number; atk: number } => {
    const [def, mid, atk] = formation.split('-').map(Number);
    return { def, mid, atk };
};

const ProgressBar: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Analisando os craques...</h3>
        <p className="text-gray-600 mb-6">Estamos criando as melhores combinações para você mitar!</p>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden relative">
            <div className="absolute inset-0 w-full h-full">
                <div
                    className="bg-gradient-to-r from-[#FF8C42] to-[#FFA85C] h-4 rounded-full animate-progress-bar"
                ></div>
            </div>
        </div>
        <style>{`
            @keyframes progress-bar-animation {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            .animate-progress-bar {
                animation: progress-bar-animation 1.5s ease-in-out infinite;
            }
        `}</style>
    </div>
);

// --- Generator Step 1: Defense Selection ---
interface DefenseSelectorProps {
    clubs: Club[];
    selectedTeams: Record<number, Formation>;
    onTeamToggle: (teamId: number) => void;
    onFormationChange: (teamId: number, formation: Formation) => void;
    onNext: () => void;
    error: string | null;
    nextButtonText: string;
}

const DefenseSelector: React.FC<DefenseSelectorProps> = ({ clubs, selectedTeams, onTeamToggle, onFormationChange, onNext, error, nextButtonText }) => {
    const selectedTeamIds = Object.keys(selectedTeams).map(Number);
    
    return (
        <div>
            <h3 className="text-center text-lg font-semibold text-gray-700 mb-1">Passo 1: Escolha sua(s) defesa(s) e formação</h3>
            <p className="text-center text-sm text-gray-500 mb-6">Selecione os times que não sofrerão gols (SG) e a tática para cada um.</p>
            
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md relative mb-4" role="alert">
                    <strong className="font-bold">Atenção: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-x-4 gap-y-6">
                {clubs.map(club => {
                    const isSelected = selectedTeamIds.includes(club.id);
                    return (
                        <div key={club.id} className="flex flex-col items-center gap-2">
                             <button
                                onClick={() => onTeamToggle(club.id)}
                                className={`relative w-full flex flex-col items-center justify-center p-3 gap-2 bg-gray-50 rounded-lg shadow-sm hover:shadow-lg hover:bg-white transform hover:-translate-y-1 transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${isSelected ? 'ring-2 ring-offset-2 ring-[#FF8C42]' : ''}`}
                                title={`Escolher ${club.nome}`}
                            >
                                {isSelected && (
                                   <div className="absolute top-1 right-1 bg-white rounded-full flex items-center justify-center">
                                     <i className="fas fa-check-circle text-green-500 text-lg"></i>
                                   </div>
                                )}
                                <img src={club.escudos['60x60']} alt={club.nome} className="w-12 h-12 object-contain"/>
                                <span className="text-xs font-bold text-center text-gray-800">{club.nome}</span>
                            </button>
                             {isSelected && (
                                <div className="w-full">
                                    <label htmlFor={`formation-select-${club.id}`} className="text-xs text-center block font-semibold text-gray-600 mb-1">Tática</label>
                                    <select
                                        id={`formation-select-${club.id}`}
                                        value={selectedTeams[club.id]}
                                        onChange={(e) => onFormationChange(club.id, e.target.value as Formation)}
                                        onClick={(e) => e.stopPropagation()} // Prevent button click when changing formation
                                        className="w-full text-sm font-semibold p-2 rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-offset-1 focus:ring-[#FF8C42] focus:border-[#FF8C42] transition"
                                        aria-label={`Formação tática para ${club.nome}`}
                                    >
                                        {FORMATIONS.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={onNext}
                    disabled={selectedTeamIds.length === 0}
                    className="bg-gradient-to-r from-[#FF8C42] to-[#FFA85C] text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                    {nextButtonText} <i className="fa-solid fa-arrow-right ml-2"></i>
                </button>
            </div>
        </div>
    );
};


// --- Generator Step 2: Offense Selection ---
interface OffenseSelectorProps {
    players: ProcessedPlayer[];
    selectedDefensiveTeams: number[];
    matches: Match[];
    onBack: () => void;
    onGenerate: (lockedPlayerIds: number[], poolPlayerIds: number[]) => void;
    isGenerating: boolean;
    mode: 'quick' | 'advanced';
}

const OffenseSelector: React.FC<OffenseSelectorProps> = ({ players, selectedDefensiveTeams, matches, onBack, onGenerate, isGenerating, mode }) => {
    const [poolPlayerIds, setPoolPlayerIds] = useState<number[]>([]);
    const [lockedPlayerIds, setLockedPlayerIds] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    const opponentTeamIds = useMemo(() => {
        const opponentIds = new Set<number>();
        selectedDefensiveTeams.forEach(teamId => {
            const match = matches.find(m => m.clube_casa_id === teamId || m.clube_visitante_id === teamId);
            if (match) {
                const opponentId = match.clube_casa_id === teamId ? match.clube_visitante_id : match.clube_casa_id;
                opponentIds.add(opponentId);
            }
        });
        return opponentIds;
    }, [selectedDefensiveTeams, matches]);

    const availablePlayers = useMemo(() => {
        return players.filter(p => p.status === 'Provável' && !opponentTeamIds.has(p.clubeId));
    }, [players, opponentTeamIds]);

    const midfielders = useMemo(() => availablePlayers.filter(p => p.posicao === Position.MEI).sort((a,b) => b.potencial - a.potencial), [availablePlayers]);
    const attackers = useMemo(() => availablePlayers.filter(p => p.posicao === Position.ATA).sort((a,b) => b.potencial - a.potencial), [availablePlayers]);

    const handleTogglePool = (playerId: number) => {
        const newPool = poolPlayerIds.includes(playerId)
            ? poolPlayerIds.filter(id => id !== playerId)
            : [...poolPlayerIds, playerId];
        
        setPoolPlayerIds(newPool);

        // If a player is removed from the pool, they must also be unlocked.
        if (!newPool.includes(playerId)) {
            setLockedPlayerIds(prevLocked => prevLocked.filter(id => id !== playerId));
        }
    };
    
    const handleToggleLock = (playerId: number) => {
        // In quick mode, selecting/locking is the same action.
        if (mode === 'quick') {
             setLockedPlayerIds(prev =>
                prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
            );
            return;
        }

        // In advanced mode, only players in the pool can be locked.
        if (poolPlayerIds.includes(playerId)) {
            setLockedPlayerIds(prevLocked =>
                prevLocked.includes(playerId)
                    ? prevLocked.filter(id => id !== playerId)
                    : [...prevLocked, playerId]
            );
        }
    };

    const handleGenerateClick = () => {
        setError(null);
        if (mode === 'advanced') {
            const selectedMids = poolPlayerIds.filter(id => midfielders.some(p => p.id === id));
            const selectedAtks = poolPlayerIds.filter(id => attackers.some(p => p.id === id));
            const lockedMidsCount = lockedPlayerIds.filter(id => midfielders.some(p => p.id === id)).length;
            const lockedAtksCount = lockedPlayerIds.filter(id => attackers.some(p => p.id === id)).length;
            
            // This check is a bit tricky with dynamic formations, so we do a generic check.
            // The main validation happens in the generation function.
            if (selectedMids.length + lockedMidsCount < 3 || selectedAtks.length + lockedAtksCount < 1) {
                 setError("Você precisa selecionar jogadores suficientes para o meio-campo e ataque para gerar as variações.");
                return;
            }
             onGenerate(lockedPlayerIds, poolPlayerIds);
        } else {
             onGenerate(lockedPlayerIds, []); // Quick mode doesn't use a pool
        }
    };

    const PlayerRow: React.FC<{ player: ProcessedPlayer }> = ({ player }) => {
        const isSelected = mode === 'quick' ? lockedPlayerIds.includes(player.id) : poolPlayerIds.includes(player.id);
        const isLocked = lockedPlayerIds.includes(player.id);

        return (
            <div
                className={`flex items-center justify-between p-2 rounded-lg transition-all ${isSelected ? 'bg-orange-100 ring-1 ring-orange-300' : 'bg-gray-50 hover:bg-gray-100'}`}
            >
                <div className="flex items-center gap-2 flex-grow">
                    {mode === 'advanced' && (
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTogglePool(player.id)}
                            className="h-5 w-5 rounded border-gray-300 text-[#FF8C42] focus:ring-[#FF8C42] cursor-pointer"
                            aria-label={`Selecionar ${player.nome}`}
                        />
                    )}
                    <img src={player.timeEscudo} alt={player.time} className="w-5 h-5" />
                    <span className="font-semibold text-sm text-gray-800">{player.nome}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#FF8C42]">P: {player.potencial.toFixed(2)}</span>
                    <button 
                        onClick={() => handleToggleLock(player.id)}
                        disabled={mode === 'advanced' && !isSelected}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold transition-all duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed ${
                            isLocked ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        aria-label={isLocked ? `Desbloquear ${player.nome}` : `Cravar ${player.nome}`}
                    >
                        <i className={`fas ${isLocked ? 'fa-lock' : 'fa-lock-open'}`}></i>
                        <span>{isLocked ? 'Cravado' : 'Cravar'}</span>
                    </button>
                </div>
            </div>
        );
    };

    const title = mode === 'quick' ? "Passo 2: Crave seus meias e atacantes (Opcional)" : "Passo 2: Monte seu universo de ataque";
    const description = mode === 'quick' 
        ? 'Clique em "Cravar" para garantir um jogador em TODAS as escalações. O sistema completará o time com as melhores opções.'
        : 'Marque os jogadores que você quer usar nas combinações. Depois, se quiser, clique em "Cravar" para fixar um deles em todas as escalações.';

    const selectedMidsCount = (mode === 'quick' ? lockedPlayerIds : poolPlayerIds).filter(id => midfielders.some(p => p.id === id)).length;
    const selectedAtksCount = (mode === 'quick' ? lockedPlayerIds : poolPlayerIds).filter(id => attackers.some(p => p.id === id)).length;

    return (
        <div>
            <h3 className="text-center text-lg font-semibold text-gray-700 mb-1">{title}</h3>
            <p className="text-center text-sm text-gray-500 mb-6" dangerouslySetInnerHTML={{ __html: description }}></p>
            
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md mb-4 text-sm"><strong className="font-bold">Erro: </strong>{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-bold text-gray-800 mb-3 text-center">Meio-Campo ({selectedMidsCount} selecionados)</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto p-2 bg-white rounded-lg border">
                        {midfielders.map(p => <PlayerRow key={p.id} player={p} />)}
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 mb-3 text-center">Ataque ({selectedAtksCount} selecionados)</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto p-2 bg-white rounded-lg border">
                        {attackers.map(p => <PlayerRow key={p.id} player={p} />)}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-center items-center gap-4">
                 <button
                    onClick={onBack}
                    className="bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-lg shadow-md hover:bg-gray-300 transition-all duration-300 ease-in-out"
                >
                    <i className="fa-solid fa-arrow-left mr-2"></i> Voltar
                </button>
                <button
                    onClick={handleGenerateClick}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-[#FF8C42] to-[#FFA85C] text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                    <i className="fa-solid fa-cogs mr-2"></i>
                    Gerar Escalações
                </button>
            </div>
        </div>
    );
};


const generateLineupsForTeams = (
    allPlayers: ProcessedPlayer[],
    allClubs: ClubsMap,
    matches: Match[],
    selectedTeamsWithFormation: Record<number, Formation>,
    lockedPlayerIds: number[] = [],
    playerPoolIds: number[] = [],
    existingOffensivePlayerIds: Set<number> = new Set()
): { variations: FullLineupVariation[], error?: string, exhausted?: boolean } => {
    
    const allNewVariations: FullLineupVariation[] = [];
    const usedPlayerIds = new Set<number>([...existingOffensivePlayerIds, ...lockedPlayerIds]);
    const lockedPlayers = allPlayers.filter(p => lockedPlayerIds.includes(p.id));
    const lockedMids = lockedPlayers.filter(p => p.posicao === Position.MEI);
    const lockedAtks = lockedPlayers.filter(p => p.posicao === Position.ATA);

    const probablePlayers = allPlayers.filter(p => p.status === 'Provável');

    // Determine the universe of offensive players
    const isAdvancedModeWithPool = playerPoolIds.length > 0;
    const offensivePlayerSource = isAdvancedModeWithPool 
        ? probablePlayers.filter(p => playerPoolIds.includes(p.id))
        : probablePlayers;
    
    const offensiveMidfielders = offensivePlayerSource.filter(p => p.posicao === Position.MEI);
    const offensiveAttackers = offensivePlayerSource.filter(p => p.posicao === Position.ATA);

    for (const selectedTeamIdStr of Object.keys(selectedTeamsWithFormation)) {
        const selectedTeamId = Number(selectedTeamIdStr);
        const formation = selectedTeamsWithFormation[selectedTeamId];
        const { def: defCount, mid: midCount, atk: atkCount } = parseFormation(formation);

        // --- 1. Conflict Check: Locked players vs Defense ---
        const match = matches.find(m => m.clube_casa_id === selectedTeamId || m.clube_visitante_id === selectedTeamId);
        const opponentTeamId = match ? (match.clube_casa_id === selectedTeamId ? match.clube_visitante_id : match.clube_casa_id) : -1;
        
        const conflictingLockedPlayers = lockedPlayers.filter(p => p.clubeId === opponentTeamId);
        if (conflictingLockedPlayers.length > 0) {
            const playerNames = conflictingLockedPlayers.map(p => p.nome).join(', ');
            return { variations: [], error: `Você cravou ${playerNames}, que joga(m) contra a defesa do ${allClubs[selectedTeamId]?.nome}. Por favor, ajuste sua seleção.` };
        }

        // --- 2. Build Defense (with fallback to 'Dúvida') ---
        const defenseTeamPlayers = allPlayers.filter(p => p.clubeId === selectedTeamId);
        const getPlayersForPosition = (positions: Position[], count: number): ProcessedPlayer[] => {
            const playersInPos = defenseTeamPlayers.filter(p => positions.includes(p.posicao));
            const provaveis = playersInPos.filter(p => p.status === 'Provável');
            const duvidas = playersInPos.filter(p => p.status === 'Dúvida').sort((a, b) => b.media - a.media);
            
            let lineup = [...provaveis];
            if (lineup.length < count) {
                const needed = count - lineup.length;
                const bestDuvidas = duvidas.slice(0, needed).map(p => ({ ...p, isChosenFromDoubt: true }));
                lineup.push(...bestDuvidas);
            }
            return lineup.slice(0, count);
        };

        const goalkeeper = getPlayersForPosition([Position.GOL], 1);
        const defenders = getPlayersForPosition([Position.ZAG, Position.LAT], defCount).sort((a, b) => b.media - a.media);
        const coach = getPlayersForPosition([Position.TEC], 1);
        
        if (goalkeeper.length < 1 || defenders.length < defCount || coach.length < 1) {
             console.warn(`Skipping team ${allClubs[selectedTeamId]?.nome} due to incomplete defense for formation ${formation}.`);
            continue;
        }

        // --- 3. Build Offense ---
        const availableMidfielders = offensiveMidfielders.filter(p => p.clubeId !== opponentTeamId);
        const availableAttackers = offensiveAttackers.filter(p => p.clubeId !== opponentTeamId);
        const defensePlayerIds = new Set([...goalkeeper, ...defenders, ...coach].map(p => p.id));
        
        const getTopPlayers = (
            playerList: ProcessedPlayer[],
            count: number,
            sortBy: keyof Pick<ProcessedPlayer, 'potencial' | 'media' | 'mediaBasica'>,
            offset: number = 0
        ): ProcessedPlayer[] => {
            const available = playerList.filter(p => !usedPlayerIds.has(p.id) && !defensePlayerIds.has(p.id));
            const sorted = available.sort((a, b) => (b[sortBy] ?? 0) - (a[sortBy] ?? 0));
            return sorted.slice(offset, offset + count);
        };
        
        const baseVariation = {
            defenseTeam: { name: allClubs[selectedTeamId].nome, shield: allClubs[selectedTeamId].escudos['45x45'] },
            goalkeeper, defenders, coach
        };

        const createVariation = (id: number, title: string, desc: string, midSort: 'potencial' | 'media', atkSort: 'potencial' | 'media', midOffset = 0, atkOffset = 0) => {
            const neededMids = midCount - lockedMids.length;
            const neededAtks = atkCount - lockedAtks.length;
            
            const autoMids = neededMids > 0 ? getTopPlayers(availableMidfielders, neededMids, midSort, midOffset) : [];
            const autoAtks = neededAtks > 0 ? getTopPlayers(availableAttackers, neededAtks, atkSort, atkOffset) : [];

            if ((lockedMids.length + autoMids.length) === midCount && (lockedAtks.length + autoAtks.length) === atkCount) {
                const finalMids = [...lockedMids, ...autoMids];
                const finalAtks = [...lockedAtks, ...autoAtks];
                const variationTitle = `${title} (${formation})`;
                allNewVariations.push({ ...baseVariation, id: Date.now() + id + selectedTeamId, title: variationTitle, description: desc, midfielders: finalMids, attackers: finalAtks });
                [...autoMids, ...autoAtks].forEach(p => usedPlayerIds.add(p.id));
            }
        };

        createVariation(1, "Potencial Máximo", "Melhores por pontuação de potencial.", 'potencial', 'potencial');
        createVariation(2, "Equilíbrio Total", "Melhores por média geral.", 'media', 'media');
        createVariation(3, "Apostas de Valor", "Ótimos jogadores que não estão no topo da lista.", 'potencial', 'potencial', 3, 3);
    }
    
    if (Object.keys(selectedTeamsWithFormation).length > 0 && allNewVariations.length === 0) {
        const errorMsg = isAdvancedModeWithPool 
            ? 'Não foi possível formar times com os jogadores selecionados. Tente adicionar mais opções ao seu universo de jogadores.'
            : 'Os times selecionados não possuem uma defesa completa para as táticas escolhidas ou não há atacantes/meias prováveis suficientes. Tente outras combinações.';
        return { variations: [], error: errorMsg };
    }

    // --- 4. Check if we've run out of players for future generations ---
    let minMidsNeeded = 10;
    let minAtksNeeded = 10;
    Object.values(selectedTeamsWithFormation).forEach(f => {
        const { mid, atk } = parseFormation(f);
        minMidsNeeded = Math.min(minMidsNeeded, mid);
        minAtksNeeded = Math.min(minAtksNeeded, atk);
    });
    
    const remainingMids = offensiveMidfielders.filter(p => !usedPlayerIds.has(p.id)).length;
    const remainingAtks = offensiveAttackers.filter(p => !usedPlayerIds.has(p.id)).length;
    const exhausted = remainingMids < (minMidsNeeded - lockedMids.length) || remainingAtks < (minAtksNeeded - lockedAtks.length);

    return { variations: allNewVariations, exhausted };
};

const App: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [players, setPlayers] = useState<ProcessedPlayer[]>([]);
    const [clubs, setClubs] = useState<ClubsMap>({});
    const [matches, setMatches] = useState<Match[]>([]);
    const [marketInfo, setMarketInfo] = useState<{ status: number, round: number } | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [selectedPlayerForScout, setSelectedPlayerForScout] = useState<ProcessedPlayer | null>(null);
    const [sgData, setSgData] = useState<SgTeam[]>(defaultSgData);
    const [isSgModalOpen, setIsSgModalOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const [filters, setFilters] = useState({
        position: 'all',
        team: 'all',
        sortBy: 'potencial',
    });
   
    const [generatorMode, setGeneratorMode] = useState<'quick' | 'advanced' | null>(null);
    const [generatorStep, setGeneratorStep] = useState<'selectDefense' | 'selectOffense' | 'view'>('selectDefense');
    const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedFullLineups, setGeneratedFullLineups] = useState<FullLineupVariation[]>([]);
    const [generatorError, setGeneratorError] = useState<string | null>(null);
    const [selectedTeamsForGenerator, setSelectedTeamsForGenerator] = useState<Record<number, Formation>>({});
    const [lockedOffensivePlayers, setLockedOffensivePlayers] = useState<number[]>([]);
    const [advancedPlayerPool, setAdvancedPlayerPool] = useState<number[]>([]);
    const [allOffensivePlayersUsed, setAllOffensivePlayersUsed] = useState(false);

    useEffect(() => {
        const fetchData = async (isInitialLoad = false) => {
            if (isInitialLoad) setLoading(true);
            try {
                const PROXY_URL = 'https://corsproxy.io/?';
                const API_BASE = `${PROXY_URL}https://api.cartola.globo.com`;

                const [clubesRes, atletasRes, partidasRes, mercadoRes] = await Promise.all([
                    fetch(`${API_BASE}/clubes`).then(res => res.json()),
                    fetch(`${API_BASE}/atletas/mercado`).then(res => res.json()),
                    fetch(`${API_BASE}/partidas`).then(res => res.json()),
                    fetch(`${API_BASE}/mercado/status`).then(res => res.json()),
                ]);

                const clubesData: { [key: string]: Club } = clubesRes;
                const atletasData: { atletas?: ApiPlayer[] } = atletasRes;
                const partidasData: { partidas: Match[] } = partidasRes;
                const mercadoData: MarketStatus = mercadoRes;

                const activeClubIds = new Set(
                    partidasData.partidas.flatMap(p => [p.clube_casa_id, p.clube_visitante_id])
                );

                const clubsMap: ClubsMap = Object.values(clubesData)
                    .filter(club => activeClubIds.has(club.id))
                    .reduce((acc, club) => {
                        acc[club.id] = club;
                        return acc;
                    }, {} as ClubsMap);
                
                const calculatePlayerPotencial = (player: Omit<ProcessedPlayer, 'potencial'>): number => {
                    if (player.jogos === 0) return player.media > 0 ? player.media / 2 : 0;
                    
                    const G_POINTS = 8;
                    const A_POINTS = 5;
                    const DS_POINTS = 1;
                    const MEDIA_BASICA_WEIGHT = 1.2;

                    const perGameGols = (player.gols / player.jogos) * G_POINTS;
                    const perGameAssists = (player.assistencias / player.jogos) * A_POINTS;
                    const perGameDesarmes = (player.desarmes / player.jogos) * DS_POINTS;

                    const potencial = (player.mediaBasica * MEDIA_BASICA_WEIGHT) + 
                                     perGameGols + perGameAssists + perGameDesarmes;
                    
                    return parseFloat(potencial.toFixed(2));
                };
                
                const processedPlayersWithoutPotencial: Omit<ProcessedPlayer, 'potencial'>[] = (atletasData.atletas || [])
                    .filter(player => activeClubIds.has(player.clube_id))
                    .map(player => {
                        const position = POSITIONS_MAP[player.posicao_id];
                        if (!position) {
                            return null;
                        }
                        
                        const scout = player.scout || {};
                        const jogos = player.jogos_num;
                        
                        let mediaBasica = 0;
                        if (jogos > 0) {
                            const totalPontos = player.media_num * jogos;
                            const pontosGols = (scout.G ?? 0) * 8;
                            const pontosAssistencias = (scout.A ?? 0) * 5;
                            const isDefensive = [Position.GOL, Position.LAT, Position.ZAG, Position.TEC].includes(position);
                            const pontosSG = isDefensive ? (scout.SG ?? 0) * 5 : 0;
                            const pontosBasicos = totalPontos - pontosGols - pontosAssistencias - pontosSG;
                            mediaBasica = pontosBasicos / jogos;
                        }

                        return {
                            id: player.atleta_id,
                            nome: player.apelido,
                            posicao: position,
                            clubeId: player.clube_id,
                            time: clubsMap[player.clube_id]?.nome ?? 'Desconhecido',
                            timeEscudo: clubsMap[player.clube_id]?.escudos['30x30'] ?? '',
                            media: player.media_num,
                            jogos: player.jogos_num,
                            gols: scout.G ?? 0,
                            assistencias: scout.A ?? 0,
                            desarmes: scout.DS ?? 0,
                            mediaBasica: mediaBasica,
                            roubosDeBola: scout.RB ?? 0,
                            cartoesAmarelos: scout.CA ?? 0,
                            cartoesVermelhos: scout.CV ?? 0,
                            faltasCometidas: scout.FC ?? 0,
                            status: STATUS_MAP[player.status_id] ?? 'Indefinido',
                        };
                    })
                    .filter((player): player is Omit<ProcessedPlayer, 'potencial'> => player !== null);
                
                const processedPlayers: ProcessedPlayer[] = processedPlayersWithoutPotencial.map(p => ({
                    ...p,
                    potencial: calculatePlayerPotencial(p),
                }));

                setClubs(clubsMap);
                setPlayers(processedPlayers);
                setMatches(partidasData.partidas);
                setMarketInfo({ status: mercadoData.status_mercado, round: mercadoData.rodada_atual });
                setLastUpdated(new Date());

                // Load SG data from localStorage or use default
                const sgStorageKey = `sgData_rodada_${mercadoData.rodada_atual}`;
                const savedSgData = localStorage.getItem(sgStorageKey);
                if (savedSgData) {
                    setSgData(JSON.parse(savedSgData));
                } else {
                    setSgData(defaultSgData);
                }

            } catch (error) {
                console.error("Failed to fetch Cartola API data:", error);
            } finally {
                if (isInitialLoad) setLoading(false);
            }
        };

        // Check for admin mode
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('admin') === 'true') {
            setIsAdmin(true);
        }

        fetchData(true); // Initial fetch
        const intervalId = setInterval(fetchData, 4 * 60 * 60 * 1000); // 4 hours

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, []);

    // Auto-scroll to variations when generated
    useEffect(() => {
        if (generatorStep === 'view' && !isGenerating) {
            setTimeout(() => {
                const variationsElement = document.getElementById('variationsSection');
                variationsElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [generatorStep, isGenerating]);

    const handleSaveSgData = (newSgData: SgTeam[]) => {
        if (!marketInfo) return;
        const sgStorageKey = `sgData_rodada_${marketInfo.round}`;
        
        // Auto-calculate width and format probability string
        const processedSgData = newSgData.map(item => {
            const probNumber = parseInt(item.probability, 10) || 0;
            return {
                ...item,
                probability: `${probNumber - 10}-${probNumber}%`,
                width: `${probNumber}%`,
            }
        });

        localStorage.setItem(sgStorageKey, JSON.stringify(processedSgData));
        setSgData(processedSgData);
        setIsSgModalOpen(false);
    };

    const uniqueTeams = useMemo(() => {
        return [...new Set(Object.values(clubs).map((c: Club) => c.nome))].sort();
    }, [clubs]);
    
    const sortedClubs = useMemo(() => Object.values(clubs).sort((a: Club, b: Club) => a.nome.localeCompare(b.nome)), [clubs]);

    const filteredPlayers = useMemo(() => {
        let playersCopy = [...players];
        playersCopy = playersCopy.filter((player) => {
            const positionMatch = filters.position === 'all' || player.posicao === filters.position;
            const teamMatch = filters.team === 'all' || player.time === filters.team;
            return positionMatch && teamMatch;
        });

        playersCopy.sort((a, b) => {
            switch (filters.sortBy) {
                case 'potencial':
                    return (b.potencial ?? 0) - (a.potencial ?? 0);
                case 'media':
                    return (b.media ?? 0) - (a.media ?? 0);
                case 'mediaBasica':
                    return (b.mediaBasica ?? 0) - (a.mediaBasica ?? 0);
                case 'gols':
                    return (b.gols ?? 0) - (a.gols ?? 0);
                case 'assistencias':
                    return (b.assistencias ?? 0) - (a.assistencias ?? 0);
                case 'desarmes':
                    return (b.desarmes ?? 0) - (a.desarmes ?? 0);
                case 'nome':
                    return a.nome.localeCompare(b.nome);
                default:
                    return 0;
            }
        });

        return playersCopy;
    }, [filters, players]);

    const handleInitialGenerate = useCallback((lockedIds: number[], poolIds: number[]) => {
        setIsGenerating(true);
        setGeneratorError(null);
        setAllOffensivePlayersUsed(false);
        setLockedOffensivePlayers(lockedIds);
        setAdvancedPlayerPool(poolIds);

        setTimeout(() => {
            const result = generateLineupsForTeams(players, clubs, matches, selectedTeamsForGenerator, lockedIds, poolIds);
            
            if (result.error) {
                setGeneratorError(result.error);
                setGeneratorStep('selectOffense'); // Go back to offense selection on error
                setIsGenerating(false);
                return;
            }
            
            setGeneratedFullLineups(result.variations || []);
            setAllOffensivePlayersUsed(!!result.exhausted);
            setGeneratorStep('view');
            setIsGenerating(false);

        }, 1500); // Simulate generation time
    }, [players, clubs, matches, selectedTeamsForGenerator]);

    const handleGenerateMoreVariations = useCallback(() => {
        if (Object.keys(selectedTeamsForGenerator).length === 0) return;

        setIsGenerating(true);
        const existingOffensiveIds: Set<number> = new Set(
            generatedFullLineups.flatMap(v => [...v.midfielders, ...v.attackers].map(p => p.id))
        );

        setTimeout(() => {
            const result = generateLineupsForTeams(players, clubs, matches, selectedTeamsForGenerator, lockedOffensivePlayers, advancedPlayerPool, existingOffensiveIds);

            if (result.variations && result.variations.length > 0) {
                setGeneratedFullLineups(prev => [...prev, ...result.variations!]);
            }
            
            setAllOffensivePlayersUsed(!!result.exhausted || (result.variations && result.variations.length === 0));
            setIsGenerating(false);
        }, 1500);

    }, [players, clubs, matches, selectedTeamsForGenerator, generatedFullLineups, lockedOffensivePlayers, advancedPlayerPool]);

    const handleTeamToggleForGenerator = (teamId: number) => {
        setSelectedTeamsForGenerator(prev => {
            const newSelection = { ...prev };
            if (newSelection[teamId]) {
                delete newSelection[teamId];
            } else {
                newSelection[teamId] = '4-3-3'; // Default formation
            }
            return newSelection;
        });
    };
    
    const handleFormationChangeForGenerator = (teamId: number, formation: Formation) => {
        setSelectedTeamsForGenerator(prev => ({
            ...prev,
            [teamId]: formation,
        }));
    };

    const handleMatchClick = useCallback((match: Match) => {
        setSelectedMatch(match);
    }, []);

    const handlePlayerClick = (player: ProcessedPlayer) => {
        setSelectedPlayerForScout(player);
    };
    
    const handleCloseScoutDetail = () => {
        setSelectedPlayerForScout(null);
    };
    
    const handleOpenGenerator = (mode: 'quick' | 'advanced') => {
        setGeneratorMode(mode);
        setIsGeneratorModalOpen(true);
    };
    
    const handleCloseGenerator = () => {
        setIsGeneratorModalOpen(false);
        setTimeout(() => {
            setGeneratedFullLineups([]);
            setGeneratorStep('selectDefense');
            setGeneratorError(null);
            setSelectedTeamsForGenerator({});
            setAllOffensivePlayersUsed(false);
            setLockedOffensivePlayers([]);
            setAdvancedPlayerPool([]);
            setGeneratorMode(null);
        }, 300);
    };
    
    const handleDefenseSelectionNext = () => {
        setGeneratorError(null);
        setGeneratorStep('selectOffense');
    };

    const renderGeneratorContent = () => {
        if (isGenerating) return <ProgressBar />;
        if (!generatorMode) return null;

        switch (generatorStep) {
            case 'selectDefense':
                return <DefenseSelector
                    clubs={sortedClubs}
                    selectedTeams={selectedTeamsForGenerator}
                    onTeamToggle={handleTeamToggleForGenerator}
                    onFormationChange={handleFormationChangeForGenerator}
                    onNext={handleDefenseSelectionNext}
                    error={generatorError}
                    nextButtonText={'Próximo Passo'}
                />;
            case 'selectOffense':
                return <OffenseSelector
                    players={players}
                    selectedDefensiveTeams={Object.keys(selectedTeamsForGenerator).map(Number)}
                    matches={matches}
                    onBack={() => { setGeneratorError(null); setGeneratorStep('selectDefense'); }}
                    onGenerate={handleInitialGenerate}
                    isGenerating={isGenerating}
                    mode={generatorMode}
                />;
            case 'view':
                 return (
                    <div>
                        <VariationsSection variations={generatedFullLineups} />
                        <div className="mt-6 text-center">
                            {allOffensivePlayersUsed ? (
                                <p className="text-gray-500 italic">Todas as combinações de ataque possíveis foram geradas.</p>
                            ) : (
                                    <button
                                    onClick={handleGenerateMoreVariations}
                                    disabled={isGenerating}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out flex items-center gap-2 mx-auto disabled:opacity-75 disabled:cursor-wait"
                                >
                                    <i className="fa-solid fa-plus"></i>
                                    Gerar mais opções
                                </button>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
    
    const getGeneratorTitle = () => {
        if (isGenerating) return "Gerando Variações...";
        
        // Dynamic title for the results view
        if (generatorStep === 'view') {
            const selectedCount = Object.keys(selectedTeamsForGenerator).length;
            if (selectedCount === 1) {
                const teamId = Object.keys(selectedTeamsForGenerator)[0];
                const teamName = clubs[Number(teamId)]?.nome;
                return `Variações para ${teamName || 'Defesa Selecionada'}`;
            }
            if (selectedCount > 1) {
                return `Variações para ${selectedCount} Defesas`;
            }
            return "Variações Geradas";
        }

        // Titles for selection steps
        if (generatorMode === 'quick') {
            switch (generatorStep) {
                case 'selectDefense': return "Gerador Rápido - Defesa";
                case 'selectOffense': return "Gerador Rápido - Ataque";
            }
        }
        
        if (generatorMode === 'advanced') {
            switch (generatorStep) {
                case 'selectDefense': return "Gerador Avançado - Defesa";
                case 'selectOffense': return "Gerador Avançado - Ataque";
            }
        }

        return "Gerador de Escalação"; // Fallback
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-[#FF8C42] to-[#000000] min-h-screen flex items-center justify-center">
                <div className="text-center text-white">
                    <i className="fas fa-futbol fa-spin fa-3x mb-4"></i>
                    <h1 className="text-2xl font-bold">Carregando dados do Cartola...</h1>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-br from-[#FF8C42] to-[#000000] min-h-screen font-sans text-[#1A1A1A]">
            <div className="container mx-auto max-w-7xl p-2 sm:p-5">
                <Header marketStatus={marketInfo?.status ?? null} roundNumber={marketInfo?.round ?? null} />
                <main>
                    <DashboardCharts players={filteredPlayers} />
                    
                    <MatchesSection matches={matches} clubs={clubs} onMatchClick={handleMatchClick} />

                    <h2 className="text-3xl font-bold text-white text-center my-6 sm:my-10 text-shadow">Top 5 Segurança de Gols (SG)</h2>
                    <SgSection sgData={sgData} onEdit={() => setIsSgModalOpen(true)} isAdmin={isAdmin} />

                    <Card title="Central de Escalações" icon={<i className="fa-solid fa-cogs"></i>} className="my-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                <i className="fa-solid fa-rocket text-4xl text-[#FF8C42] mb-3"></i>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Gerador Rápido</h3>
                                <p className="text-gray-600 mb-4">Escolha as defesas, a tática, e deixe nosso algoritmo montar os melhores ataques.</p>
                                <button
                                    onClick={() => handleOpenGenerator('quick')}
                                    className="bg-gradient-to-r from-[#FF8C42] to-[#FFA85C] text-white font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    Iniciar
                                </button>
                            </div>
                             <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                <i className="fa-solid fa-chess-king text-4xl text-red-600 mb-3"></i>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Gerador Avançado (Tiro Curto)</h3>
                                <p className="text-gray-600 mb-4">Crie um universo de jogadores, escolha a tática, e gere combinações personalizadas.</p>
                                <button
                                    onClick={() => handleOpenGenerator('advanced')}
                                    className="bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    Iniciar
                                </button>
                            </div>
                        </div>
                    </Card>

                    <Filters
                        teams={uniqueTeams}
                        filters={filters}
                        onFilterChange={setFilters}
                    />

                    <h2 className="text-3xl font-bold text-white text-center my-6 sm:my-10 text-shadow">Jogadores Destaques</h2>
                    <PlayersTable players={filteredPlayers} onPlayerClick={handlePlayerClick} />
                </main>
                <Footer />
                
                <Modal 
                    isOpen={isGeneratorModalOpen} 
                    onClose={handleCloseGenerator}
                    title={getGeneratorTitle()}
                >
                    {renderGeneratorContent()}
                </Modal>

                {selectedMatch && (
                    <Modal 
                        isOpen={selectedMatch !== null} 
                        onClose={() => setSelectedMatch(null)}
                        title={`Prováveis: ${clubs[selectedMatch.clube_casa_id]?.nome} vs ${clubs[selectedMatch.clube_visitante_id]?.nome}`}
                    >
                        <ProbableLineup
                            match={selectedMatch}
                            clubs={clubs}
                            players={players}
                            lastUpdated={lastUpdated}
                        />
                    </Modal>
                )}

                {selectedPlayerForScout && (
                    <Modal 
                        isOpen={selectedPlayerForScout !== null} 
                        onClose={handleCloseScoutDetail}
                        title={`Scouts de ${selectedPlayerForScout.nome}`}
                    >
                        <PlayerScoutDetail player={selectedPlayerForScout} />
                    </Modal>
                )}

                <SgEditModal
                    isOpen={isSgModalOpen}
                    onClose={() => setIsSgModalOpen(false)}
                    onSave={handleSaveSgData}
                    currentSgData={sgData}
                    roundNumber={marketInfo?.round ?? 0}
                />
            </div>
        </div>
    );
};

export default App;
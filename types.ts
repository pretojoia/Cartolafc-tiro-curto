
export enum Position {
    GOL = 'GOL',
    LAT = 'LAT',
    ZAG = 'ZAG',
    MEI = 'MEI',
    ATA = 'ATA',
    TEC = 'TEC',
}

export const POSITIONS_MAP: { [key: number]: Position } = {
    1: Position.GOL,
    2: Position.LAT,
    3: Position.ZAG,
    4: Position.MEI,
    5: Position.ATA,
    6: Position.TEC,
};

export interface ApiPlayer {
    atleta_id: number;
    apelido: string;
    clube_id: number;
    posicao_id: number;
    preco_num: number;
    variacao_num: number;
    media_num: number;
    jogos_num: number;
    status_id: number;
    scout: {
        G?: number;
        A?: number;
        DS?: number;
        SG?: number;
        RB?: number;
        CA?: number;
        CV?: number;
        FC?: number;
        [key:string]: number | undefined;
    };
}

export interface Club {
    id: number;
    nome: string;
    abreviacao: string;
    escudos: {
        '60x60': string;
        '45x45': string;
        '30x30': string;
    };
}

export type ClubsMap = { [key: number]: Club };

export interface Match {
    clube_casa_id: number;
    clube_visitante_id: number;
    partida_data: string;
    local: string;
}

export interface MarketStatus {
    status_mercado: number;
    rodada_atual: number;
}


export interface SgTeam {
    team: string;
    probability: string;
    observation: string;
    width: string;
}

export interface ProcessedPlayer {
    id: number;
    nome: string;
    posicao: Position;
    time: string;
    timeEscudo: string;
    clubeId: number;
    media: number;
    jogos: number;
    gols: number;
    assistencias: number;
    desarmes: number;
    potencial: number;
    mediaBasica: number;
    roubosDeBola: number;
    cartoesAmarelos: number;
    cartoesVermelhos: number;
    faltasCometidas: number;
    status: string;
    isChosenFromDoubt?: boolean;
}

export interface FullLineupVariation {
    id: number;
    title: string;
    description: string;
    defenseTeam: {
        name: string;
        shield: string;
    };
    goalkeeper: ProcessedPlayer[];
    defenders: ProcessedPlayer[];
    midfielders: ProcessedPlayer[];
    attackers: ProcessedPlayer[];
    coach: ProcessedPlayer[];
}
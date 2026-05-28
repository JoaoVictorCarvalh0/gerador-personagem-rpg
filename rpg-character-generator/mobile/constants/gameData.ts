export interface ClassData {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;
  requirement: string;
}

export interface RaceData {
  id: string;
  label: string;
  icon: string;
  description: string;
  bonus: string;
}

export interface FantasyColor {
  name: string;
  hex: string;
}

export const CLASSES: ClassData[] = [
  { id: 'guerreiro', label: 'Guerreiro', icon: '⚔️', description: 'Mestre das armas', color: '#c0392b', requirement: 'FOR ≥ 13' },
  { id: 'mago', label: 'Mago', icon: '🔮', description: 'Poder arcano', color: '#8e44ad', requirement: 'INT ≥ 13' },
  { id: 'arqueiro', label: 'Arqueiro', icon: '🏹', description: 'Precisão mortal', color: '#27ae60', requirement: 'DES ≥ 13' },
  { id: 'ladino', label: 'Ladino', icon: '🗡️', description: 'Sombra e furtividade', color: '#2c3e50', requirement: 'DES ≥ 12' },
  { id: 'clérigo', label: 'Clérigo', icon: '✨', description: 'Guardião divino', color: '#f39c12', requirement: 'SAB ≥ 13' },
];

export const RACES: RaceData[] = [
  { id: 'humano', label: 'Humano', icon: '👤', description: 'Adaptável e versátil', bonus: '+1 em todos' },
  { id: 'elfo', label: 'Elfo', icon: '🌿', description: 'Gracioso e mágico', bonus: '+2 DES' },
  { id: 'anão', label: 'Anão', icon: '⛏️', description: 'Resistente e tenaz', bonus: '+2 CON' },
  { id: 'halfling', label: 'Halfling', icon: '🌻', description: 'Sortudo e ágil', bonus: '+2 DES' },
  { id: 'tiefling', label: 'Tiefling', icon: '🔥', description: 'Legado infernal', bonus: '+2 CAR' },
];

export const FANTASY_COLORS: FantasyColor[] = [
  { name: 'Sangue', hex: '#8B0000' },
  { name: 'Ouro', hex: '#FFD700' },
  { name: 'Arcano', hex: '#4B0082' },
  { name: 'Oceano', hex: '#00008B' },
  { name: 'Floresta', hex: '#1B4D2E' },
  { name: 'Brasa', hex: '#FF4500' },
  { name: 'Prata', hex: '#C0C0C0' },
  { name: 'Gelo', hex: '#00CED1' },
  { name: 'Ébano', hex: '#2C2C2C' },
  { name: 'Rubi', hex: '#E0115F' },
  { name: 'Jade', hex: '#00A86B' },
  { name: 'Cobre', hex: '#B87333' },
];

export const CLASS_LABELS: Record<string, string> = Object.fromEntries(
  CLASSES.map((c) => [c.id, c.label])
);

export const RACE_LABELS: Record<string, string> = Object.fromEntries(
  RACES.map((r) => [r.id, r.label])
);

export const CLASS_ICONS: Record<string, string> = Object.fromEntries(
  CLASSES.map((c) => [c.id, c.icon])
);

export const DERIVED_LABELS: Record<string, { label: string; icon: string; unit: string }> = {
  dano: { label: 'Dano', icon: '⚔️', unit: '' },
  defesa: { label: 'Defesa', icon: '🛡️', unit: '' },
  critico: { label: 'Crítico', icon: '🎯', unit: '%' },
  velocidade_ataque: { label: 'Velocidade', icon: '⚡', unit: 'x' },
};

import { useState } from "react";
import { Character, getAvatarUrl } from "../services/api";
import { Icon } from "./Icons";
import {
  useSmartPrint, PageRender,
  Typography, Divider, Image as PrintImage,
  Table, TableHead, TableBody, TableRow, TableCell,
} from "react-smart-print";

interface Props {
  character: Character;
  taskId: string;
  onReset: () => void;
  isDemo?: boolean;
}

const STAT_FULL: Record<string, string> = {
  FOR: "Força",
  DES: "Destreza",
  INT: "Inteligência",
  CON: "Constituição",
  SAB: "Sabedoria",
  CAR: "Carisma",
};

const CLASS_ICON: Record<string, string> = {
  guerreiro: "sword",
  mago: "wand",
  arqueiro: "bow",
  ladino: "dagger",
  clérigo: "chalice",
};
const RACE_ICON: Record<string, string> = {
  humano: "human",
  elfo: "elf",
  anão: "dwarf",
  halfling: "halfling",
  tiefling: "tiefling",
};

const DERIVED_META: Record<
  string,
  { label: string; icon: string; unit: string }
> = {
  dano: { label: "Dano", icon: "sword", unit: "" },
  defesa: { label: "Defesa", icon: "shield", unit: "" },
  critico: { label: "Chance Crítica", icon: "burst", unit: "%" },
  velocidade_ataque: { label: "Vel. de Ataque", icon: "speed", unit: "×" },
};

function mod(score: number) {
  return Math.floor((score - 10) / 2);
}
function signed(n: number) {
  return n >= 0 ? `+${n}` : `${n}`;
}

function fmtDerived(val: number, unit: string) {
  if (unit === "%") return `${val.toFixed(1)}%`;
  if (unit === "×") return `${val.toFixed(2)}×`;
  return val.toFixed(1);
}

function PrintContent({ character, avatarUrl, isDemo }: { character: Character; avatarUrl: string | null; isDemo?: boolean }) {
  const STAT_FULL: Record<string, string> = { FOR:"Força", DES:"Destreza", INT:"Inteligência", CON:"Constituição", SAB:"Sabedoria", CAR:"Carisma" }
  const DERIVED_META: Record<string, { label: string; unit: string }> = {
    dano: { label: "Dano", unit: "" }, defesa: { label: "Defesa", unit: "" },
    critico: { label: "Chance Crítica", unit: "%" }, velocidade_ataque: { label: "Vel. de Ataque", unit: "×" },
  }
  const fmtMod = (v: number) => { const m = Math.floor((v - 10) / 2); return m >= 0 ? `+${m}` : `${m}` }
  const fmtDerived = (val: number, unit: string) => unit === "%" ? `${val.toFixed(1)}%` : unit === "×" ? `${val.toFixed(2)}×` : val.toFixed(1)

  return (
    <>
      <Typography fontSize={9} color="#9e2b25" marginBottom={2}>
        GERADOR DE PERSONAGENS · D&D 5e · SPD{isDemo ? " · DEMO" : ""}
      </Typography>
      <Typography bold fontSize={22} color="#24221c" marginBottom={4}>
        Ficha de Personagem
      </Typography>
      <Divider />

      {avatarUrl && (
        <PrintImage src={avatarUrl} alt={character.name} width={110} height={140} fit="cover" marginBottom={10} />
      )}

      <Typography bold fontSize={18} color="#24221c" marginTop={8} marginBottom={4}>
        {character.name}
      </Typography>
      <Typography fontSize={11} color="#56523f" marginBottom={2}>
        Classe: {character.class}   ·   Raça: {character.race}   ·   #{character.id.slice(0, 8)}
      </Typography>

      <Divider />
      <Typography bold fontSize={10} color="#2f3a63" marginTop={12} marginBottom={6}>
        ATRIBUTOS BASE · 4d6 ↓1
      </Typography>

      <Table width="100%">
        <TableHead>
          <TableRow>
            {Object.keys(character.base_attributes).map((stat) => (
              <TableCell key={stat}>{stat}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {Object.entries(character.base_attributes).map(([stat, val]) => (
              <TableCell key={stat}>{val}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            {Object.entries(character.base_attributes).map(([stat, val]) => (
              <TableCell key={stat}>{fmtMod(val)}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            {Object.entries(character.base_attributes).map(([stat]) => (
              <TableCell key={stat}>{STAT_FULL[stat] ?? stat}</TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>

      <Typography bold fontSize={10} color="#2f3a63" marginTop={16} marginBottom={6}>
        COMBATE / DERIVADOS
      </Typography>

      <Table width="100%">
        <TableHead>
          <TableRow>
            {Object.entries(character.derived_attributes).map(([key]) => {
              const meta = DERIVED_META[key]; if (!meta) return null
              return <TableCell key={key}>{meta.label}</TableCell>
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {Object.entries(character.derived_attributes).map(([key, val]) => {
              const meta = DERIVED_META[key]; if (!meta) return null
              return <TableCell key={key}>{fmtDerived(val, meta.unit)}</TableCell>
            })}
          </TableRow>
        </TableBody>
      </Table>

      <Divider />
      <Typography fontSize={8} color="#8b8468" marginTop={8}>
        Selado por Worker · {new Date().toLocaleDateString("pt-BR")} · SPD Producer-Consumer · Flask → Redis
      </Typography>
    </>
  )
}

export function CharacterSheet({ character, taskId, onReset, isDemo }: Props) {
  const [imgErr, setImgErr] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const { config, renderAndPrint, isLoading } = useSmartPrint("ficha-personagem");

  const avatarUrl = getAvatarUrl(taskId);
  const hasAvatar = !isDemo && !imgErr;

  const classIcon = CLASS_ICON[character.class] ?? "sword";
  const raceIcon = RACE_ICON[character.race] ?? "human";

  return (
    <>
    <div className="fc-sheet fade-in">
      {/* Lightbox */}
      {lightbox && hasAvatar && (
        <div className="lightbox-overlay" onClick={() => setLightbox(false)}>
          <img
            src={avatarUrl}
            alt={character.name}
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
          <button className="lightbox-close" onClick={() => setLightbox(false)}>
            ✕
          </button>
        </div>
      )}

      <span className="fc-margin" />
      <span className="fc-crop tl" />
      <span className="fc-crop tr" />
      <span className="fc-crop bl" />
      <span className="fc-crop br" />

      <div className="fc-masthead">
        <div className="fc-mh-l">
          <div className="kicker">Gerador de Personagens</div>
          <div className="ttl">Ficha de Personagem</div>
        </div>
        <div className="fc-mh-r">
          <div className="reg">D&amp;D 5e · SPD</div>
          <div>
            FICHA <b>{character.id.slice(0, 8).toUpperCase()}</b>
          </div>
          <div>EMITIDA · VÁLIDA</div>
        </div>
      </div>

      {/* Portrait + identity */}
      <div className="fc-res-head" style={{ marginTop: 22 }}>
        <div className="fc-portrait">
          <div
            className={"frame" + (hasAvatar ? " clickable" : "")}
            onClick={() => hasAvatar && setLightbox(true)}
          >
            {hasAvatar ? (
              <img
                src={avatarUrl}
                alt={character.name}
                onError={() => setImgErr(true)}
              />
            ) : (
              <>
                <span className="ic">
                  <Icon name="human" size={30} />
                </span>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 9,
                    letterSpacing: ".14em",
                    color: "var(--ink-faint)",
                  }}
                >
                  RETRATO
                </span>
              </>
            )}
          </div>
          <div
            className={"cap" + (hasAvatar ? " clickable" : "")}
            onClick={() => hasAvatar && setLightbox(true)}
          >
            {hasAvatar ? "clique para ampliar" : "3,5 × 4,5 cm"}
          </div>
        </div>

        <div className="fc-res-id">
          <h2 className="nm">{character.name}</h2>
          <div className="fc-meta-grid">
            <div className="fc-meta">
              <div className="l">
                <span className="ic">
                  <Icon name={classIcon} size={13} />
                </span>
                Classe
              </div>
              <div className="d" style={{ textTransform: "capitalize" }}>
                {character.class}
              </div>
            </div>
            <div className="fc-meta">
              <div className="l">
                <span className="ic">
                  <Icon name={raceIcon} size={13} />
                </span>
                Raça
              </div>
              <div className="d" style={{ textTransform: "capitalize" }}>
                {character.race}
              </div>
            </div>
            <div className="fc-meta">
              <div className="l">Registro</div>
              <div className="d mono">#{character.id.slice(0, 8)}</div>
            </div>
          </div>
          {isDemo && (
            <div style={{ marginTop: 14 }}>
              <span className="fc-stamp rot">Demo</span>
            </div>
          )}
        </div>
      </div>

      {/* Base attributes */}
      <div className="fc-sec">
        <div className="fc-sec-h">
          <span className="ic">
            <Icon name="d20" size={15} />
          </span>
          Atributos Base
          <span className="n">4d6 ↓1</span>
        </div>
        <div className="fc-abilities">
          {Object.entries(character.base_attributes).map(([stat, val]) => {
            const m = mod(val);
            return (
              <div className="fc-ability" key={stat}>
                <div className="k">{stat}</div>
                <div className="v">{val}</div>
                <div className="lbl">{STAT_FULL[stat] ?? stat}</div>
                <div className={"mod" + (m < 0 ? " neg" : "")}>{signed(m)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Derived / combat */}
      <div className="fc-sec">
        <div className="fc-sec-h">
          <span className="ic">
            <Icon name="burst" size={15} />
          </span>
          Combate / Derivados
        </div>
        <div className="fc-combat">
          {Object.entries(character.derived_attributes).map(([key, val]) => {
            const meta = DERIVED_META[key];
            if (!meta) return null;
            return (
              <div className="fc-cstat" key={key}>
                <div className="top">
                  <span className="ic">
                    <Icon name={meta.icon} size={16} />
                  </span>
                  {meta.label}
                </div>
                <div className="val">{fmtDerived(val, meta.unit)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="fc-res-foot">
        <button
          className="fc-btn fc-btn-ghost"
          style={{ flex: "none" }}
          onClick={onReset}
        >
          <Icon name="refresh" size={15} /> Emitir Nova Ficha
        </button>
        <button
          className="fc-btn fc-btn-primary"
          style={{ flex: "none" }}
          onClick={renderAndPrint}
          disabled={isLoading}
        >
          🖨 {isLoading ? "Preparando..." : "Imprimir Ficha"}
        </button>
      </div>
    </div>

    <PageRender
      {...config}
      paperOptions={{ paperSize: "a4", margin: "normal", paragraphSpacing: 8 }}
    >
      <PrintContent character={character} avatarUrl={hasAvatar ? avatarUrl : null} isDemo={isDemo} />
    </PageRender>
    </>
  );
}

import { useState } from "react";
import { Character, getAvatarUrl } from "../services/api";
import { Icon } from "./Icons";
import { useSmartPrint, PageRender } from "react-smart-print";

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
  const s = {
    page:    { fontFamily: "'Cinzel', Georgia, serif", color: "#24221c", padding: "0 8px" } as React.CSSProperties,
    kicker:  { fontSize: 10, letterSpacing: 4, textTransform: "uppercase" as const, color: "#9e2b25", marginBottom: 4 },
    title:   { fontSize: 28, fontWeight: 700, margin: "4px 0 12px", letterSpacing: 1 },
    divider: { borderBottom: "2px solid #24221c", marginBottom: 18 },
    label:   { fontSize: 9, letterSpacing: 2, textTransform: "uppercase" as const, color: "#8b8468", marginBottom: 2, fontFamily: "'IBM Plex Mono', monospace" },
    value:   { fontSize: 18, marginBottom: 10, fontFamily: "'Spectral', Georgia, serif" },
    row:     { display: "flex", gap: 32, marginBottom: 18, flexWrap: "wrap" as const },
    abilityGrid: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 24 } as React.CSSProperties,
    abilityBox:  { border: "1px solid #bbb097", padding: "10px 6px 18px", textAlign: "center" as const, position: "relative" as const, background: "rgba(255,255,255,0.3)" },
    abilityK:    { fontSize: 9, letterSpacing: 2, color: "#56523f", fontFamily: "'IBM Plex Mono', monospace" },
    abilityV:    { fontSize: 34, fontWeight: 700, lineHeight: 1, margin: "4px 0 2px" },
    abilityLbl:  { fontSize: 10, fontStyle: "italic" as const, color: "#8b8468", fontFamily: "'Spectral', Georgia, serif" },
    abilityMod:  { position: "absolute" as const, bottom: -12, left: "50%", transform: "translateX(-50%)", width: 28, height: 24, border: "1px solid #bbb097", background: "#f1ece0", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600, color: "#2f3a63", fontFamily: "'IBM Plex Mono', monospace" } as React.CSSProperties,
    combatGrid:  { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 24 } as React.CSSProperties,
    combatBox:   { border: "1px solid #bbb097", padding: "10px 10px 12px", background: "rgba(255,255,255,0.3)" },
    combatLabel: { fontSize: 9, letterSpacing: 2, color: "#56523f", textTransform: "uppercase" as const, marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace" },
    combatVal:   { fontSize: 26, fontWeight: 700 },
    secHeader:   { fontSize: 10, letterSpacing: 3, textTransform: "uppercase" as const, color: "#2f3a63", borderBottom: "1.5px solid #24221c", paddingBottom: 6, marginBottom: 12, marginTop: 20, fontFamily: "'IBM Plex Mono', monospace" },
    stamp:       { display: "inline-block", border: "2px solid #9e2b25", padding: "3px 12px", color: "#9e2b25", fontWeight: 700, letterSpacing: 3, fontSize: 12, transform: "rotate(-9deg)", borderRadius: 3 },
    portrait:    { width: 110, height: 130, border: "1px solid #bbb097", objectFit: "cover" as const },
    portraitPlaceholder: { width: 110, height: 130, border: "1px solid #bbb097", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b8468", fontSize: 11, letterSpacing: 2, fontFamily: "'IBM Plex Mono', monospace" },
  }

  const STAT_FULL: Record<string, string> = { FOR:"Força", DES:"Destreza", INT:"Inteligência", CON:"Constituição", SAB:"Sabedoria", CAR:"Carisma" }
  const DERIVED_META: Record<string, { label: string; unit: string }> = {
    dano: { label: "Dano", unit: "" }, defesa: { label: "Defesa", unit: "" },
    critico: { label: "Chance Crítica", unit: "%" }, velocidade_ataque: { label: "Vel. de Ataque", unit: "×" },
  }

  const fmtMod = (v: number) => { const m = Math.floor((v - 10) / 2); return m >= 0 ? `+${m}` : `${m}` }
  const fmtDerived = (val: number, unit: string) => unit === "%" ? `${val.toFixed(1)}%` : unit === "×" ? `${val.toFixed(2)}×` : val.toFixed(1)

  return (
    <div style={s.page}>
      <div style={s.kicker}>Gerador de Personagens · D&amp;D 5e · SPD</div>
      <div style={s.title}>Ficha de Personagem</div>
      <div style={s.divider} />

      <div style={s.row}>
        {avatarUrl
          ? <img src={avatarUrl} alt={character.name} style={s.portrait} />
          : <div style={s.portraitPlaceholder}>RETRATO</div>
        }
        <div>
          <div style={s.label}>Nome</div>
          <div style={{ ...s.value, fontSize: 26, fontWeight: 700 }}>{character.name}</div>
          <div style={s.row}>
            <div><div style={s.label}>Classe</div><div style={s.value} >{character.class}</div></div>
            <div><div style={s.label}>Raça</div><div style={s.value}>{character.race}</div></div>
            <div><div style={s.label}>Registro</div><div style={{ ...s.value, fontSize: 13, fontFamily: "'IBM Plex Mono', monospace" }}>#{character.id.slice(0, 8)}</div></div>
          </div>
          {isDemo && <span style={s.stamp}>Demo</span>}
        </div>
      </div>

      <div style={s.secHeader}>Atributos Base · 4d6 ↓1</div>
      <div style={s.abilityGrid}>
        {Object.entries(character.base_attributes).map(([stat, val]) => (
          <div key={stat} style={s.abilityBox}>
            <div style={s.abilityK}>{stat}</div>
            <div style={s.abilityV}>{val}</div>
            <div style={s.abilityLbl}>{STAT_FULL[stat] ?? stat}</div>
            <div style={{ ...s.abilityMod, color: Math.floor((val-10)/2) < 0 ? "#9e2b25" : "#2f3a63" }}>{fmtMod(val)}</div>
          </div>
        ))}
      </div>

      <div style={s.secHeader}>Combate / Derivados</div>
      <div style={s.combatGrid}>
        {Object.entries(character.derived_attributes).map(([key, val]) => {
          const meta = DERIVED_META[key]; if (!meta) return null
          return (
            <div key={key} style={s.combatBox}>
              <div style={s.combatLabel}>{meta.label}</div>
              <div style={s.combatVal}>{fmtDerived(val, meta.unit)}</div>
            </div>
          )
        })}
      </div>

      <div style={{ borderTop: "2px solid #24221c", paddingTop: 12, marginTop: 8, fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: 2, color: "#8b8468", textTransform: "uppercase" as const }}>
        Selado por Worker · {new Date().toLocaleDateString("pt-BR")} · SPD Producer-Consumer · Flask → Redis
      </div>
    </div>
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

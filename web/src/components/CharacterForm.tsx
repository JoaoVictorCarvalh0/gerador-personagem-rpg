import { useState } from "react";
import { CharacterPayload } from "../services/api";
import { Icon } from "./Icons";

interface Props {
  onGenerate: (payload: CharacterPayload) => void;
  onBatch: (payloads: CharacterPayload[]) => void;
  onLogout: () => void;
}

const CLASSES = [
  { id: "guerreiro", label: "Guerreiro", icon: "sword" },
  { id: "mago", label: "Mago", icon: "wand" },
  { id: "arqueiro", label: "Arqueiro", icon: "bow" },
  { id: "ladino", label: "Ladino", icon: "dagger" },
  { id: "clérigo", label: "Clérigo", icon: "chalice" },
];

const RACES = [
  { id: "humano", label: "Humano", icon: "human" },
  { id: "elfo", label: "Elfo", icon: "elf" },
  { id: "anão", label: "Anão", icon: "dwarf" },
  { id: "halfling", label: "Halfling", icon: "halfling" },
  { id: "tiefling", label: "Tiefling", icon: "tiefling" },
];

const RANDOM_NAMES = [
  "Thordak", "Lyria", "Grimstone", "Aelindra", "Varek",
  "Syndra", "Borin", "Elara", "Draven", "Miriel",
];

const randOf = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

interface OptRowProps {
  legend: string;
  num: string;
  options: { id: string; label: string; icon: string }[];
  value: string;
  onChange: (v: string) => void;
}

function OptRow({ legend, num, options, value, onChange }: OptRowProps) {
  return (
    <div className="fc-field">
      <span className="fc-legend">
        {legend} <span className="num">/ {num}</span>
      </span>
      <div className="fc-opts">
        <div
          className={"fc-opt" + (value === "aleatorio" ? " sel" : "")}
          onClick={() => onChange("aleatorio")}
        >
          <span className="box">
            {value === "aleatorio" && (
              <Icon name="check" size={11} variant="forjado" strokeWidth={3} />
            )}
          </span>
          <span className="ic"><Icon name="d20" size={18} /></span>
          <span className="nm">Aleatório</span>
        </div>
        {options.map((o) => (
          <div
            key={o.id}
            className={"fc-opt" + (value === o.id ? " sel" : "")}
            onClick={() => onChange(o.id)}
          >
            <span className="box">
              {value === o.id && (
                <Icon name="check" size={11} variant="forjado" strokeWidth={3} />
              )}
            </span>
            <span className="ic"><Icon name={o.icon} size={18} /></span>
            <span className="nm">{o.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface BatchModalProps {
  onConfirm: (qty: number) => void;
  onClose: () => void;
}

function BatchModal({ onConfirm, onClose }: BatchModalProps) {
  const [qty, setQty] = useState(3);

  return (
    <div className="batch-overlay" onClick={onClose}>
      <div className="batch-modal" onClick={(e) => e.stopPropagation()}>
        <span className="fc-crop tl" /><span className="fc-crop tr" />
        <span className="fc-crop bl" /><span className="fc-crop br" />

        <div className="batch-modal__head">
          <div className="batch-modal__kick">Emissão em Lote</div>
          <div className="batch-modal__ttl">Quantas fichas?</div>
        </div>

        <div className="batch-modal__body">
          <div className="batch-qty">
            <button
              className="batch-qty__btn"
              onClick={() => setQty(q => Math.max(2, q - 1))}
              disabled={qty <= 2}
            >−</button>
            <span className="batch-qty__val">{qty}</span>
            <button
              className="batch-qty__btn"
              onClick={() => setQty(q => Math.min(20, q + 1))}
              disabled={qty >= 20}
            >+</button>
          </div>
          <p className="batch-modal__hint">
            {qty} fichas serão enfileiradas simultaneamente.<br />
            Nomes serão sorteados automaticamente.
          </p>
        </div>

        <div className="batch-modal__actions">
          <button className="fc-btn fc-btn-primary" onClick={() => onConfirm(qty)}>
            <Icon name="sword" size={15} /> Emitir {qty} fichas
          </button>
          <button className="fc-btn fc-btn-ghost" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export function CharacterForm({ onGenerate, onBatch, onLogout }: Props) {
  const [name, setName] = useState("");
  const [classe, setClasse] = useState("aleatorio");
  const [raca, setRaca] = useState("aleatorio");
  const [mainColor, setMain] = useState("#2f3a63");
  const [secColor, setSec] = useState("#9e2b25");
  const [showBatch, setShowBatch] = useState(false);

  const buildPayload = (): CharacterPayload => ({
    name: name.trim() || randOf(RANDOM_NAMES),
    class: classe === "aleatorio" ? randOf(CLASSES).id : classe,
    race: raca === "aleatorio" ? randOf(RACES).id : raca,
    main_color: mainColor,
    secondary_color: secColor,
  });

  const submit = () => onGenerate(buildPayload());

  const handleBatchConfirm = (qty: number) => {
    setShowBatch(false);
    const payloads = Array.from({ length: qty }, () => buildPayload());
    onBatch(payloads);
  };

  return (
    <>
      <div className="fc-sheet fade-in">
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
            <div>FORMULÁRIO <b>F-01</b></div>
            <div>PREENCHER E EMITIR</div>
          </div>
        </div>

        <div className="fc-field">
          <span className="fc-legend">
            Nome do Personagem <span className="num">/ 01</span>
          </span>
          <input
            className="fc-write"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="deixe em branco para sorteio automático"
          />
        </div>

        <OptRow legend="Classe" num="02" options={CLASSES} value={classe} onChange={setClasse} />
        <OptRow legend="Raça"   num="03" options={RACES}   value={raca}   onChange={setRaca} />

        <div className="fc-field">
          <span className="fc-legend">
            Estandarte / Cores <span className="num">/ 04</span>
          </span>
          <div className="fc-row2">
            <label className="fc-color">
              <span className="fc-swatch" style={{ background: mainColor }}>
                <input type="color" value={mainColor} onChange={(e) => setMain(e.target.value)} />
              </span>
              <span className="meta">
                <span className="t">Principal</span>
                <span className="v">{mainColor.toUpperCase()}</span>
              </span>
            </label>
            <label className="fc-color">
              <span className="fc-swatch" style={{ background: secColor }}>
                <input type="color" value={secColor} onChange={(e) => setSec(e.target.value)} />
              </span>
              <span className="meta">
                <span className="t">Secundária</span>
                <span className="v">{secColor.toUpperCase()}</span>
              </span>
            </label>
          </div>
        </div>

        <div className="fc-actions">
          <button className="fc-btn fc-btn-primary" onClick={submit}>
            <Icon name="sword" size={16} /> Emitir Ficha
          </button>
          <button className="fc-btn fc-btn-ghost" onClick={() => setShowBatch(true)}>
            <Icon name="scroll" size={16} /> Emitir em Lote
          </button>
          <button className="fc-btn fc-btn-ghost fc-btn--logout" onClick={onLogout} title="Sair da conta">
            <Icon name="key" size={16} /> Sair
          </button>
        </div>
      </div>

      {showBatch && (
        <BatchModal onConfirm={handleBatchConfirm} onClose={() => setShowBatch(false)} />
      )}
    </>
  );
}

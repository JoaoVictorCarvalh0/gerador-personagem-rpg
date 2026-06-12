"""
analisar_resultados.py
----------------------
Lê os CSVs gerados pelo Locust e produz:
  - Tabela de comparação de desempenho por cenário
  - Gráficos de speedup, latência e throughput
  - Análise de eficiência (Lei de Amdahl)

Uso:
  pip install pandas matplotlib
  python analisar_resultados.py
"""

import os
import glob
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker

RESULTS_DIR = "resultados"
OUTPUT_DIR  = "graficos"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def carregar_resultados():
    arquivos = glob.glob(f"{RESULTS_DIR}/*_stats.csv")
    rows = []
    for f in sorted(arquivos):
        label = os.path.basename(f).replace("_stats.csv", "")
        try:
            df = pd.read_csv(f)
            agg = df[df["Name"] == "Aggregated"].iloc[0]

            parts = label.split("_")
            workers_str = [p for p in parts if "worker" in p]
            users_str   = [p for p in parts if "users" in p]

            workers = int(workers_str[0].replace("workers","").replace("worker","")) if workers_str else 1
            users   = int(users_str[0].replace("users","")) if users_str else 0

            rows.append({
                "label":      label,
                "workers":    workers,
                "users":      users,
                "requests":   int(agg["Request Count"]),
                "failures":   int(agg["Failure Count"]),
                "fail_pct":   round(int(agg["Failure Count"]) / max(int(agg["Request Count"]),1) * 100, 2),
                "median_ms":  float(agg["Median Response Time"]),
                "avg_ms":     float(agg["Average Response Time"]),
                "p95_ms":     float(agg["95%"]),
                "p99_ms":     float(agg["99%"]),
                "rps":        float(agg["Requests/s"]),
            })
        except Exception as e:
            print(f"  Aviso: não consegui ler {f}: {e}")

    return pd.DataFrame(rows)


def tabela_resumo(df):
    print("\n" + "═" * 100)
    print("  TABELA DE RESULTADOS")
    print("═" * 100)
    print(f"  {'Cenário':<32} {'Workers':>7} {'Usuários':>8} {'Req':>6} {'Falhas':>7} {'RPS':>7} {'Mediana':>9} {'P95':>9} {'P99':>9}")
    print("  " + "─" * 98)
    for _, r in df.iterrows():
        print(f"  {r['label']:<32} {r['workers']:>7} {r['users']:>8} "
              f"{r['requests']:>6} {r['fail_pct']:>6.1f}% "
              f"{r['rps']:>7.1f} {r['median_ms']:>8.0f}ms "
              f"{r['p95_ms']:>8.0f}ms {r['p99_ms']:>8.0f}ms")
    print("═" * 100)


def analise_amdahl(df):
    print("\n" + "═" * 60)
    print("  ANÁLISE DE EFICIÊNCIA (Lei de Amdahl)")
    print("═" * 60)

    for users in sorted(df["users"].unique()):
        sub = df[df["users"] == users].sort_values("workers")
        if len(sub) < 2:
            continue

        baseline_rps = sub[sub["workers"] == sub["workers"].min()]["rps"].values[0]
        print(f"\n  {users} usuários simultâneos (baseline: {baseline_rps:.1f} RPS com 1 worker):")
        print(f"  {'Workers':>8} {'RPS':>8} {'Speedup':>9} {'Eficiência':>11} {'Latência P95':>13}")
        print(f"  {'─'*52}")
        for _, r in sub.iterrows():
            speedup    = r["rps"] / baseline_rps
            eficiencia = (speedup / r["workers"]) * 100
            print(f"  {r['workers']:>8} {r['rps']:>8.1f} {speedup:>8.2f}× {eficiencia:>10.1f}% {r['p95_ms']:>12.0f}ms")

    print("\n" + "═" * 60)


def grafico_speedup(df):
    grupos = df["users"].unique()
    fig, axes = plt.subplots(1, len(grupos), figsize=(7 * len(grupos), 5))
    if len(grupos) == 1:
        axes = [axes]
    fig.suptitle("Speedup — Gerador Paralelo de Personagens RPG", fontsize=14, fontweight="bold")

    cores = ["#E53935", "#43A047", "#1E88E5", "#FB8C00"]

    for ax, users in zip(axes, sorted(grupos)):
        sub = df[df["users"] == users].sort_values("workers")
        if sub.empty:
            continue

        baseline = sub["rps"].values[0]
        speedups  = sub["rps"] / baseline
        labels    = sub["workers"].astype(str).tolist()

        ax.bar(labels, speedups, color=cores[:len(sub)], width=0.5, zorder=3)
        ax.axhline(y=1, color="gray", linestyle="--", alpha=0.5, label="Baseline")

        ideal = sub["workers"].values / sub["workers"].values[0]
        ax.plot(labels, ideal, "k--", alpha=0.3, linewidth=1.5, label="Ideal (linear)")

        ax.set_title(f"{users} usuários simultâneos")
        ax.set_xlabel("Número de Workers")
        ax.set_ylabel("Speedup (×)")
        ax.legend(fontsize=9)
        ax.grid(axis="y", alpha=0.3, zorder=0)
        ax.yaxis.set_major_formatter(ticker.FormatStrFormatter("%.1f×"))

        for i, (_, s) in enumerate(zip(labels, speedups)):
            ax.text(i, s + 0.02, f"{s:.2f}×", ha="center", fontsize=10, fontweight="bold")

    plt.tight_layout()
    out = f"{OUTPUT_DIR}/1_speedup.png"
    plt.savefig(out, dpi=150, bbox_inches="tight")
    print(f"  ✓ {out}")
    plt.close()


def grafico_latencia(df):
    fig, ax = plt.subplots(figsize=(max(10, len(df) * 1.5), 5))
    fig.suptitle("Latência por Cenário", fontsize=14, fontweight="bold")

    x     = range(len(df))
    width = 0.25

    ax.bar([i - width for i in x], df["median_ms"], width, label="Mediana (P50)", color="#43A047", alpha=0.85, zorder=3)
    ax.bar([i          for i in x], df["p95_ms"],   width, label="P95",           color="#FB8C00", alpha=0.85, zorder=3)
    ax.bar([i + width  for i in x], df["p99_ms"],   width, label="P99",           color="#E53935", alpha=0.85, zorder=3)

    ax.set_xticks(x)
    ax.set_xticklabels([r["label"].replace("_","\n") for _, r in df.iterrows()], fontsize=8)
    ax.set_ylabel("Latência (ms)")
    ax.legend()
    ax.grid(axis="y", alpha=0.3, zorder=0)

    plt.tight_layout()
    out = f"{OUTPUT_DIR}/2_latencia.png"
    plt.savefig(out, dpi=150, bbox_inches="tight")
    print(f"  ✓ {out}")
    plt.close()


def grafico_throughput(df):
    fig, ax = plt.subplots(figsize=(9, 5))
    fig.suptitle("Throughput (RPS) × Workers", fontsize=14, fontweight="bold")

    cores = ["#1E88E5", "#43A047", "#FB8C00", "#E53935"]
    for i, users in enumerate(sorted(df["users"].unique())):
        sub = df[df["users"] == users].sort_values("workers")
        ax.plot(sub["workers"], sub["rps"], "o-",
                label=f"{users} usuários", color=cores[i % len(cores)],
                linewidth=2, markersize=8, zorder=3)
        for _, r in sub.iterrows():
            ax.annotate(f"{r['rps']:.1f}", (r["workers"], r["rps"]),
                        textcoords="offset points", xytext=(0, 8),
                        ha="center", fontsize=9)

    ax.set_xlabel("Número de Workers")
    ax.set_ylabel("Requisições por segundo (RPS)")
    ax.legend()
    ax.grid(alpha=0.3, zorder=0)
    ax.xaxis.set_major_locator(ticker.MaxNLocator(integer=True))

    plt.tight_layout()
    out = f"{OUTPUT_DIR}/3_throughput.png"
    plt.savefig(out, dpi=150, bbox_inches="tight")
    print(f"  ✓ {out}")
    plt.close()


def grafico_falhas(df):
    fig, ax = plt.subplots(figsize=(max(8, len(df) * 1.2), 4))
    fig.suptitle("Taxa de Falhas por Cenário (%)", fontsize=14, fontweight="bold")

    cores = ["#43A047" if f == 0 else "#FB8C00" if f < 5 else "#E53935" for f in df["fail_pct"]]
    ax.bar(range(len(df)), df["fail_pct"], color=cores, width=0.6, zorder=3)
    ax.set_xticks(range(len(df)))
    ax.set_xticklabels([r["label"].replace("_","\n") for _, r in df.iterrows()], fontsize=8)
    ax.set_ylabel("Falhas (%)")
    ax.axhline(y=5, color="red", linestyle="--", alpha=0.5, label="Limite aceitável (5%)")
    ax.legend()
    ax.grid(axis="y", alpha=0.3, zorder=0)

    for i, v in enumerate(df["fail_pct"]):
        if v > 0:
            ax.text(i, v + 0.05, f"{v:.1f}%", ha="center", fontsize=9)

    plt.tight_layout()
    out = f"{OUTPUT_DIR}/4_falhas.png"
    plt.savefig(out, dpi=150, bbox_inches="tight")
    print(f"  ✓ {out}")
    plt.close()


def main():
    print("\nCarregando resultados...")
    df = carregar_resultados()

    if df.empty:
        print("\n  Nenhum CSV válido encontrado em ./resultados/")
        return

    print(f"  {len(df)} cenários carregados.\n")

    tabela_resumo(df)
    analise_amdahl(df)

    print("\nGerando gráficos...")
    grafico_speedup(df)
    grafico_latencia(df)
    grafico_throughput(df)
    grafico_falhas(df)

    print(f"\n  Gráficos salvos em ./{OUTPUT_DIR}/")
    print("  Use-os no relatório técnico e nos slides.\n")


if __name__ == "__main__":
    main()
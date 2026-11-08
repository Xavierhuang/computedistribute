# GPU Rental Pricing and Seller Economics (as of 2026-11-08)

Notes compiled 2026-11-08. Every price has a date and source. Aggregators often disagree, and many sell GPU capacity themselves (Spheron, Thunder Compute, Vast.ai). Read their numbers as snapshots, not settled facts.

## 1. Current (late 2026) prices per GPU-hour by GPU and provider type

### Takeaway
In early November 2026, H100s rent for about **$3.00–3.10/GPU-hr** on transaction and spot-style indexes. On-demand list prices are higher: about **$4.2 median**, about **$4.0–4.5 at neoclouds**, and **$6.9–12.3 at hyperscalers**. H200 rents for about $5.3–6.4, B200 for about $8–10 (with batch and 8x outliers at about $3.50), A100 80GB for about $1.1–1.9, and L40S for about $1.0–1.3. Consumer cards on marketplaces are much cheaper: RTX 5090 about $0.50–1.00, RTX 4090 about $0.16–0.45 (marketplace/Salad), and RTX 3090 about $0.13–0.22.

### Cited Findings
**Indexes (spot/transaction-style)**
- Ornn OCPI-H100 (volume-weighted, winsorized average of *transacted* H100 SXM rentals; Bloomberg ticker ORNNH100): **$3.10/GPU-hr settled 2026-11-07**, +8.8% over the month. 30-day low $2.65 (Oct 10), high $3.53 (Nov 3). Month-end settles: Sep $2.69, Oct $3.00. Low since Aug 9: $2.46 — [Ornn H100 SXM market](https://data.ornn.com/markets/h100-sxm)
- Silicon Data H100 Rental Price Index: **$3.00/GPU-hr on 2026-11-08**, up from about $2.82 in mid-October (from a search-result summary of the index table, not fetched directly) — [Silicon Data H100 index](https://www.silicondata.com/products/silicon-index/h100)
- Uvik's October 2026 survey: H100 on-demand median **$4.20/GPU-hr** across 16 providers. Mercatus's September 2026 tracker: average **$3.84** across 27 providers, with Vast.ai listings as low as about $1.47–3.00 (search-result summaries) — [Uvik](https://uvik.net/blog/gpu-price-index/); [Mercatus](https://www.mercatus-ai.com/blog/gpu-rental-prices)

**Secure on-demand snapshot, 2026-11-08 (gpuperhour.com index; excludes spot, marketplace and reserved)** — [gpuperhour GPU Price Index](https://gpuperhour.com/gpu-price-index)
| GPU | Median $/GPU-hr | Min | Min provider |
|---|---|---|---|
| H100 SXM5 80GB | 4.16 | 2.90 | Ori |
| H100 PCIe 80GB | 3.20 | 2.85 | Vast.ai |
| H200 SXM 141GB | 6.44 | 5.29 | RunPod |
| B200 SXM 192GB | 9.99 | 7.99 | RunPod |
| A100 SXM4 80GB | 1.50 | 1.07 | Vast.ai |
| A100 PCIe 80GB | 1.49 | 0.68 | LeaderGPU |
| L40S 48GB | 1.32 | 0.97 | Massed Compute |
| RTX 4090 24GB | 1.73 | 0.41 | Vast.ai |
| RTX 5090 32GB | 1.00 | 0.53 | Vast.ai |
| RTX 3090 | not in index | — | — |
- Caveat from the same source: only 3 providers were in the H200/B200 sample on the snapshot date. The H200 minimum rose from $3.50 in early October to $5.29 from Oct 17. The B200 minimum rose from $3.75 in late September to $7.99 by mid-October. The RTX 4090 median ranged from $0.74 to $1.80 over 55 days — [gpuperhour](https://gpuperhour.com/gpu-price-index)

**Cross-provider medians including marketplaces (GetDeploying data, reproduced by Aura Digital), USD/GPU-hr on-demand** — [Aura Digital, citing GetDeploying (CC BY 4.0)](https://auradigitalglobal.com/blog/vast-ai-gpu-server-earnings/)
| GPU | 3 Aug 2026 | 5 Oct 2026 |
|---|---|---|
| B200 | 6.64 | 6.79 |
| H200 | 4.29 | 4.63 |
| H100 | 3.38 | 3.49 |
| RTX PRO 6000 | 2.21 | 2.20 |
| A100 | 1.87 | 1.85 |
| RTX 5090 | 0.58 | 0.70 (cheapest listing $0.35) |
| RTX 4090 | 0.44 | 0.44 |
| RTX 3090 | 0.22 | 0.22 (dipped to 0.13 on 17 Aug) |
- The number of RTX 5090 providers grew from 8 (week of 3 Aug) to 18 (week of 5 Oct) — [Aura Digital](https://auradigitalglobal.com/blog/vast-ai-gpu-server-earnings/)
- **Note the gap:** gpuperhour's "secure" 4090 median ($1.73) is about 4x the all-provider median ($0.44). Marketplace (community) listings are what pull consumer-card prices down.

**Hyperscalers and neoclouds, H100 per GPU-hr (aggregator figures, mid-2026 to Nov 2026; not checked against official pages)** — [search summary of CloudZero, Spheron, Thunder Compute, ComputeStacker and others](https://computestacker.com/insights/h100-pricing/); [Spheron CoreWeave vs Nebius](https://www.spheron.network/blog/coreweave-vs-nebius-h100-and-h200-pricing-2026/); [Thunder Compute H100 pricing Nov 2026](https://www.thundercompute.com/blog/nvidia-h100-pricing)
- AWS p5: about **$6.88** (after the June 2025 cut; $55.04 per 8-GPU instance)
- Azure ND H100 v5: about **$12.29** ($98.32 per 8-GPU instance). The single-GPU NC40ads_H100_v5 is about $6.98 in East US
- GCP A3 High: about **$10.98** on-demand, about **$3.69 spot** (Spheron table)
- CoreWeave: about **$6.16** on-demand (8-GPU nodes only), about $2.46 spot
- Lambda: **$3.99** (8x H100 SXM node), $4.29 (1x), about $3.29 (PCIe)
- Nebius: **$4.50**, raised from $3.85 on 2026-10-01 (some sources still show $3.85)
- Mid-2026 medians by provider type: marketplaces/boutique clouds $1.70 (low end $1.38–1.49), neoclouds $2.31 ($1.90–3.50), hyperscaler on-demand $6.11 ($6–12+), reserved listings $5.52 ($1.07–10.14) — [ColoPrice](https://coloprice.com/guides/h100-rental-prices/)

**Blackwell / other**
- B200 (Nov 6, 2026 index): median $8.79, min $7.99 (RunPod). Vultr lists 8x HGX B200 at $3.50/GPU-hr. Spheron lists B200 at $11.06 on-demand and **$5.22 spot** (31 Oct 2026). HPC-AI lists B200 SXM from $7.50 on-demand and $3.50 on its batch tier, H200 SXM from $2.68, RTX 5090 from $0.62 — [Spheron comparison](https://www.spheron.network/blog/gpu-cloud-pricing-comparison-2026/); [HPC-AI pricing](https://www.hpc-ai.com/pricing); [gpu.ai index](https://gpu.ai/gpu-price-index)
- RTX 5090: lowest at $0.50/hr on Salad Cloud (aggregator) — [computeprices](https://computeprices.com/gpu)

**Marketplaces/consumer**
- SaladCloud RTX 4090 renter pricing tiers: **$0.440 High / $0.347 Medium / $0.253 Low / $0.160 Lowest per GPU-hr** (pricing page, per search summary). A third-party tracker shows a different High of $0.330 — [Salad pricing](https://salad.com/pricing/); [computeprices Salad](https://computeprices.com/providers/salad)
- Vast.ai: interruptible instances save renters 50–80% versus on-demand. Datacenter H100/H200 hosts earn about $2.15–4.00+/GPU-hr (Vast, May 18 2026) — [Vast.ai article](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai)
- RTX 4090 on Vast: estimates range from about $0.136–0.349/hr (July 2026) to an October 2026 on-demand median of $0.71/hr, depending on the listing sample (search summary) — [Thunder Compute vs Vast](https://www.thundercompute.com/blog/vast-ai-vs-thunder-compute); [computeprices Vast](https://computeprices.com/providers/vast)

### Inferences
- Benchmark prices depend on the basket. The best "market-clearing" H100 figure is about $3.0–3.1 (Ornn/Silicon Data, Nov 2026). "List price" medians of about $3.5–4.2 overstate what sophisticated buyers pay, and hyperscaler list prices ($7–12) are 2–4x the market.
- The price ladder is roughly B200 ≈ 2.5–3x H100, H200 ≈ 1.5–2x H100, A100 ≈ 0.5x H100, L40S ≈ 0.4x, RTX 5090 ≈ 0.2x, RTX 4090 ≈ 0.12–0.15x, RTX 3090 ≈ 0.06x (using all-provider medians).

### Gaps
- I did not fetch official AWS/GCP/Azure/CoreWeave/Lambda/Nebius pricing pages. Hyperscaler numbers come from aggregators and conflict (e.g., Azure $6.98 vs $12.29 depending on SKU).
- I found no reliable spot/interruptible indexes for consumer GPUs or for A100/L40S. TensorDock and RunPod consumer-card prices were not individually verified.
- RTX 3090 data comes only from GetDeploying medians ($0.13–0.22).

## 2. Price trend 2023 → 2026, forecasts, and price floor

### Takeaway
H100 rentals fell from about **$8/hr (mid-2023)** to a trough of about **$1.70/hr (Oct 2025, SemiAnalysis 1-yr index)**. They then *rose* about 40–80% during 2026, driven by inference demand. The October 2025 low did not hold as a floor. Prices bounced to about $2.35 (Mar 2026 1-yr contracts), about $2.5 (mid-2026), and about $3.0–3.1 (Nov 2026 spot indexes). The "H100 heading to $1" story has not happened yet in 2026. Forecasts of declines are opinion, tied to Blackwell/Rubin supply in 2027–28.

### Cited Findings
- Timeline from ColoPrice, which synthesizes Silicon Data, SemiAnalysis and others: mid-2023 about $8.00/hr; 2024 $3–5 and falling; H1 2025 $2–3; Oct 2025 low $1.70; Dec 2025 → Jan 2026 spot $2.00 → $2.20 (+10% in 4 weeks); Mar 2026 $2.35 on 1-yr contracts (+40% from the low); mid-2026 about $2.53 (Silicon Data index) — [ColoPrice](https://coloprice.com/guides/h100-rental-prices/)
- SemiAnalysis launched a public H100 one-year rental index in its April 2026 "Great GPU Shortage" report, built from surveys of 100+ market participants and checked against transactions. It rose from $1.70 (Oct 2025) to about $2.35 (Mar 2026). SemiAnalysis attributes the rise to demand from Claude Code, open-weight models and multi-agent workloads, and argues rental pricing is "self-reinforcing" and likely to keep rising (search summary) — [2ooks summary of SemiAnalysis](https://2ooks.github.io/knowledge-base/summaries/great-gpu-shortage-rental-capacity.html); [rallies.ai](https://rallies.ai/news/h100-gpu-rental-rates-surge-40-to-235hour-as-ai-demand-outpaces-supply)
- A secondary write-up of a talk by SemiAnalysis CEO Dylan Patel puts the 1-yr H100 rate at about **$2.80/hr**, about 65% above the Oct 2025 trough. This is unconfirmed against SemiAnalysis's own page — [FourWeekMBA](https://fourweekmba.com/ai-patels-data-puts-nvidia-h100-rent-up-65-in-a-year-at-2-80/)
- A16z-cited Silicon Data figures (late Feb 2026): A100 RT index $1.38/hr, H100 RT index $2.41/hr. A100 neocloud prices "surged sharply" in early 2026 (search summary) — [OfficeChai](https://officechai.com/ai/surging-rental-costs-of-older-gpus-signals-robust-ai-demand); [NextBigFuture June 2026](https://www.nextbigfuture.com/2026/06/live-rental-prices-for-h100-and-other-gpus-increasing.html)
- The indexes disagree on levels and magnitudes. Bloomberg lists Silicon Data, Ornn and Compute Desk as GPU price providers, and SemiAnalysis is a fourth — [KuCoin news](https://www.kucoin.com/news/flash/gpu-pricing-disarray-four-indices-diverge-market-lacks-consensus)
- Short-run momentum is still upward: Ornn H100 Sep month-end $2.69 → Oct $3.00 → Nov 7 $3.10. Silicon Data went from $2.82 in mid-Oct to $3.00 on Nov 8 — [Ornn](https://data.ornn.com/markets/h100-sxm); [Silicon Data](https://www.silicondata.com/products/silicon-index/h100)
- Blackwell prices are also rising in Q4 2026 at the low end: B200 minimum $3.75 → $7.99, H200 minimum $3.50 → $5.29, Sep → Oct 2026 — [gpuperhour](https://gpuperhour.com/gpu-price-index)
- Forecast (ColoPrice author's opinion, not sourced): H100 holds $2–3 through 2026, then falls toward **$1–1.50/hr as Blackwell saturates in 2027–28**, approaching "power-plus-margin economics." Downward pressures: Blackwell volume (each B200 displaces about 2.5–3 H100-equivalents), and 2023–24 reservations expiring and pushing used H100/A100 onto secondary markets. Upward pressures: inference demand, and no new H100 production — [ColoPrice](https://coloprice.com/guides/h100-rental-prices/)
- Financialization: CME (with Silicon Data) and ICE (with Ornn) are launching cash-settled GPU compute futures — [ColoPrice](https://coloprice.com/guides/h100-rental-prices/); [ICE IR](https://ir.theice.com)
- Ownership economics behind any floor: new H100 $25k–40k, used $6k–22k (mid-2026). Owning, especially used plus colocation, beats renting above about 60% utilization over more than 18–24 months. Colocation is about $196/kW/month — [ColoPrice](https://coloprice.com/guides/h100-rental-prices/)

### Inferences
- The 2023→2025 decline (about $8 → $1.70, roughly -80%) was a supply overshoot. The 2026 rebound shows the "floor" is set by demand as well as cost. The October 2025 $1.70 roughly marks where operators with expensive debt-financed capacity stopped cutting.
- A rough cost-based floor for a fully depreciated or used H100: about 1–1.4 kW all-in × $0.08–0.15/kWh ≈ $0.10–0.20/hr in power, plus colocation (about $0.25–0.35/hr at $196/kW-month) and capital recovery on a $6k–14k used card. That puts a floor near **$0.8–1.2/hr**, consistent with the $1–1.50 long-run forecast. (Illustrative calculation, not sourced.)
- For a consumer-compute marketplace, H100 scarcity in 2026 pushes some price-sensitive inference demand onto RTX 4090/5090 and RTX PRO 6000. The growing count of 5090 providers (8 → 18 in two months) suggests supply is entering to meet it.

### Gaps
- No primary SemiAnalysis or Silicon Data long-run series was fetched, so the 2023–2025 numbers come from a secondary synthesis (ColoPrice).
- I found no consumer-GPU (4090/3090) price history before mid-2026.
- No futures curve prices are available yet.

## 3. Utilization: how often marketplace hosts actually get rented

### Takeaway
**No platform publishes host occupancy.** Vast.ai shows occupancy only inside logged-in host dashboards. The only data points are assumptions (Vast's own examples use 80%) and individual operator anecdotes. Those anecdotes imply that verified, well-priced hosts can reach high occupancy, while unverified hosts get almost nothing.

### Cited Findings
- Vast.ai does not publish per-GPU utilization. Its calculator takes a user-entered utilization, and its docs say occupancy stats are visible only in the host dashboard after registration (search summary) — [Vast hosting calculator](https://vast.ai/hosting/calculator)
- Vast's own earnings example assumes **80% utilization** for a four-GPU RTX 5090 rig ($700–1,400/month) (May 18, 2026) — [Vast.ai article](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai)
- Operator anecdote (RedPandaMining, May 2026 video, via Endless Mining): verified RTX 4090 about **$6/day** each, verified RTX 5090 about $9/day, **unverified 4090 at the same price about $0.05/day** — [Endless Mining, 2026-05-19](https://endlessmining.com/us/blog/renting-your-gpu-for-ai-2026)
- New hosts earn about 30–40% of steady-state earnings in month 1 and stabilize around month 3. The uptime target is ≥95% during listed hours — [Endless Mining](https://endlessmining.com/us/blog/renting-your-gpu-for-ai-2026)
- Operator log (8-GPU server on Vast, Jul–Oct 2026): 270+ rentals since July, mostly short. In a 5.6-day September sample, 17 of 23 ended rentals lasted under an hour. The longest rental was 62 days on all 8 GPUs. Payouts were held for review three times (8, 10, 12 days). The reliability score fell from 99.8% to 96.7% after one memory failure. The author says utilization is "not knowable in advance" — [Aura Digital](https://auradigitalglobal.com/blog/vast-ai-gpu-server-earnings/)
- Platform scale (conflicting third-party figures): 17,000+ GPUs from 1,400 hosts with about 700k rental transactions/month, versus about 22,000 GPUs from 4,500+ hosts (Q2 2026). Vast claims 20,000+ GPUs across 40+ datacenters (search summary) — [Fast.io review](https://fast.io/resources/vast-ai-review-2026/); [ClusterBid deep dive](https://clusterbid.com/blog/vast-ai-gpu-marketplace-deep-dive-decentralized-pricing-reliability)

### Inferences
- Back-solving from the anecdote: a verified 4090 earning $6/day at a host rate of about $0.33/hr implies about **75% occupancy**. The unverified host's $0.05/day implies under 1%. Utilization is bimodal and depends on verification, reliability score and price rank, more than on hardware.
- Short rentals dominate (17 of 23 under an hour), so occupancy depends on staying near the top of the price-sorted search results, which pushes hosts toward price competition.

### Gaps
- No aggregate or audited occupancy data for Vast.ai, RunPod Community, Salad or TensorDock. Reddit (r/vastai) host reports could not be retrieved directly. Searches returned blogs, not threads.

## 4. Seller earnings: realistic monthly net for a single RTX 3090/4090/5090 host

### Takeaway
A single consumer GPU nets roughly **$5–125/month in the US and -$15 to +$75/month in the EU** for 3090/4090 cards, and about **$35–225/month for a 5090**. The range depends on occupancy, before hardware depreciation. Near-zero is a common outcome for unverified or residential hosts. At EU household electricity prices (€0.28/kWh), a 3090 is roughly break-even or loss-making.

### Cited Findings (inputs)
- US residential electricity: EIA STEO projects an average of **18.2¢/kWh for 2026**. July 2026 was 18.3¢ — [EIA STEO](https://www.eia.gov/outlooks/steo/report/elec_coal_renew.php); [electricrates.org](https://electricrates.org/states/report/2026-06/)
- EU household electricity: Eurostat H1 2026 average about **€0.28/kWh** (down 2.2% from €0.29 in H2 2025). Ireland €0.39, Germany and Belgium €0.36 — [Brussels Times on Eurostat](https://www.brusselstimes.com/2384846/eu-electricity-prices-ease-in-2026-but-remain-elevated-after-energy-crisis)
- Vast.ai fee structure: since June 2024 Vast charges hosts no explicit fee and adds its margin to the renter price. Renters paid about **1.33x the host price** (host keeps about 75%) — [Aura Digital](https://auradigitalglobal.com/blog/vast-ai-gpu-server-earnings/). Vast says live prices are "about 25% above what hosts earn" — [Vast.ai](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai). Other guides cite 10–25% platform fees — [Endless Mining](https://endlessmining.com/us/blog/renting-your-gpu-for-ai-2026)
- Vast's stated host earnings for an RTX 5090: **$0.30–0.60/GPU-hr** depending on rental type and reliability — [Vast.ai](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai)
- Power model: rented system power ≈ card TDP × 1.3. Idle persistence-mode settings matter (+440 W across 8 cards when off) — [Aura Digital](https://auradigitalglobal.com/blog/vast-ai-gpu-server-earnings/). A 4090 under load draws about 350–450 W, about $40–50/month flat-out 24/7 at $0.15/kWh. Power-limiting to 80–90% cuts power with little earnings loss — [EarnifyHub](https://earnifyhub.com/learning-guides/make-money-renting-out-gpu-2026)
- Endless Mining's estimated monthly *net* per card at $0.12/kWh: 3090 about $40, 4090 about $50–60, 5090 about $85, A100 80GB $400+. Electricity, depreciation and fees eat about 30–65% of gross. A 4090 "barely breaks even or loses money" at ≥$0.30/kWh. Real margin exists below $0.15/kWh, and consumer cards are "very hard" above $0.25/kWh — [Endless Mining](https://endlessmining.com/us/blog/renting-your-gpu-for-ai-2026)
- Salad: one owner reports a 24/7 4090 averaging about **$2.87/day net after power** (range $1–5/day). Salad pays in "balance" redeemable for gift cards or crypto and is described as paying the least of the platforms (unverified secondary sources) — [CloudEarn Salad review](https://www.cloudearn.net/salad/); [Endless Mining](https://endlessmining.com/us/blog/renting-your-gpu-for-ai-2026)
- 8x RTX 5090 server on Vast at $0.703/hr renter price, 75% host share, $0.15/kWh: net **$2,424/mo at 100%** utilization, **$1,406 at 60%**, **$643 at 30%** (about $300 / $176 / $80 per GPU). At the $0.35 cheapest listing, the 30% scenario nets about $179/mo for the whole server. The 30% scenario stops covering power above about $0.25/kWh — [Aura Digital](https://auradigitalglobal.com/blog/vast-ai-gpu-server-earnings/)

### Calculation (my model; inputs from the sources above)
Assumptions: 730 h/month. Renter price = GetDeploying all-provider median, 5 Oct 2026 (3090 $0.22, 4090 $0.44, 5090 $0.70). Host share 75% (Vast). Rented system draw = TDP × 1.3, i.e., 3090 0.45 kW, 4090 0.60 kW, 5090 0.75 kW. Idle system draw 0.10 kW (**my assumption**). Electricity US $0.182/kWh (EIA). EU €0.28 ≈ **$0.32/kWh (my assumed FX of about 1.14 USD/EUR)**. Formula: net = host_rate × 730 × util − [730×util×kW_load + 730×(1−util)×0.10] × $/kWh. Depreciation is excluded.

| Card | Host $/hr | Util | Gross/mo | kWh/mo | Net US ($0.182) | Net EU ($0.32) |
|---|---|---|---|---|---|---|
| RTX 3090 | 0.165 | 25% | $30 | 137 | **$5** | **-$14** |
| RTX 3090 | 0.165 | 50% | $60 | 201 | $24 | -$4 |
| RTX 3090 | 0.165 | 80% | $96 | 277 | $46 | $8 |
| RTX 4090 | 0.33 | 25% | $60 | 164 | **$30** | **$8** |
| RTX 4090 | 0.33 | 50% | $120 | 256 | $74 | $39 |
| RTX 4090 | 0.33 | 80% | $193 | 365 | $126 | $76 |
| RTX 5090 | 0.525 | 25% | $96 | 192 | **$61** | **$35** |
| RTX 5090 | 0.525 | 50% | $192 | 310 | $135 | $92 |
| RTX 5090 | 0.525 | 80% | $307 | 453 | $224 | $162 |

Worked example (4090, 50%, US): gross = 0.33 × 730 × 0.5 = $120.5. kWh = 365 × 0.60 + 365 × 0.10 = 255.5. Power = 255.5 × 0.182 = $46.5. Net = **$74/month**.
- If the gamer's PC would be idling anyway, only the incremental load power counts. 4090 at 50%: US about $87, EU about $62.
- Sanity check: RedPandaMining's verified 4090 at $6/day gross ≈ $180/month matches my 80% row ($193 gross).

**Small datacenter, illustrative (my calculation, unsourced assumptions marked):** used H100 at $14k (ColoPrice midpoint), listed on Vast at a renter price of $2.00 (marketplace low end) → host $1.50/hr. At 60% utilization: 438 h × $1.50 = $657/mo gross. Colocation including power, assuming about 1.3 kW per GPU all-in × $196/kW-month (ColoPrice colocation rate; the 1.3 kW is **my assumption**) ≈ $255/mo. Net ≈ $400/mo → **payback about 35 months**. At 80% utilization: $876 − $255 = $621 → about 22 months. This is consistent with the 18–24-month breakeven at high utilization in [ColoPrice](https://coloprice.com/guides/h100-rental-prices/).

### Inferences
- **Depreciation can wipe out the margin for a single card.** A 4090/5090 that loses even $30–50/month of resale value turns the 25% and some of the 50% scenarios negative. (No sourced depreciation curve was found. The figure is illustrative.)
- Seller economics depend on three things: being verified/reliable (which drives occupancy), electricity below about $0.15/kWh, and newer high-VRAM cards (5090 ≥ 4090 ≫ 3090). The 3090 is roughly break-even in the EU.
- Ranking for the user's segments: gamer with one 4090 in the US is about $30–125/month; the same in Germany (€0.36) is close to $0–60; ex-miner with cheap industrial power and many cards does best per card; a small datacenter with used H100s earns hundreds per GPU-month but has a 2–3-year payback.

### Gaps
- I could not retrieve Reddit/Discord host threads directly. Anecdotes come via blogs (Endless Mining, CloudEarn).
- No official Salad host payout rate. The host share of Salad's $0.16–0.44 renter price is unknown.
- No RunPod Community Cloud or TensorDock host payout data.
- No sourced consumer-GPU depreciation or failure-rate data under 24/7 rental load.

## 5. Seller segments and which supplies the most usable capacity

### Takeaway
Most *usable, rentable* capacity on marketplaces likely comes from **professional or semi-professional operators**: ex-miners with multi-GPU rigs, small datacenters and "Certified Data Center Partners." Single-PC gamers mostly do not. Ex-ETH-miner hardware is mostly the wrong kind for modern AI. Where big ex-miners pivoted (CoreWeave, Core Scientific), they monetized their **power and sites**, not old GPUs. Hard data on supply share is missing.

### Cited Findings
- Vast.ai claims 20,000+ GPUs across 40+ datacenters. Third-party counts: about 22,000 GPUs from 4,500+ hosts (Q2 2026), or 17,000+ GPUs from 1,400 hosts. That implies about 5–12 GPUs per host on average, i.e., mostly multi-GPU rigs rather than single gaming PCs (counts conflict and are unverified) — [Fast.io](https://fast.io/resources/vast-ai-review-2026/); [ClusterBid](https://clusterbid.com/blog/vast-ai-gpu-marketplace-deep-dive-decentralized-pricing-reliability)
- Vast's Certified Data Center Partner tier gets a trust label, priority placement and "Secure Cloud" classification, so datacenter supply is favored in search — [Vast.ai](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai)
- CoreWeave started in 2017 as Atlantic Crypto, mining Ethereum, and became a major AI cloud. Core Scientific (Bitcoin miner) sold about $175M of BTC in early 2026 to fund AI expansion. Miner pivots monetize "electricity, land, and grid access" rather than old rigs — [Core Scientific Wikipedia](https://en.wikipedia.org/wiki/Core_Scientific); [Semiconductor Newsletter](https://thesemiconductornewsletter.substack.com/p/power-gpus-and-the-great-pivot-how); [Cybernews](https://cybernews.com/ai-news/how-crypto-miners-are-reinventing-themselves-as-ai-inference-providers/)
- Only about **5–15% of crypto-oriented GPUs can be repurposed for AI** (single-firm estimate). Mining-era GPUs struggle with today's networking, VRAM, cooling and reliability requirements — [Bitpro](https://bitproit.com/gpu-miners-pivot-ai/); [KuCoin](https://www.kucoin.com/news/flash/crypto-miners-and-founders-transition-to-ai-infrastructure-and-investments)
- Hobbyists buy used multi-GPU servers to rent out, and decentralized networks recruit miners and idle rigs (promotional source) — [Endless Mining](https://endlessmining.com/us/blog/renting-your-gpu-for-ai-2026)
- Enterprises with idle reserved capacity: expiring 2023–24 H100 reservations may push used H100/A100 into secondary markets in late 2026. Compute Exchange opened a secondary H100/A100 market (July 2026) — [ColoPrice](https://coloprice.com/guides/h100-rental-prices/) (citing SiliconANGLE)

### Inferences
- Ranked by usable capacity: (1) small/regional datacenters and certified partners, especially for H100/A100/RTX PRO 6000; (2) semi-pro ex-miners and hobbyist farms running 4–8x consumer-card rigs; (3) enterprise and neocloud resale of reserved capacity, which is growing; (4) gamers with one PC, the largest group by count but contributing little reliable capacity because of uptime, bandwidth and verification problems; (5) universities, for which I found no evidence of material marketplace supply.
- Salad is the platform built for the gamer segment, and its low price tiers ($0.16–0.44 per 4090-hr) show how buyers discount that capacity.

### Gaps
- No platform discloses its supply mix by seller type. No data on university participation. No Salad node counts for 2026.

## 6. Consumer GPU limitations (EULA, bandwidth, residential IP, uptime)

### Takeaway
NVIDIA's GeForce driver EULA has prohibited "datacenter deployment" since late 2017 (blockchain processing excepted). "Datacenter" is undefined, and I found no reporting of enforcement against marketplace hosts. Practical limits matter more: reliability scores, verification, uptime, short rentals, disk and bandwidth, and payout holds.

### Cited Findings
- NVIDIA's GeForce/Titan driver EULA added a "No Datacenter Deployment" clause, applying to drivers released after **Nov 30, 2017**, except for blockchain processing. NVIDIA framed it as discouraging "misuse... in demanding, large-scale enterprise environments" — [DatacenterDynamics](https://www.datacenterdynamics.com/en/news/nvidia-updates-geforce-eula-to-prohibit-data-center-use/); [NVIDIA dev forum](https://forums.developer.nvidia.com/t/driver-eula-update-no-datacenter-deployment/56523); [The Register 2018](https://www.theregister.com/2018/01/03/nvidia_server_gpus/)
- "Datacenter" is not defined. Commentators argue that a small office server room arguably is not one and a warehouse-scale facility is. Enforceability is debated — [Lambda forum](https://deeptalk.lambdalabs.com/t/nvidia-geforce-datacenter-ban-january-eula-change/138); [TechPowerUp](https://techpowerup.com/239994/nvidia-forbids-geforce-driver-deployment-in-data-centers)
- Uptime and reliability: a hardware fault cut one host's Vast reliability from 99.8% to 96.7%. Payouts were held 8–12 days three times — [Aura Digital](https://auradigitalglobal.com/blog/vast-ai-gpu-server-earnings/). Uptime target ≥95%. Unverified hosts get almost no rentals ($0.05/day vs $6/day) — [Endless Mining](https://endlessmining.com/us/blog/renting-your-gpu-for-ai-2026)
- Disk: a stopped rental held 3,278 of 3,643 GB, leaving eight free GPUs with zero rentable offers. Storage capacity limits monetization — [Aura Digital](https://auradigitalglobal.com/blog/vast-ai-gpu-server-earnings/)
- Vast sets no minimum bandwidth or storage. Hosts choose what to offer, and verification runs on a randomized schedule — [Vast.ai](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai)
- Cheapest marketplace listings are often unverified or low-reliability hosts — [Thunder Compute](https://www.thundercompute.com/blog/vast-ai-vs-thunder-compute)

### Inferences
- The EULA mainly constrains professional operators who rack GeForce cards in commercial facilities. Home hosts are probably outside the clause's practical reach, but a marketplace that recruits small datacenters with GeForce cards carries some legal and reputational risk.
- Residential upload bandwidth (often 10–50 Mbps on cable) makes multi-GB model and dataset pulls and pushes slow. Together with the dominance of short rentals, this favors inference and batch jobs that tolerate slow I/O. (Inference; not sourced.)

### Gaps
- I did not retrieve the current (2026) GeForce EULA text, so I could not confirm whether the clause still exists or has changed.
- No sourced data on residential IP blocking, ISP terms-of-service issues for hosting, or typical host upload bandwidth.
- No data on NVIDIA enforcement against marketplace hosts.

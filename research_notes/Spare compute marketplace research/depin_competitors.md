# DePIN Compute Competitors: Paid Demand vs Token Subsidy (as of 2026-11-08)

Source-quality legend (applies throughout):
- **[PRIMARY-ONCHAIN]** = DefiLlama, Messari/Blockworks Research, or chain readings.
- **[SELF]** = company-reported, unaudited.
- **[3P-REVIEW]** = independent review or aggregator site of unknown rigor. ownyourmind.ai is used heavily below. It reconciles on-chain data and publishes corrections, but it is a single non-institutional source, so cross-check before quoting.
- **[LOW]** = promotional, exchange-marketing, or unsourced blog/GitHub posts.

Note: Messari "State of X" reports now redirect to app.blockworks.com (Messari research appears to be hosted under Blockworks as of 2026).

---

## 1. Product model and target buyers, per network

### Takeaway
The field has split. Some networks are mostly reseller "GPU clouds" with crypto settlement, selling to enterprises and AI startups (Aethir, io.net, Spheron, and Hyperbolic, which has no token). Others are permissionless open marketplaces (Akash, Golem, Nosana, Render), and a third group is emissions-driven AI "subnets" (Bittensor's Chutes and Targon). Consumer-grade "spare GPU" supply is common in the marketing, but high-end datacenter GPUs (H100/H200/B200) carry the meaningful revenue.

### Cited Findings
- **io.net**: Solana-based GPU cloud and aggregator (clusters, rentals, inference). In August 2026 the explorer showed a device mix of 709 RTX 4090, 584 H100 80G PCIe and 512 H100 80GB HBM3. Only 128 of 2,447 devices were NVLink/SXM/DGX class, so the supply is weak for large-scale training. — [ownyourmind.ai io.net review [3P-REVIEW], citing io.net explorer](https://ownyourmind.ai/projects/io-net/)
- io.net said it closed an "$8M enterprise deal" (June 2026) and processes "4 billion daily AI tokens" (its inference product). — [CoinDesk press release [SELF], 2026-06-11](https://www.coindesk.com/press-release/2026/06/11/io-net-to-burn-up-to-12m-tokens-as-network-closes-usd8m-deal-and-hits-4-billion-daily-ai-tokens)
- **Akash**: Cosmos SDK L1, a permissionless reverse-auction marketplace for containers (CPU and GPU leases). Mainnet 17 (2026-03-23) added CosmWasm and Burn-Mint Equilibrium (BME). The Q1 2026 report shows no migration away from Cosmos. — [Messari/Blockworks State of Akash Q1 2026](https://app.blockworks.com/report/state-of-akash-q1-2026-final). Note that a hoge.gg article is titled "The GPU Market That Left Cosmos" — [hoge.gg](https://hoge.gg/akash-network-2026-gpu-market-leaves-cosmos/). I did not verify that claim, and it conflicts with the Messari Q1 2026 description.
- **Aethir**: enterprise GPU cloud for AI and cloud gaming. It claims 150+ enterprise clients, with publishers such as EA and Ubisoft named but not independently confirmed. It sells H100, H200, A100, B200 and B300. The "ACCELERATE" program (2026-08-24) plans 10 US/EU sites up to 20MW for B300/GB300 clusters, operated by Axe Compute. — [ownyourmind.ai Aethir review [3P-REVIEW]](https://ownyourmind.ai/projects/aethir/)
- **Render Network**: originally distributed 3D rendering (OctaneRender, OTOY), pivoting to AI compute. One report says AI workloads are 35–40% of network activity. It reported 82.5M cumulative frames by September 2026, and August 2026 output of 1.33M frames (+23% MoM). — [search summary of CryptoBriefing / CoinStats [LOW-3P]](https://cryptobriefing.com/render-network-negative-gpu-supply-2026/); [coinstats](https://coinstats.app/ai/a/investment-analysis-render-token)
- **Nosana**: Solana GPU marketplace for AI inference jobs. Card and USDC top-ups are converted into NOS "behind the scenes" and hosts earn NOS per job. — [Solana Compass](https://solanacompass.com/projects/nosana); [Nosana site](https://nosana.com/)
- **Golem**: the oldest network (2016). It is a peer-to-peer marketplace where requestors pay providers in GLM on Ethereum or Polygon, with GPU support added for AI. In January 2026 it reportedly piloted with Salad.com on AI inference and 3D rendering. — [Golem docs](https://docs.golem.network/docs/golem/overview); [ownyourmind.ai Golem [3P-REVIEW]](https://ownyourmind.ai/projects/golem/)
- **Gensyn**: decentralized ML training protocol. Mainnet is an OP Stack L2, and its first live app is "Delphi", an AI prediction market. One review says the training network mainnet is still pending, which conflicts with sources describing a full April 2026 mainnet. — [Bitcoin.com News](https://news.bitcoin.com/gensyn-network-debuts-delphi-a-permissionless-ai-prediction-market-platform-on-mainnet/); [ownyourmind.ai Gensyn [3P-REVIEW]](https://ownyourmind.ai/projects/gensyn/)
- **Hyperbolic**: GPU marketplace plus inference API, founded by an ex-Citadel quant. It is building a GPU marketplace to "hedge AI demand risk". I found no token as of November 2026. — [CryptoBriefing](https://cryptobriefing.com/hyperbolic-gpu-marketplace-hedge-ai-demand/)
- **Fluence**: "cloudless" compute marketplace (CPU VMs, plus GPU). Its 2026 vision centers on RWA tokenization of compute hardware via NFTs (H2 2026) and FLT buybacks funded by usage revenue. — [Fluence Vision 2026 blog [SELF]](https://www.fluence.network/blog/fluence-vision-2026/)
- **Spheron**: GPU marketplace and aggregator. In early 2025 it claimed 25,000+ "Fizz Nodes" (consumer machines). CoinClear says aggregating compute from other networks such as Akash limits Spheron's value capture. — [coinclear [LOW]](https://coinclear.pages.dev/ai-depin/spheron); [MEXC news [LOW]](https://www.mexc.com/news/87992)
- **Bittensor compute and inference subnets**: Chutes (SN64, serverless inference, 50+ models, sold via OpenRouter and directly) and Targon (SN4, Manifold Labs). — [ownyourmind.ai Chutes [3P-REVIEW]](https://ownyourmind.ai/tokenomics/chutes-bittensor-revenue-machine/); [CryptoBriefing](https://cryptobriefing.com/bittensor-subnets-annualized-revenue/)

### Inferences
- Paying buyers mostly want datacenter-grade, cluster-ready GPUs (H100/H200/B200, NVLink) with SLAs. Commodity consumer GPUs (RTX 4090) dominate supplier counts but appear to capture little revenue.
- The networks with the most real revenue (Aethir, and io.net's enterprise deal) behave like conventional GPU resellers and colocation operators that settle in a token. They are not "spare compute" marketplaces in the household sense.

### Gaps
- No reliable buyer-segment breakdown (startups vs enterprise vs crypto-native) for any network.
- No 2026 data on Golem's GPU product adoption.

---

## 2. Supply: claimed vs actually utilized, and who suppliers are

### Takeaway
Headline supply numbers are inflated by one to two orders of magnitude relative to verified, active supply. io.net's 2026 explorer shows about 1,500–2,100 devices against marketing claims of 30,000+ to 320,000+. Akash's average GPU capacity in Q1 2026 was only 334 GPUs, of which 84 were in use.

### Cited Findings
- **io.net (Q1 2025, Messari)**: 327,000 registered GPUs, but only 6,720 verified active on a daily average (about 2%), and 5,350 cluster-ready. The verified count fell 11.1% QoQ. — [ownyourmind.ai citing Messari [3P-REVIEW]](https://ownyourmind.ai/projects/io-net/)
- **io.net (2026, self-reported explorer)**: 1,839 devices / 1,562 active (2026-06-25); 2,109 devices / 1,559 active (2026-11-01). The homepage claims 30,000+ GPUs and the /cloud page claims 320,000+ GPUs. The latest reading is about 14x short of the 30,000 headline. — [ownyourmind.ai [3P-REVIEW]](https://ownyourmind.ai/projects/io-net/)
- **io.net utilization**: 495,568 device-hours across 1,025 three-hour epochs, 2026-06-01 to 2026-10-07 [SELF]. — [ownyourmind.ai](https://ownyourmind.ai/projects/io-net/)
- **io.net operator requirements**: stake of 200 IO per chip (tier-adjusted), minimum 4 GB VRAM, 100/75 Mbps network, 12-hour stress test, and at least 5 hours/day of uptime. — [ownyourmind.ai](https://ownyourmind.ai/projects/io-net/)
- **Akash (Q1 2026)**:

| Resource | Avg usage | Avg capacity | Reported utilization |
|---|---|---|---|
| GPU | 84 (−57.4% QoQ) | 334 (−57.5% QoQ) | 33.7% |
| CPU | 2,420 vCPU | 11,690 vCPU (−46.5% QoQ) | 26.1% (up from 17.7%) |

  The average number of active providers was 58 (−8.4% QoQ), the lowest in recent history. — [Messari/Blockworks State of Akash Q1 2026](https://app.blockworks.com/report/state-of-akash-q1-2026-final)
  - Inconsistency: 84/334 = 25.1%, not 33.7%. The utilization rose because capacity shrank faster than usage. — [same report, my arithmetic]; [cryptodaily](https://cryptodaily.co.uk/2026/06/akt-after-ai-rally-decentralized-compute-utilization)
- **Akash community pool funds supply**: Proposal 315 (Q1 2026) allocated $789,768 to extend 12-month contracts on 24 H100s, 64 H200s and 32 A100s. In other words, the treasury pays for a meaningful share of the GPU supply directly. — [Messari/Blockworks Q1 2026](https://app.blockworks.com/report/state-of-akash-q1-2026-final)
- **Aethir**: claims 433,713 "containers" (2026-09-23) in 94 countries and 2.45B cumulative compute hours [SELF, off-chain, unverified]. It gives no per-model GPU unit counts. Suppliers must contribute at least $25K of capital (enterprise GPUs). — [ownyourmind.ai Aethir [3P-REVIEW]](https://ownyourmind.ai/projects/aethir/)
- **Render**: one source claims 60,000 GPUs in 180 countries added in six months, and about 5,600 active nodes (both undated, unsourced) [LOW]. — [Ricosworks GitHub "Networks Profit, Operators Don't" [LOW]](https://github.com/Ricosworks1/depin-research-reports/releases/tag/depin-dispatch-networks-profit-operators-dont-20261106). CryptoBriefing reports Render saw "negative GPU supply for first time since 2018" (Q2 2026). — [CryptoBriefing](https://cryptobriefing.com/render-network-negative-gpu-supply-2026/)
- **Nosana**: 2,800+ verified GPUs and about 3.9M on-chain jobs (mid-2026, third-party). — [depin.builders [3P]](https://depin.builders/projects/nosana); [ownyourmind.ai Nosana [3P-REVIEW]](https://ownyourmind.ai/projects/nosana/)
- **Spheron**: claims 44,000+ nodes in 170 regions (undated). — [MEXC news [LOW/SELF]](https://www.mexc.com/news/87992)
- **Golem**: provider count described as "modest compared with competitors", with low development cadence. — [ownyourmind.ai Golem [3P-REVIEW]](https://ownyourmind.ai/projects/golem/)
- **Aethir checker nodes**: 74,673 checker node licenses sold March–May 2024 for $148.4M ($440–$12,634 each). These are CPU-only uptime validators that do no GPU work. — [ownyourmind.ai Aethir [3P-REVIEW]](https://ownyourmind.ai/projects/aethir/)

### Inferences
- Treat any "GPUs on network" figure as registered, not available or utilized. The verified-active ratio has ranged from about 2% (io.net, Q1 2025) to a self-reported explorer in the low thousands.
- Supply is ultimately bought with cash or treasury funds where demand is real. Akash's community pool leases H100/H200s, and Aethir requires at least $25K of capital from operators. This undercuts the "idle spare GPU" narrative: paying demand needs provisioned datacenter hardware.
- Aethir's $148M checker-node sale was effectively a token and license presale to retail. It was not compute supply.

### Gaps
- No independently verified active GPU counts for Aethir, Render, Spheron or Golem in 2026.
- Utilization rates for io.net (as a percentage of available hours), Aethir, and Render were not found.

---

## 3. Real paid demand vs token subsidy (the key question)

### Takeaway
Only Aethir shows large, on-chain-verifiable buyer fees: about $183M all-time gross fees on DefiLlama, though monthly fees fell from $12.5M (September 2025) to $3.0M (July 2026), paid by only 61 addresses. Everyone else's verifiable paid demand is small, from hundreds of thousands to a few million dollars a year. For io.net, Render, Bittensor/Chutes and Akash, token emissions or treasury spending still exceed buyer payments by a wide margin, ranging from about 4x to 40x depending on the network.

### Cited Findings

**Aethir (largest real revenue, but declining and concentrated)**
- Self-reported 2025 revenue: $127.8M (Jan–Dec 2025). Q3 2025: $39.8M. Self-reported ARR peak claim: "$166M" (2025-10-10). — [Aethir 2025 wrap-up [SELF]](https://aethir.com/blog-posts/aethirs-2025-wrap-up-decentralized-gpu-cloud-milestones)
- DefiLlama all-time gross fees: $183.4M (2026-10-20), versus Aethir's dashboard figure of $194.6M "Total Network Revenue" since June 2024 (2026-10-13). They match within about 6%. — [ownyourmind.ai Aethir [3P-REVIEW citing DefiLlama]](https://ownyourmind.ai/projects/aethir/)
- Monthly fees fell from $12.5M (September 2025) to $3.0M (July 2026). The trailing 90 days annualise to $39.6M. Trailing windows as of 2026-09-18: 12 months $74.9M, 30 days $5.1M, 7 days $1.5M. The dashboard ARR tile read $45.5M (2026-09-23), then $62.5M (2026-10-07), a jump with no explanation. — [ownyourmind.ai Aethir](https://ownyourmind.ai/projects/aethir/)
- Only 1,250 DepositServiceFee events from **61 distinct payer addresses** since July 2024. Fees are deposited in ATH. Revenue may be partly self-referential: Aethir's own Digital Asset Treasury books compute on the platform, and Axe Compute (largest shareholder: the Aethir Foundation; its president is ex-Aethir CTO Kyle Okamoto) operates the ACCELERATE sites. — [ownyourmind.ai Aethir](https://ownyourmind.ai/projects/aethir/)

**io.net (small paid demand, heavily subsidized)**
- Messari: revenue of $3.1M in Q4 2024 and $5.7M in Q1 2025 (+82.6% QoQ). — [ownyourmind.ai citing Messari](https://ownyourmind.ai/projects/io-net/)
- io.net claims monthly network earnings rose from $250K to $1M between March and May 2026, a "$12.11M projected ARR", and "#1 in DePIN revenue" [SELF, from an A1 Research report]. — [io.net on X](https://x.com/ionet/status/2079209965487632448)
- The $8M enterprise contract generates about $650K/month of on-chain revenue [SELF]. — [CoinDesk press release](https://www.coindesk.com/press-release/2026/06/11/io-net-to-burn-up-to-12m-tokens-as-network-closes-usd8m-deal-and-hits-4-billion-daily-ai-tokens)
- **Subsidy ratio**:
  - From 1–16 June 2026, clients bought 35,756 IO while suppliers were paid 1.37M IO, so client purchases were about 2.6% of supplier payouts.
  - Since 1 June 2026, about 9.85M IO was paid in rewards against about 2.15M IO burned, so burns offset about 22%.
  - Epoch rewards are flat at about 10,650–10,980 IO per 3-hour epoch.
  - "Demand-driven emissions" were not live as of the latest data.
  - Sources: [ownyourmind.ai io.net, citing io.net explorer](https://ownyourmind.ai/projects/io-net/); [CoinMarketCap AI summary](https://coinmarketcap.com/cmc-ai/io-net/latest-updates/)
- io.net's mid-2026 "$12.5M annualised" figure (attributed to DePINpulse) could not be re-read from its source as of 2026-10-07. — [ownyourmind.ai](https://ownyourmind.ai/projects/io-net/)

**Akash (very small on-chain revenue; treasury spending exceeds it)**
- Q1 2026 lease revenue: $253,250 (−45% QoQ from $460,510). Total network fees: $257,580. New leases: 43,540 (+27.1% QoQ). Average active leases: 583 (−4.4% QoQ, −32.9% YoY). — [Messari/Blockworks State of Akash Q1 2026](https://app.blockworks.com/report/state-of-akash-q1-2026-final)
- In the same quarter, community-pool governance spending totaled about $2.09M: $789,768 for GPU contracts plus $405,350 + $287,650 + $605,334 for engineering, client and support work. That is roughly 8x lease revenue. — [same report; sum is my arithmetic]
- Akash reportedly claimed about $5M in "compute spend" for Q1 2026, compared with Messari's $253K on-chain lease revenue. The cause of the gap is unverified. — [cryptodaily](https://cryptodaily.co.uk/2026/06/akt-after-ai-rally-decentralized-compute-utilization)

**Render (burns far below emissions)**
- Gross job fees were $232,323 in September 2026 (DefiLlama via CoinStats), down 51.3% YoY. — [CoinStats [3P]](https://coinstats.app/ai/a/investment-analysis-render-token)
- Burns were $87,194 (45,150 RENDER) in May 2026 and $106,650 (63,281 RENDER) in June 2026, −60% YoY [community tracker]. Monthly emission was 492,132 RENDER, scheduled to drop to 380,284 in December 2026. Cumulative burns reached 1,535,392 RENDER by September 2026. — [$RENDER burn tracker on X](https://x.com/NEWRenderBurn/status/2072264132645064949); [X May 2026](https://x.com/NEWRenderBurn/status/2061392383682474058)
- A widely repeated claim that Render generated "$38M on-chain revenue in January 2026" is contradicted. Another source says Render does not disclose on-chain revenue at that granularity, and the burn data (about $100K/month) makes $38M/month implausible. — [BlockEden [LOW]](https://blockeden.xyz/blog/2026/04/12/depin-revenue-pivot-token-subsidies-ai-compute-akash-render-ionet/)

**Bittensor (Chutes and Targon)**
- Chutes (SN64), per Pine Analytics (March 2026): $1.3–2.4M annualised external revenue, while receiving 14.39% of TAO emissions (about 518 TAO/day). The subsidy-to-revenue ratio was **22–40x**. — [ownyourmind.ai Chutes [3P-REVIEW citing Pine]](https://ownyourmind.ai/tokenomics/chutes-bittensor-revenue-machine/)
- Chutes' self-published daily revenue averaged about $15.6K/day (peak $22.5K on 2026-03-25). Part of February's revenue was sponsored hosting paid by model makers. Chutes withdrew the series in mid-2026. Its emission share later fell to 6.55% (2026-08-15) and 5.82% (2026-09-22). — [ownyourmind.ai Chutes](https://ownyourmind.ai/tokenomics/chutes-bittensor-revenue-machine/)
- OpenRouter throughput peaked at about 42B tokens/day (2026-02-07), then ran about 7B/day on average, while Chutes self-reports 160B/day. The gap is unexplained. In February 2026 Chutes removed its free tier, saying heavy users were getting 56–324x their subscription value. — [same](https://ownyourmind.ai/tokenomics/chutes-bittensor-revenue-machine/)
- Targon (SN4): Manifold Labs self-reported $10.4M ARR (April 2026), which Pine called "not an audited number". SubConnect estimated $5.5–6M. — [CryptoBriefing](https://cryptobriefing.com/bittensor-subnets-annualized-revenue/); [ownyourmind.ai subnet rankings](https://ownyourmind.ai/tokenomics/bittensor-subnets-where-the-revenue-is/)
- Network-wide estimates conflict sharply:

| Source | Estimate |
|---|---|
| SubConnect Revenue Index (late August 2026) | $28–35M annualised across 24 subnets |
| Pine Analytics | $3–15M identifiable external revenue |
| BlockEden headline | "$43M real AI revenue" |

  TAO emissions fell from 7,200 to 3,600 TAO/day at the 2025-12-14 halving. — [CryptoBriefing](https://cryptobriefing.com/bittensor-subnets-annualized-revenue/); [tao.media](https://www.tao.media/subconnect-announces-first-bittensor-revenue-index/); [BlockEden [LOW]](https://blockeden.xyz/blog/2026/05/03/bittensor-43m-revenue-decentralized-ai-inflection/)

**Other networks**
- **Nosana**: discloses no USD revenue. A third-party estimate puts mid-2026 ARR at about $3.4M (unverified method). — [ownyourmind.ai Nosana](https://ownyourmind.ai/projects/nosana/); [depin.builders](https://depin.builders/projects/nosana)
- **Fluence**: claims more than $1M ARR, "comprised of stablecoin revenue and token rewards" [SELF]. Note that this mixes subsidy into the "revenue" figure. 30-day revenue was $92,183 on 2025-07-09 (CMC). — [Fluence Vision 2026](https://www.fluence.network/blog/fluence-vision-2026/); [CoinMarketCap](https://coinmarketcap.com/cmc-ai/fluence-network/latest-updates/)
- **Spheron**: claims $16M ARR (undated) and about $10.6M ARR pre-TGE (2025) [SELF/LOW]. No on-chain verification found. — [MEXC news](https://www.mexc.com/news/87992); [Substack [LOW]](https://threadingontheedge.substack.com/p/why-im-bullish-on-spon-with-a-10m)
- **Golem**: a January 2026 Salad.com pilot was reportedly worth about $57K/week in network fees (unverified aggregator claim). — [ownyourmind.ai Golem](https://ownyourmind.ai/projects/golem/)
- **Gensyn**: buyback uses 0.5% of protocol fee revenue (from 2026-05-01). By late October 2026 it had burned only about 0.0014% of supply, which implies negligible fees. — [Phemex [LOW]](https://phemex.com/blogs/gensyn-ai-price-prediction-2026-2030); [Gensyn docs](https://docs.gensyn.network/ai-token)
- **Sector**: Messari is cited as estimating $72M of verifiable on-chain DePIN revenue over a past year. The search summary does not confirm whether this covers compute only or all DePIN. — [search summary; underlying source unclear](https://blockeden.xyz/blog/2026/03/12/depin-compute-revenue-pivot-akash-ionet-aethir/)
- **Adjacent comparison (storage DePIN)**: Filecoin paid $31.3M in block rewards against $1,676 of paid storage revenue (September 2025–August 2026, per Bitquery). — [Ricosworks GitHub [LOW]](https://github.com/Ricosworks1/depin-research-reports/releases/tag/depin-dispatch-networks-profit-operators-dont-20261106)

### Summary table (best-available, most-independent figure per network)

| Network | Best verifiable paid demand | Subsidy signal | Confidence |
|---|---|---|---|
| Aethir | $74.9M trailing 12 months on-chain (to 2026-09-18); about $3–5M/month recently | 61 payer addresses; ATH-denominated; related-party questions | Medium (on-chain matches) |
| io.net | Self-reported about $1M/month (May 2026) | Client IO buys about 2.6% of supplier IO payouts (June 2026) | Low–medium |
| Akash | $253K lease revenue in Q1 2026 | Treasury spent about $2.1M in the same quarter | High (Messari) |
| Render | About $232K job fees (September 2026) | About 490K RENDER/month emitted vs about 45–63K burned | Medium |
| Chutes (Bittensor) | $1.3–5.7M annualised | Subsidy-to-revenue ratio of 22–40x (March 2026) | Medium |
| Targon (Bittensor) | $5.5–10.4M ARR | TAO emissions | Low |
| Nosana | About $3.4M ARR (third-party estimate) | Not quantified | Low |
| Spheron | $16M ARR (self) | Not quantified | Very low |
| Fluence | Above $1M ARR, including token rewards | Revenue figure itself includes subsidy | Low |
| Gensyn | Negligible | Not quantified | Low |
| Golem | Not quantified | Not quantified | Very low |

### Inferences
- Across the sector, verifiable buyer revenue outside Aethir appears to total on the order of $10–30M/year in 2026. Aethir's monthly run rate fell about 75% from its September 2025 peak, which suggests even the leader's demand is not sticky or was front-loaded by a few large contracts.
- Where both sides can be measured (io.net, Render, Chutes, Akash), token or treasury outlays exceed buyer payments by roughly 4–40x. Supplier earnings are mostly subsidy.
- Self-reported figures run consistently 2–20x above on-chain or independent measures:
  - Akash: about $5M claimed vs $253K on-chain.
  - Chutes: 160B tokens/day claimed vs about 7B on OpenRouter.
  - io.net: 30,000+ GPUs claimed vs about 1,500 active.
- For a new entrant, the evidence suggests token incentives can bootstrap registered supply cheaply, but they do not create buyers. Demand concentrates in a handful of enterprise contracts for datacenter GPUs.

### Gaps
- I did not obtain Token Terminal or DefiLlama primary pages directly; the Aethir and Render DefiLlama figures come via secondary pages.
- No Messari State of Akash Q2 or Q3 2026 report was found. Q2 2026 may be unpublished or not indexed.
- No independent USD revenue figures for Nosana, Spheron, Golem or Hyperbolic.
- Hyperbolic's revenue is private (no token).
- The io.net October 2026 "Revenue-Backed Token Burn Expansion" (2026-10-25) is unverified against a primary source. — [CoinMarketCap AI](https://coinmarketcap.com/cmc-ai/io-net/latest-updates/)

---

## 4. Pricing to buyers (H100 / A100 / RTX 4090)

### Takeaway
2026 GPU rental prices rose. DePIN H100 prices (about $2.7–3.2/hr) are now near or above specialist neoclouds, not the "70–90% cheaper than AWS" claims of 2024.

### Cited Findings
- **Akash** H100 SXM: from $2.72/GPU-hr (ComputePrices, 2026-10-06, one configuration). An older, undated DePIN guide quoted $1.20–1.80/hr. Akash's own guide (August 2026) puts market on-demand H100 at about $2–12/hr, mostly $2–7. — [ComputePrices](https://computeprices.com/providers/akash/gpus/h100); [Akash "The Bid"](https://akash.network/the-bid/h100-rental-price-2026-cost-per-hour/)
- **Hyperbolic** H100 SXM: $2.89 → $3.19/GPU-hr (August 2026 increase), listed at $3.19 on 2026-10-22. It was earlier listed at $1.50/hr. — [usagepricing.com](https://www.usagepricing.com/blueprint/activity/hyperbolic-2026-08-04-h100-rate-increase); [ComputePrices](https://computeprices.com/providers/hyperbolic)
- **Market context**: H100 rentals from $1.70/hr across 45 providers (October 2026). One-year contract rates rose about 40%, from $1.70 to $2.35/GPU-hr, between October 2025 and March 2026. — [amcompute](https://www.amcompute.com/gpu-cloud-prices/h100); [Akash search summary](https://akash.network/the-bid/h100-rental-price-2026-cost-per-hour/)
- **io.net**: no per-hour prices found in 2026. It claims 70–90% savings vs AWS/GCP [SELF]. Akash reportedly undercuts io.net by about $0.07 per H100 GPU-hr. — [ownyourmind.ai](https://ownyourmind.ai/projects/io-net/)
- **Golem**: GPU from about $0.10/hr (RTX 3090) per one aggregator. — [computestacker](https://computestacker.com/providers/golem-network/)
- **Chutes inference** (April 2026, $ per million input/output tokens):

| Model | Chutes | Together.ai | Chutes discount |
|---|---|---|---|
| DeepSeek V3.1 | $0.27 / $1.00 | $0.60 / $1.70 | 55% / 41% |
| Mistral Small 24B | $0.03 / $0.11 | $0.10 / $0.30 | 70% / 63% |

  Pine estimates an unsubsidised break-even of about $1.41/M tokens, which would make Chutes about 1.6x more expensive than Together's $0.88/M for Llama 70B. — [ownyourmind.ai Chutes](https://ownyourmind.ai/tokenomics/chutes-bittensor-revenue-machine/)
- **DePIN discount claims**: 45–70% below AWS/Azure on-demand (one source) and 60–75% (KuCoin). Neither gives a methodology. — [KuCoin [LOW]](https://www.kucoin.com/blog/top-ai-depin-projects-2025-2026-decentralized-infrastructure)

### Inferences
- DePIN price advantages hold mainly against hyperscaler on-demand list prices, not against neoclouds (RunPod, Lambda, Thunder and others). Where prices look far below cost (Chutes), the discount is funded by emissions.

### Gaps
- No verified 2026 A100 or RTX 4090 buyer prices for Akash, io.net, Aethir, Nosana or Render.
- Aethir publishes no per-GPU-hour buyer pricing.

---

## 5. Take rate / protocol fee

### Takeaway
Explicit take rates are rare. Aethir's is about 20%. Akash moved its take-rate logic into BME in March 2026. Most others rely on burns or buybacks rather than a disclosed fee.

### Cited Findings
- **Aethir**: about 80% of gross fees to GPU operators and about 20% to the protocol. DefiLlama protocol revenue was $36.1M all-time against $180.3M gross (2026-09-18), or about $17.4M/year. — [ownyourmind.ai Aethir](https://ownyourmind.ai/projects/aethir/)
- **Akash**: the legacy x/take module was retired and take-rate logic moved into BME (Mainnet 17, 2026-03-23). 53,520 AKT were burned via BME by 2026-03-31, and the BME vault was seeded with 300,000 AKT from the Community Pool. — [Messari/Blockworks Q1 2026](https://app.blockworks.com/report/state-of-akash-q1-2026-final)
- **io.net IDE** (burn live from 2026-06-01): at least 50% of post-payout network revenue, in IO, is burned. Supplier payouts are pegged to a stable USD value and buffered by reserves. io.net reports burns at 37.0% of purchases. — [CoinDesk PR](https://www.coindesk.com/press-release/2026/06/11/io-net-to-burn-up-to-12m-tokens-as-network-closes-usd8m-deal-and-hits-4-billion-daily-ai-tokens); [ownyourmind.ai](https://ownyourmind.ai/projects/io-net/)
- **Gensyn**: 0.5% of protocol fee revenue buys $AI, of which 70% is burned and 30% goes to the treasury. — [search summary of Gensyn token docs](https://docs.gensyn.network/ai-token)
- **Spheron**: SPON buyback-and-burn tied to "Secure Compute" and future revenue (amounts unverified). — [CryptoNewsNavigator](https://www.cryptonewsnavigator.com/news/regulation/spheron-kicks-off-spon-buyback-program-begins-burning-supply-mP1AnQmJIcwLieKM406auA)
- **Fluence**: plans usage-revenue-funded FLT repurchases. — [Fluence Vision 2026](https://www.fluence.network/blog/fluence-vision-2026/)

### Inferences
- The 2026 trend is to "make the token revenue-linked" through burn and buyback (io.net IDE, Akash BME, Gensyn, Spheron, Fluence). These mechanisms redistribute small revenue. They do not create demand, and at current volumes they offset only a fraction of emissions (for io.net, about 22%).

### Gaps
- Render's, Nosana's, Golem's and Hyperbolic's take rates were not confirmed in this session.
- Historical Akash rates (commonly cited as 4% for AKT and 20% for USDC) were not re-verified here.

---

## 6. Verification / trust and fraud incidents

### Takeaway
Most networks still rely on stake plus uptime checks plus reputation. Cryptographic proof-of-compute is mostly research-stage (Gensyn, Hyperbolic PoSP). io.net's April 2024 Sybil attack is the canonical fraud case, and the response was largely staking and stress-test gating.

### Cited Findings
- **io.net, April 2024**: about 1.8M fake GPUs connected to farm airdrop rewards, reportedly including one RTX 4090 split into "infinite" virtual GPUs. Public GPU counts in 2024 ranged from a few thousand to over 500,000, and one critic put rentable GPUs in the low hundreds. CEO Ahmad Shadid resigned on 2024-06-09, two days before the token launch. Leadership then passed to Tory Green (August 2024) and Gaurav Sharma (April 2025). — [ownyourmind.ai io.net](https://ownyourmind.ai/projects/io-net/)
- **io.net mitigations now**: 200 IO stake per chip, a 12-hour stress test, at least 5 hours/day uptime, and a "verified" vs "registered" device distinction. It claims SOC 2 compliance (2025-01-01, auditor not named). — [same](https://ownyourmind.ai/projects/io-net/)
- **Aethir**: verification is checker nodes (CPU-only uptime/performance validators, a role whose effectiveness is disputed). Container counts, compute hours and client counts are off-chain and unverified, the code is closed-source, and the claimed CertiK audit of the burn mechanism was not located. A bridge exploit on 2026-04-10 (AethirOFTAdapter on BNB Chain) drained about 423K ATH (about $400K, per PeckShield), with user losses under $90K. — [ownyourmind.ai Aethir](https://ownyourmind.ai/projects/aethir/)
- **Hyperbolic**: Proof of Sampling (PoSP) is game-theoretic random sampling verification, developed with UC Berkeley and Columbia researchers and integrated as an EigenLayer AVS. The materials are about two years old. — [Hyperbolic blog](https://hyperbolic.xyz/blog/proof-of-sampling-posp-breakdown); [EigenLabs](https://www.eigenlabs.org/blog/avs-spotlight-hyperbolic/)
- **Bittensor/Chutes**: validators score miners on quality and uptime. The Chutes client SDK is public, but the miner, validator and platform code are private. — [ownyourmind.ai Chutes](https://ownyourmind.ai/tokenomics/chutes-bittensor-revenue-machine/)
- **Golem**: a September 2026 security update assessed 76 reports and fixed 36 issues (v0.17.10 to v0.18.0), with requestors reportedly unaffected. — [ownyourmind.ai Golem](https://ownyourmind.ai/projects/golem/)
- **Akash**: the BME oracle uses 1.5% deviation tolerance and a 60-block staleness limit, with a 13-of-19 Wormhole guardian quorum. — [Messari/Blockworks Q1 2026](https://app.blockworks.com/report/state-of-akash-q1-2026-final)

### Inferences
- Paying-demand rewards are inherently less fraud-prone than emission rewards. io.net's fake-GPU episode happened because rewards were paid for being online, not for paid work. A new entrant that pays suppliers only from buyer payments, or ties rewards to verified paid jobs, removes most of the Sybil incentive.
- Enterprise buyers appear to rely on SOC 2, known datacenter partners and SLAs rather than on-chain proofs.

### Gaps
- Nosana's, Render's and Fluence's verification mechanisms in 2026 were not researched in depth.
- Whether Gensyn's Verde or proof-of-learning is live in production was not confirmed.
- No TEE or hardware attestation deployments were confirmed for these networks in this session.

---

## 7. Token performance, funding, pivots, controversies

### Takeaway
Nearly every compute token is down 85–98% from its peak, even as some revenue grew. Common pivots are toward enterprise or datacenter GPUs, inference APIs, burn and buyback mechanics, and RWA or treasury structures.

### Cited Findings
- **io.net (IO)**: about $0.117–0.126 (early November 2026), market cap $49.7M, FDV $93.0M. The all-time high was $6.43 (2024-06-12), so the token is down about 98%.
  - Raised a $30M Series A (2024-03-05, led by Hack VC) at a reported $1B valuation. Seed was led by Multicoin.
  - Insiders hold about 34% of supply, with unlocks from July 2025 through 2028. Top 10 accounts hold 58.82%.
  - Source: [ownyourmind.ai io.net](https://ownyourmind.ai/projects/io-net/)
- **Aethir (ATH)**: about $0.005 (2026-11-02), market cap $96.7M, FDV $201.7M, down "more than 90%" to "about 97%" (the page is inconsistent).
  - Raised $9M pre-Series A (2023, HashKey lead, $150M valuation), plus the $148.4M node sale. Total raised: $158.4M.
  - In October 2025, 1.26B ATH from the Season 3 airdrop was redirected into a Digital Asset Treasury.
  - Related party: Axe Compute (formerly Predictive Oncology).
  - Source: [ownyourmind.ai Aethir](https://ownyourmind.ai/projects/aethir/)
- **Akash (AKT)**: $0.50 at the end of Q1 2026 (+41.6% QoQ, from $0.35), with circulating market cap of $130.7M. Q4 2025 had seen a large contraction from $280.8M. Governance also approved a 1,000,000 AKT market-making loan (Proposal 316). — [Messari/Blockworks Q1 2026](https://app.blockworks.com/report/state-of-akash-q1-2026-final)
- **Render (RENDER)**: one 2026 article described an "86% price decline". MetaMask showed about $1.69 (date unclear). — [coinalertnews](https://coinalertnews.com/news/2026/05/08/render-network-activity-2026); [MetaMask](https://metamask.io/price/render-token)
- **Gensyn ($AI)**: TGE 2026-04-29, total supply 10B. Launch-day high was $0.1030; it traded at about $0.0176 in October 2026, down about 83%. — [cryptoticker](https://cryptoticker.io/en/prediction/gensyn-price-prediction/); [yellow.com](https://yellow.com/news/gensyn-ai-token-42-percent)
- **Nosana (NOS)**: price sources conflict, with $0.2845 (2026-08-24) vs $0.4573 on another site. — [ownyourmind.ai Nosana](https://ownyourmind.ai/projects/nosana/); [CoinMarketCap](https://coinmarketcap.com/cmc-ai/nosana/what-is/)
- **Spheron (SPON)**: TGE July 2025. — [Coinranking](https://coinranking.com/coin/wra4uV6iN+spheronnetwork-spon/about)
- **Bittensor**: Chutes withdrew its revenue series in mid-2026. No registered corporate entity was found for Rayon Labs. A "Covenant AI exit" shook the subnet ecosystem (2026). — [ownyourmind.ai Chutes](https://ownyourmind.ai/tokenomics/chutes-bittensor-revenue-machine/); [Webopedia](https://www.webopedia.com/news/markets/the-top-bittensor-subnets-after-the-covenant-ai-shakeup/)
- **Sector**: one comparative analysis is titled "DePIN Revenue Climbs 800% While Tokens Lag 94%" (September 2026). — [Ricosworks GitHub [LOW]](https://github.com/Ricosworks1/blockchain-payment-flow-analysis/releases/tag/comparative-analysis-depin-revenue-vs-token-prices-sept-2026)

### Inferences
- Token prices have decoupled from usage and are driven by unlocks and emissions. Suppliers paid in tokens bear that drawdown, which explains supply attrition (Akash GPU capacity −57.5% QoQ; Render negative GPU supply growth).
- Pegging supplier payouts to USD (io.net IDE) is an admission that token-denominated pay failed to retain suppliers.

### Gaps
- Funding for Nosana, Fluence, Spheron, Gensyn (a16z-led rounds pre-2025) and Hyperbolic was not verified in this session.
- No current Render market cap or funding figures were collected.

---

## 8. Analyst critiques of DePIN compute economics

### Takeaway
The consensus critique is that emissions bootstrap supply but not demand, and that supply-side operators are unprofitable once token prices fall. Independent analysts (Pine Analytics, Messari data, review sites) consistently find self-reported revenue overstated. Institutional critiques (Galaxy, Delphi) were not retrieved in this session.

### Cited Findings
- "Early DePIN projects survived almost entirely on inflationary token emissions... That model collapsed for many networks when token prices inevitably fell." — [BlockEden, 2026-04-12 [LOW]](https://blockeden.xyz/blog/2026/04/12/depin-revenue-pivot-token-subsidies-ai-compute-akash-render-ionet/)
- Dozens of compute projects still pay out tokens worth more than their customer revenue, with emissions exceeding demand revenue "by 10x or more" (the figure is unsourced). — [Ricosworks "The Subsidy Cliff", 2026-09-25 [LOW]](https://github.com/Ricosworks1/depin-research-reports/releases/tag/depin-dispatch-subsidy-cliff-20260925)
- Operator economics, both from a [LOW] unsourced post:
  - An RTX 4090 ($1,500–2,000) earns about $2–5.50/day on Akash.
  - Render 4090 break-even is 13–23 months.
  - Only well-utilized Render GPU nodes break even in under two years.
  - Source: [Ricosworks "Networks Profit, Operators Don't", 2026-11-06](https://github.com/Ricosworks1/depin-research-reports/releases/tag/depin-dispatch-networks-profit-operators-dont-20261106)
- Pine Analytics' bear case on Chutes found a subsidy-to-revenue ratio of 22–40x and an unsubsidised price about 1.6x Together.ai's. At flat revenue, subsidies would still be about 15:1 at the next halving (about December 2029). — [ownyourmind.ai Chutes](https://ownyourmind.ai/tokenomics/chutes-bittensor-revenue-machine/)
- Messari's Q1 2026 Akash data shows utilization "rising" only because capacity shrank faster than usage, with revenue down 45% QoQ. — [cryptodaily](https://cryptodaily.co.uk/2026/06/akt-after-ai-rally-decentralized-compute-utilization); [Messari/Blockworks](https://app.blockworks.com/report/state-of-akash-q1-2026-final)
- Coincub cites enterprise barriers to DePIN AI compute: compliance, reliability and data security. — [Coincub](https://coincub.com/blog/depin-ai/)
- The counter-narrative: "enterprise cloud overflow is replacing token subsidies as the real growth engine". — [BlockEden, 2026-04-03 [LOW]](https://blockeden.xyz/blog/2026/04/03/depin-revenue-inflection-enterprise-cloud-overflow-akash-ionet/)

### Inferences
- **What works**: networks that act as GPU brokers with real datacenter supply and enterprise sales (Aethir) can book tens of millions of dollars in fees. Even so, revenue is concentrated (61 payers), volatile (−75% from peak) and possibly related-party.
- **What doesn't work**: permissionless consumer "spare GPU" supply rewarded by emissions. It attracts fake or idle supply (io.net 2024), doesn't match buyer needs (NVLink clusters, SLAs, compliance), and leaves operators unprofitable when the token falls.
- **For a new entrant**: pay suppliers from buyer revenue, in fiat or stablecoins, and do not count emissions as revenue. Report verified active and utilized capacity rather than registered capacity. Target specific workloads tolerant of heterogeneous, unreliable hardware (batch inference, rendering, embarrassingly parallel jobs) rather than competing with neoclouds on H100 training.

### Gaps
- Galaxy Research, Delphi Digital and Token Terminal analyses were not retrieved. A follow-up should pull Galaxy's DePIN reports and Token Terminal revenue dashboards for Aethir, io.net, Render and Akash.
- No institutional, peer-reviewed study of DePIN compute unit economics was found. Many critiques found are blog-grade.

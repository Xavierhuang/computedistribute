# Fiat GPU/Compute Marketplaces and Community Clouds: Competitor Profiles (as of 2026-11-08)

Scope: non-crypto (fiat-billed) platforms where third parties sell GPU compute. Platforms covered: Vast.ai, RunPod, SaladCloud, TensorDock, Hyperbolic, Prime Intellect, SF Compute, Shadeform, Node AI (crypto; brief mention only), plus Compute Exchange and Ornn, and the 2026 compute-futures exchanges.

Source-quality note: many 2026 "review" and pricing pages (Spheron, Thunder Compute, Clore.ai, GPUnex, gpuhosted, etc.) are SEO content written by competing GPU clouds. They are flagged where used. Company press releases and docs are treated as primary sources but are self-reported.

---

## 1. Product model: what does each platform sell, and how?

### Takeaway
The field splits into three groups: (a) **open peer-to-peer marketplaces** where hosts set prices and buyers rent containers or VMs (Vast.ai, TensorDock, and RunPod Community Cloud originally); (b) **managed distributed clouds** that hide the hosts behind a container or queue platform (SaladCloud, RunPod Serverless); and (c) **datacenter-capacity exchanges and aggregators** that trade reserved blocks or route between neoclouds (SF Compute, Shadeform, Compute Exchange, Hyperbolic's 2026 "Global Compute Grid", Prime Intellect's compute layer). Group (c) is moving toward financial products such as resale, spot pricing, and futures.

### Cited Findings
**Vast.ai**
- Hosts set their own prices for GPUs, internet bandwidth, and storage. There are three rental types: **on-demand** (fixed hourly price, priority over interruptible), **interruptible** (buyers bid and the highest bid runs while the others pause; hosts can set a minimum bid), and **reserved** (hosts set a maximum long-term discount). Contracts lock in the price and end date at rental time. Hosts can also set "Min GPU" to allow fractional slices of a multi-GPU machine (powers of 2) — [Vast docs, hosting overview](https://docs.vast.ai/documentation/host/hosting-overview)
- Vast does not charge renters a separate platform fee or markup on top of host-set prices. The listed price already includes Vast's cut — [Spheron blog (competitor), 2026](https://www.spheron.network/blog/vastai-pricing-2026/); see also [Vast earnings article](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai)

**RunPod**
- Two pod tiers: **Secure Cloud**, which runs in T3/T4 datacenters with high redundancy, and **Community Cloud**, described as a "vetted peer-to-peer system" with variable reliability — [RunPod docs: Choose a Pod](https://docs.runpod.io/pods/choose-a-pod)
- **RunPod no longer accepts new Community Cloud hosts. Existing Community Cloud resources remain available** — [RunPod docs](https://docs.runpod.io/pods/choose-a-pod). (The docs give no date for this change.)
- Products include pods (billed per second, no commitment), Serverless (priced per hour on a separate rate card), and Instant Clusters — [RunPod pricing page](https://www.runpod.io/pricing)

**SaladCloud**
- **Salad Container Engine** runs containers across distributed consumer GPUs (Community Cloud). Other products: **Salad Dedicated** (reserved bare metal or VMs on contract), **AI Gateway** (OpenAI-compatible LLM endpoint), **Transcription API**, one-click "Recipes", and a **Virtual Kubelet** for scheduling Kubernetes pods onto SaladCloud. There is no dedicated job-queue product; queues appear only as a recommended pattern for batch work — [Salad pricing page](https://salad.com/pricing)
- Four priority tiers: High (not preempted, though nodes can still disconnect), Medium, Low, and Lowest/Batch. Medium and Low can be preempted after roughly 30 minutes. Billing covers running time only; allocation, image download, and cold start are free — [Salad pricing](https://salad.com/pricing)

**SF Compute (San Francisco Compute Company)**
- Buyers reserve GPU capacity and can **sublease or sell back idle reserved capacity** to other tenants through a scheduler. Offered as VMs, bare metal, and managed Slurm. Elastic InfiniBand partitions are in public preview. Buying and reselling can be done from the `sf` CLI or a dashboard — [sfcompute.com](https://sfcompute.com/)
- SF Compute sells long-term compute contracts financed by outside investors and lets buyers sublease spare capacity through a real-time marketplace. It reportedly takes about **10% per transaction** — [DCD, late 2025](https://www.datacenterdynamics.com/en/news/sf-compute-raises-40m-for-ai-compute-marketplace-offering/); [eWeek](https://www.eweek.com/news/sf-compute-ai-funding/)

**Hyperbolic**
- Started (2024) as a GPU marketplace built on idle capacity, plus serverless inference — [Hyperbolic blog, Series A](https://www.hyperbolic.ai/blog/hyperbolic-secures-20m-total-funding-with-latest-series-a)
- In October 2026 it announced a "**Global Compute Grid**" where suppliers and customers can buy, sell, and **resell** eligible GPU capacity, built on its "Forge" control plane. Spot instances, dynamic pricing, and market-making were announced as planned, not live — [Hyperbolic blog, Series A1 (Oct 2026)](https://www.hyperbolic.ai/blog/a1-funding); [RuntimeWire](https://runtimewire.com/article/hyperbolic-30m-series-a1-global-compute-grid); [MLQ.ai](https://mlq.ai/news/hyperbolic-is-building-a-physical-gpu-market-as-compute-futures-take-shape/)

**Prime Intellect**
- Its compute layer is a "meta-cloud" that aggregates GPU inventory from centralized and decentralized providers into one marketplace with live pricing. In 2026 the company also offers the PRIME-RL post-training stack, 2,500+ RL environments, and OpenAI-compatible inference. Compute is now one of four product layers, not the whole business — [Sacra](https://sacra.com/research/prime-intellect); [aitoolsatlas](https://aitoolsatlas.ai/tools/prime-intellect)
- Described as an asset-light peer-to-peer compute exchange connecting developers, startups, cloud providers, and datacenters — [Sacra](https://sacra.com/c/prime-intellect/)

**Shadeform**
- A GPU cloud marketplace and aggregator that connects users to multiple GPU providers through **one API** (YC S23). Partnered with WhiteFiber in March 2025 to offer B200s — [CB Insights](https://www.cbinsights.com/company/shadeform); [LinkedIn](https://www.linkedin.com/company/shadeformai); [WhiteFiber SEC filing DRS/A](https://www.sec.gov/Archives/edgar/data/2042022/000121390025052267/filename1.htm)

**TensorDock**
- A GPU cloud marketplace of third-party hosts (data-center and community), **acquired by Voltage Park in March 2025** — [DCD](https://www.datacenterdynamics.com/en/news/gpuaas-provider-voltage-park-acquires-gpu-cloud-marketplace-tensordock/); [Yahoo Finance / press release](https://finance.yahoo.com/news/voltage-park-acquires-tensordock-expanding-160000598.html)
- One pricing page lists both fixed on-demand prices and **marketplace bids** for H100 — [Spheron blog (competitor)](https://www.spheron.network/blog/tensordock-pricing-2026/)

**Compute Exchange**
- An institutional procurement marketplace for reserved GPU capacity. It matches buyers and providers but does not operate capacity. In July 2026 it launched a secondary marketplace for older NVIDIA GPUs — [StartupHub.ai](https://www.startuphub.ai/ai-news/technology/2026/compute-exchange-wants-gpus-to-trade-like-stocks); [Compute Exchange blog](https://compute.exchange/blogs/the-rise-of-gpu-marketplaces-in-2026)

**Ornn / compute futures**
- Ornn is building a market for trading compute as a commodity and has a Compute Price Index integrated with the Bloomberg Terminal — [Axios, 2026-07-06](https://www.axios.com/2026/07/06/ornn-gpu-compute-commodity)
- CME, working with Silicon Data, launched or planned compute futures contracts. ICE with Ornn, and Architect Financial Technologies, have announced cash-settled GPU-compute futures — [CNBC, 2026-08-11](https://www.cnbc.com/2026/08/11/ai-computing-power-becomes-a-tradable-asset-class-as-cme-starts-futures.html); [CNBC, 2026-05-12](https://www.cnbc.com/2026/05/12/new-futures-market-for-semiconductors-comes-as-ai-drives-costs-skyward.html); [GARP](https://www.garp.org/risk-intelligence/technology/cant-get-enough-compute-260828)
- Critics argue that cash-settled futures and physical-delivery GPU markets are being lumped into one story — [Full Hoffman, 2026-08-13](https://fullhoffman.com/2026/08/13/a-gpu-hour-is-not-a-barrel-of-oil/)

**Node AI** (crypto; excluded)
- Node AI uses an Ethereum token ($GPU). In June 2025 it announced a "Phase 01" GPU aggregator claiming links to AWS, Azure, Vast.ai, RunPod, and others, alongside staking and a DAO. The founders are not publicly disclosed. It is token-based, so it is out of scope here — [GlobeNewswire, 2025-06-04](https://www.globenewswire.com/news-release/2025/06/04/3093945/0/en/Node-AI-GPU-Launches-Phase-01-of-GPU-Aggregator-with-AWS-Azure-Vast-AI-More-Alongside-GPU-DAO-Staking-2-0.html); [CoinDesk](https://www.coindesk.com/price/node-ai); [CoinClear rating 4.4/10](https://coinclear.pages.dev/ai-depin/nodeai)

### Inferences
- **The open, consumer-host P2P market is consolidating.** RunPod closed Community Cloud to new hosts, TensorDock was absorbed into Voltage Park, and Salad abstracts its hosts behind a managed container platform. Vast.ai is the main remaining open, host-priced, bid-based marketplace for individual hosts.
- **New money and new entrants (SF Compute, Hyperbolic Grid, Compute Exchange, Ornn, CME) target datacenter-grade capacity as a tradeable asset, not idle gaming PCs.** That leaves the "small host / prosumer / small datacenter" supply side relatively underserved by well-funded fiat platforms.
- No platform found combines Vast-style open host onboarding with a Salad-style managed batch/queue abstraction **and** a strong trust tier. That combination may be a gap.

### Gaps
- Exact date RunPod stopped accepting Community Cloud hosts: not found in the docs.
- Whether Vast.ai offers a first-party serverless or inference product in 2026: not verified within the research budget.
- Shadeform's business model (markup vs. provider revenue share) and current product scope: no primary source found.

---

## 2. Supply side: who are the hosts, what is required, how are they paid, and what is the take rate?

### Takeaway
Vast.ai and Salad are the only covered platforms still recruiting **individual and small-operator hosts**. Vast targets serious hosts (Ubuntu, near-100% uptime, ISO-27001 facilities for "datacenter" status). Salad targets gamers running a Windows app. Vast's take is about 20% (implied from Vast's own content), and Salad's has been reported at about 23%. Exchange-style platforms (SF Compute, Hyperbolic, Compute Exchange) source from **neoclouds and datacenters**, and SF Compute takes about 10%.

### Cited Findings
**Vast.ai**
- Hosts install Ubuntu, NVIDIA drivers, the Vast hosting daemon, and the CLI. They must open ports for direct client connections and plan for near-100% uptime with reliable power, cooling, and internet. AMD EPYC systems need IOMMU configuration — [Vast docs](https://docs.vast.ai/documentation/host/hosting-overview)
- "Datacenter" status requires a minimum number of servers and third-party certification of the facility, e.g. ISO 27001 — [Vast docs](https://docs.vast.ai/documentation/host/hosting-overview)
- **Take rate:** Vast publishes no fixed percentage. Its own earnings article says live GPU prices are typically about 25% above what hosts earn, which implies Vast keeps about 20% of the renter price. Third-party estimates range from 10–15% (Clore.ai, a competitor, which also claims Vast removed a hosting fee in mid-2024) to 25–35% (review sites). **Treat about 20% as the best-supported figure** — [Vast earnings article](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai); [Clore.ai blog (competitor)](https://blog.clore.ai/clore-ai-vs-vast-ai-gpu-cloud-comparison); [MiningBoard](https://miningboard.com/rental-markets/vast-ai); [Vast FAQ](https://vast.ai/faq)
- Hosts number "more than 350 independent hosts" per one secondary source. This is undated and not primary — [Grokipedia](https://grokipedia.com/page/vastai)

**RunPod**
- Community Cloud hosts were "vetted" third parties, and onboarding of new hosts is closed. Secure Cloud capacity comes from T3/T4 datacenter partners — [RunPod docs](https://docs.runpod.io/pods/choose-a-pod)
- The terms of service prohibit Community Cloud hosts from attempting to access client data — [RunPod guide](https://www.runpod.io/articles/guides/keep-data-secure-cloud-gpus)

**SaladCloud**
- Hosts ("chefs") are mostly gamers running the Salad desktop app. Salad says 450,000+ GPUs have contributed compute from 190+ countries and that it has **paid out $7M+ to GPU owners** — [Salad About page](https://salad.com/about/)
- **Take rate:** about 23% of rewards, per a 2021 Latka interview (dated) — [GetLatka](https://getlatka.com/blog/gamers-contribute-gpu-to-this-saas-marketplace-raising-15m-at-70m-valuation-with-5m-in-revenue). A 2026 comparison claims 20–25%, but its fee table is internally inconsistent — [GPUnex](https://www.gpunex.com/blog/sell-computing-power-best-platforms)
- Host earnings depend on GPU/CPU power, "cryptocurrency market conditions," and run time, and earning rates fluctuate during the day and week. Salad historically filled idle time with crypto mining jobs, and hosts are paid in Salad balance redeemable for rewards — [Salad support: how much can I earn](https://support.salad.com/article/60-how-much-can-i-earn-with-salad); [Salad support: sporadic earnings](https://support.salad.com/faq/jobs/why-is-my-earning-rate-sporadic-random); [Salad earning rates](https://salad.com/earning-rates)
- In January 2026 Salad and Golem Network (a crypto/token network) ran a pilot for a decentralized GPU cloud — [Tracxn](https://tracxn.com/d/companies/salad/__GYpUcnOvXvnYSf827IpA24q33m_duiaSbTLq6j8UKyM)

**SF Compute**
- It sells capacity in clusters it says it is "building", using contracts financed by outside investors, plus capacity resold by tenants. It takes about 10% per transaction and claims to manage **more than $100M in hardware covering several thousand GPUs** (late 2025) — [DCD](https://www.datacenterdynamics.com/en/news/sf-compute-raises-40m-for-ai-compute-marketplace-offering/); [eWeek](https://www.eweek.com/news/sf-compute-ai-funding/); [sfcompute.com](https://sfcompute.com/)

**Hyperbolic**
- 2024: suppliers monetized idle GPUs. 2026: the Grid will connect neocloud suppliers. Counts conflict: about 30 neocloud providers (RuntimeWire) vs. "more than 300 GPU cloud providers" in the addressable market. Angel investors include people from GPU clouds WhiteFiber and Vector Core Compute — [Hyperbolic A1 blog](https://www.hyperbolic.ai/blog/a1-funding); [RuntimeWire](https://runtimewire.com/article/hyperbolic-30m-series-a1-global-compute-grid); [TechStartups](https://techstartups.com/2026/10/27/hyperbolic-raises-30m-to-build-global-ai-compute-grid-backed-by-intel-ceo-lip-bu-tans-vc-firm/)

**Compute Exchange**
- Says it has **100 providers and 80,000 GPUs** (per CEO Carmen Li, 2026) — [StartupHub.ai](https://www.startuphub.ai/ai-news/technology/2026/compute-exchange-wants-gpus-to-trade-like-stocks)

**TensorDock**
- Hosts include data-center and "community" hosts. One review reports 99.1% uptime for data-center hosts and about 97% for community hosts (March 2026, secondary) — [gpucloudlist review](https://www.gpucloudlist.com/en/blog/tensordock-review-cheapest-h100)

### Inferences
- About 20% (Vast) to 23% (Salad) appears to be the going rate for consumer/prosumer P2P. About 10% (SF Compute) is the going rate for datacenter-block resale. A new entrant could undercut the P2P take rate, but the take rate is probably not the deciding factor for hosts. Demand (utilization) matters more, judging by Salad's "sporadic earnings" FAQ.
- Salad hosts face highly variable income tied partly to crypto-mining conditions, which is a weak point in host retention.

### Gaps
- Vast.ai payout methods, schedule, and minimums: not found (the docs only mention billing history and invoices).
- RunPod's former Community host payout terms and take rate: not found.
- Salad's current payout options (gift cards, PayPal, etc.) and 2026 take rate: no primary source within the budget.
- Prime Intellect and Shadeform supplier counts and terms: not found.

---

## 3. Pricing to buyers and pricing mechanism

### Takeaway
Consumer GPUs are cheapest on Salad (RTX 4090 $0.16–$0.44/hr, depending on priority) and RunPod Community ($0.34/hr). Datacenter H100s range from about $0.90/hr (unverified Vast hosts) and $0.94/hr (Prime Intellect spot) to $3.99/hr (RunPod Secure SXM). Mechanisms range from fixed list prices (RunPod, Salad) to host-set prices with bidding (Vast, TensorDock) to reserved contracts with resale (SF Compute).

### Cited Findings
**RunPod (pricing page, accessed 2026-11-08)** — fixed list prices, billed per second — [RunPod pricing](https://www.runpod.io/pricing)

| GPU | Secure Cloud $/hr | Community Cloud $/hr | Serverless $/hr |
|---|---|---|---|
| H100 PCIe | 2.89 | from 1.99 | — |
| H100 SXM | 3.99 | from 2.69 | 5.39 (H100) |
| A100 PCIe / SXM | 1.79 / 1.79 | from 1.19 / 1.39 | 2.72 |
| H200 | 5.29 | from 3.59 | 6.99 |
| B200 | 7.99 | 5.98 | 10.79 |
| RTX 4090 | 0.89 | 0.34 | 1.34 |
| RTX 5090 | 1.19 | 0.69 | 1.79 |

- No spot/interruptible pod pricing appears on the current pricing page — [RunPod pricing](https://www.runpod.io/pricing)

**SaladCloud (pricing page, accessed 2026-11-08)** — fixed price per priority tier, billed per second; no minimum commitment; volume discounts above 100 GPUs — [Salad pricing](https://salad.com/pricing)

| GPU | High | Medium | Low | Batch |
|---|---|---|---|---|
| RTX 5090 | $0.600 | $0.483 | $0.367 | $0.250 |
| RTX 4090 | $0.440 | $0.347 | $0.253 | $0.160 |
| RTX 3090 | $0.200 | $0.163 | $0.127 | $0.090 |

- H100 and A100 are not listed on Salad's community pricing. CPU costs $0.005/vCPU-hr plus $0.001/GB RAM-hr — [Salad pricing](https://salad.com/pricing)

**Vast.ai** — host-set on-demand prices, interruptible bidding, reserved discounts — [Vast docs](https://docs.vast.ai/documentation/host/hosting-overview)
- H100: about **$1.50–$1.87/hr on verified-datacenter hosts vs. about $0.90/hr on unverified hosts** (2026, secondary) — [Fast.io review 2026](https://fast.io/resources/vast-ai-review-2026/); [GPUnex review](https://www.gpunex.com/blog/vast-ai-review-2026/)
- RTX 4090 and A100 comparisons: see [Thunder Compute (competitor)](https://www.thundercompute.com/blog/vast-ai-vs-thunder-compute). Specific numbers were not verified from a primary source.

**TensorDock (2026, secondary/conflicting)**
- H100 on-demand $1.90–$2.50/hr; marketplace bids $1.30–$1.91/hr — [Spheron (competitor)](https://www.spheron.network/blog/tensordock-pricing-2026/)
- H100 SXM $2.20–$2.80/hr (March 2026) — [gpucloudlist](https://www.gpucloudlist.com/en/blog/tensordock-review-cheapest-h100)

**Prime Intellect**
- Single-node H100 **$2.43/hr on-demand, $0.94/hr spot** (date unclear) — [Toolradar](https://toolradar.com/tools/prime-intellect/pricing). The company earlier quoted $1.5–4/hr — [Prime Intellect blog](https://primeintellect.ai/blog/compute)

**SF Compute**
- The website shows no public per-GPU price list. An illustrative chart shows a reserved price of $3.00/GPU-hr with resale at 1.5x/4.5x and burst/spot at 0.5x, with the tiers undefined — [sfcompute.com](https://sfcompute.com/)

**Market context**
- H100 market indices cited about $1.70–$2.63/hr in 2026 depending on contract length and provider. H100 rental rates spiked in May 2026 and later retreated, per a Bloomberg-terminal index (Ornn) — [Leodex news](https://news.leodex.io/news/h100-gpu-rental-rates-retreat-after-may-spike-bloomberg-terminal-index-shows); [Pulse](https://www.pulse.bot/semiconductors/blogs/live-rental-prices-for-h100-and-other-gpus-increasing-87006160-1145-4bca-a5b6-c40bf892b55f/)

### Inferences
- RunPod's Community vs. Secure prices differ by roughly 30–60% on datacenter GPUs and up to 2.6x on the RTX 4090. That gap is the market price of "trust".
- Salad's Batch tier ($0.16/hr for a 4090) undercuts RunPod Community's 4090 by about 50%. This shows how cheap interruptible consumer GPUs get when the platform guarantees nothing.
- A newcomer competing on consumer GPUs (4090/5090) would face a price floor of about $0.16–$0.35/hr.

### Gaps
- Hyperbolic and Shadeform current H100 prices: not retrieved.
- Vast.ai RTX 4090/5090 median marketplace prices from a primary source: not retrieved (Vast's live listings are dynamic).

---

## 4. Traction: revenue, GPU count, users, growth

### Takeaway
RunPod is the breakout: **$325M ARR in October 2026, up from $120M in January 2026**, with 1.2M+ developers. Most other players disclose little. Vast.ai's only public revenue figure is a dubious third-party estimate of $2.2M, contradicted by claims of 14,000+ monthly paying customers. Salad reports $7M+ in cumulative host payouts.

### Cited Findings
- **RunPod:** surpassed **$325M ARR** (press release, 2026-10-13), up from **$120M ARR** (January 2026). Signups grew 155% YoY at the January announcement. **1.2M+ developers** as of October 2026. Brian Erickson appointed CFO — [RunPod press, Oct 2026](https://www.runpod.io/press/runpod-325m-arr-new-cfo); [PR Newswire](https://www.prnewswire.com/news-releases/runpod-surpasses-325-million-in-arr-appoints-brian-erickson-as-chief-financial-officer-302906607.html); [RunPod press, Jan 2026](https://www.runpod.io/press/runpod-ai-cloud-surpasses-120m-in-arr)
- RunPod started with a Reddit post. TechCrunch cited about 500,000 developers in January 2026 — [TechCrunch, 2026-01-16](https://techcrunch.com/2026/01/16/ai-cloud-startup-runpod-hits-120m-in-arr-and-it-started-with-a-reddit-post/). ARR is self-reported and unaudited — [FourWeekMBA](https://fourweekmba.com/ai-cloud-runpod-reaches-325m-arr-nearly-3x-since-january/). ValueAddVC reported about $240M ARR around June 2026 (unverified) — [ValueAddVC](https://valueaddvc.com/pulse/runpod-100m-series-a-1b-valuation-2026)
- **Vast.ai:** GetLatka estimates **$2.2M ARR (September 2025)**. This is not company-reported and is likely unreliable — [GetLatka](https://getlatka.com/companies/vast.ai). A secondary review claims **120,000+ developers and 14,000+ monthly paying customers by early 2026, with paying customers up 16x YoY** — [ChatForest](https://chatforest.com/reviews/vastai-gpu-marketplace-spot-compute/). Headcount estimates conflict: 20 (Latka), 38 (Grokipedia), 46 (PitchBook) — [PitchBook](https://pitchbook.com/profiles/company/531153-01)
- **Salad:** 450,000+ GPUs have contributed, from 190+ countries, and $7M+ has been paid to GPU owners (company, undated) — [Salad About](https://salad.com/about/). Secondary sources cite 60,000+ daily active GPUs and 2M+ registered nodes (unverified) — [gpupicks](https://gpupicks.com/salad-review/); [Quasa](https://quasa.io/video/salad-the-distributed-gpu-cloud-saving-up-to-90-on-ai-compute). Revenue estimates: about $5M run rate (2021, Latka); about $10.4M (GetLatka estimate, undated) — [GetLatka](https://getlatka.com/blog/gamers-contribute-gpu-to-this-saas-marketplace-raising-15m-at-70m-valuation-with-5m-in-revenue)
- **SF Compute:** manages >$100M of hardware and several thousand GPUs (late 2025). The CEO, Evan Conrad, declined to disclose revenue or users — [DCD](https://www.datacenterdynamics.com/en/news/sf-compute-raises-40m-for-ai-compute-marketplace-offering/)
- **Hyperbolic:** claims **250,000+ AI builders** (October 2026, unverified) — [Pulse2](https://pulse2.com/hyperbolic-raises-30-million-series-a1-to-build-global-ai-compute-grid/)
- **Shadeform:** about $1M revenue with a 5-person team in 2024 (GetLatka) — [GetLatka](https://getlatka.com/companies/shadeform.ai)
- **Compute Exchange:** 100 providers and 80,000 GPUs (2026, CEO claim) — [StartupHub.ai](https://www.startuphub.ai/ai-news/technology/2026/compute-exchange-wants-gpus-to-trade-like-stocks)

### Inferences
- RunPod's growth shows that developer-first UX (templates, serverless, per-second billing) captures more value than a pure marketplace. RunPod closed the open-host door while growing about 2.7x in nine months.
- The Vast.ai $2.2M figure is almost certainly an underestimate, given 14,000+ paying monthly customers. The report should not rely on it.

### Gaps
- No primary 2025–2026 revenue figures for Vast.ai, Salad, SF Compute, Prime Intellect, or Hyperbolic.
- No primary current GPU counts for Vast.ai or RunPod.

---

## 5. Funding, investors, valuation

### Takeaway
Capital is flowing to **developer clouds (RunPod, $1B valuation)** and **exchange/financialization plays (SF Compute $300M valuation, Prime Intellect $1B, Hyperbolic $50M total, Ornn $33M seed)**. The pure P2P marketplaces (Vast.ai, Salad) have raised comparatively little, and in Salad's case not recently.

### Cited Findings
- **RunPod:** $20M seed co-led by Dell Technologies Capital and Intel Capital — [TechCrunch, 2026-01-16](https://techcrunch.com/2026/01/16/ai-cloud-startup-runpod-hits-120m-in-arr-and-it-started-with-a-reddit-post/). **$100M led by Summit Partners (June 2026), at a reported $1B valuation**, reportedly after rejecting $500M buyout offers (secondary) — [ValueAddVC](https://valueaddvc.com/blog/runpod-100m-series-a-1b-valuation-ai-developer-cloud-gpu). Total of about $122M across 3 rounds — [Tracxn](https://tracxn.com/d/companies/runpod/__fmUJ0oyBYH3F6QbwBUl3wrJN0Y1huzsUOz86E5EEvWI)
- **Vast.ai:** $4M seed (July 2024). Investors include DRW and Nazaré Ventures, plus Primavera per PitchBook — [PitchBook](https://pitchbook.com/profiles/company/531153-01). (Do not confuse with VAST Data, the storage company.)
- **Salad:** $17M Series A (2022) co-led by Left Lane Capital and Origin Ventures; about $27.5M total. No 2025–2026 round found — [Salad About](https://salad.com/about/); [Tracxn](https://tracxn.com/d/companies/salad/__GYpUcnOvXvnYSf827IpA24q33m_duiaSbTLq6j8UKyM)
- **SF Compute:** **$40M Series A at a $300M valuation (around 2025-11-26)** led by DCVC and Wing VC, with Electric Capital and Alt Capital participating. About $52M total — [DCD](https://www.datacenterdynamics.com/en/news/sf-compute-raises-40m-for-ai-compute-marketplace-offering/); [Caplight](https://www.caplight.com/company/sfcompute); [Forge](https://forgeglobal.com/san-francisco-compute_stock/)
- **Hyperbolic:** $725K pre-seed; $7M seed (July 2024, Polychain and Lightspeed Faction); $12M Series A (December 2024, Variant and Polychain); **$30M Series A1 (2026-10-27) led by Walden Catalyst**, the VC firm of Intel CEO Lip-Bu Tan. **$50M total.** Angels include people from Citadel Securities and NYSE — [Hyperbolic blog](https://www.hyperbolic.ai/blog/a1-funding); [TechStartups](https://techstartups.com/2026/10/27/hyperbolic-raises-30m-to-build-global-ai-compute-grid-backed-by-intel-ceo-lip-bu-tans-vc-firm/). Its early investors are crypto funds (Polychain, Variant). No token was found in these sources.
- **Prime Intellect:** $5.5M seed (April 2024, Distributed Global and CoinFund); $15M (February 2025, Founders Fund, with Karpathy, Menlo, and others); **$130M Series A at a $1B valuation led by Radical Ventures (July 2026 per Wikipedia)**. Total of $150M+ (conflicting estimates up to $200M) — [Wikipedia](https://en.wikipedia.org/wiki/Prime_Intellect); [CryptoBriefing](https://cryptobriefing.com/prime-intellect-130m-series-a-billion-valuation/); [Pulse2](https://pulse2.com/prime-intellect-open-and-decentralized-ai-platform-company-raises-5-5-million/). CryptoBriefing frames it as "bridging decentralized AI and crypto-native capital".
- **Shadeform:** funding unclear. Estimates include $500K (CB Insights, seed August 2023), $1M (Caplight), $20M (StartupHub), and "bootstrapped" (Latka). Latka lists an M&A offer in April 2025 with no details. No 2026 acquisition confirmed — [CB Insights](https://www.cbinsights.com/company/shadeform); [Caplight](https://www.caplight.com/company/shadeform); [StartupHub](https://www.startuphub.ai/startups/shadeform); [GetLatka](https://getlatka.com/companies/shadeform.ai)
- **TensorDock:** acquired by Voltage Park (March 2025). The founder became GM at Voltage Park; Melissa Du now leads TensorDock as GM — [DCD](https://www.datacenterdynamics.com/en/news/gpuaas-provider-voltage-park-acquires-gpu-cloud-marketplace-tensordock/); [HostingJournalist](https://hostingjournalist.com/news/voltage-park-acquires-tensordock-to-expand-gpu-cloud-services). Lightning AI reportedly merged with Voltage Park in January 2026 (single deal-listing source) — [PrivSource](https://www.privsource.com/acquisitions/deal/voltage-park-acquires-tensordock-ane_gaSgVg)
- **Ornn:** $33M seed backed by a16z — [Axios, 2026-07-06](https://www.axios.com/2026/07/06/ornn-gpu-compute-commodity)

### Inferences
- Investors are pricing "compute as a financial market" (SF Compute, Hyperbolic, Ornn, Prime Intellect) and "developer cloud" (RunPod) much higher than consumer P2P supply. A solo builder is unlikely to win on datacenter exchange liquidity, but the long-tail and prosumer host segment is under-capitalized.

### Gaps
- Shadeform's true funding and ownership status in 2026.
- Whether Lightning AI's merger with Voltage Park changed TensorDock's product (only one source).

---

## 6. Trust and reliability: host verification and buyer workload protection

### Takeaway
The standard pattern is a **two-tier split**: an unverified or community tier versus a **verified-datacenter or "Secure" tier** backed by facility certifications (ISO 27001, SOC 2). Reliability scoring and automated benchmarking (Vast's DLPerf) decide which hosts get verified. Platform-level SOC 2 varies: SOC 2 Type II at RunPod (secondary source), Type I at Salad, and a Trust Center at SF Compute.

### Cited Findings
- **Vast.ai:** verification is **fully automated**, based on reliability, infrastructure, **DLPerf benchmark score**, and supply and demand. An active error de-verifies a machine until it clears. The **reliability score** drops on disconnects, failed instance starts, and offline time, with heavier penalties for restarts during active rentals. Scheduled maintenance windows reduce the penalty. "Datacenter" status requires ISO 27001-type certification — [Vast docs](https://docs.vast.ai/documentation/host/hosting-overview)
- Vast "Secure Cloud" filter: vetted datacenter partners with ISO 27001, HIPAA, and SOC 1–3 (single secondary source) — [Fast.io](https://fast.io/resources/vast-ai-review-2026/); [Vast earnings page](https://cloud.vast.ai/earnings/). Reviewers advise filtering for verified hosts with reliability above 99% for expensive jobs — [ClusterBid](https://clusterbid.com/blog/vast-ai-gpu-marketplace-deep-dive-decentralized-pricing-reliability)
- **RunPod:** Secure Cloud runs in T3/T4 datacenters. Community Cloud is "vetted P2P" with variable reliability — [RunPod docs](https://docs.runpod.io/pods/choose-a-pod). RunPod states it is **SOC 2 Type II** compliant, and its ToS bars Community hosts from accessing client data — [RunPod guide](https://www.runpod.io/articles/guides/keep-data-secure-cloud-gpus)
- **SaladCloud:** **SOC 2 Type I** badge and Trust Center. Workloads run as containers on consumer PCs, and even the High priority tier can see node disconnections — [Salad pricing](https://salad.com/pricing)
- **SF Compute:** SOC 2 Trust Center badge, SLA, and DPA — [sfcompute.com](https://sfcompute.com/)
- **Hyperbolic:** the Grid's resale and dynamic pricing depend on Forge making machines across providers "reliable and interchangeable enough to trade" (independent analysis) — [RuntimeWire](https://runtimewire.com/article/hyperbolic-30m-series-a1-global-compute-grid)
- **TensorDock:** about 99.1% uptime for datacenter hosts vs. about 97% for community hosts (March 2026, secondary) — [gpucloudlist](https://www.gpucloudlist.com/en/blog/tensordock-review-cheapest-h100)

### Inferences
- Trust is the main way these platforms differentiate their price points (see the RunPod Secure vs. Community spread). Standardized hardware benchmarking and verification (DLPerf-style) plus fungibility across providers is the open problem Hyperbolic is now raising money to solve. A builder could compete on transparent, independently auditable host verification.
- Consumer-host clouds cannot offer confidential computing guarantees. Sensitive workloads gravitate to "Secure" or datacenter tiers.

### Gaps
- Vast.ai's own platform-level SOC 2 status: not confirmed from a primary source.
- Whether any of these platforms offers confidential computing (H100 CC mode, TEEs) for marketplace hosts: not researched within the budget.

---

## 7. User and host sentiment (complaints and praise)

### Takeaway
Sentiment evidence found in this pass is thin and mostly comes from secondary or competitor reviews. Recurring themes: Vast is praised for low prices, and its main complaint is uneven host reliability. Salad hosts complain about unpredictable earnings. TensorDock faces 2026 availability complaints, possibly linked to the acquisition. RunPod is praised for developer UX and growth.

### Cited Findings
- Vast.ai is characterized as "the GPU marketplace that undercuts everyone", with a reliability trade-off on unverified hosts. One reviewer adds a 20–40% "reliability markup" estimate for using unverified hosts (single source, repeated elsewhere) — [ChatForest](https://chatforest.com/reviews/vastai-gpu-marketplace-spot-compute/); [GPUnex](https://www.gpunex.com/blog/vast-ai-review-2026/)
- Salad itself acknowledges hosts see sporadic or random earning rates, and that earnings can come in below WhatToMine estimates — [Salad support](https://support.salad.com/faq/jobs/why-is-my-earning-rate-sporadic-random); [Salad support: WhatToMine](https://support.salad.com/faq/jobs/why-do-i-earn-less-more-with-salad-than-whattomine). Third-party guides say first-month host earnings are often only 30–40% of steady state (unverified) — [qwe.edu.pl](https://www.qwe.edu.pl/tutorial/gpu-rental-income-real-net/)
- TensorDock: a competitor blog says GPU availability has been "widely reported as empty or unresponsive since late 2025" and calls the status "unclear as of June 2026". This is unverified competitor content — [Thunder Compute, August 2026](https://www.thundercompute.com/blog/tensordock-alternatives)
- RunPod Trustpilot reviews exist but were not analyzed — [Trustpilot](https://se.trustpilot.com/review/runpod.io)

### Inferences
- Host-side pain (Salad earnings volatility, Vast reliability penalties, RunPod closing host onboarding, TensorDock's uncertain future) suggests unmet demand among small hosts for a predictable-income marketplace.

### Gaps
- **Reddit and Hacker News sentiment was not directly sampled** (searches returned no threads). The report writer should treat this section as weak. Recommended follow-ups: r/vastai, r/SaladChefs, r/LocalLLaMA, and HN threads on RunPod, Vast, and SF Compute.

---

## 8. Other notable fiat marketplaces and status changes (2025–2026)

### Takeaway
Key structural changes: TensorDock was acquired (March 2025) and its parent reportedly merged into Lightning AI (January 2026). RunPod stopped onboarding Community hosts. Hyperbolic pivoted from idle-GPU marketplace to neocloud exchange (October 2026). Prime Intellect expanded from compute marketplace into an RL/post-training lab. Compute financialization launched in 2026 (Compute Exchange, Ornn, and CME/ICE futures).

### Cited Findings
- TensorDock → Voltage Park (March 2025) → Lightning AI merger (January 2026, single source) — [DCD](https://www.datacenterdynamics.com/en/news/gpuaas-provider-voltage-park-acquires-gpu-cloud-marketplace-tensordock/); [PrivSource](https://www.privsource.com/acquisitions/deal/voltage-park-acquires-tensordock-ane_gaSgVg)
- RunPod Community Cloud closed to new hosts — [RunPod docs](https://docs.runpod.io/pods/choose-a-pod)
- Hyperbolic's Global Compute Grid (October 2026) — [Hyperbolic](https://www.hyperbolic.ai/blog/a1-funding)
- Compute Exchange secondary market for older GPUs (July 2026) — [StartupHub.ai](https://www.startuphub.ai/ai-news/technology/2026/compute-exchange-wants-gpus-to-trade-like-stocks)
- Nodestream announced a "verified OTC marketplace" for GPUs (press release, 2026-08-19; content not reviewed) — [Fortune press release](https://fortune.com/press-releases/nodestream-verified-otc-marketplace-gpu-2026-08-19/)
- GPU Trader is listed as a comparable product to Node AI (no details gathered) — [SourceForge](https://www.sourceforge.net/software/compare/GPU-Trader-vs-Node-AI)

### Inferences
- The market is bifurcating. The **top end** (datacenter blocks, futures, resale) is crowded with well-funded players. The **long tail** (prosumer, small-datacenter, and enterprise-idle supply with a good buyer abstraction) has fewer active, well-funded fiat competitors after RunPod's and TensorDock's retreat. Vast.ai and Salad remain the incumbents.

### Gaps
- Not covered within the budget: Cudo Compute, Massed Compute, QuickPod, FluidStack (not a P2P marketplace), Akash/io.net/Clore/Lium (crypto, excluded), Nodestream, and GPU Trader. These need follow-up if the report requires completeness.

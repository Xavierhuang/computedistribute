# Sell verified batch jobs, not GPU-hours

A new spare-compute marketplace has a real opening in late 2026, but it sits in the long tail of the market. The big money and the hype are elsewhere. GPU cloud rental generates **more than $20B of revenue in 2026**, and CoreWeave alone guides to $12.4–13.2B. Almost all of that money moves through multi-year, prepaid contracts for datacenter clusters, which a peer-to-peer marketplace cannot supply. Decentralized (DePIN) compute carries about $10B of token market cap, yet all of DePIN earned only **about $72M of onchain revenue in 2025**. The compute networks among them typically pay suppliers 4–40x more in tokens than buyers pay in fees.

Between those two poles, small buyers are poorly served. H100 rental prices have climbed from about $1.70 to **about $3.10 per GPU-hour** since October 2025, and on-demand capacity is sold out. The open marketplaces are thinning. RunPod reached $325M ARR and stopped accepting new community hosts. TensorDock was acquired. That leaves Vast.ai and Salad as the main open platforms, and buyers criticize both for unreliable hosts, weak privacy and erratic prices. Sellers earn little: one RTX 4090 in the US nets roughly **$30–125 a month** before depreciation, and unverified hosts earn close to nothing. GPU owners are easy to find. Paying buyers are the constraint.

A solo builder should start from demand. The recommended product is a **batch service priced per job**: transcription, embeddings, image and video generation, batch inference on open-weight LLMs, and rendering. It runs on a small, verified pool of 24–32GB consumer GPUs, sells only to businesses, isolates each job in a VM, verifies results by re-running a sample, and pays hosts in fiat through Stripe Connect. Avoid tokens, H100 training clusters, compute-exchange plays, and a generic Vast.ai clone that competes on raw dollars per GPU-hour.

## GPU rental is a $20B-plus market that the long tail barely touches

Analyst market-size reports are not much use here. Paid-report vendors put GPU-as-a-Service at between **$5.1B** ([Grand View via PR](https://smb.orangeleader.com/article/GPU-as-a-Service-Market-to-Reach-USD-144-Billion-by-2033-at-160percent-CAGR-Fueled-by-Generative-AI-Machine-Learning-and-Cloud-Infrastructure-Expansion-Grand-View-Research-Inc/6a2af17145b635ab6be4db1c)) and **$10.8B** ([Roots Analysis](https://rootsanalysis.com/gpu-as-a-service-market)) for 2026. Their long-range forecasts run from $26B by 2031 ([Mordor via Research and Markets](https://www.researchandmarkets.com/reports/5996768/gpu-service-market-share-analysis-industry)) to $119B by 2036 ([Meticulous](https://www.meticulousresearch.com/product/gpu-as-a-service-market-6749)). One public neocloud's revenue already exceeds most of these 2026 totals. Company reporting gives a better measure:

- **CoreWeave** posted Q2 2026 revenue of **$2.575B, up 112%** year on year. It holds a **$104.2B backlog** and raised full-year guidance to **$12.4–13.2B** ([CoreWeave IR](https://investors.coreweave.com/news/news-details/2026/CoreWeave-Reports-Strong-Second-Quarter-2026-Results/default.aspx)).
- **Nebius** guides to **$3.0–3.4B** for 2026 after Q2 revenue grew 454% ([SII](https://www.sii.org.pl/19312/analizy/analizy-rynki-zagraniczne/nebius-group-po-wynikach-2q-2026-skala-biznesu-rosnie-szybciej-niz-bardzo-wysokie-oczekiwania-analiza.html)).
- **Lambda** is reportedly on track for about $1.5B ([aiweekly](https://aiweekly.co/alerts/nvidia-backed-lambda-in-talks-for-3b-pre-ipo-round-at-12b-valuation-as-2026)).
- **Crusoe** has reportedly told investors to expect about $2.2B ([newmarketpitch](https://newmarketpitch.com/blogs/news/ai-infrastructure-top-revenue)).

These five neoclouds alone add up to more than $20B in 2026, before counting hyperscaler GPU revenue. They sit on top of an estimated **$400–450B of global AI infrastructure capex** ([Deloitte](https://www.deloitte.com/us/en/about/press-room/deloitte-2026-tmt-predictions.html)).

This money is highly concentrated, and that concentration is what creates room for a marketplace. About **67% of CoreWeave's 2025 revenue came from Microsoft** ([longyield](https://longyield.substack.com/p/coreweave-books-104-billion-it-also)). SemiAnalysis reports that AI startups and smaller labs now sign 1–3-year terms, and increasingly 4-year-plus deals with more than 20% prepaid ([SemiAnalysis](https://newsletter.semianalysis.com/p/the-great-gpu-shortage-rental-capacity)). A buyer who needs four GPUs for a weekend cannot sign those contracts. In a survey of 1,367 AI professionals, **85% said their organization had delayed projects for lack of GPU access** ([Techstrong.ai](https://techstrong.ai/articles/survey-gpu-scarcity-delays-ai-initiatives)). A 2024 Nature analysis, cited second-hand, found that most academics with compute access have only 1–8 GPUs ([Hugging Face](https://huggingface.co/blog/sasha/compute-competition)).

The type of workload is moving toward what spare hardware can serve. Deloitte expects inference to make up **about two-thirds of AI compute in 2026**, up from half in 2025 and a third in 2023 ([Deloitte](https://www.deloitte.com/us/en/about/press-room/deloitte-2026-tmt-predictions.html)). SemiAnalysis attributes the 2026 squeeze to coding agents, multi-agent workflows, open-weight models and image and video generation ([SemiAnalysis](https://newsletter.semianalysis.com/p/the-great-gpu-shortage-rental-capacity)). Inference, fine-tuning and batch jobs run fine on single nodes with mixed hardware spread across locations. Large pre-training does not, because it needs co-located clusters with InfiniBand or NVLink. ComputePrices puts it bluntly: "a single cheap marketplace node cannot substitute for a cluster" ([ComputePrices](https://computeprices.com/blog/gpu-marketplaces-compared-vast-runpod-salad-shadeform-and-more)).

The market today is short of capacity, not oversupplied. By spring 2026 SemiAnalysis found on-demand capacity **"sold out across all GPU types"**, and half of the surveyed providers could not supply 64 H100s or H200s ([SemiAnalysis](https://newsletter.semianalysis.com/p/the-great-gpu-shortage-rental-capacity)). CoreWeave raised list prices about 25% in July ([cloudmagazin](https://www.cloudmagazin.com/en/2026/10/04/renting-gpus-without-hyperscalers-assessing-the-value-of-neo-clouds/)). Nebius raised H100 pricing from $3.85 to $4.50 on October 1. A new RTX 5090 resold for about **$4,500, more than twice its $1,999 MSRP**, in August ([Neurohive](https://neurohive.io/en/guides/cloud-gpu-pricing/)). Scarcity helps a spare-compute marketplace from both directions. Buyers locked out of neocloud contracts need on-demand capacity, and high prices make it worthwhile for owners of idle 4090s, 5090s and A100s to list them.

That advantage will not last indefinitely. CoWoS packaging capacity is projected to rise from about 70–80K wafers a month to 120–140K by the end of 2026, according to Spheron, which is a vendor ([Spheron](https://www.spheron.network/blog/gpu-shortage-2026/)). One forecaster expects H100 rentals to fall toward **$1–1.50/hr in 2027–28** as Blackwell supply saturates ([ColoPrice](https://coloprice.com/guides/h100-rental-prices/)).

DePIN compute is small once measured by paid revenue. Messari's State of DePIN 2025 puts the whole sector at about **$10B of market cap but only about $72M of onchain revenue in 2025**, with leading projects valued at 10–25x revenue ([Cointelegraph](https://cointelegraph.com/news/depin-revenues-grow-despite-token-losses)). No independent estimate exists for the peer-to-peer or spot marketplace segment specifically. Vast.ai's revenue is undisclosed. GetLatka estimates it at $2.2M, which is implausible next to secondary claims of 14,000+ monthly paying customers ([GetLatka](https://getlatka.com/companies/vast.ai); [ChatForest](https://chatforest.com/reviews/vastai-gpu-marketplace-spot-compute/)). The best public signal for long-tail demand is RunPod, which reached **$325M ARR in October 2026, up from $120M in January**, with 1.2M+ developers ([RunPod](https://www.runpod.io/press/runpod-325m-arr-new-cfo)). That figure is self-reported and does not separate community-host revenue from datacenter revenue. The defensible conclusion is that a developer-facing cloud for small buyers can reach hundreds of millions of dollars in revenue, while open peer-to-peer matching by itself has not shown that it can.

## H100s rent for $3.10 again, and consumer cards cost a seventh of that

| GPU | Market index or median, Oct–Nov 2026 | Cheapest marketplace listings | Neocloud / "secure" on-demand | Hyperscaler on-demand |
|---|---|---|---|---|
| H100 80GB | **$3.00–3.10** (Silicon Data / Ornn transaction indexes); all-provider median $3.49 | Vast.ai $2.14; RunPod Community SXM from $2.69; Prime Intellect spot $0.94 | Lambda $3.99; RunPod Secure $3.99; Nebius $4.50; CoreWeave $6.16; secure median $4.16 | AWS $6.88; GCP $11.06; Azure $12.29 |
| A100 80GB | all-provider median $1.85 | Vast.ai from $1.07; RunPod Community from $1.19 | RunPod Secure $1.79; secure median $1.50 | n/a |
| RTX 5090 32GB | all-provider median **$0.70** (up from $0.58 in August) | Salad $0.25–0.60 by priority tier; Vast.ai from about $0.50; RunPod Community $0.69 | RunPod Secure $1.19; secure median $1.00 | n/a |
| RTX 4090 24GB | all-provider median **$0.44** | Salad $0.16–0.44; Vast.ai from about $0.30; RunPod Community $0.34 | RunPod Secure $0.89; secure median $1.73 | n/a |

Sources: [Ornn](https://data.ornn.com/markets/h100-sxm), [Silicon Data](https://www.silicondata.com/products/silicon-index/h100), [gpuperhour secure on-demand index, Nov 8 2026](https://gpuperhour.com/gpu-price-index), [GetDeploying medians via Aura Digital, Oct 5 2026](https://auradigitalglobal.com/blog/vast-ai-gpu-server-earnings/), [Neurohive, Oct 2026](https://neurohive.io/en/guides/cloud-gpu-pricing/), [RunPod pricing](https://www.runpod.io/pricing), [Salad pricing](https://salad.com/pricing), [Toolradar on Prime Intellect](https://toolradar.com/tools/prime-intellect/pricing). The "secure median" figures exclude marketplace and spot listings.

H100 prices have not followed a straight line down. They fell from about **$8/hr in mid-2023 to a $1.70 trough in October 2025**, then rose to $2.35 on one-year contracts by March 2026 ([ColoPrice](https://coloprice.com/guides/h100-rental-prices/); [SemiAnalysis](https://newsletter.semianalysis.com/p/the-great-gpu-shortage-rental-capacity)). By November 2026 they had reached **$3.00–3.10** on transaction indexes. The Ornn index rose from $2.69 at the end of September to $3.10 on November 7 ([Ornn](https://data.ornn.com/markets/h100-sxm)). Blackwell prices rose even faster at the low end: the cheapest B200 listing went from $3.75 to $7.99 between late September and mid-October ([gpuperhour](https://gpuperhour.com/gpu-price-index)). Marketplace hosts noticed. One Hacker News user reported Vast.ai rates "increasing like 50% in September alone" ([HN](https://news.ycombinator.com/item?id=50134971)).

Compute is also becoming a financial product. CME, working with Silicon Data, and ICE, working with Ornn, are launching cash-settled GPU compute futures ([CNBC](https://www.cnbc.com/2026/08/11/ai-computing-power-becomes-a-tradable-asset-class-as-cme-starts-futures.html)). The four main price indexes still disagree with each other ([KuCoin](https://www.kucoin.com/news/flash/gpu-pricing-disarray-four-indices-diverge-market-lacks-consensus)).

Consumer cards are where marketplaces win on price. Marketplace-style providers hold **7 of the 10 cheapest listings for the RTX 4090 and RTX 5090, but only 3 of 10 for the H100 SXM** ([ComputePrices](https://computeprices.com/blog/gpu-marketplaces-compared-vast-runpod-salad-shadeform-and-more)). The number of RTX 5090 providers grew from 8 to 18 between August and October 2026 ([Aura Digital](https://auradigitalglobal.com/blog/vast-ai-gpu-server-earnings/)). For a newcomer, this sets a clear price floor. Interruptible 4090 time already sells for **$0.16/hr** on Salad's batch tier, so no new entrant can undercut on consumer-GPU price.

The most useful number in this market is the gap between cheap compute and trusted compute. RunPod charges **2.6x more for a Secure Cloud 4090 ($0.89) than a Community Cloud one ($0.34)**, and 30–60% more on datacenter GPUs ([RunPod](https://www.runpod.io/pricing)). The median "secure" 4090 costs $1.73, about four times the all-provider median of $0.44 ([gpuperhour](https://gpuperhour.com/gpu-price-index)). On Vast.ai, hosts with reliability scores above 95% command **2–3x the price** of unreliable ones ([ClusterBid](https://clusterbid.com/blog/vast-ai-gpu-marketplace-deep-dive-decentralized-pricing-reliability)).

Prices within the cheap tier are also scattered. One developer saw RTX 5090s listed anywhere from $0.30 to $5 per hour ([HN](https://news.ycombinator.com/item?id=48200001)). Taken together, the spread is what buyers pay for trust, and a small platform with a credible reliability guarantee can charge a premium over raw consumer-GPU rates.

## Incumbents are retreating from open hosting while capital chases exchanges

The fiat players fall into three groups:

1. **Open peer-to-peer marketplaces** where hosts set prices: Vast.ai, TensorDock, and RunPod's original Community Cloud.
2. **Managed distributed clouds** that hide individual hosts behind a container platform: SaladCloud and RunPod Serverless.
3. **Datacenter-capacity exchanges and aggregators**: SF Compute, Shadeform, Hyperbolic's new Grid, Prime Intellect, and Compute Exchange.

The first group is consolidating. RunPod **no longer accepts new Community Cloud hosts** ([RunPod docs](https://docs.runpod.io/pods/choose-a-pod)). TensorDock was acquired by Voltage Park in March 2025 ([DCD](https://www.datacenterdynamics.com/en/news/gpuaas-provider-voltage-park-acquires-gpu-cloud-marketplace-tensordock/)), and a competitor reports its availability has been "widely reported as empty or unresponsive" ([Thunder Compute](https://www.thundercompute.com/blog/tensordock-alternatives)). Hyperbolic began as a marketplace for idle GPUs. In October 2026 it pivoted to a "Global Compute Grid" that trades neocloud capacity ([Hyperbolic](https://www.hyperbolic.ai/blog/a1-funding)). Prime Intellect has grown from a compute aggregator into a reinforcement-learning and post-training lab ([Sacra](https://sacra.com/research/prime-intellect)).

| Platform | Model | Price examples (2026) | Take rate | Traction | Funding | Trust approach |
|---|---|---|---|---|---|---|
| **Vast.ai** | Open P2P. Hosts set prices. On-demand, interruptible (bid) and reserved rentals | H100 about $0.90 (unverified hosts) to $1.87 (verified datacenter); 4090 from about $0.30 | **About 20%** (renters pay about 1.33x the host rate) | About 17–22K GPUs (conflicting third-party counts); 14K+ monthly payers (secondary) | $4M seed (2024) | Automated verification, DLPerf benchmark, reliability score, ISO 27001 for "datacenter" tier |
| **RunPod** | Secure Cloud (T3/T4 datacenters) plus Community Cloud (closed to new hosts), Serverless | H100 SXM $3.99 / $2.69; 4090 $0.89 / $0.34 | Not disclosed | **$325M ARR**, 1.2M+ developers | About $122M total; $100M at a reported $1B valuation | SOC 2 Type II; host ToS forbids data access |
| **SaladCloud** | Managed containers on gamer PCs, four priority tiers | 4090 $0.16–0.44; 5090 $0.25–0.60; CPU $0.005/vCPU-hr; no H100 | About 23% (2021 figure) | 450K+ GPUs have contributed; $7M+ paid to owners | About $27.5M; last round 2022 | Hyper-V VM per job, host intrusion detection, SOC 2 Type I |
| **TensorDock** | P2P marketplace, now owned by Voltage Park | H100 $1.90–2.50 on-demand, $1.30–1.91 bids (competitor data) | n/a | Availability complaints | Acquired March 2025 | About 99.1% datacenter vs 97% community uptime |
| **Hyperbolic** | Idle-GPU marketplace turned neocloud exchange (Grid, October 2026) | H100 SXM $3.19 | n/a | 250K "builders" claimed | $50M total; $30M A1 (October 2026) | Proof of Sampling; Forge control plane |
| **Prime Intellect** | "Meta-cloud" aggregator plus RL stack | H100 $2.43 on-demand, $0.94 spot | n/a | n/a | $130M Series A at $1B (July 2026) | TOPLOC inference verification |
| **SF Compute** | Reserved contracts with resale and sublease of idle blocks | No public list; $3.00 reserved shown in an illustrative chart | **About 10%** | More than $100M of hardware, several thousand GPUs | $40M Series A at $300M | SOC 2, SLA, DPA |
| **Shadeform** | One API across many GPU clouds | n/a | Unclear | About $1M revenue (2024) | Unclear | Relies on underlying providers |

Sources: [Vast docs](https://docs.vast.ai/documentation/host/hosting-overview), [Vast earnings article](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai), [Fast.io](https://fast.io/resources/vast-ai-review-2026/), [PitchBook](https://pitchbook.com/profiles/company/531153-01), [RunPod press](https://www.runpod.io/press/runpod-325m-arr-new-cfo), [Tracxn on RunPod](https://tracxn.com/d/companies/runpod/__fmUJ0oyBYH3F6QbwBUl3wrJN0Y1huzsUOz86E5EEvWI), [RunPod security guide](https://www.runpod.io/articles/guides/keep-data-secure-cloud-gpus), [Salad About](https://salad.com/about/), [GetLatka on Salad](https://getlatka.com/blog/gamers-contribute-gpu-to-this-saas-marketplace-raising-15m-at-70m-valuation-with-5m-in-revenue), [Salad Enterprise](https://salad.com/enterprise), [Spheron on TensorDock](https://www.spheron.network/blog/tensordock-pricing-2026/), [gpucloudlist](https://www.gpucloudlist.com/en/blog/tensordock-review-cheapest-h100), [ComputePrices on Hyperbolic](https://computeprices.com/providers/hyperbolic), [Pulse2](https://pulse2.com/hyperbolic-raises-30-million-series-a1-to-build-global-ai-compute-grid/), [CryptoBriefing on Prime Intellect](https://cryptobriefing.com/prime-intellect-130m-series-a-billion-valuation/), [DCD on SF Compute](https://www.datacenterdynamics.com/en/news/sf-compute-raises-40m-for-ai-compute-marketplace-offering/), [GetLatka on Shadeform](https://getlatka.com/companies/shadeform.ai).

Investors have favored two models. They back **developer clouds**: RunPod is reported at a $1B valuation and grew about 2.7x in nine months on templates, serverless and per-second billing. And they back **compute as a financial market**: SF Compute at $300M, Prime Intellect at $1B, and an a16z-backed $33M seed for Ornn's commodity index ([Axios](https://www.axios.com/2026/07/06/ornn-gpu-compute-commodity)). Pure peer-to-peer supply has raised comparatively little. Vast.ai's disclosed funding is a $4M seed, and Salad's last round was in 2022.

That pattern means datacenter-block trading is crowded and expensive to enter, while small hosts and prosumers are under-capitalized. No platform yet combines Vast-style open host onboarding, a Salad-style managed batch abstraction, and a strong trust tier.

The crypto networks look large in their marketing and small in their audited numbers.

| Network | Model | Best verifiable paid demand | Subsidy and supply signal | Trust approach |
|---|---|---|---|---|
| **Aethir** | Enterprise GPU cloud (AI, gaming), H100–B300 | **$74.9M** trailing 12 months onchain. Monthly fees fell from $12.5M (September 2025) to **$3.0M** (July 2026), paid by only **61 addresses** | About 20% protocol take. Token down 90%+. Raised $148M via node-license sale. Suppliers need at least $25K of capital | CPU-only "checker nodes"; off-chain metrics unverified |
| **io.net** | Solana GPU aggregator and cloud | About $1M/month (self-reported, May 2026) | About 1,560 active devices vs 30K–320K advertised. Client purchases equal **2.6% of supplier payouts**. Token down about 98% | Stake 200 IO per chip, 12-hour stress test. In 2024, 1.8M fake GPUs farmed rewards |
| **Akash** | Reverse-auction container marketplace | **$253K** lease revenue, Q1 2026 (down 45% QoQ) | On average 84 GPUs in use out of 334. The treasury spent about **$2.1M** in the same quarter, including leasing H100s/H200s | Permissionless providers |
| **Render** | 3D rendering, moving into AI | About $232K job fees (September 2026) | About 490K RENDER/month emitted vs 45–63K burned. First negative GPU supply growth since 2018 | n/a |
| **Bittensor (Chutes, Targon)** | Subnet inference APIs | Chutes $1.3–2.4M external revenue. Targon $5.5–10.4M ARR | Chutes subsidy-to-revenue ratio **22–40x** | Validator scoring; private miner code |
| **Nosana** | Solana inference marketplace | About $3.4M ARR (third-party estimate) | About 2,800 verified GPUs | n/a |
| **Golem** | Oldest P2P network (2016), GLM token | Not quantified; one aggregator lists an RTX 3090 from about $0.10/hr | Modest provider base; a pilot with Salad in January 2026 | Security fixes in 2026 |

Sources: [ownyourmind.ai on Aethir](https://ownyourmind.ai/projects/aethir/), [ownyourmind.ai on io.net](https://ownyourmind.ai/projects/io-net/), [Messari/Blockworks State of Akash Q1 2026](https://app.blockworks.com/report/state-of-akash-q1-2026-final), [CoinStats on Render](https://coinstats.app/ai/a/investment-analysis-render-token), [CryptoBriefing on Render supply](https://cryptobriefing.com/render-network-negative-gpu-supply-2026/), [ownyourmind.ai on Chutes](https://ownyourmind.ai/tokenomics/chutes-bittensor-revenue-machine/), [CryptoBriefing on Bittensor subnets](https://cryptobriefing.com/bittensor-subnets-annualized-revenue/), [depin.builders on Nosana](https://depin.builders/projects/nosana), [computestacker on Golem](https://computestacker.com/providers/golem-network/), [ownyourmind.ai on Golem](https://ownyourmind.ai/projects/golem/). The ownyourmind.ai figures come from a single independent reviewer that reconciles on-chain data. They are the most independent numbers available, but they are not institutional.

The DePIN evidence carries three lessons for a new entrant:

- **Token incentives attract registered supply but not buyers.** io.net's 2024 episode, in which 1.8M fake GPUs farmed rewards, happened because suppliers were paid for being online rather than for doing paid work.
- **Self-reported figures run 2–20x above independent measures.** Akash reportedly claimed about $5M of "compute spend" for Q1 2026 against $253K of onchain lease revenue ([cryptodaily](https://cryptodaily.co.uk/2026/06/akt-after-ai-rally-decentralized-compute-utilization)).
- **Even the leader's revenue depends on a few large customers.** Aethir earns real revenue, but it does so as a datacenter-GPU reseller that settles in a token, not as a household spare-compute network. Its fees still fell about 75% from peak, across 61 payers.

DePIN H100 prices of about $2.72–3.19/hr ([ComputePrices on Akash](https://computeprices.com/providers/akash/gpus/h100)) are now at or above specialist neoclouds. The 2024 pitch of "70–90% cheaper than AWS" only works against hyperscaler list prices.

## Buyers want marketplace prices with neocloud trust; sellers net tens of dollars

### Price-sensitive, interruption-tolerant buyers are the core demand

Cheap marketplace compute suits a specific set of buyers. ComputePrices finds marketplaces fit best for **fault-tolerant inference and batch jobs, rendering, and interactive development**, and fit poorly for training clusters ([ComputePrices](https://computeprices.com/blog/gpu-marketplaces-compared-vast-runpod-salad-shadeform-and-more)). In practice the buyers are:

- indie developers hosting open-weight LLMs
- students and academics with 1–8 GPU needs
- small teams running LoRA fine-tunes
- image and video generation pipelines
- batch embedding and transcription
- rendering

Cost dominates their decisions. Infrastructure cost is the top scaling challenge for **54%** of AI firms, and inference cost for 40% ([DataCentreNews](https://datacentrenews.uk/story/ai-firms-struggle-with-gpu-access-amid-rising-costs)).

Developers describe the trade-off in their own words. Hacker News users call Vast.ai "a good bet if you need something on demand and are willing to compromise on quality" ([HN](https://news.ycombinator.com/item?id=49459297)). One refused to "run our prod stuff on a rented vast.ai 5090" ([HN](https://news.ycombinator.com/item?id=49927159)). Others warn that "it's random people's machines" ([HN](https://news.ycombinator.com/item?id=50271827)), and that provisioning an instance and copying checkpoints "can take 25 minutes" ([HN](https://news.ycombinator.com/item?id=49514003)).

The pattern behind these complaints is consistent. Buyers choose first on price, then on immediate availability with no contract, then on fast spin-up. They leave because of flaky hosts, slow data transfer, privacy worries and erratic prices. Enterprise production work and multi-node training fall outside the long tail unless a platform offers verified tiers, SLAs and clustered nodes.

CPU-only demand is much weaker. None of the sources documents meaningful demand for marketplace CPU compute. Salad prices CPU at **$0.005 per vCPU-hour** ([Salad](https://salad.com/pricing)), and Akash averaged only 2,420 vCPUs in use against 11,690 of capacity in Q1 2026 ([Messari/Blockworks](https://app.blockworks.com/report/state-of-akash-q1-2026-final)). A CPU-first marketplace would be building on demand nobody has shown exists.

### Most usable supply comes from semi-pro operators, not gamers

Gamers are the largest group of potential sellers but contribute the least reliable capacity. Vast.ai counts of about 17–22K GPUs from 1,400–4,500 hosts imply roughly **5–12 GPUs per host**, which points to multi-GPU rigs and small datacenters ([Fast.io](https://fast.io/resources/vast-ai-review-2026/); [ClusterBid](https://clusterbid.com/blog/vast-ai-gpu-marketplace-deep-dive-decentralized-pricing-reliability)). Vast also steers demand toward its Certified Data Center Partners ([Vast.ai](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai)).

Old mining hardware is a weak supply source. One firm estimates only **5–15% of crypto-mining GPUs** can be repurposed for AI ([Bitpro](https://bitproit.com/gpu-miners-pivot-ai/)). Large ex-miners such as CoreWeave and Core Scientific monetized their power and sites, not their old cards ([Cybernews](https://cybernews.com/ai-news/how-crypto-miners-are-reinventing-themselves-as-ai-inference-providers/)). A new supply source is emerging as 2023–24 H100 reservations expire: Compute Exchange opened a secondary market for older GPUs in July 2026 ([StartupHub.ai](https://www.startuphub.ai/ai-news/technology/2026/compute-exchange-wants-gpus-to-trade-like-stocks)).

Host earnings are small, and occupancy splits sharply between verified and unverified hosts. One operator reported a verified RTX 4090 earning about **$6/day**, while an unverified 4090 at the same price earned **about $0.05/day** ([Endless Mining](https://endlessmining.com/us/blog/renting-your-gpu-for-ai-2026)). New hosts earn 30–40% of their steady-state income in the first month.

A log from an 8-GPU host on Vast.ai shows what hosting looks like day to day ([Aura Digital](https://auradigitalglobal.com/blog/vast-ai-gpu-server-earnings/)):

- 17 of 23 sampled rentals lasted under an hour.
- Payouts were held for review three times, for 8–12 days each.
- One memory fault dropped the host's reliability score from 99.8% to 96.7%.

Salad, the gamer-focused platform, admits its hosts see sporadic earnings ([Salad support](https://support.salad.com/faq/jobs/why-is-my-earning-rate-sporadic-random)). One owner reports about **$2.87/day** net for a 24/7 RTX 4090 ([CloudEarn](https://www.cloudearn.net/salad/)).

The research team modeled monthly net earnings for a single card. The inputs are October 2026 all-provider median renter prices, a 75% host share, US power at 18.2¢/kWh ([EIA](https://www.eia.gov/outlooks/steo/report/elec_coal_renew.php)), and EU household power at about €0.28/kWh, roughly $0.32 ([Brussels Times on Eurostat](https://www.brusselstimes.com/2384846/eu-electricity-prices-ease-in-2026-but-remain-elevated-after-energy-crisis)). The figures exclude depreciation:

| Card (host rate) | 25% occupancy, US / EU | 50% occupancy, US / EU | 80% occupancy, US / EU |
|---|---|---|---|
| RTX 3090 ($0.165/hr) | $5 / −$14 | $24 / −$4 | $46 / $8 |
| RTX 4090 ($0.33/hr) | $30 / $8 | $74 / $39 | $126 / $76 |
| RTX 5090 ($0.525/hr) | $61 / $35 | $135 / $92 | $224 / $162 |

Larger operators do better per card, but they need high occupancy:

- An **8x RTX 5090 server** on Vast.ai nets about $2,424 a month at 100% utilization, $1,406 at 60% and $643 at 30% ([Aura Digital](https://auradigitalglobal.com/blog/vast-ai-gpu-server-earnings/)).
- A used H100 bought for about $14K and rented at marketplace rates pays back in about **22–35 months** at 60–80% utilization. This is an illustrative calculation using ColoPrice's colocation rate of $196/kW-month ([ColoPrice](https://coloprice.com/guides/h100-rental-prices/)).

For sellers, hardware matters less than three conditions: being verified, paying under about $0.15/kWh for power, and owning newer cards with more VRAM. A seller's pitch built on "earn passive income from your gaming PC" overpromises in Europe and underdelivers almost everywhere.

## Five risks decide whether a marketplace survives

### Price swings flow straight through to a percentage take

A marketplace that takes a percentage of transaction volume earns less every time GPU prices fall. H100 prices have already fallen about 80% once, from about $8 to $1.70, before rebounding. Neocloud gross margins are estimated at only **14–16% after depreciation**, falling to zero below about 80% utilization ([Compute Forecast](https://www.computeforecast.com/long-reads/neocloud-unit-economics-margin-problem-gpu-infrastructure/)).

For a commission marketplace, the projected 2027–28 decline to $1–1.50 per H100-hour, and proportionally lower consumer-card rates, would shrink revenue per hour by half or more. Raw GPU-hours are also easy to leave: buyers use several platforms at once and chase the cheapest listing. Pricing per job and building workflow features both reduce this exposure.

### Trust is the product, and verification is still mostly reputation

No cheap, general-purpose proof exists that a host performed arbitrary GPU work correctly. The tools that work today are:

- benchmarking and hardware fingerprinting when a host joins
- uptime-based reliability scores
- canary jobs with known answers, plus redundant execution of a sample of work
- for LLM inference, **TOPLOC** activation hashing from Prime Intellect. It stores about 258 bytes per 32 tokens and validates up to 100x faster than the original inference ([arXiv 2501.16007](https://arxiv.org/html/2501.16007v1)).

Gensyn's Verde protocol can verify training, but it requires bitwise-reproducible kernels ([Gensyn](https://blog.gensyn.ai/verde-a-verification-system-for-machine-learning-over-untrusted-nodes/)), which is beyond what a solo founder can build. Hardware confidential computing on H100s adds **under 9% overhead** for LLM inference ([arXiv 2409.03992](https://arxiv.org/html/2409.03992v3)), but consumer cards lack it. A community host with root access can therefore read buyer data in principle. RunPod tells customers to keep regulated data off its Community Cloud ([RunPod](https://www.runpod.io/articles/guides/keep-data-secure-cloud-gpus)).

Batch workloads with deterministic or checkable outputs, such as rendered frames, embeddings and transcripts, are the easiest to verify by re-running a sample. That makes them the natural first market.

### Untrusted code on someone else's GPU is the hardest engineering problem

The standard hobbyist setup of Docker plus the NVIDIA Container Toolkit has had a **host-root escape triggered by a three-line Dockerfile**: NVIDIAScape, CVE-2025-23266, rated CVSS 9.0 ([Wiz](https://wiz.io/blog/nvidia-ai-vulnerability-cve-2025-23266-nvidiascape)). GPUHammer showed Rowhammer bit flips on a GDDR6 NVIDIA card, where a single flip cut model accuracy by 56–80% ([arXiv 2507.08166](https://arxiv.org/html/2507.08166v1)). LeftoverLocals leaked LLM responses between processes on AMD, Apple and Qualcomm GPUs; NVIDIA was not affected ([Trail of Bits](https://blog.trailofbits.com/2024/01/16/leftoverlocals-listening-to-llm-responses-through-leaked-gpu-local-memory/)). Both GPU attacks require two tenants on the same GPU.

Salad isolates workloads with a Hyper-V VM on the Windows host plus intrusion detection ([Salad](https://salad.com/enterprise)). The safe pattern is a VM boundary with GPU passthrough, one buyer per GPU, and automatic toolkit patching.

Abuse starts on day one. One crypto-mining campaign created **130,000+ fake accounts** with stolen cards to farm free cloud trials ([CSO Online](https://www.csoonline.com/article/3684749/attackers-create-130k-fake-accounts-to-abuse-limited-time-cloud-computing-resources.html)). The standard defenses are card and identity verification before any GPU access, no anonymous free tier, mining detection, and egress controls. Egress matters because the host's residential IP takes the blame when a buyer misuses it.

### Payouts are solved by Stripe Connect; EU VAT and export controls are the traps

Stripe Connect handles seller identity checks and 1099 filing, and lets the platform operate under Stripe's money-transmitter licenses instead of holding seller funds itself ([Stripe](https://stripe.com/resources/more/how-platforms-manage-seller-compliance)). US reporting got lighter in 2025–26. The 1099-K threshold went back to **$20,000 and 200 transactions**, and the 1099-NEC threshold rises to **$2,000 for 2026** ([Stripe Support](https://support.stripe.com/express/questions/whats-new-for-the-2026-tax-season)). Most hobby hosts will never trigger a federal form.

EU DAC7 platform reporting covers property rental, personal services, sales of goods and transport rental, which most likely excludes passive GPU rental ([RSM](https://www.rsm.global/poland/en/insights/tax/DAC7-relevant-activities)). No authority has ruled on compute rental specifically.

EU VAT is the bigger issue. Under Article 9a of the VAT Implementing Regulation, a platform facilitating electronically supplied services is **presumed to be the supplier** and owes VAT on the full amount. The EU Court of Justice upheld this rule in the OnlyFans case, *Fenix* ([BDO](https://www.bdo.global/en-gb/insights/tax/indirect-tax/european-union-cjeu-holds-online-platform-operator-liable-for-vat-collected-from-customers)). Selling only to businesses at launch avoids most of this problem. US sales tax on infrastructure-as-a-service varies by state ([Sovos](https://sovos.com/blog/sut/cloud-computing-part-4-cloudy-chance-sales-tax-overview-state-tax-schemes-applied-cloud-based-transactions)).

Export controls are the tail risk. The AI Diffusion Rule was rescinded in May 2025 with no replacement, but the 2022–23 controls on advanced chips still apply. BIS guidance flags cloud customers who cannot confirm their users are not headquartered in China ([Akin Gump](https://www.akingump.com/en/insights/alerts/bis-rescinds-its-ai-diffusion-rule-and-issues-compliance-guidance-regarding-advanced-computing-items); [Wiley](https://www.wiley.law/alert-BIS-Rescinds-AI-Diffusion-Rule)). A proposed 2024 "know your customer" rule for US cloud providers and their foreign resellers has still not been finalized ([Skadden](https://www.skadden.com/insights/publications/2024/02/know-your-iaas-customer); [Vove ID](https://blog.voveid.com/kyc-for-cloud-and-ai-providers-what-the-us-iaas-rule-means-for-llm-gateways/)). Any platform that lists H100-class hardware needs buyer identity checks and sanctions screening.

NVIDIA's consumer GeForce driver license has banned "datacenter deployment" since 2017, without defining the term ([DCD](https://www.datacenterdynamics.com/en/news/nvidia-updates-geforce-eula-to-prohibit-data-center-use/)). That creates some exposure if the platform recruits small datacenters running racks of 4090s.

### Tokens add risk without adding buyers

Nearly every compute token is down 85–98% from its peak. io.net is down about 98% and Gensyn about 83% within six months of launch ([ownyourmind.ai](https://ownyourmind.ai/projects/io-net/); [yellow.com](https://yellow.com/news/gensyn-ai-token-42-percent)). Suppliers paid in tokens absorb those drawdowns, which helps explain why Akash's GPU capacity fell 57.5% in a single quarter.

io.net now pegs supplier payouts to a stable USD value ([CoinDesk PR](https://www.coindesk.com/press-release/2026/06/11/io-net-to-burn-up-to-12m-tokens-as-network-closes-usd8m-deal-and-hits-4-billion-daily-ai-tokens)), which amounts to admitting that token pay failed to keep suppliers. A token would add securities risk, attract speculative supply, and still leave the platform without buyers.

## Recommendations: launch a verified batch-job service, demand first

The evidence points to one product for a solo builder: **outcomes, not hardware**. Buyers pay per job, per audio-hour, per million embeddings or per rendered frame, and the platform decides which verified GPU runs the work. This approach is the right fit for four reasons:

- Batch work tolerates interruptions, so unreliable hosts become a scheduling problem rather than a customer-facing failure.
- Outputs can be checked by re-running a sample, so verification is cheap.
- Buyers do not compare a job price against Vast.ai's $0.30 4090 listing, so the platform can capture the trust spread.
- It routes buyer workloads onto exactly the 24–32GB consumer cards where marketplaces hold the price advantage.

The main competitors are Salad, which offers batch containers and a transcription API, and the serverless inference APIs. Salad gives buyers containers and priority tiers, but leaves verification, retries and result guarantees to them.

| Priority | What to build | Why the evidence supports it | First proof point |
|---|---|---|---|
| **1. Start here** | A batch-job API for 2–3 workloads on open-weight models that fit in 24–32GB: Whisper-class transcription, embeddings, SDXL/Flux image generation and captioning, and 7–14B LLM batch inference over datasets. Fixed per-job price card, built-in queue, retries, sample re-runs and canary checks | Interruption-tolerant, easy to verify, consumer GPUs dominate the cheapest listings, inference is now about two-thirds of compute, and buyers want stable prices instead of "prices all over the place" | 10 paying business customers and repeat usage within 90 days, at prices clearly below what they pay for the same jobs on hosted APIs or secure-tier GPUs |
| **2. Next** | A "sell your gaps" host agent for small organizations (AI startups, labs, render studios, 4–64 GPUs), with business verification, fiat payouts and preemption so the owner's own jobs always win | Higher-trust supply with datacenter-grade cards, growing idle capacity as reservations expire, and the long tail is under-capitalized after RunPod and TensorDock pulled back | 3–5 organizational hosts supplying most job-hours at 99%+ job success |
| **3. Later, if buyers ask** | An EU-only, EU-incorporated tier with residency guarantees and data processing agreements, or a confidential-compute tier on H100-class hosts with attestation | Regulated buyers will pay for residency or attestation, but sales cycles are long and supply must be vetted | Signed letters of intent before building |
| **4. Opportunistic** | A pay-per-hour "verified pod" tier for interactive development, priced between Vast.ai community and RunPod Secure | Captures part of the 2–4x trust spread, but competes directly with well-funded incumbents on their home ground | Only after the job business shows retention |

Start on the demand side and fake the supply side at first. Before recruiting any hosts, run the first jobs on capacity rented wholesale from Vast.ai verified hosts, Salad or RunPod Community, after checking each provider's terms on resale. Use that period to learn which workloads buyers actually pay for and what margin they leave. The DePIN record shows that 100,000+ registered GPUs can coexist with almost no revenue. Supply is easy to attract. Demand is the scarce side, and it should lead.

Recruit hosts only to serve proven demand. Choose semi-professional operators with multi-GPU rigs, power under $0.15/kWh and good uptime, not single gaming PCs. Offer them steadier income than Salad's "sporadic earnings" and a higher, published host rate than Vast.ai's roughly 75% share.

An illustrative model, not a sourced figure: pay verified 4090 hosts **$0.35–0.40 per hour of delivered work**, which is at or above Vast's implied host rate. Price jobs so they equate to about **$0.55–0.65 per GPU-hour**. That is still below RunPod Secure's $0.89 and far below the $1.73 secure-tier median. It leaves a gross margin of roughly 35–40% before retry and re-run overhead, against the 20–23% commissions of open marketplaces.

The empty Express project should become the control plane, not the place where compute runs:

- **API and queue.** A buyer-facing job API (OpenAI-compatible where it fits) and a Postgres-backed job queue.
- **Buyer billing.** Prepaid credits through Stripe Checkout, which also blocks the stolen-card free-trial abuse described above.
- **Host payouts.** Stripe Connect Express, so the platform never holds seller funds.
- **Host agent.** A separate host program (Go or Python) that pulls jobs over outbound HTTPS or WebSocket, so hosts do not have to open inbound ports as Vast.ai requires ([Vast docs](https://docs.vast.ai/documentation/host/hosting-overview)). It runs each job inside a VM with GPU passthrough, one buyer per GPU, wipes disks afterward and reports telemetry.
- **Host qualification.** A benchmark and hardware fingerprint when a host joins, plus a reliability score fed by canary jobs and sample re-runs.
- **Payout holds.** Host payouts held until each job is accepted, with clawback rights written into the host terms.

Launch business-only, with VAT-ID validation, sanctions screening and no anonymous free tier. Ship transcription or embeddings first, because their outputs are the easiest to verify and they involve the least sensitive data.

What to avoid matters as much as what to build:

| Avoid | Reason |
|---|---|
| A token, points-for-uptime or emissions | Tokens bootstrap fake and speculative supply and leave a subsidy cliff. Networks pay suppliers 4–40x more than buyers pay. |
| Competing on raw $/GPU-hour as a generic Vast.ai clone | 4090 time already sells for $0.16/hr. Switching costs are zero, and buyers use several platforms. |
| H100/B200 training clusters, compute exchanges, futures | They need InfiniBand clusters and heavy capital. SF Compute, Hyperbolic, Ornn and CME are already funded. |
| Open, anonymous onboarding of gaming PCs at scale | Unverified hosts earn about $0.05/day, gamer supply is Salad's territory, and the EU power math is negative for older cards. |
| Docker-only isolation or sharing one GPU across buyers | NVIDIAScape, GPUHammer and LeftoverLocals exploit exactly these setups. |
| Consumer (B2C) sales in the EU at launch | Article 9a makes the platform liable for VAT as the deemed supplier. |
| Anonymous buyers on datacenter-class GPUs | Export-control red flags and a possible future customer-identification rule. |
| A CPU-only marketplace or agent-sandbox hosting as the first product | No evidence of CPU demand. Agent sandboxes are crowded (E2B, Modal, Vercel, Cloudflare) and highly exposed to abuse. |

## Conclusion

This research changes the question a builder should ask. Matching GPUs to buyers is already cheap, close to free, and Vast.ai and the DePIN networks show it does not produce a durable business by itself. The valuable step is turning untrusted, mixed hardware into results a buyer can rely on. The market prices that step at 2–4x the raw cost of compute. RunPod's growth to $325M ARR came from removing friction for developers. Aethir's revenue came from acting like a datacenter reseller. Neither came from the spare-compute story. A small team captures that same value at small scale by owning the job abstraction and the verification loop, not the hardware.

Timing adds pressure. The 2026 shortage makes host supply cheap to recruit and buyers unusually willing to try something new. The same CoWoS and Blackwell expansion that ends the shortage will cut GPU-hour prices, perhaps by half, in 2027–28. A product whose margin depends on scarcity will shrink when that happens. A product whose margin comes from verified outcomes, stable job pricing and buyer workflows will keep it. The next 12–18 months are the window to get paying customers into that workflow before cheap datacenter capacity returns.

Several things remain unknown and should be tested directly rather than assumed: the size of the peer-to-peer segment, Vast.ai's revenue, how marketplace GPU-hours split across workloads, and whether CPU or "green compute" niches have real demand. The quickest way to answer them is to put a price card in front of ten buyers before writing the host agent.

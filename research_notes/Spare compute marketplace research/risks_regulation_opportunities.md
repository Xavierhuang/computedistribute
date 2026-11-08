# Risks, Regulatory Obligations, Technical Trust Challenges, and Niche Opportunities for a Spare-Compute Marketplace

Research date: 2026-11-08. Scope: US and EU regulation; security/abuse; buyer privacy; verification of work; business risks; niches for a solo/small-team entrant. Many sources found were vendor blogs or secondary aggregators. Source quality is flagged inline where it matters.

---

## 1. Payouts & regulation (KYC, 1099s, DAC7, money transmission, sales tax/VAT, export controls, IaaS KYC)

### Takeaway
Payouts are manageable if you sit on Stripe Connect (or similar) and let it carry KYC, licensing and 1099 filing. The US 1099 regime got much lighter in 2025–2026: 1099-K is back to $20,000 and 200 transactions, and 1099-NEC/MISC goes to $2,000 for 2026. EU DAC7 probably does not cover pure compute rental, but that is unconfirmed. The two real regulatory traps are (a) EU VAT "deemed supplier" rules for electronically supplied services sold B2C through a platform and (b) US export-control exposure when advanced GPUs are rented to foreign or PRC-linked users. The AI Diffusion Rule was rescinded in May 2025 and still has no replacement as of late 2026. The IaaS KYC rule from January 2024 still appears to be only a proposal.

### Cited Findings

**US information reporting (1099-K / 1099-NEC)**
- The One Big Beautiful Bill Act (OBBBA, P.L. 119-21, signed July 2025) repealed the ARPA $600 Form 1099-K threshold and restored $20,000 **and** 200 transactions. The 1099-K threshold is **not** inflation-indexed. — [Avalara](https://www.avalara.com/us/en/blog/2025/07/one-big-beautiful-bill-act-1099-reporting-threshold); [CPA Practice Advisor](https://cpapracticeadvisor.com/2025/07/30/one-big-beautiful-bill-act-changes-1099-thresholds/165863/)
- The 1099-NEC/1099-MISC threshold rises from $600 to $2,000 for payments made in tax year 2026, first reported in the 2027 filing season, and is inflation-indexed from 2027. Tax year 2025 still uses $600. — [OnPay](https://onpay.com/insights/1099-reporting-threshold-updates/); [CPA Practice Advisor](https://cpapracticeadvisor.com/2025/07/30/one-big-beautiful-bill-act-changes-1099-thresholds/165863/)
- Stripe's own 2026 tax-season page confirms the 1099-K federal threshold "remains greater than 20,000 USD in total gross volume and 200 transactions" and that the 1099-NEC/MISC threshold rises to $2,000 in 2026. The page does not mention state thresholds. — [Stripe Support](https://support.stripe.com/express/questions/whats-new-for-the-2026-tax-season)
- Sources disagree on how far back the 1099-K reversion reaches (retroactive to 2021 vs. 2022 for unfiled forms). — [OnPay](https://onpay.com/insights/1099-reporting-threshold-updates/) vs. IRS webinar summaries quoted in the same search; unresolved.
- Reporting changes don't change tax liability. Sellers still owe tax on all income. — [CPA Practice Advisor](https://cpapracticeadvisor.com/2025/07/30/one-big-beautiful-bill-act-changes-1099-thresholds/165863/)

**KYC & money transmission (Stripe Connect)**
- Stripe says a platform that collects funds and distributes them to sellers "might be treated as a money transmitter in certain jurisdictions," which can bring licensing, reserve and reporting obligations. Connect is positioned as relying on Stripe's own licenses (US money transmitter licenses; EU e-money license). — [Stripe: Platform payment processing](https://stripe.com/resources/more/platform-payment-processing); [Stripe: Embedded payments for marketplaces](https://stripe.com/de/resources/more/embedded-payments-for-online-marketplaces)
- Connect collects and verifies seller identity (KYC for individuals, KYB for businesses) against government records, flags accounts it can't verify, rescreens connected accounts automatically, and prompts updates. Sellers must pass verification before payout. — [Stripe: How platforms manage seller compliance](https://stripe.com/resources/more/how-platforms-manage-seller-compliance)

**EU DAC7 (platform reporting)**
- DAC7 (Council Directive (EU) 2021/514) covers four "relevant activities": rental of immovable property, personal services, sale of goods, and rental of any mode of transport. — [Deloitte DK](https://www2.deloitte.com/dk/da/pages/tax/articles/dac7-is-your-business-under-scope.html); [RSM Poland](https://www.rsm.global/poland/en/insights/tax/DAC7-relevant-activities); [Belastingdienst](https://www.belastingdienst.nl/wps/wcm/connect/en/business/content/information-for-sellers-dac7)
- "Personal services" means time- or task-based work performed by one or more individuals at a user's request and facilitated by a platform. In mixed packages, only the personal-service portion is reportable. — [RSM Poland](https://www.rsm.global/poland/en/insights/tax/DAC7-relevant-activities); [BDO NL](https://www.bdo.nl/en-gb/insights/the-meaning-of-platform-under-dac7)
- No source directly addresses renting out computing hardware or compute time under DAC7. See Inferences and Gaps.

**EU VAT on compute sold through a platform**
- Under Article 9a of VAT Implementing Regulation 282/2011, an online platform that facilitates electronically supplied services is **presumed to be the supplier** ("deemed supplier"/undisclosed agent) and owes VAT on the full amount charged. The presumption is rebuttable, e.g. where the underlying supplier is explicitly identified as the supplier on the invoice and in the contractual arrangements. Pure payment processors are excluded. — [Simmons & Simmons](https://www.simmons-simmons.com/en/publications/cl84hpa2o683v0b97j9ml5riq/supplies-of-services-via-online-platforms); [legislation.gov.uk copy of Art. 9a](https://www.legislation.gov.uk/eur/2011/282/article/9a/data.htm)
- The CJEU upheld the validity of Article 9a in *Fenix International* (C-695/20, the OnlyFans case), holding the platform liable for VAT on the amounts collected. — [BDO Global](https://www.bdo.global/en-gb/insights/tax/indirect-tax/european-union-cjeu-holds-online-platform-operator-liable-for-vat-collected-from-customers); [Baker McKenzie](https://insightplus.bakermckenzie.com/bm/tax/european-union-the-court-of-justice-issues-judgment-on-validity-of-deemed-reseller-rules-for-online-platforms-facilitating-electronic-supplied-services)

**US sales tax on compute (IaaS)**
- IaaS taxability "varies dramatically by state." Examples: New Jersey treats IaaS as not an enumerated taxable service. Indiana says IaaS is not taxable unless the customer is renting or leasing equipment. New York ruled that providing access to computing power is a non-taxable service. Some states tax cloud computing as data processing. Economic nexus can create obligations without physical presence. — [Sovos](https://sovos.com/blog/sut/cloud-computing-part-4-cloudy-chance-sales-tax-overview-state-tax-schemes-applied-cloud-based-transactions); [Vertex SaaS tax guide](https://www.vertexinc.com/resources/resource-library/navigating-saas-tax-guide-software-and-cloud-sales-tax-rules); [Avalara cloud whitepaper](https://www.avalara.com/learn/whitepapers/navigating-the-cloud-a-sales-use-tax-guide/)
- Caveat: many of these state examples come from 2013–2016-era material. Current state rules need checking.

**US export controls: AI Diffusion Rule (status as of late 2026)**
- On May 13, 2025, BIS announced it would rescind the Biden-era AI Diffusion Rule and not enforce it. BIS said it would publish a regulation formalizing the rescission and issue a replacement "in the future." — [WilmerHale](https://www.wilmerhale.com/en/insights/client-alerts/20250515-us-export-controls-on-ai-diffusion-officially-paused-but-new-guidance-elevates-risk-for-ai-related-exports); [Freshfields](https://www.freshfields.com/en/our-thinking/blogs/a-fresh-take/bis-rescinds-ai-diffusion-rule-issues-notice-of-high-probability-enforcement-r-102kp9j); [Akin Gump](https://www.akingump.com/en/insights/alerts/bis-rescinds-its-ai-diffusion-rule-and-issues-compliance-guidance-regarding-advanced-computing-items)
- **Still pending:** Holland & Knight (June 2026) reports that no replacement rule has been issued. One secondary source says that as of 19 Oct 2026 BIS had announced no replacement. Another says that as of May 2026 the formal Federal Register removal had not been published, so the rule's text, including ECCN 4E091 on model weights, technically remains in the EAR. — [Holland & Knight, June 2026](https://www.hklaw.com/en/insights/publications/2026/06/bis-publishes-guidance-license-requirements-advanced-computing-items); [roctelecom (secondary)](https://roctelecom.com/insights/ai-diffusion-rule-itad/); [Export Practitioner](https://exportprac.com/stories/bis-moves-closer-to-replacing-ai-diffusion-rule-but-key-questions-remain,15424)
- Pre-existing advanced-computing controls (from 2022/2023) were **not** rescinded. They still require licenses to ship advanced chips to China, many Middle East countries, and entities headquartered in or parented by China. — [Akin Gump](https://www.akingump.com/en/insights/alerts/bis-rescinds-its-ai-diffusion-rule-and-issues-compliance-guidance-regarding-advanced-computing-items); [Freshfields](https://www.freshfields.com/en/our-thinking/blogs/a-fresh-take/bis-rescinds-ai-diffusion-rule-issues-notice-of-high-probability-enforcement-r-102kp9j)
- Alongside the rescission, BIS issued guidance including red flags relevant to IaaS. One red flag covers IaaS customers who cannot affirm that their users are not headquartered in the PRC. Practitioners warn that non-enforcement is not a safe harbor. — [Wiley](https://www.wiley.law/alert-BIS-Rescinds-AI-Diffusion-Rule); [A&O Shearman](https://www.aoshearman.com/en/insights/ai-diffusion-rule-rescinded-policy-guidance-for-advanced-integrated-circuits-and-commodities-issued); [WilmerHale](https://www.wilmerhale.com/en/insights/client-alerts/20250515-us-export-controls-on-ai-diffusion-officially-paused-but-new-guidance-elevates-risk-for-ai-related-exports)
- Some commentators note that with the Diffusion Rule gone, no US export control specifically restricts providing cloud compute via IaaS. Hardware-level controls and BIS red-flag guidance still apply. — [National Law Review](https://natlawreview.com/article/throwing-away-toaster-where-ai-controls-are-now-and-may-be-heading)

**US IaaS "Know Your Customer" rule (EO 13984 / EO 14110 lineage)**
- In January 2024 BIS proposed requiring US IaaS providers to keep a written Customer Identification Program (CIP), verify foreign customers, and ensure their **foreign resellers** maintain CIPs. The US provider would carry responsibility for reseller compliance. Compliance would be due within one year of a final rule. — [Skadden](https://www.skadden.com/insights/publications/2024/02/know-your-iaas-customer); [Arnold & Porter](https://www.arnoldporter.com/en/perspectives/advisories/2024/01/dept-of-commerce-proposes-rule-on-iaas-product-related); [Covington Inside Privacy](https://www.insideprivacy.com/uncategorized/department-of-commerce-issues-proposed-rule-to-regulate-infrastructure-as-a-service-providers-and-resellers/); [BIS press release](https://www.bis.gov/press-release/commerce-proposes-rule-advance-u.s.-national-security-interests-implement-biden-harris-administrations-ai)
- A vendor blog dated around May 2026 says the IaaS KYC rule **has not been finalized**. I found no Federal Register final rule or withdrawal. — [Vove ID blog (secondary)](https://blog.voveid.com/kyc-for-cloud-and-ai-providers-what-the-us-iaas-rule-means-for-llm-gateways/)
- The same blog reports a January 2026 BIS final rule on AI chip exports to China with KYC and remote-access conditions for case-by-case licensing. **Unverified**; I found no primary source. — [Vove ID blog](https://blog.voveid.com/kyc-for-cloud-and-ai-providers-what-the-us-iaas-rule-means-for-llm-gateways/)

### Inferences
- **Payout stack:** Stripe Connect Express/Custom (or Adyen for Platforms, Tipalti, etc.) is close to mandatory for a small team. It handles seller KYC and 1099-K/NEC issuance, and lets you lean on Stripe's MTL/EMI licenses. The platform should never hold seller funds in its own account.
- **1099 burden is light:** At $20k/200 transactions for 1099-K and $2,000 for 1099-NEC, most hobbyist hosts earning a few hundred dollars a month will trigger no federal 1099 at all. Some US states set lower 1099-K thresholds (not covered in sources). Collect W-9/TIN anyway, since onboarding can't know who will cross the threshold.
- **DAC7 is probably out of scope:** Renting GPU time is passive equipment/IT capacity, not "personal services," and not one of the other three categories. That points toward DAC7 not applying. However, national tax authorities have read "personal services" broadly, and a host who actively configures environments for buyers could arguably fall inside it. Get local advice before launching EU sellers.
- **EU VAT is the bigger EU trap:** If EU consumers or very small buyers purchase compute through the platform, Art. 9a likely makes the **platform** the deemed supplier, owing VAT at the buyer's member-state rate via OSS. B2B sales are generally reverse-charged. A B2B-only policy with VAT-ID validation is the simplest way to sidestep this, or the platform can accept being the merchant of record. Using a merchant-of-record provider (e.g., Paddle, Lemon Squeezy, Stripe Tax + MoR) is another route; the role of these providers is not covered in sources here.
- **Export controls are the existential tail risk** for anyone listing H100/H200/B200-class hardware. Combine a US-based marketplace, foreign hosts, and anonymous buyers, and you risk facilitating PRC-linked access to controlled compute. Minimum hygiene: buyer KYC tied to country and entity, sanctions/Entity List screening, and blocking sanctioned and PRC-headquartered buyers for high-end GPUs. Consumer GPUs (RTX 30/40/50 series) are less exposed, but BIS has controlled some high-end consumer parts (e.g., the RTX 4090 for China). That point is not verified in these sources.
- If the IaaS KYC rule is ever finalized, a marketplace reselling US compute to foreign buyers would likely count as either a US IaaS provider or a foreign reseller. Building buyer KYC now is cheap insurance.

### Gaps
- Exact state-level 1099-K thresholds (e.g., MA, MD, VT, IL historically lower) for 2025–2026: not researched.
- Whether FinCEN's "payment processor" or "agent of payee" exemptions cover a compute marketplace using Connect: I found no legal source. Stripe's own materials only say platforms "might" be money transmitters.
- No authoritative ruling on whether GPU-time rental is "personal services" under DAC7, or whether any member state has addressed compute marketplaces.
- No primary confirmation (Federal Register) of the IaaS KYC rule's current status, or of the reported January 2026 BIS China chip rule.
- No current (2025–2026) state-by-state IaaS sales-tax survey from a primary source.
- Whether the EU AI Act creates obligations for a compute marketplace (likely minimal, since it isn't a model provider): not researched.

---

## 2. Security & abuse (host risk from untrusted code, abuse vectors, isolation tech, incidents)

### Takeaway
Running untrusted GPU workloads on someone else's machine is the hardest technical problem in this business. Plain Docker plus NVIDIA Container Toolkit has had a critical "three-line Dockerfile" escape to host root (NVIDIAScape, CVE-2025-23266, CVSS 9.0, July 2025). GPU memory is vulnerable to Rowhammer (GPUHammer, 2025), and some GPUs leaked memory across processes (LeftoverLocals). The safest pattern is a VM boundary: a microVM (Firecracker/Kata) or full hypervisor VM with GPU passthrough, one tenant per GPU, and no time-slicing across buyers. On the abuse side, crypto-mining and stolen-card fraud are well documented and will arrive on day one.

### Cited Findings

**Container escape / host compromise**
- **NVIDIAScape (CVE-2025-23266, CVSS 9.0):** Wiz found a container escape in NVIDIA Container Toolkit. A "stunningly simple three-line Dockerfile" loads an attacker's shared object into a privileged process (via OCI hooks), giving full root on the host. In multi-tenant settings a malicious customer can take over the host. Fixed in Container Toolkit 1.17.8 and GPU Operator 25.3.1. Reported to NVIDIA May 17, 2025; bulletin published July 15, 2025. — [Wiz Research](https://wiz.io/blog/nvidia-ai-vulnerability-cve-2025-23266-nvidiascape); [The Hacker News](https://thehackernews.com/2025/07/critical-nvidia-container-toolkit-flaw.html)

**GPU side channels / memory attacks**
- **GPUHammer (2025):** The first Rowhammer exploit on a discrete NVIDIA GPU (A6000 with GDDR6). One bit flip degraded model accuracy by 56–80%. It needs only user-level CUDA privileges and targets setups where attacker and victim share a physical GPU. The suggested mitigation is enabling ECC, at a performance and memory cost. — [arXiv 2507.08166](https://arxiv.org/html/2507.08166v1); [SecurityBrief Asia](https://securitybrief.asia/story/gpuhammer-attack-exposes-new-risks-for-ai-and-cloud-computing)
- Follow-up research reportedly presented at IEEE S&P 2026 (GeForge, GDDRHammer, GPUBreach) extends GPU Rowhammer toward host takeover. **Unverified**: secondary sources only. — [devtake (secondary)](https://devtake.pages.dev/article/gpuhammer-rowhammer-nvidia-attack)
- **LeftoverLocals (CVE-2023-4969, Trail of Bits, Jan 2024):** GPU local memory isn't cleared between kernels, so a co-resident process can read another user's leftovers. Researchers reconstructed another user's llama.cpp chat. About 5.5 MB leaks per invocation on an AMD RX 7900 XT, about 181 MB per 7B-model query. Affected: Apple, AMD, Qualcomm, some Imagination. NVIDIA, Arm and Intel were confirmed **not** affected. Mitigation: don't share GPUs across tenants, or zero local memory. — [Trail of Bits](https://blog.trailofbits.com/2024/01/16/leftoverlocals-listening-to-llm-responses-through-leaked-gpu-local-memory/)

**Isolation technologies in use**
- **Modal** uses gVisor-based containers. **E2B** uses Firecracker microVMs. — [Morph comparison](https://www.morphllm.com/comparisons/e2b-vs-modal); [Modal: best code execution sandboxes](https://modal.com/resources/best-code-execution-sandboxes-ai-agents)
- **SaladCloud** (consumer GPUs from gamers) runs workloads in a Linux VM partitioned from the Windows host by **Hyper-V**, with an OCI container inside. Salad says this protects both directions. Host intrusion detection watches for unauthorized folder access, shell attempts, or host attempts to access the container. Salad reports a SOC 2 audit (Type I per one listing). — [Salad Enterprise](https://salad.com/enterprise); [similarlabs listing](https://similarlabs.com/p/saladcloud)
- **Vast.ai** says every workload runs in an unprivileged Docker container isolated from other tenants. It claims "a clean security record since launch in 2018 with no major incidents" and says it is completing SOC 2 Type 1 (self-reported). — [Vast.ai: Security and Compliance](https://vast.ai/article/security-and-compliance-at-vast-ai); [Vast.ai Compliance](https://vast.ai/compliance)
- **RunPod** separates Community Cloud (third-party hosts) from Secure Cloud, where "your GPU and its host are single-tenant" in vetted data centers. It recommends dedicated instances for sensitive or regulated data. — [RunPod guide](https://www.runpod.io/articles/guides/keep-data-secure-cloud-gpus)
- **NVIDIA confidential computing (H100):** A benchmark study found under 9% average overhead on LLM inference with TEE mode on. Overhead approaches zero for large models (e.g., Llama-3.1-70B) and is highest for small models and short requests (Llama-3.1-8B). The cost comes mainly from encrypted CPU↔GPU PCIe transfers, not GPU compute. — [arXiv 2409.03992 (Phala)](https://arxiv.org/html/2409.03992v3)

**Abuse vectors**
- **Crypto-mining via fraud:** Unit 42's "Automated Libra" campaign created over 130,000 fake accounts on GitHub, Heroku and similar platforms, using stolen or fake cards to activate time-limited trials for mining. Unpaid balances indicated fraudulent cards. — [CSO Online](https://www.csoonline.com/article/3684749/attackers-create-130k-fake-accounts-to-abuse-limited-time-cloud-computing-resources.html); [Computer Weekly](https://computerweekly.com/news/252528904/Cyber-gang-abused-free-trials-to-exploit-public-cloud-CPU-resource)
- Sysdig documented attackers launching GPU instances on Google Vertex AI and mining until trial credits ran out ("freejacking"). — [Cloud Security Alliance / Sysdig](https://cloudsecurityalliance.org/articles/google-s-vertex-ai-platform-gets-freejacked)
- Microsoft notes the NVIDIA T4, V100 and A100 GPU options are "most abused by threat actors" for cryptojacking. — [Cybersecurity News citing Microsoft](https://cybersecuritynews.com/cryptojacking-attack-patterns-checklist-for-administrators-and-security-professionals-microsoft/)
- Countermeasures in use: requiring a valid card even for free tiers (GitLab, May 2021) and $1 authorization holds (Travis CI). — [Travis CI](https://www.travis-ci.com/blog/2021-10-20-mining/); [The Record](https://therecord.media/crypto-mining-gangs-are-running-amok-on-free-cloud-computing-platforms/)

**Known incidents at marketplaces**
- I found **no** publicly reported breach or host-compromise incident at Vast.ai, RunPod or Salad. Vast.ai says it has had none. User complaints focus on reliability and the fact that "your data is entirely at the mercy of whoever hosts the machine." — [Vast.ai](https://vast.ai/article/security-and-compliance-at-vast-ai); [Trustpilot reviews of Vast.ai](https://www.trustpilot.com/review/vast.ai)

### Inferences
- The default "Docker + nvidia-container-toolkit" stack many hobbyist marketplaces use has shown a host-root escape. A new marketplace should run each buyer job in a **VM with VFIO GPU passthrough** (Kata Containers, Firecracker with GPU support, Cloud Hypervisor, or Hyper-V/WSL-style like Salad), patch toolkits automatically, and **never time-slice one GPU across buyers** (MIG for data-center parts is the exception). This protects hosts from buyers and buyers from each other (GPUHammer and LeftoverLocals both need co-residency).
- Firecracker's GPU passthrough support has historically been limited, so GPU workloads usually use QEMU/Cloud Hypervisor-backed Kata. Not verified in these sources.
- **Abuse policy priorities for launch:** (1) block or detect mining (process and hash signatures, power and utilization profiles, pool-domain egress blocking); (2) require card plus identity before GPU access, with no anonymous free trials; (3) rate-limit and filter egress to stop DDoS, spam and scanning, since the host's residential IP takes the blame; (4) ToS bans on password cracking, CSAM and illegal content, plus a takedown/report channel. Hosts on residential ISPs face ISP termination and legal exposure if buyers misuse their IP. That is a host-side risk the platform must absorb through egress proxies or tunnels.
- CSAM / illegal content: US providers have NCMEC reporting duties (18 U.S.C. 2258A) once they know of it. Not researched here. A marketplace hosting image-generation workloads should plan for this.

### Gaps
- No public incident write-ups for Vast/RunPod/Salad/io.net. Absence may reflect non-disclosure rather than no incidents.
- Kata Containers and Firecracker GPU passthrough maturity and overhead were not sourced.
- Blackwell confidential computing / TEE-IO capabilities and multi-GPU CC were not covered by sources found.
- Primary sources for the IEEE S&P 2026 GPU Rowhammer follow-ups were not verified.
- Data on GPU-rental chargeback rates and fraud losses at marketplaces: none found.
- CSAM/NCMEC obligations and EU DSA obligations for compute intermediaries: not researched.

---

## 3. Buyer data privacy on untrusted hosts

### Takeaway
On a normal community host, the host owner can in principle see everything: disk, RAM, GPU memory, model weights, prompts and outputs. Root on the host defeats container and VM isolation in the host→guest direction. The only strong technical fix is hardware confidential computing (AMD SEV-SNP or Intel TDX CPU TEE plus H100/Blackwell GPU CC with attestation). That hardware is data-center-class and essentially absent from consumer and hobbyist supply. In practice, marketplaces split into "trusted/secure tier" vs. "community tier" and tell buyers not to put sensitive data on the latter.

### Cited Findings
- RunPod tells customers to use Secure Cloud or dedicated instances for "highly sensitive or regulated data" rather than Community Cloud. — [RunPod](https://www.runpod.io/articles/guides/keep-data-secure-cloud-gpus)
- A Vast.ai user review: "your data is entirely at the mercy of whoever hosts the machine." — [Trustpilot](https://www.trustpilot.com/review/vast.ai)
- Salad positions its Hyper-V VM plus host intrusion detection (flagging host attempts to access the container) as protecting the buyer from the host. This is a vendor claim. A third-party summary notes security architecture details for isolating workloads on consumer PCs "are not fully detailed." — [Salad](https://salad.com/enterprise); [Toolradar](https://toolradar.com/tools/saladcloud)
- H100 confidential computing encrypts CPU↔GPU traffic and keeps data protected in GPU memory, with under 9% average LLM inference overhead and near-zero overhead for large models. — [arXiv 2409.03992](https://arxiv.org/html/2409.03992v3)
- The US CLOUD Act can compel a US-incorporated company to disclose data regardless of server location, which matters for EU buyers choosing providers. — [Lyceum: EU data residency](https://lyceum.technology/magazine/eu-data-residency-ai-infrastructure/)

### Inferences
- Realistic mitigations for a small marketplace, from strongest to weakest:
  1. **Confidential-compute tier**: only hosts with H100/H200/B200 plus SEV-SNP/TDX and remote attestation. This is verifiable but limits supply to data centers and serious operators.
  2. **Vetted-host tier**: KYB'd data centers or universities under contract (DPA, liability), similar to RunPod Secure Cloud.
  3. **Community tier**: only for public data and public or open-weight models, encrypted volumes with keys released at runtime (which still doesn't stop a root-level host), ephemeral disks wiped after jobs, and no persistent credentials in the container.
  4. **Workload design**: route only non-sensitive jobs (rendering, public-dataset batch inference, open-model fine-tunes on public data) to untrusted hosts.
- Privacy is also a selling point. "We only route your job to attested CC hardware" or "EU-incorporated, EU-hosted only" can be the product for regulated buyers.

### Gaps
- No sources on practical attestation flows (NVIDIA NRAS / Remote Attestation Service) or on how many independent hosts have CC-capable hardware.
- No research on encrypted model-weight loading or obfuscation schemes for untrusted hosts.
- GDPR controller/processor allocation in a three-party marketplace (buyer = controller, platform and host = processor/sub-processor?) was not researched.

---

## 4. Verification of work (proving compute was done correctly)

### Takeaway
No cheap, general-purpose proof that arbitrary GPU work was done correctly exists. Practical options, from cheapest to most rigorous: benchmarking and hardware fingerprinting at onboarding; reputation plus spot checks / redundant execution; activation-hash schemes for LLM inference (Prime Intellect's TOPLOC); optimistic dispute resolution with deterministic ops for training (Gensyn's Verde + RepOps); and TEE attestation. zkML remains far too expensive for anything but tiny models (not verified with a source here). The supply-fraud problem (spoofed GPUs) is real in the token-incentivized networks.

### Cited Findings
- **TOPLOC (Prime Intellect):** A locality-sensitive hash over intermediate activations detects unauthorized changes to model, prompt or precision during LLM inference. Storage is about 258 bytes per 32 tokens vs. 262 KB for raw embeddings. Validation is reportedly up to 100x faster than the original inference, works across GPU types and implementations, and needs no cryptographic proofs. The authors report no false positives or negatives in their tests (self-reported). — [arXiv 2501.16007](https://arxiv.org/html/2501.16007v1); [toploc on PyPI](https://pypi.org/project/toploc/0.0.1/)
- **Verde (Gensyn):** An optimistic dispute protocol for ML training and inference on untrusted nodes. When a trainer and verifier disagree, it bisects to the first disputed training step or operator and a referee re-runs only that. Correctness holds if at least one verifier is honest. It depends on **RepOps**, a library making ML ops bitwise-reproducible across hardware. Without it, honest nodes on different GPUs produce different outputs. — [Gensyn blog](https://blog.gensyn.ai/verde-a-verification-system-for-machine-learning-over-untrusted-nodes/); [Gensyn research](https://www.gensyn.ai/research/verde-a-verification-system-for-machine-learning-over-untrusted-nodes)
- **Benchmarking and reputation in practice:** On Vast.ai, hosts with reliability scores of 95%+ command 2–3x the price of unreliable ones. Per-host thermal metrics are visible, and the same GPU model performs differently across hosts. — [ClusterBid deep-dive on Vast.ai](https://clusterbid.com/blog/vast-ai-gpu-marketplace-deep-dive-decentralized-pricing-reliability); [Spheron](https://www.spheron.network/blog/vastai-alternatives/)
- **TEE attestation** with H100 CC is practical for large-model inference at under 9% overhead (see section 3). — [arXiv 2409.03992](https://arxiv.org/html/2409.03992v3)
- A secondary source alleges a "GPU-spoofing scandal" at io.net (fake GPUs listed to farm token rewards). **Unverified**; I found no reputable primary reporting. — [BlockEden (secondary)](https://blockeden.xyz/blog/2026/03/12/depin-compute-revenue-pivot-akash-ionet-aethir/)

### Inferences
- For a small entrant, practical verification looks like this:
  - **Onboarding:** run a known benchmark and check `nvidia-smi`, PCIe and driver fingerprints plus memory-bandwidth and TFLOPS signatures to catch spoofed or virtualized GPUs. Re-test periodically.
  - **Runtime:** heartbeat and utilization telemetry from a platform-controlled agent. Canary jobs with known outputs mixed into real work. Duplicate a small percentage of batch-inference items on a second host and compare. For LLM inference, adopt TOPLOC-style activation hashing (open-source).
  - **Economic:** escrow host payouts until job acceptance, plus reputation scores and slashing/clawback rights in the host ToS. No token needed.
- Batch, deterministic or embarrassingly parallel workloads (rendering frames, batch embeddings, transcription) are the easiest to verify by redundancy. That makes them attractive first verticals.
- Verde-style training verification needs deterministic kernels, which cost performance and engineering effort. It isn't realistic for a solo founder.

### Gaps
- No sources gathered on zkML cost and performance (EZKL, Modulus, etc.) or proof-of-learning (Jia et al. 2021) attacks. These should be marked "impractical for production GPU work as of 2026" only with a citation.
- No independent evaluations of TOPLOC or Verde.
- No primary confirmation of the io.net spoofing allegation.

---

## 5. Business risks (price collapse, competition, switching costs, reliability, liquidity, tokens)

### Takeaway
The commodity GPU-rental layer has thin and volatile margins. H100 rental fell from about $8/hr (2023) to as low as about $1.70 on one index in late 2025, then partly rebounded to about $2.5–3.1/hr in 2026. Neocloud gross margins are estimated in the mid-teens after depreciation. Reliability, not price, is the main buyer complaint about marketplaces. Token-subsidized DePIN networks show the liquidity problem: big supply, small real revenue (tens of millions of dollars at best).

### Cited Findings
**Price volatility / margin compression**
- H100 rental fell from about $8/hr in 2023. Silicon Data's index hit about $1.70 in October 2025, then rebounded about 40% to about $2.53 by mid-2026. — [Coloprice](https://coloprice.com/guides/h100-rental-prices/)
- One source puts H100 spot at about $3.50 in early 2024, falling below $1.00 in late 2025. That conflicts with the $1.70 index low and likely reflects different market segments. — [ClusterBid](https://clusterbid.com/blog/neocloud-market-consolidation-2026-survival-guide)
- The Ornn compute price index was $3.10/GPU-hr for H100 on Nov 7, 2026, up 11.5% month over month. — [Ornn OCPI](https://data.ornn.com/)
- A median on-demand H100 SXM list price of $4.20 across 16 providers. Nebius reportedly raised on-demand prices 17–21% in October 2026. — [Uvik GPU Price Index](https://uvik.net/blog/gpu-price-index/)
- Neocloud gross margins are estimated at about 14–16% after labor and depreciation, falling to zero if utilization drops below about 80%. Pure GPU rental faces compression, while managed services earn more. — [Compute Forecast](https://www.computeforecast.com/long-reads/neocloud-gpu-service/); [Compute Forecast: unit economics](https://www.computeforecast.com/long-reads/neocloud-unit-economics-margin-problem-gpu-infrastructure/)
- Most hyperscaler offtake contracts run about five years (BloombergNEF, cited secondhand), shielding committed-contract operators from spot swings. — [Compute Forecast](https://www.computeforecast.com/articles-post/neocloud-margin-problem-gpu-economics-ai-infrastructure/)
- Caveat: price sources are mostly vendor blogs and indexes with inconsistent methods.

**Competition / supply structure**
- Large providers sell most new capacity through multi-year contracts before data centers are built. On-demand buyers get leftovers, and smaller regional clouds often have more spare on-demand capacity. — [Qovery](https://www.qovery.com/blog/where-to-find-gpu-capacity-2026-neoclouds)
- In agent sandboxes, Vercel Sandbox went GA in January 2026 and Cloudflare offers Sandboxes, so platform vendors are bundling sandbox compute. — [alexcloudstar comparison](https://www.alexcloudstar.com/blog/sandboxing-ai-generated-code-execution-2026/); [Simular](https://www.simular.ai/alternatives/e2b-alternatives-for-ai-agents)

**Reliability expectations**
- Unverified Vast.ai hosts "can vanish mid-job," with no uptime SLA. Hosts drop offline because of internet outages or switching back to crypto mining. — [Spheron](https://www.spheron.network/blog/vastai-alternatives/); [ClusterBid](https://clusterbid.com/blog/vast-ai-gpu-marketplace-deep-dive-decentralized-pricing-reliability)
- Salad's cheapest tier is explicitly "most interruptible," aimed at retryable batch and stateless inference behind a queue. A competitor says Salad suits workloads "where failures don't matter" (biased source). — [Salad](https://salad.com); [GigaGPU (competitor)](https://gigagpu.com/?p=8010)
- Opinion pieces argue marketplaces fail production workloads when they match hardware but can't reliably deploy the workload, and that liquidity and enterprise trust are harder than the tech. — [DEV Community](https://dev.to/roan911/why-gpu-marketplaces-fail-production-workloads-and-what-infrastructure-first-actually-means-5hle); [BlockEden forum](https://blockeden.xyz/forum/t/decentralized-ai-is-in-a-trough-but-vcs-are-doubling-down-the-gpu-marketplace-hype-was-wrong-and-purpose-built-ai-infrastructure-is-the-real-play/849)

**Token / DePIN dependence**
- Reported figures: io.net has about $20M annualized revenue across about 139,000 GPUs. Akash ARR is about $4.2M despite "usage up 428%" and over 80% utilization. Token-emission-subsidized networks face "death spiral" risk when token prices fall. Source is a single, crypto-friendly publisher, so treat as directional. — [BlockEden: DePIN revenue pivot](https://blockeden.xyz/blog/2026/04/12/depin-revenue-pivot-token-subsidies-ai-compute-akash-render-ionet/); [BlockEden: March 2026 reality check](https://blockeden.xyz/blog/2026/03/21/depin-march-2026-reality-check-650-projects-19b-market-cap-revenue/)
- A Cointelegraph op-ed headlined "Decentralized compute has failed" (by a competitor-founder) shows that sector skepticism is mainstream. — [Cointelegraph opinion](https://cointelegraph.com/opinion/decentralized-compute-has-failed)

### Inferences
- **Price risk:** A marketplace takes a percentage of GMV, so falling GPU prices shrink revenue per hour directly. Rebounds (2026) help, but plan for the low-price case. A percentage take of $1.70/hr H100 time is tiny.
- **Switching costs are near zero** for raw GPU-hours. Buyers multi-home across Vast, RunPod, Salad, TensorDock and others and chase the cheapest listing. Defensibility has to come from workflow lock-in (APIs, queueing, templates, data locality, verification guarantees) or from exclusive supply (universities, specific data centers).
- **Liquidity / chicken-and-egg:** Supply is easy to attract, since hobbyist GPU owners and failing miners are plentiful. **Demand is the bottleneck.** DePIN networks show you can have 100k+ GPUs and only about $20M revenue. Starting demand-first is better: pick a buyer segment, hand-curate a small reliable supply pool (even reselling capacity from other clouds at first), and grow supply only to meet demand.
- **Tokens:** Avoid. Tokens add securities and regulatory risk, attract speculative rather than paying supply, and create an emissions-subsidy cliff. Fiat payouts via Connect are simpler and are what buyers and enterprises want.
- **Reliability:** Production buyers expect SLAs. A spare-capacity marketplace should either target interruption-tolerant workloads explicitly or provide checkpointing, auto-retry and failover as a product feature.

### Gaps
- No audited financials for neoclouds or marketplaces (Vast, RunPod, Salad are private). Margin and take-rate figures are estimates.
- No reliable data on typical marketplace take rates (commonly cited at about 15–25%, but not sourced here).
- No primary data on buyer churn or multi-homing rates.
- Sequoia/a16z/Multicoin theses on compute marketplaces were not retrieved in this pass.

---

## 6. Opportunities: underserved niches for a small entrant

### Takeaway
The evidence favors niches where the weakness of commodity marketplaces (untrusted hosts, no SLA, no verification) matters least, or where a specific constraint (residency, workflow fit, interruption tolerance) creates willingness to pay beyond price. The strongest-supported openings are (1) **interruption-tolerant batch workloads** (batch inference, embeddings, transcription, rendering) on cheap consumer GPUs with queueing, retry and verification built in; (2) **EU-sovereign / data-residency compute** run by an EU entity, where EU capacity lags the US and the CLOUD Act makes US providers a non-starter for some buyers; (3) **resale of idle capacity from organizations with underused clusters** (labs, universities, enterprises with reserved capacity); and (4) **agent-native compute APIs**, which are growing but crowded. Evidence for green/solar-surplus and university niches is thin.

### Cited Findings
- **Batch / interruptible workloads:** Salad markets its lowest-cost tier for "retryable batch and stateless inference behind a queue." Third-party reviews say Salad suits batch better than real-time because of cold starts and interruptions. That suggests demand for interruptible capacity exists, along with demand for better tooling around it. — [Salad](https://salad.com); [Toolradar](https://toolradar.com/tools/saladcloud)
- **Matching workload to hardware** is identified as the unsolved job. "A marketplace that successfully matches a customer with a GPU but cannot reliably deploy the workload has not completed the job." — [DEV Community](https://dev.to/roan911/why-gpu-marketplaces-fail-production-workloads-and-what-infrastructure-first-actually-means-5hle)
- **EU sovereignty / residency:** EU B200 availability is "very limited" and lags the US by 1–3 months. Data residency is described as a hard constraint under 2026 EU AI Act enforcement (vendor claim). The CLOUD Act means a US-incorporated provider can be compelled regardless of server location, favoring EU-incorporated providers. — [Lyceum: EU GPU availability](https://lyceum.technology/magazine/eu-gpu-availability-b200-h200-2026/); [Lyceum: EU data residency](https://lyceum.technology/magazine/eu-data-residency-ai-infrastructure/); [Spheron: EU GPU clouds](https://www.spheron.network/blog/gpu-cloud-providers-europe-2026/)
- **Idle capacity resale:** Owners with about 40% cluster utilization "pay full price for idle hardware." Monetization routes include marketplace listings, capacity partners, and "running your own jobs while selling the gaps." Risks include delivery commitments and scheduling conflicts with the owner's own jobs. — [Packet.ai](https://packet.ai/blog/got-gpus-but-no-cloud-5-ways-to-turn-them-into-revenue)
- **On-demand scarcity at the top end:** Hyperscalers and big neoclouds pre-sell capacity in multi-year contracts, leaving on-demand buyers with leftovers. Regional and smaller clouds have spare on-demand capacity. An aggregator or broker layer across these is a gap. — [Qovery](https://www.qovery.com/blog/where-to-find-gpu-capacity-2026-neoclouds)
- **Agent-native compute:** Agent sandbox categories (E2B Firecracker microVMs, Modal gVisor, Daytona, Blaxel "persistent agent computers," Vercel Sandbox GA Jan 2026, Cloudflare Sandboxes) are growing fast but crowded with funded players and platform bundling. E2B released a self-hostable Apache-2.0 single-machine runtime in September 2026. That could let a marketplace run agent sandboxes on distributed hosts. — [Morph](https://www.morphllm.com/comparisons/e2b-vs-modal); [Simular](https://www.simular.ai/alternatives/e2b-alternatives-for-ai-agents); [alexcloudstar](https://www.alexcloudstar.com/blog/sandboxing-ai-generated-code-execution-2026/)
- **Reliability as a price tier:** On Vast, 95%+ reliability hosts command 2–3x the price of unreliable ones. Buyers will pay for curated reliability. — [ClusterBid](https://clusterbid.com/blog/vast-ai-gpu-marketplace-deep-dive-decentralized-pricing-reliability)
- **"Enterprise cloud overflow"** is the pivot DePIN networks (Akash, io.net) are making toward real revenue. — [BlockEden](https://blockeden.xyz/blog/2026/04/03/depin-revenue-inflection-enterprise-cloud-overflow-akash-ionet/)

### Inferences
Ranked for a solo or small team, with my assessment of each:
1. **Vertical batch-job service on consumer/spare GPUs** (e.g., "transcribe or embed or caption 10M items," "render this Blender/Unreal job," "batch-run this open-weight 7–14B LLM over my dataset"). Strengths: interruption-tolerant, easy redundancy-based verification, little private data if positioned well, and the buyer pays per job, not per GPU-hour, which escapes direct price comparison. Exposure to export controls is lower with consumer GPUs. The main competitor is Salad, plus serverless inference APIs (Together, Fireworks, etc.) for LLM batch.
2. **EU-incorporated, EU-only compute broker** aggregating EU data centers, universities and HPC idle capacity with residency guarantees and DPAs. Strengths: regulatory moat, CLOUD Act argument, and EU capacity scarcity. Weaknesses: B2B sales cycles, and you need vetted supply rather than hobbyists.
3. **Idle-capacity resale for owners of underused clusters** (AI startups with over-bought reserved capacity, research labs, universities, render farms). Run their own jobs first and sell the gaps via preemptible capacity. Offer the platform as a white-label "sell your gaps" agent. Strengths: higher-trust supply (KYB'd orgs), data-center-grade hardware, and CC possible. Weaknesses: university procurement and policy may forbid commercial resale (not researched).
4. **Agent-native sandbox compute on distributed hosts** (self-hosted E2B/Firecracker runtimes on community CPUs). Large demand, but crowded, and security-sensitive (agents run arbitrary code with network access). Abuse risk is high.
5. **CPU batch, green/solar-surplus compute**: plausible stories, but I found no supporting demand evidence in this pass.

Cross-cutting design recommendations from the evidence: no token; fiat via Stripe Connect; B2B-only at launch (avoids the EU VAT deemed-supplier problem for consumers and eases KYC); VM-level isolation with a single tenant per GPU; buyer KYC with sanctions/PRC screening for any data-center-class GPUs; and job-level pricing with built-in retry and verification so buyers aren't comparing raw $/GPU-hr.

### Gaps
- No direct evidence found on universities selling idle GPU capacity (policy, demand, legality), or on enterprise reserved-capacity resale volumes (e.g., AWS Capacity Blocks / Savings Plans resale restrictions).
- No evidence gathered for green/solar-surplus compute demand, rendering-farm market size, or CPU batch demand.
- No VC theses (a16z, Multicoin, Sequoia) or founder interviews and HN threads were retrieved. Hacker News searches returned nothing relevant.
- No sizing data for any niche.

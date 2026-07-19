# Killer Facts: next steps

Queue for extracting killer facts from the remaining tracker entries. The pilot
plus batches 1-13 are done; what remains (109 entries, batches 14-23) is below.

The queue is now sorted newest first by publication year: 2026 papers come first,
then 2025, and so on. Work the recent years first. Within a year, order does not
matter, so search by id or title. Older citations sit at the bottom by design; do
not spend time there until the recent years are cleared.

## How to run a batch

1. Open this file and pick the first unchecked batch (top of the file = most recent year).
2. Invoke the killer-facts skill (`skills/killer-facts/SKILL.md`, mirrored at
   `.claude/skills/killer-facts/SKILL.md`) on those paper ids. Follow it
   exactly: verbatim quotes from fetched text only, abstracts first but verify
   in the body, both rating rubrics, the controlled vocabularies.
3. Record the extracting model in each fact's `model` field, and copy each
   source's publication date from its tracker `date` into the fact's `pubDate`.
4. Sources that cannot be fully read go to `PENDING_SOURCES.md`, not the data file.
5. Merge into `data/killer-facts-data.js` sorted by paperId, dedupe repeated
   statistics against existing facts (keep the primary source), and load
   `killer_facts.html` to confirm the console validation passes.
6. Check the batch off below, commit, and STOP. One batch per run; the
   maintainer reviews before the next batch starts.

## Which model to use

The recommended model is **Claude Sonnet 5** (`claude-sonnet-5`): near-Opus quality on
this agentic read-fetch-extract work at a fraction of the cost. Haiku 4.5 is cheaper and
fine for the mechanical parts (fetching, quoting verbatim), but the truth ratings and
methodology notes are judgment calls where Sonnet is the safer floor. Because every fact
records its model, spot-check the first batch for rating drift against the existing facts
before continuing; if a cheaper model's ratings drift, keep it for extraction and have a
stronger model re-rate.

## Batches (166 entries, newest first by publication year)


### 2026 (55 entries)

#### Batch 1 [x]

- 77 — Government by AI? Trump Administration Plans to Write Regulations Using Artificial Intelligence (ProPublica, 2026)
- 79 — The Federal Government Is Rushing Toward AI. Our Reporting Offers Three Cautionary Tales. (ProPublica, 2026)
- 106 — AI Systems @ Work: A Changing Psychosocial Work Environment (International Labour Organization, 2026)
- 107 — ILO Adopts First-Ever Conclusions on AI in Manufacturing Work (International Labour Organization, 2026)
- 108 — AI Training Opens Doors for Women Entrepreneurs in the Philippines (International Labour Organization, 2026)
- 109 — Adoption of Artificial Intelligence and Productivity Growth in Kuwait’s Private Sector (International Labour Organization, 2026)
- 113 — Beyond 'US Innovates, Europe Regulates': Lessons and Recommendations from a Transatlantic AI Exchange (German Marshall Fund of the United States, 2026)
- 114 — Copy, Paste, Govern: Microsoft Ghostwrote EU Policy That Keeps Data Centres' Energy Use Secret (Corporate Europe Observatory and AlgorithmWatch, 2026)
- 124 — When Machines Discriminate: The Critical Role of Disparate Impact in AI Accountability (The Leadership Conference on Civil and Human Rights, 2026)
- 136 — AI Commons: Worker Stories from the AI Economy (AI Commons Project, 2026)

#### Batch 2 [x]

- 148 — New Jersey Responsible AI Advancement and Workforce Protection Act (S.1840) (New Jersey Legislature, 2026)
- 149 — Government AI Landscape Assessment (Second Annual) (Code for America, 2026)
- 153 — The New Way Your Boss Is Watching Your Feelings (The Atlantic, 2026)
- 154 — Anthropic Is Letting Claude Agents 'Dream' So They Don't Sleep on the Job (SiliconANGLE, 2026)
- 155 — Microsoft's AI Data Center Push Is Colliding with Its Clean Power Goals (TechCrunch, 2026)
- 156 — When Using AI Leads to 'Brain Fry' (Harvard Business Review, 2026)
- 158 — How Platform Labor Laws Are Shaping Gig Work in Singapore and Malaysia (Tech Policy Press, 2026)
- 159 — The Political Economy of AI Starts in Brazil, Not Silicon Valley (Tech Policy Press, 2026)
- 160 — Search Remedies in Google Antitrust Case Can Work Even if Company Stays on Top (Tech Policy Press, 2026)
- 161 — AI Efficiency Can Undermine Accountability Even With Humans in the Loop (Tech Policy Press, 2026)

#### Batch 3 [x]

- 162 — Tech Policy Is on the Front Line of Fascism vs. Democracy. Pick a Side. (Tech Policy Press, 2026)
- 163 — Democratic Governance of AI Is the Real Solution (Jacobin, 2026)
- 196 — Advancing Responsible AI Adoption and Use in the Public Sector: Three Policy Priorities for State Legislation (Center for Democracy and Technology, 2026)
- 197 — The Empty National AI Policy Framework: Who Is in Charge of Those in Charge? (Brookings Institution, 2026)
- 198 — National Policy Framework for Artificial Intelligence: Legislative Recommendations (Executive Office of the President, 2026)
- 200 — No Bailouts for Big Tech Billionaires: Policies for When the AI Bubble Bursts (Open Markets Institute, 2026)
- 201 — Lessons from Past Trade Adjustment Policies to Support Displaced Workers in the Era of Artificial Intelligence (Washington Center for Equitable Growth, 2026)
- 202 — The Looming Legislative and Labor Push Against Artificial Intelligence (Felhaber Larson, 2026)
- 204 — Patchwork AI Hiring Laws Create Rising Compliance Risks for Employers (DarrowEverett LLP, 2026)
- 205 — Is AI Changing the Path to Gender Parity? (World Economic Forum, 2026)

#### Batch 4 [x]

- 207 — Recovering Wages and Wealth: What We Deserve in the Age of AI (Economic Security Project, 2026)
- 208 — Guaranteed Income and Employment in California (Economic Security Project, 2026)
- 212 — State Fact Sheets: How States Spend Funds Under the TANF Block Grant (Center on Budget and Policy Priorities, 2026)
- 225 — Policy on the AI Exponential: Macroeconomics and Tax Policy (Dario Amodei, 2026)
- 226 — A Policy Framework for AI's Impact on Work (Anthropic Economic Policy Framework) (Anthropic, 2026)
- 227 — AI, the Economy, and You: A People-Centered AI Agenda (Better Markets, 2026)
- 228 — Building Pro-Worker Artificial Intelligence (The Hamilton Project (Brookings), 2026)
- 229 — Automation and Repression (NBER, 2026)
- 230 — How AI Aggregation Affects Knowledge (NBER, 2026)
- 231 — AI, Human Cognition and Knowledge Collapse (NBER, 2026)

#### Batch 5 [x]

- 233 — Medicare's AI Push Snarls Patients and Doctors in Errors and Delays (KFF Health News, 2026)
- 235 — AI Is Taking Over Hospitals (The Atlantic, 2026)
- 236 — The Tech Behind ICE: Oligarchs, Immigration Enforcement, and the Threat to Democracy (Mijente, Just Futures Law & Surveillance Resistance Lab, 2026)
- 237 — Amazon's Next Warehouse Efficiency Drive Is About Moving Humans, Not Just Packages (Business Insider, 2026)
- 238 — Privacy Without Remedy: An Assessment of Data Broker Compliance with California Privacy Law (arXiv, 2026)
- 239 — 2026 AI Report — Build for Everyone: A Framework for LGBTQ Representation and Safety in AI (GLAAD, 2026)
- 240 — Acceleration Is Not a Strategy: A Framework for Directing AI Towards Public Value Before It's Too Late (IPPR, 2026)
- 241 — OpenAI Proposes U.S. Government Own 5% Stake to Address Political Blowback (CNBC, 2026)
- 242 — Preparing for the Unpredictable (Brew Markets, 2026)
- 243 — New Jersey A3481: Revises Homelessness Prevention Program, Establishes Eviction Filing Fee (New Jersey Legislature, 2026)

#### Batch 6 [x]

- 245 — Prompt Governance? On Governing Technologies Governed by Natural Language (ACM FAccT, 2026)
- 246 — Federal Trade Commission's Proposed Policy Statement Concerning the Suppression of Accuracy in Artificial Intelligence Systems (Federal Trade Commission, 2026)
- 249 — The Gap: A Shortage of Affordable Homes (National Low Income Housing Coalition, 2026)
- 250 — Policy Basics: Federal Rental Assistance (Center on Budget and Policy Priorities, 2026)
- 254 — Employee Ownership by the Numbers (National Center for Employee Ownership, 2026)


### 2025 (27 entries)

#### Batch 7 [x]

- 76 — Workers First: AI Principles to Protect Workers (AFL-CIO, 2025)
- 78 — How ProPublica Uses AI Responsibly in Its Investigations (ProPublica, 2025)
- 80 — Inside the AI Prompts DOGE Used to 'Munch' Contracts Related to Veterans' Health (ProPublica, 2025)
- 82 — Moratoriums and Federal Preemption of State Artificial Intelligence Laws Pose Serious Risks (Center for American Progress, 2025)
- 104 — Revolutionizing Health and Safety: The Role of AI and Digitalization at Work (International Labour Organization, 2025)
- 115 — The Innovation Framework: A Civil Rights Approach to AI (The Leadership Conference on Civil and Human Rights, 2025)
- 120 — The Discriminatory Impacts of AI-Powered Tenant Screening Programs (Georgetown Journal on Poverty Law & Policy, 2025)
- 140 — Expertise (NBER Working Paper, 2025)
- 141 — AI and Jobs: Two Phases of Automation (Anton Leicht, 2025)
- 142 — AI as Profoundly Abnormal Technology (AI Futures Project, 2025)

#### Batch 8 [x]

- 143 — What Happens When Jobs Disappear? A Guide to Displaced Worker Programs in the U.S. (Bipartisan Policy Center, 2025)
- 144 — Trump's Rollback of AI Guardrails Leaves US Workers 'At Real Risk' (The Guardian, 2025)
- 145 — AI-Related Job Impacts Clarity Act (S.3108) (U.S. Senate, 2025)
- 147 — AI in Workforce Development: Guidance for WIOA Programs (NJ WD-PY25-14) (New Jersey Department of Labor, 2025)
- 157 — LLM-Generated Messages Can Persuade Humans on Policy Issues (Nature Communications, 2025)
- 164 — JusticeTech Uses AI to Address Eviction Crisis (Ohio State University Moritz College of Law, 2025)
- 165 — Can AI Help Solve the Housing Crisis? (Community Solutions, 2025)
- 166 — San Francisco's 'Hack for Social Impact' Unleashes AI for Homelessness and Justice (Hack for Social Impact, 2025)
- 167 — Platform Workers Act 2024 (Singapore) (Singapore Parliament, 2025)
- 177 — AI Is Reshaping the Workplace, but Entry-Level Hires Are Way Ahead of the Game (Wharton AI & Analytics Initiative, 2025)

#### Batch 9 [x]

- 203 — AI Labor Displacement and the Limits of Worker Retraining (Brookings Institution, 2025)
- 209 — Cash Transfers Improve Maternal, Infant, and Child Health Outcomes in the U.S. (Economic Security Project, 2025)
- 210 — What We Know About the Effect of Guaranteed Income on Housing, Financial Security, and Employment (University of Chicago Inclusive Economy Lab, 2025)
- 211 — Guaranteed Income: A Policy Landscape Review of 105 Programs in the United States (Basic Income Studies, 2025)
- 218 — Renegotiating Deservedness: A Big Qual Analysis Across Eight Guaranteed Income Experiments (International Journal of Social Welfare, 2025)
- 219 — Myths about Generative AI, Productivity, and Job Displacement (Luddite Lab / DAIR Institute, 2025)
- 224 — Luddite Lab Case Study Highlights: Common Insights Across Worker AI Campaigns (Luddite Lab / DAIR Institute, 2025)


### 2024 (43 entries)

#### Batch 10 [x]

- 81 — Police Departments Are Turning to AI to Sift Through Millions of Hours of Unreviewed Body-Cam Footage (ProPublica, 2024)
- 83 — To Implement AI Responsibly, Third-Party Deployments Must Require Safeguards (Center for American Progress, 2024)
- 84 — Using Learning Science To Analyze the Risks and Benefits of AI in K-12 Education (Center for American Progress, 2024)
- 85 — How States and Districts Can Close the Digital Divide To Increase College and Career Readiness (Center for American Progress, 2024)
- 86 — Taking Further Agency Action on AI (Center for American Progress, 2024)
- 87 — Generative AI Should Be Developed and Deployed Responsibly at Every Level for Everyone (Center for American Progress, 2024)
- 88 — Fact Sheet: Recommendations for Financial Regulatory Agencies To Take Further Action on AI (Center for American Progress, 2024)
- 89 — Fact Sheet: Recommendations for Housing Regulators To Take Further Action on AI (Center for American Progress, 2024)
- 90 — Fact Sheet: Recommendations for the Department of Education To Take Further Action on AI (Center for American Progress, 2024)
- 105 — Mind the AI Divide: Shaping a Global Perspective on the Future of Work (International Labour Organization, 2024)

#### Batch 11 [x]

- 110 — Algorithmic Management Practices in Regular Workplaces: Case Studies in Logistics and Healthcare (International Labour Organization, 2024)
- 119 — Record Costs: Collateral Consequences of Eviction Court Filings in Pennsylvania (University of Michigan Poverty Solutions, 2024)
- 123 — The Legal Doctrine That Will Be Key to Preventing AI Discrimination (Brookings Institution, 2024)
- 128 — Artificial Intelligence Is Putting Innocent People at Risk of Being Incarcerated (Innocence Project, 2024)
- 130 — MBIAS: Mitigating Bias in Large Language Models While Retaining Context (Vector Institute, 2024)
- 132 — Gender Bias in Large Language Models across Multiple Languages (arXiv, 2024)
- 134 — Measuring Implicit Bias in Explicitly Unbiased Large Language Models (arXiv, 2024)
- 135 — What's in a Name? Auditing Large Language Models for Race and Gender Bias (arXiv, 2024)
- 146 — GiveDirectly: AI-Supported Triggers for Cash Transfers (Anticipation Hub, 2024)
- 168 — AI and Access to Justice Initiative (Stanford Legal Design Lab, 2024)

#### Batch 12 [x]

- 169 — FHFA 2024 Generative AI in Housing Finance TechSprint (Federal Housing Finance Agency, 2024)
- 174 — AI in Education: Addressing Biases and Discrimination, Privacy & Surveillance (American Bar Association CRSJ, 2024)
- 175 — AI and Consumers: The Invisible Impact on Economic Justice (American Bar Association CRSJ, 2024)
- 176 — AI Essentials for Lawyers: What You Need to Know to Protect Your Clients in the Digital Age (American Bar Association CRSJ, 2024)
- 178 — Creative Intelligence: AI and Creativity (Wharton AI & Analytics Initiative, 2024)
- 179 — AI Can't Replace You at Work. Here's Why. (Wharton AI & Analytics Initiative, 2024)
- 180 — Wharton's Inaugural AI and the Future of Work Conference: Key Findings (Wharton AI & Analytics Initiative, 2024)
- 181 — AI Tools Come with Risks. This Wharton Professor Is Teaching 'Accountable AI.' (Wharton AI & Analytics Initiative, 2024)
- 182 — Stefano Puntoni / Decision-Driven Analytics / Talks at Google (Wharton AI & Analytics Initiative, 2024)
- 183 — How Marketers Can Adapt to LLM-Powered Search (Wharton AI & Analytics Initiative, 2024)

#### Batch 13 [x]

- 184 — AI May Not Be a Job Killer, After All (Wharton AI & Analytics Initiative, 2024)
- 185 — Meet the AI Expert Advising the White House, JPMorgan, Google and the Rest of Corporate America (Wharton AI & Analytics Initiative, 2024)
- 186 — We're Focusing on the Wrong Kind of AI Apocalypse (Wharton AI & Analytics Initiative, 2024)
- 187 — AI Will Change Work, for Better and Worse (Wharton AI & Analytics Initiative, 2024)
- 188 — AI Horizons: AI and Innovation (Wharton AI & Analytics Initiative, 2024)
- 189 — How Algorithmic Management Affects Employee Helpfulness (Wharton AI & Analytics Initiative, 2024)
- 190 — AI Horizons: AI and the Workforce (Wharton AI & Analytics Initiative, 2024)
- 213 — The Protective Power of Cash (NYC Family Policy Project, 2024)
- 214 — Enhancing Economic Stability: The Role of Guaranteed Income in Comprehensive Support Systems (Center for Guaranteed Income Research, 2024)
- 215 — A Policy Framework for Guaranteed Income and the Safety Net (Center for Guaranteed Income Research, 2024)

#### Batch 14 [ ]

- 220 — Ziff Davis Creators Guild: AI Contract Protections Case Study (Luddite Lab / DAIR Institute, 2024)
- 222 — National Nurses United: Political Education Program on AI Case Study (Luddite Lab / DAIR Institute, 2024)
- 223 — National Nurses United: Professional Practice Committees Case Study (Luddite Lab / DAIR Institute, 2024)


### 2023 (14 entries)

#### Batch 15 [ ]

- 112 — Privacy First: A Better Way to Address Online Harms (Electronic Frontier Foundation, 2023)
- 116 — The Promises and Perils of Residential Proptech: Year 1 Summary Report (TechEquity Collaborative, 2023)
- 117 — The Scarlet Letter 'E': How Tenancy Screening Policies Exacerbate Housing Inequity for Evicted Black Women (Boston University Law Review, 2023)
- 121 — A Home for Digital Equity: Algorithmic Redlining and Property Technology (California Law Review, 2023)
- 173 — Benefits Tech Advocacy Hub (Benefits Tech Advocacy Hub, 2023)
- 191 — How Will AI Transform Industries and Organizations? (Wharton AI & Analytics Initiative, 2023)
- 192 — How Are AI and Robotics Redefining Productivity? (Wharton AI & Analytics Initiative, 2023)
- 193 — How Is AI Affecting Innovation Management? (Wharton AI & Analytics Initiative, 2023)
- 194 — How Is AI Changing the Auto Industry? (Wharton AI & Analytics Initiative, 2023)
- 195 — How Does AI Impact Education? (Wharton AI & Analytics Initiative, 2023)

#### Batch 16 [ ]

- 199 — Generative Artificial Intelligence and the Creative Economy Staff Report: Perspectives and Takeaways (Federal Trade Commission, 2023)
- 217 — Guaranteed Income and Financial Treatment Trial (GIFT Trial): Reducing Financial Toxicity in Low-Income Cancer Patients (Frontiers in Psychology, 2023)
- 221 — New York Times Tech Guild: Largest Tech Worker Strike Case Study (Luddite Lab / DAIR Institute, 2023)
- 252 — Artificial Intelligence Risk Management Framework (AI RMF 1.0) (National Institute of Standards and Technology, 2023)


### 2022 (9 entries)

#### Batch 17 [ ]

- 103 — The Values Encoded in Machine Learning Research (ACM FAccT, 2022)
- 118 — Locked Out: How Algorithmic Tenant Screening Exacerbates the Eviction Crisis in the United States (Georgetown Law Technology Review, 2022)
- 122 — HUD Guidance: Criminal Background Screenings May Violate the Fair Housing Act (U.S. Department of Housing and Urban Development, 2022)
- 131 — Aligning Language Models to Follow Instructions (OpenAI, 2022)
- 150 — Every Move You Make: When Monitoring Employees Gives Rise to Legal Risks (Skadden, Arps, Slate, Meagher & Flom LLP, 2022)
- 152 — IDC CIO Sentiment Survey 2022: The Future CIO Is Not the Same as Today's CIO (IDC, 2022)
- 170 — Ableism and Disability Discrimination in New Surveillance Technologies (Center for Democracy and Technology, 2022)
- 234 — Soccer Fans, You're Being Watched (WIRED, 2022)
- 251 — Consumer Financial Protection Circular 2022-03: Adverse Action Notification Requirements in Connection with Credit Decisions Based on Complex Algorithms (Consumer Financial Protection Bureau, 2022)


### 2021 (5 entries)

#### Batch 18 [ ]

- 101 — EEOC Launches Initiative on Artificial Intelligence and Algorithmic Fairness (U.S. Equal Employment Opportunity Commission, 2021)
- 111 — Privacy Without Monopoly: Data Protection and Interoperability (Electronic Frontier Foundation, 2021)
- 133 — Persistent Anti-Muslim Bias in Large Language Models (arXiv, 2021)
- 172 — Statement to the California Fair Employment and Housing Council on AI and Disability Discrimination (Center for Democracy and Technology, 2021)
- 256 — Statement on a Two-Pillar Solution to Address the Tax Challenges Arising from the Digitalisation of the Economy (OECD, 2021)


### 2020 (5 entries)

#### Batch 19 [ ]

- 95 — Hidden in Plain Sight — Reconsidering the Use of Race Correction in Clinical Algorithms (New England Journal of Medicine, 2020)
- 98 — Decolonial AI: Decolonial Theory as Sociotechnical Foresight in Artificial Intelligence (Philosophy & Technology, 2020)
- 100 — Mitigating Bias in Algorithmic Hiring: Evaluating Claims and Practices (arXiv, 2020)
- 102 — Inside the Invasive, Secretive ‘Bossware’ Tracking Workers (Electronic Frontier Foundation, 2020)
- 171 — Challenging the Use of Algorithm-Driven Decision-Making in Benefits Determinations Affecting People with Disabilities (Center for Democracy and Technology, 2020)


### 2019 (4 entries)

#### Batch 20 [ ]

- 93 — Dirty Data, Bad Predictions: How Civil Rights Violations Impact Police Data, Predictive Policing Systems, and Justice (NYU Law Review, 2019)
- 125 — Algorithmic Bias Detection and Mitigation: Best Practices and Policies to Reduce Consumer Harms (Brookings Institution, 2019)
- 139 — Artificial Intelligence, Automation, and Work (NBER, 2019)
- 232 — Automation and New Tasks: How Technology Displaces and Reinstates Labor (Journal of Economic Perspectives, 2019)


### 2018 (1 entries)

#### Batch 21 [ ]

- 99 — Help Wanted: An Examination of Hiring Algorithms, Equity, and Bias (Upturn, 2018)


### 2017 (1 entries)

#### Batch 22 [ ]

- 255 — Social Prosperity for the Future: A Proposal for Universal Basic Services (UCL Institute for Global Prosperity, 2017)


### 2016 (2 entries)

#### Batch 23 [ ]

- 91 — Machine Bias (ProPublica, 2016)
- 92 — The Perpetual Line-Up: Unregulated Police Face Recognition in America (Georgetown Law Center on Privacy & Technology, 2016)

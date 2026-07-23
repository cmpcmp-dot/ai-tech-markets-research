// AI, Tech and the Economy: Research Intelligence — data layer.
// Loaded by index.html as a classic script (no build step, works on GitHub Pages
// and file://). Edit THIS file to add research entries or update themes/policies;
// every new entry needs `added: "YYYY-MM-DD"` (intake date) alongside `date`.

const CATEGORIES = [
  { id: "hiring",           label: "Algorithmic Hiring & Screening",                  color: "var(--c3)"  },
  { id: "community",        label: "Community & Place-Based Impacts",                 color: "var(--c5)"  },
  { id: "corporate",        label: "Corporate Power & Market Concentration",          color: "var(--c2)"  },
  { id: "criminal-justice", label: "Criminal Justice & Policing",                     color: "var(--c13)" },
  { id: "datarights",       label: "Data Rights & Intellectual Property",             color: "var(--c10)" },
  { id: "education",        label: "Education, Skills & Human Capital",               color: "var(--c12)" },
  { id: "environment",      label: "Environmental & Energy Impacts",                  color: "var(--c11)" },
  { id: "equity",           label: "Equity & Civil Rights",                           color: "var(--c4)"  },
  { id: "labor",            label: "Labor Market Outcomes",                           color: "var(--c0)"  },
  { id: "macro",            label: "Macroeconomic & Industry Trends",                 color: "var(--c7)"  },
  { id: "policy",           label: "Policy & Regulatory Responses",                   color: "var(--c8)"  },
  { id: "workers",          label: "Worker Power & Collective Bargaining",            color: "var(--c1)"  },
  { id: "wellbeing",        label: "Worker Wellbeing & Psychology",                   color: "var(--c6)"  },
  { id: "surveillance",     label: "Workplace Surveillance & Algorithmic Management", color: "var(--c9)"  },
];

const STATUS_META = {
  emergent: {
    label: "Recent", dot: "#26de81",
    desc: "Added to the tracker in the last 30 days."
  },
  current: {
    label: "Current", dot: "#45aaf2",
    desc: "Published in the last 18 months; active in the research conversation."
  },
  stale: {
    label: "Older", dot: "#778ca3",
    desc: "Published 18+ months ago; useful as a baseline."
  },
};

// Update this date whenever themes or policy map content changes
const LAST_CONTENT_UPDATE = "2026-07-05";

const THEMES = [
  {
    id: "displacement",
    color: "#2C3254",
    tag: "Displacement & Wages",
    lastReviewed: "2026-06-22",
    confidence: "consensus",
    question: "Who faces the greatest displacement risk — and is AI widening inequality?",
    framing: "The displacement story is no longer about which jobs disappear. The real question is who captures the productivity gains and who absorbs the losses.",
    synthesis: "<p>The scale projections now span a defined range. The ILO's {{cite:59}} 2025 analysis finds one in four workers is in an occupation with some GenAI exposure, with transformation rather than wholesale replacement the likeliest near-term outcome. Goldman Sachs {{cite:16}} estimates 300 million full-time job equivalents could be displaced globally, while the World Economic Forum {{cite:62}} projects a net gain of 170 million new roles against 92 million displaced by 2030, concentrated in high-entry-barrier fields. Two distributional facts sharpen the stakes: AI is inverting prior automation patterns by targeting higher-wage cognitive work {{citep:1}}, and AI-skilled workers already command an 11–25% salary premium.</p><p>The skeptical corrective is well documented. Acemoglu's {{cite:61}} task-level modeling puts AI's total factor productivity gains under 0.53% over ten years. His foundational work with Restrepo {{cite:139}} explains the distributional mechanism: unless deployment is paired with deliberate creation of new labor-intensive tasks, gains concentrate with capital regardless of aggregate growth. Where AI lands in the occupational structure matters as much as how much it automates. Autor and Thompson {{cite:36}} show that automating expert tasks and automating routine tasks produce opposite wage and employment effects. BCG's {{cite:75}} analysis of 165 million jobs projects 50–55% of U.S. jobs reshaped within two to three years, with &ldquo;Divergent Roles&rdquo; seeing senior positions grow while junior ones shrink, hollowing career pipelines without moving headline employment.</p><p>Deployment evidence shows augmentation dominating so far. Brynjolfsson, Li, and Raymond's {{cite:137}} randomized study of 5,179 support agents finds productivity up 14%, with gains concentrating among newer, lower-skilled workers at 34% through knowledge transfer that compresses the learning curve. Anthropic's {{cite:138}} analysis of over 4 million conversations finds 57% of usage augments rather than automates. Speed is the destabilizing variable: professional adoption ran 19–79% within a single year, including 76% of physicians using ChatGPT for clinical decisions without institutional sanction {{cite:142}}. The global dimension is structural. Frontier developers rely on an offshore data-labeling supply chain, with Kenyan workers paid under $2 per hour to process traumatic content {{citep:97}}, while ILO {{cite:105}} analysis documents that adoption prerequisites are unevenly distributed enough to leave less-developed nations behind.</p>",
    working: [
      "Wage insurance has tested evidence behind it: the NBER evaluation {{cite:34}} found it raises short-run employment probability, increases long-run cumulative earnings, and may be financially self-sustaining",
      "Augmentation dominates real-world usage: 57% of observed AI use augments human work rather than automating it {{citep:138}}, and roughly 36% of occupations already use AI for at least a quarter of their tasks",
      "AI compresses the learning curve: the largest randomized deployment study {{citep:137}} found gains concentrating among newer, lower-skilled workers (34% productivity improvement), with AI transferring top-performer expertise to everyone else",
      "Job creation projections remain net positive: WEF {{cite:62}} projects 170M new roles against 92M displaced by 2030, a net gain of 78M, with the caveat that new work concentrates in high-entry-barrier fields"
    ],
    gaps: ["Long-run wage effects after task displacement", "Gender and geographic exposure gaps: ILO data {{cite:59}} shows women in high-income countries face approximately 2.7× higher high-exposure rates than men, a divide that current workforce interventions are not designed to address", "Informal and gig sector exposure, largely absent from current data", "Global South data labor supply chain: the workforce powering AI safety systems is invisible in standard displacement metrics and absent from policy frameworks", "Replication and scaling evidence for tested interventions: wage insurance works at the TAA program scale, but evidence on broader deployment conditions remains thin", "Expert-task versus routine-task automation distinction: standard exposure metrics do not capture whether AI is removing expertise or support sub-tasks, which determines the direction of wage effects and the appropriate policy response"],
    econSynthesis: "<p>The empirical record on whether AI productivity gains reach workers produces two irreconcilable poles. The optimistic pole: McKinsey {{cite:15}} estimates generative AI could unlock $2.6–4.4 trillion annually. Goldman Sachs {{cite:16}} projects a 7% global GDP boost from AI-driven automation of tasks currently performed by 300 million full-time workers. The WEF's 2025 Future of Jobs report {{cite:62}} projects 170 million new roles and 92 million displaced by 2030. The skeptical pole: Acemoglu's &ldquo;Simple Macroeconomics of AI&rdquo; {{cite:61}} finds only approximately 5% of AI-exposed tasks are both technically automatable and financially viable. It projects total factor productivity gains under 0.53% over a decade, orders of magnitude below the McKinsey and Goldman Sachs estimates. The ILO's {{cite:59}} 2025 analysis finds one in four workers is in an occupation with GenAI exposure, with transformation rather than displacement the most likely near-term outcome.</p><p>Within that uncertainty, three quantified findings narrow the distribution. Brynjolfsson, Li, and Raymond's {{cite:137}} randomized deployment study of 5,179 customer support agents finds AI raises average productivity 14%. The gains concentrate almost entirely among newer, lower-skilled workers (34% improvement), while experienced workers see minimal change. That inverts the assumption that higher-skill workers capture the most value. Anthropic's {{cite:138}} analysis of over 4 million Claude conversations finds 57% of usage involves augmentation rather than automation, with approximately 36% of occupations deploying AI for at least a quarter of their task set. BCG's {{cite:75}} 2026 analysis of 165 million jobs concludes 50–55% of U.S. jobs will be meaningfully reshaped within two to three years. Its &ldquo;Divergent Roles&rdquo; category (12% of the workforce) sees senior positions grow as junior ones shrink, hollowing career pipelines without reducing headline employment numbers.</p><p>The distributional question is where the empirical case is clearest. Acemoglu and Restrepo's {{cite:139}} foundational framework establishes that unless AI deployment is paired with deliberate creation of new labor-intensive tasks, productivity gains widen the capital-labor income gap regardless of aggregate growth. EPI's Bivens and Zipperer {{cite:60}} sharpen the mechanism: unbalanced employer power systematically deploys AI as a control mechanism rather than a productivity-sharing tool. Hyman, Kovak, and Leive's {{cite:34}} NBER study of wage insurance within Trade Adjustment Assistance provides the only rigorously tested policy evidence at scale. Wage insurance increases short-run employment probability and raises long-run cumulative earnings by shortening non-employment spells. It may also be financially self-sustaining through reduced benefit duration and increased tax contributions. National Partnership for Women &amp; Families' {{cite:206}} 2026 analysis documents that women represent 83% of workers in the 15 most AI-vulnerable occupations, with women of color constituting more than 30%. Displacement risk falls unevenly across demographic groups, and distributional interventions must be designed accordingly.</p>",
    econGaps: [
      "Validated methodology for distinguishing optimistic (McKinsey/Goldman) from pessimistic (Acemoglu) productivity projections: both rest on assumptions about AI capability generalization not yet tested at macro scale",
      "Causal identification of AI's effect on wages versus employment: most current evidence is correlational or from narrow experimental contexts not representative of economy-wide deployment",
      "Long-run wage effects after task displacement: Brynjolfsson et al.'s {{cite:137}} productivity finding is short-run; whether gains to lower-skilled workers persist or compress as AI diffuses is unmeasured",
      "Expert-task versus routine-task automation distinction: standard exposure metrics do not capture whether AI is removing expertise or support sub-tasks, which determines the direction of wage effects and the appropriate policy response",
      "Phase transition indicators: no systematic method exists for identifying when AI displacement crosses from Phase 1 (manageable, normal automation) to Phase 2 (structural, comparative-advantage-eroding) disruption levels",
      "Gender and geographic exposure gaps: ILO data {{cite:59}} shows women in high-income countries face approximately 2.7× higher high-exposure rates than men; no tested intervention specifically addresses this disparity"
    ],
    implication: "<p><span class='impl-label'>Who is most at risk</span>Institutions focused only on higher-wage knowledge workers will miss those most vulnerable to cumulative economic harm. The compounding dynamic, where AI-adopting workers pull further ahead while non-adopters fall behind, suggests the gap is widening faster than most workforce projections account for. The Autor/Thompson {{cite:36}} expertise framework makes this concrete: institutions need occupational-level analysis of which type of automation is operating, not aggregate displacement estimates, because the appropriate interventions differ depending on whether AI is removing expert judgment or routine sub-tasks.</p><p><span class='impl-label'>Timeline & urgency</span>The BCG {{cite:75}} timeline compression is operationally significant: two-to-three-year reshaping of half the U.S. workforce is incompatible with five-to-ten-year program planning cycles. Institutions should treat pipeline hollowing — the loss of junior roles while senior roles persist — as a near-term structural problem requiring immediate attention, not a future displacement scenario. The Acemoglu/Autor/Johnson pro-worker AI framework {{cite:41}} provides the policy lever: redirecting investment incentives from automation toward augmentation is achievable through procurement and research policy without waiting for new legislation.</p><p><span class='impl-label'>Data & sectors to monitor</span>Understanding where AI deployment is accelerating in low-wage and informal sectors, and what tools are being used to manage those workers, should be foundational to where institutions direct attention and resources. This requires looking beyond headline employment numbers to wage trajectories, task composition, and who is absorbing the productivity gains, including the Global South data labor supply chain that standard displacement research has not yet adequately addressed.</p>",
    risk: {
      level: "High",
      color: "#C0392B",
      summary: "<p>AI-driven wage divergence is accelerating faster than policy or institutions can respond. The risk is not theoretical displacement but compounding inequality: workers without AI skills fall further behind while productivity gains concentrate among those already above the median, and the gap widens annually.</p><p>Institutions that treat this as a future risk rather than a present one will fall behind the intervention window. The research suggests the divergence is already underway and is being measured in salary premiums and task-exposure data, not in projections.</p>",
      leverage: "<p>Wage insurance carries rare tested evidence {{cite:34}}: it raises long-run earnings, speeds re-employment, and may pay for itself. The augmentation data points the same direction, with AI's largest documented gains accruing to newer, lower-skilled workers, meaning deployment choices can narrow gaps rather than widen them. The Acemoglu-Autor-Johnson framework {{cite:41}} identifies levers available now: procurement rules, research investment, and antitrust action can redirect investment toward augmentation without waiting for new legislation.</p>"
    },
    papers: [1, 2, 46, 60, 61, 15, 16, 30, 33, 34, 36, 37, 41, 59, 62, 63, 75, 97, 105, 109, 137, 138, 139, 140, 141, 142, 136, 152, 154, 177, 179, 184, 190, 200, 206, 207, 208, 212, 219, 224, 232, 235, 237, 244],
  },
  {
    id: "equity",
    color: "#FF8361",
    tag: "Equity & Civil Rights",
    lastReviewed: "2026-06-22",
    confidence: "consensus",
    question: "Is AI compounding existing racial, gender, and class inequalities?",
    framing: "AI systems are not neutral by default. Documented disparities in hiring, credit, and surveillance show that without deliberate intervention, AI rollout will deepen existing inequalities.",
    synthesis: "<p>Disparities are documented across every consequential domain. In hiring, fewer than 20% of vendors provide adequate bias audit documentation {{citep:8}}. In credit, The Markup's {{cite:129}} investigation found mortgage algorithms denying Latino applicants roughly 40% more often and Black applicants 80% more often after controlling for creditworthiness. In housing, the National Consumer Law Center {{cite:66}} finds no evidence that credit scores predict successful tenancy, yet automated screening tools treat them as primary inputs, and Pappoe {{cite:117}} shows the compounding mechanism: eviction filings persist in screening databases as a permanent algorithmic record.</p><p>Healthcare carries the highest-stakes evidence. Obermeyer et al.'s {{cite:94}} Science study found a widely used commercial algorithm underestimated Black patients' illness severity because it used cost as a proxy for need. Correcting the bias would raise the share of Black patients flagged for high-risk care from 17.7% to 46.5%. Vyas, Eisenstein, and Jones {{cite:95}} documented race-adjustment factors across cardiology, nephrology, obstetrics, and urology that steer Black patients away from care they clinically need. The legal infrastructure to contest this already exists: disparate impact doctrine is the most consequential existing instrument for AI accountability {{cite:124}}, and preserving it against narrowing by courts and industry is a near-term civil rights priority {{cite:125}}.</p><p>A distinct evidence category concerns bias inside the models themselves. Buolamwini and Gebru's {{cite:126}} Gender Shades study found up to 43x accuracy disparity between darker-skinned women and lighter-skinned men, traced to training data that was 79–86% lighter-skinned, and Bai et al. {{cite:134}} found pervasive implicit bias in eight frontier systems that standard benchmarks miss. The decisive finding is that bias level is a resource choice: MBIAS {{cite:130}} demonstrates 30%+ bias reduction through targeted fine-tuning without performance loss, and RLHF research {{cite:131}} shows model behavior is trainable toward chosen objectives. A structurally different critique widens the frame: Mohamed, Png, and Isaac's {{cite:98}} decolonial analysis identifies &ldquo;algorithmic coloniality,&rdquo; tools tested on Global South populations and extracting data value while governance authority concentrates in Western institutions.</p>",
    working: [
      "Bias reduction is demonstrated, not hypothetical: MBIAS {{cite:130}} shows 30%+ bias reduction through targeted fine-tuning without performance loss, establishing that measured bias reflects resource allocation choices",
      "Existing law applies now: disparate impact doctrine covers algorithmic discrimination, giving regulators and litigators a usable legal baseline without new legislation",
      "Inclusive adoption is achievable by design: research on tools built for users' actual contexts shows deliberate design investment closes adoption gaps that access provision alone does not"
    ],
    gaps: ["Intersectional analysis across race, gender, and class simultaneously", "Disability and accessibility in AI-mediated work: CDT's trilogy documents dual harm (hyper-surveillance treating disability as non-compliance, erasure as invisible users) across education, employment, healthcare, and criminal justice; proctoring AI and bossware are creating systematic civil rights liability for institutions that have not conducted disability-specific AI audits", "Healthcare AI bias audit requirements: no federal standard requires commercial health algorithms to be tested for racial disparity before deployment", "Legal representation gap: disparate impact doctrine provides the legal basis to challenge algorithmic discrimination, but most affected tenants, applicants, and borrowers lack access to attorneys equipped to bring these cases at scale", "Multilingual bias auditing: current bias evaluation practice is concentrated on English-language outputs; institutions deploying AI internationally lack standardized methods for assessing bias across languages", "Global South representation in AI governance: affected communities in the Global South are systematically underrepresented in AI policy processes, and no governance framework currently requires meaningful inclusion of these communities in decisions about systems that affect them"],
    econSynthesis: "<p>The quantitative evidence on AI-driven distributional harm is strongest in healthcare and housing finance, where effect sizes are large and causally documented. Obermeyer et al.'s {{cite:94}} landmark Science study found a widely used commercial health algorithm systematically underestimated Black patients' illness severity because it used healthcare cost as a proxy for need. Structural inequities mean less is spent on Black patients regardless of clinical condition. Correcting the bias would more than double the proportion of Black patients identified as needing high-risk care, from 17.7% to 46.5%. Vyas, Eisenstein, and Jones {{cite:95}} in the NEJM documented race-adjustment factors embedded in cardiology, nephrology, obstetrics, and urology clinical tools that direct Black patients away from care they clinically need, through decisions embedded in electronic health records and clinical training nationwide. In housing finance, The Markup's {{cite:129}} analysis documented mortgage denial rates approximately 40% higher for Latino applicants and 80% higher for Black applicants after controlling for creditworthiness.</p><p>The bias evidence in AI systems themselves is methodologically distinct from documented real-world harms but directly relevant to how those harms propagate at scale. Buolamwini and Gebru's {{cite:126}} Gender Shades study documented accuracy disparities of up to 43x between darker-skinned women and lighter-skinned men in commercial gender classification systems, traced to training datasets that were 79–86% lighter-skinned subjects. NIST's 2019 Face Recognition Vendor Test, testing 189 algorithms across 18.27 million images, confirmed that false positive disparities are a systemic feature of commercially deployed facial recognition, not an outlier. Black women and Native American women showed the highest false positive rates across most algorithms. Bai et al.'s {{cite:134}} implicit bias testing of eight frontier commercial systems found pervasive stereotype biases not detected by standard benchmarks, establishing that vendor safety certifications based on current evaluation methods provide incomplete assurance across demographic groups.</p><p>The labor market distributional picture is now quantified at scale. National Partnership for Women &amp; Families' {{cite:206}} 2026 analysis finds women represent 83% of workers in the 15 most AI-vulnerable occupations, with women of color constituting more than 30%. White women, Latinas, and American Indian/Alaska Native women hold shares in AI-vulnerable roles nearly double their overall workforce representation. WEF's {{cite:205}} 2026 analysis documents approximately 29% of jobs in female-dominated occupations exposed to generative AI versus 16% in male-dominated occupations, with 16% of women's jobs in the highest displacement-risk category versus 3% for men. The gender gap in AI skills has narrowed in 74 of 75 economies tracked since 2018, but women's representation in European tech roles fell from 22% to 19% between 2023 and 2025. Skill acquisition has not translated into proportionate labor market gains.</p>",
    econGaps: [
      "Healthcare AI bias audit requirements: no federal standard requires commercial health algorithms to be tested for racial disparity before deployment, despite Obermeyer et al.'s {{cite:94}} documented harm at scale affecting millions of patients",
      "Intersectional analysis across race, gender, and class simultaneously: most existing quantitative studies document one dimension at a time; the compounding dynamics are analytically underspecified",
      "Multilingual bias auditing: current bias evaluation is concentrated on English-language outputs; institutions deploying AI internationally lack standardized cross-language assessment methods, and bias documented in English may propagate differently in other languages",
      "Legal representation gap: disparate impact doctrine provides legal basis to challenge algorithmic discrimination, but most affected individuals lack access to attorneys equipped to bring these cases at the scale AI harm actually operates",
      "Gender-by-skill interaction effects: whether the documented labor market adoption gap among women compounds over time as AI-fluent workers pull further ahead is not yet measured longitudinally"
    ],
    implication: "<p><span class='impl-label'>Procurement & deployment</span>Equity frameworks need to be embedded upstream in AI procurement and deployment decisions, not treated as post-hoc audit concerns. The evidence on hiring, credit, and healthcare algorithms shows that bias accumulates structurally through design choices, proxy variable selection, training data composition, and outcome definition, which means voluntary vendor commitments are insufficient. Institutions are better positioned to advance change through procurement standards, coalition-building with civil rights organizations, and direct advocacy for enforceable audit requirements than through general AI literacy campaigns.</p><p><span class='impl-label'>Adoption inequality</span>The adoption gap among women and lower-income populations warrants specific attention. Institutions investing in AI tools should actively assess who is actually using them and at what level of sophistication, not just whether access exists. Uneven adoption within institutions mirrors the broader labor market dynamic: tools that amplify productivity for confident, experienced users will widen internal equity gaps if rollout is not paired with deliberate support structures.</p><p><span class='impl-label'>Housing & fair lending</span>The housing regulatory gap is actionable through existing channels. HUD, CFPB, and FHFA already have statutory authority to extend Fair Housing Act enforcement to algorithmic tools. The constraint is agency will and technical capacity, not legal authority. Institutions engaged in housing policy or fair lending advocacy should treat AVM bias auditing requirements and algorithmic decision audit trails as near-term enforcement priorities that do not require new legislation to pursue.</p><p><span class='impl-label'>Vendor certification limits</span>The implicit bias findings {{cite:134}} in aligned and certified models carry a specific procurement implication: vendor safety certifications based on standard benchmarks are necessary but not sufficient. Institutions that treat a model's &ldquo;safety alignment&rdquo; as a proxy for bias-free outputs face an unquantified residual risk, since the same models that pass standard evaluations exhibit pervasive implicit stereotypes under more sensitive testing methods. Procurement standards should require demographic subgroup testing across multiple evaluation methods, not just benchmark pass rates, and should treat ongoing audit as a condition of continued deployment rather than a one-time gate. The RLHF evidence {{cite:131}} reinforces deployer accountability: AI behavior is trainable through fine-tuning and instruction, so the persistence of bias in a deployed system reflects deployment decisions. Deployers, not just developers, bear responsibility for the bias profile of the tools they put into use.</p><p><span class='impl-label'>Global accountability</span>The decolonial frame {{cite:98}} expands the accountability question in ways that domestic civil rights enforcement cannot fully address. If AI systems extract data from Global South communities, encode Western research norms as universal, and concentrate governance authority in institutions with no accountability to affected populations, then compliance with U.S. disparate impact doctrine leaves the structural harm largely intact. Institutions engaged in international work should assess whether the AI tools they deploy were developed with meaningful participation from the populations most likely to bear their costs. They should also treat Global South representation in AI governance processes as an equity priority distinct from, and not substitutable for, domestic bias auditing. The ILO Philippines evidence suggests that constructive inclusion is achievable when training and deployment design are built around actual community contexts rather than adapted down from tools designed for high-resource environments.</p>",
    risk: {
      level: "High",
      color: "#C0392B",
      summary: "<p>Algorithmic bias in hiring, credit, healthcare, and housing is structural and self-reinforcing. Without upstream intervention at procurement and deployment stages, AI rollout at scale will deepen racial, gender, and class disparities faster than legal or advocacy mechanisms can address them. Healthcare is a particularly underregulated frontier: no federal standard requires commercial health algorithms to be audited for racial disparity before deployment, and the tools are embedded in clinical infrastructure used by millions of patients.</p><p>The adoption gap compounds the risk. If lower-income and marginalized workers adopt AI tools at lower rates and with less sophistication, the economic divergence documented in displacement research will be layered on top of pre-existing inequalities, producing outcomes that are harder to reverse over time.</p>",
      leverage: "<p>The audit evidence shows measured bias varies with deliberate engineering investment, which makes reduction a resource and accountability choice rather than a technical impossibility. Disparate impact doctrine already applies to algorithmic discrimination, and procurement is the actionable pressure point: institutions can embed audit requirements and demographic performance disclosure at purchase and deployment, before harm scales, without waiting for new law.</p>"
    },
    papers: [94, 95, 8, 9, 89, 117, 120, 121, 124, 10, 49, 66, 98, 108, 125, 126, 129, 130, 131, 132, 133, 134, 135, 170, 171, 172, 174, 175, 204, 205, 206, 209, 213, 239],
  },
  {
    id: "criminal-justice",
    color: "#B03030",
    tag: "Criminal Justice & Policing",
    lastReviewed: "2026-06-22",
    confidence: "consensus",
    question: "Is AI amplifying racial bias in policing, sentencing, and surveillance — and who is accountable?",
    framing: "AI in criminal justice is a decade-long documented harm, not a future risk. Risk assessment tools, facial recognition, and predictive policing have been in active deployment for years with demonstrated racial disparities and almost no enforceable accountability.",
    synthesis: "<p>The evidence base for AI harm in criminal justice is among the oldest and most rigorous in the field. ProPublica's 2016 investigation of the COMPAS recidivism algorithm {{cite:91}} found Black defendants were 77% more likely to be labeled high-risk for future violent crime than white defendants with equivalent records, with errors running in systematically opposite directions by race. The vendor kept its methodology proprietary, preventing defendants from challenging the risk scores used against them at sentencing and pretrial hearings.</p><p>Facial recognition compounds the problem at identification. Georgetown Law's 2016 Perpetual Line-Up report {{cite:92}} documented that over 117 million Americans, one in two adults, were enrolled in law enforcement facial recognition networks without knowledge or consent. NIST's 2019 Face Recognition Vendor Test {{cite:127}} then tested 189 algorithms across 18.27 million images and confirmed that false-positive disparities are a systemic feature, not an outlier, with Black women and Native American women showing the highest rates even under controlled imaging. The Innocence Project {{cite:128}} has since documented at least seven wrongful arrests from facial recognition misidentification, six involving Black individuals, a distribution consistent with the NIST findings. Facial recognition is now being introduced as trial evidence without accuracy standards reflecting these documented disparities.</p><p>Predictive policing closes the feedback loop. Richardson, Schultz, and Crawford's 2019 NYU Law Review analysis {{cite:93}} identified 13 U.S. cities running predictive systems trained on data generated during periods of documented misconduct, consent decrees, or civil rights investigations. Tools like PredPol train on historical arrest records, encoding the biases of the officers who generated them, then output predictions that appear objective and are harder to contest than human judgment. No procurement framework requires agencies to audit training data for civil rights violations before deployment, a structural accountability gap that remains unaddressed.</p>",
    working: [
      "Audit infrastructure exists and produces authority: NIST's Face Recognition Vendor Test {{cite:127}}, the most rigorous government evaluation of its kind, made demographic disparities empirically undeniable across 189 algorithms",
      "The evidence base is the most mature in the field: a decade of rigorous documentation, from the COMPAS analysis {{cite:91}} to wrongful arrest records {{cite:128}}, gives litigators and policymakers a foundation newer AI domains lack",
      "The legal posture is strengthening: documented wrongful arrests {{cite:128}} combined with NIST's demographic findings {{cite:127}} create a stronger due process challenge than existed five years ago"
    ],
    gaps: ["Public defender access to algorithm documentation: most defendants cannot examine or challenge the AI tools used against them", "Longitudinal accuracy data on recidivism tools: COMPAS was validated in 2010 and model drift is largely untracked", "Courtroom admissibility standards for facial recognition: the most urgent near-term legal frontier given documented wrongful arrests and the absence of accuracy requirements for evidence introduced at trial", "Immigration enforcement AI: algorithmic tools in ICE proceedings are nearly absent from the research record", "Oversight mechanisms for real-time facial recognition in surveillance infrastructure", "External accountability for bodycam AI findings: the research documents that union and departmental pressure converts transparency tools into confidential internal systems, but no governance framework exists to require public disclosure of AI-flagged officer conduct"],
    implication: "<p><span class='impl-label'>Procurement as intervention</span>Criminal justice AI is operating without oversight frameworks that apply even to commercial AI products. Procurement decisions are the most actionable near-term intervention. Jurisdictions can require vendors to disclose training data provenance, accuracy by demographic subgroup, and independent audit access as conditions of contract, without waiting for state or federal legislation. The civil rights litigation record on COMPAS {{cite:91}} and facial recognition demonstrates that existing disparate impact doctrine under the Equal Protection Clause and Title VI is applicable. The constraint is legal capacity and access, not legal authority.</p><p><span class='impl-label'>Courtroom admissibility</span>The most urgent near-term legal frontier is courtroom admissibility. Facial recognition is now being introduced as trial evidence without standards that reflect its documented racial accuracy disparities. This is a problem that public defenders and civil rights litigators can contest now, using the NIST FRVT data {{cite:127}} as an evidentiary foundation. The Innocence Project's {{cite:128}} documented wrongful arrests provide the concrete harm record needed to support exclusion motions, Daubert challenges, and legislative action requiring pre-admission accuracy disclosure by demographic subgroup. This is an active due process problem in current prosecutions.</p><p><span class='impl-label'>Bodycam accountability</span>The bodycam AI inversion requires a different institutional response. Institutions engaged in police accountability should treat the confidentiality of AI-flagged officer misconduct as a transparency policy question, not merely a technology governance question. The relevant interventions are public records law, union contract terms, and oversight board authority to compel disclosure of AI findings, rather than procurement standards. The technology is already deployed. The accountability gap is in who controls access to its output.</p><p><span class='impl-label'>Cross-domain extension</span>Institutions engaged in criminal justice reform, public defense, or civil rights should treat AI governance as a direct extension of existing work rather than a separate technical domain. The evidence base to support legal challenges, procurement conditions, and legislative proposals is more developed in criminal justice than in almost any other AI deployment context. The combination of NIST's government-validated accuracy data and the Innocence Project's wrongful arrest record makes this a stronger legal posture than existed even three years ago.</p>",
    risk: {
      level: "High",
      color: "#C0392B",
      summary: "<p>Documented racial disparities in risk assessment, facial recognition, and predictive policing are structural and self-reinforcing. Proprietary algorithms, absent audit requirements, and no defendant access to model documentation mean these systems operate without the accountability mechanisms considered standard for other high-stakes government decisions.</p><p>The feedback loop in predictive policing, biased data producing biased predictions producing biased enforcement producing more biased data, compounds over time and becomes harder to disentangle the longer it runs. Jurisdictions that have been using these systems for a decade are now several cycles deep into that loop.</p>",
      leverage: "<p>Procurement is the most actionable near-term intervention: jurisdictions can require training data provenance, subgroup accuracy disclosure, and independent audit access as conditions of contract today, without waiting for state or federal legislation. The litigation posture is also strengthening. NIST's demographic findings {{cite:127}} and the documented wrongful arrests {{cite:128}} give public defenders and civil rights litigators an evidentiary foundation that did not exist five years ago, and existing disparate impact doctrine applies; the constraint is legal capacity and access, not legal authority.</p>"
    },
    papers: [91, 92, 93, 81, 127, 128, 234, 236],
  },
  {
    id: "worker-power",
    color: "#472B51",
    tag: "Worker Power",
    lastReviewed: "2026-06-22",
    confidence: "emerging",
    question: "What leverage do workers actually have, and where is organizing working?",
    framing: "Workers have more leverage than union density numbers suggest, but only where they can organize collectively around specific AI deployment terms before those terms become standard.",
    synthesis: "<p>Tech sector union density remains below 5% despite rising AI job insecurity, driven by contractor misclassification, at-will employment, and employer countermeasures. Yet the 2023 WGA and SAG-AFTRA strikes {{cite:3}} produced the first replicable AI contract language in a major U.S. industry: consent requirements for AI replicas, residual payments tied to AI use, and mandatory notification when AI substitutes for covered work. In October 2025 the AFL-CIO's Workers First {{cite:76}} agenda extended this to 63 unions and 15 million workers, and in April 2026 the ILO {{cite:107}} adopted its first tripartite conclusions on AI in manufacturing across 54 countries and nearly 500 million workers. AI organizing is no longer confined to a handful of industries or a single country.</p><p>The conditions driving that organizing are well documented. MIT Work of the Future research {{cite:7}} shows algorithmic management raised injury rates and voluntary turnover by 34%, and ILO cross-country case studies across Italy, France, India, and South Africa {{cite:110}} find that algorithmic management degrades job quality regardless of regulatory context. In France and Italy, strong labor law exists but contains no specific provisions for algorithmic management, so legal protection alone does not prevent these outcomes.</p><p>Workplace surveillance has expanded far beyond the warehouse. Washington Center for Equitable Growth survey evidence {{cite:151}} finds 68% of U.S. workers report at least one form of electronic monitoring, with constant productivity monitoring linked to tripled unsafe-practice rates and doubled injury rates, concentrated among Black and Hispanic workers. EFF's investigation {{cite:102}} finds nine of ten remote-monitoring vendors offer covert installation capturing keystrokes, webcam feeds, and passwords without worker knowledge, under almost no U.S. legal protection. Data &amp; Society {{cite:26}} documents corporations deploying &ldquo;privacy-preserving&rdquo; techniques to satisfy data-privacy laws while continuing behavioral analysis, and AI Now's dual-harm analysis {{cite:53}} connects the two ends: monitoring suppresses wages while surveillance-driven pricing inflates consumer costs.</p>",
    working: [
      "Contract wins are replicable: the 2023 WGA and SAG-AFTRA strikes {{cite:3}} produced the first replicable AI contract language in a major U.S. industry, won before any legislation existed",
      "Worker-first deployment outperforms: companies implementing AI with a worker-first approach achieved 10% higher profits and 34% higher sales per hour {{citep:180}} than productivity-first adopters",
      "Labor coordination is scaling: the AFL-CIO's Workers First framework {{cite:76}} represents 63 unions and 15 million workers, and the ILO's first-ever tripartite conclusions on AI in manufacturing {{cite:107}} cover 54 countries and nearly 500 million workers"
    ],
    gaps: ["Healthcare and professional sector organizing: gig nursing deregulation and clinical AI surveillance represent the newest frontier of algorithmic management, with organizing infrastructure still underdeveloped", "Gig and platform worker legal frameworks for collective action", "Legal protections for knowledge workers under remote surveillance: almost no U.S. law governs what employers can collect on employer-owned devices, and the bossware market is growing", "Privacy language co-optation: regulatory frameworks that rely on 'privacy-preserving' technical compliance allow surveillance to expand while appearing constrained; enforcement mechanisms are absent", "Emotion AI governance gap: systems claiming to detect worker emotional states from facial expressions, voice, and biometrics are spreading into workplaces without validated scientific foundations, worker notice requirements, or recourse mechanisms", "Implementation and accountability mechanisms for the ILO tripartite manufacturing conclusions {{cite:107}}: adoption language creates a policy timeline, but enforcement is not yet specified"],
    econSynthesis: "<p>The most robust empirical finding on AI and worker power comes from deployment studies rather than organizing campaigns. Research presented at Wharton's inaugural AI and Future of Work conference {{cite:180}} documented a consistent performance differential. Companies implementing AI with a worker-first approach, prioritizing employee well-being over pure productivity metrics, achieved 10% higher profits and 34% higher sales per hour than productivity-first adopters. This is a performance finding, not an advocacy claim, and it directly reframes the employer calculus on AI deployment design.</p><p>The algorithmic management literature quantifies the cost of the counterfactual. MIT Work of the Future research {{cite:7}} documents that algorithmic management systems in warehouse and logistics contexts increased injury rates by 34% and voluntary turnover by the same margin. Granulo and Puntoni's analysis {{cite:189}} finds employees managed algorithmically are measurably less likely to help colleagues; the prosocial motivation deficit is strongest when AI evaluates performance rather than handling other management functions. Washington Center for Equitable Growth's 2024 survey {{cite:151}} documents that 68% of U.S. workers report at least one form of electronic monitoring, with constant productivity monitoring linked to tripled rates of unsafe work practices (46% vs. 15%) and doubled injury rates (9% vs. 4%), with harm concentrated among Black and Hispanic workers.</p><p>On the collective leverage side, the WGA and SAG-AFTRA strikes {{cite:3}} produced the first replicable AI contract language in a major U.S. industry: consent requirements for AI replicas, residual payments tied to AI use, and mandatory notification when AI substitutes for covered work. The AFL-CIO's Workers First framework {{cite:76}} (October 2025) represented 63 unions and 15 million workers. In April 2026, the ILO {{cite:107}} adopted its first tripartite conclusions on AI in manufacturing, covering 54 countries and nearly 500 million workers, establishing globally negotiated guidance that no unilateral national framework can match in legitimacy. Singapore's Platform Workers Act 2024 {{cite:167}} and Malaysia's Gig Workers Act establish competing Southeast Asian models for statutory gig worker protection, including CPF contributions, injury compensation, and collective representation. Neither mandates algorithmic transparency on pay calculation, documenting the persistent gap between welfare protections and economic governance of gig work {{citep:158}}.</p>",
    econGaps: [
      "Long-run effects of worker-first AI deployment: the 10%/34% performance finding is from early deployment contexts; whether it persists as AI becomes standard practice and competitive differentiation erodes is unmeasured",
      "Algorithmic transparency in gig law: both the Singapore Platform Workers Act {{cite:167}} and Malaysia's Gig Workers Act fail to require platforms to disclose pay calculation or task assignment algorithms, leaving workers unprotected on the core economic terms of gig work",
      "Enforcement mechanisms for the ILO tripartite manufacturing conclusions {{cite:107}}: adoption language creates a policy timeline, but compliance monitoring is not yet specified and member-state uptake is uncertain",
      "Healthcare and professional sector organizing: gig nursing deregulation and clinical AI surveillance represent the newest frontier of algorithmic management, with collective bargaining infrastructure still underdeveloped",
      "Gig and platform worker legal frameworks for collective action: the WGA/SAG precedents apply to unionized entertainment; replicating them for platform-based independent contractors requires new legal frameworks most jurisdictions have not yet established"
    ],
    implication: "<p><span class='impl-label'>Contract negotiations</span>Collective bargaining remains the most direct and documented lever workers have to shape AI deployment terms, not just wages. The WGA/SAG-AFTRA precedent {{cite:3}} demonstrates that AI governance provisions can be won through contract, even before legislation exists. The ILO tripartite manufacturing conclusions {{cite:107}} extend this logic globally: 54-country negotiated guidance gives labor advocates a legitimacy anchor for demanding AI governance provisions in sectors where domestic union density is low and national legislation is absent. Institutions with labor relationships or labor-adjacent programming should treat AI contract language development as a high-value, near-term investment: the window for establishing precedents in key industries is open now and may close as contracts normalize.</p><p><span class='impl-label'>Surveillance governance</span>The surveillance findings carry a direct institutional implication that extends well beyond warehouses. The EFF bossware data {{cite:102}} and the Data & Society &ldquo;privacy trap&rdquo; analysis {{cite:26}} together document that workers, including knowledge workers at home, are being monitored at scales and through mechanisms they cannot see, under a regulatory vacuum. Institutions engaging in worker rights work should treat surveillance governance as a discrete priority rather than a subcategory of privacy policy: the relevant interventions are notice requirements, proportionality standards, and explicit prohibition on covert installation, not just data breach protections. The dual wage-and-price harm documented by AI Now {{cite:53}} reframes the stakes: surveillance is not only a dignity issue but a material wealth transfer mechanism that warrants economic as well as rights-based framing.</p><p><span class='impl-label'>Beyond wages & employment</span>The algorithmic management data also suggests that institutions tracking worker wellbeing need to look beyond wages and employment rates. Injury frequency, voluntary turnover, and psychological safety are where harm is concentrating in AI-managed environments, outcomes that do not appear in standard labor market indicators but that workers and their advocates are documenting in real time.</p>",
    risk: {
      level: "Medium",
      color: "#D4952A",
      summary: "<p>Legal frameworks governing AI in the workplace lag deployment by years. Workers in algorithmic management environments face measurable harm, elevated injury rates, turnover, and surveillance, with limited legal recourse, and the organizing infrastructure needed to negotiate AI contract terms is underdeveloped outside a handful of industries.</p><p>The risk intensifies in sectors without union density or advocacy infrastructure. Where workers lack the collective capacity to negotiate AI terms, employer discretion over deployment conditions is nearly unchecked, and the harms documented in warehouse and logistics contexts will replicate across industries as algorithmic management tools become cheaper and more accessible.</p>",
      leverage: "<p>The contract record proves AI governance is winnable now: WGA and SAG-AFTRA {{cite:3}} won enforceable AI provisions before any legislation existed, and the ILO's 54-country tripartite conclusions {{cite:107}} give advocates a legitimacy anchor even where union density is low. The window for establishing precedents in key industries is open, and contract language developed now becomes the template other sectors can demand.</p>"
    },
    papers: [266, 228, 3, 7, 110, 76, 26, 47, 53, 64, 102, 104, 107, 150, 151, 153, 158, 167, 180, 187, 189, 202, 219, 220, 221, 222, 223, 224, 229, 237],
  },
  {
    id: "policy",
    color: "#70AD8F",
    tag: "Policy & Regulation",
    lastReviewed: "2026-06-22",
    confidence: "emerging",
    question: "What policy frameworks are emerging — and are they adequate?",
    framing: "The gap between what AI can do and what institutions are required to disclose or prevent is widening faster than any single jurisdiction can close.",
    synthesis: "<p>U.S. AI policy is fragmented and under-enforced. Forty-seven states have no statutory AI disclosure rights for workers, and no federal floor exists for algorithmic transparency. The Trump administration is pursuing aggressive AI industrial policy, accelerating data center permitting while framing it as deregulation, though the 99-1 Senate vote striking the federal preemption moratorium preserved state authority for now {{citep:82}}. CFR {{cite:45}} notes the stakes: as AI moves from experimental to embedded infrastructure, decisions made now will be hard to reverse.</p><p>The strongest near-term track runs through authority that already exists. The EEOC's 2021 initiative {{cite:101}} established that Title VII, ADA, and ADEA govern AI-driven employment decisions, and HUD's 2022 guidance {{cite:122}} extends the principle to housing. The Leadership Conference {{cite:124}} identifies disparate impact doctrine as the most consequential existing instrument for AI accountability, and CAP's mapping of over 80 agency recommendations {{cite:86}} confirms existing statutory authority covers most AI harms. Antitrust runs parallel: Open Markets {{cite:70}} confirms existing statutes suffice for merger blocking and price-fixing prosecution, as the DOJ RealPage settlement showed. The EU AI Act provides the cross-jurisdiction floor, and German Marshall Fund analysis {{cite:113}} argues the transatlantic divide reflects political framing more than structural incompatibility. The recurring constraint is enforcement will and technical capacity, not legal power.</p><p>Government is now an AI deployer as well as a regulator, and accountability has not caught up. The Department of Transportation is using AI to draft regulations in 20 minutes amid historic understaffing {{citep:77}}, and DOGE's AI review of VA contracts analyzed 2,500 words per document against undefined criteria tuned toward maximum cuts {{citep:80}}. The NSF's NAIRR pilot {{cite:38}} offers the counter-model, supporting 600+ research projects across all 50 states as public infrastructure. Military AI sits furthest outside the conversation, with private technologists setting their own risk tolerances under arms-race framing {{cite:52}}.</p><p>The harm record in deployed domains is no longer speculative. The Senate Permanent Subcommittee on Investigations {{cite:96}} documented Medicare Advantage insurers using AI prior authorization to restrict seniors' care, with denial rates nearly doubling after automation. Third-party deployment, the fastest-growing distribution layer, has no binding safety floor {{cite:83}}, and content-licensing self-regulation is failing as bot circumvention quadrupled in six months {{cite:68}}. The democratic risk is empirically grounded: LLM-generated persuasion shifts policy attitudes as effectively as human writing, with over 94% of participants unable to identify AI authorship {{cite:157}}. On labor, Executive Order 14179 rescinded Biden-era AI protections and the EEOC removed its AI hiring guidance {{citep:144}}, while with Trade Adjustment Assistance expired, WIOA is the only federal program for displaced workers and provides no income support {{cite:143}}. States are filling the void: New Jersey's S.1840 {{cite:148}} pairs an AI-financed displacement fund with layoff disclosure, and S.3108 {{cite:145}} would create the first federal reporting of AI job impacts.</p>",
    working: [
      "State regulatory authority survived: the 99-1 Senate vote striking the federal AI preemption moratorium {{citep:82}} preserved the most active governance layer in the country",
      "Existing law already covers much of AI: Title VII, ADA, and ADEA govern AI-driven employment decisions today {{cite:101}}, a regulatory baseline usable without new legislation",
      "Comprehensive state templates exist: New Jersey's S.1840 {{cite:148}} pairs an AI-financed displacement fund with mandatory employer disclosure, and its WD-PY25-14 directive {{cite:147}} integrates AI literacy into federally funded workforce training",
      "The EU AI Act provides a usable reference standard: its high-risk system requirements give U.S. institutions procurement and deployment criteria ahead of domestic regulation"
    ],
    gaps: ["State-level enforcement capacity: laws exist but lack implementation infrastructure", "Accountability frameworks for AI deployed in government decision-making and rulemaking", "Military AI accountability: democratic processes for setting risk tolerances have been bypassed by private technologists; humanitarian law standards are not being applied", "Healthcare insurance AI denial: systematic AI-driven prior authorization denials documented as profit-maximization mechanisms are not addressed by existing AI governance frameworks", "Third-party deployment safety standards: the fastest-growing AI deployment layer has no binding safety floor and users are less protected than on developer-native platforms", "AI persuasion and democratic deliberation: no binding U.S. disclosure or watermarking requirements exist for AI-generated political content; over 94% of citizens in controlled experiments cannot identify LLM-authored messages {{cite:157}}, making detection-based safeguards structurally inadequate"],
    econSynthesis: "<p>The governance architecture for AI is fragmented at every level, federal, state, and international, with documented enforcement gaps larger than the statutory gaps. CAP's mapping of over 80 agency-specific recommendations {{cite:86}} confirms that existing federal statutory authority is sufficient to address most AI harms; the constraint is enforcement will and technical capacity, not legal power. EEOC's 2021 initiative {{cite:101}} established that Title VII, ADA, and ADEA govern AI-driven employment decisions without new legislation; HUD's 2022 guidance {{cite:122}} extended disparate impact doctrine to housing AI. FHFA's 2024 TechSprint {{cite:169}} engaged generative AI in housing finance with equity as a design criterion, building agency technical capacity before supervisory expectations are formalized. The evidence that existing statutory authority is sufficient is simultaneously evidence that its non-use is a policy choice rather than a legal constraint.</p><p>The market failure dimension of AI governance is clearest in two documented cases. Open Markets Institute's content licensing analysis {{cite:68}} documents that AI bots circumventing voluntary access restrictions quadrupled in six months, from 3.3% to 12.9% non-compliance, establishing that industry self-regulation fails by design when the underlying incentive structure is unchanged. The 2025 DOJ RealPage settlement documents that algorithmic pricing coordination among competing landlords is actionable under existing federal antitrust law, establishing an enforcement precedent not yet systematically extended to other algorithmic pricing contexts. The FTC's 2023 staff report on generative AI and the creative economy {{cite:199}} documents structural training data market failures, non-consensual style mimicry and opt-out frameworks that shift compliance burdens onto harmed parties. It asserts existing enforcement authority under FTC Act Section 5. The U.S. Senate PSI investigation of Medicare Advantage AI prior authorization {{cite:96}} documents that UnitedHealthcare's post-acute care denial rate nearly doubled from 10.9% to 22.7% following AI automation. Internal documents show deliberate deprioritization of reducing denial volume due to profit impact, an AI-as-austerity mechanism backed by Senate investigative authority.</p><p>The international dimension introduces two documents with direct U.S. institutional implications. The EU AI Act's prohibited practices applied from February 2025; high-risk AI provisions covering employment decisions take effect August 2026, creating a compliance window for U.S. institutions operating across jurisdictions. The Trump administration's March 2026 National AI legislative framework {{cite:198}} calls for federal preemption of conflicting state AI laws, eliminating 40+ state frameworks, while favoring regulatory sandboxes over new rulemaking bodies. Brookings' Wheeler and Baer {{cite:197}} identify the structural gap: the framework fails to establish accountability for those controlling AI's essential capabilities, leaving the governance question unanswered. Bai et al.'s {{cite:157}} Nature Communications study (N = 4,829, three pre-registered experiments) establishes the empirical floor for democratic governance concerns. LLM-generated messages shifted policy attitudes by 1.81–3.62 points on 101-point scales, statistically indistinguishable from human-authored messages. Over 94% of participants could not identify AI authorship, making detection-based disclosure requirements structurally inadequate as a governance instrument.</p>",
    econGaps: [
      "State-level enforcement capacity: AI-relevant laws are passing but implementation infrastructure is almost entirely absent; the gap between statutory authority and enforcement capability is widening faster than state agencies can close it",
      "Federal mandate for employer reporting of AI job impacts: no systematic data collection on AI-driven workforce displacement currently exists; S.3108 {{cite:145}} proposes to address this but has not passed",
      "Post-TAA income support gap: no federal program provides income maintenance for automation-displaced workers; NJ S.1840 provides a state-level model but coverage is fragmented",
      "Binding disclosure or watermarking requirements for AI-generated political content: detection-based safeguards are structurally inadequate given the 94% misidentification rate documented by Bai et al. {{cite:157}}, but no mandatory standard exists in the U.S.",
      "International regulatory coordination: concrete coordination mechanisms and mutual recognition frameworks between the U.S. and EU remain underdeveloped; the German Marshall Fund finding {{cite:113}} that the divide is less absolute than typically framed has not yet produced operational convergence"
    ],
    implication: "<p><span class='impl-label'>State-level leverage</span>Advocacy for a federal AI worker rights floor is urgent, but the practical near-term leverage lies at the state level, where laws are passing but implementation infrastructure is almost entirely absent. Institutions with policy capacity should prioritize funding enforcement and compliance infrastructure, not just legislation. Building state agency capacity to investigate algorithmic harm is a less visible but more durable investment than supporting additional statutory language.</p><p><span class='impl-label'>EU Act as reference standard</span>The EU AI Act is creating an underappreciated opportunity: its requirements for high-risk AI systems in employment contexts can be used as a reference standard by U.S. institutions that want to establish procurement or deployment criteria ahead of domestic regulation. Institutions should also be skeptical of AI policy proposals, including from major developers, that conflate access-equity goals with market-concentration outcomes. Scrutinizing whose interests a given policy framing actually serves is an essential institutional capacity right now.</p><p><span class='impl-label'>Government AI deployment</span>The government AI deployment cases, transportation rulemaking {{cite:77}} and VA contracts {{cite:80}}, are early signals of a governance gap that will widen as agencies accelerate AI adoption. Institutions should advocate for procurement standards and oversight requirements that apply the same accountability expectations to government AI use as to private deployment: explainability, defined criteria, independent audit, and human review before consequential decisions.</p><p><span class='impl-label'>Military AI</span>Military AI governance is a near-term policy priority that most civil society institutions treat as outside their mandate. Three patterns are documented: private technologists setting risk tolerances without democratic process, urgency framing to lower safety standards, and foundation models deployed in military ISTAR contexts {{cite:52}} ahead of any regulatory framework. Governance failures in this domain have immediate consequences measured in civilian harm and expanded adversarial attack surfaces. Institutions with policy capacity in defense, civil liberties, or technology governance should treat the establishment of democratically-grounded AI risk thresholds and the application of existing international humanitarian law to military AI as concrete near-term asks, not long-term aspirational goals.</p><p><span class='impl-label'>Healthcare AI accountability</span>The healthcare insurance AI case represents a rare instance where AI harm at scale is documented with government investigative authority behind it. The Senate PSI investigation of Medicare Advantage AI prior authorization {{cite:96}} creates a direct policy opening. The documented pattern of AI-driven denial rate doubling as a profit-maximization mechanism, affecting the most vulnerable Medicare beneficiaries, provides evidentiary basis for legislative requirements applying clinical accuracy standards to AI in consequential coverage decisions. Institutions working in healthcare access or consumer protection should treat this as an active enforcement and legislative leverage point rather than a research finding.</p><p><span class='impl-label'>Third-party deployment</span>The third-party AI deployment safety gap requires a structural response that goes beyond recommendations. The documented six-month lapse {{cite:83}} in which no major developer implemented third-party safeguards, while third-party deployments represent the fastest-growing layer of AI distribution, indicates that voluntary compliance will not close this gap. Institutions should support requirements that make developer safety standards non-negotiable floors for API access, that default safety tools on across all deployments, and that establish shared liability for developers and deployers when third-party harms occur. The alternative is a governance architecture in which the AI layer reaching the most users at scale operates with the least accountability.</p>",
    risk: {
      level: "Medium",
      color: "#D4952A",
      summary: "<p>Regulatory fragmentation creates conditions where harmful AI deployments can proceed without oversight or accountability. The core risk is the gap between policy intent and enforcement capacity: laws are passing, but the infrastructure to act on them is largely absent, and this gap is widening faster than state agencies can close it.</p><p>There is also a capture risk: well-resourced AI developers are actively shaping the policy environment in ways that can appear aligned with equity goals while protecting market concentration. Institutions that do not maintain independent policy analysis capacity risk lending legitimacy to frameworks that do not serve their constituencies.</p><p>An underappreciated emerging risk: when government deploys AI in its own decision-making, drafting regulations, reviewing contracts, and processing claims, the accountability mechanisms designed for private AI deployment do not automatically apply. Federal procurement and rulemaking processes are not yet equipped to assess or constrain the AI tools being introduced into them.</p>",
      leverage: "<p>Much of the needed legal authority already exists: EEOC enforcement {{cite:101}}, disparate impact doctrine, and procurement standards are usable today, and the binding constraint is enforcement will and capacity rather than statutory power. State momentum is replicable. New Jersey's S.1840 {{cite:148}} and workforce directive {{cite:147}} provide templates other states can adopt, and funding implementation infrastructure is the highest-leverage investment because laws are passing faster than the capacity to enforce them.</p>"
    },
    papers: [226, 77, 80, 82, 86, 101, 70, 113, 115, 122, 123, 124, 28, 32, 38, 39, 40, 44, 45, 50, 52, 55, 56, 58, 67, 68, 71, 72, 78, 79, 83, 87, 88, 96, 99, 100, 111, 112, 143, 144, 145, 147, 148, 149, 146, 157, 159, 160, 161, 162, 164, 168, 169, 173, 176, 181, 196, 197, 198, 199, 186, 200, 201, 202, 203, 204, 207, 208, 210, 211, 212, 213, 214, 215, 218, 219, 220, 221, 222, 223, 224, 229, 230, 232, 233, 238, 240, 236, 243, 245, 246],
  },
  {
    id: "community",
    color: "#EBC382",
    tag: "Communities & Infrastructure",
    lastReviewed: "2026-06-22",
    confidence: "emerging",
    question: "How is AI infrastructure reshaping specific communities and regions?",
    framing: "AI's physical infrastructure is landing in communities that had no voice in siting decisions, while the economic gains flow elsewhere.",
    synthesis: "<p>AI infrastructure is concentrating in a few regions, led by Pennsylvania, Texas, Virginia, and Ohio. The energy implications are acute: TechCrunch reporting {{cite:155}} documents Microsoft debating whether to abandon its hourly clean-energy matching target as data center expansion outpaces renewable supply, while developing a 5-gigawatt natural gas plant in West Texas. Fossil fuel investment is being treated as a structural operational requirement even at companies with ambitious clean-energy pledges. Community input is routinely bypassed: at least 14 states have passed laws stripping municipal authority over data center siting {{citep:23}}. Large data centers consume 20–50 megawatts of power and millions of gallons of water annually, and are disproportionately sited near communities with limited capacity to negotiate mitigation {{citep:12}}.</p><p>Rural communities face a compounding disadvantage, absorbing automation-driven job loss while being excluded from AI job creation concentrated in metros. Brookings Metro research {{cite:269}} finds the Bay Area and 13 other early-adopter metros accounted for roughly 60% of new generative AI job postings in 2023, all of them large metros. Civic capacity to engage these decisions remains underdeveloped, with most local governments lacking technical staff; AI Now's 2026 North Star Policy Toolkit {{cite:48}} addresses the gap with model state and local legislation. Algorithmic pricing adds direct harm: RealPage's rent-setting software coordinated prices across competing landlords until a 2025 DOJ antitrust settlement established that the practice is actionable under existing law {{citep:65}}.</p><p>Residential technology is restructuring housing access itself. TechEquity Collaborative {{cite:116}} documents rent-setting algorithms, AI tenant screening, and digital-first leasing layering automated barriers onto strained supply, and Eisenberg and Brantley {{cite:119}} show eviction court filings persisting in commercial databases and transmitted to screening systems, compounding instability for years after the proceeding. The political economy is shifting too: Chen and Vipra's &ldquo;The Big AI State&rdquo; {{cite:24}} finds the federal government acting as a deliberate industrial-policy actor, reducing developer risk and acquiring stakes in AI supply-chain companies. When federal policy actively facilitates infrastructure concentration, municipal responses become correspondingly more important, and AI Now's testimony on NYC's MyCity Portal {{cite:57}} shows the stakes when public services are structured around corporate data access.</p>",
    working: [
      "Model legislation is ready to adopt: AI Now's 2026 North Star Policy Toolkit {{cite:48}} provides state and local templates for environmental impact disclosure and benefit agreements",
      "Community benefit agreements work when front-loaded: frameworks established before project approval secure enforceable terms that retrospective mitigation after ground is broken cannot",
      "A distributed governance layer is forming: states and cities are actively building AI oversight in the absence of federal leadership, creating multiple entry points for community advocates"
    ],
    gaps: ["Environmental justice impacts of data center energy and water use", "Municipal governance capacity: most local governments lack AI technical staff", "Rural economic transition data: what happens after a major employer automates", "Corporate capture of public digital infrastructure: standards for evaluating AI-enabled government service platforms against public interest benchmarks", "Utility monopoly conduct and AI energy demand: antitrust enforcement timelines vs. deployment urgency", "AI for housing and homelessness: the 1% of AI investment directed to social impact applications means the sector is severely underresourced; responsible AI frameworks for vulnerable populations in housing and legal contexts are needed before deployment scales"],
    implication: "<p><span class='impl-label'>Two distinct communities</span>Institutions should orient toward two intersecting gaps: communities absorbing AI infrastructure without adequate civic representation or benefit-sharing, and communities experiencing industry displacement without access to AI-driven economic growth. These are two different sets of communities, and the strategies differ materially. For infrastructure-hosting communities, the most productive interventions are civic capacity-building and community benefit agreement frameworks established before projects are approved.</p><p><span class='impl-label'>Rural displacement</span>For economically displaced rural communities, the gap is structural. AI job creation is bypassing them, and workforce retraining without accompanying economic development investment produces skilled workers who leave. Institutions should be cautious about conflating these two groups in program design, and equally cautious about treating data center proximity as economic development. The fiscal benefits are real but often narrowly distributed; the community costs are diffuse and frequently uncompensated.</p><p><span class='impl-label'>Civic capacity building</span>The AI Civics framing has direct implications for institutions designing community engagement. Programs that frame AI as a consumer skill to be individually acquired will produce different, and likely weaker, community outcomes than programs that build collective institutional capacity. That capacity means being able to contest AI decisions, negotiate benefit agreements, and participate in municipal governance processes. The municipal governance momentum documented across 12+ cities suggests that this institutional layer is forming, but unevenly. Institutions should treat civic AI capacity-building as a distinct program category alongside technical literacy efforts. The &ldquo;Big AI State&rdquo; {{cite:24}} finding adds a planning horizon dimension. Communities and institutions should assume federal policy will continue to accelerate infrastructure concentration. That makes local governance frameworks correspondingly more consequential to develop now.</p>",
    risk: {
      level: "Medium",
      color: "#D4952A",
      summary: "<p>Communities absorbing AI infrastructure are doing so without meaningful representation or benefit-sharing frameworks. Environmental and civic costs are real and growing, while economic benefits concentrate in distant metros. The window to establish protective frameworks is narrowing as deployment accelerates and state preemption laws expand the range of decisions communities cannot meaningfully contest.</p><p>For rural communities facing automation-driven displacement, the risk is structural exclusion from the economic upside of AI. Without deliberate intervention, geographic inequality in AI's benefits will compound existing regional economic divergence, producing communities that bear the costs of AI infrastructure while remaining outside the labor markets where AI-driven job creation is occurring.</p>",
      leverage: "<p>The most productive interventions are front-loaded: community benefit agreements and civic capacity-building established before projects are approved, rather than retrospective mitigation after ground is broken. AI Now's North Star toolkit {{cite:48}} provides model state and local legislation, and the state and local layer is where AI governance is actually forming, so early engagement shapes terms while they are still negotiable.</p>"
    },
    papers: [23, 24, 27, 48, 65, 116, 118, 119, 11, 12, 51, 57, 69, 114, 149, 155, 163, 164, 165, 166],
  },
  {
    id: "reskilling",
    color: "#FF8361",
    tag: "Reskilling & Education",
    lastReviewed: "2026-06-22",
    confidence: "contested",
    question: "Is reskilling delivering economic mobility — and for whom?",
    framing: "Reskilling is the default policy response to AI displacement. The evidence that it delivers lasting mobility, especially for those who need it most, is weak.",
    synthesis: "<p>The reskilling consensus is fracturing. Government-funded retraining has a weak evidence base, with most evaluations showing modest short-term wage gains that dissipate within 2–3 years, especially for workers over 45 or without post-secondary credentials {{citep:203}}. Data &amp; Society's &ldquo;404 Job Not Found&rdquo; {{cite:25}} documents the core flaw: workers from disadvantaged backgrounds enroll in AI literacy programs but find they lead only to short-term, low-wage work. Skill-building treated in isolation from housing instability, childcare gaps, and income volatility produces credentials, not mobility. Brookings and Opportunity@Work {{cite:74}} add that AI may sever the advancement routes through entry-level Gateway jobs, leaving workers employed but stripped of career progression.</p><p>The one concrete post-reskilling policy architecture in this theme is Marinescu's &ldquo;Resilient by Design&rdquo; {{cite:35}}, a two-tiered safety net. The first tier is AI Adjustment Insurance: enhanced unemployment, wage insurance, and retraining on existing infrastructure. The second is a contingent Digital Dividend that scales only if AI causes persistent widespread joblessness. On the technology side, Anthropic's usage research {{cite:138}} reveals a deepening expertise gap: experienced users treat AI as a collaborative partner and build compound advantages, while novices offload discrete tasks and capture far less value. Generic literacy programs without scaffolding toward collaborative use may therefore widen the divide they aim to close. Birhane et al. {{cite:103}} add an upstream constraint, finding ML research structurally dominated by performance and novelty, with fewer than 15% of papers connecting to a societal need.</p><p>The structural conditions are hardening. Center for American Progress learning-science analysis {{cite:84}} finds AI in K-12 carries genuine risks of over-reliance, assessment-integrity erosion, and inequitable access that require structured pedagogy rather than open-ended deployment. The Bipartisan Policy Center {{cite:143}} documents that with Trade Adjustment Assistance expired since 2022, WIOA's Dislocated Worker Program is the only federal program for displaced workers, providing career services but no income support and no automation-specific provisions. New Jersey's workforce guidance WD-PY25-14 {{cite:147}} offers a replicable counterpoint, integrating AI literacy into WIOA program design and reframing AI as a workforce asset rather than only a threat.</p>",
    working: [
      "The fix for program failure is documented: pairing training with wraparound support (income stability, childcare, transportation) is the demonstrated difference between credentials and mobility",
      "States can act through existing infrastructure: New Jersey's WD-PY25-14 directive {{cite:147}} integrates AI skills into federally funded WIOA programs without waiting for new federal action",
      "Wage insurance offers a tested complement: NBER evidence {{cite:34}} shows it raises long-run earnings and may self-finance, providing the income support that training-only programs lack"
    ],
    gaps: ["Longitudinal effectiveness data on publicly-funded AI retraining programs", "Employer-led vs. publicly-funded training outcomes compared head-to-head", "Community college and workforce board capacity to deliver credible AI curricula", "K-12 AI integration evidence base: what pedagogical frameworks actually close rather than widen learning gaps", "Implementation pathways for contingent safety net designs (Marinescu): administrative readiness, trigger threshold design, state-level variation"],
    econSynthesis: "<p>The empirical record on retraining programs is systematically weaker than their policy prominence implies. The National JTPA Study, a rigorous randomized controlled trial covering 1987–1992, found that participants did not see a statistically significant improvement in employment rates, earnings, or continuous employment. A subsequent WIA evaluation found no positive earnings or employment impacts in the 30 months following enrollment. Today's WIOA programs report 70% employment rates, but these lack control groups, making causal inference impossible. Jacobs' 2025 Brookings analysis {{cite:203}} identifies three structural barriers. The first is insufficient job availability: technological advancement may reduce skilled middle-wage openings faster than workers can retrain. The second is participation barriers: displaced workers disproportionately face poverty, caregiving, and housing instability that prevent sustained engagement. The third is demand unpredictability: identifying which skills will retain value as AI capability evolves is genuinely difficult.</p><p>Trade Adjustment Assistance provides the best available natural experiment on scale and reach. Leibenluft's 2026 analysis for the Washington Center for Equitable Growth {{cite:201}} documents that TAA reached roughly 130,000 workers per year in 2004–2006, against an estimated 2 million jobs lost to China trade shocks in the same period. That is a structural coverage failure independent of program design quality. Benjamin Hyman's Census-data analysis finds TAA participants earned approximately $50,000 more over 10 years post-retraining compared to non-participants, establishing that the program works for those it reaches. Program design and program reach are separable problems, and evidence on the former cannot substitute for analysis of the latter.</p><p>Hyman, Kovak, and Leive's NBER wage insurance study provides the most actionable positive evidence. Within Trade Adjustment Assistance, wage insurance increased short-run employment probability and raised long-run cumulative earnings by shortening non-employment spells. It also appeared financially self-sustaining through reduced benefit duration and increased tax contributions. TAA expired in 2022 without renewal, leaving WIOA's Dislocated Worker Program as the only federal program for displaced workers {{citep:143}}. That program provides career services and training with no income support and no automation-specific provisions. Leibenluft's three design principles for any AI-era adjustment program provide the clearest available framework from the historical record. Commitment means stable, guaranteed programs immune to political bargaining. Speed means presumptive eligibility to prevent earnings-damaging non-employment spells. Agency means worker control over adjustment pathways rather than impersonal bureaucratic channeling.</p>",
    econGaps: [
      "Randomized evidence on AI-specific retraining: all rigorous evaluations (JTPA, WIA) predate LLM-era displacement; no RCT exists for technology-displaced workers in the current AI context",
      "Demand forecasting for AI-resilient skills: identifying which occupations will retain value as AI capability evolves remains genuinely difficult; programs training workers for the wrong skills will replicate the TAA coverage problem with new content",
      "Post-TAA income support gap: no federal program provides income maintenance for automation-displaced workers since TAA expired in 2022; state-level models (NJ S.1840) are emerging but coverage is fragmented and uneven",
      "Presumptive eligibility mechanisms: the speed principle requires administrative infrastructure most states do not currently have; the gap between policy design and implementation capacity is largely unmeasured",
      "Employer-led versus publicly-funded training outcomes: the relative effectiveness of these models under AI displacement conditions is not established; WIOA relies heavily on employer partnership without controlled comparison to public provision"
    ],
    implication: "<p><span class='impl-label'>Wraparound support</span>Institutions that fund AI skills training without addressing the structural conditions that make sustained learning impossible will produce credentials without mobility. Those conditions are income instability, caregiving responsibilities, and transportation access. The evidence is clear enough that wraparound support should be treated as core program infrastructure, not a supplemental add-on. Program designs that assume participants can absorb new technical skills while managing housing insecurity or shift-based schedules are failing by design rather than because of participant deficits.</p><p><span class='impl-label'>Safety net design</span>The Marinescu dual safety net finding {{cite:35}} has direct policy design implications. Institutions engaged in workforce policy advocacy should assess whether their positions on safety net reform accommodate a contingent structure. Such a structure is fiscally defensible now and scalable if disruption exceeds projections. The two-tier architecture's political viability depends on separating the near-term question (adequate transition support) from the long-term question (income maintenance under persistent joblessness). Most current policy frameworks conflate the two. Institutions that conflate them will find advocacy coalition-building harder than necessary.</p><p><span class='impl-label'>AI tool deployment</span>The Anthropic usage data {{cite:29}} carries a direct institutional implication. If AI tools amplify existing expertise gaps, then deploying AI within programs serving lower-skill populations without deliberate scaffolding may actively widen the gap institutions are trying to close. Institutions should assess not just whether their constituents have access to AI tools, but how they are using them. They should design learning environments that build toward the collaborative, iterative usage patterns associated with durable skill and earnings gains. The Birhane et al. {{cite:103}} finding adds a procurement dimension. Institutions selecting AI tools for reskilling programs should probe whether the tools they are deploying were designed for commercial performance metrics or for the learning outcomes they actually need. The two are structurally misaligned in the current ML research paradigm.</p><p><span class='impl-label'>K–12 & infrastructure</span>The K-12 and digital divide findings extend the reskilling frame upstream. Interventions focused only on adult workforce retraining are addressing the symptom while the source widens. Institutions with education programming should treat digital infrastructure access and structured AI pedagogy in K-12 as workforce development investments, not separate policy tracks. The CAP Department of Education findings {{cite:84}} add a civil rights compliance dimension. Institutions deploying AI in educational settings, including workforce training, should affirmatively assess disability and civil rights impacts before deployment. They should also ensure that AI-assisted advising systems are held to accuracy standards comparable to human counselors. A student who reaches the labor market without reliable connectivity, AI exposure, or the scaffolded skills to use AI collaboratively faces compounded disadvantage that no post-secondary retraining program is designed to remedy.</p>",
    risk: {
      level: "Medium",
      color: "#D4952A",
      summary: "<p>Reskilling programs fail predictably and at scale, not merely at the margins, while being treated as sufficient responses to structural displacement. Resources directed toward training without wraparound support produce credentials without mobility, and may displace more effective systemic interventions by appearing to address the problem.</p><p>The AI usage gap adds a compounding risk: generic literacy programs that do not build toward collaborative, iterative AI use may actually widen skill gaps among participants. Institutions investing in workforce programming without evaluating usage quality, not just access, risk funding programs that accelerate the divergence they are designed to close.</p>",
      leverage: "<p>The failure mode is known and therefore fixable: pairing training with wraparound support (income stability, childcare, transportation) is the documented difference between credentials and mobility. New Jersey's workforce directive {{cite:147}} shows states can integrate AI skills through existing WIOA infrastructure without new federal action, and wage insurance offers a tested, fiscally defensible complement that scales if disruption exceeds projections.</p>"
    },
    papers: [17, 84, 85, 29, 74, 25, 35, 90, 103, 143, 147, 195, 201, 203, 207, 208, 210, 211, 212, 231],
  },
  {
    id: "experience",
    color: "#472B51",
    tag: "Worker Experience",
    lastReviewed: "2026-06-22",
    confidence: "contested",
    question: "What do affected workers and communities actually want and fear?",
    framing: "What workers say they feel about AI and what happens to them under AI management are two different stories. Institutions need to hear both.",
    synthesis: "<p>Anthropic's 80,508-person global study {{cite:29}} found that hope and alarm about AI coexist within individuals, not between demographic camps, challenging the framing that separates optimists from skeptics by education, income, or ideology. Jobs and economic displacement rank as the second-most-cited concern globally (22.3%), and lower-income regions show higher net-positive sentiment than wealthy Western nations, reversing the assumption that marginalized communities are uniformly resistant to AI.</p><p>Aspirational sentiment diverges sharply from ground-level experience. In algorithmic management environments, MIT Work of the Future research {{cite:7}} shows injury rates and voluntary turnover up 34%, alongside elevated stress and reduced autonomy, and the pattern now extends into healthcare as clinicians face algorithmic performance management. ILO Working Paper 170 {{cite:106}} frames AI-driven surveillance, work intensification, and erosion of autonomy as a cluster of psychosocial hazards that occupational safety frameworks, still oriented toward physical risks, are unequipped to govern. Qualitative research documents that workers often adapt to or internalize AI management norms even when experiencing measurable harm, which makes survey-based sentiment a poor proxy for on-the-ground conditions.</p><p>Even where AI is experienced as empowering, the picture is mixed. APA research on always-on work culture {{cite:13}} finds AI tool adoption correlates with 1.8 more working hours per week and declining detachment from work, a productivity paradox in which high adopters report higher satisfaction despite longer hours. HBR and BCG research {{cite:156}} documents &ldquo;brain fry,&rdquo; a cognitive overload specific to the speed and volume of AI outputs. A distinct worker population sits outside both literatures: Sarah Roberts's ethnography of commercial content moderation {{citep:14}} documents moderators reporting lasting psychological harm, with outsourced Global South moderators lacking the mental-health resources provided to direct employees. Underlying all of it, Brian Merchant's &ldquo;AI Generated Business&rdquo; {{cite:54}} documents that enterprise AI sales explicitly center labor replacement, and AI Now's &ldquo;Artificial Power 2025&rdquo; {{cite:42}} situates individual experience inside a structural concentration of control in a few vertically integrated companies.</p>",
    working: [
      "Openness to AI is broader than assumed: Anthropic's 80,508-person global study {{cite:29}} found hope and alarm coexist within individuals rather than between demographic camps, leaving room for worker-shaped deployment",
      "Satisfaction gains are real where AI removes drudgery: high adopters report higher job satisfaction driven by perceived competence gains and task variety, though the research cautions this pattern may not persist as boundary erosion accumulates",
      "Participatory methods are producing evidence surveys miss: DAIR and others have demonstrated that community-grounded research with affected workers surfaces harms and adaptations that aggregate sentiment data structurally underrepresents"
    ],
    gaps: ["Longitudinal wellbeing studies under AI management over 2+ years", "Qualitative research centered on marginalized and low-wage worker voices", "Psychological safety in AI-intensive workplaces: burnout, surveillance stress", "Knowledge worker boundary erosion under AI adoption: longitudinal data on whether satisfaction-despite-longer-hours persists or reverses over time", "Mental health support standards for outsourced content moderation: regulatory gap between direct employee requirements and contractor coverage"],
    implication: "<p><span class='impl-label'>Reading the data</span>Aggregate sentiment data, including the Anthropic global study {{cite:29}}, should not be used as a proxy for ground-level impact. Positive AI sentiment and measurable workplace harm can coexist without contradiction. The pattern reflects the difference between abstract hopes and lived conditions under specific deployment contexts. Institutions relying primarily on survey-based sentiment to assess AI's effects on their constituencies risk systematically missing where harm is actually concentrating.</p><p><span class='impl-label'>Internal operations</span>The APA finding on always-on work culture {{cite:13}} has immediate implications for institutions deploying AI tools in their own operations. Satisfaction and hours are moving together among high AI adopters, but that pattern may not persist. Workers reporting higher satisfaction despite longer hours may be in an early adoption phase where competence gains are salient before accumulated boundary erosion becomes the dominant experience. Institutions should monitor boundary and detachment measures among AI-intensive staff alongside productivity outcomes. They should resist treating early satisfaction data as evidence that the hours expansion is benign.</p><p><span class='impl-label'>Underserved populations</span>The content moderation finding identifies a population institutions rarely reach through workforce programming. Outsourced moderators in the Global South experience AI-amplified occupational trauma without any of the mental health resources that direct employees receive. Institutions with international programming or labor standards advocacy should treat this as a distinct gap. The disparity is structural rather than incidental, and existing occupational health frameworks do not address it.</p><p><span class='impl-label'>Structural framing</span>The Merchant {{cite:54}} and AI Now {{cite:42}} structural findings have a reframing implication. Worker experience programs that focus only on skill acquisition or sentiment, without addressing the concentration of power over AI systems, are operating at the wrong level of analysis. Workers navigating AI-as-replacement corporate framing and declining democratic agency over working conditions need advocacy at the governance and structural level, not only training or wellbeing support. Community-based participatory research with affected worker populations is both a methodological and legitimacy imperative. Workers in AI-managed environments have detailed, actionable knowledge that neither sentiment surveys nor productivity metrics capture. Institutions should invest in research partnerships with the communities they serve, not just research conducted about them.</p>",
    risk: {
      level: "Medium",
      color: "#D4952A",
      summary: "<p>Using aggregate sentiment as a proxy for worker wellbeing risks systematically underestimating concentrated harm. Institutions that rely primarily on survey data without participatory research may make program and resource decisions that miss or inadvertently worsen conditions for the most affected workers.</p><p>The normalization dynamic documented by DAIR and others, where workers adapt to or internalize AI management harm rather than report it, means the risk is likely undercounted in standard data sources. Institutions that do not invest in direct, community-grounded research will be operating on evidence that structurally underrepresents the populations they aim to serve.</p>",
      leverage: "<p>The sentiment data contains an opening: hope and alarm coexist within the same individuals, meaning openness to AI runs broader than the harm record would predict, and workers respond to deployment terms they can trust. High adopters report real satisfaction gains where AI removes drudgery. Community-based participatory research gives institutions a near-term method for designing deployments around lived worker experience rather than survey averages.</p>"
    },
    papers: [3, 7, 14, 106, 29, 5, 6, 13, 42, 43, 54, 73, 151, 153, 156, 209, 216, 217, 230, 231],
  },
  {
    id: "macro-risk",
    color: "#3A6186",
    tag: "Macroeconomic Risk",
    lastReviewed: "2026-06-22",
    confidence: "contested",
    question: "Is AI creating systemic financial and distributional risk — speculative bubble, market concentration, and permanent inequality — faster than markets and institutions can manage?",
    framing: "AI is generating two irreconcilable forecasts simultaneously: the most optimistic productivity projections in modern economic history and the most significant speculative bubble since dot-com. Both cannot be right. The institutions making irreversible decisions now are doing so inside that unresolved uncertainty.",
    synthesis: "<p>The macroeconomic narrative is defined by a gap between two poles that cannot both be correct. On the optimistic side, McKinsey {{cite:15}} estimates generative AI could unlock $2.6–4.4 trillion annually. Goldman Sachs {{cite:16}} projects a 7% global GDP boost while exposing 300 million full-time jobs to automation, and the World Economic Forum {{cite:62}} projects a net gain of 78 million jobs by 2030. BCG {{cite:75}} concludes 50–55% of U.S. jobs will be meaningfully reshaped within two to three years. On the skeptical side, Acemoglu's &ldquo;Simple Macroeconomics of AI&rdquo; {{cite:61}} argues only about 5% of AI-exposed tasks are both automatable and financially viable, projecting productivity gains under 0.5% over a decade, orders of magnitude below the optimistic figures. Organizations are making irreversible investment decisions inside that unresolved range.</p><p>The financial dimension compounds the uncertainty. Open Markets Institute {{cite:200}} documents speculative-bubble characteristics exceeding prior cycles. Eight tech companies valued at $22 trillion represent 36% of the S&amp;P 500, and combined tech equity equals 354% of GDP versus 210% at the 2000 peak. Five hyperscalers planned $770 billion in 2026 capital expenditures against only $25 billion in 2025 AI revenue, a 31:1 ratio. Suspect accounting, circular financing, and aggressive chip-depreciation timelines may understate major tech expenses by up to $176 billion over three years.</p><p>Market concentration translates financial risk into structural risk. The Google antitrust case shows that AI embedding in distribution infrastructure creates barriers behavioral remedies cannot address, with generative AI integration reinforcing distribution advantages standalone firms cannot erode {{citep:160}}. Brookings' Wheeler and Baer {{cite:197}} document the governance gap: Big Tech made consequential AI decisions with little transparency, and current federal policy fails to establish accountability for those controlling AI's essential capabilities.</p><p>The distributional dimension makes the risk global and structural. ILO's Mind the AI Divide {{cite:105}} documents that adoption prerequisites are unevenly distributed enough to bifurcate the global economy, and Kuwait data {{cite:109}} shows large enterprises adopting at three times the rate of small firms, so aggregate statistics overstate how evenly AI is spreading. IDC's baseline {{cite:152}} shows automation crossed from pilot to structural years before labor statistics reflected it. Most starkly, existing institutions, labor markets, tax systems, and safety nets were built for technological change that creates new labor demand. Global dividend, UBI, and sovereign wealth fund proposals are early responses, but each requires international coordination no institution currently has the capacity to deliver {{citep:30}}. That roughly 60% of Americans report paid work as essential to their identity {{citep:33}} suggests income replacement alone would not resolve the disruption of large-scale displacement.</p>",
    working: [
      "Net job projections remain positive: WEF {{cite:62}} projects 170 million new roles against 92 million displaced by 2030, a net gain of 78 million jobs",
      "Antitrust enforcement is engaging AI concentration: the Google search case {{cite:160}} put on the record that AI embedding in distribution infrastructure is self-reinforcing, giving future structural remedies an evidentiary foundation",
      "Early institutional responses are on the table: global dividend systems, UBI variants, and sovereign wealth fund models give policymakers concrete starting points for capturing and redistributing AI productivity gains, though each still requires coordination capacity that does not yet exist"
    ],
    gaps: ["Validated methodology for distinguishing optimistic (McKinsey/Goldman) from pessimistic (Acemoglu) productivity projections: both rest on assumptions about AI capability generalization that have not yet been tested at macro scale", "Bubble deflation scenarios: the Open Markets analysis {{cite:200}} identifies bubble characteristics but no agreed threshold exists for when to act, what orderly unwinding looks like, or what second-order effects on the broader economy an AI market correction would produce", "Small business vs. large enterprise divergence: size-stratified AI readiness means headline adoption statistics systematically overrepresent larger enterprises, and the majority of workers and firms face conditions largely absent from current macro projections", "Global South economic impact: international distributional effects on developing economies remain poorly measured; the ILO AI Divide analysis {{cite:105}} establishes the structural risk but cannot yet quantify the likely divergence in AI-era GDP trajectories", "Market concentration accountability: no governance framework addresses the accountability gap for decisions made by dominant AI platform operators that affect broader economic outcomes across dependent sectors", "New task creation rates: the historical productivity mechanism (automation displaces jobs while new task creation absorbs workers) depends on AI generating new human-labor-intensive work; no systematic measurement exists for whether AI is creating new tasks at historical rates or below them"],
    econSynthesis: "<p>The AI sector currently exhibits speculative bubble characteristics that exceed prior cycles on multiple financial metrics. Open Markets Institute's 2026 analysis {{cite:200}} documents: eight U.S. tech companies collectively valued at $22 trillion represent 36% of the S&P 500, exceeding dot-com peak concentration. Combined public and private tech equity equals 354% of GDP versus 210% at the 2000 peak. Five hyperscalers plan $770 billion in 2026 AI capital expenditures against only $25 billion in 2025 AI-related revenue, a 31:1 investment-to-revenue ratio. AI infrastructure debt grew 7x year-over-year to $125 billion in the first ten months of 2025. Suspect accounting practices, circular financing between interconnected companies, special-purpose vehicles, and chip depreciation timelines of 5–6 years against actual 2–3 year replacement cycles, may collectively understate major tech expenses by up to $176 billion over three years.</p><p>The productivity uncertainty range underlying these valuations is extraordinary. McKinsey {{cite:15}} projects $2.6–4.4 trillion annually in AI productivity value; Goldman Sachs {{cite:16}} estimates a 7% global GDP gain. Acemoglu's task-level analysis {{cite:61}} constrains this sharply: only approximately 5% of AI-exposed tasks are both technically automatable and economically viable at current costs, projecting TFP gains under 0.53% over a decade. These estimates reflect fundamentally different assumptions about capability generalization that have not yet been tested at macro scale. Institutions making irreversible investment decisions are doing so inside that unresolved range.</p><p>Market concentration translates financial risk into structural economic risk. Google antitrust analysis establishes that AI embedding in distribution infrastructure creates competitive barriers behavioral remedies cannot address: search data access and AI integration reinforce each other in ways that prohibitory conduct restrictions leave intact {{citep:160}}. The ILO's Mind the AI Divide {{cite:105}} documents that AI adoption prerequisites, digital infrastructure, specialized skills, and regulatory capacity, are distributed in ways that could permanently bifurcate the global economy between AI-integrated and AI-excluded nations. Kuwait private-sector data finds large enterprises adopt AI at rates three times those of small firms, a size-stratified pattern replicating across Western economies, meaning aggregate adoption statistics systematically overrepresent large-enterprise experience while masking the majority of workers' actual exposure conditions {{citep:109}}. IDC's 2022 enterprise baseline {{cite:152}} established that 40% of business processes were already automated and digital business had reached 50% of total enterprise activity globally, confirming AI-driven automation crossed from pilot to structural years before labor market statistics reflected it.</p>",
    econGaps: [
      "Validated methodology for distinguishing optimistic from pessimistic productivity projections: both rest on assumptions about AI capability generalization not yet tested at macro scale",
      "Bubble deflation scenarios: no agreed threshold exists for when to act, what orderly unwinding looks like, or what second-order effects an AI market correction would produce on the broader economy",
      "Small business versus large enterprise divergence: size-stratified AI readiness means headline adoption statistics systematically overrepresent larger enterprises, and most workers and firms face conditions largely absent from current macro projections",
      "Accounting transparency: circular financing, non-standard depreciation, and special-purpose vehicle structures may significantly distort the financial picture; no regulatory standard requires the transparency needed to assess sector-wide financial stability",
      "New task creation rates: the historical productivity mechanism depends on AI generating new human-labor-intensive work; no systematic measurement exists for whether AI is creating new tasks at historical rates or below them"
    ],
    implication: "<p><span class='impl-label'>Investment and planning risk</span>The most important institutional implication of the macroeconomic risk picture is epistemic: the uncertainty range between optimistic and pessimistic productivity projections is extraordinarily wide. Organizations are currently making irreversible infrastructure investment and program decisions inside that uncertainty. Institutions that have committed resources based on McKinsey {{cite:15}} or Goldman Sachs {{cite:16}} projections face a materially different strategic environment if Acemoglu's {{cite:61}} constrained productivity estimates prove more accurate. Planning for multiple displacement scenarios rather than committing to a single forecast is not hedging. It is the only defensible approach given the current state of evidence.</p><p><span class='impl-label'>Speculative finance exposure</span>The Open Markets speculative bubble analysis {{cite:200}} provides concrete financial intelligence for governance and investment decisions. Institutions in the philanthropic and nonprofit space whose programs depend on AI tools, AI-enabling partnerships, or AI company relationships face concentrated risk if the speculative cycle reverses. The 31:1 capex-to-revenue ratio and dot-com-era market concentration levels are documented present-tense conditions that governance fiduciaries should be able to account for. Organizations should assess their AI-adjacent financial exposures with the same rigor applied to any concentrated sector exposure, and should avoid treating AI company partnerships or subsidized AI tool access as structurally stable revenue assumptions.</p><p><span class='impl-label'>Concentration and accountability</span>Market concentration is simultaneously an economic risk and a governance risk. If AI productivity gains that do materialize concentrate in a small number of dominant platform operators, as Google's search case {{cite:160}} documents is already happening. The distributional question of who captures AI's economic value will be answered by market structure rather than policy design. Some institutions can support competition enforcement, structural accountability for AI market concentration, and regulatory frameworks that treat AI platforms as utilities in sectors where they function as infrastructure. Those efforts address both the economic risk and the governance vacuum that enables it.</p><p><span class='impl-label'>Global distributional framing</span>The missing institution problem frames a policy design challenge that domestic workforce and safety net programs cannot solve alone. Institutions engaged in international development, trade policy, or multilateral governance work should treat the distributional dimension of AI, who captures productivity gains across countries, not just workers, as a near-term strategic priority. The risk is already concrete. The ILO AI Divide data {{cite:105}} establishes that the infrastructure and skill prerequisites for AI adoption are already unevenly distributed in ways that will compound over the AI adoption cycle. The institutional gap (no multilateral mechanism for AI dividend redistribution) is structural rather than a consequence of insufficient political will.</p>",
    risk: {
      level: "High",
      color: "#C0392B",
      summary: "<p>The combination of speculative bubble characteristics at unprecedented scale, market concentration with no adequate regulatory response, and a distributional gap with no institutional mechanism to address it constitutes a systemic macroeconomic risk, not a sector-specific concern. The bubble risk and concentration risk are mutually reinforcing: if the AI sector corrects, the concentration of ownership means losses will be felt unevenly, while the concentration of productive AI infrastructure in a small number of firms means the recovery will also be uneven.</p><p>The uncertainty range in productivity projections is itself a risk: institutions, governments, and workers are making decisions with long-term consequences inside an epistemic gap that may not resolve until outcomes are visible. Acting as if the optimistic projections are correct when they may not be, or dismissing displacement risk because the pessimistic projections are more reassuring, both represent failures of risk management rather than defensible positions under uncertainty.</p>",
      leverage: "<p>Scenario planning is cheap relative to the cost of betting on a single forecast: institutions can hold the optimistic and pessimistic projections simultaneously and invest in instruments that perform across both, such as wage insurance and adjustment capacity. Antitrust is a live lever, as the Google search case {{cite:160}} demonstrates that concentration is contestable with existing tools, and the distributional question of who captures productivity gains remains open to policy influence.</p>"
    },
    papers: [267, 225, 227, 15, 16, 61, 62, 75, 105, 109, 30, 33, 152, 160, 191, 192, 197, 200, 229, 230, 231, 232, 241, 242],
  },
];
THEMES.sort((a, b) => a.tag.localeCompare(b.tag));

function calcStatus(entry) {
  if (entry.status && STATUS_META[entry.status]) return entry.status;
  const dayMs = 86400000;
  // "Recent" = new to the tracker (intake age); Current/Older = publication age.
  const addedAge = (Date.now() - new Date((entry.added || entry.date) + 'T00:00:00').getTime()) / dayMs;
  if (addedAge < 30) return "emergent";
  const pubAge = (Date.now() - new Date(entry.date + 'T00:00:00').getTime()) / dayMs;
  if (pubAge < 540) return "current";
  return "stale";
}

const INST_META = {
  // ── AI Industry ───────────────────────────────────────────────
  "Anthropic":                                    { url: "https://www.anthropic.com",                                      type: "AI lab",                    note: "Industry-funded, safety-focused"                          },
  "OpenAI":                                       { url: "https://openai.com",                                             type: "AI lab",                    note: "Industry-funded, policy-active"                           },
  "OpenAI / University of Pennsylvania":          { url: "https://openai.com",                                             type: "AI lab / University",       note: "Industry-academic partnership"                            },
  // ── Academic & Economic Research ─────────────────────────────
  "Stanford HAI":                                 { url: "https://hai.stanford.edu",                                       type: "University research",       note: "Academic, AI policy and ethics focus"                     },
  "NBER":                                         { url: "https://www.nber.org",                                           type: "Economic research network", note: "Academic, nonpartisan"                                    },
  "NBER Working Paper":                           { url: "https://www.nber.org",                                           type: "Economic research network", note: "Academic, nonpartisan"                                    },
  "MIT Work of the Future Task Force":            { url: "https://workofthefuture.mit.edu",                                type: "University research",       note: "Academic, nonpartisan"                                    },
  "MIT Work of the Future":                       { url: "https://workofthefuture.mit.edu",                                type: "University research",       note: "Academic, nonpartisan"                                    },
  "Cornell ILR School":                           { url: "https://www.ilr.cornell.edu",                                    type: "University",                note: "Academic, labor relations focus"                          },
  "Brookings Institution":                        { url: "https://www.brookings.edu",                                      type: "Think tank",                note: "Centrist, philanthropically funded"                       },
  "Brookings Metro":                              { url: "https://www.brookings.edu",                                      type: "Think tank",                note: "Centrist, urban and regional policy focus"                 },
  "Opportunity@Work & Brookings Metro":           { url: "https://www.brookings.edu",                                      type: "Research collaboration",    note: "Workforce development and regional policy"                 },
  "New England Journal of Medicine":              { url: "https://www.nejm.org",                                           type: "Academic journal",          note: "Peer-reviewed, nonpartisan"                               },
  "Council on Foreign Relations":                 { url: "https://www.cfr.org",                                            type: "Think tank",                note: "Centrist, foreign policy and international affairs"        },
  "arXiv":                                        { url: "https://arxiv.org",                                              type: "Preprint repository",       note: "Open-access, not peer-reviewed"                           },
  // ── Critical Technology Research ─────────────────────────────
  "AI Now Institute":                             { url: "https://ainowinstitute.org",                                     type: "Research institute",        note: "Critical AI studies, progressive"                         },
  "AI Now Institute et al.":                      { url: "https://ainowinstitute.org",                                     type: "Research institute",        note: "Critical AI studies, progressive"                         },
  "AI Now Institute, Aapti Institute, The Maybe": { url: "https://ainowinstitute.org",                                     type: "Research consortium",       note: "Critical AI studies, global perspective"                   },
  "Data & Society":                               { url: "https://datasociety.net",                                        type: "Research institute",        note: "Independent nonprofit, critical technology studies"        },
  "Data and Society Research Institute":          { url: "https://datasociety.net",                                        type: "Research institute",        note: "Independent nonprofit, critical technology studies"        },
  "Georgetown CSET":                              { url: "https://cset.georgetown.edu",                                    type: "Research institute",        note: "Technology and national security, nonpartisan"             },
  "Upturn":                                       { url: "https://www.upturn.org",                                         type: "Civil society research",    note: "Racial and tech justice focus, progressive"                },
  // ── Policy & Think Tanks ──────────────────────────────────────
  "Economic Policy Institute":                    { url: "https://www.epi.org",                                            type: "Think tank",                note: "Labor-aligned, progressive economic policy"               },
  "Center for American Progress":                 { url: "https://www.americanprogress.org",                               type: "Think tank",                note: "Democratic-affiliated, progressive policy"                 },
  "Open Markets Institute":                       { url: "https://www.openmarketsinstitute.org",                           type: "Policy advocacy",           note: "Anti-monopoly, progressive"                               },
  "Open Markets Institute & Mozilla":             { url: "https://www.openmarketsinstitute.org",                           type: "Policy advocacy",           note: "Anti-monopoly, progressive"                               },
  "Open Markets Institute & Mission:data Coalition": { url: "https://www.openmarketsinstitute.org",                        type: "Policy advocacy",           note: "Anti-monopoly, progressive"                               },
  "American Economic Liberties Project":          { url: "https://www.economicliberties.us",                               type: "Policy advocacy",           note: "Anti-monopoly, progressive"                               },
  "International Labour Organization":            { url: "https://www.ilo.org",                                            type: "International organization",note: "UN agency, pro-worker mandate"                            },
  "OECD Competition Committee":                   { url: "https://www.oecd.org",                                           type: "International organization",note: "Multilateral, developed-country focus"                     },
  "World Economic Forum":                         { url: "https://www.weforum.org",                                        type: "International body",        note: "Business-government forum, pro-globalization"              },
  "European Parliament Research Service":         { url: "https://www.europarl.europa.eu/thinktank/en/home.html",         type: "Government research body",  note: "EU institutional, nonpartisan"                            },
  "U.S. National Science Foundation":             { url: "https://www.nsf.gov",                                            type: "Federal agency",            note: "Government, nonpartisan"                                  },
  "Tony Blair Institute for Global Change":       { url: "https://institute.global",                                       type: "Think tank",                note: "Third Way politics, centrist"                             },
  "Centre for Future Generations":                { url: "https://cfg.eu",                                                  type: "Think tank",                note: "Long-termist, European"                                   },
  "Digitalist Papers":                            { url: "https://www.digitalistpapers.com",                               type: "Policy journal",            note: "Academic-adjacent, pluralist"                             },
  "The Bully Pulpit":                             { url: "https://bharatramamurti.substack.com",                           type: "Policy commentary",         note: "Progressive, independent"                                 },
  "Tech Policy Press":                            { url: "https://techpolicy.press",                                       type: "Policy journalism",         note: "Independent, technology policy focus"                     },
  "Resources for the Future / Lincoln Institute": { url: "https://www.rff.org",                                            type: "Think tank",                note: "Environmental policy, nonpartisan"                        },
  // ── Labor & Workers' Rights ───────────────────────────────────
  "AFL-CIO":                                      { url: "https://aflcio.org",                                             type: "Labor federation",          note: "Labor-movement aligned, 63 affiliated unions"             },
  "Writers Guild of America":                     { url: "https://www.wga.org",                                            type: "Labor union",               note: "Labor-movement aligned, entertainment sector"             },
  "National Employment Law Project":              { url: "https://www.nelp.org",                                           type: "Worker advocacy",           note: "Labor-movement aligned, progressive"                      },
  "Luddite Lab / DAIR Institute":                 { url: "https://labor.dair-institute.org",                               type: "Worker advocacy research",  note: "DAIR Institute project; resource hub for unions resisting AI deployment, with case studies and primers" },
  // ── Civil Rights & Equity ─────────────────────────────────────
  "National Consumer Law Center":                 { url: "https://www.nclc.org",                                           type: "Consumer advocacy",         note: "Consumer rights focus, progressive"                       },
  "National Fair Housing Alliance":               { url: "https://nationalfairhousing.org",                                type: "Civil rights advocacy",     note: "Progressive, housing and equity focus"                    },
  "American Psychological Association":           { url: "https://www.apa.org",                                            type: "Professional association",  note: "Scientific, nonpartisan"                                  },
  // ── Civil Liberties & Digital Rights ────────────────────────
  "Electronic Frontier Foundation":               { url: "https://www.eff.org",                                            type: "Civil liberties nonprofit",  note: "Digital rights focus, advocacy-oriented"                  },
  "Georgetown Law Center on Privacy & Technology":{ url: "https://www.law.georgetown.edu/privacy-technology-center/",     type: "University research",        note: "Academic, civil liberties and surveillance focus"         },
  // ── Federal Agencies & Government ────────────────────────────
  "U.S. Equal Employment Opportunity Commission": { url: "https://www.eeoc.gov",                                           type: "Federal agency",             note: "Federal civil rights enforcement"                         },
  "U.S. Senate Permanent Subcommittee on Investigations": { url: "https://www.hsgac.senate.gov/subcommittees/investigations/", type: "Government oversight", note: "Federal legislative oversight body"                      },
  // ── Academic Journals ─────────────────────────────────────────
  "Nature Communications":                        { url: "https://www.nature.com/ncomms",                                  type: "Academic journal",           note: "Peer-reviewed, Springer Nature, multidisciplinary"        },
  "Journal of Economic Perspectives":             { url: "https://www.aeaweb.org/journals/jep",                            type: "Academic journal",           note: "Peer-reviewed, American Economic Association"             },
  "Science":                                      { url: "https://www.science.org",                                        type: "Academic journal",           note: "Peer-reviewed, multidisciplinary"                         },
  "NYU Law Review":                               { url: "https://www.nyulawreview.org",                                   type: "Academic journal",           note: "Peer-reviewed, nonpartisan"                               },
  "Philosophy & Technology":                      { url: "https://link.springer.com/journal/13347",                        type: "Academic journal",           note: "Peer-reviewed, technology ethics"                         },
  "ACM FAccT":                                    { url: "https://facctconference.org",                                    type: "Academic conference",        note: "Peer-reviewed, AI fairness and accountability"            },
  // ── Investigative Journalism ──────────────────────────────────
  "ProPublica":                                   { url: "https://www.propublica.org",                                     type: "Investigative journalism",   note: "Independent nonprofit, progressive"                       },
  "TIME":                                         { url: "https://time.com",                                               type: "Investigative journalism",   note: "Major news publication"                                   },
  "The Atlantic":                                 { url: "https://www.theatlantic.com",                                    type: "Investigative journalism",   note: "Independent, longform journalism and commentary"           },
  "SiliconANGLE":                                 { url: "https://siliconangle.com",                                       type: "Technology journalism",      note: "Independent enterprise technology news"                   },
  "TechCrunch":                                   { url: "https://techcrunch.com",                                         type: "Technology journalism",      note: "Technology and startup news publication"                  },
  // ── Industry Research ─────────────────────────────────────────
  "IDC":                                          { url: "https://www.idc.com",                                            type: "Market research",            note: "Industry-funded technology market research and forecasting" },
  "McKinsey Global Institute":                    { url: "https://www.mckinsey.com/mgi/overview",                          type: "Consulting research",       note: "Industry-funded, pro-business"                            },
  "Goldman Sachs Global Investment Research":     { url: "https://www.goldmansachs.com/intelligence",                     type: "Investment bank research",  note: "Industry-funded, market-oriented"                         },
  "BCG Henderson Institute":                      { url: "https://bcg.com/beyond-consulting/bcg-henderson-institute",     type: "Consulting research",       note: "Industry-funded, management consulting"                   },
  // ── Academic Publishing ───────────────────────────────────────
  "Polity":                                       { url: "https://politybooks.com",                                        type: "Academic publisher",        note: "Nonpartisan"                                              },
  // ── Legal Scholarship ────────────────────────────────────────
  "Boston University Law Review":                 { url: "https://www.bu.edu/bulawreview/",                                type: "Academic journal",          note: "Peer-reviewed, nonpartisan"                               },
  "Georgetown Law Technology Review":             { url: "https://georgetownlawtechreview.org",                            type: "Academic journal",          note: "Peer-reviewed, technology law focus"                      },
  "California Law Review":                        { url: "https://www.californialawreview.org",                            type: "Academic journal",          note: "Peer-reviewed, nonpartisan"                               },
  "Georgetown Journal on Poverty Law & Policy":   { url: "https://www.law.georgetown.edu/poverty-journal/",                type: "Academic journal",          note: "Peer-reviewed, poverty and equity focus"                  },
  "University of Michigan Poverty Solutions":     { url: "https://poverty.umich.edu",                                      type: "University research",       note: "Academic, nonpartisan, poverty and housing focus"         },
  // ── Civil Rights ─────────────────────────────────────────────
  "The Leadership Conference on Civil and Human Rights": { url: "https://civilrights.org",                                 type: "Civil rights advocacy",     note: "Progressive, broad civil rights coalition"                },
  "TechEquity Collaborative":                     { url: "https://techequity.us",                                          type: "Civil society research",    note: "Progressive, tech and economic justice focus"             },
  // ── International Policy ──────────────────────────────────────
  "German Marshall Fund of the United States":    { url: "https://www.gmfus.org",                                          type: "Think tank",                note: "Transatlantic policy focus, nonpartisan"                  },
  "Corporate Europe Observatory":                 { url: "https://corporateeurope.org",                                    type: "Investigative research",    note: "Corporate lobbying watchdog, progressive"                 },
  "Corporate Europe Observatory and AlgorithmWatch": { url: "https://corporateeurope.org",                                 type: "Investigative research",    note: "Joint investigation; Corporate Europe Observatory & AlgorithmWatch" },
  // ── Federal Agencies (housing) ───────────────────────────────
  "U.S. Department of Housing and Urban Development": { url: "https://www.hud.gov",                                        type: "Federal agency",            note: "Federal housing policy and enforcement"                   },
  // ── AI Fairness & Technology Research ────────────────────────
  "MIT Media Lab":                                    { url: "https://www.media.mit.edu",                                   type: "University research",       note: "Academic, MIT, AI and technology focus"                   },
  "Vector Institute":                                 { url: "https://vectorinstitute.ai",                                  type: "Research institute",        note: "Nonprofit, AI research, Canadian"                         },
  // ── Criminal Justice & Civil Liberties ───────────────────────
  "Innocence Project":                                { url: "https://innocenceproject.org",                                type: "Civil rights advocacy",     note: "Criminal justice reform, wrongful conviction focus"       },
  // ── Technology Accountability Journalism ─────────────────────
  "The Markup":                                       { url: "https://themarkup.org",                                       type: "Investigative journalism",  note: "Independent nonprofit, technology accountability focus"   },
  // ── Federal Standards & Evaluation ───────────────────────────
  "National Institute of Standards and Technology":   { url: "https://www.nist.gov",                                        type: "Federal agency",            note: "Government, standards and technology evaluation"          },
  // ── Federal Legislative ───────────────────────────────────────
  "U.S. Senate":                                      { url: "https://www.senate.gov",                                      type: "Federal legislative body",  note: "U.S. federal legislative branch"                          },
  // ── State Agencies & Legislatures ────────────────────────────
  "New Jersey Department of Labor":                   { url: "https://www.nj.gov/labor",                                    type: "State agency",              note: "State workforce development and labor policy"             },
  "New Jersey Legislature":                           { url: "https://www.njleg.state.nj.us",                               type: "State legislative body",    note: "New Jersey state government"                              },
  // ── Centrist Policy ───────────────────────────────────────────
  "Bipartisan Policy Center":                         { url: "https://bipartisanpolicy.org",                                type: "Think tank",                note: "Centrist, bipartisan economic and governance policy"       },
  // ── News & Commentary ────────────────────────────────────────
  "Harvard Business Review":                          { url: "https://hbr.org",                                             type: "Business journalism",       note: "Management and business publication, Harvard affiliation"  },
  "Skadden, Arps, Slate, Meagher & Flom LLP":        { url: "https://www.skadden.com",                                     type: "Law firm analysis",         note: "Major corporate law firm; legal risk and compliance analysis" },
  "Washington Center for Equitable Growth":           { url: "https://equitablegrowth.org",                                 type: "Think tank",                note: "Progressive economics research, labor and inequality focus" },
  "The Guardian":                                     { url: "https://www.theguardian.com",                                 type: "Investigative journalism",  note: "Independent, international news publication"              },
  "Anton Leicht":                                     { url: "https://writing.antonleicht.me",                              type: "Independent commentary",    note: "Independent policy analyst and writer"                    },
  "AI Futures Project":                               { url: "https://blog.aifutures.org",                                  type: "Policy commentary",         note: "Independent AI policy analysis and scenario planning"      },
  // ── International Development ─────────────────────────────────
  "Anticipation Hub":                                 { url: "https://www.anticipation-hub.org",                            type: "International development", note: "Social protection research and anticipatory action"        },
  // ── Civic Technology ──────────────────────────────────────────
  "Code for America":                                 { url: "https://codeforamerica.org",                                  type: "Civic technology nonprofit", note: "Government technology and service delivery, nonpartisan"   },
  "AI Commons Project":                               { url: "https://www.aicommonsproject.org",                             type: "Worker research",            note: "Participatory research documenting worker experiences of AI in the economy" },
  // ── Civil Liberties & Digital Rights (expanded) ───────────────
  "Center for Democracy and Technology":              { url: "https://cdt.org",                                              type: "Civil liberties nonprofit",  note: "Nonpartisan digital rights and civil liberties advocacy; disability and surveillance focus" },
  // ── Federal Housing Finance ───────────────────────────────────
  "Federal Housing Finance Agency":                   { url: "https://www.fhfa.gov",                                         type: "Federal agency",             note: "Federal regulator for Fannie Mae, Freddie Mac, and Federal Home Loan Banks" },
  // ── Civic Technology & Access to Justice ──────────────────────
  "Benefits Tech Advocacy Hub":                       { url: "https://www.btah.org",                                         type: "Policy advocacy coalition",  note: "Coalition of NHeLP, TechTonic Justice, and Upturn; benefits technology accountability" },
  "Ohio State University Moritz College of Law":      { url: "https://moritzlaw.osu.edu",                                    type: "University research",        note: "Academic, JusticeTech program — interdisciplinary law-CS AI tools for housing and legal access" },
  "Community Solutions":                              { url: "https://community.solutions",                                  type: "Nonprofit research",         note: "Nonprofit focused on ending homelessness; AI and housing data research" },
  "Stanford Legal Design Lab":                        { url: "https://justiceinnovation.law.stanford.edu",                   type: "University research",        note: "Academic, Stanford Law; AI and access to justice, Legal Help Commons" },
  "Hack for Social Impact":                           { url: "https://hackforsocialimpact.org",                              type: "Civic technology",           note: "San Francisco civic hackathon applying AI to homelessness and justice challenges" },
  // ── Legal Professional Associations ───────────────────────────
  "American Bar Association CRSJ":                    { url: "https://www.americanbar.org/groups/crsj/",                     type: "Professional association",   note: "ABA Civil Rights and Social Justice Section; AI civil rights legal education" },
  // ── Commentary & Analysis (expanded) ─────────────────────────
  "Jacobin":                                          { url: "https://jacobin.com",                                          type: "Policy commentary",          note: "Socialist magazine; political economy of technology and labor" },
  // ── International Government ──────────────────────────────────
  "Singapore Parliament":                             { url: "https://www.parliament.gov.sg",                                type: "International government",   note: "Singapore legislative body; Platform Workers Act 2024 gig worker protections" },
  // ── Civil Rights Advocacy ─────────────────────────────────────
  "National Partnership for Women & Families":        { url: "https://nationalpartnership.org",                              type: "Civil rights advocacy",      note: "Progressive advocacy for women and families; AI displacement and equity research" },
  // ── Law Firm Analysis ─────────────────────────────────────────
  "Felhaber Larson":                                  { url: "https://www.felhaber.com",                                     type: "Law firm analysis",          note: "Employment law firm; AI labor relations and legislative risk analysis" },
  "DarrowEverett LLP":                                { url: "https://darroweverett.com",                                    type: "Law firm analysis",          note: "Multi-practice law firm; AI hiring compliance and workforce management legal analysis" },
  // ── Business School Research ─────────────────────────────────
  "Wharton AI & Analytics Initiative":                { url: "https://ai.wharton.upenn.edu",                                 type: "University research",        note: "University of Pennsylvania Wharton School; AI strategy, workforce, and human-technology interaction research" },
  // ── Federal Agencies (AI & Consumer Protection) ───────────────
  "Executive Office of the President":                { url: "https://www.whitehouse.gov",                                   type: "Federal government",         note: "White House executive policy; official U.S. government AI legislative frameworks" },
  "Federal Trade Commission":                         { url: "https://www.ftc.gov",                                          type: "Federal agency",             note: "Federal consumer protection and competition enforcement; generative AI and creative economy oversight" },
  // ── Guaranteed Income Research ────────────────────────────────
  "Economic Security Project":                        { url: "https://economicsecurityproject.org",                          type: "Policy advocacy",            note: "Progressive think tank focused on anti-monopoly policy and guaranteed income; funds pilots and commissions research" },
  "University of Chicago Inclusive Economy Lab":      { url: "https://urbanlabs.uchicago.edu/labs/inclusive-economy",         type: "University research",        note: "Academic lab evaluating anti-poverty and income support programs; evaluator for Cook County Guaranteed Income Pilot" },
  "Center for Guaranteed Income Research":            { url: "https://www.penncgir.org",                                      type: "University research",        note: "University of Pennsylvania School of Social Policy & Practice; primary U.S. academic center for GI research" },
  "Center on Budget and Policy Priorities":           { url: "https://www.cbpp.org",                                          type: "Policy research",            note: "Nonpartisan research and advocacy center focused on fiscal and economic policy; progressive" },
  "NYC Family Policy Project":                        { url: "https://familypolicynyc.org",                                   type: "Policy advocacy",            note: "New York City-focused research and advocacy on family economic support policy" },
  "Nature Mental Health":                             { url: "https://www.nature.com/natmenthealth",                          type: "Academic journal",           note: "Peer-reviewed, Springer Nature, mental health research" },
  "Frontiers in Psychology":                          { url: "https://www.frontiersin.org/journals/psychology",               type: "Academic journal",           note: "Peer-reviewed, open-access, broad psychology research" },
  "International Journal of Social Welfare":          { url: "https://onlinelibrary.wiley.com/journal/14682397",             type: "Academic journal",           note: "Peer-reviewed, Wiley, international comparative social welfare research" },
  "Basic Income Studies":                             { url: "https://www.degruyter.com/journal/key/bis/html",                type: "Academic journal",           note: "Peer-reviewed, De Gruyter, dedicated basic income research journal" },
};
const INST_URLS = Object.fromEntries(Object.entries(INST_META).map(([k,v]) => [k, v.url]));

const GEOGRAPHY_META = {
  us:   { label: "United States",  short: "US",   color: "var(--g-us)"   },
  intl: { label: "International", short: "Intl", color: "var(--g-intl)" },
};

const EVIDENCE_META = {
  'peer-reviewed': { label: 'Peer-Reviewed', color: '#2C3254', bg: 'rgba(44,50,84,0.07)',    desc: 'Published in a peer-reviewed academic journal or conference proceedings.'        },
  'working-paper': { label: 'Working Paper', color: '#472B51', bg: 'rgba(71,43,81,0.07)',    desc: 'Pre-print or working paper (arXiv, NBER) — not yet formally peer-reviewed.'      },
  'official':      { label: 'Official',      color: '#2A6B4A', bg: 'rgba(42,107,74,0.09)',   desc: 'Published by a government agency, legislative body, or international organization.' },
  'analysis':      { label: 'Analysis',      color: '#3C4164', bg: 'rgba(60,65,100,0.07)',   desc: 'Research or policy analysis from think tanks, advocacy orgs, or civil society.'   },
  'industry':      { label: 'Industry',      color: '#9B6B2A', bg: 'rgba(155,107,42,0.09)',  desc: 'Reports from consulting firms, investment banks, or AI labs.'                      },
  'commentary':    { label: 'Commentary',    color: '#7A8699', bg: 'rgba(122,134,153,0.11)', desc: 'Journalism, independent writers, and opinion-based analysis.'                      },
};

function getEvidenceType(entry) {
  if (entry.evidence) return entry.evidence;
  const url = (entry.sourceUrl || '').toLowerCase();
  if (url.includes('arxiv.org') || url.includes('nber.org/')) return 'working-paper';
  const src = entry.source || '';
  if (src.toLowerCase().includes('working paper')) return 'working-paper';
  const inst = src.split(' — ').pop().trim();
  const meta = INST_META[inst] || {};
  const type = (meta.type || '').toLowerCase();
  if (type.includes('academic journal') || type.includes('academic conference') || type.includes('academic publisher')) return 'peer-reviewed';
  if (type.includes('economic research network') || type.includes('preprint')) return 'working-paper';
  if (type.includes('federal') || type.includes('government') || type.includes('state agency') ||
      type.includes('state legislative') || type.includes('international organization') ||
      type.includes('international body') || type.includes('federal legislative') ||
      type.includes('legislative body')) return 'official';
  if (type.includes('consulting') || type.includes('investment bank') || type.includes('ai lab')) return 'industry';
  if (type.includes('independent commentary') || type.includes('policy commentary') ||
      type.includes('investigative journalism')) return 'commentary';
  return 'analysis';
}

const PRIORITY_SOURCE_GROUPS = {
  "AI Industry": [
    "Anthropic", "OpenAI", "OpenAI / University of Pennsylvania",
  ],
  "Academic & Economic Research": [
    "Stanford HAI", "NBER", "MIT Work of the Future", "MIT Media Lab",
    "Brookings Institution", "Opportunity@Work & Brookings Metro",
    "Cornell ILR School", "New England Journal of Medicine", "Council on Foreign Relations",
    "Science", "Nature Communications", "Journal of Economic Perspectives", "NYU Law Review", "Philosophy & Technology", "ACM FAccT", "arXiv",
    "Stanford Legal Design Lab", "Ohio State University Moritz College of Law",
    "Wharton AI & Analytics Initiative",
    "University of Chicago Inclusive Economy Lab", "Center for Guaranteed Income Research", "Basic Income Studies",
  ],
  "Critical Technology Research": [
    "AI Now Institute", "Data & Society",
    "Georgetown CSET", "Georgetown Law Center on Privacy & Technology", "Upturn",
    "Vector Institute",
  ],
  "Labor & Workers' Rights": [
    "AFL-CIO", "Writers Guild of America", "National Employment Law Project",
  ],
  "Investigative Journalism": [
    "ProPublica", "TIME", "Corporate Europe Observatory and AlgorithmWatch", "The Markup", "The Guardian",
    "The Atlantic", "TechCrunch", "SiliconANGLE",
  ],
  "Industry Research": [
    "McKinsey Global Institute", "Goldman Sachs Global Investment Research", "BCG Henderson Institute", "IDC",
  ],
  "Legal Scholarship": [
    "Boston University Law Review", "Georgetown Law Technology Review",
    "California Law Review", "Georgetown Journal on Poverty Law & Policy",
    "University of Michigan Poverty Solutions",
  ],
  "Federal Agencies & Legislative": [
    "U.S. Equal Employment Opportunity Commission", "U.S. Senate Permanent Subcommittee on Investigations",
    "U.S. Department of Housing and Urban Development", "Federal Housing Finance Agency",
    "National Institute of Standards and Technology", "U.S. Senate",
    "Executive Office of the President", "Federal Trade Commission",
  ],
  "State Government": [
    "New Jersey Department of Labor", "New Jersey Legislature",
  ],
  "Civil Rights & Equity": [
    "National Consumer Law Center", "National Fair Housing Alliance", "American Psychological Association",
    "Electronic Frontier Foundation", "The Leadership Conference on Civil and Human Rights",
    "TechEquity Collaborative", "Innocence Project",
    "Center for Democracy and Technology", "American Bar Association CRSJ",
    "National Partnership for Women & Families",
    "NYC Family Policy Project",
  ],
  "Policy & Think Tanks": [
    "Economic Policy Institute", "Center for American Progress",
    "Open Markets Institute", "American Economic Liberties Project",
    "Washington Center for Equitable Growth",
    "Bipartisan Policy Center",
    "International Labour Organization", "OECD Competition Committee", "World Economic Forum",
    "European Parliament Research Service", "German Marshall Fund of the United States",
    "Tony Blair Institute for Global Change", "Centre for Future Generations",
    "Digitalist Papers", "The Bully Pulpit", "Tech Policy Press",
    "Resources for the Future / Lincoln Institute", "U.S. National Science Foundation",
    "Benefits Tech Advocacy Hub",
    "Economic Security Project", "Center on Budget and Policy Priorities",
  ],
  "Commentary & Analysis": [
    "Anton Leicht", "AI Futures Project", "Harvard Business Review",
    "Skadden, Arps, Slate, Meagher & Flom LLP", "Jacobin",
    "Felhaber Larson", "DarrowEverett LLP",
  ],
  "International Development": [
    "Anticipation Hub",
  ],
  "Civic Technology": [
    "Code for America", "Community Solutions", "Hack for Social Impact",
  ],
  "International Government": [
    "Singapore Parliament",
  ],
  "Academic Journals": [
    "Nature Mental Health", "Frontiers in Psychology", "International Journal of Social Welfare",
  ],
};

const RESEARCH_DATA = [
  { id: 269, date: "2023-07-20", added: "2026-07-16",
    title: "Building AI Cities: How to Spread the Benefits of an Emerging Technology Across More of America",
    source: "Mark Muro, Julian Jacobs & Sifan Liu — Brookings Metro",
    sourceUrl: "https://www.brookings.edu/articles/building-ai-cities-how-to-spread-the-benefits-of-an-emerging-technology-across-more-of-america/",
    category: "community", geography: "us",
    keyFinding: "Generative artificial-intelligence job postings concentrate heavily: the Bay Area plus 13 other early-adopter metros accounted for roughly 60% of new postings in mid-2023, and six metros alone posted about 47%. The top 15 artificial-intelligence metros hold about two-thirds of United States artificial-intelligence assets and capabilities, prompting warnings of emerging AI deserts.",
    takeaways: [
      "Early adoption is metropolitan by construction: every leading market is a large metro, leaving rural regions structurally absent from the first wave of artificial-intelligence hiring.",
      "Concentration compounds: the same metros hold the talent, the research assets, and the capital, so early leads harden into durable geographic advantage.",
      "Brookings' 2025 follow-up finds the top 30 metros capture 67% of artificial-intelligence job postings, confirming the pattern's persistence."
    ]
  },
  { id: 266, date: "2026-07-10", added: "2026-07-16",
    title: "Labor Power and the Role of Subcontracting in the AI Economy",
    source: "Sana Ahmad — Tech Policy Press",
    sourceUrl: "https://www.techpolicy.press/labor-power-and-the-role-of-subcontracting-in-the-ai-economy/",
    category: "workers", geography: "intl",
    keyFinding: "Artificial-intelligence supply chains run through a deliberate outsourcing maze: layered subcontractors handle data work and content moderation while the lead firms controlling the work remain obscured. Workers often cannot identify the company setting their conditions, which hobbles organizing. When Meta's contract with Sama collapsed, more than 1,000 Kenyan data workers lost their jobs. Supply-chain due-diligence laws reach artificial-intelligence firms only partially, leaving upstream labor-rights accountability gaps.",
    takeaways: [
      "Subcontracting is framed as a labor-power strategy rather than a cost decision: the layers exist partly to diffuse accountability and fragment organizing.",
      "Even large subcontractors remain subordinate. Cognizant's 2020 exit from content moderation shows the tier's dependence on lead-firm contracts.",
      "Supply-chain due-diligence law is the identified policy lever, and its current versions only partially cover artificial-intelligence production chains."
    ]
  },
  { id: 267, date: "2026-06-11", added: "2026-07-16",
    title: "Europe 2031: What Getting AI Wrong Means for Us",
    source: "Daan Juijn, Stan van Baarsen, Judith Dada et al. — Europe 2031",
    sourceUrl: "https://europe2031.ai/",
    category: "macro", geography: "intl",
    keyFinding: "A book-length foresight scenario tracing Europe from 2025 to 2031, with a 2034 epilogue, under three misjudgments: underestimating artificial intelligence's speed, underestimating its impact, and overestimating Europe's capacity to catch up. In the scenario the United States holds roughly twelve times Europe's compute by 2031 (255 versus 21 gigawatts), a 2029 United States rule rations European access to frontier models, entry-level hiring collapses by 2030, and sovereign-debt stress follows.",
    takeaways: [
      "Speculative fiction grounded in real 2025 to 2026 events, written to make compute dependence, hiring collapse, and fiscal stress concrete rather than to forecast them.",
      "The compute asymmetry and the access-rationing rule dramatize how infrastructure gaps convert into geopolitical leverage, with ASML as Europe's remaining card.",
      "The epilogue argues the decline was preventable, positioning the scenario as a policy warning rather than a prediction."
    ]
  },
  { id: 268, date: "2023-02-01", added: "2026-07-16",
    title: "Portable Benefits for Independent Contractors: A Framework for State Policymaking",
    source: "Suzanne Hultin, Anna Petrini & Landon Jacquinot — National Conference of State Legislatures",
    sourceUrl: "https://documents.ncsl.org/wwwncsl/Labor/Portable-Benefits-Independent-Contractors-f02_Alicia%20Natwick.pdf",
    category: "policy", geography: "us",
    keyFinding: "A National Conference of State Legislatures work-group framework for state portable-benefits policymaking, built on the principle that benefits attach to workers rather than employers. The catalog spans Washington's enacted rideshare-driver law (workers' compensation, sick leave, minimum pay, with independent-contractor status preserved) and bills in Alabama, Georgia, New Jersey, Connecticut, and Massachusetts, alongside thirteen auto-enrollment retirement states.",
    takeaways: [
      "Operationalizes the individual-account model with concrete contribution formulas, such as the lesser of 25 percent of transaction fees or $6 per hour, under a 5 percent administrative cap.",
      "Washington's rideshare law is the enacted template: real benefits delivered while preserving contractor status, exactly the trade the classification debate contests.",
      "The work group was Amazon-supported, placing the framework on the industry-aligned side of the design debate cataloged in this database's portable-benefits sources."
    ]
  },
  { id: 257, date: "2016-07-13", added: "2026-07-08",
    title: "Portable Benefits Resource Guide",
    source: "Libby Reder, Natalie Foster & Greg Nelson — Aspen Institute",
    sourceUrl: "https://www.aspeninstitute.org/publications/portable-benefits-resource-guide/",
    category: "policy", geography: "us",
    keyFinding: "A toolkit for state and local policymakers designing portable benefits for independent and on-demand workers. The guide surveys the benefit gaps of the on-demand workforce, catalogs existing models and proposals, and frames five design questions: which benefits, who administers, who pays, mandatory or voluntary participation, and who is eligible.",
    takeaways: [
      "Positions states and cities as the policy laboratories for portable benefits, the path the later state pilots followed.",
      "The five design questions (scope, administrator, financing, compulsion, eligibility) remain the standard decomposition of portable-benefits proposals.",
      "Written for the on-demand economy's first policy wave; predates the misclassification fights that now dominate the debate."
    ]
  },
  { id: 258, date: "2025-04-24", added: "2026-07-08",
    title: "Exploring Portable Benefits for Gig Workers",
    source: "Aidan T. Kane & Eli Schrag — Brookings Institution",
    sourceUrl: "https://www.brookings.edu/articles/exploring-portable-benefits-for-gig-workers/",
    category: "policy", geography: "us",
    keyFinding: "A synthesis of a Brookings roundtable on portable benefits for gig workers. Participants found there is no typical gig worker, identified retirement, health care, childcare, education, and housing as the benefits workers value most, and favored letting workers allocate contributions across those needs themselves. The discussion paired a federal baseline with state experimentation, citing the Portable Benefits for Independent Workers Pilot Program Act.",
    takeaways: [
      "Worker-directed allocation is the design centerpiece: let workers choose how contributions split across retirement, health, childcare, education, and housing.",
      "Gig-work heterogeneity undercuts one-size benefit design; part-time and full-time platform workers need different packages.",
      "Reflects the emerging federal-baseline-plus-state-pilots consensus rather than original empirical research."
    ]
  },
  { id: 259, date: "2025-03-24", added: "2026-07-08",
    title: "Why Workers Need Real Portable Benefits",
    source: "Laura Padin — National Employment Law Project",
    sourceUrl: "https://www.nelp.org/insights-research/why-workers-need-real-portable-benefits/",
    category: "labor", geography: "us",
    keyFinding: "Real portable benefits pool risk through social insurance: Social Security, unemployment insurance, Medicare, and multi-employer union plans that contribute 11.25 percent of pay to pensions. Company-sponsored savings-account schemes are inadequate substitutes. DoorDash's Pennsylvania pilot averaged $31 per month in company contributions, and app-based delivery workers net roughly $0.48 per hour after expenses.",
    takeaways: [
      "The insurance-versus-savings-account distinction is the analytical core: pooled-risk programs deliver security that individual accounts at pilot contribution levels cannot.",
      "Quantifies the pilot gap: $31 per month in company contributions against benchmarks like union pension contributions of 11.25 percent of pay.",
      "Argues the durable fix is extending existing social insurance to independent workers rather than building parallel private schemes."
    ]
  },
  { id: 260, date: "2025-08-16", added: "2026-07-08",
    title: "App-Based Workers Need Real Rights, Not 'Portable Benefits' Gimmicks",
    source: "Laura Padin — National Employment Law Project",
    sourceUrl: "https://www.nelp.org/app-based-workers-need-real-rights-not-portable-benefits-gimmicks/",
    category: "labor", geography: "us",
    keyFinding: "Company-backed state portable-benefits bills from Uber, Lyft, and DoorDash function as gimmicks that legitimize misclassification: they trade token benefit contributions for carve-outs excluding app-based workers from minimum wage, workers' compensation, and unemployment insurance. The piece calls instead for real portable benefits through social insurance, multi-employer plans, and portable paid leave.",
    takeaways: [
      "Reads the state bills as a legal strategy: codifying contractor status is the payoff, benefit contributions are the cover.",
      "Pairs with the companion National Employment Law Project fact sheet quantifying pilot contributions at roughly $31 per month.",
      "Advocacy from the misclassification-critique camp, balancing the industry-aligned design guides in the same debate."
    ]
  },
  { id: 261, date: "2025-07-17", added: "2026-07-08",
    title: "Workers Need Real Security and Flexibility, Not Pro-Employer Portable Benefits Proposals",
    source: "Billy Bonnist & Max Feist — Economic Policy Institute",
    sourceUrl: "https://www.epi.org/blog/workers-need-real-security-and-flexibility-not-pro-employer-portable-benefits-proposals/",
    category: "labor", geography: "us",
    keyFinding: "A critique of the July 2025 Cassidy and Scott portable-benefits bills, including the Unlocking Benefits for Independent Workers Act. The authors argue the bills shield companies from misclassification suits and cement contractor status, and that flexibility versus benefits is a false dilemma because the Fair Labor Standards Act already permits flexible scheduling. An estimated 10 to 30 percent of employers misclassify workers.",
    takeaways: [
      "The false-dilemma argument removes the bills' central justification: nothing in current law forces rigidity on employers who provide full benefits.",
      "The misclassification estimate (10 to 30 percent of employers) frames portable-benefits carve-outs as amnesty for an existing enforcement problem.",
      "Aligns the labor-institution critique with worker-advocacy positions against the 2025 federal bills."
    ]
  },
  { id: 262, date: "2026-04-06", added: "2026-07-08",
    title: "OpenAI's Vision for the AI Economy: Public Wealth Funds, Robot Taxes, and a Four-Day Workweek",
    source: "Rebecca Bellan — TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/04/06/openais-vision-for-the-ai-economy-public-wealth-funds-robot-taxes-and-a-four-day-work-week/",
    category: "macro", geography: "us",
    keyFinding: "Reports OpenAI's policy proposals for the 'intelligence age': shifting taxation from labor toward capital (a robot-tax concept), a public wealth fund giving citizens stakes in artificial-intelligence gains, subsidized four-day workweeks, and expanded safety nets. OpenAI warns that profit shifts driven by artificial intelligence could hollow out the payroll-tax base that funds Social Security and Medicaid.",
    takeaways: [
      "An artificial-intelligence lab publicly endorsing public wealth funds and capital taxation marks industry convergence with proposals long confined to policy circles.",
      "The payroll-tax warning gives fiscal urgency to delinking safety-net financing from wages.",
      "News coverage of the company's proposals; consult the primary document before citing specifics."
    ]
  },
  { id: 263, date: "2019-02-01", added: "2026-07-08",
    title: "Explainer: Algorithmic Management in the Workplace",
    source: "Alexandra Mateescu & Aiha Nguyen — Data & Society",
    sourceUrl: "https://datasociety.net/library/explainer-algorithmic-management-in-the-workplace/",
    category: "surveillance", geography: "us",
    keyFinding: "Defines algorithmic management as technological tools that structure working conditions and manage workforces remotely through data collection and surveillance, enabling automated and semi-automated decisions. The explainer maps the practice from gig platforms into retail and domestic work and documents its harms: pervasive surveillance and control, opacity, bias and discrimination, weakened accountability, and facilitation of misclassification.",
    takeaways: [
      "The foundational definition that most subsequent algorithmic-management research and regulation builds on.",
      "Framing the harms as structural rather than incidental anticipates the due-process remedies now appearing in law, including deactivation-rights ordinances.",
      "Documents the spread of platform-style management into conventional employment, a pattern later quantified by workplace-surveillance research."
    ]
  },
  { id: 264, date: "2025-01-01", added: "2026-07-08",
    title: "App-Based Worker Deactivation Rights Ordinance",
    source: "City of Seattle Office of Labor Standards",
    sourceUrl: "https://www.seattle.gov/laborstandards/ordinances/app-based-worker-ordinances/app-based-worker-deactivation-rights-ordinance",
    category: "policy", geography: "us",
    keyFinding: "The first United States law giving app-based workers due process against deactivation, effective January 2025. Covered network companies must publish deactivation policies reasonably related to safe and efficient operations, give 14 days' written notice citing the specific violation with access to substantiating records, provide a reconsideration process, and report data to the Office of Labor Standards. Deactivations cannot rest solely on aggregate customer ratings or background checks absent egregious misconduct.",
    takeaways: [
      "Converts deactivation from an unreviewable platform decision into a noticed, evidenced, and appealable process: due process as a labor standard.",
      "The aggregate-ratings prohibition directly regulates algorithmic management; a score alone can no longer end platform employment.",
      "Enforcement through a city labor-standards office demonstrates municipal capacity to regulate platform work absent federal action."
    ]
  },
  { id: 265, date: "2026-03-04", added: "2026-07-08",
    title: "Uber Technologies, Inc. v. City of Seattle",
    source: "U.S. Court of Appeals for the Ninth Circuit",
    sourceUrl: "https://cdn.ca9.uscourts.gov/datastore/opinions/2026/03/04/25-231.pdf",
    category: "policy", geography: "us",
    keyFinding: "A divided Ninth Circuit panel affirmed the denial of a preliminary injunction against Seattle's App-Based Worker Deactivation Rights Ordinance. Uber, Portier, and intervenor Instacart argued that the ordinance's policy and notice mandates compel speech under the First Amendment. The court held the ordinance regulates non-expressive economic conduct, that any incidental speech is commercial and survives lower scrutiny, and the ordinance stands.",
    takeaways: [
      "Neutralizes the compelled-speech theory platforms raised against disclosure-based labor regulation, a template argument likely to recur elsewhere.",
      "With constitutionality affirmed at the appellate level, the Seattle model is cleared for adoption by other jurisdictions.",
      "Classifying notice-and-records mandates as economic conduct regulation keeps future algorithmic-transparency rules on firm First Amendment ground."
    ]
  },
  { id: 247, date: "2021-09-01", added: "2026-07-07",
    title: "Hidden Workers: Untapped Talent",
    source: "Joseph B. Fuller, Manjari Raman, Eva Sage-Gavin & Kristen Hines — Harvard Business School",
    sourceUrl: "https://www.hbs.edu/ris/Publication%20Files/hiddenworkers09032021_Fuller_white_paper_33a2047f-41dd-47b1-9a8d-bd08cf3bfa94.pdf",
    category: "hiring", geography: "us",
    keyFinding: "A survey of 2,275 executives in the United States, United Kingdom, and Germany finds more than 90 percent of employers use recruitment management or applicant tracking software to make the first cut of candidates. Coverage reaches 94 percent for middle-skills roles and 92 percent for high-skills roles. The automated filters systematically exclude an estimated 27 million hidden workers in the United States whose resumes fail rigid keyword and work-continuity criteria.",
    takeaways: [
      "Automated screening is near-universal at the first stage of hiring, making transparency and audit requirements consequential for nearly every large employer rather than an early-adopter niche.",
      "Rigid keyword and work-history filters exclude an estimated 27 million United States workers from consideration, including caregivers, veterans, immigrants, and people with disabilities.",
      "The report recommends shifting from negative filtering to affirmative skills-based criteria, a design change that regulation or procurement standards could accelerate."
    ]
  },
  { id: 248, date: "2022-09-13", added: "2026-07-07",
    title: "Poverty in the United States: 2021",
    source: "John Creamer, Emily A. Shrider, Kalee Burns & Frances Chen — U.S. Census Bureau",
    sourceUrl: "https://www.census.gov/library/publications/2022/demo/p60-277.html",
    category: "policy", geography: "us",
    keyFinding: "Supplemental Poverty Measure data show child poverty fell from 9.7 percent in 2020 to a record-low 5.2 percent in 2021, a 46 percent single-year decline driven primarily by the expanded Child Tax Credit. The credit lifted 5.3 million people out of poverty, including 2.9 million children. Refundable tax credits overall moved 9.6 million people above the poverty line.",
    takeaways: [
      "The 46 percent decline is the largest single-year drop in child poverty on record, demonstrating that a monthly refundable child benefit can be administered at national scale through existing Internal Revenue Service infrastructure.",
      "Refundable tax credits moved 9.6 million people above the Supplemental Poverty Measure line in 2021, a larger effect than any program besides Social Security.",
      "The expansion's design elements, monthly disbursement, full refundability, and no earnings requirement, anchor the evidence base for universal child benefit proposals."
    ]
  },
  { id: 249, date: "2026-03-05", added: "2026-07-07",
    title: "The Gap: A Shortage of Affordable Homes",
    source: "Andrew Aurand et al. — National Low Income Housing Coalition",
    sourceUrl: "https://nlihc.org/gap",
    category: "community", geography: "us",
    keyFinding: "The United States has a shortage of 7.2 million rental homes affordable and available to extremely low-income renters, only 35 such homes for every 100 households that need one. Of the 11 million extremely low-income renter households, 74 percent spend more than half their income on housing.",
    takeaways: [
      "No state has an adequate supply of affordable rental housing for its lowest-income renters, making the shortage structural rather than regional.",
      "Severe cost burdens leave the lowest-income households one income shock away from eviction, the mechanism through which labor-market disruption converts into housing instability.",
      "The shortage figure quantifies the construction scale a credible housing-stability package must address, on the order of the 500,000-unit social housing proposals now circulating."
    ]
  },
  { id: 250, date: "2026-06-01", added: "2026-07-07",
    title: "Policy Basics: Federal Rental Assistance",
    source: "Center on Budget and Policy Priorities",
    sourceUrl: "https://www.cbpp.org/research/housing/policy-basics-federal-rental-assistance",
    category: "policy", geography: "us",
    keyFinding: "Because rental assistance is funded by annual appropriation rather than as an entitlement, only about one in four eligible low-income renter households receives federal help. In 2023, 8.5 million unassisted renter households paid more than half their income for housing or lived in severely substandard units.",
    takeaways: [
      "Housing vouchers are rationed by appropriation rather than need, so eligibility does not translate into assistance for three of every four qualifying households.",
      "Full-funding proposals convert an existing, administratively proven program into a guarantee, a lower-friction expansion path than building new delivery infrastructure.",
      "Multi-year waiting lists mean voucher expansion operates on a lag; countercyclical protection requires funding ahead of displacement shocks rather than in response to them."
    ]
  },
  { id: 251, date: "2022-05-26", added: "2026-07-07",
    title: "Consumer Financial Protection Circular 2022-03: Adverse Action Notification Requirements in Connection with Credit Decisions Based on Complex Algorithms",
    source: "Consumer Financial Protection Bureau",
    sourceUrl: "https://www.consumerfinance.gov/compliance/circulars/circular-2022-03-adverse-action-notification-requirements-in-connection-with-credit-decisions-based-on-complex-algorithms/",
    category: "policy", geography: "us",
    keyFinding: "The circular holds that the Equal Credit Opportunity Act and Regulation B require creditors to provide specific, accurate reasons when taking adverse action, even when decisions rest on complex algorithmic models. Model opacity is explicitly rejected as a defense: a creditor that cannot explain its algorithm's decisions may not use it.",
    takeaways: [
      "Establishes that existing consumer protection law already reaches algorithmic decision systems without new legislation, a template regulators can extend to hiring and tenant screening.",
      "Shifts the burden onto adopters: institutions must select models whose decisions can be explained, effectively barring unexplainable credit models from use.",
      "Cited across agencies as precedent for applying adverse-action logic to artificial intelligence systems in housing and employment contexts."
    ]
  },
  { id: 252, date: "2023-01-26", added: "2026-07-07",
    title: "Artificial Intelligence Risk Management Framework (AI RMF 1.0)",
    source: "National Institute of Standards and Technology",
    sourceUrl: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
    category: "policy", geography: "us",
    keyFinding: "The framework organizes voluntary artificial intelligence risk management into four core functions, Govern, Map, Measure, and Manage, and seven trustworthiness characteristics spanning validity, safety, fairness, and accountability. Directed by the National AI Initiative Act of 2020, it provides the reference standard that audit mandates and procurement rules can codify.",
    takeaways: [
      "Provides the technical vocabulary a binding audit regime needs; codifying it converts voluntary guidance into enforceable standards without drafting from scratch.",
      "Sector-agnostic design means the same framework covers hiring, credit, healthcare, and surveillance applications.",
      "Voluntariness is the limitation: absent regulation or procurement requirements, adoption is self-selected and unverified."
    ]
  },
  { id: 253, date: "2021-03-03", added: "2026-07-07",
    title: "Preliminary Analysis: SEED's First Year",
    source: "Stacia West, Amy Castro Baker, Sukhi Samra & Erin Coltrera — Stockton Economic Empowerment Demonstration",
    sourceUrl: "https://static1.squarespace.com/static/6039d612b17d055cac14070f/t/603ef1194c474b329f33c329/1614737690661/SEED_Preliminary+Analysis-SEEDs+First+Year_Final+Report_Individual+Pages+-2.pdf",
    category: "policy", geography: "us",
    keyFinding: "In the randomized Stockton pilot, 125 residents received $500 per month unconditionally. Full-time employment among recipients rose from 28 percent to 40 percent in one year, versus 32 to 37 percent for the control group. Recipients' month-to-month income fluctuation was 46.4 percent against 67.5 percent for controls, and measured psychological distress fell to levels consistent with wellness.",
    takeaways: [
      "The employment finding reverses the standard objection: unconditional cash preceded more full-time work, not less, by funding the transport, childcare, and time that job search requires.",
      "Income-volatility smoothing is the mechanism most relevant to displacement policy, stabilizing households through transitions rather than replacing work.",
      "Findings cover February 2019 to February 2020, a pre-pandemic window that insulates them from stimulus-era confounds."
    ]
  },
  { id: 254, date: "2026-01-15", added: "2026-07-07",
    title: "Employee Ownership by the Numbers",
    source: "National Center for Employee Ownership",
    sourceUrl: "https://www.nceo.org/research/employee-ownership-by-the-numbers",
    category: "workers", geography: "us",
    keyFinding: "The United States has 6,609 Employee Stock Ownership Plans covering 15.1 million participants, with total plan assets above $2 trillion. Drawn from 2023 Form 5500 filings, the data establish employee ownership as an existing institution at scale rather than a boutique experiment.",
    takeaways: [
      "Fifteen million participants make Employee Stock Ownership Plans one of the largest broad-based capital ownership mechanisms in the United States economy.",
      "Plan formation has been roughly flat for years; conversion incentives such as lending programs, tax treatment, and state centers target the succession wave of retiring business owners.",
      "Form 5500 data lag about two years, so current-year counts understate recent conversions."
    ]
  },
  { id: 255, date: "2017-10-01", added: "2026-07-07",
    title: "Social Prosperity for the Future: A Proposal for Universal Basic Services",
    source: "Jonathan Portes, Howard Reed & Andrew Percy — UCL Institute for Global Prosperity",
    sourceUrl: "https://discovery.ucl.ac.uk/id/eprint/10080175/",
    category: "policy", geography: "intl",
    keyFinding: "The first fully costed Universal Basic Services proposal extends free housing, food, transport, and digital access at roughly £42 billion per year, 2.3 percent of United Kingdom gross domestic product, funded by lowering the personal tax allowance. The package is worth about £126 per week to the lowest-income households.",
    takeaways: [
      "Services-in-kind deliver the largest proportional benefit to the poorest households, a distributional profile that cash transfers of equal cost do not match.",
      "The proposal specifies deliverables, including 1.5 million new social homes and free bus travel, grounding the framework in concrete programs rather than abstract categories.",
      "Fiscal neutrality through a lower personal tax allowance demonstrates a financing route that requires no new tax instruments."
    ]
  },
  { id: 256, date: "2021-10-08", added: "2026-07-07",
    title: "Statement on a Two-Pillar Solution to Address the Tax Challenges Arising from the Digitalisation of the Economy",
    source: "OECD/G20 Inclusive Framework on BEPS — OECD",
    sourceUrl: "https://www.oecd.org/content/dam/oecd/en/topics/policy-issues/beps/statement-on-a-two-pillar-solution-to-address-the-tax-challenges-arising-from-the-digitalisation-of-the-economy-october-2021.pdf",
    category: "policy", geography: "intl",
    keyFinding: "136 jurisdictions representing more than 90 percent of global gross domestic product agreed to a 15 percent global minimum corporate tax and a partial reallocation of taxing rights over the largest multinationals. The OECD's updated estimate puts the minimum tax's revenue at $155 to 192 billion per year, 6.5 to 8.1 percent of global corporate income tax revenue.",
    takeaways: [
      "Establishes the multilateral architecture an artificial-intelligence-profits extension would build on: an agreed rate floor, nexus rules, and model legislation already adopted by most large economies.",
      "Revenue materializes only where jurisdictions implement; United States adoption remains the framework's largest open question.",
      "Pillar One reallocates taxing rights over more than $125 billion of profit, the precedent for taxing digital value where users are located rather than where profits are booked."
    ]
  },
  { id: 241, date: "2026-07-02", added: "2026-07-06",
    title: "OpenAI Proposes U.S. Government Own 5% Stake to Address Political Blowback",
    source: "CNBC",
    sourceUrl: "https://www.cnbc.com/2026/07/02/openai-proposes-us-government-own-5percent-stake-to-address-political-blowback.html",
    category: "macro", geography: "us",
    evidence: "commentary",
    keyFinding: "OpenAI has proposed giving the U.S. government a 5% ownership stake — worth roughly $42.6 billion at the company's $852 billion valuation — as a mechanism for defusing political pressure and sharing AI's financial upside with the public. CEO Sam Altman has pitched the concept to the Trump administration since early 2025; the proposal envisions other major AI companies (Anthropic, Google, Meta) ceding similar stakes through a sovereign wealth fund vehicle.",
    takeaways: [
      "The proposed 5% government stake would be worth approximately $42.6 billion at OpenAI's most recent $852 billion valuation, making it one of the largest proposed public equity stakes in a private technology company.",
      "Altman frames government equity as a way to give the public a financial interest in AI's success — positioning the stake as a public benefit mechanism rather than a regulatory concession.",
      "The proposal envisions other leading AI companies including Anthropic, Google, and Meta making similar equity concessions through a sovereign wealth fund vehicle, though it is unclear whether any of these companies would agree.",
      "The pitch follows over a year of mounting political pressure on major U.S. AI firms over cybersecurity concerns and rising competition from Chinese open-source models."
    ]
  },
  { id: 242, date: "2026-07-02", added: "2026-07-06",
    title: "Preparing for the Unpredictable",
    source: "Lucy Brewster — Brew Markets",
    sourceUrl: "https://www.brewmarkets.com/stories/preparing-for-the-unpredictable",
    category: "macro", geography: "us",
    evidence: "commentary",
    keyFinding: "An interview with Joe Quinlan, head of market strategy at Bank of America's private bank, on AI's current macro footprint and investor positioning. Quinlan observes that AI productivity gains remain minimal in aggregate due to low adoption rates, though adoption is accelerating and impacts are visible in corporate earnings in energy, transportation, and financial services — consistent with historical patterns in which technology's macroeconomic benefits surface two to four years after adoption accelerates.",
    takeaways: [
      "AI productivity gains are not yet visible in broad macroeconomic data despite accelerating corporate adoption; Quinlan attributes the lag to still-low economy-wide adoption rates, consistent with historical patterns where technology revolution benefits surface years after adoption reaches scale.",
      "Quinlan identifies overlooked investment opportunity in AI end-user sectors — healthcare, industrials, transportation — rather than infrastructure providers, arguing companies that deploy AI to operate more efficiently and boost margins are undervalued relative to the infrastructure layer.",
      "Key macro risks cited: higher-than-expected inflation, the Federal Reserve raising rates three times (a contrarian but possible scenario), and geopolitical tensions involving Iran potentially triggering an oil shock that offsets productivity gains."
    ]
  },
  { id: 243, date: "2026-06-30", added: "2026-07-06",
    title: "New Jersey A3481: Revises Homelessness Prevention Program, Establishes Eviction Filing Fee",
    source: "New Jersey Legislature",
    sourceUrl: "https://njleg.state.nj.us/bill-search/2026/A3481",
    category: "policy", geography: "us",
    evidence: "official",
    keyFinding: "New Jersey A3481 revises the state's Homelessness Prevention Program by codifying eviction-prevention services in statute and establishing a new $75 landlord filing fee for eviction actions to fund those services. The bill passed the Assembly 55-19-4 and was engrossed June 30, 2026. It exempts small landlords (three units or fewer) and prohibits passing the fee to tenants. This bill addresses housing stability as a safety-net policy; it does not directly regulate AI.",
    takeaways: [
      "The $75 eviction filing fee funds an Office of Eviction Prevention to support resource navigators, relocation and rapid rehousing assistance, social services, rental assistance, and legal services for tenants facing displacement.",
      "Small landlords with three or fewer units are exempt from the new fee, and the bill explicitly prohibits passing the cost to tenants — targeting the measure at larger-scale eviction filers.",
      "New Jersey A3481 reflects state-level legislative movement on housing stability as a safety-net measure, a policy category directly relevant to economic displacement from workforce transitions including AI-driven ones."
    ]
  },
  { id: 244, date: "2026-06-01", added: "2026-07-06",
    title: "Tracking AI-Related Job Loss Using Unemployment Insurance Claims Data in California",
    source: "Hyman, von Wachter, Herrera, Moghadam, Morris, Motghare & Segal — California Policy Lab",
    sourceUrl: "https://capolicylab.org/wp-content/uploads/2026/06/Tracking-AI-Related-Job-Loss-Using-Unemployment-Insurance-Claims-Data-in-California.pdf",
    category: "labor", geography: "us",
    keyFinding: "The California AI-Unemployment Tracker (CAIT), developed by the California Policy Lab with the state Employment Development Department, links UI claims to occupational AI exposure measures to monitor potential AI-related job loss in near-real-time. Statewide data through May 2026 shows no aggregate surge in claims from AI-exposed occupations, but reveals elevated and sustained claims among college-educated workers, Bay Area workers, and workers in Information and Professional Services — subgroups plausibly most affected by AI at their workplaces.",
    takeaways: [
      "Since ChatGPT-3.5's release in November 2022, statewide California UI claims show no statistically significant increase attributable to AI exposure, consistent with national data showing no nationwide link between AI exposure and unemployment — but this aggregate finding masks concentrated effects in specific subgroups.",
      "UI claims from college-educated workers in high-AI-exposure occupations rose over 50% from November 2022 to July 2023 (from roughly 13,000 to 22,000 per month) and remained elevated at about 16,000 claims per month through May 2026 — above pre-pandemic baselines — a pattern difficult to explain by COVID-era labor market dynamics at this distance.",
      "High-AI-exposure unemployment claims in the San Francisco Bay Area rose sharply after ChatGPT's release and remained elevated relative to the rest of California; statewide, claims among college-educated workers rose more than 50%.",
      "30.3% of initial California UI claims from 2023-2025 came from high-AI-exposure occupations (top quartile), validating UI data as a relevant detection instrument and contradicting the assumption that AI-exposed workers with stronger reemployment prospects would be unlikely to file.",
      "Validation analysis of six announced AI-driven mass layoffs (March 2024 to April 2025) found clear UI claim spikes at layoff dates with disproportionately high-AI-exposure workers among claimants — confirming the tracker is sensitive enough to detect AI-driven job loss when it occurs, even if aggregate effects remain below detection threshold."
    ]
  },
  { id: 245, date: "2026-06-25", added: "2026-07-06",
    title: "Prompt Governance? On Governing Technologies Governed by Natural Language",
    source: "Anna Neumann, Holli Sargeant & Jatinder Singh — ACM FAccT",
    sourceUrl: "https://dl.acm.org/doi/10.1145/3805689.3806763",
    category: "policy", geography: "intl",
    evidence: "peer-reviewed",
    keyFinding: "This FAccT 2026 paper examines how AI systems are increasingly governed through natural language instructions — principally system prompts — and argues that prompt-mediated control creates governance challenges distinct from those addressed by training-time or code-based regulatory frameworks. Existing governance regimes do not adequately address transparency, accountability, and legitimacy questions that arise when behavioral constraints are expressed in natural language rather than technical architecture.",
    takeaways: [
      "System prompts function as a de facto governance layer for large language models and AI agents — setting behavioral constraints and defining permissible outputs — but they are invisible to users and largely unaddressed by existing regulatory frameworks designed for technical systems.",
      "Natural language governance creates novel accountability gaps: prompts can be modified without altering underlying model architecture, meaning behavioral changes can occur without the transparency requirements or audit trails that attach to training or code-level interventions.",
      "The authors document misalignments between technical evidence and policymaker assumptions, cautioning against treating system prompts as stable, interpretable control mechanisms and urging scrutiny before relying on prompt-based governance."
    ]
  },
  { id: 246, date: "2026-07-01", added: "2026-07-06",
    title: "Federal Trade Commission's Proposed Policy Statement Concerning the Suppression of Accuracy in Artificial Intelligence Systems",
    source: "Federal Trade Commission",
    sourceUrl: "https://www.ftc.gov/system/files/ftc_gov/pdf/ai-policy-statement_0.pdf",
    category: "policy", geography: "us",
    evidence: "official",
    keyFinding: "The FTC's proposed policy statement takes the position that AI companies that train or configure their models to pursue undisclosed ideological objectives — steering outputs away from what users request or would reasonably expect — may be engaging in deceptive acts or practices in violation of Section 5 of the FTC Act. The statement distinguishes intentional ideological steering (potentially deceptive) from AI hallucinations (not by themselves a Section 5 concern). The public comment period closes July 31, 2026.",
    takeaways: [
      "The FTC's core position: steering an AI model's outputs toward undisclosed ideological objectives, whether self-initiated or in response to a state law requirement, can constitute consumer deception under Section 5 of the FTC Act regardless of motivation — commercial, political, or legal compliance.",
      "An AI company can avoid Section 5 liability through clear, conspicuous, and adequate disclosures that its system prioritizes certain objectives over what users request or would otherwise expect — disclosure is framed as the primary defense mechanism.",
      "The statement singles out Colorado's Artificial Intelligence Act as an example of state law that may pressure AI companies to suppress output accuracy to avoid disparate impact liability, concluding such a state law may be impliedly preempted by federal Section 5 — a preemption argument with potential implications for state AI equity regulations nationwide.",
      "The FTC distinguishes hallucinations (arising from technological limitations, not an enforcement concern by themselves) from intentional suppression (a design choice subject to Section 5 enforcement), establishing a framework that focuses on intentional conduct and reinforces disclosure as the governing mechanism."
    ]
  },
  { id: 233, date: "2026-06-23", added: "2026-07-06",
    title: "Medicare's AI Push Snarls Patients and Doctors in Errors and Delays",
    source: "Darius Tahir — KFF Health News",
    sourceUrl: "https://kffhealthnews.org/medicare/medicare-ai-prior-authorization-wiser-delays-errors/",
    category: "policy", geography: "us",
    evidence: "commentary",
    keyFinding: "Medicare's WISeR pilot, launched in January 2026 to apply AI-assisted prior authorization to 13 medical services across six states, has produced processing delays, payment backlogs, and apparent AI errors rather than the promised streamlining. Reporting documents denials and confusion among providers and patients, contradicting the administration's stated goal of reducing prior-authorization burdens.",
    takeaways: [
      "The University of Washington medical system reported nearly 100 patients waiting for epidural injections amid WISeR delays, and physicians described payment delays of six to eight weeks against a promised fifteen days.",
      "Documented errors include a denial asserting a patient was ineligible for thoracic procedures when the patient actually needed a neck injection, illustrating the risk of AI mistakes in coverage decisions.",
      "Roughly 84% of commercial insurers already use AI tools per a 2025 NAIC survey, though insurers say the tools are not used to deny prior-authorization requests; Medicare's seven-month WISeR rollout left vendors still adding features into spring."
    ]
  },
  { id: 234, date: "2026-06-01", added: "2026-07-06",
    title: "Soccer Fans, You're Being Watched",
    source: "Vas Panagiotopoulos — WIRED",
    sourceUrl: "https://www.wired.com/story/soccer-world-cup-biometric-surveillance/",
    category: "surveillance", geography: "intl",
    evidence: "commentary",
    keyFinding: "WIRED reports that stadiums hosting the 2026 World Cup across the United States, Canada, and Mexico are deploying an array of surveillance technologies on fans, from facial recognition to anti-drone systems. The coverage details how large sporting events become testing grounds for biometric and crowd-surveillance tools with limited public oversight.",
    takeaways: [
      "Facial recognition is among the technologies used to identify and screen fans entering 2026 World Cup venues.",
      "Anti-drone systems and other crowd-surveillance tools form part of the security apparatus across the United States, Canada, and Mexico host sites.",
      "The tournament subjects attendees to an array of surveillance technologies, illustrating how mega-events expand biometric monitoring of the public."
    ]
  },
  { id: 235, date: "2026-06-17", added: "2026-07-06",
    title: "AI Is Taking Over Hospitals",
    source: "Benjamin Mazer — The Atlantic",
    sourceUrl: "https://www.theatlantic.com/health/2026/06/ai-healthcare-uber-moment/687567/",
    category: "labor", geography: "us",
    evidence: "commentary",
    keyFinding: "In this Atlantic essay, pathologist Benjamin Mazer argues that AI is being absorbed into United States health care faster than evidence and safeguards can keep up, calling it health care's Uber moment. He points to an April 2026 study, published in Science, in which ChatGPT outperformed hundreds of physicians on diagnostic challenges, while warning that real-world clinical deployment is outpacing validation.",
    takeaways: [
      "A study led primarily by Harvard and Stanford researchers, published in Science, found ChatGPT beat hundreds of physicians on written diagnostic cases; lead author Adam Rodman cautioned the result does not prove AI is ready for routine clinical practice.",
      "AI tools are already entering hospital workflows ahead of robust evidence and safety standards, a dynamic the author compares to the disruptive, regulation-outrunning expansion of ride-hailing.",
      "The piece frames AI's clinical adoption as a question of governance and trust, not just capability, given the gap between benchmark performance and validated patient care."
    ]
  },
  { id: 236, date: "2026-06-01", added: "2026-07-06",
    title: "The Tech Behind ICE: Oligarchs, Immigration Enforcement, and the Threat to Democracy",
    source: "Mijente, Just Futures Law & Surveillance Resistance Lab",
    sourceUrl: "https://notechforice.com/wp-content/uploads/2026/06/Tech-Behind-ICE-Oligarchs-Immigration-Enforcement-and-the-Threat-to-Democracy.pdf",
    category: "surveillance", geography: "us",
    evidence: "analysis",
    keyFinding: "This report documents how the Department of Homeland Security and the Trump administration are rapidly expanding immigration enforcement through AI, biometric tools, drones, and surveillance systems supplied by a small group of powerful technology companies. It frames the convergence of immigration policing and a technology oligarchy as a threat to democratic protections and maps the corporations, money flows, and mechanisms involved.",
    takeaways: [
      "The report argues immigration enforcement, pursued under a domestic-terrorism framing, serves as the justification and testing ground for a broader police-state infrastructure built on federal investment in surveillance and AI.",
      "It traces a revolving door between government and major technology firms, following contracts and financial ties that channel public money into surveillance and enforcement systems.",
      "Drawing on commissioned research, it names the major corporate actors and outlines non-violent strategies to disrupt the entanglement of big technology, immigration enforcement, and militarism."
    ]
  },
  { id: 237, date: "2026-06-18", added: "2026-07-06",
    title: "Amazon's Next Warehouse Efficiency Drive Is About Moving Humans, Not Just Packages",
    source: "Eugene Kim — Business Insider",
    sourceUrl: "https://www.businessinsider.com/amazon-warehouse-automation-moving-workers-labor-hours-robots-2026-6",
    category: "surveillance", geography: "us",
    evidence: "commentary",
    keyFinding: "Business Insider reports, citing internal Amazon documents, that the company is testing software to direct where warehouse workers are deployed, aiming to save millions of labor hours per year. The reporting frames Amazon's next automation push as optimizing the movement of human workers, not only packages, deepening algorithmic management of warehouse labor.",
    takeaways: [
      "Internal documents show Amazon developing software to reallocate workers across tasks and locations to cut labor hours, extending automation from goods handling to the scheduling of human labor.",
      "The stated goal is saving millions of labor hours annually, signaling productivity gains that translate into reduced labor demand per unit of output.",
      "The initiative illustrates how algorithmic management increasingly governs where and how warehouse employees work, a frontier of workplace automation distinct from physical robotics."
    ]
  },
  { id: 238, date: "2026-05-01", added: "2026-07-06",
    title: "Privacy Without Remedy: An Assessment of Data Broker Compliance with California Privacy Law",
    source: "Gueorguieva, King, Panidapu & Ho — arXiv",
    sourceUrl: "https://arxiv.org/abs/2605.21376",
    category: "datarights", geography: "us",
    keyFinding: "This empirical study provides the first assessment of data-broker compliance with California's Consumer Privacy Act and 2023 Delete Act, finding widespread non-compliance. Despite California's strong privacy statutes, most registered data brokers fail transparency requirements and erect friction that prevents consumers from exercising their rights.",
    takeaways: [
      "Only 9% of 522 registered data brokers fully complied with transparency requirements after the Delete Act took effect, with only slight improvement over time.",
      "An audit of 250 data brokers found 43% made it impossible for consumers to exercise all privacy rights, and 64% used design features that created substantial friction.",
      "The authors attribute the compliance gap to decentralized compliance decisions, weak enforcement, and regulatory ambiguity, and propose reforms to strengthen consumer privacy and transparency."
    ]
  },
  { id: 239, date: "2026-06-17", added: "2026-07-06",
    title: "2026 AI Report — Build for Everyone: A Framework for LGBTQ Representation and Safety in AI",
    source: "GLAAD",
    sourceUrl: "https://glaad.org/2026-ai-report-build-for-everyone/",
    category: "equity", geography: "us",
    evidence: "analysis",
    keyFinding: "GLAAD's inaugural AI report presents a framework for LGBTQ representation and safety in artificial intelligence, documenting how AI systems both affect LGBTQ people and shape public perceptions of the community. It argues that AI development must account for LGBTQ users and offers recommendations for safer, more representative systems.",
    takeaways: [
      "The report identifies distinct ways AI systems impact LGBTQ people, from how they are represented in model outputs to safety and content-moderation harms.",
      "It frames inclusive design as a requirement rather than an afterthought, calling on developers to build for everyone.",
      "As GLAAD's first dedicated AI report, it establishes an advocacy framework and recommendations for LGBTQ representation and safety across AI products."
    ]
  },
  { id: 240, date: "2026-04-16", added: "2026-07-06",
    title: "Acceleration Is Not a Strategy: A Framework for Directing AI Towards Public Value Before It's Too Late",
    source: "Roa Powell, Carsten Jung — IPPR",
    sourceUrl: "https://www.ippr.org/articles/acceleration-is-not-a-strategy",
    category: "policy", geography: "intl",
    evidence: "analysis",
    keyFinding: "This IPPR report argues that governments must actively steer AI development toward public value rather than treating acceleration as a strategy in itself. It warns that passive, risk-management-only approaches risk a public backlash, and calls for bold near-term policy to direct AI innovation toward demonstrable public benefit.",
    takeaways: [
      "The authors contend governments have been too cautious and must intervene actively in citizens' interests, setting ambitious policy targets rather than relying on defensive risk management.",
      "They argue that accelerating technical capability alone is not a public strategy, and that the absence of a clear governing vision risks eroding public trust in AI.",
      "The report offers European policymakers a framework and near-term priorities for channeling AI toward measurable public value."
    ]
  },
  { id: 229, date: "2026-06-01", added: "2026-06-23",
    title: "Automation and Repression",
    source: "Daron Acemoglu, A. Arda Gitmez & Mehdi Shadmehr — NBER",
    sourceUrl: "https://www.nber.org/papers/w35336",
    category: "macro", geography: "us",
    keyFinding: "A formal political-economy model finds a complementarity between automation and repression. As capital accumulates, decentralized automation raises the capital share of national income and the likelihood of a successful worker revolt. The capitalist state's preferred response, unless the revolt threat is very weak, is repression rather than redistribution, and higher capital stock encourages more automation, which encourages still more repression. The long-run trajectory tends toward authoritarianism.",
    takeaways: [
      "Decentralized automation decisions raise capital's share of national income and increase the probability of a successful worker revolt, generating a political reaction to the resulting inequality.",
      "The capitalist state trades off redistribution and repression. Repression dominates unless the revolt threat is very weak or the capital stock is very low, and a higher capital stock encourages more automation, which encourages more repression.",
      "The complementarity holds even when firms can also invest in new labor-intensive tasks, meaning the standard new-task-creation counterweight to automation does not by itself rule out a repression-automation trajectory.",
      "Starting in a democracy, capital accumulation and automation make capitalists more willing to support a coup, framing the model as a structural account of democratic backsliding in technologically advanced capitalist economies."
    ]
  },
  { id: 230, date: "2026-04-01", added: "2026-06-23",
    title: "How AI Aggregation Affects Knowledge",
    source: "Daron Acemoglu, Tianyi Lin, Asuman Ozdaglar & James Siderius — NBER",
    sourceUrl: "https://www.nber.org/papers/w35036",
    category: "macro", geography: "us",
    keyFinding: "An extended DeGroot social-learning model with an AI aggregator trained on population beliefs identifies a sharp threshold on aggregator update speed. When the aggregator updates too quickly, no positive-measure set of training weights robustly improves long-run learning across environments. Slow enough updating restores a set of weights that robustly improves learning, making aggregator update frequency a first-order policy parameter independent of the model's raw accuracy.",
    takeaways: [
      "Embedding an AI aggregator into social-learning dynamics changes the long-run outcome substantively. Aggregator training weights determine whether population beliefs converge toward, or diverge from, the efficient benchmark.",
      "The model identifies a sharp speed threshold. Too-fast aggregator updating eliminates any robustly learning-improving weight choice, while sufficiently slow updating restores a positive-measure set of configurations that improve learning.",
      "The result implies a governance dimension to AI aggregator design that has no analog in static prediction quality. How often models retrain on the population's beliefs is a first-order parameter for the social-information ecosystem.",
      "The threshold result holds across a broad class of environments rather than a specific application, suggesting it functions as a structural constraint on AI aggregator deployment rather than an implementation detail to tune."
    ]
  },
  { id: 231, date: "2026-02-01", added: "2026-06-23",
    title: "AI, Human Cognition and Knowledge Collapse",
    source: "Daron Acemoglu, Dingwen Kong & Asuman Ozdaglar — NBER",
    sourceUrl: "https://www.nber.org/papers/w34910",
    category: "macro", geography: "us",
    keyFinding: "A dynamic model of generative and agentic AI use finds that personalized AI advice can undermine the human effort that produces shared general knowledge, driving the economy toward a knowledge-collapse steady state in which general knowledge erodes despite high-quality personalized AI outputs. Welfare peaks at intermediate AI accuracy, not maximum accuracy, and improved aggregation of human-generated knowledge consistently enhances both welfare and resilience.",
    takeaways: [
      "Generative AI provides superior context-specific recommendations, but that same superiority erodes the incentives for human learning that historically generated shared, general knowledge spillovers.",
      "The model identifies a knowledge-collapse steady state in which general knowledge effectively disappears even as personalized AI advice remains accurate, an information-ecosystem failure that pure efficiency metrics do not register.",
      "Maximum AI accuracy is not the welfare-optimal target. Welfare is maximized at intermediate AI accuracy, providing a formal foundation for information-design regulations that intentionally constrain AI capability or coverage in some domains.",
      "Improved aggregation of human-generated general knowledge robustly improves welfare and resilience, suggesting public knowledge infrastructure (open archives, peer review, attribution standards) may matter more than constraints on AI accuracy itself."
    ]
  },
  { id: 232, date: "2019-05-01", added: "2026-06-23",
    title: "Automation and New Tasks: How Technology Displaces and Reinstates Labor",
    source: "Daron Acemoglu & Pascal Restrepo — Journal of Economic Perspectives",
    sourceUrl: "https://www.aeaweb.org/articles?id=10.1257/jep.33.2.3",
    category: "labor", geography: "us",
    keyFinding: "A task-content framework decomposes automation into displacement effects (capital replacing labor in specific tasks, always reducing the labor share) and reinstatement effects (creation of new tasks where labor has comparative advantage, always raising the labor share). An empirical decomposition attributes slower U.S. employment growth over three decades to an accelerated displacement effect, especially in manufacturing, a weaker reinstatement effect, and slower overall productivity growth than in previous decades.",
    takeaways: [
      "The task-content framework formalizes the long-running debate over automation by separating two effects that move the labor share in opposite directions. Displacement always lowers it, reinstatement always raises it.",
      "Automation can reduce aggregate labor demand even as it raises productivity, contradicting the assumption that productivity growth automatically translates into wage growth, an assumption embedded in many AI-era productivity narratives.",
      "The empirical decomposition shows that slower U.S. employment growth in recent decades reflects three reinforcing trends: faster displacement (most pronounced in manufacturing), weaker reinstatement of new labor-intensive tasks, and slower overall productivity growth.",
      "The framework provides the foundational vocabulary for AI labor-market analysis. Many subsequent AI displacement studies build on its displacement/reinstatement decomposition, including the authors' own AI-specific work and the broader pro-worker AI research direction."
    ]
  },
  { id: 225, date: "2026-06-01", added: "2026-06-22",
    title: "Policy on the AI Exponential: Macroeconomics and Tax Policy",
    source: "Dario Amodei",
    sourceUrl: "https://darioamodei.com/post/policy-on-the-ai-exponential#2-macroeconomics-and-tax-policy",
    category: "macro", geography: "us",
    evidence: "commentary",
    keyFinding: "In the macroeconomics and tax policy section of this essay, Anthropic CEO Dario Amodei argues that powerful AI could reverse the usual growth-versus-equity tradeoff, driving rapid growth while causing large-scale, enduring labor displacement. The central policy challenge then becomes ensuring the gains are broadly shared rather than stimulating growth. He frames enduring job displacement as undesirable and dangerous, warranting active prevention rather than acceptance.",
    takeaways: [
      "Amodei outlines a staged response: measurement and tracking of AI's labor effects, pro-employment incentives such as wage insurance, retention tax credits, and workforce training, and longer-term income support including universal basic income financed through corporate or capital gains taxation.",
      "He argues AI's recursive self-improvement could supercharge growth by accelerating science and technology, but that growth alone will not distribute its benefits without deliberate policy.",
      "He warns that economic instability may surface indirectly as public hostility toward data centers unless policy addresses the broader anxieties underneath, and notes AI companies should absorb energy-cost increases, a step Anthropic has pledged to take."
    ]
  },
  { id: 226, date: "2026-06-01", added: "2026-06-22",
    title: "A Policy Framework for AI's Impact on Work (Anthropic Economic Policy Framework)",
    source: "Anthropic",
    sourceUrl: "https://www-cdn.anthropic.com/files/4zrzovbb/website/9ea607a5dd67c168093829b701f3a0a6d21156d5.pdf",
    category: "policy", geography: "us",
    evidence: "industry",
    keyFinding: "Anthropic's June 2026 policy framework organizes US responses to AI's labor impact by severity, separating steps that make sense now from responses to hold ready if displacement worsens. It states the company is not seeking job displacement and is working to prevent or minimize it, and that financial support for affected workers, while necessary, is not sufficient because there is dignity in work. The stated aim is to buy time by making the economy more flexible and resilient as AI accelerates.",
    takeaways: [
      "The framework stresses that adaptation is not automatic: whether an AI economy creates reachable new work depends on deliberate choices by governments and firms, and it urges companies to deploy AI to expand capacity rather than default to headcount reduction.",
      "Concrete firm-level steps include building workforce training into AI deployment, deciding in advance how freed-up capacity is used, retraining and redeploying workers as roles change, and redesigning early-career roles around AI.",
      "It cites early US evidence that entry-level workers in the occupations most exposed to AI have seen weaker employment growth, and situates its recommendations against forecasts ranging from modest productivity growth to scenarios where output doubles but wages collapse."
    ]
  },
  { id: 227, date: "2026-06-01", added: "2026-06-22",
    title: "AI, the Economy, and You: A People-Centered AI Agenda",
    source: "Dennis Kelleher, Evan LeFlore — Better Markets",
    sourceUrl: "https://bettermarkets.org/wp-content/uploads/2026/06/BetterMarkets_AI_The_Economy_and_You_June2026.pdf",
    category: "macro", geography: "us",
    evidence: "analysis",
    keyFinding: "This Better Markets report argues that AI is fundamentally a story about its impact on everyday Americans and the economic, financial, and democratic systems they depend on, not primarily a technology story. Its premise is that 'change is certain, progress is not,' and that firms racing for first-mover advantage and short-term profit are driving AI development with the public interest treated as an afterthought. It calls for a people-centered AI mindset, framework, and agenda to channel change into broadly shared progress.",
    takeaways: [
      "The report maps AI's near-term reach into consequential individual decisions: whether someone gets a credit or debit card and at what rate, qualifies for a loan or insurance, has a claim paid, or keeps a job or earns a raise.",
      "At the macro level it frames a set of either/or stakes, including whether AI creates broad-based growth or concentrates gains at the top, strengthens or destabilizes the financial system, reduces or worsens inequality, and protects or exploits consumers, investors, and depositors.",
      "It positions responsible developers and corporate leaders as necessary allies, arguing that collaborative and inclusive decision-making determines whether AI's outcomes improve or worsen Americans' lives."
    ]
  },
  { id: 228, date: "2026-02-23", added: "2026-06-22",
    title: "Building Pro-Worker Artificial Intelligence",
    source: "Daron Acemoglu, David Autor, Simon Johnson — The Hamilton Project (Brookings)",
    sourceUrl: "https://www.hamiltonproject.org/wp-content/uploads/2026/02/20260223_THP_ProWorkerAI_Paper.pdf",
    category: "labor", geography: "us",
    evidence: "analysis",
    keyFinding: "This Hamilton Project paper defines pro-worker technologies as those that make human skills and expertise more valuable by expanding worker capabilities. It distinguishes five categories of technological change (labor-augmenting, capital-augmenting, automating, expertise-leveling, and new-task-creating) and argues only the new-task-creating category is unambiguously pro-worker. While AI's capacity to automate is substantial, the authors argue its underexploited potential to collaborate, by extending human judgment, enabling new tasks, and accelerating skill acquisition, is equally transformative.",
    takeaways: [
      "The authors identify market failures, including misaligned firm and developer incentives, path dependence, and a pervasive pro-automation ideology, that lead to systematic underinvestment in pro-worker AI.",
      "They propose nine policy directions to reshape incentives toward pro-worker AI, including targeted investments in health care and education, tax code reform, antitrust enforcement, and intellectual property protections for worker expertise.",
      "The framework is illustrated through examples spanning aviation maintenance, electrical services, custodial work, education, patent examination, and gig delivery, showing how the same AI capability can either commodify or augment expertise depending on design and deployment."
    ]
  },
  { id: 207, date: "2026-05-05", added: "2026-06-04",
    highlight: { stat: "$79 trillion", text: "redirected away from the bottom 90% of American workers since 1975, roughly $1 million per worker over a career.", themeId: "displacement" },
    title: "Recovering Wages and Wealth: What We Deserve in the Age of AI",
    source: "Rayan Semery-Palumbo — Economic Security Project",
    sourceUrl: "https://economicsecurityproject.org/resource/recovering-wages-and-wealth/",
    category: "policy", geography: "us",
    evidence: "analysis",
    keyFinding: "This policy memo argues that since 1975, deliberate policy choices redirected approximately $79 trillion in income growth away from the bottom 90% of American workers, approximately $1 million per worker over a career. It proposes reframing guaranteed income programs as 'Recovered Wages & Wealth' rather than charity. The author argues this narrative shift is essential for building politically durable cash assistance in the age of AI-driven automation.",
    takeaways: [
      "The 'Recovered Wages' frame treats cash grants as partial compensation for underpaid labor — both formal employment and unpaid caregiving — recognizing contributions already made but never fully compensated, rather than presenting cash assistance as charity or economic obsolescence response.",
      "The 'Recovered Wealth' frame addresses how wage suppression compounds across generations: Millennials are projected to lose $700,000 and Gen Z approximately $900,000 in lifetime wages and wealth relative to what equitable growth would have delivered.",
      "Research cited shows Americans reject cash assistance framed as response to automation obsolescence but accept it when presented as recognition of underpayment, making the narrative architecture of GI programs as consequential as their design.",
      "Historical precedent — particularly Social Security, framed as earned benefit — demonstrates that programs built on meritocratic deservingness language prove far more politically durable than those presented as needs-based assistance."
    ]
  },
  { id: 208, date: "2026-02-04", added: "2026-06-04",
    title: "Guaranteed Income and Employment in California",
    source: "Economic Security Project",
    sourceUrl: "https://economicsecurityproject.org/resource/guaranteed-income-and-employment-in-california/",
    category: "labor", geography: "us",
    evidence: "analysis",
    keyFinding: "Synthesizing findings from over 60 California guaranteed income pilots, this brief documents that, contrary to critics' predictions, unconditional cash increases full-time employment. Major pilot participants obtained full-time work at up to double the rate of control groups and pursued business ventures at five times the rate of controls. The brief also finds that the cash enables workforce transitions by reducing the economic desperation that traps workers in inadequate jobs.",
    takeaways: [
      "Financial stability enables workforce mobility: Sacramento participants who could cover a $400 emergency expense increased from 15% to 34% after receiving guaranteed income, directly expanding the capacity for genuine labor market choice rather than desperation-driven employment decisions.",
      "Cash enables education and skill development: nearly half of San Francisco's MOMentum participants enrolled in education or training programs while receiving guaranteed income, with 86% crediting the payments for making enrollment possible.",
      "Guaranteed income supports working caregivers: Oakland participants attended more parent-teacher conferences while maintaining employment, documenting that cash resolves the caregiving-work trade-off that reduces labor force quality for parents in low-income households.",
      "Policy implications include eliminating costly work requirements from existing safety net programs, ensuring GI payments do not affect eligibility for other benefits, and pairing programs with wraparound services for vulnerable populations including domestic violence survivors and people experiencing homelessness."
    ]
  },
  { id: 209, date: "2025-10-17", added: "2026-06-04",
    title: "Cash Transfers Improve Maternal, Infant, and Child Health Outcomes in the U.S.",
    source: "Economic Security Project",
    sourceUrl: "https://economicsecurityproject.org/resource/micc-memo/",
    category: "wellbeing", geography: "us",
    evidence: "analysis",
    keyFinding: "This brief synthesizes research showing that monthly cash transfers of $250–$500 reduce maternal stress and associated health complications, including preeclampsia, preterm birth, and low birthweight. The RxKids program in Flint and Detroit achieved up to 18% reductions in preterm births and 29% decreases in NICU stays, producing approximately $8,342 in social benefits per $1,000 provided.",
    takeaways: [
      "Cash transfers of $1,000 during pregnancy reduce low birthweight by 2–3.5% and increase full-term births, establishing a direct biological pathway from income support to neonatal health outcomes independent of healthcare access.",
      "The RxKids program's documented 18% preterm birth reduction and 29% NICU decrease are among the largest documented outcome improvements in the guaranteed income literature and directly demonstrate fiscal return on investment for health systems.",
      "Cash improves mental health and reduces stress, decreasing anxiety among recipients, the psychological mechanism through which financial security translates to improved physical health outcomes during pregnancy.",
      "Policy recommendations include federal reinstatement of expanded Child Tax Credits, maternal-infant cash pilots at federal level, and state use of TANF dollars and Medicaid waivers, positioning cash assistance as a cost-effective public health intervention."
    ]
  },
  { id: 210, date: "2025-10-01", added: "2026-06-04",
    title: "What We Know About the Effect of Guaranteed Income on Housing, Financial Security, and Employment",
    source: "University of Chicago Inclusive Economy Lab",
    sourceUrl: "https://urbanlabs.uchicago.edu/attachments/40baa6d7e49551dc92e9a4204af9cb10dbc566f9/store/596a5de8256dd10415e8c3125c8cd78d670908a4ed0672f3d0c824a3c293/Policymakers%27+Report.pdf",
    category: "policy", geography: "us",
    evidence: "analysis",
    keyFinding: "This policymakers' report synthesizes findings from three of the most methodologically rigorous U.S. guaranteed income RCTs: OpenResearch Unconditional Cash Study (ORUS), Baby's First Years (BFY), and the Compton Pledge. It finds that unconditional cash likely reduces poverty, boosts savings, cuts housing burden, and improves nutrition. The report also documents modest declines in labor force participation in more recent pilots, providing a nuanced evidence synthesis for policymakers designing the $42 million Cook County Promise Pilot.",
    takeaways: [
      "The three synthesized studies all used RCT designs with published pre-analysis plans and sufficient sample sizes — the gold-standard evidence base — making their convergent findings on poverty reduction, savings accumulation, and housing stability substantially more reliable than pilot self-reports or non-experimental evaluations.",
      "More recent GI pilots find modest declines in labor force participation and earned income, a finding that complicates the simple narrative that cash always increases employment and requires honest communication with policymakers about the full evidence picture.",
      "Cash reduces housing burdens and improves housing quality across multiple studies, establishing a cross-site pattern that extends beyond individual pilot contexts to a more generalizable finding about how recipients prioritize unconditional income.",
      "The report frames its synthesis as a tool for policymakers navigating over 150 no-strings-attached cash programs launched across the U.S. in recent years, providing sober analysis of both promising and cautionary findings rather than advocacy."
    ]
  },
  { id: 211, date: "2025-06-01", added: "2026-06-04",
    title: "Guaranteed Income: A Policy Landscape Review of 105 Programs in the United States",
    source: "Sarina Rodriguez et al. — Basic Income Studies",
    sourceUrl: "https://gicp.info/wp-content/uploads/sites/164/2024_Brinkley_Basic-Income.pdf",
    category: "policy", geography: "us",
    evidence: "peer-reviewed",
    keyFinding: "This peer-reviewed landscape review assembles and systematically analyzes 105 guaranteed income programs across the United States, covering more than 40,000 beneficiaries. It documents that just over half use income-based eligibility, 84% incorporate place-based eligibility criteria, and 28 programs are based in California. A significant tension exists between the community development framing used in program outreach and the economic or public health frameworks used for funding and evaluation.",
    takeaways: [
      "The framing-measurement mismatch — programs presented to communities in asset-building, empowerment language but evaluated through economic or public health outcome frameworks — may have structural implications for program sustainability and the alignment of lived experience with official accountability metrics.",
      "California's outsized role (28 of 105 programs) and the prevalence of county-level programs (16) reflect a pattern of subnational policy innovation filling gaps left by federal inaction on guaranteed income.",
      "The landscape reveals high heterogeneity in benefit levels, duration, and conditionality across programs, 'guaranteed income' encompasses a wide range of designs rather than a single model, making cross-program comparison methodologically challenging.",
      "The inventory establishes a baseline for identifying gaps, redundancies, and opportunities for more rigorous comparative research, the field currently lacks standardized outcome measurement that would allow genuine learning across the 105+ programs operating simultaneously."
    ]
  },
  { id: 212, date: "2026-01-16", added: "2026-06-04",
    title: "State Fact Sheets: How States Spend Funds Under the TANF Block Grant",
    source: "Center on Budget and Policy Priorities",
    sourceUrl: "https://www.cbpp.org/research/income-security/state-fact-sheets-how-states-spend-funds-under-the-tanf-block-grant",
    category: "policy", geography: "us",
    evidence: "analysis",
    keyFinding: "In 2023, states spent only approximately one-quarter of combined federal and state TANF funds on basic assistance, the direct cash payments to families with children. There were 19 states spending less than 10% of TANF funds on basic assistance. This documents the systematic redirection of the $16.5 billion annual federal block grant away from direct income support, establishing the scale of available resources that could fund guaranteed income programs through TANF repurposing.",
    takeaways: [
      "Only 9 states spent more than 30% of TANF on basic assistance; the majority redirect funds to activities unrelated to TANF's core poverty-reduction mandate — including using TANF as general state budget substitution — establishing that the political choices driving inadequate cash support are state-level, not federal funding constraints.",
      "State-by-state variation is extreme: the same federal block grant produces radically different outcomes depending on state policy choices, meaning the path to guaranteed income expansion runs through state legislatures and governors as much as through federal authorization.",
      "TANF repurposing represents one of the most immediately actionable funding mechanisms for guaranteed income pilots: states can redirect existing block grant dollars without new federal legislation, as several cities and counties have already demonstrated.",
      "Research evidence shows that investments in cash assistance improve academic, health, and economic outcomes for children in families experiencing poverty, making the state spending pattern documented here not merely a fiscal anomaly but a documented contributor to child poverty and inequality."
    ]
  },
  { id: 213, date: "2024-12-11", added: "2026-06-04",
    title: "The Protective Power of Cash",
    source: "NYC Family Policy Project",
    sourceUrl: "https://familypolicynyc.org/report/cash/",
    category: "equity", geography: "us",
    evidence: "analysis",
    keyFinding: "This report documents that New York City's cash assistance structure fails families through four structural problems: benefit levels below poverty thresholds, bureaucratic barriers, payment unpredictability, and inadequate responsiveness. It establishes a direct link between income support generosity and reduced child welfare system involvement. The report frames unconditional cash as a child welfare prevention tool for the city's 100,000+ families on cash assistance.",
    takeaways: [
      "Benefit unpredictability and conditionality create anxiety that actively hinders family reunification and self-sufficiency goals, the current system's design generates the instability it claims to address, documented through case studies of mothers fearful of losing benefits when circumstances improved.",
      "Economic research establishes a direct causal pathway: protecting families from hardship reduces child welfare investigations and family separation, making increased cash assistance a cost-effective alternative to child welfare system involvement that costs far more per family.",
      "Five policy recommendations — increasing benefit levels toward the poverty line, raising asset limits, reducing administrative burden, implementing targeted guaranteed income for families at critical transition points, and expanding emergency cash — provide a concrete state and city legislative agenda.",
      "With approximately 25% of NYC children living in poverty, the scale of need makes unconditional cash not merely a pilot intervention but a necessary structural component of an adequate urban social safety net."
    ]
  },
  { id: 214, date: "2024-01-01", added: "2026-06-04",
    title: "Enhancing Economic Stability: The Role of Guaranteed Income in Comprehensive Support Systems",
    source: "Stacia West et al. — Center for Guaranteed Income Research",
    sourceUrl: "https://upenn.app.box.com/v/Enhancing-Economic-Stability",
    category: "policy", geography: "us",
    evidence: "analysis",
    keyFinding: "This policy brief from Penn's Center for Guaranteed Income Research argues that guaranteed income functions as a stabilizing foundation that amplifies the effectiveness of wraparound services, workforce development programs, and social services. This is because financial insecurity creates cognitive and time burdens that prevent individuals from engaging productively with other support services. GI resolves this bottleneck by providing predictable income that enables planning and investment.",
    takeaways: [
      "The 'cognitive tax' of financial insecurity — well-documented in behavioral economics research — means that poverty itself impairs the executive function and planning capacity needed to engage effectively with case management, job training, and other support services; GI resolves the underlying cause rather than treating symptoms.",
      "GI should be integrated into existing program architectures rather than treated as a replacement for other services, the brief explicitly situates guaranteed income within a continuum of supports, addressing the common policymaker concern that GI competes with or displaces existing safety net programs.",
      "The brief provides practical guidance on program design for GI integration: how to structure referral pathways, coordinate benefits, and design intake processes that connect GI recipients with complementary services without recreating the bureaucratic burden current programs impose.",
      "The framing of GI as infrastructure for other services rather than a standalone intervention is strategically significant for policy adoption: it allows advocates to argue for GI within existing programmatic frameworks rather than as a disruptive replacement."
    ]
  },
  { id: 215, date: "2024-11-01", added: "2026-06-04",
    title: "A Policy Framework for Guaranteed Income and the Safety Net",
    source: "Stacia West et al. — Center for Guaranteed Income Research",
    sourceUrl: "https://upenn.app.box.com/v/GI-and-Safety-Net",
    category: "policy", geography: "us",
    evidence: "analysis",
    keyFinding: "This policy brief develops a structured framework for integrating guaranteed income into the existing safety net. It addresses the 'benefits cliff' problem, where GI recipients lose other assistance as income rises. The brief proposes design principles including benefit disregards, waiver mechanisms, and legislative changes to allow simultaneous receipt of GI and existing supports.",
    takeaways: [
      "The benefits cliff is the primary structural threat to GI program effectiveness: when unconditional cash triggers reductions in SNAP, Medicaid, housing assistance, or SSI, the net income gain can be neutral or negative, making benefit disregard provisions as consequential as the cash transfer amount itself.",
      "Short-term workarounds (program-level waivers, as achieved in Chicago's SSI exemption for GI recipients) and longer-term structural reforms (legislative benefit disregards) require distinct advocacy strategies, the framework provides a roadmap for both timelines simultaneously.",
      "Equity considerations are central: the framework specifically addresses ensuring programs reach marginalized populations — undocumented immigrants, people with disabilities, and justice-involved individuals — who are systematically excluded from current safety net programs and face the greatest barriers to GI access.",
      "TANF repurposing, state general funds, and federal pilot authorization represent the three most viable funding mechanisms; each requires different administrative and legislative pathways and carries different conditionality implications for program design."
    ]
  },
  { id: 216, date: "2023-07-01", added: "2026-06-04",
    title: "Recurring Cash Transfers to Enhance the Mental Wellbeing of Americans",
    source: "Stacia West et al. — Nature Mental Health",
    sourceUrl: "https://www.nature.com/articles/s44220-023-00025-z",
    category: "wellbeing", geography: "us",
    evidence: "peer-reviewed",
    keyFinding: "This perspective piece in Nature Mental Health argues that recurring unconditional cash transfers represent an underutilized mental health prevention strategy, addressing the economic root causes of psychological distress rather than treating downstream symptoms. The key mechanism is that predictable, recurring income reduces the chronic financial anxiety and stress that poverty and volatility generate, distinct from the effects of absolute income level.",
    takeaways: [
      "The recurring and predictable nature of cash transfers — not just the income level — is the critical mechanism: it is financial volatility and the chronic anxiety of income uncertainty, not merely poverty per se, that drives many of the mental health disparities documented in low-income populations.",
      "Reframing GI programs as mental health infrastructure investments rather than purely economic interventions opens new funding streams, political coalitions, and evaluation frameworks, mental health return on investment may be as compelling as economic return on investment for health system and government funders.",
      "The argument extends to AI disruption context directly: as automation increases income volatility for workers in transitioning industries, the mental health case for guaranteed income becomes stronger independently of employment outcome effects.",
      "International evidence from conditional cash transfer programs in lower-income countries and domestic GI pilots both support the mental health pathway, suggesting the mechanism is robust across very different program contexts and income levels."
    ]
  },
  { id: 217, date: "2023-05-18", added: "2026-06-04",
    title: "Guaranteed Income and Financial Treatment Trial (GIFT Trial): Reducing Financial Toxicity in Low-Income Cancer Patients",
    source: "Meredith Doherty et al. — Frontiers in Psychology",
    sourceUrl: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1179320/full",
    category: "wellbeing", geography: "us",
    evidence: "peer-reviewed",
    keyFinding: "This study protocol describes an RCT testing whether $1,000/month unconditional cash transfers reduce 'financial toxicity,' the economic hardship linked to anxiety, depression, treatment non-adherence, and increased mortality. The trial enrolls 250 low-income Medicaid-enrolled patients with Stage 3–4 cancer. It secured a first-of-its-kind SSI benefit waiver ensuring participants retain disability income while receiving GI payments.",
    takeaways: [
      "Approximately one-third of cancer patients experience significant financial hardship linked to treatment non-adherence and increased mortality, establishing that income loss from illness is a medical problem with clinical consequences that conventional oncology care does not address.",
      "The SSI waiver negotiated for this trial — protecting disability income benefits while participants receive GI — represents a concrete administrative precedent for the benefits cliff problem documented across GI programs generally, with potential applicability beyond the cancer context.",
      "The trial tests income support as a structural intervention in healthcare rather than navigation toward existing assistance programs, a conceptual shift from 'connect patients to resources' to 'provide resources directly' with implications for how health systems address social determinants.",
      "Cost-benefit implications are direct: if $1,000/month reduces treatment non-adherence and improves mortality in Stage 3–4 cancer, the health system cost savings from better treatment outcomes may exceed the transfer cost, establishing GI as a health system investment rather than purely a social service."
    ]
  },
  { id: 218, date: "2025-01-01", added: "2026-06-04",
    title: "Renegotiating Deservedness: A Big Qual Analysis Across Eight Guaranteed Income Experiments",
    source: "M. Philips et al. — International Journal of Social Welfare",
    sourceUrl: "https://onlinelibrary.wiley.com/doi/10.1111/ijsw.70046",
    category: "policy", geography: "us",
    evidence: "peer-reviewed",
    keyFinding: "Analyzing qualitative data from 1,517 survey respondents and 197 in-depth interviews across eight guaranteed income experiments, this study finds that GI receipt reduces internalized stigma. It shifts participants' explanatory frameworks from self-blame to structural attribution, with respondents increasingly attributing poverty to systemic inequality rather than individual failure. This pattern is consistent across both pre-pandemic (Stockton) and pandemic-era pilots.",
    takeaways: [
      "GI recipients exhibit lessened internalized stigma around receiving assistance and disengage from dominant blame narratives attributing poverty to individual moral failure, the attitudinal shift suggests unconditional cash operates on political consciousness as well as economic outcomes.",
      "The consistency of findings across pre-pandemic (Stockton) and pandemic-era experiments — controlling for the confounding effect of COVID-19 — indicates that the structural attribution shift reflects a longer-term trend in how Americans conceptualize economic hardship, not merely a pandemic artifact.",
      "The 'Big Qual' methodology — large-scale qualitative analysis across multiple studies — provides a methodological model for the GI field: individual pilots generate rich qualitative data that currently goes underutilized; pooled cross-site analysis reveals patterns invisible at the single-program level.",
      "If GI recipients develop more structural views of poverty, this may translate into political mobilization for broader systemic reforms, establishing a potential feedback loop between income support policy and political capacity building that advocates should anticipate and cultivate."
    ]
  },
  { id: 204, date: "2026-05-12", added: "2026-05-22",
    title: "Patchwork AI Hiring Laws Create Rising Compliance Risks for Employers",
    source: "Andrew J. Adams — DarrowEverett LLP",
    sourceUrl: "https://darroweverett.com/ai-hiring-workforce-management-2026-legal-analysis-updates/",
    category: "hiring", geography: "us",
    evidence: "analysis",
    keyFinding: "The absence of federal AI employment legislation has produced a fragmented, rapidly expanding patchwork of state and local regulations. These include Illinois HB 3773 (effective January 2026, private right of action), the Colorado AI Act (algorithmic impact assessments, stayed pending litigation), and NYC Local Law 144 (mandatory third-party bias audits since July 2023). This creates escalating compliance risk for multi-state employers, with Mobley v. Workday testing whether AI vendors can be held directly liable for discriminatory outputs.",
    takeaways: [
      "The compliance fragmentation is the structural problem: three leading jurisdictions have three different frameworks — Illinois requires candidate notice and creates a private right of action; Colorado mandates annual algorithmic impact assessments and AG notification (stayed by constitutional litigation brought by xAI); NYC mandates pre-deployment third-party bias audits with public results and ten-day candidate notice — meaning multi-state employers must simultaneously satisfy incompatible requirements with no federal floor.",
      "Mobley v. Workday is the most consequential pending litigation: it tests whether AI vendors can be held directly liable for discriminatory hiring outputs, a ruling that would fundamentally restructure employer-vendor risk allocation and potentially expose software companies to civil rights liability they currently disclaim through contract terms.",
      "AI-generated hiring reports may trigger Fair Credit Reporting Act obligations, a federal hook creating liability under existing law without waiting for new AI-specific legislation, and that most employers deploying algorithmic screening tools have not yet analyzed.",
      "Minimum compliance posture requires: inventorying all algorithmic tools across the full hiring lifecycle; conducting bias audits meeting the most stringent applicable state standard; implementing notice and consent protocols; negotiating vendor contracts with robust indemnification provisions; and establishing cross-functional AI governance committees, because the legal exposure is present now, not contingent on future regulation."
    ]
  },
  { id: 158, date: "2026-05-07", added: "2026-05-11",
    title: "How Platform Labor Laws Are Shaping Gig Work in Singapore and Malaysia",
    source: "Lam Le — Tech Policy Press",
    sourceUrl: "https://www.techpolicy.press/how-platform-labor-laws-are-shaping-gig-work-in-singapore-and-malaysia/",
    category: "workers", geography: "intl",
    evidence: "commentary",
    keyFinding: "Singapore's Platform Workers Act (effective January 2025) and Malaysia's Gig Workers Act (effective March 2025) establish competing Southeast Asian models for gig worker protection. Singapore acts through mandatory CPF contributions and injury insurance for delivery and ride-hail workers born after 1995, while Malaysia uses a broader tripartite framework covering freelancers. Neither mandates algorithmic transparency on pay calculation, and workers in both countries remain skeptical that formal protections translate to genuine gains without implementation teeth.",
    takeaways: [
      "Both countries adopted a 'third category' approach rather than presuming full employment status, granting targeted social protections (CPF, injury compensation, representation) without full labor rights, a model designed to balance worker protection against platform flexibility but that leaves core algorithmic management questions unaddressed.",
      "Singapore's mandatory CPF contributions and work injury compensation at employee levels represent concrete, enforceable minimums, a benchmark against which other jurisdictions implementing gig worker protections can measure their own frameworks.",
      "Neither Singapore nor Malaysia requires algorithmic transparency on pay calculation, leaving workers unable to verify or contest how earnings are determined, a gap that existing advocacy in both countries identifies as the unfinished central challenge of gig economy governance.",
      "Implementation skepticism centers on collective representation: Singapore's Platform Work Associations face criticism for state-aligned NTUC ties that may limit genuine worker leverage, while Malaysia's tripartite council lacks amendment authority, demonstrating that formal legal structures for gig worker representation do not automatically translate into effective bargaining power."
    ]
  },
  { id: 159, date: "2026-05-06", added: "2026-05-11",
    title: "The Political Economy of AI Starts in Brazil, Not Silicon Valley",
    source: "Adriana Abdenur — Tech Policy Press",
    sourceUrl: "https://www.techpolicy.press/the-political-economy-of-ai-starts-in-brazil-not-silicon-valley/",
    category: "policy", geography: "intl",
    evidence: "commentary",
    keyFinding: "Brazil and the Global South generate the data, labor, energy, and minerals underpinning AI systems while economic returns and governance authority concentrate in U.S. and Chinese firms, establishing AI as a political economy question of who owns infrastructure and captures value rather than a purely technical race, with Brazil's AI Legal Bill (PL 2338/2023) positioned as an opportunity to establish governance before systems become globally entrenched.",
    takeaways: [
      "The political economy framing challenges Silicon Valley's technology-race narrative: AI development is not a neutral technical process but a resource extraction system in which Global South populations generate essential inputs — data, low-wage content moderation, critical minerals, energy — while value and governance authority concentrate abroad, mirroring historical patterns of economic extractivism.",
      "Infrastructure concentration translates into political power: a small number of firms control data, computing capacity, capital, and specialized talent, a market structure that gives those firms influence over public discourse and election integrity, as documented in Brazil's 2026 electoral context.",
      "Brazil's AI Legal Bill (PL 2338/2023) represents an opportunity for Global South governance agency before systems become globally entrenched, requiring that governance frameworks center ownership, equitable value distribution, and local technological capacity rather than merely adapting external safety frameworks designed for dominant-economy interests.",
      "Institutions engaging in cross-border AI frameworks should assess whether their participation legitimizes governance processes that systematically exclude populations bearing the highest costs of AI development, and whether 'responsible AI' frameworks are designed to redistribute value or to entrench existing concentration."
    ]
  },
  { id: 161, date: "2026-05-05", added: "2026-05-11",
    title: "AI Efficiency Can Undermine Accountability Even With Humans in the Loop",
    source: "Nicolas Spatola — Tech Policy Press",
    sourceUrl: "https://www.techpolicy.press/ai-efficiency-can-undermine-accountability-even-with-humans-in-the-loop/",
    category: "policy", geography: "us",
    evidence: "commentary",
    keyFinding: "Research shows 'human in the loop' safeguards do not guarantee meaningful oversight. AI assistance cognitively reshapes how decision-makers evaluate their own judgment, efficiency-driven systems generate increasing reliance over time that reduces error detection capacity, and high-pressure productivity environments produce routinized acceptance rather than deliberative scrutiny. This makes automation bias a structural design problem requiring workflow redesign, not an individual cognitive failure.",
    takeaways: [
      "The cognitive reshaping finding is the most consequential: external AI assistance does not merely supplement existing decision processes, it fundamentally alters how decision-makers perceive and evaluate their own judgments. Human review of AI recommendations is not equivalent to independent human judgment; it is a cognitively distinct activity susceptible to systematic deference.",
      "Efficiency-driven systems compound the problem over time: as speed is prioritized, reliance on AI recommendations increases progressively, and as reliance deepens, the ability to detect AI errors decreases. The productivity gains justifying AI in high-stakes contexts are the same dynamics eroding the oversight those contexts require.",
      "High-pressure environments convert formal override rights into functionally empty permissions: in contexts with productivity targets and time pressure, decision-makers routinize AI acceptance as the path of least resistance, making 'human in the loop' a compliance label rather than a meaningful check.",
      "Institutions and regulators should design workflows that realistically support active scrutiny — testing for error detection capability after deployment, not just at procurement — and treat override rights as operationally meaningful only when organizational conditions for genuine deliberation actually exist."
    ]
  },
  { id: 160, date: "2026-05-04", added: "2026-05-11",
    highlight: { stat: "40%", text: "syndication cap proposed in Google antitrust remedies as a supply-side path to competition that injunctions cannot deliver.", themeId: "macro-risk" },
    title: "Search Remedies in Google Antitrust Case Can Work Even if Company Stays on Top",
    source: "Sumit Sharma — Tech Policy Press",
    sourceUrl: "https://www.techpolicy.press/search-remedies-in-google-antitrust-case-can-work-even-if-company-stays-on-top/",
    category: "corporate", geography: "us",
    evidence: "analysis",
    keyFinding: "Prohibitory injunctions blocking Google's default search contracts will prove ineffective. Supply-side remedies, such as data syndication and API access at cost-based pricing, offer a more realistic path to competition, though a 40% syndication cap limits rivals. Google's generative AI integration into search reinforces dominance that standalone AI firms like OpenAI or Anthropic are structurally unlikely to erode without additional intervention targeting AI-search integration.",
    takeaways: [
      "The analysis shifts the locus of effective antitrust intervention from conduct (blocking default contracts) to structure (mandating data access and API syndication): prohibitory injunctions leave Google's underlying structural advantages intact, while supply-side remedies that force data sharing create inputs for diverse competitors with different business models.",
      "The 40% syndication cap creates a first-mover limitation: rivals can develop competitive search components through ordered remedies, but the declining allowances in subsequent years narrow the competitive window, and rivals cannot develop all required components, particularly web-search indexes and advertising technology.",
      "Google's generative AI integration into search is the antitrust case's most consequential unresolved dimension: AI embedding and Siri partnerships reinforce distribution advantages that existing remedies do not address, and standalone GenAI companies are structurally positioned to compete in AI but not to erode Google's underlying search dominance.",
      "Effective antitrust remedies require calibration to the specific market dynamics, data access, fresh indexing requirements, and flexible licensing terms address the actual competitive bottleneck; headline conduct restrictions address the appearance of action without changing the structural conditions that produced the monopoly."
    ]
  },
  { id: 162, date: "2026-05-04", added: "2026-05-11",
    title: "Tech Policy Is on the Front Line of Fascism vs. Democracy. Pick a Side.",
    source: "Nathalie Maréchal — Tech Policy Press",
    sourceUrl: "https://www.techpolicy.press/tech-policy-is-on-the-front-line-of-fascism-vs-democracy-pick-a-side/",
    category: "policy", geography: "us",
    evidence: "commentary",
    keyFinding: "Technology policy operates in an authoritarian political context that has foreclosed professional neutrality. Age verification systems requiring biometric data create surveillance infrastructure vulnerable to government misuse, and tech industry leaders actively support deregulatory authoritarianism while TESCREAL ideologies subordinate present-tense AI harms to AGI development goals. The democratic institutions providing the regulatory framework for tech accountability face direct political threat from the industry they are meant to govern.",
    takeaways: [
      "The analysis challenges the neutrality premise of tech policy professionalism: the argument is not that practitioners should adopt partisan politics, but that combined tech industry power and authoritarian governance impulses have made the field politically contested, treating it as apolitical is itself a political choice with democratic consequences.",
      "Age verification illustrates the surveillance infrastructure risk: while protective intentions are understandable, systems requiring facial biometric data create infrastructure available for government misuse regardless of original policy intent, a pattern documented across security and identity infrastructure globally.",
      "The TESCREAL ideology critique documents a values misalignment: tech leaders who prioritize AGI development over immediate harms and frame AI safety in terms of long-run existential risk rather than present-tense discrimination and labor displacement are structurally unlikely to support regulatory frameworks that present-tense harms require.",
      "The practical implication is a reorientation of tech policy priorities: from innovation optimization to democracy protection as the organizing principle, with mandatory data minimization, privacy safeguards, and structural accountability for concentrated platform power as the near-term agenda."
    ]
  },
  { id: 163, date: "2026-04-26", added: "2026-05-11",
    title: "Democratic Governance of AI Is the Real Solution",
    source: "Holly Buck — Jacobin",
    sourceUrl: "https://jacobin.com/2026/04/ai-data-center-moratorium-democracy",
    category: "environment", geography: "us",
    evidence: "commentary",
    keyFinding: "Data center moratoria are counterproductive and inequitable, offshoring AI development while denying access to small businesses, researchers, and Global South professionals. AI data centers already produce 67 million tons of annual CO2, projected to reach 24–44 million tons specifically from AI by 2030, with hyperscalers spending the equivalent of 2.1% of U.S. GDP on infrastructure. Targeted legislation on clean energy requirements, water mandates, public wealth funds, and labor protections addresses the actual harms without the distributional inequities of infrastructure bans.",
    takeaways: [
      "The moratorium critique reframes the environmental AI governance debate: blanket infrastructure bans concentrate costs on communities least able to absorb them — small businesses, Global South professionals, independent researchers — while leaving the underlying dynamics of energy consumption, labor displacement, and value concentration unaddressed.",
      "The AI data center emissions trajectory is documented and acute: 67 million tons of CO2 annually now, projected 24–44 million tons from AI specifically by 2030, with hyperscaler infrastructure investment equivalent to 2.1% of U.S. GDP, figures that establish AI infrastructure as a material climate policy problem requiring specific binding intervention.",
      "Clean energy requirements, water-permitting standards, and efficiency mandates target actual environmental harms rather than infrastructure existence, these interventions can be calibrated to resource consumption, enforced through existing environmental regulatory frameworks, and designed to apply to domestic and foreign operators alike, avoiding the offshoring dynamic that makes moratoria ineffective.",
      "The governance architecture argument is the deepest: the problem is not data centers but the absence of democratic mechanisms to set conditions on how AI infrastructure is built and who benefits. Public wealth funds capturing a share of AI productivity gains and comprehensive labor displacement protections would extend democratic governance to AI's full economic impact, not only its environmental footprint."
    ]
  },
  { id: 206, date: "2026-04-28", added: "2026-05-22",
    highlight: { stat: "83%", text: "of workers in the 15 jobs most vulnerable to artificial intelligence are women, with women of color making up more than 30%.", themeId: "equity" },
    title: "New Analysis: More Than 30 Percent of Workers in the Most AI-Vulnerable Jobs Are Women of Color",
    source: "National Partnership for Women & Families",
    sourceUrl: "https://nationalpartnership.org/news_post/new-analysis-more-than-30-percent-of-workers-in-the-most-ai-vulnerable-jobs-are-women-of-color/",
    category: "equity", geography: "us",
    evidence: "analysis",
    keyFinding: "Women of color constitute more than 30% of workers in the most AI-exposed occupations, and women overall represent 83% of workers across the 15 most AI-vulnerable jobs. White women, Latinas, and American Indian/Alaska Native women hold shares in AI-vulnerable roles nearly double their overall workforce representation, and Black and multiracial women are overrepresented by more than 1.5 times. This compounds in-workplace AI harms including algorithmic bias, surveillance, and pay-and-scheduling automation that fall disproportionately on the same populations.",
    takeaways: [
      "The overrepresentation is compounding, not uniform: women of color are concentrated in high-risk roles at rates 1.5–2x their share of the overall workforce, meaning the intersection of gender and race produces disproportionate AI displacement vulnerability that neither a race-neutral gender analysis nor a gender-neutral race analysis would fully capture.",
      "Women represent 83% of workers in the 15 most AI-vulnerable occupations, a concentration so extreme that displacement policy designed around gender-neutral averages will systematically underserve the populations at greatest risk and misallocate protective resources toward workers facing lower actual exposure.",
      "Beyond displacement risk, the analysis documents overlapping in-workplace AI harms disproportionately affecting women workers: algorithmic bias in hiring and performance management, AI-enabled harassment and surveillance, privacy violations through workplace monitoring tools, and lack of transparency in automated pay and scheduling decisions, establishing that women workers face AI risk across multiple dimensions simultaneously, not only through job loss.",
      "The policy conclusion is that AI governance is a racial and gender equity issue requiring representation-conscious design, not merely a techno-economic one: regulatory frameworks applying neutral standards without accounting for documented overrepresentation will produce disparate outcomes even if technically non-discriminatory."
    ]
  },
  { id: 202, date: "2026-04-08", added: "2026-05-22",
    title: "The Looming Legislative and Labor Push Against Artificial Intelligence",
    source: "Paul J. Zech — Felhaber Larson",
    sourceUrl: "https://www.felhaber.com/the-looming-legislative-and-labor-push-against-artificial-intelligence/",
    category: "workers", geography: "us",
    evidence: "analysis",
    keyFinding: "AI's rapid workplace expansion is generating significant and underappreciated legal and labor relations risk for employers. Unions are securing enforceable AI restrictions through collective bargaining (ILA prohibitions on automated technologies, Las Vegas culinary mandatory-bargaining requirements), and state legislatures are advancing private-right-of-action AI employment frameworks (Minnesota SF 4689, $2,500/day damages). Employers face potential NLRA unfair labor practice exposure for AI deployment without union consultation, even before NLRB threshold guidance is settled.",
    takeaways: [
      "Union contract precedents are establishing enforceable AI limits now, before legislation: ILA agreements prohibit certain automated technologies outright; Las Vegas culinary union agreements require mandatory bargaining before introducing AI tools, creating replicable contractual frameworks that other unions can demand and that impose practical constraints ahead of any statutory requirement.",
      "Minnesota Senate File 4689 represents the direction of travel in state AI employment legislation: requiring advance employee notice, consent, recordkeeping, disclosure of AI involvement in adverse employment decisions, appeal rights, and a private right of action with damages up to $2,500 per violation per day, a framework that would create significant employer liability for non-compliant deployment.",
      "NLRA bargaining obligations for AI deployment are legally uncertain at the threshold level but already clear downstream: even without NLRB guidance on whether AI adoption itself requires bargaining, the downstream effects on terms and conditions of employment clearly do, meaning employers who deploy AI without union consultation face unfair labor practice exposure regardless of how the threshold question resolves.",
      "Practical risk management requires acting now: employers should inventory AI tools across the full employment lifecycle, develop proactive union engagement strategies before bargaining demands arrive, monitor state legislative calendars, and document good-faith compliance efforts, because the legal uncertainty is more likely to resolve toward greater obligation than less."
    ]
  },
  { id: 196, date: "2026-04-06", added: "2026-05-22",
    title: "Advancing Responsible AI Adoption and Use in the Public Sector: Three Policy Priorities for State Legislation",
    source: "Center for Democracy and Technology",
    sourceUrl: "https://cdt.org/insights/advancing-responsible-ai-adoption-and-use-in-the-public-sector-three-policy-priorities-for-state-legislation/",
    category: "policy", geography: "us",
    evidence: "analysis",
    keyFinding: "State legislatures should prioritize three structural pillars for responsible public-sector AI adoption. These are a designated chief AI officer with government-wide acceptable-use authority; public AI inventories and disclosure requirements for AI-influenced decisions; and employee training, third-party audits, and procurement safeguards. Texas SB 1964 and Montana HB 178 are cited as leading legislative models.",
    takeaways: [
      "States should designate a chief AI officer or equivalent leader to manage acceptable-use policies and govern AI tools government-wide, a structural accountability role that most state governments currently lack.",
      "Public AI inventories documenting how AI is used, tested, and governed across agencies should be required and regularly updated, creating the transparency baseline that civil rights review, auditing, and oversight all depend on.",
      "Notice and disclosure requirements for public-facing AI tools must include explanations of how outcomes were influenced by AI systems, giving affected residents the information needed to contest adverse algorithmic decisions.",
      "Procurement safeguards and third-party audits — separate from internal agency oversight — are necessary to catch failures that self-assessment cannot reliably detect in AI systems making consequential public decisions."
    ]
  },
  { id: 197, date: "2026-03-31", added: "2026-05-22",
    title: "The Empty National AI Policy Framework: Who Is in Charge of Those in Charge?",
    source: "Tom Wheeler, Bill Baer — Brookings Institution",
    sourceUrl: "https://www.brookings.edu/articles/the-empty-national-ai-policy-framework-who-is-in-charge-of-those-in-charge/",
    category: "policy", geography: "us",
    evidence: "commentary",
    keyFinding: "The Trump administration's National AI policy framework addresses symptoms rather than root causes. It fails to establish accountability for those controlling AI's essential capabilities and sidesteps dangerous power concentration. The framework leaves the core question unanswered: whether AI rules will be written by those who wield its power or by democratic institutions answerable to the public.",
    takeaways: [
      "Big Tech firms made consequential AI decisions 'with little or no transparency and review' yet the framework ignores this accountability gap entirely, a structural omission that allows dominant players to set norms without democratic check.",
      "Meaningful AI policy must address four principles: accountability (who answers for harms), access (who can use AI), agency (who controls AI decisions), and action (who enforces limits), the framework lacks all four.",
      "An expert federal agency with authority to set behavioral expectations for AI developers is necessary; the current framework relies on existing agencies and voluntary commitments that have already been shown to be inadequate.",
      "The authors frame the fundamental governance question as whether AI power will be structured to serve the public or to entrench those who currently control it, a political choice that the framework avoids making."
    ]
  },
  { id: 198, date: "2026-03-20", added: "2026-05-22",
    title: "National Policy Framework for Artificial Intelligence: Legislative Recommendations",
    source: "Executive Office of the President",
    sourceUrl: "https://www.whitehouse.gov/wp-content/uploads/2026/03/03.20.26-National-Policy-Framework-for-Artificial-Intelligence-Legislative-Recommendations.pdf",
    category: "policy", geography: "us",
    evidence: "official",
    keyFinding: "The Trump White House's national AI legislative framework recommends Congress act across seven areas. These are child protection, infrastructure, intellectual property, free speech, innovation, workforce, and federal preemption of conflicting state AI laws. It favors regulatory sandboxes and sector-specific oversight through existing agencies over new federal AI rulemaking bodies.",
    takeaways: [
      "The framework calls for federal preemption of state AI laws that conflict with a proposed national standard, while preserving state consumer and child-protection laws, a provision that would eliminate 40+ state AI frameworks and concentrate regulatory authority at the federal level.",
      "Congress is urged to require AI platforms to implement safeguards against child sexual exploitation, establish age-assurance requirements, and give parents management tools, the most prescriptive and near-term legislative priority in the document.",
      "The framework favors regulatory sandboxes and coordination through existing sector agencies over creating new federal AI oversight bodies, an institutional design choice that leaves AI governance fragmented across dozens of agencies without a coordinating accountability structure.",
      "Workforce development recommendations include integrating AI training into education programs and expanding federal study of AI-driven workforce realignment, but contain no income support, benefit program, or displaced-worker assistance provisions."
    ]
  },
  { id: 201, date: "2026-03-11", added: "2026-05-22",
    title: "Lessons from Past Trade Adjustment Policies to Support Displaced Workers in the Era of Artificial Intelligence",
    source: "Jacob Leibenluft — Washington Center for Equitable Growth",
    sourceUrl: "https://equitablegrowth.org/research-paper/lessons-from-past-trade-adjustment-policies-to-support-displaced-workers-in-the-era-of-artificial-intelligence/",
    category: "policy", geography: "us",
    evidence: "analysis",
    keyFinding: "Trade Adjustment Assistance historically failed to reach the majority of displaced workers it was designed to help. Fewer than 130,000 workers per year received TAA coverage in 2004-2006 despite approximately 2 million jobs lost to China trade shocks. However, workers who did participate earned roughly $50,000 more over 10 years post-retraining. Future AI displacement policy must be designed around three principles: commitment (stable, guaranteed programs), speed (presumptive eligibility to prevent earnings-damaging non-employment spells), and agency (worker control over adjustment pathways).",
    takeaways: [
      "TAA's core failure was coverage, not design: from 1962–1969 not a single worker received approved assistance despite 26 applications; even at its best (1975–1981, 1.3 million workers covered), the program served a fraction of those displaced, meaning any AI displacement program must solve the reach problem before effectiveness questions can be meaningfully addressed.",
      "Benjamin Hyman's rigorous Census-data analysis of TAA participants found approximately $50,000 in higher earnings over 10 years compared to non-participants, establishing that well-designed adjustment programs produce measurable long-run returns, but only for those they actually reach; program design and coverage are separable problems requiring separate solutions.",
      "Three core design principles for AI displacement policy: Commitment (guaranteed, stable programs immune to political bargaining cycles); Speed (presumptive eligibility for immediate assistance, since extended non-employment causes lasting earnings damage); and Agency (workers need meaningful control over adjustment pathways rather than impersonal bureaucratic channeling).",
      "Adjustment programs cannot serve as the sole policy response, they must complement pre-displacement prevention through augmentation-focused AI development, collective bargaining rights, universal safety nets, and tax policy discouraging automation; framing worker support exclusively as an adjustment problem implicitly accepts displacement as inevitable and shifts responsibility from policy choices onto the workers experiencing their consequences."
    ]
  },
  { id: 205, date: "2026-03-07", added: "2026-05-22",
    title: "Is AI Changing the Path to Gender Parity?",
    source: "Sam Grayling — World Economic Forum",
    sourceUrl: "https://www.weforum.org/stories/2026/03/ai-gender-parity-womens-history-month-jobs/",
    category: "equity", geography: "intl",
    evidence: "analysis",
    keyFinding: "ILO research finds approximately 29% of jobs in female-dominated occupations are exposed to generative AI versus 16% in male-dominated occupations. The study found 16% of women's jobs in the highest displacement-risk category versus 3% for men. Meanwhile, the gender gap in AI skills has narrowed in 74 of 75 economies tracked since 2018. But women's representation in European tech roles fell from 22% to 19% in three years, and at current rates full gender parity remains 123 years away.",
    takeaways: [
      "The 29% vs. 16% occupational exposure gap documents structural inequality in AI displacement risk: female-dominated occupations are nearly twice as exposed as male-dominated ones, and women's concentration in the highest-risk category (16% vs. 3% for men) is a fivefold disparity that will compound into earnings and employment gaps as AI deployment accelerates.",
      "McKinsey data shows women's representation in European tech roles fell from 22% in 2023 to 19% in 2026 despite rising AI sector activity, indicating that AI economic growth is not automatically generating proportionate gains for women, and that headline AI adoption statistics mask a gendered distribution of who captures the economic upside.",
      "Structural access barriers compound displacement risk in low- and middle-income countries: GSMA data shows women are 7% less likely to own a phone and 19% less likely to have mobile internet access; in India only 18% of young women aged 20–29 are in paid work despite near-parity in higher education, establishing that AI governance in Global South contexts cannot separate gender equity from basic digital and economic access infrastructure.",
      "The gender gap in AI skills narrowing in 74 of 75 economies is the most constructive finding, but skill acquisition alone cannot close the gap at adequate speed: structural interventions in labor market access, safe work environments, and AI sector hiring practices are necessary complements to reskilling investment, and the 123-year parity timeline at current rates demonstrates the inadequacy of market-only solutions."
    ]
  },
  { id: 200, date: "2026-02-15", added: "2026-05-22",
    title: "No Bailouts for Big Tech Billionaires: Policies for When the AI Bubble Bursts",
    source: "Matthew U. Scherer et al. — Open Markets Institute",
    sourceUrl: "https://www.openmarketsinstitute.org/publications/no-bailouts-for-big-tech-billionaires-policies-for-when-the-ai-bubble-bursts",
    category: "corporate", geography: "us",
    evidence: "analysis",
    keyFinding: "The AI sector exhibits classic speculative bubble characteristics. Eight U.S. tech companies valued at $22 trillion represent 36% of the S&P 500 (exceeding dot-com peak), five hyperscalers plan $770 billion in 2026 AI capex against only $25 billion in 2025 AI revenue, and AI infrastructure debt grew 7x year-over-year to $125 billion. Meanwhile, circular financing, special-purpose vehicles, and extended depreciation timelines may understate major tech company expenses by up to $176 billion over three years. Policymakers should categorically refuse bailouts and redirect any public support to displaced workers.",
    takeaways: [
      "The scale disconnect is the core finding: $770 billion in planned 2026 AI capex against $25 billion in 2025 AI revenue — a 31:1 investment-to-revenue ratio — mirrors and exceeds the dot-com bubble's capital misallocation pattern, with combined public and private tech equity now at 354% of GDP versus 210% at the 2000 peak.",
      "Anticipated pro-bailout arguments fail empirical scrutiny: generative AI is not militarily reliable (Army War College studies found agentic AI gives militaries a 'glass jaw' with no measurable productivity gain); AI companies lack the financial system interconnections that justified 2008 bank bailouts; and data centers serve proprietary tech interests rather than public utility functions, each of the three standard justifications for government rescue is empirically unsupported.",
      "Suspect accounting inflates the industry's financial position: circular financing between interconnected companies, special-purpose vehicles hiding debt, and chip depreciation timelines of 5–6 years against 2–3 year actual replacement cycles may collectively understate major tech expenses by up to $176 billion over three years.",
      "Policy recommendations: let failing AI companies proceed through bankruptcy; block 'failing firm' antitrust defenses that enable monopoly-consolidating mergers; strengthen accounting standards and require quarterly earnings disclosures for major private companies; redirect any public support to displaced workers and affected communities rather than tech executives and investors."
    ]
  },
  { id: 166, date: "2025-11-05", added: "2026-05-11",
    title: "San Francisco's 'Hack for Social Impact' Unleashes AI for Homelessness and Justice",
    source: "TokenRing — Hack for Social Impact",
    sourceUrl: "https://markets.chroniclejournal.com/chroniclejournal/article/tokenring-2025-11-5-san-franciscos-hack-for-social-impact-unleashes-ai-for-homelessness-and-justice",
    category: "community", geography: "us",
    evidence: "commentary",
    keyFinding: "The 2025 Hack for Social Impact hackathon produced functional AI tools for homelessness (trauma-informed intake, affordable housing building code compliance automation) and justice (tenant case navigators, Innocence Center document review), with one tool advancing to commercial viability. These tools document an emerging civic technology pipeline applying AI to housing access and wrongful conviction challenges outside conventional research and policy channels.",
    takeaways: [
      "Trauma-informed AI intake tools for homeless service navigation — allowing individuals to describe needs once rather than repeatedly across multiple systems — address a documented friction point in shelter and service access: the burden of re-disclosure on people at moments of acute vulnerability.",
      "Affordable housing code compliance automation (Comply.ai/bild.ai) addresses a documented bottleneck in housing supply: architectural plan review delays that increase development cost and timeline. Commercial viability within one year of a hackathon prototype demonstrates AI applications targeting supply constraints can move faster than legislative reform cycles.",
      "Innocence Center document review automation illustrates AI's potential to equalize legal resources: automating identification of discrepancies and evidence in case files for wrongful conviction review could accelerate case throughput for organizations operating with severely constrained legal capacity.",
      "The hackathon model itself is a governance observation: civic AI for homelessness and justice is being developed primarily through philanthropic events and university programs rather than public procurement or regulatory frameworks, concentrating development decisions in communities of technologists rather than affected populations."
    ]
  },
  { id: 165, date: "2025-09-23", added: "2026-05-11",
    title: "Can AI Help Solve the Housing Crisis?",
    source: "Adam Ruege — Community Solutions",
    sourceUrl: "https://community.solutions/research-posts/can-ai-help-solve-the-housing-crisis/",
    category: "community", geography: "us",
    evidence: "analysis",
    keyFinding: "Less than 1% of global AI investment targets social impact applications like housing. Community Solutions identifies AI potential to reduce administrative burden and identify housing development barriers while proposing a 'Home Genome Project' to standardize fragmented housing data. However, it warns the homelessness and housing sectors lack responsible AI frameworks comparable to other fields, with hallucination, capability overselling, and surveillance risks for vulnerable populations underaddressed.",
    takeaways: [
      "The 1% investment statistic frames the structural problem: AI's potential to accelerate housing crisis solutions is real — reducing administrative burden, identifying development barriers, enabling early warning systems — but severely underinvested relative to commercial applications, and the organizations most positioned to develop it are least resourced to do so responsibly.",
      "The 'Home Genome Project' concept addresses a foundational constraint: fragmented, non-standardized housing data across cities and systems prevents AI from learning patterns at useful scale. Data standardization is prerequisite infrastructure for AI applications in housing, a governance challenge more than a technical one.",
      "The responsible AI framework gap is the most urgent near-term concern: the homelessness and housing sectors lack the evaluation criteria, harm taxonomies, and deployment standards that other fields have developed. Deploying AI for vulnerable populations without these frameworks risks replicating the surveillance, dignity violations, and inaccuracy harms more developed sectors have already documented.",
      "Community Solutions' internal pilots and Bellagio Convening participation illustrate the field's current state: experimental, small-scale, and dependent on cross-sector philanthropic support, a configuration that may not produce the standardized, accountable tools the housing sector needs at scale."
    ]
  },
  { id: 164, date: "2025-07-11", added: "2026-05-11",
    title: "JusticeTech Uses AI to Address Eviction Crisis",
    source: "Ohio State University Moritz College of Law",
    sourceUrl: "https://advancement.osu.edu/story/justicetech-uses-ai",
    category: "community", geography: "us",
    evidence: "analysis",
    keyFinding: "Ohio State's JusticeTech program deploys interdisciplinary law-computer science student teams to build AI tools for eviction defense, including a tenant resource triage tool and pre-eviction online dispute resolution platform with AI-assisted budgeting. It serves Franklin County's 34,000+ annual self-help center visitors (approximately 25,000 seeking housing assistance), demonstrating replicable institutional infrastructure for AI-assisted legal access in housing.",
    takeaways: [
      "The pre-eviction dispute resolution model — enabling asynchronous landlord-tenant messaging before court filing, with AI-assisted budgeting and optional human mediation — intervenes at the point most likely to prevent eviction: before court involvement, where informal resolution is fastest and cheapest for all parties.",
      "The 34,000-visitor scale of Franklin County's self-help center documents the demand side of AI-assisted legal access: the legal need vastly exceeds current legal aid capacity, and scalable AI tools that triage and navigate that need serve a concrete documented gap.",
      "The interdisciplinary law-computer science co-production model addresses a structural problem in legal technology: tools built by technologists without legal domain knowledge frequently produce inaccurate or harmful outputs, while tools built by legal aid organizations without technical capacity frequently stall. Academic co-production offers a replicable model.",
      "Responsible AI design is built in from the outset, JusticeTech explicitly emphasizes accountability and 'looking under the hood,' reflecting a lesson from prior legal technology failures: responsible deployment standards are harder to retrofit after tools are in use than to build into initial design."
    ]
  },
  { id: 203, date: "2025-05-16", added: "2026-05-22",
    title: "AI Labor Displacement and the Limits of Worker Retraining",
    source: "Julian Jacobs — Brookings Institution",
    sourceUrl: "https://www.brookings.edu/articles/ai-labor-displacement-and-the-limits-of-worker-retraining/",
    category: "policy", geography: "us",
    evidence: "analysis",
    keyFinding: "Worker retraining programs, the most commonly proposed policy response to AI displacement, have a weak historical track record. The rigorous National JTPA Study found no statistically significant employment or earnings improvement, and a WIA evaluation found no positive earnings or employment impacts in 30 months post-enrollment. Three structural barriers (insufficient job availability, participation barriers facing displaced workers, unpredictable labor demand) mean retraining alone is an inadequate response requiring broader complementary policy.",
    takeaways: [
      "The historical evidence is not merely weak, it is actively negative: the JTPA randomized controlled trial found no statistically significant improvement in employment rates, earnings, or continuous employment; the WIA evaluation found no positive impacts in 30 months; and the 70% employment rates cited for current WIOA programs lack control groups, making causal claims impossible.",
      "Three structural barriers compound the training design problem: (1) insufficient job availability — technological advancement may reduce skilled middle-wage openings faster than workers can retrain, with displaced workers often landing in lower-paying service positions empirically; (2) participation barriers — displaced workers disproportionately face poverty, caregiving, housing instability, and health challenges that prevent meaningful engagement; (3) demand unpredictability — it is genuinely difficult to identify which occupations will survive automation.",
      "AI-specific limitations further complicate retraining design: existing displacement evidence is limited to early industrial robotics data and small experimental LLM deployments, meaning programs must be designed under genuine uncertainty about which skills will retain value as AI capability evolves.",
      "Policy recommendations: avoid assuming retraining is the answer; design for multiple displacement scenarios; fund randomized experiments specifically targeting technology-displaced workers; and reconceptualize the employment-benefits relationship, potentially exploring non-employment forms of social contribution as bases for government support rather than treating paid employment as the only legitimate activity retraining should target."
    ]
  },
  { id: 177, date: "2025-05-09", added: "2026-05-22",
    title: "AI Is Reshaping the Workplace, but Entry-Level Hires Are Way Ahead of the Game",
    source: "Stefano Puntoni — Wharton AI & Analytics Initiative",
    sourceUrl: "https://ai.wharton.upenn.edu/focus-areas/human-technology-interaction/ai-is-reshaping-the-workplace-but-entry-level-hires-are-way-ahead-of-the-game/",
    category: "labor", geography: "us",
    evidence: "commentary",
    keyFinding: "Entry-level employees are adopting generative AI tools more rapidly than their organizations, outpacing formal corporate rollout plans. This reveals a structural gap between individual worker capability and institutional AI strategy that threatens to widen internal inequality as AI-fluent new hires pull ahead of colleagues operating without AI support.",
    takeaways: [
      "The adoption gap runs in an unexpected direction: newly hired employees are ahead of their organizations, not behind, creating a configuration where formal AI strategy lags the actual capabilities already operating on the ground.",
      "This inversion has equity implications: if entry-level workers using AI informally are gaining productivity and skills that their organizations are not formally tracking or rewarding, the productivity gains may accrue to individuals without being captured in compensation or advancement.",
      "Corporate AI strategy must reckon with a workforce that is already ahead of formal rollout plans, the governance question is whether organizations will channel that informal adoption into structured benefit-sharing or allow it to remain an unmanaged individual advantage.",
      "The finding reinforces the broader pattern that AI adoption statistics measured at the organizational level undercount individual-level diffusion, particularly among younger workers who arrived with GenAI already in their toolkit."
    ]
  },
  { id: 167, date: "2025-01-01", added: "2026-05-11",
    title: "Platform Workers Act 2024 (Singapore)",
    source: "Singapore Parliament",
    sourceUrl: "https://sso.agc.gov.sg/Act/PWA2024",
    category: "workers", geography: "intl",
    evidence: "official",
    keyFinding: "Singapore's Platform Workers Act 2024, effective January 1, 2025, is one of the first statutory gig worker protection frameworks in Southeast Asia. It mandates CPF contributions and work injury compensation insurance at employee levels for delivery and ride-hail workers born after 1995, and establishes Platform Work Associations for collective representation. However, it stops short of full employment classification and does not address algorithmic transparency on pay or task assignment.",
    takeaways: [
      "The CPF contribution mandate — covering retirement savings, healthcare, and housing — addresses the most documented long-term vulnerability of gig workers: exclusion from the social insurance infrastructure that employment status provides, without which workers bear the full risk of income volatility and old-age poverty.",
      "Work injury compensation at employee-equivalent levels is the most immediately protective provision: gig workers are disproportionately injured in high-risk delivery and ride-hail contexts, and prior to the Act bore those costs without the insurance coverage that employed workers carried as a standard condition of work.",
      "Platform Work Associations — established through NTUC affiliation rather than independent union formation — provide formal collective representation while preserving Singapore's industrial relations framework, a design that builds organized labor participation without adversarial dynamics but that limits worker leverage to what state-aligned institutions will pursue.",
      "The Act's silence on algorithmic transparency is the structural gap: workers gain protections against physical and financial risk but retain no statutory right to understand how pay is calculated, how task assignment operates, or how performance metrics are applied, preserving platform power over the core economic terms of gig work while mitigating its welfare consequences."
    ]
  },
  { id: 169, date: "2024-07-01", added: "2026-05-11",
    title: "FHFA 2024 Generative AI in Housing Finance TechSprint",
    source: "Federal Housing Finance Agency",
    sourceUrl: "https://www.fhfa.gov/news/videos/inside-the-fhfa-2024-generative-ai-in-housing-finance-techsprint",
    category: "policy", geography: "us",
    evidence: "official",
    keyFinding: "The Federal Housing Finance Agency's 2024 TechSprint convened lenders, regulators, servicers, data scientists, and technology companies to explore how generative AI can promote a transparent, fair, equitable, and inclusive housing finance system. This represents FHFA's first formal institutional engagement with generative AI in regulated housing markets, signaling that AI governance in housing finance has entered the federal regulatory agenda.",
    takeaways: [
      "FHFA's framing of the challenge — 'how could generative AI promote a transparent, fair, equitable, and inclusive housing finance system' — embeds equity as a design criterion rather than a post-hoc compliance concern, a standard that, if applied in procurement and supervision, would be more demanding than existing AVM bias audit proposals.",
      "The convening of lenders, regulators, servicers, and technologists within a federal regulatory context establishes FHFA as an active participant in AI governance rather than a passive observer, creating leverage for embedding fair lending standards in AI tool design before commercial products are deployed at scale.",
      "The TechSprint model — structured rapid prototyping within a regulatory sandbox — builds agency technical capacity without waiting for rulemaking cycles: FHFA staff gain direct exposure to generative AI capabilities and limitations that inform the agency's ability to evaluate and supervise AI tools used by regulated entities.",
      "Lenders and servicers should anticipate AI-specific fair lending examination criteria emerging from FHFA's growing technical engagement: the institutional groundwork for supervisory expectations around generative AI in housing finance is being laid before those expectations are formalized."
    ]
  },
  { id: 178, date: "2024-12-12", added: "2026-05-22",
    title: "Creative Intelligence: AI and Creativity",
    source: "Kartik Hosanagar — Wharton AI & Analytics Initiative",
    sourceUrl: "https://ai.wharton.upenn.edu/events/creative-intelligence/",
    category: "macro", geography: "us",
    evidence: "commentary",
    keyFinding: "A Wharton-hosted conversation between AI researcher Kartik Hosanagar and NYT technology reporter Cade Metz examined the societal stakes of rapid AI advancement. It focused on the mavericks driving AI at major tech companies, the dual promise and danger of the technology, and how society can shape rather than simply absorb AI's trajectory.",
    takeaways: [
      "Organizations face compounding pressure to understand AI's potential while managing its risks as deployment timelines accelerate faster than governance infrastructure can absorb.",
      "The 'mavericks' framing — individuals at Google, Facebook, and OpenAI who shaped AI's direction — highlights how consequential AI decisions have been made by small groups without democratic input or accountability.",
      "Hosanagar and Metz's exchange reflects the growing gap between AI expertise and the institutions — boards, legislatures, regulators — nominally responsible for governance but structurally underprepared to exercise it.",
      "Public conversations anchored in both technical and journalistic perspectives are filling an information gap that formal governance processes have not yet addressed."
    ]
  },
  { id: 179, date: "2024-08-20", added: "2026-05-22",
    title: "AI Can't Replace You at Work. Here's Why.",
    source: "Valery Yakubovich, Peter Cappelli, Prasanna Tambe — Wharton AI & Analytics Initiative",
    sourceUrl: "https://ai.wharton.upenn.edu/focus-areas/human-technology-interaction/ai-cant-replace-you-at-work-heres-why/",
    category: "labor", geography: "us",
    evidence: "commentary",
    keyFinding: "Generative AI currently requires intensive human oversight to function, it cannot feasibly automate even routine communication tasks without sacrificing critical contextual information, and worker replacement will occur at a substantially slower pace than most productivity and displacement forecasts assume.",
    takeaways: [
      "The finding challenges the dominant displacement narrative at its technical foundation: AI is not operationally close to autonomous execution of real workplace tasks, and the gap between benchmark performance and workplace deployment is larger than popular accounts suggest.",
      "Human oversight is not a transitional phase until AI improves, it is a structural requirement for current systems, which means organizations treating 'human in the loop' as temporary are building governance frameworks on a false premise.",
      "Routine communication tasks — a frequently cited candidate for near-term automation — cannot be fully automated without losing contextual information that determines whether the communication achieves its purpose.",
      "The implication for organizations is that productivity gains from AI will come primarily from task augmentation and workflow acceleration, not from headcount reduction, and planning around the latter creates labor relations risks before the technology actually delivers it."
    ]
  },
  { id: 180, date: "2024-07-25", added: "2026-05-22",
    title: "Wharton's Inaugural AI and the Future of Work Conference: Key Findings",
    source: "Wharton AI & Analytics Initiative",
    sourceUrl: "https://ai.wharton.upenn.edu/thought-leadership/dozens-of-researchers-present-at-whartons-inaugural-ai-and-the-future-of-work-conference/",
    category: "workers", geography: "us",
    evidence: "commentary",
    keyFinding: "Wharton's inaugural AI and Future of Work Conference surfaced a critical empirical finding. Organizations implementing AI with a worker-first approach, prioritizing employee well-being over pure productivity metrics, achieved 10% higher profits and 34% higher sales per hour than productivity-first adopters. This establishes well-being orientation as the higher-performing AI deployment strategy.",
    takeaways: [
      "The 10%/34% performance differential is the most operationally significant finding: worker-first AI deployment outperforms productivity-first deployment on the financial metrics that justify AI investment, directly challenging the assumption that employee-oriented constraints reduce returns.",
      "Academic peer review is facing a structural challenge as AI-generated writing becomes indistinguishable from human writing, a research integrity problem that requires institutional responses, not just individual disclosure norms.",
      "LLM deployment trends (plugins, personalized enterprise models, smaller open-source alternatives) are enabling broader research access and reducing the compute barrier, with implications for who can deploy and study AI and who remains dependent on major provider access.",
      "Independence Blue Cross's AI-powered customer service deployment — designed to enhance agent efficiency rather than monitor performance — illustrates the worker-first model in practice: AI as a capability amplifier rather than a control mechanism."
    ]
  },
  { id: 181, date: "2024-06-18", added: "2026-05-22",
    title: "AI Tools Come with Risks. This Wharton Professor Is Teaching 'Accountable AI.'",
    source: "Kevin Werbach — Wharton AI & Analytics Initiative",
    sourceUrl: "https://ai.wharton.upenn.edu/thought-leadership/ai-tools-come-with-risks-this-wharton-professor-is-teaching-accountable-ai/",
    category: "policy", geography: "us",
    evidence: "commentary",
    keyFinding: "Wharton professor Kevin Werbach argues that AI accountability requires structured organizational frameworks — not just technical safeguards — covering algorithmic bias, operational failure modes, and governance design, and is developing educational programs to build the business leadership capacity that AI accountability requires.",
    takeaways: [
      "Accountable AI is framed as an organizational design problem, not only a technical one: the failure modes that produce harm — bias, operational errors, insufficient oversight — are governed by decisions about how AI is deployed and governed within institutions, not just how it is built.",
      "Business leaders lack the educational foundation to make AI governance decisions with full awareness of the risk landscape, a gap that formal accountability curricula at major business schools can begin to close.",
      "AI accountability frameworks must address the full deployment lifecycle: from procurement and vendor selection through monitoring and incident response, not only initial design and testing.",
      "Werbach's work signals a broader institutional shift: AI governance is moving from a technical specialty into general management education, reflecting that accountability decisions are made by people who will not write code but will deploy, configure, and oversee AI systems."
    ]
  },
  { id: 182, date: "2024-06-14", added: "2026-05-22",
    title: "Stefano Puntoni | Decision-Driven Analytics | Talks at Google",
    source: "Stefano Puntoni — Wharton AI & Analytics Initiative",
    sourceUrl: "https://ai.wharton.upenn.edu/thought-leadership/stefano-puntoni-decision-driven-analytics-talks-at-google/",
    category: "macro", geography: "us",
    evidence: "commentary",
    keyFinding: "Effective data utilization requires combining human intelligence with analytical AI capabilities, organizations gain competitive advantage not from data volume or model sophistication alone but from frameworks that integrate human judgment with analytics-driven decision support.",
    takeaways: [
      "The 'decision-driven analytics' framing inverts the standard data-first model: rather than asking what insights the data contains, organizations should start from the decisions they need to make and design analytics to support those specific choices.",
      "Human judgment and analytical capability are complements, not substitutes, the value of AI in decision support depends on the quality of the human decision framework it is integrated with.",
      "Organizations that invest in developing analytical fluency across leadership (not just technical staff) can leverage AI decision tools more effectively than those that treat analytics as a specialist function.",
      "The Google Talk format reflects the growing demand for practical AI decision-making frameworks from organizations that have access to powerful AI tools but need structured approaches to extract value from them."
    ]
  },
  { id: 183, date: "2024-06-03", added: "2026-05-22",
    title: "How Marketers Can Adapt to LLM-Powered Search",
    source: "Stefano Puntoni — Wharton AI & Analytics Initiative",
    sourceUrl: "https://ai.wharton.upenn.edu/thought-leadership/how-marketers-can-adapt-to-llm-powered-search/",
    category: "macro", geography: "us",
    evidence: "analysis",
    keyFinding: "LLM-powered search fundamentally shifts consumer brand discovery: users receive direct conversational answers rather than link lists. This requires marketers to rethink visibility strategy from SEO optimization toward accurate brand representation in AI-generated responses, a shift that concentrates market power in the LLMs determining which brands are surfaced.",
    takeaways: [
      "LLM search operates as a 'new information pipeline' where brand visibility depends on accurate AI representation, not link placement, creating a new gatekeeping layer controlled by a small number of LLM providers.",
      "The conversational, consultative nature of LLM interactions differs structurally from traditional web search: users receive conclusions rather than options, reducing the probability of exposure to non-dominant brands.",
      "Marketers need to monitor and influence how their brands appear in AI-generated query responses, a governance challenge that requires engaging LLM providers directly, not just optimizing content for indexing algorithms.",
      "The concentration of brand discovery in LLM outputs creates new competition policy questions: if a small number of AI systems determine which brands consumers encounter, the anticompetitive potential of biased or inaccurate brand representation is structurally greater than in traditional search."
    ]
  },
  { id: 184, date: "2024-05-24", added: "2026-05-22",
    title: "AI May Not Be a Job Killer, After All",
    source: "Valery Yakubovich, Peter Cappelli, Prasanna Tambe — Wharton AI & Analytics Initiative",
    sourceUrl: "https://ai.wharton.upenn.edu/focus-areas/human-technology-interaction/ai-may-not-be-a-job-killer-after-all/",
    category: "labor", geography: "us",
    evidence: "commentary",
    keyFinding: "AI is expected to create more tasks for workers while making them more productive, challenging the dominant job-elimination narrative. This suggests AI's near-term effect will be task expansion rather than headcount reduction, with the caveat that value distribution between employers and workers is a policy choice, not a technological outcome.",
    takeaways: [
      "The task-expansion finding inverts the standard automation frame: rather than AI eliminating jobs by replacing task bundles, it may expand the set of tasks workers are expected to perform, which raises questions about workload, compensation, and who captures the resulting productivity gains.",
      "Near-term AI productivity effects are more likely to manifest as increased output per worker than as reduced headcount, a dynamic that intensifies the political economy question of whether productivity gains are shared through wages or captured through margins.",
      "The research contributes to the 'augmentation vs. automation' debate with a practical organizational implication: managers planning for near-term AI impact should model task composition changes, not just headcount scenarios.",
      "Workforce dynamics may evolve alongside AI capability in ways that are more additive than subtractive, but this does not automatically translate to worker benefit without labor market conditions or policy frameworks that give workers leverage to capture a share of productivity gains."
    ]
  },
  { id: 185, date: "2024-05-07", added: "2026-05-22",
    title: "Meet the AI Expert Advising the White House, JPMorgan, Google and the Rest of Corporate America",
    source: "Ethan Mollick — Wharton AI & Analytics Initiative",
    sourceUrl: "https://ai.wharton.upenn.edu/focus-areas/future-of-work/meet-the-ai-expert-advising-the-white-house/",
    category: "policy", geography: "us",
    evidence: "commentary",
    keyFinding: "Wharton professor Ethan Mollick has emerged as a leading practitioner-advocate for deliberate generative AI adoption, advising the White House and major corporations. He argues that society still retains agency to identify and call out harmful AI applications, and must actively use it before deployment norms become entrenched.",
    takeaways: [
      "Mollick's core policy argument is about timing: society currently possesses agency to shape AI deployment norms and call out harmful applications, but this window is closing as organizational and market practices lock in before governance frameworks are established.",
      "General-purpose technologies inherently contain both beneficial and harmful consequences, the governance challenge is not to suppress the technology but to channel institutional and public pressure toward the harmful applications while enabling the beneficial ones.",
      "Mollick's cross-sector influence reflects the vacuum in AI governance expertise: the same academic can credibly advise the White House, JPMorgan, and Google simultaneously because the supply of grounded, operationally informed AI policy expertise is structurally insufficient.",
      "The profile-as-policy pattern — where individual experts fill governance gaps through advisory roles rather than institutional frameworks — is a structural symptom of the governance deficit, not a substitute for it."
    ]
  },
  { id: 186, date: "2024-04-23", added: "2026-05-22",
    title: "We're Focusing on the Wrong Kind of AI Apocalypse",
    source: "Ethan Mollick — Wharton AI & Analytics Initiative",
    sourceUrl: "https://ai.wharton.upenn.edu/focus-areas/future-of-work/were-focusing-on-the-wrong-kind-of-ai-apocalypse/",
    category: "macro", geography: "us",
    evidence: "commentary",
    keyFinding: "Public AI discourse has fixated on speculative long-run catastrophic scenarios while overlooking more immediate, tangible threats — misinformation, deepfakes, and unchecked rapid deployment — that are already materializing and require near-term governance responses.",
    takeaways: [
      "The existential risk frame is crowding out attention to present-day harms: misinformation, synthetic media used for non-consensual purposes, and rapid deployment without safety evaluation are documented current harms that urgently require regulatory responses.",
      "Organizations must proactively manage AI integration now — understanding workforce impacts, educational disruption, and deployment risks — rather than deferring governance to resolution of speculative long-run scenarios.",
      "Strategic AI deployment requires genuine evaluation before deployment rather than retrospective harm mitigation, a governance design choice that is being made right now in most organizational contexts.",
      "Redirecting public concern and institutional attention toward near-term materializing risks is essential for effective governance: organizations and policymakers who anchor AI risk assessment to existential scenarios are systematically underinvested in preventing the harms happening now."
    ]
  },
  { id: 187, date: "2024-04-22", added: "2026-05-22",
    title: "AI Will Change Work, for Better and Worse",
    source: "Prasanna Tambe — Wharton AI & Analytics Initiative",
    sourceUrl: "https://ai.wharton.upenn.edu/focus-areas/future-of-work/ai-will-change-work/",
    category: "workers", geography: "us",
    evidence: "commentary",
    keyFinding: "AI carries dual consequences for workers, creating new tasks and enhancing productivity in some dimensions while displacing others and concentrating gains among already-advantaged workers. This makes the net impact on employment and wellbeing a function of deployment choices and policy context rather than a fixed technological outcome.",
    takeaways: [
      "The dual-consequences framing resists both optimistic and pessimistic totalization: AI will produce better and worse outcomes simultaneously, and the distribution of each is a function of institutional choices about who bears costs and who captures gains.",
      "The impact of AI on workers extends beyond simple automation dynamics, human-technology interaction, task composition changes, and organizational power asymmetries all shape how AI affects worker welfare in ways not captured by employment rate statistics.",
      "Organizations and policymakers must assess AI's dual effects in context, resisting aggregate frames that average away the concentrated costs borne by specific worker populations.",
      "Research into human-AI collaboration is essential for managing the 'better and worse' distribution, the design of AI deployment, not just its adoption, determines which outcomes predominate."
    ]
  },
  { id: 188, date: "2024-03-20", added: "2026-05-22",
    title: "AI Horizons: AI and Innovation",
    source: "Angie Basiouny — Wharton AI & Analytics Initiative",
    sourceUrl: "https://ai.wharton.upenn.edu/updates/ai-horizons-ai-and-innovation/",
    category: "macro", geography: "us",
    evidence: "analysis",
    keyFinding: "Generative AI faces a 'quantity-over-quality problem,' producing abundant but imprecise results. Synthetic expert systems dramatically outperform base LLMs, running 66x faster and 400x cheaper than GPT-4 on targeted tasks while delivering more precise outputs. Human creativity retains superiority for breakthrough innovation, with AI excelling at recombination.",
    takeaways: [
      "Synthetic expert systems — specialized models built for specific tasks — vastly outperform large language models in speed and cost on targeted applications, suggesting that frontier model scale is not optimal for most organizational deployment contexts.",
      "The quantity-quality tension is operationally important: AI tools that generate abundant output create filtering and evaluation burdens for organizations that may exceed the value of the raw generation.",
      "Human creativity retains comparative advantage at breakthrough innovation; AI's strength is recombination of existing approaches at speed, making hybrid strategies (human ideation + AI elaboration and filtering) more valuable than either in isolation.",
      "ChatGPT outperforms Google at answer retrieval but underperforms on fact-checking accuracy, an asymmetry that should inform which use cases organizations treat as appropriate for AI decision support and which require human verification."
    ]
  },
  { id: 189, date: "2024-02-26", added: "2026-05-22",
    title: "How Algorithmic Management Affects Employee Helpfulness",
    source: "Armin Granulo, Stefano Puntoni — Wharton AI & Analytics Initiative",
    sourceUrl: "https://ai.wharton.upenn.edu/updates/how-algorithmic-management-affects-employee-helpfulness/",
    category: "workers", geography: "us",
    evidence: "analysis",
    keyFinding: "Employees managed by algorithms are measurably less likely to help their colleagues, particularly when algorithmic management takes the form of performance evaluation rather than other management functions. This produces a documented prosocial motivation deficit that standard productivity metrics do not capture and that accumulates as a hidden organizational cost.",
    takeaways: [
      "The prosocial motivation deficit is distinct from the individual performance effects of algorithmic management: workers under algorithmic evaluation may maintain or improve personal output metrics while simultaneously reducing cooperative behavior that is foundational to organizational functioning.",
      "The performance-evaluation mechanism is the most harmful configuration: algorithmic management that evaluates workers reduces helpfulness more severely than algorithmic management used for other functions, identifying performance scoring as the specific design choice that suppresses cooperation.",
      "Social connection strategies — shared spaces, team rotations, organized events — effectively counteract algorithmic management's isolating effects, providing practical organizational levers that do not require removing the algorithmic system.",
      "Algorithmic tools work best when paired with human judgment in performance assessment, the combination preserves the efficiency value of algorithmic monitoring while mitigating the prosocial harm of algorithmic evaluation."
    ]
  },
  { id: 190, date: "2024-02-23", added: "2026-05-22",
    title: "AI Horizons: AI and the Workforce",
    source: "Angie Basiouny — Wharton AI & Analytics Initiative",
    sourceUrl: "https://ai.wharton.upenn.edu/updates/ai-horizons-ai-and-the-workforce/",
    category: "labor", geography: "us",
    evidence: "analysis",
    keyFinding: "When properly implemented, generative AI enhances employee performance by eliminating repetitive tasks and boosting morale. Organizations must communicate AI's purpose transparently, particularly to lower-skilled workers who fear displacement, because the adoption gap between high-skilled and lower-skilled workers is an equity risk that training and messaging can partially address.",
    takeaways: [
      "Organizations must transparently communicate AI's purpose to employees — especially lower-skilled workers who fear displacement — because perceived threat reduces adoption and amplifies the very inequality the adoption gap produces.",
      "Highly skilled workers embrace AI more readily because it amplifies their existing capabilities; lower-skilled workers need tailored messaging and scaffolded support rather than the same adoption pathways designed for workers already at the top of the skill distribution.",
      "Freelancers actively integrating LLMs gain measurable competitive advantages in client acquisition and project scope, demonstrating that AI tool proficiency is already differentiating outcomes in competitive labor markets.",
      "As AI-generated resumes proliferate, writing quality becomes a less reliable hiring signal, elevating interview performance and human interaction as the primary differentiators, with equity implications for candidates who perform differently across written and oral assessment modes."
    ]
  },
  { id: 175, date: "2024-04-26", added: "2026-05-11",
    title: "AI and Consumers: The Invisible Impact on Economic Justice",
    source: "American Bar Association CRSJ",
    sourceUrl: "https://www.americanbar.org/groups/crsj/resources/on-demand/ai-consumers-invisible-impact-economic-justice/",
    category: "equity", geography: "us",
    evidence: "analysis",
    keyFinding: "ABA Civil Rights and Social Justice Section webinar documents AI-driven harms in consumer law, including lending discrimination, debt collection automation, and algorithmic decision systems affecting low-income and minority consumers. It presents ABA survey data on automated decision systems in consumer law practice. The webinar documents that AI creates invisible economic harms in financial services without consumer knowledge or meaningful recourse.",
    takeaways: [
      "AI-driven consumer harms in lending and debt collection operate through opacity: consumers typically cannot know when AI systems made the credit or collection decision affecting them, cannot access the data or model logic behind adverse determinations, and in most jurisdictions have no statutory right to human review, making discrimination invisible in precisely the contexts where enforcement depends on victim awareness.",
      "The ABA survey on consumer law and automated decision systems documents that the legal profession itself is navigating widespread deployment of automated systems affecting clients without established guidance, a gap between deployment scale and available legal frameworks that civil rights attorneys are working to close.",
      "The 'economic justice' framing connects AI consumer harms to distributional impacts: algorithmic lending discrimination, automated debt collection harassment, and insurance pricing disparities aggregate into a system of invisible economic barriers that compounds the wealth and access gaps civil rights law was designed to address.",
      "Existing consumer protection statutes — ECOA, FCRA, FDCPA — already apply to automated decision systems, and the core legal work is extending these existing frameworks to reach the algorithmic layer now making most consequential consumer financial decisions."
    ]
  },
  { id: 174, date: "2024-01-01", added: "2026-05-11",
    title: "AI in Education: Addressing Biases and Discrimination, Privacy & Surveillance",
    source: "American Bar Association CRSJ",
    sourceUrl: "https://www.americanbar.org/groups/crsj/resources/on-demand/ai-education-addressing-biases-discrimination-privacy-surveillance/",
    category: "equity", geography: "us",
    evidence: "analysis",
    keyFinding: "ABA CRSJ webinar examines algorithmic discrimination in education. This includes AI-driven learning resource recommendations perpetuating systemic unfairness across student populations, proctoring surveillance tools flagging disability behaviors as academic dishonesty, and privacy implications. The webinar frames AI in education as a civil rights legal priority where existing anti-discrimination law already applies and practitioner competency is required to protect student clients.",
    takeaways: [
      "AI recommendation systems in education carry a documented equity risk: when learning tools optimize for engagement or performance using historical data, they embed prior resource distribution inequities, recommending content and pathways that reflect existing gaps rather than closing them, producing personalized inequality at scale.",
      "Proctoring AI produces disability discrimination through neutral-appearing tools: behaviors classified as suspicious cheating indicators (irregular eye movements, off-screen glances, frequent bathroom breaks) are protected disability manifestations for many students, making AI-proctored assessments a Title II ADA and Section 504 compliance question that most institutions have not analyzed.",
      "Privacy in educational AI settings implicates FERPA, COPPA, and state student data privacy laws across a proliferating set of vendors: civil rights attorneys representing student clients need fluency in both discrimination law and educational data privacy frameworks to identify full legal exposure.",
      "The ABA CRSJ's framing of AI in education as civil rights legal work reflects a broader institutional recognition: AI harms in education are not primarily technical failures to be addressed by IT policy but legal violations of existing anti-discrimination law requiring the same enforcement infrastructure as other civil rights violations in educational institutions."
    ]
  },
  { id: 176, date: "2024-01-01", added: "2026-05-11",
    title: "AI Essentials for Lawyers: What You Need to Know to Protect Your Clients in the Digital Age",
    source: "American Bar Association CRSJ",
    sourceUrl: "https://www.americanbar.org/groups/crsj/resources/on-demand/ai-essentials-lawyers-what-you-need-know-protect-your-clients/",
    category: "policy", geography: "us",
    evidence: "analysis",
    keyFinding: "ABA CRSJ legal education resource equipping civil rights attorneys with foundational AI literacy to protect clients against AI-enabled discrimination. It covers AI decision-making in courts, benefits agencies, and employment contexts, due process implications of algorithmic adverse actions, and lawyer competency obligations as automated systems proliferate in legal and administrative processes affecting client rights.",
    takeaways: [
      "Lawyer competency in AI is now a client protection obligation: as automated systems influence decisions in courts, benefits agencies, immigration proceedings, and employment, attorneys cannot effectively identify, challenge, or develop remedies for AI-driven harms without baseline technical literacy about how these systems operate.",
      "Due process is the most immediately actionable existing framework for AI-driven administrative harms: notice requirements, the right to hear reasons, access to decisional criteria, and meaningful opportunity to contest — all established constitutional standards — apply to algorithmic government decisions without requiring new statutory authority.",
      "The civil rights bar faces a scale gap: AI-driven discrimination typically operates across many individuals, but civil rights legal infrastructure is built for individual representation. Pattern and practice challenges, regulatory comment, and civil rights audit partnerships are the tools most likely to produce accountability at the scale AI harm actually operates.",
      "The ABA's investment in civil rights AI education signals a profession-wide recognition that AI governance is not exclusively regulatory but a live litigation and advocacy frontier, lawyers who cannot analyze AI systems are increasingly unable to protect their clients in AI-mediated legal and administrative environments."
    ]
  },
  { id: 168, date: "2024-06-01", added: "2026-05-11",
    title: "AI and Access to Justice Initiative",
    source: "Stanford Legal Design Lab",
    sourceUrl: "https://justiceinnovation.law.stanford.edu/projects/ai-access-to-justice/",
    category: "policy", geography: "us",
    evidence: "analysis",
    keyFinding: "Stanford Legal Design Lab's AI and Access to Justice initiative finds that AI systems deployed in legal contexts frequently produce hallucinations and jurisdictional errors harmful to vulnerable populations. It documents conditional public willingness to use AI for legal problems contingent on accuracy and transparency. The initiative develops Legal Help Commons, shared infrastructure allowing legal aid organizations to adopt tested AI workflows rather than building independently, with tools deployed for eviction defense and reentry services.",
    takeaways: [
      "AI hallucinations in legal contexts carry qualitatively different harm than in general consumer applications: incorrect legal information given to a pro se tenant facing eviction or a reentry client navigating parole conditions can result in missed deadlines, adverse judgments, and liberty deprivations, a harm severity justifying quality standards significantly above what commercial AI products currently meet.",
      "Conditional public willingness is actionable: users are not categorically resistant to AI-assisted legal help but are skeptical on accuracy and transparency grounds that developers and legal aid organizations can address through design, jurisdictional specificity, clear limitations disclosure, human escalation pathways, and demographic-subgroup accuracy testing.",
      "Legal Help Commons addresses the duplication problem: every legal aid organization independently building AI tools produces fragmentation, inconsistency, and resource waste. Shared infrastructure with common quality standards creates conditions for the sector to improve collectively rather than in isolation.",
      "JusticeBench — the AI project mapping platform — is a governance contribution: a public inventory of AI projects in legal access, organized by task type and quality evidence, allows funders and practitioners to see where capacity exists, where it is duplicated, and where genuine gaps remain — information that efficient sector development currently lacks."
    ]
  },
  { id: 173, date: "2023-06-01", added: "2026-05-11",
    title: "Benefits Tech Advocacy Hub",
    source: "Benefits Tech Advocacy Hub",
    sourceUrl: "https://www.btah.org/",
    category: "policy", geography: "us",
    evidence: "analysis",
    keyFinding: "The Benefits Tech Advocacy Hub, a coalition of NHeLP, TechTonic Justice, and Upturn, documents how algorithmic systems are reducing and denying Medicaid, SSI, and home care benefits through flawed automation. It develops a multi-stage lifecycle intervention framework for advocates challenging benefits technology from procurement through deployment. The Hub documents successful legal challenges to HCBS eligibility algorithms in Arkansas, Missouri, and Wisconsin as replicable models.",
    takeaways: [
      "The lifecycle framework is the hub's most transferable contribution: by identifying the multiple hidden stages before algorithmic harm becomes publicly visible — procurement decisions, design specifications, testing protocols, deployment configurations — it shows advocates where intervention is possible before harm occurs, not only after.",
      "The documented harms in HCBS eligibility algorithms — in Arkansas, Missouri, and Wisconsin — establish that algorithmic benefits denial is a present pattern, not a future risk, and that legal challenges grounded in constitutional due process, statutory rulemaking requirements, and ADA integration mandates can succeed in reversing automated cuts.",
      "The 'fight austerity policies' framing connects technology advocacy to underlying fiscal dynamics: algorithmic benefits systems are deployed primarily to reduce program costs, not improve accuracy. Advocacy contesting only technical implementation without addressing the political economy driving deployment will win individual battles while losing the structural fight.",
      "The coalition model (NHeLP's benefits law expertise + TechTonic Justice's policy analysis + Upturn's technology accountability research) demonstrates that effective benefits technology advocacy requires combining legal doctrine, policy analysis, and technical literacy, a capacity configuration that must be built deliberately since it doesn't exist in any single institution."
    ]
  },
  { id: 199, date: "2023-12-15", added: "2026-05-22",
    title: "Generative Artificial Intelligence and the Creative Economy Staff Report: Perspectives and Takeaways",
    source: "Federal Trade Commission",
    sourceUrl: "https://www.ftc.gov/system/files/ftc_gov/pdf/12-15-2023AICEStaffReport.pdf",
    category: "policy", geography: "us",
    evidence: "official",
    keyFinding: "Generative AI is already harming creative professionals through style mimicry, non-consensual synthetic endorsements, and AI-generated content competing directly in venues where creatives seek work. The FTC urges opt-in (not opt-out) frameworks for training-data consent, citing structural deficiencies in opt-out approaches, and signals continued monitoring of generative AI markets using existing enforcement authority.",
    takeaways: [
      "AI-generated outputs are appearing directly in venues where creatives compete for work, making it harder for consumers and publishers to find human-made content and creating direct market displacement that does not require full job automation to impose economic harm.",
      "Artists expressed concern about AI tools mimicking their unique styles, voices, and likenesses — enabling knockoffs and synthetic endorsements they never authorized — a harm that existing IP and right-of-publicity frameworks do not fully address.",
      "Creative professionals called for opt-in rather than opt-out frameworks for AI training data: opt-outs only address future use, are undermined by developer opacity about what data is used, and shift the compliance burden onto the harmed parties rather than the extracting parties.",
      "The FTC's stance — deploying targeted enforcement under existing authority while monitoring generative AI markets — establishes federal consumer protection jurisdiction over AI training practices and creative economy harms without requiring new statutory authority."
    ]
  },
  { id: 191, date: "2023-11-10", added: "2026-05-22",
    title: "How Will AI Transform Industries and Organizations?",
    source: "Bob Meyer, Eric Bradlow — Wharton AI & Analytics Initiative",
    sourceUrl: "https://ai.wharton.upenn.edu/updates/how-will-ai-transform-industries-and-organizations/",
    category: "macro", geography: "us",
    evidence: "commentary",
    keyFinding: "Cross-sector discussion of practical AI implementations, from automated investment advisory to marketing and customer engagement, reveals that AI is already restructuring organizational strategy and market dynamics. These dynamics require business leaders to engage with AI as a current strategic variable rather than a future consideration.",
    takeaways: [
      "Real-world AI applications in finance and customer relations are restructuring organizational strategy now, not as a forecast but as a documented change in competitive dynamics already underway.",
      "The investment advisory and marketing transformations illustrate a pattern: AI automation of information-intensive customer-facing functions is operating in parallel with ongoing debates about whether AI 'will' transform industries.",
      "Business leaders who engage with AI transformation as a present-tense strategic reality rather than a planning horizon are better positioned to manage transitions proactively than those waiting for AI to become undeniable.",
      "This is part of Wharton's 10-part series examining AI's broad influence on business, providing practitioner-oriented synthesis from academic researchers engaged with deployment-stage AI rather than theoretical capability."
    ]
  },
  { id: 192, date: "2023-11-10", added: "2026-05-22",
    title: "How Are AI and Robotics Redefining Productivity?",
    source: "Lynn Wu, Eric Bradlow — Wharton AI & Analytics Initiative",
    sourceUrl: "https://ai.wharton.upenn.edu/updates/how-are-ai-and-robotics-redefining-productivity/",
    category: "macro", geography: "us",
    evidence: "commentary",
    keyFinding: "AI and robotics are redefining productivity in ways that require organizations to understand how new tools integrate into existing processes before implementing significant technological changes, adoption transforms workflows across all organizational levels simultaneously, requiring strategic assessment of fit rather than technology-first deployment.",
    takeaways: [
      "Adoption of AI and robotics fundamentally transforms organizational workflows, not through isolated task substitution but through systemic changes to how work is structured across the organization.",
      "Automation and AI impact physical labor, knowledge work, and human resources simultaneously, requiring integrated planning rather than function-by-function deployment strategies.",
      "Understanding the relationship between new AI tools and existing processes is prerequisite for successful adoption: deployments that ignore process integration constraints frequently produce waste, rework, and resistance.",
      "Productivity redefinition is not uniform: AI and robotics may increase output per worker in some dimensions while creating new bottlenecks, quality problems, or coordination costs that offset headline productivity gains."
    ]
  },
  { id: 193, date: "2023-11-10", added: "2026-05-22",
    title: "How Is AI Affecting Innovation Management?",
    source: "Christian Terwiesch, Valery Yakubovich, Eric Bradlow — Wharton AI & Analytics Initiative",
    sourceUrl: "https://ai.wharton.upenn.edu/updates/how-is-ai-affecting-innovation-management/",
    category: "macro", geography: "us",
    evidence: "commentary",
    keyFinding: "AI influences multiple dimensions of innovation management, from risk assessment and strategy to ideation, customer understanding, and value capture. The most consequential finding is that AI can enhance ideation breadth while human judgment remains necessary to filter for truly valuable versus merely novel output.",
    takeaways: [
      "AI can enhance ideation processes significantly — generating broader option spaces than human brainstorming alone — but the strategic filtering problem (identifying which ideas are genuinely valuable) remains a human judgment task that AI exacerbates rather than resolves.",
      "Risk assessment and organizational structure in innovation benefit from AI assistance: processing large volumes of market signals, patent landscapes, and competitor data at speed informs strategy in ways previously limited by human analytical capacity.",
      "Customer understanding is a domain where AI can add value by processing survey and behavioral data at scale, but interpreting what that data means for innovation direction still requires contextual human expertise.",
      "Value capture — how organizations extract benefit from their innovations — is the least-developed AI application in innovation management, and also the most strategically consequential: technical advantage that competitors can quickly replicate produces limited durable value."
    ]
  },
  { id: 194, date: "2023-11-10", added: "2026-05-22",
    title: "How Is AI Changing the Auto Industry?",
    source: "John Paul MacDuffie, Eric Bradlow — Wharton AI & Analytics Initiative",
    sourceUrl: "https://ai.wharton.upenn.edu/updates/how-is-ai-changing-the-auto-industry/",
    category: "macro", geography: "us",
    evidence: "commentary",
    keyFinding: "AI is accelerating autonomous vehicle development and transforming vehicle architecture. It is also creating significant tensions between established automakers and technology companies over AI development control, with open-source software emerging as a potential collaborator but also a competitive threat that disrupts legacy automaker AI strategies.",
    takeaways: [
      "AI is accelerating driverless car development and next-generation vehicle capabilities, compressing timelines that previously assumed a decade of incremental progress.",
      "The competitive tension between automotive incumbents and technology companies over AI integration is a structural industry reorganization — not just a product feature race — with implications for who controls the software-defined vehicle architecture and the data it generates.",
      "Open-source AI software creates a dual dynamic in automotive: collaborative platforms for non-differentiating features while intensifying competition in the AI capabilities that determine driver experience and safety.",
      "The auto industry's AI transformation illustrates a broader pattern: sectors with legacy physical infrastructure face disruption not only in product capability but in the organizational control of AI systems that now govern core product functions."
    ]
  },
  { id: 195, date: "2023-11-10", added: "2026-05-22",
    title: "How Does AI Impact Education?",
    source: "Ethan Mollick, Eric Bradlow — Wharton AI & Analytics Initiative",
    sourceUrl: "https://ai.wharton.upenn.edu/updates/how-does-ai-impact-education/",
    category: "education", geography: "us",
    evidence: "commentary",
    keyFinding: "Generative AI tools like ChatGPT are actively being used by students, forcing educators to grapple with questions of classroom integration, academic integrity, and what AI-era learning should produce. Thoughtful integration is proving more effective than restriction, and AI raises fundamental questions about what skills and knowledge are worth developing in humans.",
    takeaways: [
      "Students are actively using generative AI regardless of institutional policy, making the relevant question not whether to allow AI but how to design learning experiences that remain valuable and intellectually honest in AI-assisted environments.",
      "Educators face a genuine curriculum redesign challenge: if AI can produce competent first drafts, correct grammar, and generate research summaries, the educational value of traditional writing and research assignments must be reassessed rather than simply defended.",
      "ChatGPT and similar tools represent significant developments for what the future workforce needs to know, AI fluency is becoming a baseline professional skill, and educational systems that treat AI literacy as optional are disadvantaging their students.",
      "The academic integrity challenge is the most immediate institutional problem: AI-generated work detection is unreliable, policy is inconsistent, and the penalty frameworks designed for plagiarism do not map cleanly onto AI-assisted composition, creating enforcement challenges that are forcing a broader rethinking of assessment design."
    ]
  },
  { id: 170, date: "2022-05-23", added: "2026-05-11",
    title: "Ableism and Disability Discrimination in New Surveillance Technologies",
    source: "Center for Democracy and Technology",
    sourceUrl: "https://cdt.org/wp-content/uploads/2022/05/2022-05-23-CDT-Ableism-and-Disability-Discrimination-in-New-Surveillance-Technologies-report-plain-language-final.pdf",
    category: "equity", geography: "us",
    evidence: "analysis",
    keyFinding: "CDT documents a dual harm mechanism for disabled people in AI surveillance systems. The first is hyper-surveillance treating disability as suspicious non-compliance, with proctoring systems flagging disability behaviors as academic dishonesty and bossware exacerbating chronic illness and risking retaliation for accommodation requests. The second is simultaneous erasure as invisible users, where efficiency-driven tools cause harm without accounting for disability needs, across education, criminal justice, healthcare, and employment.",
    takeaways: [
      "The dual-harm framework — disabled people as simultaneously hyper-surveilled as potential threats and erased as invisible users — captures a contradiction in AI surveillance design: systems designed to flag norm deviations treat disability-related behaviors as violations, while systems designed to maximize efficiency for majority users treat disability needs as unmapped edge cases.",
      "Proctoring AI is the clearest documented case: behaviors classified as cheating indicators — irregular eye movements, looking off-screen, frequent bathroom breaks — are protected disability manifestations under the ADA and Section 504. Institutions deploying these systems without disability accommodation protocols are creating civil rights liability at scale.",
      "Bossware amplifies disability harm specifically: intrusive monitoring combined with accommodation requests creates a documented retaliation risk, workers needing modifications to standard productivity tracking must choose between disclosing disability to request accommodation or accepting monitoring that measures disability-related work patterns against non-disabled baselines.",
      "Coverage across four domains — education, criminal justice, healthcare, and employment — documents disability discrimination as a systemic feature of AI surveillance deployment rather than a sector-specific failure: calibrating AI systems to a non-disabled behavioral norm produces discrimination across every context where AI surveillance is deployed."
    ]
  },
  { id: 172, date: "2021-04-30", added: "2026-05-11",
    title: "Statement to the California Fair Employment and Housing Council on AI and Disability Discrimination",
    source: "Lydia X. Z. Brown — Center for Democracy and Technology",
    sourceUrl: "https://cdt.org/wp-content/uploads/2021/04/California-Fair-Employment-Housing-Council-Public-Hearing-Lydia-X.-Z.-Brown-statement-30.Apr_.2021.pdf",
    category: "equity", geography: "us",
    evidence: "analysis",
    keyFinding: "Testimony to California's Department of Fair Employment and Housing identifies two core disability discrimination mechanisms in AI hiring tools: inaccessibility (assessment formats disabled people cannot use) and disparate screening (disproportionate rejection unrelated to job requirements). It argues ADA and California's FEHA already apply to algorithmic hiring without new legislation. The testimony documents that employer self-regulation involves opaque processes that maintain workers at a systematic information disadvantage.",
    takeaways: [
      "The inaccessibility harm is distinct from the screening harm and requires different responses: when AI hiring tools use formats disabled applicants cannot access — video-based analysis, timed typing tests, standardized attention tasks — the harm is access denial rather than discriminatory scoring, a Title I ADA violation in the nature of failure to provide reasonable accommodation before assessment begins.",
      "The disparate screening harm is addressable through existing disparate impact doctrine under the ADA without new statutory authority: the legal framework is in place; what is absent is enforcement agency technical capacity and employer compliance infrastructure.",
      "The self-regulation critique has structural implications: employer and vendor auditing processes operate behind closed doors without worker participation, producing accountability claims that cannot be independently evaluated. Meaningful oversight requires external auditing with public disclosure and worker access to findings.",
      "California's FEHA provides a more demanding standard than federal ADA requirements, making California the most important state-level enforcement frontier for algorithmic hiring discrimination against disabled applicants, and the DFEH/CRD hearing process documented the legal community's growing engagement with AI-specific civil rights enforcement."
    ]
  },
  { id: 171, date: "2020-10-21", added: "2026-05-11",
    title: "Challenging the Use of Algorithm-Driven Decision-Making in Benefits Determinations Affecting People with Disabilities",
    source: "Center for Democracy and Technology",
    sourceUrl: "https://cdt.org/wp-content/uploads/2020/10/2020-10-21-Challenging-the-Use-of-Algorithm-driven-Decision-making-in-Benefits-Determinations-Affecting-People-with-Disabilities.pdf",
    category: "equity", geography: "us",
    evidence: "analysis",
    keyFinding: "CDT documents state governments using algorithms to deny or reduce Medicaid, Medicare, unemployment, and disability benefits, frequently producing inhumane outcomes. It identifies three legal challenge frameworks. These are constitutional due process (inadequate notice before termination), statutory rulemaking requirements (failure to conduct notice-and-comment before deploying algorithmic tools), and the ADA community integration mandate (automated cuts jeopardizing disabled people's ability to live independently).",
    takeaways: [
      "The algorithmic benefits denial pattern documents AI as an austerity mechanism: the efficiency and fraud-detection rationale for algorithmic benefits tools masks their primary operational effect, reducing program costs through automated decisions that disadvantage populations least able to navigate appeals processes.",
      "Constitutional due process provides the most immediately actionable legal challenge: states must give advance notice with adequate explanation before reducing or terminating benefits, and algorithmic systems generating denial notices without explaining the decisional logic they applied violate this constitutional standard under existing doctrine.",
      "The notice-and-comment rulemaking requirement creates a second challenge pathway: when states implement new algorithmic decision systems without required public rulemaking — including affected community input — they may violate administrative law requirements governing how policy changes are made, independent of whether the substantive outcome is correct.",
      "The ADA community integration mandate is the most expansive legal hook: Olmstead doctrine requires states to provide services in the most integrated setting appropriate to individual needs, and automated benefit cuts that force disabled people into institutional care rather than maintaining community-based services may violate this mandate even when the algorithmic determination is technically accurate."
    ]
  },
  { id: 157, date: "2025-07-01", added: "2026-05-11",
    title: "LLM-Generated Messages Can Persuade Humans on Policy Issues",
    source: "Hui Bai, Jan G. Voelkel et al. — Nature Communications",
    sourceUrl: "https://www.nature.com/articles/s41467-025-61345-5",
    category: "policy", geography: "us",
    evidence: "peer-reviewed",
    keyFinding: "Across three pre-registered experiments (N = 4,829), LLM-generated persuasive messages produced attitude shifts of 1.81–3.62 points on 101-point scales across diverse policy issues, including assault weapons restrictions, carbon taxes, and paid parental leave. These messages were as effective as messages written by lay humans. Critically, over 94% of participants misidentified LLM-generated content as human-authored, establishing AI persuasion at human scale as an empirically documented risk to democratic deliberation.",
    takeaways: [
      "LLM persuasion is already at human lay level: GPT-3/3.5-generated messages produced attitude shifts statistically indistinguishable from those written by human participants across both polarized and less polarized policy issues, closing the performance gap that previously allowed democratic discourse to assume a human authorship floor, even before more capable models are deployed at scale.",
      "The misidentification rate is the most consequential finding for governance: over 94% of participants failed to identify LLM-generated content as AI-authored, meaning that detection-based safeguards and voluntary disclosure requirements face a fundamental epistemic obstacle, citizens cannot exercise skepticism they cannot activate because they cannot identify the source.",
      "LLM and human messages succeeded through different mechanisms: LLM messages were persuasive through perceived 'facts, evidence, logical reasoning, and dispassionate voice,' while human messages worked through perceived uniqueness and originality, suggesting that AI persuasion does not mimic human persuasion but achieves comparable attitude change through a distinct epistemic pathway that existing media literacy training is not designed to counter.",
      "The policy threat is multiplicative, not additive: the study tested single messages on individual participants, but the governance risk is that LLMs can generate persuasive content at arbitrary scale simultaneously across millions of people, simulating broad public consensus. The authors recommend mandatory disclosure requirements, digital watermarking, and detection systems, none of which currently exist as binding standards in the U.S."
    ]
  },
  { id: 156, date: "2026-03-05", added: "2026-05-11",
    title: "When Using AI Leads to 'Brain Fry'",
    source: "Julie Bedard, Matthew Kropp et al. — Harvard Business Review",
    sourceUrl: "https://hbr.org/2026/03/when-using-ai-leads-to-brain-fry",
    category: "wellbeing", geography: "us",
    evidence: "analysis",
    keyFinding: "Research published in Harvard Business Review in collaboration with Boston Consulting Group finds that certain AI usage patterns trigger cognitive fatigue, described as 'brain fry', in workers. This is driven by AI-generated output volumes that exceed human capacity for sustained comprehension. Other usage patterns may reduce burnout, establishing AI as a variable-impact factor on worker wellbeing whose effect depends on how it is deployed rather than whether it is deployed.",
    takeaways: [
      "AI adoption produces divergent wellbeing outcomes by usage pattern: high-velocity workflows that require workers to rapidly process and validate AI outputs generate measurable stress and cognitive overload, while AI that relieves repetitive task burden may lower it, meaning impact cannot be assessed through adoption rates alone but requires evaluation of how AI is integrated into specific task contexts.",
      "The 'brain fry' mechanism is distinct from conventional work overload: it emerges from AI's capacity to produce content at speeds that outpace human review capacity, creating a form of cognitive strain specific to human-AI collaboration that occupational health frameworks designed for human-paced information loads are not calibrated to measure or regulate.",
      "A paradox documented here and in related research (APA always-on work culture) finds that high AI adopters often report higher job satisfaction alongside greater cognitive demands, the competence gains and task variety AI enables may dominate early adoption experience before cumulative boundary erosion becomes the dominant signal, warning against using initial satisfaction data as evidence of sustained wellbeing.",
      "Deployment design is a worker health question: which AI tools are used, at what frequency and intensity, and for which task types determines whether AI compounds or relieves cognitive load, making deployment standards a workplace wellbeing intervention, not only a productivity or safety issue."
    ]
  },
  { id: 155, date: "2026-05-06", added: "2026-05-11",
    highlight: { stat: "5 gigawatts", text: "natural gas plant Microsoft is developing as artificial intelligence data-center expansion outpaces its 2030 clean-energy commitment.", themeId: "community" },
    title: "Microsoft's AI Data Center Push Is Colliding with Its Clean Power Goals",
    source: "Tim De Chant — TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/05/06/microsofts-ai-data-center-push-is-colliding-with-its-clean-power-goals/",
    category: "environment", geography: "us",
    evidence: "commentary",
    keyFinding: "Microsoft is reportedly debating whether to abandon its 2030 commitment to hourly clean energy matching as AI data center expansion outpaces its renewable supply, while simultaneously developing a 5-gigawatt natural gas plant in West Texas with Chevron and Engine No. 1, documenting a direct and operationalized collision between AI infrastructure growth and corporate environmental commitments at the largest hyperscaler scale.",
    takeaways: [
      "The conflict between AI data center expansion and clean energy commitments has moved from theoretical to operational: Microsoft's internal debate over abandoning its hourly energy matching target — the more rigorous standard, which requires actual alignment between renewable generation and hourly consumption — documents that infrastructure growth rates are already outpacing what renewable supply chains can deliver.",
      "The distinction between hourly and annual clean energy matching is material for accountability: annual matching allows companies to claim renewable credits through accounting mechanisms without eliminating real-time fossil fuel reliance, while hourly matching requires actual production-consumption alignment. Abandoning the hourly target while retaining annual targets would allow the company to report clean energy progress while remaining fossil-fuel dependent in practice.",
      "The 5-gigawatt natural gas plant co-developed with Chevron signals that AI energy demand has crossed a threshold where fossil fuel investment is being treated as a near-term operational requirement, not a transitional measure, even at companies whose stated climate commitments are among the most ambitious in the sector.",
      "Microsoft's position sets a precedent with systemic implications: as the largest cloud provider and a leading AI developer, its energy sourcing decisions influence other hyperscalers, shape regulatory expectations, and directly test whether corporate clean energy pledges — a primary current governance mechanism for AI infrastructure — can withstand deployment pressure at scale."
    ]
  },
  { id: 154, date: "2026-05-06", added: "2026-05-11",
    title: "Anthropic Is Letting Claude Agents 'Dream' So They Don't Sleep on the Job",
    source: "Mike Wheatley — SiliconANGLE",
    sourceUrl: "https://siliconangle.com/2026/05/06/anthropic-letting-claude-agents-dream-dont-sleep-job/",
    category: "labor", geography: "us",
    evidence: "commentary",
    keyFinding: "Anthropic's release of memory consolidation ('dreaming') for Claude Managed Agents enables AI to extract patterns across multiple sessions and agents, curate persistent memory, and delegate sub-tasks through multi-agent orchestration. This marks a directional shift from AI as single-session task tool toward AI as autonomous sustained workflow manager, narrowing the set of functions that require continuous human involvement.",
    takeaways: [
      "The 'dreaming' feature addresses a key practical constraint on AI replacing extended human cognitive work: LLMs previously lacked persistent cross-session learning, requiring humans to maintain workflow continuity and organizational context. Automated memory consolidation across agents reduces this constraint, expanding the range of sustained professional tasks AI can manage without human memory-bridging.",
      "Multi-agent orchestration — allowing lead agents to delegate sub-tasks with full visibility and coordination — introduces an AI organizational layer above individual task execution, performing project management and coordination functions previously requiring human judgment and sustained attention.",
      "The 'Outcomes' grading mechanism, which improves task success by approximately 10 percentage points by showing agents example outputs, demonstrates that AI performance on professional tasks can be systematically optimized through output comparison, a feedback loop that enables capability improvement without human retraining cycles.",
      "The cumulative trajectory — from single-session tools to multi-session, multi-agent systems with memory consolidation, orchestration, and outcome grading — represents a structural capability shift toward autonomous sustained workflows, compressing the timeline before AI intersects with full professional task scope across knowledge-work occupations."
    ]
  },
  { id: 153, date: "2026-05-01", added: "2026-05-11",
    title: "The New Way Your Boss Is Watching Your Feelings",
    source: "The Atlantic",
    sourceUrl: "https://www.theatlantic.com/culture/2026/05/worker-surveillance-emotion-ai/687029/",
    category: "surveillance", geography: "us",
    evidence: "commentary",
    keyFinding: "The Atlantic examines the spread of emotion AI technologies, systems claiming to detect worker emotional states through facial expression analysis, voice patterns, and biometric signals, into workplaces including customer service, education, and logistics. It raises questions about the scientific validity of these systems' claims, the absence of worker recourse, and the diffusion pathway from low-wage to professional settings.",
    takeaways: [
      "Emotion AI represents a qualitative expansion of surveillance beyond behavioral monitoring: while prior workplace monitoring systems tracked actions — keystrokes, location, productivity metrics — emotion AI claims to interpret internal states including stress, engagement, and discomfort, creating a new category of workplace data that workers cannot observe, contest, or meaningfully control.",
      "The scientific foundations of emotion AI are actively contested: the systems make inferences based on research whose validity is disputed within psychology, meaning workers may face consequential employment decisions made by systems built on contested science with no regulatory requirement to validate accuracy before deployment.",
      "The accountability asymmetry is particularly acute: workers in most U.S. jurisdictions have no legal right to know when their emotional state is being inferred, no mechanism to verify whether inferences are accurate, and no recourse against decisions made on that basis, creating a monitoring environment with no practical accountability.",
      "The documented diffusion pathway — from logistics and customer service toward professional and educational contexts — follows the same normalization pattern as earlier monitoring technologies: first embedded in low-wage settings with limited worker power, then extended upward through the labor market as costs fall and the precedent of use is established."
    ]
  },
  { id: 152, date: "2022-08-02", added: "2026-05-11",
    title: "IDC CIO Sentiment Survey 2022: The Future CIO Is Not the Same as Today's CIO",
    source: "IDC",
    sourceUrl: "https://www.idc.com/resource-center/blog/idc-cio-sentiment-survey-2022-the-future-cio-is-not-the-same-as-todays-cio/",
    category: "macro", geography: "us",
    evidence: "industry",
    keyFinding: "IDC's 2022 CIO survey finds that 40% of business processes have already been automated, with finance and supply chain projected to reach 42–43% within three years. It also finds that digital business now represents 50% of total enterprise activity globally. This signals that AI-driven process automation has crossed from pilot to structural at enterprise scale and is reshaping organizational hierarchies, skill requirements, and the distribution of decision-making authority.",
    takeaways: [
      "Process automation has crossed the threshold from pilot to structural practice: 40% of business processes automated by 2022, with CIOs projecting near-equivalent rates across finance and supply chain within three years, indicating that enterprise automation is not a future scenario but a present-tense restructuring already determining which roles and functions remain human-staffed.",
      "Digital business has reached majority share globally: at 50% of total business activity across all regions, AI-enabled digital operations are no longer supplementing traditional business models but displacing them as the primary mode of enterprise activity, with significant implications for which workforces, skills, and organizational structures remain economically viable.",
      "The expanding CIO mandate signals where workforce design authority is shifting: 55% of CIOs reported having expanded beyond traditional IT responsibilities into business strategy, revenue generation, and digital transformation leadership, reflecting a structural shift in who has authority over automation and workforce decisions within firms.",
      "The $13.29 million in annual revenue supported per IT employee documents the leverage differential automation creates: as AI replaces functions previously requiring headcount, value-per-employee ratios rise, producing productivity statistics that may mask underlying labor displacement in standard economic aggregates."
    ]
  },
  { id: 151, date: "2024-10-01", added: "2026-05-11",
    title: "Estimating the Prevalence of Automated Management and Surveillance Technologies at Work and Their Impact on Workers' Well-Being",
    source: "Alexander Hertel-Fernandez — Washington Center for Equitable Growth",
    sourceUrl: "https://equitablegrowth.org/research-paper/estimating-the-prevalence-of-automated-management-and-surveillance-technologies-at-work-and-their-impact-on-workers-well-being/",
    category: "surveillance", geography: "us",
    evidence: "analysis",
    keyFinding: "A nationally representative survey of 1,273 U.S. workers (July 2024) finds that 68% report at least one form of electronic monitoring, with constant productivity monitoring linked to tripled rates of unsafe work practices (46% vs. 15%), doubled workplace injury rates (9% vs. 4%), and elevated anxiety (53% vs. 41%), with harm concentrated among Black and Hispanic workers in larger organizations, and monitoring used for disciplinary purposes driving the worst outcomes.",
    takeaways: [
      "Electronic monitoring is already majority-level in the U.S. workforce: 68% of workers report at least one form, 34% report automated schedule assignment, and 32% report automated task assignment, and these figures likely undercount actual prevalence given that workers often cannot determine when AI is managing their work.",
      "The critical analytic distinction is monitoring purpose, not presence: disciplinary monitoring correlates strongly with unsafe work practices, elevated injury rates, and anxiety, while monitoring designed for worker health and safety shows minimal adverse effects, indicating that deployment intent shapes outcomes as much as the technology itself, with direct implications for how oversight frameworks should be structured.",
      "Harm is racially stratified: electronic monitoring is significantly more common in larger organizations and among Black and Hispanic workers, who are both more likely to be monitored and more likely to experience the worst documented outcomes, injury rates and unsafe work practices concentrate disproportionately in this population, reinforcing the link between algorithmic management and pre-existing racial inequalities in workplace conditions.",
      "The policy recommendations frame workplace monitoring as an occupational health issue: mandatory worker consultation in technology design, enhanced federal data collection by BLS and OSHA, and occupational safety standards specifically governing surveillance, moving the regulatory frame beyond privacy law toward the workplace safety obligations that employers already bear for other hazards."
    ]
  },
  { id: 150, date: "2022-09-01", added: "2026-05-11",
    title: "Every Move You Make: When Monitoring Employees Gives Rise to Legal Risks",
    source: "Anne Villanueva Jeffers and Crystal D. Barnes — Skadden, Arps, Slate, Meagher & Flom LLP",
    sourceUrl: "https://www.skadden.com/insights/publications/2022/09/quarterly-insights/every-move-you-make",
    category: "surveillance", geography: "us",
    evidence: "analysis",
    keyFinding: "A legal analysis by Skadden attorneys documents that 67.6% of North American employers with 500+ employees use monitoring software, adoption that rose from 16% to 26% in the first month of the COVID-19 pandemic. It identifies significant employer legal exposure across privacy, labor law, and discrimination law from surveillance programs. The analysis notes that only three U.S. states (Connecticut, Delaware, New York) require any worker notice of monitoring.",
    takeaways: [
      "Monitoring adoption accelerated sharply during the pandemic and has not reversed: within the first month of COVID-19, companies installing new tracking software rose from 16% to 26%, reaching 67.6% of North American employers with 500+ employees by 2022, documenting a step-change in surveillance infrastructure under the cover of remote work logistics.",
      "The legal exposure created by monitoring programs spans multiple liability pathways: privacy invasion, NLRA protections for concerted activity, employment discrimination claims (where monitored data is used in adverse decisions), wage-and-hour violations (where monitoring tracks compensable time), and workplace injury risks, most monitoring policies are designed without adequate attention to any of these vectors.",
      "The U.S. regulatory floor is exceptionally low: only Connecticut, Delaware, and New York require employers to notify employees that monitoring is in use, contrasting with EU regulations requiring data protection impact assessments and necessity justifications before deployment. California's failed Workplace Technology Accountability Act (AB 1651) would have substantially restricted these practices, and its failure documents the distance between advocacy goals and current statutory protection.",
      "The analysis is structurally significant from both sides: the same legal assessment that documents employer liability exposure simultaneously reveals that workers have almost no affirmative rights to know, contest, or limit monitoring, an asymmetry that worker data rights proposals and algorithmic transparency mandates are designed to close."
    ]
  },
  { id: 149, date: "2026-05-01", added: "2026-05-08",
    title: "Government AI Landscape Assessment (Second Annual)",
    source: "Code for America",
    sourceUrl: "https://codeforamerica.org/explore/government-ai-landscape-assessment/",
    category: "policy", geography: "us",
    keyFinding: "Code for America's second annual assessment of AI adoption across all 50 states finds seven national leaders (Maryland, New Jersey, North Carolina, Pennsylvania, Texas, Utah, Vermont) and identifies workforce capacity building as the least developed dimension nationwide. Most states are still in early or development stages despite accelerating operational deployments, and few have dedicated Chief AI Officer infrastructure.",
    takeaways: [
      "State AI adoption is advancing faster than federal: states are leading federal adoption and progressing through four stages (Readiness → Piloting → Implementation → Impact), with national leaders distinguished by cross-agency governance, enterprise data infrastructure, controlled experimentation, and early outcome measurement systems, not technical capability alone.",
      "Workforce capacity building is the weakest dimension nationally: across all 50 states, AI training programs and skill development for government workers is the least developed area, creating a growing competency gap as operational deployment accelerates ahead of the talent infrastructure needed to manage it.",
      "Benefits navigation is the primary equity-relevant use case: the second annual report specifically examined AI's role in connecting eligible residents to benefits, Code for America's programs helped 7 million people access $22 billion in benefits across safety net, criminal justice, and tax systems, making AI-assisted benefits access the most consequential government AI deployment for vulnerable populations.",
      "Governance architecture determines trajectory: states with published AI governance frameworks, Chief AI Officers, and cross-agency advisory groups (Texas, New Jersey, Utah) consistently outperform states relying on ad-hoc structures, identifying institutional design, not technology access, as the primary variable separating leading from lagging states."
    ]
  },
  { id: 148, date: "2026-01-13", added: "2026-05-08",
    title: "New Jersey Responsible AI Advancement and Workforce Protection Act (S.1840)",
    source: "New Jersey Legislature",
    sourceUrl: "https://legiscan.com/NJ/text/S1840/id/3311592",
    category: "policy", geography: "us",
    keyFinding: "NJ S.1840, introduced January 13, 2026, would create the AI Horizon Fund, financed by a percentage of AI company revenues. It would require employers to disclose AI-driven layoffs, contribute to a training fund, and provide enhanced unemployment benefits for AI-displaced workers. The bill represents the most comprehensive state-level AI workforce protection framework introduced in the U.S.",
    takeaways: [
      "The AI Horizon Fund mechanism — financed by a percentage of AI companies' revenue — creates a direct fiscal link between AI productivity gains and workforce transition costs: the sector benefiting from AI-driven efficiency contributes to the programs supporting workers displaced by it.",
      "Mandatory layoff disclosure and training fund contribution requirements extend obligations to employers rather than only AI companies: firms that deploy AI to eliminate positions bear a cost proportional to the displacement they generate, a price signal absent from the current regulatory environment.",
      "Enhanced unemployment benefits for AI-displaced workers address the TAA expiration gap at the state level, providing income support that WIOA alone does not offer, and creating a state model for the extended benefits that previously existed only under the now-expired federal TAA program.",
      "Ethical use and transparency requirements for high-risk AI systems embedded in the bill extend NJ's framework into AI governance more broadly, making S.1840 simultaneously a workforce protection policy and an AI accountability framework, with worker protection as the organizing principle."
    ]
  },
  { id: 147, date: "2025-09-01", added: "2026-05-08",
    title: "AI in Workforce Development: Guidance for WIOA Programs (NJ WD-PY25-14)",
    source: "New Jersey Department of Labor",
    sourceUrl: "https://www.nj.gov/labor/assets/PDFs/WIOA/documents/resources/AI%20Guidance%20WD-PY25-14.pdf",
    category: "policy", geography: "us",
    keyFinding: "New Jersey's workforce guidance WD-PY25-14 is among the first state-issued policy directives integrating AI literacy into federally-funded WIOA workforce programs. It directs workforce boards, training providers, and career service professionals to update competency models and curricula to incorporate generative AI skills as a workforce asset, not only a displacement risk.",
    takeaways: [
      "The guidance marks a significant policy reframe: rather than treating AI solely as a threat to address, NJ directs workforce agencies to actively build AI competency, shifting the framing from protection to preparation within the WIOA delivery system.",
      "By requiring updates to career development resources and digital literacy competency frameworks, the guidance creates accountability for state workforce boards to assess whether training programs reflect current AI skill demands, a gap most states have not yet addressed.",
      "The practical implication for WIOA participants is that AI literacy may become a condition of program design rather than an optional add-on, shifting who gets AI training access from employers (who concentrate it among higher-wage workers) to publicly-funded systems serving displaced and low-income workers.",
      "NJ's guidance creates a replicable state-level model requiring no new federal legislation: it uses existing WIOA administrative flexibility to integrate AI workforce development into funded programs, providing a template other states can adapt under current federal program rules."
    ]
  },
  { id: 146, date: "2024-06-01", added: "2026-05-08",
    title: "GiveDirectly: AI-Supported Triggers for Cash Transfers",
    source: "GiveDirectly — Anticipation Hub",
    sourceUrl: "https://www.anticipation-hub.org/Documents/Case_Studies/GiveDirectly-AI-supported-triggers-for-cash-transfers.pdf",
    category: "policy", geography: "intl",
    keyFinding: "GiveDirectly and Google deployed AI-powered satellite imagery analysis to identify and target vulnerable populations for cash transfers in data-scarce regions. This demonstrates that AI can serve as social protection infrastructure, reducing administrative costs and accelerating response in environments where conventional survey-based targeting is prohibitively slow or expensive.",
    takeaways: [
      "The AI targeting system analyzes satellite imagery for poverty indicators, building coverage maps in regions where conventional surveys would be too slow or costly, enabling cash transfers to reach populations that would otherwise fall outside administrative identification systems.",
      "By automating preliminary beneficiary identification, the approach reduces the administrative cost ratio of cash transfer programs, potentially improving cost-effectiveness in direct proportion to the scale of deployment.",
      "The AI-human hybrid model retains human review at the verification stage: AI handles large-scale pattern recognition across geographic data while human judgment applies local context, a design that complements rather than supplants human decision-making in consequential welfare decisions.",
      "The case demonstrates AI's potential role as social protection infrastructure, not only a labor market risk: the technology can extend reach and reduce delivery friction for direct cash programs in ways directly applicable to proposals for AI-era income support mechanisms, including contingent UBI triggers and climate-linked cash transfers."
    ]
  },
  { id: 145, date: "2025-04-01", added: "2026-05-08",
    title: "AI-Related Job Impacts Clarity Act (S.3108)",
    source: "U.S. Senate",
    sourceUrl: "https://www.congress.gov/bill/119th-congress/senate-bill/3108",
    category: "policy", geography: "us",
    keyFinding: "The AI-Related Job Impacts Clarity Act (S.3108, 119th Congress, sponsored by Sen. Mark Warner) would require covered entities to report AI-related job impacts to the Secretary of Labor within 30 days after the end of each calendar quarter, establishing the first federal mandate for systematic data collection on AI-driven labor market changes.",
    takeaways: [
      "Mandatory quarterly reporting would generate the first comprehensive federal dataset on AI's employment effects, filling the data gap that currently forces policymakers to rely on surveys and extrapolation rather than direct employer-reported displacement figures.",
      "The reporting requirement applies at the organizational level, creating accountability for AI deployment decisions that is currently entirely absent: employers can implement AI systems at any scale with no obligation to disclose effects on their workforce.",
      "The bill addresses a structural governance failure: without systematic data collection, neither Congress nor the Department of Labor can accurately assess whether AI displacement is accelerating, which sectors are most affected, or whether existing programs have adequate capacity to respond.",
      "Transparency reporting is a precondition for evidence-based policy: the Clarity Act would enable displacement monitoring that makes it possible to calibrate displaced worker programs, wage insurance, and retraining investments against actual rather than projected disruption, a prerequisite for any adaptive policy architecture."
    ]
  },
  { id: 144, date: "2025-03-04", added: "2026-05-08",
    title: "Trump's Rollback of AI Guardrails Leaves US Workers 'At Real Risk'",
    source: "The Guardian",
    sourceUrl: "https://www.theguardian.com/us-news/2025/mar/04/trump-ai-labor-protections",
    category: "policy", geography: "us",
    keyFinding: "Executive Order 14179 (January 23, 2025) rescinded Biden-era AI labor protections, removing Department of Labor directives requiring responsible AI workplace deployment. The EEOC simultaneously removed AI-specific hiring discrimination guidance, eliminating the federal framework translating civil rights and worker protection law into AI deployment requirements.",
    takeaways: [
      "The rollback eliminates the operational bridge between existing anti-discrimination statutes and AI deployment: without DOL guidance and EEOC technical standards, employers have no federal-level obligation to assess whether AI hiring, surveillance, or management tools comply with Title VII, ADA, or ADEA.",
      "Labor experts characterize the primary risk not as future displacement but as present-day job quality degradation: AI is already being used to intensify surveillance in warehouses, deny healthcare claims, and algorithmically manage gig workers, and the removal of federal guardrails eliminates the most direct oversight mechanism for these active harms.",
      "The DOL's notation that its 'AI & Inclusive Hiring Framework' and 'Artificial Intelligence Best Practices' guidance 'may now be outdated' creates a compliance vacuum: employers who built AI policies on this guidance have no federal replacement framework, and enforcement agencies have diminished guidance for evaluating worker complaints.",
      "State-level AI labor protections take on heightened importance in the absence of federal standards, but most states still lack comprehensive worker-facing AI governance, creating a fragmented protection landscape with significant geographic inequality in worker rights."
    ]
  },
  { id: 143, date: "2025-10-27", added: "2026-05-08",
    title: "What Happens When Jobs Disappear? A Guide to Displaced Worker Programs in the U.S.",
    source: "Bipartisan Policy Center",
    sourceUrl: "https://bipartisanpolicy.org/explainer/what-happens-when-jobs-disappear-a-guide-to-displaced-worker-programs-in-the-u-s/",
    category: "policy", geography: "us",
    keyFinding: "Trade Adjustment Assistance expired in 2022, leaving WIOA's Dislocated Worker Program as the only federal displaced worker program. It provides career services and training but no income support, shows weaker effectiveness evidence than other WIOA streams, and contains no provisions addressing automation-driven displacement.",
    takeaways: [
      "TAA's expiration eliminated the primary income support mechanism for displaced workers from the U.S. federal safety net: TAA had provided up to 130 weeks of combined unemployment and extended benefits, wage insurance, and relocation allowances, none of which WIOA offers.",
      "WIOA's Dislocated Worker Program is the weaker of the two programs by effectiveness evidence: research shows moderate re-employment improvements but less success than other WIOA streams, with outcomes dependent on wraparound supports that are not standardized across state delivery systems.",
      "No federal program currently contains language or eligibility criteria specifically addressing automation-driven displacement, AI-displaced workers must qualify as 'dislocated workers' under general criteria designed for trade and industry decline, a mismatch that will produce significant eligibility gaps as AI-driven transitions accelerate.",
      "Key unresolved policy design questions: how to define automation-displaced workers, whether income support or retraining should be prioritized under different labor market conditions, and what initial funding (~$700M annually) is required with built-in flexibility to scale."
    ]
  },
  { id: 142, date: "2025-07-24", added: "2026-05-08",
    title: "AI as Profoundly Abnormal Technology",
    source: "Scott Alexander — AI Futures Project",
    sourceUrl: "https://blog.aifutures.org/p/ai-as-profoundly-abnormal-technology",
    category: "labor", geography: "intl",
    keyFinding: "AI's pace of professional adoption is historically unprecedented. 76% of physicians were using ChatGPT for clinical decisions before any institutional framework existed, and professional adoption across legal, medical, and software sectors reached 19–79% within a single year. These diffusion speeds outpace every governance, oversight, and labor adjustment mechanism designed for normal technological change.",
    takeaways: [
      "The 'AI as normal technology' argument predicts that institutional friction, safety concerns, and learning curves will slow adoption to manageable rates, but spontaneous adoption by 76% of physicians without formal safety review directly contradicts this: AI has bypassed the institutional checkpoints that define 'normal' technology diffusion.",
      "AI labs can directly use advanced AI to accelerate their own research, creating recursive improvement dynamics absent from previous general-purpose technologies: deployment speed may not be constrained by external capability ceilings in the way prior technologies were.",
      "Professional adoption of 19–79% within a single year creates competitive pressure that eliminates the 'wait and see' option, compressing the adjustment window for affected workers and institutions, retraining programs requiring 1–3 years of participation may not be deployed before the displacement they address has already occurred.",
      "The practical implication for workforce policy is that AI will penetrate professional sectors at speeds incompatible with typical transition timelines, requiring anticipatory policy investment, the governance, reskilling, and income support infrastructure must be built before disruption peaks, not in response to it."
    ]
  },
  { id: 141, date: "2025-07-09", added: "2026-05-08",
    title: "AI and Jobs: Two Phases of Automation",
    source: "Anton Leicht",
    sourceUrl: "https://writing.antonleicht.me/p/ai-and-jobs-two-phases-of-automation",
    category: "labor", geography: "intl",
    keyFinding: "AI-driven job disruption will unfold in two sequential phases requiring distinct policy responses. Phase 1 (near-term, 1–2 years) is where AI gains narrow domain superiority and normal automation economics apply. Phase 2 (5+ years) is where AI becomes autonomous and general enough to erode comparative human employment advantage across most occupations.",
    takeaways: [
      "Phase 1 disruption mirrors past automation waves, workers shift to tasks where humans retain advantage, macroeconomic adjustment mechanisms function, and conventional policy tools (retraining, income support, wage insurance) remain adequate responses.",
      "Phase 2 requires a fundamentally different social contract because AI becomes simultaneously autonomous (no human support tasks required) and general (competitive across most occupational categories), eliminating the comparative advantage mechanism that has historically protected employment during technological transitions.",
      "The key policy risk: early success addressing Phase 1 disruption could paradoxically discredit advocates warning of Phase 2, creating false confidence that AI disruption is manageable under existing frameworks at exactly the moment when preparatory investment for more severe scenarios is most needed.",
      "The two-phase framing resolves the apparent contradiction between 'normal automation' and 'fundamental displacement' camps: both are correct about different time horizons, and the mistake is treating them as competing rather than sequential hypotheses requiring complementary policy investments."
    ]
  },
  { id: 140, date: "2025-06-01", added: "2026-05-08",
    title: "Expertise",
    source: "Autor & Thompson — NBER Working Paper",
    sourceUrl: "https://www.nber.org/papers/w33941",
    category: "labor", geography: "us",
    keyFinding: "Automation produces structurally opposite wage and employment effects depending on whether it removes expert or routine tasks. Automating lower-skill (routine) tasks raises wages but reduces employment in affected occupations. Automating higher-skill (expert) tasks lowers wages but increases employment. This distinction is largely absent from standard displacement projections and requires fundamentally different policy responses.",
    takeaways: [
      "The conventional framing that automation eliminates jobs and reduces wages is only half correct: when automation removes routine sub-tasks, it raises the wage premium for remaining expert work while reducing headcount; when it removes expert judgment itself, it lowers wages while potentially expanding lower-complexity employment.",
      "A radiologist and a nurse may face similar AI pressure on their occupations but with opposite economic consequences: AI attacking diagnostic expertise compresses specialist wages and may expand lower-skill roles, while AI handling documentation tasks increases the relative value of clinical judgment.",
      "Standard displacement projections — including the widely cited Eloundou et al. task-exposure estimates — do not distinguish expert-task from routine-task automation, meaning they may predict the wrong direction of wage effects in high-expertise occupations.",
      "The expertise framework requires different policy responses: wage insurance and reskilling accounts are appropriate when routine tasks are automated, but occupational wage-floor policies and credentialing reforms may be more critical when expert task automation compresses specialized professional wages."
    ]
  },
  { id: 139, date: "2019-05-01", added: "2026-05-08",
    title: "Artificial Intelligence, Automation, and Work",
    source: "Acemoglu & Restrepo — NBER",
    sourceUrl: "https://www.nber.org/chapters/c14027",
    category: "labor", geography: "us",
    keyFinding: "Automation increases output per worker more than wages and reduces labor's share of national income even when countervailing productivity effects are present. The most powerful counterbalance is the creation of new labor-intensive tasks. Without it, automation consistently widens the capital-labor income gap regardless of aggregate productivity growth.",
    takeaways: [
      "The framework identifies two competing forces: a displacement effect (machines replace workers, reducing labor demand) and a productivity effect (cost savings boost demand for non-automated tasks), but finds automation increases output faster than wages in most scenarios, shrinking labor's income share.",
      "New labor-intensive task creation is the essential counterbalance: without deliberate reinvestment of productivity gains into new kinds of work, automation generates output growth that does not translate into proportional wage growth for workers.",
      "Structural barriers limit adjustment benefits: skill mismatches, geographic concentration, and the possibility that AI automation outpaces creation of new complementary work mean the standard 'lump-of-labor fallacy' rebuttal underestimates displacement risk in fast-moving adoption environments.",
      "The framework anticipated the AI-era debate: general-purpose technologies with very broad task coverage — precisely the characteristic of large language models — create the most challenging conditions for labor adjustment because they simultaneously displace across many occupational categories, limiting the natural emergence of new task creation."
    ]
  },
  { id: 138, date: "2025-02-11", added: "2026-05-08",
    title: "Which Economic Tasks Are Performed with AI? Evidence from Millions of Claude Conversations",
    source: "Handa, Tamkin et al. — Anthropic",
    sourceUrl: "https://arxiv.org/abs/2503.04761",
    category: "labor", geography: "us",
    keyFinding: "Analysis of over 4 million Claude.ai conversations finds software development and writing together account for nearly half of all AI task usage. 57% of usage involves augmentation (enhancing human work iteratively), while 43% involves automation (completing tasks with minimal human input). Approximately 36% of occupations already deploy AI for at least a quarter of their associated tasks.",
    takeaways: [
      "The augmentation-versus-automation split — 57% vs. 43% — provides the first large-scale empirical measure of how AI is being deployed in practice, suggesting the augmentation frame applies more frequently than the replacement frame in current usage patterns.",
      "Software development and writing dominating AI task usage concentrates AI's current economic impact in a narrow occupational band; the 36% of occupations using AI for 25%+ of tasks indicates penetration already wider than commonly assumed.",
      "The methodology — mapping real conversation data against the U.S. Department of Labor's O*NET occupational task frameworks — establishes an evidence-based approach for tracking how AI economic penetration evolves over time, avoiding reliance on expert elicitation or employer surveys.",
      "The Anthropic dataset represents a single platform and skews toward technically sophisticated users, meaning these findings likely underrepresent AI usage in lower-skill occupations and overrepresent high-complexity cognitive work, the actual automation share in routine tasks is likely higher."
    ]
  },
  { id: 137, date: "2023-04-01", added: "2026-05-08",
    title: "Generative AI at Work",
    source: "Brynjolfsson, Li & Raymond — NBER Working Paper",
    sourceUrl: "https://www.nber.org/papers/w31161",
    category: "labor", geography: "us",
    keyFinding: "A randomized deployment of AI to 5,179 customer support agents increased issues resolved per hour by 14% on average. Gains concentrated almost entirely among newer and lower-skilled workers (34% improvement), while experienced high-performers saw minimal gains. This inverts the usual assumption that AI tools benefit the already-skilled most.",
    takeaways: [
      "The AI tool functions by disseminating the implicit knowledge of high-performing workers to less experienced colleagues, compressing the learning curve rather than replacing human judgment, with productivity gains operating through knowledge transfer rather than automation.",
      "The distributional pattern is the inverse of prior automation research: lower-skill workers benefit most from generative AI assistance, suggesting this technology may reduce within-workplace wage inequality in deployment contexts where it augments rather than replaces.",
      "Secondary benefits beyond productivity included improved customer sentiment and increased employee retention among supported agents, indicating that AI assistance reduces the cognitive and emotional stress of handling difficult interactions.",
      "The concentration of gains among low-skill workers implies that the productivity case for generative AI in high-skill or highly experienced workforces may be considerably weaker than headline figures suggest, and that AI's augmentation value is strongest precisely where expertise gaps are widest."
    ]
  },
  {
    id: 1, date: "2023-03-17", added: "2026-04-30",
    title: "GPTs are GPTs: An Early Look at the Labor Market Impact Potential of Large Language Models",
    source: "Eloundou, Manning, Mishkin & Rock — OpenAI / University of Pennsylvania",
    sourceUrl: "https://arxiv.org/abs/2303.10130",
    category: "labor", geography: "us",
    keyFinding: "Around 80% of U.S. workers could have at least 10% of their tasks affected by LLMs, with higher-wage cognitive jobs facing the greatest exposure, inverting prior automation patterns.",
    takeaways: [
      "Approximately 19% of workers may see 50%+ of their tasks affected, concentrated in professional and managerial occupations rather than routine blue-collar roles.",
      "Unlike previous automation waves, LLM exposure peaks at the top of the wage distribution, writers, programmers, financial analysts.",
      "Tasks involving complex writing, coding, and information synthesis score highest on GPT exposure, suggesting white-collar disruption precedes displacement."
    ]
  },
  {
    id: 2, date: "2024-01-15", added: "2026-04-30",
    title: "New Data Show No AI Jobs Apocalypse — For Now",
    source: "Brookings Institution",
    sourceUrl: "https://www.brookings.edu/articles/new-data-show-no-ai-jobs-apocalypse-for-now/",
    category: "labor", geography: "us",
    keyFinding: "Early labor market data shows AI is accelerating task reallocation rather than immediate job destruction, but wage bifurcation between AI-skilled and unskilled workers is already visible.",
    takeaways: [
      "Job postings requiring AI skills grew 3.5× faster than overall postings in 2023, signaling rapid demand-side restructuring toward AI-complementary roles.",
      "Workers who adopt AI tools show a 14–40% individual productivity boost in controlled studies, but gains concentrate in already high-wage occupations.",
      "Emerging 'AI premiums' in starting salaries (11–25% above equivalent roles) risk entrenching a two-tier labor market within professional services."
    ]
  },
  {
    id: 3, date: "2023-07-12", added: "2026-04-30",
    title: "Writers Strike 2023: AI Provisions and What They Mean for Contracts",
    source: "Writers Guild of America",
    sourceUrl: "https://www.wga.org/contracts/know-your-rights/artificial-intelligence",
    category: "workers", geography: "us",
    keyFinding: "The WGA/SAG-AFTRA strikes established the first major collectively bargained AI guardrails in a creative industry, setting a replicable precedent for labor-AI contract language.",
    takeaways: [
      "The final WGA agreement prohibits AI-generated scripts from undermining writer minimums or stripping residuals, creating enforceable contractual floors.",
      "Studios had proposed using AI for 'first drafts' that writers polish, a model unions argued would eliminate entry-level positions over a single contract cycle.",
      "The strike demonstrated collective action can translate diffuse AI anxieties into specific, auditable contract terms now studied by healthcare and tech unions."
    ]
  },
  {
    id: 4, date: "2024-02-08", added: "2026-04-30",
    title: "Unionization Rates in Tech: Structural Barriers in the AI Era",
    source: "Cornell ILR School",
    sourceUrl: "https://www.ilr.cornell.edu/worker-institute/research",
    category: "workers", geography: "us",
    keyFinding: "Tech sector union density remains below 5% despite rising AI-related job insecurity, driven by contractor misclassification, geographic dispersion, and hostile employer practices.",
    takeaways: [
      "Contractor misclassification — affecting ~40% of the tech workforce — substantially depresses formal union eligibility under current NLRA coverage rules.",
      "Remote-first work has fractured traditional solidarity mechanisms, making organizing 30–50% more costly per worker reached than pre-pandemic.",
      "Tech workers are significantly more likely to sign open letters and protest than to pursue NLRB elections, reflecting structural constraints rather than apathy."
    ]
  },
  {
    id: 5, date: "2024-03-19", added: "2026-04-30",
    title: "Big Tech Merger Tracker: FTC Enforcement and AI Market Consolidation",
    source: "American Economic Liberties Project",
    sourceUrl: "https://www.economicliberties.us/big-tech-merger-tracker/",
    category: "corporate", geography: "us",
    keyFinding: "Major cloud providers have captured AI infrastructure through acquisitions, exclusive compute agreements, and minority investments that existing antitrust frameworks are ill-equipped to address.",
    takeaways: [
      "Microsoft, Google, and Amazon collectively control over 65% of cloud compute used for AI training and inference, creating hard dependencies for downstream companies.",
      "Minority investment structures (Microsoft/OpenAI, Amazon/Anthropic) allow effective control without triggering standard HSR merger notification thresholds.",
      "FTC challenges revealed limits of traditional merger review: data moats, talent lock-in, and API dependency chains fall outside conventional competitive harm analysis."
    ]
  },
  {
    id: 6, date: "2023-11-30", added: "2026-04-30",
    title: "Foundation Model Concentration and API Dependency: Systemic Risk in AI Supply Chains",
    source: "Georgetown CSET",
    sourceUrl: "https://cset.georgetown.edu/publications/",
    category: "corporate", geography: "us",
    keyFinding: "Dependence on a handful of foundation model APIs is creating single points of failure and structural information asymmetries throughout the AI product ecosystem.",
    takeaways: [
      "Over 70% of AI startups surveyed rely on one of three foundation model providers, creating pricing and policy risk comparable to historical utility lock-in.",
      "Model providers control fine-tuning access and usage data, giving them structural intelligence advantages over applications built on their APIs.",
      "A single terms-of-service change could render entire downstream product categories non-viable within days, with limited contractual recourse."
    ]
  },
  {
    id: 7, date: "2023-09-14", added: "2026-04-30",
    title: "Algorithmic Management and Worker Surveillance: Evidence from Warehouse Logistics",
    source: "MIT Work of the Future",
    sourceUrl: "https://dl.acm.org/doi/10.1145/3757409",
    category: "surveillance", geography: "us",
    keyFinding: "AI-driven performance management in warehouses increased throughput by 18% while simultaneously raising injury rates and voluntary turnover by 34%.",
    takeaways: [
      "Algorithmic target systems create a 'ratchet effect': as workers adapt to baselines, the AI raises them, leaving no sustainable steady state.",
      "Workers under algorithmic management report 2.3× higher rates of musculoskeletal injuries and psychological stress than those under traditional supervisors.",
      "Workers lack visibility into how scores are calculated, closing off both informal appeals and formal legal challenge pathways."
    ]
  },
  {
    id: 8, date: "2021-07-06", added: "2026-04-30",
    title: "Essential Work: Analyzing the Hiring Technologies of Large Hourly Employers",
    source: "Upturn",
    sourceUrl: "https://www.upturn.org/work/essential-work/",
    category: "hiring", geography: "us",
    keyFinding: "An analysis of the hiring technologies used by large hourly employers, documenting how applicant tracking systems, assessments, and availability filters screen workers out before any human review, and how little transparency applicants receive about automated rejection.",
    takeaways: [
      "Large hourly employers route nearly all applications through automated screening before human review, making the configuration of these tools a de facto hiring policy.",
      "Availability filters, assessments, and knockout questions reject qualified applicants for reasons unrelated to job performance.",
      "Applicants receive little transparency about why they were screened out, leaving no practical route to contest automated rejections."
    ]
  },
  {
    id: 9, date: "2024-04-24", added: "2026-04-30",
    title: "Improving Mortgage Underwriting Outcomes for Protected Classes Through Distribution Matching",
    source: "National Fair Housing Alliance",
    sourceUrl: "https://nationalfairhousing.org/resource/improving-mortgage-underwriting-and-pricing-outcomes-for-protected-classes-through-distribution-matching/",
    category: "equity", geography: "us",
    keyFinding: "A distribution-matching method applied to AI mortgage underwriting models can increase approval rates for Black and Hispanic applicants by 5–13% without reducing lender profitability, demonstrating that fair lending outcomes and model performance are not in conflict.",
    takeaways: [
      "Models trained on historical data encoded decades of discriminatory lending geography; their opacity made denial reasons impossible for applicants to understand or challenge.",
      "A shift toward 'intent'-based legal standards would effectively immunize algorithmic discrimination from ECOA disparate-impact challenge.",
      "Lenders deploying third-party AI tools reported lacking access to model internals needed to conduct HMDA disparate impact analysis required by federal regulation."
    ]
  },
  {
    id: 10, date: "2023-10-05", added: "2026-04-30",
    title: "Gender Gaps in AI Tool Adoption and the Emerging Productivity Divide",
    source: "World Economic Forum",
    sourceUrl: "https://www.weforum.org/publications/the-global-gender-gap-report-2023/",
    category: "equity", geography: "intl",
    keyFinding: "Women are adopting generative AI tools at measurably lower rates than men across professional contexts globally, compounding existing gender wage gaps through a new productivity channel.",
    takeaways: [
      "Across 15 countries, men are 1.5× more likely to report regular AI tool use for professional tasks, driven by differential access, confidence gaps, and unequal encouragement.",
      "Women in highest AI-exposure occupations — administrative, customer service — receive less employer-sponsored AI training than men in equivalent roles.",
      "Without targeted intervention, WEF projects the gender productivity gap could widen by 8–12 percentage points in knowledge-intensive sectors by 2030."
    ]
  },
  {
    id: 11, date: "2023-12-18", added: "2026-04-30",
    title: "Local Implications of Data Centers and the Tech Layoff Wave on Regional Labor Markets",
    source: "Brookings Metro",
    sourceUrl: "https://www.brookings.edu/articles/local-implications-data-centers-rural-communities-us/",
    category: "community", geography: "us",
    keyFinding: "The 2022–2023 tech layoff wave was geographically concentrated in five metro areas, creating localized fiscal stress and housing market corrections invisible in national aggregates.",
    takeaways: [
      "San Francisco, Seattle, Austin, New York, and Boston absorbed over 70% of announced tech layoffs despite representing under 15% of total U.S. employment.",
      "Affected metros saw 6–12% declines in commercial real estate occupancy within six months, with downstream effects on municipal revenues and transit.",
      "Displaced tech workers showed lower-than-expected geographic mobility, concentrating high-skill unemployment in already high-cost housing markets."
    ]
  },
  {
    id: 12, date: "2025-10-17", added: "2026-04-30",
    title: "Data Drain: The Land and Water Impacts of the AI Boom",
    source: "Jon Gorey — Lincoln Institute of Land Policy",
    sourceUrl: "https://www.lincolninst.edu/publications/land-lines-magazine/articles/land-water-impacts-data-centers/",
    category: "community", geography: "us",
    keyFinding: "AI data center construction is creating acute resource conflicts in rural communities as promised job creation fails to materialize while water and power demands intensify.",
    takeaways: [
      "Large data centers in water-stressed regions consume 1–5 million gallons daily for cooling, often under NDAs preventing public accounting of cumulative regional water draw.",
      "Despite large capital investment announcements, data center operations typically create fewer than 50 permanent local jobs per facility.",
      "Local electricity rate increases following data center grid connections have averaged 4–9% in rural co-op territories, disproportionately affecting low-income residents."
    ]
  },
  {
    id: 13, date: "2024-03-05", added: "2026-04-30",
    title: "Always-On Work Culture and AI Assistant Adoption: Boundary Erosion Among Knowledge Workers",
    source: "American Psychological Association",
    sourceUrl: "https://www.apa.org/pubs/reports/work-wellbeing",
    category: "wellbeing", geography: "us",
    keyFinding: "AI productivity tool adoption correlates with extended working hours and declining psychological detachment, partially or fully offsetting efficiency gains in wellbeing outcomes.",
    takeaways: [
      "Workers who adopted AI assistants reported 1.8 more working hours per week on average, tools enable work expansion rather than substitution.",
      "The 'always-ready' framing of AI tools erodes psychological permission to disengage, raising baseline stress even when objective workload is unchanged.",
      "High AI adopters paradoxically report higher job satisfaction despite longer hours, driven by perceived competence gains and task variety."
    ]
  },
  {
    id: 14, date: "2019-06-01", added: "2026-04-30",
    title: "Behind the Screen: Content Moderation in the Shadows of Social Media",
    source: "Sarah T. Roberts — Yale University Press",
    sourceUrl: "https://yalebooks.yale.edu/book/9780300235883/behind-the-screen/",
    category: "wellbeing", geography: "intl",
    keyFinding: "An ethnography of commercial content moderation documenting the hidden global workforce that screens violent and traumatic material for platforms. Roberts traces the psychological toll of sustained exposure, the deliberate invisibility of the work, and its outsourcing to workers with minimal support.",
    takeaways: [
      "Commercial content moderation is invisible by design: platforms distance the work through outsourcing and non-disclosure, keeping its human cost off the books.",
      "Moderators describe cumulative psychological harm from sustained exposure to violent and abusive material, with little employer-provided mental-health support.",
      "Outsourced moderation concentrates in the Global South, where workers absorb the trauma of screening content for platforms headquartered elsewhere."
    ]
  },
  {
    id: 15, date: "2023-06-14", added: "2026-04-30",
    title: "The Economic Potential of Generative AI: The Next Productivity Frontier",
    source: "McKinsey Global Institute",
    sourceUrl: "https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier",
    category: "macro", geography: "intl",
    keyFinding: "Generative AI could add $2.6–4.4 trillion annually to the global economy, but a 5–10 year lag before macroeconomic productivity gains materialize follows historical technology cycles.",
    takeaways: [
      "Current AI investment is concentrated in infrastructure buildout, resembling the 1993–1999 internet phase that preceded measurable GDP productivity gains.",
      "Early efficiency gains are predominantly captured as margin by AI-deploying firms rather than passed to consumers or workers.",
      "The Jevons Paradox is already visible: AI efficiency gains in coding and content are absorbed by increased output demands rather than reduced working time."
    ]
  },
  {
    id: 16, date: "2023-03-27", added: "2026-04-30",
    title: "Generative AI Could Raise Global GDP by 7%",
    source: "Goldman Sachs Global Investment Research",
    sourceUrl: "https://www.gspublishing.com/content/research/en/reports/2023/03/27/d64e052b-0f6e-45d7-967b-d7be35fabd16.html",
    category: "macro", geography: "intl",
    keyFinding: "Generative AI could displace 300 million full-time job equivalents globally while also driving 7% GDP growth, the most cited baseline for scale of economic transformation.",
    takeaways: [
      "Stock image and illustration licensing revenue is projected to fall 60–75% by 2027 as AI image generation becomes embedded in enterprise design workflows.",
      "Copywriting and content marketing — a $400B global market — faces 30–50% revenue compression as AI drafting becomes default in marketing platforms.",
      "Displacement concentrates among freelancers and small agencies while large platforms integrating AI tools capture productivity surplus as margin."
    ]
  },
  {
    id: 17, date: "2025-03-01", added: "2026-04-30",
    title: "EU AI Act: Economic Impact Assessment and Compliance Burden Analysis",
    source: "European Parliament Research Service",
    sourceUrl: "https://www.europarl.europa.eu/RegData/etudes/STUD/2025/778575/ECTI_STU(2025)778575_EN.pdf",
    category: "policy", geography: "intl",
    keyFinding: "The EU AI Act's high-risk classification system imposes €200K–€400K per system per year in compliance costs, creating structural competitive advantages for large incumbents over startups.",
    takeaways: [
      "SMEs building AI for employment, credit, or education decisions face disproportionate conformity assessment burdens that scale poorly with firm size.",
      "20–30% of EU-focused AI startups are exploring non-EU incorporation to avoid high-risk classification, a regulatory arbitrage the Act's extraterritorial provisions don't fully close.",
      "The prohibited AI list is narrower than civil society advocates requested, leaving several contested use cases in the 'limited risk' tier."
    ]
  },
  {
    id: 18, date: "2024-01-08", added: "2026-04-30",
    title: "State-Level AI Employment Laws: A 50-State Survey",
    source: "National Employment Law Project",
    sourceUrl: "https://www.nelp.org/publication/artificial-intelligence-employment-law/",
    category: "policy", geography: "us",
    keyFinding: "A patchwork of state AI-in-hiring laws is emerging rapidly, creating compliance complexity for multi-state employers and leaving workers in 47 states with no statutory AI disclosure rights.",
    takeaways: [
      "Illinois, Maryland, and New York City have enacted laws requiring bias audits or disclosure for AI hiring tools, but enforcement capacity varies enormously.",
      "No federal floor exists: workers in 47 states have no statutory right to know whether AI was used in their hiring, promotion, or termination decisions.",
      "60% of HR technology vendors have not updated products to satisfy existing state audit requirements, suggesting widespread non-compliance even where laws exist."
    ]
  },
  {
    id: 23, date: "2026-04-08", added: "2026-04-30",
    title: "Pennsylvania's Power: Why Local Authority Is the Key to AI Infrastructure Decisions",
    source: "Cella Sum, Maia Woluchem — Data & Society",
    sourceUrl: "https://datasociety.net/library/pennsylvanias-power/",
    category: "community", geography: "us",
    keyFinding: "Pennsylvania is becoming a national hub for data center and AI infrastructure, but state legislation aligned with federal AI industrial policy is eroding municipal authority and bypassing community input in decisions about where and how this infrastructure is built.",
    takeaways: [
      "State preemption laws reduce local governance and public oversight of data center siting, prioritizing regulatory speed over community needs and environmental review.",
      "Federal AI Action Plan initiatives are accelerating state-level measures that streamline infrastructure approvals without adequate democratic participation from affected communities.",
      "An alternative governance framework would balance state infrastructure goals with meaningful local authority, allowing communities to negotiate conditions, not just receive decisions."
    ]
  },
  {
    id: 24, date: "2026-01-21", added: "2026-04-30",
    title: "The Big AI State: How the Trump Administration Is Shaping US Industrial Policy Toward 'Global Technological Dominance'",
    source: "Brian J. Chen, Jai Vipra — Data & Society",
    sourceUrl: "https://datasociety.net/library/the-big-ai-state/",
    category: "policy", geography: "us",
    keyFinding: "Contrary to deregulation rhetoric, the Trump administration is undertaking extraordinary levels of market intervention in AI, reducing financial risk for data center developers, opening foreign markets for U.S. AI infrastructure, and acquiring ownership stakes in critical AI supply chain companies.",
    takeaways: [
      "The emerging 'Big AI State' dedicates substantial public resources to AI investments spanning tech, fossil fuel, real estate, and asset management sectors, blurring public-private boundaries.",
      "Government actions consistently prioritize political objectives and industry growth over worker welfare, community impacts, and environmental protections.",
      "Addressing the concentration of power in AI infrastructure requires new public policy tools and stronger democratic oversight, reversing current policies is necessary but insufficient."
    ]
  },
  {
    id: 25, date: "2026-02-04", added: "2026-04-30",
    title: "(404) Job Not Found: How Government Can Help AI Education Deliver Real Benefits for Workers",
    source: "Serena Oduro, Anuli Akanegbu — Data & Society",
    sourceUrl: "https://datasociety.net/library/404-job-not-found/",
    category: "education", geography: "us",
    keyFinding: "Workers from disadvantaged backgrounds enroll in AI literacy programs but find they lead only to short-term, low-wage, and unsteady work, revealing a fundamental mismatch between digital skilling initiatives and the actual barriers workers face.",
    takeaways: [
      "AI literacy programs fail workers when they treat skill-building in isolation from the broader socioeconomic conditions — housing instability, childcare, transportation — that make sustained learning impossible.",
      "Federal, state, and local governments must align workforce training investments with quality-of-life supports; skills without stability produce credentials, not economic mobility.",
      "Effective digital skilling is contextualized within comprehensive workforce support strategies — not standalone courses — and must be designed with input from the workers they intend to serve."
    ]
  },
  {
    id: 26, date: "2025-10-08", added: "2026-04-30",
    title: "The 'Privacy' Trap: How 'Privacy-Preserving AI Techniques' Mask the New Worker Surveillance and Datafication",
    source: "Minsu Longiaru, Wilneida Negrón, Brian J. Chen, Aiha Nguyen et al. — Data & Society",
    sourceUrl: "https://datasociety.net/library/the-privacy-trap/",
    category: "surveillance", geography: "us",
    keyFinding: "Corporations deploy 'privacy-preserving' AI techniques that technically comply with data privacy laws while enabling large-scale behavioral analysis and worker control, using the language of privacy protection to expand, not constrain, workplace surveillance.",
    takeaways: [
      "Techniques like differential privacy and federated learning can mask surveillance operations: workers remain monitored and profiled even as companies claim compliance with privacy regulations.",
      "Workers lack adequate voice and agency in digital workplace environments; current privacy frameworks address data exposure but not the power imbalances that surveillance creates.",
      "Stronger state enforcement, new workplace technology rights, and three proposed design principles — transparency, worker consent, and third-party audits — offer pathways to genuine protection."
    ]
  },
  {
    id: 27, date: "2026-02-09", added: "2026-04-30",
    title: "Building Civic Strength for an AI Era",
    source: "Meg Young, Alice E. Marwick, Anuli Akanegbu et al. — Data & Society",
    sourceUrl: "https://datasociety.net/points/building-civic-strength-for-an-ai-era/",
    category: "community", geography: "us",
    keyFinding: "Standard 'AI literacy' frameworks are failing the public by framing AI adoption as an individual responsibility rather than a civic and democratic challenge, Data & Society is launching a multi-year AI Civics initiative to build collective capacity for institutional accountability.",
    takeaways: [
      "Public audiences express significant anxiety about AI's rapid integration into daily life and job prospects, and want engagement beyond passive consumption, they seek avenues for collective action.",
      "AI Civics treats artificial intelligence as a civic domain where people hold rights and collective action potential, shifting responsibility from individual users to institutions and policymakers.",
      "The initiative runs through 2029, partnering with community organizations to develop context-specific civics curricula that address systemic concerns rather than promoting individual adoption."
    ]
  },
  {
    id: 28, date: "2026-03-25", added: "2026-04-30",
    title: "Protecting the Public from Chatbot Harms: Aligning State Policy with Research",
    source: "Serena Oduro, Briana Vecchione, Meryl Ye, Livia Garofalo — Data & Society",
    sourceUrl: "https://datasociety.net/points/protecting-the-public-from-chatbot-harms-aligning-state-policy-with-research/",
    category: "policy", geography: "us",
    keyFinding: "Users frequently turn to general-purpose chatbots during emotional vulnerability, but current state legislation focuses almost entirely on disclosure requirements, failing to address the design patterns that enable dependency, reinforce detachment from reality, and escalate distress.",
    takeaways: [
      "Research shows chatbots can mimic intimacy, reinforce detachment from reality, and escalate emotional distress across all age groups, harms that one-time disclosure notices do not prevent.",
      "Effective regulation requires mandatory design constraints prohibiting manipulative behaviors, emotional looping, and isolation-promoting patterns, not just labeling that the user is talking to an AI.",
      "Safety protocols must incorporate crisis signal recognition with clinically-informed escalation to human support; independent audits and attorney general enforcement are essential accountability mechanisms."
    ]
  },
  {
    id: 29, date: "2026-03-19", added: "2026-04-30",
    title: "What 81,000 People Want from AI",
    source: "Saffron Huang et al. — Anthropic",
    sourceUrl: "https://www.anthropic.com/features/81k-interviews",
    category: "wellbeing", geography: "intl",
    keyFinding: "In the largest multilingual qualitative AI study ever conducted — 80,508 Claude users across 159 countries — hope and alarm coexist within individuals rather than dividing into camps, with jobs and economic displacement ranking as the second-most cited concern at 22.3%.",
    takeaways: [
      "Top AI visions: professional excellence (18.8%), personal transformation (13.7%), and time freedom (11.1%), but 81% report AI has moved them toward their stated vision, with productivity gains cited by 32%.",
      "Lower-income regions show 67% net positive sentiment versus more skepticism in wealthy Western nations; entrepreneurship resonates most in Africa and South Asia, while life management concerns peak in developed countries.",
      "A critical 'experience gap' exists: benefits are mostly grounded in lived experience (91% of learning-benefit mentions), while systemic harms remain largely speculative, 46% of cognitive atrophy concerns are firsthand, suggesting public fear outpaces actual harm for some risks."
    ]
  },
  {
    id: 30, date: "2024-12-11", added: "2026-04-30",
    title: "The Missing Institution: A Global Dividend System for the Age of Transformative AI",
    source: "Anna Yelizarova — Digitalist Papers",
    sourceUrl: "https://www.digitalistpapers.com/vol2/yelizarova",
    category: "macro", geography: "intl",
    keyFinding: "Existing national institutions cannot capture value from borderless AI systems; a legally protected global institution modeled on sovereign wealth funds — distributing AI-generated surplus as universal income — is the missing redistributive mechanism.",
    takeaways: [
      "National UBI schemes and traditional taxation cannot address AI systems that generate value across borders without clear jurisdictional accountability, a structural gap that grows as AI scales.",
      "A global AI dividend institution would hold corporate equity stakes in AI firms and distribute returns universally, requiring unprecedented international coordination but offering a durable redistribution floor.",
      "The proposal reframes AI governance from a regulatory problem to an institutional design problem: not just how to constrain AI, but how to structurally distribute its gains before inequality becomes irreversible."
    ]
  },
  {
    id: 32, date: "2023-10-30", added: "2026-04-30",
    title: "AI and the Future of Work in America: Policy Solutions for Supporting Workers",
    source: "Patrick Gaspard — Center for American Progress",
    sourceUrl: "https://www.schumer.senate.gov/imo/media/doc/Patrick%20Gaspard%20-%20Statement.pdf",
    category: "policy", geography: "us",
    keyFinding: "AI-driven job displacement requires proactive policy intervention — including work-sharing programs, enhanced unemployment insurance, and improved tax enforcement on tech profits — to maintain economic stability and worker protections during the transition.",
    takeaways: [
      "Work-sharing programs can prevent mass layoffs by allowing employers to reduce hours rather than eliminate positions, preserving employment relationships and benefits during AI-driven industry transitions.",
      "Current unemployment insurance was designed for cyclical job loss, not structural technological displacement, benefit duration, eligibility criteria, and retraining support all require systematic modernization.",
      "Closing tax loopholes that enable tech sector offshore profit shifting is a prerequisite for funding transition programs, enforcement is an underutilized policy lever before any new revenue mechanisms are needed."
    ]
  },
  {
    id: 33, date: "2025-12-09", added: "2026-04-30",
    title: "How Americans Feel About a World Without Paid Work",
    source: "Bharat Ramamurti — The Bully Pulpit",
    sourceUrl: "https://bharatramamurti.substack.com/p/how-americans-feel-about-a-world",
    category: "macro", geography: "us",
    keyFinding: "A survey of 12,000 Americans finds that most believe AI gains should be distributed broadly rather than concentrated with private owners, and prefer a jobs guarantee over UBI, valuing employment for its dignity and purpose, not just income.",
    takeaways: [
      "Americans across partisan lines express skepticism about AI profits concentrating in private hands, suggesting broad latent support for redistribution mechanisms tied to AI economic gains.",
      "Even when presented with a post-scarcity scenario, most Americans prefer meaningful employment over unconditional income transfers, a finding that challenges UBI-first policy frameworks.",
      "The survey reveals a public mandate for jobs guarantee programs that current political narratives about AI policy have largely failed to engage or activate."
    ]
  },
  {
    id: 34, date: "2024-05-01", added: "2026-04-30",
    title: "Wage Insurance for Displaced Workers",
    source: "Benjamin Hyman, Brian Kovak, Adam Leive — NBER",
    sourceUrl: "https://www.nber.org/papers/w32464",
    category: "labor", geography: "us",
    keyFinding: "Wage insurance within the U.S. Trade Adjustment Assistance program increases short-run employment probabilities and raises long-run cumulative earnings — primarily by shortening non-employment spells — and may be financially self-sustaining.",
    takeaways: [
      "Workers receiving wage insurance return to employment faster and achieve higher total earnings over time compared to those receiving only traditional unemployment benefits.",
      "The financial self-sustainability finding is significant: wage insurance may pay for itself through reduced benefit duration and increased tax contributions from faster re-employment, removing a core fiscal objection.",
      "Trade Adjustment Assistance provides the closest existing model for AI displacement insurance; expanding wage insurance eligibility beyond trade-displaced workers is a near-term, tested policy option."
    ]
  },
  {
    id: 35, date: "2024-12-11", added: "2026-04-30",
    title: "Resilient by Design: Dual Safety Nets for Workers in the AI Economy",
    source: "Ioana Marinescu — Digitalist Papers",
    sourceUrl: "https://www.digitalistpapers.com/vol2/marinescu",
    category: "policy", geography: "us",
    keyFinding: "A two-tiered safety net — AI Adjustment Insurance for transitory displacement and a contingent Digital Dividend for persistent joblessness — offers scalable worker protection calibrated to the actual severity of AI's labor market disruption.",
    takeaways: [
      "AI Adjustment Insurance extends existing unemployment infrastructure with enhanced benefits, wage insurance, and retraining support, deployable now without building new administrative systems.",
      "The Digital Dividend is contingent: funded by taxes on the digital economy, it activates and scales only if AI causes persistent widespread joblessness rather than transitional displacement.",
      "The dual-tier design bridges the policy debate between incrementalists and UBI advocates, fiscally prudent under moderate disruption, adequate under severe scenarios, and politically viable across both."
    ]
  },
  {
    id: 36, date: "2025-12-11", added: "2026-04-30",
    title: "Beyond Job Displacement: How AI Could Reshape the Value of Human Expertise",
    source: "David Autor, Neil Thompson — Digitalist Papers",
    sourceUrl: "https://www.digitalistpapers.com/vol2/autorthompson",
    category: "labor", geography: "intl",
    keyFinding: "AI's wage and employment effects depend critically on whether it automates expert or routine tasks: automating expertise raises wages while reducing employment; automating routine tasks expands employment while depressing wages.",
    takeaways: [
      "The 'expertise framework' predicts divergent outcomes across occupations facing identical AI pressures, a nurse and a radiologist may both face automation but with opposite consequences for wages and employment.",
      "Occupations where AI removes routine sub-tasks could see employment expand as work becomes accessible to workers without deep expertise, but at lower wages, worsening inequality within occupational fields.",
      "Policy interventions differ sharply depending on which type of automation dominates: augmenting expertise requires investment incentives; routine-task automation requires income support and retraining at much larger scale."
    ]
  },
  {
    id: 37, date: "2020-11-17", added: "2026-04-30",
    title: "The Work of the Future: Building Better Jobs in an Age of Intelligent Machines",
    source: "David Autor, David Mindell, Elisabeth Reynolds — MIT Work of the Future Task Force",
    sourceUrl: "https://workofthefuture-taskforce.mit.edu/wp-content/uploads/2021/01/2020-Final-Report4.pdf",
    category: "labor", geography: "us",
    keyFinding: "The challenge of AI and automation is not mass unemployment but extreme wage inequality, decades of productivity gains have been so unevenly distributed that most workers have seen minimal benefit from technological progress.",
    takeaways: [
      "The U.S. has created abundant employment since 1980 but failed to create sufficient good jobs, the core problem is job quality and wage distribution, not job quantity.",
      "Labor market institutions — unions, minimum wage, worker training systems — have eroded precisely when they were most needed to distribute technological gains broadly across the workforce.",
      "Rebuilding these institutions requires coordinated action across employers, educational systems, and government; no single piecemeal intervention can address the systemic compression of wages at the bottom."
    ]
  },
  {
    id: 38, date: "2024-01-24", added: "2026-04-30",
    title: "National Artificial Intelligence Research Resource (NAIRR)",
    source: "U.S. National Science Foundation",
    sourceUrl: "https://www.nsf.gov/focus-areas/ai/nairr",
    category: "policy", geography: "us",
    keyFinding: "The NAIRR pilot has supported 600+ research projects and 6,000 students across all 50 states, demonstrating that federally coordinated AI infrastructure can democratize access to compute and data that private or fragmented investment cannot equitably provide.",
    takeaways: [
      "Concentrated AI compute resources at a handful of private firms creates structural barriers to independent safety, fairness, and societal-impact research, public infrastructure is a prerequisite for accountability.",
      "The NAIRR model distributes AI research capacity to universities, nonprofits, and government agencies that cannot currently compete with frontier labs, enabling more diverse and public-interest research agendas.",
      "Federal investment in shared AI infrastructure is simultaneously a competitiveness strategy and an equity intervention, access to compute determines who shapes AI's development trajectory."
    ]
  },
  {
    id: 39, date: "2025-01-30", added: "2026-04-30",
    title: "Building CERN for AI: An Institutional Blueprint",
    source: "Alex Petropoulos et al. — Centre for Future Generations",
    sourceUrl: "https://cfg.eu/building-cern-for-ai/",
    category: "policy", geography: "intl",
    keyFinding: "Europe requires a €30-35 billion CERN-style institution combining distributed and in-house AI research with accountability governance, a public good that no single nation or private actor can produce alone.",
    takeaways: [
      "The CERN model offers a proven template: pooling sovereign resources and scientific talent across nations to produce research infrastructure that individual governments cannot fund competitively.",
      "A hybrid structure — distributed research networks plus concentrated in-house teams — balances the speed advantages of centralized effort with the diversity and legitimacy of open collaboration.",
      "Governance transparency and public accountability are core design requirements: the institution must demonstrate clear public benefit to maintain political support across member states through multiple election cycles."
    ]
  },
  {
    id: 40, date: "2025-07-29", added: "2026-04-30",
    title: "Sovereignty, Security, Scale: A UK Strategy for AI Infrastructure",
    source: "Tony Blair Institute for Global Change",
    sourceUrl: "https://institute.global/insights/tech-and-digitalisation/sovereignty-security-scale-a-uk-strategy-for-ai-infrastructure",
    category: "policy", geography: "intl",
    keyFinding: "The UK must build 3-5GW of domestic AI compute by 2030 and focus on economy-wide deployment rather than frontier model competition, requiring planning reform, energy investment, and AI Growth Zones to maintain strategic sovereignty.",
    takeaways: [
      "Competing with the U.S. and China in frontier AI model training is not viable for the UK; a deployment-focused strategy applying AI broadly across the economy offers higher and more durable national returns.",
      "Planning and energy infrastructure constraints are the primary bottlenecks, regulatory reform in these areas is as strategically important as direct AI investment and more immediately actionable.",
      "AI Growth Zones with streamlined approvals and infrastructure commitments could concentrate private investment while preserving public oversight of critical AI infrastructure at the national level."
    ]
  },
  {
    id: 41, date: "2026-02-23", added: "2026-04-30",
    title: "Building Pro-Worker AI",
    source: "Daron Acemoglu, David Autor, Simon Johnson — Brookings Institution",
    sourceUrl: "https://www.brookings.edu/articles/building-pro-worker-ai/",
    category: "labor", geography: "us",
    keyFinding: "Firms over-invest in AI that automates rather than augments workers; nine specific interventions — building government AI expertise, targeting high-opportunity sectors, and antitrust enforcement — could redirect AI development toward enhancing rather than displacing labor.",
    takeaways: [
      "The choice between augmenting and automating AI is not technologically determined, it reflects investment incentives shaped by tax policy, procurement rules, and competitive dynamics that government can actively reshape.",
      "Nine proposed interventions span demand-side (public procurement favoring augmentation), supply-side (research investment in worker-complementary AI), and regulatory levers (antitrust action against anticompetitive AI acquisitions).",
      "Without active policy intervention, default market incentives will continue directing AI investment toward labor replacement, the current automation-heavy trajectory is a policy failure, not an inevitability."
    ]
  },
  {
    id: 42, date: "2025-06-03", added: "2026-04-30",
    title: "Artificial Power: 2025 Landscape Report",
    source: "Kate Brennan, Amba Kak, Dr. Sarah Myers West — AI Now Institute",
    sourceUrl: "https://ainowinstitute.org/publications/research/ai-now-2025-landscape-report",
    category: "macro", geography: "us",
    keyFinding: "AI integration is concentrating unprecedented power in a small group of tech companies; communities and policymakers must act strategically to reclaim democratic agency.",
    takeaways: [
      "A handful of vertically integrated tech corporations now control the full AI stack — from chips and cloud infrastructure to models and applications — creating systemic risks to democratic accountability and competitive markets.",
      "AI power concentration is not a side effect of innovation but a deliberate corporate strategy; regulatory and community responses must be similarly deliberate and coordinated to be effective.",
      "The report frames AI governance as fundamentally a question of political and economic power, not just technical safety, shifting the policy debate from harms mitigation to structural accountability."
    ]
  },
  {
    id: 43, date: "2026-04-01", added: "2026-04-30",
    title: "2026 AI Index Report",
    source: "Stanford HAI",
    sourceUrl: "https://aiindex.stanford.edu/report/",
    category: "macro", geography: "intl",
    keyFinding: "Annual data-driven overview of global AI development tracking technical, economic, and societal trends to provide empirical benchmarks for research, policy, and governance.",
    takeaways: [
      "AI capabilities continued rapid advancement across benchmarks in 2025, with multimodal and reasoning models showing particular gains, but performance improvements are increasingly concentrated in a small number of well-resourced labs.",
      "AI adoption in enterprise and government settings accelerated, yet workforce displacement effects remain unevenly distributed, with lower-wage and routine-task workers facing disproportionate exposure.",
      "Global AI governance diverged further in 2025-26, with the EU implementing binding rules, the U.S. rolling back federal oversight, and China expanding state-directed AI deployment, creating a fragmented international regulatory landscape."
    ]
  },
  {
    id: 44, date: "2026-01-06", added: "2026-04-30",
    title: "Expert Predictions on What's at Stake in AI Policy in 2026",
    source: "J.B. Branch & Ilana Beller (Public Citizen) et al. — Tech Policy Press",
    sourceUrl: "https://techpolicy.press/expert-predictions-on-whats-at-stake-in-ai-policy-in-2026",
    category: "policy", geography: "us",
    keyFinding: "2026 will be defining for regulatory battles over corporate accountability; real-world harms to children, elections, and vulnerable populations are accumulating and demand federal and state action.",
    takeaways: [
      "Federal preemption of state AI laws is the central legislative battleground in 2026; corporate lobbying for weak federal standards that override stronger state protections is the primary regulatory threat.",
      "Documented AI harms — to minors, in elections, in healthcare and criminal justice — are no longer hypothetical, increasing pressure on legislators to move from voluntary frameworks to binding accountability rules.",
      "State-level AI legislation has outpaced federal action and represents the most active regulatory frontier; the fate of state authority to regulate AI will define the scope of accountability possible in the near term."
    ]
  },
  {
    id: 45, date: "2026-01-12", added: "2026-04-30",
    title: "How 2026 Could Decide the Future of Artificial Intelligence",
    source: "Chris McGuire, Kat Duffy et al. — Council on Foreign Relations",
    sourceUrl: "https://www.cfr.org/article/how-2026-could-decide-future-artificial-intelligence",
    category: "policy", geography: "intl",
    keyFinding: "As AI transitions from experimental to widespread deployment, governance frameworks and geopolitical competition with China will shape whether power concentrates in democratic or authoritarian hands.",
    takeaways: [
      "2026 marks a transition point where AI moves from research and pilots to embedded infrastructure, governance decisions made now will be extremely difficult to reverse as systems become load-bearing.",
      "U.S.-China competition for AI leadership is intensifying across semiconductors, talent, and standards bodies; export controls and investment restrictions are shaping a bifurcated global AI ecosystem.",
      "Democratic governance of AI requires proactive international coordination; a fragmented or race-to-the-bottom regulatory environment risks ceding norm-setting to authoritarian models with fewer accountability constraints."
    ]
  },
  {
    id: 46, date: "2026-03-01", added: "2026-04-30",
    title: "Last Place in the AI-First Economy",
    source: "Alexandra Mateescu, Aiha Nguyen, Sanjay Pinto — Data & Society",
    sourceUrl: "https://datasociety.net/library/last-place-in-the-ai-first-economy/",
    category: "labor", geography: "us",
    keyFinding: "The 'AI-first economy' is a series of deliberate economic decisions that systematically disempower workers; equitable AI futures require democratic oversight and support for worker organizing.",
    takeaways: [
      "The 'AI-first' framing naturalizes corporate choices about automation and surveillance as inevitable technological progress, obscuring the labor relations and power dynamics those choices embed.",
      "Workers in low-wage, care, and service sectors face the most intensive AI monitoring and the fewest protections, the same populations least able to exit bad employers or contest algorithmic decisions.",
      "Worker organizing and collective bargaining are the most effective mechanisms for shaping AI deployment in workplaces; policy interventions that strengthen labor rights are AI governance interventions."
    ]
  },
  {
    id: 47, date: "2026-04-01", added: "2026-04-30",
    title: "Uber For Nursing Part II",
    source: "Katie J. Wells, Maya Pinto, Funda Ustek Spilda — AI Now Institute",
    sourceUrl: "https://ainowinstitute.org/publications/uber-for-nursing",
    category: "workers", geography: "us",
    keyFinding: "Gig nursing platforms are running a coordinated deregulatory campaign across nearly half of U.S. states, threatening worker protections, patient safety, and nursing as a middle-class profession.",
    takeaways: [
      "Gig nursing apps have moved beyond disrupting staffing agencies to actively lobbying state legislatures to eliminate nurse-to-patient ratio requirements and worker classification protections, using the same playbook as Uber and Lyft.",
      "The deregulatory push is concentrated in states with active legislative sessions, making 2026 a critical window for worker and patient safety advocates to engage at the state level.",
      "Nursing represents a test case for how platform economy dynamics extend into highly credentialed, traditionally stable professions, with implications for teachers, social workers, and other public-sector occupations."
    ]
  },
  {
    id: 48, date: "2026-04-01", added: "2026-04-30",
    title: "North Star Data Center Policy Toolkit",
    source: "AI Now Institute",
    sourceUrl: "https://ainowinstitute.org/publications/data-center-policy-guide",
    category: "community", geography: "us",
    keyFinding: "Hyperscale AI data centers deplete natural resources, pollute communities, and fail to deliver promised economic benefits; toolkit offers state/local interventions to curtail unchecked development.",
    takeaways: [
      "AI data center development has accelerated dramatically with little public scrutiny; facilities consume billions of gallons of water and massive amounts of electricity while generating few permanent local jobs.",
      "Communities hosting data centers — often lower-income and communities of color — bear disproportionate environmental burdens while economic benefits flow primarily to shareholders and distant tech workers.",
      "The toolkit provides model legislation and regulatory frameworks for state and local governments to require environmental impact disclosure, community benefit agreements, and water/energy use limits."
    ]
  },
  {
    id: 49, date: "2026-01-15", added: "2026-04-30",
    title: "Reframing Impact: AI Summit 2026",
    source: "AI Now Institute, Aapti Institute, The Maybe",
    sourceUrl: "https://ainowinstitute.org/publication/reframing-impact-ai-summit-2026",
    category: "equity", geography: "intl",
    keyFinding: "Key AI governance concepts risk being co-opted by industry; summit convened global advocates to inject accountability into AI governance discourse.",
    takeaways: [
      "Terms like 'responsible AI,' 'AI safety,' and 'impact assessment' have been progressively emptied of accountability content through industry adoption, the summit sought to reclaim and sharpen these concepts.",
      "Global South advocates brought distinct perspectives on AI harms — including data extraction, labor exploitation in content moderation, and exclusion from governance processes — that are systematically underrepresented in dominant AI policy debates.",
      "Effective AI governance requires centering the expertise and interests of affected communities, not just technical experts and corporate stakeholders; the summit modeled a more inclusive governance process."
    ]
  },
  {
    id: 50, date: "2025-11-11", added: "2026-04-30",
    title: "Fission for Algorithms",
    source: "Dr. Sofia Guerra, Dr. Heidy Khlaaf — AI Now Institute",
    sourceUrl: "https://ainowinstitute.org/publication/fission-for-algorithms",
    category: "policy", geography: "us",
    keyFinding: "AI energy demands are driving dismantlement of nuclear safety standards while deploying unreliable AI for nuclear licensing, creating dual risks of increased radiation exposure and weapons proliferation.",
    takeaways: [
      "Tech companies seeking cheap, clean power for data centers are partnering with the nuclear industry to restart dormant plants and accelerate new builds, creating political pressure to waive safety reviews and environmental requirements.",
      "Nuclear regulators are simultaneously being pushed to adopt AI tools for licensing decisions despite documented unreliability of these systems in high-stakes technical domains.",
      "The intersection of AI energy demand and nuclear power represents an underexamined risk nexus where two sets of inadequately governed technologies are being rapidly co-deployed with insufficient accountability."
    ]
  },
  {
    id: 51, date: "2025-10-14", added: "2026-04-30",
    title: "Alli Finn Testifies at the Philadelphia City Council",
    source: "Alli Finn — AI Now Institute",
    sourceUrl: "https://ainowinstitute.org/publication/alli-finn-testifies-at-the-philadelphia-city-council",
    category: "community", geography: "us",
    keyFinding: "City-level AI policymaking should prioritize public benefit over corporate interests and treat AI governance as democratic accountability.",
    takeaways: [
      "Municipal governments are emerging as important AI governance venues as federal action stalls; city councils can set procurement standards, restrict surveillance uses, and require algorithmic impact assessments.",
      "Philadelphia's consideration of AI governance ordinances reflects broader municipal momentum, over a dozen major cities have enacted or are considering AI accountability legislation.",
      "Framing AI governance as a question of democratic accountability — who decides, who benefits, who bears costs — is more durable than a purely technical or safety-focused frame at the local level."
    ]
  },
  {
    id: 52, date: "2025-04-21", added: "2026-04-30",
    title: "Safety Co-Option and Compromised National Security: The Self-Fulfilling Prophecy of Weakened AI Risk Thresholds",
    source: "Heidy Khlaaf, Sarah Myers West — arXiv",
    sourceUrl: "https://arxiv.org/abs/2504.15088",
    category: "policy", geography: "us",
    keyFinding: "AI technologists have circumvented democratic processes by setting their own risk tolerances, replacing established safety frameworks with ill-defined alternatives that accelerate military AI deployment while undermining national security standards.",
    takeaways: [
      "Without democratically established AI risk thresholds, private technology companies have become de facto arbiters of safety standards, a governance vacuum with life-or-death consequences for military and critical infrastructure systems.",
      "The 'AI arms race' framing is being used to justify lower safety standards, creating a self-reinforcing dynamic where urgency claims erode the oversight mechanisms designed to prevent catastrophic failures.",
      "Military AI systems must align with established assurance frameworks and international humanitarian law — the same standards applied to other safety-critical systems — rather than bespoke industry-defined tolerances."
    ]
  },
  {
    id: 53, date: "2025-02-20", added: "2026-04-30",
    title: "Real Surveillance, Prices and Wages",
    source: "AI Now Institute et al.",
    sourceUrl: "https://ainowinstitute.org/wp-content/uploads/2025/02/Real-Surveillance-Prices-and-Wages-Report.pdf",
    category: "workers", geography: "us",
    keyFinding: "Surveillance technologies are reshaping both wage determination and consumer pricing in ways that concentrate power with employers and corporations while eroding worker and consumer bargaining capacity.",
    takeaways: [
      "Workplace monitoring technologies create asymmetric information environments where employers have granular data on worker behavior and productivity while workers lack comparable visibility into pay-setting and performance evaluation criteria.",
      "Surveillance-driven pricing mechanisms — including algorithmic dynamic pricing and behavioral targeting — allow corporations to extract maximum willingness to pay from consumers, compressing any gains from competition or efficiency.",
      "The dual impact on wages and prices means surveillance infrastructure functions as a wealth transfer mechanism, simultaneously suppressing worker compensation and inflating consumer costs."
    ]
  },
  {
    id: 54, date: "2024-12-01", added: "2026-04-30",
    title: "AI Generated Business: The Rise of AGI and the Rush to Find a Working Revenue Model",
    source: "Brian Merchant — AI Now Institute",
    sourceUrl: "https://ainowinstitute.org/publications/ai-generated-business",
    category: "macro", geography: "us",
    keyFinding: "OpenAI and competing generative AI firms built business models around AGI as a marketing construct rather than a near-term technical objective, using it to attract capital, justify automation sales, and manage corporate scandals.",
    takeaways: [
      "AGI language was strategically deployed at key fundraising and restructuring moments, the term functions primarily as a capital attraction device rather than a technical roadmap, allowing OpenAI to justify massive compute costs and a for-profit pivot.",
      "Enterprise AI sales center explicitly on labor replacement: OpenAI's own definition frames AGI as systems that 'outperform humans at most economically valuable work,' positioning automation as the core value proposition to corporate clients.",
      "Despite $3.4 billion in annualized revenue, the generative AI business model requires industry-wide revenue of ~$600 billion annually to justify current investment levels, a figure with no near-term path to realization, raising significant bubble risk."
    ]
  },
  {
    id: 55, date: "2024-10-18", added: "2026-04-30",
    title: "Mind the Gap: Foundation Models and the Covert Proliferation of Military Intelligence, Surveillance, and Targeting",
    source: "Heidy Khlaaf, Sarah Myers West, Meredith Whittaker — arXiv",
    sourceUrl: "https://arxiv.org/abs/2410.14831",
    category: "policy", geography: "intl",
    keyFinding: "AI policy has narrowly focused on hypothetical CBRN scenarios while overlooking present-day military ISTAR deployments of foundation models that pose documented civilian harm risks and expand adversarial attack surfaces.",
    takeaways: [
      "Regulatory approaches anchored to compute thresholds and model weight restrictions miss actual military AI applications already in deployment, the policy conversation is lagging the operational reality by years.",
      "Commercial foundation models cannot reliably exclude personally identifiable information, creating uncontrolled pathways for adversaries to access intelligence, surveillance, targeting, and reconnaissance capabilities at scale.",
      "Integrating foundation models into military systems expands attack surfaces across interconnected defense infrastructure, the security risk is not just the model itself but the systemic vulnerabilities created by its integration."
    ]
  },
  {
    id: 56, date: "2024-10-15", added: "2026-04-30",
    title: "Redirecting Europe's AI Industrial Policy",
    source: "Frederike Kaltheuner, Leevi Saari, Amba Kak, Sarah Myers West — AI Now Institute",
    sourceUrl: "https://ainowinstitute.org/publications/research/redirecting-europes-ai-industrial-policy",
    category: "policy", geography: "intl",
    keyFinding: "Europe's AI industrial policy risks entrenching Big Tech monopolies rather than challenging them; a genuine public-interest reorientation requires rethinking procurement, infrastructure independence, and the sustainability and labor rights implications of AI investment.",
    takeaways: [
      "Current EU AI industrial policy is shaped by competitiveness and sovereignty framings that largely accept U.S. and Chinese Big Tech dominance as a given, the 12-essay collection argues this concedes too much before the policy fight has begun.",
      "EU public procurement represents an underutilized lever: directing government contracts toward alternatives to dominant platforms could reshape market incentives more effectively than regulation alone.",
      "Integrating climate, labor, and human rights standards into AI industrial investment decisions is not a constraint on innovation but a prerequisite for genuinely public-interest-oriented industrial policy."
    ]
  },
  {
    id: 57, date: "2024-10-01", added: "2026-04-30",
    title: "AI Now's Testimony to New York City Council on Corporate Capture of the MyCity Portal",
    source: "Kate Brennan — AI Now Institute",
    sourceUrl: "https://ainowinstitute.org/wp-content/uploads/2024/10/NYC-Council-Testimony_AI-Now_MyCity-Portal_September-2024.pdf",
    category: "community", geography: "us",
    keyFinding: "NYC's MyCity Portal risks enabling Big Tech firms to leverage citizen data for competitive advantage and normalizing government surveillance of how residents spend public benefits, raising fundamental questions about corporate capture of public infrastructure.",
    takeaways: [
      "Centralized digital wallets proposed under MyCity would allow government agencies to monitor resident spending on public benefits in granular detail — including potential use of 'incentive points' to influence dietary choices — with no demonstrated operational necessity.",
      "The portal's design reflects a pattern of public digital infrastructure being structured around corporate data interests rather than resident needs, with Big Tech partners gaining privileged access to citizen data as a condition of service delivery.",
      "Municipal governments should evaluate AI-enabled service platforms against explicit public interest standards: whether surveillance features are necessary, proportionate, and under democratic oversight rather than corporate control."
    ]
  },
  {
    id: 58, date: "2024-07-01", added: "2026-04-30",
    title: "Public Interest AI for Europe? Shaping Europe's Nascent Industrial Policy",
    source: "AI Now Institute",
    sourceUrl: "https://ainowinstitute.org/publications/public-interest-ai-for-europe-shaping-europes-nascent-industrial-policy",
    category: "policy", geography: "intl",
    keyFinding: "Europe's AI industrial policy risks entrenching the very monopolies it aims to challenge; genuine public-interest AI requires an innovation paradigm outside current market incentives rather than a competitive arms race with U.S. and Chinese tech giants.",
    takeaways: [
      "'There is no AI without Big Tech', U.S. and Chinese firms control essential AI infrastructure (compute, data, talent, consumer access), meaning European industrial policy built on competitiveness assumptions starts from a position of structural dependency.",
      "Current industrial policy may inadvertently strengthen rather than challenge AI monopolies; the Dutch child benefits scandal illustrates how algorithmic government systems can cause severe harm to vulnerable populations when built without accountability.",
      "Europe's comparative advantage lies in building an alternative innovation paradigm grounded in public interest, sustainability, and democratic accountability, not in replicating the ChatGPT hype cycle or racing toward speculative AGI development."
    ]
  },
  {
    id: 59, date: "2025-05-20", added: "2026-04-30",
    title: "Generative AI and Jobs: A 2025 Update",
    source: "Paweł Gmyrek et al. — International Labour Organization",
    sourceUrl: "https://www.ilo.org/publications/generative-ai-and-jobs-2025-update",
    category: "labor", geography: "intl",
    keyFinding: "One in four workers globally is in an occupation with some degree of GenAI exposure, but transformation, not elimination, is the most likely outcome. Social dialogue and collective agreements are essential to ensure productivity gains reach workers rather than bypass them.",
    takeaways: [
      "ILO's refined task-level methodology finds overall automation risk is lower and more stable than early estimates, AI will augment most jobs rather than replace them wholesale, but clerical occupations remain the highest-exposure category globally.",
      "Gender disparities in exposure are stark: female employment in high-income countries faces a 9.6% high-exposure rate versus 3.5% for male employment, compounding existing labor market inequalities through a new technological channel.",
      "Workers need social dialogue, collective bargaining, and updated labor law to capture AI productivity gains, without these governance mechanisms, AI advances will manifest as speed-up, deskilling, or displacement rather than shared prosperity."
    ]
  },
  {
    id: 60, date: "2024-03-28", added: "2026-04-30",
    title: "Unbalanced Labor Market Power Is What Makes Technology — Including AI — Threatening to Workers",
    source: "Josh Bivens, Ben Zipperer — Economic Policy Institute",
    sourceUrl: "https://www.epi.org/publication/ai-unbalanced-labor-markets/",
    category: "labor", geography: "us",
    keyFinding: "AI is unlikely to directly threaten workers' wages and employment, the real threat is unbalanced employer power that allows firms to deploy technology for control rather than shared prosperity; the best AI policy is strengthening worker bargaining position.",
    takeaways: [
      "Historical data show productivity growth has not correlated with higher unemployment or inequality, wage stagnation and displacement are political economy outcomes shaped by policy choices, not inherent properties of any technology including AI.",
      "The same AI tools can augment worker productivity and raise wages OR suppress wages and surveil workers, which outcome prevails depends entirely on the balance of power between employers and employees, not anything intrinsic to the technology.",
      "Policymakers should prioritize strengthening unions, expanding unemployment insurance, and maintaining low unemployment over crafting AI-specific regulations; organized workers have already successfully negotiated AI's workplace role in recent union contracts."
    ]
  },
  {
    id: 61, date: "2024-05-01", added: "2026-04-30",
    title: "The Simple Macroeconomics of AI",
    source: "Daron Acemoglu — NBER Working Paper",
    sourceUrl: "https://www.nber.org/papers/w32487",
    category: "macro", geography: "intl",
    keyFinding: "Task-level economic modeling projects AI's total factor productivity gains at under 0.53% over 10 years — far below the transformative claims driving current investment — and predicts AI will widen the gap between capital and labor income without countervailing policy.",
    takeaways: [
      "The trillion-dollar productivity projections underpinning current AI investment are inconsistent with task-level economic modeling: even optimistic assumptions yield less than 1% TFP growth over a decade, suggesting a significant valuation-to-reality gap.",
      "AI produces both a productivity effect and a displacement effect simultaneously, if displacement exceeds productivity gains in a sector, wages fall even as output rises, meaning aggregate growth statistics can mask deteriorating worker outcomes.",
      "Some AI-created tasks may have negative social value — manipulation, surveillance, engagement optimization — a dimension macroeconomic models systematically omit but that has direct implications for whether AI investment generates genuine public welfare."
    ]
  },
  {
    id: 62, date: "2025-01-07", added: "2026-04-30",
    title: "Future of Jobs Report 2025",
    source: "World Economic Forum",
    sourceUrl: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
    category: "macro", geography: "intl",
    keyFinding: "By 2030 there will be 170 million new roles created and 92 million displaced, a net gain of 78 million jobs. However, the structural transition is highly unequal: displaced roles concentrate in clerical occupations while new roles cluster in technology fields with high entry barriers.",
    takeaways: [
      "86% of employers expect AI and information processing to transform their businesses by 2030, yet 39% of current job skills will be transformed or become outdated, a structural transition challenge that individual upskilling programs alone cannot address at the scale and speed required.",
      "The skills gap is the primary barrier to workforce transformation: 63% of employers cite it as the key constraint, suggesting the binding limit on AI-driven growth is not technology availability but human capital investment and institutional capacity.",
      "Care economy jobs — nursing, social work, personal care aides — are among the fastest-growing categories through 2030, indicating AI will shift labor demand toward human-intensive services while automating information-processing and administrative tasks."
    ]
  },
  {
    id: 63, date: "2025-10-07", added: "2026-04-30",
    title: "Reimagining the Future of Data and AI Labor in the Global South",
    source: "Michelle Du, Chinasa T. Okolo — Brookings Institution",
    sourceUrl: "https://www.brookings.edu/articles/reimagining-the-future-of-data-and-ai-labor-in-the-global-south/",
    category: "labor", geography: "intl",
    keyFinding: "Between 150–430 million data laborers globally — concentrated in Africa and South/Southeast Asia — perform essential work training AI systems under exploitative conditions that tech companies obscure through layers of subcontracting.",
    takeaways: [
      "Data annotators in the Global South frequently work 20-hour shifts processing 1,000 cases daily, experiencing depression, anxiety, and PTSD from moderating violent content, documented psychological harm that is structurally unaddressed because workers often do not know which AI systems their labor will train.",
      "Multinational tech companies shield themselves from accountability by subcontracting through third-party vendors, creating a deliberate opacity that prevents labor protections from attaching to the corporations that ultimately profit from this work.",
      "International and regional bodies (ASEAN, African Union, CARICOM) must establish binding directives on data laborer rights; companies should redesign roles to integrate worker expertise with automation rather than treating human annotation as a temporary cost to be eliminated."
    ]
  },
  {
    id: 64, date: "2025-06-14", added: "2026-04-30",
    title: "Medical AI and Clinician Surveillance — The Risk of Becoming Quantified Workers",
    source: "I. Glenn Cohen, Ifeoma Ajunwa, Ravi B. Parikh — New England Journal of Medicine",
    sourceUrl: "https://www.nejm.org/doi/abs/10.1056/NEJMp2502448",
    category: "workers", geography: "us",
    keyFinding: "AI monitoring tools deployed in clinical settings risk transforming healthcare workers into 'quantified workers', subject to algorithmic performance management that degrades professional autonomy and may compromise patient care quality.",
    takeaways: [
      "AI documentation and monitoring tools are being deployed in hospitals primarily to optimize billing, throughput, and compliance metrics, creating surveillance infrastructure that measures clinician performance against efficiency targets rather than clinical quality or patient outcomes.",
      "Clinician surveillance via AI follows the same trajectory documented in warehouse and gig work: algorithmic management erodes professional judgment, raises burnout rates, and produces ratchet effects where performance baselines continuously tighten with no sustainable endpoint.",
      "Healthcare settings require specific institutional protections: clinicians need transparency about what is measured, the right to contest algorithmic assessments, and governance safeguards ensuring AI monitoring serves patients rather than administrative or revenue optimization."
    ]
  },
  {
    id: 65, date: "2022-10-15", added: "2026-04-30",
    title: "Rent Going Up? One Company's Algorithm Could Be Why",
    source: "Heather Vogell — ProPublica",
    sourceUrl: "https://www.propublica.org/article/yieldstar-rent-increase-realpage-rent",
    category: "community", geography: "us",
    keyFinding: "RealPage's YieldStar algorithm recommends daily rental prices using confidential data shared among competing landlords, a practice that drove rents higher while explicitly overriding leasing agents' human judgment, leading to a 2024 DOJ antitrust lawsuit and 2025 settlement.",
    takeaways: [
      "RealPage's software captured approximately 90% of the algorithmic rent-setting market and instructed landlords to accept lower occupancy rather than reduce prices, an algorithmically enforced coordination among competitors that antitrust experts likened to price-fixing.",
      "In Seattle's Belltown neighborhood, 70% of apartments were managed by RealPage users; concentrated adoption in specific markets amplifies rent effects beyond what any single landlord could achieve, demonstrating how algorithmic tools enable collective market power without formal cartel structures.",
      "The DOJ filed an antitrust lawsuit against RealPage in August 2024 and reached a settlement in November 2025, establishing a legal precedent that algorithmic coordination using non-public competitor data constitutes actionable anticompetitive conduct even without explicit agreement."
    ]
  },
  {
    id: 66, date: "2023-09-26", added: "2026-04-30",
    title: "Digital Denials: How Abuse, Bias, and Lack of Transparency in Tenant Screening Harm Renters",
    source: "Ariel Nelson, Chi Chi Wu, Caroline Cohn — National Consumer Law Center",
    sourceUrl: "https://www.nclc.org/new-report-examines-how-abuse-and-bias-in-tenant-screening-harm-renters/",
    category: "equity", geography: "us",
    keyFinding: "Automated tenant screening tools amplify racial bias at scale by feeding algorithmic scoring systems with eviction records, criminal history, and credit data that contain documented racial disparities, with no evidence credit scores actually predict successful tenancy.",
    takeaways: [
      "There is no empirical evidence that credit scores, eviction records, or criminal history predict whether a renter will pay rent or maintain a tenancy, yet these data points are the primary inputs to AI screening tools used by the vast majority of large landlords.",
      "Racial disparities embedded in underlying data (eviction filings, credit histories, criminal records) are amplified rather than corrected by algorithmic processing, automated tools make discrimination faster, cheaper, and harder to challenge than human decision-making.",
      "FTC, CFPB, Congress, and state governments must regulate the tenant screening industry: requiring accuracy standards, mandatory dispute resolution, demographic impact disclosure, and explicit bans on screening criteria with no demonstrated predictive validity."
    ]
  },
  {
    id: 67, date: "2024-10-17", added: "2026-04-30",
    title: "Stopping Big Tech from Becoming Big AI: A Roadmap for Using Competition Policy to Keep Artificial Intelligence Open for All",
    source: "Max von Thun, Daniel Hanley — Open Markets Institute & Mozilla",
    sourceUrl: "https://www.openmarketsinstitute.org/publications/report-stopping-big-tech-big-ai-roadmap",
    category: "corporate", geography: "intl",
    keyFinding: "Dominant tech firms are replicating their platform monopoly playbook in AI through exclusive partnerships, self-preferencing, and control of essential compute inputs, and existing competition frameworks are sufficient to intervene if regulators act now.",
    takeaways: [
      "The mechanisms concentrating AI power mirror those that entrenched platform dominance: exclusive cloud partnerships between hyperscalers and frontier AI labs, self-preferencing of proprietary AI tools in distribution, and control of the compute infrastructure all other players depend on.",
      "Existing competition law does not require new legislation to address AI concentration, merger blocking, partnership nullification, structural separation, and mandated access to compute are all available today under current antitrust frameworks.",
      "Without coordinated global enforcement, AI consolidation will proceed faster than any single regulator can address; the window for structural intervention is narrowing as AI becomes embedded in critical infrastructure and enterprise workflows."
    ]
  },
  {
    id: 68, date: "2026-04-27", added: "2026-04-30",
    title: "Same Gatekeepers, New Tollbooths: Mapping the AI Content Licensing Market",
    source: "Dr. Courtney Radsch, Karina Montoya — Open Markets Institute",
    sourceUrl: "https://www.openmarketsinstitute.org/publications/report-mapping-the-ai-content-licensing-market",
    category: "corporate", geography: "intl",
    keyFinding: "The emerging AI content licensing market replicates Big Tech's earlier failures: dominant firms simultaneously erode publisher and creator revenue through AI products while controlling the licensing infrastructure meant to compensate them.",
    takeaways: [
      "AI bots circumventing voluntary content access restrictions quadrupled in six months — from 3.3% to 12.9% non-compliance — demonstrating that industry self-regulation fails creators by design, repeating the pattern from the social media licensing era.",
      "A three-tiered licensing market is forming in which large publishers negotiate individually, mid-tier publishers receive nominal payments, and individual creators and small outlets receive nothing, concentrating the benefits of AI training data with those who need it least.",
      "Statutory licensing, collective bargaining rights for publishers, mandatory technical attribution systems, and transparency requirements have succeeded in other jurisdictions (Canada, Australia) and provide a tested policy template for protecting creator labor."
    ]
  },
  {
    id: 69, date: "2025-12-11", added: "2026-04-30",
    title: "Fair and Open Markets for Virtual Power Plants",
    source: "Open Markets Institute & Mission:data Coalition",
    sourceUrl: "https://www.openmarketsinstitute.org/publications/utilities-are-blocking-virtual-power-plants",
    category: "community", geography: "us",
    keyFinding: "Investor-owned utilities are using control of electric meter data and infrastructure to block virtual power plants — one of the most cost-effective tools for managing AI-driven energy demand — through anticompetitive practices that mirror long-recognized forms of monopolistic exclusion.",
    takeaways: [
      "Utilities reserve the right to terminate customer-authorized data access 'at any time, without notice, for any reason,' making independent virtual power plant operation practically impossible and cementing monopoly control over distributed energy resources.",
      "Virtual power plants are among the most cost-effective mechanisms for reducing peak energy costs and avoiding expensive new infrastructure, their suppression by utility monopolies directly inflates energy costs for households and small businesses.",
      "Utility conduct constitutes tying, exclusive dealing, and refusals to deal — forms of monopolistic exclusion courts have repeatedly found unlawful — yet antitrust enforcement has not kept pace with the urgency created by surging AI data center energy demand."
    ]
  },
  {
    id: 70, date: "2025-10-22", added: "2026-04-30",
    title: "The Enduring Force of the Federal Antitrust Laws",
    source: "Daniel Hanley — Open Markets Institute",
    sourceUrl: "https://www.openmarketsinstitute.org/publications/brief-enduring-power-of-us-antitrust-laws",
    category: "policy", geography: "us",
    keyFinding: "Federal antitrust statutes remain powerful and sufficient tools for addressing AI and tech monopoly, enforcers can pursue seven categories of unlawful conduct including algorithmic price-fixing, platform lock-in, and merger challenges without waiting for new legislation.",
    takeaways: [
      "Despite decades of judicial skepticism since the 1970s, the core federal antitrust statutes have not been gutted, creative enforcement under existing law can address AI-era monopolistic practices from merger challenges to exclusionary conduct by dominant platforms.",
      "Algorithmic price-fixing is explicitly actionable under current antitrust law alongside traditional cartel behavior, the RealPage settlement demonstrates that AI-mediated coordination among competitors can be prosecuted without needing new statutory authority.",
      "Platform lock-in practices — onboarding frictions, data portability barriers, API restrictions — constitute enforceable antitrust violations; regulators need sustained political will and technical expertise more than new legal powers."
    ]
  },
  {
    id: 71, date: "2024-06-27", added: "2026-04-30",
    title: "Big Tech Won't Fix Disinformation Without Regulation",
    source: "Austin Ahlman, Dr. Courtney Radsch — Open Markets Institute",
    sourceUrl: "https://www.openmarketsinstitute.org/publications/big-tech-wont-fix-disinformation-without-regulation",
    category: "policy", geography: "intl",
    keyFinding: "Voluntary platform commitments have systematically failed to contain AI-amplified disinformation; binding regulatory frameworks with enforcement mechanisms are the only demonstrated path to meaningful accountability.",
    takeaways: [
      "AI-generated content is accelerating the scale, speed, and sophistication of disinformation in ways that overwhelm voluntary moderation commitments, the same structural incentives that produced platform inaction on earlier disinformation crises remain fully intact.",
      "Self-regulation by dominant platforms is structurally incapable of addressing AI disinformation because the business models of these platforms are directly served by high-engagement content regardless of veracity.",
      "Effective regulation requires mandatory algorithmic transparency, interoperability requirements that reduce platform lock-in, and civil liability provisions that create genuine financial consequences for amplifying demonstrably false content."
    ]
  },
  {
    id: 72, date: "2025-11-01", added: "2026-04-30",
    title: "Artificial Intelligence and Competitive Dynamics in Downstream Markets",
    source: "OECD Competition Committee",
    sourceUrl: "https://www.oecd.org/en/publications/artificial-intelligence-and-competitive-dynamics-in-downstream-markets_ccf0624a-en/full-report.html",
    category: "corporate", geography: "intl",
    keyFinding: "AI is widening a competitive divide between large incumbents and SMEs, while AI can lower barriers to entry in theory, in practice it reinforces incumbency through vertical integration, ecosystem strategies, and opacity that makes anticompetitive conduct increasingly difficult to detect and remedy.",
    takeaways: [
      "AI adoption is costly, complex, and risky at the firm level, creating an 'AI divide' that concentrates productivity gains among large enterprises with resources to invest, SMEs face structural disadvantages that market competition alone will not correct.",
      "Competition risks from AI are largely classical — algorithmic collusion, self-preferencing, exclusionary conduct, price discrimination — but are amplified by the black-box nature of AI systems, making detection and enforcement substantially harder than in traditional markets.",
      "AI's competitive impact is highly context-dependent across sectors; competition authorities need sector-specific expertise and real-time market intelligence rather than one-size-fits-all remedies to keep pace with AI-driven market structure changes."
    ]
  },
  {
    id: 73, date: "2025-04-01", added: "2026-04-30",
    title: "AI Index Report 2025",
    source: "Stanford HAI",
    sourceUrl: "https://hai.stanford.edu/ai-index/2025-ai-index-report",
    category: "macro", geography: "intl",
    keyFinding: "Global corporate AI investment reached $252.3 billion in 2024 — up thirteenfold since 2014 — with U.S. private AI investment at $109.1 billion, nearly 12 times China's, while AI productivity gains are real but concentrate among higher-skilled workers.",
    takeaways: [
      "Private investment in generative AI reached $33.9 billion in 2024, representing more than 20% of all AI-related private investment, yet this capital is overwhelmingly concentrated in the U.S., with the investment gap between the U.S. and the rest of the world widening rather than narrowing.",
      "AI demonstrably boosts productivity in controlled studies, and evidence suggests it narrows the gap between low- and high-skilled workers in specific task settings, but these gains are unevenly distributed and have not yet produced measurable macroeconomic productivity improvements at scale.",
      "The 2025 Index spans R&D, technical performance, ethics, economy, education, and policy, providing the most comprehensive annual empirical baseline for assessing AI's trajectory across sectors and geographies."
    ]
  },
  {
    id: 74, date: "2026-04-02", added: "2026-04-30",
    title: "How AI May Reshape Career Pathways to Better Jobs",
    source: "Justin Heck, Mark Muro et al. — Opportunity@Work & Brookings Metro",
    sourceUrl: "https://www.brookings.edu/articles/how-ai-may-reshape-career-pathways-to-better-jobs/",
    category: "labor", geography: "us",
    keyFinding: "Over 15 million workers without four-year degrees hold 'Gateway' positions that historically served as stepping stones to higher-wage roles, AI exposure threatens to sever these pathways before workers can advance, even if individual jobs technically persist.",
    takeaways: [
      "The primary AI labor risk for non-degree workers is not immediate job elimination but pathway disruption: when Gateway roles are automated or deskilled, the route to higher-wage work disappears even for workers who retain employment in the short run.",
      "Regional exposure varies sharply — Florida metros like Palm Bay face 35.5% Gateway pathway exposure while Midwest cities like Milwaukee face 24% — demanding locally-tailored workforce strategies rather than national policy responses that average over highly unequal local conditions.",
      "Critical unanswered questions remain about whether AI-integrated roles will require credentials beyond reach of non-degree workers, or whether workplace experience can still build transferable skills for advancement, the answer will determine whether AI widens or narrows existing credential divides."
    ]
  },
  {
    id: 75, date: "2026-01-01", added: "2026-04-30",
    title: "AI Will Reshape More Jobs Than It Replaces",
    source: "BCG Henderson Institute",
    sourceUrl: "https://www.bcg.com/publications/2026/ai-will-reshape-more-jobs-than-it-replaces",
    category: "macro", geography: "us",
    keyFinding: "Analysis of 165 million jobs across 1,500 roles finds 50–55% of U.S. jobs will be reshaped by AI within two to three years, and 10–15% potentially eliminated within five years, but the larger and underappreciated risk is role transformation that leaves workers employed but facing radically different expectations.",
    takeaways: [
      "The dominant AI labor story is not replacement but reshaping: workers keep their jobs but face fundamentally different skill requirements, performance metrics, and career trajectories, a transformation that is largely invisible in aggregate employment statistics.",
      "BCG's six-category job taxonomy reveals heterogeneous impacts: 'Substituted Roles' (12% of workforce) face direct AI displacement of core work, while 'Divergent Roles' (12%) see senior positions grow as junior ones shrink, hollowing out career pipelines without reducing headline employment.",
      "The compressed two-to-three-year timeline for reshaping half the workforce demands immediate institutional response; training and transition programs operating on five-to-ten-year planning cycles will be structurally too slow to prevent widespread economic disruption."
    ]
  },
  {
    id: 76, date: "2025-10-15", added: "2026-04-30",
    title: "Workers First: AI Principles to Protect Workers",
    source: "AFL-CIO",
    sourceUrl: "https://aflcio.org/reports/workers-first-ai",
    category: "workers", geography: "us",
    keyFinding: "The AFL-CIO, representing 63 unions and 15 million workers, launched the first comprehensive labor movement AI agenda. It established five principles that center worker input, formal negotiation, transparency, privacy limits, and employer investment in skills as non-negotiable conditions for responsible AI deployment.",
    takeaways: [
      "70% of workers fear replacement by AI, yet federal action has stalled; the Workers First Initiative explicitly shifts the accountability framework from government regulation to collective bargaining and state-level legislation, positioning organized labor as the primary enforcement mechanism in the near term.",
      "The five principles require that AI adoption be treated as a workplace change subject to formal worker input or negotiation, that employers set explicit boundaries on AI-powered monitoring, and that skill-building and career pathways be funded when AI reshapes job roles.",
      "The framework addresses public-sector AI separately: when public funds support AI systems, agencies must disclose how those systems operate, what data they use, and how decisions can be reviewed or challenged, establishing a transparency floor for government AI procurement."
    ]
  },
  {
    id: 77, date: "2026-01-26", added: "2026-04-30",
    title: "Government by AI? Trump Administration Plans to Write Regulations Using Artificial Intelligence",
    source: "Jesse Coburn — ProPublica",
    sourceUrl: "https://www.propublica.org/article/trump-artificial-intelligence-google-gemini-transportation-regulations",
    category: "policy", geography: "us",
    keyFinding: "The Trump administration's Department of Transportation is using Google Gemini to draft federal regulations in 20 minutes and compress rulemaking to 30 days. Meanwhile, it has shed nearly 4,000 staff including 100+ attorneys, raising acute safety concerns across aviation, pipeline, and highway oversight.",
    takeaways: [
      "DOT leadership explicitly framed the goal as 'good enough' regulations, prioritizing speed over rigor in safety-critical domains where regulatory errors have direct life-or-death consequences.",
      "The agency's simultaneous staff reductions mean that AI-generated drafts will face less expert review than ever, the combination of automated drafting and depleted subject-matter expertise creates compounding rather than offsetting risks.",
      "Federal employees, academics, and former officials called the approach 'wildly irresponsible,' comparing it to having an intern draft aviation safety standards, and flagging AI hallucination risks in legally binding regulatory documents."
    ]
  },
  {
    id: 78, date: "2025-03-13", added: "2026-04-30",
    title: "How ProPublica Uses AI Responsibly in Its Investigations",
    source: "Charles Ornstein et al. — ProPublica",
    sourceUrl: "https://www.propublica.org/article/using-ai-responsibly-for-reporting",
    category: "policy", geography: "us",
    keyFinding: "ProPublica used large language models to analyze thousands of NSF grants flagged as 'woke' by Senator Ted Cruz, finding widespread mischaracterization, a case study in both the investigative potential of AI and the human oversight required to make AI-assisted analysis publishable.",
    takeaways: [
      "AI analysis of the Cruz grant database revealed that many flagged grants had only tangential references to diversity or were entirely unrelated to DEI themes, findings that required prohibiting the model from guessing and verifying every output against source documents.",
      "All AI-generated findings underwent staff review before publication, with journalists contacting named parties for comment; the newsroom explicitly frames AI as augmenting human judgment rather than replacing it.",
      "ProPublica has applied similar methods to identify sexual misconduct patterns in disciplinary records and to classify hundreds of hours of Uvalde investigation audio, establishing a replicable, accountability-journalism standard for responsible AI use."
    ]
  },
  {
    id: 79, date: "2026-04-06", added: "2026-04-30",
    title: "The Federal Government Is Rushing Toward AI. Our Reporting Offers Three Cautionary Tales.",
    source: "Renee Dudley — ProPublica",
    sourceUrl: "https://www.propublica.org/article/federal-government-ai-cautionary-tales",
    category: "policy", geography: "us",
    keyFinding: "Historical patterns from federal cloud computing adoption — vendor lock-in, underfunded oversight, and conflicted third-party assessors — are already replicating in the government's AI transition, with FedRAMP operating at minimum staffing as agencies accelerate AI procurement.",
    takeaways: [
      "Discounted or free AI offerings from vendors create dependency that allows significant price increases once agencies are locked in, the GSA has already warned that usage costs can grow quickly without monitoring, mirroring the cloud computing playbook.",
      "FedRAMP now operates with an absolute minimum of support staff, making security validation effectively a rubber stamp at the moment federal AI adoption is accelerating fastest.",
      "Third-party security assessors paid by the vendors they evaluate create structural conflicts of interest; without robust independent oversight, agencies rely on vendor claims rather than verified assessments, a pattern that enabled major federal cybersecurity failures in the cloud era."
    ]
  },
  {
    id: 80, date: "2025-06-06", added: "2026-04-30",
    title: "Inside the AI Prompts DOGE Used to 'Munch' Contracts Related to Veterans' Health",
    source: "Brandon Roberts, Vernal Coleman — ProPublica",
    sourceUrl: "https://www.propublica.org/article/inside-ai-tool-doge-veterans-affairs-contracts-sahil-lavingia",
    category: "policy", geography: "us",
    keyFinding: "DOGE deployed an AI system to review Veterans Affairs contracts. The system analyzed only the first 2,500 words of each document, used undefined key terms, and was iteratively modified to flag more contracts for cancellation. This resulted in essential services including internet infrastructure and patient lift maintenance being targeted.",
    takeaways: [
      "The system analyzed only the first 10,000 characters of contracts when current AI models support inputs more than 50 times larger, a deliberate or negligent design choice that systematically excluded critical contract details from review.",
      "Core terms like 'direct patient care' and 'soft services' were never defined in the prompts, forcing the model to interpret ambiguous criteria in ways that flagged clearly essential services, including ceiling lift maintenance for disabled veterans.",
      "Prompt revisions focused exclusively on making the model 'more aggressive' about flagging contracts for termination, with no parallel refinements to reduce false positives, structurally biasing the system toward maximum cuts rather than accurate waste identification."
    ]
  },
  {
    id: 81, date: "2024-02-02", added: "2026-04-30",
    title: "Police Departments Are Turning to AI to Sift Through Millions of Hours of Unreviewed Body-Cam Footage",
    source: "Umar Farooq — ProPublica",
    sourceUrl: "https://www.propublica.org/article/police-body-cameras-video-ai-law-enforcement",
    category: "surveillance", geography: "us",
    keyFinding: "Police departments have accumulated over 100 petabytes of bodycam footage — the vast majority unreviewed — and are now adopting AI tools to flag problematic officer behavior, but resist disclosing findings publicly, converting a transparency technology into a confidential internal management system.",
    takeaways: [
      "The scale of unreviewed footage — equivalent to 25 million feature films — reflects a fundamental failure of the bodycam transparency promise; AI analysis is being adopted not to fulfill that promise publicly but to manage officer behavior internally.",
      "Around 30 departments currently use AI tools like Truleo that automatically flag behaviors including interrupting civilians, using force, or muting cameras, but union pressure and department resistance mean findings are rarely disclosed to the public or oversight bodies.",
      "The dynamic illustrates a recurring pattern in law enforcement technology: tools adopted under the banner of accountability are operationalized in ways that preserve institutional opacity, with AI accelerating the volume of analysis while accountability mechanisms remain unchanged."
    ]
  },
  {
    id: 82, date: "2025-11-19", added: "2026-04-30",
    title: "Moratoriums and Federal Preemption of State Artificial Intelligence Laws Pose Serious Risks",
    source: "Nicole Alvarez — Center for American Progress",
    sourceUrl: "https://www.americanprogress.org/article/moratoriums-and-federal-preemption-of-state-artificial-intelligence-laws-pose-serious-risks/",
    category: "policy", geography: "us",
    keyFinding: "The 99-1 Senate vote striking an AI preemption moratorium from the budget reconciliation bill exposed its flawed drafting and industry-driven origins, but Congressional Republicans continue pursuing federal preemption despite having no viable replacement for the state protections it would eliminate.",
    takeaways: [
      "The reconciliation moratorium contained vague definitions and enforcement mechanisms that would have created legal confusion, inviting costly litigation while blocking states from regulating AI harms in employment, healthcare, housing, and elections.",
      "Large AI companies and their trade associations actively lobbied for federal preemption to reduce regulatory friction and protect market dominance, framing it as a compliance burden relief for small firms while primarily benefiting incumbent platforms.",
      "States have enacted meaningful AI protections precisely because federal action stalled; preserving state regulatory authority allows for policy experimentation and development of best practices that can eventually inform stronger federal standards."
    ]
  },
  {
    id: 83, date: "2024-09-25", added: "2026-04-30",
    title: "To Implement AI Responsibly, Third-Party Deployments Must Require Safeguards",
    source: "Anastasia Dodd, Megan Shahi — Center for American Progress",
    sourceUrl: "https://www.americanprogress.org/article/to-implement-ai-responsibly-third-party-deployments-must-require-safeguards/",
    category: "policy", geography: "us",
    keyFinding: "Six months after CAP issued safety recommendations, none of the major AI developers had implemented them for third-party deployments — the segment representing the majority of future AI growth — leaving users systematically less protected than those accessing the same models directly.",
    takeaways: [
      "In first-party deployments, users can report safety issues directly to developers; in third-party deployments they can only report to deployers, who have no structural incentive to escalate violations upstream, creating an accountability gap at the fastest-growing layer of AI distribution.",
      "Safety tools exist across major AI platforms but deployers can disable them without consequence; CAP recommends these tools default to on across all deployments rather than being optional features deployers can strip out.",
      "AI companies lack standardized transparency reporting on policy violations, and deployers struggle navigating fragmented compliance documentation, leaving end users exposed to harms that neither the developer nor the deployer is formally accountable for preventing."
    ]
  },
  {
    id: 84, date: "2024-09-19", added: "2026-04-30",
    title: "Using Learning Science To Analyze the Risks and Benefits of AI in K-12 Education",
    source: "Lisette Partelow — Center for American Progress",
    sourceUrl: "https://www.americanprogress.org/article/using-learning-science-to-analyze-the-risks-and-benefits-of-ai-in-k-12-education/",
    category: "education", geography: "us",
    keyFinding: "AI tools in K-12 settings risk displacing the unstructured play, physical movement, and social interaction that learning science identifies as foundational to cognitive development, and poorly designed adoption is likely to deepen educational inequities rather than reduce them.",
    takeaways: [
      "Human brains learn through play, social interaction, and movement in ways that screen-based AI instruction cannot replicate; schools adopting AI tools without assessing their fit with developmental science risk substituting engagement metrics for genuine learning outcomes.",
      "Low-income and BIPOC students face compounded risks from poorly designed AI adoption — including a deepened digital divide and reduced access to enriched learning environments — making equity assessment a prerequisite for any AI tool deployment, not an afterthought.",
      "AI tools should be evaluated against whether they enhance or displace meaningful teacher-student and peer relationships, which are central to motivation and cognitive development; tools that automate interaction rather than support it are likely to harm the students most in need."
    ]
  },
  {
    id: 85, date: "2024-07-30", added: "2026-04-30",
    title: "How States and Districts Can Close the Digital Divide To Increase College and Career Readiness",
    source: "Paige Shoemaker DeMio — Center for American Progress",
    sourceUrl: "https://www.americanprogress.org/article/how-states-and-districts-can-close-the-digital-divide-to-increase-college-and-career-readiness/",
    category: "education", geography: "us",
    keyFinding: "The digital divide has three distinct dimensions — device access, teacher capacity for technology-rich curriculum design, and meaningful implementation in classrooms — and closing all three is a prerequisite for equitable AI-era workforce preparation.",
    takeaways: [
      "One-third of jobs created over the past 25 years did not previously exist, and AI is projected to create 20-50 million new jobs globally by 2030; students without meaningful digital literacy exposure in K-12 are structurally unprepared for the labor market they will enter.",
      "Closing the design and use dimensions of the divide — not just device access — requires building teacher capacity to integrate technology into rich curricula rather than passive uses like online quizzes; professional development investment is as essential as hardware procurement.",
      "Existing federal funding streams including ESSA, IDEA, and IIJA can support technology integration without new appropriations; states and districts that have not mapped available resources against all three divide dimensions are leaving implementation capacity on the table."
    ]
  },
  {
    id: 86, date: "2024-06-17", added: "2026-04-30",
    title: "Taking Further Agency Action on AI",
    source: "Will Dobbs-Allsopp, Reed Shaw, Adam Conner et al. — Center for American Progress",
    sourceUrl: "https://www.americanprogress.org/article/taking-further-agency-action-on-ai/",
    category: "policy", geography: "us",
    keyFinding: "Federal agencies already possess statutory authority to regulate AI risks across consumer protection, civil rights, labor, and financial oversight, and over 80 actionable agency-specific recommendations are available for immediate implementation without new legislation.",
    takeaways: [
      "Congressional inaction on AI legislation means federal agencies must become the primary regulators; existing laws including consumer protection, civil rights, and labor statutes apply to AI-enabled harms with no AI exemption required, enforcement will and technical capacity are the binding constraints.",
      "The analysis spans the White House, Department of Labor, Department of Education, housing regulators, and nine financial agencies, mapping over 80 specific recommendations to each sector's existing jurisdiction, providing an implementation roadmap that does not depend on legislative action.",
      "The core argument mirrors the antitrust framing from Open Markets Institute: regulatory authority already exists; what is missing is the institutional will, technical expertise, and political prioritization to deploy it consistently against AI-enabled harms."
    ]
  },
  {
    id: 87, date: "2024-02-01", added: "2026-04-30",
    title: "Generative AI Should Be Developed and Deployed Responsibly at Every Level for Everyone",
    source: "Megan Shahi, Adam Conner, Nicole Alvarez et al. — Center for American Progress",
    sourceUrl: "https://www.americanprogress.org/article/generative-ai-should-be-developed-and-deployed-responsibly-at-every-level-for-everyone/",
    category: "policy", geography: "us",
    keyFinding: "AI developers implement meaningful safety protections for their own platforms while imposing minimal requirements on third-party API users, creating a structural accountability gap at the layer representing the majority of AI deployment growth.",
    takeaways: [
      "The disparity between first-party and third-party safety requirements creates a system where responsibility is passed to deployers who lack the technical capacity, contractual obligation, or business incentive to enforce it, and end users bear the resulting risk.",
      "Current usage policies lack specificity, transparency, and enforcement capacity; without defined investigation processes, timelines, and consequences for violations, policy terms function as liability shields rather than meaningful safety commitments.",
      "CAP recommends NIST incorporate third-party risk management into its AI framework, the FTC conduct safety requirement studies for API deployments, and Congress establish liability frameworks ensuring developers and deployers share accountability for downstream harms."
    ]
  },
  {
    id: 88, date: "2024-06-17", added: "2026-04-30",
    title: "Fact Sheet: Recommendations for Financial Regulatory Agencies To Take Further Action on AI",
    source: "Todd Phillips, Adam Conner — Center for American Progress",
    sourceUrl: "https://www.americanprogress.org/article/fact-sheet-recommendations-for-financial-regulatory-agencies-to-take-further-action-on-ai/",
    category: "policy", geography: "us",
    keyFinding: "Financial regulators have existing authority to mandate AI explainability, cybersecurity red-teaming, and vendor interoperability requirements, and should use it now rather than waiting for sector-specific AI legislation that may not arrive.",
    takeaways: [
      "Regulators should require that AI systems used in lending, capital management, and customer-facing applications be explainable to both expert and lay audiences, with regular audits and source code reviews to detect discrimination and vulnerabilities before they cause systemic harm.",
      "Financial institutions must conduct structured red team exercises to identify AI vulnerabilities, particularly as adversarial actors increasingly use AI-enabled attacks, a requirement that larger firms should face on an ongoing basis rather than at point-of-deployment only.",
      "Requiring financial firms to ensure interoperability with at least five AI providers before contracting would prevent vendor lock-in, promote competitive alternatives, and reduce the systemic risk of critical financial infrastructure depending on a single AI supplier."
    ]
  },
  {
    id: 89, date: "2024-06-17", added: "2026-04-30",
    title: "Fact Sheet: Recommendations for Housing Regulators To Take Further Action on AI",
    source: "Anna Rodriguez — Center for American Progress",
    sourceUrl: "https://www.americanprogress.org/article/fact-sheet-recommendations-for-housing-regulators-to-take-further-action-on-ai/",
    category: "equity", geography: "us",
    keyFinding: "Housing regulators can use existing authority under the Fair Housing Act and Dodd-Frank to address algorithmic discrimination in advertising, automated valuations, and mortgage underwriting, with specific actions available to HUD and FHFA without new legislation.",
    takeaways: [
      "HUD should update fair housing advertising guidance to explicitly hold companies providing AI-driven advertising services liable for steering housing ads away from protected communities, closing a gap where algorithmic targeting escapes accountability that applies to human decision-making.",
      "The FHFA should expand its proposed automated valuation model rule to cover nonbank lenders, which originated over 50% of residential loans in 2022, and align minimum standards with NIST AI guidelines, the current rule covers a shrinking share of the market it purports to regulate.",
      "Mandatory disclosure of AVM use and the right to request manual appraisals would protect against data manipulation and conflicts of interest in property valuations, directly addressing one of the documented mechanisms through which AI perpetuates racial wealth gaps in housing."
    ]
  },
  {
    id: 90, date: "2024-06-17", added: "2026-04-30",
    title: "Fact Sheet: Recommendations for the Department of Education To Take Further Action on AI",
    source: "Anna Rodriguez — Center for American Progress",
    sourceUrl: "https://www.americanprogress.org/article/fact-sheet-recommendations-for-the-department-of-education-to-take-further-action-on-ai/",
    category: "education", geography: "us",
    keyFinding: "The Department of Education can use existing civil rights statutes and the Higher Education Act to address AI-enabled discrimination in schools, including disproportionate discipline, surveillance of students with disabilities, and inaccurate AI loan servicing chatbots.",
    takeaways: [
      "The Department should issue guidance clarifying that Title VI and Title IX apply to discrimination enabled by AI systems, including algorithmic discipline tools that disproportionately affect students of color and AI-based surveillance systems that flag protected characteristics.",
      "AI-based cheating detection tools may discriminate against students with disabilities by flagging accommodation-related behaviors as suspicious; the Department should require schools to assess disability impacts before deploying any AI surveillance or academic integrity system.",
      "Contracted loan servicers deploying AI chatbots must guarantee borrowers receive accurate information about their individual loans and maintain guaranteed pathways to human agents within reasonable timeframes, a basic standard that current AI deployments in federal loan servicing frequently fail to meet."
    ]
  },
  {
    id: 91, date: "2016-05-23", added: "2026-04-30",
    title: "Machine Bias",
    source: "Julia Angwin, Jeff Larson, Surya Mattu, Lauren Kirchner — ProPublica",
    sourceUrl: "https://www.propublica.org/article/machine-bias-risk-assessments-in-criminal-sentencing",
    category: "criminal-justice", geography: "us",
    keyFinding: "Risk assessment software used across the U.S. to predict future criminals flags Black defendants as future criminals at nearly twice the rate of white defendants, even after controlling for criminal history, age, and gender.",
    takeaways: [
      "Black defendants were 77% more likely to be labeled higher risk for future violent crime and 45% more likely to be labeled higher risk generally, with error patterns running in opposite directions by race.",
      "The algorithm’s inverse error pattern is systematic: Black defendants are disproportionately mislabeled high-risk, while white defendants who go on to reoffend are more often labeled low-risk.",
      "Northpointe’s COMPAS tool was deployed across multiple states for sentencing and pretrial decisions before rigorous independent validation, with predictive calculations kept proprietary and unavailable to defendants."
    ]
  },
  {
    id: 92, date: "2016-10-18", added: "2026-04-30",
    title: "The Perpetual Line-Up: Unregulated Police Face Recognition in America",
    source: "Clare Garvie, Alvaro Bedoya, Jonathan Frankle — Georgetown Law Center on Privacy & Technology",
    sourceUrl: "https://www.law.georgetown.edu/privacy-technology-center/publications/the-perpetual-line-up/",
    category: "criminal-justice", geography: "us",
    keyFinding: "One in two American adults is enrolled in a law enforcement facial recognition network — primarily through driver’s license databases — with virtually no statutory oversight, accuracy standards, or civil liberties protections.",
    takeaways: [
      "Over 117 million Americans were in a law enforcement face recognition network at time of publication, enrolled without consent or knowledge, most via driver’s license photo databases shared with police.",
      "The majority of states and departments using facial recognition had no legal requirements to test for racial bias or validate accuracy, and research shows the technology is least accurate for Black individuals, women, and people aged 18–30.",
      "The report directly prompted regulatory action — Maryland proposed legislation to regulate police use and Vermont ended its driver’s license facial recognition program — demonstrating the policy leverage of empirical surveillance documentation."
    ]
  },
  {
    id: 93, date: "2019-04-01", added: "2026-04-30",
    title: "Dirty Data, Bad Predictions: How Civil Rights Violations Impact Police Data, Predictive Policing Systems, and Justice",
    source: "Rashida Richardson, Jason M. Schultz, Kate Crawford — NYU Law Review",
    sourceUrl: "https://www.nyulawreview.org/wp-content/uploads/2019/04/NYULawReview-94-Richardson-Schultz-Crawford.pdf",
    category: "criminal-justice", geography: "us",
    keyFinding: "Thirteen U.S. cities with documented police misconduct — including departments under federal consent decrees — were actively using predictive policing systems trained on the same corrupt data that misconduct produced.",
    takeaways: [
      "Predictive policing launders discriminatory enforcement: systems like PredPol and HunchLab train on historical arrest data that reflects the biases of the officers who generated it, then output algorithmic predictions that appear objective and are harder to contest legally.",
      "The “dirty data cities” identified include jurisdictions where police data was formally found tainted through civil rights investigations, consent decrees, and federal oversight, yet procurement processes contained no requirement to audit training data for such contamination.",
      "No existing legal framework requires law enforcement agencies to assess whether training data is compromised by past misconduct before deploying predictive systems, a structural accountability gap with no current remedy."
    ]
  },
  {
    id: 94, date: "2019-10-25", added: "2026-04-30",
    title: "Dissecting Racial Bias in an Algorithm Used to Manage the Health of Populations",
    source: "Ziad Obermeyer, Brian Powers, Christine Vogeli, Sendhil Mullainathan — Science",
    sourceUrl: "https://www.science.org/doi/10.1126/science.aax2342",
    category: "equity", geography: "us",
    keyFinding: "A widely used commercial health algorithm exhibits significant racial bias because it uses healthcare cost as a proxy for illness, and structural inequities mean less is spent on Black patients with equivalent need, causing the algorithm to systematically underestimate their severity.",
    takeaways: [
      "At any given risk score, Black patients are considerably sicker than white patients, meaning the algorithm consistently underestimates Black patients’ illness severity and need for additional care management.",
      "Correcting the bias would more than double the proportion of Black patients identified for high-risk care programs, raising the share from 17.7% to 46.5%, affecting millions of people currently under-served by the tool.",
      "The flaw lies not in implementation but in the choice of cost as a proxy for health need, a design decision that appears technically reasonable but encodes structural inequity, demonstrating how bias enters through proxy selection rather than explicit discrimination."
    ]
  },
  {
    id: 95, date: "2020-08-27", added: "2026-04-30",
    title: "Hidden in Plain Sight — Reconsidering the Use of Race Correction in Clinical Algorithms",
    source: "Darshali A. Vyas, Leo G. Eisenstein, David S. Jones — New England Journal of Medicine",
    sourceUrl: "https://www.nejm.org/doi/abs/10.1056/NEJMms2004740",
    category: "equity", geography: "us",
    keyFinding: "Race-adjustment factors embedded in widely used clinical algorithms across cardiology, nephrology, obstetrics, and urology encode a false biological premise about race and systematically direct Black patients away from care they clinically need.",
    takeaways: [
      "Race correction in the eGFR kidney function formula assigns higher scores to Black patients regardless of individual clinical circumstances, resulting in Black patients being less likely to receive timely transplant referrals, a concrete, documented harm from a widely deployed clinical tool.",
      "These adjustments are embedded in clinical software, electronic health records, and medical training across multiple specialties, making individual provider awareness an inadequate remedy for a structural problem in clinical decision infrastructure.",
      "The authors call for eliminating race as a variable in clinical algorithms and replacing it with socioeconomic and structural determinants of health that reflect actual causal mechanisms rather than a biological proxy with no empirical basis."
    ]
  },
  {
    id: 96, date: "2024-10-17", added: "2026-04-30",
    title: "Refusal of Care: Medicare Advantage Insurers’ Use of Prior Authorization to Delay and Deny Post-Acute Care for Seniors",
    source: "U.S. Senate Permanent Subcommittee on Investigations",
    sourceUrl: "https://www.blumenthal.senate.gov/newsroom/press/release/senate-permanent-subcommittee-on-investigations-releases-majority-staff-report-exposing-medicare-advantage-insurers-refusal-of-care-for-vulnerable-seniors",
    category: "policy", geography: "us",
    keyFinding: "The three largest Medicare Advantage insurers systematically used AI-driven prior authorization to restrict post-acute care access for seniors, with escalating denial rates that coincided directly with AI deployment and increased profitability.",
    takeaways: [
      "UnitedHealthcare’s prior authorization rejection rate for post-acute care nearly doubled from 10.9% in 2020 to 22.7% in 2022, directly following expanded AI automation in the review process, with no corresponding change in patient health or clinical standards.",
      "CVS increased prior authorization requirements by 57.5% — far exceeding its 40% enrollment growth — after deploying AI-driven prior authorization software, and internal presentations show the company deliberately deprioritized reducing denial volume due to significant profit impact.",
      "The investigation found no evidence that escalating denial rates reflected appropriate clinical judgment, documenting AI deployment as a profit-maximization mechanism in consequential medical decisions affecting vulnerable seniors."
    ]
  },
  {
    id: 97, date: "2023-01-18", added: "2026-04-30",
    title: "OpenAI Used Kenyan Workers on Less Than $2 Per Hour to Make ChatGPT Less Toxic",
    source: "Billy Perrigo — TIME",
    sourceUrl: "https://time.com/6247678/openai-chatgpt-kenya-workers/",
    category: "labor", geography: "intl",
    keyFinding: "OpenAI outsourced toxic content labeling to Kenyan workers paid under $2 per hour, who were required to read and categorize graphic depictions of violence, sexual abuse, and trauma with inadequate psychological support.",
    takeaways: [
      "Workers at Nairobi-based Sama, contracted by OpenAI, were paid between $1.32 and $2 per hour to review and label disturbing content to train ChatGPT’s safety classifier, a supply chain dimension absent from most AI safety discourse.",
      "Many workers reported symptoms of secondary trauma; Sama’s contract with OpenAI was terminated several months early amid a labor dispute in which workers sought union recognition.",
      "The commercial viability of “safe” generative AI depends on an invisible global workforce of low-wage data laborers disproportionately located in the Global South, a structural labor condition that safety certifications and model cards do not disclose."
    ]
  },
  {
    id: 98, date: "2020-07-08", added: "2026-04-30",
    title: "Decolonial AI: Decolonial Theory as Sociotechnical Foresight in Artificial Intelligence",
    source: "Shakir Mohamed, Marie-Therese Png, William Isaac — Philosophy & Technology",
    sourceUrl: "https://link.springer.com/article/10.1007/s13347-020-00405-8",
    category: "equity", geography: "intl",
    keyFinding: "Decolonial theory provides a framework for identifying how AI systems replicate colonial structures, extracting data and labor from the Global South, concentrating power in wealthy institutions, and reinforcing Western research norms as universal.",
    takeaways: [
      "AI development reproduces colonial dynamics through “algorithmic coloniality”: surveillance systems and behavioral classification tools are developed for and tested on vulnerable populations in the Global South before deployment elsewhere, extracting data value without redistributing benefit.",
      "The authors call for “reverse tutelage”, reorienting AI knowledge flows so that communities historically marginalized by technology hold genuine authority over research agendas and deployment decisions, rather than serving as data sources or test populations.",
      "Strengthening political communities across the Global South is necessary to make AI governance genuinely multilateral, a direct challenge to the concentration of AI ethics and governance in a handful of Western institutions and companies."
    ]
  },
  {
    id: 99, date: "2018-12-10", added: "2026-04-30",
    title: "Help Wanted: An Examination of Hiring Algorithms, Equity, and Bias",
    source: "Aaron Rieke, Miranda Bogen — Upturn",
    sourceUrl: "https://www.upturn.org/work/help-wanted/",
    category: "hiring", geography: "us",
    keyFinding: "Predictive hiring algorithms automate rejection at scale with minimal transparency, vendors disclose almost nothing about how systems are built or validated, making discrimination effectively undetectable and unchallengeable.",
    takeaways: [
      "Most algorithmic hiring tools automate rejection rather than selection, screening candidates out before human review, concentrating disparate impact at the point of least visibility and accountability in the hiring funnel.",
      "Removing protected characteristics like race and gender from algorithm inputs does not prevent discriminatory outcomes: historical hiring patterns, zip codes, and credentials carry demographic proxies that reproduce the same disparities through different variables.",
      "Existing civil rights law was designed for human decision-makers and does not clearly assign liability to vendors versus employers when algorithmic tools produce discriminatory outcomes, a structural enforcement gap that benefits neither jobseekers nor regulators."
    ]
  },
  {
    id: 100, date: "2020-01-27", added: "2026-04-30",
    title: "Mitigating Bias in Algorithmic Hiring: Evaluating Claims and Practices",
    source: "Manish Raghavan, Solon Barocas, Jon Kleinberg, Karen Levy — ACM FAccT",
    sourceUrl: "https://dl.acm.org/doi/10.1145/3351095.3372828",
    category: "hiring", geography: "us",
    keyFinding: "Bias mitigation techniques used by algorithmic hiring vendors are neither transparent nor legally adequate, and the de-biasing methods vendors employ create direct tensions with antidiscrimination law.",
    takeaways: [
      "Hiring algorithm vendors provide almost no documentation of how their systems are built or validated for bias, making independent audit impossible and employer due diligence effectively meaningless.",
      "Technical choices about what data to collect and what outcomes to predict introduce distinct bias risks hidden behind product-level mitigation claims, each representing a separate, undisclosed design decision with disparate impact potential.",
      "De-biasing techniques — such as removing protected attributes or adjusting score distributions — can conflict with Uniform Guidelines on Employee Selection Procedures, creating situations where a legally compliant system remains technically biased and vice versa."
    ]
  },
  {
    id: 101, date: "2021-10-28", added: "2026-04-30",
    title: "EEOC Launches Initiative on Artificial Intelligence and Algorithmic Fairness",
    source: "U.S. Equal Employment Opportunity Commission",
    sourceUrl: "https://www.eeoc.gov/newsroom/eeoc-launches-initiative-artificial-intelligence-and-algorithmic-fairness",
    category: "policy", geography: "us",
    keyFinding: "The EEOC formally asserted that existing federal antidiscrimination law — Title VII, ADA, ADEA — applies to AI-driven employment decisions, establishing that technology creates no legal carve-out from civil rights obligations.",
    takeaways: [
      "The initiative represents the first formal EEOC assertion that employers cannot outsource civil rights liability to AI vendors, if an algorithmic hiring or management tool produces discriminatory outcomes, the employer remains legally responsible.",
      "The EEOC identified tools across the hiring funnel — resume screeners, video interview analyzers, predictive assessments — as potential sources of disparate impact, with particular attention to disability discrimination via AI screening under the ADA.",
      "The initiative produced concrete technical guidance and stakeholder listening sessions, establishing a regulatory baseline that companies deploying AI in employment contexts can be held to without waiting for new legislation."
    ]
  },
  {
    id: 102, date: "2020-06-30", added: "2026-04-30",
    title: "Inside the Invasive, Secretive ‘Bossware’ Tracking Workers",
    source: "Bennett Cyphers, Karen Gullo — Electronic Frontier Foundation",
    sourceUrl: "https://www.eff.org/deeplinks/2020/06/inside-invasive-secretive-bossware-tracking-workers",
    category: "surveillance", geography: "us",
    keyFinding: "Remote work surveillance software routinely captures keystroke logs, screenshots, webcam feeds, GPS location, private messages, and passwords, with nine of ten vendors offering covert installation that workers cannot detect.",
    takeaways: [
      "Nine of ten bossware vendors examined offered invisible or covert installation modes, enabling employers to monitor workers on employer-provided devices without disclosure, a capability with no analog in physical workplace monitoring.",
      "Data collected routinely exceeds any plausible business justification: many tools capture personal communications, passwords, and off-hours activity, extending employer surveillance into domestic space without consent.",
      "U.S. law offers workers almost no protection: employers can monitor employer-owned devices with minimal restriction, and proposed legislation requiring notice and proportionality exists only at the state level in a small number of jurisdictions."
    ]
  },
  {
    id: 103, date: "2022-06-21", added: "2026-04-30",
    title: "The Values Encoded in Machine Learning Research",
    source: "Abeba Birhane, Pratyusha Kalluri, Dallas Card, William Agnew, Ravit Dotan, Michelle Bao — ACM FAccT",
    sourceUrl: "https://dl.acm.org/doi/fullHtml/10.1145/3531146.3533083",
    category: "macro", geography: "intl",
    keyFinding: "Analysis of 100 highly-cited ML papers finds that performance, efficiency, and novelty dominate as research values, fewer than 15% connect their work to a societal need, and only 1% discuss negative potential.",
    takeaways: [
      "The six dominant values in mainstream ML research — performance, generalization, efficiency, building on past work, quantitative evidence, and novelty — are structurally misaligned with societal benefit and generally support the centralization of power.",
      "Increasingly close ties between highly-cited papers and tech companies and elite universities mean mainstream ML research reflects the values of privileged institutional actors, not communities most affected by deployment.",
      "The field’s value system is self-reinforcing: the metrics by which research is evaluated reward the same qualities that serve commercial and institutional interests, creating a feedback loop that resists reform from within the research community."
    ]
  },
  {
    id: 111, date: "2021-02-12", added: "2026-04-30",
    title: "Privacy Without Monopoly: Data Protection and Interoperability",
    source: "Bennett Cyphers, Cory Doctorow — Electronic Frontier Foundation",
    sourceUrl: "https://www.eff.org/wp/interoperability-and-privacy",
    category: "datarights", geography: "us",
    keyFinding: "Interoperability policies can simultaneously foster competition and protect user privacy, but only if mandated data portability and delegability requirements include strict consent and data minimization safeguards to prevent misuse across company boundaries.",
    takeaways: [
      "Reforming the DMCA, CFAA, and Terms of Service enforcement would allow developers to build privacy-enhancing tools and alternative services without legal reprisal, giving users meaningful choice rather than choosing between surveillance and exclusion from essential platforms.",
      "Mandated interoperability creates new privacy risks if not paired with robust legal constraints: data shared across company boundaries under portability or back-end interoperability requirements can be exploited unless consent and minimization requirements travel with the data.",
      "Relying on tech monopolies as de facto privacy protectors is structurally flawed, democratically-enacted privacy law with private rights of action provides more durable protection than corporate discretion, and interoperability mandates work best when layered on top of strong baseline privacy requirements."
    ]
  },
  {
    id: 112, date: "2023-11-14", added: "2026-04-30",
    title: "Privacy First: A Better Way to Address Online Harms",
    source: "Corynne McSherry, Mario Trujillo, Cindy Cohn, Thorin Klosowski — Electronic Frontier Foundation",
    sourceUrl: "https://www.eff.org/wp/privacy-first-better-way-address-online-harms",
    category: "policy", geography: "us",
    keyFinding: "Comprehensive data privacy legislation addressing corporate surveillance can simultaneously resolve children’s safety, journalism decline, healthcare access, and competition harms, making fragmented issue-specific proposals redundant.",
    takeaways: [
      "Rather than passing disconnected laws targeting individual harms, policymakers should implement robust privacy protections that address multiple internet harms at once, the paper maps how a single strong privacy framework would resolve concerns currently addressed through a patchwork of sector-specific legislation.",
      "Effective legislation requires behavioral advertising bans, data minimization mandates, strong opt-in consent, private rights of action, and prohibitions on deceptive design patterns, the paper treats these as a non-negotiable floor, not optional additions.",
      "Privacy protections function as civil rights legislation: reducing discriminatory targeting, limiting law enforcement access to personal data, preventing foreign surveillance, and leveling competitive playing fields for technology startups against entrenched incumbents."
    ]
  },
  {
    id: 104, date: "2025-04-23", added: "2026-04-30",
    title: "Revolutionizing Health and Safety: The Role of AI and Digitalization at Work",
    source: "International Labour Organization",
    sourceUrl: "https://www.ilo.org/publications/revolutionizing-health-and-safety-role-ai-and-digitalization-work",
    category: "wellbeing", geography: "intl",
    keyFinding: "AI and digitalization offer significant potential to reduce workplace hazards and prevent injuries, but introduce new psychosocial and regulatory risks that existing occupational safety frameworks were not designed to address.",
    takeaways: [
      "Automation, robotics, smart monitoring, and algorithmic work management are reshaping occupational safety practices across industries, with benefits in hazard reduction but new exposures in stress, surveillance, and work intensification.",
      "Significant regulatory gaps exist across countries in how digitalized workplaces are governed for occupational safety, with most national frameworks still oriented toward physical hazards rather than the psychosocial risks AI deployment introduces.",
      "The report provides governments, employers, and workers with case studies and preventive strategies for safely integrating digital tools, positioning occupational safety as an active AI governance frontier, not a downstream compliance issue."
    ]
  },
  {
    id: 105, date: "2024-07-26", added: "2026-04-30",
    title: "Mind the AI Divide: Shaping a Global Perspective on the Future of Work",
    source: "International Labour Organization",
    sourceUrl: "https://www.ilo.org/publications/major-publications/mind-ai-divide-shaping-global-perspective-future-work",
    category: "macro", geography: "intl",
    keyFinding: "Disparities in digital infrastructure, technology access, education, and training are deepening existing global inequalities as AI reshapes economies, with less-developed nations at greatest risk of being permanently left behind.",
    takeaways: [
      "The AI divide is not primarily about access to AI tools but about the prerequisites for adoption: digital infrastructure, skills, regulatory capacity, and institutional readiness, gaps that compound at every level of development.",
      "Organizations can achieve productivity gains and improved working conditions through AI when supported by proper infrastructure and collaborative labor practices, but these enabling conditions are deeply unevenly distributed globally.",
      "Addressing the divide requires international collaboration in AI capacity building, individual country strategies are insufficient given the scale of cross-border dependency in AI supply chains and the concentration of AI development in a handful of wealthy economies."
    ]
  },
  {
    id: 106, date: "2026-04-30", added: "2026-04-30",
    title: "AI Systems @ Work: A Changing Psychosocial Work Environment",
    source: "International Labour Organization",
    sourceUrl: "https://www.ilo.org/resource/news/ai-driven-intrusive-surveillance-and-loss-autonomy-work-linked-psychosocial",
    category: "wellbeing", geography: "intl",
    keyFinding: "AI-driven surveillance, work intensification, and erosion of job autonomy are generating measurable psychosocial risks at work that existing occupational safety and health frameworks are structurally unequipped to address.",
    takeaways: [
      "AI implementation creates a cluster of interconnected psychosocial hazards — surveillance anxiety, reduced autonomy, work intensification, and privacy erosion — that existing OSH frameworks, still oriented toward physical risks, do not adequately govern.",
      "ILO Working Paper 170 documents that mental health risks from AI management are structural, not incidental: they arise from how algorithmic systems are designed and deployed, making individual coping strategies an insufficient response.",
      "An integrated policy approach combining labor regulation, occupational safety law, equality protections, and data protection frameworks is required, no single regulatory stream is sufficient to address the psychosocial risks AI management systems generate."
    ]
  },
  {
    id: 107, date: "2026-04-21", added: "2026-04-30",
    highlight: { stat: "54", text: "countries negotiated the first global tripartite agreement on artificial intelligence in manufacturing, covering nearly 500 million workers.", themeId: "worker-power" },
    title: "ILO Adopts First-Ever Conclusions on AI in Manufacturing Work",
    source: "International Labour Organization",
    sourceUrl: "https://www.ilo.org/resource/news/ilo-adopts-first-ever-conclusions-ai-manufacturing-work",
    category: "policy", geography: "intl",
    keyFinding: "Representatives from 54 countries adopted the ILO’s first tripartite conclusions on AI in manufacturing, establishing globally negotiated guidance on skills, safety, and worker rights for a sector employing nearly 500 million people.",
    takeaways: [
      "The conclusions are the first ILO tripartite agreement specifically on AI, developed by government officials, employers, and trade unions from 54 countries, giving them legitimacy and global reach that unilateral national frameworks cannot achieve.",
      "Core recommendations cover skills development, occupational safety standards, fundamental labor rights protection, and strengthened social dialogue, rejecting a purely productivity-focused framing of AI deployment in manufacturing.",
      "Submission to the ILO Governing Body in November 2026 for approval establishes a policy timeline that labor advocates can use to hold governments accountable to the tripartite commitments made during adoption."
    ]
  },
  {
    id: 108, date: "2026-04-14", added: "2026-04-30",
    title: "AI Training Opens Doors for Women Entrepreneurs in the Philippines",
    source: "International Labour Organization",
    sourceUrl: "https://www.ilo.org/resource/news/ai-training-opens-doors-women-entrepreneurs-philippines",
    category: "equity", geography: "intl",
    keyFinding: "Women entrepreneurs in a remote Philippine community successfully adopted AI tools for business growth through an ILO program designed for digital novices, demonstrating that inclusive AI adoption requires training design and infrastructure investment, not just access.",
    takeaways: [
      "The Digital-PINAS programme equipped women from the United Mothers Livelihood Association with practical AI tools for informal micro-businesses, showing that technical expertise is not a prerequisite for AI adoption when training is appropriately designed.",
      "The program addressed both the skills gap and the infrastructure gap simultaneously, equipping local training centers with connectivity tools alongside the AI training itself, recognizing that access without connectivity is not meaningful access.",
      "The Philippine case offers a replicable model for Global South AI inclusion: community-centered, practical, and designed for micro and small enterprises rather than scaling down tools built for larger organizations."
    ]
  },
  {
    id: 109, date: "2026-03-06", added: "2026-04-30",
    title: "Adoption of Artificial Intelligence and Productivity Growth in Kuwait’s Private Sector",
    source: "International Labour Organization",
    sourceUrl: "https://www.ilo.org/resource/news/ai-adoption-shapes-productivity-kuwait",
    category: "macro", geography: "intl",
    keyFinding: "AI adoption is expanding across Kuwait’s private sector, but large enterprises are adopting at dramatically higher rates than small firms, and only 26% of reported productivity effects met criteria for verified impact.",
    takeaways: [
      "Large enterprises show far stronger AI readiness than small firms: 45% of large companies have formal AI policies and 65% offer AI training, compared to 14% and 29% respectively among smaller firms, a size-stratified gap that mirrors patterns in Western economies.",
      "Despite widespread reports of faster task execution, only 26% of claimed productivity effects met the study’s criteria for verified impact, suggesting that AI adoption and AI-driven productivity are not the same thing and that measurement gaps are significant.",
      "Converting AI investment into measurable productivity gains requires organizational prerequisites — data systems, skills development, governance structures — that many firms, particularly smaller ones, have not yet built."
    ]
  },
  {
    id: 110, date: "2024-02-19", added: "2026-04-30",
    title: "Algorithmic Management Practices in Regular Workplaces: Case Studies in Logistics and Healthcare",
    source: "Uma Rani, Annarosa Pesole, Ignacio Gonzalez Vazquez — International Labour Organization",
    sourceUrl: "https://www.ilo.org/publications/algorithmic-management-practices-regular-workplaces-case-studies-logistics",
    category: "workers", geography: "intl",
    keyFinding: "Cross-country case studies in logistics and healthcare across Italy, France, India, and South Africa document that algorithmic management delivers efficiency gains for employers while consistently degrading job quality and intensifying worker surveillance.",
    takeaways: [
      "Algorithmic management follows consistent patterns across all four countries regardless of regulatory context: streamlined workflows for employers, intensified monitoring, reduced worker autonomy, and greater exposure to algorithmic evaluation workers cannot contest.",
      "Job quality deterioration is a consistent finding across developed and developing economies alike, manifesting in increased performance pressure, reduced discretion over work pace and methods, and algorithmic accountability with no recourse mechanism.",
      "The cross-regional evidence challenges the assumption that strong labor law in advanced economies protects workers from algorithmic management harms: documented negative effects appear in France and Italy despite robust labor regulation frameworks."
    ]
  },
  {
    id: 113, date: "2026-03-30", added: "2026-05-04",
    title: "Beyond 'US Innovates, Europe Regulates': Lessons and Recommendations from a Transatlantic AI Exchange",
    source: "Julia Tréhu, Adrienne Goldstein — German Marshall Fund of the United States",
    sourceUrl: "https://www.gmfus.org/news/beyond-us-innovates-europe-regulates",
    category: "policy", geography: "intl",
    keyFinding: "Despite diverging transatlantic AI governance approaches, shared concerns around children's safety and unacceptable AI uses offer concrete grounds for US-EU cooperation that transcends the reductive 'US innovates, Europe regulates' framing.",
    takeaways: [
      "Children's safety and 'AI redlines' — unacceptable uses such as social scoring — are the clearest convergence points for US-EU cooperation, suggesting a targeted bilateral dialogue would yield more than broad harmonization efforts.",
      "Structural barriers to AI competitiveness span the entire value chain — financing, energy costs, talent retention, compute access — and extend well beyond regulatory frameworks, requiring industrial policy and procurement strategies alongside governance reform.",
      "Legislatures lack institutional capacity to address AI's cross-sectoral impacts, requiring dedicated technical civil service, rotating academic and industry experts, and sustained peer education across policy domains."
    ]
  },
  {
    id: 114, date: "2026-04-15", added: "2026-05-04",
    title: "Copy, Paste, Govern: Microsoft Ghostwrote EU Policy That Keeps Data Centres' Energy Use Secret",
    source: "Corporate Europe Observatory and AlgorithmWatch",
    sourceUrl: "https://corporateeurope.org/en/2026/04/copy-paste-govern",
    category: "corporate", geography: "intl",
    keyFinding: "Microsoft's lobbying language was directly incorporated into EU regulatory text, classifying nearly all data centre energy and water consumption data as confidential trade secrets and contradicting the Energy Efficiency Directive's original transparency mandate.",
    takeaways: [
      "The EU Commission 'essentially plagiarised' Microsoft and DigitalEurope amendments into a Delegated Act, establishing a documented precedent of Big Tech lobby text being incorporated verbatim into binding regulatory instruments.",
      "The resulting rules classify individual data centre energy and water use as proprietary trade secrets, making it structurally impossible for regulators, journalists, or the public to hold facilities accountable for their environmental footprint.",
      "Data centre expansion faces $156 billion in blocked or stalled projects in the US alone during 2025, making opacity in EU energy disclosure rules particularly valuable for corporations seeking to limit accountability as resistance grows globally."
    ]
  },
  {
    id: 115, date: "2025-05-29", added: "2026-05-04",
    title: "The Innovation Framework: A Civil Rights Approach to AI",
    source: "The Leadership Conference on Civil and Human Rights",
    sourceUrl: "https://civilrights.org/wp-content/uploads/2025/05/The-Innovation-Framework.pdf",
    category: "policy", geography: "us",
    keyFinding: "A structured framework of four foundational values and ten lifecycle pillars provides AI developers and deployers with actionable civil rights standards to ensure fair, trustworthy, and safe AI systems, with particular attention to communities historically pushed to the margins.",
    takeaways: [
      "The framework's dual structure separates long-term strategic values from operational lifecycle pillars aligned to the AI development and deployment pipeline, enabling implementation at both governance and product levels.",
      "Developed with input from industry developers and deployers alongside civil society and academic experts, the framework is positioned as a proactive standard rather than a reactive compliance checklist.",
      "The framework explicitly requires developers to assess how AI systems will impact marginalized communities throughout development, not as a post-launch audit, but as an embedded design requirement."
    ]
  },
  {
    id: 116, date: "2023-04-25", added: "2026-05-04",
    title: "The Promises and Perils of Residential Proptech: Year 1 Summary Report",
    source: "TechEquity Collaborative",
    sourceUrl: "https://techequity.us/wp-content/uploads/2023/04/TBHI-Y1-Research-Summary-Report.pdf",
    category: "community", geography: "us",
    keyFinding: "Venture-backed property technology companies' growth-at-all-costs model is accelerating racial and economic inequality in housing through opaque screening algorithms, corporate consolidation of the rental market, and predatory alternative homeownership products.",
    takeaways: [
      "Tenant screening algorithms are 'opaque, predictive, and frequently based on inaccurate data,' creating hidden barriers to rental housing that applicants cannot contest or understand.",
      "Digital tools enable institutional investors to amass and manage massive single-family home portfolios, prioritizing investor returns over tenant welfare and long-term housing affordability.",
      "Alternative homeownership paths marketed through PropTech — including rent-to-own and land contracts — echo discriminatory and predatory practices of the past, perpetuating historical inequities through modern technological infrastructure."
    ]
  },
  {
    id: 117, date: "2023-04-01", added: "2026-05-04",
    title: "The Scarlet Letter 'E': How Tenancy Screening Policies Exacerbate Housing Inequity for Evicted Black Women",
    source: "Yvette N.A. Pappoe — Boston University Law Review",
    sourceUrl: "https://www.bu.edu/bulawreview/files/2023/04/PAPPOE.pdf",
    category: "equity", geography: "us",
    keyFinding: "Blanket tenant screening policies that disqualify applicants based on eviction records disparately impact Black women in violation of the Fair Housing Act, requiring both landlords and screening companies to be held liable under disparate impact doctrine.",
    takeaways: [
      "Eviction filings create a permanent 'Scarlet Letter E' that follows tenants indefinitely through screening systems, foreclosing future housing access regardless of subsequent financial recovery or case outcomes.",
      "Black women face compounded disadvantage: eviction records reflect gendered economic precarity while screening criteria encode racial disparities from the criminal justice system and credit markets.",
      "The paper proposes an interpretive framework extending Fair Housing Act liability to tenant screening companies as well as landlords, closing a structural accountability gap where third-party vendors escape direct legal exposure for discriminatory outputs."
    ]
  },
  {
    id: 118, date: "2022-02-01", added: "2026-05-04",
    title: "Locked Out: How Algorithmic Tenant Screening Exacerbates the Eviction Crisis in the United States",
    source: "Matthew Harold Leiwant — Georgetown Law Technology Review",
    sourceUrl: "https://georgetownlawtechreview.org/wp-content/uploads/2022/02/Leiwant_Locked-Out_Formatted.pdf",
    category: "community", geography: "us",
    keyFinding: "Algorithmic tenant screening systems compound housing instability by treating pandemic-era eviction filings as permanent disqualifying marks, locking financially recovered renters out of the housing market through automated discrimination.",
    takeaways: [
      "Over nine million American households faced rent delinquency during the pandemic, producing a wave of eviction filings that now function as permanent housing barriers regardless of whether tenants won their cases.",
      "Eviction court records are scraped by screening companies as soon as they are filed — before any adjudication — meaning even dismissed cases generate lasting housing disqualifications.",
      "Record-sealing legislation targeting pandemic-era filings is the most direct policy remedy, but most states lack provisions to seal records at the point of filing, where screening company data collection occurs."
    ]
  },
  {
    id: 119, date: "2024-07-16", added: "2026-05-04",
    title: "Record Costs: Collateral Consequences of Eviction Court Filings in Pennsylvania",
    source: "Alexa Eisenberg, Kate Brantley — University of Michigan Poverty Solutions",
    sourceUrl: "https://c9737800-326f-4c8f-9fd8-3f266717d0f2.filesusr.com/ugd/9d463d_6517025d2feb407f86473c5006da1484.pdf",
    category: "community", geography: "us",
    keyFinding: "Even tenants who win their eviction cases face severe, lasting consequences, 80% report restricted future housing access, and screening companies' real-time scraping of public court records means even dismissed filings follow renters indefinitely.",
    takeaways: [
      "Eight in ten participants reported their eviction filing limited future housing options; over half were explicitly denied by a prospective landlord because of their filing, even when the case was dismissed or won.",
      "Unsuccessful rental applications generated hundreds to thousands of dollars in excess costs per tenant — application fees, moving expenses, and emergency housing — compounding the economic harm of the original housing crisis.",
      "Record-sealing at the point of filing — not just after case resolution — is the only effective remedy, as screening companies scrape public court records before adjudication, making post-judgment sealing insufficient."
    ]
  },
  {
    id: 120, date: "2025-07-12", added: "2026-05-04",
    title: "The Discriminatory Impacts of AI-Powered Tenant Screening Programs",
    source: "Lauren Karpinski — Georgetown Journal on Poverty Law & Policy",
    sourceUrl: "https://www.law.georgetown.edu/poverty-journal/blog/the-discriminatory-impacts-of-ai-powered-tenant-screening-programs/",
    category: "equity", geography: "us",
    keyFinding: "AI-powered tenant screening perpetuates housing discrimination through data quality failures, structurally biased criteria, and landlord over-reliance on algorithmic scores, a triple accountability gap with no current regulatory remedy.",
    takeaways: [
      "Screening databases contain unsubstantiated information including false matches and outdated records that applicants cannot dispute or correct before denial, algorithmic speed forecloses the informal contestation that human decision-making occasionally allowed.",
      "Criminal record and credit score criteria are structurally skewed: arrest data reflects racial policing disparities, while credit scores encode historical economic discrimination rather than actual rental risk.",
      "Landlord over-reliance on screening scores — treating algorithmic outputs as authoritative rather than as one input — removes discretion from decision-making and can unconsciously shape future judgment even after discontinuing a particular system."
    ]
  },
  {
    id: 121, date: "2023-10-01", added: "2026-05-04",
    title: "A Home for Digital Equity: Algorithmic Redlining and Property Technology",
    source: "Nadiyah J. Humber — California Law Review",
    sourceUrl: "https://www.californialawreview.org/print/a-home-for-digital-equity",
    category: "equity", geography: "us",
    keyFinding: "Automated tenant screening tools perpetuate racial discrimination by inheriting bias from historical data, and the Fair Housing Act's underutilized segregative effect doctrine offers stronger legal remedies than disparate impact claims for challenging algorithmic housing discrimination.",
    takeaways: [
      "Tenant screening algorithms inherit discrimination from their training data — eviction records, credit histories, and criminal databases — which disproportionately reflect decades of racialized housing exclusion and structural inequality.",
      "Segregative effect theory provides stronger litigation advantages than disparate impact: it applies to individual decisions rather than requiring statistical proof across policies, requires narrower geographic statistics, and has greater appellate track record in housing discrimination cases.",
      "Algorithmic neutrality creates a dangerous accountability gap: landlords attribute denials to technology rather than human choice, eliminating appeal processes and denying tenants recourse despite demonstrably disparate outcomes."
    ]
  },
  {
    id: 122, date: "2022-06-10", added: "2026-05-04",
    title: "HUD Guidance: Criminal Background Screenings May Violate the Fair Housing Act",
    source: "U.S. Department of Housing and Urban Development",
    sourceUrl: "https://nlihc.org/resource/hud-memo-criminal-background-screenings-may-violate-fair-housing-act",
    category: "policy", geography: "us",
    keyFinding: "Blanket bans and overly broad criminal history screening policies risk violating the Fair Housing Act through discriminatory effects on Black and Latino individuals, requiring landlords to individualize screening by weighing the nature, severity, and recency of each offense.",
    takeaways: [
      "HUD outlined three Fair Housing Act violation pathways for criminal screening: discriminatory intent, discriminatory effects on protected classes, and failure to accommodate persons with disabilities, giving tenants multiple legal avenues to challenge categorical exclusions.",
      "Written individualized screening policies that assess each applicant's specific history are both the legally required and practically superior alternative to blanket conviction bans, which courts have increasingly found to constitute disparate impact discrimination.",
      "Because criminal justice system involvement disproportionately affects Black and Latino individuals due to documented enforcement disparities, blanket criminal history bans function as a proxy for race discrimination, regardless of facially neutral intent."
    ]
  },
  {
    id: 123, date: "2024-09-13", added: "2026-05-04",
    title: "The Legal Doctrine That Will Be Key to Preventing AI Discrimination",
    source: "Chiraag Bains — Brookings Institution",
    sourceUrl: "https://www.brookings.edu/articles/the-legal-doctrine-that-will-be-key-to-preventing-ai-discrimination/",
    category: "policy", geography: "us",
    keyFinding: "Congress should establish comprehensive disparate impact liability for AI systems because current legal protections are fragmented and inadequate, algorithmic discrimination operates without human intent, making outcome-based legal standards the only viable enforcement mechanism.",
    takeaways: [
      "Because algorithms lack human intent, proving discrimination requires examining outcomes rather than motivations, disparate impact doctrine is uniquely suited to AI accountability in ways that disparate treatment theory structurally cannot be.",
      "Documented AI discrimination is widespread: Amazon's resume screening filtered out women, and facial recognition tools fail on darker-skinned faces at rates 10–100 times higher than for white faces, neither failure involved explicit discriminatory intent.",
      "Existing disparate impact protections are fragmented across multiple federal statutes with inconsistent coverage, and courts have progressively narrowed them; unified AI-specific legislation with private rights of action is the necessary structural fix."
    ]
  },
  {
    id: 124, date: "2026-01-22", added: "2026-05-04",
    title: "When Machines Discriminate: The Critical Role of Disparate Impact in AI Accountability",
    source: "The Leadership Conference on Civil and Human Rights",
    sourceUrl: "https://civilrights.org/wp-content/uploads/2026/01/SNAPSHOT-When-Machines-Discriminate_The-Critical-Role-of-Disparate-Impact-in-AI-Accountability.pdf",
    category: "policy", geography: "us",
    keyFinding: "Disparate impact doctrine is the essential legal tool for addressing AI-driven discrimination because algorithmic systems produce discriminatory outcomes without discriminatory intent, weakening this doctrine would eliminate the primary accountability mechanism for automated decision-making across housing, credit, employment, and healthcare.",
    takeaways: [
      "Disparate impact doctrine surfaces and addresses sources of bias that disparate treatment doctrine cannot reach, because AI discrimination operates through statistical patterns rather than conscious choices, intent-based standards are structurally inadequate for algorithmic accountability.",
      "Efforts to roll back disparate impact protections — through executive action, judicial narrowing, or preemption legislation — would functionally immunize AI systems from civil rights enforcement across every domain where they are deployed.",
      "A unified federal AI-specific disparate impact framework with private rights of action would close the fragmentation gap left by sector-by-sector antidiscrimination statutes and provide consistent accountability regardless of deployment context."
    ]
  },
  {
    id: 125, date: "2019-05-22", added: "2026-05-05",
    title: "Algorithmic Bias Detection and Mitigation: Best Practices and Policies to Reduce Consumer Harms",
    source: "Turner Lee, Resnick & Barton — Brookings Institution",
    sourceUrl: "https://www.brookings.edu/articles/algorithmic-bias-detection-and-mitigation-best-practices-and-policies-to-reduce-consumer-harms/",
    category: "policy", geography: "us",
    keyFinding: "Algorithms governing critical decisions in hiring, lending, and criminal justice can replicate and amplify historical human biases affecting protected groups. The authors propose bias impact statements, diverse design teams, regular audits, and regulatory sandboxes as self-regulatory practices, alongside policy recommendations to update federal nondiscrimination law to explicitly cover algorithmic decision-making.",
    takeaways: [
      "Self-regulatory best practices — bias impact statements, diverse teams, algorithmic audits — are necessary but insufficient without legal requirements that create enforceable accountability for algorithmic discrimination.",
      "Existing nondiscrimination law was not designed for algorithmic decision-making; explicitly extending Title VII, ECOA, and Fair Housing Act coverage to automated systems is the most direct path to closing the accountability gap.",
      "Regulatory sandboxes and improved algorithmic literacy across federal agencies are enabling conditions for effective oversight, but are currently absent from most enforcement frameworks."
    ]
  },
  {
    id: 126, date: "2018-02-23", added: "2026-05-05",
    title: "Gender Shades: Intersectional Accuracy Disparities in Commercial Gender Classification",
    source: "Buolamwini & Gebru — MIT Media Lab",
    sourceUrl: "https://proceedings.mlr.press/v81/buolamwini18a.html",
    category: "equity", geography: "intl",
    keyFinding: "Commercial gender classification systems exhibited error rates up to 34.7% for darker-skinned women compared to 0.8% for lighter-skinned men, a 43x disparity. Benchmark datasets used to train and evaluate these systems were 79–86% lighter-skinned subjects, and accuracy gaps closed substantially when balanced datasets were used.",
    takeaways: [
      "Facial analysis accuracy gaps are not technical limitations, they are the direct result of unrepresentative training data. Systems perform worst for the demographic groups they are most likely to be deployed against.",
      "Intersectional testing is essential: auditing by gender or race alone masks the compounded disadvantage faced by darker-skinned women, who were the most misclassified group across all commercial systems tested.",
      "The Gender Shades methodology established intersectional demographic parity testing as the standard for AI bias audits, yet most commercial systems still lack independent demographic accuracy testing before deployment."
    ]
  },
  {
    id: 127, date: "2019-12-01", added: "2026-05-05",
    title: "Face Recognition Vendor Test (FRVT) Part 3: Demographic Effects",
    source: "Grother, Ngan & Hanaoka — National Institute of Standards and Technology",
    sourceUrl: "https://www.nist.gov/publications/face-recognition-vendor-test-part-3-demographic-effects",
    category: "criminal-justice", geography: "us",
    keyFinding: "False positive rate disparities — the error type that produces misidentification — are widespread across 189 facial recognition algorithms tested on 18.27 million images from U.S. government applications. Error rates are highest for Black women, Native American women, and East Asian individuals; disparities greatly exceed false negative differentials and persist even in high-quality images.",
    takeaways: [
      "False positive disparities in facial recognition are not outlier failures, they are a systemic feature confirmed across virtually all commercially deployed algorithms in government testing, including systems currently in use by law enforcement.",
      "The populations most subject to law enforcement contact face the highest misidentification rates: Black women and Native American women had the highest false positive rates across most tested algorithms.",
      "NIST testing established the empirical foundation for legislative action: the disparities are not hypothetical and cannot be attributed to image quality, they occur even under controlled, high-quality conditions across nearly all vendors."
    ]
  },
  {
    id: 128, date: "2024-02-14", added: "2026-05-05",
    title: "Artificial Intelligence Is Putting Innocent People at Risk of Being Incarcerated",
    source: "Sanford — Innocence Project",
    sourceUrl: "https://innocenceproject.org/news/artificial-intelligence-is-putting-innocent-people-at-risk-of-being-incarcerated/",
    category: "criminal-justice", geography: "us",
    keyFinding: "At least seven individuals have been wrongfully arrested based on facial recognition misidentification; six of the seven are Black. Facial recognition technology is now being introduced as direct evidence of guilt at trial — not just as an investigative lead — despite documented racial accuracy gaps and the absence of regulatory oversight.",
    takeaways: [
      "Facial recognition has moved from investigative tool to courtroom evidence without standards that reflect its documented racial accuracy disparities, mirroring the historical pattern of flawed forensic science being admitted at trial before its limitations were acknowledged.",
      "Six of seven documented wrongful facial recognition arrests involved Black individuals, consistent with NIST findings that Black women face the highest false positive rates among commercially deployed systems.",
      "The absence of mandatory pre-deployment accuracy audits by demographic subgroup means the evidence standard for facial recognition at trial exceeds the evidence standard for its development and validation."
    ]
  },
  {
    id: 129, date: "2021-08-25", added: "2026-05-05",
    title: "The Secret Bias Hidden in Mortgage-Approval Algorithms",
    source: "Martinez & Kirchner — The Markup",
    sourceUrl: "https://themarkup.org/denied/2021/08/25/the-secret-bias-hidden-in-mortgage-approval-algorithms",
    category: "equity", geography: "us",
    keyFinding: "Holding 17 financial factors constant, mortgage lenders were 40% more likely to deny Latino applicants and 50% more likely to deny Asian and Pacific Islander applicants. They were 70% more likely to deny Native American applicants and 80% more likely to deny Black applicants compared to similarly qualified white applicants. High-earning Black applicants with lower debt-to-income ratios were denied more often than white applicants with more debt.",
    takeaways: [
      "Algorithmic mortgage underwriting does not discriminate by intent but does by effect, a finding that directly supports disparate impact claims under the Fair Housing Act and Equal Credit Opportunity Act without requiring proof of discriminatory purpose.",
      "The 80% denial rate disparity for Black applicants persisted after controlling for income, debt, and other financial variables, demonstrating that the gap is produced by the algorithm's structure, not by applicant qualifications.",
      "This investigation provided the quantitative foundation for advocacy requiring bias auditing of automated valuation models and algorithmic underwriting tools as a condition of Fair Housing Act compliance."
    ]
  },
  {
    id: 130, date: "2024-05-24", added: "2026-05-05",
    title: "MBIAS: Mitigating Bias in Large Language Models While Retaining Context",
    source: "Raza, Raval & Chatrath — Vector Institute",
    sourceUrl: "https://arxiv.org/abs/2405.11290",
    category: "equity", geography: "intl",
    keyFinding: "Instruction fine-tuning Mistral-7B on curated paired datasets of biased and benign text reduces LLM bias and toxicity by more than 30% while preserving contextual accuracy. Demographic-specific testing showed reductions exceeding 90% across multiple groups in out-of-distribution scenarios.",
    takeaways: [
      "Technical bias mitigation is achievable without sacrificing model performance, but requires deliberate investment in curated training data and targeted fine-tuning, not post-hoc filtering or generic safety guardrails.",
      "A 30%+ reduction in measured bias demonstrates that current commercial LLM deployments are not at a technical ceiling on bias mitigation, the remaining gap reflects a choice about where to invest development resources.",
      "Out-of-distribution testing is essential for evaluating bias mitigation: models that appear debiased on standard benchmarks may still exhibit significant disparities when applied to novel demographic contexts."
    ]
  },
  {
    id: 131, date: "2022-01-27", added: "2026-05-05",
    title: "Aligning Language Models to Follow Instructions",
    source: "Ouyang et al. — OpenAI",
    sourceUrl: "https://openai.com/index/instruction-following/",
    category: "corporate", geography: "intl",
    keyFinding: "Applying reinforcement learning from human feedback (RLHF) produces a 1.3B parameter InstructGPT model preferred over the 175B GPT-3 in 85% of comparisons despite having 100x fewer parameters. Outputs are more aligned with user intent, less likely to produce harmful content, and less prone to fabrication, establishing RLHF as the foundational alignment technique for all subsequent commercial AI systems.",
    takeaways: [
      "Scale alone does not produce aligned AI behavior, RLHF-based instruction-following is the architectural foundation that makes current AI assistants commercially viable and is now standard across frontier models including ChatGPT, Claude, and Gemini.",
      "The same mechanism that makes AI assistants useful makes their behavior more legible and more trainable toward specific objectives, which has direct implications for how AI tools are shaped by the organizations that deploy and fine-tune them.",
      "InstructGPT's demonstration that alignment and capability can be jointly optimized shifted AI development toward human-feedback-based training as a default, a transition with ongoing implications for how AI systems interpret and prioritize instructions from different sources."
    ]
  },
  {
    id: 132, date: "2024-03-01", added: "2026-05-05",
    title: "Gender Bias in Large Language Models across Multiple Languages",
    source: "Zhao, Ding, Jia, Wang & Qian — arXiv",
    sourceUrl: "https://arxiv.org/abs/2403.00277",
    category: "equity", geography: "intl",
    keyFinding: "GPT series models exhibit significant gender biases across all languages tested, including non-English contexts substantially underrepresented in AI bias research. Bias manifests consistently across three measurement approaches: gendered word selection, pronoun attribution, and topic assignment in dialogue.",
    takeaways: [
      "LLM gender bias is not an English-language problem, it propagates across multilingual deployments, meaning institutions deploying AI tools in non-English-speaking contexts face the same structural bias risks documented in English-language research.",
      "Bias audits conducted only on English outputs produce systematically incomplete assessments: organizations deploying AI internationally need language-specific evaluation to capture the actual risk profile.",
      "The consistency of gender bias across three different measurement methods suggests the bias is embedded in the model's underlying representations, not a surface artifact of particular prompting approaches."
    ]
  },
  {
    id: 133, date: "2021-01-14", added: "2026-05-05",
    title: "Persistent Anti-Muslim Bias in Large Language Models",
    source: "Abid, Farooqi & Zou — arXiv",
    sourceUrl: "https://arxiv.org/abs/2101.05783",
    category: "equity", geography: "intl",
    keyFinding: "GPT-3 associates 'Muslim' with 'terrorist' in 23% of completions, substantially higher than for any other religious group. Positive prompt engineering reduces violent completions from 66% to 20%, but anti-Muslim stereotyping persists across all evaluation conditions and cannot be reliably eliminated through prompt modification alone.",
    takeaways: [
      "Religious bias in large language models is persistent and directional, not random noise. GPT-3's documented anti-Muslim stereotyping is a measurable harm risk that prompt modifications cannot reliably prevent.",
      "For institutions deploying AI tools in multicultural or community-facing contexts, this finding identifies a specific population at disproportionate risk from LLM-generated content, a risk that standard safety evaluations may not capture.",
      "The persistence of anti-Muslim bias after positive prompt interventions demonstrates that bias mitigation requires architectural or training-data changes, not surface-level prompting strategies."
    ]
  },
  {
    id: 134, date: "2024-02-06", added: "2026-05-05",
    title: "Measuring Implicit Bias in Explicitly Unbiased Large Language Models",
    source: "Bai, Wang, Sucholutsky & Griffiths — arXiv",
    sourceUrl: "https://arxiv.org/abs/2402.04105",
    category: "equity", geography: "intl",
    keyFinding: "Eight safety-aligned and commercially deployed language models exhibit pervasive stereotype biases across four demographic categories and 21 distinct stereotypes, biases not detected by standard bias benchmarks. Adapted psychological association testing and comparative decision-making methods reveal hidden prejudices that explicit evaluation frameworks systematically miss.",
    takeaways: [
      "Passing standard AI bias benchmarks does not mean a model is unbiased: aligned models harbor implicit stereotypes that emerge only under methods designed to detect them, making vendor bias certifications based on standard tests necessary but not sufficient.",
      "The gap between explicit benchmark performance and implicit bias — documented across eight models including frontier commercial systems — means institutions relying solely on vendor safety documentation face an unquantified residual bias risk in deployed systems.",
      "Psychological association methods adapted for LLM evaluation provide a more sensitive detection framework than existing AI bias benchmarks, suggesting the AI auditing field needs evaluation standards that go beyond current approaches."
    ]
  },
  {
    id: 136, date: "2026-05-01", added: "2026-05-08",
    highlight: { stat: "236", text: "first-person worker accounts document 12 distinct patterns through which artificial intelligence drives job loss across the labor pipeline.", themeId: "displacement" },
    title: "AI Commons: Worker Stories from the AI Economy",
    source: "AI Commons Project",
    sourceUrl: "https://www.aicommonsproject.org/stories",
    category: "labor", geography: "intl",
    keyFinding: "A living database of 236 first-person worker accounts documents 12 distinct patterns through which AI eliminates work, from direct replacement to structural market flooding. This reveals that displacement operates across the entire labor pipeline, not just at the point of individual job loss.",
    takeaways: [
      "The 12 documented patterns reveal AI displacement is far more varied than simple job replacement: Leapfrog (14 stories) removes humans from the pipeline without replacing them directly; No Vacancy (12 stories) eliminates entry-level roles before new workers can access them; Market Flooding (11 stories) makes human output economically unviable through volume, not quality.",
      "The Trojan Horse pattern (10 stories) — workers training the AI systems that later replace them — is among the most prevalent, with no current legal framework requiring disclosure, compensation, or consent when this occurs.",
      "The Left Behind pattern (7 stories) disproportionately documents workers over 40, whose AI adoption pace is being used to justify termination, raising age discrimination concerns that existing ADEA frameworks were not designed to address in algorithmic performance contexts.",
      "Full Displacement (25 stories) affects a wide range of knowledge workers — copywriters, UX writers, software engineers, social media managers — not just routine or manual roles, challenging the assumption that cognitive work is insulated from near-term displacement."
    ]
  },
  { id: 135, date: "2024-02-21", added: "2026-05-05",
    title: "What's in a Name? Auditing Large Language Models for Race and Gender Bias",
    source: "Salinas, Haim & Nyarko — arXiv",
    sourceUrl: "https://arxiv.org/abs/2402.14875",
    category: "hiring", geography: "intl",
    keyFinding: "GPT-4 and other major language models systematically provide less favorable advice when names commonly associated with racial minorities and women are used in prompts, across 42 different scenario types. Names associated with Black women receive the most unfavorable treatment. Numerical anchors in prompts can partially but not fully mitigate the disparity.",
    takeaways: [
      "Name-based racial and gender bias in LLMs has direct employment implications: AI tools used for resume screening, salary negotiation coaching, or career advice will produce systematically worse outcomes for people with minority-associated names regardless of identical underlying qualifications.",
      "The consistency of bias across 42 different scenario types suggests that name-based demographic discrimination is a general feature of how these models weight cues, not a domain-specific artifact.",
      "Partial mitigation through numerical anchors does not eliminate the disparity and may not be applicable in real-world contexts, meaning organizations deploying LLMs in evaluation or advisory roles face a bias risk that current prompt engineering cannot fully address."
    ]
  },
  { id: 219, date: "2025-01-01", added: "2026-06-08",
    title: "Myths about Generative AI, Productivity, and Job Displacement",
    source: "Luddite Lab / DAIR Institute",
    sourceUrl: "https://cdn.sanity.io/files/uvgbyd32/production/45f1b26939d3502b2189c3839cfd352703ff5283.pdf",
    category: "labor", geography: "us",
    evidence: "analysis",
    keyFinding: "This primer from Luddite Lab at the Distributed AI Research Institute systematically addresses the dominant myths about generative AI's productivity gains and job displacement, equipping labor organizers and worker advocates with tools to interrogate AI deployment narratives. The primer examines the empirical gaps between industry projections and documented worker experience, providing the analytical grounding needed to challenge employer claims about AI necessity and productivity gains in contract negotiations and policy debates.",
    takeaways: [
      "Industry productivity narratives around generative AI consistently outpace empirical evidence, claims of transformational productivity gains have not been validated at the occupational or firm level at the scale projected, and selectively citing best-case research obscures the uneven distribution of both gains and harms across workers.",
      "Job displacement from generative AI is not technologically determined: deployment choices, contractual terms, and regulatory frameworks shape whether AI substitutes or complements worker labor, framing displacement as inevitable forecloses the negotiating space that workers and unions actually have.",
      "Labor organizers and advocates need primer-level analytical tools to interrogate employer AI claims in bargaining contexts, this resource equips union members and worker advocates with frameworks to evaluate productivity and displacement arguments on their merits, not on employer or vendor assertions.",
      "The gap between AI hype cycles and documented labor market outcomes creates both a challenge and an opportunity for worker organizing: challenging exaggerated displacement claims is as strategically important as resisting actual deployment, since premature capitulation to AI inevitability narratives weakens bargaining positions before organizing begins."
    ]
  },
  { id: 220, date: "2024-06-01", added: "2026-06-08",
    title: "Ziff Davis Creators Guild: AI Contract Protections Case Study",
    source: "Luddite Lab / DAIR Institute",
    sourceUrl: "https://cdn.sanity.io/files/uvgbyd32/production/03b3d86701d9c7d0a484c59bd5b78389dae5cc5f.pdf",
    category: "workers", geography: "us",
    evidence: "analysis",
    keyFinding: "Documents how the Ziff Davis Creators Guild — 62 media workers within a 4,000-person corporate conglomerate — organized to win meaningful AI protections in their first successor collective bargaining agreement. The case study details the organizing strategy, the specific contract language won, and the lessons applicable to other media and digital content worker campaigns facing AI deployment without contractual protections.",
    takeaways: [
      "A small bargaining unit (62 workers) within a large conglomerate successfully won AI contract protections, demonstrating that AI governance provisions are achievable even without majority union density across a company, and that media workers can establish sector-leading precedents from positions of relative numerical weakness.",
      "The campaign provides replicable contract language and organizing strategy for other media and content worker unions facing AI deployment, the specific provisions won (consent requirements, transparency obligations, and protections against AI substitution for covered work) are directly transferable to comparable bargaining contexts.",
      "Employer AI deployment in media is accelerating in advance of any regulatory framework, workers without contract-specific AI protections face unlimited employer discretion over how and when AI replaces or supplements their labor, with no recourse under existing law.",
      "The NewsGuild of New York context demonstrates that craft-based unions in journalism and digital media have particular leverage points around AI: the quality, institutional knowledge, and creative judgment that media workers bring to their work creates organizing arguments grounded in employer self-interest, not only worker rights."
    ]
  },
  { id: 221, date: "2023-12-01", added: "2026-06-08",
    title: "New York Times Tech Guild: Largest Tech Worker Strike Case Study",
    source: "Luddite Lab / DAIR Institute",
    sourceUrl: "https://cdn.sanity.io/files/uvgbyd32/production/3e70d64f1d5e4eaba145ce3939c92c08aa9370af.pdf",
    category: "workers", geography: "us",
    evidence: "analysis",
    keyFinding: "Documents the New York Times Tech Guild's organizing campaign culminating in the largest tech worker strike in United States history. It details the strategy, demands, and outcomes of tech workers at a major media company asserting collective power over AI deployment, workplace surveillance, and editorial technology decisions.",
    takeaways: [
      "The NYT Tech Guild strike represents a watershed in tech worker organizing: tech employees at a major media institution demonstrated that collective action around AI and technology governance is achievable, a precedent with direct implications for the broader tech industry where union density remains below 5%.",
      "AI-related contract demands were central to the campaign, workers organized explicitly around how AI tools would be deployed in editorial and product contexts, establishing that AI governance is a collective bargaining issue, not only a management prerogative or a policy question.",
      "The tech worker context within a media organization created a distinctive organizing environment: workers had both technical knowledge of AI capabilities and editorial standing to assess their impacts, giving the union unusual credibility in framing AI deployment risks to the public and to management.",
      "The case study provides an organizing roadmap for tech workers at other companies facing AI deployment decisions, including how to build majority support, frame AI demands in terms of journalism quality and public trust, and sustain a credible strike threat without legacy union infrastructure."
    ]
  },
  { id: 222, date: "2024-01-01", added: "2026-06-08",
    title: "National Nurses United: Political Education Program on AI Case Study",
    source: "Luddite Lab / DAIR Institute",
    sourceUrl: "https://cdn.sanity.io/files/uvgbyd32/production/5b2c7e89a2238a38cbf8a94d7f303de348775ecb.pdf",
    category: "workers", geography: "us",
    evidence: "analysis",
    keyFinding: "Documents how National Nurses United built a sustained political education program on AI and emerging technology to create an informed and engaged membership base capable of identifying and resisting harmful AI deployment in clinical settings. The case study details the program's structure, content, and outcomes as a model for other unions seeking to build member capacity on AI governance before deployment decisions are made.",
    takeaways: [
      "Political education on AI must be sustained and consistent — not a one-time workshop — to build the member knowledge base needed to identify AI deployment risks in real time and negotiate informed contract language; NNU's approach of regularly sharing emerging issues with members created the organizational capacity that reactive responses cannot.",
      "Healthcare AI presents unique organizing challenges: AI in clinical settings is often framed as patient care improvement, requiring nurses to develop the analytical capacity to distinguish genuine care enhancements from surveillance, speed-up, and scope creep in ways that resonate with both patients and the public.",
      "A politically educated membership is a structural asset for AI governance: when workers understand the issues, they can identify harmful deployments, report them accurately, build public coalitions, and sustain organizing pressure over the multi-year cycles that major hospital contract negotiations require.",
      "The NNU model provides a replicable framework for other healthcare and professional sector unions, the program's design, content topics, delivery mechanisms, and member engagement strategies are transferable to nursing and allied health contexts where AI deployment is accelerating and union density provides organizing leverage."
    ]
  },
  { id: 223, date: "2024-01-01", added: "2026-06-08",
    title: "National Nurses United: Professional Practice Committees Case Study",
    source: "Luddite Lab / DAIR Institute",
    sourceUrl: "https://cdn.sanity.io/files/uvgbyd32/production/7c88723fbaf28433eff62ada17c629b0200d7462.pdf",
    category: "workers", geography: "us",
    evidence: "analysis",
    keyFinding: "Documents National Nurses United's campaign to win registered nurse-controlled professional practice committees in every collective bargaining agreement, creating formal worker governance structures that give nurses democratic oversight over technology deployment, care protocols, and staffing decisions in clinical settings. The case study details the committee model, bargaining strategy, and how these structures are being used to govern AI and clinical technology deployment.",
    takeaways: [
      "Worker-controlled governance committees embedded in collective bargaining agreements provide the most durable form of AI oversight: they cannot be unilaterally dissolved by management, they are legally enforceable, and they create ongoing accountability rather than one-time contract protections that may become obsolete as AI capabilities evolve.",
      "The registered nurse-controlled committee model establishes clinical workers — not managers, vendors, or administrators — as the authoritative voice on care protocols and technology deployment, directly challenging the framing that AI deployment decisions are technical questions outside the scope of collective bargaining.",
      "The NNU case demonstrates that worker governance structures for AI are achievable through collective bargaining without waiting for legislation, and that healthcare provides a uniquely compelling organizing argument because patient safety and worker authority are aligned interests that can build broad public and institutional support.",
      "Replicating this model requires sustained bargaining over multiple contract cycles and organizing capacity to hold the line as employers resist governance provisions, the case study provides the negotiating strategy, language, and counter-argument frameworks that other nursing and healthcare unions need to replicate NNU's approach in their own bargaining contexts."
    ]
  },
  { id: 224, date: "2025-01-01", added: "2026-06-08",
    title: "Luddite Lab Case Study Highlights: Common Insights Across Worker AI Campaigns",
    source: "Luddite Lab / DAIR Institute",
    sourceUrl: "https://cdn.sanity.io/files/uvgbyd32/production/24174957c8758c301a572b801bdf150f3024d8b1.pdf",
    category: "workers", geography: "us",
    evidence: "analysis",
    keyFinding: "Synthesizes cross-cutting insights from Luddite Lab's case studies of worker campaigns resisting AI deployment, identifying common patterns in organizing strategy, contract language, and the conditions under which workers have successfully won AI governance provisions. Provides a comparative analysis of tactics and outcomes across journalism, media, and healthcare sectors.",
    takeaways: [
      "Successful worker AI campaigns share a common structural feature: they establish AI governance as a collective bargaining issue before deployment, organizing before the technology is embedded gives workers maximum leverage; organizing after deployment is structurally harder and produces weaker protections.",
      "Political education and member capacity-building appear consistently in successful campaigns: workers who understand AI systems can identify deployment risks, develop credible demands, and sustain organizing pressure over multi-year cycles, informal knowledge is not a substitute for systematic member education.",
      "Contract language won across these campaigns — consent requirements, transparency obligations, nurse-controlled committees, AI use disclosures — provides a replicable toolkit that other unions can adapt without starting from scratch; the most effective language is sector-specific and tied to existing worker expertise.",
      "Worker AI organizing is expanding beyond legacy union industries: the combination of established union precedents in media and healthcare with rising organizing energy in tech creates conditions for a broader AI governance movement, the Luddite Lab case studies collectively document that worker power over AI is achievable, sector-specific, and accumulating across industries."
    ]
  }
];

const DISRUPTION_LEVELS = [
  { id:"baseline",         label:"Repair",       sublabel:"Fix what's already broken — act now, regardless of AI's trajectory",  color:"#70AD8F", textColor:"#fff",
    blurb:"These policies address longstanding gaps in the current system that AI disruption will intensify — they are necessary regardless of how the technology develops and should be enacted immediately.",
    desc:"Overdue reforms that close existing policy gaps. These are necessary regardless of AI's trajectory — they address failures in the current system that AI disruption only makes more urgent." },
  { id:"emerging",         label:"Expand",       sublabel:"Expand existing systems as the workforce begins to shift", color:"#EBC382", textColor:"#2a1e00",
    blurb:"As displacement becomes measurable, these policies extend and adapt existing protections to cover workers and situations the current system was not designed to handle.",
    desc:"As AI measurably displaces entry-level and routine cognitive work, these policies extend existing protections and build adaptive capacity before the displacement curve steepens." },
  { id:"elevated",         label:"Build",         sublabel:"Create new institutions as gaps emerge that markets can't fill", color:"#FF8361", textColor:"#fff",
    blurb:"When market mechanisms begin to fail at absorbing disruption, these policies create new redistributive institutions and transitional infrastructure that do not yet exist.",
    desc:"When AI-driven income divergence becomes statistically significant and job creation begins to lag, these policies build new redistributive and transitional infrastructure." },
  { id:"high",             label:"Restructure",   sublabel:"Change the fundamental terms of how employment works",  color:"#C0392B", textColor:"#fff",
    blurb:"When employment itself begins to fracture as a social institution, these policies change the fundamental terms of how work is organised, compensated, and supported — not just who it covers.",
    desc:"When structural unemployment requires new social contract mechanisms, these policies fundamentally restructure how work is organised, compensated, and supported." },
  { id:"transformational", label:"Transform",     sublabel:"Decouple economic security from employment entirely",        color:"#472B51", textColor:"#fff",
    blurb:"When employment can no longer reliably distribute economic output, these policies bypass the employment relationship entirely to deliver income, wealth, and security directly to individuals.",
    desc:"When traditional employment can no longer distribute economic output broadly, these policies bypass the employment relationship to deliver income, wealth, and security directly." },
];

const POLICY_CATEGORIES = {
  "safety-net":    "Safety Net & Income Support",
  "labor-rights":  "Labor Rights & Worker Protections",
  "tax-wealth":    "Tax & Wealth Distribution",
  "healthcare":    "Healthcare & Benefits",
  "work-structure":"Work Structure",
  "education":     "Education & Reskilling",
  "antitrust":     "Antitrust & Markets",
  "housing":       "Housing & Community",
  "jobs":          "Jobs & Employment Programs",
  "international": "International Coordination",
};

// Merged categories for the flipped matrix (4 columns)
const MERGED_POLICY_CATEGORIES = {
  "economic-security":    "Economic Security",
  "labor-worker-rights":  "Labor & Worker Rights",
  "social-infrastructure":"Social Infrastructure",
  "skills-global":        "Global",
};
const MERGED_CAT_DESCS = {
  "economic-security":    "Income floors, safety nets, tax redistribution, and job programs",
  "labor-worker-rights":  "Worker protections, transparency mandates, and market rules",
  "social-infrastructure":"Healthcare, housing, portable benefits, and reskilling with wraparound support",
  "skills-global":        "Cross-border coordination and international policy frameworks",
};
const CATEGORY_MERGE_MAP = {
  "safety-net":    "economic-security",
  "tax-wealth":    "economic-security",
  "jobs":          "economic-security",
  "labor-rights":  "labor-worker-rights",
  "work-structure":"labor-worker-rights",
  "antitrust":     "labor-worker-rights",
  "healthcare":    "social-infrastructure",
  "housing":       "social-infrastructure",
  "education":     "social-infrastructure",
  "international": "skills-global",
};

const POLICY_DATA = [{ id:"ui-reform", level:"baseline", category:"safety-net",
    title:"Unemployment Insurance Reform",
    summary:"Extend unemployment insurance eligibility to gig and contract workers, lengthen benefit duration, modernize the payroll-tax contribution base, and index benefit levels to regional cost of living.<br><br>Implementation would include a federal floor requiring states to cover workers regardless of employment classification, maximum benefit duration extended to 52 weeks, and a wage-replacement formula that accounts for healthcare costs and geographic variation in living expenses. Most state programs still run legacy COBOL-era mainframes, many built in the 1970s and 1980s; administrative modernization is a prerequisite for effective delivery.",
    rationale:"The current unemployment insurance system was designed for stable, employer-employee relationships and covers less than 30% of unemployed workers in most states. AI-driven job transitions will accelerate churn; without unemployment insurance reform, no coherent response to displacement can follow.<br><br>Gig workers, part-time workers, and independent contractors are systematically excluded from coverage despite being the fastest-growing employment categories. As AI reshapes job categories and extends transitions between employment statuses, an unreformed unemployment insurance system will fail more workers each year.",
    precedent:"Canada's Employment Insurance covers a broader range of work arrangements. Pandemic Unemployment Assistance (2020) demonstrated that coverage can be extended rapidly when political will exists. Several U.S. states have enacted independent expansions.<br><br>Washington State's expanded unemployment insurance coverage for gig workers offers a partial model; Massachusetts and New Jersey have enacted coverage extensions. The Pandemic Unemployment Assistance program showed that universal coverage is administratively achievable within weeks. The barriers are political, not logistical.",
    feasibility:"Federal reform requires Congress to act. States administer benefits and would align to a new federal floor. The Pandemic Unemployment Assistance program in 2020 showed that coverage extensions can be deployed within weeks when political will exists. Most state systems run legacy computing infrastructure, so even fully funded reform takes years to roll out.",
    strengths:["Closes a documented coverage gap. The current system reaches fewer than three in ten unemployed workers in most states.","The Pandemic Unemployment Assistance program in 2020 demonstrated rapid scaling of new coverage classes.","Several states have already extended coverage to gig workers, providing administrative templates federal reform can adopt.","Indexed benefits track cost of living automatically, removing the lag that erodes purchasing power between updates."],
    risks:["A higher payroll-tax base may draw employer opposition, particularly in low-wage sectors.","Federal preemption of state benefit formulas raises political resistance from states that already maintain stronger programs.","Extending coverage to gig workers requires re-defining employment classification, a fight that has fractured legislatively in multiple states.","Administrative modernization is expensive and slow. Benefits delivery can lag policy enactment by years."],
    landscape:"Modernization has consistent bipartisan support in principle. The political fault line runs through coverage scope for gig workers and the financing base. New Jersey's S.1840 {{cite:148}} reflects growing state-level willingness to use the unemployment system as the displacement-response vehicle. State-level momentum is strongest in New Jersey, Washington, and Massachusetts.",
    press:[],
    paperIds: [148], pairsWith:[{id:"wage-insurance",why:"Both cushion lost earnings in a transition; wage insurance extends unemployment insurance from an income backstop to a re-employment top-up."},{id:"portable-benefits",why:"A functional unemployment-insurance baseline is a precondition for portable benefits, which lean on the same administrative plumbing."}], competesWith:[], lastReviewed:"2026-06-23" },
  { id:"algorithmic-transparency", level:"baseline", category:"labor-rights",
    title:"Algorithmic Transparency Mandates",
    summary:"Require employers to notify workers when AI is used in hiring, performance, scheduling, or termination decisions; establish a legal right to human review of AI-generated determinations.<br><br>Covered systems would include resume screeners, interview assessment tools, shift-scheduling algorithms, productivity monitoring systems, and AI-generated performance reviews. Employers would be required to maintain documentation on system design and training data, and workers would have 30 days to request human reconsideration of any AI-generated adverse employment action.",
    rationale:"Workers have no right to know when they are evaluated or terminated by an algorithm. This is a due process gap that exists independent of AI's displacement effects. Equal Employment Opportunity Commission guidance {{cite:101}} and NYC Local Law 144 establish precedent, but federal coverage is absent.<br><br>More than 90 percent of surveyed employers use recruitment management or applicant tracking software to make the first cut of candidates {{citep:247}}. Without transparency requirements, workers cannot contest decisions they don't know were made by algorithms, and employers face no accountability for systems with measurable disparate impact. Disclosure mandates create the audit trail enforcement requires.",
    precedent:"NYC Local Law 144 (enacted 2021, enforcement effective July 5, 2023) requires annual bias audits for automated employment decision tools. Colorado's AI Act (2024) established disclosure requirements. The EU AI Act creates binding obligations for high-risk AI in employment contexts. New Jersey's S.1840 (introduced January 2026, pending in the Senate Labor Committee) would create mandatory disclosure requirements for AI-driven layoffs by employers with 100+ employees, alongside governance requirements for high-risk AI systems. It is the most comprehensive state-level worker-facing AI transparency framework introduced in the U.S.<br><br>The AI-Related Job Impacts Clarity Act (S.3108, introduced by Sen. Hawley with Sen. Warner co-sponsoring, 119th Congress) extends the disclosure logic to workforce impacts, requiring covered entities to report AI-related job changes quarterly to the Department of Labor. Illinois's Automated Employment Decision Tool Act (2020) required notification and consent for AI video interview analysis. Maryland prohibits AI facial recognition in hiring interviews without consent. The rollback of Biden-era Department of Labor and Equal Employment Opportunity Commission AI guidance under Executive Order 14179 (January 2025) has made state-level transparency mandates the primary worker protection layer.",
    feasibility:"Federal mandates would require new legislation. States and cities have established viable templates: New York City's Local Law 144 (in force since 2023) is the most-tested model, and Colorado's 2024 Artificial Intelligence Act and New Jersey's S.1840 extend the framework {{cite:148}}. Administrative architecture exists through state attorneys general and the federal Equal Employment Opportunity Commission. Enforcement capacity is the binding constraint, not legal authority.",
    strengths:["Closes a due-process gap that exists independent of artificial intelligence's displacement effects. Workers cannot contest decisions they do not know were made by an algorithm.","Title VII, the Americans with Disabilities Act, and the Age Discrimination in Employment Act already cover artificial-intelligence-driven employment decisions {{cite:101}}. Disclosure mandates create the audit trail enforcement requires.","New York City's Local Law 144 and the European Union's Artificial Intelligence Act provide administratively-tested templates.","State-level frameworks like New Jersey's S.1840 {{cite:148}} have advanced furthest, with disclosure provisions covering layoff decisions and governance requirements."],
    risks:["Compliance complexity may push smaller employers to abandon artificial intelligence tools entirely, potentially benefiting larger firms.","Industry-defined audits may institutionalize weak compliance without addressing disparate impact at the underlying model level.","Without remedy mechanisms, disclosure alone produces transparency without accountability.","A patchwork of state laws raises compliance costs and creates incentives for forum-shopping by vendors."],
    landscape:"State-level activity is strong: New Jersey S.1840 {{cite:148}}, Colorado's Artificial Intelligence Act, Illinois's House Bill 3773. Industry groups support voluntary frameworks; civil rights coalitions and the Leadership Conference on Civil and Human Rights support broader mandates {{cite:124}}. Federal-level rescission of prior agency guidance under Executive Order 14179 has made state-level transparency mandates the primary worker-protection layer.",
    press:[],
    paperIds: [101, 247, 148, 124], pairsWith:[{id:"worker-data-rights",why:"Both set an algorithmic-accountability floor; disclosure of automated decisions is hard to exercise without rights over the underlying data."},{id:"ai-audit-mandate",why:"Transparency surfaces automated decisions and the audit mandate tests them, pairing disclosure with verification."}], competesWith:[], lastReviewed:"2026-06-23"   },
  { id:"eitc-expansion", level:"baseline", category:"safety-net",
    title:"Earned Income Tax Credit Expansion",
    summary:"Expand the Earned Income Tax Credit to increase benefit levels, extend coverage to childless adults, and redesign phase-out cliffs to accommodate workers with non-traditional income patterns.<br><br>The expansion would raise the maximum credit for childless workers from approximately $600 to $2,000, and lower the eligibility age from 25 to 19. It would also smooth the benefit phase-out so that workers with variable or platform-based income don't face sharp marginal tax rates that penalize earnings growth. An optional monthly payment, similar to the advance CTC, would convert the Earned Income Tax Credit from an annual tax event into a monthly income stabilizer.",
    rationale:"The Earned Income Tax Credit is the most effective existing income support tool for working families, but its current design penalizes irregular income, exactly the pattern AI-driven transition will produce. Expansion provides income floor infrastructure that can be scaled as disruption intensifies.<br><br>The core design flaw: the Earned Income Tax Credit rewards wage employment more than self-employment or contract work, penalizing the labor market transitions AI disruption creates. Workers cycling between gig work, part-time employment, and periods of retraining face unpredictable benefit amounts and phase-out penalties that reduce the safety net when transitions are most expensive.",
    precedent:"The American Rescue Plan's temporary Earned Income Tax Credit expansion for childless adults (2021) reduced poverty measurably. Multiple states have enacted their own Earned Income Tax Credit enhancements, and bipartisan political support makes this among the most actionable short-term policies.<br><br>California, Colorado, New York, and 30 other states maintain state Earned Income Tax Credit programs that supplement the federal credit. Congressional Budget Office analysis of expansion proposals consistently shows strong poverty reduction per dollar of federal expenditure. The Internal Revenue Service's recent efforts to reduce improper payment rates have strengthened the administrative foundation for a more ambitious expansion.",
    feasibility:"Operationally feasible: the Internal Revenue Service already runs the Earned Income Tax Credit, and the 2021 advance Child Tax Credit demonstrated monthly disbursement of refundable credits at scale. The 2021 expansion for childless adults lapsed at year-end, but the legislative architecture remains in place. Permanent expansion requires Congressional action.",
    strengths:["Strong evidence base among income-support programs. Decades of Congressional Budget Office and academic analysis confirm substantial poverty reduction per dollar spent.","Bipartisan support: Republicans (work-conditional design) and Democrats (anti-poverty effect) have both championed expansions.","More than 30 states maintain their own Earned Income Tax Credits, providing state-level templates and political constituencies.","Monthly disbursement converts an annual cliff event into a stabilizing income floor."],
    risks:["Work conditionality excludes the unemployed, caregivers, and people unable to work, who are often most affected by artificial-intelligence-driven displacement.","Phase-out cliffs penalize earnings growth and create marginal tax-rate spikes. Smoothing the curve has been politically difficult.","Fraud and improper-payment narratives have repeatedly stalled expansions. Internal Revenue Service administrative capacity is contested.","The childless-adult component is the most politically vulnerable piece of the proposal."],
    landscape:"Consistent bipartisan support for the core program. Recent expansions, including the childless-adult tier and monthly payments, have come from Democratic proposals. Several Republican-sponsored bills have included Earned Income Tax Credit features. The temporary 2021 expansion saw bipartisan goodwill that collapsed at the renewal vote.",
    press:[],
    pairsWith:[{id:"universal-child-benefit",why:"Two stackable refundable-credit supports; expanding one strengthens the delivery case for the other."}], competesWith:[{id:"guaranteed-income",why:"Work-conditioned versus unconditional cash, competing philosophies of income support for a similar constituency."}], lastReviewed:"2026-06-23"   },
  { id:"worker-data-rights", level:"baseline", category:"labor-rights",
    title:"Worker Data Rights",
    summary:"Establish workers' legal right to access, contest, and limit algorithmic data collected about them in employment contexts, including productivity scores, biometric data, and AI-generated performance assessments.<br><br>Covered rights would include: the right to know what data is being collected and how it is used; the right to receive a plain-language explanation of any algorithmic decision affecting employment; the right to contest inaccurate data; and the right to opt out of biometric monitoring. Employers would be required to conduct and publish data impact assessments before deploying new monitoring or evaluation systems.",
    rationale:"Workers are subject to extensive algorithmic surveillance with no right to access, correct, or limit this data. This civil rights gap exists independent of disruption levels and compounds as AI management tools proliferate in warehouses, call centers, hospitals, and offices.<br><br>Employers hold detailed behavioral profiles on workers — keystroke logs, location data, communication monitoring, productivity metrics — with no reciprocal obligation to share or explain this data. Washington Center for Equitable Growth survey data {{cite:151}} finds 68% of U.S. workers report at least one form of electronic monitoring. Constant productivity monitoring is linked to tripled rates of unsafe work practices and doubled injury rates, harms workers often cannot contest because they don't know when AI is managing their work. Emotion AI systems claiming to detect worker emotional states from facial expressions, voice, and biometrics are entering workplaces without validated scientific foundations or notice requirements. As AI systems become more consequential in determining promotions, terminations, and scheduling, data rights become foundational employment rights.",
    precedent:"General Data Protection Regulation (EU) provides data subject rights applicable to workers. Illinois Biometric Information Privacy Act creates biometric data rights. Several U.S. worker privacy bills have been introduced; none have yet passed at the federal level.<br><br>The EU's Platform Work Directive (adopted October 2024, with member states having until December 2026 to transpose it into national law) established specific algorithmic transparency rights for platform workers. New York City's Automated Employment Decision Tool law requires employers to notify workers of AI use in hiring. General Data Protection Regulation implementation by U.S.-based multinationals operating in Europe demonstrates administrative feasibility at scale.",
    feasibility:"The General Data Protection Regulation has demonstrated administrative feasibility at scale for over five years across thousands of multinationals operating in Europe. Illinois's Biometric Information Privacy Act provides domestic precedent with a private right of action. Federal legislation would require Congressional action; state-by-state expansion is the more likely near-term path.",
    strengths:["Aligns with existing civil rights frameworks. Data access is the foundational mechanism for contesting discriminatory decisions.","The General Data Protection Regulation has demonstrated administrative feasibility for over five years across thousands of multinationals.","The Biometric Information Privacy Act's private right of action has driven measurable compliance improvements without state enforcement bottlenecks.","Worker support data documents the harm: 68 percent of United States workers report at least one form of electronic monitoring {{cite:151}}."],
    risks:["Compliance complexity for employers without dedicated privacy infrastructure, particularly small and mid-size firms.","Federal preemption fights with stronger state laws could weaken protections rather than strengthen them.","Worker access rights without enforcement capacity create a paper right. Class-action mechanisms or agency enforcement are required.","Emotion-detection systems claiming to infer worker mood from facial expressions are spreading faster than worker-data law can adapt."],
    landscape:"The General Data Protection Regulation sets the international floor. The European Union's Platform Work Directive (adopted October 2024) extends specific algorithmic rights to gig workers, with member-state transposition due by late 2026. In the United States, the federal vehicle is the proposed American Privacy Rights Act and similar bills, with uncertain passage. State activity is strongest in California, Colorado, Connecticut, and Illinois.",
    press:[],
    paperIds: [151, 263, 264, 265], pairsWith:[{id:"algorithmic-transparency",why:"Both set an algorithmic-accountability floor; disclosure of automated decisions is hard to exercise without rights over the underlying data."},{id:"ai-audit-mandate",why:"Data rights give workers standing and audits give regulators the tool, two complementary accountability levers."}], competesWith:[], lastReviewed:"2026-06-23"   },
  { id:"min-wage-indexing", level:"baseline", category:"labor-rights",
    title:"Federal Minimum Wage Indexing",
    summary:"Index the federal minimum wage to median wage growth or inflation, ending the political cycle in which legislative increases lag economic conditions by years or decades.<br><br>The indexing mechanism would tie the minimum wage to the Employment Cost Index or to 50% of the median hourly wage, whichever is higher, with annual automatic adjustments beginning 18 months after enactment. Regional cost-of-living adjustments for high-cost metropolitan areas would allow the index to reflect actual living costs rather than a national average that masks wide geographic variation.",
    rationale:"The federal minimum wage has not been raised since 2009, the longest gap in U.S. history. If AI productivity gains concentrate among capital owners, a wage floor indexed to productivity ensures some pass-through to low-wage workers without requiring repeated legislative action.<br><br>Discretionary minimum wage legislation is a poor mechanism for maintaining wage floors: it requires political consensus in a polarized environment and typically lags inflation by 5–10 years. Automatic indexing removes this vulnerability. In a labor market shaped by AI productivity gains that are difficult to attribute to individual workers, an indexed floor ensures macroeconomic growth has some distributional consequence.",
    precedent:"Australia's Fair Work Commission adjusts the minimum wage annually. Canada's provinces use inflation indexing. Washington D.C. and California have implemented indexed increases at the state level.<br><br>Twenty U.S. states and D.C. have adopted automatic adjustment provisions for their state minimum wages, with roughly thirteen currently indexing and the rest phasing in. Economic research by Dube, Lester, and Reich has consistently found that indexed minimum wages reduce poverty without significant employment effects. Automatic adjustment is administratively straightforward; the binding constraint is political, not technical.",
    feasibility:"Administratively trivial. The Bureau of Labor Statistics already publishes the relevant indices (the Consumer Price Index monthly, the Employment Cost Index quarterly). Twenty states and the District of Columbia have adopted minimum-wage indexing, with roughly thirteen currently indexing. Federal action requires Congressional consensus, which has not materialized since 2007. The last federal minimum wage increase took effect in 2009.",
    strengths:["Removes the political bottleneck on wage-floor maintenance. Australia's Fair Work Commission and Canadian provinces have demonstrated this model for decades.","Indexed floors track productivity automatically, particularly relevant in an artificial-intelligence productivity boom that may otherwise concentrate gains in capital.","Research by Dube, Lester, and Reich consistently finds modest employment effects. The evidence base is strong.","Regional cost-of-living adjustments can address geographic variation that a single national floor cannot capture."],
    risks:["Indexed minimums can ratchet during recessions when employment effects may be larger.","Employer associations argue automatic increases compound during downturns. Small-business opposition is durable.","Industry-specific carveouts, including tipped wages and agricultural workers, remain contested and often persist after reform.","Federal preemption can block states from going higher unless the index is structured as a floor."],
    landscape:"Indexed minimums have precedent in 20 states and the District of Columbia. Congressional vehicles include the Raise the Wage Act series, led by Democrats. Republican opposition has been near-uniform at the federal level. Bipartisan agreement exists only in narrow state pilots.",
    press:[],
    pairsWith:[{id:"sectoral-bargaining",why:"Two levers on the same wage floor: a statutory minimum that tracks inflation, and negotiated sector-wide standards above it."}], competesWith:[], lastReviewed:"2026-06-23"   },
  { id:"ai-displacement-reporting", level:"baseline", category:"labor-rights",
    title:"Mandatory AI Job Impact Reporting",
    summary:"Require employers above a size threshold to report AI-related workforce changes — including layoffs, role eliminations, and significant task shifts — to the Department of Labor on a quarterly basis, creating the first systematic federal dataset on AI-driven labor market displacement.<br><br>Covered entities would submit quarterly reports within 30 days of each quarter's end, disclosing headcount changes attributable to AI deployment alongside the nature of the impacted roles. The Department of Labor would aggregate and publish sector-level data annually, enabling evidence-based calibration of displaced worker programs, wage insurance triggers, and retraining investments. Small employers (under 100 workers) would be exempt; phased implementation would begin with large employers before extending to mid-size firms.",
    rationale:"No systematic federal data exists on AI-driven workforce displacement. Policy responses — including displaced worker programs, wage insurance, and retraining accounts — are currently calibrated against projections and surveys rather than actual employer-reported impacts. Without a reporting floor, the gap between AI's documented deployment pace and the available evidence base will widen until displacement is already irreversible.<br><br>Employers can implement AI systems that eliminate thousands of positions with no obligation to disclose the scale, timing, or nature of those changes. This prevents both early-warning interventions and evidence-based scaling of support programs. If a firm is eliminating roles through AI deployment, that decision should be part of the public record, creating incentives for responsible deployment that are absent from the current environment.",
    precedent:"The AI-Related Job Impacts Clarity Act (S.3108, introduced by Sen. Hawley with Sen. Warner co-sponsoring, 119th Congress) establishes the congressional template, requiring covered entities to report AI-related job impacts to the Secretary of Labor quarterly. New Jersey's S.1840 (introduced January 2026, pending) would create a state-level disclosure requirement for AI-driven layoffs. Worker Adjustment and Retraining Notification (WARN) Act reporting requirements for large-scale layoffs provide the administrative precedent for employer-level workforce disclosures; AI reporting would extend this logic to AI-attributable changes below Worker Adjustment and Retraining Notification (WARN) Act thresholds.<br><br>EU AI Act requirements for high-risk AI in employment contexts include transparency obligations that create a partial international precedent. Bureau of Labor Statistics's existing workforce survey infrastructure provides the data collection architecture into which quarterly employer reports could be integrated without building new systems from scratch.",
    feasibility:"Mandatory reporting is administratively straightforward. Worker Adjustment and Retraining Notification Act infrastructure already supports large-employer workforce disclosures, and the Bureau of Labor Statistics has the data-collection architecture. The harder question is definitional: which workforce changes count as artificial-intelligence-related, and how is causation attributed?",
    strengths:["Addresses a documented evidence gap. No systematic federal data exists on artificial-intelligence-driven workforce displacement.","Bipartisan congressional interest has been demonstrated by Senate proposals on artificial-intelligence-related job impacts.","A reporting threshold of 100 or more employees keeps the burden off small employers while capturing the bulk of affected workers.","Creates the calibration data needed for downstream programs, including {{pol:wage-insurance|wage insurance}} triggers and retraining investments."],
    risks:["Definitional ambiguity around artificial-intelligence-related changes creates opportunities for employer underreporting.","Reporting without enforcement may institutionalize disclosure as a compliance ritual.","Causation attribution is hard. Many workforce changes reflect bundled drivers, including artificial intelligence plus offshoring plus restructuring.","Risks creating incentives to delay artificial intelligence deployment until reporting cycles pass."],
    landscape:"New Jersey's S.1840 {{cite:148}} includes a state-level reporting requirement for artificial-intelligence-driven layoffs. The Chamber of Commerce has opposed mandatory disclosure regimes; the American Federation of Labor-Congress of Industrial Organizations and economic-justice coalitions support them.",
    press:[],
    paperIds: [148], pairsWith:[{id:"reskilling-accounts",why:"Displacement reporting is the early-warning signal that should trigger the retraining accounts."},{id:"wage-insurance",why:"Reporting is the early-warning signal, and wage insurance is a remedy it should trigger."}], competesWith:[], lastReviewed:"2026-06-23" },
  /* ── Emerging ──────────────────────────────────────────────── */
  { id:"portable-benefits", level:"emerging", category:"healthcare",
    title:"Portable Benefits System",
    summary:"Decouple healthcare, retirement, and paid leave from employer relationships so that coverage travels with workers across jobs, clients, and employment classifications. Two distinct designs share the 'portable benefits' label, and the choice between them is the central policy question.<br><br>The <strong>individual-account model</strong> gives each worker a benefit account funded by pro-rata contributions from every client or employer, set per hour of work regardless of classification, with federal subsidies topping up lower earners. Workers draw on the account as needs arise. This is the design behind most current state pilots {{citep:258}} and the industry-backed federal bills {{citep:261}}.<br><br>The <strong>universal, social-insurance model</strong> instead extends pooled-risk public programs, including Social Security, unemployment insurance, and Medicare, plus multi-employer plans, to all workers regardless of classification. Coverage never depends on an individual account balance. Advocates argue that only pooled risk delivers adequate security, noting that pilot account contributions have averaged roughly $31 per month against multi-employer union contributions above 11 percent of pay {{citep:259}}. A federally maintained contribution registry can administer either design {{cite:257}}.",
    rationale:"AI adoption is accelerating short-tenure employment, contractor arrangements, and multi-employer work patterns. These are precisely the conditions under which employer-tied benefits become unavailable to displaced workers. Portability is the structural fix; individual coverage mandates are the fallback.<br><br>The employer-benefit link was a post-WWII accident of wage controls, and it has never fit 21st-century work patterns well. AI accelerates the mismatch: workers transiting between jobs, platforms, and employment classifications lose coverage when their economic vulnerability is highest. A portable system converts benefits from an employer retention tool into a universal social right, decoupled from any single employment relationship.",
    precedent:"Denmark's flexicurity model provides generous portable benefits paired with easy hiring and firing. New York's Black Car Fund provides portable benefits for ride-share drivers. Several state-level portable benefits pilot programs are underway {{cite:258}}.<br><br>Washington State's 2017 Portable Benefits Working Group produced implementation legislation that advanced furthest in a U.S. state. The Freelancers Union's portable benefits model has covered New York-based independent workers since 2001. The AFL-CIO and Service Employees International Union have proposed benefits-for-all frameworks that would extend portable benefits nationally through a federally maintained registry of employer contributions.",
    feasibility:"Administratively well-understood internationally, particularly under Denmark's flexicurity model. The challenge is United States specific: most benefits law is built around the employer-employee relationship. Federal action requires either reframing benefits as worker-attached rights, which is politically harder, or building a parallel system, which is administratively complex {{cite:257}}. Washington State's 2017 Portable Benefits Working Group produced the most advanced legislative architecture; state pilots are underway in New York and California {{citep:268}}.",
    strengths:["Decouples benefits from employment classification, removing the structural cliff at the W-2 versus 1099 boundary.","Denmark's flexicurity model has demonstrated the principle for decades alongside flexible labor markets.","Worker mobility benefits, including gig, contract, and multi-employer work, without forcing reclassification fights.","Existing United States precedents include New York's Black Car Fund and the Freelancers Union benefits program."],
    risks:["Without proper contribution rates, portable benefits can institutionalize lower benefit levels for non-W-2 workers {{citep:259}}.","Risks becoming a vehicle to legitimize misclassification {{citep:260}}.","Administrative complexity in tracking contributions from multiple employers or platforms.","Labor unions are divided. Some see portable benefits as a complement to organizing; others see a path that bypasses collective bargaining."],
    landscape:"Strong support from gig-platform companies, including Uber, DoorDash, and Instacart, who back individual-account portable benefits as preferable to reclassification {{citep:260}}. Labor unions are divided. Federal vehicles include proposals from Senator Bennet and the 2025 Cassidy and Scott bills {{citep:261}}. State activity is strongest in New York, California, and Washington. The central unresolved question is classification. Many advocates argue misclassified workers should be reclassified as employees and given full benefits {{citep:261}}, rather than receiving portable benefits that lock in 1099 status {{citep:260}}. The model choice tracks that divide: individual accounts are compatible with contractor status, while the social-insurance approach extends employee-style protection to everyone and overlaps with proposals to {{pol:delink-healthcare|delink healthcare from employment}}.",
    press:[],
    paperIds: [257, 258, 259, 260, 261, 268], pairsWith:[{id:"delink-healthcare",why:"Healthcare is the largest employer-tied benefit; de-linking it and building portable accounts for the rest are two halves of one decoupling agenda."},{id:"sectoral-bargaining",why:"Sectoral bargaining bodies are a natural administrator for pooled portable-benefit funds."},{id:"ui-reform",why:"A functional unemployment-insurance baseline is a precondition for portable benefits, which lean on the same administrative plumbing."}], competesWith:[], lastReviewed:"2026-06-23"   },
  { id:"reskilling-accounts", level:"emerging", category:"education",
    title:"Individual Learning Accounts with Wraparound Support",
    summary:"Federally funded personal training accounts ($10–15K per worker) with income replacement, childcare, transportation, and housing assistance to enable genuine skill transitions rather than credential accumulation without mobility.<br><br>Eligible workers would receive an account upon job displacement or proactive enrollment, usable for accredited training programs, community college, apprenticeships, or sector-specific certifications. Income replacement at 70% of prior wages during training periods, time-limited childcare subsidies, and transportation stipends are bundled into the account design. Participants in high-displacement sectors would receive enhanced account values and priority enrollment.",
    rationale:"Reskilling programs without wraparound support fail predictably, and the failure concentrates among workers with housing instability, caregiving responsibilities, or income volatility. Wraparound support is not an add-on; it is the program.<br><br>Programs that provide credentials without addressing participation barriers produce credential holders who cannot use them. Workers most affected by AI displacement are disproportionately women, workers of color, and workers with low incomes, who are also least able to absorb the income interruption that retraining requires. Effective design must treat participation barriers as program inputs, not individual failures.",
    precedent:"Singapore's SkillsFuture provides universal learning credits. Denmark's Adult Educational Allowance covers living costs during training. Trade Adjustment Assistance expired in 2022, eliminating the only federal income replacement mechanism for displaced workers.<br><br>New Jersey's Workforce Innovation and Opportunity Act guidance WD-PY25-14 {{cite:147}} demonstrates that existing Workforce Innovation and Opportunity Act administrative flexibility can be used to integrate AI skill development into funded programs without new legislation. NJ's S.1840 (introduced January 2026, pending) would create the AI Horizon Fund to finance enhanced retraining benefits, providing a state-level funding template. The GI Bill worked because veterans received living stipends, tuition coverage, and housing allowances simultaneously, not sequentially. Recent evaluations of U.S. community college completion programs confirm that emergency financial aid for non-tuition expenses significantly improves completion rates.",
    feasibility:"A federal vehicle would require new legislation. Existing Workforce Innovation and Opportunity Act infrastructure provides administrative architecture. New Jersey's workforce directive {{cite:147}} demonstrates that artificial-intelligence-specific training can be integrated into existing programs without new federal action. The harder constraint is wraparound services, including childcare, transportation, and income replacement, which require funding beyond current allotments.",
    strengths:["Singapore's SkillsFuture and Denmark's Adult Educational Allowance demonstrate scaled implementation.","Wraparound support directly addresses documented participation barriers. Housing instability and caregiving are the dominant reasons displaced workers fail to complete training {{cite:25}}.","Compatible with existing Workforce Innovation and Opportunity Act administrative infrastructure.","Bipartisan support for the underlying concept. Individual training accounts have appeared in Republican proposals."],
    risks:["Training-only programs without job-creation linkage produce credentialed workers without job openings {{cite:203}}.","Demand forecasting is genuinely difficult. Which skills retain value as artificial intelligence capability evolves is uncertain {{cite:203}}.","Voucher-style accounts can be exploited by low-quality training providers.","Income replacement at meaningful levels is expensive. Without it, lower-income workers cannot complete programs."],
    landscape:"Bipartisan support for the underlying concept. The political fight is over wraparound funding scale. New Jersey's WD-PY25-14 directive {{cite:147}} and S.1840 {{cite:148}} are the most concrete state-level frameworks. The evidence on retraining is mixed. Jacobs and Leibenluft argue that program design and program reach are separable problems, and that historic United States retraining programs have struggled with coverage rather than design.",
    press:[],
    paperIds: [147, 25, 74, 203, 201, 148], pairsWith:[{id:"automation-levy",why:"The levy funds the retraining that automation makes necessary, a tax paired with the transfer it enables."},{id:"ai-displacement-reporting",why:"Displacement reporting is the early-warning signal that should trigger the retraining accounts."},{id:"wage-insurance",why:"The classic transition bundle: retrain the worker and top up wages as they re-enter at lower pay."}], competesWith:[{id:"job-guarantee",why:"Retrain workers versus guarantee them a job, two answers to displacement drawing on the same budget line and attention."}], lastReviewed:"2026-06-23"   },
  { id:"ai-audit-mandate", level:"emerging", category:"antitrust",
    title:"Mandatory AI Bias Audits",
    summary:"Require third-party disparate impact audits for AI systems used in employment, credit, housing, and healthcare decisions; mandate public reporting by demographic subgroup; assign liability to deployers.<br><br>Audits would assess outcome disparities across race, gender, age, disability status, and national origin, and require remediation when disparities exceed established thresholds. Audit methodology would be standardized by a federal technical body, with certified third-party auditors responsible for independent assessment. Deployers — not just vendors — would bear legal liability, creating a strong incentive for due diligence before deployment.",
    rationale:"Research from Buolamwini and Gebru {{cite:126}}, National Institute of Standards and Technology {{cite:127}}, and The Markup {{cite:129}} shows that deployed AI systems exhibit systematic racial and gender disparities that are measurable and preventable, yet vendors are not required to test for them. Mandatory audits close the gap between what is technically feasible and what is legally required.<br><br>AI vendors are not responsible for discriminatory effects of systems they sell, and deployers have no obligation to test for them. This creates a market for systems with unexamined disparate impact. Mandatory audits with public reporting create accountability through transparency and enforcement through liability.",
    precedent:"NYC Local Law 144 (enacted 2021, enforcement effective July 5, 2023) requires annual bias audits for automated employment decision tools. The EU AI Act requires conformity assessments for high-risk systems. Equal Employment Opportunity Commission guidance {{cite:101}} establishes that Title VII applies to AI hiring tools.<br><br>The Consumer Financial Protection Bureau has applied adverse action notice requirements to algorithmic credit decisions {{cite:251}}. National Institute of Standards and Technology's AI Risk Management Framework {{cite:252}} provides a voluntary technical standard that could be codified into mandatory requirements. Illinois's Automated Employment Decision Tool Act and Maryland's facial recognition hiring ban demonstrate state-level feasibility. Comprehensive federal legislation would consolidate and strengthen the patchwork of existing requirements.",
    feasibility:"Administratively proven at municipal scale. New York City's Local Law 144 has been in force since 2023. Federal action requires legislation. The Equal Employment Opportunity Commission has asserted existing authority under Title VII for hiring tools driven by artificial intelligence {{cite:101}}. The National Institute of Standards and Technology's 2023 Artificial Intelligence Risk Management Framework {{cite:252}} provides a voluntary technical standard that could be codified.",
    strengths:["Evidence of disparate impact is strongest of any artificial intelligence policy area. Buolamwini and Gebru {{cite:126}}, the National Institute of Standards and Technology {{cite:127}}, and The Markup {{cite:129}} all document measurable harm.","Existing federal disparate-impact doctrine already applies to artificial-intelligence-driven hiring tools per 2021 Equal Employment Opportunity Commission guidance {{cite:101}}.","Concrete precedent: New York City's Local Law 144, Colorado's Artificial Intelligence Act, Illinois's Artificial Intelligence Video Interview Act.","The European Union's Artificial Intelligence Act creates parallel international compliance pressure on United States multinationals."],
    risks:["Self-funded audits create conflict of interest. An auditor certification regime is required.","Bias audit methodologies vary widely. Without standardized metrics, results are not comparable.","Public reporting alone, the main mechanism of New York City's Local Law 144, has not triggered measurable vendor-level changes.","Deployer liability may push compliance costs onto firms least equipped to evaluate vendor claims."],
    landscape:"Strong state-level activity, including New York City's Local Law 144, Colorado's Artificial Intelligence Act, Illinois's Artificial Intelligence Video Interview Act, and Maryland's facial recognition ban. Federal momentum has stalled, but legal authority has been asserted by the Equal Employment Opportunity Commission, the Consumer Financial Protection Bureau, and the Department of Housing and Urban Development {{cite:122}}. Industry groups support voluntary frameworks and oppose mandatory third-party audits.",
    press:[{label:"Gender Shades — Buolamwini & Gebru (MIT Media Lab)",url:"https://gendershades.org/"},{label:"National Institute of Standards and Technology Face Recognition Vendor Test",url:"https://pages.nist.gov/frvt/"}],
    paperIds: [126, 127, 129, 101, 251, 252, 122], pairsWith:[{id:"algorithmic-transparency",why:"Transparency surfaces automated decisions and the audit mandate tests them, pairing disclosure with verification."},{id:"worker-data-rights",why:"Data rights give workers standing and audits give regulators the tool, two complementary accountability levers."}], competesWith:[], lastReviewed:"2026-06-23" },
  { id:"wage-insurance", level:"emerging", category:"safety-net",
    title:"Wage Insurance",
    summary:"Provide transitional income support for workers who take lower-paying jobs after displacement, bridging a portion of the wage gap for two to three years to smooth AI-driven income shocks.<br><br>The program would cover 50% of the wage differential between a worker's prior earnings and their new position, up to a maximum benefit of $12,000 per year, for a period of two years. Workers would be eligible upon re-employment within six months of displacement, with benefit amounts calculated against their average prior-year earnings. The program would be co-financed by the federal government and employers in high-displacement sectors.",
    rationale:"Reemployment after AI-driven displacement often means accepting lower-wage work. Wage insurance reduces the income shock of downward transitions, lowers the risk cost of accepting available work, and reduces long-term scarring from prolonged unemployment.<br><br>The economic literature on displacement consistently shows that workers who accept available jobs quickly — even lower-paying ones — experience better long-term earnings trajectories than those who hold out for equivalent-paying positions. Wage insurance makes rapid reemployment financially viable by closing the gap that otherwise makes accepting lower-paying work economically irrational. The behavioral nudge and the income floor reinforce each other.",
    precedent:"Trade Adjustment Assistance expired in 2022 without renewal, leaving wage insurance without a federal program home. Canada's Earnings Supplement Experiment tested similar models. Wage insurance has received bipartisan policy support historically.<br><br>The Bipartisan Policy Center's {{cite:143}} 2025 analysis of displaced worker programs identifies the Trade Adjustment Assistance expiration as the most significant gap in the U.S. displaced worker safety net, with the wage insurance component among the most evidence-backed features to restore. The Brookings Institution and Hamilton Project have developed detailed implementation proposals. Hyman, Kovak, and Leive's {{cite:34}} NBER research finds wage insurance within Trade Adjustment Assistance increased short-run employment probability, raised long-run earnings by shortening non-employment spells, and may be financially self-sustaining through reduced benefit duration and increased tax revenue from faster re-employment.",
    feasibility:"Wage insurance ran inside Trade Adjustment Assistance until that program lapsed in 2022. The plumbing to administer it sits in state unemployment systems. Restoring or extending it requires Congressional reauthorization, not new infrastructure. The empirical case is settled by Hyman, Kovak, and Leive {{cite:34}}, who established short-run employment gains, raised long-run earnings, and a plausible path to fiscal self-sustainability.",
    strengths:["Strongest empirical evidence of any displacement intervention. The quasi-experimental evaluation by Hyman, Kovak, and Leive {{cite:34}} found increased short-run employment, raised long-run cumulative earnings, and a path to fiscal self-sustainability through faster re-employment.","Closes the wage gap that otherwise keeps displaced workers from accepting available jobs. Faster re-employment reduces the scarring effects of long unemployment spells.","Sits on existing state unemployment insurance infrastructure. Implementation is a configuration change, not a new program build.","Trade Adjustment Assistance had Republican and Democratic support during its operational years, giving the policy a bipartisan track record to rebuild from."],
    risks:["Subsidizes lower wages rather than enforcing wage floors. Some labor advocates view this as underwriting employer wage cuts.","Coverage under Trade Adjustment Assistance reached roughly 130,000 workers a year against millions affected by trade shocks. Reach has historically been the program's biggest weakness {{cite:201}}.","Requires reliable prior-wage records. Gig workers and people with irregular incomes are harder to enroll under the existing formula.","The program lapsed in 2022 without reauthorization, so any expansion starts from a cold institutional base {{cite:143}}."],
    landscape:"Trade Adjustment Assistance had supporters in both parties for most of its life but lapsed in 2022 without renewal. Restoration vehicles include the Trade Adjustment Assistance Reauthorization Act series. The Brookings Institution and the Hamilton Project have published detailed implementation proposals. On the evidence it is among the strongest cases in displacement policy: the Bipartisan Policy Center {{cite:143}} calls the 2022 Trade Adjustment Assistance lapse the largest single gap in the displaced-worker safety net, and Leibenluft {{cite:201}} finds the program worked for those it reached but reached far too few.",
    press:[{label:"Hyman, Kovak & Leive — Wage Insurance Within Trade Adjustment Assistance (NBER)",url:"https://www.nber.org/papers/w29298"}],
    paperIds: [143, 34, 201], pairsWith:[{id:"ui-reform",why:"Both cushion lost earnings in a transition; wage insurance extends unemployment insurance from an income backstop to a re-employment top-up."},{id:"reskilling-accounts",why:"The classic transition bundle: retrain the worker and top up wages as they re-enter at lower pay."},{id:"ai-displacement-reporting",why:"Reporting is the early-warning signal, and wage insurance is a remedy it should trigger."}], competesWith:[], lastReviewed:"2026-06-23"   },
  { id:"sectoral-bargaining", level:"emerging", category:"labor-rights",
    title:"Sectoral Wage Boards",
    summary:"Establish industry-level minimum standards for wages, benefits, and AI deployment conditions through sector-wide negotiation, extending worker protections to all workers in an industry regardless of employer-level union status.<br><br>Sector-level boards would be composed of employer, worker, and public representatives, with authority to set floor wages, benefit contributions, and AI deployment notice requirements for all firms in covered sectors. Covered sectors would be designated by the Department of Labor based on AI adoption rates, wage concentration, and union density, with fast food, logistics, warehousing, and healthcare prioritized in initial implementation.",
    rationale:"Enterprise-level collective bargaining covers less than 6% of private sector workers. Sectoral standards prevent a race-to-the-bottom in which individual employers can deploy AI while workers without union density have no equivalent protection.<br><br>AI deployment decisions are increasingly made at the industry level: large platforms and technology vendors sell systems across entire sectors simultaneously. A union at one logistics warehouse cannot negotiate conditions that apply across all warehouses. Sectoral bargaining operates at the same level as AI adoption itself, making it the appropriate institutional response.",
    precedent:"Australia's Modern Awards system sets sector-wide conditions. Germany's Tarifvertrag and France's branch-level agreements cover most workers regardless of firm-level union status. California's Fast Recovery Act proposals establish domestic precedent.<br><br>New York's Fast Food Wage Board established sectoral standards in 2015, raising wages for roughly 136,000 fast food workers statewide, demonstrating U.S. feasibility. California's Assembly Bill 257 (FAST Recovery Act) created an industry council for fast food with wage-setting authority. The International Labour Organization endorses sectoral bargaining as the preferred mechanism for labor standards governance. Countries with high collective bargaining coverage consistently show better wage floors and lower inequality than enterprise-bargaining systems.",
    feasibility:"Operationally complex but internationally proven. Australia's Modern Awards, Germany's Tarifvertrag, and France's branch-level agreements all demonstrate scale. United States federal implementation faces National Labor Relations Act structural barriers. State-level pilots, including California's Fast Recovery Act for fast food, provide a near-term path.",
    strengths:["Addresses the coverage gap of enterprise-level bargaining. Fewer than one in ten private-sector workers are covered by collective bargaining agreements, and tech-sector union density sits below 5%.","Operates at the right scale for artificial intelligence deployment decisions, which are made at the industry or platform level {{cite:110}}.","International precedent: countries with high sectoral coverage have lower inequality and better wage floors with comparable employment outcomes.","California's Fast Recovery Act, also known as Assembly Bill 257, demonstrates United States feasibility at the state level."],
    risks:["National Labor Relations Act preemption may block state-level implementation in private-sector industries.","Industry groups treat sectoral bargaining as a fundamental shift in labor law. Opposition is durable and well-funded.","Without enforcement infrastructure, sectoral standards can become a floor without teeth.","Smaller employers in covered sectors face disproportionate compliance costs."],
    landscape:"The strongest United States precedent is California's Fast Recovery Act for fast food. New York's Fast Food Wage Board (2015) established the principle for roughly 136,000 workers. Federal vehicles include various worker-voice proposals. Industry opposition is led by the National Restaurant Association and the Chamber of Commerce.",
    press:[],
    paperIds: [110, 266], pairsWith:[{id:"portable-benefits",why:"Sectoral bargaining bodies are a natural administrator for pooled portable-benefit funds."},{id:"min-wage-indexing",why:"Two levers on the same wage floor: a statutory minimum that tracks inflation, and negotiated sector-wide standards above it."}], competesWith:[], lastReviewed:"2026-06-23"   },
  /* ── Elevated ──────────────────────────────────────────────── */
  { id:"automation-levy", level:"elevated", category:"tax-wealth",
    title:"Automation Levy / Productivity Tax",
    summary:"Tax AI-driven productivity gains above a threshold to fund transition programs, with the rate scaling as measured displacement increases. Revenue directed to {{pol:reskilling-accounts|reskilling}}, {{pol:portable-benefits|portable benefits}}, and income support.<br><br>The levy would apply to productivity gains exceeding 2% annually in covered sectors, assessed against value-added per employee. The tax rate would scale from 0.5% to 3.5% depending on displacement metrics measured by the Bureau of Labor Statistics. Revenue would flow into a dedicated Automation Adjustment Fund, with mandatory pass-through to workforce transition programs and a prohibition on general fund absorption.",
    rationale:"When AI productivity growth exceeds what wage increases capture, an automation levy ensures gains are partially socialized rather than fully captured by capital. It also creates a price signal that makes automation marginally more expensive, modifying the incentive structure that drives displacement.<br><br>Automation generates productivity gains that are currently captured almost entirely as profits. A levy converts a portion of these gains into a social dividend for those displaced, funded by the mechanism that caused the displacement. The price signal effect is secondary but meaningful: higher automation costs slow deployment at the margin and give adaptive institutions time to form.",
    precedent:"Korea reduced tax incentives for automation equipment in 2017, functioning as an implicit levy. Bill Gates publicly proposed an automation tax. The EU and Organisation for Economic Co-operation and Development have studied implementation models, and robot taxation proposals have been introduced in several European parliaments.<br><br>The EU Parliament voted in 2017 on a motion to study robot taxation. European Commission research has modeled implementation through modifications to value-added tax or corporate income tax. The Organisation for Economic Co-operation and Development's Global Forum on Productivity has studied levies as a mechanism for funding transition infrastructure. No country has yet implemented a comprehensive automation levy, making this a policy frontier rather than an established model.",
    feasibility:"No country has implemented a comprehensive automation levy, making this a policy frontier. South Korea's 2017 reduction in automation tax incentives functioned as a partial precedent. The European Parliament voted in 2017 on a motion to study robot taxation. Definitional precision is the binding administrative constraint: how is artificial-intelligence productivity gain isolated from other capital investment?",
    strengths:["Creates a price signal that slows automation at the margin, providing time for adaptive institutions to form.","Revenue can be earmarked for transition programs such as {{pol:reskilling-accounts|reskilling}} and {{pol:portable-benefits|portable benefits}}, creating a direct displacement-to-mitigation link.","Bill Gates publicly endorsed the concept, demonstrating cross-spectrum legitimacy.","The European Union and the Organisation for Economic Co-operation and Development have modeled implementation through value-added tax or corporate income tax modifications."],
    risks:["Companies can pass costs to consumers, undermining the worker-protection rationale.","Definitional ambiguity creates gaming opportunities, including relabeling artificial intelligence investment as standard capital expenditure.","May discourage productivity-enhancing artificial intelligence deployment that would benefit workers, versus labor-replacing deployment.","Tax Foundation and Cato Institute have argued the levy is an innovation tax that disincentivizes adoption."],
    landscape:"South Korea's 2017 partial precedent. The European Parliament's 2017 study motion. Bill Gates's public endorsement. Federal vehicles in the United States are limited. Greg Casar's American Prospect op-ed (May 2026) is the most recent legislative-adjacent proposal. The Tax Foundation and the Cato Institute oppose; the Economic Security Project supports exploration. Casar's proposal reframes the levy as a sales tax on tokens and compute rather than a tax on profits, which sidesteps some definitional problems but raises the risk of pass-through to consumers.",
    press:[{label:"Casar — Tax AI to Create Jobs (American Prospect)",url:"https://prospect.org/2026/05/28/tax-ai-to-create-jobs/"}],
    pairsWith:[{id:"reskilling-accounts",why:"The levy funds the retraining that automation makes necessary, a tax paired with the transfer it enables."}], competesWith:[{id:"wealth-tax",why:"Both tax AI-driven capital gains, competing for the same tax base and legislative vehicle."},{id:"global-min-tax",why:"A domestic levy versus internationally coordinated taxation of the same AI profits."}], lastReviewed:"2026-06-23" },
  { id:"profit-sharing-mandate", level:"elevated", category:"labor-rights",
    title:"Mandatory Profit Sharing for AI Deployment",
    summary:"Require firms that deploy AI above a measurable productivity-impact threshold to share a portion of gains with workers, through Employee Stock Ownership Plan contributions, profit-sharing pools, or mandatory wage indexing.<br><br>Firms with 100 or more employees using AI systems that generate measurable productivity improvements would be required to distribute 10–15% of measured gains to workers, either as direct profit-sharing, equity contributions to worker ownership accounts, or wage increases tied to productivity benchmarks. The Department of Labor would develop measurement protocols in consultation with Bureau of Labor Statistics, with an appeals process for firms disputing productivity attribution.",
    rationale:"AI productivity gains currently flow almost entirely to shareholders and executives. A profit-sharing mandate lets workers capture a portion of the gains they helped generate, regardless of union status or bargaining power.<br><br>Corporate governance structures give workers no formal claim on productivity gains generated through AI systems they interact with, train, or are replaced by. The disconnect between productivity growth and compensation growth has widened dramatically since the 1970s, and AI is accelerating it. Mandatory profit sharing creates a statutory floor on workers' share of gains that complements but does not depend on collective bargaining.",
    precedent:"France requires \"participation\" (mandatory profit-sharing) for firms above 50 employees, a legally distinct scheme from \"intéressement,\" which is voluntary at all firm sizes. Denmark's labor-management agreements often include productivity sharing. Multiple U.S. tax incentives for Employee Stock Ownership Plans provide a framework for voluntary worker ownership expansion.<br><br>France's Participation Law (1967) created mandatory profit-sharing as a post-WWII social compact, now covering around 8 million workers. German co-determination law gives workers board representation in large firms, structurally embedding worker voice in productivity-gain allocation. The U.S. already has the legal infrastructure for voluntary profit-sharing and Employee Stock Ownership Plans; a mandate would extend coverage to the 90% of workers currently outside any such arrangement.",
    feasibility:"France's Participation Law provides over five decades of administrative precedent for mandatory profit-sharing, covering about eight million workers. The United States has Employee Stock Ownership Plan infrastructure and tax incentives for voluntary plans. Converting voluntary to mandatory requires Congressional action. Definitional questions around artificial-intelligence-driven productivity are the same as for {{pol:automation-levy|automation levies}}.",
    strengths:["France's Participation Law covers about eight million workers. The administrative model is proven at scale.","Creates a statutory floor on worker share that does not depend on collective bargaining power.","Pairs naturally with {{pol:worker-ownership|worker ownership expansion}} and other equity-distribution mechanisms.","Bipartisan support for Employee Stock Ownership Plans in United States tax code suggests political viability for some mandate variants."],
    risks:["Productivity attribution is hard. Separating artificial-intelligence-driven gains from other capital investment is contested.","Companies may restructure to keep profits below mandate thresholds.","Pure cash distribution does not transfer ownership control. Some labor advocates view this as a weaker version of structural reform.","Implementation costs disproportionately affect mid-size firms."],
    landscape:"France's Participation Law is the international anchor. In the United States, Employee Stock Ownership Plan tax provisions have bipartisan support, but mandatory profit-sharing has not had federal momentum since the 1970s. Germany's co-determination provides an adjacent ownership-and-voice model.",
    press:[],
    pairsWith:[{id:"worker-ownership",why:"Profit-sharing is the income flow and employee ownership the capital stock, and together they build a fuller worker stake."}], competesWith:[], lastReviewed:"2026-06-23"   },
  { id:"universal-child-benefit", level:"elevated", category:"safety-net",
    title:"Universal Child Benefit",
    summary:"Monthly universal cash payments per child (~$250–500/month), reducing child poverty and stabilizing family income during transition periods. Income-phased above $100,000 to maintain progressive incidence.<br><br>Administration would be handled through the Internal Revenue Service's existing Child Tax Credit infrastructure, with an opt-in monthly payment mechanism similar to the 2021 advance CTC. Benefit levels would be indexed to inflation, with an enhanced rate for children under six. The benefit would be refundable and available regardless of parents' employment or immigration status.",
    rationale:"The expanded Child Tax Credit (2021) reduced child poverty by approximately 46% in a single year {{citep:248}}, the most rapid poverty reduction of any recent U.S. policy. AI-driven income volatility will increase the number of families cycling in and out of poverty; a universal child benefit stabilizes family income floors.<br><br>The temporary CTC expansion's expiration in December 2021 immediately reversed its poverty reduction gains, demonstrating both the power of the policy and the fragility of its temporary design. Workers in displaced occupations are disproportionately parents, and child poverty is expensive to address after the fact. A permanent child benefit converts an annual tax credit into a monthly family income stabilizer.",
    precedent:"American Rescue Plan CTC expansion (2021) demonstrated administrative feasibility and poverty impact. Canada's Universal Child Care Benefit, UK Child Benefit, and most Organisation for Economic Co-operation and Development countries maintain universal child benefits as standard social infrastructure.<br><br>Canada's Canada Child Benefit (2016) combined universality with income-targeting and reduced the number of children in poverty by approximately 30% within two years, though the full reduction reflects economic growth and other transfers alongside the benefit itself. Germany's Kindergeld, Finland's lapsilisä, and Australia's Family Tax Benefit all demonstrate the political durability of permanent universal child benefits. Budget scoring and academic research on U.S. proposals consistently find strong poverty reduction relative to cost {{citep:248}}.",
    feasibility:"Operationally proven. The 2021 advance Child Tax Credit demonstrated United States administrative feasibility for monthly cash benefits at scale. The Internal Revenue Service infrastructure exists. Permanent expansion requires Congressional action. The temporary 2021 expansion lapsed in December 2021 over debates about the state and local tax deduction cap and work requirements.",
    strengths:["Strongest single-year poverty reduction in recent United States policy. The 2021 expanded Child Tax Credit reduced child poverty by approximately 46 percent in one year {{citep:248}}.","Administratively straightforward: the Internal Revenue Service already operates the credit infrastructure, and monthly payments are operationally proven.","International precedent is overwhelming: Canada, the United Kingdom, Germany, Australia, and all Nordic countries maintain universal child benefits.","Strong evidence base from budget scoring and academic research supports cost-effectiveness."],
    risks:["Work-requirement debates have repeatedly blocked permanent expansion at the federal level.","Income-targeting reduces universality benefits and reintroduces benefit cliffs.","Inflation concerns surface during expansion debates.","Federal budget scoring sensitivity: full child poverty elimination requires substantial annual outlays."],
    landscape:"Permanent expansion has been a top Democratic priority since 2021. Republican opposition focuses on work conditionality. Senators Bennet, Brown, and Wyden have introduced multiple versions. Romney-style work-conditional Child Tax Credit variants have Republican support; the unconditional version does not. International evidence is uniform but United States politics is distinctively contested.",
    press:[],
    paperIds: [248], pairsWith:[{id:"eitc-expansion",why:"Two stackable refundable-credit supports; expanding one strengthens the delivery case for the other."}], competesWith:[], lastReviewed:"2026-06-23"   },
  { id:"care-economy-investment", level:"elevated", category:"jobs",
    title:"Federal Care Economy Investment",
    summary:"Large-scale public investment in childcare, eldercare, home health, and education jobs, sectors that are AI-resistant by nature and chronically underinvested, underpaid, and in high demand.<br><br>Investment would fund universal pre-K for all children ages 3–4, expanded Medicaid-funded home- and community-based care for elderly and disabled populations, and significant wage increases for care workers through federal reimbursement rate increases. Total investment in the $400–500B range over ten years would create an estimated 4–6 million living-wage jobs in sectors where AI automation risk is under 10%, while meeting documented unmet demand for care services.",
    rationale:"Care work cannot be easily automated and is in growing demand from aging populations. Federal investment creates living-wage jobs where AI displacement risk is minimal.<br><br>AI-driven displacement is concentrated in clerical, manufacturing, and routine service roles, disproportionately held by women and workers of color. Care economy investment simultaneously creates new employment in AI-resistant sectors and addresses the demographic concentration of displacement risk. It also addresses two simultaneous market failures: chronic underinvestment because market prices don't capture social value, and systematic underpayment because most care workers belong to groups with weakened labor market power.",
    precedent:"Biden's Build Back Better included $400B in care economy investment. Marshall Plan for Moms proposals have gained legislative momentum. Nordic countries maintain universal childcare systems that generate significant employment at living wages.<br><br>Germany's expansion of federal childcare subsidies grew the childcare workforce by roughly 200,000 between 2008 and 2018 while substantially improving female labor force participation. Denmark spends about 1.3% of GDP on early childhood education and care, among the highest shares in the OECD, producing both high employment and among the lowest child poverty rates globally. Decades of early-childhood research, anchored by James Heckman's program evaluations, find that pre-K investments produce $4–9 of economic return per dollar invested.",
    feasibility:"A federal vehicle requires Congressional appropriation. The Biden administration's Build Back Better proposal included roughly $400 billion in care economy investment before being scaled down. The administrative architecture exists through Medicaid Home and Community Based Services and federal childcare subsidies. Sustained appropriations are the binding constraint, not the delivery mechanism.",
    strengths:["Care work has near-zero artificial intelligence automation risk, below ten percent in most analyses.","Addresses two market failures at once: chronic underinvestment and systematic underpayment.","Job creation potential is large: several million jobs over ten years at the proposed investment scale.","Disproportionately benefits women and workers of color, who face higher displacement risk in other sectors {{cite:206}}."],
    risks:["Sustained federal appropriations are politically vulnerable. Care-economy proposals have repeatedly been scaled down or removed from larger bills.","State-level Medicaid expansion is uneven. Federal funding can be undercut by state administrative decisions.","Without wage floors, federal subsidies can be captured by employer cost-cutting rather than worker wages.","Care-worker organizing infrastructure is underdeveloped relative to the scale of the investment."],
    landscape:"The Build Back Better proposal's $400 billion care-economy investment had Democratic support but lost a critical Senate vote. The Marshall Plan for Moms and various care-workers' bills of rights are the leading state-level vehicles. The Service Employees International Union is the dominant organized constituency. The disagreement is over scale and durability rather than concept.",
    press:[],
    paperIds: [206], pairsWith:[{id:"job-guarantee",why:"A job guarantee can staff the care economy this investment builds, so the program and the sector reinforce each other."}], competesWith:[], lastReviewed:"2026-06-23"   },
  { id:"housing-stability", level:"elevated", category:"housing",
    title:"Housing Stability Infrastructure",
    summary:"Expanded housing vouchers, social housing construction, tenant screening algorithm regulations, and zoning reform to prevent housing instability from compounding AI-driven income volatility.<br><br>The policy package includes: expanding Section 8 vouchers to cover all eligible families (currently only 1 in 4 eligible families receive vouchers due to funding limits {{cite:250}}); funding 500,000 units of social housing through a National Housing Trust; requiring notice and opportunity to contest algorithmic tenant screening decisions; and federal preemption of exclusionary zoning in jurisdictions receiving federal housing funds.",
    rationale:"Housing instability is a primary barrier to successful workforce transitions; workers who lose jobs face housing loss risk that prevents retraining. Algorithmic tenant screening amplifies this risk by imposing AI-generated exclusions on displaced workers based on eviction records and credit scores.<br><br>Research on workforce transition programs consistently identifies housing instability as the single strongest predictor of program failure. Workers who cannot maintain stable housing during displacement are unable to complete training programs, accept geographically distant employment, or absorb the income volatility that transitions produce. Algorithmic screening compounds the problem by creating lasting exclusions from stable housing for exactly the workers who need it most.",
    precedent:"Vienna's Gemeindebau social housing system and Singapore's public housing model demonstrate large-scale public housing feasibility. Several cities have enacted tenant screening algorithm regulations, with NYC tenant screening disclosure requirements setting partial precedent.<br><br>Montgomery County, Maryland's Moderately Priced Dwelling Unit program has produced 17,000 affordable units over 50 years. Seattle's FAIR Chance Housing Ordinance restricts criminal history screening in tenant decisions. The National Low Income Housing Coalition estimates a shortage of 7 million affordable housing units, making housing stability infrastructure a prerequisite for any workforce transition policy.",
    feasibility:"Section 8 voucher expansion requires Department of Housing and Urban Development appropriations. About one in four eligible families currently receive vouchers due to funding caps {{cite:250}}. Algorithmic tenant screening regulation has municipal precedent in Seattle and New York City. Zoning reform requires state preemption of municipal exclusionary zoning, which has succeeded in California, Oregon, and Minneapolis.",
    strengths:["Housing instability is the single strongest predictor of training-program failure. Addressing it directly improves outcomes for {{pol:reskilling-accounts|individual learning accounts}}.","Section 8 has decades of administrative precedent. Expansion is a funding decision, not a delivery problem.","Algorithmic screening regulation has city-level templates, including Seattle's Fair Chance Housing Ordinance and New York City notice requirements {{cite:116}}.","State-level zoning reform has bipartisan precedent, including California Senate Bill 9 and the Minneapolis 2040 Plan."],
    risks:["Voucher expansion without housing-supply growth bids up prices. Supply-side policies are required complements.","Algorithmic screening regulation depends on enforcement capacity. Without it, disclosure rules become compliance theatre {{cite:117}}.","Federal preemption of local zoning faces durable opposition from suburban political constituencies.","Implementation timelines are long. Housing-stability outcomes lag policy enactment by years."],
    landscape:"Section 8 expansion has Democratic support and episodic Republican interest, generally in tandem with work requirements. State zoning reform has bipartisan precedent in California, Oregon, and Minnesota. The National Low Income Housing Coalition is the dominant advocacy coalition. The National Association of Realtors and homebuilder associations are durable opponents of supply-side reforms.",
    press:[],
    paperIds: [250, 116, 117, 249], pairsWith:[{id:"universal-basic-services",why:"Housing is the anchor in-kind service, and a universal-basic-services program is the natural home for a housing guarantee."}], competesWith:[], lastReviewed:"2026-06-23"   },
  /* ── High ──────────────────────────────────────────────────── */
  { id:"delink-healthcare", level:"high", category:"healthcare",
    title:"De-link Healthcare from Employment",
    summary:"Transition to universal health coverage not contingent on employment status, through Medicare expansion, a public option, or a fully single-payer system, eliminating healthcare loss as a barrier to job mobility.<br><br>Under a public option design, workers losing employer coverage would be automatically enrolled in a federally administered plan with sliding-scale premiums, financed through a payroll tax on employers who do not provide coverage plus general revenue. Under Medicare for All, all employment-based coverage would be replaced with a single federal program financed through a progressive income tax and a modest payroll contribution. Both designs eliminate the employment-coverage link entirely.",
    rationale:"Employment-based healthcare creates job lock: workers stay in jobs they'd otherwise leave because losing coverage is too costly. As AI accelerates transitions between jobs and employment classifications, health coverage tied to employment becomes an active barrier to workforce adaptability.<br><br>Brigitte Madrian's research in the Quarterly Journal of Economics (1994) estimates that job lock reduces voluntary turnover among insured workers by roughly 25 percent, preventing the labor market fluidity that AI-era transitions require. For workers displaced involuntarily, Consolidated Omnibus Budget Reconciliation Act coverage is typically unaffordable, creating a gap between job loss and Medicaid eligibility that produces medical debt, deferred care, and health deterioration. Universal coverage eliminates this barrier.",
    precedent:"Every other developed economy has universal health coverage. The Affordable Care Act partially addressed this by creating marketplace coverage. Medicare for All proposals have been introduced in Congress, and state-level single-payer efforts in California and Colorado demonstrate political momentum.<br><br>Taiwan's National Health Insurance (1995) transitioned from employment-based insurance to universal coverage within two years, demonstrating feasibility at national scale. Canada's transition to universal coverage (1961–1972) proceeded province by province, with Saskatchewan demonstrating the model. The Affordable Care Act's expansion of marketplace coverage reduced the uninsured rate to historic lows; universal coverage is the logical architectural extension.",
    feasibility:"Operationally proven internationally. Every other developed economy has done it. United States transition faces the most contested political landscape of any policy in this database. Taiwan's 1995 transition from employment-based to universal coverage within two years demonstrates feasibility at national scale. The administrative architecture for a public option exists through Medicare expansion and the Affordable Care Act marketplaces. Medicare-for-All would require a larger administrative buildout.",
    strengths:["Removes job lock. RAND research estimates employment-based healthcare reduces voluntary quit rates by 20 to 30 percent.","International evidence is uniform. Universal coverage produces better outcomes at lower cost per capita than employment-based systems.","Affordable Care Act marketplace expansion has built domestic administrative infrastructure for non-employment-based coverage.","Single most impactful policy for enabling artificial-intelligence-era job mobility."],
    risks:["Politically the most contested policy in this database. Passage requires durable Congressional majorities that have not materialized.","Transition costs and timing are sensitive. Taiwan's 1995 transition required emergency executive authority.","The health insurance industry employs roughly half a million workers. Transition raises its own displacement question.","Provider payment rate transitions can disrupt access during the transition window."],
    landscape:"Medicare-for-All has support from the Democratic progressive caucus but not majority support in either party. Public-option proposals have broader Democratic support. Republican opposition to universal coverage is near-uniform. State experiments in California and Colorado have stalled. The insurance industry, hospital systems, and physician associations are split.",
    press:[],
    pairsWith:[{id:"portable-benefits",why:"Healthcare is the largest employer-tied benefit; de-linking it and building portable accounts for the rest are two halves of one decoupling agenda."}], competesWith:[], lastReviewed:"2026-06-23"   },
  { id:"shorter-workweek", level:"high", category:"work-structure",
    title:"32-Hour Standard Workweek",
    summary:"Reduce the standard workweek to 32 hours with no reduction in pay, distributing available work across more workers and treating AI-driven productivity gains as leisure rather than solely as output.<br><br>The 32-hour standard would be implemented through Fair Labor Standards Act amendments reducing the overtime threshold from 40 to 32 hours, with a three-year phase-in for small employers. Firms demonstrating AI-driven productivity improvements above a threshold would be required to reduce hours within 18 months; firms below the threshold would have five years. The policy treats reduced overtime liability as a transition incentive, rewarding firms that implement reduced hours proactively.",
    rationale:"If AI increases per-worker productivity, the social dividend of that increase can take the form of more leisure rather than only more output. A shorter workweek distributes productivity gains as time, reduces unemployment risk from displacement, and rebalances the capital-labor income split.<br><br>The 40-hour week was a policy choice, established in 1938 when productivity was a fraction of today's level. Since then, productivity has more than tripled while working hours have remained largely static: all productivity gains have been captured as output or profit, none as leisure. AI productivity gains present the same distributional choice: time or money. A 32-hour standard makes that choice explicit and defaults to shared time.",
    precedent:"Microsoft Japan's August 2019 trial increased productivity (measured as sales per employee) by 40%. Iceland's 4-day trial (2015–2019) showed no productivity loss. The UK's 2022 pilot across 61 companies found 89% still operating a 4-day policy one year later, with around half having made it fully permanent.<br><br>Belgium passed legislation in October 2022 giving workers the right to request a compressed 4-day schedule (same total hours). Germany's IG Metall union has negotiated 35-hour workweeks in manufacturing since 1984, with no evidence of competitive damage. Japan's government has encouraged 4-day weeks since 2021, with Panasonic, Hitachi, and Canon among large adopters. The accumulated evidence from national pilots supports feasibility; resistance is concentrated among employers with high fixed-cost labor structures.",
    feasibility:"Fair Labor Standards Act amendments require Congressional action. The United Kingdom four-day pilot in 2022 found 89 percent of participating firms maintained the schedule one year later. Iceland, Belgium, and Japan have national-scale four-day initiatives in various stages. Microsoft Japan's 2019 trial showed productivity gains.",
    strengths:["Distributes artificial-intelligence productivity gains as time rather than only as output.","Strong international evidence for productivity neutrality or gains. The United Kingdom four-day pilot, Iceland, and Microsoft Japan all reported positive results.","Reduces unemployment risk from displacement by distributing available work across more workers.","Germany's IG Metall has maintained 35-hour weeks in manufacturing since 1984 without competitive damage."],
    risks:["High fixed-cost labor structures, including healthcare and manufacturing shift work, face larger transition challenges.","Employer flexibility to compress hours into fewer days can create work-intensity problems.","Voluntary adoption by leading firms can create a two-tier labor market.","Implementation costs are concentrated in initial years. Long-term cost neutrality requires productivity sharing."],
    landscape:"Belgium's October 2022 legislation gave workers the right to request a four-day schedule at the same total hours. The United Kingdom's 2022 pilot is the largest single-country trial. United States federal vehicles include the 32-Hour Workweek Act series. Republican opposition has been near-uniform. Bipartisan agreement exists only at the state pilot level.",
    press:[{label:"4 Day Week Global — 2022 UK Pilot Results",url:"https://www.4dayweek.com/uk-pilot-results"}],
    paperIds: [262], pairsWith:[], competesWith:[{id:"job-guarantee",why:"Spread existing work versus create new public work, competing responses to slack labor demand."}], lastReviewed:"2026-06-23"   },
  { id:"job-guarantee", level:"high", category:"jobs",
    title:"Federal Job Guarantee",
    summary:"Establish the federal government as employer-of-last-resort, offering publicly funded jobs at a living wage to any willing worker, providing a true employment floor and buffer against cyclical and structural unemployment.<br><br>The program would offer jobs at $20–25/hour (indexed to inflation) with full benefits to any adult who cannot find private employment. Positions would focus on public goods: infrastructure maintenance, environmental remediation, elder and childcare, school support, and community development. Administration would be decentralized to state and local agencies, with 100% federal financing of direct labor costs.",
    rationale:"If AI-driven structural unemployment exceeds what market absorption can address, a Job Guarantee provides a floor that market mechanisms cannot offer. It makes unemployment a policy choice rather than an economic inevitability, and sets a wage and conditions floor for the private sector.<br><br>Mainstream economic responses to structural unemployment assume market labor demand will absorb displaced workers over time, an assumption increasingly challenged by AI's capacity for broad-occupation substitution. A Job Guarantee creates publicly funded demand for labor as a direct policy instrument. The buffer stock of employed workers acts as an automatic macroeconomic stabilizer, expanding in recessions and contracting in recoveries.",
    precedent:"The New Deal's Works Progress Administration employed approximately 8.5 million workers cumulatively over its existence (1935–1943), peaking at roughly 3.3 million simultaneously employed in 1938. Argentina's Jefes program (2002) successfully absorbed unemployment during acute economic crisis. Modern Monetary Theory-aligned economists including Kelton, Wray, and Tcherneva have developed comprehensive contemporary implementation frameworks.<br><br>India's Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA) guarantees 100 days of public employment to rural households, covering roughly 80 to 110 million workers annually in recent years. Tcherneva's 2020 monograph provides the most detailed contemporary implementation model. Senator Sanders and Representative Ocasio-Cortez have introduced federal legislation; the Levy Economics Institute's 2018 estimate puts gross costs above $500 billion annually.",
    feasibility:"Politically the most contested transformational policy in this database. The Works Progress Administration (1935 to 1943) employed about 8.5 million workers cumulatively. The administrative precedent exists at scale. India's Mahatma Gandhi National Rural Employment Guarantee Act covers roughly 80 to 110 million workers annually in recent years. The Congressional Budget Office has not scored a federal job guarantee. The leading cost estimate, from the Levy Economics Institute (2018), puts gross spending above $500 billion annually, a net budget impact near 1 to 2 percent of gross domestic product.",
    strengths:["Creates a true employment floor that market mechanisms cannot offer.","Acts as an automatic macroeconomic stabilizer, expanding in recessions and contracting in recoveries.","Strong international precedent. India's Mahatma Gandhi National Rural Employment Guarantee Act operates at massive scale. Argentina's Plan Jefes (2002) absorbed unemployment during acute crisis.","Comprehensive contemporary implementation frameworks exist from Pavlina Tcherneva, Randall Wray, and Stephanie Kelton."],
    risks:["Administrative complexity at federal scale is genuinely large. Decentralization to states and localities introduces capacity variation.","The wage-floor effect can compress the private-sector low-wage premium. Some labor economists view this as a feature; others as a bug.","Make-work concerns. Program quality depends on local administrative capacity.","Cost estimates in the hundreds of billions annually are politically vulnerable at the federal level."],
    landscape:"Federal vehicles include proposals from Senator Sanders and Senator Booker, along with Pavlina Tcherneva's framework. Republican opposition is durable. Bipartisan precedent exists only in narrow emergency-employment programs. India's Mahatma Gandhi National Rural Employment Guarantee Act is the international anchor. Argentina's Plan Jefes demonstrated rapid deployment during acute crisis.",
    press:[],
    pairsWith:[{id:"care-economy-investment",why:"A job guarantee can staff the care economy this investment builds, so the program and the sector reinforce each other."}], competesWith:[{id:"reskilling-accounts",why:"Retrain workers versus guarantee them a job, two answers to displacement drawing on the same budget line and attention."},{id:"shorter-workweek",why:"Spread existing work versus create new public work, competing responses to slack labor demand."}], lastReviewed:"2026-06-23"   },
  { id:"universal-basic-services", level:"high", category:"safety-net",
    title:"Universal Basic Services",
    summary:"Publicly funded universal provision of essential services — healthcare, housing, education, transport, broadband — that reduces the income needed for a dignified life regardless of employment status.<br><br>Universal Basic Services does not replace cash income but reduces the market expenditure required for dignified life. By providing healthcare, education, housing support, public transit, and broadband as universal services, it lowers the effective income needed to achieve security. A family with access to universal services needs substantially less cash income to maintain equivalent living standards. Poverty reduction comes from lowering the cost of essentials, not just supplementing income.",
    rationale:"Universal Basic Services address the security dimension of AI disruption by ensuring access to essentials directly, rather than requiring people with volatile incomes to navigate market prices for necessities.<br><br>When income drops from AI displacement, families can lose housing, healthcare, and education access simultaneously, compounding the disruption. Universal services sever this link and tend to be politically durable: harder to characterize as creating dependency, more resilient across electoral cycles, and not subject to purchasing-power erosion the way fixed cash amounts are.",
    precedent:"Nordic countries provide near-universal services in healthcare, education, and childcare. The UK National Health Service provides the healthcare model. Free transit programs in Tallinn, Luxembourg, and several U.S. cities demonstrate feasibility at different scales.<br><br>University College London's Institute for Global Prosperity published the first fully costed Universal Basic Services framework, pricing an expanded services package at £42.2 billion annually, 2.3 percent of gross domestic product, worth about £126 per week to the lowest-income households {{citep:255}}. Tallinn became the first capital city with free public transit in 2013; Luxembourg made all public transit free nationally in 2020. These examples demonstrate political feasibility.",
    feasibility:"Most components have domestic and international precedent: National Health Service-style healthcare, universal pre-kindergarten, and free transit in Tallinn and Luxembourg. The administrative challenge is coordinating across federal, state, and local agencies. The University College London Institute for Global Prosperity produced the most detailed comprehensive framework in 2017, with cost estimates roughly equivalent to existing United States public expenditure.",
    strengths:["Politically durable. Harder to characterize as creating dependency than cash transfers.","Reduces the income required for dignified life rather than supplementing income to meet market prices.","Strong international precedent in Nordic countries, the United Kingdom's National Health Service, and European Union public transit subsidies.","Free public transit at the city scale, including Tallinn in 2013 and Luxembourg in 2020, demonstrates feasibility."],
    risks:["Comprehensive implementation requires coordination across federal, state, and local agencies.","Service quality can vary widely. Without consistent funding, universal services can become two-tier.","Initial transition costs are large. Cost neutrality compared to existing spending depends on implementation choices.","Some services, including housing and healthcare, face structural constraints that universal provision alone cannot address."],
    landscape:"International support is strong, with Nordic countries as the implementation anchor. United States federal momentum is limited. Municipal experiments in transit and pre-kindergarten provide the most actionable precedent. Progressive caucus support; broader Democratic and Republican support depends on the specific service.",
    press:[],
    paperIds: [255], pairsWith:[{id:"housing-stability",why:"Housing is the anchor in-kind service, and a universal-basic-services program is the natural home for a housing guarantee."}], competesWith:[{id:"ubi",why:"Cash versus in-kind services, competing theories of how to guarantee a floor from the same budget."},{id:"guaranteed-income",why:"Targeted cash versus universal services, two answers to the same provide-a-floor question."}], lastReviewed:"2026-06-23"   },
  { id:"worker-ownership", level:"high", category:"tax-wealth",
    title:"Worker Ownership Expansion",
    summary:"Mandate Employee Stock Ownership Plan contributions or profit-sharing stakes when firms deploy AI at scale; create a Worker Ownership Tax Credit incentivizing conversion of businesses to worker-owned cooperatives or employee trusts.<br><br>Firms employing 500 or more workers and deploying AI systems that generate measurable productivity gains above a benchmark would be required to contribute 1–3% of pre-tax profits to a worker ownership trust annually, with vesting schedules encouraging long-term employment. The Worker Ownership Tax Credit would provide a 25% credit for conversion costs when closely-held businesses transfer to Employee Stock Ownership Plan or cooperative ownership, reducing the financial barrier to worker buyouts.",
    rationale:"If AI concentrates capital income, expanding worker ownership is the most durable redistribution mechanism. It changes the ownership structure that determines who captures productivity growth, rather than redistributing gains after the fact.<br><br>Tax and transfer mechanisms redistribute income after AI has generated it as capital returns. Worker ownership changes who holds the productive assets that generate AI returns before they accrue. Employee Stock Ownership Plan-owned firms maintain employment more stably through recessions, invest more in worker development, and produce higher median employee wealth than comparable non-Employee Stock Ownership Plan firms. Ownership is the upstream intervention; redistribution is the downstream response.",
    precedent:"The UK Employee Ownership Trust model (used by John Lewis Partnership) and the Mondragón cooperative network demonstrate large-scale feasibility. Employee Stock Ownership Plan tax incentives in the U.S. currently cover approximately 15 million workers {{cite:254}}.<br><br>The UK's 2014 Employee Ownership Trust legislation, which enabled high-profile ownership transitions at Richer Sounds and Aardman Animations, provides a replicable model. The 2022 WORK Act created the Department of Labor's Employee Ownership Initiative, authorizing $50 million in grants for state employee-ownership programs. The 2018 Main Street Employee Ownership Act separately expanded Small Business Administration lending for Employee Stock Ownership Plan conversions. Research by Blasi, Freeman, and Kruse finds that broad-based ownership programs increase worker productivity, reduce turnover, and improve financial resilience.",
    feasibility:"Employee Stock Ownership Plan tax infrastructure has decades of United States administrative precedent, covering about 15 million workers {{cite:254}}. The United Kingdom's 2014 Employee Ownership Trust legislation provides a more recent international precedent. Mandatory contributions for firms deploying artificial intelligence require new federal legislation. Voluntary expansion has bipartisan support.",
    strengths:["Addresses ownership structure rather than redistributing income after the fact.","Strong United States administrative precedent. Employee Stock Ownership Plan tax provisions have existed since 1974.","Research by Blasi, Freeman, and Kruse documents productivity gains, lower turnover, and higher financial resilience.","Bipartisan support for Employee Stock Ownership Plans in United States tax code. The 2022 WORK Act creating the Employee Ownership Initiative passed with bipartisan support as part of the SECURE 2.0 retirement package."],
    risks:["Mandatory contributions face stronger industry opposition than voluntary Employee Stock Ownership Plan expansion.","Concentration risk. Workers' wealth concentrated in their employer's stock undermines portfolio diversification.","Without voice and governance rights, ownership shares can be financial without being substantive.","Employee Stock Ownership Plan conversion costs are high for closely-held businesses. Financing is a real barrier."],
    landscape:"Bipartisan support for Employee Stock Ownership Plans is durable. The political fight is over mandatory versus voluntary expansion. The Employee Ownership Foundation and the National Center for Employee Ownership are the dominant advocacy organizations. The United Kingdom's 2014 Employee Ownership Trust legislation is the leading international precedent.",
    press:[],
    paperIds: [254], pairsWith:[{id:"profit-sharing-mandate",why:"Profit-sharing is the income flow and employee ownership the capital stock, and together they build a fuller worker stake."},{id:"sovereign-wealth-fund",why:"Employee ownership broadens capital at the firm level and a sovereign fund broadens it at the society level, two layers of the same capital-distribution agenda."}], competesWith:[], lastReviewed:"2026-06-23"   },
  { id:"guaranteed-income", level:"high", category:"safety-net",
    title:"Guaranteed Income",
    summary:"Establish a federally funded guaranteed minimum income, providing every adult with cash support regardless of employment status, set above the poverty line and administered through existing tax infrastructure.<br><br>Unlike means-tested programs that phase out sharply as earnings rise, or {{pol:ui-reform|unemployment insurance}} that requires prior employment, guaranteed income provides a stable floor. Benefit levels would be set at approximately $800–1,200 per month, with a gradual phase-out for higher earners. Administration through the Internal Revenue Service's existing infrastructure, using the advance Child Tax Credit model, makes rapid deployment feasible without building new bureaucracy.",
    rationale:"As AI restructures labor markets, the frequency and duration of involuntary non-employment will increase. Workers facing displacement need a floor that does not depend on prior earnings records, re-employment timelines, or means-testing bureaucracy. Guaranteed income decouples subsistence from employment outcomes, enabling mobility between sectors.<br><br>The evidence base is stronger than most income support proposals {{cite:210}}. The Stockton SEED pilot {{cite:253}} found guaranteed income recipients were more likely to gain full-time employment than the control group, contradicting the labor supply reduction concern. Finland's 2017–2018 trial found modest positive employment effects and significantly improved well-being among recipients. Kenya's ongoing GiveDirectly 12-year randomized controlled trial shows sustained positive effects on investment, earnings, and psychological well-being. Unlike {{pol:ubi|universal basic income}}, guaranteed income can be targeted to those most affected by displacement while building the administrative infrastructure for a more universal system.",
    precedent:"The Stockton SEED pilot demonstrated administrative feasibility and showed guaranteed income recipients moved into full-time employment at higher rates than controls. Finland's 2017–2018 basic income experiment found modest positive employment effects and significantly improved well-being, though the experiment was limited to unemployed individuals already receiving unemployment benefits.<br><br>GiveDirectly's 12-year Kenya randomized controlled trial, the longest and largest randomized controlled trial of guaranteed income, shows sustained positive effects on consumption, assets, psychological well-being, and local economic activity. Several U.S. cities (Los Angeles, Chicago, Atlanta) have launched guaranteed income pilots under Mayors for a Guaranteed Income. The 2021 advance Child Tax Credit demonstrated that monthly cash transfers can be administered at scale through Internal Revenue Service infrastructure within weeks of authorization.",
    feasibility:"Operationally proven at city and pilot scale: the Stockton Economic Empowerment Demonstration in 2021, and the Mayors for a Guaranteed Income network in Los Angeles, Chicago, and Atlanta. Finland's 2017 to 2018 trial and GiveDirectly's Kenya 12-year randomized study extend the evidence base. A federal vehicle would require Congressional action. The administrative architecture exists through the advance Child Tax Credit and pandemic stimulus payments.",
    strengths:["Strongest evidence base of any income-support proposal. The Stockton Economic Empowerment Demonstration, Finland, and Kenya GiveDirectly are all randomized or pilot-quality.","Stockton recipients moved into full-time employment at higher rates than controls, contradicting labor-supply concerns.","Bipartisan precedent. The 2021 stimulus payments demonstrated administrative feasibility under both the Trump and Biden administrations.","A targeted variant can be deployed faster than {{pol:ubi|universal basic income}} and tested incrementally."],
    risks:["Phase-out cliffs create marginal tax-rate distortions. Smoothing requires careful design.","Targeting requires income verification, which creates administrative burden and stigma.","Inflation concerns at scale. Stockton at pilot scale showed no measurable inflation effect, but national-scale evidence is limited.","Without permanence, recipients face transition cliffs when programs end."],
    landscape:"The Mayors for a Guaranteed Income coalition has more than 100 city pilots {{cite:211}}. Federal vehicles include various Family Security Act proposals. The American Rescue Plan's stimulus payments and advance Child Tax Credit are the closest federal precedents. Bipartisan opposition focuses on work requirements. Bipartisan support exists for emergency variants.",
    press:[{label:"Stockton SEED — Findings (Stanford)",url:"https://www.stocktondemonstration.org/"}],
    paperIds: [210, 253, 211], pairsWith:[], competesWith:[{id:"ubi",why:"Universal versus targeted cash, contending for the same income-floor fiscal space and political moment."},{id:"universal-basic-services",why:"Targeted cash versus universal services, two answers to the same provide-a-floor question."},{id:"eitc-expansion",why:"Work-conditioned versus unconditional cash, competing philosophies of income support for a similar constituency."}], lastReviewed:"2026-06-23"   },
  /* ── Transformational ─────────────────────────────────────── */
  { id:"ubi", level:"transformational", category:"safety-net",
    title:"Universal Basic Income",
    summary:"Universal unconditional cash transfers to all citizens, sufficient to cover basic needs, with no work requirements, employment status conditions, or other conditionality.<br><br>At a level of $1,200–2,000 per month per adult, universal basic income would provide a genuine subsistence floor. Financing models include: a value-added tax on consumption, a carbon dividend, consolidation of existing means-tested programs, or a {{pol:sovereign-wealth-fund|sovereign wealth fund}} dividend extended nationally. Each model has different distributional incidence; a value-added tax-financed universal basic income benefits the bottom income quintile most substantially.",
    rationale:"If AI displaces a majority of existing work, the employment-income link can no longer serve as the primary mechanism for distributing economic output. universal basic income ensures a universal income floor independent of participation in a drastically altered labor market.<br><br>The case for universal basic income is that labor market participation cannot be assumed to distribute income universally if AI reduces labor demand sufficiently. At current disruption trajectories, the argument is precautionary; at transformational disruption levels, it becomes structural necessity. As AI captures increasing shares of GDP as capital returns, universal basic income ensures economic growth has universal rather than concentrated beneficiaries.",
    precedent:"Stockton's SEED pilot {{cite:253}} showed guaranteed income recipients were more likely to gain full-time employment than the control group, contradicting the labor supply reduction concern. Finland's 2017–2018 trial and Kenya's ongoing GiveDirectly 12-year randomized controlled trial provide additional evidence. The Alaska Permanent Fund Dividend ($1,312 in 2023) distributes oil revenues universally, the closest existing model.<br><br>GiveDirectly's Kenya study is the largest and longest universal basic income randomized controlled trial ever conducted, with preliminary results showing sustained positive effects on investment, earnings, and psychological well-being. GiveDirectly's AI-supported program deploys satellite imagery and machine learning to identify beneficiaries in data-scarce regions {{cite:146}}, demonstrating that AI can reduce the administrative costs of cash transfers and extend their reach to populations outside conventional administrative systems. The Alaska Permanent Fund demonstrates the political durability of universal cash transfers when funded by shared resource revenue.",
    feasibility:"No country has implemented true universal basic income at the level often proposed. Pilots have all been targeted or time-limited. Financing options, including a value-added tax, a carbon dividend, or consolidation of means-tested programs, are politically contested but administratively understood. The Alaska Permanent Fund Dividend is the closest existing model.",
    strengths:["Universal coverage eliminates means-testing administration and benefit-cliff distortions.","Strongest philosophical alignment with transformational displacement scenarios {{cite:33}}.","The Alaska Permanent Fund Dividend demonstrates political durability of universal cash transfers.","Strong evidence base for cash transfers generally, including Stockton, Finland, and Kenya GiveDirectly {{cite:210}}."],
    risks:["Financing at the scale required runs into the trillions annually. This is politically contested.","Inflation concerns at scale. Pilot evidence does not generalize cleanly to national implementation.","Consolidating means-tested programs to finance universal basic income can leave high-need recipients worse off if designed poorly.","Universal coverage means high-income recipients receive transfers, raising distributional efficiency questions."],
    landscape:"Pilots are ongoing in the United States via Mayors for a Guaranteed Income, in Kenya via GiveDirectly, and in Brazil. Federal vehicles in the United States include the Freedom Dividend proposal. Republican opposition is durable. The Democratic progressive caucus is split between universal basic income and {{pol:guaranteed-income|targeted}} variants. Senator Sanders has favored {{pol:sovereign-wealth-fund|sovereign-wealth-fund}} dividends over universal basic income.",
    press:[{label:"GiveDirectly — Kenya 12-year universal basic income study",url:"https://www.givedirectly.org/ubi-study/"}],
    paperIds: [253, 146, 33, 210], pairsWith:[], competesWith:[{id:"guaranteed-income",why:"Universal versus targeted cash, contending for the same income-floor fiscal space and political moment."},{id:"universal-basic-services",why:"Cash versus in-kind services, competing theories of how to guarantee a floor from the same budget."},{id:"ai-dividend",why:"Both put a recurring universal check in every citizen's hands and compete for that everyone-gets-a-check moment."}], lastReviewed:"2026-06-23"   },
  { id:"ai-dividend", level:"transformational", category:"tax-wealth",
    title:"AI Productivity Dividend",
    summary:"Distribute a share of GDP growth attributable to AI productivity gains directly to all citizens as a periodic dividend, an explicit mechanism ensuring AI-generated prosperity has universal rather than concentrated beneficiaries.<br><br>The dividend would be calculated annually based on AI-attributable total factor productivity growth, estimated by Bureau of Labor Statistics using sector-level productivity data and AI adoption metrics. Distributions would be made quarterly to all adults, financed through a combination of a corporate income tax surcharge on AI-intensive sectors and a dedicated trust fund funded by a levy on AI patent licensing revenue. Initial estimates suggest a feasible dividend of $800–1,500 per person annually at current adoption rates.",
    rationale:"AI systems are trained on data generated by society, deployed in markets built on public investment, and derive value from infrastructure maintained collectively. A public dividend on AI productivity follows from this: the public created the conditions for the gains.<br><br>The normative case draws on natural resource dividend logic: if a country's AI systems generate value from collective data, public education, internet infrastructure, and publicly funded research, then returns belong partly to the public. The practical case is distributional: without a dividend mechanism, AI productivity gains will accrue almost exclusively to capital owners and high-skill workers, widening the gap between AI beneficiaries and those displaced.",
    precedent:"The Alaska Permanent Fund Dividend provides the most direct model: an annual dividend from natural resource revenues distributed to all residents. Data dividend proposals from Governor Newsom (California) apply similar logic to citizen data. Several economists have developed AI dividend frameworks using sovereign fund logic.<br><br>Norway's Government Pension Fund demonstrates the long-term institutional model: resource revenues accumulated as public capital, managed professionally, with returns distributed as social spending. Senator Bernie Sanders's American AI Sovereign Wealth Fund Act (2026) applies sovereign fund logic to AI specifically. Economists Posner and Weyl have proposed a data labor payment framework in which individuals are compensated for contributing AI training data.",
    feasibility:"No country has implemented an artificial-intelligence-specific productivity dividend. The Alaska Permanent Fund Dividend is the closest existing model for natural-resource-funded dividends. The administrative challenge is measurement: isolating artificial-intelligence-attributable productivity growth from other capital investment is contested. Senator Bernie Sanders's American AI Sovereign Wealth Fund Act (2026) is the leading United States legislative concept.",
    strengths:["Normative case is strong. Artificial intelligence is trained on collective data and deployed via public infrastructure.","The Alaska Permanent Fund Dividend demonstrates political durability of resource-based universal transfers.","Bipartisan interest in some variant. The Trump administration's February 2025 executive order directing the Treasury to develop a sovereign-wealth-fund plan suggests cross-spectrum legitimacy.","Pairs naturally with {{pol:sovereign-wealth-fund|sovereign wealth fund}} as the accumulation mechanism."],
    risks:["Productivity attribution is hard. Separating artificial-intelligence-driven gains from other capital investment is contested.","Returns vary with market conditions. Dividend levels can be volatile.","Incentivizes citizens to think as investors rather than as citizens.","Government as shareholder and regulator creates potential conflict of interest in artificial intelligence safety enforcement."],
    landscape:"Bipartisan signal from unusual directions. The Trump administration signed an executive order in February 2025 directing sovereign-wealth-fund development. Senator Sanders introduced an artificial-intelligence sovereign-wealth-fund bill in June 2026. The Cato Institute and the Tax Foundation oppose. Antimonopoly leaders such as Zephyr Teachout prefer structural separation. Posner and Weyl have proposed data-labor payment as an adjacent framework.",
    press:[{label:"Bearer-Friend & Polcz — Sharing the Algorithm (Columbia Tax Law Journal)",url:"https://journals.library.columbia.edu/index.php/taxlaw/article/view/14478"}],
    paperIds: [262], pairsWith:[{id:"sovereign-wealth-fund",why:"The fund accumulates public capital while the dividend distributes it, a funding mechanism alongside a distribution mechanism."}], competesWith:[{id:"ubi",why:"Both put a recurring universal check in every citizen's hands and compete for that everyone-gets-a-check moment."}], lastReviewed:"2026-06-23"   },
  { id:"sovereign-wealth-fund", level:"transformational", category:"tax-wealth",
    title:"Sovereign Wealth Fund from AI Productivity",
    summary:"Accumulate a portion of AI-derived productivity gains as public capital in a sovereign wealth fund, invested on behalf of all citizens, building socialized ownership of productive capacity as AI concentrates private capital.<br><br>The fund would be seeded by a 5% levy on AI-attributable corporate profits above a threshold, building toward a target of 5–10% of GDP over 20 years. The fund would invest across public equities, private markets, infrastructure, and clean energy, targeting returns sufficient to fund a meaningful annual dividend while preserving capital. Governance would be independent of political control, modeled on Norway's Norges Bank Investment Management structure.",
    rationale:"Private capital accumulation from AI will concentrate wealth to a degree that undermines democratic governance without a countervailing mechanism for public capital formation. A sovereign wealth fund converts AI productivity gains into shared productive assets rather than individual wealth transfers.<br><br>AI returns accrue to equity holders, who are increasingly concentrated among the top 1% of households. Without a mechanism for public capital accumulation, democratic societies face a widening divergence between economic power and political equality. A sovereign wealth fund creates a public counterbalance: a pool of productive assets owned collectively, growing in proportion to the private wealth concentration it offsets.",
    precedent:"Norway's Government Pension Fund Global ($1.7T) is the largest sovereign wealth fund globally and the most complete model for AI dividend logic. Singapore's Temasek and the Alaska Permanent Fund provide additional precedents.<br><br>Stewart Lansley and Howard Reed's Citizens' Wealth Fund proposal (Institute for Public Policy Research, 2018) developed a detailed UK implementation framework. Scotland's National Investment Bank provides a smaller-scale domestic model. The International Monetary Fund's 2023 fiscal monitor explicitly identified sovereign wealth funds as a mechanism for managing windfall revenues from concentrated industries. AI fits this framework directly.",
    feasibility:"The legal mechanism for government equity stakes in private companies is unclear. Broad statutory language has been interpreted permissively. The biggest hurdle is the Takings Clause, which is why Senator Sanders's bill structures the fund seed as a tax rather than a direct equity grab. Roughly two dozen United States states maintain sovereign wealth funds, including the Alaska Permanent Fund and the Texas Permanent School Fund. Norway's Government Pension Fund Global demonstrates the long-run institutional model.",
    strengths:["Converts artificial-intelligence productivity gains into shared productive assets, before they accrue privately.","The Alaska Permanent Fund's bipartisan support across decades demonstrates political durability.","Counterbalances wealth concentration without imposing conduct restrictions on companies.","Generates dividend revenue independent of employment, useful in displacement scenarios {{cite:33}}."],
    risks:["Managed-economy optics. Opens precedent for federal equity stakes in non-artificial-intelligence sectors.","Government as shareholder and regulator creates potential conflict of interest in artificial intelligence safety enforcement.","Returns are market-sensitive. Dividend volatility in recessions.","Incentivizes citizens to think as investors rather than as citizens."],
    landscape:"Bipartisan interest from unusual directions. The Trump administration signed an executive order in February 2025 directing the Treasury and Commerce departments to develop a sovereign-wealth-fund plan. Senator Sanders introduced an artificial-intelligence sovereign-wealth-fund bill in June 2026 with a 50 percent public-stake variant. Co-sponsors and aligned legislators include Senator Warren, Representative Casar, Representative Ocasio-Cortez, and Senator Markey on adjacent artificial-intelligence tax proposals. Opposition includes the Cato Institute, the Tax Foundation, and the Washington Post editorial board. Antimonopoly leaders prefer structural separation. The foundational academic argument for the approach is Bearer-Friend and Polcz's Sharing the Algorithm in the Columbia Tax Law Journal.",
    press:[{label:"Sanders — American AI Sovereign Wealth Fund Act (Bill Summary)",url:"https://www.sanders.senate.gov/wp-content/uploads/AmericanAISovereignWealthFundActSummary.pdf"},{label:"NYT — Bernie Sanders: A.I. is a Public Resource. You Should Own Half of It.",url:"https://www.nytimes.com/2026/06/01/opinion/artificial-intelligence-bernie-sanders.html"},{label:"Lawfare — Legal Bases for Government Stakes in Private Firms",url:"https://www.lawfaremedia.org/article/the-legal-bases-for-government-stakes-in-private-firms"},{label:"Bearer-Friend & Polcz — Sharing the Algorithm",url:"https://journals.library.columbia.edu/index.php/taxlaw/article/view/14478"}],
    paperIds: [33, 262], pairsWith:[{id:"ai-dividend",why:"The fund accumulates public capital while the dividend distributes it, a funding mechanism alongside a distribution mechanism."},{id:"wealth-tax",why:"A wealth tax on AI-derived gains can seed the fund, tying the accumulation vehicle to a revenue source."},{id:"worker-ownership",why:"Employee ownership broadens capital at the firm level and a sovereign fund broadens it at the society level, two layers of the same capital-distribution agenda."}], competesWith:[], lastReviewed:"2026-06-23" },
  { id:"global-min-tax", level:"transformational", category:"international",
    title:"Global Minimum Tax on AI Profits",
    summary:"Extend the Organisation for Economic Co-operation and Development/G20 global minimum tax framework {{cite:256}} to specifically address AI-derived profits, closing loopholes that allow AI companies to shift profits to low-tax jurisdictions while drawing social value from high-tax economies.<br><br>The extension would add a sector-specific pillar establishing a 21% minimum effective tax rate on AI-derived profits and creating a nexus rule attributing AI profits to the jurisdiction where training data was generated and where users are located. This closes the current gap that allows AI companies to book profits in low-tax jurisdictions while generating value from high-tax economies' infrastructure, talent, and institutions.",
    rationale:"AI companies derive value from data, talent, and infrastructure concentrated in wealthy democracies but book profits in low-tax jurisdictions. A global minimum tax ensures public investment is reflected in public revenue and that displacement costs are borne by those capturing the gains.<br><br>AI companies use publicly funded universities for research talent, publicly funded broadband for delivery, publicly funded legal systems for intellectual property protection, and citizen-generated data for model training, while booking profits offshore. A minimum tax with nexus rules tied to value creation would ensure that AI's fiscal footprint reflects its actual social footprint.",
    precedent:"The Organisation for Economic Co-operation and Development Pillar Two global minimum tax (15%) was agreed by 136 countries and jurisdictions in 2021 and is now entering implementation, demonstrating that coordinated international tax enforcement is achievable. Digital Services Taxes imposed by the UK, France, and others served as interim measures that maintained pressure for a multilateral solution.<br><br>France's Digital Services Tax (3% on digital revenue above €750M globally) has been in force since 2019. The EU's implementation of Pillar Two through the 2022 Minimum Tax Directive demonstrates enforcement architecture. The Organisation for Economic Co-operation and Development's Pillar One work on profit reallocation provides the nexus rule architecture needed for AI-specific attribution. The implementation challenge is definitional precision: narrowing the AI profit definition to prevent gaming while capturing concentrated value creation in AI-intensive firms.",
    feasibility:"The Organisation for Economic Co-operation and Development Pillar Two global minimum tax of 15 percent was agreed by 136 countries in 2021 and is now entering implementation. The administrative architecture exists. An artificial-intelligence-specific pillar would extend an established framework. France's Digital Services Tax of 3 percent on digital revenue has been in force since 2019 as an interim measure. The harder constraint is definitional: how is artificial-intelligence-derived profit isolated for tax purposes?",
    strengths:["The Organisation for Economic Co-operation and Development Pillar Two demonstrates that coordinated international tax enforcement is achievable.","Artificial-intelligence companies' nexus to high-tax economies, including data, talent, and infrastructure, is well-documented.","Pairs with national-level taxes such as {{pol:automation-levy|automation levy}} and {{pol:wealth-tax|wealth tax}} for a layered approach.","Compliance infrastructure already exists in jurisdictions aligned with the Organisation for Economic Co-operation and Development."],
    risks:["Definitional precision is the binding constraint. Narrowing the meaning of artificial-intelligence profit without gaming opportunities is hard.","United States participation has been politically contested. The framework's domestic implementation faced Congressional resistance.","Industry can restructure to shift attributable activities.","Smaller jurisdictions may resist losing tax-haven competitive position."],
    landscape:"Organisation for Economic Co-operation and Development Pillar Two implementation is underway in the European Union under the 2022 Minimum Tax Directive, and in the United Kingdom, Australia, and Japan. United States domestic implementation is contested. France's Digital Services Tax has bipartisan French support. An artificial-intelligence-specific extension has not yet been formally proposed but is under study. Republican opposition to participation in the framework has been durable.",
    press:[],
    paperIds: [256], pairsWith:[], competesWith:[{id:"automation-levy",why:"A domestic levy versus internationally coordinated taxation of the same AI profits."},{id:"wealth-tax",why:"Domestic wealth taxation versus a multilateral minimum, overlapping claims on concentrated AI capital."}], lastReviewed:"2026-06-23" },
  { id:"wealth-tax", level:"transformational", category:"tax-wealth",
    title:"Wealth Tax on AI-Derived Gains",
    summary:"Annual tax on net wealth above a threshold, with provisions specifically targeting AI-concentrated capital gains in equity holdings and AI intellectual property, to fund social spending and reduce wealth concentration.<br><br>The tax would apply at 1% on net wealth between $10M and $50M, 2% on wealth between $50M and $1B, and 3% on wealth above $1B, with enhanced rates on equity stakes in AI-intensive firms and AI intellectual property above $100M. Mark-to-market valuation of public equities would eliminate the deferral advantage that currently allows large wealth holders to avoid capital gains tax on unrealized appreciation. Estimated revenue at full implementation: $200–300B annually.",
    rationale:"If AI concentrates capital income dramatically, income and consumption taxes alone cannot prevent extreme inequality. A wealth tax addresses the accumulation mechanism directly, generating revenue proportional to AI's wealth-concentrating effects.<br><br>Income and consumption taxes are flow taxes: they tax what enters the stream each year. Wealth concentration occurs because capital compounds faster than flows can be taxed. AI accelerates this dynamic by concentrating productive assets in equity stakes that appreciate enormously before any tax event is triggered. A wealth tax addresses the stock rather than the flow, and scales proportionally with AI-driven appreciation. It also restores the link between economic power and public contribution that extreme wealth concentration severs.",
    precedent:"Spain's annual wealth tax and Switzerland's cantonal wealth taxes have been in continuous operation for decades. Senator Warren's Ultra-Millionaire Tax proposal (2% on wealth above $50M) has been independently scored by economists Saez and Zucman, who estimated approximately $2.75–3 trillion in revenue over 10 years from the 2021 Senate bill version. International Monetary Fund research confirms wealth taxes are administratively feasible at moderate rates.<br><br>Norway's wealth tax (currently 1.0% on net wealth above approximately $160,000, with a higher rate of 1.1% on wealth above ~$1.9M USD) was increased in 2022 in response to rising inequality. Switzerland's cantonal and municipal wealth taxes (there is no federal wealth tax) generate approximately 4% of total Swiss tax revenue across all levels of government, the highest such share among wealthy democracies. The primary administrative challenge is international information sharing, now substantially addressed by the Organisation for Economic Co-operation and Development's Common Reporting Standard.",
    feasibility:"Spain's annual wealth tax and Switzerland's cantonal wealth taxes have decades of administrative precedent. Switzerland's generates roughly four percent of total tax revenue across all levels of government. United States implementation faces constitutional questions under the direct-tax apportionment requirement, possibly resolved by the scope of the Sixteenth Amendment. Senator Warren's Ultra-Millionaire Tax has been scored by Saez and Zucman at substantial multi-trillion revenue over ten years.",
    strengths:["Addresses stock rather than flow. Targets the accumulation mechanism that compounds wealth concentration.","International precedent exists in Spain, Switzerland, and Norway.","Saez and Zucman scoring suggests substantial revenue at moderate rates.","Public opinion polling shows persistent support for wealth taxes at the very top."],
    risks:["Constitutional challenge under Article I, Section 9, the direct-tax apportionment clause. Legal scholars disagree on resolution.","Valuation of illiquid assets, including private equity and intellectual property, is administratively complex.","Wealth-tax flight. Norway's 2022 rate increase produced documented relocations to lower-tax jurisdictions, though the magnitude of the effect is contested.","International information-sharing infrastructure, including the Organisation for Economic Co-operation and Development Common Reporting Standard, is necessary. Gaps in coverage create avoidance opportunities."],
    landscape:"Senator Warren's Ultra-Millionaire Tax is the leading United States legislative vehicle. Senator Sanders has proposed adjacent variants. Republican opposition is near-uniform. Bipartisan agreement exists only on specific anti-avoidance measures. France repealed its wealth tax in 2017 over capital flight concerns, though the data on flight magnitude is contested.",
    press:[{label:"Saez & Zucman — Wealth Tax Scoring",url:"https://eml.berkeley.edu/~saez/saez-zucmanNTJ19wealth.pdf"}],
    pairsWith:[{id:"sovereign-wealth-fund",why:"A wealth tax on AI-derived gains can seed the fund, tying the accumulation vehicle to a revenue source."}], competesWith:[{id:"automation-levy",why:"Both tax AI-driven capital gains, competing for the same tax base and legislative vehicle."},{id:"global-min-tax",why:"Domestic wealth taxation versus a multilateral minimum, overlapping claims on concentrated AI capital."}], lastReviewed:"2026-06-23"   },
];

// ── Cross-view category mappings ─────────────────────────────
// Maps each research category → the single most relevant policy category (or null)
const RESEARCH_TO_POL_CAT = {
  'labor':            'labor-rights',
  'workers':          'labor-rights',
  'hiring':           'labor-rights',
  'equity':           'labor-rights',
  'surveillance':     'labor-rights',
  'datarights':       'labor-rights',
  'corporate':        'antitrust',
  'macro':            'safety-net',
  'education':        'education',
  'community':        'housing',
  'wellbeing':        'work-structure',
  'policy':           null,
  'criminal-justice': null,
  'environment':      null,
};

// Maps each policy category → list of research categories that inform it
const POL_TO_RESEARCH_CATS = {
  'safety-net':    ['labor', 'macro', 'wellbeing', 'policy'],
  'labor-rights':  ['labor', 'workers', 'hiring', 'surveillance', 'equity', 'criminal-justice', 'datarights'],
  'tax-wealth':    ['macro', 'corporate'],
  'healthcare':    ['wellbeing', 'workers'],
  'work-structure':['workers', 'wellbeing', 'labor'],
  'education':     ['education', 'workers'],
  'antitrust':     ['corporate', 'macro', 'criminal-justice'],
  'housing':       ['community', 'macro'],
  'jobs':          ['labor', 'macro', 'community'],
  'international': ['macro', 'policy', 'datarights'],
};

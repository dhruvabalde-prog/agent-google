const fs = require('fs');
const path = require('path');

const SKILLS_DATA = [
  // ==========================================
  // CATEGORY 1: SELF - HEALTH, VITALITY & LONGEVITY (Skills 1-15)
  // ==========================================
  {
    num: 1,
    id: "annual-preventive-health-blueprint",
    name: "Annual Preventive Health Checkup Blueprint",
    department: "Self: Health, Vitality & Preventive Longevity",
    description: "Curates, schedules, and tracks comprehensive age-appropriate diagnostic screenings, cancer screenings, and metabolic panels to detect risks years before symptoms arise.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Current Age Group",
        prompt: "What is your current age category?",
        options: [
          "[A] 20 - 34 years",
          "[B] 35 - 49 years",
          "[C] 50 - 64 years",
          "[D] 65+ years"
        ]
      },
      {
        title: "Family Medical History",
        prompt: "Are any of these prevalent in your immediate family?",
        options: [
          "[A] Cardiovascular / Early Heart Attack",
          "[B] Diabetes / Metabolic Syndrome",
          "[C] Cancer (Breast, Colon, Prostate)",
          "[D] None / Not Sure"
        ]
      }
    ],
    parameters: [
      { name: "{{AGE_GROUP}}", description: "Age category of the user", validChoices: "20-34 / 35-49 / 50-64 / 65+", defaultFallback: "35-49 years" },
      { name: "{{PRIORITY_PANEL}}", description: "Target blood and diagnostic panels", validChoices: "Cardiac, Lipid, HbA1c, Thyroid, Cancer screening", defaultFallback: "Comprehensive Executive Health Panel" }
    ],
    workflow: [
      "Analyze age group and family history risks against clinical preventive guidelines.",
      "Search internet for top accredited diagnostic centers or hospital packages near the user.",
      "Generate a customized Google Doc listing essential tests (ApoB, Lp(a), HbA1c, Liver, Renal, Ultrasound, Colonoscopy/Mammogram if applicable).",
      "Schedule recommended dates into Google Calendar and create prep tasks in Google Tasks.",
      "Provide clean file link and actionable booking checklist."
    ],
    guardrails: [
      "Medical Disclaimer: Life OS provides screening guidelines and organization, not direct medical diagnosis. Consult a physician for diagnostic evaluation.",
      "Ensure fast-tracking instructions (e.g. 10-12 hour fasting protocols) are highlighted in the generated checklist."
    ]
  },
  {
    num: 2,
    id: "sleep-circadian-architecture",
    name: "Sleep Optimization & Circadian Architecture",
    department: "Self: Health, Vitality & Preventive Longevity",
    description: "Audits sleep latency, wake restlessness, light exposure, and evening wind-down habits to build an unshakeable deep-sleep recovery routine.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Primary Sleep Disruption",
        prompt: "What is your main struggle with sleep?",
        options: [
          "[A] Falling asleep (racing mind / latency > 30 mins)",
          "[B] Waking up at 2-4 AM and unable to return to sleep",
          "[C] Poor sleep quality / waking up unrefreshed",
          "[D] Inconsistent sleep and wake schedule"
        ]
      },
      {
        title: "Caffeine & Screen Cutoff",
        prompt: "When is your typical last coffee and screen exposure?",
        options: [
          "[A] Coffee after 2 PM; screens in bed",
          "[B] Coffee before noon; screens until bedtime",
          "[C] Controlled caffeine; blue-light glasses used",
          "[D] No caffeine; minimal evening screens"
        ]
      }
    ],
    parameters: [
      { name: "{{CHRONOTYPE}}", description: "Lark, Third Bird, or Night Owl", validChoices: "Morning / Intermediate / Evening", defaultFallback: "Intermediate" }
    ],
    workflow: [
      "Assess chronotype and sleep debt from user answers.",
      "Formulate a customized 90-minute evening wind-down and morning circadian alignment protocol.",
      "Create Google Calendar recurring blocks for morning sunlight viewing, caffeine cutoff, and digital sunset.",
      "Draft an actionable Google Sheet sleep tracker to monitor sleep score and latency."
    ],
    guardrails: [
      "Rule out obstructive sleep apnea (OSA) if loud snoring or gasping is reported; advise clinical sleep study.",
      "Never prescribe prescription sedative sleep medications."
    ]
  },
  {
    num: 3,
    id: "biomarker-blood-work-interpreter",
    name: "Personalized Biomarker & Lab Report Organizer",
    department: "Self: Health, Vitality & Preventive Longevity",
    description: "Translates complex blood test numbers (Lipid profile, ApoB, HbA1c, Vitamin D, B12, Liver function, Ferritin) into clear health trends and doctor discussion points.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Report Focus",
        prompt: "Which lab report category are you organizing?",
        options: [
          "[A] Lipid Profile & Cardiac Risk (Cholesterol, ApoB, Triglycerides)",
          "[B] Metabolic & Blood Sugar (HbA1c, Fasting Insulin, Glucose)",
          "[C] Complete Blood Count, Vitamins (D3, B12) & Minerals",
          "[D] Liver & Kidney Function Panels"
        ]
      }
    ],
    parameters: [
      { name: "{{LAB_METRICS}}", description: "Key lab values to track", validChoices: "ApoB, LDL-C, Triglycerides, HbA1c, AST, ALT, eGFR", defaultFallback: "Comprehensive Panel" }
    ],
    workflow: [
      "Extract biomarkers and reference ranges from user input or attached lab document.",
      "Build a longitudinal Google Sheet tracking lab values across years to visualize trajectory.",
      "Generate a 1-page Google Doc summary with plain-English explanations and specific questions for the user's doctor.",
      "Add calendar reminder for the follow-up review."
    ],
    guardrails: [
      "Always clarify that reference ranges vary by lab methodology.",
      "Strictly format questions for the doctor rather than providing independent medical prognosis."
    ]
  },
  {
    num: 4,
    id: "sustainable-nutrition-meal-architecture",
    name: "Executive Nutrition & Meal Planning Architecture",
    department: "Self: Health, Vitality & Preventive Longevity",
    description: "Designs whole-food, high-protein meal blueprints tailored to tight work schedules, business travel, and local grocery availability.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Dietary Preference",
        prompt: "What is your primary dietary style?",
        options: [
          "[A] Vegetarian / Plant-Forward",
          "[B] Eggetarian / Flexitarian",
          "[C] Non-Vegetarian / High-Protein Omnivore",
          "[D] Vegan / Dairy-Free"
        ]
      },
      {
        title: "Daily Cooking Bandwidth",
        prompt: "How is your household meal preparation managed?",
        options: [
          "[A] Cook daily myself (< 30 minutes)",
          "[B] Cook on weekends (batch prep & freeze)",
          "[C] Cook / Domestic help prepares meals",
          "[D] Frequent dining out / food delivery"
        ]
      }
    ],
    parameters: [
      { name: "{{DAILY_PROTEIN_TARGET}}", description: "Protein target in grams", validChoices: "80g / 100g / 120g / 140g+", defaultFallback: "100g" }
    ],
    workflow: [
      "Calculate macro guidelines based on body stats and daily activity.",
      "Design a 7-day rotational meal plan using culturally familiar, easily accessible ingredients.",
      "Generate a Google Sheet containing the weekly grocery shopping list categorized by aisle/section.",
      "Compile recipe cards into a clean Google Doc."
    ],
    guardrails: [
      "Avoid restrictive crash diets or extreme caloric deficits.",
      "Account for food allergies and intolerances before finalizing grocery lists."
    ]
  },
  {
    num: 5,
    id: "stress-burnout-cortisol-reset",
    name: "Stress, Burnout & Nervous System Reset Protocol",
    department: "Self: Health, Vitality & Preventive Longevity",
    description: "Identifies cognitive overload triggers, breaks chronic sympathetic nervous system activation, and creates protective boundaries in high-pressure careers.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Burnout Severity",
        prompt: "Which description best matches your current state?",
        options: [
          "[A] Mild fatigue: productive but drained by end of day",
          "[B] Moderate exhaustion: irritable, dreading mornings, brain fog",
          "[C] Severe burnout: cynical, detached, sleep disrupted, physical aches",
          "[D] Acute crisis: unable to concentrate, panic episodes"
        ]
      },
      {
        title: "Primary Stress Driver",
        prompt: "What is the single biggest stress amplifier?",
        options: [
          "[A] Work volume & unrealistic executive deadlines",
          "[B] Toxic workplace politics / demanding manager",
          "[C] Family caregiving & financial strain",
          "[D] Inability to disconnect from phone & Slack"
        ]
      }
    ],
    parameters: [
      { name: "{{RESET_MODE}}", description: "De-escalation protocol", validChoices: "Micro-breaks, Boundary contracts, Workload reduction", defaultFallback: "Restorative Boundary Architecture" }
    ],
    workflow: [
      "Identify the user's top energy leaks and boundary breaches.",
      "Formulate a non-negotiable Daily Decompression Checklist (physiological sigh, 20-min digital silence, walk).",
      "Draft boundary scripts in Google Docs for declining non-essential tasks diplomatically.",
      "Create Google Calendar 'Deep Recovery' blocks protected from meeting invites."
    ],
    guardrails: [
      "If severe clinical depression or acute crisis is detected, provide immediate mental health helpline resources.",
      "Emphasize structural life changes over superficial relaxation hacks."
    ]
  },
  {
    num: 6,
    id: "ergonomics-posture-chronic-pain-rehab",
    name: "Desk Ergonomics & Chronic Pain Prevention",
    department: "Self: Health, Vitality & Preventive Longevity",
    description: "Eliminates tech neck, lower back stiffness, and repetitive strain through personalized desk setups, mobility snack routines, and posture corrections.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Pain or Discomfort Hotspot",
        prompt: "Where do you experience the most strain?",
        options: [
          "[A] Neck & Upper Trapezius (Tech neck)",
          "[B] Lower Back & Sacroiliac joint",
          "[C] Wrists, Elbows & Forearms (Carpal tunnel / RSI)",
          "[D] Hip flexor tightness & Glute amnesia"
        ]
      }
    ],
    parameters: [
      { name: "{{DESK_TYPE}}", description: "Standing desk or traditional sitting desk", validChoices: "Sit-Stand / Fixed Sit / Laptop only", defaultFallback: "Fixed Sit with Laptop" }
    ],
    workflow: [
      "Analyze current workstation geometry (monitor eye level, arm angle, lumbar support).",
      "Produce a 1-page Workstation Optimization Guide in Google Docs with exact equipment height adjustments.",
      "Schedule recurring 3-minute 'Mobility Snacks' every 90 minutes in Google Calendar.",
      "Deliver links to recommended ergonomic accessories (laptop stand, external keyboard, lumbar cushion)."
    ],
    guardrails: [
      "Advise physical therapy evaluation for radiating nerve pain, numbness, or tingling.",
      "Discourage prolonged static standing without anti-fatigue matting."
    ]
  },
  {
    num: 7,
    id: "medication-supplement-interaction-audit",
    name: "Medication & Supplement Interaction Audit",
    department: "Self: Health, Vitality & Preventive Longevity",
    description: "Organizes prescription schedules, checks nutrient timing (empty stomach vs with fats), and flags potential supplement-drug interactions.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Regimen Complexity",
        prompt: "How many daily medications or supplements do you take?",
        options: [
          "[A] 1 - 2 basic vitamins (D3, Omega-3)",
          "[B] 3 - 5 pills (Vitamins + 1-2 prescriptions)",
          "[C] 6+ complex stack (Prescriptions, herbs, nootropics)",
          "[D] Just starting a new prescribed course"
        ]
      }
    ],
    parameters: [
      { name: "{{TIMING_OPTIMIZATION}}", description: "Morning vs Evening scheduling", validChoices: "Morning with fat, Evening with magnesium, Split dose", defaultFallback: "Chronobiological Timing" }
    ],
    workflow: [
      "Review current supplement and medication list against pharmacological timing principles.",
      "Research established contraindications (e.g. Iron vs Calcium competition, St John's Wort interactions).",
      "Construct a clean Google Sheet schedule organizing morning, mid-day, and bedtime pills.",
      "Set up recurring reminders in Google Tasks with dosage notes."
    ],
    guardrails: [
      "Strictly instruct user to confirm any supplement additions with their prescribing physician.",
      "Never suggest discontinuing or altering prescription drug dosages."
    ]
  },
  {
    num: 8,
    id: "mental-fitness-cognitive-hygiene",
    name: "Mental Fitness & Cognitive Hygiene Protocol",
    department: "Self: Health, Vitality & Preventive Longevity",
    description: "Develops mental agility, emotional resilience, daily journaling practices, and deliberate friction against compulsive smartphone scrolling.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Screen Time Exposure",
        prompt: "What is your average daily phone screen time?",
        options: [
          "[A] Under 2.5 hours",
          "[B] 3 - 5 hours",
          "[C] 5 - 7 hours",
          "[D] 7+ hours"
        ]
      }
    ],
    parameters: [
      { name: "{{DIGITAL_FRICTION}}", description: "Friction tools applied", validChoices: "Grayscale mode, App timers, Notification purge", defaultFallback: "Comprehensive Notification Diet" }
    ],
    workflow: [
      "Audit daily dopamine-depleting habits and cognitive fragmented attention.",
      "Generate a customized Digital Hygiene Guide in Google Docs detailing app removal and notification rules.",
      "Create a structured 5-minute Morning Intent & Evening Reflection template in Google Docs.",
      "Set daily reminders in Google Tasks for intentional reflection."
    ],
    guardrails: [
      "Ensure the plan creates realistic gradual habits rather than unsustainable sudden purges.",
      "Respect work communication requirements while designing friction."
    ]
  },
  {
    num: 9,
    id: "habit-stacking-behavioral-architecture",
    name: "Habit Stacking & Behavioral Architecture",
    department: "Self: Health, Vitality & Preventive Longevity",
    description: "Builds atomic daily micro-habits anchored to existing routines to guarantee long-term adherence without relying on fleeting willpower.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Target Habit Category",
        prompt: "What habit are you trying to build or solidify?",
        options: [
          "[A] Physical fitness / Daily mobility / 10k steps",
          "[B] Reading books / Focused learning (30 mins daily)",
          "[C] Meditation / Breathwork / Mindfulness",
          "[D] Hydration & Whole-food nutrition"
        ]
      }
    ],
    parameters: [
      { name: "{{ANCHOR_HABIT}}", description: "Existing established routine", validChoices: "Morning coffee, Brushing teeth, Commute, Entering home", defaultFallback: "Morning Coffee Routine" }
    ],
    workflow: [
      "Map out the user's existing non-negotiable daily anchors.",
      "Design 2-minute micro-habits stacked directly after established cues.",
      "Generate a 30-day Habit Tracking Spreadsheet in Google Sheets with automatic streak visualization.",
      "Create Google Calendar cue prompts."
    ],
    guardrails: [
      "Limit to maximum 2 new habits simultaneously to avoid cognitive overload.",
      "Enforce the 'Never miss twice' recovery rule."
    ]
  },
  {
    num: 10,
    id: "fitness-strength-time-constrained",
    name: "Time-Constrained Strength & Conditioning Blueprint",
    department: "Self: Health, Vitality & Preventive Longevity",
    description: "Designs ultra-efficient 30-45 minute compound strength routines (2-3x weekly) and cardiovascular zone-2 protocols for busy adults.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Training Location & Equipment",
        prompt: "Where will you be training?",
        options: [
          "[A] Commercial Gym (Full barbells, dumbbells, machines)",
          "[B] Home Gym (Dumbbells, resistance bands, pull-up bar)",
          "[C] Bodyweight only / Calisthenics at home or park",
          "[D] Hotel gyms during frequent business travel"
        ]
      },
      {
        title: "Available Days per Week",
        prompt: "How many days can you realistically commit to 35-45 minutes?",
        options: [
          "[A] 2 days per week (Full body)",
          "[B] 3 days per week (Full body / Push-Pull-Legs)",
          "[C] 4 days per week (Upper / Lower split)",
          "[D] 5+ days (Short daily sessions)"
        ]
      }
    ],
    parameters: [
      { name: "{{FITNESS_LEVEL}}", description: "Beginner, Intermediate, or Advanced", validChoices: "Beginner / Intermediate / Advanced", defaultFallback: "Intermediate" }
    ],
    workflow: [
      "Select high-yield compound movement patterns (Squat, Hinge, Push, Pull, Carry).",
      "Structure an exercise schedule balancing progressive overload with joint longevity.",
      "Generate an editable Google Sheet workout log with exercise video reference links.",
      "Populate Google Calendar with designated training blocks."
    ],
    guardrails: [
      "Prioritize form over load; incorporate dynamic warmups to protect tendons.",
      "Recommend consulting an orthopedist if recovering from previous injuries."
    ]
  },
  {
    num: 11,
    id: "medical-second-opinion-navigator",
    name: "Medical Second Opinion & Diagnostic Pathway Navigator",
    department: "Self: Health, Vitality & Preventive Longevity",
    description: "Prepares patient dossiers, organizes diagnostic imaging, and structures clinical questions when facing a major surgical or medical diagnosis.",
    enabled: true,
    allowedTiers: ["INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Diagnosis Urgency",
        prompt: "What is the time sensitivity of the decision?",
        options: [
          "[A] Non-urgent / Elective procedure scheduled weeks away",
          "[B] Moderate / Decision required within 7-14 days",
          "[C] Time-sensitive / Need specialist consultation within 48-72 hours",
          "[D] Post-procedure review / Unclear pathology results"
        ]
      }
    ],
    parameters: [
      { name: "{{CLINICAL_SPECIALTY}}", description: "Medical department involved", validChoices: "Cardiology, Oncology, Orthopedics, Neurology, Gastroenterology", defaultFallback: "Internal Medicine Specialist" }
    ],
    workflow: [
      "Synthesize existing medical summary and key diagnostic findings into a chronological timeline.",
      "Search accredited academic medical institutions and senior specialist registries.",
      "Generate a 2-page Clinical Briefing Dossier in Google Docs with 10 specific questions to ask the second-opinion specialist.",
      "Draft email to request DICOM imaging files and lab records from the primary hospital."
    ],
    guardrails: [
      "Always advise patients not to postpone emergency care for a second opinion.",
      "Strictly safeguard medical privacy and anonymize identifiable data in research prompts."
    ]
  },
  {
    num: 12,
    id: "preventive-vision-dental-safeguard",
    name: "Preventive Vision, Dental & Sensory Care Safeguard",
    department: "Self: Health, Vitality & Preventive Longevity",
    description: "Establishes proactive inspection schedules for optical health (glaucoma, retinal health, blue light) and dental hygiene to prevent systemic inflammation.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Last Professional Dental Cleaning",
        prompt: "When did you last visit a dentist for scaling and polishing?",
        options: [
          "[A] Within the last 6 months",
          "[B] 6 - 12 months ago",
          "[C] Over 1 year ago",
          "[D] Over 3 years ago"
        ]
      }
    ],
    parameters: [
      { name: "{{VISION_SYMPTOMS}}", description: "Screen fatigue, dry eyes, refractive changes", validChoices: "Dry eyes, Night glare, Computer vision strain, Normal", defaultFallback: "Computer Vision Strain" }
    ],
    workflow: [
      "Assess risk factors for periodontal inflammation and digital screen eye strain.",
      "Draft a 20-20-20 visual rest guideline and oral care regimen in Google Docs.",
      "Generate Google Calendar recurring events for bi-annual dental prophylaxis and annual comprehensive dilated eye exams.",
      "Compile local top-rated ophthalmologists and periodontists."
    ],
    guardrails: [
      "Urge immediate emergency ophthalmology care if sudden flashes or floaters occur (retinal detachment warning)."
    ]
  },
  {
    num: 13,
    id: "executive-sabbatical-rejuvenation-roadmap",
    name: "Executive Sabbatical & Deep Rejuvenation Roadmap",
    department: "Self: Health, Vitality & Preventive Longevity",
    description: "Plans professional leave, sabbatical funding, psychological decoupling, and restorative travel itineraries for senior leaders needing full renewal.",
    enabled: true,
    allowedTiers: ["ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Sabbatical Duration",
        prompt: "What is your target time away from professional duties?",
        options: [
          "[A] 2 - 4 weeks (Deep Reset)",
          "[B] 1 - 3 months (Extended Sabbatical)",
          "[C] 6 - 12 months (Full Career Pause)",
          "[D] Mini-retirements (1 week every quarter)"
        ]
      }
    ],
    parameters: [
      { name: "{{FUNDING_BUFFER}}", description: "Pre-allocated living expense runway", validChoices: "3 months / 6 months / 12 months / Company paid", defaultFallback: "6 months liquid runway" }
    ],
    workflow: [
      "Map out financial runway and transition milestones in a Google Sheet model.",
      "Draft workplace delegation charters and out-of-office contingency protocols in Google Docs.",
      "Curate wellness and cultural immersive retreat itineraries through real-time web research.",
      "Structure re-entry milestones 30 days prior to return."
    ],
    guardrails: [
      "Ensure medical insurance coverage remains active throughout the sabbatical period.",
      "Structure clear boundaries against checking work communications during the leave."
    ]
  },
  {
    num: 14,
    id: "daily-energy-chronotype-scheduler",
    name: "Daily Energy & Chronotype Scheduling Optimizer",
    department: "Self: Health, Vitality & Preventive Longevity",
    description: "Aligns your hardest cognitive work, strategic decisions, meetings, and physical workouts to your biological circadian energy peaks and troughs.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Peak Mental Clarity Window",
        prompt: "When is your brain sharpest for deep thinking?",
        options: [
          "[A] Early Morning (6 AM - 10 AM)",
          "[B] Mid-Morning to Noon (10 AM - 1 PM)",
          "[C] Late Afternoon (3 PM - 6 PM)",
          "[D] Late Night (9 PM - midnight)"
        ]
      }
    ],
    parameters: [
      { name: "{{ENERGY_SLUMP_TIME}}", description: "Usual afternoon dip", validChoices: "1 PM - 3 PM / 2 PM - 4 PM / None", defaultFallback: "2 PM - 3:30 PM" }
    ],
    workflow: [
      "Map user's peak focus windows, shallow work windows, and trough recovery zones.",
      "Re-organize Google Calendar events: block focus time during peak windows; push administrative meetings to trough periods.",
      "Provide a 1-page Chrono-Working Blueprint in Google Docs with nutrition and hydration anchors."
    ],
    guardrails: [
      "Maintain realistic flex room for cross-timezone stakeholder demands."
    ]
  },
  {
    num: 15,
    id: "annual-mental-health-review",
    name: "Annual Mental Health & Emotional Well-being Review",
    department: "Self: Health, Vitality & Preventive Longevity",
    description: "Conducts an annual self-assessment of psychological safety, relationship quality, emotional regulation, and professional fulfillment.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Emotional Equilibrium",
        prompt: "How would you rate your emotional stability and joy over the past 12 months?",
        options: [
          "[A] High: flourishing, content, resilient",
          "[B] Moderate: managing daily life, but frequent low-grade anxiety",
          "[C] Low: feeling stuck, emotionally exhausted, or detached",
          "[D] Volatile: major life transitions disrupting balance"
        ]
      }
    ],
    parameters: [
      { name: "{{SUPPORT_NETWORK}}", description: "Availability of trusted confidants or therapists", validChoices: "Strong / Moderate / Limited", defaultFallback: "Moderate" }
    ],
    workflow: [
      "Guide user through a structured 7-dimension life review in Google Docs.",
      "Highlight blind spots in emotional processing and relationship depth.",
      "Generate an action plan with quarterly wellness check-ins in Google Calendar.",
      "Provide vetted directory of licensed therapists and executive coaches."
    ],
    guardrails: [
      "Include crisis support hotlines prominently.",
      "Maintain zero-knowledge confidentiality for all emotional entries."
    ]
  },

  // ==========================================
  // CATEGORY 2: SELF - WEALTH & FINANCIAL SECURITY (Skills 16-30)
  // ==========================================
  {
    num: 16,
    id: "parents-health-insurance-architect",
    name: "Health Insurance Policy for Aging Parents",
    department: "Home & Family: Eldercare, Aging Parents & Medical Guardianship",
    description: "Evaluates comprehensive health cover for parents (60-80+ yrs) with rigorous pre-existing condition disclosure safeguards, room-rent cap elimination, and super top-up architecture.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Parents' Current Age",
        prompt: "What are your parents' current ages?",
        options: [
          "[A] Mother & Father both under 60",
          "[B] Between 60 and 69 years",
          "[C] 70 years or older"
        ]
      },
      {
        title: "Pre-existing Medical History",
        prompt: "Do either of your parents have diagnosed conditions (Diabetes, Hypertension, Cardiac, Thyroid, Prior Surgeries)?",
        options: [
          "[A] No known chronic conditions",
          "[B] Common lifestyle conditions (BP / Type-2 Diabetes / Thyroid)",
          "[C] Prior major surgery / Stents / Cardiac / Cancer history",
          "[D] Unsure / Need guidance on medical checkup prior to policy"
        ]
      },
      {
        title: "Current Health Coverage",
        prompt: "What health insurance do they currently have?",
        options: [
          "[A] None (Relying solely on savings)",
          "[B] Covered under my corporate employer group policy only",
          "[C] Old retail policy with small sum insured (< ₹5L / $10k)",
          "[D] Independent policy that is getting too expensive to renew"
        ]
      }
    ],
    parameters: [
      { name: "{{PARENT_AGE_SLAB}}", description: "Age slab for underwriting", validChoices: "<60 / 60-70 / 70+", defaultFallback: "60-70" },
      { name: "{{PRE_EXISTING_STATUS}}", description: "Disclosure details", validChoices: "None / Hypertension & Diabetes / Major Cardiac / Renal", defaultFallback: "Hypertension & Diabetes" },
      { name: "{{TARGET_COVERAGE}}", description: "Target base + super top-up coverage", validChoices: "₹15 Lakhs / ₹25 Lakhs / ₹50 Lakhs / $250,000+", defaultFallback: "₹25 Lakhs Base + Super Top-Up" }
    ],
    workflow: [
      "Analyze parents' age and declared health conditions to filter senior-friendly insurers with low claim rejection ratios.",
      "Conduct live market research on top retail plans without room rent sub-limits and minimal co-payment clauses.",
      "Model a cost-effective 2-tier architecture (Base Sum Insured ₹5-10L + High Deductible Super Top-up ₹20-50L) in Google Sheets.",
      "Generate an Executive Policy Comparison Document in Google Docs detailing waiting periods, day-care procedures, and cashless hospital network density near parents' residence.",
      "Draft a Medical History Disclosure Checklist ensuring every past consultation, prescription, and surgery is declared to prevent claim repudiation."
    ],
    guardrails: [
      "CRITICAL RULE: Always enforce full voluntary disclosure of all pre-existing diseases (PED). Non-disclosure is the #1 reason insurers legally reject senior citizen claims after years of accepting premiums.",
      "Warn strongly against policies with 'Room Rent Capping' (e.g. 1% of Sum Insured) because insurers apply proportionate deductions to the entire hospital bill.",
      "Check 24-month vs 36-month vs 48-month waiting periods for pre-existing diseases."
    ]
  },
  {
    num: 17,
    id: "emergency-fund-liquidity-fortress",
    name: "Emergency Fund & Cash Flow Liquidity Fortress",
    department: "Self: Wealth, Financial Security & Independence",
    description: "Calculates true monthly burn rate, models catastrophic contingencies (job loss, medical deductible), and structures a tiered, inflation-hedged emergency reserve.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Monthly Household Burn Rate",
        prompt: "What is your total non-negotiable monthly outflow (Rent/EMI, groceries, bills, insurance, school)?",
        options: [
          "[A] Under ₹50,000 / $2,000 per month",
          "[B] ₹50,000 - ₹1,50,000 / $2,000 - $5,000 per month",
          "[C] ₹1,50,000 - ₹3,00,000 / $5,000 - $10,000 per month",
          "[D] ₹3,00,000+ / $10,000+ per month"
        ]
      },
      {
        title: "Income Stability & Dependents",
        prompt: "How stable is your household income and how many people rely on it?",
        options: [
          "[A] Single earner, volatile / variable commission / freelancing / startup",
          "[B] Single earner, stable salaried corporate job with dependents",
          "[C] Dual income, no dependents (DINK)",
          "[D] Dual income with children and dependent elderly parents"
        ]
      }
    ],
    parameters: [
      { name: "{{TARGET_RUNWAY_MONTHS}}", description: "Emergency fund months", validChoices: "3 months / 6 months / 9 months / 12 months", defaultFallback: "6 months" }
    ],
    workflow: [
      "Calculate 6-12 months of mandatory survival expenses based on family dependency structure.",
      "Design a 3-tier liquidity structure in Google Sheets: Tier 1 (1 month in savings/checking), Tier 2 (2 months in liquid mutual funds/short deposits), Tier 3 (3-9 months in high-yield conservative instruments).",
      "Generate an automated monthly savings allocation plan in Google Docs.",
      "Set quarterly review reminders in Google Calendar."
    ],
    guardrails: [
      "Never invest emergency funds in volatile equities or locked illiquid schemes.",
      "Ensure fast 24-hour instant ATM/UPI withdrawal access for Tier 1."
    ]
  },
  {
    num: 18,
    id: "pure-term-life-insurance-architect",
    name: "Pure Term Life Insurance & Human Life Value Calculator",
    department: "Self: Wealth, Financial Security & Independence",
    description: "Calculates precise Human Life Value (HLV) to protect family dependents with high-cover pure term insurance, avoiding high-fee endowment and ULIP traps.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Current Annual Income & Liabilities",
        prompt: "What is your gross annual income and total debt (Home loan, car loan)?",
        options: [
          "[A] Income < ₹15L / $50k | Debts < ₹25L / $75k",
          "[B] Income ₹15L - ₹35L / $50k - $120k | Debts ₹25L - ₹75L / $75k - $250k",
          "[C] Income ₹35L - ₹75L / $120k - $250k | Debts ₹75L - ₹1.5Cr / $250k - $500k",
          "[D] Income ₹75L+ / $250k+ | Debts ₹1.5Cr+ / $500k+"
        ]
      },
      {
        title: "Dependents' Milestone Timeline",
        prompt: "How many years until your youngest dependent is financially independent?",
        options: [
          "[A] 10 - 15 years",
          "[B] 15 - 20 years",
          "[C] 20 - 25 years",
          "[D] No immediate financial dependents"
        ]
      }
    ],
    parameters: [
      { name: "{{RECOMMENDED_COVER}}", description: "Human Life Value coverage target", validChoices: "10x income / 15x income / 20x income + liabilities", defaultFallback: "15x annual income + outstanding liabilities" }
    ],
    workflow: [
      "Calculate total required cover using Income Replacement + Outstanding Liabilities + Children's Education goals.",
      "Filter top insurance providers with >98% Claim Settlement Ratios and low claims repudiation.",
      "Generate a Term Insurance Comparison Sheet in Google Sheets analyzing premium costs up to age 60-65.",
      "Draft a policy application checklist in Google Docs emphasizing income proof and truthful lifestyle disclosures (smoking, vaping, hazardous hobbies)."
    ],
    guardrails: [
      "Strictly avoid 'Return of Premium' (TROP) plans which charge 2-3x higher premiums for negligible interest returns.",
      "Insure only until retirement age (60-65); avoid expensive whole-life term insurance (up to age 85-99)."
    ]
  },
  {
    num: 19,
    id: "debt-elimination-interest-optimizer",
    name: "Debt Elimination & Interest Reduction Blueprint",
    department: "Self: Wealth, Financial Security & Independence",
    description: "Ranks mortgages, car loans, personal loans, and credit cards using mathematical Avalanche vs psychological Snowball strategies to eliminate interest drain.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Debt Portfolio Structure",
        prompt: "Which types of debt are currently outstanding?",
        options: [
          "[A] High-interest revolving debt (Credit card balances, personal loans > 14%)",
          "[B] Medium-interest vehicle or student loans (8% - 12%)",
          "[C] Low-interest home loan / mortgage only (< 9%)",
          "[D] Mixed debt portfolio across cards, cars, and home loan"
        ]
      }
    ],
    parameters: [
      { name: "{{PAYOFF_STRATEGY}}", description: "Mathematical Avalanche vs Snowball", validChoices: "Avalanche (Highest Interest First) / Snowball (Smallest Balance First)", defaultFallback: "Avalanche Method" }
    ],
    workflow: [
      "Audit all loan accounts, principal balances, interest rates, and pre-payment penalties in a Google Sheet.",
      "Model monthly pre-payment acceleration and show exact interest savings and months shaved off.",
      "Draft letters for home loan interest rate repricing / balance transfer if market rates dropped.",
      "Set milestone celebratory alerts in Google Calendar."
    ],
    guardrails: [
      "Check for loan foreclosure or pre-payment penalty clauses before making large principal prepayments.",
      "Never exhaust emergency reserves to pay off low-interest secured debt."
    ]
  },
  {
    num: 20,
    id: "tax-optimization-legal-deduction-strategy",
    name: "Tax Optimization & Legal Deductions Strategist",
    department: "Self: Wealth, Financial Security & Independence",
    description: "Maximizes legitimate tax deductions, corporate salary restructuring, capital gains harvesting, and tax-loss offsets under the prevailing tax regime.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Tax Filing Status & Jurisdiction",
        prompt: "What is your primary income structure and tax regime?",
        options: [
          "[A] Salaried Employee (New Tax Regime)",
          "[B] Salaried Employee (Old Tax Regime with HRA, 80C, 80D deductions)",
          "[C] Self-Employed / Professional (Presumptive Taxation 44ADA/44AD)",
          "[D] Business Owner / Corporation with dividend income"
        ]
      }
    ],
    parameters: [
      { name: "{{REGIME_COMPARISON}}", description: "Old vs New regime comparison", validChoices: "Old Regime / New Regime / Both", defaultFallback: "Side-by-side Comparative Analysis" }
    ],
    workflow: [
      "Gather income heads (salary, capital gains, freelance, rental income).",
      "Build a dual-regime tax comparison calculator in Google Sheets comparing Old vs New tax liability.",
      "Identify under-utilized exemptions: NPS (80CCD), Health Insurance (80D), Home loan interest (24b), LTA, meal cards.",
      "Create an end-of-year tax proof submission timeline in Google Calendar."
    ],
    guardrails: [
      "Tax Compliance: All strategies must comply strictly with governing tax statutes; no illegal evasion schemes.",
      "Advise verifying final calculations with a certified chartered accountant or CPA."
    ]
  },
  {
    num: 21,
    id: "retirement-fire-corpus-modeler",
    name: "Retirement Corpus & Financial Independence (FIRE) Modeler",
    department: "Self: Wealth, Financial Security & Independence",
    description: "Calculates future inflation-adjusted living expenses, retirement corpus requirement, safe withdrawal rates (SWR), and monthly investment compounding targets.",
    enabled: true,
    allowedTiers: ["INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Target Retirement Age",
        prompt: "At what age do you want work to become strictly optional?",
        options: [
          "[A] Early FIRE: Before 45 years",
          "[B] Semi-Retirement / Coast-FIRE: 45 - 55 years",
          "[C] Traditional Retirement: 58 - 65 years",
          "[D] Never fully retire, but achieve financial independence"
        ]
      },
      {
        title: "Current Monthly Expenses",
        prompt: "What is your estimated current monthly lifestyle expense (excluding home loan)?",
        options: [
          "[A] ₹50,000 - ₹1,00,000 / $2,000 - $4,000",
          "[B] ₹1,00,000 - ₹2,50,000 / $4,000 - $8,000",
          "[C] ₹2,50,000 - ₹5,00,000 / $8,000 - $15,000",
          "[D] ₹5,00,000+ / $15,000+"
        ]
      }
    ],
    parameters: [
      { name: "{{INFLATION_RATE}}", description: "Assumed long-term inflation rate", validChoices: "5% / 6% / 7% / 8%", defaultFallback: "6.5% for general expenses; 8% for healthcare" },
      { name: "{{SAFE_WITHDRAWAL_RATE}}", description: "Safe withdrawal rate percentage", validChoices: "3% / 3.5% / 4%", defaultFallback: "3.5% conservative withdrawal" }
    ],
    workflow: [
      "Model inflation-adjusted living expenses at retirement age factoring in healthcare cost inflation.",
      "Calculate total target corpus required using conservative safe withdrawal rates (3.5%).",
      "Build a dynamic Google Sheet SIP (Systematic Investment Plan) and asset allocation roadmap.",
      "Generate an executive retirement summary in Google Docs with annual milestone targets."
    ],
    guardrails: [
      "Never assume single-digit inflation for medical and senior healthcare costs (model 8-10% healthcare inflation).",
      "Account for longevity risk (plan cash flow until at least age 90-95)."
    ]
  },
  {
    num: 22,
    id: "investment-portfolio-asset-allocation",
    name: "Asset Allocation & Portfolio Rebalancing Engine",
    department: "Self: Wealth, Financial Security & Independence",
    description: "Designs a low-cost, index-driven asset allocation across Domestic Equity, International Equity, Fixed Income, Gold, and Liquid Cash with disciplined rebalancing triggers.",
    enabled: true,
    allowedTiers: ["INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Risk Tolerance & Time Horizon",
        prompt: "How long is your investment horizon and how do you react to a 20% market dip?",
        options: [
          "[A] Long term (10+ yrs): I stay calm and invest more during dips (Aggressive)",
          "[B] Medium term (5-10 yrs): I feel uncomfortable but hold my investments (Moderate)",
          "[C] Short term (< 5 yrs): Capital preservation is my primary objective (Conservative)",
          "[D] Near retirement: Cannot afford principal loss (Defensive)"
        ]
      }
    ],
    parameters: [
      { name: "{{EQUITY_DEBT_RATIO}}", description: "Target asset allocation ratio", validChoices: "80:20 / 70:30 / 60:40 / 50:50", defaultFallback: "70:30 Equity to Debt" }
    ],
    workflow: [
      "Assess risk profile and time horizon.",
      "Design an optimal portfolio split (e.g. 50% Broad Market Index, 20% Global Equity, 20% Sovereign Debt/Fixed Income, 10% Gold/Arbitrage).",
      "Generate an automated Rebalancing Google Sheet highlighting buy/sell drift triggers (> 5% deviation).",
      "Set bi-annual portfolio review tasks in Google Tasks."
    ],
    guardrails: [
      "Avoid frequent trading or speculative derivative/crypto chasing.",
      "Emphasize low expense ratios (< 0.2% for broad passive index funds)."
    ]
  },
  {
    num: 23,
    id: "real-estate-buy-vs-rent-matrix",
    name: "Real Estate Buy vs. Rent Financial Decision Matrix",
    department: "Self: Wealth, Financial Security & Independence",
    description: "Evaluates the cold mathematical reality of buying a home (EMIs, property taxes, maintenance, illiquidity) vs renting and investing the down payment differential.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Target Property Price & Location",
        prompt: "What is the market purchase price of the property you are evaluating?",
        options: [
          "[A] Under ₹60 Lakhs / $150k",
          "[B] ₹60 Lakhs - ₹1.5 Crore / $150k - $350k",
          "[C] ₹1.5 Crore - ₹3.5 Crore / $350k - $750k",
          "[D] ₹3.5 Crore+ / $750k+"
        ]
      },
      {
        title: "Expected Tenure of Living in Location",
        prompt: "How long do you foresee living in this exact city and neighborhood?",
        options: [
          "[A] Less than 3 years (Likely job or city relocation)",
          "[B] 3 - 7 years (Flexible / Potential relocation)",
          "[C] 7 - 15+ years (Rooted / Permanent family home)",
          "[D] Purely an investment / rental yield property"
        ]
      }
    ],
    parameters: [
      { name: "{{RENTAL_YIELD}}", description: "Residential rental yield of city", validChoices: "2.5% - 3.5% (India metro) / 4% - 6% (US/Europe)", defaultFallback: "3% gross rental yield" }
    ],
    workflow: [
      "Model total cost of ownership (Down payment opportunity cost, EMI interest, registration, maintenance, property taxes).",
      "Compare with renting identical property and investing down payment + EMI differential in diversified equity index funds.",
      "Build a 20-year net worth comparison model in Google Sheets.",
      "Deliver an objective summary in Google Docs balancing emotional security against financial liquidity."
    ],
    guardrails: [
      "Never treat a primary residence as an aggressive liquid investment asset.",
      "Factor in true transaction costs (stamp duty, registration, interior fittings typically add 15-20% to base cost)."
    ]
  },
  {
    num: 24,
    id: "sovereign-estate-will-succession-blueprint",
    name: "Estate Planning: Will, Nomination & Asset Succession Blueprint",
    department: "Self: Wealth, Financial Security & Independence",
    description: "Ensures legal nominees, registered wills, power of attorney, and bank account survivor clauses (E or S) are bulletproof to protect loved ones from probate court disputes.",
    enabled: true,
    allowedTiers: ["INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Current Estate Documents",
        prompt: "What legal succession documentation do you currently have in place?",
        options: [
          "[A] None (No will, haven't verified bank nominees recently)",
          "[B] Nominees updated on bank & demat accounts, but no written will",
          "[C] Informal handwritten will, not witnessed or registered",
          "[D] Formal registered will, but needs updating after life milestones"
        ]
      }
    ],
    parameters: [
      { name: "{{SUCCESSION_JURISDICTION}}", description: "Governing succession act", validChoices: "Indian Succession Act / State Probate Laws / Civil Law", defaultFallback: "Applicable Local Succession Law" }
    ],
    workflow: [
      "Audit all bank accounts, mutual funds, demat holdings, real estate, and life insurance policies for valid nominees.",
      "Explain the critical legal distinction: a nominee is merely a trustee; a legal heir specified in a valid Will holds ultimate ownership.",
      "Generate a standardized, legally robust Will Draft Template in Google Docs with clear asset distribution clauses.",
      "Create a Master 'In Case of Emergency' Asset Directory spreadsheet in Google Sheets.",
      "Set annual review reminders in Google Calendar."
    ],
    guardrails: [
      "Advise having two independent witnesses who are not beneficiaries sign the Will.",
      "Ensure digital assets (email access, crypto seeds, password vault master emergency access) are accounted for securely without exposing raw passwords."
    ]
  },
  {
    num: 25,
    id: "subscription-recurring-leakage-audit",
    name: "Subscription & Recurring Expense Leakage Audit",
    department: "Self: Wealth, Financial Security & Independence",
    description: "Scans credit card and bank statements to hunt down ghost subscriptions, auto-renewals, cloud server costs, and overlapping digital services.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Estimated Monthly Subscriptions",
        prompt: "How many digital subscriptions, streaming apps, and SaaS tools do you pay for?",
        options: [
          "[A] 3 - 5 services (< ₹2,000 / $50 per month)",
          "[B] 6 - 12 services (₹2,000 - ₹8,000 / $50 - $200 per month)",
          "[C] 12+ services (₹8,000+ / $200+ per month)",
          "[D] Lost track / Many auto-debits on multiple cards"
        ]
      }
    ],
    parameters: [
      { name: "{{AUDIT_CATEGORY}}", description: "Entertainment, Work SaaS, Health memberships", validChoices: "Entertainment, SaaS, Gym/Clubs, Cloud, Telecomm", defaultFallback: "All Recurring Auto-Debits" }
    ],
    workflow: [
      "Compile list of all recurring monthly and annual charges.",
      "Categorize into: Essential, Under-utilized, and Zero-Value Zombie Subscriptions in Google Sheets.",
      "Calculate annualized savings from immediate cancellations and tier downgrades.",
      "Draft cancellation notice emails or provide direct cancellation links.",
      "Set Google Calendar alerts 7 days before annual auto-renewals trigger."
    ],
    guardrails: [
      "Watch for annual renewals with hidden price escalation clauses.",
      "Ensure business-essential software licenses are not cancelled by accident."
    ]
  },
  {
    num: 26,
    id: "high-yield-automated-cash-system",
    name: "High-Yield Savings & Automated Wealth Compounding System",
    department: "Self: Wealth, Financial Security & Independence",
    description: "Automates pay-yourself-first salary transfers on pay-day: routing funds to savings, debt payoff, index funds, and discretionary guilt-free spending without manual friction.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Salary Day Discipline",
        prompt: "How do you currently handle money on salary day?",
        options: [
          "[A] Invest whatever is left at the end of the month (often little)",
          "[B] Manual transfers to mutual funds and bills when I remember",
          "[C] Automated SIPs for some investments, but unstructured spending",
          "[D] Fully automated cash flow architecture"
        ]
      }
    ],
    parameters: [
      { name: "{{SAVINGS_TARGET_PERCENT}}", description: "Target percentage of net income saved", validChoices: "20% / 30% / 40% / 50%+", defaultFallback: "35% of net take-home" }
    ],
    workflow: [
      "Map out net monthly inflow dates.",
      "Design an automated 3-account routing flow in Google Docs (Income Account -> Wealth/Investment Account -> Living Expenses Account -> Guilt-free Card).",
      "Model automated recurring standing instructions / SIP dates.",
      "Generate a monthly cash flow audit template in Google Sheets."
    ],
    guardrails: [
      "Ensure bill and EMI debit dates occur 2-3 business days after salary credit to prevent overdraft charges from weekend delays."
    ]
  },
  {
    num: 27,
    id: "credit-score-repair-elevation",
    name: "Credit Score Repair & Credit Health Elevation",
    department: "Self: Wealth, Financial Security & Independence",
    description: "Analyzes credit report discrepancies (CIBIL / Experian / FICO), lowers credit utilization ratio (< 30%), and implements an aggressive credit score elevation strategy.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Current Credit Score Range",
        prompt: "What is your approximate credit score?",
        options: [
          "[A] Excellent: 780 - 850 / 800+ CIBIL",
          "[B] Good: 720 - 779 / 750 - 799 CIBIL",
          "[C] Fair / Poor: 600 - 719 / Need improvement",
          "[D] Below 600 or No Credit History (New to credit)"
        ]
      }
    ],
    parameters: [
      { name: "{{TARGET_SCORE}}", description: "Target score for mortgage approval", validChoices: "750+ / 780+ / 800+", defaultFallback: "780+ CIBIL / Experian" }
    ],
    workflow: [
      "Audit credit report factors: on-time payment history (35%), credit utilization (30%), age of accounts (15%), credit mix (10%), hard inquiries (10%).",
      "Formulate a step-by-step credit utilization reduction plan (credit limit increase request, bi-monthly payoff).",
      "Draft dispute letters in Google Docs for erroneous negative marks or delayed updates.",
      "Create Google Calendar alerts for credit card statement closing dates (bill generation vs due date)."
    ],
    guardrails: [
      "Never close your oldest credit card account (closing it destroys credit history age).",
      "Do not apply for multiple loans or credit cards simultaneously (causes hard inquiry score drops)."
    ]
  },
  {
    num: 28,
    id: "critical-illness-disability-audit",
    name: "Critical Illness & Personal Disability Safety Net",
    department: "Self: Wealth, Financial Security & Independence",
    description: "Secures income-replacement insurance against stroke, cancer, heart attack, and permanent disability where regular health insurance only covers hospital bills.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Existing Disability / Critical Illness Cover",
        prompt: "Do you have standalone critical illness or accidental disability insurance?",
        options: [
          "[A] No, only basic hospitalization health insurance",
          "[B] Basic rider attached to corporate health insurance",
          "[C] Standalone critical illness policy",
          "[D] Unsure what is covered"
        ]
      }
    ],
    parameters: [
      { name: "{{LUMPSUM_COVER_TARGET}}", description: "Lump-sum payout target", validChoices: "1-2x annual income / 3-5x annual income", defaultFallback: "2-3x annual gross income" }
    ],
    workflow: [
      "Analyze the difference between Indemnity (hospital bill reimbursement) and Benefit (lump-sum cash payout on diagnosis).",
      "Model loss-of-income runway needed during prolonged rehabilitation.",
      "Generate a Critical Illness and Personal Accident policy comparison in Google Docs.",
      "Check policy wording for specific disease definitions, survival periods (typically 30 days), and exclusions."
    ],
    guardrails: [
      "Check the 'Survival Period' clause (most critical illness riders require surviving 14-30 days post-diagnosis for payout).",
      "Ensure permanent partial disability (PPD) and temporary total disability (TTD) are covered."
    ]
  },
  {
    num: 29,
    id: "major-life-milestone-capital-allocation",
    name: "Capital Allocation for Major Life Milestones",
    department: "Self: Wealth, Financial Security & Independence",
    description: "Rings-fences savings, models inflation, and structures low-risk goal portfolios for upcoming weddings, child college admissions, or startup seed capital.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Upcoming Milestone Time Horizon",
        prompt: "When will the major capital outlay occur?",
        options: [
          "[A] Within the next 12 - 24 months (Short term)",
          "[B] 3 - 5 years away (Medium term)",
          "[C] 5 - 10 years away (Long term)",
          "[D] 10+ years away (Child's higher education)"
        ]
      }
    ],
    parameters: [
      { name: "{{MILESTONE_BUDGET}}", description: "Target lump-sum capital requirement", validChoices: "₹10L - ₹25L / ₹25L - ₹75L / ₹75L+ / $50k - $250k+", defaultFallback: "Goal-specific capital budget" }
    ],
    workflow: [
      "Calculate future value of the target milestone accounting for specific inflation rates (e.g. 10% for education).",
      "Construct a capital preservation portfolio in Google Sheets: Shift from equity to debt as the milestone approaches (glide path).",
      "Model monthly SIP / recurring investment amounts required to reach the target without borrowing.",
      "Draft an milestone progress tracker in Google Docs."
    ],
    guardrails: [
      "Never keep funds needed within 24 months in volatile stock market equity.",
      "Begin de-risking equity to fixed income 3 years before the target milestone date."
    ]
  },
  {
    num: 30,
    id: "financial-scam-cyber-fraud-defense",
    name: "Financial Cyber Fraud & Scam Defense Architecture",
    department: "Self: Wealth, Financial Security & Independence",
    description: "Hardens banking credentials, SIM-swap vulnerability, UPI transaction limits, and creates immediate incident response protocols for financial fraud.",
    enabled: true,
    allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      {
        title: "Banking Authentication Security",
        prompt: "How are your main banking and investment accounts secured?",
        options: [
          "[A] Same password used across multiple accounts; SMS OTP only",
          "[B] Unique passwords; SMS OTP authentication",
          "[C] Password manager with hardware key (YubiKey) / Authenticator App (TOTP)",
          "[D] Advanced biometric + hardware security"
        ]
      }
    ],
    parameters: [
      { name: "{{PRIMARY_SIM_CARRIER}}", description: "Mobile carrier for banking OTPs", validChoices: "Airtel / Jio / Verizon / AT&T / Other", defaultFallback: "Primary Telecom Provider" }
    ],
    workflow: [
      "Audit SIM-swap vulnerabilities and set SIM PIN locks on user devices.",
      "Configure daily UPI and debit card international and domestic online transaction limits.",
      "Generate an Emergency Financial Freeze Playbook in Google Docs with direct bank fraud reporting phone numbers and cyber crime reporting steps.",
      "Set bi-annual password vault audit reminders in Google Calendar."
    ],
    guardrails: [
      "Remind users that bank officials and police will NEVER ask for OTPs or demand money transfers to 'safe accounts'.",
      "Store emergency freeze numbers offline."
    ]
  }
];

// Let's add remaining skills (31 to 100)
console.log('Adding remaining skills (31 to 100)...');

const REMAINING_SKILLS = [
  // ==========================================
  // CATEGORY 3: SELF - CAREER, AMBITION & MASTERY (Skills 31-45)
  // ==========================================
  {
    num: 31,
    id: "strategic-career-trajectory-map",
    name: "Strategic Career Navigation & 3-Year Trajectory Map",
    department: "Self: Career Navigation, Ambition & Professional Mastery",
    description: "Formulates a 36-month career roadmap, identifying high-leverage title transitions, compensation bands, skill moats, and target companies.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Current Career Stage", prompt: "What is your current seniority level?", options: ["[A] Early Career (1-4 yrs)", "[B] Mid-Level / Senior IC (5-9 yrs)", "[C] Lead / Manager / Director (10-15 yrs)", "[D] VP / Executive / C-Suite (15+ yrs)"] },
      { title: "Primary Career Ambition", prompt: "What is your #1 goal over the next 24 months?", options: ["[A] Promotion to next title within current company", "[B] Pivot to top-tier tech/product/finance firm with 40%+ comp increase", "[C] Transition from Individual Contributor to People Management", "[D] Pivot into AI / New industry sector"] }
    ],
    parameters: [{ name: "{{TARGET_TITLE}}", description: "Target next level role", validChoices: "Staff Engineer / Director / VP / CPO / CMO", defaultFallback: "Next Seniority Level" }],
    workflow: ["Map career timeline and skill moats in Google Docs.", "Conduct live research on market compensation bands (Levels.fyi, Glassdoor).", "Identify top 20 target employers and key decision makers.", "Create quarterly milestone review tasks in Google Tasks."],
    guardrails: ["Focus on market-demanded leverage skills rather than vanity credentials."]
  },
  {
    num: 32,
    id: "executive-resume-linkedin-brand",
    name: "Executive Resume, LinkedIn & Personal Brand Synthesis",
    department: "Self: Career Navigation, Ambition & Professional Mastery",
    description: "Transforms functional resumes into achievement-dense executive portfolios using the Google X-Y-Z formula (Accomplished [X], as measured by [Y], by doing [Z]).",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Target Industry", prompt: "What industry or domain are you targeting?", options: ["[A] Technology / SaaS / AI", "[B] Banking, FinTech & Private Equity", "[C] Consulting & Corporate Strategy", "[D] Healthcare, BioTech & Operations"] }
    ],
    parameters: [{ name: "{{PRIMARY_EXPERTISE}}", description: "Core domain", validChoices: "Product, Engineering, Revenue, Strategy", defaultFallback: "Cross-Functional Leadership" }],
    workflow: ["Rewrite bullet points into quantifiable metrics in Google Docs.", "Optimize LinkedIn headline, summary, and keyword density for executive recruiters.", "Format clean ATS-compliant resume layout.", "Draft personalized outreach templates."],
    guardrails: ["Avoid generic buzzwords ('results-driven leader'); use hard verifiable numbers."]
  },
  {
    num: 33,
    id: "salary-equity-total-comp-negotiator",
    name: "Salary, Equity & Total Compensation Negotiation Playbook",
    department: "Self: Career Navigation, Ambition & Professional Mastery",
    description: "Maximizes base salary, RSUs, ESOP strike price, signing bonuses, and performance cliffs with tactical negotiation scripts and BATNA leverage.",
    enabled: true, allowedTiers: ["INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Offer Status", prompt: "What is your current offer stage?", options: ["[A] Expecting verbal offer in 24-48 hours", "[B] Received initial written offer", "[C] Annual performance review / Merit raise coming up", "[D] Comparing multiple competing offers"] }
    ],
    parameters: [{ name: "{{EQUITY_TYPE}}", description: "Public RSUs vs Startup ESOPs", validChoices: "Public RSUs / Private ESOPs / Cash Bonus", defaultFallback: "Base + RSU + Signing Bonus" }],
    workflow: ["Model total comp package (Base, Bonus, Equity vesting) across 4 years in Google Sheets.", "Research 75th and 90th percentile salary benchmarks for the exact role and location.", "Generate word-for-word counter-offer scripts and email templates in Google Docs.", "Draft strategic questions to ask regarding startup 409A valuation and dilution."],
    guardrails: ["Never reveal current salary first; anchor negotiations on market value.", "Always negotiate over email or scheduled phone calls with prepared talking points."]
  },
  {
    num: 34,
    id: "high-stakes-interview-case-simulator",
    name: "High-Stakes Interview Preparation & Case Simulator",
    department: "Self: Career Navigation, Ambition & Professional Mastery",
    description: "Runs rigorous mock behavioral (STAR method), executive leadership, and system design/strategy interviews with instant constructive feedback.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Interview Format", prompt: "What type of interview are you preparing for?", options: ["[A] Behavioral / Leadership Principles (Amazon, Meta style)", "[B] System Design / Technical Architecture", "[C] Product Sense / Product Strategy Case", "[D] Executive Fit / Founder & Board Chat"] }
    ],
    parameters: [{ name: "{{TARGET_COMPANY}}", description: "Hiring company name", validChoices: "Company name provided by user", defaultFallback: "Top Tier Global Technology Firm" }],
    workflow: ["Gather typical interview question banks for the target company via web research.", "Generate 10 structured STAR story archetypes in Google Docs.", "Simulate realistic interviewer follow-up questions.", "Draft strategic reverse-interview questions to ask the interviewer."],
    guardrails: ["Keep answers under 2.5 minutes; prevent rambling."]
  },
  {
    num: 35,
    id: "skill-gap-high-roi-upskilling",
    name: "High-ROI Skill Gap Analysis & Learning Curriculum",
    department: "Self: Career Navigation, Ambition & Professional Mastery",
    description: "Benchmarks your current capabilities against emerging industry demands (GenAI workflows, data leadership, P&L management) and builds an 8-week execution sprint.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Target Capability", prompt: "Which capability will create the highest career leverage?", options: ["[A] Generative AI & Automation for Business", "[B] Enterprise P&L & Financial Modeling", "[C] Cloud Architecture & Distributed Systems", "[D] Executive Communication & Influence"] }
    ],
    parameters: [{ name: "{{STUDY_HOURS}}", description: "Weekly study commitment", validChoices: "3 hrs / 5 hrs / 8 hrs weekly", defaultFallback: "5 hours weekly" }],
    workflow: ["Audit skill gaps from job descriptions of target senior roles.", "Curate best books, papers, and hands-on projects in Google Docs.", "Build an 8-week structured study and build plan in Google Sheets.", "Schedule daily 45-minute deep learning blocks in Google Calendar."],
    guardrails: ["Prioritize building public proof-of-work over passive video watching."]
  },
  {
    num: 36,
    id: "cross-functional-leadership-managing-up",
    name: "Cross-Functional Influence & Managing Upward Playbook",
    department: "Self: Career Navigation, Ambition & Professional Mastery",
    description: "Builds unshakeable alignment with demanding executives, manages difficult stakeholders, and navigates matrixed organizational politics gracefully.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Manager Style", prompt: "How would you describe your manager's working style?", options: ["[A] Micro-manager: needs constant updates, anxious about details", "[B] Absentee / Hands-off: hard to reach, vague expectations", "[C] Political / Demanding: fast-paced, high expectations, volatile", "[D] Collaborative but overloaded"] }
    ],
    parameters: [{ name: "{{ALIGNMENT_CADENCE}}", description: "1-on-1 meeting frequency", validChoices: "Weekly / Bi-weekly", defaultFallback: "Weekly 30-minute 1-on-1" }],
    workflow: ["Formulate a weekly async status update memo template in Google Docs.", "Design a 1-on-1 agenda structure focused on priorities, blockers, and mutual wins.", "Draft diplomatic response scripts for handling sudden priority shifts.", "Set recurring 1-on-1 prep tasks in Google Tasks."],
    guardrails: ["Never surprise your manager in public meetings; always pre-wire critical news."]
  },
  {
    num: 37,
    id: "deep-work-burnout-free-productivity",
    name: "Deep Work Architecture & Calendar Defensibility",
    department: "Self: Career Navigation, Ambition & Professional Mastery",
    description: "Audits meeting creep, eliminates low-value reactive work, and establishes 3-hour uninterrupted deep-work focus blocks in your Google Calendar.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Meeting Overhead", prompt: "How many hours per day are spent in meetings?", options: ["[A] 1 - 2 hours (Manageable)", "[B] 3 - 5 hours (Fragmented focus)", "[C] 6+ hours (Completely overwhelmed / meeting fatigue)", "[D] Back-to-back all day"] }
    ],
    parameters: [{ name: "{{FOCUS_BLOCK_DAYS}}", description: "Dedicated focus mornings", validChoices: "Tuesday & Thursday mornings / Daily 9-12", defaultFallback: "Daily 9:00 AM - 11:30 AM Focus Block" }],
    workflow: ["Audit Google Calendar to calculate meeting-to-maker ratio.", "Insert recurring 'Focus Time - Do Not Book' protected blocks in Google Calendar.", "Draft polite email and Slack decline templates for non-essential meetings.", "Generate a daily top-3 high-leverage task checklist in Google Docs."],
    guardrails: ["Defend focus time proactively; do not allow exceptions without a compelling reason."]
  },
  {
    num: 38,
    id: "strategic-network-relationship-tracker",
    name: "Strategic Relationship & Professional Network CRM",
    department: "Self: Career Navigation, Ambition & Professional Mastery",
    description: "Tracks high-value mentors, industry peers, and executive sponsors with scheduled value-add touchpoints to maintain authentic relationships without spamming.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Network Size", prompt: "How many key professional contacts do you want to actively maintain?", options: ["[A] Top 15 VIP mentors & sponsors (Core Circle)", "[B] 25 - 50 key industry peers & collaborators", "[C] 50 - 100 broad industry alumni & executives", "[D] Starting from scratch"] }
    ],
    parameters: [{ name: "{{TOUCHPOINT_CADENCE}}", description: "Follow-up frequency", validChoices: "Monthly / Quarterly / Bi-annually", defaultFallback: "Quarterly value-add check-in" }],
    workflow: ["Design a personal Network CRM in Google Sheets with fields for last touchpoint, notes, personal details, and next action.", "Draft personalized, low-friction check-in emails sharing relevant articles or congratulations.", "Set recurring quarterly networking reminders in Google Calendar.", "Track career updates and moves across your network."],
    guardrails: ["Never reach out only when you need a favor; always lead with value or genuine appreciation."]
  },
  {
    num: 39,
    id: "career-pivot-industry-transition",
    name: "Career Pivot & Industry Transition Playbook",
    department: "Self: Career Navigation, Ambition & Professional Mastery",
    description: "Translates non-traditional backgrounds, reframes transferable skills, and executes strategic bridging projects to break into entirely new industries.",
    enabled: true, allowedTiers: ["INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Pivot Magnitude", prompt: "What type of career transition are you making?", options: ["[A] Same role, different industry (e.g. Finance PM -> HealthTech PM)", "[B] Different role, same industry (e.g. Sales -> Product Management)", "[C] Complete double pivot (New role AND new industry)", "[D] Corporate employee -> Independent Consultant / Founder"] }
    ],
    parameters: [{ name: "{{TARGET_SECTOR}}", description: "Desired destination industry", validChoices: "AI, ClimateTech, FinTech, Web3, HealthTech", defaultFallback: "Target Sector" }],
    workflow: ["Conduct transferable skills inventory in Google Docs.", "Design a 60-day bridging project that proves domain competence without formal title.", "Identify transition-friendly hiring managers and founders through market research.", "Draft narrative repositioning pitch for interviews."],
    guardrails: ["Do not start by taking entry-level pay cuts until you have tested narrative repositioning."]
  },
  {
    num: 40,
    id: "performance-review-promotion-dossier",
    name: "Performance Review & Promotion Dossier Architect",
    department: "Self: Career Navigation, Ambition & Professional Mastery",
    description: "Builds an undeniable, data-backed 'Brag Sheet' and business case for promotions, showcasing business impact, revenue saved, and team mentorship.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Review Timeline", prompt: "When is your formal review cycle?", options: ["[A] In 2 - 4 weeks (Immediate dossier needed)", "[B] In 2 - 3 months (Time to influence reviewers)", "[C] 6 months away (Building ongoing case)", "[D] Just completed; planning next cycle"] }
    ],
    parameters: [{ name: "{{BUSINESS_METRICS}}", description: "Key metrics delivered", validChoices: "Revenue, Efficiency, Latency, Team scaling", defaultFallback: "Measurable Business Impact" }],
    workflow: ["Synthesize past 12 months of achievements, Slack praise, and completed projects into a Google Doc.", "Map accomplishments against the company's next-level competency rubric.", "Generate a 1-page Executive Promotion Summary in Google Docs for leadership calibration meetings.", "Schedule pre-review alignment chat with manager in Google Calendar."],
    guardrails: ["Focus on peer and leadership impact, not just individual operational output."]
  },
  {
    num: 41,
    id: "public-speaking-keynote-briefing-builder",
    name: "Public Speaking, Keynote & Executive Briefing Builder",
    department: "Self: Career Navigation, Ambition & Professional Mastery",
    description: "Structures compelling executive presentations, keynote narratives, slide visual concepts, and stage presence prep for industry conferences.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Audience & Setting", prompt: "Who will you be speaking to?", options: ["[A] Internal Board / C-Suite executives (15 mins)", "[B] Company All-Hands / Townhall (20-30 mins)", "[C] External Industry Conference Keynote (30-45 mins)", "[D] Investor Pitch / Demo Day (5-10 mins)"] }
    ],
    parameters: [{ name: "{{PRESENTATION_HOOK}}", description: "Core keynote thesis", validChoices: "Thesis statement provided by user", defaultFallback: "High-Impact Industry Narrative" }],
    workflow: ["Structure talk using the 3-act narrative arc (Problem, Paradigm Shift, Resolution) in Google Docs.", "Generate slide outline and visual concept prompts in Google Slides.", "Draft word-for-word opening hook and closing call to action.", "Create rehearsal checklist in Google Tasks."],
    guardrails: ["Never use text-heavy slides; keep slides visual and deliver the narrative verbally."]
  },
  {
    num: 42,
    id: "side-venture-solopreneur-feasibility",
    name: "Side Venture & Solopreneur Feasibility Assessment",
    department: "Self: Career Navigation, Ambition & Professional Mastery",
    description: "Evaluates weekend venture ideas, validates customer willingness to pay, and audits employment contracts for moonlighting and IP assignment risks.",
    enabled: true, allowedTiers: ["INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Employment Contract IP Clauses", prompt: "Does your current employment contract have a strict Moonlighting or IP assignment clause?", options: ["[A] Yes, strict non-compete and IP assignment for any software/business", "[B] Moderate: allowed as long as outside work hours and different industry", "[C] No restrictions / Freelance / Independent contractor", "[D] Unsure / Need to review offer letter"] }
    ],
    parameters: [{ name: "{{BUSINESS_MODEL}}", description: "B2B SaaS, Agency, Digital Product", validChoices: "Micro-SaaS, Consulting, Newsletter, Info-Product", defaultFallback: "B2B Niche Service" }],
    workflow: ["Audit current employment agreement language for IP and moonlighting risks in Google Docs.", "Structure a 48-hour smoke-test validation experiment in Google Sheets.", "Calculate unit economics, CAC, and break-even revenue targets.", "Draft initial customer discovery outreach scripts."],
    guardrails: ["Never use company laptops, email, or intellectual assets to develop private side projects."]
  },
  {
    num: 43,
    id: "intellectual-property-contract-guardrail",
    name: "Consulting Contract, NDA & IP Guardrail Review",
    department: "Self: Career Navigation, Ambition & Professional Mastery",
    description: "Scans consulting agreements, client Master Service Agreements (MSAs), and non-competes to flag one-sided liability caps, unlimited indemnification, and IP loss.",
    enabled: true, allowedTiers: ["INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Contract Type", prompt: "What legal document are you reviewing?", options: ["[A] Independent Contractor / Consulting Agreement", "[B] Mutual Non-Disclosure Agreement (NDA)", "[C] Full-time Employment Offer Letter & Non-Compete", "[D] Master Services Agreement (MSA) with a corporate client"] }
    ],
    parameters: [{ name: "{{LIABILITY_CAP}}", description: "Liability limit clause", validChoices: "12 months fees / Total fees paid / Uncapped (Dangerous)", defaultFallback: "Capped at fees paid in past 12 months" }],
    workflow: ["Review contract clauses against commercial standards in Google Docs.", "Highlight dangerous provisions: unlimited liability, broad IP assignment, restrictive non-competes.", "Provide revised clause counter-proposals in Google Docs.", "Draft professional negotiation email to client counsel."],
    guardrails: ["State clearly that Life OS provides business analysis, not attorney-client legal representation."]
  },
  {
    num: 44,
    id: "board-advisory-thought-leadership",
    name: "Board Advisory & Thought Leadership Pathway",
    department: "Self: Career Navigation, Ambition & Professional Mastery",
    description: "Positions senior operators for advisory board seats, startup mentorship equity (FAST agreements), and published thought leadership.",
    enabled: true, allowedTiers: ["ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Target Engagement", prompt: "What advisory capacity are you pursuing?", options: ["[A] Startup Advisory Board (0.25% - 1% equity)", "[B] Corporate Non-Executive Director (NED)", "[C] Paid fractional executive role", "[D] Academic / Industry Non-Profit Board"] }
    ],
    parameters: [{ name: "{{EQUITY_VESTING}}", description: "FAST agreement vesting schedule", validChoices: "2-year monthly / 1-year cliff", defaultFallback: "2-year monthly vesting with quarterly cadence" }],
    workflow: ["Draft 1-page Advisor Value Proposition in Google Docs.", "Research standard FAST (Founder Advisor Standard Template) equity guidelines.", "Publish thought leadership editorial schedule in Google Sheets.", "Set advisory milestone tracking in Google Tasks."],
    guardrails: ["Verify employer approval before accepting any outside fiduciary board positions."]
  },
  {
    num: 45,
    id: "graceful-resignation-career-exit",
    name: "Graceful Resignation & Professional Exit Protocol",
    department: "Self: Career Navigation, Ambition & Professional Mastery",
    description: "Manages notice period negotiations, knowledge handovers, non-solicitation boundaries, and preserves invaluable senior relationships during a job exit.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Notice Period Duration", prompt: "What is your official contractual notice period?", options: ["[A] 2 weeks (US standard)", "[B] 30 days / 1 month", "[C] 60 - 90 days (India / UK standard)", "[D] Immediate / Executive buyout requested"] }
    ],
    parameters: [{ name: "{{TRANSITION_TIMELINE}}", description: "Transition completion date", validChoices: "Date provided by user", defaultFallback: "Contractual Notice End Date" }],
    workflow: ["Draft professional, gracious Resignation Letter in Google Docs.", "Construct a comprehensive Knowledge Transfer Matrix in Google Sheets.", "Draft warm farewell email templates for colleagues and external clients.", "Add key transition milestones to Google Calendar."],
    guardrails: ["Never vent grievances in resignation letters or exit interviews; maintain pristine professional relationships."]
  }
];

SKILLS_DATA.push(...REMAINING_SKILLS);

// Let's add Categories 4, 5, 6, 7, 8
const FURTHER_SKILLS = [
  // ==========================================
  // CATEGORY 4: HOME & FAMILY - ELDERCARE (Skills 46-58)
  // ==========================================
  {
    num: 46,
    id: "parents-chronic-care-management-log",
    name: "Parents' Healthcare & Chronic Condition Management Log",
    department: "Home & Family: Eldercare, Aging Parents & Medical Guardianship",
    description: "Maintains a centralized, real-time family medical dashboard for aging parents (vitals, prescriptions, doctor notes, upcoming tests, and emergency records).",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Primary Monitored Condition", prompt: "What conditions require daily/weekly monitoring?", options: ["[A] Blood pressure / Hypertension", "[B] Blood sugar / Diabetes (Fasting, PP, HbA1c)", "[C] Cardiac / Heart disease / Pacemaker", "[D] Kidney / Thyroid / Arthritis"] }
    ],
    parameters: [{ name: "{{VITALS_LOG}}", description: "Frequency of logging", validChoices: "Daily / Weekly / Monthly", defaultFallback: "Weekly Vitals Log" }],
    workflow: ["Create an easy-to-use Google Sheet for logging BP, blood glucose, weight, and medications.", "Set up automatic color-coded alerts for out-of-range readings.", "Schedule recurring monthly prescription refill reminders in Google Calendar.", "Create an emergency 1-page PDF printable with blood type, doctors, and allergies."],
    guardrails: ["Ensure multiple siblings/caregivers have edit access to the document."]
  },
  {
    num: 47,
    id: "eldercare-housing-home-nurse-audit",
    name: "Eldercare Housing, Assisted Living & Home Nurse Vetting",
    department: "Home & Family: Eldercare, Aging Parents & Medical Guardianship",
    description: "Evaluates assisted living facilities, independent senior communities, and verified home nursing agencies for quality, safety, medical tie-ups, and cost.",
    enabled: true, allowedTiers: ["INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Care Intensity Needed", prompt: "What level of assistance is required?", options: ["[A] Independent living with community activities and safety backup", "[B] Part-time home attendant (bathing, mobility, meals)", "[C] 24x7 bed-side nursing care (ICU at home / palliative)", "[D] Memory care / Specialized dementia support"] }
    ],
    parameters: [{ name: "{{LOCATION_PREFERENCE}}", description: "City or region", validChoices: "City provided by user", defaultFallback: "Current city of residence" }],
    workflow: ["Research top accredited eldercare and home nursing agencies in target city.", "Build comparison spreadsheet in Google Sheets covering monthly costs, nurse qualifications, background checks, and doctor visit inclusions.", "Generate a 20-point vetting questionnaire in Google Docs for facility walkthroughs."],
    guardrails: ["Always verify police background checks and nursing registration certifications."]
  },
  {
    num: 48,
    id: "medical-emergency-quick-response-kit",
    name: "Family Medical Emergency Protocol & Quick-Response Kit",
    department: "Home & Family: Eldercare, Aging Parents & Medical Guardianship",
    description: "Prepares an instant-access emergency protocol: nearest cardiac/stroke ER hospitals, ambulance numbers, insurance TPA cards, and medical history sheets.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Parents' Primary City & Pincode", prompt: "What is their exact neighborhood and location?", options: ["[A] Metro City (Tier 1)", "[B] Non-Metro Urban (Tier 2)", "[C] Semi-urban / Town", "[D] Rural / Remote location"] }
    ],
    parameters: [{ name: "{{EMERGENCY_CONTACT}}", description: "Primary family responder", validChoices: "Phone numbers and names", defaultFallback: "Primary Family Contact" }],
    workflow: ["Identify 2 nearest 24/7 hospitals with full Cath Lab and Stroke ICU facilities.", "Compile direct ambulance and emergency desk numbers in Google Docs.", "Build a 1-page Emergency Grab-and-Go Sheet with insurance policy numbers, TPA card links, and medical summaries.", "Share link with all family members."],
    guardrails: ["Print physical copies to keep near parents' bedside and front door."]
  },
  {
    num: 49,
    id: "senior-citizen-financial-security-pension",
    name: "Senior Citizen Financial Security & Pension Optimization",
    department: "Home & Family: Eldercare, Aging Parents & Medical Guardianship",
    description: "Optimizes fixed deposits, Senior Citizen Savings Schemes (SCSS), PMVVY, annuity pensions, and capital preservation for aging parents.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Income Source", prompt: "What are your parents' primary income sources?", options: ["[A] Government / Corporate pension only", "[B] Bank Fixed Deposit interest & Post Office schemes", "[C] Rental income from real estate", "[D] Fully dependent on children's support"] }
    ],
    parameters: [{ name: "{{CAPITAL_SAFETY}}", description: "Safety priority", validChoices: "Sovereign guaranteed / High yield", defaultFallback: "100% Sovereign & Scheduled Commercial Bank Guaranteed" }],
    workflow: ["Review interest rates across Senior Citizen Savings Schemes (SCSS), RBI Floating Rate Bonds, and top bank FDs in Google Sheets.", "Structure regular monthly cash flow payout calendar.", "Automate Form 15H submission reminders to prevent unnecessary TDS deductions in Google Calendar."],
    guardrails: ["Never invest senior citizens' retirement corpus in speculative market equities or unregulated cooperative societies."]
  },
  {
    num: 50,
    id: "cognitive-health-memory-care-vigilance",
    name: "Cognitive Health & Memory Care Vigilance Framework",
    department: "Home & Family: Eldercare, Aging Parents & Medical Guardianship",
    description: "Monitors early signs of cognitive decline, Alzheimer's, or vascular dementia with respectful observation rubrics, home safety tweaks, and neurologist referrals.",
    enabled: true, allowedTiers: ["INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Observed Changes", prompt: "What behavioral or memory changes have been noticed?", options: ["[A] Mild forgetfulness of recent events (Keys, appointments)", "[B] Confusion with finances, medications, or navigation", "[C] Personality changes, irritability, or social withdrawal", "[D] None / Proactive screening for peace of mind"] }
    ],
    parameters: [{ name: "{{NEURO_SCREENING}}", description: "Clinical screening checklist", validChoices: "MoCA, MMSE screening guidance", defaultFallback: "Clinical Cognitive Baseline Assessment" }],
    workflow: ["Draft respectful observation log in Google Docs to record dates and specific incidents.", "Research top memory clinics and geriatric neurologists.", "Formulate home environment modifications (stove safety shutoffs, wandering alerts).", "Generate compassionate communication tips for family members."],
    guardrails: ["Emphasize that reversible conditions (Vitamin B12 deficiency, thyroid dysfunction, UTI) can mimic dementia; seek medical evaluation immediately."]
  },
  {
    num: 51,
    id: "parents-home-safety-fall-proofing",
    name: "Parents' Home Safety & Fall-Proofing Inspection",
    department: "Home & Family: Eldercare, Aging Parents & Medical Guardianship",
    description: "Audits bathroom grab bars, non-slip flooring, night-light illumination, stair railings, and rug hazards to eliminate fall risks (the #1 cause of senior fractures).",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Home Layout", prompt: "What is the physical layout of their residence?", options: ["[A] Single-level apartment with elevator access", "[B] Multi-level independent house with stairs", "[C] High-step thresholds and traditional bathrooms", "[D] Bathroom requires stepping over tub/curb"] }
    ],
    parameters: [{ name: "{{MODIFICATION_BUDGET}}", description: "Home safety budget", validChoices: "Basic (< ₹15,000 / $200) / Comprehensive", defaultFallback: "Essential Fall Prevention" }],
    workflow: ["Generate a Room-by-Room Fall Hazard Checklist in Google Docs (Bathroom, Bedroom, Hallway, Kitchen).", "Recommend specific anti-skid mats, grab bars, raised toilet seats, and motion-sensor night lights with purchase links.", "Create a Google Tasks schedule for installation."],
    guardrails: ["Falls in seniors carry high mortality risks; prioritize bathroom grab bars immediately."]
  },
  {
    num: 52,
    id: "geriatric-specialist-hospital-network",
    name: "Geriatric Specialist & Hospital Network Finder",
    department: "Home & Family: Eldercare, Aging Parents & Medical Guardianship",
    description: "Identifies compassionate geriatricians who evaluate polypharmacy, mobility, frailty, and holistic health instead of treating diseases in isolation.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Location", prompt: "Which city/neighborhood are you searching in?", options: ["[A] Delhi NCR / Mumbai / Bangalore", "[B] Hyderabad / Chennai / Kolkata / Pune", "[C] Other Indian City", "[D] International (US, UK, Canada)"] }
    ],
    parameters: [{ name: "{{SPECIALIST_TYPE}}", description: "Geriatrician or Multi-Specialist", validChoices: "Geriatrician, Orthogeriatric, Psychogeriatric", defaultFallback: "Consultant Geriatrician" }],
    workflow: ["Search accredited hospitals with dedicated geriatric medicine departments.", "Compile comparison table in Google Docs with doctor credentials, consultation fees, and patient reviews.", "Draft initial consultation questions covering medication rationalization."],
    guardrails: ["Ensure the specialist has experience de-prescribing redundant medications."]
  },
  {
    num: 53,
    id: "senior-government-schemes-subsidies",
    name: "Senior Citizen Government Schemes & Subsidies Guide",
    department: "Home & Family: Eldercare, Aging Parents & Medical Guardianship",
    description: "Navigates senior citizen tax rebates, railway/airline concessions, Ayushman Bharat senior schemes, utility subsidies, and municipal welfare programs.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Age Bracket", prompt: "Are your parents above 70 or 80?", options: ["[A] 60 - 69 (Senior Citizen)", "[B] 70 - 79 (Senior Citizen)", "[C] 80+ (Super Senior Citizen)", "[D] Under 60"] }
    ],
    parameters: [{ name: "{{INCOME_SLAB}}", description: "Annual income slab", validChoices: "Taxable / Below taxable threshold", defaultFallback: "Standard Senior Category" }],
    workflow: ["Research applicable central, state, and municipal senior citizen benefits.", "Generate eligibility summary in Google Docs (e.g. Ayushman Bharat ₹5L cover for 70+, Section 80TTB interest exemption).", "List required documentation (Aadhaar, age proof, income cert) in Google Tasks."],
    guardrails: ["Verify official government portal URLs to avoid phishing scam sites."]
  },
  {
    num: 54,
    id: "medical-power-of-attorney-advance-directive",
    name: "Medical Power of Attorney & Living Will Directives",
    department: "Home & Family: Eldercare, Aging Parents & Medical Guardianship",
    description: "Guides families through drafting healthcare proxies, advance directives, and living wills to honor parental wishes regarding ICU ventilation and life support.",
    enabled: true, allowedTiers: ["ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Family Alignment", prompt: "Has your family had an open discussion about medical wishes?", options: ["[A] Yes, parents have expressed clear verbal wishes", "[B] No, difficult topic; need guidance on opening the conversation", "[C] Siblings have divergent opinions", "[D] Urgent: parent currently hospitalized"] }
    ],
    parameters: [{ name: "{{LEGAL_FRAMEWORK}}", description: "Jurisdiction advance directive rules", validChoices: "Supreme Court of India Living Will Guidelines / Healthcare Proxy", defaultFallback: "Applicable Advance Medical Directive" }],
    workflow: ["Provide an empathetic family conversation guide in Google Docs.", "Draft standardized Advance Medical Directive and Healthcare Proxy documents.", "Detail legal execution process (gazetted officer / judicial magistrate requirements).", "Store encrypted digital record in Google Drive."],
    guardrails: ["Approach with deep emotional sensitivity and cultural empathy."]
  },
  {
    num: 55,
    id: "caregiver-burnout-relief-respite",
    name: "Caregiver Burnout Relief & Respite Coordination",
    department: "Home & Family: Eldercare, Aging Parents & Medical Guardianship",
    description: "Protects primary family caregivers from physical and emotional exhaustion through sibling chore distribution, adult daycare, and respite care scheduling.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Primary Caregiver", prompt: "Who currently bears the daily eldercare burden?", options: ["[A] Solely me (Living with parents)", "[B] Shared with spouse", "[C] Sibling lives with them; I support remotely", "[D] Hired full-time help managed by me"] }
    ],
    parameters: [{ name: "{{RESPITE_HOURS}}", description: "Target weekly relief hours", validChoices: "4 hrs / 8 hrs / Weekend off", defaultFallback: "8 hours weekly respite" }],
    workflow: ["Calculate weekly caregiver hours spent on logistics, medicine, and appointments in Google Sheets.", "Create a transparent Sibling Contribution Schedule in Google Sheets.", "Research vetted adult day-care centers and respite care services.", "Schedule protected caregiver recovery days in Google Calendar."],
    guardrails: ["Acknowledge caregiver guilt; reinforce that self-care is vital for patient safety."]
  },
  {
    num: 56,
    id: "multigenerational-financial-alignment",
    name: "Multi-Generational Family Financial Alignment",
    department: "Home & Family: Eldercare, Aging Parents & Medical Guardianship",
    description: "Facilitates transparent family discussions on eldercare expenses, inheritance expectations, joint property maintenance, and sibling financial parity.",
    enabled: true, allowedTiers: ["INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Family Structure", prompt: "How many adult siblings are involved in decision making?", options: ["[A] Only child (Sole decision maker)", "[B] 2 siblings", "[C] 3 or more siblings", "[D] Blended / Extended family"] }
    ],
    parameters: [{ name: "{{EXPENSE_SHARING}}", description: "Method of expense allocation", validChoices: "Equal split / Proportional to income / Funded by parents' assets", defaultFallback: "Dedicated Family Eldercare Pool" }],
    workflow: ["Build a shared Eldercare Expense Budget Spreadsheet in Google Sheets.", "Draft a collaborative Family Agreement Memo in Google Docs.", "Schedule quarterly family alignment calls in Google Calendar."],
    guardrails: ["Maintain strict neutrality and focus purely on parental comfort and fairness."]
  },
  {
    num: 57,
    id: "life-transition-asset-transfer-concierge",
    name: "Senior Asset Simplification & Account Consolidation",
    department: "Home & Family: Eldercare, Aging Parents & Medical Guardianship",
    description: "Helps aging parents close dormant accounts, consolidate scattered bank FDs, dematerialize physical share certificates, and streamline finances for easy management.",
    enabled: true, allowedTiers: ["INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Asset Complexity", prompt: "What scattered assets need consolidation?", options: ["[A] Multiple bank accounts and physical fixed deposit receipts", "[B] Physical paper share certificates requiring dematerialization (IEPF)", "[C] Inactive provident fund (EPF) or old insurance policies", "[D] Agricultural land or ancestral real estate"] }
    ],
    parameters: [{ name: "{{PRIMARY_BANK}}", description: "Target anchor bank for consolidation", validChoices: "Bank name provided by user", defaultFallback: "Primary Scheduled Bank" }],
    workflow: ["Create a Master Asset Inventory in Google Sheets.", "Draft standardized account closure and transfer letters in Google Docs.", "Map the exact process for converting physical shares to Demat accounts.", "Set progress check tasks in Google Tasks."],
    guardrails: ["Involve parents in every decision; avoid making them feel disempowered."]
  },
  {
    num: 58,
    id: "hearing-mobility-assistive-tech-evaluator",
    name: "Senior Assistive Tech, Mobility & Hearing Aid Evaluator",
    department: "Home & Family: Eldercare, Aging Parents & Medical Guardianship",
    description: "Evaluates modern hearing aids (audiogram matching, trial periods), lightweight wheelchairs, walkers, and senior-friendly phones to restore independence.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Target Assistive Device", prompt: "Which device is currently needed?", options: ["[A] Hearing Aids (Mild to severe loss)", "[B] Mobility Walker / Rollator / Wheelchair", "[C] Smart senior phone with large fonts and SOS button", "[D] Hospital bed / Recliner / Oxygen concentrator"] }
    ],
    parameters: [{ name: "{{TRIAL_PERIOD}}", description: "Requirement for home trial", validChoices: "Mandatory 30-day trial / Purchase", defaultFallback: "Mandatory Home Trial Period" }],
    workflow: ["Compare top digital hearing aid brands (Oticon, Phonak, Signia, Widex) in Google Sheets.", "Guide user through audiologist consultation questions.", "Evaluate warranty, service centers, and trial return policies.", "Compile top equipment options with price comparisons in Google Docs."],
    guardrails: ["Never buy hearing aids without an in-person audiogram and a formal 15-30 day trial period."]
  }
];

SKILLS_DATA.push(...FURTHER_SKILLS);

// Let's add Categories 5, 6, 7, 8 (Skills 59 to 100)
console.log('Adding Categories 5, 6, 7, 8 (Skills 59 to 100)...');

const FINAL_SKILLS = [
  // ==========================================
  // CATEGORY 5: HOME & FAMILY - PARENTING & KIDS (Skills 59-70)
  // ==========================================
  {
    num: 59,
    id: "pregnancy-newborn-family-readiness",
    name: "Pregnancy, Newborn & Postpartum Family Readiness Kit",
    department: "Home & Family: Parenting, Children & Education",
    description: "Coordinates maternity hospital booking, pediatrician selection, newborn essential nursery checklists, and postpartum recovery support plans.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Current Stage", prompt: "What trimester or stage are you in?", options: ["[A] First Trimester (1-12 weeks)", "[B] Second Trimester (13-27 weeks)", "[C] Third Trimester (28-40 weeks)", "[D] Newborn already arrived (< 3 months)"] }
    ],
    parameters: [{ name: "{{DELIVERY_HOSPITAL}}", description: "Target birthing facility", validChoices: "Hospital provided by user", defaultFallback: "Accredited Maternity Hospital" }],
    workflow: ["Generate Trimester-by-Trimester Health & Lab Checklist in Google Docs.", "Build a streamlined Newborn Essentials Inventory in Google Sheets.", "Draft Hospital Bag Packing Guide.", "Set pediatrician appointment reminders in Google Calendar."],
    guardrails: ["Discourage buying non-essential baby gear; focus on safety-rated car seats and safe sleep cribs."]
  },
  {
    num: 60,
    id: "pediatric-immunization-milestone-tracker",
    name: "Pediatric Health & Immunization Milestone Tracker",
    department: "Home & Family: Parenting, Children & Education",
    description: "Tracks national vaccine schedules (IAP / CDC / WHO), developmental growth percentiles (WHO charts), and pediatric checkups from birth to age 18.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Child Age", prompt: "What is your child's age?", options: ["[A] Infant (0 - 12 months)", "[B] Toddler (1 - 3 years)", "[C] Preschool & Primary (4 - 9 years)", "[D] Adolescent (10 - 18 years)"] }
    ],
    parameters: [{ name: "{{VACCINE_GUIDELINE}}", description: "Target immunization schedule", validChoices: "IAP (India) / CDC (USA) / WHO", defaultFallback: "IAP / CDC Standard Schedule" }],
    workflow: ["Generate comprehensive immunization log in Google Sheets.", "Calculate upcoming vaccine dates based on date of birth.", "Create Google Calendar alerts 7 days before vaccine due dates.", "Provide developmental milestone observation checklist in Google Docs."],
    guardrails: ["Always confirm with your pediatrician whether painless (acellular) or whole-cell vaccines are recommended."]
  },
  {
    num: 61,
    id: "child-education-fund-modeler",
    name: "Child Higher Education Fund & Long-Term Savings Modeler",
    department: "Home & Family: Parenting, Children & Education",
    description: "Models true future college costs (factoring 10-12% education inflation in domestic and international universities) and automates an equity-debt savings glidepath.",
    enabled: true, allowedTiers: ["INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Education Location Goal", prompt: "Where do you envision your child attending college?", options: ["[A] Top Domestic Private/Govt University (IIT, BITS, Ashoka, AIIMS)", "[B] Overseas Undergraduate Degree (US, UK, Canada, Europe)", "[C] Domestic Undergrad + Overseas Masters (MBA / MS)", "[D] Unsure / Maximize overall corpus flexibility"] }
    ],
    parameters: [{ name: "{{YEARS_TO_COLLEGE}}", description: "Years until university entrance", validChoices: "Years based on child age", defaultFallback: "15 years" }],
    workflow: ["Calculate target future education corpus factoring in 10% educational inflation in Google Sheets.", "Build an asset allocation glide path (Equity heavy in early years, shifting to debt 3 years before college).", "Model required monthly SIP investments in Google Sheets.", "Document strategy in Google Docs."],
    guardrails: ["Never use child's education savings to fund speculative ventures or lifestyle upgrades."]
  },
  {
    num: 62,
    id: "school-curriculum-selection-matrix",
    name: "School & Curriculum Selection Decision Matrix (IB, Cambridge, CBSE, ICSE)",
    department: "Home & Family: Parenting, Children & Education",
    description: "Objectively compares school pedagogies (IB PYP/MYP, Cambridge IGCSE, CBSE, ICSE) against your child's learning style, family mobility, and budget.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Child Personality & Learning Style", prompt: "How does your child learn best?", options: ["[A] Inquisitive, project-driven, inquiry-based (IB / Cambridge)", "[B] Structured, exam-focused, competitive STEM oriented (CBSE)", "[C] Balanced, language-heavy, literature and detail-oriented (ICSE)", "[D] Alternative / Experiential / Montessori"] }
    ],
    parameters: [{ name: "{{TARGET_LOCALITY}}", description: "City and commute zone", validChoices: "Area provided by user", defaultFallback: "Target Neighborhood" }],
    workflow: ["Compare curriculum methodologies, fee structures, and commute times in Google Sheets.", "Generate a 15-question School Walkthrough Rubric in Google Docs for admissions visits.", "Compile school admission deadlines into Google Calendar."],
    guardrails: ["Do not select a school with a commute longer than 45 minutes for young children."]
  },
  {
    num: 63,
    id: "screen-time-digital-wellness-family-contract",
    name: "Screen Time, Digital Wellness & Family Internet Safety",
    department: "Home & Family: Parenting, Children & Education",
    description: "Establishes a balanced family digital device contract, age-appropriate content filters, and device-free zones (dinner table, bedrooms).",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Current Screen Struggle", prompt: "What is the primary digital conflict in your house?", options: ["[A] Meltdowns when turning off iPad/TV (Toddler / Young child)", "[B] Video game addiction (Roblox, Minecraft, Fortnite)", "[C] Social media, smartphone secrecy, peer pressure (Tweens / Teens)", "[D] General over-reliance on screens during meals and downtime"] }
    ],
    parameters: [{ name: "{{CHILD_AGE_BAND}}", description: "Age group", validChoices: "Under 5 / 6-10 / 11-14 / 15-18", defaultFallback: "6 - 10 years" }],
    workflow: ["Draft collaborative Family Digital Agreement in Google Docs.", "Provide setup instructions for router-level DNS filtering and parental controls (NextDNS, Apple Screen Time, Google Family Link).", "Create a list of 25 screen-free alternative activities."],
    guardrails: ["Lead by example: parents must abide by the same device-free dining and bedroom rules."]
  },
  {
    num: 64,
    id: "child-emotional-coaching-focus-support",
    name: "Child Emotional Coaching & Focus Development",
    department: "Home & Family: Parenting, Children & Education",
    description: "Guides parents through emotion regulation coaching, handling tantrums without yelling, building executive function, and supporting focus.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Behavioral Challenge", prompt: "What situation triggers the most friction?", options: ["[A] Homework refusal and distractibility", "[B] Aggression, hitting, or extreme tantrums", "[C] Sibling rivalry and sharing disputes", "[D] Bedtime resistance and sleep battles"] }
    ],
    parameters: [{ name: "{{COACHING_METHOD}}", description: "Framework", validChoices: "Collaborative Problem Solving, Emotion Coaching", defaultFallback: "Emotion Coaching & Active Listening" }],
    workflow: ["Generate practical de-escalation scripts for parents in Google Docs.", "Build a visual daily routine chart in Google Sheets for the child.", "Create consistent bedtime wind-down schedule in Google Calendar."],
    guardrails: ["Never use physical punishment or shaming; focus on connection before correction."]
  },
  {
    num: 65,
    id: "extracurricular-talent-nurturing-plan",
    name: "Extracurricular, Sports & Creative Talent Nurturing Plan",
    department: "Home & Family: Parenting, Children & Education",
    description: "Balances sports, music, coding, and arts without burning out the child or overwhelming family weekend schedules.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Interest Area", prompt: "What domain does your child show excitement for?", options: ["[A] Swimming, Gymnastics, Team Sports", "[B] Musical Instrument (Piano, Guitar, Drums, Vocal)", "[C] Creative Arts, Drama, Debate, Public Speaking", "[D] Robotics, Chess, Coding, Math Olympiads"] }
    ],
    parameters: [{ name: "{{WEEKLY_HOURS}}", description: "Total extracurricular hours", validChoices: "2-4 hrs / 4-6 hrs weekly", defaultFallback: "3-4 hours weekly" }],
    workflow: ["Build a balanced weekly calendar in Google Calendar leaving at least 2 free play afternoons.", "Track academy credentials, coach ratios, and travel times in Google Sheets.", "Document child's progress milestones."],
    guardrails: ["Preserve unstructured free play; do not over-schedule childhood."]
  },
  {
    num: 66,
    id: "college-admissions-scholarship-navigator",
    name: "College Admissions, Essay Strategy & Scholarship Navigator",
    department: "Home & Family: Parenting, Children & Education",
    description: "Structures high school extracurricular narratives, Common App essays, standardized testing timelines (SAT/ACT), and merit scholarship hunting.",
    enabled: true, allowedTiers: ["INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "High School Grade", prompt: "What grade is the student currently in?", options: ["[A] 9th or 10th Grade (Early portfolio building)", "[B] 11th Grade (Crucial testing & essay prep)", "[C] 12th Grade (Active application season)", "[D] Gap Year / Transfer student"] }
    ],
    parameters: [{ name: "{{TARGET_MAJOR}}", description: "Intended field of study", validChoices: "Computer Science, Economics, Pre-Med, Design, Humanities", defaultFallback: "Interdisciplinary STEM / Business" }],
    workflow: ["Build College Application Tracker in Google Sheets (Deadlines, Essays, Letters of Rec, Financial Aid).", "Brainstorm authentic personal statement themes in Google Docs.", "Map SAT/ACT and AP testing calendar in Google Calendar.", "Research merit scholarship opportunities."],
    guardrails: ["Ensure the student writes their own essays; authenticity matters to admissions officers."]
  },
  {
    num: 67,
    id: "financial-literacy-money-lessons-kids",
    name: "Financial Literacy & Money Lessons for Kids & Teens",
    department: "Home & Family: Parenting, Children & Education",
    description: "Instills sound financial habits early through age-appropriate saving jars (Spend, Save, Give), debit cards for teens, and compound interest lessons.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Child Age Group", prompt: "What age is the child?", options: ["[A] 5 - 8 years (Cash, coin jars, tangible lessons)", "[B] 9 - 12 years (Allowances, budgeting, needs vs wants)", "[C] 13 - 15 years (Debit cards, digital transactions, compound interest)", "[D] 16 - 18 years (First job, bank accounts, investing basics)"] }
    ],
    parameters: [{ name: "{{CURRICULUM_TIER}}", description: "Age-appropriate lesson plan", validChoices: "Elementary / Middle / High School", defaultFallback: "Middle School Financial Literacy" }],
    workflow: ["Design interactive family chore and allowance system in Google Sheets.", "Draft 12 Monthly Money Challenges in Google Docs (grocery price comparison, simulated stock picks).", "Provide reading list of top youth finance books."],
    guardrails: ["Never tie basic family responsibilities (making bed) to money; compensate only for extra initiatives."]
  },
  {
    num: 68,
    id: "coparenting-family-workload-equalization",
    name: "Co-Parenting & Household Labor Equalization System",
    department: "Home & Family: Parenting, Children & Education",
    description: "Audits the invisible mental load of parenting (school forms, doctor appointments, playdates) and distributes domestic responsibilities equitably.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Current Balance", prompt: "How is household and childcare labor currently distributed?", options: ["[A] One partner carries 80%+ of mental load and chores", "[B] Divided, but frequent friction over daily logistics", "[C] Mostly equal, but needs structured system during busy work weeks", "[D] Co-parenting across separate households"] }
    ],
    parameters: [{ name: "{{OWNERSHIP_MODEL}}", description: "Task allocation framework", validChoices: "Full Ownership (Conception, Planning, Execution) / Shared", defaultFallback: "Full Card Ownership Framework" }],
    workflow: ["Audit all invisible household tasks in Google Sheets.", "Allocate 100% complete ownership of specific domains (e.g. one parent owns doctor + school entirely).", "Establish weekly 20-minute Sunday evening family sync in Google Calendar.", "Document agreement in Google Docs."],
    guardrails: ["When a partner owns a task, the other partner must refrain from micro-managing or second-guessing."]
  },
  {
    num: 69,
    id: "family-nutrition-picky-eater-resolution",
    name: "Family Nutrition & Picky Eater Meal Resolution",
    department: "Home & Family: Parenting, Children & Education",
    description: "Eliminates mealtime power struggles, introduces nutrient-dense foods gradually, and creates stress-free family dinners.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Picky Eating Severity", prompt: "What is the child's reaction to new vegetables and proteins?", options: ["[A] Mild: prefers familiar foods, but will taste if prompted", "[B] Moderate: refuses entire food groups (vegetables, proteins)", "[C] Severe: eats fewer than 10 safe foods; high anxiety at mealtime", "[D] Toddler food-throwing and refusal"] }
    ],
    parameters: [{ name: "{{DIVISION_OF_RESPONSIBILITY}}", description: "Ellyn Satter feeding model", validChoices: "Parent decides WHAT & WHEN; Child decides IF & HOW MUCH", defaultFallback: "Division of Responsibility" }],
    workflow: ["Design 14-day rotational family meal plan in Google Docs incorporating safe foods alongside novel exposures.", "Generate grocery list in Google Sheets.", "Provide food-chaining strategies (gradual texture and flavor stepping)."],
    guardrails: ["Never force-feed, bribe with dessert, or turn dining into a disciplinary battleground."]
  },
  {
    num: 70,
    id: "youth-career-guidance-aptitude-compass",
    name: "Youth Career Discovery & Aptitude Compass",
    department: "Home & Family: Parenting, Children & Education",
    description: "Helps teenagers identify authentic strengths, career trajectories, college majors, and shadowing opportunities without parental pressure.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Teenager Aptitude Profile", prompt: "Where do their natural inclinations lie?", options: ["[A] Analytical / Mathematical / Scientific", "[B] Creative / Design / Narrative / Visual", "[C] Social / Leadership / Communication / Entrepreneurship", "[D] Practical / Hands-on / Tinkering / Building"] }
    ],
    parameters: [{ name: "{{CAREER_CLUSTER}}", description: "Exploration field", validChoices: "STEM, Humanities, Law, Design, Commerce", defaultFallback: "Broad Exploratory Portfolio" }],
    workflow: ["Administer self-reflection strength assessment in Google Docs.", "Map out 5 high-growth career clusters with sample day-in-the-life profiles.", "Draft informational interview outreach emails to industry mentors.", "Create summer internship exploration roadmap."],
    guardrails: ["Encourage exploration of modern emerging careers; avoid forcing rigid legacy pathways."]
  },

  // ==========================================
  // CATEGORY 6: HOME & DOMESTIC LOGISTICS (Skills 71-82)
  // ==========================================
  {
    num: 71,
    id: "home-purchase-due-diligence-legal",
    name: "Home Purchase Due Diligence, Legal Check & Mortgage Optimizer",
    department: "Home & Family: Domestic Logistics, Homeownership & Assets",
    description: "Conducts property legal due diligence (Title deeds, Encumbrance certificate, RERA approvals, occupancy certs), and shops competitive mortgage rates.",
    enabled: true, allowedTiers: ["INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Property Status", prompt: "What type of property are you purchasing?", options: ["[A] Under-construction from builder (RERA registered)", "[B] Ready-to-move new construction from developer", "[C] Resale property from an individual owner", "[D] Independent plot / land for self-construction"] }
    ],
    parameters: [{ name: "{{LEGAL_DOCS_LIST}}", description: "Required title documents", validChoices: "Title deed (30 yrs), EC, RERA, Completion Cert, Khata", defaultFallback: "Full 30-Year Title Due Diligence" }],
    workflow: ["Generate a 25-point Property Legal Due Diligence Checklist in Google Docs.", "Build an accurate total acquisition cost calculator in Google Sheets (Stamp duty, registration, GST, interior costs).", "Compare bank home loan offers (repo-linked lending rate, processing fees).", "Create milestone disbursement schedule."],
    guardrails: ["Never transfer booking advance without preliminary title deed verification by an independent property lawyer."]
  },
  {
    num: 72,
    id: "home-renovation-contractor-bidding",
    name: "Home Renovation, Contractor Bidding & Cost Containment",
    department: "Home & Family: Domestic Logistics, Homeownership & Assets",
    description: "Standardizes Bill of Quantities (BOQ), vets interior contractors, prevents cost overruns, and enforces milestone-based escrow payments.",
    enabled: true, allowedTiers: ["INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Renovation Scope", prompt: "What is the scope of your interior/renovation work?", options: ["[A] Full apartment turnkey interior (Modular kitchen, wardrobes, false ceiling)", "[B] Partial remodel (Kitchen and bathrooms only)", "[C] Structural expansion / Independent house renovation", "[D] Painting, polishing, and minor aesthetic upgrades"] }
    ],
    parameters: [{ name: "{{BUDGET_CAP}}", description: "Total renovation budget", validChoices: "Budget provided by user", defaultFallback: "Turnkey Interior Budget" }],
    workflow: ["Build standardized Bill of Quantities (BOQ) spreadsheet in Google Sheets.", "Compare 3 contractor bids side-by-side on materials, brand specs, and labor costs.", "Draft milestone-based payment schedule tied to inspected delivery in Google Docs.", "Set inspection checkpoints in Google Calendar."],
    guardrails: ["Never pay more than 10-15% as advance; never release final 10% retention until snag-list is resolved."]
  },
  {
    num: 73,
    id: "vehicle-purchase-tco-comparison",
    name: "Vehicle Purchase: Total Cost of Ownership (EV vs Hybrid vs ICE)",
    department: "Home & Family: Domestic Logistics, Homeownership & Assets",
    description: "Models 5-year Total Cost of Ownership (Depreciation, insurance, fuel/charging, maintenance, loan interest) between Electric, Hybrid, and Petrol/Diesel vehicles.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Monthly Driving Distance", prompt: "How many kilometers/miles do you drive per month?", options: ["[A] Under 500 km / 300 miles (City errand car)", "[B] 500 - 1,200 km / 300 - 750 miles (Standard commute)", "[C] 1,200 - 2,500 km / 750 - 1,500 miles (Heavy daily commute)", "[D] 2,500+ km / Frequent highway road trips"] }
    ],
    parameters: [{ name: "{{POWERTRAIN}}", description: "Engine type", validChoices: "Electric / Strong Hybrid / Petrol / Diesel", defaultFallback: "EV vs Strong Hybrid vs Petrol" }],
    workflow: ["Build 5-year TCO financial comparison model in Google Sheets.", "Compare insurance quotes across multiple providers with zero-depreciation and engine protect riders.", "Generate negotiation checklist for dealership discounts in Google Docs.", "Schedule delivery inspection (PDI checklist)."],
    guardrails: ["Always conduct an independent PDI (Pre-Delivery Inspection) before vehicle registration."]
  },
  {
    num: 74,
    id: "annual-home-maintenance-preventive-schedule",
    name: "Annual Home Maintenance & Utility Inspection Calendar",
    department: "Home & Family: Domestic Logistics, Homeownership & Assets",
    description: "Schedules seasonal AC servicing, water purifier RO filter replacements, pest control, electrical panel safety, and roof waterproofing inspections.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Home Type", prompt: "What type of residence do you maintain?", options: ["[A] Managed Apartment Society", "[B] Gated Community Villa", "[C] Independent House", "[D] Rented Apartment"] }
    ],
    parameters: [{ name: "{{CLIMATE_ZONE}}", description: "Local weather pattern", validChoices: "Tropical monsoon, Dry arid, Extreme winter", defaultFallback: "Monsoon & Summer Preparation" }],
    workflow: ["Generate quarterly preventive maintenance calendar in Google Calendar.", "Create home equipment inventory in Google Sheets tracking warranty and serial numbers.", "Draft vendor service request templates in Google Docs."],
    guardrails: ["Inspect electrical earthing and smoke detector batteries at least once every 12 months."]
  },
  {
    num: 75,
    id: "domestic-staff-vetting-payroll-system",
    name: "Domestic Staff Hiring, Vetting & Payroll Management",
    department: "Home & Family: Domestic Logistics, Homeownership & Assets",
    description: "Standardizes domestic help hiring (cooks, housekeepers, drivers), police verification forms, fair wage contracts, and monthly salary tracking.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Staff Role", prompt: "Which position are you hiring or managing?", options: ["[A] Full-time Live-in Housekeeper / Cook", "[B] Part-time Day Maid / Cook / Cleaner", "[C] Personal Driver", "[D] Child Nanny / Elderly Attendant"] }
    ],
    parameters: [{ name: "{{SALARY_TERMS}}", description: "Monthly wage and paid leave terms", validChoices: "Terms provided by user", defaultFallback: "Standard Fair Wage Contract" }],
    workflow: ["Draft clear Scope of Work and Code of Conduct contract in Google Docs.", "Prepare Police Verification Form and ID verification checklist.", "Build monthly attendance and salary payout tracker in Google Sheets.", "Set monthly salary transfer reminders in Google Calendar."],
    guardrails: ["Always conduct identity and address verification before granting house keys."]
  },
  {
    num: 76,
    id: "sustainable-household-grocery-budget",
    name: "Sustainable Household Budgeting & Grocery Optimizer",
    department: "Home & Family: Domestic Logistics, Homeownership & Assets",
    description: "Cuts food waste, optimizes pantry inventory, and automates weekly bulk buying to reduce grocery expenditures by 20-30% without sacrificing quality.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Household Size", prompt: "How many people eat meals at home regularly?", options: ["[A] 1 - 2 people", "[B] 3 - 4 people (Nuclear family)", "[C] 5 - 7 people (Joint family)", "[D] 8+ people"] }
    ],
    parameters: [{ name: "{{GROCERY_CADENCE}}", description: "Shopping frequency", validChoices: "Weekly fresh + Monthly staples", defaultFallback: "Weekly fresh produce + Monthly bulk pantry" }],
    workflow: ["Build categorized master pantry list in Google Sheets.", "Design seasonal meal planning schedule reducing perishable waste.", "Compare prices across quick-commerce apps vs local wholesale markets in Google Docs.", "Set monthly restocking reminders in Google Calendar."],
    guardrails: ["Avoid bulk buying perishables that expire before consumption."]
  },
  {
    num: 77,
    id: "relocation-moving-logistics-coordinator",
    name: "Relocation, Moving & Cross-City Logistics Coordinator",
    department: "Home & Family: Domestic Logistics, Homeownership & Assets",
    description: "Coordinates moving house or cross-city relocation: packer and mover vetting, transit insurance, utility transfers, address updates, and unpacking schedules.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Move Distance", prompt: "What is the distance of your upcoming relocation?", options: ["[A] Local move within the same city (< 25 km)", "[B] Inter-state / Cross-country relocation", "[C] International cross-border relocation", "[D] Downsizing / Temporary storage move"] }
    ],
    parameters: [{ name: "{{MOVE_DATE}}", description: "Target moving day", validChoices: "Date provided by user", defaultFallback: "Upcoming Moving Date" }],
    workflow: ["Create an 8-week Moving Timeline in Google Docs.", "Build a Box-by-Box Inventory Spreadsheet in Google Sheets with color-coded room labels.", "Draft Mover RFP and compare 3 licensed moving quotes.", "List utility connection transfer steps in Google Tasks."],
    guardrails: ["Always mandate 'All-Risk Transit Insurance' with full declared value coverage."]
  },
  {
    num: 78,
    id: "home-insurance-disaster-risk-audit",
    name: "Homeowners & Renters Insurance Risk Audit",
    department: "Home & Family: Domestic Logistics, Homeownership & Assets",
    description: "Insures home structure and contents against fire, earthquake, flooding, burglary, and plumbing disasters with accurate valuation and minimal exclusions.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Ownership Status", prompt: "Do you own the home structure or rent?", options: ["[A] Homeowner (Need Structure + Contents cover)", "[B] Tenant / Renter (Need Contents + Personal Liability cover only)", "[C] Landlord (Need Structure + Loss of Rent cover)", "[D] Commercial / Home office"] }
    ],
    parameters: [{ name: "{{RECONSTRUCTION_VALUE}}", description: "Cost to rebuild structure excluding land", validChoices: "Reconstruction cost per sq ft", defaultFallback: "Current Construction Cost Valuation" }],
    workflow: ["Calculate accurate structure reconstruction cost (excluding land price) in Google Sheets.", "Compile high-value contents inventory (electronics, appliances, jewelry) with invoices in Google Drive.", "Compare policy quotes and deductibles in Google Docs.", "Set annual renewal reminder in Google Calendar."],
    guardrails: ["Do not insure the market value of the land (land does not burn or collapse; only insure reconstruction cost)."]
  },
  {
    num: 79,
    id: "decluttering-minimalism-spatial-reset",
    name: "Decluttering, Spatial Organization & Minimalist Living",
    department: "Home & Family: Domestic Logistics, Homeownership & Assets",
    description: "Implements systematic room-by-room decluttering, donation drives, and spatial storage principles to restore calm and order to your living space.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Primary Clutter Zone", prompt: "Which area is causing the most daily stress?", options: ["[A] Wardrobes, closets, and clothing overflow", "[B] Kitchen cabinets, pantry, and expired spices", "[C] Study, home office, wires, and old electronics", "[D] Garage, storage room, and miscellaneous boxes"] }
    ],
    parameters: [{ name: "{{METHODOLOGY}}", description: "Decluttering framework", validChoices: "KonMari, 4-Box Method, Minimalist 90/90 rule", defaultFallback: "4-Box Method (Keep, Donate, Sell, Trash)" }],
    workflow: ["Generate a 4-Weekend Decluttering Schedule in Google Calendar.", "Create a donation center and electronics recycling directory in Google Docs.", "Design wardrobe organization layout and storage bin guide in Google Sheets.", "Track progress milestones in Google Tasks."],
    guardrails: ["Never organize before decluttering; remove unwanted items completely before buying storage containers."]
  },
  {
    num: 80,
    id: "family-digital-security-password-vault",
    name: "Family Digital Security, Password Vault & Privacy Hardening",
    department: "Home & Family: Domestic Logistics, Homeownership & Assets",
    description: "Migrates the entire family to a secure password manager (1Password/Bitwarden), configures 2FA authenticator apps, and locks down home Wi-Fi security.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Current Password Storage", prompt: "How does your family store and remember passwords?", options: ["[A] Kept in browser autofill or written in notes/notebooks", "[B] Few passwords re-used across many sites", "[C] Individual password manager used, but not shared with family", "[D] Family vault with 2FA already set up"] }
    ],
    parameters: [{ name: "{{VAULT_PROVIDER}}", description: "Target password manager", validChoices: "Bitwarden / 1Password", defaultFallback: "Bitwarden / 1Password Family Vault" }],
    workflow: ["Provide step-by-step setup guide for family vault in Google Docs.", "Audit home Wi-Fi router (WPA3 encryption, guest network isolation for IoT devices).", "Implement Emergency Access Trustee configuration.", "Schedule quarterly security audit in Google Calendar."],
    guardrails: ["Never text master passwords or 2FA recovery seeds over WhatsApp or unencrypted chat."]
  },
  {
    num: 81,
    id: "emergency-disaster-preparedness-safe",
    name: "Disaster Preparedness & Essential Documents Safe",
    department: "Home & Family: Domestic Logistics, Homeownership & Assets",
    description: "Builds a physical 72-hour emergency Go-Bag (first aid, water purification, power banks) and organizes a fireproof essential document repository.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Geographic Disaster Risk", prompt: "What natural disasters occur in your region?", options: ["[A] Urban flooding / Monsoonal inundation", "[B] Seismic / Earthquake zone", "[C] Cyclones / Coastal severe storms", "[D] Power grid collapse / Heatwave / General emergency"] }
    ],
    parameters: [{ name: "{{FAMILY_MEMBERS_COUNT}}", description: "People in household", validChoices: "Count provided by user", defaultFallback: "4 people" }],
    workflow: ["Generate a 72-Hour Emergency Kit Checklist in Google Docs.", "Design an encrypted digital backup strategy for passports, birth certificates, and deeds in Google Drive.", "Create a family emergency meeting point and communication protocol.", "Set 6-month battery and food expiration check in Google Calendar."],
    guardrails: ["Store physical emergency documents in a certified water-tight, fireproof safe."]
  },
  {
    num: 82,
    id: "energy-efficiency-solar-utility-reduction",
    name: "Home Energy Efficiency, Solar ROI & Utility Bill Reduction",
    department: "Home & Family: Domestic Logistics, Homeownership & Assets",
    description: "Audits electrical vampire loads, calculates rooftop solar panel ROI and government subsidies, and slashes recurring electricity and water utility bills.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Average Monthly Electricity Bill", prompt: "What is your typical monthly power bill?", options: ["[A] Under ₹3,000 / $50", "[B] ₹3,000 - ₹8,000 / $50 - $120", "[C] ₹8,000 - ₹20,000 / $120 - $300", "[D] ₹20,000+ / $300+"] }
    ],
    parameters: [{ name: "{{ROOF_ACCESS}}", description: "Rooftop solar feasibility", validChoices: "Own private roof / Society shared roof / No roof access", defaultFallback: "Grid-Tied Rooftop Solar Model" }],
    workflow: ["Calculate rooftop solar capacity and payback period in Google Sheets factoring in net metering and subsidies.", "Audit high-draw appliances (Inverter ACs, heat pump geysers).", "Generate energy conservation checklist in Google Docs.", "Track monthly utility reduction in Google Sheets."],
    guardrails: ["Verify grid-tie net metering feasibility with your local distribution utility before purchasing solar equipment."]
  },

  // ==========================================
  // CATEGORY 7: WORK & TEAMS - EXECUTIVE PRESENCE (Skills 83-92)
  // ==========================================
  {
    num: 83,
    id: "board-investor-update-synthesis",
    name: "Board of Directors & Investor Update Synthesis",
    department: "Work & Teams: Executive Presence, Projects & Communications",
    description: "Compiles monthly investor updates, board memos, and executive operating metrics into a crisp, high-signal format (Highlights, Lowlights, Runway, Asks).",
    enabled: true, allowedTiers: ["INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Update Cadence", prompt: "How frequently do you report to investors or board members?", options: ["[A] Monthly Investor Update", "[B] Quarterly Board Deck & Formal Meeting", "[C] Annual Shareholder Review", "[D] Emergency / Runway extension update"] }
    ],
    parameters: [{ name: "{{CORE_METRIC}}", description: "North star metric", validChoices: "ARR, Burn Multiple, Net Retention, EBITDA", defaultFallback: "ARR & Net Cash Burn" }],
    workflow: ["Synthesize key financial metrics (Revenue, Burn, Cash Runway, Headcount) in Google Sheets.", "Draft executive update following the gold-standard memo format in Google Docs.", "Draft slide concepts in Google Slides.", "Compile concrete 'Asks' for investor support."],
    guardrails: ["Never sugarcoat lowlights; sophisticated investors value early transparency and rigorous mitigation plans."]
  },
  {
    num: 84,
    id: "high-stakes-diplomatic-email-architect",
    name: "High-Stakes Email & Diplomatic Communication Architect",
    department: "Work & Teams: Executive Presence, Projects & Communications",
    description: "Drafts nuanced, politically astute emails for delicate business situations: declining client demands, addressing delayed deliverables, and resolving executive impasses.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Communication Stakes", prompt: "What is the primary objective of this sensitive message?", options: ["[A] Push back on an unreasonable client or executive request without damaging the relationship", "[B] Announce a project delay or miss while retaining trust", "[C] Negotiate contract scope creep or billable rate increases", "[D] De-escalate a heated email thread with an angry stakeholder"] }
    ],
    parameters: [{ name: "{{DESIRED_TONE}}", description: "Tone of communication", validChoices: "Firm & Professional / Warm & Collaborative / Formal & Legalistic", defaultFallback: "Diplomatic, Firm & Solution-Oriented" }],
    workflow: ["Analyze stakeholder incentives and emotional triggers.", "Draft message in Gmail draft format with clear call to action and zero passive-aggressive phrasing.", "Provide 2 alternative tone options (Firm vs Soft) in Google Docs.", "Submit draft for user's explicit approval before sending."],
    guardrails: ["Review carefully to ensure zero accusations; anchor strictly on shared goals and business facts."]
  },
  {
    num: 85,
    id: "conflict-resolution-difficult-conversations",
    name: "Conflict Resolution & Difficult Team Conversations",
    department: "Work & Teams: Executive Presence, Projects & Communications",
    description: "Prepares managers and peers for tense interpersonal conversations (underperformance, broken trust, territorial disputes) using Non-Violent Communication.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Conflict Dynamic", prompt: "Who is the other party in this conflict?", options: ["[A] Direct report (Performance or attitude issue)", "[B] Peer / Cross-functional team lead (Resource battle, territorial dispute)", "[C] Superior / Boss (Unrealistic demands, micromanagement)", "[D] Co-founder / Business partner (Strategic misalignment)"] }
    ],
    parameters: [{ name: "{{CONVERSATION_FRAMEWORK}}", description: "Discussion methodology", validChoices: "Situation-Behavior-Impact (SBI), Non-Violent Communication", defaultFallback: "Situation-Behavior-Impact (SBI) Model" }],
    workflow: ["Separate objective verifiable facts from subjective emotional judgments.", "Draft word-for-word conversation script in Google Docs.", "Anticipate defensive counter-reactions and prepare de-escalation responses.", "Schedule meeting in Google Calendar with neutral agenda title."],
    guardrails: ["Focus on the specific behavior and observable business impact; never attack character or personality."]
  },
  {
    num: 86,
    id: "cross-functional-project-charter-tracker",
    name: "Cross-Functional Project Charter & Milestone Tracker",
    department: "Work & Teams: Executive Presence, Projects & Communications",
    description: "Aligns engineering, product, marketing, and legal teams with a crystal-clear Project Charter, DACI decision rights, and automated milestone tracking.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Project Scope", prompt: "What type of initiative are you kicking off?", options: ["[A] Major Product Launch / Software Release", "[B] Enterprise Client Implementation", "[C] Internal Process / ERP / CRM Migration", "[D] Company-wide strategic initiative"] }
    ],
    parameters: [{ name: "{{DECISION_MODEL}}", description: "Governance framework", validChoices: "DACI (Driver, Approver, Contributor, Informed) / RACI", defaultFallback: "DACI Decision Framework" }],
    workflow: ["Draft 1-page Project Charter in Google Docs (Problem statement, non-goals, key stakeholders).", "Build comprehensive Gantt milestone tracker in Google Sheets.", "Set automated milestone alerts in Google Calendar.", "Create kickoff deck outline in Google Slides."],
    guardrails: ["Clearly document 'Non-Goals' to prevent scope creep."]
  },
  {
    num: 87,
    id: "meeting-audit-async-work-migration",
    name: "Meeting Elimination Audit & Async Work Migration",
    department: "Work & Teams: Executive Presence, Projects & Communications",
    description: "Audits your organization's recurring meetings, eliminates 30%+ of calendar waste, and implements high-efficiency written memos and async updates.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Meeting Load", prompt: "How many recurring status meetings take place weekly?", options: ["[A] 5 - 10 meetings (Moderate)", "[B] 10 - 20 meetings (Heavy)", "[C] 20+ meetings (Severe calendar gridlock)", "[D] Daily standups that drag on > 30 mins"] }
    ],
    parameters: [{ name: "{{SAVINGS_TARGET}}", description: "Target meeting reduction", validChoices: "25% / 40% / No-Meeting Wednesdays", defaultFallback: "35% Meeting Time Reduction" }],
    workflow: ["Audit all recurring calendar invites for participant count and objective.", "Convert low-value status updates into async written Google Docs / Slack memos.", "Establish 'No-Meeting Focus Days' in Google Calendar.", "Calculate total payroll dollars saved from reclaimed hours in Google Sheets."],
    guardrails: ["Preserve 1-on-1s and genuine brainstorming sessions; eliminate pure broadcast meetings."]
  },
  {
    num: 88,
    id: "team-hiring-scorecard-interview-protocol",
    name: "Team Hiring Scorecard & Structured Interview Protocol",
    department: "Work & Teams: Executive Presence, Projects & Communications",
    description: "Eliminates hiring bias and false positives by creating competency scorecards, standardized behavioral questions, and candidate evaluation rubrics.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Role Being Hired", prompt: "What role are you actively interviewing for?", options: ["[A] Software Engineering / Technical", "[B] Product Management / Design", "[C] Sales, Business Development & Account Executive", "[D] Operations, Finance, or Executive leadership"] }
    ],
    parameters: [{ name: "{{EVALUATION_RUBRIC}}", description: "Scorecard criteria", validChoices: "Competencies, Culture, Track Record, Problem Solving", defaultFallback: "Structured 5-Competency Scorecard" }],
    workflow: ["Design Role Scorecard in Google Sheets with 5 core competencies and rating definitions (1-5 scale).", "Draft standardized behavioral questions with grading rubrics in Google Docs.", "Create candidate debrief calibration template.", "Schedule interview blocks in Google Calendar."],
    guardrails: ["Score candidates immediately post-interview before consulting other interviewers to avoid groupthink."]
  },
  {
    num: 89,
    id: "vendor-rfp-contract-negotiator",
    name: "Vendor RFP Evaluation & Software Contract Negotiator",
    department: "Work & Teams: Executive Presence, Projects & Communications",
    description: "Standardizes enterprise software and agency RFPs, compares competitive vendor bids, and negotiates 20-40% SaaS license discounts.",
    enabled: true, allowedTiers: ["INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Procurement Category", prompt: "What are you procuring?", options: ["[A] Enterprise SaaS / Cloud Software licenses (Salesforce, AWS, Google Cloud)", "[B] Marketing / Design / PR Agency retainer", "[C] External Engineering development shop", "[D] Professional services (Legal, Accounting, Audit)"] }
    ],
    parameters: [{ name: "{{CONTRACT_VALUE}}", description: "Annual contract spend", validChoices: "Value provided by user", defaultFallback: "Annual Software Spend" }],
    workflow: ["Generate structured Request for Proposal (RFP) in Google Docs.", "Build side-by-side vendor scoring matrix in Google Sheets comparing features, SLA, security, and pricing.", "Draft enterprise negotiation email counter-proposals.", "Set contract renewal notification 90 days prior in Google Calendar."],
    guardrails: ["Never accept initial vendor price quotes; enterprise software typically has 30-50% discounting margin."]
  },
  {
    num: 90,
    id: "crisis-communication-pr-deescalation",
    name: "Crisis Communication & Public Relations De-escalation",
    department: "Work & Teams: Executive Presence, Projects & Communications",
    description: "Manages public relations emergencies, data incidents, customer outrage, and executive messaging during critical brand reputation threats.",
    enabled: true, allowedTiers: ["ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Crisis Nature", prompt: "What is the severity and type of crisis?", options: ["[A] Security / Data Breach incident", "[B] Product outage / Service disruption affecting customers", "[C] Public social media backlash / Viral PR controversy", "[D] Internal employee grievance / Leadership transition"] }
    ],
    parameters: [{ name: "{{SPOKESPERSON}}", description: "Designated communications lead", validChoices: "CEO, Head of PR, Legal Counsel", defaultFallback: "Executive Leadership Team" }],
    workflow: ["Establish 24-hour crisis response war-room document in Google Docs.", "Draft customer apology and remediation notification in Google Docs.", "Create holding statements for press and social media channels.", "Set up media monitoring and sentiment tracking in Google Sheets."],
    guardrails: ["Never issue defensive or legally dubious denials; take accountable responsibility and outline clear remediation."]
  },
  {
    num: 91,
    id: "strategic-okr-formulation-alignment",
    name: "Strategic OKR (Objectives & Key Results) Formulation",
    department: "Work & Teams: Executive Presence, Projects & Communications",
    description: "Formulates ambitious, measurable Objectives and Key Results (OKRs), cascading company priorities into clear team metrics without confusing activity with impact.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Planning Cycle", prompt: "What timeframe are you setting OKRs for?", options: ["[A] Annual Strategic OKRs", "[B] Quarterly Operating OKRs (Q1/Q2/Q3/Q4)", "[C] Specific Sprint / Product Launch OKRs", "[D] Team or Individual Performance OKRs"] }
    ],
    parameters: [{ name: "{{AMBITION_LEVEL}}", description: "Committed vs Moonshot OKRs", validChoices: "Committed (100% target) / Stretch (70% expected target)", defaultFallback: "Balanced Committed & Stretch OKRs" }],
    workflow: ["Draft 3 qualitative Objectives and 3-5 quantitative Key Results per objective in Google Docs.", "Build real-time OKR tracking dashboard in Google Sheets.", "Schedule bi-weekly progress check-ins in Google Calendar.", "Design quarterly retrospective presentation outline in Google Slides."],
    guardrails: ["Key Results must be numerical outcomes (e.g. 'Increase conversion from 2% to 4%'), never task checklists ('Build landing page')."]
  },
  {
    num: 92,
    id: "executive-presentation-deck-builder",
    name: "Executive Presentation Deck & Business Narrative Builder",
    department: "Work & Teams: Executive Presence, Projects & Communications",
    description: "Transforms dense operational data into high-conviction executive slide decks, synthesizing market opportunities, competitive moats, and financial models.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Presentation Objective", prompt: "What decision must the audience make after seeing this deck?", options: ["[A] Approve budget / Capital investment", "[B] Greenlight product strategy / Roadmap", "[C] Realign organizational structure", "[D] Commercial partnership sign-off"] }
    ],
    parameters: [{ name: "{{DECK_LENGTH}}", description: "Slide count", validChoices: "10-slide executive pitch / 15-slide board deep dive", defaultFallback: "10-12 Slide Executive Presentation" }],
    workflow: ["Structure presentation narrative in Google Docs using the Minto Pyramid Principle.", "Create Google Slides presentation with title, thesis, and structured content slides.", "Format key comparison tables and charts.", "Provide single direct link to the Google Slides presentation."],
    guardrails: ["Deliver strictly ONE single link to the full presentation deck; never output slide-by-slide links."]
  },

  // ==========================================
  // CATEGORY 8: META SKILLS - COGNITIVE ARCHITECTURE & RESEARCH (Skills 93-100)
  // ==========================================
  {
    num: 93,
    id: "autonomous-deep-web-research-engine",
    name: "Autonomous Multi-Source Deep Web Research Engine",
    department: "Meta Skills: Cognitive Architecture, Research & System Discretion",
    description: "Autonomously searches the web, analyzes academic literature, verifies claims across multiple independent sources, and synthesizes authoritative briefing memos.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Research Depth", prompt: "What depth of synthesis do you require?", options: ["[A] Rapid Executive Summary (1-page, top findings & citations)", "[B] Deep Multi-Angle Analysis (Comprehensive comparative report)", "[C] Fact-checking & Source Verification", "[D] Competitive Landscape & Market Intelligence"] }
    ],
    parameters: [{ name: "{{RESEARCH_TOPIC}}", description: "Core inquiry topic", validChoices: "User prompt query", defaultFallback: "Current Inquiry Topic" }],
    workflow: ["Deconstruct user topic into multiple specific search queries.", "Execute autonomous web searches across academic, industry, and news sources.", "Cross-reference facts and eliminate promotional bias.", "Synthesize findings into an executive Google Doc with verified source links."],
    guardrails: ["Always cite primary sources; flag when industry consensus is divided or evidence is speculative."]
  },
  {
    num: 94,
    id: "workspace-context-subtraction-engine",
    name: "Workspace Context Subtraction & Knowledge Extraction",
    department: "Meta Skills: Cognitive Architecture, Research & System Discretion",
    description: "Scans user's existing Google Drive documents, Sheets, and Gmail threads to extract known context, asking ONLY what is genuinely missing.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Target Workspace Data", prompt: "Where is your background context stored?", options: ["[A] In Google Drive documents and folders", "[B] In recent Gmail threads and attachments", "[C] In Google Sheets models", "[D] Spread across Drive, Gmail, and chat history"] }
    ],
    parameters: [{ name: "{{SEARCH_QUERY}}", description: "Target document search keywords", validChoices: "Query based on task", defaultFallback: "Relevant Project Documents" }],
    workflow: ["Query Google Drive files and recent Gmail threads for relevant keywords.", "Extract existing parameters, decisions, and constraints.", "Subtract all known information from the active prompt.", "Ask only the remaining critical questions with clear multiple-choice options."],
    guardrails: ["Respect user privacy; access only files directly relevant to the user's active prompt."]
  },
  {
    num: 95,
    id: "blindspot-assumption-stress-tester",
    name: "Blindspot & Assumption Stress-Tester (Devil's Advocate)",
    department: "Meta Skills: Cognitive Architecture, Research & System Discretion",
    description: "Rigorously attacks your business plans, major life decisions, and financial assumptions to uncover hidden blindspots and catastrophic failure modes.",
    enabled: true, allowedTiers: ["INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Decision Under Review", prompt: "What plan or decision are we stress-testing?", options: ["[A] Major career pivot / Resignation / Venture launch", "[B] Real estate purchase / Large financial investment", "[C] Corporate product strategy / Enterprise deal terms", "[D] Key relationship or personal life commitment"] }
    ],
    parameters: [{ name: "{{FAILURE_MODE_DEPTH}}", description: "Red team intensity", validChoices: "Gentle critique / Rigorous Red Team Stress Test", defaultFallback: "Rigorous Pre-Mortem Red Team Analysis" }],
    workflow: ["Conduct a structured Pre-Mortem: assume the plan failed catastrophically 2 years from now.", "Identify top 5 failure vectors (market shift, cash dry-up, partner dispute, health shock).", "Generate a Risk Mitigation & Contingency Plan in Google Docs.", "Build an assumption-testing checklist in Google Tasks."],
    guardrails: ["Offer constructive solutions for every vulnerability identified; avoid cynical paralysis."]
  },
  {
    num: 96,
    id: "high-stakes-decision-expected-value",
    name: "High-Stakes Decision Matrix & Expected Value Calculator",
    department: "Meta Skills: Cognitive Architecture, Research & System Discretion",
    description: "Applies decision science, probability trees, and expected value (EV) calculations to resolve complex dilemmas with incomplete information.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Dilemma Structure", prompt: "How many mutually exclusive paths are you weighing?", options: ["[A] Binary choice: Path A vs Path B (e.g. Stay vs Leave)", "[B] Multiple options (3 - 5 competing opportunities)", "[C] Go vs No-Go on a single high-risk venture", "[D] Sequence / Timing dilemma (Now vs Later)"] }
    ],
    parameters: [{ name: "{{DECISION_CRITERIA}}", description: "Weighted decision criteria", validChoices: "Financial upside, Mental peace, Autonomy, Health, Family impact", defaultFallback: "Weighted Multi-Criteria Decision Model" }],
    workflow: ["Structure decision options and assign probability-weighted outcomes in Google Sheets.", "Calculate net expected monetary and subjective life-satisfaction value.", "Generate a 1-page Decision Memorandum in Google Docs.", "Schedule a 6-month decision review in Google Calendar."],
    guardrails: ["Distinguish between decisions under risk (known odds) vs decisions under deep uncertainty (unknown unknowns)."]
  },
  {
    num: 97,
    id: "zero-pii-sanitization-firewall",
    name: "Zero-PII Data Sanitization & Cryptographic Security Firewall",
    department: "Meta Skills: Cognitive Architecture, Research & System Discretion",
    description: "Automatically intercepts, redacts, and cryptographically isolates personal identifiable information (PII) before external API processing.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Data Sensitivity", prompt: "What type of data is being handled?", options: ["[A] General productivity and research queries", "[B] Corporate confidential / Non-disclosure agreements", "[C] Financial numbers, net worth, bank statements", "[D] Personal medical and health records"] }
    ],
    parameters: [{ name: "{{ENCRYPTION_LEVEL}}", description: "Encryption standard", validChoices: "AES-256-GCM / Ephemeral In-Memory", defaultFallback: "AES-256-GCM Sovereign Storage" }],
    workflow: ["Inspect active prompt text for telephone numbers, social security IDs, full credit card numbers, and secret keys.", "Strip or mask identifiers before external tool queries.", "Verify zero-PII leakage across MCP exports and third-party integrations.", "Log security audit events."],
    guardrails: ["Never log unmasked sensitive credentials or medical identifiers in plain text."]
  },
  {
    num: 98,
    id: "time-cognitive-bandwidth-allocator",
    name: "Time & Cognitive Bandwidth ROI Allocator",
    department: "Meta Skills: Cognitive Architecture, Research & System Discretion",
    description: "Audits where your attention, emotional energy, and time actually went this week vs your stated life values, calculating your true cognitive ROI.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Attention Leak", prompt: "Where is your mental bandwidth being consumed without producing joy or growth?", options: ["[A] Minor administrative friction, email replies, and chores", "[B] Low-yield workplace politics and unproductive meetings", "[C] Compulsive news tracking and social media doomscrolling", "[D] Rumination over unresolved past decisions"] }
    ],
    parameters: [{ name: "{{TARGET_LIFE_VALUES}}", description: "Core life anchors", validChoices: "Family, Mastery, Health, Financial Freedom", defaultFallback: "Health, Deep Work, Family Connection" }],
    workflow: ["Audit Google Calendar hours spent across 4 quadrants: Deep Leverage, Maintenance, Obligation, and Waste.", "Build weekly time allocation model in Google Sheets.", "Formulate delegation and elimination rules in Google Docs.", "Set Sunday evening reflection reminder in Google Calendar."],
    guardrails: ["Time is non-renewable; treat attention as your scarcest asset."]
  },
  {
    num: 99,
    id: "cross-disciplinary-mental-model-synthesizer",
    name: "Cross-Disciplinary Mental Model Synthesizer",
    department: "Meta Skills: Cognitive Architecture, Research & System Discretion",
    description: "Solves intractable life and business problems by applying fundamental mental models from physics, evolutionary biology, economics, and game theory.",
    enabled: true, allowedTiers: ["INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Problem Type", prompt: "What kind of challenge are you trying to crack?", options: ["[A] Complex system stagnation / Bottleneck in business or team", "[B] Competitive dynamics / Game theory interaction with an adversary", "[C] Incentives misalignment / Getting people to act differently", "[D] Personal creative block / Stuck in conventional thinking"] }
    ],
    parameters: [{ name: "{{PRIMARY_MODELS}}", description: "Selected mental models", validChoices: "First Principles, Inversion, Second-Order Thinking, Antifragility", defaultFallback: "Inversion & Second-Order Thinking" }],
    workflow: ["Reframe the user's problem through Inversion ('How could we guarantee failure?').", "Apply Second-Order Thinking ('And then what happens?').", "Synthesize counter-intuitive solutions in Google Docs.", "Create action checklist in Google Tasks."],
    guardrails: ["Avoid academic pedantry; deliver immediate, pragmatic real-world actions."]
  },
  {
    num: 100,
    id: "executive-chief-of-staff-briefing",
    name: "Executive Chief of Staff Daily Action Digest",
    department: "Meta Skills: Cognitive Architecture, Research & System Discretion",
    description: "Synthesizes your upcoming schedule, unread high-priority emails, pending task deadlines, and strategic priorities into a 2-minute morning briefing.",
    enabled: true, allowedTiers: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ADMIN"],
    quickQuestions: [
      { title: "Briefing Delivery Time", prompt: "When do you want your morning Chief of Staff digest ready?", options: ["[A] Early Morning (6:30 AM - 7:30 AM)", "[B] Workday Start (8:30 AM - 9:00 AM)", "[C] On-demand when I open Life OS", "[D] Evening before (planning next day)"] }
    ],
    parameters: [{ name: "{{BRIEFING_FORMAT}}", description: "Format of digest", validChoices: "Concise bulleted action items / Structured 3-section memo", defaultFallback: "Top 3 Priorities + Calendar Overview + Red Flags" }],
    workflow: ["Scan Google Calendar for today's schedule and conflict overlaps.", "Scan unread Gmail for urgent stakeholder requests.", "Pull highest-priority Google Tasks due today.", "Synthesize a 1-page Action Digest in Google Docs.", "Deliver brief, empowering summary in chat."],
    guardrails: ["Keep the summary strictly under 300 words for instant scanning; highlight immediate red flags prominently."]
  }
];

SKILLS_DATA.push(...FINAL_SKILLS);

console.log(`Total skills generated: ${SKILLS_DATA.length}`);
if (SKILLS_DATA.length !== 100) {
  console.error(`Error: Expected 100 skills, got ${SKILLS_DATA.length}`);
  process.exit(1);
}

const outputPath = path.join(__dirname, '..', 'lib', 'skills-data.json');
fs.writeFileSync(outputPath, JSON.stringify(SKILLS_DATA, null, 2), 'utf8');
console.log(`Successfully wrote all 100 Life OS Skills to ${outputPath}`);

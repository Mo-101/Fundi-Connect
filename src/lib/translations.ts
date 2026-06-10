export interface TranslationDic {
  brand_msg: string;
  hero_tag: string;
  hero_title: string;
  hero_title_accent: string;
  hero_desc: string;
  dial_code: string;
  btn_terminal: string;
  btn_emulator: string;
  feature_offline_title: string;
  feature_offline_desc: string;
  feature_escrow_title: string;
  feature_escrow_desc: string;
  feature_kiosk_title: string;
  feature_kiosk_desc: string;
  
  // Tabs
  tab_market: string;
  tab_gigs: string;
  tab_baraza: string;
  tab_ledger: string;
  tab_workbench: string;
  tab_standing: string;

  // Persona
  persona_title: string;
  persona_subtitle: string;
  persona_client: string;
  persona_fundi: string;
  persona_elder: string;
  persona_guest: string;

  // Worker Detail / Humanizing
  back_to_catalog: string;
  worker_profile_title: string;
  detail_bio: string;
  detail_rate: string;
  detail_completed: string;
  detail_rating: string;
  detail_specialty: string;
  trust_logs_title: string;
  trust_index_title: string;
  trust_verification_metric: string;
  ai_validation_title: string;
  radar_title: string;
  radar_subtitle: string;
  radar_hover_hint: string;
  dispatch_label: string;

  // Workbench & Terminal / Humanizing
  workbench_title: string;
  workbench_subtitle: string;
  discover_work_title: string;
  discover_work_desc: string;
  sponsor_program_title: string;
  sponsor_program_desc: string;
  active_queue_title: string;
  active_queue_sync: string;
  ledger_log_title: string;
  ledger_log_subtitle: string;
  ledger_rule_title: string;
  ledger_rule_subtitle: string;

  // Authentic Kenyan Cultural Additions & Empty States
  empty_jobs_title: string;
  empty_jobs_desc: string;
  empty_comments_title: string;
  empty_comments_desc: string;
  
  // Kenyan microcopy adaptive statuses
  job_completed_praise: string;
  payment_received: string;
  incoming_job_alert: string;
  profile_viewed_alert: string;
  review_received: string;
  no_jobs_nearby: string;

  // Baraza Rotating Proverbs
  baraza_wisdom_title: string;
  proverbs_list: string[];
}

export const translations: Record<"eng" | "swa" | "sheng", TranslationDic> = {
  eng: {
    brand_msg: "COOPERATIVE LABOUR INTERFACE // NAIROBI CELL",
    hero_tag: "COMMUNITY LABOR MESH & LOCAL COOPERATIVE NETWORK",
    hero_title: "DIRECT CONNECTIONS TO TRUSTED",
    hero_title_accent: "NEIGHBORHOOD FUNDIS.",
    hero_desc: "No corporate bosses. No payroll cuts. Just reliable local plumbers, electricians, masons, and solar installers direct to you. Dial our offline USSD channel to find work or hire instantly even without an internet bundles.",
    dial_code: "DIAL *384# FOR OFFLINE USSD",
    btn_terminal: "OPEN WORKBENCH MARKET",
    btn_emulator: "DIAL USSD SIMULATOR",
    feature_offline_title: "100% Offline Support",
    feature_offline_desc: "Operate strictly over basic USSD codes (*384#) and SMS. Our system is built so that feature phone owners get equal access to jobs.",
    feature_escrow_title: "Asante Handshake Ledger",
    feature_escrow_desc: "Tip what you wish! Direct peer gratuity over stablecoins with zero commission broker taxes. 100% of the wage goes to the worker.",
    feature_kiosk_title: "Our Physical Baraza Hubs",
    feature_kiosk_desc: "Physical neighborhood kiosks serve as face-to-face trust hubs for onboarding, dispute mediation by community elders, and tool sharing.",
    
    tab_market: "Find a Fundi",
    tab_gigs: "Jobs Board",
    tab_baraza: "Baraza Forum",
    tab_ledger: "Asante Ledger",
    tab_workbench: "My Workbench",
    tab_standing: "My Standing",

    persona_title: "Switch Your Interface View",
    persona_subtitle: "Experience FundiConnect from different community perspectives:",
    persona_client: "Hiring Client",
    persona_fundi: "Active Fundi (Handyman)",
    persona_elder: "Elder / Vouch Guardian",
    persona_guest: "New Joiner (Register)",

    // Worker Detail / Humanizing
    back_to_catalog: "← RETURN TO FIND A FUNDI",
    worker_profile_title: "Fundi Details",
    detail_bio: "About this Fundi",
    detail_rate: "Hourly Service Pay",
    detail_completed: "Completed Jobs",
    detail_rating: "What Clients Say",
    detail_specialty: "Specialized Local Handiwork",
    trust_logs_title: "Community Vouch & Trust History",
    trust_index_title: "Reputation Badge Index",
    trust_verification_metric: "PEER REPUTATION METRIC",
    ai_validation_title: "Local Community Trust Check Up",
    radar_title: "Nairobi Areas Where I Work",
    radar_subtitle: "LOCAL NEIGHBORHOOD AREA",
    radar_hover_hint: "HOVER CIRCLES TO SEE PLACES IN NAIROBI",
    dispatch_label: "ESTIMATED ARRIVAL TIME FROM BASE:",

    // Workbench & Terminal / Humanizing
    workbench_title: "My Workbench Terminal",
    workbench_subtitle: "Active Control Deck",
    discover_work_title: "Find Daily Jobs",
    discover_work_desc: "Browse requested jobs matching your craft in Nairobi neighborhoods.",
    sponsor_program_title: "Sponsor SMS & Baraza",
    sponsor_program_desc: "Fund local network costs with a tiny tip so offline fundis receive jobs.",
    active_queue_title: "My Assigned Work Today",
    active_queue_sync: "LIVE REALTIME QUEUE",
    ledger_log_title: "My Asante Payment & Receipt History",
    ledger_log_subtitle: "M-Pesa & Mobile Wallet Logs",
    ledger_rule_title: "District Guidelines & Community Vows",
    ledger_rule_subtitle: "Elder Vouched Standard Rules",

    // Authentic Kenyan Cultural Additions & Empty States
    empty_jobs_title: "Even construction stopped today 😄",
    empty_jobs_desc: "There are no new jobs listed around your area right now.",
    empty_comments_title: "No comments yet.",
    empty_comments_desc: "Be the first to step up and work to land on the radar!",
    
    job_completed_praise: "Well done! The client is fully satisfied.",
    payment_received: "Money has arrived. Double checks cleared successfully.",
    incoming_job_alert: "Hey Fundi! A new job just dropped in your neighborhood.",
    profile_viewed_alert: "Someone is reviewing your profile right now.",
    review_received: "You have been left a new review log.",
    no_jobs_nearby: "It's quiet today. Don't worry, jobs drop any minute now.",

    baraza_wisdom_title: "BARAZA COOPERATIVE WISDOM PROVERB",
    proverbs_list: [
      "Haste haste has no blessing (Haraka haraka haina baraka).",
      "A good job advertises itself (Kazi nzuri hujitangaza yenyewe).",
      "One finger cannot kill a lice (Kidole kimoja hakivunji chawa).",
      "He who is praised highly, still wakes up to labor tomorrow.",
      "The sweat of honest work is never lost."
    ]
  },
  swa: {
    brand_msg: "MFUMO WA USHIRIKIANO WA KAZI // KITWO CHA NAIROBI",
    hero_tag: "MTANDAO WA KUZALENDO WA MAFUNDI NA USHIRIKIANO WA KAWAIDA",
    hero_title: "UNGANISHWA MOJA KWA MOJA NA",
    hero_title_accent: "MAFUNDI WA MTAA WAKO.",
    hero_desc: "Hakuna mabosi wa makampuni. Hakuna ushuru wa mishahara. Pata mafundi bomba, stima, wajenzi, na wataalamu wa solar wa kuaminika mtaani kwako. Dial USSD yetu ya offline ili kupata kazi au kuajiri bila hitaji la bando ya internet.",
    dial_code: "PIGA *384# BILA BANDO",
    btn_terminal: "FUNGUA SOKO LA KAZI",
    btn_emulator: "JARIBU USSD SIMULATOR",
    feature_offline_title: "Ufikiaji dhabiti bila bando",
    feature_offline_desc: "Fanya kazi kupitia nambari ya simu ya kawaida bila bando (*384#) na SMS. Mfumo wetu umetayarishwa ili kila mwenye kamulula apate riziki.",
    feature_escrow_title: "Ledger ya Asante na Shukrani",
    feature_escrow_desc: "Toa shukrani upendavyo! Malipo ya moja kwa moja bila makato yoyote ya dalali. Pesa yote ya jasho lako inaenda kwako mifukoni.",
    feature_kiosk_title: "Vibanda vyetu vya Baraza",
    feature_kiosk_desc: "Vibanda halisi mtaani hufanya kazi kama sehemu ya kujenga uaminifu, utatuzi wa migogoro na wazee, na ukodishaji vya vifaa.",
    
    tab_market: "Tafuta Fundi",
    tab_gigs: "Kazi Zinatafutwa",
    tab_baraza: "Baraza ya Kimaslahi",
    tab_ledger: "Kijitabu cha Asante",
    tab_workbench: "Base Yangu ya Kazi",
    tab_standing: "Nyota yangu mtaani",

    persona_title: "Badilisha Mtazamo Wako",
    persona_subtitle: "Angalia jinsi FundiConnect inavyofanya kazi kupitia macho tofauti mtaani:",
    persona_client: "Mteja wa Kazi",
    persona_fundi: "Active Fundi (Mtaalamu)",
    persona_elder: "Mzee wa Baraza / Msimamizi",
    persona_guest: "Mgeni Mpya (Sajili)",

    // Worker Detail / Humanizing
    back_to_catalog: "← RUDI SOKO LA MAFUNDI",
    worker_profile_title: "Maelezo ya Fundi",
    detail_bio: "Kuhusu huyu Jahazi",
    detail_rate: "Kiwango cha Malipo kwa Saa",
    detail_completed: "Kazi Alizofanya (Jobs Completed)",
    detail_rating: "Wateja Wanamkubali ⭐ Rating",
    detail_specialty: "Ufundi Maalum na Mihogo",
    trust_logs_title: "Shahada na Usoromaji wa Wazee wa Mtaa",
    trust_index_title: "Kiwango cha Ukarimu na Uaminifu",
    trust_verification_metric: "YALIYOTHIBITISHWA NA MAJIRANI",
    ai_validation_title: "Tathmini ya Uaminifu ya Kijamii",
    radar_title: "Maeneo Ninayoyatembelea Kufanya Kazi",
    radar_subtitle: "RAMANI YA MAENEO",
    radar_hover_hint: "BONGEZA MAENEO KUONA MITAA YA NAIROBI",
    dispatch_label: "MUDA WA KUFIKA MTAANI KWAKO:",

    // Workbench & Terminal / Humanizing
    workbench_title: "Kibanda Changu cha Kazi",
    workbench_subtitle: "Kazi na Mtazamo Wangu Leo",
    discover_work_title: "Tafuta Vibarua",
    discover_work_desc: "Tazama kazi na ombi kutoka kwa wateja mtaani kwako zinazoendana na ujuzi wako.",
    sponsor_program_title: "Fadhili Soko la SMS / Baraza",
    sponsor_program_desc: "Changia kidogo kufunika gharama ya SMS ili wenzetu wasio na bando mitaani wapate kazi.",
    active_queue_title: "Kazi Zangu Leo",
    active_queue_sync: "ORODHA SAFI SASA HIVI",
    ledger_log_title: "Kumbukumbu ya Malipo yangu ya Asante (M-Pesa)",
    ledger_log_subtitle: "Miamala na Risiti za Simu",
    ledger_rule_title: "Sheria na Viapo vya Baraza ya Wazee",
    ledger_rule_subtitle: "Uaminifu na Kanuni za Mtaa Wetu",

    // Authentic Kenyan Cultural Additions & Empty States
    empty_jobs_title: "Hata mjengo ilisimama leo 😄",
    empty_jobs_desc: "Hakuna vibarua vipya mtaani kwa sasa.",
    empty_comments_title: "Hakuna maoni bado.",
    empty_comments_desc: "Kuwa wa kwanza kufanya kazi ikuweke rada ya mtaa!",
    
    job_completed_praise: "Safi sana! Mteja ameridhika.",
    payment_received: "Mambo ni safi. Pesa imeingia.",
    incoming_job_alert: "Eeh fundi! Kuna kazi imeingia hapa.",
    profile_viewed_alert: "Kuna mtu ameangalia kazi zako.",
    review_received: "Umeachiwa maoni mapya.",
    no_jobs_nearby: "Leo kumenyamaza kidogo. Usijali, kazi huingia tu.",

    baraza_wisdom_title: "BUSARA YA WAZEE NA BARAZA",
    proverbs_list: [
      "Haraka haraka haina baraka.",
      "Kazi nzuri hujitangaza yenyewe.",
      "Kidole kimoja hakivunji chawa.",
      "Aliyesifiwa sana, bado huamka kufanya kazi kesho.",
      "Jasho la kazi halipotei wala halitupwi."
    ]
  },
  sheng: {
    brand_msg: "KIKOSI YA KAZI YA CHINI // IDARA YA NAIROBI",
    hero_tag: "MTANDAO YA WASEE WA MICHETSO NA MAFUNDI MTAANI",
    hero_title: "ISHIKANE CHAPCHAP NA",
    hero_title_accent: "MAFUNDI WA MTAANI KWAKO.",
    hero_desc: "Hakuna mabosi wa macompany, hakuna broker kukata chapaa yako. Unapata fundi wa stima, maji, mbao au solar akina Kamau hapa hapa. Piga hii namba yetu ya USSD offline uokote kibarua au utafute fundi hata ukiwa na zeru bando ya internet.",
    dial_code: "PIGA *384# BILA BANDO CHA CHAPA",
    btn_terminal: "INGIA SOKO YA KAZI",
    btn_emulator: "WASHA EMULATOR YA USSD",
    feature_offline_title: "Inasoma Bila Internet (Offline)",
    feature_offline_desc: "Kazi inasonga kwa simu yoyote, hata kamulula kupitia USSD (*384#) na SMS. Msee hana bundle pia anaomoka kupata shughuli.",
    feature_escrow_title: "Pay ya Asante (Hakuna Broker)",
    feature_escrow_desc: "Toa tip vile unajisikia! Hakuna chapaa yetu inaenda kwa broker. Cash yote inaenda msee wa kazi directly bila ushuru faken.",
    feature_kiosk_title: "Mabanda yetu ya Trust",
    feature_kiosk_desc: "Mabanda yanapatikana mtaani kwa ajili ya usajili, kutatua beefs kupitia wazee wa baraza vijiweni, na kuazima tools.",
    
    tab_market: "Tafuta Fundi",
    tab_gigs: "Kazi Leo (Gigs)",
    tab_baraza: "Baraza ya Kimichezo",
    tab_ledger: "Chapaa Ledger",
    tab_workbench: "Base Changu",
    tab_standing: "Nyota Yangu",

    persona_title: "Badilisha Interface ya Kikosi",
    persona_subtitle: "Okota uzoefu tofauti kulingana na msee unataka kuwa leo:",
    persona_client: "Mteja anahire",
    persona_fundi: "Active Fundi (Noma)",
    persona_elder: "Mzee wa Baraza (Vouch Guardian)",
    persona_guest: "Mgeni Mpya (Sajili)",

    // Worker Detail / Humanizing
    back_to_catalog: "← RUDI NYUMA TAFUTA FUNDI",
    worker_profile_title: "Huyu Ndiye Jahazi",
    detail_bio: "Kuhusu huyu Jahazi",
    detail_rate: "Kibandisk ya work / Saa",
    detail_completed: "Kazi Amemaliza vizuri",
    detail_rating: "Wateja Wanamkubali ⭐ Alama",
    detail_specialty: "Ujanja Maalum na Mihogo",
    trust_logs_title: "Kura ya Wazee wa Baraza na Handshake",
    trust_index_title: "Alama ya Nyota na Legit Index",
    trust_verification_metric: "MAVERIFICATION YA MTAANI SECTOR",
    ai_validation_title: "Uhakiki Maalum wa Kijamii",
    radar_title: "Mitaa Yangu ya Kibarua",
    radar_subtitle: "MITAA YA NAIROBI",
    radar_hover_hint: "SOGEZA PANYA UCHEKI RAMANI YOTE",
    dispatch_label: "MUDA WA KUCHOMOKA HADI KWAKO:",

    // Workbench & Terminal / Humanizing
    workbench_title: "Kibanda Changu cha Gigs",
    workbench_subtitle: "Control Desk yangu mtaani",
    discover_work_title: "Saka Kibarua (Gigs)",
    discover_work_desc: "Cheki maombi fresh kutoka kwa mtaani, unyakue ile inafaa michezo yako.",
    sponsor_program_title: "Changia SMS ya Baraza",
    sponsor_program_desc: "Toa jiko kidogo ya kufunika SMS za wasee wasio na bundle wapate notification.",
    active_queue_title: "Kibarua changu ambacho niko nacho leo",
    active_queue_sync: "QUEUE SAFI YA SASA IVI",
    ledger_log_title: "Transaction zangu za Asante (M-Pesa Ledger)",
    ledger_log_subtitle: "Chapaa na Risiti",
    ledger_rule_title: "Fomula na Vows za Wazee wa Baraza",
    ledger_rule_subtitle: "Masharti na Legit-rules za mtaani",

    // Authentic Kenyan Cultural Additions & Empty States
    empty_jobs_title: "Simu iko kimya kama Sunday ya mwisho wa mwezi 😄",
    empty_jobs_desc: "Hakuna michezo mipya ya vibarua leo. Tulia kiasi.",
    empty_comments_title: "Hakuna maoni bado mtaani.",
    empty_comments_desc: "Fanya shughuli kwanza ndio urushwe kwa kijiwe rada!",
    
    job_completed_praise: "Sasa ni kazi tu. Mambo imekuwa safe!",
    payment_received: "Mambo ni safi. Pesa imeingia mpesa.",
    incoming_job_alert: "Msee, kazi imeingia town hapa hapa.",
    profile_viewed_alert: "Watu wanakutafuta vibaya sana leo mtaani.",
    review_received: "Umerushiwa review mpya mkuu.",
    no_jobs_nearby: "Leo kumenyamaza kidogo. Usijali, kazi huingia tu msee.",

    baraza_wisdom_title: "HEKIMA ZA SASA KUTOKA KIJIWENI",
    proverbs_list: [
      "Haraka haraka haina baraka.",
      "Kazi safi hujionyesha yenyewe bila ubishi.",
      "Kidole kimoja hakivunji chawa.",
      "Hata ukiwa star, lazima uamke kusaka chapaa asubuhi.",
      "Jasho ya kazi ya uaminifu haiwezi potea bure hivi hivi."
    ]
  }
};

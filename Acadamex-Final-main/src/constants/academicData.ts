
/**
 * Academic Data for DU and GGSIPU
 */

export interface Subject {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  name: string;
  subjects: string[];
}

export interface College {
  id: string;
  name: string;
  courseIds: string[];
}

export interface University {
  id: string;
  name: string;
  collegeIds: string[];
}

export const UNIVERSITIES: University[] = [
  { 
    id: 'du', 
    name: 'UNIVERSITY OF DELHI (DU)', 
    collegeIds: [
      'andc', 'aditi', 'aryabhatta', 'arsd', 'bnc', 'bharati', 'bcas', 'cvs', 'daulat_ram', 
      'ddu', 'dcac', 'deshbandhu', 'grs', 'brambedkar', 'dyal_singh', 'dyal_singh_eve', 
      'gargi', 'hansraj', 'hindu', 'indrapra_women', 'ihe', 'jdm', 'jesus_mary', 'kalindi', 
      'kamala_nehru', 'keshav_mv', 'kmc', 'lic', 'lsr', 'lakshmibai', 'mah_agrasen_du', 
      'maitreyi', 'matasundri', 'miranda', 'motilal_nehru', 'pgdav', 
      'pgdav_eve', 'rajdhani', 'rla', 'ramanujan', 'ramjas', 'satyawati', 'satyawati_eve', 
      'sbs', 'sbs_eve', 'srcasw', 'ssccbs', 'shivaji', 'srcc', 'shyamlal', 'shyamlal_eve', 
      'spm', 'aurobindo', 'aurobindo_eve', 'sggsc', 'sgnnd_khalsa', 'sgtb_khalsa', 
      'venkateswara', 'stephens', 'shraddhanand', 'vivekananda', 'zakir_husain', 
      'zakir_husain_eve', 'dsj', 'igipess', 'cic'
    ] 
  },
  { 
    id: 'ipu', 
    name: 'GGSIPU (IPU)', 
    collegeIds: [
      'usict', 'uslls', 'usms', 'mait', 'msit', 'bpit', 'gtbit', 'vips', 'jims', 
      'bvcoe', 'adgitm', 'hmritm', 'meri', 'ideal', 'tecnia', 'trinity', 'dme', 
      'dspsr', 'fairfield', 'guru_nanak', 'bciit', 'acms', 'bsamc', 'ndmcmc', 
      'vmmc', 'hrhcn', 'khcn', 'lbbcn', 'macn', 'pdcn', 'cbpacs', 'brshmc', 
      'bvicam', 'iitm', 'impact', 'saviour', 'stephens_nursing', 'aie', 'usla',
      'ayjnihh', 'bcip', 'holy_family', 'isic', 'cdac', 'don_bosco', 'echelon',
      'dtc', 'tiips', 'jimsemtc', 'gnit', 'gtbece', 'sbit', 'usar', 'usct',
      'use', 'cpj', 'dird', 'gibs', 'maims', 'kcc'
    ] 
  }
];

export const COLLEGES: Record<string, College> = {
  // DU Colleges
  'andc': { id: 'andc', name: 'ACHARYA NARENDRA DEV COLLEGE (ANDC)', courseIds: ['bcom_h', 'bsc_h', 'bsc_p', 'bsc_maths_h', 'bsc_chemistry_h', 'bsc_physics_h', 'bsc_math_sci'] },
  'aditi': { id: 'aditi', name: 'ADITI MAHAVIDYALAYA (W)', courseIds: ['ba_p', 'ba_h', 'bcom_h', 'bcom_p', 'eco_h'] },
  'aryabhatta': { id: 'aryabhatta', name: 'ARYABHATTA COLLEGE', courseIds: ['ba_h', 'bsc_h', 'bcom_h', 'bcom_p', 'ba_p', 'bms', 'eco_h'] },
  'arsd': { id: 'arsd', name: 'ATMA RAM SANATAN DHARMA COLLEGE (ARSD)', courseIds: ['bcom_p', 'bcom_h', 'ba_p', 'ba_h', 'bsc_h', 'bsc_p', 'bsc_maths_h', 'bsc_chemistry_h', 'bsc_physics_h', 'bsc_math_sci', 'eco_h'] },
  'bnc': { id: 'bnc', name: 'BHAGINI NIVEDITA COLLEGE', courseIds: ['ba_p', 'bcom_p', 'ba_h', 'bsc_p', 'bsc_h', 'eco_h'] },
  'bharati': { id: 'bharati', name: 'BHARATI COLLEGE', courseIds: ['ba_h', 'bsc_h', 'bcom_h', 'bcom_p', 'ba_p', 'eco_h'] },
  'bcas': { id: 'bcas', name: 'BHASKARACHARYA COLLEGE OF APPLIED SCIENCES', courseIds: ['bsc_h', 'bsc_physics_h', 'bsc_chemistry_h'] },
  'cvs': { id: 'cvs', name: 'COLLEGE OF VOCATIONAL STUDIES', courseIds: ['ba_h', 'bcom_h', 'bms', 'eco_h'] },
  'daulat_ram': { id: 'daulat_ram', name: 'DAULAT RAM COLLEGE', courseIds: ['ba_h', 'ba_p', 'bcom_p', 'bcom_h', 'bsc_h', 'bsc_p', 'eco_h'] },
  'ddu': { id: 'ddu', name: 'DEEN DAYAL UPADHYAYA COLLEGE', courseIds: ['ba_p', 'bcom_h', 'bsc_h', 'bsc_p', 'bms', 'bsc_math_sci', 'eco_h'] },
  'dcac': { id: 'dcac', name: 'DELHI COLLEGE OF ARTS AND COMMERCE (DCAC)', courseIds: ['ba_h', 'ba_p', 'bcom_p', 'bcom_h', 'eco_h'] },
  'deshbandhu': { id: 'deshbandhu', name: 'DESHBANDHU COLLEGE', courseIds: ['ba_p', 'ba_h', 'bcom_h', 'bsc_p', 'bsc_h', 'bsc_maths_h', 'bsc_chemistry_h', 'bsc_physics_h', 'eco_h'] },
  'grs': { id: 'grs', name: 'DEPARTMENT OF GERMAN AND ROMANCE STUDIES', courseIds: ['ba_h', 'ma'] },
  'brambedkar': { id: 'brambedkar', name: 'DR. BHIM RAO AMBEDKAR COLLEGE', courseIds: ['ba_p', 'ba_h', 'bcom_p', 'bcom_h', 'eco_h'] },
  'dyal_singh': { id: 'dyal_singh', name: 'DYAL SINGH COLLEGE', courseIds: ['ba_p', 'bcom_p', 'bcom_h', 'ba_h', 'bsc_h', 'bsc_p', 'bsc_maths_h', 'bsc_chemistry_h', 'bsc_physics_h', 'bsc_math_sci', 'eco_h'] },
  'dyal_singh_eve': { id: 'dyal_singh_eve', name: 'DYAL SINGH EVENING COLLEGE', courseIds: ['ba_h', 'bcom_h', 'bcom_p', 'ba_p', 'eco_h'] },
  'gargi': { id: 'gargi', name: 'GARGI COLLEGE', courseIds: ['ba_p', 'ba_h', 'bcom_p', 'bcom_h', 'bsc_p', 'bsc_h', 'bsc_maths_h', 'bsc_chemistry_h', 'bsc_physics_h', 'eco_h'] },
  'hansraj': { id: 'hansraj', name: 'HANSRAJ COLLEGE', courseIds: ['ba_h', 'bcom_h', 'bsc_p', 'bsc_h', 'ba_p', 'bsc_maths_h', 'bsc_chemistry_h', 'bsc_physics_h', 'bsc_math_sci', 'eco_h'] },
  'hindu': { id: 'hindu', name: 'HINDU COLLEGE', courseIds: ['ba_h', 'bcom_h', 'bsc_h', 'bsc_p', 'bsc_stats_h', 'bsc_maths_h', 'bsc_chemistry_h', 'bsc_physics_h', 'eco_h', 'ma', 'msc'] },
  'indrapra_women': { id: 'indrapra_women', name: 'INDRAPRASTHA COLLEGE FOR WOMEN', courseIds: ['ba_h', 'bcom_h', 'bsc_h', 'ba_p', 'eco_h'] },
  'ihe': { id: 'ihe', name: 'INSTITUTE OF HOME ECONOMICS', courseIds: ['bsc_h', 'bsc_p'] },
  'jdm': { id: 'jdm', name: 'JANKI DEVI MEMORIAL COLLEGE', courseIds: ['ba_p', 'bcom_p', 'bcom_h', 'ba_h', 'bsc_h', 'eco_h'] },
  'jesus_mary': { id: 'jesus_mary', name: 'JESUS AND MARY COLLEGE', courseIds: ['bcom_h', 'bcom_p', 'ba_h', 'bsc_h', 'eco_h'] },
  'kalindi': { id: 'kalindi', name: 'KALINDI COLLEGE', courseIds: ['ba_h', 'ba_p', 'bcom_p', 'bcom_h', 'bsc_h', 'bsc_p', 'bsc_stats_h', 'bsc_math_sci', 'eco_h'] },
  'kamala_nehru': { id: 'kamala_nehru', name: 'KAMALA NEHRU COLLEGE', courseIds: ['ba_p', 'bcom_p', 'bcom_h', 'ba_h', 'bsc_h', 'eco_h'] },
  'keshav_mv': { id: 'keshav_mv', name: 'KESHAV MAHAVIDYALAYA', courseIds: ['bcom_h', 'bsc_h', 'bsc_p', 'ba_h', 'bms', 'bsc_math_sci', 'eco_h'] },
  'kmc': { id: 'kmc', name: 'KIRORI MAL COLLEGE (KMC)', courseIds: ['bcom_h', 'bcom_p', 'ba_h', 'ba_p', 'bsc_h', 'bsc_p', 'bsc_stats_h', 'bsc_maths_h', 'bsc_chemistry_h', 'bsc_physics_h', 'bsc_math_sci', 'eco_h'] },
  'lic': { id: 'lic', name: 'LADY Irwin COLLEGE', courseIds: ['bsc_p', 'bsc_h'] },
  'lsr': { id: 'lsr', name: 'LADY SHRI RAM COLLEGE FOR WOMEN (LSR)', courseIds: ['bcom_h', 'ba_h', 'ba_p', 'bsc_h', 'bsc_stats_h', 'bsc_maths_h', 'eco_h', 'ma'] },
  'lakshmibai': { id: 'lakshmibai', name: 'LAKSHMIBAI COLLEGE', courseIds: ['ba_p', 'bcom_p', 'ba_h', 'bcom_h', 'bsc_h', 'eco_h'] },
  'mah_agrasen_du': { id: 'mah_agrasen_du', name: 'MAHARAJA AGRASEN COLLEGE (DU)', courseIds: ['ba_p', 'ba_h', 'bcom_h', 'bsc_h', 'bsc_p', 'bsc_math_sci', 'eco_h'] },
  'maitreyi': { id: 'maitreyi', name: 'MAITREYI COLLEGE', courseIds: ['ba_p', 'ba_h', 'bcom_p', 'bcom_h', 'bsc_p', 'bsc_h', 'eco_h'] },
  'matasundri': { id: 'matasundri', name: 'MATA SUNDRI COLLEGE FOR WOMEN', courseIds: ['ba_h', 'bsc_h', 'bcom_h', 'ba_p', 'bcom_p', 'eco_h'] },
  'miranda': { id: 'miranda', name: 'MIRANDA HOUSE', courseIds: ['ba_h', 'bsc_h', 'bsc_p', 'bsc_maths_h', 'bsc_chemistry_h', 'bsc_physics_h', 'bsc_math_sci', 'eco_h', 'ma', 'msc'] },
  'motilal_nehru': { id: 'motilal_nehru', name: 'MOTILAL NEHRU COLLEGE', courseIds: ['ba_h', 'ba_p', 'bcom_p', 'bcom_h', 'bsc_h', 'bsc_p', 'bsc_math_sci', 'eco_h'] },
  'pgdav': { id: 'pgdav', name: 'PGDAV COLLEGE', courseIds: ['ba_h', 'bcom_h', 'bsc_h', 'ba_p', 'bcom_p', 'bsc_math_sci', 'eco_h'] },
  'pgdav_eve': { id: 'pgdav_eve', name: 'PGDAV COLLEGE (EVENING)', courseIds: ['ba_p', 'bcom_p', 'bcom_h', 'ba_h', 'bsc_h', 'eco_h'] },
  'rajdhani': { id: 'rajdhani', name: 'RAJDHANI COLLEGE', courseIds: ['ba_h', 'ba_p', 'bcom_h', 'bsc_h', 'bsc_p', 'eco_h'] },
  'rla': { id: 'rla', name: 'RAM LAL ANAND COLLEGE', courseIds: ['ba_p', 'ba_h', 'bcom_p', 'bcom_h', 'bsc_h', 'bms', 'eco_h'] },
  'ramanujan': { id: 'ramanujan', name: 'RAMANUJAN COLLEGE', courseIds: ['bcom_h', 'bcom_p', 'ba_h', 'ba_p', 'bsc_h', 'bms', 'bsc_stats_h', 'bsc_math_sci', 'eco_h'] },
  'ramjas': { id: 'ramjas', name: 'RAMJAS COLLEGE', courseIds: ['ba_p', 'bcom_p', 'bcom_h', 'bsc_p', 'bsc_h', 'ba_h', 'bsc_stats_h', 'bsc_maths_h', 'bsc_chemistry_h', 'bsc_physics_h', 'bsc_math_sci', 'eco_h', 'ma', 'msc'] },
  'satyawati': { id: 'satyawati', name: 'SATYAWATI COLLEGE', courseIds: ['ba_p', 'bcom_p', 'bcom_h', 'bsc_h', 'ba_h', 'bsc_math_sci', 'eco_h'] },
  'satyawati_eve': { id: 'satyawati_eve', name: 'SATYAWATI COLLEGE (EVENING)', courseIds: ['ba_p', 'ba_h', 'bcom_p', 'bcom_h', 'eco_h'] },
  'sbs': { id: 'sbs', name: 'SHAHEED BHAGAT SINGH COLLEGE', courseIds: ['bcom_h', 'bcom_p', 'ba_h', 'bsc_h', 'ba_p', 'eco_h'] },
  'sbs_eve': { id: 'sbs_eve', name: 'SHAHEED BHAGAT SINGH EVENING COLLEGE', courseIds: ['bcom_p', 'bcom_h', 'ba_h', 'ba_p', 'eco_h'] },
  'srcasw': { id: 'srcasw', name: 'SHAHEED RAJGURU COLLEGE OF APPLIED SCIENCES FOR WOMEN', courseIds: ['bsc_h', 'bms', 'bfia', 'bsc_stats_h'] },
  'ssccbs': { id: 'ssccbs', name: 'SHAHEED SUKHDEV COLLEGE OF BUSINESS STUDIES', courseIds: ['bsc_cs_h', 'bms', 'bfia'] },
  'shivaji': { id: 'shivaji', name: 'SHIVAJI COLLEGE', courseIds: ['bsc_h', 'bcom_h', 'bcom_p', 'ba_h', 'ba_p', 'bsc_p', 'bsc_math_sci', 'eco_h'] },
  'srcc': { id: 'srcc', name: 'SHRI RAM COLLEGE OF COMMERCE (SRCC)', courseIds: ['bcom_h', 'eco_h', 'mcom'] },
  'shyamlal': { id: 'shyamlal', name: 'SHYAM LAL COLLEGE', courseIds: ['ba_p', 'ba_h', 'bcom_p', 'bcom_h', 'bsc_p', 'eco_h'] },
  'shyamlal_eve': { id: 'shyamlal_eve', name: 'SHYAM LAL COLLEGE (EVENING)', courseIds: ['ba_p', 'ba_h', 'bcom_p', 'bcom_h', 'eco_h'] },
  'spm': { id: 'spm', name: 'SHYAMA PRASAD MUKHERJI COLLEGE (FOR WOMEN)', courseIds: ['ba_h', 'bcom_p', 'bcom_h', 'bsc_h', 'bsc_math_sci', 'eco_h'] },
  'aurobindo': { id: 'aurobindo', name: 'SRI AUROBINDO COLLEGE (DAY)', courseIds: ['ba_p', 'ba_h', 'bcom_p', 'bcom_h', 'bsc_p', 'bsc_h', 'eco_h'] },
  'aurobindo_eve': { id: 'aurobindo_eve', name: 'SRI AUROBINDO COLLEGE (EVENING)', courseIds: ['bcom_p', 'bcom_h', 'ba_h', 'eco_h'] },
  'sggsc': { id: 'sggsc', name: 'SRI GURU GOBIND SINGH COLLEGE OF COMMERCE', courseIds: ['bcom_h', 'bcom_p', 'ba_h', 'eco_h'] },
  'sgnnd_khalsa': { id: 'sgnnd_khalsa', name: 'SRI GURU NANAK DEV KHALSA COLLEGE', courseIds: ['bcom_h', 'ba_h', 'bcom_p', 'ba_p', 'bsc_h', 'eco_h'] },
  'sgtb_khalsa': { id: 'sgtb_khalsa', name: 'SRI GURU TEGH BAHADUR KHALSA COLLEGE', courseIds: ['ba_h', 'ba_p', 'bcom_p', 'bcom_h', 'bsc_h', 'bsc_p', 'bsc_maths_h', 'bsc_chemistry_h', 'bsc_physics_h', 'bsc_math_sci', 'eco_h'] },
  'venkateswara': { id: 'venkateswara', name: 'SRI VENKATESWARA COLLEGE', courseIds: ['ba_p', 'bcom_p', 'bcom_h', 'ba_h', 'bsc_p', 'bsc_h', 'bsc_stats_h', 'bsc_maths_h', 'bsc_chemistry_h', 'bsc_physics_h', 'bsc_math_sci', 'eco_h'] },
  'stephens': { id: 'stephens', name: "ST. STEPHEN'S COLLEGE", courseIds: ['ba_h', 'bsc_h', 'ba_p', 'bsc_maths_h', 'bsc_physics_h', 'bsc_chemistry_h', 'eco_h', 'ma', 'msc'] },
  'shraddhanand': { id: 'shraddhanand', name: 'SWAMI SHRADDHANAND COLLEGE', courseIds: ['ba_p', 'ba_h', 'bcom_p', 'bcom_h', 'bsc_p', 'bsc_h', 'eco_h'] },
  'vivekananda': { id: 'vivekananda', name: 'VIVEKANANDA COLLEGE', courseIds: ['ba_p', 'bcom_p', 'bcom_h', 'ba_h', 'bsc_h', 'eco_h'] },
  'zakir_husain': { id: 'zakir_husain', name: 'ZAKIR HUSAIN DELHI COLLEGE', courseIds: ['ba_p', 'ba_h', 'bcom_p', 'bcom_h', 'bsc_p', 'bsc_h', 'eco_h'] },
  'zakir_husain_eve': { id: 'zakir_husain_eve', name: 'ZAKIR HUSAIN DELHI COLLEGE (EVENING)', courseIds: ['bcom_p', 'bcom_h', 'ba_h', 'ba_p', 'eco_h'] },
  'dsj': { id: 'dsj', name: 'DELHI SCHOOL OF JOURNALISM', courseIds: ['bjmc_du'] },
  'igipess': { id: 'igipess', name: 'INDIRA GANDHI INSTITUTE OF PHYSICAL EDUCATION AND SPORTS SCIENCES', courseIds: ['bsc_p'] },
  'cic': { id: 'cic', name: 'CLUSTER INNOVATION CENTRE (CIC - DU)', courseIds: ['btech', 'bsc_cs_h'] },

  // IPU Colleges
  'usict': { id: 'usict', name: 'UNIVERSITY SCHOOL OF ICT (USICT)', courseIds: ['btech', 'mca', 'mtech'] },
  'uslls': { id: 'uslls', name: 'UNIVERSITY SCHOOL OF LAW & LEGAL STUDIES (USLLS)', courseIds: ['llb', 'llm'] },
  'usms': { id: 'usms', name: 'UNIVERSITY SCHOOL OF MANAGEMENT STUDIES (USMS)', courseIds: ['mba', 'bba', 'bcom_h'] },
  'mait': { id: 'mait', name: 'MAHARAJA AGRASEN INSTITUTE OF TECHNOLOGY (MAIT)', courseIds: ['btech', 'bba', 'mba', 'bcom_h'] },
  'msit': { id: 'msit', name: 'MAHARAJA SURAJMAL INSTITUTE OF TECHNOLOGY (MSIT)', courseIds: ['btech', 'bca', 'bba'] },
  'bpit': { id: 'bpit', name: 'BHAGWAN PARSHURAM INSTITUTE OF TECHNOLOGY (BPIT)', courseIds: ['btech', 'bba', 'mba'] },
  'gtbit': { id: 'gtbit', name: 'GURU TEGH BAHADUR INSTITUTE OF TECHNOLOGY (GTBIT)', courseIds: ['btech'] },
  'vips': { id: 'vips', name: 'VIVEKANANDA INSTITUTE OF PROFESSIONAL STUDIES (VIPS)', courseIds: ['bca', 'bba', 'btech', 'llm', 'llb', 'bjmc', 'eco_h', 'mca'] },
  'jims': { id: 'jims', name: 'JAGAN INSTITUTE OF MANAGEMENT STUDIES (JIMS)', courseIds: ['bca', 'bba', 'mca', 'mba'] },
  'bvcoe': { id: 'bvcoe', name: 'BHARATI VIDYAPEETH COLLEGE OF ENGINEERING (BVCOE)', courseIds: ['btech'] },
  'adgitm': { id: 'adgitm', name: 'DR. AKHILESH DAS GUPTA INSTITUTE OF TECH (ADGITM)', courseIds: ['btech', 'bba', 'mba', 'llb'] },
  'hmritm': { id: 'hmritm', name: 'HMR INSTITUTE OF TECHNOLOGY & MANAGEMENT', courseIds: ['btech', 'mba'] },
  'meri': { id: 'meri', name: 'MANAGEMENT EDUCATION & RESEARCH INSTITUTE (MERI)', courseIds: ['mba', 'mca', 'bba', 'bca', 'bcom_h', 'bjmc'] },
  'ideal': { id: 'ideal', name: 'IDEAL INSTITUTE OF MANAGEMENT AND TECHNOLOGY', courseIds: ['bba', 'bca', 'llb'] },
  'tecnia': { id: 'tecnia', name: 'TECNIA INSTITUTE OF ADVANCED STUDIES', courseIds: ['mba', 'pgdm', 'bjmc', 'bba', 'bca'] },
  'trinity': { id: 'trinity', name: 'TRINITY INSTITUTE OF PROFESSIONAL STUDIES', courseIds: ['bca', 'bba', 'bjmc', 'bcom_h'] },
  'dme': { id: 'dme', name: 'DELHI METROPOLITAN EDUCATION (DME)', courseIds: ['llb', 'bjmc', 'bba'] },
  'dspsr': { id: 'dspsr', name: 'DELHI SCHOOL OF PROFESSIONAL STUDIES & RESEARCH (DSPSR)', courseIds: ['bcom_h', 'bba', 'bca'] },
  'fairfield': { id: 'fairfield', name: 'FAIRFIELD INSTITUTE OF MANAGEMENT & TECH', courseIds: ['bba', 'bca', 'bjmc', 'llb', 'bcom_h'] },
  'guru_nanak': { id: 'guru_nanak', name: 'GURU NANAK INSTITUTE OF MANAGEMENT', courseIds: ['mca', 'bcom_h', 'bba'] },
  'bciit': { id: 'bciit', name: 'BANARSIDAS CHANDIWALA INSTITUTE OF IT', courseIds: ['mca', 'bca'] },
  'acms': { id: 'acms', name: 'ARMY COLLEGE OF MEDICAL SCIENCE (ACMS)', courseIds: ['mbbs'] },
  'bsamc': { id: 'bsamc', name: 'DR. BSA HOSPITAL MEDICAL COLLEGE', courseIds: ['mbbs'] },
  'ndmcmc': { id: 'ndmcmc', name: 'NDMC MEDICAL COLLEGE AT HINDU RAO HOSPITAL', courseIds: ['mbbs', 'bsc_nursing'] },
  'vmmc': { id: 'vmmc', name: 'VARDHMAN MAHAVIR MEDICAL COLLEGE & SAFDARJUNG HOSPITAL', courseIds: ['bpt', 'bsc_mlt'] },
  'hrhcn': { id: 'hrhcn', name: 'COLLEGE OF NURSING HINDU RAO HOSPITAL', courseIds: ['bsc_nursing'] },
  'khcn': { id: 'khcn', name: 'COLLEGE OF NURSING KASTURBA HOSPITAL', courseIds: ['bsc_nursing'] },
  'lbbcn': { id: 'lbbcn', name: 'LAKSHMI BAI BATRA COLLEGE OF NURSING', courseIds: ['bsc_nursing'] },
  'macn': { id: 'macn', name: 'MAHARAJA AGARSEN COLLEGE OF NURSING', courseIds: ['bsc_nursing'] },
  'pdcn': { id: 'pdcn', name: 'PANNA DAI COLLEGE OF NURSING', courseIds: ['bsc_nursing'] },
  'cbpacs': { id: 'cbpacs', name: 'CH. BRAHM PRAKASH AYURVED CHARAK SANSTHAN', courseIds: ['bams'] },
  'brshmc': { id: 'brshmc', name: 'DR. B.R. SUR HOMEOPATHIC MEDICAL COLLEGE', courseIds: ['bhms'] },
  'bvicam': { id: 'bvicam', name: 'BHARATI VIDYAPEETH INSTITUTE OF COMPUTER APPLICATIONS & MANAGEMENT', courseIds: ['mca'] },
  'iitm': { id: 'iitm', name: 'INSTITUTE OF INFORMATION TECHNOLOGY & MANAGEMENT (IITM)', courseIds: ['mca', 'bba', 'bca'] },
  'impact': { id: 'impact', name: 'IMPACT PARAMEDICAL AND HEALTH INSTITUTE, NANGLOI', courseIds: ['bsc_nursing'] },
  'saviour': { id: 'saviour', name: 'SAVIOUR COLLEGE OF NURSING, RANHOLA', courseIds: ['bsc_nursing'] },
  'stephens_nursing': { id: 'stephens_nursing', name: 'ST. STEPHENS COLLEGE OF NURSING, TIS HAZARI', courseIds: ['bsc_nursing'] },
  'aie': { id: 'aie', name: 'ARMY INSTITUTE OF EDUCATION (AIE)', courseIds: ['ba_bed', 'bed_spl'] },
  'usla': { id: 'usla', name: 'UNIVERSITY SCHOOL OF LIBERAL ARTS (USLA)', courseIds: ['ba_la', 'eco_h'] },
  'ayjnihh': { id: 'ayjnihh', name: 'ALI YAVAR JUNG NATIONAL INSTITUTE FOR HEARING HANDICAPPED', courseIds: ['baslp'] },
  'bcip': { id: 'bcip', name: 'BANARSIDAS CHANDIWALA INSTITUTE OF PHYSIOTHERAPY', courseIds: ['bpt'] },
  'holy_family': { id: 'holy_family', name: 'HOLY FAMILY HOSPITAL COLLEGE OF NURSING & PARAMEDICAL', courseIds: ['bsc_mlt', 'bsc_nursing'] },
  'isic': { id: 'isic', name: 'ISIC INSTITUTE OF REHABILITATION SCIENCES, VASANT KUNJ', courseIds: ['bpt', 'bot', 'bpo'] },
  'cdac': { id: 'cdac', name: 'C-DAC, SECTOR-62 NOIDA', courseIds: ['mca'] },
  'don_bosco': { id: 'don_bosco', name: 'DON BOSCO INSTITUTE OF TECHNOLOGY, OKHLA', courseIds: ['mca'] },
  'echelon': { id: 'echelon', name: 'ECHELON INSTITUTE OF TECHNOLOGY, FARIDABAD', courseIds: ['mca', 'btech'] },
  'dtc': { id: 'dtc', name: 'DELHI TECHNICAL CAMPUS, GREATER NOIDA', courseIds: ['btech', 'mca', 'bba', 'bca'] },
  'tiips': { id: 'tiips', name: 'TRINITY INSTITUTE OF INNOVATIONS IN PROFESSIONAL STUDIES, GREATER NOIDA', courseIds: ['btech', 'bba', 'bca', 'llb', 'bjmc'] },
  'jimsemtc': { id: 'jimsemtc', name: 'JIMS ENGINEERING MANAGEMENT TECHNICAL CAMPUS, GREATER NOIDA', courseIds: ['btech', 'bba', 'bca'] },
  'gnit': { id: 'gnit', name: 'GREATER NOIDA INSTITUTE OF TECHNOLOGY', courseIds: ['btech'] },
  'gtbece': { id: 'gtbece', name: 'GURU TEG BAHADUR 4TH CENTENARY ENGINEERING COLLEGE', courseIds: ['btech'] },
  'sbit': { id: 'sbit', name: 'SHRI BALWANT INSTITUTE OF TECHNOLOGY (SBIT), SONIPAT', courseIds: ['btech', 'mca'] },
  'usar': { id: 'usar', name: 'UNIVERSITY SCHOOL OF AUTOMATION & ROBOTICS (USAR)', courseIds: ['btech'] },
  'usct': { id: 'usct', name: 'UNIVERSITY SCHOOL OF CHEMICAL TECHNOLOGY (USCT)', courseIds: ['btech'] },
  'use': { id: 'use', name: 'UNIVERSITY SCHOOL OF EDUCATION (USE)', courseIds: ['ba_bed'] },
  'cpj': { id: 'cpj', name: 'CHANDARPRABHU JAIN COLLEGE OF HIGHER STUDIES & SCHOOL OF LAW', courseIds: ['llb', 'llm', 'bba'] },
  'dird': { id: 'dird', name: 'DELHI INSTITUTE OF SCIENCES & TECHNOLOGY (DIRD)', courseIds: ['llm', 'llb'] },
  'gibs': { id: 'gibs', name: 'GITARATTAN INTERNATIONAL BUSINESS SCHOOL (GIBS)', courseIds: ['llm', 'llb', 'mba', 'bba', 'mca'] },
  'maims': { id: 'maims', name: 'MAHARAJA AGRASEN INSTITUTE OF MANAGEMENT STUDIES (MAIMS)', courseIds: ['llm', 'llb', 'bba', 'bca', 'eco_h', 'bjmc', 'bcom_h'] },
  'kcc': { id: 'kcc', name: 'KCC INSTITUTE OF LEGAL & HIGHER EDUCATION', courseIds: ['llb', 'bba', 'bca'] },
  'just_out_of_school': { id: 'just_out_of_school', name: 'JUST OUT OF SCHOOL / ASPIRANT', courseIds: ['aspirant'] },
};

export const COURSES: Record<string, Course> = {
  'aspirant': {
    id: 'aspirant',
    name: 'GENERAL EXPLORATION / ASPIRANT',
    subjects: [
      'ADMISSIONS COUNSELLING 2025-2026', 'CAMPUS VISIT & EXPLORATION', 'SENIOR CAREER CONNECTIONS', 'ADMISSIONS PROTOCOLS', 'GENERAL ORIENTATION', 'RESERVATION & DOCUMENTS VERIFICATION', 'HOSTEL ACCOMMODATION INQUIRY', 'SCHOLARSHIP CRITERIA DEBATE', 'FEE STRUCTURE WALKTHROUGH', 'CUTOFF TRENDS ANALYSIS'
    ]
  },
  'btech': { 
    id: 'btech', 
    name: 'B.TECH (ENGINEERING)', 
    subjects: [
      'APPLIED MATHEMATICS - I', 'APPLIED PHYSICS - I', 'APPLIED CHEMISTRY', 'MANUFACTURING PROCESSES', 'ENGINEERING MECHANICS', 'COMMUNICATION SKILLS', 'WORKSHOP PRACTICE',
      'APPLIED MATHEMATICS - II', 'APPLIED PHYSICS - II', 'ENVIRONMENTAL STUDIES', 'PROGRAMMING IN C', 'ENGINEERING GRAPHICS', 'ELECTRONIC DEVICES', 'TECHNICAL COMMUNICATION', 'ELECTRICAL SCIENCES (ELECTRICAL TECHNOLOGY)',
      'APPLIED MATHEMATICS - III', 'ANALOG ELECTRONICS', 'DATA STRUCTURES', 'COMPUTER ORGANIZATION', 'DIGITAL ELECTRONICS', 'OBJECT ORIENTED PROGRAMMING', 'DATA COMMUNICATION',
      'APPLIED MATHEMATICS - IV', 'COMMUNICATION SYSTEMS', 'COMPUTER NETWORKS', 'OPERATING SYSTEMS', 'DBMS', 'ALGORITHM DESIGN', 'DISCRETE MATHEMATICS',
      'MICROPROCESSORS', 'SOFTWARE ENGINEERING', 'COMPUTER ARCHITECTURE', 'DIGITAL COMMUNICATION', 'JAVA PROGRAMMING', 'SIGNALS AND SYSTEMS', 'ECONOMICS FOR ENGINEERS',
      'COMPILER DESIGN', 'ARTIFICIAL INTELLIGENCE', 'MACHINE LEARNING', 'CLOUD COMPUTING', 'DISTRIBUTED SYSTEMS', 'INFORMATION SECURITY', 'WEB TECHNOLOGIES',
      'BIG DATA ANALYTICS', 'CYBER SECURITY', 'MOBILE COMPUTING', 'HUMAN VALUES & PROFESSIONAL ETHICS', 'SOFT COMPUTING', 'PROJECT MANAGEMENT', 'BLOCKCHAIN TECHNOLOGIES',
      'DATA MINING & WAREHOUSING', 'INTERNET OF THINGS', 'CYBER LAW', 'WIRELESS COMMUNICATION', 'NUMERICAL METHODS', 'THEORY OF COMPUTATION', 'EMBEDDED SYSTEMS', 'VLSI DESIGN',
      'APPLIED PHYSICS LAB', 'APPLIED CHEMISTRY LAB', 'ENGINEERING MECHANICS LAB', 'ELECTRICAL SCIENCES LAB (E.T. LAB)', 'PROGRAMMING LAB', 'DATA STRUCTURES LAB', 'ANALOG ELECTRONICS LAB',
      'DIGITAL ELECTRONICS LAB', 'COMPUTER NETWORKS LAB', 'DBMS LAB', 'SOFTWARE ENGINEERING LAB', 'MICROPROCESSORS LAB', 'ARTIFICIAL INTELLIGENCE LAB', 'MACHINE LEARNING LAB', 'WEB TECHNOLOGIES LAB',
      'DEEP LEARNING', 'NATURAL LANGUAGE PROCESSING', 'DATA SCIENCE USING R', 'BUSINESS INTELLIGENCE', 'OBJECT ORIENTED ANALYSIS AND DESIGN', 'SIGNALS & SYSTEMS', 'DIGITAL SIGNAL PROCESSING',
      'RENEWABLE ENERGY SYSTEMS', 'POWER SYSTEMS', 'CONTROL SYSTEMS', 'ELECTROMAGNETIC FIELD THEORY', 'POWER ELECTRONICS', 'MICROWAVE ENGINEERING', 'ORGANIZATIONAL BEHAVIOR',
      'ENTREPRENEURSHIP DEVELOPMENT', 'HIGH PERFORMANCE COMPUTING', 'COMPUTER VISION', 'IMAGE PROCESSING', 'CRYPTOGRAPHY & NETWORK SECURITY', 'ADHOC & SENSOR NETWORKS',
      'MOBILE APP DEVELOPMENT', 'DEVOPS ENGINEERING', 'DATA SHADOWING & SYSTEM INFRASTRUCTURE', 'ADVANCED JAVA',
      'DIGITAL IMAGE PROCESSING', 'DIGITAL IMAGE PROCESSING LAB', 'FUNDAMENTALS OF DEEP LEARNING', 'FUNDAMENTALS OF DEEP LEARNING LAB', 'BIG DATA ANALYTICS LAB', 'NEXT GENERATION DATABASES', 'NEXT GENERATION DATABASES LAB',
      'QUANT AND APTITUDE VALUE ADDED', 'QUANTUM COMPUTING', 'INTRODUCTION TO DATA MINING', 'INTRODUCTION TO DATA MINING LAB', 'ADVANCES IN DEEP LEARNING', 'ADVANCES IN DEEP LEARNING LAB', 'NATURAL LANGUAGE PROCESSING LAB',
      'WIRELESS SENSOR NETWORKS', 'WIRELESS SENSOR NETWORKS LAB', 'SOFT COMPUTING LAB', 'PROCESS AUTOMATION', 'PROCESS AUTOMATION LAB', 'SOFTWARE PROJECT MANAGEMENT',
      'STATISTICS STATISTICAL MODELING AND DATA MODELING', 'STATISTICS STATISTICAL MODELING AND DATA MODELING LAB', 'ADVANCED JAVA PROGRAMMING', 'ADVANCED JAVA PROGRAMMING LAB',
      'UNIVERSAL HUMAN VALUES', 'PYTHON PROGRAMMING', 'PYTHON PROGRAMMING LAB', 'ARTIFICIAL INTELLIGENCE LAB', 'PRINCIPLE OF MANAGEMENT FOR ENGINEERS', 'MACHINE LEARNING LAB',
      'INTRODUCTION TO INTERNET OF THINGS', 'INTRODUCTION TO INTERNET OF THINGS LAB', 'DESIGN AND ANALYSIS OF ALGORITHMS LAB', 'OPERATING SYSTEMS LAB', 'PRINCIPLES OF ENTREPRENEURSHIP MINDSET',
      'SENSORS AND CONTROL SYSTEMS', 'SENSORS AND CONTROL SYSTEMS LAB', 'DATA TRANSMISSION METHODOLOGIES', 'DATA TRANSMISSION METHODOLOGIES LAB', 'COMPILER DESIGN LAB', 'COMPUTER NETWORKS LAB', 'SOFTWARE ENGINEERING LAB',
      // TIIPS BTech Extensions
      'Compiler Design', 'ETCS 302 Compiler Design', 'Operating System', 'ETCS 304 Operating System',
      'Computer Networks', 'ETCS 306 Computer Networks', 'Data Communication and Networks', 'ETEC 310 Data Communication and Networks',
      'Web Engineering', 'ETCS 308 Web Engineering', 'Artificial Intelligence', 'ETCS 310 Artificial Intelligence',
      'Microprocessor & Microcontroller', 'ETEE 310 Microprocessor & Microcontroller', 'Operating System Lab', 'ETCS 352 Operating System Lab',
      'Computer Networks Lab', 'ETCS 354 Computer Networks Lab', 'Web Engineering Lab', 'ETCS 356 Web Engineering Lab',
      'Microprocessor & Microcontroller Lab', 'ETEE 358 Microprocessor & Microcontroller Lab', 'Data Communication and Networks Lab', 'ETEC 358 Data Communication and Networks Lab',
      'AC (Applied Chemistry)', 'BS103 AC (Applied Chemistry)', 'AP-1 (Applied Physics -1)', 'BS105 AP-1 (Applied Physics -1)',
      'Electrical Science', 'ES107 Electrical Science', 'AM-1 ( Applied Mathematics -1)', 'BS111 AM-1 ( Applied Mathematics -1)',
      'Communication Skills', 'HS113 Communication Skills', 'MP(Manufacturing Process)', 'ES119 MP(Manufacturing Process)',
      'Applied Physics Lab-I', 'BS151 Applied Physics Lab-I', 'Applied Chemistry Lab', 'BS155 Applied Chemistry Lab',
      'Engineering Graphics Lab', 'ES157 Engineering Graphics Lab', 'ES(Electrical Sience Lab)', 'ES159 ES(Electrical Sience Lab)',
      'Applied Mathematics – III', 'ETMA 201 Applied Mathematics – III', 'Foundation of Computer Science', 'ETCS 203 Foundation of Computer Science',
      'Switching Theory and Logic Design', 'ETEC 205 Switching Theory and Logic Design', 'Circuits and Systems', 'ETEE 207 Circuits and Systems',
      'Data Structures', 'ETCS 209 Data Structures', 'Computer Graphics and Multimedia', 'ETCS 211 Computer Graphics and Multimedia',
      'Data Structures Lab', 'ETCS 255 Data Structures Lab', 'Circuits and Systems Lab', 'ETEE 257 Circuits and Systems Lab',
      'STLD LAB', 'ETCS 257 STLD LAB', 'Applied Mathematics-IV', 'ETMA 202 Applied Mathematics-IV',
      'Computer Organization and Architecture', 'ETCS 204 Computer Organization and Architecture', 'Theory Of Computation', 'ETCS 206 Theory Of Computation',
      'Database Management System', 'ETCS 208 Database Management System', 'Object -Oriented Programming', 'ETCS 210 Object -Oriented Programming',
      'Communication System', 'ETEC 208 Communication System', 'Control Sytem', 'ETEE 212 Control Sytem',
      'Analog Electronic -II', 'ETEC 204 Analog Electronic -II', 'Network Analysis & Synthesis', 'ETEC 206 Network Analysis & Synthesis',
      'Electromagnetic Field Theory', 'ETEE 210 Electromagnetic Field Theory', 'Computer Organization and Architecture Lab', 'ETCS 254 Computer Organization and Architecture Lab',
      'Database Management System Lab', 'ETCS 256 Database Management System Lab', 'Object -Oriented Programming Lab', 'ETCS 258 Object -Oriented Programming Lab',
      'Communication System Lab', 'ETEC 256 Communication System Lab', 'Control Sytem Lab', 'ETEE-260 Control Sytem Lab',
      'Analog Electronic -II Lab', 'ETEC 254 Analog Electronic -II Lab', 'Network Analysis & Synthesis Lab', 'ETEC 258 Network Analysis & Synthesis Lab',
      'Linux Programming & Administration', 'ETCS 260 Linux Programming & Administration', 'Microwave Engineering', 'ETEC 302 Microwave Engineering',
      'Information Theory & Coding', 'ETEC 304 Information Theory & Coding', 'Digital Signal Processing', 'ETEC 306 Digital Signal Processing',
      'VLSI Design', 'ETEC 308 VLSI Design', 'Data Communication & Networks', 'ETEC 310 Data Communication & Networks',
      'Antena & Wave Propagation', 'ETEC 314 Antena & Wave Propagation', 'Microwave Engineering Lab', 'ETEC 352 Microwave Engineering Lab',
      'VLSI Design Lab', 'ETEC 354 VLSI Design Lab', 'Digital Signal Processing Lab', 'ETEC 356 Digital Signal Processing Lab',
      'Data Communication &Networks Lab', 'ETEC 358 Data Communication &Networks Lab'
    ] 
  },
  'bca': { 
    id: 'bca', 
    name: 'BCA (COMPUTER APPLICATIONS)', 
    subjects: [
      'MATHEMATICS - I', 'TECHNICAL COMMUNICATION', 'INTRODUCTION TO PROGRAMMING (C)', 'PHYSICS', 'COMPUTER FUNDAMENTALS', 'COMMUNICATION SKILLS',
      'MATHEMATICS - II', 'DATA STRUCTURES', 'PRINCIPLES OF MANAGEMENT', 'DIGITAL ELECTRONICS', 'SYSTEM ANALYSIS AND DESIGN', 'ENVIRONMENTAL STUDIES',
      'MATHEMATICS - III', 'JAVA PROGRAMMING', 'COMPUTER ARCHITECTURE', 'WEB TECHNOLOGIES', 'OPERATING SYSTEMS', 'C++ PROGRAMMING',
      'MATHEMATICS - IV', 'SOFTWARE ENGINEERING', 'DATABASE MANAGEMENT SYSTEMS', 'BUSINESS ECONOMICS', 'COMPUTER NETWORKS', 'VB.NET',
      'PYTHON PROGRAMMING', 'MULTIMEDIA DEVELOPMENTS', 'NETWORKING SECURITY', 'E-COMMERCE', 'INFORMATION SECURITY', 'DATA WAREHOUSING',
      'CLOUD COMPUTING', 'MOBILE COMPUTING', 'ARTIFICIAL INTELLIGENCE', 'BIG DATA ANALYTICS', 'MAJOR PROJECT', 'GRAPHICS & MULTIMEDIA',
      'C PROGRAMMING LAB', 'DATA STRUCTURES LAB', 'DIGITAL ELECTRONICS LAB', 'JAVA PROGRAMMING LAB', 'DBMS LAB', 'WEB TECHNOLOGIES LAB', 'SOFTWARE ENGINEERING LAB', 'PYTHON PROGRAMMING LAB',
      'ADVANCED JAVA', 'SOFTWARE TESTING', 'MOBILE APPLICATION DEVELOPMENT', 'LINUX ADMINISTRATION', 'MANAGEMENT INFORMATION SYSTEMS', 'CYBER LAW', 'INTRODUCTION TO DATA SCIENCE', 'OBJECT ORIENTED SYSTEM DESIGN', 'OPTIMIZATION TECHNIQUES', 'WEBSITE DESIGNING (HTML/CSS/JS)', 'STATISTICS', 'PROBABILITY & STATISTICS', 'NORMAL STATISTICS',
      'COMPUTER LAB - I (C PROGRAMMING)', 'IT LAB (OFFICE AUTOMATION & PRODUCTS)', 'FRONT END DESIGN TOOLS LAB (HTML/CSS)', 'OBJECT ORIENTED PROGRAMMING USING C++ LAB', 'DATA COMMUNICATION & COMPUTER NETWORKS', 'INTRODUCTION TO AI & MACHINE LEARNING', 'COMPUTER GRAPHICS LAB', 'ADVANCED PYTHON PROGRAMMING', 'FULL STACK WEB DEVELOPMENT (MERN/MEAN)', 'PRINCIPLES OF OPERATING SYSTEMS', 'FRONT END DESIGN TOOL (FRONT PAGE/DREAMWEAVER)',
      // TIIPS BCA Extensions
      'Discrete Mathematics', 'Discreate Mathematics', 'C Programming', '101 Discrete Mathematics', '101 Discreate Mathematics', '103 C Programming',
      '105# IC&IT(Fundamentals of Computer and IT)', '107# Web Technology', '109 Technical Communication', '171 C Lab(C Programming Lab)',
      '173# IT Lab', '175# Web Technology Lab', 'BCA 181* Bridge Course in Maths', '202 Mathematics', '204 Web Technology',
      '206 Java Programming', '208 Software Engineering', '210 Computer Networks', '252 Practical-VII Java Lab', '254 Practical-VIII Web Tech Lab',
      '256 Personality Development Skills', '302 Data Wae Housing&Data Mining', '304 Mobile Computing', '306 Linux Environment',
      '312 Artificial Intelligence', '352 Practical-XLinux Lab', '356 Major Project', '358 Seminar',
      // BCIIT BCA Extensions
      'BCA-101(Th) Programming for Problem Solving using \'C\'(PPS)', 'BCA-103(Th) Fundamentals of Information Technology (FIT)', 'BCA-105(Th) Web Technologies (WT)', 'BCA-107(Th) Mathematical Foundation of Computer Science',
      'BCA-141(Th) Writing Skills(WS)', 'BCA-191(Th) Understanding India(UI)', 'BCA-181(Th) Bridge Course in Mathematics (BCM)', 'BCA-102(Th) Database Management System (DBMS)',
      'BCA-104(Th) Object Oriented Programming using JAVA', 'BCA-106(Th) Data Structure and Algorithms (DFS)', 'BCA-108(Th) Software Engineering (SE)', 'BCA-142 Soft Skills', 'BCA-192 Environment Studies',
      'BCA-202(Th) JAVA Programming (JAVA)', 'BCA-204(Th) Software Engineering (SE)', 'BCA-206(Th) Introduction to Management & Entrepreneurship Development (MGMT)', 'BCA-T-212(Th) Introduction to Data Science (DS)',
      'BCA-T-218(Th) Web Development with Python and Django (Django)', 'BCA-222 Digital Marketing (DM)', 'BCA-302(Th) Data Warehousing & Data Mining (DWDM)', 'BCA-304(Th) E-Commerce (EC)',
      'BCA-306(Th) Internet of Things (IoT)', 'BCA-T-312(Th) Data Visualization & Analytics (DV)', 'BCA-T-318(Th) Mobile Application Development (MAD)', 'BCA-308 Major Project', 'BCA-332 Seminar/Conference Presentation'
    ] 
  },
  'bba': { 
    id: 'bba', 
    name: 'BBA (BUSINESS ADMINISTRATION)', 
    subjects: [
      'MANAGEMENT PROCESS', 'ORGANIZATIONAL BEHAVIOR', 'BUSINESS MATHEMATICS', 'FINANCIAL ACCOUNTING', 'MICRO ECONOMICS', 'COMPUTER APPLICATIONS', 'BUSINESS COMMUNICATION',
      'MACRO ECONOMICS', 'STATISTICS', 'BUSINESS STATISTICS', 'NORMAL STATISTICS', 'MARKETING MANAGEMENT', 'COST ACCOUNTING', 'E-COMMERCE', 'ENVIRONMENTAL MANAGEMENT',
      'FINANCIAL MANAGEMENT', 'HUMAN RESOURCE MANAGEMENT', 'BUSINESS LAW', 'PRODUCTION & OPERATIONS MANAGEMENT', 'ENTREPRENEURSHIP', 'MANAGEMENT ACCOUNTING',
      'BUSINESS ENVIRONMENT', 'STRATEGIC MANAGEMENT', 'INTERNATIONAL BUSINESS', 'OPERATIONS RESEARCH', 'ADVERTISING & SALES PROMOTION', 'PROPERTY MANAGEMENT',
      'PROJECT PLANNING & EVALUATION', 'SUMMER INTERNSHIP REPORT', 'CONSUMER BEHAVIOR', 'SALES MANAGEMENT', 'MARKET RESEARCH', 'TAXATION LAWS',
      'RETAIL MANAGEMENT', 'SERVICES MARKETING', 'FINANCIAL INSTITUTIONS & MARKETS', 'INVESTMENT ANALYSIS & PORTFOLIO MANAGEMENT', 'BUSINESS ETHICS & CORPORATE SOCIAL RESPONSIBILITY', 'DIGITAL MARKETING', 'CUSTOMER RELATIONSHIP MANAGEMENT', 'EXPORT-IMPORT PROCEDURES & DOCUMENTATION', 'INDUSTRIAL RELATIONS & LABOUR LAWS', 'SUPPLY CHAIN MANAGEMENT',
      'BUSINESS ORGANIZATION', 'QUANTITATIVE TECHNIQUES', 'MANAGEMENT INFORMATION SYSTEMS', 'BUSINESS RESEARCH METHODS', 'INCOME TAX LAW & PRACTICE', 'BUSINESS POLICY', 'PROJECT MANAGEMENT', 'MANAGEMENT INFORMATION SYSTEM LAB',
      // TIIPS BBA Extensions
      'Management Process and Organisational Behaviour', 'Business Mathematics', 'Financial Accounting and Analysis', 'Business Economics',
      'IT in Business', 'IT in Business Lab', 'Entrepreneurial Mindset', 'Personality Development Session', 'Personality Deveopment Session',
      'BBA 202 Human Resource Management', 'BBA 204 Financial Management', 'BBA 206 Research Methodology', 'BBA 208 Research Methodology Lab',
      'BBA 210 Information Systems Management', 'BBA 212 Information Systems Management Lab', 'BBA 214 Managerial Skill Development',
      'BBA 302 Project Management', 'BBA 304 Digital Marketing', 'BBA 306 International Business Management', 'BBA 308 Business Policy & Strategy',
      'BBA 310 Sales and Distribution Mgmt', 'BBA 312 Project Report'
    ] 
  },
  'bcom_h': { 
    id: 'bcom_h', 
    name: 'B.COM HONOURS', 
    subjects: [
      'FINANCIAL ACCOUNTING', 'BUSINESS LAW', 'ENVIRONMENTAL STUDIES', 'MICROECONOMICS', 'COMMUNICATION SKILLS',
      'CORPORATE ACCOUNTING', 'CORPORATE LAWS', 'MACROECONOMICS', 'BUSINESS MATHEMATICS', 'COMPUTER APPS IN BUSINESS',
      'HUMAN RESOURCE MANAGEMENT', 'INCOME TAX LAW AND PRACTICE', 'MANAGEMENT PRINCIPLES & APPLICATIONS', 'E-COMMERCE',
      'COST ACCOUNTING', 'BUSINESS STATISTICS', 'STATISTICS', 'PROBABILITY & STATISTICS', 'NORMAL STATISTICS', 'INDIAN ECONOMY', 'STOCK MARKET OPERATIONS',
      'PRINCIPLES OF MARKETING', 'FINANCIAL MANAGEMENT', 'AUDITING & CORPORATE GOVERNANCE', 'GOODS & SERVICES TAX (GST)',
      'MANAGEMENT ACCOUNTING', 'INTERNATIONAL BUSINESS', 'FUNDAMENTALS OF INVESTMENT', 'ENTERPRISE RESOURCE PLANNING (ERP)',
      'FINANCIAL REPORTING', 'BANKING AND INSURANCE', 'BUSINESS TAX PLANNING', 'OFFICE MANAGEMENT',
      'ADVERTISING', 'PERSONAL TAX PLANNING', 'CONSUMER AFFAIRS', 'VENTURE PLANNING', 'FINANCIAL MARKET OPERATIONS', 'ORGANISATIONAL BEHAVIOUR', 'FOREIGN EXCHANGE MARKETS', 'PORTFOLIO MANAGEMENT', 'INDUSTRIAL LAWS', 'PRINCIPLES OF AUDITING', 'BUSINESS COMMUNICATION (B.COM)',
      'INDIRECT TAXES (GST)', 'INVESTMENT MANAGEMENT', 'CORPORATE GOVERNANCE & BUSINESS ETHICS', 'BUSINESS RESEARCH METHODS', 'MICRO ECONOMICS', 'MACRO ECONOMICS', 'FINANCIAL ACCOUNTS', 'COST ACCOUNTING PRACTICE'
    ] 
  },
  'eco_h': { 
    id: 'eco_h', 
    name: 'B.A. HONOURS ECONOMICS', 
    subjects: [
      'INTRODUCTORY MICROECONOMICS', 'INTRODUCTORY MATHEMATICAL METHODS FOR ECONOMICS', 'INTRODUCTORY STATISTICS FOR ECONOMICS',
      'INTRODUCTORY MACROECONOMICS', 'INTERMEDIATE MATHEMATICAL METHODS FOR ECONOMICS', 'INTERMEDIATE STATISTICS FOR ECONOMICS',
      'INTERMEDIATE MICROECONOMICS I', 'INTERMEDIATE MACROECONOMICS I', 'ADVANCED MATHEMATICAL METHODS FOR ECONOMICS',
      'INTERMEDIATE MICROECONOMICS II', 'INTERMEDIATE MACROECONOMICS II', 'INTRODUCTORY ECONOMETRICS',
      'STATISTICAL METHODS FOR ECONOMICS', 'ACADEMIC WRITING', 'ENVIRONMENTAL STUDIES', 'CLASSICAL POLITICAL ECONOMY',
      'INTERNATIONAL TRADE', 'DEVELOPMENT ECONOMICS I', 'DEVELOPMENT ECONOMICS II', 'ENVIRONMENTAL ECONOMICS',
      'PUBLIC ECONOMICS', 'ECONOMIC HISTORY OF INDIA', 'COMPARATIVE ECONOMIC DEVELOPMENT', 'INDIAN ECONOMY',
      'INTERNATIONAL MACROECONOMICS', 'SAVINGS & INVESTMENT ANALYSIS', 'MONEY AND FINANCIAL MARKETS',
      'APPLIED ECONOMETRICS', 'FINANCIAL ECONOMICS', 'GAME THEORY', 'HISTORY OF ECONOMIC THOUGHT', 'PUBLIC POLICY',
      'STATISTICS', 'PROBABILITY & STATISTICS', 'BUSINESS STATISTICS', 'NORMAL STATISTICS', 'STATISTICAL ANALYSIS'
    ] 
  },
  'ba_h': { 
    id: 'ba_h', 
    name: 'B.A. HONOURS (HUMANITIES)', 
    subjects: [
      'INTRODUCTORY POLITICAL THEORY', 'HISTORICAL PERSPECTIVES', 'INTRODUCTORY SOCIOLOGY', 'PSYCHOLOGICAL FOUNDATIONS',
      'ANCIENT HISTORY', 'CONSTITUTIONAL GOVERNMENT', 'SOCIAL STRATIFICATION', 'DEVELOPMENTAL PSYCHOLOGY',
      'MEDIEVAL WORLD', 'MODERN POLITICAL THOUGHT', 'GLOBAL POLITICS', 'CONTEMPORARY INDIA', 'LANGUAGE & LITERATURE',
      'POLITICAL PROCESSES', 'RESEARCH METHODOLOGY', 'PUBLIC ADMINISTRATION', 'GENDER & SOCIETY',
      'ENGLISH LITERATURE', 'COMMUNICATION SKILLS', 'PHILOSOPHY OF MIND', 'SOCIAL PROBLEMS IN INDIA', 'ETHICS & VALUES',
      'CLASSICAL SOCIOLOGICAL THOUGHT', 'INDIAN NATIONAL MOVEMENT', 'WESTERN POLITICAL THOUGHT', 'CREATIVE WRITING IN ENGLISH', 'COLONIALISM AND NATIONALISM IN INDIA', 'INTERNATIONAL RELATIONS THEORY', 'CITIZENSHIP IN A GLOBALIZING WORLD', 'STUDY OF WORLD LITERATURES'
    ] 
  },
  'bsc_h': { 
    id: 'bsc_h', 
    name: 'B.SC. HONOURS (SCIENCES)', 
    subjects: [
      'MATHEMATICAL PHYSICS', 'MECHANICS', 'WAVES AND OPTICS', 'QUANTUM MECHANICS', 'STATISTICAL MECHANICS', 'ELECTRICITY & MAGNETISM',
      'INORGANIC CHEMISTRY', 'ORGANIC CHEMISTRY', 'PHYSICS CHEMISTRY', 'MOLECULAR BIOLOGY', 'GENETICS', 'ANALYTICAL TECH',
      'CALCULUS', 'ALGEBRA', 'LINEAR ALGEBRA', 'COMPLEX ANALYSIS', 'REAL ANALYSIS', 'PROBABILITY & STATISTICS',
      'CELL BIOLOGY', 'ECOLOGY', 'PHYSIOLOGY', 'EVOLUTION', 'TAXONOMY', 'MICROBIOLOGY',
      'ANALYTICAL CHEMISTRY', 'BIOCHEMISTRY', 'NUCLEAR PHYSICS', 'SOLID STATE PHYSICS', 'LASER PHYSICS',
      'APPLIED PHYSICS', 'BIOSTATISTICS', 'MOLECULAR GENETICS', 'ORGANIC SYNTHESIS', 'ELECTROMAGNETISM AND CIRCUITS', 'POLYMERS & PLASTICS', 'GEO-PHYSICS & METEOROLOGY', 'QUANTUM CHEMISTRY'
    ] 
  },
  'bsc_stats_h': {
    id: 'bsc_stats_h',
    name: 'B.SC. HONOURS STATISTICS',
    subjects: [
      'DESCRIPTIVE STATISTICS', 'NORMAL STATISTICS', 'CALCULUS', 'INTRODUCTORY PROBABILITY', 'COMPUTATIONAL STATISTICS USING EXCEL LAB',
      'PROBABILITY AND PROBABILITY DISTRIBUTIONS', 'ALGEBRA AND LINEAR ALGEBRA', 'STATISTICAL METHODOLOGY', 'DATA ANALYSIS LAB',
      'MATHEMATICAL ANALYSIS', 'SAMPLING DISTRIBUTIONS', 'SURVEY SAMPLING AND NSSD', 'STATISTICAL COMPUTING IN C/C++ LAB',
      'STATISTICAL INFERENCE', 'LINEAR MODELS AND REGRESSION', 'STATISTICAL QUALITY CONTROL', 'NUMERICAL ANALYSIS & COMPUTATION LAB',
      'STOCHASTIC PROCESSES AND QUEUING THEORY', 'STATISTICAL INFERENCE AND TESTING', 'BIO-STATISTICS AND DEMOGRAPHY', 'STATISTICAL COMPUTING USING R LAB',
      'DESIGN OF EXPERIMENTS', 'MULTIVARIATE ANALYSIS', 'ACTUARIAL STATISTICS', 'TIME SERIES ANALYSIS', 'MACHINE LEARNING & PREDICTIVE MODELLING LAB'
    ]
  },
  'bsc_maths_h': {
    id: 'bsc_maths_h',
    name: 'B.SC. HONOURS MATHEMATICS',
    subjects: [
      'CALCULUS AND ANALYTIC GEOMETRY', 'ALGEBRA & TRIGONOMETRY', 'ELEMENTARY REAL ANALYSIS', 'DISCRETE MATHEMATICS',
      'DIFFERENTIAL EQUATIONS', 'GROUP THEORY I', 'REAL ANALYSIS I', 'MATHEMATICAL MODELING LAB',
      'RING THEORY & LINEAR ALGEBRA I', 'MULTIVARIATE CALCULUS', 'NUMERICAL METHODS', 'COMPUTER ALGEBRA SYSTEMS LAB',
      'PARTIAL DIFFERENTIAL EQUATIONS', 'GROUP THEORY II', 'RIEMANN INTEGRATION & SERIES OF FUNCTIONS', 'COMPUTATIONAL MATHEMATICS LAB',
      'METRIC SPACES', 'RING THEORY & LINEAR ALGEBRA II', 'NUMBER THEORY', 'PROBABILITY & STATISTICS', 'STATISTICS', 'NORMAL STATISTICS', 'MATHEMATICAL STATISTICS',
      'COMPLEX ANALYSIS', 'FUNCTIONAL ANALYSIS', 'FLUID DYNAMICS', 'BIO-MATHEMATICS', 'LINEAR PROGRAMMING & GAME THEORY'
    ]
  },
  'bsc_physics_h': {
    id: 'bsc_physics_h',
    name: 'B.SC. HONOURS PHYSICS',
    subjects: [
      'MATHEMATICAL PHYSICS - I', 'MECHANICS', 'WAVES AND OSCILLATIONS', 'PHYSICS LABORATORY - I',
      'ELECTRICITY AND MAGNETISM', 'WAVES AND OPTICS', 'QUANTUM MECHANICS', 'PHYSICS LABORATORY - II',
      'MATHEMATICAL PHYSICS - II', 'THERMAL PHYSICS', 'DIGITAL SYSTEMS AND APPLICATIONS', 'PHYSICS LABORATORY - III',
      'MATHEMATICAL PHYSICS - III', 'ELEMENTS OF MODERN PHYSICS', 'ANALOG SYSTEMS AND ELECTRONICS', 'PHYSICS LABORATORY - IV',
      'ELECTROMAGNETIC THEORY', 'STATISTICAL MECHANICS', 'SOLID STATE PHYSICS', 'ADVANCED PHYSICS LABORATORY - V',
      'QUANTUM MECHANICS & APPLICATIONS', 'NUCLEAR & PARTICLE PHYSICS', 'NANO MATERIALS AND APPLICATIONS', 'COMPUTATIONAL PHYSICS LAB'
    ]
  },
  'bsc_chemistry_h': {
    id: 'bsc_chemistry_h',
    name: 'B.SC. HONOURS CHEMISTRY',
    subjects: [
      'INORGANIC CHEMISTRY - I', 'PHYSICAL CHEMISTRY - I', 'CHEMISTRY PRACTICE LAB - I', 'BASIC ORGANIC CHEMISTRY',
      'ORGANIC CHEMISTRY - I', 'PHYSICAL CHEMISTRY - II', 'CHEMISTRY PRACTICE LAB - II', 'ENVIRONMENTAL CHEMISTRY',
      'INORGANIC CHEMISTRY - II', 'ORGANIC CHEMISTRY - II', 'PHYSICAL CHEMISTRY - III', 'CHEMISTRY COMP REAGENTS LAB',
      'INORGANIC CHEMISTRY - III', 'ORGANIC CHEMISTRY - III', 'PHYSICAL CHEMISTRY - IV', 'ANALYTICAL CHEMISTRY LAB',
      'INORGANIC CHEMISTRY - IV', 'ORGANIC CHEMISTRY - IV', 'MOLECULAR MODELLING & DRUG DESIGN', 'POLYMER CHEMISTRY LAB',
      'ORGANIC CHEMISTRY - V', 'PHYSICAL CHEMISTRY - V', 'GREEN CHEMISTRY', 'INSTRUMENTAL METHODS OF CHEMICAL ANALYSIS'
    ]
  },
  'bsc_math_sci': {
    id: 'bsc_math_sci',
    name: 'B.SC. MATHEMATICAL SCIENCES',
    subjects: [
      'TOPICS IN CALCULUS', 'INTRODUCTION TO OPERATIONAL RESEARCH AND LINEAR PROGRAMMING', 'PROGRAMMING USING PYTHON', 'DESCRIPTIVE STATISTICS AND PROBABILITY THEORY', 'NORMAL STATISTICS',
      'ALGEBRA', 'INVENTORY SYSTEMS AND CONTROL', 'DATABASE MANAGEMENT SYSTEMS', 'STATISTICAL INFERENCE',
      'ORDINARY DIFFERENTIAL EQUATIONS', 'QUEUEING AND RELIABILITY THEORY', 'OPERATING SYSTEMS', 'SAMPLE SURVEYS AND DESIGN OF EXPERIMENTS',
      'REAL ANALYSIS', 'OPTIMIZATION TECHNIQUES', 'COMPUTER NETWORKS', 'APPLIED STATISTICS',
      'SEQUENCING & NETWORK ANALYSIS', 'STOCHASTIC PROCESSES', 'STATISTICAL COMPUTING USING R LAB', 'MATHEMATICAL MODELLING & SIMULATION',
      'LINEAR PROGRAMMING OR DISCRETE MATHEMATICS', 'CHATERED RISK ANALYTICS', 'PORTFOLIO OPTIMIZATION TECHNIQUES'
    ]
  },
  'mca': { 
    id: 'mca', 
    name: 'MCA (MATSTERS)', 
    subjects: [
      'DISCRETE MATHEMATICS', 'COMPUTER ORGANIZATION & ARCHITECTURE', 'PROGRAMMING WITH C', 'DATA AND FILE STRUCTURES',
      'OPERATING SYSTEMS', 'DBMS', 'DESIGN AND ANALYSIS OF ALGORITHMS', 'OBJECT ORIENTED PROGRAMMING USING JAVA',
      'SOFTWARE ENGINEERING', 'COMPUTER NETWORKS', 'WEB TECHNOLOGIES', 'ARTIFICIAL INTELLIGENCE',
      'COMPILER DESIGN', 'DATA WAREHOUSING & DATA MINING', 'ADVANCED COMPUTER ARCHITECTURE', 'CLOUD COMPUTING',
      'BIG DATA ANALYTICS', 'MOBILE COMPUTING', 'INTERNET OF THINGS (IOT)', 'SOFT COMPUTING',
      'PROFESSIONAL PROFICIENCY', 'MAJOR PROJECT', 'NETWORK SECURITY', 'CYBER SECURITY',
      'FULL STACK WEB DEVELOPMENT', 'LINUX SYSTEM ADMINISTRATION', 'SOFTWARE TESTING & QUALITY ASSURANCE', 'DATA SCIENCE WITH PYTHON', 'ADVANCED DBMS & SQL', 'ENTERPRISE APPLICATION DEVELOPMENT (J2EE)', 'MACHINE LEARNING ALGORITHMS', 'INFORMATION SECURITY & CYBER LAWS', 'UX/UI DESIGN PRINCIPLES', 'MOBILE EMBEDDED ARCHITECTURE',
      'STATISTICS', 'PROBABILITY & STATISTICS', 'NORMAL STATISTICS',
      // BCIIT MCA Extensions
      'MCA-101 Discrete Structures', 'MCA-103 Computer Networks', 'MCA-105 Operating Systems with Linux', 'MCA-107 Database Management System', 'MCA-109 Object Oriented Programming and Java',
      'MCA-161 Computer Networks Lab', 'MCA-163 Operating Systems with Linux Lab', 'MCA-165 Database Management System Lab', 'MCA-169 Object Oriented Programming and Java Lab',
      'MCA-168 Minor Project-I', 'MCA-171 Professional Proficiency-I', 'MCA-102 Data and File Structures', 'MCA-104 Object Oriented Software Engineering',
      'MCA-106 Python Programming', 'MCA-108 ADBMS', 'MCA-114 Full Stack Development', 'MCA-128 Digital Marketing', 'MCA-170 Minor Project-II',
      'MCA-172 Environment Science', 'MCA-174 Professional Proficiency-II', 'MCA-162 Data and File Structures Lab', 'MCA-164 Object Oriented Software Engineering Lab',
      'MCA-166 Python Programming Lab', 'MCA-168 ADBMS Lab', 'MCA-164 Full Stack Development Lab', 'MCA-201 Design and Analysis of Algorithms',
      'MCA-261 Design and Analysis of Algorithms Lab', 'MCA-203 Artificial Intelligence & Machine Learning', 'MCA-263 Artificial Intelligence & Machine Learning Lab',
      'MCA-223 Cloud Computing', 'MCA-265 Cloud Computing Lab', 'MCA-235 Internet of Things', 'MCA-267 Internet of Things Lab', 'MCA-253 Cyber Security & Cyber Laws',
      'MCA-269 Minor Project-III', 'MCA-271 Entrepreneurship Mindset', 'MCA-273 Professional Proficiency-III'
    ]
  },
  'bjmc': { 
    id: 'bjmc', 
    name: 'BA JMC (JOURNALISM - IPU)', 
    subjects: [
      'COMMUNICATION SKILLS', 'HISTORY OF PRINT JOURNALISM', 'INDIAN CONSTITUTION & ADMINISTRATION', 'BASICS OF DESIGN & GRAPHICS',
      'WRITING FOR MEDIA', 'REPORTING & EDITING', 'PRINT JOURNALISM', 'RADIO JOURNALISM',
      'TV JOURNALISM', 'GLOBAL MEDIA SCENARIO', 'MEDIA LAW & ETHICS', 'DEVELOPMENT COMMUNICATION',
      'ADVERTISING', 'PUBLIC RELATIONS', 'ONLINE JOURNALISM', 'FILM STUDIES',
      'PHOTO JOURNALISM', 'ENVIRONMENT COMMUNICATION', 'EVENT MANAGEMENT', 'CORPORATE COMMUNICATION', 'MARKETING COMM',
      'MEDIA MANAGEMENT & ECONOMICS', 'HEALTH COMMUNICATION', 'DOCUMENTARY PRODUCTION', 'BROADCAST EDITING & COMPOSITION', 'PUBLIC POLICY & MEDIA BROADCASTING', 'CONTEMPORARY NATIONAL & GLOBAL AFFAIRS', 'CYBER JOURNALISM & BLOGGING', 'PR & EVENT MANAGEMENT PRACTICE',
      // TIIPS BJMC Extensions
      '101 CCP - Communication Concepts & Processes', '103 CI - Contemporary India', '105 BOD - Basics Of Design & Graphics',
      '109 WS - Writing Skills', '151 CS LAB - Communication Skills Lab', '153 CI LAB - Contemporary India Lab',
      '155 D&G LAB - 1', '159 WS LAB - Writing Skills LAB', '202 BOA - Basics Of Advertising',
      '204 PR - Basics Of Public Relations', '206 TP & P - Television Programming & Production', '210 CC - Corporate Communication',
      '252 AL- Advertising Lab', '254 PRL- Public Relations Lab', '260 CCL- Corporate Communication Lab',
      '256 TPL - Television Production Lab', '306 EC - Enviornment Communication', '352 FP - Final Project & Viva',
      '304 GM - Global Media : An Overview', '302 MME - Media Management & Entrepreneurship'
    ] 
  },
  'llb': { 
    id: 'llb', 
    name: 'LLB (LAW)', 
    subjects: [
      'CONSTITUTIONAL LAW - I', 'LAW OF TORTS', 'LAW OF CONTRACT - I', 'LEGAL METHOD', 'HISTORY OF COURTS & LEGISLATURE',
      'CONSTITUTIONAL LAW - II', 'LAW OF CONTRACT - II', 'FAMILY LAW - I', 'CRIMINAL LAW - I (IPC)', 'LEGAL ENGLISH',
      'FAMILY LAW - II', 'CRIMINAL LAW - II (CRPC)', 'PROPERTY LAW', 'PUBLIC INTERNATIONAL LAW', 'ADMINISTRATIVE LAW',
      'JURISPRUDENCE', 'LAW OF EVIDENCE', 'CODE OF CIVIL PROCEDURE', 'LABOUR LAW', 'COMPANY LAW',
      'TAXATION LAW', 'ENVIRONMENTAL LAW', 'INTELLECTUAL PROPERTY RIGHTS', 'HUMAN RIGHTS LAW', 'COMPETITION LAW', 'CYBER LAW',
      'ALTERNATIVE DISPUTE RESOLUTION (ADR)', 'PROFESSIONAL ETHICS & ACCOUNTANCY FOR LAWYERS', 'DRAFTING, PLEADING & CONVEYANCING', 'Moot Court Exercise and Internship', 'BANKING & INSURANCE LAW', 'LAND REVENUE LAW', 'PUBLIC INTEREST LITIGATION (PIL)', 'INTERNATIONAL TRADE LAW', 'MEDIA & LAW', 'CRIMINOLOGY & PENOLOGY',
      // USLLS-Specific Extensions
      'Constitutional Law-1', 'Law of Torts and Consumer Protection', 'Legal History', 'Sociology- II: Indian Society',
      'English II: Language, Law and Literature (Indian)', 'Legal Research and Moot Court', 'Law of Crimes-II',
      'History III: History of Modern Europe, 1740-1947', 'Economics-III: Economic Development and Policy',
      'Political Science III: International Relations', 'Code of Criminal Procedure II', 'Code of Civil Procedure II',
      'Labour Law-II', 'Interpretation of Statutes', 'International Commercial Law', 'Election Law',
      'International Humanitarian Law', 'Financial Management', 'Human Resource Management', 'Business Ethics and CSR',
      'Entrepreneurship in the Global Era',
      // TIIPS Law Extensions
      'LLB 101 Legal Method', 'LLB 103 Law of Contract-I', 'LLB 105 Legal English and Communication Skills',
      'BA LLB 107 History-I', 'BA LLB 109 Sociology-I', 'LLB 202 Family Law-II', 'LLB 204 Constitutional Law-II',
      'LLB 206 Law of Crimes-II', 'LLB 208 Administrative Law', 'BA LLB 210 Economics-II', 'LLB 302 Jurisprudence',
      'LLB 304 International Law', 'LLB 306 Property Law', 'LLB 308 Investment and Competition Law', 'LLB 310 Code of Criminal Procedure'
    ] 
  },
  'mcom': {
    id: 'mcom',
    name: 'M.COM (MASTERS)',
    subjects: [
      'BUSINESS ENVIRONMENT', 'STATISTICAL ANALYSIS', 'STATISTICS', 'BUSINESS STATISTICS', 'NORMAL STATISTICS', 'ECONOMICS FOR BUSINESS', 'MANAGERIAL ACCOUNTING',
      'FINANCIAL MANAGEMENT', 'MARKETING MANAGEMENT', 'ORGANIZATIONAL BEHAVIOR', 'ACCOUNTING FOR MANAGERS',
      'ADVANCED FINANCIAL MANAGEMENT', 'HUMAN RESOURCE MANAGEMENT', 'INTERNATIONAL BUSINESS',
      'CORPORATE TAX PLANNING', 'SECURITY ANALYSIS & PORTFOLIO MANAGEMENT', 'E-COMMERCE & BUSINESS SOLUTIONS', 'STRATEGIC COST MANAGEMENT', 'FINANCIAL MARKETS & INSTITUTIONS', 'CONSUMER BEHAVIOUR & MARKETING RESEARCH', 'ADVERTISING & SALES MANAGEMENT', 'BUSINESS ETHICS & CORPORATE GOVERNANCE'
    ]
  },
  'msc': {
    id: 'msc',
    name: 'M.SC. (MASTERS)',
    subjects: [
      'ADVANCED QUANTUM MECHANICS', 'CLASSICAL ELECTRODYNAMICS', 'STATISTICAL MECHANICS', 'MATHEMATICAL PHYSICS',
      'SOLID STATE PHYSICS', 'NUCLEAR PHYSICS', 'PARTICLE PHYSICS', 'ELECTRONICS',
      'ATOMIC & MOLECULAR PHYSICS', 'COMPUTATIONAL PHYSICS & PROGRAMMING', 'NUMERICAL ANALYSIS METHODS', 'ADVANCED SPECTROSCOPY', 'CONDENSED MATTER PHYSICS', 'MATERIAL SCIENCE', 'RENEWABLE SOURCES OF ENERGY'
    ]
  },
  'ba_p': {
    id: 'ba_p',
    name: 'B.A. PROGRAMME',
    subjects: [
      'ENGLISH/HINDI/SKT', 'HISTORY', 'POLITICAL SCIENCE', 'ECONOMICS', 'SOCIOLOGY', 'MATHEMATICS',
      'STATISTICS', 'PROBABILITY & STATISTICS', 'NORMAL STATISTICS',
      'COMMUNICATION SKILLS', 'ENVIRONMENTAL STUDIES', 'HUMAN RIGHTS', 'CULTURAL DIVERSITY',
      'PUBLIC ADMINISTRATION', 'CREATIVE WRITING', 'POPULAR CULTURE & REPRESENTATIONS', 'GENDER DISCOURSE IN LITERATURE', 'GEOGRAPHY OF INDIA', 'CONTEMPORARY WORLD HISTORY', 'FUNDAMENTALS OF ECONOMY'
    ]
  },
  'bsc_p': {
    id: 'bsc_p',
    name: 'B.SC. PROGRAMME',
    subjects: [
      'CHEMISTRY', 'PHYSICS', 'MATHEMATICS', 'COMPUTER SCIENCE', 'ELECTRONICS',
      'BOTANY', 'ZOOLOGY', 'STATISTICS', 'PROBABILITY & STATISTICS', 'NORMAL STATISTICS', 'LIFE SCIENCES', 'ENVIRONMENTAL STUDIES', 'COMMUNICATION SKILLS',
      'BIOTECHNOLOGY TECHNIQUES', 'ANALYTICAL CHEMISTRY', 'ENERGY PHYSICS', 'ENVIRONMENTAL POLLUTION AND REMEDIATION', 'GENETICS AND MOLECULAR BIOLOGY', 'PLANT ANATOMY AND EMBRYOLOGY'
    ]
  },
  'bcom_p': {
    id: 'bcom_p',
    name: 'B.COM PROGRAMME',
    subjects: [
      'FINANCIAL ACCOUNTING', 'BUSINESS ORGANISATION AND MANAGEMENT', 'BUSINESS LAWS', 'MICROECONOMICS',
      'ENVIRONMENTAL STUDIES', 'COMMUNICATION IN EVERYDAY LIFE',
      'CORPORATE ACCOUNTING', 'COMPANY LAW', 'HUMAN RESOURCE MANAGEMENT', 'MACROECONOMICS',
      'BUSINESS STATISTICS', 'STATISTICS', 'PROBABILITY & STATISTICS', 'NORMAL STATISTICS', 'FINANCIAL MANAGEMENT', 'PRINCIPLES OF MARKETING', 'BUSINESS MATHEMATICS',
      'COMPUTER APPLICATIONS IN BUSINESS', 'COST ACCOUNTING', 'INCOME TAX LAW AND PRACTICE',
      'INTERNATIONAL BUSINESS', 'GOODS & SERVICES TAX (GST)', 'AUDITING & CORPORATE GOVERNANCE',
      'MANAGEMENT ACCOUNTING', 'PERSONAL FINANCIAL PLANNING', 'ENTREPRENEURSHIP & NEW VENTURES',
      'FINANCIAL MARKETS, INSTITUTIONS & SERVICES', 'E-COMMERCE', 'MARKETING COMMUNICATION',
      'ADVERTISING AND PERSONAL SELLING', 'CONSUMER AFFAIRS AND PROTECTION', 'OFFICE MANAGEMENT AND SECRETARIAL PRACTICE'
    ]
  },
  'bjmc_du': {
    id: 'bjmc_du',
    name: 'BJMC (DU JOURNALISM)',
    subjects: [
      'INTRODUCTION TO JOURNALISM', 'MEDIA & COMMUNICATION', 'MEDIA LAWS', 'REPORTING',
      'EDITING', 'BROADCAST JOURNALISM', 'NEW MEDIA', 'ADVERTISING & PR',
      'DEVELOPMENT JOURNALISM', 'MEDIA RESEARCH METHODS', 'GLOBAL MEDIA ENVIRONMENT', 'SPECIAL FEATURE WRITING', 'INVESTIGATIVE JOURNALISM', 'RADIO & TV DOCUMENTARY PRODUCTION'
    ]
  },
  'bfia': {
    id: 'bfia',
    name: 'BFIA (FINANCE & INVESTMENT)',
    subjects: [
      'FINANCIAL ACCOUNTING', 'MICROECONOMICS', 'MATHEMATICS FOR FINANCE', 'MANAGEMENT PROCESS',
      'FINANCIAL INSTITUTIONS', 'FINANCIAL SERVICES', 'INVESTMENT ANALYSIS', 'SECURITY ANALYSIS',
      'CORPORATE FINANCE', 'PORTFOLIO MANAGEMENT', 'MONEY AND BANKING', 'INTERNATIONAL FINANCE', 'DERIVATIVES & RISK MANAGEMENT', 'TREASURY MANAGEMENT', 'TAXATION LAWS FOR ENTERPRISES'
    ]
  },
  'bsc_cs_h': {
    id: 'bsc_cs_h',
    name: 'B.SC. HONOURS COMPUTER SCIENCE',
    subjects: [
      'PROGRAMMING FUNDAMENTALS', 'COMPUTER SYSTEM ARCHITECTURE', 'DATA STRUCTURES', 'DISCRETE STRUCTURES',
      'OPERATING SYSTEMS', 'COMPUTER NETWORKS', 'ALGORITHMS', 'SOFTWARE ENGINEERING',
      'DATABASE MANAGEMENT SYSTEMS', 'THEORY OF COMPUTATION', 'SYSTEM PROGRAMMING', 'INTERNET TECHNOLOGIES', 'ARTIFICIAL INTELLIGENCE', 'GRAPHICS AND MULTIMEDIA', 'DATA MINING AND MACHINE LEARNING', 'INFORMATION SECURITY', 'JAVA PROGRAMMING', 'ADVANCED JAVA',
      'STATISTICS', 'PROBABILITY & STATISTICS', 'NORMAL STATISTICS'
    ]
  },
  'mtech': {
    id: 'mtech',
    name: 'M.TECH (POST GRADUATE)',
    subjects: [
      'ADVANCED DATA STRUCTURES', 'ADVANCED ALGORITHMS', 'CLOUD COMPUTING', 'DISTRIBUTED SYSTEMS',
      'BIOINFORMATICS', 'SOFT COMPUTING', 'NETWORK SECURITY', 'VIRTUALIZATION',
      'HIGH PERFORMANCE IMPLEMENTATION', 'EMBEDDED SYSTEMS DESIGN', 'PATTERN RECOGNITION', 'CYBER-PHYSICAL SYSTEMS', 'RECONFIGURABLE COMPUTING', 'NEURAL NETWORKS & DEEP LEARNING', 'INTELLIGENT AGENTS'
    ]
  },
  'llm': {
    id: 'llm',
    name: 'LLM (MASTERS IN LAW)',
    subjects: [
      'LEGAL EDUCATION & RESEARCH', 'LAW & SOCIAL TRANSFORMATION', 'CONSTITUTIONAL LAW', 'INTELLECTUAL PROPERTY RIGHTS',
      'CORPORATE LAW', 'INTERNATIONAL LAW', 'HUMAN RIGHTS', 'CRIMINAL LAW',
      'COMPARATIVE CONSTITUTIONAL LAW', 'ADMINISTRATIVE DISCRETION & CONTROL', 'INTERNATIONAL HUMANITarian LAW', 'COLLECTIVE BARGAINING & LABOUR LAWS', 'LAW OF INSOLVENCY AND BANKRUPTCY',
      // USLLS-Specific Masters Extensions
      'Penology: Treatment of Offenders', 'Privileged Class Deviance', 'Crime and Investigation in ICT Era',
      'International Criminal Justice System', 'Practical Training in ADR Skills', 'Practical Applications of ADR Methods',
      'International Legal Writing', 'International Commercial Arbitration', 'Mediation, Conciliation and Negotiation',
      'Law of Patents', 'Law of Trademarks', 'Law of Designs, layout designs and geographical indication',
      'Protection of Plant Varieties and Traditional Knowledge', 'Regulation of Capital Market & Foreign Investment',
      'Corporate Taxation', 'Banking and Insurance Laws', 'Law of Corporate finance and security regulation'
    ]
  },
  'bms': {
    id: 'bms',
    name: 'BMS (MANAGEMENT STUDIES)',
    subjects: [
      'BUSINESS ACCOUNTING', 'BUSINESS STATISTICS', 'STATISTICS', 'PROBABILITY & STATISTICS', 'NORMAL STATISTICS', 'MANAGERIAL ECONOMICS', 'BUSINESS COMMUNICATION',
      'MACROECONOMICS', 'FINANCIAL MANAGEMENT', 'MARKETING MANAGEMENT', 'ORGANIZATIONAL BEHAVIOR',
      'PRODUCTION & OPERATIONS MANAGEMENT', 'LEGAL ASPECTS OF BUSINESS', 'MANAGEMENT ACCOUNTING', 'E-COMMERCE',
      'STRATEGIC MANAGEMENT', 'ENTREPRENEURSHIP', 'INTERNATIONAL BUSINESS', 'OPERATIONS RESEARCH',
      'BRAND MANAGEMENT', 'RETAIL LOGISTICS', 'CONSUMER ELECTRONICS MARKETING', 'CORPORATE FINANCE DECISIONS', 'FAMILY BUSINESS MANAGEMENT', 'HUMAN RESOURCE DEVELOPMENT'
    ]
  },
  'mba': {
    id: 'mba',
    name: 'MBA (MASTERS)',
    subjects: [
      'MANAGEMENT PROCESS', 'QUANTITATIVE TECHNIQUES', 'STATISTICS', 'BUSINESS STATISTICS', 'NORMAL STATISTICS', 'MANAGERIAL ECONOMICS', 'FINANCIAL ACCOUNTING',
      'MARKETING MANAGEMENT', 'FINANCIAL MANAGEMENT', 'HUMAN RESOURCE MANAGEMENT', 'OPERATIONS MANAGEMENT',
      'BUSINESS ENVIRONMENT', 'STRATEGIC MANAGEMENT', 'MANAGEMENT INFORMATION SYSTEMS', 'BUSINESS LAW',
      'ENTRPRENEURSHIP', 'PROJECT MANAGEMENT', 'SUPPLY CHAIN MANAGEMENT', 'INTERNATIONAL BUSINESS',
      'CONSUMER BEHAVIOUR', 'SALES AND DISTRIBUTION MANAGEMENT', 'FINANCIAL DERIVATIVES', 'PORTFOLIO MANAGEMENT & STOCKS', 'INDUSTRIAL RELATIONS & LABOUR SYSTEM', 'TALENT MANAGE & HRMETRICS', 'CORPORATE STRATEGY & CSR',
      // USMS-Specific Extensions
      'Business Communication', 'Business Ethics and Corporate Governance', 'Business Intelligence', 'Corporate Social Responsibility',
      'Database Management Systems', 'E-Commerce', 'Financial Analytics', 'Financial Markets and Institutions',
      'Information Systems Management', 'Investment Analysis & Portfolio Management', 'Management of International Business',
      'Systems Analysis and Design', 'Sustainable Development', 'Organizational Behavior', 'Consumer Behavior', 'Digital Marketing',
      // Tecnia CDL Extensions
      'MMPC007 Business Communication', 'MMPC005 Quantitative Analysis for Managerial Applications', 'MMPC003 Human Resource Management', 'MMPC004 Accounting for Managers', 'MMPC006 Marketing Management', 'MMPC001 Management Functions and Organisational Processes',
      'MMPC010 Managerial Economics', 'MMPC012 Strategic Management', 'MMPC013 Business laws', 'MMPC014 Financial Management',
      'Working Capital Management', 'Management of Financial Services', 'Management Control Systems', 'Capital Investment and Financing Decisions',
      'Compensation and Reward Management', 'Industrial and Employment Relations', 'Human Resource Development', 'Product and Brand Management', 'Marketing of Services', 'Consumer Behaviour',
      'MMPC020 Business Ethics and CSR', 'MMPC019 Total Quality Management', 'MMPC018 Entrepreneurship',
      'MMPH103 Human Resource Planning', 'MMPH09 International Human Resource Mgmt', 'MMPH06 Organisational Dynamics', 'MMPH05 Organisation Development and Change'
    ]
  },
  'pgdm': {
    id: 'pgdm',
    name: 'PGDM (POST GRADUATE DIPLOMA IN MANAGEMENT)',
    subjects: [
      'Management Process & Organizational Behaviour(MPOB)', 'Accounting for Management (AFM)', 'Marketing Management (MM)', 'Business Communication (BC)', 'Managerial Economics (ME)', 'Legal Aspects of Business (LAB)', 'Computer Applications in Management (CAM)',
      'Human Resource Management (HRM)', 'Decision Sciences (DS)', 'Quantitative Techniques (QT)', 'Financial Management (FM)', 'Technology and Innovation Management (TIM)', 'Indian Knowledge Systems (IKS)', 'Social Sensitization Projects (SSP)',
      'Operations Management (OM)', 'Management of Information System (MIS)', 'Information Technologies Management (ITM)', 'Business Research (BR)', 'Project Management (PM)', 'International Economics (IE)', 'Minor Project (MP)',
      'International Business (IB)', 'E-Business (EB)', 'Internship (ITSP)', 'International Finance Management (IFM)', 'Financial Markets and Institutions (FMI)', 'Management of Training Learning and Development (MTLD)', 'Managing Industrial Relations (MIR)', 'Logistic and Supply Chain Management (LSCM)', 'Operations Strategy (OS)', 'Digital & Social Media Marketing (DSMM)', 'Sales and Distribution Management (SDM)', 'Digitalization and E-Governance (DEG)', 'Data Base Management System (DBMS)', 'Essentials of Family Business Management (EFBM)', 'Business Plan, Private Equity, Franchising, Social Entrepreneurship (BPPEF)',
      'Entrepreneurship Development (ED)', 'Strategic Management (SM)', 'System Analysis and Design (SAD)', 'Invest Analysis And Portfolio Management (IAPM)', 'Financial Econometrics (FE)', 'Talent Management (TM)', 'Compensation and Performance Management (CPM)', 'Predictive Analytics & Big Data (PABD)', 'Operations Research (OR)', 'Service Marketing (SM)', 'Customer Relationship (CR)', 'Enterprise Resource Planning for Management (ERP)', 'Internet of Things (IOT) for Management (IOT)', 'Family Business Startup (FBS)', 'Family Business and Environmental Concerns (FBE)',
      'Skill Development (SD)', 'Business Ethics (BE)', 'Dissertation (D)', 'Financial Risk Management (FRM)', 'Project Management And Infrastructure Finance (PMIF)', 'HR Analytics (HRA)', 'Strategic HRM & Future of Work (SHRM)', 'Enterprise System (ES)', 'Production Management (PM)', 'Sales and Channel Management (SCM)', 'Brand Management (BM)', 'AI and Machine Learning Applications in Business (AIML)', 'Cyber Security for Management (CS)', 'IT for Family Business Management (ITFBM)', 'Case study of Family owned business (CSF)'
    ]
  },
  'ma': {
    id: 'ma',
    name: 'MA (POST GRADUATE)',
    subjects: [
      'RESEARCH METHODOLOGY', 'CORE THEORY I', 'CORE THEORY II', 'ELECTIVE I',
      'PHILOSOPHY OF LANGUAGE', 'CONTEMPORARY ISSUES', 'LITERARY CRITICISM', 'GLOBAL POLITICS',
      'SOCIO-POLITICAL THOUGHT', 'CULTURAL ANTHROPOLOGY', 'ETHICS & PUBLIC INTEREST', 'COMPARATIVE CRITIQUE', 'LITERARY PERSPECTIVES', 'GLOBALIZATION THEORY'
    ]
  },
  'mbbs': {
    id: 'mbbs',
    name: 'MBBS (MEDICINE & SURGERY)',
    subjects: [
      'HUMAN ANATOMY', 'HUMAN PHYSIOLOGY', 'BIOCHEMISTRY', 'PATHOLOGY', 'MICROBIOLOGY', 'PHARMACOLOGY', 'FORENSIC MEDICINE', 'COMMUNITY MEDICINE', 'GENERAL MEDICINE', 'GENERAL SURGERY', 'OBSTETRICS & GYNAECOLOGY', 'PEDIATRICS',
      'OPHTHALMOLOGY', 'OTORHINOLARYNGOLOGY (ENT)', 'DERMATOLOGY & VENEREOLOGY', 'PSYCHIATRY & BEHAVIORAL MEDICINE', 'ORTHOPAEDICS', 'ANAESTHESIOLOGY & CRITICAL CARE', 'RADIODIAGNOSIS',
      // BSA Medical College Departments/Subjects
      'Anatomy', 'Physiology', 'Biochemistry', 'Pharmacology', 'Pathology', 'Microbiology', 'Forensic Medicine', 'Community Medicine', 'General Medicine', 'Paediatrics', 'Tuberculosis & Respiratory Diseases', 'Dermatology', 'Psychiatry', 'General Surgery', 'Orthopaedics', 'Oto-Rhino- Laryngology', 'Ophthalmology', 'OBS.& GYN', 'Anesthesiology', 'Radio-Diognosis', 'Dentistry', 'Emergency Medicine', 'Radiotherapy'
    ]
  },
  'bsc_nursing': {
    id: 'bsc_nursing',
    name: 'B.SC. HONS NURSING',
    subjects: [
      'NURSING FOUNDATION', 'ANATOMY & PHYSIOLOGY', 'NUTRITION & DIETETICS', 'BIOCHEMISTRY & BIOPHYSICS', 'PSYCHOLOGY', 'MICROBIOLOGY', 'MATERNAL NURSING', 'CHILD HEALTH NURSING', 'COMMUNITY HEALTH NURSING', 'MEDICAL SURGICAL NURSING',
      'SOCIOLOGY OF HEALTH', 'COMMUNICATION & EDUCATIONAL TECHNOLOGY', 'NURSING RESEARCH & STATISTICS', 'NURSING MANAGEMENT & LEADERSHIP', 'PATHOLOGY & PHARMACOLOGY FOR NURSES'
    ]
  },
  'bams': {
    id: 'bams',
    name: 'BAMS (AYURVEDIC MEDICINE)',
    subjects: [
      'SANSKRIT', 'PADARTHA VIGYAN', 'SHARIR KRIYA', 'SHARIR RACHANA', 'DRAVYAGUNA VIGHYAN', 'RASASHASTRA', 'ROGA NIDANA', 'KAYA CHIKITSA', 'SHALYA TANTRA', 'SHALAKYA TANTRA',
      'PRASUTI TANTRA EVUM STRI ROGA', 'KAUMARBHRITYA (PEDIATRICS)', 'PANCHAKARMA THEORY & PRACTICAL', 'RESEARCH METHODOLOGY & MEDICAL STATISTICS',
      // CBPACS BAMS Extensions
      'SAMHITA SIDDHANT AND SANSKRIT', 'RACHANA SHARIR (ANATOMY)', 'KRIYA SHARIR (PHYSIOLOGY)', 'DRAVYA GUNA (PHARMACOLOGY)', 'SWASTHA VRITTA (PREVENTIVE SOCIAL MEDICINE)',
      'RASA SHASTRA AND BHAISHAJYA KALPANA (PHARMACEUTICS)', 'ROGNIDAN EVAM VIKRUTI VIGYANA (PATHOLOGY)', 'AGAD TANTRA (MEDICAL JURISPRUDENCE AND TOXICOLOGY)',
      'KAYA CHIKITSA (MEDICINE)', 'PANCHKARMA', 'SHALYA (SURGERY)', 'KAUMARBHRITYA (PAEDIATRICS)', 'PRASUTI TANTRA EVAM STRI ROGA (GYNAECOLOGY AND OBSTETRICS)', 'SHALAKYA (EYE AND ENT)'
    ]
  },
  'bhms': {
    id: 'bhms',
    name: 'BHMS (HOMOEOPATHIC MEDICINE)',
    subjects: [
      'HOMOEOPATHIC PHARMACY', 'HOMOEOPATHIC MATERIA MEDICA', 'ORGANON OF MEDICINE', 'PATHOLOGY & MICROBIOLOGY', 'FORENSIC MEDICINE & TOXICOLOGY', 'PRACTICE OF MEDICINE', 'SURGERY WITH HOMOEOPATHIC THERAPEUTICS', 'GYNAECOLOGY WITH HOMOEOPATHIC THERAPEUTICS',
      'REPERTORY & CASE TAKING', 'COMMUNITY MEDICINE & PROMOTION'
    ]
  },
  'bpt': {
    id: 'bpt',
    name: 'BACHELOR OF PHYSIOTHERAPY (BPT)',
    subjects: [
      'HUMAN ANATOMY', 'HUMAN PHYSIOLOGY', 'BIOCHEMISTRY', 'BIOMECHANICS', 'PSYCHOLOGY', 'PATHOLOGY & MICROBIOLOGY', 'PHARMACOLOGY', 'EXERCISE THERAPY', 'ELECTROTHERAPY', 'PHYSIOTHERAPY IN ORTHOPAEDICS', 'PHYSIOTHERAPY IN NEUROLOGY', 'PHYSIOTHERAPY IN CARDIO-RESPIRATORY',
      'RESEARCH METHODOLOGY & BIOSTATISTICS', 'REHABILITATION MEDICINE & ASSISTIVE DEVICES', 'SUPERVISED ROTATING CLINICAL INTERNSHIP'
    ]
  },
  'bsc_mlt': {
    id: 'bsc_mlt',
    name: 'B.SC. IN MEDICAL LAB TECHNOLOGY',
    subjects: [
      'HUMAN ANATOMY', 'HUMAN PHYSIOLOGY', 'CLINICAL BIOCHEMISTRY', 'CLINICAL HEMATOLOGY', 'CLINICAL MICROBIOLOGY', 'CLINICAL PATHOLOGY', 'HISTOPATHOLOGY', 'IMMUNOLOGY & SEROLOGY', 'BLOOD BANKING & COAGULATION',
      'LABORATORY ORGANISATION & SYSTEM ETHICS', 'MEDICAL PARASITOLOGY & MYCOLOGY', 'ADVANCED MOLECULAR DIAGNOSTICS & SYSTEM CYTOLOGY'
    ]
  },
  'baslp': {
    id: 'baslp',
    name: 'BACHELOR OF AUDIOLOGY & SPEECH LANGUAGE PATHOLOGY',
    subjects: [
      'ANATOMY & PHYSIOLOGY OF HEARING', 'SPEECH ACUSTICS & DEVELOPMENT', 'SPEECH-LANGUAGE PATHOLOGY', 'AUDIOLOGY', 'ACCOUSTICS & HEARING AIDS', 'CLINICAL PRACTICUM',
      'NEURO MOTOR SPEECH DISORDERS', 'FLUENCY DISORDERS & TREATMENT', 'HEARING DEVICES & AMPLIFICATION TECHNOLOGY', 'PEDIATRIC AUDIOLOGY PROCEDURES'
    ]
  },
  'bot': {
    id: 'bot',
    name: 'BACHELOR OF OCCUPATIONAL THERAPY (BOT)',
    subjects: [
      'ANATOMY & PHYSIOLOGY', 'PSYCHOLOGY', 'OCCUPATIONAL THERAPY THEORY', 'OT IN ORTHOPAEDICS', 'OT IN NEUROLOGY', 'COMMUNITY REHABILITATION',
      'ERGONOMICS & WORKPHYSIOLOGY', 'OT IN PSYCHIATRICS & MENTAL HEALTH', 'OT IN NEURO-PEDIATRICS AND DEVELOPMENTS'
    ]
  },
  'bpo': {
    id: 'bpo',
    name: 'BACHELOR OF PROSTHETICS & ORTHOTICS (BPO)',
    subjects: [
      'PROSTHETICS THEORY', 'ORTHOTICS THEORY', 'ANATOMY & PHYSIOLOGY', 'WORKSHOP TECHNOLOGY', 'APPLIED BIOMECHANICS', 'CLINICAL PRACTICUM',
      'UPPER LIMB ORTHOTICS SYSTEMS', 'LOWER LIMB PROSTHETICS SYSTEMS', 'SPINAL ALIGNMENT SYSTEMS & ASSISTIVE GAITS'
    ]
  },
  'ba_la': {
    id: 'ba_la',
    name: 'B.A. (LIBERAL ARTS)',
    subjects: [
      'FOUNDATION COURSE', 'LITERATURE & ARTS', 'HUMAN BEHAVIOURAL SCIENCES', 'SOCIETY & POLITICS', 'PHILOSOPHY & ETHICS', 'RESEARCH & CRITICAL WRITING',
      'CREATIVE PRESENTATION TECHNIQUES', 'POPULAR CULTURE DISCOURSES', 'INTRODUCTION TO PSYCHOLOGY', 'ENVIRONMENTAL HISTORY', 'GLOBAL ETHICAL ISSUES'
    ]
  },
  'ba_bed': {
    id: 'ba_bed',
    name: 'B.A. B.ED (INTEGRATED)',
    subjects: [
      'CHILDHOOD & GROWING UP', 'CONTEMPORARY INDIA & EDUCATION', 'LANGUAGE ACROSS CURRICULUM', 'PEDAGOGY OF SCHOOL SUBJECT', 'LEARNING & TEACHING', 'GENDER, SCHOOL & SOCIETY',
      'DEVELOPING SYLLABUS & CURRICULUM', 'CREATING AN INCLUSIVE SCHOOL', 'ASSESSMENT FOR LEARNING', 'UNDERSTANDING THE SELF',
      // AIE B.Ed Regular Subjects/Syllabus
      'BED210: Gender, School and Society', 'BED212: Knowledge and Curriculum Perspectives in Education', 'BED214: Guidance and Counselling', 'BED216: Environmental Education',
      'BED218: Creating an Inclusive School', 'BED222: Health and Physical Education', 'BED 232: Life Skills Education', 'BED234: School Leadership',
      'BED252: Reflection on School Experience', 'BED254: Drama and Art in Education', 'BED102: Learning and Teaching', 'BED104: Contemporary perspectives in Education',
      'BED106: Assessment of Learning', 'BED108: Experiential Learning', 'BED110: Entrepreneurial Mindset', 'BED116-150: Pedagogy of School Subject',
      'BED152: Reading and Reflecting on Texts', 'BED154: PSE-II (Preliminary School Engagement)', 'BED101: Childhood and Growing Up',
      'BED103: Philosophical Foundations of Education', 'BED105: Language across the curriculum', 'BED107: Understanding Disciplines and Subjects',
      'BED109: Critical Understanding of ICT', 'BED111: School Organisation and Management', 'BED151: Understanding the Self', 'BED153: PSE-1 (Preliminary School Engagement)'
    ]
  },
  'bed_spl': {
    id: 'bed_spl',
    name: 'B.ED SPECIAL EDUCATION',
    subjects: [
      // AIE B.Ed Special Education Subjects/Syllabus
      'BESDSE101: Human Growth & Development', 'BEDSE103: Contemporary India and Education', 'BEDSE105: Introduction to Sensory Disabilities (VI, HI, Deaf-blind)',
      'BEDSE107: Introduction to Neurodevelopmental Disabilities (LD, ID, ASD)', 'BEDSE109: Introduction to Locomotor & Multiple Disabilities (Deaf-Blind, CP, MD)',
      'BEDSE111: Assessment and Identification of Needs', 'BEDSE151: Practical: Cross Disability & Inclusion', 'BEDSE202: Guidance and Counselling',
      'BEDSE224: Management of Learning Disability', 'BEDSE228: Basic Research & Basic Statistics', 'BEDSE252: Practical: Cross Disability and Inclusion',
      'BEDSE254: Other Disability special school', 'BEDSE256: Inclusive School'
    ]
  }
};


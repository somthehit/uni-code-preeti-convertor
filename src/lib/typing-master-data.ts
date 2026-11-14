/**
 * Nepali Typing Master Pro Curriculum Data (15 Levels)
 * Supports Preeti layout, Romanized layout, and Remington Traditional layout
 */

export interface TypingLesson {
  level: number;
  titleNepali: string;
  subtitle: string;
  keysTargeted: string;
  fingerHint: string;
  textPrompt: string;
  isExam?: boolean;
}

export const TYPING_LEVELS: TypingLesson[] = [
  {
    level: 1,
    titleNepali: 'तह १: होम रो (Home Row — अनशिफ्ट)',
    subtitle: 'a s d f g h j k l ; \' कुञ्जीहरू (ब क म ा न ज व प ि स ु)',
    keysTargeted: "a s d f g h j k l ; '",
    fingerHint: 'हातलाई होम रोमा राख्नुहोस् — बायाँ हात (a s d f), दायाँ हात (j k l ;)',
    textPrompt: 'कस मन कमा बना पानि किसान मानिस बस कम जन वन सम कास माना नाना मामा काका बाबा',
  },
  {
    level: 2,
    titleNepali: 'तह २: होम रो (Shift र आधा अक्षर)',
    subtitle: 'A S D F G H J K L : " कुञ्जीहरू (ब् क् म् ँ न् ज् व् प् ी स् ू)',
    keysTargeted: 'A S D F G H J K L : "',
    fingerHint: 'Shift कुञ्जी कान्छी औंलाले थिचेर आधा अक्षर र दीर्घ ई-कार/ऊ-कार अभ्यास गर्नुहोस्',
    textPrompt: 'पानी कम्पन जन्ती पूजा समान बास्ना कुम्लो सन्चो पक्का जम्मा बानी पुर्खा काम्लो',
  },
  {
    level: 3,
    titleNepali: 'तह ३: टप रो (Top Row — अनशिफ्ट)',
    subtitle: 'q w e r t y u i o p [ ] \\ कुञ्जीहरू (त्र ध भ च त थ ग ष य उ ृ े ्)',
    keysTargeted: 'q w e r t y u i o p [ ] \\',
    fingerHint: 'औंलालाई होम रोबाट माथिल्लो रोमा पुर्‍याएर फेरि होम रोमा फर्काउनुहोस्',
    textPrompt: 'घर चमेरा तपेस गए कृषि नेपाल उपकार चेतना गाई भाइ तारा यम उपाय चेत',
  },
  {
    level: 4,
    titleNepali: 'तह ४: टप रो (Shift र रेफ/राकार)',
    subtitle: 'Q W E R T Y U I O P { } | कुञ्जीहरू (त्त ध् भ् च् त् थ् ग् क्ष् इ ए र् ै ्र)',
    keysTargeted: 'Q W E R T Y U I O P { } |',
    fingerHint: 'Shift सँग माथिल्लो रो थिच्दा त्त, ध्, भ्, र् (रेफ) बन्दछन्',
    textPrompt: 'पर्वत नेपाली कैलाश प्रगति एकता धर्म कर्म मार्ग धैर्य ऐश्वर्य भ्राता इच्छा',
  },
  {
    level: 5,
    titleNepali: 'तह ५: बटम रो (Bottom Row — अनशिफ्ट)',
    subtitle: 'z x c v b n m , . / कुञ्जीहरू (श ह अ ख द ल फ , । र)',
    keysTargeted: 'z x c v b n m , . /',
    fingerHint: 'औंलालाई तल्लो रोमा लैजाँदा हातको नाडी स्थिर राख्नुहोस्',
    textPrompt: 'शहर अक्षर कमल सफल दशक रहर खत हल अफर नेपाल हाम्रो देश हो। सधैं सत्य बोल्नुपर्छ।',
  },
  {
    level: 6,
    titleNepali: 'तह ६: बटम रो (Shift र विशेष चिन्हहरू)',
    subtitle: 'Z X C V B N M < > ? कुञ्जीहरू (श् ह् ऋ ख् द्य ल् फ् ? श्र रु)',
    keysTargeted: 'Z X C V B N M < > ?',
    fingerHint: 'Shift + > बाट श्र, Shift + B बाट द्य, र ? बाट रु बन्दछ',
    textPrompt: 'श्रम विद्या ऋषि रुपैयाँ शृङ्खला प्रश्न श्रद्धा खण्ड ध्यान प्रह्लाद उत्सव रुकुम',
  },
  {
    level: 7,
    titleNepali: 'तह ७: नम्बर रो र नेपाली अङ्कहरू',
    subtitle: '1-0 (ज्ञ द्ध घ झ छ ट ठ ड ढ ण) र Shift + 1-0 (१ २ ३ ४ ५ ६ ७ ८ ९ ०)',
    keysTargeted: '1 2 3 4 5 6 7 8 9 0 ! @ # $ % ^ & * ( )',
    fingerHint: 'माथिल्लो नम्बर रोमा Shift थिच्दा १ देखि ० सम्मका नेपाली अङ्कहरू आउँछन्',
    textPrompt: 'ज्ञानी १ २ ३ ४ ५ ६ ७ ८ ९ ० छोटो ठूलो डोरी ढिकी बाटो घाटो मिति २०८३ साल ७ महिना २७ गते',
  },
  {
    level: 8,
    titleNepali: 'तह ८: ह्रस्व इ-कार ( l ) विशेष अभ्यास',
    subtitle: 'व्यञ्जन र आधा अक्षरभन्दा पहिले l थिच्ने सीप (कि, न्दि, स्थिति, प्रिय)',
    keysTargeted: 'l s, l G b, l : y l t, l k | o',
    fingerHint: 'प्रिती फन्टमा ह्रस्व इ-कार (l) सधैं आधा अक्षर र व्यञ्जनभन्दा पहिले टाइप गर्नुपर्छ',
    textPrompt: 'किताब दिन जित मिलन मन्दिर स्थिति प्रिय मित्र इतिहास विद्यालय नियमित सिमाना अधिकार',
  },
  {
    level: 9,
    titleNepali: 'तह ९: रेफ ( { ) र राकार ( | ) विशेष अभ्यास',
    subtitle: 'व्यञ्जनपछि { (रेफ) र | (राकार) प्रयोग गर्ने द्रुत अभ्यास',
    keysTargeted: '{ | k| a| u| s{ k"0f{',
    fingerHint: 'रेफ ({) व्यञ्जन र मात्रापछि आउँछ, राकार (|) व्यञ्जनसँगै जोडिन्छ',
    textPrompt: 'कर्म पूर्ण प्रकाश राष्ट्रिय आशीर्वाद प्रार्थना प्रकृति भ्रमण क्रम निर्मल कार्य वर्षा',
  },
  {
    level: 10,
    titleNepali: 'तह १०: संयुक्त वर्ण र Alt-Codes महारथ',
    subtitle: 'क्ष, त्र, ज्ञ, श्र, द्ध, द्य, द्व, ङ, ट्ट, ठ्ठ, रू',
    keysTargeted: 'If q 1 > 4 B å ª Ø Ù ¿',
    fingerHint: 'Alt कोडहरू: ङ (0170), द्व (0229), ट्ट (0216), रू (0191)',
    textPrompt: 'क्षमता त्रिशूल ज्ञान श्रम शुद्ध विद्या द्वन्द्व वाङ्मय चट्टान लट्ठी रूपैयाँ प्रविधि',
  },
  {
    level: 11,
    titleNepali: 'तह ११: सर्वाधिक प्रयोग हुने २०० नेपाली शब्दहरू',
    subtitle: 'दैनिक कार्यालय, समाचार र बोलिचालीमा आउने मुख्य शब्दहरूको गति अभ्यास',
    keysTargeted: 'कखगघङ... सबै कुञ्जीहरू',
    fingerHint: 'शब्द प्रवाहमा टाइप गर्नुहोस्, कुञ्जी हेर्नुभन्दा मनमनै उच्चारण गर्दै औंला चलाउनुहोस्',
    textPrompt: 'नेपाल सरकार समाज विकास संस्कृति समय जीवन विचार मानिस जनता अधिकार कर्तव्य राष्ट्रिय कानुन शान्ति समृद्धि शिक्षा स्वास्थ्य कृषि उद्योग सञ्चार पर्यटन',
  },
  {
    level: 12,
    titleNepali: 'तह १२: कार्यालयीय पत्र तथा निवेदन ढाँचा',
    subtitle: 'श्रीमान् प्रमुख प्रशासकीय अधिकृतज्यू, निवेदन तथा सहकारी लेखा अनुच्छेद',
    keysTargeted: 'कार्यालयीय औपचारिक भाषा',
    fingerHint: 'औपचारिक सरकारी पत्रहरूमा हलन्त, पूर्णविराम र कमाको सही प्रयोगमा ध्यान दिनुहोस्',
    textPrompt: 'श्रीमान् प्रमुख प्रशासकीय अधिकृतज्यू, स्थानीय तह, काठमाडौँ। विषय: योजना सम्झौता सम्बन्धमा। महोदय, प्रस्तुत विषयमा यस वडाअन्तर्गत विनियोजित बजेटबाट सञ्चालन हुने खानेपानी आयोजनाको उपभोक्ता समिति गठन भई सम्झौताका लागि आवश्यक कागजात संलग्न राखी यो निवेदन पेश गरेको व्यहोरा अनुरोध छ।',
  },
  {
    level: 13,
    titleNepali: 'तह १३: साहित्य तथा निबन्ध अनुच्छेद',
    subtitle: 'नेपाली साहित्य, प्राकृतिक सौन्दर्य र ऐतिहासिक लेखहरूको अंश',
    keysTargeted: 'साहित्यिक शब्द भण्डार',
    fingerHint: 'लामो वाक्य संरचना र जटिल संयुक्त वर्णहरूमा निरन्तरता कायम राख्नुहोस्',
    textPrompt: 'सगरमाथाको देश नेपाल प्राकृतिक सौन्दर्य र जैविक विविधताले भरिपूर्ण छ। हिमालबाट कलकल बग्ने नदीनाला, हरियाली फाँटहरू र अनुपम सांस्कृतिक सम्पदाले विश्वका पर्यटकहरूलाई लोभ्याउँछन्। शान्तिका अग्रदूत भगवान् गौतम बुद्धको जन्मभूमि लुम्बिनी यही पावन भूमिमा अवस्थित छ।',
  },
  {
    level: 14,
    titleNepali: 'तह १४: AI कमजोर कुञ्जी सुधार अभ्यास (Smart Weak-Key Drill)',
    subtitle: 'तपाईंले सबैभन्दा बढी गल्ती गर्ने ५ कुञ्जीहरूबाट स्वचालित शब्द अभ्यास',
    keysTargeted: 'Dynamic Weak Keys',
    fingerHint: 'सिस्टमले तपाईंको गल्तीहरूको विश्लेषण गरी विशेष अभ्यास तयार पार्नेछ',
    textPrompt: 'प्रक्रिया परिस्थिति आत्मनिर्भरता विश्वविद्यालय प्रशासनिक कार्यविधि प्रमाणीकरण',
  },
  {
    level: 15,
    titleNepali: 'तह १५: लोकसेवा आयोग परीक्षा सिम्युलेटर (Lok Sewa Exam Simulator)',
    subtitle: '५ वा १० मिनेटको समय सीमा, Backspace Lock विकल्प र आधिकारिक प्रमाणपत्र',
    keysTargeted: 'आधिकारिक लोकसेवा परीक्षा सामग्री',
    fingerHint: 'वास्तविक कम्प्युटर सीप परीक्षण जस्तै ब्याकस्पेस रोकेर वास्तविक गति नाप्नुहोस्',
    isExam: true,
    textPrompt: 'नेपालको संविधानले प्रत्येक नागरिकलाई सम्मानपूर्वक बाँच्न पाउने, स्वतन्त्रताको हक, समानताको हक तथा सूचनाको हकको प्रत्याभूति गरेको छ। सुशासन, पारदर्शिता र जवाफदेहिता लोकतान्त्रिक शासन प्रणालीका आधारस्तम्भ हुन्। सार्वजनिक प्रशासनलाई जनमुखी, नतिजामूलक, मितव्ययी र प्रभावकारी बनाउन सूचना प्रविधिको अधिकतम उपयोग अपरिहार्य भएको छ। सार्वजनिक सेवा प्रवाहलाई छिटो, छरितो र झन्झटरहित बनाउँदै नागरिक सन्तुष्टि अभिवृद्धि गर्नु आजको प्रमुख आवश्यकता हो। कर्मचारीतन्त्रमा पेशागत निष्ठा, इमानदारी र उच्च मनोबल कायम राख्दै राष्ट्रिय विकासका लक्ष्यहरू हासिल गर्न सबै सरोकारवालाहरूको सामूहिक प्रयास आवश्यक पर्दछ।',
  },
];

// Finger assignments for Preeti keyboard
export type FingerType = 'pinky_left' | 'ring_left' | 'middle_left' | 'index_left' | 'thumb' | 'index_right' | 'middle_right' | 'ring_right' | 'pinky_right';

export interface KeyFingerMap {
  key: string;
  finger: FingerType;
  hand: 'left' | 'right';
  fingerNameNepali: string;
  colorClass: string;
}

export const FINGER_COLORS: Record<FingerType, string> = {
  pinky_left: 'bg-rose-500 text-white border-rose-600',
  ring_left: 'bg-amber-500 text-white border-amber-600',
  middle_left: 'bg-emerald-500 text-white border-emerald-600',
  index_left: 'bg-sky-500 text-white border-sky-600',
  thumb: 'bg-slate-400 text-white border-slate-500',
  index_right: 'bg-indigo-500 text-white border-indigo-600',
  middle_right: 'bg-emerald-500 text-white border-emerald-600',
  ring_right: 'bg-amber-500 text-white border-amber-600',
  pinky_right: 'bg-rose-500 text-white border-rose-600',
};

export const FINGER_NAMES_NEPALI: Record<FingerType, string> = {
  pinky_left: 'बायाँ कान्छी औंला (Pinky)',
  ring_left: 'बायाँ साहिँली औंला (Ring)',
  middle_left: 'बायाँ माझी औंला (Middle)',
  index_left: 'बायाँ चोर औंला (Index)',
  thumb: 'बुढी औंला (Thumb)',
  index_right: 'दायाँ चोर औंला (Index)',
  middle_right: 'दायाँ माझी औंला (Middle)',
  ring_right: 'दायाँ साहिँली औंला (Ring)',
  pinky_right: 'दायाँ कान्छी औंला (Pinky)',
};

export const KEY_FINGER_ASSIGNMENTS: Record<string, FingerType> = {
  // Row 1
  '`': 'pinky_left', '~': 'pinky_left',
  '1': 'pinky_left', '!': 'pinky_left',
  '2': 'ring_left', '@': 'ring_left',
  '3': 'middle_left', '#': 'middle_left',
  '4': 'index_left', '$': 'index_left',
  '5': 'index_left', '%': 'index_left',
  '6': 'index_right', '^': 'index_right',
  '7': 'index_right', '&': 'index_right',
  '8': 'middle_right', '*': 'middle_right',
  '9': 'ring_right', '(': 'ring_right',
  '0': 'pinky_right', ')': 'pinky_right',
  '-': 'pinky_right', '_': 'pinky_right',
  '=': 'pinky_right', '+': 'pinky_right',

  // Row 2 (Top)
  'q': 'pinky_left', 'Q': 'pinky_left',
  'w': 'ring_left', 'W': 'ring_left',
  'e': 'middle_left', 'E': 'middle_left',
  'r': 'index_left', 'R': 'index_left',
  't': 'index_left', 'T': 'index_left',
  'y': 'index_right', 'Y': 'index_right',
  'u': 'index_right', 'U': 'index_right',
  'i': 'middle_right', 'I': 'middle_right',
  'o': 'ring_right', 'O': 'ring_right',
  'p': 'pinky_right', 'P': 'pinky_right',
  '[': 'pinky_right', '{': 'pinky_right',
  ']': 'pinky_right', '}': 'pinky_right',
  '\\': 'pinky_right', '|': 'pinky_right',

  // Row 3 (Home)
  'a': 'pinky_left', 'A': 'pinky_left',
  's': 'ring_left', 'S': 'ring_left',
  'd': 'middle_left', 'D': 'middle_left',
  'f': 'index_left', 'F': 'index_left',
  'g': 'index_left', 'G': 'index_left',
  'h': 'index_right', 'H': 'index_right',
  'j': 'index_right', 'J': 'index_right',
  'k': 'middle_right', 'K': 'middle_right',
  'l': 'ring_right', 'L': 'ring_right',
  ';': 'pinky_right', ':': 'pinky_right',
  "'": 'pinky_right', '"': 'pinky_right',

  // Row 4 (Bottom)
  'z': 'pinky_left', 'Z': 'pinky_left',
  'x': 'ring_left', 'X': 'ring_left',
  'c': 'middle_left', 'C': 'middle_left',
  'v': 'index_left', 'V': 'index_left',
  'b': 'index_left', 'B': 'index_left',
  'n': 'index_right', 'N': 'index_right',
  'm': 'index_right', 'M': 'index_right',
  ',': 'middle_right', '<': 'middle_right',
  '.': 'ring_right', '>': 'ring_right',
  '/': 'pinky_right', '?': 'pinky_right',

  // Space
  ' ': 'thumb',
};


/* ═══════════════════════════════════════════════
   SPROUT AI — CHATBOT ENGINE
   Bilingual (EN/HI), Voice, Quick Replies, AI Responses
═══════════════════════════════════════════════ */

'use strict';

// ─── State ───────────────────────────────────────────────────────────────────
const ChatState = {
  isOpen: false,
  language: 'en', // 'en' | 'hi'
  isListening: false,
  synthesis: window.speechSynthesis || null,
  recognition: null,
  messageCount: 0,
};

// ─── Knowledge Base ──────────────────────────────────────────────────────────
const KB = {
  en: {
    welcome: "Namaste! 🌱 I'm Sprout AI — your smart city guide. Ask me anything, or tap the mic to speak!",
    quickReplies: [
      { label: '🚨 Report a City Problem', key: 'report' },
      { label: '🌱 Sustainability Tips', key: 'tips' },
      { label: '🏛️ Government Schemes', key: 'schemes' },
      { label: '❓ Ask Anything', key: 'ask' },
    ],
    subReplies: {
      report: [
        { label: '🗑️ Garbage / Waste', key: 'garbage' },
        { label: '💡 Broken Streetlight', key: 'streetlight' },
        { label: '💧 Water Leakage', key: 'water_leak' },
        { label: '🛣️ Road Damage', key: 'road' },
      ],
      tips: [
        { label: '🏠 Home Energy', key: 'energy' },
        { label: '💧 Water Conservation', key: 'water_save' },
        { label: '♻️ Waste & Recycling', key: 'recycling' },
        { label: '🚌 Eco Transport', key: 'transport' },
      ],
      schemes: [
        { label: '☀️ Solar & Energy', key: 'solar' },
        { label: '💧 Water & Sanitation', key: 'water_scheme' },
        { label: '♻️ Waste Management', key: 'waste_scheme' },
        { label: '🏠 Housing', key: 'housing' },
      ],
    },
  },
  hi: {
    welcome: "नमस्ते! 🌱 मैं Sprout AI हूँ — आपका स्मार्ट सिटी गाइड। कुछ भी पूछें, या माइक दबाकर बोलें!",
    quickReplies: [
      { label: '🚨 शहर की समस्या रिपोर्ट करें', key: 'report' },
      { label: '🌱 पर्यावरण टिप्स', key: 'tips' },
      { label: '🏛️ सरकारी योजनाएं', key: 'schemes' },
      { label: '❓ कुछ भी पूछें', key: 'ask' },
    ],
    subReplies: {
      report: [
        { label: '🗑️ कचरा / अपशिष्ट', key: 'garbage' },
        { label: '💡 टूटी स्ट्रीटलाइट', key: 'streetlight' },
        { label: '💧 पानी का रिसाव', key: 'water_leak' },
        { label: '🛣️ सड़क क्षति', key: 'road' },
      ],
      tips: [
        { label: '🏠 घर में ऊर्जा बचत', key: 'energy' },
        { label: '💧 जल संरक्षण', key: 'water_save' },
        { label: '♻️ कचरा प्रबंधन', key: 'recycling' },
        { label: '🚌 इको ट्रांसपोर्ट', key: 'transport' },
      ],
      schemes: [
        { label: '☀️ सोलर और ऊर्जा', key: 'solar' },
        { label: '💧 जल और स्वच्छता', key: 'water_scheme' },
        { label: '♻️ अपशिष्ट प्रबंधन', key: 'waste_scheme' },
        { label: '🏠 आवास', key: 'housing' },
      ],
    },
  },
};

// ─── Response Bank ────────────────────────────────────────────────────────────
const RESPONSES = {
  en: {
    report: "Sure! Which type of city problem would you like to report? Please choose below:",
    garbage: `🗑️ **Garbage / Waste Issue**\n\nHere's how to report it:\n\n• **Swachh Bharat App** — Download from Play Store/App Store. Tap "Complaint", select "Garbage", add your location and a photo.\n• **Municipal Helpline** — Call your city's BBMP/BMC/municipal corporation helpline (typically 1800-xxx-xxxx).\n• **Local Ward Office** — Visit or call your area's ward office directly.\n\n📍 **Tip:** Always take a photo with GPS location enabled — it speeds up resolution.\n\n✅ **Next step:** Download the Swachh Bharat App now and file your complaint in under 2 minutes.`,
    streetlight: `💡 **Broken Streetlight**\n\nReport it through:\n\n• **NDMC/Municipal App** — Most cities have a dedicated civic app. Search "[Your City] Municipal App" on Play Store.\n• **1533 (Delhi)** — National helpline for streetlight complaints in Delhi.\n• **State Electricity Board** — Contact your state DISCOM (distribution company) for lights on their poles.\n• **Smart City Portal** — Visit smartcities.gov.in for city-specific contact information.\n\n✅ **Next step:** Call your city's municipal helpline or use the civic app to log a complaint with the pole location or landmark.`,
    water_leak: `💧 **Water Leakage / Pipeline Issue**\n\nReport through:\n\n• **Jal Board Helpline** — Call 1916 (national water helpline). Available 24/7.\n• **Local Jal Board Office** — Visit or call your city's water supply office.\n• **State Water Department App** — Many states have dedicated apps (e.g., Delhi Jal Board app).\n• **Swachh Bharat App** — Also accepts water-related civic complaints.\n\n⚠️ For burst pipes causing flooding, call 1916 immediately — it's an emergency response line.\n\n✅ **Next step:** Call 1916 right now and describe the location — give a landmark for faster response.`,
    road: `🛣️ **Road Damage / Pothole**\n\nReport through:\n\n• **My Gov Portal** — mygov.in has a citizen grievance section.\n• **CPGRAMS** — pgportal.gov.in is India's centralized public grievance portal.\n• **PWD Helpline** — Contact your state Public Works Department.\n• **State Road App** — Search your state's road authority app (e.g., Maharashtra has "Maha Roads").\n\n📸 Always photograph the damage clearly with a landmark visible.\n\n✅ **Next step:** Visit pgportal.gov.in, register, and file a grievance under "Public Works / Road" category.`,
    tips: "Great choice! 🌱 Which sustainability area would you like tips for?",
    energy: `🏠 **Home Energy Saving Tips**\n\nSmall changes, big impact:\n\n• Switch to **LED bulbs** — they use 75% less energy than incandescent.\n• Use **5-star rated appliances** — check BEE star rating before buying.\n• **Unplug chargers & electronics** when not in use (standby mode still draws power).\n• Set your **AC to 24–26°C** — each degree lower increases consumption by 6%.\n• Use **natural light** during day; install light-coloured curtains.\n• A **solar water heater** pays for itself in 3–4 years through bill savings.\n\n💡 **Bonus:** Apply for PM Surya Ghar Yojana for subsidised rooftop solar panels.\n\n✅ **Next step:** Replace your oldest bulb with an LED today — it's the easiest first step.`,
    water_save: `💧 **Water Conservation Tips**\n\nEvery drop counts:\n\n• Fix leaky taps — a dripping tap wastes **15 litres per day**.\n• Take **shorter showers** (5 minutes saves ~50 litres vs 15-minute showers).\n• Use a **bucket instead of a hosepipe** for car washing.\n• Collect **RO reject water** for mopping floors or watering plants.\n• Harvest **rainwater** with rooftop collection systems — subsidies available in many states.\n• Water plants in **early morning or evening** to reduce evaporation.\n\n✅ **Next step:** Check all taps in your home for drips today — fixing one dripping tap saves 5,000+ litres per year.`,
    recycling: `♻️ **Waste & Recycling Tips**\n\n• **Segregate at source** — Dry waste (paper, plastic, metal) in blue bin; Wet waste (food scraps) in green bin.\n• **Composting** — Convert kitchen waste into manure. Many states offer free compost bins.\n• **Avoid single-use plastic** — carry cloth bags, use steel bottles.\n• **E-waste** — Don't throw old phones or batteries in regular trash. Use authorized e-waste collection centres.\n• **Donate, don't dump** — Old clothes and furniture can go to NGOs like Goonj.\n\n📱 Apps to find nearby recycling points: **RecycleWala, Kabadiwalla Connect**\n\n✅ **Next step:** Start a wet/dry segregation system at home using two bins — it takes 10 minutes to set up.`,
    transport: `🚌 **Eco-Friendly Transport Tips**\n\n• Use **Metro or city buses** — one bus replaces ~40 private cars on the road.\n• **Carpool** with colleagues using apps like **QuickRide or BlaBlaCar**.\n• For short distances (under 3 km) — **walk or cycle**. Many cities have public bike-sharing (PBBS).\n• **Electric vehicles (EV):** FAME II scheme offers ₹10,000–₹1.5 lakh subsidies on EVs.\n• Work from home when possible — every day WFH saves ~2–4 kg CO₂ emissions.\n\n✅ **Next step:** Check if your city has a metro/bus pass scheme — monthly passes are significantly cheaper and eco-friendly.`,
    schemes: "Of course! 🏛️ Please select a scheme category:",
    solar: `☀️ **PM Surya Ghar Muft Bijli Yojana**\n\n**What it is:** Free electricity scheme providing subsidised rooftop solar panels to households.\n\n**Benefits:**\n• Up to 300 units of free electricity per month\n• Government subsidy of ₹30,000–₹78,000 depending on system size\n• 1 kW system costs only ~₹15,000 after subsidy\n• Reduces electricity bills to near zero\n\n**Eligibility:** Any Indian household (residential only). No income cap.\n\n**How to apply:**\n1. Visit pmsuryaghar.gov.in\n2. Register with your electricity consumer number\n3. Choose an empanelled vendor\n4. Installation within 30 days of approval\n\n✅ **Next step:** Visit pmsuryaghar.gov.in — registration takes 10 minutes and could save you ₹15,000+/year on electricity.`,
    water_scheme: `💧 **Jal Jeevan Mission (JJM)**\n\n**What it is:** India's flagship scheme to provide tap water (Har Ghar Jal) to every rural household by 2024.\n\n**Benefits:**\n• Free piped drinking water connection\n• 55 litres per person per day supply\n• Water quality testing by community water committees\n\n**Eligibility:** Rural households without a tap water connection.\n\n**How to check/apply:**\n• Visit jaljeevanmission.gov.in\n• Contact your Gram Panchayat\n• Or call the Jal Jeevan helpline: 1916\n\n**Urban areas:** Check AMRUT 2.0 scheme (amrut.gov.in) for urban water supply projects.\n\n✅ **Next step:** Call 1916 or visit your Gram Panchayat to check if your household is registered under JJM.`,
    waste_scheme: `♻️ **Swachh Bharat Mission (SBM)**\n\n**What it is:** India's national cleanliness mission to make cities and villages Open Defecation Free (ODF) and improve solid waste management.\n\n**Benefits:**\n• Free toilet construction subsidy for Below Poverty Line (BPL) households\n• Solid waste management infrastructure in cities\n• Cleanliness campaigns and awareness programs\n\n**How to apply for toilet subsidy:**\n1. Visit swachhbharatmission.gov.in\n2. Apply through your Gram Panchayat (rural) or Municipality (urban)\n3. BPL families get ₹12,000 subsidy\n\n**Complaint portal:** Also report sanitation issues at swachhbharat.mygov.in\n\n✅ **Next step:** Visit swachhbharatmission.gov.in to check your city's cleanliness rank and report civic issues.`,
    housing: `🏠 **PM Awas Yojana (PMAY)**\n\n**What it is:** Housing scheme to provide affordable homes to homeless and below-poverty-line citizens — "Housing for All".\n\n**Benefits:**\n• Home loan interest subsidy of 3%–6.5%\n• Credit Linked Subsidy Scheme (CLSS)\n• Subsidy up to ₹2.67 lakh for EWS/LIG categories\n• New homes with basic amenities\n\n**Eligibility:**\n• Annual income below ₹18 lakh (CLSS)\n• No existing pucca house in India\n\n**How to apply:**\n1. Visit pmaymis.gov.in\n2. Select beneficiary status\n3. Apply through Common Service Centre or bank\n\n✅ **Next step:** Visit pmaymis.gov.in, click "Citizen Assessment" and check your eligibility — it takes 5 minutes.`,
    ask: "Of course! 🌿 Feel free to ask me anything about:\n• Civic issues and how to report them\n• Sustainability tips for daily life\n• Government schemes and eligibility\n• SDG 11 and smart city initiatives\n\nJust type your question below!",
  },
  hi: {
    report: "ज़रूर! कौन सी शहरी समस्या रिपोर्ट करना चाहते हैं? नीचे चुनें:",
    garbage: `🗑️ **कचरे की शिकायत कैसे करें**\n\n• **Swachh Bharat App** — Play Store से डाउनलोड करें। "शिकायत" दबाएं, कचरे की फोटो लें और location जोड़ें।\n• **नगर निगम हेल्पलाइन** — अपने शहर की BBMP/BMC हेल्पलाइन पर कॉल करें।\n• **वार्ड ऑफिस** — अपने क्षेत्र के वार्ड ऑफिस जाएं या कॉल करें।\n\n✅ **अगला कदम:** Swachh Bharat App डाउनलोड करें और 2 मिनट में शिकायत दर्ज करें।`,
    streetlight: `💡 **टूटी स्ट्रीटलाइट की शिकायत**\n\n• **नगर निगम ऐप** — अपने शहर का municipal app Play Store से डाउनलोड करें।\n• **1533 (दिल्ली)** — स्ट्रीटलाइट शिकायत के लिए।\n• **Smart Cities Portal** — smartcities.gov.in पर जाएं।\n\n✅ **अगला कदम:** नगर निगम हेल्पलाइन पर कॉल करें और खंभे की location बताएं।`,
    water_leak: `💧 **पानी के रिसाव की शिकायत**\n\n• **1916 (Jal Board हेल्पलाइन)** — 24/7 उपलब्ध।\n• **स्थानीय जल बोर्ड ऑफिस** — कॉल या विज़िट करें।\n• **Swachh Bharat App** — पानी से जुड़ी शिकायतें भी स्वीकार होती हैं।\n\n✅ **अगला कदम:** अभी 1916 पर कॉल करें — पास का landmark बताएं तेज़ response के लिए।`,
    road: `🛣️ **सड़क क्षति / गड्ढे की शिकायत**\n\n• **CPGRAMS** — pgportal.gov.in पर शिकायत दर्ज करें।\n• **PWD हेल्पलाइन** — अपने राज्य के लोक निर्माण विभाग से संपर्क करें।\n• **My Gov Portal** — mygov.in पर नागरिक शिकायत सेक्शन।\n\n✅ **अगला कदम:** pgportal.gov.in पर जाएं और "Public Works / Road" कैटेगरी में शिकायत करें।`,
    tips: "बढ़िया चुनाव! 🌱 किस क्षेत्र में sustainability टिप्स चाहिए?",
    energy: `🏠 **घर में ऊर्जा बचत के उपाय**\n\n• **LED बल्ब** लगाएं — 75% कम बिजली इस्तेमाल करते हैं।\n• **5-star appliances** खरीदें — BEE star rating देखें।\n• AC **24-26°C** पर सेट करें — हर डिग्री कम करने से 6% ज़्यादा बिजली लगती है।\n• बिना उपयोग के **chargers unplug** करें।\n• PM Surya Ghar Yojana से **subsidised solar panels** लगवाएं।\n\n✅ **अगला कदम:** घर का सबसे पुराना बल्ब आज ही LED से बदलें।`,
    water_save: `💧 **जल संरक्षण के उपाय**\n\n• **टपकते नल ठीक करें** — एक नल रोज़ 15 लीटर बर्बाद करता है।\n• **RO का waste water** पौधों या पोंछे के लिए इस्तेमाल करें।\n• **कम समय में नहाएं** — 5 मिनट की बचत = 50 लीटर कम।\n• **Rainwater harvesting** करें — कई राज्यों में subsidy मिलती है।\n\n✅ **अगला कदम:** आज सभी नलों की जांच करें — एक टपकता नल साल में 5,000+ लीटर बर्बाद करता है।`,
    recycling: `♻️ **कचरा प्रबंधन के उपाय**\n\n• **कचरा अलग करें** — गीला (हरा डिब्बा) और सूखा (नीला डिब्बा)।\n• **Composting** करें — रसोई का कचरा खाद बन सकता है।\n• **Single-use plastic** न इस्तेमाल करें — कपड़े का थैला रखें।\n• **E-waste** authorized centres पर दें, कूड़ेदान में नहीं।\n\n✅ **अगला कदम:** आज से घर में दो डिब्बे रखें — गीले और सूखे कचरे के लिए।`,
    transport: `🚌 **पर्यावरण-अनुकूल यातायात**\n\n• **मेट्रो/बस** इस्तेमाल करें — एक बस 40 कारों की जगह लेती है।\n• **Carpool** करें — QuickRide या BlaBlaCar ऐप से।\n• 3 किमी से कम दूरी के लिए **पैदल या साइकिल** चलाएं।\n• **Electric Vehicle** खरीदें — FAME II scheme में ₹1.5 लाख तक subsidy।\n\n✅ **अगला कदम:** देखें क्या आपके शहर में monthly metro/bus pass का विकल्प है।`,
    schemes: "बिल्कुल! 🏛️ कौन सी योजना के बारे में जानना है?",
    solar: `☀️ **PM Surya Ghar मुफ्त बिजली योजना**\n\n**क्या है:** छत पर solar panels लगाने पर सरकारी subsidy।\n\n**फायदे:**\n• महीने में 300 यूनिट तक मुफ्त बिजली\n• ₹30,000 से ₹78,000 तक subsidy\n• बिजली बिल लगभग शून्य हो जाता है\n\n**पात्रता:** कोई भी भारतीय घर (आवासीय)।\n\n**आवेदन कैसे करें:**\n1. pmsuryaghar.gov.in पर जाएं\n2. बिजली consumer number से register करें\n3. Installation 30 दिन में\n\n✅ **अगला कदम:** pmsuryaghar.gov.in पर जाएं — 10 मिनट में रजिस्ट्रेशन होगा।`,
    water_scheme: `💧 **जल जीवन मिशन (Jal Jeevan Mission)**\n\n**क्या है:** हर घर नल का जल — 2024 तक हर ग्रामीण घर को पाइप से पानी।\n\n**फायदे:**\n• मुफ्त पाइप कनेक्शन\n• प्रति व्यक्ति 55 लीटर प्रतिदिन\n\n**पात्रता:** ग्रामीण घर जिनमें अभी नल नहीं है।\n\n**आवेदन:**\n• jaljeevanmission.gov.in पर जाएं\n• अपने Gram Panchayat से संपर्क करें\n• Helpline: 1916\n\n✅ **अगला कदम:** 1916 पर कॉल करें या Gram Panchayat जाएं।`,
    waste_scheme: `♻️ **स्वच्छ भारत मिशन (Swachh Bharat Mission)**\n\n**क्या है:** शहरों और गांवों को Open Defecation Free और स्वच्छ बनाने का अभियान।\n\n**फायदे:**\n• BPL परिवारों को ₹12,000 शौचालय निर्माण subsidy\n• कचरा प्रबंधन infrastructure\n\n**आवेदन:**\n1. swachhbharatmission.gov.in पर जाएं\n2. Gram Panchayat या नगरपालिका से संपर्क करें\n\n✅ **अगला कदम:** swachhbharatmission.gov.in पर जाएं और अपने शहर की cleanliness rank देखें।`,
    housing: `🏠 **प्रधानमंत्री आवास योजना (PMAY)**\n\n**क्या है:** सबके लिए घर — किफ़ायती आवास योजना।\n\n**फायदे:**\n• Home loan पर 3-6.5% ब्याज subsidy\n• EWS/LIG को ₹2.67 लाख तक की सहायता\n\n**पात्रता:**\n• वार्षिक आय ₹18 लाख से कम\n• पहले से कोई पक्का मकान न हो\n\n**आवेदन:**\n1. pmaymis.gov.in पर जाएं\n2. "Citizen Assessment" पर click करें\n\n✅ **अगला कदम:** pmaymis.gov.in पर जाएं और 5 मिनट में eligibility check करें।`,
    ask: "ज़रूर! 🌿 आप मुझसे इन विषयों पर कुछ भी पूछ सकते हैं:\n• शहरी समस्याएं और शिकायत कैसे करें\n• रोज़मर्रा की sustainability टिप्स\n• सरकारी योजनाएं और पात्रता\n• SDG 11 और स्मार्ट सिटी पहल\n\nनीचे अपना सवाल टाइप करें!",
  },
};

// ─── AI-Style Fallback Response Generator ─────────────────────────────────────
const AI_PATTERNS = [
  {
    pattern: /jal jeevan|जल जीवन/i,
    key: 'water_scheme',
  },
  {
    pattern: /swachh bharat|swachh|स्वच्छ भारत/i,
    key: 'waste_scheme',
  },
  {
    pattern: /surya ghar|solar|pm surya|सूर्य घर|सोलर/i,
    key: 'solar',
  },
  {
    pattern: /pmay|awas yojana|housing scheme|आवास योजना/i,
    key: 'housing',
  },
  {
    pattern: /garbage|waste|kachra|कचरा|trash/i,
    key: 'garbage',
  },
  {
    pattern: /streetlight|street light|light|bijli|बिजली की लाइट/i,
    key: 'streetlight',
  },
  {
    pattern: /water leak|pipe leak|पानी.*रिसाव|nal.*toot/i,
    key: 'water_leak',
  },
  {
    pattern: /road|pothole|sadak|सड़क|गड्ढे/i,
    key: 'road',
  },
  {
    pattern: /energy|electricity|bijli bachao|ऊर्जा|बिजली बचाओ/i,
    key: 'energy',
  },
  {
    pattern: /water.*sav|jal bachao|पानी.*बचाओ|water conservation/i,
    key: 'water_save',
  },
  {
    pattern: /recycl|recycle|reuse|kachra|रीसाइकल|कचरा.*प्रबंध/i,
    key: 'recycling',
  },
  {
    pattern: /transport|bus|metro|cycle|electric vehicle|ev|परिवहन/i,
    key: 'transport',
  },
];

function getAIResponse(input) {
  const lang = ChatState.language;

  // Check pattern matches
  for (const p of AI_PATTERNS) {
    if (p.pattern.test(input)) {
      return { text: RESPONSES[lang][p.key], showReplies: null };
    }
  }

  // Hindi detection — simple unicode check
  const hasHindi = /[\u0900-\u097F]/.test(input);
  if (hasHindi && lang === 'en') {
    // auto-switch
    ChatState.language = 'hi';
    document.getElementById('langToggle').textContent = 'हिं';
  }

  // Generic helpful fallback
  const fallbacks = {
    en: [
      `🌱 I understand you're asking about "${input.substring(0,40)}..."\n\nAs your smart city guide, I can help with:\n\n• **Reporting** civic issues (garbage, roads, lights, water)\n• **Sustainability tips** for home, water, energy, and transport\n• **Government schemes** like PM Surya Ghar, Jal Jeevan Mission, PMAY, Swachh Bharat\n\nCould you please be a bit more specific? For example:\n- "How do I report a broken streetlight?"\n- "Tell me about Jal Jeevan Mission"\n- "Tips to save electricity at home"\n\n✅ **Next step:** Try one of the quick reply buttons above, or type your specific question!`,
      `🌿 That's a great question! Let me help you with city sustainability.\n\nI specialize in:\n• Civic issue reporting and guidance\n• Eco-friendly living tips for Indian cities\n• Central and state government green schemes\n• SDG 11 — Sustainable Cities and Communities\n\nTry asking: "What is PM Surya Ghar Yojana?" or "How to save water at home?" for a detailed response.\n\n✅ **Next step:** Ask me your specific question and I'll give you a full, actionable answer!`,
    ],
    hi: [
      `🌱 आपका सवाल समझ आया। मैं इन विषयों में मदद कर सकता हूँ:\n\n• शहरी समस्याओं की **शिकायत** कैसे करें\n• **Sustainability टिप्स** — घर, पानी, ऊर्जा\n• **सरकारी योजनाएं** — PM Surya Ghar, Jal Jeevan Mission, PMAY\n\nज़रा और स्पष्ट बताएं? जैसे:\n- "कचरे की शिकायत कैसे करूं?"\n- "जल जीवन मिशन क्या है?"\n\n✅ **अगला कदम:** ऊपर के quick reply buttons आज़माएं या सीधे सवाल टाइप करें!`,
    ],
  };

  const list = fallbacks[lang] || fallbacks.en;
  return { text: list[Math.floor(Math.random() * list.length)], showReplies: null };
}

// ─── DOM Helpers ──────────────────────────────────────────────────────────────
function getEl(id) { return document.getElementById(id); }

function formatMessage(text) {
  // Markdown-lite: bold, newlines, links
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}

function timestamp() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// ─── Message Rendering ────────────────────────────────────────────────────────
function appendMessage(text, role, quickReplies = null) {
  const container = getEl('chatMessages');
  ChatState.messageCount++;
  const msgId = `msg-${ChatState.messageCount}`;

  const row = document.createElement('div');
  row.className = `msg-row ${role}`;

  const bubble = document.createElement('div');
  bubble.className = `msg-bubble ${role}`;
  bubble.innerHTML = formatMessage(text);

  const meta = document.createElement('div');
  meta.className = 'msg-meta';
  meta.textContent = timestamp();

  if (role === 'bot') {
    // Avatar
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar-small';
    avatar.innerHTML = `<svg width="14" height="14" viewBox="0 0 40 40" fill="none">
      <path d="M20 32 C20 26 20 20 20 14" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M20 24 C16 21 11 17 9 10 C15 11 19 16 20 21" fill="white"/>
      <path d="M20 20 C24 17 29 13 31 6 C25 7 21 12 20 17" fill="#A8D08D"/>
    </svg>`;

    // Speaker button for TTS
    const speakBtn = document.createElement('button');
    speakBtn.className = 'speak-btn';
    speakBtn.title = 'Listen';
    speakBtn.setAttribute('aria-label', 'Read message aloud');
    speakBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
    speakBtn.addEventListener('click', () => speakText(text));
    meta.appendChild(speakBtn);

    row.appendChild(avatar);
    const rightCol = document.createElement('div');
    rightCol.appendChild(bubble);
    rightCol.appendChild(meta);

    // Quick replies
    if (quickReplies && quickReplies.length) {
      const qrDiv = document.createElement('div');
      qrDiv.className = 'quick-replies';
      quickReplies.forEach(qr => {
        const btn = document.createElement('button');
        btn.className = 'qr-btn';
        btn.textContent = qr.label;
        btn.addEventListener('click', () => handleQuickReply(qr.key, qr.label));
        qrDiv.appendChild(btn);
      });
      rightCol.appendChild(qrDiv);
    }

    row.appendChild(rightCol);
  } else {
    row.appendChild(bubble);
    row.appendChild(meta);
  }

  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
  return row;
}

function showTyping() {
  const ti = getEl('typingIndicator');
  ti.classList.add('visible');
  const msgs = getEl('chatMessages');
  msgs.scrollTop = msgs.scrollHeight;
}

function hideTyping() {
  getEl('typingIndicator').classList.remove('visible');
}

// ─── Chat Open/Close ──────────────────────────────────────────────────────────
function toggleChat() {
  const win = getEl('chatWindow');
  const fab = getEl('chatFab');
  ChatState.isOpen = !ChatState.isOpen;

  if (ChatState.isOpen) {
    win.classList.add('open');
    win.setAttribute('aria-hidden', 'false');
    fab.style.transform = 'scale(0.85)';
    getEl('chatInput').focus();

    // Show welcome message on first open
    if (ChatState.messageCount === 0) {
      const lang = ChatState.language;
      setTimeout(() => {
        appendMessage(KB[lang].welcome, 'bot', KB[lang].quickReplies);
      }, 300);
    }
  } else {
    win.classList.remove('open');
    win.setAttribute('aria-hidden', 'true');
    fab.style.transform = '';
  }
}

function openChat() {
  if (!ChatState.isOpen) toggleChat();
}

// ─── Quick Reply Handler ──────────────────────────────────────────────────────
function handleQuickReply(key, label) {
  appendMessage(label, 'user');
  const lang = ChatState.language;

  // Check if it's a top-level category that shows sub-buttons
  if (KB[lang].subReplies[key]) {
    showTyping();
    setTimeout(() => {
      hideTyping();
      const responseText = RESPONSES[lang][key] || '...';
      appendMessage(responseText, 'bot', KB[lang].subReplies[key]);
    }, 700);
  } else {
    // It's a leaf key — get full response
    showTyping();
    const delay = 800 + Math.random() * 500;
    setTimeout(() => {
      hideTyping();
      const responseText = RESPONSES[lang][key];
      if (responseText) {
        appendMessage(responseText, 'bot');
      } else {
        botReply(label);
      }
    }, delay);
  }
}

// ─── Send Message ─────────────────────────────────────────────────────────────
function sendMessage(text) {
  const input = getEl('chatInput');
  const message = (text || input.value).trim();
  if (!message) return;

  input.value = '';
  appendMessage(message, 'user');

  // Auto-detect Hindi
  const hasHindi = /[\u0900-\u097F]/.test(message);
  if (hasHindi && ChatState.language === 'en') {
    ChatState.language = 'hi';
    getEl('langToggle').textContent = 'हिं';
  }

  showTyping();
  const delay = 900 + Math.random() * 700;
  setTimeout(() => {
    hideTyping();
    botReply(message);
  }, delay);
}

function botReply(message) {
  const result = getAIResponse(message);
  appendMessage(result.text, 'bot', result.showReplies);
}

function handleInputKey(e) {
  if (e.key === 'Enter') sendMessage();
}

// ─── Language Toggle ──────────────────────────────────────────────────────────
function toggleLanguage() {
  const btn = getEl('langToggle');
  ChatState.language = ChatState.language === 'en' ? 'hi' : 'en';
  btn.textContent = ChatState.language === 'en' ? 'EN' : 'हिं';

  // Update input placeholder
  const input = getEl('chatInput');
  input.placeholder = ChatState.language === 'hi' ? 'अपना सवाल टाइप करें...' : 'Type your question...';

  // Post a note in chat
  const note = ChatState.language === 'hi'
    ? '🌐 हिंदी में बदल दिया गया! अब हिंदी में पूछें।'
    : '🌐 Switched to English! Ask away.';
  appendMessage(note, 'bot');
}

// ─── Voice Input (Speech-to-Text) ─────────────────────────────────────────────
function toggleVoiceInput() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Voice input is not supported in this browser. Please use Chrome.');
    return;
  }

  const micBtn = getEl('micBtn');

  if (ChatState.isListening) {
    ChatState.recognition && ChatState.recognition.stop();
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  ChatState.recognition = recognition;

  recognition.lang = ChatState.language === 'hi' ? 'hi-IN' : 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onstart = () => {
    ChatState.isListening = true;
    micBtn.classList.add('active');
    getEl('chatInput').placeholder = ChatState.language === 'hi' ? '🎤 सुन रहा हूँ...' : '🎤 Listening...';
  };

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map(r => r[0].transcript)
      .join('');
    getEl('chatInput').value = transcript;

    if (event.results[event.results.length - 1].isFinal) {
      recognition.stop();
      sendMessage(transcript);
      getEl('chatInput').value = '';
    }
  };

  recognition.onerror = () => {
    ChatState.isListening = false;
    micBtn.classList.remove('active');
    getEl('chatInput').placeholder = ChatState.language === 'hi' ? 'अपना सवाल टाइप करें...' : 'Type your question...';
  };

  recognition.onend = () => {
    ChatState.isListening = false;
    micBtn.classList.remove('active');
    getEl('chatInput').placeholder = ChatState.language === 'hi' ? 'अपना सवाल टाइप करें...' : 'Type your question...';
  };

  recognition.start();
}

// ─── Text-to-Speech ───────────────────────────────────────────────────────────
function speakText(text) {
  if (!ChatState.synthesis) return;
  ChatState.synthesis.cancel();

  // Strip markdown formatting for speech
  const clean = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/#{1,3}\s/g, '')
    .replace(/•/g, '')
    .replace(/\n/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .substring(0, 500); // limit length

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = ChatState.language === 'hi' ? 'hi-IN' : 'en-IN';
  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  ChatState.synthesis.speak(utterance);
}

// ─── External helper for card buttons ────────────────────────────────────────
function sendQuickReply(label) {
  const keyMap = {
    'Report a City Problem': 'report',
    'Sustainability Tips': 'tips',
    'Government Schemes': 'schemes',
  };
  const key = keyMap[label];
  if (key) {
    setTimeout(() => handleQuickReply(key, label), 400);
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // FAB toggle
  getEl('chatFab').addEventListener('click', toggleChat);
  // Close button
  getEl('chatClose').addEventListener('click', toggleChat);
  // Send button
  getEl('sendBtn').addEventListener('click', () => sendMessage());
  // Mic button
  getEl('micBtn').addEventListener('click', toggleVoiceInput);
  // Language toggle
  getEl('langToggle').addEventListener('click', toggleLanguage);
  // Input enter key
  getEl('chatInput').addEventListener('keydown', handleInputKey);
});

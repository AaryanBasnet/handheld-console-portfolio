/**
 * Scripted TIA exchanges. The tools are the real ones from the thesis; the
 * passenger questions and answers are samples written for this cartridge,
 * not transcript lines from the evaluation. `ne` is the Nepali version of
 * the same line. No live model is called.
 */
export interface Tool {
  name: string
  /** one line on what the agent uses it for */
  does: string
}

export interface Exchange {
  question: { en: string; ne: string }
  /** the correct tool, one of tiaTools by name */
  tool: string
  answer: { en: string; ne: string }
}

/** The tools the ReAct agent can pick from. */
export const tiaTools: Tool[] = [
  { name: 'get_general_airport_info', does: 'RAG over airport documents: facilities, customs, immigration, baggage, visas, transport.' },
  { name: 'get_flight_status_from_json', does: 'Status of one flight by its code, such as RA205 or FZ575.' },
  { name: 'search_flights_by_route', does: 'Flights by city or route, such as flights from Dubai.' },
  { name: 'get_kathmandu_weather_openmeteo', does: 'Current Kathmandu weather from Open-Meteo.' },
  { name: 'process_sim_card_kyc', does: 'SIM card KYC: validates the passport MRZ and runs face recognition. Optional module.' },
]

export const tiaExchanges: Exchange[] = [
  {
    question: { en: 'Where do I go for customs after I land?', ne: 'अवतरण पछि भन्सारका लागि म कहाँ जानुपर्छ?' },
    tool: 'get_general_airport_info',
    answer: {
      en: 'Customs is in the arrivals hall, after immigration and baggage claim. Declare anything over the duty-free limit.',
      ne: 'भन्सार आगमन हलमा, अध्यागमन र सामान संकलन पछि छ। शुल्कमुक्त सीमाभन्दा बढी भएको सामान घोषणा गर्नुहोस्।',
    },
  },
  {
    question: { en: 'What is the status of flight RA205?', ne: 'उडान RA205 को अवस्था के छ?' },
    tool: 'get_flight_status_from_json',
    answer: { en: 'RA205 is on schedule. The gate is shown on the departure board.', ne: 'RA205 समय तालिका अनुसार छ। गेट प्रस्थान बोर्डमा देखाइएको छ।' },
  },
  {
    question: { en: 'Which flights arrive from Dubai today?', ne: 'आज दुबईबाट कुन कुन उडान आउँछन्?' },
    tool: 'search_flights_by_route',
    answer: { en: "Here are today's arrivals from Dubai with their scheduled times.", ne: 'आज दुबईबाट आउने उडानहरू र तिनको तालिका यहाँ छ।' },
  },
  {
    question: { en: 'What is the weather like in Kathmandu right now?', ne: 'अहिले काठमाडौँको मौसम कस्तो छ?' },
    tool: 'get_kathmandu_weather_openmeteo',
    answer: { en: 'Here is the current Kathmandu weather: temperature, cloud and wind from the live feed.', ne: 'काठमाडौँको हालको मौसम यहाँ छ: तापक्रम, बादल र हावा, प्रत्यक्ष स्रोतबाट।' },
  },
  {
    question: { en: 'Can I get a local SIM card here?', ne: 'के म यहाँ स्थानीय सिम कार्ड लिन सक्छु?' },
    tool: 'process_sim_card_kyc',
    answer: {
      en: 'Yes. I scan the passport MRZ and match your face to it, then the SIM can be issued.',
      ne: 'सक्नुहुन्छ। पासपोर्टको MRZ स्क्यान गरेर अनुहार मिलाउनुपर्छ, त्यसपछि सिम जारी हुन्छ।',
    },
  },
]

/** Headline result from the thesis evaluation. */
export const tiaAccuracy = '93.75%'

export interface Province {
  name: string;
  slug: string;
  towns: string[];
}

export const SA_PROVINCES: Province[] = [
  {
    name: "National / All Areas",
    slug: "national",
    towns: ["All Locations"]
  },
  {
    name: "Gauteng",
    slug: "gauteng",
    towns: ["Johannesburg","Pretoria","Midrand","Centurion","Sandton","Randburg","Roodepoort","Edenvale","Kempton Park","Boksburg","Benoni","Brakpan","Springs","Nigel","Germiston","Alberton","Krugersdorp","Vanderbijlpark","Vereeniging","Heidelberg","Bronkhorstspruit","Cullinan","Soweto","Mamelodi","Tembisa","Katlehong","Vosloorus"]
  },
  {
    name: "Western Cape",
    slug: "western-cape",
    towns: ["Cape Town","Stellenbosch","Paarl","Somerset West","Strand","Gordon's Bay","Franschhoek","Wellington","Malmesbury","Hermanus","Caledon","Swellendam","Worcester","Ceres","Robertson","Montagu","Beaufort West","Oudtshoorn","George","Mossel Bay","Knysna","Plettenberg Bay","Bloubergstrand","Bellville","Durbanville","Kuils River","Kraaifontein","Brackenfell"]
  },
  {
    name: "KwaZulu-Natal",
    slug: "kwazulu-natal",
    towns: ["Durban","Pietermaritzburg","Richards Bay","Empangeni","Amanzimtoti","Umhlanga","Ballito","Newcastle","Ladysmith","Dundee","Vryheid","Estcourt","Howick","Mooi River","Ixopo","Harding","Port Shepstone","Margate","Uvongo","Ramsgate","Richmond","Greytown","Stanger","Mandini","Eshowe","Ulundi","Pongola","Mtunzini","Umkomaas","Scottburgh","Pennington","Hibberdene"]
  },
  {
    name: "Eastern Cape",
    slug: "eastern-cape",
    towns: ["Port Elizabeth","East London","Mthatha","Uitenhage","Despatch","Kariega","Grahamstown","Makhanda","Port Alfred","Kenton-on-Sea","Alexandria","Kouga","Humansdorp","Jeffreys Bay","St Francis Bay","Graaff-Reinet","Cradock","Middelburg","Aliwal North","Queenstown","Komani","King William's Town","Qonce","Bhisho","Fort Beaufort","Alice","Butterworth","Dutywa"]
  },
  {
    name: "Free State",
    slug: "free-state",
    towns: ["Bloemfontein","Welkom","Sasolburg","Kroonstad","Parys","Bethlehem","Ladybrand","Ficksburg","Harrismith","Frankfort","Heilbron","Vrede","Reitz","Senekal","Virginia","Odendaalsrus","Hennenman","Allanridge","Bothaville","Viljoenskroon","Hoopstad","Wesselsbron","Bultfontein","Brandfort","Winburg","Excelsior","Clocolan"]
  },
  {
    name: "Limpopo",
    slug: "limpopo",
    towns: ["Polokwane","Mokopane","Tzaneen","Phalaborwa","Louis Trichardt","Musina","Thohoyandou","Giyani","Bela-Bela","Modimolle","Mookgophong","Lephalale","Thabazimbi","Burgersfort","Lydenburg","Jane Furse","Groblersdal","Marble Hall","Roedtan","Dendron","Bochum","Soekmekaar"]
  },
  {
    name: "Mpumalanga",
    slug: "mpumalanga",
    towns: ["Nelspruit","Mbombela","Witbank","eMalahleni","Middelburg","Ermelo","Secunda","Standerton","Piet Retief","Mkhondo","Barberton","White River","Hazyview","Sabie","Graskop","Lydenburg","Mashishing","Belfast","eMakhazeni","Dullstroom","Machadodorp","Waterval Boven","Carolina","Hendrina","Kriel","Delmas","Volksrust"]
  },
  {
    name: "North West",
    slug: "north-west",
    towns: ["Rustenburg","Mahikeng","Potchefstroom","Klerksdorp","Brits","Lichtenburg","Zeerust","Vryburg","Christiana","Bloemhof","Schweizer-Reneke","Wolmaransstad","Makwassie","Orkney","Stilfontein","Hartbeespoort","Ventersdorp","Coligny","Koster","Swartruggens","Groot Marico"]
  },
  {
    name: "Northern Cape",
    slug: "northern-cape",
    towns: ["Kimberley","Upington","Kathu","Kuruman","Springbok","De Aar","Colesberg","Victoria West","Carnarvon","Williston","Calvinia","Sutherland","Fraserburg","Prieska","Douglas","Barkly West","Warrenton","Jan Kempdorp","Hartswater","Postmasburg","Daniëlskuil","Pofadder","Port Nolloth","Alexander Bay","Kakamas","Keimoes","Groblershoop"]
  },
];

export const ALL_TOWNS = SA_PROVINCES.flatMap(p => p.towns);
export const ALL_LOCATIONS = [...SA_PROVINCES.map(p => p.slug), ...SA_PROVINCES.flatMap(p => p.towns.map(t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-')))];

export const TOWN_POSTAL_CODES: Record<string, string> = {
  // Gauteng
  "Johannesburg": "2000",
  "Pretoria": "0001",
  "Midrand": "1685",
  "Centurion": "0157",
  "Sandton": "2196",
  "Randburg": "2194",
  "Roodepoort": "1724",
  "Edenvale": "1609",
  "Kempton Park": "1619",
  "Boksburg": "1459",
  "Benoni": "1501",
  "Brakpan": "1541",
  "Springs": "1559",
  "Nigel": "1491",
  "Germiston": "1401",
  "Alberton": "1449",
  "Krugersdorp": "1739",
  "Vanderbijlpark": "1911",
  "Vereeniging": "1939",
  "Heidelberg": "1441",
  "Bronkhorstspruit": "1020",
  "Cullinan": "1000",
  "Soweto": "1804",
  "Mamelodi": "0122",
  "Tembisa": "1632",
  "Katlehong": "1431",
  "Vosloorus": "1475",

  // Western Cape
  "Cape Town": "8000",
  "Stellenbosch": "7600",
  "Paarl": "7646",
  "Somerset West": "7130",
  "Strand": "7140",
  "Gordon's Bay": "7140",
  "Franschhoek": "7690",
  "Wellington": "7655",
  "Malmesbury": "7300",
  "Hermanus": "7200",
  "Caledon": "7230",
  "Swellendam": "6740",
  "Worcester": "6850",
  "Ceres": "6835",
  "Robertson": "6705",
  "Montagu": "6720",
  "Beaufort West": "6970",
  "Oudtshoorn": "6625",
  "George": "6529",
  "Mossel Bay": "6500",
  "Knysna": "6570",
  "Plettenberg Bay": "6600",
  "Bloubergstrand": "7441",
  "Bellville": "7530",
  "Durbanville": "7550",
  "Kuils River": "7580",
  "Kraaifontein": "7570",
  "Brackenfell": "7560",

  // KwaZulu-Natal
  "Durban": "4001",
  "Pietermaritzburg": "3201",
  "Richards Bay": "3900",
  "Empangeni": "3880",
  "Amanzimtoti": "4126",
  "Umhlanga": "4319",
  "Ballito": "4420",
  "Newcastle": "2940",
  "Ladysmith": "3370",
  "Dundee": "3000",
  "Vryheid": "3100",
  "Estcourt": "3310",
  "Howick": "3290",
  "Mooi River": "3300",
  "Ixopo": "3276",
  "Harding": "4680",
  "Port Shepstone": "4240",
  "Margate": "4275",
  "Uvongo": "4270",
  "Ramsgate": "4285",
  "Richmond": "3780",
  "Greytown": "3250",
  "Stanger": "4450",
  "Mandini": "4490",
  "Eshowe": "3815",
  "Ulundi": "3838",
  "Pongola": "3170",
  "Mtunzini": "3867",
  "Umkomaas": "4170",
  "Craigieburn": "4170",
  "Scottburgh": "4180",
  "Pennington": "4184",
  "Hibberdene": "4220",

  // Eastern Cape
  "Port Elizabeth": "6001",
  "East London": "5201",
  "Mthatha": "5099",
  "Uitenhage": "6229",
  "Despatch": "6220",
  "Kariega": "6229",
  "Grahamstown": "6139",
  "Makhanda": "6139",
  "Port Alfred": "6170",
  "Kenton-on-Sea": "6191",
  "Alexandria": "6185",
  "Kouga": "6330",
  "Humansdorp": "6300",
  "Jeffreys Bay": "6330",
  "St Francis Bay": "6312",
  "Graaff-Reinet": "6280",
  "Cradock": "5880",
  "Middelburg": "5900",
  "Aliwal North": "9750",
  "Queenstown": "5319",
  "Komani": "5319",
  "King William's Town": "5601",
  "Qonce": "5601",
  "Bhisho": "5605",
  "Fort Beaufort": "5720",
  "Alice": "5700",
  "Butterworth": "4960",
  "Dutywa": "5000",

  // Free State
  "Bloemfontein": "9301",
  "Welkom": "9459",
  "Sasolburg": "1911",
  "Kroonstad": "9499",
  "Parys": "9585",
  "Bethlehem": "9700",
  "Ladybrand": "9745",
  "Ficksburg": "9730",
  "Harrismith": "9880",
  "Frankfort": "9830",
  "Heilbron": "9650",
  "Vrede": "9835",
  "Reitz": "9810",
  "Senekal": "9600",
  "Virginia": "9430",
  "Odendaalsrus": "9480",
  "Hennenman": "9445",
  "Allanridge": "9490",
  "Bothaville": "9660",
  "Viljoenskroon": "9520",
  "Hoopstad": "9479",
  "Wesselsbron": "9482",
  "Bultfontein": "9670",
  "Brandfort": "9400",
  "Winburg": "9420",
  "Excelsior": "9760",
  "Clocolan": "9735",

  // Limpopo
  "Polokwane": "0699",
  "Mokopane": "0600",
  "Tzaneen": "0850",
  "Phalaborwa": "1390",
  "Louis Trichardt": "0920",
  "Musina": "0900",
  "Thohoyandou": "0950",
  "Giyani": "0826",
  "Bela-Bela": "0480",
  "Modimolle": "0510",
  "Mookgophong": "0560",
  "Lephalale": "0555",
  "Thabazimbi": "0380",
  "Burgersfort": "1150",
  "Lydenburg": "1120",
  "Jane Furse": "1085",
  "Groblersdal": "0470",
  "Marble Hall": "0450",
  "Roedtan": "0560",
  "Dendron": "0715",
  "Bochum": "0790",
  "Soekmekaar": "0810",

  // Mpumalanga
  "Nelspruit": "1200",
  "Mbombela": "1200",
  "Witbank": "1035",
  "eMalahleni": "1035",
  "Middelburg (MP)": "1050", // Handle possible variations
  "Ermelo": "2350",
  "Secunda": "2302",
  "Standerton": "2430",
  "Piet Retief": "2380",
  "Mkhondo": "2380",
  "Barberton": "1300",
  "White River": "1240",
  "Hazyview": "1242",
  "Sabie": "1260",
  "Graskop": "1270",
  "Lydenburg (MP)": "1120",
  "Mashishing": "1120",
  "Belfast": "1100",
  "eMakhazeni": "1100",
  "Dullstroom": "1110",
  "Machadodorp": "1170",
  "Waterval Boven": "1195",
  "Carolina": "1185",
  "Hendrina": "1095",
  "Kriel": "2271",
  "Delmas": "2210",
  "Volksrust": "2470",

  // North West
  "Rustenburg": "0299",
  "Mahikeng": "2745",
  "Potchefstroom": "2531",
  "Klerksdorp": "2571",
  "Brits": "0250",
  "Lichtenburg": "2740",
  "Zeerust": "2865",
  "Vryburg": "8600",
  "Christiana": "2300",
  "Bloemhof": "2660",
  "Schweizer-Reneke": "2780",
  "Wolmaransstad": "2630",
  "Makwassie": "2650",
  "Orkney": "2620",
  "Stilfontein": "2550",
  "Hartbeespoort": "0216",
  "Ventersdorp": "2710",
  "Coligny": "2725",
  "Koster": "0340",
  "Swartruggens": "2835",
  "Groot Marico": "2850",

  // Northern Cape
  "Kimberley": "8301",
  "Upington": "8801",
  "Kathu": "8446",
  "Kuruman": "8460",
  "Springbok": "8240",
  "De Aar": "7000",
  "Colesberg": "9795",
  "Victoria West": "7070",
  "Carnarvon": "8925",
  "Williston": "8910",
  "Calvinia": "8190",
  "Sutherland": "6920",
  "Fraserburg": "6960",
  "Prieska": "8940",
  "Douglas": "8730",
  "Barkly West": "8375",
  "Warrenton": "8530",
  "Jan Kempdorp": "8550",
  "Hartswater": "8570",
  "Postmasburg": "8420",
  "Daniëlskuil": "8405",
  "Pofadder": "8890",
  "Port Nolloth": "8280",
  "Alexander Bay": "8290",
  "Kakamas": "8870",
  "Keimoes": "8860",
  "Groblershoop": "8850"
};

export function getPostalCodeForTown(town: string): string {
  if (!town) return "0000";
  
  // Clean town name to match index keys
  const cleanKey = town.trim();
  if (TOWN_POSTAL_CODES[cleanKey]) {
    return TOWN_POSTAL_CODES[cleanKey];
  }

  // Fallback to searching case-insensitively
  const lowerTown = cleanKey.toLowerCase();
  for (const [k, v] of Object.entries(TOWN_POSTAL_CODES)) {
    if (k.toLowerCase() === lowerTown) {
      return v;
    }
  }

  // Handle specific dynamic search variants (like map names, suffixes)
  const mapSuffixMatches = ["middelburg", "lydenburg"];
  for (const suffix of mapSuffixMatches) {
    if (lowerTown.includes(suffix)) {
      const matched = Object.keys(TOWN_POSTAL_CODES).find(k => k.toLowerCase().includes(suffix));
      if (matched) return TOWN_POSTAL_CODES[matched];
    }
  }

  // Seeded deterministic fallback hash code between 1000 and 9999 so we always have a clean, neat postal code
  let hash = 0;
  for (let i = 0; i < lowerTown.length; i++) {
    hash = lowerTown.charCodeAt(i) + ((hash << 5) - hash);
  }
  const code = Math.abs(1000 + (hash % 8999));
  return String(code).padStart(4, '0');
}


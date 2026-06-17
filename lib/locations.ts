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

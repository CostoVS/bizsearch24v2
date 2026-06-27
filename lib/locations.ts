export interface Province {
  name: string;
  slug: string;
  towns: string[];
}

export const SA_PROVINCES: Province[] = [
  {
    name: 'Gauteng',
    slug: 'gauteng',
    towns: ['Johannesburg', 'Pretoria', 'Midrand', 'Sandton', 'Centurion', 'Soweto', 'Kempton Park', 'Roodepoort']
  },
  {
    name: 'Western Cape',
    slug: 'western-cape',
    towns: ['Cape Town', 'Stellenbosch', 'George', 'Paarl', 'Knysna', 'Mossel Bay', 'Hermanus', 'Somerset West']
  },
  {
    name: 'KwaZulu-Natal',
    slug: 'kwazulu-natal',
    towns: ['Durban', 'Pietermaritzburg', 'Umhlanga', 'Ballito', 'Richards Bay', 'Margate', 'Newcastle', 'Port Shepstone']
  },
  {
    name: 'Eastern Cape',
    slug: 'eastern-cape',
    towns: ['Gqeberha', 'East London', 'Mthatha', 'Makhanda', 'Port Alfred', 'Jeffreys Bay', 'Kariega']
  },
  {
    name: 'Free State',
    slug: 'free-state',
    towns: ['Bloemfontein', 'Welkom', 'Sasolburg', 'Bethlehem', 'Kroonstad', 'Parys', 'Ficksburg']
  },
  {
    name: 'Limpopo',
    slug: 'limpopo',
    towns: ['Polokwane', 'Tzaneen', 'Phalaborwa', 'Mokopane', 'Bela-Bela', 'Thohoyandou', 'Lephalale']
  },
  {
    name: 'Mpumalanga',
    slug: 'mpumalanga',
    towns: ['Mbombela', 'Witbank', 'Secunda', 'Middelburg', 'Ermelo', 'Barberton', 'Hazyview']
  },
  {
    name: 'North West',
    slug: 'north-west',
    towns: ['Mahikeng', 'Potchefstroom', 'Rustenburg', 'Klerksdorp', 'Brits', 'Sun City', 'Vryburg']
  },
  {
    name: 'Northern Cape',
    slug: 'northern-cape',
    towns: ['Kimberley', 'Upington', 'Springbok', 'Kuruman', 'De Aar', 'Colesberg', 'Calvinia']
  }
];

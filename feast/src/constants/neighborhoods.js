// Neighborhoods grouped by region for the Swiggy-style picker
export const NEIGHBORHOOD_GROUPS = [
  {
    group: 'Tirunelveli City',
    icon: 'location_city',
    places: [
      { name: 'Palayamkottai',                     fee: 50 },
      { name: 'Tirunelveli Junction',              fee: 50 },
      { name: 'Tirunelveli Town (Nellai Nagaram)', fee: 50 },
      { name: 'Melapalayam',                       fee: 20 },
      { name: 'Vannarpettai',                      fee: 50 },
      { name: 'Thachanallur',                      fee: 50 },
      { name: 'Pettai',                            fee: 50 },
      { name: 'Maharaja Nagar',                    fee: 50 },
      { name: 'Perumalpuram',                      fee: 50 },
      { name: 'KTC Nagar',                         fee: 50 },
      { name: 'NGO Colony',                        fee: 50 },
      { name: 'Rahmath Nagar',                     fee: 50 },
      { name: 'Thyagaraja Nagar',                  fee: 50 },
      { name: 'Sankar Nagar',                      fee: 50 },
      { name: 'V.M. Chatram',                      fee: 50 },
      { name: 'Krishnapuram',                      fee: 50 },
      { name: 'Samadanapuram',                     fee: 50 },
      { name: 'Santhi Nagar',                      fee: 50 },
      { name: 'Tuckerammalpuram',                  fee: 50 },
      { name: 'Kodeeswaran Nagar',                 fee: 50 },
      { name: 'Reddiarpatti',                      fee: 50 },
      { name: 'Sankarnagar',                       fee: 50 },
    ],
  },
  {
    group: 'Near Tirunelveli',
    icon: 'near_me',
    places: [
      { name: 'Suthamalli',       fee: 50 },
      { name: 'Gangaikondan',     fee: 50 },
      { name: 'Abishekapatti',    fee: 50 },
      { name: 'Naranammalpuram',  fee: 50 },
      { name: 'Thalaiyuthu',      fee: 50 },
      { name: 'Rajavallipuram',   fee: 50 },
      { name: 'Ukkirankottai',    fee: 50 },
      { name: 'Madhavakurichi',   fee: 50 },
      { name: 'Mavadi',           fee: 50 },
      { name: 'Thetharkulam',     fee: 50 },
      { name: 'Aaraikkulam',      fee: 50 },
      { name: 'Munneerpallam',    fee: 50 },
      { name: 'Vannikonendal',    fee: 50 },
    ],
  },
  {
    group: 'Ambasamudram Region',
    icon: 'forest',
    places: [
      { name: 'Ambasamudram',       fee: 50 },
      { name: 'Vikramasingapuram',  fee: 50 },
      { name: 'Kalakkad',           fee: 50 },
      { name: 'Cheranmahadevi',     fee: 50 },
      { name: 'Eruvadi',            fee: 50 },
      { name: 'Gopalasamudram',     fee: 50 },
      { name: 'Kallidaikurichi',    fee: 50 },
      { name: 'Manimutharu',        fee: 50 },
      { name: 'Melacheval',         fee: 50 },
      { name: 'Moolaikaraipatti',   fee: 50 },
      { name: 'Mukkudal',           fee: 50 },
      { name: 'Sivasailam',         fee: 50 },
      { name: 'Ravanasamudram',     fee: 50 },
      { name: 'Brahmadesam',        fee: 50 },
      { name: 'Mannarkovil',        fee: 50 },
      { name: 'Adaichani',          fee: 50 },
      { name: 'Idaikkal',           fee: 50 },
      { name: 'Alagiapandiapuram',  fee: 50 },
    ],
  },
  {
    group: 'Southern Region',
    icon: 'south',
    places: [
      { name: 'Nanguneri',            fee: 50 },
      { name: 'Thisayanvilai Vadakku',fee: 50 },
      { name: 'Valliyur',             fee: 50 },
      { name: 'Veeravanallur',        fee: 50 },
      { name: 'Thirukkurungudi',      fee: 50 },
      { name: 'Panagudi',             fee: 50 },
      { name: 'Pathamadai',           fee: 50 },
    ],
  },
  {
    group: 'Coastal Region',
    icon: 'water',
    places: [
      { name: 'Avaraikulam',       fee: 50 },
      { name: 'Kudankulam',        fee: 50 },
      { name: 'Kuttam',            fee: 50 },
      { name: 'Uvari',             fee: 50 },
      { name: 'Samugarengapuram',  fee: 50 },
    ],
  },
]

// Flat list (keeping backward compatibility)
export const NEIGHBORHOODS = NEIGHBORHOOD_GROUPS
  .flatMap(g => g.places)
  .filter((v, i, arr) => arr.findIndex(x => x.name === v.name) === i) // deduplicate
  .sort((a, b) => a.name.localeCompare(b.name))

export const getDeliveryFee = (name) => {
  const neighborhood = NEIGHBORHOODS.find(n => n.name === name)
  return neighborhood ? neighborhood.fee : 50
}

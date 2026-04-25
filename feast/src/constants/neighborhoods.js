// Neighborhoods grouped by region for the Swiggy-style picker
export const NEIGHBORHOOD_GROUPS = [
  {
    group: 'Tirunelveli City',
    icon: 'location_city',
    places: [
      { name: 'Palayamkottai',                    fee: 50 },
      { name: 'Tirunelveli Junction',             fee: 50 },
      { name: 'Tirunelveli Town (Nellai Nagaram)',fee: 50 },
      { name: 'Melapalayam',                      fee: 20 },
      { name: 'Vannarpettai',                     fee: 50 },
      { name: 'Thachanallur',                     fee: 50 },
      { name: 'Pettai',                           fee: 50 },
      { name: 'Maharaja Nagar',                   fee: 50 },
      { name: 'Perumalpuram',                     fee: 50 },
      { name: 'KTC Nagar',                        fee: 50 },
      { name: 'NGO Colony',                       fee: 50 },
      { name: 'Rahmath Nagar',                    fee: 50 },
      { name: 'Thyagaraja Nagar',                 fee: 50 },
      { name: 'Sankar Nagar',                     fee: 50 },
      { name: 'V.M. Chatram',                     fee: 50 },
      { name: 'Krishnapuram',                     fee: 50 },
      { name: 'Samadanapuram',                    fee: 50 },
      { name: 'Santhi Nagar',                     fee: 50 },
      { name: 'Tuckerammalpuram',                 fee: 50 },
      { name: 'Kodeeswaran Nagar',                fee: 50 },
      { name: 'Reddiarpatti',                     fee: 50 },
      { name: 'Sankarnagar',                      fee: 50 },
    ],
  },
  {
    group: 'Near Tirunelveli',
    icon: 'near_me',
    places: [
      { name: 'Suthamalli',       fee: 60 },
      { name: 'Gangaikondan',     fee: 60 },
      { name: 'Abishekapatti',    fee: 60 },
      { name: 'Naranammalpuram',  fee: 60 },
      { name: 'Thalaiyuthu',      fee: 60 },
      { name: 'Rajavallipuram',   fee: 60 },
      { name: 'Ukkirankottai',    fee: 60 },
      { name: 'Madhavakurichi',   fee: 60 },
      { name: 'Mavadi',           fee: 60 },
      { name: 'Thetharkulam',     fee: 60 },
      { name: 'Aaraikkulam',      fee: 60 },
      { name: 'Munneerpallam',    fee: 60 },
      { name: 'Vannikonendal',    fee: 60 },
    ],
  },
  {
    group: 'Ambasamudram Region',
    icon: 'forest',
    places: [
      { name: 'Ambasamudram',       fee: 100 },
      { name: 'Vikramasingapuram',  fee: 100 },
      { name: 'Kalakkad',           fee: 100 },
      { name: 'Cheranmahadevi',     fee: 80  },
      { name: 'Eruvadi',            fee: 80  },
      { name: 'Gopalasamudram',     fee: 100 },
      { name: 'Kallidaikurichi',    fee: 100 },
      { name: 'Manimutharu',        fee: 100 },
      { name: 'Melacheval',         fee: 100 },
      { name: 'Moolaikaraipatti',   fee: 100 },
      { name: 'Mukkudal',          fee: 100 },
      { name: 'Sivasailam',         fee: 100 },
      { name: 'Ravanasamudram',     fee: 100 },
      { name: 'Brahmadesam',        fee: 100 },
      { name: 'Mannarkovil',        fee: 100 },
      { name: 'Adaichani',          fee: 100 },
      { name: 'Idaikkal',           fee: 100 },
      { name: 'Alagiapandiapuram',  fee: 100 },
    ],
  },
  {
    group: 'Southern Region',
    icon: 'south',
    places: [
      { name: 'Nanguneri',           fee: 100 },
      { name: 'Thisayanvilai Vadakku',fee: 100 },
      { name: 'Valliyur',            fee: 100 },
      { name: 'Veeravanallur',       fee: 100 },
      { name: 'Thirukkurungudi',     fee: 100 },
      { name: 'Panagudi',            fee: 100 },
      { name: 'Pathamadai',          fee: 100 },
    ],
  },
  {
    group: 'Coastal Region',
    icon: 'water',
    places: [
      { name: 'Avaraikulam',        fee: 120 },
      { name: 'Kudankulam',         fee: 120 },
      { name: 'Kuttam',             fee: 120 },
      { name: 'Uvari',              fee: 120 },
      { name: 'Samugarengapuram',   fee: 120 },
    ],
  },
  {
    group: 'Nellai Outskirts',
    icon: 'explore',
    places: [
      { name: 'Suthamalli',         fee: 60  },
      { name: 'Rajavallipuram',     fee: 60  },
      { name: 'Ukkirankottai',      fee: 60  },
      { name: 'Abishekapatti',      fee: 60  },
      { name: 'Naranammalpuram',    fee: 60  },
      { name: 'Thalaiyuthu',        fee: 60  },
    ],
  },
]

// Flat list (keeping backward compatibility)
export const NEIGHBORHOODS = NEIGHBORHOOD_GROUPS.flatMap(g =>
  g.places.map(p => ({ ...p }))
).filter((v, i, arr) => arr.findIndex(x => x.name === v.name) === i) // deduplicate
  .sort((a, b) => a.name.localeCompare(b.name))

export const getDeliveryFee = (name) => {
  const neighborhood = NEIGHBORHOODS.find(n => n.name === name)
  return neighborhood ? neighborhood.fee : 60
}

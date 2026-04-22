export const NEIGHBORHOODS = [
  { name: 'Palayamkottai', fee: 50 },
  { name: 'Tirunelveli Junction', fee: 50 },
  { name: 'Tirunelveli Town (Nellai Nagaram)', fee: 50 },
  { name: 'Melapalayam', fee: 20 },
  { name: 'Vannarpettai', fee: 20 },
  { name: 'Thachanallur', fee: 50 },
  { name: 'Pettai', fee: 50 },
  { name: 'Maharaja Nagar', fee: 50 },
  { name: 'Perumalpuram', fee: 20 },
  { name: 'KTC Nagar', fee: 50 },
  { name: 'NGO Colony', fee: 50 },
  { name: 'Rahmath Nagar', fee: 50 },
  { name: 'Thyagaraja Nagar', fee: 50 },
  { name: 'Sankar Nagar', fee: 50 },
  { name: 'Thalaiyuthu', fee: 50 },
  { name: 'V.M. Chatram', fee: 50 },
  { name: 'Krishnapuram', fee: 50 },
  { name: 'Samadanapuram', fee: 20 },
  { name: 'Santhi Nagar', fee: 20 },
  { name: 'Tuckerammalpuram', fee: 50 },
  { name: 'Kodeeswaran Nagar', fee: 50 },
  { name: 'Suthamalli', fee: 50 },
  { name: 'Gangaikondan', fee: 50 },
  { name: 'Abishekapatti', fee: 50 },
  { name: 'Naranammalpuram', fee: 50 },
  { name: 'Reddiarpatti', fee: 50 },
].sort((a, b) => a.name.localeCompare(b.name));

export const getDeliveryFee = (name) => {
  const neighborhood = NEIGHBORHOODS.find(n => n.name === name);
  return neighborhood ? neighborhood.fee : 50; // Default to 50 if not found
};

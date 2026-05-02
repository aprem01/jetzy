// Pre-scripted "Tour Mode" experiences for Travel Earth.
//
// Each tour is a sequence of steps. A step has:
//   - audio (always) + optional video (Hedra Aria-talking clip)
//   - camera target (lat/lng/height/pitch)
//   - caption text (matches the audio)
//   - optional marker + cart items + spotlight + autoStreetView
//
// Spotlights now include a `picks` array — the list of FAMOUS adjacent venues
// the traveler should hit at this stop (eat / drink / do / stay), each with
// a tag explaining why it's iconic. This is what makes the demo feel like
// expert curation rather than a generic itinerary.

export const TOURS = [
  {
    id: 'patagonia-8days',
    title: 'Argentina · 8 Days',
    subtitle: 'Buenos Aires · El Chaltén · Mendoza',
    estSeconds: 60,
    cover: '/cover-patagonia.jpg',
    steps: [
      {
        audio: '/demo-audio/01-aria-open.mp3',
        video: '/demo-aria/01-aria-open.mp4',
        speaker: 'aria',
        text: "Hey Marco. You did Kilimanjaro in February. What's next?",
        duration: 3.738,
        camera: { lng: 37.3556, lat: -3.0674, height: 80_000, pitch: -0.4 },
      },
      {
        audio: '/demo-audio/02-marco-pick.mp3',
        speaker: 'marco',
        text: "Argentina. Eight days, mid October.",
        duration: 2.902,
        camera: { lng: -65.0, lat: -38.0, height: 4_500_000, pitch: -0.85 },
      },
      {
        audio: '/demo-audio/03-aria-day1.mp3',
        video: '/demo-aria/03-aria-day1.mp4',
        speaker: 'aria',
        text: "Buenos Aires, day one. Faena Hotel for arrival. Don Julio for steak — World's Fifty Best. Florería Atlántico for the nightcap.",
        duration: 9.119,
        camera: { lng: -58.3690, lat: -34.6118, height: 5_500, pitch: -0.35 },
        marker: { name: 'Faena Hotel · Puerto Madero', lat: -34.6118, lng: -58.3690 },
        cart: [
          { name: 'Faena Hotel · 1 night', kind: 'hotel', price: 540, day: 1 },
        ],
        autoStreetView: { delayMs: 3000 },
        spotlight: {
          name: 'Faena Hotel',
          subtitle: 'Philippe Starck · Puerto Madero · Buenos Aires',
          image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&q=80',
          tag: 'STAY · DAY 1',
          details: [
            { label: 'Address', value: 'Martha Salotti 445, Puerto Madero' },
            { label: 'Stay', value: '1 night · River-view king' },
            { label: 'Includes', value: 'Cabaret · Spa · Library bar' },
            { label: 'Rate', value: 'USD 540' },
          ],
          picks: [
            { kind: 'EAT',  name: 'Don Julio',          note: "World's 50 Best #14 · entraña + Malbec" },
            { kind: 'DRINK',name: 'Florería Atlántico', note: "World's 50 Best Bars · speakeasy under a flower shop" },
            { kind: 'DO',   name: 'El Ateneo',          note: 'Bookstore inside an Edwardian opera house' },
          ],
        },
      },
      {
        audio: '/demo-audio/04-aria-don-julio.mp3',
        video: '/demo-aria/04-aria-don-julio.mp4',
        speaker: 'aria',
        text: "The entraña is unmissable.",
        duration: 1.831,
        camera: { lng: -58.4338, lat: -34.5867, height: 1_200, pitch: -0.25 },
        marker: { name: 'Don Julio · Palermo', lat: -34.5867, lng: -58.4338 },
        cart: [
          { name: "Dinner · Don Julio (entraña)", kind: 'meal', price: 110, day: 1 },
        ],
        autoStreetView: { delayMs: 250 },
        spotlight: {
          name: 'Don Julio',
          subtitle: "World's 50 Best #14 · Argentine parrilla",
          image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=80',
          tag: 'EAT · DAY 1 · DINNER',
          details: [
            { label: 'Address', value: 'Guatemala 4699, Palermo' },
            { label: 'Order', value: 'Entraña · Provoleta · Catena Malbec' },
            { label: 'Reservation', value: '9:30 pm · Two seats secured' },
            { label: 'Spend', value: 'USD 110 pp' },
          ],
          picks: [
            { kind: 'EAT',  name: 'Anchoita',     note: "World's 50 Best Latin America · pasta omakase" },
            { kind: 'EAT',  name: 'Mishiguene',   note: "World's 50 Best Latin America · Jewish-Argentine" },
            { kind: 'DRINK',name: 'CoChinChina',  note: "World's 50 Best Bars · Asian-tropical mixology" },
          ],
        },
      },
      {
        audio: '/demo-audio/05-aria-day3.mp3',
        video: '/demo-aria/05-aria-day3.mp4',
        speaker: 'aria',
        text: "Day three — south to El Chaltén. Eolo Lodge, four nights. National Geographic Unique Lodge of the World.",
        duration: 6.977,
        camera: { lng: -72.8869, lat: -49.3315, height: 35_000, pitch: -0.5 },
        marker: { name: 'Eolo Lodge · Patagonia', lat: -50.4536, lng: -72.7194 },
        cart: [
          { name: 'Eolo Lodge · 4 nights all-inclusive', kind: 'hotel', price: 2400, day: 3 },
        ],
        autoStreetView: { delayMs: 3500 },
        spotlight: {
          name: 'Eolo · Patagonia\'s Spirit',
          subtitle: 'Nat Geo Unique Lodge · Relais & Châteaux',
          image: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=900&q=80',
          tag: 'STAY · DAY 3-6',
          details: [
            { label: 'Location',  value: '17 km off RP-11, El Calafate' },
            { label: 'Stay',      value: '4 nights · Patagonia-view suite' },
            { label: 'Includes',  value: 'All meals · Wines · Daily excursions' },
            { label: 'Rate',      value: 'USD 2,400 (couple)' },
          ],
          picks: [
            { kind: 'DO',   name: 'Estancia Cristina', note: 'Boat to a working sheep ranch on Lake Argentino' },
            { kind: 'EAT',  name: 'La Tablita',         note: 'El Calafate institution · Patagonian lamb on the cross' },
            { kind: 'DO',   name: 'Laguna Capri trek',  note: 'Half-day with Fitz Roy front-row at the end' },
          ],
        },
      },
      {
        audio: '/demo-audio/06-aria-day4.mp3',
        video: '/demo-aria/06-aria-day4.mp4',
        speaker: 'aria',
        text: "Sunrise on Fitz Roy. The same trail Yvon Chouinard pioneered.",
        duration: 4.522,
        camera: { lng: -73.0428, lat: -49.2719, height: 6_000, pitch: -0.25 },
        marker: { name: 'Fitz Roy · Laguna de los Tres', lat: -49.2719, lng: -73.0428 },
        cart: [
          { name: 'Fitz Roy guided sunrise · private', kind: 'experience', price: 320, day: 4 },
        ],
        spotlight: {
          name: 'Fitz Roy · Sunrise',
          subtitle: "Laguna de los Tres at first light · the Patagonia logo",
          image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=900&q=80',
          tag: 'DO · DAY 4',
          details: [
            { label: 'Guide',    value: 'Lucas · 12 yrs · spoke Spanish + English' },
            { label: 'Pickup',   value: '4:30 AM at Eolo' },
            { label: 'Distance', value: '20 km · 1,200 m gain' },
            { label: 'Rate',    value: 'USD 320 (private)' },
          ],
          picks: [
            { kind: 'EAT',  name: 'La Cervecería',    note: 'Post-trek brewery in El Chaltén · locro stew' },
            { kind: 'DO',   name: 'Mirador Los Cóndores', note: 'Easy 1-hr loop · condors at sunset' },
            { kind: 'EAT',  name: 'Maffia',            note: 'House-made pasta after the long hike' },
          ],
        },
      },
      {
        audio: '/demo-audio/07-marco-perito.mp3',
        speaker: 'marco',
        text: "Perito Moreno?",
        duration: 1.283,
        camera: { lng: -73.0428, lat: -49.2719, height: 6_000, pitch: -0.25 },
      },
      {
        audio: '/demo-audio/08-aria-perito.mp3',
        video: '/demo-aria/08-aria-perito.mp4',
        speaker: 'aria',
        text: "Adding it — day seven. Big Ice trek. Two hours walking on a glacier the size of Buenos Aires.",
        duration: 6.246,
        camera: { lng: -73.0388, lat: -50.4972, height: 7_000, pitch: -0.3 },
        marker: { name: 'Perito Moreno · Big Ice', lat: -50.4972, lng: -73.0388 },
        cart: [
          { name: 'Perito Moreno · Big Ice + park entry', kind: 'experience', price: 280, day: 7 },
        ],
        spotlight: {
          name: 'Perito Moreno · Big Ice',
          subtitle: 'Hielo y Aventura · IFMGA-certified glacier trek',
          image: 'https://images.unsplash.com/photo-1517783999520-f068d7431a60?w=900&q=80',
          tag: 'DO · DAY 7',
          details: [
            { label: 'Operator', value: 'Hielo y Aventura · since 1989' },
            { label: 'Duration', value: '6 hrs total · 2 hrs on the ice' },
            { label: 'Includes', value: 'Crampons · Lunch on a moraine · Park fee' },
            { label: 'Rate',    value: 'USD 280' },
          ],
          picks: [
            { kind: 'DO',   name: 'Catwalks lookout', note: 'Watch ice calve into Lago Argentino · free' },
            { kind: 'EAT',  name: 'La Zaina',         note: 'Lamb empanadas · El Calafate locals favorite' },
            { kind: 'DO',   name: 'Glaciarium museum', note: '20-min · explains what you just walked on' },
          ],
        },
      },
      {
        audio: '/demo-audio/09-aria-mendoza.mp3',
        video: '/demo-aria/09-aria-mendoza.mp4',
        speaker: 'aria',
        text: "Mendoza to wind down. Cavas Wine Lodge. Dinner at Francis Mallmann's 1884. Catena Zapata in the morning.",
        duration: 8.153,
        camera: { lng: -68.8447, lat: -33.0048, height: 6_500, pitch: -0.35 },
        marker: { name: 'Cavas Wine Lodge · Mendoza', lat: -33.0048, lng: -68.8447 },
        cart: [
          { name: 'Cavas Wine Lodge · 1 night', kind: 'hotel', price: 580, day: 8 },
          { name: "Dinner · Francis Mallmann's 1884", kind: 'meal', price: 220, day: 8 },
          { name: 'Catena Zapata · private tasting', kind: 'experience', price: 220, day: 9 },
        ],
        autoStreetView: { delayMs: 3000 },
        spotlight: {
          name: 'Mendoza · Wind Down',
          subtitle: 'Cavas Wine Lodge + Mallmann + Catena',
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80',
          tag: 'STAY + EAT · DAY 8',
          details: [
            { label: 'Stay',     value: 'Cavas Wine Lodge · standalone Cava + plunge' },
            { label: 'Dinner',   value: "Francis Mallmann's 1884 Restaurante · open fire" },
            { label: 'Morning',  value: 'Catena Zapata · 6 vintages + pyramid tour' },
            { label: 'Bundle',   value: 'USD 1,020' },
          ],
          picks: [
            { kind: 'EAT',  name: 'Casa El Enemigo',   note: 'Adrianna Catena & Aleardo Ferrer · 7-course tasting' },
            { kind: 'DRINK',name: 'Bodega Salentein',  note: 'Greek-temple winery in the Uco Valley' },
            { kind: 'DO',   name: 'Caballadas horseback', note: 'Sunset ride through the vineyards' },
          ],
        },
      },
      {
        audio: '/demo-audio/10-aria-close.mp3',
        video: '/demo-aria/10-aria-close.mp4',
        speaker: 'aria',
        text: "Eight days. Six iconic names. Twenty-eight hundred. Booked?",
        duration: 3.869,
        camera: { lng: -68.0, lat: -42.0, height: 3_500_000, pitch: -0.85 },
      },
      {
        audio: '/demo-audio/11-marco-yes.mp3',
        speaker: 'marco',
        text: "Booked.",
        duration: 0.891,
        camera: { lng: -68.0, lat: -42.0, height: 3_500_000, pitch: -0.85 },
      },
    ],
  },
];

export function getTour(id) {
  return TOURS.find((t) => t.id === id) || null;
}

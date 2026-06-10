/* =====================================================
   Miami Photography Center — Store demo products
   Static demo data. Replaced by Sanity + Stripe at launch
   (see WIREFRAME.md, Fase 4).
   ===================================================== */

export interface Product {
  slug: string;
  name: { en: string; es: string };
  price: number; // USD
  category: { en: string; es: string }; // Cameras | Lenses | Accessories
  img: string; // Unsplash URL ?w=1200&q=80&auto=format&fit=crop
  desc: { en: string; es: string }; // 2-3 sentences
  condition: { en: string; es: string };
  specs: { en: string[]; es: string[] }; // 4-5 bullets
}

export const products: Product[] = [
  {
    slug: 'canon-eos-r6-body',
    name: { en: 'Canon EOS R6 — Body (Used)', es: 'Canon EOS R6 — Cuerpo (Usada)' },
    price: 1499,
    category: { en: 'Cameras', es: 'Cámaras' },
    img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&q=80&auto=format&fit=crop',
    desc: {
      en: 'Full-frame mirrorless workhorse with outstanding autofocus and in-body stabilization. Inspected, cleaned, and serviced in-house by our own technicians, with shutter count verified. Backed by our 6-month warranty.',
      es: 'Mirrorless full-frame confiable, con enfoque automático sobresaliente y estabilización en el cuerpo. Revisada, limpiada y calibrada in-house por nuestros propios técnicos, con conteo de disparos verificado. Respaldada por nuestra garantía de 6 meses.',
    },
    condition: {
      en: 'Inspected & serviced in-house — 6-month warranty',
      es: 'Revisada y calibrada in-house — garantía de 6 meses',
    },
    specs: {
      en: [
        '20MP full-frame CMOS sensor, RF mount',
        'In-body image stabilization up to 8 stops',
        '4K 60p video, Dual Pixel CMOS AF II',
        'Shutter count verified, sensor cleaned in-house',
        'Includes battery, charger, and strap',
      ],
      es: [
        'Sensor CMOS full-frame de 20MP, montura RF',
        'Estabilización en el cuerpo de hasta 8 pasos',
        'Video 4K 60p, Dual Pixel CMOS AF II',
        'Conteo de disparos verificado, sensor limpiado in-house',
        'Incluye batería, cargador y correa',
      ],
    },
  },
  {
    slug: 'nikon-d850-body',
    name: { en: 'Nikon D850 — Body (Used)', es: 'Nikon D850 — Cuerpo (Usada)' },
    price: 1699,
    category: { en: 'Cameras', es: 'Cámaras' },
    img: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=1200&q=80&auto=format&fit=crop',
    desc: {
      en: 'The legendary 45.7MP DSLR for studio, landscape, and editorial work. Fully inspected and serviced in-house: sensor cleaned, mirror box checked, firmware updated. Covered by our 6-month warranty.',
      es: 'La legendaria DSLR de 45.7MP para estudio, paisaje y trabajo editorial. Totalmente revisada y calibrada in-house: sensor limpio, caja de espejo verificada y firmware actualizado. Cubierta por nuestra garantía de 6 meses.',
    },
    condition: {
      en: 'Inspected & serviced in-house — 6-month warranty',
      es: 'Revisada y calibrada in-house — garantía de 6 meses',
    },
    specs: {
      en: [
        '45.7MP BSI full-frame sensor, F mount',
        '153-point AF system, 7 fps burst',
        '4K UHD video, dual card slots (XQD + SD)',
        'Mirror and shutter mechanism serviced in-house',
        'Includes battery, charger, and body cap',
      ],
      es: [
        'Sensor BSI full-frame de 45.7MP, montura F',
        'Sistema AF de 153 puntos, ráfaga de 7 fps',
        'Video 4K UHD, doble ranura (XQD + SD)',
        'Mecanismo de espejo y obturador calibrado in-house',
        'Incluye batería, cargador y tapa de cuerpo',
      ],
    },
  },
  {
    slug: 'fujifilm-x-t4-body',
    name: { en: 'Fujifilm X-T4 — Body (Used)', es: 'Fujifilm X-T4 — Cuerpo (Usada)' },
    price: 1049,
    category: { en: 'Cameras', es: 'Cámaras' },
    img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80&auto=format&fit=crop',
    desc: {
      en: 'Compact APS-C powerhouse with classic dials and beautiful film simulations. Inspected and serviced in-house — sensor cleaned, IBIS unit tested, firmware brought up to date. Ships with our 6-month warranty.',
      es: 'Compacta y potente APS-C con diales clásicos y hermosas simulaciones de película. Revisada y calibrada in-house: sensor limpio, unidad IBIS probada y firmware al día. Se envía con nuestra garantía de 6 meses.',
    },
    condition: {
      en: 'Inspected & serviced in-house — 6-month warranty',
      es: 'Revisada y calibrada in-house — garantía de 6 meses',
    },
    specs: {
      en: [
        '26.1MP X-Trans CMOS 4 sensor, X mount',
        'In-body stabilization, fully articulating screen',
        '4K 60p video, classic film simulations',
        'Sensor and IBIS tested and cleaned in-house',
        'Includes battery, charger, and strap',
      ],
      es: [
        'Sensor X-Trans CMOS 4 de 26.1MP, montura X',
        'Estabilización en el cuerpo, pantalla totalmente articulada',
        'Video 4K 60p, simulaciones de película clásicas',
        'Sensor e IBIS probados y limpiados in-house',
        'Incluye batería, cargador y correa',
      ],
    },
  },
  {
    slug: 'sony-fe-50mm-f18',
    name: { en: 'Sony FE 50mm f/1.8 (Used)', es: 'Sony FE 50mm f/1.8 (Usado)' },
    price: 169,
    category: { en: 'Lenses', es: 'Lentes' },
    img: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&q=80&auto=format&fit=crop',
    desc: {
      en: 'A light, sharp full-frame prime — the classic first portrait lens for Sony shooters. Optics inspected and cleaned in-house, focus motor and aperture tested on a calibrated bench. 6-month warranty included.',
      es: 'Un lente fijo full-frame liviano y nítido — el clásico primer lente de retrato para usuarios de Sony. Óptica revisada y limpiada in-house, motor de enfoque y diafragma probados en banco calibrado. Incluye garantía de 6 meses.',
    },
    condition: {
      en: 'Optics inspected & cleaned in-house — 6-month warranty',
      es: 'Óptica revisada y limpiada in-house — garantía de 6 meses',
    },
    specs: {
      en: [
        'Full-frame 50mm prime, Sony E mount',
        'Bright f/1.8 maximum aperture',
        '7-blade circular aperture for smooth bokeh',
        'Glass, focus, and aperture tested in-house',
        'Includes front and rear caps',
      ],
      es: [
        'Lente fijo 50mm full-frame, montura Sony E',
        'Apertura máxima luminosa de f/1.8',
        'Diafragma circular de 7 hojas para un bokeh suave',
        'Cristales, enfoque y diafragma probados in-house',
        'Incluye tapas delantera y trasera',
      ],
    },
  },
  {
    slug: 'canon-ef-24-105mm-f4l',
    name: { en: 'Canon EF 24-105mm f/4L IS USM (Used)', es: 'Canon EF 24-105mm f/4L IS USM (Usado)' },
    price: 449,
    category: { en: 'Lenses', es: 'Lentes' },
    img: 'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=1200&q=80&auto=format&fit=crop',
    desc: {
      en: 'The do-everything L-series zoom for events, travel, and editorial work. Zoom and focus rings serviced in-house, optics cleaned, image stabilizer tested. Sold with our 6-month warranty.',
      es: 'El zoom serie L todoterreno para eventos, viajes y trabajo editorial. Anillos de zoom y enfoque calibrados in-house, óptica limpia y estabilizador de imagen probado. Se vende con nuestra garantía de 6 meses.',
    },
    condition: {
      en: 'Serviced in-house — 6-month warranty',
      es: 'Calibrado in-house — garantía de 6 meses',
    },
    specs: {
      en: [
        '24-105mm f/4 constant aperture, Canon EF mount',
        'L-series weather-sealed construction',
        'Image stabilization tested and verified in-house',
        'Zoom and focus mechanisms lubricated and serviced',
        'Includes lens hood and both caps',
      ],
      es: [
        'Apertura constante f/4 en 24-105mm, montura Canon EF',
        'Construcción serie L sellada contra clima',
        'Estabilizador de imagen probado y verificado in-house',
        'Mecanismos de zoom y enfoque lubricados y calibrados',
        'Incluye parasol y ambas tapas',
      ],
    },
  },
  {
    slug: 'profoto-b10-flash',
    name: { en: 'Profoto B10 OCF Flash (Used)', es: 'Flash Profoto B10 OCF (Usado)' },
    price: 995,
    category: { en: 'Accessories', es: 'Accesorios' },
    img: 'https://images.unsplash.com/photo-1519638831568-d9897f54ed69?w=1200&q=80&auto=format&fit=crop',
    desc: {
      en: 'Compact 250Ws battery strobe with continuous LED light — studio power that fits in a backpack. Flash tube, battery, and electronics inspected and serviced in-house. Backed by our 6-month warranty.',
      es: 'Flash compacto de batería de 250Ws con luz LED continua — potencia de estudio que cabe en una mochila. Tubo de flash, batería y electrónica revisados y calibrados in-house. Respaldado por nuestra garantía de 6 meses.',
    },
    condition: {
      en: 'Inspected & serviced in-house — 6-month warranty',
      es: 'Revisado y calibrado in-house — garantía de 6 meses',
    },
    specs: {
      en: [
        '250Ws output, 10-stop power range',
        'Built-in continuous LED modeling light',
        'Li-ion battery tested for full-capacity cycles',
        'AirTTL and HSS compatible (remote sold separately)',
        'Electronics bench-tested in-house',
      ],
      es: [
        'Potencia de 250Ws, rango de 10 pasos',
        'Luz LED continua de modelado integrada',
        'Batería Li-ion probada en ciclos de capacidad completa',
        'Compatible con AirTTL y HSS (disparador se vende aparte)',
        'Electrónica probada en banco in-house',
      ],
    },
  },
  {
    slug: 'carbon-fiber-travel-tripod',
    name: { en: 'Carbon Fiber Travel Tripod', es: 'Trípode de Viaje de Fibra de Carbono' },
    price: 229,
    category: { en: 'Accessories', es: 'Accesorios' },
    img: 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=1200&q=80&auto=format&fit=crop',
    desc: {
      en: 'Lightweight carbon fiber tripod with a fluid-smooth ball head, ideal for travel and on-location work. Every unit is assembled, checked, and load-tested in-house before it ships. Covered by our 6-month warranty.',
      es: 'Trípode liviano de fibra de carbono con rótula de bola suave, ideal para viajes y trabajo en locación. Cada unidad se arma, revisa y prueba de carga in-house antes de enviarse. Cubierto por nuestra garantía de 6 meses.',
    },
    condition: {
      en: 'Inspected & load-tested in-house — 6-month warranty',
      es: 'Revisado y probado de carga in-house — garantía de 6 meses',
    },
    specs: {
      en: [
        'Carbon fiber legs, 3.1 lb (1.4 kg) total weight',
        'Supports up to 22 lb (10 kg) of gear',
        'Ball head with Arca-type quick-release plate',
        'Folds to 17 in (43 cm) for carry-on travel',
        'Locks and head torque checked in-house',
      ],
      es: [
        'Patas de fibra de carbono, 1.4 kg de peso total',
        'Soporta hasta 10 kg de equipo',
        'Rótula de bola con placa de liberación rápida tipo Arca',
        'Se pliega a 43 cm para llevar en cabina',
        'Seguros y torque de la rótula verificados in-house',
      ],
    },
  },
  {
    slug: 'pro-sd-card-kit',
    name: { en: 'Pro SD Card Kit — 2× 128GB V60', es: 'Kit Pro de Tarjetas SD — 2× 128GB V60' },
    price: 79,
    category: { en: 'Accessories', es: 'Accesorios' },
    img: 'https://images.unsplash.com/photo-1480365501497-199581be0e66?w=1200&q=80&auto=format&fit=crop',
    desc: {
      en: 'Two 128GB UHS-II V60 SD cards with a weather-resistant carry case — ready for 4K video and high-resolution bursts. Each card is speed-tested and health-verified in-house before shipping. 6-month warranty included.',
      es: 'Dos tarjetas SD UHS-II V60 de 128GB con estuche resistente al clima — listas para video 4K y ráfagas de alta resolución. Cada tarjeta se prueba de velocidad y estado in-house antes del envío. Incluye garantía de 6 meses.',
    },
    condition: {
      en: 'Speed-tested in-house — 6-month warranty',
      es: 'Probadas de velocidad in-house — garantía de 6 meses',
    },
    specs: {
      en: [
        '2× 128GB SDXC UHS-II, V60 rated',
        'Sustained write speeds for 4K 60p recording',
        'Read/write speeds verified card-by-card in-house',
        'Weather-resistant hard case for 8 cards included',
        'Works with all current Canon, Nikon, Sony, Fujifilm bodies',
      ],
      es: [
        '2× SDXC UHS-II de 128GB, clasificación V60',
        'Velocidades de escritura sostenidas para grabar 4K 60p',
        'Velocidades de lectura/escritura verificadas tarjeta por tarjeta in-house',
        'Incluye estuche rígido resistente al clima para 8 tarjetas',
        'Compatibles con cuerpos actuales Canon, Nikon, Sony y Fujifilm',
      ],
    },
  },
];

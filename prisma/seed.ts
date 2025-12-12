// Use the same database connection as the app
import { db } from '../src/lib/db';

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await db.report.deleteMany();
  await db.event.deleteMany();
  await db.shop.deleteMany();

  // Seed Events
  const events = [
    {
      name: 'London Yarn Festival 2026',
      description:
        'A celebration of all things yarn! Join us for workshops, vendor stalls, and community meetups.',
      startDate: new Date('2026-03-15T10:00:00Z'),
      endDate: new Date('2026-03-17T18:00:00Z'),
      location: 'London',
      address: 'Olympia London, Hammersmith Road, London W14 8UX',
      latitude: 51.4926,
      longitude: -0.2106,
      website: 'https://example.com/london-yarn-festival',
      source: 'Manual entry',
    },
    {
      name: 'Edinburgh Knitting Circle',
      description:
        'Weekly knitting circle for all skill levels. Bring your current project and enjoy some tea and conversation.',
      startDate: new Date('2026-01-20T14:00:00Z'),
      endDate: new Date('2026-01-20T16:00:00Z'),
      location: 'Edinburgh',
      address: 'The Yarn Shop, 123 High Street, Edinburgh EH1 1AA',
      latitude: 55.9533,
      longitude: -3.1883,
      website: null,
      source: 'Manual entry',
    },
    {
      name: 'Manchester Crochet Workshop',
      description:
        'Learn the basics of crochet in this beginner-friendly workshop. All materials provided.',
      startDate: new Date('2026-02-10T10:00:00Z'),
      endDate: new Date('2026-02-10T13:00:00Z'),
      location: 'Manchester',
      address: 'Community Centre, 45 Main Street, Manchester M1 1AB',
      latitude: 53.4808,
      longitude: -2.2426,
      website: null,
      source: 'Manual entry',
    },
    {
      name: 'Birmingham Fiber Arts Fair',
      description:
        'Local fiber artists showcase their work. Vendors, demonstrations, and hands-on activities.',
      startDate: new Date('2026-04-05T09:00:00Z'),
      endDate: new Date('2026-04-05T17:00:00Z'),
      location: 'Birmingham',
      address:
        'Birmingham Convention Centre, 1 Centenary Square, Birmingham B1 2EA',
      latitude: 52.4862,
      longitude: -1.8904,
      website: 'https://example.com/birmingham-fair',
      source: 'Manual entry',
    },
    {
      name: 'Cardiff Yarn Crawl',
      description:
        "Join us for a day exploring Cardiff's best yarn shops. Maps and discounts provided!",
      startDate: new Date('2026-05-12T10:00:00Z'),
      endDate: new Date('2026-05-12T16:00:00Z'),
      location: 'Cardiff',
      address: 'Starting at Cardiff Central Station, Cardiff CF10 1EP',
      latitude: 51.4754,
      longitude: -3.1785,
      website: null,
      source: 'Manual entry',
    },
  ];

  for (const event of events) {
    await db.event.create({ data: event });
  }

  console.log(`Created ${events.length} events`);

  // Seed Shops
  const shops = [
    {
      name: 'The Wool Shop',
      description:
        'Family-owned yarn shop specializing in natural fibers. Friendly staff and extensive selection.',
      address: '45 High Street',
      city: 'London',
      postcode: 'SW1A 1AA',
      latitude: 51.5074,
      longitude: -0.1278,
      website: 'https://example.com/wool-shop',
      phone: '+44 20 1234 5678',
      source: 'Manual entry',
    },
    {
      name: 'Yarn Paradise',
      description:
        'Modern yarn shop with a focus on indie dyers and unique colorways. Regular workshops available.',
      address: '12 Market Square',
      city: 'Manchester',
      postcode: 'M1 1AB',
      latitude: 53.4808,
      longitude: -2.2426,
      website: 'https://example.com/yarn-paradise',
      phone: '+44 161 1234 5678',
      source: 'Manual entry',
    },
    {
      name: 'Knit & Stitch',
      description:
        'Cozy shop with a great selection of yarns, patterns, and accessories. Helpful staff always on hand.',
      address: '78 George Street',
      city: 'Edinburgh',
      postcode: 'EH2 2PF',
      latitude: 55.9533,
      longitude: -3.1883,
      website: null,
      phone: '+44 131 1234 5678',
      source: 'Manual entry',
    },
    {
      name: 'Fiber Arts Emporium',
      description:
        'Large selection of yarns, tools, and books. Also offers classes and knitting groups.',
      address: '23 Queen Street',
      city: 'Birmingham',
      postcode: 'B1 1AA',
      latitude: 52.4862,
      longitude: -1.8904,
      website: 'https://example.com/fiber-arts',
      phone: '+44 121 1234 5678',
      source: 'Manual entry',
    },
    {
      name: 'The Yarn Barn',
      description:
        'Rustic shop with a focus on traditional British yarns. Great for finding local wool producers.',
      address: '9 Castle Street',
      city: 'Cardiff',
      postcode: 'CF10 1BT',
      latitude: 51.4816,
      longitude: -3.1791,
      website: null,
      phone: '+44 29 1234 5678',
      source: 'Manual entry',
    },
    {
      name: 'Stitch & Sip',
      description:
        'Combined yarn shop and café. Perfect for meeting friends and working on projects over coffee.',
      address: '56 High Street',
      city: 'Bristol',
      postcode: 'BS1 2AW',
      latitude: 51.4545,
      longitude: -2.5879,
      website: 'https://example.com/stitch-sip',
      phone: '+44 117 1234 5678',
      source: 'Manual entry',
    },
    {
      name: 'Woolly Wonders',
      description:
        'Specializes in luxury yarns and hand-dyed fibers. Beautiful selection of imported yarns.',
      address: '34 New Street',
      city: 'Leeds',
      postcode: 'LS1 1AA',
      latitude: 53.8008,
      longitude: -1.5491,
      website: null,
      phone: '+44 113 1234 5678',
      source: 'Manual entry',
    },
    {
      name: 'The Knitting Nook',
      description:
        'Small but well-stocked shop with friendly atmosphere. Great for beginners.',
      address: '15 Church Lane',
      city: 'York',
      postcode: 'YO1 7HH',
      latitude: 53.96,
      longitude: -1.0873,
      website: null,
      phone: '+44 1904 123456',
      source: 'Manual entry',
    },
  ];

  for (const shop of shops) {
    await db.shop.create({ data: shop });
  }

  console.log(`Created ${shops.length} shops`);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

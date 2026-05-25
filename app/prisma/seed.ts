import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Categories
  const cervejas = await prisma.category.create({
    data: {
      name: 'Cervejas',
      slug: 'cervejas',
      description: 'Cervejas nacionais, importadas e artesanais bem geladas',
      emoji: '🍺',
      order: 1,
    },
  });

  const refrigerantes = await prisma.category.create({
    data: {
      name: 'Refrigerantes',
      slug: 'refrigerantes',
      description: 'Refrigerantes, sucos e aguas',
      emoji: '🥤',
      order: 2,
    },
  });

  const gin = await prisma.category.create({
    data: {
      name: 'GIN',
      slug: 'gin',
      description: 'Gins nacionais e importados para drinks perfeitos',
      emoji: '🍸',
      order: 3,
    },
  });

  const whisky = await prisma.category.create({
    data: {
      name: 'Whisky',
      slug: 'whisky',
      description: 'Whiskies single malt, blended e bourbon',
      emoji: '🥃',
      order: 4,
    },
  });

  const vodka = await prisma.category.create({
    data: {
      name: 'Vodka',
      slug: 'vodka',
      description: 'Vodkas nacionais e importadas',
      emoji: '🍹',
      order: 5,
    },
  });

  const petiscos = await prisma.category.create({
    data: {
      name: 'Petiscos & Snacks',
      slug: 'petiscos-snacks',
      description: 'Petiscos, amendoins e snacks para acompanhar',
      emoji: '🥜',
      order: 6,
    },
  });

  // Products — Cervejas
  const prodCervejas = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Brahma Duplo Malte 350ml',
        slug: 'brahma-duplo-malte-350ml',
        description: 'Cerveja Brahma Duplo Malte lata 350ml',
        emoji: '🍺',
        price: 4.49,
        categoryId: cervejas.id,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Heineken 330ml Long Neck',
        slug: 'heineken-330ml-long-neck',
        description: 'Cerveja Heineken puro malte garrafa long neck 330ml',
        emoji: '🍺',
        price: 7.99,
        categoryId: cervejas.id,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Corona Extra 330ml',
        slug: 'corona-extra-330ml',
        description: 'Cerveja Corona Extra long neck 330ml',
        emoji: '🍺',
        price: 8.49,
        categoryId: cervejas.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Budweiser 330ml',
        slug: 'budweiser-330ml',
        description: 'Cerveja Budweiser American lager 330ml',
        emoji: '🍺',
        price: 5.99,
        categoryId: cervejas.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Skol Lata 350ml',
        slug: 'skol-lata-350ml',
        description: 'Cerveja Skol pilsen lata 350ml',
        emoji: '🍺',
        price: 3.49,
        categoryId: cervejas.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Stella Artois 275ml',
        slug: 'stella-artois-275ml',
        description: 'Cerveja Stella Artois premium lager 275ml',
        emoji: '🍺',
        price: 6.99,
        categoryId: cervejas.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Spaten Puro Malte 350ml',
        slug: 'spaten-puro-malte-350ml',
        description: 'Cerveja Spaten puro malte lata 350ml',
        emoji: '🍺',
        price: 4.99,
        categoryId: cervejas.id,
      },
    }),
  ]);

  // Products — Refrigerantes
  await Promise.all([
    prisma.product.create({
      data: {
        name: 'Coca-Cola Lata 350ml',
        slug: 'coca-cola-lata-350ml',
        description: 'Refrigerante Coca-Cola original lata 350ml',
        emoji: '🥤',
        price: 4.99,
        categoryId: refrigerantes.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Guarana Antarctica 350ml',
        slug: 'guarana-antarctica-350ml',
        description: 'Refrigerante Guarana Antarctica lata 350ml',
        emoji: '🥤',
        price: 3.99,
        categoryId: refrigerantes.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Coca-Cola 2L',
        slug: 'coca-cola-2l',
        description: 'Refrigerante Coca-Cola original garrafa 2 litros',
        emoji: '🥤',
        price: 10.99,
        categoryId: refrigerantes.id,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Red Bull Energy 250ml',
        slug: 'red-bull-energy-250ml',
        description: 'Energetico Red Bull lata 250ml',
        emoji: '⚡',
        price: 12.99,
        categoryId: refrigerantes.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Agua Mineral Crystal 500ml',
        slug: 'agua-mineral-crystal-500ml',
        description: 'Agua mineral sem gas Crystal 500ml',
        emoji: '💧',
        price: 2.49,
        categoryId: refrigerantes.id,
      },
    }),
  ]);

  // Products — GIN
  const prodGins = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Tanqueray London Dry 750ml',
        slug: 'tanqueray-london-dry-750ml',
        description: 'Gin Tanqueray London Dry garrafa 750ml',
        emoji: '🍸',
        price: 109.90,
        categoryId: gin.id,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Beefeater London Dry 750ml',
        slug: 'beefeater-london-dry-750ml',
        description: 'Gin Beefeater London Dry garrafa 750ml',
        emoji: '🍸',
        price: 89.90,
        categoryId: gin.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Bombay Sapphire 750ml',
        slug: 'bombay-sapphire-750ml',
        description: 'Gin Bombay Sapphire garrafa 750ml',
        emoji: '🍸',
        price: 119.90,
        categoryId: gin.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Gordons London Dry 750ml',
        slug: 'gordons-london-dry-750ml',
        description: 'Gin Gordons London Dry garrafa 750ml',
        emoji: '🍸',
        price: 69.90,
        categoryId: gin.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Hendricks 700ml',
        slug: 'hendricks-700ml',
        description: 'Gin Hendricks com pepino e rosa garrafa 700ml',
        emoji: '🍸',
        price: 189.90,
        categoryId: gin.id,
      },
    }),
  ]);

  // Products — Whisky
  await Promise.all([
    prisma.product.create({
      data: {
        name: 'Johnnie Walker Red Label 750ml',
        slug: 'johnnie-walker-red-label-750ml',
        description: 'Whisky Johnnie Walker Red Label garrafa 750ml',
        emoji: '🥃',
        price: 89.90,
        categoryId: whisky.id,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Johnnie Walker Black Label 750ml',
        slug: 'johnnie-walker-black-label-750ml',
        description: 'Whisky Johnnie Walker Black Label 12 anos garrafa 750ml',
        emoji: '🥃',
        price: 159.90,
        categoryId: whisky.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Jack Daniels Old No.7 750ml',
        slug: 'jack-daniels-old-no7-750ml',
        description: 'Whisky Jack Daniels Tennessee garrafa 750ml',
        emoji: '🥃',
        price: 139.90,
        categoryId: whisky.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Chivas Regal 12 anos 750ml',
        slug: 'chivas-regal-12-anos-750ml',
        description: 'Whisky Chivas Regal 12 anos blended scotch 750ml',
        emoji: '🥃',
        price: 179.90,
        categoryId: whisky.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'White Horse 750ml',
        slug: 'white-horse-750ml',
        description: 'Whisky White Horse blended scotch 750ml',
        emoji: '🥃',
        price: 59.90,
        categoryId: whisky.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Jim Beam Bourbon 750ml',
        slug: 'jim-beam-bourbon-750ml',
        description: 'Whisky Jim Beam Kentucky Straight Bourbon 750ml',
        emoji: '🥃',
        price: 99.90,
        categoryId: whisky.id,
      },
    }),
  ]);

  // Products — Vodka
  const prodVodkas = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Absolut Original 750ml',
        slug: 'absolut-original-750ml',
        description: 'Vodka Absolut Original sueca garrafa 750ml',
        emoji: '🍹',
        price: 79.90,
        categoryId: vodka.id,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Smirnoff 998ml',
        slug: 'smirnoff-998ml',
        description: 'Vodka Smirnoff garrafa 998ml',
        emoji: '🍹',
        price: 34.90,
        categoryId: vodka.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Grey Goose 750ml',
        slug: 'grey-goose-750ml',
        description: 'Vodka Grey Goose francesa premium garrafa 750ml',
        emoji: '🍹',
        price: 189.90,
        categoryId: vodka.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Ciroc 750ml',
        slug: 'ciroc-750ml',
        description: 'Vodka Ciroc francesa destilada de uvas 750ml',
        emoji: '🍹',
        price: 149.90,
        categoryId: vodka.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Skyy 980ml',
        slug: 'skyy-980ml',
        description: 'Vodka Skyy americana garrafa 980ml',
        emoji: '🍹',
        price: 44.90,
        categoryId: vodka.id,
      },
    }),
  ]);

  // Products — Petiscos
  await Promise.all([
    prisma.product.create({
      data: {
        name: 'Amendoim Japones 150g',
        slug: 'amendoim-japones-150g',
        description: 'Amendoim japones crocante pacote 150g',
        emoji: '🥜',
        price: 7.90,
        categoryId: petiscos.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Batata Ruffles Original 96g',
        slug: 'batata-ruffles-original-96g',
        description: 'Batata frita ondulada Ruffles original 96g',
        emoji: '🍟',
        price: 9.90,
        categoryId: petiscos.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Doritos Queijo Nacho 96g',
        slug: 'doritos-queijo-nacho-96g',
        description: 'Salgadinho Doritos sabor queijo nacho 96g',
        emoji: '🌮',
        price: 9.90,
        categoryId: petiscos.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Salaminho Sadia 100g',
        slug: 'salaminho-sadia-100g',
        description: 'Salaminho Sadia snack 100g',
        emoji: '🍖',
        price: 8.90,
        categoryId: petiscos.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Gelo 5kg',
        slug: 'gelo-5kg',
        description: 'Saco de gelo cristal 5kg',
        emoji: '🧊',
        price: 12.90,
        categoryId: petiscos.id,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Torresmo Pork King 50g',
        slug: 'torresmo-pork-king-50g',
        description: 'Torresmo artesanal crocante Pork King 50g',
        emoji: '🐷',
        price: 6.90,
        categoryId: petiscos.id,
      },
    }),
  ]);

  // Promotions
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await Promise.all([
    prisma.promotion.create({
      data: {
        title: 'Heineken com 15% OFF',
        description: 'Aproveite a Heineken long neck com desconto especial!',
        productId: prodCervejas[1].id,
        discountPercent: 15,
        startsAt: now,
        endsAt: thirtyDaysLater,
      },
    }),
    prisma.promotion.create({
      data: {
        title: 'Tanqueray em promocao',
        description: 'Gin Tanqueray com 10% de desconto por tempo limitado',
        productId: prodGins[0].id,
        discountPercent: 10,
        startsAt: now,
        endsAt: thirtyDaysLater,
      },
    }),
    prisma.promotion.create({
      data: {
        title: 'Absolut com desconto',
        description: 'Vodka Absolut Original com 12% OFF',
        productId: prodVodkas[0].id,
        discountPercent: 12,
        startsAt: now,
        endsAt: thirtyDaysLater,
      },
    }),
  ]);

  console.log('Seed completed successfully!');
  console.log('- 6 categories created');
  console.log('- 35 products created');
  console.log('- 3 promotions created');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

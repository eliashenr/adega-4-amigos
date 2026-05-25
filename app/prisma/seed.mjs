import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

async function query(text, params = []) {
  const res = await pool.query(text, params);
  return res.rows;
}

async function main() {
  console.log('Seeding database...');

  const now_ts = new Date().toISOString();

  // Clean existing data (order matters for FK constraints)
  await query('DELETE FROM admins');
  await query('DELETE FROM order_items');
  await query('DELETE FROM orders');
  await query('DELETE FROM addresses');
  await query('DELETE FROM customers');
  await query('DELETE FROM promotions');
  await query('DELETE FROM products');
  await query('DELETE FROM categories');

  // Reset sequences
  await query("ALTER SEQUENCE categories_id_seq RESTART WITH 1");
  await query("ALTER SEQUENCE products_id_seq RESTART WITH 1");
  await query("ALTER SEQUENCE promotions_id_seq RESTART WITH 1");

  // ══════════════════════════════════════
  //  CATEGORIES (13 categorias com banners)
  // ══════════════════════════════════════
  const catInsert = `INSERT INTO categories (name, slug, description, image, emoji, "order", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`;

  const [
    cervejas, vinhos, whisky, gin, destilados,
    refrigerantes, energeticos, gelos,
    tabacos, essencias, sedas,
    combos, chocolates
  ] = (await Promise.all([
    query(catInsert, ['Cervejas', 'cervejas', 'Long necks, premium, artesanais e importadas', '/banners/categorias/cervejas.png', '🍺', 1, now_ts]),
    query(catInsert, ['Vinhos', 'vinhos', 'Cabernet, Merlot, Sauvignon e Malbec', '/banners/categorias/vinhos.png', '🍷', 2, now_ts]),
    query(catInsert, ['Whisky', 'whisky', '12, 15, 18 anos, single malt e blends', '/banners/categorias/whisky.png', '🥃', 3, now_ts]),
    query(catInsert, ['Gin', 'gin', 'Tanqueray, Gordons, Beefeater e Bombay', '/banners/categorias/gin.png', '🍸', 4, now_ts]),
    query(catInsert, ['Destilados', 'destilados', 'Vodka, Tequila, Rum, Cachaca e Sake', '/banners/categorias/destilados.png', '🍹', 5, now_ts]),
    query(catInsert, ['Refrigerantes', 'refrigerantes', 'Coca-Cola, Guarana, sucos e aguas', '/banners/categorias/refrigerantes.png', '🥤', 6, now_ts]),
    query(catInsert, ['Energeticos', 'energeticos', 'Energia, foco e long-drinks', '/banners/categorias/energeticos.png', '⚡', 7, now_ts]),
    query(catInsert, ['Gelos', 'gelos', 'Sacos de 5kg, cubinhos e gelo de sabores', '/banners/categorias/gelos.png', '🧊', 8, now_ts]),
    query(catInsert, ['Tabacos & Cigarros', 'tabacos-cigarros', 'Amsterdam, Acrema, Dunhill, Rothmans e Marlboro', '/banners/categorias/tabacos.png', '🚬', 9, now_ts]),
    query(catInsert, ['Essencias', 'essencias', 'Carvao, papel aluminio e essencias de narguile', '/banners/categorias/essencias.png', '💨', 10, now_ts]),
    query(catInsert, ['Sedas', 'sedas', 'Zomo, Smoking, PayPay, Papelito e Elements', '/banners/categorias/sedas.png', '📜', 11, now_ts]),
    query(catInsert, ['Combos', 'combos', 'Gin, Whisky, Vodka — monte o seu kit', '/banners/categorias/combos.png', '🎁', 12, now_ts]),
    query(catInsert, ['Chocolates', 'chocolates', 'Ao leite, amargo, branco e variedades', '/banners/categorias/chocolates.png', '🍫', 13, now_ts]),
  ])).map(r => r[0].id);

  // ══════════════════════════════════════
  //  PRODUCTS
  // ══════════════════════════════════════
  const prodInsert = `INSERT INTO products (name, slug, description, emoji, price, "categoryId", featured, "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`;

  // ── Cervejas ──
  const cervejasProds = await Promise.all([
    query(prodInsert, ['Brahma Duplo Malte 350ml', 'brahma-duplo-malte-350ml', 'Cerveja Brahma Duplo Malte lata 350ml', '🍺', 4.49, cervejas, true, now_ts]),
    query(prodInsert, ['Heineken 330ml Long Neck', 'heineken-330ml-long-neck', 'Cerveja Heineken puro malte garrafa long neck 330ml', '🍺', 7.99, cervejas, true, now_ts]),
    query(prodInsert, ['Corona Extra 330ml', 'corona-extra-330ml', 'Cerveja Corona Extra long neck 330ml', '🍺', 8.49, cervejas, false, now_ts]),
    query(prodInsert, ['Budweiser 330ml', 'budweiser-330ml', 'Cerveja Budweiser American lager 330ml', '🍺', 5.99, cervejas, false, now_ts]),
    query(prodInsert, ['Skol Lata 350ml', 'skol-lata-350ml', 'Cerveja Skol pilsen lata 350ml', '🍺', 3.49, cervejas, false, now_ts]),
    query(prodInsert, ['Stella Artois 275ml', 'stella-artois-275ml', 'Cerveja Stella Artois premium lager 275ml', '🍺', 6.99, cervejas, false, now_ts]),
    query(prodInsert, ['Spaten Puro Malte 350ml', 'spaten-puro-malte-350ml', 'Cerveja Spaten puro malte lata 350ml', '🍺', 4.99, cervejas, false, now_ts]),
  ]);

  // ── Vinhos ──
  await Promise.all([
    query(prodInsert, ['Casillero del Diablo Cabernet 750ml', 'casillero-cabernet-750ml', 'Vinho tinto chileno Casillero del Diablo Cabernet Sauvignon 750ml', '🍷', 49.90, vinhos, true, now_ts]),
    query(prodInsert, ['Santa Helena Reservado Merlot 750ml', 'santa-helena-merlot-750ml', 'Vinho tinto chileno Santa Helena Reservado Merlot 750ml', '🍷', 34.90, vinhos, false, now_ts]),
    query(prodInsert, ['Periquita Tinto 750ml', 'periquita-tinto-750ml', 'Vinho tinto portugues Periquita 750ml', '🍷', 44.90, vinhos, false, now_ts]),
    query(prodInsert, ['Trapiche Malbec 750ml', 'trapiche-malbec-750ml', 'Vinho tinto argentino Trapiche Malbec 750ml', '🍷', 39.90, vinhos, false, now_ts]),
    query(prodInsert, ['Almaden Branco Suave 750ml', 'almaden-branco-suave-750ml', 'Vinho branco suave Almaden Miolo 750ml', '🥂', 24.90, vinhos, false, now_ts]),
  ]);

  // ── Whisky ──
  await Promise.all([
    query(prodInsert, ['Johnnie Walker Red Label 750ml', 'johnnie-walker-red-label-750ml', 'Whisky Johnnie Walker Red Label garrafa 750ml', '🥃', 89.90, whisky, true, now_ts]),
    query(prodInsert, ['Johnnie Walker Black Label 750ml', 'johnnie-walker-black-label-750ml', 'Whisky Johnnie Walker Black Label 12 anos garrafa 750ml', '🥃', 159.90, whisky, false, now_ts]),
    query(prodInsert, ['Jack Daniels Old No.7 750ml', 'jack-daniels-old-no7-750ml', 'Whisky Jack Daniels Tennessee garrafa 750ml', '🥃', 139.90, whisky, false, now_ts]),
    query(prodInsert, ['Chivas Regal 12 anos 750ml', 'chivas-regal-12-anos-750ml', 'Whisky Chivas Regal 12 anos blended scotch 750ml', '🥃', 179.90, whisky, false, now_ts]),
    query(prodInsert, ['White Horse 750ml', 'white-horse-750ml', 'Whisky White Horse blended scotch 750ml', '🥃', 59.90, whisky, false, now_ts]),
    query(prodInsert, ['Jim Beam Bourbon 750ml', 'jim-beam-bourbon-750ml', 'Whisky Jim Beam Kentucky Straight Bourbon 750ml', '🥃', 99.90, whisky, false, now_ts]),
  ]);

  // ── Gin ──
  const ginProds = await Promise.all([
    query(prodInsert, ['Tanqueray London Dry 750ml', 'tanqueray-london-dry-750ml', 'Gin Tanqueray London Dry garrafa 750ml', '🍸', 109.90, gin, true, now_ts]),
    query(prodInsert, ['Beefeater London Dry 750ml', 'beefeater-london-dry-750ml', 'Gin Beefeater London Dry garrafa 750ml', '🍸', 89.90, gin, false, now_ts]),
    query(prodInsert, ['Bombay Sapphire 750ml', 'bombay-sapphire-750ml', 'Gin Bombay Sapphire garrafa 750ml', '🍸', 119.90, gin, false, now_ts]),
    query(prodInsert, ['Gordons London Dry 750ml', 'gordons-london-dry-750ml', 'Gin Gordons London Dry garrafa 750ml', '🍸', 69.90, gin, false, now_ts]),
    query(prodInsert, ['Hendricks 700ml', 'hendricks-700ml', 'Gin Hendricks com pepino e rosa garrafa 700ml', '🍸', 189.90, gin, false, now_ts]),
  ]);

  // ── Destilados (Vodka + Tequila + Rum + Cachaca) ──
  const destiladosProds = await Promise.all([
    query(prodInsert, ['Absolut Original 750ml', 'absolut-original-750ml', 'Vodka Absolut Original sueca garrafa 750ml', '🍹', 79.90, destilados, true, now_ts]),
    query(prodInsert, ['Smirnoff 998ml', 'smirnoff-998ml', 'Vodka Smirnoff garrafa 998ml', '🍹', 34.90, destilados, false, now_ts]),
    query(prodInsert, ['Grey Goose 750ml', 'grey-goose-750ml', 'Vodka Grey Goose francesa premium garrafa 750ml', '🍹', 189.90, destilados, false, now_ts]),
    query(prodInsert, ['Ciroc 750ml', 'ciroc-750ml', 'Vodka Ciroc francesa destilada de uvas 750ml', '🍹', 149.90, destilados, false, now_ts]),
    query(prodInsert, ['Skyy 980ml', 'skyy-980ml', 'Vodka Skyy americana garrafa 980ml', '🍹', 44.90, destilados, false, now_ts]),
    query(prodInsert, ['Jose Cuervo Especial 750ml', 'jose-cuervo-especial-750ml', 'Tequila Jose Cuervo Especial Gold 750ml', '🌵', 99.90, destilados, false, now_ts]),
    query(prodInsert, ['Bacardi Carta Branca 980ml', 'bacardi-carta-branca-980ml', 'Rum Bacardi Carta Branca garrafa 980ml', '🏴‍☠️', 49.90, destilados, false, now_ts]),
    query(prodInsert, ['Cachaca 51 965ml', 'cachaca-51-965ml', 'Cachaca 51 Pirassununga garrafa 965ml', '🇧🇷', 12.90, destilados, false, now_ts]),
  ]);

  // ── Refrigerantes ──
  await Promise.all([
    query(prodInsert, ['Coca-Cola Lata 350ml', 'coca-cola-lata-350ml', 'Refrigerante Coca-Cola original lata 350ml', '🥤', 4.99, refrigerantes, false, now_ts]),
    query(prodInsert, ['Guarana Antarctica 350ml', 'guarana-antarctica-350ml', 'Refrigerante Guarana Antarctica lata 350ml', '🥤', 3.99, refrigerantes, false, now_ts]),
    query(prodInsert, ['Coca-Cola 2L', 'coca-cola-2l', 'Refrigerante Coca-Cola original garrafa 2 litros', '🥤', 10.99, refrigerantes, true, now_ts]),
    query(prodInsert, ['Agua Mineral Crystal 500ml', 'agua-mineral-crystal-500ml', 'Agua mineral sem gas Crystal 500ml', '💧', 2.49, refrigerantes, false, now_ts]),
    query(prodInsert, ['Coca-Cola Zero 350ml', 'coca-cola-zero-350ml', 'Refrigerante Coca-Cola Zero acucar lata 350ml', '🥤', 4.99, refrigerantes, false, now_ts]),
    query(prodInsert, ['Schweppes Tonica 350ml', 'schweppes-tonica-350ml', 'Agua tonica Schweppes lata 350ml', '🫧', 4.49, refrigerantes, false, now_ts]),
  ]);

  // ── Energeticos ──
  await Promise.all([
    query(prodInsert, ['Red Bull Energy 250ml', 'red-bull-energy-250ml', 'Energetico Red Bull lata 250ml', '⚡', 12.99, energeticos, true, now_ts]),
    query(prodInsert, ['Monster Energy 473ml', 'monster-energy-473ml', 'Energetico Monster Energy lata 473ml', '⚡', 9.99, energeticos, false, now_ts]),
    query(prodInsert, ['Red Bull Tropical 250ml', 'red-bull-tropical-250ml', 'Energetico Red Bull Tropical Edition lata 250ml', '⚡', 13.99, energeticos, false, now_ts]),
    query(prodInsert, ['Monster Mango Loco 473ml', 'monster-mango-loco-473ml', 'Energetico Monster Mango Loco lata 473ml', '⚡', 9.99, energeticos, false, now_ts]),
    query(prodInsert, ['TNT Energy 473ml', 'tnt-energy-473ml', 'Energetico TNT lata 473ml', '⚡', 6.99, energeticos, false, now_ts]),
  ]);

  // ── Gelos ──
  await Promise.all([
    query(prodInsert, ['Gelo Cristal 5kg', 'gelo-cristal-5kg', 'Saco de gelo cristal 5kg', '🧊', 12.90, gelos, true, now_ts]),
    query(prodInsert, ['Gelo de Coco IceFruty', 'gelo-coco-icefruty', 'Gelo de sabor agua de coco IceFruty', '🥥', 8.90, gelos, false, now_ts]),
    query(prodInsert, ['Gelo de Morango IceFruty', 'gelo-morango-icefruty', 'Gelo de sabor morango IceFruty', '🍓', 8.90, gelos, false, now_ts]),
    query(prodInsert, ['Gelo de Limao IceFruty', 'gelo-limao-icefruty', 'Gelo de sabor limao IceFruty', '🍋', 8.90, gelos, false, now_ts]),
    query(prodInsert, ['Gelo de Maracuja IceFruty', 'gelo-maracuja-icefruty', 'Gelo de sabor maracuja IceFruty', '🥭', 8.90, gelos, false, now_ts]),
    query(prodInsert, ['Gelo Cubos Premium 2kg', 'gelo-cubos-premium-2kg', 'Gelo em cubos premium saco 2kg', '🧊', 9.90, gelos, false, now_ts]),
  ]);

  // ── Tabacos & Cigarros ──
  await Promise.all([
    query(prodInsert, ['Marlboro Red Box', 'marlboro-red-box', 'Cigarro Marlboro Red Box maco', '🚬', 14.50, tabacos, true, now_ts]),
    query(prodInsert, ['Dunhill Carlton', 'dunhill-carlton', 'Cigarro Dunhill Carlton maco', '🚬', 12.90, tabacos, false, now_ts]),
    query(prodInsert, ['Rothmans Blue', 'rothmans-blue', 'Cigarro Rothmans Blue maco', '🚬', 9.90, tabacos, false, now_ts]),
    query(prodInsert, ['Tabaco Amsterdam 25g', 'tabaco-amsterdam-25g', 'Tabaco para enrolar Amsterdam Original 25g', '🍂', 19.90, tabacos, false, now_ts]),
    query(prodInsert, ['Tabaco Acrema Natural 25g', 'tabaco-acrema-natural-25g', 'Tabaco Acrema Natural para enrolar 25g', '🍂', 14.90, tabacos, false, now_ts]),
  ]);

  // ── Essencias (Narguile) ──
  await Promise.all([
    query(prodInsert, ['Essencia Zomo Mint 50g', 'essencia-zomo-mint-50g', 'Essencia para narguile Zomo sabor Mint 50g', '💨', 14.90, essencias, true, now_ts]),
    query(prodInsert, ['Essencia Zomo Tropical 50g', 'essencia-zomo-tropical-50g', 'Essencia para narguile Zomo sabor Tropical 50g', '💨', 14.90, essencias, false, now_ts]),
    query(prodInsert, ['Carvao de Narguile 1kg', 'carvao-narguile-1kg', 'Carvao para narguile hexagonal 1kg', '🔥', 19.90, essencias, false, now_ts]),
    query(prodInsert, ['Papel Aluminio Narguile', 'papel-aluminio-narguile', 'Rolo de papel aluminio para narguile', '🔲', 6.90, essencias, false, now_ts]),
    query(prodInsert, ['Essencia Adalya Love 66 50g', 'essencia-adalya-love66-50g', 'Essencia para narguile Adalya Love 66 50g', '💨', 16.90, essencias, false, now_ts]),
  ]);

  // ── Sedas ──
  await Promise.all([
    query(prodInsert, ['Seda Smoking Brown KS', 'seda-smoking-brown-ks', 'Seda Smoking Brown King Size slim', '📜', 4.90, sedas, true, now_ts]),
    query(prodInsert, ['Seda Elements KS', 'seda-elements-ks', 'Seda Elements King Size slim ultrafina', '📜', 5.90, sedas, false, now_ts]),
    query(prodInsert, ['Seda Zomo Perfect Roll', 'seda-zomo-perfect-roll', 'Seda Zomo Perfect Roll King Size', '📜', 3.90, sedas, false, now_ts]),
    query(prodInsert, ['Seda PayPay GoGreen KS', 'seda-paypay-gogreen-ks', 'Seda PayPay GoGreen King Size ecologica', '📜', 4.50, sedas, false, now_ts]),
    query(prodInsert, ['Piteira Papelito Glass', 'piteira-papelito-glass', 'Piteira de vidro Papelito Glass', '🔧', 12.90, sedas, false, now_ts]),
  ]);

  // ── Combos ──
  await Promise.all([
    query(prodInsert, ['Combo Gin Tanqueray + 4 Tonicas', 'combo-gin-tanqueray-tonicas', 'Gin Tanqueray 750ml + 4 Schweppes Tonica 350ml', '🎁', 119.90, combos, true, now_ts]),
    query(prodInsert, ['Combo Whisky JW Red + Coca 2L', 'combo-jw-red-coca', 'Johnnie Walker Red 750ml + Coca-Cola 2L', '🎁', 94.90, combos, false, now_ts]),
    query(prodInsert, ['Combo Heineken Pack 12un', 'combo-heineken-pack-12', 'Pack com 12 Heineken Long Neck 330ml', '🍺', 79.90, combos, false, now_ts]),
    query(prodInsert, ['Combo Absolut + Red Bull 4un', 'combo-absolut-redbull', 'Absolut Original 750ml + 4 Red Bull 250ml', '🎁', 119.90, combos, false, now_ts]),
  ]);

  // ── Chocolates ──
  await Promise.all([
    query(prodInsert, ['Ferrero Rocher 8un', 'ferrero-rocher-8un', 'Bombom Ferrero Rocher caixa com 8 unidades', '🍫', 29.90, chocolates, true, now_ts]),
    query(prodInsert, ['Trufas Cacau Show 200g', 'trufas-cacau-show-200g', 'Caixa de trufas Cacau Show sortidas 200g', '🍫', 24.90, chocolates, false, now_ts]),
    query(prodInsert, ['Barra Lindt 70% Cacau 100g', 'barra-lindt-70-100g', 'Chocolate Lindt Excellence 70% cacau barra 100g', '🍫', 34.90, chocolates, false, now_ts]),
    query(prodInsert, ['Lacta Laka 90g', 'lacta-laka-90g', 'Chocolate branco Lacta Laka barra 90g', '🍫', 8.90, chocolates, false, now_ts]),
    query(prodInsert, ['Lacta Diamante Negro 90g', 'lacta-diamante-negro-90g', 'Chocolate Lacta Diamante Negro barra 90g', '🍫', 8.90, chocolates, false, now_ts]),
  ]);

  // ══════════════════════════════════════
  //  PROMOTIONS
  // ══════════════════════════════════════
  const now = new Date().toISOString();
  const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const heinekenId = cervejasProds[1][0].id;
  const tanquerayId = ginProds[0][0].id;
  const absolutId = destiladosProds[0][0].id;

  await Promise.all([
    query(`INSERT INTO promotions (title, description, "productId", "discountPercent", "startsAt", "endsAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      ['Heineken com 15% OFF', 'Aproveite a Heineken long neck com desconto especial!', heinekenId, 15, now, thirtyDays, now_ts]),
    query(`INSERT INTO promotions (title, description, "productId", "discountPercent", "startsAt", "endsAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      ['Tanqueray em promocao', 'Gin Tanqueray com 10% de desconto por tempo limitado', tanquerayId, 10, now, thirtyDays, now_ts]),
    query(`INSERT INTO promotions (title, description, "productId", "discountPercent", "startsAt", "endsAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      ['Absolut com desconto', 'Vodka Absolut Original com 12% OFF', absolutId, 12, now, thirtyDays, now_ts]),
  ]);

  // ══════════════════════════════════════
  //  ADMIN USER
  // ══════════════════════════════════════
  const adminPasswordHash = await bcrypt.hash('admin123', 12);
  await query(
    `INSERT INTO admins (name, email, "passwordHash", role, "updatedAt") VALUES ($1,$2,$3,$4,$5)`,
    ['Allef', 'admin@adega4amigos.com', adminPasswordHash, 'owner', now_ts]
  );

  // Count products per category
  const counts = await query(`
    SELECT c.name, COUNT(p.id) as total
    FROM categories c
    LEFT JOIN products p ON p."categoryId" = c.id
    GROUP BY c.id, c.name
    ORDER BY c."order"
  `);

  const totalProducts = counts.reduce((sum, c) => sum + parseInt(c.total), 0);

  console.log('\nSeed completed successfully!');
  console.log(`- 13 categories created`);
  console.log(`- ${totalProducts} products created`);
  console.log('- 3 promotions created');
  console.log('\nProducts per category:');
  counts.forEach(c => console.log(`  ${c.name}: ${c.total}`));
}

main()
  .then(async () => {
    await pool.end();
  })
  .catch(async (e) => {
    console.error('Seed failed:', e);
    await pool.end();
    process.exit(1);
  });

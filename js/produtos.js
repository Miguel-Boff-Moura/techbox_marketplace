// =========================================================
// Lista de produtos da loja
// Obs: só o iPhone 17 Pro pode ser comprado (disponivel: true).
// Os outros aparecem nas vitrines, mas mostram um aviso.
// =========================================================

const produtos = [
    // ---------- SMARTPHONES ----------
    {
        id: 'iphone17',
        nome: 'iPhone 17 Pro',
        categoria: 'smartphones',
        specs: 'Chip A19 Pro • 12 GB • 512 GB',
        preco: 8324,
        precoAntigo: 11499,
        selo: '−8%',
        nota: '4,9',
        imagem: 'produtos/iphone-17-pro.png',
        imagemExplorar: 'produtos/iphone-17-pro-cores.png',
        ram: 12,
        lancamento: true,
        disponivel: true
    },
    {
        id: 'galaxy-s25',
        nome: 'Samsung Galaxy S25',
        categoria: 'smartphones',
        specs: 'Snapdragon 8 Elite • 12 GB • 256 GB',
        preco: 3799,
        precoAntigo: 4499,
        selo: 'Oferta',
        nota: '4,8',
        imagem: 'produtos/galaxy-s25.png',
        ram: 12,
        lancamento: true
    },
    {
        id: 'galaxy-s24-ultra',
        nome: 'Samsung Galaxy S24 Ultra',
        categoria: 'smartphones',
        specs: 'Snapdragon 8 Gen 3 • 12 GB • 512 GB',
        preco: 3899,
        nota: '4,7',
        imagem: 'produtos/galaxy-s24-ultra.png',
        ram: 12
    },
    {
        id: 'poco-x8',
        nome: 'POCO X8 Pro',
        categoria: 'smartphones',
        specs: 'Dimensity 8500 • 8 GB • 256 GB',
        preco: 2399,
        precoAntigo: 2549,
        selo: '−6%',
        nota: '4,9',
        imagem: 'produtos/poco-x8-pro.png',
        ram: 8
    },
    {
        id: 'iphone13',
        nome: 'iPhone 13',
        categoria: 'smartphones',
        specs: 'Chip A15 Bionic • 4 GB • 128 GB',
        preco: 2199,
        nota: '4,6',
        imagem: 'produtos/iphone-13.png',
        ram: 4
    },
    {
        id: 'galaxy-s25-fe',
        nome: 'Galaxy S25 FE',
        categoria: 'smartphones',
        specs: 'Exynos 2400 • 8 GB • 256 GB',
        preco: 3699,
        precoAntigo: 3979,
        selo: '−7%',
        nota: '4,8',
        imagem: 'produtos/galaxy-s25-fe.png',
        ram: 8
    },
    {
        id: 'pixel9',
        nome: 'Pixel 9 Pro',
        categoria: 'smartphones',
        specs: 'Tensor G4 • 16 GB • 256 GB',
        preco: 1099,
        precoAntigo: 1199,
        moeda: 'US$',
        parcelas: 'em 10x US$ 109,90 sem juros',
        selo: '−6%',
        nota: '4,9',
        imagem: 'produtos/pixel-9-pro.png',
        cobrir: true,
        ram: 16
    },
    {
        id: 'iphone18',
        nome: 'iPhone 18 Pro',
        categoria: 'smartphones',
        specs: 'Chip A20 Pro • 512 GB • Tela 6,3"',
        preco: 13499,
        precoAntigo: 14499,
        selo: 'Oferta',
        nota: '4,8',
        imagem: 'produtos/iphone-18-pro.png',
        ram: 12,
        lancamento: true
    },
    {
        id: 'xiaomi17',
        nome: 'Xiaomi 17 Pro',
        categoria: 'smartphones',
        specs: 'Dimensity 8400 Ultra • 12 GB • 256 GB',
        preco: 3399,
        precoAntigo: 3599,
        selo: '−6%',
        nota: '4,9',
        imagem: 'produtos/xiaomi-17-pro.png',
        ram: 12,
        lancamento: true
    },
    {
        id: 'galaxy-s24',
        nome: 'Galaxy S24 Ultra',
        categoria: 'smartphones',
        specs: 'Snapdragon 8 Gen 3 • 12 GB • 256 GB',
        preco: 4999,
        precoAntigo: 5399,
        selo: '−8%',
        nota: '4,9',
        imagem: 'produtos/galaxy-s24.jpg',
        ram: 12
    },
    {
        id: 'poco-f7',
        nome: 'POCO F7',
        categoria: 'smartphones',
        specs: 'Snapdragon 8s Gen 4 • 12 GB • 256 GB',
        preco: 2649,
        precoAntigo: 2799,
        selo: 'Oferta',
        nota: '4,8',
        imagem: 'produtos/poco-f7.png',
        ram: 12
    },

    // ---------- NOTEBOOKS ----------
    {
        id: 'nitro-v16',
        nome: 'Acer Nitro V16',
        categoria: 'notebooks',
        specs: 'RTX 5050 • 16 GB DDR5 • Tela 16"',
        preco: 9899,
        precoAntigo: 10499,
        selo: '−6%',
        nota: '4,9',
        imagem: 'produtos/acer-nitro-v16.png',
        cobrir: true,
        ram: 16,
        uso: ['jogos'],
        lancamento: true
    },
    {
        id: 'asus-tuf',
        nome: 'ASUS TUF Gaming F16',
        categoria: 'notebooks',
        specs: 'Core 5 210H • RTX 4050 • 16 GB • 512 GB',
        preco: 7379,
        precoAntigo: 7999,
        selo: '−8%',
        nota: '4,9',
        imagem: 'produtos/asus-tuf.png',
        imagemExplorar: 'produtos/asus-tuf-2.png',
        ram: 16,
        uso: ['jogos']
    },
    {
        id: 'galaxy-book4',
        nome: 'Galaxy Book4 360',
        categoria: 'notebooks',
        specs: 'Core 5 120U • 16 GB • SSD 1 TB',
        preco: 4588,
        nota: '4,7',
        imagem: 'produtos/galaxy-book4.jpg',
        cobrir: true,
        ram: 16,
        uso: ['trabalho', 'portabilidade']
    },
    {
        id: 'zenbook',
        nome: 'ASUS Zenbook S 14',
        categoria: 'notebooks',
        specs: 'Core Ultra 7 256V • 16 GB • SSD 1 TB',
        preco: 6969,
        precoAntigo: 7399,
        selo: '−6%',
        nota: '4,9',
        imagem: 'produtos/zenbook-s14.jpg',
        cobrir: true,
        ram: 16,
        uso: ['trabalho', 'portabilidade']
    },
    {
        id: 'macbook',
        nome: 'MacBook Pro 14" M5',
        categoria: 'notebooks',
        specs: 'Apple M5 • 32 GB • SSD 1 TB',
        preco: 14900,
        precoAntigo: 16000,
        selo: 'Oferta',
        nota: '4,6',
        imagem: 'produtos/macbook-pro.png',
        ram: 32,
        uso: ['criacao', 'trabalho'],
        lancamento: true
    },
    {
        id: 'rog-strix',
        nome: 'ASUS ROG Strix G16',
        categoria: 'notebooks',
        specs: 'i9-14900HX • RTX 5060 • 16 GB • 512 GB',
        preco: 15999,
        precoAntigo: 17199,
        selo: '−7%',
        nota: '4,8',
        imagem: 'produtos/asus-rog-strix.png',
        cobrir: true,
        ram: 16,
        uso: ['jogos', 'criacao']
    },
    {
        id: 'nitro-v15',
        nome: 'Acer Nitro V15',
        categoria: 'notebooks',
        specs: 'R7 7735HS • RTX 4050 • 16 GB • 512 GB',
        preco: 5699,
        precoAntigo: 6099,
        selo: 'Oferta',
        nota: '4,8',
        imagem: 'produtos/acer-nitro-v15.png',
        cobrir: true,
        ram: 16,
        uso: ['jogos']
    },
    {
        id: 'lenovo-loq',
        nome: 'Lenovo LOQ 15',
        categoria: 'notebooks',
        specs: 'i5-12450HX • RTX 3050 • 16 GB • 512 GB',
        preco: 5995,
        precoAntigo: 6499,
        selo: '−8%',
        nota: '4,9',
        imagem: 'produtos/lenovo-loq.jpg',
        cobrir: true,
        ram: 16,
        uso: ['jogos', 'trabalho']
    }
];

// Dados extras do produto que tem página de detalhe (iPhone 17 Pro)
const iphone17Detalhe = {
    id: 'iphone17',
    nomeCompleto: 'iPhone 17 Pro 512 GB',
    descricao: 'O Smartphone mais tecnológico do mercado pode ser seu! Consulte nossas ofertas para garantir o melhor preço.',
    avaliacoes: 184,
    galeria: [
        'produtos/iphone17/galeria-1.png',
        'produtos/iphone17/galeria-2.png',
        'produtos/iphone17/galeria-3.png',
        'produtos/iphone17/galeria-4.png',
        'produtos/iphone17/galeria-5.png'
    ],
    cores: [
        { nome: 'Laranja Cósmico', hex: '#f49354' },
        { nome: 'Prata', hex: '#dfe3ea' },
        { nome: 'Azul Profundo', hex: '#1f2f4d' }
    ],
    destaques: ['12 GB de RAM', 'Chip integrado e eSIM', 'Proteção Ceramic Shield', '512 GB de armazenamento'],
    especificacoes: [
        ['Processador', 'Apple A19 Pro'],
        ['Memória', '12 GB'],
        ['Armazenamento', '512 GB'],
        ['Corpo', 'Alumínio e tela com ceramic shield'],
        ['Gráficos', 'Chip Apple A19 Pro'],
        ['Peso', 'Aproximadamente 200 g']
    ]
};

// procura um produto pelo id
function buscarProduto(id) {
    return produtos.find(function (p) {
        return p.id === id;
    });
}

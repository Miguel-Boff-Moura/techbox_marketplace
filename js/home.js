// =========================================================
// Home - monta as vitrines de produtos
// =========================================================

// ordem dos produtos igual ao figma
const idsDestaque = ['asus-tuf', 'nitro-v15', 'galaxy-book4', 'pixel9', 'lenovo-loq', 'iphone18',
    'macbook', 'xiaomi17', 'galaxy-s24', 'poco-f7', 'zenbook', 'nitro-v16'];

// no mobile esses ficam no carrossel "Ofertas do dia", então somem da grade
const idsOfertasDoDia = ['nitro-v15', 'pixel9', 'iphone18', 'xiaomi17', 'poco-f7'];
const idsSoDesktop = ['nitro-v15', 'pixel9', 'iphone18', 'xiaomi17', 'zenbook', 'nitro-v16'];

const grade = document.querySelector('#grade-destaques');
mostrarProdutos(grade, idsDestaque.map(buscarProduto));

// esconde no mobile os cards que já aparecem no carrossel
grade.querySelectorAll('.card-produto').forEach(function (card) {
    if (idsSoDesktop.includes(card.dataset.id)) {
        card.classList.add('ocultar-mobile');
    }
});

mostrarProdutos(document.querySelector('#carrossel-ofertas'), idsOfertasDoDia.map(buscarProduto));

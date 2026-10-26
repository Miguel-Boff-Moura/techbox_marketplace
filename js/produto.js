// =========================================================
// Página do produto (iPhone 17 Pro)
// galeria, cores, quantidade, abas e botão de comprar
// =========================================================

const produtoAtual = buscarProduto('iphone17');
const detalhe = iphone17Detalhe;

let fotoAtual = 0;
let corAtual = 0;
let quantidade = 1;

// ---------- galeria ----------
const miniaturas = document.querySelector('#miniaturas');
const fotoPrincipal = document.querySelector('#foto-principal');

detalhe.galeria.forEach(function (foto, indice) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'miniatura' + (indice === 0 ? ' ativa' : '');
    botao.setAttribute('aria-label', 'Foto ' + (indice + 1));
    botao.innerHTML = `<img src="../img/${foto}" alt="">`;
    botao.addEventListener('click', function () {
        trocarFoto(indice);
    });
    miniaturas.appendChild(botao);
});

function trocarFoto(indice) {
    fotoAtual = indice;
    fotoPrincipal.src = '../img/' + detalhe.galeria[indice];
    document.querySelectorAll('.miniatura').forEach(function (mini, i) {
        mini.classList.toggle('ativa', i === indice);
    });
    document.querySelector('#contador-fotos').textContent = (indice + 1) + '/' + detalhe.galeria.length;
}

// zoom (botão ampliar ou clique na foto)
function abrirZoom() {
    document.querySelector('#foto-zoom').src = fotoPrincipal.src;
    abrirModal(document.querySelector('#modal-zoom'));
}

document.querySelector('#btn-ampliar').addEventListener('click', abrirZoom);
fotoPrincipal.addEventListener('click', abrirZoom);

// arrastar a foto para o lado no celular
let toqueInicio = 0;
fotoPrincipal.addEventListener('touchstart', function (evento) {
    toqueInicio = evento.touches[0].clientX;
});
fotoPrincipal.addEventListener('touchend', function (evento) {
    const diferenca = evento.changedTouches[0].clientX - toqueInicio;
    if (Math.abs(diferenca) < 40) return;
    const total = detalhe.galeria.length;
    trocarFoto(diferenca < 0 ? (fotoAtual + 1) % total : (fotoAtual - 1 + total) % total);
});

document.querySelector('#btn-favoritar').addEventListener('click', function () {
    this.classList.toggle('favorito');
    mostrarToast(this.classList.contains('favorito') ? 'Adicionado aos favoritos' : 'Removido dos favoritos', '');
});

// ---------- cores ----------
const areaCores = document.querySelector('#cores');

detalhe.cores.forEach(function (cor, indice) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'cor' + (indice === 0 ? ' ativa' : '');
    botao.title = cor.nome;
    botao.setAttribute('aria-label', 'Cor ' + cor.nome);
    botao.innerHTML = `<span style="background: ${cor.hex}"></span>`;
    botao.addEventListener('click', function () {
        corAtual = indice;
        document.querySelectorAll('.cor').forEach(function (b, i) {
            b.classList.toggle('ativa', i === indice);
        });
        document.querySelectorAll('.js-nome-cor').forEach(function (texto) {
            texto.textContent = cor.nome;
        });
    });
    areaCores.appendChild(botao);
});

// ---------- quantidade ----------
function mostrarQuantidade() {
    document.querySelectorAll('.js-qtd').forEach(function (campo) {
        campo.textContent = quantidade;
    });
}

document.querySelectorAll('.js-menos').forEach(function (botao) {
    botao.addEventListener('click', function () {
        if (quantidade > 1) quantidade--;
        mostrarQuantidade();
    });
});

document.querySelectorAll('.js-mais').forEach(function (botao) {
    botao.addEventListener('click', function () {
        if (quantidade < 10) {
            quantidade++;
        } else {
            mostrarToast('Limite atingido', 'Você pode comprar até 10 unidades.', 'aviso');
        }
        mostrarQuantidade();
    });
});

// ---------- comprar ----------
document.querySelectorAll('.js-adicionar-produto').forEach(function (botao) {
    botao.addEventListener('click', function () {
        adicionarAoCarrinho(produtoAtual.id, detalhe.cores[corAtual].nome, quantidade);
        mostrarProdutoAdicionado(produtoAtual, quantidade);
    });
});

document.querySelector('#comprar-agora').addEventListener('click', function () {
    adicionarAoCarrinho(produtoAtual.id, detalhe.cores[corAtual].nome, quantidade);
    location.href = 'carrinho.html';
});

// ---------- abas de detalhes ----------
let tabela = '';
detalhe.especificacoes.forEach(function (linha) {
    tabela += `<div class="tabela__linha"><span>${linha[0]}</span><strong>${linha[1]}</strong></div>`;
});
document.querySelector('#tabela-specs').innerHTML = tabela;

const comentarios = [
    ['Mariana S.', '5', 'Chegou antes do prazo e muito bem embalado. A câmera é incrível!'],
    ['Pedro H.', '5', 'Bateria dura o dia inteiro, mesmo jogando. Recomendo a TechBox.'],
    ['Juliana R.', '4', 'Celular excelente, só achei a cor laranja mais clara do que na foto.']
];

let htmlComentarios = '';
comentarios.forEach(function (c) {
    htmlComentarios += `
        <div class="comentario">
            <div class="comentario__topo"><strong>${c[0]}</strong><span>${'★'.repeat(Number(c[1]))}${'☆'.repeat(5 - Number(c[1]))}</span></div>
            <p>${c[2]}</p>
        </div>`;
});
document.querySelector('#lista-avaliacoes').innerHTML = htmlComentarios;

function abrirAba(nome) {
    document.querySelectorAll('.detalhes__abas button').forEach(function (botao) {
        botao.classList.toggle('ativa', botao.dataset.aba === nome);
    });
    document.querySelectorAll('.detalhes__painel').forEach(function (painel) {
        painel.classList.toggle('escondido', painel.id !== 'painel-' + nome);
    });
}

document.querySelectorAll('.detalhes__abas button').forEach(function (botao) {
    botao.addEventListener('click', function () {
        abrirAba(botao.dataset.aba);
    });
});

document.querySelector('.js-ver-avaliacoes').addEventListener('click', function () {
    abrirAba('avaliacoes');
});

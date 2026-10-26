// =========================================================
// Catálogo - lista os produtos com filtros, ordenação e páginas
// Funciona para: ?categoria=notebooks | smartphones,
// ?busca=texto e ?ofertas=1 (sem nada mostra tudo)
// =========================================================

const categoria = parametroUrl('categoria');
const termoBusca = (parametroUrl('busca') || '').trim();
const soOfertas = parametroUrl('ofertas') === '1';

const POR_PAGINA = 6;
let paginaAtual = 1;
let quantidadeMobile = POR_PAGINA;

const textos = {
    notebooks: ['Notebooks', 'Encontre a configuração certa para sua rotina.'],
    smartphones: ['Smartphones', 'Encontre o seu smartphone dos sonhos']
};

// ---------- título da página ----------
let titulo = 'Catálogo completo';
let subtitulo = 'Todos os produtos da TechBox em um só lugar.';

if (textos[categoria]) {
    titulo = textos[categoria][0];
    subtitulo = textos[categoria][1];
} else if (termoBusca) {
    titulo = 'Resultados para "' + termoBusca + '"';
    subtitulo = 'Veja o que encontramos na TechBox.';
} else if (soOfertas) {
    titulo = 'Ofertas';
    subtitulo = 'Os melhores descontos da TechBox.';
}

document.querySelector('#titulo-catalogo').textContent = titulo;
document.querySelector('#subtitulo-catalogo').textContent = subtitulo;
document.querySelector('#trilha-atual').textContent = titulo;
document.title = 'TechBox | ' + titulo;

const tituloMobile = document.querySelector('.titulo-mobile h1');
if (tituloMobile) tituloMobile.textContent = textos[categoria] ? titulo : (termoBusca ? 'Busca' : titulo);

// ---------- monta os grupos de filtro ----------
const gruposFiltro = [
    {
        titulo: 'Disponibilidade',
        nome: 'disponibilidade',
        redondo: true,
        opcoes: [['estoque', 'Em estoque', true], ['lancamento', 'Lançamentos']]
    }
];

if (categoria === 'notebooks') {
    gruposFiltro.push({
        titulo: 'Uso ideal',
        nome: 'uso',
        opcoes: [['trabalho', 'Trabalho e estudo'], ['criacao', 'Criação'], ['jogos', 'Jogos'], ['portabilidade', 'Portabilidade']]
    });
    gruposFiltro.push({
        titulo: 'Memória RAM',
        nome: 'ram',
        opcoes: [['8', '8 GB'], ['16', '16 GB'], ['32', '32 GB ou mais']]
    });
} else if (categoria === 'smartphones') {
    gruposFiltro.push({
        titulo: 'Memória RAM',
        nome: 'ram',
        opcoes: [['6', '6 GB ou menos'], ['8', '8 GB'], ['12', '12 GB ou mais']]
    });
}

// limites do slider de preço
const PRECO_MIN = 0;
const PRECO_MAX = 25000;

function montarFiltros() {
    let html = '';

    gruposFiltro.forEach(function (grupo) {
        let opcoes = '';
        grupo.opcoes.forEach(function (opcao) {
            opcoes += `
                <label class="caixa-selecao ${grupo.redondo ? 'redonda' : ''}">
                    <input type="checkbox" name="${grupo.nome}" value="${opcao[0]}" ${opcao[2] ? 'checked' : ''}>
                    ${opcao[1]}
                </label>`;
        });

        html += `
            <div class="grupo-filtro">
                <h3>${grupo.titulo}</h3>
                <div class="grupo-filtro__opcoes">${opcoes}</div>
            </div>`;
    });

    html += `
        <div class="grupo-filtro">
            <h3>Faixa de preço</h3>
            <div class="faixa">
                <div class="faixa__trilho"><div class="faixa__ativa" id="faixa-ativa"></div></div>
                <input type="range" id="preco-min" min="${PRECO_MIN}" max="${PRECO_MAX}" step="500" value="${PRECO_MIN}" aria-label="Preço mínimo">
                <input type="range" id="preco-max" min="${PRECO_MIN}" max="${PRECO_MAX}" step="500" value="${PRECO_MAX}" aria-label="Preço máximo">
            </div>
            <div class="faixa__valores">
                <span id="valor-min"></span>
                <span id="valor-max"></span>
            </div>
        </div>`;

    document.querySelector('#form-filtros').innerHTML = html;

    // chips rápidos do mobile (copiam as opções do filtro)
    const chips = document.querySelector('#chips');
    const opcoesRapidas = [['disponibilidade', 'estoque', 'Em estoque'], ['disponibilidade', 'lancamento', 'Lançamentos']];
    gruposFiltro.slice(1).forEach(function (grupo) {
        grupo.opcoes.forEach(function (opcao) {
            opcoesRapidas.push([grupo.nome, opcao[0], opcao[1]]);
        });
    });

    opcoesRapidas.forEach(function (opcao) {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'chip';
        botao.dataset.nome = opcao[0];
        botao.dataset.valor = opcao[1];
        botao.textContent = opcao[2];
        botao.addEventListener('click', function () {
            const caixa = campoFiltro(opcao[0], opcao[1]);
            caixa.checked = !caixa.checked;
            filtrosMudaram();
        });
        chips.appendChild(botao);
    });
}

function campoFiltro(nome, valor) {
    return document.querySelector(`#form-filtros input[name="${nome}"][value="${valor}"]`);
}

function valoresMarcados(nome) {
    const marcados = document.querySelectorAll(`#form-filtros input[name="${nome}"]:checked`);
    return Array.from(marcados).map(function (campo) {
        return campo.value;
    });
}

// ---------- aplica os filtros ----------
function produtosFiltrados() {
    let lista = produtos.slice();

    if (categoria === 'notebooks' || categoria === 'smartphones') {
        lista = lista.filter(function (p) {
            return p.categoria === categoria;
        });
    }

    if (soOfertas) {
        lista = lista.filter(function (p) {
            return p.precoAntigo;
        });
    }

    if (termoBusca) {
        const termo = termoBusca.toLowerCase();
        lista = lista.filter(function (p) {
            return (p.nome + ' ' + p.specs + ' ' + p.categoria).toLowerCase().includes(termo);
        });
    }

    // disponibilidade
    const disponibilidade = valoresMarcados('disponibilidade');
    if (disponibilidade.includes('lancamento')) {
        lista = lista.filter(function (p) {
            return p.lancamento;
        });
    }
    // (todos os produtos estão em estoque, então "Em estoque" não tira nenhum)

    // uso ideal
    const usos = valoresMarcados('uso');
    if (usos.length > 0) {
        lista = lista.filter(function (p) {
            return p.uso && p.uso.some(function (u) {
                return usos.includes(u);
            });
        });
    }

    // memória RAM
    const rams = valoresMarcados('ram');
    if (rams.length > 0) {
        lista = lista.filter(function (p) {
            return rams.some(function (r) {
                r = Number(r);
                if (categoria === 'smartphones') {
                    if (r === 6) return p.ram <= 6;
                    if (r === 12) return p.ram >= 12;
                }
                if (r === 32) return p.ram >= 32;
                return p.ram === r;
            });
        });
    }

    // faixa de preço
    const minimo = Number(document.querySelector('#preco-min').value);
    const maximo = Number(document.querySelector('#preco-max').value);
    lista = lista.filter(function (p) {
        return p.preco >= minimo && p.preco <= maximo;
    });

    // ordenação
    const ordem = document.querySelector('#ordenar').value;
    if (ordem === 'menor') {
        lista.sort(function (a, b) { return a.preco - b.preco; });
    } else if (ordem === 'maior') {
        lista.sort(function (a, b) { return b.preco - a.preco; });
    } else if (ordem === 'avaliados') {
        lista.sort(function (a, b) { return parseFloat(b.nota.replace(',', '.')) - parseFloat(a.nota.replace(',', '.')); });
    }

    return lista;
}

// ---------- mostra na tela ----------
function atualizarFaixa() {
    const campoMin = document.querySelector('#preco-min');
    const campoMax = document.querySelector('#preco-max');

    // não deixa o mínimo passar do máximo
    if (Number(campoMin.value) > Number(campoMax.value)) {
        campoMin.value = campoMax.value;
    }

    const inicio = (campoMin.value / PRECO_MAX) * 100;
    const fim = (campoMax.value / PRECO_MAX) * 100;
    const ativa = document.querySelector('#faixa-ativa');
    ativa.style.left = inicio + '%';
    ativa.style.width = (fim - inicio) + '%';

    document.querySelector('#valor-min').textContent = dinheiro(Number(campoMin.value));
    document.querySelector('#valor-max').textContent = dinheiro(Number(campoMax.value));
}

function mostrarCatalogo() {
    const lista = produtosFiltrados();
    const mobile = window.innerWidth <= 768;
    const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;

    let visiveis;
    if (mobile) {
        visiveis = lista.slice(0, quantidadeMobile);
    } else {
        const inicio = (paginaAtual - 1) * POR_PAGINA;
        visiveis = lista.slice(inicio, inicio + POR_PAGINA);
    }

    mostrarProdutos(document.querySelector('#grade-catalogo'), visiveis);

    const texto = lista.length === 1 ? '1 produto' : lista.length + ' produtos';
    document.querySelector('#total-produtos').textContent = texto;
    document.querySelector('#ver-produtos').textContent = 'Ver ' + texto;
    document.querySelector('#sem-resultados').classList.toggle('escondido', lista.length > 0);

    // paginação (desktop)
    let botoes = '';
    if (lista.length > POR_PAGINA) {
        for (let i = 1; i <= totalPaginas; i++) {
            botoes += `<button type="button" class="${i === paginaAtual ? 'ativa' : ''}" data-pagina="${i}">${i}</button>`;
        }
    }
    document.querySelector('#paginacao').innerHTML = botoes;

    // "ver mais" (mobile)
    document.querySelector('#mostrando').textContent = 'Mostrando ' + visiveis.length + ' de ' + lista.length;
    document.querySelector('#ver-mais').classList.toggle('escondido', lista.length === 0);
    document.querySelector('#btn-ver-mais').classList.toggle('escondido', visiveis.length >= lista.length);

    // deixa os chips iguais aos filtros marcados
    document.querySelectorAll('.chip[data-nome]').forEach(function (chip) {
        chip.classList.toggle('ativo', campoFiltro(chip.dataset.nome, chip.dataset.valor).checked);
    });
}

function filtrosMudaram() {
    paginaAtual = 1;
    quantidadeMobile = POR_PAGINA;
    atualizarFaixa();
    mostrarCatalogo();
}

function limparFiltros() {
    document.querySelectorAll('#form-filtros input[type="checkbox"]').forEach(function (campo) {
        campo.checked = campo.value === 'estoque';
    });
    document.querySelector('#preco-min').value = PRECO_MIN;
    document.querySelector('#preco-max').value = PRECO_MAX;
    filtrosMudaram();
}

// ---------- eventos ----------
montarFiltros();
atualizarFaixa();
mostrarCatalogo();

document.querySelector('#form-filtros').addEventListener('input', filtrosMudaram);
document.querySelector('#ordenar').addEventListener('change', filtrosMudaram);
document.querySelector('#limpar-filtros').addEventListener('click', limparFiltros);
document.querySelector('#limpar-busca').addEventListener('click', limparFiltros);

document.querySelector('#paginacao').addEventListener('click', function (evento) {
    const botao = evento.target.closest('button');
    if (!botao) return;
    paginaAtual = Number(botao.dataset.pagina);
    mostrarCatalogo();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.querySelector('#btn-ver-mais').addEventListener('click', function () {
    quantidadeMobile += POR_PAGINA;
    mostrarCatalogo();
});

// abrir e fechar a folha de filtros no mobile
function abrirFiltros() {
    document.body.classList.add('filtros-abertos');
    document.body.style.overflow = 'hidden';
}

function fecharFiltros() {
    document.body.classList.remove('filtros-abertos');
    document.body.style.overflow = '';
}

document.querySelector('#abrir-filtros').addEventListener('click', abrirFiltros);
document.querySelector('#fundo-filtros').addEventListener('click', fecharFiltros);
document.querySelector('#ver-produtos').addEventListener('click', fecharFiltros);

// se mudar o tamanho da tela, refaz a lista (paginação x ver mais)
let ultimoMobile = window.innerWidth <= 768;
window.addEventListener('resize', function () {
    const agoraMobile = window.innerWidth <= 768;
    if (agoraMobile !== ultimoMobile) {
        ultimoMobile = agoraMobile;
        mostrarCatalogo();
    }
});

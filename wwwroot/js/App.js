// Uso a API a apontar para o próprio servidor,
// logo não meto o link (http://localhost:5000).
// Se fosse outro servidor, teria que colocar aqui o link.
let api = new ApiPosts("");

////////////////////////////////////////////////////////////////////////////////////////////////////
// CRIAR PUBLICAÇÔES
////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById('criarPublicacao').onsubmit = async (evt) => {
    // Impedir que o browser submeta
    evt.preventDefault();
    try {

        let nome = document.getElementById('publicacao').value;

        // Para obter ficheiros, usa-se o 'files' (é um array) num <input type="file" />
        let foto = document.getElementById('foto').files[0];

        let novaPublicacao = await api.createPublicacao(nome, foto);

        // Mostrar a nova publicação no ecrã.
        let novoDivPost = criarDivPost(novaPublicacao);
        document.getElementById('publicacoes').appendChild(novoDivPost);

    } catch (e) {
        console.error("Erro ao criar a publicação", e);
        alert("Ocorreu um erro ao criar a publicação. Tente novamente.");
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// PESQUISA
////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById('pesquisaPublicacoesForm').onsubmit = async (evt) => {
    evt.preventDefault();

    let pesquisa = document.getElementById('pesquisaPublicacoes').value;

    try {
        let publicacoes = await api.getPublicacoes(pesquisa);
        mostraListaPublicacoes(publicacoes);
    } catch (e) {
        console.error("Erro ao pesquisar", e);
        alert("Ocorreu um erro ao efetuar a pesquisa. Tente novamente.");
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// MAIN
////////////////////////////////////////////////////////////////////////////////////////////////////

async function main() {
    try {
        let publicacoes = await api.getPublicacoes();
        mostraListaPublicacoes(publicacoes);
    } catch (e) {
        console.error("Erro ao obter agentes", e);
        alert("Ocorreu um erro ao obter os agentes. Tente novamente.");
    }
}


document.addEventListener('DOMContentLoaded', () => {
    main();
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNÇÕES AUXILIARES
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Mostra os detalhes da publicação no div com ID #detalhesPublicacao.
 * @param {any} publicacao Publicação para qual mostrar os dados.
 */
function mostraDetalhesPublicacao(publicacao) {
    let detalhes = document.getElementById('detalhesPublicacao');

    // Esconder o pop-up dos detalhes quando se clica no botão
    document.getElementById('esconderDetalhes').onclick = (e) => {
        e.preventDefault();

        detalhes.classList.add('hidden');
    };

    document.getElementById('caption').textContent = publicacao.caption;
    document.getElementById('fotoPublicada').src = api.getLinkFoto(publicacao.id);

    detalhes.classList.remove('hidden');
}

/**
 * Coloca no div com o ID #publicacoes uma lista de publicacoes.
 * @param {any[]} publicacoes Lista de publicacoes.
 */
function mostraListaPublicacoes(publicacoes) {
    let container = document.querySelector('#publicacoes');

    container.innerHTML = "";

    for (let publicacao of publicacoes) {
        let divPublicacao = criarDivPost(publicacao);

        container.appendChild(divPublicacao);
    }
}

/**
 * Método auxiliar para criar uma div para a lista de publicacoes.
 * @param {any} publicacao Publicacao para qual fazer o div.
 * @returns {HTMLDivElement} Div com o elemento da lista.
 */
function criarDivPost(publicacao) {
    let divPublicacao = document.createElement("div");

    let imgPublicacao = document.createElement("img");
    imgPublicacao.src = api.getLinkFoto(publicacao.id);
    divPublicacao.appendChild(imgPublicacao);
    let autorPublicacao = document.createElement("h5");
    let legendaPublicacao = document.createElement("p");
    autorPublicacao.textContent = publicacao.user.name;
    divPublicacao.appendChild(autorPublicacao);
    legendaPublicacao.textContent = publicacao.caption;
    imgPublicacao.onclick = async (e) => {
        e.preventDefault();

        try {
            let detalhesPublicacao = await api.getPublicacao(publicacao.id);

            mostraDetalhesPublicacao(detalhesPublicacao);
        } catch (e) {
            console.error("Erro ao obter a publicação.", e);
            alert("Erro ao obter a publicação.");
        }
    };
    divPublicacao.appendChild(legendaPublicacao);


 

    return divPublicacao;
}


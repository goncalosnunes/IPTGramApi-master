/**
 * Uma classe que encapsula as operações de CRUD dos Posts.
 * */
class ApiPosts {
  /**
   * Cria uma nova instância da classe ApiPosts.
   * @param {string} linkApi O link "base" da API.
   */
  constructor(linkApi) {
    this.linkApi = linkApi;
  }

  /**
   * Constrói o link para a foto publicada.
   * @param {number} id ID da publicaão.
   * @returns {string} link para a foto.
   */
  getLinkFoto(id) {
    return this.linkApi + "/api/posts/" + id + "/foto";
  }



  /**
   * Obtém a lista de publicações.
   * @param {string} pesquisa Termo de pesquisa.
   * @returns {Promise<any[]>} Array de publicações.
   */
  async getPublicacoes(pesquisa = "") {
    // A classe URLSearchParams é usada para construir query strings
    // (isto é ?pesquisa=ourém&comFoto=true)
    // de forma dinâmica.
    let termosPesquisa = new URLSearchParams();

    if (pesquisa) {
      termosPesquisa.set("pesquisa", pesquisa);
    }

    let resposta = await fetch(
      this.linkApi + "/api/posts?" + termosPesquisa.toString(),
      {
          method: "GET",
          credentials: "include",
        headers: {
          Accept: "application/json"
        }
      }
    );

    if (!resposta.ok) {
      let textoErro = await resposta.text();
      throw new Error(textoErro);
    }
    
    let posts = await resposta.json();

    return posts;
  }
  /**
   * Obtém uma publicação através do seu ID.
   * @param {number} id ID da publicação.
   * @returns {Promise<any>} Publicação.
   */
  async getPublicacao(id) {
    let resposta = await fetch(this.linkApi + "/api/posts/" + id, {
        method: "GET",
        credentials: "include",
      headers: {
        Accept: "application/json"
      }
    });

    if (!resposta.ok) {
      let textoErro = await resposta.text();
      throw new Error(textoErro);
    }

    let posts = await resposta.json();

    return posts;
  }
    /**
    * Obtém possibilidade de fazer login
    * @param {string} userName Nome de utilizador
    * @param {string} passe Palavra passe
    * @returns {Promise<any>} Publicação criada.
    */

    async enviaLogin(user, passe) {
        // Usar um objeto do tipo FormData permite-nos enviar ficheiros por AJAX
        let form = new FormData();

        form.append("UserName", user);
        form.append("Password", passe);

        let resposta = await fetch(this.linkApi + "/api/account/login", {
            method: "POST",
            credentials: "include",
            headers: {
                // NOTA: não coloco o Content-Type, porque quando uso FormData
                // com o fetch, este é definido automaticamente.
                Accept: "application/json"
            },
            body: form
        });

        if (!resposta.ok) {
            
            let textoErro = await resposta.text();
            throw new Error(textoErro);
        }
        criarDivLogin(resposta.status, user);
        let logIn = await resposta.json();
        

        return logIn;

    }
    /**
     * 
     * 
     */
async fazLogout() {
        let resposta = await fetch(this.linkApi + "/api/account/logout", {
            method: "POST",
            headers: {}
        });
        if (!resposta.ok) {
            let textoErro = await resposta.text();
            throw new Error(textoErro);
        }
    esconderDivLogout();
}


  /**
   * Cria uma publicação na API.
   * @param {string} caption Legenda da publicação.
   * @param {File} photoFileName Ficheiro da foto da publicação.
   * @returns {Promise<any>} Publicação criada.
   */
  async createPublicacao(caption, photoFileName) {
    // Usar um objecto do tipo FormData permite-nos enviar ficheiros por AJAX.
    let form = new FormData();

    form.append("publicacao", caption);
    form.append("foto", photoFileName);

    let resposta = await fetch(this.linkApi + "/api/posts", {
        method: "POST",
        
      headers: {
        // NOTA: não coloco o Content-Type, porque quando uso FormData
        // com o fetch, este é definido automaticamente.
        Accept: "application/json"
      },
      body: form
    });

    if (!resposta.ok) {
      let textoErro = await resposta.text();
      throw new Error(textoErro);
    }

    let postCriada = await resposta.json();

    return postCriada;
  }

  /**
   * Atualiza uma publicação na API.
   * @param {number} id ID da publicação.
   * @param {string} caption Nova legenda da publicação
   */
  async updatePublicacao(id, caption) {
    let body = {
      publicacao: caption
    };

    let resposta = await fetch(this.linkApi + "/api/posts/" + id, {
      method: "PUT",
      headers: {
       
        Accept: "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!resposta.ok) {
      let textoErro = await resposta.text();
      throw new Error(textoErro);
    }

    // A API não devolve nada se o update for OK.
    // Se precisarmos dos dados atualizados,
    // podemos usar a função para obter uma publicação aqui.
    // Isto é opcional.
    // return await this.getPublicacoes(id);
  }

  /**
   * Apaga uma publicação da API.
   * @param {number} id ID da publicação a apagar.
   */
  async deletePublicacao(id) {
    let resposta = await fetch(this.linkApi + "/api/posts/" + id, {
      method: "DELETE",
      headers: {}
    });

    if (!resposta.ok) {
      let textoErro = await resposta.text();
      throw new Error(textoErro);
    }

    // Não tenho retorno, não há nada a fazer se a publicação for apagada com sucesso.
  }
}

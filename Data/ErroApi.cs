using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IPTGram.Data
{
    public class ErroApi
    {
        public ErroApi()
        {

        }

        public ErroApi(string mensagem)
        {
            this.Mensagem = mensagem;
        }

        public string Mensagem { get; set; }
    }
}

/*
 * CONFIGURAÇÃO DO SITE
 * É o único ficheiro que precisa de editar para mudar datas, links e o formulário.
 * Mantenha as aspas '...' e as vírgulas no fim de cada linha.
 */
window.SITE_CONFIG = {

  nomeLista: 'Construir o Futuro',

  // Endereço público do site (usado no botão "Partilhar"). Pode ficar vazio: usa o endereço atual.
  urlSite: '',

  email: 'listaconstruirofuturo@gmail.com',

  /*
   * DATAS DA ELEIÇÃO
   * Formato: AAAA-MM-DDTHH:MM:SS seguido do fuso horário.
   * Em novembro, Portugal Continental está em UTC+0, por isso usa-se "+00:00".
   * (Se um dia mudar para uma data de verão — abril a outubro — use "+01:00".)
   */
  eleicoes: {
    abertura: '2026-11-18T00:00:00+00:00',   // 18 nov, 0h00
    fecho:    '2026-11-28T12:00:00+00:00',   // 28 nov, 12h00
  },

  /*
   * FORMULÁRIO "PARTICIPA"
   * Cole aqui o endereço da "Aplicação Web" do Google Apps Script
   * (termina em /exec). O passo a passo está no README, secção 5.
   * Enquanto estiver vazio, o formulário funciona em MODO DE DEMONSTRAÇÃO:
   * mostra a mensagem de sucesso mas não envia nada.
   */
  formulario: {
    endpoint: '',
  },

  /*
   * REDES SOCIAIS
   * Para acrescentar uma rede: copie uma linha e mude nome e url.
   * Redes com ícone próprio: Instagram, Facebook, LinkedIn, X, YouTube.
   * Para remover: apague a linha.
   */
  redes: [
    { nome: 'Instagram', url: 'https://www.instagram.com/listaconstruirofuturo/' },
    { nome: 'Facebook',  url: 'https://www.facebook.com/share/18uL6rk6uG/' },
  ],
};

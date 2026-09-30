/**
 * FORMULÁRIO "PARTICIPA" — recetor de contributos
 *
 * Este código corre na conta Google da candidatura (listaconstruirofuturo@gmail.com).
 * Recebe cada contributo enviado pelo site e:
 *   1. guarda-o numa linha da folha de cálculo onde este script está instalado;
 *   2. envia um email para a candidatura;
 *   3. se a pessoa indicou o seu email, envia-lhe uma cópia do que escreveu.
 *
 * Instalação: ver README.md, secção 5. Não precisa de alterar nada abaixo,
 * exceto (opcionalmente) EMAIL_CANDIDATURA.
 */

var EMAIL_CANDIDATURA = 'listaconstruirofuturo@gmail.com';
var NOME_LISTA = 'Construir o Futuro';
var MAX_CARACTERES = 5000;

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);

    // Campo-armadilha: só robôs o preenchem.
    if (d.website) return resposta({ ok: true });

    var contributo = String(d.contributo || '').trim().slice(0, MAX_CARACTERES);
    if (!contributo) return resposta({ ok: false, erro: 'contributo-vazio' });
    if (d.consentimento !== true) return resposta({ ok: false, erro: 'sem-consentimento' });

    var tipo = limpar(d.tipo) || 'Não indicado';
    var regiao = limpar(d.regiao) || '—';
    var unidade = limpar(d.unidade) || '—';
    var anonimo = d.identificacao !== 'email';
    var nome = anonimo ? '' : limpar(d.nome);
    var email = anonimo ? '' : limpar(d.email).toLowerCase();

    if (!anonimo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return resposta({ ok: false, erro: 'email-invalido' });
    }

    // Limite simples contra envios repetidos (máx. 5 por email em 10 minutos).
    if (email) {
      var cache = CacheService.getScriptCache();
      var chave = 'n_' + email;
      var n = Number(cache.get(chave) || 0);
      if (n >= 5) return resposta({ ok: false, erro: 'demasiados-envios' });
      cache.put(chave, String(n + 1), 600);
    }

    var quando = Utilities.formatDate(new Date(), 'Europe/Lisbon', 'dd/MM/yyyy HH:mm');

    var folha = SpreadsheetApp.getActiveSpreadsheet();
    if (folha) {
      var s = folha.getSheets()[0];
      if (s.getLastRow() === 0) {
        s.appendRow(['Data', 'Tipo', 'Contributo', 'Região', 'Unidade', 'Nome', 'Email']);
      }
      s.appendRow([quando, tipo, contributo, regiao, unidade, nome, email || 'anónimo']);
    }

    var corpo =
      'Tipo: ' + tipo + '\n' +
      'Região: ' + regiao + '\n' +
      'Unidade: ' + unidade + '\n' +
      'Enviado em: ' + quando + '\n\n' +
      '— Contributo —\n' + contributo + '\n';

    MailApp.sendEmail({
      to: EMAIL_CANDIDATURA,
      subject: '[Participa] ' + tipo + (anonimo ? ' (anónimo)' : ' — ' + (nome || email)),
      body: corpo + '\n' + (anonimo ? 'Enviado de forma anónima.' : 'De: ' + (nome || '—') + ' <' + email + '>'),
      replyTo: anonimo ? EMAIL_CANDIDATURA : email,
      name: NOME_LISTA + ' · site',
    });

    if (!anonimo) {
      MailApp.sendEmail({
        to: email,
        subject: 'O teu contributo para a lista ' + NOME_LISTA,
        body:
          (nome ? 'Olá ' + nome + ',\n\n' : 'Olá,\n\n') +
          'Obrigado pelo teu contributo. Recebemos o seguinte:\n\n' + corpo +
          '\nPodes responder a este email para continuar a conversa.\n\n' +
          'Lista ' + NOME_LISTA + '\n' + EMAIL_CANDIDATURA + '\n\n' +
          'Se não foste tu a enviar esta mensagem, ignora-a ou avisa-nos.',
        replyTo: EMAIL_CANDIDATURA,
        name: 'Lista ' + NOME_LISTA,
      });
    }

    return resposta({ ok: true });
  } catch (err) {
    return resposta({ ok: false, erro: 'erro-interno' });
  }
}

// Permite testar no browser se o endereço está ativo.
function doGet() {
  return resposta({ ok: true, estado: 'ativo' });
}

function limpar(v) {
  return String(v || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 200);
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

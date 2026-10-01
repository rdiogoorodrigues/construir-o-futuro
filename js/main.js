/* Construir o Futuro — comportamento do site. Sem dependências. */
(function () {
  'use strict';

  var C = window.SITE_CONFIG || {};
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // Texto simples com **negrito** e marcas [POR INSERIR] destacadas.
  function inline(t) {
    return esc(t)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]*INSERIR[^\]]*)\]/g, '<span class="por-inserir">[$1]</span>');
  }
  function getJSON(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(url + ' ' + r.status);
      return r.json();
    });
  }
  function getTexto(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(url + ' ' + r.status);
      return r.text();
    });
  }
  function avisoFalha(el) {
    el.innerHTML = '<p class="a-carregar">Não foi possível carregar este conteúdo. ' +
      (location.protocol === 'file:' ? 'Abra o site através de um servidor (ver README).' : 'Recarregue a página.') + '</p>';
  }

  /* ---------- Navegação ---------- */
  var nav = $('#nav'), navBotao = $('.nav-botao');
  navBotao.addEventListener('click', function () {
    var aberta = nav.classList.toggle('aberta');
    navBotao.setAttribute('aria-expanded', aberta);
    navBotao.textContent = aberta ? 'Fechar' : 'Menu';
  });
  $('#nav-lista').addEventListener('click', function (e) {
    if (e.target.closest('a') && nav.classList.contains('aberta')) navBotao.click();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('aberta')) { navBotao.click(); navBotao.focus(); }
  });

  /* ---------- 01 · Animação inicial ---------- */
  $('.saltar-animacao').addEventListener('click', function () {
    document.documentElement.classList.add('sem-animacao');
  });

  /* ---------- 02 · Contagem decrescente ---------- */
  (function () {
    var abre = new Date(C.eleicoes && C.eleicoes.abertura).getTime();
    var fecha = new Date(C.eleicoes && C.eleicoes.fecho).getTime();
    var painel = $('#contagem'), estado = $('#cd-estado');
    if (isNaN(abre) || isNaN(fecha)) return;
    var p2 = function (n) { return n < 10 ? '0' + n : String(n); };

    function marcaCronograma(agora) {
      document.querySelectorAll('#cronograma li').forEach(function (li) {
        var fim = new Date(li.getAttribute('data-data') + 'T23:59:59+00:00').getTime();
        li.classList.toggle('passado', agora > fim);
      });
    }

    function atualiza() {
      var agora = Date.now(), alvo;
      marcaCronograma(agora);
      if (agora >= fecha) {
        painel.classList.remove('a-decorrer');
        painel.classList.add('terminado');
        estado.textContent = 'Obrigado a todos os que votaram.';
        $('#cd-nota').textContent = 'A votação terminou a 28 de novembro de 2026, às 12h00.';
        return false;
      }
      if (agora >= abre) {
        painel.classList.add('a-decorrer');
        estado.textContent = 'Votação a decorrer. Fecha dentro de';
        alvo = fecha;
      } else {
        estado.textContent = 'A votação abre dentro de';
        alvo = abre;
      }
      var min = Math.floor((alvo - agora) / 60000);
      $('#cd-d').textContent = p2(Math.floor(min / 1440));
      $('#cd-h').textContent = p2(Math.floor((min % 1440) / 60));
      $('#cd-m').textContent = p2(min % 60);
      return true;
    }
    if (atualiza()) {
      var t = setInterval(function () { if (!atualiza()) clearInterval(t); }, 15000);
    }
  })();

  /* ---------- 03 · Candidatura (Markdown simples) ---------- */
  function markdown(md) {
    md = md.replace(/<!--[\s\S]*?-->/g, '').replace(/\r/g, '').trim();
    var blocos = md.split(/\n\s*\n/);
    var resumo = [], resto = [], alvo = resumo;
    blocos.forEach(function (b) {
      b = b.trim();
      if (!b) return;
      var html;
      if (/^##\s+/.test(b)) {
        alvo = resto;
        html = '<h3>' + inline(b.replace(/^##\s+/, '')) + '</h3>';
      } else if (/^- /.test(b)) {
        html = '<ul>' + b.split('\n').map(function (l) {
          return '<li>' + inline(l.replace(/^-\s+/, '')) + '</li>';
        }).join('') + '</ul>';
      } else {
        html = '<p>' + inline(b.replace(/\n/g, ' ')) + '</p>';
      }
      alvo.push(html);
    });
    return { resumo: resumo.join(''), resto: resto.join('') };
  }

  var elResumo = $('#resumo'), elCompleto = $('#texto-completo'), botaoLer = $('#ler-mais');
  getTexto('conteudo/candidatura.md').then(function (md) {
    var r = markdown(md);
    elResumo.innerHTML = r.resumo;
    if (r.resto) {
      elCompleto.innerHTML = r.resto;
      botaoLer.hidden = false;
    }
  }).catch(function () { avisoFalha(elResumo); });

  botaoLer.addEventListener('click', function () {
    var abrir = elCompleto.hidden;
    elCompleto.hidden = !abrir;
    botaoLer.setAttribute('aria-expanded', abrir);
    botaoLer.textContent = abrir ? 'Fechar texto completo' : 'Ler texto completo';
    if (!abrir) $('#candidatura').scrollIntoView({ behavior: reduzMovimento ? 'auto' : 'smooth' });
  });

  /* ---------- 04 · Programa ---------- */
  var VISIVEIS = 3;
  getJSON('conteudo/programa.json').then(function (d) {
    var ol = $('#eixos');
    ol.innerHTML = d.eixos.map(function (e, i) {
      var id = 'eixo-' + (i + 1);
      // Só recolhe se sobrarem pelo menos 2 propostas (esconder 1 atrás de um botão não compensa).
      var extra = e.propostas.length - VISIVEIS;
      if (extra < 2) extra = 0;
      return '<li class="eixo" aria-labelledby="' + id + '-t">' +
        '<div class="eixo-cab"><span class="eixo-num" aria-hidden="true">' + (i + 1) + '</span>' +
        '<div><h3 id="' + id + '-t">' + inline(e.titulo) + '</h3>' +
        (e.introducao ? '<p class="eixo-intro">' + inline(e.introducao) + '</p>' : '') + '</div></div>' +
        '<ul class="propostas" id="' + id + '-p">' + e.propostas.map(function (p, j) {
          return '<li' + (extra && j >= VISIVEIS ? ' hidden' : '') + '>' + inline(p) + '</li>';
        }).join('') + '</ul>' +
        (extra > 0 ? '<button class="ver-mais" type="button" aria-expanded="false" aria-controls="' + id + '-p" data-extra="' + extra + '">Ver mais (' + extra + ')</button>' : '') +
        '</li>';
    }).join('');
  }).catch(function () { avisoFalha($('#eixos')); });

  $('#eixos').addEventListener('click', function (e) {
    var b = e.target.closest('.ver-mais');
    if (!b) return;
    var abrir = b.getAttribute('aria-expanded') !== 'true';
    var itens = document.getElementById(b.getAttribute('aria-controls')).children;
    for (var i = VISIVEIS; i < itens.length; i++) itens[i].hidden = !abrir;
    b.setAttribute('aria-expanded', abrir);
    b.textContent = abrir ? 'Ver menos' : 'Ver mais (' + b.getAttribute('data-extra') + ')';
    if (abrir && itens[VISIVEIS]) { itens[VISIVEIS].setAttribute('tabindex', '-1'); itens[VISIVEIS].focus({ preventScroll: true }); }
  });

  /* ---------- 05 · Quem somos ---------- */
  var tocaOuSemHover = window.matchMedia('(hover: none)').matches;
  var observador = ('IntersectionObserver' in window && tocaOuSemHover && !reduzMovimento)
    ? new IntersectionObserver(function (entradas) {
        entradas.forEach(function (en) {
          en.target.classList.toggle('mostra-crianca', en.isIntersecting);
          atualizaAlt(en.target);
        });
      }, { rootMargin: '-42% 0px -42% 0px' })
    : null;

  function iniciais(nome) {
    var p = nome.trim().split(/\s+/);
    return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
  }
  function atualizaAlt(cartao) {
    var mostra = cartao.classList.contains('mostra-crianca');
    if (cartao.classList.contains('tem-crianca')) cartao.setAttribute('aria-pressed', mostra);
  }
  // Tenta .jpg e depois .JPG (o GitHub Pages distingue maiúsculas).
  function carregaFoto(img, base, ok) {
    var ext = ['jpg', 'JPG', 'jpeg'], i = 0;
    img.onload = function () { ok(); };
    img.onerror = function () { i++; if (i < ext.length) img.src = base + '.' + ext[i]; };
    img.src = base + '.' + ext[0];
  }

  getJSON('conteudo/candidatos.json').then(function (d) {
    var raiz = $('#candidatos');
    d.orgaos.forEach(function (o) {
      var sec = document.createElement('section');
      sec.className = 'orgao';
      sec.innerHTML = '<h3>' + esc(o.orgao) + '</h3>';
      o.grupos.forEach(function (g) {
        if (g.grupo) { // grupo vazio = sem rótulo
          var r = document.createElement('p');
          r.className = 'rotulo grupo-rot';
          r.textContent = g.grupo;
          sec.appendChild(r);
        }
        var ul = document.createElement('ul');
        ul.className = 'grelha-pessoas';
        g.pessoas.forEach(function (p) { ul.appendChild(cartao(p)); });
        sec.appendChild(ul);
      });
      raiz.appendChild(sec);
    });
  }).catch(function () { avisoFalha($('#candidatos')); });

  var algumaCrianca = false;
  function cartao(p) {
    var li = document.createElement('li');
    li.className = 'cartao';
    li.innerHTML =
      '<div class="foto"><span class="foto-vazia" aria-hidden="true">' + esc(iniciais(p.nome)) + '</span>' +
      '<img class="atual" alt="' + esc(p.nome) + '" loading="lazy" decoding="async">' +
      '<img class="crianca" alt="' + esc(p.nome) + ' em criança" loading="lazy" decoding="async"></div>' +
      '<p class="cartao-nome">' + esc(p.nome) + '</p>' +
      '<p class="cartao-cargo">' + esc(p.cargo) + '</p>';
    var atual = li.querySelector('.atual'), crianca = li.querySelector('.crianca');
    // Ponto de foco opcional (ex.: "center 10%"), sem alterar o ficheiro da fotografia.
    // Aproximação opcional (ex.: 1.8), centrada no ponto indicado em "centroZoom…" (ex.: "50% 35%").
    [[atual, p.focoAtual, p.zoomAtual, p.centroZoomAtual], [crianca, p.focoCrianca, p.zoomCrianca, p.centroZoomCrianca]]
      .forEach(function (c) {
        if (c[1]) c[0].style.objectPosition = c[1];
        if (c[2]) { c[0].style.transform = 'scale(' + c[2] + ')'; c[0].style.transformOrigin = c[3] || '50% 35%'; }
      });
    carregaFoto(atual, 'fotos/' + p.id + '-atual', function () {
      li.classList.add('tem-foto');
      carregaFoto(crianca, 'fotos/' + p.id + '-crianca', function () { ativaCrianca(li); });
    });
    return li;
  }
  function ativaCrianca(li) {
    li.classList.add('tem-crianca');
    li.setAttribute('tabindex', '0');
    li.setAttribute('role', 'button');
    li.setAttribute('aria-label', li.querySelector('.cartao-nome').textContent + ': mostrar fotografia de infância');
    li.setAttribute('aria-pressed', 'false');
    var alterna = function () { li.classList.toggle('mostra-crianca'); atualizaAlt(li); };
    li.addEventListener('click', alterna);
    li.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alterna(); }
    });
    if (observador) observador.observe(li);
    if (!algumaCrianca) {
      algumaCrianca = true;
      var dica = $('#dica-fotos');
      dica.textContent = tocaOuSemHover
        ? 'Toca numa fotografia (ou desliza a página) para ver quem já lá estava.'
        : 'Passa o cursor por uma fotografia para ver quem já lá estava.';
      dica.hidden = false;
    }
  }

  /* ---------- 06 · Participa ---------- */
  var form = $('#formulario'), erroForm = $('#erro-form'), botaoEnviar = $('#f-enviar');
  var blocoEmail = $('#bloco-email'), campoEmail = $('#f-email'), notaAnon = $('#nota-anonimo');
  var campoTexto = $('#f-contributo');

  campoTexto.addEventListener('input', function () { $('#conta').textContent = campoTexto.value.length; });
  form.addEventListener('input', function (e) {
    erroForm.hidden = true;
    if (e.target.getAttribute('aria-invalid') === 'true') e.target.removeAttribute('aria-invalid');
  });

  form.addEventListener('change', function (e) {
    if (e.target.name === 'identificacao') {
      var comEmail = e.target.value === 'email';
      blocoEmail.hidden = !comEmail;
      notaAnon.hidden = comEmail;
      campoEmail.required = comEmail;
      if (comEmail) campoEmail.focus();
    }
    if (e.target.getAttribute('aria-invalid') === 'true') e.target.removeAttribute('aria-invalid');
  });

  function mostraErro(msg, campo) {
    erroForm.textContent = msg;
    erroForm.hidden = false;
    if (campo) { campo.setAttribute('aria-invalid', 'true'); campo.focus(); }
  }

  var MENSAGENS = {
    'contributo-vazio': 'Escreve o teu contributo antes de enviar.',
    'sem-consentimento': 'Para enviar, é preciso aceitar a política de privacidade.',
    'email-invalido': 'O email indicado não parece válido.',
    'demasiados-envios': 'Recebemos vários envios seguidos deste email. Tenta novamente daqui a uns minutos.',
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    erroForm.hidden = true;
    var fd = new FormData(form);
    var dados = {
      tipo: fd.get('tipo'),
      contributo: String(fd.get('contributo') || '').trim(),
      regiao: fd.get('regiao'),
      unidade: fd.get('unidade'),
      identificacao: fd.get('identificacao'),
      nome: fd.get('identificacao') === 'email' ? String(fd.get('nome') || '').trim() : '',
      email: fd.get('identificacao') === 'email' ? String(fd.get('email') || '').trim() : '',
      consentimento: $('#f-consentimento').checked,
      website: fd.get('website'),
    };

    if (!dados.contributo) return mostraErro(MENSAGENS['contributo-vazio'], campoTexto);
    if (dados.identificacao === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
      return mostraErro('Indica um email válido, ou escolhe enviar de forma anónima.', campoEmail);
    }
    if (!dados.consentimento) return mostraErro(MENSAGENS['sem-consentimento'], $('#f-consentimento'));

    botaoEnviar.disabled = true;
    botaoEnviar.textContent = 'A enviar…';

    var endpoint = C.formulario && C.formulario.endpoint;
    var pedido = endpoint
      ? fetch(endpoint, { method: 'POST', body: JSON.stringify(dados) }) // text/plain: evita pedido CORS prévio
          .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
      : new Promise(function (res) { setTimeout(function () { res({ ok: true, demo: true }); }, 700); });

    pedido.then(function (r) {
      if (!r || !r.ok) throw new Error((r && r.erro) || 'erro');
      sucesso(dados, r.demo);
    }).catch(function (err) {
      var msg = MENSAGENS[err && err.message];
      mostraErro(msg || ('Não foi possível enviar o teu contributo. Verifica a ligação e tenta de novo. ' +
        'Se o problema continuar, escreve-nos para ' + (C.email || 'o email da candidatura') + '.'));
    }).then(function () {
      botaoEnviar.disabled = false;
      botaoEnviar.textContent = 'Enviar contributo';
    });
  });

  function sucesso(dados, demo) {
    var texto = dados.identificacao === 'email'
      ? 'Recebemos o teu contributo. Enviámos uma cópia para ' + dados.email + '.'
      : 'Recebemos o teu contributo, de forma anónima.';
    if (demo) texto += ' (Modo de demonstração: nada foi enviado. Configure o formulário em js/config.js.)';
    $('#obrigado-texto').textContent = texto;
    form.hidden = true;
    var ob = $('#obrigado');
    ob.hidden = false;
    ob.focus();
    $('#logo-participa').classList.add('encaixado');
  }

  $('#outro-contributo').addEventListener('click', function () {
    form.reset();
    blocoEmail.hidden = true; notaAnon.hidden = false; campoEmail.required = false;
    $('#conta').textContent = '0';
    $('#obrigado').hidden = true;
    form.hidden = false;
    $('#logo-participa').classList.remove('encaixado');
    campoTexto.focus();
  });

  /* ---------- 07 · Vota: adicionar ao calendário (.ics) ---------- */
  $('#calendario').addEventListener('click', function () {
    var fmt = function (iso) { return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); };
    var ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Construir o Futuro//PT', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:eleicoes-apmgf-2026@construirofuturo',
      'DTSTAMP:' + fmt(new Date().toISOString()),
      'DTSTART:' + fmt(C.eleicoes.abertura),
      'DTEND:' + fmt(C.eleicoes.fecho),
      'SUMMARY:Eleições APMGF 2027–2029 (votação eletrónica)',
      'DESCRIPTION:Votação eletrónica com o código enviado pela APMGF por SMS ou email. Fecha a 28 de novembro às 12h00.',
      'BEGIN:VALARM', 'TRIGGER:PT9H', 'ACTION:DISPLAY', 'DESCRIPTION:A votação APMGF já está aberta', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    a.download = 'eleicoes-apmgf-2026.ics';
    document.body.appendChild(a); a.click(); a.remove();
  });

  /* ---------- 08 · Perguntas frequentes ---------- */
  getJSON('conteudo/faq.json').then(function (d) {
    $('#faq').innerHTML = d.perguntas.map(function (q) {
      return '<details><summary>' + inline(q.pergunta) + '</summary><div class="faq-resposta">' +
        String(q.resposta).split(/\n\s*\n/).map(function (p) { return '<p>' + inline(p) + '</p>'; }).join('') +
        '</div></details>';
    }).join('');
  }).catch(function () { avisoFalha($('#faq')); });

  /* ---------- 09 · Redes e partilha ---------- */
  var ICONES = {
    instagram: '<path d="M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9z"/>',
    facebook: '<path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/>',
    linkedin: '<path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/>',
    x: '<path d="M18.9 1.2h3.7l-8 9.2L24 22.8h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.2 6.9 6.1-6.9zm-1.3 19.4h2L6.5 3.2H4.3l13.3 17.4z"/>',
    youtube: '<path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/>'
  };
  var ICONE_LINK = '<path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a1 1 0 1 1 1.4 1.4L12 13.4a1 1 0 0 1-1.4 0zM7 21a4 4 0 0 1-2.8-6.8l3-3a1 1 0 1 1 1.4 1.4l-3 3A2 2 0 1 0 8.4 18.4l3-3a1 1 0 0 1 1.4 1.4l-3 3A4 4 0 0 1 7 21zm9.4-8a1 1 0 0 1-.7-1.7l3-3A2 2 0 1 0 15.6 5.6l-3 3a1 1 0 0 1-1.4-1.4l3-3a4 4 0 0 1 5.6 5.6l-3 3a1 1 0 0 1-.7.3z"/>';

  var ulRedes = $('#redes');
  (C.redes || []).forEach(function (r) {
    var li = document.createElement('li');
    var icone = ICONES[String(r.nome).toLowerCase()] || ICONE_LINK;
    li.innerHTML = '<a href="' + esc(r.url) + '" rel="noopener" target="_blank">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + icone + '</svg>' +
      esc(r.nome) + '<span class="sr"> (abre numa nova janela)</span></a>';
    ulRedes.appendChild(li);
  });
  if (C.email) {
    var li = document.createElement('li');
    li.innerHTML = '<a href="mailto:' + esc(C.email) + '"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M2 4h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v.4l10 6.3 10-6.3V6H2zm20 2.8-9.5 6a1 1 0 0 1-1 0L2 8.8V18h20V8.8z"/></svg>Email</a>';
    ulRedes.appendChild(li);
    var ec = $('#email-contacto');
    ec.href = 'mailto:' + C.email;
    ec.textContent = C.email;
  }
  if (C.nomeLista) document.querySelectorAll('[data-nome-lista]').forEach(function (el) { el.textContent = C.nomeLista; });

  var estadoPartilha = $('#partilhar-estado');
  $('#partilhar').addEventListener('click', function () {
    var url = C.urlSite || location.href.split('#')[0];
    var dados = { title: 'Construir o Futuro', text: 'Candidatura aos Órgãos Sociais Nacionais da APMGF, 2027–2029.', url: url };
    var movel = window.matchMedia('(pointer: coarse)').matches;
    if (navigator.share && movel) {
      navigator.share(dados).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        estadoPartilha.textContent = 'Link copiado: ' + url;
      }, function () { estadoPartilha.textContent = url; });
    } else {
      estadoPartilha.textContent = url;
    }
  });
})();

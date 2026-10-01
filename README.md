# Construir o Futuro · site da candidatura

Site da lista **Construir o Futuro** aos Órgãos Sociais Nacionais da APMGF (triénio 2027–2029).

Tudo o que precisa de mudar no dia a dia está em **quatro sítios**:

| O que quer mudar | Onde |
|---|---|
| Datas da eleição, email, redes sociais, formulário | `js/config.js` |
| Texto da candidatura | `conteudo/candidatura.md` |
| Programa (eixos e propostas) | `conteudo/programa.json` |
| Lista de candidatos | `conteudo/candidatos.json` |
| Perguntas frequentes | `conteudo/faq.json` |
| Fotografias | pasta `fotos/` |

Não é preciso instalar nada. Todas as alterações podem ser feitas no site do GitHub, no browser.

> **Como editar um ficheiro no GitHub:** abra o ficheiro → clique no lápis (✏️ *Edit this file*) no canto superior direito → faça a alteração → clique em **Commit changes…** → **Commit changes**. Em 1–2 minutos o site publicado fica atualizado.

---

## 1. Publicar o site no GitHub Pages

1. No repositório, vá a **Settings** (separador no topo).
2. No menu da esquerda, clique em **Pages**.
3. Em **Build and deployment → Source**, escolha **Deploy from a branch**.
4. Em **Branch**, escolha `main` e a pasta `/ (root)`. Clique **Save**.
5. Espere 1–2 minutos e recarregue a página. Aparece no topo: *Your site is live at https://…github.io/…*. Esse é o endereço do site.

> O repositório tem de ser **público** para usar o GitHub Pages gratuitamente.

---

## 2. Adicionar ou trocar a fotografia de um candidato

Cada pessoa pode ter **duas** fotografias:

- `ID-atual.jpg`: a fotografia atual (obrigatória para aparecer foto);
- `ID-crianca.jpg`: a fotografia de infância (opcional).

O **ID** de cada pessoa está em `conteudo/candidatos.json`. Por exemplo, para a Nina Monteiro o ID é `nina-monteiro`, e os ficheiros são:

```
fotos/nina-monteiro-atual.jpg
fotos/nina-monteiro-crianca.jpg
```

**Passos:**

1. Mude o nome do ficheiro no seu computador para o nome certo (ex.: `nina-monteiro-atual.jpg`).
   - Tudo em **minúsculas**, sem acentos nem espaços.
   - A extensão tem de ser `.jpg`. (Se a fotografia for PNG ou HEIC do iPhone, converta-a primeiro para JPG.)
2. No GitHub, abra a pasta `fotos`.
3. Clique em **Add file → Upload files**.
4. Arraste o ficheiro para a janela.
5. Clique em **Commit changes**.

Para **trocar** uma fotografia, faça o mesmo com um ficheiro com o mesmo nome: substitui o anterior.

**Notas:**

- A fotografia pode ter qualquer formato ou proporção: o site recorta-a automaticamente ao centro, em formato 4:5 (retrato).
- Tamanho recomendado: cerca de **600 × 750 píxeis**, até 200 KB. Fotografias de telemóvel com vários MB tornam o site lento; reduza-as primeiro (por exemplo em [squoosh.app](https://squoosh.app)).
- Sem fotografia, aparece um quadrado com as iniciais. Sem fotografia de infância, o cartão mostra só a atual, sem erro.
- A foto de infância aparece ao passar o rato (computador), ao tocar, ou quando o cartão passa pelo centro do ecrã (telemóvel).

---

## 3. Adicionar, mudar ou remover um candidato

Abra `conteudo/candidatos.json` e edite (lápis ✏️). Cada pessoa é uma linha assim:

```json
{ "id": "nina-monteiro", "nome": "Nina Monteiro", "nomeCompleto": "Nina Monteiro Silva Ferreira Francisco", "cargo": "Vice-presidente" },
```

- `id`: identificador para as fotografias. Minúsculas, sem acentos, palavras separadas por `-`.
- `nome`: o nome que aparece no site.
- `nomeCompleto`: só para referência interna, não aparece no site.
- `cargo`: o cargo na lista.

**Para acrescentar** uma pessoa, copie uma linha inteira, cole-a por baixo e mude os valores.
**Para remover**, apague a linha inteira.

⚠️ Cuidados com o formato:
- Cada linha termina com uma **vírgula**, **exceto a última** de cada grupo.
- Mantenha todas as aspas `"`.
- Se o site deixar de mostrar os candidatos depois de uma alteração, o problema é quase sempre uma vírgula a mais ou a menos. Pode verificar colando o conteúdo em [jsonlint.com](https://jsonlint.com).

As pessoas aparecem pela ordem do ficheiro, agrupadas por órgão (Direção, Mesa da Assembleia Geral, Conselho Fiscal) e por grupo. Os efetivos estão num grupo sem nome (`"grupo": ""`), que aparece sem rótulo; os suplentes aparecem sob o rótulo *Suplentes*.

---

## 4. Editar textos, programa e perguntas frequentes

**Texto da candidatura:** `conteudo/candidatura.md`

- O que está **antes** do primeiro intertítulo (`## …`) aparece como resumo.
- O resto aparece ao carregar em *Ler texto completo*.
- Uma linha em branco separa parágrafos; `## ` cria um intertítulo; linhas começadas por `- ` formam uma lista; `**texto**` fica a negrito.

**Programa:** `conteudo/programa.json`

- Cada eixo tem `titulo`, `introducao` e `propostas`.
- O site mostra as 3 primeiras propostas e um botão *Ver mais* para as restantes.

**Perguntas frequentes:** `conteudo/faq.json`

- Cada entrada tem `pergunta` e `resposta`.
- Para separar parágrafos numa resposta, escreva `\n\n`.
- Textos com `[… A INSERIR]` aparecem destacados a amarelo no site, para não serem esquecidos.

---

## 5. Ligar o formulário *Participa*

Um site no GitHub Pages não consegue enviar emails sozinho. Usamos um pequeno programa gratuito da Google (**Apps Script**), que corre na conta **listaconstruirofuturo@gmail.com**. Para cada contributo:

1. regista-o numa folha de cálculo (Google Sheets), como cópia de segurança;
2. envia um email para **listaconstruirofuturo@gmail.com**;
3. se a pessoa escolheu **Com o meu email**, envia-lhe também uma cópia do que escreveu. Se escolheu **Anónimo**, só a candidatura recebe.

Enquanto não fizer esta ligação, o formulário funciona em **modo de demonstração**: mostra a mensagem de agradecimento, mas não envia nada.

### Passo a passo (±10 minutos, uma única vez)

1. Entre no Google com **listaconstruirofuturo@gmail.com**.
2. Abra [sheets.new](https://sheets.new) para criar uma folha de cálculo nova. Dê-lhe um nome, por exemplo *Contributos do site*.
3. Na folha, vá a **Extensões → Apps Script**. Abre-se um editor com um ficheiro `Código.gs`.
4. Apague tudo o que lá está e cole o conteúdo do ficheiro **`apps-script/Codigo.gs`** deste repositório. Clique no ícone de disquete (Guardar).
5. Clique em **Implementar → Nova implementação**.
   - Em *Selecionar tipo* (roda dentada), escolha **Aplicação Web**.
   - *Executar como*: **Eu (listaconstruirofuturo@gmail.com)**.
   - *Quem tem acesso*: **Qualquer pessoa**.
   - Clique **Implementar**.
6. A Google pede autorização: **Autorizar acesso** → escolha a conta → se aparecer *"A Google não validou esta app"*, clique em **Avançadas → Aceder a … (não seguro)** → **Permitir**. (É o seu próprio script; o aviso é normal.)
7. Copie o **URL da aplicação Web**. Termina em `/exec`.
8. No GitHub, abra `js/config.js`, e cole o URL entre as aspas de `endpoint`:
   ```js
   formulario: {
     endpoint: 'https://script.google.com/macros/s/AKfy…/exec',
   },
   ```
   Faça **Commit changes**.

### Testar (obrigatório)

1. Abra o site publicado e envie um contributo **anónimo** de teste → deve chegar um email a listaconstruirofuturo@gmail.com e uma linha nova na folha de cálculo.
2. Envie um contributo **com o seu email pessoal** → deve receber a cópia no email pessoal, e a candidatura também.

Se aparecer a mensagem de erro no site, confirme que o URL em `config.js` está completo e que em *Quem tem acesso* escolheu **Qualquer pessoa**.

### Notas

- **Notificações:** os emails chegam normalmente à caixa do Gmail. Para os encontrar depressa, crie um filtro no Gmail para o assunto `[Participa]`.
- **Limite diário:** uma conta Gmail gratuita pode enviar cerca de **100 emails por dia** através do Apps Script. Um contributo com email gasta 2 (um para a candidatura e a cópia), um anónimo gasta 1. Para uma campanha é mais do que suficiente; se for ultrapassado, os contributos continuam a ficar registados na folha de cálculo.
- **Alterar o código mais tarde:** depois de colar código novo, vá a **Implementar → Gerir implementações → ✏️ → Versão: Nova versão → Implementar**. O URL mantém-se.
- **Abuso:** alguém pode escrever o email de outra pessoa no formulário, que recebe então a cópia. O risco é baixo, e o email de cópia diz *"Se não foste tu a enviar esta mensagem, ignora-a"*. Há também um limite de 5 envios por email a cada 10 minutos e um campo-armadilha contra robôs.

---

## 6. Alterar a data das eleições e as redes sociais

Abra `js/config.js`.

**Datas:**

```js
eleicoes: {
  abertura: '2026-11-18T00:00:00+00:00',
  fecho:    '2026-11-28T12:00:00+00:00',
},
```

Formato: ano-mês-dia, `T`, hora:minutos:segundos, fuso. Em novembro Portugal Continental está em `+00:00`; entre abril e outubro seria `+01:00`.

A contagem decrescente tem três fases automáticas:
- antes de abrir: *"A votação abre dentro de…"*;
- durante: *"Votação a decorrer. Fecha dentro de…"*;
- depois: *"Obrigado a todos os que votaram."*

**Redes sociais:**

```js
redes: [
  { nome: 'Instagram', url: 'https://www.instagram.com/listaconstruirofuturo/' },
  { nome: 'Facebook',  url: 'https://www.facebook.com/share/18uL6rk6uG/' },
],
```

Para acrescentar uma rede (LinkedIn, X, YouTube têm ícone próprio), copie uma linha e mude o nome e o link. Para remover, apague a linha.

---

## 7. Domínio próprio (opcional)

Se comprar um domínio (ex.: `construirofuturo.pt`):

1. No repositório: **Settings → Pages → Custom domain**, escreva o domínio e clique **Save**.
2. No painel do sítio onde comprou o domínio, crie estes registos DNS:
   - Para `construirofuturo.pt`: quatro registos **A** com os valores `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   - Para `www.construirofuturo.pt`: um registo **CNAME** com o valor `SEU-UTILIZADOR.github.io`.
3. Espere até algumas horas. Depois volte a **Settings → Pages** e ative **Enforce HTTPS**.
4. Em `js/config.js`, preencha `urlSite: 'https://construirofuturo.pt'`.

---

## Ver o site no próprio computador (opcional, para quem tem alguma prática)

Abrir `index.html` com duplo clique **não funciona totalmente**: os browsers bloqueiam a leitura dos ficheiros de conteúdo. Numa janela de terminal, dentro da pasta do site:

```
python3 -m http.server 8000
```

e abra `http://localhost:8000`.

---

## Estrutura

```
index.html            página principal
privacidade.html      política de privacidade
css/style.css         aspeto (cores, letras, disposição)
js/config.js          ← configuração (datas, email, redes, formulário)
js/main.js            comportamento (não precisa de mexer)
conteudo/             ← textos editáveis
fotos/                ← fotografias dos candidatos
img/                  logótipo, favicon, imagem de partilha
fonts/                tipos de letra (Montserrat, Source Serif 4), alojados localmente
apps-script/          código do recetor do formulário (a colar no Google Apps Script)
```

Sem cookies, sem estatísticas de terceiros, sem pedidos externos exceto o envio do formulário.

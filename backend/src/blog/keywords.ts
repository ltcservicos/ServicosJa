/* Palavras-chave de alta intenção no nicho de serviços/trabalho no Brasil.
   Curadas a partir dos padrões reais de busca (informacional + transacional local).
   Cada item vira um artigo completo e otimizado para SEO. */

export interface KeywordSeed {
  keyword: string;        // termo-alvo
  titulo: string;         // H1 / <title>
  categoria: string;      // categoria do app relacionada
  intencao: 'contratar' | 'trabalhar';
  resumo: string;         // dek/intro curta
  secoes: { h2: string; p: string[]; lista?: string[] }[];
  faq: { q: string; a: string }[];
}

export const KEYWORDS: KeywordSeed[] = [
  {
    keyword: 'como contratar um pintor',
    titulo: 'Como contratar um pintor: guia completo para não errar (2026)',
    categoria: 'Pintura',
    intencao: 'contratar',
    resumo:
      'Vai pintar a casa e não sabe por onde começar? Veja como escolher um bom pintor, o que perguntar no orçamento e quanto custa pintar cada ambiente.',
    secoes: [
      {
        h2: 'O que avaliar antes de contratar um pintor',
        p: [
          'Contratar um pintor de confiança é o que separa uma parede impecável de um retrabalho caro. Antes de fechar, vale checar a experiência do profissional, ver fotos de trabalhos anteriores e conferir a avaliação de outros clientes.',
          'Prefira quem mora ou atende perto de você: além de pagar menos deslocamento, fica mais fácil combinar visitas e resolver ajustes depois.',
        ],
        lista: [
          'Avaliações e nota de clientes anteriores',
          'Fotos de serviços já feitos',
          'Quantos trabalhos a pessoa já concluiu',
          'Distância até o seu bairro',
        ],
      },
      {
        h2: 'Quanto custa pintar uma casa em 2026',
        p: [
          'O preço da pintura varia conforme o tamanho do ambiente, o tipo de tinta e se há preparo de parede (massa corrida, lixamento). Em média, a mão de obra de pintura residencial fica entre R$ 12 e R$ 30 por metro quadrado, sem o material.',
          'Peça sempre mais de um orçamento. Com algumas opções na mão, você compara preço, prazo e o que está incluído — e foge de surpresas no fim do serviço.',
        ],
      },
      {
        h2: 'Como achar um pintor perto de você',
        p: [
          'A forma mais rápida hoje é usar um aplicativo que conecta você a profissionais da sua região. No ServiçoJá, você posta o que precisa, recebe pintores interessados com nota e preço, e fala direto pelo chat antes de fechar.',
        ],
      },
    ],
    faq: [
      { q: 'Quanto custa para pintar um quarto?', a: 'Em média, a mão de obra para pintar um quarto de 12 m² fica entre R$ 250 e R$ 600, dependendo do estado da parede e da quantidade de demãos. O material é cobrado à parte.' },
      { q: 'Preciso fornecer a tinta?', a: 'Depende do combinado. Muitos pintores trabalham só com a mão de obra e pedem que o cliente compre a tinta; outros já incluem o material no orçamento. Deixe isso claro antes de fechar.' },
      { q: 'Como saber se o pintor é bom?', a: 'Veja a nota e os comentários de clientes anteriores, peça fotos de trabalhos parecidos e converse antes para sentir a clareza nas respostas.' },
    ],
  },
  {
    keyword: 'eletricista perto de mim',
    titulo: 'Eletricista perto de mim: como encontrar um profissional de confiança',
    categoria: 'Elétrica',
    intencao: 'contratar',
    resumo:
      'Tomada queimada, disjuntor caindo ou um curto na fiação? Veja como achar um eletricista perto de você, rápido e sem dor de cabeça.',
    secoes: [
      {
        h2: 'Por que escolher um eletricista da sua região',
        p: [
          'Problema elétrico costuma ter pressa. Um eletricista que atende perto de você chega mais rápido, cobra menos deslocamento e fica disponível caso precise voltar para um ajuste.',
          'Além disso, profissionais locais já conhecem a realidade dos imóveis da região e tendem a ter indicação de vizinhos — o famoso boca a boca.',
        ],
      },
      {
        h2: 'Serviços que um eletricista faz',
        p: ['A eletricista resolve desde pequenos reparos até instalações completas. Os pedidos mais comuns são:'],
        lista: [
          'Trocar tomadas, interruptores e disjuntores',
          'Resolver curto-circuito e quedas de energia',
          'Instalar chuveiro, ventilador de teto e luminárias',
          'Passar fiação nova e montar quadros de energia',
        ],
      },
      {
        h2: 'Como contratar com segurança',
        p: [
          'Descreva bem o problema, mande uma foto se possível e peça o valor antes. No ServiçoJá você encontra eletricistas perto de você, vê a avaliação de cada um e combina tudo pelo chat antes do serviço começar.',
        ],
      },
    ],
    faq: [
      { q: 'Quanto custa uma visita de eletricista?', a: 'A visita técnica costuma variar de R$ 80 a R$ 200, e em muitos casos o valor é abatido se o serviço for fechado. Reparos simples, como trocar uma tomada, podem sair a partir de R$ 60.' },
      { q: 'É urgente, consigo um eletricista hoje?', a: 'Sim. Usando um app de serviços você posta o pedido e profissionais disponíveis na sua região demonstram interesse em minutos.' },
    ],
  },
  {
    keyword: 'como conseguir trabalho de pedreiro',
    titulo: 'Como conseguir mais trabalhos de pedreiro (sem depender de indicação)',
    categoria: 'Pedreiro e reformas pequenas',
    intencao: 'trabalhar',
    resumo:
      'Cansado de esperar a indicação chegar? Veja estratégias práticas para o pedreiro autônomo conseguir clientes o ano todo.',
    secoes: [
      {
        h2: 'O problema de depender só do boca a boca',
        p: [
          'Indicação é ótima, mas é imprevisível: tem mês cheio e mês parado. Para ter renda mais estável, o pedreiro precisa de uma forma constante de aparecer para quem está procurando serviço agora.',
        ],
      },
      {
        h2: 'Onde encontrar clientes de reforma',
        p: ['Hoje a maioria das pessoas procura serviço pelo celular. Vale marcar presença onde a demanda está:'],
        lista: [
          'Aplicativos que mostram pedidos de serviço da sua região',
          'Grupos de bairro no WhatsApp e Facebook',
          'Mantendo um perfil com fotos das suas obras e avaliações',
        ],
      },
      {
        h2: 'Receba pedidos do seu bairro no ServiçoJá',
        p: [
          'No ServiçoJá, o pedreiro escolhe o ramo e a região e passa a ver os trabalhos publicados perto dele. É só deslizar e demonstrar interesse — sem ligação fria e sem pagar para ver o contato.',
        ],
      },
    ],
    faq: [
      { q: 'Preciso pagar para receber trabalhos?', a: 'No ServiçoJá o cadastro é gratuito. Você escolhe seu ramo, vê os trabalhos da sua região e demonstra interesse sem custo.' },
      { q: 'Como passo mais confiança para o cliente?', a: 'Mantenha um perfil completo, com fotos de obras concluídas e boas avaliações. Responder rápido e com clareza no chat também faz muita diferença.' },
    ],
  },
  {
    keyword: 'quanto cobrar diarista',
    titulo: 'Quanto cobrar como diarista em 2026: tabela e dicas de preço',
    categoria: 'Limpeza pesada',
    intencao: 'trabalhar',
    resumo:
      'Não sabe quanto cobrar pela faxina? Veja uma referência de valores por região e como precificar sem perder cliente nem trabalhar de graça.',
    secoes: [
      {
        h2: 'Quanto custa uma diária de faxina',
        p: [
          'O valor da diária varia bastante por cidade e pelo tamanho/estado do imóvel. Como referência geral em 2026, a diária de limpeza costuma ficar entre R$ 130 e R$ 250 nas capitais, podendo subir para faxina pesada ou pós-obra.',
          'O segredo é precificar pelo trabalho real: uma casa grande com muito acúmulo não pode custar o mesmo que um apartamento pequeno de manutenção.',
        ],
      },
      {
        h2: 'O que considerar na hora de cobrar',
        p: ['Antes de passar o preço, leve em conta:'],
        lista: [
          'Tamanho do imóvel e número de cômodos',
          'Se é faxina de manutenção ou pesada (pós-obra, mudança)',
          'Distância e custo de deslocamento',
          'Se leva os próprios produtos e equipamentos',
        ],
      },
      {
        h2: 'Encontre clientes perto de você',
        p: [
          'Com o preço definido, falta o cliente. No ServiçoJá você vê pedidos de limpeza da sua região e fala direto com quem precisa — combinando o valor antes de fechar.',
        ],
      },
    ],
    faq: [
      { q: 'Devo cobrar por hora ou por diária?', a: 'A diária é o modelo mais comum e previsível para faxina. Cobrança por hora costuma fazer sentido para serviços rápidos ou pontuais.' },
      { q: 'Como não trabalhar de graça?', a: 'Combine o escopo e o valor antes de começar, deixe claro o que está incluído e cobre adicional para faxina pesada ou pós-obra.' },
    ],
  },
  {
    keyword: 'encanador perto de mim',
    titulo: 'Encanador perto de mim: como resolver vazamento rápido e barato',
    categoria: 'Encanamento e hidráulica',
    intencao: 'contratar',
    resumo:
      'Vazamento não espera. Veja como encontrar um encanador perto de você, o que costuma custar e como evitar prejuízo com a água.',
    secoes: [
      {
        h2: 'Vazamento: por que agir rápido',
        p: [
          'Um vazamento pequeno vira um problema caro em poucos dias: estraga móvel, infiltra parede e dispara a conta de água. Por isso, achar um encanador perto de você com agilidade faz toda a diferença.',
        ],
      },
      {
        h2: 'Serviços mais pedidos de encanamento',
        p: ['Os pedidos mais comuns para a hidráulica são:'],
        lista: [
          'Consertar vazamento em pia, torneira e descarga',
          'Desentupir ralo, vaso e esgoto',
          'Trocar registro, sifão e flexível',
          'Instalar máquina de lavar e aquecedor',
        ],
      },
      {
        h2: 'Ache um encanador agora no ServiçoJá',
        p: [
          'Poste o problema com uma foto, receba encanadores interessados da sua região com nota e preço, e fale pelo chat antes de fechar. Tudo de graça e pelo celular.',
        ],
      },
    ],
    faq: [
      { q: 'Quanto custa consertar um vazamento?', a: 'Reparos simples de vazamento costumam ficar entre R$ 100 e R$ 300, dependendo do local e da peça. Casos com quebra de parede saem mais caro.' },
      { q: 'Dá para resolver no mesmo dia?', a: 'Sim, principalmente em cidades grandes. Postando o pedido em um app de serviços, encanadores próximos respondem rapidamente.' },
    ],
  },
  {
    keyword: 'aplicativo para encontrar profissionais',
    titulo: 'Melhor aplicativo para encontrar profissionais e serviços perto de você',
    categoria: 'Outros',
    intencao: 'contratar',
    resumo:
      'Precisa de pintor, eletricista, diarista ou montador? Veja como um app de serviços funciona e por que ele é a forma mais rápida de contratar.',
    secoes: [
      {
        h2: 'Como funciona um app de serviços',
        p: [
          'Em vez de ficar pedindo indicação ou ligando para vários números, você descreve o que precisa em um app e os profissionais da sua região demonstram interesse. Você compara nota, preço e distância e escolhe com quem conversar.',
        ],
      },
      {
        h2: 'Vantagens de contratar pelo app',
        p: ['Resolver pelo celular traz benefícios claros:'],
        lista: [
          'Vê avaliações reais antes de fechar',
          'Compara preços de vários profissionais',
          'Encontra gente perto de você, com mapa e distância',
          'Conversa pelo chat sem expor seu telefone de cara',
        ],
      },
      {
        h2: 'Conheça o ServiçoJá',
        p: [
          'O ServiçoJá conecta quem precisa e quem faz, com matching por deslize e chat direto. É grátis, funciona pelo navegador e dá para instalar na tela do celular como um aplicativo.',
        ],
      },
    ],
    faq: [
      { q: 'O aplicativo é gratuito?', a: 'Sim, o ServiçoJá é gratuito para contratar e para trabalhar. Você cria a conta com seu WhatsApp e já começa a usar.' },
      { q: 'Preciso baixar na loja?', a: 'Não. O ServiçoJá funciona direto no navegador e pode ser adicionado à tela inicial do celular para abrir como um app.' },
    ],
  },
];

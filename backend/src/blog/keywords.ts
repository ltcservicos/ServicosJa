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
  // ===== SEO regional para quem busca TRABALHO em Guarulhos (1 por ofício) =====
  {
    keyword: 'trabalho de jardinagem em guarulhos',
    titulo: 'Trabalho de jardinagem em Guarulhos: como conseguir clientes e ganhar mais',
    categoria: 'Jardinagem',
    intencao: 'trabalhar',
    resumo:
      'Quer trabalhar com jardinagem em Guarulhos? Veja onde está a demanda, quanto dá para ganhar por visita e por mês, e o jeito mais rápido de conseguir os primeiros clientes na sua região.',
    secoes: [
      {
        h2: 'Onde está a demanda de jardinagem em Guarulhos',
        p: [
          'Guarulhos tem muito quintal, condomínio e empresa — e quase todo mundo precisa de poda, corte de grama e manutenção de jardim de tempos em tempos. A procura aumenta na primavera e no verão, quando o mato cresce rápido, e em bairros como Vila Galvão, Bonsucesso, Picanço e Gopoúva tem bastante casa com área verde.',
          'Condomínios e pequenas empresas são ouro: em vez de um serviço só, viram contrato de manutenção mensal, com renda previsível todo mês.',
        ],
        lista: [
          'Casas com quintal e jardim',
          'Condomínios (manutenção mensal)',
          'Empresas e galpões com área verde',
          'Limpeza de terreno e poda de árvores',
        ],
      },
      {
        h2: 'Quanto ganha um jardineiro em Guarulhos',
        p: [
          'Uma visita avulsa (corte de grama + limpeza) costuma ficar entre R$ 80 e R$ 200, dependendo do tamanho da área. Poda de árvore e limpeza de terreno valem mais. Já um contrato de manutenção de condomínio pode render de R$ 400 a R$ 1.500 por mês, só naquele cliente.',
          'A dica é fechar alguns contratos fixos e completar a agenda com serviços avulsos. Em poucos meses dá para ter renda estável trabalhando por conta.',
        ],
      },
      {
        h2: 'Como conseguir os primeiros clientes',
        p: [
          'Indicação de vizinho ajuda, mas demora. O jeito mais rápido hoje é usar um aplicativo que mostra pedidos de jardinagem perto de você. No ServiçoJá você cria seu perfil grátis, recebe trabalhos da sua região com a distância de cada um e fala direto com o cliente pelo chat ou WhatsApp.',
          'Capriche no perfil: foto de jardins que você já cuidou, sua nota e os bairros que atende. Cliente fecha com quem passa confiança.',
        ],
      },
    ],
    faq: [
      { q: 'Preciso ter equipamento próprio para trabalhar com jardinagem?', a: 'Para começar, um cortador de grama, tesourão de poda, rastelo e enxada já resolvem a maioria dos serviços. Conforme a agenda enche, vale investir em roçadeira e soprador, que aceleram bastante o trabalho.' },
      { q: 'Quanto cobrar por corte de grama em Guarulhos?', a: 'Para um quintal pequeno a médio, a faixa comum é de R$ 80 a R$ 150 por visita. Áreas grandes, terrenos e poda de árvore são cobrados à parte, pelo tamanho e pela dificuldade.' },
      { q: 'Dá para viver só de jardinagem?', a: 'Sim. Quem fecha alguns contratos mensais de condomínio ou empresa e completa a semana com serviços avulsos consegue uma renda estável trabalhando por conta própria.' },
    ],
  },
  {
    keyword: 'trabalho de vidraceiro em guarulhos',
    titulo: 'Trabalho de vidraceiro em Guarulhos: como conseguir serviços e ganhar mais',
    categoria: 'Vidraceiro',
    intencao: 'trabalhar',
    resumo:
      'Vidraceiro em Guarulhos: veja os serviços mais pedidos, quanto dá para cobrar por box e por metro de vidro, e como receber pedidos da sua região todo dia.',
    secoes: [
      {
        h2: 'O que mais dá serviço para vidraceiro em Guarulhos',
        p: [
          'Vidraçaria é um dos ofícios com demanda o ano inteiro. Em Guarulhos, os pedidos campeões são instalação de box de banheiro, espelhos, troca de vidro quebrado (que costuma ser urgente) e fechamento de sacada e janelas. O comércio também gera muito serviço: vitrine, porta de vidro e divisórias.',
          'Como troca de vidro quebrado tem pressa, quem responde rápido fecha o serviço — é aí que estar num app de pedidos faz diferença.',
        ],
        lista: [
          'Box de banheiro (o mais pedido)',
          'Espelhos sob medida',
          'Troca de vidro quebrado (urgente)',
          'Sacada, janela e fechamento de área',
          'Porta e vitrine para comércio',
        ],
      },
      {
        h2: 'Quanto ganha um vidraceiro',
        p: [
          'A instalação de um box de banheiro costuma ficar entre R$ 150 e R$ 400 de mão de obra, fora o vidro. Vidro temperado é cobrado por metro quadrado, e serviços de comércio (vitrine, porta) valem bem mais. Quem domina espelho e sacada consegue tickets altos.',
          'Vidraceiro que atende emergência (vidro quebrado no fim de semana) cobra mais e fideliza cliente — vale deixar claro no perfil que você faz esse tipo de atendimento.',
        ],
      },
      {
        h2: 'Como receber pedidos perto de você',
        p: [
          'No ServiçoJá você cadastra seu perfil de vidraceiro de graça e passa a ver os pedidos de Guarulhos e região, com a distância de cada cliente. Dá para falar direto pelo chat ou abrir o WhatsApp e combinar a medição na hora.',
          'Coloque fotos de boxes e espelhos que você instalou: na vidraçaria, o cliente decide muito pelo acabamento.',
        ],
      },
    ],
    faq: [
      { q: 'Vidraceiro precisa de veículo?', a: 'Ajuda muito, porque vidro é frágil e pesado. Muitos começam com um carro ou utilitário pequeno e ventosas para transporte; conforme o volume cresce, vale uma estrutura melhor.' },
      { q: 'Quanto cobrar para instalar um box?', a: 'A mão de obra de instalação de box costuma ficar entre R$ 150 e R$ 400, dependendo do tipo (de correr, articulado) e da dificuldade. O vidro é cobrado à parte.' },
      { q: 'Tem serviço de vidraceiro o ano todo?', a: 'Sim. Diferente de ofícios sazonais, vidraçaria tem demanda constante: box, espelho e troca de vidro acontecem o ano inteiro, e o comércio sempre precisa de manutenção.' },
    ],
  },
  {
    keyword: 'trabalho de pintor em guarulhos',
    titulo: 'Trabalho de pintor em Guarulhos: como conseguir mais obras e clientes',
    categoria: 'Pintura',
    intencao: 'trabalhar',
    resumo:
      'Pintor em Guarulhos: onde está a demanda, quanto cobrar por metro e por diária, e como encher a agenda com trabalhos da sua região.',
    secoes: [
      {
        h2: 'Demanda de pintura em Guarulhos',
        p: [
          'Pintura é o serviço mais procurado em reforma. Em Guarulhos, dá trabalho o ano todo: pintura de apartamento na entrega das chaves, repintura depois de mudança, fachada de comércio e manutenção de condomínio. Bairros com muito prédio, como Centro, Macedo e Vila Augusta, têm bastante pintura predial.',
          'Quem aceita serviço pequeno (um quarto, uma parede) também vira a primeira opção para o serviço grande depois.',
        ],
      },
      {
        h2: 'Quanto ganha um pintor',
        p: [
          'A mão de obra de pintura residencial costuma ficar entre R$ 12 e R$ 30 por metro quadrado, sem o material. Na diária, pintor experiente cobra de R$ 150 a R$ 300. Trabalhos com preparo de parede (massa, lixamento) e textura valem mais.',
          'Fechar um condomínio ou um cliente que está reformando o imóvel inteiro garante semanas de trabalho de uma vez só.',
        ],
      },
      {
        h2: 'Como conseguir os trabalhos',
        p: [
          'No ServiçoJá você cria seu perfil grátis e recebe pedidos de pintura perto de você, com nota e distância. Demonstra interesse e já fala com o cliente pelo chat antes de fechar o orçamento.',
          'Foto de antes e depois no seu perfil convence muito — guarde registros dos seus melhores trabalhos.',
        ],
      },
    ],
    faq: [
      { q: 'Quanto cobrar por diária de pintura?', a: 'A diária de um pintor costuma ficar entre R$ 150 e R$ 300, conforme a experiência e a complexidade do serviço. Para obras maiores, vale fechar por metro quadrado ou por empreitada.' },
      { q: 'Vale a pena pegar serviço pequeno?', a: 'Vale. Serviço pequeno enche os buracos da agenda e costuma virar indicação e serviço grande depois. Cliente satisfeito chama de volta.' },
      { q: 'Como me destacar de outros pintores?', a: 'Capriche no perfil com fotos de antes e depois, mantenha uma boa nota e responda rápido. Pontualidade e acabamento limpo são o que mais geram indicação.' },
    ],
  },
  {
    keyword: 'trabalho de eletricista em guarulhos',
    titulo: 'Trabalho de eletricista em Guarulhos: como conseguir clientes na sua região',
    categoria: 'Elétrica',
    intencao: 'trabalhar',
    resumo:
      'Eletricista em Guarulhos: os serviços que mais dão dinheiro, quanto cobrar e como receber chamados perto de você, inclusive emergências.',
    secoes: [
      {
        h2: 'Por que Guarulhos é boa praça para eletricista',
        p: [
          'Guarulhos é uma cidade enorme, com muita casa, comércio, indústria e a região do aeroporto. Problema elétrico tem pressa e acontece o tempo todo: disjuntor caindo, tomada queimada, chuveiro que parou. Quem atende rápido e perto leva o serviço.',
          'Além das emergências, tem instalação de chuveiro, troca de fiação, instalação de luminárias e padrão de entrada — serviços que se repetem e geram indicação.',
        ],
        lista: [
          'Emergências (curto, disjuntor, tomada queimada)',
          'Instalação de chuveiro e luminárias',
          'Troca de fiação e quadro de luz',
          'Padrão de entrada e parte predial',
        ],
      },
      {
        h2: 'Quanto ganha um eletricista',
        p: [
          'Uma visita simples (trocar tomada, instalar chuveiro) costuma valer de R$ 80 a R$ 250. Serviços maiores, como troca de fiação ou quadro de distribuição, passam de R$ 500. Atendimento de emergência fora de horário comercial é cobrado mais caro — e cliente paga, porque precisa resolver.',
          'Quem se especializa em parte predial e comercial pega contratos de manutenção, que rendem todo mês.',
        ],
      },
      {
        h2: 'Como receber chamados',
        p: [
          'No ServiçoJá você cadastra seu perfil de eletricista de graça e vê os pedidos da sua região, com a distância de cada cliente. Dá para deixar claro que você atende emergência e falar direto pelo chat ou WhatsApp.',
          'Uma boa nota e respostas rápidas fazem você ser o primeiro escolhido quando o problema é urgente.',
        ],
      },
    ],
    faq: [
      { q: 'Preciso de certificação para trabalhar como eletricista?', a: 'Para serviços residenciais comuns, a experiência e a qualidade do trabalho contam muito. Para parte predial e industrial, o curso NR-10 é exigido em muitos lugares e abre mais portas — vale a pena tirar.' },
      { q: 'Quanto cobrar para instalar um chuveiro?', a: 'A instalação ou troca de chuveiro costuma ficar entre R$ 80 e R$ 200, dependendo da fiação e do disjuntor. Se precisar puxar fio novo ou trocar o disjuntor, cobra-se à parte.' },
      { q: 'Vale a pena atender emergência?', a: 'Sim. Atendimento urgente (à noite ou fim de semana) é mais bem pago e fideliza o cliente, que volta a te chamar e te indica.' },
    ],
  },
  {
    keyword: 'trabalho de encanador em guarulhos',
    titulo: 'Trabalho de encanador em Guarulhos: como conseguir serviços perto de você',
    categoria: 'Encanamento e hidráulica',
    intencao: 'trabalhar',
    resumo:
      'Encanador em Guarulhos: vazamento, desentupimento e instalação têm demanda o ano todo. Veja quanto cobrar e como receber chamados da sua região.',
    secoes: [
      {
        h2: 'Os serviços que mais dão trabalho',
        p: [
          'Hidráulica é um dos ofícios com mais urgência. Em Guarulhos, os chamados mais comuns são vazamento (que estraga móvel e assusta o cliente), desentupimento de pia e vaso, troca de torneira e registro, e instalação de máquina de lavar. Tudo isso tem pressa — e cliente com pressa fecha rápido.',
          'Caça-vazamento e reparo em coluna de água são serviços mais técnicos, que valem bem mais e têm menos concorrência.',
        ],
      },
      {
        h2: 'Quanto ganha um encanador',
        p: [
          'Serviços simples (trocar torneira, sifão, registro) costumam ficar entre R$ 80 e R$ 200. Desentupimento e conserto de vazamento valem mais, e caça-vazamento com equipamento passa de R$ 300. Emergência fora de horário é cobrada à parte.',
          'Quem atende rápido e deixa tudo limpo vira o encanador de confiança do cliente — e do prédio inteiro, por indicação.',
        ],
      },
      {
        h2: 'Como conseguir os clientes',
        p: [
          'No ServiçoJá você cria seu perfil grátis e recebe pedidos de encanamento perto de você, com a distância de cada um. Demonstra interesse e fala direto com o cliente pelo chat ou WhatsApp para combinar a visita.',
          'Deixe claro no perfil que você atende emergência: vazamento não espera, e quem responde primeiro leva o serviço.',
        ],
      },
    ],
    faq: [
      { q: 'Quanto cobrar para consertar um vazamento?', a: 'Depende de onde está o vazamento. Um reparo simples (sifão, torneira) fica entre R$ 80 e R$ 200; localizar e consertar vazamento dentro da parede ou no piso é mais técnico e passa de R$ 300.' },
      { q: 'Preciso de muito equipamento para começar?', a: 'Para os serviços do dia a dia, um bom jogo de chaves, alicate, fita veda-rosca e desentupidor já resolvem. Equipamento de caça-vazamento e máquina de desentupir são um passo seguinte, conforme a demanda cresce.' },
      { q: 'Tem serviço de encanador o ano todo?', a: 'Sim. Vazamento, entupimento e troca de peças acontecem em qualquer época. A demanda costuma subir no período de chuvas, com problemas de infiltração e ralos.' },
    ],
  },
  {
    keyword: 'trabalho de pedreiro em guarulhos',
    titulo: 'Trabalho de pedreiro em Guarulhos: como conseguir obras e reformas',
    categoria: 'Pedreiro e reformas pequenas',
    intencao: 'trabalhar',
    resumo:
      'Pedreiro em Guarulhos: reformas pequenas e reparos são o pão de cada dia. Veja a demanda local, quanto cobrar e como encher a agenda.',
    secoes: [
      {
        h2: 'A força das reformas pequenas',
        p: [
          'Nem todo cliente quer uma obra grande — a maioria precisa de reparo: assentar um piso, levantar um muro, rebocar uma parede, trocar um azulejo, fazer uma área de serviço. Em Guarulhos, esse tipo de serviço aparece toda semana, em casa, comércio e condomínio.',
          'Quem é bom em serviço pequeno e entrega limpo costuma ser chamado depois para a reforma grande — e indicado para os vizinhos.',
        ],
      },
      {
        h2: 'Quanto ganha um pedreiro',
        p: [
          'A diária de pedreiro em Guarulhos costuma ficar entre R$ 150 e R$ 280; com ajudante, o pacote sobe. Serviços por empreitada (assentar piso por m², levantar muro) podem render mais quando você é rápido e caprichoso.',
          'Fechar uma reforma de alguns dias ou semanas garante renda certa e tempo para organizar os próximos clientes.',
        ],
      },
      {
        h2: 'Como conseguir os trabalhos',
        p: [
          'No ServiçoJá você cadastra seu perfil grátis e vê os pedidos de obra e reparo perto de você, com a distância de cada cliente. Demonstra interesse e combina tudo pelo chat antes de começar.',
          'Fotos de trabalhos prontos (piso assentado, muro, área de serviço) ajudam o cliente a confiar no seu acabamento.',
        ],
      },
    ],
    faq: [
      { q: 'Quanto cobrar por diária de pedreiro?', a: 'A diária costuma ficar entre R$ 150 e R$ 280, dependendo da experiência e se você leva ajudante. Para serviços definidos, vale fechar por empreitada (preço fechado pelo serviço).' },
      { q: 'Compensa pegar serviço pequeno?', a: 'Compensa. Reparo pequeno é o que mais aparece, enche a agenda e abre porta para a reforma grande depois. Cliente satisfeito chama de novo e indica.' },
      { q: 'Como me destacar?', a: 'Pontualidade, obra limpa e organizada e uma boa nota no app. Mostrar fotos dos seus serviços e responder rápido faz você ser o primeiro escolhido.' },
    ],
  },
  {
    keyword: 'trabalho de diarista em guarulhos',
    titulo: 'Trabalho de diarista e faxina em Guarulhos: como conseguir clientes fixos',
    categoria: 'Limpeza pesada',
    intencao: 'trabalhar',
    resumo:
      'Diarista em Guarulhos: faxina, limpeza pesada e pós-obra têm muita procura. Veja quanto cobrar por diária e como conseguir clientes que voltam toda semana.',
    secoes: [
      {
        h2: 'Demanda de faxina em Guarulhos',
        p: [
          'Faxina é um dos serviços mais procurados o ano todo. Em Guarulhos, tem muita casa e apartamento que precisa de diarista uma ou duas vezes por semana, além de limpeza pesada, faxina pós-obra e pós-mudança, que pagam mais.',
          'O ouro da diarista é o cliente fixo: quem fecha alguns clientes semanais já garante renda certa todo mês, sem ficar procurando serviço.',
        ],
        lista: [
          'Diária semanal ou quinzenal (cliente fixo)',
          'Faxina pesada e pós-obra',
          'Limpeza pós-mudança',
          'Limpeza de escritório e comércio',
        ],
      },
      {
        h2: 'Quanto ganha uma diarista',
        p: [
          'A diária em Guarulhos costuma ficar entre R$ 120 e R$ 200, dependendo do tamanho do imóvel e do tipo de limpeza. Faxina pesada e pós-obra valem mais, porque dão mais trabalho. Com 4 ou 5 clientes fixos na semana, dá para ter uma renda mensal estável.',
          'Quem é caprichosa e pontual rapidamente vira indicação entre vizinhos e fecha a agenda.',
        ],
      },
      {
        h2: 'Como conseguir clientes',
        p: [
          'No ServiçoJá você cria seu perfil grátis e recebe pedidos de faxina perto de você, com a distância de cada cliente. Demonstra interesse e combina o dia e o valor pelo chat ou WhatsApp.',
          'Uma boa nota e comentários de clientes anteriores pesam muito: limpeza é confiança, e o cliente quer alguém de quem gostou.',
        ],
      },
    ],
    faq: [
      { q: 'Quanto cobrar por uma diária de faxina?', a: 'A faixa comum em Guarulhos é de R$ 120 a R$ 200 por diária, conforme o tamanho do imóvel e o tipo de limpeza. Faxina pesada e pós-obra são cobradas mais.' },
      { q: 'Como conseguir clientes fixos?', a: 'Capriche nos primeiros serviços para ser chamada de volta, mantenha pontualidade e uma boa nota. Cliente satisfeito costuma fechar diária semanal ou quinzenal e indicar para conhecidos.' },
      { q: 'Faxina pós-obra paga mais?', a: 'Sim. Por exigir mais esforço (tirar tinta, cimento, poeira pesada), a limpeza pós-obra é cobrada acima da diária comum.' },
    ],
  },
  {
    keyword: 'trabalho de montador de moveis em guarulhos',
    titulo: 'Trabalho de montador de móveis em Guarulhos: como conseguir serviços',
    categoria: 'Marcenaria e montagem de móveis',
    intencao: 'trabalhar',
    resumo:
      'Montador de móveis em Guarulhos: com tanta compra pela internet, montagem virou serviço de demanda diária. Veja quanto cobrar e como receber os pedidos.',
    secoes: [
      {
        h2: 'Por que montagem de móveis está em alta',
        p: [
          'Quase todo mundo compra móvel pela internet hoje — guarda-roupa, cama, estante, mesa, armário de cozinha — e quase ninguém quer montar. Isso transformou a montagem de móveis em um dos serviços mais constantes, com pedido aparecendo todo dia em Guarulhos.',
          'Quem também faz pequenos reparos de marcenaria (ajustar porta, trocar dobradiça, fixar prateleira) tem ainda mais serviço.',
        ],
      },
      {
        h2: 'Quanto ganha um montador',
        p: [
          'A montagem de um móvel simples (estante, cômoda) costuma valer de R$ 60 a R$ 150; guarda-roupa e cozinha planejada, bem mais, porque dão trabalho e tempo. Quem monta rápido e bem consegue fazer vários serviços no mesmo dia.',
          'Dias de pico (depois de datas de promoção, como na virada do mês) enchem a agenda — vale estar visível para receber esses pedidos.',
        ],
      },
      {
        h2: 'Como receber os pedidos',
        p: [
          'No ServiçoJá você cadastra seu perfil grátis e vê os pedidos de montagem perto de você, com a distância de cada cliente. Demonstra interesse e combina o horário pelo chat ou WhatsApp.',
          'Leve sua furadeira e jogo de chaves; uma boa nota e pontualidade fazem o cliente te chamar de novo a cada móvel novo.',
        ],
      },
    ],
    faq: [
      { q: 'Quanto cobrar para montar um guarda-roupa?', a: 'Depende do tamanho e do número de portas. Um guarda-roupa médio costuma ficar entre R$ 120 e R$ 300 de mão de obra; modelos grandes e de canto valem mais.' },
      { q: 'Que ferramentas preciso?', a: 'Furadeira/parafusadeira, jogo de chaves, martelo de borracha, nível e trena já resolvem a maioria das montagens. Boas ferramentas deixam o serviço mais rápido e limpo.' },
      { q: 'Tem serviço o ano todo?', a: 'Sim, e com picos em datas de promoção e início de mês, quando muita gente recebe os móveis comprados pela internet.' },
    ],
  },
  {
    keyword: 'trabalho de chaveiro em guarulhos',
    titulo: 'Trabalho de chaveiro em Guarulhos: como conseguir chamados na sua região',
    categoria: 'Chaveiro',
    intencao: 'trabalhar',
    resumo:
      'Chaveiro em Guarulhos: abertura, cópia e troca de fechadura têm urgência e demanda o ano todo. Veja quanto cobrar e como receber chamados perto de você.',
    secoes: [
      {
        h2: 'Demanda de chaveiro em Guarulhos',
        p: [
          'Chaveiro vive de urgência: gente trancada para fora de casa ou do carro, chave quebrada na porta, fechadura que travou. Esses chamados acontecem o tempo todo e em qualquer bairro de Guarulhos — e quem responde e chega primeiro fecha o serviço.',
          'Fora a emergência, tem cópia de chave, instalação e troca de fechadura, e serviço para comércio e condomínio, que rende contrato.',
        ],
      },
      {
        h2: 'Quanto ganha um chaveiro',
        p: [
          'Uma abertura simples costuma valer de R$ 70 a R$ 200; à noite ou de madrugada, mais. Troca e instalação de fechadura, chave codificada de carro e fechadura eletrônica têm tickets bem mais altos. Quem domina chave de automóvel ganha muito bem.',
          'Atendimento 24h é o grande diferencial: cliente em emergência paga e indica.',
        ],
      },
      {
        h2: 'Como receber chamados',
        p: [
          'No ServiçoJá você cria seu perfil grátis e vê os pedidos de chaveiro perto de você, com a distância de cada cliente. Deixe claro que atende emergência e fale direto pelo chat ou WhatsApp.',
          'Velocidade de resposta é tudo no ramo de chaveiro: o primeiro a responder costuma ser o escolhido.',
        ],
      },
    ],
    faq: [
      { q: 'Quanto cobrar por uma abertura de porta?', a: 'Uma abertura simples costuma ficar entre R$ 70 e R$ 200, dependendo do tipo de fechadura e do horário. Chamados à noite, de madrugada e fim de semana são cobrados mais caro.' },
      { q: 'Vale a pena atender 24 horas?', a: 'Sim. A emergência é o que mais paga no ramo de chaveiro. Quem se dispõe a atender fora de horário fideliza o cliente e recebe muitas indicações.' },
      { q: 'Preciso saber fazer chave de carro?', a: 'Não é obrigatório para começar, mas chave codificada de automóvel é o serviço mais bem pago. Quem se especializa nisso fatura bem mais.' },
    ],
  },
  {
    keyword: 'trabalho de tecnico de ar condicionado em guarulhos',
    titulo: 'Trabalho de ar-condicionado em Guarulhos: como conseguir serviços e clientes',
    categoria: 'Ar-condicionado e refrigeração',
    intencao: 'trabalhar',
    resumo:
      'Técnico de ar-condicionado em Guarulhos: instalação e limpeza de split disparam no calor. Veja quanto cobrar e como receber os pedidos da sua região.',
    secoes: [
      {
        h2: 'Demanda de ar-condicionado em Guarulhos',
        p: [
          'A procura por instalação e manutenção de ar-condicionado explode na chegada do verão, mas tem serviço o ano todo: instalação de split, limpeza (higienização), recarga de gás e conserto. Casa, comércio e escritório em Guarulhos pedem isso o tempo inteiro.',
          'A limpeza periódica é um prato cheio: vira contrato de manutenção com cliente que chama de volta toda temporada.',
        ],
        lista: [
          'Instalação de split (pico no calor)',
          'Limpeza e higienização',
          'Recarga de gás e conserto',
          'Manutenção de comércio e escritório (contrato)',
        ],
      },
      {
        h2: 'Quanto ganha um técnico',
        p: [
          'A instalação de um split costuma valer de R$ 250 a R$ 600 de mão de obra, dependendo da distância da tubulação e da altura. Limpeza fica entre R$ 120 e R$ 250 por aparelho, e recarga de gás e conserto são cobrados à parte. No pico do verão, dá para fazer várias instalações por semana.',
          'Quem fecha manutenção de comércio e escritório garante renda recorrente fora da temporada de calor.',
        ],
      },
      {
        h2: 'Como conseguir os serviços',
        p: [
          'No ServiçoJá você cadastra seu perfil grátis e recebe os pedidos de ar-condicionado perto de você, com a distância de cada cliente. Demonstra interesse e combina a visita pelo chat ou WhatsApp.',
          'No verão a demanda é tanta que vale responder rápido: cliente com calor não espera e fecha com quem aparece primeiro.',
        ],
      },
    ],
    faq: [
      { q: 'Quanto cobrar para instalar um ar-condicionado split?', a: 'A mão de obra costuma ficar entre R$ 250 e R$ 600, conforme a metragem da tubulação, a altura e a dificuldade. Materiais e suporte podem ser cobrados à parte.' },
      { q: 'Precisa de certificação?', a: 'Para lidar com gás refrigerante, cursos na área (e boas práticas) são importantes e dão segurança e credibilidade. Muitos clientes e empresas preferem técnico qualificado.' },
      { q: 'Tem serviço fora do verão?', a: 'Sim. Limpeza, manutenção, recarga de gás e conserto acontecem o ano todo. Fechar contratos de manutenção com comércio garante renda mesmo fora do pico de calor.' },
    ],
  },
  // ===== Conteúdo original (contratar/dicas gerais) =====
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

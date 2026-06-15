/* Dados para gerar páginas serviço × cidade com conteúdo ÚNICO de verdade.
   Cada cidade tem bairros reais e um "tier" de preço; cada categoria tem
   serviços, faixa de preço base e dica. Combinando os dois, cada página
   fica diferente (preços, bairros, FAQ) — o que evita conteúdo raso/penalização. */

export interface CidadeSeed {
  nome: string;
  slug: string;
  uf: string;
  tier: number;     // multiplicador de preço (1 = média, 1.2 = capital cara)
  contexto: string; // frase única sobre a cidade
  bairros: string[];
}

export interface CategoriaSeed {
  nome: string;        // igual à categoria do app
  termo: string;       // como aparece no título ("eletricista")
  slug: string;        // "eletricista"
  emoji: string;
  intencao: 'contratar' | 'trabalhar';
  servicos: string[];  // serviços mais pedidos
  precoBase: [number, number]; // faixa de mão de obra (R$), antes do tier da cidade
  precoUnidade: string;        // "por ponto", "por m²", "a visita"…
  dica: string;
}

// Fase 1: 5 cidades (escala conforme indexar). Bairros reais p/ conteúdo único.
export const CIDADES: CidadeSeed[] = [
  { nome: 'São Paulo', slug: 'sao-paulo', uf: 'SP', tier: 1.2,
    contexto: 'a maior cidade do país, com forte demanda por serviços em todos os bairros',
    bairros: ['Pinheiros', 'Vila Mariana', 'Tatuapé', 'Santana', 'Mooca', 'Itaim Bibi', 'Lapa', 'Butantã'] },
  { nome: 'Rio de Janeiro', slug: 'rio-de-janeiro', uf: 'RJ', tier: 1.15,
    contexto: 'onde a procura por reparos rápidos e reformas é constante na Zona Sul, Norte e Oeste',
    bairros: ['Copacabana', 'Tijuca', 'Barra da Tijuca', 'Botafogo', 'Méier', 'Campo Grande', 'Madureira'] },
  { nome: 'Belo Horizonte', slug: 'belo-horizonte', uf: 'MG', tier: 1.0,
    contexto: 'com bairros residenciais que pedem manutenção e pequenas reformas o ano todo',
    bairros: ['Savassi', 'Pampulha', 'Buritis', 'Barreiro', 'Venda Nova', 'Contagem', 'Cidade Nova'] },
  { nome: 'Guarulhos', slug: 'guarulhos', uf: 'SP', tier: 1.05,
    contexto: 'segunda maior cidade de SP, com muita demanda residencial e comercial',
    bairros: ['Centro', 'Vila Galvão', 'Bonsucesso', 'Pimentas', 'Taboão', 'Jardim Maia'] },
  { nome: 'Curitiba', slug: 'curitiba', uf: 'PR', tier: 1.0,
    contexto: 'onde o cuidado com a casa e a pontualidade dos profissionais são muito valorizados',
    bairros: ['Batel', 'Água Verde', 'Boa Vista', 'Portão', 'Cabral', 'Santa Felicidade'] },
];

export const CATEGORIAS: CategoriaSeed[] = [
  { nome: 'Elétrica', termo: 'eletricista', slug: 'eletricista', emoji: '💡', intencao: 'contratar',
    servicos: ['trocar tomadas e interruptores', 'instalar chuveiro e ventilador', 'resolver curto e queda de energia', 'passar fiação e montar quadro'],
    precoBase: [80, 200], precoUnidade: 'a visita', dica: 'Mande uma foto do problema — ajuda o eletricista a já levar a peça certa.' },
  { nome: 'Encanamento e hidráulica', termo: 'encanador', slug: 'encanador', emoji: '🚰', intencao: 'contratar',
    servicos: ['consertar vazamento em pia e descarga', 'desentupir ralo e esgoto', 'trocar registro e sifão', 'instalar máquina de lavar'],
    precoBase: [100, 300], precoUnidade: 'o serviço', dica: 'Feche o registro geral antes da visita pra evitar prejuízo com a água.' },
  { nome: 'Pintura', termo: 'pintor', slug: 'pintor', emoji: '🎨', intencao: 'contratar',
    servicos: ['pintar paredes internas', 'pintar fachada e muro', 'aplicar massa e textura', 'pintar portas e grades'],
    precoBase: [12, 30], precoUnidade: 'por m²', dica: 'Defina a cor antes — alguns pintores já trazem a tinta no orçamento.' },
  { nome: 'Pedreiro e reformas pequenas', termo: 'pedreiro', slug: 'pedreiro', emoji: '🧱', intencao: 'contratar',
    servicos: ['assentar piso e azulejo', 'levantar e rebocar parede', 'pequenas reformas de banheiro', 'reparar infiltração'],
    precoBase: [180, 450], precoUnidade: 'a diária', dica: 'Peça mais de um orçamento e combine o material por conta de quem.' },
  { nome: 'Limpeza pesada', termo: 'diarista', slug: 'diarista', emoji: '🧹', intencao: 'contratar',
    servicos: ['faxina pesada e pós-obra', 'limpeza de mudança', 'limpeza de vidros e janelas', 'organização da casa'],
    precoBase: [130, 250], precoUnidade: 'a diária', dica: 'Combine o que está incluído (produtos, áreas) antes de fechar.' },
  { nome: 'Marcenaria e montagem de móveis', termo: 'montador de móveis', slug: 'montador-de-moveis', emoji: '🪑', intencao: 'contratar',
    servicos: ['montar guarda-roupa e cama', 'instalar prateleiras e suportes', 'consertar móvel solto', 'pequenos reparos em madeira'],
    precoBase: [80, 250], precoUnidade: 'o serviço', dica: 'Tenha o manual do móvel em mãos — agiliza a montagem.' },
  { nome: 'Jardinagem', termo: 'jardineiro', slug: 'jardineiro', emoji: '🌿', intencao: 'contratar',
    servicos: ['cortar grama e poda', 'limpeza de quintal', 'plantio e paisagismo simples', 'manutenção de jardim'],
    precoBase: [100, 300], precoUnidade: 'o serviço', dica: 'Diga o tamanho da área pra receber um orçamento mais certeiro.' },
  { nome: 'Chaveiro', termo: 'chaveiro', slug: 'chaveiro', emoji: '🔑', intencao: 'contratar',
    servicos: ['abertura de porta', 'troca de fechadura e segredo', 'cópia de chave', 'chave codificada de carro'],
    precoBase: [80, 250], precoUnidade: 'a visita', dica: 'Para urgência (trancado fora de casa), avise — muitos atendem 24h.' },
  { nome: 'Ar-condicionado e refrigeração', termo: 'técnico de ar-condicionado', slug: 'ar-condicionado', emoji: '❄️', intencao: 'contratar',
    servicos: ['instalar e desinstalar split', 'limpeza e higienização', 'recarga de gás', 'conserto que não gela'],
    precoBase: [120, 400], precoUnidade: 'o serviço', dica: 'Higienização a cada 6 meses evita mau cheiro e gasto de energia.' },
  { nome: 'Reparos em eletrodomésticos', termo: 'técnico de eletrodomésticos', slug: 'conserto-eletrodomesticos', emoji: '🔌', intencao: 'contratar',
    servicos: ['consertar máquina de lavar', 'reparar geladeira e freezer', 'micro-ondas e fogão', 'troca de peças'],
    precoBase: [90, 300], precoUnidade: 'o serviço', dica: 'Anote o modelo do aparelho — facilita achar a peça de reposição.' },
];

export const slugLocal = (cat: CategoriaSeed, cid: CidadeSeed) => `${cat.slug}-em-${cid.slug}`;

// Faixa de preço ajustada pelo tier da cidade
export function faixaPreco(cat: CategoriaSeed, cid: CidadeSeed): string {
  const min = Math.round((cat.precoBase[0] * cid.tier) / 5) * 5;
  const max = Math.round((cat.precoBase[1] * cid.tier) / 5) * 5;
  return `R$ ${min} a R$ ${max} ${cat.precoUnidade}`;
}

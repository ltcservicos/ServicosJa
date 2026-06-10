import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Limpando banco...');
  await prisma.mensagem.deleteMany();
  await prisma.conversa.deleteMany();
  await prisma.interesseProfissional.deleteMany();
  await prisma.avaliacao.deleteMany();
  await prisma.notificacao.deleteMany();
  await prisma.acaoServico.deleteMany();
  await prisma.servico.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('🌱 Criando usuários...');
  const senhaHash = await bcrypt.hash('demo', 10);

  const maria = await prisma.usuario.create({
    data: {
      tipo: 'solicitante',
      nome: 'Maria Costa',
      email: 'maria@demo.com',
      senhaHash,
      whatsapp: '5511988880001',
      cidade: 'São Paulo',
      statusVerificacao: 'APROVADO',
      notaMedia: 4.7,
      totalAvaliacoes: 12,
    },
  });

  const joao = await prisma.usuario.create({
    data: {
      tipo: 'prestador',
      nome: 'João Pereira',
      email: 'joao@demo.com',
      senhaHash,
      whatsapp: '5511988880002',
      cidade: 'São Paulo',
      descricao:
        'Eletricista e encanador autônomo com mais de 10 anos de experiência. Atendo emergências.',
      categorias: 'Encanamento e hidráulica,Elétrica,Reparos em eletrodomésticos',
      bairros: 'Pinheiros,Vila Madalena,Itaim Bibi,Jardins,Moema',
      servicosConcluidos: 28,
      statusVerificacao: 'APROVADO',
      notaMedia: 4.8,
      totalAvaliacoes: 23,
    },
  });

  const carlos = await prisma.usuario.create({
    data: {
      tipo: 'prestador',
      nome: 'Carlos Lima',
      email: 'carlos@demo.com',
      senhaHash,
      whatsapp: '5511988880003',
      cidade: 'São Paulo',
      descricao: 'Pintor e marceneiro. Orçamento sem compromisso, pontualidade garantida.',
      categorias:
        'Pintura,Marcenaria e montagem de móveis,Pedreiro e reformas pequenas',
      bairros: 'Pinheiros,Vila Madalena,Perdizes,Lapa',
      servicosConcluidos: 41,
      statusVerificacao: 'APROVADO',
      notaMedia: 4.9,
      totalAvaliacoes: 35,
    },
  });

  // Mais profissionais para a busca por profissionais ter conteúdo
  const maisProfs = [
    { nome: 'Ana Beatriz', wpp: '5511988880004', cats: 'Limpeza pesada,Jardinagem', desc: 'Diarista e faxina pesada. Caprichosa e pontual, referências comprovadas.', concl: 64, nota: 4.9, av: 52, bairros: 'Santana,Tucuruvi,Vila Maria' },
    { nome: 'Roberto Souza', wpp: '5511988880005', cats: 'Elétrica,Ar-condicionado e refrigeração', desc: 'Eletricista predial e instalação/limpeza de ar-condicionado split. Atendo emergências.', concl: 33, nota: 4.7, av: 19, bairros: 'Tatuapé,Mooca,Penha' },
    { nome: 'José Carlos', wpp: '5511988880006', cats: 'Pintura,Pedreiro e reformas pequenas', desc: 'Pintor e pedreiro com 15 anos de estrada. Reformas pequenas e acabamento fino.', concl: 88, nota: 5.0, av: 71, bairros: 'Guarulhos,Vila Galvão,Bonsucesso' },
    { nome: 'Fernanda Dias', wpp: '5511988880007', cats: 'Chaveiro,Reparos em eletrodomésticos', desc: 'Chaveira 24h e conserto de eletrodomésticos. Rápida e honesta.', concl: 27, nota: 4.6, av: 14, bairros: 'Centro,Bela Vista,Sé' },
  ];
  for (const p of maisProfs) {
    await prisma.usuario.create({
      data: {
        tipo: 'prestador', nome: p.nome, senhaHash, whatsapp: p.wpp, cidade: 'São Paulo',
        descricao: p.desc, categorias: p.cats, bairros: p.bairros,
        servicosConcluidos: p.concl, statusVerificacao: 'APROVADO', notaMedia: p.nota, totalAvaliacoes: p.av,
      },
    });
  }

  console.log('🌱 Criando serviços de exemplo...');
  await prisma.servico.create({
    data: {
      solicitanteId: maria.id,
      titulo: 'Vazamento na pia da cozinha',
      descricao:
        'A torneira está pingando há dois dias e parece que tem água acumulando dentro do armário embaixo da pia. Preciso resolver com urgência antes que estrague a madeira.',
      categoria: 'Encanamento e hidráulica',
      fotos: 'https://images.unsplash.com/photo-1542013936693-884638332954?w=800&q=80',
      cidade: 'São Paulo',
      bairro: 'Pinheiros',
      lat: -23.5617,
      lng: -46.7022,
      estado: 'ABERTO',
    },
  });

  await prisma.servico.create({
    data: {
      solicitanteId: maria.id,
      titulo: 'Pintar parede da sala',
      descricao:
        'Sala de 18m² com pé direito normal. Quero trocar a cor de branco para um cinza claro. Preciso que o profissional já traga a tinta na cor escolhida.',
      categoria: 'Pintura',
      fotos: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=800&q=80',
      cidade: 'São Paulo',
      bairro: 'Vila Madalena',
      lat: -23.5535,
      lng: -46.6916,
      estado: 'ABERTO',
    },
  });

  console.log('✅ Seed concluído!');
  console.log('');
  console.log('Logins de demonstração:');
  console.log('  Solicitante:  maria@demo.com   / demo');
  console.log('  Prestador 1:  joao@demo.com    / demo');
  console.log('  Prestador 2:  carlos@demo.com  / demo');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

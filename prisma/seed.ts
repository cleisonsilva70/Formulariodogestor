import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Seed admin user
  const senhaHash = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      nome: 'Administrador',
      username: 'admin',
      senha: senhaHash,
    },
  })

  // Clear existing form data
  await prisma.formularioPergunta.deleteMany()
  await prisma.formularioPasso.deleteMany()

  // Step 1 - Sobre o negócio
  const passo1 = await prisma.formularioPasso.create({
    data: { titulo: 'Sobre o negócio', ordem: 1 },
  })
  await prisma.formularioPergunta.createMany({
    data: [
      { passoId: passo1.id, label: 'Nome do cliente / empresa', fieldId: 'nome', type: 'text', obrigatorio: true, ordem: 1, opcoes: [] },
      { passoId: passo1.id, label: 'Nome do responsável', fieldId: 'responsavel', type: 'text', obrigatorio: true, ordem: 2, opcoes: [] },
      { passoId: passo1.id, label: 'Tipo de negócio', fieldId: 'negocio', type: 'text', obrigatorio: true, ordem: 3, opcoes: [] },
      { passoId: passo1.id, label: 'Principais produtos ou serviços', fieldId: 'servicos', type: 'textarea', obrigatorio: true, ordem: 4, opcoes: [] },
      { passoId: passo1.id, label: 'Cidade', fieldId: 'cidade', type: 'text', obrigatorio: true, ordem: 5, opcoes: [] },
      { passoId: passo1.id, label: 'Estado', fieldId: 'estado', type: 'text', obrigatorio: true, ordem: 6, opcoes: [] },
      { passoId: passo1.id, label: 'Público-alvo', fieldId: 'publico', type: 'textarea', obrigatorio: false, ordem: 7, opcoes: [] },
    ],
  })

  // Step 2 - Sobre o digital
  const passo2 = await prisma.formularioPasso.create({
    data: { titulo: 'Sobre o digital', ordem: 2 },
  })
  await prisma.formularioPergunta.createMany({
    data: [
      { passoId: passo2.id, label: 'Tem site?', fieldId: 'site', type: 'select', obrigatorio: true, ordem: 1, opcoes: ['Sim', 'Não', 'Em desenvolvimento'] },
      { passoId: passo2.id, label: 'URL do site', fieldId: 'url_site', type: 'text', obrigatorio: false, ordem: 2, opcoes: [] },
      { passoId: passo2.id, label: '@ do Instagram', fieldId: 'instagram', type: 'text', obrigatorio: false, ordem: 3, opcoes: [] },
      { passoId: passo2.id, label: 'WhatsApp comercial', fieldId: 'whatsapp', type: 'text', obrigatorio: false, ordem: 4, opcoes: [] },
      { passoId: passo2.id, label: 'Tem pixel do Meta instalado?', fieldId: 'pixel', type: 'select', obrigatorio: true, ordem: 5, opcoes: ['Sim', 'Não', 'Não sei'] },
    ],
  })

  // Step 3 - Sobre as campanhas
  const passo3 = await prisma.formularioPasso.create({
    data: { titulo: 'Sobre as campanhas', ordem: 3 },
  })
  await prisma.formularioPergunta.createMany({
    data: [
      { passoId: passo3.id, label: 'Objetivo principal', fieldId: 'objetivo', type: 'select', obrigatorio: true, ordem: 1, opcoes: ['WhatsApp', 'Lead', 'Vendas no site', 'Ligação', 'Visita à loja', 'Outro'] },
      { passoId: passo3.id, label: 'Orçamento mensal em R$', fieldId: 'orcamento', type: 'text', obrigatorio: true, ordem: 2, opcoes: [] },
      { passoId: passo3.id, label: 'Já anunciou no Meta antes?', fieldId: 'historico', type: 'select', obrigatorio: true, ordem: 3, opcoes: ['Sim', 'Não'] },
      { passoId: passo3.id, label: 'Resultado esperado nas primeiras semanas', fieldId: 'resultado_esperado', type: 'textarea', obrigatorio: false, ordem: 4, opcoes: [] },
    ],
  })

  // Step 4 - Criativos e materiais
  const passo4 = await prisma.formularioPasso.create({
    data: { titulo: 'Criativos e materiais', ordem: 4 },
  })
  await prisma.formularioPergunta.createMany({
    data: [
      { passoId: passo4.id, label: 'Tem criativos disponíveis?', fieldId: 'criativos', type: 'select', obrigatorio: true, ordem: 1, opcoes: ['Sim fotos e vídeos', 'Só fotos', 'Só vídeos', 'Não tenho ainda'] },
      { passoId: passo4.id, label: 'Descrição dos criativos', fieldId: 'descricao_criativos', type: 'textarea', obrigatorio: false, ordem: 2, opcoes: [] },
      { passoId: passo4.id, label: 'Tem lista de clientes para remarketing?', fieldId: 'lista_clientes', type: 'select', obrigatorio: true, ordem: 3, opcoes: ['Sim', 'Não'] },
      { passoId: passo4.id, label: 'Oferta ou promoção ativa', fieldId: 'oferta', type: 'textarea', obrigatorio: false, ordem: 4, opcoes: [] },
      { passoId: passo4.id, label: 'Principal diferencial do negócio', fieldId: 'diferencial', type: 'textarea', obrigatorio: false, ordem: 5, opcoes: [] },
    ],
  })

  // Step 5 - Expectativas
  const passo5 = await prisma.formularioPasso.create({
    data: { titulo: 'Expectativas', ordem: 5 },
  })
  await prisma.formularioPergunta.createMany({
    data: [
      { passoId: passo5.id, label: 'Como prefere se comunicar?', fieldId: 'comunicacao', type: 'select', obrigatorio: true, ordem: 1, opcoes: ['WhatsApp', 'E-mail', 'Grupo no WhatsApp'] },
      { passoId: passo5.id, label: 'Frequência dos relatórios', fieldId: 'frequencia', type: 'select', obrigatorio: true, ordem: 2, opcoes: ['Semanal', 'Quinzenal', 'Mensal'] },
      { passoId: passo5.id, label: 'Observações adicionais', fieldId: 'observacoes', type: 'textarea', obrigatorio: false, ordem: 3, opcoes: [] },
    ],
  })

  console.log('Seed concluído com sucesso!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

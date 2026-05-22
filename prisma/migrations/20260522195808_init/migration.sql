-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "responsavel" TEXT NOT NULL,
    "negocio" TEXT NOT NULL,
    "servicos" TEXT,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "publico" TEXT,
    "site" TEXT,
    "url_site" TEXT,
    "instagram" TEXT,
    "whatsapp" TEXT,
    "pixel" TEXT,
    "objetivo" TEXT,
    "orcamento" TEXT,
    "historico" TEXT,
    "resultado_esperado" TEXT,
    "criativos" TEXT,
    "descricao_criativos" TEXT,
    "lista_clientes" TEXT,
    "oferta" TEXT,
    "diferencial" TEXT,
    "comunicacao" TEXT,
    "frequencia" TEXT,
    "observacoes" TEXT,
    "dados_extras" JSONB,
    "status" TEXT NOT NULL DEFAULT 'novo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formulario_passos" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "formulario_passos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formulario_perguntas" (
    "id" SERIAL NOT NULL,
    "passo_id" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "field_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "obrigatorio" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL,
    "opcoes" TEXT[],

    CONSTRAINT "formulario_perguntas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "formulario_perguntas" ADD CONSTRAINT "formulario_perguntas_passo_id_fkey" FOREIGN KEY ("passo_id") REFERENCES "formulario_passos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "full_name" TEXT,
    "avatar_url" TEXT,
    "birth_date" DATE,
    "birth_time" TEXT,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "is_pro" BOOLEAN NOT NULL DEFAULT false,
    "premium_until" TIMESTAMP(3),
    "last_reset_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarot_cards" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "name_vi" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "image_url" TEXT,
    "card_type" TEXT NOT NULL,
    "suit" TEXT,
    "number" INTEGER,
    "keywords" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarot_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarot_readings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "spread_type" TEXT NOT NULL,
    "card_ids" JSONB NOT NULL,
    "ai_response" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tarot_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount_vnd" INTEGER NOT NULL DEFAULT 0,
    "credits_change" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "type" TEXT NOT NULL,
    "payos_order_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hexagrams" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "chinese_name" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "image_url" TEXT,
    "trigram_above" TEXT NOT NULL,
    "trigram_below" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "hexagrams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_configs" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "base_url" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "headers" JSONB,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_histories" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "main_hexagram_id" INTEGER NOT NULL,
    "changing_hexagram_id" INTEGER,
    "changing_lines" JSONB NOT NULL DEFAULT '[]',
    "ai_response" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_notifications" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "astrology_charts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "chart_hash" TEXT NOT NULL,
    "chart_data" JSONB NOT NULL,
    "overall_score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "astrology_charts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "astrology_readings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "chart_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "ai_response" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "astrology_readings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_payos_order_id_key" ON "transactions"("payos_order_id");

-- CreateIndex
CREATE INDEX "astrology_charts_user_hash_idx" ON "astrology_charts"("user_id", "chart_hash");

-- CreateIndex
CREATE INDEX "astrology_readings_user_chart_idx" ON "astrology_readings"("user_id", "chart_id");

-- AddForeignKey
ALTER TABLE "tarot_readings" ADD CONSTRAINT "tarot_readings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_histories" ADD CONSTRAINT "user_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_histories" ADD CONSTRAINT "user_histories_main_hexagram_id_fkey" FOREIGN KEY ("main_hexagram_id") REFERENCES "hexagrams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_histories" ADD CONSTRAINT "user_histories_changing_hexagram_id_fkey" FOREIGN KEY ("changing_hexagram_id") REFERENCES "hexagrams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "astrology_charts" ADD CONSTRAINT "astrology_charts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "astrology_readings" ADD CONSTRAINT "astrology_readings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "astrology_readings" ADD CONSTRAINT "astrology_readings_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "astrology_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

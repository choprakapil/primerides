-- CreateTable
CREATE TABLE `tbl_admin_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NOT NULL DEFAULT 'admin',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `tbl_admin_users_username_key`(`username`),
    UNIQUE INDEX `tbl_admin_users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_customer_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(255) NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NULL,
    `avatar_url` VARCHAR(500) NULL,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `tbl_customer_users_phone_key`(`phone`),
    UNIQUE INDEX `tbl_customer_users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_user_devices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `device_type` VARCHAR(20) NOT NULL,
    `fcm_token` VARCHAR(500) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_seen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `tbl_user_devices_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_sessions` (
    `id` VARCHAR(64) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `user_type` VARCHAR(20) NOT NULL,
    `token_hash` VARCHAR(255) NOT NULL,
    `refresh_token_hash` VARCHAR(255) NULL,
    `ip_address` VARCHAR(50) NULL,
    `user_agent` TEXT NULL,
    `is_revoked` BOOLEAN NOT NULL DEFAULT false,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `tbl_sessions_user_id_user_type_idx`(`user_id`, `user_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_identity_documents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_id` INTEGER NOT NULL,
    `document_type` VARCHAR(50) NOT NULL,
    `document_number` VARCHAR(100) NOT NULL,
    `front_image_url` VARCHAR(500) NOT NULL,
    `back_image_url` VARCHAR(500) NULL,
    `verification_status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `rejection_reason` TEXT NULL,
    `verified_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `tbl_identity_documents_customer_id_idx`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_car_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `image_url` VARCHAR(500) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `tbl_car_categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_cars` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `brand` VARCHAR(100) NOT NULL,
    `category_id` INTEGER NOT NULL,
    `price_per_day` DECIMAL(10, 2) NOT NULL,
    `price_per_hour` DECIMAL(10, 2) NULL,
    `security_deposit` DECIMAL(10, 2) NULL,
    `transmission` VARCHAR(50) NOT NULL DEFAULT 'Automatic',
    `seats` INTEGER NOT NULL DEFAULT 4,
    `doors` INTEGER NOT NULL DEFAULT 4,
    `fuel_type` VARCHAR(50) NOT NULL DEFAULT 'Petrol',
    `engine_hp` INTEGER NULL,
    `acceleration` VARCHAR(50) NULL,
    `top_speed` INTEGER NULL,
    `primary_image` VARCHAR(500) NOT NULL,
    `gallery_images` JSON NULL,
    `badge` VARCHAR(50) NULL,
    `description` TEXT NULL,
    `features` JSON NULL,
    `is_available` BOOLEAN NOT NULL DEFAULT true,
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `tbl_cars_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_drivers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(255) NULL,
    `license_number` VARCHAR(100) NOT NULL,
    `is_available` BOOLEAN NOT NULL DEFAULT true,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `rating` DECIMAL(3, 2) NOT NULL DEFAULT 5.0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `tbl_drivers_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_bookings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_code` VARCHAR(30) NOT NULL,
    `customer_id` INTEGER NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(255) NULL,
    `car_id` INTEGER NULL,
    `car_name` VARCHAR(255) NULL,
    `driver_id` INTEGER NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `pickup_location` VARCHAR(255) NULL,
    `drop_location` VARCHAR(255) NULL,
    `with_chauffeur` BOOLEAN NOT NULL DEFAULT false,
    `base_amount` DECIMAL(10, 2) NULL,
    `chauffeur_fee` DECIMAL(10, 2) NULL,
    `security_deposit` DECIMAL(10, 2) NULL,
    `total_amount` DECIMAL(10, 2) NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `source` VARCHAR(50) NOT NULL DEFAULT 'web',
    `idempotency_key` VARCHAR(100) NULL,
    `notes` TEXT NULL,
    `admin_notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `tbl_bookings_booking_code_key`(`booking_code`),
    UNIQUE INDEX `tbl_bookings_idempotency_key_key`(`idempotency_key`),
    INDEX `tbl_bookings_car_id_start_date_end_date_idx`(`car_id`, `start_date`, `end_date`),
    INDEX `tbl_bookings_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_price_snapshots` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `car_id` INTEGER NULL,
    `price_per_day` DECIMAL(10, 2) NOT NULL,
    `price_per_hour` DECIMAL(10, 2) NULL,
    `chauffeur_rate_per_day` DECIMAL(10, 2) NULL,
    `security_deposit` DECIMAL(10, 2) NULL,
    `calculated_days` INTEGER NOT NULL DEFAULT 1,
    `calculated_hours` INTEGER NOT NULL DEFAULT 0,
    `total_calculated` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
    `snapshot_data` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tbl_price_snapshots_booking_id_key`(`booking_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_booking_status_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `from_status` VARCHAR(50) NOT NULL,
    `to_status` VARCHAR(50) NOT NULL,
    `changed_by_user_id` INTEGER NULL,
    `changed_by_role` VARCHAR(50) NOT NULL DEFAULT 'system',
    `reason` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `tbl_booking_status_history_booking_id_idx`(`booking_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `transaction_ref` VARCHAR(150) NOT NULL,
    `gateway` VARCHAR(50) NOT NULL DEFAULT 'razorpay',
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `payment_method` VARCHAR(50) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tbl_payments_transaction_ref_key`(`transaction_ref`),
    INDEX `tbl_payments_booking_id_idx`(`booking_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_cancellations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `reason` TEXT NOT NULL,
    `cancelled_by` VARCHAR(50) NOT NULL,
    `refund_amount` DECIMAL(10, 2) NULL,
    `penalty_amount` DECIMAL(10, 2) NULL,
    `processed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tbl_cancellations_booking_id_key`(`booking_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_trips` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `start_odometer` INTEGER NULL,
    `end_odometer` INTEGER NULL,
    `start_fuel_level` VARCHAR(50) NULL,
    `end_fuel_level` VARCHAR(50) NULL,
    `inspection_notes` TEXT NULL,
    `pickup_photos` JSON NULL,
    `return_photos` JSON NULL,
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tbl_trips_booking_id_key`(`booking_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_audit_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `actor_id` INTEGER NULL,
    `actor_type` VARCHAR(50) NOT NULL DEFAULT 'admin',
    `action` VARCHAR(100) NOT NULL,
    `entity` VARCHAR(100) NOT NULL,
    `entity_id` INTEGER NULL,
    `before_state` JSON NULL,
    `after_state` JSON NULL,
    `ip_address` VARCHAR(50) NULL,
    `user_agent` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `tbl_audit_logs_actor_id_idx`(`actor_id`),
    INDEX `tbl_audit_logs_entity_entity_id_idx`(`entity`, `entity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_contact_leads` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(255) NULL,
    `subject` VARCHAR(255) NULL,
    `message` TEXT NOT NULL,
    `source` VARCHAR(50) NOT NULL DEFAULT 'contact_page',
    `status` VARCHAR(50) NOT NULL DEFAULT 'new',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_blog_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `tbl_blog_categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_blogs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `category_id` INTEGER NOT NULL,
    `featured_image` VARCHAR(500) NULL,
    `image_alt` VARCHAR(255) NULL,
    `summary` TEXT NULL,
    `content` LONGTEXT NOT NULL,
    `author_name` VARCHAR(100) NOT NULL DEFAULT 'PrimeRides Editorial',
    `read_time` VARCHAR(50) NULL,
    `meta_title` VARCHAR(255) NULL,
    `meta_description` TEXT NULL,
    `meta_keywords` TEXT NULL,
    `canonical_url` VARCHAR(500) NULL,
    `is_published` BOOLEAN NOT NULL DEFAULT true,
    `published_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `tbl_blogs_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_faqs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category` VARCHAR(100) NOT NULL DEFAULT 'General',
    `question` VARCHAR(500) NOT NULL,
    `answer` TEXT NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_testimonials` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_name` VARCHAR(255) NOT NULL,
    `role_title` VARCHAR(150) NULL,
    `rating` INTEGER NOT NULL DEFAULT 5,
    `comment` TEXT NOT NULL,
    `avatar_url` VARCHAR(500) NULL,
    `is_featured` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_page_meta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `route_path` VARCHAR(255) NOT NULL,
    `meta_title` VARCHAR(255) NOT NULL,
    `meta_description` TEXT NULL,
    `meta_keywords` TEXT NULL,
    `og_title` VARCHAR(255) NOT NULL,
    `og_description` TEXT NOT NULL,
    `og_image` VARCHAR(500) NULL,
    `canonical_url` VARCHAR(500) NULL,
    `robots` VARCHAR(100) NOT NULL DEFAULT 'index, follow',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tbl_page_meta_route_path_key`(`route_path`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tbl_user_devices` ADD CONSTRAINT `tbl_user_devices_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `tbl_customer_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_sessions` ADD CONSTRAINT `fk_session_admin` FOREIGN KEY (`user_id`) REFERENCES `tbl_admin_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_sessions` ADD CONSTRAINT `fk_session_customer` FOREIGN KEY (`user_id`) REFERENCES `tbl_customer_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_identity_documents` ADD CONSTRAINT `tbl_identity_documents_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `tbl_customer_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_cars` ADD CONSTRAINT `tbl_cars_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `tbl_car_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_bookings` ADD CONSTRAINT `tbl_bookings_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `tbl_customer_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_bookings` ADD CONSTRAINT `tbl_bookings_car_id_fkey` FOREIGN KEY (`car_id`) REFERENCES `tbl_cars`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_bookings` ADD CONSTRAINT `tbl_bookings_driver_id_fkey` FOREIGN KEY (`driver_id`) REFERENCES `tbl_drivers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_price_snapshots` ADD CONSTRAINT `tbl_price_snapshots_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `tbl_bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_price_snapshots` ADD CONSTRAINT `tbl_price_snapshots_car_id_fkey` FOREIGN KEY (`car_id`) REFERENCES `tbl_cars`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_booking_status_history` ADD CONSTRAINT `tbl_booking_status_history_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `tbl_bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_payments` ADD CONSTRAINT `tbl_payments_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `tbl_bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_cancellations` ADD CONSTRAINT `tbl_cancellations_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `tbl_bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_trips` ADD CONSTRAINT `tbl_trips_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `tbl_bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_audit_logs` ADD CONSTRAINT `tbl_audit_logs_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `tbl_admin_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_blogs` ADD CONSTRAINT `tbl_blogs_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `tbl_blog_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add missing indexes on tbl_bookings(customer_id) and tbl_cars(category_id)
-- Resolves full-table-scan bottlenecks during customer booking lookups and category-filtered fleet searches

-- CreateIndex
CREATE INDEX `tbl_cars_category_id_idx` ON `tbl_cars`(`category_id`);

-- CreateIndex
CREATE INDEX `tbl_bookings_customer_id_idx` ON `tbl_bookings`(`customer_id`);

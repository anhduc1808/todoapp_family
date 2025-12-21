-- Sample seed data for Family TodoApp (PostgreSQL)
-- Chạy sau khi bạn đã tạo schema bằng Prisma migrate.
-- Ví dụ:
--   cd backend
--   npx prisma migrate dev
--   psql "postgresql://USER:PASSWORD@localhost:5432/family_todoapp" -f prisma/sample_data.sql

BEGIN;

-- XÓA DỮ LIỆU CŨ (CẨN THẬN KHI DÙNG TRÊN DB THẬT)
DELETE FROM "Notification";
DELETE FROM "Reaction";
DELETE FROM "Comment";
DELETE FROM "TaskAssignee";
DELETE FROM "Task";
DELETE FROM "FamilyMember";
DELETE FROM "Family";
DELETE FROM "User";

-- USER MẪU (password_hash ở đây KHÔNG phải bcrypt thật, chỉ để minh họa dữ liệu)
INSERT INTO "User" ("name", "email", "password_hash") VALUES
  ('Mẹ', 'mom@example.com', '123456'),
  ('Bố', 'dad@example.com', '123456'),
  ('Con', 'kid@example.com', '123456');

-- LẤY ID USER VỪA TẠO
WITH u AS (
  SELECT id, email FROM "User"
)
SELECT * FROM u;

-- GIẢ SỬ: mom = id 1, dad = id 2, kid = id 3
-- Nếu ID không đúng, bạn có thể chỉnh lại bên dưới cho khớp.

-- FAMILY MẪU
INSERT INTO "Family" ("name", "owner_id") VALUES
  ('Gia đình nhỏ của chúng ta', 1);

-- FAMILY MEMBER
INSERT INTO "FamilyMember" ("family_id", "user_id", "role") VALUES
  (1, 1, 'owner'),
  (1, 2, 'parent'),
  (1, 3, 'child');

-- TASK MẪU
INSERT INTO "Task" ("family_id", "title", "description", "priority", "status", "created_by") VALUES
  (1, 'Dọn phòng khách', 'Quét nhà, lau bàn, sắp xếp lại đồ chơi.', 'normal', 'todo', 1),
  (1, 'Đi chợ cuối tuần', 'Mua rau, thịt, trái cây cho 3 ngày.', 'high', 'in-progress', 2),
  (1, 'Học bài 30 phút', 'Ôn toán và tiếng Anh.', 'normal', 'done', 1);

-- GÁN TASK CHO THÀNH VIÊN
-- Giả sử Task id = 1,2,3 theo thứ tự trên
INSERT INTO "TaskAssignee" ("task_id", "user_id") VALUES
  (1, 3), -- Con dọn phòng
  (2, 1), -- Mẹ đi chợ
  (3, 3); -- Con học bài

COMMIT;

-- LƯU Ý:
-- 1) Các mật khẩu trong bảng "User" đang là chuỗi thường '123456', KHÔNG dùng được với đăng nhập bcrypt.
--    Nếu bạn cần đăng nhập đúng, hãy dùng script JS seed (npm run prisma:seed) thay vì file SQL này.
-- 2) File này chủ yếu dùng để bạn import nhanh dữ liệu demo trực tiếp trong PostgreSQL.
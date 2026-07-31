-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 31, 2026 at 05:03 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `posfinance`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_name` varchar(255) NOT NULL DEFAULT 'System',
  `user_role` varchar(255) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `module` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `user_name`, `user_role`, `action`, `module`, `description`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(1, 2, 'Staff Keuangan', 'staff', 'CREATE', 'Transaksi', 'Mencatat transaksi pengeluaran baru (TRX-20260730-02B5) nominal Rp 600.000 [Status: Pending]', '127.0.0.1', NULL, '2026-07-29 19:29:31', '2026-07-29 20:14:31'),
(2, 3, 'Supervisor Keuangan', 'supervisor', 'APPROVE', 'Transaksi', 'Menyetujui (Approve) transaksi (TRX-20260730-02B5) nominal Rp 600.000', '127.0.0.1', NULL, '2026-07-29 19:44:31', '2026-07-29 20:14:31'),
(3, 1, 'Admin Keuangan', 'admin', 'CREATE', 'Kategori', 'Menambahkan kategori transaksi baru: Logistik & Operasional', '127.0.0.1', NULL, '2026-07-29 19:54:31', '2026-07-29 20:14:31'),
(4, 1, 'Admin Keuangan', 'admin', 'UPDATE', 'User', 'Memperbarui data akun pengguna Budi Santoso (budi@posindonesia.co.id) [Role: STAFF]', '127.0.0.1', NULL, '2026-07-29 20:04:31', '2026-07-29 20:14:31'),
(5, 1, 'Admin Keuangan', 'admin', 'CREATE', 'Transaksi', 'Mencatat transaksi pemasukan baru (TRX-20260730-221C) nominal Rp 100.000 [Status: Approved]', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-29 20:16:54', '2026-07-29 20:16:54');

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nama_cabang` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`id`, `nama_cabang`, `created_at`, `updated_at`) VALUES
(1, 'Pos Indonesia Kantor Regional IV Semarang', '2026-07-27 23:08:44', '2026-07-27 23:08:44');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nama_kategori` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `nama_kategori`, `created_at`, `updated_at`) VALUES
(1, 'PosPay', '2026-07-27 23:08:44', '2026-07-27 23:08:44'),
(2, 'Giropos', '2026-07-27 23:08:44', '2026-07-27 23:08:44'),
(3, 'Wesel Pos', '2026-07-27 23:08:44', '2026-07-27 23:08:44'),
(4, 'Logistik', '2026-07-27 23:08:44', '2026-07-28 18:49:52'),
(5, 'Operasional', '2026-07-27 23:08:44', '2026-07-27 23:08:44'),
(6, 'Administrasi', '2026-07-27 23:08:44', '2026-07-27 23:08:44');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_07_21_000001_create_categories_table', 1),
(5, '2026_07_21_000002_create_branches_table', 1),
(6, '2026_07_21_000003_create_transactions_table', 1),
(7, '2026_07_28_000001_add_indexes_to_transactions_table', 1),
(8, '2026_07_29_000001_add_bukti_transaksi_to_transactions_table', 1),
(9, '2026_07_29_000002_change_tanggal_to_datetime_in_transactions_table', 1),
(10, '2026_07_29_000003_add_status_to_transactions_table', 1),
(11, '2026_07_29_000004_add_user_id_to_transactions_table', 1),
(12, '2026_07_30_000005_create_audit_logs_table', 2);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`email`, `token`, `created_at`) VALUES
('7d.22.mirza@gmail.com', '$2y$04$bQF4jlNFPTfASAVqIOBEZezTPuaYCRq0oAapdqcKioGQa2/fyobNi', '2026-07-28 21:29:26'),
('admin@posfinance.com', '$2y$04$R9P59K/lOgDMkHjdDK8eEus6CZLWakNj6cg3OzWIe7eeAq0C.U5Ea', '2026-07-28 21:29:13');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nomor_transaksi` varchar(255) NOT NULL,
  `tanggal` datetime NOT NULL,
  `jenis_transaksi` enum('pemasukan','pengeluaran') NOT NULL,
  `kategori_id` bigint(20) UNSIGNED NOT NULL,
  `cabang_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `nominal` decimal(15,2) NOT NULL,
  `keterangan` text DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'approved',
  `bukti_transaksi` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `nomor_transaksi`, `tanggal`, `jenis_transaksi`, `kategori_id`, `cabang_id`, `user_id`, `nominal`, `keterangan`, `status`, `bukti_transaksi`, `created_at`, `updated_at`) VALUES
(8, 'TRX-20260729-B0E4', '2026-07-29 00:00:00', 'pemasukan', 6, 1, 1, 1000000.00, 'layanan pengiriman surat, dokumen, serta paket kilat khusus.', 'approved', 'bukti_transaksi/2e2P3PwXZG1nZOYAHXT1ldg9dx3bXa56Slsn2WoE.jpg', '2026-07-28 19:48:46', '2026-07-28 20:55:59'),
(9, 'TRX-20260729-BB2F', '2026-07-29 00:00:00', 'pengeluaran', 4, 1, 1, 300000.00, 'Biaya BBM transportasi', 'approved', 'bukti_transaksi/sIHQwNBJwfb7oZ7Qn11I9HiRQ60NqHGTPdillWV6.jpg', '2026-07-28 19:50:21', '2026-07-28 20:55:59'),
(10, 'TRX-20260729-843E', '2026-07-29 00:00:00', 'pemasukan', 2, 1, 1, 10000000.00, 'giropos', 'rejected', 'bukti_transaksi/Y3Zg8AjfBHvgbRpZ1UB4hdBIHdKMAEeGMKk4FyMX.jpg', '2026-07-28 20:34:10', '2026-07-28 20:55:59'),
(11, 'TRX-20260729-989B', '2026-07-29 00:00:00', 'pemasukan', 6, 1, 1, 10000000.00, 'administrasi', 'approved', 'bukti_transaksi/uLmRIX0CASvtZ8zKIUgzy5PpCCShgdZsqSy8uPHu.jpg', '2026-07-28 20:36:28', '2026-07-28 20:55:59'),
(12, 'TRX-20260729-347C', '2026-07-29 00:00:00', 'pengeluaran', 5, 1, 2, 50000000.00, 'operasional', 'approved', 'bukti_transaksi/wHxbbTPnuayRjrev8xkrT5drtFLvqYDEj0LJDbVo.jpg', '2026-07-29 00:20:05', '2026-07-29 00:21:54'),
(13, 'TRX-20260729-2092', '2026-07-29 00:00:00', 'pemasukan', 3, 1, 3, 60000000.00, 'wesel pos', 'approved', 'bukti_transaksi/fKxSgU7Qa66Rjj83Hof4MNFpNmwJRRLigKIk0Skr.jpg', '2026-07-29 00:26:30', '2026-07-29 00:26:30'),
(14, 'TRX-20260730-950D', '2026-07-30 00:00:00', 'pengeluaran', 3, 1, 1, 10000000.00, 'wesel pos', 'approved', 'bukti_transaksi/Y4B1QjU53OBHrqp7jZLhIFtB0nDtTtzJCJ3zTlRJ.jpg', '2026-07-29 18:40:12', '2026-07-29 18:40:12'),
(15, 'TRX-20260730-6DD2', '2026-07-30 00:00:00', 'pemasukan', 1, 1, 1, 50000000.00, 'pospay', 'approved', 'bukti_transaksi/GWK35GZ1nUEMIGD1ACOEUvF7Ase5mlnIVQtrm7iv.jpg', '2026-07-29 18:40:59', '2026-07-29 18:56:11'),
(17, 'TRX-20260730-1510', '2026-07-30 00:00:00', 'pengeluaran', 5, 1, 2, 350000.00, 'operasional', 'approved', 'bukti_transaksi/uSCofEjnededZeoFbxucaQACVy1IPhSWd505jAEg.pdf', '2026-07-29 19:58:50', '2026-07-29 20:03:22'),
(18, 'TRX-20260730-02B5', '2026-07-30 00:00:00', 'pengeluaran', 4, 1, 2, 600000.00, 'logistik', 'approved', 'bukti_transaksi/67kOKkgQ5OXciV9tJyPi26QOgo24jqLCU5uN4S8n.jpg', '2026-07-29 19:59:34', '2026-07-29 20:03:20'),
(19, 'TRX-20260730-221C', '2026-07-30 00:00:00', 'pemasukan', 6, 1, 1, 100000.00, 'administrasi', 'approved', 'bukti_transaksi/uTQSVsQRZkRcQNKh3QDbM0Hty9uJCMyFmf8p8AjP.jpg', '2026-07-29 20:16:54', '2026-07-29 20:16:54');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff','supervisor') NOT NULL DEFAULT 'staff',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin Keuangan', 'admin@posfinance.com', NULL, '$2y$04$YWudOdw3OZzN.alrswUSJOp6j.UOMHjSoQHy2siNNTJIHV1LGnsqa', 'admin', 'QioJuCYE3kZus6qGvNF1C3DkPyX4LlzTD7c5ITd6rfJlZztPwXxWTJO5dvPh', '2026-07-27 23:08:44', '2026-07-27 23:08:44'),
(2, 'Staff Keuangan', 'staff@posfinance.com', NULL, '$2y$04$.URgpOVnL8N6zt2Yhuusy.LJWBm9Pc64gqGo/1sGUj33F0NqBLF36', 'staff', NULL, '2026-07-27 23:08:44', '2026-07-27 23:08:44'),
(3, 'Supervisor Keuangan', 'supervisor@posfinance.com', NULL, '$2y$04$mH2jqILJLxE3sRSOTDxG9.tEgw7HXoB4AWh.Rq6MDsWNhI6SUtB6O', 'supervisor', NULL, '2026-07-27 23:08:44', '2026-07-27 23:08:44'),
(4, 'mirza', '7d.22.mirza@gmail.com', NULL, '$2y$04$6kcHerJzWBVz9D4uL0sCC.WrMH06Div90kKU8Gme04oLsUZChhjMa', 'staff', NULL, '2026-07-28 21:22:33', '2026-07-29 18:55:09');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_user_id_foreign` (`user_id`),
  ADD KEY `audit_logs_action_module_created_at_index` (`action`,`module`,`created_at`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `branches_nama_cabang_unique` (`nama_cabang`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_nama_kategori_unique` (`nama_kategori`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transactions_nomor_transaksi_unique` (`nomor_transaksi`),
  ADD KEY `transactions_kategori_id_foreign` (`kategori_id`),
  ADD KEY `transactions_cabang_id_foreign` (`cabang_id`),
  ADD KEY `transactions_tanggal_index` (`tanggal`),
  ADD KEY `transactions_jenis_transaksi_index` (`jenis_transaksi`),
  ADD KEY `transactions_tanggal_jenis_transaksi_index` (`tanggal`,`jenis_transaksi`),
  ADD KEY `transactions_user_id_foreign` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_cabang_id_foreign` FOREIGN KEY (`cabang_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_kategori_id_foreign` FOREIGN KEY (`kategori_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- SQL para crear la tabla de usuarios
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL
);

CREATE TABLE `global_content` (
  `id` int NOT NULL AUTO_INCREMENT,
  `logoUrl` varchar(255) DEFAULT NULL,
  `navigation` json DEFAULT NULL,
  `socialLinks` json DEFAULT NULL,
  `footer` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `ui_text` (
  `id` int NOT NULL AUTO_INCREMENT,
  `texts` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `pages_content` (
  `id` int NOT NULL AUTO_INCREMENT,
  `page_name` varchar(255) NOT NULL,
  `content` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `page_name_UNIQUE` (`page_name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `projects` (
  `id` varchar(255) NOT NULL,
  `title` json DEFAULT NULL,
  `description` json DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `imageAlt` varchar(255) DEFAULT NULL,
  `detailImageUrl` varchar(255) DEFAULT NULL,
  `display_order` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `project_activities` (
  `id` varchar(255) NOT NULL,
  `project_id` varchar(255) NOT NULL,
  `date` date DEFAULT NULL,
  `title` json DEFAULT NULL,
  `description` json DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `display_order` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `project_id_fk_idx` (`project_id`),
  CONSTRAINT `project_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `team_members` (
  `id` varchar(255) NOT NULL,
  `name` json DEFAULT NULL,
  `role` json DEFAULT NULL,
  `bio` json DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `imageAlt` varchar(255) DEFAULT NULL,
  `display_order` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `blog_posts` (
  `id` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `title` json DEFAULT NULL,
  `author` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `summary` json DEFAULT NULL,
  `content` json DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `imageAlt` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug_UNIQUE` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
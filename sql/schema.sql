-- biophiliadb.blog_posts definition

CREATE TABLE `blog_posts` (
  `id` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `title` text DEFAULT NULL,
  `author` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `imageAlt` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug_UNIQUE` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- biophiliadb.global_content definition

CREATE TABLE `global_content` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `logoUrl` varchar(255) DEFAULT NULL,
  `navigation` text DEFAULT NULL,
  `socialLinks` text DEFAULT NULL,
  `footer` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- biophiliadb.pages_content definition

CREATE TABLE `pages_content` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `page_name` varchar(255) NOT NULL,
  `content` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `page_name_UNIQUE` (`page_name`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- biophiliadb.projects definition

CREATE TABLE `projects` (
  `id` varchar(255) NOT NULL,
  `title` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `imageAlt` varchar(255) DEFAULT NULL,
  `detailImageUrl` varchar(255) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- biophiliadb.team_members definition

CREATE TABLE `team_members` (
  `id` varchar(255) NOT NULL,
  `name` text DEFAULT NULL,
  `role` text DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `imageAlt` varchar(255) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- biophiliadb.ui_text definition

CREATE TABLE `ui_text` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `texts` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- biophiliadb.users definition

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- biophiliadb.project_activities definition

CREATE TABLE `project_activities` (
  `id` varchar(255) NOT NULL,
  `project_id` varchar(255) NOT NULL,
  `date` date DEFAULT NULL,
  `title` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `project_id_fk_idx` (`project_id`),
  CONSTRAINT `project_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
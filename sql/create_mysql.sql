CREATE DATABASE IF NOT EXISTS `zhijing_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `zhijing_db`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` char(36) NOT NULL,
  `nickname` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `bio` text,
  `study_goal` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `reply_style` enum('concise','detailed','encouraging','exam_oriented') NOT NULL DEFAULT 'detailed',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_nickname` (`nickname`),
  UNIQUE KEY `uk_users_email` (`email`),
  UNIQUE KEY `uk_users_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `user_preferences` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `daily_study_minutes` int NOT NULL DEFAULT 60,
  `default_focus_minutes` int NOT NULL DEFAULT 25,
  `default_question_count` int NOT NULL DEFAULT 10,
  `default_question_difficulty` enum('easy','medium','hard','mixed') NOT NULL DEFAULT 'medium',
  `reply_style` enum('concise','detailed','encouraging','exam_oriented') NOT NULL DEFAULT 'detailed',
  `prefer_context_only` tinyint(1) NOT NULL DEFAULT 1,
  `auto_follow_up` tinyint(1) NOT NULL DEFAULT 1,
  `review_reminder_time` varchar(10) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_preferences_user_id` (`user_id`),
  CONSTRAINT `fk_user_preferences_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ai_provider_configs` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `provider_type` enum('openai_compatible','custom') NOT NULL DEFAULT 'openai_compatible',
  `provider_name` varchar(80) NOT NULL DEFAULT 'OpenAI Compatible',
  `base_url` varchar(255) NOT NULL,
  `api_key_encrypted` longtext NOT NULL,
  `api_key_mask` varchar(40) NOT NULL,
  `model_name` varchar(120) DEFAULT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `last_test_status` enum('untested','success','failed') NOT NULL DEFAULT 'untested',
  `last_test_message` varchar(255) DEFAULT NULL,
  `last_test_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ai_provider_configs_user_id` (`user_id`),
  CONSTRAINT `fk_ai_provider_configs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `learning_packs` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `title` varchar(120) NOT NULL,
  `study_goal` varchar(255) DEFAULT NULL,
  `subject_name` varchar(100) DEFAULT NULL,
  `status` enum('draft','parsing','active','archived','failed') NOT NULL DEFAULT 'draft',
  `mastery_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `last_studied_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_learning_packs_user_id` (`user_id`),
  CONSTRAINT `fk_learning_packs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `pack_materials` (
  `id` char(36) NOT NULL,
  `pack_id` char(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` bigint NOT NULL DEFAULT 0,
  `storage_url` varchar(255) DEFAULT NULL,
  `raw_text` longtext,
  `parse_status` enum('pending','processing','success','failed') NOT NULL DEFAULT 'pending',
  `parse_error_message` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pack_materials_pack_id` (`pack_id`),
  CONSTRAINT `fk_pack_materials_pack_id` FOREIGN KEY (`pack_id`) REFERENCES `learning_packs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `pack_chapters` (
  `id` char(36) NOT NULL,
  `pack_id` char(36) NOT NULL,
  `parent_id` char(36) DEFAULT NULL,
  `title` varchar(150) NOT NULL,
  `chapter_order` int NOT NULL DEFAULT 0,
  `level` int NOT NULL DEFAULT 1,
  `summary` text,
  `source_excerpt` longtext,
  `mastery_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pack_chapters_pack_id` (`pack_id`),
  CONSTRAINT `fk_pack_chapters_pack_id` FOREIGN KEY (`pack_id`) REFERENCES `learning_packs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `pack_knowledge_points` (
  `id` char(36) NOT NULL,
  `pack_id` char(36) NOT NULL,
  `chapter_id` char(36) DEFAULT NULL,
  `title` varchar(150) NOT NULL,
  `description` text,
  `tags` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pack_knowledge_points_pack_id` (`pack_id`),
  CONSTRAINT `fk_pack_knowledge_points_pack_id` FOREIGN KEY (`pack_id`) REFERENCES `learning_packs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `qa_records` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `pack_id` char(36) NOT NULL,
  `chapter_id` char(36) DEFAULT NULL,
  `question` text NOT NULL,
  `answer` longtext NOT NULL,
  `source_references` longtext,
  `is_favorite` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_qa_records_user_id` (`user_id`),
  KEY `idx_qa_records_pack_id` (`pack_id`),
  CONSTRAINT `fk_qa_records_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_qa_records_pack_id` FOREIGN KEY (`pack_id`) REFERENCES `learning_packs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `practice_questions` (
  `id` char(36) NOT NULL,
  `pack_id` char(36) NOT NULL,
  `chapter_id` char(36) DEFAULT NULL,
  `question_type` enum('single_choice','multiple_choice','judge','fill_blank','short_answer') NOT NULL,
  `difficulty` enum('easy','medium','hard','mixed') NOT NULL DEFAULT 'medium',
  `stem` longtext NOT NULL,
  `options` longtext,
  `correct_answer` longtext,
  `explanation` longtext,
  `source_excerpt` longtext,
  `knowledge_point_tags` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_practice_questions_pack_id` (`pack_id`),
  CONSTRAINT `fk_practice_questions_pack_id` FOREIGN KEY (`pack_id`) REFERENCES `learning_packs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `practice_sessions` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `pack_id` char(36) NOT NULL,
  `chapter_id` char(36) DEFAULT NULL,
  `session_type` enum('chapter','wrong_book','similar','custom') NOT NULL DEFAULT 'chapter',
  `status` enum('draft','ongoing','submitted') NOT NULL DEFAULT 'draft',
  `question_count` int NOT NULL DEFAULT 0,
  `correct_count` int NOT NULL DEFAULT 0,
  `wrong_count` int NOT NULL DEFAULT 0,
  `accuracy_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `duration_seconds` int NOT NULL DEFAULT 0,
  `submitted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_practice_sessions_user_id` (`user_id`),
  KEY `idx_practice_sessions_pack_id` (`pack_id`),
  CONSTRAINT `fk_practice_sessions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_practice_sessions_pack_id` FOREIGN KEY (`pack_id`) REFERENCES `learning_packs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `practice_answers` (
  `id` char(36) NOT NULL,
  `session_id` char(36) NOT NULL,
  `question_id` char(36) NOT NULL,
  `user_answer` longtext,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0,
  `is_marked` tinyint(1) NOT NULL DEFAULT 0,
  `ai_explanation` longtext,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_practice_answers_session_id` (`session_id`),
  KEY `idx_practice_answers_question_id` (`question_id`),
  CONSTRAINT `fk_practice_answers_session_id` FOREIGN KEY (`session_id`) REFERENCES `practice_sessions` (`id`),
  CONSTRAINT `fk_practice_answers_question_id` FOREIGN KEY (`question_id`) REFERENCES `practice_questions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `wrong_questions` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `pack_id` char(36) NOT NULL,
  `chapter_id` char(36) DEFAULT NULL,
  `question_id` char(36) NOT NULL,
  `last_session_id` char(36) DEFAULT NULL,
  `wrong_reason` varchar(255) DEFAULT NULL,
  `ai_review` longtext,
  `review_count` int NOT NULL DEFAULT 0,
  `status` enum('pending_review','reviewing','mastered') NOT NULL DEFAULT 'pending_review',
  `last_wrong_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_wrong_questions_user_id` (`user_id`),
  KEY `idx_wrong_questions_pack_id` (`pack_id`),
  KEY `idx_wrong_questions_question_id` (`question_id`),
  CONSTRAINT `fk_wrong_questions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_wrong_questions_pack_id` FOREIGN KEY (`pack_id`) REFERENCES `learning_packs` (`id`),
  CONSTRAINT `fk_wrong_questions_question_id` FOREIGN KEY (`question_id`) REFERENCES `practice_questions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `flashcards` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `pack_id` char(36) NOT NULL,
  `chapter_id` char(36) DEFAULT NULL,
  `type` enum('word','term','concept','definition','custom') NOT NULL DEFAULT 'custom',
  `front_text` text NOT NULL,
  `back_text` longtext NOT NULL,
  `mastery_level` enum('new','vague','familiar','mastered') NOT NULL DEFAULT 'new',
  `review_status` enum('due','reviewed','suspended') NOT NULL DEFAULT 'due',
  `source_excerpt` longtext,
  `next_review_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_flashcards_user_id` (`user_id`),
  KEY `idx_flashcards_pack_id` (`pack_id`),
  CONSTRAINT `fk_flashcards_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_flashcards_pack_id` FOREIGN KEY (`pack_id`) REFERENCES `learning_packs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `flashcard_reviews` (
  `id` char(36) NOT NULL,
  `flashcard_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `rating` enum('unknown','vague','remembered','mastered') NOT NULL,
  `reviewed_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_flashcard_reviews_flashcard_id` (`flashcard_id`),
  KEY `idx_flashcard_reviews_user_id` (`user_id`),
  CONSTRAINT `fk_flashcard_reviews_flashcard_id` FOREIGN KEY (`flashcard_id`) REFERENCES `flashcards` (`id`),
  CONSTRAINT `fk_flashcard_reviews_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `learning_tasks` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `title` varchar(120) NOT NULL,
  `type` enum('chapter','practice','wrong_book','flashcard','focus','custom') NOT NULL DEFAULT 'custom',
  `pack_id` char(36) DEFAULT NULL,
  `chapter_id` char(36) DEFAULT NULL,
  `target_value` int NOT NULL DEFAULT 1,
  `current_value` int NOT NULL DEFAULT 0,
  `status` enum('todo','in_progress','completed','cancelled') NOT NULL DEFAULT 'todo',
  `deadline_at` datetime DEFAULT NULL,
  `reminder_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_learning_tasks_user_id` (`user_id`),
  CONSTRAINT `fk_learning_tasks_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `focus_records` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `task_id` char(36) DEFAULT NULL,
  `pack_id` char(36) DEFAULT NULL,
  `planned_minutes` int NOT NULL DEFAULT 25,
  `actual_minutes` int NOT NULL DEFAULT 0,
  `status` enum('ongoing','completed','interrupted') NOT NULL DEFAULT 'ongoing',
  `started_at` datetime NOT NULL,
  `ended_at` datetime DEFAULT NULL,
  `note` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_focus_records_user_id` (`user_id`),
  CONSTRAINT `fk_focus_records_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `study_streaks` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `current_streak_days` int NOT NULL DEFAULT 0,
  `longest_streak_days` int NOT NULL DEFAULT 0,
  `total_study_days` int NOT NULL DEFAULT 0,
  `last_study_date` date DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_study_streaks_user_id` (`user_id`),
  CONSTRAINT `fk_study_streaks_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `community_posts` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `type` enum('help','wrong_question','review','experience','ai_verification') NOT NULL DEFAULT 'review',
  `title` varchar(150) NOT NULL,
  `content` longtext NOT NULL,
  `pack_id` char(36) DEFAULT NULL,
  `wrong_question_id` char(36) DEFAULT NULL,
  `qa_record_id` char(36) DEFAULT NULL,
  `like_count` int NOT NULL DEFAULT 0,
  `comment_count` int NOT NULL DEFAULT 0,
  `status` enum('published','hidden','deleted') NOT NULL DEFAULT 'published',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_community_posts_user_id` (`user_id`),
  CONSTRAINT `fk_community_posts_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `community_comments` (
  `id` char(36) NOT NULL,
  `post_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `parent_id` char(36) DEFAULT NULL,
  `content` longtext NOT NULL,
  `like_count` int NOT NULL DEFAULT 0,
  `status` enum('published','deleted') NOT NULL DEFAULT 'published',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_community_comments_post_id` (`post_id`),
  KEY `idx_community_comments_user_id` (`user_id`),
  CONSTRAINT `fk_community_comments_post_id` FOREIGN KEY (`post_id`) REFERENCES `community_posts` (`id`),
  CONSTRAINT `fk_community_comments_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `community_likes` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `target_type` enum('post','comment') NOT NULL,
  `target_id` char(36) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_community_likes_user_id` (`user_id`),
  KEY `idx_community_likes_target` (`target_type`,`target_id`),
  CONSTRAINT `fk_community_likes_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `target_plans` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `college_name` varchar(150) NOT NULL,
  `major_name` varchar(150) DEFAULT NULL,
  `target_year` int DEFAULT NULL,
  `target_score` decimal(5,2) DEFAULT NULL,
  `countdown_days` int DEFAULT NULL,
  `notes` text,
  `status` enum('active','archived') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_target_plans_user_id` (`user_id`),
  CONSTRAINT `fk_target_plans_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `learning_reports` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `type` enum('weekly','monthly','custom') NOT NULL DEFAULT 'weekly',
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `ai_summary` longtext,
  `report_payload` longtext,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_learning_reports_user_id` (`user_id`),
  CONSTRAINT `fk_learning_reports_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

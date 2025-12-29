ALTER TABLE `job_frames` ADD `time` real NOT NULL;--> statement-breakpoint
ALTER TABLE `job_frames` ADD `info` text;--> statement-breakpoint
ALTER TABLE `render_jobs` ADD `software` text;--> statement-breakpoint
ALTER TABLE `render_jobs` ADD `version` text;
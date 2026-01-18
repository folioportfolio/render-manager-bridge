CREATE TABLE `api_keys` (
	`api_key` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date_created` integer NOT NULL,
	`revoked` integer DEFAULT 0,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`date_created` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `render_jobs` ADD `user_id` text NOT NULL REFERENCES users(id);
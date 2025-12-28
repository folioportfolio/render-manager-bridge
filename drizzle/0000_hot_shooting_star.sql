CREATE TABLE `job_frames` (
	`id` text PRIMARY KEY NOT NULL,
	`jobId` text NOT NULL,
	`frame_number` integer NOT NULL,
	`timestamp` real NOT NULL,
	FOREIGN KEY (`jobId`) REFERENCES `render_jobs`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `render_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`frame_start` integer NOT NULL,
	`frame_step` integer NOT NULL,
	`frame_end` integer NOT NULL,
	`engine` text NOT NULL,
	`time_start` integer NOT NULL,
	`project` text NOT NULL,
	`resolution_x` integer NOT NULL,
	`resolution_y` integer NOT NULL,
	`state` text NOT NULL
);

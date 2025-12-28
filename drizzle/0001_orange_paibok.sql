CREATE TABLE `categories` (
	`categoryId` text PRIMARY KEY NOT NULL,
	`boardId` text NOT NULL,
	`title` text NOT NULL,
	`colour` text NOT NULL,
	FOREIGN KEY (`boardId`) REFERENCES `boards`(`boardId`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `boardCategoryIndex` ON `categories` (`boardId`);--> statement-breakpoint
ALTER TABLE `tasks` ADD `categoryId` text REFERENCES categories(categoryId) ON UPDATE no action ON DELETE set null;
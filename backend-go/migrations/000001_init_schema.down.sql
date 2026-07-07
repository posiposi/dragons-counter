ALTER TABLE `users_games` DROP FOREIGN KEY `FK_5709157a2bef3e8657f721c4734`;

ALTER TABLE `users_games` DROP FOREIGN KEY `FK_32e6fd6c60456d11f4fd948d4de`;

ALTER TABLE `user_registration_requests` DROP FOREIGN KEY `FK_9ec072b11958125c65afa5445ce`;

ALTER TABLE `games` DROP FOREIGN KEY `FK_d7f60119c29d181fda573c3a460`;

DROP INDEX `UQ_users_games_user_game` ON `users_games`;

DROP INDEX `IDX_97672ac88f789774dd47f7c8be` ON `users`;

DROP INDEX `IDX_ceac6207277b20dcc9048a4751` ON `stadiums`;

DROP TABLE `users_games`;

DROP TABLE `user_registration_requests`;

DROP TABLE `games`;

DROP TABLE `users`;

DROP TABLE `stadiums`;

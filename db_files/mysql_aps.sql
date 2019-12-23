-- Adminer 4.3.1 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP TABLE IF EXISTS `operations`;
CREATE TABLE `operations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `work_center_id` int(11) NOT NULL,
  `work_order_id` int(11) NOT NULL DEFAULT '0',
  `resource_id` int(11) NOT NULL,
  `task_type_id` int(11) NOT NULL,
  `operation_type` enum('project','work_order','task') NOT NULL,
  `name` varchar(250) NOT NULL,
  `description` varchar(250) NOT NULL,
  `priority` int(11) NOT NULL COMMENT '1 - High | 2 - Medium | 3 - Low ',
  `readonly` varchar(20) NOT NULL COMMENT '1 - true | 0 - false',
  `status` tinyint(4) NOT NULL COMMENT 'task status 0- open | 1 - completed',
  `start_date` varchar(200) NOT NULL,
  `end_date` varchar(200) NOT NULL,
  `duration` varchar(200) NOT NULL,
  `progress` float NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

INSERT INTO `operations` (`id`, `project_id`, `work_center_id`, `work_order_id`, `resource_id`, `task_type_id`, `operation_type`, `name`, `description`, `priority`, `readonly`, `status`, `start_date`, `end_date`, `duration`, `progress`) VALUES
(3,	1,	1,	0,	0,	2,	'project',	'Work Order : W00000002',	'Work Order : W00000002',	1,	'false',	0,	'2017-12-05 02:00',	'2017-12-05 11:00',	'9',	0.15),
(4,	1,	1,	0,	0,	3,	'project',	'Work Order : W00000003',	'Work Order : W00000003',	2,	'false',	1,	'2017-12-05 01:00',	'2017-12-05 15:00',	'14',	0.08625),
(5,	1,	1,	3,	1,	3,	'task',	'Task #2.1',	'Task #2.1',	1,	'false',	0,	'2017-12-05 02:00',	'2017-12-05 04:00',	'2',	0),
(6,	1,	1,	3,	1,	3,	'task',	'Task #2.2',	'Task #2.2',	1,	'false',	0,	'2017-12-05 04:00',	'2017-12-05 07:00',	'3',	0),
(7,	1,	1,	3,	1,	3,	'task',	'Task #2.2.1',	'Task #2.2.1',	1,	'false',	0,	'2017-12-05 07:00',	'2017-12-05 09:00',	'2',	0),
(8,	1,	1,	3,	1,	3,	'task',	'Task #2.3',	'Task #2.3',	1,	'false',	0,	'2017-12-05 09:00',	'2017-12-05 11:00',	'2',	0.213235),
(47,	1,	1,	4,	2,	1,	'task',	'Task #3.1',	'Task #3.1',	2,	'false',	0,	'2017-12-05 01:00',	'2017-12-05 04:00',	'3',	0.246667),
(10,	1,	1,	4,	2,	3,	'task',	'Task #3.2',	'Task #3.2',	2,	'false',	0,	'2017-12-05 04:00',	'2017-12-05 08:00',	'4',	0.07),
(11,	1,	1,	4,	2,	4,	'task',	'Task #3.3',	'Task #3.3',	2,	'false',	0,	'2017-12-05 08:00',	'2017-12-05 11:00',	'3',	0),
(12,	1,	1,	4,	2,	3,	'task',	'Task #3.4',	'Task #3.4',	2,	'false',	0,	'2017-12-05 11:00',	'2017-12-05 15:00',	'4',	0.025),
(18,	1,	1,	4,	4,	1,	'task',	'Task 4',	'Task 4',	2,	'false',	0,	'2017-12-04 06:00',	'2017-12-04 11:00',	'5',	0.322511),
(20,	1,	2,	0,	0,	6,	'project',	'Work Order : W00000006',	'Work Order : W00000006',	3,	'false',	0,	'2017-12-05 02:00',	'2017-12-05 13:00',	'11',	0.0745455),
(48,	1,	1,	20,	4,	3,	'task',	'Pencil ',	'Pencil ',	2,	'false',	0,	'2017-12-04 12:00',	'2017-12-04 16:00',	'4',	0),
(35,	1,	2,	20,	3,	1,	'task',	'New task 6.1',	'New task 6.1',	3,	'false',	0,	'2017-12-05 02:00',	'2017-12-05 05:00',	'3',	0.16),
(43,	1,	2,	20,	3,	3,	'task',	'New task 6.2',	'New task 6.2',	3,	'false',	1,	'2017-12-05 05:00',	'2017-12-05 09:00',	'4',	0.09),
(44,	1,	2,	20,	3,	3,	'task',	'New task 6.3',	'New task 6.3',	3,	'false',	1,	'2017-12-05 09:00',	'2017-12-05 11:00',	'2',	0.185),
(45,	1,	2,	20,	3,	1,	'task',	'New task 6.4',	'New task 6.4',	3,	'false',	0,	'2017-12-05 11:00',	'2017-12-05 13:00',	'2',	0),
(51,	1,	1,	20,	4,	1,	'task',	'New task',	'New task',	1,	'false',	0,	'2017-12-04 12:00',	'2017-12-04 15:00',	'3',	0.720833);

DROP TABLE IF EXISTS `operations_links`;
CREATE TABLE `operations_links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `source` int(11) NOT NULL,
  `target` int(11) NOT NULL,
  `connection_type` int(11) NOT NULL COMMENT '1 to connect from start to start | 0 for connect end to start',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

INSERT INTO `operations_links` (`id`, `source`, `target`, `connection_type`) VALUES
(40,	2,	18,	0),
(38,	18,	48,	0),
(37,	1,	19,	1),
(4,	3,	5,	1),
(5,	5,	6,	0),
(56,	6,	7,	0),
(10,	10,	11,	0),
(34,	11,	12,	0),
(29,	43,	44,	0),
(39,	48,	51,	0),
(15,	1,	21,	1),
(35,	4,	47,	1),
(18,	30,	32,	1),
(19,	30,	34,	1),
(27,	42,	33,	0),
(21,	1,	31,	1),
(26,	20,	35,	1),
(28,	30,	42,	0),
(30,	44,	45,	0),
(32,	35,	43,	0),
(36,	47,	10,	0),
(71,	7,	8,	0);

DROP TABLE IF EXISTS `priority`;
CREATE TABLE `priority` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `color` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

INSERT INTO `priority` (`id`, `name`, `color`) VALUES
(1,	'high',	'#d96c49'),
(2,	'medium',	'#34c461'),
(3,	'low',	'#6ba8e3');

DROP TABLE IF EXISTS `resources`;
CREATE TABLE `resources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `work_center_id` int(11) NOT NULL,
  `name` varchar(250) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

INSERT INTO `resources` (`id`, `work_center_id`, `name`) VALUES
(4,	1,	'none'),
(1,	1,	'Lathe'),
(2,	1,	'Turner'),
(3,	2,	'SAW'),
(5,	1,	'burner');

DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(400) NOT NULL COMMENT 'unique setting name',
  `value` text NOT NULL COMMENT 'any value for that setting, json/text/interger anything',
  `group` varchar(150) NOT NULL COMMENT 'grouping settings as per sections',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

INSERT INTO `system_settings` (`id`, `name`, `value`, `group`) VALUES
(1,	'default_work_center',	'all',	'system'),
(2,	'task_column_width',	'50',	'system'),
(3,	'chart_table_row_height',	'30',	'system'),
(4,	'left_panel_width',	'550',	'system'),
(5,	'left_panel_resize',	'1',	'system'),
(7,	'enable_keyboard_shortcut',	'1',	'system'),
(6,	'chart_header_scale_height',	'50',	'system'),
(8,	'default_timeline_view',	'day',	'system'),
(9,	'default_task_color_code',	'priority',	'system'),
(10,	'drag_lightbox',	'1',	'system'),
(11,	'lightbox_additional_height',	'120',	'system'),
(12,	'default_theme',	'material',	'system'),
(13,	'task_type_color_set',	'{\"1\":{\"task_color\":\"#000000\",\"progress_color\":\"#000000\"},\"2\":{\"task_color\":\"#000000\",\"progress_color\":\"#000000\"},\"3\":{\"task_color\":\"#9f55ba\",\"progress_color\":\"#9113e5\"},\"4\":{\"task_color\":\"#d75252\",\"progress_color\":\"#f60f0f\"},\"5\":{\"task_color\":\"#000000\",\"progress_color\":\"#000000\"},\"6\":{\"task_color\":\"#cbdc3b\",\"progress_color\":\"#a4c006\"}}',	'system'),
(14,	'priority_color_set',	'{\"1\":{\"task_color\":\"#e2643c\",\"progress_color\":\"#e50e1e\"},\"2\":{\"task_color\":\"#21a74a\",\"progress_color\":\"#0b7632\"},\"3\":{\"task_color\":\"#4492de\",\"progress_color\":\"#255c9b\"}}',	'system'),
(15,	'left_right_panel_font_size',	'12',	'system');

DROP VIEW IF EXISTS `tasklist`;
CREATE TABLE `tasklist` (`task_type_name` varchar(250), `resource_name` varchar(250), `id` int(11), `project_id` int(11), `work_center_id` int(11), `work_order_id` int(11), `resource_id` int(11), `task_type_id` int(11), `operation_type` enum('project','work_order','task'), `name` varchar(250), `description` varchar(250), `priority` int(11), `readonly` varchar(20), `status` tinyint(4), `start_date` varchar(200), `end_date` varchar(200), `duration` varchar(200), `progress` float, `parent` int(11), `wc_id` int(11));


DROP TABLE IF EXISTS `task_type`;
CREATE TABLE `task_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(250) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

INSERT INTO `task_type` (`id`, `Name`) VALUES
(1,	'Setup'),
(2,	'Operation'),
(3,	'Interval'),
(4,	'Overload'),
(5,	'Breakdown'),
(6,	'maintenance');

DROP TABLE IF EXISTS `work_center`;
CREATE TABLE `work_center` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(250) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

INSERT INTO `work_center` (`id`, `name`) VALUES
(1,	'Work Center 1'),
(2,	'Work Center 2'),
(3,	'Work Center 3');

DROP TABLE IF EXISTS `tasklist`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `tasklist` AS (select `tt`.`Name` AS `task_type_name`,`res`.`name` AS `resource_name`,`opr`.`id` AS `id`,`opr`.`project_id` AS `project_id`,`opr`.`work_center_id` AS `work_center_id`,`opr`.`work_order_id` AS `work_order_id`,`opr`.`resource_id` AS `resource_id`,`opr`.`task_type_id` AS `task_type_id`,`opr`.`operation_type` AS `operation_type`,`opr`.`name` AS `name`,`opr`.`description` AS `description`,`opr`.`priority` AS `priority`,`opr`.`readonly` AS `readonly`,`opr`.`status` AS `status`,`opr`.`start_date` AS `start_date`,`opr`.`end_date` AS `end_date`,`opr`.`duration` AS `duration`,`opr`.`progress` AS `progress`,`oprls`.`source` AS `parent`,`opr`.`work_center_id` AS `wc_id` from (((`operations` `opr` left join `resources` `res` on((`opr`.`resource_id` = `res`.`id`))) left join `task_type` `tt` on((`opr`.`task_type_id` = `tt`.`id`))) left join `operations_links` `oprls` on((`opr`.`id` = `oprls`.`target`))) order by `opr`.`id`);

-- 2017-12-05 13:32:38

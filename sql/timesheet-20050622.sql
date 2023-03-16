-- MySQL dump 8.23
--
-- Host: localhost    Database: timesheet
---------------------------------------------------------
-- Server version	3.23.58

--
-- Table structure for table `assignments`
--

CREATE TABLE assignments (
  proj_id int(11) NOT NULL default '0',
  username char(32) NOT NULL default '',
  PRIMARY KEY  (proj_id,username)
) TYPE=MyISAM;

--
-- Dumping data for table `assignments`
--


INSERT INTO assignments VALUES (1,'admin');
INSERT INTO assignments VALUES (1,'guest');
INSERT INTO assignments VALUES (1,'rseward');
INSERT INTO assignments VALUES (2,'rseward');
INSERT INTO assignments VALUES (3,'rseward');

--
-- Table structure for table `client`
--

CREATE TABLE client (
  client_id int(8) NOT NULL auto_increment,
  organisation varchar(64) default NULL,
  description varchar(255) default NULL,
  address1 varchar(127) default NULL,
  city varchar(60) default NULL,
  state varchar(80) default NULL,
  country char(2) default NULL,
  postal_code varchar(13) default NULL,
  contact_first_name varchar(127) default NULL,
  contact_last_name varchar(127) default NULL,
  username varchar(32) default NULL,
  contact_email varchar(127) default NULL,
  phone_number varchar(20) default NULL,
  fax_number varchar(20) default NULL,
  gsm_number varchar(20) default NULL,
  http_url varchar(127) default NULL,
  address2 varchar(127) default NULL,
  PRIMARY KEY  (client_id)
) TYPE=MyISAM;

--
-- Dumping data for table `client`
--


INSERT INTO client VALUES (1,'No Client','This is required, do not edit or delete this client record','','','','','','','','','','','','','','');
INSERT INTO client VALUES (2,'Westpole','Westpole','201 Nickels Arcade','Ann Arbor','L','','48130','Susan','Gilchrist','westpole','susan@westpole.com','734-995-6883','','','http://www.westpole.com/','');
INSERT INTO client VALUES (3,'vmdirect','VMDirect','','','L','','','Martin','Lerch','vmdirect','mlerch@vmdirect.com','','','','http://www.vmdirect.com/','');

--
-- Table structure for table `config`
--

CREATE TABLE config (
  config_set_id int(1) NOT NULL default '0',
  version varchar(32) NOT NULL default '1.2.2',
  headerhtml mediumtext NOT NULL,
  bodyhtml mediumtext NOT NULL,
  footerhtml mediumtext NOT NULL,
  errorhtml mediumtext NOT NULL,
  bannerhtml mediumtext NOT NULL,
  tablehtml mediumtext NOT NULL,
  locale varchar(127) default NULL,
  timezone varchar(127) default NULL,
  timeformat enum('12','24') NOT NULL default '12',
  weekstartday tinyint(4) NOT NULL default '0',
  useLDAP tinyint(4) NOT NULL default '0',
  LDAPScheme varchar(32) default NULL,
  LDAPHost varchar(255) default NULL,
  LDAPPort int(11) default NULL,
  LDAPBaseDN varchar(255) default NULL,
  LDAPUsernameAttribute varchar(255) default NULL,
  LDAPSearchScope enum('base','sub','one') NOT NULL default 'base',
  LDAPFilter varchar(255) default NULL,
  LDAPProtocolVersion varchar(255) default '3',
  LDAPBindUsername varchar(255) default '',
  LDAPBindPassword varchar(255) default '',
  PRIMARY KEY  (config_set_id)
) TYPE=MyISAM;

--
-- Dumping data for table `config`
--


INSERT INTO config VALUES (0,'1.2.2','<META name=\"description\" content=\"Timesheet.php Employee/Contractor Timesheets\">\r\n<link href=\"css/timesheet.css\" rel=\"stylesheet\" type=\"text/css\">','link=\"#004E8A\" vlink=\"#171A42\"','<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\r\n<tr><td style=\"background-color: #000788; padding: 3;\" class=\"bottom_bar_text\" align=\"center\">\r\n\r\nTimesheet.php website: <A href=\"http://www.advancen.com/timesheet/\"><span \r\n\r\nclass=\"bottom_bar_text\">http://www.advancen.com/timesheet/</span></A>\r\n<br><span style=\"font-size: 9px;\"><b>Page generated %time% %date% (%timezone% time)</b></span>\r\n\r\n</td></tr></table>','<TABLE border=0 cellpadding=5 width=\"100%\">\r\n<TR><TD><FONT size=\"+2\" color=\"red\">%errormsg%</FONT></TD></TR></TABLE>\r\n<P>Please go <A href=\"javascript:history.back()\">Back</A> and try again.</P>','<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr>\r\n<td colspan=\"2\" background=\"images/timesheet_background_pattern.gif\"><img src=\"images/timesheet_banner.gif\"></td></tr><tr>\r\n\r\n<td style=\"background-color: #F2F3FF; padding: 3;\">%commandmenu%</td>\r\n<td style=\"background-color: #F2F3FF; padding: 3;\" align=\"right\" width=\"145\" valign=\"top\">You are logged in as %username%</td>\r\n</tr><td colspan=\"2\" height=\"1\" style=\"background-color: #758DD6;\"><img src=\"images/spacer.gif\" width=\"1\" height=\"1\"></td></tr>\r\n</table>','','en_AU','Australia/Melbourne','12',1,0,'ldap','watson',389,'dc=watson','cn','base','','3','','');
INSERT INTO config VALUES (1,'1.2.2','<META name=\\\"description\\\" content=\\\"Timesheet.php Employee/Contractor Timesheets\\\">\r\n<link href=\\\"css/timesheet.css\\\" rel=\\\"stylesheet\\\" type=\\\"text/css\\\">','link=\\\"#004E8A\\\" vlink=\\\"#171A42\\\"','<table width=\\\"100%\\\" cellpadding=\\\"0\\\" cellspacing=\\\"0\\\" border=\\\"0\\\">\r\n<tr><td style=\\\"background-color: #000788; padding: 3;\\\" class=\\\"bottom_bar_text\\\" align=\\\"center\\\">\r\n\r\nTimesheet.php website: <A href=\\\"http://www.advancen.com/timesheet/\\\"><span \r\n\r\nclass=\\\"bottom_bar_text\\\">http://www.advancen.com/timesheet/</span></A>\r\n<br><span style=\\\"font-size: 9px;\\\"><b>Page generated %time% %date% (%timezone% time)</b></span>\r\n\r\n</td></tr></table>','<TABLE border=0 cellpadding=5 width=\\\"100%\\\">\r\n<TR><TD><FONT size=\\\"+2\\\" color=\\\"red\\\">%errormsg%</FONT></TD></TR></TABLE>\r\n<P>Please go <A href=\\\"javascript:history.back()\\\">Back</A> and try again.</P>','<table width=\\\"100%\\\" cellpadding=\\\"0\\\" cellspacing=\\\"0\\\" border=\\\"0\\\"><tr>\r\n<td colspan=\\\"2\\\" background=\\\"images/timesheet_background_pattern.gif\\\"><img src=\\\"images/timesheet_banner.gif\\\"></td></tr><tr>\r\n\r\n<td style=\\\"background-color: #F2F3FF; padding: 3;\\\">%commandmenu%</td>\r\n<td style=\\\"background-color: #F2F3FF; padding: 3;\\\" align=\\\"right\\\" width=\\\"145\\\" valign=\\\"top\\\">You are logged in as %username%</td>\r\n</tr><td colspan=\\\"2\\\" height=\\\"1\\\" style=\\\"background-color: #758DD6;\\\"><img src=\\\"images/spacer.gif\\\" width=\\\"1\\\" height=\\\"1\\\"></td></tr>\r\n</table>','','en_US','US/Detroit','12',1,0,'ldap','watson',389,'dc=watson','cn','base','','3','','');
INSERT INTO config VALUES (2,'1.2.2','<META name=\"description\" content=\"Timesheet.php Employee/Contractor Timesheets\">\r\n<link href=\"css/questra/timesheet.css\" rel=\"stylesheet\" type=\"text/css\">','link=\"#004E8A\" vlink=\"#171A42\"','</td><td width=\"2\" style=\"background-color: #9494B7;\"><img src=\"images/questra/spacer.gif\" width=\"2\" height=\"1\"></td></tr>\r\n<tr><td colspan=\"3\" style=\"background-color: #9494B7; padding: 3;\" class=\"bottom_bar_text\" align=\"center\">\r\n\r\nTimesheet.php website: <A href=\"http://www.advancen.com/timesheet/\"><span \r\n\r\nclass=\"bottom_bar_text\">http://www.advancen.com/timesheet/</span></A>\r\n<br><span style=\"font-size: 9px;\"><b>Page generated %time% %date% (%timezone% time)</b></span>\r\n\r\n</td></tr></table>','<TABLE border=0 cellpadding=5 width=\"100%\">\r\n<TR><TD><FONT size=\"+2\" color=\"red\">%errormsg%</FONT></TD></TR></TABLE>\r\n<P>Please go <A href=\"javascript:history.back()\">Back</A> and try again.</P>','<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr>\r\n  <td style=\"padding-right: 15; padding-bottom: 8;\"><img src=\"images/questra/logo.gif\"></td>\r\n  <td width=\"100%\" valign=\"bottom\">\r\n    <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\r\n      <tr><td colspan=\"3\" class=\"text_faint\" style=\"padding-bottom: 5;\" align=\"right\">You are logged in as %username%.</td></tr>\r\n      <tr>\r\n        <td background=\"images/questra/bar_left.gif\" valign=\"top\"><img src=\"images/questra/spacer.gif\" height=\"1\" width=\"8\"></td>\r\n        <td background=\"images/questra/bar_background.gif\" width=\"100%\" style=\"padding: 5;\">%commandmenu%</td>\r\n        <td background=\"images/questra/bar_right.gif\" valign=\"top\"><img src=\"images/questra/spacer.gif\" height=\"1\" width=\"8\"></td>\r\n      </tr>\r\n    </table>\r\n  </td>\r\n</tr></table>\r\n\r\n<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr>\r\n<td colspan=\"3\" height=\"8\" style=\"background-color: #9494B7;\"><img src=\"images/questra/spacer.gif\" width=\"1\" height=\"8\"></td></tr><tr>\r\n<td width=\"2\" style=\"background-color: #9494B7;\"><img src=\"images/questra/spacer.gif\" width=\"2\" height=\"1\"></td>\r\n<td width=\"100%\" bgcolor=\"#F2F2F8\">','','en_AU','Australia/Melbourne','12',1,0,'ldap','watson',389,'dc=watson','cn','base','','3','','');

--
-- Table structure for table `note`
--

CREATE TABLE note (
  note_id int(6) NOT NULL auto_increment,
  proj_id int(8) NOT NULL default '0',
  date datetime NOT NULL default '0000-00-00 00:00:00',
  subject varchar(127) NOT NULL default '',
  body text NOT NULL,
  to_contact enum('Y','N') NOT NULL default 'N',
  PRIMARY KEY  (note_id)
) TYPE=MyISAM;

--
-- Dumping data for table `note`
--



--
-- Table structure for table `project`
--

CREATE TABLE project (
  proj_id int(11) NOT NULL auto_increment,
  title varchar(200) NOT NULL default '',
  client_id int(11) NOT NULL default '0',
  description varchar(255) default NULL,
  start_date date NOT NULL default '1970-01-01',
  deadline date NOT NULL default '0000-00-00',
  http_link varchar(127) default NULL,
  proj_status enum('Pending','Started','Suspended','Complete') NOT NULL default 'Pending',
  proj_leader varchar(32) NOT NULL default '',
  PRIMARY KEY  (proj_id)
) TYPE=MyISAM;

--
-- Dumping data for table `project`
--


INSERT INTO project VALUES (1,'Default Project',1,'','0000-00-00','0000-00-00','','Started','');
INSERT INTO project VALUES (2,'Backbone',2,'Mortgage Components','2005-06-01','2005-09-30','','Started','rseward');
INSERT INTO project VALUES (3,'helloim',3,'','2005-06-01','2005-12-31','','Started','rseward');

--
-- Table structure for table `task`
--

CREATE TABLE task (
  task_id int(11) NOT NULL auto_increment,
  proj_id int(11) NOT NULL default '0',
  name varchar(127) NOT NULL default '',
  description text,
  assigned datetime NOT NULL default '0000-00-00 00:00:00',
  started datetime NOT NULL default '0000-00-00 00:00:00',
  suspended datetime NOT NULL default '0000-00-00 00:00:00',
  completed datetime NOT NULL default '0000-00-00 00:00:00',
  status enum('Pending','Assigned','Started','Suspended','Complete') NOT NULL default 'Pending',
  PRIMARY KEY  (task_id)
) TYPE=MyISAM;

--
-- Dumping data for table `task`
--


INSERT INTO task VALUES (1,1,'Default Task','','0000-00-00 00:00:00','0000-00-00 00:00:00','0000-00-00 00:00:00','0000-00-00 00:00:00','Started');
INSERT INTO task VALUES (2,2,'Default Task','','2005-06-23 09:15:00','2005-06-23 09:15:00','0000-00-00 00:00:00','0000-00-00 00:00:00','Started');
INSERT INTO task VALUES (3,1,'Development','Code development','2005-06-23 09:17:00','2005-06-23 09:17:00','0000-00-00 00:00:00','0000-00-00 00:00:00','Started');
INSERT INTO task VALUES (4,2,'Development','Code Development','2005-06-23 09:21:00','2005-06-23 09:21:00','0000-00-00 00:00:00','0000-00-00 00:00:00','Started');
INSERT INTO task VALUES (5,3,'Default Task','','2005-06-23 09:28:00','2005-06-23 09:28:00','0000-00-00 00:00:00','0000-00-00 00:00:00','Started');
INSERT INTO task VALUES (6,3,'Development','Code Development','2005-06-23 09:29:00','2005-06-23 09:29:00','0000-00-00 00:00:00','0000-00-00 00:00:00','Started');

--
-- Table structure for table `task_assignments`
--

CREATE TABLE task_assignments (
  task_id int(8) NOT NULL default '0',
  username varchar(32) NOT NULL default '',
  proj_id int(11) NOT NULL default '0',
  PRIMARY KEY  (task_id,username)
) TYPE=MyISAM;

--
-- Dumping data for table `task_assignments`
--


INSERT INTO task_assignments VALUES (1,'guest',1);
INSERT INTO task_assignments VALUES (1,'admin',1);
INSERT INTO task_assignments VALUES (2,'admin',2);
INSERT INTO task_assignments VALUES (1,'rseward',1);
INSERT INTO task_assignments VALUES (3,'rseward',1);
INSERT INTO task_assignments VALUES (4,'rseward',2);
INSERT INTO task_assignments VALUES (5,'rseward',3);
INSERT INTO task_assignments VALUES (6,'rseward',3);

--
-- Table structure for table `times`
--

CREATE TABLE times (
  uid varchar(32) NOT NULL default '',
  start_time datetime NOT NULL default '1970-01-01 00:00:00',
  end_time datetime NOT NULL default '0000-00-00 00:00:00',
  trans_num int(11) NOT NULL auto_increment,
  proj_id int(11) NOT NULL default '1',
  task_id int(11) NOT NULL default '1',
  log_message varchar(255) default NULL,
  UNIQUE KEY trans_num (trans_num),
  KEY uid (uid,trans_num)
) TYPE=MyISAM;

--
-- Dumping data for table `times`
--


INSERT INTO times VALUES ('rseward','2005-06-23 12:00:00','2005-06-23 17:00:00',1,2,4,'Prequal Engine Stub');
INSERT INTO times VALUES ('rseward','2005-06-20 10:00:00','2005-06-20 17:00:00',2,2,4,'Auth Component');
INSERT INTO times VALUES ('rseward','2005-06-21 10:00:00','2005-06-21 17:00:00',3,2,4,'Mismo Upload');
INSERT INTO times VALUES ('rseward','2005-06-22 13:00:00','2005-06-22 15:00:00',4,3,6,'Userplane conference call');

--
-- Table structure for table `user`
--

CREATE TABLE user (
  username varchar(32) NOT NULL default '',
  level int(11) NOT NULL default '0',
  password varchar(41) NOT NULL default '',
  allowed_realms varchar(20) NOT NULL default '.*',
  first_name varchar(64) NOT NULL default '',
  last_name varchar(64) NOT NULL default '',
  email_address varchar(63) NOT NULL default '',
  phone varchar(31) NOT NULL default '',
  bill_rate decimal(8,2) NOT NULL default '0.00',
  time_stamp timestamp(14) NOT NULL,
  status enum('IN','OUT') NOT NULL default 'OUT',
  uid int(11) NOT NULL auto_increment,
  PRIMARY KEY  (username),
  KEY uid (uid)
) TYPE=MyISAM;

--
-- Dumping data for table `user`
--


INSERT INTO user VALUES ('admin',10,'5882cc2b46553abe','.*','Timesheet','Admin','','',0.00,20050622191735,'OUT',1);
INSERT INTO user VALUES ('rseward',11,'5882cc2b46553abe','.*','Robert','Seward','rseward@bluestone-consulting.com','734 604 3780',0.00,00000000000000,'OUT',2);


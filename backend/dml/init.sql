INSERT INTO client (
   	client_id,
	organisation,
	description,
	address1,
	address2,
	city,
	state,
	country,
	postal_code,
	contact_first_name,
	contact_last_name,
	username,
	contact_email,
	phone_number,
	fax_number,
	gsm_number ,
	http_url
) VALUES (
   	1,
	'Bluestone',
	'Technology that stands the test of time.',
	'100 Main Street',
	Null,
	'Ann Arbor',
	'MI',
	'USA',
	48108,
	'Rob',
	'Seward',
	'rseward',
	'rseward@bluestone-consulting.com',
	'734.726.0313',
	null,
	null ,
	'http://bluestone-consulting.com'
);

INSERT INTO user (
	user_id,
	email,
	name,
	password
) VALUES (
    1,
    'rseward@bluestone-consulting.com',
    'Rob Seward',
    'thepassword'
);

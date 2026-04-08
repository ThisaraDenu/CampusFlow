-- Removes demo rows from the old V2 seed (if present). Safe when tables are empty or IDs never existed.
DELETE FROM notifications WHERE id = '55555555-5555-5555-5555-555555555501';
DELETE FROM ticket_comments WHERE id IN (
	'cccccccc-cccc-cccc-cccc-ccccccccccc1',
	'cccccccc-cccc-cccc-cccc-ccccccccccc2',
	'cccccccc-cccc-cccc-cccc-ccccccccccc3'
);
DELETE FROM tickets WHERE id = '44444444-4444-4444-4444-444444444401';
DELETE FROM bookings WHERE id IN (
	'33333333-3333-3333-3333-333333333301',
	'33333333-3333-3333-3333-333333333302'
);
DELETE FROM resources WHERE id IN (
	'22222222-2222-2222-2222-222222222201',
	'22222222-2222-2222-2222-222222222202',
	'22222222-2222-2222-2222-222222222203'
);
DELETE FROM users WHERE id IN (
	'11111111-1111-1111-1111-111111111101',
	'11111111-1111-1111-1111-111111111102',
	'11111111-1111-1111-1111-111111111103'
);

-- OPTIONAL: jalankan selepas anda sudah login sekurang-kurangnya sekali.
-- Gantikan YOUR_USER_UUID dengan UUID user dari Authentication > Users.

-- insert into public.classes(teacher_id,name,year,academic_year)
-- values
-- ('YOUR_USER_UUID','1 Crystal',1,2026),
-- ('YOUR_USER_UUID','1 Topaz',1,2026),
-- ('YOUR_USER_UUID','3 Sapphire',3,2026);

-- Contoh tambah murid selepas dapat UUID class:
-- insert into public.students(class_id,student_no,name) values
-- ('CLASS_UUID',1,'Nama Murid 1'),
-- ('CLASS_UUID',2,'Nama Murid 2');

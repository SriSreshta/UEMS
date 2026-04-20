const { Client } = require('pg');

const client = new Client({
  connectionString: 'jdbc:postgresql://ep-summer-tooth-a1f6uyx3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'.replace('jdbc:postgresql://', 'postgres://neondb_owner:npg_vE6yZfxLVN5D@')
});

async function run() {
  await client.connect();
  
  // Get all exam types
  const exams = await client.query('SELECT exam_id, title, exam_type, year, semester FROM exam;');
  console.log("EXAMS:");
  console.table(exams.rows);

  const schedules = await client.query('SELECT * FROM exam_schedule;');
  console.log("SCHEDULES:");
  console.table(schedules.rows);

  const enrollments = await client.query('SELECT * FROM enrollment WHERE grade = \'F\' OR grade = \'Ab\';');
  console.log("FAILING ENROLLMENTS:");
  console.table(enrollments.rows.slice(0, 10));

  await client.end();
}

run().catch(console.error);

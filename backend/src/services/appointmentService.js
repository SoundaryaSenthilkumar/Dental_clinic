import { pool } from '../config/database.js';

export class SlotTakenError extends Error {}
export class DuplicateRequestError extends Error {}

const PUBLIC_COLUMNS = `
  a.reference, a.status, a.treatment, a.appointment_date AS appointmentDate,
  a.time_slot AS timeSlot, d.full_name AS doctorName`;

export async function findActiveDoctor(doctorId) {
  const [rows] = await pool.execute(
    'SELECT id, full_name AS fullName FROM doctors WHERE id = ? AND is_active = 1 LIMIT 1',
    [doctorId],
  );
  return rows[0] || null;
}

export async function findByClientRequestId(clientRequestId) {
  const [rows] = await pool.execute(
    `SELECT ${PUBLIC_COLUMNS} FROM appointments a JOIN doctors d ON d.id = a.doctor_id
     WHERE a.client_request_id = ? LIMIT 1`,
    [clientRequestId],
  );
  return rows[0] || null;
}

// A single INSERT is atomic. The unique index uq_active_slot rejects a second active
// booking for the same doctor, date and slot, even under concurrent requests.
export async function insertAppointment(data) {
  try {
    const [result] = await pool.execute(
      `INSERT INTO appointments
        (reference, client_request_id, patient_name, phone, email, doctor_id,
         treatment, appointment_date, time_slot, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.reference, data.clientRequestId, data.patientName, data.phone, data.email,
        data.doctorId, data.treatment, data.appointmentDate, data.timeSlot, data.message,
      ],
    );
    return result.insertId;
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.message.includes('uq_active_slot')) throw new SlotTakenError();
      if (err.message.includes('client_request_id')) throw new DuplicateRequestError();
    }
    throw err;
  }
}

export async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT ${PUBLIC_COLUMNS} FROM appointments a JOIN doctors d ON d.id = a.doctor_id
     WHERE a.id = ? LIMIT 1`,
    [id],
  );
  return rows[0] || null;
}

export async function listAppointments({ status, date, limit, offset }) {
  const where = [];
  const params = [];
  if (status) { where.push('a.status = ?'); params.push(status); }
  if (date) { where.push('a.appointment_date = ?'); params.push(date); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT a.id, a.reference, a.status, a.patient_name AS patientName, a.phone, a.email,
            a.treatment, a.appointment_date AS appointmentDate, a.time_slot AS timeSlot,
            a.message, a.created_at AS createdAt, d.full_name AS doctorName
     FROM appointments a JOIN doctors d ON d.id = a.doctor_id
     ${clause}
     ORDER BY a.appointment_date ASC, a.time_slot ASC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  return rows;
}

export async function updateStatus(id, status) {
  try {
    const [result] = await pool.execute('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
  } catch (err) {
    // Reopening a cancelled booking can collide with a newer booking in the same slot.
    if (err.code === 'ER_DUP_ENTRY') throw new SlotTakenError();
    throw err;
  }
}

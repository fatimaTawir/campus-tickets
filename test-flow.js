require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runTests() {
  console.log('--- STARTING API TESTS ---\n');
  let testUserEmail = `testuser_${Date.now()}@usiu.ac.ke`;
  let cookie = '';
  let ticketId = '';
  let eventId = '';

  try {
    // 0. Ensure we have an event
    console.log('0. Getting/Creating a test event...');
    let eventRes = await pool.query("SELECT id FROM events LIMIT 1");
    if (eventRes.rows.length === 0) {
      eventRes = await pool.query(
        "INSERT INTO events (title, description, date, time, venue, price_type, price_amount, capacity, tickets_sold, organizer_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id",
        ['Test Event', 'Test', '2026-10-10', '10:00 AM', 'Auditorium', 'paid', 500, 100, 0, 1]
      );
    }
    eventId = eventRes.rows[0].id;
    console.log('   ✅ Event ready:', eventId);

    // 1. Signup
    console.log('\n1. Testing POST /api/auth/signup...');
    const signupRes = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: testUserEmail,
        password: 'password123',
        studentId: '123456'
      })
    });
    const signupData = await signupRes.json();
    if (signupRes.status !== 201) throw new Error('Signup failed: ' + JSON.stringify(signupData));
    console.log('   ✅ Signup successful');

    // 2. Login
    console.log('\n2. Testing POST /api/auth/login...');
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    if (loginRes.status !== 200) throw new Error('Login failed: ' + JSON.stringify(loginData));
    
    // Extract cookie
    const setCookie = loginRes.headers.get('set-cookie');
    if (!setCookie) throw new Error('No cookie received from login');
    cookie = setCookie.split(';')[0];
    console.log('   ✅ Login successful, cookie received');

    // 3. Book Ticket
    console.log('\n3. Testing POST /api/tickets...');
    const ticketRes = await fetch('http://localhost:3000/api/tickets', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      body: JSON.stringify({ eventId })
    });
    const ticketData = await ticketRes.json();
    if (ticketRes.status !== 201 && ticketRes.status !== 200) throw new Error('Ticket booking failed: ' + JSON.stringify(ticketData));
    ticketId = ticketData.ticket.id;
    console.log('   ✅ Ticket booked:', ticketId);

    // 4. M-Pesa STK Push
    console.log('\n4. Testing POST /api/mpesa/pay...');
    const mpesaRes = await fetch('http://localhost:3000/api/mpesa/pay', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      body: JSON.stringify({
        phone: '0712345678',
        amount: 500,
        ticketId,
        eventTitle: 'Test Event'
      })
    });
    const mpesaData = await mpesaRes.json();
    if (mpesaRes.status !== 200) throw new Error('M-Pesa STK push failed: ' + JSON.stringify(mpesaData));
    console.log('   ✅ STK Push initiated successfully');

    // 5. M-Pesa Callback
    console.log('\n5. Testing POST /api/mpesa/callback...');
    const callbackRes = await fetch('http://localhost:3000/api/mpesa/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Body: {
          stkCallback: {
            ResultCode: 0,
            CallbackMetadata: {
              Item: [
                { Name: 'AccountReference', Value: `CampusTickets-${ticketId}` }
              ]
            }
          }
        }
      })
    });
    const callbackData = await callbackRes.json();
    if (callbackRes.status !== 200) throw new Error('Callback failed: ' + JSON.stringify(callbackData));
    
    // Verify DB update
    const dbTicket = await pool.query('SELECT payment_status FROM tickets WHERE id = $1', [ticketId]);
    if (dbTicket.rows[0].payment_status !== 'paid') throw new Error('Ticket payment status not updated by callback');
    console.log('   ✅ Callback processed and ticket marked as paid');

    // 6. Logout
    console.log('\n6. Testing GET /api/auth/logout...');
    const logoutRes = await fetch('http://localhost:3000/api/auth/logout', {
      method: 'GET',
      headers: { 'Cookie': cookie },
      redirect: 'manual'
    });
    if (logoutRes.status !== 307 && logoutRes.status !== 302) throw new Error('Logout failed to redirect: ' + logoutRes.status);
    const logoutCookie = logoutRes.headers.get('set-cookie');
    if (!logoutCookie || !logoutCookie.includes('max-age=0') && !logoutCookie.includes('Max-Age=0')) throw new Error('Logout did not clear cookie properly');
    console.log('   ✅ Logout successful (redirected and cleared cookie)');

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY 🎉');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
  } finally {
    // Cleanup
    console.log('\nCleaning up test data...');
    if (ticketId) await pool.query("DELETE FROM tickets WHERE id = $1", [ticketId]);
    if (testUserEmail) await pool.query("DELETE FROM users WHERE email = $1", [testUserEmail]);
    await pool.end();
  }
}

runTests();

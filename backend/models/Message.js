const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true },
  message:   { type: String, required: true },
  isRead:    { type: Boolean, default: false },
}, { timestamps: true });

{tab === 'messages' && (
  <section className='card-warm' style={{ overflowX:'auto' }}>
    <h3 style={{ fontFamily:"'Cinzel', serif", marginBottom:'16px' }}>Contact Messages</h3>
    {messages.length === 0 && <p style={{ fontStyle:'italic' }}>No messages yet.</p>}
    <table className='resources-table'>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Message</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {messages.map(m => (
          <tr key={m._id}>
            <td>{m.name}</td>
            <td>{m.email}</td>
            <td>{m.message}</td>
            <td>{new Date(m.createdAt).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
)}
module.exports = mongoose.model('Message', messageSchema);
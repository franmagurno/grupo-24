const express = require('express');
const upload = require('../middlewares/upload'); // Middleware for handling file uploads
const {
  createTicket,
  getTicketsByProjectId,
  deleteTicket,
} = require('../controllers/tickets');

const router = express.Router();

// Routes for tickets
router.post('/create', upload.single('imagen'), createTicket); // Create a ticket
router.get('/:id_proyecto', getTicketsByProjectId); // Get tickets by project ID with project details
router.delete('/:id', deleteTicket); // Delete a ticket by ID

module.exports = router;

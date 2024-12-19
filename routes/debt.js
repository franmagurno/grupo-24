const express = require('express');
const router = express.Router();
const DebtController = require('../controllers/debtController');

// Ruta para obtener las deudas de un usuario
router.get('/usuario/:id_usuario', DebtController.getDeudasPorUsuario);

// Ruta para obtener las deudas de un grupo
router.get('/grupo/:id_grupo', DebtController.getDeudasPorGrupo);
router.delete('/:id_deuda', DebtController.updateDeudaStatus);
module.exports = router;

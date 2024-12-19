const Ticket = require('../db/models/tickets'); // Importar el modelo Ticket
const Debt = require('../db/models/debt'); // Importar el modelo Debt (Deuda)
const Usuario = require('../db/models/users');
const UsuariosGrupos = require('../db/models/UsuariosGrupos'); // Importar el modelo UsuarioGrupo
const notificationService = require('../services/notifications');
async function upsertDeuda({ id_ticket, deudor, acreedor, monto }) {
  try {
    // Validar si el deudor y el acreedor son la misma persona
    if (deudor === acreedor) {
      console.log(`Deuda no creada: deudor (${deudor}) y acreedor (${acreedor}) son la misma persona.`);
      return;
    }

    const deudaExistente = await Debt.findOne({
      where: { deudor, acreedor },
    });

    if (deudaExistente) {
      // Actualizar el monto sumando el nuevo monto
      deudaExistente.monto = parseFloat(deudaExistente.monto) + parseFloat(monto);
      await deudaExistente.save();
    } else {
      // Crear un nuevo registro de deuda
      await Debt.create({
        id_ticket,
        deudor,
        acreedor,
        monto,
        estado: "pendiente",
      });
    }
  } catch (error) {
    console.error(`Error al insertar o actualizar deuda: ${error.message}`);
    throw new Error("No se pudo procesar la deuda.");
  }
}

// Servicio: Crear un ticket
const createTicket = async ({
  id_proyecto,
  id_usuario,
  fecha_compra,
  monto_total,
  imagen,
  division_type,
  porcentajes,
  descripcion,
}) => {
  try {
    // Validar si los datos esenciales existen
    if (!id_proyecto || !id_usuario || !monto_total || !fecha_compra || !division_type) {
      throw new Error("Faltan datos obligatorios.");
    }

    let users = []; // Para almacenar los usuarios involucrados en el ticket

    // Crear el ticket en la base de datos primero
    const ticket = await Ticket.create({
      id_proyecto,
      id_usuario,
      fecha_compra,
      monto_total,
      imagen,
      division_type,
      porcentajes: division_type === 'porcentajes' ? porcentajes : null,
      descripcion,
    });

    if (!ticket) {
      throw new Error('No se pudo crear el ticket.');
    }

    console.log('Ticket creado:', ticket);

    // Obtener los usuarios del grupo
    users = await Usuario.findAll({
      include: {
        model: UsuariosGrupos,
        as: 'GroupMemberships',
        where: { id_grupo: id_proyecto },
      },
    });

    console.log('Usuarios encontrados:', users);
    if (users.length === 0) {
      throw new Error(`No se encontraron usuarios para el proyecto con id ${id_proyecto}`);
    }

    // Si la división es por porcentajes
    if (division_type === "porcentajes") {
      if (!Array.isArray(porcentajes) || porcentajes.length === 0) {
        throw new Error("Los porcentajes son obligatorios para la división por porcentajes.");
      }
    
      for (let i = 0; i < porcentajes.length; i++) {
        const user = users.find((u) => u.id_usuario === porcentajes[i].id_usuario);
        if (!user) {
          throw new Error(`Usuario con ID ${porcentajes[i].id_usuario} no encontrado en el proyecto.`);
        }
    
        const amountPerUser = (porcentajes[i].porcentaje / 100) * monto_total;
        await upsertDeuda({
          id_ticket: ticket.id_ticket,
          deudor: user.id_usuario,
          acreedor: id_usuario,
          monto: amountPerUser,
        });
      }
    }
    
    // Si la división es equitativa
    if (division_type === "equitativo") {
      const totalUsers = users.length;
      const amountPerUser = monto_total / totalUsers;
    
      for (const user of users) {
        await upsertDeuda({
          id_ticket: ticket.id_ticket,
          deudor: user.id_usuario,
          acreedor: id_usuario,
          monto: amountPerUser,
        });
      }
    }

    // Enviar notificación de "Nuevo Ticket Registrado" (id_tipo = 1) a todos los miembros del grupo.
    // Puedes filtrar si no quieres notificar al creador, solo omite el if.
    for (const user of users) {
      if (user.id_usuario !== id_usuario) {
        await notificationService.createNotification({
          id_usuario: user.id_usuario,
          mensaje: `Se ha creado un nuevo ticket en el proyecto ${id_proyecto}.`,
          id_tipo: 1 // Tipo de notificación: Nuevo Ticket Registrado
        });
      }
    }

    return ticket;
  } catch (error) {
    console.error('Error al crear el ticket:', error);
    throw new Error(`Error al crear el ticket: ${error.message}`);
  }
};

// Servicio: Obtener tickets por ID de proyecto
const getTicketsByProjectId = async (id_proyecto) => {
  try {
    return await Ticket.findAll({
      where: { id_proyecto },
      attributes: [
        'id_ticket',
        'id_proyecto',
        'id_usuario',
        'fecha_compra',
        'monto_total',
        'imagen',
        'division_type',
        'porcentajes',
        'descripcion',
      ], // Asegúrate de incluir los campos necesarios
    });
  } catch (error) {
    console.error('Error al obtener los tickets del proyecto:', error);
    throw new Error('Error al obtener los tickets del proyecto.');
  }
};

// Servicio: Eliminar un ticket
const deleteTicket = async (id_ticket) => {
  try {
    const deleted = await Ticket.destroy({ where: { id_ticket } });
    return deleted > 0; // Devuelve true si se eliminó, false si no
  } catch (error) {
    console.error('Error al eliminar el ticket:', error);
    throw new Error('Error al eliminar el ticket.');
  }
};

module.exports = {
  createTicket,
  getTicketsByProjectId,
  deleteTicket,
};

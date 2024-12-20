const projectService = require('../services/projects');
const UsuariosGrupos = require ('../db/models/UsuariosGrupos');
const Project = require('../db/models/projects'); // Asegúrate de que la ruta sea correcta
const User = require('../db/models/users');
const Ticket = require('../db/models/tickets');

// Controlador: Crear un nuevo proyecto
exports.createProject = async (req, res) => {
  const { nombre, descripcion, usuarios = [], id_creador } = req.body; 

  if (!nombre ||  !id_creador) {
    return res.status(400).json({ error: 'Debe proporcionar un nombre y un id_creador' });
  }

  try {
    const result = await projectService.createProject(
      nombre,
      descripcion,
      usuarios,
      id_creador
    );
    res.status(201).json(result);
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    res.status(500).json({ error: error.message || 'Error al crear proyecto.' });
  }
};

// Controlador: Obtener los proyectos asociados a un usuario
exports.getGroupsByUserId = async (req, res) => {
  const { id } = req.params;

  try {
    const grupos = await projectService.getProjectsByUserId(id);

    if (!grupos || grupos.length === 0) {
      return res.status(404).json({ message: 'No hay grupos asociados a este usuario.' });
    }

    res.status(200).json({ userId: id, groups: grupos });
  } catch (error) {
    console.error('Error al obtener grupos por usuario:', error);
    res.status(500).json({ error: 'Error al obtener grupos por usuario.' });
  }
};

// Controlador: Agregar un miembro a un proyecto
exports.addMemberToProject = async (req, res) => {
  const { id_grupo } = req.params; // Obtener id_grupo desde los parámetros de la URL
  const { correo } = req.body; // Obtener el correo del cuerpo

  if (!id_grupo || !correo) {
    return res.status(400).json({ error: 'Debe proporcionar el id del grupo y el correo del usuario.' });
  }

  try {
    const result = await projectService.addMemberToProject(id_grupo, correo); // Aquí llamas correctamente
    res.status(201).json({ message: 'Usuario agregado al grupo exitosamente.', result });
  } catch (error) {
    console.error('Error al agregar miembro al proyecto:', error);
    res.status(500).json({ error: error.message || 'Error al agregar miembro al proyecto.' });
  }
};
exports.deleteProject = async (req, res) => {
  const { id_grupo } = req.params; 

  try {
    // Elimina las relaciones entre usuarios y el grupo
    await UsuariosGrupos.destroy({ where: { id_grupo } });

    // Elimina el grupo
    const result = await Project.destroy({ where: { id_proyecto: id_grupo } });

    if (result) {
      return res.status(200).json({ message: 'Grupo eliminado exitosamente.' });
    } else {
      return res.status(404).json({ error: 'Grupo no encontrado.' });
    }
  } catch (error) {
    console.error('Error al eliminar el grupo:', error);
    return res.status(500).json({ error: 'Error al eliminar el grupo.' });
  }
};

// Obtener miembros de un grupo
exports.getMembersByGroupId = async (req, res) => {
  const { id_grupo } = req.params;

  try {
    // Obtener los miembros del grupo, incluyendo detalles asociados del usuario
    const groupMembers = await UsuariosGrupos.findAll({
      where: { id_grupo },
      include: [
        {
          model: User,
          as: 'User', 
          attributes: ['id_usuario', 'nombre', 'correo'], 
        },
      ],
    });

    
    const group = await Project.findOne({
      where: { id_proyecto: id_grupo },
      include: [
        {
          model: User,
          as: 'creator', 
          attributes: ['id_usuario', 'nombre', 'correo'], 
        },
      ],
    });

    if (!group) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    
    const members = groupMembers.map((member) => ({
      id: member.User.id_usuario,
      nombre: member.User.nombre,
      correo: member.User.correo,
      rol: member.rol || 'Miembro', 
    }));

    
    const creator = group.creator;
    const isCreatorIncluded = members.some(
      (member) => member.correo === creator.correo
    );

    
    if (!isCreatorIncluded) {
      members.push({
        id: creator.id_usuario,
        nombre: creator.nombre,
        correo: creator.correo,
        rol: 'Creador', 
      });
    }

    res.status(200).json({ members });
  } catch (error) {
    console.error('Error al obtener miembros del grupo:', error);
    res.status(500).json({ error: 'Error al obtener los miembros del grupo.' });
  }
};

exports.deleteMemberFromGroup = async (req, res) => {
  const { id_grupo, id_usuario } = req.params; 

  if (!id_grupo || !id_usuario) {
    return res.status(400).json({ error: 'Debe proporcionar el id del grupo y el id del usuario.' });
  }

  try {
    
    const result = await UsuariosGrupos.destroy({
      where: { id_grupo, id_usuario }
    });

    if (result) {
      return res.status(200).json({ message: 'Miembro eliminado correctamente del grupo.' });
    } else {
      return res.status(404).json({ error: 'Miembro no encontrado o no pertenece a este grupo.' });
    }
  } catch (error) {
    console.error('Error al eliminar miembro del grupo:', error);
    return res.status(500).json({ error: 'Error al eliminar miembro del grupo.' });
  }
};

exports.getGroupBalances = async (req, res) => {
  const groupId = req.params.groupId;

  try {
    // Obtener los tickets del grupo con la información del usuario asociado
    const tickets = await Ticket.findAll({
      where: { id_proyecto: groupId },
      include: [
        {
          model: User,
          as: 'usuario', 
          attributes: ['id_usuario', 'nombre', 'correo'], 
        },
      ],
    });

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ error: 'No se encontraron tickets para este grupo.' });
    }

    // Calcular el balance total del grupo
    const totalMonto = tickets.reduce((acc, ticket) => acc + ticket.monto_total, 0);
    const numMiembros = await User.count({ where: { grupoId: groupId } }); // Número de miembros en el grupo
    const sharePerMember = totalMonto / numMiembros; // Cuánto debería pagar cada miembro

    // Inicializar los balances por miembro
    const balances = {};

    // Procesar los tickets
    tickets.forEach((ticket) => {
      const { id_usuario, nombre, correo } = ticket.usuario;
      const montoTotal = ticket.monto_total;

      if (!balances[id_usuario]) {
        balances[id_usuario] = {
          id_usuario,
          nombre,
          correo,
          porPagar: 0,
          porCobrar: 0,
        };
      }

      // Aumentar el monto que este usuario debe cobrar (porque pagó por el ticket)
      balances[id_usuario].porCobrar += montoTotal;
    });

    // Ajustar los balances para reflejar cuánto debe pagar cada usuario
    for (const userId in balances) {
      const balance = balances[userId];

      // Cada usuario debe pagar su parte
      balance.porPagar = Math.max(0, sharePerMember - balance.porCobrar);

      // Ajustar el balance de "por cobrar"
      balance.porCobrar = Math.max(0, balance.porCobrar - sharePerMember);

      // Determinar el estado financiero
      if (balance.porCobrar > 0) {
        balance.estado = 'A Favor';
      } else if (balance.porPagar > 0) {
        balance.estado = 'Deuda';
      } else {
        balance.estado = 'Saldo';
      }
    }

    // Convertir los balances a un array para enviar la respuesta
    const balanceArray = Object.values(balances);

    res.json({ groupId, balances: balanceArray });
  } catch (error) {
    console.error('Error fetching group balances:', error);
    res.status(500).json({ error: 'Error fetching group balances.' });
  }
};
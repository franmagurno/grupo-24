const Project = require('../db/models/projects');
const UsuariosGrupos = require('../db/models/UsuariosGrupos');
const Usuario = require('../db/models/users');

// Servicio: Crear un nuevo proyecto
const Sequelize = require('sequelize');
const createProject = async (nombre, descripcion, usuarios = [], id_creador) => {
  // Verifica que el creador exista
  const creador = await Usuario.findByPk(id_creador);
  if (!creador) {
    throw new Error('El creador no existe.');
  }

  // Si el array de usuarios es vacío o no está definido, solo agrega al creador
  let usuariosCorreos = [];
  if (usuarios.length > 0) {
    // Evitar duplicar el correo del creador en la lista de usuarios
    usuariosCorreos = [...new Set([...usuarios, creador.correo])].filter(
      (correo) => correo !== creador.correo
    );
  }

  console.log('Correos totales a verificar (sin duplicados ni el creador):', usuariosCorreos);

  // Buscar los usuarios por sus correos electrónicos
  const usuariosEncontrados = await Usuario.findAll({
    where: { correo: usuariosCorreos },
  });

  console.log('Usuarios encontrados:', usuariosEncontrados.map((u) => u.correo));

  // Verifica si todos los correos fueron encontrados
  if (usuariosEncontrados.length !== usuariosCorreos.length) {
    const correosEncontrados = usuariosEncontrados.map((u) => u.correo);
    const correosNoEncontrados = usuariosCorreos.filter((correo) => !correosEncontrados.includes(correo));
    throw new Error(`Los siguientes correos no fueron encontrados: ${correosNoEncontrados.join(', ')}`);
  }

  // Crea el proyecto
  const proyecto = await Project.create({ nombre, descripcion, id_creador });
  console.log('Proyecto creado:', proyecto);

  // Crear relaciones entre usuarios y el grupo
  const relaciones = [
    // Relación del creador
    {
      id_usuario: id_creador,
      id_grupo: proyecto.id_proyecto, // Asegúrate de usar 'id_proyecto'
      rol: 'Creador',
      fecha_asignacion: new Date(),
    },
    // Relaciones para otros usuarios, si existen
    ...usuariosEncontrados.map((usuario) => ({
      id_usuario: usuario.id_usuario,
      id_grupo: proyecto.id_proyecto,
      rol: 'Miembro',
      fecha_asignacion: new Date(),
    })),
  ];

  await UsuariosGrupos.bulkCreate(relaciones);

  // Devuelve el proyecto y los usuarios agregados
  const nombresUsuarios = usuariosEncontrados.map((usuario) => usuario.nombre);
  return {
    message: `El grupo "${nombre}" fue creado exitosamente.` +
      (nombresUsuarios.length > 0
        ? ` Los usuarios ${nombresUsuarios.join(' y ')} fueron agregados al grupo.`
        : ''),
    grupo: proyecto,
  };
};



// Servicio: Obtener proyectos asociados a un usuario
// Función para obtener los proyectos asociados a un usuario
const getProjectsByUserId = async (userId) => {
  try {
    const grupos = await UsuariosGrupos.findAll({
      where: { id_usuario: userId },
      include: [
        {
          model: Project,
          as: 'AssociatedProject', // Alias definido en la asociación
          attributes: ['id_proyecto', 'nombre', 'descripcion'], // Campos correctos
        },
      ],
    });

    // Mapea el resultado para extraer los datos del proyecto
    return grupos.map((grupo) => ({
      id_grupo: grupo.id_grupo,
      rol: grupo.rol,
      fecha_asignacion: grupo.fecha_asignacion,
      proyecto: grupo.AssociatedProject, // Aquí accedes al proyecto relacionado usando el alias
    }));
  } catch (error) {
    console.error('Error al obtener proyectos por usuario:', error);
    throw new Error('Error al obtener proyectos por usuario.');
  }
};

// Servicio: Agregar un miembro a un proyecto
const addMemberToProject = async (id_grupo, correo) => {
  try {
    console.log('Correo recibido para agregar al grupo:', correo);

    // Elimina espacios y pasa el correo a minúsculas
    const trimmedCorreo = correo.trim().toLowerCase();

    const usuario = await Usuario.findOne({
      where: Sequelize.where(
        Sequelize.fn('lower', Sequelize.col('correo')),
        trimmedCorreo
      ),
    });

    if (!usuario) {
      console.error('Usuario no encontrado en la base de datos:', correo);
      throw new Error('Usuario no encontrado.');
    }

    // Asociar usuario al grupo
    const result = await UsuariosGrupos.create({
      id_grupo,
      id_usuario: usuario.id_usuario, // Asegúrate de que id_usuario es correcto
      rol: 'Miembro', // Rol predeterminado
      fecha_asignacion: new Date(), // Asigna la fecha actual
    });

    console.log('Usuario asociado al grupo:', usuario.nombre);
    return result;
  } catch (error) {
    console.error('Error al asociar usuario al grupo:', error);
    throw error;
  }
};

const getMembersByGroupId = async (groupId) => {
  try {
    // Obtener miembros del grupo con el alias correcto en la relación
    const miembros = await Project.findAll({
      where: { id_proyecto: groupId },  // 'group_id' es el campo en la tabla Project
      include: [
        {
          model: Usuario,  // Relacionamos el modelo Usuario con Project
          as: 'creator',  // El alias correcto de la relación
          attributes: ['id_usuario', 'nombre', 'correo'],  // Los campos de Usuario que quieres obtener
        },
      ],
    });

    // Retorna los miembros (usuarios) del grupo
    return miembros.map(miembro => miembro.creator);  // Asegúrate de acceder con el alias correcto
  } catch (error) {
    console.error('Error al obtener los miembros:', error);
    throw new Error('Error al obtener los miembros.');
  }
};

module.exports = {
  createProject,
  getProjectsByUserId,
  addMemberToProject,
  getMembersByGroupId, // Asegúrate de que esté aquí
};

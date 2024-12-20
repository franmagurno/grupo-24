const User = require('../db/models/users');
const bcrypt = require('bcrypt');
const { UsuariosGrupos, Proyectos, sequelize } = require('../db/models');
const generateToken = require('../generarToken');

// Servicio: Buscar usuario por email
const findUserByEmail = async (correo) => {
  return await User.findOne({ where: { correo } });
};

// Servicio: Crear un usuario
const createUser = async ({ nombre, correo, contrasena }) => {
  const hashedPassword = await bcrypt.hash(contrasena, 10); // Hashear la contraseña
  const user = await User.create({ nombre, correo, contrasena: hashedPassword, ultimo_acceso: null });

  // Generar el token usando la función centralizada
  const token = generateToken({ id_usuario: user.id_usuario, nombre: user.nombre, correo: user.correo });

  return { user, token }; // Devuelve el usuario y el token
};

// Servicio: Obtener todos los usuarios
const getAllUsers = async () => {
  return await User.findAll();
};

// Servicio: Actualizar último acceso
const updateLastAccess = async (id_usuario) => {
  const user = await User.findByPk(id_usuario);
  if (user) {
    user.ultimo_acceso = new Date();
    await user.save();
  }
};

// Servicio: Actualizar usuario
const updateUser = async (id_usuario, data) => {
  const user = await User.findByPk(id_usuario);
  if (!user) throw new Error('Usuario no encontrado.');
  return await user.update(data);
};

// Servicio: Cambiar contraseña
const changeUserPassword = async (id_usuario, contrasena_actual, nueva_contrasena) => {
  console.log('Valor de id_usuario:', id_usuario);

  const user = await User.findByPk(id_usuario);
  console.log('Resultado de findByPk:', user);

  if (!user) throw new Error('Usuario no encontrado.');

  // Comparar la contraseña ingresada con el hash almacenado
  const isMatch = await bcrypt.compare(contrasena_actual, user.contrasena);
  if (!isMatch) throw new Error('La contraseña actual es incorrecta.');

  // Hashear la nueva contraseña
  const hashedPassword = await bcrypt.hash(nueva_contrasena, 10);
  user.contrasena = hashedPassword;
  await user.save();

  console.log('Contraseña actualizada exitosamente para el usuario con ID:', id_usuario);

  

};

// Servicio: Eliminar usuario
const deleteUser = async (id_usuario) => {
  console.log('Deleting user with ID:', id_usuario);

  try {
    await sequelize.transaction(async (transaction) => {
      console.log('Deleting related data for user:', id_usuario);

      // Delete related data
      await UsuariosGrupos.destroy({ where: { id_usuario }, transaction });
      await Proyectos.destroy({ where: { id_creador: id_usuario }, transaction });

      console.log('Fetching user with ID:', id_usuario);
      const user = await User.findByPk(id_usuario, { transaction });

      console.log('Result of findByPk:', user);

      if (!user) {
        console.error(`User with ID ${id_usuario} not found.`);
        throw new Error(`Usuario con ID ${id_usuario} no encontrado.`);
      }

      console.log('User found. Proceeding with deletion:', user);
      await user.destroy({ transaction });
    });
  } catch (error) {
    console.error('Error while deleting user:', error);
    throw new Error(`Error al eliminar el usuario: ${error.message}`);
  }
};

async function getUserById(id_usuario) {
  return await User.findByPk(id_usuario);
}

const updateProfilePicture = async (id_usuario, foto_perfil) => {
  const user = await User.findByPk(id_usuario);
  if (!user) throw new Error('Usuario no encontrado.');

  // Actualizar el campo foto_perfil en el usuario
  user.foto_perfil = foto_perfil;
  await user.save();
};

module.exports = {
  findUserByEmail,
  createUser,
  getAllUsers,
  updateLastAccess,
  updateUser,
  changeUserPassword,
  deleteUser,
  updateProfilePicture,
  getUserById,
};

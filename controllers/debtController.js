const Debt = require('../db/models/debt'); // Importar el modelo de deudas
const Usuario = require('../db/models/users'); // Importar el modelo de usuarios
const UsuariosGrupos = require('../db/models/UsuariosGrupos'); // Importar UsuariosGrupos si existe
const { Op } = require('sequelize'); // Importar Op

// Obtener las deudas de un usuario
exports.getDeudasPorUsuario = async (req, res) => {
    try {
        const id_usuario = req.params.id_usuario;

        // Obtener todas las deudas donde el usuario está involucrado como deudor o acreedor
        const deudas = await Debt.findAll({
            where: {
                [Op.or]: [
                    { deudor: { [Op.in]: idsUsuarios } },
                    { acreedor: { [Op.in]: idsUsuarios } },
                ],
            },
            attributes: ["id_deuda", "deudor", "acreedor", "monto", "estado"], // Incluye id_deuda explícitamente
            include: [
                {
                    model: Usuario,
                    as: "usuarioDeudor",
                    attributes: ["id_usuario", "nombre", "correo"],
                },
                {
                    model: Usuario,
                    as: "usuarioAcreedor",
                    attributes: ["id_usuario", "nombre", "correo"],
                },
            ],
        });

        // Calcular el total de deudas (suma de todas las deudas)
        const totalDeudas = deudas.reduce((total, deuda) => {
            return total + parseFloat(deuda.monto);
        }, 0);

        // Calcular los porcentajes de deuda
        const resultado = deudas.map(deuda => {
            const porcentajeDeudor = (parseFloat(deuda.monto) / totalDeudas) * 100;
            const esDeudor = deuda.deudor === id_usuario;

            return {
                ...deuda.dataValues,
                porcentaje: esDeudor
                    ? porcentajeDeudor.toFixed(2) // Si el usuario es el deudor
                    : (100 - porcentajeDeudor).toFixed(2), // Si el usuario es el acreedor
            };
        });

        // Retornar la respuesta con los porcentajes de deuda
        return res.json(resultado);
    } catch (error) {
        return res.status(500).json({ error: 'Ocurrió un error al obtener las deudas.' });
    }
};

// Obtener las deudas de un grupo
exports.getDeudasPorGrupo = async (req, res) => {
    try {
      const id_grupo = req.params.id_grupo;
  
      // Obtener todos los usuarios del grupo
      const usuariosDelGrupo = await UsuariosGrupos.findAll({
        where: { id_grupo },
        include: [
          {
            model: Usuario,
            as: "User",
            attributes: ["id_usuario", "nombre", "correo"],
          },
        ],
      });
  
      const idsUsuarios = usuariosDelGrupo.map((u) => u.User.id_usuario);
  
      // Obtener todas las deudas entre los usuarios del grupo
      const deudas = await Debt.findAll({
        where: {
          [Op.or]: [
            { deudor: { [Op.in]: idsUsuarios } },
            { acreedor: { [Op.in]: idsUsuarios } },
          ],
        },
        attributes: ["id_deuda", "deudor", "acreedor", "monto", "estado"], // Incluye id_deuda explícitamente
        include: [
          {
            model: Usuario,
            as: "usuarioDeudor",
            attributes: ["id_usuario", "nombre", "correo"],
          },
          {
            model: Usuario,
            as: "usuarioAcreedor",
            attributes: ["id_usuario", "nombre", "correo"],
          },
        ],
      });
  
      // Agrupar las deudas por combinación única de deudor y acreedor
      const deudasAgrupadas = {};
      deudas.forEach((deuda) => {
        if (deuda.deudor === deuda.acreedor) {
          console.log(`Ignorando deuda donde deudor y acreedor son la misma persona: ${deuda.deudor}`);
          return;
        }
      
        const key = `${deuda.deudor}-${deuda.acreedor}`;
        if (!deudasAgrupadas[key]) {
          deudasAgrupadas[key] = {
            id_deuda: deuda.id_deuda, // Confirma que esto no sea undefined
            deudor: `${deuda.usuarioDeudor.nombre} (${deuda.usuarioDeudor.correo})`,
            acreedor: `${deuda.usuarioAcreedor.nombre} (${deuda.usuarioAcreedor.correo})`,
            monto: 0,
            estado: deuda.estado,
          };
        }
      
        deudasAgrupadas[key].monto += parseFloat(deuda.monto);
      });
  
      // Convertir el objeto agrupado en un array
      const resultado = Object.values(deudasAgrupadas).map((deuda) => ({
        ...deuda,
        monto: deuda.monto.toFixed(2), // Formatear el monto a dos decimales
      }));
  
      console.log("Deudas enviadas al frontend:", resultado); // Verifica si id_deuda está presente en cada objeto
      return res.json(resultado);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Ocurrió un error al obtener las deudas del grupo." });
    }
  };


  exports.updateDeudaStatus = async (req, res) => {
    const { id_deuda } = req.params;
    console.log("ID de deuda recibido en el backend:", id_deuda); // Log para confirmar el ID recibido
  
    try {
      const deuda = await Debt.findByPk(id_deuda);
      if (!deuda) {
        return res.status(404).json({ error: "Deuda no encontrada" });
      }
  
      await deuda.destroy();
  
      return res.status(200).json({ message: "Deuda pagada y eliminada con éxito" });
    } catch (error) {
      console.error("Error al actualizar el estado de la deuda:", error);
      return res.status(500).json({ error: "Error al actualizar el estado de la deuda" });
    }
  };
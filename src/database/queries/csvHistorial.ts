import { Transaction } from 'sequelize'
import {
  CSVHistorialCreationAttributes,
  CSVHistorialInstance,
  CSVHistorial
} from '..'

const createCSVHistorial = async (
  args: CSVHistorialCreationAttributes,
  transaction?: Transaction
): Promise<CSVHistorialInstance> => {
  const csvHistorial = await CSVHistorial.create(args, {
    transaction
  })

  return csvHistorial
}

export { createCSVHistorial }

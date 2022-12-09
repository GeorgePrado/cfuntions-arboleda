import { ACTIVITY_TYPES, defaultCoordsValidate, getDistanceForStandardOrders, OPERATOR_ID, ORDER_STATUSES, validateAddresses } from "../../utils"
import { Activity, Order, OrderInstance, OrderPackages, OrderService, OrderServiceHistorial, sequelizeConnection } from ".."
import { EnterprisePlatformInstance, getPolygonIDForCoordinates } from ".."
import { QueryTypes } from "sequelize"
import { createCSVHistorial } from "./csvHistorial"
import { createOriginalOrder } from "./originalOrder"

export const getOrderByTrackCode = async (
    enterpriseID: number,
    trackCode: string
): Promise<OrderInstance | null> => {
    try {
        if(!enterpriseID)
            throw new Error('enterpriseID not found and required.')
        if(!trackCode)
            throw new Error('trackCode not found and required.')
        
        const orderData = await Order.findOne({
            where: { enterpriseID, trackCode, deleted: false }
        })

        return orderData
    } catch(error: any){
        console.log(error)
        throw new Error(error.message)
    }
}

export const ordersInDangerPlaces = async (
    dataOrders: DtoOiDcAddressRequest[]
) => {
    try {
      let query = "";
      dataOrders.forEach((address, index) => {
        if (index < dataOrders.length && index !== 0) query += ` UNION ALL `;
        query +=
          ` select ` +
          `   id as "dangerPlaceID",` + 
          `   ${address.orderNumber} as "orderNumber", ` +
          `   '${address.typeAddress}' as "typeAddress", ` + 
          `   '${address.key}' as "key", ` +
          `   '${address.origin}' as "origin" ` +
          `from "DangerPlaces" dp ` +
          `where deleted = false and ` +
          `   ST_DWithin(ST_SetSRID("polygon",0) , ` + 
          `ST_GeomFromText('POINT(${address.point?.coordinates[0]} ` + 
          `${address.point?.coordinates[1]})'), 0)`;
      });
  
      const data = await sequelizeConnection.query(query, {
        type: QueryTypes.SELECT,
      });
      return data
    } catch(error: any){
        console.log(error)
        throw new Error(error.message)
    }
}

export const sendOrdersToWard = async (
    args: SendOrdersToWardArgs
): Promise<void> => {
    const tct = await sequelizeConnection.transaction()
    try {
      const { orderIDs, orderServiceIDs } = args
  
      await Promise.all([
        // * Create order service historial in WARD status
        OrderServiceHistorial.bulkCreate(
          orderServiceIDs.map(orderServiceID => ({
            orderServiceID,
            statusID: ORDER_STATUSES.WARD,
            motive: 'Legacy Todova Integration',
            deleted: false
          })),
          { transaction: tct }
        ),
        // * Update order service status to WARD
        OrderService.update(
          {
            lastStatusID: ORDER_STATUSES.WARD
          },
          { where: { id: orderServiceIDs }, transaction: tct }
        ),
        // * Update order status to WARD
        Order.update(
          {
            statusID: ORDER_STATUSES.WARD
          },
          { where: { id: orderIDs }, transaction: tct }
        )
      ])
  
      await tct.commit()
    } catch (error) {
      await tct.rollback()
      console.log(error)
      throw new Error('An error ocurred sending the order to ward')
    }
}

import { Sector } from "../"
import sequelize from "sequelize"
import { SectorInstance } from "../models"

export const getPolygonForPoint = async (
  point: Point
): Promise<SectorInstance> => {
  const {
    coordinates: [lng, lat]
  } = point
  const polygons = await Sector.findAll({
    where: sequelize.where(
      sequelize.literal(
        `ST_Within(ST_GeomFromText('POINT(${lng} ${lat})'), ST_SetSRID("polygon", 0)) = true and not "deleted"`
      ),
      null
    )
  })

  if (polygons.length === 0)
    throw new Error('Point is not contained by any polygon')

  return polygons[0]
}

export const getPolygonIDForCoordinates = async (
  trackCode: string,
  cityID: number,
  coordinates: LngLatPoint | null[]
): Promise<number> => {
  const [lng, lat] = coordinates
  const polygons = await Sector.findAll({
    attributes: ['id'],
    where: sequelize.where(
      sequelize.literal(
        `ST_Within(ST_GeomFromText('POINT(${lng} ${lat})'),` 
        + ` ST_SetSRID("polygon", 0)) = true` 
        + ` and "cityID" = ${cityID}`
        + ` and not "deleted"`
      ),
      null
    )
  })

  if (polygons.length === 0)
    throw new Error(
      `DropOff point ${trackCode} is not contained by any polygon`
    )

  return polygons[0].id
}
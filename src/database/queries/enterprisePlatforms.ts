import sequelize from "sequelize";
import { City, Country, Enterprise, EnterprisePlatforms, Service } from "..";
import { EnterprisePlatformInstance } from "..";

export const getEnterprisePlatformsByName = async (
    idPlatform: string
): Promise<EnterprisePlatformInstance> => {
    try{
        if(!idPlatform) 
            throw new Error('idPlatform not found.')
        const enterprisePlatformInstance = await EnterprisePlatforms.findOne({
            where: { idPlatform, deleted: false }
        })

        if(!enterprisePlatformInstance)
            throw new Error(`EnterprisePlatform with key ${idPlatform} was not found.`)
        
        return enterprisePlatformInstance
    } catch(error: any){
        console.log(error)
        throw new Error(error.message)
    }
}

export const getEnterprisePlatformsCompleteByName = async (
    idPlatform: string
): Promise<EnterprisePlatformInstance> => {
    try{
        if(!idPlatform) 
            throw new Error('idPlatform not found.')
        const enterprisePlatformInstance = await EnterprisePlatforms.findOne({
            where: { idPlatform, deleted: false },
            include: [
                {
                    model: Enterprise,
                    as: 'Enterprise',
                    attributes: ['enterpriseKey', 'id', 'countryID', 'cityID'],
                    include: [
                        {
                            model: Country,
                            as: 'Country',
                            attributes: ['id','name','region']
                        },
                        {
                            model: City,
                            as: 'City',
                            attributes: ['id','name','OSRMurl']
                        }
                    ]
                },
                {
                    model: Service,
                    as: 'Services',
                    on: {
                        col1: sequelize.literal(`"Services"."id" = any( "EnterprisePlatforms"."services")`),
                    },
                    attributes: ['name', 'id', 'typeID'],
                }
            ]
        })

        if(!enterprisePlatformInstance)
            throw new Error(`EnterprisePlatform with key ${idPlatform} was not found.`)
        
        return enterprisePlatformInstance
    } catch(error: any){
        console.log(error)
        throw new Error(error.message)
    }
}

export const updateEnterprisePlatform = async (
    id: number,
    objectUpdate: DtoUpdateEnterprisePlatform
): Promise<number> => {
    try {
        if(!id)
            throw new Error('id not found.')
        const update = await EnterprisePlatforms.update(
            objectUpdate,
            {
                where: { id }
            }
        )

        return update[0]
    } catch(error: any){
        console.log(error)
        throw new Error(error.message)
    }
}
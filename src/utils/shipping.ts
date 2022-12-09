import axios, { AxiosResponse } from "axios"
import { urlEstimatorEndpoint, urlQuotationRoute } from "./constants"

export const getShippingCost = async (
    args: DtoGetShippingCostBody
): Promise<DtoGetShippingCostResponseData | null> => {
    try {
        const requestConfig = {
            headers: {
            'Content-Type': 'application/json'
            },
            validateStatus: (status: number): boolean => status === 200
        }
    
        const result = await axios.post<
            DtoGetShippingCostBody,
            AxiosResponse<DtoGetShippingCostResponse>
        >(
            urlEstimatorEndpoint, 
            args, 
            requestConfig
        )
        
        const { response } = result.data
    
        return response
    } catch (error) {
        console.log('Could not get shipping cost')
        console.log(error)
        return null
    }
}

export const getQuotationRoute = async (
    args: DtoGetQuotationRouteBody
) => {
    try {
        const requestConfig = {
            headers: {
            'Content-Type': 'application/json'
            },
            validateStatus: (status: number): boolean => status === 200
        }
  
        const result = await axios.post<
            DtoGetQuotationRouteBody,
            AxiosResponse<DtoGetQuotationRouteResponse>
        >(
            urlQuotationRoute, 
            args, 
            requestConfig
        )
        const { response } = result.data
        //console.log(response)
  
        return response
    } catch (error) {
        console.log('Could not get shipping cost')
        console.log(error)
    
        return null
    }
}
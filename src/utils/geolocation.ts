import axios, { AxiosResponse } from "axios"
import { sendOrdersToWard } from "../database"
import { 
    configToken, 
    configValidateAddress, 
    defaultCoordsValidate, 
    urlGeolocationToken, 
    urlPlannerEndpoint, 
    urlValidateAddress 
} from "./constants"

const getTokenGeolocation = async () => {
    try {
        const response = await axios.post<
            string, 
            AxiosResponse<DtoGeolocationTokenResponse>
        >(
            urlGeolocationToken,
            "grant_type=client_credentials&response_type=code",
            configToken
        )
        
        const { data, status } = response
        if(status !== 200)
            throw new Error(
                `${data.error} ${data.error_description}`
            )
        
        const { access_token } = data

        return `Bearer ${access_token.replace('Bearer', '').trim()}`
    } catch (error) {
        throw error;
    }
}

export const validateAddresses = async (
    args: paramsValidateAddress
): Promise<DtoOiDcAddressRequest[]> => {
    try {
        const { values, cityID, region } = args
        const token = await getTokenGeolocation()
        const response = await axios.post<
            DtoOiDcGetCoordinatesRequest,
            AxiosResponse<
                DtoOiDcValidateAddressResponse[] 
                | DtoOiDcValidateAddressResponse
            >
        >(
            urlValidateAddress,
            {
                region,
                cityID,
                addresses: values.map(
                    itm => {
                        const zipCodeLength = 5
                        const zipCode = (itm.zipCode) 
                            ? ('0'.repeat(zipCodeLength) + itm.zipCode)
                                .slice(zipCodeLength * -1)
                            : itm.zipCode
                        return {
                            ...itm,
                            zipCode
                        }
                    }
                )
            },
            configValidateAddress(token)
        )
    
        const { data, status } = response
        if(status !== 200){
            const value = data as DtoOiDcValidateAddressResponse
            throw new Error(
                `${value.error} ${value.error_description}`
            )
        }
        if(!data)
            console.log("DATA VALUE OF ENDPOINT IS NULL OR NOT EXIST")
        
        return await Promise.all(
            (data as DtoOiDcValidateAddressResponse[]).map(
                (itm, idx) => {
                    if(!itm) 
                        return {
                            ...values[idx],

                            inCoverage: false,
                            message: `La dirección '${values[idx].address}' no se pudo ubicar`,
                            point: defaultCoordsValidate()
                        }
                    else
                        return {
                            ...values[idx],
                            inCoverage: itm.inCoverage,
                            message: itm.inCoverage ? 'success' : `La dirección '${values[idx].address}' no se encuentra en cobertura`,
                            point: defaultCoordsValidate(itm.lng, itm.lat)
                        }
                }
            )
        )
    } catch (error) {
        console.log(`Errors on Validation Address => ${error}`);
        throw new Error(`Validating Addresses ${error}`);
    }
}

export const planRouteFromOrderIDs = async (
    args: PlanRouteFromOrderIDsArgs
): Promise<void> => {
    const {
      cityID,
      immediateOffering,
      vehicleType,
      orderIDs,
      startingTime,
      orderServiceIDs
    } = args
    try {
        const token = await getTokenGeolocation()
        const body: DtoPlanSameDayRoutesBody = {
            cityID,
            immediateOffering,
            orderIDs,
            startingTime,
            vehicleType
        }
  
        console.log(`Orders was sent to planner: ${orderIDs.join(', ')}`)
  
        const {
            data: { status, message }
        } = await axios.post<
            DtoPlanSameDayRoutesBody,
            AxiosResponse<DtoPlanSameDayRoutesResponse>
        >(
            urlPlannerEndpoint, 
            body, 
            configValidateAddress(token, true)
        )
    
        if (status === 200) {
            console.log(`Orders were planned successfully: ${orderIDs.join(', ')}`)
            console.log(`Planner response: ${message}`)
        } else throw new Error(message)

        return
    } catch (error: any) {
      console.log(error)
      console.log(`Orders were not planned successfully: ${orderIDs.join(', ')}`)
      await sendOrdersToWard({
        orderIDs: orderIDs.map(orderID => parseInt(orderID)),
        orderServiceIDs
      })
  
      throw new Error('Packages could not be planned')
    }
}

export const getDistanceForStandardOrders = async ({
    pickupCoordinates,
    dropOffCoordinates,
    trackCode,
    OSRMurl
  }: GetDistanceStandardForOrdersProps): Promise<number> => {
    try {
      const [lngPick, latPick] = pickupCoordinates
      const [lngDrop, latDrop] = dropOffCoordinates
      const result = await axios.get<DtoOSRMResponse>(
        `${OSRMurl}/${lngPick},${latPick};${lngDrop},${latDrop}`
      )
      
      const {
        data: {
          routes: [{ distance }]
        }
      } = result
      
      if (distance === 0)
        throw new Error(
          `Order with OC ${trackCode} is out of coverage`
        )
  
      return distance
    } catch (error) {
        console.log(`Errors on Validation Address => ${error}`);
        throw new Error(`Validating Addresses ${error}`);
    }
  }
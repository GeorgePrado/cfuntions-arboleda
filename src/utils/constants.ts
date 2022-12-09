/**
 * Constants for geolocation
 */
export const urlGeolocationToken = process.env.OIDC_TOKEN || ''
export const urlValidateAddress = process.env.GEOLOCATION || ''
export const urlPlannerEndpoint = process.env.PLANNER || ''
export const urlEstimatorEndpoint = process.env.ESTIMATOR as string
export const urlQuotationRoute = process.env.QUOTATION_ROUTE_ENDPOINT as string
export const configToken =  {
    auth: {
        username: process.env.CC_USER || '',
        password: process.env.CC_PASS || ''
    },
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
    validateStatus: (status: number) => {
      return status < 500; // enabling custom error handling for < 500 errors
    },
}
export const configValidateAddress = (token: string, validate: boolean = false) => {
    let headers = {
        "Content-Type": "application/json",
        Authorization: token,
    }

    if(validate) 
        return { 
            headers, 
            validateStatus: (status: number): boolean => status === 200 
        }

    return { 
        headers,
        validateStatus: (status: number) => {
          return status < 500;
        },
    }
}
export const defaultCoordsValidate = (
    lng: number | null = null, 
    lat: number | null = null
): Point => {
    if(!lng) lng = -53.046548
    if(!lat) lat = 19.30265

    return {
        type: "point",
        coordinates: [lng, lat],
    }
}

export const OPERATOR_ID = '40352e78-4041-4b7d-b012-daa03a35fa6d'
export enum ORDER_STATUSES {
    NEW = 154,
    GOTO_PICK = 157,
    PICKING = 160,
    GOTO_DELIVER = 162,
    WARD = 182,
    ASSIGNED = 156,
    CANCELLED = 159,
    ARRIVED_PICK = 158,
    PLANNED = 155
}

export enum ACTIVITY_TYPES {
    PICKUP = 181,
    DROPOFF = 180
}

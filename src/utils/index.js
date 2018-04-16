export const getObjectValues = (object) => {
    return Object.values(object).filter(a => a && a.id)
}

export const toRad = (deg) => deg * Math.PI / 180

export const getBoundingBox = ({lat, lng}, meterPrecision = 0.2) => {
    const latPrecision = (1/110.574)
    const latDelta = (latPrecision * meterPrecision);
    const lngPrecision = ( 1/( 111.320 * Math.cos( toRad(lat) ) ) )
    const lngDelta = (lngPrecision * meterPrecision);
    return {
        minLat: lat - latDelta,
        maxLat: lat + latDelta,
        minLng: lng - lngDelta,
        maxLng: lng + lngDelta,
    }
}

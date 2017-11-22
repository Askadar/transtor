export const getObjectValues = (object) => {
    return Object.values(object).filter(a => a && a.id)
}

export const toRad = (deg) => deg * Math.PI / 180

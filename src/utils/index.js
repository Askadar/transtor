export const getObjectValues = (object) => {
    return Object.values(object).filter(a => a && a.id && a.name)
}
